import type { Unit, Lesson, Grade } from '../types';

// ============================================
// SEED DATA - UNITS & LESSONS
// ============================================

export const UNITS: Unit[] = [
  {
    id: 'unit-1',
    order: 1,
    title: 'The Basics',
    titleFr: 'Les Bases',
    description: 'Learn essential greetings and introductions',
    descriptionFr: 'Apprends les salutations essentielles et à te présenter',
    gradeLevel: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'],
    theme: 'introduction',
    iconName: 'hand-wave',
    colorTheme: 'blue',
    totalLessons: 5,
    badgeReward: 'badge-basics',
  },
  {
    id: 'unit-2',
    order: 2,
    title: 'My World',
    titleFr: 'Mon Monde',
    description: 'Family, colors, and numbers',
    descriptionFr: 'La famille, les couleurs et les nombres',
    gradeLevel: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'],
    theme: 'family-colors-numbers',
    iconName: 'home',
    colorTheme: 'purple',
    totalLessons: 5,
    badgeReward: 'badge-my-world',
  },
  {
    id: 'unit-3',
    order: 3,
    title: 'Animals',
    titleFr: 'Les Animaux',
    description: 'Discover pets and farm animals',
    descriptionFr: 'Découvre les animaux domestiques et de la ferme',
    gradeLevel: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'],
    theme: 'animals',
    iconName: 'dog',
    colorTheme: 'orange',
    totalLessons: 4,
    badgeReward: 'badge-animals',
  },
  {
    id: 'unit-4',
    order: 4,
    title: 'My Body',
    titleFr: 'Mon Corps',
    description: 'Learn body parts and actions',
    descriptionFr: 'Apprends les parties du corps et les actions',
    gradeLevel: ['CE1', 'CE2', 'CM1', 'CM2'],
    theme: 'body',
    iconName: 'body',
    colorTheme: 'pink',
    totalLessons: 4,
    badgeReward: 'badge-body',
  },
  {
    id: 'unit-5',
    order: 5,
    title: 'Food & Drinks',
    titleFr: 'Nourriture',
    description: 'Express likes and dislikes about food',
    descriptionFr: 'Exprime ce que tu aimes manger et boire',
    gradeLevel: ['CE1', 'CE2', 'CM1', 'CM2'],
    theme: 'food',
    iconName: 'apple',
    colorTheme: 'green',
    totalLessons: 4,
    badgeReward: 'badge-food',
  },
];

// Helper function to get CEFR level based on grade
const getCEFRLevel = (grade: Grade) => {
  switch (grade) {
    case 'CP': return 'eveil' as const;
    case 'CE1': return 'pre-A1' as const;
    case 'CE2': return 'pre-A1' as const;
    case 'CM1': return 'A1' as const;
    case 'CM2': return 'A1+' as const;
    default: return 'A1' as const;
  }
};

// Generate lessons for each grade level
export const generateLessonsForGrade = (grade: Grade): Lesson[] => {
  const cefrLevel = getCEFRLevel(grade);
  const lessons: Lesson[] = [];

  // Unit 1: The Basics
  lessons.push(
    {
      id: `${grade}-u1-l1`,
      unitId: 'unit-1',
      order: 1,
      title: 'Hello & Goodbye',
      titleFr: 'Bonjour et Au revoir',
      description: 'Learn to greet people in English',
      descriptionFr: 'Apprends à saluer les gens en anglais',
      type: 'VOCABULARY',
      gradeLevel: grade,
      cefrLevel,
      topic: 'greetings',
      objectives: ['Say hello and goodbye', 'Use polite greetings'],
      prerequisites: [],
      estimatedMinutes: 10,
      xpReward: 50,
      isLocked: false,
    },
    {
      id: `${grade}-u1-l2`,
      unitId: 'unit-1',
      order: 2,
      title: "What's your name?",
      titleFr: 'Comment tu t\'appelles ?',
      description: 'Introduce yourself in English',
      descriptionFr: 'Présente-toi en anglais',
      type: 'VOCABULARY',
      gradeLevel: grade,
      cefrLevel,
      topic: 'introductions',
      objectives: ['Ask someone\'s name', 'Say your name'],
      prerequisites: [`${grade}-u1-l1`],
      estimatedMinutes: 10,
      xpReward: 50,
      isLocked: true,
    },
    {
      id: `${grade}-u1-l3`,
      unitId: 'unit-1',
      order: 3,
      title: 'How are you?',
      titleFr: 'Comment vas-tu ?',
      description: 'Ask and answer about feelings',
      descriptionFr: 'Demande et réponds sur les sentiments',
      type: 'VOCABULARY',
      gradeLevel: grade,
      cefrLevel,
      topic: 'feelings',
      objectives: ['Ask how someone is', 'Express how you feel'],
      prerequisites: [`${grade}-u1-l2`],
      estimatedMinutes: 12,
      xpReward: 60,
      isLocked: true,
    },
    {
      id: `${grade}-u1-l4`,
      unitId: 'unit-1',
      order: 4,
      title: 'Please & Thank you',
      titleFr: 'S\'il te plaît et Merci',
      description: 'Learn polite expressions',
      descriptionFr: 'Apprends les expressions de politesse',
      type: 'VOCABULARY',
      gradeLevel: grade,
      cefrLevel,
      topic: 'polite expressions',
      objectives: ['Use please and thank you', 'Be polite in English'],
      prerequisites: [`${grade}-u1-l3`],
      estimatedMinutes: 10,
      xpReward: 50,
      isLocked: true,
    },
    {
      id: `${grade}-u1-l5`,
      unitId: 'unit-1',
      order: 5,
      title: 'Review: The Basics',
      titleFr: 'Révision : Les Bases',
      description: 'Practice all greetings and introductions',
      descriptionFr: 'Pratique toutes les salutations',
      type: 'REVIEW',
      gradeLevel: grade,
      cefrLevel,
      topic: 'greetings review',
      objectives: ['Review all vocabulary', 'Practice conversations'],
      prerequisites: [`${grade}-u1-l4`],
      estimatedMinutes: 15,
      xpReward: 80,
      isLocked: true,
    }
  );

  // Unit 2: My World
  lessons.push(
    {
      id: `${grade}-u2-l1`,
      unitId: 'unit-2',
      order: 1,
      title: 'My Family',
      titleFr: 'Ma Famille',
      description: 'Learn family member words',
      descriptionFr: 'Apprends les mots de la famille',
      type: 'VOCABULARY',
      gradeLevel: grade,
      cefrLevel,
      topic: 'family members',
      objectives: ['Name family members', 'Describe your family'],
      prerequisites: [`${grade}-u1-l5`],
      estimatedMinutes: 12,
      xpReward: 60,
      isLocked: true,
    },
    {
      id: `${grade}-u2-l2`,
      unitId: 'unit-2',
      order: 2,
      title: 'Colors',
      titleFr: 'Les Couleurs',
      description: 'Learn color words in English',
      descriptionFr: 'Apprends les couleurs en anglais',
      type: 'VOCABULARY',
      gradeLevel: grade,
      cefrLevel,
      topic: 'colors',
      objectives: ['Name all basic colors', 'Describe objects by color'],
      prerequisites: [`${grade}-u2-l1`],
      estimatedMinutes: 10,
      xpReward: 50,
      isLocked: true,
    },
    {
      id: `${grade}-u2-l3`,
      unitId: 'unit-2',
      order: 3,
      title: 'Numbers 1-10',
      titleFr: 'Les Nombres 1-10',
      description: 'Count from 1 to 10',
      descriptionFr: 'Compte de 1 à 10',
      type: 'VOCABULARY',
      gradeLevel: grade,
      cefrLevel,
      topic: 'numbers 1-10',
      objectives: ['Count to 10', 'Recognize written numbers'],
      prerequisites: [`${grade}-u2-l2`],
      estimatedMinutes: 12,
      xpReward: 60,
      isLocked: true,
    },
    {
      id: `${grade}-u2-l4`,
      unitId: 'unit-2',
      order: 4,
      title: 'Numbers 11-20',
      titleFr: 'Les Nombres 11-20',
      description: 'Count from 11 to 20',
      descriptionFr: 'Compte de 11 à 20',
      type: 'VOCABULARY',
      gradeLevel: grade,
      cefrLevel,
      topic: 'numbers 11-20',
      objectives: ['Count to 20', 'Use numbers in sentences'],
      prerequisites: [`${grade}-u2-l3`],
      estimatedMinutes: 12,
      xpReward: 60,
      isLocked: true,
    },
    {
      id: `${grade}-u2-l5`,
      unitId: 'unit-2',
      order: 5,
      title: 'Review: My World',
      titleFr: 'Révision : Mon Monde',
      description: 'Practice family, colors, and numbers',
      descriptionFr: 'Pratique la famille, les couleurs et les nombres',
      type: 'REVIEW',
      gradeLevel: grade,
      cefrLevel,
      topic: 'my world review',
      objectives: ['Review all vocabulary', 'Combine knowledge'],
      prerequisites: [`${grade}-u2-l4`],
      estimatedMinutes: 15,
      xpReward: 80,
      isLocked: true,
    }
  );

  // Unit 3: Animals
  lessons.push(
    {
      id: `${grade}-u3-l1`,
      unitId: 'unit-3',
      order: 1,
      title: 'Pets',
      titleFr: 'Les Animaux de Compagnie',
      description: 'Learn about common pets',
      descriptionFr: 'Apprends les animaux de compagnie',
      type: 'VOCABULARY',
      gradeLevel: grade,
      cefrLevel,
      topic: 'pets',
      objectives: ['Name common pets', 'Describe pets'],
      prerequisites: [`${grade}-u2-l5`],
      estimatedMinutes: 12,
      xpReward: 60,
      isLocked: true,
    },
    {
      id: `${grade}-u3-l2`,
      unitId: 'unit-3',
      order: 2,
      title: 'Farm Animals',
      titleFr: 'Les Animaux de la Ferme',
      description: 'Discover farm animals',
      descriptionFr: 'Découvre les animaux de la ferme',
      type: 'VOCABULARY',
      gradeLevel: grade,
      cefrLevel,
      topic: 'farm animals',
      objectives: ['Name farm animals', 'Learn animal sounds'],
      prerequisites: [`${grade}-u3-l1`],
      estimatedMinutes: 12,
      xpReward: 60,
      isLocked: true,
    },
    {
      id: `${grade}-u3-l3`,
      unitId: 'unit-3',
      order: 3,
      title: 'Wild Animals',
      titleFr: 'Les Animaux Sauvages',
      description: 'Learn about wild animals',
      descriptionFr: 'Apprends les animaux sauvages',
      type: 'VOCABULARY',
      gradeLevel: grade,
      cefrLevel,
      topic: 'wild animals',
      objectives: ['Name wild animals', 'Describe animal features'],
      prerequisites: [`${grade}-u3-l2`],
      estimatedMinutes: 12,
      xpReward: 60,
      isLocked: true,
    },
    {
      id: `${grade}-u3-l4`,
      unitId: 'unit-3',
      order: 4,
      title: 'Review: Animals',
      titleFr: 'Révision : Les Animaux',
      description: 'Practice all animal vocabulary',
      descriptionFr: 'Pratique tout le vocabulaire des animaux',
      type: 'REVIEW',
      gradeLevel: grade,
      cefrLevel,
      topic: 'animals review',
      objectives: ['Review all animals', 'Animal quiz'],
      prerequisites: [`${grade}-u3-l3`],
      estimatedMinutes: 15,
      xpReward: 80,
      isLocked: true,
    }
  );

  return lessons;
};

// Get all lessons for a specific grade
export const getLessonsForGrade = (grade: Grade): Lesson[] => {
  return generateLessonsForGrade(grade);
};

// Get a specific lesson by ID
export const getLessonById = (lessonId: string, grade: Grade): Lesson | undefined => {
  const lessons = getLessonsForGrade(grade);
  return lessons.find(l => l.id === lessonId);
};

// Get lessons for a specific unit
export const getLessonsForUnit = (unitId: string, grade: Grade): Lesson[] => {
  const lessons = getLessonsForGrade(grade);
  return lessons.filter(l => l.unitId === unitId);
};

// Check if a lesson is unlocked based on progress
export const isLessonUnlocked = (
  lesson: Lesson,
  completedLessonIds: string[]
): boolean => {
  if (lesson.order === 1 && lesson.unitId === 'unit-1') {
    return true; // First lesson is always unlocked
  }
  return lesson.prerequisites.every(prereqId => completedLessonIds.includes(prereqId));
};

// Get the next available lesson
export const getNextLesson = (
  currentLessonId: string,
  grade: Grade
): Lesson | undefined => {
  const lessons = getLessonsForGrade(grade);
  const currentIndex = lessons.findIndex(l => l.id === currentLessonId);

  if (currentIndex === -1 || currentIndex === lessons.length - 1) {
    return undefined;
  }

  return lessons[currentIndex + 1];
};
