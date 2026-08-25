import { isDev } from '../util/isDev.ts'

export const apiBaseUrl = isDev ? 'http://localhost:6173/api' : '/api'

/**
 * Public root holding the WCL-ranked sample routes. On GitHub Pages this is the repository base
 * path; local development can override it to preview either local or published ranking JSON.
 */
export const rankingsBaseUrl = (import.meta.env.VITE_RANKINGS_BASE_URL ?? '').replace(/\/$/, '')
