/* ============================================================
   XMAS GAMES NIGHT — single-page content & settings.
   This is the only file you edit. Each fact appears once:
   date/time -> countdowns · money -> pot · venue -> location tile
   ============================================================ */
window.XGN_DATA = {
  meta: { title: 'Xmas Games Night — 3rd Edition' },

  event: {
    name: 'Xmas Games Night',
    edition: '3rd Edition',
    tagline: 'One night, a stack of games, one leaderboard — and the winner takes the pot.',

    // London time (GMT). Keep the +00:00 offset so countdowns are
    // correct for guests opening the page from any timezone.
    confirmBy: '2026-11-29T23:59:59+00:00',   // RSVP + payment deadline
    nightAt:   '2026-12-27T19:00:00+00:00',   // doors open
    timeZone:  'Europe/London',

    location: {
      name: 'London Bridge',
      detail: 'Tap for distance & directions',
      mapsQuery: 'London Bridge, London, UK'
    },

    money: {
      currency: 'GBP',
      fee: 20,        // £ each player pays to register
      players: 12,    // confirmed so far -> pot = fee × players
      goal: 400       // full-house pot (goal / fee = total seats)
    },

    // TODO: replace with your real payment link / group chat / form
    // before sharing (this is a safe placeholder number).
    confirmUrl: 'https://wa.me/447700900000?text=Count%20me%20in%20for%20Xmas%20Games%20Night!%20%F0%9F%8E%84',
    confirmLabel: 'Confirm your spot'
  },

  plan: {
    eyebrow: 'The game plan',
    title: 'How it works',
    text: 'From buy-in to bragging rights in three steps.',
    steps: [
      { icon: '🎟️', title: 'Confirm your seat',
        text: 'Send your buy-in before the deadline to lock a spot. Seats are capped — <strong>first come, first served</strong>.' },
      { icon: '🎮', title: 'Play everything',
        text: 'Party games, mini-brackets and one shared leaderboard. Points for wins, bonus points for style.' },
      { icon: '🏆', title: 'Take the pot',
        text: 'The top three split the pot on the night. Bragging rights last all year.' }
    ],
    schedule: [
      { time: '19:00', label: 'Doors & drinks' },
      { time: '19:30', label: 'Round 1' },
      { time: '21:00', label: 'Finals' },
      { time: '22:00', label: 'Podium & prizes' }
    ]
  },

  pot: {
    eyebrow: 'Prize money',
    title: 'The Pot',
    text: 'Every buy-in goes straight in — no house cut.',
    prizes: [
      { medal: '🥇', label: '1st place', share: 0.60 },
      { medal: '🥈', label: '2nd place', share: 0.25 },
      { medal: '🥉', label: '3rd place', share: 0.15 }
    ]
  },

  faq: {
    eyebrow: 'Good to know',
    title: 'FAQs',
    items: [
      { q: 'How do I confirm my spot?',
        a: 'Hit <strong>“Confirm your spot”</strong> at the bottom of the page and send your buy-in before the deadline shown in the countdown. You’re in once the organiser marks you as paid — the pot above updates too.' },
      { q: 'What does the buy-in cover?',
        a: 'It’s your entry: <strong>100% goes into the prize pot</strong>. Food is a shared festive table — bring a snack or something to sip.' },
      { q: 'What games will we play?',
        a: 'A mix of party classics and quick tournaments — think quiz rounds, charades, Jenga and a console bracket. The exact line-up is revealed on the night to keep it fair.' },
      { q: 'Do I need to bring anything?',
        a: 'Yourself, something for the shared table, and your A-game. Controllers and cards are provided. Ugly Christmas jumpers are strongly encouraged. 🎅' },
      { q: 'Can I bring a plus-one?',
        a: 'Yes — if seats remain and they confirm and pay before the deadline. Every player needs a buy-in to appear on the leaderboard.' },
      { q: 'What if I pay but can’t make it?',
        a: 'Tell the organiser before <strong>20 Dec</strong> for a full refund. After that your buy-in stays in the pot — the prizes depend on it.' },
      { q: 'Where exactly is it?',
        a: 'The <strong>London Bridge</strong> area — the exact address is shared once you confirm. The location tile at the top of the page opens live distance and directions from wherever you are.' },
      { q: 'What time should I arrive?',
        a: 'Doors open at <strong>19:00</strong> and the first round starts at <strong>19:30 sharp</strong>. Latecomers join at the next round — the leaderboard waits for no one.' }
    ]
  },

  footer: 'Questions? Message the organiser. See you on the night 🎄'
};
