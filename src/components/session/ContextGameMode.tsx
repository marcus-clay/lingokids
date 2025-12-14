// ============================================
// CONTEXT GAME MODE - Jeu Rapide (2 min)
// ============================================
// Jeu contextuel : choisir la bonne réplique dans un dialogue

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GameController,
  Star,
  Lightning,
  Check,
  X,
  Trophy,
  CaretRight,
  Timer,
} from '@phosphor-icons/react';
import type { Chunk } from '../../data/chunks';
import type { Situation } from '../../data/situations';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
import { voiceService } from '../../services/voiceService';
import confetti from 'canvas-confetti';

interface ContextGameModeProps {
  chunks: Chunk[];
  situation: Situation;
  onComplete: (score: number) => void;
}

interface GameQuestion {
  id: string;
  scenario: string;
  scenarioFr: string;
  correctAnswer: Chunk;
  wrongAnswers: Chunk[];
  allOptions: Chunk[];
}

export const ContextGameMode: React.FC<ContextGameModeProps> = ({
  chunks,
  situation,
  onComplete,
}) => {
  // Generate game questions from chunks
  const questions = useMemo<GameQuestion[]>(() => {
    return chunks.slice(0, 5).map((chunk, index) => {
      // Create scenario based on chunk context
      const scenarios = [
        { en: `Someone greets you. What do you say?`, fr: `Quelqu'un te salue. Que dis-tu ?` },
        { en: `You want to order food. What do you say?`, fr: `Tu veux commander. Que dis-tu ?` },
        { en: `You need help. What do you say?`, fr: `Tu as besoin d'aide. Que dis-tu ?` },
        { en: `You want to introduce yourself. What do you say?`, fr: `Tu veux te présenter. Que dis-tu ?` },
        { en: `You want to thank someone. What do you say?`, fr: `Tu veux remercier quelqu'un. Que dis-tu ?` },
      ];

      const scenario = scenarios[index % scenarios.length];

      // Get wrong answers (other chunks)
      const wrongAnswers = chunks
        .filter(c => c.id !== chunk.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      // Mix options
      const allOptions = [...wrongAnswers, chunk].sort(() => Math.random() - 0.5);

      return {
        id: `q-${index}`,
        scenario: scenario.en,
        scenarioFr: scenario.fr,
        correctAnswer: chunk,
        wrongAnswers,
        allOptions,
      };
    });
  }, [chunks]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<Chunk | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isCorrect = selectedAnswer?.id === currentQuestion?.correctAnswer.id;

  // Speak question when it changes
  useEffect(() => {
    if (!currentQuestion) return;

    // Speak the scenario in French
    voiceService.speakIntroduction(currentQuestion.scenarioFr);
  }, [currentIndex, currentQuestion?.scenarioFr]);

  // Timer countdown with tick sound
  useEffect(() => {
    if (!isTimerRunning || showFeedback) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - auto-select wrong
          handleTimeUp();
          return 0;
        }
        // Play tick sound for last 3 seconds
        if (prev <= 4) {
          soundService.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning, showFeedback, currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset timer on new question
  useEffect(() => {
    setTimeLeft(10);
    setIsTimerRunning(true);
  }, [currentIndex]);

  // Handle time up
  const handleTimeUp = useCallback(() => {
    setIsTimerRunning(false);
    setStreak(0);
    soundService.playError();
    hapticService.error();
    setShowFeedback(true);

    setTimeout(() => {
      moveToNext();
    }, 2000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle answer selection
  const handleSelectAnswer = useCallback((chunk: Chunk) => {
    if (showFeedback) return;

    setIsTimerRunning(false);
    setSelectedAnswer(chunk);
    setShowFeedback(true);

    const correct = chunk.id === currentQuestion.correctAnswer.id;

    if (correct) {
      const timeBonus = Math.floor(timeLeft / 2);
      const streakBonus = streak >= 2 ? 5 : 0;
      const points = 10 + timeBonus + streakBonus;

      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      soundService.playSuccess();
      hapticService.success();

      // Confetti for streak
      if (streak >= 2) {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.6 },
        });
      }
    } else {
      setStreak(0);
      soundService.playError();
      hapticService.error();
    }

    setTimeout(() => {
      moveToNext();
    }, 1500);
  }, [showFeedback, currentQuestion, timeLeft, streak]);

  // Move to next question
  const moveToNext = useCallback(() => {
    if (isLastQuestion) {
      soundService.playLevelUp();
      hapticService.success();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      onComplete(score);
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  }, [isLastQuestion, onComplete, score]);

  if (!currentQuestion) return null;

  // Timer color based on time left
  const getTimerColor = () => {
    if (timeLeft <= 3) return 'text-red-500';
    if (timeLeft <= 5) return 'text-orange-500';
    return 'text-green-500';
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GameController className="w-6 h-6 text-pink-500" weight="fill" />
          <span className="font-semibold text-slate-700">Jeu Rapide</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Streak */}
          {streak >= 2 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 bg-amber-100 px-3 py-1 rounded-full"
            >
              <Lightning className="w-4 h-4 text-amber-500" weight="fill" />
              <span className="font-bold text-amber-600">{streak}</span>
            </motion.div>
          )}
          {/* Score */}
          <div className="flex items-center gap-1 bg-pink-100 px-3 py-1 rounded-full">
            <Star className="w-4 h-4 text-pink-500" weight="fill" />
            <span className="font-bold text-pink-600">{score}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {questions.map((_, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className={`flex-1 h-2 rounded-full ${
              idx < currentIndex ? 'bg-pink-400'
              : idx === currentIndex ? 'bg-pink-500'
              : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Timer */}
      <div className="flex justify-center mb-6">
        <motion.div
          animate={{
            scale: timeLeft <= 3 ? [1, 1.1, 1] : 1,
          }}
          transition={{ duration: 0.5, repeat: timeLeft <= 3 ? Infinity : 0 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            timeLeft <= 3 ? 'bg-red-100' : 'bg-slate-100'
          }`}
        >
          <Timer className={`w-5 h-5 ${getTimerColor()}`} weight="fill" />
          <span className={`font-mono font-bold text-xl ${getTimerColor()}`}>
            {timeLeft}s
          </span>
        </motion.div>
      </div>

      {/* Question Card */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 mb-6"
      >
        <p className="text-xl font-bold text-slate-800 text-center mb-2">
          {currentQuestion.scenarioFr}
        </p>
        <p className="text-slate-400 text-center text-sm">
          {currentQuestion.scenario}
        </p>
      </motion.div>

      {/* Answer Options */}
      <div className="flex-1 space-y-3">
        {currentQuestion.allOptions.map((option, idx) => {
          const isSelected = selectedAnswer?.id === option.id;
          const isCorrectAnswer = option.id === currentQuestion.correctAnswer.id;
          const showCorrect = showFeedback && isCorrectAnswer;
          const showWrong = showFeedback && isSelected && !isCorrectAnswer;

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              whileHover={!showFeedback ? { scale: 1.02, x: 5 } : {}}
              whileTap={!showFeedback ? { scale: 0.98 } : {}}
              onClick={() => handleSelectAnswer(option)}
              disabled={showFeedback}
              className={`
                w-full p-4 rounded-2xl border-3 text-left transition-all
                ${showCorrect
                  ? 'bg-green-100 border-green-400'
                  : showWrong
                  ? 'bg-red-100 border-red-400'
                  : isSelected
                  ? 'bg-pink-100 border-pink-400'
                  : 'bg-white border-slate-200 hover:border-pink-300 hover:bg-pink-50'
                }
              `}
            >
              <div className="flex items-center gap-4">
                {/* Letter indicator */}
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg
                  ${showCorrect
                    ? 'bg-green-500 text-white'
                    : showWrong
                    ? 'bg-red-500 text-white'
                    : 'bg-slate-100 text-slate-500'
                  }
                `}>
                  {showCorrect ? (
                    <Check className="w-5 h-5" weight="bold" />
                  ) : showWrong ? (
                    <X className="w-5 h-5" weight="bold" />
                  ) : (
                    String.fromCharCode(65 + idx)
                  )}
                </div>

                {/* Option text */}
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{option.english}</p>
                  <p className="text-sm text-slate-400">{option.french}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Feedback Toast */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`
              fixed bottom-8 left-4 right-4 max-w-md mx-auto p-4 rounded-2xl shadow-xl
              ${isCorrect || !selectedAnswer
                ? isCorrect ? 'bg-green-500' : 'bg-orange-500'
                : 'bg-red-500'
              }
            `}
          >
            <div className="flex items-center gap-3 text-white">
              {isCorrect ? (
                <>
                  <Check className="w-6 h-6" weight="bold" />
                  <div>
                    <p className="font-bold">Excellent !</p>
                    <p className="text-sm text-white/80">
                      +{10 + Math.floor(timeLeft / 2)}{streak >= 2 ? ' (+5 série)' : ''} points
                    </p>
                  </div>
                </>
              ) : !selectedAnswer ? (
                <>
                  <Timer className="w-6 h-6" weight="bold" />
                  <div>
                    <p className="font-bold">Temps écoulé !</p>
                    <p className="text-sm text-white/80">
                      La réponse était : {currentQuestion.correctAnswer.english}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <X className="w-6 h-6" weight="bold" />
                  <div>
                    <p className="font-bold">Pas tout à fait...</p>
                    <p className="text-sm text-white/80">
                      La réponse était : {currentQuestion.correctAnswer.english}
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContextGameMode;
