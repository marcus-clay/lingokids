import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Trophy,
  Flame,
  Diamond,
  CaretRight,
  House,
  ArrowCounterClockwise,
  CheckCircle,
  Notepad,
  Confetti,
  HandsClapping,
  Medal,
  Barbell,
} from '@phosphor-icons/react';
import confetti from 'canvas-confetti';
import type { LessonSummary, Lesson } from '../../types';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';

interface LessonCompleteProps {
  lesson: Lesson;
  summary: LessonSummary;
  score: number;
  totalExercises: number;
  xpEarned: number;
  gemsEarned: number;
  streakDay: number;
  childName?: string;
  onGoHome: () => void;
  onNextLesson?: () => void;
  onRetry?: () => void;
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

export const LessonComplete: React.FC<LessonCompleteProps> = ({
  lesson,
  summary,
  score,
  totalExercises,
  xpEarned,
  gemsEarned,
  streakDay,
  childName,
  onGoHome,
  onNextLesson,
  onRetry,
}) => {
  const [showStats, setShowStats] = useState(false);
  const [showKeyPoints, setShowKeyPoints] = useState(false);
  const percentage = Math.round((score / totalExercises) * 100);
  const stars = percentage >= 100 ? 3 : percentage >= 80 ? 2 : percentage >= 50 ? 1 : 0;

  useEffect(() => {
    // Play celebration sounds
    if (percentage >= 80) {
      soundService.playCelebration();
      hapticService.celebration();
    } else if (percentage >= 50) {
      soundService.playSuccess();
      hapticService.success();
    }

    // Trigger confetti on mount for good scores
    if (percentage >= 50) {
      const particleCount = percentage >= 100 ? 150 : percentage >= 80 ? 100 : 50;

      confetti({
        particleCount,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#7B68EE', '#00CED1'],
      });

      if (percentage >= 100) {
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 500);
      }
    }

    // Progressive disclosure - show stats with delay
    setTimeout(() => setShowStats(true), 600);
    setTimeout(() => setShowKeyPoints(true), 1200);
  }, [percentage]);

  // Get result icon based on percentage
  const ResultIcon = () => {
    if (percentage >= 100) {
      return <Trophy className="w-12 h-12 text-amber-500" weight="fill" />;
    }
    if (percentage >= 80) {
      return <Medal className="w-12 h-12 text-amber-500" weight="fill" />;
    }
    if (percentage >= 50) {
      return <HandsClapping className="w-12 h-12 text-amber-500" weight="fill" />;
    }
    return <Barbell className="w-12 h-12 text-blue-500" weight="fill" />;
  };

  const getResultMessage = () => {
    if (percentage >= 100) return childName ? `Parfait ${childName} !` : 'Parfait !';
    if (percentage >= 80) return childName ? `Excellent ${childName} !` : 'Excellent !';
    if (percentage >= 50) return childName ? `Bien joué ${childName} !` : 'Bien joué !';
    return childName ? `Continue ${childName} !` : 'Continue !';
  };

  const handleNextLesson = () => {
    soundService.playClick();
    hapticService.mediumTap();
    onNextLesson?.();
  };

  const handleRetry = () => {
    soundService.playClick();
    hapticService.lightTap();
    onRetry?.();
  };

  const handleGoHome = () => {
    soundService.playClick();
    hapticService.lightTap();
    onGoHome();
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col">
      {/* Celebration Header */}
      <header className="text-center pt-12 pb-6 px-5">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ ...springConfig, delay: 0.1 }}
          className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl flex items-center justify-center shadow-lg"
        >
          <ResultIcon />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ...gentleSpring }}
          className="text-3xl font-bold text-gray-900 mb-2"
        >
          {getResultMessage()}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-base text-gray-500 max-w-xs mx-auto"
        >
          {summary.congratsTextFr}
        </motion.p>
      </header>

      {/* Stars Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, ...springConfig }}
        className="flex justify-center gap-3 mb-8 px-5"
      >
        {[1, 2, 3].map((starNum) => (
          <motion.div
            key={starNum}
            initial={{ rotate: -180, opacity: 0, scale: 0 }}
            animate={{
              rotate: 0,
              opacity: 1,
              scale: starNum <= stars ? 1 : 0.8,
            }}
            transition={{ delay: 0.5 + starNum * 0.15, ...springConfig }}
          >
            <Star
              className={`w-14 h-14 ${
                starNum <= stars
                  ? 'text-[#FFB800] drop-shadow-lg'
                  : 'text-gray-200'
              }`}
              weight={starNum <= stars ? 'fill' : 'regular'}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Stats Cards */}
      <main className="flex-1 max-w-lg mx-auto w-full px-5 space-y-4 pb-32">
        <AnimatePresence>
          {showStats && (
            <>
              {/* Score Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={gentleSpring}
                className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                      <Trophy className="w-7 h-7 text-blue-600" weight="fill" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 font-medium">Score</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {score}/{totalExercises}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-[#1CB0F6]">{percentage}%</p>
                  </div>
                </div>
              </motion.div>

              {/* XP & Gems */}
              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, ...gentleSpring }}
                  className="bg-gradient-to-br from-[#A855F7] to-[#7C3AED] rounded-3xl p-5 shadow-lg shadow-purple-500/20"
                >
                  <Star className="w-8 h-8 mb-2 text-yellow-300" weight="fill" />
                  <p className="text-purple-200 text-sm font-medium">XP Gagnés</p>
                  <p className="text-3xl font-bold text-white">+{xpEarned}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, ...gentleSpring }}
                  className="bg-gradient-to-br from-[#EC4899] to-[#BE185D] rounded-3xl p-5 shadow-lg shadow-pink-500/20"
                >
                  <Diamond className="w-8 h-8 mb-2 text-pink-200" weight="fill" />
                  <p className="text-pink-200 text-sm font-medium">Gems</p>
                  <p className="text-3xl font-bold text-white">+{gemsEarned}</p>
                </motion.div>
              </div>

              {/* Streak */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, ...gentleSpring }}
                className="bg-gradient-to-r from-[#F97316] to-[#EF4444] rounded-3xl p-5 shadow-lg shadow-orange-500/20 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Flame className="w-8 h-8 text-white" weight="fill" />
                  </div>
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Série active</p>
                    <p className="text-3xl font-bold text-white">{streakDay} jour{streakDay > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <Confetti className="w-12 h-12 text-white/80" weight="fill" />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Key Points - Progressive disclosure */}
        <AnimatePresence>
          {showKeyPoints && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={gentleSpring}
              className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                  <Notepad className="w-5 h-5 text-green-600" weight="fill" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Ce que tu as appris</h3>
              </div>

              <ul className="space-y-3">
                {summary.keyPointsFr.map((point, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 text-gray-600"
                  >
                    <CheckCircle className="w-5 h-5 text-[#58CC02] flex-shrink-0 mt-0.5" weight="fill" />
                    <span className="text-base">{point}</span>
                  </motion.li>
                ))}
              </ul>

              {summary.practiceWords.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 pt-4 border-t border-gray-100"
                >
                  <p className="text-sm text-gray-400 font-medium mb-3">Mots à retenir :</p>
                  <div className="flex flex-wrap gap-2">
                    {summary.practiceWords.map((word) => (
                      <span
                        key={word}
                        className="bg-[#DDF4FF] text-[#1CB0F6] px-4 py-2 rounded-full text-sm font-bold"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Action Buttons - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-gradient-to-t from-[#FAFBFC] via-[#FAFBFC] to-transparent safe-area-bottom">
        <div className="max-w-lg mx-auto space-y-3">
          {onNextLesson && percentage >= 50 && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, ...gentleSpring }}
              whileHover={{ scale: 1.02, y: -2, transition: liquidSpring }}
              whileTap={{ scale: 0.96, transition: liquidSpring }}
              onClick={handleNextLesson}
              className="w-full bg-[#58CC02] text-white font-bold text-lg py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 active:bg-[#4CAF00] transition-all hover:shadow-xl hover:shadow-green-500/40"
            >
              Leçon suivante
              <CaretRight className="w-5 h-5" weight="bold" />
            </motion.button>
          )}

          <div className="flex gap-3">
            {percentage < 80 && onRetry && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, ...gentleSpring }}
                whileHover={{ scale: 1.02, y: -2, transition: liquidSpring }}
                whileTap={{ scale: 0.96, transition: liquidSpring }}
                onClick={handleRetry}
                className="flex-1 bg-[#DDF4FF] text-[#1CB0F6] font-bold text-lg py-4 px-6 rounded-2xl flex items-center justify-center gap-2 active:bg-[#C5EBFF] transition-all hover:shadow-md hover:shadow-blue-500/20"
              >
                <ArrowCounterClockwise className="w-5 h-5" weight="bold" />
                Réessayer
              </motion.button>
            )}

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, ...gentleSpring }}
              whileHover={{ scale: 1.02, y: -2, transition: liquidSpring }}
              whileTap={{ scale: 0.96, transition: liquidSpring }}
              onClick={handleGoHome}
              className={`${
                percentage < 80 && onRetry ? 'flex-1' : 'w-full'
              } bg-gray-100 text-gray-600 font-bold text-lg py-4 px-6 rounded-2xl flex items-center justify-center gap-2 active:bg-gray-200 transition-all hover:shadow-md hover:bg-gray-50`}
            >
              <House className="w-5 h-5" weight="fill" />
              Retour
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
