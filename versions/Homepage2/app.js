/* ============================================================
   XMAS GAMES NIGHT — single-page behaviour
   ============================================================ */

(() => {
  'use strict';

  /* ------------------------------------------------------------
     CONFIG — edit these to update the page.
     Months are 0-indexed (0 = January, 10 = November, 11 = December).
     ------------------------------------------------------------ */
  const CONFIG = {
    year: 2026,

    confirm: { month: 10, day: 28, hour: 19, minute: 0 }, // Sat 28 Nov 2026, 19:00
    night:   { month: 11, day: 27, hour: 19, minute: 0 }, // Sun 27 Dec 2026, 19:00

    fund: {
      currency:         '€',
      perPlayer:        22,
      playersConfirmed: 20,
      playerTarget:     30
    }
  };

  /* ---------- build targets ---------- */

  const makeDate = (c, y) =>
    new Date(y, c.month, c.day, c.hour, c.minute, 0, 0);

  const targetConfirm = makeDate(CONFIG.confirm, CONFIG.year);
  const targetNight   = makeDate(CONFIG.night,   CONFIG.year);

  const pad = n => String(n).padStart(2, '0');

  const formatDate = d =>
    d.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

  /* ---------- countdown (days only) ---------- */

  function renderCountdown(card, target) {
    if (!card || !Number.isFinite(target)) return;

    const diff = target - Date.now();
    const daysEl = card.querySelector('.count-num[data-unit="days"]');

    if (diff <= 0) {
      card.classList.add('is-closed');
      const wrap = card.querySelector('.count-days');
      if (wrap && !wrap.dataset.replaced) {
        wrap.dataset.replaced = '1';
        wrap.innerHTML =
          `<span class="count-closed">${
            card.dataset.key === 'confirm'
              ? 'Confirmation closed'
              : 'Night passed'
          }</span>`;
      }
      return;
    }

    const days = Math.ceil(diff / 86400000);
    if (daysEl) daysEl.textContent = String(days);
  }

  function updateCountdowns() {
    const confirmCard = document.querySelector('.count-card[data-key="confirm"]');
    const nightCard   = document.querySelector('.count-card[data-key="night"]');
    renderCountdown(confirmCard, targetConfirm.getTime());
    renderCountdown(nightCard,   targetNight.getTime());
  }

  /* ---------- dates ---------- */

  function fillDates() {
    const confirmEl = document.querySelector('[data-date="confirm"]');
    const nightEl   = document.querySelector('[data-date="night"]');

    if (confirmEl) {
      confirmEl.textContent = formatDate(targetConfirm) + ' · 19:00';
    }
    if (nightEl) {
      nightEl.textContent = formatDate(targetNight) + ' · 19:00';
    }
  }

  /* ---------- funds ---------- */

  function fillFunds() {
    const { currency, perPlayer, playersConfirmed, playerTarget } = CONFIG.fund;

    const raised = perPlayer * playersConfirmed;
    const target = perPlayer * playerTarget;
    const pct    = Math.min(100, Math.round((raised / target) * 100));

    const amountEl = document.querySelector('[data-fund="raised"]');
    const subEl    = document.querySelector('[data-fund="sub"]');
    const fillEl   = document.querySelector('[data-fund="fill"]');
    const metaEl   = document.querySelector('[data-fund="meta"]');
    const progEl   = document.querySelector('.fund-progress');

    if (amountEl) amountEl.textContent = currency + raised;
    if (subEl)    subEl.textContent    = `${playersConfirmed} players · ${currency}${perPlayer} each`;
    if (fillEl) {
      // animate on load
      requestAnimationFrame(() => {
        setTimeout(() => { fillEl.style.width = pct + '%'; }, 80);
      });
    }
    if (metaEl) {
      metaEl.innerHTML = `<strong>${pct}%</strong> of target · ${currency}${target}`;
    }
    if (progEl) progEl.setAttribute('aria-valuenow', String(pct));
  }

  /* ---------- FAQ expand / collapse ---------- */

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
    if (y) y.textContent = String(new Date().getFullYear());
  }

  /* ---------- snowfall ---------- */

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
    fillDates();
    fillFunds();
    updateCountdowns();
    setInterval(updateCountdowns, 60000); // refresh once a minute
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
