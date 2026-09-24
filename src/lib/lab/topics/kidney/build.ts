import * as THREE from 'three'
import type { SystemBuildAPI, SystemTickAPI } from '../../types'
import { blob, cap, mat, makeNoise, organic, taperedTube } from '../../engine/helpers'

/**
 * THE KIDNEY — eighth topic. Textbook spread layout: the bean on the
 * right with a hilum dent and a cutaway opening revealing cortex →
 * medulla → pyramids → pelvis plumbing, and ONE nephron blown up to
 * study size on the left (Bowman's cup + glomerulus knot + coiled
 * tubules + hairpin loop + shared collecting duct), connected by a
 * faint "magnified view" zoom cone. "Filtration pulse" idle animates
 * the glomerulus glow and a shimmer down the tubule train.
 */

/* ── kidney bean: sphere with a hilum dent on -X + cutaway opening ─────── */
function beanGeo(r: number): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(r, 56, 40, 0.85, Math.PI * 2 - 1.1)
  const p = geo.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i)
    const d = Math.max(0, -x / r) // 0 at hilum plane → 1 at the -X pole
    const push = d * d * r * 0.42 // smooth dent pushing the pole inward
    p.setXYZ(i, x + push, y, z)
  }
  geo.computeVertexNormals()
  return organic(geo, 0.012, 2.6)
}

/* ── one renal pyramid: flattened cone, apex pointing -X (hilum) ───────── */
function pyramid(pos: [number, number, number], m: THREE.Material, fan: number): THREE.Mesh {
  const g = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.95, 22), m)
  g.rotation.z = Math.PI / 2 // apex → -X
  g.rotation.x = fan
  g.scale.z = 0.55
  g.position.set(...pos)
  return g
}

/** calyx cup capping a pyramid papilla (apex toward the pelvis) */
function calyx(pos: [number, number, number], m: THREE.Material): THREE.Mesh {
  const g = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.34, 14), m)
  g.rotation.z = Math.PI / 2
  g.scale.z = 0.6
  g.position.set(...pos)
  return g
}

const K: [number, number, number] = [2.3, 0.25, -0.2] // kidney center
const N = {
  capsule: [-1.1, 1.15, 0] as [number, number, number],
  ductTop: [-1.15, 0.8, 0] as [number, number, number],
  ductEnd: [-1.18, -0.95, -0.02] as [number, number, number],
}

/* tubule waypoints, reused by both the build and the flow curves */
const PCT_PTS: [number, number, number][] = [
  [-1.42, 0.85, 0], [-1.65, 0.7, 0.14], [-1.95, 0.95, -0.1],
  [-2.2, 0.68, 0.08], [-2.42, 0.9, -0.06], [-2.5, 0.55, 0],
]
const HENLE_PTS: [number, number, number][] = [
  [-2.5, 0.55, 0], [-2.62, 0.05, 0.04], [-2.55, -0.5, 0],
  [-2.3, -0.68, 0], [-2.15, -0.3, -0.06], [-2.08, 0.4, -0.06],
]
const DCT_PTS: [number, number, number][] = [
  [-2.08, 0.4, -0.06], [-1.85, 0.62, 0.1], [-1.6, 0.45, -0.06], [-1.32, 0.66, 0.04],
]
const DUCT_PTS: [number, number, number][] = [
  [-1.12, 0.9, 0], [-1.1, 0.2, -0.04], [-1.14, -0.5, -0.05], [-1.18, -0.95, -0.02],
]

export function buildKidney(api: SystemBuildAPI) {
  const M = {
    cortex: mat(0xb85c50, {
      roughness: 0.48, sheen: 0.3, side: THREE.DoubleSide,
      emissive: 0x1c0705, emissiveIntensity: 0.25,
    }),
    medulla: mat(0xcd8570, { roughness: 0.52, sheen: 0.25 }),
    pyramid: mat(0xa85a4c, { roughness: 0.5, sheen: 0.2 }),
    pelvis: mat(0xe8d9a8, { roughness: 0.42, clearcoat: 0.35, emissive: 0x241c08, emissiveIntensity: 0.25 }),
    ureter: mat(0xdfcfa0, { roughness: 0.48, clearcoat: 0.25 }),
    artery: mat(0xc05a55, { roughness: 0.42, clearcoat: 0.3, emissive: 0x2a0806, emissiveIntensity: 0.3 }),
    vein: mat(0x7a5a8f, { roughness: 0.44, clearcoat: 0.3, emissive: 0x120820, emissiveIntensity: 0.3 }),
    capsule: mat(0xcfd8e2, {
      roughness: 0.32, clearcoat: 0.5, clearcoatRoughness: 0.3,
      side: THREE.DoubleSide, transparent: true, opacity: 0.82, envMapIntensity: 0.8,
    }),
    glom: mat(0xc94f48, { roughness: 0.38, clearcoat: 0.4, emissive: 0x400a08, emissiveIntensity: 0.3 }),
    pct: mat(0xe0a08a, { roughness: 0.44, clearcoat: 0.3, emissive: 0x200804, emissiveIntensity: 0.25 }),
    henle: mat(0xb08ac0, { roughness: 0.44, clearcoat: 0.3, emissive: 0x140820, emissiveIntensity: 0.25 }),
    dct: mat(0xe8b08a, { roughness: 0.44, clearcoat: 0.3, emissive: 0x200c04, emissiveIntensity: 0.25 }),
    duct: mat(0xe6cf9a, { roughness: 0.46, clearcoat: 0.28, emissive: 0x1e1604, emissiveIntensity: 0.25 }),
    ghost: mat(0xd8b8a8, { roughness: 0.6, transparent: true, opacity: 0.3 }),
    wire: mat(0xf2e8dc, { roughness: 0.7, transparent: true, opacity: 0.32 }),
  }
  M.cortex.bumpMap = makeNoise(4); M.cortex.bumpScale = 0.008
  M.pyramid.bumpMap = makeNoise(6); M.pyramid.bumpScale = 0.01
  api.addMaterials(Object.values(M))

  /* ══ KIDNEY (right) ══════════════════════════════════════════════════ */
  // cortex shell with hilum dent + cutaway opening (DoubleSide shows interior)
  const cortex = new THREE.Mesh(beanGeo(1.4), M.cortex)
  cortex.position.set(...K)
  cortex.scale.set(0.72, 1.0, 0.62)
  api.add('cortex', cortex)
  // inner cortex lining caps the cut edge with a darker rim
  const lining = new THREE.Mesh(beanGeo(1.34), M.medulla)
  lining.position.set(...K)
  lining.scale.set(0.7, 0.98, 0.6)
  api.add('cortex', lining)

  // medulla mass inside
  api.add('medulla', blob([2.35, 0.25, -0.2], 0.95, M.medulla, [0.5, 0.78, 0.48], 0.02, 2.4))

  // three pyramids tipping into the pelvis
  api.add('pyramid', pyramid([2.5, 0.62, -0.2], M.pyramid, -0.14))
  api.add('pyramid', pyramid([2.52, 0.22, -0.2], M.pyramid, 0))
  api.add('pyramid', pyramid([2.5, -0.18, -0.2], M.pyramid, 0.14))

  // pelvis funnel + calyx cups at the papillae
  api.add('pelvis', blob([1.88, 0.1, -0.2], 0.28, M.pelvis, [0.75, 1.05, 0.7], 0.02, 3))
  api.add('pelvis', calyx([2.02, 0.5, -0.2], M.pelvis))
  api.add('pelvis', calyx([2.06, 0.14, -0.2], M.pelvis))
  api.add('pelvis', calyx([2.02, -0.22, -0.2], M.pelvis))

  // ureter: pelvis → down toward the bladder
  api.add('ureter', taperedTube(
    [[1.78, -0.1, -0.18], [1.55, -0.6, -0.12], [1.65, -1.2, 0], [2.0, -1.85, 0.1]],
    u => 0.085 - 0.015 * u, M.ureter, 48, 12,
  ))
  api.add('ureter', cap([1.78, -0.1, -0.18], 0.085, M.ureter))

  // renal artery: from the aorta side, into the hilum, branching inside
  api.add('artery', taperedTube(
    [[1.05, 0.95, 0.55], [1.45, 0.75, 0.25], [1.78, 0.5, 0]],
    u => 0.115 - 0.02 * u, M.artery, 32, 12,
  ))
  api.add('artery', taperedTube([[1.78, 0.5, 0], [2.25, 0.75, -0.15]], () => 0.055, M.artery, 16, 10))
  api.add('artery', taperedTube([[1.78, 0.5, 0], [2.25, 0.28, -0.22]], () => 0.05, M.artery, 16, 10))
  api.add('artery', taperedTube([[1.78, 0.5, 0], [2.15, 0.02, -0.18]], () => 0.045, M.artery, 16, 10))

  // renal vein: parallel and slightly below/behind
  api.add('vein', taperedTube(
    [[0.95, 0.1, 0.7], [1.4, 0.05, 0.3], [1.72, 0.02, 0.02]],
    u => 0.14 - 0.02 * u, M.vein, 32, 12,
  ))
  api.add('vein', taperedTube([[1.72, 0.02, 0.02], [2.3, 0.08, -0.18]], () => 0.07, M.vein, 16, 10))

  /* ══ ZOOM CONE — "one nephron, magnified" (decor) ════════════════════ */
  const zoomDot = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.016, 8, 36), M.wire)
  zoomDot.position.set(2.18, 1.28, 0.42)
  api.addDecor(zoomDot)
  const zoomRing = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.02, 8, 56), M.wire)
  zoomRing.position.set(-1.75, 0.35, -0.1)
  api.addDecor(zoomRing)
  api.addDecor(taperedTube(
    [[2.0, 1.45, 0.44], [0.6, 1.65, 0.2], [-0.7, 1.72, 0.05]],
    () => 0.013, M.wire, 24, 6,
  ))
  api.addDecor(taperedTube(
    [[2.32, 1.18, 0.5], [1.0, -0.4, 0.3], [-0.5, -1.15, 0.05]],
    () => 0.013, M.wire, 24, 6,
  ))

  /* ══ NEPHRON (left, study scale) ═════════════════════════════════════ */
  // Bowman's capsule: cup with a tilted bottom opening (DoubleSide)
  const capsule = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 40, 26, 0, Math.PI * 2, 0.42 * Math.PI, 0.42 * Math.PI),
    M.capsule,
  )
  capsule.position.set(...N.capsule)
  capsule.rotation.z = -0.8 // tilt the opening toward the tubule side (down-left)
  api.add('capsule', capsule)

  // glomerulus: knot of capillary spheres inside the cup + arterioles
  const knot: [number, number, number][] = [
    [-1.08, 1.12, 0.02], [-1.2, 1.24, 0.08], [-0.98, 1.22, -0.09],
    [-1.14, 1.02, -0.08], [-1.0, 1.05, 0.12], [-1.24, 1.08, -0.02],
    [-1.05, 1.3, -0.04], [-1.18, 1.18, -0.12], [-1.12, 1.14, 0.1],
  ]
  knot.forEach((p, i) => api.add('glomerulus', blob(p, 0.1 + (i % 3) * 0.017, M.glom, undefined, 0.012, 5)))
  api.add('glomerulus', taperedTube(
    [[-0.5, 1.58, 0.1], [-0.78, 1.4, 0.06], [-0.98, 1.28, 0.04]],
    u => 0.06 - 0.008 * u, M.artery, 16, 10,
  ))
  api.add('glomerulus', taperedTube(
    [[-1.02, 0.8, 0.05], [-0.82, 0.55, 0.02], [-0.72, 0.35, 0]],
    u => 0.036 - 0.004 * u, M.artery, 16, 10,
  ))

  // proximal convoluted tubule: greedy coil out of the capsule
  api.add('pct', taperedTube(PCT_PTS, u => 0.082 - 0.01 * u, M.pct, 72, 12))
  api.add('pct', cap([-1.42, 0.85, 0], 0.08, M.pct))

  // loop of Henle: the hairpin dive
  api.add('henle', taperedTube(HENLE_PTS, () => 0.07, M.henle, 80, 12))

  // distal tubule: meanders back to the duct
  api.add('dct', taperedTube(DCT_PTS, u => 0.068 - 0.006 * u, M.dct, 48, 12))

  // collecting duct: shared vertical trunk, flaring at the top
  api.add('duct', taperedTube(DUCT_PTS, u => 0.072 + 0.026 * u, M.duct, 40, 12))
  api.add('duct', cap([-1.18, -0.95, -0.02], 0.095, M.duct))

  // faint sibling nephrons sharing the duct (decor — "×1,000,000")
  const ghostTubes: [number, number, number][][] = [
    [[-1.5, 1.0, -0.3], [-1.62, 0.2, -0.3], [-1.5, -0.5, -0.28], [-1.28, 0.6, -0.28]],
    [[-0.85, 0.9, -0.34], [-0.7, 0.1, -0.32], [-0.85, -0.6, -0.3], [-1.05, 0.3, -0.3]],
  ]
  ghostTubes.forEach(pts => api.addDecor(taperedTube(pts, () => 0.05, M.ghost, 32, 8)))

  /* ══ FLOW — the filtration journey ═══════════════════════════════════ */
  api.addFlow({
    guideColor: 0xe8b08a,
    guideOpacity: 0.18,
    curves: [
      // 1 · dirty blood: renal artery → (zoom) → afferent arteriole
      {
        pts: [[2.75, 1.3, 0.95], [1.6, 0.95, 0.45], [1.1, 1.2, 0.28], [-0.5, 1.58, 0.12], [-0.95, 1.3, 0.05]],
        count: 5, speed: 0.05, color: 0xff9a8a, glow: 0xff6a5a,
      },
      // 2 · filtrate: glomerulus → capsule → PCT → Henle → DCT → duct
      {
        pts: [
          [-1.05, 1.12, 0.02], [-1.42, 0.85, 0], ...PCT_PTS.slice(1),
          ...HENLE_PTS.slice(1), ...DCT_PTS.slice(1),
          N.ductTop, [-1.1, 0.2, -0.04], [-1.14, -0.5, -0.05], N.ductEnd,
        ],
        count: 9, speed: 0.04, color: 0xffe9a8, glow: 0xffd27a,
      },
      // 3 · finished urine: duct → (zoom out) → pelvis → ureter
      {
        pts: [[-1.18, -0.98, -0.02], [1.7, -0.35, -0.1], [1.78, -0.12, -0.18], [1.55, -0.6, -0.12], [1.65, -1.2, 0], [2.0, -1.85, 0.1]],
        count: 5, speed: 0.055, color: 0xf6ffc8, glow: 0xd8f57a,
      },
      // 4 · clean blood: efferent → peritubular trip → renal vein
      {
        pts: [[-0.98, 0.8, 0.05], [-0.6, 0.42, 0.28], [0.0, 0.3, 0.5], [0.65, 0.2, 0.62], [1.35, 0.1, 0.5], [1.75, 0.02, 0.02]],
        count: 5, speed: 0.045, color: 0x9fd8ff, glow: 0x6ab8ff,
      },
    ],
  })
}

/* ── "filtration pulse" idle: glomerulus glow → tubule shimmer ────────── */
export function tickKidney({ t, part, exploded }: SystemTickAPI) {
  if (exploded) return
  // the filter "works" — breathing glomerulus
  part('glomerulus')?.forEach(m => {
    const mesh = m as THREE.Mesh
    const mm = mesh.material as THREE.MeshPhysicalMaterial | undefined
    if (mm && 'emissiveIntensity' in mm) mm.emissiveIntensity = 0.28 + 0.22 * Math.sin(t * 2.6)
  })
  // filtrate shimmer travels down the tubule train (phase-offset glow)
  ;(['pct', 'henle', 'dct', 'duct'] as const).forEach((key, i) => {
    const w = Math.sin(t * 1.9 - (i + 1) * 0.8)
    part(key)?.forEach(m => {
      const mm = (m as THREE.Mesh).material as THREE.MeshPhysicalMaterial | undefined
      if (mm && 'emissiveIntensity' in mm) mm.emissiveIntensity = 0.22 + 0.13 * w
    })
  })
  // ureter peristalsis: gentle positional wobble (explode-safe base)
  const wob = Math.sin(t * 3.2) * 0.008
  part('ureter')?.forEach(m => {
    const bp = (m.userData.bp ??= m.position.clone()) as THREE.Vector3
    m.position.set(bp.x + wob * 0.4, bp.y + wob, bp.z)
  })
  // pelvis squeeze — subtle emissive beat
  part('pelvis')?.forEach(m => {
    const mm = (m as THREE.Mesh).material as THREE.MeshPhysicalMaterial | undefined
    if (mm && 'emissiveIntensity' in mm) mm.emissiveIntensity = 0.24 + 0.14 * Math.sin(t * 3.2 - 0.6)
  })
}
