import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfigData) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
// If a custom firestoreDatabaseId exists in config, pass it to getFirestore(app, databaseId)
export const db: Firestore = (firebaseConfigData as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfigData as any).firestoreDatabaseId)
  : getFirestore(app);

// Authentication helper methods
export const signInAnonymousUser = async (displayName?: string) => {
  const result = await signInAnonymously(auth);
  if (displayName && result.user) {
    await updateProfile(result.user, { displayName });
  }
  return result.user;
};

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const registerWithEmail = async (email: string, pass: string, name?: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (name && result.user) {
    await updateProfile(result.user, { displayName: name });
  }
  return result.user;
};

export const loginWithEmail = async (email: string, pass: string) => {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
};

export const logOutUser = async () => {
  await firebaseSignOut(auth);
};

// Firestore Database operations

export interface WaitlistSubmission {
  email: string;
  name?: string;
  device?: string;
  androidVersion?: string;
  trackingPreference?: string;
  source?: string;
  createdAt?: any;
}

export const addWaitlistEntryToFirestore = async (data: WaitlistSubmission) => {
  try {
    const waitlistCol = collection(db, 'waitlist');
    const docRef = await addDoc(waitlistCol, {
      ...data,
      email: data.email.toLowerCase().trim(),
      createdAt: serverTimestamp(),
      status: 'pending_launch',
      wave: 'Wave 1 — Kerala Tourism Beta'
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.warn('Firestore waitlist write error (falling back to backend API):', error);
    // Return fallback so UI does not freeze
    return { success: false, error: error.message };
  }
};

export const saveTripToFirestore = async (userId: string, tripData: any) => {
  try {
    const tripsCol = collection(db, 'trips');
    const docRef = await addDoc(tripsCol, {
      ...tripData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Firestore save trip error:', error);
    return { success: false, error: error.message };
  }
};

export const fetchUserTripsFromFirestore = async (userId: string) => {
  try {
    const tripsCol = collection(db, 'trips');
    const q = query(tripsCol, where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(20));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    console.warn('Firestore fetch trips error:', error);
    return [];
  }
};

export const saveAIStoryToFirestore = async (userId: string, storyData: any) => {
  try {
    const storiesCol = collection(db, 'ai_stories');
    const docRef = await addDoc(storiesCol, {
      ...storyData,
      userId: userId || 'anonymous',
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Firestore save AI story error:', error);
    return { success: false, error: error.message };
  }
};

export const fetchRecentAIStories = async () => {
  try {
    const storiesCol = collection(db, 'ai_stories');
    const q = query(storiesCol, orderBy('createdAt', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    console.warn('Firestore fetch recent stories error:', error);
    return [];
  }
};

export { onAuthStateChanged };
export type { User };
