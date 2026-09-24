import * as THREE from 'three'
import type { SystemBuildAPI } from '../../types'
import { blob, lathe, makeNoise, mat, mirror, ribbon, taperedTube, V3 } from '../../engine/helpers'

const TUBE_PTS: [number, number, number][] = [
  [0.42, 2.25, 0.50], [0.85, 2.55, 0.45], [1.25, 2.65, 0.30], [1.5, 2.45, 0.20], [1.6, 2.2, 0.12],
]
const EGG_R: [number, number, number][] = [
  [1.5, 1.95, 0.05], [1.58, 2.06, 0.09], [1.6, 2.22, 0.12], [1.52, 2.48, 0.20],
  [1.22, 2.62, 0.32], [0.82, 2.48, 0.46], [0.44, 2.2, 0.52], [0.22, 1.98, 0.50],
  [0.12, 1.75, 0.42], [0.06, 1.52, 0.34], [0.03, 1.38, 0.30],
]

export function buildFemale(api: SystemBuildAPI) {
  const M = {
    uterus: mat(0xd68f8c, { roughness: 0.5, side: THREE.DoubleSide }),
    endo: mat(0xb84a5a, { roughness: 0.4, side: THREE.DoubleSide, clearcoat: 0.4 }),
    cervix: mat(0xd8a29a, { roughness: 0.5, side: THREE.DoubleSide }),
    vagina: mat(0xd9a39c, { roughness: 0.5, side: THREE.DoubleSide }),
    ovary: mat(0xd9b8ad, { roughness: 0.45, clearcoat: 0.3 }),
    tube: mat(0xe0a8a2),
    fimb: mat(0xc96e79, { roughness: 0.45 }),
    bladder: mat(0xcf9d7e),
    urethra: mat(0x9db3c8, { roughness: 0.45, clearcoat: 0.3 }),
    clitoris: mat(0xc98d7a, { roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.22 }),
    labMin: mat(0xd8a08f, { roughness: 0.5, transparent: true, opacity: 0.55 }),
    labMaj: mat(0xd7a583, { roughness: 0.62, transparent: true, opacity: 0.5, sheen: 0.5 }),
    mons: mat(0xd8ab8b, { roughness: 0.62, transparent: true, opacity: 0.55, sheen: 0.5 }),
  }
  const bump: [THREE.MeshPhysicalMaterial, number, number][] = [
    [M.uterus, 4, 0.012], [M.endo, 3, 0.008], [M.cervix, 3, 0.01], [M.vagina, 4, 0.012],
    [M.ovary, 3, 0.01], [M.tube, 3, 0.01], [M.fimb, 3, 0.012], [M.bladder, 3, 0.015],
    [M.urethra, 3, 0.008], [M.clitoris, 3, 0.008], [M.labMin, 4, 0.02],
    [M.labMaj, 4, 0.025], [M.mons, 3, 0.015],
  ]
  bump.forEach(([m, rep, amp]) => {
    m.bumpMap = makeNoise(rep); m.bumpScale = amp; m.roughnessMap = m.bumpMap
  })
  api.addMaterials(Object.values(M))

  /* pivot: uterus tilts forward (anteverted) ───────────────────────────── */
  const pivot = new THREE.Group()
  pivot.position.set(0, 1.0, 0.15)
  pivot.rotation.x = 0.28
  api.group.add(pivot)

  /* uterus: hollow body (wall + cavity) */
  api.registerTo(pivot, 'uterus', lathe([
    [0.30, 0.36], [0.38, 0.55], [0.48, 0.80], [0.48, 1.15], [0.40, 1.38],
    [0.25, 1.50], [0.02, 1.55], [0.02, 1.44], [0.22, 1.32], [0.32, 1.05],
    [0.32, 0.78], [0.17, 0.55], [0.08, 0.42],
  ], M.uterus))
  /* endometrium: lining inside the cavity */
  api.registerTo(pivot, 'endometrium', lathe([
    [0.03, 0.44], [0.05, 0.50], [0.14, 0.60], [0.28, 0.82],
    [0.28, 1.02], [0.18, 1.28], [0.02, 1.40],
  ], M.endo))
  /* cervix: hollow with a canal */
  api.registerTo(pivot, 'cervix', lathe([
    [0.20, 0.0], [0.26, 0.12], [0.28, 0.30], [0.30, 0.42],
    [0.07, 0.40], [0.06, 0.20], [0.05, 0.02],
  ], M.cervix))

  /* vagina: hollow tube up to the cervix */
  const vagina = lathe([
    [0.22, 0.02], [0.28, 0.3], [0.32, 0.9], [0.34, 1.5], [0.38, 1.9],
    [0.26, 1.9], [0.24, 1.5], [0.22, 0.9], [0.18, 0.3], [0.15, 0.05],
  ], M.vagina)
  vagina.position.set(0, -0.9, 0.75)
  vagina.quaternion.setFromUnitVectors(V3(0, 1, 0), V3(0, 0.953, -0.301).normalize())
  vagina.scale.x = 0.95
  api.add('vagina', vagina)

  api.add('bladder', blob([0, 1.85, 1.3], 0.5, M.bladder, [0.95, 0.8, 0.85], 0.015, 2.5))
  api.add('urethra', taperedTube(
    [[0, 1.4, 1.15], [0, 0.5, 1.0], [0, -0.62, 0.9]],
    u => 0.055 - 0.01 * u, M.urethra, 40, 12))

  /* fallopian tubes + fimbriae + ovaries ──────────────────────────────── */
  const tubeR = (u: number) => 0.045 + 0.05 * u + 0.06 * Math.pow(Math.max(0, (u - 0.8) / 0.2), 2)
  ;[TUBE_PTS, mirror(TUBE_PTS)].forEach(pts => api.add('fallopian', taperedTube(pts, tubeR, M.tube, 64, 12)))

  const fBase = V3(1.6, 2.2, 0.12)
  const toOvary = V3(-0.1, -0.3, -0.07).normalize()
  ;[1, -1].forEach(s => {
    const base = fBase.clone(); base.x *= s
    const axis = toOvary.clone(); axis.x *= s
    for (let i = 0; i < 7; i++) {
      const ang = i / 7 * Math.PI * 2
      const side = V3(Math.cos(ang), 0, Math.sin(ang))
      const dir = axis.clone().addScaledVector(side, 0.55).normalize()
      const end = base.clone().addScaledVector(dir, 0.24)
      api.add('fimbriae', taperedTube(
        [[base.x, base.y, base.z], [end.x, end.y, end.z]],
        u => 0.028 - 0.016 * u, M.fimb, 12, 8))
    }
  })
  ;[[1], [-1]].forEach(([s]) => {
    const o = blob([s * 1.5, 1.9, 0.05], 0.30, M.ovary, [1.05, 0.8, 0.65], 0.02, 4)
    o.rotation.z = s * 0.2
    api.add('ovary', o)
  })

  /* vulva ─────────────────────────────────────────────────────────────── */
  api.add('mons', blob([0, -0.35, 1.05], 0.42, M.mons, [1.3, 0.7, 0.95], 0.02, 3))
  api.add('clitoris', blob([0, -0.55, 1.02], 0.09, M.clitoris, [1, 0.9, 1], 0, 0))
  api.add('clitoris', taperedTube([[0, -0.55, 1.0], [0, -0.45, 0.9]], () => 0.05, M.clitoris, 12, 8))
  ;[[1], [-1]].forEach(([s]) => {
    const min = blob([s * 0.17, -0.72, 0.92], 0.42, M.labMin, [0.22, 0.85, 0.25], 0, 0)
    min.rotation.z = s * -0.12
    api.add('labiaMin', min)
    api.add('labiaMaj', blob([s * 0.45, -0.75, 0.78], 0.5, M.labMaj, [0.55, 0.95, 0.65], 0.02, 4))
  })

  /* broad ligament (translucent sheet, decorative) ────────────────────── */
  const ligMat = new THREE.MeshPhysicalMaterial({
    color: 0xe8d5da, transparent: true, opacity: 0.18,
    side: THREE.DoubleSide, roughness: 0.8, depthWrite: false,
  })
  const ligA: [number, number, number][] = [[0.44, 2.25, 0.48], [0.85, 2.55, 0.42], [1.30, 2.60, 0.30], [1.55, 2.35, 0.18]]
  const ligB: [number, number, number][] = [[0.44, 1.95, 0.45], [0.85, 1.90, 0.35], [1.30, 1.75, 0.18], [1.50, 1.75, 0.05]]
  api.addDecor(ribbon(ligA, ligB, ligMat))
  api.addDecor(ribbon(mirror(ligA), mirror(ligB), ligMat))
  api.addMaterials([ligMat])

  /* egg flow ──────────────────────────────────────────────────────────── */
  const eggL = mirror(EGG_R.slice(0, 7)).concat(EGG_R.slice(7)) as [number, number, number][]
  api.addFlow({
    guideColor: 0xd9a441,
    guideOpacity: 0.35,
    curves: [EGG_R, eggL].map(pts => ({
      pts,
      count: 4,
      speed: 0.03,
      color: 0xffd98a,
      glow: 0xffc36e,
    })),
  })
}
