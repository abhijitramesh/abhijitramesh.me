const M = 256, N = 256, K = 256;
const CW = 320, CH = 120;

const canvas = document.getElementById("hero-canvas");
const wrap = canvas.parentElement;
const caption = document.getElementById("hero-caption");
const detailsHost = document.getElementById("hero-details-host");

function showFallback(reason) {
  const img = document.createElement("img");
  img.className = "fallback";
  img.alt = "static heatmap fallback";
  img.src = new URL("../public/hero-fallback.png", import.meta.url).href;
  img.width = CW;
  img.height = CH;
  wrap.replaceChild(img, canvas);
  caption.textContent = `static fallback \u2014 ${reason}`;
}

function oklchToRgb(L, c, h) {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  let r =  4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let b2 = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  const enc = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(v, 0), 1 / 2.4) - 0.055);
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(enc(v) * 255)));
  return [clamp(r), clamp(g), clamp(b2)];
}

function highlight(src) {
  const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const KW = /\b(let|var|const|fn|struct|return|if|for|while|true|false|select)\b/g;
  const TY = /\b(u32|f32|i32|bool|vec2|vec3|vec4|array)\b/g;
  const ATTR = /(@[a-z_]+)/g;
  const BUILTIN = /\b(workgroupBarrier|workgroup_size|compute|global_invocation_id|local_invocation_id|storage|uniform|read|read_write|group|binding)\b/g;
  const NUM = /\b(0x[0-9a-fA-F]+u?|\d+\.?\d*[uf]?)\b/g;
  return escape(src)
    .replace(/(\/\/[^\n]*)/g, '<span class="c">$1</span>')
    .replace(KW, '<span class="kw">$1</span>')
    .replace(TY, '<span class="ty">$1</span>')
    .replace(BUILTIN, '<span class="bi">$1</span>')
    .replace(ATTR, '<span class="at">$1</span>')
    .replace(NUM, '<span class="nu">$1</span>');
}

async function loadShader() {
  const r = await fetch(new URL("../wgsl/matmul-tile.wgsl", import.meta.url));
  if (!r.ok) throw new Error("shader fetch failed");
  return r.text();
}

async function run() {
  if (!("gpu" in navigator)) { showFallback("your browser does not expose WebGPU"); return; }
  let adapter;
  try { adapter = await navigator.gpu.requestAdapter(); } catch { adapter = null; }
  if (!adapter) { showFallback("no GPU adapter available"); return; }
  const device = await adapter.requestDevice();
  device.lost.then(() => {});

  const a = new Float32Array(M * K);
  const b = new Float32Array(K * N);
  for (let i = 0; i < a.length; i++) a[i] = Math.sin(i * 0.012) * 0.6;
  for (let i = 0; i < b.length; i++) b[i] = Math.cos(i * 0.018) * 0.6;

  const bufA = device.createBuffer({ size: a.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
  const bufB = device.createBuffer({ size: b.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
  const bufC = device.createBuffer({ size: 4 * M * N, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC });
  const bufR = device.createBuffer({ size: 4 * M * N, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
  const bufD = device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
  device.queue.writeBuffer(bufA, 0, a);
  device.queue.writeBuffer(bufB, 0, b);
  device.queue.writeBuffer(bufD, 0, new Uint32Array([M, N, K, 0]));

  const wgsl = await loadShader();
  const t0 = performance.now();
  const module = device.createShaderModule({ code: wgsl });
  const pipeline = await device.createComputePipelineAsync({
    layout: "auto",
    compute: { module, entryPoint: "main" },
  });
  const t1 = performance.now();

  const bind = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: bufA } },
      { binding: 1, resource: { buffer: bufB } },
      { binding: 2, resource: { buffer: bufC } },
      { binding: 3, resource: { buffer: bufD } },
    ],
  });

  const enc = device.createCommandEncoder();
  const pass = enc.beginComputePass();
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bind);
  pass.dispatchWorkgroups(Math.ceil(N / 16), Math.ceil(M / 16));
  pass.end();
  enc.copyBufferToBuffer(bufC, 0, bufR, 0, 4 * M * N);
  device.queue.submit([enc.finish()]);
  await device.queue.onSubmittedWorkDone();
  const t2 = performance.now();

  await bufR.mapAsync(GPUMapMode.READ);
  const c = new Float32Array(bufR.getMappedRange()).slice();
  bufR.unmap();

  let min = Infinity, max = -Infinity;
  for (let i = 0; i < c.length; i++) { const v = c[i]; if (v < min) min = v; if (v > max) max = v; }
  const span = max - min || 1;

  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(CW, CH);
  for (let y = 0; y < CH; y++) {
    for (let x = 0; x < CW; x++) {
      const sy = Math.floor((y * M) / CH);
      const sx = Math.floor((x * N) / CW);
      const v = (c[sy * N + sx] - min) / span;
      const [r, g, b2] = oklchToRgb(0.32 + 0.55 * v, 0.16 * (0.4 + 0.6 * v), 240 - 80 * v);
      const idx = (y * CW + x) * 4;
      img.data[idx] = r;
      img.data[idx + 1] = g;
      img.data[idx + 2] = b2;
      img.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  const adapterDesc = adapter.info?.description || adapter.info?.architecture || "GPU";
  caption.textContent = `Compiled in ${(t1 - t0).toFixed(1)}ms \u00b7 ${(t2 - t0).toFixed(1)}ms total \u2014 matmul-tile.wgsl \u00b7 256\u00d7256 \u00b7 ${adapterDesc}`;

  if (detailsHost) {
    detailsHost.innerHTML = `<details><summary>view shader</summary><pre class="shader"><code>${highlight(wgsl)}</code></pre></details>`;
  }

  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    canvas.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 500, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }
    );
  }
}

const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      io.disconnect();
      run().catch((err) => { console.error(err); showFallback("WebGPU init failed"); });
      break;
    }
  }
}, { rootMargin: "100px" });

io.observe(wrap);
