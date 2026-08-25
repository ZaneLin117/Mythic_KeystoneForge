import fs from 'fs'
import * as path from 'path'
import type { DungeonKey } from '../src/data/dungeonKeys.ts'
import type { SampleRoute } from '../src/util/types.ts'
import {
  dungeonPublishedPath,
  dungeonFolder,
  manifestPath,
  publicRankingsFolder,
  sampleRouteFileName,
} from './rankingsFiles.ts'
import { fetchCurrentManifest, fetchDungeonRoutes } from './rankingsSource.ts'

/**
 * Rehydrates src/data/sampleRoutes/<dungeon>/ from the published Pages JSON. queryRankings.ts skips
 * any route whose file already exists, so this is what keeps a sync run from re-fetching every
 * fight from WCL. It also stages the current immutable version under public/rankings so a normal
 * code deployment cannot accidentally erase the latest successful ranking snapshot.
 */
async function main() {
  const manifest = await fetchCurrentManifest()

  if (!manifest) {
    console.log('No published manifest yet, nothing to download')
    return
  }

  console.log(`Downloading rankings version ${manifest.version}`)

  fs.rmSync(publicRankingsFolder, { recursive: true, force: true })

  for (const [key, url] of Object.entries(manifest.dungeons)) {
    const dungeonKey = key as DungeonKey
    const routes = await fetchDungeonRoutes<SampleRoute[]>(url)

    // Mirror the published data exactly, so a route dropped upstream cannot linger locally.
    const folder = dungeonFolder(dungeonKey)
    fs.rmSync(folder, { recursive: true, force: true })
    fs.mkdirSync(folder, { recursive: true })

    for (const sampleRoute of routes) {
      fs.writeFileSync(
        path.join(folder, sampleRouteFileName(sampleRoute)),
        JSON.stringify(sampleRoute),
      )
    }

    const publishedFile = path.join(
      publicRankingsFolder,
      dungeonPublishedPath(manifest.version, dungeonKey).replace(/^rankings\//, ''),
    )
    fs.mkdirSync(path.dirname(publishedFile), { recursive: true })
    fs.writeFileSync(publishedFile, JSON.stringify(routes))

    console.log(`Downloaded ${dungeonKey} (${routes.length} routes)`)
  }

  if (manifest.previous) {
    for (const [key, url] of Object.entries(manifest.previous.dungeons)) {
      const dungeonKey = key as DungeonKey
      const routes = await fetchDungeonRoutes<SampleRoute[]>(url)
      const publishedFile = path.join(
        publicRankingsFolder,
        dungeonPublishedPath(manifest.previous.version, dungeonKey).replace(/^rankings\//, ''),
      )
      fs.mkdirSync(path.dirname(publishedFile), { recursive: true })
      fs.writeFileSync(publishedFile, JSON.stringify(routes))
    }

    console.log(`Preserved previous rankings version ${manifest.previous.version}`)
  }

  fs.mkdirSync(publicRankingsFolder, { recursive: true })
  fs.writeFileSync(
    path.join(publicRankingsFolder, path.basename(manifestPath)),
    JSON.stringify(manifest),
  )
}

await main()
