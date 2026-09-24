import type { TopicDef } from '../../types'
import { buildBrain, tickBrain } from './build'
import { BRAIN_EXPLODE, BRAIN_INFO, BRAIN_LABELS } from './data'

export const brainTopic: TopicDef = {
  id: 'brain',
  title: 'The Brain',
  emoji: '🧠',
  tagline: 'Cortex, limbic system & how signals flow',
  description:
    'Peek inside a living brain: the folded cortex, the relay hubs deep in the middle, the memory and emotion centers, and three animated signal routes — sensory up, motor down, and the limbic loop.',
  parts: 'Cerebrum · Corpus callosum · Thalamus · Hypothalamus · Pituitary · Hippocampus · Amygdala · Cerebellum · Brainstem',
  accent: '#c99df0',
  defaultSystem: 0,
  menuTip:
    'The brain includes: labeled 3D model with functions · scored quiz (name / find / mixed) · X-ray · cross-section · Separate — lift the cortex off the deep structures · animated sensory / motor / limbic signal routes · live "thinking" pulse with neural sparks',
  systems: [
    {
      id: 'brain',
      name: 'The Human Brain',
      short: '🧠 BRAIN',
      accent: '#d9b3f5',
      hint: '🧠 Brain — drag to rotate · scroll to zoom · click parts',
      // pale pink tissue washes out under the studio rig — dim the key light
      lighting: { key: 1.75, rim: 1.45, fill: 0.4, exposure: 1.0 },
      camera: { pos: [3.1, 1.7, 8.0], target: [0, 0.45, 0] },
      order: ['cerebrum', 'corpusCallosum', 'thalamus', 'hypothalamus', 'pituitary', 'hippocampus', 'amygdala', 'cerebellum', 'brainstem'],
      quizKeys: ['cerebrum', 'corpusCallosum', 'thalamus', 'hypothalamus', 'pituitary', 'hippocampus', 'amygdala', 'cerebellum', 'brainstem'],
      inner: ['corpusCallosum', 'thalamus', 'hypothalamus', 'pituitary', 'hippocampus', 'amygdala'],
      skipSkinHover: ['cerebrum'],
      info: BRAIN_INFO,
      labels: BRAIN_LABELS,
      explode: BRAIN_EXPLODE,
      flowLabel: 'Neural Signals',
      flowPanel: {
        title: '🧠 Neural Signals',
        subtitle: 'Sensory up · motor down · the limbic loop',
        html: '<b style="color:#9fd9f0">Sensory route:</b> body → spinal cord → brainstem → <b>thalamus</b> relays it → cortex becomes aware.<br><b style="color:#ffbb80">Motor route:</b> cortex decides → descends through the brainstem (crossing left↔right) → muscles move.<br><b style="color:#f0a0c8">Limbic loop:</b> <b>hippocampus</b> packages memories → hypothalamus tags them with feeling via the <b>amygdala</b> — that\'s why you remember emotional moments best.',
      },
      build: buildBrain,
      tick: tickBrain,
    },
  ],
}
