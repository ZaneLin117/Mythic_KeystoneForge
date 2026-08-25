import type { DungeonSpells } from './dungeonSpells.ts'
import { publicAssetUrl } from '../../util/publicAssetUrl.ts'
import { normalizeSpellIconName } from './spellIconName.ts'

export const dungeonSpells = import.meta.compileTime<DungeonSpells>('./dungeonSpells.ts')

export function getIconLink(icon: string) {
  const iconName = normalizeSpellIconName(icon)
  return publicAssetUrl(`spell_icons/${encodeURIComponent(iconName)}.jpg`)
}
