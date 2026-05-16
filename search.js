/**
 * GATE Prep Hub — search.js
 * Trigram-based fuzzy search with match highlighting.
 *
 * Algorithm:
 *  1. Build a trigram set for each item name at index time.
 *  2. At query time, generate query trigrams and score each item by
 *     Jaccard similarity (intersection / union).
 *  3. Boost items whose name contains the query as a substring.
 *  4. Return results sorted by score descending, limited to `limit`.
 *  5. Highlight: find the best contiguous match window and wrap in <mark>.
 */
'use strict';

(function () {
  /* Build a Set of all trigrams from a normalised string */
  function trigrams(str) {
    const s = str.toLowerCase().replace(/\s+/g, ' ');
    const set = new Set();
    // include unigrams and bigrams for short queries
    for (let i = 0; i < s.length; i++) {
      set.add(s[i]);
      if (i + 1 < s.length) set.add(s.slice(i, i + 2));
      if (i + 2 < s.length) set.add(s.slice(i, i + 3));
    }
    return set;
  }

  /* Jaccard similarity between two Sets */
  function jaccard(a, b) {
    let inter = 0;
    a.forEach(t => { if (b.has(t)) inter++; });
    const union = a.size + b.size - inter;
    return union === 0 ? 0 : inter / union;
  }

  /* Escape HTML special chars */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* Build highlighted HTML: wrap the best-matching region in <mark> */
  function highlight(text, query) {
    if (!query) return esc(text);
    const lo  = text.toLowerCase();
    const q   = query.toLowerCase().trim();

    // Try exact substring first (greedy left-to-right)
    let start = lo.indexOf(q);
    if (start !== -1) {
      return esc(text.slice(0, start))
        + '<mark>' + esc(text.slice(start, start + q.length)) + '</mark>'
        + esc(text.slice(start + q.length));
    }

    // Fuzzy: find best contiguous window by character coverage
    const words = q.split(/\s+/).filter(Boolean);
    let best = { start: 0, end: 0, score: 0 };
    words.forEach(word => {
      let idx = 0;
      while ((idx = lo.indexOf(word, idx)) !== -1) {
        const score = word.length;
        if (score > best.score) best = { start: idx, end: idx + word.length, score };
        idx++;
      }
    });

    if (best.score === 0) return esc(text);
    return esc(text.slice(0, best.start))
      + '<mark>' + esc(text.slice(best.start, best.end)) + '</mark>'
      + esc(text.slice(best.end));
  }

  /**
   * Search an array of objects.
   * @param {Object[]} items   - Array of objects to search
   * @param {string}   query   - Search query
   * @param {Object}   opts
   *   opts.key    {string}  - Property to match against (default 'name')
   *   opts.limit  {number}  - Max results (default 8)
   *   opts.threshold {number} - Min similarity 0–1 (default 0.1)
   */
  function search(items, query, opts = {}) {
    const key       = opts.key       || 'name';
    const limit     = opts.limit     || 8;
    const threshold = opts.threshold || 0.08;

    if (!query || !query.trim()) return [];

    const q      = query.trim();
    const qTri   = trigrams(q);
    const qLo    = q.toLowerCase();

    const scored = items.map(item => {
      const val  = String(item[key] || '');
      const vLo  = val.toLowerCase();
      const vTri = trigrams(val);

      let score = jaccard(qTri, vTri);

      // Strong boost for exact substring
      if (vLo.includes(qLo)) score += 0.6;

      // Boost for each query word found in value
      qLo.split(/\s+/).forEach(word => {
        if (word && vLo.includes(word)) score += 0.15;
      });

      // Boost for match at word boundary (starts with query word)
      if (vLo.startsWith(qLo)) score += 0.25;

      // Secondary key boost (e.g. subject name)
      if (opts.secondaryKey) {
        const sec = String(item[opts.secondaryKey] || '').toLowerCase();
        if (sec.includes(qLo)) score += 0.1;
      }

      return { item, score };
    });

    return scored
      .filter(r => r.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.item);
  }

  /* Public API */
  window.FuzzySearch = { search, highlight, trigrams };
})();
