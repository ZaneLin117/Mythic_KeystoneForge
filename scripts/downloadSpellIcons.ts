import fs from 'node:fs/promises'
import path from 'node:path'
import { dungeonKeys } from '../src/data/dungeonKeys.ts'
import { mergeSpells } from '../src/data/spells/grimoire.ts'
import { tankSpecs } from '../src/util/wclRankings.ts'
import { normalizeSpellIconName } from '../src/data/spells/spellIconName.ts'

const outputFolder = path.resolve('public/spell_icons')
const remoteBaseUrl = 'https://wow.zamimg.com/images/wow/icons/large'
const concurrency = 12

const iconNames = new Set<string>([
  'ability_argus_soulburst',
  'ability_eyeoftheowl',
  'inv_enchant_voidsphere',
  'inv_cooking_10_heartystew',
  ...tankSpecs.map(({ icon }) => icon),
])

for (const dungeonKey of dungeonKeys) {
  for (const spells of Object.values(mergeSpells(dungeonKey))) {
    for (const spell of spells) iconNames.add(normalizeSpellIconName(spell.icon))
  }
}

const icons = [...iconNames].sort()
await fs.mkdir(outputFolder, { recursive: true })

async function downloadIcon(icon: string): Promise<void> {
  const target = path.join(outputFolder, `${icon}.jpg`)
  try {
    const stat = await fs.stat(target)
    if (stat.size > 0) return
  } catch {
    // File is not present yet.
  }

  const url = `${remoteBaseUrl}/${encodeURIComponent(icon)}.jpg`
  const response = await fetch(url, { headers: { 'User-Agent': 'Mythic-KeystoneForge/1.0' } })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`)

  const bytes = Buffer.from(await response.arrayBuffer())
  if (bytes.length === 0) throw new Error(`Empty response: ${url}`)
  await fs.writeFile(target, bytes)
}

const failures: string[] = []
let cursor = 0

async function worker() {
  for (;;) {
    const index = cursor++
    if (index >= icons.length) return

    const icon = icons[index]!
    try {
      await downloadIcon(icon)
    } catch (error) {
      failures.push(`${icon}: ${(error as Error).message}`)
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()))

if (failures.length > 0) {
  throw new Error(`Failed to download ${failures.length} spell icon(s):\n${failures.join('\n')}`)
}

console.log(`Verified ${icons.length} local spell icons in ${outputFolder}`)
