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

export const generateLessonContent = async (topic: string, profile: UserProfile): Promise<string> => {
  try {
    const ageContext = profile.age ? `${profile.age} years old (${profile.grade})` : '8 years old';
    const complexity = profile.grade === 'CM2' ? 'intermediate (A1)' : 'beginner (A0)';
    
    const prompt = `Create a short, engaging English lesson exercise for a French child who is ${ageContext}.
    The difficulty should be ${complexity}. The topic is "${topic}".

    IMPORTANT: Generate REAL, meaningful answer options - NOT generic labels like "Option A", "Option B", etc.
    Each option must be an actual word, phrase, or answer related to the question.

    Return ONLY a JSON object with this structure:
    {
      "question": "The question text in English. Simple sentence.",
      "options": ["Apple", "Banana", "Orange", "Grape"],
      "correctAnswer": "Apple",
      "explanation": "A short, encouraging explanation in French."
    }

    Example for a colors topic:
    {
      "question": "What color is the sky?",
      "options": ["Blue", "Red", "Green", "Yellow"],
      "correctAnswer": "Blue",
      "explanation": "Le ciel est bleu (Blue) ! Très bien !"
    }

    Example for a greetings topic:
    {
      "question": "How do you say 'Bonjour' in English?",
      "options": ["Hello", "Goodbye", "Thank you", "Please"],
      "correctAnswer": "Hello",
      "explanation": "'Bonjour' se dit 'Hello' en anglais. Excellent !"
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

    let text = response.text || "{}";
    // Remove markdown code blocks if present
    text = text.replace(/```json\n?|\n?```/g, '').trim();
    
    return text;
  } catch (error) {
    console.error("Gemini generation error:", error);
    // Fallback content 
    return JSON.stringify({
      question: "Which animal says 'Moo'?",
      options: ["Pig", "Cow", "Duck", "Sheep"],
      correctAnswer: "Cow",
      explanation: "C'est la vache (Cow) qui fait 'Moo' ! Bravo !"
    });
  }
};

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

    // Use standard AudioContext, but we must manually decode PCM data
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const rawBytes = decode(base64Audio);
    
    // Gemini TTS typically returns 24kHz mono PCM 16-bit
    const audioBuffer = await pcmToAudioBuffer(rawBytes, audioContext, 24000, 1);
    
    return audioBuffer;

  } catch (error) {
    console.error("TTS Error:", error);
    return null;
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