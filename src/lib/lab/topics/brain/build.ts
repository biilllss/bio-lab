import * as THREE from 'three'
import type { SystemBuildAPI, SystemTickAPI } from '../../types'
import { cap, mat, makeNoise, taperedTube } from '../../engine/helpers'

/**
 * THE BRAIN — fifth topic. Stylized sagittal-ish view: folded cerebrum with
 * visible longitudinal groove, C-shaped corpus callosum, deep nuclei, limbic
 * system, striped cerebellum and brainstem. "Thinking" idle animation (CSF
 * pulse + twinkling neural sparks) runs through the engine's `tick` hook.
 */

/* deterministic RNG so the model looks identical every session */
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/** Displace vertices along their normals with layered trigonometrics —
 *  turns a smooth sphere into a gyri/sulci folded cortex. */
function gyrify(geo: THREE.BufferGeometry, amp: number): THREE.BufferGeometry {
  const p = geo.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.set(p.getX(i), p.getY(i), p.getZ(i))
    const n = v.clone().normalize()
    // layered "stripes" = fold pattern (low freq ridges + fine wrinkles)
    const f =
      0.62 * Math.sin(n.x * 7.3 + 1.4) * Math.sin(n.y * 6.1 - 0.7) * Math.sin(n.z * 7.9 + 2.2) +
      0.26 * Math.sin(n.x * 14.2 + 3.1) * Math.sin(n.y * 12.8 + 1.3) +
      0.12 * Math.sin(n.y * 23.0 + 5.2) * Math.sin(n.z * 21.4 - 2.8)
    v.addScaledVector(n, amp * f)
    p.setXYZ(i, v.x, v.y, v.z)
  }
  geo.computeVertexNormals()
  return geo
}

/* spark materials are animated by the tick hook (module scope — built once) */
let sparkMats: THREE.SpriteMaterial[] = []

function stripeTexture(): THREE.CanvasTexture {
  const s = 128
  const c = document.createElement('canvas')
  c.width = s; c.height = s
  const x = c.getContext('2d')!
  x.fillStyle = '#9c9c9c'; x.fillRect(0, 0, s, s)
  for (let i = 0; i < 9; i++) {
    const y = (i + 0.5) * (s / 9)
    x.strokeStyle = '#5c5c5c'; x.lineWidth = 7
    x.beginPath(); x.moveTo(0, y); x.lineTo(s, y); x.stroke()
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(2, 5)
  return t
}

export function buildBrain(api: SystemBuildAPI) {
  sparkMats = []

  const M = {
    cortex: mat(0xd07e70, { roughness: 0.62, clearcoat: 0.18, envMapIntensity: 0.34, sheen: 0.15 }),
    white: mat(0xf2ead9, { roughness: 0.5, clearcoat: 0.3 }),
    deep: mat(0xe2b58e, { roughness: 0.48, clearcoat: 0.28 }),
    hypo: mat(0xecc2a4, { roughness: 0.45, clearcoat: 0.3 }),
    pituitary: mat(0xdd8f92, { roughness: 0.4, clearcoat: 0.45 }),
    limbic: mat(0xd3a3bd, { roughness: 0.46, clearcoat: 0.32 }),
    amygdala: mat(0xe3a3aa, { roughness: 0.44, clearcoat: 0.35 }),
    cerebellum: mat(0xc48e99, { roughness: 0.5, clearcoat: 0.3 }),
    stem: mat(0xd9b493, { roughness: 0.5, clearcoat: 0.25 }),
  }
  M.cortex.bumpMap = makeNoise(5); M.cortex.bumpScale = 0.008
  M.cerebellum.bumpMap = stripeTexture(); M.cerebellum.bumpScale = 0.05
  api.addMaterials(Object.values(M))

  /* store base scale for the CSF "thinking" pulse in the tick hook */
  const pulseMesh = (m: THREE.Mesh) => { m.userData.bs = m.scale.clone(); return m }

  /* ── cerebrum: two folded hemispheres with a longitudinal groove ────── */
  const hemisphere = (side: 1 | -1) => {
    const g = new THREE.SphereGeometry(1.32, 96, 64)
    gyrify(g, 0.105)
    const m = new THREE.Mesh(g, M.cortex)
    m.position.set(side * 0.56, 1.12, 0.05)
    m.scale.set(0.86, 0.92, 1.12)
    api.add('cerebrum', pulseMesh(m))
  }
  hemisphere(-1); hemisphere(1)

  /* ── corpus callosum: flattened C-arc in the mid-sagittal plane ─────── */
  const cc = taperedTube(
    [[0, 0.72, 0.78], [0, 1.18, 0.62], [0, 1.38, 0.12], [0, 1.25, -0.42], [0, 0.85, -0.68], [0, 0.62, -0.5]],
    u => 0.155 + 0.075 * Math.sin(Math.PI * u),
    M.white, 48, 14,
  )
  cc.scale.z = 1.25
  api.add('corpusCallosum', pulseMesh(cc))

  /* ── thalamus: twin egg hubs deep in the center ─────────────────────── */
  const egg = (side: 1 | -1) => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.34, 40, 28), M.deep)
    e.position.set(side * 0.42, 0.86, -0.02)
    e.scale.set(1, 0.88, 1.38)
    return e
  }
  api.add('thalamus', pulseMesh(egg(-1)))
  api.add('thalamus', pulseMesh(egg(1)))

  /* ── hypothalamus: small nub above the pituitary stalk ──────────────── */
  const hypo = new THREE.Mesh(new THREE.SphereGeometry(0.19, 32, 22), M.hypo)
  hypo.position.set(0, 0.52, 0.24)
  hypo.scale.set(1.15, 0.85, 1.0)
  api.add('hypothalamus', pulseMesh(hypo))

  /* ── pituitary: pea on a stalk (infundibulum registered with it) ────── */
  api.add('pituitary', taperedTube(
    [[0, 0.5, 0.26], [0, 0.34, 0.3], [0, 0.24, 0.31]],
    () => 0.055, M.hypo, 16, 10))
  const pit = new THREE.Mesh(new THREE.SphereGeometry(0.135, 28, 20), M.pituitary)
  pit.position.set(0, 0.17, 0.315)
  api.add('pituitary', pulseMesh(pit))

  /* ── hippocampus: two arced "seahorses" in the temporal region ──────── */
  const hippo = (side: 1 | -1) => {
    const pts: [number, number, number][] = [
      [side * 0.52, 0.62, 0.42], [side * 0.72, 0.5, 0.1],
      [side * 0.76, 0.4, -0.22], [side * 0.62, 0.34, -0.5],
    ]
    const t = taperedTube(pts, u => 0.105 - 0.035 * u, M.limbic, 40, 12)
    t.scale.y = 0.85
    return t
  }
  api.add('hippocampus', pulseMesh(hippo(-1)))
  api.add('hippocampus', pulseMesh(hippo(1)))

  /* ── amygdala: almond clusters at the hippocampus head ──────────────── */
  const almond = (side: 1 | -1) => {
    const a = new THREE.Mesh(new THREE.SphereGeometry(0.145, 30, 20), M.amygdala)
    a.position.set(side * 0.68, 0.42, 0.34)
    a.scale.set(0.85, 1.0, 1.35)
    a.rotation.z = side * 0.5
    return a
  }
  api.add('amygdala', pulseMesh(almond(-1)))
  api.add('amygdala', pulseMesh(almond(1)))

  /* ── cerebellum: striped orb tucked under the back ──────────────────── */
  const cb = new THREE.Mesh(new THREE.SphereGeometry(0.62, 56, 40), M.cerebellum)
  cb.position.set(0, 0.02, -1.18)
  cb.scale.set(1.3, 0.82, 0.85)
  api.add('cerebellum', pulseMesh(cb))
  api.add('cerebellum', cap([0, 0.1, -0.62], 0.3, M.cerebellum))

  /* ── brainstem: midbrain → pons (bulge) → medulla, plus spinal cord ─── */
  api.add('brainstem', taperedTube(
    [[0, 0.68, -0.3], [0, 0.32, -0.24], [0, -0.05, -0.3], [0, -0.42, -0.36], [0, -0.78, -0.34]],
    u => (u < 0.35 ? 0.2 + 0.06 * Math.sin(u / 0.35 * Math.PI) : 0.21 - 0.1 * ((u - 0.35) / 0.65)),
    M.stem, 48, 16,
  ))
  api.add('brainstem', taperedTube(
    [[0, -0.72, -0.34], [0, -1.2, -0.36], [0, -1.72, -0.38]],
    u => 0.115 - 0.025 * u, M.stem, 28, 12,
  ))

  /* ── neural sparks: twinkling glow sprites on the cortex (decor) ────── */
  const glowTex = (() => {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const x = c.getContext('2d')!
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,240,190,.95)')
    g.addColorStop(0.35, 'rgba(255,190,120,.4)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    x.fillStyle = g; x.fillRect(0, 0, 64, 64)
    return new THREE.CanvasTexture(c)
  })()
  const rand = rng(20240915)
  for (let i = 0; i < 16; i++) {
    const sm = new THREE.SpriteMaterial({
      map: glowTex, transparent: true, opacity: 0, depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    sm.userData.phase = rand() * Math.PI * 2
    sm.userData.speed = 1.1 + rand() * 1.6
    const sp = new THREE.Sprite(sm)
    // distribute over the upper cortex (both hemispheres)
    const side = rand() > 0.5 ? 1 : -1
    const th = rand() * Math.PI * 2
    const ph = rand() * 0.75
    sp.position.set(
      side * 0.56 + side * (0.55 + 0.82 * Math.cos(ph) * Math.cos(th) * 0.86),
      1.12 + 1.1 * Math.sin(ph),
      0.05 + 1.15 * Math.cos(ph) * Math.sin(th) * 1.02,
    )
    sp.scale.setScalar(0.14 + rand() * 0.12)
    sparkMats.push(sm)
    api.addDecor(sp)
  }

  /* ── flow: neural signals — sensory up · motor down · limbic loop ───── */
  api.addFlow({
    guideColor: 0xd8a8f0,
    guideOpacity: 0.2,
    curves: [
      // sensory: body → spinal cord → brainstem → thalamus → cortex
      {
        pts: [[0, -1.72, -0.38], [0, -0.8, -0.34], [0, 0.1, -0.29], [0, 0.72, -0.24],
              [-0.42, 0.88, -0.02], [-0.35, 1.45, 0.05], [-0.3, 2.05, 0.1]],
        count: 7, speed: 0.045, color: 0xbef2ff, glow: 0x62d8ff,
      },
      // motor: cortex → brainstem → body
      {
        pts: [[0.32, 2.02, 0.12], [0.4, 1.4, 0.0], [0.44, 0.9, -0.04], [0.1, 0.5, -0.2],
              [0, -0.1, -0.3], [0, -0.9, -0.35], [0, -1.72, -0.38]],
        count: 7, speed: 0.045, color: 0xffd0a8, glow: 0xffa04a,
      },
      // limbic loop: hippocampus → fornix → hypothalamus → amygdala → back
      {
        pts: [[0.62, 0.4, -0.42], [0.5, 0.75, 0.05], [0.2, 0.98, 0.2], [0, 0.6, 0.24],
              [0.45, 0.42, 0.34], [0.66, 0.42, 0.0], [0.62, 0.4, -0.42]],
        count: 5, speed: 0.032, color: 0xffc0da, glow: 0xe87ab0,
      },
    ],
  })
}

/* ── "thinking" idle animation: CSF pulse + cortical spark twinkle ────── */
export function tickBrain({ t, part, exploded }: SystemTickAPI) {
  if (!exploded) {
    const k = 1 + 0.006 * Math.sin(t * 1.7)
    const kk = 1 + 0.006 * Math.sin(t * 1.7 + 0.6)
    const pulse = (key: string, f: number) => {
      part(key)?.forEach(m => {
        const bs = m.userData.bs as THREE.Vector3 | undefined
        if (bs) m.scale.set(bs.x * (f === 0 ? k : kk), bs.y * (f === 0 ? k : kk), bs.z * (f === 0 ? k : kk))
      })
    }
    pulse('cerebrum', 0)
    pulse('cerebellum', 1)
  }
  for (const m of sparkMats) {
    // twinkle: sharp rise, slow fade — like a neuron firing
    const u = (t * (m.userData.speed as number) + (m.userData.phase as number)) % (Math.PI * 2)
    m.opacity = Math.max(0, Math.sin(u)) ** 3 * 0.85
  }
}
