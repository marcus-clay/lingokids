/**
 * VoiceService - Professional TTS for LingoKids
 *
 * Features:
 * - Multi-provider support: Google Gemini TTS (primary), ElevenLabs (optional)
 * - Persistent IndexedDB cache (100MB, 30-day expiry)
 * - Voice profiles: French teacher, English native, English child-friendly
 * - Pre-generation for lesson content
 * - Audio queue with seamless playback
 */

import { GoogleGenAI, Modality } from "@google/genai";
import { audioCacheService } from './audioCacheService';

// ============================================
// CONFIGURATION
// ============================================

const geminiApiKey = import.meta.env.VITE_API_KEY || '';
const elevenLabsApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

// Voice type definitions
export type VoiceType = 'french_teacher' | 'english_native' | 'english_child_friendly' | 'narrator' | 'celebration';

interface VoiceConfig {
  voiceName: string;
  language: 'fr' | 'en';
  description: string;
  elevenLabsVoiceId?: string;
}

const VOICE_CONFIGS: Record<VoiceType, VoiceConfig> = {
  french_teacher: {
    voiceName: 'Aoede',
    language: 'fr',
    description: 'French teacher - warm and encouraging',
    elevenLabsVoiceId: 'pNInz6obpgDQGcFmaJgB',
  },
  english_native: {
    voiceName: 'Kore',
    language: 'en',
    description: 'English native - clear pronunciation',
    elevenLabsVoiceId: 'EXAVITQu4vr4xnSDxMaL',
  },
  english_child_friendly: {
    voiceName: 'Puck',
    language: 'en',
    description: 'English child-friendly - playful and clear',
    elevenLabsVoiceId: 'jBpfuIE2acCO8z3wKNLl',
  },
  narrator: {
    voiceName: 'Charon',
    language: 'en',
    description: 'Storytelling voice',
    elevenLabsVoiceId: 'N2lVS1w4EtoT3dr4eOWO',
  },
  celebration: {
    voiceName: 'Fenrir',
    language: 'fr',
    description: 'Excited celebration voice',
  },
};

// ============================================
// AUDIO CONTEXT MANAGEMENT
// ============================================

let audioContext: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;
let isPlaying = false;
let audioQueue: Array<{ buffer: AudioBuffer; resolve: () => void }> = [];

const getAudioContext = (): AudioContext => {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

const ensureAudioContextResumed = async (): Promise<void> => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
};

// ============================================
// AUDIO CONVERSION UTILITIES
// ============================================

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

const pcmToAudioBuffer = async (
  data: ArrayBuffer,
  ctx: AudioContext,
  sampleRate: number = 24000
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data);
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(1, frameCount, sampleRate);
  const channelData = buffer.getChannelData(0);

  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
};

const formatTextForSpeech = (text: string, language: 'fr' | 'en'): string => {
  let formatted = text.trim();

  formatted = formatted
    .replace(/!/g, '! ... ')
    .replace(/\?/g, '? ... ')
    .replace(/\./g, '. ')
    .replace(/,/g, ', ')
    .replace(/:/g, ': ');

  if (language === 'fr') {
    formatted = formatted.replace(/\s+/g, ' ');
  }

  return formatted;
};

// ============================================
// TTS GENERATION (with persistent cache)
// ============================================

/**
 * Generate audio using ElevenLabs API
 */
const generateWithElevenLabs = async (
  text: string,
  voiceId: string
): Promise<ArrayBuffer | null> => {
  if (!elevenLabsApiKey) return null;

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    return response.arrayBuffer();
  } catch (error) {
    console.error('ElevenLabs generation failed:', error);
    return null;
  }
};

/**
 * Generate audio using Gemini TTS
 */
const generateWithGemini = async (
  text: string,
  config: VoiceConfig
): Promise<ArrayBuffer | null> => {
  if (!geminiApiKey) return null;

  try {
    const formattedText = formatTextForSpeech(text, config.language);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: formattedText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: config.voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    return base64ToArrayBuffer(base64Audio);
  } catch (error) {
    console.error('Gemini TTS generation failed:', error);
    return null;
  }
};

/**
 * Synthesize speech with persistent caching
 */
export const synthesizeVoice = async (
  text: string,
  voiceType: VoiceType = 'french_teacher'
): Promise<AudioBuffer | null> => {
  if (!text.trim()) return null;

  const config = VOICE_CONFIGS[voiceType];
  const provider = elevenLabsApiKey && config.elevenLabsVoiceId ? 'elevenlabs' : 'gemini';

  // Check persistent cache first
  const cached = await audioCacheService.get(text, voiceType, provider);
  if (cached) {
    console.log(`VoiceService: Cache hit for "${text.substring(0, 30)}..."`);
    const ctx = getAudioContext();
    // ElevenLabs returns MP3, Gemini returns PCM
    if (provider === 'elevenlabs') {
      return ctx.decodeAudioData(cached.slice(0));
    }
    return pcmToAudioBuffer(cached, ctx);
  }

  // Generate new audio
  let audioData: ArrayBuffer | null = null;

  // Try ElevenLabs first if available
  if (elevenLabsApiKey && config.elevenLabsVoiceId) {
    audioData = await generateWithElevenLabs(text, config.elevenLabsVoiceId);
  }

  // Fallback to Gemini
  if (!audioData) {
    audioData = await generateWithGemini(text, config);
  }

  if (!audioData) return null;

  // Store in persistent cache
  await audioCacheService.set(text, voiceType, provider, audioData);

  // Convert to AudioBuffer
  const ctx = getAudioContext();
  if (provider === 'elevenlabs' && elevenLabsApiKey && config.elevenLabsVoiceId) {
    return ctx.decodeAudioData(audioData.slice(0));
  }
  return pcmToAudioBuffer(audioData, ctx);
};

// ============================================
// PLAYBACK CONTROL
// ============================================

export const playAudio = async (buffer: AudioBuffer): Promise<void> => {
  await ensureAudioContextResumed();

  return new Promise((resolve) => {
    const ctx = getAudioContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    currentSource = source;
    isPlaying = true;

    source.onended = () => {
      isPlaying = false;
      currentSource = null;
      resolve();
      processQueue();
    };

    source.start();
  });
};

const processQueue = async (): Promise<void> => {
  if (isPlaying || audioQueue.length === 0) return;

  const next = audioQueue.shift();
  if (next) {
    await playAudio(next.buffer);
    next.resolve();
  }
};

export const queueAudio = async (buffer: AudioBuffer): Promise<void> => {
  return new Promise((resolve) => {
    audioQueue.push({ buffer, resolve });
    processQueue();
  });
};

export const stopPlayback = (): void => {
  if (currentSource) {
    try {
      currentSource.stop();
    } catch {
      // Already stopped
    }
    currentSource = null;
  }
  isPlaying = false;
  audioQueue = [];
};

export const isCurrentlyPlaying = (): boolean => isPlaying;

// ============================================
// HIGH-LEVEL VOICE FUNCTIONS
// ============================================

export const speakWelcome = async (
  childName: string | undefined,
  lessonTopic: string
): Promise<void> => {
  const greeting = childName
    ? `Bonjour ${childName} ! Aujourd'hui, nous allons apprendre ensemble sur "${lessonTopic}". C'est parti !`
    : `Bonjour ! Aujourd'hui, nous allons apprendre ensemble sur "${lessonTopic}". C'est parti !`;

  const buffer = await synthesizeVoice(greeting, 'french_teacher');
  if (buffer) await playAudio(buffer);
};

export const speakIntroduction = async (text: string): Promise<void> => {
  const buffer = await synthesizeVoice(text, 'french_teacher');
  if (buffer) await playAudio(buffer);
};

export const speakEnglishWord = async (word: string): Promise<void> => {
  const buffer = await synthesizeVoice(word, 'english_native');
  if (buffer) await playAudio(buffer);
};

export const speakExerciseIntro = async (
  exerciseNumber: number,
  totalExercises: number
): Promise<void> => {
  const intro = `Question ${exerciseNumber} sur ${totalExercises}.`;
  const buffer = await synthesizeVoice(intro, 'french_teacher');
  if (buffer) await playAudio(buffer);
};

export const speakQuestion = async (
  questionEn: string,
  questionFr?: string
): Promise<void> => {
  if (questionFr) {
    const frBuffer = await synthesizeVoice(questionFr, 'french_teacher');
    if (frBuffer) await playAudio(frBuffer);
  }

  const enBuffer = await synthesizeVoice(questionEn, 'english_child_friendly');
  if (enBuffer) await playAudio(enBuffer);
};

export const speakFeedback = async (
  isCorrect: boolean,
  childName?: string,
  explanation?: string
): Promise<void> => {
  let feedback: string;
  let voiceType: VoiceType = 'french_teacher';

  if (isCorrect) {
    const correctPhrases = childName
      ? [`Bravo ${childName} !`, `Excellent ${childName} !`, `Super ${childName} !`, `Parfait !`]
      : [`Bravo !`, `Excellent !`, `Super !`, `Parfait !`];
    feedback = correctPhrases[Math.floor(Math.random() * correctPhrases.length)];
    voiceType = 'celebration';
  } else {
    feedback = childName
      ? `Pas tout à fait ${childName}. Voyons ensemble.`
      : `Pas tout à fait. Voyons ensemble.`;
  }

  const buffer = await synthesizeVoice(feedback, voiceType);
  if (buffer) await playAudio(buffer);

  if (explanation) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const explBuffer = await synthesizeVoice(explanation, 'french_teacher');
    if (explBuffer) await playAudio(explBuffer);
  }
};

export const speakLessonComplete = async (
  childName: string | undefined,
  stars: number
): Promise<void> => {
  let celebration: string;
  let voiceType: VoiceType = stars >= 2 ? 'celebration' : 'french_teacher';

  if (stars === 3) {
    celebration = childName
      ? `Félicitations ${childName} ! Trois étoiles ! Tu es incroyable ! Continue comme ça !`
      : `Félicitations ! Trois étoiles ! Tu es incroyable ! Continue comme ça !`;
  } else if (stars === 2) {
    celebration = childName
      ? `Très bien ${childName} ! Deux étoiles ! Tu progresses super bien !`
      : `Très bien ! Deux étoiles ! Tu progresses super bien !`;
  } else if (stars === 1) {
    celebration = childName
      ? `Bien joué ${childName} ! Une étoile ! Tu peux réessayer pour en gagner plus !`
      : `Bien joué ! Une étoile ! Tu peux réessayer pour en gagner plus !`;
  } else {
    celebration = childName
      ? `Continue d'essayer ${childName} ! Tu vas y arriver !`
      : `Continue d'essayer ! Tu vas y arriver !`;
  }

  const buffer = await synthesizeVoice(celebration, voiceType);
  if (buffer) await playAudio(buffer);
};

export const speakHint = async (hint: string): Promise<void> => {
  const intro = `Voici un indice :`;
  const buffer1 = await synthesizeVoice(intro, 'french_teacher');
  if (buffer1) await playAudio(buffer1);

  await new Promise(resolve => setTimeout(resolve, 300));

  const buffer2 = await synthesizeVoice(hint, 'french_teacher');
  if (buffer2) await playAudio(buffer2);
};

export const speakStory = async (text: string): Promise<void> => {
  const buffer = await synthesizeVoice(text, 'narrator');
  if (buffer) await playAudio(buffer);
};

// ============================================
// PRELOADING & CACHE MANAGEMENT
// ============================================

/**
 * Preload common lesson phrases to reduce latency
 */
export const preloadLessonAudio = async (
  childName: string,
  lessonTopic: string
): Promise<void> => {
  const phrases = [
    { text: `Bonjour ${childName} ! Aujourd'hui, nous allons apprendre ${lessonTopic}. C'est parti !`, voice: 'french_teacher' as VoiceType },
    { text: 'Question 1 sur 6.', voice: 'french_teacher' as VoiceType },
    { text: 'Question 2 sur 6.', voice: 'french_teacher' as VoiceType },
    { text: 'Question 3 sur 6.', voice: 'french_teacher' as VoiceType },
    { text: `Bravo ${childName} !`, voice: 'celebration' as VoiceType },
    { text: `Excellent ${childName} !`, voice: 'celebration' as VoiceType },
    { text: `Pas tout à fait ${childName}. Voyons ensemble.`, voice: 'french_teacher' as VoiceType },
    { text: 'Voici un indice :', voice: 'french_teacher' as VoiceType },
  ];

  console.log('VoiceService: Preloading lesson audio...');

  for (const phrase of phrases) {
    await synthesizeVoice(phrase.text, phrase.voice);
  }

  console.log('VoiceService: Preload complete');
};

/**
 * Get audio cache statistics
 */
export const getCacheStats = async () => {
  return audioCacheService.getStats();
};

/**
 * Clear all cached audio
 */
export const clearAudioCache = async (): Promise<void> => {
  await audioCacheService.clearAll();
};

// ============================================
// EXPORT SERVICE SINGLETON
// ============================================

export const voiceService = {
  // Core functions
  synthesize: synthesizeVoice,
  play: playAudio,
  queue: queueAudio,
  stop: stopPlayback,
  isPlaying: isCurrentlyPlaying,

  // High-level speech functions
  speakWelcome,
  speakIntroduction,
  speakEnglishWord,
  speakExerciseIntro,
  speakQuestion,
  speakFeedback,
  speakLessonComplete,
  speakHint,
  speakStory,

  // Cache management
  preloadLessonAudio,
  getCacheStats,
  clearAudioCache,
};

export default voiceService;
