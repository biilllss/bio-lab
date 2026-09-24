/**
 * Confetti celebration — a tiny self-contained canvas particle burst
 * for perfect quiz scores. Respects prefers-reduced-motion (no-op),
 * auto-removes its overlay, and stacks safely if called repeatedly.
 */

interface Particle {
  x: number; y: number
  vx: number; vy: number
  rot: number; vr: number
  w: number; h: number
  color: string
  born: number
  life: number
}

const COLORS = ['#ffd25a', '#7ad8a0', '#ff8a6a', '#f2f6fa', '#9ad6c0', '#e8c86a', '#7fc7ae']
const DURATION = 2000

let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null
let particles: Particle[] = []
let raf = 0

function spawn(n: number, ox: number, oy: number): void {
  const now = performance.now()
  for (let i = 0; i < n; i++) {
    const ang = Math.random() * Math.PI * 2
    const speed = 240 + Math.random() * 420
    particles.push({
      x: ox, y: oy,
      vx: Math.cos(ang) * speed * (0.4 + Math.random() * 0.6),
      vy: Math.sin(ang) * speed * 0.5 - 320 - Math.random() * 180,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 12,
      w: 6 + Math.random() * 7,
      h: 4 + Math.random() * 5,
      color: COLORS[Math.random() * COLORS.length | 0],
      born: now,
      life: 1200 + Math.random() * 900,
    })
  }
}

function tick(): void {
  if (!canvas || !ctx) return
  const now = performance.now()
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  particles = particles.filter(p => now - p.born < p.life)
  const dt = 1 / 60
  for (const p of particles) {
    p.vy += 900 * dt      // gravity
    p.vx *= 0.995         // drag
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.rot += p.vr * dt
    const age = (now - p.born) / p.life
    ctx.save()
    ctx.globalAlpha = Math.max(0, 1 - age * age)
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rot)
    ctx.fillStyle = p.color
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
    ctx.restore()
  }
  if (particles.length > 0) {
    raf = requestAnimationFrame(tick)
  } else {
    stopConfetti()
  }
}

function stopConfetti(): void {
  cancelAnimationFrame(raf)
  particles = []
  canvas?.remove()
  canvas = null
  ctx = null
}

/**
 * Fire a burst. `power` scales the particle count (0.6 = small sparkle
 * for a new record, 1 = full celebration for a perfect score).
 */
export function burstConfetti(power = 1): void {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (!canvas) {
    canvas = document.createElement('canvas')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    canvas.style.cssText =
      'position:fixed;inset:0;z-index:9999;pointer-events:none;'
    canvas.setAttribute('aria-hidden', 'true')
    document.body.appendChild(canvas)
    ctx = canvas.getContext('2d')
  }
  const ox = canvas.width / 2
  const oy = canvas.height * 0.38
  spawn(Math.round(90 * power), ox, oy)
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(tick)
}
