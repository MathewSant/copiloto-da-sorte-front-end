import type { Match } from '@/lib/copilot-types'

export const MY_ROUND_STORAGE_KEY = 'copilot-my-round-v1'

export function loadMyRoundIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(MY_ROUND_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function saveMyRoundIds(ids: string[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(MY_ROUND_STORAGE_KEY, JSON.stringify(ids))
}

export function toggleMyRoundId(ids: string[], matchId: string): string[] {
  return ids.includes(matchId) ? ids.filter((id) => id !== matchId) : [matchId, ...ids]
}

export function sortMatchesByMyRound(matches: Match[], myRoundIds: string[]): Match[] {
  const order = new Map(myRoundIds.map((id, index) => [id, index]))
  return [...matches].sort((left, right) => {
    const leftIndex = order.get(left.id)
    const rightIndex = order.get(right.id)
    if (leftIndex !== undefined && rightIndex !== undefined) return leftIndex - rightIndex
    if (leftIndex !== undefined) return -1
    if (rightIndex !== undefined) return 1
    return 0
  })
}

export function buildMyRoundMatches(matches: Match[], myRoundIds: string[]): Match[] {
  const byId = new Map(matches.map((match) => [match.id, match]))
  return myRoundIds.map((id) => byId.get(id)).filter((match): match is Match => Boolean(match))
}
