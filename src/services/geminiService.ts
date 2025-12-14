import { GoogleGenAI } from "@google/genai";
import { UserProfile } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// ============================================================================
// TEXT-TO-SPEECH - Uses Web Speech API (works without API key)
// ============================================================================

// Check if voices are loaded
let voicesLoaded = false;

// Initialize voices
export function initVoices(): Promise<void> {
  return new Promise((resolve) => {
    if (voicesLoaded) {
      resolve();
      return;
    }

    if (!('speechSynthesis' in window)) {
      console.warn("Web Speech API not supported");
      resolve();
      return;
    }

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        voicesLoaded = true;
        console.log("Voices loaded:", voices.length);
        resolve();
      }
    };

    // Try to load voices immediately
    loadVoices();

    // Also listen for voiceschanged event (needed for some browsers)
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Fallback timeout
    setTimeout(() => {
      voicesLoaded = true;
      resolve();
    }, 1000);
  });
}

// Get the best available English voice
function getBestVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();

  // Priority order for voice selection
  const preferredVoices = [
    // iOS/macOS high-quality voices
    voices.find(v => v.name === 'Samantha'),
    voices.find(v => v.name === 'Karen'),
    voices.find(v => v.name.includes('Premium') && v.lang.startsWith('en')),
    // Google voices
    voices.find(v => v.name.includes('Google') && v.lang === 'en-US'),
    voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')),
    // Any English US voice
    voices.find(v => v.lang === 'en-US'),
    // Any English voice
    voices.find(v => v.lang.startsWith('en')),
    // Fallback to first voice
    voices[0]
  ];

  return preferredVoices.find(v => v !== undefined) || null;
}

/**
 * Speak text using the browser's Web Speech API
 * This is the PRIMARY method - works without any API key
 */
export function speak(text: string, rate: number = 0.9): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      console.error("Web Speech API not supported in this browser");
      reject(new Error('Web Speech API not supported'));
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate; // Slower for children
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Get the best voice
    const voice = getBestVoice();
    if (voice) {
      utterance.voice = voice;
      console.log("Using voice:", voice.name);
    }

    utterance.onend = () => {
      console.log("Speech finished:", text.substring(0, 30));
      resolve();
    };

    utterance.onerror = (event) => {
      console.error("Speech error:", event.error);
      reject(new Error(event.error));
    };

    // Speak!
    window.speechSynthesis.speak(utterance);
    console.log("Speaking:", text.substring(0, 30));
  });
}

/**
 * Speak a word (faster rate for vocabulary)
 */
export function speakWord(word: string): Promise<void> {
  return speak(word, 0.85);
}

/**
 * Speak feedback (encouraging tone)
 */
export function speakFeedback(text: string): Promise<void> {
  return speak(text, 0.9);
}

/**
 * Stop any ongoing speech
 */
export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Placeholder for preloadAudio - Web Speech API doesn't need preloading
export async function preloadAudio(texts: string[]): Promise<void> {
  // Web Speech API doesn't support preloading, so this is a no-op
  // Just initialize voices if not done
  await initVoices();
}

// ============================================================================
// EXERCISE GENERATION
// ============================================================================

const generateMultipleChoice = async (
  topic: string,
  ageContext: string,
  complexity: string
): Promise<string> => {
  if (!ai) {
    // Return fallback if no API
    return JSON.stringify({
      type: "multiple-choice",
      question: "What color is the sun?",
      options: ["Yellow", "Blue", "Green", "Purple"],
      correctAnswer: "Yellow",
      explanation: "Le soleil est jaune (Yellow) ! Très bien !"
    });
  }

  const prompt = `Create a short, engaging English lesson exercise for a French child who is ${ageContext}.
    The difficulty should be ${complexity}. The topic is "${topic}".

    IMPORTANT: Generate REAL, meaningful answer options - NOT generic labels like "Option A", "Option B", etc.
    Each option must be an actual word, phrase, or answer related to the question.

    Return ONLY a JSON object with this structure:
    {
      "type": "multiple-choice",
      "question": "The question text in English. Simple sentence.",
      "options": ["Apple", "Banana", "Orange", "Grape"],
      "correctAnswer": "Apple",
      "explanation": "A short, encouraging explanation in French."
    }

    Example for a colors topic:
    {
      "type": "multiple-choice",
      "question": "What color is the sky?",
      "options": ["Blue", "Red", "Green", "Yellow"],
      "correctAnswer": "Blue",
      "explanation": "Le ciel est bleu (Blue) ! Très bien !"
    }

    NEVER use "Option A", "Option B", "Option C", "Option D" as answers.
    Ensure options are distinct and realistic. Do not wrap in markdown code blocks.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json'
    }
  });

  return response.text || "{}";
};

const generateWordOrder = async (
  topic: string,
  ageContext: string,
  complexity: string
): Promise<string> => {
  if (!ai) {
    // Return fallback if no API
    return JSON.stringify({
      type: "word-order",
      question: "Remets les mots dans le bon ordre :",
      hint: "Je suis content",
      words: ["happy", "am", "I"],
      correctOrder: ["I", "am", "happy"],
      correctAnswer: "I am happy",
      explanation: "'I am happy' signifie 'Je suis content'. Super !"
    });
  }

  const prompt = `Create a word-order exercise for a French child who is ${ageContext}.
    The difficulty should be ${complexity}. The topic is "${topic}".

    The child must arrange scrambled words to form a correct English sentence.

    Return ONLY a JSON object with this structure:
    {
      "type": "word-order",
      "question": "Remets les mots dans le bon ordre pour former une phrase en anglais :",
      "hint": "A hint in French about what the sentence means",
      "words": ["like", "I", "apples"],
      "correctOrder": ["I", "like", "apples"],
      "correctAnswer": "I like apples",
      "explanation": "Explanation in French of the sentence structure."
    }

    IMPORTANT RULES:
    - Use 3-6 words maximum for the sentence (keep it simple)
    - The "words" array must contain the SAME words as "correctOrder" but SHUFFLED
    - The words must be simple vocabulary appropriate for ${complexity} level
    - Make sentences relevant to the topic "${topic}"

    Example for greetings topic:
    {
      "type": "word-order",
      "question": "Remets les mots dans le bon ordre :",
      "hint": "Comment dit-on 'Je m'appelle Sarah' ?",
      "words": ["is", "name", "My", "Sarah"],
      "correctOrder": ["My", "name", "is", "Sarah"],
      "correctAnswer": "My name is Sarah",
      "explanation": "'My name is...' signifie 'Je m'appelle...' en anglais. Super !"
    }

    Do not wrap in markdown code blocks.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json'
    }
  });

  return response.text || "{}";
};

export const generateLessonContent = async (
  topic: string,
  profile: UserProfile
): Promise<string> => {
  try {
    const ageContext = profile.age
      ? `${profile.age} years old (${profile.grade})`
      : '8 years old';
    const complexity = profile.grade === 'CM2'
      ? 'intermediate (A1)'
      : 'beginner (A0)';

    // Randomly choose between exercise types (50% each)
    const exerciseType = Math.random() > 0.5 ? 'word-order' : 'multiple-choice';

    let text: string;
    if (exerciseType === 'word-order') {
      text = await generateWordOrder(topic, ageContext, complexity);
    } else {
      text = await generateMultipleChoice(topic, ageContext, complexity);
    }

    // Remove markdown code blocks if present
    text = text.replace(/```json\n?|\n?```/g, '').trim();

    return text;
  } catch (error) {
    console.error("Gemini generation error:", error);
    // Fallback content
    return JSON.stringify({
      type: "multiple-choice",
      question: "Which animal says 'Moo'?",
      options: ["Pig", "Cow", "Duck", "Sheep"],
      correctAnswer: "Cow",
      explanation: "C'est la vache (Cow) qui fait 'Moo' ! Bravo !"
    });
  }
};

// ============================================================================
// AI TUTOR CHAT
// ============================================================================

export const chatWithTutor = async (
  history: { role: 'user' | 'model'; text: string }[],
  message: string,
  profile: UserProfile
): Promise<string> => {
  if (!ai) {
    return "Sorry, the AI tutor needs an API key to work. Try the exercises instead!";
  }

  try {
    const ageContext = profile.age ? `${profile.age} years old` : '8 years old';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{
            text: `You are a friendly, encouraging English tutor for a French child named ${profile.name} (${ageContext}).

Your personality:
- Warm and patient like a favorite teacher
- Use simple, clear English appropriate for a child learning English
- Celebrate small wins with enthusiasm
- Gently correct mistakes without discouraging
- Use emojis sparingly to keep it fun

Guidelines:
- Keep responses short (2-3 sentences max)
- If the child makes a mistake, show the correct form kindly
- You can add French translations in parentheses for difficult words
- Ask follow-up questions to keep the conversation going
- Make learning feel like a game, not a test`
          }]
        },
        ...history.map(h => ({
          role: h.role,
          parts: [{ text: h.text }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ]
    });

    return response.text || "I didn't quite catch that, can you try again?";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Oops! Something went wrong. Let's try again!";
  }
};
