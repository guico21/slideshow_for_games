(() => {
  'use strict';

  /* ---------- DOM ---------- */
  const page   = document.getElementById('page');
  const ctaBar = document.getElementById('ctaBar');
  const bar    = document.getElementById('progressBar');

  const countdowns = [];
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let EVENT = null;
  let moneyFmt = null;
  let faqUid = 0;
  let clockTimer = 0;

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
      node.style.setProperty('--i', Math.min(i, 4));
      i++;
      return node;
    };
  }

  const potValue   = () => EVENT.money.players * EVENT.money.fee;
  const seatsTotal = () => Math.max(1, Math.round(EVENT.money.goal / EVENT.money.fee));
  const fmtMoney   = n => moneyFmt.format(n);

  function londonDate(iso) {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short', timeZone: EVENT.timeZone
    }).format(new Date(iso));
  }

  function londonTime(iso) {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit', minute: '2-digit', hour12: false, timeZone: EVENT.timeZone
    }).format(new Date(iso));
  }

  // Google Maps directions from the user's current location -> distance & ETA.
  // Opens the native app on iOS/Android when installed, web otherwise.
  function mapsUrl() {
    return 'https://www.google.com/maps/dir/?api=1&destination=' +
      encodeURIComponent(EVENT.location.mapsQuery || EVENT.location.name);
  }

  const SVG_EXTERNAL = '<svg class="tile-go" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>';
  const SVG_CHEVRON  = '<svg class="faq-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

  /* ---------- countdowns ---------- */

  function countdownCard({ kind, label, iso }) {
    const card = el('div', `count-card count-card--${kind}`);
    card.setAttribute('role', 'timer');

    const top = el('div', 'count-top');
    top.appendChild(el('span', 'count-label', label));
    const pill = el('span', 'pill pill--ice', '…');
    top.appendChild(pill);

    const main = el('div', 'count-main');
    const days = el('span', 'count-days', '–');
    main.appendChild(days);
    main.appendChild(el('span', 'count-unit', 'days'));

    const hms  = el('div', 'count-hms', '--:--:--');
    const date = el('div', 'count-date', `${londonDate(iso)} · ${londonTime(iso)}`);

    card.append(top, main, hms, date);
    countdowns.push({ kind, label, target: new Date(iso), card, days, hms, pill });
    return card;
  }

  function tickCountdowns() {
    const now = Date.now();
    for (const c of countdowns) {
      const ms = c.target.getTime() - now;
      const t  = Math.max(0, Math.floor(ms / 1000));
      const d  = Math.floor(t / 86400);
      const h  = Math.floor((t % 86400) / 3600);
      const m  = Math.floor((t % 3600) / 60);
      const s  = t % 60;

      c.days.textContent = d;
      c.hms.textContent  = `${pad(h)}:${pad(m)}:${pad(s)}`;

      let cls, txt;
      if (ms <= 0) {
        cls = c.kind === 'night' ? 'live' : 'closed';
        txt = c.kind === 'night' ? 'Game on!' : 'Closed';
      } else if (c.kind === 'confirm') {
        cls = ms <= 3 * 864e5 ? 'soon' : 'open';
        txt = cls === 'soon' ? 'Closing soon' : 'Open';
      } else {
        cls = d === 0 ? 'soon' : 'ice';
        txt = d === 0 ? 'Tonight!' : 'Upcoming';
      }

      c.pill.className = `pill pill--${cls}`;
      c.pill.textContent = txt;
      c.card.classList.toggle('is-done', ms <= 0);
      c.card.setAttribute('aria-label', ms <= 0
        ? `${c.label}: time reached`
        : `${d} days, ${h} hours, ${m} minutes until ${c.label}`);
    }
  }

  function startClock() {
    if (!countdowns.length) return;
    stopClock();
    tickCountdowns();
    clockTimer = setInterval(tickCountdowns, 1000);
  }

  function stopClock() { clearInterval(clockTimer); }

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopClock() : startClock();
  });

  /* ---------- section builders ---------- */

  function buildHero() {
    const rv = revealer();
    const hero = el('header', 'hero');

    // Title + starburst sticker
    const row = el('div', 'title-row');
    row.appendChild(el('h1', 'title title--gradient', EVENT.name));
    const wrap = el('span', 'sticker-wrap');
    wrap.setAttribute('aria-label', EVENT.edition);
    const st = el('span', 'sticker');
    st.setAttribute('aria-hidden', 'true');
    const parts = String(EVENT.edition).split(' ');
    st.appendChild(el('span', 'sticker-top', parts[0] || ''));
    st.appendChild(el('span', 'sticker-bottom', parts.slice(1).join(' ')));
    wrap.appendChild(st);
    row.appendChild(wrap);
    hero.appendChild(rv(row));

    if (EVENT.tagline) hero.appendChild(rv(el('p', 'lead', EVENT.tagline)));

    // Live countdowns (the only place dates & times are shown)
    const grid = el('div', 'count-grid');
    grid.appendChild(rv(countdownCard({ kind: 'confirm', label: 'Confirm by', iso: EVENT.confirmBy })));
    grid.appendChild(rv(countdownCard({ kind: 'night',   label: 'Game night', iso: EVENT.nightAt })));
    hero.appendChild(grid);

    // Location (the only place the venue is shown)
    const loc = el('a', 'tile');
    loc.href = mapsUrl();
    loc.target = '_blank';
    loc.rel = 'noopener noreferrer';
    loc.setAttribute('aria-label', `Open directions to ${EVENT.location.name} in maps`);
    loc.innerHTML =
      '<span class="tile-icon" aria-hidden="true">📍</span>' +
      `<span class="tile-body"><span class="tile-title">${EVENT.location.name}</span>` +
      `<span class="tile-sub">${EVENT.location.detail || 'Tap for distance & directions'}</span></span>` +
      SVG_EXTERNAL;
    hero.appendChild(rv(loc));

    // Quick jumps
    const jumps = el('nav', 'jump-row');
    jumps.setAttribute('aria-label', 'Jump to a section');
    [['#plan', 'The plan'], ['#pot', 'The pot'], ['#faq', 'FAQs']].forEach(([href, label]) => {
      const a = el('a', 'jump-chip', `${label} <span aria-hidden="true">↓</span>`);
      a.href = href;
      jumps.appendChild(a);
    });
    hero.appendChild(rv(jumps));

    return hero;
  }

  function buildPlan(d) {
    const rv = revealer();
    const sec = el('section', 'section');
    sec.id = 'plan';

    const head = el('div', 'section-head');
    if (d.eyebrow) head.appendChild(el('p', 'eyebrow', d.eyebrow));
    head.appendChild(el('h2', 'title title--sm', d.title || 'How it works'));
    if (d.text) head.appendChild(el('p', 'lead', d.text));
    sec.appendChild(rv(head));

    const ol = el('ol', 'steps');
    (d.steps || []).forEach((s, i) => {
      const li = el('li', 'step');
      li.appendChild(el('span', 'step-node', s.icon || pad(i + 1)));
      const body = el('div', 'step-body');
      body.appendChild(el('h3', 'step-title', s.title));
      body.appendChild(el('p', 'step-text', s.text));
      li.appendChild(body);
      ol.appendChild(rv(li));
    });
    sec.appendChild(ol);

    if (Array.isArray(d.schedule) && d.schedule.length) {
      const sc = el('div', 'schedule');
      sc.setAttribute('aria-label', 'Run of show');
      d.schedule.forEach(x => {
        const chip = el('span', 'sched-chip');
        chip.appendChild(el('strong', null, x.time));
        chip.appendChild(el('span', null, x.label));
        sc.appendChild(chip);
      });
      sec.appendChild(rv(sc));
    }

    return sec;
  }

  function buildPot(d) {
    const rv = revealer();
    const sec = el('section', 'section');
    sec.id = 'pot';

    const head = el('div', 'section-head');
    if (d.eyebrow) head.appendChild(el('p', 'eyebrow', d.eyebrow));
    head.appendChild(el('h2', 'title title--sm', d.title || 'The Pot'));
    if (d.text) head.appendChild(el('p', 'lead', d.text));
    sec.appendChild(rv(head));

    const pot = potValue();
    const pct = clamp((pot / EVENT.money.goal) * 100, 0, 100);
    const seatsLeft = Math.max(0, seatsTotal() - EVENT.money.players);

    const panel = el('div', 'pot-panel');

    const amount = el('div', 'pot-amount', fmtMoney(0));
    amount.dataset.target = pot;
    panel.appendChild(amount);

    panel.appendChild(el('p', 'pot-sub',
      `<strong>${EVENT.money.players}</strong> players × <strong>${fmtMoney(EVENT.money.fee)}</strong> buy-in`));

    const track = el('div', 'pot-bar');
    track.setAttribute('role', 'img');
    track.setAttribute('aria-label', `Pot is ${Math.round(pct)} percent of the ${fmtMoney(EVENT.money.goal)} full-house goal`);
    const fill = el('div', 'pot-fill');
    fill.dataset.fill = pct.toFixed(1);
    track.appendChild(fill);
    panel.appendChild(track);

    panel.appendChild(el('p', 'pot-meta',
      `<strong>${seatsLeft}</strong> seats left · ${Math.round(pct)}% of the ${fmtMoney(EVENT.money.goal)} full-house pot · grows with every confirmation`));

    if (Array.isArray(d.prizes) && d.prizes.length) {
      const grid = el('div', 'prizes');
      d.prizes.forEach(p => {
        const card = el('div', 'prize');
        card.appendChild(el('span', 'prize-medal', p.medal || '🏆'));
        card.appendChild(el('span', 'prize-share', Math.round(p.share * 100) + '%'));
        card.appendChild(el('span', 'prize-amount', fmtMoney(Math.round(pot * p.share))));
        card.appendChild(el('span', 'prize-label', p.label || ''));
        grid.appendChild(card);
      });
      panel.appendChild(grid);
    }

    sec.appendChild(rv(panel));
    return sec;
  }

  function buildFaq(d) {
    const rv = revealer();
    const sec = el('section', 'section');
    sec.id = 'faq';

    const head = el('div', 'faq-head');
    const headText = el('div', 'faq-headtext');
    if (d.eyebrow) headText.appendChild(el('p', 'eyebrow', d.eyebrow));
    headText.appendChild(el('h2', 'title title--sm', d.title || 'FAQs'));
    head.appendChild(headText);

    const actions = el('div', 'faq-actions');
    const expandBtn   = el('button', 'btn--chip', 'Expand all');
    const collapseBtn = el('button', 'btn--chip', 'Collapse all');
    expandBtn.type = collapseBtn.type = 'button';
    actions.append(expandBtn, collapseBtn);
    head.appendChild(actions);
    sec.appendChild(rv(head));

    const list = el('div', 'faq-list');
    const items = [];

    (d.items || []).forEach(it => {
      const uid = `faq-${++faqUid}`;
      const item = el('div', 'faq-item');

      const h3 = el('h3', 'faq-q');
      const trig = el('button', 'faq-trigger');
      trig.type = 'button';
      trig.id = `${uid}-t`;
      trig.setAttribute('aria-expanded', 'false');
      trig.setAttribute('aria-controls', `${uid}-p`);
      trig.appendChild(el('span', 'faq-qtext', it.q));
      trig.insertAdjacentHTML('beforeend', SVG_CHEVRON);
      h3.appendChild(trig);

      const panel = el('div', 'faq-panel');
      panel.id = `${uid}-p`;
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-labelledby', `${uid}-t`);
      const pin = el('div', 'faq-panel-inner');
      pin.appendChild(el('p', 'faq-answer', it.a));
      panel.appendChild(pin);

      item.append(h3, panel);
      trig.addEventListener('click', () => {
        setOpen(item, trig, !item.classList.contains('open'));
        syncActions();
      });

      items.push({ item, trig });
      list.appendChild(rv(item));
    });

    sec.appendChild(list);

    function setOpen(item, trig, open) {
      item.classList.toggle('open', open);
      trig.setAttribute('aria-expanded', String(open));
    }

    function syncActions() {
      const open = items.filter(x => x.item.classList.contains('open')).length;
      expandBtn.disabled   = open === items.length;
      collapseBtn.disabled = open === 0;
    }

    expandBtn.addEventListener('click', () => {
      items.forEach(x => setOpen(x.item, x.trig, true));
      syncActions();
    });

    collapseBtn.addEventListener('click', () => {
      items.forEach(x => setOpen(x.item, x.trig, false));
      syncActions();
    });

    syncActions();
    return sec;
  }

  /* ---------- pot animation (runs once, when scrolled into view) ---------- */

  function activatePot(panel) {
    if (panel.dataset.potDone) return;
    panel.dataset.potDone = '1';

    const amt  = panel.querySelector('.pot-amount');
    const fill = panel.querySelector('.pot-fill');
    const target = Number(amt && amt.dataset.target) || 0;
    const pct = fill ? fill.dataset.fill + '%' : '0%';

    if (REDUCE) {
      if (amt) amt.textContent = fmtMoney(target);
      if (fill) fill.style.width = pct;
      return;
    }

    const t0 = performance.now(), dur = 1000;
    requestAnimationFrame(function step(t) {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      if (amt) amt.textContent = fmtMoney(Math.round(target * e));
      if (p < 1) requestAnimationFrame(step);
    });

    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (fill) fill.style.width = pct;
    }));
  }

  /* ---------- scroll reveal + pot trigger ---------- */

  function setupObservers() {
    const reveals = Array.from(page.querySelectorAll('.reveal'));
    const panel = page.querySelector('.pot-panel');

    if (REDUCE || !('IntersectionObserver' in window)) {
      reveals.forEach(n => n.classList.add('in'));
      if (panel) activatePot(panel);
      return;
    }

    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(n => io.observe(n));

    if (panel) {
      const potIo = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            activatePot(panel);
            potIo.disconnect();
          }
        });
      }, { threshold: .35 });
      potIo.observe(panel);
    }
  }

  /* ---------- scroll progress ---------- */

  let progressTicking = false;
  function updateProgress() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    bar.style.width = (max > 0 ? clamp((doc.scrollTop / max) * 100, 0, 100) : 0) + '%';
    progressTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!progressTicking) {
      progressTicking = true;
      requestAnimationFrame(updateProgress);
    }
  }, { passive: true });

  window.addEventListener('resize', updateProgress);

  /* ---------- render ---------- */

  function render(data) {
    if (data.meta && data.meta.title) document.title = data.meta.title;

    page.appendChild(buildHero());
    page.appendChild(buildPlan(data.plan || {}));
    page.appendChild(buildPot(data.pot || {}));
    page.appendChild(buildFaq(data.faq || {}));
    page.appendChild(el('footer', 'footer', data.footer || 'See you on the night 🎄'));

    if (EVENT.confirmUrl) {
      const cta = el('a', 'btn--primary');
      cta.href = EVENT.confirmUrl;
      cta.target = '_blank';
      cta.rel = 'noopener noreferrer';
      cta.textContent = EVENT.confirmLabel;
      ctaBar.appendChild(cta);
    } else {
      ctaBar.style.display = 'none';
    }

    setupObservers();
    updateProgress();
  }

  /* ---------- error state ---------- */

  function showError(err) {
    console.error(err);
    const overlay = el('div', 'error-overlay');
    const card    = el('div', 'error-card');
    card.appendChild(el('h2', 'error-title', 'Content not loaded'));
    card.appendChild(el('p', 'error-text', `<code>${String(err.message || err)}</code>`));
    card.appendChild(el('p', 'error-text',
      'Make sure <code>content.js</code> is in the same folder as <code>index.html</code> ' +
      'and is loaded <em>before</em> <code>app.js</code>.'));
    overlay.appendChild(card);
    document.body.appendChild(overlay);
  }

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
      const data = window.XGN_DATA;
      if (!data) {
        throw new Error(
          'content.js was not loaded. Check that <script src="content.js"></script> ' +
          'appears before <script src="app.js"></script> in index.html.'
        );
      }

      const DEFAULTS = {
        name: 'Xmas Games Night',
        edition: '3rd Edition',
        tagline: '',
        confirmBy: '2026-11-29T23:59:59+00:00',
        nightAt: '2026-12-27T19:00:00+00:00',
        timeZone: 'Europe/London',
        location: { name: 'London Bridge', detail: 'Tap for distance & directions', mapsQuery: 'London Bridge, London, UK' },
        money: { currency: 'GBP', fee: 20, players: 0, goal: 400 },
        confirmUrl: '',
        confirmLabel: 'Confirm your spot'
      };

      const ev = data.event || {};
      EVENT = {
        ...DEFAULTS, ...ev,
        location: { ...DEFAULTS.location, ...(ev.location || {}) },
        money: { ...DEFAULTS.money, ...(ev.money || {}) }
      };

      moneyFmt = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: EVENT.money.currency,
        maximumFractionDigits: 0
      });

      render(data);
      startClock();
    } catch (err) {
      showError(err);
    }
  })();
})();
