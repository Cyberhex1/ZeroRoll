import type { CategoryContent } from '../types';

// Dungeons & Dragons (ohnna, 2026-11-26): the one category that plays by full 5e rules.
// Openers, tropes and media are checked by scripts/validate-content.ts.
export const dnd = {
  card: {
    name: 'Dungeons & Dragons',
    tagline: 'Full 5e Rules: Classes, Levels, Spell Slots & Dungeon Crawls',
    description: 'A classic tabletop campaign with the full 5e rules: proficiency, advantage, XP and levels, death saves. Roll a party-of-one adventure through dungeons, guild contracts and dragon country.',
    iconName: 'Swords',
    gradient: 'from-red-700/30 via-amber-900/40 to-slate-950',
    accentColor: '#dc2626',
    bgTheme: 'dungeon',
    defaultCharacter: {
      name: 'Bree Haldane',
      roleClass: 'Fighter',
      raceOrigin: 'Human',
      level: 1,
      hp: 12,
      maxHp: 12,
      armorClass: 16,
      initiativeBonus: 1,
      stats: { str: 15, dex: 12, con: 14, int: 10, wis: 13, cha: 8 },
      inventory: [
        { id: 'i1', name: 'Longsword', type: 'weapon', quantity: 1, isEquipped: true },
        { id: 'i2', name: 'Chain Mail', type: 'armor', quantity: 1, isEquipped: true },
        { id: 'i3', name: 'Potion of Healing', type: 'potion', quantity: 1 },
        { id: 'i4', name: "Dungeoneer's Pack", type: 'misc', quantity: 1 }
      ],
      spells: [],
      statusEffects: ['Well-Rested'],
      backgroundNotes: 'A sellsword who took one contract too many.'
    },
    samplePrompts: [
      'I ask the barkeep which job on the notice board pays the most.',
      'I check the dungeon door for traps before I touch it.',
      'I make a Persuasion check to get the guild clerk to raise the fee.'
    ]
  },
  profile: {
    seedSource: 'Tabletop D&D 5e campaigns, actual-play shows and CRPGs',
    pattern: {
      hero: 'A level-1 adventurer of any class with a reason to take the job.',
      start: 'The job, the rumour or the trouble that gets them moving.',
      turn: 'The job is bigger or stranger than it looked.',
      payoff: 'They face what is really behind it, and come out of it a stronger hero.'
    },
    voice: 'A good table DM: vivid and quick, fair about the rules, generous with consequences and fun NPCs. Room for combat, puzzles, talk and exploration.',
    atmosphere: 'Torchlit stone, tavern noise, wet dungeon air, guild halls, roads between kingdoms, the smell of old coin and spell smoke.',
    sceneStructure: '1. A hook the hero can act on -> 2. A place to explore -> 3. A challenge: fight, puzzle or talk -> 4. A choice about what to do next.',
    storyBeats: 'Classic campaign play: taking a job, exploring a dungeon or a city, fights that use the rules, loot, levelling up, a villain with a plan.',
    characterDynamics: 'Quest-givers with their own agenda, rival adventurers, monsters with motives, shopkeepers, guild officials, a villain worth beating.',
    encounterPatterns: 'Combat with initiative, traps and saving throws, social checks, puzzles and locks, dungeon exploration, shopping and long rests.',
    sensoryMotifs: [
      'The scrape of a door that has not opened in a century',
      'Torch smoke curling along a damp stone ceiling',
      'The weight of a coin purse after a job well paid',
      'The crackle of a spell leaving your fingers'
    ],
    avoid: 'Modern technology, rules lectures, fights with no stakes, NPCs who only hand out quests.',
    avoidKeywords: ['smartphone', 'phone', 'laptop', 'internet', 'computer', 'email', 'wifi', 'gun']
  },
  media: [
    { title: "Baldur's Gate 3", medium: 'Game' },
    { title: 'Dungeons & Dragons: Honor Among Thieves', medium: 'Film' },
    { title: 'Critical Role', medium: 'Web Series' },
    { title: 'The Legend of Vox Machina', medium: 'TV Show' },
    { title: 'Neverwinter Nights', medium: 'Game' },
    { title: 'Divinity: Original Sin 2', medium: 'Game' },
    { title: 'Dimension 20', medium: 'Web Series' },
    { title: 'The Adventure Zone', medium: 'Podcast' },
    { title: 'Planescape: Torment', medium: 'Game' },
    { title: 'Icewind Dale', medium: 'Game' },
    { title: 'Curse of Strahd', medium: 'Campaign Book' },
    { title: 'Dragonlance Chronicles', medium: 'Book Series' },
    { title: 'The Legend of Drizzt', medium: 'Book Series' },
    { title: 'Pillars of Eternity', medium: 'Game' },
    { title: 'Delicious in Dungeon', medium: 'Manga/Anime' }
  ],
  openers: [
    {
      id: 'seed_dnd_01',
      title: 'The Toll on Gallows Bridge',
      tagline: 'A troll has taken the only bridge into town, and it wants more than coin.',
      premise: 'The market town of Hollin needs the grain carts to cross Gallows Bridge before the first frost. Last night a troll moved under it, and it has started charging a toll no one can pay: one memory per crossing. The reeve has put a reward on its head and you are the only sword in town who has not already tried.',
      hero: { name: 'Corra Venn', role: 'Fighter', origin: 'Human from the river towns' },
      actions: ['Talk to the troll from the far bank before drawing a blade.', 'Ask the carters who crossed what they forgot.', 'Look under the bridge for where the troll keeps what it takes.'],
      gear: [
        { name: 'Longsword', type: 'weapon', isEquipped: true },
        { name: 'Chain Mail', type: 'armor', isEquipped: true },
        { name: 'Shield', type: 'armor', isEquipped: true },
        { name: 'Potion of Healing', type: 'potion' }
      ],
      spells: [],
      hp: 12
    },
    {
      id: 'seed_dnd_02',
      title: 'A Lich in the Library',
      tagline: 'The college archive has a new reader who never leaves after dark.',
      premise: 'You are a first-year wizard at the Collegium of Brask, shelving books in the restricted stacks to pay your tuition. For a week, someone has been reading the forbidden catalogue at night, and this morning a librarian was found asleep and will not wake. The masters want it kept quiet. Your key fits the stacks.',
      hero: { name: 'Pell Okonkwo', role: 'Wizard', origin: 'Rock Gnome' },
      actions: ['Hide in the stacks after closing and watch who comes.', 'Search the catalogue for which books were taken out.', "Visit the sleeping librarian's room and look for a mark."],
      gear: [
        { name: 'Quarterstaff', type: 'weapon', isEquipped: true },
        { name: 'Spellbook', type: 'relic' },
        { name: 'Component Pouch', type: 'misc' },
        { name: 'Key to the Restricted Stacks', type: 'misc' }
      ],
      spells: ['Fire Bolt', 'Mage Hand', 'Detect Magic', 'Sleep'],
      hp: 7
    },
    {
      id: 'seed_dnd_03',
      title: 'Six Doors Under Dunmarrow',
      tagline: 'A dwarven vault opens once a generation, and this year the guild sent you.',
      premise: "The vault under Dunmarrow Hill opens for one night every thirty years, and the Lantern Guild has paid for you to be first through its doors. The map shows six rooms and a treasury. The last guild crew went in thirty years ago and none of them came out. Their names are still chalked on the entrance.",
      hero: { name: 'Ysolt Brannagh', role: 'Rogue', origin: 'Lightfoot Halfling' },
      actions: ["Read the chalked names and the notes beside them.", 'Check the first door for traps.', "Ask the guild's dwarf guide what the map leaves out."],
      gear: [
        { name: 'Shortsword', type: 'weapon', isEquipped: true },
        { name: 'Leather Armor', type: 'armor', isEquipped: true },
        { name: "Thieves' Tools", type: 'misc' },
        { name: 'Guild Map of the Vault', type: 'scroll' }
      ],
      spells: [],
      hp: 9
    },
    {
      id: 'seed_dnd_04',
      title: 'Oathbreaker Weather',
      tagline: 'The storms over the old temple started the day its paladin order broke.',
      premise: 'You are the last squire of an order of paladins that broke apart over a lie no one will name. Since that day, storms have circled the temple on the hill and the farms below are drowning. The abbot thinks the order\'s broken oath is calling the weather, and the only person who might know what it was is your old knight, who now drinks in the town below.',
      hero: { name: 'Tamsin Achterberg', role: 'Paladin of Devotion', origin: 'Human from the hill farms' },
      actions: ['Go down to the tavern and find your old knight.', 'Climb to the temple and read the broken oath stone.', 'Ask the abbot what he is not telling you.'],
      gear: [
        { name: 'Warhammer', type: 'weapon', isEquipped: true },
        { name: 'Chain Mail', type: 'armor', isEquipped: true },
        { name: 'Shield with the Order\'s Sun', type: 'armor', isEquipped: true },
        { name: 'Holy Symbol', type: 'relic' }
      ],
      spells: ['Bless', 'Cure Wounds'],
      hp: 12
    },
    {
      id: 'seed_dnd_05',
      title: 'Contract for a Small Dragon',
      tagline: 'The adventurers\' guild says it is a small dragon. It is never a small dragon.',
      premise: 'The notice says: young dragon, nesting in a silver mine, 200 gold. The mine owner says it is barely bigger than a horse. The guild clerk says it is a two-person job but you are the only one who signed. The miners on strike outside the gate say there is no dragon at all, and the owner is lying about why the mine shut.',
      hero: { name: 'Odile Marchetti', role: 'Ranger', origin: 'Half-Elf of the borderlands' },
      actions: ['Talk to the striking miners at the gate.', 'Track whatever left the marks at the mine entrance.', 'Ask the owner to show you the dragon himself.'],
      gear: [
        { name: 'Longbow and Arrows', type: 'weapon', isEquipped: true },
        { name: 'Scale Mail', type: 'armor', isEquipped: true },
        { name: 'Guild Contract', type: 'scroll' },
        { name: "Explorer's Pack", type: 'misc' }
      ],
      spells: [],
      hp: 11
    },
    {
      id: 'seed_dnd_06',
      title: 'The Bard Who Owed Everyone',
      tagline: 'You have three debts, two days and one very bad idea.',
      premise: 'You owe a thieves\' guild, a church and a hag, and all three want paying by the end of the harvest fair. Your only asset is a song that a duke would pay a fortune to keep secret. The fair opens tomorrow in the city of Varn, the duke is the guest of honour, and your hag creditor has just taken a room across the hall.',
      hero: { name: 'Rafe Duquesne', role: 'Bard of the College of Lore', origin: 'Tiefling from the city of Varn' },
      actions: ['Knock on the hag\'s door and try to talk your way into more time.', 'Find out where the duke will be staying.', 'Visit the thieves\' guild and offer them a cut.'],
      gear: [
        { name: 'Rapier', type: 'weapon', isEquipped: true },
        { name: 'Leather Armor', type: 'armor', isEquipped: true },
        { name: 'Lute', type: 'misc' },
        { name: 'Ledger of Debts', type: 'scroll' }
      ],
      spells: ['Vicious Mockery', 'Charm Person', 'Healing Word'],
      hp: 9
    },
    {
      id: 'seed_dnd_07',
      title: 'Goblins at the Wedding',
      tagline: 'Your cousin\'s wedding feast was going well until the goblins brought a gift.',
      premise: "Your cousin is marrying into the richest family in Elmstead, and you came home from the road to dance at the wedding. Halfway through the feast, a goblin delegation walks in under a white flag carrying a wrapped gift and asks for the bride's father by name. He goes very pale. Everyone looks at you, the only one wearing a sword.",
      hero: { name: 'Hamid Rourke', role: 'Barbarian', origin: 'Half-Orc raised in Elmstead' },
      actions: ['Step between the goblins and the guests and ask what they want.', "Watch the bride's father to see what he does.", 'Open the gift.'],
      gear: [
        { name: 'Greataxe', type: 'weapon', isEquipped: true },
        { name: 'Handaxe', type: 'weapon' },
        { name: 'Good Wedding Clothes', type: 'misc' },
        { name: 'Potion of Healing', type: 'potion' }
      ],
      spells: [],
      hp: 14
    },
    {
      id: 'seed_dnd_08',
      title: 'Feywild Lease Agreement',
      tagline: 'Your patron rented your soul to someone else for a week.',
      premise: 'Your warlock patron, an archfey with a fondness for paperwork, has sublet your pact to a stranger for seven days. You still have your powers, but every spell you cast now pays someone else. The stranger has left a calling card at your inn: a dried rose and an address in the Feywild, valid until midnight.',
      hero: { name: 'Nimue Achebe', role: 'Warlock of the Archfey', origin: 'Wood Elf' },
      actions: ['Follow the address on the calling card.', 'Try to reach your patron and complain.', 'Cast a spell and feel where the power goes.'],
      gear: [
        { name: 'Light Crossbow', type: 'weapon', isEquipped: true },
        { name: 'Leather Armor', type: 'armor', isEquipped: true },
        { name: 'Arcane Focus (Rose Briar Wand)', type: 'relic' },
        { name: 'Calling Card with a Dried Rose', type: 'misc' }
      ],
      spells: ['Eldritch Blast', 'Minor Illusion', 'Hex'],
      hp: 9
    },
    {
      id: 'seed_dnd_09',
      title: 'Sermon for the Drowned',
      tagline: 'The fishing village wants a cleric. The things in the bay want one too.',
      premise: 'Your temple has sent you to Sallow Point, a fishing village whose last priest walked into the sea. On your first night, the villagers bring you a drowned boy to bury and you notice his hands are still warm. By morning the boats will not go out, because something in the bay has started singing hymns from your own prayer book.',
      hero: { name: 'Brother Ignatius Pell', role: 'Cleric of the Tempest', origin: 'Human from an inland city' },
      actions: ['Examine the drowned boy before the burial.', 'Go down to the shore and listen to the singing.', "Search the last priest's house for his journal."],
      gear: [
        { name: 'Mace', type: 'weapon', isEquipped: true },
        { name: 'Scale Mail', type: 'armor', isEquipped: true },
        { name: 'Prayer Book', type: 'relic' },
        { name: 'Holy Water', type: 'potion' }
      ],
      spells: ['Sacred Flame', 'Guidance', 'Thunderwave', 'Cure Wounds'],
      hp: 10
    },
    {
      id: 'seed_dnd_10',
      title: 'Monks of the Last Bell',
      tagline: 'The monastery bell has rung on its own for the first time in four hundred years.',
      premise: 'You were raised by the monks of the Last Bell, a monastery built around a bell that is only supposed to ring at the end of the world. This morning, during meditation, it rang once. The abbess has sent you down the mountain to find out what woke it, with one silver piece, a letter of introduction and orders to be back before it rings twice.',
      hero: { name: 'Sun-Li Harrow', role: 'Monk of the Open Hand', origin: 'Human raised in a mountain monastery' },
      actions: ['Ask the abbess what the old texts say about the bell.', 'Climb the bell tower and look for anything out of place.', 'Start down the mountain road toward the nearest town.'],
      gear: [
        { name: 'Quarterstaff', type: 'weapon', isEquipped: true },
        { name: 'Darts', type: 'weapon', quantity: 10 },
        { name: 'Letter of Introduction', type: 'scroll' },
        { name: 'One Silver Piece', type: 'misc' }
      ],
      spells: [],
      hp: 9
    }
  ],
  tropes: [
    { premise: 'A job on the guild board looks too easy for the money it pays.', conflict: 'The employer is hiding why the last crew never came back.' },
    { premise: 'A dungeon has opened under a town that does not want to admit it.', conflict: 'The town council profits from what is coming out of it.' },
    { premise: 'A dragon wants to hire an adventurer instead of eating them.', conflict: 'The job is to steal from the only people who were kind to the hero.' },
    { premise: 'Rival adventurers are after the same treasure.', conflict: 'One of them is the hero\'s old partner, who left them for dead.' },
    { premise: 'A wizard\'s tower has gone silent and its apprentices are missing.', conflict: 'The wizard is still inside and does not want to be found.' },
    { premise: 'A cursed item will not leave the hero\'s hand.', conflict: 'Getting rid of it means handing it to someone worse.' },
    { premise: 'A border fort has stopped sending reports.', conflict: 'The soldiers inside have made a deal with what they were guarding against.' },
    { premise: 'A heist on a noble\'s vault during a masked ball.', conflict: 'The noble knows it is coming and has hired adventurers too.' }
  ],
  procedural: {
    titles: ['The Job on the Guild Board', 'Under the Old Keep', 'The Dragon\'s Invoice', 'A Map With One Room Missing', 'The Bell and the Barrow', 'Silver in the Mine'],
    firstNames: ['Corra', 'Pell', 'Ysolt', 'Tamsin', 'Odile', 'Rafe', 'Hamid', 'Nimue', 'Ignatius', 'Sun-Li', 'Bryn', 'Dagny'],
    lastNames: ['Venn', 'Okonkwo', 'Brannagh', 'Achterberg', 'Marchetti', 'Duquesne', 'Rourke', 'Achebe', 'Harrow', 'Thistlewaite'],
    roles: ['Fighter', 'Rogue', 'Wizard', 'Cleric', 'Ranger', 'Bard', 'Barbarian', 'Paladin', 'Warlock', 'Sorcerer', 'Druid', 'Monk'],
    origins: ['Human', 'Hill Dwarf', 'Wood Elf', 'Lightfoot Halfling', 'Tiefling', 'Half-Orc', 'Rock Gnome', 'Dragonborn'],
    physicalTraits: [
      'Broad-shouldered, with a broken nose that healed crooked and a travel-stained cloak.',
      'Slight and quick, with ink-stained fingers and a satchel that clinks when they walk.',
      'Tall, with a shaved head, a holy symbol on a cord and calm grey eyes.'
    ],
    hooks: [
      {
        hook: 'The notice on the guild board is two days old and nobody has taken it: clear the old mill cellar of whatever has been eating the grain, 50 gold. The miller is waiting outside, wringing his hat.',
        actions: ['Take the job and ask the miller what he has seen.', 'Ask the guild clerk why nobody wanted it.', 'Go straight to the mill and listen at the cellar door.'],
        gear: [
          { name: 'Longsword', type: 'weapon', isEquipped: true },
          { name: 'Leather Armor', type: 'armor', isEquipped: true },
          { name: 'Potion of Healing', type: 'potion' }
        ],
        spells: [],
        hp: 11
      }
    ]
  },
  starterInventory: [
    { name: 'Longsword', type: 'weapon', quantity: 1, isEquipped: true },
    { name: 'Leather Armor', type: 'armor', quantity: 1, isEquipped: true },
    { name: 'Potion of Healing', type: 'potion', quantity: 1 },
    { name: "Explorer's Pack", type: 'misc', quantity: 1 },
    { name: 'Pouch of 10 Gold Pieces', type: 'misc', quantity: 1 }
  ],
  ambient: [
    'Somewhere below, water drips onto stone in a slow, patient rhythm.',
    'A torch sputters in its bracket and the shadows lean toward you.',
    'Far off, something heavy is dragged across a floor, then stops.',
    'The tavern door bangs open and a gust of cold air carries in the smell of rain.'
  ]
} satisfies CategoryContent;
