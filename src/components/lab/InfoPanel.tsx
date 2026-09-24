'use client'

import { useState } from 'react'
import { localPart, parseFullKey } from '@/lib/lab/engine/world'
import { getSystem, getTopic } from '@/lib/lab/topics/registry'
import { fmtTime, type QuizMode } from '@/lib/lab/quiz/engine'
import type { QuizState } from './BiologyLab'
import type { TopicDef, SystemDef } from '@/lib/lab/types'

export type PanelMode =
  | { kind: 'default' }
  | { kind: 'info'; partKey: string }
  | { kind: 'quiz-start' }
  | { kind: 'quiz-question' }
  | { kind: 'quiz-results' }
  | { kind: 'flow' }

export interface Feedback {
  html: string
  ok: boolean | null
}

interface Props {
  panel: PanelMode
  topic: TopicDef
  system: SystemDef
  quiz: QuizState
  feedback: Feedback | null
  elapsed: number
  nameOptions: string[]
  bestFor(mode: QuizMode): number
  historyFor(mode: QuizMode): number[]
  answered: { key: string; ok: boolean } | null
  nameOf(fullKey: string): string
  accent: string
  missedCount: number
  dueCount: number
  onReviewMissed(): void
  onReviewDue(): void
  onPrev(): void
  onNext(): void
  onStartQuiz(mode: QuizMode): void
  onCancel(): void
  onSkip(): void
  onEnd(): void
  onAnswer(key: string): void
  onChip(key: string): void
  onRetry(): void
  onNew(): void
  onShareCard(): void
}

function Dots({ quiz }: { quiz: QuizState }) {
  return (
    <div className="bio-q-dots">
      {quiz.order.map((k, i) => {
        const r = quiz.results[i]
        const cls = i < quiz.idx
          ? (r === 'ok' ? 'ok' : r === 'bad' ? 'bad' : '') // unanswered (ended early) stays gray
          : i === quiz.idx ? 'cur' : ''
        return <i key={k + i} className={cls} title={k} />
      })}
    </div>
  )
}

export default function InfoPanel(p: Props) {
  const { panel, system, topic } = p
  const [copied, setCopied] = useState(false)

  const shareResult = () => {
    if (panel.kind !== 'quiz-results') return
    const q = p.quiz
    const n = q.order.length
    const ok = q.results.filter(r => r === 'ok').length
    const pct = n ? Math.round(ok / n * 100) : 0
    const secs = Math.floor((performance.now() - q.t0) / 1000)
    const text = `🧬 Biology 3D Study Lab — ${topic.title} · ${q.mode} quiz\n✅ ${ok}/${n} (${pct}%) in ${fmtTime(secs)}\nTry it yourself!`
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  /* ── default panel ─────────────────────────────────────────────────── */
  if (panel.kind === 'default') {
    const best = Math.max(p.bestFor('name'), p.bestFor('find'), p.bestFor('mixed'))
    return (
      <aside className="bio-panel" style={{ ['--panel-accent' as string]: p.accent }}>
        <div className="bio-p-name">{system.short} Click any part</div>
        <div className="bio-p-sub">{system.name} · Interactive 3D study model</div>
        <div className="bio-p-fn">
          • Click a structure (or its label) → <b>name + function</b><br />
          • <b>◀ ▶</b> below step through all {system.order.length} parts<br />
          • <b>Separate</b> → pull the organs apart to study each one<br />
          • <b>Quiz</b> → name / find / mixed modes with scoring<br />
          • <b>X-Ray / Cross-Section</b> → look inside<br />
          {system.flowLabel && <>• <b>{system.flowLabel}</b> → animated route<br /></>}
        </div>
        {best > 0 && (
          <div className="bio-p-best">🏆 Your best quiz score: <b>{best}%</b></div>
        )}
      </aside>
    )
  }

  /* ── part info panel ───────────────────────────────────────────────── */
  if (panel.kind === 'info') {
    const { topic: tt, system: ss } = parseFullKey(panel.partKey)
    const sDef = getTopic(tt)?.systems.find(s => s.id === ss)
    const info = sDef?.info[localPart(panel.partKey)]
    if (!info) return null
    const n = sDef!.order.length
    const i = sDef!.order.indexOf(localPart(panel.partKey))
    const keyOf = (idx: number) => `${tt}:${ss}:${sDef!.order[idx]}`
    return (
      <aside className="bio-panel" style={{ ['--panel-accent' as string]: p.accent }}>
        <div className="bio-p-name">{info.name}</div>
        <div className="bio-p-sub">{sDef!.short} · {info.sub}</div>
        <div className="bio-p-fn" dangerouslySetInnerHTML={{ __html: info.fn }} />
        <div className="bio-p-nav">
          <button type="button" onClick={p.onPrev}>◀ {p.nameOf(keyOf((i - 1 + n) % n))}</button>
          <span>{i + 1} / {n}</span>
          <button type="button" onClick={p.onNext}>{p.nameOf(keyOf((i + 1) % n))} ▶</button>
        </div>
      </aside>
    )
  }

  /* ── flow panel ────────────────────────────────────────────────────── */
  if (panel.kind === 'flow') {
    if (!system.flowPanel) return null
    return (
      <aside className="bio-panel" style={{ ['--panel-accent' as string]: p.accent }}>
        <div className="bio-p-name">{system.flowPanel.title}</div>
        <div className="bio-p-sub">{system.flowPanel.subtitle}</div>
        <div className="bio-p-fn" dangerouslySetInnerHTML={{ __html: system.flowPanel.html }} />
      </aside>
    )
  }

  /* ── quiz start ────────────────────────────────────────────────────── */
  if (panel.kind === 'quiz-start') {
    return (
      <aside className="bio-panel" style={{ ['--panel-accent' as string]: p.accent }}>
        <div className="bio-p-name">🎯 Quiz</div>
        <div className="bio-p-sub">{system.short} · pick a mode</div>
        <div className="bio-q-opts">
          <button type="button" data-act="qname" onClick={() => p.onStartQuiz('name')}>
            <b>Name mode</b><br />A part glows — pick its name
            <em className="bio-em-best">best {p.bestFor('name')}%</em>
            {(() => { const h = p.historyFor('name').slice(-3); return h.length ? <em>recent {h.join(' · ')}%</em> : null })()}
          </button>
          <button type="button" data-act="qfind" onClick={() => p.onStartQuiz('find')}>
            <b>Find mode</b><br />I name a part — click it on the model
            <em className="bio-em-best">best {p.bestFor('find')}%</em>
            {(() => { const h = p.historyFor('find').slice(-3); return h.length ? <em>recent {h.join(' · ')}%</em> : null })()}
          </button>
          <button type="button" data-act="qmix" onClick={() => p.onStartQuiz('mixed')}>
            <b>Mixed mode</b><br />All systems in this topic
            <em className="bio-em-best">best {p.bestFor('mixed')}%</em>
            {(() => { const h = p.historyFor('mixed').slice(-3); return h.length ? <em>recent {h.join(' · ')}%</em> : null })()}
          </button>
          {p.missedCount > 0 && (
            <button type="button" className="bio-q-review" data-act="qreview" onClick={p.onReviewMissed}>
              <b>🔁 Review missed ({p.missedCount})</b><br />Re-test the parts you got wrong before
              <em className="bio-em-best">across sessions</em>
            </button>
          )}
          {p.dueCount > 0 && (
            <button type="button" className="bio-q-due" data-act="qdue" onClick={p.onReviewDue}>
              <b>📅 Spaced review ({p.dueCount})</b><br />Parts scheduled to refresh today
              <em className="bio-em-best">smart repetition</em>
            </button>
          )}
        </div>
        <div className="bio-q-actions">
          <button type="button" onClick={p.onCancel}>Cancel</button>
        </div>
      </aside>
    )
  }

  /* ── quiz question ─────────────────────────────────────────────────── */
  if (panel.kind === 'quiz-question') {
    const q = p.quiz
    const target = q.order[q.idx]
    const targetSys = getSystem(target)?.system
    const isInner = targetSys ? targetSys.inner.includes(localPart(target)) : false
    const label = q.mode === 'mixed' ? 'Quiz · Mixed' : q.mode === 'find' ? 'Quiz · Find' : 'Quiz · Name'
    const prog = q.order.length ? ((q.idx) / q.order.length) * 100 : 0
    return (
      <aside className="bio-panel" style={{ ['--panel-accent' as string]: p.accent }}>
        <div className="bio-q-head">
          <span>{label}</span>
          <span>{fmtTime(p.elapsed)}</span>
        </div>
        <div className="bio-q-progress" aria-hidden>
          <i style={{ width: `${prog}%` }} />
        </div>

        {q.mode === 'name' ? (
          <>
            <div className="bio-q-big">Which structure is <b>glowing ❓</b></div>
            <Dots quiz={q} />
            <div className="bio-q-opts">
              {p.nameOptions.map(k => {
                const isAnswered = p.answered && p.answered.key === k
                const cls = isAnswered ? (p.answered!.ok ? 'good' : 'bad') : ''
                return (
                  <button key={k} type="button" className={cls} onClick={() => p.onAnswer(k)} disabled={!!p.answered}>
                    {p.nameOf(k)}
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <div className="bio-q-big">Click the: <b>{p.nameOf(target)}</b></div>
            {isInner && (
              <div className="bio-q-hint">💡 It sits inside/behind another part — click straight through the outer layer.</div>
            )}
            <Dots quiz={q} />
          </>
        )}

        {p.feedback && (
          <div
            className={'bio-q-fb ' + (p.feedback.ok === true ? 'ok' : p.feedback.ok === false ? 'bad' : '')}
            dangerouslySetInnerHTML={{ __html: p.feedback.html }}
          />
        )}
        {!p.feedback && <div className="bio-q-fb">&nbsp;</div>}

        <div className="bio-q-actions">
          <button type="button" onClick={p.onSkip}>Skip</button>
          <button type="button" onClick={p.onEnd}>End quiz</button>
        </div>
      </aside>
    )
  }

  /* ── quiz results ──────────────────────────────────────────────────── */
  if (panel.kind === 'quiz-results') {
    const q = p.quiz
    const n = q.order.length
    const ok = q.results.filter(r => r === 'ok').length
    const pct = n ? Math.round(ok / n * 100) : 0
    const secs = Math.floor((performance.now() - q.t0) / 1000)
    const missed = q.lastMissed
    const R = 30
    const CIRC = 2 * Math.PI * R
    return (
      <aside className="bio-panel" style={{ ['--panel-accent' as string]: p.accent }}>
        <div className="bio-p-name">📋 Results</div>
        {n > 0 && (
          <div className="bio-donut-row">
            <div className="bio-donut" role="img" aria-label={`Score ${pct} percent`}>
              <svg width="74" height="74" viewBox="0 0 74 74">
                <circle className="bg" cx="37" cy="37" r={R} />
                <circle
                  className="fg"
                  cx="37" cy="37" r={R}
                  strokeDasharray={CIRC}
                  strokeDashoffset={CIRC * (1 - pct / 100)}
                />
              </svg>
              <b>{pct}%</b>
            </div>
            <div className="bio-donut-meta">
              <b>{ok} / {n}</b> correct · {fmtTime(secs)}<br />
              {q.record ? '🏆 New best score!' : pct >= 80 ? 'Strong work 👏' : pct >= 50 ? 'Keep going 💪' : 'Review and retry 🔄'}
            </div>
          </div>
        )}
        {n > 0 && <Dots quiz={{ ...q, idx: n }} />}
        {missed.length > 0 ? (
          <div className="bio-p-fn" style={{ marginTop: 8 }}>
            <b>Review:</b>{' '}
            {missed.map(k => (
              <button key={k} type="button" className="bio-chip" onClick={() => p.onChip(k)}>
                {p.nameOf(k)}
              </button>
            ))}
          </div>
        ) : n > 0 ? (
          pct === 100
            ? <div className="bio-q-fb ok">Perfect! 🎉</div>
            : <div className="bio-q-fb">Ended early — nothing new to review.</div>
        ) : null}
        <div className="bio-q-actions">
          {n > 0 && (
            <button type="button" onClick={shareResult} title="Copy result to clipboard">
              {copied ? '✅ Copied!' : '🔗 Share'}
            </button>
          )}
          {n > 0 && (
            <button type="button" className="bio-card-btn" onClick={p.onShareCard} title="Download a shareable score card image">
              📸 Card
            </button>
          )}
          {missed.length > 0 && <button type="button" onClick={p.onRetry}>Retry missed</button>}
          <button type="button" onClick={p.onNew}>New quiz</button>
          <button type="button" onClick={p.onCancel}>Done</button>
        </div>
      </aside>
    )
  }

  return null
}
