import type { TopicDef } from '../../types'
import { buildSkin, tickSkin } from './build'
import { SKIN_EXPLODE, SKIN_INFO, SKIN_LABELS } from './data'

export const skinTopic: TopicDef = {
  id: 'skin',
  title: 'The Skin',
  emoji: '🧴',
  tagline: 'Your largest organ — armor, radiator & touch screen',
  description:
    'A cross-section block of you: three wavy interlocking layers with a full hair factory growing inside, a coiled sweat gland pumping to the surface, vessel loops that open and close like a thermostat, and nerve onions listening for the faintest vibration. Follow the Skin Traffic — blood flush, sweat lift, oil slick, nerve spark — and watch the goosebump muscle yank the hair upright.',
  parts: 'Epidermis · Dermis · Hypodermis · Hair · Follicle · Papilla · Arrector pili · Sebaceous gland · Sweat gland · Duct · Pore · Vessels · Nerve endings',
  accent: '#c98a63',
  defaultSystem: 0,
  menuTip:
    'The skin includes: labeled 3D cross-section with functions · scored quiz (name / find / mixed) · X-ray · cross-section · Separate — peel the three layers apart · animated Skin Traffic (blood flush · sweat lift · nerve spark · oil slick) · live goosebumps pulse (arrector flex → hair rises → vessel flush)',
  systems: [
    {
      id: 'skin',
      name: 'Skin Cross-Section',
      short: '🧴 SKIN',
      accent: '#d8a07d',
      hint: '🧴 Skin — drag to rotate · scroll to zoom · click parts',
      camera: { pos: [0.2, 0.3, 7.2], target: [0, 0.05, 0] },
      order: ['epidermis', 'dermis', 'hypodermis', 'hair', 'follicle', 'papilla', 'arrector', 'sebaceous', 'sweatGland', 'duct', 'pore', 'vessel', 'nerve'],
      quizKeys: ['epidermis', 'dermis', 'hypodermis', 'hair', 'follicle', 'papilla', 'arrector', 'sebaceous', 'sweatGland', 'duct', 'pore', 'vessel', 'nerve'],
      inner: ['dermis', 'hypodermis', 'follicle', 'papilla', 'sebaceous', 'sweatGland', 'duct', 'vessel', 'nerve'],
      quizSkip: [],
      skipSkinHover: ['epidermis', 'dermis', 'hypodermis'],
      info: SKIN_INFO,
      labels: SKIN_LABELS,
      explode: SKIN_EXPLODE,
      flowLabel: 'Skin Traffic',
      flowPanel: {
        title: '🌡️ Skin Traffic',
        subtitle: 'Blood flush · sweat lift · nerve spark · oil slick',
        html: '<b style="color:#ff9a8a">Blood flush:</b> dermal vessels <b>vasodilate</b> on a hot day, flooding the capillary loops just under the surface to radiate heat away.<br><b style="color:#9fd8ff">Sweat lift:</b> the <b>coiled gland</b> pulls water + salts from plasma and the <b>duct</b> raises it to the <b>pore</b> — every evaporating gram carries ~2.4 kJ of heat off you.<br><b style="color:#5aff9a">Nerve spark:</b> touch lands on the <b>Meissner corpuscle</b> and races down the fiber — skin is your largest sensory organ.<br><b style="color:#ffd27a">Oil slick:</b> the <b>sebaceous gland</b> coats the hair shaft in sebum, waterproofing and polishing it on the way out.',
      },
      build: buildSkin,
      tick: tickSkin,
    },
  ],
}
