'use client'

import type { TopicDef } from '@/lib/lab/types'

interface Props {
  topic: TopicDef
  systemHint: string
  labelsOn: boolean
  xrayOn: boolean
  cutOn: boolean
  explodeOn: boolean
  flowOn: boolean
  flowLabel: string
  muted: boolean
  quizActive: boolean
  hasMultipleSystems: boolean
  indexOn: boolean
  statsOn: boolean
  streak: number
  /** parts of any topic currently due for spaced review (drives the Progress dot) */
  dueCount: number
  onMenu(): void
  onSwap(): void
  onIndex(): void
  onStats(): void
  onLabels(): void
  onXray(): void
  onFlow(): void
  onCut(): void
  onExplode(): void
  onQuiz(): void
  onSound(): void
  onReset(): void
}

export default function TopBar(p: Props) {
  return (
    <header className="bio-topbar">
      <div className="bio-title">
        <h1>
          {p.topic.emoji} {p.topic.title} · 3D Study Lab
          {p.streak > 0 && <span className="bio-streak" title={`${p.streak}-day study streak`}>🔥 {p.streak}</span>}
        </h1>
        <p>{p.systemHint}</p>
      </div>
      <div className="bio-btns" role="toolbar" aria-label="Lab controls">
        <button type="button" onClick={p.onMenu} title="Menu (B)">☰ Menu</button>
        <button type="button" className={p.indexOn ? 'on' : ''} onClick={p.onIndex} title="Parts index (P)">🔎 Parts</button>
        <button type="button" className={p.statsOn ? 'on' : ''} onClick={p.onStats} title="Study progress (G)">📊 Progress{p.dueCount > 0 && <i className="bio-due-dot" aria-label={`${p.dueCount} parts due for review`} />}</button>
        {p.hasMultipleSystems && (
          <button type="button" onClick={p.onSwap} title="Switch system (1/2)">⇄ Swap</button>
        )}
        <button type="button" className={p.labelsOn ? '' : 'on'} onClick={p.onLabels} title="Toggle labels (L)">
          {p.labelsOn ? 'Hide Labels' : 'Show Labels'}
        </button>
        <button type="button" className={p.xrayOn ? 'on' : ''} onClick={p.onXray} title="X-ray (X)">X-Ray</button>
        <button type="button" className={p.flowOn ? 'on' : ''} onClick={p.onFlow} title={p.flowLabel + ' (S)'}>
          {p.flowOn ? 'Hide ' + p.flowLabel : p.flowLabel}
        </button>
        <button type="button" className={p.cutOn ? 'on' : ''} onClick={p.onCut} title="Cross-section (C)">Cross-Section</button>
        <button type="button" className={p.explodeOn ? 'on' : ''} onClick={p.onExplode} title="Separate (E)">Separate</button>
        <button type="button" className={p.quizActive ? 'on' : ''} onClick={p.onQuiz} title="Quiz (Q)">🎯 Quiz</button>
        <button type="button" onClick={p.onSound} title="Sound (M)" aria-label={p.muted ? 'Unmute' : 'Mute'}>
          {p.muted ? '🔇' : '🔊'}
        </button>
        <button type="button" onClick={p.onReset} title="Reset view (R)">Reset</button>
      </div>
    </header>
  )
}
