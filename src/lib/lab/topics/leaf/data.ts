import type { ExplodeDef, LabelDef, PartInfo } from '../../types'

/**
 * PHOTOSYNTHESIS LEAF — twelfth topic. The classic leaf cross-section
 * brought to 3D: waxy cuticle, transparent epidermis bricks, palisade
 * towers packed with chloroplasts, a loose spongy layer riddled with
 * air corridors, a vascular vein bundle (xylem plumbing up, phloem
 * shipping out) and breathing stomata guarded by kidney cells on the
 * underside. Partners the Plant Cell — the grana from that topic do
 * the actual sugar-making here.
 */

export const LEAF_INFO: Record<string, PartInfo> = {
  cuticle: {
    name: 'Cuticle', sub: 'The waxy raincoat · topmost film',
    fn: 'A translucent film of <b>waxes and cutin</b> secreted by the epidermis — the leaf\'s waterproof jacket. Its whole job is <b>slowing water loss</b>: without it, a leaf would evaporate into a crisp husk within hours. Desert plants (olive, succulents) wear it thick and shiny enough to glisten; shade plants keep it barely there. It is also the reason water beads off a lotus leaf — a super-polished cuticle plus microscopic bumps make water roll and <b>self-clean</b> (the "lotus effect", now copied for paints and fabrics). Notice it sits ABOVE the epidermis: the leaf\'s first and last line of defense.',
  },
  upperEpi: {
    name: 'Upper Epidermis', sub: 'The transparent windshield',
    fn: 'A single row of <b>brick-flat, colorless cells</b> — deliberately transparent, because their job is to let light through, not to catch it. They\'re fitted edge-to-edge like paving stones with almost no gaps, sealing the leaf\'s top surface against evaporation and invaders while the cuticle polishes the outside. Some of these cells grow into <b>trichomes</b> (leaf hairs) that shade the surface, baffle insects or sting herbivores — nettle stings are epidermal hypodermic needles. Stomata are rare on the upper surface: putting your airways on your sunny side would be an evaporation disaster.',
  },
  palisade: {
    name: 'Palisade Mesophyll', sub: 'The solar array · tall green towers',
    fn: 'The leaf\'s power district: <b>tall, tightly packed columns of green cells</b> standing upright just under the upper epidermis, like solar panels racked toward the light. Their shape is the point — long vertical cells hold <b>more chloroplasts near the top surface</b> than any other arrangement, and this thin layer performs the <b>majority of the leaf\'s photosynthesis</b>. The cells can even shift their chloroplasts up and down through the day: crowding to the shaded side at noon to avoid sunburn, spreading out in dim light to catch every photon. There is no animal tissue remotely like it.',
  },
  chloroplast: {
    name: 'Chloroplasts', sub: 'The green solar engines · light → sugar',
    fn: 'The reason leaves are green and you get to breathe. Each lens-shaped factory stacks internal discs (<b>grana</b> — the darker coins inside) loaded with chlorophyll that <b>captures photons</b>, splits water, and releases the oxygen in this room right now. The energy then runs the Calvin cycle, <b>gluing CO₂ into sugar</b>. A single palisade cell can hold <b>over a hundred</b> of these; a leaf runs billions per square centimeter. Chloroplasts were once free-living bacteria — they kept their own DNA and still divide in two like them, the same ancient merger that built the plant cell\'s mitochondrion.',
  },
  vein: {
    name: 'Vein (Vascular Bundle)', sub: 'The supply line · plumbing + shipping',
    fn: 'The leaf\'s combined <b>water main and freight line</b>, embedded in the mesophyll where every cell is within a few cells\' reach of it. Two tissues share the bundle, strictly separated: <b>xylem</b> on the upper side hauling water up from the roots, <b>phloem</b> underneath loading up the finished sugar. A fibrous <b>bundle sheath</b> wraps the whole thing, regulating what passes between plumbing and tissue. In the whole leaf these bundles branch finer and finer — veins, veinlets, endings — until <b>no cell is ever more than a few cells away from a water tap and a loading dock</b>.',
  },
  xylem: {
    name: 'Xylem', sub: 'The water pipes · roots → leaf, one-way up',
    fn: 'Dead hollow tubes stacked end to end — <b>the plant\'s plumbing is literally wood</b>, reinforced with the same lignin as tree trunks. It has no pump: water climbs on <b>evaporation alone</b>: each water molecule leaving the leaf tugs the next one up a chain that runs unbroken from your fingertip to the root tip (the <b>transpiration stream</b>). This "cohesion-tension" engine lifts water <b>over a hundred meters</b> in the tallest trees with zero moving parts — an achievement no human pump of that era matches. Watch the blue route: that upward flow runs all day, every day.',
  },
  phloem: {
    name: 'Phloem', sub: 'The sugar pipeline · leaf → everywhere else',
    fn: 'The leaf\'s <b>loading dock</b>: living tube cells (kept alive by companion cells) that ship the sugar the mesophyll makes to every corner of the plant — roots that never see light, buds, fruits, seeds. Flow here is <b>active, two-way and pressurized</b>: the leaf loads sugar in, water rushes in after it, and pressure squeezes the sap along to wherever it\'s being unloaded (the "pressure-flow" model). This is why aphids can stab a single phloem tube and drink <b>pure plant syrup</b> straight from the tap. Without phloem, the leaf\'s sugar would be a local surplus and the rest of the plant would starve.',
  },
  spongy: {
    name: 'Spongy Mesophyll', sub: 'The airy maze · loose green cells',
    fn: 'Below the palisade towers the architecture flips: <b>irregular cells, loosely packed</b>, leaving a labyrinth of air corridors between them. These cells still photosynthesize, but their real job is <b>gas exchange logistics</b>: every cell is coated on its air-facing side with a thin film of water, so CO₂ dissolves and diffuses straight into them from the air in the gaps. The round, jumbled shape maximizes <b>wet surface area per volume</b> — the same trick your lung alveoli use. Spongy layers are thicker on the leaf\'s shaded underside, where light is weak but air is plentiful.',
  },
  airSpace: {
    name: 'Air Spaces', sub: 'The diffusion corridors · sub-stomatal chambers',
    fn: 'The leaf\'s <b>internal atmosphere</b> — interconnected air halls under the stomata where incoming CO₂ spreads out before dissolving into the wet cell walls. They connect to the outside world <b>only through the stomata</b>, so the whole leaf\'s air is a managed reservoir: humid, CO₂-enriched, oxygen-drained — exactly the gradient photosynthesis wants. The air is also <b>water-vapor saturated</b>, which is why an open stoma leaks water relentlessly; the plant spends its whole life balancing CO₂ income against water loss through these rooms. Humidity inside a leaf: essentially 100%.',
  },
  lowerEpi: {
    name: 'Lower Epidermis', sub: 'The perforated floor · stoma territory',
    fn: 'The leaf\'s underside skin — like the upper epidermis but <b>punctured with stomatal pores</b>, often at ten to thirty times the density of the top. This asymmetry is engineering: airways live on the shaded, cooler, wind-sheltered side, where opening them costs the least water. The layer also senses the world — epidermal cells trigger stomatal closing during drought before the leaf wilts. In many leaves you can see the pattern with the naked eye: hold a leaf up to the light and the underside shows <b>tiny breathing mouths by the thousand</b>.',
  },
  guardCell: {
    name: 'Guard Cells', sub: 'The kidney gatekeepers · open & close each pore',
    fn: 'Two kidney-shaped cells flanking every stoma — the only epidermal cells with chloroplasts, and among the most sophisticated sensors in the plant. They <b>pump potassium ions in, water follows, they swell — and the pore opens</b>; pump ions out and they go limp, closing the pore. Light, CO₂ level, humidity and internal clock all feed into this valve. Guard cells balance an impossible trade: open wide for photosynthesis and lose water; close tight for drought and starve. Some plants open their stomata <b>only at night</b> (CAM plants) to steal CO₂ in the cool desert dark.',
  },
  stoma: {
    name: 'Stoma', sub: 'The breathing pore · CO₂ in, O₂ & water out',
    fn: 'The leaf\'s only doorway to the outside air — typically <b>under half a millimeter wide</b>, a few hundred of them per square millimeter. Through this one opening flows everything: <b>CO₂ in</b> for photosynthesis, <b>O₂ out</b> (the waste product you\'re breathing right now), and — unavoidably — <b>water vapor out</b> in a stream the plant can barely afford. That evaporative stream isn\'t waste, though: it\'s the engine that pulls water up the xylem from the roots, and the leaf\'s own air conditioning. A single maize leaf can pass <b>tons of water</b> in a season through its stomatal doors.',
  },
}

export const LEAF_LABELS: LabelDef[] = [
  { key: 'cuticle', name: 'Cuticle', sub: 'waxy raincoat', t: [1.85, 0.98, 0.1], a: [2.45, 1.6, 0.4] },
  { key: 'upperEpi', name: 'Upper Epidermis', sub: 'transparent windshield', t: [-1.85, 0.72, 0.1], a: [-2.5, 1.5, 0.4] },
  { key: 'palisade', name: 'Palisade Mesophyll', sub: 'solar towers', t: [-2.05, 0.15, 0.18], a: [-2.7, 0.1, 0.5] },
  { key: 'chloroplast', name: 'Chloroplasts', sub: 'solar engines', t: [1.35, 0.25, 0.2], a: [2.25, 0.8, 0.5] },
  { key: 'vein', name: 'Vein Bundle', sub: 'supply line', t: [0.55, 0.6, 0.1], a: [1.15, 1.45, 0.5] },
  { key: 'xylem', name: 'Xylem', sub: 'water pipes', t: [-0.18, 0.34, 0.2], a: [-1.0, 1.4, 0.5] },
  { key: 'phloem', name: 'Phloem', sub: 'sugar pipeline', t: [0.12, -0.14, 0.2], a: [0.95, -0.5, 0.55] },
  { key: 'spongy', name: 'Spongy Mesophyll', sub: 'airy maze', t: [-1.9, -0.42, 0.1], a: [-2.85, -0.6, 0.5] },
  { key: 'airSpace', name: 'Air Spaces', sub: 'diffusion halls', t: [-1.3, -0.52, 0.18], a: [-1.7, -2.2, 0.5] },
  { key: 'lowerEpi', name: 'Lower Epidermis', sub: 'perforated floor', t: [2.0, -0.8, 0.1], a: [2.7, -0.5, 0.55] },
  { key: 'guardCell', name: 'Guard Cells', sub: 'kidney gatekeepers', t: [-1.47, -1.0, -0.05], a: [-0.95, -1.8, 0.5] },
  { key: 'stoma', name: 'Stoma', sub: 'breathing pore', t: [1.2, -1.02, 0.0], a: [1.75, -1.75, 0.5] },
]

export const LEAF_EXPLODE: Record<string, ExplodeDef> = {
  cuticle: { d: [0, 0.95, 0.3] },
  upperEpi: { d: [0, 0.55, 0.5] },
  palisade: { d: [0, 0.3, 0.85] },
  chloroplast: { d: [0, 0.8, 1.05] },
  vein: { d: [0, 0.05, 1.15] },
  xylem: { d: [0, 0.45, 1.25] },
  phloem: { d: [0, -0.35, 1.25] },
  spongy: { d: [0, -0.45, 0.8] },
  airSpace: { d: [0, -0.15, 1.0] },
  lowerEpi: { d: [0, -0.85, 0.5] },
  guardCell: { d: [0, -1.0, 0.9], p: 1 },
  stoma: { d: [0, -1.2, 0.55] },
}
