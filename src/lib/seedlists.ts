import { TropeCategory } from '../types';

export interface CategorySeedInfo {
  categoryId: string;
  categoryName: string;
  seedSource: string;
  coreThemes: string[];
  popularTropes?: TropeCategory[];
  brainstormHooks: string[];
  narrativeTropes: string[];
  encounterSeeds: string[];
  openingHooks: {
    title: string;
    hook: string;
    suggestedActions: string[];
  }[];
}

export const CATEGORY_SEEDLISTS: Record<string, CategorySeedInfo> = {
  tiktok_drama: {
    categoryId: 'tiktok_drama',
    categoryName: 'Short Drama',
    seedSource: 'GoodNovel, ReelShot, ActDrama, DramaBox & PrimeDrama Top Tropes',
    coreThemes: [
      'Undercover Billionaire / Secret Heiress 3-Year Test',
      'The Gilded Hotel Gala & Heirloom Signet Ring',
      'Morning Shift Arrival & Arrogant Socialites',
      'Contract Marriage with the Brooding Tycoon',
      'Quiet Dignity Before the Great Revelation',
      'The Grand Patriarch\'s Private Envoy Arrives'
    ],
    popularTropes: [
      { id: 't_sec_bill', name: 'Secret Billionaire', tagline: 'Living humbly to test character before the grand reveal', premise: 'The protagonist works an entry-level job or lives in disguise to test loyalty before inheriting a $50B conglomerate.', sampleConflict: 'Arrogant rivals mock your simple clothes at the executive banquet, unaware you own the building.' },
      { id: 't_stolen_inh', name: 'Stolen Inheritance', tagline: 'Kin seizing assets while casting out the rightful heir', premise: 'A corrupt sibling forged the family charter and took everything while you were away.', sampleConflict: 'You arrive at the shareholder meeting holding the unrevoked sovereign seal.' },
      { id: 't_rejected', name: 'Rejected & Discarded', tagline: 'Cast aside for a wealthy rival, only to return sovereign', premise: 'Cast out into the rain by ungrateful in-laws, now returning as their majority creditor.', sampleConflict: 'Your ex-fiancé begs for a debt extension at your boardroom desk.' },
      { id: 't_betrayal', name: 'Betrayal & Stolen Patent', tagline: 'The trusted partner who took credit for your life\'s work', premise: 'Your business partner took the credit and had your credentials revoked.', sampleConflict: 'Their flagship product crashes because the encryption key is under your biometric.' },
      { id: 't_contract_mar', name: 'Contract Marriage', tagline: 'A temporary marriage of convenience with a brooding tycoon', premise: 'Signed a 3-year contract to protect the CEO from a hostile takeover.', sampleConflict: 'The family tries to divorce you with a $5K severance on the final day.' },
      { id: 't_abused_dau', name: 'Abused Daughter', tagline: 'The unloved child who secretly holds the sovereign crest', premise: 'Treated as a domestic helper by your adoptive family while your sister is favored.', sampleConflict: 'The imperial chairman arrives to personally salute the true heiress.' }
    ],
    brainstormHooks: [
      'The hero has spent 3 years living humbly as a barista to test true character, arriving on the final morning of the test for the grand hotel gala.',
      'A brilliant contract bride arrives at the boardroom on her first day, holding the undisclosed majority voting shares in her vintage tote bag.',
      'Stepping into the five-star restaurant for a family reunion luncheon where arrogant in-laws mock your simple clothes, unaware you own the property.',
      'The forgotten second son returns quietly from a 5-year overseas tour to visit his sister\'s bakery on the morning of a hostile development buyout.'
    ],
    narrativeTropes: [
      'Polite composure while arrogant rivals boast about minor wealth',
      'An encrypted notification on a burner phone: "Transfer of $50B approved, Chairman"',
      'The private executive bodyguard waiting discreetly at the corner',
      'Tucking a priceless family crest seal into an ordinary jacket pocket',
      'The quiet smile knowing the entire venue belongs to your trust'
    ],
    encounterSeeds: [
      'An arrogant boutique manager attempting to deny entrance',
      'A condescending socialite making snide remarks at the check-in desk',
      'An overzealous paparazzi trying to photograph arriving VIPs'
    ],
    openingHooks: [
      {
        title: 'The Secret Heiress\'s 3-Year Test: Chapter I',
        hook: 'The morning sun sparkles off the gilded glass towers of the Grand Mirage Hotel. You arrive in your simple banquet staff uniform with your grandmother\'s heirloom seal tucked inside your bag. Today marks the final day of your 3-year humble trial before stepping into the family empire.',
        suggestedActions: [
          'Review the VIP banquet seating chart to see who is arriving tonight',
          'Speak with the friendly head chef in the kitchen to prepare the room',
          'Check your phone for the arrival confirmation from your family\'s security team'
        ]
      }
    ]
  },

  revenge: {
    categoryId: 'revenge',
    categoryName: 'Revenge & Retribution',
    seedSource: 'GoodNovel, DramaBox & PrimeDrama Anti-Hero Sagas',
    coreThemes: [
      'Exiled Avenger Returning to the City',
      'The Untouched List of the Five Betrayers',
      'Tracking Informants in the Rain-Slick District',
      'Reclaiming Stolen Honor & Dismantling Corrupt Syndicates',
      'Cold Calculation over Rash Anger'
    ],
    popularTropes: [
      { id: 't_false_imp', name: 'False Imprisonment', tagline: 'Framed by corrupt barons and surviving to strike back', premise: 'You spent years in the mines after being framed for treason; now you have escaped with the syndicate ledger.', sampleConflict: 'Cornering the corrupt magistrate who signed your execution order.' },
      { id: 't_blood_oath', name: 'The Broken Blood Oath', tagline: 'Betrayed at the bridge by your closest brother-in-arms', premise: 'Your battle-brother cut your horse reins and left you for dead in the river to claim a bounty.', sampleConflict: 'Tracking him down at the garrison post as he celebrates his stolen victory.' },
      { id: 't_return_exile', name: 'Return From Exile', tagline: 'Returning with quiet wealth to buy up your rivals\' debt', premise: 'Cast out penniless, you return after a decade to methodically foreclose on the syndicate.', sampleConflict: 'Serving foreclosure notices to the council members dining at the grand inn.' },
      { id: 't_poison_cup', name: 'The Poisoned Cup', tagline: 'A beloved mentor assassinated at a public banquet', premise: 'Your master was poisoned at the summit; you possess the only matching antidote vial.', sampleConflict: 'Confronting the court assassin in the rain-soaked courtyard before he flees.' }
    ],
    brainstormHooks: [
      'Stepping off the midnight train into the city after 10 years in exile, carrying an untouched parchment list of the five officials who framed your family.',
      'Arriving in disguise at the harbor district tavern to purchase initial surveillance intel on the corrupt baron\'s trade shipments.',
      'A master assassin takes up residence in the attic across from the syndicate bank to map out the guards\' shift schedules.',
      'The disinherited heir returns with a modest fortune to quietly buy up the debt of the rivals who ruined their parents.'
    ],
    narrativeTropes: [
      'Reviewing names on a fresh parchment under the yellow glow of a streetlamp',
      'Meeting a hooded informant at a quiet corner diner table',
      'Testing the edge of a family blade before embarking into the city',
      'Rain-slicked cobblestones reflecting neon lanterns at midnight'
    ],
    encounterSeeds: [
      'A corrupt toll guard shaking down travelers at the district gate',
      'A pickpocket attempting to lift your coin purse in the crowded plaza',
      'A nervous informant asking for proof of your identity before speaking'
    ],
    openingHooks: [
      {
        title: 'The Red Vow of Iron Cross: Chapter I',
        hook: 'Steam hisses from the locomotive as you step onto the rain-slick platform of Iron Cross Central Station. In your trench coat pocket rests a crisp parchment listing the five syndicate heads who framed your guild. Tonight marks your first night back in the city after years in exile, and your underground informant has arranged a quiet meeting at a corner diner across the plaza.',
        suggestedActions: [
          'Cross the station plaza to meet your informant Jax at the diner',
          'Check your concealed blades and survey the platform for syndicate watchers',
          'Review your map of the city\'s five merchant districts to plan your route'
        ]
      }
    ]
  },

  romantic: {
    categoryId: 'romantic',
    categoryName: 'Romantic & Court Drama',
    seedSource: 'GoodNovel & PrimeDrama Passionate Dynasties & Masquerades',
    coreThemes: [
      'Arrival at the Grand Venetian Masquerade',
      'Enemies-to-Lovers Intrigue Across Rival Houses',
      'Contract Marriage with Hidden Deep Devotion',
      'Royal Court Scandals & Balcony Rendezvous',
      'Witty Banter, Stolen Glances & Moonlight Waltzes'
    ],
    popularTropes: [
      { id: 't_mask_masq', name: 'Masked Identity', tagline: 'Dancing with the brooding duke whose signature seized your estate', premise: 'Behind a velvet domino mask, you waltz with your family\'s greatest court rival.', sampleConflict: 'He whispers that he knows who you are and offers a secret deal on the moonlit balcony.' },
      { id: 't_counterfeit_bet', name: 'Counterfeit Betrothal', tagline: 'Faking a high-society romance with your sharpest rival', premise: 'To secure a massive trading charter, you must pretend to be deeply in love with your fiercest competitor.', sampleConflict: 'A rival barrister steps forward at the court ball to publicly test your love story.' },
      { id: 't_intercepted_love', name: 'Intercepted Letters', tagline: 'The mysterious poet who wooed you is actually the stoic general', premise: 'Trading intimate philosophical letters with a writer who turns out to be the most feared commander.', sampleConflict: 'Recognizing his custom watermark paper and pen in his military dispatch case.' },
      { id: 't_spite_marriage', name: 'The Spite Marriage', tagline: 'Proposing to the enemy commander to humiliate your unfaithful fiancé', premise: 'Caught your fiancé cheating; you turn and propose to the foreign ambassador on the spot.', sampleConflict: 'Announcing your new engagement loudly before the entire royal ballroom.' }
    ],
    brainstormHooks: [
      'Arriving at the grand palace steps in a silver velvet domino mask, carrying an engraved invitation to the seasonal solstice ball.',
      'Entering the diplomatic reception where you must navigate polite conversation with the brooding commander of the rival province.',
      'A court bard takes up a residency at the royal conservatory to investigate rumors of a secret royal engagement.',
      'Two rival diplomats arrive at a neutral mountain estate for treaty negotiations and must share the same parlor.'
    ],
    narrativeTropes: [
      'Adjusting an ornate mask before entering a crowded chandelier ballroom',
      'Exchanging a lingering glance across the marble reception hall',
      'A whispered invitation to stroll through the moonlit palace gardens',
      'A delicate wax-sealed letter delivered by a silent courier'
    ],
    encounterSeeds: [
      'The Grand Chamberlain inspecting invitations with meticulous scrutiny',
      'A gossiping noble matriarch attempting to pry into your family background',
      'A clumsy page spilling rosewater on the marble terrace steps'
    ],
    openingHooks: [
      {
        title: 'The Venetian Masquerade & Secret Vows: Chapter I',
        hook: 'Gilded gondolas glide along the shimmering Grand Canal under the evening lanterns of Venice. Wearing an elegant velvet mask and holding an engraved silver invitation, you step onto the marble landing of Palais de L\'Amour. From within the grand ballroom, soft violin waltzes echo across the water as noble guests begin to arrive.',
        suggestedActions: [
          'Present your engraved silver invitation to the Grand Chamberlain at the palace entrance',
          'Mingle among the arriving masquerade guests to listen for court gossip',
          'Step out onto the moonlit canal terrace to admire the palace gardens'
        ]
      }
    ]
  },

  fantasy: {
    categoryId: 'fantasy',
    categoryName: 'High Fantasy & D&D Sagas',
    seedSource: 'Classic D&D Campaigns & Iconic Fantasy Literature',
    coreThemes: [
      'Frontier Village Arrivals & Tavern Quest Summons',
      'Ancient Dragon Seals & Whispering Woods',
      'Sunken Crypts, Forgotten Catacombs & Ancient Lore',
      'Arcane Spells, Cantrips & Heritage Relics',
      'Local Rumors, Guild Bounties & Roadside Inns'
    ],
    popularTropes: [
      { id: 't_disgraced_pal', name: 'Disgraced Paladin', tagline: 'Exiled for refusing an unholy purge, defending innocent refugees', premise: 'Stripped of rank and divine crest, armed only with a notched longsword and unbroken honor.', sampleConflict: 'Inquisitorial hounds attack the refugee wagon you swore to protect.' },
      { id: 't_broken_seal', name: 'Shattered Boundary Stone', tagline: 'The ancient ward stone splits as the blood moon rises', premise: 'You arrive at a mist-covered crossroads to find the ward stone shattered and the elder clutching a bloody key.', sampleConflict: 'Monsters surge through the fractured barrier before the militia can bar the cemetery gates.' },
      { id: 't_wyrm_tooth', name: 'Sealed Dragon Relic', tagline: 'An obsidian dagger in the village smithy ignites with dragon flame', premise: 'Dropping a coal-encrusted dagger reveals an ancient dragon blade that speaks your family name.', sampleConflict: 'Dragon cult scouts surround the forge demanding the ancestral blade.' },
      { id: 't_stolen_grimoire', name: 'Stolen Archmage Grimoire', tagline: 'A fleeing apprentice thrusts a forbidden spellbook into your hands', premise: 'A wounded gnome apprentice crashes through the tavern window, chased by shadow gargoyles.', sampleConflict: 'The grimoire\'s eye opens and speaks an emergency counterspell into your mind.' }
    ],
    brainstormHooks: [
      'Arriving at the misty frontier village of Oakhaven after weeks on the road, where the village elder has posted an urgent summons outside the inn.',
      'A traveling mage stops at a secluded crossroads shrine where the ancient ward stones have begun to hum with faint violet light.',
      'A ranger enters a quiet mountain hamlet to investigate strange beast tracks leading into the enchanted whispering woods.',
      'A young knight reports to the frontier garrison to receive their very first reconnaissance assignment.'
    ],
    narrativeTropes: [
      'Warm firelight and the smell of roasted stew welcoming weary travelers into a tavern',
      'Unfurling a hand-drawn regional map across a wooden table by candlelight',
      'Checking the straps of a traveling pack and sharpening a trusty steel blade',
      'An ancient village elder clutching a sealed parchment scroll'
    ],
    encounterSeeds: [
      'The innkeeper offering hot cider in exchange for news from the capital',
      'A nervous farmer describing strange glowing lights in the northern woods',
      'A mysterious cloaked scholar studying a runic tablet in the corner booth'
    ],
    openingHooks: [
      {
        title: 'The Prophecy of Sunken Aethelgard: Chapter I',
        hook: 'The morning mist hangs low over the cobblestone crossroads of Oakhaven Village. You shoulder your traveling pack and adjust your sword at your hip after weeks on the road. Smoke rises from the chimney of the Prancing Griffin Tavern, where Village Elder Bram stands outside waiting for brave wanderers to answer his urgent summons.',
        suggestedActions: [
          'Approach Elder Bram outside the tavern to learn about the urgent summons',
          'Step into the Prancing Griffin Tavern to gather local rumors and buy supplies',
          'Inspect the ancient runic boundary stone at the village gates with an Arcana check'
        ]
      }
    ]
  },

  adventure: {
    categoryId: 'adventure',
    categoryName: 'Adventure & Swashbuckling Expeditions',
    seedSource: 'Popular Adventure Epics & High-Seas Expeditions',
    coreThemes: [
      'Arrival at Port Tempest & Harbor Expeditions',
      'Obsidian Compass Needles & Weathered Sea Charts',
      'Recruiting Trustworthy Sailors & Outfitting Sloops',
      'Uncharted Reefs, Tropical Atolls & Tide Caves',
      'Morning Tides, Trade Winds & High-Seas Thrills'
    ],
    brainstormHooks: [
      'Stepping onto the bustling wooden docks of Port Tempest with a newly purchased sea chart and an obsidian compass needle.',
      'Arriving at a coastal tavern to recruit a seasoned navigator for an expedition into uncharted waters.',
      'Inspecting supply crates and bargaining for provisions at the harbor quartermaster dock before setting sail.',
      'A young explorer discovers an enigmatic navigation diary inside an antique sea chest purchased at an auction.'
    ],
    narrativeTropes: [
      'The smell of tar, salt spray, and roasting coffee along a bustling wooden pier',
      'Unrolling a parchment sea chart weighted down with brass coins',
      'Testing the balance of a polished brass cutlass in the morning sunlight',
      'Listening to sea shanties sung by dockworkers loading cargo'
    ],
    encounterSeeds: [
      'A grizzled old sailor offering tips on navigating the outer reefs',
      'A harbor merchant haggling over the price of canvas sails and citrus barrels',
      'A curious island monkey inspecting your unattended leather satchel'
    ],
    openingHooks: [
      {
        title: 'The Obsidian Compass Expedition: Chapter I',
        hook: 'Salt spray fills the morning air as you step off the gangplank onto the bustling wooden docks of Port Tempest. In your coat pocket rests a weathered sea chart and an obsidian compass needle you recently acquired. The harbor is alive with shouting dockworkers, squawking gulls, and merchant sloops preparing for the outbound tide.',
        suggestedActions: [
          'Visit the Salty Kraken Tavern to recruit a trustworthy navigator and deckhands',
          'Examine the obsidian compass needle against the harbor landmarks with an Investigation check',
          'Inspect the supply crates at the quartermaster dock before boarding your sloop'
        ]
      }
    ]
  },

  historical_adventure: {
    categoryId: 'historical_adventure',
    categoryName: 'Historical Adventure',
    seedSource: 'High-Stakes Points in Authentic & Fictionalized World History',
    coreThemes: [
      'Dawn at the Mountain Province Checkpoint',
      'Sealed Imperial Bamboo Dispatches & Courier Missions',
      'Ancient Tea Houses, Traveling Monks & Provincial Guards',
      'Disciplined Swordsmanship & Masterless Wanderers',
      'Historical Epochs: Feudal Japan, Ancient Alexandria, Venice 1520'
    ],
    brainstormHooks: [
      'Arriving at dawn at the mountain tea house at the foot of the Kyoto pass with an imperial dispatch sealed in wax.',
      'A young scribe arrives at the Great Library of Alexandria on the morning of a major scholarly assembly.',
      'Stepping off a gondola onto the Venetian plaza at sunrise as the city awakens for the annual regatta.',
      'A courier arrives at the frontier garrison along the Silk Road with news from the imperial court.'
    ],
    narrativeTropes: [
      'Morning dew glistening on bamboo leaves beside a mountain trail',
      'Checking the unbroken wax seal on a bamboo dispatch cylinder',
      'The respectful bow exchanged between traveling warriors at a roadside shrine',
      'Sipping hot green tea while reviewing provincial travel permits'
    ],
    encounterSeeds: [
      'The tea house proprietor warning of seasonal landslides along the high ridge',
      'A traveling merchant offering woven straw sandals and dried mountain persimmons',
      'An imperial barrier guard checking identity wooden passes at the gate'
    ],
    openingHooks: [
      {
        title: 'Shadows of the Shogunate: Chapter I',
        hook: 'The first rays of sunlight pierce through the morning mist over the mountain tea house at the foot of the Kyoto Pass. You adjust the wooden straw hat keeping the morning dew off your shoulders. Secured beneath your kimono is a sealed bamboo tube containing an imperial decree that you must safely deliver to the provincial magistrate.',
        suggestedActions: [
          'Stop at the mountain tea house to ask the proprietor about the road conditions ahead',
          'Observe the imperial guard patrol stationed at the barrier gate with a Perception check',
          'Check the wax seal on your bamboo dispatch tube to ensure it remains untouched'
        ]
      }
    ]
  },

  cozy_ghibli: {
    categoryId: 'cozy_ghibli',
    categoryName: 'Cozy & Studio Ghibli-esque',
    seedSource: 'Studio Ghibli & Heartwarming Whimsical Adventures',
    coreThemes: [
      'Opening the Flying Tea Bakery at Sunrise',
      'Whimsical Spirit Foxes, Meadow Sprites & Kettle Steam',
      'Star-Flour Cinnamon Pastries & Herbal Infusions',
      'Gentle Meadow Hills, Parasol Gliders & Warm Sunshine',
      'Heartwarming Community Connections & Gentle Magic'
    ],
    brainstormHooks: [
      'Waking up in your flying clockwork tea shop as golden morning sunlight breaks over the flower-filled hills of Clover Valley.',
      'Anchoring your greenhouse airship near a peaceful hillside village to forage fresh chamomile and dew-berries.',
      'A young herbalist opens their apothecary doors on the first day of spring as cheerful soot spirits sweep the porch.',
      'Taking your parasol glider out for a morning glide over rolling green hills to deliver fresh buns to the lighthouse keeper.'
    ],
    narrativeTropes: [
      'The cheerful whistling of a polished copper tea kettle',
      'The warm aroma of fresh cinnamon and star-honey drifting through the open window',
      'A glowing spirit companion curling up contentedly on a flour sack',
      'Gentle chime bells tinkling in the soft morning breeze'
    ],
    encounterSeeds: [
      'A timid little blossom spirit peeking over the windowsill',
      'A sleepy bumblebee spirit resting inside an open sugar bowl',
      'A friendly delivery pelican dropping off a bundle of morning correspondence'
    ],
    openingHooks: [
      {
        title: 'The Flying Tea Shop & The Meadow Spirits: Chapter I',
        hook: 'Golden morning sunlight filters through the stained-glass windows of your flying clockwork tea shop. Accompanied by your glowing little spirit fox Pip, you tie on your linen apron as the kettle begins to whistle with sweet chamomile aroma. Outside the open hatch, the tea shop gently anchors near the blossom-filled hills of Clover Valley, where gentle meadow spirits are waking up.',
        suggestedActions: [
          'Bake a fresh tray of star-honey cinnamon rolls to welcome the morning spirits',
          'Step out onto the meadow grass with Pip to greet the local flower spirits',
          'Check your grandmother\'s magical recipe journal for today\'s herbal blend'
        ]
      }
    ]
  },

  horror: {
    categoryId: 'horror',
    categoryName: 'Survival Horror & Creepypasta',
    seedSource: 'r/nosleep, Classic Creepypastas & Psychological Horror Games',
    coreThemes: [
      'Arrival at the Secluded Mountain Outpost at Dusk',
      'Handwritten Caretaker Notes & Station Rulebooks',
      'Brass Oil Lanterns, Dense Pine Trees & Quiet Mist',
      'Atmospheric Suspense, Unexplained Absences & Forest Silence',
      'Baseline Camp Setup & Careful Exploration'
    ],
    brainstormHooks: [
      'Arriving at dusk at the isolated pine forest caretaker lodge to begin your seasonal forestry survey shift.',
      'Pulling your station wagon up to a quiet coastal motel where the front desk is empty except for a room key and a list of rules.',
      'A radio technician arrives at a mountain transmission tower at twilight to investigate intermittent broadcast static.',
      'A private investigator arrives at a quiet lakeside hamlet following up on an unresolved missing person case.'
    ],
    narrativeTropes: [
      'The crunch of dry autumn leaves beneath heavy hiking boots',
      'Striking a wooden match to light the amber mantle of a brass lantern',
      'The peculiar, complete absence of birdsong in the surrounding forest',
      'A neatly handwritten note pinned to the door with an antique brass thumbtack'
    ],
    encounterSeeds: [
      'A weathered park ranger signboard with half-faded trail maps',
      'An abandoned forestry truck with its headlights switched off and keys in the visor',
      'A curious stray cat sitting quietly on the porch steps watching the woods'
    ],
    openingHooks: [
      {
        title: 'The Mystery of Blackwood Ridge: Chapter I',
        hook: 'Dusk settles over the dense pines of Blackwood Ridge as the cool mountain breeze rustles the dry autumn leaves. Carrying a brass lantern and leather satchel of protective relics, you step up the wooden porch of the secluded caretaker lodge. A handwritten note tacked to the front door bears your name, left by the missing forest ranger.',
        suggestedActions: [
          'Read the handwritten note pinned to the cabin door with an Investigation check',
          'Light your brass lantern and unlock the cabin to set up your baseline camp',
          'Scan the surrounding forest tree line with your silver rosary in hand'
        ]
      }
    ]
  },

  apocalypse: {
    categoryId: 'apocalypse',
    categoryName: 'Post-Apocalypse & Wasteland Survival',
    seedSource: 'Fallout 76 & Nuclear Wasteland Tropes',
    coreThemes: [
      'Emerging from the Shelter Airlock at Sunrise',
      'Clear Horizons, Geiger Baseline & Moisture Recyclers',
      'Scavenged Tools, Patchwork Dusters & Trading Posts',
      'Trekking toward Reclaimed Settlements',
      'Vast Open Wasteland & First Steps of Survival'
    ],
    brainstormHooks: [
      'The massive hydraulic blast doors of Shelter 44 open for the first time in years, revealing a quiet sunlit valley and distant trade windmills.',
      'Waking at dawn in a fortified ridge encampment with a repaired Geiger counter and clean water canteen.',
      'A wasteland scavenger packs their gear at a desert oasis to begin a trek toward the New Horizon settlement.',
      'A caravan guard takes up position on the morning watch as pack brahmins are loaded for the day\'s trek.'
    ],
    narrativeTropes: [
      'Taking a deep breath of crisp outside air after years underground',
      'Tapping the dial of a handheld Geiger counter to confirm safe radiation levels',
      'Shading your eyes against the bright morning sun rising over the ruined ridge',
      'Checking the water level in a military canteen before heading out'
    ],
    encounterSeeds: [
      'An abandoned roadside billboard offering directions to a pre-war diner',
      'A friendly scrapper tinkering with a solar water pump beside the trail',
      'A rusted pre-war automobile with its trunk still locked'
    ],
    openingHooks: [
      {
        title: 'The Wasteland Horizon: Chapter I',
        hook: 'Hydraulic gears grind as the massive blast doors of Shelter 44 hiss open, letting in fresh desert air for the first time in years. Carrying a scavenged rifle and a calibrated Geiger counter, you step out onto the sunlit ridge overlooking the Rust Valley. In the distance, the wind turbines of the New Horizon trading outpost spin slowly against the clear blue sky.',
        suggestedActions: [
          'Check the Geiger counter readings and calibrate your moisture recycler',
          'Use your brass binoculars to scout the path down toward the New Horizon Trading Outpost',
          'Inspect the abandoned roadside checkpoint at the base of the ridge with an Investigation check'
        ]
      }
    ]
  },

  zombie: {
    categoryId: 'zombie',
    categoryName: 'Zombie Outbreak Survival',
    seedSource: 'The Walking Dead & Survival Outbreak Tropes',
    coreThemes: [
      'The First Quarantine Alert at the Medical Lab',
      'Emergency First-Aid Kits & Keycard Security',
      'Humming Fluorescent Lights & Quiet Corridors',
      'Careful Preparation Before Venturing Out',
      'Early Days of an Unfolding Epidemic'
    ],
    brainstormHooks: [
      'Working the late shift in the virology research wing of the hospital when the intercom broadcasts a sudden priority Code Silver quarantine alert.',
      'Waking up in a quiet suburban clinic on a rainy morning to find the staff in urgent emergency consultations.',
      'A police officer receives the first dispatch call about a containment issue at the downtown logistics depot.',
      'A resident in an apartment building notices emergency vehicles cordoning off the block during breakfast.'
    ],
    narrativeTropes: [
      'The steady hum of hospital ventilation units suddenly dropping into emergency power mode',
      'Securing a reinforced door with a magnetic keycard lock',
      'Checking the battery on a heavy tactical flashlight',
      'Reviewing patient triage clipboard logs with a furrowed brow'
    ],
    encounterSeeds: [
      'An automated pharmaceutical dispenser with emergency medicine locked inside',
      'A frightened nursing assistant asking what the intercom code means',
      'A sealed bio-hazard waste container with fresh intake markings'
    ],
    openingHooks: [
      {
        title: 'Outbreak Protocol: Chapter I',
        hook: 'Fluorescent lights hum peacefully in the virology research wing of St. Jude\'s Memorial Hospital. Wearing a lab coat with your security badge clipped to your pocket, you review the morning patient bloodwork. Suddenly, the hospital intercom crackles to life with a priority Code Silver alert: quarantine teams have sealed the East Wing triage unit, and staff are requested to secure their laboratory doors.',
        suggestedActions: [
          'Log into the hospital terminal to review the emergency triage intake logs with an Investigation check',
          'Gather your emergency first-aid kit and secure the laboratory keycard access',
          'Look through the reinforced hallway observation window to assess the situation'
        ]
      }
    ]
  },

  cosmic_horror: {
    categoryId: 'cosmic_horror',
    categoryName: 'Cosmic Horror & Elder Dimensions',
    seedSource: 'H.P. Lovecraft, Wayne Barlowe, Beksiński & Junji Ito',
    coreThemes: [
      'Arrival at the University Archives on a Rainy Evening',
      'Cryptic Colleague Telegrams & Untranslated Manuscripts',
      'Antique Celestial Globes & Star Charts',
      'Scholarly Investigation & Academic Mystery',
      'Quiet Ticking Clocks & The First Hints of the Unknown'
    ],
    brainstormHooks: [
      'Arriving at the Miskatonic University Library archives late on a rainy evening after receiving an urgent telegram from Professor Armitage.',
      'An astronomer receives a shipment of photographic glass plates from an Antarctic survey expedition showing an uncataloged shadow near the moon.',
      'An antique dealer is invited to appraise a private collection of Mesopotamian clay tablets in a quiet coastal manor.',
      'A museum curator unlocks the basement storage vault after hours to catalog a newly donated stone meteorite.'
    ],
    narrativeTropes: [
      'Rain drumming against leaded library windowpanes while a green banker lamp illuminates old paper',
      'The satisfying smell of aged leather and dry parchment in a silent archive',
      'Examining an intricate brass astrolabe under a magnifying lens',
      'Unfolding a telegram bearing an unfamiliar postmark and urgent handwriting'
    ],
    encounterSeeds: [
      'The elderly head archivist offering tea while retrieving the rare books key',
      'A dusty catalog drawer filled with cross-referenced index cards',
      'An antique grandfather clock chiming a low, resonant note at the half hour'
    ],
    openingHooks: [
      {
        title: 'The Shadow over Miskatonic: Chapter I',
        hook: 'Rain taps softly against the leaded glass windows of Miskatonic University Library. Clutching an umbrella and an urgent telegram from Professor Armitage, you step through the heavy oak doors into the warm, book-scented archive room. The head archivist looks up from behind his lamp-lit desk, holding a wooden key to the rare manuscript vault.',
        suggestedActions: [
          'Show Armitage\'s telegram to the head archivist to request the rare manuscript catalog',
          'Examine the antique celestial globe in the library corner for strange star markings with an Investigation check',
          'Sit at the reading desk to transcribe the notes sent in Armitage\'s letter'
        ]
      }
    ]
  },

  psychedelic_trip: {
    categoryId: 'psychedelic_trip',
    categoryName: 'Psychedelic Trip & Sensory Dimensions',
    seedSource: 'Erowid Experience Vaults & Surrealist Transcendent Media',
    coreThemes: [
      'Stepping Across the Luminous Rainbow Threshold',
      'Meadows of Synesthesia & Floating Origami Blossoms',
      'Gentle Ambient Harmonies & Crystal Chime Staffs',
      'First Steps into Expanded Consciousness',
      'Calm Wonder, Vibrant Colors & Poetic Perception'
    ],
    brainstormHooks: [
      'Taking your very first step through an iridescent doorway of light into the Meadow of Synesthesia where colors resonate as musical notes.',
      'Waking on a hill of glowing turquoise clover beneath an aurora sky where thoughts gently materialize as colorful origami birds.',
      'Crossing a crystalline bridge over a river of liquid starlight that mirrors parallel versions of the cosmos.',
      'Entering a serene garden of glass prisms where the evening breeze plays harmonic chords.'
    ],
    narrativeTropes: [
      'Feeling your breath synchronize with the gentle pulsing light of the meadow',
      'Ringing a crystal chime and watching the sound ripple as rings of violet light',
      'The ground feeling like soft, warm velvet beneath your boots',
      'Curious geometric spirit creatures watching with friendly reverence'
    ],
    encounterSeeds: [
      'A floating origami butterfly that changes color based on your thoughts',
      'A crystalline spring whose water glows with gentle golden luminescence',
      'A spiral stone path that rings like chime bells with every step'
    ],
    openingHooks: [
      {
        title: 'The Kaleidoscope Nexus: Chapter I',
        hook: 'A doorway of warm, iridescent light opens before you, dissolving the walls of the mundane world into shimmering ripples of indigo and gold. Carrying a crystal chime staff, you take your very first step across the threshold into the Meadow of Synesthesia. The air hums with gentle musical notes, and floating origami blossoms unfold in harmony with your breathing.',
        suggestedActions: [
          'Ring your crystal chime staff to harmonize with the meadow\'s ambient melody',
          'Observe the shifting fractal patterns along the rainbow river path with a Perception check',
          'Reach out gently to communicate with a floating origami spirit entity'
        ]
      }
    ]
  },

  ancient_greek: {
    categoryId: 'ancient_greek',
    categoryName: 'Ancient Greek Epics & Spartan Trials',
    seedSource: 'Ancient Greek History, Homeric Epics & Classical Mythology',
    coreThemes: [
      'Sunrise Pilgrimage to the Temple of Delphi',
      'Sacred Laurel Smoke & Oracle Prophecies',
      'Bronze Aspis Shields & Linothorax Armor',
      'Pilgrims, High Priestesses & Olympian Altars',
      'The First Step of a Demigod\'s Heroic Trials'
    ],
    brainstormHooks: [
      'Arriving at sunrise at the marble terraces of the Temple of Apollo in Delphi after three weeks of travel from Sparta to seek the oracle.',
      'A Spartan hoplite reports to the sacred olive grove of Olympia on the morning of the Panhellenic athletic and combat games.',
      'Stepping off a wooden trireme at the harbor of Athens to deliver an offering to the Parthenon.',
      'A young demigod ascends Mount Pelion to begin their training under the wise centaur Chiron.'
    ],
    narrativeTropes: [
      'Golden sunlight reflecting off polished bronze armor and spear tips',
      'The fragrance of burning laurel leaves and olive oil drifting from the temple sanctum',
      'Ascending white marble stairs worn smooth by centuries of pilgrims',
      'Offering a prayer to Athena while gripping a trusted bronze spear'
    ],
    encounterSeeds: [
      'A Spartan herald waiting on the terrace with news from the Gerousia elders',
      'A priest of Apollo offering fresh spring water to weary travelers',
      'A group of philosophers debating virtue beneath the colonnade shade'
    ],
    openingHooks: [
      {
        title: 'The Oracle\'s Prophecy: Chapter I',
        hook: 'Golden sunlight bathes the white marble columns of the Temple of Apollo on Mount Parnassus. A young Spartan hoplite bearing a bronze spear and polished aspis shield, you ascend the sacred stone stairs after a long pilgrimage. Laurel smoke drifts from the temple doorway where the high priestess Pythia prepares to deliver the morning prophecy.',
        suggestedActions: [
          'Offer a tribute of olive oil and barley at the temple altar to request an audience',
          'Speak to the Spartan herald waiting on the temple terrace for news from home',
          'Inspect the bronze dedications and mythic murals along the Sacred Way with a History check'
        ]
      }
    ]
  },

  mythology: {
    categoryId: 'mythology',
    categoryName: 'World Mythology & Occult Reading',
    seedSource: 'Norse Eddas, Egyptian Book of the Dead, Celtic Lore & Hermetic Alchemy',
    coreThemes: [
      'Beginning the Morning Watch on the Bifrost Bridge',
      'Golden Observatories, Crystal Rainbow Tiles & Heimdall',
      'Runic Silver Spears & Winged Aegis Shields',
      'Observing the Nine Realms Beneath Morning Auroras',
      'The Start of a Guardian\'s Celestial Watch'
    ],
    brainstormHooks: [
      'Reporting for your very first guard watch at the golden observatory atop the Bifrost Bridge under the shimmering northern aurora.',
      'Entering the sunlit forecourt of the Temple of Karnak in Thebes to begin your apprenticeship under the High Priest of Amun.',
      'Stepping across the mist-shrouded threshold into the Celtic fae realm of Tír na nÓg as the golden morning dew falls on heather.',
      'An alchemist lights the athanor furnace in their laboratory at dawn to begin the first stage of the Magnum Opus.'
    ],
    narrativeTropes: [
      'Prismatic light shimmering across crystalline rainbow tiles underfoot',
      'The quiet dignity of Heimdall gazing out across the vast cosmic branches',
      'Inscribing protective Nordic runes onto the boss of a silver shield',
      'Drinking a sip of honey mead from a horn before beginning a long patrol'
    ],
    encounterSeeds: [
      'Heimdall sharing a warm nod of greeting and handing you a celestial watch scroll',
      'A flock of ravens circling the golden roof of Valhalla in the distance',
      'A shimmering celestial prism spyglass mounted on the observatory balcony'
    ],
    openingHooks: [
      {
        title: 'The Bifrost Watch: Chapter I',
        hook: 'The shimmering crystalline tiles of the Bifrost Bridge glow with prismatic light beneath the morning aurora. A newly anointed Valkyrie champion carrying a runic spear and silver-winged aegis, you report to the golden observatory at the bridge\'s head. Heimdall, guardian of the realm, turns with a welcoming nod as he peers through the morning clouds toward the Nine Realms.',
        suggestedActions: [
          'Greet Heimdall and receive today\'s celestial watch assignments',
          'Peer through the golden observatory spyglass toward Midgard and Jotunheim with a Perception check',
          'Inscribe a rune of warding along your aegis shield before stepping onto your patrol route'
        ]
      }
    ]
  },

  real_life: {
    categoryId: 'real_life',
    categoryName: 'Real Life & Everyday Dilemmas',
    seedSource: 'Reddit Everyday Experiences (r/AskReddit, r/TalesFromTechSupport, r/talesfromthefrontdesk, r/antiwork)',
    coreThemes: [
      'Morning Arrival at the Downtown Corporate Headquarters',
      'Security Turnstiles, Visitor Badges & Briefcases',
      'Atrium Espresso Bars & Floor Plans',
      'Orientation Meetings & High-Stakes Consulting Assignments',
      'The First Twenty Minutes of a Crucial Day'
    ],
    brainstormHooks: [
      'Stepping through the revolving glass doors of Nexus Corporation in Shibuya on the first morning of your high-stakes security consulting assignment.',
      'Arriving 20 minutes early for the final round panel interview on the 42nd floor of a major tech tower with your portfolio in hand.',
      'Clocking into the morning shift at the airport customer service desk just as international transit schedules update.',
      'Arriving at the neighborhood community center with a folder of zoning bylaws for the annual general meeting.'
    ],
    narrativeTropes: [
      'The satisfying click of a briefcase latch opening on a marble table',
      'Sipping a warm cup of espresso while reviewing an agenda notebook',
      'Clipping a guest badge onto a lapel before passing through security turnstiles',
      'The low, busy murmur of morning professionals in a modern glass atrium'
    ],
    encounterSeeds: [
      'The friendly security guard at the reception desk verifying your appointment letter',
      'The busy barista at the atrium coffee stand wishing you luck today',
      'An elevator directory screen listing executive offices and conference rooms'
    ],
    openingHooks: [
      {
        title: 'The Shibuya Nexus Assignment: Chapter I',
        hook: 'Morning commuters stream through the crosswalk outside the gleaming glass skyscraper of Nexus Corporation in Shibuya. Wearing a tailored business suit with an encrypted digital organizer in your briefcase, you step through the revolving glass doors into the marble atrium. Today is your first day on site as the contracted security consultant, with your orientation meeting starting in twenty minutes.',
        suggestedActions: [
          'Check in at the ground-floor security reception desk to obtain your visitor badge',
          'Grab a coffee at the atrium espresso bar while reviewing the building floor plans',
          'Observe the staff security turnstiles and badge readers with an Investigation check'
        ]
      }
    ]
  }
};

/**
 * Procedurally generates a fresh, randomized seedlist with diverse tropes,
 * brainstorm concepts, and full 5-field opening hook presets.
 */
export function generateDynamicSeedlist(categoryId: string): CategorySeedInfo {
  const base = CATEGORY_SEEDLISTS[categoryId] || CATEGORY_SEEDLISTS.fantasy;

  // Shuffle and sample tropes & themes
  const shuffledThemes = [...base.coreThemes].sort(() => 0.5 - Math.random());
  const shuffledTropes = [...base.narrativeTropes].sort(() => 0.5 - Math.random());
  const shuffledBrainstorms = [...base.brainstormHooks].sort(() => 0.5 - Math.random());

  // Dynamic hook presets
  const openingHooks = (base.openingHooks && base.openingHooks.length > 0)
    ? base.openingHooks
    : [
      {
        title: `${base.categoryName}: Act I, Scene 1`,
        hook: `The morning mist clears as you step forward into the world of ${base.categoryName}. Your quest begins at the crossroads with your primary equipment ready at your side.`,
        suggestedActions: [
          'Investigate your immediate surroundings',
          'Speak with the nearest contact or local',
          'Prepare your equipment and advance'
        ]
      }
    ];

  return {
    ...base,
    coreThemes: shuffledThemes,
    narrativeTropes: shuffledTropes,
    brainstormHooks: shuffledBrainstorms,
    openingHooks
  };
}

