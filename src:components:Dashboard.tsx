import React from 'react';
import { UserProgress, Lesson } from '../types';
import { Star, Flame, Trophy, Lock, Play, Check } from 'lucide-react';

interface DashboardProps {
  progress: UserProgress;
  lessons: Lesson[];
  onStartLesson: (lessonId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ progress, lessons, onStartLesson }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
            icon={<Trophy className="text-yellow-500" fill="currentColor" />} 
            value={progress.level} 
            label="Level" 
            color="bg-yellow-50 border-yellow-100" 
        />
        <StatCard 
            icon={<Flame className="text-orange-500" fill="currentColor" />} 
            value={progress.streak} 
            label="Day Streak" 
            color="bg-orange-50 border-orange-100" 
        />
        <StatCard 
            icon={<Star className="text-primary-500" fill="currentColor" />} 
            value={progress.xp} 
            label="Total XP" 
            color="bg-blue-50 border-blue-100" 
        />
        <StatCard 
            icon={<div className="w-5 h-5 rounded-full border-4 border-green-500" />} 
            value={`${progress.lessonsCompleted}`} 
            label="Lessons" 
            color="bg-green-50 border-green-100" 
        />
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl p-8 text-white shadow-xl shadow-primary-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
            <h2 className="font-rounded font-bold text-3xl mb-2">Ready for today's adventure?</h2>
            <p className="text-primary-100 mb-6 max-w-lg">
                Keep your streak alive! Complete the next lesson to unlock a special "Explorer" badge.
            </p>
            <button 
                onClick={() => onStartLesson(lessons.find(l => !l.completed && !l.locked)?.id || '')}
                className="bg-white text-primary-600 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
                <Play fill="currentColor" size={18} />
                Continue Journey
            </button>
        </div>
      </div>

      {/* Learning Path */}
      <div>
        <h3 className="font-rounded font-bold text-xl text-gray-800 mb-6">Unit 1: The Beginning</h3>
        <div className="relative space-y-4 pb-12">
            {/* Connecting Line */}
            <div className="absolute left-8 top-8 bottom-0 w-1 bg-gray-100 rounded-full -z-10"></div>

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
    <div className={`p-4 rounded-2xl border ${color} flex flex-col items-center justify-center text-center transition-transform hover:scale-105 duration-200`}>
        <div className="mb-2">{icon}</div>
        <div className="font-bold text-2xl text-gray-900">{value}</div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
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
        <div className="flex items-center gap-6 group">
            {/* Icon Node */}
            <button 
                onClick={onClick}
                disabled={lesson.locked}
                className={`
                    w-16 h-16 rounded-full flex items-center justify-center border-4 relative z-10 transition-all duration-300
                    ${lesson.completed 
                        ? 'bg-green-500 border-green-200 text-white shadow-green-200' 
                        : isNext 
                            ? 'bg-primary-500 border-primary-200 text-white shadow-lg shadow-primary-500/30 scale-110' 
                            : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'}
                `}
            >
                {lesson.completed ? (
                    <Check size={32} strokeWidth={3} />
                ) : lesson.locked ? (
                    <Lock size={24} />
                ) : (
                    <Star fill="currentColor" size={28} />
                )}
                
                {/* Floating Stars for completed */}
                {lesson.completed && (
                    <div className="absolute -top-1 -right-1 bg-yellow-400 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                        {lesson.stars}
                    </div>
                )}
            </button>

            {/* Content Card */}
            <div 
                onClick={onClick}
                className={`
                    flex-1 p-5 rounded-2xl border transition-all duration-200 cursor-pointer
                    ${isNext 
                        ? 'bg-white border-primary-100 shadow-lg shadow-primary-500/5 ring-1 ring-primary-100 translate-x-2' 
                        : 'bg-white border-gray-100 hover:border-gray-200'}
                    ${lesson.locked && 'opacity-60 grayscale cursor-not-allowed'}
                `}
            >
                <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-bold font-rounded text-lg ${isNext ? 'text-primary-700' : 'text-gray-900'}`}>
                        {lesson.title}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-1 bg-gray-50 text-gray-500 rounded-md uppercase tracking-wider">
                        {lesson.type}
                    </span>
                </div>
                <p className="text-gray-500 text-sm">{lesson.description}</p>
            </div>
        </div>
    );
};