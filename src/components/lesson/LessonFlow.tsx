import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, SpinnerGap, SmileyMeh } from '@phosphor-icons/react';
import { useStore } from '../../store/useStore';
import { generateFullLessonContent } from '../../services/geminiService';
import { completeLessonAndUpdateStats, updateStreak as updateStreakInFirestore } from '../../services/progressService';
import { LessonIntro } from './LessonIntro';
import { LessonExercise } from './LessonExercise';
import { LessonComplete } from './LessonComplete';
import type { Lesson, LessonContent, Badge } from '../../types';

interface LessonFlowProps {
  lesson: Lesson;
  onExit: () => void;
}

export const LessonFlow: React.FC<LessonFlowProps> = ({ lesson, onExit }) => {
  const { selectedChild, addXp, addGems, useLife, updateStreak, updateChildInStore } = useStore();

  const [phase, setPhase] = useState<'loading' | 'intro' | 'exercise' | 'complete'>('loading');
  const [content, setContent] = useState<LessonContent | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(selectedChild?.lives || 5);
  const [xpEarned, setXpEarned] = useState(0);
  const [gemsEarned, setGemsEarned] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const startTimeRef = useRef<Date>(new Date());
  const mistakesByTypeRef = useRef<Record<string, number>>({});

  // Load lesson content
  useEffect(() => {
    const loadContent = async () => {
      if (!selectedChild) return;

      try {
        setError(null);
        const lessonContent = await generateFullLessonContent(
          lesson.topic,
          selectedChild,
          6 // Number of exercises
        );
        lessonContent.lessonId = lesson.id;
        setContent(lessonContent);
        setPhase('intro');
      } catch (err) {
        console.error('Failed to load lesson content:', err);
        setError('Impossible de charger la leçon. Réessayez plus tard.');
      }
    };

    loadContent();
  }, [lesson, selectedChild]);

  const handleStartExercises = () => {
    setPhase('exercise');
  };

  const handleAnswer = (correct: boolean, _answer: string) => {
    const currentExercise = content?.exercises[currentExerciseIndex];

    if (correct) {
      const xp = currentExercise?.xpReward || 10;
      setScore((prev) => prev + 1);
      setXpEarned((prev) => prev + xp);
    } else {
      // Track mistake type for analytics
      const exerciseType = currentExercise?.type || 'unknown';
      mistakesByTypeRef.current[exerciseType] = (mistakesByTypeRef.current[exerciseType] || 0) + 1;

      // Use a life
      const success = useLife();
      if (success) {
        setLives((prev) => prev - 1);
      }
    }
  };

  const handleContinue = () => {
    if (!content) return;

    const nextIndex = currentExerciseIndex + 1;

    if (nextIndex >= content.exercises.length) {
      // Lesson complete
      finishLesson();
    } else {
      setCurrentExerciseIndex(nextIndex);
    }
  };

  const finishLesson = async () => {
    if (!content || !selectedChild || isSaving) return;

    setIsSaving(true);

    // Calculate final rewards
    const totalExercises = content.exercises.length;
    const percentage = Math.round((score / totalExercises) * 100);

    // Gems based on stars
    let gems = 0;
    if (percentage >= 100) gems = 15;
    else if (percentage >= 80) gems = 10;
    else if (percentage >= 50) gems = 5;

    // Calculate time spent
    const timeSpent = Math.round((new Date().getTime() - startTimeRef.current.getTime()) / 1000);

    try {
      // Save progress to Firestore and get results
      const result = await completeLessonAndUpdateStats(
        selectedChild,
        lesson.id,
        percentage,
        timeSpent,
        xpEarned,
        gems,
        mistakesByTypeRef.current
      );

      // Update streak in Firestore
      await updateStreakInFirestore(selectedChild);

      // Store earned badges to show in completion screen
      setEarnedBadges(result.badgesEarned);
      setGemsEarned(gems);

      // Update local store state
      addXp(xpEarned);
      addGems(gems);
      updateStreak();

      // Update child in store with new values from Firestore
      updateChildInStore(selectedChild.id, {
        lives: lives,
        xp: result.newXp,
        level: result.newLevel,
        gems: result.newGems,
        badges: [...(selectedChild.badges || []), ...result.badgesEarned.map(b => b.id)],
      });

      console.log('Lesson progress saved to Firestore:', {
        lessonId: lesson.id,
        score: percentage,
        timeSpent,
        badges: result.badgesEarned.map(b => b.id),
      });

    } catch (err) {
      console.error('Error saving lesson progress:', err);
      // Still update local state even if Firestore fails
      setGemsEarned(gems);
      addXp(xpEarned);
      addGems(gems);
      updateStreak();
      updateChildInStore(selectedChild.id, { lives: lives });
    } finally {
      setIsSaving(false);
      setPhase('complete');
    }
  };

  const handleGoHome = () => {
    onExit();
  };

  const handleRetry = () => {
    setCurrentExerciseIndex(0);
    setScore(0);
    setXpEarned(0);
    setGemsEarned(0);
    setPhase('intro');
  };

  // Confirmation before leaving mid-lesson
  const handleExit = () => {
    if (phase === 'exercise') {
      if (window.confirm('Tu es sûr de vouloir quitter ? Ta progression sera perdue.')) {
        onExit();
      }
    } else {
      onExit();
    }
  };

  if (!selectedChild) {
    return null;
  }

  // Loading state
  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          {error ? (
            <>
              <SmileyMeh className="w-16 h-16 text-gray-400 mx-auto mb-4" weight="fill" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">Oups !</h2>
              <p className="text-gray-500 mb-6">{error}</p>
              <button
                onClick={onExit}
                className="bg-blue-500 text-white px-6 py-3 rounded-xl font-medium"
              >
                Retour au menu
              </button>
            </>
          ) : (
            <>
              <SpinnerGap className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" weight="bold" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {selectedChild?.name ? `${selectedChild.name}, ta leçon arrive...` : 'Préparation de ta leçon...'}
              </h2>
              <p className="text-gray-500">
                LingoKids prépare des exercices rien que pour toi !
              </p>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Exit Button - Always visible */}
      {phase !== 'complete' && (
        <button
          onClick={handleExit}
          className="absolute top-4 left-4 z-50 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
      )}

      {/* Phase Content */}
      <AnimatePresence mode="wait">
        {phase === 'intro' && content && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LessonIntro
              lesson={lesson}
              introduction={content.introduction}
              childName={selectedChild?.name}
              onStart={handleStartExercises}
            />
          </motion.div>
        )}

        {phase === 'exercise' && content && (
          <motion.div
            key={`exercise-${currentExerciseIndex}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <LessonExercise
              exercise={content.exercises[currentExerciseIndex]}
              exerciseNumber={currentExerciseIndex + 1}
              totalExercises={content.exercises.length}
              lives={lives}
              childName={selectedChild?.name}
              onAnswer={handleAnswer}
              onContinue={handleContinue}
            />
          </motion.div>
        )}

        {phase === 'complete' && content && (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LessonComplete
              lesson={lesson}
              summary={content.summary}
              score={score}
              totalExercises={content.exercises.length}
              xpEarned={xpEarned}
              gemsEarned={gemsEarned}
              streakDay={selectedChild.streak}
              childName={selectedChild?.name}
              onGoHome={handleGoHome}
              onRetry={handleRetry}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
