export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  LESSON = 'LESSON',
  PARENT_PORTAL = 'PARENT_PORTAL',
  AI_TUTOR = 'AI_TUTOR'
}

export interface UserProfile {
  id: string;
  name: string;
  role: 'PARENT' | 'CHILD';
  age?: number;
  grade?: 'CE1' | 'CE2' | 'CM1' | 'CM2';
  avatarColor: string;
}

export interface UserProgress {
  xp: number;
  streak: number;
  level: number;
  lessonsCompleted: number;
  gems: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  type: 'VOCABULARY' | 'GRAMMAR' | 'STORY';
  locked: boolean;
  completed: boolean;
  stars: number; // 0-3
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isAudio?: boolean;
}

export interface Exercise {
  question: string;
  options?: string[];
  correctAnswer: string;
  type: 'multiple-choice' | 'translate' | 'speak' | 'word-order';
  // For word-order exercises
  words?: string[];
  correctOrder?: string[];
}