import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTime } from '../hooks/useTime';
import { INITIAL_WORLD_CITIES } from '../constants';
import type { WorldClockCity } from '../types';

interface ClockDisplayProps {
  city: WorldClockCity;
  now: Date;
  settings: { is24Hour: boolean; showOffset: boolean; showDate: boolean };
  onRemove?: (id: string) => void;
  onNameUpdate: (id: string, newName: string) => void;
  isReorderMode: boolean;
  isDraggable: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

const ClockDisplay: React.FC<ClockDisplayProps> = React.memo(({ city, now, settings, onRemove, onNameUpdate, isReorderMode, isDraggable, ...dragProps }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(city.customName || city.name);

  const timeString = now.toLocaleTimeString('en-US', {
    timeZone: city.timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: !settings.is24Hour,
  });
  
  const dateString = now.toLocaleDateString('en-US', {
    timeZone: city.timezone,
    weekday: 'short',
  });

  const handleNameUpdate = () => {
    if (editText.trim()) {
      onNameUpdate(city.id, editText.trim());
    } else {
      setEditText(city.customName || city.name); // Reset if empty
    }
    setIsEditing(false);
  };

  const timeZoneOffset = useMemo(() => {
    const localOffset = new Date().getTimezoneOffset();
    const remoteDate = new Date(now.toLocaleString('en-US', { timeZone: city.timezone }));
    const remoteOffset = (now.getTime() - remoteDate.getTime()) / (1000 * 60);
    const diff = (remoteOffset + localOffset) / 60;
    
    if (Math.abs(diff) < 0.1) return 'Local Time';
    
    return `${Math.abs(diff)}h ${diff < 0 ? 'ahead' : 'behind'}`;
  }, [now, city.timezone]);


  return (
    <div 
      className={`neumorphic-flat relative flex justify-between items-center p-4 transition-all ${isReorderMode && isDraggable ? 'cursor-grab scale-105 opacity-80 shadow-[0_0_15px_var(--accent-glow)]' : ''}`}
      draggable={isDraggable && isReorderMode}
      {...dragProps}
    >
      <div className="flex-grow">
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleNameUpdate}
            onKeyDown={(e) => e.key === 'Enter' && handleNameUpdate()}
            className="form-input text-xl sm:text-2xl font-semibold !p-1"
            autoFocus
          />
        ) : (
          <h3 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] pr-4">{city.customName || city.name}</h3>
        )}
        {settings.showOffset && city.id !== 'local' && <p className="text-sm text-[var(--text-secondary)]">{timeZoneOffset}</p>}
      </div>
      <div className="text-right">
        <p className="text-3xl sm:text-4xl font-mono text-[var(--accent)]">{timeString.split(' ')[0]}</p>
        <div className="flex items-center justify-end gap-2">
            {settings.showDate && <p className="text-xs text-[var(--text-secondary)]">{dateString}</p>}
            {!settings.is24Hour && <p className="text-xs text-[var(--text-secondary)]">{timeString.split(' ')[1]}</p>}
        </div>
      </div>
       {city.id !== 'local' && !isReorderMode && (
         <div className="absolute top-1.5 right-1.5 flex space-x-1 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
           <button onClick={() => setIsEditing(!isEditing)} className="btn-icon !w-7 !h-7" aria-label={`Rename ${city.name}`}>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
           </button>
           <button onClick={() => onRemove && onRemove(city.id)} className="btn-icon !w-7 !h-7 hover:!text-red-500" aria-label={`Remove ${city.name}`}>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
         </div>
       )}
    </div>
  );
});

const formatTimezoneName = (tz: string) => {
  return tz.split('/').pop()?.replace(/_/g, ' ') || tz;
};

export const WorldClock: React.FC = () => {
  const [cities, setCities] = useState<WorldClockCity[]>(() => {
    try {
      const savedCities = localStorage.getItem('worldClocks');
      return savedCities ? JSON.parse(savedCities) : INITIAL_WORLD_CITIES;
    } catch (error) {
      console.error("Failed to parse world clocks from localStorage", error);
      return INITIAL_WORLD_CITIES;
    }
  });

  const [settings, setSettings] = useState(() => {
    try {
      const savedSettings = localStorage.getItem('worldClockSettings');
      return savedSettings ? JSON.parse(savedSettings) : { is24Hour: false, showOffset: true, showDate: true };
    } catch {
      return { is24Hour: false, showOffset: true, showDate: true };
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const now = useTime();
  const draggedItem = useRef<number | null>(null);
  
  const allTimezones = useMemo(() => {
    if (typeof (Intl as any).supportedValuesOf === 'function') {
      return (Intl as any).supportedValuesOf('timeZone');
    }
    return [
      "Africa/Cairo", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
      "America/Sao_Paulo", "Asia/Tokyo", "Asia/Shanghai", "Asia/Dubai", "Asia/Kolkata",
      "Australia/Sydney", "Europe/London", "Europe/Paris", "Europe/Moscow", "Pacific/Honolulu", "UTC"
    ].sort();
  }, []);

  const filteredTimezones = useMemo(() => 
    allTimezones.filter(tz => tz.toLowerCase().includes(searchTerm.toLowerCase()))
  , [searchTerm, allTimezones]);

  useEffect(() => {
    localStorage.setItem('worldClocks', JSON.stringify(cities));
  }, [cities]);
  
  useEffect(() => {
    localStorage.setItem('worldClockSettings', JSON.stringify(settings));
  }, [settings]);

  const addCity = useCallback((timezone: string) => {
    if (cities.some(city => city.timezone === timezone)) return;
    const newCity: WorldClockCity = { id: timezone, name: formatTimezoneName(timezone), timezone };
    setCities(prev => [...prev, newCity]);
    setIsModalOpen(false);
    setSearchTerm('');
  }, [cities]);

  const removeCity = useCallback((id: string) => {
    if (id === 'local') return;
    setCities(prev => prev.filter(city => city.id !== id));
  }, []);
  
  const updateCityName = useCallback((id: string, newName: string) => {
    setCities(prev => prev.map(city => city.id === id ? { ...city, customName: newName } : city));
  }, []);
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    draggedItem.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (draggedItem.current === null) return;
    const draggedIndex = draggedItem.current;
    if (draggedIndex === index) return;

    const reorderedCities = [...cities];
    const [removed] = reorderedCities.splice(draggedIndex, 1);
    reorderedCities.splice(index, 0, removed);
    setCities(reorderedCities);
    draggedItem.current = null;
  };

  const localCity = cities.find(c => c.id === 'local');
  const otherCities = cities.filter(c => c.id !== 'local');

  return (
    <div className="w-full max-w-md mx-auto flex flex-col p-4 h-full animate-fadeIn">
      <header className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-[var(--accent)]">World Clock</h2>
        <div className="flex items-center gap-2">
            <button onClick={() => setIsReorderMode(!isReorderMode)} className={`btn-icon ${isReorderMode ? '!shadow-[inset_3px_3px_6px_var(--shadow-dark),inset_-3px_-3px_6px_var(--shadow-light)] text-[var(--accent)]' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="btn-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
        </div>
      </header>

      <div className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {localCity && <ClockDisplay key={localCity.id} city={localCity} now={now} settings={settings} onNameUpdate={updateCityName} isReorderMode={false} isDraggable={false} onDragStart={()=>{}} onDragOver={()=>{}} onDrop={()=>{}} />}
        {otherCities.map((city, index) => (
          <ClockDisplay key={city.id} city={city} now={now} settings={settings} onRemove={removeCity} onNameUpdate={updateCityName} isReorderMode={isReorderMode} isDraggable={true} onDragStart={(e) => handleDragStart(e, cities.findIndex(c => c.id === city.id))} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, cities.findIndex(c => c.id === city.id))} />
        ))}
      </div>
      <div className="mt-4">
        <button onClick={() => setIsModalOpen(true)} className="w-full btn btn-primary">Add City</button>
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-[var(--background)]/70 backdrop-blur-sm flex items-center justify-center z-40" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-sm h-[70vh] neumorphic-flat flex flex-col mx-4 animate-fadeIn" onClick={e => e.stopPropagation()}>
            <header className="p-4 border-b border-[var(--shadow-dark)]"><h3 className="text-lg font-bold text-[var(--accent)]">Select Timezone</h3></header>
            <div className="p-4"><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input"/></div>
            <main className="flex-grow overflow-y-auto custom-scrollbar">
              <ul className="divide-y divide-[var(--shadow-dark)]">{filteredTimezones.map(tz => (<li key={tz}><button onClick={() => addCity(tz)} className="w-full text-left p-4 hover:bg-[var(--shadow-light)] transition-colors">{formatTimezoneName(tz)}<span className="text-xs text-[var(--text-secondary)] block">{tz}</span></button></li>))}</ul>
            </main>
          </div>
        </div>
      )}
      {isSettingsOpen && (
         <div className="fixed inset-0 bg-[var(--background)]/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setIsSettingsOpen(false)}>
            <div className="w-full max-w-sm neumorphic-flat mx-4 animate-fadeIn" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-[var(--shadow-dark)]"><h3 className="text-lg font-bold text-[var(--accent)]">World Clock Settings</h3><button onClick={() => setIsSettingsOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-2xl">&times;</button></header>
                <div className="p-4 space-y-4">
                    <label className="flex items-center justify-between cursor-pointer"><span className="text-[var(--text-primary)]">24-Hour Format</span><div className="relative"><input type="checkbox" checked={settings.is24Hour} onChange={e => setSettings(s => ({...s, is24Hour: e.target.checked}))} className="sr-only peer" /><div className="toggle-switch"></div></div></label>
                    <label className="flex items-center justify-between cursor-pointer"><span className="text-[var(--text-primary)]">Show Date</span><div className="relative"><input type="checkbox" checked={settings.showDate} onChange={e => setSettings(s => ({...s, showDate: e.target.checked}))} className="sr-only peer" /><div className="toggle-switch"></div></div></label>
                    <label className="flex items-center justify-between cursor-pointer"><span className="text-[var(--text-primary)]">Show Time Offset</span><div className="relative"><input type="checkbox" checked={settings.showOffset} onChange={e => setSettings(s => ({...s, showOffset: e.target.checked}))} className="sr-only peer" /><div className="toggle-switch"></div></div></label>
                </div>
            </div>
         </div>
      )}
    </div>
  );
};