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
  Lightning,
  Crown,
  Confetti,
  Medal,
  Target,
} from '@phosphor-icons/react';
import confetti from 'canvas-confetti';
import type { LessonSummary, Lesson, Badge } from '../../types';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
import { voiceService } from '../../services/voiceService';
import { IPadOSModal } from '../ui/iPadOSModal';

interface LessonCompleteV2Props {
  lesson: Lesson;
  summary: LessonSummary;
  score: number;
  totalExercises: number;
  xpEarned: number;
  gemsEarned: number;
  streakDay: number;
  childName?: string;
  badgesEarned?: Badge[];
  isNewBestScore?: boolean;
  previousBestScore?: number;
  onGoHome: () => void;
  onNextLesson?: () => void;
  onRetry?: () => void;
}

// Animation configs
const bounceSpring = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 15,
};

const gentleSpring = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 20,
};

const liquidSpring = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 25,
  mass: 0.8,
};

export const LessonCompleteV2: React.FC<LessonCompleteV2Props> = ({
  lesson,
  summary,
  score,
  totalExercises,
  xpEarned,
  gemsEarned,
  streakDay,
  childName,
  badgesEarned = [],
  isNewBestScore = false,
  previousBestScore,
  onGoHome,
  onNextLesson,
  onRetry,
}) => {
  // Progressive disclosure phases
  const [phase, setPhase] = useState<'stars' | 'stats' | 'complete'>('stars');
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);

  const percentage = Math.round((score / totalExercises) * 100);
  const stars = percentage >= 100 ? 3 : percentage >= 80 ? 2 : percentage >= 50 ? 1 : 0;

  // Star reveal sequence
  const [revealedStars, setRevealedStars] = useState(0);

  // Phase progression
  useEffect(() => {
    // Phase 1: Reveal stars one by one
    if (phase === 'stars') {
      const starTimers: NodeJS.Timeout[] = [];

      for (let i = 1; i <= stars; i++) {
        starTimers.push(
          setTimeout(() => {
            setRevealedStars(i);
            soundService.playSuccess();
            hapticService.success();

            // Confetti for each star
            confetti({
              particleCount: 30 + i * 10,
              spread: 50 + i * 10,
              origin: { y: 0.4, x: 0.3 + (i - 1) * 0.2 },
              colors: ['#FFD700', '#FFA500'],
            });
          }, 600 + i * 400)
        );
      }

      // Transition to stats phase
      const statsTimer = setTimeout(() => {
        setPhase('stats');
      }, 600 + stars * 400 + 800);

      return () => {
        starTimers.forEach(clearTimeout);
        clearTimeout(statsTimer);
      };
    }

    // Phase 2: Stats revealed, check for badges
    if (phase === 'stats') {
      const completeTimer = setTimeout(() => {
        setPhase('complete');

        // Show badge modal if earned
        if (badgesEarned.length > 0) {
          setTimeout(() => setShowBadgeModal(true), 500);
        }
      }, 1500);

      return () => clearTimeout(completeTimer);
    }

    // Phase 3: Big celebration if 3 stars or new best
    if (phase === 'complete') {
      if (stars === 3 || isNewBestScore) {
        soundService.playCelebration();
        hapticService.celebration();

        // Epic confetti
        const duration = 2000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      }

      // Speak lesson completion celebration
      const voiceTimer = setTimeout(() => {
        voiceService.speakLessonComplete(childName, stars);
      }, 800);

      return () => clearTimeout(voiceTimer);
    }
  }, [phase, stars, badgesEarned, isNewBestScore, childName]);

  // Get result message and icon
  const getResultData = () => {
    if (stars === 3) {
      return {
        message: childName ? `Parfait ${childName} !` : 'Parfait !',
        subMessage: 'Score maximum atteint !',
        icon: <Crown className="w-16 h-16 text-amber-500" weight="fill" />,
        bgGradient: 'from-amber-400 via-orange-400 to-red-400',
      };
    }
    if (stars === 2) {
      return {
        message: childName ? `Excellent ${childName} !` : 'Excellent !',
        subMessage: 'Tu y es presque !',
        icon: <Trophy className="w-16 h-16 text-amber-500" weight="fill" />,
        bgGradient: 'from-blue-400 via-purple-400 to-pink-400',
      };
    }
    if (stars === 1) {
      return {
        message: childName ? `Bien joué ${childName} !` : 'Bien joué !',
        subMessage: 'Continue à t\'améliorer !',
        icon: <Medal className="w-16 h-16 text-amber-500" weight="fill" />,
        bgGradient: 'from-green-400 via-teal-400 to-blue-400',
      };
    }
    return {
      message: childName ? `Continue ${childName} !` : 'Continue !',
      subMessage: 'Tu peux faire mieux !',
      icon: <Target className="w-16 h-16 text-gray-500" weight="fill" />,
      bgGradient: 'from-gray-400 via-gray-500 to-gray-600',
    };
  };

  const resultData = getResultData();

  const handleNextBadge = () => {
    if (currentBadgeIndex < badgesEarned.length - 1) {
      setCurrentBadgeIndex(prev => prev + 1);
    } else {
      setShowBadgeModal(false);
    }
  };

  const handleRetry = () => {
    soundService.playClick();
    hapticService.mediumTap();
    onRetry?.();
  };

  const handleGoHome = () => {
    soundService.playClick();
    hapticService.lightTap();
    onGoHome();
  };

  const handleNextLesson = () => {
    soundService.playWhoosh();
    hapticService.success();
    onNextLesson?.();
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col overflow-hidden">
      {/* Animated Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        className={`absolute inset-0 bg-gradient-to-br ${resultData.bgGradient}`}
      />

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center px-6 py-8">
        {/* Stars Section - Phase 1 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={bounceSpring}
          className="text-center mb-8"
        >
          {/* Result Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, ...bounceSpring }}
            className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-orange-100 rounded-[32px] flex items-center justify-center shadow-xl"
          >
            {resultData.icon}
          </motion.div>

          {/* Stars Display */}
          <div className="flex justify-center gap-4 mb-6">
            {[1, 2, 3].map((starNum) => (
              <motion.div
                key={starNum}
                initial={{ scale: 0, rotate: -180, y: -50 }}
                animate={{
                  scale: starNum <= revealedStars ? 1 : 0.6,
                  rotate: starNum <= revealedStars ? 0 : -180,
                  y: 0,
                  opacity: starNum <= stars ? 1 : 0.3,
                }}
                transition={{
                  delay: starNum * 0.1,
                  ...bounceSpring,
                }}
                className="relative"
              >
                <Star
                  className={`w-20 h-20 ${
                    starNum <= revealedStars
                      ? 'text-amber-400 drop-shadow-lg'
                      : 'text-gray-200'
                  }`}
                  weight="fill"
                />
                {starNum <= revealedStars && (
                  <motion.div
                    initial={{ opacity: 1, scale: 1.5 }}
                    animate={{ opacity: 0, scale: 2 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-amber-400 rounded-full blur-xl"
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* Score Percentage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, ...gentleSpring }}
            className="text-6xl font-bold text-gray-900 mb-2"
          >
            {percentage}%
          </motion.div>

          {/* Result Message */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, ...gentleSpring }}
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            {resultData.message}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-lg text-gray-500"
          >
            {resultData.subMessage}
          </motion.p>

          {/* New Best Score Badge */}
          {isNewBestScore && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.2, ...bounceSpring }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg"
            >
              <Lightning className="w-5 h-5 text-white" weight="fill" />
              <span className="text-white font-bold">Nouveau record !</span>
            </motion.div>
          )}
        </motion.div>

        {/* Stats Cards - Phase 2 */}
        <AnimatePresence>
          {(phase === 'stats' || phase === 'complete') && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={gentleSpring}
              className="w-full max-w-sm space-y-3"
            >
              {/* XP & Gems Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* XP Card */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, ...gentleSpring }}
                  className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-4 shadow-lg shadow-purple-500/30"
                >
                  <Star className="w-8 h-8 text-yellow-300 mb-2" weight="fill" />
                  <p className="text-purple-100 text-sm font-medium">XP Gagnés</p>
                  <p className="text-3xl font-bold text-white">+{xpEarned}</p>
                </motion.div>

                {/* Gems Card */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, ...gentleSpring }}
                  className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-4 shadow-lg shadow-pink-500/30"
                >
                  <Diamond className="w-8 h-8 text-pink-200 mb-2" weight="fill" />
                  <p className="text-pink-100 text-sm font-medium">Gems</p>
                  <p className="text-3xl font-bold text-white">+{gemsEarned}</p>
                </motion.div>
              </div>

              {/* Streak Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, ...gentleSpring }}
                className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 shadow-lg shadow-orange-500/30 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Flame className="w-7 h-7 text-white" weight="fill" />
                  </div>
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Série active</p>
                    <p className="text-2xl font-bold text-white">
                      {streakDay} jour{streakDay > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <Confetti className="w-10 h-10 text-white/80" weight="fill" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Star Thresholds Info */}
        <AnimatePresence>
          {phase === 'complete' && stars < 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5, ...gentleSpring }}
              className="mt-6 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 max-w-sm w-full"
            >
              <p className="text-sm text-gray-500 mb-3 text-center">Objectifs d'étoiles</p>
              <div className="flex justify-around">
                {[
                  { stars: 1, score: 50 },
                  { stars: 2, score: 80 },
                  { stars: 3, score: 100 },
                ].map((threshold) => (
                  <div
                    key={threshold.stars}
                    className={`text-center ${
                      percentage >= threshold.score ? 'opacity-100' : 'opacity-40'
                    }`}
                  >
                    <div className="flex justify-center mb-1">
                      {[...Array(threshold.stars)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            percentage >= threshold.score ? 'text-amber-400' : 'text-gray-300'
                          }`}
                          weight="fill"
                        />
                      ))}
                    </div>
                    <p className="text-xs font-medium text-gray-600">{threshold.score}%</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Action Buttons - Fixed Bottom */}
      <AnimatePresence>
        {phase === 'complete' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, ...gentleSpring }}
            className="relative z-10 px-6 pb-8 pt-4 bg-gradient-to-t from-[#FAFBFC] via-[#FAFBFC] to-transparent safe-area-bottom"
          >
            <div className="max-w-sm mx-auto space-y-3">
              {/* Primary Action: Next Lesson or Retry */}
              {onNextLesson && stars >= 1 ? (
                <motion.button
                  whileHover={{ scale: 1.02, y: -2, transition: liquidSpring }}
                  whileTap={{ scale: 0.96, transition: liquidSpring }}
                  onClick={handleNextLesson}
                  className="w-full bg-[#58CC02] text-white font-bold text-lg py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all"
                >
                  Leçon suivante
                  <CaretRight className="w-5 h-5" weight="bold" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02, y: -2, transition: liquidSpring }}
                  whileTap={{ scale: 0.96, transition: liquidSpring }}
                  onClick={handleRetry}
                  className="w-full bg-[#1CB0F6] text-white font-bold text-lg py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
                >
                  <ArrowCounterClockwise className="w-5 h-5" weight="bold" />
                  Réessayer
                </motion.button>
              )}

              {/* Secondary Actions */}
              <div className="flex gap-3">
                {/* Retry for improvement (if passed) */}
                {stars >= 1 && stars < 3 && onRetry && (
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2, transition: liquidSpring }}
                    whileTap={{ scale: 0.96, transition: liquidSpring }}
                    onClick={handleRetry}
                    className="flex-1 bg-amber-100 text-amber-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-amber-200 transition-colors"
                  >
                    <ArrowCounterClockwise className="w-5 h-5" weight="bold" />
                    Améliorer
                  </motion.button>
                )}

                {/* Go Home */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2, transition: liquidSpring }}
                  whileTap={{ scale: 0.96, transition: liquidSpring }}
                  onClick={handleGoHome}
                  className={`${
                    stars >= 1 && stars < 3 && onRetry ? 'flex-1' : 'w-full'
                  } bg-gray-100 text-gray-600 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors`}
                >
                  <House className="w-5 h-5" weight="fill" />
                  Retour
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge Earned Modal */}
      <IPadOSModal
        isOpen={showBadgeModal}
        onClose={handleNextBadge}
        size="sm"
        variant="celebration"
        showCloseButton={false}
        closeOnBackdrop={false}
      >
        {badgesEarned[currentBadgeIndex] && (
          <div className="text-center py-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={bounceSpring}
              className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-amber-300 to-orange-400 rounded-3xl flex items-center justify-center shadow-xl"
            >
              <Trophy className="w-12 h-12 text-white" weight="fill" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-amber-600 font-bold mb-1"
            >
              Nouveau badge !
            </motion.p>

            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-gray-900 mb-2"
            >
              {badgesEarned[currentBadgeIndex].nameFr}
            </motion.h3>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 mb-6"
            >
              {badgesEarned[currentBadgeIndex].descriptionFr}
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNextBadge}
              className="w-full py-4 bg-[#58CC02] text-white font-bold text-lg rounded-2xl shadow-lg shadow-green-500/30"
            >
              {currentBadgeIndex < badgesEarned.length - 1 ? 'Badge suivant' : 'Super !'}
            </motion.button>
          </div>
        )}
      </IPadOSModal>
    </div>
  );
};

export default LessonCompleteV2;
