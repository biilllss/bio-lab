import type { TopicDef } from '../../types'
import { buildPlantCell, tickPlantCell } from './build'
import { PLANT_EXPLODE, PLANT_INFO, PLANT_LABELS } from './data'

export const plantCellTopic: TopicDef = {
  id: 'plantcell',
  title: 'Plant Cell',
  emoji: '🌱',
  tagline: 'Sunlight to sugar — the green factory',
  description:
    'A walled city in green: cellulose armor holding a pressurized water bubble, chloroplast lens-farms cooking sunlight into sugar, a mitochondrial power plant burning it back into ATP, a Golgi post office, a rough-ER assembly line and secret tunnels to the neighbors. Follow the Cell Current — the cyclosis swirl, sugar load, ATP sparks and protein export — and watch the organelles drift on the streaming tide.',
  parts: 'Cell wall · Membrane · Cytoplasm · Nucleus · Nucleolus · Chromatin · Vacuole · Chloroplast · Mitochondrion · Golgi · ER · Ribosomes · Plasmodesmata',
  accent: '#6da96b',
  defaultSystem: 0,
  menuTip:
    'The plant cell includes: labeled 3D model with functions · scored quiz (name / find / mixed) · X-ray · cross-section · Separate — pop the cell open shell by shell · animated Cell Current (cyclosis swirl · sugar load · ATP sparks · protein export) · live streaming shimmer (chloroplasts, ribosomes & the vacuole ride the tide)',
  systems: [
    {
      id: 'cell',
      name: 'Plant Cell',
      short: '🌱 CELL',
      accent: '#83c07f',
      hint: '🌱 Plant cell — drag to rotate · scroll to zoom · click parts',
      camera: { pos: [0.25, 0.3, 7.4], target: [0, 0, 0] },
      order: ['wall', 'membrane', 'cytoplasm', 'vacuole', 'nucleus', 'nucleolus', 'chromatin', 'er', 'golgi', 'chloroplast', 'mitochondrion', 'ribosome', 'plasmodesma'],
      quizKeys: ['wall', 'membrane', 'cytoplasm', 'vacuole', 'nucleus', 'nucleolus', 'chromatin', 'er', 'golgi', 'chloroplast', 'mitochondrion', 'ribosome', 'plasmodesma'],
      inner: ['membrane', 'cytoplasm', 'vacuole', 'nucleolus', 'chromatin', 'er', 'golgi', 'ribosome'],
      quizSkip: [],
      skipSkinHover: ['wall', 'membrane', 'cytoplasm'],
      info: PLANT_INFO,
      labels: PLANT_LABELS,
      explode: PLANT_EXPLODE,
      flowLabel: 'Cell Current',
      flowPanel: {
        title: '🍃 Cell Current',
        subtitle: 'Cyclosis swirl · sugar load · ATP sparks · protein export',
        html: '<b style="color:#7ad8a0">Cyclosis swirl:</b> the cytoplasm <b>streams</b> around the cell on actin railroad tracks, ferrying organelles like a conveyor tide — watch the green lenses drift.<br><b style="color:#ffd27a">Sugar load:</b> the <b>chloroplasts</b> glue CO₂ + light into sugar, and the surplus ships to the <b>central vacuole</b> pantry.<br><b style="color:#ff8858">ATP sparks:</b> the <b>mitochondrion</b> burns that sugar into ATP — the energy currency the ribosome factories spend nonstop.<br><b style="color:#5ad88a">Protein export:</b> fresh proteins ride from the <b>nucleus</b> through the <b>rough ER</b> and <b>Golgi</b> post office, then tunnel out through a <b>plasmodesma</b> to the neighbor cell.',
      },
      build: buildPlantCell,
      tick: tickPlantCell,
    },
  ],
}
