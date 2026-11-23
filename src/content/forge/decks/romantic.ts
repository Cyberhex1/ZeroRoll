import type { StoryDeck } from '../types';

export const romantic = {
  signature: 'Two people with friction, wit and something at stake: longing, subtext, banter and public settings where a look costs something. The romance changes both of them. The hero is warm and sympathetic.',
  engines: ['courtship', 'contest', 'masquerade', 'bargain', 'inheritance', 'homecoming', 'mystery', 'rescue', 'trial'],
  families: [
    { id: 'regency', name: 'Regency and court', hero: 'someone with a reputation to keep or lose: a governess, a younger daughter, a rival heir, a portrait painter, a lady\'s maid', start: 'a season, a ball, a contract or a scandal', turn: 'a misunderstanding, a rival or family pressure separates them', payoff: 'a public choice that costs them something', palette: 'candle smoke, gloves, dance cards, letters sealed in wax, rain on a carriage, a gossip sheet', sources: ['bridgerton', 'pride_prejudice', 'sense_sensibility', 'downton'] },
    { id: 'enemies', name: 'Rivals to lovers', hero: 'someone competing for the same prize: two chefs, two architects, two thieves, two heirs, two duelists', start: 'a forced partnership or a contest', turn: 'the rivalry turns personal, then something bigger threatens both', payoff: 'choosing each other over the prize, or winning it together', palette: 'sharp banter, shared workbenches, stolen glances, late deadlines, a wager in writing', sources: ['pride_prejudice', 'the_great', 'cruel_intentions'] },
    { id: 'fae', name: 'Fae and vampire romance', hero: 'a mortal with a debt, a dying family or a dangerous gift', start: 'a bargain or a meeting with someone dangerous and beautiful', turn: 'the court\'s politics turn the bargain into a trap for both', payoff: 'love that breaks the curse or rewrites the bargain', palette: 'masks, thorned roses, a court with impossible manners, a deal written in starlight, a mirror that does not reflect', sources: ['acotar', 'vampire_diaries'] },
    { id: 'royal', name: 'Royal selection', hero: 'an outsider in a royal competition or household: a commoner candidate, a palace seamstress, a foreign princess\'s translator', start: 'the selection begins, or the palace opens its doors', turn: 'politics outside the palace threaten both of them', payoff: 'love and duty reconciled in public', palette: 'palace corridors, rebels at the gates, numbered gowns, a garden at midnight, a crown on a cushion', sources: ['selection', 'reign', 'crown', 'marie_antoinette'] },
    { id: 'modern', name: 'Modern slow burn', hero: 'someone with a life of their own: a barista, a bookshop owner, a med student, a band\'s merch seller', start: 'a forced proximity: a shared apartment, a fake date, a road trip, a summer job', turn: 'a past relationship or a secret wrecks the trust', payoff: 'a grand gesture that is honest rather than flashy', palette: 'phone screens at 2 AM, rooftop parties, borrowed hoodies, a kissing booth, rain on a car', sources: ['after', 'kissing_booth', 'through_window', 'gossip_girl'] }
  ],
  dna: [
    { id: 'bridgerton', title: 'Bridgerton', medium: 'TV/Books', dna: 'A society season run by an anonymous gossip sheet; a fake courtship to fool the matchmaking mothers becomes real; lush color, wit, family meddling.' },
    { id: 'pride_prejudice', title: 'Pride and Prejudice', medium: 'Book/Film', dna: 'Two proud, clever people misjudge each other at first meeting; a terrible proposal, a letter that reveals the truth, a slow reversal of first impressions.' },
    { id: 'sense_sensibility', title: 'Sense and Sensibility', medium: 'Book', dna: 'Two sisters, one reserved and one passionate, lose their home and love differently; a charming man who disappoints and a quiet one who waits.' },
    { id: 'downton', title: 'Downton Abbey', medium: 'TV Show', dna: 'Upstairs and downstairs in a great house; an inheritance problem, a changing era, and romances that cross class lines.' },
    { id: 'the_great', title: 'The Great', medium: 'TV Show', dna: 'A clever young bride plots a coup against her absurd husband; comedy, cruelty and a love that grows between enemies.' },
    { id: 'cruel_intentions', title: 'Cruel Intentions', medium: 'Film', dna: 'Step-siblings make a cruel wager about seducing an innocent; the seducer falls in love for real; letters and a diary bring everything down.' },
    { id: 'acotar', title: 'A Court of Thorns and Roses', medium: 'Book Series', dna: 'A mortal huntress is taken into a fae court as payment for a death; beauty and menace; a curse on the court; a lover who is not what he seems.' },
    { id: 'vampire_diaries', title: 'The Vampire Diaries', medium: 'TV Show', dna: 'A small town with a supernatural underside; two brothers who want the same person; secrets handed down through founding families.' },
    { id: 'selection', title: 'The Selection', medium: 'Book Series', dna: 'Thirty-five girls compete for a prince in a televised palace contest; a girl who did not want to enter; rebels attack while hearts are decided.' },
    { id: 'reign', title: 'Reign', medium: 'TV Show', dna: 'A young queen in a foreign court, an engagement for politics, a prophecy of death, and a rival love in the half-brother.' },
    { id: 'crown', title: 'The Crown', medium: 'TV Show', dna: 'Love and duty inside an institution that outlives everyone; private feelings under public protocol; marriages as matters of state.' },
    { id: 'marie_antoinette', title: 'Marie Antoinette (2006)', medium: 'Film', dna: 'A teenage foreign bride lost in the rituals of Versailles; loneliness, cake and parties; the pressure to produce an heir.' },
    { id: 'gossip_girl', title: 'Gossip Girl', medium: 'TV Show', dna: 'Rich teenagers watched by an anonymous blogger; schemes, an outsider from Brooklyn, and loves broken and rebuilt by public posts.' },
    { id: 'after', title: 'After by Anna Todd', medium: 'Wattpad', dna: 'A good student falls for a rude, wounded rebel; intense push and pull; a bet that started it all comes to light.' },
    { id: 'kissing_booth', title: 'The Kissing Booth by Beth Reekles', medium: 'Wattpad', dna: 'A best-friend rule broken at a school fundraiser; the forbidden brother; summer, secrets and choosing between friendship and love.' },
    { id: 'through_window', title: 'Through My Window by Ariana Godoy', medium: 'Wattpad', dna: 'An obsessive crush on the mysterious neighbor; a window between their houses; Wi-Fi stolen, banter, and a family that disapproves.' }
  ],
  hooks: [
    'the hero is hired to paint the portrait of the person they publicly humiliated last season',
    'a fake engagement appears in the gossip sheet before either party has agreed to it',
    'the rival chef has booked the same kitchen on the same night for the same royal tasting',
    'a fae lord accepts the hero\'s family debt in exchange for one dance a month, forever',
    'the hero\'s new roommate is the person who left them at the altar, and the lease is non-negotiable',
    'the hero catches the prince climbing out of a library window with a stolen book',
    'a love letter meant for the hero\'s sister arrives with the hero\'s name on it',
    'the hero must teach the new duke to dance before the ball, and he is very bad at it on purpose',
    'the hero\'s dying sister wakes up cured, and a pale stranger arrives to collect the hero\'s first kiss as payment'
  ],
  places: ['an orangery heated by a captured summer', 'a lending library where letters are left inside returned books', 'a masked ball held on frozen canals', 'a vineyard estate during harvest', 'a seaside hotel at the end of the season', 'a palace where every room has two doors', 'a night market under a bridge that sells memories by the ounce'],
  complications: ['the rival is protecting the hero from someone in their own family', 'the matchmaker is in love with one of them', 'the debt was never real', 'the letter that would clear everything up was burned by someone who meant well'],
  setPieces: [
    'At the masquerade your sworn enemy pulls you behind a velvet curtain, and their breath catches.',
    'You are caught leaving the royal gardens at midnight, straight into the arms of the rebellious prince.',
    'A letter at breakfast reveals everything you were wrong about.',
    'Forced to share the last room at the inn, the stoic knight insists on sleeping on the floor.',
    'A rain-soaked argument in the courtyard ends with a kiss.',
    'The crown prince announces he will choose his bride at the gala, and his gaze is on you.',
    'A scandalous anonymous letter reveals the secret only you and your lover knew.',
    'They arrive at your door at midnight, bleeding, saying you are the only one they trust.',
    'At the court of masks you must find your partner\'s true face among a hundred, or stay forever.'
  ]
} satisfies StoryDeck;
