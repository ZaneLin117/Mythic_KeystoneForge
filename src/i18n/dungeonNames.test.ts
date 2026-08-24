import { describe, expect, it } from 'vitest'
import { localizedDungeonNames } from './dungeonNames.ts'

const dungeon = { key: 'murd' as const, name: 'Murder Row' }

describe('localizedDungeonNames', () => {
  it('uses the stakeholder-provided Chinese name and compact label', () => {
    expect(localizedDungeonNames(dungeon, 'zh-CN')).toEqual({
      full: '密谋小径',
      short: '密谋',
    })
  })

  it('keeps the upstream name and key in English', () => {
    expect(localizedDungeonNames(dungeon, 'en-US')).toEqual({
      full: 'Murder Row',
      short: 'MURD',
    })
  })
})
