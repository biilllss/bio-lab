import * as THREE from 'three'
import type { SystemBuildAPI, SystemTickAPI } from '../../types'
import { blob, mat, makeNoise, taperedTube } from '../../engine/helpers'

/**
 * THE TOOTH — eleventh topic. Textbook-cutaway style: every tooth is a
 * half-model (LatheGeometry over a half turn, open face toward the
 * camera) so the classic cross-section reads instantly — enamel cap,
 * dentin body, pulp core, cementum + periodontal ligament bands, gum
 * collar with wavy crest and two alveolar-bone slabs flanking the root.
 * The incisor is a chisel with one root; the molar adds cusps, a pit &
 * fissure valley, pulp horns, a furcation fork and twin root canals.
 * "Blood & Signal" runs red blood up the lifeline and yellow pain
 * signals back out; the tick pulses the pulp like a living heart.
 */

/* ── half-lathe: revolves a profile through a HALF turn (z ≤ 0 side),
      leaving the section face open toward the camera (+z) ─────────────── */
function halfLathe(prof: [number, number][], m: THREE.Material, segs = 48): THREE.Mesh {
  const g = new THREE.LatheGeometry(
    prof.map(p => new THREE.Vector2(Math.max(0.001, p[0]), p[1])),
    segs, Math.PI / 2, Math.PI,
  )
  g.computeVertexNormals()
  return new THREE.Mesh(g, m)
}

/* wavy crest: displace high vertices up/down around the circumference */
function scallop(mesh: THREE.Mesh, amp: number, waves: number, topY: number): THREE.Mesh {
  const p = (mesh.geometry as THREE.BufferGeometry).attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i)
    if (y < topY) continue
    const ang = Math.atan2(x, z) // matches the lathe parametrization
    p.setY(i, y + amp * Math.sin(ang * waves))
  }
  ;(mesh.geometry as THREE.BufferGeometry).computeVertexNormals()
  return mesh
}

/* rounded bone slab with a sheared inner edge + wavy alveolar crest.
   `side` 1 = right of the root, −1 = mirrored left. */
function boneSlab(
  side: 1 | -1, innerX: number, topY: number, bottomY: number,
  zC: number, width: number, shear: number, m: THREE.Material,
): THREE.Mesh {
  const h = topY - bottomY
  const g = new THREE.BoxGeometry(width, h, 0.78, 12, 14, 4)
  const p = g.attributes.position
  const hw = width / 2
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i)
    // mild corner rounding (normalized out-ness per axis)
    const r = 0.09
    const ox = Math.max(0, (Math.abs(x) - (hw - r)) / r)
    const oy = Math.max(0, (Math.abs(y) - (h / 2 - r)) / r)
    const oz = Math.max(0, (Math.abs(z) - (0.39 - r)) / r)
    const k = 1 - 0.09 * Math.min(1, ox * oy + oy * oz + ox * oz)
    x *= k; y *= k; z *= k
    // shear: bottom pulled inward so the socket follows the root taper
    const t = (h / 2 - y) / h // 0 top → 1 bottom
    x -= side * shear * t
    // wavy alveolar crest
    if (y > h / 2 - 0.34) {
      const fade = (y - (h / 2 - 0.34)) / 0.34
      y += fade * (0.05 * Math.sin((x + side * hw) * 5.1 + side * 1.9) + 0.022 * Math.sin((x + side * hw) * 9.3))
    }
    p.setXYZ(i, x, y, z)
  }
  g.computeVertexNormals()
  g.translate(side * hw, topY - h / 2, zC)
  const mesh = new THREE.Mesh(g, m)
  mesh.position.x = side * innerX
  return mesh
}

/* thin gum drape laid over a bone slab's crest */
function gumDrape(side: 1 | -1, innerX: number, width: number, topY: number, zC: number, m: THREE.Material): THREE.Mesh {
  const h = 0.2
  const g = new THREE.BoxGeometry(width, h, 0.6, 12, 3, 2)
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i)
    if (y > h / 2 - 0.14) {
      const fade = (y - (h / 2 - 0.14)) / 0.14
      p.setY(i, y + fade * 0.04 * Math.sin((x + width / 2) * 6.2 + side))
    }
  }
  g.computeVertexNormals()
  g.translate(side * (innerX + width / 2), topY - h / 2 + 0.04, zC)
  return new THREE.Mesh(g, m)
}

export function buildIncisor(api: SystemBuildAPI) {
  const M = {
    enamel: mat(0xf4f1e8, {
      roughness: 0.16, clearcoat: 0.9, clearcoatRoughness: 0.12,
      sheen: 0.1, side: THREE.DoubleSide, emissive: 0x0a0a08, emissiveIntensity: 0.16,
    }),
    dentin: mat(0xead7a2, {
      roughness: 0.55, sheen: 0.3, side: THREE.DoubleSide,
      emissive: 0x181104, emissiveIntensity: 0.22,
    }),
    pulp: mat(0xe06a6a, {
      roughness: 0.45, clearcoat: 0.4, side: THREE.DoubleSide,
      emissive: 0x300a0a, emissiveIntensity: 0.3,
    }),
    canal: mat(0xc85050, {
      roughness: 0.5, clearcoat: 0.35, side: THREE.DoubleSide,
      emissive: 0x280808, emissiveIntensity: 0.3,
    }),
    cementum: mat(0xd4c29c, {
      roughness: 0.72, sheen: 0.2, side: THREE.DoubleSide,
      emissive: 0x120e06, emissiveIntensity: 0.2,
    }),
    ligament: mat(0xb08268, {
      roughness: 0.8, side: THREE.DoubleSide,
      emissive: 0x140a06, emissiveIntensity: 0.22,
    }),
    bone: mat(0xece4cd, {
      roughness: 0.62, sheen: 0.25,
      emissive: 0x14110a, emissiveIntensity: 0.2,
    }),
    gum: mat(0xe28383, {
      roughness: 0.48, clearcoat: 0.35, side: THREE.DoubleSide,
      emissive: 0x1c0808, emissiveIntensity: 0.22,
    }),
    artery: mat(0xd85a5a, { roughness: 0.4, clearcoat: 0.5, emissive: 0x2a0808, emissiveIntensity: 0.35 }),
    vein: mat(0x7a8fd0, { roughness: 0.4, clearcoat: 0.5, emissive: 0x0a1024, emissiveIntensity: 0.3 }),
    nerve: mat(0xe8c86a, { roughness: 0.45, clearcoat: 0.4, emissive: 0x241a04, emissiveIntensity: 0.35 }),
    foramen: mat(0xd8b25a, { roughness: 0.35, clearcoat: 0.6, emissive: 0x3a2a06, emissiveIntensity: 0.5 }),
  }
  M.enamel.bumpMap = makeNoise(6); M.enamel.bumpScale = 0.004
  M.bone.bumpMap = makeNoise(5); M.bone.bumpScale = 0.012
  api.addMaterials(Object.values(M))

  /* ══ CROWN LAYERS (half-lathe shells, open toward camera) ════════════ */
  api.add('enamel', halfLathe([
    [0.001, 1.74], [0.2, 1.71], [0.38, 1.58], [0.5, 1.28], [0.56, 0.92], [0.575, 0.55],
    [0.465, 0.53], [0.455, 0.9], [0.415, 1.26], [0.3, 1.5], [0.12, 1.63], [0.001, 1.64],
  ], M.enamel))

  api.add('dentin', halfLathe([
    [0.001, 1.6], [0.28, 1.5], [0.41, 1.26], [0.44, 0.9], [0.45, 0.55],
    [0.42, 0.2], [0.36, -0.4], [0.3, -1.1], [0.22, -1.8], [0.12, -2.35], [0.02, -2.58],
    [0.09, -2.3], [0.125, -1.8], [0.14, -1.1], [0.145, -0.45],
    [0.19, 0.05], [0.22, 0.45], [0.2, 0.75], [0.12, 0.95], [0.001, 1.02],
  ], M.dentin))

  api.add('pulp', halfLathe([
    [0.001, 1.0], [0.1, 0.94], [0.17, 0.72], [0.19, 0.42], [0.17, 0.05], [0.13, -0.4], [0.001, -0.45],
  ], M.pulp))

  api.add('canal', taperedTube(
    [[0.075, -0.42, -0.12], [0.095, -1.05, -0.12], [0.08, -1.75, -0.12], [0.05, -2.35, -0.12]],
    u => 0.11 - 0.055 * u, M.canal, 24, 10,
  ))

  /* ══ ROOT COATS: cementum + periodontal ligament bands ═══════════════ */
  api.add('cementum', halfLathe([
    [0.44, 0.2], [0.39, -0.4], [0.35, -1.1], [0.27, -1.8], [0.17, -2.35], [0.06, -2.56],
    [0.1, -2.32], [0.16, -1.78], [0.235, -1.08], [0.29, -0.38], [0.35, 0.18],
  ], M.cementum))

  api.add('ligament', halfLathe([
    [0.5, 0.18], [0.45, -0.42], [0.41, -1.12], [0.33, -1.82], [0.23, -2.38], [0.11, -2.58],
    [0.16, -2.34], [0.22, -1.8], [0.3, -1.1], [0.34, -0.4], [0.4, 0.16],
  ], M.ligament))

  /* ══ SOCKET: alveolar bone slabs flanking the root (+ gum drapes) ════ */
  const slabR = boneSlab(1, 0.48, 0.08, -1.95, -0.33, 1.75, 0.14, M.bone)
  const slabL = boneSlab(-1, 0.48, 0.08, -1.95, -0.33, 1.75, 0.14, M.bone)
  api.add('bone', slabR); api.add('bone', slabL)

  /* ══ GUM: collar around the neck + drapes over the bone crest ════════ */
  const gumRing = scallop(halfLathe([
    [0.47, 0.14], [0.6, 0.08], [0.71, 0.14], [0.7, 0.3], [0.6, 0.42], [0.5, 0.44], [0.44, 0.3],
  ], M.gum), 0.028, 4, 0.26)
  api.add('gum', gumRing)
  api.add('gum', gumDrape(1, 0.48, 1.75, 0.08, -0.33, M.gum))
  api.add('gum', gumDrape(-1, 0.48, 1.75, 0.08, -0.33, M.gum))

  /* ══ LIFELINE: artery + vein + nerve threading through the apex ══════ */
  api.add('nerve', taperedTube(
    [[0.13, -3.4, -0.1], [0.1, -2.95, -0.11], [0.055, -2.62, -0.12], [0.07, -2.1, -0.12], [0.09, -1.5, -0.12]],
    () => 0.034, M.artery, 32, 8,
  ))
  api.add('nerve', taperedTube(
    [[0.22, -3.35, -0.1], [0.18, -2.9, -0.11], [0.13, -2.62, -0.12], [0.14, -2.1, -0.12], [0.15, -1.5, -0.12]],
    () => 0.028, M.vein, 32, 8,
  ))
  api.add('nerve', taperedTube(
    [[0.04, -3.45, -0.14], [0.02, -3.0, -0.12], [0.005, -2.66, -0.12], [0.02, -2.2, -0.13], [0.04, -1.6, -0.13]],
    () => 0.026, M.nerve, 32, 8,
  ))

  /* ══ APICAL FORAMEN — the doorway ring at the root tip ═══════════════ */
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.022, 8, 26), M.foramen)
  ring.rotation.x = Math.PI / 2
  ring.position.set(0, -2.56, -0.12)
  api.add('foramen', ring)

  /* ══ FLOW — Blood & Signal: blood up the lifeline, pain signals out ══ */
  api.addFlow({
    guideColor: 0xd87a6a,
    guideOpacity: 0.12,
    curves: [
      { // blood in: artery → apical foramen → root canal → pulp chamber
        pts: [[0.13, -3.4, -0.1], [0.055, -2.62, -0.12], [0.07, -2.0, -0.12], [0.1, -1.2, -0.12], [0.16, -0.4, -0.14], [0.18, 0.3, -0.15]],
        count: 5, speed: 0.05, color: 0xff9a8a, glow: 0xff6a5a, tail: false,
      },
      { // blood out: pulp → canal → foramen → vein back to the jaw
        pts: [[0.18, 0.3, -0.15], [0.12, -0.6, -0.13], [0.13, -1.6, -0.12], [0.13, -2.62, -0.12], [0.22, -3.35, -0.1]],
        count: 4, speed: 0.045, color: 0x9ab0e8, glow: 0x6a86d8, tail: false,
      },
      { // pain signals: pulp → canal → foramen → jaw nerve
        pts: [[0.17, 0.5, -0.15], [0.04, -1.0, -0.13], [0.005, -2.66, -0.12], [0.04, -3.45, -0.14]],
        count: 3, speed: 0.07, color: 0xffe9a8, glow: 0xffd25a, tail: false,
      },
    ],
  })
}

export function buildMolar(api: SystemBuildAPI) {
  const M = {
    enamel: mat(0xf4f1e8, {
      roughness: 0.16, clearcoat: 0.9, clearcoatRoughness: 0.12,
      sheen: 0.1, side: THREE.DoubleSide, emissive: 0x0a0a08, emissiveIntensity: 0.16,
    }),
    dentin: mat(0xead7a2, {
      roughness: 0.55, sheen: 0.3, side: THREE.DoubleSide,
      emissive: 0x181104, emissiveIntensity: 0.22,
    }),
    pulp: mat(0xe06a6a, {
      roughness: 0.45, clearcoat: 0.4, side: THREE.DoubleSide,
      emissive: 0x300a0a, emissiveIntensity: 0.3,
    }),
    canal: mat(0xc85050, {
      roughness: 0.5, clearcoat: 0.35, side: THREE.DoubleSide,
      emissive: 0x280808, emissiveIntensity: 0.3,
    }),
    cementum: mat(0xd4c29c, {
      roughness: 0.72, sheen: 0.2, side: THREE.DoubleSide,
      emissive: 0x120e06, emissiveIntensity: 0.2,
    }),
    ligament: mat(0xb08268, {
      roughness: 0.8, side: THREE.DoubleSide,
      emissive: 0x140a06, emissiveIntensity: 0.22,
    }),
    bone: mat(0xece4cd, {
      roughness: 0.62, sheen: 0.25,
      emissive: 0x14110a, emissiveIntensity: 0.2,
    }),
    gum: mat(0xe28383, {
      roughness: 0.48, clearcoat: 0.35, side: THREE.DoubleSide,
      emissive: 0x1c0808, emissiveIntensity: 0.22,
    }),
    fissure: mat(0x7a6644, { roughness: 0.6, emissive: 0x181104, emissiveIntensity: 0.3 }),
    furcation: mat(0xd8b25a, { roughness: 0.4, clearcoat: 0.5, emissive: 0x3a2a06, emissiveIntensity: 0.4 }),
    artery: mat(0xd85a5a, { roughness: 0.4, clearcoat: 0.5, emissive: 0x2a0808, emissiveIntensity: 0.35 }),
    vein: mat(0x7a8fd0, { roughness: 0.4, clearcoat: 0.5, emissive: 0x0a1024, emissiveIntensity: 0.3 }),
    nerve: mat(0xe8c86a, { roughness: 0.45, clearcoat: 0.4, emissive: 0x241a04, emissiveIntensity: 0.35 }),
  }
  M.enamel.bumpMap = makeNoise(6); M.enamel.bumpScale = 0.004
  M.bone.bumpMap = makeNoise(5); M.bone.bumpScale = 0.012
  api.addMaterials(Object.values(M))

  /* ══ CROWN: enamel trunk cap + two cusps + pit & fissure valley ══════ */
  api.add('enamel', halfLathe([
    [0.001, 1.3], [0.2, 1.34], [0.45, 1.42], [0.7, 1.3], [0.88, 1.05], [0.94, 0.72], [0.96, 0.45],
    [0.85, 0.43], [0.83, 0.72], [0.77, 1.02], [0.6, 1.2], [0.3, 1.26], [0.001, 1.2],
  ], M.enamel))
  api.add('cusps', blob([0.38, 1.4, -0.28], 0.3, M.enamel, [0.95, 0.42, 0.95], 0.008, 3))
  api.add('cusps', blob([-0.38, 1.4, -0.28], 0.3, M.enamel, [0.95, 0.42, 0.95], 0.008, 3))
  api.add('fissure', taperedTube(
    [[0.0, 1.32, -0.06], [0.0, 1.29, -0.28], [0.0, 1.32, -0.5]],
    () => 0.028, M.fissure, 12, 8,
  ))

  /* ══ DENTIN: trunk down to the furcation + two root cones ════════════ */
  api.add('dentin', halfLathe([
    [0.001, 1.16], [0.28, 1.2], [0.52, 1.14], [0.72, 0.98], [0.8, 0.7], [0.82, 0.45],
    [0.78, 0.2], [0.73, -0.3], [0.69, -0.8], [0.66, -1.1],
    [0.4, -1.18], [0.22, -1.02], [0.001, -0.96],
  ], M.dentin))
  const rootPts: [number, number, number][] = [
    [-0.4, -1.0, -0.18], [-0.47, -1.5, -0.18], [-0.42, -2.05, -0.18], [-0.33, -2.45, -0.18],
  ]
  const rootR = (u: number) => 0.27 - 0.16 * u
  for (const side of [1, -1] as const) {
    const root = taperedTube(rootPts.map(p => [side * p[0], p[1], p[2]] as [number, number, number]), rootR, M.dentin, 26, 12)
    root.scale.z = 0.62
    api.add('dentin', root)
    // rounded apex so the root doesn't end in an open ring
    const tip = blob([side * -0.33, -2.45, -0.18], 0.105, M.dentin, [1, 1, 0.62], 0.004, 3)
    api.add('dentin', tip)
  }

  /* ══ PULP: chamber + two horns reaching for the cusps ════════════════ */
  api.add('pulp', halfLathe([
    [0.001, 0.9], [0.22, 0.84], [0.4, 0.6], [0.45, 0.25], [0.42, -0.2], [0.36, -0.6], [0.24, -0.85], [0.001, -0.9],
  ], M.pulp))
  api.add('horns', blob([0.28, 0.9, -0.2], 0.15, M.pulp, [0.5, 0.9, 0.55], 0.006, 3))
  api.add('horns', blob([-0.28, 0.9, -0.2], 0.15, M.pulp, [0.5, 0.9, 0.55], 0.006, 3))

  /* ══ ROOT CANALS: twin corridors down both roots ═════════════════════ */
  const canalPts: [number, number, number][] = [
    [-0.42, -1.1, -0.18], [-0.46, -1.7, -0.18], [-0.36, -2.3, -0.18],
  ]
  for (const side of [1, -1] as const) {
    const canal = taperedTube(canalPts.map(p => [side * p[0], p[1], p[2]] as [number, number, number]), u => 0.075 - 0.045 * u, M.canal, 20, 8)
    canal.scale.z = 0.6
    api.add('canal', canal)
  }

  /* ══ CEMENTUM: trunk band + anchor coats on both roots ═══════════════ */
  api.add('cementum', halfLathe([
    [0.84, 0.44], [0.79, -0.1], [0.74, -0.7], [0.7, -1.12],
    [0.62, -1.16], [0.67, -0.68], [0.72, -0.08], [0.77, 0.42],
  ], M.cementum))
  for (const side of [1, -1] as const) {
    const shell = taperedTube(rootPts.map(p => [side * p[0], p[1], p[2]] as [number, number, number]), u => 0.32 - 0.18 * u, M.cementum, 26, 10)
    shell.scale.z = 0.66
    api.add('cementum', shell)
    const shellTip = blob([side * -0.33, -2.45, -0.18], 0.13, M.cementum, [1, 1, 0.66], 0.004, 3)
    api.add('cementum', shellTip)
  }

  /* ══ PERIODONTAL LIGAMENT: twin fiber slings around the roots ════════ */
  for (const side of [1, -1] as const) {
    const sling = taperedTube(rootPts.map(p => [side * p[0], p[1], p[2] - 0.02] as [number, number, number]), u => 0.375 - 0.2 * u, M.ligament, 26, 10)
    sling.scale.z = 0.6
    api.add('ligament', sling)
    const slingTip = blob([side * -0.33, -2.45, -0.2], 0.15, M.ligament, [1, 1, 0.6], 0.004, 3)
    api.add('ligament', slingTip)
  }

  /* ══ FURCATION — the gold fork marker between the roots ══════════════ */
  api.add('furcation', blob([0, -1.02, -0.14], 0.13, M.furcation, [1.3, 0.6, 0.75], 0.008, 3))

  /* ══ SOCKET: bone slabs outside both roots + gum drapes ══════════════ */
  api.add('bone', boneSlab(1, 0.88, 0.08, -1.85, -0.33, 1.5, 0.02, M.bone))
  api.add('bone', boneSlab(-1, 0.88, 0.08, -1.85, -0.33, 1.5, 0.02, M.bone))

  /* ══ GUM: broad collar + crest drapes ════════════════════════════════ */
  const gumRing = scallop(halfLathe([
    [0.88, 0.42], [1.05, 0.34], [1.16, 0.42], [1.14, 0.58], [1.0, 0.7], [0.9, 0.7], [0.84, 0.56],
  ], M.gum), 0.032, 4, 0.54)
  api.add('gum', gumRing)
  api.add('gum', gumDrape(1, 0.88, 1.5, 0.08, -0.33, M.gum))
  api.add('gum', gumDrape(-1, 0.88, 1.5, 0.08, -0.33, M.gum))

  /* ══ LIFELINE: trunk bundle up to the fork, branches into both canals ═ */
  api.add('nerve', taperedTube(
    [[0.12, -3.3, -0.18], [0.08, -2.7, -0.18], [0.03, -1.9, -0.18], [0.0, -1.45, -0.18]],
    () => 0.045, M.artery, 30, 8,
  ))
  api.add('nerve', taperedTube(
    [[-0.05, -1.4, -0.18], [-0.2, -1.35, -0.18], [-0.42, -1.2, -0.18]],
    () => 0.03, M.artery, 16, 8,
  ))
  api.add('nerve', taperedTube(
    [[0.05, -1.4, -0.18], [0.2, -1.35, -0.18], [0.42, -1.2, -0.18]],
    () => 0.03, M.artery, 16, 8,
  ))
  api.add('nerve', taperedTube(
    [[0.2, -3.25, -0.2], [0.15, -2.6, -0.19], [0.08, -1.85, -0.18], [0.02, -1.5, -0.18]],
    () => 0.03, M.nerve, 30, 8,
  ))

  /* ══ FLOW — Blood & Signal ════════════════════════════════════════════ */
  api.addFlow({
    guideColor: 0xd87a6a,
    guideOpacity: 0.12,
    curves: [
      { // blood in: artery → fork → left root canal → apex
        pts: [[0.12, -3.3, -0.18], [0.02, -1.9, -0.18], [-0.2, -1.35, -0.18], [-0.44, -1.8, -0.18], [-0.38, -2.35, -0.18]],
        count: 5, speed: 0.05, color: 0xff9a8a, glow: 0xff6a5a, tail: false,
      },
      { // blood out: pulp chamber → right canal → vein to the jaw
        pts: [[0.05, -0.5, -0.18], [0.4, -1.3, -0.18], [0.46, -2.0, -0.18], [0.5, -3.2, -0.18]],
        count: 4, speed: 0.045, color: 0x9ab0e8, glow: 0x6a86d8, tail: false,
      },
      { // pain signals: chamber → fork → out through the jaw nerve
        pts: [[0.2, 0.4, -0.18], [0.08, -1.0, -0.18], [0.1, -2.4, -0.19], [0.2, -3.25, -0.2]],
        count: 3, speed: 0.07, color: 0xffe9a8, glow: 0xffd25a, tail: false,
      },
    ],
  })
}

/* ── "living tooth" idle: pulp blood-beat + nerve shimmer ──────────────── */
export function tickTooth({ t, part, exploded }: SystemTickAPI) {
  if (exploded) return
  const beat = (keys: string[], base: number, amp: number, freq: number, phase = 0) => {
    for (const k of keys) {
      part(k)?.forEach(m => {
        const mm = (m as THREE.Mesh).material as THREE.MeshPhysicalMaterial | undefined
        if (mm && 'emissiveIntensity' in mm) mm.emissiveIntensity = base + amp * Math.sin(t * freq + phase)
      })
    }
  }
  // the pulp "heart" beats: chamber → horns → canals in a wave
  beat(['pulp'], 0.32, 0.13, 2.1)
  beat(['horns'], 0.32, 0.13, 2.1, 0.5)
  beat(['canal'], 0.3, 0.11, 2.1, 1.1)
  // nerve bundle shimmers as signals fire
  beat(['nerve'], 0.34, 0.1, 3.4, 2.0)
  // foramen doorway glows steadily
  beat(['foramen'], 0.5, 0.1, 2.1, 0.8)
}
