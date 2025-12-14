// ============================================
// SHADOWING MODE - Répétition Vocale (2 min)
// ============================================
// L'enfant répète phrase par phrase avec feedback sur l'accent et le rythme

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Microphone,
  SpeakerHigh,
  Play,
  Pause,
  Check,
  X,
  Star,
  CaretRight,
  Repeat,
  ThumbsUp,
  Sparkle,
  ArrowClockwise,
  Medal,
} from '@phosphor-icons/react';
import { voiceService } from '../../services/voiceService';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';

interface Phrase {
  english: string;
  french: string;
}

interface ShadowingModeProps {
  phrases: Phrase[];
  onComplete: (perfectCount: number) => void;
}

type AttemptStatus = 'idle' | 'listening' | 'success' | 'retry';

export const ShadowingMode: React.FC<ShadowingModeProps> = ({ phrases, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [attemptStatus, setAttemptStatus] = useState<AttemptStatus>('idle');
  const [perfectCount, setPerfectCount] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackScore, setFeedbackScore] = useState(0);

  const currentPhrase = phrases[currentIndex];
  const isLastPhrase = currentIndex === phrases.length - 1;

  // Play the current phrase
  const handlePlayPhrase = useCallback(async () => {
    if (isPlaying) return;

    soundService.playClick();
    hapticService.lightTap();
    setIsPlaying(true);

    try {
      await voiceService.speakEnglishWord(currentPhrase.english);
    } catch (error) {
      console.error('Playback error:', error);
    }

    setIsPlaying(false);
  }, [isPlaying, currentPhrase]);

  // Auto-play phrase when it changes
  useEffect(() => {
    const timer = setTimeout(() => {
      handlePlayPhrase();
    }, 500);
    return () => clearTimeout(timer);
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Simulate recording and feedback
  // In production, this would use actual speech recognition
  const handleStartRecording = useCallback(async () => {
    setAttemptStatus('listening');
    setAttempts(prev => prev + 1);
    hapticService.lightTap();

    // Simulate recording for 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Simulate feedback (random score for demo)
    // In production: use speech recognition API and compare pronunciation
    const simulatedScore = Math.random() > 0.3 ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 40) + 30;
    setFeedbackScore(simulatedScore);

    if (simulatedScore >= 70) {
      setAttemptStatus('success');
      setPerfectCount(prev => prev + 1);
      soundService.playSuccess();
      hapticService.success();
    } else {
      setAttemptStatus('retry');
      soundService.playError();
      hapticService.error();
    }

    setShowFeedback(true);
  }, []);

  // Move to next phrase
  const handleNext = useCallback(() => {
    if (isLastPhrase) {
      soundService.playLevelUp();
      hapticService.success();
      onComplete(perfectCount);
    } else {
      soundService.playPop();
      hapticService.lightTap();
      setCurrentIndex(prev => prev + 1);
      setAttemptStatus('idle');
      setShowFeedback(false);
      setAttempts(0);
    }
  }, [isLastPhrase, onComplete, perfectCount]);

  // Try again
  const handleRetry = useCallback(() => {
    setAttemptStatus('idle');
    setShowFeedback(false);
    hapticService.lightTap();
    handlePlayPhrase();
  }, [handlePlayPhrase]);

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  // Get score feedback with icon
  const getScoreFeedback = (score: number) => {
    if (score >= 90) return { text: 'Excellent !', icon: <Medal className="w-5 h-5 text-yellow-400" weight="fill" /> };
    if (score >= 70) return { text: 'Très bien !', icon: <ThumbsUp className="w-5 h-5 text-blue-500" weight="fill" /> };
    if (score >= 50) return { text: 'Pas mal !', icon: <Sparkle className="w-5 h-5 text-purple-500" weight="fill" /> };
    return { text: 'Réessaie !', icon: <ArrowClockwise className="w-5 h-5 text-orange-500" weight="bold" /> };
  };

  if (!currentPhrase) return null;

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col px-4 py-6">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium text-slate-500">
          Phrase {currentIndex + 1} / {phrases.length}
        </span>
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" weight="fill" />
          <span className="font-bold text-slate-700">{perfectCount}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-200 rounded-full mb-8 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / phrases.length) * 100}%` }}
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Phrase Card */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-slate-100 mb-8"
        >
          {/* Play Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayPhrase}
            disabled={isPlaying}
            className={`w-full py-4 mb-4 rounded-2xl flex items-center justify-center gap-3 transition-colors ${
              isPlaying
                ? 'bg-purple-500 text-white'
                : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
            }`}
          >
            <SpeakerHigh
              className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`}
              weight="fill"
            />
            <span className="font-semibold">
              {isPlaying ? 'Écoute...' : 'Écouter la phrase'}
            </span>
          </motion.button>

          {/* English Phrase */}
          <p className="text-2xl font-bold text-slate-800 text-center mb-3 leading-relaxed">
            "{currentPhrase.english}"
          </p>

          {/* French Translation */}
          <p className="text-slate-400 text-center italic">
            {currentPhrase.french}
          </p>
        </motion.div>

        {/* Recording Button / Status */}
        <AnimatePresence mode="wait">
          {attemptStatus === 'idle' && (
            <motion.button
              key="record"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartRecording}
              className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl shadow-red-500/30"
            >
              <Microphone className="w-10 h-10 text-white" weight="fill" />
            </motion.button>
          )}

          {attemptStatus === 'listening' && (
            <motion.div
              key="listening"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  boxShadow: [
                    '0 0 0 0 rgba(239, 68, 68, 0.4)',
                    '0 0 0 20px rgba(239, 68, 68, 0)',
                    '0 0 0 0 rgba(239, 68, 68, 0)',
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center"
              >
                <Microphone className="w-10 h-10 text-white animate-pulse" weight="fill" />
              </motion.div>
              <p className="mt-4 text-slate-600 font-medium">Parle maintenant...</p>

              {/* Sound wave animation */}
              <div className="flex items-end gap-1 mt-4 h-8">
                {[...Array(7)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: [8, 24 + Math.random() * 16, 8],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                    className="w-2 bg-red-400 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        {attemptStatus === 'idle' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-slate-400 text-center"
          >
            Appuie sur le micro et répète la phrase
          </motion.p>
        )}
      </div>

      {/* Feedback Panel */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-0 left-0 right-0 p-6 ${
              attemptStatus === 'success'
                ? 'bg-gradient-to-t from-green-100 to-transparent'
                : 'bg-gradient-to-t from-orange-100 to-transparent'
            }`}
          >
            <div className="max-w-md mx-auto bg-white rounded-3xl p-6 shadow-xl">
              {/* Score Display */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      attemptStatus === 'success' ? 'bg-green-100' : 'bg-orange-100'
                    }`}
                  >
                    {attemptStatus === 'success' ? (
                      <Check className="w-8 h-8 text-green-600" weight="bold" />
                    ) : (
                      <Repeat className="w-8 h-8 text-orange-600" weight="bold" />
                    )}
                  </motion.div>
                  <div>
                    <p className="font-bold text-lg text-slate-800 flex items-center gap-2">
                      {getScoreFeedback(feedbackScore).text} {getScoreFeedback(feedbackScore).icon}
                    </p>
                    <p className="text-sm text-slate-400">
                      Tentative {attempts}
                    </p>
                  </div>
                </div>

                {/* Score Circle */}
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      className="text-slate-100"
                    />
                    <motion.circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={176}
                      initial={{ strokeDashoffset: 176 }}
                      animate={{ strokeDashoffset: 176 - (feedbackScore / 100) * 176 }}
                      className={getScoreColor(feedbackScore)}
                    />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center font-bold text-lg ${getScoreColor(feedbackScore)}`}>
                    {feedbackScore}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {attemptStatus === 'retry' && attempts < 3 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRetry}
                    className="flex-1 py-3 bg-orange-100 text-orange-600 rounded-xl font-semibold flex items-center justify-center gap-2"
                  >
                    <Repeat className="w-5 h-5" />
                    Réessayer
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  className={`flex-1 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 ${
                    attemptStatus === 'success' || attempts >= 3
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                  }`}
                >
                  {isLastPhrase ? 'Terminer' : 'Continuer'}
                  <CaretRight className="w-5 h-5" weight="bold" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShadowingMode;
