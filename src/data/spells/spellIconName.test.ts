import { describe, expect, it } from 'vitest'
import { normalizeSpellIconName } from './spellIconName.ts'

describe('normalizeSpellIconName', () => {
  it('removes an existing extension and fixes spaces used as CDN separators', () => {
    expect(normalizeSpellIconName('spell_frost_ring-of frost.jpg')).toBe(
      'spell_frost_ring-of-frost',
    )
  })
})
