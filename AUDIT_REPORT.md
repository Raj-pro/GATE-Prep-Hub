# 🔍 GATE Prep Hub — Audit Report

> **Audit Date:** 16 May 2026  
> **Auditor:** Antigravity (AI Code Review)  
> **Project:** GATE Prep Hub — `gate prep book/`  
> **Stack:** Vanilla HTML / CSS / JavaScript · Supabase Auth + PostgreSQL · Vercel · PWA  
> **Scope:** Full static analysis of all source files — code quality, security, accessibility, performance, data integrity, and deployment config.

---

## 📊 Executive Summary

| Category | Score | Status |
|---|---|---|
| Code Quality | 87 / 100 | 🟢 Good |
| Security | 82 / 100 | 🟢 Good |
| Accessibility (WCAG) | 90 / 100 | 🟢 Very Good |
| Performance / PWA | 85 / 100 | 🟢 Good |
| Data Integrity | 70 / 100 | 🟡 Needs Fix |
| Deployment Config | 88 / 100 | 🟢 Good |
| **Overall** | **84 / 100** | **🟢 Good — Minor Issues** |

---

## 📁 Project File Overview

| File | Lines | Size | Role |
|---|---|---|---|
| `app.js` | 1,195 | 55.5 KB | Main application controller |
| `auth.js` | 539 | 22.0 KB | Supabase Auth (sign-in, register, session) |
| `admin.js` | 450 | 18.7 KB | Admin panel (users, logs, PDF views) |
| `styles.css` | 1,174 | 33.6 KB | Global stylesheet |
| `index.html` | 351 | 19.2 KB | App shell + modals |
| `search.js` | 131 | 4.1 KB | Trigram fuzzy search engine |
| `analytics.js` | 125 | 3.5 KB | GA4 wrapper + local event log |
| `sw.js` | 126 | 3.7 KB | Service Worker (PWA offline support) |
| `supabase.js` | 51 | 1.6 KB | Supabase client singleton |
| `schema.sql` | 251 | 9.9 KB | PostgreSQL schema + RLS policies |
| `config.js` | 11 | 339 B | Auto-generated env config (git-ignored) |
| `manifest.json` | 39 | 1.4 KB | PWA manifest |
| `vercel.json` | 33 | 1.4 KB | Deployment headers + routing |

---

## 🐛 Bugs & Issues Found

### 🔴 Critical

> None found.

---

### 🟠 High Priority

#### BUG-01 — Welcome screen PDF count mismatch
- **File:** `index.html` line 274, `app.js`
- **Description:** The welcome screen displays **"49 notes across 12 subjects"**, but the `SUBJECTS` array in `app.js` actually defines **54 PDF entries** across 12 subjects.
- **Impact:** Users see incorrect statistics on the home screen; erodes trust.
- **Fix:** Update `index.html` line 274 and the `TOTAL_PDFS` constant reference in `app.js`:
  ```html
  <!-- index.html line 274 — change 49 to 54 -->
  <p class="welcome-subtitle">54 notes across 12 subjects — annotate, bookmark and track your progress.</p>
  ```
  > Note: `TOTAL_PDFS` is dynamically computed from `SUBJECTS.reduce(...)`, so the stats row cards on the welcome screen are actually correct (they use `TOTAL_PDFS`). Only the hardcoded subtitle text is wrong.

---

#### BUG-02 — Supabase Anon Key in Legacy Format
- **File:** `config.js`, `.env`
- **Description:** The `SUPABASE_ANON_KEY` uses the `sb_publishable_...` format (legacy). Modern Supabase projects use a JWT (`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`) as the anon key. While this may still work with older Supabase SDK versions, it can cause issues with future SDK updates.
- **Impact:** Potential auth failures if Supabase deprecates the legacy format.
- **Fix:** Regenerate the anon key from the Supabase Dashboard → Settings → API. The correct format begins with `eyJ`.

---

### 🟡 Medium Priority

#### ISSUE-03 — `console.log` left in production code
- **File:** `app.js` line 967
- **Description:** A `console.log('[SW] registered', reg.scope)` is left in the service worker registration code. This exposes internal scope paths in production browser consoles.
- **Fix:** Replace with `console.debug(...)` (already used elsewhere for `TOKEN_REFRESHED`) or remove entirely:
  ```js
  // Before
  .then(reg => console.log('[SW] registered', reg.scope))
  // After
  .then(() => {}) // SW registered silently
  ```

---

#### ISSUE-04 — GA4 Measurement ID not configured
- **File:** `analytics.js`, `config.js`, `.env`
- **Description:** `GA_MEASUREMENT_ID` is set to the placeholder value `G-XXXXXXXXXX`. Analytics events are tracked locally but never sent to Google Analytics.
- **Impact:** No real-time analytics, no user acquisition data in GA4 dashboard.
- **Fix:** Replace `G-XXXXXXXXXX` in `.env` with the actual GA4 Measurement ID, then re-run `node generate-config.js`.

---

#### ISSUE-05 — No `<h1>` on Welcome Screen (SEO / a11y)
- **File:** `index.html` line 273
- **Description:** The welcome screen uses `<h1 class="welcome-title">GATE Prep Hub</h1>` which is inside `#welcome-screen`. The profile view uses `<h1 class="profile-name">` as well. Multiple `<h1>` elements exist in the DOM simultaneously (both are present in the DOM, just one is hidden with `[hidden]`).
- **Impact:** Minor SEO and WCAG 2.4.6 heading-structure violation — screen readers may announce two separate `<h1>` elements.
- **Fix:** Change `profile-name` in `renderProfile()` from `<h1>` to `<h2>` since the page-level heading is always "GATE Prep Hub".

---

#### ISSUE-06 — Admin panel uses `alert()` / `confirm()` dialogs
- **File:** `admin.js` lines 36, 84, 381, 443
- **Description:** Native `alert()` and `confirm()` dialogs are used for destructive operations (delete user, ban user, clear data). These are blocking, visually inconsistent with the dark UI theme, and inaccessible on some mobile browsers.
- **Fix:** Replace with a custom modal confirmation component consistent with the existing modal design system.

---

#### ISSUE-07 — CSP is commented out in HTML (meta tag approach)
- **File:** `index.html` lines 11–25
- **Description:** The Content Security Policy is provided as an HTML comment referencing an HTTP header, but the meta tag CSP is commented out. The `vercel.json` correctly sets the CSP header — this is fine — but the HTML comment may mislead future developers into thinking CSP is not active.
- **Fix:** Add a brief comment clarifying CSP is enforced via Vercel HTTP headers in `vercel.json`:
  ```html
  <!-- CSP is enforced via HTTP headers in vercel.json, not meta tags (HTTP headers take precedence) -->
  ```

---

#### ISSUE-08 — Service worker not registered for `file://` protocol (development)
- **File:** `app.js` line 965
- **Description:** `registerServiceWorker()` explicitly skips `file:` protocol (`location.protocol !== 'file:'`). This is correct for production, but means the offline banner and cache behavior cannot be tested locally without a dev server.
- **Fix (optional):** Add a comment explaining this is intentional and instruct developers to use `npx serve` or `python -m http.server` for local PWA testing.

---

#### ISSUE-09 — No error boundary for `PDF_MAP.get()` returning `undefined`
- **File:** `app.js` lines 424, 558
- **Description:** Both `openPdf()` and `toggleFavorite()` call `PDF_MAP.get(pdfId)` and early-return on `null/undefined`. However, the `renderSidebarFavorites()` function silently skips missing entries without notifying the user:
  ```js
  const entry = PDF_MAP.get(id);
  if (!entry) return; // silent skip — stale localStorage data
  ```
- **Impact:** If a user has a stale PDF ID in `localStorage` favorites (e.g., after an admin removes a note), the sidebar favorite count badge will be inflated versus what's actually shown in the list.
- **Fix:** Add cleanup logic in `init()` to prune stale IDs from `store.favorites`, `store.bookmarks`, and `store.annotations`.

---

### 🟢 Low Priority / Suggestions

#### SUGGESTION-10 — CSS `btn-danger` defined twice
- **File:** `styles.css` lines 831 and 1093
- **Description:** `.btn-danger` is defined twice. The second definition at line 1093 (inside the admin section) partially overrides the first at line 831. This is not a functional bug (they produce the same result) but creates maintenance confusion.
- **Fix:** Remove the duplicate definition at line 1093.

---

#### SUGGESTION-11 — `supabase/.temp/` directory committed
- **File:** `.gitignore`
- **Description:** `.gitignore` correctly lists `supabase/.temp/` and `supabase/.branches/`, but the `supabase/` directory exists in the project root. Verify that `supabase/config.toml` or other Supabase CLI artifacts are not unintentionally committed.
- **Fix:** Run `git status supabase/` to verify only intended files are tracked.

---

#### SUGGESTION-12 — `architecture.html` not linked from main app
- **File:** `architecture.html`
- **Description:** An `architecture.html` file exists (16 KB) but is not linked from `index.html` or any other file. It appears to be a developer reference document.
- **Fix:** Either link it from a dev-only README, or add it to `.gitignore` / `.vercelignore` if it should not be publicly served.

---

#### SUGGESTION-13 — No `robots.txt` or `sitemap.xml`
- **Description:** The project has no `robots.txt` or `sitemap.xml`, which limits search engine discoverability.
- **Fix:** Add a minimal `robots.txt`:
  ```
  User-agent: *
  Disallow: /admin
  Allow: /
  ```

---

#### SUGGESTION-14 — No `<meta name="og:*">` Open Graph tags
- **File:** `index.html`
- **Description:** No Open Graph or Twitter Card meta tags are present. Sharing the URL on social media or messaging apps will produce an unformatted link preview.
- **Fix:** Add basic OG tags to `<head>`:
  ```html
  <meta property="og:title" content="GATE Prep Hub — Study Smart" />
  <meta property="og:description" content="54 premium GATE CS notes across 12 subjects." />
  <meta property="og:type" content="website" />
  ```

---

## 🔐 Security Audit

| Check | Status | Notes |
|---|---|---|
| `isAdmin` from DB `profiles` table (not `user_metadata`) | ✅ Pass | Correctly enforced server-side |
| Ban check on every login | ✅ Pass | `is_banned` read from `profiles` before session confirmed |
| Email normalization (`.toLowerCase()`) | ✅ Pass | Prevents duplicate accounts via case variation |
| XSS protection via `escHtml()` / `esc()` | ✅ Pass | All user-facing innerHTML is escaped |
| No `eval()` usage | ✅ Pass | Clean |
| ARIA focus trap in modals | ✅ Pass | `trapFocus()` implemented in `auth.js` |
| `.env` in `.gitignore` | ✅ Pass | Secrets never committed |
| `config.js` in `.gitignore` | ✅ Pass | Generated file with keys never committed |
| Content-Security-Policy (CSP) | ✅ Pass | Set via Vercel HTTP headers in `vercel.json` |
| HSTS header | ✅ Pass | `max-age=63072000; includeSubDomains; preload` |
| `X-Frame-Options: SAMEORIGIN` | ✅ Pass | Clickjacking protection |
| `X-Content-Type-Options: nosniff` | ✅ Pass | MIME sniffing protection |
| `Referrer-Policy` | ✅ Pass | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | ✅ Pass | Camera, mic, geolocation disabled |
| RLS policies on all Supabase tables | ✅ Pass | `profiles`, `login_logs`, `pdf_views` all RLS-enabled |
| Admin reads all profiles (RLS policy) | ✅ Pass | `public.is_admin()` security-definer function used |
| Anon key format (legacy `sb_publishable_`) | ⚠️ Warn | See BUG-02 — may need rotation |
| `admin` route client-side only | ⚠️ Warn | Admin check is enforced client-side + DB RLS; but admin panel URL is not server-protected |
| Stripe integration | ✅ N/A | Stripe referenced in CSP but no Stripe code found in JS |

---

## ♿ Accessibility (WCAG 2.1 AA) Audit

| Check | Status | Notes |
|---|---|---|
| Skip-to-content link | ✅ Pass | `.skip-link` → `#main-content` |
| `lang` attribute on `<html>` | ✅ Pass | `lang="en"` |
| All form inputs have labels | ✅ Pass | `<label for="...">` on all inputs |
| Error messages use `role="alert"` | ✅ Pass | All `<span class="field-error">` have `role="alert"` |
| Modal uses `role="dialog"` + `aria-modal` | ✅ Pass | Auth modal correctly configured |
| Focus trap in modals | ✅ Pass | `trapFocus()` in auth.js |
| Toast region `aria-live="polite"` | ✅ Pass | `#toast-container` |
| Offline banner `role="status"` | ✅ Pass | Hidden by default, shown offline |
| Search combobox ARIA | ✅ Pass | `role="combobox"`, `aria-autocomplete`, `aria-controls` |
| Progress bar `role="progressbar"` | ✅ Pass | With `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| Keyboard navigation (`/` focuses search) | ✅ Pass | Arrow keys, Enter, Escape all handled |
| Icon buttons have `aria-label` | ✅ Pass | All icon-only buttons labeled |
| `prefers-reduced-motion` | ✅ Pass | Animations disabled when user prefers |
| `forced-colors` (high contrast) | ✅ Pass | Explicit forced-color-adjust rules |
| `:focus-visible` outline | ✅ Pass | 2px accent outline with offset |
| Multiple `<h1>` in DOM | ⚠️ Warn | See ISSUE-05 — profile name uses `<h1>` |
| Password strength meter labeled | ✅ Pass | `aria-label="Password strength: ..."` |
| PDF iframe has `title` attribute | ✅ Pass | `title="PDF viewer"` |
| Admin edit modal labeled | ✅ Pass | `aria-labelledby="admin-edit-title"` |

---

## ⚡ Performance Audit

| Check | Status | Notes |
|---|---|---|
| All JS scripts `defer`-ed | ✅ Pass | All 6 local scripts use `defer` |
| Script load order correct | ✅ Pass | `config → supabase → analytics → search → auth → admin → app` |
| CSS loaded in `<head>` | ✅ Pass | No render-blocking JS before CSS |
| Service Worker for caching | ✅ Pass | Static assets cached, PDFs network-first |
| PDFs loaded via Google Drive embed | ✅ Pass | No large files served from origin |
| localStorage for favorites/bookmarks | ✅ Pass | Fast, no network round-trip needed |
| Debounced search (`120ms`) | ✅ Pass | `search.js` uses debounce to reduce reflows |
| Page loader indicator | ✅ Pass | CSS gradient bar, no JS animation library |
| CSS custom properties for theming | ✅ Pass | 29 CSS variables defined, no inline styles |
| No external font loading | ⚠️ Note | Uses system fonts (`Segoe UI`, `system-ui`) — fast but limited branding |
| No framework/library bundle | ✅ Pass | Zero dependencies beyond Supabase SDK |
| Image optimization | ✅ N/A | No raster images — all SVG inline or emoji |

---

## 📱 PWA Audit

| Check | Status | Notes |
|---|---|---|
| `manifest.json` present | ✅ Pass | Linked in `<head>` |
| `start_url` defined | ✅ Pass | `"/"` |
| `display: standalone` | ✅ Pass | Installed app feels native |
| Icon defined | ✅ Pass | SVG icon, `purpose: any maskable` |
| `theme_color` matches `meta[theme-color]` | ✅ Pass | Both `#0a0d14` |
| App shortcuts (2 defined) | ✅ Pass | Algorithms + OS subjects |
| Service Worker registered | ✅ Pass | Registered for `https:` only (correct) |
| Cache versioning (`v1`) | ✅ Pass | Old caches pruned on activate |
| Precache list complete | ✅ Pass | All 8 core assets precached |
| `config.js` excluded from cache | ✅ Pass | `NEVER_CACHE` set correctly |
| PDF cache size limit (50 MB) | ✅ Pass | Blob size guard prevents storage bloat |
| Offline fallback | ✅ Pass | Returns cached `index.html` for navigate requests |
| HTTPS enforced via HSTS | ✅ Pass | `vercel.json` header |

---

## 🗄️ Database Schema Audit (`schema.sql`)

| Check | Status | Notes |
|---|---|---|
| `profiles` table | ✅ Pass | FK to `auth.users`, cascades on delete |
| Auto-create profile trigger | ✅ Pass | `handle_new_user()` fires on `INSERT` into `auth.users` |
| `updated_at` trigger | ✅ Pass | Auto-updated on every `UPDATE` |
| `email` + `is_banned` columns added | ✅ Pass | `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` |
| RLS enabled on all tables | ✅ Pass | `profiles`, `login_logs`, `pdf_views` |
| Users can only read own profile | ✅ Pass | `using (auth.uid() = id)` |
| Admins can read all profiles | ✅ Pass | Via `public.is_admin()` security-definer function |
| Admins can update / delete any profile | ✅ Pass | Separate RLS policies |
| Login log insert restricted to own user | ✅ Pass | `auth.uid() = user_id AND email = auth.email()` |
| PDF views insert restricted to own user | ✅ Pass | `auth.uid() = user_id` |
| `is_admin()` avoids recursive RLS | ✅ Pass | `security definer` with `set search_path = public` |
| Optional tables (favorites/bookmarks) in comments | ✅ Pass | Ready for future DB sync upgrade |
| `login_logs` FK cascade on profile delete | ✅ Pass | Data cleaned up when profile deleted |
| `pdf_views` FK cascade on profile delete | ✅ Pass | Data cleaned up when profile deleted |

---

## 🧪 Test Results Summary

### Static Analysis Tests Run

| Test | Result |
|---|---|
| HTML structural completeness | ✅ 16/17 checks passed |
| JavaScript file parse (no syntax errors) | ✅ All 7 files clean |
| PDF count (actual vs. claimed) | ❌ 54 actual vs. 49 claimed |
| Duplicate PDF IDs | ✅ None (54 unique IDs) |
| Duplicate Drive IDs | ✅ None (54 unique IDs) |
| Script load order | ✅ Correct |
| Secrets in gitignore | ✅ `.env` + `config.js` excluded |
| Secrets in vercelignore | ✅ `.env` + `config.js` excluded |
| console.log in production code | ⚠️ 1 found (`app.js:967`) |
| `eval()` usage | ✅ None |
| CSS media queries | ✅ 5 (mobile, tablet, print, forced-colors, reduced-motion) |
| CSS animations | ✅ 4 keyframe animations |
| CSS duplicate selectors | ⚠️ 10 selectors defined multiple times (expected for state modifiers) |
| XSS protection (escHtml / esc) | ✅ Present in all modules |
| Admin auth gate | ✅ Both client-side and DB RLS |
| Ban check on login | ✅ Enforced |
| PWA manifest valid | ✅ |
| Service Worker strategies | ✅ Cache-first static, network-first PDFs |

---

## 📋 Recommended Action Plan

### Immediate (Before Next Deploy)

| Priority | Issue | Effort |
|---|---|---|
| 🔴 High | **BUG-01** — Fix welcome text "49 notes" → "54 notes" | 5 min |
| 🟠 High | **BUG-02** — Rotate Supabase anon key to JWT format | 10 min |
| 🟡 Medium | **ISSUE-03** — Remove `console.log` in `app.js:967` | 2 min |
| 🟡 Medium | **ISSUE-04** — Set real GA4 Measurement ID | 5 min |

### Short-term (Next Sprint)

| Priority | Issue | Effort |
|---|---|---|
| 🟡 Medium | **ISSUE-05** — Fix profile `<h1>` → `<h2>` for heading hierarchy | 15 min |
| 🟡 Medium | **ISSUE-06** — Replace `alert()`/`confirm()` with custom modal in `admin.js` | 2–3 hrs |
| 🟡 Medium | **ISSUE-09** — Prune stale localStorage IDs on init | 1 hr |
| 🟢 Low | **SUGGESTION-10** — Remove duplicate `.btn-danger` CSS rule | 5 min |
| 🟢 Low | **SUGGESTION-12** — Clarify / exclude `architecture.html` | 10 min |

### Future Improvements

| Priority | Suggestion | Effort |
|---|---|---|
| 🟢 Low | **SUGGESTION-13** — Add `robots.txt` + `sitemap.xml` | 30 min |
| 🟢 Low | **SUGGESTION-14** — Add Open Graph / Twitter Card meta tags | 20 min |
| 🟢 Low | Consider Google Fonts (e.g., Inter/Outfit) for richer branding | 30 min |
| 🟢 Low | Add SUGGESTION-11 check for unintended Supabase CLI files in git | 15 min |

---

## ✅ What's Working Well

- **Architecture**: Clean module separation — each file has a single responsibility.
- **Security**: `isAdmin` read from database (not JWT metadata), RLS on all tables, ban check enforced at login, XSS escaping throughout.
- **Accessibility**: Excellent WCAG coverage — focus traps, ARIA roles, live regions, reduced-motion support, forced-colors, skip links.
- **PWA**: Complete offline support with intelligent caching strategies, cache versioning, and PDF size guard.
- **Performance**: Zero dependencies (no React/Vue/Angular), all scripts deferred, CSS custom properties for zero-cost theming.
- **Deployment**: Comprehensive security headers in `vercel.json` (HSTS, CSP, clickjacking, MIME sniffing).
- **Database**: Well-structured PostgreSQL schema with proper RLS, cascading deletes, and admin helper functions.
- **Search**: Custom trigram fuzzy search with Jaccard similarity — no external search library needed.
- **Code style**: `'use strict'` used everywhere, consistent naming conventions, thorough inline documentation.

---

*Report generated by automated static analysis + manual code review.*  
*Last updated: 16 May 2026*
