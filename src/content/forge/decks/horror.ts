import type { StoryDeck } from '../types';

export const horror = {
  signature: 'Something is wrong in a specific, concrete way. Rules, absences and the uncanny matter more than gore; the place itself is a character; the horror is never fully explained.',
  engines: ['mystery', 'siege', 'hunt', 'escape', 'rescue', 'inheritance', 'homecoming', 'survival', 'bargain'],
  families: [
    { id: 'rules', name: 'Rules horror', hero: 'someone who took a job or favor that came with a list of rules: a night guard, a gas-station night cashier, a radio host, a house-sitter', start: 'the first shift or night, the rules on paper, and the first rule that seems pointless', turn: 'a rule is broken, by the hero or someone else, and the place notices', payoff: 'surviving by learning which rules were lies', palette: 'fluorescent hum, laminated instructions, radio static, a door that stays closed, a vending machine that sells one strange thing', sources: ['gas_station', 'left_right', 'lonely_broadcast'] },
    { id: 'folk', name: 'Folk horror', hero: 'an outsider welcomed too warmly, or a local who left and came back', start: 'a small town before a festival, a harvest or a tradition no one explains', turn: 'the tradition needs someone, and the town has already chosen', payoff: 'escaping, exposing, or taking the old role on purpose', palette: 'wheat and woodsmoke, hand-sewn masks, bells at the wrong hour, smiling neighbors, a well with flowers in it', sources: ['borrasca', 'hereditary', 'spire_woods'] },
    { id: 'woods', name: 'The woods and the wild', hero: 'someone whose work takes them off the map: a search-and-rescue volunteer, a surveyor, a fire lookout, a trail photographer', start: 'a routine trip with one thing that should not be there (a staircase, a voice, footprints)', turn: 'the wrong things multiply and the way back changes', payoff: 'getting out with the truth, or not getting out the same', palette: 'pine dark, a radio that answers in your voice, stairs in the forest, deer that stand too still, a trail marker painted the wrong color', sources: ['sar_woods', 'blair_witch', 'spire_woods'] },
    { id: 'home', name: 'The house that knows', hero: 'someone moving into, inheriting or house-sitting a home, often with a child or a sibling', start: 'unpacking, small helpful oddities, a neighbor with advice', turn: 'the house wants something from its people, and it is patient', payoff: 'learning what the house wants, and deciding whether to give it', palette: 'wallpaper seams, a cold room, a child\'s drawing that updates, a door behind the furnace, a baby monitor', sources: ['babadook', 'hereditary', 'my_property', 'third_parent'] },
    { id: 'survival', name: 'Survival horror', hero: 'someone trapped with a monster: a mechanic at a remote plantation, a reporter in an asylum, a sibling searching for a brother', start: 'arriving at the wrong place for a good reason', turn: 'the way out is sealed and the monster has a routine', payoff: 'escaping with someone, or because of someone', palette: 'flickering bulbs, typewriter save rooms, keys with symbols, a camcorder\'s night vision, a locked greenhouse', sources: ['silent_hill', 're7', 'outlast', 'amnesia'] }
  ],
  dna: [
    { id: 'silent_hill', title: 'Silent Hill 2', medium: 'Game', dna: 'A fog-bound town that builds its monsters out of the visitor\'s guilt; the place is a confession, every creature a symbol of something unsaid, and the truth the hero avoids is the only way out.' },
    { id: 're7', title: 'Resident Evil 7: Biohazard', medium: 'Game', dna: 'A rescue into a farmhouse where a hospitable, monstrous family will not let you leave dinner; bayou rot, tapes of earlier victims, and one family member trying to help.' },
    { id: 'blair_witch', title: 'The Blair Witch Project', medium: 'Film', dna: 'Three people lost in the woods with a camera; arguments rise, signs are left at night, and what you never see is worse than anything shown.' },
    { id: 'amnesia', title: 'Amnesia: The Dark Descent', medium: 'Game', dna: 'Exploration by lantern in a dark that eats the mind; you cannot fight, only hide and listen; notes left by a past self reveal a crime piece by piece, and the reader is implicated.' },
    { id: 'outlast', title: 'Outlast', medium: 'Game', dna: 'A journalist breaks into an asylum with a camcorder; night vision, batteries, hiding under beds; the institution is worse than the inmates.' },
    { id: 'hereditary', title: 'Hereditary', medium: 'Film', dna: 'Grief in a family slowly reveals that the family was arranged for a purpose long ago; domestic details turn out to be part of a ritual.' },
    { id: 'babadook', title: 'The Babadook', medium: 'Film', dna: 'A grieving parent, a pop-up book that should not exist, and a monster that is both real and the shape of the grief; it cannot be killed, only faced and kept.' },
    { id: 'left_right', title: 'The Left/Right Game', medium: 'r/nosleep', dna: 'A road trip follows strict turning instructions into somewhere not on any map; the rules are the only safety and the companions start to change.' },
    { id: 'borrasca', title: 'Borrasca', medium: 'r/nosleep', dna: 'A friendly small town hides a crime everyone takes part in; a sister\'s disappearance investigated years later; the horror is human and the townsfolk smile.' },
    { id: 'sar_woods', title: "I'm a Search and Rescue Officer", medium: 'r/nosleep', dna: 'Calm professional reports of the inexplicable: stairs in the woods, voices that mimic, children who should not be there; an unwritten rule never to talk about it.' },
    { id: 'spire_woods', title: 'The Spire in the Woods', medium: 'r/nosleep', dna: 'A town where teenagers dare each other to visit a strange spire; those who go come back changed, years later the narrator goes back.' },
    { id: 'third_parent', title: 'Tommy Taffy / The Third Parent', medium: 'r/nosleep', dna: 'A child recalls a third parent no one else remembers; a smiling figure who lived in the family\'s routine; memories that do not add up.' },
    { id: 'gas_station', title: 'Tales from the Gas Station', medium: 'r/nosleep', dna: 'A night-shift worker at a remote station logs weirder and weirder customers in a deadpan diary; humor and dread together; the job has rules nobody wrote down.' },
    { id: 'my_property', title: "My Property Isn't Normal", medium: 'r/nosleep', dna: 'A new landowner learns the land has residents and rules; neighbors give terse warnings; each post adds a new oddity and a new rule.' },
    { id: 'lonely_broadcast', title: 'Accounts from a Lonely Broadcast Station', medium: 'r/nosleep', dna: 'A night radio host takes calls from listeners describing things they should not have seen; the calls start describing the station.' }
  ],
  hooks: [
    'the training binder has one rule in a different handwriting: "If she asks for water, you have already given it to her"',
    'a missing-person poster on the gas station door shows the hero\'s own face, dated next week',
    'the house-sitting instructions end with "the third bedroom is not a bedroom"',
    'the search team finds a staircase standing alone in the forest, carpeted, with a light switch at the top',
    'the town\'s harvest queen is drawn by lottery, and the hero\'s name is in the bowl though they never entered',
    'a caller to the late-night show describes the hero\'s studio, down to the mug on the desk',
    'the baby monitor picks up a lullaby, and the baby is asleep in the hero\'s arms',
    'the hero\'s late brother\'s phone sends them a location pin, at 3:12 AM, every night'
  ],
  places: ['a 24-hour laundromat on a highway with no town at either end', 'a model home in an unfinished subdivision where the furniture is bolted down', 'a fire lookout whose logbook goes back to 1911 in one handwriting', 'a lake resort that opens only the week the lake freezes', 'a hospital wing closed since a flood, still with fresh flowers on the desk', 'a rest stop where the map on the wall shows one more exit than the highway has'],
  complications: ['the thing has been protecting the hero from something worse', 'the friendly neighbor wrote the rules', 'the hero has been here before and does not remember', 'the missing person does not want to be found', 'the ritual has already started, and the hero\'s arrival was part of it'],
  setPieces: [
    'Your own voice calls for help from the dark tree line while you are alone at the campsite.',
    'The static on monitor 4 starts to sound like weeping.',
    'The muddy footprints leading into the locked cabin do not match your boots.',
    'The creature outside the door uses your mother\'s voice, but its silhouette is far too tall.',
    'The basement stairs stretch downward forever while the bulb above you dims.',
    'A series of polaroids in the attic shows you sleeping in your bed last night.',
    'The mannequins in the abandoned store change positions every time your flashlight turns away.',
    'The rescue team finds a tent sixty feet up a pine, zipped shut from the inside.'
  ]
} satisfies StoryDeck;
