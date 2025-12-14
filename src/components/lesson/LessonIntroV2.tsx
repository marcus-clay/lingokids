import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SpeakerHigh,
  Play,
  CaretRight,
  ArrowLeft,
  Star,
  Clock,
  Target,
  Sparkle,
  SpeakerSimpleHigh,
  SpeakerSimpleSlash,
} from '@phosphor-icons/react';
import type { LessonIntroduction, Lesson } from '../../types';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
import { voiceService } from '../../services/voiceService';
import { IPadOSModal, ConfirmModal } from '../ui/iPadOSModal';

interface LessonIntroV2Props {
  lesson: Lesson;
  introduction: LessonIntroduction;
  childName?: string;
  totalExercises: number;
  onStart: () => void;
  onExit: () => void;
}

// Animation configs
const liquidSpring = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 25,
  mass: 0.8,
};

const gentleSpring = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 20,
};

const bounceSpring = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 15,
};

export const LessonIntroV2: React.FC<LessonIntroV2Props> = ({
  lesson,
  introduction,
  childName,
  totalExercises,
  onStart,
  onExit,
}) => {
  // Progressive disclosure phases
  const [phase, setPhase] = useState<'welcome' | 'vocabulary' | 'ready'>('welcome');
  const [playingWord, setPlayingWord] = useState<string | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showVocabModal, setShowVocabModal] = useState(false);
  const [selectedVocabIndex, setSelectedVocabIndex] = useState<number | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const hasSpokenWelcome = useRef(false);
  const hasSpokenObjective = useRef(false);

  // Auto-speak welcome message when component mounts
  useEffect(() => {
    if (!voiceEnabled || hasSpokenWelcome.current) return;

    const speakWelcome = async () => {
      hasSpokenWelcome.current = true;
      setIsSpeaking(true);

      try {
        // Small delay to let the UI render first
        await new Promise(resolve => setTimeout(resolve, 500));

        // Speak personalized welcome
        await voiceService.speakWelcome(childName, lesson.titleFr);
      } catch (error) {
        console.error('Welcome speech error:', error);
      } finally {
        setIsSpeaking(false);
      }
    };

    speakWelcome();

    return () => {
      voiceService.stop();
    };
  }, [childName, lesson.titleFr, voiceEnabled]);

  // Speak objective when vocabulary phase starts
  useEffect(() => {
    if (phase !== 'vocabulary' || !voiceEnabled || hasSpokenObjective.current) return;

    const speakObjective = async () => {
      hasSpokenObjective.current = true;
      setIsSpeaking(true);

      try {
        await voiceService.speakIntroduction(introduction.objectiveFr);
      } catch (error) {
        console.error('Objective speech error:', error);
      } finally {
        setIsSpeaking(false);
      }
    };

    speakObjective();
  }, [phase, introduction.objectiveFr, voiceEnabled]);

  // Auto-advance phases (with longer delays to account for speech)
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Phase 1 -> 2 after welcome speech (4 seconds)
    timers.push(setTimeout(() => setPhase('vocabulary'), 4000));

    // Phase 2 -> 3 after objective speech (7 seconds total)
    timers.push(setTimeout(() => setPhase('ready'), 7500));

    return () => timers.forEach(clearTimeout);
  }, []);

  // Toggle voice on/off
  const toggleVoice = useCallback(() => {
    if (voiceEnabled) {
      voiceService.stop();
    }
    setVoiceEnabled(!voiceEnabled);
    hapticService.lightTap();
  }, [voiceEnabled]);

  // Play vocabulary word
  const playAudio = async (text: string) => {
    if (playingWord || !voiceEnabled) return;

    soundService.playClick();
    hapticService.lightTap();
    setPlayingWord(text);

    try {
      await voiceService.speakEnglishWord(text);
    } catch (error) {
      console.error('Audio playback error:', error);
    }
    setPlayingWord(null);
  };

  const handleStart = () => {
    soundService.playWhoosh();
    hapticService.success();
    onStart();
  };

  const handleVocabClick = (index: number) => {
    soundService.playPop();
    hapticService.lightTap();
    setSelectedVocabIndex(index);
    setShowVocabModal(true);
  };

  const handleExitConfirm = () => {
    setShowExitModal(false);
    onExit();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header - Minimal but clear exit */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100/50 sticky top-0 z-50 safe-area-top">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Exit Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowExitModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-xl text-gray-600 font-medium hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" weight="bold" />
              <span className="text-sm">Quitter</span>
            </motion.button>

            {/* Voice Toggle & Lesson Info */}
            <div className="flex items-center gap-3">
              {/* Voice Toggle Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleVoice}
                className={`p-2.5 rounded-xl transition-colors ${
                  voiceEnabled
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-400'
                } ${isSpeaking ? 'animate-pulse' : ''}`}
                title={voiceEnabled ? 'Désactiver la voix' : 'Activer la voix'}
              >
                {voiceEnabled ? (
                  <SpeakerSimpleHigh className="w-5 h-5" weight="fill" />
                ) : (
                  <SpeakerSimpleSlash className="w-5 h-5" weight="fill" />
                )}
              </motion.button>

              {/* Lesson Info */}
              <div className="text-right">
                <p className="text-sm text-gray-400">Leçon {lesson.order}</p>
                <p className="font-bold text-gray-800">{lesson.titleFr}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Progressive Disclosure */}
      <main className="flex-1 max-w-lg mx-auto w-full px-5 py-8 flex flex-col">
        {/* Phase 1: Welcome */}
        <AnimatePresence mode="wait">
          {phase === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={gentleSpring}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              {/* Animated Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={bounceSpring}
                className="w-32 h-32 mb-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-[40px] flex items-center justify-center shadow-2xl shadow-blue-500/30"
              >
                <Sparkle className="w-16 h-16 text-white" weight="fill" />
              </motion.div>

              {/* Welcome Message */}
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-gray-900 mb-3"
              >
                {childName ? `Salut ${childName} !` : 'Bienvenue !'}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg text-gray-500 max-w-xs"
              >
                {introduction.welcomeTextFr}
              </motion.p>

              {/* Loading dots */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex gap-2 mt-8"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className="w-3 h-3 bg-blue-400 rounded-full"
                  />
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Phase 2: Vocabulary Preview */}
          {phase === 'vocabulary' && (
            <motion.div
              key="vocabulary"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={gentleSpring}
              className="flex-1 flex flex-col"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={bounceSpring}
                  className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-2xl flex items-center justify-center"
                >
                  <Target className="w-8 h-8 text-purple-600" weight="fill" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Objectif du jour
                </h2>
                <p className="text-gray-500">{introduction.objectiveFr}</p>
              </div>

              {/* Vocabulary Cards - Tappable */}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-400 mb-3">
                  Tu vas apprendre ces mots :
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {introduction.vocabulary.slice(0, 4).map((item, index) => (
                    <motion.button
                      key={item.word}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1, ...bounceSpring }}
                      whileHover={{ scale: 1.05, y: -2, transition: liquidSpring }}
                      whileTap={{ scale: 0.95, transition: liquidSpring }}
                      onClick={() => handleVocabClick(index)}
                      className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-left hover:shadow-md hover:border-blue-200 transition-all"
                    >
                      <p className="text-lg font-bold text-gray-900">{item.word}</p>
                      <p className="text-sm text-gray-400">{item.translation}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Phase 3: Ready to Start */}
          {phase === 'ready' && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={gentleSpring}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              {/* Lesson Stats */}
              <div className="flex gap-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl"
                >
                  <Clock className="w-5 h-5 text-blue-500" weight="fill" />
                  <span className="font-medium text-blue-700">~5 min</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl"
                >
                  <Star className="w-5 h-5 text-amber-500" weight="fill" />
                  <span className="font-medium text-amber-700">3 étoiles max</span>
                </motion.div>
              </div>

              {/* Play Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, ...bounceSpring }}
                className="w-28 h-28 mb-6 bg-gradient-to-br from-[#58CC02] to-[#4CAF00] rounded-[36px] flex items-center justify-center shadow-2xl shadow-green-500/40"
              >
                <Play className="w-14 h-14 text-white ml-2" weight="fill" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-2xl font-bold text-gray-900 mb-2"
              >
                Prêt{childName ? `, ${childName}` : ''} ?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-gray-500 mb-8"
              >
                {totalExercises} questions t'attendent !
              </motion.p>

              {/* Star Goals */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 w-full max-w-xs"
              >
                <p className="text-xs font-medium text-gray-400 mb-3 text-center">
                  Objectifs d'étoiles
                </p>
                <div className="flex justify-around">
                  {[
                    { stars: 1, score: '50%' },
                    { stars: 2, score: '80%' },
                    { stars: 3, score: '100%' },
                  ].map((goal) => (
                    <div key={goal.stars} className="text-center">
                      <div className="flex justify-center mb-1">
                        {[...Array(goal.stars)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 text-amber-400"
                            weight="fill"
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">{goal.score}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom CTA - Always visible in ready phase */}
      <AnimatePresence>
        {phase === 'ready' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, ...gentleSpring }}
            className="px-5 pb-8 pt-4 bg-gradient-to-t from-white via-white to-transparent safe-area-bottom"
          >
            <div className="max-w-lg mx-auto">
              <motion.button
                whileHover={{ scale: 1.02, y: -2, transition: liquidSpring }}
                whileTap={{ scale: 0.96, transition: liquidSpring }}
                onClick={handleStart}
                className="w-full bg-[#58CC02] text-white font-bold text-xl py-5 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-green-500/30 hover:shadow-2xl hover:shadow-green-500/40 transition-all"
              >
                <Play className="w-7 h-7" weight="fill" />
                <span>Commencer !</span>
                <CaretRight className="w-6 h-6" weight="bold" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip to start button during other phases */}
      {phase !== 'ready' && (
        <div className="px-5 pb-8 pt-4 safe-area-bottom">
          <div className="max-w-lg mx-auto">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPhase('ready')}
              className="w-full text-gray-400 font-medium py-3 hover:text-gray-600 transition-colors"
            >
              Passer l'introduction →
            </motion.button>
          </div>
        </div>
      )}

      {/* Vocabulary Detail Modal */}
      <IPadOSModal
        isOpen={showVocabModal}
        onClose={() => setShowVocabModal(false)}
        size="sm"
      >
        {selectedVocabIndex !== null && introduction.vocabulary[selectedVocabIndex] && (
          <div className="text-center py-4">
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={bounceSpring}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => playAudio(introduction.vocabulary[selectedVocabIndex].word)}
              className="w-20 h-20 mx-auto mb-4 bg-[#1CB0F6] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30"
            >
              <SpeakerHigh
                className={`w-10 h-10 text-white ${playingWord ? 'animate-pulse' : ''}`}
                weight="fill"
              />
            </motion.button>

            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {introduction.vocabulary[selectedVocabIndex].word}
            </h3>

            {introduction.vocabulary[selectedVocabIndex].phonetic && (
              <p className="text-gray-400 mb-2">
                {introduction.vocabulary[selectedVocabIndex].phonetic}
              </p>
            )}

            <p className="text-xl text-gray-600 mb-4">
              {introduction.vocabulary[selectedVocabIndex].translation}
            </p>

            {introduction.vocabulary[selectedVocabIndex].example && (
              <p className="text-gray-500 italic bg-gray-50 p-3 rounded-xl">
                "{introduction.vocabulary[selectedVocabIndex].example}"
              </p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowVocabModal(false)}
              className="mt-6 w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Compris !
            </motion.button>
          </div>
        )}
      </IPadOSModal>

      {/* Exit Confirmation Modal */}
      <ConfirmModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleExitConfirm}
        title="Quitter la leçon ?"
        message="Tu pourras reprendre cette leçon plus tard."
        confirmText="Quitter"
        cancelText="Rester"
      />
    </div>
  );
};

export default LessonIntroV2;
