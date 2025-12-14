import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpinnerGap, SmileyMeh, Sparkle } from '@phosphor-icons/react';
import { useStore } from '../../store/useStore';
import { generateFullLessonContent } from '../../services/geminiService';
import { completeLessonAndUpdateStats, updateStreak as updateStreakInFirestore } from '../../services/progressService';
import { LessonIntroV2 } from './LessonIntroV2';
import { LessonExerciseV2 } from './LessonExerciseV2';
import { LessonCompleteV2 } from './LessonCompleteV2';
import { preloadLessonAudio } from '../../services/voiceService';
import type { Lesson, LessonContent, Badge } from '../../types';

interface LessonFlowV2Props {
  lesson: Lesson;
  previousBestScore?: number;
  onExit: () => void;
  onComplete?: (score: number, stars: number) => void;
}

// Animation configs
const gentleSpring = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 20,
};

export const LessonFlowV2: React.FC<LessonFlowV2Props> = ({
  lesson,
  previousBestScore = 0,
  onExit,
  onComplete,
}) => {
  const { selectedChild, addXp, addGems, useLife, updateStreak, updateChildInStore } = useStore();

  // Flow phases
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

  // Tracking
  const startTimeRef = useRef<Date>(new Date());
  const mistakesByTypeRef = useRef<Record<string, number>>({});

  // Load lesson content and preload audio
  useEffect(() => {
    const loadContent = async () => {
      if (!selectedChild) return;

      try {
        setError(null);

        // Start preloading audio in parallel with content generation
        const preloadPromise = preloadLessonAudio(selectedChild.name, lesson.titleFr || lesson.title);

        const lessonContent = await generateFullLessonContent(
          lesson.topic,
          selectedChild,
          6
        );
        lessonContent.lessonId = lesson.id;
        setContent(lessonContent);

        // Wait for audio preload to complete (fire and forget if it fails)
        preloadPromise.catch(err => console.warn('Audio preload failed:', err));

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
    startTimeRef.current = new Date();
  };

  const handleAnswer = (correct: boolean, _answer: string) => {
    const currentExercise = content?.exercises[currentExerciseIndex];

    if (correct) {
      const xp = currentExercise?.xpReward || 10;
      setScore(prev => prev + 1);
      setXpEarned(prev => prev + xp);
    } else {
      const exerciseType = currentExercise?.type || 'unknown';
      mistakesByTypeRef.current[exerciseType] = (mistakesByTypeRef.current[exerciseType] || 0) + 1;

      const success = useLife();
      if (success) {
        setLives(prev => prev - 1);
      }
    }
  };

  const handleContinue = () => {
    if (!content) return;

    const nextIndex = currentExerciseIndex + 1;

    if (nextIndex >= content.exercises.length) {
      finishLesson();
    } else {
      setCurrentExerciseIndex(nextIndex);
    }
  };

  const finishLesson = async () => {
    if (!content || !selectedChild || isSaving) return;

    setIsSaving(true);

    const totalExercises = content.exercises.length;
    const percentage = Math.round((score / totalExercises) * 100);

    // Calculate gems based on stars
    let gems = 0;
    if (percentage >= 100) gems = 15;
    else if (percentage >= 80) gems = 10;
    else if (percentage >= 50) gems = 5;

    const timeSpent = Math.round((new Date().getTime() - startTimeRef.current.getTime()) / 1000);

    try {
      const result = await completeLessonAndUpdateStats(
        selectedChild,
        lesson.id,
        percentage,
        timeSpent,
        xpEarned,
        gems,
        mistakesByTypeRef.current
      );

      await updateStreakInFirestore(selectedChild);

      setEarnedBadges(result.badgesEarned);
      setGemsEarned(gems);

      addXp(xpEarned);
      addGems(gems);
      updateStreak();

      updateChildInStore(selectedChild.id, {
        lives: lives,
        xp: result.newXp,
        level: result.newLevel,
        gems: result.newGems,
        badges: [...(selectedChild.badges || []), ...result.badgesEarned.map(b => b.id)],
      });

      // Notify parent of completion with score and stars
      const stars = percentage >= 100 ? 3 : percentage >= 80 ? 2 : percentage >= 50 ? 1 : 0;
      onComplete?.(percentage, stars);

    } catch (err) {
      console.error('Error saving lesson progress:', err);
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
    mistakesByTypeRef.current = {};
    startTimeRef.current = new Date();
    setPhase('intro');
  };

  const handleExit = () => {
    onExit();
  };

  if (!selectedChild) {
    return null;
  }

  // Calculate current score for complete screen
  const totalExercises = content?.exercises.length || 1;
  const percentage = Math.round((score / totalExercises) * 100);
  const isNewBestScore = percentage > previousBestScore;

  // Loading state with engaging animation
  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          {error ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-3xl flex items-center justify-center"
              >
                <SmileyMeh className="w-12 h-12 text-gray-400" weight="fill" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Oups !</h2>
              <p className="text-gray-500 mb-6">{error}</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onExit}
                className="bg-blue-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30"
              >
                Retour au menu
              </motion.button>
            </>
          ) : (
            <>
              {/* Animated Loading Icon */}
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl"
              >
                <Sparkle className="w-10 h-10 text-white" weight="fill" />
              </motion.div>

              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedChild?.name ? `${selectedChild.name}, prépare-toi !` : 'Préparation...'}
              </h2>

              <p className="text-gray-500 mb-6">
                LingoKids prépare ta leçon personnalisée...
              </p>

              {/* Loading Progress Bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3, ease: 'easeInOut' }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                />
              </div>

              {/* Fun facts while loading */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-6 text-sm text-gray-400 italic"
              >
                Le savais-tu ? L'anglais est parlé par 1,5 milliard de personnes !
              </motion.p>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AnimatePresence mode="wait">
        {phase === 'intro' && content && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LessonIntroV2
              lesson={lesson}
              introduction={content.introduction}
              childName={selectedChild?.name}
              totalExercises={content.exercises.length}
              onStart={handleStartExercises}
              onExit={handleExit}
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
            <LessonExerciseV2
              exercise={content.exercises[currentExerciseIndex]}
              exerciseNumber={currentExerciseIndex + 1}
              totalExercises={content.exercises.length}
              lives={lives}
              childName={selectedChild?.name}
              onAnswer={handleAnswer}
              onContinue={handleContinue}
              onExit={handleExit}
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
            <LessonCompleteV2
              lesson={lesson}
              summary={content.summary}
              score={score}
              totalExercises={content.exercises.length}
              xpEarned={xpEarned}
              gemsEarned={gemsEarned}
              streakDay={selectedChild.streak}
              childName={selectedChild?.name}
              badgesEarned={earnedBadges}
              isNewBestScore={isNewBestScore}
              previousBestScore={previousBestScore}
              onGoHome={handleGoHome}
              onRetry={handleRetry}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LessonFlowV2;
