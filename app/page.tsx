'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ContextSidebar } from '@/components/copilot/context-sidebar'
import { Header } from '@/components/copilot/header'
import { LoadingState } from '@/components/copilot/loading-state'
import { MainContent } from '@/components/copilot/main-content'
import { MatchesSidebar } from '@/components/copilot/matches-sidebar'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  askAssistant,
  getBootstrap,
  getCachedBootstrap,
  getCachedMatchDetail,
  getMatchDetail,
  getMatchDetailByContext,
  getMatchDetailByEventId,
} from '@/lib/api'
import type {
  AssistantAnswerPayload,
  BootstrapPayload,
  Match,
  MatchDetailPayload,
} from '@/lib/copilot-types'
import { buildTransientDetail, emptyBootstrap, emptyMatchDetail } from '@/lib/fallback-data'
import {
  buildMyRoundMatches,
  loadMyRoundIds,
  saveMyRoundIds,
  sortMatchesByMyRound,
  toggleMyRoundId,
} from '@/lib/my-round'

function CopilotPageContent() {
  const searchParams = useSearchParams()
  const [bootstrap, setBootstrap] = useState<BootstrapPayload>(emptyBootstrap)
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)
  const [matchDetail, setMatchDetail] = useState<MatchDetailPayload | null>(null)
  const [myRoundMatchIds, setMyRoundMatchIds] = useState<string[]>([])
  const [assistantAnswer, setAssistantAnswer] = useState<AssistantAnswerPayload | null>(null)
  const [assistantError, setAssistantError] = useState<string | null>(null)
  const [isAssistantLoading, setIsAssistantLoading] = useState(false)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [isRefreshingBootstrap, setIsRefreshingBootstrap] = useState(false)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [isMatchesSheetOpen, setIsMatchesSheetOpen] = useState(false)
  const [isContextDrawerOpen, setIsContextDrawerOpen] = useState(false)
  const [forcedEventStatus, setForcedEventStatus] = useState<'idle' | 'linked' | 'not_found'>('idle')
  const selectedMatchIdRef = useRef<string | null>(null)
  const forcedEventId = (searchParams.get('eventId') ?? '').trim()
  const isEmbedMode = searchParams.get('embed') === '1'
  const forcedHomeTeam = (searchParams.get('homeTeam') ?? '').trim()
  const forcedAwayTeam = (searchParams.get('awayTeam') ?? '').trim()
  const forcedLeague = (searchParams.get('league') ?? '').trim()
  const forcedStatus = ((searchParams.get('status') ?? '').trim().toLowerCase() === 'live' ? 'live' : 'upcoming')

  useEffect(() => {
    selectedMatchIdRef.current = selectedMatchId
  }, [selectedMatchId])

  useEffect(() => {
    setMyRoundMatchIds(loadMyRoundIds())
  }, [])

  useEffect(() => {
    saveMyRoundIds(myRoundMatchIds)
  }, [myRoundMatchIds])

  useEffect(() => {
    let active = true
    let hasCachedBootstrap = false

    async function loadBootstrap(background = false) {
      if (background) {
        setIsRefreshingBootstrap(true)
      } else if (!hasCachedBootstrap) {
        setIsBootstrapping(true)
      }
      const payload = await getBootstrap()
      if (!active) return
      if (!payload) {
        setIsBootstrapping(false)
        setIsRefreshingBootstrap(false)
        return
      }

      const allMatches = [...payload.liveMatches, ...payload.upcomingMatches]
      const currentSelection = selectedMatchIdRef.current
      const hasCurrent = currentSelection ? allMatches.some((match) => match.id === currentSelection) : false
      const nextSelectedId =
        (hasCurrent ? currentSelection : payload.selectedMatchId) ?? allMatches[0]?.id ?? null

      setBootstrap(payload)
      setSelectedMatchId(nextSelectedId)

      if (payload.selectedMatchDetail && payload.selectedMatchDetail.match.id === nextSelectedId) {
        setMatchDetail(payload.selectedMatchDetail)
      }
      setIsBootstrapping(false)
      setIsRefreshingBootstrap(false)
    }

    const cachedBootstrap = getCachedBootstrap()
    if (cachedBootstrap) {
      hasCachedBootstrap = true
      const cachedMatches = [...cachedBootstrap.liveMatches, ...cachedBootstrap.upcomingMatches]
      const currentSelection = selectedMatchIdRef.current
      const hasCurrent = currentSelection
        ? cachedMatches.some((match) => match.id === currentSelection)
        : false
      const nextSelectedId =
        (hasCurrent ? currentSelection : cachedBootstrap.selectedMatchId) ??
        cachedMatches[0]?.id ??
        null

      setBootstrap(cachedBootstrap)
      setSelectedMatchId(nextSelectedId)
      if (cachedBootstrap.selectedMatchDetail && cachedBootstrap.selectedMatchDetail.match.id === nextSelectedId) {
        setMatchDetail(cachedBootstrap.selectedMatchDetail)
      }
      setIsBootstrapping(false)
    }

    void loadBootstrap()

    const intervalId = window.setInterval(() => {
      void loadBootstrap(true)
    }, 30000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    let active = true
    const selectedDetailId = matchDetail?.match.id ?? null

    async function loadMatchDetail(background = false) {
      if (!selectedMatchId) return
      if (!background && selectedDetailId === selectedMatchId) return
      if (!background) {
        setIsDetailLoading(true)
      }
      const payload = await getMatchDetail(selectedMatchId)
      if (!active) return
      if (payload) {
        setMatchDetail(payload)
        if (!background) {
          setIsDetailLoading(false)
        }
        return
      }
      if (!background) {
        setIsDetailLoading(false)
      }
    }

    const cachedDetail = selectedMatchId ? getCachedMatchDetail(selectedMatchId) : null
    if (cachedDetail && cachedDetail.match.id === selectedMatchId) {
      setMatchDetail(cachedDetail)
    }

    void loadMatchDetail(Boolean(cachedDetail))

    const intervalId = window.setInterval(() => {
      void loadMatchDetail(true)
    }, 20000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [matchDetail?.match.id, selectedMatchId])

  useEffect(() => {
    const desktopMedia = window.matchMedia('(min-width: 1280px)')
    const syncPanels = () => {
      if (desktopMedia.matches) {
        setIsMatchesSheetOpen(false)
        setIsContextDrawerOpen(false)
      }
    }

    syncPanels()
    desktopMedia.addEventListener('change', syncPanels)
    return () => desktopMedia.removeEventListener('change', syncPanels)
  }, [])

  useEffect(() => {
    setAssistantAnswer(null)
    setAssistantError(null)
  }, [selectedMatchId])

  useEffect(() => {
    let active = true

    async function syncEventSelection() {
      if (!forcedEventId) {
        setForcedEventStatus('idle')
        return
      }
      const payload = await getMatchDetailByEventId(forcedEventId)
      if (!active) return
      if (!payload) {
        if (forcedHomeTeam && forcedAwayTeam) {
          const contextual = await getMatchDetailByContext({
            homeTeam: forcedHomeTeam,
            awayTeam: forcedAwayTeam,
            league: forcedLeague || undefined,
            externalId: forcedEventId,
            status: forcedStatus,
          })
          if (!active) return
          if (contextual) {
            setSelectedMatchId(contextual.match.id)
            setMatchDetail(contextual)
            setForcedEventStatus('linked')
            return
          }
        }
        setForcedEventStatus('not_found')
        return
      }
      setSelectedMatchId(payload.match.id)
      setMatchDetail(payload)
      setForcedEventStatus('linked')
    }

    void syncEventSelection()

    return () => {
      active = false
    }
  }, [forcedAwayTeam, forcedEventId, forcedHomeTeam, forcedLeague, forcedStatus])

  const sortedLiveMatches = sortMatchesByMyRound(bootstrap.liveMatches, myRoundMatchIds)
  const sortedUpcomingMatches = sortMatchesByMyRound(bootstrap.upcomingMatches, myRoundMatchIds)
  const allMatches = [...sortedLiveMatches, ...sortedUpcomingMatches]
  const selectedMatch: Match | null =
    allMatches.find((match) => match.id === selectedMatchId) ?? matchDetail?.match ?? null
  const detailForSelection =
    matchDetail && matchDetail.match.id === selectedMatchId
      ? matchDetail
      : selectedMatch
      ? buildTransientDetail(selectedMatch)
      : null
  const showGlobalLoading = isBootstrapping && !selectedMatch
  const showDetailRefresh = Boolean(selectedMatch && isDetailLoading)

  const liveMatches = sortedLiveMatches.map((match) => ({
    ...match,
    isSelected: match.id === selectedMatchId,
  }))

  const upcomingMatches = sortedUpcomingMatches.map((match) => ({
    ...match,
    isSelected: match.id === selectedMatchId,
  }))

  const myRoundMatches = buildMyRoundMatches([...liveMatches, ...upcomingMatches], myRoundMatchIds)

  const handleSelectMatch = (match: Match) => {
    setSelectedMatchId(match.id)
    setIsMatchesSheetOpen(false)
  }

  const handleTogglePinnedMatch = (match: Match) => {
    setMyRoundMatchIds((currentIds) => toggleMyRoundId(currentIds, match.id))
  }

  const handleAskAssistant = async (
    question: string,
    scope: 'selected_match' | 'my_round' = 'selected_match'
  ) => {
    setIsAssistantLoading(true)
    setAssistantError(null)
    const response = await askAssistant({
      question,
      matchId: selectedMatchId,
      pinnedMatchIds: myRoundMatchIds,
      scope,
    })

    if (!response) {
      setAssistantAnswer(null)
      setAssistantError('Não consegui responder agora. Tente novamente na próxima atualização do painel.')
      setIsAssistantLoading(false)
      return
    }

    setAssistantAnswer(response)
    setIsAssistantLoading(false)
  }

  if (isEmbedMode) {
    return (
      <div className="relative min-h-screen bg-background overflow-x-clip">
        <div className="flex min-h-screen flex-col">
          <div className="border-b border-border bg-navy-deep px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Copiloto da Sorte</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Leitura explicável sincronizada com a partida aberta.
            </p>
            {forcedEventStatus === 'linked' && (
              <p className="mt-1 text-[11px] text-success">Partida do detalhe conectada com sucesso.</p>
            )}
            {forcedEventStatus === 'not_found' && (
              <p className="mt-1 text-[11px] text-warning">
                Esse evento não está no feed atual da BetsAPI. Exibindo a melhor leitura ao vivo disponível agora.
              </p>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <MainContent
              match={detailForSelection?.match ?? selectedMatch}
              isPinned={selectedMatch ? myRoundMatchIds.includes(selectedMatch.id) : false}
              onTogglePinnedMatch={selectedMatch ? () => handleTogglePinnedMatch(selectedMatch) : undefined}
              headline={detailForSelection?.headline ?? emptyMatchDetail.headline}
              livePulse={detailForSelection?.livePulse}
              liveField={detailForSelection?.liveField}
              keyPlayers={detailForSelection?.keyPlayers ?? []}
              scenarios={detailForSelection?.scenarios ?? []}
              timeline={detailForSelection?.timeline ?? []}
              homeStats={detailForSelection?.homeStats ?? emptyMatchDetail.homeStats}
              awayStats={detailForSelection?.awayStats ?? emptyMatchDetail.awayStats}
              recentForm={detailForSelection?.recentForm ?? emptyMatchDetail.recentForm}
              leagueContext={detailForSelection?.leagueContext ?? emptyMatchDetail.leagueContext}
              quickMarkets={(detailForSelection?.relatedMarkets ?? []).slice(0, 3)}
            />

            {selectedMatch && (
              <ContextSidebar
                className="w-full border-l-0 border-t border-border"
                match={selectedMatch}
                livePulse={detailForSelection?.livePulse}
                scenarios={detailForSelection?.scenarios ?? []}
                relatedMarkets={detailForSelection?.relatedMarkets ?? []}
                h2hHistory={detailForSelection?.h2hHistory ?? emptyMatchDetail.h2hHistory}
                keyPlayers={detailForSelection?.keyPlayers ?? []}
                monitoring={detailForSelection?.monitoring ?? []}
                generatedAt={bootstrap.generatedAt}
                isPinned={selectedMatch ? myRoundMatchIds.includes(selectedMatch.id) : false}
                myRoundCount={myRoundMatches.length}
                onTogglePinnedMatch={selectedMatch ? () => handleTogglePinnedMatch(selectedMatch) : undefined}
                assistantAnswer={assistantAnswer}
                assistantError={assistantError}
                isAssistantLoading={isAssistantLoading}
                onAskAssistant={handleAskAssistant}
              />
            )}
          </div>
        </div>

        {showGlobalLoading && (
          <LoadingState
            mode="screen"
            title="Sincronizando o painel ao vivo"
            description="Buscando shortlist, mercados e leitura inicial do Copiloto."
          />
        )}
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-background overflow-x-clip">
      <Header
        selectedMatch={selectedMatch}
        liveCount={bootstrap.liveMatches.length}
        upcomingCount={bootstrap.upcomingMatches.length}
        myRoundCount={myRoundMatches.length}
        onOpenMatches={() => setIsMatchesSheetOpen(true)}
        onOpenContext={selectedMatch ? () => setIsContextDrawerOpen(true) : undefined}
      />

      <div className="flex min-h-[calc(100svh-4rem)] flex-col xl:h-[calc(100svh-4rem)] xl:flex-row">
        <MatchesSidebar
          className="hidden xl:flex xl:w-80 xl:shrink-0"
          liveMatches={liveMatches}
          myRoundMatches={myRoundMatches}
          upcomingMatches={upcomingMatches}
          selectedMatch={selectedMatch}
          replayCount={bootstrap.replayCount}
          supportedLeagues={bootstrap.supportedLeagues}
          generatedAt={bootstrap.generatedAt}
          sourceMode={bootstrap.sourceMode}
          onSelectMatch={handleSelectMatch}
          myRoundMatchIds={myRoundMatchIds}
          onTogglePinnedMatch={handleTogglePinnedMatch}
        />

        <div className="relative flex min-h-0 flex-1 xl:min-w-0">
          {showDetailRefresh && (
            <LoadingState
              mode="inline"
              title="Atualizando leitura"
              description="Recompondo mercado, cenário e contexto do jogo."
            />
          )}

          <MainContent
            match={detailForSelection?.match ?? selectedMatch}
            isPinned={selectedMatch ? myRoundMatchIds.includes(selectedMatch.id) : false}
            onTogglePinnedMatch={selectedMatch ? () => handleTogglePinnedMatch(selectedMatch) : undefined}
            headline={detailForSelection?.headline ?? emptyMatchDetail.headline}
            livePulse={detailForSelection?.livePulse}
            liveField={detailForSelection?.liveField}
            keyPlayers={detailForSelection?.keyPlayers ?? []}
            scenarios={detailForSelection?.scenarios ?? []}
            timeline={detailForSelection?.timeline ?? []}
            homeStats={detailForSelection?.homeStats ?? emptyMatchDetail.homeStats}
            awayStats={detailForSelection?.awayStats ?? emptyMatchDetail.awayStats}
            recentForm={detailForSelection?.recentForm ?? emptyMatchDetail.recentForm}
            leagueContext={detailForSelection?.leagueContext ?? emptyMatchDetail.leagueContext}
            quickMarkets={(detailForSelection?.relatedMarkets ?? []).slice(0, 3)}
          />

          {selectedMatch && (
            <ContextSidebar
              className="hidden xl:flex xl:w-72 xl:shrink-0"
              match={selectedMatch}
              livePulse={detailForSelection?.livePulse}
              scenarios={detailForSelection?.scenarios ?? []}
              relatedMarkets={detailForSelection?.relatedMarkets ?? []}
              h2hHistory={detailForSelection?.h2hHistory ?? emptyMatchDetail.h2hHistory}
              keyPlayers={detailForSelection?.keyPlayers ?? []}
              monitoring={detailForSelection?.monitoring ?? []}
              generatedAt={bootstrap.generatedAt}
              isPinned={selectedMatch ? myRoundMatchIds.includes(selectedMatch.id) : false}
              myRoundCount={myRoundMatches.length}
              onTogglePinnedMatch={selectedMatch ? () => handleTogglePinnedMatch(selectedMatch) : undefined}
              assistantAnswer={assistantAnswer}
              assistantError={assistantError}
              isAssistantLoading={isAssistantLoading}
              onAskAssistant={handleAskAssistant}
            />
          )}
        </div>
      </div>

      <Sheet open={isMatchesSheetOpen} onOpenChange={setIsMatchesSheetOpen}>
        <SheetContent
          side="left"
          className="w-full border-r border-border bg-navy-deep p-0 sm:max-w-md"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Jogos</SheetTitle>
            <SheetDescription>
              Navegue entre partidas ao vivo e próximas sem sair da visão principal.
            </SheetDescription>
          </SheetHeader>
          <MatchesSidebar
            className="h-full w-full border-r-0"
            liveMatches={liveMatches}
            myRoundMatches={myRoundMatches}
            upcomingMatches={upcomingMatches}
            selectedMatch={selectedMatch}
            replayCount={bootstrap.replayCount}
            supportedLeagues={bootstrap.supportedLeagues}
            generatedAt={bootstrap.generatedAt}
            sourceMode={bootstrap.sourceMode}
            onSelectMatch={handleSelectMatch}
            myRoundMatchIds={myRoundMatchIds}
            onTogglePinnedMatch={handleTogglePinnedMatch}
          />
        </SheetContent>
      </Sheet>

      {selectedMatch && (
        <Drawer open={isContextDrawerOpen} onOpenChange={setIsContextDrawerOpen} handleOnly>
          <DrawerContent className="h-[85svh] max-h-[85svh] min-h-0 overflow-hidden border-t border-border bg-navy-deep p-0">
            <DrawerHeader className="sr-only">
              <DrawerTitle>Contexto e ações</DrawerTitle>
              <DrawerDescription>
                Contexto complementar, mercados relacionados e pontos de monitoramento da partida selecionada.
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex h-full min-h-0 flex-1 overflow-hidden">
              <ContextSidebar
                className="flex h-full min-h-0 w-full border-l-0"
                match={selectedMatch}
                livePulse={detailForSelection?.livePulse}
                scenarios={detailForSelection?.scenarios ?? []}
                relatedMarkets={detailForSelection?.relatedMarkets ?? []}
                h2hHistory={detailForSelection?.h2hHistory ?? emptyMatchDetail.h2hHistory}
                keyPlayers={detailForSelection?.keyPlayers ?? []}
                monitoring={detailForSelection?.monitoring ?? []}
                generatedAt={bootstrap.generatedAt}
                isPinned={selectedMatch ? myRoundMatchIds.includes(selectedMatch.id) : false}
                myRoundCount={myRoundMatches.length}
                onTogglePinnedMatch={selectedMatch ? () => handleTogglePinnedMatch(selectedMatch) : undefined}
                assistantAnswer={assistantAnswer}
                assistantError={assistantError}
                isAssistantLoading={isAssistantLoading}
                onAskAssistant={handleAskAssistant}
              />
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {showGlobalLoading && (
        <LoadingState
          mode="screen"
          title="Sincronizando o painel ao vivo"
          description="Buscando shortlist, mercados e leitura inicial do Copiloto."
        />
      )}

      {isRefreshingBootstrap && !showGlobalLoading && (
        <div className="pointer-events-none fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-md border border-border bg-card/95 px-3 py-2 text-[11px] text-muted-foreground shadow-lg shadow-black/10 backdrop-blur-sm">
          Atualizando shortlist live e próximos jogos...
        </div>
      )}
    </div>
  )
}

export default function CopilotPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CopilotPageContent />
    </Suspense>
  )
}
