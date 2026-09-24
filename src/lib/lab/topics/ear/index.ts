import type { TopicDef } from '../../types'
import { buildEar, tickEar } from './build'
import { EAR_EXPLODE, EAR_INFO, EAR_LABELS } from './data'

export const earTopic: TopicDef = {
  id: 'ear',
  title: 'The Ear',
  emoji: '👂',
  tagline: 'Pinna to cochlea — how sound becomes a signal',
  description:
    'A spiral seashell of bone that turns air into electricity: sound funnels down the canal, snaps the eardrum, races through the three smallest bones you own and ripples through the cochlea\'s 2¾ turns. Follow the Sound Wave Journey and watch the ossicle chain vibrate.',
  parts: 'Pinna · Ear canal · Eardrum · Malleus · Incus · Stapes · Cochlea · Semicircular canals · Auditory nerve · Eustachian tube',
  accent: '#a3c96a',
  defaultSystem: 0,
  menuTip:
    'The ear includes: labeled 3D model with functions · scored quiz (name / find / mixed) · X-ray · cross-section · Separate — pull the ossicle chain out of the middle ear · animated Sound Wave Journey incl. the cochlear spiral route · live vibration idle (drum flutter → ossicle wobble → cochlear glow)',
  systems: [
    {
      id: 'ear',
      name: 'The Human Ear',
      short: '👂 EAR',
      accent: '#b1d37c',
      hint: '👂 Ear — drag to rotate · scroll to zoom · click parts',
      camera: { pos: [-1.9, 0.85, 6.2], target: [0.1, 0.3, -0.8] },
      order: ['pinna', 'canal', 'eardrum', 'malleus', 'incus', 'stapes', 'cochlea', 'canals', 'nerve', 'eustachian'],
      quizKeys: ['pinna', 'canal', 'eardrum', 'malleus', 'incus', 'stapes', 'cochlea', 'canals', 'nerve', 'eustachian'],
      inner: ['eardrum', 'malleus', 'incus', 'stapes', 'cochlea', 'canals', 'nerve'],
      info: EAR_INFO,
      labels: EAR_LABELS,
      explode: EAR_EXPLODE,
      flowLabel: 'Sound Journey',
      flowPanel: {
        title: '👂 Sound Wave Journey',
        subtitle: 'Air → drum → bones → fluid → electricity',
        html: '<b style="color:#cdf5c8">Sound waves:</b> the <b>pinna</b> funnels them down the <b>ear canal</b> onto the <b>eardrum</b>.<br><b style="color:#ffd27a">Bone levers:</b> the <b>malleus → incus → stapes</b> chain concentrates the vibration ~20× and pushes the cochlea\'s fluid.<br><b style="color:#a8e88a">Fluid wave:</b> it spirals through the <b>cochlea\'s</b> 2¾ turns, bending ~16,000 hair cells.<br><b style="color:#9fe8ff">Nerve signal:</b> hair cells fire → <b>auditory nerve</b> → brain: "I hear it."',
      },
      build: buildEar,
      tick: tickEar,
    },
  ],
}
