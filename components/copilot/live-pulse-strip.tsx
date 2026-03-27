'use client'

import { Activity, RadioTower } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LivePulse } from '@/lib/copilot-types'

interface LivePulseStripProps {
  livePulse: LivePulse
}

export function LivePulseStrip({ livePulse }: LivePulseStripProps) {
  const toneClassName = {
    positive: 'border-success/30 bg-success/10 text-success',
    negative: 'border-destructive/30 bg-destructive/10 text-destructive',
    warning: 'border-warning/30 bg-warning/10 text-warning',
    neutral: 'border-border bg-secondary/70 text-muted-foreground',
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Janela Temporal</span>
            <span className="rounded-sm border border-primary/25 bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              {livePulse.windowLabel}
            </span>
            {livePulse.startMinute !== undefined && livePulse.endMinute !== undefined && (
              <span className="rounded-sm border border-border bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {livePulse.startMinute}' {'->'} {livePulse.endMinute}'
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{livePulse.summary}</p>
        </div>
        <div className="flex items-center gap-1.5 whitespace-nowrap text-[11px] text-muted-foreground">
          <RadioTower className="w-3.5 h-3.5 text-primary" />
          {livePulse.snapshotCount} snapshots
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {livePulse.scoreShift && (
          <div className="rounded-md border border-border bg-secondary/65 px-3 py-3">
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Placar</span>
            <span className="mt-1 block text-sm font-semibold text-foreground">{livePulse.scoreShift}</span>
          </div>
        )}
        {livePulse.marketShift && (
          <div className="rounded-md border border-border bg-secondary/65 px-3 py-3">
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Mercado</span>
            <span className="mt-1 block text-sm font-semibold text-foreground">{livePulse.marketShift}</span>
          </div>
        )}
        {livePulse.pressureShift && (
          <div className="rounded-md border border-border bg-secondary/65 px-3 py-3">
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Ataques perigosos</span>
            <span className="mt-1 block text-sm font-semibold text-foreground">{livePulse.pressureShift}</span>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {livePulse.metrics.slice(0, 4).map((metric) => (
          <div key={metric.label} className={cn('rounded-md border px-3 py-2', toneClassName[metric.tone])}>
            <span className="block text-[10px] uppercase tracking-wider">{metric.label}</span>
            <span className="mt-1 block text-sm font-semibold">{metric.value}</span>
          </div>
        ))}
      </div>

      {livePulse.drivers && livePulse.drivers.length > 0 && (
        <div className="mt-4 rounded-lg border border-border bg-secondary/30 p-3">
          <span className="mb-2 block text-[10px] uppercase tracking-wider text-muted-foreground">
            Drivers da Janela
          </span>
          <div className="space-y-1.5">
            {livePulse.drivers.slice(0, 3).map((driver) => (
              <div key={driver} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                <span className="text-xs text-foreground">{driver}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
