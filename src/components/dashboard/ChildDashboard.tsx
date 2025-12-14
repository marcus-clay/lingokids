// ============================================
// CHILD DASHBOARD - Layout Bento
// ============================================
// Architecture d'information claire et moderne

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Flame,
  Trophy,
  Heart,
  Diamond,
  Play,
  Check,
  User,
  Medal,
  ShoppingBag,
  ArrowLeft,
  Lightning,
  Clock,
  MapTrifold,
  Target,
  TrendUp,
  Crown,
  Sparkle,
  CaretRight,
  Calendar,
  BookOpen,
} from '@phosphor-icons/react';
import { useStore } from '../../store/useStore';
import { getLessonsForGrade, UNITS, isLessonUnlocked } from '../../data/lessons';
import { LessonFlowV2 } from '../lesson/LessonFlowV2';
import { AdventureMap } from './AdventureMap';
import { FullscreenMap } from './FullscreenMap';
import { DailySession } from '../session/DailySession';
import type { Lesson } from '../../types';

// Animation config
const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const ChildDashboard: React.FC = () => {
  const { selectedChild, setCurrentView } = useStore();
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [showDailySession, setShowDailySession] = useState(false);
  const [showFullscreenMap, setShowFullscreenMap] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [lessonProgress, setLessonProgress] = useState<Record<string, { stars: number; bestScore: number }>>({});
  const [dailySessionCompleted, setDailySessionCompleted] = useState(false);

  // Get lessons for the child's grade
  const lessons = useMemo(() => {
    if (!selectedChild) return [];
    return getLessonsForGrade(selectedChild.grade);
  }, [selectedChild?.grade]);

  // Group lessons by unit
  const lessonsByUnit = useMemo(() => {
    const grouped: Record<string, typeof lessons> = {};
    lessons.forEach((lesson) => {
      if (!grouped[lesson.unitId]) {
        grouped[lesson.unitId] = [];
      }
      grouped[lesson.unitId].push(lesson);
    });
    return grouped;
  }, [lessons]);

  if (!selectedChild) {
    return null;
  }

  // Find the current lesson index
  const currentLessonIndex = useMemo(() => {
    for (let i = 0; i < lessons.length; i++) {
      const isUnlocked = isLessonUnlocked(lessons[i], completedLessonIds);
      const isCompleted = completedLessonIds.includes(lessons[i].id);
      if (isUnlocked && !isCompleted) {
        return i;
      }
    }
    return lessons.length > 0 ? lessons.length - 1 : 0;
  }, [lessons, completedLessonIds]);

  // If daily session is active
  if (showDailySession) {
    return (
      <DailySession
        onExit={() => setShowDailySession(false)}
        onComplete={(stats) => {
          setDailySessionCompleted(true);
          setShowDailySession(false);
        }}
      />
    );
  }

  // If a lesson is active
  if (activeLesson) {
    return (
      <LessonFlowV2
        lesson={activeLesson}
        previousBestScore={lessonProgress[activeLesson.id]?.bestScore}
        onExit={() => setActiveLesson(null)}
        onComplete={(score, stars) => {
          const currentProgress = lessonProgress[activeLesson.id];
          const newBestScore = Math.max(score, currentProgress?.bestScore || 0);
          const newStars = Math.max(stars, currentProgress?.stars || 0);

          setLessonProgress(prev => ({
            ...prev,
            [activeLesson.id]: { stars: newStars, bestScore: newBestScore }
          }));

          if (!completedLessonIds.includes(activeLesson.id)) {
            setCompletedLessonIds(prev => [...prev, activeLesson.id]);
          }
        }}
      />
    );
  }

  const handleBack = () => {
    setCurrentView('PROFILE_SELECT');
  };

  const handleStartLesson = (lesson: Lesson) => {
    const isUnlocked = isLessonUnlocked(lesson, completedLessonIds);
    if (isUnlocked) {
      setActiveLesson(lesson);
    }
  };

  // XP calculations
  const xpToNextLevel = 500;
  const currentLevelXp = selectedChild.xp % xpToNextLevel;
  const xpProgress = (currentLevelXp / xpToNextLevel) * 100;

  // Get first unit for display
  const firstUnit = UNITS[0];
  const firstUnitLessons = lessonsByUnit[firstUnit.id] || [];
  const completedInUnit = firstUnitLessons.filter((l) =>
    completedLessonIds.includes(l.id)
  ).length;

  // Current lesson
  const currentLesson = lessons[currentLessonIndex];

  // Total stars
  const totalStars = Object.values(lessonProgress).reduce((sum, p) => sum + p.stars, 0);
  const maxStars = lessons.length * 3;

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        {/* Compact Header */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Profile */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <div
                  className={`w-10 h-10 ${selectedChild.avatarColor} rounded-full flex items-center justify-center text-white font-bold shadow-md`}
                >
                  {selectedChild.name[0]}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{selectedChild.name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Trophy className="w-3 h-3" weight="fill" />
                    <span>Niveau {selectedChild.level}</span>
                  </div>
                </div>
              </div>

              {/* Stats Pills */}
              <div className="flex items-center gap-2">
                <StatPill icon={<Flame weight="fill" />} value={selectedChild.streak} color="orange" />
                <StatPill icon={<Diamond weight="fill" />} value={selectedChild.gems} color="purple" />
                <StatPill icon={<Heart weight="fill" />} value={selectedChild.lives} color="red" />
              </div>
            </div>
          </div>
        </header>

        {/* Bento Grid Content */}
        <main className="max-w-4xl mx-auto px-4 py-5 pb-24">
          <motion.div
            variants={staggerChildren}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 gap-3"
          >
            {/* Daily Session - Large Card (2 cols) */}
            <motion.div variants={fadeInUp} className="col-span-2">
              <motion.button
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setShowDailySession(true)}
                disabled={dailySessionCompleted}
                className={`w-full rounded-3xl p-5 relative overflow-hidden text-left ${
                  dailySessionCompleted
                    ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                    : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500'
                }`}
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={!dailySessionCompleted ? {
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center"
                    >
                      {dailySessionCompleted ? (
                        <Check className="w-8 h-8 text-white" weight="bold" />
                      ) : (
                        <Lightning className="w-8 h-8 text-white" weight="fill" />
                      )}
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {dailySessionCompleted ? 'Session terminee' : 'Session du Jour'}
                      </h3>
                      <p className="text-white/70 text-sm">
                        {dailySessionCompleted
                          ? 'Bravo ! Reviens demain'
                          : '10 min pour progresser'}
                      </p>
                    </div>
                  </div>

                  {!dailySessionCompleted && (
                    <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                      <Clock className="w-5 h-5 text-white" />
                      <span className="font-bold text-white">10 min</span>
                    </div>
                  )}
                </div>

                {/* Mini progress indicators */}
                {!dailySessionCompleted && (
                  <div className="relative z-10 flex items-center justify-center gap-3 mt-4">
                    {['Histoire', 'Repete', 'Parle', 'Rappel', 'Jeu'].map((step, idx) => (
                      <div key={step} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-white/50 rounded-full" />
                        <span className="text-xs text-white/60">{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.button>
            </motion.div>

            {/* XP Progress Card */}
            <motion.div
              variants={fadeInUp}
              className="bg-white rounded-2xl p-4 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-600" weight="fill" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Niveau</p>
                  <p className="text-xl font-bold text-gray-800">{selectedChild.level}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{currentLevelXp} XP</span>
                  <span>{xpToNextLevel} XP</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>

            {/* Stars Card */}
            <motion.div
              variants={fadeInUp}
              className="bg-white rounded-2xl p-4 border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-600" weight="fill" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Etoiles</p>
                  <p className="text-xl font-bold text-gray-800">{totalStars}</p>
                </div>
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3].map(i => (
                  <Star
                    key={i}
                    size={16}
                    weight="fill"
                    className={totalStars >= i ? 'text-yellow-400' : 'text-gray-200'}
                  />
                ))}
                <span className="text-xs text-gray-400 ml-2">/ {maxStars} max</span>
              </div>
            </motion.div>

            {/* Current Lesson - Large Card (2 cols) */}
            {currentLesson && (
              <motion.div
                variants={fadeInUp}
                className="col-span-2 bg-white rounded-2xl p-5 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" weight="fill" />
                    <h3 className="font-bold text-gray-800">Prochaine lecon</h3>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                    {currentLesson.type}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                    <Play className="w-7 h-7 text-white" weight="fill" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-lg">{currentLesson.titleFr}</p>
                    <p className="text-gray-400 text-sm">{currentLesson.title}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {currentLesson.estimatedMinutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {currentLesson.objectives?.length || 3} objectifs
                      </span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStartLesson(currentLesson)}
                    className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30"
                  >
                    <CaretRight className="w-6 h-6 text-white" weight="bold" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Daily Challenges Card */}
            <motion.div
              variants={fadeInUp}
              className="col-span-2 bg-white rounded-2xl p-5 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-pink-500" weight="fill" />
                  <h3 className="font-bold text-gray-800">Defis du jour</h3>
                </div>
                <span className="text-xs text-gray-400">Reinitialise a minuit</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <ChallengeCard
                  icon={<Play weight="fill" />}
                  title="1 lecon"
                  progress={completedLessonIds.length > 0 ? 1 : 0}
                  target={1}
                  reward="+20 XP"
                  color="blue"
                  completed={completedLessonIds.length > 0}
                />
                <ChallengeCard
                  icon={<Star weight="fill" />}
                  title="3 etoiles"
                  progress={totalStars >= 3 ? 1 : 0}
                  target={1}
                  reward="+5 Gems"
                  color="yellow"
                  completed={totalStars >= 3}
                />
                <ChallengeCard
                  icon={<Flame weight="fill" />}
                  title="Serie"
                  progress={selectedChild.streak > 0 ? 1 : 0}
                  target={1}
                  reward="+10 XP"
                  color="orange"
                  completed={selectedChild.streak > 0}
                />
              </div>
            </motion.div>

            {/* Adventure Map Preview - Card with fullscreen button */}
            <motion.div
              variants={fadeInUp}
              className="col-span-2 bg-white rounded-2xl overflow-hidden border border-gray-100"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <MapTrifold className="w-5 h-5 text-green-500" weight="fill" />
                  <h3 className="font-bold text-gray-800">{firstUnit.titleFr}</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFullscreenMap(true)}
                  className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  <span>Voir la carte</span>
                  <CaretRight className="w-4 h-4" weight="bold" />
                </motion.button>
              </div>

              {/* Mini Map Preview */}
              <div className="h-64 relative overflow-hidden">
                <AdventureMap
                  lessons={firstUnitLessons}
                  completedLessonIds={completedLessonIds}
                  lessonProgress={lessonProgress}
                  currentLessonIndex={currentLessonIndex}
                  onSelectLesson={handleStartLesson}
                  unitTitle={firstUnit.title}
                  unitTitleFr={firstUnit.titleFr}
                />

                {/* Overlay for fullscreen trigger */}
                <motion.div
                  whileHover={{ opacity: 1 }}
                  initial={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-6"
                  onClick={() => setShowFullscreenMap(true)}
                >
                  <div className="bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                    <MapTrifold className="w-4 h-4 text-green-600" weight="fill" />
                    <span className="text-sm font-medium text-gray-700">Cliquer pour agrandir</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe z-40">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex justify-around py-2">
              <NavItem icon={<Play weight="fill" />} label="Apprendre" active />
              <NavItem
                icon={<MapTrifold weight="fill" />}
                label="Carte"
                onClick={() => setShowFullscreenMap(true)}
              />
              <NavItem
                icon={<Medal weight="fill" />}
                label="Badges"
                onClick={() => setCurrentView('ACHIEVEMENTS')}
              />
              <NavItem
                icon={<ShoppingBag weight="fill" />}
                label="Boutique"
                onClick={() => setCurrentView('SHOP')}
              />
              <NavItem
                icon={<User weight="fill" />}
                label="Profil"
                onClick={() => setCurrentView('PROFILE')}
              />
            </div>
          </div>
        </nav>
      </div>

      {/* Fullscreen Map Modal */}
      <AnimatePresence>
        {showFullscreenMap && (
          <FullscreenMap
            lessons={firstUnitLessons}
            completedLessonIds={completedLessonIds}
            lessonProgress={lessonProgress}
            currentLessonIndex={currentLessonIndex}
            onSelectLesson={(lesson) => {
              setShowFullscreenMap(false);
              handleStartLesson(lesson);
            }}
            onClose={() => setShowFullscreenMap(false)}
            unitTitle={firstUnit.title}
            unitTitleFr={firstUnit.titleFr}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// --- SUB COMPONENTS ---

// Stat Pill
interface StatPillProps {
  icon: React.ReactNode;
  value: number;
  color: 'orange' | 'purple' | 'red';
}

const StatPill: React.FC<StatPillProps> = ({ icon, value, color }) => {
  const colors = {
    orange: 'bg-orange-50 text-orange-500',
    purple: 'bg-purple-50 text-purple-500',
    red: 'bg-red-50 text-red-500',
  };

  return (
    <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full ${colors[color]}`}>
      <div className="w-4 h-4">{icon}</div>
      <span className="font-bold text-sm">{value}</span>
    </div>
  );
};

// Challenge Card
interface ChallengeCardProps {
  icon: React.ReactNode;
  title: string;
  progress: number;
  target: number;
  reward: string;
  color: 'blue' | 'yellow' | 'orange';
  completed?: boolean;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  icon,
  title,
  progress,
  target,
  reward,
  color,
  completed,
}) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className={`p-3 rounded-xl ${completed ? 'bg-green-50' : 'bg-gray-50'}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
        completed ? 'bg-green-500 text-white' : colors[color]
      }`}>
        {completed ? <Check className="w-4 h-4" weight="bold" /> : icon}
      </div>
      <p className={`font-medium text-sm ${completed ? 'text-green-700' : 'text-gray-700'}`}>
        {title}
      </p>
      <p className="text-xs text-gray-400 mt-1">{reward}</p>
      {!completed && (
        <div className="h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${(progress / target) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
};

// Nav Item
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.1, y: -2 }}
    whileTap={{ scale: 0.95 }}
    className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
      active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
    }`}
  >
    <motion.div
      className={`w-6 h-6 ${active ? 'text-blue-600' : ''}`}
      animate={active ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {icon}
    </motion.div>
    <span className="text-xs font-medium">{label}</span>
  </motion.button>
);

export default ChildDashboard;
