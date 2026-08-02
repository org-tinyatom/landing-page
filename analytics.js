// Privacy-conscious PostHog analytics for TinyAtom's public website.
(function () {
  const LOCAL_HOST_PATTERN = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[?::1\]?)(:\d+)?$/;
  const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const AI_REFERRAL_SESSION_KEY = 'tinyatom_ai_referral';
  const AI_REFERRERS = [
    { source: 'chatgpt', hosts: ['chatgpt.com', 'chat.openai.com'] },
    { source: 'perplexity', hosts: ['perplexity.ai'] },
    { source: 'claude', hosts: ['claude.ai'] },
    { source: 'gemini', hosts: ['gemini.google.com'] },
    { source: 'microsoft_copilot', hosts: ['copilot.microsoft.com'] },
  ];

  if (LOCAL_HOST_PATTERN.test(window.location.host) || navigator.globalPrivacyControl === true) {
    return;
  }

  function getDevice() {
    if (typeof window.matchMedia !== 'function') return 'desktop';
    if (window.matchMedia('(max-width: 767px)').matches) return 'mobile';
    if (window.matchMedia('(max-width: 1024px)').matches) return 'tablet';
    return 'desktop';
  }

  function getPageType() {
    if (window.location.pathname === '/') return 'landing';
    if (window.location.pathname === '/blog/' || window.location.pathname === '/blog') {
      return 'blog_index';
    }
    if (window.location.pathname.startsWith('/blog/')) return 'blog_article';
    if (window.location.pathname === '/privacy' || window.location.pathname.endsWith('/privacy.html')) {
      return 'legal';
    }
    if (window.location.pathname === '/terms' || window.location.pathname.endsWith('/terms.html')) {
      return 'legal';
    }
    return 'content';
  }

  function getUtmProperties() {
    const params = new URLSearchParams(window.location.search);
    return UTM_KEYS.reduce((properties, key) => {
      const value = params.get(key);
      if (value) properties[key] = value;
      return properties;
    }, {});
  }

  function getReferrerHost() {
    if (!document.referrer) return '';
    try {
      return new URL(document.referrer).hostname.toLowerCase();
    } catch (_error) {
      return '';
    }
  }

  function matchesHost(host, expectedHost) {
    return host === expectedHost || host.endsWith('.' + expectedHost);
  }

  function getAiSourceFromHost(host) {
    const match = AI_REFERRERS.find((referrer) =>
      referrer.hosts.some((expectedHost) => matchesHost(host, expectedHost)),
    );
    return match ? match.source : '';
  }

  function getAiSourceFromUtm(source) {
    const normalized = (source || '').toLowerCase();
    if (normalized.includes('chatgpt')) return 'chatgpt';
    if (normalized === 'openai') return 'openai';
    if (normalized.includes('perplexity')) return 'perplexity';
    if (normalized.includes('claude') || normalized.includes('anthropic')) return 'claude';
    if (normalized.includes('gemini') || normalized.includes('bard')) return 'gemini';
    if (normalized.includes('copilot')) return 'microsoft_copilot';
    return '';
  }

  function getTrafficProperties(utmProperties) {
    try {
      const storedReferral = sessionStorage.getItem(AI_REFERRAL_SESSION_KEY);
      if (storedReferral) return JSON.parse(storedReferral);
    } catch (_error) {
      // Attribution still works for the current page when session storage is unavailable.
    }

    const referrerHost = getReferrerHost();
    const aiReferralSource =
      getAiSourceFromUtm(utmProperties.utm_source) || getAiSourceFromHost(referrerHost);
    const trafficProperties = Object.assign(
      referrerHost ? { referrer_host: referrerHost } : {},
      aiReferralSource
        ? { ai_referral: true, ai_referral_source: aiReferralSource }
        : { ai_referral: false },
    );

    if (aiReferralSource) {
      try {
        sessionStorage.setItem(AI_REFERRAL_SESSION_KEY, JSON.stringify(trafficProperties));
      } catch (_error) {
        // Do not block analytics when storage is disabled or full.
      }
    }

    return trafficProperties;
  }

  function baseProperties(properties) {
    const utmProperties = getUtmProperties();
    return Object.assign(
      {
        app: 'tinyatom',
        surface: 'landing',
        device: getDevice(),
        page_type: getPageType(),
        path: window.location.pathname,
      },
      utmProperties,
      getTrafficProperties(utmProperties),
      properties || {},
    );
  }

  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  posthog.init('phc_ummCggeXe5y5pGbxvUjgUfvhKgE6jj2fiNwYV9eyHp5B', {
    api_host: 'https://us.i.posthog.com',
    defaults: '2026-05-30',
    persistence: 'localStorage',
    person_profiles: 'never',
    capture_pageview: false,
    capture_pageleave: false,
    autocapture: false,
    capture_dead_clicks: false,
    rageclick: false,
    disable_surveys: true,
    disable_session_recording: true,
    advanced_disable_flags: true,
  });

  window.tinyatomAnalytics = {
    capture: function (eventName, properties) {
      window.posthog.capture(eventName, baseProperties(properties));
    },
  };

  window.tinyatomAnalytics.capture('$pageview', {
    title: document.title,
  });
})();
