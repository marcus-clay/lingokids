import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, MoreHorizontal } from 'lucide-react';
import { ChatMessage, UserProfile } from '../types';
import { chatWithTutor } from '../services/geminiService';

interface GeminiTutorProps {
  user: UserProfile;
}

export const GeminiTutor: React.FC<GeminiTutorProps> = ({ user }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: `Hi ${user.name}! 👋 I'm your English buddy. What do you want to talk about today?` }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const history = messages.map(m => ({ role: m.role, text: m.text }));
    const responseText = await chatWithTutor(history, input, user);

    setIsTyping(false);
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText }]);
  };

  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] flex flex-col bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white">
                    <Bot size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Miss AI Teacher</h3>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs text-gray-500 font-medium">Online</span>
                    </div>
                </div>
            </div>
            <button className="p-2 text-gray-400 hover:bg-white hover:text-gray-600 rounded-full transition-colors">
                <MoreHorizontal size={20} />
            </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/30">
            {messages.map((msg) => (
                <div 
                    key={msg.id} 
                    className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                    <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center shrink-0
                        ${msg.role === 'user' ? `bg-primary-100 text-primary-600` : 'bg-purple-100 text-purple-600'}
                    `}>
                        {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                    </div>
                    
                    <div className={`
                        max-w-[70%] px-5 py-3 rounded-2xl text-sm leading-relaxed
                        ${msg.role === 'user' 
                            ? 'bg-primary-500 text-white rounded-br-none shadow-md shadow-primary-500/10' 
                            : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none shadow-sm'}
                    `}>
                        {msg.text}
                    </div>
                </div>
            ))}
            
            {isTyping && (
                <div className="flex items-end gap-2">
                     <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                        <Sparkles size={14} />
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
        <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type something in English..."
                    className="flex-1 bg-gray-50 border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-shadow"
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="bg-primary-500 text-white p-3 rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary-500/20"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    </div>
  );
};