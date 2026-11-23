import type { StoryDeck } from '../types';

export const psychedelic_trip = {
  signature: 'Inner journeys made physical: synesthesia, shifting rules, entities that speak in images, and a real-life worry at the center. It is a trip with a heart: the hero comes back with something learned. Never instructions for real drug use.',
  engines: ['journey', 'mystery', 'trial', 'rescue', 'bargain', 'escape', 'homecoming', 'delivery'],
  families: [
    { id: 'ego', name: 'Ego death and rebirth', hero: 'someone carrying something heavy: grief, a breakup, burnout, a big decision', start: 'a real place (an apartment, a festival, a desert campsite, a museum) as the world starts to shift', turn: 'the trip turns hard and shows the thing they avoided', payoff: 'coming back with clarity, a letting go, a call to make', palette: 'breathing walls, fractals, music with color, a mirror that disagrees, a doorway in a doorway', sources: ['ego_death', 'enter_void', 'waiting_room'] },
    { id: 'entities', name: 'The machine elves', hero: 'a curious, skeptical person: a programmer, a jazz drummer, a philosophy student, a sound engineer', start: 'a breakthrough into a geometric place full of beings who were expecting them', turn: 'the beings ask for something, or show the hero a version of their life they did not choose', payoff: 'a gift brought back across, if the hero can carry it', palette: 'jeweled self-dribbling basketballs, the grid, clockwork, impossible languages, laughter that has a shape', sources: ['machine_elves', 'grid_entities', 'geometric_nexus'] },
    { id: 'simulation', name: 'The veil of the simulation', hero: 'someone who notices a glitch: a commuter, a night-shift coder, a stage actor, a mapmaker', start: 'an ordinary day with one rendering error', turn: 'the glitch spreads and the hero is offered a choice of realities', payoff: 'choosing what is real, and who to bring', palette: 'déjà vu, falling code, a black cat twice, mirrors that lag, a phone booth ringing, a white rabbit tattoo', sources: ['matrix', 'zipper', 'akashic'] },
    { id: 'gonzo', name: 'Gonzo road trip', hero: 'a journalist, a musician on tour, two best friends, a bachelor party survivor', start: 'a road trip with a mission (a story, a race, a wedding) and a trunk full of trouble', turn: 'the mission collides with the hallucinations and someone real gets hurt', payoff: 'the story gets written, and the friendship survives', palette: 'convertibles, neon casinos, lizard-people at the bar, desert heat, a typewriter, a hotel carpet that moves', sources: ['fear_loathing', 'doctor_strange'] },
    { id: 'plant', name: 'The plant teacher', hero: 'someone seeking healing: a veteran, a mother, an addict in recovery, a grieving son', start: 'a ceremony, a retreat or a jungle hut with a guide', turn: 'the teacher shows them a memory that changes its meaning', payoff: 'forgiveness, given or received', palette: 'jungle sounds, icaros, serpents of light, a grandmother\'s face, mycelium, a river of colors', sources: ['plant_teacher', 'chrysanthemum', 'white_light'] }
  ],
  dna: [
    { id: 'space_odyssey', title: '2001: A Space Odyssey', medium: 'Film', dna: 'A monolith marks each leap of consciousness; a calm, lying computer; a journey through a star-gate ending in a white room and rebirth.' },
    { id: 'enter_void', title: 'Enter the Void', medium: 'Film', dna: 'A young man dies in a Tokyo club and his spirit drifts over the city, through memories and into strangers\' lives, looking for a way back to his sister.' },
    { id: 'fear_loathing', title: 'Fear and Loathing in Las Vegas', medium: 'Film/Book', dna: 'A journalist and his lawyer chase a story through Vegas on a trunk of substances; satire of the American dream; paranoia as comedy.' },
    { id: 'doctor_strange', title: 'Doctor Strange (MCU)', medium: 'Film', dna: 'An arrogant surgeon loses his hands and learns sorcery; folding cities, the mirror dimension, a bargain with a being outside time made by looping one moment forever.' },
    { id: 'matrix', title: 'The Matrix', medium: 'Film', dna: 'A hacker learns the world is a simulation; a red pill or a blue pill; rules that can be bent once you believe it.' },
    { id: 'machine_elves', title: '"Meeting the Machine Elves"', medium: 'Erowid DMT Vault', dna: 'A breakthrough into a bright, ornamented space where small busy entities greet you like an old friend and show you objects that cannot exist.' },
    { id: 'geometric_nexus', title: '"The Geometric Nexus"', medium: 'Erowid Salvia Vault', dna: 'Reality folds into a lattice of planes; the self becomes a part of the structure; time and identity are surfaces to be peeled.' },
    { id: 'ego_death', title: '"Complete Ego Death and Rebirth"', medium: 'Erowid LSD Vault', dna: 'The self dissolves slowly, piece by piece, until there is only awareness; then the person is rebuilt, and the small things of their life feel new.' },
    { id: 'chrysanthemum', title: '"The Chrysanthemum Pattern"', medium: 'Erowid Psilocybin Vault', dna: 'An endless blooming pattern pulls the mind inward; each petal a memory; the center is a feeling the person has not let themselves feel.' },
    { id: 'plant_teacher', title: '"Conversations with the Plant Teacher"', medium: 'Erowid Ayahuasca Vault', dna: 'A ceremony where a patient, stern presence shows the person their life from outside; purging, then gentleness and a task.' },
    { id: 'waiting_room', title: '"The Cosmic Waiting Room"', medium: 'Erowid DMT Vault', dna: 'A pastel, sterile place where souls wait to be assigned a life; a receptionist-like being with endless patience; the choice of a next life.' },
    { id: 'white_light', title: '"Dissolution into the White Light"', medium: 'Erowid 5-MeO-DMT Vault', dna: 'Everything goes white and there is no one there to see it; returning is like being born, with tears.' },
    { id: 'zipper', title: '"The Zipper Unzipping Reality"', medium: 'Erowid Salvia Vault', dna: 'The world is a fabric that unzips; behind it, beings who have been holding it together the whole time look up, surprised.' },
    { id: 'grid_entities', title: '"The Grid and the Entities"', medium: 'Erowid DMT Vault', dna: 'A grid underlying everything, maintained by entities who do not want to be seen; they notice you, and want to know why you are here.' },
    { id: 'akashic', title: '"A Glimpse into the Akashic Records"', medium: 'Erowid Psilocybin Vault', dna: 'A library of every thought ever thought, as glowing orbs; finding your own; reading one you did not expect.' }
  ],
  hooks: [
    'the hero\'s late brother\'s voicemail plays a new message, and the colors in the room change with every word',
    'the museum guard tells the hero the painting they are looking at has been waiting for them, and steps inside it',
    'the hero\'s reflection in the festival porta-potty mirror raises a different hand',
    'a small, bright entity asks the hero to help it carry a word back to the other side',
    'the ceremony guide hands the hero a cup and says, "Your grandmother already drank hers"',
    'every clock in the apartment shows a different time, and each one is a day the hero regrets',
    'the hero\'s phone autocorrects every message into the same sentence: "come and see"',
    'the desert campsite\'s fire starts to burn downward, opening a staircase'
  ],
  places: ['a museum where the paintings breathe after closing', 'a festival field at 4 AM under a sky of moving geometry', 'a laundromat where each machine spins a different memory', 'a waiting room the color of a pastel sunrise', 'a jungle hut where the walls are made of sound', 'a highway diner where the menu changes as you read it'],
  complications: ['the entity guiding the hero is part of the hero', 'the memory the hero is avoiding is a happy one', 'someone in the real world is trying to reach the hero right now', 'coming back means giving up a gift'],
  setPieces: [
    'A towering entity of folding light asks you a question in a language you can taste.',
    'The wind becomes indigo and shatters into glass fractals.',
    'Reality unzips and reveals the grid, maintained by clockwork elves.',
    'You live your past, present and future in a single crystalline moment.',
    'A plant intelligence speaks by placing memories directly into your mind.',
    'A jester of impossible colors mocks the rules of gravity.',
    'The room folds inward like origami, revealing an alien landscape outside.',
    'A library of every thought ever conceived, each a glowing orb.'
  ]
} satisfies StoryDeck;
