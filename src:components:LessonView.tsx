import React, { useState, useEffect } from 'react';
import { Lesson, Exercise, UserProfile } from '../types';
import { ArrowLeft, Volume2, Mic, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { generateLessonContent, synthesizeSpeech } from '../services/geminiService';

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
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Fetch content from Gemini on mount or step change
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      setExercise(null);
      setSelectedOption(null);
      setIsCorrect(null);
      setExplanation("");
      setAudioBuffer(null);

      // Generate content via Gemini with USER PROFILE context
      const jsonStr = await generateLessonContent(`${lesson.title} - Step ${step}`, user);
      const data = JSON.parse(jsonStr);
      
      setExercise({
        type: 'multiple-choice',
        question: data.question,
        options: data.options,
        correctAnswer: data.correctAnswer
      });
      setExplanation(data.explanation || "");

      // Pre-fetch TTS
      if (data.question) {
        const buffer = await synthesizeSpeech(data.question);
        setAudioBuffer(buffer);
      }

      setLoading(false);
    };

    loadContent();
  }, [lesson, step, user]);

  const handlePlayAudio = async () => {
    if (!audioBuffer) return;
    setIsPlayingAudio(true);
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(context.destination);
    source.onended = () => setIsPlayingAudio(false);
    source.start(0);
  };

  const handleCheck = () => {
    if (!exercise || !selectedOption) return;
    const correct = selectedOption === exercise.correctAnswer;
    setIsCorrect(correct);
  };

  const handleNext = () => {
    if (step >= 3) {
      onComplete(3); 
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onExit} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="text-gray-500" />
        </button>
        <div className="flex-1 mx-8 h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
                className="h-full bg-primary-500 transition-all duration-500 ease-out"
                style={{ width: `${(step / 3) * 100}%` }}
            />
        </div>
        <div className="text-sm font-bold text-primary-600 font-rounded">
            {step}/3
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        {loading ? (
            <div className="flex flex-col items-center gap-4 animate-pulse">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <Sparkles className="text-primary-500 animate-spin-slow" />
                </div>
                <p className="text-gray-400 font-medium">Magic AI is creating your lesson...</p>
                <p className="text-xs text-primary-400 font-medium">Customizing for {user.grade} level</p>
            </div>
        ) : exercise ? (
            <div className="w-full space-y-8 animate-in zoom-in-50 duration-300">
                {/* Question Section */}
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-3xl font-rounded font-bold text-gray-800">
                        {exercise.question}
                    </h2>
                    
                    {audioBuffer && (
                        <button 
                            onClick={handlePlayAudio}
                            className={`
                                inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all
                                ${isPlayingAudio ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-200' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'}
                            `}
                        >
                            <Volume2 size={18} />
                            {isPlayingAudio ? 'Listening...' : 'Listen'}
                        </button>
                    )}
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exercise.options?.map((option) => {
                        const isSelected = selectedOption === option;
                        const showResult = isCorrect !== null;
                        const isThisCorrect = option === exercise.correctAnswer;
                        const isThisWrong = isSelected && !isThisCorrect;

                        let cardClass = "bg-white border-2 border-gray-100 hover:border-primary-200 hover:bg-primary-50";
                        if (isSelected) cardClass = "bg-primary-50 border-primary-500 ring-1 ring-primary-500";
                        
                        if (showResult) {
                            if (isThisCorrect) cardClass = "bg-green-50 border-green-500 text-green-700";
                            else if (isThisWrong) cardClass = "bg-red-50 border-red-500 text-red-700 opacity-50";
                            else cardClass = "opacity-50 border-gray-100";
                        }

                        return (
                            <button
                                key={option}
                                disabled={showResult}
                                onClick={() => setSelectedOption(option)}
                                className={`
                                    p-6 rounded-2xl text-lg font-medium text-center transition-all duration-200
                                    ${cardClass}
                                `}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
            </div>
        ) : (
             <p className="text-red-400">Error loading exercise.</p>
        )}
      </div>

      {/* Footer / Controls */}
      <div className={`mt-8 border-t border-gray-100 pt-6 transition-all duration-300 ${isCorrect !== null ? 'opacity-100 translate-y-0' : 'opacity-100'}`}>
         {isCorrect === null ? (
             <button
                disabled={!selectedOption || loading}
                onClick={handleCheck}
                className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg font-bold py-4 rounded-2xl shadow-lg shadow-green-500/30 transition-all active:scale-[0.98]"
             >
                Check Answer
             </button>
         ) : (
            <div className={`rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-bottom-2 ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                        {isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
                    </div>
                    <div>
                        <p className="font-bold text-lg">{isCorrect ? 'Excellent!' : 'Not quite right'}</p>
                        <p className="text-sm opacity-90">{explanation}</p>
                    </div>
                </div>
                <button
                    onClick={handleNext}
                    className={`px-6 py-3 rounded-xl font-bold text-white shadow-md transition-transform hover:scale-105 ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}
                >
                    Continue
                </button>
            </div>
         )}
      </div>
    </div>
  );
};