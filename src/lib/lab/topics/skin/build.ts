import * as THREE from 'three'
import type { SystemBuildAPI, SystemTickAPI } from '../../types'
import { blob, cap, mat, makeNoise, taperedTube } from '../../engine/helpers'

/**
 * THE SKIN — ninth topic. A textbook cross-section block: three wavy,
 * interlocking histology layers (epidermis → dermis → hypodermis) drawn
 * as translucent "ghost shells" so the appendages inside stay visible —
 * a full hair factory (shaft → follicle → papilla) with its arrector
 * pili muscle and sebaceous gland, the sweat system (coiled gland →
 * duct → pore), dermal vessel loops and nerve corpuscles. "Goosebumps
 * pulse" idle flexes the arrector and lifts the hair; the Skin Traffic
 * flow runs blood, sweat, nerve-signal and sebum routes.
 */

/* ── wavy histology slab: every vertex column follows top/bot waves ────── */
function layerSlab(
  x0: number, x1: number, d: number,
  topFn: (x: number) => number, botFn: (x: number) => number,
  m: THREE.Material, xSeg = 72, zSeg = 8,
): THREE.Mesh {
  const g = new THREE.BoxGeometry(x1 - x0, 1, d, xSeg, 4, zSeg)
  const p = g.attributes.position
  const cx = (x0 + x1) / 2
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + cx
    const u = p.getY(i) + 0.5 // 0 bottom → 1 top of the column
    p.setXYZ(i, x, botFn(x) + (topFn(x) - botFn(x)) * u, p.getZ(i))
  }
  g.computeVertexNormals()
  return new THREE.Mesh(g, m)
}

/* ── layer boundary waves (shared so adjacent layers interlock) ────────── */
const surf = (x: number) => 1.35 + 0.03 * Math.sin(2.1 * x) + 0.018 * Math.sin(4.7 * x + 1) // skin surface
const rete = (x: number) => 1.0 + 0.12 * Math.sin(3.1 * x) + 0.05 * Math.sin(7.3 * x + 0.8) // epidermis/dermis (rete ridges)
const dermB = (x: number) => -0.2 + 0.09 * Math.sin(2.3 * x + 0.5) // dermis/hypodermis
const fatB = (x: number) => -1.45 + 0.06 * Math.sin(1.9 * x + 2) // bottom of the block

const BLK = { x0: -2.6, x1: 2.6, d: 1.7 }

/* sweat coil curve — reused by build + flow */
const COIL_PTS: [number, number, number][] = []
for (let i = 0; i <= 26; i++) {
  const a = (i / 26) * Math.PI * 5.4
  COIL_PTS.push([
    -1.5 + Math.cos(a) * (0.13 + 0.045 * Math.sin(a * 2.3)),
    -0.74 + Math.sin(a) * 0.075 + (i / 26) * 0.05,
    Math.sin(a * 1.7) * 0.11,
  ])
}

export function buildSkin(api: SystemBuildAPI) {
  const M = {
    epi: mat(0xe7b98f, {
      roughness: 0.62, sheen: 0.35, side: THREE.DoubleSide,
      transparent: true, opacity: 0.92, depthWrite: false,
      emissive: 0x201006, emissiveIntensity: 0.2,
    }),
    derm: mat(0xd4836e, {
      roughness: 0.55, sheen: 0.3, side: THREE.DoubleSide,
      transparent: true, opacity: 0.85, depthWrite: false,
      emissive: 0x1e0804, emissiveIntensity: 0.22,
    }),
    hypo: mat(0xeccd92, {
      roughness: 0.6, side: THREE.DoubleSide,
      transparent: true, opacity: 0.8, depthWrite: false,
      emissive: 0x1c1404, emissiveIntensity: 0.2,
    }),
    fat: mat(0xf2dca6, { roughness: 0.5, clearcoat: 0.35, emissive: 0x201804, emissiveIntensity: 0.22 }),
    hair: mat(0x6b4a32, { roughness: 0.42, clearcoat: 0.55, clearcoatRoughness: 0.35, emissive: 0x140c06, emissiveIntensity: 0.25 }),
    follicle: mat(0xd9a88a, {
      roughness: 0.48, clearcoat: 0.3, side: THREE.DoubleSide,
      transparent: true, opacity: 0.55, emissive: 0x1a0c06, emissiveIntensity: 0.2,
    }),
    papilla: mat(0xc25b4e, { roughness: 0.45, clearcoat: 0.35, emissive: 0x240804, emissiveIntensity: 0.28 }),
    arrector: mat(0xb56a80, { roughness: 0.5, clearcoat: 0.25, emissive: 0x1a0a10, emissiveIntensity: 0.25 }),
    sebum: mat(0xf0e3b0, { roughness: 0.42, clearcoat: 0.5, emissive: 0x1e1804, emissiveIntensity: 0.22 }),
    sweat: mat(0x86b0bd, { roughness: 0.44, clearcoat: 0.45, emissive: 0x061418, emissiveIntensity: 0.25 }),
    duct: mat(0x9dc0cc, { roughness: 0.46, clearcoat: 0.4, emissive: 0x081418, emissiveIntensity: 0.22 }),
    pore: mat(0x5f7d8a, { roughness: 0.5, clearcoat: 0.3, emissive: 0x061014, emissiveIntensity: 0.25 }),
    vesselA: mat(0xc05a55, { roughness: 0.42, clearcoat: 0.3, emissive: 0x2a0806, emissiveIntensity: 0.3 }),
    vesselV: mat(0x7a5a8f, { roughness: 0.44, clearcoat: 0.3, emissive: 0x120820, emissiveIntensity: 0.3 }),
    capillary: mat(0xd96a5f, { roughness: 0.44, clearcoat: 0.35, emissive: 0x2a0806, emissiveIntensity: 0.3 }),
    nerve: mat(0xd8c9a8, { roughness: 0.5, clearcoat: 0.25, emissive: 0x181204, emissiveIntensity: 0.22 }),
    corpuscle: mat(0xe8d9b0, { roughness: 0.42, clearcoat: 0.5, emissive: 0x1a1404, emissiveIntensity: 0.25 }),
  }
  M.derm.bumpMap = makeNoise(5); M.derm.bumpScale = 0.01
  M.epi.bumpMap = makeNoise(6); M.epi.bumpScale = 0.006
  M.fat.bumpMap = makeNoise(4); M.fat.bumpScale = 0.012
  api.addMaterials(Object.values(M))

  /* ══ THE THREE LAYERS (ghost shells — render after their contents) ══ */
  const epi = layerSlab(BLK.x0, BLK.x1, BLK.d, surf, rete, M.epi)
  epi.renderOrder = 3
  api.add('epidermis', epi)

  const derm = layerSlab(BLK.x0, BLK.x1, BLK.d, rete, dermB, M.derm)
  derm.renderOrder = 3
  api.add('dermis', derm)

  const hypo = layerSlab(BLK.x0, BLK.x1, BLK.d, dermB, fatB, M.hypo)
  hypo.renderOrder = 3
  api.add('hypodermis', hypo)

  /* fat lobules peeking through the translucent hypodermis */
  const lobules: [number, number, number][] = [
    [-2.1, -0.95, 0.2], [-1.55, -1.15, -0.2], [-1.0, -0.9, 0.25],
    [-0.45, -1.2, -0.15], [0.15, -0.95, 0.2], [0.7, -1.15, -0.2],
    [1.25, -0.9, 0.22], [1.8, -1.18, -0.15], [2.25, -0.95, 0.2],
  ]
  lobules.forEach((p, i) =>
    api.add('hypodermis', blob(p, 0.16 + (i % 3) * 0.025, M.fat, [1.15, 0.82, 1.1], 0.02, 4)))

  /* ══ HAIR SYSTEM (right of center) ══════════════════════════════════ */
  // shaft above the surface
  api.add('hair', taperedTube(
    [[0.86, 1.36, 0], [0.94, 1.6, 0.01], [1.05, 1.85, 0.02], [1.12, 1.98, 0.03]],
    u => 0.055 - 0.021 * u, M.hair, 24, 10,
  ))
  api.add('hair', cap([1.12, 1.98, 0.03], 0.034, M.hair))

  // follicle sheath diving to the bulb (translucent so papilla glows inside)
  api.add('follicle', taperedTube(
    [[0.9, 1.3, 0], [0.88, 0.9, 0], [0.9, 0.3, 0], [0.94, -0.3, 0], [0.95, -0.52, 0]],
    u => 0.135 - 0.02 * u, M.follicle, 40, 12,
  ))
  api.add('follicle', blob([0.95, -0.62, 0], 0.2, M.follicle, [1, 1.3, 1], 0.015, 4))

  // dermal papilla tucked in the bulb
  api.add('papilla', blob([0.95, -0.72, 0], 0.085, M.papilla, [1, 1.5, 1], 0.02, 5))

  // arrector pili: follicle → epidermis base (the goosebump slingshot)
  api.add('arrector', taperedTube(
    [[0.78, 0.52, 0], [0.6, 0.62, 0.03], [0.34, 0.82, 0.05], [0.18, 0.94, 0.05]],
    () => 0.052, M.arrector, 24, 10,
  ))

  // sebaceous gland cluster + tiny duct into the follicle
  api.add('sebaceous', blob([0.42, 0.82, 0.06], 0.11, M.sebum, undefined, 0.02, 5))
  api.add('sebaceous', blob([0.3, 0.72, 0.1], 0.085, M.sebum, undefined, 0.02, 5))
  api.add('sebaceous', blob([0.36, 0.96, 0.02], 0.08, M.sebum, undefined, 0.02, 5))
  api.add('sebaceous', blob([0.5, 0.68, -0.06], 0.075, M.sebum, undefined, 0.02, 5))
  api.add('sebaceous', taperedTube([[0.52, 0.8, 0.02], [0.68, 0.76, 0], [0.8, 0.75, 0]], () => 0.028, M.sebum, 12, 8))

  /* ══ SWEAT SYSTEM (left of center) ═══════════════════════════════════ */
  // coiled secretory gland deep in the dermis
  api.add('sweatGland', taperedTube(COIL_PTS, () => 0.042, M.sweat, 96, 10))

  // duct rising to the surface
  api.add('duct', taperedTube(
    [[-1.44, -0.56, 0], [-1.36, 0.1, 0.02], [-1.24, 0.75, 0], [-1.16, 1.3, 0]],
    u => 0.045 + 0.006 * u, M.duct, 48, 10,
  ))

  // pore: trumpet mouth on the surface
  const poreRing = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.02, 10, 24), M.pore)
  poreRing.position.set(-1.16, 1.375, 0)
  poreRing.rotation.x = Math.PI / 2
  api.add('pore', poreRing)
  api.add('pore', cap([-1.16, 1.35, 0], 0.05, M.pore))

  /* ══ DERMAL VESSELS (right side + capillary loops) ═══════════════════ */
  api.add('vessel', taperedTube(
    [[2.62, -0.02, 0.12], [2.25, 0.05, 0.1], [1.9, 0.12, 0.06]],
    u => 0.09 - 0.02 * u, M.vesselA, 24, 10,
  ))
  api.add('vessel', taperedTube(
    [[2.62, -0.38, -0.12], [2.2, -0.42, -0.06], [1.88, -0.4, -0.02]],
    u => 0.1 - 0.025 * u, M.vesselV, 24, 10,
  ))
  // capillary loops reaching up under the epidermis (arteriole + venule legs)
  api.add('vessel', taperedTube(
    [[1.88, 0.14, 0.06], [1.8, 0.6, 0.05], [1.73, 0.94, 0.05]],
    () => 0.036, M.capillary, 20, 8,
  ))
  api.add('vessel', taperedTube(
    [[1.73, 0.94, 0.05], [1.62, 0.55, 0.04], [1.64, 0.16, 0.02]],
    () => 0.032, M.capillary, 20, 8,
  ))

  /* ══ NERVES (left side: trunk + two corpuscles) ══════════════════════ */
  api.add('nerve', taperedTube(
    [[-2.62, -0.45, -0.1], [-2.2, -0.4, -0.02], [-1.9, -0.35, 0]],
    () => 0.05, M.nerve, 20, 8,
  ))
  api.add('nerve', taperedTube(
    [[-1.95, -0.35, 0], [-2.02, 0.2, 0.03], [-1.96, 0.78, 0.05]],
    u => 0.036 - 0.008 * u, M.nerve, 24, 8,
  ))
  // Meissner corpuscle — elongated oval just under the epidermis
  api.add('nerve', blob([-1.95, 0.88, 0.05], 0.06, M.corpuscle, [1, 1.8, 1], 0.015, 5))
  // branch down to the deep Pacinian onion
  api.add('nerve', taperedTube(
    [[-2.2, -0.4, -0.02], [-2.15, -0.6, 0.04]], () => 0.028, M.nerve, 10, 6,
  ))
  api.add('nerve', blob([-2.15, -0.74, 0.08], 0.12, M.corpuscle, [1, 1.25, 1], 0.01, 6))
  api.add('nerve', blob([-2.15, -0.62, 0.08], 0.075, M.corpuscle, [1, 0.8, 1], 0.01, 6))

  /* ══ FLOW — skin traffic: blood, sweat, signals, sebum ═══════════════ */
  api.addFlow({
    guideColor: 0xe7b98f,
    guideOpacity: 0.16,
    curves: [
      // 1 · blood flush: artery → capillary loop → vein
      {
        pts: [[2.72, -0.05, 0.14], [1.9, 0.12, 0.06], [1.8, 0.6, 0.05], [1.73, 0.96, 0.05], [1.62, 0.5, 0.04], [1.88, -0.4, -0.02], [2.72, -0.42, -0.14]],
        count: 5, speed: 0.05, color: 0xff9a8a, glow: 0xff6a5a,
      },
      // 2 · sweat: coil → duct → pore → out
      {
        pts: [[-1.5, -0.72, 0], [-1.44, -0.56, 0], [-1.36, 0.1, 0.02], [-1.24, 0.75, 0], [-1.16, 1.32, 0], [-1.16, 1.58, 0]],
        count: 6, speed: 0.045, color: 0x9fd8ff, glow: 0x6ab8ff,
      },
      // 3 · nerve signal: trunk → Meissner corpuscle (touch reporting in)
      {
        pts: [[-2.72, -0.46, -0.12], [-1.9, -0.35, 0], [-2.02, 0.2, 0.03], [-1.95, 0.88, 0.05]],
        count: 4, speed: 0.075, color: 0xa8ffcf, glow: 0x5aff9a,
      },
      // 4 · sebum: gland → follicle → up the shaft
      {
        pts: [[0.42, 0.82, 0.06], [0.8, 0.75, 0], [0.92, 0.95, 0], [0.95, 1.32, 0], [1.06, 1.8, 0.02]],
        count: 4, speed: 0.05, color: 0xffe9a8, glow: 0xffd27a,
      },
    ],
  })
}

/* ── "goosebumps pulse" idle: arrector flexes, hair rises, systems glow ── */
export function tickSkin({ t, part, exploded }: SystemTickAPI) {
  if (exploded) return
  // slow cold-chill rhythm: a pulse every ~4.5 s
  const g = Math.pow(Math.max(0, Math.sin(t * 1.4)), 3)
  // the hair is yanked upright
  part('hair')?.forEach(m => {
    const bp = (m.userData.bp ??= m.position.clone()) as THREE.Vector3
    m.position.set(bp.x, bp.y + 0.026 * g, bp.z)
  })
  // the slingshot muscle contracts toward the follicle
  part('arrector')?.forEach(m => {
    const bp = (m.userData.bp ??= m.position.clone()) as THREE.Vector3
    m.position.set(bp.x + 0.012 * g, bp.y - 0.006 * g, bp.z)
  })
  // vessels flush (thermostat valve breathing)
  part('vessel')?.forEach(m => {
    const mm = (m as THREE.Mesh).material as THREE.MeshPhysicalMaterial | undefined
    if (mm && 'emissiveIntensity' in mm) mm.emissiveIntensity = 0.3 + 0.16 * Math.sin(t * 2.2)
  })
  // sweat gland shimmer
  part('sweatGland')?.forEach(m => {
    const mm = (m as THREE.Mesh).material as THREE.MeshPhysicalMaterial | undefined
    if (mm && 'emissiveIntensity' in mm) mm.emissiveIntensity = 0.25 + 0.13 * Math.sin(t * 2.6 + 1)
  })
  // sebaceous slow oil beat
  part('sebaceous')?.forEach(m => {
    const mm = (m as THREE.Mesh).material as THREE.MeshPhysicalMaterial | undefined
    if (mm && 'emissiveIntensity' in mm) mm.emissiveIntensity = 0.22 + 0.1 * Math.sin(t * 1.8 + 2)
  })
}
