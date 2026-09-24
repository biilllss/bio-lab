import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { ExplodeDef, FlowDef, SystemDef, TopicDef } from '../types'

/* ───────────────────────────── runtime records ───────────────────────────── */

interface LabelMeta {
  key: string // full part key
  lo: CSS2DObject
  line: THREE.Line
  t: THREE.Vector3
  a: THREE.Vector3
}

interface FlowParticle {
  head: THREE.Mesh
  glow: THREE.Sprite
  tail?: THREE.Line
  phase: number
}

interface FlowCurveRT {
  curve: THREE.CatmullRomCurve3
  speed: number
  tail: boolean
  tailStep: number
  pulse: boolean
  particles: FlowParticle[]
}

interface FlowRT {
  group: THREE.Group
  guideMats: THREE.MeshBasicMaterial[]
  curves: FlowCurveRT[]
  visible: boolean
}

interface SystemRT {
  def: SystemDef
  topicId: string
  fullKey: string
  group: THREE.Group
  pick: THREE.Mesh[]
  parts: Map<string, THREE.Mesh[]> // local part key → meshes
  mats: THREE.Material[]
  labels: LabelMeta[]
  flows: FlowRT[]
  camPos: THREE.Vector3
  camTarget: THREE.Vector3
}

interface ExplodeEntry {
  mesh: THREE.Mesh
  base: THREE.Vector3
  invQ: THREE.Quaternion
  dir: THREE.Vector3
  sysKey: string
}

interface Pulse {
  key: string
  c: THREE.Color
  t0: number
  dur: number
}

export interface WorldCallbacks {
  onPick: (keys: string[]) => void
  onHover: (key: string | null) => void
  onLabelClick: (key: string) => void
}

const TAIL_N = 15
const EXP_SCALE = 2.2

/* ───────────────────────────────── the world ─────────────────────────────── */

export class LabWorld {
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private controls: OrbitControls
  private labelRenderer: CSS2DRenderer
  private t0 = performance.now()
  private raf = 0
  private ro: ResizeObserver
  private container: HTMLElement
  private cb: WorldCallbacks

  private systems = new Map<string, SystemRT>()
  private topicOfSystem = new Map<string, string>() // fullKey → topicId

  private partMeshes = new Map<string, THREE.Mesh[]>()
  private partCenters = new Map<string, THREE.Vector3>()
  private clipMats: THREE.Material[] = []
  private explodeData: ExplodeEntry[] = []
  private matDefaults = new Map<THREE.Material, { transparent: boolean; opacity: number; depthWrite: boolean }>()

  private activeKey = '' // active system full key
  private labelsOn = true
  private selectedKey: string | null = null
  private hoverKey: string | null = null

  private xrayUser = false
  private xrayQuiz = false
  private xrayFlow = false

  private clipPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0.15)
  private cutOn = false

  private expTarget = 0
  private expCur = 0

  private focusGoal: THREE.Vector3 | null = null
  private focusUntil = 0

  private quizActive = false
  private quizGlowKey: string | null = null
  private quizLocked = false
  private quizNameMode = false

  private quizMarker: CSS2DObject

  private pulses: Pulse[] = []
  private simT = 0

  /* per-topic lighting presets (lerped smoothly in animate) */
  private hemiLight: THREE.HemisphereLight
  private keyLight: THREE.DirectionalLight
  private rimLight: THREE.DirectionalLight
  private fillLight: THREE.DirectionalLight
  private lightGoal = { key: 2.6, rim: 1.2, fill: 0.55, hemi: 0.5, exposure: 1.15 }

  private ray = new THREE.Raycaster()
  private ptr = new THREE.Vector2()
  private downPos: [number, number] | null = null

  private _p = new THREE.Vector3()
  private _t = new THREE.Vector3()
  private _s = new THREE.Vector3()
  private _fwd = new THREE.Vector3(0, 0, 1)
  private _up = new THREE.Vector3(0, 1, 0)

  constructor(container: HTMLElement, topics: TopicDef[], cb: WorldCallbacks) {
    this.container = container
    this.cb = cb

    /* renderer / scene ─────────────────────────────────────────────────── */
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.15
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFShadowMap
    container.appendChild(this.renderer.domElement)

    this.scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(this.renderer)
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

    this.camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 100)

    this.labelRenderer = new CSS2DRenderer()
    this.labelRenderer.setSize(container.clientWidth, container.clientHeight)
    this.labelRenderer.domElement.style.position = 'absolute'
    this.labelRenderer.domElement.style.top = '0'
    this.labelRenderer.domElement.style.pointerEvents = 'none'
    container.appendChild(this.labelRenderer.domElement)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.minDistance = 3
    this.controls.maxDistance = 22
    this.controls.autoRotate = true
    this.controls.autoRotateSpeed = 0.5
    this.controls.addEventListener('start', () => { this.controls.autoRotate = false })

    /* lights & ground ──────────────────────────────────────────────────── */
    this.hemiLight = new THREE.HemisphereLight(0xcfe0f0, 0x201812, 0.5)
    this.scene.add(this.hemiLight)
    this.keyLight = new THREE.DirectionalLight(0xfff1e0, 2.6)
    this.keyLight.position.set(6, 9, 7)
    this.keyLight.castShadow = true
    this.keyLight.shadow.mapSize.set(2048, 2048)
    this.keyLight.shadow.camera.left = -8; this.keyLight.shadow.camera.right = 8
    this.keyLight.shadow.camera.top = 9; this.keyLight.shadow.camera.bottom = -5
    this.keyLight.shadow.camera.near = 1; this.keyLight.shadow.camera.far = 35
    this.keyLight.shadow.bias = -0.0004
    this.keyLight.shadow.normalBias = 0.02
    this.scene.add(this.keyLight)
    this.rimLight = new THREE.DirectionalLight(0xa8c8ff, 1.2)
    this.rimLight.position.set(-7, 5, -8)
    this.scene.add(this.rimLight)
    this.fillLight = new THREE.DirectionalLight(0xffffff, 0.55)
    this.fillLight.position.set(-5, 1, 8)
    this.scene.add(this.fillLight)

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(10, 48),
      new THREE.ShadowMaterial({ opacity: 0.35 }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.set(0, -2.4, 0.4)
    ground.receiveShadow = true
    this.scene.add(ground)

    /* quiz marker ──────────────────────────────────────────────────────── */
    const markerDiv = document.createElement('div')
    markerDiv.className = 'bio-marker'
    markerDiv.innerHTML = '<span>❓</span>'
    this.quizMarker = new CSS2DObject(markerDiv)
    this.quizMarker.visible = false
    this.scene.add(this.quizMarker)

    /* build every topic ────────────────────────────────────────────────── */
    for (const topic of topics) {
      for (const def of topic.systems) {
        this.buildSystem(topic.id, def)
      }
    }
    this.scene.updateMatrixWorld(true)
    this.computeCenters()
    this.computeExplodeData()

    /* picking ──────────────────────────────────────────────────────────── */
    const el = this.renderer.domElement
    el.addEventListener('pointermove', this.onPointerMove)
    el.addEventListener('pointerdown', this.onPointerDown)
    el.addEventListener('pointerup', this.onPointerUp)

    /* resize ───────────────────────────────────────────────────────────── */
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(container)

    /* loop ─────────────────────────────────────────────────────────────── */
    this.animate()
  }

  /* ───────────────────────────── building ─────────────────────────────── */

  private buildSystem(topicId: string, def: SystemDef) {
    const fullKey = `${topicId}:${def.id}`
    const group = new THREE.Group()
    group.visible = false
    this.scene.add(group)

    const sys: SystemRT = {
      def, topicId, fullKey, group,
      pick: [],
      parts: new Map(),
      mats: [],
      labels: [],
      flows: [],
      camPos: new THREE.Vector3(...def.camera.pos),
      camTarget: new THREE.Vector3(...def.camera.target),
    }
    this.systems.set(fullKey, sys)
    this.topicOfSystem.set(fullKey, topicId)

    const register = (key: string, mesh: THREE.Object3D, parent?: THREE.Object3D) => {
      const fullPartKey = `${fullKey}:${key}`
      mesh.userData.part = fullPartKey
      mesh.traverse?.(o => {
        if ((o as THREE.Mesh).isMesh) {
          o.castShadow = true
          o.receiveShadow = true
        }
      })
      mesh.castShadow = true
      mesh.receiveShadow = true
      const list = sys.parts.get(fullPartKey) ?? []
      list.push(mesh as THREE.Mesh)
      sys.parts.set(fullPartKey, list)
      const all = this.partMeshes.get(fullPartKey) ?? []
      all.push(mesh as THREE.Mesh)
      this.partMeshes.set(fullPartKey, all)
      sys.pick.push(mesh as THREE.Mesh)
      ;(parent ?? group).add(mesh)
      return mesh
    }

    const api = {
      group,
      add: (key: string, mesh: THREE.Object3D) => register(key, mesh),
      registerTo: (parent: THREE.Object3D, key: string, mesh: THREE.Object3D) => register(key, mesh, parent),
      addDecor: (m: THREE.Object3D) => { group.add(m); return m },
      addMaterials: (mats: THREE.Material[]) => { sys.mats.push(...mats); this.clipMats.push(...mats) },
      addFlow: (fd: FlowDef) => sys.flows.push(this.buildFlow(group, fd)),
    }
    def.build(api)

    /* labels */
    const lineMat = new THREE.LineBasicMaterial({ color: 0x9fb0c4, transparent: true, opacity: 0.55 })
    for (const L of def.labels) {
      const div = document.createElement('div')
      div.className = 'bio-lbl'
      div.innerHTML = `<b>${L.name}</b><span>${L.sub}</span>`
      div.style.pointerEvents = 'auto'
      const fullPartKey = `${fullKey}:${L.key}`
      div.onclick = () => this.cb.onLabelClick(fullPartKey)
      const lo = new CSS2DObject(div)
      const t = new THREE.Vector3(...L.t)
      const a = new THREE.Vector3(...L.a)
      lo.position.copy(a)
      group.add(lo)
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([t.clone(), a.clone()]),
        lineMat,
      )
      group.add(line)
      sys.labels.push({ key: fullPartKey, lo, line, t, a })
    }
  }

  private buildFlow(parent: THREE.Group, fd: FlowDef): FlowRT {
    const fGroup = new THREE.Group()
    fGroup.visible = false
    parent.add(fGroup)

    const guideMat = new THREE.MeshBasicMaterial({
      color: fd.guideColor,
      transparent: true,
      opacity: fd.guideOpacity ?? 0.3,
      depthTest: false,
    })

    const curves: FlowCurveRT[] = []
    for (const c of fd.curves) {
      const curve = new THREE.CatmullRomCurve3(c.pts.map(p => new THREE.Vector3(...p)))
      fGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 220, 0.02, 8), guideMat))

      const count = c.count ?? 6
      const speed = c.speed ?? 0.05
      const tail = c.tail ?? false
      const headGeo = new THREE.SphereGeometry(tail ? 0.055 : 0.08, 12, 10)
      const headMat = new THREE.MeshBasicMaterial({ color: c.color ?? 0xbfefff, depthTest: false })
      const tailMat = new THREE.LineBasicMaterial({
        color: c.glow ?? 0x5fd0ff, transparent: true, opacity: 0.9, depthTest: false,
      })
      const glowMat = new THREE.SpriteMaterial({
        map: makeGlowTex(c.glow),
        color: c.glow ?? 0x66d9ff,
        transparent: true,
        opacity: 0.45,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      })

      const particles: FlowParticle[] = []
      for (let i = 0; i < count; i++) {
        const head = new THREE.Mesh(headGeo, headMat)
        if (tail) head.scale.set(0.75, 0.75, 1.35)
        head.renderOrder = 100
        head.frustumCulled = false
        const glow = new THREE.Sprite(glowMat.clone())
        glow.scale.set(tail ? 0.22 : 0.3, tail ? 0.22 : 0.3, 1)
        glow.renderOrder = 101
        let t3d: THREE.Line | undefined
        if (tail) {
          const tg = new THREE.BufferGeometry()
          tg.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(TAIL_N * 3), 3))
          t3d = new THREE.Line(tg, tailMat)
          t3d.renderOrder = 100
          t3d.frustumCulled = false
        }
        fGroup.add(head, glow)
        if (t3d) fGroup.add(t3d)
        particles.push({ head, glow, tail: t3d, phase: i / count })
      }
      curves.push({
        curve, speed, tail,
        tailStep: (0.3 / curve.getLength()) / (TAIL_N - 1),
        pulse: !tail,
        particles,
      })
    }
    return { group: fGroup, guideMats: [guideMat], curves, visible: false }
  }

  private computeCenters() {
    for (const [k, meshes] of this.partMeshes) {
      const box = new THREE.Box3()
      meshes.forEach(m => box.expandByObject(m))
      this.partCenters.set(k, box.getCenter(new THREE.Vector3()))
    }
  }

  private computeExplodeData() {
    for (const [fullKey, meshes] of this.partMeshes) {
      const sys = this.systems.get(this.systemKeyOfPart(fullKey))
      if (!sys) continue
      const cfg: ExplodeDef = sys.def.explode[localPart(fullKey)] ?? { d: [0, 1, 0] }
      meshes.forEach(mesh => {
        const wc = new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3())
        const dir = new THREE.Vector3(...cfg.d)
        if (cfg.p) dir.x *= (wc.x >= 0 ? 1 : -1)
        dir.normalize()
        const invQ = mesh.parent!.getWorldQuaternion(new THREE.Quaternion()).invert()
        this.explodeData.push({ mesh, base: mesh.position.clone(), invQ, dir, sysKey: sys.fullKey })
      })
    }
  }

  /* ─────────────────────────── public API ─────────────────────────────── */

  /** Show a system (full key `topic:system`). silent = keep camera & spin. */
  setActiveSystem(fullKey: string, opts: { silent?: boolean; keepSpin?: boolean } = {}) {
    const sys = this.systems.get(fullKey)
    if (!sys) return
    this.activeKey = fullKey
    for (const [k, s] of this.systems) s.group.visible = k === fullKey
    this.applyLabelsVis()
    this.setFlowVisible(false)
    this.setExplode(0)
    this.focusGoal = null
    this.selectedKey = null
    this.applyLighting(sys.def)
    if (!opts.silent) {
      this.camera.position.copy(sys.camPos)
      this.controls.target.copy(sys.camTarget)
      if (!opts.keepSpin) this.controls.autoRotate = true
    }
  }

  getActiveSystem() { return this.activeKey }

  setLabels(on: boolean) {
    this.labelsOn = on
    this.applyLabelsVis()
  }

  private applyLabelsVis() {
    for (const [, sys] of this.systems) {
      const vis = sys.fullKey === this.activeKey && this.labelsOn
      sys.labels.forEach(l => { l.lo.visible = vis; l.line.visible = vis })
    }
  }

  setXray(on: boolean) {
    this.xrayUser = on
    this.applyXray()
  }

  private applyXray() {
    const on = this.xrayUser || this.xrayQuiz || this.xrayFlow
    for (const [k, meshes] of this.partMeshes) {
      meshes.forEach(m => {
        const mm = m.material as THREE.MeshPhysicalMaterial
        if (!this.matDefaults.has(mm)) {
          this.matDefaults.set(mm, {
            transparent: mm.transparent, opacity: mm.opacity, depthWrite: mm.depthWrite,
          })
        }
        const d = this.matDefaults.get(mm)!
        if (on) {
          mm.transparent = true
          mm.opacity = (this.systems.get(this.activeKey)?.def.skipSkinHover ?? []).includes(localPart(k)) ? 0.1 : 0.22
          mm.depthWrite = false
        } else {
          mm.transparent = d.transparent
          mm.opacity = d.opacity
          mm.depthWrite = d.depthWrite
        }
      })
    }
  }

  setCut(on: boolean, value?: number) {
    this.cutOn = on
    this.renderer.localClippingEnabled = on
    if (value !== undefined) this.clipPlane.constant = value
    this.clipMats.forEach(m => {
      const mm = m as THREE.MeshPhysicalMaterial
      if (!mm.userData.baseSide) mm.userData.baseSide = mm.side
      mm.clippingPlanes = on ? [this.clipPlane] : null
      mm.clipShadows = on
      mm.side = on ? THREE.DoubleSide : (mm.userData.baseSide as THREE.Side || THREE.FrontSide)
      mm.needsUpdate = true
    })
  }

  setCutValue(v: number) { this.clipPlane.constant = v }

  setExplode(f: number) {
    this.expTarget = f
    if (f > 0) {
      let flowWasOn = false
      for (const [, sys] of this.systems) {
        if (sys.fullKey === this.activeKey && sys.flows.some(fl => fl.visible)) flowWasOn = true
      }
      if (flowWasOn) this.setFlowVisible(false)
      const d = this.camera.position.distanceTo(this.controls.target)
      if (d < 10.5) this.camera.position.sub(this.controls.target).setLength(10.5).add(this.controls.target)
    }
  }

  setFlowVisible(on: boolean) {
    const sys = this.systems.get(this.activeKey)
    if (!sys) return
    sys.flows.forEach(f => { f.group.visible = on; f.visible = on })
    this.xrayFlow = on
    this.applyXray()
  }

  isFlowVisible() {
    const sys = this.systems.get(this.activeKey)
    return !!sys && sys.flows.some(f => f.visible)
  }

  focusPart(fullKey: string) {
    const c = this.bestMeshCenter(fullKey)
    if (!c) return
    this.focusGoal = c.add(this.partOffset(fullKey, this.expCur))
    this.focusUntil = performance.now() + 1400
  }

  /**
   * Center of the mesh that best represents a (possibly multi-mesh) part:
   * the mesh whose own bounding-box center sits nearest the camera target.
   * A plain average of spread-out meshes (3 chloroplasts, a dozen
   * ribosomes, paired vessels…) would land in empty space — the quiz
   * marker must sit ON something that is actually glowing.
   */
  private bestMeshCenter(fullKey: string): THREE.Vector3 | null {
    const meshes = this.partMeshes.get(fullKey)
    if (!meshes || meshes.length === 0) return null
    let best: THREE.Vector3 | null = null
    let bestD = Infinity
    for (const m of meshes) {
      const c = new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3())
      const d = c.distanceToSquared(this.controls.target)
      if (d < bestD) { bestD = d; best = c }
    }
    return best
  }

  pulse(fullKey: string, hex: number, dur = 1.4) {
    this.pulses.push({ key: fullKey, c: new THREE.Color(hex), t0: this.simT, dur })
  }

  setSelected(key: string | null) { this.selectedKey = key }

  setQuizState(s: { active?: boolean; glowKey?: string | null; locked?: boolean; nameMode?: boolean }) {
    if (s.active !== undefined) this.quizActive = s.active
    if (s.glowKey !== undefined) this.quizGlowKey = s.glowKey
    if (s.locked !== undefined) this.quizLocked = s.locked
    if (s.nameMode !== undefined) this.quizNameMode = s.nameMode
  }

  setQuizMarker(fullKey: string | null) {
    if (!fullKey) { this.quizMarker.visible = false; return }
    const c = this.bestMeshCenter(fullKey)
    if (!c) { this.quizMarker.visible = false; return }
    this.quizMarker.visible = true
    this.quizMarker.position.copy(c).add(this.partOffset(fullKey, this.expCur))
  }

  setAutoRotate(on: boolean) { this.controls.autoRotate = on }

  /** Aim the light rig at a system's preset (or the default). Lerped in animate(). */
  private applyLighting(def: SystemDef) {
    const L = def.lighting
    this.lightGoal = {
      key: L?.key ?? 2.6,
      rim: L?.rim ?? 1.2,
      fill: L?.fill ?? 0.55,
      hemi: L?.hemi ?? 0.5,
      exposure: L?.exposure ?? 1.15,
    }
  }

  resetCamera() {
    const sys = this.systems.get(this.activeKey)
    if (!sys) return
    this.camera.position.copy(sys.camPos)
    this.controls.target.copy(sys.camTarget)
    this.focusGoal = null
    if (this.expTarget > 0) {
      const d = this.camera.position.distanceTo(this.controls.target)
      if (d < 10.5) this.camera.position.sub(this.controls.target).setLength(10.5).add(this.controls.target)
    }
    this.controls.update()
  }

  partOffset(fullKey: string, f: number): THREE.Vector3 {
    const sys = this.systems.get(this.systemKeyOfPart(fullKey))
    const cfg: ExplodeDef = sys?.def.explode[localPart(fullKey)] ?? { d: [0, 1, 0] }
    const dir = new THREE.Vector3(...cfg.d)
    if (cfg.p) {
      const c = this.partCenters.get(fullKey)
      dir.x *= (c && c.x >= 0 ? 1 : -1)
    }
    return dir.normalize().multiplyScalar(f * EXP_SCALE)
  }

  systemKeyOfPart(fullKey: string): string {
    // `topic:system:part` → `topic:system`
    const parts = fullKey.split(':')
    return parts.slice(0, 2).join(':')
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    const el = this.renderer.domElement
    el.removeEventListener('pointermove', this.onPointerMove)
    el.removeEventListener('pointerdown', this.onPointerDown)
    el.removeEventListener('pointerup', this.onPointerUp)
    this.scene.traverse(o => {
      const m = o as THREE.Mesh
      if (m.geometry) m.geometry.dispose()
      const mat = m.material as THREE.Material | THREE.Material[] | undefined
      if (Array.isArray(mat)) mat.forEach(x => x.dispose())
      else mat?.dispose()
    })
    this.renderer.dispose()
    this.container.innerHTML = ''
  }

  /* ─────────────────────────── interactions ───────────────────────────── */

  private pickList(e: PointerEvent): string[] {
    const r = this.renderer.domElement.getBoundingClientRect()
    this.ptr.x = (e.clientX - r.left) / r.width * 2 - 1
    this.ptr.y = -(e.clientY - r.top) / r.height * 2 + 1
    this.ray.setFromCamera(this.ptr, this.camera)
    const sys = this.systems.get(this.activeKey)
    if (!sys) return []
    const hits = this.ray.intersectObjects(sys.pick, false)
    const seen = new Set<string>()
    const out: string[] = []
    for (const h of hits) {
      const k = h.object.userData.part as string
      if (!seen.has(k)) { seen.add(k); out.push(k) }
    }
    return out
  }

  private onPointerMove = (e: PointerEvent) => {
    const hits = this.pickList(e)
    const skip = this.systems.get(this.activeKey)?.def.skipSkinHover ?? []
    const k = this.quizActive
      ? null
      : (hits.find(p => !skip.includes(localPart(p))) || hits[0] || null)
    this.hoverKey = k
    this.cb.onHover(k)
    this.renderer.domElement.style.cursor = this.quizActive
      ? (hits.length ? 'crosshair' : 'default')
      : (k ? 'pointer' : 'grab')
  }

  private onPointerDown = (e: PointerEvent) => { this.downPos = [e.clientX, e.clientY] }

  private onPointerUp = (e: PointerEvent) => {
    if (!this.downPos) return
    const moved = Math.hypot(e.clientX - this.downPos[0], e.clientY - this.downPos[1])
    this.downPos = null
    if (moved > 6) return
    const hits = this.pickList(e)
    if (hits.length) this.cb.onPick(hits)
    else this.cb.onPick([])
  }

  /* ─────────────────────────────── loop ───────────────────────────────── */

  private resize() {
    const w = this.container.clientWidth
    const h = this.container.clientHeight
    if (!w || !h) return
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
    this.labelRenderer.setSize(w, h)
  }

  private applyExplode(f: number) {
    for (const e of this.explodeData) {
      if (e.sysKey !== this.activeKey) continue
      const d = e.dir.clone().multiplyScalar(f * EXP_SCALE).applyQuaternion(e.invQ)
      e.mesh.position.copy(e.base).add(d)
    }
    const sys = this.systems.get(this.activeKey)
    if (!sys) return
    sys.labels.forEach(L => {
      const def = sys.def.explode[localPart(L.key)] ?? { d: [0, 1, 0] as [number, number, number] }
      const dir = new THREE.Vector3(...def.d)
      if (def.p) dir.x *= (L.t.x >= 0 ? 1 : -1)
      dir.normalize().multiplyScalar(f * EXP_SCALE)
      L.lo.position.copy(L.a).add(dir)
      const pos = L.line.geometry.attributes.position as THREE.BufferAttribute
      pos.setXYZ(0, L.t.x + dir.x, L.t.y + dir.y, L.t.z + dir.z)
      pos.setXYZ(1, L.a.x + dir.x, L.a.y + dir.y, L.a.z + dir.z)
      pos.needsUpdate = true
    })
  }

  private updateEmissives(t: number) {
    for (const [k, meshes] of this.partMeshes) {
      const m = (meshes[0].material as THREE.MeshPhysicalMaterial)
      if (this.quizActive && this.quizNameMode && !this.quizLocked && this.quizGlowKey === k) {
        const w = 0.35 + 0.3 * Math.sin(t * 6)
        m.emissive.setRGB(0.9 * w, 0.75 * w, 0.2 * w)
        continue
      }
      const lvl = (!this.quizActive && k === this.selectedKey) ? 0.28
        : (!this.quizActive && k === this.hoverKey) ? 0.14 : 0
      m.emissive.setScalar(lvl)
    }
    for (const p of this.pulses) {
      const u = (t - p.t0) / p.dur
      if (u < 0 || u > 1) continue
      const w = Math.sin(Math.PI * u) * 0.75
      const meshes = this.partMeshes.get(p.key)
      if (!meshes) continue
      const m = meshes[0].material as THREE.MeshPhysicalMaterial
      m.emissive.r = Math.max(m.emissive.r, p.c.r * w)
      m.emissive.g = Math.max(m.emissive.g, p.c.g * w)
      m.emissive.b = Math.max(m.emissive.b, p.c.b * w)
    }
    for (let i = this.pulses.length - 1; i >= 0; i--) {
      if (t - this.pulses[i].t0 > this.pulses[i].dur) this.pulses.splice(i, 1)
    }
  }

  private updateFlows(t: number) {
    const sys = this.systems.get(this.activeKey)
    if (!sys) return
    for (const flow of sys.flows) {
      if (!flow.visible) continue
      for (const set of flow.curves) {
        for (const sp of set.particles) {
          const u = (t * set.speed + sp.phase) % 1
          set.curve.getPointAt(u, this._p)
          sp.head.position.copy(this._p)
          sp.glow.position.copy(this._p)
          if (set.tail) {
            set.curve.getTangentAt(u, this._t)
            sp.head.quaternion.setFromUnitVectors(this._fwd, this._t)
            const pos = sp.tail!.geometry.attributes.position as THREE.BufferAttribute
            for (let k = 0; k < TAIL_N; k++) {
              const uu = Math.max(0, u - k * set.tailStep)
              set.curve.getPointAt(uu, this._p)
              set.curve.getTangentAt(uu, this._t)
              this._s.crossVectors(this._t, this._up)
              if (this._s.lengthSq() < 1e-6) this._s.set(1, 0, 0)
              else this._s.normalize()
              const w = Math.sin(t * 9 - k * 0.9 + sp.phase * 12.57) * 0.024 * (k / (TAIL_N - 1))
              pos.setXYZ(k, this._p.x + this._s.x * w, this._p.y + this._s.y * w, this._p.z + this._s.z * w)
            }
            pos.needsUpdate = true
          } else if (set.pulse) {
            sp.head.scale.setScalar(0.85 + 0.18 * Math.sin(t * 3.5 + sp.phase * 9))
          }
        }
      }
      for (const g of flow.guideMats) {
        g.opacity = (g.userData.baseOpacity ?? (g.userData.baseOpacity = g.opacity)) + 0.1 * Math.sin(t * 3)
      }
    }
  }

  private animate = () => {
    this.raf = requestAnimationFrame(this.animate)
    const t = (performance.now() - this.t0) / 1000
    this.simT = t
    this.controls.update()
    if (this.focusGoal && performance.now() < this.focusUntil) {
      this.controls.target.lerp(this.focusGoal, 0.08)
    }
    if (Math.abs(this.expCur - this.expTarget) > 0.001) {
      this.expCur += (this.expTarget - this.expCur) * 0.12
      if (Math.abs(this.expCur - this.expTarget) < 0.001) this.expCur = this.expTarget
      this.applyExplode(this.expCur)
    }
    /* smooth light-rig transition between topic presets */
    const lg = this.lightGoal
    const lerp = (cur: number, goal: number) => cur + (goal - cur) * 0.06
    this.keyLight.intensity = lerp(this.keyLight.intensity, lg.key)
    this.rimLight.intensity = lerp(this.rimLight.intensity, lg.rim)
    this.fillLight.intensity = lerp(this.fillLight.intensity, lg.fill)
    this.hemiLight.intensity = lerp(this.hemiLight.intensity, lg.hemi)
    this.renderer.toneMappingExposure = lerp(this.renderer.toneMappingExposure, lg.exposure)

    this.updateEmissives(t)
    this.updateFlows(t)
    const active = this.systems.get(this.activeKey)
    active?.def.tick?.({
      t,
      part: k => active.parts.get(`${active.fullKey}:${k}`),
      exploded: this.expCur > 0.001,
    })
    this.renderer.render(this.scene, this.camera)
    this.labelRenderer.render(this.scene, this.camera)
  }
}

/* ───────────────────────────── small utils ──────────────────────────────── */

/** `topic:system:part` → `part` */
export function localPart(fullKey: string): string {
  return fullKey.split(':')[2] ?? fullKey
}

/** `topic:system:part` → `{ topic, system, part }` */
export function parseFullKey(fullKey: string): { topic: string; system: string; part: string } {
  const [topic = '', system = '', part = ''] = fullKey.split(':')
  return { topic, system, part }
}

function makeGlowTex(color?: number): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const x = c.getContext('2d')!
  const hex = color !== undefined ? '#' + color.toString(16).padStart(6, '0') : '#66d9ff'
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, hex + 'ee')
  g.addColorStop(0.4, hex + '55')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  x.fillStyle = g
  x.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}
