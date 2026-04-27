const cycle = ['auto', 'light', 'dark'];
const root = document.documentElement;
const button = document.querySelector('[data-theme-toggle]');

const getMode = () => localStorage.getItem('theme') || 'auto';

const apply = (mode) => {
  if (mode === 'auto') {
    delete root.dataset.theme;
    localStorage.removeItem('theme');
  } else {
    root.dataset.theme = mode;
    localStorage.setItem('theme', mode);
  }
  if (button) {
    button.textContent = mode;
    button.setAttribute('aria-label', `Theme: ${mode}. Click to cycle.`);
  }
};

apply(getMode());

button?.addEventListener('click', () => {
  const next = cycle[(cycle.indexOf(getMode()) + 1) % cycle.length];
  apply(next);
});
