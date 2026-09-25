import type { TopicDef } from '../../types'
import { buildTongue, tickTongue } from './build'
import { TONGUE_EXPLODE, TONGUE_INFO, TONGUE_LABELS } from './data'

export const tongueTopic: TopicDef = {
  id: 'tongue',
  title: 'The Tongue',
  emoji: '👅',
  tagline: 'Five tastes on one muscular hydrostat',
  description:
    'The mouth\'s boneless shape-shifter in 3D: a muscular body split by the midline groove, carpeted in backward-leaning filiform velvet, dotted with red fungiform mushrooms, ringed by the walled V of circumvallate bunkers and the foliate side gills — every one studded with taste buds wired by three cranial nerves, guarded by tonsils and sealed by the epiglottis. Follow the Taste Signal Route — bud → nerve → brainstem → cortex — and see why the famous tongue map is a myth.',
  parts: 'Apex · Median Sulcus · Filiform · Fungiform · Taste Buds · Body · Foliate · Circumvallate · Tonsils · Root · Epiglottis · Lingual Nerves',
  accent: '#d4687a',
  defaultSystem: 0,
  menuTip:
    'The tongue includes: labeled 3D model with functions · scored quiz (name / find / mixed) · X-ray · cross-section · Separate — lift papillae, buds, nerves, tonsils and the flap apart · animated Taste Signal Route (bud → nerve → brain) · live shimmer (muscle breathing · bud twinkle · velvet sway · lid nod)',
  systems: [
    {
      id: 'surface',
      name: 'Tongue Surface',
      short: '👅 SURFACE',
      accent: '#d4687a',
      hint: '👅 Tongue — drag to rotate · scroll to zoom · click parts',
      camera: { pos: [0, 2.9, 6.6], target: [0, 0.1, 0] },
      order: ['tip', 'sulcus', 'filiform', 'fungiform', 'tasteBud', 'body', 'foliate', 'circumvallate', 'tonsil', 'root', 'epiglottis', 'nerve'],
      quizKeys: ['tip', 'sulcus', 'filiform', 'fungiform', 'tasteBud', 'body', 'foliate', 'circumvallate', 'tonsil', 'root', 'epiglottis', 'nerve'],
      inner: ['tasteBud', 'sulcus', 'nerve'],
      quizSkip: [],
      skipSkinHover: [],
      info: TONGUE_INFO,
      labels: TONGUE_LABELS,
      explode: TONGUE_EXPLODE,
      flowLabel: 'Taste Route',
      flowPanel: {
        title: '👅 Taste Signal Route',
        subtitle: 'Bud → nerve → brainstem → cortex',
        html: '<b style="color:#f0b268">In the bud:</b> a dissolved molecule docks on the hairs of a receptor cell inside a taste barrel — sweet, salty, sour, bitter or umami — and the cell fires.<br><b style="color:#e8c860">Down the wires:</b> three nerves split the territory — facial (VII) takes the front two-thirds, glossopharyngeal (IX) the back third, vagus (X) the epiglottis — all converging on the brainstem\'s <b>solitary nucleus</b>.<br><b style="color:#a888e0">Up to the brain:</b> the thalamus relays the signal to the taste cortex, where it merges with smell — <b>80% of "flavor" is smell</b>, which is why a cold makes coffee taste of nothing.<br><i>The famous tongue map of zones? A myth — every region senses every taste.</i>',
      },
      build: buildTongue,
      tick: tickTongue,
    },
  ],
}
