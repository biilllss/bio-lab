import type { ExplodeDef, LabelDef, PartInfo } from '../../types'

export const LUNGS_INFO: Record<string, PartInfo> = {
  trachea: {
    name: 'Trachea', sub: 'The windpipe',
    fn: 'A ~11 cm tube held open by <b>16–20 C-shaped cartilage rings</b> (the gap faces backward so the esophagus can bulge into it). It carries air from the larynx down to the bronchi, and its lining sweeps mucus and trapped dust <i>upward</i> with millions of cilia — the "mucociliary escalator".',
  },
  rbronchus: {
    name: 'Right Main Bronchus', sub: 'Wider, shorter, steeper',
    fn: 'The right bronchus is <b>wider, shorter and more vertical</b> than the left — which is why inhaled objects usually fall into it. It divides into <b>three lobar bronchi</b>, one for each lobe of the right lung.',
  },
  lbronchus: {
    name: 'Left Main Bronchus', sub: 'Longer, more angled',
    fn: 'The left bronchus passes <b>underneath the aortic arch</b> to reach the left lung, so it is longer and takes a more horizontal path. It splits into <b>two lobar bronchi</b> for the left lung\'s two lobes.',
  },
  bronchioles: {
    name: 'Bronchioles', sub: 'Airway twigs',
    fn: 'The bronchi branch ~23 times into ever-finer <b>bronchioles</b> (under 1 mm wide). They have no cartilage — their walls are smooth muscle that can tighten (as in an <b>asthma attack</b>) or relax. The smallest ones end in alveolar sacs.',
  },
  alveoli: {
    name: 'Alveoli', sub: 'Gas-exchange sacs',
    fn: '~480 million microscopic air sacs wrapped in capillaries, giving a surface area of roughly <b>70 m²</b> — about half a tennis court. Oxygen diffuses through the paper-thin wall (0.5 µm) into the blood, while CO₂ diffuses out. A special fluid called <b>surfactant</b> keeps them from collapsing.',
  },
  rlung: {
    name: 'Right Lung', sub: 'Three lobes',
    fn: 'The larger lung, split by two fissures into <b>superior, middle and inferior lobes</b>. It is a bit shorter than the left because the <b>liver</b> pushes the diaphragm up on that side, but wider to make room for the heart on the left.',
  },
  llung: {
    name: 'Left Lung', sub: 'Two lobes + cardiac notch',
    fn: 'Slightly smaller than the right and divided into just <b>two lobes</b>. Its <b>cardiac notch</b> is a concave dent where the heart nestles in — which is why the left lung is ~10% smaller than its partner.',
  },
  pleura: {
    name: 'Pleura', sub: 'Slippery double membrane',
    fn: 'A two-layered serous membrane: the <b>visceral pleura</b> coats each lung, the <b>parietal pleura</b> lines the chest wall, and a thin film of fluid between them lets the lungs slide friction-free while <b>sticking</b> to the chest — so the lungs expand when the rib cage does. Inflammation here is <b>pleurisy</b>.',
  },
  diaphragm: {
    name: 'Diaphragm', sub: 'The main breathing muscle',
    fn: 'A dome-shaped sheet of skeletal muscle separating chest from abdomen. When it <b>contracts it flattens</b>, pulling the lungs open and sucking air in (inhalation); when it <b>relaxes it domes back up</b> and air is pushed out. Hiccups are a sudden involuntary spasm of this muscle. ~70% of your inhaled air is its work.',
  },
  ribs: {
    name: 'Rib Cage', sub: 'The breathing bellows',
    fn: 'The bony frame of the chest. Between the ribs, <b>intercostal muscles</b> lift the ribs up and out during deep inhalation — increasing chest volume even more. The rib cage protects the lungs and heart and, together with the diaphragm, works like a bellows.',
  },
}

export const LUNGS_LABELS: LabelDef[] = [
  { key: 'trachea', name: 'Trachea', sub: 'windpipe', t: [0, 2.75, 0.42], a: [-1.75, 3.15, 0.6] },
  { key: 'rbronchus', name: 'Right Bronchus', sub: 'to right lung', t: [-0.4, 1.45, 0.25], a: [-1.95, 1.2, 0.7] },
  { key: 'lbronchus', name: 'Left Bronchus', sub: 'to left lung', t: [0.42, 1.42, 0.25], a: [1.95, 1.05, 0.75] },
  { key: 'bronchioles', name: 'Bronchioles', sub: 'airway branches', t: [-1.0, 1.15, 0.1], a: [-2.15, 0.55, 0.4] },
  { key: 'alveoli', name: 'Alveoli', sub: 'gas exchange', t: [-1.18, 0.68, 0.18], a: [-2.2, 0.1, 0.35] },
  { key: 'rlung', name: 'Right Lung', sub: '3 lobes', t: [-0.95, 1.95, 0.1], a: [-2.05, 2.3, 0.45] },
  { key: 'llung', name: 'Left Lung', sub: '2 lobes', t: [0.95, 1.9, 0.05], a: [2.05, 2.35, 0.35] },
  { key: 'pleura', name: 'Pleura', sub: 'double membrane', t: [0.62, 1.6, -0.55], a: [1.8, 1.75, -1.15] },
  { key: 'diaphragm', name: 'Diaphragm', sub: 'breathing muscle', t: [0, -0.1, 0.35], a: [1.6, -0.55, 0.95] },
  { key: 'ribs', name: 'Rib Cage', sub: 'protective bellows', t: [-1.35, 1.5, -0.2], a: [-2.15, 1.95, -0.9] },
]

export const LUNGS_EXPLODE: Record<string, ExplodeDef> = {
  trachea: { d: [0, 1.6, 0.55] },
  rbronchus: { d: [-1.3, 0.15, 0.7] },
  lbronchus: { d: [1.3, 0.15, 0.7] },
  bronchioles: { d: [-1.0, -0.2, 1.3] },
  alveoli: { d: [-0.7, -1.15, 1.2] },
  rlung: { d: [-1.6, 0.1, 0.2] },
  llung: { d: [1.6, 0.1, 0.2] },
  pleura: { d: [0.5, 0.35, -1.7] },
  diaphragm: { d: [0, -1.5, 0.55] },
  ribs: { d: [-0.9, 0.4, -1.6] },
}
