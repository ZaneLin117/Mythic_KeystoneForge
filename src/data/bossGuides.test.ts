import { describe, expect, it } from 'vitest'
import { dungeonKeys } from './dungeonKeys.ts'
import { mdtDungeons } from './mdtDungeons.ts'
import { bossGuides, getBossGuide } from './bossGuides.ts'

describe('boss guides', () => {
  it('covers every boss NPC in every supported dungeon', () => {
    const missingGuides = dungeonKeys.flatMap((dungeonKey) =>
      mdtDungeons[dungeonKey].enemies
        .filter((mob) => mob.isBoss && !getBossGuide(dungeonKey, mob.id))
        .map((mob) => `${dungeonKey}:${mob.id}:${mob.name}`),
    )

    expect(missingGuides).toEqual([])
  })

  it('only maps boss NPCs', () => {
    const nonBossGuides = dungeonKeys.flatMap((dungeonKey) => {
      const bossIds = new Set(
        mdtDungeons[dungeonKey].enemies.filter((mob) => mob.isBoss).map((mob) => mob.id),
      )

      return Object.keys(bossGuides[dungeonKey] ?? {})
        .map(Number)
        .filter((mobId) => !bossIds.has(mobId))
        .map((mobId) => `${dungeonKey}:${mobId}`)
    })

    expect(nonBossGuides).toEqual([])
  })

  it('maps all 37 boss NPCs across 28 encounters', () => {
    const mappedGuides = dungeonKeys.flatMap((dungeonKey) =>
      Object.values(bossGuides[dungeonKey] ?? {}),
    )

    expect(mappedGuides).toHaveLength(37)
    expect(new Set(mappedGuides)).toHaveLength(28)
  })
})
