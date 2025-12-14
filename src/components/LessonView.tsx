import React, { useState, useEffect, useCallback } from 'react';
import { Lesson, Exercise, UserProfile } from '../types';
import { ArrowLeft, Volume2, CheckCircle, XCircle, Sparkles, RotateCcw, Lightbulb } from 'lucide-react';
import { generateLessonContent, speak, speakWithWebSpeech } from '../services/geminiService';

interface LessonViewProps {
  lesson: Lesson;
  user: UserProfile;
  onComplete: (stars: number) => void;
  onExit: () => void;
}

export const LessonView: React.FC<LessonViewProps> = ({ lesson, user, onComplete, onExit }) => {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [step, setStep] = useState(1);
  const [explanation, setExplanation] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);

  // Word-order specific state
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [hint, setHint] = useState<string>("");

  // Initialize speech synthesis voices on mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Load voices - they may load asynchronously
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Fetch content from Gemini on mount or step change
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      setExercise(null);
      setSelectedOption(null);
      setIsCorrect(null);
      setExplanation("");
      setAvailableWords([]);
      setSelectedWords([]);
      setHint("");

      try {
        // Generate content via Gemini with USER PROFILE context
        const jsonStr = await generateLessonContent(`${lesson.title} - Step ${step}`, user);
        const data = JSON.parse(jsonStr);

        const exerciseType = data.type || 'multiple-choice';

        if (exerciseType === 'word-order') {
          setExercise({
            type: 'word-order',
            question: data.question,
            words: data.words,
            correctOrder: data.correctOrder,
            correctAnswer: data.correctAnswer
          });
          setAvailableWords(data.words || []);
          setHint(data.hint || "");
        } else {
          setExercise({
            type: 'multiple-choice',
            question: data.question,
            options: data.options,
            correctAnswer: data.correctAnswer
          });
        }

        setExplanation(data.explanation || "");

        // Speak the question automatically when loaded
        const textToSpeak = exerciseType === 'word-order'
          ? data.hint || data.question
          : data.question;

        if (textToSpeak) {
          setTimeout(() => {
            handleSpeak(textToSpeak);
          }, 500);
        }

      } catch (error) {
        console.error("Error loading content:", error);
      }

      setLoading(false);
    };

    loadContent();
  }, [lesson, step, user]);

  // Speak text using the speak function with fallback
  const handleSpeak = async (text: string) => {
    if (isSpeaking) return;

    setIsSpeaking(true);
    setSpeakingWord(text);

    try {
      await speak(text);
    } catch (error) {
      console.error("Speech error:", error);
    } finally {
      setIsSpeaking(false);
      setSpeakingWord(null);
    }
  };

  // Quick speak for options (uses Web Speech for faster response)
  const handleQuickSpeak = async (text: string) => {
    setSpeakingWord(text);
    try {
      await speakWithWebSpeech(text);
    } catch (error) {
      console.error("Quick speech error:", error);
    } finally {
      setSpeakingWord(null);
    }
  };

  // Word-order: Select a word from available words
  const handleSelectWord = useCallback((word: string, index: number) => {
    if (isCorrect !== null) return;

    // Speak the word when tapped
    handleQuickSpeak(word);

    const newAvailable = [...availableWords];
    newAvailable.splice(index, 1);
    setAvailableWords(newAvailable);
    setSelectedWords([...selectedWords, word]);
  }, [availableWords, selectedWords, isCorrect]);

  // Word-order: Remove a word from selected words
  const handleRemoveWord = useCallback((word: string, index: number) => {
    if (isCorrect !== null) return;

    // Speak the word when tapped
    handleQuickSpeak(word);

    const newSelected = [...selectedWords];
    newSelected.splice(index, 1);
    setSelectedWords(newSelected);
    setAvailableWords([...availableWords, word]);
  }, [availableWords, selectedWords, isCorrect]);

  // Word-order: Reset selection
  const handleResetWords = useCallback(() => {
    if (!exercise?.words) return;
    setAvailableWords([...exercise.words]);
    setSelectedWords([]);
  }, [exercise]);

  // Handle option selection for multiple choice
  const handleSelectOption = (option: string) => {
    if (isCorrect !== null) return;

    // Speak the option when tapped
    handleQuickSpeak(option);
    setSelectedOption(option);
  };

  const handleCheck = async () => {
    if (!exercise) return;

    let correct: boolean;

    if (exercise.type === 'word-order') {
      const userAnswer = selectedWords.join(' ');
      correct = userAnswer === exercise.correctAnswer;
    } else {
      if (!selectedOption) return;
      correct = selectedOption === exercise.correctAnswer;
    }

    setIsCorrect(correct);

    // Speak feedback
    if (correct) {
      await handleSpeak("Excellent! Well done!");
    } else {
      await handleSpeak(`The correct answer is: ${exercise.correctAnswer}`);
    }
  };

  const handleNext = async () => {
    if (step >= 3) {
      await handleSpeak("Congratulations! You completed the lesson!");
      onComplete(3);
    } else {
      setStep(s => s + 1);
    }
  };

  const canCheck = exercise?.type === 'word-order'
    ? selectedWords.length > 0 && availableWords.length === 0
    : selectedOption !== null;

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto px-1 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between py-3 sm:py-4 shrink-0">
        <button
          onClick={onExit}
          className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors active:scale-95"
        >
          <ArrowLeft className="text-gray-500 w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="flex-1 mx-3 sm:mx-6 h-2.5 sm:h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
        <div className="text-sm sm:text-base font-bold text-primary-600 font-rounded min-w-[40px] text-right">
          {step}/3
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col justify-center overflow-y-auto py-2 sm:py-4">
        {loading ? (
          <div className="flex flex-col items-center gap-3 sm:gap-4 animate-pulse py-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <Sparkles className="text-primary-500 w-7 h-7 sm:w-8 sm:h-8 animate-spin" />
            </div>
            <p className="text-gray-400 font-medium text-sm sm:text-base">Création de l'exercice...</p>
            <p className="text-xs text-primary-400 font-medium">Niveau {user.grade}</p>
          </div>
        ) : exercise ? (
          <div className="w-full space-y-4 sm:space-y-6 animate-in fade-in duration-300">
            {/* Question Section */}
            <div className="text-center space-y-3 px-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-rounded font-bold text-gray-800 leading-snug">
                {exercise.question}
              </h2>

              {/* Hint for word-order */}
              {exercise.type === 'word-order' && hint && (
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-700 rounded-xl text-sm">
                  <Lightbulb size={16} className="shrink-0" />
                  <span className="font-medium">{hint}</span>
                </div>
              )}

              {/* Listen button */}
              <button
                onClick={() => handleSpeak(exercise.type === 'word-order' && exercise.correctAnswer ? exercise.correctAnswer : exercise.question)}
                disabled={isSpeaking}
                className={`
                  inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all text-sm
                  ${isSpeaking
                    ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-200 animate-pulse'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600 active:scale-95'}
                `}
              >
                <Volume2 size={16} className={isSpeaking ? 'animate-pulse' : ''} />
                {isSpeaking ? 'Écoute...' : 'Écouter'}
              </button>
            </div>

            {/* Word-Order Exercise */}
            {exercise.type === 'word-order' && (
              <div className="space-y-4 px-2">
                {/* Selected Words Area */}
                <div className="min-h-[60px] sm:min-h-[72px] p-3 sm:p-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl flex flex-wrap items-center justify-center gap-2">
                  {selectedWords.length === 0 ? (
                    <p className="text-gray-400 text-sm">Touche les mots pour construire la phrase</p>
                  ) : (
                    selectedWords.map((word, index) => (
                      <button
                        key={`selected-${index}`}
                        onClick={() => handleRemoveWord(word, index)}
                        disabled={isCorrect !== null}
                        className={`
                          px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium text-sm sm:text-base transition-all flex items-center gap-1.5
                          ${isCorrect === null
                            ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30 active:scale-95'
                            : isCorrect
                              ? 'bg-green-500 text-white'
                              : 'bg-red-400 text-white'}
                          ${speakingWord === word ? 'ring-2 ring-yellow-400' : ''}
                        `}
                      >
                        <Volume2 size={14} className="opacity-70" />
                        {word}
                      </button>
                    ))
                  )}
                </div>

                {/* Reset Button */}
                {selectedWords.length > 0 && isCorrect === null && (
                  <div className="flex justify-center">
                    <button
                      onClick={handleResetWords}
                      className="flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:text-gray-700 text-sm font-medium active:scale-95"
                    >
                      <RotateCcw size={14} />
                      Recommencer
                    </button>
                  </div>
                )}

                {/* Available Words */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-2">
                  {availableWords.map((word, index) => (
                    <button
                      key={`available-${index}`}
                      onClick={() => handleSelectWord(word, index)}
                      disabled={isCorrect !== null}
                      className={`
                        px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm sm:text-base transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5
                        ${speakingWord === word ? 'ring-2 ring-primary-400 bg-primary-50' : ''}
                      `}
                    >
                      <Volume2 size={14} className="opacity-50" />
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Multiple Choice Options */}
            {exercise.type === 'multiple-choice' && exercise.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 px-2">
                {exercise.options.map((option) => {
                  const isSelected = selectedOption === option;
                  const showResult = isCorrect !== null;
                  const isThisCorrect = option === exercise.correctAnswer;
                  const isThisWrong = isSelected && !isThisCorrect;
                  const isCurrentlySpeaking = speakingWord === option;

                  let cardClass = "bg-white border-2 border-gray-100 hover:border-primary-200 hover:bg-primary-50 active:scale-[0.98]";
                  if (isSelected && !showResult) cardClass = "bg-primary-50 border-primary-500 ring-1 ring-primary-500";
                  if (isCurrentlySpeaking && !showResult) cardClass = "bg-primary-50 border-primary-400 ring-2 ring-primary-300";

                  if (showResult) {
                    if (isThisCorrect) cardClass = "bg-green-50 border-green-500 text-green-700";
                    else if (isThisWrong) cardClass = "bg-red-50 border-red-400 text-red-600";
                    else cardClass = "opacity-40 border-gray-100 bg-gray-50";
                  }

                  return (
                    <button
                      key={option}
                      disabled={showResult}
                      onClick={() => handleSelectOption(option)}
                      className={`
                        p-4 sm:p-5 rounded-2xl text-base sm:text-lg font-medium text-center transition-all duration-200 flex items-center justify-center gap-2
                        ${cardClass}
                      `}
                    >
                      <Volume2 size={18} className={`opacity-50 shrink-0 ${isCurrentlySpeaking ? 'animate-pulse opacity-100' : ''}`} />
                      {option}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <p className="text-red-400 text-center">Erreur de chargement.</p>
        )}
      </div>

      {/* Footer / Controls */}
      <div className="shrink-0 pt-3 pb-2 sm:pt-4 sm:pb-4 border-t border-gray-100 mt-auto">
        {isCorrect === null ? (
          <button
            disabled={!canCheck || loading}
            onClick={handleCheck}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-base sm:text-lg font-bold py-3.5 sm:py-4 rounded-2xl shadow-lg shadow-green-500/30 transition-all active:scale-[0.98] disabled:shadow-none"
          >
            Vérifier
          </button>
        ) : (
          <div className={`rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in slide-in-from-bottom-2 ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                {isCorrect ? <CheckCircle size={22} /> : <XCircle size={22} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base sm:text-lg">{isCorrect ? 'Excellent !' : 'Pas tout à fait...'}</p>
                <p className="text-xs sm:text-sm opacity-90 line-clamp-2">{explanation}</p>
                {!isCorrect && exercise?.correctAnswer && (
                  <button
                    onClick={() => handleSpeak(exercise.correctAnswer)}
                    className="text-xs sm:text-sm font-medium mt-1 flex items-center gap-1 hover:underline"
                  >
                    <Volume2 size={14} />
                    Réponse : {exercise.correctAnswer}
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={handleNext}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95 ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}
            >
              Continuer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
