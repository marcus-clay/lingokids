// ============================================
// SESSION COMPLETE - Écran de Fin de Session
// ============================================
// Récapitulatif des stats et célébration

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Star,
  Lightning,
  Brain,
  Confetti,
  House,
  Fire,
  Clock,
  Lightbulb,
  Rocket,
} from '@phosphor-icons/react';
import confetti from 'canvas-confetti';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
import { voiceService } from '../../services/voiceService';
import type { SessionStats } from './DailySession';

interface SessionCompleteProps {
  stats: SessionStats;
  childName?: string;
  onGoHome: () => void;
}

const bounceSpring = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 15,
};

export const SessionComplete: React.FC<SessionCompleteProps> = ({
  stats,
  childName = 'Champion',
  onGoHome,
}) => {
  // Celebration effects on mount
  useEffect(() => {
    soundService.playLevelUp();
    hapticService.success();

    // Multiple confetti bursts
    const burst = () => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6, x: 0.5 },
      });
    };

    burst();
    const timer1 = setTimeout(burst, 500);
    const timer2 = setTimeout(burst, 1000);

    // Speak celebration message after a short delay
    const voiceTimer = setTimeout(() => {
      const celebrationMessage = `Bravo ${childName} ! Tu as termine ta session du jour ! Tu as gagne ${stats.totalXp} points d'experience. ${stats.streakBonus ? 'Ta serie est maintenue !' : ''} A demain pour une nouvelle aventure !`;
      voiceService.speakIntroduction(celebrationMessage);
    }, 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(voiceTimer);
    };
  }, [childName, stats.totalXp, stats.streakBonus]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Stats cards
  const statCards = [
    {
      icon: <Star className="w-6 h-6" weight="fill" />,
      label: 'XP Gagnés',
      value: `+${stats.totalXp}`,
      color: 'amber',
    },
    {
      icon: <Brain className="w-6 h-6" weight="fill" />,
      label: 'Mots Appris',
      value: stats.wordsLearned,
      color: 'purple',
    },
    {
      icon: <Lightning className="w-6 h-6" weight="fill" />,
      label: 'Phrases Parfaites',
      value: stats.perfectPhrases,
      color: 'blue',
    },
    {
      icon: <Clock className="w-6 h-6" weight="fill" />,
      label: 'Temps',
      value: formatTime(stats.totalTime),
      color: 'green',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50 flex flex-col items-center justify-center px-6 py-12">
      {/* Animated Trophy */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={bounceSpring}
        className="relative mb-6"
      >
        <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-amber-500/30">
          <Trophy className="w-16 h-16 text-white" weight="fill" />
        </div>

        {/* Sparkles around trophy */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-2 -right-2"
        >
          <Confetti className="w-8 h-8 text-amber-400" weight="fill" />
        </motion.div>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          className="absolute -bottom-1 -left-3"
        >
          <Star className="w-6 h-6 text-yellow-400" weight="fill" />
        </motion.div>
      </motion.div>

      {/* Congratulations Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-black text-slate-800 mb-2">
          Bravo {childName} !
        </h1>
        <p className="text-slate-500">
          Tu as terminé ta session du jour !
        </p>
      </motion.div>

      {/* Streak Badge */}
      {stats.streakBonus && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2 rounded-full shadow-lg mb-8"
        >
          <Fire className="w-5 h-5" weight="fill" />
          <span className="font-bold">Série maintenue !</span>
          <Fire className="w-5 h-5" weight="fill" />
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-sm grid grid-cols-2 gap-3 mb-8"
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 + index * 0.1 }}
            className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-100`}
          >
            <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center text-${stat.color}-500 mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-sm text-slate-400">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Message of the day */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="bg-blue-50 rounded-2xl p-4 max-w-sm mb-8"
      >
        <p className="text-blue-700 text-center flex items-center justify-center gap-2">
          <Lightbulb className="w-5 h-5 text-blue-600" weight="fill" />
          <span><span className="font-semibold">Conseil du jour :</span> Pratique un peu chaque jour, c'est la clé du succès !</span>
        </p>
      </motion.div>

      {/* Action Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onGoHome}
        className="w-full max-w-sm py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/30 flex items-center justify-center gap-3"
      >
        <House className="w-6 h-6" weight="fill" />
        Retour à l'accueil
      </motion.button>

      {/* Tomorrow teaser */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-6 text-slate-400 text-sm text-center flex items-center justify-center gap-2"
      >
        À demain pour une nouvelle aventure !
        <Rocket className="w-4 h-4 text-slate-400" weight="fill" />
      </motion.p>
    </div>
  );
};

export default SessionComplete;
