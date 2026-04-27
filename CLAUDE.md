# abhijitramesh.me

Hand-written static personal site. No framework. No bundler. No runtime npm.

## Hard constraints (DO NOT VIOLATE)

- Pure HTML, CSS, JS. No React, Next, Tailwind, MDX.
- Zero runtime npm dependencies.
- All fonts self-hosted in `fonts/`. No CDN font links.
- No analytics, no trackers, no third-party scripts.
- No theme toggle UI — light/dark via prefers-color-scheme only.
- Per-page CSS files; cascade layers (`@layer reset, tokens, base, components, pages`).
- No emoji in source.
- No comments unless they explain a non-obvious why.

## Design system

`styles/tokens.css` is the source of truth — read it, don't re-derive values.
Fonts: Inter Variable + JetBrains Mono Variable, both in `fonts/`.
Color: OKLCH neutrals + one cyan accent (`--color-accent`).
Type scale: 12, 14, 16, 18, 22, 28, 36, 64.
Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96.
Layout: 12-col CSS grid, asymmetric (generous left), 640px content column.
Motion: View Transitions API + WebGPU hero only. Respect `prefers-reduced-motion`.

## File layout

```
abhijitramesh.me/
  CLAUDE.md
  README.md
  .gitignore
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
    tokens.css
    base.css
    layout.css
    components.css
    landing.css
    work.css
    timeline.css
    labs.css
    colophon.css
  js/
    hero-webgpu.js
    view-transitions.js
    redirects.js
  wgsl/
    matmul-tile.wgsl
  fonts/
    InterVariable.woff2
    InterVariable-Italic.woff2
    JetBrainsMono-Variable.woff2
  public/
    favicon.svg
    og-image.png
    hero-fallback.png
  content/
    profile/bio.md
    profile/skills.md
    projects/<slug>.md
    timeline/<year>.md
    artifacts/awards.md
    artifacts/teaching.md
    artifacts/community.md
    roles/<slug>.md
  scripts/
    build.mjs
    snapshot-kb.mjs
  .github/
    workflows/
      pages.yml
```

## Content pipeline

KB lives at `~/.lovelace/kb/` (private, never committed).
`scripts/snapshot-kb.mjs` copies a curated subset into `content/`.
`scripts/build.mjs` reads `content/` markdown and emits `work/*.html`,
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

`/labs/index.html` is an iframe to
`https://abhijitramesh-webgpu-bench.static.hf.space` — do not try to
inline the bench tool. It lives on HF Spaces by design.

## Deploy

GitHub Pages from `main` via `.github/workflows/pages.yml`.
Custom domain `CNAME` added by the user when ready.
Old route redirects in `404.html` (client-side; GH Pages limitation).

## Conventions

- HTML: semantic. `<article>`, `<section>`, `<nav>`, `<aside>`. No div soup.
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

Phase 0 in progress. Scaffolding tokens, fonts, landing, colophon, 404,
writing placeholder. Old site preserved on `archive/legacy-next` and
sibling archive branches.
