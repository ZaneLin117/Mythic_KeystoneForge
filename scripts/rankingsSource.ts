import DotenvFlow from 'dotenv-flow'
import { isProd } from '../src/util/isDev.ts'
import { manifestPath, type RankingsManifest } from './rankingsFiles.ts'

if (!isProd) {
  DotenvFlow.config()
}

/**
 * Public origin containing the generated rankings directory. GitHub Actions points this at the
 * current Pages deployment so a new build can preserve the last successful ranking snapshot.
 */
export const rankingsBaseUrl = (
  process.env.RANKINGS_BASE_URL ??
  process.env.VITE_RANKINGS_BASE_URL ??
  ''
).replace(/\/$/, '')

export function resolveRankingsUrl(urlOrPath: string): string {
  if (/^https?:\/\//i.test(urlOrPath)) {
    return urlOrPath
  }

  if (!rankingsBaseUrl) {
    throw new Error(
      'RANKINGS_BASE_URL is not set (point it at the current GitHub Pages deployment)',
    )
  }

  const base = `${rankingsBaseUrl}/`
  return new URL(urlOrPath.replace(/^\//, ''), base).toString()
}

export async function fetchCurrentManifest(): Promise<RankingsManifest | null> {
  if (!rankingsBaseUrl) {
    throw new Error(
      'RANKINGS_BASE_URL is not set (point it at the current GitHub Pages deployment)',
    )
  }

  const res = await fetch(resolveRankingsUrl(manifestPath), { cache: 'no-store' })
  if (res.status === 404) {
    return null
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch rankings manifest: ${res.status} ${res.statusText}`)
  }

  return (await res.json()) as RankingsManifest
}

export async function fetchDungeonRoutes<T>(urlOrPath: string): Promise<T> {
  const url = resolveRankingsUrl(urlOrPath)
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)
  }

  return (await res.json()) as T
}
