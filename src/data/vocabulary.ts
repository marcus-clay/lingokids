import type { Grade, VocabularyItem } from '../types';

// ============================================
// VOCABULAIRE PAR THÈME ET NIVEAU SCOLAIRE
// Aligné sur les programmes de l'Éducation Nationale française
// et le Cadre Européen Commun de Référence (CECRL)
// ============================================

export interface VocabularySet {
  topic: string;
  topicFr: string;
  grades: Grade[];
  words: VocabularyItem[];
  sentences?: string[]; // Example sentences for higher levels
}

// ============================================
// GREETINGS & INTRODUCTIONS
// ============================================

export const GREETINGS_VOCABULARY: Record<Grade, VocabularySet> = {
  CP: {
    topic: 'greetings',
    topicFr: 'Les salutations',
    grades: ['CP'],
    words: [
      { word: 'Hello', translation: 'Bonjour', phonetic: '/həˈləʊ/' },
      { word: 'Hi', translation: 'Salut', phonetic: '/haɪ/' },
      { word: 'Goodbye', translation: 'Au revoir', phonetic: '/ɡʊdˈbaɪ/' },
      { word: 'Bye', translation: 'Salut (au revoir)', phonetic: '/baɪ/' },
      { word: 'Yes', translation: 'Oui', phonetic: '/jes/' },
      { word: 'No', translation: 'Non', phonetic: '/nəʊ/' },
    ],
  },
  CE1: {
    topic: 'greetings',
    topicFr: 'Les salutations',
    grades: ['CE1'],
    words: [
      { word: 'Hello', translation: 'Bonjour', phonetic: '/həˈləʊ/' },
      { word: 'Good morning', translation: 'Bonjour (matin)', phonetic: '/ɡʊd ˈmɔːnɪŋ/' },
      { word: 'Good afternoon', translation: 'Bonjour (après-midi)', phonetic: '/ɡʊd ˌɑːftəˈnuːn/' },
      { word: 'Goodbye', translation: 'Au revoir', phonetic: '/ɡʊdˈbaɪ/' },
      { word: 'See you', translation: 'À bientôt', phonetic: '/siː juː/' },
      { word: 'Please', translation: 'S\'il te plaît', phonetic: '/pliːz/' },
      { word: 'Thank you', translation: 'Merci', phonetic: '/θæŋk juː/' },
    ],
    sentences: [
      'Hello! How are you?',
      'Good morning, teacher!',
    ],
  },
  CE2: {
    topic: 'greetings',
    topicFr: 'Les salutations',
    grades: ['CE2'],
    words: [
      { word: 'Good morning', translation: 'Bonjour (matin)', phonetic: '/ɡʊd ˈmɔːnɪŋ/' },
      { word: 'Good afternoon', translation: 'Bonjour (après-midi)', phonetic: '/ɡʊd ˌɑːftəˈnuːn/' },
      { word: 'Good evening', translation: 'Bonsoir', phonetic: '/ɡʊd ˈiːvnɪŋ/' },
      { word: 'Good night', translation: 'Bonne nuit', phonetic: '/ɡʊd naɪt/' },
      { word: 'Nice to meet you', translation: 'Enchanté', phonetic: '/naɪs tə miːt juː/' },
      { word: 'How are you?', translation: 'Comment vas-tu ?', phonetic: '/haʊ ɑː juː/' },
      { word: 'I\'m fine', translation: 'Je vais bien', phonetic: '/aɪm faɪn/' },
      { word: 'Thank you very much', translation: 'Merci beaucoup', phonetic: '/θæŋk juː ˈveri mʌtʃ/' },
    ],
    sentences: [
      'Good morning! How are you today?',
      'I\'m fine, thank you. And you?',
      'Nice to meet you!',
    ],
  },
  CM1: {
    topic: 'greetings',
    topicFr: 'Les salutations',
    grades: ['CM1'],
    words: [
      { word: 'Good morning', translation: 'Bonjour (matin)', phonetic: '/ɡʊd ˈmɔːnɪŋ/' },
      { word: 'Good evening', translation: 'Bonsoir', phonetic: '/ɡʊd ˈiːvnɪŋ/' },
      { word: 'Nice to meet you', translation: 'Enchanté', phonetic: '/naɪs tə miːt juː/' },
      { word: 'How are you doing?', translation: 'Comment ça va ?', phonetic: '/haʊ ɑː juː ˈduːɪŋ/' },
      { word: 'I\'m doing great', translation: 'Je vais très bien', phonetic: '/aɪm ˈduːɪŋ ɡreɪt/' },
      { word: 'See you later', translation: 'À plus tard', phonetic: '/siː juː ˈleɪtə/' },
      { word: 'See you tomorrow', translation: 'À demain', phonetic: '/siː juː təˈmɒrəʊ/' },
      { word: 'Have a nice day', translation: 'Passe une bonne journée', phonetic: '/hæv ə naɪs deɪ/' },
      { word: 'You\'re welcome', translation: 'De rien', phonetic: '/jɔː ˈwelkəm/' },
    ],
    sentences: [
      'Good morning! How are you doing today?',
      'I\'m doing great, thank you!',
      'See you tomorrow! Have a nice day!',
    ],
  },
  CM2: {
    topic: 'greetings',
    topicFr: 'Les salutations',
    grades: ['CM2'],
    words: [
      { word: 'How are you doing?', translation: 'Comment ça va ?', phonetic: '/haʊ ɑː juː ˈduːɪŋ/' },
      { word: 'I\'m doing well', translation: 'Je vais bien', phonetic: '/aɪm ˈduːɪŋ wel/' },
      { word: 'Long time no see', translation: 'Ça fait longtemps', phonetic: '/lɒŋ taɪm nəʊ siː/' },
      { word: 'What\'s up?', translation: 'Quoi de neuf ?', phonetic: '/wɒts ʌp/' },
      { word: 'Not much', translation: 'Pas grand-chose', phonetic: '/nɒt mʌtʃ/' },
      { word: 'Take care', translation: 'Prends soin de toi', phonetic: '/teɪk keə/' },
      { word: 'Have a great weekend', translation: 'Bon week-end', phonetic: '/hæv ə ɡreɪt ˈwiːkend/' },
      { word: 'It was nice meeting you', translation: 'C\'était sympa de te rencontrer', phonetic: '/ɪt wɒz naɪs ˈmiːtɪŋ juː/' },
    ],
    sentences: [
      'Hi! Long time no see! How are you doing?',
      'I\'m doing well, thanks. What\'s up?',
      'Not much. Take care! See you soon!',
    ],
  },
};

// ============================================
// NUMBERS
// ============================================

export const NUMBERS_VOCABULARY: Record<Grade, VocabularySet> = {
  CP: {
    topic: 'numbers',
    topicFr: 'Les nombres',
    grades: ['CP'],
    words: [
      { word: 'One', translation: '1 - Un', phonetic: '/wʌn/' },
      { word: 'Two', translation: '2 - Deux', phonetic: '/tuː/' },
      { word: 'Three', translation: '3 - Trois', phonetic: '/θriː/' },
      { word: 'Four', translation: '4 - Quatre', phonetic: '/fɔː/' },
      { word: 'Five', translation: '5 - Cinq', phonetic: '/faɪv/' },
      { word: 'Six', translation: '6 - Six', phonetic: '/sɪks/' },
      { word: 'Seven', translation: '7 - Sept', phonetic: '/ˈsevn/' },
      { word: 'Eight', translation: '8 - Huit', phonetic: '/eɪt/' },
      { word: 'Nine', translation: '9 - Neuf', phonetic: '/naɪn/' },
      { word: 'Ten', translation: '10 - Dix', phonetic: '/ten/' },
    ],
  },
  CE1: {
    topic: 'numbers',
    topicFr: 'Les nombres',
    grades: ['CE1'],
    words: [
      { word: 'Eleven', translation: '11 - Onze', phonetic: '/ɪˈlevn/' },
      { word: 'Twelve', translation: '12 - Douze', phonetic: '/twelv/' },
      { word: 'Thirteen', translation: '13 - Treize', phonetic: '/ˌθɜːˈtiːn/' },
      { word: 'Fourteen', translation: '14 - Quatorze', phonetic: '/ˌfɔːˈtiːn/' },
      { word: 'Fifteen', translation: '15 - Quinze', phonetic: '/ˌfɪfˈtiːn/' },
      { word: 'Sixteen', translation: '16 - Seize', phonetic: '/ˌsɪksˈtiːn/' },
      { word: 'Seventeen', translation: '17 - Dix-sept', phonetic: '/ˌsevnˈtiːn/' },
      { word: 'Eighteen', translation: '18 - Dix-huit', phonetic: '/ˌeɪˈtiːn/' },
      { word: 'Nineteen', translation: '19 - Dix-neuf', phonetic: '/ˌnaɪnˈtiːn/' },
      { word: 'Twenty', translation: '20 - Vingt', phonetic: '/ˈtwenti/' },
    ],
    sentences: [
      'How old are you? I am seven.',
      'I have twelve crayons.',
    ],
  },
  CE2: {
    topic: 'numbers',
    topicFr: 'Les nombres',
    grades: ['CE2'],
    words: [
      { word: 'Twenty', translation: '20 - Vingt', phonetic: '/ˈtwenti/' },
      { word: 'Thirty', translation: '30 - Trente', phonetic: '/ˈθɜːti/' },
      { word: 'Forty', translation: '40 - Quarante', phonetic: '/ˈfɔːti/' },
      { word: 'Fifty', translation: '50 - Cinquante', phonetic: '/ˈfɪfti/' },
      { word: 'First', translation: 'Premier', phonetic: '/fɜːst/' },
      { word: 'Second', translation: 'Deuxième', phonetic: '/ˈsekənd/' },
      { word: 'Third', translation: 'Troisième', phonetic: '/θɜːd/' },
    ],
    sentences: [
      'I am in the third grade.',
      'My birthday is on the twenty-first.',
    ],
  },
  CM1: {
    topic: 'numbers',
    topicFr: 'Les nombres',
    grades: ['CM1'],
    words: [
      { word: 'Sixty', translation: '60 - Soixante', phonetic: '/ˈsɪksti/' },
      { word: 'Seventy', translation: '70 - Soixante-dix', phonetic: '/ˈsevnti/' },
      { word: 'Eighty', translation: '80 - Quatre-vingts', phonetic: '/ˈeɪti/' },
      { word: 'Ninety', translation: '90 - Quatre-vingt-dix', phonetic: '/ˈnaɪnti/' },
      { word: 'One hundred', translation: '100 - Cent', phonetic: '/wʌn ˈhʌndrəd/' },
      { word: 'First', translation: 'Premier/ère', phonetic: '/fɜːst/' },
      { word: 'Last', translation: 'Dernier/ère', phonetic: '/lɑːst/' },
    ],
    sentences: [
      'There are one hundred students in our school.',
      'I finished first in the race!',
    ],
  },
  CM2: {
    topic: 'numbers',
    topicFr: 'Les nombres',
    grades: ['CM2'],
    words: [
      { word: 'One thousand', translation: '1000 - Mille', phonetic: '/wʌn ˈθaʊzənd/' },
      { word: 'Million', translation: 'Million', phonetic: '/ˈmɪljən/' },
      { word: 'Half', translation: 'Moitié / Demi', phonetic: '/hɑːf/' },
      { word: 'Quarter', translation: 'Quart', phonetic: '/ˈkwɔːtə/' },
      { word: 'Double', translation: 'Double', phonetic: '/ˈdʌbl/' },
      { word: 'Triple', translation: 'Triple', phonetic: '/ˈtrɪpl/' },
    ],
    sentences: [
      'Half of twenty is ten.',
      'A quarter of an hour is fifteen minutes.',
    ],
  },
};

// ============================================
// COLORS
// ============================================

export const COLORS_VOCABULARY: Record<Grade, VocabularySet> = {
  CP: {
    topic: 'colors',
    topicFr: 'Les couleurs',
    grades: ['CP'],
    words: [
      { word: 'Red', translation: 'Rouge', phonetic: '/red/' },
      { word: 'Blue', translation: 'Bleu', phonetic: '/bluː/' },
      { word: 'Yellow', translation: 'Jaune', phonetic: '/ˈjeləʊ/' },
      { word: 'Green', translation: 'Vert', phonetic: '/ɡriːn/' },
      { word: 'Orange', translation: 'Orange', phonetic: '/ˈɒrɪndʒ/' },
      { word: 'Pink', translation: 'Rose', phonetic: '/pɪŋk/' },
    ],
  },
  CE1: {
    topic: 'colors',
    topicFr: 'Les couleurs',
    grades: ['CE1'],
    words: [
      { word: 'Red', translation: 'Rouge', phonetic: '/red/' },
      { word: 'Blue', translation: 'Bleu', phonetic: '/bluː/' },
      { word: 'Yellow', translation: 'Jaune', phonetic: '/ˈjeləʊ/' },
      { word: 'Green', translation: 'Vert', phonetic: '/ɡriːn/' },
      { word: 'Orange', translation: 'Orange', phonetic: '/ˈɒrɪndʒ/' },
      { word: 'Purple', translation: 'Violet', phonetic: '/ˈpɜːpl/' },
      { word: 'Pink', translation: 'Rose', phonetic: '/pɪŋk/' },
      { word: 'Black', translation: 'Noir', phonetic: '/blæk/' },
      { word: 'White', translation: 'Blanc', phonetic: '/waɪt/' },
      { word: 'Brown', translation: 'Marron', phonetic: '/braʊn/' },
    ],
    sentences: [
      'The sky is blue.',
      'My favourite colour is red.',
    ],
  },
  CE2: {
    topic: 'colors',
    topicFr: 'Les couleurs',
    grades: ['CE2'],
    words: [
      { word: 'Light blue', translation: 'Bleu clair', phonetic: '/laɪt bluː/' },
      { word: 'Dark blue', translation: 'Bleu foncé', phonetic: '/dɑːk bluː/' },
      { word: 'Grey', translation: 'Gris', phonetic: '/ɡreɪ/' },
      { word: 'Golden', translation: 'Doré', phonetic: '/ˈɡəʊldən/' },
      { word: 'Silver', translation: 'Argenté', phonetic: '/ˈsɪlvə/' },
      { word: 'Rainbow', translation: 'Arc-en-ciel', phonetic: '/ˈreɪnbəʊ/' },
    ],
    sentences: [
      'The cat has grey fur.',
      'I see a beautiful rainbow!',
      'What colour is your bag?',
    ],
  },
  CM1: {
    topic: 'colors',
    topicFr: 'Les couleurs',
    grades: ['CM1'],
    words: [
      { word: 'Beige', translation: 'Beige', phonetic: '/beɪʒ/' },
      { word: 'Turquoise', translation: 'Turquoise', phonetic: '/ˈtɜːkwɔɪz/' },
      { word: 'Navy blue', translation: 'Bleu marine', phonetic: '/ˈneɪvi bluː/' },
      { word: 'Bright', translation: 'Vif / Brillant', phonetic: '/braɪt/' },
      { word: 'Pale', translation: 'Pâle', phonetic: '/peɪl/' },
      { word: 'Colourful', translation: 'Coloré', phonetic: '/ˈkʌləfl/' },
    ],
    sentences: [
      'She is wearing a bright red dress.',
      'The sunset has beautiful orange and pink colours.',
    ],
  },
  CM2: {
    topic: 'colors',
    topicFr: 'Les couleurs',
    grades: ['CM2'],
    words: [
      { word: 'Shade', translation: 'Nuance', phonetic: '/ʃeɪd/' },
      { word: 'Tone', translation: 'Ton', phonetic: '/təʊn/' },
      { word: 'Olive', translation: 'Olive', phonetic: '/ˈɒlɪv/' },
      { word: 'Cream', translation: 'Crème', phonetic: '/kriːm/' },
      { word: 'Magenta', translation: 'Magenta', phonetic: '/məˈdʒentə/' },
      { word: 'Transparent', translation: 'Transparent', phonetic: '/trænsˈpærənt/' },
    ],
    sentences: [
      'This painting uses many different shades of blue.',
      'I prefer warm tones like orange and yellow.',
    ],
  },
};

// ============================================
// FAMILY
// ============================================

export const FAMILY_VOCABULARY: Record<Grade, VocabularySet> = {
  CP: {
    topic: 'family',
    topicFr: 'La famille',
    grades: ['CP'],
    words: [
      { word: 'Mum / Mom', translation: 'Maman', phonetic: '/mʌm/' },
      { word: 'Dad', translation: 'Papa', phonetic: '/dæd/' },
      { word: 'Brother', translation: 'Frère', phonetic: '/ˈbrʌðə/' },
      { word: 'Sister', translation: 'Sœur', phonetic: '/ˈsɪstə/' },
      { word: 'Baby', translation: 'Bébé', phonetic: '/ˈbeɪbi/' },
    ],
  },
  CE1: {
    topic: 'family',
    topicFr: 'La famille',
    grades: ['CE1'],
    words: [
      { word: 'Mother', translation: 'Mère', phonetic: '/ˈmʌðə/' },
      { word: 'Father', translation: 'Père', phonetic: '/ˈfɑːðə/' },
      { word: 'Grandma', translation: 'Grand-mère', phonetic: '/ˈɡrænmɑː/' },
      { word: 'Grandpa', translation: 'Grand-père', phonetic: '/ˈɡrænpɑː/' },
      { word: 'Family', translation: 'Famille', phonetic: '/ˈfæmɪli/' },
    ],
    sentences: [
      'This is my family.',
      'I love my mum and dad.',
    ],
  },
  CE2: {
    topic: 'family',
    topicFr: 'La famille',
    grades: ['CE2'],
    words: [
      { word: 'Parents', translation: 'Parents', phonetic: '/ˈpeərənts/' },
      { word: 'Grandparents', translation: 'Grands-parents', phonetic: '/ˈɡrænpeərənts/' },
      { word: 'Uncle', translation: 'Oncle', phonetic: '/ˈʌŋkl/' },
      { word: 'Aunt', translation: 'Tante', phonetic: '/ɑːnt/' },
      { word: 'Cousin', translation: 'Cousin(e)', phonetic: '/ˈkʌzn/' },
    ],
    sentences: [
      'I have two cousins.',
      'My uncle lives in London.',
      'How many brothers and sisters do you have?',
    ],
  },
  CM1: {
    topic: 'family',
    topicFr: 'La famille',
    grades: ['CM1'],
    words: [
      { word: 'Nephew', translation: 'Neveu', phonetic: '/ˈnefjuː/' },
      { word: 'Niece', translation: 'Nièce', phonetic: '/niːs/' },
      { word: 'Stepmother', translation: 'Belle-mère', phonetic: '/ˈstepmʌðə/' },
      { word: 'Stepfather', translation: 'Beau-père', phonetic: '/ˈstepfɑːðə/' },
      { word: 'Half-brother', translation: 'Demi-frère', phonetic: '/hɑːf ˈbrʌðə/' },
      { word: 'Twins', translation: 'Jumeaux', phonetic: '/twɪnz/' },
    ],
    sentences: [
      'My niece is five years old.',
      'We are twins, but we don\'t look alike.',
    ],
  },
  CM2: {
    topic: 'family',
    topicFr: 'La famille',
    grades: ['CM2'],
    words: [
      { word: 'Relative', translation: 'Parent (famille)', phonetic: '/ˈrelətɪv/' },
      { word: 'Ancestor', translation: 'Ancêtre', phonetic: '/ˈænsestə/' },
      { word: 'In-laws', translation: 'Belle-famille', phonetic: '/ɪn lɔːz/' },
      { word: 'Sibling', translation: 'Frère ou sœur', phonetic: '/ˈsɪblɪŋ/' },
      { word: 'Only child', translation: 'Enfant unique', phonetic: '/ˈəʊnli tʃaɪld/' },
      { word: 'Generation', translation: 'Génération', phonetic: '/ˌdʒenəˈreɪʃn/' },
    ],
    sentences: [
      'I have many relatives in France.',
      'He is an only child.',
      'Three generations live in this house.',
    ],
  },
};

// ============================================
// ANIMALS
// ============================================

export const ANIMALS_VOCABULARY: Record<Grade, VocabularySet> = {
  CP: {
    topic: 'animals',
    topicFr: 'Les animaux',
    grades: ['CP'],
    words: [
      { word: 'Cat', translation: 'Chat', phonetic: '/kæt/' },
      { word: 'Dog', translation: 'Chien', phonetic: '/dɒɡ/' },
      { word: 'Bird', translation: 'Oiseau', phonetic: '/bɜːd/' },
      { word: 'Fish', translation: 'Poisson', phonetic: '/fɪʃ/' },
      { word: 'Rabbit', translation: 'Lapin', phonetic: '/ˈræbɪt/' },
    ],
  },
  CE1: {
    topic: 'animals',
    topicFr: 'Les animaux',
    grades: ['CE1'],
    words: [
      { word: 'Cow', translation: 'Vache', phonetic: '/kaʊ/' },
      { word: 'Pig', translation: 'Cochon', phonetic: '/pɪɡ/' },
      { word: 'Horse', translation: 'Cheval', phonetic: '/hɔːs/' },
      { word: 'Chicken', translation: 'Poulet', phonetic: '/ˈtʃɪkɪn/' },
      { word: 'Sheep', translation: 'Mouton', phonetic: '/ʃiːp/' },
      { word: 'Duck', translation: 'Canard', phonetic: '/dʌk/' },
    ],
    sentences: [
      'The dog says woof woof!',
      'I have a cat at home.',
    ],
  },
  CE2: {
    topic: 'animals',
    topicFr: 'Les animaux',
    grades: ['CE2'],
    words: [
      { word: 'Lion', translation: 'Lion', phonetic: '/ˈlaɪən/' },
      { word: 'Tiger', translation: 'Tigre', phonetic: '/ˈtaɪɡə/' },
      { word: 'Elephant', translation: 'Éléphant', phonetic: '/ˈelɪfənt/' },
      { word: 'Monkey', translation: 'Singe', phonetic: '/ˈmʌŋki/' },
      { word: 'Giraffe', translation: 'Girafe', phonetic: '/dʒɪˈrɑːf/' },
      { word: 'Bear', translation: 'Ours', phonetic: '/beə/' },
      { word: 'Snake', translation: 'Serpent', phonetic: '/sneɪk/' },
    ],
    sentences: [
      'The elephant is very big.',
      'Lions live in Africa.',
      'What is your favourite animal?',
    ],
  },
  CM1: {
    topic: 'animals',
    topicFr: 'Les animaux',
    grades: ['CM1'],
    words: [
      { word: 'Whale', translation: 'Baleine', phonetic: '/weɪl/' },
      { word: 'Dolphin', translation: 'Dauphin', phonetic: '/ˈdɒlfɪn/' },
      { word: 'Shark', translation: 'Requin', phonetic: '/ʃɑːk/' },
      { word: 'Eagle', translation: 'Aigle', phonetic: '/ˈiːɡl/' },
      { word: 'Wolf', translation: 'Loup', phonetic: '/wʊlf/' },
      { word: 'Fox', translation: 'Renard', phonetic: '/fɒks/' },
      { word: 'Deer', translation: 'Cerf', phonetic: '/dɪə/' },
    ],
    sentences: [
      'Dolphins are very intelligent.',
      'The wolf howls at the moon.',
      'Can you describe this animal?',
    ],
  },
  CM2: {
    topic: 'animals',
    topicFr: 'Les animaux',
    grades: ['CM2'],
    words: [
      { word: 'Mammal', translation: 'Mammifère', phonetic: '/ˈmæml/' },
      { word: 'Reptile', translation: 'Reptile', phonetic: '/ˈreptaɪl/' },
      { word: 'Insect', translation: 'Insecte', phonetic: '/ˈɪnsekt/' },
      { word: 'Endangered', translation: 'En voie de disparition', phonetic: '/ɪnˈdeɪndʒəd/' },
      { word: 'Habitat', translation: 'Habitat', phonetic: '/ˈhæbɪtæt/' },
      { word: 'Species', translation: 'Espèce', phonetic: '/ˈspiːʃiːz/' },
      { word: 'Wildlife', translation: 'Faune sauvage', phonetic: '/ˈwaɪldlaɪf/' },
    ],
    sentences: [
      'Many species are endangered.',
      'We must protect wildlife and their habitats.',
      'A whale is a mammal, not a fish.',
    ],
  },
};

// ============================================
// BODY PARTS
// ============================================

export const BODY_VOCABULARY: Record<Grade, VocabularySet> = {
  CP: {
    topic: 'body',
    topicFr: 'Le corps',
    grades: ['CP'],
    words: [
      { word: 'Head', translation: 'Tête', phonetic: '/hed/' },
      { word: 'Hand', translation: 'Main', phonetic: '/hænd/' },
      { word: 'Foot', translation: 'Pied', phonetic: '/fʊt/' },
      { word: 'Eye', translation: 'Œil', phonetic: '/aɪ/' },
      { word: 'Nose', translation: 'Nez', phonetic: '/nəʊz/' },
    ],
  },
  CE1: {
    topic: 'body',
    topicFr: 'Le corps',
    grades: ['CE1'],
    words: [
      { word: 'Ear', translation: 'Oreille', phonetic: '/ɪə/' },
      { word: 'Mouth', translation: 'Bouche', phonetic: '/maʊθ/' },
      { word: 'Arm', translation: 'Bras', phonetic: '/ɑːm/' },
      { word: 'Leg', translation: 'Jambe', phonetic: '/leɡ/' },
      { word: 'Finger', translation: 'Doigt', phonetic: '/ˈfɪŋɡə/' },
      { word: 'Toe', translation: 'Orteil', phonetic: '/təʊ/' },
    ],
    sentences: [
      'Touch your head!',
      'Clap your hands!',
    ],
  },
  CE2: {
    topic: 'body',
    topicFr: 'Le corps',
    grades: ['CE2'],
    words: [
      { word: 'Shoulder', translation: 'Épaule', phonetic: '/ˈʃəʊldə/' },
      { word: 'Knee', translation: 'Genou', phonetic: '/niː/' },
      { word: 'Elbow', translation: 'Coude', phonetic: '/ˈelbəʊ/' },
      { word: 'Neck', translation: 'Cou', phonetic: '/nek/' },
      { word: 'Back', translation: 'Dos', phonetic: '/bæk/' },
      { word: 'Stomach', translation: 'Ventre', phonetic: '/ˈstʌmək/' },
    ],
    sentences: [
      'Bend your knees!',
      'I have a pain in my back.',
    ],
  },
  CM1: {
    topic: 'body',
    topicFr: 'Le corps',
    grades: ['CM1'],
    words: [
      { word: 'Ankle', translation: 'Cheville', phonetic: '/ˈæŋkl/' },
      { word: 'Wrist', translation: 'Poignet', phonetic: '/rɪst/' },
      { word: 'Chin', translation: 'Menton', phonetic: '/tʃɪn/' },
      { word: 'Forehead', translation: 'Front', phonetic: '/ˈfɔːhed/' },
      { word: 'Cheek', translation: 'Joue', phonetic: '/tʃiːk/' },
      { word: 'Thumb', translation: 'Pouce', phonetic: '/θʌm/' },
    ],
    sentences: [
      'She twisted her ankle.',
      'He scratched his chin thoughtfully.',
    ],
  },
  CM2: {
    topic: 'body',
    topicFr: 'Le corps',
    grades: ['CM2'],
    words: [
      { word: 'Skeleton', translation: 'Squelette', phonetic: '/ˈskelɪtn/' },
      { word: 'Muscle', translation: 'Muscle', phonetic: '/ˈmʌsl/' },
      { word: 'Brain', translation: 'Cerveau', phonetic: '/breɪn/' },
      { word: 'Heart', translation: 'Cœur', phonetic: '/hɑːt/' },
      { word: 'Lungs', translation: 'Poumons', phonetic: '/lʌŋz/' },
      { word: 'Bone', translation: 'Os', phonetic: '/bəʊn/' },
    ],
    sentences: [
      'Your heart pumps blood through your body.',
      'The brain controls all your actions.',
      'Exercise strengthens your muscles.',
    ],
  },
};

// ============================================
// FOOD & DRINKS
// ============================================

export const FOOD_VOCABULARY: Record<Grade, VocabularySet> = {
  CP: {
    topic: 'food',
    topicFr: 'La nourriture',
    grades: ['CP'],
    words: [
      { word: 'Apple', translation: 'Pomme', phonetic: '/ˈæpl/' },
      { word: 'Banana', translation: 'Banane', phonetic: '/bəˈnɑːnə/' },
      { word: 'Bread', translation: 'Pain', phonetic: '/bred/' },
      { word: 'Milk', translation: 'Lait', phonetic: '/mɪlk/' },
      { word: 'Water', translation: 'Eau', phonetic: '/ˈwɔːtə/' },
    ],
  },
  CE1: {
    topic: 'food',
    topicFr: 'La nourriture',
    grades: ['CE1'],
    words: [
      { word: 'Orange', translation: 'Orange', phonetic: '/ˈɒrɪndʒ/' },
      { word: 'Strawberry', translation: 'Fraise', phonetic: '/ˈstrɔːbəri/' },
      { word: 'Cheese', translation: 'Fromage', phonetic: '/tʃiːz/' },
      { word: 'Egg', translation: 'Œuf', phonetic: '/eɡ/' },
      { word: 'Cake', translation: 'Gâteau', phonetic: '/keɪk/' },
      { word: 'Juice', translation: 'Jus', phonetic: '/dʒuːs/' },
    ],
    sentences: [
      'I like apples.',
      'Can I have some water, please?',
    ],
  },
  CE2: {
    topic: 'food',
    topicFr: 'La nourriture',
    grades: ['CE2'],
    words: [
      { word: 'Vegetables', translation: 'Légumes', phonetic: '/ˈvedʒtəblz/' },
      { word: 'Fruit', translation: 'Fruit', phonetic: '/fruːt/' },
      { word: 'Meat', translation: 'Viande', phonetic: '/miːt/' },
      { word: 'Fish', translation: 'Poisson', phonetic: '/fɪʃ/' },
      { word: 'Rice', translation: 'Riz', phonetic: '/raɪs/' },
      { word: 'Pasta', translation: 'Pâtes', phonetic: '/ˈpæstə/' },
      { word: 'Soup', translation: 'Soupe', phonetic: '/suːp/' },
    ],
    sentences: [
      'Do you like vegetables?',
      'I don\'t like meat.',
      'What\'s your favourite food?',
    ],
  },
  CM1: {
    topic: 'food',
    topicFr: 'La nourriture',
    grades: ['CM1'],
    words: [
      { word: 'Breakfast', translation: 'Petit-déjeuner', phonetic: '/ˈbrekfəst/' },
      { word: 'Lunch', translation: 'Déjeuner', phonetic: '/lʌntʃ/' },
      { word: 'Dinner', translation: 'Dîner', phonetic: '/ˈdɪnə/' },
      { word: 'Snack', translation: 'Goûter/En-cas', phonetic: '/snæk/' },
      { word: 'Dessert', translation: 'Dessert', phonetic: '/dɪˈzɜːt/' },
      { word: 'Hungry', translation: 'Affamé', phonetic: '/ˈhʌŋɡri/' },
      { word: 'Thirsty', translation: 'Assoiffé', phonetic: '/ˈθɜːsti/' },
    ],
    sentences: [
      'What did you have for breakfast?',
      'I\'m hungry. Let\'s have lunch!',
      'Are you thirsty?',
    ],
  },
  CM2: {
    topic: 'food',
    topicFr: 'La nourriture',
    grades: ['CM2'],
    words: [
      { word: 'Recipe', translation: 'Recette', phonetic: '/ˈresɪpi/' },
      { word: 'Ingredient', translation: 'Ingrédient', phonetic: '/ɪnˈɡriːdiənt/' },
      { word: 'Healthy', translation: 'Sain', phonetic: '/ˈhelθi/' },
      { word: 'Organic', translation: 'Bio', phonetic: '/ɔːˈɡænɪk/' },
      { word: 'Delicious', translation: 'Délicieux', phonetic: '/dɪˈlɪʃəs/' },
      { word: 'Tasty', translation: 'Savoureux', phonetic: '/ˈteɪsti/' },
    ],
    sentences: [
      'This recipe needs five ingredients.',
      'Eating healthy food is important.',
      'The soup is delicious!',
    ],
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get vocabulary for a specific topic and grade
 */
export const getVocabularyByTopicAndGrade = (
  topic: string,
  grade: Grade
): VocabularySet | null => {
  const vocabularyMaps: Record<string, Record<Grade, VocabularySet>> = {
    greetings: GREETINGS_VOCABULARY,
    numbers: NUMBERS_VOCABULARY,
    'numbers 1-10': NUMBERS_VOCABULARY,
    'numbers 11-20': NUMBERS_VOCABULARY,
    colors: COLORS_VOCABULARY,
    family: FAMILY_VOCABULARY,
    'family members': FAMILY_VOCABULARY,
    animals: ANIMALS_VOCABULARY,
    pets: ANIMALS_VOCABULARY,
    'farm animals': ANIMALS_VOCABULARY,
    'wild animals': ANIMALS_VOCABULARY,
    body: BODY_VOCABULARY,
    food: FOOD_VOCABULARY,
    introductions: GREETINGS_VOCABULARY,
    feelings: GREETINGS_VOCABULARY,
    'polite expressions': GREETINGS_VOCABULARY,
  };

  const normalizedTopic = topic.toLowerCase();

  for (const [key, vocabMap] of Object.entries(vocabularyMaps)) {
    if (normalizedTopic.includes(key)) {
      return vocabMap[grade] || null;
    }
  }

  return null;
};

/**
 * Get all vocabulary items for a grade level (combined from all topics)
 */
export const getAllVocabularyForGrade = (grade: Grade): VocabularyItem[] => {
  const allVocab: VocabularyItem[] = [];

  const vocabularySets = [
    GREETINGS_VOCABULARY[grade],
    NUMBERS_VOCABULARY[grade],
    COLORS_VOCABULARY[grade],
    FAMILY_VOCABULARY[grade],
    ANIMALS_VOCABULARY[grade],
    BODY_VOCABULARY[grade],
    FOOD_VOCABULARY[grade],
  ];

  for (const set of vocabularySets) {
    if (set?.words) {
      allVocab.push(...set.words);
    }
  }

  return allVocab;
};

/**
 * Get expected vocabulary count by grade
 */
export const getExpectedVocabularyCount = (grade: Grade): number => {
  const counts: Record<Grade, number> = {
    CP: 50,    // Sensibilisation
    CE1: 150,  // Pré-A1
    CE2: 300,  // Pré-A1/A1
    CM1: 500,  // A1
    CM2: 700,  // A1/A1+
  };
  return counts[grade];
};

/**
 * Get grade-appropriate example sentences
 */
export const getExampleSentences = (
  topic: string,
  grade: Grade
): string[] => {
  const vocab = getVocabularyByTopicAndGrade(topic, grade);
  return vocab?.sentences || [];
};
