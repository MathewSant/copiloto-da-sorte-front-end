'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  CircleDot,
  Gauge,
  Globe,
  LayoutTemplate,
  MonitorPlay,
  QrCode,
  Radar,
  ShieldCheck,
  Sparkles,
  Waves,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type PitchStage = {
  id: number
  badge: string
  navLabel: string
  title: string
  cue: string
}

type ValueCardItem = {
  icon: LucideIcon
  title: string
  description: string
}

type MetricCardItem = {
  value: string
  label: string
}

type MarketCardItem = {
  label: string
  value: string
  hint: string
  tone?: 'default' | 'primary'
}

type SignalMeterItem = {
  label: string
  value: number
  tone: 'primary' | 'success' | 'warning'
}

const PITCH_SITE_URL = 'https://copiloto-da-sorte-front-end.vercel.app/'
const PITCH_SITE_LABEL = 'copiloto-da-sorte-front-end.vercel.app'

const stages: PitchStage[] = [
  {
    id: 1,
    badge: 'O PROBLEMA',
    navLabel: 'Dor',
    title: 'Quando o jogo acelera, o usuário perde a leitura.',
    cue: 'Dor clara',
  },
  {
    id: 2,
    badge: 'O PRODUTO',
    navLabel: 'Produto',
    title: 'Leitura explicável sincronizada com a partida.',
    cue: 'Valor do produto',
  },
  {
    id: 3,
    badge: 'PROVA REAL',
    navLabel: 'QR',
    title: 'Produto pronto para abrir e entender na hora.',
    cue: 'Acesso imediato',
  },
]

const problemCards: ValueCardItem[] = [
  {
    icon: BarChart3,
    title: 'Informação demais',
    description: 'Placar, odds, pressão e contexto aparecem juntos na mesma janela.',
  },
  {
    icon: Zap,
    title: 'Tempo de reação curto',
    description: 'No ao vivo, a leitura precisa acontecer em segundos, não em minutos.',
  },
  {
    icon: Sparkles,
    title: 'Síntese insuficiente',
    description: 'Sem uma camada de leitura, o usuário interpreta tudo manualmente.',
  },
]

const noiseMarkets: MarketCardItem[] = [
  { label: 'Vitória casa', value: '1.86', hint: '↓ 0.12' },
  { label: 'Empate', value: '3.40', hint: '↑ 0.05' },
  { label: 'Vitória fora', value: '5.20', hint: '↑ 0.18' },
  { label: 'Mais de 2.5 gols', value: '1.64', hint: '↓ 0.09' },
]

const productCards: ValueCardItem[] = [
  {
    icon: Radar,
    title: 'Lê o momento do jogo',
    description: 'Cruza sinais ao vivo e aponta quem está impondo ritmo agora.',
  },
  {
    icon: Sparkles,
    title: 'Explica o que mudou',
    description: 'A interface mostra o motivo da leitura com texto curto e visual forte.',
  },
  {
    icon: Waves,
    title: 'Atualiza junto com a partida',
    description: 'A cada nova janela, a interpretação se recalibra sem perder clareza.',
  },
]

const productMetrics: MetricCardItem[] = [
  { value: '20+', label: 'sinais lidos em conjunto' },
  { value: '5s', label: 'nova leitura do cenário' },
  { value: 'web', label: 'produto pronto para demo' },
]

const productMarkets: MarketCardItem[] = [
  { label: 'Casa', value: '1.72', hint: 'momento forte', tone: 'primary' },
  { label: 'Empate', value: '3.95', hint: 'mercado neutro' },
  { label: 'Fora', value: '5.60', hint: 'pressão baixa' },
]

const signalMeters: SignalMeterItem[] = [
  { label: 'Pressão ofensiva', value: 78, tone: 'primary' },
  { label: 'Risco de empate', value: 32, tone: 'warning' },
  { label: 'Confiança da leitura', value: 84, tone: 'success' },
]

const proofSteps: ValueCardItem[] = [
  {
    icon: QrCode,
    title: 'Escaneie o QR',
    description: 'Abra o site oficial do projeto direto no celular, sem fricção.',
  },
  {
    icon: Globe,
    title: 'Entre no produto',
    description: 'Navegação real, interface real e fluxo real, já publicados.',
  },
  {
    icon: ShieldCheck,
    title: 'Entenda em segundos',
    description: 'A proposta fica clara já no primeiro contato com a experiência.',
  },
]

function getStageIndexFromHash(hash: string): number | null {
  const parsed = Number(hash.replace('#', '').trim())
  if (!Number.isFinite(parsed)) return null
  if (parsed < 1 || parsed > stages.length) return null
  return parsed - 1
}

function toneClasses(tone: SignalMeterItem['tone']) {
  if (tone === 'success') {
    return {
      badge: 'border-success/30 bg-success/10 text-success',
      bar: 'bg-success',
    }
  }

  if (tone === 'warning') {
    return {
      badge: 'border-warning/30 bg-warning/10 text-warning',
      bar: 'bg-warning',
    }
  }

  return {
    badge: 'border-primary/30 bg-primary/10 text-primary',
    bar: 'bg-primary',
  }
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-primary bg-primary text-primary-foreground">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">Copiloto da Sorte</p>
                  <p className="text-[11px] text-muted-foreground">Leitura explicável para decisões ao vivo.</p>
                </div>
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

                <Button asChild size="sm" className="glow-neon">
                  <a href={PITCH_SITE_URL} target="_blank" rel="noreferrer">
                    Abrir site
                    <ArrowUpRight className="ml-1.5 h-4 w-4" />
                  </a>
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
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {stage.cue}
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
                    className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                      index === stageIndex ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    0{item.id}
                  </span>
                  {item.navLabel}
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
            </div>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            Atalhos: 1, 2 e 3 trocam as telas; seta direita avança; seta esquerda volta.
          </p>
        </footer>
      </div>
    </main>
  )
}

function StageBadge({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-bold tracking-[0.18em] text-primary">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}

function ValueCard({ icon: Icon, title, description }: ValueCardItem) {
  return (
    <div className="rounded-lg border border-primary/25 bg-card/70 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ value, label }: MetricCardItem) {
  return (
    <div className="rounded-lg border border-primary/25 bg-card/70 p-4">
      <p className="text-2xl font-extrabold uppercase text-primary">{value}</p>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  )
}

function MarketCard({ label, value, hint, tone = 'default' }: MarketCardItem) {
  const isPrimary = tone === 'primary'

  return (
    <div
      className={`rounded-lg border p-3 ${
        isPrimary ? 'border-primary/35 bg-primary/10' : 'border-border bg-background/55'
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className={`text-xl font-extrabold ${isPrimary ? 'text-primary' : 'text-foreground'}`}>{value}</p>
        <span
          className={`rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            isPrimary ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'
          }`}
        >
          {hint}
        </span>
      </div>
    </div>
  )
}

function SignalMeter({ label, value, tone }: SignalMeterItem) {
  const classes = toneClasses(tone)

  return (
    <div className="rounded-lg border border-border bg-background/55 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wide ${classes.badge}`}>
          {value}%
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded bg-secondary">
        <div className={`h-full rounded ${classes.bar}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function OpeningStage() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
      <article className="rounded-lg border border-primary/30 bg-background/25 p-5 sm:p-6">
        <StageBadge icon={CircleDot} label="O PROBLEMA" />

        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-foreground sm:text-5xl">
          Quando o jogo acelera,
          <br />
          o usuário perde a leitura.
        </h1>

        <p className="mt-6 max-w-3xl text-lg font-semibold leading-relaxed text-muted-foreground">
          Placar, odds, pressão, contexto e histórico aparecem na tela. O dado existe. O que falta é uma resposta
          simples: o que está acontecendo agora?
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {problemCards.map((item) => (
            <ValueCard key={item.title} {...item} />
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-primary/25 bg-primary/8 p-4">
          <p className="text-[11px] font-bold tracking-[0.16em] text-primary">LEITURA QUE FALTA</p>
          <p className="mt-1.5 text-base font-semibold text-foreground">
            Sem uma síntese visual, o usuário vê números corretos, mas ainda não entende o momento do jogo.
          </p>
        </div>
      </article>

      <article className="rounded-lg border border-border bg-background/25 p-5">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <p className="text-xs font-bold tracking-[0.18em] text-primary">COMO ISSO APARECE HOJE</p>
        </div>

        <div className="rounded-xl border border-primary/20 bg-navy-deep/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Painel ao vivo</p>
              <p className="mt-1 text-xl font-extrabold text-foreground">FLA 1 x 0 PAL</p>
            </div>
            <span className="rounded-md border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              67&apos; ao vivo
            </span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {noiseMarkets.map((item) => (
              <MarketCard key={item.label} {...item} />
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {['pressão alta', '8 finalizações', '56% posse', '12 ataques perigosos'].map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-border bg-background/60 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-primary/25 bg-card/70 p-4">
          <p className="text-[11px] font-bold tracking-[0.16em] text-primary">O QUE AINDA NÃO ESTÁ CLARO</p>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground">
            Quem está melhor, o que mudou e qual movimento realmente merece atenção agora.
          </p>
        </div>
      </article>
    </div>
  )
}

function PositioningStage() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_1.05fr]">
      <article className="rounded-lg border border-primary/30 bg-background/25 p-5 sm:p-6">
        <StageBadge icon={LayoutTemplate} label="O PRODUTO" />

        <h2 className="mt-4 text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
          Leitura explicável
          <br />
          sincronizada com a partida.
        </h2>

        <p className="mt-5 max-w-3xl text-lg font-semibold leading-relaxed text-muted-foreground">
          O Copiloto organiza sinais ao vivo e entrega uma leitura pronta: quem está melhor, por que essa leitura está
          forte e onde o jogo pode virar.
        </p>

        <div className="mt-6 space-y-3">
          {productCards.map((item) => (
            <ValueCard key={item.title} {...item} />
          ))}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {productMetrics.map((item) => (
            <MetricCard key={item.label} {...item} />
          ))}
        </div>
      </article>

      <article className="rounded-lg border border-border bg-background/25 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-xs font-bold tracking-[0.18em] text-primary">O QUE O JURADO VÊ</p>
        </div>

        <div className="rounded-xl border border-primary/25 bg-navy-deep/85 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Leitura do momento</p>
              <p className="mt-1 text-xl font-extrabold text-foreground">Mandante domina território ofensivo</p>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Ataques perigosos, posse e presença constante no último terço sustentam a leitura.
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-md border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" />
              atualizado agora
            </span>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-3 rounded-lg border border-primary/20 bg-background/55 p-4">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-primary" />
                <p className="text-sm font-bold text-foreground">Sinais que explicam a leitura</p>
              </div>

              {signalMeters.map((item) => (
                <SignalMeter key={item.label} {...item} />
              ))}

              <div className="flex flex-wrap gap-2 pt-1">
                {['12 ataques perigosos', '5 no alvo', '56% posse', 'ritmo alto'].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-primary/20 bg-background/55 p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <p className="text-sm font-bold text-foreground">Odds e leitura no mesmo fluxo</p>
              </div>

              <div className="mt-4 grid gap-2">
                {productMarkets.map((item) => (
                  <MarketCard key={item.label} {...item} />
                ))}
              </div>

              <div className="mt-4 rounded-lg border border-primary/25 bg-primary/8 p-4">
                <p className="text-[11px] font-bold tracking-[0.16em] text-primary">EM POUCOS SEGUNDOS</p>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                  O jurado entende quem está melhor, por que a leitura faz sentido e por que essa tela é útil.
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}

function ClosingStage() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
      <article className="rounded-lg border border-primary/30 bg-background/25 p-5 sm:p-6">
        <StageBadge icon={CheckCircle2} label="PROVA REAL" />

        <h2 className="mt-4 text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
          Produto pronto
          <br />
          para abrir no celular.
        </h2>

        <p className="mt-5 max-w-3xl text-lg font-semibold leading-relaxed text-muted-foreground">
          O melhor fechamento é simples: abrir o produto. O site está publicado, o fluxo está navegável e o valor da
          solução aparece na própria experiência.
        </p>

        <div className="mt-6 space-y-3">
          {proofSteps.map((item) => (
            <ValueCard key={item.title} {...item} />
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-primary/25 bg-primary/8 p-4">
          <p className="text-[11px] font-bold tracking-[0.16em] text-primary">FECHAMENTO</p>
          <p className="mt-1.5 text-base font-semibold text-foreground">
            Copiloto da Sorte transforma o jogo em leitura instantânea, explicável e pronta para usar.
          </p>
        </div>

        <Button asChild size="lg" className="mt-6 glow-neon">
          <a href={PITCH_SITE_URL} target="_blank" rel="noreferrer">
            Abrir experiência agora
            <ArrowUpRight className="ml-1.5 h-4 w-4" />
          </a>
        </Button>
      </article>

      <article className="flex flex-col rounded-lg border border-border bg-background/25 p-5">
        <div className="mb-4 flex items-center gap-2">
          <QrCode className="h-4 w-4 text-primary" />
          <p className="text-xs font-bold tracking-[0.18em] text-primary">ACESSO IMEDIATO</p>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-primary/35 bg-card/85 p-5 text-center">
          <div className="rounded-2xl bg-white p-3 shadow-[0_0_30px_rgba(99,102,241,0.18)]">
            <Image
              src="/qr/copiloto-site.svg"
              alt="QR code para acessar o site do Copiloto da Sorte"
              width={288}
              height={288}
              className="h-56 w-56 sm:h-64 sm:w-64"
            />
          </div>

          <p className="mt-4 text-lg font-semibold text-foreground">Escaneie e veja o produto ao vivo</p>

          <a
            href={PITCH_SITE_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-2 rounded-md border border-primary/35 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/15"
          >
            {PITCH_SITE_LABEL}
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {['site online', 'qr funcional', 'demo imediata'].map((item) => (
            <div key={item} className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">{item}</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  )
}
