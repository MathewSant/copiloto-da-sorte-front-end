'use client'

import { useEffect, useState } from 'react'
import { Bell, Share2, Shield, Star, TrendingUp, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Match, RelatedMarket } from '@/lib/copilot-types'
import { getMatchSourceMeta, getSourceToneClasses } from '@/lib/source-meta'

interface MatchHeaderProps {
  match: Match
  quickMarkets: RelatedMarket[]
  isPinned?: boolean
  onTogglePinnedMatch?: () => void
  leagueContext: {
    homePosition: number
    awayPosition: number
    homePoints: number
    awayPoints: number
    matchday: number
    totalMatchdays: number
    homeGoalDiff: string
    awayGoalDiff: string
  }
}

export function MatchHeader({
  match,
  quickMarkets,
  isPinned = false,
  onTogglePinnedMatch,
  leagueContext,
}: MatchHeaderProps) {
  const [homeLogoFailed, setHomeLogoFailed] = useState(false)
  const [awayLogoFailed, setAwayLogoFailed] = useState(false)
  const isLive = match.status === 'live'
  const coverageLabel = match.coverage === 'premium' ? 'Cobertura Profunda' : 'Cobertura Essencial'
  const sourceMeta = getMatchSourceMeta(match)
  const hasLeagueStandings =
    leagueContext.homePosition > 0 &&
    leagueContext.awayPosition > 0 &&
    leagueContext.homePoints > 0 &&
    leagueContext.awayPoints > 0

  useEffect(() => {
    setHomeLogoFailed(false)
    setAwayLogoFailed(false)
  }, [match.id, match.homeLogoUrl, match.awayLogoUrl])

  function renderTeamMeta(position: number, points: number, goalDiff: string) {
    if (!hasLeagueStandings) {
      return (
        <span className="text-xs text-muted-foreground">
          {match.coverage === 'premium' ? 'Leitura histórica ativa' : 'Dados de tabela indisponíveis'}
        </span>
      )
    }

    return (
      <>
        <span>{position}º lugar</span>
        <span>•</span>
        <span>{points} pts</span>
        <span className="text-success">({goalDiff})</span>
      </>
    )
  }

  function renderTeamBadge(side: 'home' | 'away') {
    const isHome = side === 'home'
    const logoUrl = isHome ? match.homeLogoUrl : match.awayLogoUrl
    const logoFailed = isHome ? homeLogoFailed : awayLogoFailed
    const code = isHome ? match.homeCode : match.awayCode

    if (logoUrl && !logoFailed) {
      return (
        <img
          src={logoUrl}
          alt={`Escudo ${isHome ? match.homeTeam : match.awayTeam}`}
          loading="lazy"
          className="h-11 w-11 object-contain sm:h-12 sm:w-12"
          onError={() => (isHome ? setHomeLogoFailed(true) : setAwayLogoFailed(true))}
        />
      )
    }

    return (
      <span className={cn('text-xl font-bold sm:text-2xl', isHome ? 'text-primary' : 'text-chart-3')}>
        {code}
      </span>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border bg-secondary/35 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base">{match.leagueIcon}</span>
          <span className="text-sm font-medium text-foreground">{match.league}</span>
          <span className="text-xs text-muted-foreground">
            • {leagueContext.matchday > 0 ? `Rodada ${leagueContext.matchday}` : isLive ? 'Ao vivo' : 'Pré-jogo'}
          </span>
          <span
            className={cn(
              'ml-1 rounded-sm border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
              match.coverage === 'premium'
                ? 'border-primary/30 bg-primary/15 text-primary'
                : 'border-border bg-secondary text-muted-foreground'
            )}
          >
            {coverageLabel}
          </span>
          <span
            className={cn(
              'rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
              getSourceToneClasses(sourceMeta.tone)
            )}
          >
            {sourceMeta.label}
          </span>
        </div>

        <div className="flex items-center gap-1 self-end sm:self-auto">
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn(
              'border border-transparent text-muted-foreground hover:border-border hover:text-warning',
              isPinned && 'border-primary/30 text-primary hover:text-primary'
            )}
            onClick={onTogglePinnedMatch}
          >
            <Star className={cn('w-4 h-4', isPinned && 'fill-current')} />
          </Button>
          <Button variant="ghost" size="icon-sm" className="border border-transparent text-muted-foreground hover:border-border hover:text-foreground">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="border border-transparent text-muted-foreground hover:border-border hover:text-foreground">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="order-2 flex-1 text-center lg:order-1">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-md border border-primary/25 bg-primary/12 sm:h-16 sm:w-16">
              {renderTeamBadge('home')}
            </div>
            <h2 className="mb-1 text-lg font-semibold text-foreground">{match.homeTeam}</h2>
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              {renderTeamMeta(leagueContext.homePosition, leagueContext.homePoints, leagueContext.homeGoalDiff)}
            </div>
          </div>

          <div className="order-1 rounded-lg border border-border bg-secondary/45 px-6 py-5 text-center lg:order-2 lg:px-8 lg:py-4">
            {isLive ? (
              <>
                <div className="mb-2 flex items-center justify-center gap-4">
                  <span className="text-4xl font-bold tabular-nums text-foreground sm:text-5xl">
                    {match.homeScore}
                  </span>
                  <span className="text-2xl text-muted-foreground">-</span>
                  <span className="text-4xl font-bold tabular-nums text-foreground sm:text-5xl">
                    {match.awayScore}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-live"></span>
                  </span>
                  <span className="text-sm font-semibold text-live">
                    {match.minute}
                    {"'"} • {match.periodLabel ?? 'Ao Vivo'}
                  </span>
                </div>
              </>
            ) : (
              <>
                <span className="text-3xl font-bold text-foreground">{match.kickoff}</span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {match.kickoffDateLabel ? `${match.kickoffDateLabel} • início` : 'Início'}
                </span>
              </>
            )}
          </div>

          <div className="order-3 flex-1 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-md border border-chart-3/25 bg-chart-3/12 sm:h-16 sm:w-16">
              {renderTeamBadge('away')}
            </div>
            <h2 className="mb-1 text-lg font-semibold text-foreground">{match.awayTeam}</h2>
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              {renderTeamMeta(leagueContext.awayPosition, leagueContext.awayPoints, leagueContext.awayGoalDiff)}
            </div>
          </div>
        </div>

        {isLive && (
          <div className="mt-6 border-t border-border pt-4">
            <div className="mb-2 flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>Momento do Jogo</span>
              <span
                className={cn(
                  'font-semibold',
                  match.momentum === 'home'
                    ? 'text-primary'
                    : match.momentum === 'away'
                    ? 'text-chart-3'
                    : 'text-muted-foreground'
                )}
              >
                {match.momentum === 'home'
                  ? `${match.homeTeam} com mais pressão`
                  : match.momentum === 'away'
                  ? `${match.awayTeam} com mais pressão`
                  : 'Jogo Equilibrado'}
              </span>
            </div>
            <div className="flex h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className={cn(
                  'transition-all duration-500',
                  match.momentum === 'home' ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
                style={{
                  width:
                    match.momentum === 'home' ? '70%' : match.momentum === 'away' ? '30%' : '50%',
                }}
              />
              <div
                className={cn(
                  'transition-all duration-500',
                  match.momentum === 'away' ? 'bg-chart-3' : 'bg-muted-foreground/30'
                )}
                style={{
                  width:
                    match.momentum === 'away' ? '70%' : match.momentum === 'home' ? '30%' : '50%',
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-border bg-secondary/35 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid gap-2 sm:grid-cols-3 sm:gap-3 lg:flex lg:flex-wrap lg:items-center lg:gap-6">
          {quickMarkets.slice(0, 3).map((market, index) => {
            const Icon = index === 0 ? TrendingUp : index === 1 ? Shield : Zap
            const iconClassName = index === 0 ? 'text-success' : index === 1 ? 'text-chart-2' : 'text-warning'

            return (
              <div
                key={market.name}
                className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 lg:bg-transparent lg:px-0 lg:py-0 lg:border-transparent"
              >
                <Icon className={`w-4 h-4 ${iconClassName}`} />
                <span className="text-xs text-muted-foreground">{market.name}:</span>
                <span className="text-sm font-bold tabular-nums text-foreground">{market.odds.toFixed(2)}</span>
              </div>
            )
          })}
        </div>

        <Button size="sm" className="w-full gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto">
          <Zap className="w-3.5 h-3.5" />
          Ver Mercados
        </Button>
      </div>
    </div>
  )
}
