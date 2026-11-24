import type { StoryDeck } from '../types';

export const fantasy = {
  signature: 'Magic has rules and costs, the world is older than anyone remembers, and companions matter as much as the quest. Wonder and danger in the same scene.',
  engines: ['journey', 'heist', 'mystery', 'siege', 'bargain', 'rescue', 'contest', 'hunt', 'inheritance', 'escape', 'delivery'],
  families: [
    { id: 'party', name: 'The unlikely party', hero: 'someone with a useful, unglamorous skill: a locksmith, a bard who owes money, a cleric who lost faith, a cook who can fight', start: 'a job, a debt or a festival where several strangers end up needing each other', turn: 'the job was a lie, and the party splits over what to do about it', payoff: 'the party chooses each other and pulls off the impossible version of the plan', palette: 'crowded taverns, guild contracts, dice games, a stolen map, mismatched armor', sources: ['honor_thieves', 'critical_role', 'baldurs_gate'] },
    { id: 'monster_hunter', name: 'Monster-hunter for hire', hero: 'a professional nobody thanks: a witcher-like hunter, a rat-catcher, a bounty tracker, a plague doctor', start: 'a village or court hiring them for a monster, and paying badly', turn: 'the monster is a person, a curse, or a crime the employer committed', payoff: 'the hunter decides who the real monster is, at a cost to their purse or name', palette: 'muddy villages, notice boards, silver blades, herbs and potions, a ruined well', sources: ['witcher', 'dragon_age'] },
    { id: 'magic_school', name: 'The cost of magic', hero: 'someone learning a power they barely control: an apprentice, a sympathist, a hedge witch, a mage with a stolen book', start: 'the school, the tower or the workshop, and a lesson that goes wrong', turn: 'the power\'s price comes due, and someone else pays it', payoff: 'mastery through understanding the rule nobody taught', palette: 'chalk diagrams, candle wax, ink-stained cuffs, a locked archive, sympathy-bindings', sources: ['name_wind', 'earthsea', 'mistborn'] },
    { id: 'realm', name: 'A realm at the edge of war', hero: 'someone small near great people: a squire, a royal taster, a herald, a border ferryman', start: 'a court, a border, or a feast while two powers circle each other', turn: 'a death or a betrayal starts the war the hero hoped to prevent', payoff: 'the hero\'s choice decides who survives the war', palette: 'banners in rain, ravens with messages, crown jewels, a border bridge, campfires on hills', sources: ['got', 'lotr', 'stormlight'] }
  ],
  dna: [
    { id: 'lotr', title: 'The Lord of the Rings', medium: 'Books/Films', dna: 'Small people carry a terrible burden across a vast, ancient world; fellowship formed and broken; temptation by power; the smallest kindness (sparing a wretched creature) decides the end.' },
    { id: 'honor_thieves', title: 'Dungeons & Dragons: Honor Among Thieves', medium: 'Film', dna: 'A crew of lovable misfits plans heists that keep going sideways; each member\'s skill matters once; jokes inside real danger; the plan fails and the improvised plan wins.' },
    { id: 'baldurs_gate', title: "Baldur's Gate 3", medium: 'Game', dna: 'Strangers bound by the same curse must cooperate; every companion has a secret and an agenda; choices of mercy or cruelty change who stays with you.' },
    { id: 'witcher', title: 'The Witcher', medium: 'Books/Games', dna: 'A monster hunter takes contracts in a morally gray world; the monster is often the victim and the client the villain; politics and prejudice are deadlier than beasts.' },
    { id: 'critical_role', title: 'Critical Role', medium: 'Web Series', dna: 'Long-form table play: banter, found family, character backstories that come back as plot, and big emotional set-pieces earned over many sessions.' },
    { id: 'got', title: 'A Song of Ice and Fire / Game of Thrones', medium: 'Books/TV', dna: 'Families compete for a throne while an older threat grows; no one is safe; honor gets people killed; small domestic scenes carry huge political weight.' },
    { id: 'name_wind', title: 'The Name of the Wind', medium: 'Book', dna: 'A gifted, poor student talks his way into a university of magic; debts, rivals and a lute; magic as science; a legend told by the man himself, who may be lying.' },
    { id: 'mistborn', title: 'Mistborn', medium: 'Book Series', dna: 'A street thief joins a crew planning to overthrow a god-emperor; magic from swallowed metals with strict rules; the heist is a revolution.' },
    { id: 'stormlight', title: 'The Stormlight Archive', medium: 'Book Series', dna: 'Broken people rise through oaths that grant power; a world shaped by storms; a slave crew on a bridge becomes an order of knights.' },
    { id: 'earthsea', title: 'The Earthsea Cycle', medium: 'Book Series', dna: 'True names hold power; a proud young mage unleashes a shadow and must hunt it across the sea, until he learns its name is his own.' },
    { id: 'dragon_age', title: 'Dragon Age: Origins', medium: 'Game', dna: 'Gather unlikely allies against a horde by honoring old treaties; each ally faction has its own crisis to solve first; the cost of victory is a sacrifice.' }
  ],
  hooks: [
    'a goblin walks into the tavern under a flag of truce and asks for the hero by name',
    'the hero\'s lock-picks open a door in the city wall that was not there yesterday',
    'a dying courier presses a sealed message into the hero\'s hand; the seal is the hero\'s own family crest',
    'the village pays the hero to kill the beast in the well, and the beast asks to be paid more not to be killed',
    'the hero\'s spell works for the first time, and someone across the city screams at the same moment',
    'a dragon\'s egg is delivered to the bakery where the hero works, addressed to "the next keeper"',
    'the king\'s taster collapses, and the hero is the only one who saw what was in the cup',
    'a map tattooed on a dead man\'s back shows the hero\'s home village with a cross over it',
    'a famous adventuring party hires the hero to carry their bags, and on the first night their leader is found dead in his bedroll',
    'the guild posts a contract for a monster that matches the hero\'s own description, down to the scar',
    'a village elder pays the hero in advance for a beast nobody else has seen, and the coins are still warm from the forge',
    'the hero\'s familiar comes back from its night hunt speaking in a voice the hero has never heard',
    'the exam proctor hands the hero a sealed question that has already been answered, in the hero\'s own hand',
    'the old queen dies at dinner and the herald must announce her heir before dessert, from a list with two names on it',
    'a ferry passenger pays the toll in coins minted by a kingdom that is not at war yet, and asks how long until it is',
    'the hero\'s debts are bought up overnight by a single stranger, who wants them repaid with one favor',
    'a statue in the market square turns its head to watch the hero pass, and only the children notice',
    'a merchant caravan rolls in a day late with every guard asleep and every horse facing backward'
  ],
  places: [
    'a city built on the back of a sleeping titan',
    'a tavern that moves to a new crossroads every full moon',
    'a university of magic whose library is guarded by its own former students',
    'a dwarven forge-hall where the forge has been burning for nine hundred years without fuel',
    'a border bridge where two kingdoms collect tolls on the same stones',
    'a forest where the trees gossip in the wind',
    'a mountain monastery that rents its bell tower to mercenaries between prayers',
    'a swamp town on stilts where the toll-keeper is a very old, very polite crocodile',
    'a dueling ground in the cellars of the magic college, scorched in neat circles',
    'a coronation hall left half-built because the last three kings died before it was finished',
    'a hunter\'s lodge whose trophy wall has one empty plaque, already engraved',
    'a gambling barge where adventurers pawn their swords between jobs',
    'a glass desert where an old battle is still visible under the surface'
  ],
  complications: [
    'the patron who hired the hero caused the disaster',
    'a companion is being paid to betray the party and is starting to regret it',
    'the prophecy is about the hero\'s sibling, not the hero',
    'the monster is the last of something, and it is grieving',
    'the cure requires something the hero promised to someone else',
    'the hero\'s oldest friend sold the plan to the other side before it began',
    'the magic everyone relies on is borrowed from the thing they are fighting',
    'the reward was promised by someone who no longer has the power to pay it',
    'the villain is trying to stop a worse disaster, by the wrong means'
  ],
  setPieces: [
    'A cracked dragon seal in the catacombs glows sickly green and the ground begins to tremble.',
    'The ancient bridge over the chasm crumbles as a wyvern swoops down from the peaks.',
    'A legendary sword is lodged in the chest of a sleeping titan that forms the valley itself.',
    'The bonfire at the harvest festival flares purple, and a demon steps out with a demand.',
    'A shipwreck sits in the middle of a landlocked forest, full of untouched treasure.',
    'An elemental rift tears open the sky over the capital, raining ash and cinder-demons.',
    'The grand archmage summons you to her tower, and you realize you are speaking to her ghost.',
    'The ancient dragon wakes, bows its head, and calls you its long-lost master.',
    'The guild auction for your own bounty opens, and you are standing in the crowd.',
    'The beast you were hired to kill lies wounded at your feet and speaks your mother\'s name.',
    'A storm of loose spells breaks out of the college vault and rewrites the courtyard stone by stone.',
    'In the final exam duel your opponent casts the forbidden spell you were blamed for last term.',
    'Two armies meet on a frozen river, and the ice starts to crack under the banners.',
    'The king asks you, the least important person in the room, to choose who rides out to parley.',
    'The heist goes wrong at the vault door, and the new plan depends on a very confused troll.',
    'A night market of goblin traders turns into a chase across the rooftops.'
  ]
} satisfies StoryDeck;
