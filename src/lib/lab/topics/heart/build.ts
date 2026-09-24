import * as THREE from 'three'
import type { SystemBuildAPI } from '../../types'
import { blob, makeNoise, mat, taperedTube } from '../../engine/helpers'

/**
 * THE HUMAN HEART — a second topic proving the module pattern.
 * Built with the same helper kit as every other topic: blobs for chambers,
 * tapered tubes for vessels, one flow system per circulation loop.
 */
export function buildHeart(api: SystemBuildAPI) {
  const M = {
    ra: mat(0x8a6da8, { roughness: 0.5, clearcoat: 0.3 }),
    rv: mat(0x9577b0, { roughness: 0.5, clearcoat: 0.3 }),
    la: mat(0xc4545c, { roughness: 0.5, clearcoat: 0.3 }),
    lv: mat(0xb84a55, { roughness: 0.48, clearcoat: 0.35 }),
    aorta: mat(0xcf5560, { roughness: 0.4, clearcoat: 0.45 }),
    pa: mat(0x7a5f9e, { roughness: 0.42, clearcoat: 0.45 }),
    vein: mat(0x6f5490, { roughness: 0.45 }),
    pv: mat(0xc76a6a, { roughness: 0.45 }),
    coronary: mat(0xa63242, { roughness: 0.4, clearcoat: 0.5 }),
    pericardium: mat(0xe8d0d5, {
      transparent: true, opacity: 0.1, roughness: 0.35,
      depthWrite: false, side: THREE.DoubleSide,
    }),
  }
  const bump: [THREE.MeshPhysicalMaterial, number, number][] = [
    [M.ra, 3, 0.012], [M.rv, 4, 0.014], [M.la, 3, 0.01], [M.lv, 4, 0.014],
    [M.aorta, 3, 0.008], [M.pa, 3, 0.008], [M.vein, 3, 0.008], [M.pv, 3, 0.008],
    [M.coronary, 2, 0.006],
  ]
  bump.forEach(([m, rep, amp]) => {
    m.bumpMap = makeNoise(rep); m.bumpScale = amp; m.roughnessMap = m.bumpMap
  })
  api.addMaterials(Object.values(M))

  /* chambers ──────────────────────────────────────────────────────────── */
  api.add('ra', blob([-0.72, 1.2, 0.0], 0.5, M.ra, [0.9, 1.15, 0.85], 0.02, 3.4))
  api.add('rv', blob([-0.28, 0.42, 0.28], 0.6, M.rv, [1.0, 1.25, 0.85], 0.02, 3.2))
  api.add('la', blob([-0.38, 1.95, -0.35], 0.45, M.la, [1.0, 0.8, 0.9], 0.018, 3.6))
  api.add('lv', blob([0.52, 0.62, -0.05], 0.62, M.lv, [1.0, 1.45, 0.95], 0.02, 3.0))

  /* aorta: root → arch (with 3 branch stubs) → descending ─────────────── */
  const aortaR = (u: number) => 0.17 - 0.025 * u
  api.add('aorta', taperedTube(
    [[0.25, 1.5, 0.05], [0.12, 2.1, -0.1], [-0.05, 2.55, -0.4],
     [0.18, 2.0, -0.85], [0.28, 1.0, -0.95], [0.32, 0.1, -0.95]],
    aortaR, M.aorta, 80, 14))
  api.add('aorta', blob([0.22, 1.52, 0.05], 0.24, M.aorta, [1, 0.9, 1], 0.015, 4))
  const archBranch = (a: [number, number, number], b: [number, number, number]) =>
    api.add('aorta', taperedTube([a, b], u => 0.055 - 0.012 * u, M.aorta, 16, 8))
  archBranch([-0.02, 2.52, -0.42], [0.0, 3.05, -0.45])
  archBranch([-0.09, 2.6, -0.44], [-0.2, 3.05, -0.48])
  archBranch([-0.15, 2.52, -0.5], [-0.36, 2.95, -0.58])

  /* pulmonary artery: trunk → L/R branches ────────────────────────────── */
  api.add('pa', taperedTube(
    [[-0.2, 1.28, 0.25], [-0.12, 1.9, 0.15], [-0.08, 2.3, 0.0]],
    u => 0.15 + 0.02 * u, M.pa, 48, 12))
  api.add('pa', taperedTube(
    [[-0.08, 2.3, 0.0], [-0.45, 2.25, -0.1], [-0.85, 2.15, -0.15]],
    u => 0.115 - 0.03 * u, M.pa, 40, 10))
  api.add('pa', taperedTube(
    [[-0.08, 2.3, 0.0], [0.32, 2.28, -0.12], [0.7, 2.2, -0.2]],
    u => 0.115 - 0.03 * u, M.pa, 40, 10))

  /* vena cavae ────────────────────────────────────────────────────────── */
  api.add('svc', taperedTube(
    [[-0.85, 1.62, 0.0], [-0.9, 2.2, -0.03], [-0.92, 2.75, -0.06]],
    () => 0.13, M.vein, 32, 10))
  api.add('ivc', taperedTube(
    [[-0.78, 0.68, -0.05], [-0.83, 0.1, -0.05], [-0.85, -0.45, -0.05]],
    () => 0.14, M.vein, 32, 10))

  /* pulmonary veins (4) ───────────────────────────────────────────────── */
  const pvPairs: [number, number, number][][] = [
    [[-1.1, 2.25, -0.5], [-0.75, 2.12, -0.45], [-0.45, 2.05, -0.4]],
    [[-1.05, 1.85, -0.58], [-0.72, 1.85, -0.5], [-0.45, 1.85, -0.42]],
    [[0.5, 2.3, -0.55], [0.15, 2.2, -0.5], [-0.15, 2.1, -0.45]],
    [[0.55, 1.95, -0.62], [0.18, 1.9, -0.55], [-0.12, 1.85, -0.46]],
  ]
  pvPairs.forEach(pts => api.add('pv', taperedTube(pts, () => 0.075, M.pv, 24, 8)))

  /* coronary arteries on the surface ──────────────────────────────────── */
  const coronR = (u: number) => 0.045 - 0.015 * u
  api.add('coronary', taperedTube(
    [[0.02, 1.38, 0.5], [0.08, 1.0, 0.55], [0.18, 0.55, 0.52],
     [0.3, 0.15, 0.45], [0.42, -0.05, 0.38]],
    coronR, M.coronary, 48, 8))
  api.add('coronary', taperedTube(
    [[-0.02, 1.4, 0.42], [-0.55, 1.28, 0.4], [-0.9, 1.05, 0.25], [-1.05, 0.75, 0.05]],
    coronR, M.coronary, 40, 8))
  api.add('coronary', taperedTube(
    [[0.06, 1.36, 0.45], [0.5, 1.3, 0.35], [0.85, 1.1, 0.15], [1.0, 0.75, -0.05]],
    coronR, M.coronary, 40, 8))

  /* pericardium sac (translucent, hover-through) ──────────────────────── */
  api.add('pericardium', blob([0, 1.1, 0.0], 1.55, M.pericardium, [1.0, 1.2, 0.9], 0.008, 2))

  /* fat pad decor at the atrioventricular groove */
  const fatMat = mat(0xe3c37e, { roughness: 0.65, transparent: true, opacity: 0.5 })
  api.addDecor(blob([-0.1, 1.32, 0.3], 0.34, fatMat, [1.6, 0.4, 0.5], 0.03, 4))
  api.addMaterials([fatMat])

  /* ── blood flow: two circulation loops ──────────────────────────────── */

  /* pulmonary (right heart → lungs) — blue */
  const pulmoVia = (entry: [number, number, number]): [number, number, number][] => [
    entry,
    [-0.72, 1.15, 0.0],   // RA
    [-0.35, 0.55, 0.28],  // RV
    [-0.2, 1.3, 0.25],    // up the PA trunk
    [-0.08, 2.28, 0.0],   // bifurcation
    [-0.5, 2.24, -0.1],   // left branch
    [-0.85, 2.15, -0.15], // toward lungs
  ]
  api.addFlow({
    guideColor: 0x4a7fd6,
    guideOpacity: 0.3,
    curves: [
      { pts: pulmoVia([-0.9, 2.55, -0.06]), count: 6, speed: 0.055, color: 0x8fb7ff, glow: 0x4a7fd6 },
      { pts: pulmoVia([-0.84, -0.35, -0.05]), count: 6, speed: 0.055, color: 0x8fb7ff, glow: 0x4a7fd6 },
    ],
  })

  /* systemic (left heart → body) — red */
  const systemicVia = (entry: [number, number, number]): [number, number, number][] => [
    entry,
    [-0.42, 1.95, -0.38], // LA
    [0.42, 0.85, 0.0],    // LV
    [0.24, 1.5, 0.05],    // aortic root
    [-0.03, 2.5, -0.4],   // arch
    [0.22, 1.5, -0.9],    // descending
    [0.3, 0.05, -0.95],   // to body
  ]
  api.addFlow({
    guideColor: 0xd64545,
    guideOpacity: 0.3,
    curves: [
      { pts: systemicVia([-1.0, 2.2, -0.5]), count: 6, speed: 0.055, color: 0xff9d8a, glow: 0xd64545 },
      { pts: systemicVia([0.5, 2.25, -0.58]), count: 6, speed: 0.055, color: 0xff9d8a, glow: 0xd64545 },
    ],
  })
}
