import React, { useState, useEffect, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { 
  auth, 
  signInWithGoogle, 
  signInWithGoogleRedirect, 
  checkRedirectAuthResult, 
  logoutUser, 
  saveExperienceToCloud, 
  subscribeToUserExperiences, 
  deleteExperienceFromCloud, 
  saveUserProfileToCloud, 
  loadUserProfileFromCloud,
  saveUserSettingsToCloud,
  saveActiveExperienceIdToCloud,
  migrateLocalDataToUser
} from './lib/firebase';
import { exportAllProviderSettings, importAllProviderSettings } from './lib/geminiService';
import { Navbar } from './components/Navbar';
import { CategoriesGrid } from './components/CategoriesGrid';
import { ExperienceView } from './components/ExperienceView';
import { SettingsModal } from './components/SettingsModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AuthModal } from './components/AuthModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Experience, ExperienceCategory, CharacterSheet, MapData, LogMessage, UserProfile, DMStoryOutline } from './types';
import { DEFAULT_GEMINI_MODEL, GEMINI_MODELS } from './lib/modelsConfig';
import { CATEGORIES_DATA } from './lib/categoriesData';
import { generateScenarioHook } from './lib/scenarioHooks';

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
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [activeExperience, setActiveExperience] = useState<Experience | null>(null);

  // pendingActiveExpId is resolved inside the subscription callback — NOT a dep of the subscription effect
  const pendingActiveExpId = useRef<string | null>(null);

  // User Profile — intentionally NOT initialized from localStorage to avoid flashing
  // a stale/wrong account's cached profile before auth resolves.
  const [userProfile, setUserProfile] = useState<UserProfile>(GUEST_PROFILE);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Settings states — initialized from local cache (acceptable: these are preferences, not identity)
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    const saved = safeGetStorage('dnd_selected_model');
    const isValid = GEMINI_MODELS.some(m => m.id === saved);
    if (isValid && saved) {
      return saved;
    }
    safeSetStorage('dnd_selected_model', DEFAULT_GEMINI_MODEL);
    return DEFAULT_GEMINI_MODEL;
  });

  const [customSystemPrompt, setCustomSystemPrompt] = useState<string>(() => {
    return safeGetStorage('dnd_system_prompt') || '';
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = safeGetStorage('dnd_sound_enabled');
    return saved !== 'false';
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
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

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (cloudSaveErrorTimer.current) clearTimeout(cloudSaveErrorTimer.current);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Auth State — the authoritative source for user identity and cloud data
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Process redirect sign-in if returning from Google redirect
    checkRedirectAuthResult();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Load cloud profile
        let loadedProfile = await loadUserProfileFromCloud(currentUser.uid);

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
          } else {
            // First cloud sync for this account — upload local preferences
            const localSettings = exportAllProviderSettings();
            await saveUserSettingsToCloud(currentUser.uid, {
              ...localSettings,
              selectedModel,
              customSystemPrompt,
              soundEnabled
            });
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
          setUserProfile(newProfile);
          safeSetStorage('dnd_user_profile', JSON.stringify(newProfile));
          await saveUserProfileToCloud(newProfile);
        }
      } else {
        // Signed out — synchronously clear ALL user-specific state first to prevent data leak
        setUser(null);
        setExperiences([]);
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
    saveUserProfileToCloud(newProfile);
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

        // Resolve pending active experience once the list arrives
        if (pendingActiveExpId.current) {
          const found = exps.find(e => e.id === pendingActiveExpId.current);
          if (found) {
            setActiveExperience(found);
            pendingActiveExpId.current = null;
          }
        }
      },
      (errMsg) => {
        showCloudSaveError(`Cloud sync error: ${errMsg}`);
      }
    );

    return () => unsubscribe();
  }, [user]); // Only re-subscribe when the user identity changes

  // ---------------------------------------------------------------------------
  // Settings Persistence
  // ---------------------------------------------------------------------------
  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    safeSetStorage('dnd_selected_model', modelId);
    if (user) {
      saveUserSettingsToCloud(user.uid, { selectedModel: modelId });
    }
  };

  const handleSaveSystemPrompt = (prompt: string) => {
    setCustomSystemPrompt(prompt);
    safeSetStorage('dnd_system_prompt', prompt);
    if (user) {
      saveUserSettingsToCloud(user.uid, { customSystemPrompt: prompt });
    }
  };

  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    safeSetStorage('dnd_sound_enabled', String(nextVal));
    if (user) {
      saveUserSettingsToCloud(user.uid, { soundEnabled: nextVal });
    }
  };

  // ---------------------------------------------------------------------------
  // Experience CRUD
  // ---------------------------------------------------------------------------
  const handleCreateExperience = async (
    category: ExperienceCategory,
    customTitle: string,
    character: CharacterSheet,
    openingPrompt?: string,
    suggestedActions?: string[],
    storyOutline?: DMStoryOutline
  ) => {
    const categoryInfo = CATEGORIES_DATA.find(c => c.id === category);

    const scenarioHookData = generateScenarioHook(category, character.name, character.roleClass);

    const initialMap: MapData = scenarioHookData.mapData || {
      gridWidth: 12,
      gridHeight: 12,
      bgTheme: categoryInfo?.bgTheme || 'dungeon',
      showGrid: true,
      fogOfWarEnabled: true,
      fogMatrix: Array(12).fill(null).map(() => Array(12).fill(false)),
      tokens: [
        { id: 'hero_tok', name: character.name, type: 'hero', x: 2, y: 10, hp: character.hp, maxHp: character.maxHp, color: '#2563eb', icon: 'shield' }
      ],
      terrainMarkers: []
    };

    const initialLogText = openingPrompt || scenarioHookData.hookText;

    const initialLog: LogMessage = {
      id: `msg_init_${Date.now()}`,
      sender: 'dm',
      text: initialLogText,
      timestamp: new Date().toISOString(),
      suggestedActions: (suggestedActions && suggestedActions.length > 0) ? suggestedActions : (scenarioHookData.suggestedActions || [
        'I inspect my surroundings cautiously.',
        'I step forward to speak with the quest contact.',
        'I check my supplies and survey the trailhead.'
      ])
    };

    const newExp: Experience = {
      id: `exp_${Date.now()}`,
      userId: user?.uid || 'guest',
      title: customTitle || scenarioHookData.title || `${categoryInfo?.name || 'Campaign'} Experience`,
      category,
      description: scenarioHookData.description || `${categoryInfo?.name} experience starring ${character.name}`,
      model: selectedModel,
      customSystemPrompt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      character: {
        ...scenarioHookData.character,
        ...character,
        inventory: (character.inventory && character.inventory.length > 0) ? character.inventory : scenarioHookData.character.inventory,
        spells: (character.spells && character.spells.length > 0) ? character.spells : scenarioHookData.character.spells,
        statusEffects: (character.statusEffects && character.statusEffects.length > 0) ? character.statusEffects : scenarioHookData.character.statusEffects,
        avatarUrl: character.avatarUrl || scenarioHookData.character.avatarUrl,
        physicalDescription: character.physicalDescription || scenarioHookData.character.physicalDescription
      },
      gameWorldState: scenarioHookData.gameWorldState,
      logs: [initialLog],
      mapData: initialMap,
      storyOutline
    };

    setIsSaving(true);
    const result = await saveExperienceToCloud(newExp);
    setIsSaving(false);

    if (!result.ok) {
      showCloudSaveError('Could not save campaign to cloud. Your progress is saved locally.');
    }

    setActiveExperience(newExp);
    if (user) {
      saveActiveExperienceIdToCloud(user.uid, newExp.id);
    }
  };

  const handleSelectExperience = (exp: Experience | null) => {
    setActiveExperience(exp);
    if (user) {
      saveActiveExperienceIdToCloud(user.uid, exp?.id || null);
    }
  };

  const handleUpdateExperience = async (updated: Experience) => {
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

      {/* Cloud save error toast */}
      {cloudSaveError && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-red-950/90 border border-red-700/60 text-red-200 text-xs font-mono px-4 py-2.5 rounded-lg shadow-xl backdrop-blur-md max-w-sm text-center animate-in fade-in slide-in-from-bottom-2 duration-200"
          role="alert"
        >
          ⚠ {cloudSaveError}
        </div>
      )}

      {/* Main Body */}
      <main>
        {activeExperience ? (
          <ExperienceView
            experience={activeExperience}
            onUpdateExperience={handleUpdateExperience}
            onBack={() => handleSelectExperience(null)}
            selectedModel={selectedModel}
            soundEnabled={soundEnabled}
          />
        ) : (
          <CategoriesGrid
            experiences={experiences}
            onSelectExperience={handleSelectExperience}
            onCreateExperience={handleCreateExperience}
            onDeleteExperience={handleDeleteExperience}
            selectedModel={selectedModel}
          />
        )}
      </main>

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

    </div>
  );
}
