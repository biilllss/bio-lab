import * as THREE from 'three'
import type { SystemBuildAPI } from '../../types'
import { blob, cap, makeNoise, mat, taperedTube, V3 } from '../../engine/helpers'

/**
 * THE NERVE CELL (NEURON) — third topic; shows the engine's range beyond
 * organs: recursive dendrite trees, segmented myelin, Ranvier rings and an
 * animated action potential running the length of the cell.
 */

/** Deterministic RNG so the neuron looks identical on every load. */
function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const AXON_PTS: [number, number, number][] = [
  [-1.7, 0.42, 0.0], [-0.9, 0.3, 0.05], [0, 0.15, -0.05], [0.9, 0.05, 0.08],
  [1.8, -0.05, -0.06], [2.6, -0.12, 0.05], [3.3, -0.18, 0.0],
]

export function buildNeuron(api: SystemBuildAPI) {
  const rand = rng(20240117)

  const M = {
    neurite: mat(0xa794c4, { roughness: 0.55, clearcoat: 0.25 }),
    axon: mat(0xb7a6cf, { roughness: 0.5, clearcoat: 0.3 }),
    myelin: mat(0xe0c377, { roughness: 0.42, clearcoat: 0.55, clearcoatRoughness: 0.3 }),
    nodes: mat(0x8fd8e8, { roughness: 0.3, clearcoat: 0.7, emissive: 0x1d4c58 }),
    nucleus: mat(0x7b57a8, { roughness: 0.35, clearcoat: 0.5 }),
  }
  const bump: [THREE.MeshPhysicalMaterial, number, number][] = [
    [M.neurite, 3, 0.01], [M.axon, 3, 0.008], [M.myelin, 2, 0.014],
  ]
  bump.forEach(([m, rep, amp]) => {
    m.bumpMap = makeNoise(rep); m.bumpScale = amp; m.roughnessMap = m.bumpMap
  })
  api.addMaterials(Object.values(M))

  /* ── soma + nucleus ─────────────────────────────────────────────────── */
  api.add('soma', blob([-2.55, 0.55, 0], 0.78, M.neurite, [1.08, 0.95, 0.92], 0.022, 3.2))
  api.add('nucleus', blob([-2.6, 0.62, 0.05], 0.34, M.nucleus, [1, 1.05, 0.95], 0.02, 4))

  /* ── recursive dendrite tree ────────────────────────────────────────── */
  const branch = (
    start: THREE.Vector3,
    dir: THREE.Vector3,
    len: number,
    r0: number,
    depth: number,
  ) => {
    const jitter = (a: number) => (rand() * 2 - 1) * a
    const mid = start.clone()
      .addScaledVector(dir, len * 0.5)
      .add(new THREE.Vector3(jitter(0.18), jitter(0.12), jitter(0.18)))
    const end = start.clone()
      .addScaledVector(dir, len)
      .add(new THREE.Vector3(jitter(0.22), jitter(0.16), jitter(0.22)))
    api.add('dendrites', taperedTube(
      [[start.x, start.y, start.z], [mid.x, mid.y, mid.z], [end.x, end.y, end.z]],
      u => r0 * (1 - 0.55 * u), M.neurite, 20, 8))
    if (depth > 0) {
      const dirA = dir.clone()
        .add(new THREE.Vector3(0.3 + rand() * 0.6, 0.2 + rand() * 0.5, jitter(0.5)))
        .normalize()
      const dirB = dir.clone()
        .add(new THREE.Vector3(-(0.3 + rand() * 0.6), jitter(0.6), jitter(0.5)))
        .normalize()
      branch(end, dirA, len * 0.72, r0 * 0.58, depth - 1)
      branch(end, dirB, len * 0.72, r0 * 0.58, depth - 1)
    } else {
      api.add('dendrites', cap([end.x, end.y, end.z], r0 * 0.9, M.neurite))
    }
  }
  const somaC = V3(-2.55, 0.55, 0)
  const roots: [THREE.Vector3, number][] = [
    [V3(-0.55, 1, -0.12).normalize(), 0.13],
    [V3(-0.05, 1, 0.3).normalize(), 0.12],
    [V3(-1, 0.1, 0.05).normalize(), 0.14],
    [V3(-0.5, -0.9, 0.18).normalize(), 0.12],
    [V3(0.05, -1, -0.22).normalize(), 0.11],
    [V3(-0.35, 0.35, 0.95).normalize(), 0.1],
  ]
  roots.forEach(([dir, r]) => {
    const start = somaC.clone().addScaledVector(dir, 0.68)
    branch(start, dir, 1.15, r, 2)
  })

  /* ── axon hillock + axon ────────────────────────────────────────────── */
  api.add('hillock', blob([-1.72, 0.42, 0.02], 0.22, M.neurite, [1.35, 0.8, 0.8], 0.01, 4))
  api.add('axon', taperedTube(AXON_PTS, u => 0.11 - 0.02 * u, M.axon, 90, 10))
  api.add('axon', cap(AXON_PTS[0], 0.11, M.axon))

  /* ── myelin segments along the axon (with gaps = nodes) ─────────────── */
  const axonCurve = new THREE.CatmullRomCurve3(AXON_PTS.map(p => V3(...p)))
  const SEG_N = 5
  const U0 = 0.06
  const U1 = 0.965
  const span = (U1 - U0) / SEG_N
  const segU = (i: number) => ({ a: U0 + i * span + 0.008, b: U0 + (i + 1) * span - 0.008 })
  for (let i = 0; i < SEG_N; i++) {
    const { a, b } = segU(i)
    const pts: [number, number, number][] = []
    const steps = 10
    for (let k = 0; k <= steps; k++) {
      const u = a + (b - a) * (k / steps)
      const p = axonCurve.getPointAt(u)
      pts.push([p.x, p.y, p.z])
    }
    api.add('myelin', taperedTube(
      pts,
      u => 0.185 + 0.035 * Math.sin(Math.PI * u),
      M.myelin, 24, 12))
    api.add('myelin', cap(pts[0], 0.185, M.myelin))
    api.add('myelin', cap(pts[pts.length - 1], 0.185, M.myelin))
  }

  /* ── nodes of Ranvier: glowing rings in the gaps ────────────────────── */
  const ringGeo = new THREE.TorusGeometry(0.13, 0.028, 10, 24)
  const ringQ = new THREE.Quaternion()
  const ringAxis = new THREE.Vector3(0, 0, 1)
  for (let i = 0; i <= SEG_N; i++) {
    const u = U0 + i * span
    const p = axonCurve.getPointAt(u)
    const tan = axonCurve.getTangentAt(u)
    ringQ.setFromUnitVectors(ringAxis, tan)
    const ring = new THREE.Mesh(ringGeo, M.nodes)
    ring.position.copy(p)
    ring.quaternion.copy(ringQ)
    api.add('nodes', ring)
  }

  /* ── axon terminals ─────────────────────────────────────────────────── */
  const tip = V3(3.3, -0.18, 0)
  const outs: THREE.Vector3[] = [
    V3(4.1, 0.3, 0.12),
    V3(4.25, -0.02, -0.18),
    V3(4.05, -0.55, 0.15),
    V3(3.98, 0.02, 0.34),
    V3(4.3, -0.32, -0.02),
  ]
  outs.forEach(end => {
    const mid = tip.clone().add(end).multiplyScalar(0.5)
      .add(new THREE.Vector3(0.05, (rand() * 2 - 1) * 0.12, (rand() * 2 - 1) * 0.12))
    api.add('terminals', taperedTube(
      [[tip.x, tip.y, tip.z], [mid.x, mid.y, mid.z], [end.x, end.y, end.z]],
      u => 0.062 - 0.03 * u, M.axon, 18, 8))
    api.add('terminals', blob([end.x, end.y, end.z], 0.11, M.axon, [1, 1, 1], 0.02, 4))
  })

  /* ── action potential flow (dendrites → soma → axon → terminals) ────── */
  const mainRoute: [number, number, number][] = [
    [-2.55, 0.55, 0], [-1.72, 0.42, 0.02],
    ...AXON_PTS.slice(1),
    [4.1, 0.3, 0.12],
  ]
  api.addFlow({
    guideColor: 0x35d0c5,
    guideOpacity: 0.28,
    curves: [
      {
        pts: [[-3.5, 1.55, 0.15], [-2.9, 1.0, 0.1], ...mainRoute],
        count: 7, speed: 0.085, color: 0xcdfaff, glow: 0x54e0ff,
      },
      {
        pts: [[-3.45, -0.55, 0.25], [-2.95, 0.05, 0.15], ...mainRoute],
        count: 7, speed: 0.085, color: 0xcdfaff, glow: 0x54e0ff,
      },
    ],
  })
}
