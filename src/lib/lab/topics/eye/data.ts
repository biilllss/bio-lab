import type { ExplodeDef, LabelDef, PartInfo } from '../../types'

export const EYE_INFO: Record<string, PartInfo> = {
  sclera: {
    name: 'Sclera', sub: 'The white of the eye',
    fn: 'The tough, fibrous outer coat — white, opaque collagen that keeps the eyeball\'s shape and protects the delicate inner layers. It is surprisingly strong (you can\'t squish an eye shut) and is continuous with the <b>cornea</b> at the front and covered by the slippery conjunctiva. The six extraocular muscles anchor into it, swinging the eye with millimetre precision.',
  },
  cornea: {
    name: 'Cornea', sub: 'Clear window · main focusing power',
    fn: 'The transparent dome at the very front. It does about <b>two-thirds of the eye\'s focusing</b> — bending light inward the moment it enters. There are no blood vessels in it (it feeds on tears and aqueous humor) and <b>no nerve insulation</b>: it has ~50× more pain receptors than skin, which is why even an eyelash is unbearable. A contact lens literally floats on its tear film.',
  },
  iris: {
    name: 'Iris', sub: 'Colored muscle · the aperture',
    fn: 'The colored ring around the pupil — its pigment (melanin) decides blue, green, hazel or brown. But its real job is mechanical: two tiny muscles (<b>sphincter</b> and <b>dilator pupillae</b>) constantly resize the pupil like a camera aperture. Bright light → pupil shrinks in under a second; a dark room or an interesting person → it widens. Watch someone\'s eyes: emotions show in the iris before words do.',
  },
  pupil: {
    name: 'Pupil', sub: 'The gateway for light',
    fn: 'Not a structure but a <b>hole</b> — the opening in the iris through which light enters. Its size is a live readout of your nervous system: constricted in light (≈2 mm), dilated in the dark (≈8 mm), enlarged by adrenaline, fear, attraction, or drugs. Doctors shine a light in it to check the brain reflex arc. Notice it here: the model\'s pupil <b>slowly dilates and contracts</b> like a real one adapting.',
  },
  lens: {
    name: 'Lens', sub: 'Fine focus · zoom lens',
    fn: 'A crystal-clear, jelly-like biconvex disc behind the iris. It does the <b>fine focusing</b> the cornea can\'t: the ciliary muscles change its curvature so a distant mountain <i>and</i> this sentence both land sharply on the retina (accommodation). With age it stiffens — that\'s why reading glasses appear after 45. It also filters UV, and it is the only part that can grow a cataract — a clouding that 20% of people over 60 have.',
  },
  ciliaryBody: {
    name: 'Ciliary Body', sub: 'Focus motor · makes aqueous humor',
    fn: 'A muscular ring hugging the lens\'s rim. Its fibers (via the suspensory <b>zonules</b>) tug on the lens: relax → lens fattens for near work; contract → lens flattens for distance. This is the eye\'s autofocus motor. It also produces the <b>aqueous humor</b> that bathes the front chamber — and when its drainage clogs, pressure builds: glaucoma.',
  },
  vitreous: {
    name: 'Vitreous Humor', sub: 'The gel that inflates the eye',
    fn: 'A clear, egg-white gel filling the ~4 ml space between lens and retina — 99% water plus a scaffold of collagen. It presses the retina gently against the back wall (so it stays in place), transmits light without scattering it, and absorbs shocks like a built-in airbag. The floating squiggles you see when staring at a blue sky are <b>floaters</b> — tiny condensed fibers casting shadows inside this gel.',
  },
  retina: {
    name: 'Retina', sub: 'Light-sensor film · part of the brain',
    fn: 'A paper-thin (0.2 mm) lining of <b>photoreceptors</b> on the back wall — literally an outpost of the brain, growing from neural tissue in the embryo. ~120 million <b>rods</b> sense dim light and motion; ~6 million <b>cones</b> (packed here densely) sense color and detail. They convert photons into electricity and forward it through two more cell layers before it even leaves the eye. Detach this layer and vision fails within hours.',
  },
  macula: {
    name: 'Macula & Fovea', sub: 'Sharpest vision · the center spot',
    fn: 'A small dimple at the retina\'s exact center where cones reach their maximum density — <b>200,000 per mm²</b>. Whatever lands here is what you see in crisp detail; everything outside is the blurry periphery. Reading this text, recognizing a face, threading a needle — all fovea work. It is only ~1.5 mm wide yet does most of what we call "seeing", which is why macular degeneration is so devastating.',
  },
  opticNerve: {
    name: 'Optic Nerve', sub: 'The data cable · blind spot',
    fn: 'About 1.2 million nerve fibers bundled into a cable that carries the retina\'s signal to the brain\'s visual cortex. Where it exits the eye there are <b>no photoreceptors</b> — the optic disc, your <b>blind spot</b>. You never notice it because the brain paints over the gap. The two nerves partially cross at the chiasm so each brain half sees the opposite visual world — depth perception starts there.',
  },
  eyeMuscles: {
    name: 'Extraocular Muscles', sub: 'Six strings that aim the eye',
    fn: 'Six strap muscles bolted from the eye socket to the sclera — four <b>rectus</b> (up, down, left, right) and two <b>oblique</b> (torsion). They are the fastest and most precise muscles you own: a saccade whips the eye 100° in under 60 ms. They never rest — even in sleep they tug during REM. Reading this sentence fired thousands of tiny saccades, each re-aiming the fovea along the line.',
  },
}

export const EYE_LABELS: LabelDef[] = [
  { key: 'cornea', name: 'Cornea', sub: 'clear window', t: [0.0, 0.12, 1.52], a: [1.55, 0.85, 1.75] },
  { key: 'pupil', name: 'Pupil', sub: 'light gateway', t: [-0.02, -0.04, 1.42], a: [-1.05, -0.25, 1.85] },
  { key: 'iris', name: 'Iris', sub: 'colored aperture', t: [0.42, 0.3, 1.05], a: [1.35, 1.45, 0.95] },
  { key: 'lens', name: 'Lens', sub: 'fine focus', t: [0.0, -0.32, 0.62], a: [-1.3, -1.05, 0.85] },
  { key: 'ciliaryBody', name: 'Ciliary Body', sub: 'focus motor', t: [0.58, 0.18, 0.5], a: [1.75, 0.35, 0.1] },
  { key: 'sclera', name: 'Sclera', sub: 'the white', t: [0.75, 0.72, 0.15], a: [1.85, 1.7, -0.85] },
  { key: 'vitreous', name: 'Vitreous Humor', sub: 'support gel', t: [-0.45, 0.1, -0.35], a: [-1.85, 0.55, -1.15] },
  { key: 'retina', name: 'Retina', sub: 'light sensors', t: [-0.5, -0.55, -0.75], a: [-1.9, -1.25, -1.35] },
  { key: 'macula', name: 'Macula', sub: 'sharpest spot', t: [0.0, -0.05, -1.18], a: [0.5, -1.15, -2.0] },
  { key: 'opticNerve', name: 'Optic Nerve', sub: 'to the brain', t: [0.0, 0.18, -2.1], a: [1.0, 0.75, -2.5] },
  { key: 'eyeMuscles', name: 'Eye Muscles', sub: 'aiming straps', t: [-0.35, -1.15, -0.6], a: [-1.35, -2.0, -0.6] },
]

export const EYE_EXPLODE: Record<string, ExplodeDef> = {
  cornea: { d: [0, 0.15, 2.2] },
  pupil: { d: [0, 0.05, 1.95] },
  iris: { d: [0, 0.1, 1.6] },
  lens: { d: [0, 0, 1.15] },
  ciliaryBody: { d: [0, 0.5, 0.85] },
  vitreous: { d: [0, 0, 0.5] },
  sclera: { d: [0, 1.5, 0.15] },
  retina: { d: [0, -0.75, -0.7] },
  macula: { d: [0, -1.25, -1.3] },
  opticNerve: { d: [0, 0.15, -1.8] },
  eyeMuscles: { d: [0, -1.5, -0.35] },
}
