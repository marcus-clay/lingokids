import { Lesson, UserProgress, UserProfile } from '../types';
import { INITIAL_LESSONS, INITIAL_USER_PROGRESS } from '../constants';

const DB_PREFIX = 'lingokids_v1_';

export const storageService = {
  // Simulate async DB calls
  getUserProgress: async (profileId: string): Promise<UserProgress> => {
    const data = localStorage.getItem(`${DB_PREFIX}progress_${profileId}`);
    return data ? JSON.parse(data) : { ...INITIAL_USER_PROGRESS };
  },

  saveUserProgress: async (profileId: string, progress: UserProgress): Promise<void> => {
    localStorage.setItem(`${DB_PREFIX}progress_${profileId}`, JSON.stringify(progress));
  },

  getLessons: async (profileId: string): Promise<Lesson[]> => {
    const data = localStorage.getItem(`${DB_PREFIX}lessons_${profileId}`);
    return data ? JSON.parse(data) : [...INITIAL_LESSONS];
  },

  saveLessons: async (profileId: string, lessons: Lesson[]): Promise<void> => {
    localStorage.setItem(`${DB_PREFIX}lessons_${profileId}`, JSON.stringify(lessons));
  },

  // Auth simulation
  getCurrentProfile: (): string | null => {
    return localStorage.getItem(`${DB_PREFIX}current_profile`);
  },

  setCurrentProfile: (profileId: string): void => {
    localStorage.setItem(`${DB_PREFIX}current_profile`, profileId);
  },

  logout: (): void => {
    localStorage.removeItem(`${DB_PREFIX}current_profile`);
  }
};