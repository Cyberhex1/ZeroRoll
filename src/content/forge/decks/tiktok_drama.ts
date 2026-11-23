import type { StoryDeck } from '../types';

// Short Drama keeps ohnna's pattern (2026-11-21): underestimated hero, slights that pile up,
// public humiliation, and a reveal timed for maximum impact. The decks add variety around it.
export const tiktok_drama = {
  signature: 'Short-drama beats: an underestimated, sympathetic hero with a hidden status, skill or past; slights that escalate into public humiliation; and a reveal timed for maximum impact. The secret stays hidden until the reveal. In scene 1 the hero does nothing cruel or criminal; the cruelty belongs to others.',
  engines: ['masquerade', 'courtship', 'contest', 'inheritance', 'homecoming', 'bargain', 'trial', 'heist'],
  families: [
    { id: 'hidden_heir', name: 'The hidden heir', hero: 'someone dismissed (a waitress, a temp, a quiet spouse, an adopted daughter, a delivery rider) who secretly owns or will inherit something huge', start: 'a normal day where the slights pile up at work or at a family event', turn: 'the humiliation goes public and they lose the job, the marriage or the home', payoff: 'the reveal at the gala, the board meeting or the wedding', palette: 'glass towers, champagne flutes, a cheap uniform, black cars, a phone that never stops buzzing, a grandmother\'s jade bracelet', sources: ['secret_heiress', 'billion_slap', 'undercover_tycoon', 'masked_heiress'] },
    { id: 'contract', name: 'Contract romance', hero: 'someone who needs money or protection fast: a med student with debts, a single parent, a florist losing her shop', start: 'signing a marriage or dating contract with a cold, powerful stranger', turn: 'the family or an ex sabotages them and the contract is torn up in public', payoff: 'the real feelings and the real identity revealed together', palette: 'penthouses, NDAs, a ring box, paparazzi flashes, rain outside a limousine, a contract with a clause about falling in love', sources: ['ceo_contract', 'married_enemy', 'accidental_bride', 'surrogate'] },
    { id: 'rebirth', name: 'Reborn with hindsight', hero: 'someone who died betrayed and woke years earlier with every memory', start: 'the day before everything went wrong the first time', turn: 'the betrayers start to act differently, and the hero\'s changes have a cost', payoff: 'beating each betrayer at the moment they ruined the hero last time', palette: 'a calendar with circled dates, an old phone, a dress from a first life, a familiar banquet hall, a letter the hero once never sent', sources: ['villainess', 'true_daughter', 'betrayed_rising'] },
    { id: 'pack', name: 'Rejected mate', hero: 'a dismissed member of a werewolf pack or supernatural family', start: 'the mating ceremony, the pack gathering, the moon festival', turn: 'public rejection and exile', payoff: 'the hidden bloodline awakens and the pack must bow', palette: 'moonlit forests, pack marks, silver, an alpha\'s scent, a ceremony circle, a lone cabin', sources: ['rejected_mate', 'hidden_heir_alpha'] },
    { id: 'ex', name: 'Revenge of the ex-spouse', hero: 'a spouse everyone underestimates: a homemaker, a gentle surgeon, a quiet IT director', start: 'an anniversary, a family dinner, the day the spouse brings the "new friend" home', turn: 'the divorce papers in public, with the family laughing', payoff: 'the divorced spouse turns out to own the thing everyone wanted', palette: 'divorce papers, a wedding ring in a glass, a mother-in-law\'s pearls, a company logo, a press conference', sources: ['double_life', 'divorce_ceo', 'ex_wife'] }
  ],
  dna: [
    { id: 'secret_heiress', title: 'The Secret Heiress', medium: 'GoodNovel', dna: 'A poor girl mocked by her in-laws is secretly the heir of the richest family; each episode adds a slight and a near-reveal; the final banquet turns the room upside down.' },
    { id: 'billion_slap', title: 'The $50 Billion Slap', medium: 'DramaBox', dna: 'A single public insult sets off a chain of escalating confrontations; every villain underestimates the hero once; the hero answers each with a calm counter.' },
    { id: 'ceo_contract', title: "The CEO's Contract Wife", medium: 'ReelShort', dna: 'A fake marriage with clauses and a time limit; jealousy breaks the clauses one by one; the cold partner melts in public before admitting it in private.' },
    { id: 'married_enemy', title: 'Married to the Enemy', medium: 'Wattpad', dna: 'Two rival families joined by a wedding neither wanted; sabotage and attraction in the same scenes; the real enemy is someone at the wedding.' },
    { id: 'villainess', title: 'Reborn as the Villainess', medium: 'GoodNovel', dna: 'Waking inside a story knowing its ending; avoiding the doom everyone expects; the more the hero tries to leave the plot, the more the plot chases them.' },
    { id: 'true_daughter', title: 'The True Daughter Returns', medium: 'GoodNovel', dna: 'Babies switched at birth; the real daughter comes home to a family that prefers the fake one; framed thefts, loyalty tests, and a DNA result read aloud.' },
    { id: 'rejected_mate', title: "Alpha's Rejected Mate", medium: 'GoodNovel', dna: 'Rejected by her fated alpha in front of the pack for a stronger she-wolf; exile; a rare bloodline awakens; the alpha regrets it on his knees.' },
    { id: 'hidden_heir_alpha', title: "The Alpha's Hidden Heir", medium: 'GoodNovel', dna: 'A woman flees a pack while pregnant and returns years later with a child who has the alpha\'s eyes; protection, possessiveness and old enemies.' },
    { id: 'double_life', title: "My Husband's Double Life", medium: 'ReelShort', dna: 'A wife discovers her husband\'s second family; she smiles, gathers proof and assets, and leaves him with nothing at the perfect moment.' },
    { id: 'undercover_tycoon', title: "The Undercover Tycoon's Vengeance", medium: 'DramaBox', dna: 'A billionaire works incognito as a security guard in his own company and records who abuses the staff; the board meeting reveal fires them all.' },
    { id: 'divorce_ceo', title: 'Divorce Me, CEO!', medium: 'Wattpad', dna: 'A wife finally asks for the divorce her cold CEO husband always threatened; now he refuses, and starts noticing everything she did.' },
    { id: 'ex_wife', title: 'Revenge of the Ex-Wife', medium: 'ReelShort', dna: 'Thrown out after years of marriage, a woman rebuilds a business empire and returns as the investor her ex-husband\'s company is begging for.' },
    { id: 'masked_heiress', title: 'The Masked Heiress', medium: 'GoodNovel', dna: 'An heiress hides her face and works as a maid in her fiancé\'s house to see who he really is before the wedding.' },
    { id: 'accidental_bride', title: "The Billionaire's Accidental Bride", medium: 'DramaBox', dna: 'A mix-up at the registry office marries a waitress to a billionaire; neither can undo it before a deadline; their families declare war.' },
    { id: 'surrogate', title: "The Billionaire's Surrogate", medium: 'Wattpad', dna: 'A broke student agrees to be a surrogate for a mysterious rich client; the contract hides who the client really is and why he chose her.' },
    { id: 'betrayed_rising', title: 'Betrayed but Rising', medium: 'GoodNovel', dna: 'Framed by her sister and fiancé, a woman loses everything; she climbs back through talent and one powerful ally, and confronts them at the top.' }
  ],
  hooks: [
    'the hero is told to serve drinks at the engagement party of the man who dumped them last week',
    'a lawyer\'s letter arrives at the hero\'s night-shift job, addressed to them by a surname they have never used',
    'the hero wakes up on the morning of their own wedding, three years before they died',
    'the in-laws seat the hero at the kids\' table, and the CEO everyone is courting sits down beside them',
    'the hero\'s boss tells them to hand over their best design to the boss\'s nephew "for the team"',
    'the hero finds a second wedding ring in their spouse\'s coat, engraved with tomorrow\'s date',
    'an old woman the hero helped on the bus last month sends a black car to pick them up',
    'the pack alpha announces the mating ceremony and the hero is told to wait outside the circle',
    'the hero opens their eyes at their graduation dinner, seated beside the best friend who will poison them in five years',
    'the hero\'s wolf refuses to come out on the night of the trials, and the alpha\'s heir laughs the loudest'
  ],
  places: ['a revolving restaurant on top of the family\'s tower', 'a wedding hall booked for two weddings by mistake', 'a corporate gala on a yacht', 'a convenience store across from the company headquarters', 'a family villa where the servants know everything', 'a pack lodge in the mountains during the full moon'],
  complications: ['the cold rival has been quietly protecting the hero', 'the hero\'s best friend is the one leaking secrets', 'the hidden fortune comes with a condition', 'the person who humiliated the hero is being blackmailed'],
  setPieces: [
    'The banquet falls silent as you reveal the DNA results proving the pampered heir is an imposter.',
    'The arrogant young master demands you kneel just as his grandfather rushes in and bows to you.',
    'The stepsister destroys the lead dress, and you walk the runway in a gown you made overnight.',
    'Your husband\'s one phone call grounds a fleet of private jets in front of your stunned family.',
    'You arrive at your ex\'s wedding on the arm of the city\'s most feared tycoon.',
    'The mother-in-law offers you a bribe to leave, and you slide back a check for ten times as much.',
    'The rival\'s hostile takeover springs the trap you laid, and bankrupts him instead.',
    'The alpha who rejected you kneels as your bloodline awakens under the full moon.',
    'The moon festival goes silent when the elder\'s scent-test names you, not the chosen bride, as the alpha\'s true mate.'
  ]
} satisfies StoryDeck;
