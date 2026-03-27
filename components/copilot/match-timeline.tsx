'use client'

import { AlertCircle, Circle, RefreshCw, Sparkles, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LivePulse, TimelineEvent } from '@/lib/copilot-types'

interface MatchTimelineProps {
  events: TimelineEvent[]
  currentMinute: number
  homeCode?: string
  awayCode?: string
  livePulse?: LivePulse | null
}

export function MatchTimeline({
  events,
  currentMinute,
  homeCode = 'CASA',
  awayCode = 'FORA',
  livePulse,
}: MatchTimelineProps) {
  const eventIcon = {
    goal: (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success">
        <Circle className="h-3 w-3 fill-current text-success-foreground" />
      </div>
    ),
    card: (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-warning">
        <div className="h-3.5 w-2.5 rounded-sm bg-warning-foreground" />
      </div>
    ),
    substitution: (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-chart-2">
        <RefreshCw className="h-3 w-3 text-foreground" />
      </div>
    ),
    momentum: (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
        <TrendingUp className="h-3 w-3 text-primary-foreground" />
      </div>
    ),
    insight: (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-chart-4">
        <Sparkles className="h-3 w-3 text-foreground" />
      </div>
    ),
  }

  const impactBorder = {
    high: 'border-l-primary',
    medium: 'border-l-muted-foreground',
    low: 'border-l-border',
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-2 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Mudança de Cenário</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {livePulse
            ? `${livePulse.windowLabel} • ${livePulse.snapshotCount} snapshots`
            : 'Acompanhamento em tempo real'}
        </span>
      </div>

      <div className="px-4 pt-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">0{"'"}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-neon transition-all duration-500"
              style={{ width: `${(currentMinute / 90) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">90{"'"}</span>
        </div>
        <div className="mb-4 flex justify-between text-[10px] text-muted-foreground">
          <span>1º Tempo</span>
          <span className="font-medium text-primary">
            {currentMinute}
            {"'"} agora
          </span>
          <span>2º Tempo</span>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto px-4 pb-4">
        <div className="relative">
          <div className="absolute bottom-0 left-3 top-0 w-px bg-border" />

          <div className="space-y-3">
            {events.slice().reverse().map((event, index) => (
              <div
                key={event.id}
              className={cn(
                  'relative rounded-md border-l-2 bg-secondary/35 py-2 pl-10 pr-3 transition-all',
                  impactBorder[event.impact],
                  index === 0 && 'border-l-primary bg-primary/5'
                )}
              >
                <div className="absolute left-0 top-1/2 -translate-y-1/2">{eventIcon[event.type]}</div>

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">{event.title}</span>
                      {event.team && (
                        <span
                          className={cn(
                            'rounded px-1.5 py-0.5 text-[9px] font-medium',
                            event.team === 'home'
                              ? 'bg-primary/20 text-primary'
                              : 'bg-chart-3/20 text-chart-3'
                          )}
                        >
                          {event.team === 'home' ? homeCode : awayCode}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{event.description}</p>
                  </div>
                  <span className="flex-shrink-0 font-mono text-xs text-muted-foreground">
                    {event.minute}
                    {"'"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-secondary/45 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[11px] text-muted-foreground">{events.length} eventos registrados</span>
          <button className="text-[11px] font-medium text-primary hover:underline">
            Ver histórico completo
          </button>
        </div>
      </div>
    </div>
  )
}
