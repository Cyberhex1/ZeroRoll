import type { StoryDeck } from '../types';

export const cozy_ghibli = {
  signature: 'Gentle wonder: work done with the hands, food, weather and small spirits. Problems are solved with kindness, patience and craft. Nobody is a villain, only lost, lonely or tired; no betrayal, no gore.',
  engines: ['journey', 'mystery', 'rescue', 'contest', 'inheritance', 'homecoming', 'courtship', 'delivery', 'siege'],
  families: [
    { id: 'newshop', name: 'A new shop in a strange town', hero: 'someone starting something small: a delivery witch, a teashop keeper, a lamp-mender, a bicycle courier', start: 'arriving, the first customers, a neighbor who is not quite human', turn: 'a spirit or friend needs help, and the town\'s festival depends on it', payoff: 'the place becomes home because of what the hero gave', palette: 'steam and flour, rooftops, a broom or a bicycle, rain on tin, a shop bell, chalkboard menus', sources: ['kiki', 'stardew', 'cozy_grove'] },
    { id: 'spirits', name: 'The spirit world next door', hero: 'a child or young person who can see the spirits others cannot', start: 'a move, a summer, a grandparent\'s house, a path through the woods', turn: 'a spirit is lost, ill or upset, and the boundary between worlds wobbles', payoff: 'a spirit helped home, and a friendship that lasts', palette: 'camphor trees, bus stops in the rain, acorns, lanterns, soot sprites, an overgrown shrine', sources: ['totoro', 'spirited_away', 'hilda'] },
    { id: 'voyage', name: 'A gentle voyage', hero: 'someone carrying something (souls, letters, seeds, a sleeping friend) somewhere far', start: 'loading the boat, the cart or the walking house', turn: 'a passenger\'s wish or a storm changes the route', payoff: 'letting go of something, and arriving changed', palette: 'boat decks, maps with doodles, cooking for passengers, fireflies, ropes and lanterns, a sky full of whales', sources: ['spiritfarer', 'howl', 'over_garden_wall', 'journey_game'] },
    { id: 'restore', name: 'Bringing a place back', hero: 'someone who inherits or finds a neglected place: a farm, a garden, an island, a library', start: 'the first morning, weeds, a broken tool, a curious creature', turn: 'the place\'s old guardian is fading, or a season threatens the work', payoff: 'the community and the guardian return, one small task at a time', palette: 'seed packets, watering cans, moss on stone, a creaking windmill, a festival calendar', sources: ['stardew', 'short_hike', 'tea_dragon'] }
  ],
  dna: [
    { id: 'kiki', title: "Kiki's Delivery Service", medium: 'Film', dna: 'A young witch moves to a seaside town alone to start a delivery business; homesickness, the first customers, losing her magic to burnout and finding it through friends.' },
    { id: 'stardew', title: 'Stardew Valley', medium: 'Game', dna: 'Leaving a gray office for an overgrown family farm; seasons, festivals, neighbors with quiet troubles; a community center restored one bundle at a time.' },
    { id: 'totoro', title: 'My Neighbor Totoro', medium: 'Film', dna: 'Two sisters move to the country while their mother is ill; enormous gentle spirits appear at bus stops and in trees; worry is real but wonder is bigger.' },
    { id: 'spirited_away', title: 'Spirited Away', medium: 'Film', dna: 'A child stranded in a bathhouse for spirits must work to save her parents; names are power, greed changes people; every strange guest has a sad story.' },
    { id: 'spiritfarer', title: 'Spiritfarer', medium: 'Game', dna: 'A ferry-master for the dead builds a boat into a home for spirit passengers, cooks their favorite meals, hears their stories, and finally delivers each one to rest.' },
    { id: 'howl', title: "Howl's Moving Castle", medium: 'Film', dna: 'A young woman cursed to be old finds freedom working in a wizard\'s walking castle; a fire demon with a contract, a door to four places, a war everyone pretends is far away.' },
    { id: 'over_garden_wall', title: 'Over the Garden Wall', medium: 'Mini-series', dna: 'Two half-brothers lost in a strange autumn forest; each episode a new village with odd customs; folk songs, gentle humor and a shadow they must not give in to.' },
    { id: 'hilda', title: 'Hilda', medium: 'TV Show', dna: 'A fearless girl befriends trolls, elves and giants around her city; she solves creatures\' problems with curiosity; the city learns to share with the wild.' },
    { id: 'short_hike', title: 'A Short Hike', medium: 'Game', dna: 'A bird kid climbs a mountain to get phone signal; tiny encounters with hikers and fishers; side quests that are just kindness; the summit is a call home.' },
    { id: 'tea_dragon', title: 'The Tea Dragon Society', medium: 'Graphic Novel', dna: 'A blacksmith\'s apprentice learns to care for tiny dragons whose leaves hold memories; craft, patience, and old friendships remembered through tea.' },
    { id: 'cozy_grove', title: 'Cozy Grove', medium: 'Game', dna: 'A camper on a haunted island helps sad bear-ghosts remember their lives, one daily task at a time, and color returns to the island as they heal.' },
    { id: 'journey_game', title: 'Journey', medium: 'Game', dna: 'A wordless pilgrimage across sand toward a distant mountain; a silent companion met by chance; flight, cold, and arrival.' }
  ],
  hooks: [
    'the hero\'s first delivery is a pie addressed to "whoever lives in the old water tower", and the tower answers',
    'a moss spirit falls asleep in the hero\'s teapot and will not leave until it hears a story it has never heard',
    'the retiring lighthouse keeper leaves the hero the keys and a list of ships that only come at dusk',
    'the festival lanterns light themselves one by one, except for the hero\'s',
    'a very small dragon is found sleeping in the bread oven, and it has a fever',
    'the hero\'s grandmother\'s garden gate opens onto a different season than the street',
    'a letter arrives addressed to the hero\'s house from someone who lived there a hundred years ago',
    'the town\'s weather spirit loses its umbrella and it starts to rain only on the hero'
  ],
  places: ['a bakery on a ferry that crosses a lake of clouds', 'a hillside town where every roof is a garden', 'a bathhouse for tired weather spirits', 'a train that stops at a different village each morning', 'a lending library in a hollow oak, run by owls', 'a market that opens only when the fog comes in'],
  complications: ['the grumpy neighbor is the one who has been leaving gifts', 'the spirit\'s home was lost when the hero\'s family built their house', 'the festival is the last one before a friend moves away', 'the shy creature everyone fears is guarding a nest'],
  setPieces: [
    'A giant, sleepy forest guardian blocks the road and politely asks you for a cup of tea.',
    'The flying bakery airship hums as you pull a tray of star-flour pastries from the oven.',
    'The whole town gathers on the rooftops to watch the cloud whales migrate.',
    'A storm makes every spirit in the valley shelter in your shop at once.',
    'Soot sprites help you carry coal to the furnace of the spirit bathhouse.',
    'The Lantern Festival floats rise on a breeze, carrying everyone\'s wishes.',
    'You trade honey-cakes with a wandering frog-merchant for a seed that grows into a house.',
    'A wind spirit steals your hat and leads you through a field of sunflowers.'
  ]
} satisfies StoryDeck;
