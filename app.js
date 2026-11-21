
(() => {
  'use strict';

  /* ---------- DOM ---------- */
  const stage   = document.getElementById('stage');
  const dotsEl  = document.getElementById('dots');
  const counter = document.getElementById('slideCounter');
  const bar     = document.getElementById('progressBar');
  const brandEl = document.getElementById('brandText');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  const state = { els: [], index: -1 };

  /* ---------- helpers ---------- */
  const pad   = n => String(n).padStart(2, '0');
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  function el(tag, cls, html) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function revealer() {
    let i = 0;
    return node => {
      node.classList.add('reveal');
      node.style.setProperty('--i', i++);
      return node;
    };
  }

  /* ---------- slide builders ---------- */

  function buildCover(d, inner, rv) {
    inner.classList.add('slide-inner--center');
    if (d.eyebrow)  inner.appendChild(rv(el('p', 'eyebrow', d.eyebrow)));
    inner.appendChild(rv(el('h1', 'title title--gradient', d.title || '')));
    if (d.subtitle) inner.appendChild(rv(el('p', 'subtitle', d.subtitle)));
    if (d.text)     inner.appendChild(rv(el('p', 'lead', d.text)));
    if (d.hint !== false) {
      inner.appendChild(
        rv(el('p', 'hint', d.hint || 'Swipe to continue'))
      );
    }
  }

  function buildContent(d, inner, rv) {
    const hasImage = Boolean(d.image);
    if (hasImage) inner.classList.add('split');

    const col = el('div', 'col');
    if (d.eyebrow) col.appendChild(rv(el('p', 'eyebrow', d.eyebrow)));
    if (d.title)   col.appendChild(rv(el('h2', 'title title--sm', d.title)));
    if (d.text)    col.appendChild(rv(el('p', 'lead', d.text)));

    if (Array.isArray(d.bullets) && d.bullets.length) {
      const ul = el('ul', 'bullets');
      d.bullets.forEach(b => ul.appendChild(rv(el('li', null, b))));
      col.appendChild(ul);
    }

    if (Array.isArray(d.keys) && d.keys.length) {
      const keys = el('div', 'keys');
      d.keys.forEach(k => {
        const label = typeof k === 'string' ? k : k.key;
        const desc  = typeof k === 'string' ? null : k.label;
        const cap   = el('span', 'keycap');
        cap.appendChild(el('kbd', null, label));
        if (desc) cap.appendChild(el('span', 'keycap-label', desc));
        keys.appendChild(cap);
      });
      col.appendChild(rv(keys));
    }

    inner.appendChild(col);

    if (hasImage) {
      const fig = el('figure', 'media');
      const img = el('img');
      img.src = d.image;
      img.alt = d.imageAlt || d.title || '';
      img.loading = 'lazy';
      fig.appendChild(img);
      inner.appendChild(rv(fig));
    }
  }

  function buildCards(d, inner, rv) {
    inner.classList.add('slide-inner--center');
    if (d.eyebrow) inner.appendChild(rv(el('p', 'eyebrow', d.eyebrow)));
    if (d.title)   inner.appendChild(rv(el('h2', 'title title--sm', d.title)));
    if (d.text)    inner.appendChild(rv(el('p', 'lead', d.text)));

    const grid = el('div', 'cards');
    (d.cards || []).forEach((c, i) => {
      const card = el('article', 'card');
      card.appendChild(el('span', 'card-num', pad(i + 1)));
      if (c.icon)  card.appendChild(el('span', 'card-icon', c.icon));
      if (c.title) card.appendChild(el('h3', 'card-title', c.title));
      if (c.text)  card.appendChild(el('p', 'card-text', c.text));
      grid.appendChild(rv(card));
    });
    inner.appendChild(grid);
  }

  function buildEnd(d, inner, rv) {
    inner.classList.add('slide-inner--center');
    if (d.eyebrow) inner.appendChild(rv(el('p', 'eyebrow', d.eyebrow)));
    inner.appendChild(rv(el('h2', 'title title--gradient', d.title || 'MERRY MISCHIEF')));
    if (d.text) inner.appendChild(rv(el('p', 'lead', d.text)));

    const btn = el('button', 'btn btn--primary');
    btn.type = 'button';
    btn.textContent = 'Back';
    btn.setAttribute('aria-label', 'Back to the first slide');
    btn.addEventListener('click', () => goTo(0));
    inner.appendChild(rv(btn));
  }

  function buildSlide(data, idx) {
    const type = data.type || 'content';
    const sec  = el('section', `slide slide--${type}`);
    sec.setAttribute('role', 'group');
    sec.setAttribute('aria-label', `Slide ${idx + 1}`);
    if (data.accent)  sec.style.setProperty('--accent', data.accent);
    if (data.accent2) sec.style.setProperty('--accent-2', data.accent2);

    const rv    = revealer();
    const inner = el('div', 'slide-inner');

    if (type === 'cover')      buildCover(data, inner, rv);
    else if (type === 'cards') buildCards(data, inner, rv);
    else if (type === 'end')   buildEnd(data, inner, rv);
    else                       buildContent(data, inner, rv);

    sec.appendChild(inner);
    return sec;
  }

  /* ---------- navigation ---------- */

  function goTo(i) {
    const total = state.els.length;
    if (!total) return;
    i = clamp(i, 0, total - 1);
    if (i === state.index) return;

    const previous = state.els[state.index];
    if (previous) previous.classList.remove('is-active');

    state.index = i;
    const current = state.els[i];
    current.classList.add('is-active');
    current.scrollTop = 0;
    syncHud();
  }

  const next = () => goTo(state.index + 1);
  const prev = () => goTo(state.index - 1);

  function syncHud() {
    const total = state.els.length;
    counter.textContent = `${pad(state.index + 1)} / ${pad(total)}`;
    bar.style.width = total > 1 ? (state.index / (total - 1)) * 100 + '%' : '100%';
    Array.from(dotsEl.children).forEach((dot, i) =>
      dot.classList.toggle('is-active', i === state.index)
    );
    prevBtn.disabled = state.index === 0;
    nextBtn.disabled = state.index === total - 1;
  }

  /* ---------- render ---------- */

  function render(data) {
    const slides = Array.isArray(data) ? data : (data.slides || []);
    if (!slides.length) throw new Error('The config contains no slides.');

    if (!Array.isArray(data) && data.meta) {
      if (data.meta.title) document.title = data.meta.title;
      if (data.meta.brand || data.meta.title) {
        brandEl.textContent = data.meta.brand || data.meta.title;
      }
    }

    state.els = slides.map((slide, i) => buildSlide(slide, i));
    state.els.forEach(node => stage.appendChild(node));

    slides.forEach((_, i) => {
      const dot = el('button', 'dot-btn');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    });

    goTo(0);
  }

  /* ---------- error state ---------- */

  function showError(err) {
    console.error(err);
    const overlay = el('div', 'error-overlay');
    const card    = el('div', 'error-card');
    card.appendChild(el('h2', 'error-title', 'Config not loaded'));
    card.appendChild(el('p', 'error-text',
      `<code>${String(err.message || err)}</code>`));
    card.appendChild(el('p', 'error-text',
      'Make sure <code>slides.js</code> is in the same folder as <code>index.html</code> ' +
      'and is loaded <em>before</em> <code>app.js</code>.'));
    overlay.appendChild(card);
    document.body.appendChild(overlay);
  }

  /* ---------- input ---------- */

  prevBtn.addEventListener('click', () => { prev(); prevBtn.blur(); });
  nextBtn.addEventListener('click', () => { next(); nextBtn.blur(); });

  window.addEventListener('keydown', e => {
    const t = e.target;
    // Let focused controls keep their normal keyboard behaviour.
    if (t && t.closest && t.closest('button, a, input, textarea, select, [contenteditable="true"]')) return;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
        e.preventDefault(); next(); break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault(); prev(); break;
      case 'Home':
        e.preventDefault(); goTo(0); break;
      case 'End':
        e.preventDefault(); goTo(state.els.length - 1); break;
    }
  });

  // Pointer gestures support touch and stylus while CSS touch-action: pan-y
  // keeps normal vertical reading/scrolling available on mobile.
  let pointerStart = null;
  stage.addEventListener('pointerdown', e => {
    if (!e.isPrimary || e.pointerType === 'mouse') return;
    if (e.target.closest('button, a, input, textarea, select, [contenteditable="true"]')) return;
    pointerStart = { x: e.clientX, y: e.clientY, id: e.pointerId };
  }, { passive: true });

  stage.addEventListener('pointerup', e => {
    if (!pointerStart || e.pointerId !== pointerStart.id) return;
    const dx = e.clientX - pointerStart.x;
    const dy = e.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
    dx < 0 ? next() : prev();
  }, { passive: true });

  stage.addEventListener('pointercancel', () => { pointerStart = null; }, { passive: true });

  /* ---------- snowfall ---------- */

  (function snowfall() {
    const canvas = document.getElementById('snow');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let W = 0, H = 0, flakes = [];
    let raf = 0, running = false, resizeRaf = 0;

    function makeFlake(initial) {
      const r = Math.random() * 2.2 + 0.7;
      return {
        x: Math.random() * W,
        y: initial ? Math.random() * H : -12,
        r,
        vy: r * 0.32 + Math.random() * 0.5,
        vx: (Math.random() - 0.5) * 0.32,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.008 + Math.random() * 0.02,
        swayAmp: 0.25 + Math.random() * 0.6,
        alpha: 0.35 + Math.random() * 0.55
      };
    }

    function seed() {
      const compact = window.matchMedia('(max-width: 760px)').matches;
      const count = Math.round(clamp((W * H) / (compact ? 28000 : 16000), compact ? 22 : 40, compact ? 72 : 150));
      flakes = Array.from({ length: count }, () => makeFlake(true));
    }

    function resize() {
      const compact = window.matchMedia('(max-width: 760px)').matches;
      const dpr = Math.min(window.devicePixelRatio || 1, compact ? 1.5 : 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (reduce) paint();
    }

    function paint() {
      ctx.clearRect(0, 0, W, H);
      for (const f of flakes) {
        f.sway += f.swaySpeed;
        f.y += f.vy;
        f.x += f.vx + Math.sin(f.sway) * f.swayAmp * 0.4;
        if (f.y - f.r > H + 12) {
          Object.assign(f, makeFlake(false));
          f.x = Math.random() * W;
        }
        if (f.x < -20) f.x = W + 20;
        if (f.x > W + 20) f.x = -20;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(233, 247, 255, ${f.alpha})`;
        ctx.fill();
      }
    }

    function loop() {
      if (!running) return;
      paint();
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (running || reduce) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    window.addEventListener('resize', () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(resize);
    });
    document.addEventListener('visibilitychange', () => {
      document.hidden ? stop() : start();
    });

    resize();
    start();
  })();

  /* ---------- boot ---------- */

  (function init() {
    try {
      if (!window.SLIDES_DATA) {
        throw new Error(
          'slides.js was not loaded. Check that <script src="slides.js"></script> ' +
          'appears before <script src="app.js"></script> in index.html.'
        );
      }
      render(window.SLIDES_DATA);
    } catch (err) {
      showError(err);
    }
  })();
})();
