// Privacy-conscious PostHog analytics for TinyAtom's public website.
(function () {
  const LOCAL_HOST_PATTERN = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[?::1\]?)(:\d+)?$/;
  const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

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

  function baseProperties(properties) {
    return Object.assign(
      {
        app: 'tinyatom',
        surface: 'landing',
        device: getDevice(),
        page_type: getPageType(),
        path: window.location.pathname,
      },
      getUtmProperties(),
      properties || {},
    );
  }

  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  posthog.init('phc_pTauLbEujsnfL62takAJKgX4VNrDcti9yKwCZBxRWRoD', {
    api_host: 'https://us.i.posthog.com',
    defaults: '2026-05-30',
    persistence: 'memory',
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
