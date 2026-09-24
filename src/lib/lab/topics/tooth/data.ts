import type { ExplodeDef, LabelDef, PartInfo } from '../../types'

/**
 * THE TOOTH — eleventh topic. The hardest substance your body makes,
 * sliced open like the textbook diagram: a living lattice of enamel,
 * dentin and pulp pinned into bone by a shock-absorbing ligament.
 * Two systems — the Incisor (chisel, one root) and the Molar (grinder,
 * two roots, cusps, fissures and pulp horns).
 */

export const INCISOR_INFO: Record<string, PartInfo> = {
  enamel: {
    name: 'Enamel', sub: 'The armor coat · hardest substance in your body',
    fn: 'A <b>96% mineral</b> shell — the hardest thing your body ever builds, harder than steel by some measures. It has no cells and no nerves, so it cannot feel anything and it <b>cannot heal itself</b>: every chip and cavity is permanent. Its building blocks are <b>enamel rods</b> — millions of microscopic prisms packed side by side, each laid down by a single cell before the tooth ever erupted. Fluoride works here: it swaps into the crystal lattice and makes it <b>far harder to dissolve</b> in acid. Coffee, cola and citrus all etch it — the "wear" you see on old teeth is a lifetime of acid weathering.',
  },
  dentin: {
    name: 'Dentin', sub: 'The living ivory · makes up most of the tooth',
    fn: 'The tooth\'s real body — a yellowish <b>living bone-like tissue</b> that makes up nearly all of its bulk. Millions of microscopic <b>dentin tubules</b> run from the pulp outward through it, each carrying a flicker of fluid; when enamel wears thin, cold or sweet touches those tubules and you feel the jolt we call <b>sensitivity</b>. Unlike enamel, dentin <b>keeps growing</b> for life: the pulp lays down new inner dentin year after year, which is why the pulp chamber of an old tooth is visibly smaller on an X-ray. It is also surprisingly honest tissue — it aches, and it repairs.',
  },
  pulp: {
    name: 'Pulp Chamber', sub: 'The living heart · nerves & blood vessels',
    fn: 'The tooth\'s only living quarter: a small room of <b>nerves, blood vessels and connective tissue</b> in the crown\'s center. Everything the tooth "is" runs through here — the sensory alarm (those nerves report only one thing, <b>pain</b>, which is why toothaches are so blunt), the blood supply that feeds dentin, and the repair crews that grow new dentin. It is sealed in the hardest box in the body, so when it swells from infection there is <b>nowhere to expand</b> — that pressure is the legendary toothache. Root canal treatment is simply evicting this room\'s tenants and filling the space.',
  },
  canal: {
    name: 'Root Canal', sub: 'The buried corridor · pulp\'s passage down the root',
    fn: 'The pulp chamber\'s <b>long basement corridor</b>, running the full length of the root to the tip. It carries the nerve and vessels that entered through the apical foramen — every tooth\'s lifeline is threaded through solid jawbone to this one narrow door. It is also the source of the phrase\'s bad reputation: bacteria infiltrating the canal system cannot be reached by the immune system, so the infected canal must be <b>mechanically cleaned and sealed</b> — a root canal treatment. Treated properly, the tooth stays for decades; it just becomes a "dead" tooth with no more inner life.',
  },
  cementum: {
    name: 'Cementum', sub: 'The root\'s rough anchor coat',
    fn: 'A thin, bone-like jacket over the root\'s surface — dull, pale and easy to overlook, but it is the <b>glue surface of the whole tooth</b>. Millions of tiny fibers of the periodontal ligament are <b>embedded directly into it</b>, so cementum is literally what hangs the tooth from the jaw. It is about as hard as bone (much softer than enamel) and it <b>slowly grows</b> throughout life. If the gum recedes and exposes it, it wears away fast — exposed cementum is why root surfaces are so sensitive and cavity-prone in older teeth.',
  },
  ligament: {
    name: 'Periodontal Ligament', sub: 'The shock absorber · suspends the tooth in bone',
    fn: 'A paper-thin sling of <b>millions of collagen fibers</b> that hangs the tooth inside its socket — it never touches bone directly. This suspension is why teeth can move: braces work by remodeling this ligament under steady tension. It is also a <b>precision sensor</b>: biting on a single hair, you can feel it, because the ligament\'s nerves report loads as tiny as a few grams. When you chew hard food, the ligament compresses and protects both tooth and bone — the natural shock absorber that dental implants famously lack. Push a tooth with a finger: that tiny springy give is this ligament.',
  },
  bone: {
    name: 'Alveolar Bone', sub: 'The socket · jawbone built to hold teeth',
    fn: 'The piece of jawbone that <b>exists only to hold teeth</b> — it forms around them as they erupt and, remarkably, it <b>disappears when they leave</b>. Pull a tooth and within months the socket bone melts away (that\'s why dentures keep needing refits, and why implant placement is a race against bone loss). It is living, fast-remodeling bone: the same cells that dissolve it under a pushed tooth build it back elsewhere, which is the entire mechanical basis of <b>orthodontics</b>. Its crest — the wavy top edge — is the front line in gum disease: bone lost here never grows back.',
  },
  gum: {
    name: 'Gum (Gingiva)', sub: 'The pink collar · seal around the neck',
    fn: 'The tough pink <b>seal where tooth meets mouth</b> — a specialized skin cuff wrapped around each neck, knitted directly onto the enamel at the junction. Its job is containment: the whole socket world below is sterile-ish, and the gum is the <b>gasket keeping the bacteria out</b>. When plaque sits on this cuff too long it inflames (gingivitis — the bleeding you see when brushing), and chronic inflammation quietly <b>unzips the seal downward</b>, forming pockets: periodontitis. Healthy gums don\'t bleed. They are also, oddly, the fastest-healing skin in the mouth.',
  },
  nerve: {
    name: 'Nerve & Blood Supply', sub: 'The lifeline · enters through the root tip',
    fn: 'Every tooth\'s lifeline is a thin bundle of <b>artery, vein and nerve</b> threading through the solid jawbone, entering at the root tip. The artery feeds the pulp, the vein drains it, and the nerve is a one-channel alarm: it carries <b>only pain</b>, no touch, no temperature detail — which is why you can\'t "rub" a toothache better. The alarm wiring is famously sloppy: the brain often can\'t tell <b>which tooth</b> fired, so pain from a lower molar can feel like it came from the upper jaw — referred pain that can send patients to the wrong dentist chair.',
  },
  foramen: {
    name: 'Apical Foramen', sub: 'The doorway at the root tip',
    fn: 'The tiny hole at the very tip of the root — usually <b>under half a millimeter wide</b> — and the only doorway between the outside world of the jaw and the sealed pulp chamber. Artery in, vein out, nerve in: everything a tooth needs passes through this pinhole. Its position is a dentist\'s race line: root canal work must fill the canal <b>exactly to this door</b> — short leaves infected tissue behind, past it pokes into the jawbone. In a curious anatomy quirk the tip often curves and the foramen exits slightly to one side, which is why X-rays are checked from more than one angle.',
  },
}

export const MOLAR_INFO: Record<string, PartInfo> = {
  enamel: {
    name: 'Enamel', sub: 'The grinding armor · thickest at the cusps',
    fn: 'On a molar the enamel armor is at its thickest — up to <b>2.5 mm</b> over the cusps, where a lifetime of grinding force lands. It is folded into ridges and valleys like <b>quarry tiles</b>, a shape that interlocks food and shreds it between the opposing molars. Bite forces here reach <b>70–90 kg</b> — concentrated on a few square millimeters, endured by a brittle ceramic only because the tooth\'s whole suspension flexes a few microns with each chew. The famous weakness of the enamel: once cracked or dissolved, it is gone — no cells remain to rebuild it.',
  },
  cusps: {
    name: 'Cusps', sub: 'The grinding peaks · mortar-and-pestle points',
    fn: 'The rounded <b>mountain peaks</b> of the grinding table. Upper and lower molar cusps interlock in a preset pattern — like <b>mortar and pestle</b> — so food is crushed and sheared, not just flattened. Each cusp\'s name is a landmark for dentists (protocone, paracone…) and their exact fit matters: a high cusp after a filling throws the whole bite off and can crack a tooth within weeks. Evolution graded them too: shearing-crest cusps belong to insectivores, broad crushing basins to seed-eaters — your molars are a <b>mixed-diet compromise</b> hammered out over millions of years.',
  },
  fissure: {
    name: 'Pit & Fissure', sub: 'The groove valley · cavity headquarters',
    fn: 'The narrow groove <b>valley between the cusps</b> — and statistically the most cavity-prone real estate in the entire mouth. The groove is often narrower than a single toothbrush bristle, so <b>nothing cleans it</b>: food debris and bacteria sit at the bottom, digesting sugar into acid directly against thin enamel. This is why dentists offer <b>fissure sealants</b> — flowable resin painted into the groove before decay ever starts, a pavement-crack filler for teeth. Most first cavities in children begin here, which is why the "seal in sixth grade" slogan exists.',
  },
  dentin: {
    name: 'Dentin', sub: 'The living ivory under the armor',
    fn: 'The molar\'s bulk tissue — a living <b>bone-like ivory</b> riddled with millions of microscopic tubules radiating from the pulp. Under a molar\'s heavy loads the dentin is the real engineering: it is slightly <b>flexible</b>, and it cushions the brittle enamel shell the way the soft iron inside armor plate backs the hard face. When enamel is ground through, exposed dentin tubules flood you with sensitivity signals. It keeps <b>growing inward</b> for life, and it can even lay down extra "repair" dentin under a deep filling — the tooth\'s own patch concrete.',
  },
  pulp: {
    name: 'Pulp Chamber', sub: 'The living heart under the grinding table',
    fn: 'The molar\'s living quarter — a broad room of <b>nerves and vessels</b> directly under the grinding table, where bite forces of tens of kilograms land millimeters above it. Its nerves report exactly one sensation: <b>pain</b> — and molar pulp is the classic culprit of the "bad toothache" because its sealed chamber gives a swelling infection zero room. The chamber\'s size shrinks all life long as new dentin layers in, so an older molar\'s pulp on an X-ray looks like a <b>shrunken ghost</b> of a young one. Root canal treatment hollows this room and its corridors clean.',
  },
  horns: {
    name: 'Pulp Horns', sub: 'The pulp\'s watchtowers under the cusps',
    fn: 'Pointed towers of pulp reaching <b>up toward each cusp</b> — the chamber\'s tallest neighborhoods, closest to the grinding surface. They matter clinically: a deep cavity prepared in a cusp can break into a horn and expose the pulp, converting a filling into a <b>root canal</b> in one drill-stroke. In young teeth the horns are towering (the pulp chamber is huge in kids, which is why children\'s fillings go wrong faster); with age they <b>recede</b> as dentin fills in. On old X-rays the horns look like the chamber\'s little chimney stubs.',
  },
  cementum: {
    name: 'Cementum', sub: 'The anchor coat on trunk and roots',
    fn: 'The dull, bone-soft jacket over the root system — the surface into which the <b>periodontal ligament fibers bolt</b>. A molar carries this coat across its whole buried territory: the trunk between the cervical line and the furcation, plus <b>both roots</b> down to their tips. It grows slowly for life, adding microscopic rings like a tree. Its weakness: it is nearly as soft as bone, so when the gum line recedes and exposes it, it <b>brushes away and dissolves</b> quickly — root-surface cavities in older adults start exactly here.',
  },
  ligament: {
    name: 'Periodontal Ligament', sub: 'The twin suspension · hangs both roots in bone',
    fn: 'The paper-thin fiber sling that suspends <b>each root</b> inside its socket — a molar\'s suspension has two bays, joined over the furcation. Its fibers are angled like <b>crane rigging</b>: chewing loads press the root into the sling, and the fibers convert the force into a gentle pull that stimulates bone — teeth under healthy load keep their bone; teeth that stop chewing (or lose their antagonist) slowly lose it. The ligament\'s proprioceptors are so fine you can <b>feel a hair between your molars</b>. Braces steer whole molars through the jaw by remodeling this sling.',
  },
  bone: {
    name: 'Alveolar Bone', sub: 'The socket walls · built for teeth, lost with them',
    fn: 'The jawbone\'s tooth-holding section, rising as two socket walls around the molar\'s roots and a ridge between them under the furcation. It is <b>fast-remodeling living bone</b>: under steady pressure from a brace it dissolves on one side and builds on the other, walking a molar across the jaw. It exists only for the teeth — extract them and the socket walls <b>resorb away</b> within months, which shapes every denture and implant plan. Gum disease\'s quiet damage is measured exactly here: bone crest height, once lost, is permanent.',
  },
  gum: {
    name: 'Gum (Gingiva)', sub: 'The collar over the wide molar neck',
    fn: 'The pink gasket cuffing the molar\'s broad neck to the enamel — thicker and tougher here than on an incisor, because molars take the <b>heaviest chewing loads</b> and the seal must survive them. Its stippled surface (like orange peel) is the classic sign of health; shiny, puffy cuffs signal the inflammation of <b>gingivitis</b>. Below the collar lies the sulcus — a millimeter-deep moat that a toothbrush bristle can just reach. Let plaque camp in that moat and the seal unzips into periodontal <b>pockets</b>, the trenches of chronic gum disease.',
  },
  canal: {
    name: 'Root Canals', sub: 'Twin corridors down both roots',
    fn: 'A molar\'s pulp sends <b>one corridor down each root</b> — and molars keep secrets here: canals can curve, split, and hide extra branches that X-rays barely show. Every root canal treatment is a search-and-seal mission through this branching maze; a missed micro-canal is the classic reason a treated tooth re-infects. The corridors carry the lifeline that entered through the tips: artery, vein, nerve. Sealed clean and full, a treated molar keeps chewing for decades — it just loses its <b>inner living tenant</b> and its pain alarm.',
  },
  furcation: {
    name: 'Furcation', sub: 'The fork where one root becomes two',
    fn: 'The <b>Y-fork</b> where the molar\'s root trunk splits into separate roots — a tiny cave under the pulp chamber, roofed by dentin and floored by bone. It is a hidden weak point: gum disease that creeps down the root can invade the furcation cave, and once bone is lost <b>inside a fork</b>, cleaning and saving the tooth gets dramatically harder (dentists grade furcation involvement I to III). Its presence is also the molar\'s signature: incisors and canines never fork. In root canal anatomy the furcation floor often hides <b>extra canal openings</b>.',
  },
  nerve: {
    name: 'Nerve & Blood Supply', sub: 'The lifeline threading to both root tips',
    fn: 'A bundle of <b>artery, vein and nerve</b> threads through the jawbone, enters at the furcation region and divides — one lifeline down each root canal to the tips. Molar nerves are the mouth\'s loudest alarm and its most confusing: pain from a lower molar often <b>radiates to the ear</b>, and which of the three molars is shouting is notoriously hard for the brain to localize (hence dentists\' "tap test" and cold-spray detective work). The artery feeding each molar pulp is a true end-artery: cut it off, and the pulp <b>dies quietly</b> — the tooth keeps standing, but its living core is gone.',
  },
}

export const INCISOR_LABELS: LabelDef[] = [
  { key: 'enamel', name: 'Enamel', sub: 'hardest substance', t: [0.42, 1.28, -0.3], a: [1.65, 1.85, 0.4] },
  { key: 'dentin', name: 'Dentin', sub: 'living ivory', t: [0.43, 0.7, -0.3], a: [1.85, 0.75, 0.5] },
  { key: 'gum', name: 'Gum', sub: 'pink seal', t: [0.62, 0.28, -0.25], a: [1.55, -0.05, 0.5] },
  { key: 'cementum', name: 'Cementum', sub: 'anchor coat', t: [0.36, -0.5, -0.38], a: [1.45, -0.7, 0.5] },
  { key: 'ligament', name: 'Periodontal Ligament', sub: 'shock absorber', t: [0.42, -1.25, -0.42], a: [1.3, -1.55, 0.5] },
  { key: 'bone', name: 'Alveolar Bone', sub: 'the socket', t: [1.25, -0.85, -0.35], a: [2.2, -0.3, 0.5] },
  { key: 'pulp', name: 'Pulp Chamber', sub: 'living heart', t: [0.18, 0.55, -0.2], a: [-1.2, 0.95, 0.5] },
  { key: 'canal', name: 'Root Canal', sub: 'buried corridor', t: [0.09, -1.45, -0.12], a: [-1.25, -1.75, 0.5] },
  { key: 'foramen', name: 'Apical Foramen', sub: 'tip doorway', t: [0.02, -2.55, -0.12], a: [1.1, -2.6, 0.5] },
  { key: 'nerve', name: 'Nerve & Blood Supply', sub: 'the lifeline', t: [0.1, -3.0, -0.11], a: [-1.45, -2.85, 0.5] },
]

export const MOLAR_LABELS: LabelDef[] = [
  { key: 'cusps', name: 'Cusps', sub: 'grinding peaks', t: [0.38, 1.48, -0.28], a: [1.75, 1.95, 0.4] },
  { key: 'fissure', name: 'Pit & Fissure', sub: 'cavity HQ', t: [0.0, 1.31, -0.28], a: [-1.5, 1.95, 0.45] },
  { key: 'enamel', name: 'Enamel', sub: 'grinding armor', t: [0.82, 0.85, -0.3], a: [1.95, 0.95, 0.5] },
  { key: 'dentin', name: 'Dentin', sub: 'living ivory', t: [0.72, 0.25, -0.3], a: [1.9, 0.1, 0.5] },
  { key: 'gum', name: 'Gum', sub: 'pink collar', t: [1.02, 0.55, -0.3], a: [1.6, 1.35, 0.5] },
  { key: 'bone', name: 'Alveolar Bone', sub: 'socket walls', t: [1.45, -1.15, -0.35], a: [2.35, -0.65, 0.5] },
  { key: 'ligament', name: 'Periodontal Ligament', sub: 'twin suspension', t: [0.75, -1.7, -0.35], a: [1.55, -2.0, 0.5] },
  { key: 'cementum', name: 'Cementum', sub: 'anchor coat', t: [0.72, -1.3, -0.3], a: [1.5, -0.95, 0.55] },
  { key: 'pulp', name: 'Pulp Chamber', sub: 'living heart', t: [0.3, 0.45, -0.2], a: [-1.15, 0.75, 0.5] },
  { key: 'horns', name: 'Pulp Horns', sub: 'pulp watchtowers', t: [-0.32, 0.95, -0.2], a: [-1.55, 1.45, 0.5] },
  { key: 'furcation', name: 'Furcation', sub: 'the root fork', t: [0, -1.05, -0.15], a: [-1.35, -0.45, 0.55] },
  { key: 'canal', name: 'Root Canals', sub: 'twin corridors', t: [-0.44, -1.75, -0.18], a: [-1.6, -1.55, 0.5] },
  { key: 'nerve', name: 'Nerve & Blood Supply', sub: 'the lifeline', t: [0.05, -2.9, -0.18], a: [-1.5, -2.75, 0.5] },
]

export const INCISOR_EXPLODE: Record<string, ExplodeDef> = {
  enamel: { d: [0, 0.8, 0.55] },
  dentin: { d: [0.5, 0.35, 0.9] },
  pulp: { d: [-0.55, 0.8, 0.7] },
  canal: { d: [-0.7, -0.4, 0.7] },
  cementum: { d: [0.85, -0.5, 0.6] },
  ligament: { d: [1.0, -1.0, 0.5] },
  bone: { d: [0.85, -0.2, 0.4], p: 1 },
  gum: { d: [0, 1.0, 0.45] },
  nerve: { d: [-0.5, -0.9, 0.5] },
  foramen: { d: [0.6, -0.9, 0.5] },
}

export const MOLAR_EXPLODE: Record<string, ExplodeDef> = {
  cusps: { d: [0, 0.95, 0.5], p: 1 },
  fissure: { d: [0, 0.7, 0.65] },
  enamel: { d: [0.55, 0.55, 0.85] },
  dentin: { d: [0, 0.25, 0.95] },
  pulp: { d: [-0.45, 0.7, 0.7] },
  horns: { d: [-0.75, 1.0, 0.55], p: 1 },
  gum: { d: [0, 1.1, 0.4] },
  bone: { d: [0.9, -0.25, 0.4], p: 1 },
  ligament: { d: [0.85, -0.55, 0.5], p: 1 },
  cementum: { d: [0.7, -0.75, 0.55], p: 1 },
  canal: { d: [-0.5, -0.7, 0.6], p: 1 },
  furcation: { d: [0, -0.45, 0.8] },
  nerve: { d: [0.35, -1.0, 0.5] },
}
