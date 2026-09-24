import type { ExplodeDef, LabelDef, PartInfo } from '../../types'

export const NEURON_INFO: Record<string, PartInfo> = {
  dendrites: {
    name: 'Dendrites', sub: 'Signal input — receive messages',
    fn: 'Branching extensions that receive chemical signals from other neurons (or sensory receptors) and convert them into electrical impulses heading for the cell body. Their huge surface area lets one neuron listen to hundreds — sometimes thousands — of other cells at once.',
  },
  soma: {
    name: 'Cell Body (Soma)', sub: 'Life support + signal integration',
    fn: 'Contains the nucleus and most organelles. It keeps the neuron alive and integrates every incoming signal: if the total voltage at the axon hillock crosses threshold, the neuron fires an action potential down the axon — the <b>all-or-nothing</b> principle.',
  },
  nucleus: {
    name: 'Nucleus', sub: 'Genetic control center',
    fn: "Holds the neuron's DNA and runs its protein factories. Neurons are among the longest-lived cells in your body and (mostly) never divide, so the nucleus has to maintain and repair the cell for a whole lifetime.",
  },
  hillock: {
    name: 'Axon Hillock', sub: 'Trigger zone — fire or not',
    fn: 'The cone-shaped junction between the soma and the axon, packed with voltage-gated ion channels. It sums all excitation and inhibition arriving from the dendrites; when threshold (~−55 mV) is crossed, it launches the action potential.',
  },
  axon: {
    name: 'Axon', sub: 'Signal output cable',
    fn: 'A single long fiber carrying the action potential away from the cell body. The electrical signal regenerates at each node along the way, staying sharp over distances from under a millimeter to more than a meter (your sciatic nerve).',
  },
  myelin: {
    name: 'Myelin Sheath', sub: 'Insulation — speeds signals ×50–100',
    fn: 'Fatty wraps made by Schwann cells (PNS) or oligodendrocytes (CNS). The insulation lets the impulse <b>jump</b> between gaps instead of creeping along the whole membrane — saltatory conduction — reaching up to ~120 m/s. Damaged myelin causes <b>multiple sclerosis</b>.',
  },
  nodes: {
    name: 'Nodes of Ranvier', sub: 'Signal boost stations',
    fn: 'Tiny bare gaps in the myelin where the axon membrane is exposed. Voltage-gated sodium channels concentrate here, recharging the action potential as it leaps node to node — like a relay of boosters along the cable.',
  },
  terminals: {
    name: 'Axon Terminals', sub: 'Output — message to the next cell',
    fn: 'Branching ends (synaptic boutons) storing vesicles of neurotransmitter. When the impulse arrives, calcium influx makes the vesicles fuse with the membrane and release transmitter across the <b>synapse</b> to the next neuron, muscle cell or gland.',
  },
}

export const NEURON_LABELS: LabelDef[] = [
  { key: 'dendrites', name: 'Dendrites', sub: 'signal input', t: [-3.15, 1.3, 0], a: [-3.95, 2.15, 0.3] },
  { key: 'soma', name: 'Cell Body (Soma)', sub: 'integration', t: [-2.55, 0.55, 0.72], a: [-3.9, -0.35, 1.1] },
  { key: 'nucleus', name: 'Nucleus', sub: 'DNA · control', t: [-2.6, 0.62, 0.38], a: [-2.15, 1.8, 0.9] },
  { key: 'hillock', name: 'Axon Hillock', sub: 'trigger zone', t: [-1.7, 0.42, 0.02], a: [-1.5, -1.0, 0.6] },
  { key: 'myelin', name: 'Myelin Sheath', sub: 'fatty insulation', t: [0.5, 0.16, 0.1], a: [0.55, 1.55, 0.5] },
  { key: 'nodes', name: 'Node of Ranvier', sub: 'signal boost', t: [1.42, -0.01, 0.02], a: [1.5, -1.35, 0.4] },
  { key: 'axon', name: 'Axon', sub: 'output fiber', t: [2.3, -0.09, 0.0], a: [2.6, -1.35, 0.1] },
  { key: 'terminals', name: 'Axon Terminals', sub: 'to the next cell', t: [4.0, 0.12, 0.05], a: [4.45, 1.05, 0.3] },
]

export const NEURON_EXPLODE: Record<string, ExplodeDef> = {
  dendrites: { d: [-1.2, 0.65, 0] },
  soma: { d: [-0.6, 0, 0.95] },
  nucleus: { d: [-0.3, 0.35, 1.7] },
  hillock: { d: [-0.45, -0.55, 1.05] },
  axon: { d: [0, -0.95, 0.3] },
  myelin: { d: [0, 1.35, 0.25], p: 1 },
  nodes: { d: [0, -1.6, 0.25], p: 1 },
  terminals: { d: [0.85, 0.65, 0.35] },
}
