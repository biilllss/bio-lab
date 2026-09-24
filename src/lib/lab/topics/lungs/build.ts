import * as THREE from 'three'
import type { SystemBuildAPI } from '../../types'
import { blob, mat, makeNoise, taperedTube } from '../../engine/helpers'

/**
 * THE LUNGS & BREATHING — fourth topic; first to use the engine's per-frame
 * `tick` hook: the lungs visibly inflate/deflate while the diaphragm flattens.
 */
export function buildLungs(api: SystemBuildAPI) {
  const M = {
    airway: mat(0xd7a09e, { roughness: 0.48, clearcoat: 0.3 }),
    ring: mat(0xe8e0d0, { roughness: 0.4, clearcoat: 0.4 }),
    bronchus: mat(0xcf968f, { roughness: 0.48, clearcoat: 0.28 }),
    bronchiole: mat(0xd9a49b, { roughness: 0.5 }),
    rlung: mat(0xd98d80, { roughness: 0.52, clearcoat: 0.22 }),
    llung: mat(0xd2837e, { roughness: 0.52, clearcoat: 0.22 }),
    alveoli: mat(0xf0b8ab, { roughness: 0.42, clearcoat: 0.5 }),
    pleura: mat(0xf2d9de, {
      transparent: true, opacity: 0.09, roughness: 0.3,
      depthWrite: false, side: THREE.DoubleSide,
    }),
    diaphragm: mat(0xb85a50, { roughness: 0.55 }),
    rib: mat(0xe6ded0, { transparent: true, opacity: 0.42, roughness: 0.35, clearcoat: 0.4 }),
  }
  const bump: [THREE.MeshPhysicalMaterial, number, number][] = [
    [M.rlung, 4, 0.016], [M.llung, 4, 0.016], [M.airway, 2, 0.008],
    [M.bronchus, 2, 0.008], [M.diaphragm, 3, 0.012],
  ]
  bump.forEach(([m, rep, amp]) => {
    m.bumpMap = makeNoise(rep); m.bumpScale = amp; m.roughnessMap = m.bumpMap
  })
  api.addMaterials(Object.values(M))

  /* meshes that breathe (base scale kept in userData for the tick hook) ── */
  const breath = (m: THREE.Mesh) => {
    m.userData.bs = m.scale.clone()
    return m
  }

  /* trachea: tube + cartilage rings ───────────────────────────────────── */
  api.add('trachea', taperedTube(
    [[0, 3.32, 0.42], [0, 2.55, 0.41], [0, 1.9, 0.4], [0, 1.66, 0.38]],
    u => 0.155 - 0.012 * u, M.airway, 40, 14))
  for (let i = 0; i < 8; i++) {
    const y = 3.18 - i * 0.2
    const z = 0.415 - (3.18 - y) * 0.017
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.162, 0.03, 8, 26), M.ring)
    ring.position.set(0, y, z)
    ring.rotation.x = Math.PI / 2
    ring.scale.set(1, 1, 0.88)
    api.add('trachea', ring)
  }

  /* main bronchi ──────────────────────────────────────────────────────── */
  api.add('rbronchus', taperedTube(
    [[-0.02, 1.72, 0.38], [-0.36, 1.52, 0.3], [-0.63, 1.34, 0.2]],
    u => 0.115 - 0.032 * u, M.bronchus, 36, 12))
  api.add('lbronchus', taperedTube(
    [[0.02, 1.72, 0.38], [0.38, 1.5, 0.3], [0.63, 1.3, 0.2]],
    u => 0.108 - 0.03 * u, M.bronchus, 36, 12))

  /* bronchiole branches ───────────────────────────────────────────────── */
  const twig = (pts: [number, number, number][]) =>
    api.add('bronchioles', taperedTube(pts, u => 0.05 - 0.042 * u, M.bronchiole, 24, 8))
  // right lung
  twig([[-0.63, 1.34, 0.2], [-0.86, 1.18, 0.14], [-1.04, 1.02, 0.1]])
  twig([[-0.63, 1.34, 0.2], [-0.82, 0.98, 0.26], [-0.97, 0.78, 0.28]])
  twig([[-0.63, 1.34, 0.2], [-0.76, 1.14, -0.06], [-0.92, 0.94, -0.16]])
  twig([[-0.63, 1.34, 0.2], [-0.72, 1.5, 0.02], [-0.88, 1.56, -0.08]])
  // left lung
  twig([[0.63, 1.3, 0.2], [0.87, 1.14, 0.14], [1.05, 0.98, 0.1]])
  twig([[0.63, 1.3, 0.2], [0.84, 0.94, 0.24], [1.0, 0.76, 0.26]])
  twig([[0.63, 1.3, 0.2], [0.8, 1.1, -0.06], [0.97, 0.9, -0.16]])

  /* alveoli clusters (grapes of air sacs) ─────────────────────────────── */
  const sac = (p: [number, number, number]) => api.add('alveoli', blob(p, 0.085, M.alveoli, [1, 0.92, 1], 0.05, 5))
  const cluster = (cx: number, cy: number, cz: number, flip: number) => {
    const offs: [number, number, number][] = [
      [0, 0, 0], [0.11, 0.07, 0.04], [-0.1, 0.08, -0.03], [0.05, -0.1, 0.06],
      [-0.08, -0.09, -0.05], [0.09, 0.0, -0.08], [-0.06, 0.02, 0.1], [0.03, 0.13, -0.02],
    ]
    offs.forEach(([dx, dy, dz]) => sac([cx + dx * flip, cy + dy, cz + dz]))
  }
  cluster(-1.2, 0.62, 0.22, -1)
  cluster(1.14, 0.6, 0.2, 1)

  /* right lung — 3 lobes ──────────────────────────────────────────────── */
  api.add('rlung', breath(blob([-0.95, 2.04, 0.0], 0.52, M.rlung, [0.82, 1.0, 0.72], 0.022, 3.2)))
  api.add('rlung', breath(blob([-1.03, 1.38, 0.1], 0.48, M.rlung, [0.85, 0.85, 0.76], 0.022, 3.4)))
  api.add('rlung', breath(blob([-0.95, 0.74, 0.02], 0.56, M.rlung, [0.85, 0.95, 0.8], 0.022, 3.1)))

  /* left lung — 2 lobes + cardiac notch ───────────────────────────────── */
  api.add('llung', breath(blob([0.92, 1.96, 0.0], 0.52, M.llung, [0.8, 1.05, 0.72], 0.022, 3.3)))
  api.add('llung', breath(blob([0.92, 1.0, 0.05], 0.58, M.llung, [0.82, 0.95, 0.8], 0.022, 3.1)))

  /* pleura wrapping each lung ─────────────────────────────────────────── */
  api.add('pleura', breath(blob([-0.97, 1.38, 0.02], 1.04, M.pleura, [0.9, 1.02, 0.8], 0.008, 2)))
  api.add('pleura', breath(blob([0.94, 1.44, 0.02], 1.0, M.pleura, [0.88, 1.02, 0.78], 0.008, 2)))

  /* diaphragm dome under the lungs ────────────────────────────────────── */
  const dia = new THREE.Mesh(
    new THREE.LatheGeometry(
      [[0.02, 0.2], [0.55, 0.17], [1.05, 0.1], [1.5, 0.045], [1.92, 0.0]].map(p => new THREE.Vector2(p[0], p[1])),
      52),
    M.diaphragm,
  )
  dia.material.side = THREE.DoubleSide
  dia.position.set(0, -0.14, 0.1)
  dia.scale.set(1.02, 1.0, 0.74)
  api.add('diaphragm', breath(dia))

  /* rib cage — arcs around each side + sternum bar ────────────────────── */
  const ribArc = (side: 1 | -1, y0: number, R: number) => {
    const pts: [number, number, number][] = []
    for (let i = 0; i <= 8; i++) {
      const u = i / 8
      const th = (-0.35 + u * 2.9) // radians, wraps from back-low to front
      pts.push([
        side * (0.12 + R * Math.cos(th)),
        y0 - 0.22 * u + 0.06 * Math.sin(u * Math.PI),
        0.08 + R * 0.62 * Math.sin(th) * 0.85 - 0.1 * Math.cos(th),
      ])
    }
    return taperedTube(pts, () => 0.042, M.rib, 40, 8)
  }
  for (let i = 0; i < 5; i++) {
    const y0 = 2.28 - i * 0.42
    const R = 1.02 + 0.05 * Math.sin(i * 1.1)
    api.add('ribs', ribArc(-1, y0, R))
    api.add('ribs', ribArc(1, y0, R + 0.04))
  }
  api.add('ribs', taperedTube(
    [[0.05, 2.32, 0.86], [0.05, 1.7, 0.92], [0.05, 1.2, 0.94]],
    () => 0.055, M.rib, 24, 10))

  /* ── gas exchange flow: air in (O₂) · air out (CO₂) · capillary swap ── */
  api.addFlow({
    guideColor: 0x6fd0e8,
    guideOpacity: 0.24,
    curves: [
      // O₂ rich air — in, down the airways to the right alveoli
      {
        pts: [[0, 3.75, 0.42], [0, 2.6, 0.41], [0, 1.7, 0.38],
              [-0.36, 1.5, 0.28], [-0.64, 1.33, 0.19], [-0.92, 1.0, 0.24], [-1.2, 0.66, 0.22]],
        count: 7, speed: 0.05, color: 0xaef0ff, glow: 0x5fd0ff,
      },
      // CO₂ — from the left alveoli up and out
      {
        pts: [[1.14, 0.64, 0.2], [1.0, 0.95, 0.16], [0.64, 1.29, 0.2],
              [0.36, 1.49, 0.3], [0, 1.72, 0.38], [0, 2.7, 0.41], [0, 3.75, 0.42]],
        count: 6, speed: 0.045, color: 0xd8d4e8, glow: 0x9a92b8,
      },
      // deoxygenated blood arriving at the sacs
      {
        pts: [[-1.62, 0.5, 0.05], [-1.4, 0.58, 0.14], [-1.22, 0.62, 0.22]],
        count: 4, speed: 0.06, color: 0x8fb7ff, glow: 0x4a7fd6,
      },
      // freshly oxygenated blood leaving
      {
        pts: [[-1.2, 0.68, 0.26], [-1.4, 0.86, 0.3], [-1.6, 1.02, 0.24]],
        count: 4, speed: 0.06, color: 0xff9d8a, glow: 0xd64545,
      },
    ],
  })
}

/* breathing: lungs inflate while the diaphragm flattens — engine `tick` hook */
export function tickLungs({ t, part }: { t: number; part: (k: string) => THREE.Object3D[] | undefined }) {
  const phase = Math.sin(t * 1.25)
  const k = 1 + 0.05 * phase
  const setK = (key: string, fy = 1) => {
    part(key)?.forEach(m => {
      const bs = m.userData.bs as THREE.Vector3 | undefined
      if (bs) m.scale.set(bs.x * k, bs.y * k * fy, bs.z * k)
    })
  }
  setK('rlung'); setK('llung'); setK('pleura')
  setK('diaphragm', 1 - 0.18 * phase) // contracts (flattens) on inhale
}
