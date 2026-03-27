'use client'

import { Activity, CircleDot, Radar, ShieldAlert, Waves } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { KeyPlayer, LiveField, LivePulse, Match, TimelineEvent } from '@/lib/copilot-types'

interface LiveFieldPremiumProps {
  match: Match
  liveField?: LiveField | null
  livePulse?: LivePulse | null
  keyPlayers?: KeyPlayer[]
  events: TimelineEvent[]
}

interface WindowEventItem {
  id: string
  minute: number
  label: string
  detail: string
  tone: 'high' | 'medium' | 'low'
}

interface WindowEventGroups {
  recent5: WindowEventItem[]
  prior10: WindowEventItem[]
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function normalizeText(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

function compactText(text: string, max = 105) {
  const normalized = normalizeText(text)
  if (normalized.length <= max) return normalized
  return `${normalized.slice(0, max - 1).trimEnd()}…`
}

function pressureStateLabel(match: Match, liveField: LiveField | null | undefined) {
  if (!liveField) return 'Aguardando sinais ao vivo.'
  if (liveField.momentum === 'home') return `${match.homeTeam} está a atacar com mais frequência.`
  if (liveField.momentum === 'away') return `${match.awayTeam} está a atacar com mais frequência.`
  return 'Jogo equilibrado de pressão neste momento.'
}

function modeBadgeLabel(liveField: LiveField | null | undefined) {
  if (!liveField) return 'AQUECENDO'
  if (liveField.mode === 'advanced_xy') return 'DADOS AVANÇADOS XY ATIVOS'
  if (liveField.mode === 'proxy_pressure') return 'LEITURA HÍBRIDA AO VIVO'
  if (liveField.mode === 'fallback_stats') return 'LEITURA POR PRESSÃO'
  return 'AGUARDANDO AO VIVO'
}

function signalDeltaText(match: Match, signal: LiveField['signals'][number]) {
  const delta = signal.homeValue - signal.awayValue
  const tolerance = signal.unit === 'pct' ? 3 : 1
  const unit = signal.unit === 'pct' ? ' pp' : ''
  if (Math.abs(delta) <= tolerance) return 'Sem vantagem clara nesta métrica.'
  if (delta > 0) return `${match.homeCode} +${Math.abs(delta)}${unit}`
  return `${match.awayCode} +${Math.abs(delta)}${unit}`
}

function signalNarrative(match: Match, signal: LiveField['signals'][number]) {
  const delta = signal.homeValue - signal.awayValue
  const leader = delta >= 0 ? match.homeTeam : match.awayTeam
  const [homeValue, awayValue] = [
    `${signal.homeValue}${signal.unit === 'pct' ? '%' : ''}`,
    `${signal.awayValue}${signal.unit === 'pct' ? '%' : ''}`,
  ]

  if (signal.key === 'dangerous_attacks') {
    return `${leader} cria mais ataques perigosos (${homeValue}–${awayValue}).`
  }
  if (signal.key === 'on_target') {
    return `${leader} finaliza mais no alvo (${homeValue}–${awayValue}).`
  }
  if (signal.key === 'attacks') {
    return `${leader} chega mais ao terço final (${homeValue}–${awayValue}).`
  }
  if (signal.key === 'possession_rt') {
    return `${leader} controla mais a posse (${homeValue}–${awayValue}).`
  }
  if (signal.key === 'corners') {
    return `${leader} acumula mais bola parada ofensiva (${homeValue}–${awayValue}).`
  }
  if (signal.key === 'yellowcards') {
    return `${leader} carrega mais risco disciplinar (${homeValue}–${awayValue}).`
  }
  return `${signal.label}: ${homeValue}–${awayValue}.`
}

function mapTimelineEvent(match: Match, event: TimelineEvent): WindowEventItem {
  const teamName = event.team === 'home' ? match.homeTeam : event.team === 'away' ? match.awayTeam : ''
  const actionByType = {
    goal: teamName ? `${teamName} marcou` : 'Gol confirmado',
    momentum: teamName ? `${teamName} está a atacar` : 'Pressão monitorada',
    insight: event.title,
    substitution: teamName ? `Troca em ${teamName}` : 'Substituição registrada',
    card: teamName ? `Cartão para ${teamName}` : 'Cartão aplicado',
  }

  return {
    id: event.id,
    minute: event.minute,
    label: actionByType[event.type],
    detail: event.type === 'momentum' ? compactText(event.description, 92) : compactText(event.description, 112),
    tone: event.impact,
  }
}

function buildWindowEventGroups(
  match: Match,
  liveField: LiveField | null | undefined,
  livePulse: LivePulse | null | undefined,
  events: TimelineEvent[],
): WindowEventGroups {
  const currentMinute = match.minute ?? Math.max(...events.map((event) => event.minute), 0)
  const recent5Start = currentMinute > 0 ? Math.max(1, currentMinute - 5) : 0
  const prior10Start = currentMinute > 0 ? Math.max(1, currentMinute - 10) : 0

  const sorted = events.slice().sort((a, b) => b.minute - a.minute)
  const recent5Rows = sorted.filter((event) => event.minute >= recent5Start).slice(0, 3)
  const prior10Rows = sorted
    .filter((event) => event.minute < recent5Start && event.minute >= prior10Start)
    .slice(0, 3)

  if (recent5Rows.length || prior10Rows.length) {
    return {
      recent5: recent5Rows.map((event) => mapTimelineEvent(match, event)),
      prior10: prior10Rows.map((event) => mapTimelineEvent(match, event)),
    }
  }

  const fallbackDetail = livePulse?.summary
    ? compactText(livePulse.summary, 112)
    : liveField?.stateLabel
      ? compactText(liveField.stateLabel, 112)
      : 'O sistema está coletando sinais para abrir a próxima leitura de contexto.'

  return {
    recent5: [
      {
        id: 'fallback-window-event',
        minute: currentMinute || 0,
        label: pressureStateLabel(match, liveField),
        detail: fallbackDetail,
        tone: 'low',
      },
    ],
    prior10: [],
  }
}

function buildFlipRiskLine(match: Match, liveField: LiveField | null | undefined): string {
  if (!liveField) {
    return 'Se o jogo ganhar volume de finalização no alvo para um lado, a leitura pode virar rapidamente.'
  }

  const dominantSide = liveField.momentum === 'home' ? 'home' : liveField.momentum === 'away' ? 'away' : null
  const dominantTeam = dominantSide === 'home' ? match.homeTeam : dominantSide === 'away' ? match.awayTeam : null
  const rivalTeam = dominantSide === 'home' ? match.awayTeam : dominantSide === 'away' ? match.homeTeam : null

  const onTarget = liveField.signals.find((signal) => signal.key === 'on_target')
  const corners = liveField.signals.find((signal) => signal.key === 'corners')
  const yellowCards = liveField.signals.find((signal) => signal.key === 'yellowcards')

  if (!dominantTeam || !rivalTeam) {
    return 'Sem lado dominante claro. Duas chegadas fortes seguidas podem mudar a leitura imediatamente.'
  }

  if (onTarget) {
    const dominantOn = dominantSide === 'home' ? onTarget.homeValue : onTarget.awayValue
    const rivalOn = dominantSide === 'home' ? onTarget.awayValue : onTarget.homeValue
    if (rivalOn >= dominantOn) {
      return `Se ${rivalTeam} voltar a finalizar no alvo com frequência (${rivalOn}-${dominantOn}), o viés atual pode inverter.`
    }
  }

  if (corners) {
    const dominantCorners = dominantSide === 'home' ? corners.homeValue : corners.awayValue
    const rivalCorners = dominantSide === 'home' ? corners.awayValue : corners.homeValue
    if (rivalCorners >= dominantCorners + 2) {
      return `Se ${rivalTeam} converter a sequência de escanteios (${rivalCorners}-${dominantCorners}), muda o risco do próximo gol.`
    }
  }

  if (yellowCards) {
    const dominantCards = dominantSide === 'home' ? yellowCards.homeValue : yellowCards.awayValue
    const rivalCards = dominantSide === 'home' ? yellowCards.awayValue : yellowCards.homeValue
    if (dominantCards > rivalCards) {
      return `Se ${dominantTeam} seguir carregando cartões (${dominantCards}-${rivalCards}), abre espaço para reação de ${rivalTeam}.`
    }
  }

  return `Se ${rivalTeam} igualar o volume de finalizações e ataques perigosos na próxima janela, a leitura perde força.`
}

function intensityLabel(intensity: number) {
  if (intensity >= 82) return 'Muito alta'
  if (intensity >= 66) return 'Alta'
  if (intensity >= 48) return 'Média'
  return 'Baixa'
}

export function LiveFieldPremium({
  match,
  liveField,
  livePulse,
  keyPlayers = [],
  events,
}: LiveFieldPremiumProps) {
  const ballX = clamp((liveField?.ballX ?? 0.5) * 100, 4, 96)
  const ballY = clamp((liveField?.ballY ?? 0.5) * 100, 9, 91)
  const intensity = liveField?.intensity ?? 0
  const pressureTotal = Math.max(1, (liveField?.homePressure ?? 0) + (liveField?.awayPressure ?? 0))
  const homePressurePct = clamp(Math.round(((liveField?.homePressure ?? 0) / pressureTotal) * 100), 0, 100)
  const awayPressurePct = 100 - homePressurePct

  const fieldSignals = liveField?.signals ?? []
  const sortedSignals = fieldSignals
    .slice()
    .sort((a, b) => Math.abs(b.homeValue - b.awayValue) - Math.abs(a.homeValue - a.awayValue))

  const topSignals = sortedSignals.slice(0, 5)
  const strongestSignal = sortedSignals[0]
  const cautionSignal = sortedSignals.find((signal) => signal.key === 'yellowcards') ?? sortedSignals[1]

  const windowGroups = buildWindowEventGroups(match, liveField, livePulse, events)
  const flipRiskLine = buildFlipRiskLine(match, liveField)
  const homePlayer = keyPlayers.find((player) => player.team === 'home')
  const awayPlayer = keyPlayers.find((player) => player.team === 'away')
  const benchOption = keyPlayers.find((player) => player.status.toLowerCase().includes('banco'))
  const pressureDelta = Math.abs((liveField?.homePressure ?? 0) - (liveField?.awayPressure ?? 0))

  const eventToneClass = {
    high: 'border-primary/45 bg-primary/10',
    medium: 'border-border bg-secondary/35',
    low: 'border-border bg-secondary/20',
  }

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-2 border-b border-border bg-navy-light/35 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <Radar className="h-4 w-4 shrink-0 text-primary" />
          <h3 className="truncate text-base font-semibold text-foreground">Campo Premium Ao Vivo</h3>
          <span className="rounded-md border border-primary/35 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
            {modeBadgeLabel(liveField)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="rounded-md border border-border bg-card/80 px-2 py-1 text-muted-foreground">
            {liveField?.sourceLabel ?? 'Sem fonte ao vivo'}
          </span>
          {liveField?.vcCode ? (
            <span className="rounded-md border border-border bg-card/80 px-2 py-1 text-muted-foreground">
              VC {liveField.vcCode}
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-r from-[#1a6d2f] via-[#2f8747] to-[#1a6d2f] p-3">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.06)_0,rgba(255,255,255,0.02)_50%,rgba(255,255,255,0.06)_100%)] [background-size:56px_100%]" />
          <div className="pointer-events-none absolute left-[28%] top-3 h-[calc(100%-1.5rem)] w-[44%] rounded-md border border-white/25" />
          <div className="pointer-events-none absolute left-1/2 top-3 h-[calc(100%-1.5rem)] w-px -translate-x-1/2 bg-white/35" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/35" />
          <div className="pointer-events-none absolute left-[5%] top-[24%] h-[52%] w-[7%] border border-white/35" />
          <div className="pointer-events-none absolute right-[5%] top-[24%] h-[52%] w-[7%] border border-white/35" />

          <div
            className="absolute z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 bg-white shadow-[0_0_0_6px_rgba(255,255,255,0.18)]"
            style={{ left: `${ballX}%`, top: `${ballY}%` }}
          />

          <div className="relative z-20 flex items-start justify-between">
            <span className="rounded-md border border-white/20 bg-black/28 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
              {liveField?.updateLabel ?? `${match.minute ?? 0}' • ao vivo`}
            </span>
            <span className="rounded-md border border-white/20 bg-black/28 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
              Intensidade {intensity}
            </span>
          </div>

          <div className="relative z-20 mt-32 flex flex-wrap items-center gap-2 text-white sm:mt-28">
            <span className="rounded-md border border-white/20 bg-black/30 px-2 py-1 text-xs font-semibold">
              {pressureStateLabel(match, liveField)}
            </span>
            <span className="rounded-md border border-white/20 bg-black/30 px-2 py-1 text-xs">
              Ritmo {intensityLabel(intensity)}
            </span>
            <span className="rounded-md border border-white/20 bg-black/30 px-2 py-1 text-xs">
              Pressão líquida {pressureDelta} pts
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-lg border border-border bg-card/70 p-3">
            <div className="mb-3 flex items-center gap-2">
              <Waves className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Sinais do Campo</h4>
            </div>

            <div className="space-y-2.5">
              {topSignals.map((signal) => {
                const total = Math.max(1, signal.homeValue + signal.awayValue)
                const homeBarPct = clamp(Math.round((signal.homeValue / total) * 100), 6, 94)
                const unit = signal.unit === 'pct' ? '%' : ''

                return (
                  <div key={signal.key} className="rounded-md border border-border bg-secondary/25 p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-foreground">{signal.label}</span>
                      <span className="text-sm font-semibold text-foreground">
                        {signal.homeValue}
                        {unit} - {signal.awayValue}
                        {unit}
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted/45">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-neon"
                        style={{ width: `${homeBarPct}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-muted-foreground">{signalDeltaText(match, signal)}</p>
                  </div>
                )
              })}
            </div>

            <div className="mt-3 space-y-2">
              <div className="rounded-md border border-primary/35 bg-primary/10 p-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">Confirma a leitura</p>
                <p className="mt-1 text-xs text-foreground">
                  {strongestSignal
                    ? signalNarrative(match, strongestSignal)
                    : 'O campo ainda está acumulando volume para confirmar tendência.'}
                </p>
              </div>
              <div className="rounded-md border border-warning/30 bg-warning/10 p-2.5">
                <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-warning">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Ponto de atenção
                </p>
                <p className="mt-1 text-xs text-foreground">
                  {cautionSignal
                    ? `Se ${signalNarrative(match, cautionSignal).toLowerCase()}, a leitura pode virar rápido.`
                    : 'Sem alerta crítico aberto nesta janela.'}
                </p>
              </div>
            </div>

            {homePlayer || awayPlayer ? (
              <div className="mt-3 rounded-md border border-border bg-secondary/30 p-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Duelo em foco</p>
                <p className="mt-1 text-xs text-foreground">
                  {homePlayer ? `${homePlayer.name} (${match.homeCode})` : `${match.homeCode} sem destaque nomeado`}
                  {' x '}
                  {awayPlayer ? `${awayPlayer.name} (${match.awayCode})` : `${match.awayCode} sem destaque nomeado`}
                </p>
                {benchOption ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Banco de impacto: {benchOption.name} ({benchOption.team === 'home' ? match.homeCode : match.awayCode}).
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="rounded-lg border border-border bg-card/70 p-3">
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Eventos da Janela</h4>
            </div>

            <div className="space-y-3">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Últimos 5 minutos</p>
                <div className="space-y-2">
                  {windowGroups.recent5.map((event, index) => (
                    <div
                      key={event.id}
                      className={cn(
                        'rounded-md border px-2.5 py-2',
                        eventToneClass[event.tone],
                        index === 0 && 'border-primary/45 bg-primary/12',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground">{event.label}</p>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{event.detail}</p>
                        </div>
                        <span className="rounded-md border border-border bg-card/70 px-1.5 py-0.5 text-[11px] font-semibold text-foreground">
                          {event.minute > 0 ? `${event.minute}'` : 'agora'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">5 a 10 minutos atrás</p>
                {windowGroups.prior10.length > 0 ? (
                  <div className="space-y-2">
                    {windowGroups.prior10.map((event) => (
                      <div key={event.id} className={cn('rounded-md border px-2.5 py-2', eventToneClass[event.tone])}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground">{event.label}</p>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{event.detail}</p>
                          </div>
                          <span className="rounded-md border border-border bg-card/70 px-1.5 py-0.5 text-[11px] font-semibold text-foreground">
                            {event.minute > 0 ? `${event.minute}'` : 'agora'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border border-border bg-secondary/20 px-2.5 py-2">
                    <p className="text-xs text-muted-foreground">Sem mudança forte registrada nesse recorte.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 rounded-md border border-border bg-secondary/25 p-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Leitura rápida</p>
              <p className="mt-1 text-xs text-foreground">
                {liveField?.stateLabel
                  ? compactText(liveField.stateLabel, 125)
                  : 'Sem leitura concluída nesta janela. O sistema segue monitorando pressão e mercado.'}
              </p>
            </div>
            <div className="mt-2 rounded-md border border-warning/30 bg-warning/10 p-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-warning">O que pode virar essa leitura agora</p>
              <p className="mt-1 text-xs text-foreground">{flipRiskLine}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-md border border-border bg-secondary/25 px-3 py-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            Pressão sintética: {match.homeCode} {homePressurePct}% vs {awayPressurePct}% {match.awayCode}
          </span>
          <span className="flex items-center gap-1 text-primary">
            <CircleDot className="h-3.5 w-3.5" />
            {liveField?.advancedDataReason ?? 'Modo avançado ativo com coordenada ao vivo.'}
          </span>
        </div>
      </div>
    </section>
  )
}
