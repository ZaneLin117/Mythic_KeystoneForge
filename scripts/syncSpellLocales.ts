import * as fs from 'fs'
import * as path from 'path'
import { getDirname } from '../server/files.ts'

const dirname = getDirname(import.meta.url)
const dungeonDir = path.resolve(`${dirname}/../src/data/mdtDungeons`)
const outputPath = path.resolve(`${dirname}/../src/data/spellLocales/zhCN.json`)
const refresh = process.argv.includes('--refresh')
const concurrency = 12

type DungeonFile = {
  enemies: Array<{
    spells: Array<{ id: number }>
  }>
}

type WowheadTooltip = {
  name?: string
  tooltip?: string
}

type SpellLocaleEntry = {
  name: string
  description?: string | null
}

function currentSpellIds() {
  const ids = new Set<number>()
  const files = fs.readdirSync(dungeonDir).filter((file) => file.endsWith('_mdt.json'))

  for (const file of files) {
    const dungeon = JSON.parse(fs.readFileSync(path.join(dungeonDir, file), 'utf8')) as DungeonFile
    for (const enemy of dungeon.enemies) {
      for (const spell of enemy.spells) ids.add(spell.id)
    }
  }

  return [...ids].sort((a, b) => a - b)
}

function existingTranslations() {
  if (!fs.existsSync(outputPath)) return {} as Record<string, SpellLocaleEntry>

  const stored = JSON.parse(fs.readFileSync(outputPath, 'utf8')) as Record<
    string,
    string | SpellLocaleEntry
  >
  return Object.fromEntries(
    Object.entries(stored).map(([id, entry]) => [
      id,
      typeof entry === 'string' ? { name: entry } : entry,
    ]),
  )
}

async function fetchWithTimeout(url: string) {
  return fetch(url, {
    headers: { 'User-Agent': 'Mythic-KeystoneForge spell locale sync' },
    signal: AbortSignal.timeout(15_000),
  })
}

async function fetchWowheadName(spellId: number) {
  const response = await fetchWithTimeout(
    `https://nether.wowhead.com/tooltip/spell/${spellId}?dataEnv=1&locale=4`,
  )
  if (!response.ok) return null

  const tooltip = (await response.json()) as WowheadTooltip
  const name = tooltip.name?.trim()
  if (!name) return null

  return {
    name,
    description: extractWowheadDescription(tooltip.tooltip ?? ''),
  } satisfies SpellLocaleEntry
}

function decodeHtml(text: string) {
  return text
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
}

function htmlToText(html: string) {
  return decodeHtml(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replaceAll('\u200b', ''),
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function extractWowheadDescription(tooltip: string) {
  const descriptions = [...tooltip.matchAll(/<div class="q">([\s\S]*?)<\/div>/g)]
    .map((match) => htmlToText(match[1] ?? ''))
    .filter(Boolean)

  return descriptions.length ? descriptions.join('\n\n') : null
}

async function fetchDamijingName(spellId: number) {
  const response = await fetchWithTimeout(`https://db.damijing.com/spell/${spellId}`)
  if (!response.ok) return null

  const html = await response.text()
  const match = html.match(/<title>(.*?)技能-魔兽世界/)
  if (!match?.[1]) return null

  const name = decodeHtml(match[1].trim())
  const detailMatch = html.match(/<p[^>]*class="spell-detail-content"[^>]*>([\s\S]*?)<\/p>/)
  let description = detailMatch?.[1] ? htmlToText(detailMatch[1]) : ''
  if (description.startsWith(name)) description = description.slice(name.length).trim()
  description = description
    .replace(/^(?:无限|\d+(?:\.\d+)?)\s*码范围\s*/, '')
    .replace(/^(?:瞬发|(?:瞄准\s*)?\(?\d+(?:\.\d+)?秒\s*施法时间\)?)\s*/, '')
    .trim()

  return { name, description: description || null } satisfies SpellLocaleEntry
}

async function fetchLocalizedName(spellId: number) {
  let wowheadEntry: SpellLocaleEntry | null = null
  try {
    wowheadEntry = await fetchWowheadName(spellId)
    if (wowheadEntry?.description) return wowheadEntry
  } catch (error) {
    console.warn(`Wowhead lookup failed for spell ${spellId}: ${String(error)}`)
  }

  try {
    const damijingEntry = await fetchDamijingName(spellId)
    if (!damijingEntry) return wowheadEntry
    return {
      name: wowheadEntry?.name ?? damijingEntry.name,
      description: wowheadEntry?.description ?? damijingEntry.description,
    }
  } catch (error) {
    console.warn(`damijing.com lookup failed for spell ${spellId}: ${String(error)}`)
    return wowheadEntry
  }
}

const spellIds = currentSpellIds()
const translations = existingTranslations()
const pendingIds = refresh
  ? spellIds
  : spellIds.filter((spellId) => translations[String(spellId)]?.description === undefined)

console.log(
  `Spell locale sync: ${spellIds.length} current IDs, ${pendingIds.length} lookups required.`,
)

let cursor = 0
let completed = 0
const failures: number[] = []

async function worker() {
  while (cursor < pendingIds.length) {
    const spellId = pendingIds[cursor++]!
    const name = await fetchLocalizedName(spellId)
    if (name) translations[String(spellId)] = name
    else failures.push(spellId)

    completed += 1
    if (completed % 50 === 0 || completed === pendingIds.length) {
      console.log(`Fetched ${completed}/${pendingIds.length} spell names.`)
    }
  }
}

await Promise.all(Array.from({ length: Math.min(concurrency, pendingIds.length) }, () => worker()))

const sortedTranslations = Object.fromEntries(
  Object.entries(translations).sort(([idA], [idB]) => Number(idA) - Number(idB)),
)

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, `${JSON.stringify(sortedTranslations, null, 2)}\n`)

console.log(`Wrote ${Object.keys(sortedTranslations).length} translations to ${outputPath}.`)
if (failures.length) {
  console.warn(`No Chinese name found for ${failures.length} spells: ${failures.join(', ')}`)
}
