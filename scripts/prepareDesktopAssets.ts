import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dungeonKeys = ['murd', 'nalo', 'vale', 'void', 'fang', 'rlp', 'tos', 'kr'] as const
const repositoryRoot = fileURLToPath(new URL('../', import.meta.url))
const desktopDist = path.join(repositoryRoot, 'dist-desktop')

async function pruneMaps() {
  const mapsDirectory = path.join(desktopDist, 'maps')
  const entries = await fs.readdir(mapsDirectory, { withFileTypes: true })
  const currentDungeons = new Set<string>(dungeonKeys)

  await Promise.all(
    entries
      .filter((entry) => entry.isDirectory() && !currentDungeons.has(entry.name))
      .map((entry) =>
        fs.rm(path.join(mapsDirectory, entry.name), { recursive: true, force: true }),
      ),
  )
}

async function currentNpcIds() {
  const ids = new Set<string>()

  for (const dungeonKey of dungeonKeys) {
    const dataPath = path.join(
      repositoryRoot,
      'src',
      'data',
      'mdtDungeons',
      `${dungeonKey}_mdt.json`,
    )
    const data = JSON.parse(await fs.readFile(dataPath, 'utf8')) as {
      enemies: Array<{ id: number }>
    }

    for (const enemy of data.enemies) {
      ids.add(String(enemy.id))
    }
  }

  return ids
}

async function pruneNpcPortraits() {
  const portraitsDirectory = path.join(desktopDist, 'npc_portraits')
  const requiredIds = await currentNpcIds()
  const entries = await fs.readdir(portraitsDirectory, { withFileTypes: true })

  await Promise.all(
    entries
      .filter(
        (entry) =>
          entry.isFile() &&
          path.extname(entry.name).toLowerCase() === '.png' &&
          entry.name !== 'unknown.png' &&
          !requiredIds.has(path.basename(entry.name, '.png')),
      )
      .map((entry) => fs.rm(path.join(portraitsDirectory, entry.name), { force: true })),
  )
}

async function directoryStats(directory: string) {
  let files = 0
  let bytes = 0

  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      const nested = await directoryStats(entryPath)
      files += nested.files
      bytes += nested.bytes
    } else if (entry.isFile()) {
      files += 1
      bytes += (await fs.stat(entryPath)).size
    }
  }

  return { files, bytes }
}

await pruneMaps()
await pruneNpcPortraits()

const stats = await directoryStats(desktopDist)
console.log(
  `Desktop assets prepared: ${stats.files} files, ${(stats.bytes / 1024 / 1024).toFixed(2)} MiB`,
)
