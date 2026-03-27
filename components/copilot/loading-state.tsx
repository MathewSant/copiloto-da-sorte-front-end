'use client'

import { RefreshCcw } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  mode: 'screen' | 'inline'
  title: string
  description: string
  className?: string
}

export function LoadingState({ mode, title, description, className }: LoadingStateProps) {
  if (mode === 'screen') {
    return (
      <div className={cn('absolute inset-0 z-20 flex items-center justify-center bg-background/90 backdrop-blur-sm', className)}>
        <div className="w-full max-w-md rounded-lg border border-border bg-card/95 p-6 shadow-2xl shadow-black/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md border border-primary/25 bg-primary/15">
              <Spinner className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="h-16 rounded-md bg-secondary/70 animate-pulse" />
            <div className="h-16 rounded-md bg-secondary/60 animate-pulse" />
            <div className="h-16 rounded-md bg-secondary/50 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('pointer-events-none absolute right-6 top-5 z-10 flex items-center gap-2 rounded-md border border-primary/25 bg-card/95 px-3 py-2 shadow-lg shadow-black/10 backdrop-blur-sm', className)}>
      <RefreshCcw className="h-3.5 w-3.5 animate-spin text-primary" />
      <div className="flex flex-col leading-none">
        <span className="text-[11px] font-semibold text-foreground">{title}</span>
        <span className="text-[10px] text-muted-foreground">{description}</span>
      </div>
    </div>
  )
}
