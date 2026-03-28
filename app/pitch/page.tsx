'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleDot,
  LayoutTemplate,
  MonitorPlay,
  Play,
  QrCode,
  Sparkles,
  Timer,
  Trophy,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type PitchStage = {
  id: number
  badge: string
  title: string
  timeRange: string
}

const teamMembers = ['[Nome 1]', '[Nome 2]', '[Nome 3]']

const stages: PitchStage[] = [
  {
    id: 1,
    badge: 'ABERTURA',
    title: 'No ao vivo, sobra dado e falta clareza.',
    timeRange: '0:00 -> 0:25',
  },
  {
    id: 2,
    badge: 'POSICIONAMENTO',
    title: 'Não é chat. Não é painel. Não é palpite.',
    timeRange: '0:25 -> 0:45',
  },
  {
    id: 3,
    badge: 'FECHAMENTO',
    title: 'Produto real. Prova real.',
    timeRange: '4:05 -> 5:00',
  },
]

function getStageIndexFromHash(hash: string): number | null {
  const parsed = Number(hash.replace('#', '').trim())
  if (!Number.isFinite(parsed)) return null
  if (parsed < 1 || parsed > stages.length) return null
  return parsed - 1
}

export default function PitchPage() {
  const [stageIndex, setStageIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const stage = stages[stageIndex]

  useEffect(() => {
    const fromHash = getStageIndexFromHash(window.location.hash)
    if (fromHash !== null) {
      setStageIndex(fromHash)
    }
  }, [])

  useEffect(() => {
    window.location.hash = `#${stage.id}`
  }, [stage.id])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault()
        setStageIndex((current) => Math.min(stages.length - 1, current + 1))
        return
      }
      if (event.key === 'ArrowLeft' || event.key === 'Backspace') {
        event.preventDefault()
        setStageIndex((current) => Math.max(0, current - 1))
        return
      }
      if (event.key === '1' || event.key === '2' || event.key === '3') {
        event.preventDefault()
        setStageIndex(Number(event.key) - 1)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  const progressPercent = useMemo(() => ((stageIndex + 1) / stages.length) * 100, [stageIndex])

  const goNext = () => setStageIndex((current) => Math.min(stages.length - 1, current + 1))
  const goPrev = () => setStageIndex((current) => Math.max(0, current - 1))

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      return
    }
    await document.exitFullscreen()
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,#14186f_0%,#02003a_52%)] text-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-45">
        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-120px] h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-6">
        <header className="rounded-xl border border-border/90 bg-card/85 p-3 sm:p-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-primary bg-primary text-primary-foreground">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">Copiloto da Sorte</p>
                  <p className="text-[10px] font-bold tracking-[0.18em] text-primary">MODO PITCH</p>
                </div>
                <span className="rounded-md border border-primary/40 bg-primary/15 px-2 py-1 text-[10px] font-bold tracking-wide text-primary">
                  3 TELAS
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="border border-border bg-secondary text-foreground hover:bg-secondary/85"
                  onClick={() => void toggleFullscreen()}
                >
                  <MonitorPlay className="mr-1.5 h-4 w-4" />
                  {isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
                </Button>
                <Button asChild variant="default" size="sm" className="glow-neon">
                  <Link href="/">
                    <Play className="mr-1.5 h-4 w-4" />
                    Ir para demo
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="h-2 overflow-hidden rounded bg-background/60">
                <div
                  className="h-full rounded bg-primary transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="inline-flex items-center gap-2 rounded-md border border-border bg-background/40 px-2.5 py-1 text-xs text-muted-foreground">
                <Timer className="h-3.5 w-3.5 text-primary" />
                {stage.timeRange}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {stages.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStageIndex(index)}
                  className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold tracking-wide transition ${
                    index === stageIndex
                      ? 'border-primary/70 bg-primary/20 text-primary'
                      : 'border-border/70 bg-background/35 text-muted-foreground hover:border-primary/35 hover:text-foreground'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      index === stageIndex ? 'bg-primary animate-pulse-live' : 'bg-muted-foreground/60'
                    }`}
                  />
                  Fase {item.id}
                </button>
              ))}
            </div>
          </div>
        </header>

        <section className="mt-4 flex-1 rounded-xl border border-border/90 bg-card/75 p-4 sm:p-6 lg:p-8">
          {stageIndex === 0 ? <OpeningStage /> : null}
          {stageIndex === 1 ? <PositioningStage /> : null}
          {stageIndex === 2 ? <ClosingStage /> : null}
        </section>

        <footer className="mt-4 rounded-xl border border-border/90 bg-card/85 p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <span className="rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-[10px] font-bold tracking-[0.16em] text-primary">
                {stage.badge}
              </span>
              <p className="truncate text-sm font-semibold text-foreground">{stage.title}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="border border-border bg-secondary text-foreground hover:bg-secondary/85"
                onClick={goPrev}
                disabled={stageIndex === 0}
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Anterior
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="border border-border bg-secondary text-foreground hover:bg-secondary/85"
                onClick={goNext}
                disabled={stageIndex === stages.length - 1}
              >
                Próxima
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>

              <Button asChild size="sm" variant="outline" className="border-border text-foreground">
                <Link href="/prova">
                  <Trophy className="mr-1.5 h-4 w-4 text-primary" />
                  Abrir prova
                </Link>
              </Button>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Atalhos de teclado: 1 / 2 / 3 para fases, seta direita para avançar e seta esquerda para voltar.
          </p>
        </footer>
      </div>
    </main>
  )
}

function OpeningStage() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
      <article className="rounded-lg border border-primary/30 bg-background/25 p-5 sm:p-6">
        <span className="inline-flex items-center gap-2 rounded-md border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-bold tracking-[0.18em] text-primary">
          <CircleDot className="h-3.5 w-3.5" />
          ABERTURA
        </span>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-foreground sm:text-5xl">
          No ao vivo, sobra dado e falta clareza.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Copiloto da Sorte. Uma feature premium que traduz o jogo em leitura clara.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-border bg-card/70 p-4">
            <p className="text-[11px] font-semibold tracking-wide text-muted-foreground">SEM COPILOTO</p>
            <p className="mt-1 text-base font-semibold text-foreground">Muitos números, pouca leitura.</p>
            <p className="mt-1 text-sm text-muted-foreground">Usuário vê placar e odd, mas não entende o momento real.</p>
          </div>
          <div className="rounded-md border border-primary/35 bg-primary/10 p-4">
            <p className="text-[11px] font-semibold tracking-wide text-primary">COM COPILOTO</p>
            <p className="mt-1 text-base font-semibold text-foreground">Leitura simples, com contexto.</p>
            <p className="mt-1 text-sm text-muted-foreground">Mostra o que está acontecendo e por que isso importa.</p>
          </div>
        </div>
      </article>

      <article className="rounded-lg border border-border bg-background/25 p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold tracking-[0.18em] text-primary">EQUIPE</p>
          <span className="rounded-md border border-border bg-card/70 px-2 py-1 text-[11px] font-semibold text-muted-foreground">
            5 MIN DE PITCH
          </span>
        </div>

        <div className="space-y-2">
          {teamMembers.map((member) => (
            <div key={member} className="rounded-md border border-border bg-card/70 px-3 py-2 text-sm text-foreground">
              {member}
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-md border border-primary/30 bg-primary/10 p-3">
          <p className="text-[11px] font-bold tracking-[0.18em] text-primary">FALA SUGERIDA</p>
          <p className="text-sm font-semibold text-foreground">
            No ao vivo, o desafio não é falta de dado. É transformar dado em clareza para decisão.
          </p>
        </div>
      </article>
    </div>
  )
}

function PositioningStage() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
      <article className="rounded-lg border border-primary/30 bg-background/25 p-5 sm:p-6">
        <span className="inline-flex items-center gap-2 rounded-md border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-bold tracking-[0.18em] text-primary">
          <LayoutTemplate className="h-3.5 w-3.5" />
          POSICIONAMENTO
        </span>

        <h2 className="mt-4 text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
          Não é chat. Não é painel. Não é palpite.
        </h2>

        <div className="mt-6 grid gap-3">
          <div className="rounded-md border border-primary/30 bg-card/75 p-4">
            <p className="text-[11px] font-bold tracking-[0.18em] text-primary">01</p>
            <p className="mt-1 text-xl font-bold text-foreground">Interpreta o jogo</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Junta placar, ritmo e mercado em uma leitura única.
            </p>
          </div>
          <div className="rounded-md border border-primary/30 bg-card/75 p-4">
            <p className="text-[11px] font-bold tracking-[0.18em] text-primary">02</p>
            <p className="mt-1 text-xl font-bold text-foreground">Explica o porquê</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Mostra os fatores principais em linguagem curta e direta.
            </p>
          </div>
          <div className="rounded-md border border-primary/30 bg-card/75 p-4">
            <p className="text-[11px] font-bold tracking-[0.18em] text-primary">03</p>
            <p className="mt-1 text-xl font-bold text-foreground">Acompanha mudança de cenário</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Recalibra quando o jogo muda e mantém a leitura atualizada.
            </p>
          </div>
        </div>
      </article>

      <article className="rounded-lg border border-border bg-background/25 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-xs font-bold tracking-[0.18em] text-primary">ROTEIRO DA DEMO</p>
        </div>

        <ol className="space-y-2 text-sm text-foreground">
          <li className="rounded-md border border-border bg-card/70 p-3">1. Abrir lista ao vivo</li>
          <li className="rounded-md border border-border bg-card/70 p-3">2. Mostrar 2 jogos rapidamente</li>
          <li className="rounded-md border border-border bg-card/70 p-3">3. Entrar em uma partida</li>
          <li className="rounded-md border border-border bg-card/70 p-3">4. Mostrar leitura + cenários</li>
          <li className="rounded-md border border-border bg-card/70 p-3">5. Mostrar campo premium + perguntas</li>
          <li className="rounded-md border border-border bg-card/70 p-3">6. Abrir /prova e fechar no QR</li>
        </ol>

        <div className="mt-4 rounded-md border border-primary/30 bg-primary/10 p-3">
          <p className="text-[11px] font-bold tracking-[0.18em] text-primary">FALA SUGERIDA</p>
          <p className="text-sm text-foreground">
            Enquanto outros viram chat ou palpite seco, aqui a entrega é leitura explicável.
          </p>
        </div>
      </article>
    </div>
  )
}

function ClosingStage() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
      <article className="rounded-lg border border-primary/30 bg-background/25 p-5 sm:p-6">
        <span className="inline-flex items-center gap-2 rounded-md border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-bold tracking-[0.18em] text-primary">
          <CheckCircle2 className="h-3.5 w-3.5" />
          FECHAMENTO
        </span>

        <h2 className="mt-4 text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
          Produto real. Prova real.
        </h2>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-border bg-card/75 p-4">
            <p className="text-[11px] font-bold tracking-[0.18em] text-primary">PILAR 1</p>
            <p className="mt-1 text-base font-semibold text-foreground">Leitura explicável</p>
            <p className="mt-1 text-sm text-muted-foreground">Mostra o cenário e o motivo de forma clara.</p>
          </div>
          <div className="rounded-md border border-border bg-card/75 p-4">
            <p className="text-[11px] font-bold tracking-[0.18em] text-primary">PILAR 2</p>
            <p className="mt-1 text-base font-semibold text-foreground">Mudança de cenário</p>
            <p className="mt-1 text-sm text-muted-foreground">Acompanha o jogo ao vivo e recalibra a leitura.</p>
          </div>
          <div className="rounded-md border border-border bg-card/75 p-4">
            <p className="text-[11px] font-bold tracking-[0.18em] text-primary">PILAR 3</p>
            <p className="mt-1 text-base font-semibold text-foreground">Prova objetiva</p>
            <p className="mt-1 text-sm text-muted-foreground">Consistência real com base nas leituras do sistema.</p>
          </div>
        </div>

        <p className="mt-5 max-w-2xl text-base text-muted-foreground">
          O Copiloto da Sorte melhora leitura, reduz ruído e eleva a experiência do ao vivo dentro de uma sportsbook.
        </p>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Tudo rodando com dados reais do desafio, de forma dinâmica e atualizada.
        </p>
      </article>

      <article className="rounded-lg border border-border bg-background/25 p-5">
        <div className="mb-3 flex items-center gap-2">
          <QrCode className="h-4 w-4 text-primary" />
          <p className="text-xs font-bold tracking-[0.18em] text-primary">ACESSO AO PRODUTO</p>
        </div>

        <div className="flex aspect-square w-full items-center justify-center rounded-md border-2 border-dashed border-primary/45 bg-card/80 text-center">
          <div>
            <p className="text-sm font-semibold text-foreground">Inserir QR Code</p>
            <p className="mt-1 text-xs text-muted-foreground">acesso ao Copiloto ao vivo</p>
          </div>
        </div>

        <div className="mt-4 rounded-md border border-primary/30 bg-primary/10 px-3 py-2">
          <p className="text-[11px] font-bold tracking-[0.18em] text-primary">FALA FINAL</p>
          <p className="text-sm font-semibold text-foreground">Obrigado. Estamos à disposição.</p>
        </div>
      </article>
    </div>
  )
}
