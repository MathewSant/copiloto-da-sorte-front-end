export interface Match {
  id: string
  homeTeam: string
  awayTeam: string
  homeCode: string
  awayCode: string
  homeLogoUrl?: string | null
  awayLogoUrl?: string | null
  homeScore: number | null
  awayScore: number | null
  minute: number | null
  periodLabel?: string | null
  status: 'live' | 'upcoming' | 'finished'
  kickoff?: string | null
  kickoffDateLabel?: string | null
  league: string
  leagueSlug: string
  leagueIcon: string
  homeOdds: number
  drawOdds: number
  awayOdds: number
  insight: string
  insightType: 'positive' | 'negative' | 'neutral' | 'warning'
  momentum: 'home' | 'away' | 'balanced'
  coverage: 'premium' | 'essencial'
  source?: string | null
  isSelected?: boolean
}

export interface Scenario {
  id: string
  title: string
  probability: number
  confidence: 'alta' | 'média' | 'baixa'
  trend: 'up' | 'down' | 'stable'
  description: string
  drivers: string[]
  change?: number
  changeLabel?: string | null
}

export interface TimelineEvent {
  id: string
  minute: number
  type: 'goal' | 'card' | 'substitution' | 'momentum' | 'insight'
  title: string
  description: string
  team?: 'home' | 'away'
  impact: 'high' | 'medium' | 'low'
}

export interface TeamStats {
  attack: number
  defense: number
  form: number
  pressure: number
  control: number
  danger: number
}

export interface RelatedMarket {
  name: string
  odds: number
  trend: 'hot' | 'up' | 'stable'
}

export interface RecentForm {
  home: Array<'W' | 'D' | 'L'>
  away: Array<'W' | 'D' | 'L'>
}

export interface H2HHistory {
  homeWins: number
  draws: number
  awayWins: number
  lastFive: Array<{
    homeTeam: string
    awayTeam: string
    home: number
    away: number
    date: string
  }>
}

export interface KeyPlayer {
  name: string
  team: 'home' | 'away'
  status: string
  impact: string
}

export interface LeagueContext {
  homePosition: number
  awayPosition: number
  homePoints: number
  awayPoints: number
  matchday: number
  totalMatchdays: number
  homeGoalDiff: string
  awayGoalDiff: string
}

export interface MonitoringItem {
  kind: 'insight' | 'watch'
  text: string
}

export interface CopilotHeadline {
  title: string
  summary: string
  confidence: 'alta' | 'média' | 'baixa'
  volatility: 'alta' | 'média' | 'baixa'
  updatedLabel: string
}

export interface LivePulseMetric {
  label: string
  value: string
  tone: 'positive' | 'negative' | 'warning' | 'neutral'
}

export interface LivePulse {
  summary: string
  windowLabel: string
  snapshotCount: number
  startMinute?: number | null
  endMinute?: number | null
  scoreShift?: string | null
  marketShift?: string | null
  pressureShift?: string | null
  drivers?: string[]
  metrics: LivePulseMetric[]
}

export interface LiveFieldSignal {
  key: string
  label: string
  homeValue: number
  awayValue: number
  unit: 'count' | 'pct'
  edge: 'home' | 'away' | 'balanced'
}

export interface LiveField {
  mode: 'advanced_xy' | 'proxy_pressure' | 'fallback_stats' | 'upcoming_waiting'
  sourceLabel: string
  coverageLabel: string
  hasAdvancedData: boolean
  advancedDataReason?: string | null
  ballX: number
  ballY: number
  intensity: number
  homePressure: number
  awayPressure: number
  momentum: 'home' | 'away' | 'balanced'
  stateLabel: string
  updateLabel: string
  vcCode?: string | null
  signals: LiveFieldSignal[]
}

export interface MatchDetailPayload {
  match: Match
  headline: CopilotHeadline
  livePulse?: LivePulse | null
  liveField?: LiveField | null
  scenarios: Scenario[]
  timeline: TimelineEvent[]
  homeStats: TeamStats
  awayStats: TeamStats
  relatedMarkets: RelatedMarket[]
  recentForm: RecentForm
  h2hHistory: H2HHistory
  keyPlayers: KeyPlayer[]
  leagueContext: LeagueContext
  monitoring: MonitoringItem[]
}

export interface BootstrapPayload {
  generatedAt: string
  sourceMode: string
  supportedLeagues: string[]
  selectedMatchId: string
  selectedMatchDetail?: MatchDetailPayload | null
  replayCount: number
  liveMatches: Match[]
  upcomingMatches: Match[]
}

export interface AssistantEvidence {
  label: string
  detail: string
}

export interface AssistantAnswerPayload {
  scope: 'selected_match' | 'my_round'
  title: string
  answer: string
  evidence: AssistantEvidence[]
  watchouts: string[]
  source: 'openai' | 'deterministic'
  model?: string | null
}

export interface PredictionAuditCoverage {
  snapshots: number
  events: number
  avgSnapshotsPerEvent: number
  minMinute: number | null
  maxMinute: number | null
}

export interface PredictionAuditProbabilityIntegrity {
  rowsChecked: number
  rowsWithSum100: number
  invalidRows: number
  invalidRatePct: number
}

export interface PredictionAuditCheckpoint {
  thresholdMinute: number
  totalEvents: number
  draws: number
  totalNonDraw: number
  marketHitsNonDraw: number
  scenarioHitsNonDraw: number
  marketAccuracyNonDrawPct: number
  scenarioAccuracyNonDrawPct: number
  marketAccuracyAllPct: number
  scenarioAccuracyAllPct: number
}

export interface PredictionAuditCalibrationBand {
  label: string
  sampleSize: number
  avgConfidencePct: number
  hitRatePct: number
  gapPct: number
}

export interface PredictionAuditCalibration {
  sampleSize: number
  weightedGapPct: number
  reliabilityPct: number
  bands: PredictionAuditCalibrationBand[]
}

export interface PredictionAuditInsightMetric {
  key: string
  label: string
  sampleSize: number
  hitRatePct: number
  rule: string
}

export interface PredictionAuditInsightValidation {
  windowMinutes: number
  sampleSize: number
  overallHitRatePct: number
  metrics: PredictionAuditInsightMetric[]
}

export interface PredictionAuditReport {
  generatedAt: string
  coverage: PredictionAuditCoverage
  probabilityIntegrity: PredictionAuditProbabilityIntegrity
  checkpoints: PredictionAuditCheckpoint[]
  calibration: PredictionAuditCalibration
  insightValidation: PredictionAuditInsightValidation
}
