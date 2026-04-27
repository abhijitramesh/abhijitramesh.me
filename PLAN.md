# Rewrite plan — abhijitramesh.me

> **For the executing agent:** this file is an executable plan. Read it top-to-bottom before doing anything. Every decision is already made; do not re-ask the user for things this file specifies. The user's role during execution is to confirm destructive steps and review visual output, not to redesign.
>
> **Preserve this file through the Phase 0 wipe.** Delete it only at the very end of Phase 4 with the commit message `chore: drop PLAN.md, build complete`.

---

## TL;DR

Nuke the existing Next.js + MDX + Tailwind + Firebase site. Replace it with a hand-authored static site (HTML + CSS + vanilla JS) that sources content from the user's Lovelace knowledge base at `~/.lovelace/kb/`, includes a small WebGPU compute demo on the landing page, and embeds an existing benchmarking tool on `/labs`. Deploy on GitHub Pages from `main`. The build is a deliberate statement: modern personal sites do not require frameworks.

---

## Context

- **Owner:** Abhijit Ramesh (UCSC MS CS, llama.cpp WebGPU contributor, ex healthcare-AI lead).
- **Audience:** technical recruiters and engineering peers. The site has to read as serious systems work in <5 seconds without screaming.
- **Repo:** `git@github.com:abhijitramesh/abhijitramesh.me.git`.
- **Local path:** `/Users/abhijitramesh/Development/Fun/abhijitramesh.me/`.
- **KB path (private, never committed):** `~/.lovelace/kb/`.
- **Old site stack** (being replaced): Next 15, MDX, Tailwind 2, Firebase, Fathom, SWR, react-tweet, KaTeX, Spotify "now playing", view counter, newsletter, snippets, blog. Everything goes.
- **Domain:** moving to GitHub Pages. The user will add a custom domain later via `CNAME`.

The colophon page carries the manifesto: *Hand-written HTML/CSS/JS. No framework, no bundler, no runtime npm. Built collaboratively with Claude Code.*

---

## Hard constraints (DO NOT VIOLATE)

1. Pure HTML, CSS, JS. No React, no Next, no Vue, no Svelte, no Tailwind, no MDX.
2. No bundler at runtime. `esbuild` is the only build-time tool allowed, and only as a one-shot CLI invocation. No dev server. No watch mode.
3. **Zero runtime npm dependencies.** No `node_modules` in the deployed output.
4. All fonts self-hosted in `fonts/`. No `<link rel="stylesheet" href="https://fonts.googleapis.com/...">`. No CDN font links of any kind.
5. No analytics, no trackers, no third-party scripts. (No Fathom, no Plausible, no GA, none of it.)
6. Deployable as static files from `main` to GitHub Pages with no server-side anything.
7. No theme toggle UI. Light + dark via `prefers-color-scheme` only.
8. No emoji in source files. (User preference, repo convention.)
9. No comments in code unless they explain a non-obvious *why*.
10. Per-page CSS files; no monolithic stylesheet. CSS uses `@layer reset, tokens, base, components, pages` cascade layers.

If you find yourself wanting to add a "small dependency just for X," stop. Write the 30 lines of vanilla JS instead.

---

## Locked-in decisions (do not re-ask)

| Decision | Value |
|---|---|
| Fonts | Inter Variable + JetBrains Mono Variable (both self-hosted woff2) |
| Color modes | Light + dark via `prefers-color-scheme`; no toggle |
| Color philosophy | OKLCH neutrals, one cyan accent |
| Type scale | 12, 14, 16, 18, 22, 28, 36, 64 px |
| Spacing scale | 4, 8, 12, 16, 24, 32, 48, 64, 96 px |
| Layout | 12-col CSS grid, asymmetric (generous left margin), content column ~640px |
| Motion | View Transitions API for route changes + WebGPU hero only; respect `prefers-reduced-motion` |
| Hosting | GitHub Pages from `main` |
| Default branch after rewrite | `main` (currently `master`) |
| Build pipeline | `node scripts/build.mjs`, run manually, output committed |
| Content source | Curated subset of `~/.lovelace/kb/`, snapshotted into `content/` |
| Labs | `<iframe>` to `https://abhijitramesh-webgpu-bench.static.hf.space` |
| Writing section | Empty placeholder ("coming soon") |
| Old content | Delete entirely; archive branch only for git history |

---

## Directory layout (target)

```
abhijitramesh.me/
  CLAUDE.md                        # written first, durable handoff
  README.md                        # rewritten, points at CLAUDE.md
  PLAN.md                          # this file, deleted at end of Phase 4
  .gitignore                       # rewritten (clean)
  CNAME                            # added later by user
  index.html                       # landing
  colophon.html
  404.html                         # client-side redirects for old routes
  work/index.html                  # generated
  work/<slug>.html                 # generated, one per project
  timeline/index.html              # generated
  writing/index.html               # static placeholder
  labs/index.html                  # iframe page
  styles/
    tokens.css                     # design system source of truth
    base.css                       # reset + element defaults
    layout.css                     # grid, container queries
    components.css                 # project card, metric badge, year marker
    landing.css                    # page-specific
    work.css
    timeline.css
    labs.css
    colophon.css
  js/
    hero-webgpu.js                 # landing canvas
    view-transitions.js            # opt-in cross-document VT
    redirects.js                   # 404.html client-side router
  wgsl/
    matmul-tile.wgsl
  fonts/
    InterVariable.woff2
    InterVariable-Italic.woff2
    JetBrainsMono-Variable.woff2
  public/                          # static assets (favicon, og-image, hero-fallback.png)
    favicon.svg
    og-image.png
    hero-fallback.png              # static heatmap PNG for non-WebGPU browsers
  content/                         # curated KB snapshot (committed)
    profile/bio.md
    profile/skills.md
    projects/<slug>.md
    timeline/<year>.md
    artifacts/awards.md
    artifacts/teaching.md
    artifacts/community.md
    roles/<slug>.md
  scripts/
    build.mjs                      # KB → HTML
    snapshot-kb.mjs                # copy curated KB subset into content/
  .github/
    workflows/
      pages.yml                    # GH Pages deploy
```

---

## Design system spec (`styles/tokens.css`)

These are the values to write. Do not derive anything different.

```css
@layer tokens {
  :root {
    /* Color — light mode defaults */
    --color-bg: oklch(98% 0.005 80);
    --color-bg-elevated: oklch(100% 0 0);
    --color-fg: oklch(20% 0.01 80);
    --color-fg-muted: oklch(45% 0.015 80);
    --color-fg-subtle: oklch(60% 0.015 80);
    --color-border: oklch(88% 0.005 80);
    --color-border-subtle: oklch(93% 0.005 80);
    --color-accent: oklch(60% 0.14 220);
    --color-accent-hover: oklch(52% 0.16 220);

    /* Type */
    --font-sans: "Inter Variable", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    --font-mono: "JetBrains Mono Variable", ui-monospace, SFMono-Regular, monospace;

    /* Type scale */
    --text-xs: 0.75rem;     /* 12 */
    --text-sm: 0.875rem;    /* 14 */
    --text-base: 1rem;      /* 16 */
    --text-md: 1.125rem;    /* 18 */
    --text-lg: 1.375rem;    /* 22 */
    --text-xl: 1.75rem;     /* 28 */
    --text-2xl: 2.25rem;    /* 36 */
    --text-display: 4rem;   /* 64 */

    /* Line heights */
    --leading-tight: 1.2;
    --leading-snug: 1.4;
    --leading-normal: 1.6;
    --leading-relaxed: 1.75;

    /* Spacing */
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --space-8: 2rem;
    --space-12: 3rem;
    --space-16: 4rem;
    --space-24: 6rem;

    /* Layout */
    --content-width: 640px;
    --gutter: clamp(1rem, 4vw, 4rem);
    --gutter-left: clamp(1rem, 8vw, 8rem);

    /* Motion */
    --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
    --duration-fast: 120ms;
    --duration-base: 220ms;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --color-bg: oklch(15% 0.005 80);
      --color-bg-elevated: oklch(19% 0.005 80);
      --color-fg: oklch(92% 0.01 80);
      --color-fg-muted: oklch(70% 0.015 80);
      --color-fg-subtle: oklch(55% 0.015 80);
      --color-border: oklch(28% 0.005 80);
      --color-border-subtle: oklch(22% 0.005 80);
      --color-accent: oklch(72% 0.14 220);
      --color-accent-hover: oklch(80% 0.14 220);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :root {
      --duration-fast: 0ms;
      --duration-base: 0ms;
    }
  }
}
```

---

## KB sources — curated subset

Snapshot only these files into `content/` via `scripts/snapshot-kb.mjs`. Do not blanket-copy the KB.

**Profile** (all): `profile/bio.md`, `profile/skills.md`, `profile/education.md`.

**Projects (10 cards):**
- `llama-cpp-webgpu-backend.md` (hero work)
- `webgpu-bench.md`
- `dawn-metal-shader-bug.md`
- `eusml-pancreas-segmentation.md`
- `eusml-labeller.md`
- `semler-qfhd-ensemble-framework.md`
- `gsoc-2020-mifos-mentor.md`
- `gsoc-2019-mifos-mobile-cn.md`
- `galileo-hackathon-gnss-2018.md`
- `vr-heart-segmentation.md`

If any of those slugs do not exist when the snapshot runs, log a warning and skip — don't fail the build. The user can adjust the list later.

**Timeline:** all `timeline/<year>.md` files that exist (2018–2026).

**Artifacts:** `artifacts/awards.md`, `artifacts/teaching.md`, `artifacts/community.md`.

**Roles:** all `roles/*.md` files.

**Privacy rule (matters):** if a project card has `visibility: private` in its frontmatter, paraphrase proper nouns (company/product names) into generic descriptors when generating HTML, the same way the Lovelace writer agent does. The card's `visibility` field is the source of truth — do not show private cards verbatim. If unsure, treat as private.

---

## Phase 0 — kill the old + scaffold

**Goal:** by end of phase, `main` is a clean tree with bones up: tokens, base CSS, fonts, landing skeleton, colophon, CLAUDE.md, working dev preview.

### 0.1 — Archive + nuke (destructive, confirm before each `git push -f`)

Current state to confirm before starting (run these and verify):
```bash
git -C /Users/abhijitramesh/Development/Fun/abhijitramesh.me status         # must be clean
git -C /Users/abhijitramesh/Development/Fun/abhijitramesh.me branch -a      # note: currently on master, remote also has main, notes, spotify-now-playing, stork-search, top-artists
git -C /Users/abhijitramesh/Development/Fun/abhijitramesh.me log origin/main --oneline -5 2>/dev/null || echo "no origin/main"
```

**The user has pre-authorized the `git push -f` to `main` and the rename master→main.** Do not re-ask. But still run the archive push first and verify it succeeded before any destructive op.

Sequence:

```bash
# 1. Archive current master to a remote branch that will not be touched.
git push origin master:archive/legacy-next

# 2. Also archive any other remote branches that have unique commits (notes, spotify-now-playing, stork-search, top-artists, main if it's distinct).
#    For each: `git push origin <branch>:archive/<branch>` (only if it exists locally or fetch first).
#    Run: git fetch origin && git for-each-ref refs/remotes/origin --format='%(refname:short)'
#    Skip HEAD and any branch already named archive/*.

# 3. Locally: start an orphan branch with no history.
git checkout --orphan rewrite
git rm -rf .   # clears the index; working tree files remain untracked

# 4. Delete every working-tree file EXCEPT PLAN.md.
#    Use: ls -A1 | grep -vE '^(\.git|PLAN\.md)$' | xargs rm -rf
#    (PLAN.md must survive; .git must survive.)

# 5. Verify only .git/ and PLAN.md remain.
ls -A   # should show only .git and PLAN.md

# 6. Begin building Phase 0 files (see 0.2 below). Stage and commit them.
git add -A
git commit -m "chore: full site rewrite — scaffold

Replace Next.js + MDX + Tailwind stack with hand-authored
HTML/CSS/JS. Old site preserved on archive/legacy-next."

# 7. Rename branch to main.
git branch -M main

# 8. Force-push (user pre-authorized).
git push -f origin main

# 9. On GitHub: set default branch to main.
gh repo edit abhijitramesh/abhijitramesh.me --default-branch main

# 10. Delete the old master remote head.
git push origin --delete master
```

If `gh` is not authenticated, surface the error and stop — the user will run it manually.

### 0.2 — Scaffold the bones

Write these files in this order:

1. **`CLAUDE.md`** — durable handoff (see "CLAUDE.md spec" section below). This is the most important file in the repo for future sessions.
2. **`README.md`** — single short paragraph + pointer to CLAUDE.md.
3. **`.gitignore`** — `.DS_Store`, `node_modules/`, `*.log`, `.vscode/`, `.idea/`. Nothing else.
4. **`fonts/`** — fetch with `curl`:
   - `https://rsms.me/inter/font-files/InterVariable.woff2` → `fonts/InterVariable.woff2`
   - `https://rsms.me/inter/font-files/InterVariable-Italic.woff2` → `fonts/InterVariable-Italic.woff2`
   - `https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/variable/JetBrainsMono%5Bwght%5D.woff2` → `fonts/JetBrainsMono-Variable.woff2`
   - Verify file sizes are >50KB each (sanity check — Inter is ~340KB, JetBrains ~210KB).
5. **`styles/tokens.css`** — exactly as specified above.
6. **`styles/base.css`** — minimal reset + `@font-face` declarations + element defaults (body, headings, links, code).
7. **`styles/layout.css`** — grid + container queries.
8. **`index.html`** — landing skeleton with hero placeholder, bio one-liner from `~/.lovelace/kb/profile/bio.md`, three featured project links (manually pinned: llama-cpp-webgpu-backend, webgpu-bench, eusml-pancreas-segmentation), nav, footer with colophon link.
9. **`colophon.html`** — full manifesto + tech list + the "made with agents, not frameworks" line.
10. **`404.html`** — placeholder; redirects added in Phase 3.
11. **`writing/index.html`** — single-line "writing — coming soon" page (so the nav link doesn't 404).

### 0.3 — Phase 0 verification

- `python3 -m http.server 8000` from repo root serves the site.
- `index.html`, `colophon.html`, `writing/index.html` all load.
- Light/dark switching works via system preference.
- Fonts load (no FOIT, woff2 served with correct MIME).
- No console errors.
- Lighthouse mobile score ≥ 95 on all four metrics. (Trivial at this stage; flag if not.)
- Show the user a screenshot of the landing in light + dark before moving to Phase 1.

Commit at end of phase: `feat: phase 0 scaffold — tokens, fonts, landing, colophon`.

---

## Phase 1 — content pipeline + work + timeline

**Goal:** by end of phase, every project card and timeline year exists as a rendered HTML page, all generated from KB markdown.

### 1.1 — Snapshot script (`scripts/snapshot-kb.mjs`)

Reads from `~/.lovelace/kb/`, writes to `content/`. Curated list above. Pure Node, no deps. ~80 lines. Run via `node scripts/snapshot-kb.mjs`.

### 1.2 — Build script (`scripts/build.mjs`)

Reads `content/`, writes:
- `work/index.html` — list of projects with metric badges
- `work/<slug>.html` — one per project; renders frontmatter + body
- `timeline/index.html` — all years stacked, scroll-linked year markers in the gutter

Markdown → HTML: do not pull in a markdown library. Hand-roll a minimal renderer (~120 lines) that handles: headings, paragraphs, bold/italic, code spans, code blocks, links, lists, blockquotes. Frontmatter parser: ~20 lines, regex-based. **This is on-purpose** — the constraint is no runtime deps, and the build deps should be near-zero too. If markdown rendering becomes painful, allow `marked` as a build-time dep (not runtime) but only after attempting the hand-roll.

Privacy paraphrasing: if frontmatter `visibility: private`, replace company/product proper nouns with generic descriptors. The Lovelace KB cards already encode this in `user_memory` — if a card is private, the writer agent's behavior is to anonymize. Match that: replace specific names with phrases like "a healthcare AI startup" or "an early-stage fintech". When in doubt, anonymize more.

### 1.3 — Pages and components

- **`work/index.html`:** project cards (slug, title, dates, role, 1-line summary, metric badges). Filter UI? **No.** A list is enough.
- **`work/<slug>.html`:** title, meta sidebar (dates, role, stack, tags), prose body. If `visibility: public` and `repo` is set, link to GitHub.
- **`timeline/index.html`:** big year markers in the left gutter (sticky), prose in the column. Scroll-linked highlight via Intersection Observer (~30 lines). On reduced motion, no animation, just static markers.

### 1.4 — Phase 1 verification

- `node scripts/snapshot-kb.mjs && node scripts/build.mjs` runs cleanly.
- All 10 project pages exist and render.
- All timeline years exist and render.
- No private content leaks. (Manual check: read every generated `work/<slug>.html` and verify private cards are anonymized.)
- Show the user the work index + 2 project pages + timeline before Phase 2.

Commit: `feat: phase 1 — content pipeline + work + timeline pages`.

---

## Phase 2 — landing hero (WebGPU)

**Goal:** the landing has a small, tasteful WebGPU compute demo running real WGSL on the visitor's GPU.

### 2.1 — Spec

- 320×120 canvas inline near the byline on the landing.
- On load: compile `wgsl/matmul-tile.wgsl` (a 256×256 tile matmul kernel), execute on randomized data, render output as an OKLCH heatmap to the canvas.
- Caption underneath:
  > Compiled on your GPU in `<X>`ms — `matmul-tile.wgsl` · 256×256 · `<adapter info>`
- "View shader" link → expands an inline `<details>` with the WGSL source highlighted (use a tiny manual highlighter, not Prism).
- One-time fade-in. No autoplay loop.

### 2.2 — Fallback

- If `navigator.gpu` is undefined: render `public/hero-fallback.png` (a static screenshot of the heatmap, generated once during Phase 2 dev and committed).
- Caption changes to: `static fallback — your browser does not expose WebGPU`.
- Same dimensions, no layout shift.

### 2.3 — Performance budget

- `js/hero-webgpu.js` ≤ 8KB raw.
- `wgsl/matmul-tile.wgsl` ≤ 4KB.
- Hero compile + execute total ≤ 50ms on a 2020 MBP M1.
- No JS executes before the canvas is in viewport (use `IntersectionObserver`, defer entire init).
- No layout shift caused by the canvas (reserve box via CSS).

### 2.4 — Phase 2 verification

- Works in Chrome and Edge on macOS.
- Falls back cleanly in Firefox (which is still partial WebGPU as of writing) and Safari iOS.
- Console clean, no warnings.
- `prefers-reduced-motion: reduce` skips the fade.
- Show the user the landing in 4 browsers before Phase 3.

Commit: `feat: phase 2 — webgpu hero + static fallback`.

---

## Phase 3 — labs + redirects + GH Pages workflow

### 3.1 — `/labs`

- Brief intro paragraph: "Live WebGPU compute benchmark — measures matmul throughput across tile sizes and workgroup configurations on your GPU. Source on GitHub."
- Full-width responsive iframe to `https://abhijitramesh-webgpu-bench.static.hf.space`.
- `loading="lazy"`, `referrerpolicy="no-referrer"`, sandbox attributes considered (test that the bench tool still works with sandbox first; if not, drop sandbox).
- Below iframe: a 1-line note + GitHub link. No more.

### 3.2 — `/writing`

Already scaffolded in Phase 0. Confirm it's a single-line "coming soon" page that doesn't 404.

### 3.3 — Old route redirects (`404.html` + `js/redirects.js`)

GitHub Pages doesn't support server redirects. Use `404.html` to JS-redirect known old paths home.

Mapping (all → `/`):
- `/blog` and `/blog/*`
- `/snippets` and `/snippets/*`
- `/dashboard`
- `/uses`
- `/newsletter` and `/newsletter/*`
- `/about` (or → `/colophon`, your call — default to `/`)
- `/api/*` (these were Next.js API routes; they 404 forever now)

`404.html` is also the page shown for genuine 404s — design it to look like a page, not a redirect chute. The redirect logic uses `location.pathname` matching and triggers only for paths in the map.

### 3.4 — `.github/workflows/pages.yml`

Standard GH Pages deploy from `main`:
- Trigger: push to main.
- Permissions: `pages: write`, `id-token: write`.
- Action: `actions/checkout@v4` → `actions/upload-pages-artifact@v3` (path: `.`) → `actions/deploy-pages@v4`.
- No build step in CI. The build was already run locally and output committed.

After first push, ensure GH Pages is configured to deploy from "GitHub Actions" (not "Branch") — this may require user action in the repo settings if it isn't already set.

### 3.5 — Phase 3 verification

- Visit `https://abhijitramesh.github.io/abhijitramesh.me/` (or the configured Pages URL) and confirm:
  - All pages load.
  - Old routes (`/blog`, `/snippets/foo`, `/uses`) redirect home.
  - WebGPU hero works.
  - Labs iframe loads the bench tool.
  - View Transitions work between pages on Chrome.

Commit: `feat: phase 3 — labs, redirects, GH Pages deploy`.

---

## Phase 4 — recruiter pass

**Goal:** the slow read. Cut anything gimmicky. Polish anything that grates.

Walk through each page slowly. For every element on every page, ask:
- Does this serve a recruiter who's giving the page 30 seconds?
- Does this serve a peer engineer who's reading carefully?
- If neither: cut it.

Specific checks:
- Numbers: every metric badge has a real source. No vanity numbers.
- Links: every external link opens in the same tab unless it's a different mode (iframe, GitHub).
- Mobile: thumb-reachable nav, no horizontal scroll, font sizes legible at arm's length.
- Print stylesheet: `@media print` strips nav/footer, keeps content. (Recruiters print resumes; if they print this they should get clean output.)
- `og:image` + Twitter card meta on every page.
- Favicon (svg + ico fallback).
- Sitemap.xml, robots.txt.

When done, delete this file:
```bash
rm PLAN.md
git add -A
git commit -m "chore: drop PLAN.md, build complete"
git push
```

---

## CLAUDE.md spec

Write `CLAUDE.md` at the start of Phase 0. Contents:

```markdown
# abhijitramesh.me

Hand-written static personal site. No framework. No bundler. No runtime npm.

## Hard constraints (DO NOT VIOLATE)

- Pure HTML, CSS, JS. No React, Next, Tailwind, MDX.
- Zero runtime npm dependencies.
- All fonts self-hosted in `fonts/`. No CDN font links.
- No analytics, no trackers, no third-party scripts.
- No theme toggle UI — light/dark via prefers-color-scheme only.
- Per-page CSS files; cascade layers (@layer reset, tokens, base, components, pages).
- No emoji in source.
- No comments unless they explain a non-obvious why.

## Design system

`styles/tokens.css` is the source of truth — read it, don't re-derive values.
Fonts: Inter Variable + JetBrains Mono Variable, both in `fonts/`.
Color: OKLCH neutrals + one cyan accent (--color-accent).
Type scale: 12, 14, 16, 18, 22, 28, 36, 64.
Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96.
Layout: 12-col CSS grid, asymmetric (generous left), 640px content column.
Motion: View Transitions API + WebGPU hero only. Respect prefers-reduced-motion.

## File layout

[paste the directory tree from PLAN.md]

## Content pipeline

KB lives at ~/.lovelace/kb/ (private, never committed).
`scripts/snapshot-kb.mjs` copies a curated subset into `content/`.
`scripts/build.mjs` reads `content/` markdown → emits `work/*.html`,
`timeline/index.html`. Run manually after KB updates:

    node scripts/snapshot-kb.mjs && node scripts/build.mjs

Build output IS committed. CI does not build. The site is the working tree.

Privacy: project cards with `visibility: private` get proper-noun
paraphrasing in generated HTML. When unsure, anonymize more.

## WebGPU hero

`js/hero-webgpu.js` + `wgsl/matmul-tile.wgsl`. Real WGSL matmul on a
320x120 canvas on the landing. Falls back to `public/hero-fallback.png`
when WebGPU is unavailable. Performance budget: <50ms compile, <12KB
combined JS+WGSL.

## Labs

`/labs/index.html` is just an iframe to
https://abhijitramesh-webgpu-bench.static.hf.space — do not try to
inline the bench tool. It lives on HF Spaces by design.

## Deploy

GitHub Pages from `main` via .github/workflows/pages.yml.
Custom domain CNAME added by the user when ready.
Old route redirects in 404.html (client-side; GH Pages limitation).

## Conventions

- HTML: semantic. <article>, <section>, <nav>, <aside>. No div soup.
- CSS: cascade layers. No utility classes. BEM-ish naming where needed.
- JS: ES modules, no bundling. One module per concern. No classes
  unless they pay rent.
- Filenames: kebab-case.

## What NOT to add

- "Now playing", view counters, newsletter, theme toggle.
- Tailwind, CSS-in-JS, PostCSS plugins.
- Any third-party React component library.
- Markdown rendering at runtime.
- Service worker, PWA manifest (unless explicitly requested).

## Current state

[updated at end of every phase — what's done, what's next, known gaps]
```

Update the "Current state" section at the end of every phase. That section is the heartbeat.

---

## What NOT to do (drift guards)

- Do not run `npm install` for runtime deps. Build-time tools (Node, esbuild as a binary) are fine.
- Do not introduce a CSS preprocessor (Sass, Less, PostCSS pipeline). The tokens are CSS variables; that's enough.
- Do not "componentize" with template literals or tagged-template HTML libs. Author HTML.
- Do not add a JS framework "just for routing" — there's no routing. Multi-page app with browser navigation is the design.
- Do not pull in markdown libraries at runtime. Pre-render at build only.
- Do not add Prism / highlight.js. The one place we need code highlighting (the WGSL source on hero) is small enough to do with a hand-rolled tokenizer.
- Do not add icon libraries. Use inline SVG for the few icons needed.
- Do not add `<link rel="preload">` for fonts unless measurable LCP regression demands it. `font-display: swap` is the default.
- Do not commit anything from `~/.lovelace/kb/raw/` — that contains private repo dumps. The `content/` snapshot only includes the curated `projects/`, `timeline/`, `profile/`, `artifacts/`, `roles/` subset.

---

## Old route redirect map (paste into `js/redirects.js`)

```js
const REDIRECTS = [
  [/^\/blog(\/.*)?$/, "/"],
  [/^\/snippets(\/.*)?$/, "/"],
  [/^\/dashboard\/?$/, "/"],
  [/^\/uses\/?$/, "/"],
  [/^\/newsletter(\/.*)?$/, "/"],
  [/^\/about\/?$/, "/"],
  [/^\/api(\/.*)?$/, "/"],
];

const path = location.pathname;
for (const [pattern, dest] of REDIRECTS) {
  if (pattern.test(path)) {
    location.replace(dest);
    break;
  }
}
```

---

## Verification at the very end

Before deleting PLAN.md:
1. Open the deployed site fresh in a private window. Read every page top-to-bottom.
2. View page source on the landing. Confirm: no script tags pointing outside same-origin, no `<link>` to external CDNs, no analytics.
3. Run Lighthouse on landing + work index + a project page. All four metrics ≥ 95 on mobile.
4. Search the repo for forbidden strings: `tailwind`, `next`, `react`, `mdx`, `firebase`, `fathom`. All hits should be in `archive/legacy-next` only — confirm via `git grep -i <term>` on `main`.
5. `wc -l` the JS files. Combined site JS (excluding generated content) should be under 1000 lines.
6. Show the user the deployed site. Get explicit "ship it" before deleting PLAN.md.

---

*End of plan.*
