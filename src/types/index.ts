// ============================================
// TYPES PRINCIPAUX - LingoKids English v2.0
// ============================================

// ----- AUTHENTICATION & USERS -----

export type UserRole = 'ADMIN' | 'PARENT';
export type Grade = 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2';
export type CEFRLevel = 'eveil' | 'pre-A1' | 'A1' | 'A1+';
export type SubscriptionPlan = 'free' | 'premium';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  photoURL?: string;
  familyId: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface Family {
  id: string;
  parentId: string;
  createdAt: Date;
  subscription: SubscriptionPlan;
  settings: FamilySettings;
}

export interface FamilySettings {
  dailyGoalMinutes: number;
  notificationsEnabled: boolean;
  parentPinEnabled: boolean;
  parentPin?: string;
}

export interface Child {
  id: string;
  familyId: string;
  name: string;
  avatarColor: string;
  avatarCustomization: AvatarCustomization;
  grade: Grade;
  birthYear: number | null;
  createdAt: Date;

  // Progression
  level: number;
  xp: number;
  totalXp: number;
  streak: number;
  lastActivityDate: Date | null;
  gems: number;
  lives: number;
  livesLastRegenAt: Date;

  // Achievements
  badges: string[];
  unlockedRewards: string[];

  // Settings
  settings: ChildSettings;

  // Onboarding
  hasCompletedOnboarding: boolean;
  levelTestScore: number | null;
}

export interface AvatarCustomization {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  eyes: string;
  mouth?: string;
  eyebrows?: string;
  accessories: string[];
  outfit: string;
}

export interface ChildSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  voiceSpeed: 'slow' | 'normal' | 'fast';
  showHints: boolean;
}

// ----- LESSONS & CONTENT -----

export type LessonType = 'VOCABULARY' | 'GRAMMAR' | 'STORY' | 'LISTENING' | 'SPEAKING' | 'REVIEW';
export type ExerciseType = 'multiple-choice' | 'fill-blank' | 'match' | 'listen-select' | 'speak' | 'order-words' | 'image-select';

export interface Unit {
  id: string;
  order: number;
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  gradeLevel: Grade[];
  theme: string;
  iconName: string;
  colorTheme: string;
  totalLessons: number;
  badgeReward?: string;
}

export interface Lesson {
  id: string;
  unitId: string;
  order: number;
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  type: LessonType;
  gradeLevel: Grade;
  cefrLevel: CEFRLevel;
  topic: string;
  objectives: string[];
  prerequisites: string[];
  estimatedMinutes: number;
  xpReward: number;
  isLocked?: boolean;
}

export interface LessonContent {
  lessonId: string;
  introduction: LessonIntroduction;
  exercises: Exercise[];
  summary: LessonSummary;
  generatedAt: Date;
  generatedBy: 'template' | 'ai' | 'hybrid';
}

export interface LessonIntroduction {
  welcomeTextFr: string;
  objectiveFr: string;
  vocabulary: VocabularyItem[];
  funFact?: string;
  audioUrlFr?: string;
}

export interface VocabularyItem {
  word: string;
  translation: string;
  phonetic?: string;
  example?: string;
  audioUrl?: string;
  imageUrl?: string;
}

export interface Exercise {
  id: string;
  order: number;
  type: ExerciseType;
  questionEn: string;
  questionFr?: string;
  audioUrlEn?: string;
  imageUrl?: string;
  options?: string[];
  correctAnswer: string | string[];
  explanationFr: string;
  hints: string[];
  xpReward: number;
}

export interface LessonSummary {
  congratsTextFr: string;
  keyPointsFr: string[];
  practiceWords: string[];
  nextLessonTeaser?: string;
}

// ----- PROGRESS & STATS -----

export interface LessonProgress {
  lessonId: string;
  childId: string;
  completed: boolean;
  stars: number; // 0-3
  bestScore: number; // 0-100
  attempts: number;
  totalTimeSpent: number; // seconds
  lastAttemptAt: Date | null;
  completedAt: Date | null;
  exerciseResults: ExerciseResult[];
}

export interface ExerciseResult {
  exerciseId: string;
  correct: boolean;
  selectedAnswer: string | string[];
  timeSpent: number; // seconds
  hintsUsed: number;
}

export interface ChildStats {
  totalLessonsCompleted: number;
  totalXpEarned: number;
  totalTimeSpent: number; // minutes
  averageAccuracy: number; // 0-100
  wordsLearned: number;
  currentStreak: number;
  longestStreak: number;
  perfectLessons: number;
  favoriteCategory: LessonType | null;
  weeklyActivity: DailyActivity[];
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  lessonsCompleted: number;
  xpEarned: number;
  timeSpent: number; // minutes
}

// ----- GAMIFICATION -----

export interface DailyChallenge {
  id: string;
  type: 'complete-lesson' | 'perfect-score' | 'streak' | 'time-bonus' | 'vocabulary';
  titleFr: string;
  descriptionFr: string;
  target: number;
  current: number;
  xpReward: number;
  gemsReward: number;
  completed: boolean;
  expiresAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  nameFr: string;
  description: string;
  descriptionFr: string;
  iconName: string;
  category: 'progress' | 'streak' | 'mastery' | 'special';
  tier: 'bronze' | 'silver' | 'gold';
  unlockCondition: BadgeCondition;
}

export interface BadgeCondition {
  type: 'lessons_completed' | 'streak_days' | 'perfect_lessons' | 'xp_earned' | 'words_learned' | 'unit_completed';
  value: number;
  unitId?: string;
}

export interface Reward {
  id: string;
  type: 'avatar-item' | 'theme' | 'pet' | 'badge';
  category: string;
  name: string;
  nameFr: string;
  description: string;
  imageUrl: string;
  gemsCost: number;
  unlockCondition?: BadgeCondition;
  isLimited?: boolean;
}

export interface LeaderboardEntry {
  childId: string;
  childName: string;
  avatarColor: string;
  xpThisWeek: number;
  rank: number;
}

// ----- UI STATE -----

export type AppView =
  | 'AUTH'
  | 'ONBOARDING'
  | 'PROFILE_SELECT'
  | 'DASHBOARD'
  | 'LESSON_INTRO'
  | 'LESSON_EXERCISE'
  | 'LESSON_COMPLETE'
  | 'ACHIEVEMENTS'
  | 'SHOP'
  | 'PROFILE'
  | 'PARENT_PORTAL'
  | 'SETTINGS';

export interface OnboardingState {
  step: 'welcome' | 'add-child' | 'level-test' | 'avatar' | 'first-lesson' | 'complete';
  childData?: Partial<Child>;
  testAnswers?: Record<string, string>;
}

export interface LessonState {
  lessonId: string;
  content: LessonContent | null;
  currentPhase: 'intro' | 'exercise' | 'feedback' | 'summary';
  currentExerciseIndex: number;
  answers: Record<string, string | string[]>;
  score: number;
  mistakes: number;
  startTime: Date;
  livesRemaining: number;
}

// ----- API RESPONSES -----

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthResult {
  user: User;
  family: Family;
  children: Child[];
  isNewUser: boolean;
}
