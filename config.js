/* =========================================================
   Xmas Night 2026 — config.js
   ✏️ MODIFICA SOLO QUESTO FILE PER CAMBIARE I TESTI
   ========================================================= */

window.XMAS_CONFIG = {

  hero: {
    title: "Xmas Night",
    year: "2026",
    edition: "3ª edizione",
    summary: "Un altro anno è volato, i dadi sono stati lucidati e il panettone è già in lista. Torna la <strong>Xmas Night</strong>: una serata di giochi da tavolo, risate e sano caos natalizio. Segna le date, scegli la tua squadra e conferma la presenza — i posti al tavolo sono limitati."
  },

  whatsapp: {
    number: "393331234567", // ⚠️ formato internazionale, senza + e senza spazi
    message: "Ciao! Confermo la mia presenza alla Xmas Night 2026 (3ª edizione) del 27 dicembre 🎄🎲"
  },

  countdown: {
    title: "Il conto alla rovescia",
    cards: [
      { variant: "conferma", icon: "🎲", title: "Conferma",       date: "2026-12-06", note: "entro il 6 dicembre" },
      { variant: "giochi",   icon: "🎄", title: "Serata Giochi",  date: "2026-12-27", note: "27 dicembre" }
    ]
  },

  labels: { days: "giorni" },

  players: {
    count: 14,
    label: "giocatori confermati",
    note: "…e qualcuno sta ancora scegliendo il personaggio 🎲",
    maxDots: 24
  },

  how: {
    title: "Come funziona la serata",
    steps: [
      { title: "Conferma entro il 6 dicembre",  text: "Un messaggio su WhatsApp e sei dentro. Ci serve il numero esatto per prenotare tavoli e sedie." },
      { title: "Scegli il tuo gioco",            text: "Porta il tuo gioco preferito oppure pesca tra quelli che mettiamo a disposizione: classici, party game e qualche gestionale cattivo." },
      { title: "Presentati il 27 dicembre",      text: "Ritrovo alle 20:30. Si mangia qualcosa insieme, poi si aprono i tavoli e parte il primo turno." },
      { title: "Gioca e sopravvivi",             text: "Partite a squadre, tornei lampo e sfide a sorpresa. La prima regola è sempre la stessa: divertirsi (e non barare troppo)." },
      { title: "Premi e panettone",              text: "Si chiude con il premio al vincitore, quello al più sfortunato e una fetta di panettone per tutti." }
    ]
  },

  faq: {
    title: "FAQ",
    openAll: "Apri tutte",
    closeAll: "Chiudi tutte",
    items: [
      { q: "Devo saper giocare per forza?",  a: "Assolutamente no. Ogni tavolo ha chi spiega le regole all'inizio e si gioca tutti insieme. Si impara giocando, ed è metà del divertimento." },
      { q: "Devo portare qualcosa?",         a: "Se hai un gioco che ami, portalo: è sempre ben accetto. Per il resto pensiamo a tutto noi — tavoli, snack e qualcosa da bere." },
      { q: "Posso portare un amico?",        a: "Certo, più siamo meglio è! Basta confermare anche per lui/lei entro il 6 dicembre, così teniamo il conto dei posti." },
      { q: "Dove si svolge la serata?",      a: "L'indirizzo esatto arriva su WhatsApp a chi conferma la presenza. Se hai bisogno di parcheggiare o di indicazioni, scrivici pure." },
      { q: "A che ora si finisce?",          a: "Si comincia alle 20:30 e si va avanti finché regge la voce. Chi vuole può fermarsi a dormire: basta dirlo in fase di conferma." },
      { q: "Quanto costa partecipare?",      a: "Niente: è una serata tra amici. Se vuoi contribuire a snack e bibite, offri quello che ti va — nessun obbligo." }
    ]
  },

  cta: { label: "Conferma la tua presenza" }
};
