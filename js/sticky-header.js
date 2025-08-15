/* js/sticky-header.js */

/* Measure header (and expose --header-h) */
(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const setHeaderH = () => {
    const h = Math.round(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--header-h', `${h}px`);
  };

  document.addEventListener('DOMContentLoaded', setHeaderH);
  window.addEventListener('load', setHeaderH);
  window.addEventListener('resize', setHeaderH);
  if (window.ResizeObserver) new ResizeObserver(setHeaderH).observe(header);
})();

/* Home only: do the absolute → fixed swap for the glass effect */
(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const isHome = document.body.classList.contains('home');

  const onScroll = () => {
    const fixed = window.scrollY > 1;
    // Only home uses the .is-fixed swap; non-home stays fixed via CSS from load.
    header.classList.toggle('is-fixed', fixed && isHome);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* Active pill (header + footer) */
(() => {
  const links = document.querySelectorAll('.main-nav a[href], .footer-nav a[href]');
  if (!links.length) return;

  const normalize = (path) => {
    const clean = (path || '').split('#')[0].split('?')[0];
    let last = clean.split('/').pop().toLowerCase();
    return last || 'index.html';
  };

  const current = normalize(location.pathname);
  links.forEach(a => {
    const href = normalize(a.getAttribute('href') || '');
    if (href === current) a.setAttribute('aria-current', 'page');
  });
})();

/* ===== MENU TABS “attached under header” behavior ===== */
(() => {
  const header = document.querySelector('.site-header');
  const tabs   = document.querySelector('.menu-tabs');
  const main   = document.querySelector('main.menu');
  if (!header || !tabs || !main) return;

  const root = document.documentElement;

  // Helpers
  const headerH = () => Math.round(header.getBoundingClientRect().height);
  const tabsH   = () => Math.round(tabs.getBoundingClientRect().height);
  const pageTop = (el) => el.getBoundingClientRect().top + window.scrollY;

  let threshold = 0;

  function setVarsAndThreshold() {
    // expose sizes as CSS vars (also used by your CSS)
    root.style.setProperty('--header-h', `${headerH()}px`);
    root.style.setProperty('--tabs-h',   `${tabsH()}px`);
    // the point at which tabs should stick to the header
    threshold = pageTop(tabs) - headerH();
  }

  function onScroll() {
    if (window.scrollY >= threshold) {
      tabs.classList.add('is-fixed');
      main.classList.add('with-tabs-fixed');   // add spacing so content doesn’t jump up
    } else {
      tabs.classList.remove('is-fixed');
      main.classList.remove('with-tabs-fixed');
    }
  }

  const refresh = () => { setVarsAndThreshold(); onScroll(); };

  // Init + keep fresh
  document.addEventListener('DOMContentLoaded', refresh);
  window.addEventListener('load', refresh);
  window.addEventListener('resize', refresh);
  window.addEventListener('orientationchange', refresh);
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(refresh);
    ro.observe(header);
    ro.observe(tabs);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ----- MENU TABS: attach under header from page load ----- */
(() => {
  const header = document.querySelector('.site-header');
  const tabs   = document.querySelector('.menu-tabs');
  const menu   = document.querySelector('main.menu');
  if (!header || !tabs || !menu) return;

  const setVars = () => {
    const hh = Math.round(header.getBoundingClientRect().height) || 0;
    document.documentElement.style.setProperty('--header-h', `${hh}px`);

    // Temporarily position tabs as normal to measure true height
    tabs.classList.remove('is-fixed');
    const th = Math.round(tabs.getBoundingClientRect().height) || 0;
    document.documentElement.style.setProperty('--tabs-h', `${th}px`);

    // Now fix it under the header and pad the content once
    tabs.classList.add('is-fixed');
    menu.classList.add('with-tabs-fixed');
  };

  // Run early and keep fresh
  document.addEventListener('DOMContentLoaded', setVars);
  window.addEventListener('load', setVars);
  window.addEventListener('resize', setVars);
  window.addEventListener('orientationchange', setVars);
})();
