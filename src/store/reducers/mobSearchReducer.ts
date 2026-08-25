import type { PayloadAction } from '@reduxjs/toolkit'
import type { Mob } from '../../data/types.ts'
import type { Locale } from '../../i18n/i18n.tsx'
import { localizedMobName } from '../../i18n/mdtLocale.ts'
import { createAppSlice } from '../storeUtil.ts'

export interface MobSearchState {
  open: boolean
  term: string
}

const initialState: MobSearchState = {
  open: false,
  term: '',
}

export const mobSearchSlice = createAppSlice({
  name: 'mobSearch',
  initialState,
  reducers: {
    openMobSearch(state) {
      state.open = true
    },
    clearMobSearch(state) {
      state.open = false
      state.term = ''
    },
    setMobSearchTerm(state, { payload: term }: PayloadAction<string>) {
      state.term = term
    },
  },
  selectors: {
    selectMobSearchOpen: (state) => state.open,
    selectMobSearchTerm: (state) => state.term,
    // Returns a primitive, so no memoization is needed
    selectMobSearchTermNormalized: (state) => state.term.trim().toLowerCase(),
  },
})

/** `term` must already be normalized via selectMobSearchTermNormalized */
export const mobMatchesSearch = (mob: Mob, term: string, locale: Locale = 'en-US') =>
  !!term &&
  (mob.name.toLowerCase().includes(term) ||
    localizedMobName(mob, locale).toLowerCase().includes(term))

export const mobSearchReducer = mobSearchSlice.reducer

export const { openMobSearch, clearMobSearch, setMobSearchTerm } = mobSearchSlice.actions

export const { selectMobSearchOpen, selectMobSearchTerm, selectMobSearchTermNormalized } =
  mobSearchSlice.selectors
