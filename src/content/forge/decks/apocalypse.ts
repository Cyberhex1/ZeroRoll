import type { StoryDeck } from '../types';

export const apocalypse = {
  signature: 'After the end: scarcity, ingenuity and strange new cultures built from ruins. Hope is hard-won; every settlement has its own rules; the old world\'s leftovers are both treasure and danger.',
  engines: ['journey', 'siege', 'survival', 'rescue', 'heist', 'delivery', 'bargain', 'mystery', 'hunt', 'escape', 'homecoming'],
  families: [
    { id: 'vault', name: 'Out of the vault', hero: 'someone raised sheltered: a vault dweller, a bunker child, a seed-bank keeper, a dome gardener', start: 'the first day outside, or the day a stranger knocks on the door', turn: 'the shelter\'s founders lied about why it was built', payoff: 'choosing between the safe lie and the open world', palette: 'blue jumpsuits, blast doors, pip-boy-like wrist screens, cans with cheerful labels, a sun nobody inside has seen', sources: ['fallout', 'snowpiercer', 'metro'] },
    { id: 'road', name: 'The road', hero: 'a traveler with something precious: a parent and child, a courier, a mechanic with a working engine, a librarian with the last books', start: 'the road and its few safe stops', turn: 'what they carry is wanted by someone who will not trade', payoff: 'delivering it, and finding something worth rebuilding', palette: 'ash skies, shopping carts, rusted overpasses, a dog, a map of water, a shotgun with three shells', sources: ['the_road', 'book_eli', 'postman'] },
    { id: 'wasteland', name: 'Wasteland chrome', hero: 'someone useful to a warlord or a caravan: a water-rig mechanic, a war-boy, a fuel runner, a scrap surgeon', start: 'a fortress, a convoy, a fuel town, a market of scrap', turn: 'a rebellion, a theft or a defection puts them on the wrong side', payoff: 'a chase across the waste that ends in a new kind of home', palette: 'chrome and dust, engine roars, war paint, water rations, a guitar on a truck, a citadel on a cliff', sources: ['mad_max', 'kenshi', 'turbo_kid'] },
    { id: 'zone', name: 'The Zone', hero: 'someone who enters a forbidden area for pay: a stalker, a scavenger, a scientist\'s guide, a smuggler', start: 'the checkpoint, the bar where guides are hired, the edge of the fence', turn: 'the Zone changes and the client is not who they said', payoff: 'reaching the center and deciding what to wish for', palette: 'anomalies, bolts thrown ahead, Geiger clicks, abandoned apartments, a mutant forest, a radio rumor', sources: ['stalker', 'horizon', 'metro'] }
  ],
  dna: [
    { id: 'fallout', title: 'Fallout', medium: 'Game Series & TV Show', dna: 'Retro-future optimism over radioactive ruin; vaults that were experiments; dark comedy, factions with odd ideologies, and the question of what people become.' },
    { id: 'mad_max', title: 'Mad Max: Fury Road', medium: 'Film', dna: 'A two-way chase across the desert; a warlord\'s wives escape in a war rig; almost no dialogue, all momentum; the road back is the answer.' },
    { id: 'the_road', title: 'The Road', medium: 'Book/Film', dna: 'A father and son walk south through ash; carrying the fire; every stranger may be a cannibal; tenderness as the only thing left.' },
    { id: 'book_eli', title: 'The Book of Eli', medium: 'Film', dna: 'A lone walker carries the last copy of a book west; a town boss wants it for power; faith, violence, and a twist about how he reads.' },
    { id: 'snowpiercer', title: 'Snowpiercer', medium: 'Film/TV', dna: 'Humanity\'s survivors live on an endless train in a frozen world, ranked by carriage; the tail rebels and fights car by car toward the engine.' },
    { id: 'waterworld', title: 'Waterworld', medium: 'Film', dna: 'A drowned planet of floating atolls; a loner mariner, a girl with a map tattoo, pirates on jet skis, and the dream of dry land.' },
    { id: 'horizon', title: 'Horizon Zero Dawn', medium: 'Game', dna: 'Tribes hunt machine beasts in a lush far-future world; an outcast discovers the old world\'s truth in its ruins; the machines were made to heal the earth.' },
    { id: 'metro', title: 'Metro 2033', medium: 'Games/Books', dna: 'Survivors live in metro stations that became tiny nations; a young man travels the tunnels between them; mutants, ideology and a mystery on the surface.' },
    { id: 'stalker', title: 'S.T.A.L.K.E.R.: Shadow of Chernobyl', medium: 'Game', dna: 'Scavengers enter an exclusion zone of anomalies and artifacts; a man with amnesia and a note: kill Strelok; rumors of a wish-granting center.' },
    { id: 'postman', title: 'The Postman', medium: 'Film/Book', dna: 'A drifter in a dead uniform pretends to be a mail carrier for a restored government, and the lie gives scattered towns hope enough to make it true.' },
    { id: 'kenshi', title: 'Kenshi', medium: 'Game', dna: 'A nobody in a huge, indifferent wasteland: slavers, cannibals, swordsmen; you build a squad and a town from nothing, and the world does not care.' },
    { id: 'turbo_kid', title: 'Turbo Kid', medium: 'Film', dna: 'An 80s-flavored wasteland on BMX bikes; a comic-book-loving kid, a manic friendly girl, a cruel warlord; gore and sweetness together.' },
    { id: 'i_am_legend', title: 'I Am Legend', medium: 'Book/Film', dna: 'The last man in a city, routines and a dog, hunting a cure by day and hiding by night; he discovers he is the monster in their legend.' }
  ],
  hooks: [
    'the settlement\'s water still produces a bottle of clean water with a pre-war label on it',
    'a stranger in a pristine pre-war suit walks out of the dust and asks for directions to a city that was destroyed',
    'the vault door opens on its own schedule for the first time in eighty years',
    'a radio broadcast promises a safe haven and reads out the hero\'s name among the people expected',
    'the caravan the hero guards stops answering on the radio, but its lights keep moving',
    'a child arrives at the gate carrying seeds from a plant that went extinct',
    'the trading robot at the outpost offers the hero a military weapon for one bottle cap and a hug',
    'the hero\'s Geiger counter goes completely silent in the middle of the most radioactive district'
  ],
  places: ['a town built inside a beached aircraft carrier', 'a library-fortress guarded by the last librarians', 'a train that never stops, where tickets are inherited', 'a market held in the ribcage of a dead skyscraper', 'a greenhouse dome whose plants are slowly taking over', 'a highway overpass turned into a mile-long settlement'],
  complications: ['the safe haven is real but needs workers, not guests', 'the raiders are refugees from something worse', 'the cure works, and it changes who survives', 'the settlement\'s founder caused the disaster'],
  setPieces: [
    'The Geiger counter screams as an irradiated monster bursts through the shell of a pre-war bus.',
    'A dust storm drives you into a half-buried convenience store with someone already inside.',
    'You hear a raider convoy outside the diner just as you find a pristine can of food.',
    'A sealed bunker hums with power, and its biometric scanner waits for a hand.',
    'Zealots who worship an unexploded bomb corner you in a ruined cathedral.',
    'The automated turrets of the ruined facility lock onto you.',
    'A crashed satellite\'s databanks still hold the coordinates of a military cache.',
    'You defend your scrap fortress from a night raid with jury-rigged traps and too little ammo.'
  ]
} satisfies StoryDeck;
