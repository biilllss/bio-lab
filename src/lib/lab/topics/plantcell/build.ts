import * as THREE from 'three'
import type { SystemBuildAPI, SystemTickAPI } from '../../types'
import { blob, cap, mat, makeNoise, taperedTube } from '../../engine/helpers'

/**
 * THE PLANT CELL — tenth topic. A rounded-box cell: translucent
 * "ghost-shell" cellulose wall + membrane over a faint cytoplasm fill,
 * so the organelles inside stay visible — giant water vacuole, nucleus
 * shell with nucleolus + chromatin squiggles, chloroplast lenses with
 * grana coins, a cristae-pleated mitochondrion, Golgi pita stack, rough
 * ER maze around the nucleus, ribosome dust and plasmodesmata drilling
 * the wall. "Streaming shimmer" idles the organelles on the cyclosis
 * tide; the Cell Current flow runs sugar, ATP, protein-export and the
 * big cytoplasmic streaming loop.
 */

/* ── rounded-box shell helper (rounded corners via vertex smoothing) ───── */
function cellShell(
  w: number, h: number, d: number, r: number, m: THREE.Material,
): THREE.Mesh {
  const g = new THREE.BoxGeometry(w, h, d, 14, 9, 7)
  const p = g.attributes.position
  // clamp each vertex toward a rounded-rectangle cross-section:
  // pull outer box faces in by the corner radius near the edges
  const hw = w / 2, hh = h / 2, hd = d / 2
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i)
    // normalized "outside-ness" of each axis
    const ox = Math.max(0, (Math.abs(x) - (hw - r)) / r) // 0 flat → 1 at edge
    const oy = Math.max(0, (Math.abs(y) - (hh - r)) / r)
    const oz = Math.max(0, (Math.abs(z) - (hd - r)) / r)
    // shrink factor: 1 in the flats, dips toward the corners
    const k = 1 - 0.14 * Math.min(1, ox * oy + oy * oz + ox * oz)
    p.setXYZ(i, x * k, y * k, z * k)
  }
  // subtle organic sag so it reads as living, not CAD
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i)
    const bulge = 1 + 0.022 * Math.sin(y * 2.1 + 0.5) * Math.sin(x * 1.4)
    p.setXYZ(i, x * bulge, y * (1 + 0.014 * Math.sin(x * 1.8)), z * bulge)
  }
  g.computeVertexNormals()
  return new THREE.Mesh(g, m)
}

/* chromatin squiggle paths inside the nucleus (reused by build only) */
function chromaPts(cx: number, cy: number, cz: number, seed: number): [number, number, number][] {
  const pts: [number, number, number][] = []
  for (let i = 0; i <= 22; i++) {
    const a = (i / 22) * Math.PI * 3.6 + seed
    pts.push([
      cx + Math.cos(a) * (0.17 + 0.06 * Math.sin(a * 2.3 + seed)),
      cy + Math.sin(a * 1.4) * 0.13,
      cz + Math.sin(a) * (0.12 + 0.05 * Math.cos(a * 1.7)),
    ])
  }
  return pts
}

export function buildPlantCell(api: SystemBuildAPI) {
  const M = {
    wall: mat(0x5e8e4e, {
      roughness: 0.72, sheen: 0.2, side: THREE.DoubleSide,
      transparent: true, opacity: 0.26, depthWrite: false,
      emissive: 0x0c1a08, emissiveIntensity: 0.3,
    }),
    membrane: mat(0xd9c36a, {
      roughness: 0.5, sheen: 0.35, side: THREE.DoubleSide,
      transparent: true, opacity: 0.2, depthWrite: false,
      emissive: 0x1a1404, emissiveIntensity: 0.25,
    }),
    cyto: mat(0xcfd9a8, {
      roughness: 0.8, side: THREE.DoubleSide,
      transparent: true, opacity: 0.07, depthWrite: false,
      emissive: 0x141804, emissiveIntensity: 0.2,
    }),
    vacuole: mat(0x5e88b0, {
      roughness: 0.18, clearcoat: 0.7, clearcoatRoughness: 0.2,
      emissive: 0x0a1a24, emissiveIntensity: 0.42,
    }),
    nucleus: mat(0xa08cc8, {
      roughness: 0.4, sheen: 0.4, side: THREE.DoubleSide,
      transparent: true, opacity: 0.66, depthWrite: false,
      emissive: 0x120a20, emissiveIntensity: 0.34,
    }),
    nucleolus: mat(0x7a5fa8, { roughness: 0.35, clearcoat: 0.5, emissive: 0x140820, emissiveIntensity: 0.35 }),
    chroma: mat(0xd878a8, { roughness: 0.45, clearcoat: 0.35, emissive: 0x1e0812, emissiveIntensity: 0.3 }),
    chloro: mat(0x5e9e4a, {
      roughness: 0.42, clearcoat: 0.45, sheen: 0.3,
      emissive: 0x0a1e06, emissiveIntensity: 0.35,
    }),
    grana: mat(0x3a6e2e, { roughness: 0.5, clearcoat: 0.3, emissive: 0x061404, emissiveIntensity: 0.3 }),
    mito: mat(0xc9886a, { roughness: 0.45, clearcoat: 0.4, emissive: 0x1e0c06, emissiveIntensity: 0.3 }),
    crista: mat(0xa85f4a, { roughness: 0.5, clearcoat: 0.25, emissive: 0x180804, emissiveIntensity: 0.28 }),
    golgi: mat(0xd87fa8, { roughness: 0.48, clearcoat: 0.35, side: THREE.DoubleSide, emissive: 0x1e0812, emissiveIntensity: 0.28 }),
    er: mat(0x8fa8b9, { roughness: 0.5, clearcoat: 0.3, side: THREE.DoubleSide, emissive: 0x0a1218, emissiveIntensity: 0.28 }),
    ribo: mat(0xe0c98f, { roughness: 0.4, clearcoat: 0.5, emissive: 0x1e1604, emissiveIntensity: 0.35 }),
    plas: mat(0x4a9e9a, { roughness: 0.45, clearcoat: 0.4, emissive: 0x061818, emissiveIntensity: 0.35 }),
    vesicle: mat(0xd9a86a, { roughness: 0.4, clearcoat: 0.5, emissive: 0x1a1004, emissiveIntensity: 0.3 }),
  }
  M.wall.bumpMap = makeNoise(7); M.wall.bumpScale = 0.012 // cellulose fiber grain
  M.vacuole.bumpMap = makeNoise(4); M.vacuole.bumpScale = 0.004
  api.addMaterials(Object.values(M))

  /* ══ THE SHELLS (ghost recipes — render after their contents) ══ */
  const wall = cellShell(5.4, 3.0, 1.9, 0.34, M.wall)
  wall.renderOrder = 4
  api.add('wall', wall)

  const membrane = cellShell(5.06, 2.7, 1.62, 0.3, M.membrane)
  membrane.renderOrder = 3
  api.add('membrane', membrane)

  const cyto = cellShell(4.72, 2.4, 1.36, 0.28, M.cyto)
  cyto.renderOrder = 1
  api.add('cytoplasm', cyto)

  /* ══ CENTRAL VACUOLE (the water bubble) ══════════════════════════════ */
  const vac = blob([-0.5, -0.08, 0], 0.95, M.vacuole, [1.5, 1.02, 0.8], 0.012, 3)
  vac.renderOrder = 2
  api.add('vacuole', vac)

  /* ══ NUCLEUS TRIO (upper right) ══════════════════════════════════════ */
  const nuc = blob([1.35, 0.48, 0.1], 0.52, M.nucleus, undefined, 0.01, 3)
  nuc.renderOrder = 2
  api.add('nucleus', nuc)
  api.add('nucleolus', blob([1.46, 0.6, 0.12], 0.19, M.nucleolus, undefined, 0.008, 4))
  api.add('chromatin', taperedTube(chromaPts(1.35, 0.48, 0.1, 0), () => 0.022, M.chroma, 48, 6))
  api.add('chromatin', taperedTube(chromaPts(1.35, 0.48, 0.1, 2.1), () => 0.02, M.chroma, 48, 6))
  api.add('chromatin', taperedTube(chromaPts(1.35, 0.48, 0.1, 4.2), () => 0.018, M.chroma, 48, 6))

  /* ══ ROUGH ER — nested wavy arcs hugging the nucleus ═════════════════ */
  const erArc: [number, number, number][] = []
  for (let i = 0; i <= 30; i++) {
    const a = Math.PI * 0.65 + (i / 30) * Math.PI * 1.7
    erArc.push([1.35 + Math.cos(a) * 0.78, 0.42 + Math.sin(a) * 0.66, Math.sin(a * 2.1) * 0.09])
  }
  api.add('er', taperedTube(erArc, () => 0.045, M.er, 60, 10))
  const erArc2 = erArc.map(p => [1.35 + (p[0] - 1.35) * 0.82, 0.42 + (p[1] - 0.42) * 0.8, p[2] - 0.05] as [number, number, number])
  api.add('er', taperedTube(erArc2, () => 0.038, M.er, 60, 10))
  // ribosome studs on the ER (decor — the "rough" in rough ER)
  for (let i = 0; i < 9; i++) {
    const p = erArc[(i * 3 + 1) % erArc.length]
    api.addDecor(blob(p, 0.022, M.ribo, undefined, 0.004, 5))
  }

  /* ══ GOLGI — stacked pita arcs (upper right corner) ══════════════════ */
  for (let i = 0; i < 4; i++) {
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(0.3 - i * 0.018, 0.042, 8, 26, Math.PI * 1.25),
      M.golgi,
    )
    arc.position.set(2.0, 0.72 + i * 0.088, 0.12 - i * 0.02)
    arc.rotation.z = -0.5 - i * 0.12
    arc.rotation.x = 0.15
    arc.scale.set(1, 0.62, 1)
    api.add('golgi', arc)
  }
  // shipping vesicles budding off the Golgi
  api.addDecor(blob([2.3, 1.05, 0.06], 0.05, M.vesicle, undefined, 0.006, 5))
  api.addDecor(blob([2.42, 0.88, 0.02], 0.042, M.vesicle, undefined, 0.006, 5))

  /* ══ CHLOROPLASTS — three lenses with grana coin stacks ══════════════ */
  const CHLORO: { p: [number, number, number]; rot: number }[] = [
    { p: [-1.7, 0.88, 0.28], rot: 0.5 },
    { p: [0.95, -0.88, 0.32], rot: -0.35 },
    { p: [2.05, -0.42, -0.18], rot: 0.15 },
  ]
  CHLORO.forEach(c => {
    const lens = blob(c.p, 0.3, M.chloro, [1, 0.58, 0.72], 0.012, 4)
    lens.rotation.z = c.rot
    api.add('chloroplast', lens)
    // grana: stacks of small discs inside each lens
    for (let i = 0; i < 3; i++) {
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.022, 18), M.grana)
      disc.position.set(c.p[0] - 0.1 + i * 0.1, c.p[1] + (i - 1) * 0.035, c.p[2] + 0.04)
      disc.rotation.z = c.rot
      api.add('chloroplast', disc)
    }
  })

  /* ══ MITOCHONDRION — pleated capsule (lower left) ════════════════════ */
  const mitoPts: [number, number, number][] = [
    [-1.98, -0.72, -0.08], [-1.75, -0.8, -0.08], [-1.5, -0.76, -0.06],
  ]
  api.add('mitochondrion', taperedTube(mitoPts, u => 0.15 - 0.03 * u, M.mito, 20, 12))
  api.add('mitochondrion', cap([-1.98, -0.72, -0.08], 0.15, M.mito))
  // cristae: wavy pleats inside
  for (let i = 0; i < 4; i++) {
    const x = -1.86 + i * 0.11
    api.add('mitochondrion', taperedTube(
      [[x, -0.68, -0.08], [x + 0.03, -0.8, -0.08], [x, -0.92, -0.06]],
      () => 0.018, M.crista, 12, 6,
    ))
  }

  /* ══ FREE RIBOSOMES — dust in the cytoplasm ══════════════════════════ */
  const RIBOSOMES: [number, number, number][] = [
    [-0.4, -1.02, 0.18], [0.1, -0.95, -0.12], [0.6, -0.72, 0.2],
    [-0.9, -0.55, -0.2], [-2.1, 0.35, 0.1], [-1.95, 0.05, -0.15],
    [0.35, 0.55, -0.25], [-0.15, 0.95, 0.1], [1.05, -0.35, -0.28],
    [0.75, 1.05, 0.05], [-0.65, 0.4, 0.3], [1.6, -0.75, 0.22],
  ]
  RIBOSOMES.forEach(p => api.add('ribosome', blob(p, 0.036, M.ribo, undefined, 0.004, 5)))

  /* ══ PLASMODESMATA — tunnels through the wall (left edge) ════════════ */
  const PLAS: [number, number, number][] = [
    [-2.55, 0.55, 0.15], [-2.5, -0.65, 0.25], [2.55, -0.05, 0.2],
  ]
  PLAS.forEach(p => {
    api.add('plasmodesma', taperedTube(
      [[p[0] - 0.28, p[1], p[2]], [p[0], p[1] + 0.03, p[2]], [p[0] + 0.28, p[1], p[2]]],
      () => 0.045, M.plas, 14, 8,
    ))
    api.add('plasmodesma', cap([p[0] - 0.3, p[1], p[2]], 0.05, M.plas))
  })

  /* ══ FLOW — Cell Current: cyclosis, sugar, ATP, protein export ═══════ */
  api.addFlow({
    guideColor: 0x9ec46f,
    guideOpacity: 0.15,
    curves: [
      // 1 · cytoplasmic streaming: the big cyclosis loop around the cell
      {
        pts: [
          [-1.85, 0.9, 0.32], [0, 1.02, 0.34], [1.85, 0.85, 0.3], [2.15, 0, 0.26],
          [1.85, -0.85, 0.26], [0, -1.0, 0.28], [-1.85, -0.85, 0.26], [-2.15, 0, 0.3],
        ],
        count: 8, speed: 0.042, color: 0xbfe8d0, glow: 0x7ad8a0, tail: false,
      },
      // 2 · sugar load: chloroplast → vacuole pantry
      {
        pts: [[-1.7, 0.88, 0.28], [-1.25, 0.45, 0.24], [-0.95, 0.05, 0.2]],
        count: 4, speed: 0.055, color: 0xffe9a8, glow: 0xffd27a,
      },
      // 3 · ATP sparks: mitochondrion → ribosome clusters
      {
        pts: [[-1.75, -0.78, -0.08], [-1.0, -0.6, -0.1], [-0.35, -0.95, 0.05], [0.35, -0.6, 0.1], [0.75, -0.4, 0.15]],
        count: 5, speed: 0.06, color: 0xffb08a, glow: 0xff8858,
      },
      // 4 · protein export: nucleus → ER → Golgi → plasmodesma out
      {
        pts: [[1.4, 0.62, 0.12], [1.05, 0.95, 0.14], [0.62, 0.8, 0.12], [1.9, 1.0, 0.1], [2.35, 0.85, 0.08], [2.72, 0.7, 0.05]],
        count: 5, speed: 0.05, color: 0x9fe8b8, glow: 0x5ad88a,
      },
    ],
  })
}

/* ── "streaming shimmer" idle: cyclosis tide + photosynthesis beat ─────── */
export function tickPlantCell({ t, part, exploded }: SystemTickAPI) {
  if (exploded) return
  // chloroplasts drift on the streaming tide (each with its own phase)
  part('chloroplast')?.forEach(m => {
    const bp = (m.userData.bp ??= m.position.clone()) as THREE.Vector3
    m.position.set(bp.x + 0.02 * Math.sin(t * 0.55 + bp.x * 2.1), bp.y + 0.016 * Math.sin(t * 0.8 + bp.x * 1.7), bp.z)
  })
  // mitochondrion bobs too
  part('mitochondrion')?.forEach(m => {
    const bp = (m.userData.bp ??= m.position.clone()) as THREE.Vector3
    m.position.set(bp.x, bp.y + 0.018 * Math.sin(t * 0.7 + 1.2), bp.z)
  })
  // ribosome dust shivers
  part('ribosome')?.forEach(m => {
    const bp = (m.userData.bp ??= m.position.clone()) as THREE.Vector3
    m.position.set(bp.x + 0.008 * Math.sin(t * 1.3 + bp.x * 3.1), bp.y + 0.008 * Math.cos(t * 1.1 + bp.y * 2.7), bp.z)
  })
  // vacuole turgor: slow pressurized breathing (scale, explode-safe)
  part('vacuole')?.forEach(m => {
    const bs = (m.userData.bs ??= m.scale.clone()) as THREE.Vector3
    const k = 1 + 0.014 * Math.sin(t * 0.9)
    m.scale.set(bs.x * k, bs.y * k, bs.z * k)
  })
  // chloroplast photosynthesis beat: green glow breathing
  part('chloroplast')?.forEach(m => {
    const mm = (m as THREE.Mesh).material as THREE.MeshPhysicalMaterial | undefined
    if (mm && 'emissiveIntensity' in mm) mm.emissiveIntensity = 0.35 + 0.14 * Math.sin(t * 1.6)
  })
  // membrane turgor glow
  part('membrane')?.forEach(m => {
    const mm = (m as THREE.Mesh).material as THREE.MeshPhysicalMaterial | undefined
    if (mm && 'emissiveIntensity' in mm) mm.emissiveIntensity = 0.25 + 0.1 * Math.sin(t * 0.9 + 0.7)
  })
  // nucleolus steady factory pulse
  part('nucleolus')?.forEach(m => {
    const mm = (m as THREE.Mesh).material as THREE.MeshPhysicalMaterial | undefined
    if (mm && 'emissiveIntensity' in mm) mm.emissiveIntensity = 0.35 + 0.12 * Math.sin(t * 2.1 + 1)
  })
}
