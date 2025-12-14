import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkle,
  Star,
  Trophy,
  Flame,
  Heart,
  Play,
  SpeakerHigh,
  CheckCircle,
  ArrowRight
} from '@phosphor-icons/react';
import { useStore } from '../../../store/useStore';
import { updateChild } from '../../../services/authService';
import confetti from 'canvas-confetti';

type TutorialStep = 'intro' | 'xp' | 'streak' | 'lives' | 'ready' | 'complete';

export const FirstLessonStep: React.FC = () => {
  const { selectedChild, updateChildInStore, setCurrentView, setOnboardingState } = useStore();
  const [tutorialStep, setTutorialStep] = useState<TutorialStep>('intro');

  const handleNext = () => {
    const steps: TutorialStep[] = ['intro', 'xp', 'streak', 'lives', 'ready', 'complete'];
    const currentIndex = steps.indexOf(tutorialStep);
    if (currentIndex < steps.length - 1) {
      setTutorialStep(steps[currentIndex + 1]);
    }
  };

  const handleComplete = async () => {
    if (!selectedChild) return;

    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'],
    });

    // Mark onboarding as complete
    await updateChild(selectedChild.id, {
      hasCompletedOnboarding: true,
    });

    updateChildInStore(selectedChild.id, {
      hasCompletedOnboarding: true,
    });

    // Clear onboarding state and go to dashboard
    setOnboardingState(null);
    setCurrentView('DASHBOARD');
  };

  const renderContent = () => {
    switch (tutorialStep) {
      case 'intro':
        return (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl"
            >
              <Sparkle className="w-12 h-12 text-white" weight="fill" />
            </motion.div>
            <h2 className="text-2xl font-rounded font-bold text-gray-900 mb-3">
              Bienvenue {selectedChild?.name} !
            </h2>
            <p className="text-gray-500 mb-6">
              Découvre comment fonctionne LingoKids et commence à apprendre l'anglais en t'amusant !
            </p>
          </motion.div>
        );

      case 'xp':
        return (
          <motion.div
            key="xp"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl"
            >
              <Star className="w-12 h-12 text-white" weight="fill" />
            </motion.div>
            <h2 className="text-2xl font-rounded font-bold text-gray-900 mb-3">
              Gagne des XP !
            </h2>
            <p className="text-gray-500 mb-4">
              Chaque bonne réponse te donne des points d'expérience (XP).
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 inline-flex items-center gap-3">
              <Star className="w-6 h-6 text-yellow-500" weight="fill" />
              <span className="font-bold text-yellow-700">+10 XP par réponse correcte !</span>
            </div>
          </motion.div>
        );

      case 'streak':
        return (
          <motion.div
            key="streak"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl"
            >
              <Flame className="w-12 h-12 text-white" weight="fill" />
            </motion.div>
            <h2 className="text-2xl font-rounded font-bold text-gray-900 mb-3">
              Garde ta série !
            </h2>
            <p className="text-gray-500 mb-4">
              Reviens chaque jour pour garder ta série de jours consécutifs !
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 inline-flex items-center gap-3">
              <Flame className="w-6 h-6 text-orange-500" weight="fill" />
              <span className="font-bold text-orange-700">7 jours = Badge spécial !</span>
            </div>
          </motion.div>
        );

      case 'lives':
        return (
          <motion.div
            key="lives"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl"
            >
              <Heart className="w-12 h-12 text-white" weight="fill" />
            </motion.div>
            <h2 className="text-2xl font-rounded font-bold text-gray-900 mb-3">
              Tes vies
            </h2>
            <p className="text-gray-500 mb-4">
              Tu as 5 vies. Tu en perds une si tu te trompes, mais elles reviennent avec le temps !
            </p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Heart className="w-8 h-8 text-red-500" weight="fill" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'ready':
        return (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl"
            >
              <Trophy className="w-12 h-12 text-white" weight="fill" />
            </motion.div>
            <h2 className="text-2xl font-rounded font-bold text-gray-900 mb-3">
              Tu es prêt(e) !
            </h2>
            <p className="text-gray-500 mb-6">
              Chaque leçon commence par une explication en français, puis tu fais les exercices en anglais !
            </p>
            <div className="flex flex-col gap-3 text-left max-w-xs mx-auto">
              <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-3">
                <SpeakerHigh className="w-5 h-5 text-blue-500" weight="fill" />
                <span className="text-sm text-blue-700">Écoute les explications</span>
              </div>
              <div className="flex items-center gap-3 bg-green-50 rounded-xl p-3">
                <CheckCircle className="w-5 h-5 text-green-500" weight="fill" />
                <span className="text-sm text-green-700">Réponds aux questions</span>
              </div>
              <div className="flex items-center gap-3 bg-purple-50 rounded-xl p-3">
                <Star className="w-5 h-5 text-purple-500" weight="fill" />
                <span className="text-sm text-purple-700">Gagne des étoiles !</span>
              </div>
            </div>
          </motion.div>
        );

      case 'complete':
        return (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl"
            >
              <Play className="w-16 h-16 text-white ml-2" weight="fill" />
            </motion.div>
            <h2 className="text-3xl font-rounded font-bold text-gray-900 mb-3">
              L'aventure commence !
            </h2>
            <p className="text-gray-500 mb-8">
              Ta première leçon t'attend. Bonne chance, {selectedChild?.name} !
            </p>
          </motion.div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-6"
    >
      <div className="max-w-md w-full">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>

        {/* Navigation Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          {tutorialStep === 'complete' ? (
            <button
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
            >
              Commencer ma première leçon
              <ArrowRight className="w-5 h-5" weight="bold" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
            >
              Continuer
              <ArrowRight className="w-5 h-5" weight="bold" />
            </button>
          )}
        </motion.div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {['intro', 'xp', 'streak', 'lives', 'ready', 'complete'].map((step, index) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full transition-all ${
                step === tutorialStep
                  ? 'w-6 bg-blue-500'
                  : index < ['intro', 'xp', 'streak', 'lives', 'ready', 'complete'].indexOf(tutorialStep)
                  ? 'bg-blue-300'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
