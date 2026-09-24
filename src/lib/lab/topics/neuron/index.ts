import type { TopicDef } from '../../types'
import { buildNeuron } from './build'
import { NEURON_EXPLODE, NEURON_INFO, NEURON_LABELS } from './data'

export const neuronTopic: TopicDef = {
  id: 'neuron',
  title: 'Nerve Cell (Neuron)',
  emoji: '⚡',
  tagline: 'Dendrites to synapse — how signals travel',
  description:
    'Follow an action potential through a neuron: input at the dendrites, integration in the soma, the trigger zone, myelinated conduction and neurotransmitter release at the terminals.',
  parts: 'Dendrites · Soma · Nucleus · Axon hillock · Myelin sheath · Nodes of Ranvier · Axon terminals …',
  accent: '#37d0c5',
  defaultSystem: 0,
  menuTip:
    'The neuron includes: labeled 3D model with functions · scored quiz (name / find / mixed) · X-ray · cross-section · Separate — pull the cell apart · animated action potential racing from dendrites to terminals',
  systems: [
    {
      id: 'neuron',
      name: 'The Neuron',
      short: '⚡ NEURON',
      accent: '#4fd8cc',
      hint: '⚡ Neuron — drag to rotate · scroll to zoom · click parts',
      camera: { pos: [0.9, 1.3, 9.2], target: [0.3, 0.25, 0] },
      order: ['dendrites', 'soma', 'nucleus', 'hillock', 'axon', 'myelin', 'nodes', 'terminals'],
      quizKeys: ['dendrites', 'soma', 'nucleus', 'hillock', 'axon', 'myelin', 'nodes', 'terminals'],
      inner: ['nucleus', 'hillock'],
      info: NEURON_INFO,
      labels: NEURON_LABELS,
      explode: NEURON_EXPLODE,
      flowLabel: 'Impulse Path',
      flowPanel: {
        title: '⚡ Nerve Impulse',
        subtitle: 'From input to output — the action potential',
        html: '<b>Path:</b> Dendrites receive signals → soma integrates them → <b>axon hillock</b> fires if threshold is crossed → action potential races down the <b>axon</b>, recharging at each <b>node of Ranvier</b> (saltatory conduction) → <b>terminals</b> release neurotransmitter into the synapse. Myelin insulation makes it up to ~120 m/s fast.',
      },
      build: buildNeuron,
    },
  ],
}
