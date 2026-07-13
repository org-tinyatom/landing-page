const STORAGE_KEY = 'tinyatom-landing-theme';
const THEME_ORDER = ['system', 'light', 'dark'];

// Only the macOS build ships today. Flip `available` and set `href` as the other
// builds land — the CTAs read entirely from this table.
const PLATFORMS = {
  macos: {
    name: 'macOS',
    icon: 'ph-apple-logo',
    label: 'Get TinyAtom for macOS',
    href: '/download',
    available: true,
  },
  windows: {
    name: 'Windows',
    icon: 'ph-windows-logo',
    label: 'Join the Windows waitlist',
    href: '/waitlist?os=windows',
    available: false,
    note: 'The Windows build is in progress. Leave your email and we will send it the day it ships.',
  },
  linux: {
    name: 'Linux',
    icon: 'ph-linux-logo',
    label: 'Join the Linux waitlist',
    href: '/waitlist?os=linux',
    available: false,
    note: 'The Linux build is in progress. Leave your email and we will send it the day it ships.',
  },
  // Phones and anything we cannot place: TinyAtom installs on a computer, so send
  // them to the download page rather than naming an OS we are only guessing at.
  other: {
    name: 'Other',
    icon: 'ph-desktop',
    label: 'Get TinyAtom',
    href: '/download',
    available: true,
  },
};

function detectPlatform() {
  const hinted = navigator.userAgentData?.platform || '';
  const agent = `${hinted} ${navigator.userAgent || ''}`.toLowerCase();

  if (/android|iphone|ipod|mobile/.test(agent)) return 'other';
  if (/win/.test(agent)) return 'windows';
  // iPadOS reports a desktop Mac user agent and cannot be told apart from a Mac here.
  if (/mac|ipad/.test(agent)) return 'macos';
  if (/linux|x11|cros/.test(agent)) return 'linux';
  return 'other';
}

function initDownloadCta() {
  const key = detectPlatform();
  const platform = PLATFORMS[key];

  document.documentElement.dataset.os = key;

  document.querySelectorAll('[data-download-cta]').forEach((cta) => {
    cta.href = platform.href;
    cta.dataset.os = key;

    const icon = cta.querySelector('[data-download-icon]');
    if (icon) icon.className = `ph ${platform.icon}`;

    const label = cta.querySelector('[data-download-label]');
    if (label) label.textContent = platform.label;
  });

  document.querySelectorAll('[data-download-note]').forEach((note) => {
    if (!platform.note) return;
    note.textContent = platform.note;
    note.hidden = false;
  });

  // Record which platform visitors actually arrive on, so demand drives build order.
  window.posthog?.capture('landing_platform_detected', {
    platform: key,
    available: platform.available,
  });
}

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

const MOCK_TAB_MS = 1000;

function initMockTabs() {
  const tabs = [...document.querySelectorAll('[data-mock-tab]')];
  const views = [...document.querySelectorAll('[data-mock-view]')];
  if (tabs.length < 2 || !views.length) return;

  const show = (name) => {
    tabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.mockTab === name));
    views.forEach((view) => view.classList.toggle('is-active', view.dataset.mockView === name));
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let index = 0;
  let timer = null;

  const advance = () => {
    index = (index + 1) % tabs.length;
    show(tabs[index].dataset.mockTab);
  };

  const start = () => {
    if (timer === null) timer = setInterval(advance, MOCK_TAB_MS);
  };
  const stop = () => {
    clearInterval(timer);
    timer = null;
  };

  // Do not animate a window nobody is looking at.
  const product = document.querySelector('.hero-product');
  if (product && 'IntersectionObserver' in window) {
    new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0.2 },
    ).observe(product);
  } else {
    start();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (product && product.getBoundingClientRect().bottom > 0) start();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initHeaderScroll();
  initReveal();
  initDownloadCta();
  initMockTabs();
});
