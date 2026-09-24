import type { ExplodeDef, LabelDef, PartInfo } from '../../types'

/* ═══════════════════════════ MALE ═══════════════════════════ */

export const MALE_INFO: Record<string, PartInfo> = {
  testis: {
    name: 'Testis', sub: 'Sperm & testosterone production',
    fn: 'Produces sperm in its seminiferous tubules and secretes testosterone. The paired testes sit in the scrotum, kept ~2–3 °C below body temperature — ideal for sperm production.',
  },
  epididymis: {
    name: 'Epididymis', sub: 'Sperm maturation & storage',
    fn: 'A long coiled tube on the back of each testis. Sperm leaving the testis are immature; here they gain the ability to swim and fertilize, and are stored for up to several weeks.',
  },
  vas: {
    name: 'Vas Deferens', sub: 'Sperm transport',
    fn: 'A thick muscular tube that carries mature sperm from the epididymis up past the bladder and down to the prostate. Contractions of its muscle wall push sperm forward (peristalsis).',
  },
  seminal: {
    name: 'Seminal Vesicle', sub: '~60–70% of semen volume',
    fn: 'A pair of glands behind the bladder. Their alkaline, fructose-rich fluid feeds sperm energy and helps neutralize the acidic environment of the vagina.',
  },
  prostate: {
    name: 'Prostate Gland', sub: '~20–30% of semen volume',
    fn: 'A walnut-sized gland below the bladder wrapping around the urethra. Its milky fluid contains enzymes and nutrients that keep sperm motile.',
  },
  cowper: {
    name: 'Bulbourethral Gland', sub: "Cowper's glands — pre-ejaculate",
    fn: 'Two pea-sized glands below the prostate. During arousal they release mucus that lubricates the urethra and neutralizes leftover acidic urine so sperm survive the journey.',
  },
  scrotum: {
    name: 'Scrotum', sub: 'Temperature control',
    fn: 'A skin pouch holding the testes. Its muscles relax or tighten (wrinkling when cold) to keep the testes a few degrees below core temperature.',
  },
  urethra: {
    name: 'Urethra', sub: 'Shared exit channel',
    fn: 'The tube that carries both urine and semen out through the penis: from the bladder, through the prostate, along the full length of the penis to the external opening (meatus).',
  },
  penis: {
    name: 'Penis', sub: 'Organ of copulation',
    fn: 'Delivers semen during intercourse and carries the urethra. Erection happens when its three columns of erectile tissue — two corpora cavernosa plus the corpus spongiosum — fill with blood.',
  },
  cavern: {
    name: 'Corpus Cavernosum', sub: 'Erectile tissue (×2)',
    fn: 'Two parallel cylinders forming the upper side of the shaft. During arousal they fill with blood, producing the rigidity of the erection.',
  },
  spong: {
    name: 'Corpus Spongiosum', sub: 'Erectile tissue around the urethra',
    fn: 'A column of spongy tissue surrounding the urethra; it swells at the base (bulb) and the tip (glans). It stays softer during erection so the urethra stays open for ejaculation.',
  },
  glans: {
    name: 'Glans Penis', sub: 'Tip of the penis',
    fn: 'The expanded, highly sensitive tip with a flared edge (corona), rich in nerve endings. The external opening of the urethra (meatus) is at its center.',
  },
  bladder: {
    name: 'Urinary Bladder', sub: 'Urine storage (urinary system)',
    fn: 'A muscular sac that stores urine and contracts to push it out through the urethra.',
  },
}

export const MALE_LABELS: LabelDef[] = [
  { key: 'bladder', name: 'Bladder', sub: 'urine storage', t: [0, 3.4, -1.2], a: [0, 4.05, -2.0] },
  { key: 'prostate', name: 'Prostate', sub: 'semen fluid', t: [0.45, 2.4, 0.25], a: [1.75, 2.8, 0.6] },
  { key: 'seminal', name: 'Seminal Vesicle', sub: 'semen fluid', t: [0.55, 3.05, -0.85], a: [1.9, 3.35, -1.05] },
  { key: 'vas', name: 'Vas Deferens', sub: 'sperm transport', t: [0.85, 1.6, -0.1], a: [1.95, 1.3, 0.1] },
  { key: 'epididymis', name: 'Epididymis', sub: 'sperm storage', t: [0.55, -0.55, -0.42], a: [1.55, -0.45, -0.7] },
  { key: 'testis', name: 'Testis', sub: 'sperm + testosterone', t: [-0.4, -0.75, 0.2], a: [-1.55, -0.8, 0.4] },
  { key: 'scrotum', name: 'Scrotum', sub: 'temperature control', t: [-0.6, -1.25, 0.0], a: [-1.75, -1.6, -0.1] },
  { key: 'urethra', name: 'Urethra', sub: 'exit channel', t: [0, 2.45, 0.15], a: [-1.6, 2.95, 0.35] },
  { key: 'cavern', name: 'Corpus Cavernosum', sub: 'erectile tissue', t: [-0.35, 2.0, 1.5], a: [-1.95, 2.3, 1.6] },
  { key: 'spong', name: 'Corpus Spongiosum', sub: 'erectile tissue', t: [0.2, 1.88, 1.4], a: [1.7, 1.3, 1.5] },
  { key: 'glans', name: 'Glans', sub: 'tip of penis', t: [0, 1.72, 3.35], a: [0, 2.55, 4.0] },
  { key: 'cowper', name: 'Bulbourethral Gland', sub: 'pre-ejaculate', t: [0.25, 1.75, 0.35], a: [1.7, 1.45, 0.05] },
]

export const MALE_EXPLODE: Record<string, ExplodeDef> = {
  bladder: { d: [0, 1.1, -0.9] },
  prostate: { d: [0, 0, -1.3] },
  seminal: { d: [1.25, 0.6, -0.9], p: 1 },
  vas: { d: [1.6, 0.15, 0], p: 1 },
  urethra: { d: [0, 0.95, 1.15] },
  penis: { d: [0, 0.05, 1.5] },
  cavern: { d: [0.85, 0.55, 1.0], p: 1 },
  spong: { d: [0, -0.55, 1.25] },
  glans: { d: [0, 0.15, 2.1] },
  cowper: { d: [0.7, -0.6, 0.6], p: 1 },
  scrotum: { d: [0, -1.15, -0.15] },
  testis: { d: [0, -1.8, 0.45] },
  epididymis: { d: [0.95, -1.45, 0.5], p: 1 },
}

/* ═══════════════════════════ FEMALE ═══════════════════════════ */

export const FEMALE_INFO: Record<string, PartInfo> = {
  ovary: {
    name: 'Ovary', sub: 'Eggs + female hormones',
    fn: 'Produces one mature egg (ovum) per cycle and secretes estrogen &amp; progesterone, which drive the menstrual cycle and secondary sex characteristics. Almond-shaped, held near each fallopian tube.',
  },
  fallopian: {
    name: 'Fallopian Tube', sub: 'Egg transport · fertilization site',
    fn: 'A ~10 cm tube lined with cilia that sweeps the egg toward the uterus. Fertilization normally happens in its widened middle section (ampulla).',
  },
  fimbriae: {
    name: 'Fimbriae', sub: 'Egg capture',
    fn: 'Finger-like fringes at the opening of each fallopian tube. At ovulation they sweep over the ovary and guide the released egg into the tube.',
  },
  uterus: {
    name: 'Uterus (Womb)', sub: 'Gestation · labor',
    fn: 'A thick, muscular, pear-shaped organ. Its lining receives the embryo, and its walls stretch enormously to house the fetus. In labor, powerful contractions deliver the baby.',
  },
  endometrium: {
    name: 'Endometrium', sub: 'Implantation · menstruation',
    fn: 'The blood-rich inner lining of the uterus. It thickens every cycle to receive an embryo; if none implants, it is shed — this is menstruation (the period). Use Separate or Cross-Section to see it inside the wall.',
  },
  cervix: {
    name: 'Cervix', sub: 'Neck of the uterus',
    fn: 'The narrow lower end of the uterus. Its canal connects the uterine cavity to the vagina; its mucus thins at ovulation and blocks sperm at other times; it stretches (dilates) wide during birth.',
  },
  vagina: {
    name: 'Vagina', sub: 'Birth canal · intercourse',
    fn: 'A muscular, elastic tube connecting the cervix to the outside. It receives the penis during intercourse and forms the birth canal. Its slightly acidic environment helps resist infection.',
  },
  mons: {
    name: 'Mons Pubis', sub: 'Fatty cushion',
    fn: 'A rounded fatty pad over the pubic bone at the front of the vulva. It cushions and protects underlying bone and becomes hair-covered after puberty.',
  },
  labiaMaj: {
    name: 'Labia Majora', sub: 'Outer protective folds',
    fn: 'The fleshy outer folds of the vulva, containing fat pads, sweat and oil glands. They protect inner structures; hair grows on them after puberty.',
  },
  labiaMin: {
    name: 'Labia Minora', sub: 'Inner folds (mucosal)',
    fn: 'Thin, hairless inner folds surrounding the urethral and vaginal openings. They keep the vestibule moist and protect it.',
  },
  clitoris: {
    name: 'Clitoris', sub: 'Sensitive erectile organ',
    fn: 'A small, highly sensitive erectile organ at the front of the vulva — developmentally homologous to the penis. Its role is sexual sensation and arousal.',
  },
  urethra: {
    name: 'Urethra', sub: 'Urine exit (short!)',
    fn: 'A short tube (~3–4 cm in females) carrying urine from the bladder to an opening in front of the vagina. Its shortness is why urinary tract infections are more common in females.',
  },
  bladder: {
    name: 'Urinary Bladder', sub: 'Urine storage (urinary system)',
    fn: 'A muscular sac that stores urine. In females it sits in front of the uterus and vagina, above the pubic bone.',
  },
}

export const FEMALE_LABELS: LabelDef[] = [
  { key: 'ovary', name: 'Ovary', sub: 'eggs + hormones', t: [1.5, 1.9, 0.05], a: [2.4, 1.75, -0.1] },
  { key: 'fimbriae', name: 'Fimbriae', sub: 'egg capture', t: [1.62, 2.1, 0.1], a: [2.45, 2.2, -0.15] },
  { key: 'fallopian', name: 'Fallopian Tube', sub: 'egg transport · fertilization', t: [1.1, 2.6, 0.38], a: [2.2, 2.85, 0.25] },
  { key: 'uterus', name: 'Uterus (Womb)', sub: 'gestation · labor', t: [0.4, 2.15, 0.5], a: [-1.95, 2.55, 0.6] },
  { key: 'endometrium', name: 'Endometrium', sub: 'implantation · period', t: [0, 1.8, 0.4], a: [-1.95, 1.85, 0.35] },
  { key: 'cervix', name: 'Cervix', sub: 'neck of uterus', t: [0, 1.05, 0.15], a: [-1.8, 0.85, 0.0] },
  { key: 'vagina', name: 'Vagina', sub: 'birth canal', t: [0, 0.1, 0.43], a: [-1.75, 0.0, 0.6] },
  { key: 'mons', name: 'Mons Pubis', sub: 'fatty cushion', t: [0, -0.35, 1.05], a: [1.6, -0.15, 1.45] },
  { key: 'labiaMaj', name: 'Labia Majora', sub: 'outer folds', t: [0.45, -0.75, 0.8], a: [1.7, -1.1, 0.7] },
  { key: 'labiaMin', name: 'Labia Minora', sub: 'inner folds', t: [-0.17, -0.72, 0.92], a: [-1.65, -0.85, 1.0] },
  { key: 'clitoris', name: 'Clitoris', sub: 'sensitive organ', t: [0, -0.55, 1.05], a: [-1.55, -0.3, 1.25] },
  { key: 'urethra', name: 'Urethra', sub: 'urine exit', t: [0, 0.5, 1.0], a: [1.75, 0.7, 1.2] },
  { key: 'bladder', name: 'Bladder', sub: 'urine storage', t: [0, 1.85, 1.15], a: [1.85, 2.45, 1.4] },
]

export const FEMALE_EXPLODE: Record<string, ExplodeDef> = {
  ovary: { d: [1.45, -0.1, 0], p: 1 },
  fimbriae: { d: [1.6, 0.45, 0.1], p: 1 },
  fallopian: { d: [1.25, 0.95, 0.15], p: 1 },
  uterus: { d: [0, 0.85, -0.35] },
  endometrium: { d: [0, 1.6, 0.45] },
  cervix: { d: [0, -0.85, 0.55] },
  vagina: { d: [0, -1.7, 0.85] },
  mons: { d: [0, -0.75, 1.7] },
  labiaMaj: { d: [1.15, -1.35, 0.9], p: 1 },
  labiaMin: { d: [0.75, -0.95, 1.35], p: 1 },
  clitoris: { d: [0, -0.25, 2.0] },
  urethra: { d: [0, 0.45, 1.6] },
  bladder: { d: [0, 1.35, 1.35] },
}
