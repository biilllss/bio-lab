'use client'

import { useEffect, useMemo, useState } from 'react'
import type { PartMastery } from '@/lib/lab/quiz/engine'
import { isDue, masteryLevel } from '@/lib/lab/quiz/engine'
import { requestTopicSnapshot } from '@/lib/lab/engine/snapshot'
import type { TopicDef } from '@/lib/lab/types'

interface Props {
  open: boolean
  topics: TopicDef[]
  activeTopicId: string
  mastery: Record<string, PartMastery>
  onOpen(topic: TopicDef, sysIdx?: number): void
  onClose(): void
}

/**
 * Per-card 3D preview: a tiny offscreen render of the topic's default
 * system (captured by engine/snapshot.ts) fading in behind the card
 * content, with a shimmer skeleton while the snapshot queue catches up.
 */
function CardPreview({ topic }: { topic: TopicDef }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    let alive = true
    const sys = topic.systems[topic.defaultSystem] ?? topic.systems[0]
    requestTopicSnapshot(topic.id, sys, u => {
      if (alive && u) setUrl(u)
    })
    return () => { alive = false }
  }, [topic])
  return (
    <div className="bio-card-preview" aria-hidden>
      {url ? (
        <img src={url} alt="" className="on" draggable={false} />
      ) : (
        <i className="bio-card-preview-sheen" />
      )}
      <i className="bio-card-preview-fade" />
    </div>
  )
}

export default function TopicMenu({ open, topics, activeTopicId, mastery, onOpen, onClose }: Props) {
  // search state must live above the `open` early-return (component is always mounted)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return topics
    return topics.filter(t =>
      [t.title, t.tagline, t.parts, t.description].some(s => s.toLowerCase().includes(q)))
  }, [topics, query])

  if (!open) return null
  const active = topics.find(t => t.id === activeTopicId)

  const masteredIn = (t: TopicDef): { done: number; total: number } => {
    let done = 0
    let total = 0
    for (const s of t.systems) {
      total += s.quizKeys.length
      done += s.quizKeys.filter(k => masteryLevel(mastery[`${t.id}:${s.id}:${k}`]) === 'mastered').length
    }
    return { done, total }
  }

  const dueIn = (t: TopicDef): number => {
    let n = 0
    for (const s of t.systems) {
      n += s.quizKeys.filter(k => isDue(mastery[`${t.id}:${s.id}:${k}`])).length
    }
    return n
  }

  return (
    <div className="bio-menu" role="dialog" aria-modal="true" aria-label="Choose a topic">
      <div className="bio-menu-box">
        <h1>Biology 3D Study Lab</h1>
        <p>
          Pick a topic to study — switch anytime with <b>☰ Menu</b>{' '}
          <span className="bio-menu-count">({topics.length} topics · more coming)</span>
        </p>
        <div className="bio-menu-search">
          <span aria-hidden>🔍</span>
          <input
            type="text"
            value={query}
            placeholder={`Search ${topics.length} topics — heart, eye, sweat…`}
            aria-label="Search topics"
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button type="button" aria-label="Clear search" onClick={() => setQuery('')}>✕</button>
          )}
        </div>
        <div className="bio-cards">
          {filtered.map(t => {
            const m = masteredIn(t)
            const due = dueIn(t)
            return (
              <div
                key={t.id}
                className={'bio-card' + (t.id === activeTopicId ? ' active' : '')}
                role="button"
                tabIndex={0}
                style={{ ['--card-accent' as string]: t.accent }}
                onClick={() => onOpen(t)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onOpen(t) }}
              >
                <CardPreview topic={t} />
                <div className="bio-card-ico" aria-hidden>{t.emoji}</div>
                <div className="bio-card-body">
                  <h2>
                    {t.title}
                    {m.done > 0 && m.done < m.total && <span className="bio-card-badge">🏅 {m.done}/{m.total}</span>}
                    {m.done === m.total && <span className="bio-card-win">🎉 100%</span>}
                    {due > 0 && <span className="bio-card-due">📅 {due} due</span>}
                  </h2>
                  <p>{t.tagline}</p>
                  <span>{t.parts}</span>
                  {m.done > 0 && (
                    <div
                      className="bio-card-mbar"
                      role="img"
                      aria-label={`${m.done} of ${m.total} parts mastered`}
                    >
                      <i style={{ width: `${Math.round(m.done / m.total * 100)}%` }} />
                    </div>
                  )}
                  {t.systems.length > 1 && (
                    <div className="bio-card-pills">
                      {t.systems.map((s, i) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={e => { e.stopPropagation(); onOpen(t, i) }}
                        >
                          {s.short}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        {filtered.length === 0 && (
          <div className="bio-menu-empty">No topic matches “{query}” — try “heart” or “sweat” 🧬</div>
        )}
        {active?.menuTip && (
          <p className="bio-menu-tip">{active.menuTip}</p>
        )}
        <button type="button" className="bio-menu-close" onClick={onClose}>✕ close</button>
      </div>
    </div>
  )
}
