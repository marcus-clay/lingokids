import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  Family,
  Child,
  AppView,
  OnboardingState,
  LessonState,
  DailyChallenge,
} from '../types';

interface AppState {
  // Auth State
  user: User | null;
  family: Family | null;
  children: Child[];
  selectedChild: Child | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;

  // UI State
  currentView: AppView;
  previousView: AppView | null;
  onboardingState: OnboardingState | null;

  // Lesson State
  lessonState: LessonState | null;

  // Gamification
  dailyChallenges: DailyChallenge[];

  // Actions - Auth
  setUser: (user: User | null) => void;
  setFamily: (family: Family | null) => void;
  setChildren: (children: Child[]) => void;
  addChild: (child: Child) => void;
  updateChildInStore: (childId: string, updates: Partial<Child>) => void;
  selectChild: (child: Child | null) => void;
  setIsLoading: (loading: boolean) => void;
  setAuthError: (error: string | null) => void;
  logout: () => void;

  // Actions - UI
  setCurrentView: (view: AppView) => void;
  goBack: () => void;
  setOnboardingState: (state: OnboardingState | null) => void;
  updateOnboardingStep: (step: OnboardingState['step']) => void;

  // Actions - Lesson
  setLessonState: (state: LessonState | null) => void;
  updateLessonState: (updates: Partial<LessonState>) => void;

  // Actions - Gamification
  setDailyChallenges: (challenges: DailyChallenge[]) => void;
  updateChallengeProgress: (challengeId: string, current: number) => void;

  // Actions - Child Progress
  addXp: (amount: number) => void;
  addGems: (amount: number) => void;
  useLife: () => boolean;
  regenerateLives: () => void;
  updateStreak: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      family: null,
      children: [],
      selectedChild: null,
      isAuthenticated: false,
      isLoading: true,
      authError: null,
      currentView: 'AUTH',
      previousView: null,
      onboardingState: null,
      lessonState: null,
      dailyChallenges: [],

      // Auth Actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          currentView: user ? (get().children.length > 0 ? 'PROFILE_SELECT' : 'ONBOARDING') : 'AUTH',
        }),

      setFamily: (family) => set({ family }),

      setChildren: (children) =>
        set({
          children,
          currentView: children.length > 0 ? 'PROFILE_SELECT' : 'ONBOARDING',
        }),

      addChild: (child) =>
        set((state) => ({
          children: [...state.children, child],
        })),

      updateChildInStore: (childId, updates) =>
        set((state) => ({
          children: state.children.map((c) =>
            c.id === childId ? { ...c, ...updates } : c
          ),
          selectedChild:
            state.selectedChild?.id === childId
              ? { ...state.selectedChild, ...updates }
              : state.selectedChild,
        })),

      selectChild: (child) =>
        set({
          selectedChild: child,
          currentView: child
            ? child.hasCompletedOnboarding
              ? 'DASHBOARD'
              : 'ONBOARDING'
            : 'PROFILE_SELECT',
          onboardingState: child && !child.hasCompletedOnboarding
            ? { step: 'welcome' }
            : null,
        }),

      setIsLoading: (loading) => set({ isLoading: loading }),

      setAuthError: (error) => set({ authError: error }),

      logout: () =>
        set({
          user: null,
          family: null,
          children: [],
          selectedChild: null,
          isAuthenticated: false,
          currentView: 'AUTH',
          onboardingState: null,
          lessonState: null,
        }),

      // UI Actions
      setCurrentView: (view) =>
        set((state) => ({
          previousView: state.currentView,
          currentView: view,
        })),

      goBack: () =>
        set((state) => ({
          currentView: state.previousView || 'DASHBOARD',
          previousView: null,
        })),

      setOnboardingState: (state) => set({ onboardingState: state }),

      updateOnboardingStep: (step) =>
        set((state) => ({
          onboardingState: state.onboardingState
            ? { ...state.onboardingState, step }
            : { step },
        })),

      // Lesson Actions
      setLessonState: (lessonState) => set({ lessonState }),

      updateLessonState: (updates) =>
        set((state) => ({
          lessonState: state.lessonState
            ? { ...state.lessonState, ...updates }
            : null,
        })),

      // Gamification Actions
      setDailyChallenges: (challenges) => set({ dailyChallenges: challenges }),

      updateChallengeProgress: (challengeId, current) =>
        set((state) => ({
          dailyChallenges: state.dailyChallenges.map((c) =>
            c.id === challengeId
              ? { ...c, current, completed: current >= c.target }
              : c
          ),
        })),

      // Child Progress Actions
      addXp: (amount) => {
        const { selectedChild, updateChildInStore } = get();
        if (!selectedChild) return;

        const newXp = selectedChild.xp + amount;
        const newTotalXp = selectedChild.totalXp + amount;
        const newLevel = Math.floor(newTotalXp / 500) + 1;

        updateChildInStore(selectedChild.id, {
          xp: newXp,
          totalXp: newTotalXp,
          level: newLevel,
        });
      },

      addGems: (amount) => {
        const { selectedChild, updateChildInStore } = get();
        if (!selectedChild) return;

        updateChildInStore(selectedChild.id, {
          gems: selectedChild.gems + amount,
        });
      },

      useLife: () => {
        const { selectedChild, updateChildInStore } = get();
        if (!selectedChild || selectedChild.lives <= 0) return false;

        updateChildInStore(selectedChild.id, {
          lives: selectedChild.lives - 1,
        });
        return true;
      },

      regenerateLives: () => {
        const { selectedChild, updateChildInStore } = get();
        if (!selectedChild) return;

        const now = new Date();
        const lastRegen = selectedChild.livesLastRegenAt;

        // If no last regen date, set it now and ensure full lives
        if (!lastRegen) {
          updateChildInStore(selectedChild.id, {
            lives: 5,
            livesLastRegenAt: now,
          });
          return;
        }

        const lastRegenDate = new Date(lastRegen);
        const hoursPassed = (now.getTime() - lastRegenDate.getTime()) / (1000 * 60 * 60);
        const livesToAdd = Math.floor(hoursPassed / 4); // 1 life per 4 hours

        if (livesToAdd > 0 && selectedChild.lives < 5) {
          const newLives = Math.min(5, selectedChild.lives + livesToAdd);
          updateChildInStore(selectedChild.id, {
            lives: newLives,
            livesLastRegenAt: now,
          });
        }
      },

      updateStreak: () => {
        const { selectedChild, updateChildInStore } = get();
        if (!selectedChild) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastActivity = selectedChild.lastActivityDate;
        if (!lastActivity) {
          // First activity ever
          updateChildInStore(selectedChild.id, {
            streak: 1,
            lastActivityDate: new Date(),
          });
          return;
        }

        const lastDate = new Date(lastActivity);
        lastDate.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor(
          (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 0) {
          // Same day, just update lastActivityDate
          updateChildInStore(selectedChild.id, {
            lastActivityDate: new Date(),
          });
        } else if (daysDiff === 1) {
          // Consecutive day, increment streak
          updateChildInStore(selectedChild.id, {
            streak: selectedChild.streak + 1,
            lastActivityDate: new Date(),
          });
        } else {
          // Streak broken
          updateChildInStore(selectedChild.id, {
            streak: 1,
            lastActivityDate: new Date(),
          });
        }
      },
    }),
    {
      name: 'lingokids-storage',
      partialize: (state) => ({
        // Only persist these fields
        selectedChild: state.selectedChild
          ? { id: state.selectedChild.id }
          : null,
      }),
    }
  )
);
