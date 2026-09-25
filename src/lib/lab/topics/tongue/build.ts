import * as THREE from 'three'
import type { SystemBuildAPI, SystemTickAPI } from '../../types'
import { blob, mat, makeNoise, taperedTube, cap } from '../../engine/helpers'

/**
 * THE TONGUE — thirteenth topic. A top-side study model of the tongue
 * as a muscular hydrostat: a flattened muscle tube (tip · body · root)
 * split by the midline sulcus, carpeted with backward-leaning filiform
 * velvet, dotted with red fungiform mushrooms, walled by the V-row of
 * circumvallate bunkers and the foliate side gills — with taste-bud
 * barrels in every pocket, tonsil guards, the epiglottis flap and the
 * three-nerve wiring hanging below. The Taste Signal Route runs a
 * signal from bud → nerve trunk → up toward the brain.
 */

/* ── analytic surface: top height of the body tube at (z, lateral x) ──── */
const R0 = 0.68
const uOf = (z: number) => Math.min(1, Math.max(0, (z + 1.5) / 3))
const radiusAt = (z: number) => R0 - 0.55 * uOf(z) ** 2
const centerY = (z: number) => 0.05 + uOf(z) * 0.17
const halfW = (z: number) => radiusAt(z) * 1.02
function surfaceY(z: number, x = 0): number {
  const r = radiusAt(z)
  const k = Math.min(1, Math.abs(x) / (r * 1.02))
  return centerY(z) + 0.72 * r * Math.sqrt(Math.max(0, 1 - k * k))
}

export function buildTongue(api: SystemBuildAPI) {
  const M = {
    body: mat(0xc4666e, { roughness: 0.48, clearcoat: 0.35, sheen: 0.35, emissive: 0x1c0808, emissiveIntensity: 0.3 }),
    tip: mat(0xc86e74, { roughness: 0.46, clearcoat: 0.4, sheen: 0.35, emissive: 0x1c0808, emissiveIntensity: 0.3 }),
    root: mat(0xb85e66, { roughness: 0.55, clearcoat: 0.25, emissive: 0x180606, emissiveIntensity: 0.35 }),
    sulcus: mat(0x9e4450, { roughness: 0.6, clearcoat: 0.2, emissive: 0x140404, emissiveIntensity: 0.3 }),
    filiform: mat(0xe6d0c4, { roughness: 0.65, clearcoat: 0.15, sheen: 0.3, emissive: 0x181010, emissiveIntensity: 0.25 }),
    fungStem: mat(0xe098a0, { roughness: 0.5, clearcoat: 0.3, emissive: 0x160808, emissiveIntensity: 0.25 }),
    fungCap: mat(0xd8546a, { roughness: 0.42, clearcoat: 0.5, sheen: 0.3, emissive: 0x1e0608, emissiveIntensity: 0.35 }),
    moat: mat(0xe4b2ac, { roughness: 0.55, clearcoat: 0.25, emissive: 0x160808, emissiveIntensity: 0.25 }),
    wall: mat(0xd89a94, { roughness: 0.5, clearcoat: 0.3, emissive: 0x160808, emissiveIntensity: 0.3 }),
    vallDome: mat(0xd0707a, { roughness: 0.45, clearcoat: 0.4, emissive: 0x1a0608, emissiveIntensity: 0.3 }),
    foliate: mat(0xc26872, { roughness: 0.5, clearcoat: 0.3, emissive: 0x160606, emissiveIntensity: 0.3 }),
    bud: mat(0xf0b268, { roughness: 0.45, clearcoat: 0.4, emissive: 0x2a1604, emissiveIntensity: 0.5 }),
    budPore: mat(0x503020, { roughness: 0.7, emissive: 0x000000, emissiveIntensity: 0 }),
    tonsil: mat(0xd47c8c, { roughness: 0.5, clearcoat: 0.3, sheen: 0.35, emissive: 0x180808, emissiveIntensity: 0.3 }),
    epi: mat(0xd8a08e, { roughness: 0.5, clearcoat: 0.35, sheen: 0.3, emissive: 0x180a06, emissiveIntensity: 0.3 }),
    nerve: mat(0xe8c860, { roughness: 0.45, clearcoat: 0.4, emissive: 0x443008, emissiveIntensity: 0.55 }),
  }
  M.body.bumpMap = makeNoise(5); M.body.bumpScale = 0.006
  M.root.bumpMap = makeNoise(4); M.root.bumpScale = 0.008
  api.addMaterials(Object.values(M))

  /* ══ BODY — the muscular hydrostat: flattened tapered tube ═══════════ */
  const body = taperedTube(
    [[0, 0.05, -1.5], [0, 0.09, -0.85], [0, 0.12, -0.15], [0, 0.14, 0.5], [0, 0.16, 1.05], [0, 0.22, 1.5]],
    u => R0 - 0.55 * u * u, M.body, 72, 18,
  )
  body.scale.y = 0.72; body.scale.x = 1.02
  api.add('body', body)
  /* tip: upturned cap finishing the tube */
  api.add('tip', cap([0, 0.24, 1.52], 0.24, M.tip))

  /* ══ ROOT — wider lumpy back third ═══════════════════════════════════ */
  api.add('root', blob([0, 0.06, -1.34], 0.5, M.root, [1.12, 0.8, 0.95], 0.045, 4))

  /* ══ MEDIAN SULCUS — dark midline groove sunk into the surface ═══════ */
  api.add('sulcus', taperedTube(
    [[0, surfaceY(1.3) - 0.015, 1.3], [0, surfaceY(0.6) - 0.02, 0.6], [0, surfaceY(-0.2) - 0.02, -0.2], [0, surfaceY(-0.8) - 0.02, -0.8], [0, surfaceY(-1.2) - 0.015, -1.2]],
    u => 0.042 - 0.012 * u, M.sulcus, 40, 10,
  ))

  /* ══ FILIFORM — velvet carpet of backward-leaning keratin spikes ═════ */
  let placed = 0
  let seed = 7
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
  const coneGeo = new THREE.ConeGeometry(0.026, 0.085, 6)
  while (placed < 88) {
    const z = -1.35 + rnd() * 2.77
    const w = halfW(z) * 0.8
    const x = (rnd() * 2 - 1) * w
    if (Math.abs(x) < 0.075) continue // keep the sulcus clear
    const y = surfaceY(z, x) + 0.012
    const spike = new THREE.Mesh(coneGeo, M.filiform)
    spike.position.set(x, y, z)
    spike.rotation.x = -0.35 + rnd() * 0.2 // lean toward the throat
    spike.rotation.z = (rnd() - 0.5) * 0.3
    spike.userData.tilt = spike.rotation.x
    spike.userData.ph = rnd() * 6.28
    api.add('filiform', spike)
    placed++
  }

  /* ══ FUNGIFORM — red mushroom dots with a bud on every cap ═══════════ */
  const FUNG: [number, number][] = [
    [0.32, 0.95], [-0.38, 0.75], [0.46, 0.45], [-0.5, 0.28], [0.2, 1.28],
    [-0.24, 1.08], [0.55, -0.1], [-0.6, -0.28], [0.35, -0.42], [-0.32, -0.52],
  ]
  for (const [x, z] of FUNG) {
    const y = surfaceY(z, x)
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.03, 0.06, 10), M.fungStem)
    stem.position.set(x, y + 0.01, z)
    api.add('fungiform', stem)
    const mushroom = blob([x, y + 0.05, z], 0.075, M.fungCap, [1, 0.62, 1], 0.012, 3)
    api.add('fungiform', mushroom)
    addTasteBud(api, M, x, y + 0.095, z, 0.85)
  }

  /* ══ CIRCUMVALLATE — the walled V: moat ring + wall + dome + buds ════ */
  const VX = [-0.85, -0.63, -0.4, -0.16, 0, 0.16, 0.4, 0.63, 0.85]
  for (const x of VX) {
    const z = -0.72 - Math.abs(x) * 0.42
    const y = surfaceY(z, x)
    const moatRing = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.03, 10, 24), M.moat)
    moatRing.rotation.x = Math.PI / 2
    moatRing.position.set(x, y + 0.015, z)
    api.add('circumvallate', moatRing)
    const wallRing = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.026, 10, 22), M.wall)
    wallRing.rotation.x = Math.PI / 2
    wallRing.position.set(x, y + 0.045, z)
    api.add('circumvallate', wallRing)
    const dome = blob([x, y + 0.035, z], 0.07, M.vallDome, [1, 0.68, 1], 0.01, 3)
    api.add('circumvallate', dome)
    addTasteBud(api, M, x - 0.062, y + 0.06, z, 0.7)
    addTasteBud(api, M, x + 0.062, y + 0.06, z, 0.7)
  }

  /* ══ FOLIATE — parallel side gills with a bud per ridge ══════════════ */
  for (const side of [1, -1] as const) {
    for (let i = 0; i < 4; i++) {
      const z = -0.62 - i * 0.15
      const x = side * (halfW(z) - 0.1)
      const y = surfaceY(z, x)
      const ridge = blob([x, y - 0.02, z], 0.075, M.foliate, [0.34, 0.8, 1.0], 0.02, 3)
      ridge.rotation.y = side * 0.18
      api.add('foliate', ridge)
      addTasteBud(api, M, x, y + 0.045, z, 0.7)
    }
  }

  /* ══ TONSILS — bumpy immune ovals flanking the root ══════════════════ */
  for (const side of [1, -1] as const) {
    const tonsil = blob([side * 0.82, 0.14, -1.32], 0.24, M.tonsil, [0.62, 0.85, 0.78], 0.05, 4)
    api.add('tonsil', tonsil)
  }

  /* ══ EPIGLOTTIS — the leaf lid standing behind the root ══════════════ */
  const flap = blob([0, 0.48, -1.68], 0.3, M.epi, [0.72, 1.15, 0.3], 0.02, 3)
  flap.rotation.x = 0.45
  flap.userData.baseRx = flap.rotation.x
  api.add('epiglottis', flap)
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.28, 10), M.epi)
  stalk.position.set(0, 0.18, -1.62)
  stalk.rotation.x = 0.45
  api.add('epiglottis', stalk)

  /* ══ NERVES — the three-wire hookup hanging under the body ═══════════ */
  api.add('nerve', taperedTube(
    [[0, -0.12, -1.8], [0.04, -0.26, -1.2], [0.06, -0.3, -0.55], [0.03, -0.28, 0.25]],
    u => 0.03 - 0.008 * u, M.nerve, 40, 10,
  ))
  api.add('nerve', taperedTube( // right branch curling up the side
    [[0.06, -0.3, -0.55], [0.42, -0.18, -0.4], [0.56, 0.05, -0.18], [0.6, 0.2, -0.05]],
    u => 0.018 - 0.008 * u, M.nerve, 32, 8,
  ))
  api.add('nerve', taperedTube( // left branch
    [[-0.06, -0.3, -0.55], [-0.42, -0.18, -0.4], [-0.56, 0.05, -0.18], [-0.6, 0.2, -0.05]],
    u => 0.018 - 0.008 * u, M.nerve, 32, 8,
  ))
  api.add('nerve', taperedTube( // forward run toward the tip
    [[0.03, -0.28, 0.25], [0.06, -0.26, 0.7], [0.05, -0.22, 1.1], [0.03, -0.16, 1.35]],
    u => 0.016 - 0.007 * u, M.nerve, 32, 8,
  ))

  /* ══ FLOW — Taste Signal Route: bud → nerve → toward the brain ═══════ */
  api.addFlow({
    guideColor: 0xd8a0b0,
    guideOpacity: 0.12,
    curves: [
      { // from a right circumvallate bunker into the trunk
        pts: [[0.4, 0.32, -1.08], [0.52, 0.05, -1.3], [0.3, -0.22, -1.5], [0.05, -0.35, -1.78]],
        count: 5, speed: 0.055, color: 0xffe2a0, glow: 0xffc060, tail: false,
      },
      { // from a left fungiform cap sweeping back to the trunk
        pts: [[-0.38, 0.5, 0.45], [-0.46, 0.05, -0.35], [-0.22, -0.3, -0.85], [0, -0.34, -1.5], [0, -0.5, -1.88]],
        count: 4, speed: 0.05, color: 0xf0b8c8, glow: 0xe088a8, tail: false,
      },
      { // up the wiring toward the brain (off-model)
        pts: [[0, -0.4, -1.75], [0, -0.1, -2.0], [0, 0.5, -2.2], [0, 1.05, -2.35]],
        count: 5, speed: 0.06, color: 0xd0c0f0, glow: 0xa888e0, tail: false,
      },
    ],
  })
}

/* taste bud = orange barrel + dark pore dome on top */
function addTasteBud(
  api: SystemBuildAPI, M: Record<string, THREE.MeshPhysicalMaterial>,
  x: number, y: number, z: number, s: number,
) {
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02 * s, 0.028 * s, 0.055 * s, 10), M.bud)
  barrel.position.set(x, y, z)
  barrel.userData.ph = ((x * 13 + z * 7) % 6.28)
  api.add('tasteBud', barrel)
  const pore = new THREE.Mesh(new THREE.SphereGeometry(0.011 * s, 8, 6), M.budPore)
  pore.position.set(x, y + 0.03 * s, z)
  api.add('tasteBud', pore)
}

/* ── idle shimmer: muscle breathing · bud glow · velvet sway · lid nod ── */
export function tickTongue({ t, part, exploded }: SystemTickAPI) {
  if (exploded) return
  // the body breathes (muscular hydrostat at rest)
  part('body')?.forEach(m => {
    const bs = (m.userData.bs ??= m.scale.clone()) as THREE.Vector3
    const k = 1 + 0.012 * Math.sin(t * 0.9)
    m.scale.set(bs.x * k, bs.y * (2 - k), bs.z)
  })
  // taste buds twinkle as they fire
  part('tasteBud')?.forEach(m => {
    const mm = (m as THREE.Mesh).material as THREE.MeshPhysicalMaterial | undefined
    const ph = (m.userData.ph ??= 0)
    if (mm && 'emissiveIntensity' in mm) mm.emissiveIntensity = 0.5 + 0.22 * Math.sin(t * 1.8 + ph)
  })
  // filiform velvet sways like grass
  part('filiform')?.forEach(m => {
    const base = (m.userData.tilt ??= m.rotation.x)
    const ph = (m.userData.ph ??= 0)
    m.rotation.x = base + 0.06 * Math.sin(t * 1.3 + ph)
  })
  // the epiglottis nods, waiting for the next swallow
  part('epiglottis')?.forEach(m => {
    const base = (m.userData.baseRx ??= m.rotation.x)
    m.rotation.x = base + 0.04 * Math.sin(t * 0.7)
  })
}
