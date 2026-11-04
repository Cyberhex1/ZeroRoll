import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { uid } from './lib/ids';
import { continueToNextBook } from './dnd/nextBook';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import { STORY_MODE_ENABLED } from './lib/platform';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  checkRedirectAuthResult,
  logoutUser,
  saveExperienceToCloud,
  subscribeToUserExperiences,
  deleteExperienceFromCloud,
  saveUserProfileToCloud,
  loadUserProfileFromCloud,
  saveUserSettingsToCloud,
  purgeCloudProviderKeys,
  saveActiveExperienceIdToCloud,
  isNewer,
  cloudSyncBlocked
} from './lib/firebase';
import {
  exportAllProviderSettings,
  importAllProviderSettings,
  purgeUnusableStoredKeys,
  getActiveProvider,
  setProviderModel,
  setActiveProvider,
  getProviderKey
} from './lib/geminiService';
import { resetAIStatus } from './lib/aiStatus';
import { watchKeyChanges } from './lib/keySync';
import { runWeeklyModelCheck } from './ai/weeklyModelCheck';
import { Navbar } from './components/Navbar';
import { AIStatusBanner } from './components/AIStatusBanner';
// Loaded on first use so the home screen downloads and starts faster.
const CategoriesGrid = lazy(() => import('./components/CategoriesGrid').then((m) => ({ default: m.CategoriesGrid })));
const ExperienceView = lazy(() => import('./components/ExperienceView').then((m) => ({ default: m.ExperienceView })));
const SettingsModal = lazy(() => import('./components/SettingsModal').then((m) => ({ default: m.SettingsModal })));
const UserProfileModal = lazy(() => import('./components/UserProfileModal').then((m) => ({ default: m.UserProfileModal })));
const AuthModal = lazy(() => import('./components/AuthModal').then((m) => ({ default: m.AuthModal })));
const StoryPicker = lazy(() => import('./story/ui/StoryPicker'));
const StoryPlay = lazy(() => import('./story/ui/StoryPlay'));
const storyFallback = <div className="min-h-[60vh] flex items-center justify-center text-xs font-mono text-slate-400">Opening Story mode...</div>;
const ApiKeyModal = lazy(() => import('./components/ApiKeyModal').then((m) => ({ default: m.ApiKeyModal })));
import MusicPlayer from './components/MusicPlayer';
import {
  Experience,
  ExperienceCategory,
  CharacterSheet,
  MapData,
  LogMessage,
  UserProfile,
  DMStoryOutline,
  CampaignInspiration
} from './types';
import { DEFAULT_GEMINI_MODEL, usableGeminiModelOptions } from './lib/modelsConfig';
import { CATEGORIES_DATA, getCategoryDefaultInventory, getCategoryFallbackActions, pickInspiration } from './content';
import { mergeInventoryAdditive, createVariedInitialMap } from './lib/experienceHelpers';
import { audioManager } from './audio/manager';

function safeGetStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (_) {
    return null;
  }
}

function safeSetStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (_) {}
}

// Guest profile default — used for unauthenticated state
const GUEST_PROFILE: UserProfile = {
  uid: 'guest',
  displayName: 'Adventurer',
  email: null,
  photoURL: null,
  avatar: {
    hairstyle: 'short_rogue',
    hairColor: '#f59e0b',
    skinTone: '#fde047',
    clothingColor: '#1e1b4b',
    badgeIcon: 'shield'
  }
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  // Bumped when Firebase reports "signed out", so the guest list loads again after that callback cleared it.
  const [signedOutEpoch, setSignedOutEpoch] = useState(0);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [activeExperience, setActiveExperience] = useState<Experience | null>(null);

  // pendingActiveExpId is resolved inside the subscription callback — NOT a dep of the subscription effect
  const pendingActiveExpId = useRef<string | null>(null);
  const authGeneration = useRef(0);

  // User Profile — intentionally NOT initialized from localStorage to avoid flashing
  // a stale/wrong account's cached profile before auth resolves.
  const [userProfile, setUserProfile] = useState<UserProfile>(GUEST_PROFILE);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Settings states — initialized from local cache (acceptable: these are preferences, not identity)
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    const saved = safeGetStorage('dnd_selected_model');
    const options = usableGeminiModelOptions();
    if (saved && options.some(m => m.id === saved)) {
      return saved;
    }
    // A saved pick that no longer answers falls back to the first model that does.
    const fallback = options.some(m => m.id === DEFAULT_GEMINI_MODEL) ? DEFAULT_GEMINI_MODEL : options[0]?.id || DEFAULT_GEMINI_MODEL;
    safeSetStorage('dnd_selected_model', fallback);
    return fallback;
  });

  const [customSystemPrompt, setCustomSystemPrompt] = useState<string>(() => {
    return safeGetStorage('dnd_system_prompt') || '';
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = safeGetStorage('dnd_sound_enabled');
    return saved !== 'false';
  });

  // Settings is a route (/settings) so it can be linked to and survives a reload.
  const location = useLocation();
  const navigate = useNavigate();
  const isSettingsOpen = location.pathname === '/settings';
  const setIsSettingsOpen = (open: boolean) => {
    if (open && !isSettingsOpen) navigate('/settings');
    else if (!open && isSettingsOpen) navigate('/');
  };
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Cloud save error — shown transiently in Navbar when a Firestore write fails
  const [cloudSaveError, setCloudSaveError] = useState<string | null>(null);
  const cloudSaveErrorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showCloudSaveError(msg: string) {
    setCloudSaveError(msg);
    if (cloudSaveErrorTimer.current) clearTimeout(cloudSaveErrorTimer.current);
    cloudSaveErrorTimer.current = setTimeout(() => setCloudSaveError(null), 5000);
  }

  // Older builds stored the Firebase web key as the Gemini key; it can never work.
  useEffect(() => {
    purgeUnusableStoredKeys();
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (cloudSaveErrorTimer.current) clearTimeout(cloudSaveErrorTimer.current);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Auth State — the authoritative source for user identity and cloud data
  // ---------------------------------------------------------------------------
  // Weekly latest-model check (Gemini). Runs after start-up so it never delays the first screen.
  useEffect(() => {
    const t = setTimeout(() => void runWeeklyModelCheck(), 5000);
    return () => clearTimeout(t);
  }, []);

  // Cloud saves need firestore.googleapis.com; an ad blocker that refuses it would otherwise fail silently.
  const [cloudBlocked, setCloudBlocked] = useState(false);
  useEffect(() => {
    if (!user || user.isAnonymous) return;
    let live = true;
    void cloudSyncBlocked().then((blocked) => live && setCloudBlocked(blocked));
    return () => {
      live = false;
    };
  }, [user]);

  // Opt-in key sync: re-encrypt and upload when a key changes (does nothing while sync is off).
  useEffect(() => {
    if (!user || user.isAnonymous) return;
    return watchKeyChanges(user.uid, showCloudSaveError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  useEffect(() => {
    // Process redirect sign-in if returning from Google redirect
    checkRedirectAuthResult();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const generation = ++authGeneration.current;
      if (currentUser) {
        setUser(currentUser);

        // Load cloud profile
        const loadedProfile = await loadUserProfileFromCloud(currentUser.uid);
        if (generation !== authGeneration.current) return;

        if (loadedProfile) {
          const merged: UserProfile = {
            ...loadedProfile,
            uid: currentUser.uid,
            displayName: currentUser.displayName || loadedProfile.displayName || 'Adventurer',
            email: currentUser.email || loadedProfile.email,
            photoURL: loadedProfile.photoURL || currentUser.photoURL || null,
          };
          setUserProfile(merged);
          safeSetStorage('dnd_user_profile', JSON.stringify(merged));

          // Hydrate settings from cloud
          if (loadedProfile.settings) {
            const cs = loadedProfile.settings;
            if (cs.selectedModel) {
              setSelectedModel(cs.selectedModel);
              safeSetStorage('dnd_selected_model', cs.selectedModel);
            }
            if (cs.customSystemPrompt !== undefined) {
              setCustomSystemPrompt(cs.customSystemPrompt);
              safeSetStorage('dnd_system_prompt', cs.customSystemPrompt);
            }
            if (cs.soundEnabled !== undefined) {
              setSoundEnabled(cs.soundEnabled);
              safeSetStorage('dnd_sound_enabled', String(cs.soundEnabled));
            }
            importAllProviderSettings(cs);
            // Older builds synced API keys to the cloud in plain text. They are now copied
            // to this device (above) and deleted from the profile; keys never go back up.
            if (cs.providerKeys) {
              purgeCloudProviderKeys(currentUser.uid)
                .catch((err) => showCloudSaveError(`Could not remove old cloud key copy: ${err.message}`));
            }
            saveUserSettingsToCloud(currentUser.uid, exportAllProviderSettings())
              .catch((err) => showCloudSaveError(`Cloud settings sync failed: ${err.message}`));
          } else {
            // First cloud sync for this account — upload local preferences
            const localSettings = exportAllProviderSettings();
            await saveUserSettingsToCloud(currentUser.uid, {
              ...localSettings,
              selectedModel,
              customSystemPrompt,
              soundEnabled
            }).catch((err) => showCloudSaveError(`Cloud settings sync failed: ${err.message}`));
            if (generation !== authGeneration.current) return;
          }

          if (loadedProfile.activeExperienceId) {
            pendingActiveExpId.current = loadedProfile.activeExperienceId;
          }
        } else {
          // New account — create cloud profile record
          const localSettings = exportAllProviderSettings();
          const newProfile: UserProfile = {
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'Adventurer',
            email: currentUser.email,
            photoURL: currentUser.photoURL || null,
            avatar: {
              hairstyle: 'short_rogue',
              hairColor: '#f59e0b',
              skinTone: '#fde047',
              clothingColor: '#1e1b4b',
              badgeIcon: 'shield'
            },
            settings: {
              ...localSettings,
              selectedModel,
              customSystemPrompt,
              soundEnabled
            }
          };
          await saveUserProfileToCloud(newProfile)
            .catch((err) => showCloudSaveError(`Cloud profile sync failed: ${err.message}`));
          if (generation !== authGeneration.current) return;
          setUserProfile(newProfile);
          safeSetStorage('dnd_user_profile', JSON.stringify(newProfile));
        }
      } else {
        // Signed out — synchronously clear ALL user-specific state first to prevent data leak
        setUser(null);
        setExperiences([]);
        setSignedOutEpoch((n) => n + 1);
        setActiveExperience(null);
        pendingActiveExpId.current = null;
        setUserProfile(GUEST_PROFILE);
        try { localStorage.removeItem('dnd_user_profile'); } catch (_) {}
      }
    });
    return () => unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save profile helper
  const handleSaveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    safeSetStorage('dnd_user_profile', JSON.stringify(newProfile));
    saveUserProfileToCloud(newProfile)
      .catch((err) => showCloudSaveError(`Cloud profile sync failed: ${err.message}`));
  };

  // ---------------------------------------------------------------------------
  // Experience Subscription — depends only on [user], not on pendingActiveExpId
  // Avoids recreating the Firestore listener when only the pending ID changes.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const userId = user?.uid || '';

    const unsubscribe = subscribeToUserExperiences(
      userId,
      (exps) => {
        setExperiences(exps);

        setActiveExperience((currentActive) => {
          // Resolve pending active experience once the list arrives
          if (pendingActiveExpId.current) {
            const found = exps.find(e => e.id === pendingActiveExpId.current);
            if (found) {
              pendingActiveExpId.current = null;
              return found;
            }
          }
          // If we already have an active experience, keep it synced with the latest cloud data
          if (currentActive) {
            const updated = exps.find(e => e.id === currentActive.id);
            // A snapshot older than what is on screen (a turn still saving) does not roll it back (S5).
            if (updated && !isNewer(currentActive, updated)) {
              return updated;
            }
          }
          return currentActive;
        });
      },
      (errMsg) => {
        showCloudSaveError(`Cloud sync error: ${errMsg}`);
      }
    );

    return () => unsubscribe();
  }, [user, signedOutEpoch]); // Re-subscribe when the user identity changes (or after a sign-out cleared the list)

  // ---------------------------------------------------------------------------
  // Settings Persistence
  // ---------------------------------------------------------------------------
  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    safeSetStorage('dnd_selected_model', modelId);
    // The navbar picker lists Gemini models; make the choice the one AI calls actually use.
    // Picking a Gemini model while a local model is active switches back to Gemini.
    if (getActiveProvider() !== 'gemini' && getProviderKey('gemini').trim()) setActiveProvider('gemini');
    if (getActiveProvider() === 'gemini') {
      setProviderModel('gemini', modelId);
      resetAIStatus();
    }
    if (user) {
      saveUserSettingsToCloud(user.uid, { selectedModel: modelId, ...exportAllProviderSettings() })
        .catch((err) => showCloudSaveError(`Cloud settings sync failed: ${err.message}`));
    }
  };

  const handleSaveSystemPrompt = (prompt: string) => {
    setCustomSystemPrompt(prompt);
    safeSetStorage('dnd_system_prompt', prompt);
    if (user) {
      saveUserSettingsToCloud(user.uid, { customSystemPrompt: prompt })
        .catch((err) => showCloudSaveError(`Cloud settings sync failed: ${err.message}`));
    }
  };

  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    safeSetStorage('dnd_sound_enabled', String(nextVal));
    // The navbar speaker is the whole-app mute: music follows it (S24).
    audioManager.setMuted(!nextVal);
    if (user) {
      saveUserSettingsToCloud(user.uid, { soundEnabled: nextVal })
        .catch((err) => showCloudSaveError(`Cloud settings sync failed: ${err.message}`));
    }
  };

  // ---------------------------------------------------------------------------
  // Experience CRUD
  //
  // handleCreateExperience() picks the freshest possible scenario for the
  // chosen category.  Resolution order:
  //   1. If the user supplied a custom opening prompt AND an AI key is
  //      configured, call generateScenarioAI() so the AI weaves the user's
  //      premise into a fully custom Act I scene.
  //   2. Otherwise (or if AI fails) AND an AI key is configured, call
  //      generateScenarioAI() with no user prompt so the AI still produces
  //      a fresh, varied scenario for the category instead of repeating
  //      a baked-in template.
  //   3. Fall back to generateRandomScenarioSetup() — 3 distinct hooks
  //      per category with shuffled names/roles/items (vs the 1 static
  //      hook per category).
  //   4. Last-resort fallback to the original generateScenarioHook()
  //      static dispatcher.
  // ---------------------------------------------------------------------------
  const handleCreateExperience = async (
    category: ExperienceCategory,
    customTitle: string,
    character: CharacterSheet,
    openingPrompt?: string,
    suggestedActions?: string[],
    storyOutline?: DMStoryOutline,
    chapterOneOpening?: string,
    chapterOneModel?: string,
    inspiration?: CampaignInspiration,
    rulesMode?: 'full5e' | 'narrative'
  ) => {
    const categoryInfo = CATEGORIES_DATA.find(c => c.id === category);

    // CategoriesGrid has already prepared the character, including stats and inventory.
    // We just need to merge in the category default items so the hero isn't naked.
    const categoryDefaultInventory = getCategoryDefaultInventory(category);
    const combinedInventory = mergeInventoryAdditive(
      character.inventory,
      categoryDefaultInventory
    );

    const initialMap: MapData = createVariedInitialMap(
      category,
      categoryInfo?.bgTheme || 'dungeon',
      character.name,
      character.hp,
      character.maxHp
    );

    const finalActions = (suggestedActions && suggestedActions.length > 0)
      ? suggestedActions
      : getCategoryFallbackActions(category);

    const initialLogText = chapterOneOpening?.trim() || openingPrompt?.trim() || `${character.name} stands ready. The adventure begins.`;

    const initialLog: LogMessage = {
      id: `msg_init_${uid()}`,
      sender: 'dm',
      text: initialLogText,
      timestamp: new Date().toISOString(),
      modelUsed: chapterOneModel,
      suggestedActions: finalActions
    };

    const finalStoryOutline: DMStoryOutline | undefined = storyOutline
      || (openingPrompt?.trim() ? { backstory: `Player-supplied campaign premise: ${openingPrompt.trim()}` } as DMStoryOutline : undefined);

    const newExp: Experience = {
      id: `exp_${uid()}`,
      userId: user?.uid || 'guest',
      title: customTitle?.trim() || `${categoryInfo?.name || 'Campaign'} Experience`,
      category,
      description: openingPrompt?.trim() || `${categoryInfo?.name} experience starring ${character.name}`,
      model: selectedModel,
      customSystemPrompt: customSystemPrompt || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      character: {
        ...character,
        inventory: combinedInventory
      },
      gameWorldState: {
        currentLocation: 'Unknown',
        timeOfDay: storyOutline?.startingCircumstances || 'Daybreak',
        activeQuest: storyOutline?.immediateGoal || 'Begin your adventure',
        dangerLevel: 'Safe',
        customNotes: storyOutline?.backstory || '',
        currentChapter: 1
      },
      logs: [initialLog],
      mapData: initialMap,
      storyOutline: finalStoryOutline,
      inspiration: inspiration ?? pickInspiration(category),
      rulesMode: rulesMode ?? 'narrative',
      book: 1,
      pendingCheck: null,
      activeAlert: null
    };

    setIsSaving(true);
    const result = await saveExperienceToCloud(newExp);
    setIsSaving(false);

    if (!result.ok) {
      showCloudSaveError('Could not save campaign to cloud. Your progress is saved locally.');
    }

    setActiveExperience(newExp);
    if (user) {
      saveActiveExperienceIdToCloud(user.uid, newExp.id)
        .catch((err) => showCloudSaveError(`Active experience sync failed: ${err.message}`));
    }
  };

  const handleSelectExperience = (exp: Experience | null) => {
    setActiveExperience(exp);
    if (user) {
      saveActiveExperienceIdToCloud(user.uid, exp?.id || null)
        .catch((err) => showCloudSaveError(`Active experience sync failed: ${err.message}`));
    }
  };

  const handleUpdateExperience = async (next: Experience) => {
    // Stamped now, so an older cloud snapshot arriving mid-turn cannot replace it.
    const updated = { ...next, updatedAt: new Date().toISOString() };
    setActiveExperience(updated);
    setIsSaving(true);
    const result = await saveExperienceToCloud(updated);
    setIsSaving(false);

    if (!result.ok) {
      showCloudSaveError('Auto-save to cloud failed. Your progress is saved locally.');
    }
  };

  const handleDeleteExperience = async (expId: string) => {
    if (activeExperience?.id === expId) {
      handleSelectExperience(null);
    }
    const result = await deleteExperienceFromCloud(expId);
    if (!result.ok) {
      showCloudSaveError('Could not delete campaign from cloud.');
    }
  };

  // The next book continues inside the same campaign save (S11, S12). One at a time.
  const continuingRef = useRef(false);
  const handleStartBookTwo = async (prevExp: Experience) => {
    if (continuingRef.current) return;
    continuingRef.current = true;
    setIsSaving(true);
    try {
      const next = await continueToNextBook(prevExp, selectedModel);
      setActiveExperience(next);
      const result = await saveExperienceToCloud(next);
      if (!result.ok) showCloudSaveError('Could not save the new book to the cloud. It is saved on this device.');
    } catch (err: any) {
      showCloudSaveError(`The next book could not be started. ${err?.message || ''}`.trim());
    } finally {
      setIsSaving(false);
      continuingRef.current = false;
    }
  };

  // Home: the campaign list, or the open campaign. /settings shows it under the settings modal.
  const home = (
    <>
              {activeExperience ? (
                <Suspense
                  fallback={
                    <div className="min-h-[60vh] flex items-center justify-center text-xs font-mono text-slate-400">
                      Opening your campaign...
                    </div>
                  }
                >
                  <ExperienceView
                    experience={activeExperience}
                    onUpdateExperience={handleUpdateExperience}
                    onBack={() => handleSelectExperience(null)}
                    selectedModel={selectedModel}
                    soundEnabled={soundEnabled}
                    onStartBookTwo={handleStartBookTwo}
                  />
                </Suspense>
              ) : (
                <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
                  <CategoriesGrid
                    experiences={experiences}
                    onSelectExperience={handleSelectExperience}
                    onCreateExperience={handleCreateExperience}
                    onDeleteExperience={handleDeleteExperience}
                    selectedModel={selectedModel}
                  />
                </Suspense>
              )}
    </>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Main Navigation */}
      <Navbar
        user={user}
        selectedModel={selectedModel}
        onSelectModel={handleSelectModel}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onGoogleSignIn={signInWithGoogle}
        onSignOut={logoutUser}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        activeExperienceTitle={activeExperience?.title}
        onBackToExperiences={activeExperience ? () => handleSelectExperience(null) : undefined}
        userProfile={userProfile}
        isSaving={isSaving}
      />

      {/* AI failure banner — makes every AI failure and offline substitution visible */}
      <AIStatusBanner onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)} />

      {/* Cloud save error toast */}
      {cloudSaveError && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-red-950/90 border border-red-700/60 text-red-200 text-xs font-mono px-4 py-2.5 rounded-lg shadow-xl backdrop-blur-md max-w-sm text-center animate-in fade-in slide-in-from-bottom-2 duration-200"
          role="alert"
        >
          ⚠ {cloudSaveError}
        </div>
      )}

      {cloudBlocked && (
        <div role="alert" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-amber-950/95 border border-amber-600/60 text-amber-100 text-xs px-4 py-2.5 rounded-lg shadow-xl max-w-md flex items-start gap-3">
          <span>
            Cloud sync is blocked in this browser, most likely by an ad blocker or privacy extension. Your saves stay on this device but are not backed up. Allow{' '}
            <code className="font-mono">firestore.googleapis.com</code> for this site to turn backup back on.
          </span>
          <button type="button" onClick={() => setCloudBlocked(false)} className="shrink-0 underline text-amber-300" aria-label="Dismiss cloud sync notice">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Body */}
      <main>
        <Routes>
          {STORY_MODE_ENABLED && (
            <>
              <Route path="/story" element={<Suspense fallback={storyFallback}><StoryPicker /></Suspense>} />
              <Route path="/story/:id" element={<Suspense fallback={storyFallback}><StoryPlay /></Suspense>} />
            </>
          )}
          <Route
            path="/settings"
            element={home}
          />
          <Route path="/" element={home} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Suspense fallback={null}>
      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          user={user}
          selectedModel={selectedModel}
          onSelectModel={handleSelectModel}
          customSystemPrompt={customSystemPrompt}
          onSaveSystemPrompt={handleSaveSystemPrompt}
          onClose={() => setIsSettingsOpen(false)}
          onOpenApiKeyModal={() => {
            setIsSettingsOpen(false);
            setIsApiKeyModalOpen(true);
          }}
          onOpenAuth={() => {
            setIsSettingsOpen(false);
            setIsAuthOpen(true);
          }}
          onGoogleSignIn={signInWithGoogle}
          onSignOut={logoutUser}
        />
      )}

      {/* API Key & AI Provider Setup Modal */}
      {isApiKeyModalOpen && (
        <ApiKeyModal
          isOpen={isApiKeyModalOpen}
          onClose={() => setIsApiKeyModalOpen(false)}
          onProviderChanged={(_provider, model) => {
            setSelectedModel(model);
          }}
        />
      )}

      {/* User Profile & Avatar Modal */}
      {isProfileOpen && (
        <UserProfileModal
          profile={userProfile}
          onSaveProfile={handleSaveProfile}
          onClose={() => setIsProfileOpen(false)}
        />
      )}

      {/* Authentication Modal (Sign In / Sign Up / Guest) */}
      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
        />
      )}
      </Suspense>

      {/* Ambient Music Player — home track everywhere except an active experience */}
      <MusicPlayer
        currentTrackKey={activeExperience ? activeExperience.category : 'home'}
      />

    </div>
  );
}
