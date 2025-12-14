import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, MoreHorizontal, Volume2, VolumeX } from 'lucide-react';
import { ChatMessage, UserProfile } from '../types';
import { chatWithTutor, speak } from '../services/geminiService';

interface GeminiTutorProps {
  user: UserProfile;
}

export const GeminiTutor: React.FC<GeminiTutorProps> = ({ user }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: `Hi ${user.name}! I'm your English buddy. What do you want to talk about today?` }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Speak a message
  const handleSpeak = async (text: string, messageId: string) => {
    if (isSpeaking) return;

    setIsSpeaking(true);
    setSpeakingMessageId(messageId);

    try {
      await speak(text);
    } catch (error) {
      console.error("Speech error:", error);
    } finally {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    }
  };

  // Speak the welcome message on mount
  useEffect(() => {
    if (autoSpeak && messages.length === 1) {
      setTimeout(() => {
        handleSpeak(messages[0].text, messages[0].id);
      }, 500);
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const history = messages.map(m => ({ role: m.role, text: m.text }));
    const responseText = await chatWithTutor(history, input, user);

    setIsTyping(false);
    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: responseText }]);

    // Auto-speak the response if enabled
    if (autoSpeak) {
      setTimeout(() => {
        handleSpeak(responseText, botMsgId);
      }, 300);
    }
  };

  return (
    <div className="h-[calc(100dvh-140px)] md:h-[calc(100dvh-100px)] flex flex-col bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">Miss AI Teacher</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] sm:text-xs text-gray-500 font-medium">En ligne</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Auto-speak toggle */}
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`p-2 rounded-full transition-colors ${autoSpeak ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:bg-gray-100'}`}
            title={autoSpeak ? "Voix activée" : "Voix désactivée"}
          >
            {autoSpeak ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 sm:space-y-6 bg-gray-50/30 no-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`
              w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0
              ${msg.role === 'user' ? `bg-primary-100 text-primary-600` : 'bg-purple-100 text-purple-600'}
            `}>
              {msg.role === 'user' ? <User size={12} /> : <Sparkles size={12} />}
            </div>

            <div className="flex flex-col gap-1 max-w-[75%] sm:max-w-[70%]">
              <div className={`
                px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-primary-500 text-white rounded-br-none shadow-md shadow-primary-500/10'
                  : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none shadow-sm'}
              `}>
                {msg.text}
              </div>

              {/* Speak button for bot messages */}
              {msg.role === 'model' && (
                <button
                  onClick={() => handleSpeak(msg.text, msg.id)}
                  disabled={isSpeaking}
                  className={`
                    self-start flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg transition-all
                    ${speakingMessageId === msg.id
                      ? 'bg-primary-100 text-primary-600 animate-pulse'
                      : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'}
                  `}
                >
                  <Volume2 size={12} />
                  {speakingMessageId === msg.id ? 'Écoute...' : 'Écouter'}
                </button>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Sparkles size={12} />
            </div>
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 bg-white border-t border-gray-100 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Écris quelque chose en anglais..."
            className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none transition-shadow"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-primary-500 text-white p-3 rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary-500/20 active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
