import React, { useState } from 'react';
import { 
  Wand2, 
  Compass, 
  ShieldAlert, 
  Ghost, 
  Sparkles, 
  Heart, 
  Flame, 
  Eye, 
  Palette, 
  Briefcase, 
  Plus, 
  Play, 
  Trash2, 
  Search, 
  Radio, 
  Clock, 
  Layers,
  Skull,
  Clapperboard,
  Landmark,
  Zap,
  RefreshCw,
  Lightbulb,
  ChevronRight,
  Dice5,
  Dices
} from 'lucide-react';
import { CATEGORIES_DATA } from '../lib/categoriesData';
import { CATEGORY_SEEDLISTS } from '../lib/seedlists';
import { generateRandomScenarioSetup, CATEGORY_GENERATOR_DATA } from '../lib/randomScenarios';
import { CategoryInfo, Experience, ExperienceCategory, CharacterSheet, InventoryItem } from '../types';

interface CategoriesGridProps {
  experiences: Experience[];
  onSelectExperience: (experience: Experience) => void;
  onCreateExperience: (
    category: ExperienceCategory, 
    customTitle: string, 
    character: CharacterSheet,
    openingPrompt?: string,
    suggestedActions?: string[]
  ) => void;
  onDeleteExperience: (id: string) => void;
  selectedModel: string;
}

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  experiences,
  onSelectExperience,
  onCreateExperience,
  onDeleteExperience,
  selectedModel
}) => {
  const [activeTab, setActiveTab] = useState<'experiences' | 'categories'>('categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryModal, setSelectedCategoryModal] = useState<CategoryInfo | null>(null);
  const [modalTab, setModalTab] = useState<'configure' | 'seedlist'>('configure');

  // Form states inside creation modal (All 5 fields)
  const [customTitle, setCustomTitle] = useState('');
  const [charName, setCharName] = useState('');
  const [charRole, setCharRole] = useState('');
  const [charRace, setCharRace] = useState('');
  const [openingPrompt, setOpeningPrompt] = useState('');
  const [physicalDesc, setPhysicalDesc] = useState('');
  const [initialInventory, setInitialInventory] = useState<InventoryItem[]>([]);
  const [initialSpells, setInitialSpells] = useState<string[]>([]);
  const [initialConditions, setInitialConditions] = useState<string[]>(['Well-Rested']);
  const [startingHp, setStartingHp] = useState<number>(12);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);
  const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);

  // Dynamic seedlist ideas
  const [dynamicSeeds, setDynamicSeeds] = useState<{ [category: string]: any }>({});
  const [isRegeneratingSeedlist, setIsRegeneratingSeedlist] = useState(false);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wand2': return <Wand2 className="w-6 h-6" />;
      case 'Compass': return <Compass className="w-6 h-6" />;
      case 'ShieldAlert': return <ShieldAlert className="w-6 h-6" />;
      case 'Ghost': return <Ghost className="w-6 h-6" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6" />;
      case 'Heart': return <Heart className="w-6 h-6" />;
      case 'Flame': return <Flame className="w-6 h-6" />;
      case 'Radio': return <Radio className="w-6 h-6" />;
      case 'Skull': return <Skull className="w-6 h-6" />;
      case 'Eye': return <Eye className="w-6 h-6" />;
      case 'Palette': return <Palette className="w-6 h-6" />;
      case 'Clapperboard': return <Clapperboard className="w-6 h-6" />;
      case 'Landmark': return <Landmark className="w-6 h-6" />;
      case 'Zap': return <Zap className="w-6 h-6" />;
      case 'Briefcase': return <Briefcase className="w-6 h-6" />;
      default: return <Wand2 className="w-6 h-6" />;
    }
  };

  const applyRandomSetup = (catId: ExperienceCategory) => {
    const randomSetup = generateRandomScenarioSetup(catId);
    setCustomTitle(randomSetup.title);
    setCharName(randomSetup.heroName);
    setCharRole(randomSetup.roleClass);
    setCharRace(randomSetup.raceOrigin);
    setOpeningPrompt(randomSetup.hookText);
    setPhysicalDesc(randomSetup.physicalDescription);
    setSuggestedActions(randomSetup.suggestedActions);
    setInitialInventory(randomSetup.initialInventory);
    setInitialSpells(randomSetup.initialSpells);
    setInitialConditions(randomSetup.initialConditions);
    setStartingHp(randomSetup.startingHp);
  };

  const handleRandomizeAll = (cat: CategoryInfo) => {
    applyRandomSetup(cat.id as ExperienceCategory);
  };

  const handleRandomizeTitle = (cat: CategoryInfo) => {
    const data = CATEGORY_GENERATOR_DATA[cat.id as ExperienceCategory] || CATEGORY_GENERATOR_DATA.fantasy;
    const t = data.titles[Math.floor(Math.random() * data.titles.length)];
    setCustomTitle(t);
  };

  const handleRandomizeHeroName = (cat: CategoryInfo) => {
    const data = CATEGORY_GENERATOR_DATA[cat.id as ExperienceCategory] || CATEGORY_GENERATOR_DATA.fantasy;
    const f = data.firstNames[Math.floor(Math.random() * data.firstNames.length)];
    const l = data.lastNames[Math.floor(Math.random() * data.lastNames.length)];
    setCharName(`${f} ${l}`);
  };

  const handleRandomizeRole = (cat: CategoryInfo) => {
    const data = CATEGORY_GENERATOR_DATA[cat.id as ExperienceCategory] || CATEGORY_GENERATOR_DATA.fantasy;
    const r = data.roles[Math.floor(Math.random() * data.roles.length)];
    setCharRole(r);
  };

  const handleRandomizeRace = (cat: CategoryInfo) => {
    const data = CATEGORY_GENERATOR_DATA[cat.id as ExperienceCategory] || CATEGORY_GENERATOR_DATA.fantasy;
    const rc = data.races[Math.floor(Math.random() * data.races.length)];
    setCharRace(rc);
  };

  const handleRandomizeHook = (cat: CategoryInfo) => {
    const data = CATEGORY_GENERATOR_DATA[cat.id as ExperienceCategory] || CATEGORY_GENERATOR_DATA.fantasy;
    const h = data.hooks[Math.floor(Math.random() * data.hooks.length)];
    setOpeningPrompt(h.hook);
    setSuggestedActions(h.actions);
    if (h.gear) {
      setInitialInventory(h.gear.map((g, idx) => ({
        id: `item_hook_${Date.now()}_${idx}`,
        name: g.name,
        type: g.type,
        quantity: 1,
        isEquipped: !!g.isEquipped
      })));
    }
  };

  const handleGenerateScenario = async (cat: CategoryInfo) => {
    // First randomize locally so all 5 fields change instantly
    applyRandomSetup(cat.id as ExperienceCategory);

    setIsGeneratingScenario(true);
    try {
      const res = await fetch('/api/gemini/generate-scenario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category: cat.id,
          model: selectedModel
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.scenario) {
          // Update ALL 5 setup fields with AI's tailored response
          if (data.scenario.title) setCustomTitle(data.scenario.title);
          if (data.scenario.heroName) setCharName(data.scenario.heroName);
          if (data.scenario.roleClass) setCharRole(data.scenario.roleClass);
          if (data.scenario.raceOrigin) setCharRace(data.scenario.raceOrigin);
          if (data.scenario.hookText) setOpeningPrompt(data.scenario.hookText);
          if (data.scenario.physicalDescription) setPhysicalDesc(data.scenario.physicalDescription);
          if (data.scenario.suggestedActions) setSuggestedActions(data.scenario.suggestedActions);

          if (data.scenario.initialInventory && Array.isArray(data.scenario.initialInventory)) {
            setInitialInventory(data.scenario.initialInventory.map((item: any, idx: number) => ({
              id: `item_init_${Date.now()}_${idx}`,
              name: item.name || 'Adventurer Tool',
              type: item.type || 'misc',
              quantity: item.quantity || 1,
              isEquipped: !!item.isEquipped,
              description: item.description
            })));
          }

          if (data.scenario.initialSpells && Array.isArray(data.scenario.initialSpells)) {
            setInitialSpells(data.scenario.initialSpells);
          }

          if (data.scenario.initialConditions && Array.isArray(data.scenario.initialConditions)) {
            setInitialConditions(data.scenario.initialConditions);
          }

          if (data.scenario.startingHp) {
            setStartingHp(data.scenario.startingHp);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingScenario(false);
    }
  };

  const handleRegenerateSeedlist = async (cat: CategoryInfo) => {
    setIsRegeneratingSeedlist(true);
    try {
      const res = await fetch('/api/gemini/generate-seedlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: cat.id, model: selectedModel })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.seedlist) {
          setDynamicSeeds(prev => ({
            ...prev,
            [cat.id]: data.seedlist
          }));
        }
      }
    } catch (err) {
      console.error('Seedlist regen error:', err);
    } finally {
      setIsRegeneratingSeedlist(false);
    }
  };

  const handleApplySeedHook = (hookItem: any, cat: CategoryInfo) => {
    if (typeof hookItem === 'string') {
      // Roll a full fresh random setup first so all 5 fields get unique values,
      // then override just the opening hook text with the seed's content.
      applyRandomSetup(cat.id as ExperienceCategory);
      // Use a more descriptive title derived from the hook
      const titleWords = hookItem.split(' ').slice(0, 6).join(' ').replace(/[.,:;!?]/g, '');
      setCustomTitle(`${titleWords}: Chapter I`);
      setOpeningPrompt(hookItem);
    } else {
      // Full 5-field object from AI seedlist / presets — first roll fresh base, then override
      applyRandomSetup(cat.id as ExperienceCategory);
      if (hookItem.title) setCustomTitle(hookItem.title);
      if (hookItem.heroName) setCharName(hookItem.heroName);
      if (hookItem.roleClass) setCharRole(hookItem.roleClass);
      if (hookItem.raceOrigin) setCharRace(hookItem.raceOrigin);
      if (hookItem.hook) setOpeningPrompt(hookItem.hook);
      if (hookItem.suggestedActions) setSuggestedActions(hookItem.suggestedActions);
    }
    setModalTab('configure');
  };

  const handleOpenCategoryModal = (cat: CategoryInfo) => {
    setSelectedCategoryModal(cat);
    setModalTab('configure');
    // Instantly roll a complete, randomized 5-field campaign setup
    applyRandomSetup(cat.id as ExperienceCategory);
  };

  const handleConfirmCreate = () => {
    if (!selectedCategoryModal) return;

    const fullChar: CharacterSheet = {
      id: `char_${Date.now()}`,
      name: charName || selectedCategoryModal.defaultCharacter.name || 'Hero',
      roleClass: charRole || selectedCategoryModal.defaultCharacter.roleClass || 'Adventurer',
      raceOrigin: charRace || selectedCategoryModal.defaultCharacter.raceOrigin || 'Human',
      level: selectedCategoryModal.defaultCharacter.level || 1,
      hp: startingHp || selectedCategoryModal.defaultCharacter.hp || 24,
      maxHp: startingHp || selectedCategoryModal.defaultCharacter.maxHp || 24,
      armorClass: selectedCategoryModal.defaultCharacter.armorClass || 14,
      initiativeBonus: selectedCategoryModal.defaultCharacter.initiativeBonus || 2,
      stats: selectedCategoryModal.defaultCharacter.stats || { str: 12, dex: 12, con: 12, int: 10, wis: 10, cha: 10 },
      inventory: initialInventory.length > 0 ? initialInventory : (selectedCategoryModal.defaultCharacter.inventory || []),
      spells: initialSpells.length > 0 ? initialSpells : (selectedCategoryModal.defaultCharacter.spells || []),
      statusEffects: initialConditions.length > 0 ? initialConditions : ['Well-Rested'],
      backgroundNotes: selectedCategoryModal.defaultCharacter.backgroundNotes || '',
      physicalDescription: physicalDesc || ''
    };

    onCreateExperience(
      selectedCategoryModal.id,
      customTitle || `${selectedCategoryModal.name} Experience`,
      fullChar,
      openingPrompt,
      suggestedActions
    );

    setSelectedCategoryModal(null);
  };

  const filteredCategories = CATEGORIES_DATA.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tagline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeSeed = selectedCategoryModal ? (dynamicSeeds[selectedCategoryModal.id] || CATEGORY_SEEDLISTS[selectedCategoryModal.id]) : null;

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#0F0F12] text-slate-200 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Banner Section */}
        <div className="relative overflow-hidden rounded-lg bg-[#16161D] border border-white/10 p-5 sm:p-8 shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-amber-400 text-[10px] uppercase tracking-widest font-mono font-bold">
              <Dice5 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              ROLL ZERO0 ENGINE • D&D 5E ADJUDICATOR
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif tracking-tight text-amber-50">
              Select An Experience
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
              Launch immersive tabletop campaigns with authentic D&D odds, starting scenario hooks, and story-driven dynamic state management.
            </p>
          </div>
        </div>

        {/* Navigation Bar & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 bg-[#111118] p-1 rounded border border-white/10">
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'categories'
                  ? 'bg-amber-600 text-black font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Genre Categories ({CATEGORIES_DATA.length})
            </button>
            <button
              onClick={() => setActiveTab('experiences')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition flex items-center gap-2 relative ${
                activeTab === 'experiences'
                  ? 'bg-amber-600 text-black font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Active Experiences ({experiences.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter genres or titles..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-600/50"
            />
          </div>
        </div>

        {/* Categories Tab Content */}
        {activeTab === 'categories' && (
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-3">
              Available Campaign Archetypes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {filteredCategories.map((cat) => {
                const catSeed = CATEGORY_SEEDLISTS[cat.id];
                return (
                  <div
                    key={cat.id}
                    className="group relative rounded-lg bg-[#111118] border border-white/5 hover:border-amber-600/50 transition-all duration-200 p-4 flex flex-col justify-between hover:bg-white/5 cursor-pointer space-y-3"
                    onClick={() => handleOpenCategoryModal(cat)}
                  >
                    <div className="relative z-10 space-y-2">
                      <div className="flex items-center justify-between">
                        <div 
                          className="p-2 rounded bg-white/5 border border-white/10 transition group-hover:scale-105"
                          style={{ color: cat.accentColor }}
                        >
                          {getCategoryIcon(cat.iconName)}
                        </div>
                        <span className="text-[9px] font-mono tracking-widest font-bold uppercase px-1.5 py-0.5 rounded bg-black/40 text-slate-500 border border-white/5">
                          {cat.id}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 font-serif">
                          {cat.name}
                        </h3>
                        <p className="text-[10px] font-mono text-amber-500/90 tracking-wide mt-0.5">
                          {cat.tagline}
                        </p>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                        {cat.description}
                      </p>

                      {catSeed && (
                        <div className="pt-1">
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono text-slate-400 bg-black/50 border border-white/5 px-2 py-0.5 rounded-full">
                            <Lightbulb className="w-2.5 h-2.5 text-amber-400" />
                            <span className="truncate max-w-[170px]">{catSeed.seedSource}</span>
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="relative z-10 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-amber-500 uppercase tracking-wider text-[10px]">
                      <span>Launch Setup</span>
                      <Plus className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Experiences Tab Content */}
        {activeTab === 'experiences' && (
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-3">
              Active Cloud Sessions
            </h2>
            {experiences.length === 0 ? (
              <div className="text-center py-12 bg-[#111118] rounded-lg border border-white/5 space-y-3">
                <div className="w-10 h-10 mx-auto rounded bg-white/5 flex items-center justify-center text-amber-500 border border-white/10">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-serif font-bold text-slate-200">No Active Experiences Found</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Select any genre category above to launch a new tabletop adventure session.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('categories')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black text-xs font-bold uppercase tracking-wider rounded transition inline-flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Browse Categories
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {experiences.map((exp) => {
                  const catObj = CATEGORIES_DATA.find(c => c.id === exp.category);
                  return (
                    <div
                      key={exp.id}
                      className="group bg-[#111118] rounded-lg border border-white/5 hover:border-amber-600/50 p-4 transition duration-200 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-white/5 text-amber-400 border border-white/10">
                            {catObj?.name || exp.category}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(exp.updatedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-serif font-bold text-slate-100 group-hover:text-amber-300 transition">
                            {exp.title}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                            {exp.description || 'Active campaign session.'}
                          </p>
                        </div>

                        {/* Character Snippet */}
                        <div className="p-2.5 rounded bg-[#0A0A0F] border border-white/5 text-xs flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {exp.character?.avatarUrl ? (
                              <img 
                                src={exp.character.avatarUrl} 
                                alt={exp.character.name || 'Hero'} 
                                className="w-7 h-7 rounded object-cover border border-amber-600/40"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded bg-amber-600/20 border border-amber-600/40 text-amber-300 flex items-center justify-center font-bold text-xs font-serif">
                                {exp.character?.name?.[0] || 'H'}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-slate-200 text-xs">{exp.character?.name || 'Hero'}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {exp.character?.raceOrigin || 'Adventurer'} • {exp.character?.roleClass || 'Hero'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right font-mono text-[10px] text-amber-400">
                            HP {exp.character?.hp ?? 10}/{exp.character?.maxHp ?? 10}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => onSelectExperience(exp)}
                          className="flex-1 py-1.5 px-3 rounded bg-amber-600 hover:bg-amber-500 text-black text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5"
                        >
                          <Play className="w-3 h-3 fill-black" />
                          Resume
                        </button>

                        <button
                          onClick={() => onDeleteExperience(exp.id)}
                          className="p-1.5 rounded bg-white/5 hover:bg-red-950 hover:text-red-300 text-slate-500 transition border border-white/5"
                          title="Delete Experience"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Modal: Create Experience Setup */}
        {selectedCategoryModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111118] border border-white/10 rounded-lg max-w-2xl w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2.5 rounded bg-white/5 border border-white/10"
                    style={{ color: selectedCategoryModal.accentColor }}
                  >
                    {getCategoryIcon(selectedCategoryModal.iconName)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-amber-50 font-serif">
                      Initialize {selectedCategoryModal.name} Campaign
                    </h2>
                    <p className="text-xs text-slate-400">{selectedCategoryModal.tagline}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCategoryModal(null)}
                  className="text-slate-400 hover:text-slate-100 text-xs font-mono"
                >
                  ✕
                </button>
              </div>

              {/* Subtabs: Configure vs Seedlist Brainstorming */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setModalTab('configure')}
                    className={`px-3 py-1 text-xs rounded font-semibold transition ${
                      modalTab === 'configure'
                        ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    5-Field Campaign Setup
                  </button>
                  <button
                    onClick={() => setModalTab('seedlist')}
                    className={`px-3 py-1 text-xs rounded font-semibold transition flex items-center gap-1.5 ${
                      modalTab === 'seedlist'
                        ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Lightbulb className="w-3 h-3 text-amber-400" />
                    Seed Ideas & Tropes
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRandomizeAll(selectedCategoryModal)}
                    className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-black font-bold text-[11px] font-mono flex items-center gap-1.5 transition shadow-sm"
                    title="Instantly re-roll all five fields with fresh random character and hook"
                  >
                    <Dice5 className="w-3.5 h-3.5" />
                    Randomize All 5 Fields
                  </button>
                  <button
                    type="button"
                    disabled={isGeneratingScenario}
                    onClick={() => handleGenerateScenario(selectedCategoryModal)}
                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-amber-300 flex items-center gap-1.5 transition disabled:opacity-50"
                    title="Generate with Gemini AI"
                  >
                    <RefreshCw className={`w-3 h-3 ${isGeneratingScenario ? 'animate-spin' : ''}`} />
                    AI Re-roll
                  </button>
                </div>
              </div>

              {modalTab === 'configure' ? (
                <div className="space-y-4">
                  {/* Field 1: Campaign Title */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                        1. Experience Title
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRandomizeTitle(selectedCategoryModal)}
                        className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
                        title="Roll random title"
                      >
                        <Dice5 className="w-3 h-3" />
                        Roll Title
                      </button>
                    </div>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full bg-[#0A0A0F] border border-white/10 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-600/50"
                      placeholder="e.g. Chronicles of the Blood Moon"
                    />
                  </div>

                  {/* Fields 2, 3, 4: Character Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                          2. Hero Name
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRandomizeHeroName(selectedCategoryModal)}
                          className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
                          title="Roll random hero name"
                        >
                          <Dice5 className="w-2.5 h-2.5" />
                          Roll Name
                        </button>
                      </div>
                      <input
                        type="text"
                        value={charName}
                        onChange={(e) => setCharName(e.target.value)}
                        className="w-full bg-[#0A0A0F] border border-white/10 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-600/50 font-medium"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                          3. Class / Archetype
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRandomizeRole(selectedCategoryModal)}
                          className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
                          title="Roll random class role"
                        >
                          <Dice5 className="w-2.5 h-2.5" />
                          Roll Role
                        </button>
                      </div>
                      <input
                        type="text"
                        value={charRole}
                        onChange={(e) => setCharRole(e.target.value)}
                        className="w-full bg-[#0A0A0F] border border-white/10 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-600/50 font-medium"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                          4. Race / Origin
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRandomizeRace(selectedCategoryModal)}
                          className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
                          title="Roll random race origin"
                        >
                          <Dice5 className="w-2.5 h-2.5" />
                          Roll Race
                        </button>
                      </div>
                      <input
                        type="text"
                        value={charRace}
                        onChange={(e) => setCharRace(e.target.value)}
                        className="w-full bg-[#0A0A0F] border border-white/10 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-600/50 font-medium"
                      />
                    </div>
                  </div>

                  {/* Field 5: Opening Scenario Hook (Beginning of Story) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                        5. Starting Scenario Hook (Act I, Scene 1 Beginning)
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRandomizeHook(selectedCategoryModal)}
                        className="text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1"
                        title="Roll a fresh Act 1 Scene 1 starting hook"
                      >
                        <Dice5 className="w-3 h-3" />
                        Roll Hook
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={openingPrompt}
                      onChange={(e) => setOpeningPrompt(e.target.value)}
                      disabled={isGeneratingScenario}
                      className="w-full bg-[#0A0A0F] border border-white/10 rounded p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-600/50 leading-relaxed resize-none disabled:opacity-60 font-sans"
                    />
                    
                    {/* Thematic Starting Gear Preview */}
                    {initialInventory.length > 0 && (
                      <div className="mt-2.5 p-2 rounded bg-black/40 border border-white/5 space-y-1 text-xs">
                        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold flex items-center justify-between">
                          <span>Story-Linked Starting Inventory ({initialInventory.length} items):</span>
                          <span className="text-amber-400 font-bold">HP {startingHp}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {initialInventory.map((item, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300">
                              {item.name}
                            </span>
                          ))}
                          {initialSpells.map((sp, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/40 text-[10px] font-mono text-blue-300">
                              ⚡ {sp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Seedlist tab with dynamic regeneration */
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                  <div className="flex items-center justify-between p-3 rounded bg-amber-950/20 border border-amber-600/30 text-xs text-amber-200">
                    <div className="space-y-0.5">
                      <div className="font-bold flex items-center gap-1.5 text-amber-300">
                        <Lightbulb className="w-3.5 h-3.5" />
                        Inspiration Source: {activeSeed?.seedSource || selectedCategoryModal.name}
                      </div>
                      <p className="text-[11px] text-amber-200/80">
                        Click any seed or trope below to instantly adopt it and update your campaign setup.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isRegeneratingSeedlist}
                      onClick={() => handleRegenerateSeedlist(selectedCategoryModal)}
                      className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-black font-bold text-[10px] font-mono flex items-center gap-1 shrink-0 ml-3 transition disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isRegeneratingSeedlist ? 'animate-spin' : ''}`} />
                      Regenerate Seed Ideas
                    </button>
                  </div>

                  {activeSeed && (
                    <div className="space-y-3">
                      {activeSeed.openingHooks && (
                        <div>
                          <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1.5">
                            AI Opening Hook Presets (Click to adopt all 5 fields)
                          </h4>
                          <div className="space-y-2">
                            {activeSeed.openingHooks.map((oh: any, idx: number) => (
                              <div
                                key={idx}
                                onClick={() => handleApplySeedHook(oh, selectedCategoryModal)}
                                className="p-3 rounded bg-black/40 border border-white/5 hover:border-amber-500/50 hover:bg-white/5 cursor-pointer transition text-xs space-y-1 group"
                              >
                                <div className="flex items-center justify-between text-amber-300 font-bold font-serif">
                                  <span>{oh.title}</span>
                                  <span className="text-[10px] font-mono text-slate-500 font-normal">
                                    {oh.heroName} ({oh.roleClass})
                                  </span>
                                </div>
                                <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2">
                                  {oh.hook}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1.5">
                          Genre Tropes & Motifs
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {(activeSeed.narrativeTropes || []).map((trope: string, idx: number) => (
                            <span 
                              key={idx} 
                              className="text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 font-mono cursor-pointer hover:border-amber-400/50 hover:text-amber-300 transition"
                              onClick={() => {
                                setOpeningPrompt((prev) => `${prev ? prev + ' ' : ''}[Trope: ${trope}]`);
                                setModalTab('configure');
                              }}
                            >
                              {trope}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1.5">
                          Brainstorm Scenario Hooks (Click to apply)
                        </h4>
                        <div className="space-y-2">
                          {(activeSeed.brainstormHooks || []).map((hook: string, idx: number) => (
                            <div
                              key={idx}
                              onClick={() => handleApplySeedHook(hook, selectedCategoryModal)}
                              className="p-2.5 rounded bg-black/40 border border-white/5 hover:border-amber-500/50 hover:bg-white/5 cursor-pointer transition text-xs text-slate-300 flex items-start justify-between gap-2"
                            >
                              <span>{hook}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {activeSeed.encounterSeeds && (
                        <div>
                          <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1.5">
                            Encounter Seeds
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {activeSeed.encounterSeeds.map((enc: string, idx: number) => (
                              <div key={idx} className="p-2 rounded bg-black/40 border border-white/5 text-[11px] text-slate-400">
                                • {enc}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  onClick={() => setSelectedCategoryModal(null)}
                  className="px-3 py-1.5 rounded text-xs font-semibold text-slate-400 hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCreate}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-black text-xs font-bold uppercase tracking-wider rounded transition flex items-center gap-1.5 shadow"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Initialize Campaign
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

