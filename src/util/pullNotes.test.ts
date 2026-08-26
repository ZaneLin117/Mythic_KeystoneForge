import { describe, expect, test } from 'vitest'
import type { Dungeon } from '../data/types.ts'
import type { Note, Pull } from './types.ts'
import { groupNotesByNearestPull } from './pullNotes.ts'

const dungeon = {
  mobSpawns: {
    first: { spawn: { pos: [10, 10] } },
    second: { spawn: { pos: [90, 90] } },
  },
} as unknown as Dungeon

const pulls: Pull[] = [
  { id: 1, spawns: ['first'] },
  { id: 2, spawns: ['second'] },
]

const note = (text: string, position: [number, number]): Note => ({ text, position })

describe('groupNotesByNearestPull', () => {
  test('groups positioned MDT notes with the nearest pull and keeps note order', () => {
    const notes = [
      note('第一波说明', [12, 8]),
      note('第二波说明一', [86, 91]),
      note('第二波说明二', [92, 94]),
    ]

    expect(groupNotesByNearestPull(pulls, notes, dungeon)).toEqual([
      [notes[0]],
      [notes[1], notes[2]],
    ])
  })

  test('does not render empty notes or attach notes when no enemy can be located', () => {
    const notes = [note('   ', [10, 10]), note('找不到对应波次', [20, 20])]
    const pullsWithoutKnownSpawns: Pull[] = [{ id: 1, spawns: ['missing'] }]

    expect(groupNotesByNearestPull(pullsWithoutKnownSpawns, notes, dungeon)).toEqual([[]])
  })
})
