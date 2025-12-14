// ============================================
// CHUNKS LEXICAUX - Expressions Clés par Thème
// ============================================
// Approche: Enseigner des expressions entières, pas de règles grammaticales
// Les enfants apprennent "I would like" pas "conditional + infinitive"

import type { Grade } from '../types';

export interface Chunk {
  id: string;
  english: string;
  french: string;
  phonetic: string;
  category: ChunkCategory;
  difficulty: 1 | 2 | 3; // 1=CP/CE1, 2=CE2, 3=CM1/CM2
  context: string; // Situation d'usage
  variations?: string[]; // Variantes de la même expression
  audioUrl?: string;
}

export type ChunkCategory =
  | 'greetings'
  | 'introductions'
  | 'food'
  | 'travel'
  | 'school'
  | 'feelings'
  | 'shopping'
  | 'family'
  | 'time'
  | 'polite';

export const CHUNKS: Chunk[] = [
  // ========== GREETINGS (Salutations) ==========
  {
    id: 'greet-1',
    english: 'Hello!',
    french: 'Bonjour !',
    phonetic: '/həˈloʊ/',
    category: 'greetings',
    difficulty: 1,
    context: 'Pour dire bonjour à quelqu\'un',
    variations: ['Hi!', 'Hey!'],
  },
  {
    id: 'greet-2',
    english: 'Good morning!',
    french: 'Bonjour ! (le matin)',
    phonetic: '/ɡʊd ˈmɔːrnɪŋ/',
    category: 'greetings',
    difficulty: 1,
    context: 'Le matin, avant midi',
  },
  {
    id: 'greet-3',
    english: 'Good afternoon!',
    french: 'Bonjour ! (l\'après-midi)',
    phonetic: '/ɡʊd ˌæftərˈnuːn/',
    category: 'greetings',
    difficulty: 2,
    context: 'L\'après-midi',
  },
  {
    id: 'greet-4',
    english: 'Good evening!',
    french: 'Bonsoir !',
    phonetic: '/ɡʊd ˈiːvnɪŋ/',
    category: 'greetings',
    difficulty: 2,
    context: 'Le soir',
  },
  {
    id: 'greet-5',
    english: 'Goodbye!',
    french: 'Au revoir !',
    phonetic: '/ɡʊdˈbaɪ/',
    category: 'greetings',
    difficulty: 1,
    context: 'Pour dire au revoir',
    variations: ['Bye!', 'See you!', 'See you later!'],
  },
  {
    id: 'greet-6',
    english: 'Good night!',
    french: 'Bonne nuit !',
    phonetic: '/ɡʊd naɪt/',
    category: 'greetings',
    difficulty: 1,
    context: 'Avant d\'aller dormir',
  },
  {
    id: 'greet-7',
    english: 'How are you?',
    french: 'Comment vas-tu ?',
    phonetic: '/haʊ ɑːr juː/',
    category: 'greetings',
    difficulty: 1,
    context: 'Pour demander comment ça va',
    variations: ['How are you doing?', 'How\'s it going?'],
  },
  {
    id: 'greet-8',
    english: 'I\'m fine, thank you!',
    french: 'Je vais bien, merci !',
    phonetic: '/aɪm faɪn θæŋk juː/',
    category: 'greetings',
    difficulty: 1,
    context: 'Réponse à "How are you?"',
    variations: ['I\'m good!', 'I\'m great!', 'I\'m okay'],
  },

  // ========== INTRODUCTIONS (Se présenter) ==========
  {
    id: 'intro-1',
    english: 'My name is...',
    french: 'Je m\'appelle...',
    phonetic: '/maɪ neɪm ɪz/',
    category: 'introductions',
    difficulty: 1,
    context: 'Pour dire son prénom',
    variations: ['I\'m...'],
  },
  {
    id: 'intro-2',
    english: 'What\'s your name?',
    french: 'Comment tu t\'appelles ?',
    phonetic: '/wɒts jɔːr neɪm/',
    category: 'introductions',
    difficulty: 1,
    context: 'Pour demander le prénom de quelqu\'un',
  },
  {
    id: 'intro-3',
    english: 'Nice to meet you!',
    french: 'Enchanté(e) !',
    phonetic: '/naɪs tuː miːt juː/',
    category: 'introductions',
    difficulty: 1,
    context: 'Quand on rencontre quelqu\'un pour la première fois',
  },
  {
    id: 'intro-4',
    english: 'I am ... years old',
    french: 'J\'ai ... ans',
    phonetic: '/aɪ æm ... jɪərz oʊld/',
    category: 'introductions',
    difficulty: 1,
    context: 'Pour dire son âge',
  },
  {
    id: 'intro-5',
    english: 'How old are you?',
    french: 'Quel âge as-tu ?',
    phonetic: '/haʊ oʊld ɑːr juː/',
    category: 'introductions',
    difficulty: 1,
    context: 'Pour demander l\'âge de quelqu\'un',
  },
  {
    id: 'intro-6',
    english: 'I am from France',
    french: 'Je viens de France',
    phonetic: '/aɪ æm frɒm fræns/',
    category: 'introductions',
    difficulty: 2,
    context: 'Pour dire d\'où on vient',
  },
  {
    id: 'intro-7',
    english: 'Where are you from?',
    french: 'D\'où viens-tu ?',
    phonetic: '/weər ɑːr juː frɒm/',
    category: 'introductions',
    difficulty: 2,
    context: 'Pour demander l\'origine de quelqu\'un',
  },

  // ========== FOOD (Nourriture) ==========
  {
    id: 'food-1',
    english: 'I would like...',
    french: 'Je voudrais...',
    phonetic: '/aɪ wʊd laɪk/',
    category: 'food',
    difficulty: 2,
    context: 'Pour commander poliment',
    variations: ['I\'d like...'],
  },
  {
    id: 'food-2',
    english: 'Can I have...?',
    french: 'Est-ce que je peux avoir... ?',
    phonetic: '/kæn aɪ hæv/',
    category: 'food',
    difficulty: 2,
    context: 'Pour demander quelque chose',
    variations: ['Could I have...?', 'May I have...?'],
  },
  {
    id: 'food-3',
    english: 'I\'m hungry',
    french: 'J\'ai faim',
    phonetic: '/aɪm ˈhʌŋɡri/',
    category: 'food',
    difficulty: 1,
    context: 'Pour dire qu\'on a faim',
  },
  {
    id: 'food-4',
    english: 'I\'m thirsty',
    french: 'J\'ai soif',
    phonetic: '/aɪm ˈθɜːrsti/',
    category: 'food',
    difficulty: 1,
    context: 'Pour dire qu\'on a soif',
  },
  {
    id: 'food-5',
    english: 'I like...',
    french: 'J\'aime...',
    phonetic: '/aɪ laɪk/',
    category: 'food',
    difficulty: 1,
    context: 'Pour dire ce qu\'on aime',
  },
  {
    id: 'food-6',
    english: 'I don\'t like...',
    french: 'Je n\'aime pas...',
    phonetic: '/aɪ doʊnt laɪk/',
    category: 'food',
    difficulty: 1,
    context: 'Pour dire ce qu\'on n\'aime pas',
  },
  {
    id: 'food-7',
    english: 'It\'s delicious!',
    french: 'C\'est délicieux !',
    phonetic: '/ɪts dɪˈlɪʃəs/',
    category: 'food',
    difficulty: 2,
    context: 'Pour dire que c\'est bon',
    variations: ['It\'s yummy!', 'It\'s tasty!'],
  },
  {
    id: 'food-8',
    english: 'The bill, please',
    french: 'L\'addition, s\'il vous plaît',
    phonetic: '/ðə bɪl pliːz/',
    category: 'food',
    difficulty: 3,
    context: 'Au restaurant, pour demander l\'addition',
    variations: ['Can I have the check?'],
  },

  // ========== TRAVEL (Voyages et directions) ==========
  {
    id: 'travel-1',
    english: 'Where is...?',
    french: 'Où est... ?',
    phonetic: '/weər ɪz/',
    category: 'travel',
    difficulty: 1,
    context: 'Pour demander où se trouve quelque chose',
  },
  {
    id: 'travel-2',
    english: 'How do I get to...?',
    french: 'Comment aller à... ?',
    phonetic: '/haʊ duː aɪ ɡet tuː/',
    category: 'travel',
    difficulty: 3,
    context: 'Pour demander son chemin',
  },
  {
    id: 'travel-3',
    english: 'Turn left',
    french: 'Tourne à gauche',
    phonetic: '/tɜːrn left/',
    category: 'travel',
    difficulty: 2,
    context: 'Direction: à gauche',
  },
  {
    id: 'travel-4',
    english: 'Turn right',
    french: 'Tourne à droite',
    phonetic: '/tɜːrn raɪt/',
    category: 'travel',
    difficulty: 2,
    context: 'Direction: à droite',
  },
  {
    id: 'travel-5',
    english: 'Go straight',
    french: 'Va tout droit',
    phonetic: '/ɡoʊ streɪt/',
    category: 'travel',
    difficulty: 2,
    context: 'Direction: tout droit',
  },
  {
    id: 'travel-6',
    english: 'I\'m lost',
    french: 'Je suis perdu(e)',
    phonetic: '/aɪm lɒst/',
    category: 'travel',
    difficulty: 2,
    context: 'Quand on ne sait pas où on est',
  },
  {
    id: 'travel-7',
    english: 'Can you help me?',
    french: 'Peux-tu m\'aider ?',
    phonetic: '/kæn juː help miː/',
    category: 'travel',
    difficulty: 2,
    context: 'Pour demander de l\'aide',
  },

  // ========== SCHOOL (École) ==========
  {
    id: 'school-1',
    english: 'I don\'t understand',
    french: 'Je ne comprends pas',
    phonetic: '/aɪ doʊnt ˌʌndərˈstænd/',
    category: 'school',
    difficulty: 2,
    context: 'Quand on ne comprend pas',
  },
  {
    id: 'school-2',
    english: 'Can you repeat, please?',
    french: 'Peux-tu répéter, s\'il te plaît ?',
    phonetic: '/kæn juː rɪˈpiːt pliːz/',
    category: 'school',
    difficulty: 2,
    context: 'Pour demander de répéter',
  },
  {
    id: 'school-3',
    english: 'What does ... mean?',
    french: 'Que veut dire... ?',
    phonetic: '/wɒt dʌz ... miːn/',
    category: 'school',
    difficulty: 2,
    context: 'Pour demander le sens d\'un mot',
  },
  {
    id: 'school-4',
    english: 'I have a question',
    french: 'J\'ai une question',
    phonetic: '/aɪ hæv ə ˈkwestʃən/',
    category: 'school',
    difficulty: 2,
    context: 'Pour poser une question',
  },
  {
    id: 'school-5',
    english: 'My favourite subject is...',
    french: 'Ma matière préférée est...',
    phonetic: '/maɪ ˈfeɪvərɪt ˈsʌbdʒekt ɪz/',
    category: 'school',
    difficulty: 3,
    context: 'Pour parler de sa matière préférée',
  },

  // ========== FEELINGS (Sentiments) ==========
  {
    id: 'feel-1',
    english: 'I\'m happy',
    french: 'Je suis content(e)',
    phonetic: '/aɪm ˈhæpi/',
    category: 'feelings',
    difficulty: 1,
    context: 'Pour exprimer la joie',
  },
  {
    id: 'feel-2',
    english: 'I\'m sad',
    french: 'Je suis triste',
    phonetic: '/aɪm sæd/',
    category: 'feelings',
    difficulty: 1,
    context: 'Pour exprimer la tristesse',
  },
  {
    id: 'feel-3',
    english: 'I\'m tired',
    french: 'Je suis fatigué(e)',
    phonetic: '/aɪm ˈtaɪərd/',
    category: 'feelings',
    difficulty: 1,
    context: 'Pour dire qu\'on est fatigué',
  },
  {
    id: 'feel-4',
    english: 'I\'m excited',
    french: 'Je suis excité(e) / enthousiaste',
    phonetic: '/aɪm ɪkˈsaɪtɪd/',
    category: 'feelings',
    difficulty: 2,
    context: 'Pour exprimer l\'enthousiasme',
  },
  {
    id: 'feel-5',
    english: 'I think...',
    french: 'Je pense que...',
    phonetic: '/aɪ θɪŋk/',
    category: 'feelings',
    difficulty: 2,
    context: 'Pour donner son avis',
    variations: ['I believe...', 'In my opinion...'],
  },
  {
    id: 'feel-6',
    english: 'I love it!',
    french: 'J\'adore !',
    phonetic: '/aɪ lʌv ɪt/',
    category: 'feelings',
    difficulty: 1,
    context: 'Pour exprimer qu\'on adore quelque chose',
  },

  // ========== SHOPPING (Achats) ==========
  {
    id: 'shop-1',
    english: 'How much is it?',
    french: 'Combien ça coûte ?',
    phonetic: '/haʊ mʌtʃ ɪz ɪt/',
    category: 'shopping',
    difficulty: 2,
    context: 'Pour demander le prix',
    variations: ['How much does it cost?'],
  },
  {
    id: 'shop-2',
    english: 'I\'m looking for...',
    french: 'Je cherche...',
    phonetic: '/aɪm ˈlʊkɪŋ fɔːr/',
    category: 'shopping',
    difficulty: 2,
    context: 'Pour dire ce qu\'on cherche',
  },
  {
    id: 'shop-3',
    english: 'Can I try it on?',
    french: 'Est-ce que je peux l\'essayer ?',
    phonetic: '/kæn aɪ traɪ ɪt ɒn/',
    category: 'shopping',
    difficulty: 3,
    context: 'Pour essayer un vêtement',
  },
  {
    id: 'shop-4',
    english: 'Do you have...?',
    french: 'Est-ce que vous avez... ?',
    phonetic: '/duː juː hæv/',
    category: 'shopping',
    difficulty: 2,
    context: 'Pour demander si quelque chose est disponible',
  },
  {
    id: 'shop-5',
    english: 'I\'ll take it',
    french: 'Je le prends',
    phonetic: '/aɪl teɪk ɪt/',
    category: 'shopping',
    difficulty: 2,
    context: 'Pour dire qu\'on achète quelque chose',
  },

  // ========== FAMILY (Famille) ==========
  {
    id: 'fam-1',
    english: 'This is my...',
    french: 'Voici mon/ma...',
    phonetic: '/ðɪs ɪz maɪ/',
    category: 'family',
    difficulty: 1,
    context: 'Pour présenter quelqu\'un de sa famille',
  },
  {
    id: 'fam-2',
    english: 'I have a brother',
    french: 'J\'ai un frère',
    phonetic: '/aɪ hæv ə ˈbrʌðər/',
    category: 'family',
    difficulty: 1,
    context: 'Pour parler de sa famille',
    variations: ['I have a sister', 'I have two brothers'],
  },
  {
    id: 'fam-3',
    english: 'Do you have any siblings?',
    french: 'Est-ce que tu as des frères et sœurs ?',
    phonetic: '/duː juː hæv ˈeni ˈsɪblɪŋz/',
    category: 'family',
    difficulty: 3,
    context: 'Pour demander si quelqu\'un a des frères/sœurs',
  },

  // ========== TIME (Heure) ==========
  {
    id: 'time-1',
    english: 'What time is it?',
    french: 'Quelle heure est-il ?',
    phonetic: '/wɒt taɪm ɪz ɪt/',
    category: 'time',
    difficulty: 2,
    context: 'Pour demander l\'heure',
  },
  {
    id: 'time-2',
    english: 'It\'s ... o\'clock',
    french: 'Il est ... heures',
    phonetic: '/ɪts ... əˈklɒk/',
    category: 'time',
    difficulty: 2,
    context: 'Pour dire l\'heure',
  },

  // ========== POLITE (Politesse) ==========
  {
    id: 'polite-1',
    english: 'Please',
    french: 'S\'il te plaît / S\'il vous plaît',
    phonetic: '/pliːz/',
    category: 'polite',
    difficulty: 1,
    context: 'Pour demander poliment',
  },
  {
    id: 'polite-2',
    english: 'Thank you',
    french: 'Merci',
    phonetic: '/θæŋk juː/',
    category: 'polite',
    difficulty: 1,
    context: 'Pour remercier',
    variations: ['Thanks!', 'Thank you very much!'],
  },
  {
    id: 'polite-3',
    english: 'You\'re welcome',
    french: 'De rien',
    phonetic: '/jʊər ˈwelkəm/',
    category: 'polite',
    difficulty: 1,
    context: 'Réponse à "Thank you"',
    variations: ['No problem!', 'My pleasure!'],
  },
  {
    id: 'polite-4',
    english: 'Excuse me',
    french: 'Excusez-moi / Pardon',
    phonetic: '/ɪkˈskjuːz miː/',
    category: 'polite',
    difficulty: 1,
    context: 'Pour attirer l\'attention ou s\'excuser',
  },
  {
    id: 'polite-5',
    english: 'I\'m sorry',
    french: 'Je suis désolé(e)',
    phonetic: '/aɪm ˈsɒri/',
    category: 'polite',
    difficulty: 1,
    context: 'Pour s\'excuser',
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get chunks by category
 */
export const getChunksByCategory = (category: ChunkCategory): Chunk[] => {
  return CHUNKS.filter(chunk => chunk.category === category);
};

/**
 * Get chunks by difficulty level (grade-appropriate)
 */
export const getChunksForGrade = (grade: Grade): Chunk[] => {
  const maxDifficulty = grade === 'CP' || grade === 'CE1' ? 1
    : grade === 'CE2' ? 2
    : 3;

  return CHUNKS.filter(chunk => chunk.difficulty <= maxDifficulty);
};

/**
 * Get chunks by category and grade
 */
export const getChunksByCategoryAndGrade = (category: ChunkCategory, grade: Grade): Chunk[] => {
  const gradeChunks = getChunksForGrade(grade);
  return gradeChunks.filter(chunk => chunk.category === category);
};

/**
 * Get random chunks for practice
 */
export const getRandomChunks = (count: number, grade: Grade, excludeIds: string[] = []): Chunk[] => {
  const available = getChunksForGrade(grade).filter(c => !excludeIds.includes(c.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

/**
 * Get chunks that need review based on spaced repetition
 */
export const getChunksForReview = (
  masteredChunkIds: string[],
  grade: Grade,
  count: number = 5
): Chunk[] => {
  // Get all chunks at appropriate level that have been mastered before
  const reviewable = CHUNKS.filter(c =>
    masteredChunkIds.includes(c.id) &&
    c.difficulty <= (grade === 'CP' || grade === 'CE1' ? 1 : grade === 'CE2' ? 2 : 3)
  );

  const shuffled = [...reviewable].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Category labels for UI - icon names refer to Phosphor icons
export const CATEGORY_LABELS: Record<ChunkCategory, { en: string; fr: string; icon: string; iconColor: string }> = {
  greetings: { en: 'Greetings', fr: 'Salutations', icon: 'hand-waving', iconColor: 'text-amber-500' },
  introductions: { en: 'Introductions', fr: 'Se présenter', icon: 'user-circle', iconColor: 'text-blue-500' },
  food: { en: 'Food & Drinks', fr: 'Nourriture', icon: 'fork-knife', iconColor: 'text-orange-500' },
  travel: { en: 'Travel', fr: 'Voyages', icon: 'airplane', iconColor: 'text-sky-500' },
  school: { en: 'School', fr: 'École', icon: 'book-open', iconColor: 'text-indigo-500' },
  feelings: { en: 'Feelings', fr: 'Sentiments', icon: 'smiley', iconColor: 'text-yellow-500' },
  shopping: { en: 'Shopping', fr: 'Achats', icon: 'shopping-bag', iconColor: 'text-pink-500' },
  family: { en: 'Family', fr: 'Famille', icon: 'users', iconColor: 'text-green-500' },
  time: { en: 'Time', fr: 'Heure', icon: 'clock', iconColor: 'text-purple-500' },
  polite: { en: 'Polite Words', fr: 'Politesse', icon: 'handshake', iconColor: 'text-teal-500' },
};
