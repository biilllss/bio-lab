import type { TopicDef } from '../../types'
import { buildLeaf, tickLeaf } from './build'
import { LEAF_EXPLODE, LEAF_INFO, LEAF_LABELS } from './data'

export const leafTopic: TopicDef = {
  id: 'leaf',
  title: 'Photosynthesis Leaf',
  emoji: '🍃',
  tagline: 'Sunlight, air & water — the sugar factory floor',
  description:
    'The classic leaf cross-section in 3D: a waxy cuticle over transparent epidermis bricks, palisade towers stuffed with chloroplast engines, a spongy maze laced with air corridors, a central vein bundle with xylem plumbing and phloem shipping, and breathing stomata guarded by kidney cells on the underside. Follow the Transpiration Stream — water up the xylem, CO₂ in through one pore, O₂ out the other, sugar away down the phloem.',
  parts: 'Cuticle · Upper Epidermis · Palisade Mesophyll · Chloroplasts · Vein Bundle · Xylem · Phloem · Spongy Mesophyll · Air Spaces · Lower Epidermis · Guard Cells · Stoma',
  accent: '#68b04c',
  defaultSystem: 0,
  menuTip:
    'The leaf includes: labeled 3D cross-section with functions · scored quiz (name / find / mixed) · X-ray · cross-section · Separate — split cuticle, epidermises, mesophyll and the vein apart · animated Transpiration Stream (water up · CO₂ in · O₂ out · sugar away) · live shimmer (chloroplast glow · breathing stomata · drifting spongy cells)',
  systems: [
    {
      id: 'section',
      name: 'Leaf Cross-Section',
      short: '🍃 SECTION',
      accent: '#8cc86a',
      hint: '🍃 Leaf section — drag to rotate · scroll to zoom · click parts',
      camera: { pos: [0, 0.05, 7.9], target: [0, 0, 0] },
      order: ['cuticle', 'upperEpi', 'palisade', 'chloroplast', 'vein', 'xylem', 'phloem', 'spongy', 'airSpace', 'lowerEpi', 'guardCell', 'stoma'],
      quizKeys: ['cuticle', 'upperEpi', 'palisade', 'chloroplast', 'vein', 'xylem', 'phloem', 'spongy', 'airSpace', 'lowerEpi', 'guardCell', 'stoma'],
      inner: ['chloroplast', 'xylem', 'phloem', 'airSpace', 'guardCell'],
      quizSkip: [],
      skipSkinHover: ['cuticle', 'upperEpi', 'lowerEpi'],
      info: LEAF_INFO,
      labels: LEAF_LABELS,
      explode: LEAF_EXPLODE,
      flowLabel: 'Transpiration Stream',
      flowPanel: {
        title: '🍃 Transpiration Stream',
        subtitle: 'Water up · CO₂ in · O₂ out · sugar away',
        html: '<b style="color:#5aa8e0">Water up:</b> evaporation from the mesophyll walls tugs the <b>xylem stream</b> up from the roots — no pump, just cohesion: a water chain under tension running the whole plant.<br><b style="color:#8ad07a">CO₂ in:</b> air enters through the <b>stoma</b> guarded by its kidney cells, spreads through the air halls and dissolves into the wet cell walls.<br><b style="color:#60d8a0">O₂ out:</b> the photosynthesis waste product — every other breath you take — leaves the same doors.<br><b style="color:#ffd25a">Sugar away:</b> the <b>phloem</b> pressurizes and ships the finished sugar to roots, buds and fruit.',
      },
      build: buildLeaf,
      tick: tickLeaf,
    },
  ],
}
