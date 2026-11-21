/* ============================================================
   XMAS GAMES NIGHT — all content & settings live here.
   Edit the `event` block to update the whole site.
   ============================================================ */
window.SLIDES_DATA = {
  meta: { title: 'Xmas Games Night — 3rd Edition' },

  event: {
    name: 'Xmas Games Night',
    edition: '3rd Edition',

    // London time (GMT). Keep the +00:00 offset so the countdown
    // is correct for guests in any timezone.
    confirmBy: '2026-11-29T23:59:59+00:00',   // RSVP + payment deadline
    nightAt:   '2026-12-27T19:00:00+00:00',   // doors open
    timeZone:  'Europe/London',

    location: {
      name: 'London Bridge',
      detail: 'Tap for distance & directions',
      mapsQuery: 'London Bridge, London, UK'  // what the maps button searches for
    },

    money: {
      currency: 'GBP',
      fee: 20,        // £ each player pays to register
      players: 12,    // confirmed so far  -> pot = fee × players
      goal: 400       // full-house pot (goal / fee = total seats)
    },

    // TODO: replace with your real payment link / group chat / form.
    // (This is a safe placeholder number — swap it before sharing!)
    confirmUrl: 'https://wa.me/447700900000?text=Count%20me%20in%20for%20Xmas%20Games%20Night!%20%F0%9F%8E%84',
    confirmLabel: 'Confirm your spot'
  },

  slides: [
    {
      id: 'home', type: 'home', nav: 'Home',
      tagline: 'One night, a stack of games, one leaderboard — and the winner takes the pot.',
      hint: 'Swipe for the game plan <span aria-hidden="true">→</span>'
    },

    {
      id: 'how', type: 'how', nav: 'How it works',
      eyebrow: 'The game plan',
      title: 'How the night works',
      text: 'Four simple steps between you and glory.',
      steps: [
        { icon: '🎟️', title: 'Confirm by 29 Nov',
          text: 'Pay your <strong>£20 buy-in</strong> to lock a spot. Seats are capped — first come, first served.' },
        { icon: '📍', title: 'Roll up at 19:00',
          text: 'Sun 27 Dec at <strong>London Bridge</strong>. The exact address lands in your inbox once you confirm.' },
        { icon: '🎮', title: 'Play everything',
          text: 'Party games, mini-brackets and one shared leaderboard. Points for wins, bonus points for style.' },
        { icon: '🏆', title: 'Take the pot',
          text: 'The top three split the pot <strong>60 / 25 / 15</strong>. Bragging rights last all year.' }
      ],
      schedule: [
        { time: '19:00', label: 'Doors & drinks' },
        { time: '19:30', label: 'Round 1' },
        { time: '21:00', label: 'Finals' },
        { time: '22:00', label: 'Podium & prizes' }
      ]
    },

    {
      id: 'pot', type: 'pot', nav: 'The pot',
      eyebrow: 'Prize money',
      title: 'The Pot',
      text: 'Every buy-in goes straight in. No house cut.',
      prizes: [
        { medal: '🥇', label: '1st place', share: 0.60 },
        { medal: '🥈', label: '2nd place', share: 0.25 },
        { medal: '🥉', label: '3rd place', share: 0.15 }
      ],
      note: 'The pot grows with every confirmation — refresh after the organiser updates it.'
    },

    {
      id: 'faq', type: 'faq', nav: 'FAQ',
      eyebrow: 'Good to know',
      title: 'FAQs',
      items: [
        { q: 'How do I confirm my spot?',
          a: 'Tap <strong>“Confirm your spot”</strong> and send your £20 buy-in before <strong>Sun 29 Nov, 23:59</strong>. You’re in once the organiser marks you as paid — the pot on this page updates too.' },
        { q: 'What does the £20 cover?',
          a: 'It’s your buy-in: <strong>100% goes into the prize pot</strong>. Food is a shared festive table — bring a snack or something to sip.' },
        { q: 'What games will we play?',
          a: 'A mix of party classics and quick tournaments — think quiz rounds, charades, Jenga and a console bracket. The exact line-up is revealed on the night to keep it fair.' },
        { q: 'Do I need to bring anything?',
          a: 'Yourself, something for the shared table, and your A-game. Controllers and cards are provided. Ugly Christmas jumpers are strongly encouraged. 🎅' },
        { q: 'Can I bring a plus-one?',
          a: 'Yes — if seats remain and they confirm and pay before the deadline. Every player needs a buy-in to appear on the leaderboard.' },
        { q: 'What if I pay but can’t make it?',
          a: 'Tell the organiser before <strong>20 Dec</strong> for a full refund. After that your buy-in stays in the pot — the prizes depend on it.' },
        { q: 'Where exactly is it?',
          a: 'The <strong>London Bridge</strong> area. The exact address is shared once you confirm. Tap the location tile on the home slide for live distance and directions.' },
        { q: 'What time should I arrive?',
          a: 'Doors open at <strong>19:00</strong>, first round starts at <strong>19:30 sharp</strong>. Latecomers join at the next round — the leaderboard waits for no one.' }
      ]
    },

    {
      id: 'join', type: 'end', nav: 'Join',
      eyebrow: 'Last call',
      title: 'See you there',
      text: 'Lock your spot before Sun 29 Nov — the pot is waiting, and so are the bragging rights. 🎄'
    }
  ]
};
