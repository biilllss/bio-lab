/**
 * Quiz engine — pure helpers used by the React layer.
 * The quiz works on FULL part keys (`topic:system:part`) so mixed mode can
 * draw questions from every system of the active topic.
 */

export type QuizMode = 'name' | 'find' | 'mixed'

/** Full quiz state held by the React layer. */
export interface QuizState {
  active: boolean
  mode: QuizMode
  /** System the quiz started on (full key) */
  sysKey: string
  /** Question order (full part keys) */
  order: string[]
  idx: number
  results: ('ok' | 'bad')[]
  locked: boolean
  t0: number
  prevLabels: boolean
  lastMode: QuizMode
  lastMissed: string[]
  record: boolean
}

export function shuffle<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.random() * (i + 1) | 0
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function sample<T>(arr: T[], n: number): T[] {
  return shuffle([...arr]).slice(0, n)
}

export const fmtTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

/* ── best-score persistence (localStorage, no backend needed) ──────────── */

const KEY_PREFIX = 'bio-lab-best:'

export function loadBest(topicId: string, mode: QuizMode | 'all'): number {
  if (typeof window === 'undefined') return 0
  const v = window.localStorage.getItem(KEY_PREFIX + topicId + ':' + mode)
  return v ? Number(v) : 0
}

export function saveBest(topicId: string, mode: QuizMode | 'all', pct: number): boolean {
  if (typeof window === 'undefined') return false
  const key = KEY_PREFIX + topicId + ':' + mode
  const prev = loadBest(topicId, mode)
  if (pct > prev) {
    window.localStorage.setItem(key, String(pct))
    return true // new record!
  }
  return false
}

/* ── per-part mastery (from quiz answers) ───────────────────────────────── */

export interface PartMastery {
  ok: number
  bad: number
  /** epoch ms of the last answer — drives spaced-repetition scheduling */
  at?: number
}

const MASTERY_KEY = 'bio-lab-mastery'

export function loadMastery(): Record<string, PartMastery> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem(MASTERY_KEY) ?? '{}')
  } catch {
    return {}
  }
}

/** Record one answered part. Returns the updated map. */
export function recordPartResult(partKey: string, ok: boolean): Record<string, PartMastery> {
  if (typeof window === 'undefined') return {}
  const all = loadMastery()
  const m = all[partKey] ?? { ok: 0, bad: 0 }
  if (ok) m.ok++
  else m.bad++
  m.at = Date.now()
  all[partKey] = m
  window.localStorage.setItem(MASTERY_KEY, JSON.stringify(all))
  return all
}

/** 'new' | 'learning' | 'mastered' */
export function masteryLevel(m?: PartMastery): 'new' | 'learning' | 'mastered' {
  if (!m || (m.ok === 0 && m.bad === 0)) return 'new'
  return m.ok > m.bad ? 'mastered' : 'learning'
}

/* ── spaced repetition (parts due for review) ───────────────────────── */

const DAY = 24 * 60 * 60 * 1000

/**
 * Is this part due for a spaced review?
 *   learning parts → refresh after 1 day
 *   mastered parts → refresh after 5 days
 *   never-answered parts are never "due" (they're new, not overdue)
 * Memoryless without `at` (older saves) — treat as learning-fresh.
 */
export function isDue(m?: PartMastery, now = Date.now()): boolean {
  if (!m || (m.ok === 0 && m.bad === 0) || !m.at) return false
  const age = now - m.at
  return masteryLevel(m) === 'mastered' ? age > 5 * DAY : age > DAY
}

/**
 * Fractional days until this part becomes due for review (∞ if never).
 * learning → due 1 day after the last answer, mastered → after 5 days.
 * Used by the StatsPanel "review forecast" chart.
 */
export function daysUntilDue(m?: PartMastery, now = Date.now()): number {
  if (!m || (m.ok === 0 && m.bad === 0) || !m.at) return Infinity
  const interval = masteryLevel(m) === 'mastered' ? 5 : 1
  return (m.at + interval * DAY - now) / DAY
}

/* ── quiz attempt history ───────────────────────────────────────────────── */

export interface QuizAttempt {
  topicId: string
  mode: QuizMode
  ok: number
  total: number
  pct: number
  secs: number
  at: number // epoch ms
}

const HISTORY_KEY = 'bio-lab-history'

export function loadHistory(): QuizAttempt[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(window.localStorage.getItem(HISTORY_KEY) ?? '[]')
  } catch {
    return []
  }
}

/** Push an attempt (keeps the last 30). */
export function recordAttempt(a: QuizAttempt): QuizAttempt[] {
  if (typeof window === 'undefined') return []
  const all = [...loadHistory(), a].slice(-30)
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(all))
  return all
}

/** Small summary for one topic+mode: [oldest…newest] percentages. */
export function modeHistory(topicId: string, mode: QuizMode): number[] {
  return loadHistory()
    .filter(a => a.topicId === topicId && a.mode === mode)
    .map(a => a.pct)
}

/* ── missed-parts memory (for "Review missed" across sessions) ──────────── */

const MISSED_KEY = 'bio-lab-missed'

export function loadMissed(topicId: string): string[] {
  if (typeof window === 'undefined') return []
  try {
    const all = JSON.parse(window.localStorage.getItem(MISSED_KEY) ?? '{}')
    return Array.isArray(all[topicId]) ? all[topicId] : []
  } catch {
    return []
  }
}

/** Remember the parts missed in the latest attempt of a topic (max 40). */
export function saveMissed(topicId: string, keys: string[]): void {
  if (typeof window === 'undefined') return
  try {
    const all = JSON.parse(window.localStorage.getItem(MISSED_KEY) ?? '{}')
    if (keys.length === 0) delete all[topicId]
    else all[topicId] = keys.slice(0, 40)
    window.localStorage.setItem(MISSED_KEY, JSON.stringify(all))
  } catch { /* private mode etc. — ignore */ }
}

/* ── study streak (consecutive days with a finished quiz) ───────────────── */

export interface Streak {
  count: number
  /** Local date `YYYY-MM-DD` of the last counted day */
  last: string
}

const STREAK_KEY = 'bio-lab-streak'

const dayStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export function loadStreak(): Streak {
  if (typeof window === 'undefined') return { count: 0, last: '' }
  try {
    const s = JSON.parse(window.localStorage.getItem(STREAK_KEY) ?? '{"count":0,"last":""}')
    return { count: Number(s.count) || 0, last: String(s.last ?? '') }
  } catch {
    return { count: 0, last: '' }
  }
}

/** Count today's finished quiz toward the streak. Returns the new streak. */
export function touchStreak(): Streak {
  if (typeof window === 'undefined') return { count: 0, last: '' }
  const today = dayStr(new Date())
  const s = loadStreak()
  if (s.last === today) return s // already counted today
  const y = new Date(); y.setDate(y.getDate() - 1)
  const next: Streak = { count: s.last === dayStr(y) ? s.count + 1 : 1, last: today }
  window.localStorage.setItem(STREAK_KEY, JSON.stringify(next))
  return next
}

/* ── study activity heatmap (quizzes finished per day) ──────────────────── */

const ACTIVITY_KEY = 'bio-lab-activity'

/** Map of `YYYY-MM-DD` → finished-quiz count. */
export function loadActivity(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem(ACTIVITY_KEY) ?? '{}')
  } catch {
    return {}
  }
}

/** Increment today's activity counter. Returns the updated map. */
export function bumpActivity(n = 1): Record<string, number> {
  if (typeof window === 'undefined') return {}
  const all = loadActivity()
  const today = dayStr(new Date())
  all[today] = (all[today] ?? 0) + n
  window.localStorage.setItem(ACTIVITY_KEY, JSON.stringify(all))
  return all
}

/* ── backup / restore (pairs with the export button in StatsPanel) ─────── */

/**
 * Collect every keyed best-score entry (`bio-lab-best:topic:mode` → pct)
 * so backups are truly complete — these live outside the four main keys.
 */
export function collectBestScores(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  const out: Record<string, number> = {}
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i)
    if (k && k.startsWith(KEY_PREFIX)) {
      const v = Number(window.localStorage.getItem(k))
      if (Number.isFinite(v) && v >= 0) out[k.slice(KEY_PREFIX.length)] = Math.floor(v)
    }
  }
  return out
}

export interface ProgressBackup {
  app: string
  version: number
  exportedAt: string
  mastery: Record<string, PartMastery>
  /** best-score keyed entries `topic:mode` → best % (v2+) */
  best?: Record<string, number>
  streak: Streak
  activity: Record<string, number>
  history: QuizAttempt[]
}

export interface RestoreResult {
  ok: boolean
  /** number of mastery records restored (0 when nothing was) */
  parts: number
  /** number of best-score entries restored (v2+ backups) */
  best: number
  error?: string
}

/**
 * Validate and restore a progress backup written by `exportProgress`.
 * Overwrites the four progress keys in localStorage only after the
 * payload passes shape validation, so a stray file can't wipe data.
 */
export function restoreProgress(data: unknown): RestoreResult {
  if (typeof window === 'undefined') return { ok: false, parts: 0, best: 0, error: 'no window' }
  try {
    const b = data as Partial<ProgressBackup>
    if (!b || b.app !== 'biology-3d-study-lab') {
      return { ok: false, parts: 0, best: 0, error: 'not a Biology 3D Study Lab backup' }
    }
    if (typeof b.mastery !== 'object' || b.mastery === null) {
      return { ok: false, parts: 0, best: 0, error: 'mastery data missing' }
    }
    // sanitize: keep only well-formed mastery records
    const mastery: Record<string, PartMastery> = {}
    for (const [k, v] of Object.entries(b.mastery)) {
      const m = v as Partial<PartMastery> | null
      if (m && typeof m.ok === 'number' && typeof m.bad === 'number') {
        mastery[k] = {
          ok: Math.max(0, Math.floor(m.ok)),
          bad: Math.max(0, Math.floor(m.bad)),
          ...(typeof m.at === 'number' ? { at: m.at } : {}),
        }
      }
    }
    const streak: Streak =
      b.streak && typeof b.streak.count === 'number' && typeof b.streak.last === 'string'
        ? { count: Math.max(0, Math.floor(b.streak.count)), last: b.streak.last }
        : { count: 0, last: '' }
    const activity: Record<string, number> = {}
    if (b.activity && typeof b.activity === 'object') {
      for (const [k, v] of Object.entries(b.activity)) {
        if (typeof v === 'number' && v > 0 && /^\d{4}-\d{2}-\d{2}$/.test(k)) activity[k] = Math.floor(v)
      }
    }
    const history: QuizAttempt[] = Array.isArray(b.history)
      ? b.history
          .filter(a => a && typeof a.topicId === 'string' && typeof a.pct === 'number' && typeof a.at === 'number')
          .slice(-30)
          .map(a => ({
            topicId: a.topicId, mode: (a.mode ?? 'mixed') as QuizMode, ok: a.ok ?? 0,
            total: a.total ?? 0, pct: a.pct ?? 0, secs: a.secs ?? 0, at: a.at!,
          }))
      : []
    // keyed best scores (v2+): `topic:mode` → pct, restored under the prefix
    let bestCount = 0
    if (b.best && typeof b.best === 'object') {
      for (const [k, v] of Object.entries(b.best)) {
        if (typeof v === 'number' && v >= 0 && v <= 100 && k.length > 0) {
          window.localStorage.setItem(KEY_PREFIX + k, String(Math.floor(v)))
          bestCount++
        }
      }
    }
    window.localStorage.setItem(MASTERY_KEY, JSON.stringify(mastery))
    window.localStorage.setItem(STREAK_KEY, JSON.stringify(streak))
    window.localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity))
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    return { ok: true, parts: Object.keys(mastery).length, best: bestCount }
  } catch (e) {
    return { ok: false, parts: 0, best: 0, error: e instanceof Error ? e.message : 'unreadable file' }
  }
}

/* ── danger zone: wipe all local progress ───────────────────────────────── */

const PROGRESS_KEYS = [
  KEY_PREFIX, // bio-lab-best:
]

export function clearAllProgress(): void {
  if (typeof window === 'undefined') return
  // keyed entries (best scores live under `bio-lab-best:topic:mode`)
  for (const prefix of PROGRESS_KEYS) {
    const kill: string[] = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i)
      if (k && k.startsWith(prefix)) kill.push(k)
    }
    kill.forEach(k => window.localStorage.removeItem(k))
  }
  window.localStorage.removeItem(MASTERY_KEY)
  window.localStorage.removeItem(HISTORY_KEY)
  window.localStorage.removeItem(MISSED_KEY)
  window.localStorage.removeItem(STREAK_KEY)
  window.localStorage.removeItem(ACTIVITY_KEY)
}


