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

document.addEventListener('DOMContentLoaded', () => {
  let current = readStoredTheme();
  applyTheme(current);

  const fab = document.getElementById('theme-fab');
  if (fab) {
    fab.addEventListener('click', () => {
      current = nextTheme(current);
      applyTheme(current);
    });
  }
});
