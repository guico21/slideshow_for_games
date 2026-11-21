/* ============================================================
   XMAS GAMES NIGHT — single-page behaviour
   ============================================================ */

(() => {
  'use strict';

  /* ---------- config: edit these dates to update countdowns ---------- */

  const CONFIG = {
    confirm: { month: 10, day: 29, hour: 19, minute: 0 }, // 29 Nov, 19:00 (month is 0-indexed)
    night:   { month: 11, day: 27, hour: 19, minute: 0 }  // 27 Dec, 19:00
  };

  const pad = n => String(n).padStart(2, '0');

  /* ---------- resolve targets (auto roll to next year if past) ---------- */

  function resolveTargets() {
    const now = new Date();
    let year = now.getFullYear();

    const makeDate = (c, y) =>
      new Date(y, c.month, c.day, c.hour, c.minute, 0, 0);

    let night   = makeDate(CONFIG.night, year);
    let confirm = makeDate(CONFIG.confirm, year);

    if (now > night) {
      year += 1;
      night   = makeDate(CONFIG.night, year);
      confirm = makeDate(CONFIG.confirm, year);
    }

    return { confirm, night };
  }

  const targets = resolveTargets();

  /* ---------- update one countdown card ---------- */

  function updateCard(card, target) {
    if (!card || !Number.isFinite(target)) return;

    const diff = target - Date.now();

    if (diff <= 0) {
      if (!card.classList.contains('is-closed')) {
        card.classList.add('is-closed');
        const values = card.querySelector('.count-values');
        if (values) {
          values.innerHTML =
            `<span class="count-closed">${
              card.dataset.key === 'confirm'
                ? 'Confirmation closed'
                : 'Night passed'
            }</span>`;
        }
      }
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff / 3600000) % 24;
    const m = Math.floor(diff / 60000) % 60;
    const s = Math.floor(diff / 1000) % 60;

    const set = (unit, value) => {
      const node = card.querySelector(`.count-num[data-unit="${unit}"]`);
      if (node) node.textContent = pad(value);
    };

    set('days', d);
    set('hours', h);
    set('minutes', m);
    set('seconds', s);
  }

  function updateAll() {
    document.querySelectorAll('.count-card').forEach(card => {
      const key = card.dataset.key;
      if (key === 'confirm') updateCard(card, targets.confirm.getTime());
      if (key === 'night')   updateCard(card, targets.night.getTime());
    });
  }

  let timer = null;
  function startCountdowns() {
    updateAll();
    if (timer) clearInterval(timer);
    timer = setInterval(updateAll, 1000);
  }

  /* ---------- FAQ expand / collapse all ---------- */

  function wireFaq() {
    const list = document.getElementById('faqList');
    const expand = document.getElementById('expandAll');
    const collapse = document.getElementById('collapseAll');
    if (!list) return;

    expand?.addEventListener('click', () => {
      list.querySelectorAll('details').forEach(d => { d.open = true; });
    });

    collapse?.addEventListener('click', () => {
      list.querySelectorAll('details').forEach(d => { d.open = false; });
    });
  }

  /* ---------- footer year ---------- */

  function setYear() {
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------- snowfall (unchanged aesthetic) ---------- */

  function snowfall() {
    const canvas = document.getElementById('snow');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let W = 0, H = 0, flakes = [];
    let raf = 0, running = false, resizeRaf = 0;

    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

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
      const count = Math.round(
        clamp((W * H) / (compact ? 28000 : 16000),
              compact ? 22 : 40,
              compact ? 72 : 150)
      );
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

    function start() { if (!running && !reduce) { running = true; raf = requestAnimationFrame(loop); } }
    function stop()  { running = false; cancelAnimationFrame(raf); }

    window.addEventListener('resize', () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(resize);
    });

    document.addEventListener('visibilitychange', () => {
      document.hidden ? stop() : start();
    });

    resize();
    start();
  }

  /* ---------- boot ---------- */

  function init() {
    startCountdowns();
    wireFaq();
    setYear();
    snowfall();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
