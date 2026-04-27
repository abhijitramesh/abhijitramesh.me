const REDIRECTS = [
  [/^\/blog(\/.*)?$/, "/"],
  [/^\/snippets(\/.*)?$/, "/"],
  [/^\/dashboard\/?$/, "/"],
  [/^\/uses\/?$/, "/"],
  [/^\/newsletter(\/.*)?$/, "/"],
  [/^\/about\/?$/, "/colophon.html"],
  [/^\/api(\/.*)?$/, "/"],
];

const path = location.pathname;
for (const [pattern, dest] of REDIRECTS) {
  if (pattern.test(path)) {
    location.replace(dest);
    break;
  }
}
