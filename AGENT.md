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
| Lint | `npx eslint .` | **Currently fails** (`exit 1`, 179 issues) due to legacy `eslint-config-next` scanning `dist/`/`.astro/` (`F-006`). |
| Functional tests | `node tests/test-functional.mjs` | **Passes** (`exit 0`); requires prior `npm run build` + local Chrome at `C:\Program Files\Google\Chrome\Application\chrome.exe`. |
| Content parity test | `node tests/test-content-parity.mjs` | **Currently fails** (`exit 1`: expects 5 projects, finds 6 after PartsBin addition, `F-001`). |
| Quality gate (Lighthouse) | `node scripts/run-quality-gate.mjs` | Runs 5× mobile Lighthouse + console check on `dist/` (writes `lighthouse-motion-final.json`). |
| Security audit | `npm audit` | **Currently fails** (`exit 1`: 19 vulns, mostly unused `next@16.1.6`, `F-002`). |

> Do **not** use `npm run legacy:dev` or `npm run legacy:build` — they target archived pre-Astro HTML.

---

## 3. Tech Stack & Versions (Active Only)
- `astro@7.4.1` (`output: 'static'`, `build.inlineStylesheets: 'always'`, i18n `id`/`en`)
- `@astrojs/preact@6.1.0` + `preact@11.0.1` (`jsxImportSource: "preact"` in `tsconfig.json`)
- `tailwindcss@4.2.1` + `@tailwindcss/vite@4.3.3`
- `zod@4.6.7` + `typescript@5.9.3` (`extends: "astro/tsconfigs/strict"`)
- Ignore `next`, `react`, `react-dom`, `framer-motion`, `lucide-react`, `react-simple-typewriter` — leftover unused dependencies (`F-003`).

---

## 4. Repo Map
See [ARCHITECTURE.md](ARCHITECTURE.md) §4 for the full annotated tree. Key active paths:
- `src/pages/{index,en/index}.astro` — Route entrypoints (`id`, `en`)
- `src/layouts/BaseLayout.astro` — `<head>`, SEO/JSON-LD, theme script, deferred JS
- `src/components/*.astro` — Zero-JS UI sections (`MainPage.astro` composes all sections)
- `src/islands/{ProjectFilter,ProjectModal,YoloDemo}.tsx` — Hydrated Preact islands
- `src/data/{profile.json,schema.ts,profile.ts}` — Zod-validated bilingual profile data
- `src/styles/{global,motion}.css` — Tailwind v4 `@theme` tokens & motion CSS
- `public/` — Fonts, images, `CV.pdf`, `js/{main,motion}.js`, `robots.txt`, `sitemap.xml`
- `tests/` — Puppeteer functional & content-parity checks

---

## 5. Conventions Observed in This Codebase
- **Path alias**: `@/*` maps to `src/*` (`tsconfig.json:9`), though active files mostly use relative imports (`../data/profile`).
- **Preact JSX attributes**: Use `class="..."` (not `className`) in both `.astro` and `.tsx` islands (`jsxImportSource: "preact"`).
- **Localized strings**: Wrap bilingual values in `{ id: string, en: string }` and resolve via `getLocalized(field, lang)`.
- **Design tokens**: Always use semantic Tailwind tokens (`bg-surface-container-low`, `text-primary`, `text-secondary`, `border-outline-variant/30`), never raw hex in components.
- **Compositor-only motion**: Animations use `transform` and `opacity` with `prefers-reduced-motion` fallbacks (`src/styles/motion.css`).

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

**Pattern 2 — Preact Island (`src/islands/ProjectFilter.tsx:17-30`):**
```tsx
interface Props {
  lang?: 'id' | 'en';
}

export default function ProjectFilter({ lang = 'id' }: Props) {
  const [active, setActive] = useState<string>('all');
  const handleSelect = (filterId: string) => {
    setActive(filterId);
    const grid = document.getElementById('projects-grid');
    if (grid) grid.setAttribute('data-active-filter', filterId);
  };
```

---

## 6. Boundaries

### ALWAYS
- Edit active code in `src/` and `public/` (never `app/`, `components/`, `_legacy/`, or root `images/`/`fonts/`).
- Validate `src/data/profile.json` changes with `npm run build` (triggers `ProfileSchema.parse`).
- Ensure any `aria-label` on buttons/links **includes the visible label text** (WCAG 2.5.3, `F-004`).
- Support both `lang="id"` (`/`) and `lang="en"` (`/en`), plus dark (`:root`) and light (`html.light`) themes.
- Add `rel="noopener noreferrer"` to every `target="_blank"` link.
- Run `npm run build`, `npx tsc --noEmit`, and `node tests/test-functional.mjs` before finishing.

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

- **Add a Project** *(note `F-007` split data)*:
  1. Add project entry in `src/data/profile.json` (`projects[]`), matching `ProjectItemSchema` (`src/data/schema.ts:28-44`).
  2. Add `<article data-domain="...">` card in `src/components/Projects.astro` with `data-project-trigger="<slug>"`.
  3. Add matching `<slug>` entry to `PROJECT_DETAILS` in `src/islands/ProjectModal.tsx`.
  4. Update category `count` in `FILTERS` (`src/islands/ProjectFilter.tsx:9-15`).
  5. Update `tests/test-content-parity.mjs` & fixture if count/copy changed, then run `npm run build` + `node tests/test-functional.mjs`.

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

- **Add a Dependency**:
  1. Ask first. Prefer zero-dependency CSS/vanilla JS or Preact-compatible lightweight packages.
  2. After approval, install with `npm install <pkg>`, check `npm audit`, and verify JS bundle impact in `dist/_astro/`.

---

## 8. Definition of Done Checklist
- [ ] `npm run build` succeeds (`exit 0`) with 2 pages built (`/` and `/en`).
- [ ] `npx tsc --noEmit` exits `0` (and `npx astro check` once `@astrojs/check` is installed).
- [ ] `node tests/test-functional.mjs` passes on both `/` and `/en`.
- [ ] `tests/test-content-parity.mjs` updated and passing (after `F-001` fix).
- [ ] Responsive verified at `360px`, `390px`, `768px`, `1440px` in both dark and light modes.
- [ ] Reduced-motion (`prefers-reduced-motion: reduce`) and keyboard navigation (Tab, Enter, Escape on modal) verified.
- [ ] Lighthouse targets met (`Perf >= 95`, `A11y = 100` with `0` failed audits, `BP = 100`, `SEO = 100`).
- [ ] `ARCHITECTURE.md` / `AGENT.md` updated if structure, commands, or playbooks changed.

---

## 9. Quality Budgets
- **Lighthouse**: Performance >= `95` (target >= 90; currently 99 mobile / 100 desktop), Accessibility = `100` (with 0 failing audits), Best Practices = `100`, SEO = `100`.
- **Core Web Vitals**: `LCP <= 2.5s` (mobile), `INP <= 200ms` (`TBT < 150ms` lab proxy), `CLS <= 0.05` (target <= 0.1).
- **Assets & JS**: `public/js/motion.js` < 3 KB gzipped; optimized images `< 150 KB` AVIF/WebP (replace `1.45 MB` fallback JPGs); avoid adding React runtime to `dist/_astro/`.

---

## 10. Git Workflow
- **Detected History**: Feature/chore branches (`feat/*`, `chore/*`, `refactor/*`, `migration/*`) merged via GitHub PRs into `main`; Conventional Commits (`feat(seo): ...`, `fix(routing): ...`, `test(parity): ...`, `refactor(deploy): ...`). Note: current branch `feat/add-partsbin-project` has commit `c76b52c update project` (non-conventional).
- **Standard**: Branch from `main` using `feat/<topic>`, `fix/<topic>`, or `chore/<topic>`; use Conventional Commits `type(scope): summary`; ensure build + functional/parity tests pass before merging PR.

---

## 11. Known Gotchas & Footguns
1. **Dual codebase trap**: `app/`, `components/`, `next.config.ts`, `_legacy/`, and root `images/`/`sitemap.xml` are **not built** by `npm run build`. Always edit `src/` and `public/`.
2. **Split project data (`F-007`)**: `profile.json` alone will **not** update `ProjectModal.tsx`, `ProjectFilter.tsx`, or Cards 1–3 tags/links in `Projects.astro`.
3. **Stale parity test (`F-001`)**: `tests/test-content-parity.mjs` hardcodes `5` projects and fails until updated for PartsBin (`6`).
4. **Duplicate scroll observer (`F-009`)**: `.scroll-reveal` is observed in both `public/js/main.js` and `public/js/motion.js`.
5. **Broken ESLint (`F-006`)**: `npx eslint .` runs Next.js rules over `dist/` and `.astro/`.
6. **WCAG 2.5.3 mismatch (`F-004`)**: Never add an `aria-label` that omits the button/link's visible text.

---

## 12. Sources of Truth (Conflict Resolution Order)
1. **Runtime & Build Configs**: `package.json`, `package-lock.json`, `astro.config.mjs`, `tsconfig.json`, `vercel.json` (authoritative for versions, routes, build, headers).
2. **Profile & Schema**: `src/data/schema.ts` + `src/data/profile.json` (authoritative for verified biographical/project facts; cross-check `tests/allowlist-approved-diffs.json`).
3. **Architecture & Agent Docs**: `ARCHITECTURE.md` and `AGENT.md` (must match #1 and #2).

---

## 13. Maintenance Rule
Whenever you add/remove a dependency, change build/test scripts, add a route/island/data field, or resolve an audit finding (`F-001`–`F-017`), **update `ARCHITECTURE.md` and `AGENT.md` in the same PR** so neither document drifts from the codebase.
