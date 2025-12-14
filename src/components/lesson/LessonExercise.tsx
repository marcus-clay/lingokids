import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  SpeakerHigh,
  Heart,
  Lightbulb,
  Check,
  X,
  CaretRight,
  Star,
} from '@phosphor-icons/react';
import type { Exercise } from '../../types';
import { synthesizeSpeech, synthesizeFrenchSpeech, playAudioBuffer } from '../../services/geminiService';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';

interface LessonExerciseProps {
  exercise: Exercise;
  exerciseNumber: number;
  totalExercises: number;
  lives: number;
  childName?: string;
  onAnswer: (correct: boolean, answer: string) => void;
  onContinue: () => void;
}

// iOS-style spring animation config
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

// LiquidGlass spring config for iPadOS-style animations
const liquidSpring = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 25,
  mass: 0.8,
};

export const LessonExercise: React.FC<LessonExerciseProps> = ({
  exercise,
  exerciseNumber,
  totalExercises,
  lives,
  childName,
  onAnswer,
  onContinue,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [hasPlayedQuestion, setHasPlayedQuestion] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Progress animation
  const progressValue = useMotionValue(0);
  const progressWidth = useTransform(progressValue, [0, 100], ['0%', '100%']);

  // Reset state when exercise changes
  useEffect(() => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setHintsUsed(0);
    setShowHint(false);
    setHasPlayedQuestion(false);
    setShowExplanation(false);
  }, [exercise.id]);

  // Animate progress bar
  useEffect(() => {
    const progress = (exerciseNumber / totalExercises) * 100;
    progressValue.set(progress);
  }, [exerciseNumber, totalExercises, progressValue]);

  // Auto-play question audio when exercise loads (progressive disclosure)
  useEffect(() => {
    if (!hasPlayedQuestion && exercise.questionEn) {
      const timer = setTimeout(() => {
        playAudio(exercise.questionEn);
        setHasPlayedQuestion(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [exercise.id, hasPlayedQuestion]);

  const playAudio = async (text: string) => {
    if (isPlayingAudio) return;

    setIsPlayingAudio(true);
    soundService.playClick();
    hapticService.lightTap();

    try {
      const audioBuffer = await synthesizeSpeech(text);
      if (audioBuffer) {
        await playAudioBuffer(audioBuffer);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
    }
    setIsPlayingAudio(false);
  };

  const playFrenchExplanation = async (text: string) => {
    if (isPlayingAudio) return;

    setIsPlayingAudio(true);
    try {
      const audioBuffer = await synthesizeFrenchSpeech(text);
      if (audioBuffer) {
        await playAudioBuffer(audioBuffer);
      }
    } catch (error) {
      console.error('French audio playback error:', error);
    }
    setIsPlayingAudio(false);
  };

  const handleSelect = (option: string) => {
    if (showFeedback) return;
    soundService.playPop();
    hapticService.selectionChanged();
    setSelectedAnswer(option);
  };

  const handleSubmit = useCallback(() => {
    if (!selectedAnswer || showFeedback) return;

    hapticService.mediumTap();
    soundService.playWhoosh();

    const correct = Array.isArray(exercise.correctAnswer)
      ? exercise.correctAnswer.includes(selectedAnswer)
      : selectedAnswer === exercise.correctAnswer;

    setIsCorrect(correct);
    setShowFeedback(true);
    onAnswer(correct, selectedAnswer);

    // Progressive disclosure: show feedback first, then explanation
    if (correct) {
      soundService.playSuccess();
      hapticService.success();
      // Play the correct answer in English after a beat
      setTimeout(() => {
        playAudio(Array.isArray(exercise.correctAnswer) ? exercise.correctAnswer[0] : exercise.correctAnswer);
      }, 600);
    } else {
      soundService.playError();
      hapticService.error();
    }

    // Reveal explanation after initial feedback (progressive disclosure)
    setTimeout(() => {
      setShowExplanation(true);
      if (exercise.explanationFr) {
        setTimeout(() => playFrenchExplanation(exercise.explanationFr), 400);
      }
    }, correct ? 1500 : 800);
  }, [selectedAnswer, showFeedback, exercise, onAnswer]);

  const handleUseHint = () => {
    if (hintsUsed < exercise.hints.length && !showFeedback) {
      soundService.playNotification();
      hapticService.lightTap();
      setHintsUsed((prev) => prev + 1);
      setShowHint(true);
    }
  };

  const handleContinue = () => {
    soundService.playClick();
    hapticService.lightTap();
    onContinue();
  };

  // Encouraging messages - iOS style concise with personalization
  const getEncouragingMessage = () => {
    if (isCorrect) {
      const messages = childName
        ? [`Super ${childName} !`, 'Bravo !', 'Excellent !', `Parfait ${childName} !`, 'Génial !']
        : ['Super !', 'Bravo !', 'Excellent !', 'Parfait !', 'Génial !'];
      return messages[Math.floor(Math.random() * messages.length)];
    } else {
      return childName ? `Presque ${childName} !` : 'Presque !';
    }
  };

  // Removed emoji function - using icons in feedback panel instead

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col">
      {/* iOS-style Header - Clean, minimal */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-gray-100/50 sticky top-0 z-50 safe-area-top">
        <div className="max-w-lg mx-auto px-5 pt-3 pb-4">
          {/* Progress Bar - Slim, elegant */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                style={{ width: progressWidth }}
                className="h-full bg-gradient-to-r from-[#58CC02] to-[#89E219] rounded-full"
                transition={gentleSpring}
              />
            </div>
            <span className="text-sm font-semibold text-gray-400 tabular-nums min-w-[40px] text-right">
              {exerciseNumber}/{totalExercises}
            </span>
          </div>

          {/* Stats Row - Minimal */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={false}
                  animate={{
                    scale: i < lives ? 1 : 0.85,
                    opacity: i < lives ? 1 : 0.3,
                  }}
                  transition={springConfig}
                >
                  <Heart
                    className={`w-6 h-6 ${
                      i < lives ? 'text-[#FF4B4B] fill-[#FF4B4B]' : 'text-gray-200 fill-gray-200'
                    }`}
                  />
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF3CD] rounded-full"
            >
              <Star className="w-4 h-4 text-[#FFB800] fill-[#FFB800]" />
              <span className="text-sm font-bold text-[#B8860B]">+{exercise.xpReward}</span>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content - Generous spacing */}
      <main className="flex-1 max-w-lg mx-auto w-full px-5 py-6 flex flex-col">
        {/* Question Card - Premium feel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={gentleSpring}
          className="mb-8"
        >
          {/* Audio Button + Question */}
          <div className="flex items-start gap-4 mb-5">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => playAudio(exercise.questionEn)}
              disabled={isPlayingAudio}
              className={`
                w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0
                shadow-lg shadow-blue-500/20 transition-all duration-200
                ${isPlayingAudio
                  ? 'bg-[#1CB0F6] scale-95'
                  : 'bg-[#1CB0F6] active:bg-[#1899D6]'
                }
              `}
            >
              <SpeakerHigh className={`w-7 h-7 text-white ${isPlayingAudio ? 'animate-pulse' : ''}`} weight="fill" />
            </motion.button>

            <div className="flex-1 pt-1">
              <h2 className="text-[26px] leading-tight font-bold text-gray-900 tracking-tight">
                {exercise.questionEn}
              </h2>
              {exercise.questionFr && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-base text-gray-500 mt-2"
                >
                  {exercise.questionFr}
                </motion.p>
              )}
            </div>
          </div>

          {/* Hint - Progressive disclosure */}
          {exercise.hints.length > 0 && !showFeedback && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUseHint}
              disabled={hintsUsed >= exercise.hints.length}
              className={`
                flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all
                ${hintsUsed >= exercise.hints.length
                  ? 'bg-gray-50 text-gray-300'
                  : 'bg-amber-50 text-amber-600 active:bg-amber-100'
                }
              `}
            >
              <Lightbulb className="w-5 h-5" weight="fill" />
              <span className="text-sm font-medium">
                {hintsUsed >= exercise.hints.length ? 'Plus d\'indices' : `Indice (${exercise.hints.length - hintsUsed})`}
              </span>
            </motion.button>
          )}

          {/* Hint Reveal */}
          <AnimatePresence>
            {showHint && hintsUsed > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={gentleSpring}
                className="mt-4 overflow-hidden"
              >
                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" weight="fill" />
                  <p className="text-amber-800 text-base font-medium">
                    {exercise.hints[hintsUsed - 1]}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Answer Options - Large touch targets */}
        <div className="flex-1 space-y-3">
          {exercise.options?.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrectAnswer = Array.isArray(exercise.correctAnswer)
              ? exercise.correctAnswer.includes(option)
              : option === exercise.correctAnswer;
            const showAsCorrect = showFeedback && isCorrectAnswer;
            const showAsWrong = showFeedback && isSelected && !isCorrectAnswer;

            return (
              <motion.button
                key={option}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.08, ...gentleSpring }}
                onClick={() => handleSelect(option)}
                disabled={showFeedback}
                whileHover={!showFeedback ? { scale: 1.02, y: -3, transition: liquidSpring } : {}}
                whileTap={!showFeedback ? { scale: 0.97, transition: liquidSpring } : {}}
                className={`
                  w-full p-5 rounded-2xl border-2 text-left transition-all duration-200
                  ${showAsCorrect
                    ? 'bg-[#D7FFB8] border-[#58CC02] shadow-lg shadow-green-500/20'
                    : showAsWrong
                    ? 'bg-[#FFDFE0] border-[#FF4B4B] shadow-lg shadow-red-500/20'
                    : isSelected
                    ? 'bg-[#DDF4FF] border-[#1CB0F6] shadow-lg shadow-blue-500/20'
                    : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/10 active:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={showAsCorrect ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className={`
                      w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold
                      ${showAsCorrect
                        ? 'bg-[#58CC02] text-white'
                        : showAsWrong
                        ? 'bg-[#FF4B4B] text-white'
                        : isSelected
                        ? 'bg-[#1CB0F6] text-white'
                        : 'bg-gray-100 text-gray-500'
                      }
                    `}
                  >
                    {showAsCorrect ? (
                      <Check className="w-6 h-6" weight="bold" />
                    ) : showAsWrong ? (
                      <X className="w-6 h-6" weight="bold" />
                    ) : (
                      String.fromCharCode(65 + index)
                    )}
                  </motion.div>
                  <span className="text-xl font-semibold text-gray-800">{option}</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Feedback Panel - Progressive disclosure */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={springConfig}
              className={`
                mt-6 rounded-3xl overflow-hidden
                ${isCorrect
                  ? 'bg-gradient-to-br from-[#D7FFB8] to-[#B8F397]'
                  : 'bg-gradient-to-br from-[#FFDFE0] to-[#FFB8BA]'
                }
              `}
            >
              {/* Header */}
              <div className="p-5 pb-4">
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, ...springConfig }}
                    className={`
                      w-14 h-14 rounded-2xl flex items-center justify-center
                      ${isCorrect ? 'bg-[#58CC02]' : 'bg-[#FF4B4B]'}
                    `}
                  >
                    {isCorrect ? (
                      <Check className="w-8 h-8 text-white" weight="bold" />
                    ) : (
                      <X className="w-8 h-8 text-white" weight="bold" />
                    )}
                  </motion.div>

                  <div className="flex-1">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                      className="flex items-center gap-2"
                    >
                      <span className={`text-2xl font-bold ${isCorrect ? 'text-[#58CC02]' : 'text-[#FF4B4B]'}`}>
                        {getEncouragingMessage()}
                      </span>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 500 }}
                      >
                        <Star className={`w-7 h-7 ${isCorrect ? 'text-[#FFB800]' : 'text-[#1CB0F6]'}`} weight="fill" />
                      </motion.div>
                    </motion.div>

                    {!isCorrect && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-[#CC3D3D] mt-1 font-medium"
                      >
                        Réponse : <span className="font-bold">
                          {Array.isArray(exercise.correctAnswer) ? exercise.correctAnswer[0] : exercise.correctAnswer}
                        </span>
                      </motion.p>
                    )}
                  </div>
                </div>
              </div>

              {/* Explanation - Revealed progressively */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={gentleSpring}
                    className={`
                      px-5 pb-5 pt-0
                    `}
                  >
                    <div className={`
                      p-4 rounded-2xl flex items-start gap-3
                      ${isCorrect ? 'bg-white/60' : 'bg-white/60'}
                    `}>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => playFrenchExplanation(exercise.explanationFr)}
                        disabled={isPlayingAudio}
                        className={`
                          w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                          ${isPlayingAudio
                            ? 'bg-purple-500 text-white'
                            : 'bg-purple-100 text-purple-600 active:bg-purple-200'
                          }
                        `}
                      >
                        <SpeakerHigh className={`w-5 h-5 ${isPlayingAudio ? 'animate-pulse' : ''}`} weight="fill" />
                      </motion.button>
                      <p className={`text-base leading-relaxed ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                        {exercise.explanationFr}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom CTA - iOS style */}
      <div className="sticky bottom-0 px-5 pb-8 pt-4 bg-gradient-to-t from-[#FAFBFC] via-[#FAFBFC] to-transparent safe-area-bottom">
        <div className="max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            {!showFeedback ? (
              <motion.button
                key="submit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                whileHover={selectedAnswer ? { scale: 1.02, y: -2, transition: liquidSpring } : {}}
                whileTap={selectedAnswer ? { scale: 0.96, transition: liquidSpring } : {}}
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className={`
                  w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200
                  ${selectedAnswer
                    ? 'bg-[#58CC02] text-white shadow-lg shadow-green-500/30 active:bg-[#4CAF00] hover:shadow-xl hover:shadow-green-500/40'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                Vérifier
              </motion.button>
            ) : (
              <motion.button
                key="continue"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                whileHover={{ scale: 1.02, y: -2, transition: liquidSpring }}
                whileTap={{ scale: 0.96, transition: liquidSpring }}
                onClick={handleContinue}
                className={`
                  w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-200
                  ${isCorrect
                    ? 'bg-[#58CC02] text-white shadow-lg shadow-green-500/30 active:bg-[#4CAF00] hover:shadow-xl hover:shadow-green-500/40'
                    : 'bg-[#1CB0F6] text-white shadow-lg shadow-blue-500/30 active:bg-[#1899D6] hover:shadow-xl hover:shadow-blue-500/40'
                  }
                `}
              >
                Continuer
                <CaretRight className="w-5 h-5" weight="bold" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
