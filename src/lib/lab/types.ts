import type * as THREE from 'three'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * BIOLOGY LAB — CORE TYPE CONTRACTS
 * ─────────────────────────────────────────────────────────────────────────────
 * The whole app is built around a simple idea:
 *
 *   A TopicDef  =  one self-contained biology topic (Reproductive, Heart, …)
 *   A SystemDef =  one clickable 3D model inside a topic (Male, Female, …)
 *
 * The React UI is 100% generic — it renders whatever topics are registered in
 * `src/lib/lab/topics/registry.ts`. To add a new biology topic you only need
 * to create a new folder under `src/lib/lab/topics/` and register it. No UI
 * or engine changes required.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Study text for one anatomical part. `fn` may contain `<b>` / `<i>` tags. */
export interface PartInfo {
  /** Display name, e.g. "Vas Deferens" */
  name: string
  /** Short subtitle, e.g. "Sperm transport" */
  sub: string
  /** Function / description paragraph (HTML allowed) */
  fn: string
}

/** A 3D annotation label: line from `t` (on the part) to `a` (label anchor). */
export interface LabelDef {
  /** Part key (system-local, without prefixes) */
  key: string
  name: string
  sub: string
  /** Target point on the part (system-local coords) */
  t: [number, number, number]
  /** Label anchor point (system-local coords) */
  a: [number, number, number]
}

/** Exploded-view direction for a part. `p: 1` mirrors `d.x` across x=0. */
export interface ExplodeDef {
  d: [number, number, number]
  p?: number
}

/** One animated flow route (sperm path, egg path, blood circuit…). */
export interface FlowCurveDef {
  /** Waypoints of the route (system-local coords) */
  pts: [number, number, number][]
  /** Number of travelling particles on this curve (default 6) */
  count?: number
  /** Advance speed per second (default 0.05) */
  speed?: number
  /** Particle head color */
  color?: number
  /** Glow sprite color */
  glow?: number
  /** Draw a wiggling tail on each particle (sperm style) */
  tail?: boolean
}

export interface FlowDef {
  /** Translucent guide tube color */
  guideColor: number
  guideOpacity?: number
  curves: FlowCurveDef[]
}

/** Info card shown when the flow path is toggled on. */
export interface FlowPanel {
  title: string
  subtitle: string
  /** Description (HTML allowed) */
  html: string
}

/**
 * Optional per-system lighting preset — pale organs (brain, eye) need a
 * dimmer key light than red muscle tissue or they wash out. The world
 * lerps smoothly between presets when systems switch.
 */
export interface LightPreset {
  /** Key (warm main) light intensity — default 2.6 */
  key?: number
  /** Cool rim light intensity — default 1.2 */
  rim?: number
  /** White fill light intensity — default 0.55 */
  fill?: number
  /** Hemisphere (sky/ground) intensity — default 0.5 */
  hemi?: number
  /** ACES tone-mapping exposure — default 1.15 */
  exposure?: number
}

/** Handed to a system's `tick()` every frame while its system is active. */
export interface SystemTickAPI {
  /** Seconds since world start */
  t: number
  /** All registered meshes of a part (system-local key) */
  part(key: string): THREE.Object3D[] | undefined
  /** Whether the exploded view is currently open (skip idle anims that fight it) */
  exploded: boolean
}

/** Handed to a system's `build()` — the only way it touches the 3D scene. */
export interface SystemBuildAPI {
  /** Root group of this system. Add purely decorative meshes here directly. */
  group: THREE.Group
  /** Register a mesh as a named, pickable part. */
  add(key: string, mesh: THREE.Object3D): void
  /** Register a mesh as a named part parented to a custom parent (e.g. pivot). */
  registerTo(parent: THREE.Object3D, key: string, mesh: THREE.Object3D): void
  /** Add a non-pickable decoration mesh (veins, ligaments…). */
  addDecor(mesh: THREE.Object3D): void
  /** Register materials so X-ray / cross-section can affect them. */
  addMaterials(mats: THREE.Material[]): void
  /** Register an animated flow route shown by the "Flow" toggle. */
  addFlow(def: FlowDef): void
}

/**
 * One interactive 3D model. Everything is data + one build function, so a
 * system is fully described by plain objects — trivially testable & portable.
 */
export interface SystemDef {
  /** System id, e.g. "male" — full part keys become `${topic}:${system}:${part}` */
  id: string
  name: string
  /** Short badge in panel headers, e.g. "♂ MALE" */
  short: string
  /** Subtitle shown under the title bar when active */
  hint: string
  camera: {
    pos: [number, number, number]
    target: [number, number, number]
  }
  /** Display order for ◀ ▶ stepping */
  order: string[]
  /** Parts eligible for quiz questions */
  quizKeys: string[]
  /** Parts that sit inside/behind others (quiz click-through hint) */
  inner: string[]
  /** Outer wrappers that should never be a quiz answer target */
  quizSkip?: string[]
  /** Outer skin parts skipped when hovering (so you hover what's inside) */
  skipSkinHover?: string[]
  /** Study text per part key */
  info: Record<string, PartInfo>
  labels: LabelDef[]
  explode: Record<string, ExplodeDef>
  /** Flow toggle label, e.g. "Sperm Path" */
  flowLabel?: string
  flowPanel?: FlowPanel
  /** Accent color for panel border & highlights (hex string) */
  accent?: string
  /** Optional lighting preset (dimmer key for pale organs like the brain) */
  lighting?: LightPreset
  /** Builds all meshes. Runs once per session on mount. */
  build(api: SystemBuildAPI): void
  /** Optional per-frame animation (breathing, heartbeat…) — active system only. */
  tick?(api: SystemTickAPI): void
}

/** One biology topic = menu card + N systems. */
export interface TopicDef {
  id: string
  title: string
  emoji: string
  /** One-liner for the menu card */
  tagline: string
  /** Longer description for the menu card */
  description: string
  /** Parts preview line for the menu card */
  parts: string
  /** Accent hex color for card hover / panel accents */
  accent: string
  systems: SystemDef[]
  /** Index of the system opened first */
  defaultSystem: number
  menuTip?: string
}
