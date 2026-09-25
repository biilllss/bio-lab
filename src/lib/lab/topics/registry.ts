import type { TopicDef } from '../types'
import { reproductiveTopic } from './reproductive'
import { heartTopic } from './heart'
import { neuronTopic } from './neuron'
import { lungsTopic } from './lungs'
import { brainTopic } from './brain'
import { eyeTopic } from './eye'
import { earTopic } from './ear'
import { kidneyTopic } from './kidney'
import { skinTopic } from './skin'
import { plantCellTopic } from './plantcell'
import { toothTopic } from './tooth'
import { leafTopic } from './leaf'
import { tongueTopic } from './tongue'
import type { SystemDef } from '../types'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TOPIC REGISTRY — the single place where biology content is wired in.
 * ─────────────────────────────────────────────────────────────────────────────
 * ➕ TO ADD A NEW TOPIC (e.g. "The Lungs"):
 *
 *   1. Create  src/lib/lab/topics/lungs/index.ts  exporting a `TopicDef`
 *      (copy the heart topic as a template — it has data.ts + build.ts).
 *   2. Import it below and add it to the TOPICS array. That's it —
 *      the menu, 3D engine, labels, quiz, x-ray, explode, flow paths and
 *      keyboard shortcuts all pick it up automatically.
 *
 * Part keys are namespaced automatically:  `${topic}:${system}:${part}`
 * e.g. `heart:heart:lv` — so different topics can reuse names like "urethra".
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const TOPICS: TopicDef[] = [
  reproductiveTopic,
  heartTopic,
  neuronTopic,
  lungsTopic,
  brainTopic,
  eyeTopic,
  earTopic,
  kidneyTopic,
  skinTopic,
  plantCellTopic,
  toothTopic,
  leafTopic,
  tongueTopic,
]

export function getTopic(topicId: string): TopicDef | undefined {
  return TOPICS.find(t => t.id === topicId)
}

export function getSystem(fullKey: string): { topic: TopicDef; system: SystemDef } | undefined {
  const [topicId, systemId] = fullKey.split(':')
  const topic = getTopic(topicId)
  const system = topic?.systems.find(s => s.id === systemId)
  return topic && system ? { topic, system } : undefined
}

/** Convenience key builder. Empty `part` yields the system key `topic:system`. */
export const partKey = (topicId: string, systemId: string, part = '') =>
  part ? `${topicId}:${systemId}:${part}` : `${topicId}:${systemId}`
