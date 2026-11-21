(() => {
  'use strict';

  /* ---------- DOM ---------- */
  const stage   = document.getElementById('stage');
  const dotsEl  = document.getElementById('dots');
  const counter = document.getElementById('slideCounter');
  const bar     = document.getElementById('progressBar');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  const state = { els: [], ids: [], index: -1 };
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
      node.style.setProperty('--i', i++);
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

  // Google Maps directions from the user's current location -> shows distance & ETA.
  // Opens the native app on iOS/Android when installed, web otherwise.
  function mapsUrl() {
    return 'https://www.google.com/maps/dir/?api=1&destination=' +
      encodeURIComponent(EVENT.location.mapsQuery || EVENT.location.name);
  }

  const SVG_EXTERNAL = '<svg class="tile-go" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>';
  const SVG_ARROW    = '<svg class="tile-go" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
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

  /* ---------- slide builders ---------- */

  function buildHome(d, inner, rv) {
    inner.classList.add('slide-inner--home');

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
    inner.appendChild(rv(row));

    inner.appendChild(rv(el('p', 'subtitle',
      `${EVENT.location.name} · ${londonDate(EVENT.nightAt)} · ${londonTime(EVENT.nightAt)}`)));

    if (d.tagline) inner.appendChild(rv(el('p', 'lead', d.tagline)));

    // Live countdowns
    const grid = el('div', 'count-grid');
    grid.appendChild(rv(countdownCard({ kind: 'confirm', label: 'Confirm by', iso: EVENT.confirmBy })));
    grid.appendChild(rv(countdownCard({ kind: 'night',   label: 'Game night', iso: EVENT.nightAt })));
    inner.appendChild(grid);

    // Location + pot tiles
    const tiles = el('div', 'tile-row');

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
    tiles.appendChild(rv(loc));

    const potBtn = el('button', 'tile');
    potBtn.type = 'button';
    potBtn.dataset.goto = 'pot';
    potBtn.setAttribute('aria-label', 'See the prize pot details');
    potBtn.innerHTML =
      '<span class="tile-icon" aria-hidden="true">💰</span>' +
      `<span class="tile-body"><span class="tile-title">${fmtMoney(potValue())} in the pot</span>` +
      `<span class="tile-sub">${EVENT.money.players} players · ${fmtMoney(EVENT.money.fee)} each</span></span>` +
      SVG_ARROW;
    tiles.appendChild(rv(potBtn));

    inner.appendChild(tiles);

    if (EVENT.confirmUrl) {
      const cta = el('a', 'btn btn--primary btn--cta');
      cta.href = EVENT.confirmUrl;
      cta.target = '_blank';
      cta.rel = 'noopener noreferrer';
      cta.textContent = `${EVENT.confirmLabel} · ${fmtMoney(EVENT.money.fee)}`;
      inner.appendChild(rv(cta));
    }

    inner.appendChild(rv(el('p', 'hint', d.hint || 'Swipe to continue')));
  }

  function buildHow(d, inner, rv) {
    inner.classList.add('slide-inner--how');
    if (d.eyebrow) inner.appendChild(rv(el('p', 'eyebrow', d.eyebrow)));
    if (d.title)   inner.appendChild(rv(el('h2', 'title title--sm', d.title)));
    if (d.text)    inner.appendChild(rv(el('p', 'lead', d.text)));

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
    inner.appendChild(ol);

    if (Array.isArray(d.schedule) && d.schedule.length) {
      const sc = el('div', 'schedule');
      sc.setAttribute('aria-label', 'Run of show');
      d.schedule.forEach(x => {
        const chip = el('span', 'sched-chip');
        chip.appendChild(el('strong', null, x.time));
        chip.appendChild(el('span', null, x.label));
        sc.appendChild(chip);
      });
      inner.appendChild(rv(sc));
    }
  }

  function buildPot(d, inner, rv) {
    inner.classList.add('slide-inner--center', 'slide-inner--pot');
    if (d.eyebrow) inner.appendChild(rv(el('p', 'eyebrow', d.eyebrow)));
    if (d.title)   inner.appendChild(rv(el('h2', 'title title--sm', d.title)));
    if (d.text)    inner.appendChild(rv(el('p', 'lead', d.text)));

    const pot = potValue();
    const pct = clamp((pot / EVENT.money.goal) * 100, 0, 100);

    const hero = el('div', 'pot-hero');
    const amount = el('div', 'pot-amount', fmtMoney(0));
    amount.dataset.target = pot;
    hero.appendChild(amount);
    hero.appendChild(el('div', 'pot-goal', `of ${fmtMoney(EVENT.money.goal)} when the house is full`));
    inner.appendChild(rv(hero));

    const track = el('div', 'pot-bar');
    track.setAttribute('role', 'img');
    track.setAttribute('aria-label', `Pot is ${Math.round(pct)} percent of the goal`);
    const fill = el('div', 'pot-fill');
    fill.dataset.fill = pct.toFixed(1);
    track.appendChild(fill);
    inner.appendChild(rv(track));

    const stats = el('div', 'pot-stats');
    const seatsLeft = Math.max(0, seatsTotal() - EVENT.money.players);
    [
      [EVENT.money.players, 'Confirmed'],
      [fmtMoney(EVENT.money.fee), 'Buy-in'],
      [seatsLeft, 'Seats left']
    ].forEach(([v, l]) => {
      const s = el('div', 'stat');
      s.appendChild(el('strong', null, String(v)));
      s.appendChild(el('span', null, l));
      stats.appendChild(s);
    });
    inner.appendChild(rv(stats));

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
      inner.appendChild(rv(grid));
    }

    if (d.note) inner.appendChild(rv(el('p', 'pot-note', d.note)));
  }

  function buildFaq(d, inner, rv) {
    inner.classList.add('slide-inner--faq');

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
    inner.appendChild(rv(head));

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

    inner.appendChild(list);

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
  }

  function buildEnd(d, inner, rv) {
    inner.classList.add('slide-inner--center');
    if (d.eyebrow) inner.appendChild(rv(el('p', 'eyebrow', d.eyebrow)));
    inner.appendChild(rv(el('h2', 'title title--gradient', d.title || 'See you there')));
    if (d.text) inner.appendChild(rv(el('p', 'lead', d.text)));

    if (EVENT.confirmUrl) {
      const cta = el('a', 'btn btn--primary btn--cta');
      cta.href = EVENT.confirmUrl;
      cta.target = '_blank';
      cta.rel = 'noopener noreferrer';
      cta.textContent = `${EVENT.confirmLabel} · ${fmtMoney(EVENT.money.fee)}`;
      inner.appendChild(rv(cta));
    }

    const back = el('button', 'btn btn--ghost');
    back.type = 'button';
    back.textContent = 'Back to start';
    back.setAttribute('aria-label', 'Back to the first slide');
    back.addEventListener('click', () => goTo(0));
    inner.appendChild(rv(back));
  }

  /* ---------- legacy builders (kept for flexibility) ---------- */

  function buildCover(d, inner, rv) {
    inner.classList.add('slide-inner--center');
    if (d.eyebrow)  inner.appendChild(rv(el('p', 'eyebrow', d.eyebrow)));
    inner.appendChild(rv(el('h1', 'title title--gradient', d.title || '')));
    if (d.subtitle) inner.appendChild(rv(el('p', 'subtitle', d.subtitle)));
    if (d.text)     inner.appendChild(rv(el('p', 'lead', d.text)));
    if (d.hint !== false) inner.appendChild(rv(el('p', 'hint', d.hint || 'Swipe to continue')));
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

  function buildSlide(data, idx) {
    const type = data.type || 'content';
    const sec  = el('section', `slide slide--${type}`);
    sec.dataset.type = type;
    sec.setAttribute('role', 'group');
    sec.setAttribute('aria-label', data.nav || `Slide ${idx + 1}`);
    if (data.accent)  sec.style.setProperty('--accent', data.accent);
    if (data.accent2) sec.style.setProperty('--accent-2', data.accent2);

    const rv    = revealer();
    const inner = el('div', 'slide-inner');

    if (type === 'home')       buildHome(data, inner, rv);
    else if (type === 'how')   buildHow(data, inner, rv);
    else if (type === 'pot')   buildPot(data, inner, rv);
    else if (type === 'faq')   buildFaq(data, inner, rv);
    else if (type === 'end')   buildEnd(data, inner, rv);
    else if (type === 'cover') buildCover(data, inner, rv);
    else if (type === 'cards') buildCards(data, inner, rv);
    else                       buildContent(data, inner, rv);

    sec.appendChild(inner);
    return sec;
  }

  /* ---------- pot animation ---------- */

  function activatePot(sec) {
    if (sec.dataset.potDone) return;
    sec.dataset.potDone = '1';

    const amt  = sec.querySelector('.pot-amount');
    const fill = sec.querySelector('.pot-fill');
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
    if (current.dataset.type === 'pot') activatePot(current);
    syncHud();
  }

  const next = () => goTo(state.index + 1);
  const prev = () => goTo(state.index - 1);

  function syncHud() {
    const total = state.els.length;
    counter.textContent = `${pad(state.index + 1)} / ${pad(total)}`;
    bar.style.width = total > 1 ? (state.index / (total - 1)) * 100 + '%' : '100%';
    Array.from(dotsEl.children).forEach((dot, i) => {
      dot.classList.toggle('is-active', i === state.index);
      dot.setAttribute('aria-current', i === state.index ? 'true' : 'false');
    });
    prevBtn.disabled = state.index === 0;
    nextBtn.disabled = state.index === total - 1;
  }

  /* ---------- render ---------- */

  function render(data) {
    const slides = Array.isArray(data) ? data : (data.slides || []);
    if (!slides.length) throw new Error('The config contains no slides.');

    if (!Array.isArray(data) && data.meta && data.meta.title) {
      document.title = data.meta.title;
    }

    state.ids = slides.map(s => s.id || '');
    state.els = slides.map((slide, i) => buildSlide(slide, i));
    state.els.forEach(node => stage.appendChild(node));

    slides.forEach((s, i) => {
      const label = s.nav || `Slide ${i + 1}`;
      const dot = el('button', 'dot-btn');
      dot.type = 'button';
      dot.title = label;
      dot.setAttribute('aria-label', `Go to ${label}`);
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    });

    // Cross-slide links (e.g. the pot tile on Home).
    stage.querySelectorAll('[data-goto]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = state.ids.indexOf(btn.dataset.goto);
        if (i > -1) goTo(i);
      });
    });

    goTo(0);
  }

  /* ---------- error state ---------- */

  function showError(err) {
    console.error(err);
    const overlay = el('div', 'error-overlay');
    const card    = el('div', 'error-card');
    card.appendChild(el('h2', 'error-title', 'Config not loaded'));
    card.appendChild(el('p', 'error-text', `<code>${String(err.message || err)}</code>`));
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

  // Horizontal swipe changes slides; vertical scroll stays native (touch-action: pan-y).
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
      const data = window.SLIDES_DATA;
      if (!data) {
        throw new Error(
          'slides.js was not loaded. Check that <script src="slides.js"></script> ' +
          'appears before <script src="app.js"></script> in index.html.'
        );
      }

      const DEFAULTS = {
        name: 'Xmas Games Night',
        edition: '3rd Edition',
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
