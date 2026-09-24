import type { TopicDef } from '../../types'
import { buildHeart } from './build'
import { HEART_EXPLODE, HEART_INFO, HEART_LABELS } from './data'

export const heartTopic: TopicDef = {
  id: 'heart',
  title: 'Heart & Blood Flow',
  emoji: '🫀',
  tagline: 'Chambers, great vessels & double circulation',
  description:
    'Explore the four chambers, the great vessels and both circulation loops. Follow oxygen-poor and oxygen-rich blood on animated routes through the heart.',
  parts: 'Right atrium · Right ventricle · Left atrium · Left ventricle · Aorta · Pulmonary artery · Vena cavae · Coronary arteries …',
  accent: '#e2556a',
  defaultSystem: 0,
  menuTip:
    'The heart includes: labeled 3D model with functions · scored quiz (name / find / mixed) · X-ray · cross-section · Separate — pull the chambers apart · animated pulmonary & systemic blood circuits',
  systems: [
    {
      id: 'heart',
      name: 'The Human Heart',
      short: '🫀 HEART',
      accent: '#ff8f8f',
      hint: '🫀 Heart — drag to rotate · scroll to zoom · click parts',
      camera: { pos: [4.6, 2.3, 6.8], target: [0, 1.15, 0] },
      order: ['ra', 'rv', 'la', 'lv', 'aorta', 'pa', 'svc', 'ivc', 'pv', 'coronary', 'pericardium'],
      quizKeys: ['ra', 'rv', 'la', 'lv', 'aorta', 'pa', 'svc', 'ivc', 'pv', 'coronary', 'pericardium'],
      inner: ['coronary', 'la', 'pv'],
      quizSkip: ['pericardium'],
      skipSkinHover: ['pericardium'],
      info: HEART_INFO,
      labels: HEART_LABELS,
      explode: HEART_EXPLODE,
      flowLabel: 'Blood Flow',
      flowPanel: {
        title: '🩸 Blood Circuits',
        subtitle: 'Two loops — pulmonary & systemic',
        html: '<b style="color:#7fa8e8">Pulmonary loop:</b> body → vena cavae → <b>RA</b> → <b>RV</b> → pulmonary artery → lungs (drops CO₂, picks up O₂) →<br><b style="color:#e08080">Systemic loop:</b> pulmonary veins → <b>LA</b> → <b>LV</b> → aorta → the whole body. Two pumps in one — the right side is a low-pressure lung circuit, the left side a high-pressure body circuit.',
      },
      build: buildHeart,
    },
  ],
}
