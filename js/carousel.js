// js/carousel.js — gapless continuous scroll with contain images
document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.querySelector('.banner-carousel');
  if (!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  if (!track) return;

  const originals = Array.from(track.children);
  if (originals.length < 2) return;

  // Clone once: A B  ->  A B  A B   (lets us scroll one full "half" width)
  originals.forEach(node => track.appendChild(node.cloneNode(true)));

  // When images are loaded, measure and start
  const imgs = track.querySelectorAll('img');
  let pending = imgs.length;

  const ready = () => {
    if (--pending <= 0) start();
  };

  if (pending === 0) start();
  else {
    imgs.forEach(img => {
      if (img.complete) ready();
      else {
        img.addEventListener('load',  ready, { once: true });
        img.addEventListener('error', ready, { once: true });
      }
    });
  }

  function start() {
    // Measure half the total width (first A+B)
    const halfWidth = track.scrollWidth / 2;
    track.style.setProperty('--loop-w', `${halfWidth}px`);

    // Set duration based on pixels per second so speed feels consistent
    const PPS = 80; // pixels per second (tweak for taste)
    const duration = halfWidth / PPS;
    track.style.setProperty('--duration', `${duration}s`);

    carousel.classList.add('is-ready');
  }

  // Recalculate on resize (debounced)
  let to;
  window.addEventListener('resize', () => {
    clearTimeout(to);
    to = setTimeout(() => {
      // Temporarily stop animation to measure accurately
      track.style.animation = 'none';
      requestAnimationFrame(() => {
        start();
        // allow animation to re-apply
        track.style.animation = '';
      });
    }, 150);
  });
});
