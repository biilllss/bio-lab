'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { LabWorld, localPart, parseFullKey } from '@/lib/lab/engine/world'
import { burstConfetti } from '@/lib/lab/engine/confetti'
import { downloadShareCard } from '@/lib/lab/engine/sharecard'
import { requestTopicSnapshot } from '@/lib/lab/engine/snapshot'
import { TOPICS, getSystem, getTopic, partKey } from '@/lib/lab/topics/registry'
import type { TopicDef } from '@/lib/lab/types'
import { loadMuted, saveMuted, setMuted, sndBad, sndEnd, sndOk } from '@/lib/lab/engine/sound'
import {
  bumpActivity, clearAllProgress, isDue, loadActivity, loadBest, loadHistory, loadMissed,
  loadMastery, loadStreak, modeHistory, recordAttempt, recordPartResult, sample,
  saveBest, saveMissed, shuffle, touchStreak,
  type PartMastery, type QuizAttempt, type QuizMode, type QuizState,
  type Streak,
} from '@/lib/lab/quiz/engine'
import TopBar from './TopBar'
import TopicMenu from './TopicMenu'
import InfoPanel, { type Feedback } from './InfoPanel'
import PartsIndex from './PartsIndex'
import StatsPanel from './StatsPanel'
import RangeBar from './RangeBar'
import HintOverlay from './HintOverlay'

export type { QuizState }

type PanelMode =
  | { kind: 'default' }
  | { kind: 'info'; partKey: string }
  | { kind: 'quiz-start' }
  | { kind: 'quiz-question' }
  | { kind: 'quiz-results' }
  | { kind: 'flow' }

const QUIZ_NONE: QuizState = {
  active: false, mode: 'find', sysKey: '', order: [], idx: 0, results: [],
  locked: false, t0: 0, prevLabels: true, lastMode: 'find', lastMissed: [], record: false,
}

/** `#rrggbb` → `rgba(r,g,b,a)` — used for the per-topic background tint. */
function hexA(hex: string, a: number): string {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

export default function BiologyLab() {
  const mountRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<LabWorld | null>(null)
  const nextTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [ready, setReady] = useState(false)

  /* ── UI state ─────────────────────────────────────────────────────────── */
  const [menuOpen, setMenuOpen] = useState(true)
  const [topicId, setTopicId] = useState(TOPICS[0].id)
  const [systemKey, setSystemKey] = useState(
    partKey(TOPICS[0].id, TOPICS[0].systems[TOPICS[0].defaultSystem].id, ''))
  const [panel, setPanel] = useState<PanelMode>({ kind: 'default' })
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [labelsOn, setLabelsOn] = useState(true)
  const [xrayOn, setXrayOn] = useState(false)
  const [cutOn, setCutOn] = useState(false)
  const [cutValue, setCutValue] = useState(0.15)
  const [explodeOn, setExplodeOn] = useState(false)
  const [explodeValue, setExplodeValue] = useState(0.6)
  const [flowOn, setFlowOn] = useState(false)
  const [muted, setMutedState] = useState(false)
  const [quiz, setQuiz] = useState<QuizState>(QUIZ_NONE)
  const [elapsed, setElapsed] = useState(0)
  const [nameOptions, setNameOptions] = useState<string[]>([])
  const [indexOpen, setIndexOpen] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const [mastery, setMastery] = useState<Record<string, PartMastery>>({})
  const [answered, setAnswered] = useState<{ key: string; ok: boolean } | null>(null)
  const [streak, setStreak] = useState<Streak>({ count: 0, last: '' })
  const [missedKeys, setMissedKeys] = useState<string[]>([])
  const [activity, setActivity] = useState<Record<string, number>>({})
  const [history, setHistory] = useState<QuizAttempt[]>([])
  const masteryRef = useRef(mastery)
  masteryRef.current = mastery
  const snapshotRef = useRef<string>('')

  const topic = getTopic(topicId) ?? TOPICS[0]
  const system = getSystem(systemKey)?.system ?? topic.systems[0]

  /* spaced repetition: parts of this topic due for review (recomputed on answers) */
  const dueKeys = useMemo(() => {
    const t = getTopic(topicId)
    if (!t) return []
    return t.systems
      .flatMap(s => s.quizKeys.map(k => partKey(t.id, s.id, k)))
      .filter(k => isDue(mastery[k]))
  }, [topicId, mastery])

  /* spaced repetition across ALL topics — drives the Progress-button dot */
  const dueTotal = useMemo(() => {
    let n = 0
    for (const t of TOPICS) {
      for (const s of t.systems) {
        for (const k of s.quizKeys) {
          if (isDue(mastery[partKey(t.id, s.id, k)])) n++
        }
      }
    }
    return n
  }, [mastery])

  /* ── latest-state mirror for stable callbacks ─────────────────────────── */
  const st = useRef({ labelsOn, xrayOn, cutOn, cutValue, explodeOn, explodeValue, flowOn, muted, quiz, systemKey, topicId, menuOpen })
  st.current = { labelsOn, xrayOn, cutOn, cutValue, explodeOn, explodeValue, flowOn, muted, quiz, systemKey, topicId, menuOpen }
  const handlersRef = useRef<{ onPick: (k: string[]) => void; onLabelClick: (k: string) => void }>({ onPick: () => {}, onLabelClick: () => {} })

  /* ── helpers ──────────────────────────────────────────────────────────── */
  const nameOf = (fullKey: string): string => {
    const s = getSystem(fullKey)
    return s ? s.system.info[localPart(fullKey)]?.name ?? localPart(fullKey) : fullKey
  }
  const bestFor = (mode: QuizMode): number => loadBest(st.current.topicId, mode)
  const historyFor = (mode: QuizMode): number[] => modeHistory(st.current.topicId, mode)

  /* 📸 share card: render the finished quiz as a downloadable PNG */
  const shareCard = () => {
    const q = st.current.quiz
    const n = q.order.length || 1
    const ok = q.results.filter(r => r === 'ok').length
    const t = getTopic(st.current.topicId)
    if (!t) return
    let mastered = 0, totalParts = 0
    for (const tt of TOPICS) {
      for (const s of tt.systems) {
        totalParts += s.quizKeys.length
        mastered += s.quizKeys.filter(k => {
          const m = masteryRef.current[partKey(tt.id, s.id, k)]
          return m && m.ok > m.bad
        }).length
      }
    }
    const sys = getSystem(st.current.systemKey)?.system ?? t.systems[t.defaultSystem]
    downloadShareCard({
      emoji: t.emoji,
      title: t.title,
      accent: t.accent,
      mode: q.lastMode || q.mode,
      ok, total: q.order.length, pct: Math.round(ok / n * 100),
      secs: Math.floor((performance.now() - q.t0) / 1000),
      streak: loadStreak().count,
      mastered, totalParts,
      snapshotUrl: snapshotRef.current || undefined,
      filename: `bio-lab-${t.id}-quiz-card.png`,
    })
    // warm the snapshot cache for next time (async, fire & forget)
    if (!snapshotRef.current) {
      requestTopicSnapshot(t.id, sys, u => { if (u) snapshotRef.current = u })
    }
  }

  const clearNextTimer = () => {
    if (nextTimer.current) { clearTimeout(nextTimer.current); nextTimer.current = null }
  }

  /* ── selection & system switching ─────────────────────────────────────── */
  const select = (k: string) => {
    const w = worldRef.current
    if (!w || st.current.quiz.active) return
    const { topic: tt, system: ss } = parseFullKey(k)
    const targetSysKey = partKey(tt, ss, '')
    if (targetSysKey !== st.current.systemKey) {
      w.setActiveSystem(targetSysKey, { silent: true })
      setSystemKey(targetSysKey)
      setFlowOn(false); setExplodeOn(false)
    }
    w.setSelected(k)
    w.focusPart(k)
    setPanel({ kind: 'info', partKey: k })
  }

  const switchSystem = (fullSysKey: string, opts: { silent?: boolean } = {}) => {
    const w = worldRef.current
    if (!w) return
    const { topic: tt } = parseFullKey(fullSysKey)
    if (st.current.quiz.active) cancelQuiz()
    clearNextTimer()
    if (tt !== st.current.topicId) setTopicId(tt)
    w.setActiveSystem(fullSysKey, { silent: opts.silent })
    setSystemKey(fullSysKey)
    setFlowOn(false); setExplodeOn(false); setFeedback(null)
    if (!opts.silent) {
      setPanel({ kind: 'default' })
      setMenuOpen(false)
      w.setAutoRotate(true)
    }
  }

  const openTopic = (t: TopicDef, sysIdx?: number) => {
    const idx = sysIdx ?? t.defaultSystem
    switchSystem(partKey(t.id, t.systems[idx].id, ''))
  }

  const closeMenu = () => {
    setMenuOpen(false)
    worldRef.current?.setAutoRotate(true)
    if (st.current.quiz.active) cancelQuiz()
    else setPanel(p => (p.kind === 'quiz-results' ? p : { kind: 'default' }))
  }

  const openMenu = () => {
    if (st.current.quiz.active) endQuiz()
    setMenuOpen(true)
    worldRef.current?.setAutoRotate(true)
  }

  /* ── toggles ──────────────────────────────────────────────────────────── */
  const toggleLabels = () => {
    const v = !st.current.labelsOn
    setLabelsOn(v)
    worldRef.current?.setLabels(v)
  }
  const toggleXray = () => {
    const v = !st.current.xrayOn
    setXrayOn(v)
    worldRef.current?.setXray(v)
  }
  const toggleCut = () => {
    const v = !st.current.cutOn
    setCutOn(v)
    worldRef.current?.setCut(v, st.current.cutValue)
  }
  const changeCutValue = (v: number) => {
    setCutValue(v)
    worldRef.current?.setCutValue(v)
  }
  const toggleExplode = () => {
    const on = !st.current.explodeOn
    setExplodeOn(on)
    worldRef.current?.setExplode(on ? st.current.explodeValue : 0)
    if (on && st.current.flowOn) setFlowOn(false)
  }
  const changeExplodeValue = (v: number) => {
    setExplodeValue(v)
    if (st.current.explodeOn) worldRef.current?.setExplode(v)
  }
  const toggleFlow = () => {
    const on = !st.current.flowOn
    if (on && st.current.explodeOn) { setExplodeOn(false); worldRef.current?.setExplode(0) }
    setFlowOn(on)
    worldRef.current?.setFlowVisible(on)
    setPanel(p => (on ? { kind: 'flow' } : p.kind === 'flow' ? { kind: 'default' } : p))
  }
  const toggleMute = () => {
    const v = !st.current.muted
    setMuted(v)
    setMutedState(v)
    saveMuted(v)
  }
  const resetCam = () => worldRef.current?.resetCamera()

  /* ── quiz engine ──────────────────────────────────────────────────────── */
  const startQuiz = (mode: QuizMode, keys?: string[]) => {
    const w = worldRef.current
    if (!w) return
    clearNextTimer()
    const t = getTopic(st.current.topicId)!
    const sys = getSystem(st.current.systemKey)!.system
    const prevLabels = st.current.labelsOn

    // clean slate for the quiz
    if (st.current.flowOn) { setFlowOn(false); w.setFlowVisible(false) }
    if (st.current.explodeOn) { setExplodeOn(false); w.setExplode(0) }
    setLabelsOn(false); w.setLabels(false)
    w.setAutoRotate(false); w.setSelected(null)

    const pool = keys ?? (mode === 'mixed'
      ? t.systems.flatMap(s => s.quizKeys.map(k => partKey(t.id, s.id, k)))
      : sys.quizKeys.map(k => partKey(t.id, sys.id, k)))
    const q: QuizState = {
      active: true, mode, sysKey: st.current.systemKey, order: shuffle(pool),
      idx: 0, results: [], locked: false, t0: performance.now(),
      prevLabels, lastMode: mode, lastMissed: [], record: false,
    }
    setQuiz(q)
    setFeedback(null)
    setAnswered(null)
    setElapsed(0)
    setPanel({ kind: 'quiz-question' })
    renderQuestion(q)
  }

  const renderQuestion = (q: QuizState) => {
    const w = worldRef.current
    if (!w) return
    if (q.idx >= q.order.length) { endQuiz(q); return }
    const target = q.order[q.idx]
    const { topic: tt, system: ss } = parseFullKey(target)
    const tDef = getTopic(tt)!
    const sDef = tDef.systems.find(s => s.id === ss)!

    if (q.mode === 'mixed') {
      const targetSysKey = partKey(tt, ss, '')
      if (targetSysKey !== st.current.systemKey) {
        w.setActiveSystem(targetSysKey, { silent: true })
        setSystemKey(targetSysKey)
      }
    } else if (st.current.systemKey !== q.sysKey) {
      w.setActiveSystem(q.sysKey, { silent: true })
      setSystemKey(q.sysKey)
    }

    if (q.mode === 'name') {
      w.setQuizState({ active: true, nameMode: true, locked: false, glowKey: target })
      w.setQuizMarker(target)
      w.focusPart(target)
      const pool = sDef.quizKeys
        .map(k => partKey(tDef.id, sDef.id, k))
        .filter(k => k !== target)
      setNameOptions(shuffle([target, ...sample(pool, 3)]))
    } else {
      w.setQuizState({ active: true, nameMode: false, locked: false, glowKey: null })
      w.setQuizMarker(null)
      setNameOptions([])
    }
  }

  const advance = (q: QuizState) => {
    const nq: QuizState = { ...q, idx: q.idx + 1, locked: false }
    setQuiz(nq)
    setFeedback(null)
    setAnswered(null)
    renderQuestion(nq)
  }

  const resolveAnswer = (q: QuizState, correct: boolean, target: string, wrongKey?: string) => {
    const w = worldRef.current!
    const results = [...q.results]
    results[q.idx] = correct ? 'ok' : 'bad'
    const nq: QuizState = { ...q, results, locked: true }
    setQuiz(nq)
    w.setQuizState({ locked: true })
    setMastery(recordPartResult(target, correct))
    if (correct) {
      setFeedback({ html: '✔ Correct!', ok: true })
      w.pulse(target, 0x2ecc71, 1.1)
      sndOk()
      nextTimer.current = setTimeout(() => advance(nq), 900)
    } else {
      const wrong = wrongKey && wrongKey !== target ? nameOf(wrongKey) : 'empty space'
      setFeedback({ html: `✘ That was <b>${wrong}</b> — the <b>${nameOf(target)}</b> is here →`, ok: false })
      if (wrongKey && wrongKey !== target) w.pulse(wrongKey, 0xe74c3c, 1.1)
      w.pulse(target, 0x2ecc71, 1.9)
      w.focusPart(target)
      sndBad()
      nextTimer.current = setTimeout(() => advance(nq), 2200)
    }
  }

  const quizFind = (hits: string[]) => {
    const q = st.current.quiz
    if (!q.active || q.locked) return
    const target = q.order[q.idx]
    const sDef = getSystem(st.current.systemKey)!.system
    const first = hits.find(k => !(sDef.quizSkip ?? []).includes(localPart(k)))
    const isInner = sDef.inner.includes(localPart(target))
    const correct = isInner ? hits.includes(target) : first === target
    resolveAnswer(q, correct, target, first)
  }

  const answerName = (chosen: string) => {
    const q = st.current.quiz
    if (!q.active || q.locked) return
    const ok = chosen === q.order[q.idx]
    setAnswered({ key: chosen, ok })
    resolveAnswer(q, ok, q.order[q.idx], chosen)
  }

  const quizSkip = () => {
    const q = st.current.quiz
    if (!q.active || q.locked) return
    const w = worldRef.current!
    const target = q.order[q.idx]
    const results = [...q.results]; results[q.idx] = 'bad'
    const nq: QuizState = { ...q, results, locked: true }
    setQuiz(nq)
    w.setQuizState({ locked: true })
    setMastery(recordPartResult(target, false))
    setFeedback({ html: `→ The <b>${nameOf(target)}</b> is here`, ok: null })
    w.pulse(target, 0x2ecc71, 1.5)
    w.focusPart(target)
    nextTimer.current = setTimeout(() => advance(nq), 1500)
  }

  const endQuiz = (q = st.current.quiz) => {
    const w = worldRef.current
    if (!w) return
    clearNextTimer()
    w.setQuizMarker(null)
    w.setQuizState({ active: false, glowKey: null, locked: false, nameMode: false })
    setLabelsOn(q.prevLabels)
    w.setLabels(q.prevLabels)
    const n = q.order.length || 1
    const ok = q.results.filter(r => r === 'ok').length
    const pct = Math.round(ok / n * 100)
    // only explicitly-wrong answers count as "missed" (skips included,
    // questions abandoned by an early "End quiz" don't)
    const missed = q.order.filter((_, i) => q.results[i] === 'bad')
    const record = q.active ? saveBest(st.current.topicId, q.mode, pct) : false
    if (q.active && q.order.length > 0) {
      recordAttempt({
        topicId: st.current.topicId, mode: q.mode, ok, total: q.order.length,
        pct, secs: Math.floor((performance.now() - q.t0) / 1000), at: Date.now(),
      })
    }
    setQuiz({ ...q, active: false, lastMissed: missed, lastMode: q.mode, record })
    if (q.active && q.order.length > 0) {
      saveMissed(st.current.topicId, missed)
      setMissedKeys(missed)
      setStreak(touchStreak())
      setActivity(bumpActivity())
      setHistory(loadHistory())
    }
    setPanel({ kind: 'quiz-results' })
    sndEnd()
    // celebrate: perfect score → full burst, solid new record → sparkle
    if (q.active && q.order.length > 0) {
      if (pct === 100) burstConfetti(1)
      else if (record && pct >= 80) burstConfetti(0.5)
    }
  }

  const cancelQuiz = () => {
    const q = st.current.quiz
    const w = worldRef.current
    clearNextTimer()
    if (w) {
      w.setQuizMarker(null)
      w.setQuizState({ active: false, glowKey: null, locked: false, nameMode: false })
      w.setLabels(q.prevLabels)
    }
    setLabelsOn(q.prevLabels)
    setQuiz(QUIZ_NONE)
    setFeedback(null)
    setPanel({ kind: 'default' })
  }

  /* ── world callbacks (stable → mirror through ref) ────────────────────── */
  handlersRef.current.onPick = (hits: string[]) => {
    const q = st.current.quiz
    if (q.active) { if (hits.length) quizFind(hits); return }
    if (!hits.length) {
      worldRef.current?.setSelected(null)
      setPanel(p => (p.kind === 'info' || p.kind === 'default' ? { kind: 'default' } : p))
      return
    }
    const skip = getSystem(st.current.systemKey)?.system.skipSkinHover ?? []
    const k = hits.find(p => !skip.includes(localPart(p))) ?? hits[0]
    select(k)
  }
  handlersRef.current.onLabelClick = (k: string) => select(k)

  /* ── mount the 3D world once ──────────────────────────────────────────── */
  useEffect(() => {
    const el = mountRef.current
    if (!el) return
    const world = new LabWorld(el, TOPICS, {
      onPick: keys => handlersRef.current.onPick(keys),
      onHover: () => {},
      onLabelClick: key => handlersRef.current.onLabelClick(key),
    })
    worldRef.current = world
    // handy for debugging in devtools
    ;(window as unknown as { __labWorld?: LabWorld }).__labWorld = world
    world.setActiveSystem(
      partKey(TOPICS[0].id, TOPICS[0].systems[TOPICS[0].defaultSystem].id, ''),
      { silent: true, keepSpin: true },
    )
    world.resetCamera() // frame the model behind the menu
    world.setLabels(true)
    // Re-sync view state with the freshly created world. On a normal mount
    // these are already the initial values (no-op); after an HMR effect
    // re-run they un-desync persisted React state from the new world.
    setTopicId(TOPICS[0].id)
    setSystemKey(partKey(TOPICS[0].id, TOPICS[0].systems[TOPICS[0].defaultSystem].id, ''))
    setQuiz(QUIZ_NONE)
    setPanel({ kind: 'default' })
    setMenuOpen(true)
    setLabelsOn(true); setXrayOn(false); setCutOn(false); setExplodeOn(false); setFlowOn(false)
    setFeedback(null); setAnswered(null)
    // restore the persisted sound preference before any sound can play
    const m0 = loadMuted()
    setMuted(m0)
    setMutedState(m0)
    setMastery(loadMastery())
    setStreak(loadStreak())
    setMissedKeys(loadMissed(TOPICS[0].id))
    setActivity(loadActivity())
    setHistory(loadHistory())
    setReady(true)
    return () => {
      clearNextTimer()
      world.dispose()
      worldRef.current = null
    }
  }, [])

  /* quiz clock */
  useEffect(() => {
    if (!quiz.active) return
    const iv = setInterval(() => setElapsed(Math.floor((performance.now() - quiz.t0) / 1000)), 500)
    return () => clearInterval(iv)
  }, [quiz.active, quiz.t0])

  /* reload persisted missed-parts when the topic changes */
  useEffect(() => {
    setMissedKeys(loadMissed(topicId))
  }, [topicId])

  /* ── keyboard shortcuts ───────────────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return
      const k = e.key.toLowerCase()
      const t = getTopic(st.current.topicId)!
      if (k === '1' || k === '2') {
        const sys = t.systems[Number(k) - 1]
        if (sys) switchSystem(partKey(t.id, sys.id, ''))
      } else if (k === 'b' || e.key === 'Escape') {
        if (st.current.menuOpen) closeMenu()
        else openMenu()
      } else if (k === 'l') toggleLabels()
      else if (k === 'p') { setIndexOpen(v => !v); setStatsOpen(false) }
      else if (k === 'g') { setStatsOpen(v => !v); setIndexOpen(false) }
      else if (k === 'x') toggleXray()
      else if (k === 's') toggleFlow()
      else if (k === 'c') toggleCut()
      else if (k === 'e') toggleExplode()
      else if (k === 'q') {
        if (st.current.quiz.active) endQuiz()
        else setPanel({ kind: 'quiz-start' })
      }
      else if (k === 'r') resetCam()
      else if (k === 'm') toggleMute()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* ── render ───────────────────────────────────────────────────────────── */
  return (
    <div className="bio-lab" style={{ ['--topic-accent' as string]: topic.accent }}>
      <div className="bio-tint" aria-hidden style={{ background: `radial-gradient(1100px 750px at 50% 30%, ${hexA(topic.accent, 0.17)}, transparent 70%)` }} />
      <div ref={mountRef} className="bio-canvas" aria-label="Interactive 3D biology model viewport" />

      <TopBar
        topic={topic}
        systemHint={system.hint}
        labelsOn={labelsOn} xrayOn={xrayOn} cutOn={cutOn} explodeOn={explodeOn}
        flowOn={flowOn} flowLabel={system.flowLabel ?? 'Flow Path'}
        muted={muted} quizActive={quiz.active}
        hasMultipleSystems={topic.systems.length > 1}
        indexOn={indexOpen}
        statsOn={statsOpen}
        streak={streak.count}
        dueCount={dueTotal}
        onMenu={openMenu}
        onIndex={() => { setIndexOpen(v => !v); setStatsOpen(false) }}
        onStats={() => { setStatsOpen(v => !v); setIndexOpen(false) }}
        onSwap={() => {
          const i = topic.systems.findIndex(s => partKey(topic.id, s.id, '') === systemKey)
          const next = topic.systems[(i + 1) % topic.systems.length]
          switchSystem(partKey(topic.id, next.id, ''))
        }}
        onLabels={toggleLabels} onXray={toggleXray} onFlow={toggleFlow}
        onCut={toggleCut} onExplode={toggleExplode}
        onQuiz={() => (quiz.active ? endQuiz() : setPanel({ kind: 'quiz-start' }))}
        onSound={toggleMute} onReset={resetCam}
      />

      <InfoPanel
        panel={panel}
        topic={topic}
        system={system}
        quiz={quiz}
        feedback={feedback}
        elapsed={elapsed}
        nameOptions={nameOptions}
        bestFor={bestFor}
        historyFor={historyFor}
        answered={answered}
        nameOf={nameOf}
        accent={system.accent ?? topic.accent}
        onPrev={() => {
          const p = panel.kind === 'info' ? panel.partKey : null
          if (!p) return
          const s = getSystem(p)!.system
          const i = s.order.indexOf(localPart(p))
          const n = s.order.length
          select(partKey(topic.id, s.id, s.order[(i - 1 + n) % n]))
        }}
        onNext={() => {
          const p = panel.kind === 'info' ? panel.partKey : null
          if (!p) return
          const s = getSystem(p)!.system
          const i = s.order.indexOf(localPart(p))
          const n = s.order.length
          select(partKey(topic.id, s.id, s.order[(i + 1) % n]))
        }}
        onStartQuiz={startQuiz}
        onCancel={() => (quiz.active ? cancelQuiz() : setPanel({ kind: 'default' }))}
        onSkip={quizSkip}
        onEnd={() => endQuiz()}
        onAnswer={answerName}
        onChip={select}
        missedCount={missedKeys.length}
        onReviewMissed={() => startQuiz('mixed', missedKeys)}
        dueCount={dueKeys.length}
        onReviewDue={() => startQuiz('mixed', dueKeys)}
        onRetry={() => startQuiz(quiz.lastMode, quiz.lastMissed)}
        onNew={() => setPanel({ kind: 'quiz-start' })}
        onShareCard={shareCard}
      />

      <RangeBar
        show={cutOn}
        label="Cut"
        bar="cut"
        min={-1.6} max={1.6} step={0.05}
        value={cutValue}
        onChange={changeCutValue}
        onOff={() => { setCutOn(false); worldRef.current?.setCut(false) }}
      />
      <RangeBar
        show={explodeOn}
        label="Separate"
        bar="exp"
        min={0.05} max={1} step={0.01}
        value={explodeValue}
        onChange={changeExplodeValue}
        onOff={() => { setExplodeOn(false); worldRef.current?.setExplode(0) }}
      />

      <HintOverlay />

      <PartsIndex
        open={indexOpen}
        topic={topic}
        system={system}
        mastery={mastery}
        onSelect={select}
        onClose={() => setIndexOpen(false)}
      />

      <StatsPanel
        key={statsOpen ? 'stats-open' : 'stats-closed'}
        open={statsOpen}
        topicId={topicId}
        accent={system.accent ?? topic.accent}
        mastery={mastery}
        streak={streak}
        activity={activity}
        history={history}
        onClose={() => setStatsOpen(false)}
        onReset={() => {
          clearAllProgress()
          setMastery({})
          setStreak({ count: 0, last: '' })
          setMissedKeys([])
          setActivity({})
          setHistory([])
        }}
        onImport={() => {
          // a validated backup was written to localStorage — reload UI state
          setMastery(loadMastery())
          setStreak(loadStreak())
          setActivity(loadActivity())
          setHistory(loadHistory())
          setMissedKeys(loadMissed(topicId))
        }}
      />

      <TopicMenu
        open={menuOpen}
        topics={TOPICS}
        activeTopicId={topicId}
        mastery={mastery}
        onOpen={openTopic}
        onClose={closeMenu}
      />

      {!ready && (
        <div className="bio-loading" role="status" aria-live="polite">
          <div className="bio-loading-ring" />
          <p>Preparing 3D models…</p>
        </div>
      )}
    </div>
  )
}
