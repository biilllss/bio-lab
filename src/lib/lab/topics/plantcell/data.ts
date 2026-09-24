import type { ExplodeDef, LabelDef, PartInfo } from '../../types'

/**
 * THE PLANT CELL — tenth topic. Non-human variety: a walled green city.
 * 13 quizable parts: cellulose wall, membrane, cytoplasm, the nucleus
 * trio (shell · nucleolus · chromatin), the giant water vacuole,
 * chloroplasts, a mitochondrion, Golgi stacks, rough ER, ribosome
 * dust and plasmodesmata drilling through the wall.
 */

export const PLANT_INFO: Record<string, PartInfo> = {
  wall: {
    name: 'Cell Wall', sub: 'Cellulose armor · the reason salad crunches',
    fn: 'A rigid corset of <b>cellulose fibers</b> — sugar chains cross-linked into cables stronger than steel by weight. Animal cells burst in pure water; plant cells simply pressurize, because the wall holds. That internal water pressure (<b>turgor</b>) is what keeps lettuce crisp and celery upright — wilted salad is just low tire pressure. Wood is wall material reinforced with <b>lignin</b>, which is why trees can out-tower any animal that ever lived. The wall also predates humans by <b>over a billion years</b>: plants never needed a skeleton to stand up.',
  },
  membrane: {
    name: 'Cell Membrane', sub: 'The border checkpoint · just inside the wall',
    fn: 'A <b>double layer of fat molecules</b> two engines thick — the actual boss of what enters and leaves, because the porous wall lets almost anything through. Its proteins are gatekeepers, pumps and antennas: glucose transporters, water channels, hormone receivers. This is where the "fluid mosaic" lives — molecules drift around like boats on a lipid sea. It also <b>seals wounds</b>: poke it and vesicles rush to patch the hole in seconds, a trick animal cells copied.',
  },
  cytoplasm: {
    name: 'Cytoplasm', sub: 'The busy gel · where everything floats',
    fn: 'Not plain water — a <b>crowded gel</b> packed with proteins at concentrations that would crash out of solution anywhere else. It streams: the whole fluid circulates around the cell on <b>actin railroad tracks</b> (watch the organelles drift in the shimmer — that is real, it is called cyclosis). It is also the cell\'s chemical reactor pool: <b>glycolysis</b>, the first stage of burning sugar, happens right here in the open fluid, before any organelle gets involved.',
  },
  nucleus: {
    name: 'Nucleus', sub: 'The archive vault · DNA library & HQ',
    fn: 'The cell\'s <b>command archive</b>: two membrane shells studded with pores, guarding <b>~2 meters of DNA</b> coiled inside — every gene this plant owns. The pores are among biology\'s most selective doors, actively carding each protein that passes. The nucleus doesn\'t just store instructions; it runs the <b>transcription boomtown</b> where DNA is read into RNA messengers that ship out through the pores to the ribosome factories. Plants famously keep <b>extra genomes</b> in their chloroplasts and mitochondria — this vault is only HQ, not the whole archive.',
  },
  nucleolus: {
    name: 'Nucleolus', sub: 'Ribosome factory inside the vault',
    fn: 'A dense knot <b>inside</b> the nucleus where ribosomes are born — the loudest construction site in the cell. Here the genes for ribosomal RNA are transcribed in huge synchronized choirs (a single plant nucleolus builds <b>thousands of ribosomes a minute</b>), welded to imported proteins, and shipped out as half-built factories. It is so active it is visible in ordinary microscopes without any stain — Darwin\'s contemporaries drew it in the 1830s and had no idea it was a factory.',
  },
  chromatin: {
    name: 'Chromatin', sub: 'DNA threads · spooled like thread on beads',
    fn: 'The DNA itself, seen the only way it ever fits: wrapped around <b>histone protein spools</b> like thread on bobbins, beaded into coils, folded into loops. This packing is not passive — a gene squeezed tight stays silent, a loosened loop gets read, so <b>chromatin shape is a volume knob for the whole genome</b>. When the cell divides it condenses another thousandfold into the X-shaped chromosomes you know from textbook diagrams — the only time DNA is ever visible as separate pieces.',
  },
  vacuole: {
    name: 'Central Vacuole', sub: 'The water bubble · pressure tank & pantry',
    fn: 'The organelle that <b>dominates</b> the plant cell — up to <b>90% of its volume</b>, a pressurized bubble of water, salts, sugars and pigments held by its own membrane (the tonoplast). It is half water tower, half landfill: recycling dumps worn-out proteins here, and it stores the nastiest chemicals as <b>chemical warfare</b> — bitter tannins, latex, even cyanide precursors, which is why plants are toxic as often as they are tasty. When it drinks, the cell swells; when it drains, the cell wilts. Grape cells are basically vacuoles with a sideline in sugar.',
  },
  chloroplast: {
    name: 'Chloroplast', sub: 'The green solar panels · sunlight → sugar',
    fn: 'The reason the world is green and you are not a rock. Each lens-shaped factory stacks internal discs (<b>grana</b>, the darker coins inside) loaded with chlorophyll that <b>captures photons</b> and strips electrons from water — releasing the oxygen you are breathing right now. The energy then runs the Calvin cycle, <b>gluing CO₂ into sugar</b>. A leaf runs billions of these reactors per square centimeter at ~1% solar efficiency — modest, but it powers nearly <b>every food chain on Earth</b>. Chloroplasts were once free-living bacteria; they kept their own DNA and still divide in two like them.',
  },
  mitochondrion: {
    name: 'Mitochondrion', sub: 'Power plant · sugar → ATP',
    fn: 'The chloroplast\'s debtor: it <b>burns the sugar</b> the chloroplast makes, wringing out <b>ATP</b> — the universal energy currency every organelle spends. Its inner wall is folded into <b>cristae</b> (the pleats inside) to cram in maximum reaction surface, like a radiator folded to fit in a suitcase. Your muscle and brain cells are stuffed with them; root cells stack them around their sugar-transport highways. It was a captured bacterium too — chloroplasts and mitochondria are the two great <b>ancient mergers</b> that built complex life.',
  },
  golgi: {
    name: 'Golgi Apparatus', sub: 'The post office · label, pack, ship',
    fn: 'A stack of curved, pita-flat sacs that <b>receives products from the ER, edits them, and mails them out</b>. Sugars are added like address labels: one tag ships a protein to the membrane, another routes it to the vacuole, another says "export outside". In plants it has a second, huge job: <b>building the cell wall itself</b> — the pectin and hemicellulose fibers are packed here and ferried out in vesicles. Without the Golgi, a plant cell literally cannot grow a wall.',
  },
  er: {
    name: 'Endoplasmic Reticulum', sub: 'The workshop maze · make & fold proteins',
    fn: 'A labyrinth of folded tubes continuous with the nuclear shell — the cell\'s <b>industrial workshop</b>. The "rough" kind (the dots on it are ribosomes) makes <b>every protein destined for export or for membranes</b>; the smooth kind brews lipids and detoxifies. Its interior folds force new proteins into their correct 3D shapes and refuse broken ones — quality control at the assembly line. In seeds, the ER doubles as an <b>oil refinery</b>: cooking-oil molecules are bottled here.',
  },
  ribosome: {
    name: 'Ribosomes', sub: 'The 3D printers · RNA → protein',
    fn: 'The smallest machines in the picture and the most important: each is a two-part clamp that <b>reads RNA three letters at a time and welds the matching amino acid</b> onto a growing chain — pure protein 3D printing, running at <b>~20 amino acids per second</b>. A single cell carries <b>millions</b>; they float free in the cytoplasm or stud the ER like spikes. Their design is so universal and so ancient that comparing ribosomes between species is how biologists trace the <b>tree of life</b> — and why many antibiotics simply attack bacterial ribosomes and not yours.',
  },
  plasmodesma: {
    name: 'Plasmodesmata', sub: 'Secret tunnels through the wall',
    fn: 'Tiny channels drilled straight <b>through the wall</b> into the neighboring cell, lined by the membrane — the reason plants cheat: individually walled cells still <b>share cytoplasm</b>. Sugars, RNA signals and even whole proteins travel through these doorways; a plant virus hijacks them to spread, and the plant fights back by <b>corking them</b> (callose plugs). They make a plant a "supercell" — a supervised federation where neighbors trade directly instead of signaling across membranes. No animal cell does anything quite like this.',
  },
}

export const PLANT_LABELS: LabelDef[] = [
  { key: 'wall', name: 'Cell Wall', sub: 'cellulose armor', t: [1.9, -1.28, 0.35], a: [2.75, -1.85, 0.55] },
  { key: 'membrane', name: 'Cell Membrane', sub: 'border checkpoint', t: [-1.85, -1.02, 0.3], a: [-3.05, 0.3, 0.55] },
  { key: 'chloroplast', name: 'Chloroplast', sub: 'solar panel', t: [-1.7, 0.88, 0.28], a: [-2.55, 1.45, 0.5] },
  { key: 'nucleus', name: 'Nucleus', sub: 'DNA vault', t: [1.35, 0.5, 0.14], a: [2.15, 1.35, 0.5] },
  { key: 'nucleolus', name: 'Nucleolus', sub: 'ribosome factory', t: [1.44, 0.58, 0.12], a: [1.15, 1.7, 0.6] },
  { key: 'chromatin', name: 'Chromatin', sub: 'spooled DNA', t: [1.05, 0.32, 0.1], a: [1.95, -0.35, 0.6] },
  { key: 'vacuole', name: 'Central Vacuole', sub: 'pressure tank', t: [-0.5, -0.1, 0.4], a: [-0.9, 0.95, 0.75] },
  { key: 'ribosome', name: 'Ribosomes', sub: '3D printers', t: [-0.35, -1.05, 0.15], a: [-1.3, -0.35, 0.9] },
  { key: 'golgi', name: 'Golgi', sub: 'post office', t: [2.02, 0.9, 0.12], a: [2.7, 1.62, 0.45] },
  { key: 'er', name: 'ER', sub: 'workshop maze', t: [0.62, 0.78, 0.1], a: [0.05, 1.55, 0.7] },
  { key: 'mitochondrion', name: 'Mitochondrion', sub: 'power plant', t: [-1.75, -0.78, -0.08], a: [-2.6, -0.5, 0.55] },
  { key: 'cytoplasm', name: 'Cytoplasm', sub: 'streaming gel', t: [0.55, -0.62, 0.25], a: [1.35, -0.95, 0.95] },
  { key: 'plasmodesma', name: 'Plasmodesmata', sub: 'wall tunnels', t: [-2.55, 0.55, 0.15], a: [-2.55, 1.25, 0.7] },
]

export const PLANT_EXPLODE: Record<string, ExplodeDef> = {
  wall: { d: [0, 0.7, 0.95] },
  membrane: { d: [0, 0.32, 0.7] },
  cytoplasm: { d: [0, -0.3, 0.5] },
  plasmodesma: { d: [-0.85, 0.55, 0.7] },
  chloroplast: { d: [0.35, -1.0, 0.6] },
  nucleus: { d: [1.05, 0.6, 0.45] },
  nucleolus: { d: [0.85, 0.45, 0.8] },
  chromatin: { d: [1.2, 0.75, 0.25] },
  er: { d: [1.3, 0.3, 0.2] },
  golgi: { d: [1.0, 0.95, 0.35] },
  vacuole: { d: [-0.85, -0.35, 0.35] },
  mitochondrion: { d: [-0.95, -0.85, 0.45] },
  ribosome: { d: [-0.45, 1.0, 0.55] },
}
