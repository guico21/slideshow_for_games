/* ════════════════════════════════════════════════════════════════════
   SERATA GIOCHI 2026 · script.js
   ✏️ EDIT THE CONFIG BELOW — everything else is automatic
   ════════════════════════════════════════════════════════════════════ */

const CONFIG = {
  // ← YOUR WhatsApp number: country code + number, NO "+", NO spaces
  whatsappNumber: "4477000000000",

  // Message pre-filled when the user taps "Conferm my"
  confirmMessage: "Eccomiii!🎄",

  // Dates — NOTE: month is 0-based (11 = December)
  confirmDeadline: { y: 2026, m: 11, d: 6 },   // Dec 6, 2026
  gameNight:       { y: 2026, m: 11, d: 27 },  // Dec 27, 2026

  // ✏️ LOCATION: Update this when you have the address
  // The card will automatically link to Google Maps when address is provided
  locationAddress: "", // e.g., "Via Roma 123, Milano"

  // ✏️ Add a name here every time someone confirms
  players: [
    "Guido", "Giada", "Marta", "Fabio"
  ],
  maxPlayers: 30,
};

/* ─────────────────────────────────────────────────────────── */

document.documentElement.classList.add("js");
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (sel) => document.querySelector(sel);

/* ---------- countdown (days only) ---------- */
function daysLeft({ y, m, d }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(y, m, d);
  return Math.round((target - today) / 86400000);
}

function countUp(el, to, dur = 1100) {
  if (REDUCED || to <= 0) { el.textContent = Math.max(to, 0); return; }
  const t0 = performance.now();
  const ease = (x) => 1 - Math.pow(1 - x, 3);
  (function frame(t) {
    const p = Math.min(1, (t - t0) / dur);
    el.textContent = Math.round(ease(p) * to);
    if (p < 1) requestAnimationFrame(frame);
  })(t0);
}

function setCard(numEl, unitEl, stateEl, days, todayMsg) {
  const shown = Math.max(days, 0);
  countUp(numEl, shown);
  unitEl.textContent = shown === 1 ? "giorno" : "giorni";
  if (days === 0) { numEl.textContent = "0"; stateEl.textContent = todayMsg; }
  else if (days < 0) stateEl.textContent = "fatto ✓";
}

setCard($("#daysConfirm"), $("#unitConfirm"), $("#stateConfirm"),
        daysLeft(CONFIG.confirmDeadline), "⏰ Ultime ore!");
setCard($("#daysGame"), $("#unitGame"), $("#stateGame"),
        daysLeft(CONFIG.gameNight), "🎉 È stasera!");

/* ---------- location card ---------- */
(function locationCard() {
  const card = $("#locationCard");
  const addressEl = $("#locationAddress");
  const ctaTextEl = $("#locationCtaText");
  const address = CONFIG.locationAddress.trim();

  if (address) {
    addressEl.textContent = address;
    ctaTextEl.textContent = "Apri in Google Maps";
    card.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    card.classList.add("has-address");
  } else {
    addressEl.textContent = "";
    ctaTextEl.textContent = "Indirizzo comunicato successivamente";
    card.href = "#";
    card.addEventListener("click", (e) => {
      e.preventDefault();
      showToast("L'indirizzo verrà annunciato presto! 🎄");
    });
  }
})();

/* ---------- confirmed players widget ---------- */
(function playersWidget() {
  const count = CONFIG.players.length;
  const max = CONFIG.maxPlayers;

  countUp($("#plCount"), count, 1300);

  const chips = $("#chips");
  CONFIG.players.forEach((name, i) => {
    const li = document.createElement("li");
    li.className = "chip";
    li.title = name;
    li.textContent = (name[0] + (name[1] || "")).toUpperCase();
    li.style.animationDelay = `${300 + i * 55}ms`;
    chips.appendChild(li);
  });

  const seat = $("#plSeat");
  seat.textContent = count < max
    ? `Il posto n° ${count + 1} in slitta è ancora libero… 🎅🏼`
    : "Slitta piena! 🎅✨";

  const pct = Math.min(count / max, 1);
  requestAnimationFrame(() => {
    setTimeout(() => {
      $("#ringFg").style.strokeDashoffset = 377 * (1 - pct);
    }, 300);
  });
})();

/* ---------- WhatsApp CTA ---------- */
(function cta() {
  const link = $("#cta");
  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(CONFIG.confirmMessage)}`;
  link.href = url;

  if (/X{4,}/.test(CONFIG.whatsappNumber) || CONFIG.whatsappNumber === "391234567890") {
    console.warn("🎅 Ricordati di impostare il numero WhatsApp reale in CONFIG (script.js)!");
  }

  link.addEventListener("click", () => {
    const r = link.getBoundingClientRect();
    confetti(r.left + r.width / 2, r.top + r.height / 2);
    showToast("Messaggio pronto: invialo in chat! 🎄");
  });

  function showToast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2800);
  }

  function confetti(x, y) {
    if (REDUCED) return;
    const colors = ["#e8464e", "#ffc857", "#2fae6b", "#9fd8ff", "#ffffff"];
    for (let i = 0; i < 28; i++) {
      const p = document.createElement("div");
      p.className = "confetti";
      p.style.background = colors[i % colors.length];
      p.style.left = x + "px";
      p.style.top = y + "px";
      document.body.appendChild(p);
      const dx = (Math.random() - 0.5) * 260;
      const up = -(60 + Math.random() * 140);
      const rot = (Math.random() - 0.5) * 720;
      p.animate([
        { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
        { transform: `translate(${dx * 0.7}px, ${up}px) rotate(${rot * 0.6}deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${dx}px, ${up + 240}px) rotate(${rot}deg)`, opacity: 0 }
      ], { duration: 900 + Math.random() * 600, easing: "cubic-bezier(.2,.7,.3,1)" })
       .onfinish = () => p.remove();
    }
  }
})();

/* ---------- FAQ accordion ---------- */
(function faq() {
  const items = [...document.querySelectorAll(".faq-item")];
  const toggleBtn = $("#faqToggle");

  function setOpen(item, open) {
    item.classList.toggle("open", open);
    item.querySelector(".faq-q").setAttribute("aria-expanded", String(open));
  }

  items.forEach((item) => {
    item.querySelector(".faq-q").addEventListener("click", () => {
      setOpen(item, !item.classList.contains("open"));
      syncToggleLabel();
    });
  });

  toggleBtn.addEventListener("click", () => {
    const anyClosed = items.some((i) => !i.classList.contains("open"));
    items.forEach((i) => setOpen(i, anyClosed));
    syncToggleLabel();
  });

  function syncToggleLabel() {
    const anyClosed = items.some((i) => !i.classList.contains("open"));
    toggleBtn.textContent = anyClosed ? "Espandi" : "Chiudi";
  }
})();

/* ---------- scroll reveal ---------- */
(function reveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || REDUCED) {
    els.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  els.forEach((el) => io.observe(el));
})();

/* ---------- stars ---------- */
(function stars() {
  const box = $("#stars");
  const n = window.innerWidth < 500 ? 45 : 75;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    s.className = "star";
    const size = (Math.random() * 1.8 + 1).toFixed(1);
    s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 78}%;width:${size}px;height:${size}px;--d:${(2 + Math.random() * 3).toFixed(1)}s;--dl:${(Math.random() * 4).toFixed(1)}s`;
    frag.appendChild(s);
  }
  box.appendChild(frag);
})();

/* ---------- string lights ---------- */
(function lights() {
  const box = $("#lights");
  const colors = ["#ff5d5d", "#ffc857", "#4fd58f", "#7ec8ff"];
  const count = Math.ceil(window.innerWidth / 26);
  for (let i = 0; i < count; i++) {
    const b = document.createElement("span");
    b.className = "bulb";
    b.style.left = `${i * 26 + 6}px`;
    b.style.setProperty("--c", colors[i % colors.length]);
    b.style.setProperty("--dl", `${(i % 7) * 0.33}s`);
    box.appendChild(b);
  }
})();

/* ---------- Santa walks with scroll ---------- */
(function santaWalk() {
  const santa = $("#santa");
  const bar = $("#ctaBar");
  let lastY = window.scrollY;
  let ticking = false;

  function place() {
    santa.style.bottom = `${bar.offsetHeight + 5}px`;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    const x = p * (window.innerWidth - santa.offsetWidth - 8) + 4;
    santa.style.transform = `translateX(${x}px)`;
  }

  function onScroll() {
    const y = window.scrollY;
    if (y < lastY - 2) santa.classList.add("flip");
    else if (y > lastY + 2) santa.classList.remove("flip");
    lastY = y;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => { place(); ticking = false; });
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", place);
  place();
})();

/* ---------- snowfall ---------- */
(function snowfall() {
  const canvas = $("#snow");
  if (REDUCED || !canvas) { if (canvas) canvas.remove(); return; }
  const ctx = canvas.getContext("2d");
  let W, H, flakes = [], rafId = null, last = performance.now();

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(140, Math.round(W / 6));
    flakes = Array.from({ length: n }, () => spawn(true));
  }
  function spawn(anywhere) {
    return {
      x: Math.random() * W,
      y: anywhere ? Math.random() * H : -6,
      r: 0.8 + Math.random() * 2.6,
      vy: 18 + Math.random() * 42,
      amp: 6 + Math.random() * 18,
      phase: Math.random() * Math.PI * 2,
      sway: 0.4 + Math.random() * 0.9,
      a: 0.35 + Math.random() * 0.55
    };
  }
  function frame(t) {
    const dt = Math.min((t - last) / 1000, 0.05);
    last = t;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#f4f9ff";
    for (const f of flakes) {
      f.y += f.vy * dt;
      f.x += Math.sin((t / 1000) * f.sway + f.phase) * f.amp * dt;
      if (f.y > H + 6) Object.assign(f, spawn(false));
      ctx.globalAlpha = f.a;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(frame);
  }
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { cancelAnimationFrame(rafId); rafId = null; }
    else if (!rafId) { last = performance.now(); rafId = requestAnimationFrame(frame); }
  });
  resize();
  rafId = requestAnimationFrame(frame);
})();

/* ---------- toast helper (shared) ---------- */
function showToast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}
