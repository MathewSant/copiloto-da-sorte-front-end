'use client'

import { useEffect, useState } from 'react'
import { Filter, ChevronDown, Radio, Clock, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MatchCard } from './match-card'
import { cn } from '@/lib/utils'
import type { Match } from '@/lib/copilot-types'

interface MatchesSidebarProps {
  liveMatches: Match[]
  myRoundMatches: Match[]
  upcomingMatches: Match[]
  selectedMatch: Match | null
  replayCount: number
  supportedLeagues: string[]
  generatedAt: string
  sourceMode: string
  onSelectMatch: (match: Match) => void
  myRoundMatchIds: string[]
  onTogglePinnedMatch: (match: Match) => void
  className?: string
}

export function MatchesSidebar({
  liveMatches,
  myRoundMatches,
  upcomingMatches,
  selectedMatch,
  supportedLeagues,
  generatedAt,
  sourceMode,
  onSelectMatch,
  myRoundMatchIds,
  onTogglePinnedMatch,
  className,
}: MatchesSidebarProps) {
  const [activeTab, setActiveTab] = useState('live')
  const [selectedLeague, setSelectedLeague] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [lastUpdateSeconds, setLastUpdateSeconds] = useState(0)

  useEffect(() => {
    const compute = () => Math.max(0, Math.round((Date.now() - new Date(generatedAt).getTime()) / 1000))
    setLastUpdateSeconds(compute())
    const interval = window.setInterval(() => {
      setLastUpdateSeconds(compute())
    }, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [generatedAt])

  const liveSourceLabel =
    sourceMode === 'betsapi_live_blend_statsbomb_fbref'
      ? 'Live BetsAPI ativo'
      : sourceMode === 'betsapi_upcoming_blend_statsbomb_fbref'
      ? 'Próximos reais ativos'
      : sourceMode === 'loading'
      ? 'Sincronizando feed'
      : 'Vitrine curada ativa'

  const leagueLabels = Array.from(
    new Set([
      ...supportedLeagues,
      ...liveMatches.map((match) => match.league),
      ...upcomingMatches.map((match) => match.league),
    ])
  )

  const leagues = [
    { id: 'all', label: 'Todas as Ligas' },
    ...leagueLabels.map((league) => ({
      id: league.toLowerCase().replace(/\s+/g, '-'),
      label: league,
    })),
  ]

  const allMatches =
    activeTab === 'live' ? liveMatches : activeTab === 'my-round' ? myRoundMatches : upcomingMatches
  const matches =
    selectedLeague === 'all'
      ? allMatches
      : allMatches.filter((match) => match.league.toLowerCase().replace(/\s+/g, '-') === selectedLeague)

  const tabs = [
    { id: 'live', label: 'Ao Vivo', icon: Radio, count: liveMatches.length },
    { id: 'my-round', label: 'Minha Rodada', icon: Star, count: myRoundMatches.length },
    { id: 'upcoming', label: 'Próximos', icon: Clock, count: upcomingMatches.length },
  ]

  return (
    <aside className={cn('flex h-full min-h-0 w-80 flex-col border-r border-border bg-navy-deep', className)}>
      {/* Header */}
      <div className="border-b border-border bg-navy-light/30 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">Jogos</h2>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'gap-1.5 border border-transparent px-2.5 text-xs',
              showFilters ? 'text-primary' : 'text-muted-foreground'
            )}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-3.5 h-3.5" />
            Filtros
          </Button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-1 rounded-md border border-border bg-secondary/70 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex min-w-0 items-center justify-center gap-1.5 rounded-sm border px-2 py-2 text-[11px] font-medium transition-all sm:px-3 sm:text-xs',
                activeTab === tab.id
                  ? 'border-border bg-card text-foreground'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
              )}
            >
              <tab.icon className={cn(
                'w-3.5 h-3.5',
                tab.id === 'live' && activeTab === 'live' && 'text-live'
              )} />
              <span className="truncate">{tab.label}</span>
              <span className={cn(
                'ml-1 rounded-sm px-1.5 py-0.5 text-[10px] font-semibold',
                activeTab === tab.id ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        
        {/* Filters dropdown */}
        {showFilters && (
          <div className="mt-3 rounded-md border border-border bg-secondary p-3">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
              Liga
            </label>
            <div className="relative">
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="w-full h-9 cursor-pointer appearance-none rounded-md border border-border bg-card px-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/35"
              >
                {leagues.map((league) => (
                  <option key={league.id} value={league.id}>
                    {league.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Matches List */}
      <div className="flex-1 space-y-2 overflow-y-auto p-2.5 overscroll-contain">
        {activeTab === 'live' && (
          <div className="mb-2 rounded-md border border-border bg-card/50 px-2.5 py-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-live"></span>
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                {liveMatches.length} jogos ao vivo agora
              </span>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground/80">
              Shortlist ao vivo prioriza partidas com sinal suficiente para leitura.
            </p>
          </div>
        )}

        {activeTab === 'my-round' && (
          <div className="mb-2 rounded-md border border-border bg-card/50 px-2.5 py-2">
            <div className="flex items-center gap-2">
              <Star className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground">
                {myRoundMatches.length} jogos fixados na sua rodada
              </span>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground/80">
              Use essa aba para acompanhar primeiro os jogos que você realmente quer monitorar hoje.
            </p>
          </div>
        )}
        
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            isSelected={selectedMatch?.id === match.id}
            onSelect={onSelectMatch}
            isPinned={myRoundMatchIds.includes(match.id)}
            onTogglePinned={onTogglePinnedMatch}
          />
        ))}

        {matches.length === 0 && activeTab !== 'my-round' && (
          <div className="rounded-lg border border-dashed border-border bg-card/40 p-4 text-center">
            <p className="text-sm font-medium text-foreground mb-1">Nenhum jogo nesse recorte</p>
            <p className="text-xs text-muted-foreground">
              Ajuste o filtro ou aguarde a próxima sincronização do feed.
            </p>
          </div>
        )}

        {matches.length === 0 && activeTab === 'my-round' && (
          <div className="rounded-lg border border-dashed border-border bg-card/40 p-4 text-center">
            <p className="text-sm font-medium text-foreground mb-1">Sua rodada ainda está vazia</p>
            <p className="text-xs text-muted-foreground">
              Fixe os jogos que você quer acompanhar e o Copiloto sobe esse recorte para o topo.
            </p>
          </div>
        )}
        
        {activeTab === 'upcoming' && matches.length > 0 && (
          <div className="text-center py-4">
            <span className="text-xs text-muted-foreground">
              Mais jogos em breve
            </span>
          </div>
        )}
        
      </div>

      {/* Footer info */}
      <div className="border-t border-border bg-navy-light/20 p-4">
        <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Atualizado há {lastUpdateSeconds}s</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
            {liveSourceLabel}
          </span>
        </div>
      </div>
    </aside>
  )
}
