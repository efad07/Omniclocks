import React, { useState, useEffect } from 'react';
import { useTime } from '../hooks/useTime';

const THEMES: Record<string, { name: string, className: string, previewClass: string }> = {
    rgb: { name: 'RGB Glow', className: 'text-rgb-glow', previewClass: 'bg-gradient-to-r from-pink-500 via-blue-500 to-green-500' },
    pink: { name: 'Cyber Pink', className: 'text-glow-cyber-pink', previewClass: 'bg-pink-400' },
    blue: { name: 'Electric Blue', className: 'text-glow-electric-blue', previewClass: 'bg-blue-400' },
    green: { name: 'Lime Green', className: 'text-glow-lime-green', previewClass: 'bg-lime-500' },
    orange: { name: 'Solar Orange', className: 'text-glow-solar-orange', previewClass: 'bg-orange-400' },
};

export const DigitalClock: React.FC = () => {
  const now = useTime();
  
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('clockTheme') || 'rgb';
    }
    return 'rgb';
  });

  const [is24HourFormat, setIs24HourFormat] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('timeFormat') === '24h';
    }
    return false;
  });
  
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  useEffect(() => {
      localStorage.setItem('timeFormat', is24HourFormat ? '24h' : '12h');
  }, [is24HourFormat]);

  useEffect(() => {
      localStorage.setItem('clockTheme', theme);
  }, [theme]);

  const toggleFormat = () => setIs24HourFormat(prev => !prev);
  const selectTheme = (themeName: string) => {
    setTheme(themeName);
    setIsPaletteOpen(false);
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: !is24HourFormat,
  };
  const fullTimeString = now.toLocaleTimeString('en-US', timeOptions);
  
  const dateString = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  let displayTime = '', displaySeconds = '', displayAmPm = '';

  if (is24HourFormat) {
    const parts = fullTimeString.split(':');
    displayTime = `${parts[0]}:${parts[1]}`;
    displaySeconds = `:${parts[2]}`;
  } else {
    const parts = fullTimeString.split(' ');
    const timeParts = parts[0].split(':');
    displayTime = `${timeParts[0]}:${timeParts[1]}`;
    displaySeconds = `:${timeParts[2]}`;
    displayAmPm = parts[1];
  }
  
  const selectedTheme = THEMES[theme] || THEMES['rgb'];

  return (
    <div className="relative flex flex-col items-center justify-center text-center w-full h-full animate-fadeIn">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
          <button 
            onClick={() => setIsPaletteOpen(!isPaletteOpen)}
            className="btn btn-icon"
            aria-label="Select color theme"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm10 3.25a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5zM8.5 6a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H9.25A.75.75 0 018.5 6zM6 8.5a.75.75 0 000 1.5h.5a.75.75 0 000-1.5H6zM6.25 12a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5H7a.75.75 0 01-.75-.75zM8.5 14a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H9.25a.75.75 0 01-.75-.75zM11.5 12a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5z" clipRule="evenodd" /></svg>
          </button>
          <button 
            onClick={toggleFormat}
            className="btn btn-icon !w-auto !px-3 font-mono font-bold"
            aria-label={`Switch to ${is24HourFormat ? '12-hour' : '24-hour'} format`}
          >
            {is24HourFormat ? '24H' : '12H'}
          </button>

          {isPaletteOpen && (
              <div className="absolute top-12 left-0 neumorphic-flat p-2 flex flex-col gap-2 animate-fadeIn">
                  {Object.entries(THEMES).map(([key, value]) => (
                      <button 
                        key={key} 
                        onClick={() => selectTheme(key)} 
                        className={`w-8 h-8 rounded-full ${value.previewClass} border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--surface)] focus:ring-[var(--accent)] ${theme === key ? 'border-white' : 'border-transparent'}`}
                        aria-label={`Select ${value.name} theme`}
                      />
                  ))}
              </div>
          )}
      </div>

      <div className="font-mono" style={{ fontSize: 'clamp(5rem, 35vw, 22rem)', lineHeight: 1 }}>
        <span className={`font-bold tracking-tight ${selectedTheme.className}`}>{displayTime}</span>
        <span className="font-normal text-[var(--accent)] opacity-90" style={{ fontSize: 'clamp(2rem, 12vw, 8rem)' }}>
            {displaySeconds}
        </span>
      </div>
       <div className="font-sans text-2xl sm:text-4xl text-[var(--text-secondary)] tracking-wider mt-4 h-10 flex items-center justify-center">
        {!is24HourFormat && <span className="opacity-80">{displayAmPm}</span>}
      </div>
      <div className="font-sans text-lg sm:text-2xl text-[var(--text-secondary)] opacity-80 tracking-wider mt-4">
        {dateString}
      </div>
    </div>
  );
};