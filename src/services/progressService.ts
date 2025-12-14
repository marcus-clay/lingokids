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
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { updateChild } from './authService';
import type { Child, Badge, BadgeCondition } from '../types';

// ============================================
// LESSON PROGRESS PERSISTENCE
// ============================================

export interface LessonProgressData {
  lessonId: string;
  childId: string;
  completed: boolean;
  stars: number; // 0-3
  bestScore: number; // percentage
  attempts: number;
  timeSpent: number; // seconds
  completedAt: Date | null;
  lastAttemptAt: Date;
  mistakesByType: Record<string, number>;
}

/**
 * Save or update lesson progress for a child
 */
export const saveLessonProgress = async (
  childId: string,
  lessonId: string,
  progressData: Partial<LessonProgressData>
): Promise<void> => {
  const progressRef = doc(db, 'progress', childId, 'lessons', lessonId);
  const existingProgress = await getDoc(progressRef);

  if (existingProgress.exists()) {
    // Update existing progress
    const existing = existingProgress.data();
    await setDoc(progressRef, {
      ...existing,
      ...progressData,
      attempts: (existing.attempts || 0) + 1,
      bestScore: Math.max(existing.bestScore || 0, progressData.bestScore || 0),
      lastAttemptAt: serverTimestamp(),
      ...(progressData.completed && !existing.completed
        ? { completedAt: serverTimestamp() }
        : {}),
    }, { merge: true });
  } else {
    // Create new progress
    await setDoc(progressRef, {
      lessonId,
      childId,
      completed: progressData.completed || false,
      stars: progressData.stars || 0,
      bestScore: progressData.bestScore || 0,
      attempts: 1,
      timeSpent: progressData.timeSpent || 0,
      completedAt: progressData.completed ? serverTimestamp() : null,
      lastAttemptAt: serverTimestamp(),
      mistakesByType: progressData.mistakesByType || {},
    });
  }
};

/**
 * Get all lesson progress for a child
 */
export const getChildProgress = async (
  childId: string
): Promise<LessonProgressData[]> => {
  const progressRef = collection(db, 'progress', childId, 'lessons');
  const snapshot = await getDocs(progressRef);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      lessonId: data.lessonId,
      childId: data.childId,
      completed: data.completed,
      stars: data.stars,
      bestScore: data.bestScore,
      attempts: data.attempts,
      timeSpent: data.timeSpent,
      completedAt: data.completedAt ? (data.completedAt as Timestamp).toDate() : null,
      lastAttemptAt: (data.lastAttemptAt as Timestamp).toDate(),
      mistakesByType: data.mistakesByType || {},
    };
  });
};

/**
 * Get completed lesson IDs for a child
 */
export const getCompletedLessonIds = async (childId: string): Promise<string[]> => {
  const progress = await getChildProgress(childId);
  return progress.filter(p => p.completed).map(p => p.lessonId);
};

/**
 * Get progress for a specific lesson
 */
export const getLessonProgress = async (
  childId: string,
  lessonId: string
): Promise<LessonProgressData | null> => {
  const progressRef = doc(db, 'progress', childId, 'lessons', lessonId);
  const snapshot = await getDoc(progressRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  return {
    lessonId: data.lessonId,
    childId: data.childId,
    completed: data.completed,
    stars: data.stars,
    bestScore: data.bestScore,
    attempts: data.attempts,
    timeSpent: data.timeSpent,
    completedAt: data.completedAt ? (data.completedAt as Timestamp).toDate() : null,
    lastAttemptAt: (data.lastAttemptAt as Timestamp).toDate(),
    mistakesByType: data.mistakesByType || {},
  };
};

// ============================================
// CHILD STATS UPDATE (XP, Gems, Lives, etc.)
// ============================================

/**
 * Complete a lesson and update all related stats
 */
export const completeLessonAndUpdateStats = async (
  child: Child,
  lessonId: string,
  score: number, // percentage (0-100)
  timeSpent: number, // seconds
  xpEarned: number,
  gemsEarned: number,
  mistakesByType: Record<string, number> = {}
): Promise<{ newXp: number; newLevel: number; newGems: number; stars: number; badgesEarned: Badge[] }> => {
  // Calculate stars based on score
  let stars = 0;
  if (score >= 100) stars = 3;
  else if (score >= 80) stars = 2;
  else if (score >= 50) stars = 1;

  // Save lesson progress
  await saveLessonProgress(child.id, lessonId, {
    completed: true,
    stars,
    bestScore: score,
    timeSpent,
    mistakesByType,
  });

  // Calculate new XP and level
  const newTotalXp = child.totalXp + xpEarned;
  const newLevel = Math.floor(newTotalXp / 500) + 1;
  const newGems = child.gems + gemsEarned;

  // Check for badges earned
  const badgesEarned = await checkAndAwardBadges(child, {
    lessonCompleted: true,
    perfectScore: score === 100,
    newStreak: child.streak,
    totalLessonsCompleted: (await getCompletedLessonIds(child.id)).length,
  });

  // Update child in Firestore
  await updateChild(child.id, {
    xp: child.xp + xpEarned,
    totalXp: newTotalXp,
    level: newLevel,
    gems: newGems,
    lastActivityDate: new Date(),
    badges: [...(child.badges || []), ...badgesEarned.map(b => b.id)],
  });

  return {
    newXp: child.xp + xpEarned,
    newLevel,
    newGems,
    stars,
    badgesEarned,
  };
};

/**
 * Use a life (when answer is wrong)
 */
export const useLife = async (child: Child): Promise<{ success: boolean; livesRemaining: number }> => {
  if (child.lives <= 0) {
    return { success: false, livesRemaining: 0 };
  }

  const newLives = child.lives - 1;
  await updateChild(child.id, {
    lives: newLives,
    livesLastRegenAt: newLives < 5 ? new Date() : child.livesLastRegenAt,
  });

  return { success: true, livesRemaining: newLives };
};

/**
 * Regenerate lives based on time passed
 */
export const regenerateLives = async (child: Child): Promise<number> => {
  if (child.lives >= 5) return 5;

  const now = new Date();
  const lastRegen = child.livesLastRegenAt;

  if (!lastRegen) {
    await updateChild(child.id, { lives: 5, livesLastRegenAt: now });
    return 5;
  }

  const lastRegenDate = new Date(lastRegen);
  const hoursPassed = (now.getTime() - lastRegenDate.getTime()) / (1000 * 60 * 60);
  const livesToAdd = Math.floor(hoursPassed / 4); // 1 life per 4 hours

  if (livesToAdd > 0) {
    const newLives = Math.min(5, child.lives + livesToAdd);
    await updateChild(child.id, {
      lives: newLives,
      livesLastRegenAt: now,
    });
    return newLives;
  }

  return child.lives;
};

/**
 * Update streak (call on daily activity)
 */
export const updateStreak = async (child: Child): Promise<{ newStreak: number; streakBroken: boolean }> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActivity = child.lastActivityDate;

  if (!lastActivity) {
    // First activity ever
    await updateChild(child.id, {
      streak: 1,
      lastActivityDate: new Date(),
    });
    return { newStreak: 1, streakBroken: false };
  }

  const lastDate = new Date(lastActivity);
  lastDate.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor(
    (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff === 0) {
    // Same day
    await updateChild(child.id, { lastActivityDate: new Date() });
    return { newStreak: child.streak, streakBroken: false };
  } else if (daysDiff === 1) {
    // Consecutive day
    const newStreak = child.streak + 1;
    await updateChild(child.id, {
      streak: newStreak,
      lastActivityDate: new Date(),
    });
    return { newStreak, streakBroken: false };
  } else {
    // Streak broken
    await updateChild(child.id, {
      streak: 1,
      lastActivityDate: new Date(),
    });
    return { newStreak: 1, streakBroken: true };
  }
};

// ============================================
// BADGES SYSTEM
// ============================================

export const AVAILABLE_BADGES: Badge[] = [
  {
    id: 'first-lesson',
    name: 'First Step',
    nameFr: 'Premier Pas',
    description: 'Complete your first lesson',
    descriptionFr: 'Termine ta première leçon',
    iconName: 'star',
    category: 'progress',
    tier: 'bronze',
    unlockCondition: { type: 'lessons_completed', value: 1 },
  },
  {
    id: 'five-lessons',
    name: 'Apprentice',
    nameFr: 'Apprenti',
    description: 'Complete 5 lessons',
    descriptionFr: 'Termine 5 leçons',
    iconName: 'book',
    category: 'progress',
    tier: 'bronze',
    unlockCondition: { type: 'lessons_completed', value: 5 },
  },
  {
    id: 'ten-lessons',
    name: 'Student',
    nameFr: 'Étudiant',
    description: 'Complete 10 lessons',
    descriptionFr: 'Termine 10 leçons',
    iconName: 'graduation-cap',
    category: 'progress',
    tier: 'silver',
    unlockCondition: { type: 'lessons_completed', value: 10 },
  },
  {
    id: 'perfect-score',
    name: 'Perfect!',
    nameFr: 'Parfait !',
    description: 'Get 100% on a lesson',
    descriptionFr: 'Obtiens 100% sur une leçon',
    iconName: 'check-circle',
    category: 'mastery',
    tier: 'gold',
    unlockCondition: { type: 'perfect_lessons', value: 1 },
  },
  {
    id: 'streak-7',
    name: 'Perfect Week',
    nameFr: 'Semaine Parfaite',
    description: 'Maintain a 7-day streak',
    descriptionFr: 'Garde un streak de 7 jours',
    iconName: 'flame',
    category: 'streak',
    tier: 'silver',
    unlockCondition: { type: 'streak_days', value: 7 },
  },
  {
    id: 'streak-30',
    name: 'Monthly Champion',
    nameFr: 'Champion du Mois',
    description: 'Maintain a 30-day streak',
    descriptionFr: 'Garde un streak de 30 jours',
    iconName: 'trophy',
    category: 'streak',
    tier: 'gold',
    unlockCondition: { type: 'streak_days', value: 30 },
  },
  {
    id: 'basics-complete',
    name: 'Basics Expert',
    nameFr: 'Expert Débutant',
    description: 'Complete "The Basics" unit',
    descriptionFr: 'Termine l\'unité "Les Bases"',
    iconName: 'hand-wave',
    category: 'mastery',
    tier: 'bronze',
    unlockCondition: { type: 'unit_completed', value: 1, unitId: 'unit-1' },
  },
  {
    id: 'animals-complete',
    name: 'Animal Friend',
    nameFr: 'Ami des Animaux',
    description: 'Complete "Animals" unit',
    descriptionFr: 'Termine l\'unité "Les Animaux"',
    iconName: 'dog',
    category: 'mastery',
    tier: 'silver',
    unlockCondition: { type: 'unit_completed', value: 1, unitId: 'unit-3' },
  },
];

/**
 * Check and award badges based on achievements
 */
export const checkAndAwardBadges = async (
  child: Child,
  achievements: {
    lessonCompleted?: boolean;
    perfectScore?: boolean;
    newStreak?: number;
    totalLessonsCompleted?: number;
    unitCompleted?: string;
  }
): Promise<Badge[]> => {
  const earnedBadges: Badge[] = [];
  const existingBadges = child.badges || [];

  for (const badge of AVAILABLE_BADGES) {
    // Skip if already earned
    if (existingBadges.includes(badge.id)) continue;

    let earned = false;

    switch (badge.unlockCondition.type) {
      case 'lessons_completed':
        if (
          achievements.totalLessonsCompleted &&
          achievements.totalLessonsCompleted >= badge.unlockCondition.value
        ) {
          earned = true;
        }
        break;

      case 'perfect_lessons':
        if (achievements.perfectScore) {
          earned = true;
        }
        break;

      case 'streak_days':
        if (
          achievements.newStreak &&
          achievements.newStreak >= badge.unlockCondition.value
        ) {
          earned = true;
        }
        break;

      case 'unit_completed':
        if (badge.unlockCondition.unitId && achievements.unitCompleted === badge.unlockCondition.unitId) {
          earned = true;
        }
        break;
    }

    if (earned) {
      earnedBadges.push(badge);
    }
  }

  return earnedBadges;
};

// ============================================
// STATISTICS
// ============================================

export interface ChildStats {
  totalLessonsCompleted: number;
  totalXpEarned: number;
  averageScore: number;
  totalTimeSpent: number; // minutes
  strongestTopics: string[];
  weakestTopics: string[];
  currentStreak: number;
  longestStreak: number;
  perfectLessons: number;
}

/**
 * Get detailed statistics for a child
 */
export const getChildStats = async (childId: string): Promise<ChildStats> => {
  const progress = await getChildProgress(childId);

  const completedLessons = progress.filter(p => p.completed);
  const totalLessons = completedLessons.length;
  const totalScore = completedLessons.reduce((sum, p) => sum + p.bestScore, 0);
  const totalTime = progress.reduce((sum, p) => sum + p.timeSpent, 0);
  const perfectLessons = completedLessons.filter(p => p.bestScore === 100).length;

  // Aggregate mistakes by type
  const mistakesByType: Record<string, number> = {};
  for (const p of progress) {
    for (const [type, count] of Object.entries(p.mistakesByType || {})) {
      mistakesByType[type] = (mistakesByType[type] || 0) + count;
    }
  }

  // Sort topics by mistakes (weakest = most mistakes)
  const sortedTopics = Object.entries(mistakesByType)
    .sort(([, a], [, b]) => b - a)
    .map(([type]) => type);

  return {
    totalLessonsCompleted: totalLessons,
    totalXpEarned: totalLessons * 50, // Approximate
    averageScore: totalLessons > 0 ? Math.round(totalScore / totalLessons) : 0,
    totalTimeSpent: Math.round(totalTime / 60),
    strongestTopics: sortedTopics.slice(-3).reverse(),
    weakestTopics: sortedTopics.slice(0, 3),
    currentStreak: 0, // Retrieved from child document
    longestStreak: 0, // Would need separate tracking
    perfectLessons,
  };
};
