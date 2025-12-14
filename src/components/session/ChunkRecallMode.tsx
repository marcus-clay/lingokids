// ============================================
// CHUNK RECALL MODE - Rappel Actif (2 min)
// ============================================
// Rappel actif des expressions clés avec flashcards inversées

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  SpeakerHigh,
  Check,
  X,
  Star,
  CaretRight,
  Lightning,
  Eye,
  EyeSlash,
} from '@phosphor-icons/react';
import type { Chunk } from '../../data/chunks';
import { voiceService } from '../../services/voiceService';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';

interface ChunkRecallModeProps {
  chunks: Chunk[];
  onComplete: (correctCount: number) => void;
}

type CardState = 'question' | 'revealed' | 'answered';

export const ChunkRecallMode: React.FC<ChunkRecallModeProps> = ({ chunks, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardState, setCardState] = useState<CardState>('question');
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const currentChunk = chunks[currentIndex];
  const isLastChunk = currentIndex === chunks.length - 1;

  // Play audio
  const handlePlayAudio = useCallback(async () => {
    if (isPlaying || !currentChunk) return;

    soundService.playClick();
    hapticService.lightTap();
    setIsPlaying(true);

    try {
      await voiceService.speakEnglishWord(currentChunk.english);
    } catch (error) {
      console.error('Audio error:', error);
    }

    setIsPlaying(false);
  }, [isPlaying, currentChunk]);

  // Auto-play audio on new card
  useEffect(() => {
    if (cardState === 'question') {
      const timer = setTimeout(handlePlayAudio, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reveal answer
  const handleReveal = useCallback(() => {
    soundService.playPop();
    hapticService.lightTap();
    setCardState('revealed');
  }, []);

  // Mark as correct/incorrect
  const handleAnswer = useCallback((isCorrect: boolean) => {
    setCardState('answered');

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      setStreak(prev => prev + 1);
      soundService.playSuccess();
      hapticService.success();
    } else {
      setStreak(0);
      soundService.playError();
      hapticService.error();
    }

    // Move to next card after delay
    setTimeout(() => {
      if (isLastChunk) {
        onComplete(correctCount + (isCorrect ? 1 : 0));
      } else {
        setCurrentIndex(prev => prev + 1);
        setCardState('question');
        setShowHint(false);
      }
    }, 1000);
  }, [isLastChunk, correctCount, onComplete]);

  // Toggle hint
  const handleToggleHint = useCallback(() => {
    setShowHint(prev => !prev);
    hapticService.lightTap();
  }, []);

  if (!currentChunk) return null;

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col px-4 py-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-orange-500" weight="fill" />
          <span className="font-semibold text-slate-700">Rappel Actif</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Streak */}
          {streak >= 2 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 bg-amber-100 px-3 py-1 rounded-full"
            >
              <Lightning className="w-4 h-4 text-amber-500" weight="fill" />
              <span className="font-bold text-amber-600">{streak}</span>
            </motion.div>
          )}
          {/* Score */}
          <div className="flex items-center gap-1 bg-green-100 px-3 py-1 rounded-full">
            <Star className="w-4 h-4 text-green-500" weight="fill" />
            <span className="font-bold text-green-600">{correctCount}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-200 rounded-full mb-6 overflow-hidden">
        <motion.div
          animate={{ width: `${((currentIndex + 1) / chunks.length) * 100}%` }}
          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
        />
      </div>

      {/* Card Counter */}
      <p className="text-center text-sm text-slate-400 mb-4">
        Expression {currentIndex + 1} sur {chunks.length}
      </p>

      {/* Flashcard */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, rotateY: -90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, rotateY: 90 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full max-w-md"
        >
          {/* Card Front (Question) */}
          <div className={`bg-white rounded-3xl shadow-xl border-2 overflow-hidden ${
            cardState === 'answered'
              ? 'border-green-300'
              : 'border-slate-200'
          }`}>
            {/* Card Header - Category */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3">
              <p className="text-white text-sm font-medium text-center">
                {currentChunk.category.charAt(0).toUpperCase() + currentChunk.category.slice(1)}
              </p>
            </div>

            {/* Card Body */}
            <div className="p-6">
              {/* Audio Button + French (Question) */}
              <div className="text-center mb-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handlePlayAudio}
                  disabled={isPlaying}
                  className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                    isPlaying
                      ? 'bg-orange-500'
                      : 'bg-orange-100 hover:bg-orange-200'
                  }`}
                >
                  <SpeakerHigh
                    className={`w-8 h-8 ${isPlaying ? 'text-white animate-pulse' : 'text-orange-600'}`}
                    weight="fill"
                  />
                </motion.button>

                <p className="text-2xl font-bold text-slate-800 mb-2">
                  {currentChunk.french}
                </p>
                <p className="text-slate-400 text-sm">
                  Comment dit-on en anglais ?
                </p>
              </div>

              {/* Hint Toggle */}
              {cardState === 'question' && (
                <button
                  onClick={handleToggleHint}
                  className="flex items-center gap-2 mx-auto text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showHint ? (
                    <EyeSlash className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                  <span className="text-sm">{showHint ? 'Cacher l\'indice' : 'Voir un indice'}</span>
                </button>
              )}

              {/* Hint Display */}
              <AnimatePresence>
                {showHint && cardState === 'question' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-3 bg-amber-50 rounded-xl text-center"
                  >
                    <p className="text-amber-700 text-sm">
                      Contexte : {currentChunk.context}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Divider */}
              {(cardState === 'revealed' || cardState === 'answered') && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  className="border-t border-slate-200 my-6"
                />
              )}

              {/* Answer (Revealed) */}
              <AnimatePresence>
                {(cardState === 'revealed' || cardState === 'answered') && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <p className="text-3xl font-black text-orange-600 mb-2">
                      {currentChunk.english}
                    </p>
                    {currentChunk.phonetic && (
                      <p className="text-slate-400 text-sm mb-2">
                        {currentChunk.phonetic}
                      </p>
                    )}
                    {currentChunk.variations && currentChunk.variations.length > 0 && (
                      <p className="text-slate-500 text-sm">
                        Aussi : {currentChunk.variations.join(', ')}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8">
        <AnimatePresence mode="wait">
          {cardState === 'question' && (
            <motion.button
              key="reveal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReveal}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/30"
            >
              Voir la réponse
            </motion.button>
          )}

          {cardState === 'revealed' && (
            <motion.div
              key="answer-buttons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              <p className="text-center text-slate-500 mb-4">
                Tu le savais ?
              </p>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(false)}
                  className="flex-1 py-4 bg-red-100 text-red-600 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-red-200 transition-colors"
                >
                  <X className="w-6 h-6" weight="bold" />
                  Non
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(true)}
                  className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
                >
                  <Check className="w-6 h-6" weight="bold" />
                  Oui !
                </motion.button>
              </div>
            </motion.div>
          )}

          {cardState === 'answered' && (
            <motion.div
              key="answered"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center"
              >
                <Check className="w-8 h-8 text-green-600" weight="bold" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChunkRecallMode;
