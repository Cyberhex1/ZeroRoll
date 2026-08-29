import React, { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, logoutUser, saveExperienceToCloud, subscribeToUserExperiences, deleteExperienceFromCloud, saveUserProfileToCloud, loadUserProfileFromCloud } from './lib/firebase';
import { Navbar } from './components/Navbar';
import { CategoriesGrid } from './components/CategoriesGrid';
import { ExperienceView } from './components/ExperienceView';
import { SettingsModal } from './components/SettingsModal';
import { UserProfileModal } from './components/UserProfileModal';
import { Experience, ExperienceCategory, CharacterSheet, MapData, LogMessage, UserProfile } from './types';
import { DEFAULT_GEMINI_MODEL, GEMINI_MODELS } from './lib/modelsConfig';
import { CATEGORIES_DATA } from './lib/categoriesData';
import { generateScenarioHook } from './lib/scenarioHooks';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [activeExperience, setActiveExperience] = useState<Experience | null>(null);

  // User Profile state
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('dnd_user_profile');
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
    const saved = localStorage.getItem('dnd_selected_model');
    const isValid = GEMINI_MODELS.some(m => m.id === saved);
    if (isValid && saved) {
      return saved;
    }
    localStorage.setItem('dnd_selected_model', DEFAULT_GEMINI_MODEL);
    return DEFAULT_GEMINI_MODEL;
  });

  const [customSystemPrompt, setCustomSystemPrompt] = useState<string>(() => {
    return localStorage.getItem('dnd_system_prompt') || '';
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Sync profile when auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Try to load existing cloud profile
        let loadedProfile = await loadUserProfileFromCloud(currentUser.uid);

        if (loadedProfile) {
          // Merge with Google's latest photoURL in case it changed, but
          // preserve the user's custom avatar config
          const merged: UserProfile = {
            ...loadedProfile,
            uid: currentUser.uid,
            displayName: currentUser.displayName || loadedProfile.displayName || 'Adventurer',
            email: currentUser.email || loadedProfile.email,
            // Prefer the cloud-saved photoURL (may be a custom one) unless Google has one
            // and the cloud one is still the original Google photo or null
            photoURL: loadedProfile.photoURL || currentUser.photoURL || null,
          };
          setUserProfile(merged);
          localStorage.setItem('dnd_user_profile', JSON.stringify(merged));
        } else {
          // No cloud profile yet — try to inherit avatar from guest local profile
          const savedLocal = localStorage.getItem('dnd_user_profile');
          let inheritedAvatar = {
            hairstyle: 'short_rogue' as const,
            hairColor: '#f59e0b',
            skinTone: '#fde047',
            clothingColor: '#1e1b4b',
            badgeIcon: 'shield' as const
          };
          if (savedLocal) {
            try {
              const parsed = JSON.parse(savedLocal);
              if (parsed?.avatar) inheritedAvatar = parsed.avatar;
            } catch (_) {}
          }

          const newProfile: UserProfile = {
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'Adventurer',
            email: currentUser.email,
            photoURL: currentUser.photoURL || null,
            avatar: inheritedAvatar
          };
          setUserProfile(newProfile);
          localStorage.setItem('dnd_user_profile', JSON.stringify(newProfile));
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
        localStorage.removeItem('dnd_user_profile');
      }
    });
    return () => unsubscribe();
  }, []);

  // Save profile helper
  const handleSaveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem('dnd_user_profile', JSON.stringify(newProfile));
    saveUserProfileToCloud(newProfile);
  };

  // Sync experiences in real-time
  useEffect(() => {
    const userId = user?.uid || '';
    const unsubscribe = subscribeToUserExperiences(userId, (exps) => {
      setExperiences(exps);
    });
    return () => unsubscribe();
  }, [user]);

  // Model Persistence
  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    localStorage.setItem('dnd_selected_model', modelId);
  };

  // Custom System Prompt Persistence
  const handleSaveSystemPrompt = (prompt: string) => {
    setCustomSystemPrompt(prompt);
    localStorage.setItem('dnd_system_prompt', prompt);
  };

  // Create New Experience
  const handleCreateExperience = async (
    category: ExperienceCategory,
    customTitle: string,
    character: CharacterSheet,
    openingPrompt?: string,
    suggestedActions?: string[]
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
        // Always prefer the user's chosen name, class, race
        ...character,
        // Explicitly preserve user's inventory/spells (non-empty wins over hook defaults)
        inventory: (character.inventory && character.inventory.length > 0) ? character.inventory : scenarioHookData.character.inventory,
        spells: (character.spells && character.spells.length > 0) ? character.spells : scenarioHookData.character.spells,
        statusEffects: (character.statusEffects && character.statusEffects.length > 0) ? character.statusEffects : scenarioHookData.character.statusEffects
      },
      gameWorldState: scenarioHookData.gameWorldState,
      logs: [initialLog],
      mapData: initialMap
    };

    setIsSaving(true);
    await saveExperienceToCloud(newExp);
    setIsSaving(false);

    setActiveExperience(newExp);
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
      setActiveExperience(null);
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
        onOpenProfile={() => setIsProfileOpen(true)}
        onGoogleSignIn={signInWithGoogle}
        onSignOut={logoutUser}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        activeExperienceTitle={activeExperience?.title}
        onBackToExperiences={activeExperience ? () => setActiveExperience(null) : undefined}
        userProfile={userProfile}
        isSaving={isSaving}
      />

      {/* Main Body */}
      <main>
        {activeExperience ? (
          <ExperienceView
            experience={activeExperience}
            onUpdateExperience={handleUpdateExperience}
            onBack={() => setActiveExperience(null)}
            selectedModel={selectedModel}
            soundEnabled={soundEnabled}
          />
        ) : (
          <CategoriesGrid
            experiences={experiences}
            onSelectExperience={(exp) => setActiveExperience(exp)}
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
          onGoogleSignIn={signInWithGoogle}
          onSignOut={logoutUser}
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

    </div>
  );
}
