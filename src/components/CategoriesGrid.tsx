import { Portrait } from './ui/Portrait';
import { campaignTitle } from '../lib/titles';
import ModeSwitch from './ModeSwitch';
import { PortraitsOffError, setFreePortraitsAllowed } from '../lib/portraits';
import { clickable } from './ui/a11y';
import { useDialog } from './ui/useDialog';
import React, { useState, useRef, lazy, Suspense } from 'react';
import { uid } from '../lib/ids';
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
  Dice5,
  Dices,
  Camera
} from 'lucide-react';
import { CATEGORIES_DATA, drawOpeners, markOpenersSeen, pickInspiration, gearToInventory, getContent, OpenerDraw, Opener } from '../content';
import { generateRandomScenarioSetup } from '../content/procedural';
import { generateScenarioAI, generateSeedlistAI, rollSingleFieldAI, generateAvatarAI, hasActiveGeminiKey, generateChapterOneAI, OFFLINE_ENGINE_LABEL } from '../lib/geminiService';
import { RULES_MODES, RulesMode, abilityMod, fmtMod, roleTemplate } from '../dnd/rules';
import { CategoryInfo, Experience, ExperienceCategory, CharacterSheet, InventoryItem, DMStoryOutline, TropeCategory, CampaignInspiration } from '../types';


// Loaded on demand so the backup code stays out of the main bundle.
const BackupPanel = lazy(() => import('./BackupPanel'));

/** Input limits on the setup screen (PS10). The premise is re-sent with every turn, so it is capped. */
const FIELD_LIMITS = {
  title: 100,
  heroName: 60,
  roleClass: 60,
  raceOrigin: 60,
  pronouns: 30,
  description: 500,
  premise: 2000,
} as const;

interface CategoriesGridProps {
  experiences: Experience[];
  onSelectExperience: (experience: Experience) => void;
  onCreateExperience: (
    category: ExperienceCategory, 
    customTitle: string, 
    character: CharacterSheet,
    openingPrompt?: string,
    suggestedActions?: string[],
    storyOutline?: DMStoryOutline,
    chapterOneOpening?: string,
    chapterOneModel?: string,
    inspiration?: CampaignInspiration,
    rulesMode?: RulesMode
  ) => Promise<void>;
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
  const [chapterOneFailure, setChapterOneFailure] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryModal, setSelectedCategoryModal] = useState<CategoryInfo | null>(null);
  const [modalTab, setModalTab] = useState<'configure' | 'seedlist'>('configure');

  // Form states inside creation modal (All 5 fields)
  const [customTitle, setCustomTitle] = useState('');
  const [charName, setCharName] = useState('');
  const [charGender, setCharGender] = useState<'she/her' | 'he/him' | 'they/them' | 'custom'>('she/her');
  const [customGender, setCustomGender] = useState('');
  const [charRole, setCharRole] = useState('');
  const [charRace, setCharRace] = useState('');
  const [openingPrompt, setOpeningPrompt] = useState('');
  const [physicalDesc, setPhysicalDesc] = useState('');
  const [charAvatarUrl, setCharAvatarUrl] = useState<string | undefined>(undefined);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [initialInventory, setInitialInventory] = useState<InventoryItem[]>([]);
  const [initialSpells, setInitialSpells] = useState<string[]>([]);
  const [initialConditions, setInitialConditions] = useState<string[]>(['Well-Rested']);
  const [startingHp, setStartingHp] = useState<number>(0);
  const [rulesMode, setRulesModeState] = useState<RulesMode>(() => {
    try {
      return localStorage.getItem('zeroroll_rules_mode') === 'full5e' ? 'full5e' : 'narrative';
    } catch (_) {
      return 'narrative';
    }
  });
  const setRulesMode = (m: RulesMode) => {
    setRulesModeState(m);
    try {
      localStorage.setItem('zeroroll_rules_mode', m);
    } catch (_) {
      /* the choice still applies to this campaign */
    }
  };
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);
  const [currentStoryOutline, setCurrentStoryOutline] = useState<DMStoryOutline | undefined>(undefined);
  // Where the current setup fields came from, so offline drafts are never mistaken for AI output.
  const [setupSource, setSetupSource] = useState<'offline' | 'ai' | 'seed'>('offline');

  // Five openers at a time from this category; seen ones are skipped until all have been shown.
  const [currentScenarioSeeds, setCurrentScenarioSeeds] = useState<OpenerDraw[]>([]);
  // Media and story seeds for this setup, picked once and stored on the campaign (injection policy).
  const [inspiration, setInspiration] = useState<CampaignInspiration | undefined>(undefined);
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

  // --- Setup screen bookkeeping (PS1, PS2, PS4, PS11) -----------------------------------
  // A generation id bumped whenever the modal opens or closes: a roll that finishes after
  // the player moved on is dropped instead of landing in another category (PS1).
  const genRef = useRef(0);
  const isCurrent = (gen: number) => gen === genRef.current;
  // Where the premise text came from. Only the player's own words or a chosen seed are
  // sent to the AI as "the user's concept"; an offline draft never is (PS2).
  const [premiseSource, setPremiseSource] = useState<'player' | 'procedural' | 'ai' | 'seed'>('procedural');
  // Fields the player typed since the last roll, so a re-roll asks before replacing them (PS4).
  const [editedFields, setEditedFields] = useState<Set<string>>(new Set());
  const markEdited = (field: string) => setEditedFields((prev) => (prev.has(field) ? prev : new Set(prev).add(field)));
  // One busy flag per action (PS11). Initialize waits until none are running.
  const [busyActions, setBusyActions] = useState<Set<string>>(new Set());
  const setBusy = (action: string, on: boolean) =>
    setBusyActions((prev) => {
      const next = new Set(prev);
      if (on) next.add(action);
      else next.delete(action);
      return next;
    });
  const isBusy = (action: string) => busyActions.has(action);
  const anyBusy = busyActions.size > 0;
  // Inline note for a failed roll on this form (PS12).
  const [formNote, setFormNote] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const resolvedPronouns = () => (charGender === 'custom' ? customGender.trim() || 'they/them' : charGender);

  /** One description of the hero for every single-field roll (PS13). */
  const characterContext = () => {
    const parts = [
      charName.trim() && `Hero name: ${charName.trim()}`,
      `Pronouns: ${resolvedPronouns()}`,
      charRole.trim() && `Role: ${charRole.trim()}`,
      charRace.trim() && `Origin: ${charRace.trim()}`,
      openingPrompt.trim() && `Premise: ${openingPrompt.trim().slice(0, 600)}`,
    ].filter(Boolean);
    return parts.join('. ');
  };

  const closeModal = () => {
    genRef.current++;
    setSelectedCategoryModal(null);
  };
  // Cancel, Escape and the backdrop ask before throwing away typed fields (PS14).
  const requestCloseModal = () => {
    if (editedFields.size > 0 && !window.confirm('Discard this campaign setup? What you typed will be lost.')) return;
    closeModal();
  };
  const setupDialog = useDialog(requestCloseModal, { labelledBy: 'setup-title', active: !!selectedCategoryModal });

  const confirmReplaceEdits = (fields: string[]) => {
    const touched = fields.filter((f) => editedFields.has(f));
    if (touched.length === 0) return true;
    return window.confirm(`This replaces what you typed in: ${touched.join(', ')}. Continue?`);
  };

  const applyRandomSetup = (catId: ExperienceCategory) => {
    const randomSetup = generateRandomScenarioSetup(catId);
    setSetupSource('offline');
    setPremiseSource('procedural');
    setEditedFields(new Set());
    setCustomTitle(randomSetup.title);
    setCharName(randomSetup.heroName);
    setCharRole(randomSetup.roleClass);
    setCharRace(randomSetup.raceOrigin);
    setOpeningPrompt(randomSetup.storyBlurb);
    setPhysicalDesc(randomSetup.physicalDescription);
    setSuggestedActions(randomSetup.suggestedActions);
    setInitialInventory(randomSetup.initialInventory);
    // The random hook's spells and HP are not tied to its role, so the role decides (PS8).
    setInitialSpells([]);
    setInitialConditions(randomSetup.initialConditions);
    setStartingHp(0);

    // Clear any AI-specific state from previous generations
    setCurrentStoryOutline(undefined);
    setCharAvatarUrl(undefined);
    setAvatarError(null);
  };

  const rollField = async (
    cat: CategoryInfo,
    field: 'title' | 'heroName' | 'roleClass' | 'raceOrigin',
    label: string,
    apply: (value: string) => void
  ) => {
    const gen = genRef.current;
    setBusy(`field:${field}`, true);
    setFormNote(null);
    try {
      const value = (await rollSingleFieldAI(cat.id as ExperienceCategory, field, selectedModel, characterContext(), !hasActiveGeminiKey()))
        .trim()
        .slice(0, FIELD_LIMITS[field]);
      if (!isCurrent(gen)) return;
      apply(value);
      setEditedFields((prev) => {
        const next = new Set(prev);
        next.delete(label);
        return next;
      });
    } catch (err) {
      if (isCurrent(gen)) setFormNote(`Could not roll ${label.toLowerCase()}: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(`field:${field}`, false);
    }
  };

  const handleRandomizeTitle = (cat: CategoryInfo) => rollField(cat, 'title', 'Title', setCustomTitle);
  const handleRandomizeHeroName = (cat: CategoryInfo) => rollField(cat, 'heroName', 'Name', setCharName);
  const handleRandomizeRole = (cat: CategoryInfo) => rollField(cat, 'roleClass', 'Role', setCharRole);
  const handleRandomizeRace = (cat: CategoryInfo) => rollField(cat, 'raceOrigin', 'Origin', setCharRace);

  /**
   * AI scenario roll.
   * - 'all' (AI Re-roll All Fields): replaces every field, after confirming typed edits.
   * - 'hook' (Roll Hook): replaces only the premise, outline and actions, written for the hero
   *   as it stands (PS4).
   */
  const handleGenerateScenario = async (cat: CategoryInfo, mode: 'all' | 'hook') => {
    const replaced = mode === 'all' ? ['Title', 'Name', 'Role', 'Origin', 'Premise', 'Description'] : ['Premise'];
    if (!confirmReplaceEdits(replaced)) return;

    const gen = genRef.current;
    const action = mode === 'all' ? 'scenario' : 'hook';
    setBusy(action, true);
    setFormNote(null);
    // Only the player's own concept or a chosen seed steers the AI (PS2).
    const concept = premiseSource === 'player' || premiseSource === 'seed' ? openingPrompt.trim() || undefined : undefined;
    const keepHero = mode === 'hook' || editedFields.has('Name') || editedFields.has('Role') || editedFields.has('Origin');
    try {
      const data = await generateScenarioAI({
        category: cat.id as ExperienceCategory,
        model: selectedModel,
        userPrompt: concept,
        gender: resolvedPronouns(),
        characterName: keepHero ? charName.trim() || undefined : undefined,
        classRole: keepHero ? charRole.trim() || undefined : undefined,
        raceOrigin: keepHero ? charRace.trim() || undefined : undefined,
        // On this screen a failure is shown on the form; the fields stay as they were (PS12).
        allowFallback: !hasActiveGeminiKey(),
        inspiration
      });
      if (!isCurrent(gen) || !data?.scenario) return;
      const sc = data.scenario;
      const fromAI = data.source === 'ai';

      // Outline is set or cleared on every apply, never left over from another story (PS3).
      setCurrentStoryOutline(fromAI ? sc.storyOutline : undefined);
      if (sc.storyBlurb) {
        setOpeningPrompt(sc.storyBlurb.slice(0, FIELD_LIMITS.premise));
        setPremiseSource(fromAI ? 'ai' : 'procedural');
      }
      if (sc.suggestedActions) setSuggestedActions(sc.suggestedActions);

      if (mode === 'all') {
        setSetupSource(fromAI ? 'ai' : 'offline');
        setEditedFields(new Set());
        if (sc.title) setCustomTitle(sc.title.slice(0, FIELD_LIMITS.title));
        if (sc.heroName) setCharName(sc.heroName.slice(0, FIELD_LIMITS.heroName));
        if (sc.roleClass) setCharRole(sc.roleClass.slice(0, FIELD_LIMITS.roleClass));
        if (sc.raceOrigin) setCharRace(sc.raceOrigin.slice(0, FIELD_LIMITS.raceOrigin));
        if (sc.physicalDescription) setPhysicalDesc(sc.physicalDescription.slice(0, FIELD_LIMITS.description));
        if (sc.avatarUrl) setCharAvatarUrl(sc.avatarUrl);
        if (Array.isArray(sc.initialInventory)) {
          setInitialInventory(sc.initialInventory.map((item: any, idx: number) => ({
            id: `item_init_${uid()}_${idx}`,
            name: item.name || 'Adventurer Tool',
            type: item.type || 'misc',
            quantity: item.quantity || 1,
            isEquipped: !!item.isEquipped,
            description: item.description
          })));
        }
        if (Array.isArray(sc.initialConditions)) setInitialConditions(sc.initialConditions);
        // AI starting spells are kept (S21); HP follows the role (PS8).
        setInitialSpells(Array.isArray(sc.initialSpells) ? sc.initialSpells.filter((x: unknown): x is string => typeof x === 'string').slice(0, 6) : []);
        setStartingHp(0);
      } else {
        setEditedFields((prev) => {
          const next = new Set(prev);
          next.delete('Premise');
          return next;
        });
      }
    } catch (err) {
      if (isCurrent(gen)) {
        setFormNote(`${mode === 'all' ? 'AI re-roll' : 'Roll Hook'} failed, so nothing was changed: ${err instanceof Error ? err.message : String(err)}`);
      }
    } finally {
      setBusy(action, false);
    }
  };

  const handleRandomizeHook = (cat: CategoryInfo) => handleGenerateScenario(cat, 'hook');

  const [portraitsOff, setPortraitsOff] = useState(false);
  const handleRenderPortrait = async (cat: CategoryInfo) => {
    const gen = genRef.current;
    setBusy('portrait', true);
    setAvatarError(null);
    try {
      const data = await generateAvatarAI({
        characterName: charName.trim() || 'Hero',
        roleClass: charRole.trim() || 'Adventurer',
        raceOrigin: charRace.trim() || 'Human',
        gender: resolvedPronouns(),
        category: cat.id as ExperienceCategory,
        physicalDescription: physicalDesc.trim(),
        model: selectedModel
      });
      if (isCurrent(gen) && data?.avatarUrl) setCharAvatarUrl(data.avatarUrl);
    } catch (err: any) {
      if (isCurrent(gen)) setAvatarError(err.message || 'Failed to generate character avatar.');
      if (err instanceof PortraitsOffError && isCurrent(gen)) setPortraitsOff(true);
    } finally {
      setBusy('portrait', false);
    }
  };

  const showOpeners = (catId: ExperienceCategory) => {
    const draw = drawOpeners(catId, 5);
    setCurrentScenarioSeeds(draw);
    markOpenersSeen(catId, draw.filter((d) => !d.padded).map((d) => d.opener.id));
  };

  /** A chosen opener fills every field from itself: hero, premise, actions, gear, spells and HP. */
  const handleApplyPlayableSeed = (seed: Opener, cat: CategoryInfo) => {
    if (!confirmReplaceEdits(['Title', 'Name', 'Role', 'Origin', 'Premise', 'Description'])) return;
    genRef.current++;
    setEditedFields(new Set());
    setCustomTitle(seed.title);
    setCharName(seed.hero.name);
    setCharRole(seed.hero.role);
    setCharRace(seed.hero.origin);
    setOpeningPrompt(seed.premise);
    setPremiseSource('seed');
    setPhysicalDesc('');
    setSuggestedActions([...seed.actions]);
    setInitialInventory(gearToInventory(seed.gear));
    setInitialSpells([...seed.spells]);
    setInitialConditions(['Well-Rested']);
    setStartingHp(seed.hp);
    setCharAvatarUrl(undefined);
    // A minimal outline from the opener itself, so Chapter One and the roadmap describe this story (PS3).
    setCurrentStoryOutline({
      startingCircumstances: seed.premise,
      immediateGoal: seed.actions[0],
    } as DMStoryOutline);
    setInspiration(pickInspiration(cat.id as ExperienceCategory, seed.id));
    setSetupSource('seed');
    setModalTab('configure');
  };

  const handleApplyTrope = (trope: TropeCategory | { name: string; premise?: string; tagline?: string }) => {
    const tropeName = trope.name;
    const tropePremise = (trope.premise || (trope as any).tagline || '').trim();
    // Use the trope's own text; the "[Trope: …]" literal used to leak into premises and titles (SL10).
    if (tropePremise) {
      setOpeningPrompt((prev) => `${prev.trim() ? `${prev.trim()} ` : ''}${tropePremise}`.slice(0, FIELD_LIMITS.premise));
      setPremiseSource('player');
    }
    if (!/^prompt \d+$/i.test(tropeName.trim())) setCustomTitle(tropeName.trim().slice(0, FIELD_LIMITS.title));
    // The premise changed, so any AI outline no longer matches it (PS3).
    setCurrentStoryOutline(undefined);
    setModalTab('configure');
  };

  const handleRegenerateSeedlist = async (cat: CategoryInfo) => {
    setIsRegeneratingSeedlist(true);
    try {
      const data = await generateSeedlistAI({
        category: cat.id as ExperienceCategory,
        model: selectedModel
      });
      if (data && data.seedlist) {
        setDynamicSeeds(prev => ({
          ...prev,
          [cat.id]: data.seedlist
        }));
      }
    } catch (err) {
      console.error('Seedlist regen error:', err);
    } finally {
      setIsRegeneratingSeedlist(false);
    }
  };


  const handleOpenCategoryModal = (cat: CategoryInfo) => {
    genRef.current++;
    setSelectedCategoryModal(cat);
    setChapterOneFailure(null);
    setFormNote(null);
    setFormErrors({});
    setBusyActions(new Set());
    setModalTab('configure');
    setCurrentStoryOutline(undefined);
    setAvatarError(null);

    showOpeners(cat.id as ExperienceCategory);
    setInspiration(pickInspiration(cat.id as ExperienceCategory));

    // Instantly roll a complete, randomized 5-field campaign setup
    applyRandomSetup(cat.id as ExperienceCategory);
  };

  /** Trims every field and returns the problems to show inline (PS10). */
  const validateSetup = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!charName.trim()) errors.name = 'Give your hero a name.';
    if (!charRole.trim()) errors.role = 'Pick a role or class.';
    if (!charRace.trim()) errors.origin = 'Pick an origin.';
    if (charGender === 'custom' && !customGender.trim()) errors.pronouns = 'Type the pronouns to use, or pick one of the options.';
    if (!openingPrompt.trim()) errors.premise = 'Write a premise or roll one.';
    return errors;
  };

  // What the hero sheet will hold, shown before Initialize (PS8, PS9): stats, HP and AC
  // from the role; spells from the opener or the AI, else the role's.
  const template = roleTemplate(charRole || 'Adventurer');
  const heroPreview = {
    stats: template.stats,
    maxHp: startingHp || template.maxHp,
    armorClass: template.armorClass,
    spells: initialSpells.length ? initialSpells : template.spells
  };

  const handleConfirmCreate = async (opts: { acceptPremise?: boolean } = {}) => {
    if (!selectedCategoryModal) return;
    if (anyBusy) return;

    const errors = validateSetup();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const gen = genRef.current;
    setBusy('create', true);
    setAvatarError(null);
    setChapterOneFailure(null);
    setFormNote(null);

    const premise = openingPrompt.trim().slice(0, FIELD_LIMITS.premise);

    const fullChar: CharacterSheet = {
      id: `char_${uid()}`,
      name: charName.trim().slice(0, FIELD_LIMITS.heroName),
      gender: resolvedPronouns().slice(0, FIELD_LIMITS.pronouns),
      roleClass: charRole.trim().slice(0, FIELD_LIMITS.roleClass),
      raceOrigin: charRace.trim().slice(0, FIELD_LIMITS.raceOrigin),
      level: 1,
      hp: heroPreview.maxHp,
      maxHp: heroPreview.maxHp,
      armorClass: heroPreview.armorClass,
      initiativeBonus: abilityMod(heroPreview.stats.dex),
      stats: heroPreview.stats,
      inventory: initialInventory.length > 0 ? initialInventory : (selectedCategoryModal.defaultCharacter.inventory || []),
      spells: heroPreview.spells,
      ...(rulesMode === 'full5e' ? { xp: 0, gold: 10 } : {}),
      statusEffects: initialConditions.length > 0 ? initialConditions : ['Well-Rested'],
      // The canonical hero's backstory does not belong to a generated hero (PS16).
      backgroundNotes: '',
      avatarUrl: charAvatarUrl || selectedCategoryModal.defaultCharacter.avatarUrl,
      physicalDescription: physicalDesc.trim().slice(0, FIELD_LIMITS.description)
    };

    try {
      let chapterOneText: string | undefined = undefined;
      let chapterOneModel: string | undefined = undefined;
      let finalSuggestedActions = suggestedActions;

      if (hasActiveGeminiKey() && !opts.acceptPremise) {
        // Write Chapter 1 with AI; the outline is used when the AI scenario provided one
        const chapterOneRes = await generateChapterOneAI({
          category: selectedCategoryModal.id,
          storyBlurb: premise,
          storyOutline: currentStoryOutline,
          characterState: fullChar,
          model: selectedModel,
          inspiration
        });
        if (!isCurrent(gen)) return;
        if (chapterOneRes.failure) {
          // Never start the campaign on a silent stand-in: the player retries or accepts the premise.
          setChapterOneFailure(chapterOneRes.failure);
          return;
        }
        chapterOneText = chapterOneRes.text;
        chapterOneModel = chapterOneRes.modelUsed;
        if (chapterOneRes.suggestedActions) {
          finalSuggestedActions = chapterOneRes.suggestedActions;
        }
      } else {
        chapterOneModel = OFFLINE_ENGINE_LABEL;
      }

      await onCreateExperience(
        selectedCategoryModal.id,
        customTitle.trim().slice(0, FIELD_LIMITS.title) || `${selectedCategoryModal.name} Experience`,
        fullChar,
        premise,
        finalSuggestedActions,
        currentStoryOutline,
        chapterOneText,
        chapterOneModel,
        inspiration,
        rulesMode
      );
      closeModal();
    } catch (err: any) {
      console.error('Error creating experience:', err);
      setFormNote(`The campaign could not be created: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy('create', false);
    }
  };

  const filteredCategories = CATEGORIES_DATA.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tagline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeSeed = selectedCategoryModal
    ? (dynamicSeeds[selectedCategoryModal.id] || { prompts: getContent(selectedCategoryModal.id).tropes.map((t) => t.premise) })
    : null;
  const openerTotal = selectedCategoryModal ? getContent(selectedCategoryModal.id).openers.length : 0;

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#0F0F12] text-slate-200 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <ModeSwitch />

        {/* Banner Section */}
        <div className="relative overflow-hidden rounded-lg bg-[#16161D] border border-white/10 p-5 sm:p-8 shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-amber-400 text-[10px] uppercase tracking-widest font-mono font-bold">
              <Dice5 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              ZEROROLL • D&D 5E ADJUDICATOR
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
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-3">
              Available Campaign Archetypes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {filteredCategories.map((cat) => {
                return (
                  <div
                    key={cat.id}
                    className="group relative rounded-lg bg-[#111118] border border-white/5 hover:border-amber-600/50 transition-all duration-200 p-4 flex flex-col justify-between hover:bg-white/5 cursor-pointer space-y-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    {...clickable(() => handleOpenCategoryModal(cat))}
                  >
                    <div className="relative z-10 space-y-2">
                      <div className="flex items-center justify-between">
                        <div 
                          className="p-2 rounded bg-white/5 border border-white/10 transition group-hover:scale-105"
                          style={{ color: cat.accentColor }}
                        >
                          {getCategoryIcon(cat.iconName)}
                        </div>
                        <span className="text-[9px] font-mono tracking-widest font-bold uppercase px-1.5 py-0.5 rounded bg-black/40 text-slate-400 border border-white/5">
                          {getContent(cat.id).openers.length} openers
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
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                Active Cloud Sessions
              </h2>
              <Suspense fallback={null}>
                <Suspense fallback={null}>
                <BackupPanel compact />
              </Suspense>
              </Suspense>
            </div>
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
                            {campaignTitle(exp.title)}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                            {exp.description || 'Active campaign session.'}
                          </p>
                        </div>

                        {/* Character Snippet */}
                        <div className="p-2.5 rounded bg-[#0A0A0F] border border-white/5 text-xs flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Portrait value={exp.character?.avatarUrl} name={exp.character?.name || 'Hero'} className="w-7 h-7 rounded border border-amber-600/40 text-xs" />
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
                          onClick={() => { if (window.confirm(`Delete "${exp.title}" for good? This removes it from this device and the cloud.`)) onDeleteExperience(exp.id); }}
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
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto" {...setupDialog.overlayProps}>
            <div className="bg-[#111118] border border-white/10 rounded-t-2xl sm:rounded-xl max-w-2xl w-full p-4 pb-0 sm:p-6 sm:pb-0 space-y-4 sm:space-y-5 shadow-2xl overflow-y-auto max-h-[92dvh] sm:max-h-[88vh] text-slate-200" {...setupDialog.dialogProps}>
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div 
                    className="p-2 sm:p-2.5 rounded-lg bg-white/5 border border-white/10 shrink-0"
                    style={{ color: selectedCategoryModal.accentColor }}
                  >
                    {getCategoryIcon(selectedCategoryModal.iconName)}
                  </div>
                  <div>
                    <h2 id="setup-title" className="text-base sm:text-lg font-bold text-amber-50 font-serif leading-tight">
                      Initialize {selectedCategoryModal.name} Campaign
                    </h2>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">{selectedCategoryModal.tagline}</p>
                  </div>
                </div>
                <button
                  onClick={requestCloseModal}
                  className="text-slate-400 hover:text-slate-100 p-1 rounded bg-white/5 text-xs font-mono"
                  title="Close"
                >
                  ✕
                </button>
              </div>

              {/* Subtabs: Configure vs Seedlist Brainstorming */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                <div className="grid grid-cols-2 sm:flex items-center gap-1.5">
                  <button
                    onClick={() => setModalTab('configure')}
                    className={`px-2.5 sm:px-3 py-1.5 text-xs rounded-md font-semibold transition text-center ${
                      modalTab === 'configure'
                        ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    5-Field Setup
                  </button>
                  <button
                    onClick={() => setModalTab('seedlist')}
                    className={`px-2.5 sm:px-3 py-1.5 text-xs rounded-md font-semibold transition flex items-center justify-center gap-1.5 text-center ${
                      modalTab === 'seedlist'
                        ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Lightbulb className="w-3 h-3 text-amber-400" />
                    <span>Story Seeds</span>
                  </button>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={isBusy('scenario') || isBusy('hook') || isBusy('create')}
                    onClick={() => handleGenerateScenario(selectedCategoryModal, 'all')}
                    className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-[11px] font-mono text-amber-300 flex items-center justify-center gap-1.5 transition disabled:opacity-50 font-semibold"
                    title="Generate with AI"
                  >
                    <RefreshCw className={`w-3 h-3 ${isBusy('scenario') ? 'animate-spin' : ''}`} />
                    AI Re-roll All Fields
                  </button>
                </div>
              </div>

              {modalTab === 'configure' ? (
                <div className="space-y-4">
                  {setupSource === 'offline' && hasActiveGeminiKey() && (
                    <p className="text-[11px] text-sky-200/90 bg-sky-950/40 border border-sky-800/40 rounded-lg px-3 py-2 leading-relaxed">
                      These fields are an offline draft from the built-in generator. Use <span className="font-semibold">AI Re-roll All Fields</span> to have the AI write the setup and story outline.
                    </p>
                  )}
                  {/* Field 1: Campaign Title */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                        1. Experience Title
                      </label>
                      <button
                        type="button"
                        disabled={isBusy('field:title') || isBusy('scenario') || isBusy('create')}
                        onClick={() => handleRandomizeTitle(selectedCategoryModal)}
                        className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono disabled:opacity-50"
                        title="Roll random title"
                      >
                        <RefreshCw className={`w-3 h-3 ${isBusy('field:title') ? 'animate-spin' : ''}`} />
                        Roll Title
                      </button>
                    </div>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => { setCustomTitle(e.target.value); markEdited('Title'); }}
                        maxLength={FIELD_LIMITS.title}
                      className="w-full bg-[#0A0A0F] border border-white/10 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-600/50"
                      placeholder="e.g. Chronicles of the Blood Moon"
                    />
                  </div>

                  {/* Hero Gender & Pronouns Selector */}
                  <div className="p-2.5 rounded-lg bg-[#0A0A0F] border border-white/5 space-y-1.5">
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                      Hero Gender & Pronouns (Used for Story Generation)
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { id: 'she/her', label: '👩 She / Her' },
                        { id: 'he/him', label: '👨 He / Him' },
                        { id: 'they/them', label: '🧑 They / Them' },
                        { id: 'custom', label: '✏️ Custom...' }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setCharGender(opt.id as any)}
                          className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition border ${
                            charGender === opt.id
                              ? 'bg-amber-600/30 text-amber-300 border-amber-500 font-bold'
                              : 'bg-[#111118] text-slate-400 border-white/10 hover:text-slate-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                      {charGender === 'custom' && (
                        <input
                          type="text"
                          value={customGender}
                          onChange={(e) => setCustomGender(e.target.value)}
                          maxLength={FIELD_LIMITS.pronouns}
                          placeholder="e.g. she/they, ze/zir, non-binary"
                          className="flex-1 min-w-[140px] bg-[#111118] border border-amber-500/50 rounded px-2.5 py-1 text-xs text-amber-200 focus:outline-none font-mono"
                        />
                      )}
                    </div>
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
                          disabled={isBusy('field:heroName') || isBusy('scenario') || isBusy('create')}
                          onClick={() => handleRandomizeHeroName(selectedCategoryModal)}
                          className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono disabled:opacity-50"
                          title="Roll random hero name"
                        >
                          <RefreshCw className={`w-2.5 h-2.5 ${isBusy('field:heroName') ? 'animate-spin' : ''}`} />
                          Roll Name
                        </button>
                      </div>
                      <input
                        type="text"
                        value={charName}
                        onChange={(e) => { setCharName(e.target.value); markEdited('Name'); }}
                        maxLength={FIELD_LIMITS.heroName}
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
                          disabled={isBusy('field:roleClass') || isBusy('scenario') || isBusy('create')}
                          onClick={() => handleRandomizeRole(selectedCategoryModal)}
                          className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono disabled:opacity-50"
                          title="Roll random class role"
                        >
                          <RefreshCw className={`w-2.5 h-2.5 ${isBusy('field:roleClass') ? 'animate-spin' : ''}`} />
                          Roll Role
                        </button>
                      </div>
                      <input
                        type="text"
                        value={charRole}
                        onChange={(e) => { setCharRole(e.target.value); markEdited('Role'); }}
                        maxLength={FIELD_LIMITS.roleClass}
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
                          disabled={isBusy('field:raceOrigin') || isBusy('scenario') || isBusy('create')}
                          onClick={() => handleRandomizeRace(selectedCategoryModal)}
                          className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono disabled:opacity-50"
                          title="Roll random race origin"
                        >
                          <RefreshCw className={`w-2.5 h-2.5 ${isBusy('field:raceOrigin') ? 'animate-spin' : ''}`} />
                          Roll Race
                        </button>
                      </div>
                      <input
                        type="text"
                        value={charRace}
                        onChange={(e) => { setCharRace(e.target.value); markEdited('Origin'); }}
                        maxLength={FIELD_LIMITS.raceOrigin}
                        className="w-full bg-[#0A0A0F] border border-white/10 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-600/50 font-medium"
                      />
                    </div>
                  </div>

                  {/* Dramatic Cartoon Avatar & Physical Traits */}
                  <div className="p-3 rounded-lg bg-[#0A0A0F] border border-amber-500/20 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-amber-400 font-bold flex items-center gap-1.5 font-mono">
                        <Camera className="w-3.5 h-3.5" />
                        Dramatic Cartoon Character Portrait
                      </label>
                      <button
                        type="button"
                        disabled={isBusy('portrait') || isBusy('create')}
                        onClick={() => handleRenderPortrait(selectedCategoryModal)}
                        className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${isBusy('portrait') ? 'animate-spin' : ''}`} />
                        Re-render Portrait
                      </button>
                    </div>

                    <div className="flex items-start gap-3">
                      <Portrait value={charAvatarUrl} name={charName || 'Hero'} loading={isBusy('portrait')} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-amber-500/60 shadow-lg shrink-0 text-2xl" />

                      <div className="flex-1 min-w-0">
                        <textarea
                          rows={2}
                          value={physicalDesc}
                          onChange={(e) => { setPhysicalDesc(e.target.value); markEdited('Description'); }}
                          maxLength={FIELD_LIMITS.description}
                          placeholder="e.g. Simple hotel staff attire with impeccable regal posture, piercing sapphire eyes, carrying an antique heirloom ring..."
                          className="w-full bg-[#111118] border border-white/10 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-600/50 resize-none font-sans"
                        />
                        <p className="text-[10px] text-slate-400 mt-1 italic">
                          Stylized dramatic cartoonized graphic novel profile picture.
                        </p>
                        {avatarError && (
                          <p className="text-[10px] text-red-400 font-mono mt-1">{avatarError}</p>
                        )}
                        {portraitsOff && (
                          <button
                            type="button"
                            className="mt-1 text-[10px] underline text-amber-300"
                            onClick={() => {
                              setFreePortraitsAllowed(true);
                              setPortraitsOff(false);
                              setAvatarError(null);
                              void handleRenderPortrait(selectedCategoryModal);
                            }}
                          >
                            Allow free portraits from pollinations.ai (sends only the appearance text) and draw one
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Field 5: Story Prompt (Back-of-the-book Blurb) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                        5. Story Prompt (Back-of-the-book Blurb)
                      </label>
                      <button
                        type="button"
                        disabled={isBusy('hook') || isBusy('scenario') || isBusy('create')}
                        onClick={() => handleRandomizeHook(selectedCategoryModal)}
                        className="text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 disabled:opacity-50"
                        title="Write a new premise for this hero (keeps name, role, origin and gear)"
                      >
                        <RefreshCw className={`w-3 h-3 ${isBusy('hook') ? 'animate-spin' : ''}`} />
                        Roll Hook
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={openingPrompt}
                      onChange={(e) => { setOpeningPrompt(e.target.value); setPremiseSource('player'); markEdited('Premise'); }}
                      maxLength={FIELD_LIMITS.premise}
                      disabled={isBusy('hook') || isBusy('scenario')}
                      className="w-full bg-[#0A0A0F] border border-white/10 rounded p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-600/50 leading-relaxed resize-none disabled:opacity-60 font-sans"
                    />
                    
                    {/* Hero sheet preview: what Initialize will create (PS9) */}
                    <div className="mt-2.5 p-2 rounded bg-black/40 border border-white/5 space-y-1.5 text-xs">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold flex items-center justify-between">
                        <span>Hero sheet for a {charRole || 'hero'}</span>
                        <span className="text-amber-400 font-bold">HP {heroPreview.maxHp}{rulesMode === 'full5e' ? ` · AC ${heroPreview.armorClass}` : ''}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 font-mono text-[10px] text-slate-300">
                        {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map((k) => (
                          <span key={k} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">{k.toUpperCase()} {heroPreview.stats[k]} ({fmtMod(abilityMod(heroPreview.stats[k]))})</span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {initialInventory.map((item, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300">
                            {item.name}
                          </span>
                        ))}
                        {heroPreview.spells.map((sp, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/40 text-[10px] font-mono text-blue-300">
                            ⚡ {sp}
                          </span>
                        ))}
                      </div>
                      <fieldset className="pt-1 space-y-1">
                        <legend className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold">Rules</legend>
                        <div className="flex flex-wrap gap-2">
                          {(Object.keys(RULES_MODES) as RulesMode[]).map((m) => (
                            <label key={m} className={`flex items-start gap-1.5 rounded border px-2 py-1 cursor-pointer ${rulesMode === m ? 'border-amber-500/70 bg-amber-500/10' : 'border-white/10'}`}>
                              <input type="radio" name="rules-mode" value={m} checked={rulesMode === m} onChange={() => setRulesMode(m)} className="mt-0.5 accent-amber-500" />
                              <span>
                                <span className="block text-[11px] font-semibold text-slate-200">{RULES_MODES[m].name}</span>
                                <span className="block text-[10px] text-slate-400">{RULES_MODES[m].blurb}</span>
                              </span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    </div>
                  </div>
                </div>
              ) : (
                /* Story Seeds tab: tropes and ready-to-play openers */
                <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded bg-amber-950/20 border border-amber-600/30 text-xs text-amber-200">
                    <div className="space-y-0.5">
                      <div className="font-bold flex items-center gap-1.5 text-amber-300">
                        <Lightbulb className="w-3.5 h-3.5" />
                        Inspiration Source: {selectedCategoryModal.name} Media & Tropes
                      </div>
                      <p className="text-[11px] text-amber-200/80">
                        Story seeds set your premise; an opener fills in the whole setup. {openerTotal} opener{openerTotal === 1 ? '' : 's'} in this category.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isRegeneratingSeedlist}
                      onClick={() => handleRegenerateSeedlist(selectedCategoryModal)}
                      className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-black font-bold text-[10px] font-mono flex items-center gap-1 shrink-0 transition disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isRegeneratingSeedlist ? 'animate-spin' : ''}`} />
                      Regenerate AI Tropes
                    </button>
                  </div>

                  {/* 1. SEED PROMPTS */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Story seeds
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">Click to set premise</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {(activeSeed?.prompts || []).map((prompt: string, idx: number) => (
                        <div 
                          key={idx} 
                          className="text-[11px] px-3 py-2 rounded bg-black/40 border border-white/5 text-slate-300 font-mono cursor-pointer hover:border-amber-400/50 hover:text-amber-300 hover:bg-amber-500/10 transition focus:outline-none focus:ring-2 focus:ring-amber-500"
                          {...clickable(() => handleApplyTrope({ name: `Prompt ${idx + 1}`, premise: prompt }))}
                        >
                          {prompt}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. UNIFIED PLAYABLE SCENARIO SEEDS (5 from 100-Pool) */}
                  <div className="pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="space-y-0.5">
                        <h4 className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                          <Dices className="w-3.5 h-3.5" />
                          Ready-to-play openers
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          A hero, a premise, three first moves and starting gear.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => showOpeners(selectedCategoryModal.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-mono font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                        title="Show openers you have not seen yet"
                      >
                        <Dices className="w-3.5 h-3.5" />
                        <span>Show others</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {currentScenarioSeeds.map(({ opener: seed, padded }, idx) => (
                        <div
                          key={seed.id || idx}
                          {...clickable(() => handleApplyPlayableSeed(seed, selectedCategoryModal))}
                          className="p-3.5 rounded-lg bg-black/40 border border-white/5 hover:border-amber-500/50 hover:bg-white/5 cursor-pointer transition text-xs space-y-2 group focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-amber-300 font-bold font-serif text-sm group-hover:text-amber-200 transition">
                                {seed.title}
                              </div>
                              <div className="text-amber-200/70 text-[11px] italic mt-0.5">
                                "{seed.tagline}"
                              </div>
                              {padded && (
                                <div className="text-[10px] font-mono text-slate-500 mt-0.5">Quick start from the built-in generator</div>
                              )}
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 shrink-0">
                              {seed.hero.name} • {seed.hero.role}
                            </span>
                          </div>

                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {seed.premise}
                          </p>

                          {seed.actions.length > 0 && (
                            <div className="text-[10px] text-slate-400 flex flex-wrap gap-1.5 pt-1">
                              {seed.actions.map((act, aIdx) => (
                                <span key={aIdx} className="bg-white/5 px-2 py-0.5 rounded text-slate-300">
                                  ▸ {act}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* Actions Footer (Sticky on Mobile) */}
              <div className="sticky bottom-0 bg-[#111118]/95 backdrop-blur-md pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-6 border-t border-white/10 flex flex-wrap items-center justify-end gap-2 -mx-4 sm:-mx-6 px-4 sm:px-6 z-10">
                {chapterOneFailure && (
                  <div role="alert" className="w-full p-2.5 rounded bg-red-950/70 border border-red-700/50 text-[11px] text-red-100 space-y-2">
                    <p>
                      <span className="font-bold">Chapter One couldn't be written.</span> {chapterOneFailure}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleConfirmCreate()}
                        disabled={anyBusy}
                        className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-black font-bold text-[10px] font-mono uppercase tracking-wider"
                      >
                        Try again
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConfirmCreate({ acceptPremise: true })}
                        disabled={anyBusy}
                        className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 text-[10px] font-mono uppercase tracking-wider"
                      >
                        Start with the premise instead
                      </button>
                    </div>
                  </div>
                )}
                {(formNote || Object.keys(formErrors).length > 0) && (
                  <div role="alert" className="w-full p-2 rounded bg-red-950/60 border border-red-700/40 text-[11px] text-red-100 space-y-0.5">
                    {formNote && <p>{formNote}</p>}
                    {Object.values(formErrors).map((msg) => <p key={msg}>{msg}</p>)}
                  </div>
                )}
                <button
                  onClick={requestCloseModal}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirmCreate()}
                  disabled={anyBusy}
                  title={anyBusy ? 'Waiting for rolls to finish' : 'Initialize campaign'}
                  className="disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition flex items-center gap-2 shadow-lg hover:shadow-amber-500/20"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>{isBusy('create') ? 'Writing Chapter One…' : 'Initialize Campaign'}</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

