/**
 * GATE Prep Hub — analytics.js
 * Privacy-safe GA4 + custom event wrapper.
 *
 * PRODUCTION SETUP:
 *   1. Replace GA_MEASUREMENT_ID with your actual GA4 ID (e.g. "G-XXXXXXXXXX")
 *   2. Load the gtag script by uncommenting the snippet below.
 *   3. Ensure your CSP allows: https://www.googletagmanager.com and https://www.google-analytics.com
 *
 * Privacy notes:
 *   - No PII is sent in event parameters.
 *   - IP anonymisation is enabled by default in GA4.
 *   - Respects navigator.doNotTrack.
 *   - Events are queued while GA4 is loading; no events are lost.
 */
'use strict';

(function () {
  const GA_ID = window.ENV?.GA_MEASUREMENT_ID || '';

  /* Respect Do Not Track */
  const dnt = navigator.doNotTrack === '1' || window.doNotTrack === '1';

  /* Event queue for when gtag isn't loaded yet */
  const queue = [];
  let gtagReady = false;

  if (!dnt && GA_ID && GA_ID !== 'G-XXXXXXXXXX') {
    const s = document.createElement('script');
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    s.async = true;
    s.onload = () => {
      gtagReady = true;
      flush();
    };
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID, {
      anonymize_ip: true,
      send_page_view: true,
    });
  }

  function flush() {
    while (queue.length) {
      const { name, params } = queue.shift();
      dispatchGA(name, params);
    }
  }

  function dispatchGA(name, params) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, params);
    }
  }

  /**
   * Track a custom event.
   * Drops silently if Do Not Track is enabled.
   *
   * @param {string} eventName  - snake_case event name
   * @param {Object} params     - Additional parameters (no PII)
   */
  function track(eventName, params = {}) {
    if (dnt) return;

    const enriched = {
      ...params,
      timestamp:   new Date().toISOString(),
      page_path:   location.pathname,
      // Append session data (no PII)
      session_id:  getSessionId(),
    };

    // Log to console in development
    if (location.hostname === 'localhost' || location.protocol === 'file:') {
      console.debug('[Analytics]', eventName, enriched);
    }

    // GA4
    if (gtagReady) {
      dispatchGA(eventName, enriched);
    } else {
      queue.push({ name: eventName, params: enriched });
    }

    // Also persist locally (last 100 events) for admin dashboard
    persistLocal(eventName, enriched);
  }

  /* ── Session ID (anonymous, resets each session) ── */
  function getSessionId() {
    let id = sessionStorage.getItem('gh_session');
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem('gh_session', id);
    }
    return id;
  }

  /* ── Local event log (for admin stats) ── */
  function persistLocal(name, params) {
    try {
      const log = JSON.parse(localStorage.getItem('gh_event_log') || '[]');
      log.unshift({ event: name, ...params });
      if (log.length > 200) log.length = 200;
      localStorage.setItem('gh_event_log', JSON.stringify(log));
    } catch (_) { /* storage full — ignore */ }
  }

  /* ── Standard page view ── */
  function pageView(path) {
    track('page_view', { page_path: path || location.pathname });
  }

  /* ── Expose ── */
  window.Analytics = { track, pageView };

  // Fire initial page view
  pageView();
})();
