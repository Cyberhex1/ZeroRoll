import type { StoryDeck } from '../types';

// ohnna's Revenge model (2026-11-21) stays the rule here, and only here: the hero is
// likeable and trusted, lives through the wrong on screen, then uses what they already had.
export const revenge = {
  signature: 'A wrong is done ON SCREEN to someone likeable, and they take back what is theirs with what they already had: what they know, who still trusts them, the skill they were mocked for. In scene 1 the wrong has not happened yet; the hero is warm, trusting and not vengeful.',
  engines: ['heist', 'masquerade', 'trial', 'inheritance', 'homecoming', 'contest', 'bargain', 'hunt', 'rescue', 'mystery'],
  families: [
    { id: 'betrayal', name: 'The trusted one betrayed', hero: 'someone others rely on: a royal cook, a stablemaster, a midwife, a fixer, a first mate, a bookbinder', start: 'their best day: a promotion, an engagement, a feast they cooked, a victory they made possible', turn: 'the people they trusted take it all and leave them for dead or disgraced', payoff: 'returning unrecognized and dismantling the betrayers one by one with their own vices', palette: 'candlelight on silver, a signet ring, rain on a carriage roof, a name crossed out, a prison wall with tally marks', shapes: ['before', 'brewing', 'long_road'], rule: 'The betrayal has NOT happened when the story starts: the hero is happy, trusting and likeable in scene 1, and lives through the betrayal on screen in chapter 1 or 2. The revenge is the second half.', sources: ['monte_cristo', 'gladiator_r', 'kill_bill'] },
    { id: 'family', name: 'Blood feud', hero: 'the youngest, the quiet one, the one the family forgot to count', start: 'a family gathering, a will reading, a succession, a harvest', turn: 'a sibling or parent takes the inheritance, the land or the life of someone dear', payoff: 'turning the family\'s own rules and secrets against them', palette: 'vineyards, portraits, the family crest, a locked chapel, a will in a drawer, an old dog that remembers', shapes: ['before', 'brewing', 'long_road'], rule: 'The wrong has NOT happened in scene 1; the hero still loves their family. It lands on screen in chapter 1 or 2.', sources: ['revenge_tv', 'carrie', 'dragon_tattoo'] },
    { id: 'machine', name: 'One against the machine', hero: 'someone small inside something huge: a palace guard, a courier, a dock worker, a lamplighter, a company engineer', start: 'doing the job well inside a corrupt city, guild or company', turn: 'the machine crushes someone they love and calls it policy', payoff: 'a symbol, a heist or a masked campaign that brings the machine down', palette: 'gaslight, posters, masks, a whistle in the fog, rats and rooftops, a list of names on a wall', shapes: ['before', 'brewing', 'long_road'], rule: 'The hero starts loyal to the system; the crushing loss happens on screen. No revenge plans in scene 1.', sources: ['v_vendetta', 'dishonored', 'peaky'] },
    { id: 'quiet_pro', name: 'The retired professional', hero: 'someone who walked away from a dangerous life: a former duelist now a florist, an ex-smuggler running a ferry, a retired assassin who teaches piano', start: 'the quiet life they built, with one small thing they love', turn: 'someone from the old world takes that small thing', payoff: 'the old skills return, by the old rules, and the cost of using them', palette: 'a garden, a buried case under the floorboards, a coin with a mark, a hotel with rules, an old friend\'s warning', shapes: ['before', 'brewing'], rule: 'Scene 1 shows the peaceful life and the thing they love; the loss happens on screen.', sources: ['john_wick', 'man_on_fire', 'taken'] }
  ],
  dna: [
    { id: 'monte_cristo', title: 'The Count of Monte Cristo', medium: 'Book', dna: 'An innocent man\'s happiest day is stolen by three jealous friends; years later he returns rich and unrecognized and ruins each with their own vices; patience, disguise, and the cost of becoming the instrument of vengeance.' },
    { id: 'kill_bill', title: 'Kill Bill', medium: 'Film', dna: 'A list of names, each a chapter with its own style and setting; flashbacks reveal the betrayal piece by piece; the last name is the one the hero once loved.' },
    { id: 'oldboy', title: 'Oldboy', medium: 'Film', dna: 'Released from a long captivity without explanation, the hero hunts the captor, who wants to be found; the question is not who, but why.' },
    { id: 'v_vendetta', title: 'V for Vendetta', medium: 'Film/Comic', dna: 'A masked stranger wages a theatrical campaign against a regime that experimented on him, while teaching an ordinary person to stop being afraid.' },
    { id: 'dishonored', title: 'Dishonored', medium: 'Game', dna: 'A loyal bodyguard framed for the murder of the ruler they protected; each target can be killed or ruined in a stranger way, and mercy changes the ending.' },
    { id: 'john_wick', title: 'John Wick', medium: 'Film', dna: 'A retired professional pulled back by one small, intimate loss; a hidden world with its own rules, hotels and coins; every rule broken costs him.' },
    { id: 'gladiator_r', title: 'Gladiator', medium: 'Film', dna: 'A loyal general betrayed by the emperor\'s son loses his family and becomes a slave; he wins the crowd to reach the emperor in the arena.' },
    { id: 'sweeney', title: 'Sweeney Todd', medium: 'Musical/Film', dna: 'A man returns to the city that took his family, opens a shop, and lets revenge become appetite; dark comedy and opera; his helpers are complicit.' },
    { id: 'peaky', title: 'Peaky Blinders', medium: 'TV Show', dna: 'A war-scarred family runs a city\'s underworld; rivals, police and politicians; the leader always has a plan two steps ahead and a price for each step.' },
    { id: 'dragon_tattoo', title: 'The Girl with the Dragon Tattoo', medium: 'Book/Film', dna: 'A disgraced journalist and a brilliant, abused hacker investigate a rich family\'s old disappearance; she takes her own revenge on the man who abused her along the way.' },
    { id: 'carrie', title: 'Carrie', medium: 'Book/Film', dna: 'A bullied girl with a secret power is set up for one last cruel prank at the prom; the build-up is slow and sympathetic; the payoff is catastrophic.' },
    { id: 'revenge_tv', title: 'Revenge', medium: 'TV Series', dna: 'A young woman returns under a new name to the wealthy beach town where her father was framed, befriends the family who did it, and ruins them one by one.' },
    { id: 'man_on_fire', title: 'Man on Fire', medium: 'Film', dna: 'A burned-out bodyguard slowly comes to love the child he protects; when she is taken, he works through the kidnapping ring one person at a time.' },
    { id: 'taken', title: 'Taken', medium: 'Film', dna: 'A retired agent\'s daughter is kidnapped abroad; a phone call, a deadline, and a very particular set of skills.' },
    { id: 'sifu', title: 'Sifu', medium: 'Game', dna: 'A student witnesses the murder of their master and grows older with every defeat while hunting the five killers; each death costs years.' }
  ],
  hooks: [
    'the hero is asked to cook the wedding feast for the man who will marry their sister for her land',
    'a stranger returns the hero\'s stolen family ring at the market and says, "You\'ll want this when they come for the rest"',
    'the hero\'s mentor names them heir in front of the whole guild, and three people stop smiling',
    'the hero is the only witness to a quiet accident at the docks, and the company man asks them to sign a statement before reading it',
    'the retired hero\'s old partner knocks on the door, bleeding, and says "they found the list"',
    'the hero\'s younger brother brings home a fiancée the whole family adores, except the dog',
    'the hero wins the city\'s highest honor, and their best friend gives the toast',
    'the captain promotes the hero to first mate on the morning the ship sails for the richest port in the world'
  ],
  places: ['a floating opera house that moves between harbor cities', 'a monastery that also runs the region\'s only bank', 'a fighting arena under a cathedral', 'a vineyard estate where the cellar is older than the house', 'a hotel for professionals where no business may be done on the grounds', 'a salt-prison island visible from the city\'s richest street'],
  complications: ['one of the betrayers was protecting the hero', 'the hero\'s ally wants the same revenge for a different reason', 'the person who did it is dying and asks for forgiveness', 'the hero\'s beloved married the betrayer to keep the hero alive'],
  setPieces: [
    'You crash the high-society gala and reveal the evidence that destroys the aristocrat who framed you.',
    'You orchestrate a heist not to steal gold, but to plant proof of treason in your enemy\'s chambers.',
    'The second name on your list runs a fortified fighting arena, and the only way in is the tournament.',
    'You hijack the public execution of your ally and turn the crowd against the lord.',
    'The third betrayer hides in a guarded monastery, and you go in as a silent monk.',
    'You leave a single calling card on the sleeping magistrate\'s pillow.',
    'The corrupt judge goes pale as you read out the exact bribes he took.',
    'You confront your former mentor on a cliff edge, blades drawn, and demand to know why.'
  ]
} satisfies StoryDeck;
