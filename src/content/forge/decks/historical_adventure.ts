import type { StoryDeck } from '../types';

export const historical_adventure = {
  signature: 'Real places and periods, rich in custom and etiquette; history happens to ordinary people; honor, duty and loyalty are tested by power. No magic unless the story is plainly a legend.',
  engines: ['journey', 'heist', 'mystery', 'siege', 'rescue', 'contest', 'masquerade', 'trial', 'delivery', 'escape', 'homecoming', 'inheritance'],
  families: [
    { id: 'samurai', name: 'Feudal Japan', hero: 'someone bound by duty: a tea-house keeper, a ronin, a courier, a shrine maiden, a castle cook', start: 'a castle, a road station, a village under a new lord', turn: 'an order or an invasion makes duty and conscience point in opposite directions', payoff: 'a choice of honor that history will not record', palette: 'paper doors, snow on pines, sword oil, tea bowls, a river crossing, a lord\'s crest', sources: ['tsushima', 'shogun', 'seven_samurai', 'yojimbo'] },
    { id: 'renaissance', name: 'Renaissance intrigue', hero: 'someone clever and low-born in a city of power: a glassmaker, a printer, a fresco assistant, a gondolier', start: 'a workshop, a feast or a festival, where a powerful family needs a favor', turn: 'a conspiracy uses the hero as its tool and then as its scapegoat', payoff: 'outwitting the powerful with craft and nerve', palette: 'masks, ciphers, poison rings, canals, account books of the great families, scaffolds in a cathedral', sources: ['assassins_ezio', 'borgias', 'musketeers'] },
    { id: 'rome', name: 'Rome and the arena', hero: 'someone owned, conscripted or ignored: a slave scribe, a legion cook, a gladiator\'s trainer, a freedwoman merchant', start: 'the city, the camp or the arena before a great event', turn: 'a death in high places makes the hero a target', payoff: 'freedom, revenge or a name remembered', palette: 'sand and blood, wax tablets, marble and graffiti, legion standards, the Tiber at night', sources: ['gladiator', 'rome', 'ac_origins'] },
    { id: 'wuxia', name: 'Wuxia road', hero: 'someone with a hidden skill: an innkeeper, an escort-agency guard, a disgraced disciple, a scholar who studied the wrong book', start: 'an inn, an escort job, a tournament', turn: 'a stolen manual or a sect feud draws the hero into the martial world', payoff: 'a duel that settles more than the fight', palette: 'bamboo forests, rooftops, tea houses, jade seals, swords that ring, rival sects', sources: ['crouching_tiger', 'marco_polo', 'flying_guillotine'] }
  ],
  dna: [
    { id: 'tsushima', title: 'Ghost of Tsushima', medium: 'Game', dna: 'A samurai must abandon the honorable way to save his island from invasion; stealth versus the code; his uncle\'s love and disapproval; beauty of wind and leaves.' },
    { id: 'shogun', title: 'Shōgun', medium: 'Book/FX Show', dna: 'A foreign pilot shipwrecked into Japanese politics; language, etiquette and translation as danger; a lord playing a long game nobody sees until the end.' },
    { id: 'seven_samurai', title: 'Seven Samurai', medium: 'Film', dna: 'Poor farmers hire masterless warriors to defend their village; recruiting each one is a story; preparations, mistrust, and a battle in the rain.' },
    { id: 'yojimbo', title: 'Yojimbo', medium: 'Film', dna: 'A wandering swordsman arrives in a town split between two gangs and plays them against each other for pay and for justice.' },
    { id: 'assassins_ezio', title: "Assassin's Creed (Ezio Trilogy)", medium: 'Games', dna: 'A young noble\'s family is hanged by conspirators; he learns secret skills, climbs Renaissance cities, and works through a list of powerful men.' },
    { id: 'borgias', title: 'The Borgias', medium: 'TV Show', dna: 'A family buys the papacy and fights to keep it; sex, poison and alliances; the children are both the family\'s weapons and its weakness.' },
    { id: 'musketeers', title: 'The Three Musketeers', medium: 'Book', dna: 'A hot-headed provincial joins three musketeers; duels, a queen\'s secret, a cardinal\'s spy, and a lethal femme fatale; friendship as the real prize.' },
    { id: 'gladiator', title: 'Gladiator', medium: 'Film', dna: 'A betrayed general becomes a slave and fights his way up the arena to face the emperor who murdered his family; the crowd as power.' },
    { id: 'rome', title: 'Rome', medium: 'HBO Series', dna: 'Two common soldiers stumble through the fall of the Republic beside Caesar; history seen from the street; loyalty, family and luck.' },
    { id: 'ac_origins', title: "Assassin's Creed Origins", medium: 'Game', dna: 'A village protector in Ptolemaic Egypt hunts the masked order behind his son\'s death; tombs, politics and grief across a living ancient world.' },
    { id: 'crouching_tiger', title: 'Crouching Tiger, Hidden Dragon', medium: 'Film', dna: 'A stolen sword, a noblewoman who is secretly a master fighter, love that was never spoken; duels on rooftops and in treetops.' },
    { id: 'marco_polo', title: 'Marco Polo', medium: 'Netflix Series', dna: 'A merchant\'s son left at the Khan\'s court becomes a tool of an empire; foreign customs, divided loyalties and a war of succession.' },
    { id: 'flying_guillotine', title: 'Master of the Flying Guillotine', medium: 'Film', dna: 'A tournament of eccentric fighters, each with a strange style, while a blind assassin with an absurd weapon hunts the hero.' }
  ],
  hooks: [
    'the new servant at the castle asks the hero which room the lord sleeps in, for the third time this week',
    'a glass order from a great family arrives with a design that is a coded message',
    'a courier\'s horse comes into the station without its rider, carrying a sealed dispatch',
    'a dying gladiator tells the hero a password and a name',
    'an innkeeper finds a famous sword wrapped in a guest\'s bedroll, and the guest is gone',
    'the printing house is ordered to print a confession by a man who has not been arrested yet',
    'the hero is asked to taste the Doge\'s wine at the masquerade because the official taster is missing',
    'a ronin offers to protect the hero\'s village for a single bowl of rice a day'
  ],
  places: ['a post station on a mountain road where every traveler must show papers', 'a Venetian glass furnace on an island where the masters may never leave', 'a gladiator school above a bakery', 'a tea house with a hidden room for rebels', 'an aqueduct under construction outside a provincial city', 'a caravanserai at the edge of the Silk Road'],
  complications: ['the lord the hero serves arranged the attack himself', 'the rebel the hero is hiding is the lord\'s child', 'the ally is a spy reporting to both sides', 'the document that would save everyone is a forgery'],
  setPieces: [
    'The Library of Alexandria burns, and you must choose between a trapped scholar and the last copy of a text.',
    'You draw your blade in the moonlit snow against three ronin come for your bounty.',
    'The Colosseum roars as the emperor turns his thumb down.',
    'A musketeer presses a sealed letter into your hand before dying in the mud.',
    'Siege engines launch flaming pitch over the castle walls as shinobi climb the ramparts.',
    'You duel a master swordsman atop a swaying bamboo canopy.',
    'A ninja\'s smoke bomb fills the teahouse, and when it clears the heir is gone.',
    'You must hold the mountain pass long enough for the village to escape.'
  ]
} satisfies StoryDeck;
