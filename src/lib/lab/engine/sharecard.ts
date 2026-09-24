/**
 * Share-card generator — draws a downloadable "score card" PNG on a
 * 2D canvas (no WebGL, no dependencies): the quiz result donut, the
 * topic's 3D snapshot, streak + mastery stats and the lab's branding.
 * Canvas 2D keeps it fully offline and pixel-exact.
 */

export interface ShareCardData {
  /** topic emoji + title, e.g. 🫀 Heart & Blood Flow */
  emoji: string
  title: string
  /** accent hex, e.g. #e25f5f */
  accent: string
  mode: string
  ok: number
  total: number
  pct: number
  secs: number
  /** 🔥 streak count */
  streak: number
  /** total mastered parts across the lab */
  mastered: number
  /** total quizable parts across the lab */
  totalParts: number
  /** optional topic snapshot data-URL (from engine/snapshot.ts) */
  snapshotUrl?: string
  filename?: string
}

const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

/** rounded-rect path helper (roundRect not everywhere yet) */
function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function drawRing(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number,
  pct: number, accent: string,
  centerLabel = 'SCORE',
): void {
  const line = 15
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255,255,255,0.09)'
  ctx.lineWidth = line
  ctx.stroke()
  if (pct > 0) {
    const score = pct >= 80 ? accent : pct >= 50 ? '#e2b45f' : '#d86a5a'
    ctx.beginPath()
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct / 100)
    ctx.strokeStyle = score
    ctx.lineWidth = line
    ctx.stroke()
  }
  // center number
  ctx.fillStyle = '#f2f6fa'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '700 54px system-ui, -apple-system, "Segoe UI", sans-serif'
  ctx.fillText(`${pct}%`, cx, cy - 4)
  ctx.font = '600 15px system-ui, -apple-system, "Segoe UI", sans-serif'
  ctx.fillStyle = 'rgba(220,232,242,0.75)'
  ctx.fillText(centerLabel, cx, cy + 34)
}

/** Render the card; returns the canvas (1000×560). */
export function renderShareCard(data: ShareCardData): HTMLCanvasElement {
  const W = 1000, H = 560
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')!

  // ── backdrop ────────────────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#0d1117')
  bg.addColorStop(0.55, '#111820')
  bg.addColorStop(1, '#0d1216')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // accent glow top-left + faint dot grid
  const glow = ctx.createRadialGradient(150, 90, 20, 150, 90, 620)
  glow.addColorStop(0, `${data.accent}2e`)
  glow.addColorStop(1, '#0000')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = 'rgba(255,255,255,0.045)'
  for (let gx = 40; gx < W; gx += 44) {
    for (let gy = 40; gy < H; gy += 44) {
      ctx.fillRect(gx, gy, 2, 2)
    }
  }

  // ── header: brand + date ────────────────────────────────────────────
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = 'rgba(235,244,252,0.92)'
  ctx.font = '700 17px system-ui, -apple-system, "Segoe UI", sans-serif'
  ctx.fillText('🧬 BIOLOGY 3D STUDY LAB', 48, 62)
  ctx.fillStyle = 'rgba(160,180,198,0.75)'
  ctx.font = '500 13px system-ui, -apple-system, "Segoe UI", sans-serif'
  const date = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  ctx.textAlign = 'right'
  ctx.fillText(date, W - 48, 62)

  // accent rule under the header
  const rule = ctx.createLinearGradient(48, 0, W - 48, 0)
  rule.addColorStop(0, data.accent)
  rule.addColorStop(1, '#0000')
  ctx.fillStyle = rule
  ctx.fillRect(48, 80, W - 96, 2)

  // ── left: score ring + stats ────────────────────────────────────────
  drawRing(ctx, 190, 268, 92, data.pct, data.accent)
  ctx.textAlign = 'center'
  ctx.fillStyle = '#eef3f8'
  ctx.font = '700 22px system-ui, -apple-system, "Segoe UI", sans-serif'
  ctx.fillText(`${data.ok} / ${data.total} correct`, 190, 396)
  // mode + time chips
  const chip = (label: string, x: number, w: number) => {
    rr(ctx, x - w / 2, 414, w, 30, 15)
    ctx.fillStyle = 'rgba(255,255,255,0.07)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.16)'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.fillStyle = 'rgba(210,226,240,0.9)'
    ctx.font = '600 13px system-ui, -apple-system, "Segoe UI", sans-serif'
    ctx.fillText(label, x, 434)
  }
  chip(`${data.mode} mode`, 152, 104)
  chip(`⏱ ${fmtTime(data.secs)}`, 238, 78)

  // ── middle: topic title + streak/mastery ────────────────────────────
  ctx.textAlign = 'left'
  ctx.fillStyle = '#f2f6fa'
  ctx.font = '800 34px system-ui, -apple-system, "Segoe UI", sans-serif'
  const title = `${data.emoji} ${data.title}`
  ctx.fillText(title.length > 21 ? `${title.slice(0, 20)}…` : title, 330, 190)
  ctx.fillStyle = 'rgba(170,190,208,0.85)'
  ctx.font = '600 15px system-ui, -apple-system, "Segoe UI", sans-serif'
  ctx.fillText('3D quiz lab — interactive anatomy', 330, 218)

  const stat = (icon: string, label: string, y: number) => {
    rr(ctx, 330, y, 258, 58, 14)
    const g = ctx.createLinearGradient(330, y, 588, y + 58)
    g.addColorStop(0, 'rgba(255,255,255,0.085)')
    g.addColorStop(1, 'rgba(255,255,255,0.03)')
    ctx.fillStyle = g
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.font = '700 26px system-ui, -apple-system, "Segoe UI", sans-serif'
    ctx.fillText(icon, 348, y + 38)
    ctx.fillStyle = '#eef3f8'
    ctx.font = '800 21px system-ui, -apple-system, "Segoe UI", sans-serif'
    ctx.fillText(label, 392, y + 32)
    ctx.fillStyle = 'rgba(160,180,198,0.7)'
    ctx.font = '500 11.5px system-ui, -apple-system, "Segoe UI", sans-serif'
    ctx.fillText(label.includes('streak') ? 'consecutive days' : 'parts mastered', 392, y + 48)
  }
  stat('🔥', `${data.streak} day streak`, 250)
  stat('🏅', `${data.mastered}/${data.totalParts}`, 322)

  // ── right: topic snapshot in a framed window ────────────────────────
  const snapUrl: string | undefined = data.snapshotUrl
  const img: HTMLImageElement | null = snapUrl == null ? null : document.createElement('img')
  const paintFrame = () => {
    rr(ctx, 620, 136, 332, 300, 18)
    ctx.fillStyle = '#0b0f14'
    ctx.fill()
    ctx.strokeStyle = `${data.accent}66`
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.save()
    rr(ctx, 620, 136, 332, 300, 18)
    ctx.clip()
    if (img && img.complete && img.naturalWidth > 0) {
      // cover-fit the snapshot
      const s = Math.max(332 / img.naturalWidth, 300 / img.naturalHeight)
      const dw = img.naturalWidth * s, dh = img.naturalHeight * s
      ctx.globalAlpha = 0.92
      ctx.drawImage(img, 620 + (332 - dw) / 2, 136 + (300 - dh) / 2, dw, dh)
      ctx.globalAlpha = 1
    } else {
      ctx.textAlign = 'center'
      ctx.font = '110px system-ui, -apple-system, "Segoe UI", sans-serif'
      ctx.fillText(data.emoji, 786, 315)
    }
    // bottom fade
    const fade = ctx.createLinearGradient(0, 340, 0, 436)
    fade.addColorStop(0, '#0000')
    fade.addColorStop(1, 'rgba(9,12,16,0.85)')
    ctx.fillStyle = fade
    ctx.fillRect(620, 136, 332, 300)
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(240,246,252,0.9)'
    ctx.font = '700 15px system-ui, -apple-system, "Segoe UI", sans-serif'
    ctx.fillText('take the quiz →', 786, 416)
    ctx.restore()
  }
  paintFrame() // paint immediately (emoji shows until/unless the snapshot loads)
  if (snapUrl && img) {
    img.onload = paintFrame
    img.src = snapUrl
  }

  // ── footer ──────────────────────────────────────────────────────────
  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(150,170,190,0.65)'
  ctx.font = '500 12.5px system-ui, -apple-system, "Segoe UI", sans-serif'
  ctx.fillText('Rotate it · quiz it · master it — all offline, in the browser', 48, H - 40)
  ctx.textAlign = 'right'
  ctx.fillText('Biology 3D Study Lab', W - 48, H - 40)
  return c
}

/** Render + download the card as a PNG file. */
export function downloadShareCard(data: ShareCardData): void {
  const canvas = renderShareCard(data)
  const url = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = url
  a.download = data.filename ?? `bio-lab-${data.mode}-quiz-card.png`
  a.click()
}

/* ══════════════════════════════════════════════════════════════════════
   STUDY STATS CARD — the Progress panel's overall share card: total
   mastery ring, streak/quiz/avg chips and a per-topic bar breakdown.
   ══════════════════════════════════════════════════════════════════════ */

export interface StatsCardData {
  streak: number
  /** finished quiz attempts */
  quizzes: number
  /** rolling average % (last 5 quizzes) */
  avgPct: number
  mastered: number
  totalParts: number
  /** per-topic mastery roll-up for the bar breakdown */
  topics: { emoji: string; title: string; done: number; total: number }[]
  accent?: string
  filename?: string
}

/** Render + download the overall study-stats card as a PNG. */
export function downloadStatsCard(data: StatsCardData): void {
  const W = 1000, H = 720
  const accent = data.accent ?? '#68b04c'
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')!

  // ── backdrop ────────────────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#0d1117')
  bg.addColorStop(0.55, '#111820')
  bg.addColorStop(1, '#0d1216')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  const glow = ctx.createRadialGradient(140, 90, 20, 140, 90, 620)
  glow.addColorStop(0, `${accent}2e`)
  glow.addColorStop(1, '#0000')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = 'rgba(255,255,255,0.045)'
  for (let gx = 40; gx < W; gx += 44) {
    for (let gy = 40; gy < H; gy += 44) ctx.fillRect(gx, gy, 2, 2)
  }

  // ── header ──────────────────────────────────────────────────────────
  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(235,244,252,0.92)'
  ctx.font = '700 17px system-ui, -apple-system, "Segoe UI", sans-serif'
  ctx.fillText('🧬 BIOLOGY 3D STUDY LAB', 48, 58)
  ctx.fillStyle = 'rgba(160,180,198,0.75)'
  ctx.font = '500 13px system-ui, -apple-system, "Segoe UI", sans-serif'
  const date = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  ctx.textAlign = 'right'
  ctx.fillText(date, W - 48, 58)
  ctx.textAlign = 'left'
  ctx.fillStyle = '#f2f6fa'
  ctx.font = '800 30px system-ui, -apple-system, "Segoe UI", sans-serif'
  ctx.fillText('📊 My Study Progress', 48, 108)
  const rule = ctx.createLinearGradient(48, 0, W - 48, 0)
  rule.addColorStop(0, accent)
  rule.addColorStop(1, '#0000')
  ctx.fillStyle = rule
  ctx.fillRect(48, 126, W - 96, 2)

  // ── left: mastery ring ──────────────────────────────────────────────
  const pct = data.totalParts ? Math.round(data.mastered / data.totalParts * 100) : 0
  drawRing(ctx, 168, 268, 90, pct, accent, 'MASTERED')
  ctx.textAlign = 'center'
  ctx.fillStyle = '#eef3f8'
  ctx.font = '700 21px system-ui, -apple-system, "Segoe UI", sans-serif'
  ctx.fillText(`${data.mastered} / ${data.totalParts} parts`, 168, 392)
  ctx.fillStyle = 'rgba(160,180,198,0.7)'
  ctx.font = '500 13px system-ui, -apple-system, "Segoe UI", sans-serif'
  ctx.fillText('mastered across every topic', 168, 414)

  // ── right: 2×2 stat chips ───────────────────────────────────────────
  const chipW = 240, chipH = 74, gap = 14
  const chip = (icon: string, big: string, small: string, col: number, row: number) => {
    const x = 316 + col * (chipW + gap)
    const y = 172 + row * (chipH + gap)
    rr(ctx, x, y, chipW, chipH, 14)
    const g = ctx.createLinearGradient(x, y, x + chipW, y + chipH)
    g.addColorStop(0, 'rgba(255,255,255,0.085)')
    g.addColorStop(1, 'rgba(255,255,255,0.03)')
    ctx.fillStyle = g
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.textAlign = 'left'
    ctx.font = '700 30px system-ui, -apple-system, "Segoe UI", sans-serif'
    ctx.fillText(icon, x + 18, y + 47)
    ctx.fillStyle = '#eef3f8'
    ctx.font = '800 26px system-ui, -apple-system, "Segoe UI", sans-serif'
    ctx.fillText(big, x + 66, y + 36)
    ctx.fillStyle = 'rgba(160,180,198,0.7)'
    ctx.font = '500 12px system-ui, -apple-system, "Segoe UI", sans-serif'
    ctx.fillText(small, x + 66, y + 56)
  }
  chip('🔥', `${data.streak} day${data.streak === 1 ? '' : 's'}`, 'study streak', 0, 0)
  chip('🎯', `${data.quizzes}`, 'quizzes finished', 1, 0)
  chip('📊', `${data.avgPct}%`, 'recent average', 0, 1)
  chip('🧬', `${data.topics.length}`, 'topics in the lab', 1, 1)

  // ── bottom: per-topic mastery bars ──────────────────────────────────
  const listTop = 448
  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(210,226,240,0.85)'
  ctx.font = '700 15px system-ui, -apple-system, "Segoe UI", sans-serif'
  ctx.fillText('MASTERY BY TOPIC', 48, listTop - 14)
  const rowH = Math.min(26, (H - listTop - 48) / Math.max(1, data.topics.length))
  data.topics.forEach((t, i) => {
    const y = listTop + i * rowH
    ctx.font = '600 15px system-ui, -apple-system, "Segoe UI", sans-serif'
    ctx.fillText(t.emoji, 48, y + rowH * 0.72)
    const title = t.title.length > 18 ? `${t.title.slice(0, 17)}…` : t.title
    ctx.fillStyle = 'rgba(222,234,244,0.9)'
    ctx.font = '600 12.5px system-ui, -apple-system, "Segoe UI", sans-serif'
    ctx.fillText(title, 74, y + rowH * 0.72)
    // bar
    const bx = 250, bw = W - 250 - 96
    rr(ctx, bx, y + rowH * 0.32, bw, 7, 3.5)
    ctx.fillStyle = 'rgba(255,255,255,0.09)'
    ctx.fill()
    const frac = t.total ? t.done / t.total : 0
    if (frac > 0) {
      rr(ctx, bx, y + rowH * 0.32, Math.max(7, bw * frac), 7, 3.5)
      ctx.fillStyle = accent
      ctx.fill()
    }
    ctx.textAlign = 'right'
    ctx.fillStyle = 'rgba(160,180,198,0.8)'
    ctx.font = '600 12px system-ui, -apple-system, "Segoe UI", sans-serif'
    ctx.fillText(`${t.done}/${t.total}`, W - 48, y + rowH * 0.72)
    ctx.textAlign = 'left'
  })

  // ── footer ──────────────────────────────────────────────────────────
  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(150,170,190,0.65)'
  ctx.font = '500 12.5px system-ui, -apple-system, "Segoe UI", sans-serif'
  ctx.fillText('Rotate it · quiz it · master it — all offline, in the browser', 48, H - 32)
  ctx.textAlign = 'right'
  ctx.fillText('Biology 3D Study Lab', W - 48, H - 32)

  const url = c.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = url
  a.download = data.filename ?? 'bio-lab-study-stats.png'
  a.click()
}
