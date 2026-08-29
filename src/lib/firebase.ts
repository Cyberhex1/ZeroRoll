import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  getDocFromServer
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Experience, UserProfile } from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

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
    await migrateGuestExperiencesToUser(user.uid);
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

// Google Sign In
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

// Sign Out
export async function logoutUser(): Promise<void> {
  await signOut(auth);
  notifyLocalExperienceChange();
}

// User Profile Sync
export async function saveUserProfileToCloud(profile: UserProfile): Promise<void> {
  try {
    if (profile.uid && profile.uid !== 'guest') {
      await setDoc(doc(db, 'users', profile.uid), profile, { merge: true });
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

// Helper to get all experiences currently in localStorage
export function getLocalExperiences(): Experience[] {
  const localExps: Experience[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('experience_')) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '');
          if (item && item.id) {
            localExps.push(item);
          }
        } catch (e) {}
      }
    }
  } catch (e) {
    console.warn('Error reading local storage experiences:', e);
  }
  return localExps.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
}

// Custom event to synchronize local experience changes across components
const EXPERIENCE_CHANGE_EVENT = 'rollzero_experience_change';

function notifyLocalExperienceChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EXPERIENCE_CHANGE_EVENT));
  }
}

// Migrate any guest experiences to authenticated user
export async function migrateGuestExperiencesToUser(userId: string): Promise<void> {
  if (!userId || userId === 'guest') return;
  const localExps = getLocalExperiences();
  for (const exp of localExps) {
    if (exp.userId === 'guest' || !exp.userId) {
      const claimedExp: Experience = {
        ...exp,
        userId: userId,
        updatedAt: new Date().toISOString()
      };
      // Save updated local
      localStorage.setItem(`experience_${claimedExp.id}`, JSON.stringify(claimedExp));
      // Save to cloud
      try {
        await setDoc(doc(db, 'experiences', claimedExp.id), claimedExp, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `experiences/${claimedExp.id}`);
      }
    }
  }
  notifyLocalExperienceChange();
}

// Save or Sync Experience to Firestore & Local Storage
export async function saveExperienceToCloud(experience: Experience): Promise<void> {
  const currentUser = auth.currentUser;
  const actualUserId = currentUser ? currentUser.uid : (experience.userId || 'guest');
  
  const payload: Experience = {
    ...experience,
    userId: actualUserId,
    updatedAt: new Date().toISOString()
  };

  // 1. Instant local storage persistence
  try {
    localStorage.setItem(`experience_${payload.id}`, JSON.stringify(payload));
  } catch (storageErr) {
    console.warn('LocalStorage quota or write error:', storageErr);
  }

  // Notify active subscribers
  notifyLocalExperienceChange();

  // 2. Cloud Firestore persistence
  try {
    const expRef = doc(db, 'experiences', payload.id);
    await setDoc(expRef, payload, { merge: true });
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, `experiences/${payload.id}`);
  }
}

// Subscribe to User Experiences in Real-Time (Merging Firestore + Local Cache)
export function subscribeToUserExperiences(
  userId: string, 
  onUpdate: (experiences: Experience[]) => void
) {
  // Initial local state dispatch
  const initialLocal = getLocalExperiences();
  if (userId) {
    const filtered = initialLocal.filter(e => e.userId === userId || e.userId === 'guest');
    onUpdate(filtered);
  } else {
    onUpdate(initialLocal);
  }

  // Local storage listener handler
  const handleLocalChange = () => {
    const freshLocal = getLocalExperiences();
    if (userId) {
      const filtered = freshLocal.filter(e => e.userId === userId || e.userId === 'guest');
      onUpdate(filtered);
    } else {
      onUpdate(freshLocal);
    }
  };

  window.addEventListener(EXPERIENCE_CHANGE_EVENT, handleLocalChange);
  window.addEventListener('storage', handleLocalChange);

  // If user is authenticated, run guest migration and attach Firestore listener
  if (userId && userId !== 'guest') {
    migrateGuestExperiencesToUser(userId).catch(console.warn);

    const q = query(
      collection(db, 'experiences'), 
      where('userId', '==', userId)
    );

    const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
      const cloudExps: Experience[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Experience;
        cloudExps.push(data);
        // Cache to local storage as well for offline persistence
        try {
          localStorage.setItem(`experience_${data.id}`, JSON.stringify(data));
        } catch (_) {}
      });

      // Merge cloud and any existing local experiences
      const localExps = getLocalExperiences();
      const mergedMap = new Map<string, Experience>();

      // Put cloud items in map
      cloudExps.forEach(exp => mergedMap.set(exp.id, exp));

      // Put any local items that belong to user or are guest
      localExps.forEach(exp => {
        if (!mergedMap.has(exp.id) && (exp.userId === userId || exp.userId === 'guest')) {
          mergedMap.set(exp.id, exp);
        }
      });

      const mergedList = Array.from(mergedMap.values());
      mergedList.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
      onUpdate(mergedList);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'experiences');
      handleLocalChange();
    });

    return () => {
      window.removeEventListener(EXPERIENCE_CHANGE_EVENT, handleLocalChange);
      window.removeEventListener('storage', handleLocalChange);
      unsubscribeFirestore();
    };
  }

  // For guest users: rely only on localStorage — never query global 'guest' docs from Firestore
  // since multiple sessions share the same userId string 'guest' in the DB.
  return () => {
    window.removeEventListener(EXPERIENCE_CHANGE_EVENT, handleLocalChange);
    window.removeEventListener('storage', handleLocalChange);
  };
}

// Delete Experience
export async function deleteExperienceFromCloud(experienceId: string): Promise<void> {
  try {
    localStorage.removeItem(`experience_${experienceId}`);
    notifyLocalExperienceChange();
    await deleteDoc(doc(db, 'experiences', experienceId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `experiences/${experienceId}`);
  }
}
