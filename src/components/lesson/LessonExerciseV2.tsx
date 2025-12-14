import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SpeakerHigh,
  Heart,
  Lightbulb,
  Check,
  X,
  CaretRight,
  Star,
  ArrowLeft,
  Lightning,
  SpeakerSimpleHigh,
  SpeakerSimpleSlash,
} from '@phosphor-icons/react';
import confetti from 'canvas-confetti';
import type { Exercise } from '../../types';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
import { voiceService } from '../../services/voiceService';
import { IPadOSModal, CelebrationModal } from '../ui/iPadOSModal';

interface LessonExerciseV2Props {
  exercise: Exercise;
  exerciseNumber: number;
  totalExercises: number;
  lives: number;
  childName?: string;
  onAnswer: (correct: boolean, answer: string) => void;
  onContinue: () => void;
  onExit: () => void;
}

// LiquidGlass spring configs
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

export const LessonExerciseV2: React.FC<LessonExerciseV2Props> = ({
  exercise,
  exerciseNumber,
  totalExercises,
  lives,
  childName,
  onAnswer,
  onContinue,
  onExit,
}) => {
  // Phase states for progressive disclosure
  const [phase, setPhase] = useState<'question' | 'answer' | 'feedback'>('question');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showStreakBonus, setShowStreakBonus] = useState(false);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const hasSpokenQuestion = useRef(false);

  // Reset state when exercise changes
  useEffect(() => {
    setPhase('question');
    setSelectedAnswer(null);
    setIsCorrect(false);
    setShowHint(false);
    setHintsUsed(0);
    hasSpokenQuestion.current = false;
  }, [exercise.id]);

  // Auto-speak exercise intro and question
  useEffect(() => {
    if (!voiceEnabled || hasSpokenQuestion.current) return;

    let isCancelled = false;

    const speakExercise = async () => {
      hasSpokenQuestion.current = true;
      setIsPlayingAudio(true);

      try {
        // Small delay to let UI render and ensure AudioContext is ready
        await new Promise(resolve => setTimeout(resolve, 400));

        if (isCancelled) return;

        // Announce exercise number
        await voiceService.speakExerciseIntro(exerciseNumber, totalExercises);

        if (isCancelled) return;

        // Small pause
        await new Promise(resolve => setTimeout(resolve, 500));

        if (isCancelled) return;

        // Read the question (French context + English question)
        await voiceService.speakQuestion(exercise.questionEn, exercise.questionFr);
      } catch (error) {
        console.error('Question speech error:', error);
      } finally {
        if (!isCancelled) {
          setIsPlayingAudio(false);
        }
      }
    };

    speakExercise();

    return () => {
      isCancelled = true;
      // Don't stop playback on cleanup - let it finish naturally
    };
  }, [exercise.id, exerciseNumber, totalExercises, exercise.questionEn, exercise.questionFr, voiceEnabled]);

  // Toggle voice on/off
  const toggleVoice = useCallback(() => {
    if (voiceEnabled) {
      voiceService.stop();
    }
    setVoiceEnabled(!voiceEnabled);
    hapticService.lightTap();
  }, [voiceEnabled]);

  // Manual play audio - replays the full question
  const playAudio = async () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      // Replay the question (French context + English question)
      await voiceService.speakQuestion(exercise.questionEn, exercise.questionFr);
    } catch (error) {
      console.error('Audio error:', error);
    }
    setIsPlayingAudio(false);
  };

  const handleSelect = (option: string) => {
    if (phase !== 'question') return;
    soundService.playPop();
    hapticService.selectionChanged();
    setSelectedAnswer(option);
    setPhase('answer');
  };

  const handleSubmit = useCallback(() => {
    if (!selectedAnswer || phase !== 'answer') return;

    const correct = Array.isArray(exercise.correctAnswer)
      ? exercise.correctAnswer.includes(selectedAnswer)
      : selectedAnswer === exercise.correctAnswer;

    setIsCorrect(correct);
    setPhase('feedback');
    onAnswer(correct, selectedAnswer);

    if (correct) {
      soundService.playSuccess();
      hapticService.success();
      setConsecutiveCorrect(prev => prev + 1);

      // Streak bonus for 3+ correct in a row
      if (consecutiveCorrect >= 2) {
        setShowStreakBonus(true);
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#FFD700', '#FFA500'],
        });
      }

      // Celebration confetti for correct answer
      confetti({
        particleCount: 20,
        spread: 40,
        origin: { y: 0.8 },
      });

      // Speak positive feedback
      if (voiceEnabled) {
        setTimeout(() => {
          voiceService.speakFeedback(true, childName);
        }, 300);
      }
    } else {
      soundService.playError();
      hapticService.error();
      setConsecutiveCorrect(0);

      // Speak corrective feedback with explanation
      if (voiceEnabled) {
        setTimeout(() => {
          voiceService.speakFeedback(false, childName, exercise.explanationFr);
        }, 300);
      }
    }
  }, [selectedAnswer, phase, exercise, onAnswer, consecutiveCorrect, voiceEnabled, childName]);

  const handleUseHint = () => {
    if (hintsUsed < exercise.hints.length && phase === 'question') {
      soundService.playNotification();
      hapticService.lightTap();
      const hintIndex = hintsUsed;
      setHintsUsed(prev => prev + 1);
      setShowHint(true);

      // Speak the hint
      if (voiceEnabled && exercise.hints[hintIndex]) {
        voiceService.speakHint(exercise.hints[hintIndex]);
      }
    }
  };

  const handleContinue = () => {
    soundService.playClick();
    hapticService.lightTap();
    setShowStreakBonus(false);
    onContinue();
  };

  const handleExitConfirm = () => {
    setShowExitModal(false);
    onExit();
  };

  // Progress percentage
  const progress = (exerciseNumber / totalExercises) * 100;

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col">
      {/* Minimal Header - Maximum Focus */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-gray-100/50 sticky top-0 z-50 safe-area-top">
        <div className="max-w-lg mx-auto px-4 py-3">
          {/* Top Row: Exit + Voice + Lives */}
          <div className="flex items-center justify-between mb-3">
            {/* Exit Button - Very Visible */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowExitModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-xl text-gray-600 font-medium hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" weight="bold" />
              <span className="text-sm">Quitter</span>
            </motion.button>

            {/* Voice Toggle + Lives */}
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
                } ${isPlayingAudio ? 'animate-pulse' : ''}`}
                title={voiceEnabled ? 'Désactiver la voix' : 'Activer la voix'}
              >
                {voiceEnabled ? (
                  <SpeakerSimpleHigh className="w-5 h-5" weight="fill" />
                ) : (
                  <SpeakerSimpleSlash className="w-5 h-5" weight="fill" />
                )}
              </motion.button>

              {/* Lives Display */}
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: i < lives ? 1 : 0.8,
                      opacity: i < lives ? 1 : 0.3,
                    }}
                    transition={liquidSpring}
                  >
                    <Heart
                      className={`w-6 h-6 ${
                        i < lives ? 'text-[#FF4B4B]' : 'text-gray-200'
                      }`}
                      weight="fill"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Progress Bar - Shows exact position */}
          <div className="relative">
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={gentleSpring}
                className="h-full bg-gradient-to-r from-[#58CC02] to-[#89E219] rounded-full"
              />
            </div>
            {/* Step Indicators */}
            <div className="absolute inset-0 flex items-center justify-between px-1">
              {[...Array(totalExercises)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`w-2 h-2 rounded-full ${
                    i < exerciseNumber
                      ? 'bg-white'
                      : i === exerciseNumber - 1
                      ? 'bg-white ring-2 ring-green-400'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Exercise Counter */}
          <div className="flex items-center justify-center mt-2">
            <span className="text-sm font-semibold text-gray-500">
              Question {exerciseNumber} sur {totalExercises}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content - Maximum Focus */}
      <main className="flex-1 max-w-lg mx-auto w-full px-5 py-6 flex flex-col">
        {/* Question Phase */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={gentleSpring}
            className="flex-1 flex flex-col"
          >
            {/* Question Card - Clean & Focused */}
            <div className="mb-6">
              {/* Audio Button + Question */}
              <div className="flex items-start gap-4 mb-4">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={playAudio}
                  disabled={isPlayingAudio}
                  className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0
                    shadow-lg shadow-blue-500/20 transition-all
                    ${isPlayingAudio ? 'bg-[#1CB0F6] scale-95' : 'bg-[#1CB0F6]'}
                  `}
                >
                  <SpeakerHigh
                    className={`w-8 h-8 text-white ${isPlayingAudio ? 'animate-pulse' : ''}`}
                    weight="fill"
                  />
                </motion.button>

                <div className="flex-1 pt-2">
                  <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-2xl font-bold text-gray-900 leading-tight"
                  >
                    {exercise.questionEn}
                  </motion.h1>
                </div>
              </div>

              {/* French Context - Subtle */}
              {exercise.questionFr && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-500 ml-20"
                >
                  {exercise.questionFr}
                </motion.p>
              )}
            </div>

            {/* Hint Button - Only in question phase */}
            {phase === 'question' && exercise.hints.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-4"
              >
                {!showHint ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUseHint}
                    disabled={hintsUsed >= exercise.hints.length}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors"
                  >
                    <Lightbulb className="w-5 h-5" weight="fill" />
                    <span className="text-sm font-medium">Besoin d'un indice ?</span>
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-amber-50 rounded-2xl border border-amber-100"
                  >
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" weight="fill" />
                      <p className="text-amber-800 font-medium">{exercise.hints[hintsUsed - 1]}</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Answer Options - Large Touch Targets */}
            <div className="flex-1 space-y-3">
              {(exercise.options && exercise.options.length > 0 ? exercise.options : ['Option A', 'Option B', 'Option C', 'Option D']).map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrectOption = Array.isArray(exercise.correctAnswer)
                  ? exercise.correctAnswer.includes(option)
                  : option === exercise.correctAnswer;
                const showCorrect = phase === 'feedback' && isCorrectOption;
                const showWrong = phase === 'feedback' && isSelected && !isCorrectOption;

                return (
                  <motion.button
                    key={option}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.08, ...gentleSpring }}
                    onClick={() => handleSelect(option)}
                    disabled={phase !== 'question'}
                    whileHover={phase === 'question' ? { scale: 1.02, x: 5, transition: liquidSpring } : {}}
                    whileTap={phase === 'question' ? { scale: 0.98, transition: liquidSpring } : {}}
                    className={`
                      w-full p-5 rounded-2xl border-3 text-left transition-all duration-200
                      ${showCorrect
                        ? 'bg-[#D7FFB8] border-[#58CC02] shadow-lg shadow-green-500/20'
                        : showWrong
                        ? 'bg-[#FFDFE0] border-[#FF4B4B] shadow-lg shadow-red-500/20'
                        : isSelected
                        ? 'bg-[#DDF4FF] border-[#1CB0F6] shadow-lg shadow-blue-500/20'
                        : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/10'
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      {/* Option Letter/Icon */}
                      <motion.div
                        animate={showCorrect ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 0.3 }}
                        className={`
                          w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold
                          ${showCorrect
                            ? 'bg-[#58CC02] text-white'
                            : showWrong
                            ? 'bg-[#FF4B4B] text-white'
                            : isSelected
                            ? 'bg-[#1CB0F6] text-white'
                            : 'bg-gray-100 text-gray-500'
                          }
                        `}
                      >
                        {showCorrect ? (
                          <Check className="w-6 h-6" weight="bold" />
                        ) : showWrong ? (
                          <X className="w-6 h-6" weight="bold" />
                        ) : (
                          String.fromCharCode(65 + index)
                        )}
                      </motion.div>

                      {/* Option Text */}
                      <span className="text-xl font-semibold text-gray-800 flex-1">{option}</span>

                      {/* Selection indicator */}
                      {isSelected && phase === 'answer' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-[#1CB0F6] rounded-full flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 text-white" weight="bold" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback Panel - Progressive Disclosure */}
            <AnimatePresence>
              {phase === 'feedback' && (
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 50, scale: 0.9 }}
                  transition={bounceSpring}
                  className={`
                    mt-6 rounded-3xl overflow-hidden
                    ${isCorrect
                      ? 'bg-gradient-to-br from-[#D7FFB8] to-[#B8F397]'
                      : 'bg-gradient-to-br from-[#FFDFE0] to-[#FFB8BA]'
                    }
                  `}
                >
                  <div className="p-5">
                    <div className="flex items-center gap-4">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={bounceSpring}
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
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className={`text-2xl font-bold ${isCorrect ? 'text-[#58CC02]' : 'text-[#FF4B4B]'}`}
                        >
                          {isCorrect
                            ? childName ? `Bravo ${childName} !` : 'Bravo !'
                            : 'Pas tout à fait...'}
                        </motion.p>

                        {!isCorrect && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-[#CC3D3D] font-medium"
                          >
                            La réponse était : {Array.isArray(exercise.correctAnswer)
                              ? exercise.correctAnswer[0]
                              : exercise.correctAnswer}
                          </motion.p>
                        )}
                      </div>

                      {/* XP Badge */}
                      {isCorrect && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, ...bounceSpring }}
                          className="px-3 py-1.5 bg-amber-400 rounded-full"
                        >
                          <span className="text-white font-bold">+{exercise.xpReward} XP</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Explanation - Shown after delay */}
                    {exercise.explanationFr && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ delay: 0.5, ...gentleSpring }}
                        className="mt-4 pt-4 border-t border-black/10"
                      >
                        <p className={`text-base ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                          {exercise.explanationFr}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom CTA - Fixed */}
      <div className="sticky bottom-0 px-5 pb-8 pt-4 bg-gradient-to-t from-[#FAFBFC] via-[#FAFBFC] to-transparent safe-area-bottom">
        <div className="max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            {phase === 'answer' && (
              <motion.button
                key="submit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ scale: 1.02, y: -2, transition: liquidSpring }}
                whileTap={{ scale: 0.96, transition: liquidSpring }}
                onClick={handleSubmit}
                className="w-full py-4 rounded-2xl font-bold text-lg bg-[#58CC02] text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all"
              >
                Vérifier ma réponse
              </motion.button>
            )}

            {phase === 'feedback' && (
              <motion.button
                key="continue"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ scale: 1.02, y: -2, transition: liquidSpring }}
                whileTap={{ scale: 0.96, transition: liquidSpring }}
                onClick={handleContinue}
                className={`
                  w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all
                  ${isCorrect
                    ? 'bg-[#58CC02] text-white shadow-green-500/30 hover:shadow-green-500/40'
                    : 'bg-[#1CB0F6] text-white shadow-blue-500/30 hover:shadow-blue-500/40'
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

      {/* Exit Confirmation Modal */}
      <IPadOSModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        size="sm"
        variant="warning"
      >
        <div className="text-center py-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={bounceSpring}
            className="w-20 h-20 mx-auto mb-4 bg-orange-100 rounded-3xl flex items-center justify-center"
          >
            <ArrowLeft className="w-10 h-10 text-orange-500" weight="bold" />
          </motion.div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">Quitter la leçon ?</h3>
          <p className="text-gray-500 mb-6">Ta progression dans cette leçon sera perdue.</p>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowExitModal(false)}
              className="flex-1 py-3 px-4 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
            >
              Rester
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExitConfirm}
              className="flex-1 py-3 px-4 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors"
            >
              Quitter
            </motion.button>
          </div>
        </div>
      </IPadOSModal>

      {/* Streak Bonus Modal */}
      <CelebrationModal
        isOpen={showStreakBonus}
        onClose={() => setShowStreakBonus(false)}
        title="Série en cours !"
        subtitle={`${consecutiveCorrect + 1} bonnes réponses d'affilée !`}
        icon={<Lightning className="w-12 h-12 text-amber-600" weight="fill" />}
        rewards={[{ type: 'xp', amount: 5 }]}
        actionText="Continuer"
      />
    </div>
  );
};

export default LessonExerciseV2;
