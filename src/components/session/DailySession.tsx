// ============================================
// DAILY SESSION - 10 MIN ORCHESTRATOR
// ============================================
// Structure: Story (1min) → Shadowing (2min) → RolePlay (3min) → ChunkRecall (2min) → Game (2min)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Play,
  ArrowLeft,
  Trophy,
  Star,
  Lightning,
  BookOpen,
  Microphone,
  ChatCircle,
  Brain,
  GameController,
  Check,
} from '@phosphor-icons/react';
import { useStore } from '../../store/useStore';
import { getRandomStory, getRandomSituation } from '../../data/situations';
import { getRandomChunks } from '../../data/chunks';
import { StoryMode } from './StoryMode';
import { ShadowingMode } from './ShadowingMode';
import { RolePlayMode } from './RolePlayMode';
import { ChunkRecallMode } from './ChunkRecallMode';
import { ContextGameMode } from './ContextGameMode';
import { SessionComplete } from './SessionComplete';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
import { voiceService } from '../../services/voiceService';
import type { Story, Situation } from '../../data/situations';
import type { Chunk } from '../../data/chunks';

// Session phases with timing
type SessionPhase = 'intro' | 'story' | 'shadowing' | 'roleplay' | 'recall' | 'game' | 'complete';

interface PhaseConfig {
  phase: SessionPhase;
  duration: number; // in seconds
  label: string;
  labelFr: string;
  icon: React.ReactNode;
  color: string;
}

const PHASE_CONFIGS: PhaseConfig[] = [
  { phase: 'story', duration: 60, label: 'Story', labelFr: 'Histoire', icon: <BookOpen weight="fill" />, color: 'blue' },
  { phase: 'shadowing', duration: 120, label: 'Shadowing', labelFr: 'Répétition', icon: <Microphone weight="fill" />, color: 'purple' },
  { phase: 'roleplay', duration: 180, label: 'Role Play', labelFr: 'Jeu de rôle', icon: <ChatCircle weight="fill" />, color: 'green' },
  { phase: 'recall', duration: 120, label: 'Recall', labelFr: 'Rappel', icon: <Brain weight="fill" />, color: 'orange' },
  { phase: 'game', duration: 120, label: 'Game', labelFr: 'Jeu', icon: <GameController weight="fill" />, color: 'pink' },
];

interface DailySessionProps {
  onExit: () => void;
  onComplete?: (stats: SessionStats) => void;
}

export interface SessionStats {
  totalXp: number;
  wordsLearned: number;
  streakBonus: boolean;
  perfectPhrases: number;
  totalTime: number;
}

export const DailySession: React.FC<DailySessionProps> = ({ onExit, onComplete }) => {
  const { selectedChild } = useStore();

  // Session state
  const [currentPhase, setCurrentPhase] = useState<SessionPhase>('intro');
  const [phaseIndex, setPhaseIndex] = useState(-1); // -1 = intro
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Progress tracking
  const [stats, setStats] = useState<SessionStats>({
    totalXp: 0,
    wordsLearned: 0,
    streakBonus: false,
    perfectPhrases: 0,
    totalTime: 0,
  });

  // Content for this session
  const [sessionStory, setSessionStory] = useState<Story | null>(null);
  const [sessionSituation, setSessionSituation] = useState<Situation | null>(null);
  const [sessionChunks, setSessionChunks] = useState<Chunk[]>([]);

  // Load content on mount
  useEffect(() => {
    if (!selectedChild) return;

    const story = getRandomStory(selectedChild.grade);
    const situation = getRandomSituation(selectedChild.grade);
    const chunks = getRandomChunks(5, selectedChild.grade);

    setSessionStory(story);
    setSessionSituation(situation);
    setSessionChunks(chunks);

    // Speak welcome message for daily session
    const welcomeTimer = setTimeout(() => {
      const welcomeMessage = `Bonjour ${selectedChild.name} ! Pret pour ta session du jour ? Dix minutes pour progresser en anglais. C'est parti !`;
      voiceService.speakIntroduction(welcomeMessage);
    }, 500);

    return () => clearTimeout(welcomeTimer);
  }, [selectedChild]);

  // Timer for elapsed time
  useEffect(() => {
    if (currentPhase === 'intro' || currentPhase === 'complete' || isPaused) return;

    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPhase, isPaused]);

  // Calculate total session progress
  const totalDuration = useMemo(() => {
    return PHASE_CONFIGS.reduce((sum, p) => sum + p.duration, 0);
  }, []);

  const overallProgress = useMemo(() => {
    if (phaseIndex < 0) return 0;
    const completedTime = PHASE_CONFIGS.slice(0, phaseIndex).reduce((sum, p) => sum + p.duration, 0);
    const currentPhaseConfig = PHASE_CONFIGS[phaseIndex];
    const currentPhaseDuration = currentPhaseConfig?.duration || 0;
    const currentPhaseProgress = Math.min(elapsedTime, currentPhaseDuration);
    return ((completedTime + currentPhaseProgress) / totalDuration) * 100;
  }, [phaseIndex, elapsedTime, totalDuration]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start the session
  const handleStart = useCallback(() => {
    soundService.playWhoosh();
    hapticService.success();
    setCurrentPhase('story');
    setPhaseIndex(0);
    setElapsedTime(0);
  }, []);

  // Move to next phase
  const handlePhaseComplete = useCallback((phaseStats?: Partial<SessionStats>) => {
    // Update stats
    if (phaseStats) {
      setStats(prev => ({
        ...prev,
        totalXp: prev.totalXp + (phaseStats.totalXp || 0),
        wordsLearned: prev.wordsLearned + (phaseStats.wordsLearned || 0),
        perfectPhrases: prev.perfectPhrases + (phaseStats.perfectPhrases || 0),
      }));
    }

    const nextIndex = phaseIndex + 1;

    if (nextIndex >= PHASE_CONFIGS.length) {
      // Session complete
      soundService.playLevelUp();
      hapticService.success();
      setCurrentPhase('complete');
      setStats(prev => ({
        ...prev,
        totalTime: elapsedTime,
        streakBonus: true,
      }));
      onComplete?.({
        ...stats,
        totalTime: elapsedTime,
        streakBonus: true,
      });
    } else {
      // Next phase
      soundService.playSuccess();
      hapticService.lightTap();
      const nextPhase = PHASE_CONFIGS[nextIndex].phase;
      setCurrentPhase(nextPhase);
      setPhaseIndex(nextIndex);
      setElapsedTime(0);
    }
  }, [phaseIndex, elapsedTime, stats, onComplete]);

  // Handle exit
  const handleExit = useCallback(() => {
    soundService.playClick();
    hapticService.lightTap();
    onExit();
  }, [onExit]);

  if (!selectedChild) return null;

  // Get current phase config
  const currentConfig = phaseIndex >= 0 ? PHASE_CONFIGS[phaseIndex] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header - Always visible */}
      {currentPhase !== 'intro' && currentPhase !== 'complete' && (
        <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50 safe-area-top">
          <div className="max-w-lg mx-auto px-4 py-3">
            {/* Top row: Exit + Timer + Phase indicator */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={handleExit}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl text-slate-600 font-medium hover:bg-slate-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" weight="bold" />
                <span className="text-sm">Quitter</span>
              </button>

              {/* Timer */}
              <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
                <Clock className="w-5 h-5 text-slate-500" />
                <span className="font-mono font-bold text-slate-700">
                  {formatTime(elapsedTime)}
                </span>
              </div>

              {/* Current phase badge */}
              {currentConfig && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-${currentConfig.color}-100`}>
                  <span className={`text-${currentConfig.color}-600`}>{currentConfig.icon}</span>
                  <span className={`text-sm font-semibold text-${currentConfig.color}-700`}>
                    {currentConfig.labelFr}
                  </span>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="relative">
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                />
              </div>

              {/* Phase indicators */}
              <div className="absolute inset-0 flex items-center justify-between px-1">
                {PHASE_CONFIGS.map((config, idx) => (
                  <div
                    key={config.phase}
                    className={`w-3 h-3 rounded-full border-2 border-white ${
                      idx < phaseIndex ? 'bg-green-500'
                      : idx === phaseIndex ? 'bg-blue-500 animate-pulse'
                      : 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {/* Intro Screen */}
          {currentPhase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="text-center max-w-md"
              >
                {/* Animated icon */}
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl"
                >
                  <Lightning className="w-12 h-12 text-white" weight="fill" />
                </motion.div>

                <h1 className="text-3xl font-black text-slate-800 mb-2">
                  Session du Jour
                </h1>
                <p className="text-slate-500 mb-8">
                  10 minutes pour progresser en anglais !
                </p>

                {/* Session breakdown */}
                <div className="space-y-3 mb-8">
                  {PHASE_CONFIGS.map((config, idx) => (
                    <motion.div
                      key={config.phase}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-${config.color}-100 flex items-center justify-center text-${config.color}-600`}>
                        {config.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-slate-700">{config.labelFr}</p>
                        <p className="text-sm text-slate-400">{Math.floor(config.duration / 60)} min</p>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        {idx + 1}/5
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Start button */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStart}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/30 flex items-center justify-center gap-3"
                >
                  <Play className="w-6 h-6" weight="fill" />
                  Commencer !
                </motion.button>

                {/* Back button */}
                <button
                  onClick={handleExit}
                  className="mt-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Revenir plus tard
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* Story Mode */}
          {currentPhase === 'story' && sessionStory && (
            <motion.div
              key="story"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <StoryMode
                story={sessionStory}
                onComplete={(wordsLearned) => handlePhaseComplete({ wordsLearned, totalXp: 15 })}
              />
            </motion.div>
          )}

          {/* Shadowing Mode */}
          {currentPhase === 'shadowing' && sessionStory && (
            <motion.div
              key="shadowing"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <ShadowingMode
                phrases={sessionStory.panels.map(p => ({
                  english: p.textEn,
                  french: p.textFr,
                }))}
                onComplete={(perfectCount) => handlePhaseComplete({ perfectPhrases: perfectCount, totalXp: 20 })}
              />
            </motion.div>
          )}

          {/* Role Play Mode */}
          {currentPhase === 'roleplay' && sessionSituation && (
            <motion.div
              key="roleplay"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <RolePlayMode
                situation={sessionSituation}
                childName={selectedChild.name}
                onComplete={(score) => handlePhaseComplete({ totalXp: score })}
              />
            </motion.div>
          )}

          {/* Chunk Recall Mode */}
          {currentPhase === 'recall' && (
            <motion.div
              key="recall"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <ChunkRecallMode
                chunks={sessionChunks}
                onComplete={(correctCount) => handlePhaseComplete({ wordsLearned: correctCount, totalXp: correctCount * 5 })}
              />
            </motion.div>
          )}

          {/* Context Game Mode */}
          {currentPhase === 'game' && sessionSituation && (
            <motion.div
              key="game"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <ContextGameMode
                chunks={sessionChunks}
                situation={sessionSituation}
                onComplete={(score) => handlePhaseComplete({ totalXp: score })}
              />
            </motion.div>
          )}

          {/* Session Complete */}
          {currentPhase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SessionComplete
                stats={stats}
                childName={selectedChild.name}
                onGoHome={handleExit}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default DailySession;
