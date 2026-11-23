import type { StoryDeck } from '../types';

// Mythology used to be Norse-only in its pattern. 0.2 keeps Norse as one family among five,
// so Egyptian, Celtic, grimoire-occult and gods-among-us stories get rolled too.
export const mythology = {
  signature: 'Gods, spirits and the dead are real and have rules; a vow, a name or a gift binds people; fate can be bargained with but not ignored. Saga weight and ritual detail, with room for wit.',
  engines: ['journey', 'bargain', 'trial', 'hunt', 'siege', 'masquerade', 'rescue', 'heist', 'inheritance', 'homecoming', 'escape'],
  families: [
    { id: 'norse', name: 'Norse saga', hero: 'someone bound by kin and oath: a skald, a ferry-woman, a rune-carver, a hostage fostered among strangers, a smith\'s daughter', start: 'a hall, a fjord, a feast or a burial, where an oath or a gift is made', turn: 'the oath is tested by giants, gods or kin, and something is lost', payoff: 'facing doom with courage, keeping the oath or breaking it on purpose', palette: 'longships, sea-ice, mead and smoke, runes cut in wet wood, ravens, a wolf-age coming', sources: ['god_of_war', 'northman', 'senua', 'valheim', 'ac_valhalla', 'ragnarok'] },
    { id: 'egypt', name: 'Egyptian afterlife', hero: 'someone who serves the dead or the temple: an embalmer, a tomb-painter, a scribe of names, a temple cat-keeper', start: 'the west bank, a tomb, a temple at night, a body brought in with something wrong about it', turn: 'the gods, the dead or a priest-king demand something that cannot be given', payoff: 'a heart weighed, a name kept or erased, the Duat crossed', palette: 'natron and lamp-oil, painted walls, the Nile at flood, jackals at the edge of the light, gold leaf on linen', sources: ['mummy', 'kane', 'moon_knight', 'stargate'] },
    { id: 'celtic', name: 'Celtic otherworld', hero: 'someone who lives near a boundary: a shore-warden, a harper, a herder on a fairy hill, a changeling\'s sister', start: 'a feast night when the boundary is thin (Samhain, Beltane), and a guest who should not be there', turn: 'a bargain with the Good Folk binds the hero or someone they love', payoff: 'a riddle answered, a geis kept or broken, someone brought back across', palette: 'mist on the hills, standing stones, hazel and rowan, music that steals time, salt and iron', sources: ['senua', 'american_gods', 'age_mythology'] },
    { id: 'occult', name: 'Grimoire and Hermetic occult', hero: 'someone with a dangerous book: a bookbinder, a convent copyist, an alchemist\'s apprentice, a printer\'s errand-runner', start: 'a city at night, a workshop, a library, a ritual followed one step too far', turn: 'a spirit, a society or the Work itself demands its price', payoff: 'the circle held or broken, the price paid or passed on', palette: 'chalk circles, sulfur and beeswax, star tables, copper and mercury, ciphers in the margins', sources: ['goetia', 'voynich', 'abramelin', 'kybalion', 'picatrix', 'book_law'] },
    { id: 'modern', name: 'Old gods among us', hero: 'someone ordinary who catches a god at work: a night-shift museum guard, a rideshare driver, a pawnshop owner\'s kid, a teenager whose uncle is not what he seems', start: 'a normal city day where someone too old to be alive asks for a favor', turn: 'the god\'s war or family feud makes the hero a piece on the board', payoff: 'a bargain that changes the god as much as the hero', palette: 'neon on rain, a pawn ticket, an amulet in a lost-and-found box, a diner booth for gods, a phone that rings with no number', sources: ['american_gods', 'kane', 'moon_knight', 'lore_olympus', 'smite'] }
  ],
  dna: [
    { id: 'god_of_war', title: 'God of War (Norse saga)', medium: 'Games', dna: 'A parent and child on a long walk to scatter ashes; the journey is the relationship. The gods are petty and dangerous, the land remembers old wars, and the real fight is the hero\'s own temper.' },
    { id: 'ragnarok', title: 'Thor: Ragnarok', medium: 'Film', dna: 'A proud god loses his hammer, his hair and his home, and has to win back his people with a ragtag team; gladiator pits on a junk planet; comedy that still lets the end of the world land.' },
    { id: 'american_gods', title: 'American Gods', medium: 'Book/TV', dna: 'Old gods diminished and working odd jobs among mortals; a road trip of strange meetings; a con-artist employer; a war between old faiths and new ones like media and technology.' },
    { id: 'northman', title: 'The Northman', medium: 'Film', dna: 'Fate spoken early in a vision and then pursued for years; brutal, ritual and dreamlike; every act of violence is also a ceremony, and the prophecy means something the hero did not expect.' },
    { id: 'valheim', title: 'Valheim', medium: 'Game', dna: 'A dead warrior dropped into a purgatory world to prove worth to the gods; build a longhouse, survive the biomes, and summon each great beast with offerings at its altar.' },
    { id: 'ac_valhalla', title: "Assassin's Creed Valhalla", medium: 'Game', dna: 'A raider settles a new land and builds alliances by raid, marriage and treaty; visions of the gods bleed into politics; the clan\'s choices make or break kingdoms.' },
    { id: 'senua', title: "Senua's Sacrifice", medium: 'Game', dna: 'A journey into the land of the dead to bargain for a lost love, told from inside a mind that hears voices; puzzles are perception; the enemy is grief, and acceptance is the victory.' },
    { id: 'mummy', title: 'The Mummy (1999)', medium: 'Film', dna: 'Pulp adventure in a cursed ruin: a book that should not be read aloud, a rival expedition, plagues that arrive in order, and humor that keeps the dread fun.' },
    { id: 'moon_knight', title: 'Moon Knight', medium: 'TV Show', dna: 'An ordinary person wakes to find a god has been using their body; missing time, a second self, and a cult that knows them better than they know themselves.' },
    { id: 'stargate', title: 'Stargate SG-1', medium: 'TV Show', dna: 'The old gods were aliens wearing human hosts; a ring of stone opens to other worlds; a team of soldiers and scholars topples false gods one planet at a time.' },
    { id: 'kane', title: 'The Kane Chronicles', medium: 'Books', dna: 'Siblings discover the old gods living inside modern people; each god offers power at the cost of slowly becoming them; fast, funny, and about family.' },
    { id: 'age_mythology', title: 'Age of Mythology', medium: 'Game', dna: 'An admiral chases a cyclops across Greek, Egyptian and Norse lands; each pantheon grants different powers; myth creatures fight beside armies.' },
    { id: 'smite', title: 'Smite', medium: 'Game', dna: 'Gods of every pantheon fight each other in arenas; each god has a signature power and a personality; rivalries cross cultures.' },
    { id: 'lore_olympus', title: 'Lore Olympus', medium: 'Webtoon', dna: 'The gods as a glamorous, gossiping high society; a young goddess and the lonely king of the underworld; power, consent and healing told as a modern romance.' },
    { id: 'goetia', title: 'The Lesser Key of Solomon (Ars Goetia)', medium: 'Grimoire', dna: 'Spirits have names, ranks and seals; to command one you must know its name and keep to the letter of the contract; every spirit is a lawyer looking for a loophole.' },
    { id: 'book_law', title: 'The Book of the Law', medium: 'Occult text', dna: 'A text dictated by a voice in a room in Cairo; a new age announced; followers who read it as freedom and others who read it as license.' },
    { id: 'kybalion', title: 'The Kybalion', medium: 'Hermetic text', dna: 'Seven principles of a hidden science (as above, so below; everything vibrates); the mind can transmute the world, and a society keeps the teaching secret.' },
    { id: 'picatrix', title: 'The Picatrix', medium: 'Astrological grimoire', dna: 'Talismans timed to the stars, images cut at the right hour, planetary spirits drawn down with incense and music; the wrong hour is the danger.' },
    { id: 'abramelin', title: 'The Book of Abramelin', medium: 'Grimoire', dna: 'Months of isolation and purity to meet a guardian angel, then the binding of demons; a test of patience where shortcuts are punished.' },
    { id: 'voynich', title: 'The Voynich Manuscript', medium: 'Unciphered codex', dna: 'A book no one can read, plants that do not exist, a cipher that might be a key or a trap; the obsession of the people who try to read it is the real story.' }
  ],
  hooks: [
    'a stranger at the feast refuses food and asks only for the hero\'s name, twice',
    'a body arrives for embalming with its heart already removed and replaced by a stone scarab that is warm',
    'the ferry crosses with one more passenger than it carried at the start, and no one will admit which',
    'a printed page comes off the press in a script no one set, and it is a summons',
    'the hero\'s shadow arrives home an hour before the hero does',
    'a one-eyed wanderer begs at the longhouse door, and the house has nothing left to give',
    'the pawnshop\'s new amulet whispers the price it wants to be sold for, and it is not money',
    'the harper plays at a wedding on Samhain and looks up to find that a year has passed outside'
  ],
  places: ['a whaling station built inside the ribs of something larger than a whale', 'a tomb-painters\' village whose painters are paid in beer and silence', 'an island that appears only at low tide on feast days', 'a convent library where the books are chained by the spine', 'a diner off the interstate where the old gods meet to settle debts', 'a ring of stones on a sheep farm that hums on the solstice'],
  complications: ['the god asking for help is the one who caused the trouble', 'the oath was sworn by someone wearing the hero\'s face', 'the price was already paid, by someone who never told the hero', 'the spirit is keeping a promise to the hero\'s dead mother', 'two gods want the same thing from the hero, for opposite reasons'],
  setPieces: [
    'The World Tree shudders as the serpent lets go of its tail and the ground splits under the hall.',
    'A draugr bursts from its burial mound in the snow, its sword glowing with necrotic runes.',
    'The scarabs pour from the sarcophagus and cover the floor as the mummified priest sits up.',
    'You cross the gates of the Duat, each guarded by a demon who demands its own secret name.',
    'The Wild Hunt rides across the storm, and you must hide before the hounds catch your scent.',
    'The chalk circle begins to glow as the summoned spirit takes shape in sulfur smoke and asks for its fee.',
    'Your heart is set on the scales against a feather, and something hungry waits beside them.',
    'You stand on the sun god\'s night barge as the chaos serpent rises from the dark water.'
  ]
} satisfies StoryDeck;
