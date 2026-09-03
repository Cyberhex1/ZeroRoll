import { ExperienceCategory } from '../types';
import { CATEGORY_SEEDLISTS, CategorySeedInfo } from './seedlists';

export interface CategoryNarrativeProfile {
  id: ExperienceCategory;
  name: string;
  seedSource: string;
  voice: string;
  atmosphere: string;
  sceneStructure: string;
  storyBeats: string;
  characterDynamics: string;
  encounterPatterns: string;
  sensoryMotifs: string[];
  avoid: string;
}

export const CATEGORY_NARRATIVE_PROFILES: Record<ExperienceCategory, CategoryNarrativeProfile> = {
  tiktok_drama: {
    id: 'tiktok_drama',
    name: 'Short Drama',
    seedSource: 'GoodNovel, ReelShot, DramaBox, ActDrama & PrimeDrama Top Tropes',
    voice: 'Snappy, high-tension, dramatic, emotionally charged. Balances quiet, supreme inner composure against the blatant arrogance and condescension of high-society rivals.',
    atmosphere: 'Glittering five-star hotel ballrooms, gilded chandelier atriums, rain-slick black executive sedans, quiet luxury concealed beneath simple uniforms, antique heirloom jewelry tucked in tote bags.',
    sceneStructure: '1. Arrival in humble attire/disguise -> 2. Confrontation with arrogant socialite, manager, or ex -> 3. Secret financial or familial asset held in reserve -> 4. Immediate high-stakes social/diplomatic choice fork.',
    storyBeats: 'Paced for thrilling momentum: begins with an arrogant slight, escalates through public friction, teases impending reveal of immense status/wealth, and delivers crisp dramatic payoffs.',
    characterDynamics: 'Undercover billionaires, secret heiresses, contract spouses, proud matriarchs, haughty socialites, loyal executive security waiting on standby.',
    encounterPatterns: 'Boutique entry denials, banquet seating challenges, snide comments from in-laws, discrete phone notifications ("Transfer of $50B approved, Chairman"), surprise VIP arrivals.',
    sensoryMotifs: [
      'Gilded crystal chandeliers reflecting off polished marble floors',
      'The quiet buzz of an encrypted phone receiving a multi-billion dollar wire confirmation',
      'The smooth, cold weight of a family crest signet ring hidden in a pocket',
      'The sharp click of designer high heels and haughty laughter at the VIP reception'
    ],
    avoid: 'Medieval fantasy magic, archaic high-fantasy speech, slow meandering exposition, passive protagonist submission without internal leverage.'
  },

  revenge: {
    id: 'revenge',
    name: 'Revenge & Retribution',
    seedSource: 'GoodNovel, DramaBox & PrimeDrama Anti-Hero Sagas',
    voice: 'Cold, calculating, methodical, noir-tinted prose with restrained fury. Observant and deliberate, emphasizing patience over rash anger.',
    atmosphere: 'Rain-slicked cobblestones, midnight locomotive platforms, flickering yellow streetlamps in smoke-filled alleys, quiet corner diners, unrolled parchment hit-lists.',
    sceneStructure: '1. Return from exile into enemy territory -> 2. Surveillance & environmental reconnaissance -> 3. Contact with underground informant -> 4. Assessing the first corrupt target on the ledger.',
    storyBeats: 'Strategic patience: establishing the list of betrayers, gathering hard intel, exposing vulnerabilities, and executing calculated counter-moves.',
    characterDynamics: 'Exiled avengers, corrupt syndicate barons, nervous informants, crooked city officials, loyal shadow allies.',
    encounterPatterns: 'Toll gate shakedowns, back-alley informant drop-offs, shadow surveillance, testing blade edges, deciphering syndicate ledgers.',
    sensoryMotifs: [
      'Steam hissing from the midnight train onto rain-soaked iron tracks',
      'The crisp scrape of a fountain pen crossing a name off an aged parchment ledger',
      'Yellow streetlamp glow shimmering across wet pavement and dark trench coats',
      'The cold balance of a concealed blade tested against a gloved palm'
    ],
    avoid: 'Mindless chaotic brawling, slapstick humor, unearned sentimental mercy, loud boastful villain speeches without tactical substance.'
  },

  romantic: {
    id: 'romantic',
    name: 'Romantic & Court Drama',
    seedSource: 'GoodNovel & PrimeDrama Passionate Dynasties & Masquerades',
    voice: 'Elegant, witty, emotionally perceptive, sensory-rich prose. High subtext, sparkling dialogue, lingering romantic tension, and sharp courtly awareness.',
    atmosphere: 'Venetian grand canals, moonlit palace balustrades, velvet domino masks, glittering crystal flutes, candlelit ballrooms, soft violin waltzes echoing over water.',
    sceneStructure: '1. Arrival at an opulent masquerade or court ball -> 2. Tense encounter or lingering glance with a brooding rival/contract partner -> 3. Delicate social intrigue or secret letter -> 4. High-stakes conversational choice.',
    storyBeats: 'Emotional friction and vulnerability: starts with a guarded public encounter, deepens through private banter and shared peril, escalating mutual fascination and court stakes.',
    characterDynamics: 'Brooding commanders, sharp-witted heiresses, rival diplomats, gossiping court matriarchs, watchful grand chamberlains.',
    encounterPatterns: 'Invitation scrutiny at the gates, ballroom dance invitations, balcony confrontations, intercepted love letters, whispered court rumors.',
    sensoryMotifs: [
      'Gilded gondolas gliding across moonlit canal waters under paper lanterns',
      'The rustle of heavy silk velvet and the click of delicate fans',
      'A lingering glance exchanged across a crowded chandelier ballroom',
      'The scent of crushed rosewater and melting beeswax candles on a terrace'
    ],
    avoid: 'Modern internet slang, crude unromantic dialogue, flat emotionless exposition, disjointed action without romantic stakes.'
  },

  fantasy: {
    id: 'fantasy',
    name: 'High Fantasy & D&D Sagas',
    seedSource: 'Classic D&D 5e Campaigns & Iconic Tabletop Fantasy Literature',
    voice: 'Evocative, adventurous, steeped in rich world lore. Balances the epic scale of dragon seals and ancient crypts with the warmth of frontier taverns and companions.',
    atmosphere: 'Misty cobblestone crossroads, crackling oak hearths, weathered traveling cloaks, glowing runic boundary stones, pine-scented frontier breezes, ancient catacomb echoes.',
    sceneStructure: '1. Arrival at frontier village or ancient ruins -> 2. Environmental grounding & local lore -> 3. Summons from elder, patron, or warning sign -> 4. Immediate arcane/tactical choice fork.',
    storyBeats: 'Classic heroic progression: setting out on the road, discovering ancient seals or strange tracks, engaging in tactical combat or arcane checks, uncovering deeper mysteries.',
    characterDynamics: 'Eldritch knights, wandering bladesingers, village elders, mysterious cloaked scholars, tavern innkeepers, frontier rangers.',
    encounterPatterns: 'Tavern rumor-gathering, deciphering runic tablets (Arcana Check), inspecting mysterious beast tracks, ancient crypt seals, road ambushes.',
    sensoryMotifs: [
      'The rich aroma of roasted stew, spiced cider, and woodsmoke from the tavern hearth',
      'The faint violet luminescence humming from ancient carved runic stones',
      'Raindrops pattering against a waxed leather traveling cloak and steel pommel',
      'The scrape of an ancestral longsword drawn cleanly from its scabbard'
    ],
    avoid: 'Modern technology, modern slang, immersion-breaking contemporary references, flat stat-sheet narration without vivid imagery.'
  },

  adventure: {
    id: 'adventure',
    name: 'Adventure & Swashbuckling Expeditions',
    seedSource: 'Classic High-Seas Epics & Treasure Expeditions',
    voice: 'Brisk, daring, spirited, full of nautical flavor and the pulse of discovery. Emphasizes momentum, physical agility, and clever problem-solving.',
    atmosphere: 'Sunlit wooden docks, crashing surf, unrolled sea charts weighted by brass coins, creaking ship rigging, squawking gulls, tropical trade winds, obsidian compasses.',
    sceneStructure: '1. Stepping onto bustling harbor or island docks -> 2. Inspecting a mysterious navigational artifact or map -> 3. Recruiting allies or bargaining for supplies -> 4. Outbound expedition choice.',
    storyBeats: 'High-momentum exploration: securing sea charts, outfitting vessels, navigating treacherous reefs, unearthing ancient pirate relics, daring escapes.',
    characterDynamics: 'Swashbuckler explorers, grizzled quartermasters, island navigators, daring privateers, eccentric harbor cartographers.',
    encounterPatterns: 'Harbor supply negotiations, recruiting deckhands at tavern, inspecting sea chart compass bearings, navigating coral shallows, cliffside climbing.',
    sensoryMotifs: [
      'Salt spray misting over sun-bleached wooden piers and hemp mooring ropes',
      'The crisp unrolling of parchment charts marked with compass roses and soundings',
      'The metallic click and balance of a polished brass cutlass in the morning light',
      'Shouting dockworkers and the creak of timber hulls rocking against the pier'
    ],
    avoid: 'Gloomy stagnant inaction, overly dry bureaucratic dialogue, endless waiting without initiative.'
  },

  historical_adventure: {
    id: 'historical_adventure',
    name: 'Historical Adventure',
    seedSource: 'High-Stakes Points in Authentic & Fictionalized World History',
    voice: 'Disciplined, authentic, culturally grounded, cinematic. Rich in historical terminology, respectful period etiquette, and realistic martial stakes.',
    atmosphere: 'Morning dew glistening on bamboo mountain passes, sealed imperial bamboo cylinders, woven straw sandals, quiet roadside tea houses, fortified provincial checkpoints.',
    sceneStructure: '1. Arrival at mountain checkpoint or historical landmark -> 2. Cultural grounding & verifying permits/dispatches -> 3. Encounter with provincial guards or scholars -> 4. Tactical route decision.',
    storyBeats: 'Historical tension and honor: delivering imperial decrees, navigating political border friction, surviving historical sieges or conspiracies, tactical martial duels.',
    characterDynamics: 'Masterless wanderers, imperial scribes, tea house proprietors, provincial barrier guards, historical emissaries.',
    encounterPatterns: 'Identity verification at barrier gates, assessing landslide road hazards, diplomatic bows and courtesies, deciphering historical scrolls.',
    sensoryMotifs: [
      'Morning dew dripping from bamboo stalks onto a wide straw travel hat',
      'The unbroken red wax seal on a polished bamboo imperial dispatch cylinder',
      'The fragrant steam rising from a bowl of hot roasted green tea at a roadside stall',
      'The rhythmic crunch of straw sandals on gravel mountain switchbacks'
    ],
    avoid: 'High-fantasy magic monsters (unless explicitly requested), modern gadgets, disrespectful historical caricatures, anachronistic slang.'
  },

  cozy_ghibli: {
    id: 'cozy_ghibli',
    name: 'Cozy & Studio Ghibli-esque',
    seedSource: 'Studio Ghibli & Heartwarming Whimsical Storytelling',
    voice: 'Gentle, warm, delightfully sensory, whimsical. Celebrates small culinary rituals, nature spirits, gentle companionship, and peaceful community connections.',
    atmosphere: 'Whistling copper tea kettles, star-honey cinnamon steam, flying clockwork tea shops, rolling blossom-filled meadow hills, parasol gliders, glowing spirit companions.',
    sceneStructure: '1. Waking up in a charming shop or airship -> 2. Engaging in a cozy baking/brewing craft ritual -> 3. Greeting a whimsical spirit or friendly villager -> 4. Peaceful exploration choice.',
    storyBeats: 'Gentle discovery and harmony: brewing herbal infusions, helping nature spirits, solving low-stress village mysteries, flying over rolling hills, restoring balance through kindness.',
    characterDynamics: 'Flying tea bakers, glowing spirit foxes, soot helpers, botanical herbalists, kindly lighthouse keepers, delivery pelicans.',
    encounterPatterns: 'Baking star-honey pastries, greeting blossom spirits on windowsills, foraging fresh chamomile, tuning clockwork tea dispensers, sharing tea recipes.',
    sensoryMotifs: [
      'The cheerful high whistle of a polished copper kettle brewing chamomile and star-flour',
      'Warm sunlight streaming through stained-glass hatches onto a sleepy glowing spirit fox',
      'The sweet, buttery aroma of fresh cinnamon rolls cooling on a wooden sill',
      'Soft chiming wind bells rustling in a gentle hill breeze over clover fields'
    ],
    avoid: 'Grimdark violence, cruelty, cynicism, high-stress lethal panic, bleak hopeless environments.'
  },

  horror: {
    id: 'horror',
    name: 'Survival Horror & Creepypasta',
    seedSource: 'r/nosleep, Classic Creepypastas & Psychological Survival Horror',
    voice: 'Tense, claustrophobic, sensory, creeping dread. Focuses on unsettling absences, rules that must not be broken, and the uncanny silence of isolated places.',
    atmosphere: 'Dense pine forests at dusk, brass oil lanterns casting long amber shadows, handwritten caretaker rulebooks pinned to cabin doors, complete absence of birdsong, cold mountain fog.',
    sceneStructure: '1. Arrival at secluded lodge/outpost at twilight -> 2. Finding an ominous caretaker note or missing person trace -> 3. Securing baseline shelter & light -> 4. First eerie anomaly choice.',
    storyBeats: 'Pacing the slow-burn horror: establishing mundane procedures, discovering the first bizarre inconsistency, realizing isolation, navigating escalating threats while managing resources.',
    characterDynamics: 'Forestry survey rangers, night-shift radio technicians, lone investigators, missing predecessors, watchful unseen presences.',
    encounterPatterns: 'Reading handwritten station rulebooks, lighting oil lanterns with matches, inspecting abandoned vehicles with keys left behind, checking perimeter locks.',
    sensoryMotifs: [
      'The dry crunch of autumn leaves beneath boots in a completely silent pine forest',
      'The sharp sulfur smell of a struck match lighting an amber lantern wick',
      'The unsettling, total silence where no insects or birds can be heard',
      'A yellowed handwritten note pinned to peeling timber with a brass thumbtack'
    ],
    avoid: 'Instant cheesy jump-scares without atmosphere, comedic quips, overpowered heroic action that destroys vulnerability, goofy tropes.'
  },

  apocalypse: {
    id: 'apocalypse',
    name: 'Post-Apocalypse & Wasteland Survival',
    seedSource: 'Fallout Sagas & Nuclear Wasteland Survival Lore',
    voice: 'Gritty, resourceful, observant, pragmatic. Highlights the harsh beauty of reclaimed nature, scavenged engineering, and the resilience of wanderers.',
    atmosphere: 'Hissing shelter blast doors, calibrated Geiger counters, sunlit rust valleys, distant wind turbines, scavenged dusters, canteen moisture recyclers, abandoned pre-war checkpoints.',
    sceneStructure: '1. Emerging from underground vault/shelter into sunlight -> 2. Environmental readings & checking gear -> 3. Spotting distant trading settlement or ruin -> 4. Scavenging route choice.',
    storyBeats: 'Survival and exploration: testing water purity, salvaging scrap parts, trading at frontier outposts, repairing pre-war technology, navigating irradiated ruins.',
    characterDynamics: 'Vault survivors, wasteland scavengers, caravan guards, repair tinkers, frontier settlement traders.',
    encounterPatterns: 'Tapping Geiger counters for safe rad levels, scouting with brass binoculars, prying open pre-war lockers, bargaining at solar water pumps.',
    sensoryMotifs: [
      'The deep hydraulic groan and hiss of a massive vault blast door opening after years',
      'The rhythmic, reassuring tick of a handheld Geiger counter measuring clean desert air',
      'The taste of metallic canteen water filtered through a scavenged charcoal recycler',
      'Vast blue skies stretching over sun-bleached highway overpasses and rusty windmills'
    ],
    avoid: 'Pristine modern luxury, effortless endless ammo, magic spells without wasteland explanation, loss of resource stakes.'
  },

  zombie: {
    id: 'zombie',
    name: 'Zombie Outbreak Survival',
    seedSource: 'The Walking Dead, 28 Days Later & Survival Outbreak Tropes',
    voice: 'Urgent, clinical, suspenseful, grounded. Captures the sudden transition from calm routine to catastrophic lockdown protocols.',
    atmosphere: 'Humming fluorescent hospital corridors, sudden Code Silver intercom alerts, magnetic keycards, rubber glove snaps, emergency backup lighting, barricaded triage doors.',
    sceneStructure: '1. Routine laboratory/clinic shift -> 2. Sudden quarantine broadcast and sealed doors -> 3. Gathering emergency supplies and assessing window -> 4. Immediate survival action.',
    storyBeats: 'Epidemic containment and survival: recognizing initial infection symptoms, securing keycard-locked zones, gathering medical gear, cooperating with terrified survivors, planning escape routes.',
    characterDynamics: 'Virology researchers, triage nurses, emergency first responders, frightened clinic patients, security personnel.',
    encounterPatterns: 'Reviewing emergency triage clipboards, securing magnetic doors, checking tactical flashlight batteries, assessing quarantine observation windows.',
    sensoryMotifs: [
      'The steady fluorescent hum dropping abruptly into flashing red emergency lights',
      'The sharp crackle of the hospital intercom broadcasting an urgent Code Silver quarantine',
      'The heavy mechanical thud of magnetic blast doors sealing the triage corridor',
      'The cold plastic feel of an emergency trauma kit clutched in trembling hands'
    ],
    avoid: 'Magical fireballs, comedic cartoon zombies, invulnerable action-movie heroics that ignore infection danger.'
  },

  cosmic_horror: {
    id: 'cosmic_horror',
    name: 'Cosmic Horror & Elder Dimensions',
    seedSource: 'H.P. Lovecraft, Wayne Barlowe, Beksiński & Junji Ito',
    voice: 'Scholarly, obsessive, dread-laden, philosophical. Peels back the thin veneer of human sanity to reveal incomprehensible geometries and ancient cyclopean truths.',
    atmosphere: 'Rain drumming on leaded university archive glass, smell of aged leather and dry parchment, brass astrolabes, cryptic telegrams with unfamiliar postmarks, green banker lamps.',
    sceneStructure: '1. Late night research in university archives -> 2. Uncovering an astronomical anomaly or forbidden translation -> 3. Telegram or relic from missing colleague -> 4. Dangerous investigation choice.',
    storyBeats: 'Intellectual and cosmic dread: translating fragmented tablets, discovering non-Euclidean patterns in photographs, feeling the weight of the indifferent universe, safeguarding sanity.',
    characterDynamics: 'Miskatonic professors, antiquarians, museum curators, obsessive astronomers, doomed academic colleagues.',
    encounterPatterns: 'Examining antique celestial globes, translating Mesopotamian clay tablets, inspecting Antarctic expedition glass plates, deciphering cryptic telegrams.',
    sensoryMotifs: [
      'Rain drumming steadily against tall leaded archive windows in a silent library',
      'The dry, papery scent of hundred-year-old manuscripts under a green glass desk lamp',
      'The heavy brass weight of an antique astrolabe engraved with unknown constellations',
      'The chilling realization that an ink drawing in a ledger matches an impossible celestial event'
    ],
    avoid: 'Treating cosmic gods as punchable raid bosses with standard HP, slapstick comedy, mundane action hero clichés.'
  },

  psychedelic_trip: {
    id: 'psychedelic_trip',
    name: 'Psychedelic Surreal Odyssey',
    seedSource: 'Surrealist Art, Psychonauts & Mind-Bending Dimension Hopping',
    voice: 'Lyrical, kaleidoscopic, mind-bending, shifting realities. Evokes rich synesthesia where colors have sound and thoughts shape physical terrain.',
    atmosphere: 'Neon fractal dunes, velvet violet skies, floating crystal obelisks, melting clockwork compasses, echoing harmonic chimes, shimmering mirror lakes.',
    sceneStructure: '1. Crossing the threshold into the surreal dimension -> 2. Experiencing sensory shift and fluid physics -> 3. Encountering an enigmatic dream entity -> 4. Symbolic perception choice.',
    storyBeats: 'Mind-expanding odyssey: discovering shifting landscapes, unraveling metaphysical puzzles, bending personal perception, harmonizing with abstract thoughtforms.',
    characterDynamics: 'Astral wanderers, dream weavers, mirror oracles, celestial psychonauts, manifestation guardians.',
    encounterPatterns: 'Attuning to harmonic crystal frequencies, walking on liquid glass bridges, conversing in riddles with floating dream oracles, manipulating geometric light.',
    sensoryMotifs: [
      'Violet and iridescent neon waves rolling silently across sand that hums in key of C',
      'A clockwork compass whose hands spin backward to point toward forgotten memories',
      'The sensation of gravity shifting gently sideways as crystal obelisks glow in harmony',
      'Echoing chime notes that leave trails of radiant indigo sparks in the air'
    ],
    avoid: 'Boring mundane realism, rigid linear physical constraints, flat literal descriptions, cheap drug tropes without poetic wonder.'
  },

  ancient_greek: {
    id: 'ancient_greek',
    name: 'Ancient Greek Epic',
    seedSource: 'Homeric Epics, Spartan History & Mythological Antiquity',
    voice: 'Homeric, solemn, mythic, honor-bound. Elevated prose echoing the cadence of epic poetry, divine omens, and heroic virtue.',
    atmosphere: 'Sun-baked marble temple steps, olive groves rustling in Aegean breezes, bronze hoplite round shields, smoking laurel leaves at Delphic altars, wine-dark sea cliffs.',
    sceneStructure: '1. Arrival at sacred oracle shrine or coastal mountain pass -> 2. Inspecting divine omens and preparing bronze arms -> 3. Receiving prophecy or royal decree -> 4. Heroic path choice.',
    storyBeats: 'Mythic trials and heroic destiny: consulting oracles, proving valor against monstrous trials, honoring vows to gods and companions, choosing between glorious peril and safe obscurity.',
    characterDynamics: 'Spartan champions, Delphic oracles, Athenian philosophers, Mycenaean kings, demigod wanderers.',
    encounterPatterns: 'Interpreting oracle laurel vapors, sacrificing offerings at marble altars, polishing bronze hoplite aspis shields, reciting oaths under Olympian skies.',
    sensoryMotifs: [
      'The heat of sun-baked white marble underfoot and the salt wind off the wine-dark sea',
      'The heavy, reassuring weight of a bronze round shield strapped across the forearm',
      'The fragrant, dizzying smoke of crushed laurel leaves burning on a bronze brazier',
      'The resounding clash of bronze spearheads saluting before the Spartan phalanx'
    ],
    avoid: 'Medieval European feudal knights, modern casualisms, treating Greek heroes as generic fantasy wizards.'
  },

  mythology: {
    id: 'mythology',
    name: 'Norse & World Mythology',
    seedSource: 'Norse Eddas, Celtic Cycles & Ancient World Myth Sagas',
    voice: 'Saga-like, stark, legendary, fate-woven. Features poetic kennings, deep respect for wyrd/destiny, and the elemental weight of frost, fire, and thunder.',
    atmosphere: 'Howling northern blizzards, carved runic megaliths, ravens circling frostbitten fjords, crackling mead hall hearths, auroras dancing across frozen peaks.',
    sceneStructure: '1. Standing before an ancient stone circle or fjord cliff -> 2. Reading runic megaliths or raven omens -> 3. Testing ancestral heirloom weapon -> 4. Fate-bound challenge choice.',
    storyBeats: 'Epic destiny and wyrd: honoring blood-oaths, braving frost giant domains, unraveling mythological riddles, defying doom with unwavering courage.',
    characterDynamics: 'Rune-carvers, shieldmaidens, berserkers, skaldic bards, raven emissaries of the All-Father.',
    encounterPatterns: 'Tracing weathered runes on mossy stones, pouring mead libations for the norns, interpreting twin raven flights, bracing against glacial gales.',
    sensoryMotifs: [
      'Glacial fjord winds carrying the scent of pine smoke and distant sea ice',
      'Twin black ravens calling out against the vibrant green curtain of the northern lights',
      'The cold bite of carved granite beneath fingertips tracing ancestral elder runes',
      'The thrum of an ash-wood bowstring drawn taut before the frozen ridge'
    ],
    avoid: 'Trivial modern complaints, silly cartoon Viking stereotypes, weak cowardly surrender to fate.'
  },

  real_life: {
    id: 'real_life',
    name: 'Real Life & Slice of Life',
    seedSource: 'Contemporary Urban & Professional Life Simulations',
    voice: 'Grounded, sharp, relatable, keenly observant. Emphasizes realistic human stakes, contemporary workplace dynamics, and vibrant city atmosphere.',
    atmosphere: 'Bustling Shibuya crosswalks, barista coffee grinders, tailored business suits, encrypted laptop organizers, glass skyscraper lobbies, autumn city mornings.',
    sceneStructure: '1. Morning arrival at modern workplace/venue -> 2. Setting up gear/organizer and reviewing the day\'s agenda -> 3. Key conversation with client, colleague, or rival -> 4. Decisive professional/personal choice.',
    storyBeats: 'Realistic triumph and human drama: navigating high-stakes corporate audits, solving intricate architectural or logistical puzzles, building relationships, career turning points.',
    characterDynamics: 'Security consultants, investigative journalists, corporate strategists, creative designers, seasoned mentors.',
    encounterPatterns: 'Checking in at skyscraper security desks, reviewing building floor plans over espresso, observing security turnstiles, presenting strategic proposals.',
    sensoryMotifs: [
      'Morning commuters streaming across the Shibuya crosswalk beneath towering digital billboards',
      'The rich, sharp aroma of freshly ground espresso at a busy atrium coffee bar',
      'The tactile click of a stainless steel pen on a leather-bound planner',
      'The cool polished glass and marble acoustics of a corporate headquarters lobby'
    ],
    avoid: 'Supernatural magic spells, mythical monsters, apocalyptic explosions, immersion-breaking fantasy tropes.'
  }
};

/**
 * Retrieves the full narrative profile for a category.
 */
export function getCategoryNarrativeProfile(categoryId: string): CategoryNarrativeProfile {
  const normalizedKey = (categoryId || 'fantasy').toLowerCase() as ExperienceCategory;
  return CATEGORY_NARRATIVE_PROFILES[normalizedKey] || CATEGORY_NARRATIVE_PROFILES.fantasy;
}

/**
 * Builds a compact, highly structured narrative grounding instruction block
 * containing both the genre narrative profile and relevant seed examples.
 * Injected into story generation & turn execution prompts.
 */
export function buildGroundedSeedContext(categoryId: string, userPrompt?: string): string {
  const profile = getCategoryNarrativeProfile(categoryId);
  const seed = CATEGORY_SEEDLISTS[categoryId] || CATEGORY_SEEDLISTS.fantasy;

  // Smart selection of representative seed elements
  // Shuffle to get a random mix for brainstorming
  const shuffledMedia = [...(seed.mediaReferences || [])].sort(() => 0.5 - Math.random());
  const shuffledPrompts = [...(seed.prompts || [])].sort(() => 0.5 - Math.random());

  const selectedMedia = shuffledMedia.slice(0, 4);
  const selectedPrompts = shuffledPrompts.slice(0, 3);

  return `=== [GENRE NARRATIVE CORPUS: ${profile.name.toUpperCase()}] ===
SOURCE INSPIRATION: ${profile.seedSource}
1. VOICE & TONE: ${profile.voice}
2. ATMOSPHERE & SENSORY MOTIFS: ${profile.atmosphere}
   • Sensory Anchors: ${profile.sensoryMotifs.join('; ')}
3. SCENE ARCHITECTURE: ${profile.sceneStructure}
4. STORY BEATS & PACING: ${profile.storyBeats}
5. CHARACTER DYNAMICS: ${profile.characterDynamics}
6. ENCOUNTER PATTERNS: ${profile.encounterPatterns}
7. STRICTLY AVOID: ${profile.avoid}

LEARNED CORPUS PATTERNS & BRAINSTORMING MATERIAL:
IMPORTANT ANTI-COPYING DIRECTIVE: You have been provided with media references and immersive prompts as inspiration for pacing, style, and tone. You MUST NEVER directly copy a piece of media or a prompt unless the user explicitly asks for it in their custom prompt (e.g., 'Recreate The Odyssey'). Use them to brainstorm original ideas!

- Media References (For Tone/Style/Pacing):
  ${selectedMedia.join('\n  ')}

- Immersive Prompts (For Inspiration):
  ${selectedPrompts.join('\n  ')}
======================================================`;
}
