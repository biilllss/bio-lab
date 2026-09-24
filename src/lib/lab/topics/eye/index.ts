import type { TopicDef } from '../../types'
import { buildEye, tickEye } from './build'
import { EYE_EXPLODE, EYE_INFO, EYE_LABELS } from './data'

export const eyeTopic: TopicDef = {
  id: 'eye',
  title: 'The Eye',
  emoji: '👁️',
  tagline: 'Optics, retina & how light becomes sight',
  description:
    'A living camera in your skull: light bends through the cornea and lens, the iris dials the aperture, and 126 million photoreceptors turn it into electricity that streams down the optic nerve. Watch the pupil breathe and follow the light rays in.',
  parts: 'Sclera · Cornea · Iris · Pupil · Lens · Ciliary body · Vitreous · Retina · Macula · Optic nerve · Eye muscles',
  accent: '#e2b45f',
  defaultSystem: 0,
  menuTip:
    'The eye includes: labeled 3D model with functions · scored quiz (name / find / mixed) · X-ray · cross-section · Separate — pop the cornea, iris and lens off the globe · animated light rays + neural signal route · live pupil-dilation with coupled lens accommodation',
  systems: [
    {
      id: 'eye',
      name: 'The Human Eye',
      short: '👁 EYE',
      accent: '#e8c06a',
      hint: '👁 Eye — drag to rotate · scroll to zoom · click parts',
      // slightly softer rig so the transparent optics stay glassy, not blown out
      lighting: { key: 2.25, exposure: 1.08 },
      camera: { pos: [3.4, 1.6, 6.7], target: [0, 0, -0.15] },
      order: ['sclera', 'cornea', 'iris', 'pupil', 'lens', 'ciliaryBody', 'vitreous', 'retina', 'macula', 'opticNerve', 'eyeMuscles'],
      quizKeys: ['sclera', 'cornea', 'iris', 'pupil', 'lens', 'ciliaryBody', 'vitreous', 'retina', 'macula', 'opticNerve', 'eyeMuscles'],
      inner: ['lens', 'ciliaryBody', 'vitreous', 'retina', 'macula'],
      skipSkinHover: ['cornea'],
      quizSkip: ['cornea'],
      info: EYE_INFO,
      labels: EYE_LABELS,
      explode: EYE_EXPLODE,
      flowLabel: 'Visual Pathway',
      flowPanel: {
        title: '👁 Visual Pathway',
        subtitle: 'Light rays in · neural signal out',
        html: '<b style="color:#9fe8ff">Light rays:</b> the <b>cornea</b> bends light most of the way, the <b>lens</b> fine-focuses it — the image lands <i>upside down</i> on the <b>retina</b>.<br><b style="color:#ffb454">Neural signal:</b> ~126 million rods &amp; cones convert it to electricity → <b>optic nerve</b> → visual cortex in the back of your brain flips it right-side up. You literally see with your brain.',
      },
      build: buildEye,
      tick: tickEye,
    },
  ],
}
