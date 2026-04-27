#!/usr/bin/env node
import { copyFile, mkdir, readdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, basename } from "node:path";

const KB = join(homedir(), ".lovelace", "kb");
const ROOT = new URL("..", import.meta.url).pathname;
const OUT = join(ROOT, "content");

const PROJECTS = [
  "llama-cpp-webgpu-backend",
  "webgpu-bench",
  "dawn-metal-shader-bug",
  "eusml-pancreas-segmentation",
  "eusml-labeller",
  "semler-qfhd-ensemble-framework",
  "gsoc-2020-mifos-mentor",
  "gsoc-2019-mifos-mobile-cn",
  "galileo-hackathon-gnss-2018",
  "vr-heart-segmentation",
];

const PROFILE = ["bio.md", "skills.md", "education.md"];
const ARTIFACTS = ["awards.md", "teaching.md", "community.md"];

async function copyOne(srcRel, dstRel, { warnIfMissing = true } = {}) {
  const src = join(KB, srcRel);
  const dst = join(OUT, dstRel);
  if (!existsSync(src)) {
    if (warnIfMissing) console.warn(`skip: ${srcRel} (not found)`);
    return false;
  }
  await mkdir(join(dst, ".."), { recursive: true });
  await copyFile(src, dst);
  return true;
}

async function copyDir(srcRel, dstRel) {
  const src = join(KB, srcRel);
  if (!existsSync(src)) {
    console.warn(`skip dir: ${srcRel} (not found)`);
    return 0;
  }
  const entries = await readdir(src, { withFileTypes: true });
  let n = 0;
  for (const e of entries) {
    if (!e.isFile() || !e.name.endsWith(".md")) continue;
    if (await copyOne(join(srcRel, e.name), join(dstRel, e.name))) n += 1;
  }
  return n;
}

async function main() {
  if (!existsSync(KB)) {
    console.error(`KB not found at ${KB}`);
    process.exit(1);
  }
  await rm(OUT, { recursive: true, force: true });

  let n = 0;
  for (const f of PROFILE) if (await copyOne(`profile/${f}`, `profile/${f}`)) n++;
  for (const slug of PROJECTS) if (await copyOne(`projects/${slug}.md`, `projects/${slug}.md`)) n++;
  for (const f of ARTIFACTS) if (await copyOne(`artifacts/${f}`, `artifacts/${f}`)) n++;
  n += await copyDir("timeline", "timeline");
  n += await copyDir("roles", "roles");

  console.log(`snapshot: ${n} files into ${OUT.replace(ROOT, "")}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
