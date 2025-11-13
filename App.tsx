import React, { useState, useCallback, useEffect } from 'react';
import { DigitalClock } from './components/DigitalClock.tsx';
import { Stopwatch } from './components/Stopwatch.tsx';
import { AlarmClock } from './components/AlarmClock.tsx';
import { Timer } from './components/Timer.tsx';
import { WorldClock } from './components/WorldClock.tsx';
import { AiAssistant } from './components/AiAssistant.tsx';
import { NAV_ITEMS } from './constants.tsx';
import type { NavItemType } from './types.ts';
import { ThemeToggle } from './components/ThemeToggle.tsx';
import { PrivacyPolicyModal } from './components/PrivacyPolicy.tsx';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavItemType>('DigitalClock');
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [policyModalContent, setPolicyModalContent] = useState<'privacy' | 'terms' | null>(null);

  const renderActiveComponent = useCallback(() => {
    switch (activeTab) {
      case 'DigitalClock':
        return <DigitalClock />;
      case 'Stopwatch':
        return <Stopwatch />;
      case 'AlarmClock':
        return <AlarmClock />;
      case 'Timer':
        return <Timer />;
      case 'WorldClock':
        return <WorldClock />;
      default:
        return <DigitalClock />;
    }
  }, [activeTab]);

  const handleOpenPolicyModal = (content: 'privacy' | 'terms') => {
    setPolicyModalContent(content);
    setIsPolicyModalOpen(true);
  };

  return (
    <div className="bg-[var(--background)] text-[var(--text-primary)] min-h-screen flex flex-col font-sans select-none relative overflow-hidden">
      <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
      </div>

      <main className="flex-grow flex flex-col items-center justify-center p-4 relative">
        {renderActiveComponent()}
      </main>

      {/* AI Assistant FAB */}
      <button
        onClick={() => setIsAiAssistantOpen(true)}
        className="btn btn-icon fixed bottom-24 right-4 sm:bottom-6 sm:right-6 !w-16 !h-16 !rounded-full !bg-[var(--accent)] text-white z-30
        !shadow-[6px_6px_12px_var(--shadow-dark),-6px_-6px_12px_var(--shadow-light),0px_0px_20px_var(--accent-glow)]
        hover:!text-white hover:brightness-110 active:!shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)]"
        aria-label="Open AI Assistant"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
      </button>

      {isAiAssistantOpen && <AiAssistant onClose={() => setIsAiAssistantOpen(false)} />}
      
      {isPolicyModalOpen && policyModalContent && (
        <PrivacyPolicyModal content={policyModalContent} onClose={() => setIsPolicyModalOpen(false)} />
      )}

      {/* Bottom Navigation */}
      <nav className="w-full bg-[var(--background)] fixed bottom-0 left-0 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_var(--shadow-dark)]">
        <div className="flex justify-around max-w-2xl mx-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-3 px-1 text-xs sm:text-sm transition-all duration-300 relative group ${
                activeTab === item.id ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className={`w-16 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${activeTab === item.id ? 'neumorphic-inset !bg-transparent' : 'group-hover:opacity-80'}`}>
                {item.icon}
              </div>
              <span className="mt-1 font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-[var(--text-secondary)] py-6 mt-16">
        <button onClick={() => handleOpenPolicyModal('privacy')} className="hover:text-[var(--accent)] px-2 transition-colors">Privacy Policy</button>
        <span className="opacity-50">|</span>
        <button onClick={() => handleOpenPolicyModal('terms')} className="hover:text-[var(--accent)] px-2 transition-colors">Terms of Service</button>
      </footer>
    </div>
  );
};

export default App;