import { describe, expect, it } from 'vitest'
import { translate } from './i18n.tsx'

describe('translate', () => {
  it('defaults product copy to the Chinese dictionary', () => {
    expect(translate('zh-CN', 'brand.name')).toBe('秘境路线工坊')
  })

  it('supports English and interpolated values', () => {
    expect(translate('en-US', 'route.rank', { rank: 12 })).toBe('Rank 12')
  })
})
