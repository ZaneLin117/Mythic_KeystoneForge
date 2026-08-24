import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { I18nContext, type I18nContextValue } from './I18nContext.ts'
import { getStoredLocale, translate, type Locale } from './i18n.tsx'

const localeStorageKey = 'mythic-route-studio:locale'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(getStoredLocale)

  useEffect(() => {
    window.localStorage.setItem(localeStorageKey, locale)
    document.documentElement.lang = locale
    document.title = translate(locale, 'brand.name')
  }, [locale])

  const toggleLocale = useCallback(() => {
    setLocale((current) => (current === 'zh-CN' ? 'en-US' : 'zh-CN'))
  }, [])

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t: (key, values) => translate(locale, key, values),
    }),
    [locale, toggleLocale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
