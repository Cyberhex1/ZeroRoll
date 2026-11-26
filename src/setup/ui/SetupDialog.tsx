/**
 * The launch setup menu: "Initialize <Category> Campaign".
 *
 * Three cards, top to bottom: Story, Hero, Hero sheet. The story is the one independent roll
 * (Reroll Story); everything else is built to fit it. Opening the menu rolls a story when the AI
 * is ready (ohnna, 2026-11-21). One AI call runs at a time, and closing the menu or starting
 * another roll cancels the one in flight. A failed call changes nothing and says so.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Lightbulb, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useDialog } from '../../components/ui/useDialog';
import { PortraitsOffError, setFreePortraitsAllowed } from '../../lib/portraits';
import {
  OFFLINE_ENGINE_LABEL,
  generateAvatarAI,
  generateChapterOneAI,
  getActiveProvider,
  getUsableGeminiModels,
  hasActiveGeminiKey
} from '../../lib/geminiService';
import { drawOpeners, getContent, markOpenersSeen, pickInspiration, Opener, OpenerDraw } from '../../content';
import type { CampaignInspiration, CategoryInfo, CharacterSheet, DMStoryOutline, ExperienceCategory } from '../../types';
import { RulesMode, rulesModeFor } from '../../dnd/rules';
import {
  REPLACES,
  applyClass,
  applyHeroPart,
  applyPackage,
  applyStoryEdit,
  choosePronouns,
  draftFromOpener,
  editSheet,
  inspirationWithSeed,
  keepAsIs,
  offlinePart,
  randomOpener,
  resetSheet,
  resolvePronouns,
  toCharacterSheet,
  typeHeroField,
  typedAmong,
  validateDraft
} from '../draft';
import { HeroPart, RolledStory, rollHeroPart, rollStory } from '../storyRoll';
import { pickShape, shapeById } from '../storyShape';
import type { PronounChoice, SetupDraft, TypedField } from '../types';
import { StoryCard } from './StoryCard';
import { HeroCard, PronounPicker } from './HeroCard';
import { HeroSheetCard } from './HeroSheetCard';
import { SeedsPanel } from './SeedsPanel';

export type CreateExperience = (
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

interface Props {
  category: CategoryInfo;
  selectedModel: string;
  onClose: () => void;
  onCreate: CreateExperience;
  /** Opens the AI settings (key, Test Connection). The menu closes first. */
  onOpenAISettings?: () => void;
  icon: React.ReactNode;
}

type Busy = 'story' | 'adapt' | 'opener' | HeroPart | 'portrait' | 'create';
type AIState = 'ready' | 'off' | 'untested';
interface FormError {
  text: string;
  retry?: () => void;
  retryAt?: number;
}

const PRONOUN_KEY = 'zeroroll_setup_pronouns';

function readPronouns(): { choice: PronounChoice; custom: string } {
  try {
    const v = JSON.parse(localStorage.getItem(PRONOUN_KEY) || 'null');
    if (v && ['any', 'she/her', 'he/him', 'they/them', 'custom'].includes(v.choice)) return { choice: v.choice, custom: typeof v.custom === 'string' ? v.custom : '' };
  } catch (_) {}
  return { choice: 'any', custom: '' };
}

/** Whether AI calls can run: off (no key or Offline mode), untested (no model passed a probe), or ready. */
function readAIState(): AIState {
  if (!hasActiveGeminiKey()) return 'off';
  if (getActiveProvider() === 'gemini' && getUsableGeminiModels() === null) return 'untested';
  return 'ready';
}

const BUSY_TEXT: Partial<Record<Busy, string>> = {
  story: 'Writing your story…',
  adapt: 'Rebuilding your hero to fit your story…',
  opener: 'Building the story around this opener…',
  create: 'Writing Chapter One…'
};

export function SetupDialog({ category, selectedModel, onClose, onCreate, onOpenAISettings, icon }: Props) {
  const catId = category.id as ExperienceCategory;
  const [aiState, setAIState] = useState<AIState>(readAIState);
  const aiOn = aiState !== 'off';
  const [pronounChoice, setPronounChoice] = useState<PronounChoice>(() => readPronouns().choice);
  const [customPronouns, setCustomPronouns] = useState(() => readPronouns().custom);
  const pronouns = resolvePronouns(pronounChoice, customPronouns);
  // The category sets the rules: full 5e for D&D, narrative dice everywhere else.
  const rulesMode: RulesMode = rulesModeFor(catId);
  const [draft, setDraft] = useState<SetupDraft | null>(null);
  const [busy, setBusy] = useState<Busy | null>(null);
  const [error, setError] = useState<FormError | null>(null);
  const [chapterOneFailure, setChapterOneFailure] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<'setup' | 'seeds'>('setup');
  const [storyEditing, setStoryEditing] = useState(false);
  const [touched, setTouched] = useState(false);
  const [openers, setOpeners] = useState<OpenerDraw[]>([]);
  const [seeds] = useState<string[]>(() => getContent(catId).tropes.map((t) => t.premise));
  const [portraitError, setPortraitError] = useState<string | null>(null);
  const [portraitsOff, setPortraitsOff] = useState(false);
  const [, setTick] = useState(0);

  const draftRef = useRef(draft);
  draftRef.current = draft;
  const pronounsRef = useRef(pronouns);
  pronounsRef.current = pronouns;
  const pronounsChosenRef = useRef(pronounChoice !== 'any');
  pronounsChosenRef.current = pronounChoice !== 'any';
  const ctrlRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const locked = busy !== null;
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const savePronouns = (choice: PronounChoice, custom: string) => {
    try {
      localStorage.setItem(PRONOUN_KEY, JSON.stringify({ choice, custom }));
    } catch (_) {}
  };

  /** Runs one AI call: cancels any other, locks the screen, and reports a failure on the form. */
  const run = useCallback(
    async <T,>(kind: Busy, call: (signal: AbortSignal) => Promise<T>, onOk: (value: T) => void, opts: { retry?: () => void; onError?: (text: string) => void } = {}): Promise<boolean | undefined> => {
      ctrlRef.current?.abort();
      const ctrl = new AbortController();
      ctrlRef.current = ctrl;
      setBusy(kind);
      setError(null);
      setChapterOneFailure(null);
      try {
        const value = await call(ctrl.signal);
        if (ctrl.signal.aborted || !mountedRef.current) return undefined;
        onOk(value);
        return true;
      } catch (err) {
        const e = err as Error & { retryAfterMs?: number; cancelled?: boolean };
        if (e.cancelled || ctrl.signal.aborted || !mountedRef.current) return undefined;
        const text = e.message || String(err);
        if (opts.onError) opts.onError(text);
        else setError({ text, retry: opts.retry, retryAt: e.retryAfterMs ? Date.now() + e.retryAfterMs : undefined });
        return false;
      } finally {
        if (ctrlRef.current === ctrl) {
          ctrlRef.current = null;
          if (mountedRef.current) setBusy(null);
        }
      }
    },
    []
  );

  const openerDraft = useCallback(() => {
    const o = randomOpener(catId, draftRef.current?.inspiration.openerId);
    return o ? draftFromOpener(catId, o, pronounsRef.current) : null;
  }, [catId]);

  /** A new story from scratch, or from a story seed the player picked. */
  const rollFresh = useCallback(
    async (seed?: string) => {
      const inspiration = seed ? inspirationWithSeed(catId, seed) : pickInspiration(catId);
      // Where the player joins the story; a reroll never repeats the last one.
      const shape = pickShape(shapeById(draftRef.current?.outline?.storyShape)?.id);
      const ok = await run(
        'story',
        (signal) => rollStory({ category: catId, pronouns: pronounsRef.current, pronounsChosen: pronounsChosenRef.current, rulesMode, inspiration, mode: 'fresh', seed, shape, signal }),
        (pkg: RolledStory) => {
          setDraft((prev) => applyPackage(prev, pkg, { category: catId, inspiration, source: 'ai', seed }));
        },
        { retry: () => void rollFresh(seed) }
      );
      if (ok === false && !draftRef.current) {
        // The first roll failed: show a hand-written opener, and say so next to the error.
        setDraft(openerDraft());
        setError((prev) => (prev ? { ...prev, text: `${prev.text} A hand-written opener is shown until a story roll works.` } : prev));
      }
    },
    [catId, rulesMode, run, openerDraft]
  );

  // Opening the menu waits for the player to pick pronouns and roll (ohnna, 2026-11-26); with the
  // AI off, a hand-written opener is shown instead.
  useEffect(() => {
    mountedRef.current = true;
    if (readAIState() === 'off') setDraft(openerDraft());
    return () => {
      mountedRef.current = false;
      ctrlRef.current?.abort();
    };
    // Once per opening of the menu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tick once a second while a Retry is waiting out a rate limit.
  useEffect(() => {
    if (!error?.retryAt || error.retryAt <= Date.now()) return;
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [error]);

  // Openers are drawn (and counted as seen) only when the Story seeds tab shows them.
  const showOpeners = useCallback(() => {
    const draw = drawOpeners(catId, 5);
    setOpeners(draw);
    markOpenersSeen(catId, draw.filter((d) => !d.padded).map((d) => d.opener.id));
  }, [catId]);
  useEffect(() => {
    if (tab === 'seeds' && openers.length === 0) showOpeners();
  }, [tab, openers.length, showOpeners]);

  useEffect(() => {
    scrollRef.current?.scrollTo?.({ top: 0 });
  }, [tab]);

  /** Asks before replacing what the player typed. */
  const confirmLoss = (fields: readonly TypedField[], keep: readonly TypedField[] = []) => {
    const d = draftRef.current;
    if (!d) return true;
    const lost = typedAmong(d, fields, keep);
    return lost.length === 0 || window.confirm(`This replaces what you set yourself: ${lost.join(', ')}. Continue?`);
  };

  const rerollStory = () => {
    if (!confirmLoss(REPLACES.story)) return;
    setTouched(true);
    setFormErrors({});
    if (!aiOn) {
      setDraft(openerDraft());
      return;
    }
    // Rolling is the player's choice to go ahead without a connection test.
    if (aiState === 'untested') setAIState('ready');
    void rollFresh();
  };

  /** Rebuilds what depends on the story around the player's own words. */
  const rebuild = (d: SetupDraft | null = draftRef.current) => {
    if (!d) return;
    const keepTitle = d.typed.includes('title');
    void run(
      'adapt',
      (signal) =>
        rollStory({
          category: catId,
          pronouns: pronounsRef.current,
          pronounsChosen: pronounsChosenRef.current,
          rulesMode,
          inspiration: d.inspiration,
          mode: 'adapt',
          fixed: { premise: d.premise, name: d.hero.name, ...(keepTitle ? { title: d.title } : {}) },
          signal
        }),
      (pkg) => setDraft((prev) => (prev ? applyPackage(prev, pkg, { category: catId, inspiration: prev.inspiration, source: 'player', keepName: true, keepTitle }) : prev)),
      { retry: () => rebuild() }
    );
  };

  const saveStory = (edit: { title: string; premise: string }) => {
    const d = draftRef.current;
    if (!d) return;
    const next = applyStoryEdit(d, edit);
    setDraft(next);
    setTouched(true);
    if (next.stale && aiOn) rebuild(next);
  };

  const rollPart = (part: HeroPart) => {
    const d = draftRef.current;
    if (!d) return;
    // The field's own value is what the button replaces; only ask about what goes with it.
    const own: TypedField[] = part === 'roleClass' ? ['roleClass'] : part === 'origin' ? ['origin'] : [part];
    if (!confirmLoss(REPLACES[part], own)) return;
    setTouched(true);
    if (!aiOn) {
      setDraft(offlinePart(d, part, pronounsRef.current));
      return;
    }
    void run(
      part,
      (signal) =>
        rollHeroPart(part, {
          category: catId,
          pronouns: pronounsRef.current,
          rulesMode,
          title: d.title,
          premise: d.premise,
          hero: d.hero,
          signal
        }),
      (r) => setDraft((prev) => (!prev ? prev : part === 'roleClass' && r.roleClass && r.sheet ? applyClass(prev, r.roleClass, r.sheet) : applyHeroPart(prev, r))),
      { retry: () => rollPart(part) }
    );
  };

  const pickPronouns = (choice: PronounChoice) => {
    setPronounChoice(choice);
    savePronouns(choice, customPronouns);
    const next = resolvePronouns(choice, customPronouns);
    setDraft((prev) => (prev ? choosePronouns(prev, next) : prev));
  };
  const typeCustomPronouns = (text: string) => {
    setCustomPronouns(text);
    savePronouns('custom', text);
  };

  /** A hand-written opener, then (AI on) the story built out around it. */
  const buildOutOpener = (o: Opener, base: SetupDraft) => {
    void run(
      'opener',
      (signal) =>
        rollStory({
          category: catId,
          pronouns: pronounsRef.current,
          pronounsChosen: pronounsChosenRef.current,
          rulesMode,
          inspiration: base.inspiration,
          mode: 'opener',
          fixed: { title: o.title, premise: o.premise, name: base.hero.name, roleClass: o.hero.role, origin: o.hero.origin },
          shape: shapeById(o.shape),
          turningPoint: o.turningPoint,
          signal
        }),
      (pkg) => {
        // The opener's own hand-written gear and spells stay; the AI adds the outline, looks, scores and skills.
        const sheet = { ...pkg.sheet, gear: base.sheet.gear.length ? base.sheet.gear : pkg.sheet.gear, spells: o.spells.length ? base.sheet.spells : pkg.sheet.spells };
        setDraft(applyPackage(base, { ...pkg, sheet }, { category: catId, inspiration: base.inspiration, source: 'opener' }));
      },
      { retry: () => buildOutOpener(o, base) }
    );
  };

  const pickOpener = (o: Opener) => {
    if (locked || !confirmLoss(REPLACES.opener)) return;
    const base = draftFromOpener(catId, o, pronounsRef.current);
    setDraft(base);
    setTouched(true);
    setTab('setup');
    if (aiOn) buildOutOpener(o, base);
  };

  const pickSeed = (seed: string) => {
    if (locked) return;
    const d = draftRef.current;
    if (!aiOn) {
      if (!d) return;
      setDraft(applyStoryEdit(d, { title: d.title, premise: seed }));
      setTouched(true);
      setTab('setup');
      return;
    }
    if (!confirmLoss(REPLACES.story)) return;
    setTouched(true);
    setTab('setup');
    void rollFresh(seed);
  };

  const drawPortrait = () => {
    const d = draftRef.current;
    if (!d) return;
    setPortraitError(null);
    void run(
      'portrait',
      async () => {
        try {
          return await generateAvatarAI({
            characterName: d.hero.name.trim() || 'Hero',
            roleClass: d.hero.roleClass.trim() || 'Adventurer',
            raceOrigin: d.hero.origin.trim() || 'Human',
            gender: pronounsRef.current,
            category: catId,
            physicalDescription: d.hero.appearance.trim(),
            model: selectedModel
          });
        } catch (err) {
          if (err instanceof PortraitsOffError) setPortraitsOff(true);
          throw err;
        }
      },
      (data) => data?.avatarUrl && setDraft((prev) => (prev ? { ...prev, portrait: data.avatarUrl } : prev)),
      { onError: (text) => setPortraitError(text) }
    );
  };

  const create = async (opts: { acceptPremise?: boolean } = {}) => {
    const d = draftRef.current;
    if (!d || locked || storyEditing || d.stale) return;
    const errors = validateDraft(d, pronounChoice, customPronouns);
    setFormErrors(errors);
    if (Object.keys(errors).length) {
      setTab('setup');
      return;
    }
    const character = toCharacterSheet(d, { pronouns, rulesMode, category });
    setBusy('create');
    setError(null);
    setChapterOneFailure(null);
    try {
      let chapterOneText: string | undefined;
      let chapterOneModel: string | undefined;
      let actions = d.actions;
      if (hasActiveGeminiKey() && !opts.acceptPremise) {
        const res = await generateChapterOneAI({
          category: catId,
          storyBlurb: d.premise,
          storyOutline: d.outline,
          characterState: character,
          model: selectedModel,
          inspiration: d.inspiration
        });
        if (!mountedRef.current) return;
        if (res.failure) {
          // Never start the campaign on a silent stand-in: the player retries or accepts the premise.
          setChapterOneFailure(res.failure);
          return;
        }
        chapterOneText = res.text;
        chapterOneModel = res.modelUsed;
        if (res.suggestedActions?.length) actions = res.suggestedActions;
      } else {
        chapterOneModel = OFFLINE_ENGINE_LABEL;
      }
      await onCreate(catId, d.title.trim() || `${category.name} Experience`, character, d.premise, actions, d.outline, chapterOneText, chapterOneModel, d.inspiration, rulesMode);
      onClose();
    } catch (err) {
      if (mountedRef.current) setError({ text: `The campaign could not be created: ${err instanceof Error ? err.message : String(err)}` });
    } finally {
      if (mountedRef.current) setBusy(null);
    }
  };

  const requestClose = () => {
    if (touched && !window.confirm('Discard this campaign setup? What you rolled and typed will be lost.')) return;
    onClose();
  };
  const dialog = useDialog(requestClose, { labelledBy: 'setup-title' });

  const openSettings = () => {
    if (!onOpenAISettings) return;
    if (touched && !window.confirm('Close the setup to open AI settings? What you rolled and typed will be lost.')) return;
    onClose();
    onOpenAISettings();
  };

  const rollAnyway = () => {
    setAIState('ready');
    void rollFresh();
  };

  const retryWait = error?.retryAt ? Math.max(0, Math.ceil((error.retryAt - Date.now()) / 1000)) : 0;
  const storyBusy = busy === 'story' || busy === 'adapt' || busy === 'opener';
  const initializeBlock = !draft
    ? 'Roll a story first'
    : storyEditing
      ? 'Save or cancel your story edit first'
      : draft.stale
        ? 'Rebuild your hero to fit your story, or keep it as is'
        : locked
          ? busy === 'portrait'
            ? 'Waiting for the portrait'
            : 'Waiting for the AI'
          : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto" {...dialog.overlayProps}>
      <div
        className="bg-[#111118] border border-white/10 rounded-t-2xl sm:rounded-xl max-w-2xl w-full p-4 pb-0 sm:p-6 sm:pb-0 space-y-4 shadow-2xl overflow-y-auto max-h-[92dvh] sm:max-h-[88vh] text-slate-200"
        {...dialog.dialogProps}
        ref={(el) => {
          (dialog.dialogProps.ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
          scrollRef.current = el;
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-lg bg-white/5 border border-white/10 shrink-0" style={{ color: category.accentColor }}>
              {icon}
            </div>
            <div>
              <h2 id="setup-title" className="text-base sm:text-lg font-bold text-amber-50 font-serif leading-tight">
                Initialize {category.name} Campaign
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">{category.tagline}</p>
            </div>
          </div>
          <button onClick={requestClose} className="text-slate-400 hover:text-slate-100 p-1 rounded bg-white/5 text-xs font-mono" title="Close" aria-label="Close">
            ✕
          </button>
        </div>

        {/* Tabs and Reroll Story */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
          <div className="grid grid-cols-2 sm:flex items-center gap-1.5" role="tablist" aria-label="Setup sections">
            {(
              [
                ['setup', 'Setup'],
                ['seeds', 'Story Seeds']
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`px-2.5 sm:px-3 py-1.5 text-xs rounded-md font-semibold transition flex items-center justify-center gap-1.5 ${
                  tab === id ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {id === 'seeds' && <Lightbulb className="w-3 h-3 text-amber-400" aria-hidden="true" />}
                {label}
              </button>
            ))}
          </div>
          {draft && (
          <button
            type="button"
            disabled={locked}
            onClick={rerollStory}
            className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-[11px] font-mono text-amber-300 flex items-center justify-center gap-1.5 transition disabled:opacity-50 font-semibold"
            title={aiOn ? 'A new story, with a hero and hero sheet to fit it' : 'The AI is off: picks another hand-written opener'}
          >
            <RefreshCw className={`w-3 h-3 ${busy === 'story' ? 'animate-spin' : ''}`} aria-hidden="true" />
            Reroll Story
          </button>
          )}
        </div>

        {/* AI status for this screen */}
        {aiState === 'off' && (
          <p className="text-[11px] text-sky-200/90 bg-sky-950/40 border border-sky-800/40 rounded-lg px-3 py-2 leading-relaxed">
            The AI is off (no key, or Offline mode), so this menu uses hand-written openers and built-in lists.
            {onOpenAISettings && (
              <>
                {' '}
                <button type="button" onClick={openSettings} className="underline text-sky-100">
                  Open AI settings
                </button>
              </>
            )}
          </p>
        )}
        {aiState === 'untested' && (
          <div className="text-[11px] text-sky-100 bg-sky-950/40 border border-sky-800/40 rounded-lg px-3 py-2 leading-relaxed space-y-1.5">
            <p>None of your AI models has passed a connection test yet. Test your key first so the game only uses models that answer.</p>
            <div className="flex flex-wrap gap-2">
              {onOpenAISettings && (
                <button type="button" onClick={openSettings} className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-black font-bold text-[10px] font-mono uppercase tracking-wider">
                  Open AI settings
                </button>
              )}
              <button type="button" onClick={rollAnyway} disabled={locked} className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 text-[10px] font-mono uppercase tracking-wider disabled:opacity-50">
                Roll a story anyway
              </button>
            </div>
          </div>
        )}

        {busy && BUSY_TEXT[busy] && (
          <p role="status" className="flex items-center gap-2 text-[11px] text-amber-200 bg-amber-950/30 border border-amber-700/40 rounded-lg px-3 py-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            {BUSY_TEXT[busy]}
          </p>
        )}

        {tab === 'setup' ? (
          !draft ? (
            <div className="space-y-3" aria-busy={storyBusy}>
              {/* Before the first roll only the pronouns and the roll are live (ohnna, 2026-11-26). */}
              <section className="rounded-lg bg-[#0A0A0F] border border-amber-500/30 p-3 sm:p-3.5 space-y-3">
                <PronounPicker
                  choice={pronounChoice}
                  custom={customPronouns}
                  onPick={pickPronouns}
                  onCustom={typeCustomPronouns}
                  locked={locked}
                  error={pronounChoice === 'custom' && !customPronouns.trim() ? 'Type the pronouns to use, or pick one of the options.' : undefined}
                />
                <p className="text-[11px] text-slate-400">Pick your hero's pronouns, then roll a story. With no preference, the hero gets a name that suits anyone.</p>
                <button
                  type="button"
                  onClick={rerollStory}
                  disabled={locked || (pronounChoice === 'custom' && !customPronouns.trim())}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${busy === 'story' ? 'animate-spin' : ''}`} aria-hidden="true" />
                  Roll story
                </button>
              </section>
              {['The story', 'Hero', 'Hero sheet'].map((label) => (
                <div key={label} aria-hidden="true" className={`rounded-lg bg-[#0A0A0F] border border-white/10 p-4 space-y-2 opacity-40 ${storyBusy ? 'animate-pulse' : ''}`}>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold font-mono">{label}</div>
                  <div className="h-3 w-3/4 rounded bg-white/10" />
                  <div className="h-3 w-full rounded bg-white/5" />
                </div>
              ))}
            </div>
          ) : (
            <div className={`space-y-3 transition-opacity ${storyBusy ? 'opacity-60' : ''}`} aria-busy={locked}>
              <StoryCard
                draft={draft}
                aiOn={aiOn}
                locked={locked}
                rollingTitle={busy === 'title'}
                onRollTitle={() => rollPart('title')}
                onSave={saveStory}
                onRebuild={() => rebuild()}
                onKeepAsIs={() => setDraft((prev) => (prev ? keepAsIs(prev) : prev))}
                onEditingChange={setStoryEditing}
              />
              {formErrors.premise && <p className="text-[10px] text-red-300">{formErrors.premise}</p>}
              <HeroCard
                draft={draft}
                pronounChoice={pronounChoice}
                customPronouns={customPronouns}
                onPronouns={pickPronouns}
                onCustomPronouns={typeCustomPronouns}
                onType={(field, value) => {
                  setTouched(true);
                  setDraft((prev) => (prev ? typeHeroField(prev, field, value) : prev));
                }}
                onRoll={rollPart}
                rolling={busy === 'name' || busy === 'roleClass' || busy === 'origin' || busy === 'title' ? busy : null}
                locked={locked}
                errors={formErrors}
                portrait={{
                  drawing: busy === 'portrait',
                  error: portraitError,
                  off: portraitsOff,
                  onDraw: drawPortrait,
                  onAllow: () => {
                    setFreePortraitsAllowed(true);
                    setPortraitsOff(false);
                    drawPortrait();
                  }
                }}
              />
              <HeroSheetCard
                draft={draft}
                rulesMode={rulesMode}
                onChange={(sheet) => {
                  setTouched(true);
                  setDraft((prev) => (prev ? editSheet(prev, sheet) : prev));
                }}
                onReset={() => setDraft((prev) => (prev ? resetSheet(prev) : prev))}
                locked={locked}
              />
            </div>
          )
        ) : (
          <SeedsPanel
            categoryName={category.name}
            seeds={seeds}
            openers={openers}
            openerTotal={getContent(catId).openers.length}
            aiOn={aiOn}
            locked={locked}
            onSeed={pickSeed}
            onOpener={pickOpener}
            onShowOthers={showOpeners}
          />
        )}

        {/* Footer (sticky on phones) */}
        <div className="sticky bottom-0 bg-[#111118]/95 backdrop-blur-md pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-6 border-t border-white/10 flex flex-wrap items-center justify-end gap-2 -mx-4 sm:-mx-6 px-4 sm:px-6 z-10">
          {chapterOneFailure && (
            <div role="alert" className="w-full p-2.5 rounded bg-red-950/70 border border-red-700/50 text-[11px] text-red-100 space-y-2">
              <p>
                <span className="font-bold">Chapter One couldn't be written.</span> {chapterOneFailure}
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => void create()} disabled={locked} className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-black font-bold text-[10px] font-mono uppercase tracking-wider">
                  Try again
                </button>
                <button
                  type="button"
                  onClick={() => void create({ acceptPremise: true })}
                  disabled={locked}
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 text-[10px] font-mono uppercase tracking-wider"
                >
                  Start with the premise instead
                </button>
              </div>
            </div>
          )}
          {error && (
            <div role="alert" className="w-full p-2 rounded bg-red-950/60 border border-red-700/40 text-[11px] text-red-100 flex flex-wrap items-center justify-between gap-2">
              <p className="flex-1 min-w-[12rem]">{error.text} Nothing on the sheet was changed.</p>
              {error.retry && (
                <button
                  type="button"
                  onClick={() => error.retry?.()}
                  disabled={locked || retryWait > 0}
                  className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-black font-bold text-[10px] font-mono uppercase tracking-wider disabled:opacity-50"
                >
                  {retryWait > 0 ? `Try again in ${retryWait}s` : 'Try again'}
                </button>
              )}
            </div>
          )}
          {Object.keys(formErrors).length > 0 && (
            <p role="alert" className="w-full text-[11px] text-red-200">
              {Object.values(formErrors).join(' ')}
            </p>
          )}
          <button onClick={requestClose} className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:bg-white/5 transition">
            Cancel
          </button>
          <button
            onClick={() => void create()}
            disabled={!!initializeBlock}
            title={initializeBlock ?? 'Write Chapter One and start'}
            className="disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition flex items-center gap-2 shadow-lg hover:shadow-amber-500/20"
          >
            {busy === 'create' ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Sparkles className="w-4 h-4 text-slate-950" aria-hidden="true" />}
            <span>{busy === 'create' ? 'Writing Chapter One…' : busy === 'portrait' ? 'Waiting for portrait…' : 'Initialize Campaign'}</span>
          </button>
          {initializeBlock && draft && !locked && <p className="w-full text-right text-[10px] text-slate-500">{initializeBlock}.</p>}
        </div>
      </div>
    </div>
  );
}
