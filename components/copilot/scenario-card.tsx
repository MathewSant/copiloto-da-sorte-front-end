'use client'

import { ChevronRight, Minus, Sparkles, TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Scenario } from '@/lib/copilot-types'

interface ScenarioCardProps {
  scenario: Scenario
  isExpanded?: boolean
  onToggle?: () => void
}

export function ScenarioCard({ scenario, isExpanded, onToggle }: ScenarioCardProps) {
  const trendIcon = {
    up: <TrendingUp className="w-4 h-4 text-success" />,
    down: <TrendingDown className="w-4 h-4 text-destructive" />,
    stable: <Minus className="w-4 h-4 text-muted-foreground" />,
  }

  const confidenceColor = {
    alta: 'border-success/30 bg-success/20 text-success',
    média: 'border-warning/30 bg-warning/20 text-warning',
    baixa: 'border-border bg-muted text-muted-foreground',
  }

  const probabilityColor =
    scenario.probability >= 60
      ? 'text-success'
      : scenario.probability >= 40
      ? 'text-warning'
      : 'text-muted-foreground'

  return (
    <div
      className={cn(
        'cursor-pointer overflow-hidden rounded-lg border bg-card transition-all duration-300 hover:border-primary/45',
        isExpanded ? 'border-primary shadow-[0_0_0_1px_rgb(46_230_131_/_0.2)]' : 'border-border'
      )}
      onClick={onToggle}
    >
      <div className="p-4">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-primary/25 bg-primary/12">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground">{scenario.title}</h3>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    'rounded-sm border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                    confidenceColor[scenario.confidence]
                  )}
                >
                  Confiança {scenario.confidence}
                </span>
                {trendIcon[scenario.trend]}
                {scenario.changeLabel && (
                  <span className="text-[10px] font-medium text-primary">{scenario.changeLabel}</span>
                )}
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className={cn('text-[30px] font-black tabular-nums leading-none', probabilityColor)}>
              {scenario.probability}%
            </span>
            <span className="mt-0.5 block text-[10px] text-muted-foreground">probabilidade</span>
          </div>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              scenario.probability >= 60
                ? 'bg-success'
                : scenario.probability >= 40
                ? 'bg-warning'
                : 'bg-muted-foreground'
            )}
            style={{ width: `${scenario.probability}%` }}
          />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{scenario.description}</p>

        <div className="mt-3 flex items-center justify-center">
          <div
            className={cn(
              'flex items-center gap-1 text-xs text-muted-foreground transition-all',
              isExpanded && 'text-primary'
            )}
          >
            <span>Entender cenário</span>
            <ChevronRight
              className={cn('w-3.5 h-3.5 transition-transform', isExpanded && 'rotate-90')}
            />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border bg-secondary/50 p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            O que pesa nessa leitura?
          </h4>
          <ul className="space-y-2">
            {scenario.drivers.map((driver, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                <span className="text-sm text-foreground">{driver}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
