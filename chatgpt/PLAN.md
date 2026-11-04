# ZeroRoll content handoff plan

Status: Phase 1, ready for review. No final opener objects, story packages or images have been produced. Build starts only after the user says **go**, as required by MASTER_PROMPT.md.

## 1. Summary

The current project is React 19 + TypeScript + Vite, with a Tauri desktop shell. This is a content handoff; it needs no engine, provider, UI or deployment changes. All my writes stay under chatgpt/. Reference copies of the relevant types, categories, story kit, validators and import scripts match the current live files; reference/README.md is its own manifest, not the root README.

D&D openers live in src/content/categories/*.ts, are selected through src/content/index.ts, and populate setup in CategoriesGrid. Selected inspiration is stored on the campaign; content/injection.ts prepares profiles and stored inspiration for geminiService.ts. Story packages have a separate path: story/catalog.ts → schema and graph validation → story/play.ts → story/prompt.ts → the existing AI router → parsed narrator tail → story/engine.ts → story/ui/StoryPlay.tsx and ArtImage. The plan uses those existing paths without changing them. Compact character prompts omit narratorStyle, so essential voice and world rules must also live in cast.voice, world and sceneBrief.

| Planned file(s) | Count | Contents |
| --- | ---: | --- |
| chatgpt/PLAN.md | 1 | This reviewed design and installation plan. |
| chatgpt/output/openers.json | 1 | 74 NEW objects, 11 category keys, exact requested IDs; existing 76 + new 74 = 150 openers. |
| chatgpt/output/stories/spirit-bathhouse-night-shift/story.json | 1 | Cozy character story, 3 cast, 9 beats, 3 endings, 8 flags, 10 art cues. |
| chatgpt/output/stories/the-caller-knows-your-house/story.json | 1 | Teen horror story, 3 cast, 9 beats, 3 endings, 8 flags, 10 art cues. |
| chatgpt/output/stories/the-truthful-balloon/story.json | 1 | Everyone adventure story, 3 cast, 9 beats, 3 endings, 8 flags, 10 art cues. |
| chatgpt/output/stories/<story id>/art/<art id>.png | 42 | 14 per story: 1 cover, 3 portraits, 10 cue illustrations. Exact IDs below. |
| chatgpt/output/stories/<story id>/art/<art id>.webp | 42 | Matching converted files so the actual package checker can pass before installation. |
| chatgpt/output/lantern-of-hollowmere/<art id>.png | 8 | Replacement art, exact existing names; no Lantern story edits. |
| chatgpt/output/lantern-of-hollowmere/<art id>.webp | 8 | Install-ready conversions of the replacements. |
| chatgpt/output/check-handoff.ts | 1 | Deterministic audit using current validators and beat engine; no AI or network calls. |
| chatgpt/output/DONE.md | 1 | File manifest, command results, limitations and explained plan departures. |

Phase 2 totals: 106 files including 50 PNGs and 50 WebPs. PLAN.md is additional. JSON art entries always name .webp; PNG masters remain available for review. All three new stories use schemaVersion 1, meta.author = "ohnna with ChatGPT", strictness hard, lengthTarget medium, hintAfterTurns 4, and meta.cover cover.

## 2. Job A plan: 74 openers

The rows below were checked before saving against each category's live avoidKeywords and the handoff bans, every existing opener title and hero name across ALL 15 live categories (including the four already complete), all proposed titles and names, forbidden origin words, required IDs, counts and available field lengths. Matching follows the validator's normalization, plural and prefix rules. All pass. These are planning situations, not final premises or complete opener objects.

Each row reserves its exact title and hero identity. Final prose will have a present-tense second-person premise with a live decision, three distinct verb-led actions, 2–4 useful gear entries including one equipped weapon, HP 6–18, and 0–3 appropriate abilities. Real life, apocalypse, zombie and historical adventure will use spells: []. Real-life gear uses a plausible everyday tool, never an invitation to violence; the equipped weapon classification is the existing opener data contract.

Voice commitments: adventure uses navigational problems and physical momentum; historical adventure uses etiquette and material constraints; ancient Greek uses oaths, omens and conflicting duties; mythology uses obligation and the cost of bargains; psychedelic uses sensory transformations with understandable symbolic choices; cosmic horror uses evidence that makes explanation less secure; zombie uses containment and imperfect escape; apocalypse uses repair, scarce resources and mutual dependence; real life uses recognizable social tradeoffs; romantic uses subtext and reciprocal agency; revenge uses reconnaissance and controlled countermoves. Existing profiles guide structure and pacing; no source scenes or distinctive dialogue will be reproduced.

### adventure — 10 new; 0 → 10

| ID | Title | Hero | Role | Origin | Situation |
| --- | --- | --- | --- | --- | --- |
| seed_adv_01 | The Reef That Sails | Tessa Brinewake | Reef Navigator | Atoll-born human | You reach a coral anchorage to find the island carrying your missing expedition drifting seaward while your hired boat strains at its last mooring. |
| seed_adv_02 | A Ransom in Sailcloth | Nilo Vey | Sailmaker | Harbor-born human | You unfold a damaged sail at a sunlit dock and find a hostage's route stitched into its seams as the waiting privateer demands it back. |
| seed_adv_03 | The Copper Diver's Bargain | Imani Saltglass | Wreck Diver | Pearl-coast human | You arrive at a floating salvage camp where a trapped diver signals from a sunken strongroom and a rival crew prepares to cut the air hose. |
| seed_adv_04 | Seven Knots to Sundown | Orren Keel | Rigging Runner | Estuary-born human | You board a supply brig with a knotted route-cord whose final knot comes loose just as the lookout spots three identical reef channels. |
| seed_adv_05 | The Orchard Above the Surf | Sabela Quince | Expedition Forager | Island-raised human | You land beneath a cliff orchard to discover fresh expedition markings on falling fruit while the only rope ascent begins to unravel. |
| seed_adv_06 | The Auction of Empty Chests | Daro Pennant | Cargo Appraiser | Port-raised human | You enter a quayside salvage auction and recognize a false bottom from your lost vessel while the winning bidder orders the chest burned. |
| seed_adv_07 | The Windward Drum | Fenna Rusk | Shipboard Musician | Archipelago-born human | You join a festival flotilla where a damaged signal drum holds the rhythm for crossing a reef and a squall scatters the boats before you can learn it. |
| seed_adv_08 | A Bridge of Broken Anchors | Jori Flintcap | Coastal Pathfinder | Cliffside human | You reach a jungle ravine where an expedition's anchor-chain bridge is pulling free and your missing guide calls from the far bank. |
| seed_adv_09 | The Sandbar Post | Amara Kest | Packet Courier | Delta-born human | You deliver a sealed chart to a sandbar trading post just as the tide exposes a wreck bearing tomorrow's version of your own delivery mark. |
| seed_adv_10 | The Gullkeeper's Bearing | Pell Ardent | Harbor Scout | Headland-born human | You collect a trained gull from a harbor loft and find its message tube stuffed with volcanic grit as every bird wheels toward a supposedly empty horizon. |

### historical_adventure — 10 new; 0 → 10

| ID | Title | Hero | Role | Origin | Situation |
| --- | --- | --- | --- | --- | --- |
| seed_his_01 | The Seal at the Mountain Barrier | Akiyama Sayo | Dispatch Courier | Mountain-village Japanese | You reach an Edo-period mountain barrier with an intact dispatch seal and discover that the posted travel description names the companion beside you as a fugitive. |
| seed_his_02 | The Waterlogged Folio | Leontia of Canopus | Manuscript Binder | Alexandrian Greek | You arrive at a Hellenistic harbor workshop to collect a damaged manuscript as rising water traps its owner behind a jammed storeroom door. |
| seed_his_03 | The Glassmaker's Cipher | Lucia Bellori | Glassworker | Venetian | You open a Renaissance furnace workshop and find a warning formed inside cooling glass while a patron's servants wait outside to seize the batch. |
| seed_his_04 | The Broken Relay Saddle | Qiao Wen | Relay Rider | North China village-born | You reach a Ming relay station with a sealed flood warning and find the fresh horses taken and the downstream ferry already preparing its final crossing. |
| seed_his_05 | The Measure of the Aqueduct | Decima Vibia | Water Surveyor | Roman provincial | You inspect a provincial Roman aqueduct before a public opening and find tool marks beneath a new support as the first water surges toward it. |
| seed_his_06 | The Loom Behind the Gate | Yusuf al-Saffar | Textile Trader | Andalusi urban-born | You bring cloth to a medieval city gate and discover a displaced family's travel token sewn into the bolt that a guard has ordered confiscated. |
| seed_his_07 | The Ink on the Tea Bowl | Jeong Haejin | Kiln Painter | Joseon village-born | You deliver bowls to a Joseon roadside inn and discover a message under the glaze while the intended recipient is being escorted through the courtyard. |
| seed_his_08 | The Bridge Before the Thaw | Martin Desroches | Pontoon Carpenter | Loire valley French | You reach a seventeenth-century river crossing to repair its mooring as a thaw sends timber downstream and two armed parties demand first passage. |
| seed_his_09 | The Caravan's Second Weight | Zaynab bint Rashid | Caravan Quartermaster | Maghrebi oasis-born | You weigh supplies at a medieval desert caravan halt and discover stones replacing water jars just as the guide announces an early departure. |
| seed_his_10 | The Printer's Last Forme | Tomaz Valeiro | Printshop Compositor | Lisbon-born Portuguese | You unlock an early-modern printshop to find a forged proclamation locked in the press while its sponsor waits for the first copies in the street. |

### ancient_greek — 9 new; 1 → 10

| ID | Title | Hero | Role | Origin | Situation |
| --- | --- | --- | --- | --- | --- |
| seed_grk_02 | The Oar Beneath the Altar | Myrine of Naxos | Sacred Boatwright | Naxian | You bring a votive oar to a coastal shrine and hear a wrecked crew calling through its grain as the tide withdraws from a hidden path. |
| seed_grk_03 | The Olive Crown's Burden | Diores of Elis | Footrace Champion | Elean | You approach the games with a borrowed olive crown that turns to lead whenever your rival speaks and the herald calls you both to swear an oath. |
| seed_grk_04 | The Silent Bronze of Argos | Klea of Argos | Bronze Founder | Argive | You bring a new bronze shield to a temple and see its reflection show the gate standing open while the city watch insists it is barred. |
| seed_grk_05 | The Ninth Stone of the Maze | Phaidros of Knossos | Labyrinth Guide | Cretan | You reach a hillside sanctuary where a rescued child carries a moving maze-stone and the entrance shifts before the next search party can leave. |
| seed_grk_06 | The Unshared Loaf | Thaleia of Miletos | Shrine Provisioner | Milesian | You carry barley bread to a wayside altar and find strangers refusing each other shelter while thunder answers every broken promise. |
| seed_grk_07 | The Spear That Points Home | Nikandros of Teos | Coastal Sentinel | Ionian | You return to a sea-cliff watchpost and find your bronze spear drawn toward a refugee boat while the signal fire orders every vessel turned away. |
| seed_grk_08 | The Thread Across the Isthmus | Ione of Corinth | Festival Weaver | Corinthian | You deliver a ceremonial cloth to an isthmus shrine and watch its woven road unravel toward two processions about to meet on a narrow causeway. |
| seed_grk_09 | The Wine Jar of Unsaid Vows | Melanthos of Chios | Libation Bearer | Chian | You uncork a wine jar at a grove altar and hear the vows your companions concealed as a waiting envoy demands your oath first. |
| seed_grk_10 | The Ash Tree at the Boundary | Lysippe of Aulis | Oath Witness | Boeotian | You reach a boundary grove where an ash tree bears two rival families' tokens and its roots begin lifting the stones before their truce is sworn. |

### mythology — 9 new; 1 → 10

| ID | Title | Hero | Role | Origin | Situation |
| --- | --- | --- | --- | --- | --- |
| seed_myth_02 | The Hearth That Forgets Its Kin | Sigrun Ashwake | Oath Keeper | Fjord-born human | You return to a snowbound hall where the hearth refuses warmth to one family and a guest claims the forgotten place beside your ancestors. |
| seed_myth_03 | The Wolf Beneath the Keel | Eirik Mereborn | Rune Carver | Northern islander | You trace runes on a beached longship and hear a bound wolf counting the crew beneath its keel as the tide begins to lift it. |
| seed_myth_04 | The Cup Beyond the Ninth Wave | Nessa Rowanfern | Shore Warden | Western-isle human | You reach a stone-ring shore where a cup from the otherworld washes back with an old promise and your companion steps toward its returning boat. |
| seed_myth_05 | The Antler Road | Branoc Hazel | Grove Pathfinder | Forest-born human | You stand before a winter stone circle when antler shadows open a road toward a captive season and the grove's last green branch starts to fade. |
| seed_myth_06 | The Weight of the Unfinished Name | Merit Iset | Funerary Scribe | Nile-valley human | You enter a mythic weighing hall bearing a broken name tablet and find the scales tipping against someone whose final act has been erased. |
| seed_myth_07 | The Door of Borrowed Dawn | Hrafna Reedcloak | Dawn Watcher | Frost-coast human | You climb a frostbound ridge to light the morning beacon and find dawn pledged as payment for an oath your household never heard. |
| seed_myth_08 | The Ferryman's Winter Guest | Solveig Tarn | River Guide | Inland-valley human | You reach an icebound ferry stone where a silent traveler carries spring beneath a cloak and the river demands a remembered kindness as its fare. |
| seed_myth_09 | The Hammer Under the Feast | Ketil Embermere | Hall Smith | Volcanic-island human | You bring a repaired hammer to a mountain feast and hear it strike from beneath the floor whenever a guest swears loyalty to the host. |
| seed_myth_10 | The Stag at the Last Ember | Ailbhe Mossward | Boundary Singer | Mist-isle human | You tend a hilltop vigil where a white stag guards the final ember and a voice from the stones offers to save it by taking your oldest promise. |

### psychedelic_trip — 8 new; 2 → 10

| ID | Title | Hero | Role | Origin | Situation |
| --- | --- | --- | --- | --- | --- |
| seed_psy_03 | The Orchard of Borrowed Echoes | Serein Lilt | Echo Gardener | Reverie-born | You step into an orchard where fruit repeats tomorrow's farewells and a transparent gardener asks which voice you will return before the roots learn it. |
| seed_psy_04 | The Staircase That Tastes of Rain | Vela Prismatic | Threshold Cartographer | Lucid Dreamer | You cross a doorway into stairs that taste blue beneath your feet while a paper sun folds shut around the landing you meant to reach. |
| seed_psy_05 | The Museum of Almost | Nacre Sol | Possibility Restorer | Mirror-born | You enter a museum of choices never made and find your unfinished reflection climbing out of its frame as the corridors rearrange around its footsteps. |
| seed_psy_06 | A Sea Sewn from Sleeves | Omi Afterlight | Memory Tailor | Daydream Wanderer | You unfold a coat into a phosphorescent sea where the buttons are islands and a needle-shaped boat demands the memory that will serve as its sail. |
| seed_psy_07 | The Choir Under Your Footprint | Quillan Hush | Resonance Listener | Thoughtform | You arrive on a shore of humming footprints and hear one singing without its walker while a tide of silence approaches the unfinished song. |
| seed_psy_08 | The Umbrella of Sideways Seasons | Luma Venn | Weather Interpreter | Betweenworld Traveler | You open an umbrella under a violet sky and four seasons fall sideways from its ribs as a snowflower asks you to choose which season may touch ground. |
| seed_psy_09 | The Door in the Sleeping Color | Eno Saffron | Chromatic Wayfinder | Spectrum-born | You enter a field where amber has fallen asleep and every yellow doorway locks while a blue silhouette offers its own outline as a temporary key. |
| seed_psy_10 | The Parade of Unfinished Faces | Ruelle Chime | Dream Maskmaker | Cloud-memory Being | You cross a bridge of folded laughter into a procession of blank masks and find the final face forming from the name you have not yet spoken. |

### cosmic_horror — 7 new; 3 → 10

| ID | Title | Hero | Role | Origin | Situation |
| --- | --- | --- | --- | --- | --- |
| seed_cos_04 | The Parallax in Plate Six | Miriam Quade | Astronomical Photographer | Rain-coast human | You develop an expedition plate beneath a green archive lamp and find its second horizon shifting closer whenever your colleague's telegram is read aloud. |
| seed_cos_05 | A Catalogue of Missing Angles | Oswin Pell | Architectural Archivist | University-town human | You inspect a donated building survey and discover a room measured only in missing angles while footsteps begin occupying that same absence above your desk. |
| seed_cos_06 | The Ninth Transit | Selma Rooke | Transit Observer | Upland-born human | You reach an observatory with eight recorded transits and find a ninth already entered in your handwriting as the telescope turns toward the floor. |
| seed_cos_07 | The Fossil That Remembers Air | Basil Orme | Paleontological Preparator | Quarry-town human | You unpack a fossil in a university workroom and hear it exhale the precise weather of a vanished coast while condensation outlines a door on the sealed wall. |
| seed_cos_08 | The Address Beneath the Stamp | Ada Fenwick | Postal Historian | Estuary-born human | You examine a missing colleague's letter and find its postmark naming a depth rather than a town while seawater darkens the archive steps outside. |
| seed_cos_09 | The Silence Between Two Bells | Tomasin Greave | Acoustic Researcher | Mill-town human | You compare wax recordings in a locked study and hear an expanding silence between identical bells as the window glass begins reflecting a larger room. |
| seed_cos_10 | The Index of Unborn Readers | Nerin Holt | Rare Book Conservator | Inland-city human | You open an uncatalogued index under leaded archive windows and find future readers listed by the shapes of their shadows as your own detaches from the chair. |

### zombie — 6 new; 4 → 10

| ID | Title | Hero | Role | Origin | Situation |
| --- | --- | --- | --- | --- | --- |
| seed_zom_05 | The Dialysis Window | Priya Mendel | Dialysis Technician | City-raised human | You begin a clinic shift when backup lighting fails and an evacuation message leaves one powered treatment station between two patients as infected figures reach the locked entrance. |
| seed_zom_06 | The Laundry Chute Route | Owen Calder | Hospital Porter | River-district human | You collect linen on a hospital service floor when a quarantine shutter drops and a colleague signals from beyond it beside the only clear laundry chute. |
| seed_zom_07 | The Cold Chain Detour | Salma Idris | Medical Courier | Coastal-city human | You bring temperature-sensitive supplies to a relief depot and find its receiving bay compromised while your cooler alarm counts down beside a waiting family. |
| seed_zom_08 | The School Bus at Triage | Mateo Reyes | Evacuation Driver | Suburban-raised human | You reach a temporary triage lot with an empty school bus as the shelter closes its gate and a stranded group pounds on an adjacent clinic window. |
| seed_zom_09 | The Red Light in the Kennel | Leah Okafor | Animal Shelter Attendant | County-born human | You open a shelter's isolation wing after a quarantine alert and find a bitten volunteer holding the keys while frightened dogs threaten to draw the infected outside. |
| seed_zom_10 | The Apartment Intercom Test | Jin Parke | Building Caretaker | High-rise human | You test an apartment intercom after a lockdown broadcast and hear a trapped resident whisper from a floor whose stairwell camera shows movement at every landing. |

### apocalypse — 5 new; 5 → 10

| ID | Title | Hero | Role | Origin | Situation |
| --- | --- | --- | --- | --- | --- |
| seed_apo_06 | The Filter Beneath the Ash | Anik Silt | Filter Salvager | Bunker-raised human | You emerge into an ash valley to find a fallen clinic holding the last compatible water filter while a dust front closes over its exposed basement. |
| seed_apo_07 | The Last Dry Bearing | Petra Coil | Turbine Repairer | Ridge-settlement human | You reach a rusting wind tower with one replacement bearing and discover its power line also feeds the settlement that drove your caravan away. |
| seed_apo_08 | The Toll of Green Copper | Dax Marrow | Caravan Broker | Salt-flat human | You enter a reclaimed rail cutting where traders demand copper for safe passage and your radiation meter rises beside the only alternative path. |
| seed_apo_09 | The Seed Bank's Warm Wall | Etta Thimble | Seed Custodian | Underpass-born human | You inspect a buried seed bank and find roots warming its refrigeration wall while your failing battery can power either the doors or the cooling system. |
| seed_apo_10 | The Rain Catcher's Shadow | Rafi Cinder | Weather Scout | Ruin-raised human | You climb an abandoned overpass to test a rain-catching rig and spot a clean cloud moving toward a contaminated basin where another camp has already gathered. |

### real_life — 5 new; 5 → 10

| ID | Title | Hero | Role | Origin | Situation |
| --- | --- | --- | --- | --- | --- |
| seed_rl_06 | The Shift Nobody Claimed | Naomi Serrano | Cafe Shift Lead | Queens-raised human | You unlock a station cafe before rush hour and find the rota changed overnight while two exhausted coworkers each insist the opening shift was promised to the other. |
| seed_rl_07 | The Ramp Before the Opening | Devika Rao | Exhibition Producer | City-born human | You reach a small exhibition venue and discover the hired access ramp does not fit as the first invited guests arrive outside its stepped entrance. |
| seed_rl_08 | The Interview Without a Room | Elliot Brooks | Job Applicant | Commuter-town human | You arrive for a final interview and find another candidate assigned the same panel and time while the receptionist asks which of you will go first. |
| seed_rl_09 | The Deposit on Table Four | Ines Duarte | Restaurant Bookings Coordinator | Riverside-raised human | You check an evening booking at a neighborhood restaurant and discover two families paid deposits for the same anniversary table as both parties enter together. |
| seed_rl_10 | The Last Box in the Lift | Kareem Bell | Tenant Organizer | Estate-raised human | You meet neighbors at a moving-day lift and learn its maintenance shutdown starts in ten minutes while an older resident's essential belongings remain upstairs. |

### romantic — 3 new; 7 → 10

| ID | Title | Hero | Role | Origin | Situation |
| --- | --- | --- | --- | --- | --- |
| seed_rom_08 | The Duet Behind the Curtain | Isabeau Renard | Court Violinist | Canal-city human | You arrive for a candlelit court recital and discover your assigned duet partner composed the anonymous melody that ended your last engagement. |
| seed_rom_09 | The Orange Tree Truce | Sabine Delatour | Botanical Envoy | Southern-coast human | You enter a palace conservatory to negotiate a border garden and find your former beloved tending the tree planted for a promise neither of you fulfilled. |
| seed_rom_10 | The Invitation in Unfinished Ink | Elodie Marchal | Court Calligrapher | Provincial human | You deliver a ceremonial invitation to a moonlit terrace and catch your sharpest critic practicing a reply to a love declaration in your own handwriting. |

### revenge — 2 new; 8 → 10

| ID | Title | Hero | Role | Origin | Situation |
| --- | --- | --- | --- | --- | --- |
| seed_rev_09 | The Funeral Seat Reserved | Sevran Locke | Syndicate Infiltrator | Harbor exile | You return by midnight train to the funeral of the broker who sold your family and find your seat reserved beside the only witness your enemies failed to silence. |
| seed_rev_10 | The Quarry Payroll | Mirel Dusk | Claims Investigator | Quarry-camp survivor | You enter a rain-soaked workers' diner with proof that the foreman bought your conviction and learn his wage courier will arrive before the witness can escape. |

## 3. Job B plan: three complete stories

The following are design specifications, not final story.json prose. In graph tables, `flag=true` means `{ "flag": "flag", "is": true }`; counter equality uses `equals`. Every listed flag starts false (bool) or 0 (counter). Every ordinary beat will have 2–4 authored choices and a specific in-fiction hint. Endings have `isEnding: true`, `exits: []`, `choices: []`, `goal: []`, and an `endingTitle`. The brief's 2–4 choices applies to playable beats; terminal scenes offer no more actions.

Effects are applied before target gates in the current engine. Every advancing choice below sets its current beat's goal true itself, then targets an exit. No route depends on a narrator-only effect. Route destinations require the chosen route counter; endings require the corresponding outcome counter. There are no other entry conditions. Clues remain local to the beat where they matter, so free conversation cannot make an authored solution unavailable.

### B1. spirit-bathhouse-night-shift

**Title:** The Seventh Night at the Spirit Bathhouse. **Category:** cozy_ghibli. **Mode:** character, `meta.character: genzo`. **Rating:** everyone.

**Blurb:** Your first week at a bathhouse for tired spirits begins with a kettle that will not stop sighing. The grumpy tanuki owner has seven nights to decide whether you belong, and an opinion about how you fold every towel.

**World:** A cedar bathhouse sits where a hillside stream crosses an old spirit road. Guests arrive carrying the small discomforts of their travels: cold wings, aching scales, wet leaves and worries they have not said aloud. Water follows hospitality rather than status, so an unattended need can turn a bath lukewarm or make steam linger in a doorway. Genzo owns the house and works beside the new helper throughout the week; he is assessing whether they can listen, ask for help and find a sustainable way to work. The seventh-night gathering is a community ritual, not a threat to anyone's safety. The house is an original place with its own guests and customs.

**Tone:** Warm practical rituals, mild comic friction, quiet generosity, room to decline. No cruelty or lethal jeopardy. **Player:** New night-shift helper carrying an apron, towel roll, cedar ladle, pencil and a pocket notebook. Their name, identity and inner thoughts remain theirs to supply. **Narrator style:** First-person Genzo dialogue and brief descriptions of what he observes or does; never narrate another cast member's thoughts or scenes he cannot witness. Short dry observations gradually become invitations to collaborate. The world and each scene brief repeat this viewpoint rule for compact prompts.

| Cast ID / portrait | Fixed appearance for prose and art | Voice | Stance toward player |
| --- | --- | --- | --- |
| genzo | An elderly, broad tanuki with silver-brown fur, amber eyes, a nick in his left ear, a navy work jacket, a russet apron and a cedar ladle at his belt. | Genzo speaks in short, gravelly first-person sentences, complains about tools instead of people, and hides praise in practical advice. He pauses before admitting worry, asks rather than orders at turning points, and describes only what he notices or does. | Skeptical of grand promises; protective of guests and the helper's limits; learns to share responsibility. |
| suzu | A small moth spirit with cream wing-fringe hair, round black eyes, a slight build, a moss-green cape and a tiny copper hot-water bottle. | Suzu speaks softly, repeats a request more clearly when heard, and uses precise words for warmth. | Wary of inconveniencing a newcomer; welcomes respectful questions. |
| raku | A tall carp spirit with swept-back white hair, gold eyes, a long sturdy build, a teal robe and orange scale markings along both cheeks. | Raku speaks slowly and formally, then becomes chatty about tiny comforts. | Expects to be treated as a guest rather than an impressive spectacle. |

**Beat graph:** start `first_kettle`. The first row covers night 1, second night 2, either route nights 3–4, convergence nights 5–6, and final decision night 7. Each scene brief states the date span and offers player-led pauses; there is no hidden real-time clock or simulated seven-day subsystem.

| Beat ID | What happens / narrator-only information | Goal | Exits | Ending? |
| --- | --- | --- | --- | --- |
| first_kettle | Night 1: Genzo's sighing kettle is responding to a cold arrival, not a broken stove; he observes the helper's first approach. | welcome_ready=true | guest_tokens | no |
| guest_tokens | Night 2: bath tokens have been swapped; the complaints concern quiet and warmth, not rank; choose which need to follow first. **BRANCH** | route_chosen=true | steam_roof, river_bath | no |
| steam_roof | Nights 3–4: Suzu's resting niche is cold because a vent points toward it; Genzo accompanies the helper to adjust the screen or offer another resting place. Entry: route=1. | moth_heard=true | shared_rota | no |
| river_bath | Nights 3–4: Raku misses the sound of running water; a safe bypass or a quieter tub can help without giving him every bath. Entry: route=2. | carp_heard=true | shared_rota | no |
| shared_rota | Nights 5–6: guest needs recur; Genzo's real difficulty is trying to remember everything alone; either route contributes a practical lesson. | rota_agreed=true | seventh_night | no |
| seventh_night | Night 7: the house is ready; Genzo asks what arrangement the helper actually wants; employment is not a morality score. | terms_spoken=true | stay, share, depart | no |
| stay | Genzo offers a regular place with agreed rest and training; the helper accepts a sustainable role. Entry: outcome=1. | none | none | yes |
| share | They agree on a rotating visiting arrangement and shared guest notes instead of a permanent post. Entry: outcome=2. | none | none | yes |
| depart | The helper finishes the trial and leaves with thanks and an open invitation; departure is a complete, kind ending. Entry: outcome=3. | none | none | yes |

**Choice contract and hints** (exact choice IDs reserved; final labels may be polished within 120 characters):

| Beat | Authored choices: id — action → effects → target | Hint |
| --- | --- | --- |
| first_kettle | warm_cup — offer the arrival a warm cup → welcome_ready=true → guest_tokens; ask_genzo — ask Genzo how to welcome a cold traveler → welcome_ready=true → guest_tokens | Genzo sets a spare cup beside the sighing kettle. |
| guest_tokens | follow_moth — ask about the cold resting niche → route_chosen=true, route=1 → steam_roof; follow_carp — ask what is missing from the river bath → route_chosen=true, route=2 → river_bath | Genzo places the two swapped tokens side by side. |
| steam_roof | turn_screen — redirect the draft with Genzo → moth_heard=true → shared_rota; offer_nook — offer Suzu the sheltered nook → moth_heard=true → shared_rota | Suzu warms her wings around the copper bottle. |
| river_bath | open_bypass — ask Genzo to help restore the water's sound → carp_heard=true → shared_rota; offer_tub — offer Raku the smaller running-water tub → carp_heard=true → shared_rota | Raku listens toward the silent inlet instead of testing the water. |
| shared_rota | write_notes — build guest notes together → rota_agreed=true → seventh_night; pair_rounds — agree on paired rounds and rest → rota_agreed=true → seventh_night | Genzo counts the same task twice on his fingers. |
| seventh_night | accept_post — accept a regular post with rest days → terms_spoken=true, outcome=1 → stay; propose_rotation — propose a visiting rota → terms_spoken=true, outcome=2 → share; leave_kindly — finish the trial and say goodbye → terms_spoken=true, outcome=3 → depart | Genzo says he has asked what the house needs but not what you need. |

**Flags:** `welcome_ready` bool: first arrival has a welcome plan; `route_chosen` bool: a guest concern has been chosen; `route` counter: 0 unset, 1 Suzu's niche, 2 Raku's bath; `moth_heard` bool: Suzu's need has a workable response; `carp_heard` bool: Raku's need has a workable response; `rota_agreed` bool: recurring tasks are shared sustainably; `terms_spoken` bool: the helper has stated their preferred arrangement; `outcome` counter: 0 unset, 1 regular post, 2 visiting rota, 3 leave kindly. One-line descriptions will carry these meanings, not hidden scores.

**Reachability and gate proof:** `first_kettle → guest_tokens → steam_roof → shared_rota → seventh_night → stay/share/depart` and the same path substituting `river_bath` reach all nine beats. `follow_moth` sets route=1 and `follow_carp` route=2 before checking the respective entry. Each final choice sets its required outcome before entry. All six non-ending rows have at least two choices setting the named goal to true. Either route allows all three endings, giving six complete route/ending combinations without narrator intervention. Every edge advances toward a terminal beat; none loops or strands the player.

**Art list:** Each listed ID maps to `<id>.png` plus `<id>.webp` in this story's art folder. Portraits square; all other pictures landscape. Palette: cedar brown, moss green, cream steam, restrained amber. Genzo is present in route scenes to preserve character-mode viewpoint. Do not depict bathing bodies; use clothed guests, towels, architecture and water.

| Art ID | What it shows | Reference / trigger |
| --- | --- | --- |
| cover | Cedar bathhouse at twilight, Genzo holding a towel beside the doorway. | meta.cover |
| genzo | Head-and-shoulders portrait with the fixed nicked ear and work clothes. | cast.genzo.portrait |
| suzu | Head-and-shoulders moth-spirit portrait with moss cape and copper bottle. | cast.suzu.portrait |
| raku | Head-and-shoulders carp-spirit portrait with orange cheek scales. | cast.raku.portrait |
| first-kettle | A sighing copper kettle and two cups on a cedar counter. | first_kettle enter |
| guest-tokens | Two mismatched bath tokens in Genzo's open hand. | guest_tokens enter |
| steam-roof | Genzo and Suzu beside a wind screen under a tiled eave. | steam_roof enter |
| river-bath | Genzo and clothed Raku by a stone inlet and cedar tub. | river_bath enter |
| shared-rota | Genzo beside folded towels, guest tokens and an open notebook without legible marks. | shared_rota enter; skin.backgroundArt |
| seventh-night | Genzo setting two tea cups at a low table by the open door. | seventh_night enter |
| settled-apron | A clean apron beside Genzo's familiar russet one on separate pegs. | stay enter |
| visiting-lantern | Genzo placing a small visitor lantern by the garden gate. | share enter |
| morning-path | Genzo waving from the doorway toward a sunlit hillside path. | depart enter |
| warm-cup | A warm cup offered beneath Suzu's copper bottle. | first_kettle choice warm_cup |

**Skin overrides:** `palette.accent: #e6bd82`, `backgroundArt: shared-rota`, `particles: motes`. Inherit the cozy category's soft bubbles, hand heading, sans body and warm dark surfaces. No extra audio asset or invented ambient identifier.

### B2. the-caller-knows-your-house

**Title:** The Caller Knows Your House. **Category:** horror. **Mode:** story. **Rating:** teen.

**Blurb:** Alone in the late-night radio booth, you take a call from someone describing your empty house room by room. When a door opens there, the same sound comes through the studio wall.

**World:** A small town's overnight radio station sits above a shuttered shop, a short drive from the host's empty house. Rain obscures the studio windows and the old mixing desk provides tactile, finite controls: input channels, a recording deck, a delay return and a physical transmitter cutoff. The caller can repeat rooms, sounds and movements already heard through an open broadcast path; live acknowledgments make that path more intimate. This is a supernatural pattern with limits, not a cybersecurity tutorial. Evidence establishes the useful rule through recordings and witnessed tests; nobody knows its complete origin. A colleague and a neighbor can help remotely, but neither is made to enter the house. Leaving the studio is possible after arranging a safe response, never a failure to be punished.

**Tone:** Slow, procedural dread; pauses and acoustic contradictions; no graphic injury, sexual threat or sudden unbeatable attacker. **Player:** Late-night host carrying a house key, phone, headphones and a pocket notebook. **Narrator style:** Close second-person present, ordinary sounds before their impossible doubles; concrete control positions; no invented player panic or forced speech. End with a decision. Keep the rule consistent, including after the safer ending.

| Cast ID / portrait | Fixed appearance for prose and art | Voice | Stance toward player |
| --- | --- | --- | --- |
| mira | A South Asian woman in her thirties with medium-brown skin, short black curls, dark brown eyes, a compact build, an olive cardigan, a white T-shirt and silver over-ear headphones. | Mira speaks in clipped practical questions, names one control at a time, and admits when she cannot explain a sound. | A trusted off-duty producer; helps verify evidence and supports leaving safely. |
| hal | A white man in his sixties with fair freckled skin, close-cropped white hair, grey eyes, a broad build, a mustard raincoat and a red knitted scarf. | Hal speaks plainly, reports only what he sees from his porch, and checks before approaching anything. | A concerned neighbor, willing to watch from a safe distance but not be used as bait. |
| caller | An adult-shaped, slender silhouette with shoulder-length dark hair, pale grey eyes, a charcoal coat and hands held close to the chest, seen only through frosted glass. | The caller uses calm declarative sentences and exact domestic sounds; it repeats the host's own wording with a slight delay and never explains its origin. | Seeks acknowledgment and a continuing audio path; cannot acquire knowledge from channels it has not heard. |

The caller portrait is an ambiguous visual motif in the package, not evidence that the player has already seen a face. Scenes keep the silhouette indistinct and only show it when supported by the beat; no portrait should disclose the solution.

| Beat ID | What happens / narrator-only information | Goal | Exits | Ending? |
| --- | --- | --- | --- | --- |
| open_line | An ordinary caller describes the host's hallway; logging a test establishes that this is live and local, not merely an old recording. | call_logged=true | choose_check | no |
| choose_check | A repeated latch sound offers two safe ways to verify the link: compare audio with Mira or ask Hal to observe externally. **BRANCH** | check_chosen=true | delay_room, porch_watch | no |
| delay_room | Mira helps compare the recording and delay return; the caller hears only what has passed through an open path. Entry: route=1. | audio_verified=true | patch_board | no |
| porch_watch | Hal sees the empty house react only after matching sounds air; he stays on his own porch. Entry: route=2. | house_verified=true | patch_board | no |
| patch_board | Either investigation reveals a return path between house sounds and the live line; choose a physical, comprehensible response setup. | response_ready=true | last_ring | no |
| last_ring | A final ring asks for acknowledgment; the player chooses to sever the path, isolate it on an unattended loop, or answer and maintain it. | decision_made=true | dead_air, closed_loop, answered | no |
| dead_air | The host cuts the live input and transmitter connection, leaves with help, and hears no further house sounds through the disconnected system. Entry: outcome=1. | none | none | yes |
| closed_loop | A recorded loop feeds only an isolated local return; the house goes quiet while an unanswered knock remains on that disconnected playback. Entry: outcome=2. | none | none | yes |
| answered | The host voluntarily acknowledges the caller on the live path; the next room described has the studio's furnishings. Entry: outcome=3. | none | none | yes |

| Beat | Authored choices: id — action → effects → target | Hint |
| --- | --- | --- |
| open_line | mark_time — mark the latch sound on the recorder → call_logged=true → choose_check; ask_detail — request a detail without giving a new one → call_logged=true → choose_check | The recorder's moving reels provide a testable sequence. |
| choose_check | compare_delay — ask Mira to compare the audio → check_chosen=true, route=1 → delay_room; call_neighbor — ask Hal to watch from his porch → check_chosen=true, route=2 → porch_watch | Mira can hear a recording; Hal can see the front window without entering. |
| delay_room | trace_return — compare the input with its return → audio_verified=true → patch_board; mute_test — test a muted input while recording locally → audio_verified=true → patch_board | The second latch sound follows the first by the delay interval. |
| porch_watch | time_lights — compare Hal's window observations with the call → house_verified=true → patch_board; check_footsteps — ask Hal to remain still during a repeated step → house_verified=true → patch_board | Hal says a room light changes only after its switch sound airs. |
| patch_board | prepare_cutoff — locate and test the physical cutoff → response_ready=true → last_ring; prepare_loop — prepare a recorded isolated return → response_ready=true → last_ring | Mira separates the live input, local recorder and transmitter controls. |
| last_ring | cut_signal — sever the live path and arrange a safe exit → decision_made=true, outcome=1 → dead_air; loop_signal — isolate the recording on a local loop → decision_made=true, outcome=2 → closed_loop; answer_live — knowingly answer on the live path → decision_made=true, outcome=3 → answered | The ring waits; the live input has not reopened by itself. |

**Flags:** `call_logged` bool: the first test is recorded; `check_chosen` bool: a verification method is chosen; `route` counter: 0 unset, 1 studio audio, 2 external observation; `audio_verified` bool: timing constrains the caller's knowledge; `house_verified` bool: Hal has safely confirmed the linked event; `response_ready` bool: the patch board and its usable responses are understood; `decision_made` bool: the host chooses how to handle the final ring; `outcome` counter: 0 unset, 1 sever, 2 isolate, 3 acknowledge.

Both patch-board choices explain and make available both controls, rather than locking the player to the first preparation. The distinction is emphasis and what the narrator describes first. Final actions explicitly perform their own setup as necessary. This keeps all three stated endings feasible from either investigation.

**Reachability and gate proof:** `open_line → choose_check → delay_room → patch_board → last_ring → dead_air/closed_loop/answered`, or substitute `porch_watch`, covers all nine beats. The route and outcome choices set their required numeric entry values before movement. All six playable beats have two or three choices satisfying their goal. All six route/ending combinations can complete through authored choices; the rule does not require guessed dialogue, a telephone number, narrator inference or exposing Hal to danger. Every reachable non-ending leads to an ending.

**Art list:** Fixed cast appearance lines repeated for depicted cast. Slate, dusty amber, desaturated red control lights; no text, graphic threat or solution embedded as a readable label. No visible or recognizable player character.

| Art ID | What it shows | Reference / trigger |
| --- | --- | --- |
| cover | An empty microphone booth with a dark house reflected in rain-streaked glass. | meta.cover |
| mira | Head-and-shoulders portrait of Mira with curls, olive cardigan and headphones. | cast.mira.portrait |
| hal | Head-and-shoulders portrait of Hal in mustard raincoat and red scarf. | cast.hal.portrait |
| caller | The ambiguous charcoal-coated figure behind frosted glass. | cast.caller.portrait |
| open-line | A handset off its cradle beside a slowly turning recorder. | open_line enter |
| choose-check | Mixing desk, phone and two contrasting pools of light, without UI text. | choose_check enter |
| delay-room | Empty recording desk with offset tape reels and low amber light. | delay_room enter; skin.backgroundArt |
| porch-watch | Hal under his own porch light, looking toward the closed house across the street. | porch_watch enter |
| patch-board | Separate cable paths and a physical cutoff on an old mixing desk. | patch_board enter |
| last-ring | A ringing phone beside a closed studio door. | last_ring enter |
| dead-air | A disconnected cable and microphone in early dawn light. | dead_air enter |
| closed-loop | Tape moving through an isolated local deck under a single lamp. | closed_loop enter |
| answered | The empty booth reflected as an impossible domestic hallway. | answered enter |
| return-trace | Close view of distinct input and return cables, no labels or instructions. | delay_room choice trace_return |

**Skin overrides:** `palette.accent: #d6aa72`, `particles: none`, `backgroundArt: delay-room`. Inherit horror's square bubbles, serif type, grain pattern and dark surfaces. No flashing or animated alarm effect added.

### B3. the-truthful-balloon

**Title:** The Truthful Balloon. **Category:** adventure. **Mode:** story. **Rating:** everyone.

**Blurb:** You inherit a half-finished sky map and a balloon that rises only when someone tells it the truth. Your first delivery waits beyond an uncharted bank of cloud, and the old route leaves something unsaid.

**World:** Harbors on tall sea cliffs trade with small inhabited sky islands using patched balloons, weather vanes, brass instruments and canvas docks. The apprentice inherits their mentor's unfinished map and a balloon whose stitched envelope tightens only around a freely offered truth believed by its speaker. Ordinary, non-private truths work; uncertainty can be admitted; repetition is not an infinite fuel supply because each new stage of flight needs an honest observation or intention relevant to that stage. Lies slacken the canvas and force a controlled landing at the nearest safe mooring, never a fatal plunge. The missing map section reflects the mentor's unacknowledged mistake about a community's route. The narrator knows this rule but reveals the history through evidence and conversation, not forced confession.

**Tone:** Brisk discovery, bright salt air, practical teamwork, honest uncertainty and repair. **Player:** Cartographer's apprentice carrying the inherited map tube, charcoal, brass sighting compass, rope and a packed lunch. **Narrator style:** Second-person present, concrete wind and rope details, legible spatial choices; no invented confession, hidden lie detector scoring, or assigned player secrets. Ask before committing the player to any statement.

| Cast ID / portrait | Fixed appearance for prose and art | Voice | Stance toward player |
| --- | --- | --- | --- |
| ren | A lean adult of mixed Black and white heritage with a dark braided undercut, hazel eyes, sun-browned medium-brown skin, a cropped ochre flight jacket, blue trousers and fingerless canvas gloves. | Ren speaks briskly, checks knots while talking, and admits uncertainty without losing momentum. | A practical rigging partner who will not pressure the apprentice to disclose private things. |
| siv | A small older white woman with fair weathered skin, thick silver hair tied in a bun, green eyes, a sturdy build, a sea-blue coat and a red scarf held by a brass compass pin. | Siv gives precise bearings, challenges confident claims gently, and allows silence while someone checks a measurement. | An island route keeper who wants her community represented accurately. |
| pavo | A round-bodied Black adult with deep-brown skin, tightly curled auburn hair, dark eyes, copper freckles, a cream shirt, a teal waistcoat and a canvas delivery satchel. | Pavo speaks in warm, quick phrases and catches himself when a convenient account is not fully true. | A fellow courier hoping for a faster route, able to accept a fair delay. |

| Beat ID | What happens / narrator-only information | Goal | Exits | Ending? |
| --- | --- | --- | --- | --- |
| mooring | Ren helps unpack the inheritance; a harmless observation or an honest request for help tightens the envelope. | lift_understood=true | route_wind | no |
| route_wind | The partial map offers a faster reef updraft or a calmer mail route; weather and a delivery deadline make the choice meaningful. **BRANCH** | route_chosen=true | reef_thermal, post_island | no |
| reef_thermal | Ren accompanies the apprentice along sea-cliff thermals; measurements expose the missing approach and a marked safe mooring. Entry: route=1. | coast_measured=true | blank_margin | no |
| post_island | Pavo and Ren compare old delivery records at a floating post landing; the omitted route has a living destination. Entry: route=2. | account_checked=true | blank_margin | no |
| blank_margin | At Siv's shared mooring, either evidence route reveals the mentor's overconfident old bearing; the apprentice can correct it or mark it uncertain. | margin_owned=true | map_table | no |
| map_table | With everyone safely moored, decide what to do with the corrected knowledge and the immediate delivery. | decision_stated=true | shared_chart, careful_return, long_survey | no |
| shared_chart | Publish a corrected shared chart and complete the delivery by the verified approach. Entry: outcome=1. | none | none | yes |
| careful_return | Return with an explicitly incomplete chart and arrange a slower safe delivery; honest limits are respected. Entry: outcome=2. | none | none | yes |
| long_survey | Arrange the delivery with Pavo and stay for a community survey before publishing a new edition. Entry: outcome=3. | none | none | yes |

| Beat | Authored choices: id — action → effects → target | Hint |
| --- | --- | --- |
| mooring | name_wind — state the direction you can observe → lift_understood=true → route_wind; admit_help — admit that you need Ren's help with the rig → lift_understood=true → route_wind | The envelope responds to an ordinary observation, not a grand confession. |
| route_wind | take_thermal — choose the reef's measured updraft → route_chosen=true, route=1 → reef_thermal; take_post — choose the mail landing and local advice → route_chosen=true, route=2 → post_island | Ren points out the time saved on one route and the resting dock on the other. |
| reef_thermal | measure_edge — take bearings together → coast_measured=true → blank_margin; mark_mooring — chart the safe mooring before continuing → coast_measured=true → blank_margin | A dock marker provides a fixed point against moving cloud. |
| post_island | compare_routes — compare Pavo's deliveries with the old chart → account_checked=true → blank_margin; ask_missing — ask who lives beyond the blank section → account_checked=true → blank_margin | Pavo's ordinary delivery stamps cover places the inherited map omits. |
| blank_margin | correct_bearing — record the old bearing's error with Siv → margin_owned=true → map_table; mark_unknown — clearly mark what still needs measurement → margin_owned=true → map_table | Siv asks which line was measured and which line was assumed. |
| map_table | share_chart — publish a corrected chart with its remaining limits → decision_stated=true, outcome=1 → shared_chart; return_safely — admit the route is not ready and return by known moorings → decision_stated=true, outcome=2 → careful_return; survey_together — arrange delivery and stay to survey with the islanders → decision_stated=true, outcome=3 → long_survey | The balloon lifts for a modest truthful plan as readily as a brave one. |

**Flags:** `lift_understood` bool: the apprentice knows a non-private truth can provide lift; `route_chosen` bool: the first route is chosen; `route` counter: 0 unset, 1 reef thermal, 2 mail island; `coast_measured` bool: coastal evidence is gathered; `account_checked` bool: local delivery evidence is gathered; `margin_owned` bool: map limits or errors are acknowledged on the page; `decision_stated` bool: the next honest plan is chosen; `outcome` counter: 0 unset, 1 share chart, 2 return, 3 survey.

**Reachability and gate proof:** `mooring → route_wind → reef_thermal → blank_margin → map_table → shared_chart/careful_return/long_survey`, or substitute `post_island`, reaches all nine beats. Route choices set the matching numeric entry; final choices set the ending entry. Every playable beat has two or three choices setting its own goal true. Six authored route/ending combinations complete; neither route requires the other route's evidence flag. Both blank-margin choices lead to a responsible version of any ending, with uncertainties retained. No character must reveal a secret or lie to advance.

**Art list:** Salt turquoise, canvas cream, ochre, coral flags and sunlit cloud; readable wind and geography. Preserve the inherited half-map and the same ochre-and-cream patched balloon with three teal repair panels. No readable map text. No fixed face, gender or appearance assigned to the player.

| Art ID | What it shows | Reference / trigger |
| --- | --- | --- |
| cover | Patched ochre-and-cream balloon above sea cliffs, an open half-map in the foreground. | meta.cover |
| ren | Head-and-shoulders portrait of Ren in flight jacket with braided undercut. | cast.ren.portrait |
| siv | Head-and-shoulders portrait of Siv with compass pin and red scarf. | cast.siv.portrait |
| pavo | Head-and-shoulders portrait of Pavo in teal waistcoat and cream shirt. | cast.pavo.portrait |
| mooring | Ren by slack balloon ropes at a bright canvas dock. | mooring enter |
| route-wind | Two cloud passages over a coast, one with thermals, one with a post landing. | route_wind enter |
| reef-thermal | Balloon riding a coastal updraft over turquoise reef water. | reef_thermal enter |
| post-island | Pavo and Ren at a small post dock with canvas mail sacks. | post_island enter |
| blank-margin | Siv and Ren comparing a half-finished map with a coastal sighting compass. | blank_margin enter |
| map-table | Quiet chart table on a secure mooring with cloud shadows and a packed lunch. | map_table enter; skin.backgroundArt |
| shared-chart | Siv and Pavo holding the corrected chart beside several island boats. | shared_chart enter |
| careful-return | Balloon approaching a familiar coastal dock in soft evening light. | careful_return enter |
| long-survey | Ren, Siv and Pavo preparing survey stakes together on a grassy island. | long_survey enter |
| truthful-lift | Three teal repair panels pulling taut as the envelope catches light. | mooring choice name_wind |

**Skin overrides:** `palette.accent: #e7ba72`, `pattern: waves`, `backgroundArt: map-table`. Inherit adventure's rounded bubbles, display heading, sans body, dark green surfaces and no particles.

## 4. Job C plan: eight Lantern pictures

Use the exact current cast appearance strings from stories/lantern-of-hollowmere/story.json, repeated word for word for each depicted character. Portraits first and reused as references; do not redesign either character. Soft painterly anime, no text, logos, watermarks or signatures. Portraits 768×768; landscape delivery 1024×576. The same small chain-pulled wooden ferry and bell-tower silhouette recur.

| Output under chatgpt/output/lantern-of-hollowmere/ | Composition and palette |
| --- | --- |
| odda.png / odda.webp | Square head-and-shoulders Odda, broad weathered face, cropped iron-grey hair and pale blue eyes, oversized oilskin collar; blue dusk with a restrained amber rim. |
| maelis.png / maelis.webp | Square head-and-shoulders Maelis, about fifteen, floating dark hair, grey smock and water-lit face; translucent lake blue against dark desaturated water, no adult glamorization. |
| cover.png / cover.webp | Brass lantern large in the foreground on the ferry; iron chain leads the eye toward the tower across still black water; blue-burning light within amber brass, muted blue dusk. |
| landing.png / landing.webp | Low view along wet landing planks; heavy iron chain recedes diagonally into the lake with the tower distant; slate blue, weathered wood and faint amber sky. |
| crossing.png / crossing.webp | Wide quiet ferry silhouette with chain and barely submerged rooflines; low central contrast and broad calm water suitable behind chat; deep blue with one restrained blue lantern glow. |
| lights.png / lights.webp | Subsurface view between drowned rooftops; small blue lights drift through window shapes and dark water; layered muted blues, no violent imagery or human remains. |
| bell.png / bell.webp | Bell suspended in the tower's flooded chamber and air pocket, blue glass shard clearly set in the rim; oxidized amber bronze surrounded by dark cool stone and water. |
| dawn.png / dawn.webp | Match crossing's lake and tower geography at dawn; ordinary water, dark tower, no remaining blue lights; mist blue, pale amber horizon and gentle neutral reflections. |

Lantern's story.json and art IDs remain unchanged. Its existing references are: cover → meta.cover; odda and maelis → cast portraits; landing/crossing/bell/dawn → enter cues; lights → crossing's listen choice; crossing → background; maelis → knows_name flag cue. No additional cue or filename is invented.

## 5. Implementation plan

### File ownership and opener merge map

Only chatgpt/ is writable for this assignment. Existing MASTER_PROMPT.md, README.md, materials and reference copies are inputs and stay untouched. The working tree already has handoff changes from before this task; preserve them. The current branch matches the handoff branch. Recheck live opener counts, IDs and names before Phase 2 and again before Claude installs, to catch concurrent additions.

| Source array in chatgpt/output/openers.json | Exact destination | Append range | Done after install |
| --- | --- | --- | --- |
| adventure | src/content/categories/adventure.ts | seed_adv_01–seed_adv_10 | 10 total |
| historical_adventure | src/content/categories/historical_adventure.ts | seed_his_01–seed_his_10 | 10 total |
| ancient_greek | src/content/categories/ancient_greek.ts | seed_grk_02–seed_grk_10 | 10 total |
| mythology | src/content/categories/mythology.ts | seed_myth_02–seed_myth_10 | 10 total |
| psychedelic_trip | src/content/categories/psychedelic_trip.ts | seed_psy_03–seed_psy_10 | 10 total |
| cosmic_horror | src/content/categories/cosmic_horror.ts | seed_cos_04–seed_cos_10 | 10 total |
| zombie | src/content/categories/zombie.ts | seed_zom_05–seed_zom_10 | 10 total |
| apocalypse | src/content/categories/apocalypse.ts | seed_apo_06–seed_apo_10 | 10 total |
| real_life | src/content/categories/real_life.ts | seed_rl_06–seed_rl_10 | 10 total |
| romantic | src/content/categories/romantic.ts | seed_rom_08–seed_rom_10 | 10 total |
| revenge | src/content/categories/revenge.ts | seed_rev_09–seed_rev_10 | 10 total |

Claude appends only each source array's NEW objects into that file's existing `"openers": [...]` array, in ID order, double quotes and two-space indentation. Preserve all other fields, arrays and existing opener bytes where practical. No import registration is needed because the categories already exist. Check with `npm run content:check -- --strict`; success is zero errors and zero gaps, all 15 categories at ten, no duplicate normalized identities.

During the handoff, `npx tsx chatgpt/output/check-handoff.ts` imports CATEGORY_CONTENT and validateContent, creates a new in-memory merged table without mutating source objects, and runs `validateContent(..., { strict: true })`. It also checks the brief's stricter rules which the repository checker does not enforce: exact new keys and ID sets, field types, 2–4 gear entries, equipped weapon, three different verb-led actions, premise second person, HP 6–18, ability count and grounded-category exclusions, all-string bracket/HTML bans, and semantic origin review. Verb-led wording, meaningful choices and origin quality receive human editorial review as well as deterministic checks; a regex alone cannot establish them.

### Story packages: every JSON and art destination

| Story source JSON | Exact installed JSON | Every art source ID from Section 3 maps to |
| --- | --- | --- |
| chatgpt/output/stories/spirit-bathhouse-night-shift/story.json | stories/spirit-bathhouse-night-shift/story.json | chatgpt/output/stories/spirit-bathhouse-night-shift/art/<id>.png → same directory/<id>.webp → public/story-art/spirit-bathhouse-night-shift/<id>.webp |
| chatgpt/output/stories/the-caller-knows-your-house/story.json | stories/the-caller-knows-your-house/story.json | chatgpt/output/stories/the-caller-knows-your-house/art/<id>.png → same directory/<id>.webp → public/story-art/the-caller-knows-your-house/<id>.webp |
| chatgpt/output/stories/the-truthful-balloon/story.json | stories/the-truthful-balloon/story.json | chatgpt/output/stories/the-truthful-balloon/art/<id>.png → same directory/<id>.webp → public/story-art/the-truthful-balloon/<id>.webp |

These mappings enumerate all 42 image IDs by reference to the complete art tables, with no unnamed slots. PNGs are review masters, not runtime references. Convert square portraits to exactly 768×768 and all landscape images to 1024×576, preserving composition; if the generator returns a different aspect ratio, plan the framing before cropping and inspect the result. All WebPs must be at most 250,000 bytes (satisfies both ordinary KB and the importer's 250×1024-byte ceiling). Do not fake a WebP by changing an extension. Verify signatures, dimensions, decodability and appearance. Every art entry is `{ "file": "<id>.webp", "alt": "<one descriptive sentence>" }`; omit url so the importer selects the installation location.

Build checks after art conversion:

```powershell
npx tsx chatgpt/output/check-handoff.ts
npm run story:check -- chatgpt/output/stories/spirit-bathhouse-night-shift
npm run story:check -- chatgpt/output/stories/the-caller-knows-your-house
npm run story:check -- chatgpt/output/stories/the-truthful-balloon
```

The helper additionally enumerates authored-choice states with the real `newState` and `applyChoice` functions, confirms both route destinations and all six route/ending combinations per story, records witness choice sequences, rejects undeclared flags, and requires each non-ending goal be satisfiable. Check all art references in both directions, 3 cast portraits + cover + 10 cue images, 9 beats with 3 terminal endings, mode/character agreement, and schema lengths/enums. Calculate resolved text and muted-text contrast against both bubbles and main surfaces (at least 4.5:1 for ordinary text); do not assume the skin schema checks contrast.

Claude's mechanical install, after checks pass and conversion is already complete:

```powershell
npm run story:import -- chatgpt/output/stories/spirit-bathhouse-night-shift --dry-run
npm run story:import -- chatgpt/output/stories/the-caller-knows-your-house --dry-run
npm run story:import -- chatgpt/output/stories/the-truthful-balloon --dry-run
```

Inspect the dry-run destinations. Then rerun the same commands without `--dry-run` to install. The importer writes the exact stories/<id>/story.json and, without configured R2, copies art to the public/story-art path above. If R2 is configured it uploads instead and writes art.url, as already designed; do not change credentials, hosting or environment configuration. The dry run exposes which destination will be used without making an upload. Story catalog discovery is automatic through the existing Vite story index; no hand-edited catalog registration.

Done means every package prints OK, warnings are resolved or explicitly justified, real WebPs exist and stay within limits, Story mode shows the new cover and correct rating, Genzo remains the speaking character in both prompt variants, all branches/endings work, and save/reload retains flags, current beat and art history. Phase 2 content checks alone will not be labeled browser or model-behavior proof; installation/play verification belongs to Claude's integration pass.

### Lantern, helper and report mappings

Every name in Section 4 maps `chatgpt/output/lantern-of-hollowmere/<name>.png` → converted sibling `<name>.webp` → `public/story-art/lantern-of-hollowmere/<name>.webp`. Claude replaces only those eight placeholder WebPs. No story import is needed for unchanged Lantern JSON. The helper validates format, dimensions, byte size and that the exact eight file names match Lantern's art map. After replacement run `npm run story:check -- stories/lantern-of-hollowmere` and visually verify cover, portraits, entry/choice/flag cues and the dimmed crossing background. Done means eight actual illustrations with the required character continuity and zero missing images. The checker's presence check does not prove image content.

`chatgpt/output/check-handoff.ts` stays in the handoff folder; it is not installed into src/ or package.json. Run it with the command above. `chatgpt/output/DONE.md` stays in the handoff folder, listing all 106 delivered files, actual command results including failures and fixes, any unanswered question, and every departure from this plan. No claim of final runtime integration before that check occurs. PLAN.md remains the design record, not game content.

Claude's final repository checks after installing all content and art:

```powershell
npm run content:check -- --strict
npm run story:check
npx tsc --noEmit
npm test
npx vite build
```

Then verify browser console, opener setup population, the three story routes and Lantern art in the app, and prepare the single integration PR described in the handoff. I will not edit outside chatgpt/, upload to R2, push a PR or message another person from this content-only assignment.

## 6. Work order and self-checks

1. **Phase 1, this delivery:** Read the required handoff and live definitions; check snapshot parity; reserve all 74 opener identities; specify story graphs, state effects, visual continuity and exact installation mapping. Check the saved plan, then stop for the user's go.
2. **After go:** Recheck counts/IDs against live files once. Follow the master prompt's `npm ci` requirement only as a dependency-preparation step, not an AI request. See the scope conflict below: a clean install changes node_modules outside chatgpt/, so the strict content-only workflow uses the existing dependencies or has Claude prepare them. Do not silently modify anything outside scope.
3. Build openers one category at a time, filling every field. Run all-string safety/length/uniqueness checks before saving; validate the merged in-memory table. Review variation in place, dilemma and first moves rather than merely swapping nouns.
4. Build each story's final JSON and the deterministic helper. Check schema and state-space progression without art presence first via `checkStory(raw)`; keep that result explicitly separate from package completeness. All flags/cues/targets declared, all goal flags player-settable, every beat reachable and every ending attainable. Supply each beat's hint and keep final prose within the live Zod bounds.
5. For each art set, lock portraits first, then cover, then scene images, repeating exact appearance lines and using approved portrait references wherever the image tool supports it. Follow the image generation skill at production time. Use no image calls during planning, no throwaway generations and no placeholder artwork. Reuse continuity references, not one image as multiple distinct promised scenes.
6. Inspect each image at useful size for identity, anatomy, object continuity, absence of text/logos, composition and correct scene state. Convert locally to the specified WebP dimensions and byte cap; inspect the exported file. Keep conversions and any scratch files within chatgpt/; do not install dependencies or assets elsewhere without resolving scope.
7. Run the helper and the three package CLI checks, resolving every actual error and reviewing warnings. Verify PNG/WebP counts, signatures, dimensions and actual unique contents. Review contrast mathematically and in the installed UI during Claude's integration pass.
8. Produce DONE.md only after all promised files exist; list actual checks without substituting a validator read for a passed command. Remove task-owned temporary files within chatgpt/ after verifying their resolved paths. Preserve pre-existing inputs and concurrent work. Hand the finished package back for Claude's install.

Before each final save: valid UTF-8 JSON where applicable; no accidental markdown fences or metadata; exact filenames and IDs; no empty/duplicate sections; no source passage copying; original genre-appropriate prose; no prompt/parser-token leakage; correct author and rating; text and image accessibility; exact output path under chatgpt/.

## 7. Risks and questions

- **PNG versus package checking, resolved in this plan:** the brief delegates conversion to Claude, but story:check requires art filenames matching `.webp` and does not accept PNG substitutes. Deliver both masters and local WebP conversions before claiming full package validation. This adds converted deliverables without changing the game schema. If conversion is unavailable, report schema/graph-only results and the explicit blocked image checks; never call the package complete.
- **Dependency preparation versus path ownership:** MASTER_PROMPT says both “Do not change any file outside chatgpt/” and “run npm ci once.” npm ci rewrites node_modules outside that boundary and may run lifecycle scripts. Existing node_modules is present now. At Phase 2, use the available local tools; ask Claude to perform the clean install as integration preparation if needed, recording the deviation. No clean install is needed for this documentation-only phase.
- **Checker strictness:** the handoff says content:check always fails on short categories. The live script reports shortages as gaps unless `--strict` is passed. Use the strict command for the merged audit and final acceptance. The live validator also allows HP 4–40 and misses several editorial rules; the brief's 6–18 and stricter checks still apply. Zod refinements require a real condition operator and exactly one set/add even where the JSON Schema cannot express them fully.
- **Example is not a perfect template:** Lantern's bell beat has an empty goal and does not demonstrate the stricter “change a goal flag at every playable beat” requirement. The new stories explicitly give all six playable beats a goal and authored effects; do not copy that empty-goal pattern.
- **Art count interpretation:** 8–12 art cues is additional to a cover and portraits. Plan exactly ten distinct cue images per story (nine enter cues plus one choice cue), giving fourteen images with the three portraits and cover. Endings receive enter art; a single playthrough naturally sees only its chosen route/ending.
- **Character-mode continuity:** Genzo accompanies both guest routes and speaks only from his own perspective. Compact prompts omit narratorStyle, so essential viewpoint constraints are also stated in world, cast voice and scene briefs. Runtime/model compliance still needs an installed play check.
- **Palette and light:** Hollowmere's brass remains amber, but its lantern flame is blue as the art brief specifies. Warm reflections must not turn the flame orange. Each calm background is separately inspected after dimming in the UI.
- **Historical authenticity:** the opener rows use fictional people in broadly identified periods and avoid disputed precise incidents. During prose drafting, verify any specific introduced historical assertion against authoritative material or remove it; do not repeat cinematic seed details as established history. Mythology favors the existing saga voice, with one clearly mythic Egyptian setting; keep traditions distinct and avoid presenting invented episodes as canonical religion.
- **Generation and conversion availability:** no image generation or conversion has been attempted in Phase 1. Production must first read the image tool skill, confirm local file output and reference handling, and choose available conversion tools. Tool limits or unavailable outputs belong in DONE.md with precise failed checks. Do not replace pictures with prose prompts and claim delivery.
- **Concurrent changes:** the branch name and reference parity were verified now, but future live files win. A conflicting newly added opener requires a fresh reservation check before building or installing; do not overwrite another contributor's work.
- **Installation hosting:** story:import may upload to R2 when its existing environment is configured. Claude should inspect the dry run before installation. Lantern replacement uses the existing local public paths; if its live JSON later gains remote URLs, resolve that path discrepancy before replacing files.

No blocking creative questions remain for this plan. The explicit next step is review followed by **go**, not automatic production.

### Phase 1 verification record

- All 74 proposed opener rows passed a deterministic pre-save audit against the live 15-category opener table: exact IDs and per-category counts, normalized title/name uniqueness, category banned words with plural/prefix matching, forbidden origins and available field lengths.
- Parsed all three saved Markdown graphs and choice contracts into temporary in-memory graph objects and exercised the current `src/story/engine.ts` functions through the installed tsx runtime. Result per story: 9/9 beats reached, all 6 route/ending combinations reached, zero rejected authored transitions, all 6 non-ending goals directly satisfied by their advancing choices, and endings without exits.
- Verified 14 distinct art IDs and 10 valid beat/choice cue references per new story, giving 42 new-story images plus 8 Lantern images. Confirmed all seven requested plan sections and all 74 opener rows exist in the saved file.
- These checks validate the design, not final JSON schema conformance, image production or browser/model behavior. Those checks await Phase 2 and installation.
- `npx tsc --noEmit` failed on five unresolved imports in the pre-existing reference copies: content/categories/index.ts, content/categoryIds.ts, content/types.ts and story/skins.ts reference missing copied types; story/art.ts references missing copied storage/db. Root tsconfig includes chatgpt/reference because it has no handoff exclusion. No source/config/reference edits were made to suppress these baseline errors; Claude should resolve the integration check scope.
- Production compilation passed (2,039 modules) using the current Vite config with output redirected to task-owned chatgpt/.phase1-build. To avoid bundled-config temporary writes outside chatgpt/, this used Vite's runner loader; its first attempt failed because the current config expects __dirname. A Node wrapper supplied the repository directory as globalThis.__dirname, then invoked the same Vite build with the runner and redirected output. No config was edited. The existing large-chunk warning remains. The temporary build directory was removed after verification; no production content was installed.

### Approved production steering

The user requested racially diverse casts during production. Human cast descriptions now explicitly include South Asian Mira, white Hal, mixed Black/white Ren, white Siv and Black Pavo. Existing finished portraits are preserved; Pavo and subsequent scene prompts use the clarified descriptions. These identities do not determine personality, virtue, skill or narrative outcome. Lantern's established character descriptions remain unchanged.

Production adds a muted-text colour override in each new story (`#d0c9b5`, `#c5b6b6`, `#bccab8`, respectively), so resolved secondary text also reaches 4.5:1 on every main surface and bubble. Exact measured minimums are 4.85:1, 8.43:1 and 6.68:1. These are the only additional skin overrides. Authoring scripts, image prompts, a local review page and verification records are retained under chatgpt/work/; none is installed into the game. The normal root typecheck still includes incomplete reference copies; the handoff-scoped config checks live source plus the new auditor without altering root configuration. Browser preview could not connect to the local server, so UI/model playthrough remains an integration check for Claude.
