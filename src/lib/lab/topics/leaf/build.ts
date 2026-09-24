import * as THREE from 'three'
import type { SystemBuildAPI, SystemTickAPI } from '../../types'
import { blob, mat, makeNoise, taperedTube } from '../../engine/helpers'

/**
 * PHOTOSYNTHESIS LEAF — twelfth topic. A full 3D slab of leaf tissue
 * seen face-on like the textbook cross-section: wavy wavy layer sheets
 * (cuticle, epidermises) over palisade towers stuffed with chloroplasts,
 * a central vascular bundle (xylem rings up top, phloem rings below,
 * wrapped in a sheath), a loose spongy maze with glowing air halls and
 * two breathing stomata on the underside. Translucent cells (the plant
 * cell's "ghost shell" lesson) keep the chloroplasts readable. The
 * Transpiration Stream runs water up the xylem, CO₂ in through a stoma,
 * O₂ out the other one and sugar away down the phloem.
 */

/* ── wavy layer sheet: every vertex column follows a top/bottom wave ───── */
function layerSlab(
  x0: number, x1: number,
  topFn: (x: number) => number, botFn: (x: number) => number,
  m: THREE.Material, d = 0.66, xSeg = 88, zSeg = 6,
): THREE.Mesh {
  const g = new THREE.BoxGeometry(x1 - x0, 1, d, xSeg, 4, zSeg)
  const p = g.attributes.position
  const cx = (x0 + x1) / 2
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + cx
    const u = p.getY(i) + 0.5 // 0 bottom → 1 top
    p.setXYZ(i, x, botFn(x) + (topFn(x) - botFn(x)) * u, p.getZ(i))
  }
  g.computeVertexNormals()
  return new THREE.Mesh(g, m)
}

/* shared layer boundary waves (adjacent layers interlock) */
const top = (x: number) => 1.02 + 0.032 * Math.sin(1.7 * x) + 0.016 * Math.sin(4.3 * x + 1) // cuticle surface
const cutB = (x: number) => 0.88 + 0.02 * Math.sin(2.3 * x + 0.7) // cuticle/upper-epi
const epiB = (x: number) => 0.5 + 0.045 * Math.sin(2.9 * x + 1.2) // upper-epi/palisade
const palB = (x: number) => -0.1 + 0.05 * Math.sin(2.5 * x + 2) // palisade/spongy
const sponB = (x: number) => -0.6 + 0.04 * Math.sin(3.1 * x + 0.4) // spongy/lower-epi
const bot = (x: number) => -0.96 + 0.03 * Math.sin(2.1 * x + 1.7) // underside

/* the two stoma gaps in the lower epidermis */
const STOMA_X = [-1.3, 1.2]
const GAP = 0.24

export function buildLeaf(api: SystemBuildAPI) {
  const M = {
    cuticle: mat(0xe8d8a0, {
      roughness: 0.25, clearcoat: 0.85, clearcoatRoughness: 0.2,
      transparent: true, opacity: 0.5, depthWrite: false,
      emissive: 0x1a1504, emissiveIntensity: 0.3,
    }),
    epi: mat(0xcfe0b4, {
      roughness: 0.4, sheen: 0.4, side: THREE.DoubleSide,
      transparent: true, opacity: 0.45, depthWrite: false,
      emissive: 0x0c1406, emissiveIntensity: 0.3,
    }),
    palisade: mat(0x5a9e4a, {
      roughness: 0.45, sheen: 0.35, transparent: true, opacity: 0.5, depthWrite: false,
      emissive: 0x0a1e06, emissiveIntensity: 0.4,
    }),
    spongy: mat(0x5e9e48, {
      roughness: 0.5, sheen: 0.3, transparent: true, opacity: 0.74, depthWrite: false,
      emissive: 0x0a1e06, emissiveIntensity: 0.52,
    }),
    chloro: mat(0x3f8e36, {
      roughness: 0.4, clearcoat: 0.45, sheen: 0.3,
      emissive: 0x061804, emissiveIntensity: 0.45,
    }),
    grana: mat(0x2a6e26, { roughness: 0.5, clearcoat: 0.3, emissive: 0x041404, emissiveIntensity: 0.35 }),
    sheath: mat(0x3a6e2e, {
      roughness: 0.5, clearcoat: 0.3, transparent: true, opacity: 0.8, depthWrite: false,
      emissive: 0x061404, emissiveIntensity: 0.35,
    }),
    xylem: mat(0xc89070, { roughness: 0.42, clearcoat: 0.5, emissive: 0x1a0c06, emissiveIntensity: 0.3 }),
    phloem: mat(0x9ec46f, { roughness: 0.45, clearcoat: 0.4, emissive: 0x121a04, emissiveIntensity: 0.3 }),
    air: mat(0xbfe0e8, {
      roughness: 0.7, transparent: true, opacity: 0.1, depthWrite: false,
      emissive: 0x0c1a20, emissiveIntensity: 0.5,
    }),
    guard: mat(0x4a8e3e, {
      roughness: 0.4, clearcoat: 0.5, sheen: 0.3,
      emissive: 0x061804, emissiveIntensity: 0.4,
    }),
    pore: mat(0x1c3214, { roughness: 0.7, emissive: 0x000000, emissiveIntensity: 0 }),
  }
  M.cuticle.bumpMap = makeNoise(4); M.cuticle.bumpScale = 0.004
  api.addMaterials(Object.values(M))

  /* ══ LAYER SHEETS (cuticle + epidermises; lower epi has stoma gaps) ══ */
  api.add('cuticle', layerSlab(-3.2, 3.2, top, cutB, M.cuticle, 0.6))
  api.add('upperEpi', layerSlab(-3.2, 3.2, cutB, epiB, M.epi, 0.66))

  // lower epidermis: 3 segments around the two stoma gaps
  const segs: [number, number][] = [[-3.2, STOMA_X[0] - GAP], [STOMA_X[0] + GAP, STOMA_X[1] - GAP], [STOMA_X[1] + GAP, 3.2]]
  for (const [x0, x1] of segs) api.add('lowerEpi', layerSlab(x0, x1, sponB, bot, M.epi, 0.66))

  /* ══ PALISADE TOWERS — tall green columns with chloroplasts inside ═══ */
  const PX = [-2.75, -2.05, -1.35, -0.65, 0.65, 1.35, 2.05, 2.75]
  for (const x of PX) {
    const cy = (epiB(x) + palB(x)) / 2
    const cell = blob([x, cy, -0.02], 0.26, M.palisade, [1, 1.5, 0.78], 0.02, 3)
    api.add('palisade', cell)
    // chloroplasts: 3 green lenses per cell, front-shifted so they read
    for (let i = 0; i < 3; i++) {
      const chy = cy + (i - 1) * 0.2
      const ch = blob([x + 0.02 * Math.sin(x * 7 + i * 2), chy, 0.14], 0.085, M.chloro, [1.5, 0.85, 0.7], 0.008, 3)
      ch.rotation.z = 0.3 * Math.sin(x * 3 + i)
      api.add('chloroplast', ch)
      // a grana coin stack inside every other chloroplast
      if ((i + Math.round(x * 10)) % 2 === 0) {
        for (let d = 0; d < 3; d++) {
          const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 10), M.grana)
          disc.position.set(ch.position.x - 0.03, chy - 0.025 + d * 0.026, 0.2)
          disc.rotation.x = Math.PI / 2.4
          api.add('chloroplast', disc)
        }
      }
    }
  }

  /* ══ VEIN BUNDLE — sheath + xylem rings (top) + phloem rings (bottom) ═ */
  const sheath = blob([0, 0.16, -0.04], 0.5, M.sheath, [1.35, 1.02, 0.72], 0.015, 3)
  api.add('vein', sheath)
  // xylem: three big vessel rings (z-axis cylinders → circles in section)
  const XY: [number, number][] = [[-0.2, 0.32], [0.14, 0.36], [0.02, 0.2]]
  for (const [x, y] of XY) {
    const v = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.5, 18), M.xylem)
    v.rotation.x = Math.PI / 2
    v.position.set(x, y, -0.04)
    api.add('xylem', v)
  }
  // phloem: five smaller tubes clustered underneath
  const PH: [number, number][] = [[-0.22, -0.12], [-0.06, -0.16], [0.1, -0.12], [0.26, -0.08], [-0.14, -0.02]]
  for (const [x, y] of PH) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.44, 12), M.phloem)
    p.rotation.x = Math.PI / 2
    p.position.set(x, y, -0.05)
    api.add('phloem', p)
  }

  /* ══ SPONGY MAZE — loose irregular blobs between the layers ══════════ */
  const SP: [number, number, number][] = [
    [-2.7, -0.36, -0.05], [-2.2, -0.28, 0.1], [-1.75, -0.38, -0.08],
    [-0.85, -0.34, 0.05], [-0.4, -0.4, -0.06], [0.95, -0.36, 0.02],
    [1.5, -0.3, -0.08], [2.0, -0.38, 0.08], [2.6, -0.3, -0.04], [-1.1, -0.28, -0.1],
  ]
  for (const [x, y, z] of SP) {
    api.add('spongy', blob([x, y, z], 0.17, M.spongy, [1.15, 0.85, 0.9], 0.05, 4))
  }

  /* ══ AIR SPACES — faint cyan halls under each stoma ══════════════════ */
  for (const x of STOMA_X) {
    const hall = blob([x, -0.48, -0.02], 0.3, M.air, [1.5, 0.62, 0.85], 0.02, 3)
    hall.renderOrder = 1
    api.add('airSpace', hall)
  }

  /* ══ STOMATA — kidney guard cells + dark pore on the underside ═══════ */
  for (const x of STOMA_X) {
    const y = bot(x) - 0.06
    // two guard cells flanking the pore (bean-ish, bulging below)
    const g1 = blob([x - 0.17, y - 0.02, -0.02], 0.15, M.guard, [0.75, 0.62, 0.72], 0.02, 3)
    const g2 = blob([x + 0.17, y - 0.02, -0.02], 0.15, M.guard, [0.75, 0.62, 0.72], 0.02, 3)
    g1.rotation.z = 0.25; g2.rotation.z = -0.25
    api.add('guardCell', g1); api.add('guardCell', g2)
    // the pore: dark slit disc between them
    const pore = new THREE.Mesh(new THREE.CircleGeometry(0.09, 18), M.pore)
    pore.position.set(x, y - 0.02, -0.02)
    pore.scale.set(0.55, 1, 1)
    pore.rotation.x = Math.PI / 2.6
    api.add('stoma', pore)
  }

  /* ══ FLOW — Transpiration Stream ══════════════════════════════════════ */
  api.addFlow({
    guideColor: 0x8ec8b0,
    guideOpacity: 0.13,
    curves: [
      { // water up: stem → xylem → out to the palisade walls
        pts: [[-2.7, -1.75, 0], [-1.7, -1.0, 0], [-0.7, -0.15, -0.04], [0, 0.25, -0.04], [0.5, 0.4, -0.04]],
        count: 6, speed: 0.055, color: 0x9ad0f0, glow: 0x5aa8e0, tail: false,
      },
      { // CO2 in: through the right stoma into the air halls → palisade
        pts: [[1.2, -1.85, 0], [1.2, -0.95, 0], [1.25, -0.5, 0.1], [0.9, 0.0, 0.14], [0.7, 0.35, 0.14]],
        count: 4, speed: 0.05, color: 0xc8e8b0, glow: 0x8ad07a, tail: false,
      },
      { // O2 out: palisade → air maze → left stoma → sky
        pts: [[-0.6, 0.3, 0.12], [-0.85, -0.3, 0.05], [-1.2, -0.75, 0], [-1.3, -1.85, 0]],
        count: 4, speed: 0.05, color: 0xa8e8c8, glow: 0x60d8a0, tail: false,
      },
      { // sugar away: phloem → down and right, out of the leaf
        pts: [[0.12, -0.15, 0], [0.8, -0.55, 0], [1.9, -1.15, 0], [2.95, -1.8, 0]],
        count: 5, speed: 0.05, color: 0xffe9a8, glow: 0xffd25a, tail: false,
      },
    ],
  })
}

/* ── "photosynthesis shimmer": chloroplast glow + breathing stomata ────── */
export function tickLeaf({ t, part, exploded }: SystemTickAPI) {
  if (exploded) return
  // chloroplasts pulse with the light beat (phase-staggered)
  part('chloroplast')?.forEach(m => {
    const mm = (m as THREE.Mesh).material as THREE.MeshPhysicalMaterial | undefined
    const ph = (m.userData.ph ??= ((m as THREE.Mesh).id % 10) * 0.63)
    if (mm && 'emissiveIntensity' in mm) mm.emissiveIntensity = 0.45 + 0.15 * Math.sin(t * 1.7 + ph)
  })
  // guard cells breathe: swell wide/flat to open the pore, relax to close
  part('guardCell')?.forEach((m, i) => {
    const bs = (m.userData.bs ??= m.scale.clone()) as THREE.Vector3
    const k = 1 + 0.05 * Math.sin(t * 0.8 + i * 0.9)
    m.scale.set(bs.x * k, bs.y * (2 - k), bs.z * k)
  })
  // spongy cells drift gently in the air tide
  part('spongy')?.forEach(m => {
    const bp = (m.userData.bp ??= m.position.clone()) as THREE.Vector3
    m.position.set(bp.x, bp.y + 0.012 * Math.sin(t * 0.9 + bp.x * 2.2), bp.z)
  })
  // air halls shimmer faintly
  part('airSpace')?.forEach(m => {
    const mm = (m as THREE.Mesh).material as THREE.MeshPhysicalMaterial | undefined
    if (mm && 'emissiveIntensity' in mm) mm.emissiveIntensity = 0.5 + 0.2 * Math.sin(t * 1.3)
  })
}
