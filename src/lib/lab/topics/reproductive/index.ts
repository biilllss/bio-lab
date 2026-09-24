import type { TopicDef } from '../../types'
import { buildMale } from './male'
import { buildFemale } from './female'
import {
  FEMALE_EXPLODE, FEMALE_INFO, FEMALE_LABELS,
  MALE_EXPLODE, MALE_INFO, MALE_LABELS,
} from './data'

export const reproductiveTopic: TopicDef = {
  id: 'repro',
  title: 'Reproductive Systems',
  emoji: '🧬',
  tagline: 'Male & female · sperm production to gestation',
  description:
    'Two complete interactive models covering the structures of the male and female reproductive systems, how gametes are made, transported and met.',
  parts: 'Testis · Epididymis · Vas deferens · Prostate · Ovary · Fallopian tube · Uterus · Cervix …',
  accent: '#2f81f7',
  defaultSystem: 0,
  menuTip:
    'Both systems include: labeled 3D models with functions · scored quiz (name / find / mixed) · X-ray · cross-section · Separate — pull the organs apart to study each one · animated sperm / egg routes',
  systems: [
    {
      id: 'male',
      name: 'Male Reproductive System',
      short: '♂ MALE',
      accent: '#6fb1ff',
      hint: '♂ Male — drag to rotate · scroll to zoom · click parts',
      camera: { pos: [5.6, 2.8, 7.4], target: [0, 0.9, 0.6] },
      order: ['testis', 'epididymis', 'vas', 'seminal', 'prostate', 'cowper', 'urethra', 'cavern', 'spong', 'glans', 'penis', 'scrotum', 'bladder'],
      quizKeys: ['testis', 'epididymis', 'vas', 'seminal', 'prostate', 'cowper', 'urethra', 'cavern', 'spong', 'glans', 'penis', 'scrotum', 'bladder'],
      inner: ['testis', 'epididymis', 'urethra', 'cowper'],
      quizSkip: ['penis'],
      skipSkinHover: ['penis', 'scrotum'],
      info: MALE_INFO,
      labels: MALE_LABELS,
      explode: MALE_EXPLODE,
      flowLabel: 'Sperm Path',
      flowPanel: {
        title: '🚩 Sperm Route',
        subtitle: 'From production to exit — both testes',
        html: '<b>Path:</b> Testis (made) → Epididymis (mature &amp; stored) → Vas deferens → fluids from the <b>seminal vesicles, prostate &amp; bulbourethral glands</b> join to form <b>semen</b> → Urethra → out the opening at the glans.',
      },
      build: buildMale,
    },
    {
      id: 'female',
      name: 'Female Reproductive System',
      short: '♀ FEMALE',
      accent: '#f08ab5',
      hint: '♀ Female — drag to rotate · scroll to zoom · click parts',
      camera: { pos: [4.9, 2.1, 6.6], target: [0, 1.3, 0.55] },
      order: ['ovary', 'fimbriae', 'fallopian', 'uterus', 'endometrium', 'cervix', 'vagina', 'mons', 'labiaMaj', 'labiaMin', 'clitoris', 'urethra', 'bladder'],
      quizKeys: ['ovary', 'fimbriae', 'fallopian', 'uterus', 'endometrium', 'cervix', 'vagina', 'mons', 'labiaMaj', 'labiaMin', 'clitoris', 'urethra', 'bladder'],
      inner: ['urethra', 'clitoris', 'labiaMin', 'vagina', 'cervix', 'endometrium'],
      quizSkip: ['mons'],
      skipSkinHover: ['mons', 'labiaMaj', 'labiaMin'],
      info: FEMALE_INFO,
      labels: FEMALE_LABELS,
      explode: FEMALE_EXPLODE,
      flowLabel: 'Egg Path',
      flowPanel: {
        title: '🥚 Egg Route',
        subtitle: 'From ovary to uterus — both ovaries',
        html: '<b>Path:</b> Ovary (egg released at ovulation) → Fimbriae sweep it into the <b>Fallopian tube</b> (fertilization happens here if sperm are present) → Uterus → implants into the <b>endometrium</b>.<br><i>If unfertilized: the egg dissolves and the thickened lining is shed — <b>menstruation</b>.</i>',
      },
      build: buildFemale,
    },
  ],
}
