'use client'

import { useState } from 'react'
import { Brain, Gauge, Sparkles, Zap } from 'lucide-react'
import { LiveFieldPremium } from './live-field-premium'
import { LivePulseStrip } from './live-pulse-strip'
import { MatchHeader } from './match-header'
import { MatchTimeline } from './match-timeline'
import { ScenarioCard } from './scenario-card'
import { TeamComparison } from './team-comparison'
import type {
  CopilotHeadline,
  KeyPlayer,
  LiveField,
  LivePulse,
  Match,
  RelatedMarket,
  Scenario,
  TeamStats,
  TimelineEvent,
} from '@/lib/copilot-types'

interface MainContentProps {
  match: Match | null
  isPinned?: boolean
  onTogglePinnedMatch?: () => void
  headline: CopilotHeadline
  livePulse?: LivePulse | null
  liveField?: LiveField | null
  keyPlayers?: KeyPlayer[]
  scenarios: Scenario[]
  timeline: TimelineEvent[]
  homeStats: TeamStats
  awayStats: TeamStats
  quickMarkets: RelatedMarket[]
  recentForm: {
    home: readonly ('W' | 'D' | 'L')[]
    away: readonly ('W' | 'D' | 'L')[]
  }
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

export function MainContent({
  match,
  isPinned = false,
  onTogglePinnedMatch,
  headline,
  livePulse,
  liveField,
  keyPlayers = [],
  scenarios,
  timeline,
  homeStats,
  awayStats,
  quickMarkets,
  recentForm,
  leagueContext,
}: MainContentProps) {
  const [expandedScenario, setExpandedScenario] = useState<string | null>('result')

  if (!match) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background px-6 py-16">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg border border-primary/25 bg-primary/10">
            <Zap className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-foreground">Selecione um jogo</h2>
          <p className="max-w-xs text-sm text-muted-foreground">
            Escolha uma partida na lista ao lado para ver a análise completa do Copiloto
          </p>
        </div>
      </div>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto bg-background">
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
        <MatchHeader
          match={match}
          leagueContext={leagueContext}
          quickMarkets={quickMarkets}
          isPinned={isPinned}
          onTogglePinnedMatch={onTogglePinnedMatch}
        />

        <div className="rounded-lg border border-primary/30 bg-card p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-12 w-12 items-center justify-center rounded-md border border-primary/25 bg-primary/15">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">{headline.title}</h3>
                <span className="rounded-sm border border-primary/30 bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  {headline.updatedLabel}
                </span>
              </div>
              <p className="text-base leading-relaxed text-foreground">{headline.summary}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-1.5">
                  <Gauge className="h-4 w-4 text-success" />
                  <span className="text-xs text-muted-foreground">Confiança:</span>
                  <span className="text-xs font-semibold capitalize text-success">{headline.confidence}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-warning" />
                  <span className="text-xs text-muted-foreground">Volatilidade:</span>
                  <span className="text-xs font-semibold capitalize text-warning">{headline.volatility}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {match.status === 'live' &&
          (livePulse ? (
            <LivePulseStrip livePulse={livePulse} />
          ) : (
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Janela Temporal</span>
                <span className="rounded-sm border border-border bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  aquecendo
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                O Copiloto já está armazenando leituras ao vivo. Assim que o jogo acumular 2 snapshots distintos,
                esta faixa passa a mostrar a mudança real de mercado, pressão e placar.
              </p>
            </div>
          ))}

        {match.status === 'live' ? (
          <LiveFieldPremium
            match={match}
            liveField={liveField}
            livePulse={livePulse}
            keyPlayers={keyPlayers}
            events={timeline}
          />
        ) : null}

        <div>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Cenários Principais</h2>
            </div>
            <span className="text-xs text-muted-foreground">Clique para expandir</span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {scenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                isExpanded={expandedScenario === scenario.id}
                onToggle={() =>
                  setExpandedScenario(expandedScenario === scenario.id ? null : scenario.id)
                }
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <MatchTimeline
            events={timeline}
            currentMinute={match.minute || 0}
            homeCode={match.homeCode}
            awayCode={match.awayCode}
            livePulse={livePulse}
          />
          <TeamComparison
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            homeCode={match.homeCode}
            awayCode={match.awayCode}
            homeStats={homeStats}
            awayStats={awayStats}
            recentForm={recentForm}
          />
        </div>

        <div className="py-4 text-center">
          <p className="mx-auto max-w-2xl text-[11px] text-muted-foreground">
            O Copiloto da Sorte é uma ferramenta de análise e não garante resultados. As
            probabilidades e cenários são baseados em dados históricos e contexto atual. Aposte com
            responsabilidade.
          </p>
        </div>
      </div>
    </main>
  )
}
