import { getWclToken } from './wclToken.ts'
import type { WclDeathEvent } from '../src/util/wclCalc.ts'
import type { WclRankingTeamMember } from '../src/util/wclRankings.ts'

interface WclJson<T> {
  error?: string
  errors?: Array<{ message: string }>
  data: T
}

const WCL_RATE_LIMIT_ERROR = /too many requests/i
const DEFAULT_RATE_LIMIT_RETRY_DELAY_MS = 5 * 60 * 1000
const DEFAULT_RATE_LIMIT_MAX_RETRIES = 13

function positiveIntegerEnv(name: string, fallback: number): number {
  const value = Number(process.env[name])
  return Number.isInteger(value) && value > 0 ? value : fallback
}

function retryAfterMs(response: Response): number | null {
  const value = response.headers.get('retry-after')
  if (!value) return null

  const seconds = Number(value)
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000)

  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? null : Math.max(0, timestamp - Date.now())
}

const sleep = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds))

export interface PagedEventsQuery<TEvent> {
  reportData: {
    report: {
      events: {
        data: TEvent[]
        nextPageTimestamp: number
      }
    }
  }
}

export interface TableQuery {
  reportData: {
    report: {
      table: {
        data: {
          entries: any[]
        }
      }
    }
  }
}

type WclEnemyNpc = {
  id: number
  gameID: number
  minimumInstanceID: number
  maximumInstanceID: number
}

type WclPull = {
  name: string
  enemyNPCs: Array<WclEnemyNpc>
  startTime: number
  endTime: number
}

export interface WclFight {
  id: number
  startTime: number
  endTime: number
  encounterID: number
  keystoneLevel: number
  dungeonPulls: WclPull[]
}

export async function fetchWcl<T>(query: string): Promise<T> {
  const retryDelayMs = positiveIntegerEnv(
    'WCL_RATE_LIMIT_RETRY_DELAY_MS',
    DEFAULT_RATE_LIMIT_RETRY_DELAY_MS,
  )
  const maxRetries = positiveIntegerEnv(
    'WCL_RATE_LIMIT_MAX_RETRIES',
    DEFAULT_RATE_LIMIT_MAX_RETRIES,
  )

  for (let retry = 0; ; retry++) {
    const token = await getWclToken()
    const response = await fetch('https://www.warcraftlogs.com/api/v2/client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    })

    const json = (await response.json()) as WclJson<T>
    const error = json.error ?? json.errors?.[0]?.message
    if (!error) return json.data

    if (!WCL_RATE_LIMIT_ERROR.test(error) || retry >= maxRetries) {
      throw new Error(error)
    }

    // WCL limits API keys by points per hour. Its error response does not always include
    // rateLimitData, so honor Retry-After when present and otherwise wait in coarse intervals
    // until the hourly budget resets. The extra second avoids retrying on the reset boundary.
    const waitMs = (retryAfterMs(response) ?? retryDelayMs) + 1000
    console.warn(
      `WCL rate limit reached; retrying in ${Math.ceil(waitMs / 1000)}s ` +
        `(attempt ${retry + 1}/${maxRetries})`,
    )
    await sleep(waitMs)
  }
}

export async function getFight(code: string, fightId: 'last' | string | number): Promise<WclFight> {
  const query = `
query {
  reportData {
    report(code:"${code}") {
      fights {
        id
        startTime
        endTime
        encounterID
        keystoneLevel
        dungeonPulls {
          name
          startTime
          endTime
          enemyNPCs {
            id
            gameID
            minimumInstanceID
            maximumInstanceID
          }
        }
      }
    }
  }
}
`

  const json = await fetchWcl<{ reportData: { report: { fights: WclFight[] } } }>(query)
  const fights = json.reportData.report.fights
  fights.reverse()
  return fights.find(
    ({ id, encounterID }) => !!encounterID && (fightId === 'last' || id === Number(fightId)),
  )!
}

export async function fetchFightTeam(
  code: string,
  fightID: number,
): Promise<WclRankingTeamMember[]> {
  type CompositionEntry = {
    name: string
    id: number
    type: string
    specs: { spec: string; role: 'tank' | 'healer' | 'dps' }[]
  }
  const data = await fetchWcl<{
    reportData: { report: { table: { data: { composition: CompositionEntry[] } } } }
  }>(`
query {
  reportData {
    report(code: "${code}") {
      table(fightIDs: [${fightID}], dataType: Summary)
    }
  }
}
`)

  return data.reportData.report.table.data.composition.map(({ id, name, type, specs }) => ({
    id,
    name,
    class: type,
    spec: specs[0]?.spec ?? '',
    role: specs[0]?.role === 'tank' ? 'Tank' : specs[0]?.role === 'healer' ? 'Healer' : 'DPS',
  }))
}

export async function getDeathEvents(code: string, fight: WclFight) {
  const query = `
query {
  reportData {
    report(code: "${code}") {
      events(fightIDs: [${fight.id}], dataType: Deaths, hostilityType: Enemies) {
        data
      }
    }
  }
}`

  const json = await fetchWcl<{ reportData: { report: { events: { data: WclDeathEvent[] } } } }>(
    query,
  )
  return json.reportData.report.events.data
}
