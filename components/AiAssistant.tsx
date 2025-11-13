import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getAiResponse } from '../services/geminiService';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

interface AiAssistantProps {
  onClose: () => void;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: "Hello! How can I help you with time today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const aiResponseText = await getAiResponse(input);
    const aiMessage: Message = { sender: 'ai', text: aiResponseText };
    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  }, [input, isLoading]);

  return (
    <div className="fixed inset-0 bg-[var(--background)]/70 backdrop-blur-sm flex items-center justify-center z-40 animate-fadeIn" onClick={onClose}>
      <div className="w-full max-w-lg h-[80vh] neumorphic-flat flex flex-col mx-4" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-[var(--shadow-dark)] flex-shrink-0">
          <h2 className="text-xl font-bold text-[var(--accent)]">AI Assistant</h2>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-2xl">
             &times;
          </button>
        </header>

        <main className="flex-grow p-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex-shrink-0 neumorphic-flat !shadow-none"></div>}
                <div className={`max-w-xs md:max-w-md p-3 text-sm rounded-xl ${msg.sender === 'user' ? 'btn-primary !rounded-br-none' : 'neumorphic-flat text-[var(--text-primary)] !rounded-bl-none'}`}>
                  <p dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex-shrink-0 neumorphic-flat !shadow-none"></div>
                <div className="max-w-xs md:max-w-md p-3 rounded-xl neumorphic-flat text-[var(--text-primary)] !rounded-bl-none">
                  <div className="flex space-x-1.5">
                      <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>
        
        <footer className="p-4 border-t border-[var(--shadow-dark)] flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about time..."
              className="form-input"
              disabled={isLoading}
            />
            <button type="submit" className="btn btn-primary !p-3 !rounded-lg" disabled={isLoading || !input.trim()}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};