/**
 * GATE Prep Hub — supabase.js
 * Supabase client singleton.
 *
 * Credentials are read from window.ENV, which is set by config.js.
 * config.js is auto-generated from .env — run:
 *   ./generate-config.sh        (Mac / Linux)
 *   node generate-config.js     (Windows / cross-platform)
 */
'use strict';

(function () {
  const ENV = window.ENV || {};
  const url  = ENV.SUPABASE_URL      || '';
  const key  = ENV.SUPABASE_ANON_KEY || '';

  /* ── Guard: warn if credentials are missing ── */
  if (!url || url.includes('your-project-id')) {
    console.warn(
      '[Supabase] SUPABASE_URL not set.\n' +
      '  1. Fill in your credentials in .env\n' +
      '  2. Run: ./generate-config.sh  (or: node generate-config.js)\n' +
      '  3. Reload the page.'
    );
  }
  if (!key || key.includes('your-anon-key')) {
    console.warn('[Supabase] SUPABASE_ANON_KEY not set. See above.');
  }

  /* ── Guard: SDK must be loaded ── */
  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error(
      '[Supabase] SDK not loaded. ' +
      'Ensure the Supabase CDN <script> appears before supabase.js in index.html.'
    );
    return;
  }

  const _sdk = window.supabase; // CDN export: { createClient, ... }

  /* Create and expose the client instance, replacing the CDN export */
  window.supabase = _sdk.createClient(url, key, {
    auth: {
      persistSession:     true,   // survives page reloads via localStorage
      detectSessionInUrl: true,   // handles magic-link / OAuth hash params
      autoRefreshToken:   true,
    },
  });

  console.debug('[Supabase] client ready →', url);
})();
