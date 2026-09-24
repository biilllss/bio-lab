import type { TopicDef } from '../../types'
import { buildIncisor, buildMolar, tickTooth } from './build'
import { INCISOR_EXPLODE, INCISOR_INFO, INCISOR_LABELS, MOLAR_EXPLODE, MOLAR_INFO, MOLAR_LABELS } from './data'

export const toothTopic: TopicDef = {
  id: 'tooth',
  title: 'The Tooth',
  emoji: '🦷',
  tagline: 'Enamel, dentin & the living pulp — sliced open',
  description:
    'The hardest substance your body makes, cut open like the textbook diagram: a mineral armor over living ivory, a pulp chamber beating like a tiny heart, and the whole tooth hung in its socket on millions of ligament fibers. Two models — the Incisor chisel and the Molar grinder with cusps, fissures, pulp horns and a forked root. Follow Blood & Signal up the lifeline and watch the pain signals race back out.',
  parts: 'Enamel · Dentin · Pulp · Root Canal · Cementum · Periodontal Ligament · Alveolar Bone · Gum · Nerve · Apical Foramen · Cusps · Fissure · Pulp Horns · Furcation',
  accent: '#7fc7ae',
  defaultSystem: 0,
  menuTip:
    'The tooth includes: labeled 3D cutaway with functions · scored quiz (name / find / mixed) · X-ray · cross-section · Separate — peel enamel, dentin, pulp and the socket apart · animated Blood & Signal (blood up the lifeline · pain signals out · twin canals) · living pulse (the pulp beats, the nerve shimmers)',
  systems: [
    {
      id: 'incisor',
      name: 'Incisor',
      short: '✂️ INCISOR',
      accent: '#9ad6c0',
      hint: '✂️ Incisor cutaway — drag to rotate · scroll to zoom · click parts',
      camera: { pos: [0.3, -0.55, 7.7], target: [0, -0.7, 0] },
      order: ['enamel', 'dentin', 'pulp', 'canal', 'cementum', 'ligament', 'bone', 'gum', 'nerve', 'foramen'],
      quizKeys: ['enamel', 'dentin', 'pulp', 'canal', 'cementum', 'ligament', 'bone', 'gum', 'nerve', 'foramen'],
      inner: ['dentin', 'pulp', 'canal', 'cementum', 'ligament', 'nerve', 'foramen'],
      quizSkip: [],
      skipSkinHover: ['enamel', 'gum', 'bone'],
      info: INCISOR_INFO,
      labels: INCISOR_LABELS,
      explode: INCISOR_EXPLODE,
      flowLabel: 'Blood & Signal',
      flowPanel: {
        title: '🦷 Blood & Signal',
        subtitle: 'Blood up the lifeline · waste back down · pain signals out',
        html: '<b style="color:#ff6a5a">Blood in:</b> an artery threads through solid jawbone and enters at the <b>apical foramen</b> — the pinhole doorway at the root tip — climbing the root canal to feed the pulp chamber.<br><b style="color:#6a86d8">Blood out:</b> the vein carries the waste back down and out to the jaw — every tooth\'s entire supply line runs through that one narrow door.<br><b style="color:#ffd25a">Pain signals:</b> the pulp\'s nerve reports exactly one thing — <b>pain</b> — racing from the chamber down the canal and out through the tip. No touch, no temperature detail: that\'s why toothaches are so blunt.',
      },
      build: buildIncisor,
      tick: tickTooth,
    },
    {
      id: 'molar',
      name: 'Molar',
      short: '🪨 MOLAR',
      accent: '#79bfa6',
      hint: '🪨 Molar cutaway — drag to rotate · scroll to zoom · click parts',
      camera: { pos: [0.55, -0.5, 8.5], target: [0, -0.7, 0] },
      order: ['cusps', 'fissure', 'enamel', 'dentin', 'pulp', 'horns', 'canal', 'cementum', 'ligament', 'furcation', 'bone', 'gum', 'nerve'],
      quizKeys: ['cusps', 'fissure', 'enamel', 'dentin', 'pulp', 'horns', 'canal', 'cementum', 'ligament', 'furcation', 'bone', 'gum', 'nerve'],
      inner: ['dentin', 'pulp', 'horns', 'cementum', 'ligament', 'canal', 'furcation', 'nerve', 'fissure'],
      quizSkip: [],
      skipSkinHover: ['enamel', 'cusps', 'gum', 'bone'],
      info: MOLAR_INFO,
      labels: MOLAR_LABELS,
      explode: MOLAR_EXPLODE,
      flowLabel: 'Blood & Signal',
      flowPanel: {
        title: '🦷 Blood & Signal',
        subtitle: 'Twin canals · the fork · blood in, pain out',
        html: '<b style="color:#ff6a5a">Blood in:</b> the artery climbs the root trunk to the <b>furcation</b> — the Y-fork — then divides, one lifeline down each root canal toward the tips.<br><b style="color:#6a86d8">Blood out:</b> the vein drains the pulp chamber down the other root — a molar\'s supply line is a two-lane road through solid bone.<br><b style="color:#ffd25a">Pain signals:</b> molar nerves are the mouth\'s loudest alarm and its most confusing — the pain often <b>radiates to the ear</b>, and the brain can barely tell which molar is shouting.',
      },
      build: buildMolar,
      tick: tickTooth,
    },
  ],
}
