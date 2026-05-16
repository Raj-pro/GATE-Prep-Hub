/**
 * GATE Prep Hub — auth.js
 * Authentication via Supabase Auth v2.
 *
 * Depends on: supabase.js (must be loaded first — window.supabase must be the client)
 *
 * Features:
 *   ✓ Sign-in with email + password
 *   ✓ Sign-up with name stored in user_metadata
 *   ✓ Email-confirmation flow (shows "check inbox" state)
 *   ✓ Forgot-password via Supabase resetPasswordForEmail
 *   ✓ Session auto-restore on page reload (Supabase handles this)
 *   ✓ Auth-state listener → notifies app.js via window.onAuthStateChange
 *   ✓ ARIA-accessible modal with focus trap
 */
'use strict';

(function () {
  /* ── Helpers ── */
  const sb = () => window.supabase; // Supabase client (from supabase.js)

  function $(id) { return document.getElementById(id); }

  /* ── DOM refs ── */
  const modal         = $('auth-modal');
  const modalClose    = $('auth-modal-close');
  const tabLoginBtn   = $('tab-login-btn');
  const tabRegBtn     = $('tab-register-btn');
  const tabLogin      = $('tab-login');
  const tabRegister   = $('tab-register');
  const loginForm     = $('login-form');
  const registerForm  = $('register-form');
  const loginEmail    = $('login-email');
  const loginPassword = $('login-password');
  const loginSubmit   = $('login-submit-btn');
  const regName       = $('reg-name');
  const regEmail      = $('reg-email');
  const regPassword   = $('reg-password');
  const regSubmit     = $('reg-submit-btn');
  const forgotBtn     = $('forgot-password-btn');
  const strengthEl    = $('password-strength');
  const authBtn       = $('auth-btn');
  /* ── Normalise Supabase user → our internal shape ── */
  function toUser(sbUser) {
    if (!sbUser) return null;
    const meta = sbUser.user_metadata || {};
    return {
      id:      sbUser.id,
      email:   sbUser.email,
      name:    meta.name || sbUser.email?.split('@')[0] || 'User',
      isAdmin: false,   // resolved from profiles table — never from user_metadata
    };
  }

  /* Resolve admin status from the profiles table — never trust user_metadata for this. */
  async function fetchIsAdmin(userId) {
    try {
      const { data } = await sb().from('profiles').select('is_admin').eq('id', userId).maybeSingle();
      return data?.is_admin === true;
    } catch { return false; }
  }

  /* ── Current user (kept in sync by onAuthStateChange) ── */
  let currentUser = null;

  /* ── Cache key for instant UI restore on refresh ── */
  const USER_CACHE_KEY = 'gh_user_cache';

  function saveUserCache(user) {
    if (!user) { localStorage.removeItem(USER_CACHE_KEY); return; }
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify({
      id:      user.id,
      name:    user.name,
      email:   user.email,
      isAdmin: user.isAdmin || false,
    }));
  }

  /** Read cached user synchronously — used for instant UI restore before Supabase verifies */
  function readUserCache() {
    try { return JSON.parse(localStorage.getItem(USER_CACHE_KEY) || 'null'); }
    catch { return null; }
  }

  /* ── Notify app.js whenever auth state changes ── */
  function notifyApp(user) {
    currentUser = user;
    // Only clear the cache when explicitly logging out (user === null).
    // When user is valid, always save/update the cache.
    if (user) {
      saveUserCache(user);
    } else {
      localStorage.removeItem(USER_CACHE_KEY);
    }
    if (typeof window.onAuthStateChange === 'function') {
      window.onAuthStateChange(user);
    }
  }

  /* ─────────────────────────────────────────────
     Modal open / close
  ───────────────────────────────────────────── */
  function openModal(tab = 'login') {
    if (!modal) return;
    modal.hidden = false;
    const map = { login: showLoginTab, register: showRegisterTab };
    (map[tab] || showLoginTab)();
    requestAnimationFrame(() => {
      (modal.querySelector('input:not([type=hidden])') || modal.querySelector('button'))?.focus();
    });
    modal.addEventListener('keydown', trapFocus);
    window.Analytics?.track('auth_modal_open', { tab });
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    modal.removeEventListener('keydown', trapFocus);
    authBtn?.focus();
  }

  /* ── Focus trap ── */
  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const els = [...modal.querySelectorAll('button,input,textarea,a,[tabindex="0"]')]
      .filter(el => !el.hidden && !el.disabled && !el.closest('[hidden]'));
    if (!els.length) return;
    const first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first)  { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ─────────────────────────────────────────────
     Tab switching
  ───────────────────────────────────────────── */
  function setActiveTab(name) {
    tabLogin.hidden    = name !== 'login';
    tabRegister.hidden = name !== 'register';
    tabLoginBtn.classList.toggle('active', name === 'login');
    tabLoginBtn.setAttribute('aria-selected', name === 'login');
    tabRegBtn.classList.toggle('active', name === 'register');
    tabRegBtn.setAttribute('aria-selected', name === 'register');
  }

  function showLoginTab()    { setActiveTab('login'); }
  function showRegisterTab() { setActiveTab('register'); }

  /* ─────────────────────────────────────────────
     Validation
  ───────────────────────────────────────────── */
  function setFieldError(inputId, errId, msg) {
    const input = $(inputId), err = $(errId);
    input?.classList.toggle('error', !!msg);
    if (err) err.textContent = msg || '';
  }
  function clearErrors(...errIds) {
    errIds.forEach(id => setFieldError(id.replace('-error', ''), id, ''));
  }
  function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address.';
  }
  function validatePassword(v) {
    return v.length >= 8 ? '' : 'Password must be at least 8 characters.';
  }

  /* ── Password strength meter ── */
  function checkStrength(pw) {
    let score = 0;
    if (pw.length >= 8)           score++;
    if (pw.length >= 12)          score++;
    if (/[A-Z]/.test(pw))         score++;
    if (/[0-9]/.test(pw))         score++;
    if (/[^A-Za-z0-9]/.test(pw))  score++;
    const levels = [
      { w: '0%',   color: 'transparent',       label: '' },
      { w: '25%',  color: 'var(--accent-err)',  label: 'Weak' },
      { w: '50%',  color: 'var(--accent-warn)', label: 'Fair' },
      { w: '75%',  color: 'var(--accent)',      label: 'Good' },
      { w: '100%', color: 'var(--accent-3)',    label: 'Strong' },
    ];
    const m = levels[Math.min(score, 4)];
    strengthEl?.style.setProperty('--strength-w', m.w);
    strengthEl?.style.setProperty('--strength-color', m.color);
    strengthEl?.setAttribute('aria-label', `Password strength: ${m.label}`);
  }

  /* ── Button loading state ── */
  function setLoading(btn, loading, defaultLabel) {
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? 'Please wait…' : defaultLabel;
  }

  /* ─────────────────────────────────────────────
     Toast helper
  ───────────────────────────────────────────── */
  function showToast(msg, type = '', duration = 3500) {
    const el = document.createElement('li');
    el.className = `toast${type ? ' toast-' + type : ''}`;
    el.textContent = msg;
    $('toast-container').appendChild(el);
    setTimeout(() => {
      el.style.animation = 'toast-out .22s ease forwards';
      setTimeout(() => el.remove(), 250);
    }, duration);
  }

  /* ─────────────────────────────────────────────
     Show "check your email" confirmation state
  ───────────────────────────────────────────── */
  function showEmailConfirmation(email) {
    if (!tabRegister) return;
    tabRegister.innerHTML = `
      <div style="text-align:center;padding:16px 0">
        <div style="font-size:48px;margin-bottom:16px">📬</div>
        <h2 class="modal-title">Check your inbox</h2>
        <p class="modal-subtitle" style="margin-bottom:20px">
          We sent a confirmation link to <strong>${escHtml(email)}</strong>.<br/>
          Click it to activate your account, then sign in.
        </p>
        <button class="btn btn-ghost btn-full" id="back-to-login-btn">← Back to sign in</button>
      </div>
    `;
    $('back-to-login-btn')?.addEventListener('click', showLoginTab);
  }

  /* ─────────────────────────────────────────────
     Supabase Auth calls
  ───────────────────────────────────────────── */

  /** Sign in with email + password */
  async function signIn(email, password) {
    const client = sb();
    if (!client) throw new Error('Supabase client not initialised. Fill in supabase.js credentials.');

    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw new Error(friendlyError(error));
    const user = toUser(data.user);

    // Check ban status and read admin flag in one query
    const { data: profile } = await client.from('profiles').select('is_banned, is_admin').eq('id', data.user.id).maybeSingle();
    if (profile?.is_banned) {
      await client.auth.signOut();
      throw new Error('Your account has been suspended. Contact support.');
    }
    user.isAdmin = profile?.is_admin === true;

    // Log login event to Supabase (non-blocking)
    client.from('login_logs').insert({
      user_id:    data.user.id,
      email:      data.user.email,
      name:       user.name,
      user_agent: navigator.userAgent.slice(0, 300),
    }).then(() => {}).catch(() => {});

    return user;
  }

  /** Sign up — name stored in user_metadata */
  async function signUp(name, email, password) {
    const client = sb();
    if (!client) throw new Error('Supabase client not initialised.');

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { name, is_admin: false },
        /*
         * emailRedirectTo is where Supabase sends the user after
         * clicking the confirmation link in their email.
         * Adjust this to your deployed URL in production.
         */
        emailRedirectTo: location.origin + location.pathname,
      },
    });
    if (error) throw new Error(friendlyError(error));
    return { user: toUser(data.user), session: data.session };
  }

  /** Password reset email */
  async function resetPassword(email) {
    const client = sb();
    if (!client) throw new Error('Supabase client not initialised.');

    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: location.origin + location.pathname + '?reset=1',
    });
    if (error) throw new Error(friendlyError(error));
  }

  // Flag: prevents getSession() / onAuthStateChange callbacks from
  // re-logging the user in while sign-out is in progress.
  let _signingOut = false;

  /** Sign out */
  async function signOut() {
    _signingOut = true;

    // Wipe cache synchronously — before any async work
    localStorage.removeItem(USER_CACHE_KEY);
    localStorage.removeItem('gh_favorites');
    localStorage.removeItem('gh_bookmarks');

    // Invalidate Supabase session
    const client = sb();
    if (client) await client.auth.signOut();

    // Update app state + UI
    notifyApp(null);
    window.Analytics?.track('auth_logout');

    _signingOut = false;

    // Redirect to landing page
    window.location.href = '/';
  }

  /** Handle ?reset=1 return from password-reset email */
  function handlePasswordResetReturn() {
    const params = new URLSearchParams(location.search);
    if (params.get('reset') !== '1') return;
    history.replaceState(null, '', location.pathname);
    // Supabase sets the session from the URL hash — user is now signed in
    openModal('login');
    showNewPasswordForm();
  }

  /** Replace the login tab with a "set new password" form */
  function showNewPasswordForm() {
    if (!tabLogin) return;
    tabLogin.innerHTML = `
      <h2 class="modal-title">Set new password</h2>
      <p class="modal-subtitle">Enter a new password for your account.</p>
      <form id="new-pw-form" novalidate>
        <div class="field-group">
          <label for="new-pw-input" class="field-label">New Password</label>
          <div class="password-wrap">
            <input id="new-pw-input" type="password" class="field-input"
              autocomplete="new-password" required placeholder="Min 8 characters" />
            <button type="button" class="password-toggle" data-target="new-pw-input"
              aria-label="Show password">👁</button>
          </div>
          <span class="field-error" id="new-pw-error" role="alert"></span>
        </div>
        <button type="submit" class="btn btn-primary btn-full" id="new-pw-submit">Update Password</button>
      </form>
    `;
    tabLogin.querySelector('.password-toggle')?.addEventListener('click', () => {
      const input = document.getElementById('new-pw-input');
      const btn   = tabLogin.querySelector('.password-toggle');
      if (!input || !btn) return;
      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';
      btn.textContent = isText ? '👁' : '🙈';
      btn.setAttribute('aria-label', isText ? 'Show password' : 'Hide password');
    });
    document.getElementById('new-pw-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const pw    = document.getElementById('new-pw-input').value;
      const errEl = document.getElementById('new-pw-error');
      const pwErr = validatePassword(pw);
      if (pwErr) { if (errEl) errEl.textContent = pwErr; return; }
      const submitBtn = document.getElementById('new-pw-submit');
      setLoading(submitBtn, true, 'Update Password');
      try {
        const { error } = await sb().auth.updateUser({ password: pw });
        if (error) throw new Error(friendlyError(error));
        showToast('Password updated. You are now signed in.', 'success', 5000);
        closeModal();
      } catch (err) {
        if (errEl) errEl.textContent = err.message;
      } finally {
        setLoading(submitBtn, false, 'Update Password');
      }
    });
  }

  /* ─────────────────────────────────────────────
     Map Supabase error codes → friendly messages
  ───────────────────────────────────────────── */
  function friendlyError(error) {
    const msg   = error?.message || '';
    const code  = error?.code    || error?.status;
    if (msg.includes('Invalid login credentials'))    return 'Incorrect email or password.';
    if (msg.includes('Email not confirmed'))          return 'Please confirm your email before signing in.';
    if (msg.includes('User already registered'))      return 'An account with this email already exists.';
    if (msg.includes('Password should be at least'))  return 'Password must be at least 6 characters.';
    if (msg.includes('Email rate limit exceeded'))    return 'Too many attempts. Please wait a few minutes.';
    if (msg.includes('network'))                      return 'Network error. Check your connection.';
    if (code === 429)                                 return 'Too many requests. Please slow down.';
    return msg || 'Something went wrong. Please try again.';
  }

  /* ─────────────────────────────────────────────
     Session restore on page load
  ───────────────────────────────────────────── */
  async function restoreSession() {
    const client = sb();

    // Step 1: Restore from localStorage cache immediately (synchronous, instant UI)
    const cached = readUserCache();
    if (cached) {
      currentUser = cached; // set silently — inline script already updated the UI
    }

    // Step 2: If Supabase client is unavailable (env vars not set), stay with cache
    if (!client) return;

    // Step 3: Listen for auth events
    // RULE: only SIGNED_OUT should ever log the user out.
    // Every other event (INITIAL_SESSION, TOKEN_REFRESHED, USER_UPDATED) with a valid
    // session updates the user. Without a session, we do nothing — we trust the cache.
    client.auth.onAuthStateChange(async (event, session) => {
      // Skip all callbacks while sign-out is in progress — prevents re-login race condition
      if (_signingOut) return;

      if (event === 'SIGNED_OUT') {
        // Explicit logout — wipe everything
        notifyApp(null);
        window.Analytics?.track('auth_signed_out');
        return;
      }

      if (session?.user) {
        // Valid session — update user info
        const user = toUser(session.user);
        user.isAdmin = await fetchIsAdmin(user.id);
        notifyApp(user);
        if (event === 'SIGNED_IN')       window.Analytics?.track('auth_login_confirmed', { userId: user.id });
        if (event === 'TOKEN_REFRESHED') console.debug('[Auth] token refreshed');
        if (event === 'USER_UPDATED')    window.Analytics?.track('auth_user_updated', { userId: user.id });
      }
      // If session is null for any other event — do nothing, keep cached user.
      // Supabase fires INITIAL_SESSION briefly with null before reading localStorage.
    });

    // Step 4: Confirm session with Supabase in background.
    // If valid → update user. If null → do NOT logout (trust the cache + autoRefreshToken).
    try {
      const { data } = await client.auth.getSession();
      if (!_signingOut && data.session?.user) {
        const user = toUser(data.session.user);
        user.isAdmin = await fetchIsAdmin(user.id);
        notifyApp(user);
      }
      // No else — getSession returning null is NOT a logout signal.
      // The SIGNED_OUT event is the only legitimate logout trigger.
    } catch (e) {
      console.warn('[Auth] getSession failed:', e.message);
      // Network error — keep cached user, don't logout
    }
  }

  /* ─────────────────────────────────────────────
     Wire DOM events
  ───────────────────────────────────────────── */
  function wire() {
    /* Open modal */
    authBtn?.addEventListener('click', () => openModal('login'));

    /* Close modal */
    modalClose?.addEventListener('click', closeModal);
    modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
    });

    /* Tab buttons */
    tabLoginBtn?.addEventListener('click', showLoginTab);
    tabRegBtn?.addEventListener('click', showRegisterTab);

    /* Password visibility toggles */
    document.querySelectorAll('.password-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = $(btn.dataset.target);
        if (!input) return;
        const isText = input.type === 'text';
        input.type = isText ? 'password' : 'text';
        btn.setAttribute('aria-label', isText ? 'Show password' : 'Hide password');
        btn.textContent = isText ? '👁' : '🙈';
      });
    });

    /* Strength meter */
    regPassword?.addEventListener('input', () => checkStrength(regPassword.value));

    /* Forgot password */
    forgotBtn?.addEventListener('click', async () => {
      const email = loginEmail.value.trim();
      if (!email) {
        setFieldError('login-email', 'login-email-error', 'Enter your email to receive a reset link.');
        return;
      }
      const emailErr = validateEmail(email);
      if (emailErr) { setFieldError('login-email', 'login-email-error', emailErr); return; }

      forgotBtn.disabled = true;
      forgotBtn.textContent = 'Sending…';
      try {
        await resetPassword(email);
        showToast(`Reset link sent to ${email}. Check your inbox.`, 'success', 6000);
        window.Analytics?.track('auth_forgot_password', { email });
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        forgotBtn.disabled = false;
        forgotBtn.textContent = 'Forgot password?';
      }
    });

    /* ── Login form ── */
    loginForm?.addEventListener('submit', async e => {
      e.preventDefault();
      clearErrors('login-email-error', 'login-password-error');

      const emailErr = validateEmail(loginEmail.value);
      if (emailErr) { setFieldError('login-email', 'login-email-error', emailErr); return; }
      if (!loginPassword.value) {
        setFieldError('login-password', 'login-password-error', 'Password is required.');
        return;
      }

      setLoading(loginSubmit, true, 'Sign In');
      try {
        const user = await signIn(loginEmail.value.trim().toLowerCase(), loginPassword.value);
        notifyApp(user);
        showToast(`Welcome back, ${user.name}!`, 'success');
        window.Analytics?.track('auth_login', { method: 'email' });
        closeModal();
      } catch (err) {
        setFieldError('login-password', 'login-password-error', err.message);
      } finally {
        setLoading(loginSubmit, false, 'Sign In');
      }
    });

    /* ── Register form ── */
    registerForm?.addEventListener('submit', async e => {
      e.preventDefault();
      clearErrors('reg-name-error', 'reg-email-error', 'reg-password-error');

      if (!regName.value.trim()) {
        setFieldError('reg-name', 'reg-name-error', 'Name is required.'); return;
      }
      const emailErr = validateEmail(regEmail.value);
      if (emailErr) { setFieldError('reg-email', 'reg-email-error', emailErr); return; }
      const passErr = validatePassword(regPassword.value);
      if (passErr)  { setFieldError('reg-password', 'reg-password-error', passErr); return; }

      setLoading(regSubmit, true, 'Create Account');
      try {
        const { user, session } = await signUp(
          regName.value.trim(),
          regEmail.value.trim().toLowerCase(),
          regPassword.value
        );

        window.Analytics?.track('auth_register', { method: 'email' });

        if (session) {
          notifyApp(user);
          showToast(`Welcome, ${user.name}! 🎉`, 'success');
          closeModal();
        } else {
          showEmailConfirmation(regEmail.value.trim());
        }
      } catch (err) {
        setFieldError('reg-email', 'reg-email-error', err.message);
      } finally {
        setLoading(regSubmit, false, 'Create Account');
      }
    });

    /* Logout from user menu */
    $('logout-btn')?.addEventListener('click', async () => {
      const dd = $('user-dropdown'); if (dd) dd.hidden = true;
      const btn = $('logout-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Signing out…'; }
      await signOut();
    });
  }

  /* ─────────────────────────────────────────────
     Escape HTML
  ───────────────────────────────────────────── */
  function escHtml(str) {
    return String(str).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
  }

  /* ─────────────────────────────────────────────
     Bootstrap
  ───────────────────────────────────────────── */
  wire();
  restoreSession();
  handlePasswordResetReturn();

  /* ── Public API (used by app.js / admin.js) ── */
  window.Auth = {
    openModal,
    closeModal,
    signOut,
    get user() { return currentUser; },
  };
})();
