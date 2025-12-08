import { Lesson, UserProgress, UserProfile } from '../types';
import { INITIAL_LESSONS, INITIAL_USER_PROGRESS, DEFAULT_PROFILES } from '../constants';

const DB_PREFIX = 'lingokids_v1_';

export const storageService = {
  // Profile Management
  getProfiles: (): UserProfile[] => {
    const data = localStorage.getItem(`${DB_PREFIX}profiles`);
    if (data) {
      return JSON.parse(data);
    }
    // Initialize with default profiles on first load
    localStorage.setItem(`${DB_PREFIX}profiles`, JSON.stringify(DEFAULT_PROFILES));
    return DEFAULT_PROFILES;
  },

  saveProfiles: (profiles: UserProfile[]): void => {
    localStorage.setItem(`${DB_PREFIX}profiles`, JSON.stringify(profiles));
  },

  createProfile: (profile: Omit<UserProfile, 'id'>): UserProfile => {
    const profiles = storageService.getProfiles();
    const newProfile: UserProfile = {
      ...profile,
      id: `child_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
    profiles.push(newProfile);
    storageService.saveProfiles(profiles);
    return newProfile;
  },

  deleteProfile: (profileId: string): void => {
    const profiles = storageService.getProfiles();
    const filteredProfiles = profiles.filter(p => p.id !== profileId);
    storageService.saveProfiles(filteredProfiles);
    // Clean up associated data
    localStorage.removeItem(`${DB_PREFIX}progress_${profileId}`);
    localStorage.removeItem(`${DB_PREFIX}lessons_${profileId}`);
  },

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