export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  LESSON = 'LESSON',
  PARENT_PORTAL = 'PARENT_PORTAL',
  AI_TUTOR = 'AI_TUTOR'
}

export type Grade = 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2';

export interface GradeInfo {
  grade: Grade;
  age: number;
  label: string;
}

export const GRADES: GradeInfo[] = [
  { grade: 'CP', age: 6, label: 'CP' },
  { grade: 'CE1', age: 7, label: 'CE1' },
  { grade: 'CE2', age: 8, label: 'CE2' },
  { grade: 'CM1', age: 9, label: 'CM1' },
  { grade: 'CM2', age: 10, label: 'CM2' },
];

export const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-red-500',
  'bg-teal-500',
  'bg-indigo-500',
];

export interface UserProfile {
  id: string;
  name: string;
  role: 'PARENT' | 'CHILD';
  age?: number;
  grade?: Grade;
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
  type: 'multiple-choice' | 'translate' | 'speak';
}