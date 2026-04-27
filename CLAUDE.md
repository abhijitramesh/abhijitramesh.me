# abhijitramesh.me

Hand-written static personal site. No framework. No bundler. No runtime npm. No KB pipeline. Every page is authored directly.

## Hard constraints (DO NOT VIOLATE)

- Pure HTML, CSS, JS. No React, Next, Tailwind, MDX.
- Zero runtime npm dependencies.
- All fonts self-hosted in `fonts/`. No CDN font links.
- No analytics, no trackers, no third-party scripts.
- No theme toggle UI — light/dark via prefers-color-scheme only.
- Per-page CSS files; cascade layers (`@layer reset, tokens, base, components, pages`).
- No emoji in source.
- No comments unless they explain a non-obvious why.
- All asset paths are page-depth-relative so the site works under both the GH Pages project URL and a custom domain root.

## Design system

`styles/tokens.css` is the source of truth — read it, don't re-derive values.
Fonts: Inter Variable + JetBrains Mono Variable, both in `fonts/`.
Color: OKLCH neutrals + one cyan accent (`--color-accent`).
Type scale: 12, 14, 16, 18, 22, 28, 36, 64.
Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96.
Layout: CSS grid, symmetric centered content (640px column), with optional right-gutter aside (`.aside-right`) used on /work/ for the sticky chapter rail.

## File layout

```
abhijitramesh.me/
  CLAUDE.md
  README.md
  CNAME                            # binds GH Pages to abhijitramesh.me
  index.html                       # landing — narrative arc
  colophon.html
  404.html                         # inline redirect for old Next.js routes
  work/index.html                  # four chapters: UCSC, ThetaTech, TexNano, OSS
  writing/index.html               # placeholder
  labs/index.html                  # iframe to webgpu-bench HF Space
  styles/
    tokens.css
    base.css
    layout.css
    components.css
    landing.css
    work.css
    labs.css
    colophon.css
  fonts/
    InterVariable.woff2
    InterVariable-Italic.woff2
    JetBrainsMono-Variable.woff2
  public/
    favicon.svg
    og-image.png
  robots.txt
  sitemap.xml
  .github/
    workflows/
      pages.yml
```

## Editing content

All content is hand-authored — `index.html` for the arc, `work/index.html` for
the four chapters. Update the prose directly. There is no build step. Do not
read from `~/.lovelace/kb/` to populate the site; it was a one-time reference,
not a runtime source.

If a fact about an employer or project changes, edit the relevant `<article
class="org">` block in `work/index.html`. The four chapters (in display order)
are UCSC CHPL, Theta Tech AI, TexNano, and the open-source thread.

## Labs

`/labs/index.html` is an iframe to
`https://abhijitramesh-webgpu-bench.static.hf.space` — do not try to
inline the bench tool. It lives on HF Spaces by design.

## Deploy

GitHub Pages from `main` via `.github/workflows/pages.yml`. CI does not
build — the working tree is the site. `CNAME` binds the deployment to
`abhijitramesh.me`. Old Next.js route redirects (`/blog`, `/snippets`,
`/about`, etc.) are inline in `404.html` and detect the deployment root
from the URL prefix so they work under both the project URL and a
custom-domain root.

## Conventions

- HTML: semantic. `<article>`, `<section>`, `<nav>`, `<header>`. No div soup.
- CSS: cascade layers. No utility classes. BEM-ish naming where needed.
- JS: ES modules, no bundling. One module per concern.
- Filenames: kebab-case.

## What NOT to add

- "Now playing", view counters, newsletter, theme toggle.
- Tailwind, CSS-in-JS, PostCSS plugins.
- Any third-party React component library.
- Markdown rendering at runtime.
- Service worker, PWA manifest (unless explicitly requested).
- KB-driven build scripts. Content is hand-authored.
