// ============================================
// FULLSCREEN MAP - Vue carte en plein écran
// ============================================
// Navigation complète dans la carte d'aventure
// Design optimisé pour la lisibilité et le scroll

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Lock,
  Play,
  Gift,
  Trophy,
  Crown,
  Sparkle,
  Check,
  Rocket,
  Tree,
  FlowerTulip,
  Mountains,
  X,
  CaretUp,
  CaretDown,
  MapPin,
  Target,
  Clock,
  ArrowLeft,
} from '@phosphor-icons/react';
import type { Lesson } from '../../types';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';

// --- TYPES ---
type LevelStatus = 'locked' | 'active' | 'completed';

interface LevelData {
  id: string;
  order: number;
  status: LevelStatus;
  stars: number;
  type: 'normal' | 'boss' | 'chest';
  lesson: Lesson;
}

interface FullscreenMapProps {
  lessons: Lesson[];
  completedLessonIds: string[];
  lessonProgress: Record<string, { stars: number; bestScore: number }>;
  currentLessonIndex: number;
  onSelectLesson: (lesson: Lesson) => void;
  onClose: () => void;
  unitTitle: string;
  unitTitleFr: string;
}

// --- CONFIG - Augmented spacing for better readability ---
const CONFIG = {
  levelHeight: 220,      // Increased from 160 for more vertical space
  amplitude: 100,        // Reduced amplitude for cleaner path
  frequency: 0.55,       // Slightly reduced for smoother curves
  pathWidth: 50,         // Wider path
  nodeSize: {
    normal: 72,
    boss: 88,
    chest: 72,
  },
};

// --- UTILS ---
const getPosition = (index: number) => {
  return Math.sin(index * CONFIG.frequency) * CONFIG.amplitude;
};

const generatePath = (levelsCount: number, width: number) => {
  if (levelsCount === 0) return '';

  const centerX = width / 2;
  let path = `M ${centerX + getPosition(0)} ${CONFIG.levelHeight / 2}`;

  for (let i = 0; i < levelsCount - 1; i++) {
    const currentX = centerX + getPosition(i);
    const currentY = i * CONFIG.levelHeight + (CONFIG.levelHeight / 2);

    const nextX = centerX + getPosition(i + 1);
    const nextY = (i + 1) * CONFIG.levelHeight + (CONFIG.levelHeight / 2);

    const cp1x = currentX;
    const cp1y = currentY + (CONFIG.levelHeight * 0.5);
    const cp2x = nextX;
    const cp2y = nextY - (CONFIG.levelHeight * 0.5);

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${nextX} ${nextY}`;
  }

  return path;
};

// --- COMPONENTS ---

const StarRating = ({ stars }: { stars: number }) => (
  <motion.div
    initial={{ scale: 0, y: 10 }}
    animate={{ scale: 1, y: 0 }}
    className="flex gap-1.5 absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white px-3 py-1.5 rounded-full shadow-lg border border-amber-100"
  >
    {[1, 2, 3].map((i) => (
      <Star
        key={i}
        size={16}
        weight="fill"
        className={i <= stars ? 'text-amber-400' : 'text-gray-200'}
      />
    ))}
  </motion.div>
);

const bounceSpring = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 15,
};

const LevelNode = ({
  level,
  x,
  y,
  index,
  onClick,
  isSelected,
  onSelect,
}: {
  level: LevelData;
  x: number;
  y: number;
  index: number;
  onClick: (lesson: Lesson) => void;
  isSelected: boolean;
  onSelect: (level: LevelData) => void;
}) => {
  const isLocked = level.status === 'locked';
  const isActive = level.status === 'active';
  const isCompleted = level.status === 'completed';
  const isBoss = level.type === 'boss';
  const isChest = level.type === 'chest';

  const handleClick = () => {
    if (isLocked) return;
    soundService.playPop();
    hapticService.mediumTap();
    onSelect(level);
  };

  const handleStart = () => {
    if (isLocked) return;
    onClick(level.lesson);
  };

  // Dynamic sizing
  const nodeSize = isBoss ? CONFIG.nodeSize.boss : CONFIG.nodeSize.normal;
  const sizeClass = isBoss ? 'w-[88px] h-[88px]' : 'w-[72px] h-[72px]';
  const rounded = isBoss ? 'rounded-3xl' : 'rounded-2xl';

  const getColors = () => {
    if (isLocked) return 'bg-slate-200 border-slate-300 text-slate-400';
    if (isActive) return 'bg-[#1CB0F6] border-white ring-4 ring-blue-300/50 text-white';
    if (isCompleted) {
      if (level.stars === 3) return 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-200 text-white';
      return 'bg-[#58CC02] border-green-300 text-white';
    }
    return 'bg-slate-200 border-slate-300 text-slate-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(index * 0.02, 0.3), ...bounceSpring }}
      className="absolute flex flex-col items-center"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        zIndex: isSelected ? 100 : 10,
      }}
    >
      {/* Active indicator - positioned higher */}
      <AnimatePresence>
        {isActive && !isSelected && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-20 z-20"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="bg-white px-5 py-2.5 rounded-2xl shadow-xl border-2 border-blue-200"
            >
              <span className="text-base font-bold text-[#1CB0F6] flex items-center gap-2">
                C'est parti ! <Rocket className="w-5 h-5" weight="fill" />
              </span>
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-blue-200 rotate-45" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected detail panel - positioned much higher to avoid overlap */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute -top-44 z-50 w-72"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-4">
                <p className="text-white font-bold text-lg">{level.lesson.titleFr}</p>
                <p className="text-white/70 text-sm">{level.lesson.title}</p>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-gray-600 text-sm leading-relaxed">{level.lesson.descriptionFr}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{level.lesson.estimatedMinutes} min</span>
                  </div>
                  {isCompleted && (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((i) => (
                        <Star
                          key={i}
                          size={18}
                          weight="fill"
                          className={i <= level.stars ? 'text-amber-400' : 'text-gray-200'}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStart}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                >
                  <Play weight="fill" className="w-5 h-5" />
                  {isCompleted ? 'Rejouer' : 'Commencer'}
                </motion.button>
              </div>
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-r border-b border-gray-100 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level number badge */}
      <div className="absolute -top-2 -left-2 z-20 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-100">
        <span className="text-sm font-bold text-gray-600">{level.order}</span>
      </div>

      {/* Main button */}
      <motion.button
        whileHover={!isLocked ? { scale: 1.08, y: -4 } : {}}
        whileTap={!isLocked ? { scale: 0.95 } : {}}
        onClick={handleClick}
        disabled={isLocked}
        className={`
          ${sizeClass} ${rounded} ${getColors()}
          relative flex items-center justify-center
          border-4 shadow-xl transition-all
          ${isActive ? 'shadow-blue-500/30' : ''}
          ${isCompleted && level.stars === 3 ? 'shadow-amber-500/30' : ''}
          ${isSelected ? 'ring-4 ring-indigo-400 ring-offset-4' : ''}
          ${!isLocked ? 'cursor-pointer' : 'cursor-not-allowed'}
        `}
        style={{
          boxShadow: !isLocked
            ? `0 10px 0 rgba(0,0,0,0.12), 0 15px 30px rgba(0,0,0,0.1)`
            : '0 4px 0 rgba(0,0,0,0.08)'
        }}
      >
        {isLocked ? (
          <Lock size={28} weight="fill" className="opacity-50" />
        ) : isChest ? (
          <Gift size={32} weight="fill" className="drop-shadow-md" />
        ) : isBoss ? (
          <Trophy size={38} weight="fill" className="drop-shadow-md" />
        ) : isCompleted ? (
          <Check size={32} weight="bold" className="drop-shadow-md" />
        ) : (
          <Play size={32} weight="fill" className="drop-shadow-md ml-1" />
        )}

        {isCompleted && level.stars === 3 && (
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute -top-4 -right-3"
          >
            <Crown size={26} weight="fill" className="text-amber-400 drop-shadow-lg" />
          </motion.div>
        )}

        {isActive && (
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-2xl border-4 border-[#1CB0F6]"
          />
        )}
      </motion.button>

      {/* Stars if completed */}
      {isCompleted && level.type !== 'chest' && !isSelected && (
        <StarRating stars={level.stars} />
      )}

      {/* Lesson title - more spacing */}
      {!isSelected && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: Math.min(index * 0.02 + 0.1, 0.4) }}
          className={`
            mt-8 text-sm font-semibold text-center max-w-[140px] leading-snug
            ${isActive ? 'text-[#1CB0F6]' : isCompleted ? 'text-slate-700' : 'text-slate-400'}
          `}
        >
          {level.lesson.titleFr}
        </motion.p>
      )}
    </motion.div>
  );
};

// Decoration icons
const DecorationIcon: React.FC<{ type: number; className?: string }> = ({ type, className }) => {
  switch (type % 6) {
    case 0:
      return <Tree className={className} weight="fill" />;
    case 1:
      return <Tree className={className} weight="duotone" />;
    case 2:
      return <Mountains className={className} weight="fill" />;
    case 3:
      return <FlowerTulip className={className} weight="fill" />;
    case 4:
      return <FlowerTulip className={className} weight="duotone" />;
    case 5:
    default:
      return <Sparkle className={className} weight="fill" />;
  }
};

const Decoration = ({ x, y, type }: { x: number; y: number; type: number }) => {
  const sizes = ['w-8 h-8', 'w-7 h-7', 'w-6 h-6', 'w-5 h-5', 'w-7 h-7', 'w-6 h-6'];
  const colors = ['text-green-300', 'text-green-400', 'text-stone-300', 'text-pink-300', 'text-rose-200', 'text-yellow-300'];

  return (
    <div
      className={`absolute pointer-events-none opacity-40 ${colors[type % colors.length]}`}
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
    >
      <DecorationIcon type={type} className={sizes[type % sizes.length]} />
    </div>
  );
};

// --- MAIN COMPONENT ---

export const FullscreenMap: React.FC<FullscreenMapProps> = ({
  lessons,
  completedLessonIds,
  lessonProgress,
  currentLessonIndex,
  onSelectLesson,
  onClose,
  unitTitle,
  unitTitleFr,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedLevel, setSelectedLevel] = useState<LevelData | null>(null);
  const containerWidth = Math.min(window.innerWidth, 420);

  // Transform lessons to level data (reversed for bottom-to-top display)
  const levels: LevelData[] = useMemo(() => {
    return lessons.map((lesson, index) => {
      const isCompleted = completedLessonIds.includes(lesson.id);
      const isCurrent = index === currentLessonIndex;
      const isUnlocked = index <= currentLessonIndex;

      let status: LevelStatus = 'locked';
      if (isCompleted) status = 'completed';
      else if (isCurrent) status = 'active';
      else if (isUnlocked) status = 'active';

      const progress = lessonProgress[lesson.id];
      const stars = progress?.stars || 0;

      let type: LevelData['type'] = 'normal';
      if ((index + 1) % 5 === 0) type = 'boss';
      else if ((index + 1) % 3 === 0) type = 'chest';

      return {
        id: lesson.id,
        order: index + 1,
        status,
        stars,
        type,
        lesson,
      };
    }).reverse();
  }, [lessons, completedLessonIds, lessonProgress, currentLessonIndex]);

  // Stats
  const totalStars = levels.reduce((sum, l) => sum + l.stars, 0);
  const maxStars = lessons.length * 3;
  const completedCount = completedLessonIds.length;

  // Scroll to active level with smooth behavior
  const scrollToActive = useCallback(() => {
    if (containerRef.current) {
      const activeIndex = levels.findIndex(l => l.status === 'active');
      if (activeIndex !== -1) {
        const yPos = activeIndex * CONFIG.levelHeight;
        containerRef.current.scrollTo({
          top: yPos - (containerRef.current.clientHeight / 2) + (CONFIG.levelHeight / 2),
          behavior: 'smooth'
        });
      }
    }
  }, [levels]);

  useEffect(() => {
    const timer = setTimeout(scrollToActive, 400);
    return () => clearTimeout(timer);
  }, [scrollToActive]);

  // Handle level selection
  const handleSelectLevel = (level: LevelData) => {
    setSelectedLevel(prev => prev?.id === level.id ? null : level);
  };

  // Handle background click to deselect
  const handleBackgroundClick = () => {
    setSelectedLevel(null);
  };

  const svgPath = useMemo(() => generatePath(levels.length, containerWidth), [levels.length, containerWidth]);

  // Much more vertical space
  const totalHeight = levels.length * CONFIG.levelHeight + 300;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-gradient-to-b from-sky-100 via-sky-50 to-white"
    >
      {/* Header - Compact and clean */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100">
        <div className="px-4 pt-3 pb-4 safe-area-inset-top">
          <div className="flex items-center justify-between mb-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" weight="bold" />
            </motion.button>

            <div className="text-center flex-1 mx-4">
              <h1 className="font-bold text-lg text-gray-900 truncate">{unitTitleFr}</h1>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 rounded-full">
                <Star size={14} weight="fill" className="text-amber-500" />
                <span className="font-bold text-amber-600 text-sm">{totalStars}</span>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 rounded-full">
                <Check size={14} weight="bold" className="text-green-500" />
                <span className="font-bold text-green-600 text-sm">{completedCount}/{lessons.length}</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / lessons.length) * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#58CC02] to-[#89E219] rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Scrollable Map with smooth scrolling */}
      <div
        ref={containerRef}
        onClick={handleBackgroundClick}
        className="absolute inset-0 pt-28 pb-20 overflow-y-auto overflow-x-hidden scroll-smooth"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
        }}
      >
        {/* Background pattern - subtle dots */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, #93c5fd 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            height: totalHeight + 300
          }}
        />

        {/* Map canvas with extra padding */}
        <div
          className="relative mx-auto"
          style={{ width: containerWidth, height: totalHeight, paddingTop: 60 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorations - positioned far from nodes */}
          {levels.map((_, i) => {
            const y = i * CONFIG.levelHeight + (CONFIG.levelHeight / 2) + 60;
            const xBase = (containerWidth / 2) + getPosition(i);
            const isLeft = getPosition(i) < 0;

            return (
              <React.Fragment key={`decor-group-${i}`}>
                <Decoration
                  x={isLeft ? containerWidth - 40 : 40}
                  y={y - 20}
                  type={i}
                />
                {i % 3 === 0 && (
                  <Decoration
                    x={isLeft ? 50 : containerWidth - 50}
                    y={y + 50}
                    type={i + 2}
                  />
                )}
              </React.Fragment>
            );
          })}

          {/* SVG Path */}
          <svg
            className="absolute top-0 left-0 w-full pointer-events-none"
            style={{ overflow: 'visible', height: totalHeight }}
          >
            <g style={{ transform: 'translateY(60px)' }}>
              {/* Shadow */}
              <path
                d={svgPath}
                fill="none"
                stroke="rgba(0,0,0,0.06)"
                strokeWidth={CONFIG.pathWidth + 10}
                strokeLinecap="round"
                style={{ transform: 'translateY(6px)' }}
              />
              {/* White border */}
              <path
                d={svgPath}
                fill="none"
                stroke="white"
                strokeWidth={CONFIG.pathWidth}
                strokeLinecap="round"
              />
              {/* Light blue dashed center */}
              <path
                d={svgPath}
                fill="none"
                stroke="#e0f2fe"
                strokeWidth={CONFIG.pathWidth - 18}
                strokeLinecap="round"
                strokeDasharray="20 20"
              />
            </g>
          </svg>

          {/* Level Nodes */}
          {levels.map((level, index) => {
            const y = index * CONFIG.levelHeight + (CONFIG.levelHeight / 2) + 60;
            const x = (containerWidth / 2) + getPosition(index);

            return (
              <LevelNode
                key={level.id}
                level={level}
                x={x}
                y={y}
                index={index}
                onClick={onSelectLesson}
                isSelected={selectedLevel?.id === level.id}
                onSelect={handleSelectLevel}
              />
            );
          })}

          {/* Start marker at bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: totalHeight - 80 }}
          >
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-8 py-3.5 rounded-full font-bold shadow-xl border-4 border-emerald-300/50 flex items-center gap-2">
              <Sparkle size={20} weight="fill" />
              <span className="text-lg tracking-wide">DEPART</span>
              <Sparkle size={20} weight="fill" />
            </div>
          </motion.div>

          {/* Treasure at top */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: 0 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-amber-200">
              <Trophy size={40} weight="fill" className="text-white drop-shadow-lg" />
            </div>
            <p className="text-center mt-3 text-base font-bold text-amber-600">Tresor</p>
          </motion.div>
        </div>

        {/* Extra bottom padding for comfortable scrolling */}
        <div className="h-40" />
      </div>

      {/* Quick navigation buttons - Floating */}
      <div className="absolute bottom-24 right-4 z-50 flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200"
        >
          <CaretUp className="w-6 h-6 text-gray-600" weight="bold" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToActive}
          className="w-12 h-12 bg-blue-500 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center"
        >
          <MapPin className="w-6 h-6 text-white" weight="fill" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            containerRef.current?.scrollTo({ top: totalHeight + 200, behavior: 'smooth' });
          }}
          className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200"
        >
          <CaretDown className="w-6 h-6 text-gray-600" weight="bold" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default FullscreenMap;
