/**
 * GATE Prep Hub — app.js
 * Main application controller
 */
'use strict';

/* ─────────────────────────────────────────────
   Data — subjects & PDFs
───────────────────────────────────────────── */
const SUBJECTS = [
  {
    id: 's01', name: 'C & Data Structures', icon: '💾',
    color: '#6382ff', gradient: 'linear-gradient(135deg,#6382ff22,#a259ff22)',
    pdfs: [
      { id: 'p0101', num: 1,  name: 'C & DS — Core Notes',            file: 'gate book - Copy/01_C_&_Data_Structure_Notes/1 ((((((0))))).C&DS(www.gatenotes.in).pdf',                                              driveId: '1wAUVgspBwtfnVUVK3XJ03fzZ_CEf-1Vv' },
      { id: 'p0102', num: 3,  name: 'DS — Made Easy Toppers Notes',   file: 'gate book - Copy/01_C_&_Data_Structure_Notes/3 ((((0)))) .DS_made Easy Class Toppers Latest Notes(www.gatenotes.in).pdf',          driveId: '1VW8C_zeOP4CmFw8-usaJU-ijiLBq9opb' },
      { id: 'p0103', num: 4,  name: 'Ace Academy — Data Structures',  file: 'gate book - Copy/01_C_&_Data_Structure_Notes/4 ((((((0))))) .Ace Academy Data Structure Class Notes(www.gatenotes.in).pdf',        driveId: '1P9_OLuRIGTidgkSXhYod1yg5xQ24KonG' },
      { id: 'p0104', num: 7,  name: 'DS — GATE Applied Course',       file: 'gate book - Copy/01_C_&_Data_Structure_Notes/7 ((((0)))) .DATA STRUCTURE-GATEAppliedcourse NOTES(www.gatenotes.in).pdf',           driveId: '1jrOCQ4VKG6QkJFbqvaSFLx0BVPa_qssJ' },
      { id: 'p0105', num: 9,  name: 'DS — Complete Notes',            file: 'gate book - Copy/01_C_&_Data_Structure_Notes/9 ((((((0)))))).DS Notes(www.gatenotes.in).pdf',                                       driveId: '14zi8aXw-pZGbZQOc5rb1V5yCNpTmrEjz' },
    ],
  },
  {
    id: 's02', name: 'Algorithms', icon: '⚙️',
    color: '#a259ff', gradient: 'linear-gradient(135deg,#a259ff22,#6382ff22)',
    pdfs: [
      { id: 'p0201', num: 1, name: 'Algorithm — Core Notes',      file: 'gate book - Copy/02_Algorithm_Notes/1  (((0)))) .Algorithm(www.gatenotes.in).pdf',              driveId: '12Z3bQFX-NrBB9nMKeSlSugOs0G6eAOtL' },
      { id: 'p0202', num: 2, name: 'Algo — Sanchit Sir Notes',    file: 'gate book - Copy/02_Algorithm_Notes/2  (((((0))))) .Algo Sanchit Sir Notes(www.gatenotes.in).pdf', driveId: '1_nTd3ZNJH_zGUAyhPnS4V_66zrPQ0VZL' },
      { id: 'p0203', num: 4, name: 'Algorithms — Class Notes',    file: 'gate book - Copy/02_Algorithm_Notes/4 ((((0)))) .Algorithms Notes(www.gatenotes.in).pdf',           driveId: '1oeY1XiQ0X5eHeFmePmZSBIJV1MnZNoO5' },
      { id: 'p0204', num: 8, name: 'DAA — Complete Notes',        file: 'gate book - Copy/02_Algorithm_Notes/8 (((0))).DAA(www.gatenotes.in).pdf',                           driveId: '1pbHBbLCKgwrb6LeWDvStTVBoPxhk1aFv' },
    ],
  },
  {
    id: 's03', name: 'Theory of Computation', icon: '🔁',
    color: '#00d4aa', gradient: 'linear-gradient(135deg,#00d4aa22,#6382ff22)',
    pdfs: [
      { id: 'p0301', num: 1, name: 'TOC — Core Notes',             file: 'gate book - Copy/03_Theory_of_Computation_Notes/1.TOC(www.gatenotes.in).pdf',                              driveId: '1omfsry1qCZREhC1xbfmRv6Ykte6jf7dB' },
      { id: 'p0302', num: 2, name: 'Theory of Computation',        file: 'gate book - Copy/03_Theory_of_Computation_Notes/2.Theory_of_Computation(www.gatenotes.in).pdf',        driveId: '1FEZHQtbznexQvAe7tPP6SoZXQ7_lhp55' },
      { id: 'p0303', num: 3, name: 'TOC — Made Easy Class Notes',  file: 'gate book - Copy/03_Theory_of_Computation_Notes/3.TOC_Made Easy Class Latest Notes(www.gatenotes.in).pdf', driveId: '1EZe6eBvCMDalJbj414OyLLZakyxO433A' },
      { id: 'p0304', num: 6, name: 'TOC — Complete Notes',         file: 'gate book - Copy/03_Theory_of_Computation_Notes/6.TOC Complete Notes(www.gatenotes.in).pdf',            driveId: '1NbzsA1noJeb9RUc0QpU4MhUtSpyCNNMD' },
      { id: 'p0305', num: 7, name: 'TOC — Extended Notes',         file: 'gate book - Copy/03_Theory_of_Computation_Notes/7.TOC notes(www.gatenotes.in).pdf',                    driveId: '1UsN99pYuwgi_74qjAVxLxuFAJb6jGf4v' },
    ],
  },
  {
    id: 's04', name: 'Compiler Design', icon: '🛠',
    color: '#ff9f43', gradient: 'linear-gradient(135deg,#ff9f4322,#ff4d6d22)',
    pdfs: [
      { id: 'p0401', num: 1, name: 'CD — Core Notes',              file: 'gate book - Copy/04_Compiler_Design_Notes/1.CD(www.gatenotes.in).pdf',                                    driveId: '1neIIgtxR72Rm6Qx6O6Y3RaS0nzKoDuuE' },
      { id: 'p0402', num: 2, name: 'CD — Sanchit Sir Notes',       file: 'gate book - Copy/04_Compiler_Design_Notes/2.CD Sanchit Sir Notes(www.gatenotes.in).pdf',                driveId: '1fZwffJv1vKVQFiwfoOVwKMqxHUWOxV9q' },
      { id: 'p0403', num: 3, name: 'Ace Academy — Compiler Design',file: 'gate book - Copy/04_Compiler_Design_Notes/3.Ace Academy Compiler Design Class Notes(www.gatenotes.in).pdf', driveId: '1-4Zl-_HuVGrdkGEkmcmr_uW84hTIFKdt' },
      { id: 'p0404', num: 5, name: 'Compiler Design — Full Notes', file: 'gate book - Copy/04_Compiler_Design_Notes/5.Compiler Design (www.gatenotes.in).pdf',                    driveId: '1ZZi1oD7AAJ54USs-xuHoR1F5PCcuWvT0' },
    ],
  },
  {
    id: 's05', name: 'Operating Systems', icon: '🖥',
    color: '#54a0ff', gradient: 'linear-gradient(135deg,#54a0ff22,#00d4aa22)',
    pdfs: [
      { id: 'p0501', num: 1, name: 'OS — Core Notes',              file: 'gate book - Copy/05_Operating_System_Notes/1.OS(www.gatenotes.in).pdf',                                    driveId: '1AxA13yFVybMxOK3mXOx2clW9FL8vQwm9' },
      { id: 'p0502', num: 2, name: 'OS — Sanchit Sir Notes',       file: 'gate book - Copy/05_Operating_System_Notes/2.OS Sanchit Sir Notes(www.gatenotes.in).pdf',                driveId: '1xATiyt5E8g3Z1AwWZeENVCe5Utg1NAyt' },
      { id: 'p0503', num: 3, name: 'OS — Made Easy Class (Delhi)', file: 'gate book - Copy/05_Operating_System_Notes/3.OS_Made Easy Class Latest Notes_Delhi(www.gatenotes.in).pdf', driveId: '19vOpzJuzrZ7bd6wuE9KSxkrwwM5G4lpK' },
      { id: 'p0504', num: 7, name: 'OS — Extended Notes',          file: 'gate book - Copy/05_Operating_System_Notes/7.OS Notes (www.gatenotes.in).pdf',                           driveId: '1zbdvaIxXQvCSH5dRDWpf8rS-tKAAGhh5' },
      { id: 'p0505', num: 8, name: 'Operating Systems — Full',     file: 'gate book - Copy/05_Operating_System_Notes/8.Operation Systems(www.gatenotes.in).pdf',                   driveId: '1Q0nt5emadAV5C21glZRAEfxN1XfMLrn7' },
    ],
  },
  {
    id: 's06', name: 'DBMS', icon: '🗄',
    color: '#ff6b6b', gradient: 'linear-gradient(135deg,#ff6b6b22,#ff9f4322)',
    pdfs: [
      { id: 'p0601', num: 1, name: 'DBMS — Core Notes',            file: 'gate book - Copy/06_DBMS_Notes/1.DBMS(www.gatenotes.in).pdf',                    driveId: '1qA6L9DPDYpkAfHY-db5g3i6HA2niFfxW' },
      { id: 'p0602', num: 2, name: 'DBMS — Sanchit Sir Notes',     file: 'gate book - Copy/06_DBMS_Notes/2.DBMS Sanchit Sir Notes(www.gatenotes.in).pdf', driveId: '1KZ1ZfBNkijlzr65KjH6LhQ51KvVOaPGS' },
      { id: 'p0603', num: 3, name: 'Made Easy — DBMS Class Notes', file: 'gate book - Copy/06_DBMS_Notes/3.Made Easy Class_DBMS(www.gatenotes.in).pdf',   driveId: '1pIVLgL6gNZNGNORIyyxgnMi4X_VmttIQ' },
      { id: 'p0604', num: 6, name: 'DBMS — Complete Notes',        file: 'gate book - Copy/06_DBMS_Notes/6.DBMS Notes(www.gatenotes.in).pdf',              driveId: '1LWTs18GoMnnrnLsqAqxZoGaZ8X2POv-X' },
    ],
  },
  {
    id: 's07', name: 'Computer Organization & Architecture', icon: '🔌',
    color: '#5f27cd', gradient: 'linear-gradient(135deg,#5f27cd22,#a259ff22)',
    pdfs: [
      { id: 'p0701', num: 1, name: 'COA — Core Notes',             file: 'gate book - Copy/07_COA_Notes/1.COA(www.gatenotes.in).pdf',                          driveId: '131Rk4oEfJNrVnyNJ2I71KCFiArkhXbH_' },
      { id: 'p0702', num: 2, name: 'COA — Sanchit Sir Notes',      file: 'gate book - Copy/07_COA_Notes/2.COA Sanchit Sir Notes(www.gatenotes.in).pdf',       driveId: '1h9D4oDMHmz56FrIeQbqbVgxatrFnPRWH' },
      { id: 'p0703', num: 3, name: 'CO — Made Easy Class Notes',   file: 'gate book - Copy/07_COA_Notes/3.CO_Made Easy Class Latest Notes(www.gatenotes.in).pdf', driveId: '1UvMFT1DbOdkp9kWIWflF9V17rW3PUU99' },
      { id: 'p0704', num: 4, name: 'Ace Academy — CO Class Notes', file: 'gate book - Copy/07_COA_Notes/4.Ace Academy CO Class Notes(www.gatenotes.in).pdf',   driveId: '1j4nXuJipR1U1u0mk9X6NuRAFVI0TCDx1' },
      { id: 'p0705', num: 6, name: 'CO — Shared Notes',            file: 'gate book - Copy/07_COA_Notes/6.CO Shared Notes(www.gatenotes.in).pdf',              driveId: '1kb-7K06GEhYbEtvXRn5CewPw63-2ejom' },
      { id: 'p0706', num: 7, name: 'CO — Vishvadeep Sir Notes',    file: 'gate book - Copy/07_COA_Notes/7.CO Vishvadeep sir Notes(www.gatenotes.in).pdf',      driveId: '1SuBt3VdS0xjqHXoD3eGXZDZMh6qbG8Yg' },
    ],
  },
  {
    id: 's08', name: 'Digital Logic', icon: '⚡',
    color: '#ffd32a', gradient: 'linear-gradient(135deg,#ffd32a22,#ff9f4322)',
    pdfs: [
      { id: 'p0801', num: 1,  name: 'Digital Logic — Core Notes',       file: 'gate book - Copy/08_Digital_Logic_Notes/1.Digital Logic(www.gatenotes.in).pdf',                              driveId: '1ZssMx0IUXUy9fw4sEGcgDoq9nCob2Gua' },
      { id: 'p0802', num: 2,  name: 'Digital — Sanchit Sir Notes',      file: 'gate book - Copy/08_Digital_Logic_Notes/2.Digital Sanchit Sir Notes(www.gatenotes.in).pdf',                  driveId: '1Mtmw_fAUQivzjFlO4e5k692xztljKTc2' },
      { id: 'p0803', num: 3,  name: 'DLD — Notes',                      file: 'gate book - Copy/08_Digital_Logic_Notes/3.DLD (www.gatenotes.in).pdf',                                       driveId: '1qJ8l1M5Ug1nWnxYYK1rLvIaiWeRBTq8_' },
      { id: 'p0804', num: 4,  name: 'Made Easy — Digital Electronics',  file: 'gate book - Copy/08_Digital_Logic_Notes/4.digital electronics-1-1_Made Easy notes latest_(www.gatenotes.in).pdf', driveId: '13ZXUtmh9aRhzL9EOA1nEVEbZM2pZwQMy' },
      { id: 'p0805', num: 6,  name: 'Digital Electronics — Handwritten',file: 'gate book - Copy/08_Digital_Logic_Notes/6.Digital Electronics Handwriting Notes (www.gatenotes.in).pdf',      driveId: '1JdpXdlbxtX-X5An4LOBY1fL0W37ihjZM' },
      { id: 'p0806', num: 10, name: 'DLD — Complete Notes',              file: 'gate book - Copy/08_Digital_Logic_Notes/10.DLD Notes(www.gatenotes.in).pdf',                                  driveId: '1CmHvmA4jYSbFrbdruDx2FDF15TQjdhP8' },
    ],
  },
  {
    id: 's09', name: 'Computer Networks', icon: '🌐',
    color: '#00d4aa', gradient: 'linear-gradient(135deg,#00d4aa22,#54a0ff22)',
    pdfs: [
      { id: 'p0901', num: 1, name: 'CN — Core Notes',              file: 'gate book - Copy/09_Computer_Network_Notes/1.CN(www.gatenotes.in).pdf',                    driveId: '1RaBk9UDpI4KsnHBYc-6eXC-hWAzgL9eW' },
      { id: 'p0902', num: 2, name: 'CN — Sanchit Sir Notes',       file: 'gate book - Copy/09_Computer_Network_Notes/2.CN Sanchit Sir Notes(www.gatenotes.in).pdf', driveId: '1DYVp6Xzi0xK7oK6HbcJ5hf0dLmY0IUqG' },
      { id: 'p0903', num: 3, name: 'Ace Academy — CN Class Notes', file: 'gate book - Copy/09_Computer_Network_Notes/3.Ace Academy CN Class Notes(www.gatenotes.in).pdf', driveId: '1geB8P-rOB-d_2JI0mBU8Fw2Qbg4A4fc1' },
      { id: 'p0904', num: 6, name: 'Computer Networks — Full',     file: 'gate book - Copy/09_Computer_Network_Notes/6.Computer Networks (www.gatenotes.in).pdf',    driveId: '1jMBkZlxieRHgsadc9NYIuyAqeZXLYqr9' },
    ],
  },
  {
    id: 's10', name: 'Discrete Mathematics', icon: '∑',
    color: '#6382ff', gradient: 'linear-gradient(135deg,#6382ff22,#00d4aa22)',
    pdfs: [
      { id: 'p1001', num: 1, name: 'Discrete Math — Core Notes',  file: 'gate book - Copy/10_Discrete_Mathematics_Notes/1.Discrete Math(www.gatenotes.in).pdf',     driveId: '13jVWfJstiroZvQhlFtfhhDKGv650ehrI' },
      { id: 'p1002', num: 2, name: 'Discrete Mathematics',        file: 'gate book - Copy/10_Discrete_Mathematics_Notes/2.Discrete Mathematics(www.gatenotes.in).pdf', driveId: '1H_zDBLF5nQDNKclLt8SAQ89dfcC9tw2I' },
      { id: 'p1003', num: 3, name: 'DM — Sanchit Sir Notes',      file: 'gate book - Copy/10_Discrete_Mathematics_Notes/3.DM Sanchit Sir Notes(www.gatenotes.in).pdf', driveId: '1VaDO7BPttEhe5F0inUKs6mWhUax_dr5b' },
      { id: 'p1004', num: 4, name: 'Discrete Math — Extended',    file: 'gate book - Copy/10_Discrete_Mathematics_Notes/4.Discrete Math(www.gatenotes.in).pdf',         driveId: '11rmB44FU0gmGzg6DOswJAJMycNnfxpGQ' },
    ],
  },
  {
    id: 's11', name: 'Engineering Mathematics', icon: '📐',
    color: '#a259ff', gradient: 'linear-gradient(135deg,#a259ff22,#6382ff22)',
    pdfs: [
      { id: 'p1101', num: 1, name: 'Engg. Maths — Made Easy (Handwritten)', file: 'gate book - Copy/11_Engineering_Mathematics_Notes/1.Engineering Maths Hand Written Notes Made Easy(www.gatenotes.in).pdf',           driveId: '1nqheSl7evz7LVg-JIVmIY7wEOUHuB62y' },
      { id: 'p1102', num: 2, name: 'Quantitative Aptitude — R.S. Aggarwal', file: 'gate book - Copy/11_Engineering_Mathematics_Notes/1.Quantitative_Aptitude_for_Competitive_Examinations_by_R_S_Aggarwal.pdf', driveId: '1vxvQDWNidN7K4vRGufKoPK1hfAkXKGSm' },
    ],
  },
  {
    id: 's12', name: 'General Ability', icon: '🧠',
    color: '#ff6b6b', gradient: 'linear-gradient(135deg,#ff6b6b22,#a259ff22)',
    pdfs: [
      { id: 'p1201', num: 1, name: 'Quantitative Aptitude — R.S. Aggarwal', file: 'gate book - Copy/12_General_Ability_Notes/1.Quantitative_Aptitude_for_Competitive_Examinations_by_R_S_Aggarwal (1).pdf', driveId: '1DbeAAMVpTyNMjHAV04EcbUsjcgFB-sk-' },
      { id: 'p1202', num: 2, name: 'NA Notes',                               file: 'gate book - Copy/12_General_Ability_Notes/2.NA Notes (www.gatenotes.in).pdf',                                                   driveId: '1fmymR5xwIwvRpardaJTp1BKY-qb52-_t' },
      { id: 'p1203', num: 3, name: 'Reasoning & Aptitude — Made Easy',       file: 'gate book - Copy/12_General_Ability_Notes/3.Reasoning and Aptitude Made Easy Handwritten Notes for GATE(www.gatenotes.in).pdf', driveId: '1CMwVrHjAqx-xFPcQMvD5PMksOTp329z8' },
      { id: 'p1204', num: 4, name: 'Verbal Ability — Class Notes',           file: 'gate book - Copy/12_General_Ability_Notes/4.VerbalAbility_Classnotes(www.gatenotes.in).pdf',                                   driveId: '1OjgAv3JElwo5tqzDqGmtepgtdWfa-YRE' },
      { id: 'p1205', num: 5, name: 'English Notes',                          file: 'gate book - Copy/12_General_Ability_Notes/5.English(www.gatenotes.in).pdf',                                                     driveId: '1CE_NKhK73hAk9SZ7rBQjwNSf0eqZIK95' },
    ],
  },
];

const TOTAL_PDFS = SUBJECTS.reduce((n, s) => n + s.pdfs.length, 0);

/* Build Google Drive URLs from a file's driveId.
   Falls back to local relative path when driveId is absent (local dev). */
function driveEmbedUrl(driveId) {
  return `https://drive.google.com/file/d/${driveId}/preview`;
}
function driveViewUrl(driveId) {
  return `https://drive.google.com/file/d/${driveId}/view`;
}
function driveDownloadUrl(driveId) {
  return `https://drive.google.com/uc?export=download&id=${driveId}`;
}
function localUrl(filePath) {
  return filePath.split('/').map(encodeURIComponent).join('/');
}

/* Build lookup maps */
const PDF_MAP     = new Map();
const SUBJECT_MAP = new Map();
SUBJECTS.forEach(sub => {
  SUBJECT_MAP.set(sub.id, sub);
  sub.pdfs.forEach(p => PDF_MAP.set(p.id, { ...p, subjectId: sub.id, subject: sub }));
});

/* ─────────────────────────────────────────────
   State
───────────────────────────────────────────── */
const state = {
  currentPdfId:    null,
  sidebarOpen:     true,
  annotateMode:    false,
  dropdownOpen:    false,
  pageManuallySet: false,  // true once user has typed a page number
};

/* Persisted in localStorage */
const store = {
  favorites:   new Set(JSON.parse(localStorage.getItem('gh_favorites')  || '[]')),
  viewed:      new Set(JSON.parse(localStorage.getItem('gh_viewed')     || '[]')),
  bookmarks:   JSON.parse(localStorage.getItem('gh_bookmarks')  || '{}'),
  annotations: JSON.parse(localStorage.getItem('gh_annotations') || '{}'),

  save() {
    localStorage.setItem('gh_favorites',   JSON.stringify([...this.favorites]));
    localStorage.setItem('gh_viewed',      JSON.stringify([...this.viewed]));
    localStorage.setItem('gh_bookmarks',   JSON.stringify(this.bookmarks));
    localStorage.setItem('gh_annotations', JSON.stringify(this.annotations));
  },
};

/* ─────────────────────────────────────────────
   Supabase sync — favorites & bookmarks
───────────────────────────────────────────── */
const dbSync = {
  _sb() { return (window.supabase?.from) ? window.supabase : null; },

  /** On login: fetch user's favorites + bookmarks from Supabase and merge into store */
  async loadForUser(userId) {
    const sb = this._sb();
    if (!sb || !userId) return;
    try {
      const [favRes, bmRes] = await Promise.all([
        sb.from('favorites').select('pdf_id').eq('user_id', userId),
        sb.from('bookmarks').select('pdf_id, page, created_at').eq('user_id', userId),
      ]);

      // Merge favorites
      if (favRes.data) {
        favRes.data.forEach(r => store.favorites.add(r.pdf_id));
      }

      // Merge bookmarks (server wins for new entries, keep any local-only ones too)
      if (bmRes.data) {
        bmRes.data.forEach(r => {
          if (!store.bookmarks[r.pdf_id]) store.bookmarks[r.pdf_id] = [];
          if (!store.bookmarks[r.pdf_id].find(b => b.page === r.page)) {
            store.bookmarks[r.pdf_id].push({ page: r.page, addedAt: r.created_at });
          }
        });
      }

      store.save();
      renderSidebarFavorites();
      renderFavoritesGrid();
      renderSidebarBookmarks();
      renderBookmarksGrid();
      updateProgress();
    } catch (e) {
      console.warn('[dbSync] load failed:', e);
    }
  },

  /** Upsert or delete a favorite row */
  async syncFavorite(userId, pdfId, added) {
    const sb = this._sb();
    if (!sb || !userId) return;
    try {
      if (added) {
        await sb.from('favorites').upsert(
          { user_id: userId, pdf_id: pdfId },
          { onConflict: 'user_id,pdf_id' }
        );
      } else {
        await sb.from('favorites').delete()
          .eq('user_id', userId).eq('pdf_id', pdfId);
      }
    } catch (e) {
      console.warn('[dbSync] syncFavorite failed:', e);
    }
  },

  /** Upsert or delete a bookmark row */
  async syncBookmark(userId, pdfId, page, added) {
    const sb = this._sb();
    if (!sb || !userId) return;
    try {
      if (added) {
        await sb.from('bookmarks').upsert(
          { user_id: userId, pdf_id: pdfId, page },
          { onConflict: 'user_id,pdf_id,page' }
        );
      } else {
        await sb.from('bookmarks').delete()
          .eq('user_id', userId).eq('pdf_id', pdfId).eq('page', page);
      }
    } catch (e) {
      console.warn('[dbSync] syncBookmark failed:', e);
    }
  },
};

/* ─────────────────────────────────────────────
   DOM refs
───────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

const dom = {
  app:              $('app'),
  sidebar:          $('sidebar'),
  sidebarToggle:    $('sidebar-toggle'),
  subjectList:      $('subject-list'),
  homeLink:         $('home-link'),
  // topbar
  globalSearch:     $('global-search'),
  searchListbox:    $('search-listbox'),
  favoritesBtn:     $('favorites-btn'),
  favoritesBadge:   $('favorites-badge'),
  bookmarksBtn:     $('bookmarks-btn'),
  authBtn:          $('auth-btn'),
  userMenu:         $('user-menu'),
  userAvatarBtn:    $('user-avatar-btn'),
  userAvatarInit:   $('user-avatar-initials'),
  userDropdown:     $('user-dropdown'),
  userDropdownName: $('user-dropdown-name'),
  adminBtn:         $('admin-btn'),
  logoutBtn:        $('logout-btn'),
  // viewer toolbar
  viewerToolbar:    $('viewer-toolbar'),
  closeViewerBtn:   $('close-viewer-btn'),
  viewerSubjectName:$('viewer-subject-name'),
  viewerPdfName:    $('viewer-pdf-name'),
  pageInput:        $('page-input'),
  pageTotal:        $('page-total'),
  annotateBtn:      $('annotate-btn'),
  bookmarkPageBtn:  $('bookmark-page-btn'),
  favoriteBtn:      $('favorite-btn'),
  openNewTabBtn:    $('open-new-tab-btn'),
  downloadBtn:      $('download-btn'),
  // annotation panel
  annotationPanel:  $('annotation-panel'),
  closeAnnotPanel:  $('close-annotation-panel'),
  annotationForm:   $('annotation-form'),
  annotationInput:  $('annotation-input'),
  annotationPage:   $('annotation-page'),
  annotationList:   $('annotation-list'),
  // viewer
  viewerArea:       $('viewer-area'),
  pdfFrame:         $('pdf-frame'),
  pdfFallback:      $('pdf-fallback'),
  fallbackOpenBtn:  $('fallback-open-btn'),
  fallbackDlBtn:    $('fallback-download-btn'),
  // screens
  welcomeScreen:    $('welcome-screen'),
  favoritesView:    $('favorites-view'),
  favoritesGrid:    $('favorites-grid'),
  bookmarksView:    $('bookmarks-view'),
  bookmarksGrid:    $('bookmarks-grid'),
  profileView:      $('profile-view'),
  profileContent:   $('profile-content'),
  profileBtn:       $('profile-btn'),
  statsRow:         $('stats-row'),
  subjectGrid:      $('subject-grid'),
  // sidebar sections
  sidebarFavorites: $('sidebar-favorites'),
  favoriteList:     $('favorite-list'),
  sidebarBookmarks: $('sidebar-bookmarks'),
  bookmarkList:     $('bookmark-list'),
  // progress
  progressText:     $('progress-text'),
  progressPct:      $('progress-pct'),
  progressFill:     $('progress-fill'),
  progressWrap:     document.querySelector('[role="progressbar"]'),
  // loader
  pageLoader:       $('page-loader'),
  // ad column (hidden for admins)
  adCol:            $('ad-col'),
};

/* ─────────────────────────────────────────────
   Toast helper
───────────────────────────────────────────── */
function toast(msg, type = '', duration = 3000) {
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
   Loader
───────────────────────────────────────────── */
function loaderStart() {
  dom.pageLoader.classList.remove('done');
  dom.pageLoader.classList.add('loading');
}
function loaderDone() {
  dom.pageLoader.classList.remove('loading');
  dom.pageLoader.classList.add('done');
  setTimeout(() => dom.pageLoader.classList.remove('done'), 600);
}

/* ─────────────────────────────────────────────
   Sidebar rendering
───────────────────────────────────────────── */
function renderSidebar() {
  dom.subjectList.innerHTML = '';
  const visible = getVisibleSubjects();

  visible.forEach(sub => {
    const li = document.createElement('li');
    li.className = 'subject-item';
    li.setAttribute('role', 'treeitem');
    li.setAttribute('aria-expanded', 'false');
    li.dataset.subjectId = sub.id;

    li.innerHTML = `
      <button
        class="subject-header-btn"
        aria-expanded="false"
        aria-controls="pdf-list-${sub.id}"
        data-subject-id="${sub.id}"
      >
        <span class="subject-icon-wrap" style="background:${sub.gradient}" aria-hidden="true">${sub.icon}</span>
        <span class="subject-meta">
          <span class="subject-name">${escHtml(sub.name)}</span>
          <span class="subject-count" aria-label="${sub.pdfs.length} notes">${sub.pdfs.length} notes</span>
        </span>
        <span class="subject-chevron" aria-hidden="true">›</span>
      </button>
      <ul class="pdf-list" id="pdf-list-${sub.id}" role="group" aria-label="${escHtml(sub.name)} notes">
        ${sub.pdfs.map(p => renderPdfItem(p, sub)).join('')}
      </ul>
    `;
    dom.subjectList.appendChild(li);
  });

  // Toggle expand
  dom.subjectList.querySelectorAll('.subject-header-btn').forEach(btn => {
    btn.addEventListener('click', () => toggleSubject(btn.closest('.subject-item')));
  });

  // PDF item buttons
  dom.subjectList.querySelectorAll('.pdf-item-btn').forEach(btn => {
    btn.addEventListener('click', () => openPdf(btn.dataset.pdfId));
  });

  // Favorite toggle buttons
  dom.subjectList.querySelectorAll('.pdf-fav-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      toggleFavorite(btn.dataset.pdfId);
    });
  });

  updateProgress();
  renderSidebarFavorites();
  renderSidebarBookmarks();
}

function renderPdfItem(p) {
  const isFav     = store.favorites.has(p.id);
  const isViewed  = store.viewed.has(p.id);
  const isActive  = state.currentPdfId === p.id;
  return `
    <li role="none">
      <button
        class="pdf-item-btn${isActive ? ' active' : ''}${isViewed ? ' viewed' : ''}"
        data-pdf-id="${p.id}"
        aria-label="Open ${escHtml(p.name)}"
        aria-current="${isActive ? 'true' : 'false'}"
      >
        <span class="pdf-num" aria-hidden="true">${p.num}</span>
        <span class="pdf-item-name">${escHtml(p.name)}</span>
        <span class="pdf-viewed-dot" aria-label="${isViewed ? 'Viewed' : ''}" title="${isViewed ? 'Viewed' : ''}"></span>
        <button
          class="pdf-fav-btn${isFav ? ' active' : ''}"
          data-pdf-id="${p.id}"
          aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}"
          aria-pressed="${isFav}"
          title="Favorite"
        >${isFav ? '❤' : '♡'}</button>
      </button>
    </li>
  `;
}

/* Populate PDF_MAP with custom notes from localStorage */
function loadCustomNotesIntoPdfMap() {
  [...PDF_MAP.keys()].filter(k => String(k).startsWith('custom_')).forEach(k => PDF_MAP.delete(k));
  const custom = JSON.parse(localStorage.getItem('gh_admin_custom') || '[]');
  custom.forEach(c => {
    const sub = SUBJECT_MAP.get(c.subjectId) || { id: c.subjectId, name: c.subjectName || 'Custom' };
    PDF_MAP.set(c.id, { ...c, subject: sub });
  });
}

function getVisibleSubjects() {
  const hidden = JSON.parse(localStorage.getItem('gh_admin_hidden') || '[]');
  const hiddenSet = new Set(hidden);
  const custom = JSON.parse(localStorage.getItem('gh_admin_custom') || '[]');
  // Inject custom notes into their parent subject's pdfs array — never append as subjects
  return SUBJECTS
    .filter(s => !hiddenSet.has(s.id))
    .map(s => {
      const extras = custom.filter(c => c.subjectId === s.id);
      return extras.length ? { ...s, pdfs: [...s.pdfs, ...extras] } : s;
    });
}

function toggleSubject(li) {
  const isOpen = li.classList.contains('open');
  // Close all
  $$('.subject-item.open').forEach(el => {
    el.classList.remove('open');
    el.querySelector('.subject-header-btn').setAttribute('aria-expanded', 'false');
    el.setAttribute('aria-expanded', 'false');
  });
  if (!isOpen) {
    li.classList.add('open');
    li.querySelector('.subject-header-btn').setAttribute('aria-expanded', 'true');
    li.setAttribute('aria-expanded', 'true');
  }
}

function openSubjectInSidebar(subjectId) {
  const li = dom.subjectList.querySelector(`[data-subject-id="${subjectId}"]`);
  if (li) toggleSubject(li);
}

/* ─────────────────────────────────────────────
   PDF viewer
───────────────────────────────────────────── */
function openPdf(pdfId) {
  const entry = PDF_MAP.get(pdfId);
  if (!entry) return;

  // Require authentication before viewing any PDF
  if (!window.Auth?.user) {
    window.Auth?.openModal('login');
    return;
  }

  const sub = entry.subject;

  loaderStart();
  state.currentPdfId = pdfId;

  // Mark viewed
  store.viewed.add(pdfId);
  store.save();

  const embedUrl    = entry.driveId ? driveEmbedUrl(entry.driveId)    : localUrl(entry.file);
  const viewUrl     = entry.driveId ? driveViewUrl(entry.driveId)     : localUrl(entry.file);
  const downloadUrl = entry.driveId ? driveDownloadUrl(entry.driveId) : localUrl(entry.file);

  // Update toolbar
  showScreen('viewer');
  closeSidebarOnMobile(); // auto-close sidebar on mobile when PDF opens
  dom.viewerToolbar.removeAttribute('hidden');
  dom.viewerSubjectName.textContent = sub.name;
  dom.viewerPdfName.textContent     = entry.name;
  const dlFilename = `${entry.num} - ${entry.name}.pdf`;
  dom.openNewTabBtn.href   = viewUrl;
  dom.downloadBtn.href     = downloadUrl;
  dom.downloadBtn.setAttribute('download', dlFilename);
  dom.fallbackOpenBtn.href = viewUrl;
  dom.fallbackDlBtn.href   = downloadUrl;
  dom.fallbackDlBtn.setAttribute('download', dlFilename);

  // Update favorite button state
  const isFav = store.favorites.has(pdfId);
  dom.favoriteBtn.setAttribute('aria-pressed', String(isFav));
  dom.favoriteBtn.setAttribute('aria-label', isFav ? 'Remove from favorites' : 'Add to favorites');
  dom.favoriteBtn.style.color = isFav ? '#ff4d6d' : '';

  // Set iframe src
  dom.pdfFallback.hidden = true;
  dom.pdfFrame.hidden    = false;
  dom.pdfFrame.src = embedUrl;

  dom.pdfFrame.onload = () => {
    loaderDone();
    // Try to detect load failure (works only same-origin)
    try {
      if (!dom.pdfFrame.contentDocument) throw new Error('cross-origin');
    } catch (_) {
      // Cross-origin blocked is expected and fine for same-host files
    }
  };
  dom.pdfFrame.onerror = showPdfFallback;

  // Reset annotation page to 1
  dom.annotationPage.value  = 1;
  dom.pageInput.value       = 1;
  state.pageManuallySet     = false;
  dom.bookmarkPageBtn.style.color = '';

  // Render annotations
  renderAnnotations(pdfId);

  // Scroll sidebar item into view & update active states
  updateSidebarActiveState(pdfId);
  openSubjectInSidebar(sub.id);

  // Analytics
  window.Analytics?.track('pdf_open', { pdfId, pdfName: entry.name, subjectId: sub.id });

  // Log PDF view to Supabase (non-blocking)
  const viewer = window.Auth?.user;
  if (viewer && window.supabase?.from) {
    window.supabase.from('pdf_views').insert({
      user_id:  viewer.id,
      email:    viewer.email,
      pdf_id:   pdfId,
      pdf_name: entry.name,
      subject:  sub.name,
    }).then(() => {}).catch(err => console.debug('[pdf_views] insert failed:', err?.code, err?.message));
  }

  // Update progress
  updateProgress();
}

function showPdfFallback() {
  dom.pdfFrame.hidden    = true;
  dom.pdfFallback.hidden = false;
  loaderDone();
}

function closePdf() {
  state.currentPdfId = null;
  dom.pdfFrame.src = 'about:blank';
  dom.viewerToolbar.hidden = true;
  dom.annotationPanel.hidden = true;
  state.annotateMode = false;
  dom.annotateBtn.setAttribute('aria-pressed', 'false');
  showScreen('welcome');
  updateSidebarActiveState(null);
}

function updateSidebarActiveState(pdfId) {
  $$('.pdf-item-btn').forEach(btn => {
    const active = btn.dataset.pdfId === pdfId;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-current', active ? 'true' : 'false');
    if (pdfId && btn.dataset.pdfId === pdfId) {
      btn.classList.add('viewed');
    }
  });
}

/* ─────────────────────────────────────────────
   Screen management
───────────────────────────────────────────── */
function showScreen(name) {
  dom.welcomeScreen.hidden  = name !== 'welcome';
  dom.viewerArea.hidden     = name !== 'viewer';
  dom.favoritesView.hidden  = name !== 'favorites';
  dom.bookmarksView.hidden  = name !== 'bookmarks';
  dom.profileView.hidden    = name !== 'profile';
  if (name !== 'viewer') {
    dom.viewerToolbar.hidden = true;
    dom.annotationPanel.hidden = true;
  }
}

/* ─────────────────────────────────────────────
   Favorites
───────────────────────────────────────────── */
function toggleFavorite(pdfId) {
  const entry = PDF_MAP.get(pdfId);
  if (!entry) return;

  if (store.favorites.has(pdfId)) {
    store.favorites.delete(pdfId);
    toast(`Removed "${entry.name}" from favorites`);
  } else {
    store.favorites.add(pdfId);
    toast(`Added "${entry.name}" to favorites`, 'success');
  }
  store.save();

  // Sync to Supabase
  const _favUser = window.Auth?.user;
  if (_favUser) dbSync.syncFavorite(_favUser.id, pdfId, store.favorites.has(pdfId));

  // Update badge
  const count = store.favorites.size;
  dom.favoritesBadge.textContent = count;
  dom.favoritesBadge.hidden = count === 0;

  // If currently viewing this PDF, update toolbar button
  if (state.currentPdfId === pdfId) {
    const isFav = store.favorites.has(pdfId);
    dom.favoriteBtn.setAttribute('aria-pressed', String(isFav));
    dom.favoriteBtn.style.color = isFav ? '#ff4d6d' : '';
  }

  renderSidebarFavorites();
  renderFavoritesGrid();
  renderSidebar();
  window.Analytics?.track('favorite_toggle', { pdfId, added: store.favorites.has(pdfId) });
}

function renderSidebarFavorites() {
  dom.sidebarFavorites.hidden = store.favorites.size === 0;
  dom.favoriteList.innerHTML = '';
  store.favorites.forEach(id => {
    const entry = PDF_MAP.get(id);
    if (!entry) return;
    const li = document.createElement('li');
    li.textContent = entry.name;
    li.setAttribute('role', 'listitem');
    li.setAttribute('tabindex', '0');
    li.title = entry.name;
    li.addEventListener('click', () => openPdf(id));
    li.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openPdf(id); });
    dom.favoriteList.appendChild(li);
  });
  // Update badge count
  const count = store.favorites.size;
  dom.favoritesBadge.textContent = count;
  dom.favoritesBadge.hidden = count === 0;
}

function renderFavoritesGrid() {
  dom.favoritesGrid.innerHTML = '';
  if (store.favorites.size === 0) {
    dom.favoritesGrid.innerHTML = '<li style="grid-column:1/-1;color:var(--muted);font-size:13px">No favorites yet. Click ♡ next to a note to add it.</li>';
    return;
  }
  store.favorites.forEach(id => {
    const entry = PDF_MAP.get(id);
    if (!entry) return;
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="grid-card" role="button" tabindex="0">
        <div class="grid-card-name">${escHtml(entry.name)}</div>
        <div class="grid-card-sub">${escHtml(entry.subject.name)}</div>
      </div>
    `;
    li.querySelector('.grid-card').addEventListener('click', () => openPdf(id));
    li.querySelector('.grid-card').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openPdf(id); });
    dom.favoritesGrid.appendChild(li);
  });
}

/* ─────────────────────────────────────────────
   Bookmarks (page-level)
───────────────────────────────────────────── */
function bookmarkCurrentPage() {
  const pdfId = state.currentPdfId;
  if (!pdfId) return;
  showBookmarkModal(pdfId);
}

function showBookmarkModal(pdfId) {
  document.getElementById('bookmark-modal')?.remove();

  const entry = PDF_MAP.get(pdfId);
  const overlay = document.createElement('div');
  overlay.id = 'bookmark-modal';
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;
    background:rgba(0,0,0,.6);backdrop-filter:blur(4px);
  `;
  overlay.innerHTML = `
    <div style="background:var(--card);border:1px solid var(--border);border-radius:16px;
                padding:24px 28px;width:340px;max-height:80vh;overflow-y:auto;
                box-shadow:0 24px 64px rgba(0,0,0,.5)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
        <h3 style="margin:0;font-size:15px;font-weight:700">🔖 Bookmarks</h3>
        <button id="bm-close" style="background:none;border:none;color:var(--muted);font-size:18px;cursor:pointer;padding:0 4px">✕</button>
      </div>
      <p style="margin:0 0 4px;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em">
        ${escHtml(entry?.name || '')}
      </p>

      <!-- Existing bookmarks list -->
      <ul id="bm-list" style="list-style:none;margin:0 0 18px;padding:0;display:flex;flex-direction:column;gap:6px"></ul>

      <!-- Add new bookmark -->
      <div style="border-top:1px solid var(--border);padding-top:16px">
        <p style="margin:0 0 10px;font-size:13px;color:var(--muted)">
          Add bookmark — enter the page number shown in the PDF viewer
        </p>
        <div style="display:flex;gap:8px">
          <input id="bm-page-input" type="number" min="1" placeholder="Page no."
            style="flex:1;padding:9px 12px;border-radius:8px;border:1px solid var(--border);
                   background:var(--bg);color:var(--text);font-size:14px" />
          <button id="bm-add" class="btn btn-primary btn-sm">Add</button>
        </div>
        <span id="bm-err" style="font-size:11px;color:var(--accent-err);display:none;margin-top:6px">
          Enter a valid page number.
        </span>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  function renderList() {
    const list = document.getElementById('bm-list');
    const pages = (store.bookmarks[pdfId] || []).slice().sort((a, b) => a.page - b.page);
    if (!pages.length) {
      list.innerHTML = `<li style="font-size:13px;color:var(--muted);padding:4px 0">No bookmarks yet.</li>`;
      dom.bookmarkPageBtn.style.color = '';
      return;
    }
    dom.bookmarkPageBtn.style.color = 'var(--accent)';
    list.innerHTML = pages.map(b => `
      <li data-page="${b.page}" style="display:flex;align-items:center;justify-content:space-between;
           padding:8px 12px;background:var(--bg);border-radius:8px;border:1px solid var(--border)">
        <span style="font-size:13px">Page <strong>${b.page}</strong></span>
        <button class="bm-remove btn btn-ghost btn-sm" data-page="${b.page}"
          style="font-size:11px;padding:3px 8px;color:var(--accent-err)">Remove</button>
      </li>
    `).join('');

    list.querySelectorAll('.bm-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.page, 10);
        store.bookmarks[pdfId] = (store.bookmarks[pdfId] || []).filter(b => b.page !== page);
        store.save();
        const _bmUser = window.Auth?.user;
        if (_bmUser) dbSync.syncBookmark(_bmUser.id, pdfId, page, false);
        renderSidebarBookmarks();
        renderBookmarksGrid();
        toast(`Bookmark removed — page ${page}`);
        renderList();
        window.Analytics?.track('bookmark_remove', { pdfId, page });
      });
    });
  }

  renderList();

  const input = document.getElementById('bm-page-input');
  const errEl = document.getElementById('bm-err');
  input.focus();

  function addBookmark() {
    const page = parseInt(input.value, 10);
    if (!page || page < 1) {
      errEl.style.display = 'block';
      input.style.borderColor = 'var(--accent-err)';
      input.focus();
      return;
    }
    errEl.style.display = 'none';
    input.style.borderColor = '';

    if (!store.bookmarks[pdfId]) store.bookmarks[pdfId] = [];
    if (store.bookmarks[pdfId].find(b => b.page === page)) {
      errEl.textContent = `Page ${page} is already bookmarked.`;
      errEl.style.display = 'block';
      return;
    }
    errEl.textContent = 'Enter a valid page number.';
    store.bookmarks[pdfId].push({ page, addedAt: new Date().toISOString() });
    store.save();
    const _bmAddUser = window.Auth?.user;
    if (_bmAddUser) dbSync.syncBookmark(_bmAddUser.id, pdfId, page, true);
    renderSidebarBookmarks();
    renderBookmarksGrid();
    toast(`Page ${page} bookmarked`, 'success');
    input.value = '';
    renderList();
    window.Analytics?.track('bookmark_add', { pdfId, page });
  }

  document.getElementById('bm-add').addEventListener('click', addBookmark);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') addBookmark(); });

  function close() { overlay.remove(); }
  document.getElementById('bm-close').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
  });
}

function renderSidebarBookmarks() {
  const hasBookmarks = Object.values(store.bookmarks).some(arr => arr.length > 0);
  dom.sidebarBookmarks.hidden = !hasBookmarks;
  dom.bookmarkList.innerHTML = '';
  Object.entries(store.bookmarks).forEach(([pdfId, pages]) => {
    const entry = PDF_MAP.get(pdfId);
    if (!entry || !pages.length) return;
    pages.forEach(({ page }) => {
      const li = document.createElement('li');
      li.textContent = `${entry.name} — p.${page}`;
      li.title = li.textContent;
      li.setAttribute('tabindex', '0');
      li.addEventListener('click', () => {
        openPdf(pdfId);
        setTimeout(() => {
          dom.pageInput.value = page;
          state.pageManuallySet = true;
          const bEntry = PDF_MAP.get(pdfId);
          if (bEntry?.driveId) {
            dom.pdfFrame.src = `https://drive.google.com/file/d/${bEntry.driveId}/preview#page=${page}`;
          }
          dom.bookmarkPageBtn.style.color = 'var(--accent)';
        }, 600);
      });
      li.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') li.click(); });
      dom.bookmarkList.appendChild(li);
    });
  });
}

function renderBookmarksGrid() {
  dom.bookmarksGrid.innerHTML = '';
  let count = 0;
  Object.entries(store.bookmarks).forEach(([pdfId, pages]) => {
    const entry = PDF_MAP.get(pdfId);
    if (!entry || !pages.length) return;
    pages.forEach(({ page }) => {
      count++;
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="grid-card" role="button" tabindex="0">
          <div class="grid-card-name">${escHtml(entry.name)}</div>
          <div class="grid-card-sub">${escHtml(entry.subject.name)} — Page ${page}</div>
        </div>
      `;
      li.querySelector('.grid-card').addEventListener('click', () => {
        openPdf(pdfId);
        setTimeout(() => {
          dom.pageInput.value = page;
          state.pageManuallySet = true;
          const bEntry = PDF_MAP.get(pdfId);
          if (bEntry?.driveId) {
            dom.pdfFrame.src = `https://drive.google.com/file/d/${bEntry.driveId}/preview#page=${page}`;
          }
          dom.bookmarkPageBtn.style.color = 'var(--accent)';
        }, 600);
      });
      dom.bookmarksGrid.appendChild(li);
    });
  });
  if (count === 0) {
    dom.bookmarksGrid.innerHTML = '<li style="grid-column:1/-1;color:var(--muted);font-size:13px">No bookmarks yet. Open a note and click the bookmark icon.</li>';
  }
}

/* ─────────────────────────────────────────────
   Annotations
───────────────────────────────────────────── */
function renderAnnotations(pdfId) {
  dom.annotationList.innerHTML = '';
  const notes = store.annotations[pdfId] || [];
  if (notes.length === 0) {
    dom.annotationList.innerHTML = '<li style="color:var(--muted);font-size:12px;padding:8px">No notes yet. Add one above.</li>';
    return;
  }
  notes.forEach((note, idx) => {
    const li = document.createElement('li');
    li.className = 'annotation-item';
    const date = new Date(note.createdAt).toLocaleDateString();
    li.innerHTML = `
      <div class="annotation-item-header">
        <span class="annotation-item-page">Page ${note.page}</span>
        <span class="annotation-item-date">${date}</span>
        <button class="annotation-delete" data-idx="${idx}" aria-label="Delete annotation">✕</button>
      </div>
      <p class="annotation-item-body">${escHtml(note.text)}</p>
    `;
    li.querySelector('.annotation-delete').addEventListener('click', () => deleteAnnotation(pdfId, idx));
    dom.annotationList.appendChild(li);
  });
}

function saveAnnotation(pdfId, text, page) {
  if (!store.annotations[pdfId]) store.annotations[pdfId] = [];
  store.annotations[pdfId].unshift({ text, page, createdAt: new Date().toISOString() });
  store.save();
  renderAnnotations(pdfId);
  toast('Note saved', 'success');
  window.Analytics?.track('annotation_add', { pdfId, page });
}

function deleteAnnotation(pdfId, idx) {
  store.annotations[pdfId].splice(idx, 1);
  store.save();
  renderAnnotations(pdfId);
}

/* ─────────────────────────────────────────────
   Welcome / home screen
───────────────────────────────────────────── */
function renderWelcome() {
  // Stats
  dom.statsRow.innerHTML = `
    <div class="stat-pill"><div class="val">${SUBJECTS.length}</div><div class="lbl">Subjects</div></div>
    <div class="stat-pill"><div class="val">${TOTAL_PDFS}</div><div class="lbl">PDF Notes</div></div>
    <div class="stat-pill"><div class="val">${store.viewed.size}</div><div class="lbl">Notes Viewed</div></div>
    <div class="stat-pill"><div class="val">${store.favorites.size}</div><div class="lbl">Favorites</div></div>
  `;

  // Subject grid
  dom.subjectGrid.innerHTML = '';
  SUBJECTS.forEach(sub => {
    const card = document.createElement('div');
    card.className = 'subject-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Open ${sub.name} — ${sub.pdfs.length} notes`);
    card.innerHTML = `
      <div class="subject-card-icon" aria-hidden="true">${sub.icon}</div>
      <div class="subject-card-name">${escHtml(sub.name)}</div>
      <div class="subject-card-count">${sub.pdfs.length} notes</div>
    `;
    const open = () => {
      openSubjectInSidebar(sub.id);
      openPdf(sub.pdfs[0].id);
      // open sidebar on mobile
      if (window.innerWidth < 680) dom.app.classList.add('sidebar-open');
    };
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') open(); });
    dom.subjectGrid.appendChild(card);
  });
}

/* ─────────────────────────────────────────────
   Progress tracker
───────────────────────────────────────────── */
function updateProgress() {
  const visibleTotal = getVisibleSubjects().reduce((n, s) => n + s.pdfs.length, 0);
  const viewed = store.viewed.size;
  const pct    = Math.round((viewed / (visibleTotal || 1)) * 100);
  dom.progressText.textContent = `${viewed} of ${visibleTotal} notes viewed`;
  dom.progressPct.textContent  = `${pct}%`;
  dom.progressFill.style.width = `${pct}%`;
  dom.progressWrap?.setAttribute('aria-valuenow', pct);
}

/* ─────────────────────────────────────────────
   Sidebar toggle
───────────────────────────────────────────── */
function toggleSidebar() {
  state.sidebarOpen = !state.sidebarOpen;
  dom.app.classList.toggle('sidebar-collapsed', !state.sidebarOpen);
  dom.sidebarToggle.setAttribute('aria-expanded', String(state.sidebarOpen));
  if (window.innerWidth < 680) {
    dom.app.classList.toggle('sidebar-open', state.sidebarOpen);
  }
}

function closeSidebarOnMobile() {
  if (window.innerWidth < 680 && state.sidebarOpen) {
    state.sidebarOpen = false;
    dom.app.classList.remove('sidebar-open');
    dom.app.classList.add('sidebar-collapsed');
    dom.sidebarToggle.setAttribute('aria-expanded', 'false');
  }
}

/* ─────────────────────────────────────────────
   User menu
───────────────────────────────────────────── */
function toggleUserDropdown(force) {
  const open = typeof force === 'boolean' ? force : !state.dropdownOpen;
  state.dropdownOpen = open;
  dom.userDropdown.hidden = !open;
  dom.userAvatarBtn.setAttribute('aria-expanded', String(open));
}

/* ─────────────────────────────────────────────
   Keyboard navigation
───────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  // '/' → focus search (unless already in input)
  if (e.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
    e.preventDefault();
    dom.globalSearch.focus();
    dom.globalSearch.select();
  }
  // Escape
  if (e.key === 'Escape') {
    if (state.dropdownOpen)             { toggleUserDropdown(false); dom.userAvatarBtn.focus(); }
    else if (!dom.annotationPanel.hidden) { dom.annotationPanel.hidden = true; dom.annotateBtn.focus(); }
    else if (dom.globalSearch === document.activeElement) { dom.globalSearch.blur(); hideSearchDropdown(); }
  }
  // Arrow keys in search dropdown
  if (!dom.searchListbox.hidden && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
    e.preventDefault();
    navigateSearchResults(e.key === 'ArrowDown' ? 1 : -1);
  }
});

/* ─────────────────────────────────────────────
   Search integration (uses search.js FuzzySearch)
───────────────────────────────────────────── */
let searchDebounce;

function buildSearchIndex() {
  const items = [];
  SUBJECTS.forEach(sub => {
    sub.pdfs.forEach(p => {
      items.push({ id: p.id, name: p.name, subject: sub.name, icon: sub.icon, subjectId: sub.id });
    });
  });
  return items;
}

let searchItems;
let searchSelectedIdx = -1;

function initSearch() {
  searchItems = buildSearchIndex();

  dom.globalSearch.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => runSearch(dom.globalSearch.value.trim()), 120);
  });

  dom.globalSearch.addEventListener('focus', () => {
    if (dom.globalSearch.value.trim()) runSearch(dom.globalSearch.value.trim());
  });

  dom.globalSearch.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const selected = dom.searchListbox.querySelector('[aria-selected="true"]');
      if (selected) { selected.click(); }
      else {
        const first = dom.searchListbox.querySelector('[role="option"]');
        if (first) first.click();
      }
    }
  });

  document.addEventListener('click', e => {
    if (!dom.globalSearch.closest('.search-bar').contains(e.target)) hideSearchDropdown();
  });
}

function runSearch(q) {
  if (!q) { hideSearchDropdown(); return; }
  // Use FuzzySearch if loaded, else simple includes
  const results = window.FuzzySearch
    ? window.FuzzySearch.search(searchItems, q, { key: 'name', limit: 10 })
    : searchItems.filter(i => i.name.toLowerCase().includes(q.toLowerCase()) || i.subject.toLowerCase().includes(q.toLowerCase())).slice(0, 10);

  renderSearchResults(results, q);
  dom.globalSearch.setAttribute('aria-expanded', 'true');
}

function renderSearchResults(results, q) {
  dom.searchListbox.innerHTML = '';
  dom.searchListbox.hidden = false;
  searchSelectedIdx = -1;

  if (results.length === 0) {
    dom.searchListbox.innerHTML = `<div class="search-empty">No results for "<strong>${escHtml(q)}</strong>"</div>`;
    return;
  }
  results.forEach((item, i) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'option');
    li.setAttribute('id', `sr-${i}`);
    li.setAttribute('aria-selected', 'false');
    li.className = 'search-result';
    const highlightedName = window.FuzzySearch
      ? window.FuzzySearch.highlight(item.name, q)
      : escHtml(item.name);
    li.innerHTML = `
      <span class="search-result-icon" aria-hidden="true">${item.icon}</span>
      <span>
        <div class="search-result-name">${highlightedName}</div>
        <div class="search-result-sub">${escHtml(item.subject)}</div>
      </span>
    `;
    li.addEventListener('click', () => {
      hideSearchDropdown();
      dom.globalSearch.value = '';
      openPdf(item.id);
    });
    dom.searchListbox.appendChild(li);
  });
}

function navigateSearchResults(direction) {
  const items = [...dom.searchListbox.querySelectorAll('[role="option"]')];
  if (!items.length) return;
  items[searchSelectedIdx]?.setAttribute('aria-selected', 'false');
  searchSelectedIdx = Math.max(0, Math.min(items.length - 1, searchSelectedIdx + direction));
  items[searchSelectedIdx].setAttribute('aria-selected', 'true');
  items[searchSelectedIdx].scrollIntoView({ block: 'nearest' });
  dom.globalSearch.setAttribute('aria-activedescendant', `sr-${searchSelectedIdx}`);
}

function hideSearchDropdown() {
  dom.searchListbox.hidden = true;
  dom.globalSearch.setAttribute('aria-expanded', 'false');
  dom.globalSearch.removeAttribute('aria-activedescendant');
  searchSelectedIdx = -1;
}

/* ─────────────────────────────────────────────
   Offline detection
───────────────────────────────────────────── */
function initOffline() {
  const banner = $('offline-banner');
  const update = () => { banner.hidden = navigator.onLine; };
  window.addEventListener('online',  update);
  window.addEventListener('offline', update);
  update();
}

/* ─────────────────────────────────────────────
   Service Worker registration
───────────────────────────────────────────── */
function registerServiceWorker() {
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('[SW] registered', reg.scope))
      .catch(err => console.warn('[SW] registration failed', err));
  }
}

/* ─────────────────────────────────────────────
   Event wiring
───────────────────────────────────────────── */
function wireEvents() {
  // Sidebar toggle
  dom.sidebarToggle.addEventListener('click', toggleSidebar);

  // Home link — navigate back to landing page
  dom.homeLink.addEventListener('click', e => {
    e.preventDefault();
    window.location.href = '/';
  });

  // Close viewer
  dom.closeViewerBtn.addEventListener('click', closePdf);

  // Favorites view — require login
  dom.favoritesBtn.addEventListener('click', () => {
    if (!window.Auth?.user) { window.Auth?.openModal('login'); return; }
    showScreen('favorites');
    renderFavoritesGrid();
  });

  // Bookmarks view — require login
  dom.bookmarksBtn.addEventListener('click', () => {
    if (!window.Auth?.user) { window.Auth?.openModal('login'); return; }
    showScreen('bookmarks');
    renderBookmarksGrid();
  });

  // Annotate toggle
  dom.annotateBtn.addEventListener('click', () => {
    const open = dom.annotationPanel.hidden;
    dom.annotationPanel.hidden = !open;
    state.annotateMode = open;
    dom.annotateBtn.setAttribute('aria-pressed', String(open));
    if (open) {
      dom.annotationInput.focus();
      renderAnnotations(state.currentPdfId);
    }
  });

  // Close annotation panel
  dom.closeAnnotPanel.addEventListener('click', () => {
    dom.annotationPanel.hidden = true;
    dom.annotateBtn.setAttribute('aria-pressed', 'false');
    state.annotateMode = false;
    dom.annotateBtn.focus();
  });

  // Save annotation
  dom.annotationForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = dom.annotationInput.value.trim();
    const page = parseInt(dom.annotationPage.value, 10) || 1;
    if (!text || !state.currentPdfId) return;
    saveAnnotation(state.currentPdfId, text, page);
    dom.annotationInput.value = '';
  });

  // Bookmark page
  dom.bookmarkPageBtn.addEventListener('click', bookmarkCurrentPage);

  // Favorite from toolbar
  dom.favoriteBtn.addEventListener('click', () => { if (state.currentPdfId) toggleFavorite(state.currentPdfId); });

  // User menu
  dom.userAvatarBtn?.addEventListener('click', () => toggleUserDropdown());
  document.addEventListener('click', e => {
    if (dom.userMenu && !dom.userMenu.contains(e.target)) toggleUserDropdown(false);
  });

  // Profile
  dom.profileBtn?.addEventListener('click', () => {
    toggleUserDropdown(false);
    showScreen('profile');
    renderProfile();
  });

  // Logout is handled by auth.js (which redirects to / after sign out)

  // page-input is now hidden — no listeners needed

  // Mobile: tap outside sidebar to close it
  dom.app.addEventListener('click', e => {
    if (window.innerWidth < 680 && dom.app.classList.contains('sidebar-open')) {
      if (!dom.sidebar.contains(e.target) && e.target !== dom.sidebarToggle) {
        closeSidebarOnMobile();
      }
    }
  });
}

/* ─────────────────────────────────────────────
   Auth state listener (called from auth.js)
───────────────────────────────────────────── */
let _lastAuthUserId = null; // track last known user to avoid duplicate loads

window.onAuthStateChange = function(user) {
  if (user) {
    dom.authBtn.hidden     = true;
    dom.userMenu.hidden    = false;
    dom.userAvatarInit.textContent = (user.name || user.email || 'U')[0].toUpperCase();
    dom.userDropdownName.textContent = user.name || user.email;
    dom.adminBtn.hidden = !user.isAdmin;

    // Hide ads for admin users; show for everyone else
    if (dom.adCol) {
      dom.adCol.hidden = user.isAdmin;
      dom.app.classList.toggle('no-ads', user.isAdmin);
    }

    // Only wipe + reload data if a different user is logging in.
    // On refresh with the same user, skip the wipe so data doesn't flash away.
    if (_lastAuthUserId !== user.id) {
      if (_lastAuthUserId !== null) clearUserStore(); // different user — wipe previous
      _lastAuthUserId = user.id;
      dbSync.loadForUser(user.id);
    }
  } else {
    // Explicit logout — wipe everything
    _lastAuthUserId = null;
    dom.authBtn.hidden  = false;
    dom.userMenu.hidden = true;
    document.getElementById('admin-panel').hidden = true;
    if (dom.adCol) { dom.adCol.hidden = false; dom.app.classList.remove('no-ads'); }
    clearUserStore();
  }
};

/** Reset favorites & bookmarks in memory and localStorage */
function clearUserStore() {
  store.favorites  = new Set();
  store.bookmarks  = {};
  store.save();
  renderSidebarFavorites();
  renderFavoritesGrid();
  renderSidebarBookmarks();
  renderBookmarksGrid();
  updateProgress();
}

/* ─────────────────────────────────────────────
   Admin link
───────────────────────────────────────────── */
$('admin-btn')?.addEventListener('click', () => {
  toggleUserDropdown(false);
  window.Admin?.open();
});

/* ─────────────────────────────────────────────
   Profile screen
───────────────────────────────────────────── */
function renderProfile() {
  const user = window.Auth?.user;
  if (!user || !dom.profileContent) return;

  const viewedCount    = store.viewed.size;
  const favCount       = store.favorites.size;
  const bookmarkCount  = Object.values(store.bookmarks).reduce((n, arr) => n + arr.length, 0);
  const annotCount     = Object.values(store.annotations).reduce((n, arr) => n + arr.length, 0);

  // Per-subject progress
  const subjectProgress = SUBJECTS.map(sub => {
    const viewed = sub.pdfs.filter(p => store.viewed.has(p.id)).length;
    return { ...sub, viewed, pct: Math.round((viewed / sub.pdfs.length) * 100) };
  });

  // Recent activity from local event log
  const log = JSON.parse(localStorage.getItem('gh_event_log') || '[]');
  const recentOpens = log
    .filter(e => e.event === 'pdf_open' && e.pdfName)
    .slice(0, 8);

  dom.profileContent.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar">${escHtml((user.name || user.email || 'U')[0].toUpperCase())}</div>
      <div class="profile-info">
        <h1 class="profile-name">${escHtml(user.name || 'User')}</h1>
        <p class="profile-email">${escHtml(user.email)}</p>
        ${user.isAdmin ? '<p style="margin:4px 0 0;font-size:11px;color:#ff9f43;font-weight:700">Admin</p>' : ''}
      </div>
    </div>

    <div class="profile-stats">
      <div class="profile-stat-card"><div class="profile-stat-icon">📖</div><div class="profile-stat-val">${viewedCount}</div><div class="profile-stat-label">Notes Viewed</div></div>
      <div class="profile-stat-card"><div class="profile-stat-icon">❤</div><div class="profile-stat-val">${favCount}</div><div class="profile-stat-label">Favorites</div></div>
      <div class="profile-stat-card"><div class="profile-stat-icon">🔖</div><div class="profile-stat-val">${bookmarkCount}</div><div class="profile-stat-label">Bookmarks</div></div>
      <div class="profile-stat-card"><div class="profile-stat-icon">📝</div><div class="profile-stat-val">${annotCount}</div><div class="profile-stat-label">Annotations</div></div>
    </div>

    <h2 class="profile-section-title">Subject Progress</h2>
    <div class="profile-subjects">
      ${subjectProgress.map(sub => `
        <div class="profile-subject-row">
          <span>${sub.icon}</span>
          <span>${escHtml(sub.name)}</span>
          <div class="profile-subject-bar-wrap">
            <div class="profile-subject-bar-fill" style="width:${sub.pct}%;background:${sub.color}"></div>
          </div>
          <span class="profile-subject-count">${sub.viewed}/${sub.pdfs.length}</span>
        </div>
      `).join('')}
    </div>

    ${recentOpens.length ? `
      <h2 class="profile-section-title">Recent Activity</h2>
      <ul class="profile-activity">
        ${recentOpens.map(e => `
          <li class="profile-activity-item">
            <span>📄</span>
            <span>${escHtml(e.pdfName)}</span>
            <span class="profile-activity-time">${e.timestamp ? new Date(e.timestamp).toLocaleDateString('en-IN') : ''}</span>
          </li>
        `).join('')}
      </ul>
    ` : ''}
  `;
}

/* ─────────────────────────────────────────────
   Utility
───────────────────────────────────────────── */
function escHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* ─────────────────────────────────────────────
   Bootstrap
───────────────────────────────────────────── */
/* Called by admin.js after custom notes change — rebuilds PDF_MAP + search + sidebar */
function refreshCustomNotes() {
  loadCustomNotesIntoPdfMap();
  searchItems = buildSearchIndex();
  renderSidebar();
}

function init() {
  loadCustomNotesIntoPdfMap();
  renderSidebar();
  renderWelcome();
  renderSidebarFavorites();
  renderSidebarBookmarks();
  updateProgress();
  initSearch();
  initOffline();
  registerServiceWorker();
  wireEvents();
  // Expose for search.js / auth.js / admin.js
  window.App = { openPdf, SUBJECTS, PDF_MAP, SUBJECT_MAP, refreshCustomNotes, renderSidebar };

  // Bootstrap auth state — in case auth.js already restored the session
  // before window.onAuthStateChange was set (timing gap between deferred scripts)
  const existingUser = window.Auth?.user;
  if (existingUser) window.onAuthStateChange(existingUser);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
