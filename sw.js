/**
 * GATE Prep Hub — sw.js
 * Service Worker with:
 *   - Cache-first for static assets (HTML, CSS, JS, fonts)
 *   - Network-first for PDFs (large files; falls back to cache)
 *   - Offline fallback page
 *   - Cache versioning for instant updates
 */
'use strict';

const CACHE_VERSION  = 'v1';
const STATIC_CACHE   = `gh-static-${CACHE_VERSION}`;
const PDF_CACHE      = `gh-pdfs-${CACHE_VERSION}`;

/* Static assets to pre-cache on install */
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/search.js',
  '/auth.js',
  '/admin.js',
  '/analytics.js',
  '/manifest.json',
];

/* ── Install: precache static assets ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: remove old caches ── */
self.addEventListener('activate', event => {
  const valid = new Set([STATIC_CACHE, PDF_CACHE]);
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !valid.has(k)).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── Fetch: routing strategy ── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and non-http(s)
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) return;

  // Skip Stripe / analytics / external
  if (!url.hostname.includes('localhost') && url.hostname !== self.location.hostname) return;

  // PDFs → network-first (so updated files are fetched fresh, but cached for offline)
  if (url.pathname.endsWith('.pdf')) {
    event.respondWith(networkFirstPdf(request));
    return;
  }

  // Static assets → cache-first
  event.respondWith(cacheFirst(request));
});

/* ── Cache-first strategy ── */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (_) {
    // Return a minimal offline fallback for navigation requests
    if (request.mode === 'navigate') {
      const fallback = await caches.match('/index.html');
      if (fallback) return fallback;
    }
    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}

/* ── Network-first strategy for PDFs ── */
async function networkFirstPdf(request) {
  const cache = await caches.open(PDF_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      // Store with size limit guard: only cache PDFs < 50 MB
      const blob = await response.clone().blob();
      if (blob.size < 50 * 1024 * 1024) {
        cache.put(request, response.clone());
      }
    }
    return response;
  } catch (_) {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response('PDF unavailable offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}

/* ── Message: force cache clear ── */
self.addEventListener('message', event => {
  if (event.data?.type === 'CLEAR_CACHE') {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
  }
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
