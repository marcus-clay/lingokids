// ============================================
// STORY MODE - Mini BD Interactive (1 min)
// ============================================
// Input compréhensible avec histoire visuelle et audio
// Objectif: Écouter, comprendre, et identifier les mots clés

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SpeakerHigh,
  CaretRight,
  CaretLeft,
  Star,
  Sparkle,
  Smiley,
  SmileyMeh,
  SmileySad,
  SmileyXEyes,
  Confetti,
  BookOpen,
  Heart,
  Lightning,
  Play,
  Check,
  Translate,
  Ear,
  Eye,
  Target,
} from '@phosphor-icons/react';
import type { Story, StoryPanel } from '../../data/situations';
import { voiceService } from '../../services/voiceService';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';

interface StoryModeProps {
  story: Story;
  onComplete: (wordsLearned: number) => void;
}

// Emotion to icon mapping
const EmotionIcon: React.FC<{ emotion: string; className?: string }> = ({ emotion, className = "w-8 h-8" }) => {
  switch (emotion) {
    case 'happy':
      return <Smiley className={className} weight="fill" />;
    case 'sad':
      return <SmileySad className={className} weight="fill" />;
    case 'surprised':
      return <SmileyXEyes className={className} weight="fill" />;
    case 'excited':
      return <Confetti className={className} weight="fill" />;
    case 'neutral':
    default:
      return <SmileyMeh className={className} weight="fill" />;
  }
};

// Panel background colors based on emotion
const EMOTION_COLORS: Record<string, string> = {
  happy: 'from-yellow-100 to-orange-100',
  sad: 'from-blue-100 to-indigo-100',
  surprised: 'from-purple-100 to-pink-100',
  excited: 'from-green-100 to-emerald-100',
  neutral: 'from-slate-100 to-gray-100',
};

type StoryPhase = 'intro' | 'listening' | 'reading' | 'complete';

export const StoryMode: React.FC<StoryModeProps> = ({ story, onComplete }) => {
  const [phase, setPhase] = useState<StoryPhase>('intro');
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFrench, setShowFrench] = useState(false);
  const [listenedPanels, setListenedPanels] = useState<Set<number>>(new Set());
  const [tappedWords, setTappedWords] = useState<Set<string>>(new Set());

  const currentPanel = story.panels[currentPanelIndex];
  const isLastPanel = currentPanelIndex === story.panels.length - 1;
  const isFirstPanel = currentPanelIndex === 0;
  const hasListenedCurrent = listenedPanels.has(currentPanelIndex);

  // Play audio for current panel
  const playPanelAudio = useCallback(async () => {
    if (!currentPanel || isPlaying) return;

    setIsPlaying(true);
    soundService.playClick();
    hapticService.lightTap();

    try {
      await voiceService.speakEnglishWord(currentPanel.textEn);
      setListenedPanels(prev => new Set([...prev, currentPanelIndex]));
    } catch (error) {
      console.error('Audio error:', error);
    }

    setIsPlaying(false);
  }, [currentPanel, currentPanelIndex, isPlaying]);

  // Auto-play on panel change in reading phase
  useEffect(() => {
    if (phase === 'reading' && currentPanel) {
      const timer = setTimeout(playPanelAudio, 600);
      return () => clearTimeout(timer);
    }
  }, [currentPanelIndex, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle word tap
  const handleWordTap = (word: string) => {
    const cleanWord = word.toLowerCase().replace(/[.,!?'"]/g, '');
    if (!tappedWords.has(cleanWord)) {
      setTappedWords(prev => new Set([...prev, cleanWord]));
      soundService.playPop();
      hapticService.lightTap();

      // Speak the word
      voiceService.speakEnglishWord(word);
    }
  };

  // Navigate panels
  const handleNext = useCallback(() => {
    if (isLastPanel) {
      setPhase('complete');
      soundService.playSuccess();
      hapticService.success();

      // Small delay before completing
      setTimeout(() => {
        onComplete(story.vocabulary.length);
      }, 1500);
    } else {
      soundService.playPop();
      hapticService.lightTap();
      setCurrentPanelIndex(prev => prev + 1);
      setShowFrench(false);
    }
  }, [isLastPanel, onComplete, story.vocabulary.length]);

  const handlePrevious = useCallback(() => {
    if (!isFirstPanel) {
      soundService.playPop();
      hapticService.lightTap();
      setCurrentPanelIndex(prev => prev - 1);
      setShowFrench(false);
    }
  }, [isFirstPanel]);

  // Start reading phase
  const handleStartReading = () => {
    setPhase('reading');
    soundService.playWhoosh();
    hapticService.success();
  };

  if (!currentPanel && phase !== 'complete') return null;

  const emotion = currentPanel?.emotion || 'neutral';

  // Intro screen
  if (phase === 'intro') {
    return (
      <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center px-6 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          {/* Story Icon */}
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl"
          >
            <BookOpen className="w-12 h-12 text-white" weight="fill" />
          </motion.div>

          <h1 className="text-2xl font-black text-slate-800 mb-2">
            {story.titleFr}
          </h1>
          <p className="text-slate-400 text-sm mb-6">
            {story.title}
          </p>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-2xl p-4 mb-6 text-left">
            <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" weight="fill" />
              Comment jouer
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-blue-700 text-sm">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <span>Ecoute chaque image de l'histoire</span>
              </div>
              <div className="flex items-center gap-3 text-blue-700 text-sm">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <span>Tape sur les mots en gras pour les entendre</span>
              </div>
              <div className="flex items-center gap-3 text-blue-700 text-sm">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <span>Utilise la traduction si besoin</span>
              </div>
            </div>
          </div>

          {/* Vocabulary Preview */}
          <div className="mb-6">
            <p className="text-xs text-slate-400 mb-2">Mots a decouvrir :</p>
            <div className="flex flex-wrap justify-center gap-2">
              {story.vocabulary.slice(0, 4).map((word, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-white rounded-full text-sm font-medium text-slate-600 border border-slate-200"
                >
                  {word}
                </span>
              ))}
              {story.vocabulary.length > 4 && (
                <span className="px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-400">
                  +{story.vocabulary.length - 4}
                </span>
              )}
            </div>
          </div>

          {/* Start Button */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartReading}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/30 flex items-center justify-center gap-3"
          >
            <Play className="w-6 h-6" weight="fill" />
            Commencer l'histoire
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Complete screen
  if (phase === 'complete') {
    const wordsDiscovered = tappedWords.size;
    const totalHighlightWords = new Set(story.panels.flatMap(p => p.audioHighlights)).size;

    return (
      <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center px-6 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center shadow-xl"
          >
            <Check className="w-12 h-12 text-white" weight="bold" />
          </motion.div>

          <h1 className="text-2xl font-black text-slate-800 mb-2">
            Histoire terminee !
          </h1>
          <p className="text-slate-500 mb-6">
            Tu as decouvert {wordsDiscovered} mot{wordsDiscovered > 1 ? 's' : ''} sur {totalHighlightWords}
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl px-4 py-3">
              <Ear className="w-6 h-6 text-blue-500 mx-auto mb-1" weight="fill" />
              <p className="text-lg font-bold text-blue-600">{listenedPanels.size}</p>
              <p className="text-xs text-blue-400">Ecoutes</p>
            </div>
            <div className="bg-purple-50 rounded-xl px-4 py-3">
              <Eye className="w-6 h-6 text-purple-500 mx-auto mb-1" weight="fill" />
              <p className="text-lg font-bold text-purple-600">{story.panels.length}</p>
              <p className="text-xs text-purple-400">Images</p>
            </div>
            <div className="bg-amber-50 rounded-xl px-4 py-3">
              <Star className="w-6 h-6 text-amber-500 mx-auto mb-1" weight="fill" />
              <p className="text-lg font-bold text-amber-600">+15</p>
              <p className="text-xs text-amber-400">XP</p>
            </div>
          </div>

          <p className="text-sm text-slate-400">
            Passe a la suite...
          </p>
        </motion.div>
      </div>
    );
  }

  // Reading phase - Main story view
  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col px-4 py-4">
      {/* Header with Progress */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-500" weight="fill" />
          <span className="font-semibold text-slate-700 text-sm">{story.titleFr}</span>
        </div>

        {/* Panel Progress */}
        <div className="flex items-center gap-1.5">
          {story.panels.map((_, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx === currentPanelIndex
                  ? 'bg-blue-500 w-6'
                  : listenedPanels.has(idx)
                  ? 'bg-green-400'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Story Panel - BD Style */}
      <motion.div
        key={currentPanelIndex}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="flex-1 flex flex-col"
      >
        {/* Image/Illustration Area */}
        <div className={`relative bg-gradient-to-br ${EMOTION_COLORS[emotion]} rounded-3xl p-6 mb-4 min-h-[180px] flex items-center justify-center border-4 border-white shadow-xl`}>
          {/* Comic-style panel number */}
          <div className="absolute top-3 left-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
            <span className="font-bold text-slate-600">{currentPanelIndex + 1}</span>
          </div>

          {/* Emotion indicator */}
          <div className="absolute top-3 right-3 text-yellow-500">
            <EmotionIcon emotion={emotion} className="w-7 h-7" />
          </div>

          {/* Illustration */}
          <div className="text-center">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-3 flex justify-center"
            >
              {emotion === 'happy' ? (
                <Star className="w-14 h-14 text-yellow-400" weight="fill" />
              ) : emotion === 'excited' ? (
                <Confetti className="w-14 h-14 text-pink-500" weight="fill" />
              ) : emotion === 'sad' ? (
                <Heart className="w-14 h-14 text-blue-400" weight="fill" />
              ) : emotion === 'surprised' ? (
                <Lightning className="w-14 h-14 text-purple-500" weight="fill" />
              ) : (
                <BookOpen className="w-14 h-14 text-slate-500" weight="fill" />
              )}
            </motion.div>
            <p className="text-xs text-slate-500 italic max-w-[200px]">
              {currentPanel.imageDescription}
            </p>
          </div>

          {/* Sparkle decoration */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute bottom-3 left-3"
          >
            <Sparkle className="w-5 h-5 text-yellow-400" weight="fill" />
          </motion.div>
        </div>

        {/* Text Bubble with Audio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 relative"
        >
          {/* Speech bubble pointer */}
          <div className="absolute -top-3 left-8 w-5 h-5 bg-white border-l border-t border-slate-100 transform rotate-45" />

          <div className="relative z-10">
            {/* Audio Button Row */}
            <div className="flex items-center gap-3 mb-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={playPanelAudio}
                disabled={isPlaying}
                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  isPlaying
                    ? 'bg-blue-500'
                    : hasListenedCurrent
                    ? 'bg-green-100 hover:bg-green-200'
                    : 'bg-blue-100 hover:bg-blue-200'
                }`}
              >
                {hasListenedCurrent && !isPlaying ? (
                  <Check className="w-5 h-5 text-green-600" weight="bold" />
                ) : (
                  <SpeakerHigh
                    className={`w-5 h-5 ${isPlaying ? 'text-white animate-pulse' : 'text-blue-600'}`}
                    weight="fill"
                  />
                )}
              </motion.button>

              <p className="text-xs text-slate-400 flex-1">
                {isPlaying ? 'Ecoute...' : hasListenedCurrent ? 'Reecouter' : 'Appuie pour ecouter'}
              </p>

              {/* Translation toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFrench(!showFrench)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  showFrench
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                <Translate className="w-4 h-4" weight="bold" />
                FR
              </motion.button>
            </div>

            {/* English Text - Interactive Words */}
            <p className="text-lg font-semibold text-slate-800 leading-relaxed">
              {currentPanel.textEn.split(' ').map((word, idx) => {
                const cleanWord = word.toLowerCase().replace(/[.,!?'"]/g, '');
                const isHighlighted = currentPanel.audioHighlights.some(
                  h => cleanWord.includes(h.toLowerCase())
                );
                const wasTapped = tappedWords.has(cleanWord);

                if (isHighlighted) {
                  return (
                    <motion.span
                      key={idx}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleWordTap(word)}
                      className={`cursor-pointer px-1 rounded transition-colors ${
                        wasTapped
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {word}{' '}
                    </motion.span>
                  );
                }
                return <span key={idx}>{word} </span>;
              })}
            </p>

            {/* French Translation */}
            <AnimatePresence>
              {showFrench && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-slate-500 mt-3 pt-3 border-t border-slate-100 italic text-sm"
                >
                  {currentPanel.textFr}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4 gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePrevious}
          disabled={isFirstPanel}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-colors ${
            isFirstPanel
              ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
          }`}
        >
          <CaretLeft className="w-5 h-5" weight="bold" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-4 rounded-xl font-bold text-white transition-colors ${
            isLastPanel
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/30'
              : 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30'
          }`}
        >
          {isLastPanel ? (
            <>
              <Check className="w-5 h-5" weight="bold" />
              Terminer
            </>
          ) : (
            <>
              Suivant
              <CaretRight className="w-5 h-5" weight="bold" />
            </>
          )}
        </motion.button>
      </div>

      {/* Vocabulary hint at bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400"
      >
        <Target className="w-4 h-4" />
        <span>Tape sur les mots en couleur pour les apprendre</span>
      </motion.div>
    </div>
  );
};

export default StoryMode;
