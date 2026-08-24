import { isMac } from '../util/dev.ts'
import { translateCurrent } from '../i18n/i18n.tsx'

export interface Tip {
  id: string
  tip: string
}

export const pageVisitsKey = 'tips:pageVists'
export const tipsSeenKey = 'tips:tipsSeen'
export const neverShowTipsKey = 'tips:neverShowTips'

export function getTipsSeen() {
  const tipsSeenItem = localStorage.getItem(tipsSeenKey)
  const tipsSeen = tipsSeenItem ? (JSON.parse(tipsSeenItem) as string[]) : []
  return Array.isArray(tipsSeen) ? tipsSeen : []
}

export function neverShowTips() {
  localStorage.setItem(neverShowTipsKey, 'true')
}

export const tips: Tip[] = [
  { id: 'shift-drag', tip: translateCurrent('tip.shiftDrag') },
  {
    id: 'select-individual-mobs',
    tip: translateCurrent('tip.individual', { modifier: isMac ? 'Cmd' : 'Ctrl' }),
  },
  {
    id: 'shift-mob-new-pull',
    tip: translateCurrent('tip.newPull'),
  },
  { id: 'help-button', tip: translateCurrent('tip.help') },
  {
    id: 'note-howto',
    tip: translateCurrent('tip.note'),
  },
  { id: 'discord', tip: translateCurrent('tip.importExport') },
  { id: 'shift-forces-percent', tip: translateCurrent('tip.forces') },
  { id: 'ctrl-mob-count', tip: translateCurrent('tip.mobCount') },
  { id: 'alt-mob-group', tip: translateCurrent('tip.mobGroup') },
  { id: 'k-mob-group', tip: translateCurrent('tip.kicks') },
]
