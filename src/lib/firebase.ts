import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Magic Link configuration
const actionCodeSettings = {
  url: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'http://localhost:5173/auth/callback',
  handleCodeInApp: true,
};

// Send magic link email
export const sendMagicLink = async (email: string): Promise<void> => {
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  // Save email to localStorage for verification
  window.localStorage.setItem('emailForSignIn', email);
};

// Complete magic link sign in
export const completeMagicLinkSignIn = async (): Promise<boolean> => {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem('emailForSignIn');

    if (!email) {
      // User may have opened link on different device
      email = window.prompt('Veuillez entrer votre email pour confirmer la connexion:');
    }

    if (email) {
      await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem('emailForSignIn');
      return true;
    }
  }
  return false;
};

// Check if current URL is a magic link
export const isMagicLinkUrl = (): boolean => {
  return isSignInWithEmailLink(auth, window.location.href);
};

export default app;
