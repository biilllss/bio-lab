import type { ExplodeDef, LabelDef, PartInfo } from '../../types'

export const HEART_INFO: Record<string, PartInfo> = {
  ra: {
    name: 'Right Atrium', sub: 'Collects deoxygenated blood',
    fn: 'The upper-right chamber. It receives oxygen-poor blood from the whole body through the <b>superior vena cava</b> (head & arms) and <b>inferior vena cava</b> (trunk & legs), then passes it to the right ventricle.',
  },
  rv: {
    name: 'Right Ventricle', sub: 'Pumps blood to the lungs',
    fn: 'The lower-right chamber. It pumps deoxygenated blood into the <b>pulmonary arteries</b> toward the lungs, where the blood picks up oxygen and releases carbon dioxide. Its wall is thinner than the left ventricle because the lungs are close by.',
  },
  la: {
    name: 'Left Atrium', sub: 'Collects oxygenated blood',
    fn: 'The upper-left chamber, sitting at the back of the heart. It receives freshly oxygenated blood returning from the lungs through the four <b>pulmonary veins</b> and passes it down to the left ventricle.',
  },
  lv: {
    name: 'Left Ventricle', sub: 'The main pump — thickest wall',
    fn: 'The lower-left chamber and the strongest one: its muscular wall is ~3× thicker than the right. It drives oxygen-rich blood into the <b>aorta</b> and around the entire body. Its pointed bottom tip is the <b>apex</b>.',
  },
  aorta: {
    name: 'Aorta', sub: 'Largest artery in the body',
    fn: 'Carries oxygenated blood from the left ventricle. It arches over the heart (sending arteries to head and arms) then runs down behind the heart as the descending aorta to supply the rest of the body. Elastic walls smooth out each heartbeat pulse.',
  },
  pa: {
    name: 'Pulmonary Artery', sub: 'Heart → lungs',
    fn: 'The only artery that carries deoxygenated blood. It leaves the right ventricle and branches left and right into the lungs, where blood unloads CO₂ and loads O₂.',
  },
  svc: {
    name: 'Superior Vena Cava', sub: 'Vein: upper body → heart',
    fn: 'A large vein bringing deoxygenated blood from the head, neck and arms down into the right atrium.',
  },
  ivc: {
    name: 'Inferior Vena Cava', sub: 'Vein: lower body → heart',
    fn: 'The largest vein in the body — it returns deoxygenated blood from the abdomen, pelvis and legs to the right atrium.',
  },
  pv: {
    name: 'Pulmonary Veins', sub: 'Lungs → heart (×4)',
    fn: 'Four veins (two from each lung) — the only veins carrying oxygen-rich blood. They deliver it into the left atrium to begin the systemic journey.',
  },
  coronary: {
    name: 'Coronary Arteries', sub: "The heart's own blood supply",
    fn: 'The first branches off the aorta. They wrap around the heart surface (the LAD runs down the front) feeding the heart muscle itself. Blockage here causes a <b>heart attack</b> — the muscle runs out of oxygen.',
  },
  pericardium: {
    name: 'Pericardium', sub: 'Protective sac',
    fn: 'A double-walled membrane sac around the heart with a slip of fluid between its layers. It anchors the heart, reduces friction as it beats and protects it from infection and over-expansion.',
  },
}

export const HEART_LABELS: LabelDef[] = [
  { key: 'aorta', name: 'Aorta', sub: 'to the whole body', t: [0.05, 2.6, -0.4], a: [1.9, 3.05, -0.55] },
  { key: 'pa', name: 'Pulmonary Artery', sub: 'to the lungs', t: [-0.12, 1.95, 0.15], a: [-1.95, 2.5, 0.35] },
  { key: 'svc', name: 'Superior Vena Cava', sub: 'upper body in', t: [-0.88, 2.1, 0], a: [-2.05, 2.6, 0.25] },
  { key: 'ivc', name: 'Inferior Vena Cava', sub: 'lower body in', t: [-0.8, -0.1, -0.05], a: [-2.0, -0.4, 0.0] },
  { key: 'pv', name: 'Pulmonary Veins', sub: 'oxygen in (×4)', t: [-0.95, 2.15, -0.55], a: [-2.15, 1.75, -0.55] },
  { key: 'ra', name: 'Right Atrium', sub: 'receives body blood', t: [-0.72, 1.15, 0.1], a: [-1.85, 1.4, 0.55] },
  { key: 'rv', name: 'Right Ventricle', sub: 'pumps to lungs', t: [-0.35, 0.5, 0.6], a: [-1.6, 0.3, 1.05] },
  { key: 'la', name: 'Left Atrium', sub: 'receives lung blood', t: [-0.4, 2.0, -0.35], a: [-1.85, 1.65, -1.05] },
  { key: 'lv', name: 'Left Ventricle', sub: 'pumps to body', t: [0.55, 0.7, 0.15], a: [1.95, 0.95, 0.65] },
  { key: 'coronary', name: 'Coronary Arteries', sub: "heart's own supply", t: [0.15, 0.9, 0.5], a: [1.7, 0.1, 0.95] },
  { key: 'pericardium', name: 'Pericardium', sub: 'protective sac', t: [0, 2.05, 0.65], a: [1.25, 2.7, 1.25] },
]

export const HEART_EXPLODE: Record<string, ExplodeDef> = {
  aorta: { d: [0.15, 1.35, -0.6] },
  pa: { d: [-0.9, 0.65, 0.8] },
  svc: { d: [-0.9, 1.1, 0.25] },
  ivc: { d: [-0.8, -1.1, 0.25] },
  pv: { d: [-1.3, 0.5, -0.7], p: 1 },
  ra: { d: [-1.5, 0.2, 0.15] },
  la: { d: [-0.6, 0.75, -1.2] },
  rv: { d: [-0.5, -0.85, 1.15] },
  lv: { d: [1.35, -0.35, 0.45] },
  coronary: { d: [0.6, -0.9, 1.25] },
  pericardium: { d: [0, 0.35, 1.9] },
}
