import type { Match } from '@/lib/copilot-types'

type SourceTone = 'live' | 'real' | 'premium' | 'fallback'

export interface SourceMeta {
  label: string
  tone: SourceTone
}

export function getMatchSourceMeta(match: Pick<Match, 'source' | 'status' | 'coverage'>): SourceMeta {
  if (match.source === 'betsapi_live') {
    return { label: 'Live BetsAPI', tone: 'live' }
  }

  if (match.source === 'betsapi_upcoming') {
    return { label: 'Próximo real', tone: 'real' }
  }

  if (match.source === 'premium_seed') {
    return { label: 'Vitrine curada', tone: 'premium' }
  }

  if (match.coverage === 'premium') {
    return { label: 'Cobertura profunda', tone: 'premium' }
  }

  return { label: 'Fallback local', tone: 'fallback' }
}

export function getSourceToneClasses(tone: SourceTone): string {
  switch (tone) {
    case 'live':
      return 'bg-live/10 text-live border border-live/30'
    case 'real':
      return 'bg-chart-2/15 text-chart-2 border border-chart-2/30'
    case 'premium':
      return 'bg-primary/15 text-primary border border-primary/30'
    default:
      return 'bg-secondary text-muted-foreground border border-border'
  }
}
