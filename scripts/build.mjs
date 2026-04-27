#!/usr/bin/env node
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, basename } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const CONTENT = join(ROOT, "content");
const WORK_OUT = join(ROOT, "work");
const TIMELINE_OUT = join(ROOT, "timeline");

const FEATURED_ORDER = ["llama-cpp-webgpu-backend", "webgpu-bench", "eusml-pancreas-segmentation"];
const FEATURED = new Set(FEATURED_ORDER);

const SUMMARIES = {
  "llama-cpp-webgpu-backend": "Browser-side LLM inference: shipping shaders that move tokens.",
  "webgpu-bench": "Live WebGPU matmul throughput across tile sizes and workgroup configs.",
  "dawn-metal-shader-bug": "Minimal repro for a Metal shader bug in Dawn, filed upstream.",
  "eusml-pancreas-segmentation": "Real-time endoscopic ultrasound segmentation pipeline, in clinical use.",
  "eusml-labeller": "Point-of-care clinical labeller used during live EUS procedures.",
  "semler-qfhd-ensemble-framework": "Serverless multi-modal ensemble inference for a cardiac diagnostic device.",
  "gsoc-2020-mifos-mentor": "Mentored a GSoC student through Mifos Mobile CN open-banking integration.",
  "gsoc-2019-mifos-mobile-cn": "12 features, 15 PRs merged. First complete Mifos Mobile CN release.",
  "galileo-hackathon-gnss-2018": "Android app inferring driving-risk profiles from GNSS routes.",
  "vr-heart-segmentation": "Pediatric heart segmentation feeding a VR surgical-planning pipeline.",
};

const PARAPHRASE = [
  [/Galileo\s+GNSS\s+[Hh]ackathon/g, "satellite-navigation hackathon"],
  [/Galileo\s+[Hh]ackathon/g, "satellite-navigation hackathon"],
  [/GNSS\s+[Hh]ackathon/g, "satellite-navigation hackathon"],
  [/Amrita-Medical-AI\/[\w-]+/g, "an academic medical-AI lab"],
  [/Amrita Medical AI/g, "an academic medical-AI lab"],
  [/Amrita University/g, "the partner university"],
  [/Amrita['\u2019]s/g, "the partner university's"],
  [/Amrita /g, "the partner university "],
  [/TexNano/g, "a healthcare-AI startup"],
  [/Theta Tech AI/g, "a digital-health firm"],
  [/Semler\s?Scientific/gi, "a medical-device manufacturer"],
  [/Semler team/g, "the partner team"],
  [/QuantaFlo\s+Plus/g, "the cardiac diagnostic device"],
  [/QuantaFlo['\u2019]?s?/g, "the cardiac diagnostic device"],
  [/QuantaFlo/g, "the cardiac diagnostic device"],
  [/QFHD/g, "a cardiac signal model"],
  [/Dr\.\s+Mahesh/g, "a clinical collaborator"],
  [/Dr\.\s+Priya/g, "a clinical collaborator"],
  [/McGovern Institute['\u2019]s/g, "a research institute's"],
  [/McGovern Institute/g, "a research institute"],
];

const ESC = (s) => s
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

function parseFrontmatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { fm: {}, body: src };
  const body = m[2];
  const fm = {};
  const lines = m[1].split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) { i++; continue; }
    const key = kv[1];
    const rest = kv[2];
    if (rest === "") {
      const block = [];
      i++;
      while (i < lines.length && /^\s+(- |[A-Za-z_])/.test(lines[i])) {
        block.push(lines[i]);
        i++;
      }
      if (block.every((l) => l.trim().startsWith("- "))) {
        fm[key] = block.map((l) => stripQuotes(l.trim().slice(2)));
      } else {
        const obj = {};
        for (const l of block) {
          const sub = l.trim().match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
          if (sub) obj[sub[1]] = stripQuotes(sub[2]);
        }
        fm[key] = obj;
      }
      continue;
    }
    if (rest.startsWith("[") && rest.endsWith("]")) {
      fm[key] = rest.slice(1, -1).split(",").map((x) => stripQuotes(x.trim())).filter(Boolean);
    } else {
      fm[key] = stripQuotes(rest);
    }
    i++;
  }
  return { fm, body };
}

function stripQuotes(v) {
  if (typeof v !== "string") return v;
  const t = v.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
}

function renderInline(s) {
  s = ESC(s);
  s = s.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  s = s.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" rel="noopener">$1</a>');
  s = s.replace(/\[([^\]]+)\]\((\/[^)]+)\)/g, '<a href="$2">$1</a>');
  return s;
}

function renderMarkdown(md) {
  const lines = md.split("\n");
  const out = [];
  let i = 0;
  let inCode = false;
  let codeLines = [];
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      if (!inCode) { inCode = true; codeLines = []; }
      else {
        inCode = false;
        out.push(`<pre><code>${ESC(codeLines.join("\n"))}</code></pre>`);
        codeLines = [];
      }
      i++; continue;
    }
    if (inCode) { codeLines.push(line); i++; continue; }
    if (/^#{1,4}\s/.test(line)) {
      const m = line.match(/^(#+)\s+(.+)$/);
      const level = Math.min(m[1].length + 1, 5);
      out.push(`<h${level}>${renderInline(m[2])}</h${level}>`);
      i++; continue;
    }
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      out.push(`<blockquote>${renderMarkdown(buf.join("\n"))}</blockquote>`);
      continue;
    }
    if (/^\s*[-*]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s/, ""));
        i++;
      }
      out.push("<ul>" + items.map((it) => `<li>${renderInline(it)}</li>`).join("") + "</ul>");
      continue;
    }
    if (/^\s*\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s/, ""));
        i++;
      }
      out.push("<ol>" + items.map((it) => `<li>${renderInline(it)}</li>`).join("") + "</ol>");
      continue;
    }
    if (line.trim() === "") { i++; continue; }
    const buf = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== "" && !/^[#>`-]/.test(lines[i]) && !/^\s*[-*]\s/.test(lines[i]) && !/^```/.test(lines[i])) {
      buf.push(lines[i]); i++;
    }
    out.push(`<p>${renderInline(buf.join(" "))}</p>`);
  }
  return out.join("\n");
}

function paraphrase(text) {
  let out = text;
  for (const [re, rep] of PARAPHRASE) out = out.replace(re, rep);
  return out;
}

function fmtDates(d) {
  if (!d || typeof d !== "object") return "";
  const start = d.start || "";
  const end = d.end || "";
  if (!start && !end) return "";
  if (end === "present" || !end) return `${start} \u2192 present`;
  if (start === end) return start;
  return `${start} \u2192 ${end}`;
}

function nav(active) {
  const a = (h, name, slug) => `<li><a href="${h}"${active === slug ? ' aria-current="page"' : ""}>${name}</a></li>`;
  return `
<nav class="site-nav" aria-label="Primary">
  <a class="brand" href="../">abhijitramesh.me</a>
  <ul>
    ${a("../work/", "Work", "work")}
    ${a("../timeline/", "Timeline", "timeline")}
    ${a("../writing/", "Writing", "writing")}
    ${a("../labs/", "Labs", "labs")}
    ${a("../colophon.html", "Colophon")}
  </ul>
</nav>`;
}

const FOOT = `
<footer class="site-footer">
  <span>&copy; Abhijit Ramesh</span>
  <a href="../colophon.html">Colophon</a>
</footer>`;

function htmlPage({ title, description, css, body, active }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${ESC(title)}</title>
  <meta name="description" content="${ESC(description)}">
  <link rel="icon" href="../public/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../styles/tokens.css">
  <link rel="stylesheet" href="../styles/base.css">
  <link rel="stylesheet" href="../styles/layout.css">
  <link rel="stylesheet" href="../styles/components.css">
  ${css.map((c) => `<link rel="stylesheet" href="../styles/${c}.css">`).join("\n  ")}
</head>
<body>
  <main class="page">${nav(active)}
  ${body}
  ${FOOT}
  </main>
</body>
</html>
`;
}

async function buildWork() {
  const dir = join(CONTENT, "projects");
  if (!existsSync(dir)) return;
  const files = (await readdir(dir)).filter((f) => f.endsWith(".md"));
  const projects = [];
  for (const f of files) {
    const slug = basename(f, ".md");
    const raw = await readFile(join(dir, f), "utf8");
    const { fm, body } = parseFrontmatter(raw);
    const isPrivate = fm.visibility === "private";
    const cleanBody = isPrivate ? paraphrase(body) : body;
    projects.push({ slug, fm, isPrivate, html: renderMarkdown(cleanBody) });
  }
  projects.sort((a, b) => {
    const af = FEATURED.has(a.slug) ? FEATURED_ORDER.indexOf(a.slug) : 99;
    const bf = FEATURED.has(b.slug) ? FEATURED_ORDER.indexOf(b.slug) : 99;
    if (af !== bf) return af - bf;
    const da = (a.fm.dates && a.fm.dates.start) || "";
    const db = (b.fm.dates && b.fm.dates.start) || "";
    return db.localeCompare(da);
  });

  await mkdir(WORK_OUT, { recursive: true });
  const cards = projects.map((p) => renderCard(p)).join("\n");
  await writeFile(
    join(WORK_OUT, "index.html"),
    htmlPage({
      title: "Work \u00b7 Abhijit Ramesh",
      description: "Selected projects \u2014 systems work, browser-side LLM inference, medical AI, open-source.",
      css: ["work"],
      active: "work",
      body: `<header><p class="meta-line">Work</p><h1>Selected projects.</h1><p class="lede">Systems work, open-source contributions, and the kinds of problems that resist neat abstractions. Three featured, then the rest in reverse chronological order.</p></header>
<section class="project-list">${cards}</section>`,
    })
  );

  for (const p of projects) {
    await writeFile(join(WORK_OUT, `${p.slug}.html`), renderProject(p));
  }
  console.log(`work: ${projects.length} pages`);
}

function renderCard(p) {
  const title = paraphrase(humanize(p.slug));
  const summary = SUMMARIES[p.slug] ? ESC(paraphrase(SUMMARIES[p.slug])) : "";
  const role = p.fm.role ? ESC(paraphrase(p.fm.role)) : "";
  const dates = fmtDates(p.fm.dates);
  const tags = (p.fm.tags || []).slice(0, 3);
  const featured = FEATURED.has(p.slug);
  return `<article class="project-card${featured ? " featured" : ""}">
  <div class="row">
    <h3>${featured ? '<span class="pin" aria-label="featured">&#9733;</span> ' : ""}<a href="${p.slug}.html">${ESC(title)}</a></h3>
    <span class="meta">${dates ? `<span>${ESC(dates)}</span>` : ""}${role ? `<span>${role}</span>` : ""}</span>
  </div>
  ${summary ? `<p class="summary">${summary}</p>` : ""}
  ${tags.length ? `<ul class="tag-row">${tags.map((t) => `<li>${ESC(t)}</li>`).join("")}</ul>` : ""}
</article>`;
}

function humanize(slug) {
  const map = {
    "llama-cpp-webgpu-backend": "llama.cpp WebGPU backend",
    "webgpu-bench": "webgpu-bench",
    "dawn-metal-shader-bug": "Dawn Metal shader bug",
    "eusml-pancreas-segmentation": "Pancreas segmentation pipeline",
    "eusml-labeller": "Real-time clinical labeller",
    "semler-qfhd-ensemble-framework": "Cardiac ensemble inference framework",
    "gsoc-2020-mifos-mentor": "GSoC 2020 \u2014 Mifos mentor",
    "gsoc-2019-mifos-mobile-cn": "GSoC 2019 \u2014 Mifos Mobile CN",
    "galileo-hackathon-gnss-2018": "Satellite-navigation hackathon",
    "vr-heart-segmentation": "VR pediatric heart segmentation",
  };
  return map[slug] || slug.replace(/-/g, " ");
}

function renderProject(p) {
  const title = paraphrase(humanize(p.slug));
  const dates = fmtDates(p.fm.dates);
  const role = p.fm.role ? paraphrase(p.fm.role) : "";
  const stack = p.fm.stack || [];
  const tags = p.fm.tags || [];
  const showRepo = p.fm.repo && !p.isPrivate && p.fm.repo !== "~";
  const description = ESC(`${title} \u2014 ${role || dates}`);
  const sidebar = `<aside class="project-meta">
  ${dates ? `<dl><dt>Dates</dt><dd>${ESC(dates)}</dd></dl>` : ""}
  ${role ? `<dl><dt>Role</dt><dd>${ESC(role)}</dd></dl>` : ""}
  ${stack.length ? `<dl><dt>Stack</dt><dd>${stack.map((s) => `<code>${ESC(s)}</code>`).join(" ")}</dd></dl>` : ""}
  ${tags.length ? `<dl><dt>Tags</dt><dd><ul class="tag-row">${tags.map((t) => `<li>${ESC(t)}</li>`).join("")}</ul></dd></dl>` : ""}
  ${showRepo ? `<dl><dt>Source</dt><dd><a href="https://github.com/${ESC(p.fm.repo)}" rel="noopener">${ESC(p.fm.repo)}</a></dd></dl>` : ""}
</aside>`;

  const body = `<article class="project-page">
  <header>
    <p class="meta-line"><a href="./">&larr; Work</a></p>
    <h1>${ESC(title)}</h1>
    ${role || dates ? `<p class="byline">${[dates, role].filter(Boolean).map(ESC).join(" \u00b7 ")}</p>` : ""}
  </header>
  ${sidebar}
  <div class="prose">${p.html}</div>
</article>`;

  return htmlPage({
    title: `${title} \u00b7 Abhijit Ramesh`,
    description,
    css: ["work"],
    active: "work",
    body,
  });
}

async function buildTimeline() {
  const dir = join(CONTENT, "timeline");
  if (!existsSync(dir)) return;
  const files = (await readdir(dir)).filter((f) => /^\d{4}\.md$/.test(f)).sort().reverse();
  const sections = [];
  for (const f of files) {
    const year = basename(f, ".md");
    const raw = await readFile(join(dir, f), "utf8");
    const { fm, body } = parseFrontmatter(raw);
    const cleaned = body.replace(/^#\s+\d{4}\s*\n+/, "");
    sections.push({ year, html: renderMarkdown(paraphrase(cleaned)) });
  }
  await mkdir(TIMELINE_OUT, { recursive: true });
  const body = `<header>
  <p class="meta-line">Timeline</p>
  <h1>By the year.</h1>
  <p class="lede">An annual retrospective. What I shipped, who I worked with, what changed.</p>
</header>
<div class="timeline">
  ${sections.map((s) => `<section class="timeline-year" id="y${s.year}" data-year="${s.year}">
    <aside class="year-marker">${s.year}</aside>
    <div class="prose">${s.html}</div>
  </section>`).join("\n")}
</div>
<script>
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const sections = document.querySelectorAll(".timeline-year");
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        e.target.dataset.active = e.isIntersecting && e.intersectionRatio > 0.25 ? "true" : "false";
      }
    }, { threshold: [0.25, 0.5, 0.75] });
    for (const s of sections) obs.observe(s);
  }
</script>`;
  await writeFile(
    join(TIMELINE_OUT, "index.html"),
    htmlPage({
      title: "Timeline \u00b7 Abhijit Ramesh",
      description: "Annual retrospective \u2014 what shipped, what shifted, year by year.",
      css: ["timeline"],
      active: "timeline",
      body,
    })
  );
  console.log(`timeline: ${sections.length} years`);
}

await buildWork();
await buildTimeline();
