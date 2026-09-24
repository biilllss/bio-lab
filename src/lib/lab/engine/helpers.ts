import * as THREE from 'three'

/** Small vector / array helpers shared by every topic builder. */
export const V3 = (x: number, y: number, z: number): THREE.Vector3 =>
  new THREE.Vector3(x, y, z)

/** Mirror a list of points across the x=0 plane (bilateral anatomy!). */
export const mirror = (pts: [number, number, number][]): [number, number, number][] =>
  pts.map(p => [-p[0], p[1], p[2]])

export const shuffle = <T,>(a: T[]): T[] => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.random() * (i + 1) | 0
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const sample = <T,>(arr: T[], n: number): T[] =>
  shuffle([...arr]).slice(0, n)

/** Soft-tissue material factory with sensible biology defaults. */
export function mat(color: number, opts: THREE.MeshPhysicalMaterialParameters = {}): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.55,
    metalness: 0,
    clearcoat: 0.15,
    clearcoatRoughness: 0.4,
    sheen: 0.25,
    sheenColor: 0xffd9c0,
    envMapIntensity: 0.55,
    ...opts,
  })
}

/** Procedural bump texture so surfaces don't look like plastic. */
export function makeNoise(repeat: number): THREE.CanvasTexture {
  const s = 256
  const c = document.createElement('canvas')
  c.width = c.height = s
  const ctx = c.getContext('2d')
  const img = ctx!.createImageData(s, s)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 110 + Math.random() * 70 | 0
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  ctx!.putImageData(img, 0, 0)
  const c2 = document.createElement('canvas')
  c2.width = c2.height = s
  const x2 = c2.getContext('2d')!
  x2.filter = 'blur(1.5px)'
  x2.drawImage(c, 0, 0)
  const t = new THREE.CanvasTexture(c2)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(repeat, repeat)
  return t
}

/** Radial glow sprite texture. */
export function makeGlow(
  rgb1 = 'rgba(170,235,255,.9)',
  rgb2 = 'rgba(90,190,255,.35)',
): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const x = c.getContext('2d')!
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, rgb1)
  g.addColorStop(0.4, rgb2)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  x.fillStyle = g
  x.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

/** Tube along a path whose radius can vary along its length. */
export function taperedTube(
  pts: [number, number, number][],
  radiusFn: (u: number) => number,
  material: THREE.Material,
  tubular = 64,
  radial = 16,
): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3(pts.map(p => V3(...p)))
  const frames = curve.computeFrenetFrames(tubular, false)
  const pos: number[] = [], nor: number[] = [], uvs: number[] = [], idx: number[] = []
  for (let i = 0; i <= tubular; i++) {
    const u = i / tubular
    const P = curve.getPointAt(u)
    const N = frames.normals[i], B = frames.binormals[i], r = radiusFn(u)
    for (let j = 0; j <= radial; j++) {
      const v = j / radial * Math.PI * 2
      const sin = Math.sin(v), cos = -Math.cos(v)
      const nx = cos * N.x + sin * B.x
      const ny = cos * N.y + sin * B.y
      const nz = cos * N.z + sin * B.z
      pos.push(P.x + r * nx, P.y + r * ny, P.z + r * nz)
      nor.push(nx, ny, nz)
      uvs.push(j / radial, i / tubular)
    }
  }
  for (let i = 1; i <= tubular; i++) {
    for (let j = 1; j <= radial; j++) {
      const a = (radial + 1) * (i - 1) + (j - 1)
      const b = (radial + 1) * i + (j - 1)
      const c = (radial + 1) * i + j
      const d = (radial + 1) * (i - 1) + j
      idx.push(a, b, d, b, c, d)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  g.setIndex(idx)
  return new THREE.Mesh(g, material)
}

/** Distort a sphere into an organic lump. */
export function organic(geo: THREE.BufferGeometry, amp: number, freq: number): THREE.BufferGeometry {
  if (amp <= 0) { geo.computeVertexNormals(); return geo }
  const p = geo.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i)
    const d = 1 + amp * (Math.sin(x * freq + 1.3) + Math.sin(y * freq * 1.7 + 2.1) + Math.sin(z * freq * 1.3 + 4.2))
    p.setXYZ(i, x * d, y * d, z * d)
  }
  geo.computeVertexNormals()
  return geo
}

/** Organic blob — the workhorse for organs. */
export function blob(
  pos: [number, number, number],
  r: number,
  material: THREE.Material,
  scale?: [number, number, number],
  amp = 0.015,
  freq = 3,
): THREE.Mesh {
  const m = new THREE.Mesh(organic(new THREE.SphereGeometry(r, 48, 32), amp, freq), material)
  m.position.set(...pos)
  if (scale) m.scale.set(...scale)
  return m
}

/** Sphere cap used to close tube ends. */
export function cap(pt: [number, number, number], r: number, m: THREE.Material): THREE.Mesh {
  const s = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), m)
  s.position.set(...pt)
  return s
}

/** Surface of revolution profile (LatheGeometry wrapper). */
export function lathe(prof: [number, number][], m: THREE.Material): THREE.Mesh {
  return new THREE.Mesh(new THREE.LatheGeometry(prof.map(p => new THREE.Vector2(p[0], p[1])), 48), m)
}

/** Flat sheet between two curves (ligaments, membranes). */
export function ribbon(
  ptsA: [number, number, number][],
  ptsB: [number, number, number][],
  material: THREE.Material,
  segs = 20,
): THREE.Mesh {
  const cA = new THREE.CatmullRomCurve3(ptsA.map(p => V3(...p)))
  const cB = new THREE.CatmullRomCurve3(ptsB.map(p => V3(...p)))
  const pos: number[] = [], uv: number[] = [], idx: number[] = []
  for (let i = 0; i <= segs; i++) {
    const u = i / segs
    const pa = cA.getPointAt(u), pb = cB.getPointAt(u)
    pos.push(pa.x, pa.y, pa.z, pb.x, pb.y, pb.z)
    uv.push(u, 0, u, 1)
  }
  for (let i = 0; i < segs; i++) {
    const a = i * 2, b = i * 2 + 1, c = (i + 1) * 2, d = (i + 1) * 2 + 1
    idx.push(a, c, b, c, d, b)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return new THREE.Mesh(g, material)
}
