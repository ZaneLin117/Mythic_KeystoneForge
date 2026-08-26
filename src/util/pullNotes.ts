import type { Dungeon } from '../data/types.ts'
import type { Note, Pull } from './types.ts'

/**
 * MDT notes are positioned on the map rather than explicitly linked to a pull. Group each note
 * with the pull containing the nearest enemy so route guidance can also be read in pull order.
 */
export function groupNotesByNearestPull(pulls: Pull[], notes: Note[], dungeon: Dungeon): Note[][] {
  const notesByPull = pulls.map(() => [] as Note[])
  if (!pulls.length) return notesByPull

  for (const note of notes) {
    if (!note.text.trim()) continue

    let nearestPullIndex = -1
    let nearestDistanceSquared = Number.POSITIVE_INFINITY

    for (let pullIndex = 0; pullIndex < pulls.length; pullIndex++) {
      const pull = pulls[pullIndex]!

      for (const spawnId of pull.spawns) {
        const spawn = dungeon.mobSpawns[spawnId]?.spawn
        if (!spawn) continue

        const yDistance = note.position[0] - spawn.pos[0]
        const xDistance = note.position[1] - spawn.pos[1]
        const distanceSquared = yDistance * yDistance + xDistance * xDistance

        if (distanceSquared < nearestDistanceSquared) {
          nearestDistanceSquared = distanceSquared
          nearestPullIndex = pullIndex
        }
      }
    }

    if (nearestPullIndex !== -1) notesByPull[nearestPullIndex]!.push(note)
  }

  return notesByPull
}
