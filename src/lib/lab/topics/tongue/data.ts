import type { ExplodeDef, LabelDef, PartInfo } from '../../types'

/**
 * THE TONGUE — thirteenth topic. The mouth's star instrument as a 3D
 * top-side study model: a boneless muscular hydrostat (tip, body, root)
 * split by the midline groove, carpeted in velvet filiform spikes and
 * red mushroom fungiform dots, ringed at the back by the walled V of
 * circumvallate papillae and the side foliate folds — every taste bud
 * wired by three cranial nerves, guarded by tonsils and closed off by
 * the epiglottis lid.
 */

export const TONGUE_INFO: Record<string, PartInfo> = {
  tip: {
    name: 'Apex (Tip)', sub: 'The precision instrument · front tip',
    fn: 'The tongue\'s business end — and one of the body\'s strangest structures: a <b>muscular hydrostat</b>, a boneless bundle of muscle that moves by squeezing itself, exactly like an octopus arm or an elephant trunk. Because nothing hard constrains it, the tip can curl, fold, roll and flick with <b>millimeter precision</b> — fast enough that a flick takes under a tenth of a second. It presses sounds into shape (the <b>t, d, n, l</b> consonants are all tip-work), sweeps crumbs from between teeth, and tests food before you swallow. It is also <b>the fastest-healing region in the body</b> — bite it and it\'s usually whole again within days, bathed in antiseptic saliva around the clock.',
  },
  body: {
    name: 'Tongue Body', sub: 'The boneless engine · pure muscle',
    fn: 'The mass under the pink surface: <b>eight interwoven muscles</b> with no skeleton at all. Four <b>intrinsic</b> muscles run lengthwise, crosswise and vertically <i>inside</i> the tongue, changing its shape; four <b>extrinsic</b> ones anchor it to jaw, skull and hyoid bone, moving it around. This is why the tongue can be long, short, fat, thin, curled and cupped — a shape-shifter no robot has fully copied. Common claim "strongest muscle for its size": not officially true, but pound-for-pound its constant workload (chewing, swallowing ~600 times a day, speech) is brutal. Split it down the middle and you\'d find the halves barely share anything — <b>no muscle fiber crosses the midline</b>.',
  },
  root: {
    name: 'Tongue Root', sub: 'The anchored third · faces the throat',
    fn: 'The back third you never see in the mirror — the part that actually faces your throat. Its surface looks lumpy because it is packed with <b>lingual tonsils</b>, another ring of immune guards, and its meat is knitted into the <b>hyoid bone</b>, the free-floating U-bone in your neck that the whole tongue muscle system pulls against. When you swallow, the root <b>dives backward</b>, jamming the food bolus into the pharynx; when you sleep deeply and it relaxes too much, it flops back and narrows the airway — the mechanical heart of <b>snoring and sleep apnea</b>. It is wired by a different nerve than the front (glossopharyngeal) — brain surgeons can cut the "taste" of the back without killing speech.',
  },
  sulcus: {
    name: 'Median Sulcus', sub: 'The midline groove · left/right border',
    fn: 'The faint line down the middle of the tongue is more than a wrinkle: it marks the <b>fibrous septum</b> that walls the left muscle half off from the right. No muscle crosses it — the two halves are <b>independent machines</b> that can be trained to work apart (curling the tongue into a U uses them unevenly; the tongue-rolling talent some people have is genetic). The septum also matters clinically: infections and tumors largely respect the midline early on, and surgeons use the groove as a natural cutting plane. In embryos the whole tongue forms from paired buds that fuse along this seam — the groove is the suture line of that merger.',
  },
  filiform: {
    name: 'Filiform Papillae', sub: 'The velvet friction carpet · no taste',
    fn: 'The fine whitish velvet covering the whole surface — <b>the most numerous papillae by far</b>, yet the surprise is they carry <b>zero taste buds</b>. Their job is grip: keratin-tipped hooks that hold food against the palate while the tongue pushes, and scrub the teeth and gums like a self-cleaning brush. They grow pointing backward — extreme in cats, whose filiform are stiff hooked barbs you can feel when licked (a built-in comb and meat-shredder). When you are sick or dehydrated they lengthen and trap debris: the <b>white coating</b> of a fever tongue. They turn over faster than almost any epithelium in the body.',
  },
  fungiform: {
    name: 'Fungiform Papillae', sub: 'The red mushroom dots · taste on top',
    fn: 'Scattered between the velvet like drops of red wax — named for their shape: a thin stalk carrying a <b>mushroom cap</b> fed by a loop of capillaries, which is why they look red against the pale filiform carpet. Each cap\'s upper surface holds <b>3–5 taste buds</b> (unlike every other papilla type, which bury them in walls and clefts). They concentrate on the <b>tip and sides</b> — the zones that sample food first — a few dozen per square centimeter, and super-tasters pack double. Because the cap is thin, they deliver taste fastest: press a salt crystal on one and the signal lands almost instantly. Heavy coffee drinkers wear theirs down — one reason scalded mornings dull flavor.',
  },
  circumvallate: {
    name: 'Circumvallate Papillae', sub: 'The walled V · taste factories',
    fn: 'The row of 8–12 dome bunkers arranged in a <b>V at the back</b>, each sunk in a moat with a raised wall. They are the taste industry\'s heavy industry: the walls of each dome shelter <b>hundreds of taste buds</b> — thousands in the whole row — sampling everything that is about to be swallowed. The moat is not decorative: <b>von Ebner\'s glands</b> flush it with watery saliva, dissolving new molecules and rinsing the old ones, so the line keeps re-reading the last moment of every mouthful. They sit just before the throat for good reason: this is the <b>final quality checkpoint</b> — bitterness is densest here, the last warning before you commit to the swallow.',
  },
  foliate: {
    name: 'Foliate Papillae', sub: 'The side gills · folded clefts',
    fn: 'Along each rear edge, two slanted rows of <b>parallel folds</b> — the tongue wears gills. Each ridge-and-cleft pair is a wet groove lined with <b>taste buds, especially sour and bitter</b>, sampling what sits against your cheeks. The clefts have their own minor salivary glands rinsing them, and they share the back-corner territory with the tonsils, which is why a throat infection can make them <b>swell visibly</b> and taste everything metallic. In most mammals (rabbits, cats) foliate papillae are huge; in humans they are modest remnants — evolution kept the machinery but shrank the real estate as our diets softened.',
  },
  tasteBud: {
    name: 'Taste Buds', sub: 'The flavor pixels · 50–150 cells each',
    fn: 'The actual sensors — invisible barrels of <b>50–150 cells</b> tucked into the papillae, each bud opening at a <b>taste pore</b> where its hair-like tips dip into the saliva film. Molecules dissolve in, dock on the hairs, and the cells fire. The textbook five channels: <b>sweet, salty, sour, bitter, umami</b> (with ongoing debate about fat and "starchy" as sixth). One debunk to carry with you: the famous <b>tongue map is wrong</b> — every region senses every taste; the old 1901 diagram was a misread graph. Each receptor cell lives only <b>~10 days</b>, constantly replaced — the reason a burned tongue recovers its palate in two weeks. And buds are not only on the tongue: your soft palate, throat and epiglottis carry their own.',
  },
  tonsil: {
    name: 'Palatine Tonsils', sub: 'The side guards · immune checkpoints',
    fn: 'The two pink ovals flanking the tongue root — the tonsils you think of when someone says "tonsillitis". They sit exactly where the mouth\'s traffic funnels into the throat, and their surface is drilled with <b>crypts: deep pits</b> that trap bacteria and food remnants so the immune tissue inside can sample them — <b>training grounds where white blood cells memorize the germs you swallow</b>. Together with the adenoids and lingual tonsils they form <b>Waldeyer\'s ring</b>, a full defensive circle around the pharyngeal entrance. They swell famously during infections (that\'s them working) and grow largest around ages 4–7, shrinking through the teens as the immune system matures.',
  },
  epiglottis: {
    name: 'Epiglottis', sub: 'The leaf lid · closes the airway',
    fn: 'Behind the tongue root stands a leaf-shaped flap of <b>elastic cartilage</b> — the trapdoor between two highways. Breathing, it stands upright, leaving the airway open. Swallowing, the whole larynx <b>leaps upward</b> and the tongue root ram-slams the epiglottis flat over the windpipe like a lid — a reflex so fast and absolute that food has only milliseconds to take the wrong turn. When it misfires you "swallow wrong" and cough for a minute: the airway rebooting itself. It is why you <b>cannot taste while swallowing</b> (the sensors get sealed off) and why talking while eating is genuinely risky — speech reopens the door mid-bite. Babies\' epiglottis interlocks with the soft palate, letting them breathe and drink at once.',
  },
  nerve: {
    name: 'Lingual Nerves', sub: 'The three-wire hookup · taste to brain',
    fn: 'The tongue\'s wiring is split three ways — a rare anatomical hand-over. <b>Facial nerve (VII)</b> carries taste from the front two-thirds, sneaking via the <b>chorda tympani</b> — it literally detours <i>through the middle ear</i> (ear infections can blur taste). <b>Glossopharyngeal (IX)</b> owns the back third\'s taste and feeling; <b>vagus (X)</b> samples the epiglottis. All three converge in the brainstem\'s <b>solitary nucleus</b>, relay through the thalamus, and land in the taste cortex. Touch and temperature ride separately on the trigeminal nerve — which is why dental anesthesia on the lingual nerve numbs speech-feel but leaves some taste intact, and why a cold snaps flavor: it blocks the smell half of the signal, not the taste wires.',
  },
}

export const TONGUE_LABELS: LabelDef[] = [
  { key: 'tip', name: 'Apex (Tip)', sub: 'precision instrument', t: [0, 0.32, 1.55], a: [0.4, 1.35, 1.95] },
  { key: 'sulcus', name: 'Median Sulcus', sub: 'midline groove', t: [0, 0.62, 0.45], a: [-0.32, 1.78, 0.3] },
  { key: 'filiform', name: 'Filiform Papillae', sub: 'velvet friction', t: [0.34, 0.58, 0.85], a: [1.05, 1.5, 1.15] },
  { key: 'fungiform', name: 'Fungiform Papillae', sub: 'red mushroom dots', t: [-0.38, 0.6, 0.55], a: [-1.5, 1.78, 0.7] },
  { key: 'tasteBud', name: 'Taste Buds', sub: 'flavor pixels', t: [0.14, 0.5, -0.72], a: [0.75, 1.45, -1.0] },
  { key: 'body', name: 'Tongue Body', sub: 'boneless engine', t: [-0.55, 0.25, -0.05], a: [-1.72, 0.82, -0.25] },
  { key: 'foliate', name: 'Foliate Papillae', sub: 'side gills', t: [0.62, 0.3, -0.85], a: [1.45, 1.15, -1.05] },
  { key: 'circumvallate', name: 'Circumvallate', sub: 'walled V', t: [-0.44, 0.42, -0.98], a: [-1.25, 1.3, -1.35] },
  { key: 'tonsil', name: 'Palatine Tonsils', sub: 'side guards', t: [0.82, 0.22, -1.3], a: [1.7, 1.05, -1.75] },
  { key: 'root', name: 'Tongue Root', sub: 'anchored third', t: [-0.3, 0.18, -1.35], a: [-1.15, 0.85, -1.95] },
  { key: 'epiglottis', name: 'Epiglottis', sub: 'leaf lid', t: [0, 0.55, -1.66], a: [0.55, 1.55, -2.15] },
  { key: 'nerve', name: 'Lingual Nerves', sub: 'three-wire hookup', t: [0.12, 0.1, -0.5], a: [0.9, -0.55, -0.65] },
]

export const TONGUE_EXPLODE: Record<string, ExplodeDef> = {
  tip: { d: [0, 0.3, 1.4] },
  sulcus: { d: [0, 0.85, 0.25] },
  filiform: { d: [0, 0.6, 0.4] },
  fungiform: { d: [0, 0.8, 0.15] },
  tasteBud: { d: [0, 1.05, 0] },
  body: { d: [0, -0.2, 0.35] },
  foliate: { d: [1.05, 0.4, -0.1], p: 1 },
  circumvallate: { d: [0, 0.6, -0.5] },
  tonsil: { d: [1.2, 0.3, -0.4], p: 1 },
  root: { d: [0, 0.15, -1.25] },
  epiglottis: { d: [0, 0.45, -1.4] },
  nerve: { d: [0, -0.75, -0.2] },
}
