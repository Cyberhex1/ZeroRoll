import type { StoryDeck } from '../types';

export const adventure = {
  signature: 'Momentum, daring and clever escapes: maps, ships, ruins and rivals; humor under pressure; every treasure has a price and a curse or a rival attached.',
  engines: ['journey', 'heist', 'mystery', 'rescue', 'contest', 'hunt', 'inheritance', 'escape', 'delivery', 'bargain'],
  families: [
    { id: 'high_seas', name: 'High-seas swashbuckler', hero: 'someone on or near a ship: a ship\'s cook, a navigator\'s apprentice, a harbor pickpocket, a captain who lost her ship at cards', start: 'a port, a tavern deal or the deck of a ship about to sail', turn: 'mutiny, a wreck or a rival crew gets there first', payoff: 'the treasure won, given away, or traded for something better', palette: 'tar and salt, rope burns, a spyglass, cannon smoke, parrots and pennants, a chart with a bloodstain', sources: ['pirates_caribbean', 'treasure_island', 'black_sails', 'one_piece'] },
    { id: 'tomb_raider', name: 'Ruins and relics', hero: 'someone who knows old things: a museum restorer, a guide, a disgraced professor, a smuggler\'s daughter', start: 'a dig, a market, an auction or a museum after hours', turn: 'the relic is cursed or the expedition is betrayed by its sponsor', payoff: 'escaping the collapsing ruin with the truth, if not the treasure', palette: 'torchlight on carvings, pressure plates, dust and bat wings, a satchel, a rival\'s hat', sources: ['indiana_jones', 'mummy', 'uncharted', 'tomb_raider'] },
    { id: 'lost_world', name: 'The lost world', hero: 'someone joining an expedition for personal reasons: a cartographer, a cook, a stowaway, a scientist\'s sibling', start: 'the expedition setting out, with the sponsor\'s promises and everyone\'s secrets', turn: 'the expedition finds something alive, and it changes the plan', payoff: 'protecting the lost place from the people who came with you', palette: 'airships, machetes, a fever journal, giant ferns, a tilted compass, a hidden river', sources: ['journey_center', 'atlantis', 'king_kong'] },
    { id: 'caper', name: 'The treasure caper', hero: 'a charming amateur in over their head: a romance novelist, a carnival barker, a kid with a map, a retired forger', start: 'stumbling onto a clue nobody else understands', turn: 'professional villains want the clue and the hero\'s friends get caught in it', payoff: 'outwitting the professionals with amateur nerve', palette: 'bicycle chases, skeleton keys, booby traps, a pirate\'s riddle in verse, a soggy map', sources: ['goonies', 'romancing_stone', 'monkey_island'] }
  ],
  dna: [
    { id: 'pirates_caribbean', title: 'Pirates of the Caribbean: Curse of the Black Pearl', medium: 'Film', dna: 'A cursed crew that cannot die, a gold piece that calls them, an unreliable rogue whose loyalty shifts scene by scene, and sword fights full of jokes.' },
    { id: 'treasure_island', title: 'Treasure Island', medium: 'Book', dna: 'A young nobody with a map joins a voyage full of people who want it; a charming villain the hero cannot help liking, whose loyalty turns with the tide; mutiny, a castaway, and a stockade to hold.' },
    { id: 'uncharted', title: "Uncharted 4: A Thief's End", medium: 'Game', dna: 'A retired treasure hunter pulled back by his long-lost brother; clues across continents to a pirate colony; climbing set-pieces and the cost of obsession on a marriage.' },
    { id: 'black_sails', title: 'Black Sails', medium: 'TV Show', dna: 'Pirate politics: a captain plans an impossible prize while managing a crew that votes; reputation is a weapon; a war against civilization itself.' },
    { id: 'indiana_jones', title: 'Indiana Jones: Raiders of the Lost Ark', medium: 'Film', dna: 'A professor-adventurer races an enemy army for a relic of real power; traps, chases, an old flame; the relic punishes those who misuse it.' },
    { id: 'mummy', title: 'The Mummy (1999)', medium: 'Film', dna: 'A librarian, a rogue and a coward on a cursed dig; a book that should not be read aloud; plagues in order; dread made fun.' },
    { id: 'goonies', title: 'The Goonies', medium: 'Film', dna: 'Kids about to lose their homes follow a pirate\'s map under their town; booby traps, a crime family on their heels, and a deformed giant who becomes a friend.' },
    { id: 'journey_center', title: 'Journey to the Center of the Earth', medium: 'Book/Film', dna: 'A stubborn professor, a reluctant nephew and a guide descend through a volcano into a lost world of sea, giant mushrooms and living prehistory.' },
    { id: 'one_piece', title: 'One Piece', medium: 'Manga/Anime', dna: 'A crew of dreamers, each with a dream of their own; islands with outrageous rules; loyalty above all; joy and absurdity next to real grief.' },
    { id: 'romancing_stone', title: 'Romancing the Stone', medium: 'Film', dna: 'A shy romance writer is dragged into a jungle treasure hunt with a mercenary; her imagination turns out to be useful; romance and greed collide.' },
    { id: 'monkey_island', title: 'Monkey Island', medium: 'Games', dna: 'A hopeless wannabe pirate solves absurd puzzles, wins sword fights with insults, and rescues a governor who rescues herself.' },
    { id: 'tomb_raider', title: 'Tomb Raider', medium: 'Games', dna: 'A scholar-explorer alone in ruins built as puzzles: climbing, traps that test nerve, rival collectors, and a relic that someone powerful wants to misuse.' },
    { id: 'king_kong', title: 'King Kong (2005)', medium: 'Film', dna: 'A film crew sails to a fog-bound island off the maps; the island has its own food chain and its own god; bringing the wonder home is the tragedy.' },
    { id: 'atlantis', title: 'Atlantis: The Lost Empire', medium: 'Film', dna: 'A linguist joins a mercenary expedition to a lost civilization; the treasure is the living heart of a people; the crew must choose between pay and decency.' }
  ],
  hooks: [
    'a parrot lands on the hero\'s shoulder and recites coordinates in a dead captain\'s voice',
    'the hero wins a ship in a card game, and the crew comes with debts',
    'an auction lot the hero is cataloguing starts ticking',
    'a rival treasure hunter turns up at the hero\'s door, soaked and bleeding, asking for help with the map they stole from the hero',
    'the tide goes out three times farther than it should, and reveals a mast',
    'a museum visitor slips the hero a note: "The exhibit is a fake. The real one is under your feet."',
    'the hero\'s grandmother\'s will leaves them a key, a compass and a confession',
    'the expedition\'s sponsor arrives on the dock with armed men instead of supplies'
  ],
  places: ['a pirate free-port built on the wrecks of a hundred ships', 'a cliff monastery reachable only by a basket on a rope', 'a sunken cathedral visible through clear water at noon', 'a jungle temple whose stairs rearrange at night', 'a night market on a river of barges', 'a desert where a lighthouse stands two hundred miles from the sea'],
  complications: ['the map was drawn as a trap for treasure hunters', 'the hero\'s mentor already found the treasure and hid it again', 'the curse is the only thing keeping a monster asleep', 'the rival is racing for the treasure to pay a ransom'],
  setPieces: [
    'A cannonball shreds the mainsail as the ghost ship rams your starboard side.',
    'The obsidian compass points straight down into the abyssal trench.',
    'You swing across a collapsing jungle temple with the idol as the floor falls away.',
    'A kraken tentacle the size of a galleon wraps around the hull and drags you toward the maelstrom.',
    'The ancient mechanism traps you in a room filling with sand while a riddle echoes from the walls.',
    'A rival holds you at gunpoint on a rope bridge over a gorge.',
    'A whirlpool pulls the crew down to a domed city waiting intact on the ocean floor.',
    'You trigger a pressure plate and a boulder chases you into the dark.'
  ]
} satisfies StoryDeck;
