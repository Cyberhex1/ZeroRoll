import { ExperienceCategory } from '../types';

export interface PlayableScenarioSeed {
  id: string;
  category: ExperienceCategory;
  title: string;
  tagline: string;
  premise: string; // The causal starting situation & immediate problem
  suggestedHeroName: string;
  suggestedRole: string;
  suggestedRace: string;
  suggestedActions: string[];
}

export const SCENARIO_SEEDS_POOL: PlayableScenarioSeed[] = [
  // ==========================================
  // SHORT DRAMA (1-10)
  // ==========================================
  {
    id: 'seed_sd_01',
    category: 'tiktok_drama',
    title: 'The Stolen Inheritance',
    tagline: 'Your brother stole everything — today you arrive at the family gala.',
    premise: 'Your brother secretly transferred your rightful inheritance into his own name and spent three years treating you as disposable. This morning, you arrive at the Grand Mirage Hotel banquet where he plans to announce himself as chairman — unaware you hold the unrevoked family charter.',
    suggestedHeroName: 'Victoria Vance',
    suggestedRole: 'Disowned Heiress',
    suggestedRace: 'Corporate Sovereign',
    suggestedActions: [
      'Present your old staff pass to slip past the VIP security turnstiles.',
      'Confront your brother in the private banquet prep room before speeches begin.',
      'Contact your grandmother\'s loyal attorney to confirm the charter\'s legal hold.'
    ]
  },
  {
    id: 'seed_sd_02',
    category: 'tiktok_drama',
    title: 'The Intercepted Letters',
    tagline: 'Everyone thinks you abandoned your fiancé — someone hid every letter.',
    premise: 'Everyone in high society believes you abandoned your billionaire fiancé three years ago without a word. The truth is that his ambitious stepmother intercepted every single letter and wire transfer you sent. You have just walked into his charity auction to bid on your mother\'s stolen necklace.',
    suggestedHeroName: 'Julian Mercer',
    suggestedRole: 'Secret Benefactor',
    suggestedRace: 'Exiled Tycoon',
    suggestedActions: [
      'Raise your auction paddle to outbid the stepmother on the heirloom necklace.',
      'Catch your ex-fiancé\'s eye across the chandelier ballroom and signal for a private word.',
      'Show the original postal receipts and stamped carbon copies to his personal secretary.'
    ]
  },
  {
    id: 'seed_sd_03',
    category: 'tiktok_drama',
    title: 'The Ruined Reputation',
    tagline: 'The rival who destroyed your career is now begging for your help.',
    premise: 'Two years ago, your corrupt business partner framed you for fraud and watched you get stripped of your credentials. This morning, he stands in the doorway of your modest repair boutique, pale and desperate, begging you to decode an encrypted ledger before the cartel arrives.',
    suggestedHeroName: 'Alexander Sterling',
    suggestedRole: 'Disgraced Strategist',
    suggestedRace: 'Undercover Billionaire',
    suggestedActions: [
      'Demand he sign a written public confession before you even look at the ledger.',
      'Inspect the encrypted flash drive to see who is hunting him.',
      'Call hotel security to have him removed and alert the financial task force.'
    ]
  },
  {
    id: 'seed_sd_04',
    category: 'tiktok_drama',
    title: 'The 3-Year Contract Divorce',
    tagline: 'The contract marriage ends at midnight — and his family tries to throw you out penniless.',
    premise: 'You signed a 3-year contract marriage to shield a reclusive CEO from his scheming board. Today is the final day. His arrogant family gathers in the penthouse to serve you divorce papers and offer a measly $5,000 severance, unaware that you own the offshore trust funding his entire enterprise.',
    suggestedHeroName: 'Serena DuPont',
    suggestedRole: 'Contract Heiress',
    suggestedRace: 'Secret Chairwoman',
    suggestedActions: [
      'Quietly sign the divorce papers while sliding your offshore trust termination notice across the mahogany desk.',
      'Look directly at your stoic husband and demand he speak for himself.',
      'Instruct your private bodyguard to wheel in the audited financial binders.'
    ]
  },
  {
    id: 'seed_sd_05',
    category: 'tiktok_drama',
    title: 'The Substitute Bride',
    tagline: 'Forced to take your sister\'s place at the altar of the ruthless billionaire.',
    premise: 'When your favored twin sister fled town to avoid marrying the scarred and ruthless CEO Damien Cross, your adoptive parents forced you into the bridal gown. As the wedding bells toll, you stand at the cathedral altar, locking eyes with a man who already knows you are the wrong daughter.',
    suggestedHeroName: 'Chloe Sinclair',
    suggestedRole: 'Substitute Bride',
    suggestedRace: 'Hidden Sovereign',
    suggestedActions: [
      'Whisper the truth to Damien before saying the vows and propose a secret alliance.',
      'Maintain your composure and proceed with the ceremony while observing his bodyguards.',
      'Turn toward your adoptive parents and expose their debt scheme in front of the congregation.'
    ]
  },
  {
    id: 'seed_sd_06',
    category: 'tiktok_drama',
    title: 'The Secret Patent',
    tagline: 'They fired you for incompetence — but your patent powers their entire IPO.',
    premise: 'The board voted to terminate you from your chief research post, claiming your project was a complete failure. As you pack your cardboard box, the emergency fire alarms chime: their flagship product launch just crashed because the proprietary encryption key is registered under your personal biometric signature.',
    suggestedHeroName: 'Marcus Fairfax',
    suggestedRole: 'Lead Architect',
    suggestedRace: 'Tech Sovereign',
    suggestedActions: [
      'Continue walking out the glass lobby doors while executive phones start ringing frantically.',
      'Turn back to the board room and state your new terms: 51% controlling equity.',
      'Log into your secure laptop terminal to monitor the crashing server logs.'
    ]
  },
  {
    id: 'seed_sd_07',
    category: 'tiktok_drama',
    title: 'The Morning Shift Reveal',
    tagline: 'Working the hotel espresso counter when your condescending in-laws walk in.',
    premise: 'To fulfill your grandfather\'s final test of humility, you have worked three years as a barista at the Grand Mirage. This morning, your ex-fiancé\'s family enters, mocking your uniform and demanding table service — moments before a convoy of black mayoral limousines pulls up to salute you.',
    suggestedHeroName: 'Sienna Sterling',
    suggestedRole: 'Undercover Heiress',
    suggestedRace: 'Billionaire Sovereign',
    suggestedActions: [
      'Serve their espressos with cold, flawless professional grace.',
      'Discreetly tap your encrypted earpiece to authorize the convoy\'s arrival.',
      'Hand your ex-fiancé a napkin inscribed with his father\'s overdue loan balance.'
    ]
  },
  {
    id: 'seed_sd_08',
    category: 'tiktok_drama',
    title: 'The Disowned Daughter\'s Return',
    tagline: 'Thrown out of the family mansion in the rain — returning five years later.',
    premise: 'Five years ago, you were framed for stealing the family heirloom brooch and cast out into the winter rain with ten dollars. Today, you step out of a chauffeured Maybach at the estate gates, holding the foreclosed deed to the entire property.',
    suggestedHeroName: 'Elena Romanov',
    suggestedRole: 'Avenging Heiress',
    suggestedRace: 'Estate Sovereign',
    suggestedActions: [
      'Hand the foreclosure eviction notice to the stunned estate butler.',
      'Walk past the gatekeeper straight into the dining room where the family is having breakfast.',
      'Inspect the vintage brooch now worn proudly by your scheming stepsister.'
    ]
  },
  {
    id: 'seed_sd_09',
    category: 'tiktok_drama',
    title: 'The False Paternity Trap',
    tagline: 'Falsified DNA tests stripped your child of their birthright.',
    premise: 'Four years ago, your corrupt mother-in-law forged a DNA test to brand your newborn illegitimate and expel you from the dynasty. This morning, the state forensic lab director personally delivers the unsealed original test results directly to the patriarch\'s hospital bedside in your presence.',
    suggestedHeroName: 'Vivian Zhao',
    suggestedRole: 'Dynasty Matriarch',
    suggestedRace: 'Corporate Heir',
    suggestedActions: [
      'Place the unsealed state forensic report onto the patriarch\'s bedside table.',
      'Block the mother-in-law from entering the private ICU suite.',
      'Demand an immediate public press conference to restore your child\'s legal rights.'
    ]
  },
  {
    id: 'seed_sd_10',
    category: 'tiktok_drama',
    title: 'The Undercover Chairman',
    tagline: 'Inspecting your newly acquired conglomerate as an entry-level intern.',
    premise: 'Having quietly purchased 60% of the bankrupt Vanguard Media Group, you disguise yourself as an entry-level copywriter on day one. Within ten minutes, the arrogant branch manager steals your proposal, takes credit in the executive elevator, and threatens to fire you.',
    suggestedHeroName: 'Sebastian Cole',
    suggestedRole: 'Secret Chairman',
    suggestedRace: 'Vanguard Owner',
    suggestedActions: [
      'Let him present your pitch to the boardroom, then ask the technical questions only the author knows.',
      'Pull out your personal platinum executive keycard and unlock the Chairman suite door.',
      'Send a discreet memo to the chief auditor to freeze the branch manager\'s corporate accounts.'
    ]
  },

  // ==========================================
  // REVENGE & RETRIBUTION (11-18)
  // ==========================================
  {
    id: 'seed_rev_01',
    category: 'revenge',
    title: 'The Poisoned Cup',
    tagline: 'Your mentor was poisoned at the council dinner — you have the antidote vial.',
    premise: 'At the high council banquet, your revered master collapsed clutching his throat from nightshade poison. In the ensuing panic, you spotted the city magistrate slipping an empty glass vial into his velvet sleeve. You slip out into the rainy courtyard to intercept him.',
    suggestedHeroName: 'Cassian Graves',
    suggestedRole: 'Shadow Avenger',
    suggestedRace: 'Exiled Blade',
    suggestedActions: [
      'Corner the magistrate near the carriage mews with your dagger drawn.',
      'Search the banquet pantry for the remaining poison bottle to secure hard evidence.',
      'Administer your universal charcoal antidote to your mentor before time runs out.'
    ]
  },
  {
    id: 'seed_rev_02',
    category: 'revenge',
    title: 'The Syndicate Ledger',
    tagline: 'Seven corrupt barons signed the order for your execution. You have the book.',
    premise: 'Five years in the salt mines gave you time to plan. You have broken into the syndicate\'s iron vault and retrieved the blood-stained ledger listing the seven city officials who framed you and slaughtered your guild. The first name on the list is dining at the Black Boar Tavern tonight.',
    suggestedHeroName: 'Rowan Blackwood',
    suggestedRole: 'Vengeful Rogue',
    suggestedRace: 'Mine Survivor',
    suggestedActions: [
      'Take a shadowy booth in the Black Boar Tavern to observe the target\'s bodyguard rotation.',
      'Bribe the tavern scullery boy to slip truth-serum into the baron\'s spiced wine.',
      'Climb to the tavern rafters to prepare a silent assassination strike from above.'
    ]
  },
  {
    id: 'seed_rev_03',
    category: 'revenge',
    title: 'The Burned Homestead',
    tagline: 'The mercenary captain who burned your village just rode into the garrison.',
    premise: 'You survived the raid by hiding inside the stone grain silo. Ten years later, after mastering the broadsword in the northern legion, you recognize the skull-engraved armor of the warlord riding through the border garrison gate with an imperial convoy.',
    suggestedHeroName: 'Theron Vane',
    suggestedRole: 'Garrison Swordsman',
    suggestedRace: 'Ashen Survivor',
    suggestedActions: [
      'Challenge the warlord to an honorable duel in the garrison practice ring.',
      'Follow the convoy to discover which corrupt commander granted him imperial pardon.',
      'Sabotage the convoy\'s saddle girths and weapon racks before nightfall.'
    ]
  },
  {
    id: 'seed_rev_04',
    category: 'revenge',
    title: 'The False Oath',
    tagline: 'Betrayed at the bridge and left for dead in the river.',
    premise: 'Your battle-brother swore a sacred blood oath to protect your flank, then severed your horse\'s reins and pushed you off the stone bridge to claim the royal bounty for himself. You washed ashore downstream with cracked ribs, your bow still intact.',
    suggestedHeroName: 'Kaelen Thorne',
    suggestedRole: 'Guerilla Scout',
    suggestedRace: 'River Born',
    suggestedActions: [
      'Track his horse tracks along the muddy river road toward the royal outpost.',
      'Set an archer\'s deadfall ambush in the narrow willow ravine ahead of him.',
      'Seek refuge in the river hermit\'s hut to dress your wounds and fletch poisoned arrows.'
    ]
  },
  {
    id: 'seed_rev_05',
    category: 'revenge',
    title: 'The Frame-Up in Cell 4',
    tagline: 'Framed for high treason by the grand inquisitor.',
    premise: 'The grand inquisitor fabricated a letter in your handwriting to accuse you of plotting against the throne, taking your family estate as confiscation. As the dungeon guards change shift during a lightning storm, a sympathetic turnkey unlocks your iron shackles.',
    suggestedHeroName: 'Damian Cross',
    suggestedRole: 'Escaped Knight',
    suggestedRace: 'Noble Inmate',
    suggestedActions: [
      'Knock out the drunken relief guard and seize his keyring and crossbow.',
      'Infiltrate the inquisitor\'s scriptorium to recover the forged parchment letter.',
      'Escape through the castle sewer flume into the fog-covered moat.'
    ]
  },
  {
    id: 'seed_rev_06',
    category: 'revenge',
    title: 'The Iron Vault Heist',
    tagline: 'Reclaiming the ancestral seal stolen by the merchant cartel.',
    premise: 'The Goldcrest Cartel bankrupted your merchant house through counterfeit promissory notes and locked your family\'s ancestral signet seal inside their clockwork vault. Tonight, during their annual solstice masquerade, you infiltrate the counting house.',
    suggestedHeroName: 'Valerie Vance',
    suggestedRole: 'Master Infiltrator',
    suggestedRace: 'Bankrupt Noble',
    suggestedActions: [
      'Pick the twin lever locks on the counting house ventilation shaft.',
      'Disguise yourself as a cartel wine steward to slip into the private vault corridor.',
      'Place smoke canisters in the ballroom to trigger a controlled evacuation.'
    ]
  },
  {
    id: 'seed_rev_07',
    category: 'revenge',
    title: 'The Stolen Credit',
    tagline: 'The court alchemist stole your cure and let the prince name him savior.',
    premise: 'You spent seven years in isolation distilling the panacea for the king\'s wasting plague. Your apprentice stole the crystal flask, presented it at court, and received a barony. You have arrived at the capital just as the king awards him the royal seal.',
    suggestedHeroName: 'Orlaith Mor',
    suggestedRole: 'Apothecary Master',
    suggestedRace: 'Wildwood Scholar',
    suggestedActions: [
      'Step before the royal dais and state the exact missing reagent that will cause the fake panacea to spoil in three days.',
      'Slip into the apprentice alchemist\'s laboratory to seize your original research journals.',
      'Confront your former apprentice in the palace garden under moonlight.'
    ]
  },
  {
    id: 'seed_rev_08',
    category: 'revenge',
    title: 'The Blood-Stained Banner',
    tagline: 'The commander who gave the order to retreat into the slaughter.',
    premise: 'At the Battle of Red Ridge, your captain blew the retreat horn prematurely, locking the fortress gates from the inside and trapping your entire vanguard outside the walls. You survived under the pile of fallen banners and have walked three weeks to reach the captain\'s victory banquet.',
    suggestedHeroName: 'Garrick Stone',
    suggestedRole: 'Vanguard Veteran',
    suggestedRace: 'Frontier Warrior',
    suggestedActions: [
      'Toss the blood-stained vanguard banner onto the center of the captain\'s feast table.',
      'Call upon the surviving common soldiers in the garrison to witness his cowardice.',
      'Draw your sidearm and demand a court-martial by combat.'
    ]
  },

  // ==========================================
  // ROMANTIC & COURT DRAMA (19-25)
  // ==========================================
  {
    id: 'seed_rom_01',
    category: 'romantic',
    title: 'The Midnight Masquerade',
    tagline: 'Dancing with the brooding duke who condemned your family.',
    premise: 'Beneath a velvet domino mask at the Venetian Doge\'s gala, you are swept into a waltz by Duke Sterling — the cold commander whose signature seized your family estates. As his gloved hand rests on yours, he whispers that he knows who you are and wants to make a deal.',
    suggestedHeroName: 'Genevieve Valois',
    suggestedRole: 'Masked Noblewoman',
    suggestedRace: 'Venetian Aristocrat',
    suggestedActions: [
      'Match his steps in the waltz while demanding to know what deal could possibly undo his treason.',
      'Steer the dance toward the moonlit balcony to speak away from prying courtiers.',
      'Slip your concealed stiletto against his waistline to test his composure.'
    ]
  },
  {
    id: 'seed_rom_02',
    category: 'romantic',
    title: 'The Counterfeit Betrothal',
    tagline: 'Faking a high-society romance with your sharpest courtroom rival.',
    premise: 'To secure a massive maritime trading concession, you and your fiercest legal rival, Lord Julian, must convince the high tribunal that you are passionately betrothed. At the opening reception, a rival barrister steps forward to challenge your love story.',
    suggestedHeroName: 'Rosalind Claire',
    suggestedRole: 'High Court Barrister',
    suggestedRace: 'Provincial Elite',
    suggestedActions: [
      'Laugh charmingly, take Julian\'s arm, and fabricate a romantic first-meeting anecdote.',
      'Whisper sharp tactical instructions into Julian\'s ear while smiling for the socialites.',
      'Present the joint maritime charter bearing both your forged wax seals.'
    ]
  },
  {
    id: 'seed_rom_03',
    category: 'romantic',
    title: 'The Intercepted Love Letters',
    tagline: 'The poet who wooed you through parchment is actually the stoic general.',
    premise: 'For six months, you have traded brilliant, intimate philosophical letters with a mysterious poet signed "A.S." Tonight at the royal garden gala, you accidentally discover the identical custom watermark paper and fountain pen inside General Alexander Sterling\'s dispatch case.',
    suggestedHeroName: 'Cecilia Thorne',
    suggestedRole: 'Royal Archivist',
    suggestedRace: 'Court Scholar',
    suggestedActions: [
      'Quote a line from his latest letter to him and watch his stoic expression shatter.',
      'Slip a coded reply into his dispatch case before he returns from speaking with the king.',
      'Ask him why the most feared general in the empire writes love poetry by candlelight.'
    ]
  },
  {
    id: 'seed_rom_04',
    category: 'romantic',
    title: 'The Spite Marriage',
    tagline: 'Proposing to the enemy commander to humiliate your unfaithful fiancé.',
    premise: 'Minutes after discovering your aristocratic fiancé embracing your cousin behind the ballroom curtains, you turn to find the imposing foreign ambassador Lord Vane watching with amusement. In a flash of defiance, you offer him your hand and family alliance on the spot.',
    suggestedHeroName: 'Aurelia Sterling',
    suggestedRole: 'Defiant Heiress',
    suggestedRace: 'Imperial Aristocrat',
    suggestedActions: [
      'Announce the engagement to Lord Vane loudly in front of the entire ballroom.',
      'Pull Lord Vane onto the terrace to negotiate the private terms of your marriage contract.',
      'Watch your unfaithful ex-fiancé turn pale as the ambassador accepts with a slow smile.'
    ]
  },
  {
    id: 'seed_rom_05',
    category: 'romantic',
    title: 'The Governess\'s Secret',
    tagline: 'Hired to tutor the reclusive lord\'s ward — with a price on your head.',
    premise: 'Hiding from a corrupt magistrate under the guise of an unassuming French tutor, you arrive at the windswept coastal manor of Lord Gabriel Vance. Within an hour, he catches you translating an ancient cipher you were never supposed to understand.',
    suggestedHeroName: 'Camille Laurent',
    suggestedRole: 'Disguised Cipherist',
    suggestedRace: 'Fugitive Scholar',
    suggestedActions: [
      'Offer to decipher the rest of his late father\'s journal in exchange for sanctuary.',
      'Maintain your innocent governess facade and feign ignorance of the language.',
      'Slip out to the seaside cliffs to verify your escape route if he calls the authorities.'
    ]
  },
  {
    id: 'seed_rom_06',
    category: 'romantic',
    title: 'The Stolen Heirloom Fan',
    tagline: 'Recovering your grandmother\'s ivory fan from a dashing jewel thief.',
    premise: 'At the midnight opera in Vienna, a notorious gentleman thief steals the carved ivory fan that conceals your family\'s sovereign signet. You corner him in the velvet curtained royal box, only for him to offer an irresistible partnership instead of a fight.',
    suggestedHeroName: 'Vivienne Moreau',
    suggestedRole: 'Diplomatic Envoy',
    suggestedRace: 'Viennese Noble',
    suggestedActions: [
      'Hold him at stiletto-point and demand the ivory fan back immediately.',
      'Listen to his proposal regarding the corrupt minister sitting in Box 4.',
      'Signal the opera house guards while keeping him occupied in conversation.'
    ]
  },
  {
    id: 'seed_rom_07',
    category: 'romantic',
    title: 'The Rival Architects',
    tagline: 'Competing for the royal cathedral commission with the man you once loved.',
    premise: 'The king announces an open competition to design the Grand Basilica of the Sun. Your fiercest competitor across the drafting tables is Lucas DuPont — your former mentor and the only person who knows why you left the academy seven years ago.',
    suggestedHeroName: 'Beatrice Fontaine',
    suggestedRole: 'Master Architect',
    suggestedRace: 'Guild Prodigy',
    suggestedActions: [
      'Unroll your revolutionary vaulted dome blueprint before the royal jury.',
      'Meet Lucas by the moonlit construction quarry to settle old scores.',
      'Inspect his blueprints to verify if he is still using the load-bearing formula you co-created.'
    ]
  },

  // ==========================================
  // HIGH FANTASY & D&D (26-35)
  // ==========================================
  {
    id: 'seed_fan_01',
    category: 'fantasy',
    title: 'The Shattered Boundary Stone',
    tagline: 'The frontier ward is broken and the village elder holds a bloody key.',
    premise: 'You arrive at the mist-covered crossroads of Oakhaven at twilight. The ancient glowing runic boundary stone has been split cleanly by dark iron, and the terrified village elder clutches a bloody bronze key, begging you to descend into the crypt before the blood moon rises.',
    suggestedHeroName: 'Eldrin Sunstrider',
    suggestedRole: 'Eldritch Bladesinger',
    suggestedRace: 'High Elf',
    suggestedActions: [
      'Examine the fractured boundary stone with an Arcana Check to identify the spell residue.',
      'Question the elder about who gave him the bronze key and where the guards have gone.',
      'Draw your ancestral blade and lead the nervous militia toward the cemetery gate.'
    ]
  },
  {
    id: 'seed_fan_02',
    category: 'fantasy',
    title: 'The Sealed Wyrm\'s Tooth',
    tagline: 'An ancient obsidian dagger pulses with dragon fire in the village smithy.',
    premise: 'While having your horse reshod at the Ironforge anvil, an apprentice drops an ancient obsidian dagger unearthed from the coal bin. The blade ignites with searing dragon flame, burning runic verses into the stone floor that call out your true family surname.',
    suggestedHeroName: 'Kaelen Drake',
    suggestedRole: 'Dragon Knight',
    suggestedRace: 'Human Veteran',
    suggestedActions: [
      'Grasp the hilt with your gauntlet and test if your dragon-blood grants fire immunity.',
      'Extinguish the flame with forge quench-water and study the inscribed verses.',
      'Bar the forge doors as dark cult scouts circle the outer perimeter.'
    ]
  },
  {
    id: 'seed_fan_03',
    category: 'fantasy',
    title: 'The Disgraced Paladin\'s Oath',
    tagline: 'Stripped of holy rank for refusing to purge an innocent village.',
    premise: 'The High Inquisitor broke your silver holy symbol and cast you out of the Radiant Order for sparing a village of tiefling refugees. Now, armed only with a notched steel longsword and your unyielding faith, you spot the Inquisitor\'s elite inquisitorial hounds hunting the very children you saved.',
    suggestedHeroName: 'Sir Gareth Vale',
    suggestedRole: 'Oath of Devotion Paladin',
    suggestedRace: 'Human Exile',
    suggestedActions: [
      'Interpose your steel shield between the hunting hounds and the refugee wagon.',
      'Cast Divine Favor on your blade and prepare a defensive stand at the stone bridge.',
      'Lead the refugees through the concealed briar trail into the ancient fey woods.'
    ]
  },
  {
    id: 'seed_fan_04',
    category: 'fantasy',
    title: 'The Sunken Temple of the Tides',
    tagline: 'The tide recedes only once every fifty years — revealing the obsidian portal.',
    premise: 'As the great eclipse begins, the ocean recedes three miles from the harbor docks, exposing the coral-encrusted steps of the Sunken Temple of Moradin. Armed with a brass water-breathing charm and a tide chart, you race against sea cultists to reach the sunken sanctum before the ocean returns.',
    suggestedHeroName: 'Lyra Deepgale',
    suggestedRole: 'Storm Sorcerer',
    suggestedRace: 'Half-Elf',
    suggestedActions: [
      'Sprint across the wet sand dunes to reach the temple entrance ahead of the cultists.',
      'Cast Thunderwave to scatter the amphibious sahuagin scouts guarding the archway.',
      'Read the glowing tideshift glyphs to calculate how many minutes remain before flood tide.'
    ]
  },
  {
    id: 'seed_fan_05',
    category: 'fantasy',
    title: 'The Stolen Spellbook of Mordenkainen',
    tagline: 'A wizard\'s apprentice flees into your tavern with an archmage\'s grimoire.',
    premise: 'A wounded gnome apprentice crashes through the frosted tavern window, thrusting a chain-bound leather grimoire into your hands. As shadow gargoyles land on the tavern roof, the book\'s eye opens and speaks directly into your mind.',
    suggestedHeroName: 'Zephyr Blackthorn',
    suggestedRole: 'Abjuration Wizard',
    suggestedRace: 'Gnome Prodigy',
    suggestedActions: [
      'Cast Shield as the first gargoyle crashes through the timber ceiling.',
      'Open the grimoire to unleash its stored counterspell against the summoner outside.',
      'Rally the tavern patrons to barricade the cellar and extinguish all light.'
    ]
  },
  {
    id: 'seed_fan_06',
    category: 'fantasy',
    title: 'The Necromancer\'s Tollgate',
    tagline: 'The mountain pass is guarded by spectral sentinels demanding blood-coins.',
    premise: 'The only road across the Frozen Spine pass is now fortified by a renegade necromancer who charges travelers with memories and blood-coins. As a blizzard sets in, you find an abandoned wagon train at the barrier with one surviving child hidden in the chest.',
    suggestedHeroName: 'Vespera Nightshade',
    suggestedRole: 'Shadow Sorceress',
    suggestedRace: 'Tiefling',
    suggestedActions: [
      'Channel dark vision to scout the necromancer\'s bone-scaffold watchtowers.',
      'Feed healing tea to the frozen child and warm her by a magical spark.',
      'Step forward to the toll archway and display your sovereign arcane sigil.'
    ]
  },
  {
    id: 'seed_fan_07',
    category: 'fantasy',
    title: 'The Cursed Forest Heart',
    tagline: 'The Great Oak is weeping black sap — and the dryads have gone blind.',
    premise: 'Deep in the Whispering Woods, the ancient Elder Tree is bleeding corrupted ichor into the river. The guardian dryads wander blind and maddened, attacking any traveler who approaches. You discover an iron dagger driven directly into the heartwood root.',
    suggestedHeroName: 'Bramble Thorne',
    suggestedRole: 'Circle of the Moon Druid',
    suggestedRace: 'Wood Elf',
    suggestedActions: [
      'Wild Shape into a dire wolf to leap over the thorny brambles toward the root.',
      'Commune with nature spirits using Druidcraft to soothe the frantic dryads.',
      'Grasp the cursed iron dagger and channel Nature\'s Wrath to draw it out.'
    ]
  },
  {
    id: 'seed_fan_08',
    category: 'fantasy',
    title: 'The Alchemist\'s Golden Plague',
    tagline: 'Victims are slowly turning to solid, living gold.',
    premise: 'In the mining city of Goldcrest, a strange contagion is spreading from the royal vaults: victims\' skin slowly crystallizes into solid, reflective gold, freezing their joints while keeping their minds fully aware. The Guildmaster has locked the city gates.',
    suggestedHeroName: 'Aurelius Kane',
    suggestedRole: 'Alchemical Inquisitor',
    suggestedRace: 'Dwarf Scholar',
    suggestedActions: [
      'Examine an infected miner\'s golden arm with your jeweler\'s glass and reagent kit.',
      'Confront the Guildmaster in the counting house about the imported transmutation dust.',
      'Brew a sulfur-mercury counter-agent before the contagion spreads to the drinking wells.'
    ]
  },
  {
    id: 'seed_fan_09',
    category: 'fantasy',
    title: 'The Celestial Comet Shard',
    tagline: 'A fallen star crashes into the frontier monastery courtyard.',
    premise: 'A blazing silver comet strikes the courtyard of St. Jude\'s Monastery at midnight, leaving a crater filled with celestial starlight glass. As the monks begin chanting in terror, celestial heralds and abyss demons converge simultaneously on the glowing crater.',
    suggestedHeroName: 'Seraphina Dawn',
    suggestedRole: 'Celestial Warlock',
    suggestedRace: 'Aasimar',
    suggestedActions: [
      'Grasp the glowing starlight shard and absorb its radiant power into your arcane focus.',
      'Erect a sacred protective circle around the wounded monks.',
      'Confront the descending abyss demon commander before he reaches the crater rim.'
    ]
  },
  {
    id: 'seed_fan_10',
    category: 'fantasy',
    title: 'The Ghost Ship of the Iron Shoals',
    tagline: 'An elven galleon drifts into harbor with sails of green witchlight.',
    premise: 'An ancient elven galleon thought lost for three centuries drifts silently into the harbor on an unnatural fog. Its hull is pristine, its lanterns burn with cold green flame, and the ship\'s logbook sits open on the captain\'s table with wet ink recording your arrival.',
    suggestedHeroName: 'Captain Corin Drake',
    suggestedRole: 'Swashbuckler Rogue',
    suggestedRace: 'Half-Elf Sailor',
    suggestedActions: [
      'Board the ghost galleon via the rope ladder with your cutlass drawn.',
      'Read the freshly written ink entry in the captain\'s leather logbook.',
      'Inspect the cargo hold where glowing runic crates hum in harmony with the sea.'
    ]
  },

  // ==========================================
  // SURVIVAL HORROR & CREEPYPASTA (36-45)
  // ==========================================
  {
    id: 'seed_hor_01',
    category: 'horror',
    title: 'The Fire Lookout Rules',
    tagline: 'A handwritten list of 7 rules pinned to the ranger cabin door.',
    premise: 'You take up the lone night shift at Tower 9 deep in Blackwood Forest. Pinned to the timber door with a brass thumbtack is a handwritten note from the missing ranger: "Rule 1: If the radio plays a waltz, cut the power. Rule 2: Never answer the knock after 2:14 AM." The clock strikes 2:13 AM.',
    suggestedHeroName: 'Jack Miller',
    suggestedRole: 'Fire Lookout Ranger',
    suggestedRace: 'Human Survivor',
    suggestedActions: [
      'Check the generator fuel level and locate the main breaker switch.',
      'Look out the panoramic tower windows into the pitch-black pine treeline with binoculars.',
      'Arm yourself with the station flare gun and double-bolt the reinforced trapdoor.'
    ]
  },
  {
    id: 'seed_hor_02',
    category: 'horror',
    title: 'The Midnight Radio Frequency',
    tagline: 'An amateur radio picking up broadcasts from ten minutes into the future.',
    premise: 'While tuning an antique ham radio in your storm cellar, you find a broadcast on 104.7 MHz that describes your exact movements ten minutes in advance. The announcer just stated: "At 11:42 PM, the cellar bulkhead was violently torn open from the outside."',
    suggestedHeroName: 'Sarah Jenkins',
    suggestedRole: 'Radio Technician',
    suggestedRace: 'Civilian Survivor',
    suggestedActions: [
      'Brace the cellar storm doors with heavy wooden beams and iron chains.',
      'Speak directly into the microphone on 104.7 MHz to see if the voice responds.',
      'Grab your emergency flashlight, shotgun, and escape through the hidden coal chute.'
    ]
  },
  {
    id: 'seed_hor_03',
    category: 'horror',
    title: 'The Unopened Cellar',
    tagline: 'The inheritance deed forbade opening the basement under any circumstance.',
    premise: 'You inherited your great-aunt\'s Victorian estate with one legal condition: the basement iron door must never be unlocked. On your first night, you discover the iron padlock has been cut from the inside, and wet footprints lead up the carpeted hallway toward your bedroom.',
    suggestedHeroName: 'Claire Redgrave',
    suggestedRole: 'Estate Heir',
    suggestedRace: 'Investigator',
    suggestedActions: [
      'Follow the wet footprints down the hallway with your heavy brass flashlight.',
      'Check the locks on your bedroom door and prepare a defensive weapon.',
      'Descend the cellar stairs to discover what broke out of the subterranean chamber.'
    ]
  },
  {
    id: 'seed_hor_04',
    category: 'horror',
    title: 'The Submerged Village',
    tagline: 'A reservoir drought exposes the church steeple and ringing bell.',
    premise: 'A summer heatwave drains the mountain reservoir, revealing the sunken roofs of Ravenstone village, flooded sixty years ago. At dusk, the drowned church bell begins tolling across the mud flats, and lanterns flicker in the mud-caked windows beneath the waterline.',
    suggestedHeroName: 'Dr. Martin Cross',
    suggestedRole: 'Hydrologist',
    suggestedRace: 'Academic',
    suggestedActions: [
      'Walk across the cracked mud flats toward the exposed church steeple.',
      'Inspect the historical municipal flood map to check who remained behind in 1964.',
      'Listen to the acoustic echoes with your directional microphone gear.'
    ]
  },
  {
    id: 'seed_hor_05',
    category: 'horror',
    title: 'The Doppelganger at the Station',
    tagline: 'Your identical double walks off the midnight train wearing your jacket.',
    premise: 'Waiting on the fog-drenched platform for your train, you watch a passenger step off wearing your exact coat, carrying your leather briefcase, and greeting your coworkers by name. As they walk away together, the double turns and winks at you from across the tracks.',
    suggestedHeroName: 'David Mercer',
    suggestedRole: 'Commuter',
    suggestedRace: 'Investigator',
    suggestedActions: [
      'Follow the double silently through the fog-covered station arcade.',
      'Check your briefcase contents to see what identical items you still possess.',
      'Call your partner\'s cell phone to see who answers on the other end.'
    ]
  },
  {
    id: 'seed_hor_06',
    category: 'horror',
    title: 'The Highway That Never Ends',
    tagline: 'Mile Marker 47 keeps reappearing every five minutes.',
    premise: 'Driving through the desert at 3:00 AM, your car passes Mile Marker 47 for the fourth time. The GPS reads "Recalculating... 0 miles to destination," and the only roadside building is a diner where every patron is staring motionless at the front door.',
    suggestedHeroName: 'Emily Vance',
    suggestedRole: 'Courier',
    suggestedRace: 'Night Driver',
    suggestedActions: [
      'Pull into the diner parking lot with your engine idling and doors locked.',
      'Turn the car around and drive in reverse to test the boundary physics.',
      'Step inside the diner with your tire iron and address the stationary patrons.'
    ]
  },
  {
    id: 'seed_hor_07',
    category: 'horror',
    title: 'The Hospital Ward 4B',
    tagline: 'The elevator opens on a floor that was demolished in 1988.',
    premise: 'Taking the service elevator to the ICU on night shift, the buttons short out and the doors slide open to Ward 4B — smelling of carbolic acid and lit by flickering yellow incandescent bulbs. Old charts on the nurses\' desk list patients admitted today.',
    suggestedHeroName: 'Nurse Rachel Cole',
    suggestedRole: 'Night Shift Nurse',
    suggestedRace: 'Medical Staff',
    suggestedActions: [
      'Press the emergency alarm button inside the elevator cab.',
      'Read the first patient clipboard on the wooden nurses\' station desk.',
      'Use your penlight to follow the linoleum corridor toward the red exit sign.'
    ]
  },
  {
    id: 'seed_hor_08',
    category: 'horror',
    title: 'The Taxidermist\'s Ledger',
    tagline: 'Animals in the display cases are breathing in sync with your pulse.',
    premise: 'Seeking shelter from a torrential thunderstorm in an eccentric taxidermist\'s antique shop, you notice the mounted wolves and ravens in the glass cases are subtly expanding and contracting their chests in perfect rhythm with your own heartbeat.',
    suggestedHeroName: 'Liam O\'Connor',
    suggestedRole: 'Antique Appraiser',
    suggestedRace: 'Survivor',
    suggestedActions: [
      'Hold your breath to see if the mounted wolf\'s breathing stops.',
      'Search the taxidermist\'s desk for the workshop cellar key.',
      'Sprint for the front door before the display case latches click open.'
    ]
  },
  {
    id: 'seed_hor_09',
    category: 'horror',
    title: 'The Flesh-Sculptor\'s Doll',
    tagline: 'The porcelain doll on your nightstand has real human teeth.',
    premise: 'You bought an antique Victorian doll at an estate sale for thirty dollars. While cleaning the porcelain face under your desk lamp, you notice the teeth inside its parted porcelain lips are genuine human teeth with silver fillings.',
    suggestedHeroName: 'Hannah Abbott',
    suggestedRole: 'Restorer',
    suggestedRace: 'Antiquarian',
    suggestedActions: [
      'Inspect the doll\'s maker mark stamped under the porcelain neckline.',
      'Wrap the doll in heavy burlap and lock it inside the iron footlocker.',
      'Contact the estate executor to demand the history of the previous owner.'
    ]
  },
  {
    id: 'seed_hor_10',
    category: 'horror',
    title: 'The Silent Fog Outpost',
    tagline: 'Total radio silence across 40 miles of coastline.',
    premise: 'You arrive at the coastal research station after a 12-hour patrol. Every light is on, hot meals sit untouched on the mess hall tables, and all bird and insect sounds have completely ceased across the entire peninsula.',
    suggestedHeroName: 'Officer Ethan Ray',
    suggestedRole: 'Coast Guard Patrol',
    suggestedRace: 'First Responder',
    suggestedActions: [
      'Check the radar room logs to see what vessel was detected before the silence.',
      'Inspect the generator room to ensure defensive floodlights stay on.',
      'Draw your sidearm and sweep the dormitory bunks room by room.'
    ]
  },

  // ==========================================
  // COZY & STUDIO GHIBLI-ESQUE (46-55)
  // ==========================================
  {
    id: 'seed_coz_01',
    category: 'cozy_ghibli',
    title: 'The Floating Tea Bakery',
    tagline: 'Baking star-honey pastries on a flying brass teahouse over clover hills.',
    premise: 'You awake to morning sunlight in your flying teashop, cruising over rolling clover valleys. The copper kettle is whistling cheerfully, but today is the annual Sky Blossom Festival and your delivery pelican just arrived with an urgent order of Star-Honey Buns for the Forest Spirit King.',
    suggestedHeroName: 'Mimi Clover',
    suggestedRole: 'Sky Baker',
    suggestedRace: 'Airborne Artisan',
    suggestedActions: [
      'Mix the luminescent star-flour and cinnamon honey into the copper mixing bowl.',
      'Adjust the clockwork rudder to catch the warm valley thermal breeze.',
      'Feed a warm cinnamon crust to your sleepy glowing spirit fox companion.'
    ]
  },
  {
    id: 'seed_coz_02',
    category: 'cozy_ghibli',
    title: 'The Clockwork Clockmaker\'s Cat',
    tagline: 'Repairing antique grandfather clocks for time-traveling spirits.',
    premise: 'In your cozy chimney-corner workshop, a little clockwork calico cat waddles across the workbench carrying a broken pocket watch that runs backward. When you open the brass casing, tiny gears shaped like stars spin and whisper a forgotten lullaby.',
    suggestedHeroName: 'Tobias Pendelton',
    suggestedRole: 'Clockwork Horologist',
    suggestedRace: 'Gentle Craftsman',
    suggestedActions: [
      'Use your brass tweezers to align the miniature star-gears inside the watch.',
      'Offer a saucer of warm milk with cinnamon to the clockwork cat.',
      'Wind the brass stem to hear the complete melody of the forgotten song.'
    ]
  },
  {
    id: 'seed_coz_03',
    category: 'cozy_ghibli',
    title: 'The Lost Cloud Shepherd',
    tagline: 'Herding fluffy rainbow clouds over the coastal lighthouse cliffs.',
    premise: 'Armed with your shepherd\'s crook and lavender whistle, you must herd three runaway fluffy rain-clouds before they drift over the village laundry lines. The smallest pink cloud has gotten tangled in the lighthouse weather vane.',
    suggestedHeroName: 'Pip Weatherbee',
    suggestedRole: 'Cloud Shepherd',
    suggestedRace: 'Hilltop Wanderer',
    suggestedActions: [
      'Climb the lighthouse spiral stairs with your lavender cloud-treats.',
      'Blow your wooden whistle to guide the two larger clouds into the orchard.',
      'Gently untangle the pink cloud and wrap it in a warm woolen blanket.'
    ]
  },
  {
    id: 'seed_coz_04',
    category: 'cozy_ghibli',
    title: 'The Botanical Greenhouse Express',
    tagline: 'A steam train filled with rare talking orchids and moss spirits.',
    premise: 'You are the head conductor on the Green Valley Express, a vintage train where every carriage is a greenhouse garden. A sleepy moss spirit has fallen asleep on the main steam valve, causing the train to sprout giant flowering jasmine vines across the track.',
    suggestedHeroName: 'Hazel Greenleaf',
    suggestedRole: 'Botanical Conductor',
    suggestedRace: 'Forest Elf',
    suggestedActions: [
      'Brew a pot of chamomile tea to gently wake the sleeping moss spirit.',
      'Trim the jasmine vines with your silver shears to keep the tracks clear.',
      'Sing a gentle botanical tune to encourage the orchid passengers to bloom.'
    ]
  },
  {
    id: 'seed_coz_05',
    category: 'cozy_ghibli',
    title: 'The Lighthouse of Lost Lanterns',
    tagline: 'Lighting the path for wandering nocturnal dream-moths.',
    premise: 'On the highest cliff of Whisper Isle, your lighthouse doesn\'t guide ships — it guides glowing dream-moths on their migration across the sea of stars. Tonight, an enormous radiant moth lands on the lantern glass with a letter tied to its wing.',
    suggestedHeroName: 'Finnian Starling',
    suggestedRole: 'Lantern Keeper',
    suggestedRace: 'Island Resident',
    suggestedActions: [
      'Carefully untie the ribbon letter from the dream-moth\'s wing.',
      'Polish the brass reflectors to amplify the golden beam across the waves.',
      'Share a bowl of warm roasted chestnuts with the lighthouse owl.'
    ]
  },
  {
    id: 'seed_coz_06',
    category: 'cozy_ghibli',
    title: 'The Soot-Sprite Bakery Delivery',
    tagline: 'Delivering warm sourdough loaves across the cobble village by glider.',
    premise: 'Your family bakery has supplied the village with fresh sourdough for four generations. With your bamboo glider strapped on and a basket of warm bread on your back, you discover a family of friendly soot-sprites hiding in the flour bin.',
    suggestedHeroName: 'Kiki Thorne',
    suggestedRole: 'Glider Courier',
    suggestedRace: 'Village Baker',
    suggestedActions: [
      'Feed the soot-sprites little star-sugar candies so they help pack the bread.',
      'Launch from the bakery windmill platform into the morning valley breeze.',
      'Deliver the first warm loaf to the sleepy lighthouse keeper at the harbor.'
    ]
  },
  {
    id: 'seed_coz_07',
    category: 'cozy_ghibli',
    title: 'The Enchanted Bookshop in the Hollow',
    tagline: 'Books that flutter like birds when you open their pages.',
    premise: 'Nestled inside the trunk of a 500-year-old hollow oak, your bookstore is home to volumes that flutter like sparrows when excited. An elderly badger scholar arrives seeking the legendary Cookbook of Starlight Pudding.',
    suggestedHeroName: 'Barnaby Quill',
    suggestedRole: 'Bookkeeper',
    suggestedRace: 'Oak Dweller',
    suggestedActions: [
      'Use your butterfly net to gently catch the fluttering blue volume near the rafters.',
      'Serve honeyed elderberry tea to the badger scholar by the fireplace.',
      'Read the glowing calligraphy on the first page of the pudding recipe.'
    ]
  },
  {
    id: 'seed_coz_08',
    category: 'cozy_ghibli',
    title: 'The River Otters\' Floating Market',
    tagline: 'Trading handmade pottery for freshwater pearls and riverberries.',
    premise: 'Every full moon, the river otters tie their wooden barges together to form a lantern-lit floating market on the river bend. Your hand-painted ceramic mugs are the biggest hit of the evening until a curious river dragon requests a mug the size of a barrel.',
    suggestedHeroName: 'Penelope Reed',
    suggestedRole: 'Ceramic Artist',
    suggestedRace: 'River Folk',
    suggestedActions: [
      'Carve a magnificent ceramic basin on your foot-pedal pottery wheel.',
      'Barter with the otter merchant for shimmering blue river pearls.',
      'Share roasted sweet potatoes by the riverside bonfire with market vendors.'
    ]
  },
  {
    id: 'seed_coz_09',
    category: 'cozy_ghibli',
    title: 'The Windmill Repair Guild',
    tagline: 'Tuning the wooden gears that power the village music boxes.',
    premise: 'The great hilltop windmill turns the central drive-shaft that powers every clock, music box, and flour mill in the valley. When the music boxes start playing in reverse, you climb into the cedar gear-loft with your oil can and brass wrench.',
    suggestedHeroName: 'Oliver Miller',
    suggestedRole: 'Millwright',
    suggestedRace: 'Valley Artisan',
    suggestedActions: [
      'Inspect the giant wooden cedar cogs for stuck flower garlands.',
      'Oil the main bronze bearing to restore the gentle musical rhythm.',
      'Look out the windmill hatch at the sunset spreading over the sunflower fields.'
    ]
  },
  {
    id: 'seed_coz_10',
    category: 'cozy_ghibli',
    title: 'The Star-Weaver\'s Loom',
    tagline: 'Weaving fallen starlight threads into blankets that keep bad dreams away.',
    premise: 'In your cottage atop the windy ridge, you collect fallen starlight threads from the morning grass and weave them into glowing quilts. A young shepherd arrives asking for a blanket to protect his flock from the Night-Mist Wolf.',
    suggestedHeroName: 'Astrid Moon',
    suggestedRole: 'Starlight Weaver',
    suggestedRace: 'Hill Artisan',
    suggestedActions: [
      'Thread the glowing silver starlight yarn through your wooden handloom.',
      'Weave protective clover patterns into the corners of the blanket.',
      'Brew a mug of spiced chamomile for the grateful young shepherd.'
    ]
  },

  // ==========================================
  // POST-APOCALYPSE & WASTELAND (56-65)
  // ==========================================
  {
    id: 'seed_apo_01',
    category: 'apocalypse',
    title: 'The Vault Blast Door Opens',
    tagline: 'Emerging after 50 years into the sun-bleached highway wasteland.',
    premise: 'The heavy hydraulic blast door of Shelter 14 groans open for the first time in fifty years. Armed with a calibrated Geiger counter and a scavenged hunting rifle, you step out onto the sun-scorched interstate to find the settlement water pump that stopped broadcasting two days ago.',
    suggestedHeroName: 'Vance Walker',
    suggestedRole: 'Vault Scout',
    suggestedRace: 'Shelter Born',
    suggestedActions: [
      'Test the ambient desert air with your handheld Geiger counter.',
      'Scout the distant highway overpass with your brass binoculars.',
      'Check the battery charge on your wrist-mounted environmental monitor.'
    ]
  },
  {
    id: 'seed_apo_02',
    category: 'apocalypse',
    title: 'The Geothermal Water Well',
    tagline: 'The only clean water well within 50 miles has been seized by rust raiders.',
    premise: 'You arrive at the Oasis 4 water pump with three empty canteens and a dying moisture recycler. A gang of motorized scavengers has welded iron plating over the wellhead and is demanding 100 copper rounds for a single liter.',
    suggestedHeroName: 'Mara Rust',
    suggestedRole: 'Wasteland Tinker',
    suggestedRace: 'Scavenger',
    suggestedActions: [
      'Bypass the external pressure bypass valve to tap clean water from the overflow line.',
      'Negotiate with the gang leader using a rare pre-war solar capacitor as trade collateral.',
      'Take cover behind the rusted tanker truck and prepare your hunting rifle.'
    ]
  },
  {
    id: 'seed_apo_03',
    category: 'apocalypse',
    title: 'The Pre-War Radio Beacon',
    tagline: 'An automated broadcast from the lost military bunker in the crater.',
    premise: 'Your scavenged ham radio suddenly crackles with an automated pre-war broadcast: "Bunker Echo-7 operational. Automated medical synthesizers online. Keycode required." The crater is surrounded by magnetic radiation dust.',
    suggestedHeroName: 'Eliot Vance',
    suggestedRole: 'Signals Scavenger',
    suggestedRace: 'Wastelander',
    suggestedActions: [
      'Calibrate your lead-lined hazmat poncho before descending the crater rim.',
      'Hack the radio broadcast with your terminal deck to extract the numeric keycode.',
      'Scout the crater floor for subterranean tunnel ventilation shafts.'
    ]
  },
  {
    id: 'seed_apo_04',
    category: 'apocalypse',
    title: 'The Solar Train of the Dust Sea',
    tagline: 'A perpetual armored locomotive crossing the salt flats.',
    premise: 'The Iron Nomad, a massive solar-powered locomotive that has run nonstop since the collapse, is scheduled to pass through the Canyon Pass in twenty minutes. You need to board it to deliver a clean seed-vault container to the northern survivors.',
    suggestedHeroName: 'Cole Jackson',
    suggestedRole: 'Nomad Courier',
    suggestedRace: 'Dustborn',
    suggestedActions: [
      'Position your dune buggy on the canyon bluff to time your leap onto the train roof.',
      'Fire your grappling hook line at the armored caboose railing.',
      'Check the climate seal on the precious seed-vault container strapped to your chest.'
    ]
  },
  {
    id: 'seed_apo_05',
    category: 'apocalypse',
    title: 'The Hydroponic Dome Ruin',
    tagline: 'A sealed glass greenhouse with clean apples in the middle of the ash desert.',
    premise: 'Beneath the shattered skyline of New Denver, you discover a sealed reinforced geodesic dome where pre-war apple trees are still blooming under solar UV lamps. The automated sentry turrets are active and scanning for intruders.',
    suggestedHeroName: 'Rhea Stone',
    suggestedRole: 'Botanical Scavenger',
    suggestedRace: 'Settler',
    suggestedActions: [
      'Use an EMP pulse grenade to temporarily disable the sentry turret scanning arc.',
      'Crawl through the drainage conduit to access the greenhouse interior.',
      'Harvest fresh fruit and seeds while monitoring the security terminal countdown.'
    ]
  },

  // ==========================================
  // ZOMBIE OUTBREAK SURVIVAL (66-73)
  // ==========================================
  {
    id: 'seed_zom_01',
    category: 'zombie',
    title: 'Code Silver in the ICU',
    tagline: 'The quarantine sirens blare as the emergency doors seal from the outside.',
    premise: 'You are on duty in the trauma wing when the emergency intercom screeches: "Code Silver. Facility lockdown activated. All staff remain in place." Through the reinforced glass doors, patients in the triage hall begin collapsing and convulsing.',
    suggestedHeroName: 'Dr. Rebecca Shaw',
    suggestedRole: 'Trauma Surgeon',
    suggestedRace: 'Medical First Responder',
    suggestedActions: [
      'Lock and barricade the heavy double doors to the operating theater.',
      'Gather emergency trauma kits, scalpel sets, and antibiotic syringes.',
      'Check the rooftop helipad security monitor to see if evacuation is possible.'
    ]
  },
  {
    id: 'seed_zom_02',
    category: 'zombie',
    title: 'The Last Radio Transmission',
    tagline: 'The broadcast tower is surrounded — and your battery is at 12%.',
    premise: 'Huddled in the third-floor control booth of downtown WKRN Radio, you have guided surviving civilians across the city for forty-eight hours. The station front doors have just buckled under the horde, and your emergency generator reads 12% battery remaining.',
    suggestedHeroName: 'Lucas Miller',
    suggestedRole: 'Radio DJ',
    suggestedRace: 'Broadcaster',
    suggestedActions: [
      'Broadcast the final safe evacuation coordinates to all listening survivors.',
      'Barricade the stairwell access door with metal equipment racks.',
      'Prepare your fire axe and rooftop zip-line toward the adjacent parking garage.'
    ]
  },
  {
    id: 'seed_zom_03',
    category: 'zombie',
    title: 'The Substation Quarantine Line',
    tagline: 'The power grid failure plunges the electrified fence into darkness.',
    premise: 'You are manning the security checkpoint at the edge of the safe zone when the city power grid explodes in blue sparks. The high-voltage perimeter fence goes cold, and hundreds of silhouettes at the tree line begin surging forward.',
    suggestedHeroName: 'Sergeant Thomas Vance',
    suggestedRole: 'National Guard',
    suggestedRace: 'Veteran Soldier',
    suggestedActions: [
      'Fire warning flares into the night sky to illuminate the perimeter breach.',
      'Rush to the backup diesel generator shed to manually pull the ignition cord.',
      'Rally the checkpoint guards to establish a disciplined three-rank firing line.'
    ]
  },
  {
    id: 'seed_zom_04',
    category: 'zombie',
    title: 'The Supermarket Barricade',
    tagline: 'Trapped inside the grocery store with six strangers and dwindling canned goods.',
    premise: 'Day 14 of the outbreak. You are holed up in a reinforced supermarket with six survivors. At midnight, someone accidentally knocks over a tower of soup cans near the loading dock, and scratching hands begin tearing through the roll-up door seams.',
    suggestedHeroName: 'Morgan Kelly',
    suggestedRole: 'Barricade Leader',
    suggestedRace: 'Civilian Survivor',
    suggestedActions: [
      'Reinforce the loading dock door with heavy pallets of mineral water.',
      'Quietly herd the panic-stricken survivors into the steel walk-in freezer.',
      'Climb to the roof access ladder with your hunting crossbow to scout the perimeter.'
    ]
  },

  // ==========================================
  // COSMIC HORROR (74-81)
  // ==========================================
  {
    id: 'seed_cos_01',
    category: 'cosmic_horror',
    title: 'The Miskatonic Translation',
    tagline: 'The Sumerian clay tablet contains constellations that haven\'t happened yet.',
    premise: 'Late at night in the Miskatonic University Rare Books Archive, you complete the translation of a clay tablet brought back from the Mesopotamian desert. The star chart carved into its surface predicts an impossible alignment of stars occurring tonight above Arkham.',
    suggestedHeroName: 'Professor Arthur Vance',
    suggestedRole: 'Antiquarian Scholar',
    suggestedRace: 'Academic',
    suggestedActions: [
      'Cross-reference the clay tablet\'s star chart with the observatory telescope readings.',
      'Lock the archive library iron doors and extinguish all gas lamps except your green desk light.',
      'Check the telegraph from your missing colleague in Cairo for translation warnings.'
    ]
  },
  {
    id: 'seed_cos_02',
    category: 'cosmic_horror',
    title: 'The Lighthouse of Non-Euclidean Light',
    tagline: 'The beam illuminates an island that isn\'t on any marine chart.',
    premise: 'As lighthouse keeper on Black Rock Reef, you clean the Fresnel lens during a violet sea fog. When the beam sweeps the water, it illuminates a cyclopean basalt island with towering angled monoliths that disappears the moment the beam passes.',
    suggestedHeroName: 'Captain James Howard',
    suggestedRole: 'Lighthouse Keeper',
    suggestedRace: 'Mariner',
    suggestedActions: [
      'Lock the Fresnel lens in place to keep the mysterious basalt island illuminated.',
      'Record the exact compass coordinates and celestial angles in the official logbook.',
      'Load your heavy brass flare gun as strange clicking echoes rise from the surf below.'
    ]
  },
  {
    id: 'seed_cos_03',
    category: 'cosmic_horror',
    title: 'The Whispering Green Lantern',
    tagline: 'The glass lamp reveals words written between the printed lines.',
    premise: 'You purchase an antique green glass oil lamp from a deceased astronomer\'s estate. When lit with whale oil, its pale emerald glow reveals hidden microscopic writing inscribed between the lines of every printed book in your study.',
    suggestedHeroName: 'Eleanor Ward',
    suggestedRole: 'Cryptographer',
    suggestedRace: 'Scholar',
    suggestedActions: [
      'Read the glowing emerald text hidden inside your grandfather\'s diary.',
      'Sketch the geometric sigils revealed on your study walls.',
      'Examine the oil reservoir to discover what liquid powers the lamp.'
    ]
  },

  // ==========================================
  // PSYCHEDELIC & SURREAL (82-87)
  // ==========================================
  {
    id: 'seed_psy_01',
    category: 'psychedelic_trip',
    title: 'The Clockwork Compass of Backward Time',
    tagline: 'The hands spin counter-clockwise to point toward forgotten childhood memories.',
    premise: 'You step through a shimmering doorway in the sand into a desert of glowing violet fractal dunes. A brass clockwork compass in your hand spins backward, chiming in chord harmonies that shape the physical terrain into crystal bridges with every step.',
    suggestedHeroName: 'Astraea Moon',
    suggestedRole: 'Dreamwalker',
    suggestedRace: 'Astral Wanderer',
    suggestedActions: [
      'Follow the harmonic chime resonance across the violet crystal dunes.',
      'Ask the floating geometric mirror entity for the true name of the threshold.',
      'Tune your mind\'s focus to alter the color of the liquid glass horizon.'
    ]
  },
  {
    id: 'seed_psy_02',
    category: 'psychedelic_trip',
    title: 'The Symphony of Liquid Light',
    tagline: 'Sound has physical weight and colors speak in philosophical riddles.',
    premise: 'Walking across a lake of liquid silver under a magenta nebula sky, every word you speak crystallizes into floating origami birds that carry your thoughts to the Mirror Oracle seated on the horizon.',
    suggestedHeroName: 'Orion Vale',
    suggestedRole: 'Harmonic Psychonaut',
    suggestedRace: 'Dreamer',
    suggestedActions: [
      'Speak a word of truth to create a radiant indigo phoenix bridge.',
      'Listen to the silver lake water whispering memories you haven\'t lived yet.',
      'Approach the Mirror Oracle to receive the key to the waking world.'
    ]
  },

  // ==========================================
  // ANCIENT GREEK & MYTHOLOGY (88-95)
  // ==========================================
  {
    id: 'seed_grk_01',
    category: 'ancient_greek',
    title: 'The Delphic Laurel Prophecy',
    tagline: 'The Pythia whispers that your own brother will poison the Spartan spring.',
    premise: 'Standing before the smoking bronze brazier at the Oracle of Delphi, the Pythia breathes deep of the laurel vapors and locks her unseeing eyes onto you: "The hero who returns to Sparta with the golden spear shall find their brother pouring hemlock into the garrison well."',
    suggestedHeroName: 'Leonidas of Sparta',
    suggestedRole: 'Hoplite Champion',
    suggestedRace: 'Spartan Warrior',
    suggestedActions: [
      'Sacrifice a black ram at the marble altar to demand clarification from Apollo.',
      'Mount your chariot to race across the mountain pass before sunset.',
      'Inspect your bronze spear for divine omens of favor.'
    ]
  },
  {
    id: 'seed_myth_01',
    category: 'mythology',
    title: 'The Ravens of the All-Father',
    tagline: 'A black raven drops an engraved rune stone into your foaming mead horn.',
    premise: 'In the great timber mead hall of Valhalla, a black raven swoops from the smoke hole and drops a frost-carved rune stone into your horn. The carving ignites with blue lightning, spelling out a warning: the Frost Giants have breached the Bifrost gate.',
    suggestedHeroName: 'Torstein Bloodaxe',
    suggestedRole: 'Viking Skald',
    suggestedRace: 'Norse Warrior',
    suggestedActions: [
      'Raise your battleaxe and rally the mead hall warriors with a skaldic battle song.',
      'Interpret the elder runes with an insight roll to learn the giant\'s weakness.',
      'Pour the lightning mead onto the hearth to seal your oath of defense.'
    ]
  },

  // ==========================================
  // REAL LIFE & SLICE OF LIFE (96-100)
  // ==========================================
  {
    id: 'seed_rl_01',
    category: 'real_life',
    title: 'The Corporate Whistleblower Audit',
    tagline: 'Finding $40M in hidden offshore payments thirty minutes before the board meeting.',
    premise: 'As a senior forensic auditor at a Fortune 500 tech firm, you run a final automated reconciliation at 7:30 AM and discover $40M routed to a shell company owned by the Chief Financial Officer. His secretary just knocked on your glass office door with a conference invite.',
    suggestedHeroName: 'Sarah Lin',
    suggestedRole: 'Forensic Financial Auditor',
    suggestedRace: 'Corporate Professional',
    suggestedActions: [
      'Back up the raw database queries onto an encrypted offline thumb drive.',
      'Walk into the CFO\'s conference room with your audit file tucked in your briefcase.',
      'Call the independent SEC whistleblower tip line from your private cell.'
    ]
  },
  {
    id: 'seed_rl_02',
    category: 'real_life',
    title: 'The Hostile Takeover Defense',
    tagline: 'The rival private equity firm bought 49% of your family\'s architectural studio.',
    premise: 'At 8:00 AM on Monday, a convoy of black sedans arrives at your family\'s third-generation architectural firm. A ruthless corporate raider walks into the atrium with proof he bought out your uncle\'s shares and plans to liquidate the studio by 5:00 PM.',
    suggestedHeroName: 'Marcus Bennett',
    suggestedRole: 'Principal Architect',
    suggestedRace: 'Studio Owner',
    suggestedActions: [
      'Review the founding partnership bylaws for the first-refusal family buyout clause.',
      'Confront your uncle on the phone to demand an explanation for the secret share sale.',
      'Rally your design team to prepare the sovereign landmark preservation filing.'
    ]
  },
  {
    id: 'seed_rl_03',
    category: 'real_life',
    title: 'The Investigative Journalist\'s Lead',
    tagline: 'An encrypted drop-box notification containing the mayor\'s private emails.',
    premise: 'Your encrypted signal app chimes at 2:00 AM from an anonymous source labeled "Deep Harbor." It contains five gigabytes of internal municipal emails approving the demolition of the historic waterfront district for an illegal casino development.',
    suggestedHeroName: 'Rachel Torres',
    suggestedRole: 'Investigative Reporter',
    suggestedRace: 'City Journalist',
    suggestedActions: [
      'Verify the cryptographic digital signatures on the mayor\'s email headers.',
      'Contact your trusted city editor to request immediate legal protection and front-page layout.',
      'Meet the anonymous source at the 24-hour diner near the harbor docks.'
    ]
  },
  {
    id: 'seed_rl_04',
    category: 'real_life',
    title: 'The High-Stakes Tech Demo',
    tagline: 'Your venture capital demo crashes 10 minutes before the $20M pitch.',
    premise: 'You are backstage at the Silicon Valley Demo Day with three hundred angel investors in the auditorium. Your lead engineer accidentally deployed a faulty database patch that wiped the live demonstration data. You have ten minutes before your name is called to the stage.',
    suggestedHeroName: 'Alex Chen',
    suggestedRole: 'Startup Founder & CEO',
    suggestedRace: 'Tech Entrepreneur',
    suggestedActions: [
      'Roll back the production server deployment to the stable staging build via terminal.',
      'Pivot your pitch deck to focus on the live architecture and customer traction numbers.',
      'Step onto the stage with supreme confidence and deliver an unforgettable live pitch.'
    ]
  },
  {
    id: 'seed_rl_05',
    category: 'real_life',
    title: 'The Art Gallery Heist Discovery',
    tagline: 'The masterpiece scheduled for auction is an immaculate forgery you painted in college.',
    premise: 'Working as the head curator at the Metropolitan Gallery, you inspect the $15M Renaissance oil painting arriving for the evening gala. Under ultraviolet examination, you spot your own private student signature beneath the varnish — it\'s the exact practice forgery you sold for art school tuition ten years ago.',
    suggestedHeroName: 'Elena Rostova',
    suggestedRole: 'Chief Art Curator',
    suggestedRace: 'Art Historian',
    suggestedActions: [
      'Document the UV signature flaws in your confidential appraisal report.',
      'Trace which private collector consigned the painting for tonight\'s auction.',
      'Speak privately with the gallery director before the billionaire collectors arrive.'
    ]
  }
];

// Helper to get 5 non-repeating scenario seeds for a category from the pool
export function getUnifiedScenarioSeeds(
  category: string, 
  count = 5, 
  excludeIds: string[] = []
): PlayableScenarioSeed[] {
  const normCat = (category || 'fantasy').toLowerCase();
  
  // Filter seeds by exact category first
  let catSeeds = SCENARIO_SEEDS_POOL.filter(s => s.category === normCat);
  
  // If not enough seeds for category, pull from general pool
  if (catSeeds.length < count) {
    const remaining = SCENARIO_SEEDS_POOL.filter(s => s.category !== normCat);
    catSeeds = [...catSeeds, ...remaining];
  }

  // Filter out recent excluded IDs to avoid immediate repetitions
  let candidateSeeds = catSeeds.filter(s => !excludeIds.includes(s.id));
  if (candidateSeeds.length < count) {
    candidateSeeds = catSeeds; // Reset if all were excluded
  }

  // Deterministically shuffle candidates
  const shuffled = [...candidateSeeds].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Retrieve single seed by ID
export function getScenarioSeedById(id: string): PlayableScenarioSeed | undefined {
  return SCENARIO_SEEDS_POOL.find(s => s.id === id);
}
