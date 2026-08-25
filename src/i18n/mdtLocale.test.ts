import { describe, expect, it } from 'vitest'
import { localizeMdtText, localizedSpellDescription, localizedSpellName } from './mdtLocale.ts'

describe('localizeMdtText', () => {
  it('uses the Simplified Chinese strings shipped by MDT', () => {
    expect(localizeMdtText('Ascendant Serpent', 'zh-CN')).toBe('晋升之蛇')
    expect(localizeMdtText('Humanoid', 'zh-CN')).toBe('人型')
  })

  it('keeps English and unknown strings unchanged', () => {
    expect(localizeMdtText('Ascendant Serpent', 'en-US')).toBe('Ascendant Serpent')
    expect(localizeMdtText('Unknown MDT text', 'zh-CN')).toBe('Unknown MDT text')
  })

  it('uses the locally maintained spell name table', () => {
    const spell = { id: 1222795, name: 'Envenom' }
    expect(localizedSpellName(spell, 'zh-CN')).toBe('毒伤')
    expect(localizedSpellName(spell, 'en-US')).toBe('Envenom')
    expect(localizedSpellDescription(spell.id, 'zh-CN')).toContain('断心药膏')
    expect(localizedSpellDescription(spell.id, 'en-US')).toBeNull()
  })
})
