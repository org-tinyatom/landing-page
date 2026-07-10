const STORAGE_KEY = 'tinyatom-landing-theme';
const THEME_ORDER = ['system', 'light', 'dark'];

const THEME_LABELS = {
  system: 'system',
  light: 'light',
  dark: 'dark',
};

function applyTheme(choice) {
  const root = document.documentElement;

  if (choice === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', choice);
  }

  const fab = document.getElementById('theme-fab');
  if (fab) {
    fab.dataset.theme = choice;
    const next = THEME_ORDER[(THEME_ORDER.indexOf(choice) + 1) % THEME_ORDER.length];
    fab.setAttribute(
      'aria-label',
      `Theme: ${THEME_LABELS[choice]}. Click to switch to ${THEME_LABELS[next]}.`,
    );
  }

  localStorage.setItem(STORAGE_KEY, choice);
}

function readStoredTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

function nextTheme(current) {
  const index = THEME_ORDER.indexOf(current);
  return THEME_ORDER[(index + 1) % THEME_ORDER.length];
}

function initThemeToggle() {
  let current = readStoredTheme();
  applyTheme(current);

  const fab = document.getElementById('theme-fab');
  if (fab) {
    fab.addEventListener('click', () => {
      current = nextTheme(current);
      applyTheme(current);
    });
  }
}

function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const update = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
}

function initReveal() {
  const nodes = document.querySelectorAll('.reveal');
  if (!nodes.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    nodes.forEach((node) => node.classList.add('is-visible'));
    return;
  }

  if (!('IntersectionObserver' in window)) {
    nodes.forEach((node) => node.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    {
      root: null,
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.12,
    },
  );

  nodes.forEach((node) => observer.observe(node));

  // Hero content should appear immediately on first paint.
  requestAnimationFrame(() => {
    document.querySelectorAll('.hero .reveal').forEach((node) => {
      node.classList.add('is-visible');
      observer.unobserve(node);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initHeaderScroll();
  initReveal();
});
