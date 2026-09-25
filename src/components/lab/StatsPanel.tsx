'use client'

import { useMemo, useRef, useState } from 'react'
import type { PartMastery, QuizAttempt, Streak } from '@/lib/lab/quiz/engine'
import { collectBestScores, daysUntilDue, masteryLevel, restoreProgress } from '@/lib/lab/quiz/engine'
import { downloadStatsCard } from '@/lib/lab/engine/sharecard'
import { TOPICS, getTopic } from '@/lib/lab/topics/registry'

interface Props {
  open: boolean
  topicId: string
  accent: string
  mastery: Record<string, PartMastery>
  streak: Streak
  activity: Record<string, number>
  history: QuizAttempt[]
  onClose(): void
  onReset(): void
  /** called after a backup file was validated & written to localStorage */
  onImport(): void
}

const dayStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const FC_LABELS = ['Today', 'Tmrw', '+2d', '+3d', '+4d', '+5d', '+6d']

function timeAgo(at: number): string {
  const s = Math.max(1, Math.floor((Date.now() - at) / 1000))
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

/** GitHub-style 4-week activity grid: one column per week, Mon..Sun rows. */
function Heatmap({ activity }: { activity: Record<string, number> }) {
  const weeks = useMemo(() => {
    const out: { key: string; count: number; label: string }[][] = []
    const today = new Date()
    // end at today, pad the last week so the grid ends on Sunday
    const end = new Date(today)
    end.setDate(end.getDate() + (7 - ((end.getDay() + 6) % 7) - 1)) // next Sunday
    for (let w = 3; w >= 0; w--) {
      const col: { key: string; count: number; label: string }[] = []
      for (let d = 6; d >= 0; d--) {
        const day = new Date(end)
        day.setDate(end.getDate() - (w * 7 + d))
        const key = dayStr(day)
        const future = day > today
        col.push({
          key,
          count: future ? -1 : activity[key] ?? 0,
          label: future ? '' : `${activity[key] ?? 0} quiz${(activity[key] ?? 0) === 1 ? '' : 'zes'} · ${key}`,
        })
      }
      out.push(col)
    }
    return out
  }, [activity])

  return (
    <div className="bio-heat" role="img" aria-label="Study activity of the last four weeks">
      {weeks.map((col, i) => (
        <div key={i} className="bio-heat-col">
          {col.map(c => (
            <i
              key={c.key}
              className={'bio-heat-cell' + (c.count < 0 ? ' future' : c.count === 0 ? '' : ` lv${Math.min(3, c.count)}`)}
              title={c.label}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * Progress dashboard: streak + activity heatmap, per-topic mastery bars,
 * recent quiz attempts and a reset button (two-step confirm).
 */
export default function StatsPanel(p: Props) {
  const [confirmReset, setConfirmReset] = useState(false)
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const importTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  if (!p.open) return null

  /* per-topic mastery roll-up */
  const topics = TOPICS.map(t => {
    let done = 0, total = 0
    for (const s of t.systems) {
      total += s.quizKeys.length
      done += s.quizKeys.filter(k => masteryLevel(p.mastery[`${t.id}:${s.id}:${k}`]) === 'mastered').length
    }
    return { t, done, total }
  })
  const allDone = topics.reduce((a, x) => a + x.done, 0)
  const allTotal = topics.reduce((a, x) => a + x.total, 0)

  /* study totals */
  const totalQuizzes = p.history.length
  const avg5 = totalQuizzes
    ? Math.round(p.history.slice(-5).reduce((a, x) => a + x.pct, 0) / Math.min(5, totalQuizzes))
    : 0

  /* spaced-repetition forecast: parts becoming due on each of the next 7 days
     (plain computation — the panel early-returns when closed, so no hooks here) */
  const forecastBuckets = Array.from({ length: 7 }, () => 0)
  for (const t of TOPICS) {
    for (const s of t.systems) {
      for (const k of s.quizKeys) {
        const d = daysUntilDue(p.mastery[`${t.id}:${s.id}:${k}`])
        if (d === Infinity) continue
        const day = Math.max(0, Math.min(6, Math.floor(d)))
        forecastBuckets[day]++
      }
    }
  }
  const forecast = forecastBuckets
  const fcTotal = forecast.reduce((a, b) => a + b, 0)
  const maxFc = Math.max(...forecast)

  const askReset = () => {
    if (confirmReset) {
      p.onReset()
      setConfirmReset(false)
    } else {
      setConfirmReset(true)
      confirmTimer.current = setTimeout(() => setConfirmReset(false), 4000)
    }
  }

  /* download the whole study profile as JSON (backup / move between devices) */
  const exportProgress = () => {
    const payload = {
      app: 'biology-3d-study-lab',
      version: 2,
      exportedAt: new Date().toISOString(),
      mastery: p.mastery,
      best: collectBestScores(),
      streak: p.streak,
      activity: p.activity,
      history: p.history,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bio-lab-progress-${dayStr(new Date())}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  /* 📸 overall study-stats share card (PNG download) */
  const shareStatsCard = () => {
    downloadStatsCard({
      streak: p.streak.count,
      quizzes: totalQuizzes,
      avgPct: avg5,
      mastered: allDone,
      totalParts: allTotal,
      topics: topics.map(({ t, done, total }) => ({ emoji: t.emoji, title: t.title, done, total, accent: t.accent })),
      accent: p.accent,
      filename: 'bio-lab-study-stats.png',
    })
  }

  /* restore a previously exported backup file (validates before writing) */
  const importProgress = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      let msg: { ok: boolean; text: string }
      try {
        const data = JSON.parse(String(reader.result))
        const res = restoreProgress(data)
        if (res.ok) {
          p.onImport()
          const best = res.best > 0 ? ` · ${res.best} best score${res.best === 1 ? '' : 's'}` : ''
          msg = { ok: true, text: `✅ Restored ${res.parts} part record${res.parts === 1 ? '' : 's'}${best} + history` }
        } else {
          msg = { ok: false, text: `⚠️ ${res.error}` }
        }
      } catch {
        msg = { ok: false, text: '⚠️ Not a valid JSON file' }
      }
      setImportMsg(msg)
      if (importTimer.current) clearTimeout(importTimer.current)
      importTimer.current = setTimeout(() => setImportMsg(null), 5000)
    }
    reader.readAsText(file)
  }

  return (
    <aside
      className="bio-index bio-stats" aria-label="Study progress"
      style={{ ['--panel-accent' as string]: p.accent }}
    >
      <div className="bio-index-head">
        <span className="bio-index-title">📊 Study Progress</span>
        <button type="button" className="bio-index-close" onClick={p.onClose} aria-label="Close progress panel">✕</button>
      </div>

      <div className="bio-stats-scroll">
        {/* streak + heatmap */}
        <section className="bio-stats-sec">
          <h3>
            <span className="bio-streak bio-streak-inline">🔥 {p.streak.count}</span>
            <em>day study streak</em>
            <span className="bio-stats-tot">{totalQuizzes} quizzes · avg {avg5}%</span>
          </h3>
          <Heatmap activity={p.activity} />
          <div className="bio-heat-legend">
            <span>4 weeks ago</span>
            <span className="bio-heat-swatch">
              <i /><i className="lv1" /><i className="lv2" /><i className="lv3" />
            </span>
            <span>today</span>
          </div>
        </section>

        {/* spaced-repetition review forecast */}
        <section className="bio-stats-sec">
          <h3>📅 Review forecast <span className="bio-stats-tot">{fcTotal} due this week</span></h3>
          {fcTotal === 0 ? (
            <div className="bio-index-empty">Nothing due — answer some quizzes to build a schedule 🗓️</div>
          ) : (
            <div className="bio-fc" role="img" aria-label={`Parts due for review over the next week: ${fcTotal}`}>
              {forecast.map((c, i) => (
                <div key={i} className="bio-fc-col" title={`${c} part${c === 1 ? '' : 's'} due ${FC_LABELS[i].toLowerCase()}`}>
                  <span className="bio-fc-n">{c || ''}</span>
                  <i className="bio-fc-bar" style={{ height: `${maxFc ? Math.max(6, Math.round(c / maxFc * 44)) : 0}px` }} />
                  <span className="bio-fc-lbl">{FC_LABELS[i]}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* mastery per topic */}
        <section className="bio-stats-sec">
          <h3>Mastery <span className="bio-stats-tot">{allDone}/{allTotal} parts 🏅</span></h3>
          {topics.map(({ t, done, total }) => (
            <div key={t.id} className={'bio-mrow' + (t.id === p.topicId ? ' current' : '')}>
              <span className="bio-mrow-name">{t.emoji} {t.title}</span>
              <div className="bio-mbar">
                <div className="bio-mbar-fill" style={{ width: `${total ? done / total * 100 : 0}%` }} />
              </div>
              <span className="bio-mrow-num">{done}/{total}</span>
            </div>
          ))}
        </section>

        {/* recent attempts */}
        <section className="bio-stats-sec">
          <h3>Recent quizzes</h3>
          {totalQuizzes === 0 && (
            <div className="bio-index-empty">Finish a quiz to fill this in 🎯</div>
          )}
          {[...p.history].reverse().slice(0, 8).map((a, i) => {
            const t = getTopic(a.topicId)
            return (
              <div key={a.at + '-' + i} className="bio-arow">
                <span className="bio-arow-ico">{t?.emoji ?? '🧬'}</span>
                <span className="bio-arow-mode">{a.mode}</span>
                <span className={'bio-arow-pct ' + (a.pct >= 80 ? 'hi' : a.pct >= 50 ? 'mid' : 'lo')}>{a.pct}%</span>
                <span className="bio-arow-sub">{a.ok}/{a.total} · {a.secs}s · {timeAgo(a.at)}</span>
              </div>
            )
          })}
        </section>

        {/* backup + danger zone */}
        <section className="bio-stats-sec bio-stats-danger">
          <div className="bio-backup-btns">
            <button
              type="button"
              className="bio-export"
              onClick={exportProgress}
              title="Download your progress as a JSON file"
            >
              ⬇️ Export
            </button>
            <button
              type="button"
              className="bio-import"
              onClick={() => fileRef.current?.click()}
              title="Restore a previously exported JSON backup"
            >
              ⬆️ Import
            </button>
            <button
              type="button"
              className="bio-stats-share"
              onClick={shareStatsCard}
              title="Download a shareable study-stats card image"
            >
              📸 Card
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              aria-label="Import progress backup file"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) importProgress(f)
                e.target.value = '' // allow re-selecting the same file
              }}
            />
          </div>
          <button
            type="button"
            className={'bio-reset' + (confirmReset ? ' arm' : '')}
            onClick={askReset}
          >
            {confirmReset ? '⚠️ Really wipe everything?' : '🧹 Reset all progress'}
          </button>
        </section>
        {importMsg && (
          <div className={'bio-import-status ' + (importMsg.ok ? 'ok' : 'bad')} role="status">
            {importMsg.text}
          </div>
        )}
      </div>
    </aside>
  )
}
