'use client'

import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Star } from 'lucide-react'
import type { Match } from '@/lib/copilot-types'
import { getMatchSourceMeta, getSourceToneClasses } from '@/lib/source-meta'

interface MatchCardProps {
  match: Match
  isSelected?: boolean
  onSelect?: (match: Match) => void
  isPinned?: boolean
  onTogglePinned?: (match: Match) => void
}

export function MatchCard({ match, isSelected, onSelect, isPinned = false, onTogglePinned }: MatchCardProps) {
  const isLive = match.status === 'live'
  const coverageLabel = match.coverage === 'premium' ? 'Profunda' : 'Essencial'
  const upcomingDateLabel = !isLive ? match.kickoffDateLabel ?? 'Em breve' : null
  const sourceMeta = getMatchSourceMeta(match)
  
  const insightIcon = {
    positive: <TrendingUp className="w-3 h-3" />,
    negative: <TrendingDown className="w-3 h-3" />,
    neutral: <Minus className="w-3 h-3" />,
    warning: <AlertTriangle className="w-3 h-3" />,
  }
  
  const insightColor = {
    positive: 'text-success bg-success/10 border-success/30',
    negative: 'text-destructive bg-destructive/10 border-destructive/30',
    neutral: 'text-muted-foreground bg-muted border-border',
    warning: 'text-warning bg-warning/10 border-warning/30',
  }

  const momentumIndicator = {
    home: 'bg-primary',
    away: 'bg-chart-3',
    balanced: 'bg-muted-foreground',
  }

  return (
    <div
      onClick={() => onSelect?.(match)}
      className={cn(
        'group relative cursor-pointer rounded-lg border p-3.5 transition-all duration-200',
        isSelected 
          ? 'border-primary bg-card shadow-[0_0_0_1px_rgb(46_230_131_/_0.25)]'
          : 'border-border bg-card hover:border-primary/45 hover:bg-secondary/35'
      )}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onTogglePinned?.(match)
        }}
        className={cn(
          'absolute right-10 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-md border transition-colors',
          isPinned
            ? 'border-primary/45 bg-primary/20 text-primary'
            : 'border-border bg-secondary text-muted-foreground hover:border-primary/40 hover:text-primary'
        )}
        aria-label={isPinned ? 'Remover da Minha Rodada' : 'Adicionar à Minha Rodada'}
      >
        <Star className={cn('h-3.5 w-3.5', isPinned && 'fill-current')} />
      </button>

      {/* Live indicator */}
      {isLive && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-live"></span>
          </span>
          <span className="text-[10px] font-semibold text-live uppercase tracking-wider">
            {match.minute}{"'"}
          </span>
        </div>
      )}
      
      {/* League */}
      <div className="mb-2.5 flex flex-wrap items-center gap-1.5 pr-24">
        <span className="text-sm">{match.leagueIcon}</span>
        <span className="text-[10px] font-semibold text-muted-foreground">{match.league}</span>
        <span
          className={cn(
            'rounded-sm px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider',
            getSourceToneClasses(sourceMeta.tone)
          )}
        >
          {sourceMeta.label}
        </span>
        <span
          className={cn(
            'rounded-sm px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider',
            match.coverage === 'premium'
              ? 'bg-primary/15 text-primary border border-primary/30'
              : 'bg-secondary text-muted-foreground border border-border'
          )}
        >
          {coverageLabel}
        </span>
      </div>
      
      {/* Teams & Score */}
      <div className="mb-2.5 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <div className={cn(
              'w-1 h-4 rounded-full',
              match.momentum === 'home' ? momentumIndicator.home : 'bg-muted'
            )} />
            <span className={cn(
              'min-w-0 truncate text-sm font-medium',
              match.momentum === 'home' ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {match.homeTeam}
            </span>
          </div>
          <span className="ml-3 text-right text-sm font-bold tabular-nums text-foreground">
            {isLive ? match.homeScore : match.kickoff}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <div className={cn(
              'w-1 h-4 rounded-full',
              match.momentum === 'away' ? momentumIndicator.away : 'bg-muted'
            )} />
            <span className={cn(
              'min-w-0 truncate text-sm font-medium',
              match.momentum === 'away' ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {match.awayTeam}
            </span>
          </div>
          <span className="ml-3 max-w-24 text-right text-xs font-bold text-foreground tabular-nums sm:max-w-none sm:text-sm">
            {isLive ? match.awayScore : upcomingDateLabel}
          </span>
        </div>
      </div>
      
      {/* Odds */}
      <div className="mb-2.5 flex gap-1.5">
        <div className="flex-1 rounded-md border border-border bg-secondary/90 px-2 py-1.5 text-center">
          <span className="block text-[9px] font-semibold tracking-wide text-muted-foreground">1</span>
          <span className="text-sm font-bold tabular-nums text-foreground">{match.homeOdds.toFixed(2)}</span>
        </div>
        <div className="flex-1 rounded-md border border-border bg-secondary/90 px-2 py-1.5 text-center">
          <span className="block text-[9px] font-semibold tracking-wide text-muted-foreground">X</span>
          <span className="text-sm font-bold tabular-nums text-foreground">{match.drawOdds.toFixed(2)}</span>
        </div>
        <div className="flex-1 rounded-md border border-border bg-secondary/90 px-2 py-1.5 text-center">
          <span className="block text-[9px] font-semibold tracking-wide text-muted-foreground">2</span>
          <span className="text-sm font-bold tabular-nums text-foreground">{match.awayOdds.toFixed(2)}</span>
        </div>
      </div>
      
      {/* Copilot Insight */}
      <div className={cn(
        'flex items-start gap-2 rounded-lg border px-2.5 py-2',
        insightColor[match.insightType]
      )}>
        {insightIcon[match.insightType]}
        <span className="text-[11px] font-medium leading-tight">{match.insight}</span>
      </div>
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -left-px bottom-3 top-3 w-1 rounded-r-full bg-primary" />
      )}
    </div>
  )
}
