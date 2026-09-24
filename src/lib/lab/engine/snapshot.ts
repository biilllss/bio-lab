import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { SystemBuildAPI, SystemDef } from '../types'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TOPIC SNAPSHOTS — tiny offscreen 3D renders used as menu-card previews.
 * ─────────────────────────────────────────────────────────────────────────────
 * When the topic menu opens, each card requests a preview: a scratch
 * scene is built from the system's own `build()` (the exact same module
 * the main viewport uses), lit with the world's light preset, rendered
 * once at low resolution and captured as a data-URL. Jobs run strictly
 * sequentially (one WebGL context at a time) and the result is cached in
 * memory, so the menu stays instant after the first open.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const W = 420
const H = 260

/** topicId → captured data-URL (memory cache, regenerates next session) */
const cache = new Map<string, string>()

type Job = { key: string; sys: SystemDef; cb: (url: string) => void }
const queue: Job[] = []
let running = false

/** Request a preview snapshot; callback fires with a JPEG data-URL. */
export function requestTopicSnapshot(topicId: string, sys: SystemDef, cb: (url: string) => void): void {
  const key = `${topicId}:${sys.id}`
  const hit = cache.get(key)
  if (hit) {
    cb(hit)
    return
  }
  queue.push({ key, sys, cb })
  if (!running) drainQueue()
}

function drainQueue(): void {
  const job = queue.shift()
  if (!job) {
    running = false
    return
  }
  running = true
  // next frame so the menu interaction stays snappy
  requestAnimationFrame(() => {
    let url = ''
    try {
      url = renderSnapshot(job.sys)
      cache.set(job.key, url)
    } catch {
      // WebGL unavailable / context lost — leave url empty, card keeps skeleton
    }
    job.cb(url)
    // small idle gap between topics so we never block interaction for long
    requestAnimationFrame(() => drainQueue())
  })
}

/** Render one system to a data-URL in a scratch scene, then dispose it all. */
function renderSnapshot(sys: SystemDef): string {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
  renderer.setSize(W, H, false)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = sys.lighting?.exposure ?? 1.15

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x11161d)
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

  // the world's light preset (slightly boosted for the tiny canvas)
  const L = sys.lighting
  const hemi = new THREE.HemisphereLight(0xcfe0f0, 0x201812, L?.hemi ?? 0.55)
  const key = new THREE.DirectionalLight(0xfff1e0, L?.key ?? 2.7)
  key.position.set(6, 9, 7)
  const rim = new THREE.DirectionalLight(0xa8c8ff, (L?.rim ?? 1.2) * 1.15)
  rim.position.set(-7, 5, -8)
  const fill = new THREE.DirectionalLight(0xffffff, L?.fill ?? 0.6)
  fill.position.set(-5, 1, 8)
  scene.add(hemi, key, rim, fill)

  // build the real system module into the scratch group
  const group = new THREE.Group()
  const api: SystemBuildAPI = {
    group,
    add: (_key, mesh) => { group.add(mesh) },
    registerTo: (parent, _key, mesh) => { parent.add(mesh) },
    addDecor: mesh => { group.add(mesh) },
    addMaterials: () => { /* snapshot needs no material registry */ },
    addFlow: () => { /* flow guide tubes stay off in previews */ },
  }
  sys.build(api)
  scene.add(group)

  // camera: the system's own framing, rotated ~28° for a livelier ¾ pose
  const [tx, ty, tz] = sys.camera.target
  const [px, py, pz] = sys.camera.pos
  const cam = new THREE.PerspectiveCamera(42, W / H, 0.1, 100)
  const rXZ = Math.hypot(px - tx, pz - tz)
  const ang = Math.atan2(pz - tz, px - tx) + 0.5
  cam.position.set(tx + Math.cos(ang) * rXZ, ty + (py - ty) * 0.85, tz + Math.sin(ang) * rXZ)
  cam.lookAt(tx, ty, tz)

  renderer.render(scene, cam)
  const url = renderer.domElement.toDataURL('image/jpeg', 0.72)

  // full teardown: textures, materials, geometries, env, context
  scene.traverse(o => {
    const mesh = o as THREE.Mesh
    if (mesh.geometry) mesh.geometry.dispose()
    if (mesh.material) {
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      mats.forEach(mm => {
        for (const k of Object.keys(mm) as (keyof THREE.Material)[]) {
          const v = mm[k] as { isTexture?: boolean; dispose?: () => void } | null
          if (v && v.isTexture && v.dispose) v.dispose()
        }
        mm.dispose()
      })
    }
  })
  pmrem.dispose()
  renderer.dispose()
  return url
}
