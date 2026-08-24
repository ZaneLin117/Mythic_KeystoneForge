import type { DungeonKey } from '../data/dungeonKeys.ts'
import type { Locale } from './i18n.tsx'

interface DungeonNames {
  full: string
  short: string
}

const chineseDungeonNames: Record<DungeonKey, DungeonNames> = {
  murd: { full: '密谋小径', short: '密谋' },
  nalo: { full: '纳洛拉克的洞穴', short: '纳洛' },
  vale: { full: '夺目谷', short: '夺目' },
  void: { full: '虚空之痕竞技场', short: '虚痕' },
  fang: { full: '毒牙祭坛', short: '毒牙' },
  rlp: { full: '红玉新生法池', short: '红玉' },
  tos: { full: '塞塔里斯神庙', short: '塞塔' },
  kr: { full: '诸王之眠', short: '诸王' },
}

export function localizedDungeonNames(
  dungeon: { key: DungeonKey; name: string; displayKey?: string },
  locale: Locale,
): DungeonNames {
  if (locale === 'zh-CN') {
    return chineseDungeonNames[dungeon.key]
  }

  return {
    full: dungeon.name,
    short: (dungeon.displayKey ?? dungeon.key).toUpperCase(),
  }
}
