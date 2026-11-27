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
  let modal = null;
  let lastFocus = null;

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

  const fmtMoney = n => moneyFmt.format(n);

  function waUrl() {
    return `https://wa.me/${EVENT.organiserWhatsApp}?text=${encodeURIComponent(EVENT.whatsappText || '')}`;
  }

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

  function mapsUrl() {
    return 'https://www.google.com/maps/dir/?api=1&destination=' +
      encodeURIComponent(EVENT.location.mapsQuery || EVENT.location.name);
  }

  const SVG_EXTERNAL = '<svg class="tile-go" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>';
  const SVG_CHEVRON  = '<svg class="faq-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  const SVG_TOGGLE   = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l6 6 6-6"/><path d="M6 12l6 6 6-6"/></svg>';
  const SVG_CLOSE    = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const SVG_WA       = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

  /* ---------- countdowns (days only) ---------- */

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

    const date = el('div', 'count-date', `${londonDate(iso)} · ${londonTime(iso)}`);

    card.append(top, main, date);
    countdowns.push({ kind, label, target: new Date(iso), card, days, pill });
    return card;
  }

  function tickCountdowns() {
    const now = Date.now();
    for (const c of countdowns) {
      const ms = c.target.getTime() - now;
      const d = Math.max(0, Math.floor(ms / 864e5));
      c.days.textContent = d;

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
        : `${d} days until ${c.label}`);
    }
  }

  function startClock() {
    if (!countdowns.length) return;
    stopClock();
    tickCountdowns();
    clockTimer = setInterval(tickCountdowns, 15000);
  }

  function stopClock() { clearInterval(clockTimer); }

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopClock() : startClock();
  });

  /* ---------- payment modal ---------- */

  function buildModal() {
    const root = el('div', 'modal');
    root.hidden = true;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-labelledby', 'payTitle');

    const scrim = el('div', 'modal-scrim');
    const card = el('div', 'modal-card');

    const x = el('button', 'modal-x');
    x.type = 'button';
    x.setAttribute('aria-label', 'Close');
    x.innerHTML = SVG_CLOSE;

    card.appendChild(x);
    card.appendChild(el('h2', 'modal-title', 'Payment link not ready yet')).id = 'payTitle';

    const scene = el('div', 'santa-scene');
    scene.setAttribute('aria-hidden', 'true');
    scene.innerHTML =
      '<span class="ss-santa">' +
        '<i class="ss-body"></i><i class="ss-beard"></i><i class="ss-head"></i><i class="ss-hat"></i>' +
        '<i class="ss-arm ss-arm--hold"></i>' +
        '<i class="ss-arm ss-arm--hammer"><b class="ss-hammer"></b></i>' +
      '</span>' +
      '<span class="ss-bench"></span>' +
      '<span class="ss-gift ss-gift--a"></span>' +
      '<span class="ss-gift ss-gift--b"></span>' +
      '<span class="ss-gift ss-gift--hit"></span>' +
      '<span class="ss-spark ss-spark--1"></span><span class="ss-spark ss-spark--2"></span>';
    card.appendChild(scene);

    card.appendChild(el('p', 'modal-text',
      'The organiser is still wrapping things up. Ping them on WhatsApp and you’ll be the first to know when it’s live.'));

    const wa = el('a', 'modal-wa', `${SVG_WA} Message the organiser`);
    wa.href = waUrl();
    wa.target = '_blank';
    wa.rel = 'noopener noreferrer';
    card.appendChild(wa);

    root.append(scrim, card);
    document.body.appendChild(root);

    scrim.addEventListener('click', closeModal);
    x.addEventListener('click', closeModal);

    root.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const focusables = Array.from(card.querySelectorAll('button, a[href]'));
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !root.hidden) closeModal();
    });

    modal = { root, card, x };
  }

  function openModal() {
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.root.hidden = false;
    document.body.style.overflow = 'hidden';
    modal.x.focus();
  }

  function closeModal() {
    if (!modal || modal.root.hidden) return;
    modal.root.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---------- section builders ---------- */

  function buildHero(data) {
    const rv = revealer();
    const hero = el('header', 'hero');

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
    wrap.insertAdjacentHTML('beforeend',
      '<span class="santa-hat" aria-hidden="true">' +
      '<span class="hat-cone"></span><span class="hat-pom"></span><span class="hat-brim"></span>' +
      '</span>');
    row.appendChild(wrap);
    hero.appendChild(rv(row));

    if (EVENT.tagline) hero.appendChild(rv(el('p', 'lead', EVENT.tagline)));

    const grid = el('div', 'count-grid');
    grid.appendChild(rv(countdownCard({ kind: 'confirm', label: 'Confirmation', iso: EVENT.confirmBy })));
    grid.appendChild(rv(countdownCard({ kind: 'night',   label: 'Game night',   iso: EVENT.nightAt })));
    hero.appendChild(grid);

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

    if (data.venue && data.venue.text) {
      const note = el('div', 'venue-note');
      note.appendChild(el('span', 'venue-icon', '🏠'));
      const body = el('div', 'venue-body');
      body.appendChild(el('p', null, data.venue.text));
      if (EVENT.organiserWhatsApp) {
        const link = el('a', 'venue-link', `${SVG_WA.replace('viewBox', 'width="14" height="14" style="fill:currentColor" viewBox')} ${data.venue.cta || 'Message the organiser'}`);
        link.href = waUrl();
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        body.appendChild(link);
      }
      note.appendChild(body);
      hero.appendChild(rv(note));
    }

    const jumps = el('nav', 'jump-row');
    jumps.setAttribute('aria-label', 'Jump to a section');
    [['#money', 'The money'], ['#plan', 'The plan'], ['#faq', 'FAQs']].forEach(([href, label]) => {
      const a = el('a', 'jump-chip', `${label} <span aria-hidden="true">↓</span>`);
      a.href = href;
      jumps.appendChild(a);
    });
    hero.appendChild(rv(jumps));

    return hero;
  }

  function buildMoney(d) {
    const rv = revealer();
    const sec = el('section', 'section');
    sec.id = 'money';

    const head = el('div', 'section-head');
    head.appendChild(el('h2', 'title', d.title || 'Fees & prizes'));
    if (d.text) head.appendChild(el('p', 'lead', d.text));
    sec.appendChild(rv(head));

    const panel = el('div', 'money-panel');
    panel.appendChild(el('div', 'money-caption', 'Collected so far'));

    const amount = el('div', 'money-amount', fmtMoney(0));
    amount.dataset.target = Number(EVENT.money.collected) || 0;
    panel.appendChild(amount);

    const badge = el('div', 'players-badge');
    badge.innerHTML = `<span aria-hidden="true">👥</span> <strong>${EVENT.money.players}</strong>&nbsp;players`;
    panel.appendChild(badge);

    if (Array.isArray(d.covers) && d.covers.length) {
      panel.appendChild(el('div', 'covers-label', 'What the fee covers'));
      const covers = el('div', 'covers');
      d.covers.forEach(c => covers.appendChild(el('span', 'cover-chip', `<span aria-hidden="true">${c.icon}</span> ${c.label}`)));
      panel.appendChild(covers);
    }

    if (d.surplus) {
      const s = el('p', 'surplus');
      s.appendChild(el('span', 'surplus-icon', '💶'));
      s.appendChild(el('span', null, d.surplus));
      panel.appendChild(s);
    }

    if (Array.isArray(d.prizes) && d.prizes.length) {
      const grid = el('div', 'prizes');
      d.prizes.forEach(p => {
        const card = el('div', 'prize');
        card.appendChild(el('span', 'prize-medal', p.medal || '🏆'));
        card.appendChild(el('span', 'prize-label', p.label || ''));
        card.appendChild(el('span', 'prize-note', p.note || 'To be confirmed'));
        grid.appendChild(card);
      });
      panel.appendChild(grid);
    }

    if (d.payNote) panel.appendChild(el('p', 'pay-note', `🏦 ${d.payNote}`));

    sec.appendChild(rv(panel));
    return sec;
  }

  function buildPlan(d) {
    const rv = revealer();
    const sec = el('section', 'section');
    sec.id = 'plan';

    const head = el('div', 'section-head');
    head.appendChild(el('h2', 'title', d.title || 'How it works'));
    if (d.text) head.appendChild(el('p', 'lead', d.text));
    sec.appendChild(rv(head));

    if (Array.isArray(d.rules) && d.rules.length) {
      const rules = el('div', 'rules');
      rules.setAttribute('aria-label', 'House rules');
      d.rules.forEach(r => {
        const row = el('div', 'rule');
        row.appendChild(el('span', 'rule-icon', r.icon || '🎲'));
        const body = el('div', 'rule-body');
        body.appendChild(el('h3', 'rule-title', r.title));
        body.appendChild(el('p', 'rule-text', r.text));
        row.appendChild(body);
        rules.appendChild(row);
      });
      sec.appendChild(rv(rules));
    }

    return sec;
  }

  function buildFaq(d) {
    const rv = revealer();
    const sec = el('section', 'section');
    sec.id = 'faq';

    const head = el('div', 'faq-head');
    head.appendChild(el('h2', 'title', d.title || 'FAQs'));

    const toggle = el('button', 'faq-toggle');
    toggle.type = 'button';
    toggle.innerHTML = SVG_TOGGLE;
    head.appendChild(toggle);
    sec.appendChild(rv(head));

    const list = el('div', 'faq-list');
    const items = [];

    (d.items || []).forEach((it, i) => {
      const uid = `faq-${++faqUid}`;
      const item = el('div', 'faq-item');

      const h3 = el('h3', 'faq-q');
      const trig = el('button', 'faq-trigger');
      trig.type = 'button';
      trig.id = `${uid}-t`;
      trig.setAttribute('aria-expanded', 'false');
      trig.setAttribute('aria-controls', `${uid}-p`);
      trig.appendChild(el('span', 'faq-num', pad(i + 1)));
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
        syncToggle();
      });

      items.push({ item, trig });
      list.appendChild(rv(item));
    });

    sec.appendChild(list);

    function setOpen(item, trig, open) {
      item.classList.toggle('open', open);
      trig.setAttribute('aria-expanded', String(open));
    }

    function allOpen() {
      return items.length > 0 && items.every(x => x.item.classList.contains('open'));
    }

    function syncToggle() {
      const up = allOpen();
      toggle.classList.toggle('is-up', up);
      const label = up ? 'Collapse all' : 'Expand all';
      toggle.setAttribute('aria-label', label);
      toggle.title = label;
    }

    toggle.addEventListener('click', () => {
      const open = !allOpen();
      items.forEach(x => setOpen(x.item, x.trig, open));
      syncToggle();
    });

    sec.querySelectorAll('.faq-ref').forEach(btn => {
      btn.type = 'button';
      const n = Number(btn.dataset.ref);
      btn.setAttribute('aria-label', `Open question ${n}`);
      btn.addEventListener('click', () => {
        const target = items[n - 1];
        if (!target) return;
        setOpen(target.item, target.trig, true);
        syncToggle();
        target.item.classList.add('in');
        target.item.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'center' });
        target.item.classList.remove('flash');
        void target.item.offsetWidth;
        target.item.classList.add('flash');
      });
    });

    syncToggle();
    return sec;
  }

  /* ---------- money count-up ---------- */

  function activateMoney(panel) {
    if (panel.dataset.done) return;
    panel.dataset.done = '1';

    const amt = panel.querySelector('.money-amount');
    const target = Number(amt && amt.dataset.target) || 0;

    if (REDUCE || !amt || target === 0) {
      if (amt) amt.textContent = fmtMoney(target);
      return;
    }

    const t0 = performance.now(), dur = 1000;
    requestAnimationFrame(function step(t) {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      amt.textContent = fmtMoney(Math.round(target * e));
      if (p < 1) requestAnimationFrame(step);
    });
  }

  /* ---------- observers ---------- */

  function setupObservers() {
    const reveals = Array.from(page.querySelectorAll('.reveal'));
    const panel = page.querySelector('.money-panel');

    if (REDUCE || !('IntersectionObserver' in window)) {
      reveals.forEach(n => n.classList.add('in'));
      if (panel) activateMoney(panel);
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
      const moneyIo = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            activateMoney(panel);
            moneyIo.disconnect();
          }
        });
      }, { threshold: .35 });
      moneyIo.observe(panel);
    }
  }

  /* ---------- scroll progress + landscape reveal ---------- */

  let progressTicking = false;
  function updateProgress() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const p = max > 0 ? clamp(doc.scrollTop / max, 0, 1) : 0;
    bar.style.width = (p * 100) + '%';
    doc.style.setProperty('--scene', clamp((p - 0.18) / 0.62, 0, 1).toFixed(3));
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

    page.appendChild(buildHero(data));
    page.appendChild(buildMoney(data.money || {}));
    page.appendChild(buildPlan(data.plan || {}));
    page.appendChild(buildFaq(data.faq || {}));
    page.appendChild(el('footer', 'footer', data.footer || 'See you on the night 🎄'));

    buildModal();

    const inner = el('div', 'cta-inner');

    if (EVENT.organiserWhatsApp) {
      const wa = el('a', 'cta-wa');
      wa.href = waUrl();
      wa.target = '_blank';
      wa.rel = 'noopener noreferrer';
      wa.setAttribute('aria-label', 'Message the organiser on WhatsApp');
      wa.title = 'Message the organiser';
      wa.innerHTML = SVG_WA;
      inner.appendChild(wa);
    }

    const cta = el('a', 'btn--primary');
    cta.textContent = `${EVENT.confirmLabel} · ${fmtMoney(EVENT.money.fee)}`;
    if (EVENT.paymentReady && EVENT.confirmUrl) {
      cta.href = EVENT.confirmUrl;
      cta.target = '_blank';
      cta.rel = 'noopener noreferrer';
    } else {
      cta.href = EVENT.confirmUrl || '#';
      cta.setAttribute('aria-haspopup', 'dialog');
      cta.addEventListener('click', e => { e.preventDefault(); openModal(); });
    }
    inner.appendChild(cta);
    ctaBar.appendChild(inner);

    setupObservers();
    updateProgress();
  }

  /* ---------- error state ---------- */

  function showError(err) {
    console.error(err);
    const overlay = el('div', 'error-overlay');
    const card = el('div', 'error-card');
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
        confirmBy: '2026-11-28T23:59:59+00:00',
        nightAt: '2026-12-27T19:00:00+00:00',
        timeZone: 'Europe/London',
        location: { name: 'London Bridge', detail: 'Tap for distance & directions', mapsQuery: 'London Bridge, London, UK' },
        money: { currency: 'EUR', fee: 22, players: 20, collected: 0 },
        paymentReady: false,
        confirmUrl: '',
        confirmLabel: 'Confirm your spot',
        organiserWhatsApp: '',
        whatsappText: 'Hi! About Xmas Games Night 🎄…'
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
