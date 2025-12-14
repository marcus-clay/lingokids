import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { WelcomeStep } from './steps/WelcomeStep';
import { AddChildStep } from './steps/AddChildStep';
import { AvatarStep } from './steps/AvatarStep';
import { FirstLessonStep } from './steps/FirstLessonStep';

export const OnboardingFlow: React.FC = () => {
  const { onboardingState, selectedChild } = useStore();

  const step = onboardingState?.step || 'welcome';

  // If we have a selected child that hasn't completed onboarding,
  // go straight to avatar customization
  const effectiveStep = selectedChild && !selectedChild.hasCompletedOnboarding
    ? (step === 'welcome' ? 'avatar' : step)
    : step;

  const renderStep = () => {
    switch (effectiveStep) {
      case 'welcome':
        return <WelcomeStep key="welcome" />;
      case 'add-child':
        return <AddChildStep key="add-child" />;
      case 'avatar':
        return <AvatarStep key="avatar" />;
      case 'first-lesson':
        return <FirstLessonStep key="first-lesson" />;
      default:
        return <WelcomeStep key="welcome" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </div>
  );
};
