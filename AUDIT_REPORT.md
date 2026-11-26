# Repository Audit Report — `robertus-portfolio`

## Executive Summary

This repository hosts the personal portfolio of **Robertus William Susanto** (Computer Engineering student, Diponegoro University), deployed as a static site on Vercel (`https://myportfolio-zeta-peach-42.vercel.app`). It has migrated from Next.js to **Astro 7.4.1** with **Preact 11.0.1** islands, **Tailwind CSS 4.2.1**, **Zod 4.6.7** schema validation, and bilingual Indonesian/English routing (`/` and `/en`).

Production performance and static output are strong (Lighthouse Mobile **99**, Desktop **100**), and core interactivity passes functional checks. However, the repository retains **unused Next.js/React/legacy files and dependencies** (causing **19 `npm audit` vulnerabilities** including 1 Critical and 7 High, plus **25 ESLint errors**), a **failing content-parity test** (`Expected 5 projects, got 6`), **WCAG 2.5.3 Label-in-Name failures** on 14 elements, duplicated content definitions between `src/data/profile.json` and components/islands, and **1.45 MB+ unoptimized fallback images** copied into `dist/`.

---

## Repo Fact Sheet (Phase 0 Baseline)

| Attribute | Observed Fact | Evidence | Confidence |
| --- | --- | --- | --- |
| Project type | Personal portfolio website (bilingual ID/EN) | `package.json:2`, `astro.config.mjs:11-17` | High |
| Owner | Robertus William Susanto (Computer Engineering, Diponegoro University) | `package.json:5-9`, `src/data/profile.json:3-55` | High |
| Primary goal | `[ASSUMPTION]` Showcase AI/software engineering projects and attract internship/job opportunities | `src/data/profile.json:30-37`, `src/components/Hero.astro:78-99` | Med |
| Target audience | `[ASSUMPTION]` Recruiters, engineering managers, and technical collaborators (ID & EN) | `src/pages/index.astro`, `src/pages/en/index.astro` | Med |
| Primary framework | Astro `7.4.1` (locked) with `@astrojs/preact` `6.1.0` & Preact `11.0.1` | `package.json:23-30`, `package-lock.json` | High |
| Legacy framework (unused) | Next.js `16.1.6` + React `19.2.3` + `_legacy/` static HTML | `app/`, `components/`, `_legacy/`, `package.json:27-32` | High |
| Language & validation | TypeScript `5.9.3` (strict Astro preset), Zod `4.6.7` | `tsconfig.json:2`, `src/data/schema.ts:1` | High |
| Package manager & runtime | npm `11.9.0`, Node.js `v24.14.0` (local environment; no `.nvmrc`/`engines`) | `node -v`, `npm -v`, `package.json` | High |
| Build tool | Astro/Vite (`@tailwindcss/vite` `4.3.3`) | `astro.config.mjs:3,18-21` | High |
| Rendering & routing | Static Site Generation (`output: 'static'`), file-based i18n routes `/` (`id`) and `/en` (`en`) | `astro.config.mjs:7,11-17`, `src/pages/` | High |
| Styling | Tailwind CSS `4.2.1` (`@theme` tokens in `global.css`) + custom CSS (`motion.css`), inlined in HTML | `src/styles/global.css`, `astro.config.mjs:8-10` | High |
| State management | Ephemeral component state (`useState` in Preact islands) + `localStorage` (`theme`) | `src/islands/*.tsx`, `src/layouts/BaseLayout.astro:91` | High |
| Content source | `src/data/profile.json` (Zod-validated) + hardcoded strings in Astro components & `ProjectModal.tsx` | `src/data/profile.ts`, `src/islands/ProjectModal.tsx:21-262` | High |
| Form / contact handling | No backend form; direct `mailto:` / Gmail compose (`openDirectEmail`) + clipboard copy (`copyEmailAddress`) | `public/js/main.js:2-52`, `src/components/Contact.astro` | High |
| Analytics | None observed | Repo-wide search | High |
| Hosting & deploy | Vercel static output (`dist/`), `framework: null`, `buildCommand: "npm run build"` | `vercel.json:1-7` | High |
| CI/CD | None observed (no `.github/workflows` or CI config) | Repo root check | High |
| Environment variables | None used in `src/` or `vercel.json` | Repo-wide search | High |
| Output language | `[ASSUMPTION]` English (prompt language; repo supports ID & EN) | User request & `README.md` | Med |

### Executed Verification Commands Summary

| Command | Exit Code | Key Output Summary |
| --- | --- | --- |
| `npm run build` | `0` | Built 2 static pages (`/index.html` 132,000 B, `/en/index.html` 131,998 B) in 2.23s into `dist/`. |
| `npx tsc --noEmit` | `0` | Passed for `.ts`/`.tsx` files in `src/**/*`; does **not** typecheck `.astro` files (`@astrojs/check` absent). |
| `npx eslint .` | `1` | **179 problems (25 errors, 154 warnings)**; scans `dist/`, `.astro/`, `_legacy/`, `scripts/`, plus real `src/` errors. |
| `node tests/test-functional.mjs` | `0` | Passed for `dist/index.html` and `dist/en/index.html` (switcher, 22 buttons, modal dialog, copy email). |
| `node tests/test-content-parity.mjs` | `1` | **Failed (2 errors)**: expected 5 projects on ID/EN pages, got 6 (stale after PartsBin addition). |
| `npm audit` | `1` | **19 vulnerabilities**: 1 Critical (`next`), 7 High, 10 Moderate (`astro` <=7.4.6, etc.), 1 Low. |
| `npm outdated` | `1` | Patch/minor updates for `astro` (`7.4.1` -> `7.4.13`), `@astrojs/preact`, Tailwind, Preact; major updates for `eslint`, `typescript`, `framer-motion`. |
| Live Lighthouse (Mobile, `dist/index.html`) | `0` | Perf **99**, A11y **100** (weighted), BP **100**, SEO **100**; FCP `1508ms`, LCP `2033ms`, CLS `0.0018`, TBT `10ms`, `325,723` B. Failed `label-content-name-mismatch`. |
| Live Lighthouse (Desktop broadband) | `0` | Perf **100**, A11y **100** (weighted), BP **100**, SEO **100**; FCP `374ms`, LCP `508ms`, CLS `0.0005`. Failed `label-content-name-mismatch` on 14 nodes. |

---

## Audit Scorecard (12 Dimensions)

| # | Dimension | Score (0–5) | Summary |
| --- | --- | --- | --- |
| 1 | Architecture & structure | 2.5 | Clean Astro island architecture undermined by unremoved Next.js (`app/`, `components/`), `_legacy/`, duplicate root assets, and duplicate JS observers. |
| 2 | Code quality | 2.5 | Strict TypeScript + Zod schema in `src/data/`; offset by `any` in `profile.ts`, failing `eslint` config, dead variables, and hardcoded duplication. |
| 3 | Performance | 4.0 | Lighthouse Mobile 99 / Desktop 100 and CLS ~0.001; penalized by 1.45 MB / 440 KB unoptimized fallback images and 48.8 KB inlined CSS per page. |
| 4 | SEO | 3.5 | Strong canonical, `hreflang`, OG/Twitter, and `Person` JSON-LD; lacks `astro.config.mjs` `site`, dynamic sitemap, `og:site_name`, and `WebSite` schema. |
| 5 | Accessibility (WCAG 2.2 AA) | 2.5 | Good landmarks, `<dialog>` modal, and `prefers-reduced-motion`; fails WCAG 2.5.3 on 14 nodes, hidden skip link, focusable filtered-out cards, and small targets. |
| 6 | Responsive & cross-browser | 3.5 | Mobile bottom nav + drawer + fluid grids work well; minor light-mode dot-grid visibility bug, forced-dark fallback, and conflicting `pt-0`/`pt-4` classes. |
| 7 | Security | 2.5 | Zero secrets in repo and `rel="noopener noreferrer"` on external links; fails `npm audit` (19 vulns via unused `next`) and lacks CSP/HSTS in `vercel.json`. |
| 8 | Dependencies | 2.0 | Astro/Preact/Zod core is lean, but 9 unused Next/React/animation packages remain installed and inflate install footprint & CVE surface. |
| 9 | Testing & quality gates | 2.5 | Impressive custom Puppeteer/Lighthouse scripts exist, but `test-content-parity.mjs` fails, `.astro` typechecking is missing, and no CI runs tests. |
| 10 | DevOps & DX | 2.0 | `vercel.json` is clean, but `package.json` lacks `lint`/`test`/`typecheck` scripts, `README.md` has no dev docs, and no CI/hooks exist. |
| 11 | Content & UX | 3.5 | Clear identity/value prop above the fold and 6 real projects; lacks deep problem->approach->result case studies, public repos on 3 projects, and true YOLO diff media. |
| 12 | Maintainability | 2.0 | `profile.json` + `schema.ts` intent is right, yet adding a project still requires editing 4+ files (`profile.json`, `Projects.astro`, `ProjectModal.tsx`, `ProjectFilter.tsx`, tests). |

### Dimension-by-Dimension Evaluation

1. **Architecture & structure (2.5/5)**
   - **Good**: Clear separation inside `src/` between `pages/`, `layouts/`, `components/` (zero-JS Astro), `islands/` (Preact `client:visible`/`client:idle`), `data/` (Zod-validated JSON), and `styles/`.
   - **Wrong**: Coexists with dead Next.js directories (`app/`, `components/`, `next.config.ts`, `next-env.d.ts`, `eslint.config.mjs`), `_legacy/`, duplicate root asset directories (`images/`, `fonts/`, `CV.pdf`, `robots.txt`, `sitemap.xml` mirroring `public/`), and duplicate JS (`src/js/` vs `public/js/`). Both `public/js/main.js:150-172` and `public/js/motion.js:14-44` instantiate `.scroll-reveal` observers.
   - **Why it matters**: Agents and contributors waste time modifying or auditing dead paths and risk introducing regressions across duplicated scripts.

2. **Code quality (2.5/5)**
   - **Good**: `tsconfig.json:2` extends `astro/tsconfigs/strict` with `strictNullChecks: true`; `src/data/schema.ts` enforces runtime Zod parsing (`ProfileSchema.parse(profileJson)`).
   - **Wrong**: `npx eslint .` exits `1` (179 issues across unignored `dist/`, `.astro/`, `_legacy/`, and `src/`). `src/data/profile.ts:8` uses `field: any`. `Hero.astro:15-17` defines unused `summaryText`. `Projects.astro:110,152,202,255,297` apply both `pt-0` and `pt-4` on the same element. `@astrojs/check` is absent, so `.astro` templates are not typechecked.
   - **Why it matters**: Broken lint and missing `.astro` typechecking allow silent regressions and erode agent reliability.

3. **Performance (4.0/5)**
   - **Good**: Only 3 Preact islands hydrate lazily (`client:visible` / `client:idle`); self-hosted subsetted `.woff2` fonts (`~29-31 KB` each) with `preload` for Geist (`BaseLayout.astro:85`) and `font-display: swap`; Lighthouse Mobile **99** (`LCP 2033ms`, `CLS 0.0018`, `TBT 10ms`) and Desktop **100** (`LCP 508ms`, `CLS 0.0005`).
   - **Wrong**: `public/project-ai.jpg` (`1,452,450 B`) and `public/Kriptografi.jpg` (`440,487 B`) and `public/profile.png` (`134,892 B`) sit uncompressed in `public/` and copy into `dist/`. `inlineStylesheets: 'always'` (`astro.config.mjs:9`) embeds `48,804 B` of CSS into both `dist/index.html` (`132,000 B`) and `dist/en/index.html` (`131,998 B`). `motion.css:100` animates `width` on `.hero-mono-typing` and `motion.css:235` sets permanent `will-change: transform` on cards.
   - **Why it matters**: Fallback assets bloat deployments/fallback loads, and uncached inline CSS re-downloads on every HTML navigation.

4. **SEO (3.5/5)**
   - **Good**: Proper `canonical`, `hreflang` (`id`, `en`, `x-default`), `og:locale`/`og:locale:alternate`, Twitter cards, and `Person` JSON-LD (`BaseLayout.astro:26-82`). `public/robots.txt` and `public/sitemap.xml` are present.
   - **Wrong**: `astro.config.mjs` omits `site`; `BaseLayout.astro:19-21,64-66` hardcode the Vercel domain; `public/sitemap.xml:9,18` has manual `lastmod: 2026-11-09` while stale root `sitemap.xml` shows `2026-10-20`; `og:site_name`, `og:image:alt`, and `WebSite` JSON-LD are missing; `Projects.astro:178` mislabels the portfolio card `"Next.js & Tailwind"`.
   - **Why it matters**: Manual metadata drifts when domains, dates, or project stacks change.

5. **Accessibility — WCAG 2.2 AA (2.5/5)**
   - **Good**: Semantic landmarks (`header`, `nav`, `main`, `footer`), native `<dialog>` with `aria-modal="true"` (`ProjectModal.tsx:318-328`), keyboard-operable `YoloDemo` slider (`YoloDemo.tsx:42-50,117-123`), and comprehensive `prefers-reduced-motion` support (`motion.css`).
   - **Wrong**: Live Lighthouse failed `label-content-name-mismatch` on **14 nodes** (WCAG 2.5.3). Skip link (`BaseLayout.astro:117`) lacks `focus:not-sr-only`. Dimmed filter cards (`motion.css:301-308`) remain keyboard-focusable (`pointer-events: none` without `inert`/`aria-hidden`). Several controls fall below 44×44 px (`Navbar.astro` switcher `14×16 px`, `ProjectFilter.tsx:58` `min-h-[36px]`, `Projects.astro` triggers `17 px` height).
   - **Why it matters**: Speech-input users cannot activate mismatched controls by visible label, and keyboard/screen-reader users encounter hidden skip links and disabled-but-focusable cards.

6. **Responsive & cross-browser (3.5/5)**
   - **Good**: Viewport meta configured, fluid Tailwind grids, mobile drawer + safe-area sticky bottom nav (`BottomNav.astro:17`), dark/light CSS variables (`global.css:22-64`).
   - **Wrong**: `MainPage.astro:43` renders `#ffffff` dot grid (invisible on light `#f8f9fa` surface). `BaseLayout.astro:91-101` forces dark mode even if `prefers-color-scheme: light` when `localStorage` is unset. `motion.css:195` hardcodes dark-green hex on `#scroll-progress`. `scroll-progress`/`timeline-draw-line` use CSS Scroll/View Timelines (`@supports`), which degrade gracefully in non-supporting browsers.
   - **Why it matters**: Light-theme users lose subtle surface texture and OS light-mode preference is ignored on first visit.

7. **Security (2.5/5)**
   - **Good**: Zero secrets/credentials found in repo; `.env*` gitignored (`.gitignore:22-23`); external `target="_blank"` links include `rel="noopener noreferrer"`; no `dangerouslySetInnerHTML` in `src/` (only `JSON.stringify(personSchema)` in `BaseLayout.astro:110`).
   - **Wrong**: `npm audit` reports **19 vulnerabilities** (1 Critical, 7 High, 10 Moderate, 1 Low), dominated by unused `next@16.1.6` and `astro@7.4.1` (`<=7.4.6`). `vercel.json:47-54` lacks `Content-Security-Policy`, `Strict-Transport-Security`, and `Permissions-Policy`, emits deprecated `X-XSS-Protection`, and relies on inline `<script is:inline>` plus 11 inline `onclick=` attributes.
   - **Why it matters**: Unpatched advisories trigger security alerts, and missing CSP/HSTS weakens browser defense-in-depth.

8. **Dependencies (2.0/5)**
   - **Good**: All locked licenses are permissive (`MIT`, `ISC`, `Apache-2.0`); `package-lock.json` is committed and synced.
   - **Wrong**: 9 packages (`next`, `react`, `react-dom`, `framer-motion`, `lucide-react`, `react-simple-typewriter`, `eslint-config-next`, `@types/react`, `@types/react-dom`) are completely unused by `src/`. `astro` (`7.4.1` vs `7.4.13`) and `@tailwindcss/*` have patch updates with security fixes.
   - **Why it matters**: Dead dependencies create avoidable CVEs, slow `npm install`, and confuse AI agents about which UI runtime is active.

9. **Testing & quality gates (2.5/5)**
   - **Good**: Automated Puppeteer functional check (`tests/test-functional.mjs`), content-parity check (`tests/test-content-parity.mjs`), and Lighthouse gate scripts (`scripts/run-quality-gate.mjs`, `scripts/run-gate.mjs`).
   - **Wrong**: `tests/test-content-parity.mjs` fails (`PARITY_EXIT:1`) on project count (5 vs 6). No unit tests exist for `src/data/schema.ts` or `getLocalized()`. No test checks `label-content-name-mismatch`, keyboard trapping, or broken external links. No CI executes any check automatically.
   - **Why it matters**: Regressions like stale parity tests or a11y failures merge directly into `main`.

10. **DevOps & DX (2.0/5)**
    - **Good**: `vercel.json` explicitly configures static build & long-lived immutable cache headers; `git log` shows mostly descriptive Conventional Commits and PR merges.
    - **Wrong**: `package.json:15-21` only defines `dev`, `build`, `preview`, `legacy:dev`, `legacy:build` (no `lint`, `typecheck`, `test`, `format`). `README.md` lacks setup, architecture, and verification instructions. No GitHub Actions CI, no `.nvmrc`/`.node-version`, and 14+ unindexed scripts in `scripts/`.
    - **Why it matters**: New contributors and AI agents have no single-command verification gate or onboarding guide.

11. **Content & UX (3.5/5)**
    - **Good**: Clear value proposition, availability pill, portrait, CV download, and email copy within the initial viewport (`Hero.astro`); 6 varied technical projects with interactive filtering and detail modal.
    - **Wrong**: Project cards and modals provide brief summaries rather than Problem -> Approach -> Result case studies; 3 of 6 projects lack public GitHub URLs (`profile.json:150-161,201-206,365-370,419-424`); `YoloDemo.tsx` compares the same `/project-ai.jpg` via CSS filters rather than real raw vs inference output; Card 4 still advertises `"Next.js & Tailwind"`.
    - **Why it matters**: Engineering recruiters look for verifiable code, measurable case-study outcomes, and authentic model demos.

12. **Maintainability (2.0/5)**
    - **Good**: `src/data/profile.json` + `src/data/schema.ts` establishes a typed bilingual data layer.
    - **Wrong**: Presentation components bypass `profile.json`—`ProjectModal.tsx` duplicates all 6 projects (`240+` lines), `ProjectFilter.tsx` hardcodes counts, `About.astro`, `Experience.astro` (dropping 1 tag on `exp4`), `Skills.astro`, and `Projects.astro` hardcode fields/links/email, and `schema.ts`'s `public: boolean` visibility flag is ignored everywhere.
    - **Why it matters**: Adding one project requires synchronized edits across 5+ files and still broke the parity test on the last feature PR.

---

> **Post-Upgrade Resolution Status (`feat/motion-ux-upgrade`)**: Findings **`F-001`** (`aca5e1e`), **`F-004`** (`6ddcab7`, `687c18e`), **`F-005`** (`ef4e603`, `4815b44`), **`F-009`** (`f331dd0`), **`F-014`** (`3ccd73b`), and **`F-017`** (`6f3bbc5`, `a5bc683`) are now **RESOLVED** (`test-content-parity`, `test-functional`, and `npm run test:motion` all pass; Lighthouse Mobile **98/100/100/100**). Findings `F-002`, `F-003`, `F-006`–`F-008`, `F-010`–`F-013`, `F-015`, `F-016` remain **OPEN** as out-of-scope follow-ups.

## Findings Register (Phase 2)

| ID | Title | Sev | Category | Evidence | Impact | Recommendation | Effort | Conf | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F-001 | Content parity test fails after 6th project added | High | Testing & quality gates | `node tests/test-content-parity.mjs` -> `FAILED: Expected 5 projects on ID/EN page, got 6`; `tests/test-content-parity.mjs:92-97` | Quality gate is permanently red; parity regressions go unnoticed. | Update `generate-snapshot-fixture.mjs`, `allowlist-approved-diffs.json`, and `test-content-parity.mjs` to validate dynamically against `src/data/profile.json` instead of a fixed count of `5`. | S (<2h) | High | **RESOLVED** (`aca5e1e`, `fed9717`) |
| F-002 | 19 `npm audit` vulnerabilities (1 Critical, 7 High) | High | Security | `npm audit` (`AUDIT_EXIT:1`): `next@16.1.6` (Critical/High), `sharp`, nested `postcss`, `astro<=7.4.6` (Moderate GHSA-mh32-jxcr-mh9f, GHSA-r3h5-4585-7x3w) | Vulnerable packages trigger GitHub/security alerts and risk supply-chain exposure if legacy entrypoints are ever invoked. | Remove unused `next` and `eslint-config-next`, upgrade `astro` to `^7.4.13` (`npm audit fix`), and regenerate `package-lock.json`. | S (<2h) | High | OPEN |
| F-003 | Dead Next.js/React/`_legacy` code and 9 unused packages | High | Architecture & structure | `app/`, `components/`, `next.config.ts`, `next-env.d.ts`, `_legacy/`, `package.json:25-33,41-44` (0 imports in `src/`) | Confuses contributors/AI agents, bloats `node_modules` and `npm audit`, breaks ESLint. | Delete `app/`, `components/`, `next.config.ts`, `next-env.d.ts`, `_legacy/`, `legacy:*` scripts, and uninstall the 9 unused packages. | M (<1 day) | High | OPEN |
| F-004 | WCAG 2.5.3 Label-in-Name failures on 14 interactive elements | High | Accessibility | Live Lighthouse `label-content-name-mismatch: 0` on `Navbar.astro:51-58`, `Hero.astro:93`, `Contact.astro:42`, and 11 triggers in `Projects.astro` | Voice-control users cannot target buttons/links by visible text; fails WCAG 2.2 AA (SC 2.5.3). | Ensure `aria-label` contains exact visible text in idle & copied states. | S (<2h) | High | **RESOLVED** (`6ddcab7`, `687c18e`) |
| F-005 | Hidden skip link, focusable filtered cards, and undersized touch targets | High | Accessibility | `BaseLayout.astro:117` (`sr-only` without `focus:not-sr-only`); `motion.css:301-308`; `ProjectFilter.tsx:58` (`min-h-[36px]`); inline triggers | Keyboard users cannot see skip link or bypass hidden/dimmed cards; touch targets fail mobile ergonomics. | Reveal skip link on focus; mark filtered-out cards `hidden`/`inert`; enlarge filter chips to `44px` (inline text triggers & `EN`/`ID` link remain `<44px` follow-up). | M (<1 day) | High | **RESOLVED** (`ef4e603`, `4815b44`) |
| F-006 | Broken ESLint config (179 errors/warnings) & missing `.astro` typecheck | Medium | Code quality | `npx eslint .` -> 25 errors, 154 warnings (`eslint.config.mjs` scans `dist/`, `.astro/`, `_legacy/`; `src/data/profile.ts:8` `any`); `@astrojs/check` absent | No working lint or `.astro` template typechecking gate. | Replace `eslint-config-next` with `eslint-plugin-astro` + `typescript-eslint`, fix `profile.ts` typing, install `@astrojs/check`. | M (<1 day) | High | OPEN |
| F-007 | Duplicated content & ignored `public` flag across components/islands | Medium | Maintainability | `ProjectModal.tsx:21-262`, `About.astro`, `Experience.astro`, `Skills.astro`, `Projects.astro`; `schema.ts:13-17` unused `public` check | Updating or adding a project/skill requires editing 5+ files and causes data drift. | Make `src/data/profile.json` + `profile.ts` the single source of truth; enforce `.public === true`. | M (<1 day) | High | OPEN |
| F-008 | Duplicate root/`public/` assets, unused SVGs, and 1.45 MB fallback image | Medium | Performance | `images/`, `fonts/`, `CV.pdf`, `robots.txt`, `sitemap.xml` duplicated in `public/`; `public/project-ai.jpg` (1.45 MB), `public/Kriptografi.jpg` (440 KB), `public/css/style.css` (45 KB) | Wastes repo storage, ships dead files to `dist/`, and risks 1.45 MB fallback download. | Remove root duplicates and unused Next.js SVGs/`public/css/style.css`; compress fallback JPGs (`<150 KB`). | M (<1 day) | High | OPEN |
| F-009 | Duplicate `.scroll-reveal` observers & redundant JS files | Medium | Architecture & structure | `public/js/main.js:150-172` and `public/js/motion.js:14-44` both observed `.scroll-reveal`; `src/js/*` and `public/js/theme.js` unused | Double `IntersectionObserver` work on scroll and script confusion. | Remove duplicate `.scroll-reveal` block from `public/js/main.js` (done); delete unused `src/js/*` & `public/js/theme.js` in cleanup PR. | S (<2h) | High | **RESOLVED** (`f331dd0`; dead file cleanup open) |
| F-010 | Missing CSP, HSTS, `Permissions-Policy` and inline `onclick` handlers | Medium | Security | `vercel.json:47-54` lacks CSP/HSTS/`Permissions-Policy`; inline `onclick=` attributes | Reduced defense-in-depth; inline handlers block strict CSP. | Replace `onclick=` with delegated listeners and add CSP/HSTS/`Permissions-Policy` in `vercel.json`. | M (<1 day) | High | OPEN |
| F-011 | Hardcoded canonical/OG URLs, stale manual sitemaps, and stale Card 4 badge | Medium | SEO | `astro.config.mjs` has no `site`; `BaseLayout.astro:19-21,64-66`; `Projects.astro:178` (`Next.js & Tailwind`) | Risk of canonical/sitemap drift; Card 4 badge misstates current Astro stack. | Set `site` in `astro.config.mjs`, use `@astrojs/sitemap`, update Card 4 copy/badge. | S (<2h) | High | OPEN |
| F-012 | Missing CI/CD, pre-commit hooks, `package.json` gate scripts, and onboarding README | Medium | DevOps & DX | No `.github/workflows`; `package.json` lacks `lint`/`typecheck`/`test` (`test:motion` added in `387da90`); `README.md` lacks dev docs | Contributors/agents lack automated PR gates and runbooks. | Add `lint`, `typecheck`, `test` scripts, GitHub Actions CI, and expand `README.md`. | M (<1 day) | High | OPEN |
| F-013 | Incomplete i18n localization in `YoloDemo`, portrait `alt`, and ARIA labels | Low | Content & UX | `YoloDemo.tsx`; `Hero.astro:41`; `Navbar.astro:34`; `About.astro:50`; `ThemeToggle.astro:3` | Indonesian page (`/`) exposes English screen-reader labels and `alt` text. | Pass `lang` to `YoloDemo` and localize ARIA/`alt` strings. | S (<2h) | High | OPEN |
| F-014 | Light-mode visibility/OS-preference issues & conflicting padding classes | Low | Responsive & cross-browser | `MainPage.astro:43` (`#ffffff` dots); `BaseLayout.astro:91-101`; `motion.css` hardcoded hex; `Projects.astro` (`pt-0 ... pt-4`) | Dot backdrop disappeared in light theme; redundant `pt-0`/`pt-4` classes. | Use `--dot-color` and `--secondary` CSS tokens and remove redundant `pt-0` (`BaseLayout` OS light default remains open). | S (<2h) | High | **RESOLVED** (`3ccd73b`, `bf87b0e`) |
| F-015 | Thin project case-study depth, missing repos, and simulated YOLO diff | Low | Content & UX | `profile.json:150-161,201-206,365-370,419-424`; `YoloDemo.tsx:68-98` | Recruiters cannot inspect code on 3 projects; YOLO slider uses CSS filter on same JPG. | Capture real raw vs YOLO inference frames and enrich case-study depth. | L (>1 day) | High | OPEN |
| F-016 | Dead code (`summaryText`, unused layout props, empty `ChatbotMount`) | Low | Code quality | `Hero.astro:15-17`; `BaseLayout.astro:5-17`; `ChatbotMount.astro` | Minor clutter. | Render `summaryText` or remove dead variable; document `ChatbotMount.astro`. | S (<2h) | High | OPEN |
| F-017 | Non-compositor `width` typing animation & permanent `will-change` | Info | Performance | `motion.css:100-108` (`width` keyframes); `motion.css:235` (permanent `will-change`) | Layout recalculation during typing and extra compositor layer memory. | Replace `width` with `clip-path`, scope `will-change` to `:hover`/`:focus-within`, remove `box-shadow` transition. | S (<2h) | Med | **RESOLVED** (`6f3bbc5`, `a5bc683`) |

---

## Top 10 Priorities (Ranked by Impact / Effort)

| Rank | Finding ID | Action | Impact | Effort |
| --- | --- | --- | --- | --- |
| 1 | F-002 | Remove unused `next`/`eslint-config-next` & patch `astro` to `^7.4.13` | Eliminates 1 Critical + multiple High/Moderate CVEs | S |
| 2 | F-001 | Fix `tests/test-content-parity.mjs` & fixture for 6+ dynamic projects | Restores green functional + parity test suite | S |
| 3 | F-004 | Fix `label-content-name-mismatch` on all 14 buttons/links | Achieves true WCAG 2.2 AA SC 2.5.3 compliance | S |
| 4 | F-009 | Remove duplicate `.scroll-reveal` observer & dead `src/js`/`theme.js` files | Eliminates redundant DOM work and script confusion | S |
| 5 | F-011 | Set `site` in `astro.config.mjs`, sync sitemap, fix Card 4 stack label | Prevents SEO/canonical drift and inaccurate portfolio text | S |
| 6 | F-005 | Fix skip link focus visibility, `inert` filtered cards, & touch target sizes | Closes remaining keyboard & mobile a11y gaps | M |
| 7 | F-003 | Delete `app/`, `components/`, `_legacy/`, duplicate root assets, & 9 dead deps | Simplifies repo structure to single Astro source of truth | M |
| 8 | F-006 | Configure Astro-aware ESLint + `@astrojs/check` + `package.json` scripts | Enables reliable automated lint & typecheck gates | M |
| 9 | F-007 | Consolidate `ProjectModal`, `ProjectFilter`, `About`/`Skills`/`Exp` onto `profile.ts` | Makes adding projects a 1-file data change | M |
| 10 | F-010 | Remove inline `onclick=` handlers & add CSP/HSTS/Permissions-Policy headers | Hardens production security headers on Vercel | M |

---

## Quick Wins (<= 2 Hours Each)

1. **F-002**: Uninstall unused `next`, `react`, `react-dom`, `framer-motion`, `lucide-react`, `react-simple-typewriter`, `eslint-config-next`, `@types/react*` and update `astro` to `^7.4.13`.
2. **F-001**: Update `scripts/generate-snapshot-fixture.mjs` and `tests/test-content-parity.mjs` to handle 6 projects dynamically from `src/data/profile.json`.
3. **F-004**: Align `aria-label` values on `Navbar.astro`, `Hero.astro`, `Contact.astro`, and `Projects.astro` to include their visible labels.
4. **F-009**: Delete duplicate `.scroll-reveal` observer in `public/js/main.js:150-172`, plus `src/js/*` and `public/js/theme.js`.
5. **F-011**: Add `site: 'https://myportfolio-zeta-peach-42.vercel.app'` to `astro.config.mjs`, delete stale root `robots.txt`/`sitemap.xml`, and fix Card 4's `"Next.js & Tailwind"` badge.
6. **F-013 / F-014 / F-016**: Localize `YoloDemo.tsx` and portrait `alt`, fix `MainPage.astro:43` light-mode dot color, remove redundant `pt-0` classes, and clean up `summaryText` in `Hero.astro`.

---

## Phased Remediation Roadmap

### Phase A — Stabilize (Security, Correctness, Green Gates)
| Step | Findings | Deliverable | Measurable Acceptance Criteria |
| --- | --- | --- | --- |
| A1 | F-002, F-003 | Remove dead Next.js/React/`_legacy/` code, duplicate root assets, and 9 unused dependencies; upgrade `astro` | `npm audit` reports `0` Critical and `0` High vulnerabilities in production/runtime deps; `npm run build` succeeds. |
| A2 | F-001, F-006 | Replace `eslint-config-next` with Astro + TS ESLint, install `@astrojs/check`, fix `any` in `profile.ts`, fix `test-content-parity.mjs` | `npm run lint`, `npm run typecheck` (`astro check && tsc --noEmit`), and `npm test` all exit `0`. |
| A3 | F-004, F-005 | Fix all 14 `label-content-name-mismatch` nodes, skip-link focus visibility, `inert` on filtered cards, and touch targets | Lighthouse Accessibility = `100` with `0` failing audits (including `label-content-name-mismatch` = `1`); all interactive targets `>= 44×44 px` (or `>= 24×24 px` WCAG 2.5.8). |
| A4 | F-010 | Refactor inline `onclick=` into `main.js` listeners and add CSP, HSTS, `Permissions-Policy` to `vercel.json` | Security header check returns valid `Content-Security-Policy`, `Strict-Transport-Security`, and `0` inline `onclick=` attributes in `dist/*.html`. |

### Phase B — Optimize (Single Source of Truth, Assets, CI/CD)
| Step | Findings | Deliverable | Measurable Acceptance Criteria |
| --- | --- | --- | --- |
| B1 | F-007, F-009 | Refactor `ProjectModal`, `ProjectFilter`, `About`, `Experience`, `Skills`, `Projects` to read exclusively from `profile.ts`; enforce `public` flag; unify `motion.js` | Adding a 7th project in `profile.json` renders card, filter count, and modal automatically without editing `.astro`/`.tsx` components. |
| B2 | F-008, F-017 | Remove unused `public/images/*` variants & `public/css/style.css`; optimize fallback JPGs (`<150 KB`) or migrate to `astro:assets`; optimize `motion.css` | `dist/` total size drops by `>= 60%`; Mobile LCP `<= 2.0s`, Desktop LCP `<= 0.8s`, CLS `<= 0.01`, Lighthouse Performance `>= 98`. |
| B3 | F-011, F-012 | Add `site` to `astro.config.mjs` + `@astrojs/sitemap`, expand `README.md`, add GitHub Actions CI workflow | Every PR runs `lint`, `typecheck`, `build`, and functional/parity tests automatically; `sitemap-index.xml` generated on build. |

### Phase C — Upgrade & Features (Portfolio Impact & Planned Extensions)
| Step | Findings | Deliverable | Measurable Acceptance Criteria |
| --- | --- | --- | --- |
| C1 | F-013, F-014 | Full bilingual parity across `YoloDemo`, ARIA labels, and light/dark OS preference support | Zero English-only UI/alt/ARIA strings on `/`, and zero Indonesian strings on `/en` verified by automated i18n check. |
| C2 | F-015 | Authentic YOLO raw-vs-detected comparison frames + dedicated `/projects/[slug]` case-study routes | All flagship projects present Problem -> Approach -> Result metrics; zero dead `TODO` GitHub links shown publicly. |
| C3 | Planned (`api/README.md`) | Serverless AI portfolio chatbot via `/api/chat` mounting into `ChatbotMount.astro` with rate limiting & input validation | Chatbot endpoint handles valid queries `< 3s`, enforces rate limit + origin/input schema checks, and adds `0 KB` to initial hero critical path (`client:idle`/lazy trigger). |

---

## What Was NOT Verified

1. **Live Vercel deployment behavior**: Live HTTP response headers, CDN cache behavior, and SSL/HSTS configuration at `https://myportfolio-zeta-peach-42.vercel.app` were not fetched (offline/local audit only).
2. **External URLs**: Outbound project demo and GitHub links (`sibarista-disbudpar.vercel.app`, `tugas-proyek-kriptografi-klasik.vercel.app`, `expense-tracker-six-sigma-30.vercel.app`, `partsbin-web.vercel.app`, `oplan-*.vercel.app`, GitHub links) were not queried via HTTP during this audit.
3. **`CV.pdf` binary contents**: File existence and byte size (`95,522 B`) were verified, but internal PDF text/links were not parsed.
4. **`astro check`**: Not executed because `@astrojs/check` is not installed in `node_modules`.
5. **Real-device / non-Chromium browsers**: Tests and Lighthouse ran in local headless Google Chrome (`puppeteer-core`); Safari/WebKit, Firefox, and physical mobile devices were not tested. CSS `@starting-style` + `allow-discrete`, `animation-timeline: scroll()/view()`, and `document.startViewTransition` are `[UNVERIFIED on Safari/Firefox]`.

---

## Assumptions, Unknowns & Inferences Registry

| Label | Item | Basis / Note |
| --- | --- | --- |
| `[ASSUMPTION]` | Primary goal of the site is showcasing AI/software engineering projects for internship/job applications and collaborations | Inferred from `availability.open_to_work: true`, `CV.pdf` CTA, and contact section (`src/data/profile.json`, `Hero.astro`, `Contact.astro`). |
| `[ASSUMPTION]` | Target audience consists of recruiters, engineering managers, and collaborators (Indonesian & English) | Inferred from bilingual `id`/`en` structure and technical framing. |
| `[ASSUMPTION]` | Document output language is English | Prompt template left `[English \| Indonesian]` unselected; prompt and repo docs (`README.md`, `api/README.md`) are in English. |
| `[INFERRED]` | Repository migrated sequentially: Next.js 16 -> static HTML (`_legacy/`) -> Astro 7 + Preact (`src/`) -> bilingual ID/EN (`feat/i18n-id-en`) | Inferred from `git log`, `app/`/`components/`, `_legacy/`, and `src/` artifacts. |
| `[INFERRED]` | `api/README.md` + `ChatbotMount.astro` represent a planned Vercel serverless chatbot upgrade | Explicitly documented as reserved placeholder in `api/README.md:1-4` and `src/components/ChatbotMount.astro:3-4`. |
| `[UNKNOWN]` | Production Vercel environment variables, analytics dashboard settings, or branch protection rules on GitHub | Not stored in repository (`.env*` absent, no `.github/workflows/`). |
| `[UNKNOWN]` | Current HTTP availability of external demo links and whether private repos (`Sibarista-Disbudpar`, `expense-tracker`) are intended to be open-sourced | Not queried externally; `profile.json:203-204,367-368` notes them as private/TODO. |
