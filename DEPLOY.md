# 🚀 Deploying the Biology 3D Study Lab to Vercel

This project is a **standard Next.js 16 (App Router) app** — it deploys to Vercel with **zero configuration**. There is no database, no server-side secrets, and no special infrastructure required; everything runs client-side (WebGL + WebAudio).

---

## Option A — Deploy from GitHub (recommended, auto-updates)

### 1. Push the code to GitHub

```bash
cd my-project
git init
git add -A
git commit -m "Biology 3D Study Lab — modular Next.js port"
git branch -M main
# create an empty repo on github.com first, then:
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

> Tip: make sure `.gitignore` includes `node_modules`, `.next`, `dev.log`, `*.db` (the default Next.js one does).

### 2. Import the repo into Vercel

1. Go to **vercel.com** → sign in with GitHub.
2. Click **Add New… → Project**.
3. Pick your repo from the list.
4. Vercel auto-detects **Next.js**. Leave everything at the defaults:
   - Framework preset: **Next.js**
   - Build command: `next build` (or the repo's `npm run build`)
   - Output directory: `.next`
   - Install command: `npm install` (or `bun install`)
5. Click **Deploy** — about a minute later you get a live URL like
   `https://<your-repo>.vercel.app`.

### 3. Every `git push` now auto-deploys

- Push to `main` → **production** deploy.
- Open a Pull Request → Vercel posts a **preview URL** for that branch.
  This is perfect for adding new biology topics: build a topic on a branch,
  check the preview, merge when it looks good.

---

## Option B — Deploy from your computer with the CLI (no GitHub needed)

```bash
npm i -g vercel
cd my-project
vercel          # first time: links the project, deploys a preview
vercel --prod   # promotes to production
```

---

## Local development

```bash
npm install       # or: bun install
npm run dev       # http://localhost:3000
```

---

## How this project stays modular (the "not one big file" part)

The old single-file HTML lab was split into a topic-based architecture:

```
src/
├─ app/
│  └─ page.tsx                      # just loads <BiologyLab/>
├─ components/lab/                  # generic UI (never needs changes for new topics)
│  ├─ BiologyLab.tsx                # state + wiring
│  ├─ TopBar.tsx  TopicMenu.tsx  InfoPanel.tsx  RangeBar.tsx  HintOverlay.tsx
│  ├─ PartsIndex.tsx                 # searchable part list + mastery dots (P)
│  └─ StatsPanel.tsx                 # progress dashboard: streak, 4-week activity
│                                    # heatmap, mastery bars, attempt history (G)
└─ lib/lab/
   ├─ types.ts                      # TopicDef / SystemDef contracts
   ├─ engine/                       # Three.js engine (world, helpers, sound)
   ├─ quiz/engine.ts                # quiz logic + best scores, mastery, streak storage
   └─ topics/
      ├─ registry.ts                # ← THE ONLY FILE YOU TOUCH TO ADD A TOPIC
      ├─ reproductive/              # topic = data.ts + male.ts + female.ts + index.ts
      ├─ heart/                     # topic = data.ts + build.ts + index.ts
      ├─ neuron/                    # topic = data.ts + build.ts + index.ts
      ├─ lungs/                     # topic = data.ts + build.ts + index.ts (+ optional tick animation)
      ├─ brain/                     # topic = data.ts + build.ts + index.ts (+ tick animation + decor sprites)
      ├─ eye/                       # topic = data.ts + build.ts + index.ts (+ tick animation + canvas iris texture)
      ├─ ear/                       # topic = data.ts + build.ts + index.ts (+ tick animation + parametric cochlea spiral)
      ├─ kidney/                    # topic = data.ts + build.ts + index.ts (+ tick animation + displaced-sphere bean geometry + "zoom cone" decor)
      ├─ skin/                      # topic = data.ts + build.ts + index.ts (+ tick animation + wavy interlocking layer slabs, ghost-shell transparency)
      ├─ plantcell/                 # topic = data.ts + build.ts + index.ts (+ tick animation + rounded-box cell shells + nucleus trio, grana, plasmodesmata)
      ├─ tooth/                     # topic = data.ts + build.ts + index.ts (+ tick animation + half-lathe cutaway shells, rounded bone slabs, gum drapes)
      └─ leaf/                      # topic = data.ts + build.ts + index.ts (+ tick animation + wavy layer sheets, palisade towers, vascular bundle)
```

Each **topic** is a self-contained folder describing:

- its 3D model (`build.ts` — built with the shared helper kit: `blob`, `taperedTube`, `lathe`, `ribbon`…),
- optionally a per-frame animation (`tick` — the lungs breathe, the eye's pupil dilates with coupled lens accommodation, the ear's ossicle chain vibrates, the kidney's glomerulus glows while a shimmer runs down the tubule train, the skin's arrector muscles flex and lift the hair in a goosebumps pulse, the plant cell's organelles drift on the cytoplasmic streaming tide, the tooth's pulp beats like a living heart while the nerve shimmers, the leaf's chloroplasts glow while its guard cells breathe open and closed),
- optionally a `lighting` preset (`index.ts` — dim the key light for pale organs like the brain; the rig cross-fades between topics),
- its study text (`data.ts` — info, labels, explode directions),
- its quiz keys, camera, flow routes, accents (`index.ts`).

The UI, quiz, X-ray, cross-section, exploded view, flow animations and keyboard
shortcuts are **generic** — they work for any topic automatically.

### ➕ Adding a new topic (e.g. "The Liver")

1. Copy `src/lib/lab/topics/leaf/` → `src/lib/lab/topics/liver/`.
2. Edit `data.ts` (part descriptions, labels, explode directions) and
   `build.ts` (meshes) — keep the same exports.
3. In `topics/liver/index.ts`, fill in the `TopicDef` (title, camera, order, quiz keys…).
4. Register it in `topics/registry.ts`:

   ```ts
   import { liverTopic } from './liver'
   export const TOPICS: TopicDef[] = [reproductiveTopic, heartTopic, neuronTopic, lungsTopic, brainTopic, eyeTopic, earTopic, kidneyTopic, skinTopic, plantCellTopic, toothTopic, leafTopic, liverTopic]
   ```

That's it — the menu card (with an auto-generated 3D preview), 3D viewer, quiz
and every tool pick it up automatically.
Part keys are namespaced (`lungs:lungs:alveoli`), so name collisions across topics are impossible.

### 🧩 Engine niceties you get for free

- **Menu previews**: `src/lib/lab/engine/snapshot.ts` renders every topic's
  default system offscreen (same `build()` module as the viewer) and fades the
  image into the menu card — no extra work per topic.
- **Portable progress**: the Progress panel exports/imports the full study
  profile (mastery, best scores per topic+mode, streak, activity heatmap,
  attempt history) as a versioned JSON file.
- **Share cards**: quiz results fire a confetti burst and the **📸 Card** button renders a downloadable score card; the Progress panel's **📸 Card** button (`downloadStatsCard`) shares the overall study stats — mastery ring, streak/quiz/average chips and a per-topic bar breakdown. Both are pure Canvas-2D with zero dependencies.
- **Snapshots everywhere**: the same offscreen snapshot engine feeds the menu card previews and the share cards.

---

## FAQ

**Does it need a database?**
No. Quiz best scores live in `localStorage`. If you later want accounts/global
leaderboards, Vercel Postgres + Prisma can be added — the project already has
Prisma wired for when that day comes.

**Does it need any environment variables?**
None, today. (The sandbox `.env` is only used by local tooling.)

**Custom domain?**
Vercel → your project → *Settings → Domains* → add it and follow the DNS
instructions.

**The build script has `cp` commands — will that break Vercel?**
No. Those commands only affect the optional standalone-output mode and run fine
on Vercel's Linux builders; you can also simplify the script to just `next build`.
