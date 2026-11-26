# Interaction Direction & Framework Decision Report

- **Branch:** `exp/interaction-direction` (branched from `feat/motion-ux-upgrade` HEAD `aa90c9b`)
- **Main vs Feature Branch State:** `main` (`38cd324`, Merge PR #8) includes only the baseline docs and Phase 1 safety-net commits (`2c354c6..f331dd0`). `feat/motion-ux-upgrade` (`aa90c9b`) holds **17 unmerged commits** (`4815b44..aa90c9b`).
- **Scope Guardrail:** Card 4's `"Next.js & Tailwind"` badge (`F-011`) was left untouched pending this study. No production source files were modified.

---

## Owner Context & Explicit Assumptions

Because the owner input prompts were left blank, the following explicit assumptions apply to scoring and design recommendations:

| Input | Assumption (`[ASSUMPTION]`) | Basis in Repo |
| --- | --- | --- |
| Reference sites liked | Benchmarked live against 5 prominent engineer/designer portfolios: `brittanychiang.com`, `paco.me`, `rauno.me`, `emilkowal.ski`, `leerob.com` | Prompt fallback (no URLs specified) |
| Desired feel | Minimal-premium + techy (monospace/emerald dark editorial aesthetic paired with real interactive artifacts) | `src/styles/global.css`, `src/components/About.astro` (`robertus.info` terminal) |
| Main audience device | Both desktop (`1280–1440px` recruiter review) and mobile (`360–390px` QR/link shares) | Bilingual `id`/`en` routes + `BottomNav.astro` |
| Willingness to rewrite | Low-to-Medium (solo engineering student; just migrated Next.js -> Astro + Preact) | `AUDIT_REPORT.md`, `git log` history |
| Importance of React/Next.js on CV | Medium (beneficial signal, but primary identity emphasizes AI/Computer Vision + Backend NestJS, and portfolio already showcases React projects: Card 3 & Card 6) | `src/components/Hero.astro`, `src/data/profile.json` |

---

## Phase A — Perception Gap Analysis (`acf6c6b` vs `aa90c9b`)

### 1. Visual Diff Measurement Across Viewports (`360 / 390 / 768 / 1440 px`, Dark + Light, `/` + `/en`)

Captured using headless Chromium (`phase-a-capture.mjs`) comparing Phase 0 baseline `acf6c6b` (built cleanly in throwaway `spike/baseline-acf6c6b`) against `aa90c9b`:

| Viewport / Theme / Locale | Settled Fold Diff (%) | Changed Pixels | Mid-Scroll Diff (`ratio=0.2`, dark `/`) |
| --- | --- | --- | --- |
| `360x800` Dark `/` & `/en` | `0.27%` / `0.16%` | `765 px` / `453 px` | — |
| `360x800` Light `/` & `/en` | `0.25%` / `0.14%` | `716 px` / `392 px` | — |
| `390x844` Dark `/` & `/en` | `0.23%` / `0.26%` | `767 px` / `861 px` | `19.26%` (`0.4`: `4.96%`, `0.6`: `5.98%`, `0.8`: `3.95%`, `1.0`: `1.88%`) |
| `390x844` Light `/` & `/en` | `0.22%` / `0.25%` | `716 px` / `807 px` | — |
| `768x1024` Dark `/` & `/en` | `0.09%` / `0.10%` | `705 px` / `776 px` | — |
| `768x1024` Light `/` & `/en` | `0.09%` / `0.10%` | `678 px` / `802 px` | — |
| `1440x900` Dark `/` & `/en` | `0.05%` / `0.06%` | `679 px` / `750 px` | `7.77%` (`0.4`: `4.48%`, `0.6`: `3.69%`, `0.8`: `2.72%`, `1.0`: `1.30%`) |
| `1440x900` Light `/` & `/en` | `0.05%` / `0.06%` | `659 px` / `783 px` | — |

- **First 5 seconds (`t=50ms` to `t=4800ms`):** After initial `domcontentloaded` capture, above-the-fold `headVsEndPct` measured `0%` across `t=50..4800ms` at `390px` and `1440px` once layout/paint completed; the settled fold differs by `< 0.3%` pixel area across all 16 combinations (`> 99.7%` visually identical).

### 2. Classification of Shipped Changes (First 30 Seconds Recruiter View)

| Commit / Change | Desktop Visibility | Touch Device Visibility | Why |
| --- | --- | --- | --- |
| `aca5e1e` Dynamic parity test count | **INVISIBLE** | **INVISIBLE** | Dev/CI test assertion only |
| `6ddcab7` WCAG 2.5.3 `aria-label` alignment | **INVISIBLE** | **INVISIBLE** | Screen-reader / voice-control metadata only |
| `ef4e603` Skip link on focus + `inert` filtered cards | **INVISIBLE** | **INVISIBLE** | Keyboard Tab / screen-reader only |
| `f331dd0` Remove duplicate `.scroll-reveal` observer | **INVISIBLE** | **INVISIBLE** | Internal JS cleanup |
| `8363bb5` Motion CSS tokens (`:root`) | **INVISIBLE** | **INVISIBLE** | Token foundation only |
| `387da90` & `7966cf5` Motion budget tests & CSS consolidation | **INVISIBLE** | **INVISIBLE** | Dev test + `-64 B` gzip optimization |
| `6f3bbc5` Compositor typing + pause dot pulse + Hero `.hero-settle` | **SUBTLE** | **INVISIBLE / SUBTLE** | `clip-path` typing disabled on `<640px`; Hero LCP kept static (`opacity: 1`); only status pill & CTAs slide 8px once on initial load |
| `d32ae98` Unified button hover/active states | **SUBTLE** | **SUBTLE** | `-2px` lift only on pointer hover; touch only sees 100ms press scale |
| `3ccd73b` Light-mode `--dot-color` grid fix & `pt-0` removal | **SUBTLE** | **SUBTLE** | 1px backdrop dots (`rgba(18,18,18,0.06)`) only visible after switching to Light mode |
| `bf87b0e` Scroll progress bar (`#scroll-progress`) | **SUBTLE** | **SUBTLE** | Thin `2px` bar pinned at very top edge |
| `d55f121` Mutually exclusive scroll-driven reveals | **SUBTLE** | **SUBTLE** | `16px` fade-in once per section on scroll |
| `ee91815` Sliding active-section indicator (`translate3d`) | **VISIBLE** (on scroll) | **VISIBLE** (on scroll) | `2px` emerald underline glides cleanly under active nav link (`desktop-nav` & `bottom-nav`) |
| `a5bc683` Card focus parity & cursor spotlight | **SUBTLE** | **INVISIBLE** | Spotlight gated behind `(hover: hover) and (pointer: fine)` |
| `e71d40b` Skill chip hover & focus border/lift | **SUBTLE** | **INVISIBLE** | `:hover` only behind fine pointer media query |
| `4815b44` Fixed category filter + `aria-live` count | **VISIBLE** (if clicked) | **VISIBLE** (if tapped) | Cards now hide/filter properly and show count line, `18%+` diff mid-scroll when `ProjectFilter` height/count renders |
| `72cf8ab` Modal `<dialog>` open/close transition & focus trap | **SUBTLE / VISIBLE** (if opened) | **SUBTLE / VISIBLE** (if tapped) | Crisp `250ms` fade/scale modal entrance `[UNVERIFIED on Safari/Firefox]` |
| `687c18e` Copy-email checkmark + `#clipboard-live` | **VISIBLE** (if clicked) | **VISIBLE** (if tapped) | Swap icon & emerald badge confirmation on click |
| `08e714d` Theme crossfade View Transition | **SUBTLE** | **SUBTLE** | `150ms` crossfade only when clicking theme toggle `[UNVERIFIED on Safari/Firefox]` |

### 3. Interactions Behind `(hover: hover) and (pointer: fine)` & Mobile Fallback

1. **Card Cursor Spotlight & Lift** (`src/styles/motion.css:248-274`, `public/js/motion.js:50-81`) — radial gradient tracks pointer `--mouse-x`/`--mouse-y`, cards lift `-5px` & zoom `.img-zoom` (`1.035`). **Mobile gets:** only `:active` (`translateY(-1px) scale(0.996)` for `100ms` during finger press).
2. **Hero Mono Caret Typing** (`src/styles/motion.css:68-115`) — desktop (`>=640px`) types across `53 steps` via `clip-path`. **Mobile (`<=639px`) gets:** plain `0.6s` opacity fade (`clip-path: none`), static immediately after.
3. **Skill Chip Lift & Border Highlight** (`src/styles/motion.css:364-373`) — **Mobile gets:** static pill chips (no tap state or expandable interaction).
4. **Button Lift** (`src/styles/motion.css:313-317`) — **Mobile gets:** `scale(0.98)` only while thumb is held down.

### 4. Static Areas & Top 3 Weakest "First Impression" Moments

- **Still static areas:** Hero focal column (above the fold has 0 interactive demos/controls), `About.astro` (`robertus.info` macOS terminal widget looks interactive yet accepts no clicks/tabs/commands), Cards `2–6` in `Projects.astro` (pure text shells without previews/widgets), `Experience.astro` timeline nodes (static circles), `Skills.astro` chips (non-interactive pills), and `Education.astro` cards.
- **Top 3 weakest first-impression moments (visual audit of `390x844` & `1440x900` captures):**
  1. **Zero interactive engineering proof above the fold (`0–5s`):** A recruiter opening `/` sees a static centered bio + 3 buttons (`Lihat Proyek`, `Unduh CV`, `copy email`). No live artifact, telemetry switcher, or filter preview is immediately usable without scrolling.
  2. **5 of 6 project cards look identical & flat:** Only Card 1 (`YoloDemo`) has interactive media; Cards `2–6` (SIBARISTA, Kriptografi, Portfolio, Expense Tracker, PartsBin) have no inline preview, live cipher/spec toggle, or visual focal anchor.
  3. **Visual terminal & nav polish mismatches:** `About.astro`'s `robertus.info` terminal card mimics a CLI shell without any tabs or interactive commands, and on `390px` mobile the top-left `PORTFOLIO ROBERTUS` brand wraps awkwardly onto two lines in `Navbar.astro`.

### 5. Hypothesis Verdicts (H1–H4)

| Hypothesis | Verdict | Measured Evidence |
| --- | --- | --- |
| **H1:** Principles & budgets made changes too subtle | **CONFIRMED** | Only `2,292 B` gz JS & `1,089 B` gz CSS spent on passive polish while keeping Hero static -> **`99.73%–99.95%`** of fold pixels match `acf6c6b` across all 16 tested configurations. |
| **H2:** Most shipped changes are invisible by nature | **CONFIRMED** | Of `22` commits since `acf6c6b`, the majority (`aca5e1e`, `6ddcab7`, `ef4e603`, `f331dd0`, `8363bb5`, `387da90`, focus trapping, `aria-live`) fix WCAG 2.5.3, keyboard traps, test parity, and CSS tokens—zero visual delta to casual viewers. |
| **H3:** Hover effects disappear on touch devices | **CONFIRMED** | Spotlight, card lift, image zoom, button hover, skill chip hover, and desktop caret typing are explicitly stripped/disabled under coarse pointers or `<640px`. Touch visitors only see scroll fades, `2px` progress/nav bars, and tap compression. |
| **H4:** Layout, hierarchy & content—not just motion—limit perceived quality | **CONFIRMED (co-root cause)** | Adding stronger easing alone cannot make 5 plain-text project cards, a passive Hero bio, and a read-only terminal card feel memorable. Visible interactive artifacts & hierarchy clarity are required. |

---

## Phase B — Reference Portfolio Benchmark (Live Probed)

All 5 reference portfolios were loaded and measured in headless Chromium (`phase-b-benchmark.mjs`):

| Site | Observed Framework & Assets | Total JS Transferred (decoded) | Canvas / Active Anims | Top 1–2 Signature Interactions & Build Pattern |
| --- | --- | --- | --- | --- |
| `brittanychiang.com` | Next.js + Tailwind (`11` scripts, `29` SVGs) | `153.5 KB` (`450.7 KB`) | `0` canvas / `0` idle | 1) Desktop cursor radial gradient spotlight; 2) Sibling opacity dimming + split sticky navigation rail (CSS + pointer `--x/--y` variables). |
| `paco.me` | Next.js (`21` scripts, `0` SVGs) | `212.8 KB` (`601.5 KB`) | `0` canvas / `0` idle | 1) Ultra-snappy `⌘K` command menu navigation; 2) Restraint-first typography & instant micro-feedback (`~0ms` navigation latency). |
| `rauno.me` | Next.js + Motion (`17` scripts, `3` SVGs) | `582.7 KB` (`2.57 MB`) | `0` canvas / `7` idle | 1) Tactile shared-element & spring physics controls; 2) Bespoke interactive craft demos embedded inline (Motion / WAAPI + custom gesture math). |
| `emilkowal.ski` | Next.js + Motion (`13` scripts, `1` SVG) | `941.0 KB` (`3.15 MB`) | `0` canvas / `0` idle | 1) Interactive component sandboxes embedded in content; 2) Contextual-origin animations (`<300ms` spring curves; high-frequency actions get zero animation). |
| `leerob.com` | Next.js App Router (`13` scripts, `4` SVGs) | `258.4 KB` (`782.3 KB`) | `0` canvas / `0` idle | 1) Smooth View Transitions navigation; 2) Dense, scannable typographic proof without decorative motion clutter. |

**Key Takeaway:** None of these 5 elite portfolios use `<canvas>` (`0/5`). Their premium feel comes from **clickable/tactile engineering craft and rapid navigation (`⌘K`, inline sandboxes, sibling spotlighting, View Transitions)**—not React hydration weight (they ship **6x–38x more JS** than this Astro portfolio's `24.2 KB` gz).

---

## Phase C — Framework Decision Study & Timed Spikes

### 1. Candidate Scoring Matrix (1–5 scale; higher is better, incl. lower cost/risk = 5)

| Criteria | Weight | 1. Astro + Ambitious Islands + ClientRouter | 2. Astro + Lazy WAAPI Lib (`framer-motion/dom/mini`) | 3. SvelteKit (`adapter-static`) | 4. SolidStart / Qwik | 5. Next.js Static Export (`+ Framer Motion`) | 6. Vite + Preact SPA |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Baseline JS & Critical Path | 15% | **5** | **5** (lazy after LCP) | 4 `[ASSUMPTION]` | 4 `[ASSUMPTION]` | **1** (`294 KB` gz) | 4 (JS-dependent) |
| Hydration & Loading Control | 15% | **5** (`client:idle/visible`) | **5** (`import()` on interact) | 3 `[ASSUMPTION]` | 5 `[ASSUMPTION]` | **2** (`493 KB` eager) | **1** (all-client SPA) |
| Animation & Page Transitions | 15% | 4 (`ClientRouter` + CSS/WAAPI) | **5** (`ClientRouter` + WAAPI springs) | **5** (`svelte/transition` + `flip`) `[ASSUMPTION]` | 3 `[ASSUMPTION]` | **5** (`layoutId` / `AnimatePresence`) | 4 |
| Lighthouse & 4x CPU Risk | 15% | **5** | **5** (`Perf 98`, `LCP 2.13s`) | 4 `[ASSUMPTION]` | 4 `[ASSUMPTION]` | **1** (`Perf 82`, `LCP 4.76s`) | 2 (`[ASSUMPTION]` delayed LCP) |
| Migration Cost (Inverse) | 15% | **5** (`0` rewrite) | **5** (`0` framework rewrite) | **1** (full rewrite) | **1** (full rewrite) | **2** (half-stale `app/` rewrite) | **2** (full rewrite + SSR gap) |
| Long-Term Solo Maintainability | 10% | **5** | **5** | 4 | 2 `[ASSUMPTION]` | 4 | 4 |
| i18n Fit (`/` ID + `/en` EN) | 5% | **5** (native) | **5** (native) | 4 | 3 | 3 (`output:'export'` gaps) | 2 (SEO meta hard) |
| Learning Value | 5% | 4 | **5** (WAAPI + Islands mastery) | 4 | 3 | 4 | 3 |
| CV / Hiring Signal (`[ASSUMPTION]` Med) | 5% | 3 | 3 | 3 | 2 | **5** | 3 |
| **Weighted Total (out of 5.00)** | **100%** | **4.75** | **4.90** | **3.50** | **3.10** | **2.35** | **2.65** |

### 2. Migration Cost Inventory (What Any Non-Astro Rewrite Must Touch)

Migrating off Astro requires rewriting or adapting:
- `src/data/profile.json` + `schema.ts` + `profile.ts` (`961 LOC`) — keep JSON/Zod, re-wire imports cleanly across all consumers.
- i18n routing (`astro.config.mjs`, `src/pages/index.astro`, `src/pages/en/index.astro`, `canonical`, `hreflang`, `Person` JSON-LD in `BaseLayout.astro` — `128 LOC`).
- 13 presentation components (`Navbar`, `Hero`, `About`, `Projects`, `Experience`, `Skills`, `Education`, `Contact`, `Footer`, `BottomNav`, `MobileDrawer`, `ThemeToggle`, `MainPage` — `1,389 LOC`).
- 3 Preact interactive islands including all **6 hardcoded `ProjectModal` entries** (`ProjectFilter.tsx`, `ProjectModal.tsx`, `YoloDemo.tsx` — `781 LOC`) + `public/js/{main,motion}.js` (`409 LOC`).
- Quality gate & deploy config: `vercel.json` (`56 LOC`), `public/sitemap.xml`, `tests/test-functional.mjs`, `tests/test-content-parity.mjs`, `tests/test-motion-budgets.mjs` (`525 LOC`).

### 3. Time-Boxed Spike Measurements (3 Scoped Components: Hero, Project Grid+Filter, Project Modal)

Both spikes were built in isolated `git worktree` checkouts, tested identically with `spike-measure.mjs` (3-run Lighthouse Mobile + Chrome CDP 4x CPU throttle trace during load + filter + modal click), and deleted afterwards (`git worktree list` clean):

| Metric | Spike A (`spike/astro-ambitious`: Astro 7 + Preact + lazy `framer-motion/dom/mini`) | Spike B (`spike/nextjs-motion`: Next.js 16 `output:'export'` + `LazyMotion`) |
| --- | --- | --- |
| **LOC (3 spike components + page)** | `500` lines (`5` files) | `377` lines (`5` files) |
| **Lighthouse Mobile (Median P / A / BP / SEO)** | **`98 / 100 / 100 / 100`** (`98, 98, 98`) | **`82 / 100 / 100 / 100`** (`83, 82, 82`) |
| **Lighthouse Mobile LCP** | **`2133 ms`** (`2112–2246 ms`) | **`4755 ms`** (`4738–4765 ms`, **`+2,622 ms`** slower!) |
| **Lighthouse Mobile CLS / TBT** | `0.0071` / `63 ms` | `0.0000` / `60 ms` |
| **CDP 4x CPU Throttle TBT (load + click)** | **`184 ms`** (`1` long task: `234 ms`) | **`370 ms`** (`5` long tasks: `[395, 60, 50, 59, 56]`, `2.0x` higher) |
| **CDP 4x CPU Observed LCP** | **`352 ms`** | **`552 ms`** |
| **Total Emitted JS (gzip)** | **`37,920 B`** (`17` split chunks; Preact + islands + dynamic `dom/mini` load **only after LCP / on click**) | **`293,854 B`** (`23` chunks; **7.7x larger**) |
| **Scripts Loaded Before LCP (`afterLcp: false`)** | `2` (`main.js`, `motion.js` at `52ms`; **`9/9` Preact/Motion/data chunks have `afterLcp: true`, starting `846ms–2751ms`**) | **`9/9` chunks** starting at `46–50ms` (`493 KB` uncompressed transfer!) |
| **Active CSS / HTML (gzip)** | `10,900 B` CSS (`19,907 B` minus `9,007 B` legacy `public/css/style.css`) / `18,068 B` HTML | `8,405 B` CSS (external) / `5,704 B` HTML |
| **Implementation Friction** | Low (minor TypeScript strict type mismatch on `profile.json` link keys; fixable in 2 lines) | High (`next build` Turbopack panicked on cross-drive symlink; forced `--webpack` same-drive workaround; `src/pages` vs `app/` collision; forced `'use client'` + `<LazyMotion>` wrappers) |

### 4. H5 Verdict & Migrate-vs-Stay Decision (Applying Rule 5)

- **H5 (`Astro itself limits interactivity or page transitions`) -> REJECTED.** Spike A proved Astro 7 + Preact islands cleanly execute interactive Hero focus tabs, gliding filter pills, dynamic card layout animations (`framer-motion/dom/mini`), expandable specs, and tabbed modals with **zero pre-LCP hydration cost** (`afterLcp: true` on all `9` island chunks). Adding `<ClientRouter />` further enables multi-page case-study View Transitions if routes expand later.
- **Recommended Direction (1 paragraph):** **Stay on Astro 7 + Preact 11 (Hybrid Options 1 + 2)** and adopt interactive, high-signal islands hydrated strictly via `client:idle` / `client:visible` / `on-interaction`, backed by lazy `framer-motion/dom/mini` WAAPI choreography (`<= 30 KB` deferred JS budget). Migrating to Next.js static export fails Rule 5 catastrophically: it provides **zero extra capability** for our interactive widgets while costing **+256 KB gz JS**, **+2,622 ms mobile LCP (`4.75s`)**, **2x 4x-CPU TBT (`370ms`)**, a **16-point Lighthouse Performance drop (`98 -> 82`)**, and a high-effort rewrite across ~4,000 LOC of bilingual routes, schemas, and tests.

---

## Phase D — Revised Tiered Performance Budget Model

The prior flat `6 KB` JS budget artificially forced polish to be near-invisible (`<0.3%` pixel delta). Adopting a **split critical vs. deferred budget** unlocks noticeable interactivity without hurting LCP or Lighthouse:

| Tier / Gate | Proposed Target | Justification from Spike A & Current Baseline |
| --- | --- | --- |
| **Critical Path (before LCP)** | New JS `<= 3 KB` gz (on top of `main.js`/`motion.js` baseline, goal refactor `< 3 KB` total deferred `<script>`), inline CSS `<= 4 KB` gz net addition (`~13.6 KB` total ceiling) | Hero text & `<picture>` remain `opacity: 1` zero-JS HTML; zero Preact/React bundles before LCP. |
| **Deferred JS (`afterLcp: true`)** | `<= 30 KB` gz total across `client:idle`, `client:visible`, & dynamic click chunks | Spike A delivered interactive Hero + Grid + Tabbed Modal + `framer-motion/dom/mini` at `~20 KB` loaded on idle + lazy click chunks cleanly after LCP (`846ms+`). |
| **Network Ordering Gate (NEW)** | Automated Puppeteer check in `tests/test-motion-budgets.mjs` asserting **all `_astro/*.js` / island chunks start at `startTime >= lcp`** | Prevents accidental `client:load` from slipping Preact hydration into the critical path. |
| **Core Web Vitals & Lighthouse** | Mobile Perf `>= 95` (`>= 97` target), A11y/BP/SEO `100`, LCP `<= 2300 ms` warn / `<= 2500 ms` fail, CLS `<= 0.05`, LH TBT `< 100 ms`, **4x CPU CDP TBT `< 250 ms`** | Matches production stability (`98` / `2182ms`) with strict 4x-CPU responsiveness protection. |

---

## Phase E — Top 5 "Signature Moments" Proposal

All 5 degrade cleanly to working static HTML without JS or under `prefers-reduced-motion: reduce`, and provide equal utility on touch and hover:

| # | Interaction | Wow (1–5) | Audience Value (1–5) | Est. Cost (gz) | Touch + Hover Parity | A11y & Reduced Motion | LCP / CLS Risk | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | **Hero Engineering Focus Console** (interactive pill tabs above fold switching live telemetry / verified CV+Backend specs + quick jump CTA) | **4** | **5** | `~2.2 KB` JS (deferred `client:idle`) + shared WAAPI `animate()` | Tap tabs on touch; hover + keyboard arrows/tabs on desktop | Proper `role="tablist"`/`"tabpanel"`; instant swap under reduced motion; SSR default overview panel present in initial HTML | **Low** (placed below LCP `<p>` with fixed min-height `128px`) | **DO** |
| 2 | **Sliding Filter Indicator Pill + Card FLIP Transitions & Stack Peek** (gliding emerald pill under active domain chip + card enter stagger + inline "Peek Stack" toggle on every card) | **4** | **4** | `~2.5 KB` JS + shared lazy `dom/mini` (`~9 KB` cached once) | Tap chips & peek drawer work natively on touch; no reliance on hover | Dynamic `aria-pressed` & localized `aria-live` count; instant hide/show under reduced motion | **Low** (below the fold, `client:visible`) | **DO** |
| 3 | **Live Micro-Previews inside Non-YOLO Project Cards** (lightweight inline Caesar/Cipher interactive preview in Card 3 + expandable Architecture preview strip in Cards 2/4/6) | **5** | **5** | `~2.8 KB` JS (`client:visible` / on-click) | Explicit tap buttons & input on touch & desktop | Keyboard accessible controls, native HTML fallback summary without JS | **Low** (`client:visible`, height transition avoided or bounded) | **DO** |
| 4 | **Command Palette Navigation (`Ctrl/⌘+K` + Navbar Search Button)** (instant jump to projects/modals, copy email, theme/locale toggle) | **5** | **4** | `0 B` critical & idle; `~3.5 KB` gz dynamic import on first click/`⌘K` | Visible `⌘K` / Search pill button in Navbar & Mobile Drawer for touch & mouse | Focus trap in `<dialog>`, `aria-activedescendant`/arrow keys, `Esc` restore focus, zero motion under reduced motion | **Zero** (`0 B` until opened) | **DO** |
| 5 | **Tabbed Case-Study Modal + Desktop Neighbor Spotlight** (`Overview / Architecture / Stack` tabs in `ProjectModal` + subtle CSS `:has(:hover)` dim on desktop grid siblings like `brittanychiang.com`) | **4** | **4** | `~0.6 KB` JS + `~0.2 KB` CSS | Tabs work identically on touch; sibling dim strictly gated behind `@media (hover: hover)` | `role="tablist"` inside native `<dialog>` focus trap; zero opacity dim when reduced motion active | **Zero** | **DO** |
| 6 | *ClientRouter Multi-Page Case Studies (`/projects/[slug]` View Transitions)* | **4** | **5** | `~3.2 KB` Astro View Transitions script | Native tap navigation on mobile & desktop | Fallback standard link navigation without JS | **Low** (needs full content authoring first — ties to `F-015`) | **LATER** |
| 7 | *3D WebGL / Custom Cursor / Particle Canvas* | **3** | **1** | `+40–120 KB` JS | Disabled/battery-draining on mobile | Motion sickness risk | **High** (TBT / GPU / Perf regression) | **SKIP** |

---

## Phase F — Ordered Atomic Commit Plan & Risks

If approved, implementation will proceed on a clean branch from `feat/motion-ux-upgrade` (`aa90c9b`) using independently revertible Conventional Commits:

1. **`test(budgets): adopt tiered critical/deferred JS budget and afterLcp network assertion`** — update `tests/test-motion-budgets.mjs` with Phase D tiered thresholds (`<= 3 KB` critical delta, `<= 30 KB` deferred total, `afterLcp` check, 4x CPU CDP assertion) + fix `Navbar.astro` mobile `whitespace-nowrap` brand wrap as baseline layout prep. *(Revertible standalone)*
2. **`feat(ui): consolidate static project data onto profile.ts and add project peek/preview metadata`** *(or scoped subset)* — wire `ProjectModal` and `Projects` filters strictly to verified `src/data/profile.json` fields (`F-007` foundation, resolving missing Card 4 clarity per owner decision). *(Revertible standalone)*
3. **`feat(hero): add interactive HeroEngineeringConsole island with client:idle + SSR fallback`** — delivers Signature Moment #1 with reserved min-height (zero CLS, zero LCP delay). *(Revertible standalone)*
4. **`feat(projects): upgrade ProjectFilter with sliding indicator pill, FLIP transitions & Peek Stack`** — delivers Signature Moment #2 (`client:visible` + dynamic `framer-motion/dom/mini`). *(Revertible standalone)*
5. **`feat(projects): add inline interactive Cipher/Architecture micro-previews on cards`** — delivers Signature Moment #3. *(Revertible standalone)*
6. **`feat(nav): add lazy-loaded Command Palette (Ctrl+K / button) for instant navigation`** — delivers Signature Moment #4 (`0 B` until triggered). *(Revertible standalone)*
7. **`feat(modal): upgrade ProjectModal to Overview/Architecture/Stack tabs + desktop sibling spotlight`** — delivers Signature Moment #5. *(Revertible standalone)*
8. **`docs: update ARCHITECTURE, AGENT and quality gate baselines`** — refresh documentation & `F-002`/`F-003` unused-package cleanup decision (note: keeping or pruning `framer-motion` depending on whether `dom/mini` is retained!).

### Key Risks & Unverified Browsers

- **Mobile 4x-CPU Hydrations (`184ms` in Spike A):** Staggering `client:idle` vs `client:visible` vs click-triggered `import()` keeps critical load clean, and splitting JSON parsing away from initial idle execution will ensure 4x-CPU TBT stays `< 150ms`.
- **`framer-motion` CVE / Bundle Hygiene (`F-002`):** Retain **only** if lazy `framer-motion/dom/mini` is chosen over raw Web Animations API (`Element.animate()`, `0 B` external deps); otherwise remove `framer-motion` alongside `next`/`react` during `F-002` cleanup.
- **`[UNVERIFIED on Safari/Firefox]`:** CSS `@starting-style` + `allow-discrete`, `animation-timeline: scroll()/view()`, and `document.startViewTransition` were tested only in Chromium and remain `[UNVERIFIED on Safari/Firefox]`.
