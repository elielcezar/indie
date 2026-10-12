/* =========================================================
   Indie Showcase — interactions (vanilla JS, requestAnimationFrame loops)
   1. Core: mobile menu, camera drift, horizontal gallery, magnetic buttons,
card tilt, single-open FAQ
   2. Warp Title reveal (IntersectionObserver)
   3. Aether stage (hero) parallax: writes CSS variables on #top
   4. Dev cycle timeline: scroll-driven line, dots and SVG stroke drawing
   Logic ported from the reference page; only the hero loader changed (see 3).
   ========================================================= */

/* ---------- 1. Core ---------- */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = window.matchMedia('(min-width: 1024px)');

  const menuButton = document.getElementById('menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    mobileMenu.classList.toggle('hidden', open);
    menuButton.querySelector('iconify-icon').setAttribute(
'icon',
open ? 'solar:hamburger-menu-linear' : 'solar:close-square-linear'
    );
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
mobileMenu.classList.add('hidden');
menuButton.setAttribute('aria-expanded', 'false');
menuButton.querySelector('iconify-icon').setAttribute('icon', 'solar:hamburger-menu-linear');
    });
  });

  const cameraSection = document.querySelector('[data-camera]');
  const cameraMedia = document.querySelector('[data-camera-media]');
  const gallerySection = document.getElementById('gallery');
  const galleryTrack = document.getElementById('gallery-track');
  const galleryProgress = document.getElementById('gallery-progress');
  const galleryCards = [...document.querySelectorAll('.gallery-card')];

  let targetGallery = 0;
  let currentGallery = 0;
  let maxGallery = 0;
  let frameRequested = false;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  function measureGallery() {
    if (!galleryTrack) return;
    const horizontalPadding = window.innerWidth >= 1024 ? 112 : 48;
    maxGallery = Math.max(0, galleryTrack.scrollWidth - window.innerWidth + horizontalPadding);
  }

  function updateTargets() {
    if (cameraSection && cameraMedia && !reduceMotion) {
const rect = cameraSection.getBoundingClientRect();
const progress = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0, 1);
cameraMedia.style.transform = `scale(${1.04 - progress * 0.04}) translate3d(0, ${progress * 1.5}%, 0)`;
    }

    if (desktop.matches && gallerySection && !reduceMotion) {
const rect = gallerySection.getBoundingClientRect();
const distance = Math.max(1, gallerySection.offsetHeight - window.innerHeight);
const progress = clamp(-rect.top / distance, 0, 1);
targetGallery = progress * maxGallery;
galleryProgress.style.transform = `scaleX(${progress})`;
    }

    if (!frameRequested) {
frameRequested = true;
requestAnimationFrame(render);
    }
  }

  function render() {
    frameRequested = false;

    if (desktop.matches && !reduceMotion) {
currentGallery += (targetGallery - currentGallery) * 0.12;
galleryTrack.style.transform = `translate3d(${-currentGallery}px,0,0)`;

const viewportCenter = window.innerWidth / 2;
galleryCards.forEach((card) => {
  const rect = card.getBoundingClientRect();
  const cardCenter = rect.left + rect.width / 2;
  const distance = Math.abs(cardCenter - viewportCenter);
  const normalized = clamp(distance / window.innerWidth, 0, 1);
  const scale = 1 - normalized * 0.06;
  const opacity = 1 - normalized * 0.45;
  card.style.transform = `scale(${scale})`;
  card.style.opacity = String(opacity);
});

if (Math.abs(targetGallery - currentGallery) > 0.1) {
  frameRequested = true;
  requestAnimationFrame(render);
}
    } else {
galleryTrack.style.transform = '';
galleryCards.forEach((card) => {
  card.style.transform = '';
  card.style.opacity = '';
});
    }
  }

  if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach((button) => {
button.addEventListener('pointermove', (event) => {
  const rect = button.getBoundingClientRect();
  const x = clamp((event.clientX - rect.left - rect.width / 2) * 0.12, -6, 6);
  const y = clamp((event.clientY - rect.top - rect.height / 2) * 0.12, -6, 6);
  button.style.transform = `translate3d(${x}px,${y}px,0)`;
});

button.addEventListener('pointerleave', () => {
  button.style.transform = '';
});
    });

    galleryCards.forEach((card) => {
card.addEventListener('pointermove', (event) => {
  if (!desktop.matches) return;
  const rect = card.getBoundingClientRect();
  const rotateY = clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
  const rotateX = clamp(-((event.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1);
  card.style.transform = `perspective(80rem) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});
    });
  }

  document.querySelectorAll('details').forEach((detail) => {
    detail.addEventListener('toggle', () => {
if (!detail.open) return;
document.querySelectorAll('details').forEach((other) => {
  if (other !== detail) other.removeAttribute('open');
});
    });
  });

  measureGallery();
  updateTargets();

  window.addEventListener('scroll', updateTargets, { passive: true });
  window.addEventListener('resize', () => {
    measureGallery();
    updateTargets();
  });

  desktop.addEventListener('change', () => {
    measureGallery();
    updateTargets();
  });
})();

/* ---------- 2. Warp Title reveal ---------- */
(() => {
  const titles = [...document.querySelectorAll('[data-warp-title]')];
  if (!titles.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  titles.forEach((title) => {
    const content = document.createElement('span');
    content.className = 'warp-title-content';
    while (title.firstChild) content.appendChild(title.firstChild);
    title.appendChild(content);

    if (reducedMotion) return;

    title.classList.add('warp-title-pending');

    let pointerX = 0;
    let pointerY = 0;
    let currentX = 0;
    let currentY = 0;
    let active = false;
    let revealed = false;
    let frame = 0;
    const phase = Math.random() * Math.PI * 2;

    const renderWarp = (time) => {
if (!revealed) {
  frame = requestAnimationFrame(renderWarp);
  return;
}

const ambientX = Math.sin(time * 0.00048 + phase) * 0.45;
const ambientY = Math.cos(time * 0.00037 + phase) * 0.22;
const targetX = active ? pointerX : ambientX;
const targetY = active ? pointerY : ambientY;
currentX += (targetX - currentX) * (active ? 0.1 : 0.035);
currentY += (targetY - currentY) * (active ? 0.1 : 0.035);

const scaleX = 1 + Math.abs(currentX) * 0.0018;
const scaleY = 1 - Math.abs(currentY) * 0.0014;
content.style.transform = `translate3d(${currentX * 0.55}px, ${currentY * 0.35}px, 0) scale3d(${scaleX}, ${scaleY}, 1) skewY(${currentX * 0.035}deg)`;
frame = requestAnimationFrame(renderWarp);
    };

    title.addEventListener('pointermove', (event) => {
if (event.pointerType === 'touch') return;
const rect = title.getBoundingClientRect();
pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 5;
active = true;
    });

    title.addEventListener('pointerleave', () => {
active = false;
    });

    title.addEventListener('animationend', () => {
revealed = true;
title.classList.remove('warp-title-reveal');
content.style.opacity = '1';
content.style.clipPath = 'none';
content.style.filter = 'none';
    }, { once: true });

    title._startWarp = () => {
requestAnimationFrame(() => {
  title.classList.remove('warp-title-pending');
  title.classList.add('warp-title-reveal');
});
frame = requestAnimationFrame(renderWarp);
    };
  });

  if (reducedMotion) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
if (!entry.isIntersecting || !entry.target._startWarp) return;
entry.target._startWarp();
observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -8% 0px'
  });

  titles.forEach((title) => observer.observe(title));
})();

/* ---------- 3. Aether stage (hero) ---------- */
(() => {
  const stage = document.getElementById('top');
  if (!stage) return;
  const loader = stage.querySelector('.aether-loader');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const state = { tx: 0, ty: 0, x: 0, y: 0, ts: 0, s: 0, rockPhase: 0, last: performance.now() };
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const lerp = (a, b, t) => a + (b - a) * t;

  function setPointer(clientX, clientY) {
    if (reduced) return;
    state.tx = clamp((clientX / innerWidth - 0.5) * 2, -1, 1);
    state.ty = clamp((clientY / innerHeight - 0.5) * 2, -1, 1);
  }
  // --scroll: 0 at the top of the 420svh track, 1 when its sticky child releases
  function readScroll() {
    const rect = stage.getBoundingClientRect();
    const travel = Math.max(1, stage.offsetHeight - innerHeight);
    state.ts = reduced ? 0 : clamp(-rect.top / travel, 0, 1);
  }
  function frame(now) {
    const dt = Math.min(32, now - state.last);
    state.last = now;
    const pointerEase = 1 - Math.pow(0.001, (dt / 1000) * 3.8);
    const scrollEase = 1 - Math.pow(0.001, (dt / 1000) * 5.2);
    state.x = lerp(state.x, state.tx, pointerEase);
    state.y = lerp(state.y, state.ty, pointerEase);
    state.s = lerp(state.s, state.ts, scrollEase);
    state.rockPhase += dt * 0.00034;
    stage.style.setProperty('--mx', state.x.toFixed(4));
    stage.style.setProperty('--my', state.y.toFixed(4));
    stage.style.setProperty('--scroll', state.s.toFixed(4));
    stage.style.setProperty('--rock-x', `${(Math.sin(state.rockPhase * 0.72) * 4.2).toFixed(2)}px`);
    stage.style.setProperty('--rock-y', `${(Math.sin(state.rockPhase) * 6.5).toFixed(2)}px`);
    stage.style.setProperty('--rock-r', `${(Math.sin(state.rockPhase * 0.55) * 0.22).toFixed(3)}deg`);
    requestAnimationFrame(frame);
  }

  addEventListener('pointermove', (event) => setPointer(event.clientX, event.clientY), { passive: true });
  addEventListener('pointerleave', () => { state.tx = 0; state.ty = 0; }, { passive: true });
  addEventListener('touchmove', (event) => {
    if (event.touches[0]) setPointer(event.touches[0].clientX, event.touches[0].clientY);
  }, { passive: true });
  addEventListener('scroll', readScroll, { passive: true });
  addEventListener('resize', readScroll, { passive: true });

  // The loader waits for the first-light layers only. The source also waited for
  // the 7.6 MB world-two PNG, which kept a flat blue screen up for seconds;
  // that layer is invisible until --scroll passes .44, so it decodes in the background.
  const firstLight = [...stage.querySelectorAll('img:not(.aether-world-two)')];
  const hideLoader = () => requestAnimationFrame(() => loader && loader.classList.add('is-hidden'));
  Promise.race([
    Promise.all(firstLight.map((image) => (image.decode ? image.decode().catch(() => {}) : Promise.resolve()))),
    new Promise((resolve) => setTimeout(resolve, 8000))
  ]).finally(hideLoader);

  if (coarse) { state.tx = 0.08; state.ty = -0.04; }
  readScroll();
  requestAnimationFrame(frame);
})();

/* ---------- 4. Dev cycle timeline ---------- */
(() => {
  const section = document.getElementById('dev-cycle-timeline');
  if (!section) return;
  const mainLine = document.getElementById('dev-timeline-main-line');
  const items = section.querySelectorAll('.dev-timeline-item');
  let frameRequested = false;
  const render = () => {
    frameRequested = false;
    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const start = viewportHeight * 0.9;
    const end = viewportHeight * 0.2;
    let progress = (start - rect.top) / (start - end);
    progress = Math.max(0, Math.min(1, progress));
    if (mainLine) {
mainLine.style.transform = `scaleX(${progress})`;
    }
    const totalItems = items.length;
    items.forEach((item, index) => {
const itemStart = (index / totalItems) * 0.6;
const itemEnd = itemStart + 0.4;
let itemProgress = (progress - itemStart) / (itemEnd - itemStart);
itemProgress = Math.max(0, Math.min(1, itemProgress));
const dot = item.querySelector('.dev-timeline-dot');
const line = item.querySelector('.dev-timeline-line line');
const content = item.querySelector('.dev-timeline-content');
if (dot) {
  let dotProgress = Math.min(1, itemProgress / 0.3);
  dot.style.transform = `scale(${dotProgress})`;
  dot.style.opacity = dotProgress.toString();
  if (dotProgress === 1 && itemProgress < 1) {
    dot.classList.add('dev-dot-pulsing');
  } else {
    dot.classList.remove('dev-dot-pulsing');
  }
}
if (line) {
  let lineProgress = Math.max(0, Math.min(1, (itemProgress - 0.3) / 0.4));
  line.style.strokeDashoffset = (40 - (40 * lineProgress)).toString();
}
if (content) {
  let contentProgress = Math.max(0, Math.min(1, (itemProgress - 0.6) / 0.4));
  content.style.opacity = contentProgress.toString();
  content.style.transform = `translate3d(0, ${(1 - contentProgress) * 16}px, 0)`;
}
    });
  };
  const requestRender = () => {
    if (!frameRequested) {
frameRequested = true;
requestAnimationFrame(render);
    }
  };
  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender, { passive: true });
  requestRender();
})();
