'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { cn } from '@/lib/utils'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  History, 
  Target, 
  Eye, 
  Sparkles,
  ChevronRight,
  Flame,
  Clock,
  MessageSquareText,
  SendHorizontal,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type {
  AssistantAnswerPayload,
  H2HHistory,
  KeyPlayer,
  LivePulse,
  Match,
  MonitoringItem,
  RelatedMarket,
  Scenario,
} from '@/lib/copilot-types'

function getLikelyLeadingTeam(match: Match) {
  const homeScore = match.homeScore ?? 0
  const awayScore = match.awayScore ?? 0

  if (homeScore > awayScore) {
    return match.homeTeam
  }

  if (awayScore > homeScore) {
    return match.awayTeam
  }

  return match.homeOdds <= match.awayOdds ? match.homeTeam : match.awayTeam
}

function inferDriverFocus(text?: string | null): 'market' | 'pressure' | 'shots' | 'score' | 'generic' {
  const lowered = (text ?? '').toLowerCase()

  if (
    lowered.includes('mercado') ||
    lowered.includes('odd') ||
    lowered.includes('preço') ||
    lowered.includes('preco') ||
    lowered.includes('linha') ||
    lowered.includes('handicap')
  ) {
    return 'market'
  }

  if (
    lowered.includes('no alvo') ||
    lowered.includes('finalização') ||
    lowered.includes('finalizacao') ||
    lowered.includes('chute')
  ) {
    return 'shots'
  }

  if (
    lowered.includes('pressão') ||
    lowered.includes('pressao') ||
    lowered.includes('ataques perigosos') ||
    lowered.includes('volume') ||
    lowered.includes('zona quente')
  ) {
    return 'pressure'
  }

  if (lowered.includes('placar') || lowered.includes('gol')) {
    return 'score'
  }

  return 'generic'
}

function buildValidationQuestion(params: {
  match: Match
  primaryScenario?: Scenario
  leadingTeam: string
  focus: 'market' | 'pressure' | 'shots' | 'score' | 'generic'
}) {
  const { match, primaryScenario, leadingTeam, focus } = params

  if (!primaryScenario) {
    return `O que mais valida esse jogo agora: mercado, pressão ou placar em ${match.homeTeam} x ${match.awayTeam}?`
  }

  if (primaryScenario.id === 'goals') {
    if (focus === 'shots') {
      return 'No cenário de gols, as finalizações no alvo já sustentam a linha ou ainda é cedo?'
    }
    if (focus === 'pressure') {
      return 'No cenário de gols, os ataques perigosos já validam a linha ou ainda falta chance limpa?'
    }
    if (focus === 'score') {
      return 'No cenário de gols, o placar atual empurra mais um gol ou o jogo pode esfriar?'
    }
    if (focus === 'market') {
      return 'No cenário de gols, a linha está sendo validada mais pelo mercado ou pelo campo?'
    }
    return 'No cenário de gols, o que mais valida a leitura agora: placar, volume ou mercado?'
  }

  if (primaryScenario.id === 'momentum') {
    if (focus === 'shots') {
      return 'No momento & risco, as chegadas no alvo já mostram risco real de próximo gol?'
    }
    if (focus === 'pressure') {
      return 'No momento & risco, quem realmente controla a pressão agora e por quê?'
    }
    if (focus === 'score') {
      return 'No momento & risco, o placar mexeu no ritmo ou a pressão segue do mesmo lado?'
    }
    if (focus === 'market') {
      return 'No momento & risco, o mercado está confirmando a pressão em campo ou ainda não?'
    }
    return 'No momento & risco, o que mais pesa agora: pressão, finalização ou leitura de mercado?'
  }

  if (focus === 'shots') {
    return `No resultado final, as finalizações no alvo já confirmam ${leadingTeam} ou o jogo ainda está fino?`
  }
  if (focus === 'pressure') {
    return `No resultado final, a pressão de ${leadingTeam} já valida a vitória ou ainda falta confirmação de mercado?`
  }
  if (focus === 'score') {
    return `No resultado final, o placar já sustenta ${leadingTeam} ou a leitura ainda depende do campo?`
  }
  if (focus === 'market') {
    return `No resultado final, a vitória de ${leadingTeam} está sendo sustentada mais pelo mercado ou pelo campo agora?`
  }
  return `No resultado final, o que mais sustenta ${leadingTeam} agora: placar, mercado ou pressão?`
}

function buildMarketQuestion(params: {
  match: Match
  primaryScenario?: Scenario
  topMarket?: RelatedMarket
}) {
  const { primaryScenario, topMarket } = params
  const marketName = topMarket?.name
  const lowered = marketName?.toLowerCase() ?? ''

  if (marketName) {
    if (
      lowered.includes('over') ||
      lowered.includes('under') ||
      lowered.includes('gol') ||
      lowered.includes('ambas') ||
      lowered.includes('marcam')
    ) {
      return `No mercado ${marketName}, a linha de gols já está validada pelo campo ou ainda depende de mais pressão?`
    }

    if (lowered.includes('handicap')) {
      return `No mercado ${marketName}, a leitura de resultado ainda tem valor ou já ficou esticada?`
    }

    if (lowered.includes('vitória') || lowered.includes('empate')) {
      return `No mercado ${marketName}, o preço ainda acompanha o campo ou já correu na frente?`
    }

    return `O mercado ${marketName} conversa com a leitura atual ou ainda pede confirmação?`
  }

  if (primaryScenario?.id === 'goals') {
    return 'Qual linha de gols parece mais sensível agora: over, under ou esperar mais confirmação?'
  }

  if (primaryScenario?.id === 'momentum') {
    return 'Qual mercado está mais alinhado com o momento atual do jogo sem forçar a entrada?'
  }

  return 'Qual mercado está mais alinhado com a leitura atual sem correr na frente do jogo?'
}

function buildRiskQuestion(params: {
  primaryScenario?: Scenario
  focus: 'market' | 'pressure' | 'shots' | 'score' | 'generic'
}) {
  const { primaryScenario, focus } = params

  if (primaryScenario?.id === 'goals') {
    if (focus === 'pressure' || focus === 'shots') {
      return 'O que faria o cenário de gols perder força nos próximos minutos: queda de volume ou falta de finalização limpa?'
    }
    return 'O que faria o cenário de gols perder força nos próximos minutos?'
  }

  if (primaryScenario?.id === 'momentum') {
    return 'O que pode virar o momento e o risco deste jogo contra a leitura atual?'
  }

  if (focus === 'market') {
    return 'Se a odd mexer contra, isso já enfraquece o resultado final ou ainda precisa de campo contra?'
  }
  if (focus === 'pressure' || focus === 'shots') {
    return 'Qual sinal de pressão ou finalização colocaria esse resultado final mais em risco agora?'
  }
  if (focus === 'score') {
    return 'O que no campo ainda pode fazer o placar enganar a leitura de resultado?'
  }
  return 'O que pode virar essa leitura contra mim nos próximos minutos?'
}

function buildDynamicAssistantQuestions(params: {
  match: Match
  scenarios: Scenario[]
  relatedMarkets: RelatedMarket[]
  monitoring: MonitoringItem[]
  livePulse?: LivePulse | null
}) {
  const { match, scenarios, relatedMarkets, monitoring, livePulse } = params
  const primaryScenario = scenarios.find((scenario) => scenario.id === 'result') ?? scenarios[0]
  const topMarket =
    relatedMarkets.find((market) => market.trend === 'hot') ??
    relatedMarkets.find((market) => market.trend === 'up') ??
    relatedMarkets[0]
  const leadingTeam = getLikelyLeadingTeam(match)
  const focus = inferDriverFocus(
    primaryScenario?.drivers[0] ??
      livePulse?.drivers?.[0] ??
      monitoring[0]?.text ??
      topMarket?.name ??
      null
  )
  const riskFocus = inferDriverFocus(monitoring[1]?.text ?? livePulse?.summary ?? null)
  const questions: string[] = [
    buildValidationQuestion({
      match,
      primaryScenario,
      leadingTeam,
      focus,
    }),
    buildMarketQuestion({
      match,
      primaryScenario,
      topMarket,
    }),
    buildRiskQuestion({
      primaryScenario,
      focus: riskFocus === 'generic' ? focus : riskFocus,
    }),
  ]

  const fallbackQuestions =
    match.status === 'live'
      ? [
          `O que valida esse cenário agora em ${match.homeTeam} x ${match.awayTeam}?`,
          'Qual mercado está mais alinhado com essa leitura neste momento?',
          'O que pode virar essa leitura contra mim?',
        ]
      : [
          'O que observar na abertura desse jogo?',
          'Qual linha parece mais sensível no pré-jogo?',
          'O que pode enfraquecer essa leitura logo no início?',
        ]

  return Array.from(new Set([...questions, ...fallbackQuestions].map((question) => question.trim()))).slice(0, 3)
}

interface ContextSidebarProps {
  match: Match
  livePulse?: LivePulse | null
  scenarios: Scenario[]
  relatedMarkets: RelatedMarket[]
  h2hHistory: H2HHistory
  keyPlayers: KeyPlayer[]
  monitoring: MonitoringItem[]
  generatedAt: string
  isPinned?: boolean
  myRoundCount?: number
  onTogglePinnedMatch?: () => void
  assistantAnswer?: AssistantAnswerPayload | null
  assistantError?: string | null
  isAssistantLoading?: boolean
  onAskAssistant?: (question: string, scope?: 'selected_match' | 'my_round') => Promise<void> | void
  className?: string
}

export function ContextSidebar({
  match,
  livePulse,
  scenarios,
  relatedMarkets,
  h2hHistory,
  keyPlayers,
  monitoring,
  generatedAt,
  isPinned = false,
  myRoundCount = 0,
  onTogglePinnedMatch,
  assistantAnswer,
  assistantError,
  isAssistantLoading = false,
  onAskAssistant,
  className,
}: ContextSidebarProps) {
  const [customQuestion, setCustomQuestion] = useState('')
  const [updatedSeconds, setUpdatedSeconds] = useState(0)
  const trendIcon = {
    hot: <Flame className="w-3 h-3 text-live" />,
    up: <TrendingUp className="w-3 h-3 text-success" />,
    stable: <TrendingDown className="w-3 h-3 text-muted-foreground" />,
  }
  const hasH2H = h2hHistory.lastFive.length > 0
  const hasKeyPlayers = keyPlayers.length > 0
  const assistantQuestions = buildDynamicAssistantQuestions({
    match,
    scenarios,
    relatedMarkets,
    monitoring,
    livePulse,
  })
  const canSubmitCustomQuestion =
    customQuestion.trim().length >= 6 && !isAssistantLoading && Boolean(onAskAssistant)

  useEffect(() => {
    setCustomQuestion('')
  }, [match.id])

  useEffect(() => {
    const compute = () => Math.max(0, Math.round((Date.now() - new Date(generatedAt).getTime()) / 1000))
    setUpdatedSeconds(compute())
    const interval = window.setInterval(() => {
      setUpdatedSeconds(compute())
    }, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [generatedAt])

  async function handleCustomQuestionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedQuestion = customQuestion.trim()
    if (!trimmedQuestion || !onAskAssistant) {
      return
    }

    await onAskAssistant(trimmedQuestion, 'selected_match')
  }

  return (
    <aside
      className={cn(
        'flex h-full min-h-0 w-72 flex-col overflow-hidden border-l border-border bg-navy-deep',
        className
      )}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-navy-deep p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Contexto & Ações</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y">
        {/* Related Markets */}
        <div className="p-4 border-b border-border">
          <div className="mb-4 rounded-lg border border-primary/25 bg-primary/10 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Minha Rodada</p>
                  <p className="text-[11px] text-muted-foreground">
                    {isPinned
                      ? 'Esse jogo já está fixado na sua rodada assistida.'
                      : 'Fixe esse jogo se ele faz parte da sua rodada de hoje.'}
                  </p>
                </div>
              </div>
              <Button
                variant={isPinned ? 'default' : 'secondary'}
                size="sm"
                className={cn(
                  'h-8 px-3 text-[11px]',
                  isPinned ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''
                )}
                onClick={onTogglePinnedMatch}
              >
                <Star className={cn('mr-1.5 h-3.5 w-3.5', isPinned && 'fill-current')} />
                {isPinned ? 'Na rodada' : 'Fixar jogo'}
              </Button>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {myRoundCount > 0
                ? `${myRoundCount} jogo${myRoundCount > 1 ? 's' : ''} estão sendo acompanhados nesta rodada.`
                : 'Quando você fixa um jogo, o Copiloto sobe esse recorte e responde com foco na sua decisão.'}
            </p>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Mercados em Linha
              </h3>
            </div>
          </div>
          
          <div className="space-y-2">
            {relatedMarkets.map((market, index) => (
              <div 
                key={index}
                className={cn(
                  'group flex cursor-pointer items-center justify-between rounded-md border border-border bg-secondary p-2.5 transition-all hover:border-primary/50',
                  market.trend === 'hot' && 'border-live/30 bg-live/10'
                )}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {trendIcon[market.trend]}
                  <span className="text-xs text-foreground truncate">{market.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-sm font-extrabold tabular-nums',
                    market.trend === 'hot' ? 'text-live' : 'text-primary'
                  )}>
                    {market.odds.toFixed(2)}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
          
          <Button variant="ghost" size="sm" className="mt-3 w-full border border-transparent text-xs text-primary hover:border-border hover:text-primary">
            Ver todos os mercados
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
        
        {/* Head to Head */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Confrontos Recentes
            </h3>
          </div>

          <div className="space-y-2">
            {hasH2H ? (
              <>
                <div className="mb-2 flex items-center justify-between rounded-lg bg-secondary p-3">
                  <div className="text-center">
                    <span className="text-lg font-bold text-primary">{h2hHistory.homeWins}</span>
                    <span className="block text-[10px] text-muted-foreground">{match.homeCode}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-lg font-bold text-muted-foreground">{h2hHistory.draws}</span>
                    <span className="block text-[10px] text-muted-foreground">Empates</span>
                  </div>
                  <div className="text-center">
                    <span className="text-lg font-bold text-chart-3">{h2hHistory.awayWins}</span>
                    <span className="block text-[10px] text-muted-foreground">{match.awayCode}</span>
                  </div>
                </div>

                {h2hHistory.lastFive.slice(0, 3).map((match, index) => (
                  <div 
                    key={index}
                    className="flex flex-col gap-1 rounded-md border border-border bg-secondary/45 p-2 text-xs"
                  >
                    <span className="text-muted-foreground">{match.date}</span>
                    <span className="font-semibold leading-relaxed text-foreground">
                      {match.homeTeam} {match.home} - {match.away} {match.awayTeam}
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="rounded-md border border-border bg-secondary/50 p-3 text-xs text-muted-foreground">
                  Histórico direto indisponível para esta cobertura.
                </div>
                <div className="rounded-md border border-border bg-card/60 p-3 text-[11px] leading-relaxed text-muted-foreground">
                  Nesta demo, o H2H só aparece quando a base histórica cobre esse confronto com segurança.
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Key Players */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Jogadores em Destaque
            </h3>
          </div>
          
          <div className="space-y-2">
            {hasKeyPlayers ? (
              keyPlayers.map((player, index) => (
                <div
                  key={index}
                  className="rounded-md border border-border bg-secondary p-2.5"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="pr-3 text-xs font-semibold text-foreground">{player.name}</span>
                    <span className={cn(
                      'px-1.5 py-0.5 rounded text-[9px] font-medium',
                      player.team === 'home' 
                        ? 'bg-primary/20 text-primary'
                        : 'bg-chart-3/20 text-chart-3'
                    )}>
                      {player.team === 'home' ? match.homeCode : match.awayCode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] text-muted-foreground">{player.impact}</span>
                    <span className={cn(
                      'shrink-0 text-[10px] font-medium',
                      player.status === 'Em campo' ? 'text-success' : 'text-warning'
                    )}>
                      {player.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="rounded-md border border-border bg-secondary/50 p-3 text-xs text-muted-foreground">
                  Jogadores-chave indisponíveis nesta cobertura.
                </div>
                <div className="rounded-md border border-border bg-card/60 p-3 text-[11px] leading-relaxed text-muted-foreground">
                  O Copiloto só destaca jogadores quando há base confiável de elenco e produção individual para este jogo.
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* AI Assistant */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              O Que Monitorar
            </h3>
          </div>
          
          <div className="space-y-2">
            <div className="rounded-md border border-primary/30 bg-primary/10 p-3">
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-xs text-foreground leading-relaxed">
                  {monitoring[0]?.text ?? 'Monitoramento indisponível no momento.'}
                </p>
              </div>
            </div>
            
            <div className="rounded-md border border-border bg-secondary p-3">
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {monitoring[1]?.text ?? 'A próxima faixa crítica do jogo será destacada aqui.'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 rounded-lg border border-border bg-card/80 p-3">
            <div className="mb-3 flex items-center gap-2">
              <MessageSquareText className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs font-semibold text-foreground">Pergunte ao Copiloto</p>
                <p className="text-[11px] text-muted-foreground">
                  Sugestões geradas para {match.homeTeam} x {match.awayTeam}. Você também pode perguntar do seu jeito.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              {assistantQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => void onAskAssistant?.(question, 'selected_match')}
                  disabled={isAssistantLoading || !onAskAssistant}
                  className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-left text-xs text-muted-foreground transition-all hover:border-primary/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {question}
                </button>
              ))}
            </div>

            <form className="mt-3 space-y-2" onSubmit={(event) => void handleCustomQuestionSubmit(event)}>
              <Textarea
                value={customQuestion}
                onChange={(event) => setCustomQuestion(event.target.value)}
                rows={3}
                placeholder={`Ex.: o placar está confirmando o campo em ${match.homeCode} x ${match.awayCode}?`}
                className="min-h-22 border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground"
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  A resposta sempre considera o jogo selecionado e o contexto disponível no painel.
                </p>
                <Button
                  type="submit"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  disabled={!canSubmitCustomQuestion}
                >
                  <SendHorizontal className="h-3.5 w-3.5" />
                  Perguntar
                </Button>
              </div>
            </form>
          </div>

            {isAssistantLoading && (
              <div className="mt-3 rounded-md border border-primary/20 bg-primary/10 p-3">
                <p className="text-xs font-semibold text-foreground">Copiloto pensando</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  Cruzando leitura do jogo, mercado e sinais ao vivo deste painel.
                </p>
              </div>
            )}

            {assistantError && !isAssistantLoading && (
              <div className="mt-3 rounded-md border border-destructive/20 bg-destructive/10 p-3">
                <p className="text-xs font-semibold text-foreground">Resposta indisponível</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{assistantError}</p>
              </div>
            )}

            {assistantAnswer && !isAssistantLoading && (
              <div className="mt-3 rounded-md border border-primary/20 bg-primary/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-foreground">{assistantAnswer.title}</p>
                  <span className="rounded-sm border border-primary/20 bg-card/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    {assistantAnswer.source === 'openai' ? 'IA contextual' : 'Resposta local'}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-foreground">{assistantAnswer.answer}</p>

                {assistantAnswer.evidence.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {assistantAnswer.evidence.map((item, index) => (
                      <div key={`${item.label}-${index}`} className="rounded-md border border-border bg-card/80 p-2.5">
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-primary">
                          {item.label}
                        </span>
                        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                )}

                {assistantAnswer.watchouts.length > 0 && (
                  <div className="mt-3 rounded-md border border-border bg-card/50 p-2.5">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      O que observar agora
                    </span>
                    <p className="mt-1 text-[11px] leading-relaxed text-foreground">
                      {assistantAnswer.watchouts[0]}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-secondary/30 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] text-muted-foreground">
              {match.status === 'live' ? 'Análise ao vivo' : 'Leitura pré-jogo'}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground">
            Atualizado há {updatedSeconds}s
          </span>
        </div>
      </div>
    </aside>
  )
}
