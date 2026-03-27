'use client'

import { cn } from '@/lib/utils'
import type { TeamStats } from '@/lib/copilot-types'

interface TeamComparisonProps {
  homeTeam: string
  awayTeam: string
  homeCode?: string
  awayCode?: string
  homeStats: TeamStats
  awayStats: TeamStats
  recentForm: {
    home: readonly ('W' | 'D' | 'L')[]
    away: readonly ('W' | 'D' | 'L')[]
  }
}

const statLabels: Record<keyof TeamStats, string> = {
  attack: 'Ataque',
  defense: 'Defesa',
  form: 'Forma',
  pressure: 'Pressão',
  control: 'Controle',
  danger: 'Perigo Criado',
}

export function TeamComparison({
  homeTeam,
  awayTeam,
  homeCode = 'CASA',
  awayCode = 'FORA',
  homeStats,
  awayStats,
  recentForm,
}: TeamComparisonProps) {
  const formColor = {
    W: 'bg-success text-success-foreground',
    D: 'bg-muted text-muted-foreground',
    L: 'bg-destructive text-destructive-foreground',
  }

  const formLabel = {
    W: 'V',
    D: 'E',
    L: 'D',
  }

  const hasRecentForm = recentForm.home.length > 0 || recentForm.away.length > 0

  function renderForm(results: readonly ('W' | 'D' | 'L')[]) {
    if (results.length === 0) {
      return Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex h-6 w-6 items-center justify-center rounded border border-border bg-secondary text-[10px] font-bold text-muted-foreground"
        >
          -
        </div>
      ))
    }

    return results.map((result, index) => (
      <div
        key={index}
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold',
          formColor[result]
        )}
      >
        {formLabel[result]}
      </div>
    ))
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Comparativo</h3>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-primary/25 bg-primary/15">
              <span className="text-xs font-bold text-primary">{homeCode}</span>
            </div>
            <span className="truncate text-sm font-medium text-foreground">{homeTeam}</span>
          </div>
          <div className="flex min-w-0 items-center gap-2 sm:justify-end">
            <span className="truncate text-sm font-medium text-foreground">{awayTeam}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-chart-3/25 bg-chart-3/15">
              <span className="text-xs font-bold text-chart-3">{awayCode}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {(Object.keys(homeStats) as (keyof TeamStats)[]).map((stat) => {
          const homeValue = homeStats[stat]
          const awayValue = awayStats[stat]
          const homeWins = homeValue > awayValue
          const awayWins = awayValue > homeValue

          return (
            <div key={stat} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className={cn('font-semibold tabular-nums', homeWins ? 'text-primary' : 'text-muted-foreground')}>
                  {homeValue}
                </span>
                <span className="text-center font-medium text-muted-foreground">{statLabels[stat]}</span>
                <span className={cn('font-semibold tabular-nums', awayWins ? 'text-chart-3' : 'text-muted-foreground')}>
                  {awayValue}
                </span>
              </div>

              <div className="flex h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    'transition-all duration-500',
                    homeWins ? 'bg-primary' : 'bg-muted-foreground/50'
                  )}
                  style={{ width: `${homeValue}%` }}
                />
                <div className="flex-1" />
                <div
                  className={cn(
                    'transition-all duration-500',
                    awayWins ? 'bg-chart-3' : 'bg-muted-foreground/50'
                  )}
                  style={{ width: `${awayValue}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="border-t border-border bg-secondary/35 p-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Últimos 5 Jogos
        </h4>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1">{renderForm(recentForm.home)}</div>

          <span className="text-[10px] text-muted-foreground">
            {hasRecentForm ? 'últimos 5' : 'indisponível nesta cobertura'}
          </span>

          <div className="flex gap-1">{renderForm(recentForm.away)}</div>
        </div>

        {!hasRecentForm && (
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            A forma recente aparece quando temos histórico confiável das equipes nesta competição.
          </p>
        )}
      </div>
    </div>
  )
}
