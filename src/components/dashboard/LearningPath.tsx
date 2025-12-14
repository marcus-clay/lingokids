import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Lock,
  Check,
  Play,
  Trophy,
  Crown,
  Lightning,
  Gift,
} from '@phosphor-icons/react';
import { IPadOSModal } from '../ui/iPadOSModal';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
import type { Lesson } from '../../types';

// LiquidGlass spring config
const liquidSpring = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 25,
  mass: 0.8,
};

const bounceSpring = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 15,
};

interface LearningPathProps {
  lessons: Lesson[];
  completedLessonIds: string[];
  lessonProgress: Record<string, { stars: number; bestScore: number }>;
  currentLessonIndex: number;
  onSelectLesson: (lesson: Lesson) => void;
  unitTitle: string;
  unitTitleFr: string;
}

export const LearningPath: React.FC<LearningPathProps> = ({
  lessons,
  completedLessonIds,
  lessonProgress,
  currentLessonIndex,
  onSelectLesson,
  unitTitle,
  unitTitleFr,
}) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);

  // Calculate total stars for the unit
  const totalStars = useMemo(() => {
    return lessons.reduce((acc, lesson) => {
      return acc + (lessonProgress[lesson.id]?.stars || 0);
    }, 0);
  }, [lessons, lessonProgress]);

  const maxStars = lessons.length * 3;
  const completedCount = completedLessonIds.length;

  const handleNodeClick = (lesson: Lesson, index: number) => {
    const isUnlocked = index <= currentLessonIndex;

    if (!isUnlocked) {
      soundService.playError();
      hapticService.error();
      return;
    }

    soundService.playPop();
    hapticService.mediumTap();
    setSelectedLesson(lesson);
    setShowLessonModal(true);
  };

  const handleStartLesson = () => {
    if (selectedLesson) {
      soundService.playWhoosh();
      hapticService.success();
      setShowLessonModal(false);
      onSelectLesson(selectedLesson);
    }
  };

  // Generate path positions for a winding road effect
  const getNodePosition = (index: number) => {
    const baseY = index * 120;
    const xOffset = Math.sin(index * 0.8) * 60;
    return { x: xOffset, y: baseY };
  };

  // Determine node state
  const getNodeState = (lesson: Lesson, index: number) => {
    const isCompleted = completedLessonIds.includes(lesson.id);
    const isCurrent = index === currentLessonIndex;
    const isUnlocked = index <= currentLessonIndex;
    const progress = lessonProgress[lesson.id];
    const stars = progress?.stars || 0;

    return { isCompleted, isCurrent, isUnlocked, stars };
  };

  return (
    <div className="relative">
      {/* Unit Header - Sticky */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xl border-b border-gray-100 -mx-4 px-4 py-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{unitTitleFr}</h2>
            <p className="text-sm text-gray-400">{unitTitle}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Progress Badge */}
            <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full">
              <Star className="w-4 h-4 text-amber-500" weight="fill" />
              <span className="font-bold text-amber-600 text-sm">
                {totalStars}/{maxStars}
              </span>
            </div>
            {/* Completion Badge */}
            <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full">
              <Check className="w-4 h-4 text-green-500" weight="bold" />
              <span className="font-bold text-green-600 text-sm">
                {completedCount}/{lessons.length}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / lessons.length) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-[#58CC02] to-[#89E219] rounded-full"
          />
        </div>
      </div>

      {/* Candy Crush Style Path */}
      <div className="relative pb-20" style={{ minHeight: lessons.length * 130 }}>
        {/* SVG Path Line */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ minHeight: lessons.length * 130 }}
        >
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#58CC02" />
              <stop offset="100%" stopColor="#E5E7EB" />
            </linearGradient>
          </defs>
          {lessons.map((_, index) => {
            if (index === lessons.length - 1) return null;
            const current = getNodePosition(index);
            const next = getNodePosition(index + 1);
            const isCompleted = index < currentLessonIndex;

            return (
              <motion.path
                key={`path-${index}`}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                d={`M ${current.x + 160} ${current.y + 55}
                    Q ${(current.x + next.x) / 2 + 160} ${(current.y + next.y) / 2 + 55}
                    ${next.x + 160} ${next.y + 55}`}
                fill="none"
                stroke={isCompleted ? '#58CC02' : '#E5E7EB'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={isCompleted ? '0' : '0'}
                className="transition-colors duration-300"
              />
            );
          })}
        </svg>

        {/* Lesson Nodes */}
        {lessons.map((lesson, index) => {
          const position = getNodePosition(index);
          const { isCompleted, isCurrent, isUnlocked, stars } = getNodeState(lesson, index);

          return (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08, ...bounceSpring }}
              className="absolute"
              style={{
                left: `calc(50% + ${position.x}px - 50px)`,
                top: position.y,
              }}
            >
              <LessonNode
                lesson={lesson}
                index={index}
                isCompleted={isCompleted}
                isCurrent={isCurrent}
                isUnlocked={isUnlocked}
                stars={stars}
                onClick={() => handleNodeClick(lesson, index)}
              />
            </motion.div>
          );
        })}

        {/* Treasure at the end */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: lessons.length * 0.08 + 0.2, ...bounceSpring }}
          className="absolute"
          style={{
            left: `calc(50% + ${getNodePosition(lessons.length).x}px - 40px)`,
            top: getNodePosition(lessons.length).y - 20,
          }}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Trophy className="w-10 h-10 text-white" weight="fill" />
          </div>
          <p className="text-center text-xs font-bold text-amber-600 mt-2">Trésor</p>
        </motion.div>
      </div>

      {/* Lesson Detail Modal */}
      <IPadOSModal
        isOpen={showLessonModal}
        onClose={() => setShowLessonModal(false)}
        size="md"
      >
        {selectedLesson && (
          <LessonDetailCard
            lesson={selectedLesson}
            progress={lessonProgress[selectedLesson.id]}
            isCompleted={completedLessonIds.includes(selectedLesson.id)}
            onStart={handleStartLesson}
          />
        )}
      </IPadOSModal>
    </div>
  );
};

// Individual Lesson Node Component
interface LessonNodeProps {
  lesson: Lesson;
  index: number;
  isCompleted: boolean;
  isCurrent: boolean;
  isUnlocked: boolean;
  stars: number;
  onClick: () => void;
}

const LessonNode: React.FC<LessonNodeProps> = ({
  lesson,
  index,
  isCompleted,
  isCurrent,
  isUnlocked,
  stars,
  onClick,
}) => {
  // Node colors based on state
  const getNodeColors = () => {
    if (isCompleted) {
      return {
        bg: 'bg-gradient-to-br from-[#58CC02] to-[#4CAF00]',
        shadow: 'shadow-green-500/40',
        ring: 'ring-green-200',
      };
    }
    if (isCurrent) {
      return {
        bg: 'bg-gradient-to-br from-[#1CB0F6] to-[#0096D6]',
        shadow: 'shadow-blue-500/40',
        ring: 'ring-blue-200',
      };
    }
    return {
      bg: 'bg-gradient-to-br from-gray-200 to-gray-300',
      shadow: 'shadow-gray-500/20',
      ring: 'ring-gray-200',
    };
  };

  const colors = getNodeColors();

  return (
    <div className="flex flex-col items-center">
      {/* Main Node Button */}
      <motion.button
        onClick={onClick}
        disabled={!isUnlocked}
        whileHover={isUnlocked ? { scale: 1.1, y: -5, transition: liquidSpring } : {}}
        whileTap={isUnlocked ? { scale: 0.95, transition: liquidSpring } : {}}
        className={`
          relative w-[100px] h-[100px] rounded-3xl
          ${colors.bg} ${isUnlocked ? colors.shadow : ''} shadow-lg
          flex items-center justify-center
          ${isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}
          ${isCurrent ? 'ring-4 ring-offset-2 ' + colors.ring : ''}
          transition-all duration-200
        `}
      >
        {/* Pulse animation for current lesson */}
        {isCurrent && (
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 bg-blue-400 rounded-3xl"
          />
        )}

        {/* Icon */}
        <div className="relative z-10">
          {!isUnlocked ? (
            <Lock className="w-10 h-10 text-gray-500" weight="fill" />
          ) : isCompleted ? (
            <Check className="w-12 h-12 text-white" weight="bold" />
          ) : isCurrent ? (
            <Play className="w-12 h-12 text-white" weight="fill" />
          ) : (
            <Star className="w-10 h-10 text-gray-400" weight="fill" />
          )}
        </div>

        {/* Lesson Number Badge */}
        <div className="absolute -top-2 -left-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
          <span className="text-sm font-bold text-gray-700">{index + 1}</span>
        </div>

        {/* Stars Badge (if completed) */}
        {isCompleted && stars > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={bounceSpring}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-amber-400 px-2 py-1 rounded-full shadow-md"
          >
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`w-3.5 h-3.5 ${s <= stars ? 'text-white' : 'text-amber-200'}`}
                weight="fill"
              />
            ))}
          </motion.div>
        )}

        {/* Crown for 3 stars */}
        {stars === 3 && (
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, ...bounceSpring }}
            className="absolute -top-4 -right-4"
          >
            <Crown className="w-8 h-8 text-amber-400" weight="fill" />
          </motion.div>
        )}
      </motion.button>

      {/* Lesson Title (only for current or completed) */}
      {(isCurrent || isCompleted) && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`mt-4 text-sm font-semibold text-center max-w-[120px] ${
            isCurrent ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          {lesson.titleFr}
        </motion.p>
      )}
    </div>
  );
};

// Lesson Detail Card (shown in modal)
interface LessonDetailCardProps {
  lesson: Lesson;
  progress?: { stars: number; bestScore: number };
  isCompleted: boolean;
  onStart: () => void;
}

const LessonDetailCard: React.FC<LessonDetailCardProps> = ({
  lesson,
  progress,
  isCompleted,
  onStart,
}) => {
  const stars = progress?.stars || 0;
  const bestScore = progress?.bestScore || 0;

  // Score thresholds for stars
  const starThresholds = [
    { stars: 1, score: 50, label: '50%' },
    { stars: 2, score: 80, label: '80%' },
    { stars: 3, score: 100, label: '100%' },
  ];

  return (
    <div className="text-center">
      {/* Lesson Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={bounceSpring}
        className={`w-24 h-24 mx-auto mb-4 rounded-3xl flex items-center justify-center shadow-lg ${
          isCompleted
            ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-green-500/30'
            : 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30'
        }`}
      >
        {isCompleted ? (
          <Check className="w-12 h-12 text-white" weight="bold" />
        ) : (
          <Play className="w-12 h-12 text-white" weight="fill" />
        )}
      </motion.div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{lesson.titleFr}</h3>
      <p className="text-gray-500 mb-6">{lesson.title}</p>

      {/* Stars Progress */}
      <div className="flex justify-center gap-4 mb-6">
        {[1, 2, 3].map((starNum) => (
          <motion.div
            key={starNum}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: starNum * 0.1, ...bounceSpring }}
            className="flex flex-col items-center"
          >
            <Star
              className={`w-12 h-12 ${
                starNum <= stars ? 'text-amber-400' : 'text-gray-200'
              }`}
              weight="fill"
            />
            <span className={`text-xs font-medium mt-1 ${
              starNum <= stars ? 'text-amber-600' : 'text-gray-400'
            }`}>
              {starThresholds[starNum - 1].label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Best Score */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-50 rounded-2xl p-4 mb-6"
        >
          <p className="text-sm text-gray-400 mb-1">Meilleur score</p>
          <p className="text-3xl font-bold text-gray-900">{bestScore}%</p>
        </motion.div>
      )}

      {/* Star Requirements Info */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {starThresholds.map((threshold) => (
          <div
            key={threshold.stars}
            className={`p-3 rounded-xl ${
              threshold.stars <= stars ? 'bg-amber-50' : 'bg-gray-50'
            }`}
          >
            <div className="flex justify-center mb-1">
              {[...Array(threshold.stars)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    threshold.stars <= stars ? 'text-amber-400' : 'text-gray-300'
                  }`}
                  weight="fill"
                />
              ))}
            </div>
            <p className={`text-xs font-medium ${
              threshold.stars <= stars ? 'text-amber-600' : 'text-gray-400'
            }`}>
              {threshold.label}
            </p>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onStart}
        className={`w-full py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all ${
          isCompleted
            ? 'bg-[#1CB0F6] text-white shadow-blue-500/30 hover:shadow-blue-500/40'
            : 'bg-[#58CC02] text-white shadow-green-500/30 hover:shadow-green-500/40'
        }`}
      >
        {isCompleted ? (
          <>
            <Lightning className="w-6 h-6" weight="fill" />
            Rejouer pour améliorer
          </>
        ) : (
          <>
            <Play className="w-6 h-6" weight="fill" />
            Commencer
          </>
        )}
      </motion.button>

      {/* Rewards Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-400"
      >
        <div className="flex items-center gap-1">
          <Gift className="w-4 h-4" />
          <span>+60 XP max</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4" />
          <span>3 étoiles</span>
        </div>
      </motion.div>
    </div>
  );
};

export default LearningPath;
