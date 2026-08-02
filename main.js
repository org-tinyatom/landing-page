const STORAGE_KEY = 'tinyatom-landing-theme';
const THEME_ORDER = ['system', 'light', 'dark'];

function captureAnalytics(eventName, properties = {}) {
  window.tinyatomAnalytics?.capture(eventName, properties);
}

// Only the macOS build ships today. Flip `available` and set `href` as the other
// builds land. The CTAs read entirely from this table.
const PLATFORMS = {
  macos: {
    name: 'macOS',
    icon: 'ph-apple-logo',
    label: 'Download the macOS beta',
    href: '/download/mac',
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
    label: 'Download the macOS beta',
    href: '/download/mac',
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
  captureAnalytics('landing.platform_detected', {
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

const VIDEO_IDLE_MS = 2600;

function formatVideoTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

function setVideoIcon(button, name) {
  const icon = button.querySelector('i');
  if (icon) icon.className = name;
}

// Custom chrome for the demo video: the native controls are replaced so the
// player matches the page, and nothing about it starts playback on its own.
function initVideoPlayer() {
  const player = document.querySelector('[data-video-player]');
  if (!player) return;

  const media = player.querySelector('[data-video-media]');
  const toggles = [...player.querySelectorAll('[data-video-toggle]')];
  const barToggle = player.querySelector('.video-btn[data-video-toggle]');
  const timeLabel = player.querySelector('[data-video-time]');
  const seek = player.querySelector('[data-video-seek]');
  const muteButton = player.querySelector('[data-video-mute]');
  const fullscreenButton = player.querySelector('[data-video-fullscreen]');
  if (!media || !toggles.length) return;

  let scrubbing = false;
  let idleTimer = null;

  const renderTime = () => {
    const duration = Number.isFinite(media.duration) ? media.duration : 0;
    if (timeLabel) {
      timeLabel.textContent = `${formatVideoTime(media.currentTime)} / ${formatVideoTime(duration)}`;
    }
    if (seek && !scrubbing) {
      const played = duration > 0 ? media.currentTime / duration : 0;
      seek.value = String(Math.round(played * 1000));
      seek.style.setProperty('--seek', played.toFixed(4));
    }
  };

  const clearIdle = () => {
    clearTimeout(idleTimer);
    idleTimer = null;
    player.classList.remove('is-idle');
  };
  const armIdle = () => {
    clearIdle();
    if (media.paused) return;
    idleTimer = setTimeout(() => player.classList.add('is-idle'), VIDEO_IDLE_MS);
  };

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      if (media.paused) media.play();
      else media.pause();
    });
  });

  media.addEventListener('play', () => {
    const first = !player.classList.contains('is-started');
    player.classList.add('is-started', 'is-playing');
    player.classList.remove('is-paused');
    toggles.forEach((toggle) => toggle.setAttribute('aria-label', 'Pause the demo'));
    if (barToggle) setVideoIcon(barToggle, 'ph-fill ph-pause');
    armIdle();
    if (first) captureAnalytics('landing.demo_video_played', { location: 'how_it_works' });
  });

  media.addEventListener('pause', () => {
    player.classList.remove('is-playing');
    player.classList.add('is-paused');
    toggles.forEach((toggle) => toggle.setAttribute('aria-label', 'Play the demo'));
    if (barToggle) setVideoIcon(barToggle, 'ph-fill ph-play');
    clearIdle();
  });

  media.addEventListener('ended', () => {
    captureAnalytics('landing.demo_video_completed', { location: 'how_it_works' });
  });

  media.addEventListener('timeupdate', renderTime);
  media.addEventListener('loadedmetadata', renderTime);
  media.addEventListener('durationchange', renderTime);

  if (seek) {
    const seekTo = () => {
      if (!Number.isFinite(media.duration)) return;
      const fraction = Number(seek.value) / 1000;
      seek.style.setProperty('--seek', fraction.toFixed(4));
      media.currentTime = fraction * media.duration;
    };
    seek.addEventListener('pointerdown', () => (scrubbing = true));
    seek.addEventListener('input', seekTo);
    seek.addEventListener('change', () => {
      scrubbing = false;
      seekTo();
    });
  }

  if (muteButton) {
    muteButton.addEventListener('click', () => {
      media.muted = !media.muted;
      setVideoIcon(muteButton, media.muted ? 'ph-fill ph-speaker-slash' : 'ph-fill ph-speaker-high');
      muteButton.setAttribute('aria-label', media.muted ? 'Unmute the demo' : 'Mute the demo');
    });
  }

  if (fullscreenButton) {
    fullscreenButton.addEventListener('click', () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (player.requestFullscreen) {
        player.requestFullscreen();
      } else if (media.webkitEnterFullscreen) {
        // iOS Safari only ever fullscreens the video element itself.
        media.webkitEnterFullscreen();
      }
    });
    document.addEventListener('fullscreenchange', () => {
      const full = document.fullscreenElement === player;
      setVideoIcon(fullscreenButton, full ? 'ph ph-corners-in' : 'ph ph-corners-out');
      fullscreenButton.setAttribute(
        'aria-label',
        full ? 'Leave full screen' : 'Show the demo full screen',
      );
    });
  }

  player.addEventListener('pointermove', armIdle);
  player.addEventListener('pointerleave', () => {
    if (!media.paused) player.classList.add('is-idle');
  });

  renderTime();
}

function getAnalyticsLocation(element) {
  if (element.closest('.site-header')) return 'header';
  if (element.closest('.hero')) return 'hero';
  if (element.closest('.cta-section')) return 'final_cta';
  if (element.closest('article')) return 'article';
  if (element.closest('footer')) return 'footer';
  return 'body';
}

function initEngagementAnalytics() {
  document.querySelectorAll('[data-download-cta]').forEach((cta) => {
    cta.addEventListener('click', () => {
      captureAnalytics('landing.download_requested', {
        location: getAnalyticsLocation(cta),
        platform: cta.dataset.os || detectPlatform(),
        destination: cta.getAttribute('href'),
      });
    });
  });

  document.querySelectorAll('.hero-watch[href="#how"]').forEach((cta) => {
    cta.addEventListener('click', () => {
      captureAnalytics('landing.how_it_works_requested', {
        location: getAnalyticsLocation(cta),
      });
    });
  });

  document.querySelectorAll('details.faq-item').forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      captureAnalytics('landing.faq_opened', {
        question: item.querySelector('summary')?.textContent.trim() || '',
      });
    });
  });

  if (!('IntersectionObserver' in window)) return;

  const sections = ['how', 'security', 'faq', 'download']
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        captureAnalytics('landing.section_viewed', {
          section: entry.target.id,
        });
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.35 },
  );
  sections.forEach((section) => observer.observe(section));
}

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initHeaderScroll();
  initReveal();
  initDownloadCta();
  initMockTabs();
  initVideoPlayer();
  initEngagementAnalytics();
});
