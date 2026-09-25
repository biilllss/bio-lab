# Worklog — Biology 3D Study Lab

## Table of Contents (Task IDs)
- Task 1: Project port → modular Next.js; topic-registry architecture; Reproductive + Heart
- Task 2-3: Nerve Cell, Lungs topics; quiz engine; progress tracking
- Task 4-5: Brain, Eye topics; best scores, spaced repetition dues
- Task 6: Ear topic; stats dashboard
- Task 7: Kidney topic
- Task 8: Skin topic; portable export/import backup
- Task 9: Plant Cell topic; complete backup v2 (best scores); menu 3D previews; quiz-marker engine fix
- Task 10: The Tooth topic (2 systems); share-card PNG export; confetti; menu mastery bars
- Task 11: Photosynthesis Leaf topic; Progress-panel stats card; HMR state-desync hardening; snapshot queue speedup
*(full details per round below)*


---

Task ID: 1
Agent: Z.ai Code (main)
Task: Port the single-file "Reproductive Systems · 3D Study Lab" HTML app into a modular, Vercel-deployable Next.js 16 project; add a second biology topic to prove extensibility; verify end-to-end with agent-browser; document Vercel deployment.

Work Log:
- Analyzed the uploaded 1,417-line single-file Three.js lab (male + female reproductive systems, labels, quiz, X-ray, cross-section, explode, sperm/egg paths, sound).
- Installed `three@0.186` + `@types/three`.
- Designed a **topic-registry architecture**: `TopicDef` (topic) → `SystemDef` (model) contracts in `src/lib/lab/types.ts`.
- Built the reusable engine:
  - `src/lib/lab/engine/helpers.ts` — geometry kit (mat, blob, taperedTube, lathe, ribbon, noise, glow, mirror).
  - `src/lib/lab/engine/world.ts` — `LabWorld` class: renderer/scene/camera/lights, per-topic builds, CSS2D labels, raycast picking, X-ray, clipping planes, exploded view, generic flow-path animation (tails optional), emissive pulses, quiz glow + marker, resize observer, dispose.
  - `src/lib/lab/engine/sound.ts` — WebAudio feedback tones.
- Ported the reproductive topic as a self-contained module: `src/lib/lab/topics/reproductive/{data.ts, male.ts, female.ts, index.ts}` (all 26 parts, 25 labels, explode map, sperm/egg flow curves).
- Created a **new Heart topic** (`src/lib/lab/topics/heart/`) — 11 parts (4 chambers, aorta + arch branches, pulmonary artery, vena cavae, pulmonary veins, coronary arteries, pericardium), labels, explode map, and **two animated blood circuits** (pulmonary blue / systemic red) to prove the modular pattern.
- Registered both in `src/lib/lab/topics/registry.ts` (single touch-point for adding future topics).
- Built the generic React UI: `BiologyLab.tsx` (orchestrator + quiz state machine + keyboard shortcuts), `TopBar`, `TopicMenu`, `InfoPanel` (default/info/quiz-start/question/results/flow states), `RangeBar` (cut + separate sliders), `HintOverlay`.
- Namespaced all lab CSS under `.bio-lab` in `globals.css` (responsive + reduced-motion support).
- Quiz enhancement: per-mode **best scores persisted in localStorage** (shown on start + results, "🏆 New best" indicator).
- Fixed bugs found during browser QA:
  1. Camera at origin behind the menu → call `resetCamera()` after silent activation.
  2. `partKey('repro','male','')` produced trailing-colon system keys that matched nothing → helper now omits empty part.
  3. `register()` stored local part keys while lookups expected full `topic:system:part` keys → register now namespaces (fixed marker, glow, focus, picking).
- Agent-browser verification (all passed): topic menu cards; male model renders with 12 labels; part click → info panel + highlight + prev/next nav; quiz name mode (X-ray auto, ❓ marker, options, ✔ feedback, results with score/time/review chips, best-score save); Separate exploded view + slider; Sperm Path animated with tailed particles + route panel; Swap → female model with pink accent + Egg Path; Menu → Heart topic (single-system: Swap hidden) renders with labels; Blood Flow circuits; Cross-Section cut + slider; canvas mesh picking (Pericardium); mobile 390px layout.
- Wrote `DEPLOY.md` — GitHub→Vercel and CLI deploy guides + "how to add a new topic" instructions.
- Final `bun run lint` clean; `tsc --noEmit` clean (excluding pre-existing sandbox example/skill errors); dev.log shows 200s.

Stage Summary:
- The lab is now a modular Next.js 16 app deployable to Vercel with zero config.
- Adding a biology topic = new folder under `src/lib/lab/topics/` + one line in `registry.ts`. No engine/UI changes.
- Two topics live: Reproductive Systems (male/female) and Heart & Blood Flow.
- Key files: `src/lib/lab/types.ts` (contracts), `src/lib/lab/topics/registry.ts` (registration), `src/components/lab/BiologyLab.tsx` (state).
- Next-phase ideas: more topics (lungs, brain, nephron, cell), per-topic accent theming for the whole shell, spaced-repetition of missed quiz parts, shareable quiz results, i18n.

Unresolved issues / risks:
- The quiz marker (❓) can sit behind the floating label boxes when labels are on in other systems — cosmetic only.
- 3D labels can occasionally overlap top-bar buttons during auto-rotate (inherited from the original design); rotating stops on interaction.
- three.js 0.186 logs deprecation warnings (THREE.Clock, PCFSoftShadowMap) — harmless; can migrate to Timer/PCFShadowMap later.

---

Task ID: 2
Agent: Z.ai Code (scheduled review round 2)
Task: QA re-verification, styling polish pass, and feature expansion (new Neuron topic, Parts Index with mastery tracking, quiz share + history).

Work Log:
- QA baseline: dev server 200s, no page errors, world healthy (active repro:male). Only three.js deprecation warnings present.
- Engine cleanup: replaced deprecated `THREE.Clock` with performance.now()-based time and `PCFSoftShadowMap` → `PCFShadowMap` — console is now warning-free.
- NEW TOPIC — Nerve Cell (Neuron) `src/lib/lab/topics/neuron/`:
  - 8 parts: dendrites (recursive branching tree, seeded RNG for deterministic shape), soma, nucleus, axon hillock, axon, myelin sheath (5 segmented wraps with bulge profile), nodes of Ranvier (oriented torus rings in the gaps), axon terminals (5 branches with bouton blobs).
  - Study text for all parts, 8 labels, explode map, teal accent.
  - Animated "⚡ Nerve Impulse" flow: 2 routes (two dendrite entries → soma → axon → terminals) with fast cyan glowing particles; impulse panel describes saltatory conduction.
  - Registered in `topics/registry.ts` — third menu card appears automatically.
- NEW FEATURE — Parts Index panel (`components/lab/PartsIndex.tsx`):
  - Searchable list of all parts of the active system (name + subtitle), click → select + focus + close.
  - Per-part mastery dots (new / learning / mastered) driven by quiz answers stored in localStorage (`recordPartResult`, `masteryLevel`).
  - Header shows mastered count (x/y 🏅); legend footer; slide-in animation; mobile-responsive.
  - Toggle via new "🔎 Parts" top-bar button or `P` keyboard shortcut.
- NEW FEATURE — quiz persistence upgrades (`lib/lab/quiz/engine.ts`):
  - Per-part mastery store + attempt history (last 30 attempts, `recordAttempt`, `modeHistory`).
  - Quiz-start panel now shows per-mode "recent 84 · 62 · 91%" chips alongside best score.
  - Results panel has a "🔗 Share" button that copies a result summary to the clipboard (with "✅ Copied!" feedback).
  - Name-mode options now flash green/red on answer (`answered` state + .good/.bad styles) and lock after answering.
- Styling pass (mandatory):
  - Soft vignette overlay on the 3D viewport (::after gradients) for depth.
  - Panel entrance animation (bio-rise), Parts Index slide-in, button :active press micro-interaction.
  - Menu cards: shine sweep on hover + 🏅 mastery badge (e.g. "1/8") on topic cards.
  - Keyboard hints restyled as kbd chips; em classes for best/recent chips.
- Agent-browser verification (all passed): 3-topic menu; neuron model renders with recursive dendrites + segmented myelin + terminals; Impulse Path particles; Parts Index open/search/select (search verified with real typing + backspace); neuron quiz (name mode, ❓ marker on node, correct-answer flash, results with Share button + New best); mastery dots update (1/8, "mastered" dot) in index AND on the menu card badge; kbd hint chips render; no runtime errors in console.
- Final lint clean; tsc clean; dev.log 200s.

Stage Summary:
- Lab now has 3 topics (Reproductive Systems ♂♀, Heart & Blood Flow 🫀, Nerve Cell ⚡) — all features (quiz, x-ray, cut, explode, flow, index) work generically per topic.
- New learner loop: quiz answers → per-part mastery → Parts Index dots + menu badges; attempt history + share button round it out.
- Files added: topics/neuron/{data,build,index}.ts, components/lab/PartsIndex.tsx. Files touched: registry.ts, quiz/engine.ts, BiologyLab.tsx, TopBar.tsx, InfoPanel.tsx, TopicMenu.tsx, HintOverlay.tsx, world.ts (clock/shadow), globals.css.

Unresolved issues / risks:
- Playwright `fill("")` does not always propagate to React controlled-input state (test-tool quirk; real typing verified fine) — keep in mind for future QA scripts: use press/keyboard or eval with native setter + input event.
- Neuron label "Cell Body (Soma)" can fall off-screen at some angles (anchor is far left); acceptable, model rotates.
- History chips recompute from localStorage on each quiz-start render — fine at this scale.
Next-phase recommendations:
- Fourth topic (e.g. The Lungs 🫁 with O₂/CO₂ exchange flow, or The Brain).
- Per-topic themed background tints (accent-driven gradient).
- Spaced repetition: "Review missed" across sessions; daily streak counter.
- Optional cloud sync of mastery via Prisma/Vercel Postgres when accounts are added.

---

Task ID: 3
Agent: Z.ai Code (scheduled review round 3)
Task: QA re-verification via agent-browser, then feature expansion: fourth topic (Lungs & Breathing with live breathing animation + gas-exchange flow), per-topic themed background tints, daily study streak, cross-session "Review missed" quiz, plus a styling detail pass.

Work Log:
- QA baseline: dev.log 200s, lint clean, page loads with no console errors; verified menu (3 topics), Heart + Blood Flow toggle, label/panel stacking (a `find text` click failure was diagnosed as the test tool matching hidden CSS2D label divs — UI itself fine; use snapshot refs or eval clicks for QA).
- Engine extension (types.ts + world.ts): new optional `SystemDef.tick({ t, part(key), exploded })` per-frame hook — runs only for the active system; enables idle animations like breathing/heartbeat for any future topic.
- NEW TOPIC — Lungs & Breathing 🫁 `src/lib/lab/topics/lungs/`:
  - 10 parts: trachea (with 8 cartilage rings), right/left main bronchi, bronchioles (7 branch twigs), alveoli (2 grape clusters × 8 sacs), right lung (3 lobes), left lung (2 lobes + cardiac notch gap), pleura (translucent wraps), diaphragm (lathe dome), rib cage (10 translucent arcs + sternum).
  - LIVE BREATHING via the new tick hook: lungs/pleura inflate–deflate ±5% (sin, ~5s cycle) while the diaphragm flattens in counter-phase; base scales stored in `userData.bs` so explode + breathing coexist.
  - Flow "Gas Exchange": 4 particle routes — O₂ in (cyan, nose→trachea→right alveoli), CO₂ out (lavender, left alveoli→exhale), deoxygenated blood arriving (blue) & oxygenated leaving (red) at the sacs.
  - Study text for all parts, 10 labels, explode map, airy cyan accent (#62b8d8), registered in registry.ts → menu shows "4 topics".
- FEATURE — per-topic themed background: `.bio-lab` gets `--topic-accent` + a `.bio-tint` radial glow layer (hexA helper in BiologyLab) tinted by the active topic accent — teal for lungs, warm red for heart, blue for repro.
- FEATURE — daily streak: `loadStreak/touchStreak` in quiz/engine.ts (localStorage, consecutive-day logic); 🔥 N badge next to the top-bar title; touched on every finished quiz.
- FEATURE — Review missed across sessions: missed parts persist per topic (`saveMissed/loadMissed`); quiz-start panel gains a dashed "🔁 Review missed (N)" button that runs a mixed quiz over exactly those keys; cleared when reviewed perfectly.
- BUG FIXES found during QA:
  1. "missed" list included questions abandoned by an early "End quiz" → now only explicit wrong answers ('bad') count; review chips + persistence consistent.
  2. "Perfect! 🎉" showed for 0/13 early-ended quizzes → now requires pct === 100, else "Ended early — nothing new to review."
  3. A transient JSX parse error I introduced in InfoPanel (missing `}`) was caught by the dev server and fixed immediately.
- Styling pass (mandatory): menu icon emoji now sit in glowing accent discs; staggered card entrance animations; top-bar buttons hover/active use `--topic-accent` (+ glow shadow); slider accent-color per topic; panel titles get accent gradient underline; `.bio-q-review` dashed style; `.bio-streak` flame chip; title text-shadow tint.
- Panels/index now set `--panel-accent` CSS var (replaces inline borderLeftColor) so every accent-driven rule follows the system color.
- Agent-browser verification (all passed): 4-topic menu; lungs render + labels; breathing verified numerically (mesh scale 0.959→1.041 over 1.2s); Gas Exchange particles + panel + auto X-ray; part click → info + prev/next (6/10); lungs name-mode quiz incl. wrong-answer feedback; streak badge + day-rollover (simulated yesterday count 4 → 5); Review missed (1) → 1-question mixed quiz → correct → store cleared; Separate (breathing + explode coexist) + Cross-Section on lungs; Parts Index regression on heart; neuron regression (102 pickables); mobile 390px.
- DEPLOY.md refreshed (4 topics in tree, tick-hook mention, "add a topic" example now The Brain).
- Final: lint clean, tsc clean, dev.log 200s.

Stage Summary:
- Lab now has 4 topics: Reproductive Systems ♂♀, Heart & Blood Flow 🫀, Nerve Cell ⚡, Lungs & Breathing 🫁 (first animated topic).
- Engine gained a generic per-system animation hook — future topics can breathe/beat/sparkle with zero engine changes.
- Learner loop is now cross-session: mastery dots + per-topic missed memory + 🔥 daily streak + review-missed quizzes.
- Files added: topics/lungs/{data,build,index}.ts. Files touched: types.ts, world.ts, quiz/engine.ts, BiologyLab.tsx, TopBar.tsx, InfoPanel.tsx, PartsIndex.tsx, registry.ts, globals.css, DEPLOY.md.

Unresolved issues / risks:
- 3D labels can still overlap top-bar buttons at some angles (Trachea label during explode) — cosmetic, stops on interaction.
- `find text` in agent-browser matches hidden CSS2D label divs → QA scripts should click via snapshot refs or eval.
- Streak increments only on finished quizzes (by design); no reminder UI yet.
Next-phase recommendations:
- Fifth topic (The Brain 🧠 with synaptic transmission flow, or Nephron/kidney).
- Streak reminders / calendar heatmap panel; mastery heatmap per topic.
- Cloud sync of progress via Prisma when accounts are added; i18n.

---

Task ID: 4
Agent: Z.ai Code (scheduled review round 4)
Task: QA re-verification via agent-browser, then feature expansion: fifth topic (The Brain 🧠 with neural-signal flows + "thinking" idle animation), Progress/Stats dashboard (4-week activity heatmap, mastery bars, attempt history, reset), plus a styling detail pass.

Work Log:
- QA baseline: lint clean, dev.log 200s, browser console clean; verified menu (4 topics at start), Heart renders with labels, Blood Flow particles + flow panel, 🔥 streak badge. Project judged stable → proceeded to feature work.
- BUG FIXES found & fixed during QA:
  1. Stale quiz-results dots: questions abandoned by an early "End quiz" rendered RED in the results view (Dots treated undefined results as 'bad') → unanswered now stay gray (InfoPanel.tsx Dots).
  2. Cerebrum label drifted behind the top bar at some angles → moved anchor lower/outward (data.ts), Corpus Callosum label pushed back to avoid overlap.
  3. Cortex material rendered washed-out under the strong studio lighting → raised chroma (0xd07e70), lowered envMapIntensity/clearcoat/sheen, softer bump (0.008), deeper gyri folds (amp 0.105).
- NEW TOPIC — The Brain 🧠 `src/lib/lab/topics/brain/` (5th):
  - 9 parts: cerebrum (two hemispheres, custom `gyrify()` vertex displacement = gyri/sulci folds + longitudinal groove), corpus callosum (flattened C-arc), thalamus (twin eggs), hypothalamus, pituitary (stalk + pea), hippocampus (twin seahorse arcs), amygdala (almonds), cerebellum (striped orb via canvas stripe bumpMap), brainstem (midbrain/pons-bulge/medulla + spinal cord continuation).
  - Study text for all 9 parts, 9 labels, explode map, violet accent (#c99df0), registered in registry.ts → menu shows "5 topics" automatically.
  - Flow "Neural Signals": 3 routes — sensory up (cyan, cord→thalamus→cortex), motor down (orange, cortex→cord, crosses), limbic loop (pink, hippocampus→hypothalamus→amygdala→back) with colored route panel.
  - NEW idle animation via tick hook: subtle CSF "thinking" pulse on cerebrum/cerebellum (±0.6%, userData.bs base scales) + 16 twinkling neural-spark glow sprites (deterministic seeded RNG, sine^3 opacity envelope) as decor.
- NEW FEATURE — StatsPanel `components/lab/StatsPanel.tsx` ("📊 Progress" top-bar button, `G` shortcut):
  - 🔥 streak chip (flicker animation) + GitHub-style 4-week activity heatmap (7×4 grid, lv1–lv3 green cells, future days hidden, tooltips "N quizzes · date"), legend swatches.
  - Mastery roll-up: per-topic progress bars (accent gradient) + total (x/64 🏅); current topic row highlighted.
  - Recent quizzes list (last 8, newest first): topic emoji, mode, color-coded %, ok/total · secs · time-ago.
  - Danger zone: two-step "Reset all progress" (arm → confirm, 4s timeout) wiping best scores, mastery, history, missed, streak, activity; UI state resets live.
  - Panel exclusivity: opening Parts closes Progress and vice versa (buttons + P/G keys); StatsPanel remounts fresh on open via key prop.
- Engine additions (`quiz/engine.ts`): `loadActivity/bumpActivity` (bio-lab-activity, per-day quiz counts) and `clearAllProgress()`; `bumpActivity` + history reload wired into `endQuiz` in BiologyLab.
- Styling pass (mandatory): menu title now accent-gradient text; card :active press micro-interaction; streak chip flicker; best-score chip restyled as glowing pill; quiz dots transition + scaleY on current; loading ring uses topic accent; new heatmap/mastery/attempt/reset styles; mobile tweaks (heatmap cell 13px, stats max-height 56vh); reduced-motion covers new animations.
- DEPLOY.md refreshed: brain/ in tree + PartsIndex/StatsPanel listed; "add a topic" example now The Kidney.
- Agent-browser verification (all passed): 5-topic menu with gradient title; brain model (folds, cerebellum stripes, brainstem+cord) + 9 labels; part click → info + prev/next (Cerebellum 8/9); Neural Signals particles + auto X-ray + 3-route panel; name-mode quiz (❓ marker, options, correct flash, results "2/9 · 22% · 🏆 New best"); stats panel (streak chip, heatmap lv3 today, mastery 2/64 with Brain 2/9 highlighted, history row); reset flow (arm → wipe → storage verified empty, streak badge gone); Separate explode (hemispheres split, CC lifted, cord down); X-ray on mobile 390px (thalamus visible through cortex, top bar wraps); Parts Index 0/9 after reset; Cross-Section slices cortex; Heart regression; final lint clean, tsc clean, dev.log 200s.

Stage Summary:
- Lab now has 5 topics: Reproductive Systems ♂♀, Heart & Blood Flow 🫀, Nerve Cell ⚡, Lungs & Breathing 🫁, The Brain 🧠.
- New learner-facing dashboard closes the loop: activity heatmap + streak + mastery bars + attempt history + reset — all localStorage, zero backend.
- Files added: topics/brain/{data,build,index}.ts, components/lab/StatsPanel.tsx. Files touched: registry.ts, quiz/engine.ts, BiologyLab.tsx, TopBar.tsx, InfoPanel.tsx, HintOverlay.tsx, globals.css, DEPLOY.md.

Unresolved issues / risks:
- The brain's cerebrum still reads pale-pink under the shared studio lighting (same lights as every topic); raising chroma further would look artificial. Could add per-topic light presets later.
- 3D labels can still overlap top-bar buttons at some rotation angles (inherited design); rotating stops on interaction.
- agent-browser `find text` matches hidden CSS2D label divs — use eval clicks / snapshot refs for QA.
- StatsPanel "Recent quizzes" list renders inside a scrollable panel; bottom entries need scroll on short screens (by design).

Next-phase recommendations:
- Sixth topic (Nephron/Kidney 🫘 or The Eye 👁) — registry + folder only.
- Cloud sync of progress via Prisma when accounts exist; shareable progress snapshot image.
- Quiz "due for review" scheduling (spaced repetition using mastery + activity data already in storage).
- Per-topic light presets (dimmer key light for pale organs like brain).

---

Task ID: 5
Agent: Z.ai Code (scheduled review round 5)
Task: QA re-verification via agent-browser, then: sixth topic (The Eye 👁 with light-adaptation animation), per-topic light presets (fixed washed-out brain), spaced-repetition "Due today" scheduling, score donut + quiz progress bar, styling & a11y detail pass.

Work Log:
- QA baseline: dev.log 200s, lint clean, tsc clean, browser console clean; 5-topic menu + topbar verified → project stable, proceeded to features.
- ENGINE — per-topic light presets (`types.ts` LightPreset + `world.ts`):
  - Lights promoted to class fields (hemi/key/rim/fill) + `lightGoal`; `applyLighting()` runs on every `setActiveSystem`; intensities + tone-mapping exposure lerp toward goals each frame (0.06 factor) → smooth cross-fade between topics.
  - Brain got `lighting: { key: 1.75, rim: 1.45, fill: 0.4, exposure: 1.0 }` — resolves the long-standing "washed-out pale cortex" risk; verified numerically (key 1.79, exposure 1.01 after settle) and visually (gyri now read rich pink).
  - Eye uses a slightly softened preset (key 2.25, exposure 1.08); all other topics keep studio defaults.
- NEW TOPIC #6 — The Eye 👁 `src/lib/lab/topics/eye/` (data.ts, build.ts, index.ts):
  - 11 parts: sclera (real front opening via sphere theta cut + limbus ring decor), transparent cornea dome, canvas-textured iris ring (radial gradient + 90 stochastic stroma spokes + crypt blotches, planar-mapped RingGeometry), pupil (dark disc), biconvex lens, ciliary ring + 12 zonule line fibers, faint vitreous gel sphere, back-opening retina cup (DoubleSide, emissive), macula spot, optic nerve cable with sheath bulge + optic disc, 4 extraocular muscle straps (2 mirrored).
  - Tick animation "light adaptation": pupil scale cycles 0.5→1.1 (~7.4 s) while lens fattens/shifts in coupled counter-phase (accommodation); ciliary ring pulses subtly; all skipped while exploded. Verified numerically: pupil scale 0.664→1.091→0.569, lens z 0.498→0.536.
  - Flow "Visual Pathway": 2 converging light rays (white-cyan, cornea→lens→macula) + neural signal (gold, macula→nerve→brain edge) + explanatory panel (upside-down image, brain flips it).
  - Amber accent (#e2b45f topic / #e8c06a system); 11 labels; explode map (cornea/iris/pupil/lens forward, sclera up, retina/macula/nerve back); quizSkip: cornea; skipSkinHover: cornea; inner: lens/ciliary/vitreous/retina/macula. Registered → menu auto-shows "6 topics".
- FEATURE — spaced repetition "Due today":
  - `PartMastery.at` timestamp recorded on every answer; `isDue()` in quiz/engine (learning → refresh after 1 day, mastered → after 5 days, never-answered never due, legacy saves safe).
  - BiologyLab computes `dueKeys` via useMemo(topicId, mastery) → quiz-start panel gains "📅 Spaced review (N)" button (amber, runs mixed quiz over due keys); TopicMenu shows pulsing "📅 N due" chip on topic cards.
  - Verified with seeded timestamps: badges appeared on correct cards, due quiz started on the right part, badge cleared after answering (at refreshed).
- STYLING/DETAILS pass (mandatory):
  - Quiz results: SVG score donut (accent ring, animated stroke-dashoffset, drop-shadow glow) + encouraging meta line + aria label (replaces plain text row).
  - Quiz question: thin accent progress bar under the head (width = idx/total).
  - `.bio-q-due` solid-amber chip style; `.bio-card-due` pulsing badge; focus-visible outlines on all lab buttons/cards/labels (a11y); reduced-motion covers new animations.
- QA via agent-browser (all passed): 6-topic menu with badges (🏅 2/26, 🏅 1/11 + 📅 1 due, 🏅 1/11); eye model + 11 labels; iris label click → info (3/11 nav); Visual Pathway + auto X-ray; name-mode quiz on eye (marker visible, clicked marker position → "✔ Correct!"); results donut 9% "1/11 · 🏆 New best" with gray abandoned dots; Separate on eye (sclera lifts, optics stack separates) + Cross-Section slice; X-ray layering; Parts Index on eye (11 items, 1/11 🏅); heart regression + light lerp back to defaults (key 2.33→2.6 mid-flight); mobile 390px (no horizontal overflow, donut renders).
- Note: "2 Issues" dev-overlay badge during QA was caused by my synthetic PointerEvents (OrbitControls setPointerCapture without a real pointer) — test-tool artifact, not an app bug.
- DEPLOY.md refreshed: eye/ in tree, lighting preset + new tick examples, registry example includes eyeTopic.
- Final: lint clean, tsc clean, dev.log 200s, console clean on fresh load.

Stage Summary:
- Lab now has 6 topics: Reproductive Systems ♂♀, Heart & Blood Flow 🫀, Nerve Cell ⚡, Lungs & Breathing 🫁, The Brain 🧠, The Eye 👁.
- Engine now supports per-topic lighting presets with smooth cross-fades — pale organs no longer wash out.
- Learning loop gained spaced repetition: answers stamp `at`, due parts surface as menu chips + a one-click "📅 Spaced review" quiz; results got a score donut; questions got a progress bar.
- Files added: topics/eye/{data,build,index}.ts. Files touched: types.ts (LightPreset), world.ts (light rig), quiz/engine.ts (at + isDue), BiologyLab.tsx (dueKeys), InfoPanel.tsx (due button, donut, progress), TopicMenu.tsx (due chips), registry.ts, globals.css, DEPLOY.md.

Unresolved issues / risks:
- The eye's cutaway window makes the globe look lopsided from angles where the cornea faces away — intentional (real cutaway anatomy), rotate to re-frame.
- 3D labels can still overlap top-bar buttons at some rotation angles (inherited design); rotating stops on interaction.
- agent-browser synthetic pointer events can throw benign setPointerCapture dev-overlay errors — use label-clicks/eval for QA scripts.
- Spaced-review intervals (1d/5d) are simple fixed heuristics, not a real SM-2 scheduler — fine at this scale.

Next-phase recommendations:
- Seventh topic (Nephron/Kidney 🫘, or The Ear 👂).
- Streak reminders / calendar heatmap already exist — add "due tomorrow" forecast to StatsPanel.
- Cloud sync of mastery via Prisma when accounts exist; i18n.
- Optional: replace heuristics with a lightweight SM-2 variant once per-part review counts grow.

---

Task ID: 6
Agent: Z.ai Code (scheduled review round 6)
Task: QA re-verification via agent-browser, then: seventh topic (The Ear 👂 with parametric cochlea spiral + vibration idle + Sound Wave Journey flow), StatsPanel "Review forecast" (7-day spaced-repetition chart), persisted mute preference, celebration chip for fully-mastered topics, styling detail pass.

Work Log:
- QA baseline: dev.log 200s, lint clean, tsc clean, browser console clean; menu (6 topics), Heart + labels + quiz panel (3 modes), fresh-profile state correct (best 0%). Project stable → proceeded to features. (Note: agent-browser fresh profile = empty localStorage, so streak/mastery start at zero — not a bug.)
- BUG/DESIGN FIXES during ear development:
  1. First ear layout had a balloon-sized pinna that occluded the entire inner ear (cochlea invisible — only its cast shadow showed). Rebuilt: pinna flattened to a compact disc + helix rim placed IN FRONT of the concha, ossicles rearranged as an ascending staircase, cochlea + canals raised up-left into clear view, camera moved to front-left ([-1.9, 0.85, 6.2]).
  2. First tick used rotation.z on ossicle meshes — but tube/blob geometries are modeled in world coords (object origin at world center), so rotation swings them around the origin. Switched to explode-safe position jitter around a lazily-captured base (userData.bp); verified applyExplode rewrites position from its own base, so no conflict.
  3. Caught a rules-of-hooks violation in my first StatsPanel forecast draft (useMemo after the early `return null`) — converted to a plain computation before it shipped.
- NEW TOPIC #7 — The Ear 👂 `src/lib/lab/topics/ear/` (data.ts, build.ts, index.ts):
  - 10 parts: pinna (concha disc + helix/antihelix C-tori + lobe + tragus), ear canal (open-bore DoubleSide tube — you can peer at the drum), tilted pearl eardrum, malleus + incus + stapes (bone chain scaled ~1.5× for study), cochlea — a true 2¾-turn parametric spiral (spiralPoints(): flat XY spiral, tilt-rotated about X, translated; taperedTube radius shrinks 0.078→0.036; modiolus cap), 3 interlocking semicircular canal rings with ampulla bulges (pivot groups), vestibulocochlear nerve, eustachian tube.
  - Tick "vibration": eardrum scale flutter (±3%, sin t·9) → ossicle position jitter with phase lag down the chain → cochlea emissive glow pulse (0.22+0.16·sin t·2.1). Skipped while exploded; verified numerically (drum scale 1.0701→1.0198, stapes x 0.1186→0.1076 over 0.5 s).
  - Flow "Sound Journey": 4 routes — sound waves (white-green, air→canal→drum), bone levers (gold, drum→malleus→incus→stapes), fluid wave (green, follows the spiral points INTO the cochlea — the spiral doubles as a flow curve), nerve signal (cyan, cochlea→brainstem). Color-keyed flow panel.
  - Study text for all 10 parts, 10 labels, explode map (ossicle chain fans up, cochlea/canals separate left-up), lime-green accent (#a3c96a/#b1d37c). Registered in registry.ts → menu auto-shows "7 topics".
- FEATURE — StatsPanel "📅 Review forecast": new `daysUntilDue(m)` in quiz/engine.ts (fractional days until due: learning→1d, mastered→5d, never→∞); StatsPanel buckets ALL topics' parts into the next 7 days and renders a mini bar chart (Today/Tmrw/+2d…+6d, accent-gradient bars, count badges, tooltips, empty-state message, "N due this week" total). Verified with a real answer: due in 5 days → bar on +4d (floor(4.99)).
- FEATURE — mute preference persists: loadMuted/saveMuted in sound.ts ('bio-lab-muted'); restored on mount before any sound; toggleMute saves. Verified: 🔇 + stored "1" survives reload.
- FEATURE — menu cards show a pulsing "🎉 100%" chip (green) when a topic is fully mastered (replaces the partial 🏅 badge in that case).
- Styling pass (mandatory): .bio-fc forecast chart (gradient bars + glow + hover brightness); .bio-card-win celebration chip + keyframes; reduced-motion covers both; forecast bar height transition. Ear card shows lime disc + 🏅 1/10 badge.
- Agent-browser verification (all passed): 7-topic menu incl. ear card; ear model renders (spiral clearly visible, canal rings interlock, ossicle chain reads) + 10 labels; Sound Journey flow + auto X-ray + 4-route panel; vibration tick numeric check; Separate explode (each ossicle separates, spiral gorgeous) + slider; name-mode quiz (❓ marker on canals, options, correct answer, results donut 10% + 🏆 New best + gray abandoned dots + "Ended early" line); streak 🔥1; StatsPanel forecast (+4d bar) + mastery 1/85 across 7 topics with Ear highlighted; Parts Index on ear (10 parts, search, legend); mute persistence across reload; heart cross-section regression; lungs breathing regression (rlung 0.789→0.852); mobile 390px (no horizontal overflow).
- DEPLOY.md refreshed: ear/ in tree, tick examples updated (ossicle vibration), cochlea spiral note.
- Final: lint clean, tsc clean (only pre-existing sandbox examples/skills errors), dev.log 200s, console clean.

Stage Summary:
- Lab now has 7 topics: Reproductive Systems ♂♀, Heart & Blood Flow 🫀, Nerve Cell ⚡, Lungs & Breathing 🫁, The Brain 🧠, The Eye 👁, The Ear 👂 (85 quizable parts total).
- The ear showcases two engine firsts: a parametric spiral reused as BOTH geometry and a flow curve, and a pivot-group ring cluster for the canal loops.
- Learning dashboard gained a 7-day spaced-repetition forecast; sound preference now persists; full-mastery topics celebrate on the menu.
- Files added: topics/ear/{data,build,index}.ts. Files touched: registry.ts, quiz/engine.ts (daysUntilDue), engine/sound.ts (loadMuted/saveMuted), StatsPanel.tsx (forecast), TopicMenu.tsx (win chip), BiologyLab.tsx (mute restore), globals.css, DEPLOY.md.

Unresolved issues / risks:
- The pinna still reads slightly "cup-like" from some angles — acceptable stylization; X-ray/explode reveal inner anatomy clearly.
- Ossicles are intentionally ~1.5× oversized for clickability; noted in study text scale is exaggerated.
- The ear quiz 'find' mode is hard for the tiny ossicles — zooming in is required (same as eye's macula).
- Spaced-review forecast buckets use floor(days) — a part due exactly 5.0 days out lands on +4d due to elapsed-time drift; harmless.
- Mute icon state after restore is verified via DOM; no automated audio test (WebAudio needs a user gesture).

Next-phase recommendations:
- Eighth topic (Nephron/Kidney 🫘, The Skin 🧴, or a plant cell 🌱 for variety).
- "Due today" one-click review exists — add a notification dot on the Progress button when forecast > 0.
- SM-2 style scheduler once per-part review counts grow; cloud sync via Prisma when accounts exist.
- Per-topic menu preview images (render a small canvas snapshot per topic).

---

Task ID: 7
Agent: Z.ai Code (scheduled review round 7)
Task: QA re-verification via agent-browser, then: eighth topic (Nephron & Kidney 🫘 with textbook "zoom cone" spread layout + Filtration Journey flow), Progress-button due-notification dot, progress JSON export in StatsPanel, styling detail pass.

Work Log:
- QA baseline: dev.log 200s, lint clean, tsc clean (only pre-existing sandbox examples/skills errors), menu rendered 7 topics, Heart topic + labels OK, browser console clean. Project stable → proceeded to features per worklog recommendations.
- NEW TOPIC #8 — Nephron & Kidney 🫘 `src/lib/lab/topics/kidney/` (data.ts, build.ts, index.ts), 13 quizable parts (total now 98):
  - Textbook spread layout: the kidney bean on the RIGHT with a displaced-sphere hilum dent (custom beanGeo(): smooth quadratic pole push on -X) + a phi-cut cutaway opening (DoubleSide shell + darker inner lining), and ONE nephron blown up to study size on the LEFT — Bowman's cup (theta-cut translucent sphere, opening tilted toward the tubule), a 9-blob glomerulus knot with afferent/efferent arterioles, coiled PCT, U-shaped Loop of Henle hairpin, DCT, and a flared collecting duct with two faint "×1,000,000" sibling nephrons behind.
  - A "magnified view" zoom cone (small torus at the cortex, big faint ring around the nephron, 2 thin connector tubes) ties the two regions together — an engine-first decorative device.
  - Inside the bean: medulla mass, 3 flattened fan-angled renal pyramids (cones, apex → hilum), pelvis funnel + 3 calyx cups, ureter, branching renal artery (4 tubes), renal vein.
  - Flow "Filtration Path": 4 color-keyed routes — dirty blood (red, artery → zoom jump → afferent), filtrate (gold, glomerulus → capsule → PCT → Henle → DCT → duct, 9 particles), urine out (green-gold, duct → zoom out → pelvis → ureter), clean blood (blue, efferent → peritubular → vein). Auto X-ray + flow panel with color legend.
  - Tick "filtration pulse": glomerulus emissive beat → phase-offset shimmer down pct/henle/dct/duct → ureter peristaltic wobble (explode-safe bp jitter) → pelvis squeeze. Skipped while exploded.
  - Copper/peach accent (#d98d5f topic / #e0a172 system); 13 labels; explode map fans bean layers up/down and nephron parts left; inner: medulla/pyramid/pelvis/capsule/glomerulus/pct/henle/dct; skipSkinHover: cortex/capsule.
  - Camera tuned during QA from [0.35,0.3,7.8] → [-0.75,0.55,7.5] so the hilum face + cutaway interior read immediately on load.
- FEATURE — Progress-button due dot: new global `dueTotal` (all topics, useMemo on mastery) in BiologyLab → TopBar gets `dueCount` prop → pulsing amber `.bio-due-dot` renders on the 📊 Progress button when > 0 (aria-label with count, pointer-events none). Verified with seeded timestamps (henle 2d-ago learning + cochlea 6d-ago mastered → dot visible; menu cards also show "📅 1 due" chips on both topics).
- FEATURE — Export progress: `⬇️ Export progress` button in StatsPanel danger zone (next to reset, space-between layout) downloads the whole study profile as `bio-lab-progress-YYYY-MM-DD.json` (mastery, streak, activity, history, exportedAt, version) via Blob + a.click().
- STYLING pass (mandatory): `.bio-export` green dashed button w/ glow hover + active scale; `.bio-stats-danger` → space-between; `.bio-due-dot` radial-gradient amber dot + bio-due-pulse keyframes (scale + glow breathing); both new animations covered by prefers-reduced-motion.
- Agent-browser verification (all passed): menu shows 8 topics incl. kidney card; kidney render + 13 labels (cutaway, nephron, zoom cone all read clearly); label click → Loop of Henle info (11/13 nav); Filtration Path flow + auto X-ray + 4-route color panel (particles visibly cross the zoom gap); Separate explode fans all 13 parts + slider; name-mode quiz options render; due-dot visible after seeding; Progress panel: forecast "3 due this week" (2 Today + 1 +4d), mastery 2/98 with Nephron & Kidney 0/13 row, Export button present and clickable; "📅 Spaced review (1)" button on kidney → due quiz targeted Loop of Henle with click-through hint → clicked the hairpin on-model → 100% results; heart regression (X-ray + Blood Flow circuits); mobile 390px no horizontal overflow.
- DEPLOY.md refreshed: kidney/ in tree, tick examples updated (glomerulus pulse + tubule shimmer), "add a topic" template now copies kidney/ and the registry example includes 9 topics.
- Final: lint clean, tsc clean, dev.log 200s, browser console clean on fresh load.

Stage Summary:
- Lab now has 8 topics: Reproductive Systems ♂♀, Heart & Blood Flow 🫀, Nerve Cell ⚡, Lungs & Breathing 🫁, The Brain 🧠, The Eye 👁, The Ear 👂, Nephron & Kidney 🫘 (98 quizable parts total).
- The kidney introduces two engine-pattern firsts: displaced-sphere custom bean geometry (hilum dent) and a "magnified view" zoom-cone device connecting a real organ to its microscopic blow-up — reusable for future cellular topics (alveolus, synapse, plant cell).
- Learning loop surfaced into the main toolbar: any due part now pulses an amber dot on the Progress button; whole profile can be exported as JSON for backup.
- Files added: topics/kidney/{data,build,index}.ts. Files touched: registry.ts, BiologyLab.tsx (dueTotal), TopBar.tsx (dueCount + dot), StatsPanel.tsx (export), globals.css, DEPLOY.md.

Unresolved issues / risks:
- On narrow portrait screens the kidney's wide spread (~6.5 units) crops at the edges more than other topics — pinch/scroll zoom handles it, but a per-aspect camera fit could be added later.
- The vein's purple is close to the Henle violet at a glance — flow colors + labels disambiguate; could nudge hue if it bothers.
- The cutaway opening faces the hilum (-X): from the default camera the interior is visible but subtle; rotating reveals more (consistent with other topics' cutaways).
- Export downloads only local localStorage data (by design) — no import/restore yet (import would be the natural next step).
- agent-browser synthetic pointer events remain unreliable for canvas part-clicks (needed 3 attempts to hit the thin Henle tube) — QA artifact, not an app bug.

Next-phase recommendations:
- Ninth topic: The Skin 🧴 (layers + hair follicle + sweat gland, naturally reuses the zoom-cone device) or a Plant Cell 🌱 for non-human variety.
- Import/restore from exported JSON (pair with the export button; enables moving progress between devices).
- Per-topic menu preview images (small canvas snapshot per topic) — repeated recommendation.
- SM-2 style scheduler once per-part review counts grow; cloud sync via Prisma when accounts exist.

---
Task ID: 8
Agent: Z.ai Code (scheduled review round 8)
Task: QA re-verification via agent-browser, then: ninth topic (The Skin 🧴 — cross-section block with hair factory, sweat system, goosebumps tick), progress import/restore (pairs with export), topic-menu search, styling detail pass.

Work Log:
- QA baseline: dev.log 200s, lint clean, tsc clean (only pre-existing sandbox examples/skills errors), menu rendered 8 topics, kidney topic regression OK (bean cutaway + nephron + zoom cone + 13 labels render), browser console clean. Project stable → proceeded to features per worklog recommendations.
- NEW TOPIC #9 — The Skin 🧴 `src/lib/lab/topics/skin/` (data.ts, build.ts, index.ts), 13 quizable parts (total now 111):
  - A textbook cross-section BLOCK: three wavy, interlocking histology layers built with a new `layerSlab()` helper — a BoxGeometry whose every vertex column is remapped between two shared boundary wave functions (surf/rete/dermB/fatB), so the epidermis↔dermis boundary genuinely interlocks like rete ridges and side faces stay wavy too.
  - Engine pattern first — "ghost-shell" layers: slab materials are transparent (opacity .8–.92) with `depthWrite: false` + `renderOrder 3`, so the opaque appendages INSIDE stay visible through the tissue walls without sorting glitches; appendages live at z≈0 mid-depth.
  - Hair factory (right): shaft (tube + tip cap) rising off the surface, translucent follicle sheath diving to a bulb, dermal papilla glowing inside the bulb, arrector pili muscle slung from follicle to epidermis base, 4-blob sebaceous gland with a duct into the follicle.
  - Sweat system (left): parametric coiled gland (3D knot loop generated procedurally), S-curved duct rising to a torus pore trumpet on the surface.
  - Right edge: artery + vein + a capillary loop pair reaching up under the epidermis; left edge: nerve trunk with an elongated Meissner corpuscle just under the surface and a deep Pacinian "onion".
  - Fat lobule blobs scattered through the translucent hypodermis.
  - Tick "goosebumps pulse": slow ~4.5 s chill rhythm — arrector contracts (position shift), hair is yanked upright (+0.026 rise, explode-safe bp), vessels flush, sweat gland shimmers, sebum beats. Verified numerically: hair y 2.0013 → 1.9800 → 1.9800 across samples.
  - Flow "Skin Traffic": 4 color-keyed routes — blood flush (red, artery → capillary loop → vein), sweat lift (blue, coil → duct → pore → out), nerve spark (green, trunk → Meissner), sebum slick (gold, gland → follicle → up the shaft). Auto X-ray + 4-route panel. Copper/tan accent (#c98a63 topic / #d8a07d system); 13 labels; explode map peels the three layers vertically and fans appendages sideways; inner: dermis/hypodermis/follicle/papilla/sebaceous/sweatGland/duct/vessel/nerve; skipSkinHover: all three slabs.
  - Camera tuned: [0.2, 0.3, 7.2] → target [0, 0.05, 0]; hair label anchor lowered 2.3 → 2.02 during QA so it clears the toolbar.
- FEATURE — Import/restore progress: `ProgressBackup`/`RestoreResult` types + `restoreProgress()` in quiz/engine.ts (validates `app` tag + shapes, sanitizes mastery/streak/activity/history, writes the four localStorage keys only after validation). StatsPanel gains an "⬆️ Import" button (hidden sr-only file input, accept=.json) + transient status pill (✅ Restored N part records / ⚠️ reason), auto-clears after 5 s; BiologyLab passes `onImport` that reloads all state from localStorage. Verified full round-trip: seeded backup → "✅ Restored 4 part records + history" → streak 🔥3, 4/111 mastery (Heart 1/11, Ear 1/10, Skin 2/13), imported 82% attempt in Recent quizzes, forecast jumped to 4 due today; bogus file → "⚠️ not a Biology 3D Study Lab backup".
- FEATURE — Topic menu search: pill search bar filters the 9 cards by title/tagline/parts/description (useMemo, state hoisted above the `open` early-return per rules-of-hooks), clear button, dashed empty-state "No topic matches …". Verified: "sweat" → 1 card (The Skin), gibberish → empty state, clear → 9 cards.
- STYLING pass (mandatory): .bio-menu-search pill (glass bg, topic-accent focus ring + glow, hover clear btn); .bio-menu-empty dashed card w/ slide-in; .bio-import amber dashed button pairing with the green .bio-export (+ hover glow, active scale); .bio-import-status ok/bad pills with bio-status-in keyframe; .bio-backup-btns row; reduced-motion covers new animations; mobile: danger zone stacks vertically + backup buttons center.
- Agent-browser verification (all passed): 9-topic menu incl. skin card; menu search filter/clear/empty; skin render + 13 labels (wavy layers, hair factory, lobules all read); label click → follicle info; Skin Traffic flow + auto X-ray + 4-route panel (sweat particles visibly climb the duct); goosebumps tick numeric check; Separate explode peels the 3 layers + slider; name-mode quiz options render, answer advances, results screen 0/13; Progress panel: 111 total parts, skin row, streak, forecast; import round-trip + invalid-file error; heart regression (36 labels, X-ray); mobile 390px no horizontal overflow.
- DEPLOY.md refreshed: skin/ in tree, tick examples updated (goosebumps pulse), "add a topic" template now copies skin/ and the registry example includes 10 topics.
- Final: lint clean, tsc clean, dev.log 200s, browser console clean on fresh load; QA test data wiped from localStorage after verification.

Stage Summary:
- Lab now has 9 topics: Reproductive Systems ♂♀, Heart & Blood Flow 🫀, Nerve Cell ⚡, Lungs & Breathing 🫁, The Brain 🧠, The Eye 👁, The Ear 👂, Nephron & Kidney 🫘, The Skin 🧴 (111 quizable parts total).
- The skin introduces two engine-pattern firsts: the `layerSlab()` wave-remapped box (any two functions define an interlocking boundary — reusable for tooth/gum, stomach wall, tree bark) and the ghost-shell translucent-body recipe (depthWrite:false + renderOrder) that keeps hidden anatomy visible without a literal cutaway — reusable for the plant cell, an alveolus, or a synapse.
- Progress is now fully portable: export → JSON → import on any device, with shape validation guarding against stray files.
- The menu became searchable at 9 topics — scales to 15+ without scrolling fatigue.
- Files added: topics/skin/{data,build,index}.ts. Files touched: registry.ts, quiz/engine.ts (restoreProgress), StatsPanel.tsx (import UI + status), BiologyLab.tsx (onImport), TopicMenu.tsx (search), globals.css, DEPLOY.md.

Unresolved issues / risks:
- The epidermis slab seen from below (after Separate) reads brownish (backface of the tan shell) — acceptable, reads like the underside of a carpet; could add an inner lining mesh later if it bothers.
- Ghost-shell transparency means the slabs never fully occlude the appendages even at opacity .92 — a deliberate trade for readability; X-ray/explode still add more detail on top.
- Import restores mastery/streak/activity/history only (best scores under `bio-lab-best:*` are not in the backup yet — export would need to collect the keyed entries; natural next step).
- On very narrow screens the skin block's 5.2-unit width crops at the edges — pinch zoom handles it (same note as kidney).
- The goosebumps hair rise is subtle (0.026 units) by design; verified numerically, visible when zoomed on the follicle.

Next-phase recommendations:
- Tenth topic: Plant Cell 🌱 (non-human variety; ghost-shell + layerSlab patterns fit perfectly) or The Tooth 🦷 (enamel/dentin/pulp layering).
- Include `bio-lab-best:*` keyed entries in the export payload (and restore), making the backup truly complete.
- Per-topic menu preview images (small canvas snapshot per topic) — recommended three rounds running; would pair nicely with search.
- SM-2 style scheduler once per-part review counts grow; cloud sync via Prisma when accounts exist.

---
Task ID: 9
Agent: Z.ai Code (scheduled review round 9)
Task: QA re-verification via agent-browser, then: tenth topic (Plant Cell 🌱 — non-human variety), complete export/import with best scores, per-topic menu 3D preview images, styling pass, engine fix for quiz markers on multi-mesh parts.

Work Log:
- QA baseline: dev.log 200s, lint clean, tsc clean, menu rendered 9 topics + search, skin topic regression OK (13 labels, wavy layers), browser console clean, menu scroll verified (agent-browser wheel events don't reach the scrollable box — QA artifact, programmatic scroll works). Project stable → proceeded to features per worklog recommendations.
- NEW TOPIC #10 — Plant Cell 🌱 `src/lib/lab/topics/plantcell/` (data.ts, build.ts, index.ts), 13 quizable parts (total now 124):
  - Rounded-box cell built with a new `cellShell()` helper — BoxGeometry vertices pulled toward rounded corners then given a subtle organic sag/bulge, so it reads as living, not CAD. Three nested ghost shells: cellulose wall (green, opacity .26), membrane (gold, .2), cytoplasm fill (.07) — tuned down across two QA passes because the stacked DoubleSide tints milked out the organelles.
  - Organelles: giant opaque pearly-blue vacuole (made OPAQUE in QA — transparency diluted it into the shells), nucleus translucent shell with nucleolus + 3 chromatin squiggle tubes inside, rough-ER as two nested wavy arcs hugging the nucleus (+ ribosome studs as decor), 4-arc Golgi stack with budding vesicles, 3 chloroplast lenses each with 3 grana discs inside, cristae-pleated mitochondrion, 12 free ribosome dots, 3 plasmodesmata tubes drilling through the wall.
  - Flow "Cell Current": 4 color-keyed routes — cyclosis swirl (8 white-green particles loop the perimeter on the streaming tide), sugar load (gold, chloroplast → vacuole pantry), ATP sparks (orange, mitochondrion → ribosome clusters), protein export (green, nucleus → ER → Golgi → plasmodesma out). Auto X-ray + 4-route panel.
  - Tick "streaming shimmer": chloroplasts/ribosomes/mitochondrion drift on phase-offset sine tides (explode-safe bp), vacuole turgor-breathes via scale, chloroplast green glow beat, membrane turgor glow, nucleolus factory pulse.
  - Green accent (#6da96b topic / #83c07f system); 13 labels; explode pops wall/membrane/cytoplasm forward and fans organelles sideways; inner: membrane/cytoplasm/vacuole/nucleolus/chromatin/er/golgi/ribosome; skipSkinHover: wall/membrane/cytoplasm.
  - Label QA iterations: Cell Membrane was hidden behind the info panel → moved to mid-left; Chromatin/ER anchors overlapped → separated; chromatin's long leader line crossed the whole view → re-anchored to the right side under the nucleus.
- ENGINE FIX — Quiz marker on multi-mesh parts: `setQuizMarker`/`focusPart` used the bounding-box center of ALL a part's meshes; for spread-out parts (3 chloroplasts, 12 ribosomes) the ❓ marker landed in EMPTY space mid-cell — answerable only by guessing. New `bestMeshCenter(fullKey)` picks the mesh whose own center is nearest the camera target. Verified numerically in a full name-mode run: chloroplast → (0.97, −0.90) = the actual lens [0.95, −0.88]; ribosome → a real dot (0.35, 0.55); single-mesh parts (vacuole/nucleolus/golgi) unchanged.
- FEATURE — Complete export/import: new `collectBestScores()` sweeps the keyed `bio-lab-best:*` entries; export payload bumped to **version 2** with a `best` map; `restoreProgress` validates (0–100, non-empty key) and writes them back; RestoreResult carries `best` count; import status pill now reads "✅ Restored N part records · M best scores + history". Round-trip verified: seeded 2 best scores → export JSON contains them → wiped localStorage → file-injected import → both keys restored with correct values → status pill verified.
- FEATURE — Menu 3D previews (recommended 3 rounds running): new `src/lib/lab/engine/snapshot.ts` — sequential request queue + memory cache; each preview renders the topic's DEFAULT system in a scratch scene using the system's own `build()` (same module as the viewer), the world's light preset + RoomEnvironment + ACES at 420×260, camera at the system's framing rotated ~28° for a livelier ¾ pose; full teardown (textures/materials/geometries/PMREM/context) after each shot. TopicMenu cards get a `CardPreview` component: shimmer skeleton while queued → JPEG fades in behind the card content (masked, opacity .55 → .85 on hover/active; dimmer on mobile). Verified: 10/10 previews loaded as data-URLs, 0 stuck skeletons, no console errors.
- STYLING pass (mandatory): `.bio-card-preview` system (img mask + fade overlay + sheen skeleton animation); hover/active preview brightening; mobile opacity tuning; reduced-motion covers the new animations; z-index layering keeps emoji chip + text above the image; DEPLOY.md tree duplicate `ear/` line fixed.
- Agent-browser verification (all passed): 10-topic menu incl. plant cell card with preview + mastery badge; plant cell render + 13 labels after tuning; Cell Current flow + auto X-ray + 4-route panel with visible particles; Separate explode at 0.60 fans the shells/organelles + slider; label click → Golgi info (9/13 nav); name-mode quiz renders options, find-mode shows the click-through hint; quiz marker fix verified across 13 questions; Progress panel shows 0/124 total + Plant Cell row; export v2 payload + import round-trip + status pill; mobile 390px: no horizontal overflow, mastery list + backup buttons fine; browser console clean.
- QA test data wiped from localStorage after verification.
- DEPLOY.md refreshed: plantcell/ in tree, tick example updated (streaming tide), "add a topic" template now copies plantcell/ with 11-topic registry example, new "Engine niceties" section (previews + portable progress).
- Final: lint clean, tsc clean, dev.log 200s.

Stage Summary:
- Lab now has 10 topics: Reproductive Systems ♂♀, Heart & Blood Flow 🫀, Nerve Cell ⚡, Lungs & Breathing 🫁, The Brain 🧠, The Eye 👁, The Ear 👂, Nephron & Kidney 🫘, The Skin 🧴, Plant Cell 🌱 (124 quizable parts total).
- The plant cell brings non-human variety and two reusable patterns: `cellShell()` rounded-organic boxes (any future cell/micro-structure topic) and the three-shell ghost recipe with tuned opacities (.26/.2/.07) that keeps interiors readable — the "milky shell" pitfall and its fix are documented for future topics.
- Menu cards now carry auto-generated 3D previews — zero per-topic cost, scales to any number of topics; snapshot engine is a separate module reusable elsewhere (e.g. share cards).
- Backups are now truly complete: mastery + best scores + streak + activity + history in one versioned JSON, with validated restore.
- Engine hardening: quiz ❓ marker (and part focus) can no longer land in empty space on spread parts — a bug that affected every multi-mesh part across all topics, caught only because QA ran a full name-mode quiz.
- Files added: topics/plantcell/{data,build,index}.ts, engine/snapshot.ts. Files touched: registry.ts, world.ts (bestMeshCenter + marker/focus), quiz/engine.ts (collectBestScores + v2 backup), StatsPanel.tsx (export best + status), TopicMenu.tsx (CardPreview), globals.css, DEPLOY.md.

Unresolved issues / risks:
- The review forecast buckets a part answered "just now" (due in 1 day) as "Today" via floor() rounding — pre-existing label nit, harmless.
- Snapshot previews cost ~50-150 ms per topic on first menu open (sequential, cached after) — imperceptible, but could move to an idle-callback if topics multiply past ~20.
- Menu box scroll needs a pointer over the box for wheel scrolling (works fine; agent-browser's synthetic wheel was the artifact).
- Plant cell shells are DoubleSide: from a fully side-on view the far wall tint stacks — acceptable, and rotating keeps organelles readable.
- Photosynthetic "1% solar efficiency" etc. are round figures for study flavor, not textbook-exact.

Next-phase recommendations:
- Eleventh topic: The Tooth 🦷 (enamel/dentin/pulp layering reuses ghost shells) or Photosynthesis Leaf 🍃 (would partner the plant cell and reuse grana).
- Share-card images: reuse engine/snapshot.ts to render a topic + score card for downloading (pairs with export).
- Consider splitting worklog.md soon (353+ lines per round accumulates) — or add a table of contents at the top.
- SM-2 style scheduler once per-part review counts grow; cloud sync via Prisma when accounts exist.

---
Task ID: 10
Agent: Z.ai Code (scheduled review round 10)
Task: QA re-verification via agent-browser, then (project stable → features): eleventh topic (The Tooth 🦷, two systems), share-card PNG export, confetti celebration, styling pass, full verification, docs.

Work Log:
- QA baseline: dev.log all 200s, lint clean, src tsc clean (only pre-existing errors in examples/ + skills/ folders — not app code), menu renders 11 topics, plant cell regression OK, browser console clean → project STABLE, proceeded to features per worklog recommendations.
- NEW TOPIC #11 — The Tooth 🦷 `src/lib/lab/topics/tooth/` (data.ts, build.ts, index.ts), TWO systems (multi-system pattern like reproductive), 23 quizable parts (lab total now 147):
  - INCISOR (10 parts): enamel J-cap, dentin body with carved pulp channel, pulp chamber, root canal tube, cementum band, periodontal ligament band, 2 alveolar-bone slabs, gum collar + crest drapes, nerve trio (artery/vein/nerve), apical-foramen gold ring.
  - MOLAR (13 parts): adds cusps (flattened ridge bumps), pit & fissure groove tube, pulp horns, furcation gold marker, TWIN roots + twin canals + twin cementum/PDL shells with rounded apex caps.
  - Signature engine pattern: `halfLathe()` — LatheGeometry over a HALF turn (phiStart π/2, phiLength π) so every tooth layer is an open textbook-cutaway facing the camera; `boneSlab()` rounded+sheared slabs with wavy alveolar crest (p:1 explode mirror verified in world.ts); `gumDrape()` pink strips capping the bone; `scallop()` wavy gum crest. Explode peels all layers apart (slider verified at 0.60).
  - Flow "Blood & Signal": red blood up the artery through the foramen into the canal, blue waste back down the vein, yellow pain signals out — auto X-ray makes layers translucent so particles are visible (verified).
  - Tick "living pulse": pulp → horns → canals blood-beat wave, nerve shimmer, foramen glow.
  - Mint accent (#7fc7ae topic / #9ad6c0 incisor / #79bfa6 molar); 10+13 labels with hand-checked anchor positions.
- FEATURE — 📸 Share card (`engine/sharecard.ts`): Canvas-2D-only 1000×560 PNG score card — brand header + date, big score ring (color-coded by score), ok/total + mode + time chips, topic title, 🔥 streak + 🏅 mastery stat cards, the topic's 3D snapshot (via the cached snapshot queue) in an accent-framed window, footer. "📸 Card" button added to quiz results (accent-tinted `.bio-card-btn`). Download verified E2E via agent-browser `download`: saved 1000×560 PNG with correct content.
- FEATURE — 🎉 Confetti (`engine/confetti.ts`): self-contained canvas particle burst on quiz results — full burst at 100%, half-power sparkle for a new record ≥80%; gravity + drag + rotation, auto-removes its overlay, stacks safely, no-ops under prefers-reduced-motion. Verified LIVE: canvas count 1→2 during a 100% results screen, back to 1 after.
- Quiz engine E2E on the new topic: built a raycast-driven solver (grid `Raycaster` over `sys.pick` with userData.part + inner/quizSkip logic + DOM-safe zones) and ran find-mode quizzes to 100% (10/10) — results donut, best-score record, streak 🔥, history all correct; a 90% follow-up run correctly did NOT fire confetti (no new record).
- STYLING pass (mandatory): mini mastery progress bar on menu cards (`.bio-card-mbar`, accent gradient + glow, animated width, mobile max-width); accent focus ring + placeholder tone on the menu search box; deeper hover lift with accent-tinted shadow on cards; 📸 Card accent button styling; reduced-motion covers the new transitions.
- Agent-browser verification (all passed): 11-topic menu incl. tooth card + preview + INCISOR/MOLAR pills + search; incisor + molar renders with all labels (2 visual polish rounds: cusps flattened from spheres to ridges, root apex caps added, pulp horns tucked); Blood & Signal flow + auto X-ray + 3-route panel; Separate explode at 0.60 peels every layer; full find-mode quiz → 100% + confetti + 📸 Card download; menu mini mastery bar + 🏅 badge; regressions heart + plant cell; mobile 390px no horizontal overflow; console clean.
- QA test data wiped from localStorage after verification (0 bio-lab keys left).
- DEPLOY.md refreshed: tooth/ in tree, tick example updated (pulp beats), "add a topic" template now copies tooth/ with 12-topic registry example, "Engine niceties" now documents share cards + confetti.
- Final: lint clean, src tsc clean, dev.log 200s.

Stage Summary:
- Lab now has 11 topics: Reproductive Systems ♂♀, Heart & Blood Flow 🫀, Nerve Cell ⚡, Lungs & Breathing 🫁, The Brain 🧠, The Eye 👁, The Ear 👂, Nephron & Kidney 🫘, The Skin 🧴, Plant Cell 🌱, The Tooth 🦷 (147 quizable parts total).
- The tooth introduces the reusable `halfLathe()` cutaway recipe (any tubular/layered anatomy — vessel wall, stomach wall, hair follicle, tree trunk) plus `boneSlab()` (rounded, sheared, crest-waved blocks — reusable for jaw/socket/skull sections) and nested-shell apex caps for tube ends.
- Scores are now shareable: zero-dependency Canvas-2D PNG cards + confetti celebration close the motivation loop (quiz → reward → share).
- Quiz verified end-to-end on the newest topic with a raycast-based solver (a reusable QA technique — the solver script lives at /tmp/quizstep2.sh pattern in this log).
- Files added: topics/tooth/{data,build,index}.ts, engine/sharecard.ts, engine/confetti.ts. Files touched: registry.ts, BiologyLab.tsx (confetti triggers + shareCard handler + snapshot warm), InfoPanel.tsx (onShareCard + Card button), TopicMenu.tsx (mini mastery bar), globals.css, DEPLOY.md.

Unresolved issues / risks:
- The tooth models are cutaways (half-lathes): from the BACK (rotated 180°) they read as open shells — inherent to the cutaway style, and rotating back restores the section view; acceptable for a diagram-style study model.
- Explode "Separate" on the enamel shows its darker interior backface at the top (DoubleSide shading) — reads as the enamel's inner surface, minor.
- The share-card snapshot may render emoji-fallback on the very first click if the topic snapshot hasn't been generated yet (menu open warms the cache; the results screen also warms it async) — second click always has it.
- Molar roots are stylized flattened cones (not true curved roots) — study-model simplification, noted in info text tone.
- Solver-based quiz QA clicks can race the 0.9s advance timer (one wasted click per run) — harmless, QA-only.

Next-phase recommendations:
- Twelfth topic: Photosynthesis Leaf 🍃 (partners the plant cell, reuses grana) or The Tongue 👅 / The Skin's hair follicle deep-dive.
- Share card for the Progress panel (overall study stats card) — sharecard.ts already accepts arbitrary data.
- SM-2 style scheduler once per-part review counts grow; cloud sync via Prisma when accounts exist.
- Consider a worklog table of contents — the file keeps growing per round.

---
Task ID: 11
Agent: Z.ai Code (scheduled review round 11)
Task: QA re-verification via agent-browser, then (stable → features): twelfth topic (Photosynthesis Leaf 🍃), Progress-panel stats share card, snapshot-queue speedup, styling pass, an HMR state-desync hardening fix, full verification, docs.

Work Log:
- QA baseline: dev.log 200s, lint clean, src tsc clean, menu renders 12 topics, console 0 errors → STABLE. Observed menu previews loading slower than round 9's measurement (~1s/topic in this environment) → queued a speedup.
- NEW TOPIC #12 — Photosynthesis Leaf 🍃 `src/lib/lab/topics/leaf/` (data.ts, build.ts, index.ts), single system, 12 quizable parts (lab total now 159):
  - Wavy `layerSlab()` sheets re-derived locally from the skin pattern: cuticle (waxy translucent), upper epidermis, and a LOWER epidermis built as 3 segments around two stoma gaps.
  - 8 palisade towers (vertical translucent green cells) each holding 3 chloroplast lenses, every other chloroplast carrying a 3-disc grana stack (plant cell pattern reused).
  - Central vein bundle: translucent sheath blob + 3 big xylem vessel rings (z-cylinders, read as circles in section) above 5 small phloem tubes.
  - Spongy mesophyll: 10 loose irregular blobs + 2 faint cyan "air space" halls under the stomata; 2 stomata with kidney guard cells + dark pore discs.
  - Flow "Transpiration Stream" (4 routes): water up the xylem (blue), CO₂ in through the right stoma (pale green), O₂ out the left stoma (bright green), sugar away down the phloem (gold); auto X-ray makes layers translucent — all 4 routes verified visually.
  - Tick "photosynthesis shimmer": chloroplast glow beat (phase-staggered), guard cells breathing (swell wide/flat = pore opening), spongy cells drifting on an air tide, air halls shimmer.
  - Label QA: spongy/airSpace/palisade anchors initially projected behind the info panel → repositioned (2 iterations, all 12 labels now visible).
- FEATURE — Progress-panel 📸 Card (`downloadStatsCard` in engine/sharecard.ts): 1000×720 overall study-stats PNG — mastery ring (MASTERED label), 2×2 stat chips (streak / quizzes / recent avg / topics), all topics as thin mastery bars. Button added to the backup row (`.bio-stats-share`, accent-tinted). Verified via agent-browser download: caught + fixed a ring-caption/list overlap bug (listTop 352 → 448, H 680 → 720), re-verified clean.
- FIX (robustness) — HMR world/state desync: Fast Refresh re-runs the world-mount effect (new world → default system) while React state persists (active topic/quiz) — observed live as "leaf quiz showing the male model". Dev-only (no HMR in production) but hardened: the mount effect now re-syncs topicId/systemKey/quiz/panel/toggles with the freshly created world (no-op on a real mount). Verified: quiz start → answer 2 questions via marker raycast → world stays leaf:section.
- PERF — snapshot queue: inter-job gap changed from setTimeout 60ms to rAF (16ms) → 12 previews load noticeably faster; strictly sequential (one WebGL context) preserved.
- STYLING pass (mandatory): shared thin-scrollbar styling for `.bio-menu-box` + `.bio-stats-scroll` (Firefox scrollbar-color + WebKit, hover thumb); `.bio-stats-share` accent dashed button matching the Export/Import family; drawRing center label parameterized (MASTERED vs SCORE).
- Agent-browser verification (all passed): 12-topic menu + leaf card + search; leaf render with all 12 labels; Transpiration Stream flow + auto X-ray + 4-route panel; Separate explode at 0.60 splits every layer; name-mode quiz answered 2/2 via marker raycast (incl. the multi-mesh chloroplast case — marker lands on a real organelle); results screen (2/12 "New best score!"); stats card download ×2 (layout bug found & fixed); tooth + heart regressions via earlier rounds' flows; mobile 390px no horizontal overflow incl. results panel; console clean.
- QA test data wiped from localStorage after verification.
- DEPLOY.md refreshed: leaf/ in tree, tick example updated (chloroplast glow + breathing stomata), "add a topic" template copies leaf/ with 13-topic registry example, "Engine niceties" documents both share cards + snapshot reuse.
- Worklog: added the recommended table of contents at the top.
- Final: lint clean, src tsc clean, dev.log 200s, console clean.

Stage Summary:
- Lab now has 12 topics: Reproductive Systems ♂♀, Heart & Blood Flow 🫀, Nerve Cell ⚡, Lungs & Breathing 🫁, The Brain 🧠, The Eye 👁, The Ear 👂, Nephron & Kidney 🫘, The Skin 🧴, Plant Cell 🌱, The Tooth 🦷, Photosynthesis Leaf 🍃 (159 quizable parts total).
- The leaf pairs the plant cell for the botany half of the lab and adds two more reusable patterns: gapped layer sheets (epidermis segments around stomata — any perforated barrier) and ring-in-sheath vessels (xylem/phloem cross-sections — any vessel bundle in TS view).
- Share cards now cover both motivation loops: per-quiz score cards (round 10) + overall study-progress cards (this round), all zero-dependency Canvas-2D.
- HMR desync hardened (mount effect re-syncs state) — dev QA is reliable again after Fast Refresh.
- Files added: topics/leaf/{data,build,index}.ts. Files touched: registry.ts, sharecard.ts (stats card + drawRing label param), StatsPanel.tsx (📸 Card button), snapshot.ts (rAF gap), BiologyLab.tsx (mount re-sync), globals.css, DEPLOY.md, worklog.md (TOC).

Unresolved issues / risks:
- Air Spaces + Guard Cells labels sit close together at high explode values — acceptable, they separate at rest.
- Stats-card topic bars use one accent color for all rows — per-topic accent bars would be nicer (needs per-row color; trivial follow-up).
- The male reproductive default view appears briefly on reload behind the menu (pre-existing; topic resets to TOPICS[0] by design).
- Preview queue is still sequential — with 20+ topics an idle-callback scheduler would be worth revisiting.
- Leaf xylem/phloem rings are stylized straight cylinders, not spiraling vessel walls — study-model simplification.

Next-phase recommendations:
- Thirteenth topic: The Tongue 👅 (taste buds + papillae — reuses half-lathe + blob recipes) or DNA & Chromosomes 🧬 (double helix + mitosis stages).
- Per-topic accent colors in the stats-card topic bars; optionally a mini heatmap on the stats card.
- SM-2 style scheduler once per-part review counts grow; cloud sync via Prisma when accounts exist.
- Consider worklog rotation (start worklog-2.md) — file is 460+ lines.

---
Task ID: dl-1
Agent: Z.ai Code (main)
Task: User-reported download button failure ("failed to fetch from site") — package the full project as a zip in download/, excluding node_modules and build output, and provide a reliable site-served fallback.

Work Log:
- Inspected project sizes: node_modules 1.2G, .next 125M, .git 84M, tool-results 81M, skills 61M, actual source (src) only ~960K.
- Created download/my-project-2026-09-21.zip via `zip -r` with exclusions: node_modules/*, .next/*, dist/*, .git/*, tool-results/*, skills/*, .zscripts/*, .env (secrets), dev.log, *.zip (no recursion).
- Verified with `unzip -t` (ZIP OK): 168 files, ~1.1MB uncompressed, 389KB compressed. Contains src, prisma, db, public, tests, examples, mini-services, all configs (package.json, tsconfig, tailwind, eslint, Caddyfile), worklog.md, DEPLOY.md.
- Fallback for the broken download button: copied the zip to public/ so it is served directly by Next at /my-project-2026-09-21.zip — verified via curl: HTTP 200, Content-Type application/zip.

Stage Summary:
- Deliverable 1 (as requested): /home/z/my-project/download/my-project-2026-09-21.zip (389 KB, 168 files).
- Deliverable 2 (fallback): same zip served live at URL path /my-project-2026-09-21.zip (200 OK) — usable if the preview download button fails again.
- Excluded from the zip on purpose: node_modules, .next, dist, .git (84M history), tool-results, skills (sandbox artifacts), .env (contains secrets — do NOT ship publicly), dev.log. Restore deps with `bun install`.

Unresolved issues / risks:
- .env excluded from the zip for security; user must re-create it if deploying outside the sandbox.
- .git excluded to keep the zip small — git history only lives in the workspace; push to GitHub before deleting anything.
- In-app download buttons (JSON progress / PNG share cards) are client-side Canvas downloads, unrelated to this failure; no code change was needed.

---
Task ID: dl-2
Agent: Z.ai Code (main)
Task: Provide .env.example template + exact post-install setup commands + confirm whether real secrets are needed for local dev (follow-up to project zip packaging).

Work Log:
- Audited env usage: .env contains exactly ONE var — DATABASE_URL (SQLite file path, not a secret). src/ only reads process.env.NODE_ENV (lib/db.ts); next.config.ts reads none; app does NOT import z-ai-web-dev-sdk → zero API keys needed.
- Created .env.example at project root with DATABASE_URL=file:../db/custom.db and documented the Prisma gotcha (relative paths resolve against prisma/schema.prisma, not cwd).
- Live-verified the relative path: ran `DATABASE_URL="file:../db/envpath-verify.db" bunx prisma db push --skip-generate` → db created at project-root db/ as expected; test file removed afterwards.
- Fixed .gitignore: `.env*` was hiding the template — added `!.env.example` exception.
- Updated both zips (download/ + public/ copies of my-project-2026-09-21.zip, same filename, 389K) to include .env.example + fixed .gitignore; re-verified site serving: HTTP 200.

Stage Summary:
- Local dev needs NO secrets: the only env var is a local SQLite path; no seed script exists (prisma/ has schema only); `bun run db:push` creates a fresh empty DB from schema.
- Setup recipe: bun install → cp .env.example .env → bun run db:generate → bun run db:push → bun run dev.

Unresolved issues / risks:
- None new. Note: `bun run db:reset` would fail without a migrations folder — db:push is the correct fresh-start path for this project.
