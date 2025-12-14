import React, { useState, useEffect, useRef, useMemo } from 'react';
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

interface AdventureMapProps {
  lessons: Lesson[];
  completedLessonIds: string[];
  lessonProgress: Record<string, { stars: number; bestScore: number }>;
  currentLessonIndex: number;
  onSelectLesson: (lesson: Lesson) => void;
  unitTitle: string;
  unitTitleFr: string;
}

// --- CONSTANTES DE CONFIGURATION ---
const CONFIG = {
  levelHeight: 130,
  amplitude: 80,
  frequency: 0.7,
  pathWidth: 35,
  colors: {
    path: '#e2e8f0',
    pathActive: '#58CC02',
    bg: '#f0f9ff',
  }
};

// --- UTILITAIRES MATHÉMATIQUES ---
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

// --- SOUS-COMPOSANTS ---

const StarRating = ({ stars }: { stars: number }) => (
  <motion.div
    initial={{ scale: 0, y: 10 }}
    animate={{ scale: 1, y: 0 }}
    className="flex gap-0.5 absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-md border border-amber-100"
  >
    {[1, 2, 3].map((i) => (
      <Star
        key={i}
        size={14}
        weight="fill"
        className={i <= stars ? 'text-amber-400' : 'text-gray-200'}
      />
    ))}
  </motion.div>
);

// Spring config
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
  onClick
}: {
  level: LevelData;
  x: number;
  y: number;
  index: number;
  onClick: (lesson: Lesson) => void;
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
    onClick(level.lesson);
  };

  // Size based on type
  const size = isBoss ? 'w-20 h-20' : isChest ? 'w-16 h-16' : 'w-16 h-16';
  const rounded = isBoss ? 'rounded-3xl' : isChest ? 'rounded-2xl' : 'rounded-2xl';

  // Colors based on status
  const getColors = () => {
    if (isLocked) return 'bg-gray-200 border-gray-300 text-gray-400';
    if (isActive) return 'bg-[#1CB0F6] border-white ring-4 ring-blue-200 text-white';
    if (isCompleted) {
      if (level.stars === 3) return 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-300 text-white';
      return 'bg-[#58CC02] border-green-400 text-white';
    }
    return 'bg-gray-200 border-gray-300 text-gray-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, ...bounceSpring }}
      className="absolute flex flex-col items-center"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Active indicator */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-14 z-20"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="bg-white px-4 py-2 rounded-xl shadow-lg border-2 border-blue-100"
            >
              <span className="text-sm font-bold text-[#1CB0F6] flex items-center gap-1">C'est parti ! <Rocket className="w-4 h-4" weight="fill" /></span>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-blue-100 rotate-45" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level number badge */}
      <div className="absolute -top-2 -left-2 z-20 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center border-2 border-gray-100">
        <span className="text-xs font-bold text-gray-600">{level.order}</span>
      </div>

      {/* Main button */}
      <motion.button
        whileHover={!isLocked ? { scale: 1.1, y: -3 } : {}}
        whileTap={!isLocked ? { scale: 0.95 } : {}}
        onClick={handleClick}
        disabled={isLocked}
        className={`
          ${size} ${rounded} ${getColors()}
          relative flex items-center justify-center
          border-4 shadow-lg transition-all
          ${isActive ? 'shadow-blue-500/40 shadow-xl' : ''}
          ${isCompleted && level.stars === 3 ? 'shadow-amber-500/40 shadow-xl' : ''}
          ${!isLocked ? 'cursor-pointer' : 'cursor-not-allowed'}
        `}
        style={{
          boxShadow: !isLocked ? '0 6px 0 rgba(0,0,0,0.15)' : '0 4px 0 rgba(0,0,0,0.1)'
        }}
      >
        {isLocked ? (
          <Lock size={24} weight="fill" className="opacity-50" />
        ) : isChest ? (
          <Gift size={28} weight="fill" className="drop-shadow-md" />
        ) : isBoss ? (
          <Trophy size={32} weight="fill" className="drop-shadow-md" />
        ) : isCompleted ? (
          <Check size={28} weight="bold" className="drop-shadow-md" />
        ) : (
          <Play size={28} weight="fill" className="drop-shadow-md ml-1" />
        )}

        {/* Crown for 3 stars */}
        {isCompleted && level.stars === 3 && (
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute -top-3 -right-2"
          >
            <Crown size={20} weight="fill" className="text-amber-400 drop-shadow-lg" />
          </motion.div>
        )}

        {/* Pulsing ring for active */}
        {isActive && (
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-2xl border-4 border-[#1CB0F6]"
          />
        )}
      </motion.button>

      {/* Stars if completed */}
      {isCompleted && level.type !== 'chest' && (
        <StarRating stars={level.stars} />
      )}

      {/* Lesson title */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.05 + 0.2 }}
        className={`
          mt-4 text-xs font-semibold text-center max-w-[100px] leading-tight
          ${isActive ? 'text-[#1CB0F6]' : isCompleted ? 'text-gray-700' : 'text-gray-400'}
        `}
      >
        {level.lesson.titleFr}
      </motion.p>
    </motion.div>
  );
};

// Decorations - Using Phosphor icons instead of emojis
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
  const colors = ['text-green-400', 'text-green-500', 'text-stone-400', 'text-pink-400', 'text-rose-300', 'text-yellow-400'];
  const opacities = ['opacity-60', 'opacity-50', 'opacity-40', 'opacity-50', 'opacity-60', 'opacity-30'];

  return (
    <div
      className={`absolute pointer-events-none ${opacities[type % opacities.length]} ${colors[type % colors.length]}`}
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
    >
      <DecorationIcon type={type} className={sizes[type % sizes.length]} />
    </div>
  );
};

// --- COMPOSANT PRINCIPAL ---

export const AdventureMap: React.FC<AdventureMapProps> = ({
  lessons,
  completedLessonIds,
  lessonProgress,
  currentLessonIndex,
  onSelectLesson,
  unitTitle,
  unitTitleFr,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerWidth = 350;

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

      // Determine type based on order
      let type: LevelData['type'] = 'normal';
      if ((index + 1) % 5 === 0) type = 'boss'; // Every 5th is a boss
      else if ((index + 1) % 3 === 0) type = 'chest'; // Every 3rd (not 5th) is a chest

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

  // Calculate stats
  const totalStars = levels.reduce((sum, l) => sum + l.stars, 0);
  const maxStars = lessons.length * 3;
  const completedCount = completedLessonIds.length;

  // Scroll to active level on mount
  useEffect(() => {
    if (containerRef.current) {
      const activeIndex = levels.findIndex(l => l.status === 'active');
      if (activeIndex !== -1) {
        const yPos = activeIndex * CONFIG.levelHeight;
        setTimeout(() => {
          containerRef.current?.scrollTo({
            top: yPos - (containerRef.current.clientHeight / 2) + CONFIG.levelHeight,
            behavior: 'smooth'
          });
        }, 300);
      }
    }
  }, [levels]);

  const svgPath = useMemo(() => generatePath(levels.length, containerWidth), [levels.length]);
  const totalHeight = levels.length * CONFIG.levelHeight + 150;

  return (
    <div className="relative w-full bg-gradient-to-b from-sky-100 via-sky-50 to-white rounded-3xl overflow-hidden shadow-lg border border-sky-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg text-gray-900">{unitTitleFr}</h2>
            <p className="text-sm text-gray-400">{unitTitle}</p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-xl">
              <Star size={16} weight="fill" className="text-amber-500" />
              <span className="font-bold text-amber-600 text-sm">{totalStars}/{maxStars}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-xl">
              <Check size={16} weight="bold" className="text-green-500" />
              <span className="font-bold text-green-600 text-sm">{completedCount}/{lessons.length}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / lessons.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-[#58CC02] to-[#89E219] rounded-full"
          />
        </div>
      </div>

      {/* Scrollable Map */}
      <div
        ref={containerRef}
        className="overflow-y-auto overflow-x-hidden"
        style={{ height: 500, scrollBehavior: 'smooth' }}
      >
        {/* Background pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, #bae6fd 1px, transparent 1px)',
            backgroundSize: '25px 25px',
            height: totalHeight
          }}
        />

        {/* Map canvas */}
        <div
          className="relative mx-auto"
          style={{ width: containerWidth, height: totalHeight }}
        >
          {/* Decorations */}
          {levels.map((_, i) => {
            const y = i * CONFIG.levelHeight + (CONFIG.levelHeight / 2);
            const xBase = (containerWidth / 2) + getPosition(i);
            const isLeft = i % 2 === 0;
            const decorX = isLeft ? xBase - 100 : xBase + 100;
            return <Decoration key={`decor-${i}`} x={decorX} y={y} type={i} />;
          })}

          {/* SVG Path */}
          <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ overflow: 'visible' }}
          >
            {/* Shadow */}
            <path
              d={svgPath}
              fill="none"
              stroke="rgba(0,0,0,0.08)"
              strokeWidth={CONFIG.pathWidth + 6}
              strokeLinecap="round"
              style={{ transform: 'translateY(4px)' }}
            />
            {/* White border */}
            <path
              d={svgPath}
              fill="none"
              stroke="white"
              strokeWidth={CONFIG.pathWidth}
              strokeLinecap="round"
            />
            {/* Dashed center */}
            <path
              d={svgPath}
              fill="none"
              stroke="#e0f2fe"
              strokeWidth={CONFIG.pathWidth - 12}
              strokeLinecap="round"
              strokeDasharray="15 15"
            />
          </svg>

          {/* Level Nodes */}
          {levels.map((level, index) => {
            const y = index * CONFIG.levelHeight + (CONFIG.levelHeight / 2);
            const x = (containerWidth / 2) + getPosition(index);

            return (
              <LevelNode
                key={level.id}
                level={level}
                x={x}
                y={y}
                index={index}
                onClick={onSelectLesson}
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
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-2.5 rounded-full font-bold shadow-lg border-4 border-emerald-300 flex items-center gap-2">
              <Sparkle size={18} weight="fill" />
              <span>DÉPART</span>
              <Sparkle size={18} weight="fill" />
            </div>
          </motion.div>

          {/* Treasure at top */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: 30 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl border-4 border-amber-300">
              <Trophy size={32} weight="fill" className="text-white drop-shadow-lg" />
            </div>
            <p className="text-center mt-2 text-sm font-bold text-amber-600">Trésor</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdventureMap;
