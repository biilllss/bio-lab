import type { TopicDef } from '../../types'
import { buildKidney, tickKidney } from './build'
import { KIDNEY_EXPLODE, KIDNEY_INFO, KIDNEY_LABELS } from './data'

export const kidneyTopic: TopicDef = {
  id: 'kidney',
  title: 'Nephron & Kidney',
  emoji: '🫘',
  tagline: 'Blood in, urine out — the body\'s filter plant',
  description:
    'A million microscopic filters packed into a bean: blood is squeezed through the glomerulus, robbed of its waste and its water, fine-tuned hormone by hormone and dripped toward the bladder. Follow the Filtration Journey from renal artery to ureter — and see the zoom cone pull one single nephron up to study size.',
  parts: 'Cortex · Medulla · Pyramids · Pelvis · Ureter · Renal artery · Renal vein · Bowman\'s capsule · Glomerulus · Proximal tubule · Loop of Henle · Distal tubule · Collecting duct',
  accent: '#d98d5f',
  defaultSystem: 0,
  menuTip:
    'The kidney includes: labeled 3D model with functions · scored quiz (name / find / mixed) · X-ray · cross-section · Separate — pull the bean and the nephron apart · animated Filtration Journey (blood in → filter → tubules → urine out) · live filtration pulse (glomerulus glow → tubule shimmer → ureter peristalsis)',
  systems: [
    {
      id: 'kidney',
      name: 'The Nephron & Kidney',
      short: '🫘 KIDNEY',
      accent: '#e0a172',
      hint: '🫘 Kidney — drag to rotate · scroll to zoom · click parts',
      camera: { pos: [-0.75, 0.55, 7.5], target: [0.35, 0.12, -0.2] },
      order: ['cortex', 'medulla', 'pyramid', 'pelvis', 'ureter', 'artery', 'vein', 'capsule', 'glomerulus', 'pct', 'henle', 'dct', 'duct'],
      quizKeys: ['cortex', 'medulla', 'pyramid', 'pelvis', 'ureter', 'artery', 'vein', 'capsule', 'glomerulus', 'pct', 'henle', 'dct', 'duct'],
      inner: ['medulla', 'pyramid', 'pelvis', 'capsule', 'glomerulus', 'pct', 'henle', 'dct'],
      quizSkip: [],
      skipSkinHover: ['cortex', 'capsule'],
      info: KIDNEY_INFO,
      labels: KIDNEY_LABELS,
      explode: KIDNEY_EXPLODE,
      flowLabel: 'Filtration Path',
      flowPanel: {
        title: '🫘 Filtration Journey',
        subtitle: 'Blood in → filter → tubule processing → urine out',
        html: '<b style="color:#ff9a8a">Dirty blood:</b> the <b>renal artery</b> delivers 20% of your cardiac output up to the <b>glomerulus</b> pressure filter.<br><b style="color:#ffd27a">Filtrate:</b> water, salts & waste squeeze into <b>Bowman\'s capsule</b>, then the <b>proximal tubule → loop of Henle → distal tubule</b> reclaim the good stuff (180 L → 1.5 L).<br><b style="color:#d8f57a">Urine:</b> the <b>collecting duct</b> makes the final water call (ADH) → <b>pelvis → ureter</b> → bladder.<br><b style="color:#9fd8ff">Clean blood:</b> the <b>renal vein</b> takes it home, balanced to the molecule.',
      },
      build: buildKidney,
      tick: tickKidney,
    },
  ],
}
