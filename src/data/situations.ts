// ============================================
// SITUATIONS DE JEU DE RÔLE
// ============================================
// Micro-situations conversationnelles pour l'apprentissage immersif
// Chaque situation = un scénario de 2-3 minutes avec un personnage IA

import type { Grade } from '../types';
import type { ChunkCategory } from './chunks';

export interface Situation {
  id: string;
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  location: SituationLocation;
  difficulty: 1 | 2 | 3;
  estimatedMinutes: number;
  categories: ChunkCategory[]; // Chunks utilisés dans cette situation
  character: Character;
  dialogueSteps: DialogueStep[];
  successCriteria: string[];
  badge?: string; // Badge à débloquer si réussi
}

export type SituationLocation =
  | 'restaurant'
  | 'airport'
  | 'school'
  | 'shop'
  | 'street'
  | 'home'
  | 'beach'
  | 'playground';

export interface Character {
  name: string;
  role: string;
  roleFr: string;
  avatar: string; // Phosphor icon name (e.g., 'chef', 'user-circle')
  avatarColor: string; // Tailwind color class
  personality: string;
}

export interface DialogueStep {
  id: string;
  order: number;
  characterSays: string;
  characterSaysFr: string;
  expectedResponses: ExpectedResponse[];
  hint?: string;
  hintFr?: string;
  isOptional?: boolean;
}

export interface ExpectedResponse {
  text: string;
  textFr: string;
  isCorrect: boolean;
  feedback?: string;
  feedbackFr?: string;
  nextStepId?: string;
}

// ============================================
// MINI-HISTOIRES POUR STORY MODE
// ============================================

export interface Story {
  id: string;
  title: string;
  titleFr: string;
  theme: string;
  difficulty: 1 | 2 | 3;
  panels: StoryPanel[];
  vocabulary: string[]; // Mots clés à retenir
  quiz?: StoryQuiz[];
}

export interface StoryPanel {
  id: string;
  order: number;
  imageDescription: string; // Pour génération ou description
  textEn: string;
  textFr: string;
  audioHighlights: string[]; // Mots à mettre en avant
  emotion?: 'happy' | 'sad' | 'surprised' | 'excited' | 'neutral';
}

export interface StoryQuiz {
  question: string;
  questionFr: string;
  options: string[];
  correctAnswer: string;
}

// ============================================
// SITUATIONS DATA
// ============================================

export const SITUATIONS: Situation[] = [
  // ========== RESTAURANT ==========
  {
    id: 'sit-restaurant-1',
    title: 'At the Restaurant',
    titleFr: 'Au Restaurant',
    description: 'Order your favorite food at a friendly restaurant',
    descriptionFr: 'Commande ton plat préféré dans un restaurant sympa',
    location: 'restaurant',
    difficulty: 2,
    estimatedMinutes: 3,
    categories: ['food', 'polite'],
    character: {
      name: 'Sam',
      role: 'Waiter',
      roleFr: 'Serveur',
      avatar: 'chef',
      avatarColor: 'bg-orange-100 text-orange-600',
      personality: 'Friendly and patient',
    },
    dialogueSteps: [
      {
        id: 'rest-1',
        order: 1,
        characterSays: 'Hello! Welcome to Sam\'s Diner. How are you today?',
        characterSaysFr: 'Bonjour ! Bienvenue chez Sam. Comment vas-tu aujourd\'hui ?',
        expectedResponses: [
          { text: 'I\'m fine, thank you!', textFr: 'Je vais bien, merci !', isCorrect: true },
          { text: 'Hello!', textFr: 'Bonjour !', isCorrect: true },
          { text: 'I\'m good!', textFr: 'Ça va !', isCorrect: true },
        ],
        hintFr: 'Réponds poliment à la salutation',
      },
      {
        id: 'rest-2',
        order: 2,
        characterSays: 'Great! What would you like to eat today?',
        characterSaysFr: 'Super ! Qu\'est-ce que tu voudrais manger ?',
        expectedResponses: [
          { text: 'I would like a pizza, please', textFr: 'Je voudrais une pizza, s\'il vous plaît', isCorrect: true },
          { text: 'Can I have a burger?', textFr: 'Est-ce que je peux avoir un burger ?', isCorrect: true },
          { text: 'I\'d like pasta', textFr: 'Je voudrais des pâtes', isCorrect: true },
        ],
        hintFr: 'Utilise "I would like..." ou "Can I have..."',
      },
      {
        id: 'rest-3',
        order: 3,
        characterSays: 'And what would you like to drink?',
        characterSaysFr: 'Et qu\'est-ce que tu voudrais boire ?',
        expectedResponses: [
          { text: 'Water, please', textFr: 'De l\'eau, s\'il vous plaît', isCorrect: true },
          { text: 'I would like orange juice', textFr: 'Je voudrais un jus d\'orange', isCorrect: true },
          { text: 'Can I have milk?', textFr: 'Est-ce que je peux avoir du lait ?', isCorrect: true },
        ],
        hintFr: 'Commande une boisson poliment',
      },
      {
        id: 'rest-4',
        order: 4,
        characterSays: 'Here you go! Enjoy your meal!',
        characterSaysFr: 'Voilà ! Bon appétit !',
        expectedResponses: [
          { text: 'Thank you!', textFr: 'Merci !', isCorrect: true },
          { text: 'Thanks!', textFr: 'Merci !', isCorrect: true },
        ],
        hintFr: 'Dis merci !',
      },
    ],
    successCriteria: ['Used polite expressions', 'Ordered food correctly', 'Said thank you'],
    badge: 'badge-restaurant-master',
  },

  // ========== AIRPORT ==========
  {
    id: 'sit-airport-1',
    title: 'At the Airport',
    titleFr: 'À l\'Aéroport',
    description: 'Check in for your flight and find your gate',
    descriptionFr: 'Enregistre-toi pour ton vol et trouve ta porte d\'embarquement',
    location: 'airport',
    difficulty: 3,
    estimatedMinutes: 3,
    categories: ['travel', 'polite', 'introductions'],
    character: {
      name: 'Emma',
      role: 'Airport Staff',
      roleFr: 'Agent d\'aéroport',
      avatar: 'airplane',
      avatarColor: 'bg-blue-100 text-blue-600',
      personality: 'Professional and helpful',
    },
    dialogueSteps: [
      {
        id: 'air-1',
        order: 1,
        characterSays: 'Good morning! Can I see your passport, please?',
        characterSaysFr: 'Bonjour ! Est-ce que je peux voir ton passeport ?',
        expectedResponses: [
          { text: 'Good morning! Here you go', textFr: 'Bonjour ! Voilà', isCorrect: true },
          { text: 'Hello! Yes, here it is', textFr: 'Bonjour ! Oui, le voici', isCorrect: true },
        ],
        hintFr: 'Salue et donne ton passeport',
      },
      {
        id: 'air-2',
        order: 2,
        characterSays: 'Thank you. What is your name?',
        characterSaysFr: 'Merci. Comment t\'appelles-tu ?',
        expectedResponses: [
          { text: 'My name is...', textFr: 'Je m\'appelle...', isCorrect: true },
          { text: 'I\'m...', textFr: 'Je suis...', isCorrect: true },
        ],
        hintFr: 'Dis ton nom',
      },
      {
        id: 'air-3',
        order: 3,
        characterSays: 'Where are you flying to today?',
        characterSaysFr: 'Où vas-tu en avion aujourd\'hui ?',
        expectedResponses: [
          { text: 'I\'m going to London', textFr: 'Je vais à Londres', isCorrect: true },
          { text: 'To New York', textFr: 'À New York', isCorrect: true },
          { text: 'I\'m flying to Spain', textFr: 'Je vais en Espagne', isCorrect: true },
        ],
        hintFr: 'Dis ta destination',
      },
      {
        id: 'air-4',
        order: 4,
        characterSays: 'Your gate is number 12. Go straight and turn left.',
        characterSaysFr: 'Ta porte est le numéro 12. Va tout droit et tourne à gauche.',
        expectedResponses: [
          { text: 'Thank you very much!', textFr: 'Merci beaucoup !', isCorrect: true },
          { text: 'Thanks! Goodbye!', textFr: 'Merci ! Au revoir !', isCorrect: true },
        ],
        hintFr: 'Remercie et dis au revoir',
      },
    ],
    successCriteria: ['Gave passport', 'Introduced yourself', 'Understood directions'],
    badge: 'badge-traveler',
  },

  // ========== SHOP ==========
  {
    id: 'sit-shop-1',
    title: 'At the Toy Shop',
    titleFr: 'Au Magasin de Jouets',
    description: 'Buy a present for your friend',
    descriptionFr: 'Achète un cadeau pour ton ami(e)',
    location: 'shop',
    difficulty: 2,
    estimatedMinutes: 3,
    categories: ['shopping', 'polite'],
    character: {
      name: 'Tom',
      role: 'Shop Assistant',
      roleFr: 'Vendeur',
      avatar: 'storefront',
      avatarColor: 'bg-green-100 text-green-600',
      personality: 'Cheerful and helpful',
    },
    dialogueSteps: [
      {
        id: 'shop-1',
        order: 1,
        characterSays: 'Hi there! Can I help you?',
        characterSaysFr: 'Salut ! Je peux t\'aider ?',
        expectedResponses: [
          { text: 'Yes, please. I\'m looking for a toy', textFr: 'Oui. Je cherche un jouet', isCorrect: true },
          { text: 'Hello! I need help', textFr: 'Bonjour ! J\'ai besoin d\'aide', isCorrect: true },
        ],
        hintFr: 'Dis ce que tu cherches',
      },
      {
        id: 'shop-2',
        order: 2,
        characterSays: 'What kind of toy? A teddy bear or a game?',
        characterSaysFr: 'Quel genre de jouet ? Un ours en peluche ou un jeu ?',
        expectedResponses: [
          { text: 'I would like a teddy bear', textFr: 'Je voudrais un ours en peluche', isCorrect: true },
          { text: 'A game, please', textFr: 'Un jeu, s\'il vous plaît', isCorrect: true },
        ],
        hintFr: 'Choisis ce que tu veux',
      },
      {
        id: 'shop-3',
        order: 3,
        characterSays: 'This one is very nice! It\'s 10 pounds.',
        characterSaysFr: 'Celui-ci est très joli ! Il coûte 10 livres.',
        expectedResponses: [
          { text: 'I\'ll take it!', textFr: 'Je le prends !', isCorrect: true },
          { text: 'How much is it?', textFr: 'Combien ça coûte ?', isCorrect: true },
        ],
        hintFr: 'Décide si tu veux l\'acheter',
      },
      {
        id: 'shop-4',
        order: 4,
        characterSays: 'Here you go! Have a nice day!',
        characterSaysFr: 'Voilà ! Passe une bonne journée !',
        expectedResponses: [
          { text: 'Thank you! Goodbye!', textFr: 'Merci ! Au revoir !', isCorrect: true },
          { text: 'Thanks! You too!', textFr: 'Merci ! Toi aussi !', isCorrect: true },
        ],
        hintFr: 'Dis merci et au revoir',
      },
    ],
    successCriteria: ['Asked for help', 'Chose a product', 'Completed purchase'],
    badge: 'badge-shopper',
  },

  // ========== SCHOOL/PLAYGROUND ==========
  {
    id: 'sit-playground-1',
    title: 'Making Friends',
    titleFr: 'Se Faire des Amis',
    description: 'Meet a new friend at school',
    descriptionFr: 'Rencontre un nouvel ami à l\'école',
    location: 'playground',
    difficulty: 1,
    estimatedMinutes: 2,
    categories: ['greetings', 'introductions'],
    character: {
      name: 'Lily',
      role: 'New Classmate',
      roleFr: 'Nouvelle camarade',
      avatar: 'student',
      avatarColor: 'bg-pink-100 text-pink-600',
      personality: 'Shy but friendly',
    },
    dialogueSteps: [
      {
        id: 'play-1',
        order: 1,
        characterSays: 'Hi! I\'m Lily. What\'s your name?',
        characterSaysFr: 'Salut ! Je m\'appelle Lily. Comment tu t\'appelles ?',
        expectedResponses: [
          { text: 'Hello! My name is...', textFr: 'Salut ! Je m\'appelle...', isCorrect: true },
          { text: 'Hi! I\'m...', textFr: 'Salut ! Je suis...', isCorrect: true },
        ],
        hintFr: 'Présente-toi !',
      },
      {
        id: 'play-2',
        order: 2,
        characterSays: 'Nice to meet you! How old are you?',
        characterSaysFr: 'Enchantée ! Quel âge as-tu ?',
        expectedResponses: [
          { text: 'I am 7 years old', textFr: 'J\'ai 7 ans', isCorrect: true },
          { text: 'I\'m 8', textFr: 'J\'ai 8 ans', isCorrect: true },
          { text: 'Nice to meet you too! I\'m 9', textFr: 'Enchanté(e) aussi ! J\'ai 9 ans', isCorrect: true },
        ],
        hintFr: 'Dis ton âge',
      },
      {
        id: 'play-3',
        order: 3,
        characterSays: 'Do you want to play with me?',
        characterSaysFr: 'Tu veux jouer avec moi ?',
        expectedResponses: [
          { text: 'Yes! I love it!', textFr: 'Oui ! J\'adore !', isCorrect: true },
          { text: 'Yes, please!', textFr: 'Oui, s\'il te plaît !', isCorrect: true },
        ],
        hintFr: 'Accepte l\'invitation',
      },
    ],
    successCriteria: ['Introduced yourself', 'Shared your age', 'Made a new friend'],
    badge: 'badge-friendly',
  },

  // ========== STREET/DIRECTIONS ==========
  {
    id: 'sit-street-1',
    title: 'Finding the Way',
    titleFr: 'Trouver son Chemin',
    description: 'Ask for directions to the park',
    descriptionFr: 'Demande ton chemin pour aller au parc',
    location: 'street',
    difficulty: 2,
    estimatedMinutes: 2,
    categories: ['travel', 'polite'],
    character: {
      name: 'Mr. Brown',
      role: 'Friendly Neighbor',
      roleFr: 'Voisin sympa',
      avatar: 'user',
      avatarColor: 'bg-amber-100 text-amber-600',
      personality: 'Kind and helpful',
    },
    dialogueSteps: [
      {
        id: 'str-1',
        order: 1,
        characterSays: 'Hello there! Are you lost?',
        characterSaysFr: 'Bonjour ! Tu es perdu(e) ?',
        expectedResponses: [
          { text: 'Hello! Yes, I\'m lost', textFr: 'Bonjour ! Oui, je suis perdu(e)', isCorrect: true },
          { text: 'Hi! Can you help me?', textFr: 'Salut ! Tu peux m\'aider ?', isCorrect: true },
        ],
        hintFr: 'Demande de l\'aide',
      },
      {
        id: 'str-2',
        order: 2,
        characterSays: 'Of course! Where do you want to go?',
        characterSaysFr: 'Bien sûr ! Où veux-tu aller ?',
        expectedResponses: [
          { text: 'Where is the park?', textFr: 'Où est le parc ?', isCorrect: true },
          { text: 'I\'m looking for the park', textFr: 'Je cherche le parc', isCorrect: true },
        ],
        hintFr: 'Dis où tu veux aller',
      },
      {
        id: 'str-3',
        order: 3,
        characterSays: 'Go straight, then turn right. It\'s next to the school.',
        characterSaysFr: 'Va tout droit, puis tourne à droite. C\'est à côté de l\'école.',
        expectedResponses: [
          { text: 'Thank you very much!', textFr: 'Merci beaucoup !', isCorrect: true },
          { text: 'Thanks! Goodbye!', textFr: 'Merci ! Au revoir !', isCorrect: true },
        ],
        hintFr: 'Remercie pour l\'aide',
      },
    ],
    successCriteria: ['Asked for help', 'Explained destination', 'Understood directions'],
    badge: 'badge-explorer',
  },
];

// ============================================
// STORIES DATA
// ============================================

export const STORIES: Story[] = [
  {
    id: 'story-1',
    title: 'Max\'s Morning',
    titleFr: 'La Matinée de Max',
    theme: 'daily routine',
    difficulty: 1,
    panels: [
      {
        id: 'panel-1',
        order: 1,
        imageDescription: 'A boy waking up in bed, sun shining through window',
        textEn: 'Good morning! Max wakes up.',
        textFr: 'Bonjour ! Max se réveille.',
        audioHighlights: ['Good morning', 'wakes up'],
        emotion: 'happy',
      },
      {
        id: 'panel-2',
        order: 2,
        imageDescription: 'Boy eating breakfast at table',
        textEn: 'Max is hungry. He eats breakfast.',
        textFr: 'Max a faim. Il prend son petit-déjeuner.',
        audioHighlights: ['hungry', 'eats', 'breakfast'],
        emotion: 'happy',
      },
      {
        id: 'panel-3',
        order: 3,
        imageDescription: 'Boy putting on backpack',
        textEn: '"Goodbye, Mom!" says Max.',
        textFr: '"Au revoir, Maman !" dit Max.',
        audioHighlights: ['Goodbye'],
        emotion: 'happy',
      },
      {
        id: 'panel-4',
        order: 4,
        imageDescription: 'Boy at school gate with friends',
        textEn: 'Max goes to school. "Hello!" he says to his friends.',
        textFr: 'Max va à l\'école. "Bonjour !" dit-il à ses amis.',
        audioHighlights: ['school', 'Hello', 'friends'],
        emotion: 'excited',
      },
    ],
    vocabulary: ['Good morning', 'Goodbye', 'Hello', 'hungry', 'school', 'friends'],
    quiz: [
      {
        question: 'What does Max eat?',
        questionFr: 'Qu\'est-ce que Max mange ?',
        options: ['Breakfast', 'Lunch', 'Dinner'],
        correctAnswer: 'Breakfast',
      },
      {
        question: 'Where does Max go?',
        questionFr: 'Où va Max ?',
        options: ['Park', 'School', 'Shop'],
        correctAnswer: 'School',
      },
    ],
  },
  {
    id: 'story-2',
    title: 'Emma at the Beach',
    titleFr: 'Emma à la Plage',
    theme: 'vacation',
    difficulty: 1,
    panels: [
      {
        id: 'panel-1',
        order: 1,
        imageDescription: 'Girl looking excited with suitcase',
        textEn: 'Emma is excited! She goes to the beach.',
        textFr: 'Emma est excitée ! Elle va à la plage.',
        audioHighlights: ['excited', 'beach'],
        emotion: 'excited',
      },
      {
        id: 'panel-2',
        order: 2,
        imageDescription: 'Girl on sunny beach with umbrella',
        textEn: 'It\'s sunny and hot. Emma loves it!',
        textFr: 'Il fait soleil et chaud. Emma adore !',
        audioHighlights: ['sunny', 'hot', 'loves'],
        emotion: 'happy',
      },
      {
        id: 'panel-3',
        order: 3,
        imageDescription: 'Girl building sandcastle',
        textEn: 'Emma builds a sandcastle. It\'s big!',
        textFr: 'Emma construit un château de sable. Il est grand !',
        audioHighlights: ['sandcastle', 'big'],
        emotion: 'happy',
      },
      {
        id: 'panel-4',
        order: 4,
        imageDescription: 'Girl eating ice cream',
        textEn: '"I\'m thirsty," says Emma. She eats ice cream.',
        textFr: '"J\'ai soif," dit Emma. Elle mange une glace.',
        audioHighlights: ['thirsty', 'ice cream'],
        emotion: 'happy',
      },
    ],
    vocabulary: ['beach', 'sunny', 'hot', 'thirsty', 'ice cream', 'big'],
    quiz: [
      {
        question: 'What does Emma build?',
        questionFr: 'Qu\'est-ce qu\'Emma construit ?',
        options: ['A house', 'A sandcastle', 'A tower'],
        correctAnswer: 'A sandcastle',
      },
      {
        question: 'What does Emma eat?',
        questionFr: 'Qu\'est-ce qu\'Emma mange ?',
        options: ['Pizza', 'Ice cream', 'Cake'],
        correctAnswer: 'Ice cream',
      },
    ],
  },
  {
    id: 'story-3',
    title: 'The Lost Dog',
    titleFr: 'Le Chien Perdu',
    theme: 'helping others',
    difficulty: 2,
    panels: [
      {
        id: 'panel-1',
        order: 1,
        imageDescription: 'Boy finding a lost puppy in the park',
        textEn: 'Tom finds a little dog in the park. "Are you lost?"',
        textFr: 'Tom trouve un petit chien dans le parc. "Tu es perdu ?"',
        audioHighlights: ['dog', 'park', 'lost'],
        emotion: 'surprised',
      },
      {
        id: 'panel-2',
        order: 2,
        imageDescription: 'Boy looking at dog collar with name tag',
        textEn: 'The dog\'s name is Buddy. Tom reads the collar.',
        textFr: 'Le chien s\'appelle Buddy. Tom lit le collier.',
        audioHighlights: ['name', 'Buddy', 'reads'],
        emotion: 'neutral',
      },
      {
        id: 'panel-3',
        order: 3,
        imageDescription: 'Boy asking woman if she knows the dog',
        textEn: '"Excuse me, do you know this dog?" Tom asks.',
        textFr: '"Excusez-moi, vous connaissez ce chien ?" demande Tom.',
        audioHighlights: ['Excuse me', 'know'],
        emotion: 'neutral',
      },
      {
        id: 'panel-4',
        order: 4,
        imageDescription: 'Happy girl hugging the dog, thanking the boy',
        textEn: '"That\'s my dog! Thank you so much!" says a happy girl.',
        textFr: '"C\'est mon chien ! Merci beaucoup !" dit une fille contente.',
        audioHighlights: ['Thank you', 'so much', 'happy'],
        emotion: 'happy',
      },
    ],
    vocabulary: ['dog', 'lost', 'name', 'Excuse me', 'Thank you', 'happy'],
    quiz: [
      {
        question: 'What is the dog\'s name?',
        questionFr: 'Comment s\'appelle le chien ?',
        options: ['Max', 'Buddy', 'Rex'],
        correctAnswer: 'Buddy',
      },
      {
        question: 'Where does Tom find the dog?',
        questionFr: 'Où Tom trouve-t-il le chien ?',
        options: ['At school', 'In the park', 'At home'],
        correctAnswer: 'In the park',
      },
    ],
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get situations by difficulty
 */
export const getSituationsForGrade = (grade: Grade): Situation[] => {
  const maxDifficulty = grade === 'CP' || grade === 'CE1' ? 1
    : grade === 'CE2' ? 2
    : 3;

  return SITUATIONS.filter(s => s.difficulty <= maxDifficulty);
};

/**
 * Get situations by location
 */
export const getSituationsByLocation = (location: SituationLocation): Situation[] => {
  return SITUATIONS.filter(s => s.location === location);
};

/**
 * Get stories by difficulty
 */
export const getStoriesForGrade = (grade: Grade): Story[] => {
  const maxDifficulty = grade === 'CP' || grade === 'CE1' ? 1
    : grade === 'CE2' ? 2
    : 3;

  return STORIES.filter(s => s.difficulty <= maxDifficulty);
};

/**
 * Get random situation for practice
 */
export const getRandomSituation = (grade: Grade, excludeIds: string[] = []): Situation | null => {
  const available = getSituationsForGrade(grade).filter(s => !excludeIds.includes(s.id));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
};

/**
 * Get random story for practice
 */
export const getRandomStory = (grade: Grade, excludeIds: string[] = []): Story | null => {
  const available = getStoriesForGrade(grade).filter(s => !excludeIds.includes(s.id));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
};

// Location labels for UI - icon names refer to Phosphor icons
export const LOCATION_LABELS: Record<SituationLocation, { en: string; fr: string; icon: string; iconColor: string }> = {
  restaurant: { en: 'Restaurant', fr: 'Restaurant', icon: 'fork-knife', iconColor: 'text-orange-500' },
  airport: { en: 'Airport', fr: 'Aéroport', icon: 'airplane-takeoff', iconColor: 'text-blue-500' },
  school: { en: 'School', fr: 'École', icon: 'graduation-cap', iconColor: 'text-indigo-500' },
  shop: { en: 'Shop', fr: 'Magasin', icon: 'shopping-bag', iconColor: 'text-green-500' },
  street: { en: 'Street', fr: 'Rue', icon: 'map-pin', iconColor: 'text-red-500' },
  home: { en: 'Home', fr: 'Maison', icon: 'house', iconColor: 'text-amber-500' },
  beach: { en: 'Beach', fr: 'Plage', icon: 'sun', iconColor: 'text-yellow-500' },
  playground: { en: 'Playground', fr: 'Cour de récré', icon: 'basketball', iconColor: 'text-pink-500' },
};
