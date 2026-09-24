import type { TopicDef } from '../../types'
import { buildLungs, tickLungs } from './build'
import { LUNGS_EXPLODE, LUNGS_INFO, LUNGS_LABELS } from './data'

export const lungsTopic: TopicDef = {
  id: 'lungs',
  title: 'Lungs & Breathing',
  emoji: '🫁',
  tagline: 'Airways, alveoli & the mechanics of breath',
  description:
    'Follow a breath from the trachea to the alveoli. Watch the lungs inflate while the diaphragm flattens, and trace O₂ and CO₂ on animated gas-exchange routes.',
  parts: 'Trachea · Bronchi · Bronchioles · Alveoli · Lungs · Pleura · Diaphragm · Rib cage …',
  accent: '#62b8d8',
  defaultSystem: 0,
  menuTip:
    'The lungs include: labeled 3D model with functions · scored quiz (name / find / mixed) · X-ray · cross-section · Separate — pull the airways apart · animated O₂ / CO₂ gas exchange · live breathing animation',
  systems: [
    {
      id: 'lungs',
      name: 'The Respiratory System',
      short: '🫁 LUNGS',
      accent: '#8fd4e4',
      hint: '🫁 Lungs — drag to rotate · scroll to zoom · click parts',
      camera: { pos: [5.4, 2.5, 7.3], target: [0, 1.35, 0] },
      order: ['trachea', 'rbronchus', 'lbronchus', 'bronchioles', 'alveoli', 'rlung', 'llung', 'pleura', 'diaphragm', 'ribs'],
      quizKeys: ['trachea', 'rbronchus', 'lbronchus', 'bronchioles', 'alveoli', 'rlung', 'llung', 'pleura', 'diaphragm', 'ribs'],
      inner: ['alveoli', 'bronchioles', 'pleura'],
      quizSkip: ['pleura'],
      skipSkinHover: ['pleura', 'ribs'],
      info: LUNGS_INFO,
      labels: LUNGS_LABELS,
      explode: LUNGS_EXPLODE,
      flowLabel: 'Gas Exchange',
      flowPanel: {
        title: '🫁 Gas Exchange',
        subtitle: 'Air in → O₂ into blood · CO₂ out',
        html: '<b style="color:#8fd4e4">O₂ path:</b> air → trachea → bronchi → bronchioles → alveoli → into capillary blood →<br><b style="color:#b8a8d8">CO₂ path:</b> blood → alveoli → bronchioles → bronchi → trachea → exhaled. Each breath swaps ~0.5 L of air in 480 million sacs — and your brain adjusts rate & depth to keep blood gases (and pH) steady.',
      },
      build: buildLungs,
      tick: tickLungs,
    },
  ],
}
