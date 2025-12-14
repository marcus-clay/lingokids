import { Lesson, UserProgress, UserProfile } from './types';

// Initial state for a new user
export const INITIAL_USER_PROGRESS: UserProgress = {
  xp: 0,
  streak: 0,
  level: 1,
  lessonsCompleted: 0,
  gems: 0
};

// Profiles configuration
export const PROFILES: UserProfile[] = [
  { id: 'parent', name: 'Parent', role: 'PARENT', avatarColor: 'bg-gray-800' },
  { id: 'gilberto', name: 'Gilberto', role: 'CHILD', age: 9, grade: 'CM1', avatarColor: 'bg-blue-500' },
  { id: 'mila', name: 'Mila', role: 'CHILD', age: 10, grade: 'CM2', avatarColor: 'bg-purple-500' },
  { id: 'eva', name: 'Eva', role: 'CHILD', age: 8, grade: 'CE2', avatarColor: 'bg-pink-500' },
];

// Initial lessons - mostly locked
export const INITIAL_LESSONS: Lesson[] = [
  {
    id: 'u1-l1',
    title: 'Hello & Welcome',
    description: 'Learn basic greetings',
    type: 'VOCABULARY',
    locked: false,
    completed: false,
    stars: 0
  },
  {
    id: 'u1-l2',
    title: 'My Family',
    description: 'Mom, Dad, and siblings',
    type: 'VOCABULARY',
    locked: true,
    completed: false,
    stars: 0
  },
  {
    id: 'u1-l3',
    title: 'Colors of the Rainbow',
    description: 'Red, Blue, Green...',
    type: 'VOCABULARY',
    locked: true,
    completed: false,
    stars: 0
  },
  {
    id: 'u1-l4',
    title: 'The Cat and the Mouse',
    description: 'A short story',
    type: 'STORY',
    locked: true,
    completed: false,
    stars: 0
  },
  {
    id: 'u1-l5',
    title: 'Present Simple',
    description: 'I like, You like...',
    type: 'GRAMMAR',
    locked: true,
    completed: false,
    stars: 0
  },
  {
    id: 'u1-l6',
    title: 'Farm Animals',
    description: 'Cow, pig, chicken...',
    type: 'VOCABULARY',
    locked: false,
    completed: false,
    stars: 0
  }
];

export const PARENT_STATS = [
  { label: 'Time Spent', value: '0h 0m', trend: '--' },
  { label: 'Words Learned', value: '0', trend: '--' },
  { label: 'Accuracy', value: '0%', trend: '--' },
];