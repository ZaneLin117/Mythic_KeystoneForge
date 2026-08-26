import { describe, expect, test } from 'vitest'

import { base64ToBytes, bytesToBase64, deflateRaw, inflateRaw } from './binary.ts'
import { decodeCbor, encodeCbor } from './cbor.ts'
import { decodeMdtString, encodeMdtString, mdtImportLimits } from './mdt2.ts'
import { pullsOnly, withDrawings } from './__fixtures__/mdtStrings.ts'
import { sampleRouteDefinitions } from '../../data/sampleRoutes/sampleRoutesUncompiled.ts'
import { dungeonsByKey } from '../../data/dungeons.ts'
import type { DungeonKey } from '../../data/dungeonKeys.ts'

const fixtures = { pullsOnly, withDrawings }

const rawCbor = (str: string) => inflateRaw(base64ToBytes(str.slice('!~MDT2~'.length)))
const encodeRawMdt = async (value: unknown) =>
  '!~MDT2~' + bytesToBase64(await deflateRaw(encodeCbor(value)))

const seasonFixtures = Object.entries(sampleRouteDefinitions).flatMap(([dungeonKey, definitions]) =>
  definitions.map((definition) => ({
    dungeonKey: dungeonKey as DungeonKey,
    routeName: definition.name ?? 'unnamed',
    mdtString: definition.mdt,
  })),
)

test('every dungeon includes one network route credited to 北风', () => {
  for (const definitions of Object.values(sampleRouteDefinitions)) {
    expect(definitions.filter((definition) => definition.author === '北风')).toHaveLength(1)
  }
})

describe.each(Object.entries(fixtures))('%s', (_name, mdtString) => {
  test('decodes to a route', async () => {
    const route = await decodeMdtString(mdtString)

    expect(route.value.currentDungeonIdx).toBe(162)
    expect(route.value.pulls.length).toBeGreaterThan(0)
    expect(typeof route.text).toBe('string')
  })

  /**
   * The strongest guarantee available without running WoW. Byte length matching proves we pick the
   * same integer and float widths Blizzard does for every value; the tree comparison proves nothing
   * is lost. The bytes themselves differ only in map key order, which CBOR does not consider
   * significant — Lua emits keys in pairs() order while JS sorts integer-like keys.
   */
  test('re-encodes to equivalent CBOR', async () => {
    const original = await rawCbor(mdtString)
    const reEncoded = encodeCbor(decodeCbor(original))

    expect(reEncoded.length).toBe(original.length)
    expect(decodeCbor(reEncoded)).toEqual(decodeCbor(original))
  })

  test('survives a full string round trip', async () => {
    const route = await decodeMdtString(mdtString)

    expect(await decodeMdtString(await encodeMdtString(route))).toEqual(route)
  })
})

test('parses notes and drawings', async () => {
  const route = await decodeMdtString(withDrawings)
  const objects = route.objects as Record<string, unknown>[]

  const note = objects.find((object) => 'n' in object)!
  expect(note.d).toEqual([439.34228643187413, -383.65720449140133, 1, true, 'THIS IS A NOTE'])

  const drawing = objects.find((object) => 'l' in object)!
  expect((drawing.l as string[])[0]).toBe('495.4')
})

test('rejects a pre-6.2 string with an actionable message', async () => {
  await expect(decodeMdtString('!fw1YUrkmqWpMCpI2gm4JRuUKlOvIC2ANHXKqcbwXJ84Y')).rejects.toThrow(
    /旧版 MythicDungeonTools/,
  )
})

test.each([
  ['base64', '!~MDT2~not valid!'],
  ['deflate', '!~MDT2~AAAA'],
] as const)('reports the %s decoding stage', async (stage, mdtString) => {
  await expect(decodeMdtString(mdtString)).rejects.toMatchObject({ stage })
})

test('rejects invalid CBOR separately from compression errors', async () => {
  const mdtString = '!~MDT2~' + bytesToBase64(await deflateRaw(new Uint8Array([0xff])))

  await expect(decodeMdtString(mdtString)).rejects.toMatchObject({ stage: 'cbor' })
})

test('rejects a decoded value that is not a route', async () => {
  await expect(
    encodeRawMdt({ text: 'broken', value: { pulls: [] } }).then(decodeMdtString),
  ).rejects.toMatchObject({ stage: 'structure' })
})

test('rejects oversized encoded and decompressed inputs', async () => {
  await expect(
    decodeMdtString('!~MDT2~' + 'A'.repeat(mdtImportLimits.encodedCharacters + 1)),
  ).rejects.toMatchObject({ stage: 'base64' })

  const compressed = await deflateRaw(new Uint8Array(mdtImportLimits.decompressedBytes + 1))
  await expect(decodeMdtString('!~MDT2~' + bytesToBase64(compressed))).rejects.toMatchObject({
    stage: 'deflate',
  })
})

test('rejects CBOR nested beyond the decoder limit', async () => {
  let value: unknown = 0
  for (let depth = 0; depth < 66; depth++) value = [value]

  await expect(encodeRawMdt(value).then(decodeMdtString)).rejects.toMatchObject({ stage: 'cbor' })
})

describe.each(seasonFixtures)(
  '$dungeonKey $routeName embedded route',
  ({ dungeonKey, mdtString }) => {
    test('matches the current dungeon and survives a full string round trip', async () => {
      const route = await decodeMdtString(mdtString)

      expect(route.value.currentDungeonIdx).toBe(dungeonsByKey[dungeonKey].mdt.dungeonIndex)
      expect(route.value.pulls.length).toBeGreaterThan(0)
      expect(await decodeMdtString(await encodeMdtString(route))).toEqual(route)
    })

    test('only references enemy clones present in the current dungeon data', async () => {
      const route = await decodeMdtString(mdtString)
      const dungeon = dungeonsByKey[dungeonKey]
      const knownClones = new Set(
        dungeon.mdt.enemies.flatMap((enemy) =>
          enemy.spawns.map((spawn) => `${enemy.enemyIndex}-${spawn.idx}`),
        ),
      )
      const referencedClones = route.value.pulls.flatMap((pull) =>
        Object.entries(pull).flatMap(([enemyIndex, cloneIndexes]) =>
          Array.isArray(cloneIndexes)
            ? cloneIndexes.map((cloneIndex) => `${enemyIndex}-${cloneIndex}`)
            : [],
        ),
      )

      expect(referencedClones.filter((clone) => !knownClones.has(clone))).toEqual([])
    })
  },
)
