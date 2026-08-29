import React, { useState, useEffect } from 'react';
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

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [activeExperience, setActiveExperience] = useState<Experience | null>(null);
  const [pendingActiveExpId, setPendingActiveExpId] = useState<string | null>(null);

  // User Profile state
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = safeGetStorage('dnd_user_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
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
  });
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Settings states
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

  // Sync profile & cloud settings when auth state changes
  useEffect(() => {
    // Process redirect sign-in if returning from Google redirect
    checkRedirectAuthResult();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Run migration for any local/guest experiences
        migrateLocalDataToUser(currentUser.uid).catch(console.warn);

        // Try to load existing cloud profile
        let loadedProfile = await loadUserProfileFromCloud(currentUser.uid);

        if (loadedProfile) {
          // Merge profile and hydrate
          const merged: UserProfile = {
            ...loadedProfile,
            uid: currentUser.uid,
            displayName: currentUser.displayName || loadedProfile.displayName || 'Adventurer',
            email: currentUser.email || loadedProfile.email,
            photoURL: loadedProfile.photoURL || currentUser.photoURL || null,
          };
          setUserProfile(merged);
          safeSetStorage('dnd_user_profile', JSON.stringify(merged));

          // Hydrate settings if present in cloud
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
            // First time cloud sync for this user: export local provider settings to cloud
            const localSettings = exportAllProviderSettings();
            await saveUserSettingsToCloud(currentUser.uid, {
              ...localSettings,
              selectedModel,
              customSystemPrompt,
              soundEnabled
            });
          }

          if (loadedProfile.activeExperienceId) {
            setPendingActiveExpId(loadedProfile.activeExperienceId);
          }
        } else {
          // No cloud profile yet — create new cloud record
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
        // Signed out — reset to guest profile defaults
        const guestProfile: UserProfile = {
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
        setUserProfile(guestProfile);
        setActiveExperience(null);
        setPendingActiveExpId(null);
        try { localStorage.removeItem('dnd_user_profile'); } catch (_) {}
      }
    });
    return () => unsubscribe();
  }, []);

  // Save profile helper
  const handleSaveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    safeSetStorage('dnd_user_profile', JSON.stringify(newProfile));
    saveUserProfileToCloud(newProfile);
  };

  // Sync experiences in real-time
  useEffect(() => {
    const userId = user?.uid || '';
    const unsubscribe = subscribeToUserExperiences(userId, (exps) => {
      setExperiences(exps);

      // Hydrate active experience if pending from cloud
      if (pendingActiveExpId) {
        const found = exps.find(e => e.id === pendingActiveExpId);
        if (found) {
          setActiveExperience(found);
          setPendingActiveExpId(null);
        }
      }
    });
    return () => unsubscribe();
  }, [user, pendingActiveExpId]);

  // Model Persistence
  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    safeSetStorage('dnd_selected_model', modelId);
    if (user) {
      saveUserSettingsToCloud(user.uid, { selectedModel: modelId });
    }
  };

  // Custom System Prompt Persistence
  const handleSaveSystemPrompt = (prompt: string) => {
    setCustomSystemPrompt(prompt);
    safeSetStorage('dnd_system_prompt', prompt);
    if (user) {
      saveUserSettingsToCloud(user.uid, { customSystemPrompt: prompt });
    }
  };

  // Sound preference toggle
  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    safeSetStorage('dnd_sound_enabled', String(nextVal));
    if (user) {
      saveUserSettingsToCloud(user.uid, { soundEnabled: nextVal });
    }
  };

  // Create New Experience
  const handleCreateExperience = async (
    category: ExperienceCategory,
    customTitle: string,
    character: CharacterSheet,
    openingPrompt?: string,
    suggestedActions?: string[],
    storyOutline?: DMStoryOutline
  ) => {
    const categoryInfo = CATEGORIES_DATA.find(c => c.id === category);

    // Generate tailored starting scenario hook & map with fog of war for category
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
      sender: 'dm', // The story starts with a DM narration from the beginning!
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
        // Start with hook defaults for stat block (hp, stats, armorClass etc)
        ...scenarioHookData.character,
        // Always prefer the user's chosen name, class, race, and generated avatar
        ...character,
        // Explicitly preserve user's inventory/spells (non-empty wins over hook defaults)
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
    await saveExperienceToCloud(newExp);
    setIsSaving(false);

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

  // Update Experience Real-Time
  const handleUpdateExperience = async (updated: Experience) => {
    setActiveExperience(updated);
    setIsSaving(true);
    await saveExperienceToCloud(updated);
    setIsSaving(false);
  };

  // Delete Experience
  const handleDeleteExperience = async (expId: string) => {
    if (activeExperience?.id === expId) {
      handleSelectExperience(null);
    }
    await deleteExperienceFromCloud(expId);
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
