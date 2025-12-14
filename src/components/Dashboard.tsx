import React from 'react';
import { UserProgress, Lesson } from '../types';
import { Star, Flame, Trophy, Lock, Play, Check, Gem } from 'lucide-react';

interface DashboardProps {
  progress: UserProgress;
  lessons: Lesson[];
  onStartLesson: (lessonId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ progress, lessons, onStartLesson }) => {
  const nextLesson = lessons.find(l => !l.completed && !l.locked);

  return (
    <div className="space-y-5 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4">
      {/* Header Stats - Horizontal scroll on mobile */}
      <div className="flex gap-2.5 sm:gap-4 overflow-x-auto pb-2 -mx-1 px-1 sm:mx-0 sm:px-0 no-scrollbar sm:grid sm:grid-cols-4">
        <StatCard
          icon={<Trophy className="text-yellow-500 w-5 h-5" fill="currentColor" />}
          value={progress.level}
          label="Niveau"
          color="bg-yellow-50 border-yellow-100"
        />
        <StatCard
          icon={<Flame className="text-orange-500 w-5 h-5" fill="currentColor" />}
          value={progress.streak}
          label="Jours"
          color="bg-orange-50 border-orange-100"
        />
        <StatCard
          icon={<Star className="text-primary-500 w-5 h-5" fill="currentColor" />}
          value={progress.xp}
          label="XP"
          color="bg-blue-50 border-blue-100"
        />
        <StatCard
          icon={<Gem className="text-emerald-500 w-5 h-5" />}
          value={progress.gems}
          label="Gemmes"
          color="bg-emerald-50 border-emerald-100"
        />
      </div>

      {/* Hero Section - Optimized for mobile */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-xl shadow-primary-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 sm:w-64 h-40 sm:h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <h2 className="font-rounded font-bold text-xl sm:text-2xl md:text-3xl mb-2 leading-tight">
            Prêt pour l'aventure ?
          </h2>
          <p className="text-primary-100 text-sm sm:text-base mb-4 sm:mb-6 max-w-lg leading-relaxed">
            Continue ta série ! Complète la prochaine leçon pour gagner un badge "Explorateur".
          </p>
          <button
            onClick={() => nextLesson && onStartLesson(nextLesson.id)}
            disabled={!nextLesson}
            className="bg-white text-primary-600 font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2 text-sm sm:text-base active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play fill="currentColor" size={16} />
            Continuer
          </button>
        </div>
      </div>

      {/* Learning Path */}
      <div>
        <h3 className="font-rounded font-bold text-lg sm:text-xl text-gray-800 mb-4 sm:mb-6 px-1">
          Unité 1 : Les débuts
        </h3>
        <div className="relative space-y-3 sm:space-y-4 pb-8">
          {/* Connecting Line - Hidden on mobile for cleaner look */}
          <div className="hidden sm:block absolute left-8 top-8 bottom-0 w-1 bg-gray-100 rounded-full -z-10"></div>

          {lessons.map((lesson, index) => (
            <LessonNode
              key={lesson.id}
              lesson={lesson}
              index={index}
              onClick={() => !lesson.locked && onStartLesson(lesson.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color }) => (
  <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${color} flex flex-col items-center justify-center text-center transition-transform hover:scale-105 duration-200 min-w-[72px] sm:min-w-0 shrink-0 sm:shrink`}>
    <div className="mb-1 sm:mb-2">{icon}</div>
    <div className="font-bold text-lg sm:text-2xl text-gray-900">{value}</div>
    <div className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
  </div>
);

interface LessonNodeProps {
  lesson: Lesson;
  index: number;
  onClick: () => void;
}

const LessonNode: React.FC<LessonNodeProps> = ({ lesson, index, onClick }) => {
  const isNext = !lesson.completed && !lesson.locked;

  return (
    <div
      className={`flex items-center gap-3 sm:gap-6 group ${lesson.locked ? 'opacity-60' : ''}`}
      onClick={onClick}
    >
      {/* Icon Node */}
      <button
        disabled={lesson.locked}
        className={`
          w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-4 relative z-10 transition-all duration-300 shrink-0
          ${lesson.completed
            ? 'bg-green-500 border-green-200 text-white'
            : isNext
              ? 'bg-primary-500 border-primary-200 text-white shadow-lg shadow-primary-500/30 scale-105 sm:scale-110'
              : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'}
        `}
      >
        {lesson.completed ? (
          <Check size={24} strokeWidth={3} className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : lesson.locked ? (
          <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
        ) : (
          <Star fill="currentColor" className="w-5 h-5 sm:w-7 sm:h-7" />
        )}

        {/* Stars badge for completed */}
        {lesson.completed && (
          <div className="absolute -top-0.5 -right-0.5 bg-yellow-400 text-white text-[9px] sm:text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-white">
            {lesson.stars}
          </div>
        )}
      </button>

      {/* Content Card */}
      <div
        className={`
          flex-1 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border transition-all duration-200 cursor-pointer min-w-0
          ${isNext
            ? 'bg-white border-primary-100 shadow-lg shadow-primary-500/5 ring-1 ring-primary-100'
            : 'bg-white border-gray-100 hover:border-gray-200'}
          ${lesson.locked && 'cursor-not-allowed grayscale'}
        `}
      >
        <div className="flex justify-between items-start gap-2 mb-0.5 sm:mb-1">
          <h4 className={`font-bold font-rounded text-sm sm:text-lg leading-tight ${isNext ? 'text-primary-700' : 'text-gray-900'}`}>
            {lesson.title}
          </h4>
          <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-50 text-gray-500 rounded-md uppercase tracking-wider shrink-0">
            {lesson.type === 'VOCABULARY' ? 'Vocab' : lesson.type === 'GRAMMAR' ? 'Gram.' : 'Histoire'}
          </span>
        </div>
        <p className="text-gray-500 text-xs sm:text-sm line-clamp-1">{lesson.description}</p>
      </div>
    </div>
  );
};
