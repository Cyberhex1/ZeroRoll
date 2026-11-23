import type { StoryDeck } from '../types';

export const ancient_greek = {
  signature: 'Mortals under the eyes of gods who are vain, generous and cruel; hospitality, oaths and pride decide fates; heroes win by wit as often as by spear. Epic cadence, concrete bronze-age detail.',
  engines: ['journey', 'siege', 'contest', 'trial', 'hunt', 'bargain', 'rescue', 'homecoming', 'escape', 'masquerade'],
  families: [
    { id: 'voyage', name: 'The long voyage home', hero: 'someone trying to get back to people who need them: a ship\'s cook, a captured priestess, an oarsman, a wife sailing to find her husband', start: 'a harbor, a shipwreck shore, or a feast on a strange island', turn: 'a god\'s grudge or the crew\'s greed wrecks the way home', payoff: 'arriving home in disguise and winning it back', palette: 'wine-dark sea, salt-white islands, oars and bronze, guest-gifts, smoke from an altar, a loom unpicked at night', sources: ['odyssey', 'circe', 'jason'] },
    { id: 'war', name: 'War at the walls', hero: 'someone small in a great war: a shield-bearer, a healer, a captive weaver, a herald, a charioteer', start: 'the camp or the city before a battle, with a god or a prophecy watching', turn: 'pride (theirs or a king\'s) costs a life they loved', payoff: 'a choice between glory and the people they love', palette: 'campfires on the plain, horsehair crests, funeral pyres, the walls of the city, a ransom of gold for a body', sources: ['iliad', 'song_achilles', 'troy', '300'] },
    { id: 'labyrinth', name: 'Monsters and labors', hero: 'someone sent to do the impossible: a tribute youth, a temple thief, a shepherd chosen by lot, a demigod who does not know it', start: 'the moment the task is given, by a king, a god or a lottery', turn: 'the monster turns out to be someone\'s child, curse or prisoner', payoff: 'the labor done in a way the gods did not expect', palette: 'torchlit corridors, bull-leapers, a thread, painted pottery, a hero\'s tomb, a lion skin', sources: ['hades', 'jason', 'percy', 'clash_titans', 'hercules'] },
    { id: 'olympus', name: 'Feuds of the gods', hero: 'a mortal caught between two gods: a priestess, a sculptor, a gladiator in Roman Greece, an oracle\'s attendant', start: 'a festival, a temple, a contest judged by the gods', turn: 'a god\'s favor makes the hero a target of another god', payoff: 'outwitting the gods, or bargaining them into peace', palette: 'temple smoke, laurel, owls and eagles, a golden apple, lightning on marble, a mortal\'s small house shrine', sources: ['blood_zeus', 'god_of_war_greek', 'immortals', 'spartacus'] }
  ],
  dna: [
    { id: 'odyssey', title: 'The Odyssey', medium: 'Epic Poem', dna: 'A long way home told in episodes; each island tests a different virtue (hospitality, temptation, curiosity, pride); cunning beats strength; the hero\'s pride costs his crew; the homecoming is in disguise and must be earned.' },
    { id: 'iliad', title: 'The Iliad', medium: 'Epic Poem', dna: 'A war seen through one quarrel over honor; gods take sides like gamblers; both sides are human; grief, not victory, is the climax, and a ransom for a body ends it.' },
    { id: 'circe', title: 'Circe', medium: 'Book', dna: 'A minor goddess exiled to an island learns witchcraft through patience and work; visitors arrive one by one, each a test; she chooses mortality and love over divine cruelty.' },
    { id: 'song_achilles', title: 'The Song of Achilles', medium: 'Book', dna: 'A quiet companion\'s view of a great hero; tenderness inside a war machine; prophecy known early and walked toward anyway.' },
    { id: 'hades', title: 'Hades', medium: 'Game', dna: 'Escaping the underworld again and again; each attempt meets gods who give gifts with strings; family drama among immortals; the real goal is reconciliation.' },
    { id: 'jason', title: 'Jason and the Argonauts (1963)', medium: 'Film', dna: 'A crew of specialists on an impossible quest; each stop a monster set-piece (a bronze giant, harpies, skeletons from dragon teeth); a princess\'s help, and a price paid later.' },
    { id: 'percy', title: 'Percy Jackson and the Olympians', medium: 'Books/TV', dna: 'A modern kid learns they are half-god; a quest with friends across a country of disguised monsters; prophecy as riddle; humor and loyalty.' },
    { id: '300', title: '300', medium: 'Film/Comic', dna: 'A tiny force holds a narrow pass against an empire; ritual, discipline and sacrifice; the story told as legend, larger than life.' },
    { id: 'troy', title: 'Troy (2004)', medium: 'Film', dna: 'A stolen queen starts a war of kings; a great warrior who fights for his name, a prince who fights for his city, and a wooden horse.' },
    { id: 'clash_titans', title: 'Clash of the Titans (1981/2010)', medium: 'Film', dna: 'A demigod hunts the Gorgon\'s head to stop a sea monster; a mechanical owl, witches sharing one eye, and gods playing with clay figures.' },
    { id: 'hercules', title: 'Hercules (Disney)', medium: 'Film', dna: 'A strong, awkward hero tries to earn his place among the gods through labors; a fast-talking villain from the underworld; a cynical love interest with a deal of her own.' },
    { id: 'blood_zeus', title: 'Blood of Zeus', medium: 'Netflix', dna: 'An outcast son of Zeus fights demons born from a fallen giant\'s blood; Hera\'s jealousy drives the war; family betrayal among gods and men.' },
    { id: 'god_of_war_greek', title: 'God of War (Original Trilogy)', medium: 'Games', dna: 'A Spartan tricked into killing his family takes revenge on the whole of Olympus; titanic set-pieces; rage that destroys the world it wants to save.' },
    { id: 'immortals', title: 'Immortals (2011)', medium: 'Film', dna: 'A peasant chosen by Zeus must stop a mad king from freeing the Titans; a bow of power, an oracle in hiding, and gods forbidden to interfere.' },
    { id: 'spartacus', title: 'Spartacus', medium: 'TV Show', dna: 'A betrayed soldier becomes a gladiator in a ludus of intrigue, then leads a slave revolt against Rome; blood, politics and brotherhood.' },
    { id: 'ac_odyssey', title: "Assassin's Creed Odyssey", medium: 'Game', dna: 'A mercenary from Sparta is drawn into the Peloponnesian War while hunting a masked cult; a family scattered by a prophecy; choices that make you hero or monster.' }
  ],
  hooks: [
    'a beggar at the hero\'s door asks for guest-right and carries a sword with a king\'s mark',
    'the oracle refuses to answer the hero\'s question and answers a different one, about the hero\'s mother',
    'the lot for the tribute ship falls on the hero\'s younger brother, and the hero has one night',
    'a ship arrives in the harbor with all its rowers asleep and its captain begging to be hidden from a god',
    'an old shepherd swears the hero is the child of a god, and the god is coming to collect',
    'a golden apple rolls to a stop at the hero\'s feet during the festival, inscribed "for the fairest"',
    'the hero\'s loom unravels each night by itself, and the suitors downstairs grow impatient',
    'a bronze giant walks out of the sea and sits down on the beach to wait'
  ],
  places: ['an island whose shepherd is a one-eyed giant who keeps a perfect garden', 'a temple of Asclepius where the sick sleep among snakes to dream their cure', 'a bronze foundry on the slope of a volcano', 'the narrow pass above a burning plain', 'a palace labyrinth where the bull-dancers train', 'the bank of the river Styx, where the ferryman keeps accounts in coins'],
  complications: ['the god helping the hero is the one who cursed them', 'the monster is keeping a promise to the hero\'s ancestor', 'the king who set the task wants the hero to fail', 'the prophecy came true already, in a way no one noticed'],
  setPieces: [
    'A tempest from Poseidon shatters the ship and washes you ashore on an island ruled by an enchantress.',
    'The siren song drifts across the sea, and you lash yourself to the mast.',
    'A shade in the underworld offers a vital truth for a drop of sacrificial blood.',
    'You face the Gorgon in a ruined temple, watching her only in the reflection of your shield.',
    'You hold the narrow pass with a handful of hoplites as the enemy fills the plain.',
    'The Minotaur roars through the twisting, bloodstained corridors of the Labyrinth.',
    'You steal the Golden Fleece from a grove guarded by a sleepless dragon.',
    'The gods descend onto the battlefield and Ares\' chariot of fire turns the tide.'
  ]
} satisfies StoryDeck;
