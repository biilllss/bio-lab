/** Tiny WebAudio synth for quiz feedback. Created lazily after a user gesture. */

let actx: AudioContext | null = null
let muted = false

export function setMuted(v: boolean) { muted = v }
export function isMuted() { return muted }

/* ── mute preference persistence ────────────────────────────────────────── */

const MUTED_KEY = 'bio-lab-muted'

export function loadMuted(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(MUTED_KEY) === '1'
  } catch {
    return false
  }
}

export function saveMuted(v: boolean): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(MUTED_KEY, v ? '1' : '0')
  } catch { /* private mode etc. — ignore */ }
}

function tone(f: number, d: number, type: OscillatorType = 'sine', v = 0.09, delay = 0) {
  if (muted) return
  try {
    actx ||= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const t = actx.currentTime + delay
    const o = actx.createOscillator()
    const g = actx.createGain()
    o.type = type
    o.frequency.value = f
    g.gain.setValueAtTime(v, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + d)
    o.connect(g).connect(actx.destination)
    o.start(t)
    o.stop(t + d)
  } catch { /* audio not available */ }
}

export const sndOk = () => { tone(660, 0.09); tone(980, 0.14, 'sine', 0.09, 0.09) }
export const sndBad = () => tone(190, 0.25, 'square', 0.05)
export const sndEnd = () => [523, 659, 784].forEach((f, i) => tone(f, 0.15, 'sine', 0.08, i * 0.13))
