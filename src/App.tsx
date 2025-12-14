import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from './store/useStore';
import {
  subscribeToAuthChanges,
  getChildrenByFamilyId,
  checkMagicLinkUrl,
  completeMagicLink,
  getChildById,
} from './services/authService';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from './lib/firebase';

// Components
import { AuthScreen } from './components/auth/AuthScreen';
import { ProfileSelector } from './components/auth/ProfileSelector';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { ChildDashboard } from './components/dashboard/ChildDashboard';
import { ParentPortal } from './components/ParentPortal';

// Loading Screen
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mb-4 mx-auto animate-pulse">
        L
      </div>
      <p className="text-gray-500">Chargement...</p>
    </div>
  </div>
);

export default function App() {
  const {
    isLoading,
    setIsLoading,
    isAuthenticated,
    currentView,
    setUser,
    setFamily,
    setChildren,
    selectChild,
    selectedChild,
    logout: logoutStore,
  } = useStore();

  // Handle magic link callback
  useEffect(() => {
    const handleMagicLink = async () => {
      if (checkMagicLinkUrl()) {
        setIsLoading(true);
        try {
          const result = await completeMagicLink();
          if (result) {
            // Important: Set family BEFORE user to ensure it's available in onboarding
            setFamily(result.family);
            setChildren(result.children);
            setUser(result.user);
          }
        } catch (error) {
          console.error('Magic link error:', error);
        }
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        setIsLoading(false);
      }
    };

    handleMagicLink();
  }, []);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            const user = {
              id: firebaseUser.uid,
              email: userData.email,
              role: userData.role,
              displayName: userData.displayName,
              photoURL: userData.photoURL,
              familyId: userData.familyId,
              createdAt: (userData.createdAt as Timestamp).toDate(),
              lastLoginAt: new Date(),
            };

            // Get family - set BEFORE user to ensure it's available in onboarding
            const familySnap = await getDoc(doc(db, 'families', user.familyId));
            if (familySnap.exists()) {
              const familyData = familySnap.data();
              const family = {
                id: familySnap.id,
                parentId: familyData.parentId,
                createdAt: (familyData.createdAt as Timestamp).toDate(),
                subscription: familyData.subscription,
                settings: familyData.settings,
              };
              setFamily(family);
            }

            // Get children
            const children = await getChildrenByFamilyId(user.familyId);
            setChildren(children);

            // Set user LAST (this triggers the view change)
            setUser(user);

            // Restore selected child from localStorage if exists
            const storedState = localStorage.getItem('lingokids-storage');
            if (storedState) {
              const parsed = JSON.parse(storedState);
              if (parsed.state?.selectedChild?.id) {
                const child = await getChildById(parsed.state.selectedChild.id);
                if (child && child.familyId === user.familyId) {
                  selectChild(child);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      } else {
        logoutStore();
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Regenerate lives on app load
  useEffect(() => {
    if (selectedChild) {
      useStore.getState().regenerateLives();
    }
  }, [selectedChild?.id]);

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Render based on current view
  const renderContent = () => {
    // Not authenticated - show auth screen
    if (!isAuthenticated) {
      return <AuthScreen />;
    }

    switch (currentView) {
      case 'AUTH':
        return <AuthScreen />;

      case 'PROFILE_SELECT':
        return <ProfileSelector />;

      case 'ONBOARDING':
        return <OnboardingFlow />;

      case 'DASHBOARD':
        return <ChildDashboard />;

      case 'PARENT_PORTAL':
        return <ParentPortal />;

      // TODO: Add more views
      case 'LESSON_INTRO':
      case 'LESSON_EXERCISE':
      case 'LESSON_COMPLETE':
      case 'ACHIEVEMENTS':
      case 'SHOP':
      case 'PROFILE':
      case 'SETTINGS':
        return <ChildDashboard />; // Fallback for now

      default:
        return <AuthScreen />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {renderContent()}
    </AnimatePresence>
  );
}
