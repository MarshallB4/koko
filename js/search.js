// js/search.js
(() => {
  const resultsEl = document.getElementById('search-results');
  const form = document.querySelector('.nav-search-form');
  const input = form?.querySelector('input[name="q"]');

  // current query from ?q=
  const params = new URLSearchParams(location.search);
  const q = (params.get('q') || '').trim();
  if (input) input.value = q;

  // utils
  const esc = (s = '') =>
    s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;' }[c]));

  const makeMarkRe = (term = '') => {
    const tokens = term.split(/\s+/).filter(Boolean).map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return tokens.length ? new RegExp(`(${tokens.join('|')})`, 'ig') : null;
  };

  const normalize = (item) => {
    const tags = Array.isArray(item.tags) ? item.tags.join(' ') : (item.tags || '');
    return `${item.title || ''} ${item.category || ''} ${item.desc || ''} ${tags}`.toLowerCase();
  };

  const filterHits = (list, term) => {
    const tokens = term.toLowerCase().split(/\s+/).filter(Boolean);
    if (!tokens.length) return [];
    return list.filter(it => {
      const hay = normalize(it);
      // AND match: every token must appear
      return tokens.every(t => hay.includes(t));
    });
  };

  const render = (index) => {
    if (!resultsEl) return; // not on search.html
    if (!q) {
      resultsEl.innerHTML = `<p>Type to search the site (menu items, location, hours…)</p>`;
      return;
    }

    const hits = filterHits(index, q);
    if (!hits.length) {
      resultsEl.innerHTML = `<p>No results for <strong>${esc(q)}</strong>.</p>`;
      return;
    }

    const markRe = makeMarkRe(q);

    const items = hits.map(it => {
      const title = esc(it.title).replace(markRe, '<mark>$1</mark>');
      const desc  = esc(it.desc || '').replace(markRe, '<mark>$1</mark>');
      const cat   = esc(it.category || '');
      return `
        <article class="search-hit" style="padding:12px 0; border-bottom:1px solid rgba(0,0,0,.08);">
          <div class="eyebrow" style="font-size:.8rem; opacity:.7; margin-bottom:.25rem;">${cat}</div>
          <h3 style="margin:.1rem 0 .25rem; font-size:1.1rem;">
            <a href="${it.url}">${title}</a>
          </h3>
          ${desc ? `<p style="margin:0; color:rgba(0,0,0,.7); font-size:.95rem; line-height:1.45;">${desc}</p>` : ``}
        </article>`;
    }).join('');

    resultsEl.innerHTML =
      `<p style="margin:.25rem 0 .75rem;">${hits.length} result${hits.length > 1 ? 's' : ''} for <strong>${esc(q)}</strong></p>${items}`;
  };

  // Load index and render (bust cache so updates show up)
  fetch('assets/search-index.json?v=3', { cache: 'no-store' })
    .then(r => r.json())
    .then(render)
    .catch(() => { if (resultsEl) resultsEl.innerHTML = `<p>Search index missing.</p>`; });

  // Keep the nav search working everywhere
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const term = (input?.value || '').trim();
      const url = new URL('/search.html', location.origin);
      if (term) url.searchParams.set('q', term);
      location.assign(url.toString());
    });
  }
})();
