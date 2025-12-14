import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SpeakerHigh,
  Play,
  CaretRight,
  Lightbulb,
  BookOpen,
  HandWaving,
  Target,
  Books,
} from '@phosphor-icons/react';
import type { LessonIntroduction, Lesson } from '../../types';
import { synthesizeSpeech, synthesizeFrenchSpeech, playAudioBuffer } from '../../services/geminiService';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';

interface LessonIntroProps {
  lesson: Lesson;
  introduction: LessonIntroduction;
  childName?: string;
  onStart: () => void;
}

// iOS-style spring animation
const springConfig = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
};

const gentleSpring = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 20,
};

// LiquidGlass spring config
const liquidSpring = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 25,
  mass: 0.8,
};

export const LessonIntro: React.FC<LessonIntroProps> = ({
  lesson,
  introduction,
  childName,
  onStart,
}) => {
  const [playingWord, setPlayingWord] = useState<string | null>(null);
  const [hasPlayedWelcome, setHasPlayedWelcome] = useState(false);
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [showFunFact, setShowFunFact] = useState(false);

  // Progressive disclosure - reveal sections with delay
  useEffect(() => {
    const vocabTimer = setTimeout(() => setShowVocabulary(true), 800);
    const factTimer = setTimeout(() => setShowFunFact(true), 1500);
    return () => {
      clearTimeout(vocabTimer);
      clearTimeout(factTimer);
    };
  }, []);

  // Auto-play welcome message
  useEffect(() => {
    if (!hasPlayedWelcome && introduction.welcomeTextFr) {
      const timer = setTimeout(async () => {
        setHasPlayedWelcome(true);
        await playFrenchAudio(introduction.welcomeTextFr);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [hasPlayedWelcome, introduction.welcomeTextFr]);

  const playAudio = async (text: string) => {
    if (playingWord) return;

    soundService.playClick();
    hapticService.lightTap();
    setPlayingWord(text);

    try {
      const audioBuffer = await synthesizeSpeech(text);
      if (audioBuffer) {
        await playAudioBuffer(audioBuffer);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
    }
    setPlayingWord(null);
  };

  const playFrenchAudio = async (text: string) => {
    if (playingWord) return;

    setPlayingWord(text);
    try {
      const audioBuffer = await synthesizeFrenchSpeech(text);
      if (audioBuffer) {
        await playAudioBuffer(audioBuffer);
      }
    } catch (error) {
      console.error('French audio playback error:', error);
    }
    setPlayingWord(null);
  };

  const handleStart = () => {
    soundService.playWhoosh();
    hapticService.mediumTap();
    onStart();
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col">
      {/* iOS-style Header */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-gray-100/50 sticky top-0 z-50 safe-area-top">
        <div className="max-w-lg mx-auto px-5 py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#1CB0F6] to-[#0096D6] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BookOpen className="w-6 h-6 text-white" weight="fill" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-400">Leçon {lesson.order}</p>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">{lesson.titleFr}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-5 py-6 space-y-5 pb-32">
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={gentleSpring}
          className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <HandWaving className="w-7 h-7 text-amber-600" weight="fill" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-bold text-gray-900">
                  {childName ? `Salut ${childName} !` : 'Bienvenue !'}
                </h2>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => playFrenchAudio(introduction.welcomeTextFr)}
                  disabled={playingWord !== null}
                  className={`
                    w-8 h-8 rounded-lg flex items-center justify-center
                    ${playingWord === introduction.welcomeTextFr
                      ? 'bg-purple-500 text-white'
                      : 'bg-purple-100 text-purple-600 active:bg-purple-200'
                    }
                  `}
                >
                  <SpeakerHigh className={`w-4 h-4 ${playingWord === introduction.welcomeTextFr ? 'animate-pulse' : ''}`} weight="fill" />
                </motion.button>
              </div>
              <p className="text-base text-gray-600 leading-relaxed">
                {introduction.welcomeTextFr}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Objective Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ...gentleSpring }}
          className="bg-gradient-to-br from-[#1CB0F6] to-[#0077B6] rounded-3xl p-5 shadow-lg shadow-blue-500/20"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-white" weight="fill" />
            </div>
            <h3 className="text-lg font-bold text-white">Objectif du jour</h3>
          </div>
          <p className="text-blue-100 text-base leading-relaxed">{introduction.objectiveFr}</p>
        </motion.div>

        {/* Vocabulary Section - Progressive disclosure */}
        <AnimatePresence>
          {showVocabulary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={gentleSpring}
              className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <Books className="w-5 h-5 text-purple-600" weight="fill" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Vocabulaire à découvrir</h3>
              </div>

              <div className="space-y-2">
                {introduction.vocabulary.map((item, index) => (
                  <motion.div
                    key={item.word}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, ...gentleSpring }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl active:bg-gray-100 transition-colors cursor-pointer hover:shadow-lg hover:shadow-blue-500/10 hover:bg-white"
                  >
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.85 }}
                      transition={liquidSpring}
                      onClick={() => playAudio(item.word)}
                      disabled={playingWord !== null}
                      className={`
                        w-12 h-12 rounded-xl flex items-center justify-center transition-all
                        ${playingWord === item.word
                          ? 'bg-[#1CB0F6] scale-95'
                          : 'bg-[#1CB0F6] shadow-md shadow-blue-500/20'
                        }
                      `}
                    >
                      <SpeakerHigh className={`w-6 h-6 text-white ${playingWord === item.word ? 'animate-pulse' : ''}`} weight="fill" />
                    </motion.button>

                    <div className="flex-1 min-w-0">
                      <p className="text-xl font-bold text-gray-900">{item.word}</p>
                      <p className="text-base text-gray-500">{item.translation}</p>
                    </div>

                    {item.example && (
                      <div className="hidden sm:block text-right max-w-[140px]">
                        <p className="text-sm text-gray-400 italic truncate">"{item.example}"</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fun Fact - Progressive disclosure */}
        <AnimatePresence>
          {showFunFact && introduction.funFact && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={gentleSpring}
              className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-5 border border-amber-100"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-200 to-orange-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-amber-700" weight="fill" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-amber-700 mb-1">Le savais-tu ?</p>
                  <p className="text-base text-amber-800 leading-relaxed">{introduction.funFact}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Start Button - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-gradient-to-t from-[#FAFBFC] via-[#FAFBFC] to-transparent safe-area-bottom">
        <div className="max-w-lg mx-auto">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, ...gentleSpring }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleStart}
            className="w-full bg-[#58CC02] text-white font-bold text-lg py-4 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-green-500/30 active:bg-[#4CAF00] transition-all hover:shadow-xl hover:shadow-green-500/40"
          >
            <Play className="w-6 h-6" weight="fill" />
            <span>{childName ? `C'est parti ${childName} !` : 'Commencer les exercices'}</span>
            <CaretRight className="w-5 h-5" weight="bold" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};
