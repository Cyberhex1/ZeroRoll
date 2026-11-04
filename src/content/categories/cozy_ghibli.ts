import type { CategoryContent } from '../types';

// Cozy / Studio Ghibli-esque. Openers, tropes and media are checked by scripts/validate-content.ts.
export const cozyGhibli = {
  "card": {
    "name": "Cozy / Studio Ghibli-esque",
    "tagline": "Studio Ghibli Whimsy, Flying Tea Bakeries & Moss Golems",
    "description": "Charming, heartwarming adventures inspired by Studio Ghibli: flying clockwork tea airships, friendly giant moss spirits, soothing herbal infusions, and whimsical parasol gliders.",
    "iconName": "Sparkles",
    "gradient": "from-amber-400/30 via-emerald-800/40 to-slate-950",
    "accentColor": "#34d399",
    "bgTheme": "ghibli",
    "defaultCharacter": {
      "name": "Mimi & Pip",
      "roleClass": "Spirit Baker",
      "raceOrigin": "Woodland Hearthling",
      "level": 1,
      "hp": 12,
      "maxHp": 12,
      "armorClass": 12,
      "initiativeBonus": 2,
      "stats": {
        "str": 10,
        "dex": 14,
        "con": 13,
        "int": 14,
        "wis": 16,
        "cha": 15
      },
      "inventory": [
        {
          "id": "i1",
          "name": "Carved Oak Rolling Pin",
          "type": "weapon",
          "quantity": 1,
          "isEquipped": true
        },
        {
          "id": "i2",
          "name": "Basket of Star-Flour & Honey Pastries",
          "type": "potion",
          "quantity": 4
        },
        {
          "id": "i3",
          "name": "Glider Parasol & Tea Kettle",
          "type": "misc",
          "quantity": 1
        }
      ],
      "spells": [
        "Warmth Spark",
        "Mend Spirit",
        "Gentle Breeze",
        "Plant Whisper"
      ],
      "statusEffects": [
        "Well-Rested"
      ],
      "backgroundNotes": "A heartwarming baker traveling across floating islands to bring joy with enchanted tea."
    },
    "samplePrompts": [
      "I bake a fresh tray of star-honey cinnamon rolls to welcome the morning spirits.",
      "I step out onto the meadow grass with Pip to greet the local flower spirits.",
      "I check my grandmother's magical recipe journal for today's herbal blend."
    ]
  },
  "profile": {
    "seedSource": "Studio Ghibli & Heartwarming Whimsical Storytelling",
    "voice": "Gentle, warm, delightfully sensory, whimsical. Celebrates small culinary rituals, nature spirits, gentle companionship, and peaceful community connections.",
    "atmosphere": "Whistling copper tea kettles, star-honey cinnamon steam, flying clockwork tea shops, rolling blossom-filled meadow hills, parasol gliders, glowing spirit companions.",
    "sceneStructure": "1. Waking up in a charming shop or airship -> 2. Engaging in a cozy baking/brewing craft ritual -> 3. Greeting a whimsical spirit or friendly villager -> 4. Peaceful exploration choice.",
    "storyBeats": "Gentle discovery and harmony: brewing herbal infusions, helping nature spirits, solving low-stress village mysteries, flying over rolling hills, restoring balance through kindness.",
    "characterDynamics": "Flying tea bakers, glowing spirit foxes, soot helpers, botanical herbalists, kindly lighthouse keepers, delivery pelicans.",
    "encounterPatterns": "Baking star-honey pastries, greeting blossom spirits on windowsills, foraging fresh chamomile, tuning clockwork tea dispensers, sharing tea recipes.",
    "sensoryMotifs": [
      "The cheerful high whistle of a polished copper kettle brewing chamomile and star-flour",
      "Warm sunlight streaming through stained-glass hatches onto a sleepy glowing spirit fox",
      "The sweet, buttery aroma of fresh cinnamon rolls cooling on a wooden sill",
      "Soft chiming wind bells rustling in a gentle hill breeze over clover fields"
    ],
    "avoid": "Grimdark violence, cruelty, cynicism, high-stress lethal panic, bleak hopeless environments.",
    "avoidKeywords": [
      "gore",
      "torture",
      "massacre",
      "corpse",
      "murder",
      "bloodbath"
    ]
  },
  "media": [
    {
      "title": "Spirited Away",
      "medium": "Film"
    },
    {
      "title": "Howl's Moving Castle",
      "medium": "Film"
    },
    {
      "title": "My Neighbor Totoro",
      "medium": "Film"
    },
    {
      "title": "Kiki's Delivery Service",
      "medium": "Film"
    },
    {
      "title": "Stardew Valley",
      "medium": "Game"
    },
    {
      "title": "Animal Crossing",
      "medium": "Game"
    },
    {
      "title": "Over the Garden Wall",
      "medium": "Mini-series"
    },
    {
      "title": "Hilda",
      "medium": "TV Show"
    },
    {
      "title": "The Legend of Zelda: Breath of the Wild",
      "medium": "Game"
    },
    {
      "title": "Ori and the Blind Forest",
      "medium": "Game"
    },
    {
      "title": "Slime Rancher",
      "medium": "Game"
    },
    {
      "title": "Journey",
      "medium": "Game"
    },
    {
      "title": "Sky: Children of the Light",
      "medium": "Game"
    },
    {
      "title": "Cozy Grove",
      "medium": "Game"
    },
    {
      "title": "A Short Hike",
      "medium": "Game"
    },
    {
      "title": "The Tea Dragon Society",
      "medium": "Graphic Novel"
    },
    {
      "title": "Moominvalley",
      "medium": "Books/TV"
    },
    {
      "title": "Ooblets",
      "medium": "Game"
    },
    {
      "title": "Spiritfarer",
      "medium": "Game"
    },
    {
      "title": "Atelier Ryza",
      "medium": "Game Series"
    }
  ],
  "openers": [
    {
      "id": "seed_coz_01",
      "title": "The Floating Tea Bakery",
      "tagline": "Baking star-honey pastries on a flying brass teahouse over clover hills.",
      "premise": "You awake to morning sunlight in your flying teashop, cruising over rolling clover valleys. The copper kettle is whistling cheerfully, but today is the annual Sky Blossom Festival and your delivery pelican just arrived with an urgent order of Star-Honey Buns for the Forest Spirit King.",
      "hero": {
        "name": "Mimi Clover",
        "role": "Sky Baker",
        "origin": "Airborne Artisan"
      },
      "actions": [
        "Mix the luminescent star-flour and cinnamon honey into the copper mixing bowl.",
        "Adjust the clockwork rudder to catch the warm valley thermal breeze.",
        "Feed a warm cinnamon crust to your sleepy glowing spirit fox companion."
      ],
      "gear": [
        {
          "name": "Rolling Pin",
          "type": "weapon",
          "isEquipped": true
        }
      ],
      "spells": [
        "Warmth Spark"
      ],
      "hp": 12
    },
    {
      "id": "seed_coz_02",
      "title": "The Clockwork Clockmaker's Cat",
      "tagline": "Repairing antique grandfather clocks for time-traveling spirits.",
      "premise": "In your cozy chimney-corner workshop, a little clockwork calico cat waddles across the workbench carrying a broken pocket watch that runs backward. When you open the brass casing, tiny gears shaped like stars spin and whisper a forgotten lullaby.",
      "hero": {
        "name": "Tobias Pendelton",
        "role": "Clockwork Horologist",
        "origin": "Gentle Craftsman"
      },
      "actions": [
        "Use your brass tweezers to align the miniature star-gears inside the watch.",
        "Offer a saucer of warm milk with cinnamon to the clockwork cat.",
        "Wind the brass stem to hear the complete melody of the forgotten song."
      ],
      "gear": [
        {
          "name": "Herbal Pouch",
          "type": "misc",
          "isEquipped": true
        }
      ],
      "spells": [
        "Gentle Breeze"
      ],
      "hp": 11
    },
    {
      "id": "seed_coz_03",
      "title": "The Lost Cloud Shepherd",
      "tagline": "Herding fluffy rainbow clouds over the coastal lighthouse cliffs.",
      "premise": "Armed with your shepherd's crook and lavender whistle, you must herd three runaway fluffy rain-clouds before they drift over the village laundry lines. The smallest pink cloud has gotten tangled in the lighthouse weather vane.",
      "hero": {
        "name": "Pip Weatherbee",
        "role": "Cloud Shepherd",
        "origin": "Hilltop Wanderer"
      },
      "actions": [
        "Climb the lighthouse spiral stairs with your lavender cloud-treats.",
        "Blow your wooden whistle to guide the two larger clouds into the orchard.",
        "Gently untangle the pink cloud and wrap it in a warm woolen blanket."
      ],
      "gear": [
        {
          "name": "Aviator Goggles",
          "type": "misc",
          "isEquipped": true
        }
      ],
      "spells": [
        "Astral Float"
      ],
      "hp": 13
    },
    {
      "id": "seed_coz_04",
      "title": "The Botanical Greenhouse Express",
      "tagline": "A steam train filled with rare talking orchids and moss spirits.",
      "premise": "You are the head conductor on the Green Valley Express, a vintage train where every carriage is a greenhouse garden. A sleepy moss spirit has fallen asleep on the main steam valve, causing the train to sprout giant flowering jasmine vines across the track.",
      "hero": {
        "name": "Hazel Greenleaf",
        "role": "Botanical Conductor",
        "origin": "Forest Elf"
      },
      "actions": [
        "Brew a pot of chamomile tea to gently wake the sleeping moss spirit.",
        "Trim the jasmine vines with your silver shears to keep the tracks clear.",
        "Sing a gentle botanical tune to encourage the orchid passengers to bloom."
      ],
      "gear": [
        {
          "name": "Rolling Pin",
          "type": "weapon",
          "isEquipped": true
        }
      ],
      "spells": [
        "Warmth Spark"
      ],
      "hp": 12
    },
    {
      "id": "seed_coz_05",
      "title": "The Lighthouse of Lost Lanterns",
      "tagline": "Lighting the path for wandering nocturnal dream-moths.",
      "premise": "On the highest cliff of Whisper Isle, your lighthouse doesn't guide ships — it guides glowing dream-moths on their migration across the sea of stars. Tonight, an enormous radiant moth lands on the lantern glass with a letter tied to its wing.",
      "hero": {
        "name": "Finnian Starling",
        "role": "Lantern Keeper",
        "origin": "Island Resident"
      },
      "actions": [
        "Carefully untie the ribbon letter from the dream-moth's wing.",
        "Polish the brass reflectors to amplify the golden beam across the waves.",
        "Share a bowl of warm roasted chestnuts with the lighthouse owl."
      ],
      "gear": [
        {
          "name": "Herbal Pouch",
          "type": "misc",
          "isEquipped": true
        }
      ],
      "spells": [
        "Gentle Breeze"
      ],
      "hp": 11
    },
    {
      "id": "seed_coz_06",
      "title": "The Soot-Sprite Bakery Delivery",
      "tagline": "Delivering warm sourdough loaves across the cobble village by glider.",
      "premise": "Your family bakery has supplied the village with fresh sourdough for four generations. With your bamboo glider strapped on and a basket of warm bread on your back, you discover a family of friendly soot-sprites hiding in the flour bin.",
      "hero": {
        "name": "Kiki Thorne",
        "role": "Glider Courier",
        "origin": "Village Baker"
      },
      "actions": [
        "Feed the soot-sprites little star-sugar candies so they help pack the bread.",
        "Launch from the bakery windmill platform into the morning valley breeze.",
        "Deliver the first warm loaf to the sleepy lighthouse keeper at the harbor."
      ],
      "gear": [
        {
          "name": "Aviator Goggles",
          "type": "misc",
          "isEquipped": true
        }
      ],
      "spells": [
        "Astral Float"
      ],
      "hp": 13
    },
    {
      "id": "seed_coz_07",
      "title": "The Enchanted Bookshop in the Hollow",
      "tagline": "Books that flutter like birds when you open their pages.",
      "premise": "Nestled inside the trunk of a 500-year-old hollow oak, your bookstore is home to volumes that flutter like sparrows when excited. An elderly badger scholar arrives seeking the legendary Cookbook of Starlight Pudding.",
      "hero": {
        "name": "Barnaby Quill",
        "role": "Bookkeeper",
        "origin": "Oak Dweller"
      },
      "actions": [
        "Use your butterfly net to gently catch the fluttering blue volume near the rafters.",
        "Serve honeyed elderberry tea to the badger scholar by the fireplace.",
        "Read the glowing calligraphy on the first page of the pudding recipe."
      ],
      "gear": [
        {
          "name": "Rolling Pin",
          "type": "weapon",
          "isEquipped": true
        }
      ],
      "spells": [
        "Warmth Spark"
      ],
      "hp": 12
    },
    {
      "id": "seed_coz_08",
      "title": "The River Otters' Floating Market",
      "tagline": "Trading handmade pottery for freshwater pearls and riverberries.",
      "premise": "Every full moon, the river otters tie their wooden barges together to form a lantern-lit floating market on the river bend. Your hand-painted ceramic mugs are the biggest hit of the evening until a curious river dragon requests a mug the size of a barrel.",
      "hero": {
        "name": "Penelope Reed",
        "role": "Ceramic Artist",
        "origin": "River Folk"
      },
      "actions": [
        "Carve a magnificent ceramic basin on your foot-pedal pottery wheel.",
        "Barter with the otter merchant for shimmering blue river pearls.",
        "Share roasted sweet potatoes by the riverside bonfire with market vendors."
      ],
      "gear": [
        {
          "name": "Herbal Pouch",
          "type": "misc",
          "isEquipped": true
        }
      ],
      "spells": [
        "Gentle Breeze"
      ],
      "hp": 11
    },
    {
      "id": "seed_coz_09",
      "title": "The Windmill Repair Guild",
      "tagline": "Tuning the wooden gears that power the village music boxes.",
      "premise": "The great hilltop windmill turns the central drive-shaft that powers every clock, music box, and flour mill in the valley. When the music boxes start playing in reverse, you climb into the cedar gear-loft with your oil can and brass wrench.",
      "hero": {
        "name": "Oliver Miller",
        "role": "Millwright",
        "origin": "Valley Artisan"
      },
      "actions": [
        "Inspect the giant wooden cedar cogs for stuck flower garlands.",
        "Oil the main bronze bearing to restore the gentle musical rhythm.",
        "Look out the windmill hatch at the sunset spreading over the sunflower fields."
      ],
      "gear": [
        {
          "name": "Aviator Goggles",
          "type": "misc",
          "isEquipped": true
        }
      ],
      "spells": [
        "Astral Float"
      ],
      "hp": 13
    },
    {
      "id": "seed_coz_10",
      "title": "The Star-Weaver's Loom",
      "tagline": "Weaving fallen starlight threads into blankets that keep bad dreams away.",
      "premise": "In your cottage atop the windy ridge, you collect fallen starlight threads from the morning grass and weave them into glowing quilts. A young shepherd arrives asking for a blanket to protect his flock from the Night-Mist Wolf.",
      "hero": {
        "name": "Astrid Moon",
        "role": "Starlight Weaver",
        "origin": "Hill Artisan"
      },
      "actions": [
        "Thread the glowing silver starlight yarn through your wooden handloom.",
        "Weave protective clover patterns into the corners of the blanket.",
        "Brew a mug of spiced chamomile for the grateful young shepherd."
      ],
      "gear": [
        {
          "name": "Rolling Pin",
          "type": "weapon",
          "isEquipped": true
        }
      ],
      "spells": [
        "Warmth Spark"
      ],
      "hp": 12
    }
  ],
  "tropes": [
    {
      "premise": "A small, glowing moss spirit tugs gently on your boot, pointing toward a patch of wildly overgrown, vanilla-scented mushrooms."
    },
    {
      "premise": "The flying bakery airship hums with steam as you pull a fresh tray of star-flour pastries from the enchanted oven."
    },
    {
      "premise": "A giant, sleepy forest guardian covered in ancient ferns blocking the road wakes up and asks you politely for a cup of tea."
    },
    {
      "premise": "You open your umbrella to glide across the valley, catching a warm updraft filled with cherry blossom petals."
    },
    {
      "premise": "The local river spirit leaves a pile of polished river stones on your porch as a thank you for cleaning the debris from its banks."
    },
    {
      "premise": "A flock of tiny, soot-covered sprites helps you carry coal to the furnace of the magical bathhouse."
    },
    {
      "premise": "You brew a potion of soothing chamomile and moon-dew to help the grumpy mountain troll get a good night's sleep."
    },
    {
      "premise": "The clockwork postman arrives on a sputtering, brass bicycle to deliver a letter sealed with glowing amber wax."
    },
    {
      "premise": "You discover a hidden glen where the fireflies arrange themselves into intricate, glowing constellations in the grass."
    },
    {
      "premise": "A talking cat wearing a tiny top hat offers to guide you through the enchanted forest in exchange for a saucer of cream."
    },
    {
      "premise": "You harvest the rare cloud-berries at the peak of the mountain, wrapping them carefully in woven leaves."
    },
    {
      "premise": "The village prepares for the Lantern Festival, weaving paper floats that actually hover on gentle breezes."
    },
    {
      "premise": "A friendly, lumbering stone golem helps you till the soil for your new garden of magical herbs."
    },
    {
      "premise": "You sit by a crackling hearth fire, mending a torn traveler's cloak with thread spun from starlight."
    },
    {
      "premise": "The ancient tree at the center of town blooms a single, radiant flower that hums with a warm, musical chord."
    },
    {
      "premise": "You trade a basket of honey-cakes to the wandering frog-merchant for a magical seed that grows instantly into a cozy tent."
    },
    {
      "premise": "The rain taps softly against the stained glass windows of your apothecary as you sort dried lavender and sun-drops."
    },
    {
      "premise": "A mischievous wind spirit playfully steals your hat and leads you on a gentle chase through a field of sunflowers."
    },
    {
      "premise": "You assemble a mechanical music box that plays a tune capable of soothing agitated wildlife in the meadow."
    },
    {
      "premise": "The sun sets, painting the sky in pastel hues as the floating islands drift lazily toward their nighttime anchors."
    }
  ],
  "procedural": {
    "titles": [
      "The Flying Tea Shop & The Meadow Spirits: Chapter I",
      "Apothecary of the Mossy Windmill: Chapter I",
      "The Star-Bun Bakery of Clover Valley: Chapter I",
      "Whispers of the Clockwork Garden: Chapter I",
      "The Lantern Post Lighthouse: Chapter I"
    ],
    "firstNames": [
      "Mimi",
      "Pip",
      "Sophie",
      "Toby",
      "Kiki",
      "Hana",
      "Oliver",
      "Lulu"
    ],
    "lastNames": [
      "Honeywood",
      "Tealeaf",
      "Starling",
      "Bramble",
      "Fern",
      "Bloom",
      "Merryweather"
    ],
    "roles": [
      "Spirit Baker",
      "Flying Herbalist",
      "Whimsical Glider Courier",
      "Clockwork Hearthkeeper",
      "Meadow Tea Brewer"
    ],
    "origins": [
      "Woodland Hearthling",
      "Gentle Sprite Companion",
      "River Spirit Kin",
      "Human Dreamer"
    ],
    "physicalTraits": [
      "Bright sparkling eyes, linen apron with flour smudges, knit cardigan, accompanied by a tiny glowing spirit companion perched on the shoulder."
    ],
    "hooks": [
      {
        "hook": "Morning sunlight filters through the windows of your flying tea shop. Pip, your spirit fox, wakes you up.",
        "actions": [
          "Bake pastries",
          "Greet spirits",
          "Check journal"
        ],
        "gear": [
          {
            "name": "Rolling Pin",
            "type": "weapon",
            "isEquipped": true
          }
        ],
        "spells": [
          "Warmth Spark"
        ],
        "hp": 12
      },
      {
        "hook": "The mossy windmill turns slowly. You gather lavender for your tinctures as a raincloud approaches.",
        "actions": [
          "Harvest herbs",
          "Check windmill gear",
          "Brew tea"
        ],
        "gear": [
          {
            "name": "Herbal Pouch",
            "type": "misc",
            "isEquipped": true
          }
        ],
        "spells": [
          "Gentle Breeze"
        ],
        "hp": 11
      },
      {
        "hook": "Your glider is packed with letters for the mountain villages. The wind is favorable, and the view is spectacular.",
        "actions": [
          "Check glider wings",
          "Verify letters",
          "Launch"
        ],
        "gear": [
          {
            "name": "Aviator Goggles",
            "type": "misc",
            "isEquipped": true
          }
        ],
        "spells": [
          "Astral Float"
        ],
        "hp": 13
      }
    ]
  },
  "starterInventory": [
    {
      "name": "Worn Leather Journal",
      "type": "misc",
      "quantity": 1,
      "isEquipped": false,
      "description": "Half-filled with pressed wildflowers and recipes."
    },
    {
      "name": "Bundle of Dried Lavender",
      "type": "potion",
      "quantity": 1
    },
    {
      "name": "Battered Kettle",
      "type": "misc",
      "quantity": 1
    }
  ],
  "ambient": [
    "A small breeze lifts the petals from the teacup on the table.",
    "Somewhere a kettle begins to sing, even though no one lit a fire.",
    "A soot spirit bumps apologetically against your ankle and dashes away.",
    "Cloud shadows drift slowly across the kitchen floor."
  ]
} satisfies CategoryContent;
