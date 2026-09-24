import * as THREE from 'three'
import type { SystemBuildAPI, SystemTickAPI } from '../../types'
import { cap, mat, makeNoise, taperedTube } from '../../engine/helpers'

/**
 * THE EYE — sixth topic. Front-facing eyeball (visual axis = +Z): white
 * sclera with a real front opening, transparent cornea dome, textured iris
 * ring with a working pupil, biconvex lens, ciliary ring + zonule fibers,
 * vitreous gel, back retina cup, macula spot and the optic nerve cable,
 * plus 4 of the 6 extraocular muscle straps. "Light adaptation" idle
 * animation (pupil dilation coupled to lens accommodation) runs through
 * the engine's `tick` hook.
 */

/* deterministic RNG so the muscle straps look identical every session */
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/** Planar-mapped iris face: amber radial gradient + spokes + limbal ring. */
function irisTexture(): THREE.CanvasTexture {
  const s = 256
  const c = document.createElement('canvas')
  c.width = c.height = s
  const x = c.getContext('2d')!
  const mid = s / 2

  // base radial gradient (pupil edge → limbus)
  const g = x.createRadialGradient(mid, mid, 20, mid, mid, mid)
  g.addColorStop(0, '#3a2408')
  g.addColorStop(0.35, '#a8721c')
  g.addColorStop(0.75, '#c8922e')
  g.addColorStop(0.92, '#8a5a14')
  g.addColorStop(1, '#4a3008')
  x.fillStyle = g
  x.fillRect(0, 0, s, s)

  // radial spokes (the stroma fibers)
  const rand = rng(77031)
  for (let i = 0; i < 90; i++) {
    const a = (i / 90) * Math.PI * 2 + rand() * 0.06
    const r0 = mid * (0.16 + rand() * 0.08)
    const r1 = mid * (0.8 + rand() * 0.17)
    x.strokeStyle = rand() > 0.5 ? 'rgba(60,36,6,0.30)' : 'rgba(255,214,120,0.22)'
    x.lineWidth = 1 + rand() * 2.2
    x.beginPath()
    x.moveTo(mid + Math.cos(a) * r0, mid + Math.sin(a) * r0)
    x.lineTo(mid + Math.cos(a) * r1, mid + Math.sin(a) * r1)
    x.stroke()
  }

  // crypts — a few darker blotches for organic feel
  for (let i = 0; i < 14; i++) {
    const a = rand() * Math.PI * 2
    const r = mid * (0.3 + rand() * 0.5)
    x.fillStyle = 'rgba(46,26,4,0.20)'
    x.beginPath()
    x.ellipse(mid + Math.cos(a) * r, mid + Math.sin(a) * r, 6 + rand() * 10, 4 + rand() * 7, a, 0, Math.PI * 2)
    x.fill()
  }

  const t = new THREE.CanvasTexture(c)
  t.anisotropy = 4
  return t
}

/** store base scale (and z position) for the tick animation */
const animMesh = (m: THREE.Mesh) => {
  m.userData.bs = m.scale.clone()
  m.userData.bz = m.position.z
  return m
}

export function buildEye(api: SystemBuildAPI) {
  const M = {
    sclera: mat(0xefece2, { roughness: 0.42, clearcoat: 0.35, sheen: 0.1 }),
    cornea: mat(0xe8f6fc, {
      roughness: 0.03, clearcoat: 1, clearcoatRoughness: 0.04,
      transparent: true, opacity: 0.24, side: THREE.DoubleSide, depthWrite: false,
      envMapIntensity: 1.0,
    }),
    iris: mat(0xffffff, { roughness: 0.5, clearcoat: 0.5, sheen: 0, side: THREE.DoubleSide }),
    pupil: mat(0x0a0a0c, { roughness: 0.15, clearcoat: 0.9, sheen: 0 }),
    lens: mat(0xf4fbff, {
      roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.06,
      transparent: true, opacity: 0.34, envMapIntensity: 0.9,
    }),
    ciliary: mat(0xc95f58, { roughness: 0.5, clearcoat: 0.3 }),
    vitreous: mat(0xd6ecf6, {
      roughness: 0.25, transparent: true, opacity: 0.12,
      side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 0.5,
    }),
    retina: mat(0xdd7c6a, {
      roughness: 0.6, clearcoat: 0.12, transparent: true, opacity: 0.6,
      side: THREE.DoubleSide, emissive: 0x341008, emissiveIntensity: 0.4,
    }),
    macula: mat(0xa84a3c, { roughness: 0.55, clearcoat: 0.2 }),
    nerve: mat(0xe9e1cf, { roughness: 0.5, clearcoat: 0.22 }),
    muscle: mat(0xc25a52, { roughness: 0.5, clearcoat: 0.28 }),
    limbus: mat(0x9aa4ac, { roughness: 0.4, clearcoat: 0.4, transparent: true, opacity: 0.5 }),
  }
  M.sclera.bumpMap = makeNoise(6); M.sclera.bumpScale = 0.004
  M.iris.map = irisTexture()
  api.addMaterials(Object.values(M))

  /* ── sclera: outer coat with a real front opening (the limbus rim) ──── */
  const openAngle = 0.165 * Math.PI // half-angle of the corneal window
  const scleraGeo = new THREE.SphereGeometry(1.32, 72, 48, 0, Math.PI * 2, 0, Math.PI - openAngle)
  const sclera = new THREE.Mesh(scleraGeo, M.sclera)
  sclera.rotation.x = -Math.PI / 2 // solid toward −Z, window toward +Z
  sclera.scale.set(1, 1, 1.05)
  api.add('sclera', animMesh(sclera))

  // limbus ring where cornea meets sclera
  api.addDecor(new THREE.Mesh(new THREE.TorusGeometry(0.665, 0.028, 10, 48), M.limbus)
    .translateZ(1.145))

  /* ── cornea: transparent dome over the window ───────────────────────── */
  const cornea = new THREE.Mesh(new THREE.SphereGeometry(0.62, 48, 32), M.cornea)
  cornea.position.set(0, 0.1, 1.1)
  cornea.scale.set(1, 1, 0.6)
  api.add('cornea', cornea)

  /* ── iris: textured ring plane at z≈0.98 ────────────────────────────── */
  const iris = new THREE.Mesh(new THREE.RingGeometry(0.24, 0.585, 56, 1), M.iris)
  iris.position.set(0, 0.04, 0.98)
  api.add('iris', iris)

  /* ── pupil: dark disc just behind the iris plane (dilates in tick) ──── */
  const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.21, 32, 20), M.pupil)
  pupil.position.set(0, 0.04, 0.94)
  pupil.scale.set(1, 1, 0.18)
  api.add('pupil', animMesh(pupil))

  /* ── lens: biconvex transparent disc (accommodates in tick) ─────────── */
  const lens = new THREE.Mesh(new THREE.SphereGeometry(0.44, 48, 32), M.lens)
  lens.position.set(0, 0.03, 0.52)
  lens.scale.set(1, 1, 0.62)
  api.add('lens', animMesh(lens))

  /* ── ciliary body: muscle ring + zonule fibers on the lens rim ──────── */
  const ciliary = new THREE.Mesh(new THREE.TorusGeometry(0.63, 0.13, 14, 48), M.ciliary)
  ciliary.position.set(0, 0.03, 0.5)
  api.add('ciliaryBody', animMesh(ciliary))
  const zonuleMat = new THREE.LineBasicMaterial({ color: 0xd8cfc0, transparent: true, opacity: 0.4 })
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(Math.cos(a) * 0.72, 0.03 + Math.sin(a) * 0.72, 0.5),
        new THREE.Vector3(Math.cos(a) * 0.47, 0.03 + Math.sin(a) * 0.47, 0.52),
      ]),
      zonuleMat,
    )
    api.addDecor(line)
  }

  /* ── vitreous humor: faint gel filling the globe ────────────────────── */
  const vit = new THREE.Mesh(new THREE.SphereGeometry(1.16, 48, 32), M.vitreous)
  vit.scale.set(1, 1, 1.04)
  api.add('vitreous', vit)

  /* ── retina: sensory cup lining the back wall (visible via x-ray) ───── */
  const retinaGeo = new THREE.SphereGeometry(1.12, 56, 36, 0, Math.PI * 2, 0, Math.PI * 0.68)
  const retina = new THREE.Mesh(retinaGeo, M.retina)
  retina.rotation.x = -Math.PI / 2 // cup opens toward +Z
  retina.scale.set(1, 1, 1.04)
  api.add('retina', retina)

  /* ── macula: the sharp-vision spot at the visual axis ───────────────── */
  const macula = new THREE.Mesh(new THREE.SphereGeometry(0.19, 28, 18), M.macula)
  macula.position.set(0, 0.02, -1.1)
  macula.scale.set(1, 1, 0.32)
  api.add('macula', macula)

  /* ── optic nerve: cable out the back + optic disc at the exit ───────── */
  api.add('opticNerve', taperedTube(
    [[0, 0.05, -1.05], [0, 0.12, -1.45], [0, 0.28, -2.05], [0, 0.42, -2.72]],
    u => (u < 0.22 ? 0.21 + 0.05 * Math.sin((u / 0.22) * Math.PI) : 0.185 - 0.035 * ((u - 0.22) / 0.78)),
    M.nerve, 48, 14,
  ))
  api.add('opticNerve', cap([0, 0.06, -1.02], 0.19, M.nerve))

  /* ── extraocular muscles: 4 straps hugging the globe (of the 6) ─────── */
  const strap = (pts: [number, number, number][]) =>
    taperedTube(pts, u => 0.155 - 0.05 * u, M.muscle, 40, 12)
  // superior + inferior rectus
  api.add('eyeMuscles', strap([[0, 0.5, -1.7], [0, 1.18, -0.75], [0, 1.34, 0.15], [0, 1.02, 0.95]]))
  api.add('eyeMuscles', strap([[0, -0.42, -1.7], [0, -1.06, -0.75], [0, -1.18, 0.15], [0, -0.9, 0.95]]))
  // medial + lateral rectus (+x built, −x mirrored)
  const latPts: [number, number, number][] = [
    [0.42, -0.02, -1.7], [1.14, 0.0, -0.75], [1.33, 0.02, 0.15], [1.05, 0.04, 0.95],
  ]
  api.add('eyeMuscles', strap(latPts))
  api.add('eyeMuscles', strap(latPts.map(p => [-p[0], p[1], p[2]] as [number, number, number])))

  /* ── flow: the visual pathway — light in, signal out ────────────────── */
  api.addFlow({
    guideColor: 0x9fd8ee,
    guideOpacity: 0.22,
    curves: [
      // light ray A (upper): cornea → lens → focus on the macula
      {
        pts: [[0.7, 0.55, 2.7], [0.3, 0.32, 1.6], [0.14, 0.15, 1.05], [0.1, 0.1, 0.5],
              [0.04, 0.05, -0.5], [0, 0.03, -1.02]],
        count: 6, speed: 0.05, color: 0xeafcff, glow: 0x9fe8ff,
      },
      // light ray B (lower)
      {
        pts: [[-0.65, -0.4, 2.7], [-0.28, -0.22, 1.6], [-0.12, -0.12, 1.05], [-0.08, -0.08, 0.5],
              [-0.03, -0.02, -0.5], [0, 0.03, -1.02]],
        count: 6, speed: 0.05, color: 0xeafcff, glow: 0x9fe8ff,
      },
      // neural signal: macula → optic nerve → toward the visual cortex
      {
        pts: [[0, 0.03, -1.02], [0, 0.12, -1.5], [0, 0.28, -2.15], [0, 0.42, -2.72]],
        count: 5, speed: 0.038, color: 0xffe2a8, glow: 0xffb454,
      },
    ],
  })
}

/* ── "light adaptation" idle: pupil dilation + coupled lens focus ─────── */
export function tickEye({ t, part, exploded }: SystemTickAPI) {
  if (exploded) return
  const s = 0.8 + 0.3 * Math.sin(t * 0.85) // 0.5 → 1.1 · dilation cycle ~7.4 s
  const f = Math.sin(t * 0.85 + 0.9) // accommodation phase (slightly leads)

  part('pupil')?.forEach(m => {
    const bs = m.userData.bs as THREE.Vector3 | undefined
    if (bs) m.scale.set(bs.x * s, bs.y * s, bs.z)
  })
  part('lens')?.forEach(m => {
    const bs = m.userData.bs as THREE.Vector3 | undefined
    const bz = m.userData.bz as number | undefined
    if (bs) m.scale.set(bs.x, bs.y, bs.z * (1 + 0.05 * f))
    if (bz !== undefined) m.position.z = bz + 0.022 * f
  })
  part('ciliaryBody')?.forEach(m => {
    const bs = m.userData.bs as THREE.Vector3 | undefined
    if (bs) {
      const w = 1 + 0.02 * f
      m.scale.set(bs.x * w, bs.y * w, bs.z)
    }
  })
}
