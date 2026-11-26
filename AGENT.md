# AGENT.md — AI Coding Agent Operating Manual

## 1. Project Snapshot
Bilingual (`id` default at `/`, `en` at `/en`) static personal portfolio for Robertus William Susanto, deployed on Vercel (`dist/`).
Built with **Astro 7.4.1** (`output: 'static'`), **Preact 11.0.1** islands, **Tailwind CSS 4.2.1**, **Zod 4.6.7**, and **TypeScript 5.9.3**.
Goal: showcase AI/software engineering artifacts with 99+ Lighthouse performance, strict content accuracy, and WCAG 2.2 AA accessibility.

---

## 2. Commands (Verified)

| Purpose | Exact Command | Current Status / Expected Output |
| --- | --- | --- |
| Install deps | `npm ci` | Clean install from `package-lock.json` (`11.9.0` / Node `v24.14.0`). |
| Dev server | `npm run dev` | Runs `astro dev` (local preview with HMR). |
| Production build | `npm run build` | Runs `astro build` -> emits `dist/index.html`, `dist/en/index.html`, `dist/_astro/*` (~2.2s, exit `0`). |
| Preview build | `npm run preview` | Runs `astro preview` serving `dist/`. |
| Typecheck (`.ts`/`.tsx`) | `npx tsc --noEmit` | Exit `0` for `src/**/*.ts(x)`. Does **not** check `.astro` files (`@astrojs/check` not installed). |
| Lint | `npx eslint .` | **Fails** (`exit 1`, 179 issues) due to legacy `eslint-config-next` scanning `dist/`/`.astro/` (`F-006`). |
| Functional tests | `node tests/test-functional.mjs` | **Passes** (`exit 0`); serves `dist/` on `127.0.0.1:4177` and verifies `HeroFocusConsole`, filter FLIP/Peek, `CipherPreview`, `ProjectModal` tabs, `CommandPalette`, No-JS SSR, `:has()` hover, and `360..1440px`. |
| Content parity test | `node tests/test-content-parity.mjs` | **Passes** (`exit 0`); dynamically checks 6 projects, 6 certifications, and 15 forbidden terms. |
| Motion & budget gate | `npm run test:motion` | **Passes** (`exit 0`); asserts tiered critical/deferred JS & CSS gzip deltas vs `aa90c9b`, `afterLcp` chunk load order, compositor-only CSS, `4x-CPU TBT < 250ms`, and `prefers-reduced-motion`. |
| Quality gate (Lighthouse) | `node scripts/run-quality-gate.mjs` | Runs 5× mobile Lighthouse + console check on `dist/` (writes `lighthouse-motion-final.json`). |
| Security audit | `npm audit` | **Fails** (`exit 1`: 19 vulns, mostly unused `next@16.1.6`, `F-002`). |

> Do **not** use `npm run legacy:dev` or `npm run legacy:build` — they target archived pre-Astro HTML.

---

## 3. Tech Stack & Versions (Active Only)
- `astro@7.4.1` (`output: 'static'`, `build.inlineStylesheets: 'always'`, i18n `id`/`en`)
- `@astrojs/preact@6.1.0` + `preact@11.0.1` (`jsxImportSource: "preact"` in `tsconfig.json`)
- `motion@14.12.0` (MIT; pinned exact; import **only** via `import('motion/mini')` inside `src/lib/lazyMotion.ts`, never eagerly before LCP)
- `tailwindcss@4.2.1` + `@tailwindcss/vite@4.3.3`
- `zod@4.6.7` + `typescript@5.9.3` (`extends: "astro/tsconfigs/strict"`)
- Ignore `next`, `react`, `react-dom`, `framer-motion`, `lucide-react`, `react-simple-typewriter` — leftover unused dependencies (`F-003`).

---

## 4. Repo Map
See [ARCHITECTURE.md](ARCHITECTURE.md) §4 for the full annotated tree. Key active paths:
- `src/pages/{index,en/index}.astro` — Route entrypoints (`id`, `en`)
- `src/layouts/BaseLayout.astro` — `<head>`, SEO/JSON-LD, theme script, deferred JS
- `src/components/*.astro` — Zero-JS UI sections (`MainPage.astro` composes all sections; `ProjectPeek.astro`, `ArchitectureStrip.astro` enrich project cards)
- `src/islands/{HeroFocusConsole,ProjectFilter,CipherPreview,YoloDemo,ProjectModal,CommandPalette}.tsx` — Hydrated Preact islands
- `src/lib/{lazyMotion,commandPalette}.ts` — Lazy-loaded interaction helpers (`0 B` critical path)
- `src/data/{profile.json,schema.ts,profile.ts,projectCatalog.ts}` — Zod-validated bilingual profile & unified public project catalog
- `src/styles/{global,motion}.css` — Tailwind v4 `@theme` tokens & motion CSS (`[UNVERIFIED on Safari/Firefox]` for `animation-timeline`, `@starting-style`, `:has()`, View Transitions)
- `public/` — Fonts, images, `CV.pdf`, `js/{main,motion}.js`, `robots.txt`, `sitemap.xml`
- `tests/` — Puppeteer functional & content-parity checks

---

## 5. Conventions Observed in This Codebase
- **Path alias**: `@/*` maps to `src/*` (`tsconfig.json:9`), though active files mostly use relative imports (`../data/profile`).
- **Preact JSX attributes**: Use `class="..."` (not `className`) in both `.astro` and `.tsx` islands (`jsxImportSource: "preact"`).
- **Localized strings**: Wrap bilingual values in `{ id: string, en: string }` and resolve via `getLocalized(field, lang)`.
- **Design tokens**: Always use semantic Tailwind tokens (`bg-surface-container-low`, `text-primary`, `text-secondary`, `border-outline-variant/30`), never raw hex in components.
- **Compositor-only motion**: Animate exclusively `transform`, `opacity`, and `clip-path` using tokens in `src/styles/global.css`. Wrap reduced-motion overrides in `src/styles/motion.css`.

| Token | Value | Purpose |
| --- | --- | --- |
| `--duration-instant` / `fast` / `base` / `slow` / `hero` | `100ms` / `150ms` / `250ms` / `500ms` / `650ms` | Press, UI states, cards/modal, reveals, hero H1 |
| `--ease-standard` / `decelerate` / `accelerate` | `cubic-bezier(0.22,1,0.36,1)` / `(0,0,0.2,1)` / `(0.4,0,1,1)` | Motion curves |
| `--stagger-step` / `--motion-distance-sm` / `md` | `60ms` / `8px` / `16px` | Stagger & translate offsets |

**Pattern 1 — Bilingual Astro Section (`src/components/Education.astro:1-20`):**
```astro
---
import { education, certifications, getLocalized, type Lang } from '../data/profile';

interface Props {
  lang?: Lang;
}

const { lang = 'id' } = Astro.props;
const sectionTag = lang === 'id' ? 'LANDASAN AKADEMIK' : 'ACADEMIC FOUNDATION';
---
```

**Pattern 2 — Preact Island (`src/islands/ProjectFilter.tsx`):**
```tsx
  const applyFilterToGrid = useCallback((filterId: string, animate: boolean) => {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    grid.setAttribute('data-active-filter', filterId);
```

---

## 6. Boundaries

### ALWAYS
- Edit active code in `src/` and `public/` (never `app/`, `components/`, `_legacy/`, or root `images/`/`fonts/`).
- Validate `src/data/profile.json` changes with `npm run build` (triggers `ProfileSchema.parse`).
- Ensure any `aria-label` on buttons/links **includes the visible label text** (WCAG 2.5.3, `F-004`).
- Support both `lang="id"` (`/`) and `lang="en"` (`/en`), plus dark (`:root`) and light (`html.light`) themes.
- Add `rel="noopener noreferrer"` to every `target="_blank"` link.
- **Always check**: Run `npm run build`, `npx tsc --noEmit`, `node tests/test-functional.mjs`, `node tests/test-content-parity.mjs`, and `npm run test:motion` before finishing.

### ASK FIRST
- Deleting `app/`, `components/`, `_legacy/`, root duplicate assets, or uninstalling unused npm packages (`F-003`).
- Adding new npm dependencies or installing `@astrojs/check`.
- Changing URL routes, `astro.config.mjs` i18n settings, `vercel.json` headers, or `src/data/schema.ts`.
- Modifying `tests/allowlist-approved-diffs.json` or adding new unverified biographical/project claims.

### NEVER
- Invent project metrics, institutions, certifications, or dates not verified by the owner (`tests/test-content-parity.mjs` denylist).
- Commit `.env*`, API keys, tokens, `dist/`, `screenshots/`, or `lighthouse-*.json`.
- Edit generated files in `dist/` or `.astro/` directly.
- Introduce `any` (existing `src/data/profile.ts:8` must be fixed, not copied) or disable ESLint/TS rules inline without justification.
- Load external font CDNs or third-party tracking scripts without updating CSP/budgets.

---

## 7. Task Playbooks

- **Add a Project** *(via `src/data/projectCatalog.ts`)*:
  1. Add project entry in `src/data/profile.json` (`projects[]`), matching `ProjectItemSchema` (`src/data/schema.ts:28-44`).
  2. Add `<slug>` details/metrics/highlights/stack in `src/data/projectCatalog.ts` (`PROJECT_SPECS` / `getPublicProjectCatalog`).
  3. Add `<article data-domain="...">` card in `src/components/Projects.astro` with `data-project-trigger="<slug>"` and optional `<ProjectPeek>` / `<ArchitectureStrip>`.
  4. Update filter chips in `src/islands/ProjectFilter.tsx` if introducing a new domain filter, and update `tests/test-content-parity.mjs` + fixture if count/copy changed.
  5. Run `npm run build && npx tsc --noEmit` + `node tests/test-functional.mjs` + `node tests/test-content-parity.mjs` + `npm run test:motion`.

- **Add a Blog Post / Page**:
  1. Create `src/pages/<slug>.astro` and `src/pages/en/<slug>.astro` wrapped in `BaseLayout.astro` with localized `title`/`description`/`lang`.
  2. Update `Navbar.astro` and `MobileDrawer.astro` navigation links.
  3. Update `public/sitemap.xml` (both `<url>` entries + `xhtml:link` alternates).
  4. If adding multiple blog posts, introduce Astro Content Collections (`src/content/`) and switch `astro.config.mjs` `inlineStylesheets` from `'always'` to `'auto'`.

- **Change Theme / Colors**:
  1. Edit CSS custom properties in `src/styles/global.css` under `:root` (dark) and `html.light` (light). Keep `@theme` mappings intact.
  2. Verify contrast >= 4.5:1 (normal text) and check `MainPage.astro` / `motion.css` for hardcoded colors (`F-014`).

- **Add a Section**:
  1. Create `src/components/<Section>.astro` accepting `lang?: Lang`, using `scroll-reveal` and `max-w-[1280px] mx-auto px-4 md:px-10 py-16 border-t border-outline-variant/20`.
  2. Mount it in `src/components/MainPage.astro` inside `<main>` and add anchor link in `Navbar.astro`, `MobileDrawer.astro`, and `public/js/main.js` (`sectionIds`, line 132).

- **Update SEO Metadata**:
  1. Edit `title`/`description`/JSON-LD in `src/layouts/BaseLayout.astro` (and `MainPage.astro:24-30`, which currently overrides them).
  2. Update `public/robots.txt` and `public/sitemap.xml` (not root `robots.txt`/`sitemap.xml`, which are stale duplicates).

- **Add an animation**:
  1. Use existing `--duration-*`, `--ease-*`, and `--motion-distance-*` tokens in `src/styles/global.css` (never magic numbers).
  2. Animate ONLY `transform`, `opacity`, or paint-only `clip-path` (never `width`, `height`, `top`, `left`, `margin`, `box-shadow`, or `transition: all`).
  3. Keep Hero LCP element (Hero subtitle `<p>` and portrait) at `opacity: 1` at `t=0`; wrap pointer hover effects in `@media (hover: hover) and (pointer: fine)` with `:focus-visible`/`:focus-within` parity.
  4. Gate newer CSS (`animation-timeline`, `@starting-style`, `document.startViewTransition`) with `@supports` / feature detection and preserve a working fallback.
  5. Add reduced-motion deactivation to the consolidated `@media (prefers-reduced-motion: reduce)` block in `src/styles/motion.css`, then verify via `npm run build && npm run test:motion`.

- **Add a Dependency**:
  1. Ask first. Prefer zero-dependency CSS/vanilla JS or Preact-compatible lightweight packages.
  2. After approval, install with `npm install <pkg>`, check `npm audit`, and verify JS bundle impact in `dist/_astro/`.

---

## 8. Definition of Done Checklist
- [ ] `npm run build` succeeds (`exit 0`) with 2 pages built (`/` and `/en`).
- [ ] `npx tsc --noEmit` exits `0` (and `npx astro check` once `@astrojs/check` is installed).
- [ ] `node tests/test-functional.mjs`, `node tests/test-content-parity.mjs`, and `npm run test:motion` pass on `/` and `/en`.
- [ ] Responsive verified at `360px`, `390px`, `768px`, `1440px` in both dark and light modes.
- [ ] Reduced-motion (`prefers-reduced-motion: reduce`) and keyboard navigation (Tab, Enter, Escape on modal) verified.
- [ ] Lighthouse targets met (`Perf >= 95`, `A11y = 100` with `0` failed audits, `BP = 100`, `SEO = 100`).
- [ ] `ARCHITECTURE.md` / `AGENT.md` updated if structure, commands, or playbooks changed.

---

## 9. Quality Budgets
- **Lighthouse**: Performance >= `95` (current ~97–98 mobile / 100 desktop), Accessibility = `100` (`0` failing audits), Best Practices = `100`, SEO = `100`.
- **Core Web Vitals**: `LCP <= 2.5s` (mobile, early-warning `> 2.3s`), `INP <= 200ms` (`LH TBT < 100ms`, `4x-CPU TBT < 250ms`), `CLS <= 0.05` (alarm `> 0.01`).
- **Tiered Motion & Bundle Caps (Phase D vs `aa90c9b`: `4,464 B` Critical JS, `19,785 B` pre-existing Deferred JS, `10,766 B` CSS gz)**:
  - New Critical JS `<= +3 KB` (`3,072 B`) gz (currently `+0 B`);
  - New Deferred JS `<= +30 KB` (`30,720 B`) gz (currently `+12,426 B`; page-total deferred `32,211 B`);
  - New Inline CSS `<= +4 KB` (`4,096 B`) gz (currently `+469 B` vs `aa90c9b`);
  - `afterLcp` network order enforced and all eager chunks wait for idle/visible hydration.
  - Optimized images `< 150 KB` AVIF/WebP; avoid adding React runtime to `dist/_astro/`.

---

## 10. Git Workflow
- **Active Branch History**: `feat/motion-ux-upgrade` (`PR #9`, `0ad9462`) shipped CSS/vanilla motion baseline; `feat/signature-interactions` branches from `main` with `DECISION_REPORT.md` + 14 atomic Conventional Commits (`feat(hero|projects|modal|nav)`, `fix(nav|content)`, `refactor(projects)`, `chore(deps)`, `test(budgets)`, `docs`).
- **Standard**: Branch from `main` using `feat/<topic>`, `fix/<topic>`, or `chore/<topic>`; use atomic Conventional Commits; pass `build`, `tsc`, `test-functional`, `test-content-parity`, and `test:motion` before PR merge.

---

## 11. Known Gotchas & Footguns
1. **Dual codebase trap (`F-003`)**: `app/`, `components/`, `next.config.ts`, `_legacy/`, and root `images/`/`sitemap.xml` are **not built** by `npm run build`. Always edit `src/` and `public/`.
2. **Remaining split data (`F-007`)**: Project cards, peek specs, and `ProjectModal` share `src/data/projectCatalog.ts` + `profile.json`, whereas `About.astro`, `Experience.astro` pills, and `Skills.astro` still hardcode items.
3. **Hero LCP element & offscreen `<input>` hazard**: Lighthouse identifies Hero subtitle `<p>` (and portrait) as LCP—never start them at `opacity: 0`. Never mount eager `<input>` controls inside offscreen `.scroll-reveal` cards (triggers heavy initial `styleLayout` / `TBT`); keep them behind click triggers (`[Edit Text]`, `CommandPalette`).
4. **Mutually exclusive scroll & `:has()` rules**: `animation-timeline: view()` (`animation-fill-mode: both`) sits above normal author declarations in Chrome's cascade; target `> *` inside `#projects-grid:has(.card-interactive:hover) .card-interactive:not(:hover)` and keep `transition: none !important; opacity: 1 !important;` under `prefers-reduced-motion`.
5. **No fullscreen `<dialog>` `backdrop-blur`**: Avoid `backdrop:backdrop-blur-*` on large `<dialog>` modals (spikes `4x-CPU` compositing TBT); use `backdrop:bg-black/85`.
6. **Broken ESLint (`F-006`)**: `npx eslint .` still runs legacy Next.js rules over `dist/` and `.astro/` (out-of-scope follow-up).
7. **Cross-browser note**: `@starting-style`, `animation-timeline`, `document.startViewTransition`, and `:has()` are `[UNVERIFIED on Safari/Firefox]` (tested in Chromium only).

---

## 12. Sources of Truth (Conflict Resolution Order)
1. **Runtime & Build Configs**: `package.json`, `package-lock.json`, `astro.config.mjs`, `tsconfig.json`, `vercel.json` (authoritative for versions, routes, build, headers).
2. **Profile & Schema**: `src/data/schema.ts` + `src/data/profile.json` (authoritative for verified biographical/project facts; cross-check `tests/allowlist-approved-diffs.json`).
3. **Architecture & Agent Docs**: `ARCHITECTURE.md` and `AGENT.md` (must match #1 and #2).

---

## 13. Maintenance Rule
Whenever you add/remove a dependency, change build/test scripts, add a route/island/data field, or resolve an audit finding (`F-001`–`F-017`), **update `ARCHITECTURE.md` and `AGENT.md` in the same PR** so neither document drifts from the codebase.
