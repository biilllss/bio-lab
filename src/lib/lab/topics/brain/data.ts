import type { ExplodeDef, LabelDef, PartInfo } from '../../types'

export const BRAIN_INFO: Record<string, PartInfo> = {
  cerebrum: {
    name: 'Cerebrum', sub: 'Thinking · memory · movement',
    fn: 'The largest part of the brain — two folded hemispheres. Its wrinkled <b>gyri</b> and grooves (<b>sulci</b>) pack roughly <b>16 billion neurons</b> into a small space. It handles conscious thought, planning, language, sensory interpretation and voluntary movement. Different lobes specialise: frontal (decisions, movement), parietal (touch), temporal (hearing, memory), occipital (vision).',
  },
  corpusCallosum: {
    name: 'Corpus Callosum', sub: 'Bridge between hemispheres',
    fn: 'A thick, C-shaped bundle of about <b>200 million nerve fibers</b> — the superhighway between the left and right hemispheres. It lets the two halves share information so seamlessly that you never notice they work separately. Cut it (as in rare epilepsy surgery) and the hemispheres literally start acting like two minds.',
  },
  thalamus: {
    name: 'Thalamus', sub: 'Sensory relay station',
    fn: 'Two egg-shaped hubs deep in the center. Nearly <b>all sensory input</b> — sight, sound, touch, taste — passes through the thalamus before reaching the cortex, which is why it is often called the brain\'s switchboard or router. (Smell is the one sense that skips the line.) It also helps gate attention: what gets through to conscious awareness, and what is filtered out.',
  },
  hypothalamus: {
    name: 'Hypothalamus', sub: 'Body thermostat & drives',
    fn: 'Tiny (4 g) but commanding: it keeps the body in balance (<b>homeostasis</b>) — temperature, hunger, thirst, sleep–wake cycles, and hormones via the pituitary. It is the link between the nervous system and the endocrine system. Feel cold, hungry, or sleepy? That instruction came from here.',
  },
  pituitary: {
    name: 'Pituitary Gland', sub: 'Master hormone gland',
    fn: 'A pea-sized gland hanging below the hypothalamus on a thin stalk. It releases <b>hormones</b> that control growth, blood pressure, pregnancy, thyroid and adrenal glands — earning it the title "master gland". Despite its size it runs most of the body\'s chemistry, and it is itself directed by the hypothalamus sitting right above it.',
  },
  hippocampus: {
    name: 'Hippocampus', sub: 'Memory formation & navigation',
    fn: 'Two seahorse-shaped curves tucked in the temporal lobes. It converts short-term experiences into <b>long-term memories</b> (while the memories themselves are stored in the cortex) and holds your mental map for spatial navigation. London taxi drivers, who memorise 25,000 streets, have measurably larger hippocampi. Damage causes <b>amnesia</b>.',
  },
  amygdala: {
    name: 'Amygdala', sub: 'Fear & emotion processing',
    fn: 'Two almond-shaped clusters next to the hippocampus — the brain\'s <b>alarm system</b>. It detects threats in a split second (before you consciously see the snake), triggers the fight-or-flight response, and stamps emotional events with extra-strong memories. It is also involved in pleasure, reward and reading faces.',
  },
  cerebellum: {
    name: 'Cerebellum', sub: 'Balance · coordination · timing',
    fn: 'The striped "little brain" at the back — only 10% of brain volume but holding <b>more than half of all its neurons</b>. It fine-tunes movement: posture, balance, and smooth, accurate motion (catching a ball, playing piano, handwriting). It also predicts timing. Alcohol hits it hard — which is why drunk walking is wobbly.',
  },
  brainstem: {
    name: 'Brainstem', sub: 'Survival autopilot',
    fn: 'The stalk connecting brain to spinal cord — <b>midbrain, pons and medulla</b>. It runs the automatic programs you never think about: breathing, heart rate, blood pressure, swallowing, coughing, and the sleep–wake switch. Every signal between body and brain passes through it, and it crosses left↔right — which is why the right brain controls the left hand.',
  },
}

export const BRAIN_LABELS: LabelDef[] = [
  { key: 'cerebrum', name: 'Cerebrum', sub: 'thinking · cortex', t: [0.85, 1.85, 0.35], a: [2.35, 2.15, 0.45] },
  { key: 'corpusCallosum', name: 'Corpus Callosum', sub: 'hemisphere bridge', t: [0, 1.28, 0.15], a: [-0.6, 2.4, -1.5] },
  { key: 'thalamus', name: 'Thalamus', sub: 'sensory relay', t: [-0.45, 0.85, 0.05], a: [-1.15, 1.35, 1.15] },
  { key: 'hypothalamus', name: 'Hypothalamus', sub: 'thermostat · drives', t: [0, 0.5, 0.22], a: [-1.05, -0.35, 1.5] },
  { key: 'pituitary', name: 'Pituitary', sub: 'master gland', t: [0, 0.16, 0.28], a: [0.45, -0.95, 1.6] },
  { key: 'hippocampus', name: 'Hippocampus', sub: 'memory · maps', t: [0.72, 0.42, -0.15], a: [1.75, 0.0, 1.05] },
  { key: 'amygdala', name: 'Amygdala', sub: 'emotion · alarm', t: [-0.72, 0.4, 0.3], a: [-1.7, -0.75, 1.35] },
  { key: 'cerebellum', name: 'Cerebellum', sub: 'balance · timing', t: [-0.5, 0.0, -1.25], a: [-1.4, -0.85, -1.9] },
  { key: 'brainstem', name: 'Brainstem', sub: 'survival autopilot', t: [0.12, -0.35, -0.35], a: [0.95, -1.35, -1.15] },
]

export const BRAIN_EXPLODE: Record<string, ExplodeDef> = {
  cerebrum: { d: [1.35, 0.55, 0.1], p: 1 },
  corpusCallosum: { d: [0, 1.7, -0.2] },
  thalamus: { d: [0.85, 0.5, 0.55], p: 1 },
  hypothalamus: { d: [0.25, -0.9, 1.05] },
  pituitary: { d: [0.1, -1.6, 1.0] },
  hippocampus: { d: [1.3, -0.55, 0.45], p: 1 },
  amygdala: { d: [1.55, -1.05, 0.7], p: 1 },
  cerebellum: { d: [0, -0.35, -1.6] },
  brainstem: { d: [-0.25, -1.45, -0.5] },
}
