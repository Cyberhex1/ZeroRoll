import type { StoryDeck } from '../types';

export const zombie = {
  signature: 'The dead rise and the living are the real test: groups under pressure, impossible choices, and small mercies. Start before or at the very first hours of the outbreak, with people the hero loves within reach.',
  engines: ['survival', 'siege', 'escape', 'rescue', 'journey', 'delivery', 'mystery', 'homecoming'],
  families: [
    { id: 'day_one', name: 'Day one', hero: 'an ordinary person on the day it starts: a nurse, a radio host, a delivery driver, a high-school teacher, a bus driver', start: 'a normal shift, with odd calls, a sick coworker or a city that hasn\'t noticed yet', turn: 'the outbreak breaks on screen and the places they rely on fall one by one', payoff: 'getting their people somewhere safe, at a real cost', palette: 'sirens far off, a phone that won\'t connect, a TV left on, blood on a vending machine, a bus full of kids', sources: ['28_days', 'dawn_dead', 'train_busan', 'black_summer'] },
    { id: 'group', name: 'The group', hero: 'someone in a band of survivors: the medic, the scavenger, the one who knows engines, the new arrival', start: 'a camp, a farmhouse or a prison yard with its own rules', turn: 'another group, a hidden bite or a vote splits them', payoff: 'deciding what kind of people they will be', palette: 'campfires, a whiteboard of names, barbed wire, a garden, a walkie-talkie, a grave marker made from a sign', sources: ['walking_dead', 'state_decay', 'world_war_z'] },
    { id: 'escort', name: 'The escort', hero: 'someone responsible for one other person: a smuggler, a father, a teacher, an older sibling', start: 'the job or the promise: get this person across the country', turn: 'the person they protect is more important (or more dangerous) than they knew', payoff: 'a final choice between the one and the many', palette: 'overgrown cities, giraffes in the ruins, a guitar, a backpack, spores in the air, a photo of who they lost', sources: ['last_of_us', 'girl_gifts', 'days_gone'] },
    { id: 'comedy', name: 'Undead comedy', hero: 'a slacker, a mall employee, a rule-following nerd, a reality-TV contestant', start: 'a hangover, a shift, a road trip, a sale day', turn: 'the jokes stop when someone they love gets bitten', payoff: 'surviving with friends and one perfect comeback', palette: 'cricket bats, shopping carts, a pub, rules on a notebook, a theme park, a mall PA system', sources: ['shaun_dead', 'zombieland', 'dead_rising'] }
  ],
  dna: [
    { id: 'walking_dead', title: 'The Walking Dead', medium: 'Comics/TV/Telltale', dna: 'Survival as a moral test that never ends: a group that keeps changing as people die or leave; every safe place has a price and a leader; the dead are weather, and the living become the worst threat.' },
    { id: 'last_of_us', title: 'The Last of Us', medium: 'Game/TV', dna: 'A smuggler escorts an immune girl across a ruined country; grief becomes love; the final choice saves her and dooms the cure.' },
    { id: 'dawn_dead', title: 'Dawn of the Dead (2004)', medium: 'Film', dna: 'Strangers barricade a shopping mall; boredom and luxury inside, the horde outside; a pregnancy, a gun-shop owner across the street, and a doomed escape by armored bus.' },
    { id: '28_days', title: '28 Days Later', medium: 'Film', dna: 'Fast, furious infected and a world emptied in days; strangers become a family in an afternoon; long eerie quiet broken by sudden sprints; the promise of rescue is the trap, and the soldiers are worse than the infected.' },
    { id: 'train_busan', title: 'Train to Busan', medium: 'Film', dna: 'A selfish father and his daughter on a train as the outbreak spreads; car-by-car fights; selfishness and sacrifice among the passengers.' },
    { id: 'world_war_z', title: 'World War Z', medium: 'Book', dna: 'An oral history of the zombie war told by survivors around the world; each interview a different country, strategy and failure.' },
    { id: 'state_decay', title: 'State of Decay 2', medium: 'Game', dna: 'Build a community base, manage morale, supplies and survivors\' traits; scavenging runs where anyone can die for good.' },
    { id: 'shaun_dead', title: 'Shaun of the Dead', medium: 'Film', dna: 'A slacker fails to notice the apocalypse at first; plan: get mum, get the girl, go to the pub; comedy that turns sincere.' },
    { id: 'zombieland', title: 'Zombieland', medium: 'Film', dna: 'A rule-obsessed loner, a gun-happy cowboy and two con-artist sisters road-trip to an amusement park; rules on screen, found family.' },
    { id: 'days_gone', title: 'Days Gone', medium: 'Game', dna: 'A biker drifts through a wild northwest of hordes, camps and cults, hoping his wife is alive; the motorcycle is his home.' },
    { id: 'girl_gifts', title: 'The Girl with All the Gifts', medium: 'Film/Book', dna: 'A gifted infected child at a military base; a teacher who loves her; the next generation may not be human, and may be better.' },
    { id: 'black_summer', title: 'Black Summer', medium: 'Netflix', dna: 'Frantic, almost wordless first days; strangers forced together for one run across a city; fast dead and fragmented points of view.' },
    { id: 'dead_rising', title: 'Dead Rising', medium: 'Game', dna: 'A photojournalist trapped in a mall for three days; anything in the stores is a weapon; psychopaths and survivors to rescue on a clock.' }
  ],
  hooks: [
    'the hospital admits a man whose heart has stopped, and he asks the nurse for water',
    'the morning-show producer gets a call: the guest is outside, but he is "not well"',
    'the hero\'s delivery app routes them to a quarantine fence with a soldier waving them through',
    'the school goes into lockdown for an "animal on campus", and the hero has thirty kids in a classroom',
    'a survivor arrives at the camp gate with a bitten hand and the cure for the camp\'s fever',
    'the radio loop of a survivor begging for help suddenly says the hero\'s call sign',
    'the hero\'s little sister texts "don\'t come home, they\'re in the house, it\'s mom"',
    'a bus full of people stops for the hero on an empty highway, and the driver will not open the door'
  ],
  places: ['a dialysis clinic with a backup generator', 'a cruise ship anchored offshore with its lights still on', 'a high-school gym turned triage center', 'a ski resort cut off by snow', 'a supermarket with a pharmacy and a loading dock', 'a radio station on a hill above the city'],
  complications: ['the safe zone is culling the sick and the hero is a carrier', 'the group\'s leader hid the bite', 'the person the hero is protecting is the source', 'a loved one turned and is still wandering nearby'],
  setPieces: [
    'You reach for the last antibiotics and a decayed hand grabs your wrist from the shadows.',
    'A massive horde blocks the highway, and you weave silently between abandoned cars.',
    'The farmhouse door starts to splinter under the weight of the moans outside.',
    'The rescue helicopter flies overhead and ignores your flares.',
    'A car alarm you triggered draws every infected within a mile.',
    'A child is trapped on the roof of a school bus surrounded by the dead.',
    'The power grid fails and heavy, dragging footsteps approach your hideout.',
    'A bitten survivor hands you their weapon and begs you to end it.'
  ]
} satisfies StoryDeck;
