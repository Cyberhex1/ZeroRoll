/**
 * ZeroRoll 0.2, Phase A bug test (planner, 2026-11-23). Copy to src/content/forge/familyTags.ts.
 *
 * 1. CARD_FAMILIES: cards that only fit some story families. A card not listed here fits every
 *    family. Keys are the exact card text in that category's deck. drawSpread keeps a card when
 *    it is untagged or its tags include the drawn family's id; if that leaves nothing, the whole list.
 *    (Fixes Mythology mixing Egyptian embalmers into a Celtic Samhain hall, Doge's wine in feudal
 *    Japan, and the werewolf pack taking over a TikTok rebirth story.)
 * 2. SPICE_IN_FAMILY: in these categories the second influence comes from the drawn family's own
 *    sources (minus the primary), because a second culture or era there is a mash-up, not a spice.
 * 3. HERO_CARDS: one offered hero per roll, drawn in code with global recency, so the model stops
 *    falling back to the same bookish hero (A1: "archivist" 17 times in 30 rolls, plus scribes and
 *    copyists, ink and ledgers). Keyed "<category>.<familyId>"; every family has 5 or 6.
 * 4. WORN_ROLES: roles Flash-Lite falls back to. Code only (pickPitch penalty); never send this
 *    list to the model, since naming a word primes it.
 */
import type { ExperienceCategory } from '../../types';

export type TaggedCardKind = 'hooks' | 'places' | 'setPieces';

export const CARD_FAMILIES: Partial<Record<ExperienceCategory, Partial<Record<TaggedCardKind, Record<string, string[]>>>>> = {
  mythology: {
    hooks: {
      'a stranger at the feast refuses food and asks only for the hero\'s name, twice': ['norse', 'celtic', 'egypt'],
      'a body arrives for embalming with its heart already removed and replaced by a stone scarab that is warm': ['egypt'],
      'the ferry crosses with one more passenger than it carried at the start, and no one will admit which': ['norse', 'egypt', 'celtic', 'modern'],
      'a printed page comes off the press in a script no one set, and it is a summons': ['occult'],
      'the hero\'s shadow arrives home an hour before the hero does': ['occult', 'modern', 'celtic'],
      'a one-eyed wanderer begs at the longhouse door, and the house has nothing left to give': ['norse'],
      'the pawnshop\'s new amulet whispers the price it wants to be sold for, and it is not money': ['modern'],
      'the harper plays at a wedding on Samhain and looks up to find that a year has passed outside': ['celtic'],
      'the hero\'s foster-brother comes home from a raid wearing a gold arm-ring that will not come off, and the dead keep knocking to ask for it back': ['norse'],
      'the Nile floods a month early and leaves a sealed coffin on the hero\'s doorstep, with the hero\'s own name painted in the cartouche': ['egypt'],
      'a temple cat drops a gold ring at the hero\'s feet, still on the finger of a pharaoh buried this morning': ['egypt'],
      'a client brings a grimoire to be rebound, pays in old teeth, and asks that no one read the last page': ['occult'],
      'a rideshare passenger pays with a gold coin and gives an address in the middle of the river': ['modern'],
      'after closing, the hero finds wet bronze footprints leading from a statue\'s empty plinth to the staff kitchen': ['modern'],
      'a seal-skin comes up in the hero\'s nets, still warm, and someone on the shore is calling for it by name': ['celtic']
    },
    places: {
      'a whaling station built inside the ribs of something larger than a whale': ['norse'],
      'a tomb-painters\' village whose painters are paid in beer and silence': ['egypt'],
      'an island that appears only at low tide on feast days': ['celtic', 'norse'],
      'a convent library where the books are chained by the spine': ['occult'],
      'a diner off the interstate where the old gods meet to settle debts': ['modern'],
      'a ring of stones on a sheep farm that hums on the solstice': ['celtic', 'modern'],
      'a longhouse at the edge of the ice where the hearth has not been allowed to go out in two hundred winters': ['norse'],
      'a necropolis workshop where the coffin-makers measure the living for practice': ['egypt'],
      'an alchemist\'s cellar under a printing house, its furnace vented up the press-room chimney': ['occult'],
      'a museum after closing, where the night-shift break room keeps one chair nobody sits in': ['modern'],
      'a reed-boat village at the edge of the marsh where the dead are rowed across at dusk': ['egypt'],
      'a holy well at a crossroads where every rag tied to the hawthorn is the same color': ['celtic'],
      'a hermit\'s tower in a salt marsh, its observatory built from a shipwreck': ['occult']
    },
    setPieces: {
      'The World Tree shudders as the serpent lets go of its tail and the ground splits under the hall.': ['norse'],
      'A draugr bursts from its burial mound in the snow, its sword glowing with necrotic runes.': ['norse'],
      'The scarabs pour from the sarcophagus and cover the floor as the mummified priest sits up.': ['egypt'],
      'You cross the gates of the Duat, each guarded by a demon who demands its own secret name.': ['egypt'],
      'The Wild Hunt rides across the storm, and you must hide before the hounds catch your scent.': ['celtic', 'norse'],
      'The chalk circle begins to glow as the summoned spirit takes shape in sulfur smoke and asks for its fee.': ['occult', 'modern'],
      'Your heart is set on the scales against a feather, and something hungry waits beside them.': ['egypt'],
      'You stand on the sun god\'s night barge as the chaos serpent rises from the dark water.': ['egypt'],
      'The fairy revel spills out of the hill at midnight, and you must not eat, drink or say thank you until dawn.': ['celtic'],
      'The tide goes out farther than it ever has, and a drowned town rises from the sand with its bells still ringing.': ['celtic'],
      'The homunculus in the sealed flask opens its eyes and asks whose blood it was made from.': ['occult'],
      'The inquisitor\'s men break down the shop door just as the grimoire\'s pages begin to turn by themselves.': ['occult'],
      'At 3 AM in a highway diner, two old gods bet your life on a hand of cards and ask you to deal.': ['modern'],
      'A storm god\'s tantrum floods the subway, and you are the only one who can hear it crying.': ['modern'],
      'At the museum gala the god in the glass case wakes up and walks out the front door, and only you follow.': ['modern']
    }
  },
  historical_adventure: {
    hooks: {
      'the new servant at the castle asks the hero which room the lord sleeps in, for the third time this week': ['samurai', 'renaissance'],
      'a glass order from a great family arrives with a design that is a coded message': ['renaissance'],
      'a dying gladiator tells the hero a password and a name': ['rome'],
      'an innkeeper finds a famous sword wrapped in a guest\'s bedroll, and the guest is gone': ['samurai', 'wuxia'],
      'the printing house is ordered to print a confession by a man who has not been arrested yet': ['renaissance'],
      'the hero is asked to taste the Doge\'s wine at the masquerade because the official taster is missing': ['renaissance'],
      'a ronin offers to protect the hero\'s village for a single bowl of rice a day': ['samurai'],
      'the legion\'s pay chest reaches the hero\'s frontier fort full of stones, and the paymaster swears the hero signed for it': ['rome'],
      'a senator\'s freedwoman asks the hero to carry a sealed wax tablet into the arena before the emperor takes his seat': ['rome'],
      'a wounded escort guard staggers into the hero\'s inn, presses a red envelope into their hands and dies before saying who it is for': ['wuxia'],
      'the hero\'s old sect master is selling dumplings at the market and pretends not to know them': ['wuxia']
    },
    places: {
      'a post station on a mountain road where every traveler must show papers': ['samurai', 'wuxia'],
      'a Venetian glass furnace on an island where the masters may never leave': ['renaissance'],
      'a gladiator school above a bakery': ['rome'],
      'a tea house with a hidden room for rebels': ['samurai', 'wuxia'],
      'an aqueduct under construction outside a provincial city': ['rome'],
      'a caravanserai at the edge of the Silk Road': ['wuxia', 'rome'],
      'a fresco workshop where the master paints over a family\'s secret map one wall at a time': ['renaissance'],
      'a printing shop on a crowded bridge, its second press hidden under the floorboards': ['renaissance'],
      'a river-ford inn where the martial sects must leave their swords at the door': ['wuxia'],
      'a fishing village where the castle\'s tax boat comes once a month and leaves with someone\'s child': ['samurai']
    },
    setPieces: {
      'The Library of Alexandria burns, and you must choose between a trapped scholar and the last copy of a text.': ['rome'],
      'You draw your blade in the moonlit snow against three ronin come for your bounty.': ['samurai'],
      'The Colosseum roars as the emperor turns his thumb down.': ['rome'],
      'A musketeer presses a sealed letter into your hand before dying in the mud.': ['renaissance'],
      'Siege engines launch flaming pitch over the castle walls as shinobi climb the ramparts.': ['samurai'],
      'You duel a master swordsman atop a swaying bamboo canopy.': ['wuxia'],
      'A ninja\'s smoke bomb fills the teahouse, and when it clears the heir is gone.': ['samurai'],
      'The carnival crowd swallows the assassin, and your only clue is the scent of the poison on your glove.': ['renaissance'],
      'A rival guild cuts the scaffold ropes under the cathedral dome while the whole city watches it rise.': ['renaissance'],
      'Twelve masked swordsmen land on the inn\'s roof tiles, and the innkeeper you trusted reaches under the counter.': ['wuxia'],
      'You fight on the deck of a burning river barge as the stolen sword manual\'s pages scatter on the water.': ['wuxia'],
      'The legion\'s eagle is lost in the forest, and the tribune wants a scapegoat by dawn.': ['rome']
    }
  },
  tiktok_drama: {
    hooks: {
      'the hero wakes up on the morning of their own wedding, three years before they died': ['rebirth'],
      'the pack alpha announces the mating ceremony and the hero is told to wait outside the circle': ['pack'],
      'the hero opens their eyes at their graduation dinner, seated beside the best friend who will poison them in five years': ['rebirth'],
      'the hero\'s wolf refuses to come out on the night of the trials, and the alpha\'s heir laughs the loudest': ['pack']
    },
    places: {
      'a pack lodge in the mountains during the full moon': ['pack']
    },
    setPieces: {
      'The alpha who rejected you kneels as your bloodline awakens under the full moon.': ['pack'],
      'The moon festival goes silent when the elder\'s scent-test names you, not the chosen bride, as the alpha\'s true mate.': ['pack']
    }
  },
  romantic: {
    hooks: {
      'a fae lord accepts the hero\'s family debt in exchange for one dance a month, forever': ['fae'],
      'the hero must teach the new duke to dance before the ball, and he is very bad at it on purpose': ['regency', 'royal'],
      'the hero catches the prince climbing out of a library window with a stolen book': ['royal', 'regency', 'fae', 'enemies'],
      'the hero\'s new roommate is the person who left them at the altar, and the lease is non-negotiable': ['modern', 'enemies'],
      'the hero\'s dying sister wakes up cured, and a pale stranger arrives to collect the hero\'s first kiss as payment': ['fae']
    },
    places: {
      'an orangery heated by a captured summer': ['fae', 'regency', 'royal'],
      'a masked ball held on frozen canals': ['regency', 'fae', 'royal'],
      'a palace where every room has two doors': ['royal', 'regency', 'fae'],
      'a night market under a bridge that sells memories by the ounce': ['fae']
    },
    setPieces: {
      'You are caught leaving the royal gardens at midnight, straight into the arms of the rebellious prince.': ['royal', 'regency', 'fae'],
      'Forced to share the last room at the inn, the stoic knight insists on sleeping on the floor.': ['regency', 'fae', 'royal', 'enemies'],
      'The crown prince announces he will choose his bride at the gala, and his gaze is on you.': ['royal', 'regency', 'fae'],
      'At the court of masks you must find your partner\'s true face among a hundred, or stay forever.': ['fae']
    }
  },
  fantasy: {
    hooks: {
      'the king\'s taster collapses, and the hero is the only one who saw what was in the cup': ['realm']
    }
  }
};

/** Second influence from the family's own sources in these categories (see 2 above). */
export const SPICE_IN_FAMILY: readonly ExperienceCategory[] = ['mythology', 'historical_adventure'];

/** One of these is offered per roll as "the hero" (see 3 above). Keyed "<category>.<familyId>". */
export const HERO_CARDS: Record<string, readonly string[]> = {
  'fantasy.party': ['locksmith who works only at night', 'bard who owes money to half the city', 'cleric who stopped praying', 'camp cook who fights with a cleaver', 'retired siege engineer', 'halfling fence with a conscience'],
  'fantasy.monster_hunter': ['rat-catcher with a famous grandmother', 'plague doctor', 'bounty tracker who never kills', 'bell-ringer who hunts what the bells wake', 'taxidermist to a duke', 'ferryman on a haunted river'],
  'fantasy.magic_school': ['apprentice who failed the entrance exam', 'hedge witch on a scholarship', 'groundskeeper\'s daughter with wild magic', 'mage with a stolen spellbook', 'second in the dueling club', 'potion-tester paid by the dose'],
  'fantasy.realm': ['squire to a cowardly knight', 'herald who must announce bad news', 'border ferryman', 'royal falconer', 'the heir\'s whipping boy', 'laundress of the royal household'],
  'adventure.high_seas': ['ship\'s cook', 'navigator\'s apprentice', 'harbor pickpocket', 'captain who lost her ship at cards', 'ship\'s surgeon who faints at blood', 'lighthouse keeper\'s runaway son'],
  'adventure.tomb_raider': ['museum restorer', 'desert guide', 'disgraced professor', 'smuggler\'s daughter', 'insurance investigator', 'stunt pilot who flies for diggers'],
  'adventure.lost_world': ['expedition cook', 'stowaway', 'scientist\'s younger sibling', 'balloon pilot', 'big-game hunter who has never fired a shot', 'wildlife photographer'],
  'adventure.caper': ['romance novelist', 'carnival barker', 'kid with a map', 'retired forger', 'wedding planner', 'hotel bellhop'],
  'historical_adventure.samurai': ['tea-house keeper', 'ronin', 'road courier', 'shrine maiden', 'castle cook', 'kabuki actor'],
  'historical_adventure.renaissance': ['glassmaker', 'printer\'s apprentice', 'fresco assistant', 'gondolier', 'perfumer to a duchess', 'fencing master\'s daughter'],
  'historical_adventure.rome': ['legion cook', 'gladiator\'s trainer', 'freedwoman merchant', 'chariot-team groom', 'bathhouse attendant', 'aqueduct engineer'],
  'historical_adventure.wuxia': ['innkeeper', 'escort-agency guard', 'disgraced disciple', 'tea merchant', 'opera singer', 'street physician'],
  'horror.rules': ['night guard', 'gas-station night cashier', 'late-night radio host', 'house-sitter', 'hotel night auditor', 'ice-cream truck driver'],
  'horror.folk': ['wedding photographer hired for the festival', 'nurse posted to a remote island', 'local who left and came back for a funeral', 'friend tagging along on a couple\'s trip', 'new vicar', 'estate agent selling the old farm'],
  'horror.woods': ['search-and-rescue volunteer', 'land surveyor', 'fire lookout', 'trail photographer', 'ranger on her last season', 'geocacher'],
  'horror.home': ['new homeowner with a toddler', 'house-sitter', 'older sibling minding the twins', 'live-in caregiver', 'renovation contractor', 'heir to a grandmother\'s house'],
  'horror.survival': ['mechanic at a remote plantation', 'reporter in an asylum', 'sibling searching for a brother', 'cruise-ship entertainer', 'mall security guard', 'truck driver stuck at a motel'],
  'cozy_ghibli.newshop': ['delivery witch', 'teashop keeper', 'lamp-mender', 'bicycle courier', 'umbrella repairer', 'baker who bakes for spirits'],
  'cozy_ghibli.spirits': ['child spending the summer at grandma\'s', 'new kid in a river town', 'girl who can hear the trees', 'boy who feeds the shrine fox', 'teenager working at the family inn', 'kid whose cat talks only on rainy days'],
  'cozy_ghibli.voyage': ['ferry pilot carrying letters', 'girl carrying a sleeping friend', 'seed carrier crossing the mountains', 'postman of the floating islands', 'boy escorting a lost cloud'],
  'cozy_ghibli.restore': ['heir to an overgrown farm', 'gardener of an abandoned greenhouse', 'keeper of a closed island lighthouse', 'young carpenter fixing a bathhouse', 'beekeeper reviving a valley'],
  'romantic.regency': ['governess', 'younger daughter', 'rival heir', 'portrait painter', 'lady\'s maid', 'dancing master'],
  'romantic.enemies': ['rival chef', 'rival architect', 'rival thief', 'rival heir', 'rival duelist', 'rival wedding planner'],
  'romantic.fae': ['mortal with a family debt', 'healer with a dangerous gift', 'bard who sang the wrong song', 'hunter who spared a fae prince', 'tailor who sews for the night court'],
  'romantic.royal': ['commoner candidate', 'palace seamstress', 'foreign princess\'s bodyguard', 'royal stable groom', 'palace pastry chef', 'court musician'],
  'romantic.modern': ['barista', 'bookshop owner', 'med student', 'band\'s merch seller', 'dog walker', 'wedding florist'],
  'revenge.betrayal': ['royal cook', 'stablemaster', 'midwife', 'fixer', 'first mate', 'perfumer'],
  'revenge.family': ['youngest child', 'quiet middle sibling', 'adopted cousin', 'widow nobody consulted', 'family chauffeur\'s kid', 'disinherited twin'],
  'revenge.machine': ['palace guard', 'courier', 'dock worker', 'lamplighter', 'company engineer', 'factory nurse'],
  'revenge.quiet_pro': ['former duelist now a florist', 'ex-smuggler running a ferry', 'retired assassin who teaches piano', 'ex-getaway driver now a driving instructor', 'former poisoner running a bakery'],
  'apocalypse.vault': ['vault dweller', 'bunker child', 'seed-bank keeper', 'dome gardener', 'vault dentist', 'radio operator who has never seen the sky'],
  'apocalypse.road': ['parent and child', 'courier', 'mechanic with a working engine', 'traveling barber', 'dog-sled musher', 'ice-cream truck driver with the last freezer'],
  'apocalypse.wasteland': ['water-rig mechanic', 'war-boy', 'fuel runner', 'scrap surgeon', 'tattoo artist to a warlord', 'arena announcer'],
  'apocalypse.zone': ['stalker', 'scavenger', 'scientist\'s guide', 'smuggler', 'checkpoint cook', 'dosimeter repairman'],
  'zombie.day_one': ['nurse', 'radio host', 'delivery driver', 'high-school teacher', 'bus driver', 'wedding caterer'],
  'zombie.group': ['medic', 'scavenger', 'engine fixer', 'new arrival', 'group\'s cook', 'former park ranger'],
  'zombie.escort': ['smuggler', 'father', 'teacher', 'older sibling', 'ambulance driver', 'babysitter of an immune kid'],
  'zombie.comedy': ['slacker', 'mall employee', 'rule-following nerd', 'reality-TV contestant', 'wedding band singer', 'ice-rink zamboni driver'],
  'cosmic_horror.archive': ['court stenographer', 'museum night-guard', 'rare-book thief', 'radio-drama sound man', 'police sketch artist', 'auction-house appraiser'],
  'cosmic_horror.coast': ['genealogist', 'lighthouse relief keeper', 'fish buyer', 'census taker', 'ferry mechanic', 'traveling dentist'],
  'cosmic_horror.expedition': ['geologist', 'expedition cook', 'radio operator', 'photographer', 'biologist', 'ice-core driller'],
  'cosmic_horror.deep': ['submarine engineer', 'deep-space medic', 'dredge captain', 'orbital welder', 'station cook', 'sonar operator'],
  'psychedelic_trip.ego': ['grieving widow at a festival', 'burned-out surgeon', 'songwriter after a breakup', 'father facing a big decision', 'stand-up comic who stopped being funny'],
  'psychedelic_trip.entities': ['programmer', 'jazz drummer', 'philosophy student', 'sound engineer', 'anesthesiologist', 'ham-radio hobbyist'],
  'psychedelic_trip.simulation': ['commuter', 'night-shift coder', 'stage actor', 'elevator repairman', 'speedrunner', 'weather presenter'],
  'psychedelic_trip.gonzo': ['journalist', 'touring musician', 'two best friends', 'bachelor party survivor', 'lawyer on leave', 'wedding videographer'],
  'psychedelic_trip.plant': ['veteran', 'new mother', 'addict in recovery', 'grieving son', 'overworked chef', 'pastor who lost faith'],
  'tiktok_drama.hidden_heir': ['waitress', 'temp', 'quiet spouse', 'adopted daughter', 'delivery rider', 'hotel cleaner'],
  'tiktok_drama.contract': ['med student with debts', 'single parent', 'florist losing her shop', 'nanny', 'struggling violinist', 'bridal-shop assistant'],
  'tiktok_drama.rebirth': ['betrayed wife reborn at twenty', 'heiress reborn before the merger', 'groom reborn the night before the wedding', 'designer reborn before her stolen debut', 'daughter reborn before the adoption'],
  'tiktok_drama.pack': ['omega who cannot shift', 'alpha\'s rejected mate', 'pack healer\'s daughter', 'human raised by the pack', 'beta\'s forgotten twin'],
  'tiktok_drama.ex': ['homemaker', 'gentle surgeon', 'quiet IT director', 'kindergarten teacher', 'housewife who secretly owns the company', 'ex-wife who became a judge'],
  'ancient_greek.voyage': ['ship\'s cook', 'captured priestess', 'oarsman', 'wife sailing to find her husband', 'helmsman\'s son', 'potter with a cargo'],
  'ancient_greek.war': ['shield-bearer', 'healer', 'captive weaver', 'herald', 'charioteer', 'camp cook'],
  'ancient_greek.labyrinth': ['tribute youth', 'temple thief', 'shepherd chosen by lot', 'demigod who does not know it', 'bull-dancer', 'sponge diver'],
  'ancient_greek.olympus': ['priestess', 'sculptor', 'oracle\'s attendant', 'vintner', 'mortal musician', 'temple beekeeper'],
  'mythology.norse': ['skald', 'ferry-woman', 'rune-carver', 'hostage fostered among strangers', 'smith\'s daughter', 'whale-hunter'],
  'mythology.egypt': ['embalmer', 'tomb-painter', 'temple cat-keeper', 'Nile boatwoman', 'brewer for the tomb workers', 'reader of dreams for the temple'],
  'mythology.celtic': ['shore-warden', 'harper', 'herder on a fairy hill', 'changeling\'s sister', 'well-keeper', 'peat-cutter'],
  'mythology.occult': ['bookbinder', 'alchemist\'s apprentice', 'printer\'s errand-runner', 'apothecary', 'astrologer\'s servant', 'glassblower who makes alembics'],
  'mythology.modern': ['night-shift museum guard', 'rideshare driver', 'pawnshop owner\'s kid', 'teen whose uncle is not what he seems', 'diner waitress', 'tow-truck driver'],
  'real_life.workplace': ['night-shift pharmacist', 'wedding DJ', 'school bus driver', 'hotel concierge', 'help-desk tech', 'line cook'],
  'real_life.neighbors': ['renter in a duplex', 'new homeowner', 'building super', 'retiree with a dog', 'HOA newcomer', 'mail carrier'],
  'real_life.family': ['eldest home for a wedding', 'youngest home for a funeral', 'the sibling who stayed', 'kid flying in for a retirement party', 'cousin who brought the wrong date'],
  'real_life.hustle': ['app founder in a garage', 'line cook auditioning for a famous kitchen', 'temp at a strange company', 'delivery driver with a side business', 'open-mic comic', 'food-truck owner']
};

/** Roles Flash-Lite falls back to (code only, see 4 above). Whole words, case-insensitive. */
export const WORN_ROLES: readonly string[] = [
  'archivist', 'scribe', 'librarian', 'copyist', 'clerk', 'bookkeeper', 'accountant', 'cartographer', 'mapmaker',
  'cataloguer', 'cataloger', 'translator', 'interpreter', 'scholar', 'taster', 'cupbearer', 'notary', 'scrivener'
];

export function cardFits(category: ExperienceCategory, kind: TaggedCardKind, card: string, familyId: string): boolean {
  const tags = CARD_FAMILIES[category]?.[kind]?.[card];
  return !tags || tags.includes(familyId);
}
