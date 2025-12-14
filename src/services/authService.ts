import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider, sendMagicLink, completeMagicLinkSignIn, isMagicLinkUrl } from '../lib/firebase';
import type { User, Family, Child, AuthResult } from '../types';

// ----- AUTH FUNCTIONS -----

export const signInWithGoogle = async (): Promise<AuthResult> => {
  const result = await signInWithPopup(auth, googleProvider);
  return handleAuthResult(result.user);
};

export const signInWithMagicLink = async (email: string): Promise<void> => {
  await sendMagicLink(email);
};

export const completeMagicLink = async (): Promise<AuthResult | null> => {
  const success = await completeMagicLinkSignIn();
  if (success && auth.currentUser) {
    return handleAuthResult(auth.currentUser);
  }
  return null;
};

export const checkMagicLinkUrl = (): boolean => {
  return isMagicLinkUrl();
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
};

export const subscribeToAuthChanges = (
  callback: (user: FirebaseUser | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

// ----- USER & FAMILY MANAGEMENT -----

const handleAuthResult = async (firebaseUser: FirebaseUser): Promise<AuthResult> => {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  let user: User;
  let family: Family;
  let children: Child[] = [];
  let isNewUser = false;

  if (!userSnap.exists()) {
    // New user - create user and family
    isNewUser = true;
    const familyId = crypto.randomUUID();

    user = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      role: 'PARENT',
      displayName: firebaseUser.displayName || 'Parent',
      photoURL: firebaseUser.photoURL || undefined,
      familyId,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    family = {
      id: familyId,
      parentId: firebaseUser.uid,
      createdAt: new Date(),
      subscription: 'free',
      settings: {
        dailyGoalMinutes: 15,
        notificationsEnabled: true,
        parentPinEnabled: false,
      },
    };

    // Save to Firestore
    await setDoc(userRef, {
      ...user,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });

    await setDoc(doc(db, 'families', familyId), {
      ...family,
      createdAt: serverTimestamp(),
    });
  } else {
    // Existing user
    const userData = userSnap.data();
    user = {
      id: firebaseUser.uid,
      email: userData.email,
      role: userData.role,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      familyId: userData.familyId,
      createdAt: (userData.createdAt as Timestamp).toDate(),
      lastLoginAt: new Date(),
    };

    // Update last login
    await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });

    // Get family
    const familySnap = await getDoc(doc(db, 'families', user.familyId));
    if (familySnap.exists()) {
      const familyData = familySnap.data();
      family = {
        id: familySnap.id,
        parentId: familyData.parentId,
        createdAt: (familyData.createdAt as Timestamp).toDate(),
        subscription: familyData.subscription,
        settings: familyData.settings,
      };
    } else {
      throw new Error('Family not found');
    }

    // Get children
    children = await getChildrenByFamilyId(user.familyId);
  }

  return { user, family, children, isNewUser };
};

export const getChildrenByFamilyId = async (familyId: string): Promise<Child[]> => {
  const childrenRef = collection(db, 'children');
  const q = query(childrenRef, where('familyId', '==', familyId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      familyId: data.familyId,
      name: data.name,
      avatarColor: data.avatarColor,
      avatarCustomization: data.avatarCustomization,
      grade: data.grade,
      birthYear: data.birthYear,
      createdAt: (data.createdAt as Timestamp).toDate(),
      level: data.level,
      xp: data.xp,
      totalXp: data.totalXp,
      streak: data.streak,
      lastActivityDate: data.lastActivityDate ? (data.lastActivityDate as Timestamp).toDate() : null,
      gems: data.gems,
      lives: data.lives,
      livesLastRegenAt: (data.livesLastRegenAt as Timestamp).toDate(),
      badges: data.badges || [],
      unlockedRewards: data.unlockedRewards || [],
      settings: data.settings,
      hasCompletedOnboarding: data.hasCompletedOnboarding,
      levelTestScore: data.levelTestScore,
    } as Child;
  });
};

export const createChild = async (
  familyId: string,
  childData: Partial<Child>
): Promise<Child> => {
  console.log('[createChild] Starting with familyId:', familyId);
  console.log('[createChild] childData:', childData);

  if (!familyId) {
    throw new Error('familyId est requis pour créer un enfant');
  }

  const childId = crypto.randomUUID();
  const now = new Date();

  const child: Child = {
    id: childId,
    familyId,
    name: childData.name || 'Enfant',
    avatarColor: childData.avatarColor || 'bg-blue-500',
    avatarCustomization: childData.avatarCustomization || {
      skinTone: 'light',
      hairStyle: 'short',
      hairColor: 'brown',
      eyes: 'happy',
      accessories: [],
      outfit: 'casual',
    },
    grade: childData.grade || 'CE2',
    birthYear: childData.birthYear || null, // Firestore doesn't accept undefined
    createdAt: now,
    level: 1,
    xp: 0,
    totalXp: 0,
    streak: 0,
    lastActivityDate: null,
    gems: 50, // Starting gems
    lives: 5, // Max lives
    livesLastRegenAt: now,
    badges: [],
    unlockedRewards: [],
    settings: {
      soundEnabled: true,
      musicEnabled: true,
      voiceSpeed: 'normal',
      showHints: true,
    },
    hasCompletedOnboarding: false,
    levelTestScore: null, // Firestore doesn't accept undefined
  };

  // Remove undefined values before saving to Firestore
  const childForFirestore = Object.fromEntries(
    Object.entries(child).filter(([_, v]) => v !== undefined)
  );

  try {
    console.log('[createChild] Saving to Firestore...');
    await setDoc(doc(db, 'children', childId), {
      ...childForFirestore,
      createdAt: serverTimestamp(),
      livesLastRegenAt: serverTimestamp(),
    });
    console.log('[createChild] Successfully saved child:', childId);
  } catch (error: any) {
    console.error('[createChild] Firestore error:', error);
    console.error('[createChild] Error code:', error?.code);
    console.error('[createChild] Error message:', error?.message);

    // Provide user-friendly error messages
    if (error?.code === 'permission-denied') {
      throw new Error('Permission refusée. Vérifiez les règles de sécurité Firestore.');
    }
    throw error;
  }

  return child;
};

export const updateChild = async (
  childId: string,
  updates: Partial<Child>
): Promise<void> => {
  const childRef = doc(db, 'children', childId);
  await setDoc(childRef, updates, { merge: true });
};

export const getChildById = async (childId: string): Promise<Child | null> => {
  const childRef = doc(db, 'children', childId);
  const childSnap = await getDoc(childRef);

  if (!childSnap.exists()) return null;

  const data = childSnap.data();
  return {
    id: childSnap.id,
    familyId: data.familyId,
    name: data.name,
    avatarColor: data.avatarColor,
    avatarCustomization: data.avatarCustomization,
    grade: data.grade,
    birthYear: data.birthYear,
    createdAt: (data.createdAt as Timestamp).toDate(),
    level: data.level,
    xp: data.xp,
    totalXp: data.totalXp,
    streak: data.streak,
    lastActivityDate: data.lastActivityDate ? (data.lastActivityDate as Timestamp).toDate() : null,
    gems: data.gems,
    lives: data.lives,
    livesLastRegenAt: (data.livesLastRegenAt as Timestamp).toDate(),
    badges: data.badges || [],
    unlockedRewards: data.unlockedRewards || [],
    settings: data.settings,
    hasCompletedOnboarding: data.hasCompletedOnboarding,
    levelTestScore: data.levelTestScore,
  } as Child;
};

// Get current Firebase user
export const getCurrentFirebaseUser = (): FirebaseUser | null => {
  return auth.currentUser;
};
