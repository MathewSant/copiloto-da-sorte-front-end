import type {
  AssistantAnswerPayload,
  BootstrapPayload,
  MatchDetailPayload,
  PredictionAuditReport,
} from '@/lib/copilot-types'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1'
const REQUEST_TIMEOUT_MS = 35000
const BOOTSTRAP_CACHE_KEY = 'copilot.cache.bootstrap.v1'
const DETAIL_CACHE_KEY_PREFIX = 'copilot.cache.detail.v1:'
const BOOTSTRAP_CACHE_MAX_AGE_MS = 120000
const DETAIL_CACHE_MAX_AGE_MS = 90000

interface CacheEnvelope<T> {
  savedAt: number
  data: T
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

function readCache<T>(key: string, maxAgeMs: number): T | null {
  if (!canUseStorage()) return null
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CacheEnvelope<T>
    if (!parsed || typeof parsed !== 'object' || typeof parsed.savedAt !== 'number') {
      return null
    }
    if (Date.now() - parsed.savedAt > maxAgeMs) return null
    return parsed.data
  } catch {
    return null
  }
}

function writeCache<T>(key: string, data: T): void {
  if (!canUseStorage()) return
  try {
    const payload: CacheEnvelope<T> = {
      savedAt: Date.now(),
      data,
    }
    window.localStorage.setItem(key, JSON.stringify(payload))
  } catch {
    // no-op
  }
}

export function getCachedBootstrap(maxAgeMs = BOOTSTRAP_CACHE_MAX_AGE_MS): BootstrapPayload | null {
  return readCache<BootstrapPayload>(BOOTSTRAP_CACHE_KEY, maxAgeMs)
}

export function getCachedMatchDetail(
  matchId: string,
  maxAgeMs = DETAIL_CACHE_MAX_AGE_MS,
): MatchDetailPayload | null {
  if (!matchId) return null
  return readCache<MatchDetailPayload>(`${DETAIL_CACHE_KEY_PREFIX}${matchId}`, maxAgeMs)
}

async function fetchWithTimeout(input: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    })
  } finally {
    window.clearTimeout(timeoutId)
  }
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetchWithTimeout(`${API_BASE}${path}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetchWithTimeout(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export async function getBootstrap(): Promise<BootstrapPayload | null> {
  try {
    const payload = await fetchJson<BootstrapPayload>('/bootstrap')
    writeCache(BOOTSTRAP_CACHE_KEY, payload)
    if (payload.selectedMatchDetail?.match?.id) {
      writeCache(`${DETAIL_CACHE_KEY_PREFIX}${payload.selectedMatchDetail.match.id}`, payload.selectedMatchDetail)
    }
    return payload
  } catch {
    return null
  }
}

export async function getMatchDetail(matchId: string): Promise<MatchDetailPayload | null> {
  try {
    const payload = await fetchJson<MatchDetailPayload>(`/matches/${matchId}`)
    writeCache(`${DETAIL_CACHE_KEY_PREFIX}${matchId}`, payload)
    return payload
  } catch {
    return null
  }
}

export async function getMatchDetailByEventId(eventId: string): Promise<MatchDetailPayload | null> {
  try {
    const payload = await fetchJson<MatchDetailPayload>(`/matches/by-event/${eventId}`)
    if (payload.match?.id) {
      writeCache(`${DETAIL_CACHE_KEY_PREFIX}${payload.match.id}`, payload)
    }
    return payload
  } catch {
    return null
  }
}

export async function getMatchDetailByContext(params: {
  homeTeam: string
  awayTeam: string
  league?: string
  externalId?: string
  status?: 'live' | 'upcoming'
}): Promise<MatchDetailPayload | null> {
  try {
    const query = new URLSearchParams()
    query.set('homeTeam', params.homeTeam)
    query.set('awayTeam', params.awayTeam)
    if (params.league) query.set('league', params.league)
    if (params.externalId) query.set('externalId', params.externalId)
    if (params.status) query.set('status', params.status)
    const payload = await fetchJson<MatchDetailPayload>(`/matches/by-context?${query.toString()}`)
    if (payload.match?.id) {
      writeCache(`${DETAIL_CACHE_KEY_PREFIX}${payload.match.id}`, payload)
    }
    return payload
  } catch {
    return null
  }
}

export async function askAssistant(params: {
  question: string
  matchId?: string | null
  pinnedMatchIds?: string[]
  scope?: 'selected_match' | 'my_round'
}): Promise<AssistantAnswerPayload | null> {
  try {
    return await postJson<AssistantAnswerPayload>('/assistant/answer', {
      question: params.question,
      matchId: params.matchId ?? null,
      pinnedMatchIds: params.pinnedMatchIds ?? [],
      scope: params.scope ?? 'selected_match',
    })
  } catch {
    return null
  }
}

export async function getPredictionAudit(): Promise<PredictionAuditReport | null> {
  try {
    return await fetchJson<PredictionAuditReport>('/admin/prediction-audit')
  } catch {
    return null
  }
}
