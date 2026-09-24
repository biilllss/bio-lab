import * as THREE from 'three'
import type { SystemBuildAPI } from '../../types'
import { blob, cap, lathe, makeNoise, mat, mirror, taperedTube } from '../../engine/helpers'

/* Curve waypoints reused by both the meshes and the sperm flow path. */
const VD_PTS: [number, number, number][] = [
  [0.45, -1.2, -0.28], [0.5, -0.65, -0.5], [0.55, -0.05, -0.35], [0.66, 0.45, 0.0],
  [0.78, 1.3, 0.05], [0.9, 2.3, -0.4], [0.92, 3.0, -0.9], [0.6, 3.45, -1.2],
  [0.3, 3.0, -1.05], [0.22, 2.55, -0.5], [0.15, 2.42, 0.05],
]
const UR_PTS: [number, number, number][] = [
  [0, 2.85, -0.25], [0, 2.6, 0.0], [0, 2.42, 0.2], [0, 2.25, 0.35], [0, 2.08, 0.6],
  [0, 1.97, 1.0], [0, 1.9, 1.8], [0, 1.83, 2.5], [0, 1.79, 2.85], [0, 1.73, 3.15],
  [0, 1.68, 3.38], [0, 1.65, 3.52],
]
const SV_PTS: [number, number, number][] = [
  [0.32, 2.62, -0.4], [0.55, 2.75, -0.5], [0.6, 3.0, -0.8], [0.5, 3.2, -1.05],
  [0.3, 3.0, -1.1], [0.25, 2.7, -0.85], [0.3, 2.6, -0.6],
]
const EPI_PTS: [number, number, number][] = [
  [0.45, -0.25, -0.15], [0.55, -0.55, -0.4], [0.52, -0.85, -0.46], [0.45, -1.15, -0.3],
]

export function buildMale(api: SystemBuildAPI) {
  const M = {
    skin: mat(0xd7a583, { roughness: 0.62, transparent: true, opacity: 0.42, sheen: 0.5 }),
    scrot: mat(0xc98f6f, { roughness: 0.7, transparent: true, opacity: 0.35, sheen: 0.5 }),
    glans: mat(0xc98d7a, { roughness: 0.28, clearcoat: 0.8, clearcoatRoughness: 0.22 }),
    testis: mat(0xe8d9c4, { roughness: 0.45, clearcoat: 0.3 }),
    epid: mat(0xc98a80), vas: mat(0xe0cbb0), bladder: mat(0xcf9d7e),
    prostate: mat(0xc08e83), seminal: mat(0xb87d7d), cowper: mat(0xcaa5a0),
    urethra: mat(0x9db3c8, { roughness: 0.45, clearcoat: 0.3 }),
    cavern: mat(0xd4a391), spong: mat(0xcfa08f),
  }
  const bump: [THREE.MeshPhysicalMaterial, number, number][] = [
    [M.skin, 4, 0.025], [M.scrot, 6, 0.045], [M.bladder, 3, 0.015], [M.prostate, 3, 0.02],
    [M.testis, 3, 0.008], [M.glans, 3, 0.008], [M.epid, 3, 0.012], [M.vas, 3, 0.01],
    [M.seminal, 3, 0.012], [M.cowper, 3, 0.012], [M.urethra, 3, 0.008],
    [M.cavern, 3, 0.012], [M.spong, 3, 0.012],
  ]
  bump.forEach(([m, rep, amp]) => {
    m.bumpMap = makeNoise(rep); m.bumpScale = amp; m.roughnessMap = m.bumpMap
  })
  api.addMaterials(Object.values(M))

  /* glands & ducts ─────────────────────────────────────────────────────── */
  api.add('bladder', blob([0, 3.3, -0.5], 0.8, M.bladder, [0.95, 0.9, 0.85], 0.015, 2.5))
  api.add('prostate', blob([0.17, 2.44, 0.16], 0.40, M.prostate, [0.95, 0.8, 0.9], 0.02, 4))
  api.add('prostate', blob([-0.17, 2.44, 0.16], 0.40, M.prostate, [0.95, 0.8, 0.9], 0.02, 4))
  api.add('prostate', blob([0, 2.32, 0.20], 0.33, M.prostate, [1, 0.75, 0.85], 0.02, 4))

  const svR = (u: number) => 0.1 + 0.035 * Math.sin(u * 22) + 0.02 * (1 - u)
  ;[SV_PTS, mirror(SV_PTS)].forEach(pts => {
    api.add('seminal', taperedTube(pts, svR, M.seminal))
    api.add('seminal', cap(pts[0], 0.11, M.seminal))
    api.add('seminal', cap(pts[pts.length - 1], 0.10, M.seminal))
  })

  const vdR = (u: number) => 0.085 - 0.012 * u + 0.006 * Math.sin(u * 25)
  api.add('vas', taperedTube(VD_PTS, vdR, M.vas))
  api.add('vas', taperedTube(mirror(VD_PTS), vdR, M.vas))

  const urR = (u: number) => 0.05 - 0.033 * Math.pow(Math.max(0, (u - 0.82) / 0.18), 1.4)
  api.add('urethra', taperedTube(UR_PTS, urR, M.urethra, 80, 12))

  /* testes & epididymis ───────────────────────────────────────────────── */
  ;[[0.38, -0.75, 0.1], [-0.38, -0.75, 0.1]].forEach(p => {
    const t = blob(p as [number, number, number], 0.42, M.testis, [0.85, 1.15, 0.9], 0, 0)
    t.rotation.set(0.08, 0, p[0] > 0 ? -0.14 : 0.14)
    api.add('testis', t)
  })
  const epiR = (u: number) => 0.105 - 0.055 * u + 0.015 * Math.sin(u * 14)
  ;[EPI_PTS, mirror(EPI_PTS)].forEach(pts => {
    api.add('epididymis', taperedTube(pts, epiR, M.epid))
    api.add('epididymis', cap(pts[0], 0.10, M.epid))
    api.add('epididymis', cap(pts[pts.length - 1], 0.05, M.epid))
  })
  api.add('scrotum', blob([0, -0.7, 0.1], 0.8, M.scrot, [1.15, 1.25, 1.05], 0.012, 6))

  /* bulbourethral glands ──────────────────────────────────────────────── */
  ;[[1], [-1]].forEach(([s]) => {
    api.add('cowper', blob([s * 0.22, 1.75, 0.35], 0.11, M.cowper))
    api.add('cowper', taperedTube(
      [[s * 0.22, 1.78, 0.36], [s * 0.12, 1.95, 0.4], [0, 2.05, 0.43]], () => 0.03, M.cowper, 24, 8))
  })

  /* penis shaft + erectile columns ────────────────────────────────────── */
  api.add('penis', taperedTube(
    [[0, 2.12, 0.55], [0, 2.0, 1.2], [0, 1.88, 2.0], [0, 1.80, 2.62]],
    u => 0.43 - 0.03 * u, M.skin, 48, 24))
  api.add('penis', cap([0, 2.12, 0.57], 0.43, M.skin))
  api.add('penis', cap([0, 1.795, 2.60], 0.40, M.skin))

  const cavR = (u: number) => 0.165 - 0.02 * u
  ;[[1], [-1]].forEach(([s]) => {
    const pts: [number, number, number][] = [
      [s * 0.19, 2.12, 0.62], [s * 0.19, 1.96, 1.6], [s * 0.19, 1.8, 2.76],
    ]
    api.add('cavern', taperedTube(pts, cavR, M.cavern))
    api.add('cavern', cap(pts[0], 0.15, M.cavern))
  })
  api.add('spong', taperedTube(
    [[0, 2.0, 0.42], [0, 1.95, 1.2], [0, 1.85, 2.2], [0, 1.78, 2.86]],
    u => 0.135 + 0.085 * Math.exp(-u * 6), M.spong, 48, 20))
  api.add('spong', cap([0, 2.0, 0.42], 0.2, M.spong))

  const glansProfile: [number, number][] = [
    [0.16, 0], [0.23, 0.04], [0.335, 0.12], [0.385, 0.22], [0.38, 0.34],
    [0.33, 0.5], [0.25, 0.64], [0.15, 0.76], [0.07, 0.84], [0.028, 0.875],
    [0.012, 0.885], [0.02, 0.9], [0.002, 0.908],
  ]
  const glans = lathe(glansProfile, M.glans)
  glans.position.set(0, 1.78, 2.68)
  const q = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -0.122, 0.992).normalize())
  glans.quaternion.copy(q)
  api.add('glans', glans)

  /* decor: veins + raphe ──────────────────────────────────────────────── */
  const veinMat = mat(0x5f7292, { roughness: 0.45, clearcoat: 0.5 })
  const darkSkin = mat(0xb07a5c, { roughness: 0.75 })
  const dT = (pts: [number, number, number][], r: number, m: THREE.Material) => {
    const c = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)))
    api.addDecor(new THREE.Mesh(new THREE.TubeGeometry(c, 32, r, 10), m))
  }
  dT([[0, 2.54, 0.5], [0, 2.45, 1.1], [0, 2.35, 1.75], [0, 2.27, 2.2], [0, 2.21, 2.5]], 0.024, veinMat)
  dT([[0.35, 2.32, 0.65], [0.34, 2.23, 1.3], [0.336, 2.115, 2.0], [0.33, 2.06, 2.4]], 0.015, veinMat)
  dT([[-0.28, -0.15, 0.75], [-0.33, -0.65, 0.82], [-0.22, -1.15, 0.62]], 0.013, veinMat)
  dT([[0.2, -0.25, 0.8], [0.28, -0.8, 0.78], [0.18, -1.2, 0.58]], 0.013, veinMat)
  dT([[0, 0.1, 0.62], [0, -0.35, 0.87], [0, -0.7, 0.93], [0, -1.05, 0.87], [0, -1.35, 0.72]], 0.02, darkSkin)
  api.addMaterials([veinMat, darkSkin])

  /* sperm flow ────────────────────────────────────────────────────────── */
  const pathPre: [number, number, number][] = [
    [0.36, -0.9, 0.1], [0.45, -0.25, -0.15], [0.53, -0.5, -0.38], [0.5, -0.85, -0.44],
    ...VD_PTS,
  ]
  const pathPost: [number, number, number][] = [[0, 2.3, 0.28], ...UR_PTS.slice(3), [0, 1.66, 3.56]]
  api.addFlow({
    guideColor: 0x37b6ff,
    guideOpacity: 0.3,
    curves: [pathPre, mirror(pathPre)].map(pre => ({
      pts: [...pre, ...pathPost],
      count: 10,
      speed: 0.06,
      color: 0xbfefff,
      glow: 0x5fd0ff,
      tail: true,
    })),
  })
}
