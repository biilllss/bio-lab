import type { ExplodeDef, LabelDef, PartInfo } from '../../types'

export const KIDNEY_INFO: Record<string, PartInfo> = {
  cortex: {
    name: 'Renal Cortex', sub: 'Outer layer · where filtering begins',
    fn: 'The grainy reddish shell of the kidney, packed with over a <b>million glomeruli</b> — one tiny pressure filter per nephron. Every drop of your blood passes through this layer roughly <b>30 times a day</b>, and each pass gives it a chance to be scrubbed. The cortex also makes the hormone <b>erythropoietin (EPO)</b>, which tells your bone marrow to produce red blood cells — the reason altitude training boosts your oxygen capacity.',
  },
  medulla: {
    name: 'Renal Medulla', sub: 'Inner region · the concentrating engine',
    fn: 'The kidney\'s inner works, arranged in striped, pyramid-like sections. Its job is <b>water conservation</b>: it maintains one of the saltiest tissues in your body (up to 4× blood salinity) by trading salts and urea in counted loops. This gradient is what lets you produce urine <b>more concentrated than seawater</b> when you\'re dehydrated — a desert-rat superpower your kidneys run silently all night.',
  },
  pyramid: {
    name: 'Renal Pyramid', sub: 'Striped collectors · urine drip channels',
    fn: '8–18 triangular, striped structures fanning through the medulla. Their parallel tubes give the stripes — each pyramid is a bundle of <b>collecting ducts</b> dripping finished urine from its apex (the <b>papilla</b>) into a calyx below, like a tiny waterfall. Damage here (papillary necrosis) is a classic consequence of painkiller overuse. The model shows three of them tipping into the pelvis funnel.',
  },
  pelvis: {
    name: 'Renal Pelvis', sub: 'The funnel · urine waiting room',
    fn: 'A muscular funnel carved into the kidney\'s hollow (the <b>hilum</b>), where the calyces merge. It gently <b>peristalses</b> — squeezing every few seconds to push urine toward the bladder — and its stretch receptors are why a congested kidney feels like a deep flank ache. Block it with a stone and pressure backs up the whole factory (<b>hydronephrosis</b>), which is why even a 2 mm stone can fell a grown adult.',
  },
  ureter: {
    name: 'Ureter', sub: 'Urine escalator · 25 cm to the bladder',
    fn: 'A muscular tube about as thick as a pencil that <b>worms urine downhill</b> to the bladder with peristaltic squeezes 1–5 times a minute — it does NOT rely on gravity, which is why you can still pee upside down. It enters the bladder at a slant, creating a <b>one-way valve</b> that keeps urine (and any bacteria) from refluxing back up to the kidneys. Kidney stones make their notorious journey through this tube.',
  },
  artery: {
    name: 'Renal Artery', sub: 'Dirty blood in · 20% of cardiac output',
    fn: 'Direct from the aorta, this short vessel delivers a staggering <b>20–25% of your entire cardiac output</b> to organs that are only 0.4% of your body weight — the kidneys are perfusion monsters. Inside, it branches into ever-smaller arterioles until each one feeds a single glomerulus at high pressure. The artery also samples blood chemistry: if pressure drops, its sensors trigger <b>renin</b>, launching the hormonal cascade that raises your blood pressure.',
  },
  vein: {
    name: 'Renal Vein', sub: 'Clean blood out · the return trip',
    fn: 'The exit ramp for blood that has been filtered, cleaned and re-balanced. Unlike the artery, it carries blood whose salt, pH and water content have been measured and corrected <b>hundreds of times</b> on a single pass. The right renal vein is notably short (the inferior vena cava sits right there), and both veins are a favorite landmark for transplant surgeons — the renal vein is sewn first when a new kidney is plumbed in.',
  },
  capsule: {
    name: "Bowman's Capsule", sub: 'The filter cup · catch-basin of blood plasma',
    fn: 'A double-walled cup that swallows the glomerulus like a fist in a boxing glove. Blood pressure (about <b>4× normal capillary pressure</b>) shoves water, salts, glucose and waste <b>out of the blood and into this cup</b> — roughly 180 liters of filtrate per day, all of it cell-free and protein-free. The podocytes that wrap its inner surface interlock like zipper teeth; damage those and protein starts leaking into urine (the first sign of many kidney diseases).',
  },
  glomerulus: {
    name: 'Glomerulus', sub: 'Capillary knot · the pressure filter',
    fn: 'A tight ball of leaky capillaries — the actual <b>filter</b>. Blood enters through a wide <b>afferent</b> arteriole and leaves through a narrower <b>efferent</b> one, so pressure inside is forced high, squirting plasma through slits finer than any coffee filter: water, salts and sugar pass; <b>blood cells and proteins stay</b>. Each one filters about 90 microliters a minute — trivial alone, but you own a million of them, and you can\'t grow new ones.',
  },
  pct: {
    name: 'Proximal Tubule', sub: 'Grand reclamation · takes back the good stuff',
    fn: 'The first, greediest coil of the nephron. Of the 180 L filtered daily, the proximal tubule <b>reclaims ~65%</b> — all the glucose (normally), amino acids, vitamins and about two-thirds of the salt and water, pumped across its fuzzy microvilli border. It also secretes drugs, uric acid and toxins into the waste stream. Diabetes shows up here first: when blood sugar exceeds the tubule\'s reabsorption limit, <b>glucose spills into urine</b>.',
  },
  henle: {
    name: 'Loop of Henle', sub: 'The hairpin · urine concentrator',
    fn: 'A U-shaped dive into the salty medulla and back. Its two limbs run <b>counter-current flows</b> — fluid down one side, up the other, trading salts through the gradient between them — a physics trick copied from industrial heat exchangers. The longer the loop, the more concentrated the urine: desert jerboas have huge loops and barely need to drink. Humans have long loops on only ~15% of nephrons, which is why we can\'t match them.',
  },
  dct: {
    name: 'Distal Tubule', sub: 'Fine tuning · hormones take the wheel',
    fn: 'The nephron\'s precision department, where <b>hormones finish the job</b>. Aldosterone adds salt reabsorption, parathyroid hormone manages calcium and phosphate, and pH is fine-tuned by swapping hydrogen for bicarbonate — the distal tubule is your blood\'s <b>last chemical checkpoint</b> before urine is declared final. It\'s also where the macula densa cells sit, sniffing incoming salt to regulate filtration pressure upstream.',
  },
  duct: {
    name: 'Collecting Duct', sub: 'Final water gate · ADH decides',
    fn: 'The shared trunk that up to <b>eight nephrons</b> drain into. Its walls respond to <b>ADH (vasopressin)</b>: the hormone inserts water channels (aquaporins), and the duct sips water back into the salty medulla — this single decision swings your urine from dilute-as-water to syrup-concentrated. Caffeine and alcohol work by <i>blocking</i> ADH, which is why coffee and beer send you to the bathroom. Finished urine exits here via the papilla into the calyces.',
  },
}

export const KIDNEY_LABELS: LabelDef[] = [
  { key: 'cortex', name: 'Renal Cortex', sub: 'filtering shell', t: [2.5, 1.05, 0.3], a: [3.55, 1.95, 0.55] },
  { key: 'medulla', name: 'Renal Medulla', sub: 'inner engine', t: [2.55, 0.3, -0.25], a: [3.8, 0.7, -0.45] },
  { key: 'pyramid', name: 'Renal Pyramid', sub: 'striped collectors', t: [2.35, -0.6, -0.15], a: [3.7, -1.3, -0.35] },
  { key: 'pelvis', name: 'Renal Pelvis', sub: 'urine funnel', t: [1.32, 0.12, -0.2], a: [1.05, 1.15, -1.05] },
  { key: 'ureter', name: 'Ureter', sub: 'to the bladder', t: [1.42, -1.5, -0.05], a: [2.7, -2.45, 0.1] },
  { key: 'artery', name: 'Renal Artery', sub: 'dirty blood in', t: [1.5, 0.62, 0.2], a: [1.2, 2.0, 0.85] },
  { key: 'vein', name: 'Renal Vein', sub: 'clean blood out', t: [1.55, 0.0, 0.35], a: [0.6, -0.75, 1.35] },
  { key: 'capsule', name: "Bowman's Capsule", sub: 'the filter cup', t: [-1.15, 1.42, 0.05], a: [-2.0, 2.15, 0.55] },
  { key: 'glomerulus', name: 'Glomerulus', sub: 'capillary knot', t: [-1.05, 1.1, 0.05], a: [-0.1, 2.05, 0.75] },
  { key: 'pct', name: 'Proximal Tubule', sub: 'grand reclamation', t: [-2.1, 0.85, 0.05], a: [-3.0, 1.6, 0.5] },
  { key: 'henle', name: 'Loop of Henle', sub: 'concentrator hairpin', t: [-2.42, -0.55, 0.02], a: [-3.35, -1.4, 0.3] },
  { key: 'dct', name: 'Distal Tubule', sub: 'fine tuning', t: [-1.72, 0.6, 0.05], a: [-1.35, 1.5, 0.95] },
  { key: 'duct', name: 'Collecting Duct', sub: 'shared trunk', t: [-1.12, -0.4, -0.05], a: [-2.05, -0.5, 0.95] },
]

export const KIDNEY_EXPLODE: Record<string, ExplodeDef> = {
  cortex: { d: [0.35, 0.85, 0.75] },
  medulla: { d: [0.15, -0.15, 0.95] },
  pyramid: { d: [0.3, -0.7, 0.55] },
  pelvis: { d: [-0.55, -0.25, 0.6] },
  ureter: { d: [-0.25, -1.15, 0.45] },
  artery: { d: [-0.4, 0.95, 0.5] },
  vein: { d: [-0.55, -0.55, 0.65] },
  capsule: { d: [-0.9, 0.4, 0.6] },
  glomerulus: { d: [-0.45, 0.85, 0.5] },
  pct: { d: [-0.9, 0.1, 0.75] },
  henle: { d: [-0.65, -0.95, 0.6] },
  dct: { d: [-0.35, 0.55, 0.95] },
  duct: { d: [-0.1, -0.85, 0.7] },
}
