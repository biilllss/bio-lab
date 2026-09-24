import type { ExplodeDef, LabelDef, PartInfo } from '../../types'

export const SKIN_INFO: Record<string, PartInfo> = {
  epidermis: {
    name: 'Epidermis', sub: 'Outer shield · waterproof & self-renewing',
    fn: 'A <b>dead-tough armor you rebuild every month</b>. Its base layer divides nonstop, pushing cells outward on a ~4-week journey during which they die, flatten and weld into scaly <b>corneocytes</b> — the "brick wall" whose mortar of lipids keeps water in and germs out. It also brews <b>melanin</b>, your built-in sunscreen, and hosts <b>Langerhans cells</b>, immune sentries that sniff incoming pathogens. You shed about <b>500 million skin cells a day</b> — a big share of household dust is literally you.',
  },
  dermis: {
    name: 'Dermis', sub: 'Collagen factory · the living layer',
    fn: 'The skin\'s industrial floor: a dense felt of <b>collagen and elastin fibers</b> that makes skin both tear-resistant and stretchy. Everything you associate with "skin" lives here — blood vessels, nerves, hair roots, glands. Fibroblasts constantly re-weave the mesh; <b>UV damage scrambles the fibers</b> (that\'s a sunburn\'s long game — wrinkles). The dermis also stores your unique fingerprint ridges, formed before you were born.',
  },
  hypodermis: {
    name: 'Hypodermis', sub: 'Fat basement · insulation & cushion',
    fn: 'Not technically skin — it\'s the <b>subcutaneous fat layer</b> anchoring skin to muscle. Its lobules of adipose tissue are your <b>thermal underwear and airbag</b>: insulation against cold and a shock absorber for falls. It stockpiles energy, cushions pressure points (why your heels don\'t shatter), and is where insulin injections pool. Whales and seals show what a hypodermis can do when you max out the stat bar.',
  },
  hair: {
    name: 'Hair Shaft', sub: 'Dead keratin rope · pushed up from below',
    fn: 'The only visible part of the hair system — and it\'s <b>completely dead</b>: compressed keratin protein extruded like toothpaste from the follicle below. A shaft grows <b>~1 cm a month</b> for 2–6 years before its follicle rests and the hair falls. Keratin chains are cross-linked by disulfide bridges — break those with chemicals or heat and you have a perm or a burn. Goosebumps (see the arrector pili) can make each shaft stand up.',
  },
  follicle: {
    name: 'Hair Follicle', sub: 'Living root sheath · a hair factory',
    fn: 'A diagonal tunnel lined with epithelium, ending in a bulb where cells divide <b>faster than almost anywhere in the body</b> — a tumor-like growth rate that is, in fact, completely normal. Stem cells in a bulge near the surface regenerate both hair AND overlying skin after wounds. Each follicle has its own <b>arrector muscle, sebaceous gland and nerve basket</b> — you\'re looking at a full hair factory. You own ~5 million follicles; ~100 scalp hairs fall out daily.',
  },
  papilla: {
    name: 'Dermal Papilla', sub: 'The bulb\'s command center',
    fn: 'A fist of dermal cells poked up into the hair bulb, laced with capillaries. It <b>instructs the surrounding matrix cells</b> what to become — hair shaft, inner sheath or nothing — via molecular signals. Pull the papilla out and the hair is gone for good; keep it (like a preserved donor follicle in a transplant) and hair can regrow. Hormones talk to it directly: DHT shrinks scalp papillae (male-pattern baldness) while it super-sizes beard ones.',
  },
  arrector: {
    name: 'Arrector Pili', sub: 'Goosebump muscle · fight-or-flight leftover',
    fn: 'A slingshot of <b>smooth muscle</b> hooked between the follicle and the epidermis. When you\'re cold or scared, sympathetic nerves fire and it contracts — <b>yanking the hair upright</b> and dimpling the skin around it: goosebumps. In furry animals this traps an insulating air layer and makes the animal look bigger; in humans it\'s a vestigial reflex — your skin still running firmware written for a much hairier ancestor.',
  },
  sebaceous: {
    name: 'Sebaceous Gland', sub: 'Oil works · waterproofing & polish',
    fn: 'A cluster of fat-droplet cells that <b>explode themselves into sebum</b> — an oily blend of wax, cholesterol and triglycerides that waterproofs the hair shaft, keeps skin supple and feeds the skin\'s microbiome. It only kicks into high gear at <b>puberty</b> (androgen-driven), which is why teenagers shine. Clogged glands + bacteria = acne. Sebum also carries pheromones and contains <b>squalene</b>, a molecule so prized that sharks were hunted for it until olive oil was found to work.',
  },
  sweatGland: {
    name: 'Sweat Gland', sub: 'The coiled cooler · your radiator',
    fn: 'A deep coiled knot of tubes that <b>pulls water and salts from blood plasma</b> and hands them to the duct. You own <b>2–4 million</b> of these; under full load they can pour <b>up to 1.5 liters per hour</b> — the highest output of any gland in the body. The coil also reabsorbs salt before the fluid leaves, so sweat gets more dilute the harder you work. Emotional sweat (from apocrine glands in armpits) is a different, smellier product.',
  },
  duct: {
    name: 'Sweat Duct', sub: 'The elevator shaft · straight to the surface',
    fn: 'A narrow tube that spirals the gland\'s output up through the dermis and epidermis to a pore. As it climbs, its walls <b>re-absorb salt</b> (driven by the same sodium pumps as kidney tubules — the tissues are cousins), fine-tuning what reaches your skin. In cystic fibrosis, a broken chloride channel means salt never gets reclaimed — the <b>salty-kiss test</b> used to diagnose babies for decades. Block the duct (as with certain antiperspirants) and sweating stops locally.',
  },
  pore: {
    name: 'Sweat Pore', sub: 'The exit · where evaporation happens',
    fn: 'The duct\'s tiny trumpet-mouth on the surface — invisible without magnification, and <b>not</b> the craters people mean by "large pores" (those are follicle openings). Here sweat evaporates, and <b>evaporation is the cooling trick</b>: each gram of water leaving carries away ~2.4 kJ of heat. In humid air evaporation stalls — which is why 35 °C dry feels survivable and 35 °C tropical feels like a furnace. Fingerprints are pore + ridge patterns arranged for grip and sensing.',
  },
  vessel: {
    name: 'Dermal Blood Vessels', sub: 'The radiator plumbing · heat valve',
    fn: 'Two layered networks of vessels with <b>looping capillaries</b> reaching up to just under the epidermis, feeding every hair, gland and cell. They\'re also a <b>thermostat valve</b>: on a hot day vasodilation floods the loops with blood — your skin flushes red and radiates heat; in cold, <b>vasoconstriction</b> starves the skin to save your core (frostbite is the extreme version). This network is why embarrassment blots your face and why alcohol makes you feel warm while you\'re actually losing heat faster.',
  },
  nerve: {
    name: 'Nerve Endings', sub: 'Touch HQ · pressure, vibration, tickle',
    fn: 'Skin is your <b>largest sensory organ</b> — around <b>4 million sensory points</b>. Shallow <b>Meissner corpuscles</b> (the pale ovals near the surface) catch light touch and flutter; deep <b>Pacinian corpuscles</b> (the layered onions) sense vibration down to microns; bare nerve fibers wrap hairs and sense pain and temperature. Fingertips pack ~2,500 receptors per cm² — your brain devotes more cortex to them than to your whole back. Slow C-fibers even deliver the pleasant tingle of a gentle stroke.',
  },
}

export const SKIN_LABELS: LabelDef[] = [
  { key: 'epidermis', name: 'Epidermis', sub: 'waterproof shield', t: [-1.9, 1.18, 0.2], a: [-2.7, 1.95, 0.5] },
  { key: 'hair', name: 'Hair Shaft', sub: 'dead keratin', t: [1.04, 1.72, 0], a: [1.95, 2.02, 0.3] },
  { key: 'pore', name: 'Sweat Pore', sub: 'evaporation exit', t: [-1.16, 1.37, 0], a: [-1.95, 2.1, 0.35] },
  { key: 'arrector', name: 'Arrector Pili', sub: 'goosebump muscle', t: [0.56, 0.72, 0], a: [-0.1, 1.85, 0.55] },
  { key: 'dermis', name: 'Dermis', sub: 'collagen factory', t: [2.05, 0.6, 0.25], a: [2.9, 1.25, 0.55] },
  { key: 'follicle', name: 'Hair Follicle', sub: 'root sheath', t: [0.95, 0.32, 0], a: [1.9, 0.42, 0.7] },
  { key: 'sebaceous', name: 'Sebaceous Gland', sub: 'oil works', t: [0.45, 0.82, 0.06], a: [1.35, 1.05, 0.95] },
  { key: 'vessel', name: 'Dermal Vessels', sub: 'heat valve', t: [1.95, -0.35, -0.05], a: [2.85, -0.95, 0.4] },
  { key: 'papilla', name: 'Dermal Papilla', sub: 'growth engine', t: [0.95, -0.7, 0], a: [1.75, -1.3, 0.5] },
  { key: 'duct', name: 'Sweat Duct', sub: 'elevator shaft', t: [-1.3, 0.4, 0.01], a: [-2.15, 0.85, 0.6] },
  { key: 'sweatGland', name: 'Sweat Gland', sub: 'coiled cooler', t: [-1.5, -0.72, 0], a: [-2.4, -0.9, 0.55] },
  { key: 'nerve', name: 'Nerve Endings', sub: 'touch sensors', t: [-1.96, 0.85, 0.05], a: [-2.85, 0.35, 0.6] },
  { key: 'hypodermis', name: 'Hypodermis', sub: 'fat insulation', t: [-0.7, -1.15, 0.15], a: [-1.55, -1.95, 0.35] },
]

export const SKIN_EXPLODE: Record<string, ExplodeDef> = {
  epidermis: { d: [0, 0.9, 0.3] },
  dermis: { d: [0, 0.12, 0.55] },
  hypodermis: { d: [0, -0.8, 0.35] },
  hair: { d: [0.5, 1.3, 0] },
  follicle: { d: [0.75, 0.3, 0] },
  papilla: { d: [0.55, -0.45, 0.3] },
  arrector: { d: [0.1, 0.65, 0.5] },
  sebaceous: { d: [0.7, 0.5, 0.15] },
  sweatGland: { d: [-0.8, -0.4, 0.3] },
  duct: { d: [-0.45, 0.5, 0.4] },
  pore: { d: [-0.15, 1.1, 0.25] },
  vessel: { d: [0.6, -0.2, 0.45] },
  nerve: { d: [-0.6, -0.35, 0.45] },
}
