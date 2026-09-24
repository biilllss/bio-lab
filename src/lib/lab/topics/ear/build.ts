import * as THREE from 'three'
import type { SystemBuildAPI, SystemTickAPI } from '../../types'
import { blob, cap, mat, makeNoise, taperedTube } from '../../engine/helpers'

/**
 * THE EAR — seventh topic. Study-model layout: a compact pinna at the
 * front (+Z), the canal tunneling in to the tilted eardrum, the three
 * ossicles ascending like a staircase (malleus → incus → stapes), then
 * the inner ear raised up-left in full view — a true 2¾-turn cochlea
 * spiral, three interlocking semicircular canal loops and the
 * vestibulocochlear nerve running down toward the brainstem, with the
 * eustachian tube dropping to the throat. "Vibration" idle animation
 * (drum flutter → ossicle jitter → cochlear glow) uses the tick hook.
 */

/* ── cochlea spiral: flat XY spiral, tilted & translated into place ────── */
function spiralPoints(
  cx: number, cy: number, cz: number,
  turns = 2.65, r0 = 0.35, shrink = 0.74, tilt = -0.5,
): [number, number, number][] {
  const N = 92
  const ca = Math.cos(tilt), sa = Math.sin(tilt)
  const out: [number, number, number][] = []
  for (let i = 0; i <= N; i++) {
    const u = i / N
    const th = u * turns * Math.PI * 2
    const r = r0 * (1 - shrink * u)
    const x = Math.cos(th) * r * 1.06
    const y = Math.sin(th) * r
    const z = -0.2 * u // the coil rises slightly along its axis
    // rotate about X (tilt the spiral face toward the camera), translate
    out.push([cx + x, cy + y * ca - z * sa, cz + y * sa + z * ca])
  }
  return out
}

/** store base scale / position for the tick animation */
const animMesh = (m: THREE.Mesh) => {
  m.userData.bs = m.scale.clone()
  m.userData.bp = m.position.clone()
  return m
}

export function buildEar(api: SystemBuildAPI) {
  const M = {
    skin: mat(0xd9a08c, { roughness: 0.52, sheen: 0.35 }),
    skinDeep: mat(0xc2826c, { roughness: 0.55, sheen: 0.25 }),
    canal: mat(0xc98d76, {
      roughness: 0.6, sheen: 0.2, side: THREE.DoubleSide,
      transparent: true, opacity: 0.94, depthWrite: true,
    }),
    drum: mat(0xe6dbd2, {
      roughness: 0.25, clearcoat: 0.7, clearcoatRoughness: 0.25,
      transparent: true, opacity: 0.8, envMapIntensity: 0.8,
      emissive: 0x2a2118, emissiveIntensity: 0.35,
    }),
    bone: mat(0xefe6d2, { roughness: 0.34, clearcoat: 0.5, clearcoatRoughness: 0.3 }),
    cochlea: mat(0xe3c3a8, { roughness: 0.4, clearcoat: 0.42, sheen: 0.2, emissive: 0x30180a, emissiveIntensity: 0.25 }),
    canals: mat(0xdccbb4, { roughness: 0.42, clearcoat: 0.35 }),
    nerve: mat(0xe9e1cf, { roughness: 0.5, clearcoat: 0.22 }),
    eustachian: mat(0xd69883, { roughness: 0.55, sheen: 0.25 }),
  }
  M.skin.bumpMap = makeNoise(5); M.skin.bumpScale = 0.006
  api.addMaterials(Object.values(M))

  /* ── pinna: flat concha disc + helix rim in front + lobe + tragus ────── */
  api.add('pinna', animMesh(
    blob([0, -0.05, 0.06], 0.31, M.skin, [0.88, 1.12, 0.26], 0.07, 3.2),
  ))
  const helix = new THREE.Mesh(
    new THREE.TorusGeometry(0.35, 0.072, 12, 40, Math.PI * 1.38),
    M.skin,
  )
  helix.position.set(0, 0.0, 0.03)
  helix.rotation.z = Math.PI * 1.1
  helix.scale.set(1, 1.1, 0.5)
  api.add('pinna', helix)
  const antihelix = new THREE.Mesh(
    new THREE.TorusGeometry(0.21, 0.05, 10, 32, Math.PI * 1.05),
    M.skinDeep,
  )
  antihelix.position.set(-0.03, 0.04, 0.12)
  antihelix.rotation.z = Math.PI * 1.02
  antihelix.scale.set(0.95, 1.0, 0.45)
  api.add('pinna', antihelix)
  api.add('pinna', animMesh(blob([0.03, -0.32, 0.06], 0.15, M.skin, [1, 1.15, 0.55], 0.05, 3)))
  api.add('pinna', blob([0.24, -0.02, 0.16], 0.09, M.skinDeep, [1, 1.1, 0.5], 0.04, 3))

  /* ── ear canal: open-bore tube so you can peer at the eardrum ────────── */
  api.add('canal', taperedTube(
    [[0, -0.02, 0.08], [0.02, 0.02, -0.35], [0.02, 0.05, -0.62], [0.02, 0.07, -0.76]],
    u => 0.15 - 0.055 * u,
    M.canal, 48, 20,
  ))

  /* ── eardrum: tilted pearl membrane capping the canal ────────────────── */
  const drum = new THREE.Mesh(new THREE.SphereGeometry(0.135, 32, 20), M.drum)
  drum.position.set(0.02, 0.07, -0.79)
  drum.scale.set(1.05, 1.0, 0.3)
  drum.rotation.x = -0.35
  api.add('eardrum', animMesh(drum))

  /* ── ossicles: malleus → incus → stapes ascending staircase ──────────── */
  // malleus: handle fused to the drum + head
  api.add('malleus', taperedTube(
    [[0.02, 0.09, -0.8], [0.05, 0.2, -0.88], [0.09, 0.3, -0.94]],
    u => 0.032 - 0.007 * u, M.bone, 16, 10,
  ))
  api.add('malleus', animMesh(blob([0.1, 0.36, -0.95], 0.06, M.bone, undefined, 0.008, 5)))
  // incus: body + long process down to the stapes + short process
  api.add('incus', animMesh(blob([0.17, 0.44, -1.03], 0.055, M.bone, undefined, 0.008, 5)))
  api.add('incus', taperedTube(
    [[0.17, 0.44, -1.03], [0.14, 0.52, -1.1], [0.11, 0.58, -1.16]],
    u => 0.024 - 0.006 * u, M.bone, 16, 10,
  ))
  api.add('incus', taperedTube(
    [[0.17, 0.44, -1.03], [0.23, 0.42, -1.09], [0.25, 0.38, -1.13]],
    u => 0.022 - 0.006 * u, M.bone, 12, 10,
  ))
  // stapes: head + two legs + footplate in the oval window
  api.add('stapes', animMesh(blob([0.11, 0.62, -1.18], 0.042, M.bone, undefined, 0.006, 5)))
  api.add('stapes', taperedTube(
    [[0.11, 0.62, -1.18], [0.07, 0.62, -1.26], [0.03, 0.62, -1.3]],
    () => 0.015, M.bone, 10, 8,
  ))
  api.add('stapes', taperedTube(
    [[0.11, 0.62, -1.18], [0.09, 0.68, -1.26], [0.05, 0.68, -1.3]],
    () => 0.015, M.bone, 10, 8,
  ))
  api.add('stapes', animMesh(
    (() => { const f = blob([0.02, 0.65, -1.33], 0.05, M.bone, undefined, 0.004, 5); f.scale.z = 0.35; return f })(),
  ))

  /* ── cochlea: true 2¾-turn spiral + modiolus core, raised up-left ────── */
  const C: [number, number, number] = [-0.42, 0.62, -1.5]
  const spiral = spiralPoints(C[0], C[1], C[2])
  api.add('cochlea', taperedTube(
    spiral,
    u => 0.078 - 0.042 * u,
    M.cochlea, 170, 12,
  ))
  api.add('cochlea', cap([C[0] - 0.02, C[1] + 0.02, C[2] + 0.09], 0.07, M.cochlea))

  /* ── semicircular canals: three interlocking rings + ampullae ────────── */
  const ring = (
    pos: [number, number, number],
    rot: [number, number, number],
    ampAngle: number,
  ) => {
    const g = new THREE.Group()
    const r = 0.26
    const torus = new THREE.Mesh(new THREE.TorusGeometry(r, 0.032, 10, 44), M.canals)
    g.add(torus)
    const amp = blob([Math.cos(ampAngle) * r, Math.sin(ampAngle) * r, 0], 0.05, M.canals, undefined, 0.004, 5)
    g.add(amp)
    g.position.set(...pos)
    g.rotation.set(...rot)
    api.group.add(g)
    api.registerTo(g, 'canals', torus)
    api.registerTo(g, 'canals', amp)
  }
  // lateral (horizontal) · superior (front-back vertical) · posterior (side vertical)
  ring([-0.2, 1.0, -1.6], [-0.5, 0.12, 0], 0.7)
  ring([-0.28, 1.06, -1.72], [Math.PI / 2 - 0.42, 0.32, 0.18], 2.2)
  ring([-0.34, 0.94, -1.66], [Math.PI / 2 + 0.48, -0.28, -0.22], 4.0)

  /* ── vestibulocochlear nerve: cochlea + vestibule → brainstem ────────── */
  api.add('nerve', taperedTube(
    [[-0.32, 0.78, -1.7], [-0.26, 0.55, -2.0], [-0.2, 0.3, -2.35], [-0.14, 0.12, -2.75]],
    u => 0.08 - 0.026 * u,
    M.nerve, 48, 12,
  ))
  api.add('nerve', cap([-0.33, 0.8, -1.68], 0.08, M.nerve))

  /* ── eustachian tube: middle ear down & forward to the throat ────────── */
  api.add('eustachian', taperedTube(
    [[0.06, -0.02, -0.85], [0.22, -0.35, -0.62], [0.36, -0.68, -0.32], [0.44, -0.95, 0.02]],
    u => 0.065 + 0.02 * u,
    M.eustachian, 40, 12,
  ))

  /* ── flow: the sound wave journey ─────────────────────────────────────── */
  api.addFlow({
    guideColor: 0xbfe6c8,
    guideOpacity: 0.2,
    curves: [
      // 1 · sound waves funneling from the air into the canal
      {
        pts: [[0.6, 0.35, 2.6], [0.3, 0.2, 1.4], [0.08, 0.08, 0.4], [0.02, 0.05, -0.5], [0.02, 0.07, -0.77]],
        count: 9, speed: 0.06, color: 0xf4fff2, glow: 0xcdf5c8,
      },
      // 2 · eardrum → malleus → incus → stapes (mechanical chain)
      {
        pts: [[0.02, 0.09, -0.8], [0.09, 0.3, -0.94], [0.17, 0.44, -1.03], [0.11, 0.58, -1.16], [0.11, 0.62, -1.18]],
        count: 4, speed: 0.05, color: 0xffe9b8, glow: 0xffd27a,
      },
      // 3 · fluid wave spiraling into the cochlea
      {
        pts: [[0.02, 0.65, -1.33], spiral[0] as [number, number, number], ...spiral.slice(1, 70)],
        count: 6, speed: 0.042, color: 0xdcffc8, glow: 0xa8e88a,
      },
      // 4 · nerve impulse racing to the brain
      {
        pts: [[-0.35, 0.65, -1.55], [-0.32, 0.78, -1.7], [-0.26, 0.55, -2.0], [-0.2, 0.3, -2.35], [-0.14, 0.12, -2.75]],
        count: 5, speed: 0.038, color: 0xd2f4ff, glow: 0x9fe8ff,
      },
    ],
  })
}

/* ── "vibration" idle: drum flutter → ossicle jitter → cochlear glow ──── */
export function tickEar({ t, part, exploded }: SystemTickAPI) {
  if (exploded) return
  const beat = Math.sin(t * 9) // the drum's flutter (visually gentle)

  part('eardrum')?.forEach(m => {
    const bs = m.userData.bs as THREE.Vector3 | undefined
    if (bs) m.scale.set(bs.x * (1 + 0.03 * beat), bs.y * (1 + 0.03 * beat), bs.z)
  })
  // ossicles transmit the vibration down the chain with a phase lag —
  // tiny position jitter around each mesh's stored base (explode-safe:
  // applyExplode rewrites position from its own base whenever it runs)
  ;(['malleus', 'incus', 'stapes'] as const).forEach((key, i) => {
    const j = Math.sin(t * 9 - (i + 1) * 0.55) * 0.012
    const j2 = Math.cos(t * 9 - (i + 1) * 0.55) * 0.008
    part(key)?.forEach(m => {
      const bp = (m.userData.bp ??= m.position.clone()) as THREE.Vector3
      m.position.set(bp.x + j, bp.y + j2, bp.z)
    })
  })
  // the cochlea "processes" — breathing emissive glow
  part('cochlea')?.forEach(m => {
    const mesh = m as THREE.Mesh
    const matl = mesh.material as THREE.MeshPhysicalMaterial | undefined
    if (matl && 'emissiveIntensity' in matl) matl.emissiveIntensity = 0.22 + 0.16 * Math.sin(t * 2.1)
  })
}
