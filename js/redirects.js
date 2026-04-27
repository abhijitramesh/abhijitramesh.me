const me = document.currentScript || document.querySelector('script[src$="redirects.js"]');
const ROOT = me ? new URL(".", me.src).pathname.replace(/js\/$/, "") : "/";

const REDIRECTS = [
  [/^\/blog(\/.*)?$/, ""],
  [/^\/snippets(\/.*)?$/, ""],
  [/^\/dashboard\/?$/, ""],
  [/^\/uses\/?$/, ""],
  [/^\/newsletter(\/.*)?$/, ""],
  [/^\/about\/?$/, "colophon.html"],
  [/^\/api(\/.*)?$/, ""],
];

let path = location.pathname;
if (ROOT !== "/" && path.startsWith(ROOT)) path = "/" + path.slice(ROOT.length);

for (const [pattern, dest] of REDIRECTS) {
  if (pattern.test(path)) {
    location.replace(ROOT + dest);
    break;
  }
}
