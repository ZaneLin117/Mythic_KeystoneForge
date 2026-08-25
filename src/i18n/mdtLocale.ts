import zhCN from '../data/mdtLocales/zhCN.json'
import zhCNSpells from '../data/spellLocales/zhCN.json'
import type { Mob } from '../data/types.ts'
import type { Spell } from '../data/types.ts'
import type { Locale } from './i18n.tsx'

const zhCNTranslations: Record<string, string> = zhCN
type SpellLocaleEntry = {
  name: string
  description?: string | null
}

const zhCNSpellTranslations: Record<string, SpellLocaleEntry> = zhCNSpells

export function localizeMdtText(text: string, locale: Locale) {
  return locale === 'zh-CN' ? zhCNTranslations[text] ?? text : text
}

export function localizedMobName(mob: Mob, locale: Locale) {
  return localizeMdtText(mob.name, locale)
}

export function localizedSpellName(spell: Pick<Spell, 'id' | 'name'>, locale: Locale) {
  if (locale !== 'zh-CN') return spell.name
  return zhCNSpellTranslations[String(spell.id)]?.name ?? localizeMdtText(spell.name, locale)
}

export function localizedSpellDescription(spellId: number, locale: Locale) {
  if (locale !== 'zh-CN') return null
  return zhCNSpellTranslations[String(spellId)]?.description ?? null
}
