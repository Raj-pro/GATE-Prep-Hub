/**
 * GATE Prep Hub — admin.js
 * Admin panel: view all users, login logs, PDF views.
 * Edit / ban / delete users directly from the panel.
 */
'use strict';

(function () {
  const panel     = document.getElementById('admin-panel');
  const editModal = document.getElementById('admin-edit-modal');

  function sb() { return window.supabase; }
  function esc(str) {
    return String(str || '').replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
  }
  function fmt(ts) {
    if (!ts) return '—';
    return new Date(ts).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  }
  function shortAgent(ua) {
    if (!ua) return '—';
    if (/iPhone|iPad/.test(ua))  return 'iOS';
    if (/Android/.test(ua))      return 'Android — ' + (ua.match(/Chrome\/[\d.]+/) || ['Chrome'])[0];
    if (/Windows/.test(ua))      return 'Windows — ' + (ua.match(/(?:Chrome|Firefox|Edge)\/[\d.]+/) || ['Browser'])[0];
    if (/Mac/.test(ua))          return 'Mac — ' + (ua.match(/(?:Chrome|Firefox|Safari)\/[\d.]+/) || ['Browser'])[0];
    return ua.slice(0, 50);
  }

  /* ── Open / close panel ── */
  async function open() {
    const user = window.Auth?.user;
    if (!user?.isAdmin) {
      alert('Admin access required.');
      return;
    }
    panel.hidden = false;
    await render();
    window.Analytics?.track('admin_open');
  }
  function close() { panel.hidden = true; }

  /* ── Fetch from Supabase ── */
  async function fetchUsers() {
    try {
      const { data, error } = await sb().from('profiles')
        .select('id, name, email, is_pro, is_admin, is_banned, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) { console.warn('[Admin] fetchUsers:', e.message); return []; }
  }

  async function fetchLoginLogs() {
    try {
      const { data, error } = await sb().from('login_logs')
        .select('id, email, name, logged_in_at, user_agent')
        .order('logged_in_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    } catch (e) { console.warn('[Admin] fetchLoginLogs:', e.message); return []; }
  }

  async function fetchPdfViews() {
    try {
      const { data, error } = await sb().from('pdf_views')
        .select('id, email, pdf_id, pdf_name, subject, viewed_at')
        .order('viewed_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    } catch (e) { console.warn('[Admin] fetchPdfViews:', e.message); return []; }
  }

  /* ── User actions ── */
  async function updateUser(id, fields) {
    const { error } = await sb().from('profiles').update(fields).eq('id', id);
    if (error) throw error;
  }

  async function deleteUser(id, name) {
    if (!confirm(`Delete user "${name}"?\n\nThis removes their profile, login history and PDF view history. They can still log in until removed from Supabase Auth.`)) return;
    const { error } = await sb().from('profiles').delete().eq('id', id);
    if (error) { alert('Delete failed: ' + error.message); return; }
    await render();
  }

  /* ── Edit modal ── */
  function openEditModal(user) {
    document.getElementById('admin-edit-id').value        = user.id;
    document.getElementById('admin-edit-name').value      = user.name || '';
    document.getElementById('admin-edit-pro').checked     = !!user.is_pro;
    document.getElementById('admin-edit-admin').checked   = !!user.is_admin;
    document.getElementById('admin-edit-banned').checked  = !!user.is_banned;
    editModal.hidden = false;
  }
  function closeEditModal() { editModal.hidden = true; }

  function wireEditModal() {
    document.getElementById('admin-edit-close')?.addEventListener('click', closeEditModal);
    document.getElementById('admin-edit-cancel')?.addEventListener('click', closeEditModal);
    editModal?.addEventListener('click', e => { if (e.target === editModal) closeEditModal(); });

    document.getElementById('admin-edit-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const id     = document.getElementById('admin-edit-id').value;
      const name   = document.getElementById('admin-edit-name').value.trim();
      const isPro  = document.getElementById('admin-edit-pro').checked;
      const isAdm  = document.getElementById('admin-edit-admin').checked;
      const isBan  = document.getElementById('admin-edit-banned').checked;
      const saveBtn = document.getElementById('admin-edit-save');

      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving…';
      try {
        await updateUser(id, { name, is_pro: isPro, is_admin: isAdm, is_banned: isBan });
        closeEditModal();
        await render();
      } catch (err) {
        alert('Save failed: ' + err.message);
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save changes';
      }
    });
  }

  /* ── Main render ── */
  async function render() {
    panel.innerHTML = `
      <div class="admin-header">
        <button class="btn btn-ghost btn-sm" id="admin-close-btn">← Back to Hub</button>
        <span class="admin-title">🔧 Admin Panel</span>
        <span style="flex:1"></span>
        <button class="btn btn-primary btn-sm" id="admin-refresh-btn">↻ Refresh</button>
      </div>
      <div class="admin-body">
        <div style="text-align:center;padding:48px;color:var(--muted);font-size:14px">Loading…</div>
      </div>
    `;

    document.getElementById('admin-close-btn')?.addEventListener('click', close);
    document.getElementById('admin-refresh-btn')?.addEventListener('click', render);

    const [users, loginLogs, pdfViews] = await Promise.all([fetchUsers(), fetchLoginLogs(), fetchPdfViews()]);

    const hidden   = JSON.parse(localStorage.getItem('gh_admin_hidden') || '[]');
    const custom   = JSON.parse(localStorage.getItem('gh_admin_custom') || '[]');
    const subjects = window.App?.SUBJECTS || [];

    // Top PDFs
    const pdfCounts = {};
    pdfViews.forEach(v => {
      if (!pdfCounts[v.pdf_id]) pdfCounts[v.pdf_id] = { name: v.pdf_name, subject: v.subject, count: 0 };
      pdfCounts[v.pdf_id].count++;
    });
    const topPdfs = Object.values(pdfCounts).sort((a, b) => b.count - a.count).slice(0, 5);

    panel.querySelector('.admin-body').innerHTML = `

      <!-- Overview -->
      <section class="admin-section">
        <h2 class="admin-section-title">📊 Overview</h2>
        <div class="admin-stat-row">
          ${card('Registered Users', users.length, '#6382ff')}
          ${card('Total Logins', loginLogs.length, '#00d4aa')}
          ${card('PDF Views', pdfViews.length, '#a259ff')}
          ${card('Banned Users', users.filter(u => u.is_banned).length, '#ff4d6d')}
        </div>
      </section>

      <!-- Top PDFs -->
      <section class="admin-section">
        <h2 class="admin-section-title">🔥 Top 5 Most Viewed Notes</h2>
        <table class="admin-table">
          <thead><tr><th>#</th><th>Note</th><th>Subject</th><th>Views</th></tr></thead>
          <tbody>
            ${topPdfs.length ? topPdfs.map((r, i) => `
              <tr>
                <td style="color:var(--muted)">${i + 1}</td>
                <td>${esc(r.name)}</td>
                <td style="color:var(--muted);font-size:12px">${esc(r.subject)}</td>
                <td><strong style="color:var(--accent)">${r.count}</strong></td>
              </tr>
            `).join('') : '<tr><td colspan="4" style="color:var(--muted)">No data yet</td></tr>'}
          </tbody>
        </table>
      </section>

      <!-- Users -->
      <section class="admin-section">
        <h2 class="admin-section-title">👥 Users <span class="admin-badge">${users.length}</span></h2>
        <table class="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${users.length ? users.map(u => `
              <tr data-user-id="${u.id}">
                <td><strong>${esc(u.name || '—')}</strong></td>
                <td style="font-size:12px">${esc(u.email || '—')}</td>
                <td>
                  ${u.is_admin ? '<span style="color:#ff9f43;font-weight:700;font-size:11px">Admin</span>' : ''}
                  ${u.is_pro  ? '<span style="color:#00d4aa;font-weight:700;font-size:11px">Pro</span>'   : ''}
                  ${!u.is_admin && !u.is_pro ? '<span style="color:var(--muted);font-size:11px">User</span>' : ''}
                </td>
                <td>
                  ${u.is_banned
                    ? '<span style="color:#ff4d6d;font-weight:700;font-size:11px">🚫 Banned</span>'
                    : '<span style="color:#00d4aa;font-size:11px">Active</span>'}
                </td>
                <td style="font-size:11px;white-space:nowrap">${fmt(u.created_at)}</td>
                <td style="white-space:nowrap;display:flex;gap:6px;padding:8px 12px">
                  <button class="admin-action-btn edit-user-btn"
                    data-id="${u.id}"
                    data-name="${esc(u.name)}"
                    data-pro="${u.is_pro}"
                    data-admin="${u.is_admin}"
                    data-banned="${u.is_banned}"
                  >✏ Edit</button>
                  <button class="admin-action-btn ${u.is_banned ? '' : 'warn'} ban-user-btn"
                    data-id="${u.id}"
                    data-banned="${u.is_banned}"
                  >${u.is_banned ? 'Unban' : '🚫 Ban'}</button>
                  <button class="admin-action-btn danger delete-user-btn"
                    data-id="${u.id}"
                    data-name="${esc(u.name || u.email)}"
                  >🗑 Delete</button>
                </td>
              </tr>
            `).join('') : '<tr><td colspan="6" style="color:var(--muted)">No users — run the schema.sql and sync query first</td></tr>'}
          </tbody>
        </table>
      </section>

      <!-- Login History -->
      <section class="admin-section">
        <h2 class="admin-section-title">🔐 Login History <span class="admin-badge">${loginLogs.length}</span></h2>
        <table class="admin-table">
          <thead><tr><th>Name</th><th>Email</th><th>Logged In At</th><th>Device</th></tr></thead>
          <tbody>
            ${loginLogs.length ? loginLogs.map(l => `
              <tr>
                <td>${esc(l.name || '—')}</td>
                <td style="font-size:12px">${esc(l.email || '—')}</td>
                <td style="white-space:nowrap;font-size:12px">${fmt(l.logged_in_at)}</td>
                <td style="font-size:11px;color:var(--muted)">${esc(shortAgent(l.user_agent))}</td>
              </tr>
            `).join('') : '<tr><td colspan="4" style="color:var(--muted)">No logins recorded yet</td></tr>'}
          </tbody>
        </table>
      </section>

      <!-- PDF Views -->
      <section class="admin-section">
        <h2 class="admin-section-title">📄 PDF View Log <span class="admin-badge">${pdfViews.length}</span></h2>
        <table class="admin-table">
          <thead><tr><th>Email</th><th>PDF Note</th><th>Subject</th><th>Viewed At</th></tr></thead>
          <tbody>
            ${pdfViews.length ? pdfViews.map(v => `
              <tr>
                <td style="font-size:12px">${esc(v.email || '—')}</td>
                <td>${esc(v.pdf_name || v.pdf_id)}</td>
                <td style="color:var(--muted);font-size:12px">${esc(v.subject || '—')}</td>
                <td style="white-space:nowrap;font-size:12px">${fmt(v.viewed_at)}</td>
              </tr>
            `).join('') : '<tr><td colspan="4" style="color:var(--muted)">No views yet</td></tr>'}
          </tbody>
        </table>
      </section>

      <!-- Subject Visibility -->
      <section class="admin-section">
        <h2 class="admin-section-title">👁 Subject Visibility</h2>
        <table class="admin-table">
          <thead><tr><th>Icon</th><th>Subject</th><th>Notes</th><th>Visible</th></tr></thead>
          <tbody>
            ${subjects.map(sub => `
              <tr>
                <td>${sub.icon}</td>
                <td>${esc(sub.name)}</td>
                <td>${sub.pdfs.length}</td>
                <td>
                  <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
                    <input type="checkbox" class="admin-visibility-cb" data-subject-id="${sub.id}" ${hidden.includes(sub.id) ? '' : 'checked'} />
                    <span style="font-size:11px;color:var(--muted)">${hidden.includes(sub.id) ? 'Hidden' : 'Visible'}</span>
                  </label>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </section>

      <!-- Add Custom Note -->
      <section class="admin-section">
        <h2 class="admin-section-title">➕ Add Custom Note</h2>
        <form id="admin-add-form" style="display:grid;gap:10px;max-width:480px">
          <div class="field-group">
            <label class="field-label">Note Name</label>
            <input id="admin-note-name" type="text" class="field-input" placeholder="e.g. OS — Extra Reference" required />
          </div>
          <div class="field-group">
            <label class="field-label">File Path</label>
            <input id="admin-note-file" type="text" class="field-input" placeholder="gate book - Copy/…/extra.pdf" required />
          </div>
          <div class="field-group">
            <label class="field-label">Subject</label>
            <select id="admin-note-subject" class="field-input">
              ${subjects.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}
            </select>
          </div>
          <button type="submit" class="btn btn-primary" style="width:fit-content">Add Note</button>
        </form>
        ${custom.length ? `
          <h3 style="font-size:13px;font-weight:700;margin:20px 0 10px;color:var(--muted)">Custom notes (${custom.length})</h3>
          <table class="admin-table">
            <thead><tr><th>Name</th><th>Subject</th><th></th></tr></thead>
            <tbody>
              ${custom.map((c, idx) => `
                <tr>
                  <td>${esc(c.name)}</td>
                  <td>${esc(c.subjectName || '')}</td>
                  <td><button class="btn btn-ghost btn-sm admin-delete-custom" data-idx="${idx}">Remove</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
      </section>

      <!-- Danger -->
      <section class="admin-section">
        <h2 class="admin-section-title" style="color:var(--accent-err)">⚠ Danger Zone</h2>
        <button class="btn btn-danger btn-sm" id="admin-clear-btn">Clear all local browser data</button>
        <p style="font-size:11px;color:var(--muted);margin-top:8px">Clears favorites, bookmarks, annotations from this browser only.</p>
      </section>
    `;

    wirePanel(subjects, hidden, custom);
  }

  /* ── Stat card ── */
  function card(label, val, color) {
    return `
      <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px 20px;min-width:130px">
        <div style="font-size:26px;font-weight:900;color:${color}">${val}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:2px">${label}</div>
      </div>`;
  }

  /* ── Wire panel ── */
  function wirePanel(subjects, hidden, custom) {
    // Edit buttons
    panel.querySelectorAll('.edit-user-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        openEditModal({
          id:         btn.dataset.id,
          name:       btn.dataset.name,
          is_pro:     btn.dataset.pro === 'true',
          is_admin:   btn.dataset.admin === 'true',
          is_banned:  btn.dataset.banned === 'true',
        });
      });
    });

    // Ban/Unban buttons
    panel.querySelectorAll('.ban-user-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const isBanned = btn.dataset.banned === 'true';
        const action = isBanned ? 'Unban' : 'Ban';
        if (!confirm(`${action} this user?`)) return;
        btn.disabled = true;
        try {
          await updateUser(btn.dataset.id, { is_banned: !isBanned });
          await render();
        } catch (err) {
          alert('Failed: ' + err.message);
          btn.disabled = false;
        }
      });
    });

    // Delete buttons
    panel.querySelectorAll('.delete-user-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteUser(btn.dataset.id, btn.dataset.name));
    });

    // Subject visibility
    panel.querySelectorAll('.admin-visibility-cb').forEach(cb => {
      cb.addEventListener('change', () => {
        const newHidden = subjects.map(s => s.id).filter(id => {
          const box = panel.querySelector(`.admin-visibility-cb[data-subject-id="${id}"]`);
          return box && !box.checked;
        });
        localStorage.setItem('gh_admin_hidden', JSON.stringify(newHidden));
        cb.nextElementSibling.textContent = cb.checked ? 'Visible' : 'Hidden';
      });
    });

    // Add custom note
    document.getElementById('admin-add-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const name      = document.getElementById('admin-note-name').value.trim();
      const file      = document.getElementById('admin-note-file').value.trim();
      const subjectId = document.getElementById('admin-note-subject').value;
      const sub       = subjects.find(s => s.id === subjectId);
      if (!name || !file) return;
      const entry = { id: `custom_${Date.now()}`, name, file, num: 99, subjectId, subjectName: sub?.name || '' };
      const list  = JSON.parse(localStorage.getItem('gh_admin_custom') || '[]');
      list.push(entry);
      localStorage.setItem('gh_admin_custom', JSON.stringify(list));
      render();
    });

    // Delete custom note
    panel.querySelectorAll('.admin-delete-custom').forEach(btn => {
      btn.addEventListener('click', () => {
        const list = JSON.parse(localStorage.getItem('gh_admin_custom') || '[]');
        list.splice(parseInt(btn.dataset.idx, 10), 1);
        localStorage.setItem('gh_admin_custom', JSON.stringify(list));
        render();
      });
    });

    // Clear local data
    document.getElementById('admin-clear-btn')?.addEventListener('click', () => {
      if (!confirm('Clear ALL local data? This cannot be undone.')) return;
      ['gh_favorites','gh_viewed','gh_bookmarks','gh_annotations',
       'gh_event_log','gh_admin_hidden','gh_admin_custom'].forEach(k => localStorage.removeItem(k));
      location.reload();
    });
  }

  wireEditModal();
  window.Admin = { open, close };
})();
