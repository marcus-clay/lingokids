import { GoogleGenAI, Modality } from "@google/genai";
import type { Child, Grade, LessonContent, Exercise, VocabularyItem } from "../types";
import { getVocabularyByTopicAndGrade, getExampleSentences, getExpectedVocabularyCount } from "../data/vocabulary";

const apiKey = import.meta.env.VITE_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to decode Base64 to Uint8Array
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Manual PCM decoding function
async function pcmToAudioBuffer(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Get CEFR level based on grade
const getCEFRLevel = (grade: Grade): string => {
  switch (grade) {
    case 'CP': return 'éveil (sensibilisation)';
    case 'CE1': return 'pré-A1';
    case 'CE2': return 'pré-A1/A1';
    case 'CM1': return 'A1';
    case 'CM2': return 'A1/A1+';
    default: return 'A1';
  }
};

// Generate complete lesson content with introduction, exercises, and summary
export const generateFullLessonContent = async (
  topic: string,
  child: Child,
  exerciseCount: number = 6
): Promise<LessonContent> => {
  const cefrLevel = getCEFRLevel(child.grade);

  // Get pre-defined vocabulary for this topic and grade
  const vocabularySet = getVocabularyByTopicAndGrade(topic, child.grade);
  const exampleSentences = getExampleSentences(topic, child.grade);
  const expectedVocabCount = getExpectedVocabularyCount(child.grade);

  // Build vocabulary context for the AI
  const vocabContext = vocabularySet?.words
    ? `Utilise principalement ces mots de vocabulaire adaptés au niveau ${child.grade}:
${vocabularySet.words.map(w => `- ${w.word} (${w.translation})${w.phonetic ? ` [${w.phonetic}]` : ''}`).join('\n')}
${exampleSentences.length > 0 ? `\nExemples de phrases adaptées:\n${exampleSentences.map(s => `- "${s}"`).join('\n')}` : ''}`
    : '';

  // Grade-specific instructions
  const gradeInstructions: Record<Grade, string> = {
    CP: `TRÈS SIMPLE: Mots isolés, images, répétition. Max 50 mots de vocabulaire total attendus. Phrases de 2-3 mots maximum. Utilise beaucoup de visuels et de sons.`,
    CE1: `SIMPLE: Phrases très courtes (3-5 mots). Environ 150 mots de vocabulaire. Questions avec images. Beaucoup d'encouragements.`,
    CE2: `INTERMÉDIAIRE-BAS: Phrases simples (5-7 mots). 300 mots de vocabulaire. Questions simples avec contexte. Introduis des mini-dialogues.`,
    CM1: `INTERMÉDIAIRE: Phrases complètes (7-10 mots). 500 mots de vocabulaire. Peut inclure des descriptions courtes et des questions ouvertes simples.`,
    CM2: `INTERMÉDIAIRE-HAUT: Phrases élaborées, mini-textes. 700+ mots de vocabulaire. Peut inclure des exercices de compréhension et de production écrite simple.`,
  };

  // Add randomness to force variety
  const sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
  const questionStyles = [
    'traduction anglais vers français',
    'traduction français vers anglais',
    'compléter une phrase à trous',
    'choisir la bonne réponse dans un contexte',
    'associer mot et image/description',
    'remettre les mots dans l\'ordre',
  ];
  const shuffledStyles = questionStyles.sort(() => Math.random() - 0.5).slice(0, exerciseCount);

  const prompt = `Tu es un expert en pédagogie de l'anglais pour enfants français, spécialisé dans l'enseignement aux élèves de ${child.grade}.

SESSION: ${sessionId} (utilise ce numéro pour générer des exercices UNIQUES à chaque fois)
NIVEAU: ${child.grade} (${cefrLevel})
SUJET: "${topic}"
INSTRUCTIONS PÉDAGOGIQUES: ${gradeInstructions[child.grade]}

${vocabContext}

TYPES D'EXERCICES À UTILISER (dans cet ordre):
${shuffledStyles.map((style, i) => `${i + 1}. ${style}`).join('\n')}

Crée une leçon complète avec cette structure JSON exacte:
{
  "introduction": {
    "welcomeTextFr": "Texte d'accueil chaleureux en français adapté à un enfant de ${child.grade} (2-3 phrases)",
    "objectiveFr": "Ce que l'enfant va apprendre (formulation simple pour ${child.grade})",
    "vocabulary": [
      {"word": "mot anglais", "translation": "traduction française", "phonetic": "/prononciation/", "example": "phrase d'exemple très simple"}
    ],
    "funFact": "Anecdote culturelle amusante et adaptée à l'âge"
  },
  "exercises": [
    {
      "id": "ex1",
      "order": 1,
      "type": "multiple-choice",
      "questionEn": "Question en anglais (très simple pour ${child.grade})",
      "questionFr": "Traduction ou contexte en français",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "La bonne réponse",
      "explanationFr": "Explication encourageante et éducative",
      "hints": ["Indice utile"],
      "xpReward": 10
    }
  ],
  "summary": {
    "congratsTextFr": "Félicitations personnalisées pour ${child.name || 'toi'}",
    "keyPointsFr": ["Point clé 1", "Point clé 2", "Point clé 3"],
    "practiceWords": ["mot1", "mot2", "mot3"]
  }
}

RÈGLES IMPORTANTES:
- Génère exactement ${exerciseCount} exercices avec difficulté PROGRESSIVE
- VARIE ABSOLUMENT les types d'exercices: utilise les styles listés ci-dessus
- CHAQUE exercice doit porter sur un MOT ou CONCEPT DIFFÉRENT
- NE RÉPÈTE JAMAIS la même question ou le même mot dans deux exercices différents
- Le vocabulaire doit avoir 4-6 mots adaptés au niveau ${child.grade}
- Utilise les mots du vocabulaire fourni quand disponible
- Les questions doivent être très claires et sans ambiguïté
- Inclus toujours une explication encourageante en français
- Ne retourne QUE le JSON valide, sans markdown ni commentaires`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    let text = response.text || "{}";
    text = text.replace(/```json\n?|\n?```/g, '').trim();

    const data = JSON.parse(text);

    // Merge AI-generated vocabulary with our pre-defined vocabulary if available
    if (vocabularySet?.words && data.introduction?.vocabulary) {
      // Enhance AI vocabulary with phonetics from our database
      data.introduction.vocabulary = data.introduction.vocabulary.map((v: VocabularyItem) => {
        const predefined = vocabularySet.words.find(
          w => w.word.toLowerCase() === v.word.toLowerCase()
        );
        return predefined ? { ...v, phonetic: predefined.phonetic || v.phonetic } : v;
      });
    }

    // Validate and fix exercises to ensure all have options
    const validatedExercises = (data.exercises || []).map((ex: Exercise, index: number) => {
      // Get the correct answer as string (take first if array)
      const correctAnswerStr = Array.isArray(ex.correctAnswer)
        ? ex.correctAnswer[0] || 'Yes'
        : ex.correctAnswer || 'Yes';

      // Ensure exercise has valid options array
      if (!ex.options || !Array.isArray(ex.options) || ex.options.length === 0) {
        console.warn(`Exercise ${index + 1} missing options, generating fallback`);
        // Generate fallback options based on correct answer
        ex.options = generateFallbackOptions(correctAnswerStr, ex.type);
      }

      // Ensure correctAnswer is in options
      if (!ex.options.includes(correctAnswerStr)) {
        ex.options[Math.floor(Math.random() * ex.options.length)] = correctAnswerStr;
      }

      // Ensure we have exactly 4 options
      while (ex.options.length < 4) {
        ex.options.push(`Option ${ex.options.length + 1}`);
      }
      ex.options = ex.options.slice(0, 4);

      // Ensure other required fields
      ex.id = ex.id || `ex_${Date.now()}_${index}`;
      ex.order = ex.order || index + 1;
      ex.hints = ex.hints || [];
      ex.xpReward = ex.xpReward || 10;

      return ex;
    });

    return {
      lessonId: '', // Will be set by caller
      introduction: data.introduction,
      exercises: validatedExercises.length > 0 ? validatedExercises : [getFallbackExercise()],
      summary: data.summary,
      generatedAt: new Date(),
      generatedBy: 'hybrid', // Using both AI and predefined vocabulary
    };
  } catch (error) {
    console.error("Gemini generation error:", error);
    // Return fallback content using our vocabulary database
    return getFallbackLessonContent(topic, child.grade);
  }
};

// Generate a single exercise (for quick generation)
export const generateSingleExercise = async (
  topic: string,
  child: Child
): Promise<Exercise> => {
  const cefrLevel = getCEFRLevel(child.grade);

  const prompt = `Create a simple English exercise for a French child in ${child.grade} (${cefrLevel} level).
Topic: "${topic}"

Return ONLY JSON:
{
  "id": "ex_${Date.now()}",
  "order": 1,
  "type": "multiple-choice",
  "questionEn": "Simple question in English",
  "questionFr": "French translation or context",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": "The correct option",
  "explanationFr": "Encouraging explanation in French",
  "hints": ["Hint 1"],
  "xpReward": 10
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    let text = response.text || "{}";
    text = text.replace(/```json\n?|\n?```/g, '').trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini exercise generation error:", error);
    return getFallbackExercise();
  }
};

// Text-to-Speech for English (child-friendly voice)
export const synthesizeSpeech = async (text: string): Promise<AudioBuffer | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const rawBytes = decode(base64Audio);
    const audioBuffer = await pcmToAudioBuffer(rawBytes, audioContext, 24000, 1);

    return audioBuffer;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

// Text-to-Speech for French narration (warm teacher voice)
export const synthesizeFrenchSpeech = async (text: string): Promise<AudioBuffer | null> => {
  try {
    // Add natural pauses and emphasis markers for child-friendly speech
    const formattedText = text
      .replace(/!/g, '! ... ')
      .replace(/\?/g, '? ... ')
      .replace(/\./g, '. ');

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: formattedText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Aoede' }, // Different voice for French
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const rawBytes = decode(base64Audio);
    const audioBuffer = await pcmToAudioBuffer(rawBytes, audioContext, 24000, 1);

    return audioBuffer;
  } catch (error) {
    console.error("French TTS Error:", error);
    return null;
  }
};

// Helper to play audio buffer
export const playAudioBuffer = async (buffer: AudioBuffer): Promise<void> => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);

  return new Promise((resolve) => {
    source.onended = () => resolve();
    source.start();
  });
};

// Chat with AI Tutor
export const chatWithTutor = async (
  history: {role: 'user'|'model', text: string}[],
  message: string,
  child: Child
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{
            text: `You are a friendly, encouraging English tutor for a French child named ${child.name} (${child.grade}, level ${child.level}). Keep answers short, simple, and use emojis. Correct gently if mistakes are made. Speak mainly in English but use French in parentheses for difficult words.`
          }]
        },
        ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
        { role: 'user', parts: [{ text: message }] }
      ]
    });
    return response.text || "I didn't quite catch that, can you try again?";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Something went wrong. Let's try again!";
  }
};

// Fallback content when API fails - uses our vocabulary database
const getFallbackLessonContent = (topic: string, grade: Grade = 'CE2'): LessonContent => {
  const vocabularySet = getVocabularyByTopicAndGrade(topic, grade);
  const words = vocabularySet?.words || [
    { word: 'hello', translation: 'bonjour', example: 'Hello, how are you?' },
    { word: 'goodbye', translation: 'au revoir', example: 'Goodbye, see you later!' },
  ];

  // Create exercises from vocabulary
  const exercises: Exercise[] = words.slice(0, 4).map((word, index) => ({
    id: `ex_${Date.now()}_${index}`,
    order: index + 1,
    type: 'multiple-choice' as const,
    questionEn: `What does "${word.word}" mean in French?`,
    questionFr: `Que signifie "${word.word}" en français ?`,
    options: shuffleWithCorrect(
      words.filter(w => w.word !== word.word).slice(0, 3).map(w => w.translation),
      word.translation
    ),
    correctAnswer: word.translation,
    explanationFr: `"${word.word}" signifie "${word.translation}" en français. ${word.example ? `Exemple : "${word.example}"` : ''}`,
    hints: [`C'est un mot de la catégorie "${topic}"`],
    xpReward: 10,
  }));

  return {
    lessonId: '',
    introduction: {
      welcomeTextFr: `Bienvenue dans cette leçon sur "${vocabularySet?.topicFr || topic}" ! Aujourd'hui, tu vas apprendre de nouveaux mots en anglais.`,
      objectiveFr: `Apprendre le vocabulaire de base sur ${vocabularySet?.topicFr || topic}`,
      vocabulary: words.slice(0, 5).map(w => ({
        word: w.word,
        translation: w.translation,
        phonetic: w.phonetic,
        example: w.example,
      })),
      funFact: 'L\'anglais est parlé par plus de 1,5 milliard de personnes dans le monde !',
    },
    exercises: exercises.length > 0 ? exercises : [getFallbackExercise()],
    summary: {
      congratsTextFr: 'Bravo ! Tu as très bien travaillé aujourd\'hui !',
      keyPointsFr: [
        `Tu as appris ${words.length} nouveaux mots`,
        `Tu sais maintenant parler de "${vocabularySet?.topicFr || topic}"`,
        'Continue comme ça !',
      ],
      practiceWords: words.slice(0, 5).map(w => w.word),
    },
    generatedAt: new Date(),
    generatedBy: 'template',
  };
};

// Helper to shuffle array and ensure correct answer is included
const shuffleWithCorrect = (options: string[], correct: string): string[] => {
  const result = [...options];
  if (!result.includes(correct)) {
    result.push(correct);
  }
  // Ensure we have exactly 4 options
  while (result.length < 4) {
    result.push(`Option ${result.length + 1}`);
  }
  // Fisher-Yates shuffle
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result.slice(0, 4);
};

// Generate fallback options when AI doesn't provide them
const generateFallbackOptions = (correctAnswer: string, exerciseType?: string): string[] => {
  const options = [correctAnswer];

  // Common wrong answers based on context
  const commonWrongAnswers: Record<string, string[]> = {
    // Greetings
    'Hello': ['Goodbye', 'Thank you', 'Please'],
    'Goodbye': ['Hello', 'Good morning', 'See you'],
    'Good morning': ['Good night', 'Good evening', 'Hello'],
    'Good night': ['Good morning', 'Good afternoon', 'Goodbye'],
    'Thank you': ['Please', 'Sorry', 'Hello'],
    'Please': ['Thank you', 'Sorry', 'Goodbye'],
    // French translations
    'Bonjour': ['Au revoir', 'Merci', 'S\'il te plaît'],
    'Au revoir': ['Bonjour', 'Bonne nuit', 'Merci'],
    'Merci': ['S\'il te plaît', 'Bonjour', 'Pardon'],
    // Yes/No
    'Yes': ['No', 'Maybe', 'Please'],
    'No': ['Yes', 'Maybe', 'Thank you'],
    'Oui': ['Non', 'Peut-être', 'Merci'],
    'Non': ['Oui', 'Peut-être', 'S\'il te plaît'],
    // Numbers
    'One': ['Two', 'Three', 'Four'],
    'Two': ['One', 'Three', 'Five'],
    'Three': ['Two', 'Four', 'One'],
    // Colors
    'Red': ['Blue', 'Green', 'Yellow'],
    'Blue': ['Red', 'Green', 'Purple'],
    'Green': ['Blue', 'Red', 'Yellow'],
    'Yellow': ['Orange', 'Red', 'Green'],
    // Animals
    'Dog': ['Cat', 'Bird', 'Fish'],
    'Cat': ['Dog', 'Rabbit', 'Mouse'],
    // Family
    'Mother': ['Father', 'Sister', 'Brother'],
    'Father': ['Mother', 'Brother', 'Uncle'],
  };

  // Try to find matching wrong answers
  if (commonWrongAnswers[correctAnswer]) {
    return shuffleArray([correctAnswer, ...commonWrongAnswers[correctAnswer]]);
  }

  // Generic fallback options
  const genericOptions = ['Option A', 'Option B', 'Option C'];
  while (options.length < 4) {
    options.push(genericOptions[options.length - 1] || `Option ${options.length}`);
  }

  return shuffleArray(options);
};

// Shuffle array helper
const shuffleArray = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const getFallbackExercise = (): Exercise => ({
  id: `ex_${Date.now()}`,
  order: 1,
  type: 'multiple-choice',
  questionEn: 'What does "Hello" mean in French?',
  questionFr: 'Que signifie "Hello" en français ?',
  options: ['Au revoir', 'Merci', 'Bonjour', 'S\'il vous plaît'],
  correctAnswer: 'Bonjour',
  explanationFr: '"Hello" signifie "Bonjour" en français. C\'est un mot très courant pour saluer quelqu\'un !',
  hints: ['C\'est un mot pour dire bonjour à quelqu\'un'],
  xpReward: 10,
});
