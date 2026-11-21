/* ============================================================
   XMAS GAMES NIGHT — all content & settings. Edit only this file.
   ============================================================ */
window.XGN_DATA = {
  meta: { title: 'Xmas Games Night — 3rd Edition' },

  event: {
    name: 'Xmas Games Night',
    edition: '3rd Edition',
    tagline: 'Eccoci',

    // London time (GMT). For an Italian venue: timeZone 'Europe/Rome', offsets +01:00.
    confirmBy: '2026-11-28T23:59:59+00:00',   // payment deadline: Sat 28 Nov
    nightAt:   '2026-12-27T19:00:00+00:00',   // doors open
    timeZone:  'Europe/London',

    location: {
      name: 'London Bridge',                  // update once the venue is booked
      detail: 'Tap for distance & directions',
      mapsQuery: 'London Bridge, London, UK'
    },

    money: {
      currency: 'EUR',
      fee: 22,          // € per player (shown on the Confirm button)
      players: 20,      // shown as a badge under the budget
      collected: 0      // <- change this number as payments arrive
    },

    // Payment link: set paymentReady to true AND fill confirmUrl when it goes live.
    // Until then, clicking Confirm opens the "not ready yet" Santa popup.
    paymentReady: false,
    confirmUrl: '',
    confirmLabel: 'Confirm your spot',

    // Organiser WhatsApp (international format, digits only) + prefilled message.
    organiserWhatsApp: '447746699443',
    whatsappText: 'Hi! About Xmas Games Night 🎄…'
  },

  venue: {
    text: 'With this year’s turnout we’re renting a venue. If you have a space (or room) available to accommodate everyone, please write to me privately.',
    cta: 'Message the organiser'
  },

  money: {
    title: 'Fees & prizes',
    text: 'Everyone chips in — here’s where the money goes.',
    covers: [
      { icon: '🏆', label: 'Prizes' },
      { icon: '🍕', label: 'Food' },
      { icon: '🥤', label: 'Drinks' },
      { icon: '🍽️', label: 'Tablecloths' },
      { icon: '🏠', label: 'Venue' },
      { icon: '🎲', label: 'Misc' }
    ],
    surplus: 'Any money left over — anything not spent and not part of the prize pool — is divided equally among all players and returned on the evening itself or via bank transfer.',
    payNote: 'Pay by bank transfer using the Confirm button below.',
    prizes: [
      { medal: '🥇', label: '1st place', note: 'To be confirmed' },
      { medal: '🥈', label: '2nd place', note: 'To be confirmed' },
      { medal: '🥉', label: '3rd place', note: 'To be confirmed' },
      { medal: '🏅', label: '4th place', note: 'To be confirmed' }
    ]
  },

  plan: {
    title: 'How it works',
    text: 'Same spirit as previous years — with a few new twists.',
    rules: [
      { icon: '👥', title: 'Ages 10+ · random teams',
        text: 'As in previous years, the games are mainly <strong>physical and team-based</strong>. Teams are created randomly for each game.' },
      { icon: '🎯', title: 'Every game scores',
        text: 'Points are assigned to teams based on their performance — and each game has its own winning score.' },
      { icon: '🎲', title: 'Expect the unexpected',
        text: 'Unforeseen events and opportunities during the evening will <strong>increase (or decrease)</strong> the scores.' }
    ]
  },

  faq: {
    title: 'FAQs',
    items: [
      { q: 'The per-player fee was lower in previous years. Why is it higher this year?',
        a: 'Given the higher number of interested people compared to previous years, the Cocola house will not be available to host us all, which requires an investment for an external venue, currently quantified in each player’s fee. See question <button class="faq-ref" data-ref="5">5</button> for more information.' },
      { q: 'Why do I have to pay the fee a month in advance?',
        a: 'Knowing the number of players in advance is essential for organizing logistics (venue, game types, prizes, etc.).' },
      { q: 'What happens if I get sick and can’t play?',
        a: 'The player’s fee will be <strong>returned minus the cost of the external venue rental</strong>.' },
      { q: 'What does it mean that any surplus money will be returned?',
        a: 'Assuming the total cost of the evening is <strong>€200</strong> (including prizes for the winning players and the venue), and the total fees initially paid by the players were <strong>€400</strong>, the remaining <strong>€200</strong> will be divided equally among all players and returned.' },
      { q: 'What if we have fewer than 20 people? Say, 10?',
        a: 'In that case, we will evaluate the hospitality of one of the players’ homes, avoiding the rental of an external venue.' },
      { q: 'If we go to one of the players’ homes, we don’t pay for the venue. Can we set a lower fee?',
        a: 'In that case, there will surely be a higher percentage of money returned. <strong>The fee does not change</strong> (see questions <button class="faq-ref" data-ref="1">1</button> and <button class="faq-ref" data-ref="4">4</button>).' },
      { q: 'If the number of players increases, the cost becomes lower per person, right?',
        a: '<strong>Exactly.</strong> The more players there are, the more the costs are amortized (see question <button class="faq-ref" data-ref="2">2</button>).' },
      { q: 'What is planned for food?',
        a: 'Take-out pizzas will be considered. The tastes will be mixed, as in previous years. <strong>Desserts are included</strong> for the end of the evening.' },
      { q: 'What is planned for drinks?',
        a: 'Mixed drinks, alcoholic and non-alcoholic. <strong>Water is included.</strong>' },
      { q: 'But the pizzerias are closed on the 27th. They were open in previous years.',
        a: 'If they are closed, other options will be considered. If there is nothing available, the players will prepare something to bring.' }
    ]
  },

  footer: 'Questions? Message the organiser. See you on the night 🎄'
};
