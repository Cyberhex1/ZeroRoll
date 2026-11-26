/**
 * ZeroRoll 0.2 name bank. Copy to src/content/forge/names.ts.
 *
 * Why: before 0.2 every prompt carried a list of banned names, and the list itself primed
 * them ("Vance" kept coming back). The procedural name lists were 7 to 10 names per
 * category and some of them were on the banned list (Revenge's surnames were Thorne,
 * Vance, Blackwell and Vane). 0.2 offers a few fitting names on hand instead, and fixes any
 * stock name in code from this bank.
 *
 * Rules for this file: real names from each tradition (or invented ones that do not sound
 * like stock fantasy compounds such as "Ravenshadow"); none from OVERUSED_NAMES
 * (src/content/names.ts); family names gender-neutral (place or farm names where a
 * tradition's surnames are gendered). content:check verifies both.
 */
import type { ExperienceCategory } from '../../types';

export type TraditionId =
  | 'norse' | 'egyptian' | 'greek' | 'roman' | 'celtic' | 'japanese' | 'chinese' | 'korean'
  | 'italian' | 'iberian' | 'english' | 'french' | 'arabic_persian' | 'west_african' | 'slavic'
  | 'south_asian' | 'us_contemporary' | 'medieval' | 'invented';

export interface NameTradition {
  feminine: string[];
  masculine: string[];
  /** Given names that read as either; offered for they/them and mixed in for everyone. */
  neutral: string[];
  /** Surnames, bynames or "of <place>" epithets, all usable for any gender. */
  family: string[];
}

export const NAME_TRADITIONS: Record<TraditionId, NameTradition> = {
  norse: {
    feminine: ['Ingrid', 'Gudrun', 'Thora', 'Signy', 'Ragna', 'Asta', 'Helga', 'Bodil', 'Ylva', 'Sigrid', 'Hallgerd', 'Aud', 'Gunnhild', 'Thurid'],
    masculine: ['Ketil', 'Bjorn', 'Hallvard', 'Ulf', 'Grim', 'Thorgest', 'Eyvind', 'Sverri', 'Arnbjorn', 'Halfdan', 'Thorolf', 'Orm', 'Skarphedin', 'Gisli'],
    neutral: ['Ask', 'Bryn', 'Eske', 'Rune', 'Sol', 'Hel'],
    family: ['Mosfell', 'Hlidarend', 'Vik', 'Berg', 'Haugen', 'Strand', 'Holt', 'Dal', 'Nes', 'Lund', 'Eid', 'Hamar', 'Myr', 'Sand', 'Skog', 'Sund']
  },
  egyptian: {
    feminine: ['Merit', 'Nefer', 'Tiye', 'Henut', 'Ahhotep', 'Iset', 'Meryet', 'Neferet', 'Sitre', 'Nebet', 'Takhat', 'Mutnofret', 'Baket', 'Tuya'],
    masculine: ['Ankhu', 'Senenmut', 'Khaemwaset', 'Ramose', 'Paneb', 'Huy', 'Djedi', 'Kha', 'Nakht', 'Sennedjem', 'Amenemope', 'Ipuy', 'Menna', 'Userhat'],
    neutral: ['Ankh', 'Neb', 'Meri', 'Hapi', 'Iry', 'Wenen'],
    family: ['of Waset', 'of Abdju', 'of Men-nefer', 'of Iunu', 'of Nekhen', 'of Khmun', 'of Djeba', 'of Swenet', 'of Behdet', 'of Per-Bast', 'of Sau', 'of Tjeni', 'of Ipu', 'of Akhet-Aten', 'of the Place of Truth', 'of Ta-senet']
  },
  greek: {
    feminine: ['Theano', 'Korinna', 'Myrrhine', 'Aspasia', 'Agariste', 'Chrysis', 'Philinna', 'Kleio', 'Nikarete', 'Praxilla', 'Timandra', 'Erinna', 'Hagne', 'Damaris'],
    masculine: ['Kleon', 'Phormion', 'Hipponax', 'Lykon', 'Agathon', 'Mnesikles', 'Polykrates', 'Stratos', 'Doros', 'Kallias', 'Nikias', 'Glaukos', 'Philon', 'Euphranor'],
    neutral: ['Eos', 'Kallis', 'Theo', 'Niko', 'Dion', 'Ari'],
    family: ['of Argos', 'of Megara', 'of Ithaka', 'of Naxos', 'of Samos', 'of Delos', 'of Eretria', 'of Kos', 'of Pylos', 'of Chios', 'of Aigina', 'of Lesbos', 'of Tiryns', 'of Elis', 'of Phokaia', 'of Knossos']
  },
  roman: {
    feminine: ['Aemilia', 'Cornelia', 'Livia', 'Fulvia', 'Octavia', 'Tullia', 'Sabina', 'Domitia', 'Claudia', 'Junia', 'Pomponia', 'Vipsania', 'Licinia', 'Calpurnia'],
    masculine: ['Gaius', 'Quintus', 'Lucius', 'Titus', 'Decimus', 'Servius', 'Appius', 'Spurius', 'Tiberius', 'Aulus', 'Gnaeus', 'Numerius', 'Sextus', 'Manius'],
    neutral: ['Felix', 'Lux', 'Vita', 'Ursa'],
    family: ['Varro', 'Scaurus', 'Corvinus', 'Plautius', 'Ahenobarbus', 'Galba', 'Piso', 'Rufinus', 'Strabo', 'Cotta', 'Lentulus', 'Naso', 'Saturninus', 'Vibius', 'Calvus', 'Turpilius']
  },
  celtic: {
    feminine: ['Aoife', 'Niamh', 'Sorcha', 'Grainne', 'Eithne', 'Fionnuala', 'Muirenn', 'Brigid', 'Deirdre', 'Gwenllian', 'Angharad', 'Eilidh', 'Morag', 'Una'],
    masculine: ['Cormac', 'Diarmuid', 'Fergus', 'Niall', 'Oisin', 'Tadhg', 'Ruairi', 'Eoghan', 'Brennus', 'Iorwerth', 'Dafydd', 'Calum', 'Lachlan', 'Donnchadh'],
    neutral: ['Dara', 'Morgan', 'Ciar', 'Rhian'],
    family: ['MacAlister', "O'Rourke", "O'Faolain", 'ap Rhys', 'ap Gruffydd', 'MacCrimmon', "O'Daly", 'MacNeill', "O'Hanlon", 'MacKinnon', 'Mac Lochlainn', "O'Connell", 'MacAskill', 'ap Owain', 'MacQuarrie', "O'Dowd"]
  },
  japanese: {
    feminine: ['Akane', 'Chiyo', 'Emiko', 'Fumiko', 'Haruka', 'Kaede', 'Kiyomi', 'Natsuki', 'Otsuru', 'Rin', 'Sayo', 'Shizuka', 'Tsubaki', 'Yae', 'Yukino'],
    masculine: ['Daisuke', 'Genji', 'Hayato', 'Ichiro', 'Jinpachi', 'Kenta', 'Kichiro', 'Masaru', 'Noboru', 'Ryota', 'Shinsuke', 'Takumi', 'Tetsuo', 'Yoshiro', 'Zenjiro'],
    neutral: ['Akira', 'Hikaru', 'Makoto', 'Nao', 'Sora', 'Tsubasa', 'Yuki', 'Kaoru'],
    family: ['Takeda', 'Morimoto', 'Kiyohara', 'Sakai', 'Ishida', 'Kuroda', 'Hayashi', 'Okada', 'Matsuda', 'Nakagawa', 'Ueda', 'Shimizu', 'Arai', 'Hirano', 'Komatsu', 'Noguchi', 'Ogawa', 'Sugimoto', 'Tachibana', 'Kawabata']
  },
  chinese: {
    feminine: ['Mei', 'Lan', 'Xiu', 'Ying', 'Hua', 'Jing', 'Yan', 'Lian', 'Qing', 'Ruolan', 'Shuang', 'Wanying', 'Xiaoyu', 'Yuxi', 'Zhiruo'],
    masculine: ['Wei', 'Jun', 'Hao', 'Lei', 'Ming', 'Qiang', 'Tao', 'Jian', 'Bo', 'Haoran', 'Yichen', 'Jinhai', 'Zhiyuan', 'Kang', 'Shen'],
    neutral: ['An', 'Yu', 'Ning', 'Zihan', 'Rui', 'Xin', 'Chen'],
    family: ['Wang', 'Li', 'Zhang', 'Liu', 'Yang', 'Zhao', 'Huang', 'Zhou', 'Wu', 'Xu', 'Sun', 'Hu', 'Zhu', 'Gao', 'Lin', 'Guo', 'Luo', 'Liang', 'Song', 'Xie', 'Tang', 'Feng']
  },
  korean: {
    feminine: ['Ji-woo', 'Seo-yeon', 'Min-ji', 'Ha-eun', 'Soo-ah', 'Yu-na', 'Da-eun', 'Eun-bi', 'Hye-jin', 'Na-rae', 'Bo-ra', 'Ye-rin', 'Seul-gi', 'Ga-young'],
    masculine: ['Min-jun', 'Seo-jun', 'Do-yun', 'Ji-ho', 'Hyun-woo', 'Jae-won', 'Tae-yang', 'Sung-min', 'Dong-hyun', 'Woo-jin', 'Joon-ho', 'Kyung-soo', 'Sang-woo', 'Yoon-seok'],
    neutral: ['Ha-neul', 'Jin-young', 'Eun-sol', 'Si-on', 'Da-on'],
    family: ['Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Kang', 'Cho', 'Yoon', 'Jang', 'Lim', 'Han', 'Oh', 'Seo', 'Shin', 'Kwon', 'Hwang', 'Ahn', 'Song', 'Yoo', 'Hong']
  },
  italian: {
    feminine: ['Lucrezia', 'Caterina', 'Ginevra', 'Fiammetta', 'Costanza', 'Vittoria', 'Simonetta', 'Orsola', 'Ippolita', 'Clarice', 'Maddalena', 'Lisabetta', 'Violante', 'Tessa'],
    masculine: ['Lorenzo', 'Cosimo', 'Piero', 'Baccio', 'Ercole', 'Ludovico', 'Galeazzo', 'Niccolo', 'Tommaso', 'Filippo', 'Giovanni', 'Benvenuto', 'Agnolo', 'Bartolo'],
    neutral: ['Celeste', 'Fiore', 'Gioia', 'Andrea'],
    family: ['Strozzi', 'Tornabuoni', 'Pazzi', 'Albizzi', 'Rucellai', 'Soderini', 'Capponi', 'Salviati', 'Guicciardini', 'Visconti', 'Gonzaga', 'Malatesta', 'Baglioni', 'Orsini', 'Acciaiuoli', 'Frescobaldi']
  },
  iberian: {
    feminine: ['Inés', 'Leonor', 'Catalina', 'Beatriz', 'Ximena', 'Mencía', 'Pilar', 'Rosario', 'Mercedes', 'Consuelo', 'Amparo', 'Luzia', 'Joana', 'Graça'],
    masculine: ['Rodrigo', 'Gonzalo', 'Íñigo', 'Alonso', 'Diego', 'Sancho', 'Fernão', 'Tiago', 'Joaquín', 'Esteban', 'Bartolomé', 'Héctor', 'Mateus', 'Ramón'],
    neutral: ['Cruz', 'Paz', 'Guadalupe', 'Trini'],
    family: ['Velázquez', 'Ortega', 'Salazar', 'Quiroga', 'Arriaga', 'Mendoza', 'Carvalho', 'Figueroa', 'Zubiri', 'Echeverría', 'Valdés', 'Sandoval', 'Albuquerque', 'Peralta', 'Bermúdez', 'Cuadrado']
  },
  english: {
    feminine: ['Harriet', 'Louisa', 'Philippa', 'Cordelia', 'Arabella', 'Henrietta', 'Lavinia', 'Prudence', 'Honoria', 'Jemima', 'Frances', 'Augusta', 'Theodosia', 'Cecily'],
    masculine: ['Bartholomew', 'Ambrose', 'Percival', 'Rupert', 'Horace', 'Jasper', 'Lionel', 'Algernon', 'Gilbert', 'Humphrey', 'Barnaby', 'Crispin', 'Septimus', 'Edwin'],
    neutral: ['Kit', 'Sidney', 'Marion', 'Hilary', 'Ellis', 'Jory'],
    family: ['Ashcombe', 'Pennington', 'Whitlock', 'Fanshawe', 'Carrow', 'Dunmore', 'Halsey', 'Lisle', 'Marchbanks', 'Ormsby', 'Prideaux', 'Tremayne', 'Wyndham', 'Fothergill', 'Kettering', 'Ludlow']
  },
  french: {
    feminine: ['Margot', 'Héloïse', 'Sidonie', 'Apolline', 'Odile', 'Ysabeau', 'Clotilde', 'Mathilde', 'Séverine', 'Aurore', 'Blanche', 'Perrine', 'Solène', 'Léonie'],
    masculine: ['Anselme', 'Benoît', 'Gaspard', 'Thibault', 'Aymeric', 'Bastien', 'Florian', 'Gautier', 'Honoré', 'Octave', 'Raoul', 'Sylvain', 'Valentin', 'Firmin'],
    neutral: ['Dominique', 'Claude', 'Ange', 'Céleste', 'Alix', 'Lou'],
    family: ['Delacroix', 'Montrésor', 'Duval', 'Fontaine', 'Lacombe', 'Rochefort', 'Vasseur', 'Beaulieu', 'Chastain', 'Desmarais', 'Guérin', 'Lefebvre', 'Marivaux', 'Peyrac', 'Varenne', 'Aubert']
  },
  arabic_persian: {
    feminine: ['Layla', 'Yasmin', 'Nour', 'Shirin', 'Parisa', 'Farah', 'Rana', 'Habiba', 'Golnar', 'Maryam', 'Dunya', 'Soraya', 'Azadeh', 'Samira'],
    masculine: ['Tariq', 'Idris', 'Karim', 'Rustam', 'Dariush', 'Faris', 'Hamid', 'Jalal', 'Kaveh', 'Nasser', 'Omar', 'Samir', 'Ziyad', 'Bahram'],
    neutral: ['Iman', 'Shams', 'Rumi', 'Sami', 'Daryan', 'Nima'],
    family: ['al-Rashidi', 'al-Masri', 'Haddad', 'Tabrizi', 'Shirazi', 'al-Kindi', 'Najjar', 'Farouk', 'Esfahani', 'al-Hakim', 'Qasimi', 'Saffari', 'Darwish', 'Mansour', 'Kermani', 'al-Tamimi']
  },
  west_african: {
    feminine: ['Adaeze', 'Ngozi', 'Folasade', 'Efua', 'Abena', 'Ama', 'Chiamaka', 'Yetunde', 'Nneka', 'Akosua', 'Halima', 'Kemi', 'Obiageli', 'Esi'],
    masculine: ['Chukwuemeka', 'Kwame', 'Kofi', 'Babatunde', 'Ikenna', 'Yaw', 'Kwabena', 'Femi', 'Obinna', 'Sekou', 'Mamadou', 'Kayode', 'Nnamdi', 'Ebo'],
    neutral: ['Ayodele', 'Oluwaseun', 'Chidi', 'Dayo', 'Nkem', 'Kehinde'],
    family: ['Okafor', 'Adeyemi', 'Mensah', 'Asante', 'Nwosu', 'Boateng', 'Okonkwo', 'Owusu', 'Balogun', 'Diallo', 'Keita', 'Traoré', 'Eze', 'Adebayo', 'Ofori', 'Danjuma']
  },
  slavic: {
    feminine: ['Milena', 'Zorana', 'Bogna', 'Dragana', 'Ludmila', 'Vesna', 'Radka', 'Jelena', 'Snežana', 'Zdenka', 'Božena', 'Danica', 'Ljuba', 'Vlasta'],
    masculine: ['Bogdan', 'Dragan', 'Radomir', 'Miroslav', 'Stanko', 'Velimir', 'Zoran', 'Dobromil', 'Kazimir', 'Ratko', 'Svetozar', 'Branko', 'Jaromír', 'Vuk'],
    neutral: ['Sasha', 'Zhenya', 'Valya', 'Slava'],
    family: ['Novak', 'Horvat', 'Kovač', 'Petrović', 'Jovanović', 'Babić', 'Marković', 'Dvořák', 'Král', 'Vuković', 'Radić', 'Kolar', 'Šimić', 'Popović', 'Lukić', 'Zelenko']
  },
  south_asian: {
    feminine: ['Ananya', 'Kavya', 'Meera', 'Ishita', 'Nandini', 'Revathi', 'Sunita', 'Lakshmi', 'Pooja', 'Shreya', 'Farzana', 'Anjali', 'Divya', 'Malati'],
    masculine: ['Arjun', 'Vikram', 'Rohan', 'Siddharth', 'Kabir', 'Nikhil', 'Rajesh', 'Anil', 'Imran', 'Devendra', 'Karthik', 'Sanjay', 'Prakash', 'Harish'],
    neutral: ['Kiran', 'Jyoti', 'Sunny', 'Mani'],
    family: ['Iyer', 'Nair', 'Menon', 'Kapoor', 'Chatterjee', 'Banerjee', 'Reddy', 'Desai', 'Joshi', 'Kulkarni', 'Siddiqui', 'Qureshi', 'Bhatt', 'Gill', 'Pillai', 'Rao']
  },
  us_contemporary: {
    feminine: ['Danielle', 'Brianna', 'Tasha', 'Keisha', 'Megan', 'Courtney', 'Destiny', 'Gabriela', 'Jasmine', 'Monique', 'Tiffany', 'Kayla', 'Lupe', 'Heather'],
    masculine: ['DeShawn', 'Tyler', 'Brandon', 'Terrence', 'Darnell', 'Kevin', 'Luis', 'Trevor', 'Dustin', 'Andre', 'Malik', 'Brett', 'Curtis', 'Raymond'],
    neutral: ['Jordan', 'Casey', 'Taylor', 'Riley', 'Jesse', 'Alex', 'Morgan', 'Quinn', 'Avery', 'Dakota'],
    family: ['Delgado', 'Nguyen', 'Washington', 'Kowalski', "O'Brien", 'Brooks', 'Romero', 'Lindqvist', 'Pham', 'Castellanos', 'Greenberg', 'Yazzie', 'Broussard', 'Hollis', 'Duarte', 'Fitzgerald']
  },
  medieval: {
    feminine: ['Alys', 'Hedda', 'Maude', 'Agnes', 'Aldith', 'Edith', 'Ermengarde', 'Hawise', 'Petronella', 'Sibyl', 'Rohese', 'Emmeline', 'Gunnora', 'Cristiana'],
    masculine: ['Osric', 'Bertrand', 'Godric', 'Wystan', 'Aldous', 'Fulk', 'Hamo', 'Hugh', 'Ivo', 'Odo', 'Ranulf', 'Walter', 'Warin', 'Anselm'],
    neutral: ['Wynn', 'Ellery', 'Merrill', 'Averil', 'Linden', 'Hale'],
    family: ['Fletcher', 'Coldwell', 'Harrow', 'Ashdown', 'Mallory', 'Penhallow', 'Underhill', 'Redmayne', 'Greaves', 'Dunstan', 'Hartwell', 'Tolliver', 'Wickham', 'Farrier', 'Brewster', 'Cobb']
  },
  invented: {
    feminine: ['Ithrien', 'Saevel', 'Omaira', 'Velisande', 'Quenna', 'Iolanthe', 'Zhiva', 'Amethe', 'Corrisande', 'Ysmay', 'Thessaly', 'Brisane', 'Halcyne', 'Liriel'],
    masculine: ['Teodric', 'Varrin', 'Calder', 'Ilvar', 'Brannoch', 'Edrahil', 'Tavish', 'Corwen', 'Ostrin', 'Pellam', 'Dariel', 'Fennick', 'Morrim', 'Sevrin'],
    neutral: ['Oriel', 'Sorrel', 'Lumen', 'Quill', 'Rue', 'Indri'],
    family: ['Arvel', 'Coriole', 'Deverin', 'Estmark', 'Halloran', 'Ivenrede', 'Lothaire', 'Marrowby', 'Pellinor', 'Quarrender', 'Ruthven', 'Ulmar', 'Verrick', 'Ostrander', 'Dunmarrow', 'Caddel']
  }
};

/** Naming traditions per story family, keyed "<category>.<familyId>" (families in src/content/forge/decks). */
export const FAMILY_TRADITIONS: Record<string, TraditionId[]> = {
  'fantasy.party': ['medieval', 'invented'],
  'fantasy.monster_hunter': ['slavic', 'medieval'],
  'fantasy.magic_school': ['invented', 'english'],
  'fantasy.realm': ['invented', 'medieval', 'celtic'],
  'adventure.high_seas': ['english', 'iberian', 'french'],
  'adventure.tomb_raider': ['english', 'arabic_persian', 'iberian', 'us_contemporary'],
  'adventure.lost_world': ['english', 'french', 'iberian'],
  'adventure.caper': ['us_contemporary', 'english', 'italian'],
  'historical_adventure.samurai': ['japanese'],
  'historical_adventure.renaissance': ['italian', 'french'],
  'historical_adventure.rome': ['roman', 'greek'],
  'historical_adventure.wuxia': ['chinese'],
  'horror.rules': ['us_contemporary'],
  'horror.folk': ['english', 'us_contemporary', 'celtic'],
  'horror.woods': ['us_contemporary'],
  'horror.home': ['us_contemporary', 'english'],
  'horror.survival': ['us_contemporary', 'korean', 'iberian'],
  'cozy_ghibli.newshop': ['japanese', 'french', 'medieval'],
  'cozy_ghibli.spirits': ['japanese'],
  'cozy_ghibli.voyage': ['japanese', 'invented', 'celtic'],
  'cozy_ghibli.restore': ['medieval', 'japanese', 'french'],
  'romantic.regency': ['english'],
  'romantic.enemies': ['us_contemporary', 'french', 'italian'],
  'romantic.fae': ['celtic', 'english', 'invented'],
  'romantic.royal': ['invented', 'english', 'french'],
  'romantic.modern': ['us_contemporary', 'korean', 'south_asian', 'iberian'],
  'revenge.betrayal': ['italian', 'french', 'iberian', 'medieval'],
  'revenge.family': ['italian', 'iberian', 'english'],
  'revenge.machine': ['english', 'medieval', 'slavic'],
  'revenge.quiet_pro': ['us_contemporary', 'slavic', 'japanese', 'french'],
  'apocalypse.vault': ['us_contemporary'],
  'apocalypse.road': ['us_contemporary', 'iberian'],
  'apocalypse.wasteland': ['us_contemporary', 'invented'],
  'apocalypse.zone': ['slavic'],
  'zombie.day_one': ['us_contemporary', 'korean'],
  'zombie.group': ['us_contemporary', 'iberian', 'west_african'],
  'zombie.escort': ['us_contemporary', 'english', 'korean'],
  'zombie.comedy': ['english', 'us_contemporary'],
  'cosmic_horror.archive': ['english', 'us_contemporary'],
  'cosmic_horror.coast': ['english', 'us_contemporary'],
  'cosmic_horror.expedition': ['english', 'slavic', 'us_contemporary'],
  'cosmic_horror.deep': ['us_contemporary', 'slavic', 'japanese', 'korean'],
  'psychedelic_trip.ego': ['us_contemporary', 'south_asian'],
  'psychedelic_trip.entities': ['us_contemporary', 'invented'],
  'psychedelic_trip.simulation': ['us_contemporary', 'japanese'],
  'psychedelic_trip.gonzo': ['us_contemporary'],
  'psychedelic_trip.plant': ['iberian', 'us_contemporary'],
  'tiktok_drama.hidden_heir': ['chinese', 'korean', 'us_contemporary'],
  'tiktok_drama.contract': ['us_contemporary', 'korean', 'chinese'],
  'tiktok_drama.rebirth': ['chinese', 'korean'],
  'tiktok_drama.pack': ['us_contemporary', 'slavic'],
  'tiktok_drama.ex': ['us_contemporary', 'chinese', 'south_asian'],
  'ancient_greek.voyage': ['greek'],
  'ancient_greek.war': ['greek'],
  'ancient_greek.labyrinth': ['greek'],
  'ancient_greek.olympus': ['greek', 'roman'],
  'mythology.norse': ['norse'],
  'mythology.egypt': ['egyptian'],
  'mythology.celtic': ['celtic'],
  'mythology.occult': ['english', 'italian', 'french'],
  'mythology.modern': ['us_contemporary', 'arabic_persian', 'west_african', 'south_asian'],
  'real_life.workplace': ['us_contemporary', 'south_asian', 'iberian', 'korean', 'west_african'],
  'real_life.neighbors': ['us_contemporary', 'iberian', 'south_asian'],
  'real_life.family': ['us_contemporary', 'iberian', 'west_african', 'korean'],
  'real_life.hustle': ['us_contemporary', 'south_asian', 'korean']
};

/** For rolls without a family (adapt, opener, old campaigns): the traditions a category uses. */
export const CATEGORY_TRADITIONS: Record<ExperienceCategory, TraditionId[]> = {
  dnd: ['medieval', 'invented', 'celtic', 'norse', 'english'],
  fantasy: ['medieval', 'invented', 'celtic', 'slavic'],
  adventure: ['english', 'iberian', 'french', 'us_contemporary'],
  historical_adventure: ['japanese', 'italian', 'roman', 'chinese', 'french'],
  horror: ['us_contemporary', 'english'],
  cozy_ghibli: ['japanese', 'french', 'medieval'],
  romantic: ['english', 'french', 'italian', 'celtic', 'us_contemporary'],
  revenge: ['italian', 'french', 'iberian', 'english', 'medieval'],
  apocalypse: ['us_contemporary', 'slavic', 'iberian'],
  zombie: ['us_contemporary', 'korean', 'english'],
  cosmic_horror: ['english', 'us_contemporary', 'slavic'],
  psychedelic_trip: ['us_contemporary', 'invented', 'south_asian'],
  tiktok_drama: ['chinese', 'korean', 'us_contemporary'],
  ancient_greek: ['greek'],
  mythology: ['norse', 'egyptian', 'celtic', 'english'],
  real_life: ['us_contemporary', 'south_asian', 'iberian', 'korean', 'west_african']
};

/** The traditions for a family, else the category's. */
export function traditionsFor(category: ExperienceCategory, familyId?: string): TraditionId[] {
  return (familyId && FAMILY_TRADITIONS[`${category}.${familyId}`]) || CATEGORY_TRADITIONS[category];
}

/**
 * Given and family names for these traditions and pronouns, minus any in `exclude`
 * (case-insensitive). she/her: feminine + neutral; he/him: masculine + neutral; anything
 * else: neutral first, then both lists. The caller shuffles and slices.
 */
export function namePool(traditions: TraditionId[], pronouns: string | undefined, exclude: Iterable<string> = []): { given: string[]; family: string[] } {
  const ex = new Set([...exclude].map((n) => n.toLowerCase()));
  const p = (pronouns ?? '').toLowerCase();
  const given: string[] = [];
  const family: string[] = [];
  for (const id of traditions) {
    const t = NAME_TRADITIONS[id];
    if (/^she\b/.test(p)) given.push(...t.feminine, ...t.neutral);
    else if (/^he\b/.test(p)) given.push(...t.masculine, ...t.neutral);
    else given.push(...t.neutral, ...t.feminine, ...t.masculine);
    family.push(...t.family);
  }
  const keep = (n: string) => !ex.has(n.toLowerCase());
  return { given: [...new Set(given)].filter(keep), family: [...new Set(family)].filter(keep) };
}
