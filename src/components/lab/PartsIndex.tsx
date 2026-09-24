'use client'

import { useMemo, useState } from 'react'
import type { PartMastery } from '@/lib/lab/quiz/engine'
import { masteryLevel } from '@/lib/lab/quiz/engine'
import type { SystemDef, TopicDef } from '@/lib/lab/types'

interface Props {
  open: boolean
  topic: TopicDef
  system: SystemDef
  mastery: Record<string, PartMastery>
  onSelect(fullKey: string): void
  onClose(): void
}

/**
 * Searchable index of every part in the active system, with per-part
 * mastery dots driven by quiz history (localStorage).
 */
export default function PartsIndex({ open, topic, system, mastery, onSelect, onClose }: Props) {
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    return system.order
      .map(key => ({
        key,
        full: `${topic.id}:${system.id}:${key}`,
        info: system.info[key],
      }))
      .filter(r => !!r.info)
      .filter(r => {
        if (!q.trim()) return true
        const needle = q.trim().toLowerCase()
        return (
          r.info!.name.toLowerCase().includes(needle) ||
          r.info!.sub.toLowerCase().includes(needle)
        )
      })
  }, [system, topic, q])

  const mastered = system.order.filter(k =>
    masteryLevel(mastery[`${topic.id}:${system.id}:${k}`]) === 'mastered').length

  if (!open) return null

  return (
    <aside
      className="bio-index" aria-label="Parts index"
      style={{ ['--panel-accent' as string]: system.accent ?? topic.accent }}
    >
      <div className="bio-index-head">
        <span className="bio-index-title">
          {system.short} Parts <b>{mastered}/{system.order.length}</b> 🏅
        </span>
        <button type="button" className="bio-index-close" onClick={onClose} aria-label="Close parts index">✕</button>
      </div>
      <input
        className="bio-index-search"
        type="search"
        placeholder="Search parts…"
        value={q}
        onChange={e => setQ(e.target.value)}
        aria-label="Search parts"
      />
      <div className="bio-index-list">
        {rows.length === 0 && <div className="bio-index-empty">No parts match “{q}”</div>}
        {rows.map(r => {
          const lvl = masteryLevel(mastery[r.full])
          return (
            <button
              key={r.full}
              type="button"
              className="bio-index-row"
              onClick={() => { onSelect(r.full); onClose() }}
              title={r.info!.sub}
            >
              <i className={'bio-dot ' + lvl} aria-hidden />
              <span className="bio-index-name">{r.info!.name}</span>
              <span className="bio-index-sub">{r.info!.sub}</span>
            </button>
          )
        })}
      </div>
      <div className="bio-index-legend">
        <span><i className="bio-dot new" /> untried</span>
        <span><i className="bio-dot learning" /> learning</span>
        <span><i className="bio-dot mastered" /> mastered</span>
      </div>
    </aside>
  )
}
