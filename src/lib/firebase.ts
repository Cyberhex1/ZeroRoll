import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocFromServer
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Experience, UserProfile, UserSettings } from '../types';

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID if available
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Context:', JSON.stringify(errInfo));
  return errInfo;
}

// Convert Firebase auth error codes to friendly explanations
export function getFriendlyAuthErrorMessage(error: any): string {
  const code = error?.code || '';
  const message = error?.message || '';

  if (code === 'auth/unauthorized-domain' || message.includes('unauthorized-domain')) {
    const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
    return `The domain "${currentDomain}" is not in the Firebase Authorized Domains list. To use Google Sign-In, add "${currentDomain}" in Firebase Console > Authentication > Settings > Authorized Domains. In the meantime, you can sign in with Email & Password or continue in Guest mode!`;
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'The Google sign-in window was closed before completing. If it closed immediately by itself, the domain may not be authorized in Firebase Console.';
  }
  if (code === 'auth/popup-blocked') {
    return 'The sign-in popup was blocked by your browser. Please allow popups for this site or use Email & Password sign-in.';
  }
  if (code === 'auth/email-already-in-use') {
    return 'This email address is already in use. Please sign in instead or use another email.';
  }
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'Invalid email or password. Please verify your credentials and try again.';
  }
  if (code === 'auth/weak-password') {
    return 'Password is too weak. Please use at least 6 characters.';
  }
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'This sign-in provider is currently disabled in your Firebase console.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network connection failed. Please check your internet connection.';
  }
  return message || 'Authentication failed. Please try again.';
}

// Helper to initialize or sync user profile record
async function syncUserRecord(user: User, customDisplayName?: string) {
  try {
    const userRef = doc(db, 'users', user.uid);
    const existing = await getDoc(userRef);
    const resolvedName = customDisplayName || user.displayName || 'Adventurer';

    if (!existing.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: resolvedName,
        email: user.email || null,
        photoURL: user.photoURL || null,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } else {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: resolvedName,
        email: user.email || null,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    // Migrate any existing guest experiences to this account
    await migrateLocalDataToUser(user.uid);
  } catch (e) {
    console.warn('Could not sync user record to Firestore:', e);
  }
}

// Test Connection Helper
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    if (error?.message?.includes('offline')) {
      console.warn('Firestore offline mode active.');
    }
    return false;
  }
}

// Google Sign In (Popup)
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (user) {
      await syncUserRecord(user);
    }
    return user;
  } catch (error: any) {
    console.error('Google Auth Error:', error);
    throw error;
  }
}

// Google Sign In (Redirect fallback - works when popups/third-party cookies are blocked)
export async function signInWithGoogleRedirect(): Promise<void> {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error: any) {
    console.error('Google Redirect Auth Error:', error);
    throw error;
  }
}

// Check redirect login results on app startup
export async function checkRedirectAuthResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      await syncUserRecord(result.user);
      return result.user;
    }
  } catch (error: any) {
    console.warn('Redirect auth check error:', error);
  }
  return null;
}

// Email & Password Sign In
export async function signInWithEmail(email: string, pass: string): Promise<User | null> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    const user = result.user;
    if (user) {
      await syncUserRecord(user);
    }
    return user;
  } catch (error: any) {
    console.error('Email Sign In Error:', error);
    throw error;
  }
}

// Email & Password Sign Up
export async function signUpWithEmail(email: string, pass: string, displayName: string): Promise<User | null> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    const user = result.user;
    if (user) {
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      await syncUserRecord(user, displayName);
    }
    return user;
  } catch (error: any) {
    console.error('Email Sign Up Error:', error);
    throw error;
  }
}

// Guest Anonymous Sign In
export async function signInAsGuestUser(displayName?: string): Promise<User | null> {
  try {
    const result = await signInAnonymously(auth);
    const user = result.user;
    if (user) {
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      await syncUserRecord(user, displayName || 'Adventurer (Guest)');
    }
    return user;
  } catch (error: any) {
    console.error('Guest Auth Error:', error);
    throw error;
  }
}

// Sign Out — does NOT notify local experience change; App.tsx handles state cleanup
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// User Settings & Profile Cloud Sync
export async function saveUserSettingsToCloud(userId: string, settings: Partial<UserSettings>): Promise<void> {
  if (!userId || userId === 'guest') return;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      settings: {
        ...settings,
        updatedAt: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, `users/${userId}/settings`);
  }
}

export async function saveActiveExperienceIdToCloud(userId: string, activeExperienceId: string | null): Promise<void> {
  if (!userId || userId === 'guest') return;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      activeExperienceId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, `users/${userId}/activeExperienceId`);
  }
}

export async function saveUserProfileToCloud(profile: UserProfile): Promise<void> {
  try {
    if (profile.uid && profile.uid !== 'guest') {
      await setDoc(doc(db, 'users', profile.uid), {
        ...profile,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, `users/${profile.uid}`);
  }
}

export async function loadUserProfileFromCloud(uid: string): Promise<UserProfile | null> {
  try {
    if (uid && uid !== 'guest') {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
    }
  } catch (err: any) {
    handleFirestoreError(err, OperationType.GET, `users/${uid}`);
  }
  return null;
}

// ---------------------------------------------------------------------------
// localStorage helpers — experience keys only (profile keys are managed in App.tsx)
// ---------------------------------------------------------------------------

const LEGACY_EXP_PREFIX = 'experience_';
const USER_EXP_PREFIX = 'zeroroll_exp_';
const GUEST_EXP_PREFIX = 'zeroroll_exp_guest_';

/** Returns all local experiences for a given userId (or guest experiences if no userId). */
export function getLocalExperiences(userId?: string): Experience[] {
  const localExps: Experience[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const isLegacy = key.startsWith(LEGACY_EXP_PREFIX);
      const isUserScoped = userId && key.startsWith(`${USER_EXP_PREFIX}${userId}_`);
      const isGuestScoped = key.startsWith(GUEST_EXP_PREFIX);

      if (isLegacy || isUserScoped || isGuestScoped) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const item = JSON.parse(raw);
            if (item && item.id && !localExps.some(e => e.id === item.id)) {
              localExps.push(item);
            }
          }
        } catch (_) {}
      }
    }
  } catch (e) {
    console.warn('Error reading local storage experiences:', e);
  }
  return localExps.sort(
    (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
  );
}

/**
 * Purge guest-scoped and legacy experience keys from localStorage.
 * Called after a successful migration to avoid stale guest data resurfacing
 * in future subscriptions for the authenticated user.
 */
function purgeGuestLocalExperiences(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(GUEST_EXP_PREFIX) || key.startsWith(LEGACY_EXP_PREFIX))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => {
      try { localStorage.removeItem(k); } catch (_) {}
    });
  } catch (_) {}
}

// Custom event to synchronize local experience changes across components
const EXPERIENCE_CHANGE_EVENT = 'rollzero_experience_change';

function notifyLocalExperienceChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EXPERIENCE_CHANGE_EVENT));
  }
}

/**
 * Migrate guest/local experiences into the authenticated user's Firestore subcollection.
 *
 * Conflict resolution:
 *   - If the cloud copy exists and is NEWER than the local copy → skip (cloud wins).
 *   - If the cloud copy does not exist or is OLDER → upload local copy.
 *
 * A `cancelled` flag prevents async writes from firing after logout.
 */
export async function migrateLocalDataToUser(userId: string, cancelled?: { current: boolean }): Promise<void> {
  if (!userId || userId === 'guest') return;

  try {
    const localExps = getLocalExperiences(userId);
    let migrated = false;

    for (const exp of localExps) {
      if (cancelled?.current) break;

      // Only migrate guest-owned or unclaimed experiences
      if (exp.userId !== 'guest' && exp.userId && exp.userId !== userId) continue;

      const claimedExp: Experience = {
        ...exp,
        userId,
        updatedAt: exp.updatedAt || new Date().toISOString()
      };

      // Write to user-scoped localStorage key
      try {
        localStorage.setItem(`${USER_EXP_PREFIX}${userId}_${claimedExp.id}`, JSON.stringify(claimedExp));
      } catch (_) {}

      if (cancelled?.current) break;

      try {
        const userExpRef = doc(db, 'users', userId, 'experiences', claimedExp.id);
        const cloudSnap = await getDoc(userExpRef);

        if (cloudSnap.exists()) {
          const cloudData = cloudSnap.data() as Experience;
          const cloudTs = new Date(cloudData.updatedAt || cloudData.createdAt).getTime();
          const localTs = new Date(claimedExp.updatedAt || claimedExp.createdAt).getTime();

          // Cloud is newer — do not overwrite
          if (cloudTs >= localTs) continue;
        }

        if (cancelled?.current) break;

        await setDoc(userExpRef, claimedExp, { merge: true });
        migrated = true;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${userId}/experiences/${claimedExp.id}`);
      }
    }

    if (!cancelled?.current && migrated) {
      // Purge stale guest/legacy local keys so they don't re-appear
      purgeGuestLocalExperiences();
      notifyLocalExperienceChange();
    }
  } catch (e) {
    console.warn('Migration to user cloud subcollection error:', e);
  }
}

// ---------------------------------------------------------------------------
// Save or Sync Experience to Firestore & Local Storage
// Returns { ok: true } on success or { ok: false, error } if Firestore write fails.
// ---------------------------------------------------------------------------
export interface SaveResult {
  ok: boolean;
  error?: string;
}

export async function saveExperienceToCloud(experience: Experience): Promise<SaveResult> {
  const currentUser = auth.currentUser;
  const actualUserId = currentUser ? currentUser.uid : (experience.userId || 'guest');

  const payload: Experience = {
    ...experience,
    userId: actualUserId,
    updatedAt: new Date().toISOString()
  };

  // 1. Instant local storage persistence (always succeeds for offline/guest use)
  try {
    if (actualUserId !== 'guest') {
      localStorage.setItem(`${USER_EXP_PREFIX}${actualUserId}_${payload.id}`, JSON.stringify(payload));
    } else {
      localStorage.setItem(`${GUEST_EXP_PREFIX}${payload.id}`, JSON.stringify(payload));
    }
  } catch (storageErr) {
    console.warn('LocalStorage quota or write error:', storageErr);
  }

  notifyLocalExperienceChange();

  // 2. Cloud Firestore persistence — Firestore = source of truth for authenticated users
  if (actualUserId && actualUserId !== 'guest') {
    try {
      const expRef = doc(db, 'users', actualUserId, 'experiences', payload.id);
      await setDoc(expRef, payload, { merge: true });
      return { ok: true };
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, `users/${actualUserId}/experiences/${payload.id}`);
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  return { ok: true }; // Guest mode — local save succeeded
}

// ---------------------------------------------------------------------------
// Subscribe to User Experiences in Real-Time
//
// For authenticated users: Firestore is the source of truth.
//   - The Firestore snapshot drives the experience list.
//   - Local cache is written by the snapshot handler for offline support.
//   - Guest migration runs once on subscribe, with a cancelled guard.
//
// For guest users: localStorage is the only source.
// ---------------------------------------------------------------------------
export function subscribeToUserExperiences(
  userId: string,
  onUpdate: (experiences: Experience[]) => void,
  onError?: (err: string) => void
): () => void {
  // Cancelled flag — prevents async migration / snapshot from updating state after cleanup
  const cancelled = { current: false };

  if (userId && userId !== 'guest') {
    // Authenticated user path — Firestore is authoritative

    // Provide an immediate local snapshot from the user-scoped keys while Firestore loads
    const initialLocal = getLocalExperiences(userId).filter(e => e.userId === userId);
    if (initialLocal.length > 0) {
      onUpdate(initialLocal);
    }

    // Kick off guest migration (non-blocking, conflict-aware)
    migrateLocalDataToUser(userId, cancelled).catch(console.warn);

    // Attach Firestore real-time listener
    const userExpCollection = collection(db, 'users', userId, 'experiences');

    const unsubscribeFirestore = onSnapshot(
      userExpCollection,
      (snapshot) => {
        if (cancelled.current) return;

        const cloudExps: Experience[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Experience;
          cloudExps.push(data);

          // Write-through to local cache for offline resilience
          try {
            localStorage.setItem(`${USER_EXP_PREFIX}${userId}_${data.id}`, JSON.stringify(data));
          } catch (_) {}
        });

        // Firestore is the source of truth — cloud list replaces local list
        cloudExps.sort(
          (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
        );
        onUpdate(cloudExps);
      },
      (err) => {
        if (cancelled.current) return;
        handleFirestoreError(err, OperationType.LIST, `users/${userId}/experiences`);
        if (onError) onError(err.message);

        // Offline fallback — serve from user-scoped local cache
        const fallback = getLocalExperiences(userId).filter(e => e.userId === userId);
        onUpdate(fallback);
      }
    );

    return () => {
      cancelled.current = true;
      unsubscribeFirestore();
    };
  }

  // ---------------------------------------------------------------------------
  // Guest user path — localStorage only
  // ---------------------------------------------------------------------------
  const guestExps = getLocalExperiences().filter(e => e.userId === 'guest' || !e.userId);
  onUpdate(guestExps);

  const handleLocalChange = () => {
    if (cancelled.current) return;
    const fresh = getLocalExperiences().filter(e => e.userId === 'guest' || !e.userId);
    onUpdate(fresh);
  };

  window.addEventListener(EXPERIENCE_CHANGE_EVENT, handleLocalChange);
  window.addEventListener('storage', handleLocalChange);

  return () => {
    cancelled.current = true;
    window.removeEventListener(EXPERIENCE_CHANGE_EVENT, handleLocalChange);
    window.removeEventListener('storage', handleLocalChange);
  };
}

// ---------------------------------------------------------------------------
// Delete Experience
// ---------------------------------------------------------------------------
export async function deleteExperienceFromCloud(experienceId: string): Promise<SaveResult> {
  const currentUser = auth.currentUser;
  const actualUserId = currentUser ? currentUser.uid : null;

  try {
    // Remove from local cache
    if (actualUserId) {
      try { localStorage.removeItem(`${USER_EXP_PREFIX}${actualUserId}_${experienceId}`); } catch (_) {}
    }
    try { localStorage.removeItem(`${LEGACY_EXP_PREFIX}${experienceId}`); } catch (_) {}
    try { localStorage.removeItem(`${GUEST_EXP_PREFIX}${experienceId}`); } catch (_) {}

    notifyLocalExperienceChange();

    if (actualUserId) {
      await deleteDoc(doc(db, 'users', actualUserId, 'experiences', experienceId));
    }

    return { ok: true };
  } catch (err: any) {
    handleFirestoreError(err, OperationType.DELETE, `users/${actualUserId}/experiences/${experienceId}`);
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
