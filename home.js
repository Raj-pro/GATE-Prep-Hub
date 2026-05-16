/**
 * GATE Prep Hub — home.js
 * Landing page shown before the main app shell.
 * Clicking any CTA hides the home page and reveals #app.
 */
'use strict';

(function () {
  const homePage = document.getElementById('home-page');
  if (!homePage) return;

  /* ── Navigate to the Book Hub ──
     On Vercel: /hub (clean URL via rewrite)
     Locally:   /hub.html                    */
  const HUB_URL = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? '/hub.html'
    : '/hub';

  function enterApp() {
    homePage.style.opacity = '0';
    homePage.style.transform = 'translateY(-10px)';
    homePage.style.transition = 'opacity .25s ease, transform .25s ease';
    setTimeout(() => { window.location.href = HUB_URL; }, 260);
  }

  function enterAppSignIn() {
    homePage.style.opacity = '0';
    homePage.style.transform = 'translateY(-10px)';
    homePage.style.transition = 'opacity .25s ease, transform .25s ease';
    setTimeout(() => { window.location.href = HUB_URL + '?signin=1'; }, 260);
  }

  /* ── Inject home page styles ── */
  const style = document.createElement('style');
  style.textContent = `
    .home-page {
      min-height: 100vh;
      background: var(--bg);
      color: var(--text);
      font-family: inherit;
      transition: opacity .28s ease, transform .28s ease;
      overflow-x: hidden;
    }
    .home-wrapper {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 24px;
    }

    /* Nav */
    .home-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 0;
      border-bottom: 1px solid var(--border);
    }
    .home-nav-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 800;
      font-size: 18px;
      text-decoration: none;
      color: inherit;
      cursor: pointer;
    }
    .home-nav-logo .logo-icon { font-size: 22px; }
    .home-nav-logo .logo-tag {
      background: var(--accent);
      color: #fff;
      font-size: 10px;
      padding: 1px 6px;
      border-radius: 4px;
      font-weight: 900;
      letter-spacing: .04em;
    }
    .home-nav-actions { display: flex; gap: 10px; align-items: center; }

    /* Hero */
    .home-hero {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      align-items: center;
      padding: 72px 0 60px;
    }
    @media (max-width: 700px) {
      .home-hero { grid-template-columns: 1fr; padding: 48px 0 32px; }
      .home-hero-visual { display: none; }
    }
    .home-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 99px;
      padding: 5px 14px;
      font-size: 12px;
      color: var(--accent);
      font-weight: 600;
      margin-bottom: 20px;
    }
    .home-title {
      font-size: clamp(36px, 6vw, 58px);
      font-weight: 900;
      line-height: 1.1;
      margin: 0 0 18px;
      letter-spacing: -.02em;
    }
    .home-title-accent {
      background: linear-gradient(135deg, var(--accent) 0%, #a259ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .home-subtitle {
      font-size: 17px;
      color: var(--muted);
      line-height: 1.6;
      margin: 0 0 32px;
      max-width: 480px;
    }
    .home-cta-group {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .home-cta-btn {
      padding: 14px 28px;
      font-size: 15px;
      font-weight: 700;
      border-radius: 12px;
    }
    .home-cta-note { font-size: 12px; color: var(--muted); }

    /* Hero visual card */
    .home-hero-visual {
      display: flex;
      justify-content: center;
    }
    .home-hero-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 24px;
      width: 260px;
      box-shadow: 0 24px 64px rgba(0,0,0,.4);
      position: relative;
    }
    .home-hero-card::before {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: 20px;
      background: linear-gradient(135deg, var(--accent), #a259ff);
      z-index: -1;
      opacity: .5;
    }
    .home-hero-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    /* Stats */
    .home-stats {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px 32px;
      margin-bottom: 72px;
      flex-wrap: wrap;
    }
    .home-stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 0 40px;
    }
    .home-stat-item strong {
      font-size: 32px;
      font-weight: 900;
      color: var(--accent);
    }
    .home-stat-item span { font-size: 12px; color: var(--muted); }
    .home-stat-divider {
      width: 1px;
      height: 40px;
      background: var(--border);
    }
    @media (max-width: 600px) {
      .home-stats { gap: 16px; padding: 20px; }
      .home-stat-item { padding: 0 16px; }
      .home-stat-divider { display: none; }
    }

    /* Section title */
    .home-section-title {
      text-align: center;
      font-size: 28px;
      font-weight: 800;
      margin: 0 0 36px;
      letter-spacing: -.02em;
    }

    /* Features */
    .home-features { margin-bottom: 72px; }
    .home-features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }
    .home-feature-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      transition: border-color .2s, transform .2s;
    }
    .home-feature-card:hover {
      border-color: var(--accent);
      transform: translateY(-2px);
    }
    .home-feature-icon { font-size: 28px; margin-bottom: 12px; }
    .home-feature-title { font-size: 15px; font-weight: 700; margin: 0 0 8px; }
    .home-feature-desc { font-size: 13px; color: var(--muted); line-height: 1.55; margin: 0; }

    /* Subjects */
    .home-subjects { margin-bottom: 72px; }
    .home-subjects-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
    }
    .home-subject-chip {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 99px;
      padding: 8px 18px;
      font-size: 13px;
      font-weight: 600;
      transition: border-color .2s, color .2s;
      cursor: default;
    }
    .home-subject-chip:hover { border-color: var(--accent); color: var(--accent); }

    /* Final CTA */
    .home-final-cta {
      text-align: center;
      padding: 64px 0;
      border-top: 1px solid var(--border);
      margin-bottom: 0;
    }
    .home-final-title { font-size: 36px; font-weight: 900; margin: 0 0 12px; }
    .home-final-sub { font-size: 15px; color: var(--muted); margin: 0 0 28px; }

    /* Footer */
    .home-footer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 24px 0;
      font-size: 12px;
      color: var(--muted);
      border-top: 1px solid var(--border);
    }
  `;
  document.head.appendChild(style);

  /* ── Render ── */
  homePage.innerHTML = `
    <div class="home-wrapper">

      <!-- Nav -->
      <nav class="home-nav">
        <a href="/" class="home-nav-logo" aria-label="GATE Prep Hub home">
          <span class="logo-icon">📚</span>
          <span>GATE Prep <span class="logo-tag">HUB</span></span>
        </a>
        <div class="home-nav-actions">
          <button class="btn btn-ghost btn-sm" id="home-signin-btn">Sign In</button>
          <button class="btn btn-primary btn-sm" id="home-nav-start">Browse Notes →</button>
        </div>
      </nav>

      <!-- Hero -->
      <section class="home-hero">
        <div class="home-hero-content">
          <div class="home-badge">🎓 GATE CS Preparation</div>
          <h1 class="home-title">
            Study Smart.<br/>
            <span class="home-title-accent">Crack GATE.</span>
          </h1>
          <p class="home-subtitle">
            49 carefully curated notes across 12 subjects — bookmark pages,
            annotate PDFs, and track your progress. Everything in one place.
          </p>
          <div class="home-cta-group">
            <button class="btn btn-primary home-cta-btn" id="home-cta-main">
              Start Studying — It's Free
            </button>
            <span class="home-cta-note">No credit card required</span>
          </div>
        </div>

        <div class="home-hero-visual" aria-hidden="true">
          <div class="home-hero-card">
            <div class="home-hero-card-top">
              <span style="font-size:20px">📖</span>
              <span style="font-size:11px;color:var(--muted)">Currently reading</span>
            </div>
            <div style="font-size:14px;font-weight:700;margin:10px 0 4px">OS — Core Notes</div>
            <div style="font-size:11px;color:var(--muted)">Operating Systems</div>
            <div style="margin:14px 0 4px;height:5px;background:var(--border);border-radius:4px">
              <div style="width:62%;height:100%;background:linear-gradient(90deg,var(--accent),#a259ff);border-radius:4px"></div>
            </div>
            <div style="font-size:10px;color:var(--muted)">62% complete</div>
            <div style="margin-top:16px;display:flex;gap:8px">
              <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:8px 12px;font-size:11px;flex:1;text-align:center">
                🔖 3 bookmarks
              </div>
              <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:8px 12px;font-size:11px;flex:1;text-align:center">
                📝 2 notes
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats -->
      <div class="home-stats">
        <div class="home-stat-item"><strong>49</strong><span>Notes</span></div>
        <div class="home-stat-divider"></div>
        <div class="home-stat-item"><strong>12</strong><span>Subjects</span></div>
        <div class="home-stat-divider"></div>
        <div class="home-stat-item"><strong>100%</strong><span>Free</span></div>
        <div class="home-stat-divider"></div>
        <div class="home-stat-item"><strong>∞</strong><span>Bookmarks</span></div>
      </div>

      <!-- Features -->
      <section class="home-features">
        <h2 class="home-section-title">Everything you need to prepare</h2>
        <div class="home-features-grid">
          ${feat('📚', 'Subject-wise Notes', 'All major GATE CS topics — DS, Algorithms, OS, DBMS, CN, TOC and more.')}
          ${feat('🔖', 'Page Bookmarks', 'Bookmark any page in any PDF and jump back instantly. Synced to your account.')}
          ${feat('❤', 'Favorites', 'Star your most-used notes for instant access from the sidebar.')}
          ${feat('📝', 'Annotations', 'Add private study notes to any PDF. Your own digital margin.')}
          ${feat('📊', 'Progress Tracking', 'Track how many notes you have viewed per subject. Stay on schedule.')}
          ${feat('🌙', 'Offline Support', 'Previously viewed notes are cached and work without internet.')}
        </div>
      </section>

      <!-- Subjects -->
      <section class="home-subjects">
        <h2 class="home-section-title">12 Subjects Covered</h2>
        <div class="home-subjects-grid">
          ${['💾 C & Data Structures','⚙️ Algorithms','🔁 Theory of Computation',
             '🛠 Compiler Design','🖥 Operating Systems','🗄 DBMS',
             '🌐 Computer Networks','🏗 Computer Organization',
             '➕ Discrete Mathematics','🔢 Digital Logic',
             '🧮 Linear Algebra','📐 Engineering Maths']
            .map(s => `<div class="home-subject-chip">${s}</div>`).join('')}
        </div>
      </section>

      <!-- Final CTA -->
      <section class="home-final-cta">
        <h2 class="home-final-title">Ready to start?</h2>
        <p class="home-final-sub">Join GATE aspirants who study smarter every day.</p>
        <button class="btn btn-primary home-cta-btn" id="home-cta-bottom">
          Browse All Notes →
        </button>
      </section>

      <!-- Footer -->
      <footer class="home-footer">
        <span>© ${new Date().getFullYear()} GATE Prep Hub</span>
        <span>|</span>
        <span>Built for GATE CS aspirants</span>
      </footer>

    </div>
  `;

  /* Feature card helper */
  function feat(icon, title, desc) {
    return `
      <div class="home-feature-card">
        <div class="home-feature-icon">${icon}</div>
        <h3 class="home-feature-title">${title}</h3>
        <p class="home-feature-desc">${desc}</p>
      </div>`;
  }

  /* Wire buttons */
  document.getElementById('home-nav-start')?.addEventListener('click', enterApp);
  document.getElementById('home-cta-main')?.addEventListener('click', enterApp);
  document.getElementById('home-cta-bottom')?.addEventListener('click', enterApp);
  document.getElementById('home-signin-btn')?.addEventListener('click', enterAppSignIn);
})();
