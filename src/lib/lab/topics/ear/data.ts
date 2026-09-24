import type { ExplodeDef, LabelDef, PartInfo } from '../../types'

export const EAR_INFO: Record<string, PartInfo> = {
  pinna: {
    name: 'Pinna (Auricle)', sub: 'The visible ear · sound collector',
    fn: 'The funnel-shaped flap of elastic cartilage and skin — the only part of the ear you can see. Its curves (helix, antihelix, concha) act like a tiny <b>satellite dish</b>, funneling sound waves into the canal and helping your brain tell whether a sound came from in front, behind, above or below. Ear muscles in other animals swivel the pinna toward a noise; in humans they\'re so vestigial that only ~1 in 5 people can wiggle their ears at all.',
  },
  canal: {
    name: 'Ear Canal', sub: 'Tunnel to the eardrum · self-cleaning',
    fn: 'A ~2.5 cm S-shaped tube carved through cartilage and bone, ending at the eardrum. It <b>warms and humidifies</b> incoming air so the eardrum never dries out, and its special S-curve is why doctors pull the pinna up-and-back to look inside. Ceruminous glands line it with <b>earwax</b> — a sticky, acidic, self-replacing insect trap and antibiotic shield that slowly rides outward as the canal skin migrates (you should never need a cotton swab).',
  },
  eardrum: {
    name: 'Eardrum', sub: 'Tympanic membrane · the boundary',
    fn: 'A translucent, pearl-grey membrane stretched across the canal\'s end like the skin of a drum — thin enough that you can see light through a healthy one. Incoming sound makes it <b>vibrate thousands of times per second</b> with displacements smaller than a hydrogen atom at the threshold of hearing. It also seals the middle ear (with its three little bones floating in air) off from the outside world, and it heals remarkably well after perforation.',
  },
  malleus: {
    name: 'Malleus', sub: '"The hammer" · first bone',
    fn: 'The largest of the three ossicles — its long handle is fused to the eardrum itself, so the membrane\'s vibrations shake it directly. Its head pivots in the epitympanic recess where it locks onto the incus. The two tiny muscles of the middle ear (one attached here) can stiffen the chain to protect against loud sounds — the <b>acoustic reflex</b>, though it reacts too slowly to save you from a gunshot. "Malleus" is Latin for hammer.',
  },
  incus: {
    name: 'Incus', sub: '"The anvil" · middle bone',
    fn: 'The anvil-shaped bridge between malleus and stapes — it receives the hammer\'s blow through a true saddle joint and levers it onward. With the other ossicles it forms a chain that trades distance for force, multiplying sound pressure on its way to the inner ear. It was the first bone in your body to finish growing — ossification completes before birth, which is why newborn hearing tests work on day one.',
  },
  stapes: {
    name: 'Stapes', sub: '"The stirrup" · smallest bone',
    fn: 'The smallest bone in the entire human body — about 3 × 2.5 mm and lighter than a grain of rice. Its footplate seats in the <b>oval window</b> of the cochlea, and its stirrup rocking action pushes fluid there like a piston. Because fluid is much harder to move than air, this tiny lever system concentrates pressure roughly <b>20-fold</b> — without the ossicles you\'d be nearly deaf. "Stapes" is Latin for stirrup.',
  },
  cochlea: {
    name: 'Cochlea', sub: 'Spiral organ · sound into electricity',
    fn: 'A snail-shaped bony labyrinth of <b>2¾ turns</b>, filled with fluid and lined with ~16,000 hair cells sitting on the basilar membrane. High frequencies vibrate the base, low frequencies the tip — the cochlea is a <b>mechanical Fourier analyzer</b> splitting sound into pitches. When the fluid wave bends a hair bundle, the cell fires and your brain hears a tone. These hair cells never regrow: every loud concert permanently spends a few. The model shows the <b>fluid wave spiraling in</b> during the flow animation.',
  },
  canals: {
    name: 'Semicircular Canals', sub: 'Three loops · your balance gyroscope',
    fn: 'Three fluid-filled rings at right angles to each other — one for pitch, one for roll, one for yaw. When your head rotates, inertia makes the fluid lag behind, bending a gelatinous sail (the cupula) and bending hair cells that report the turn. They explain <b>motion sickness</b> (eyes say still, ears say spinning), why you feel like spinning after stopping, and why you can\'t feel a car accelerating smoothly at constant speed — only rotation is sensed here.',
  },
  nerve: {
    name: 'Vestibulocochlear Nerve', sub: 'Cranial nerve VIII · two cables in one',
    fn: 'The data cable carrying <b>two streams</b>: the cochlear branch ships pitch-and-volume information from ~30,000 nerve fibers, while the vestibular branch reports head rotation and gravity from the balance organs. It runs a short, hard-walled route to the brainstem — which is why a benign growth (a vestibular schwannoma) pressing on it first shows up as one-sided hearing loss or ringing. From here, sound reaches the auditory cortex in about 10 milliseconds.',
  },
  eustachian: {
    name: 'Eustachian Tube', sub: 'Pressure equalizer · drains the middle ear',
    fn: 'A 3.5 cm cartilage-and-bone tube linking the middle-ear cavity to the back of the throat. It opens for a fraction of a second every time you swallow or yawn — that faint "pop" is it equalizing pressure across the eardrum, which is why you <b>yawn on airplanes</b>. It also drains mucus from the middle ear. In children it runs flatter and narrower, which is why ear infections are so much more common in kids than adults.',
  },
}

export const EAR_LABELS: LabelDef[] = [
  { key: 'pinna', name: 'Pinna', sub: 'gathers sound', t: [0.28, -0.12, 0.2], a: [1.75, -0.85, 1.1] },
  { key: 'canal', name: 'Ear Canal', sub: 'to the eardrum', t: [0.02, 0.03, 0.0], a: [-1.75, -0.95, 1.2] },
  { key: 'eardrum', name: 'Eardrum', sub: 'vibrating membrane', t: [0.02, 0.07, -0.79], a: [1.45, -0.45, -0.55] },
  { key: 'malleus', name: 'Malleus', sub: 'the hammer', t: [0.1, 0.36, -0.95], a: [1.6, 0.9, -0.8] },
  { key: 'incus', name: 'Incus', sub: 'the anvil', t: [0.17, 0.44, -1.03], a: [1.95, 1.4, -1.35] },
  { key: 'stapes', name: 'Stapes', sub: 'the stirrup', t: [0.11, 0.62, -1.18], a: [1.25, 1.95, -1.75] },
  { key: 'cochlea', name: 'Cochlea', sub: 'spiral of hearing', t: [-0.62, 0.5, -1.5], a: [-2.15, 0.35, -1.5] },
  { key: 'canals', name: 'Semicircular Canals', sub: 'balance loops', t: [-0.2, 1.26, -1.6], a: [-1.35, 2.25, -2.0] },
  { key: 'nerve', name: 'Auditory Nerve', sub: 'to the brain', t: [-0.17, 0.2, -2.5], a: [0.75, -0.35, -2.95] },
  { key: 'eustachian', name: 'Eustachian Tube', sub: 'pressure equalizer', t: [0.38, -0.7, -0.32], a: [1.85, -1.75, 0.3] },
]

export const EAR_EXPLODE: Record<string, ExplodeDef> = {
  pinna: { d: [0.2, -0.4, 1.6] },
  canal: { d: [0, -0.1, 1.1] },
  eardrum: { d: [0.2, -0.45, 0.7] },
  malleus: { d: [0.5, 0.5, 0.25] },
  incus: { d: [0.35, 0.8, -0.2] },
  stapes: { d: [0.1, 0.9, -0.55] },
  cochlea: { d: [-0.9, -0.6, -0.5] },
  canals: { d: [-0.6, 1.1, -0.8] },
  nerve: { d: [-0.3, -1.0, -0.9] },
  eustachian: { d: [0.8, -1.0, 0.35] },
}
