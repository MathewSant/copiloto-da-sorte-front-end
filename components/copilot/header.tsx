'use client'

import { Bell, Clock3, Menu, Radio, Search, Settings, Sparkles, Star, User, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Match } from '@/lib/copilot-types'

interface HeaderProps {
  selectedMatch: Match | null
  liveCount: number
  upcomingCount: number
  myRoundCount: number
  onOpenMatches?: () => void
  onOpenContext?: () => void
}

export function Header({
  selectedMatch,
  liveCount,
  upcomingCount,
  myRoundCount,
  onOpenMatches,
  onOpenContext,
}: HeaderProps) {
  const mobileStatusLabel =
    selectedMatch?.status === 'live'
      ? `${selectedMatch.minute ?? 0}' agora`
      : selectedMatch?.kickoff ?? 'Pré-jogo'

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-navy-deep">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 xl:gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-primary/80 bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight text-foreground">Copiloto</span>
              <span className="text-[10px] font-semibold leading-tight tracking-[0.14em] text-primary">
                DA SORTE
              </span>
            </div>
          </div>

          <div className="hidden h-6 w-px bg-border xl:block" />

          <nav className="hidden items-center gap-1 xl:flex">
            <Button
              variant="ghost"
              size="sm"
              className="border border-primary bg-primary px-4 text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
            >
              Ao Vivo
            </Button>
            <Button variant="ghost" size="sm" className="border border-transparent px-4 text-muted-foreground hover:border-border">
              Próximos
            </Button>
            <Button variant="ghost" size="sm" className="border border-transparent px-4 text-muted-foreground hover:border-border">
              Minha Rodada
            </Button>
            <Button variant="ghost" size="sm" className="border border-transparent px-4 text-muted-foreground hover:border-border">
              Análises
            </Button>
          </nav>
        </div>

        <div className="hidden items-center gap-3 xl:flex">
          <div className="relative hidden 2xl:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar jogos, times, ligas..."
              className="h-9 w-64 rounded-md border border-border bg-secondary/90 pl-9 pr-4 text-sm text-foreground transition-all placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/35"
            />
          </div>

          <div className="h-6 w-px bg-border" />

          <Button variant="ghost" size="icon" className="relative border border-transparent text-muted-foreground hover:border-border">
            <Star className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {myRoundCount}
            </span>
          </Button>

          <Button variant="ghost" size="icon" className="relative border border-transparent text-muted-foreground hover:border-border">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-live text-[10px] font-bold text-primary-foreground">
              2
            </span>
          </Button>

          <Button variant="ghost" size="icon" className="border border-transparent text-muted-foreground hover:border-border">
            <Settings className="h-5 w-5" />
          </Button>

          <div className="h-6 w-px bg-border" />

          <Button variant="ghost" size="sm" className="gap-2 border border-transparent text-muted-foreground hover:border-border">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary">
              <User className="h-4 w-4" />
            </div>
            <span className="text-sm">Minha Conta</span>
          </Button>
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <Button
            variant="secondary"
            size="sm"
            className="border border-border bg-secondary text-foreground hover:bg-secondary/90"
            onClick={onOpenMatches}
          >
            <Menu className="h-4 w-4" />
            Jogos
          </Button>
          {selectedMatch && (
            <Button
              variant="ghost"
              size="sm"
              className="border border-border bg-card text-foreground hover:bg-secondary"
              onClick={onOpenContext}
            >
              <Sparkles className="h-4 w-4 text-primary" />
              Contexto
            </Button>
          )}
        </div>
      </div>

      <div className="border-t border-border px-4 py-3 sm:px-6 xl:hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {selectedMatch ? (
              <>
                <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  <span>{selectedMatch.leagueIcon}</span>
                  <span className="truncate">{selectedMatch.league}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <span className="truncate">{selectedMatch.homeCode}</span>
                  <span className="rounded-md border border-border bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {mobileStatusLabel}
                  </span>
                  <span className="truncate">{selectedMatch.awayCode}</span>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
                </p>
              </>
            ) : (
              <>
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Painel de leitura
                </span>
                <p className="mt-1 text-sm text-foreground">
                  Abra a lista de jogos para iniciar a análise no mobile.
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <div className="flex items-center gap-2 rounded-md border border-live/35 bg-live/15 px-3 py-1.5 text-xs font-semibold text-live">
              <Radio className="h-3.5 w-3.5" />
              {liveCount} ao vivo
            </div>
            <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" />
              {upcomingCount} próximos
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
