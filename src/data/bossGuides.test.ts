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

  it('maps the first two Conspirator Path encounters to the correct bosses', () => {
    expect(getBossGuide('murd', 234648)?.encounter).toBe('1号')
    expect(getBossGuide('murd', 234660)?.encounter).toBe('1号')
    expect(getBossGuide('murd', 234647)?.encounter).toBe('2号')
  })

  it('maps the last three Vale encounters to the correct bosses', () => {
    expect(getBossGuide('vale', 244887)?.encounter).toBe('2号')
    expect(getBossGuide('vale', 245912)?.encounter).toBe('3号')
    expect(getBossGuide('vale', 247676)?.encounter).toBe('尾王')
  })
})
