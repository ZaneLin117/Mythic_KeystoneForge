import crypto from 'crypto'
import fs from 'fs'
import * as path from 'path'
import { type DungeonKey, dungeonKeys } from '../src/data/dungeonKeys.ts'
import type { SampleRoute } from '../src/util/types.ts'
import {
  dungeonPublishedPath,
  manifestPath,
  publicRankingsFolder,
  type RankingsManifest,
  readDungeonRoutes,
} from './rankingsFiles.ts'

const force = process.argv.includes('--force')
const allowEmpty = process.argv.includes('--allow-empty')

/**
 * queryRankings.ts deletes stale files before re-adding, so a partial WCL failure leaves a hole
 * rather than an error. Refuse to publish a set that shrank more than this.
 */
const minRetainRatio = 0.75

const payloads = new Map<DungeonKey, string>()
const counts = new Map<DungeonKey, number>()
for (const dungeonKey of dungeonKeys) {
  const routes = readDungeonRoutes(dungeonKey)
  if (!routes.length) {
    console.warn(`No local routes for ${dungeonKey}, skipping`)
    continue
  }

  payloads.set(dungeonKey, JSON.stringify(routes))
  counts.set(dungeonKey, routes.length)
}

if (!payloads.size) {
  if (allowEmpty) {
    console.log('No published rankings yet; building Pages without ranked routes')
    process.exit(0)
  }

  throw new Error('No local rankings found. Run `yarn rankings:download` or `yarn r` first.')
}

const localManifestFile = path.join(publicRankingsFolder, path.basename(manifestPath))
const previousManifest: RankingsManifest | null = fs.existsSync(localManifestFile)
  ? (JSON.parse(fs.readFileSync(localManifestFile, 'utf8')) as RankingsManifest)
  : null

if (previousManifest && !force) {
  const shrunk: string[] = []

  for (const key of Object.keys(previousManifest.dungeons)) {
    const dungeonKey = key as DungeonKey
    const previousFile = path.join(
      publicRankingsFolder,
      dungeonPublishedPath(previousManifest.version, dungeonKey).replace(/^rankings\//, ''),
    )
    if (!fs.existsSync(previousFile)) {
      continue
    }

    const publishedRoutes = JSON.parse(fs.readFileSync(previousFile, 'utf8')) as SampleRoute[]
    const published = publishedRoutes.length
    const current = counts.get(dungeonKey) ?? 0

    if (published && current < published * minRetainRatio) {
      shrunk.push(`${dungeonKey}: ${published} published -> ${current} local`)
    }
  }

  if (shrunk.length) {
    throw new Error(
      `Refusing to publish, route counts dropped sharply (likely a partial WCL failure):\n` +
        `${shrunk.join('\n')}\n` +
        `Re-run the sync, or pass --force if this is intentional.`,
    )
  }
}

const hash = crypto.createHash('sha256')
for (const dungeonKey of dungeonKeys) {
  const payload = payloads.get(dungeonKey)
  if (payload === undefined) {
    continue
  }

  hash.update(`${dungeonKey}:`)
  hash.update(payload)
}
const version = hash.digest('hex').slice(0, 8)

if (previousManifest?.version === version) {
  console.log(`Rankings unchanged (version ${version}); preserving the published Pages snapshot`)
  process.exit(0)
}

const dungeons: RankingsManifest['dungeons'] = {}
for (const [dungeonKey, payload] of payloads) {
  const publishedPath = dungeonPublishedPath(version, dungeonKey)
  const outputFile = path.join(publicRankingsFolder, publishedPath.replace(/^rankings\//, ''))
  fs.mkdirSync(path.dirname(outputFile), { recursive: true })
  fs.writeFileSync(outputFile, payload)

  dungeons[dungeonKey] = publishedPath
  console.log(`Staged ${dungeonKey} (${counts.get(dungeonKey)} routes)`)
}

// Written last: until this flips, a complete Pages artifact still resolves the previous version.
const manifest: RankingsManifest = {
  version,
  dungeons,
  previous: previousManifest
    ? { version: previousManifest.version, dungeons: previousManifest.dungeons }
    : undefined,
}
fs.mkdirSync(publicRankingsFolder, { recursive: true })
fs.writeFileSync(localManifestFile, JSON.stringify(manifest))

console.log(`Staged rankings version ${version} for GitHub Pages`)

// Keep the previous version around for clients that already resolved it.
const keepVersions = new Set([version])
if (previousManifest) {
  keepVersions.add(previousManifest.version)
}

let pruned = 0
for (const entry of fs.readdirSync(publicRankingsFolder, { withFileTypes: true })) {
  if (entry.isDirectory() && !keepVersions.has(entry.name)) {
    fs.rmSync(path.join(publicRankingsFolder, entry.name), { recursive: true, force: true })
    pruned += 1
  }
}

if (pruned) {
  console.log(`Pruned ${pruned} stale ranking version(s)`)
}
