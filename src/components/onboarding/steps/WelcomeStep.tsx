import React from 'react';
import { motion } from 'framer-motion';
import { Sparkle, Star, Trophy, Rocket } from '@phosphor-icons/react';
import { useStore } from '../../../store/useStore';

export const WelcomeStep: React.FC = () => {
  const { updateOnboardingStep, user } = useStore();

  const handleStart = () => {
    updateOnboardingStep('add-child');
  };

  const features = [
    { icon: Star, text: 'Leçons interactives', color: 'text-yellow-500' },
    { icon: Trophy, text: 'Badges et récompenses', color: 'text-purple-500' },
    { icon: Rocket, text: 'Progression adaptée', color: 'text-blue-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-6"
    >
      {/* Mascot Animation */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="mb-8"
      >
        <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/30 relative">
          <span className="text-white text-6xl font-bold">L</span>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="absolute -top-4 -right-4"
          >
            <Sparkle className="w-8 h-8 text-yellow-400" weight="fill" />
          </motion.div>
        </div>
      </motion.div>

      {/* Welcome Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-rounded font-bold text-gray-900 mb-4">
          Bienvenue sur LingoKids !
        </h1>
        <p className="text-xl text-gray-500 max-w-md mx-auto">
          {user?.displayName?.split(' ')[0]}, préparez-vous à une aventure linguistique incroyable !
        </p>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-wrap justify-center gap-4 mb-12"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.text}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 + index * 0.1 }}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border border-gray-100"
          >
            <feature.icon className={`w-5 h-5 ${feature.color}`} weight="fill" />
            <span className="text-sm font-medium text-gray-700">{feature.text}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleStart}
        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg px-10 py-4 rounded-2xl shadow-xl shadow-blue-500/30 transition-all"
      >
        Commencer l'aventure !
      </motion.button>

      {/* Progress Dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex gap-2 mt-8"
      >
        <div className="w-3 h-3 bg-blue-500 rounded-full" />
        <div className="w-3 h-3 bg-gray-200 rounded-full" />
        <div className="w-3 h-3 bg-gray-200 rounded-full" />
        <div className="w-3 h-3 bg-gray-200 rounded-full" />
      </motion.div>
    </motion.div>
  );
};
