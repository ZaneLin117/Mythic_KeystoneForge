import { createContext } from 'react'
import type { Locale, TranslationKey } from './i18n.tsx'

export interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  t: (key: TranslationKey, values?: Record<string, string | number>) => string
}

export const I18nContext = createContext<I18nContextValue | null>(null)
