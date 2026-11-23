import type { StoryDeck } from '../types';

export const cosmic_horror = {
  signature: 'Knowledge is the danger: the universe is vast, old and indifferent, and understanding it costs sleep, sanity and relationships. Dread grows from scholarly detail, impossible geometry and things glimpsed, never fully shown.',
  engines: ['mystery', 'journey', 'trial', 'hunt', 'inheritance', 'bargain', 'escape', 'survival', 'homecoming'],
  families: [
    { id: 'archive', name: 'The forbidden archive', hero: 'someone whose work is reading: a translator, an archivist, a cataloguer, a court stenographer, a museum night-guard', start: 'a commission, an estate library, an unindexed box', turn: 'understanding spreads like an infection and changes the people around them', payoff: 'a choice between knowing and forgetting, or burning it all', palette: 'green banker lamps, foxed pages, marginalia, a seal in wax, a word that should not be pronounced, rain on leaded glass', sources: ['call_cthulhu', 'in_mouth', 'control'] },
    { id: 'coast', name: 'The coastal town', hero: 'someone visiting or returning to a fishing town: a genealogist, a lighthouse relief keeper, a fish buyer, a census taker', start: 'arriving in a town with odd faces, odd jewelry and an odd church', turn: 'the town\'s secret is the hero\'s own ancestry', payoff: 'escaping, or going down to the sea on purpose', palette: 'fish-smell, gold tiaras, a boarded hotel, tide pools, a reef offshore, a hymn in no human key', sources: ['innsmouth', 'lighthouse', 'dredge'] },
    { id: 'expedition', name: 'The expedition', hero: 'someone on a scientific team: a geologist, a cook, a radio operator, a photographer, a biologist', start: 'the expedition setting out into ice, jungle, desert or a shimmering zone', turn: 'the team finds something older than humanity and begins to change', payoff: 'bringing back a warning nobody will believe, or not coming back', palette: 'sled dogs, core samples, field notebooks, a camp radio, crystal growths, a city under ice', sources: ['mountains_madness', 'annihilation', 'prometheus'] },
    { id: 'deep', name: 'Into the deep and the void', hero: 'someone isolated on a station: a submarine engineer, a deep-space medic, a dredge captain, an orbital welder', start: 'a routine shift far from anyone, and a signal or a contact', turn: 'the signal is an invitation and the crew starts to answer it', payoff: 'surviving as yourself, or becoming part of something larger', palette: 'sonar pings, pressure hull creaks, a cold airlock, a recorded voice, a horizon that is the wrong color', sources: ['event_horizon', 'soma', 'alien', 'dredge'] }
  ],
  dna: [
    { id: 'bloodborne', title: 'Bloodborne', medium: 'Game', dna: 'A gothic city hunts beasts during a night that will not end; the church\'s holy blood is the plague; insight lets you see the great ones, and seeing them is the curse.' },
    { id: 'call_cthulhu', title: 'Call of Cthulhu', medium: 'Tabletop RPG', dna: 'Investigators piece together a conspiracy from newspapers, diaries and libraries; every clue costs sanity; victory is delaying the end, at best.' },
    { id: 'innsmouth', title: 'The Shadow Over Innsmouth', medium: 'Book', dna: 'A traveler visits a decaying fishing town with strange people and gold; a night escape from the hotel; at home, he discovers his own ancestry and starts dreaming of the sea.' },
    { id: 'mountains_madness', title: 'At the Mountains of Madness', medium: 'Book', dna: 'An Antarctic expedition finds a vast alien city and the history carved on its walls; the creators were not the worst thing there.' },
    { id: 'annihilation', title: 'Annihilation', medium: 'Film/Book', dna: 'An all-woman team enters a shimmering zone where life mutates and refracts; earlier teams never returned; the zone copies what enters it.' },
    { id: 'colour_space', title: 'Color Out of Space', medium: 'Film', dna: 'A meteorite poisons a farm with a color no one can name; the family and animals change; isolation and love curdle slowly.' },
    { id: 'the_mist', title: 'The Mist', medium: 'Film', dna: 'A town trapped in a supermarket by a mist full of creatures; the fanatic inside becomes more dangerous than the monsters outside.' },
    { id: 'event_horizon', title: 'Event Horizon', medium: 'Film', dna: 'A rescue crew boards a lost ship that went somewhere outside the universe and came back; it shows each crew member their guilt.' },
    { id: 'in_mouth', title: 'In the Mouth of Madness', medium: 'Film', dna: 'An insurance investigator hunts a missing horror novelist and finds the town from his books; reality is being rewritten by readers.' },
    { id: 'alien', title: 'Alien', medium: 'Film', dna: 'A working crew answers a distress call and brings something aboard; the company considers them expendable; one survivor in the dark.' },
    { id: 'prometheus', title: 'Prometheus', medium: 'Film', dna: 'Scientists follow star maps to meet humanity\'s makers, who turn out to want us gone; faith, hubris and a black goo that remakes life.' },
    { id: 'soma', title: 'SOMA', medium: 'Game', dna: 'The world has already ended outside; minds copied into machines and borrowed bodies; every rescue raises the question of which copy is the real person, and the hero must decide who gets to go on.' },
    { id: 'uzumaki', title: 'Uzumaki', medium: 'Manga by Junji Ito', dna: 'A town becomes obsessed with spirals; each chapter a new spiral horror; the obsession spreads through people until the town itself coils.' },
    { id: 'lighthouse', title: 'The Lighthouse', medium: 'Film', dna: 'Two keepers on a storm-bound rock; drink, power games and mermaids; the light at the top is forbidden and everything.' },
    { id: 'true_detective', title: 'True Detective (Season 1)', medium: 'TV Show', dna: 'Two detectives with clashing philosophies chase a ritual killer across years; bayou churches, a yellow king, and time as a flat circle.' },
    { id: 'dredge', title: 'Dredge', medium: 'Game', dna: 'A fisherman sells catches in an archipelago where some fish are wrong; fog at night, a collector who wants relics, and a debt to the deep.' },
    { id: 'control', title: 'Control', medium: 'Game', dna: 'A woman walks into a secret government building that is bigger inside and becomes its director; objects of power, bureaucracy and a hiss in the walls.' }
  ],
  hooks: [
    'an estate library\'s oldest book is annotated in the hero\'s late father\'s handwriting',
    'the lighthouse log the hero inherits records a ship arriving tomorrow night that sank in 1890',
    'a star photograph plate shows one more star each night, getting closer to the edge of the frame',
    'the translation job pays triple, on the condition that the hero never reads the last page aloud',
    'every fish in the morning catch has the same pattern on its scales, and it is a map',
    'the hero\'s sleep-study patient describes the hero\'s childhood bedroom in perfect detail',
    'a seismic sensor in the ice picks up a slow rhythm, like breathing, under the expedition camp',
    'the building\'s floor plan has a room the hero has walked past every day, and the door is new'
  ],
  places: ['a university observatory that closed after a single night', 'a fishing town where everyone wears gold and nobody swims', 'a research station on stilts over a sinkhole', 'a deep-sea mining platform during a storm', 'a cathedral library with a basement shelf that goes down further every year', 'an island archipelago that does not appear on the same map twice'],
  complications: ['the hero\'s family made the first pact', 'the mentor already went mad and is pretending well', 'the entity is not hostile; it simply does not notice humans', 'stopping it requires someone to understand it fully, and stay'],
  setPieces: [
    'The hallway curves upward into an endless, spiraling abyss.',
    'A cyclopean city beneath the Antarctic ice, built for beings far larger than humans.',
    'Through the telescope the stars are eyes, and they are looking back.',
    'Cultists chant in an inhuman tongue to tear open a rift.',
    'A hidden asylum room covered in fractal drawings that hurt to look at.',
    'A shadowy tentacle breaches the ocean and drags a warship under without a sound.',
    'The moon opens like an eye over the city.',
    'The fungus in the facility speaks in the voices of the scientists it consumed.'
  ]
} satisfies StoryDeck;
