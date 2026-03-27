'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, BarChart3, Database, Gauge, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react'
import { getPredictionAudit } from '@/lib/api'
import type { PredictionAuditCheckpoint, PredictionAuditReport } from '@/lib/copilot-types'

function formatPct(value: number): string {
  return `${value.toFixed(1).replace('.', ',')}%`
}

function formatInt(value: number): string {
  return value.toLocaleString('pt-BR')
}

function sortCheckpoints(checkpoints: PredictionAuditCheckpoint[]): PredictionAuditCheckpoint[] {
  return [...checkpoints].sort((a, b) => a.thresholdMinute - b.thresholdMinute)
}

export default function ProvaPage() {
  const [report, setReport] = useState<PredictionAuditReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadReport = async () => {
    setIsLoading(true)
    setError(null)
    const payload = await getPredictionAudit()
    if (!payload) {
      setError('Não foi possível carregar a prova agora. Verifique se a API está ativa.')
      setIsLoading(false)
      return
    }
    setReport(payload)
    setIsLoading(false)
  }

  useEffect(() => {
    void loadReport()
  }, [])

  const checkpoints = useMemo(() => sortCheckpoints(report?.checkpoints ?? []), [report?.checkpoints])
  const firstCheckpoint = checkpoints[0]
  const lastCheckpoint = checkpoints[checkpoints.length - 1]
  const scenarioLift =
    firstCheckpoint && lastCheckpoint
      ? lastCheckpoint.scenarioAccuracyNonDrawPct - firstCheckpoint.scenarioAccuracyNonDrawPct
      : null

  const topInsightMetrics = useMemo(() => {
    const metrics = report?.insightValidation?.metrics ?? []
    return [...metrics].sort((a, b) => b.sampleSize - a.sampleSize).slice(0, 3)
  }, [report?.insightValidation?.metrics])

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#0b0d59_0%,#02003a_55%)] text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-card/60 px-3 py-2 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Copiloto
            </Link>
            <span className="rounded-md border border-primary/45 bg-primary/15 px-3 py-1 text-xs font-bold tracking-wide text-primary">
              PROVA OBJETIVA
            </span>
          </div>
          <button
            type="button"
            onClick={() => void loadReport()}
            className="inline-flex items-center gap-2 rounded-md border border-border/80 bg-card/70 px-3 py-2 text-sm font-semibold text-foreground transition hover:border-primary/45 hover:text-primary disabled:opacity-60"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        <section className="mb-6 rounded-xl border border-primary/30 bg-card/75 p-5">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Prova de assertividade do Copiloto
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Aqui mostramos se a leitura acertou a direção do jogo, se o nível de confiança foi coerente com o
            resultado e se os insights se confirmaram nos minutos seguintes.
          </p>
          {report && (
            <p className="mt-3 text-xs text-muted-foreground">
              Atualizado em {new Date(report.generatedAt).toLocaleString('pt-BR', { hour12: false })}
            </p>
          )}
        </section>

        {error ? (
          <section className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
            {error}
          </section>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-border/80 bg-card/80 p-5">
            <div className="mb-3 flex items-center gap-2 text-primary">
              <Database className="h-4 w-4" />
              <span className="text-xs font-bold tracking-wide">COLETA REAL</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Leituras históricas de partidas reais para avaliar comportamento ao longo do tempo.
            </p>
            <div className="mt-4 space-y-2">
              <div className="text-3xl font-extrabold text-foreground">{report ? formatInt(report.coverage.snapshots) : '...'}</div>
              <div className="text-xs text-muted-foreground">leituras totais do jogo</div>
              <div className="text-sm text-foreground/90">
                {report ? `${formatInt(report.coverage.events)} partidas • média ${report.coverage.avgSnapshotsPerEvent} leituras por partida` : '...'}
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-border/80 bg-card/80 p-5">
            <div className="mb-3 flex items-center gap-2 text-primary">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-bold tracking-wide">INTEGRIDADE DA PROBABILIDADE</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Em cada leitura, casa/empate/fora precisam fechar em 100%. Isso evita distorção matemática.
            </p>
            <div className="mt-4 space-y-2">
              <div className="text-3xl font-extrabold text-primary">
                {report ? formatPct(100 - report.probabilityIntegrity.invalidRatePct) : '...'}
              </div>
              <div className="text-xs text-muted-foreground">leituras válidas</div>
              <div className="text-sm text-foreground/90">
                {report
                  ? `${formatInt(report.probabilityIntegrity.rowsWithSum100)} de ${formatInt(report.probabilityIntegrity.rowsChecked)}`
                  : '...'}
              </div>
            </div>
          </article>
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-2">
          <article className="rounded-xl border border-border/80 bg-card/80 p-5">
            <div className="mb-3 flex items-center gap-2 text-primary">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs font-bold tracking-wide">ACERTO DE DIREÇÃO</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Medimos se o lado indicado pelo Copiloto no minuto 45/60/75 bateu com o vencedor final.
            </p>
            <div className="mt-4 space-y-2">
              {checkpoints.length === 0 ? (
                <div className="text-sm text-muted-foreground">Sem checkpoints disponíveis.</div>
              ) : (
                checkpoints.map((checkpoint) => (
                  <div key={checkpoint.thresholdMinute} className="rounded-md border border-border/70 bg-background/25 p-2">
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span>{checkpoint.thresholdMinute}&apos;</span>
                      <span className="text-primary">{formatPct(checkpoint.scenarioAccuracyNonDrawPct)}</span>
                    </div>
                    <div className="mt-1 h-2 rounded bg-muted/40">
                      <div
                        className="h-2 rounded bg-primary"
                        style={{ width: `${Math.max(4, checkpoint.scenarioAccuracyNonDrawPct)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
            {lastCheckpoint ? (
              <p className="pt-3 text-xs text-muted-foreground">
                Base: {formatInt(lastCheckpoint.totalNonDraw)} partidas sem empate (entre{' '}
                {formatInt(lastCheckpoint.totalEvents)} partidas com fechamento a partir de 85&apos;).
              </p>
            ) : null}
          </article>

          <article className="rounded-xl border border-border/80 bg-card/80 p-5">
            <div className="mb-3 flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold tracking-wide">ACERTO DOS INSIGHTS</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Verificamos se o insight se confirmou na janela seguinte do jogo.
            </p>
            <div className="mt-4 space-y-2">
              <div className="text-3xl font-extrabold text-primary">
                {report ? formatPct(report.insightValidation.overallHitRatePct) : '...'}
              </div>
              <div className="text-xs text-muted-foreground">taxa geral de confirmação dos insights</div>
              <div className="text-sm text-foreground/90">
                {report
                  ? `${formatInt(report.insightValidation.sampleSize)} validações • janela de ${report.insightValidation.windowMinutes} minutos`
                  : '...'}
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {topInsightMetrics.map((metric) => (
                <div key={metric.key} className="rounded-md border border-border/70 bg-background/25 p-2">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span>{metric.label}</span>
                    <span className="text-primary">{formatPct(metric.hitRatePct)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatInt(metric.sampleSize)} validações
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-4 rounded-xl border border-border/80 bg-card/80 p-5">
          <div className="mb-3 flex items-center gap-2 text-primary">
            <Gauge className="h-4 w-4" />
            <span className="text-xs font-bold tracking-wide">CONFIANÇA X RESULTADO REAL</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Quando o sistema declara uma faixa de confiança, medimos se o acerto real daquela faixa ficou próximo.
          </p>
          <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {(report?.calibration.bands ?? []).map((band) => (
              <div key={band.label} className="rounded-md border border-border/70 bg-background/25 p-3">
                <p className="text-sm font-semibold text-foreground">{band.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatInt(band.sampleSize)} validações</p>
                <p className="mt-2 text-xs text-muted-foreground">Confiança média: {formatPct(band.avgConfidencePct)}</p>
                <p className="text-xs text-muted-foreground">Acerto real: {formatPct(band.hitRatePct)}</p>
              </div>
            ))}
          </div>
          {report ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Distância média entre confiança e resultado real: {formatPct(report.calibration.weightedGapPct)}.
              Índice de confiabilidade da confiança: {formatPct(report.calibration.reliabilityPct)}.
            </p>
          ) : null}
        </section>

        <section className="mt-6 rounded-xl border border-primary/35 bg-primary/10 p-5">
          <p className="text-xs font-bold tracking-wide text-primary">FRASE DE IMPACTO PARA O PITCH</p>
          <p className="mt-2 text-sm text-foreground sm:text-base">
            {report && firstCheckpoint && lastCheckpoint && scenarioLift !== null
              ? `Com ${formatInt(report.coverage.snapshots)} leituras reais, o acerto de direção sobe de ${formatPct(firstCheckpoint.scenarioAccuracyNonDrawPct)} aos ${firstCheckpoint.thresholdMinute}' para ${formatPct(lastCheckpoint.scenarioAccuracyNonDrawPct)} aos ${lastCheckpoint.thresholdMinute}'. Além disso, os insights se confirmam em ${formatPct(report.insightValidation.overallHitRatePct)} das validações e a confiança declarada se mantém consistente com o resultado real.`
              : 'Coletamos sinais reais do jogo, recalibramos continuamente e mostramos evolução de precisão de forma transparente.'}
          </p>
        </section>
      </div>
    </main>
  )
}
