// ============================================
// ROLE PLAY MODE - Conversation IA (3 min)
// ============================================
// L'enfant joue une situation avec un personnage IA

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChatCircle,
  Microphone,
  SpeakerHigh,
  Lightbulb,
  Check,
  Star,
  CaretRight,
  User,
  CookingPot,
  AirplaneTakeoff,
  Storefront,
  Student,
  MapPin,
} from '@phosphor-icons/react';
import type { Situation, DialogueStep } from '../../data/situations';
import { voiceService } from '../../services/voiceService';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';

interface RolePlayModeProps {
  situation: Situation;
  childName?: string;
  onComplete: (score: number) => void;
}

interface Message {
  id: string;
  speaker: 'character' | 'child';
  text: string;
  textFr?: string;
  isCorrect?: boolean;
}

// Character avatar icon component
const CharacterIcon: React.FC<{ avatar: string; className?: string }> = ({ avatar, className = "w-6 h-6" }) => {
  switch (avatar) {
    case 'chef':
      return <CookingPot className={className} weight="fill" />;
    case 'airplane':
      return <AirplaneTakeoff className={className} weight="fill" />;
    case 'storefront':
      return <Storefront className={className} weight="fill" />;
    case 'student':
      return <Student className={className} weight="fill" />;
    case 'user':
    default:
      return <User className={className} weight="fill" />;
  }
};

export const RolePlayMode: React.FC<RolePlayModeProps> = ({
  situation,
  childName = 'Toi',
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentStep = situation.dialogueSteps[currentStepIndex];
  const isLastStep = currentStepIndex === situation.dialogueSteps.length - 1;

  // Play character message
  const playCharacterMessage = useCallback(async (text: string) => {
    setIsPlaying(true);
    try {
      await voiceService.speakEnglishWord(text);
    } catch (error) {
      console.error('Playback error:', error);
    }
    setIsPlaying(false);
  }, []);

  // Add character message and show options
  const showCharacterMessage = useCallback(async () => {
    if (!currentStep) return;

    const newMessage: Message = {
      id: `char-${currentStepIndex}`,
      speaker: 'character',
      text: currentStep.characterSays,
      textFr: currentStep.characterSaysFr,
    };

    setMessages(prev => [...prev, newMessage]);
    await playCharacterMessage(currentStep.characterSays);

    // Show response options after a delay
    setTimeout(() => {
      setShowOptions(true);
    }, 500);
  }, [currentStep, currentStepIndex, playCharacterMessage]);

  // Initialize first message
  useEffect(() => {
    if (currentStepIndex === 0 && messages.length === 0) {
      showCharacterMessage();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle response selection
  const handleSelectResponse = useCallback((response: typeof currentStep.expectedResponses[0]) => {
    if (!currentStep) return;

    soundService.playClick();
    hapticService.lightTap();

    // Add child's response
    const childMessage: Message = {
      id: `child-${currentStepIndex}`,
      speaker: 'child',
      text: response.text,
      textFr: response.textFr,
      isCorrect: response.isCorrect,
    };

    setMessages(prev => [...prev, childMessage]);
    setShowOptions(false);
    setShowHint(false);

    if (response.isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      soundService.playSuccess();
      hapticService.success();
    } else {
      soundService.playError();
      hapticService.error();
    }

    // Move to next step or complete
    setTimeout(() => {
      if (isLastStep) {
        setIsComplete(true);
      } else {
        setCurrentStepIndex(prev => prev + 1);
      }
    }, 1500);
  }, [currentStep, currentStepIndex, isLastStep]);

  // Show next character message
  useEffect(() => {
    if (currentStepIndex > 0 && !isComplete) {
      showCharacterMessage();
    }
  }, [currentStepIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle completion
  const handleComplete = useCallback(() => {
    const score = Math.round((correctAnswers / situation.dialogueSteps.length) * 30);
    soundService.playLevelUp();
    hapticService.success();
    onComplete(score);
  }, [correctAnswers, situation.dialogueSteps.length, onComplete]);

  // Toggle hint
  const handleToggleHint = useCallback(() => {
    setShowHint(prev => !prev);
    hapticService.lightTap();
  }, []);

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col">
      {/* Situation Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <CharacterIcon avatar={situation.character.avatar} className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">{situation.titleFr}</h2>
            <p className="text-green-100 text-sm">
              {situation.character.name} - {situation.character.roleFr}
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 py-3 bg-white border-b border-slate-100">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">
              Échange {currentStepIndex + 1} / {situation.dialogueSteps.length}
            </span>
            <div className="flex items-center gap-1">
              {[...Array(situation.dialogueSteps.length)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i < currentStepIndex ? 'bg-green-400'
                    : i === currentStepIndex ? 'bg-green-500 animate-pulse'
                    : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-lg mx-auto space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${message.speaker === 'child' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${message.speaker === 'child' ? 'order-2' : ''}`}>
                {/* Avatar */}
                <div className={`flex items-end gap-2 ${message.speaker === 'child' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.speaker === 'character'
                      ? situation.character.avatarColor || 'bg-green-100 text-green-600'
                      : 'bg-blue-100'
                  }`}>
                    {message.speaker === 'character' ? (
                      <CharacterIcon avatar={situation.character.avatar} className="w-5 h-5" />
                    ) : (
                      <User className="w-5 h-5 text-blue-600" weight="fill" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.speaker === 'character'
                        ? 'bg-white border border-slate-200 rounded-bl-sm'
                        : message.isCorrect
                        ? 'bg-green-500 text-white rounded-br-sm'
                        : 'bg-blue-500 text-white rounded-br-sm'
                    }`}
                  >
                    <p className={`font-medium ${message.speaker === 'character' ? 'text-slate-800' : ''}`}>
                      {message.text}
                    </p>
                    {message.textFr && message.speaker === 'character' && (
                      <p className="text-sm text-slate-400 mt-1 italic">{message.textFr}</p>
                    )}

                    {/* Play audio button for character messages */}
                    {message.speaker === 'character' && (
                      <button
                        onClick={() => playCharacterMessage(message.text)}
                        disabled={isPlaying}
                        className="mt-2 flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
                      >
                        <SpeakerHigh className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
                        Réécouter
                      </button>
                    )}

                    {/* Correct indicator */}
                    {message.speaker === 'child' && message.isCorrect && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1 mt-1 text-green-100"
                      >
                        <Check className="w-4 h-4" weight="bold" />
                        <span className="text-xs">Parfait !</span>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Typing indicator when playing */}
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white rounded-2xl px-4 py-3 border border-slate-200">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                      className="w-2 h-2 bg-slate-300 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Response Options */}
      <AnimatePresence>
        {showOptions && currentStep && !isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="border-t border-slate-200 bg-white px-4 py-4 safe-area-bottom"
          >
            <div className="max-w-lg mx-auto">
              {/* Hint button */}
              {currentStep.hintFr && (
                <button
                  onClick={handleToggleHint}
                  className="flex items-center gap-2 mb-3 text-amber-600"
                >
                  <Lightbulb className="w-5 h-5" weight={showHint ? 'fill' : 'regular'} />
                  <span className="text-sm font-medium">
                    {showHint ? currentStep.hintFr : 'Besoin d\'aide ?'}
                  </span>
                </button>
              )}

              {/* Response buttons */}
              <div className="space-y-2">
                {currentStep.expectedResponses.map((response, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectResponse(response)}
                    className="w-full p-4 bg-slate-50 hover:bg-blue-50 rounded-xl text-left transition-colors border-2 border-transparent hover:border-blue-200"
                  >
                    <p className="font-semibold text-slate-800">{response.text}</p>
                    <p className="text-sm text-slate-400 mt-1">{response.textFr}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Completion Panel */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-slate-200 bg-gradient-to-t from-green-50 to-white px-4 py-6 safe-area-bottom"
          >
            <div className="max-w-lg mx-auto text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"
              >
                <Star className="w-10 h-10 text-green-600" weight="fill" />
              </motion.div>

              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Bravo {childName} !
              </h3>
              <p className="text-slate-500 mb-4">
                Tu as terminé la conversation avec {situation.character.name}
              </p>

              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{correctAnswers}</p>
                  <p className="text-sm text-slate-400">Bonnes réponses</p>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-700">{situation.dialogueSteps.length}</p>
                  <p className="text-sm text-slate-400">Échanges</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleComplete}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
              >
                Continuer
                <CaretRight className="w-5 h-5" weight="bold" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RolePlayMode;
