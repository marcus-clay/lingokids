import { GoogleGenAI, Modality } from "@google/genai";
import { UserProfile } from "../types";

const apiKey = process.env.API_KEY || '';
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
      // Convert 16-bit PCM to Float32
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Generate a multiple-choice exercise
const generateMultipleChoice = async (topic: string, ageContext: string, complexity: string): Promise<string> => {
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

// Generate a word-order exercise (arrange words to form a sentence)
const generateWordOrder = async (topic: string, ageContext: string, complexity: string): Promise<string> => {
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

    Example for animals topic:
    {
      "type": "word-order",
      "question": "Remets les mots dans le bon ordre :",
      "hint": "Le chat est mignon",
      "words": ["cute", "is", "The", "cat"],
      "correctOrder": ["The", "cat", "is", "cute"],
      "correctAnswer": "The cat is cute",
      "explanation": "'The cat is cute' = Le chat est mignon. Excellent travail !"
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

export const generateLessonContent = async (topic: string, profile: UserProfile): Promise<string> => {
  try {
    const ageContext = profile.age ? `${profile.age} years old (${profile.grade})` : '8 years old';
    const complexity = profile.grade === 'CM2' ? 'intermediate (A1)' : 'beginner (A0)';

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

// Available high-quality voices for Gemini TTS
// Kore, Charon, Fenrir, Aoede, Puck are natural-sounding voices
const VOICE_OPTIONS = ['Kore', 'Aoede', 'Puck', 'Charon'] as const;
let currentVoiceIndex = 0;

// Get a consistent voice for the session
const getVoice = () => VOICE_OPTIONS[currentVoiceIndex % VOICE_OPTIONS.length];

// Synthesize speech using Gemini TTS API with high-quality settings
export const synthesizeSpeech = async (text: string): Promise<AudioBuffer | null> => {
  try {
    // Use Gemini 2.5 Flash TTS for natural speech synthesis
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: getVoice()
            },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      console.warn("No audio data received from Gemini TTS");
      return null;
    }

    // Use standard AudioContext to decode PCM data
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const rawBytes = decode(base64Audio);

    // Gemini TTS returns 24kHz mono PCM 16-bit audio
    const audioBuffer = await pcmToAudioBuffer(rawBytes, audioContext, 24000, 1);

    return audioBuffer;

  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return null;
  }
};

// Play audio buffer with proper error handling
export const playAudioBuffer = async (buffer: AudioBuffer): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.onended = () => resolve();
      source.start(0);
    } catch (error) {
      console.error("Audio playback error:", error);
      reject(error);
    }
  });
};

// Fallback: Use browser's built-in Web Speech API
export const speakWithWebSpeech = (text: string, lang: string = 'en-US'): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Web Speech API not supported'));
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9; // Slightly slower for children
    utterance.pitch = 1.1; // Slightly higher pitch

    // Try to find a good English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female')) ||
                         voices.find(v => v.lang.startsWith('en')) ||
                         voices[0];
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);

    window.speechSynthesis.speak(utterance);
  });
};

// Combined speech function: tries Gemini TTS first, falls back to Web Speech
export const speak = async (text: string): Promise<void> => {
  try {
    const buffer = await synthesizeSpeech(text);
    if (buffer) {
      await playAudioBuffer(buffer);
      return;
    }
  } catch (error) {
    console.warn("Gemini TTS failed, falling back to Web Speech:", error);
  }

  // Fallback to Web Speech API
  try {
    await speakWithWebSpeech(text);
  } catch (error) {
    console.error("All TTS methods failed:", error);
  }
};

export const chatWithTutor = async (history: {role: 'user'|'model', text: string}[], message: string, profile: UserProfile): Promise<string> => {
   try {
    const ageContext = profile.age ? `${profile.age} years old` : '8 years old';
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `You are a friendly, encouraging English tutor for a French child named ${profile.name} (${ageContext}). Keep answers short, simple, and use emojis. Correct her gently if she makes mistakes. Always speak in English but you can use parentheses for difficult French words.` }] },
        ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
        { role: 'user', parts: [{ text: message }] }
      ]
    });
    return response.text || "I didn't quite catch that, can you try again?";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Something went wrong. Let's try again!";
  }
}