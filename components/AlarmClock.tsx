import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Alarm } from '../types';
import { useTime } from '../hooks/useTime';
import { ALARM_SOUNDS } from '../constants';

const formatAlarmTime = (time24: string) => {
    const [hour, minute] = time24.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    let hour12 = hour % 12;
    if (hour12 === 0) hour12 = 12; // Handle midnight and noon
    return {
      time: `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      ampm: ampm
    };
};

const TimeAdjustButton: React.FC<{onClick: () => void, children: React.ReactNode, 'aria-label': string}> = ({ onClick, children, 'aria-label': ariaLabel }) => (
    <button onClick={onClick} className="btn btn-icon !w-8 !h-8" aria-label={ariaLabel}>
        {children}
    </button>
);

export const AlarmClock: React.FC = () => {
  const [alarms, setAlarms] = useState<Alarm[]>(() => {
    const savedAlarms = localStorage.getItem('alarms');
    if (savedAlarms) {
      // Ensure old alarms without a sound property get a default
      return JSON.parse(savedAlarms).map((alarm: Omit<Alarm, 'sound'> & { sound?: string }) => ({
        ...alarm,
        sound: alarm.sound || ALARM_SOUNDS[0].url,
      }));
    }
    return [];
  });
  const [newHour, setNewHour] = useState('07');
  const [newMinute, setNewMinute] = useState('30');
  const [newAmPm, setNewAmPm] = useState('AM');
  const [newLabel, setNewLabel] = useState('Wake Up');
  const [newSound, setNewSound] = useState(ALARM_SOUNDS[0].url);
  const [ringingAlarm, setRingingAlarm] = useState<Alarm | null>(null);
  
  const now = useTime();
  const audio = useMemo(() => new Audio(), []);
  const lastDismissedRef = useRef<{ id: number | null, time: string | null }>({ id: null, time: null });

  useEffect(() => {
    localStorage.setItem('alarms', JSON.stringify(alarms));
  }, [alarms]);

  const stopRinging = useCallback(() => {
    audio.pause();
    audio.currentTime = 0;
    
    if (ringingAlarm) {
        lastDismissedRef.current = { id: ringingAlarm.id, time: ringingAlarm.time };
    }
    setRingingAlarm(null);
  }, [ringingAlarm, audio]);

  useEffect(() => {
    const currentTime = now.toTimeString().slice(0, 5);
    const alarmToRing = alarms.find(a => a.enabled && a.time === currentTime);
    
    if (alarmToRing && !ringingAlarm) {
      // FIX: Prevent alarm from re-ringing if it was just dismissed in the same minute.
      if (lastDismissedRef.current.id === alarmToRing.id && lastDismissedRef.current.time === currentTime) {
          return;
      }

      setRingingAlarm(alarmToRing);
      audio.src = alarmToRing.sound;
      audio.loop = true;
      audio.play().catch(e => console.error("Audio playback failed:", e));
    }
  }, [now, alarms, ringingAlarm, audio]);

  const adjustHour = (amount: number) => {
    setNewHour(current => {
        let currentValue = parseInt(current, 10);
        let newValue = currentValue + amount;
        if (newValue > 12) newValue = 1;
        if (newValue < 1) newValue = 12;
        return String(newValue).padStart(2, '0');
    });
  };

  const adjustMinute = (amount: number) => {
    setNewMinute(current => {
      const currentValue = parseInt(current, 10);
      const newValue = (currentValue + amount + 60) % 60;
      return String(newValue).padStart(2, '0');
    });
  };

  const handleTimeInputChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    value: string
  ) => {
    const sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, 2);
    setter(sanitizedValue);
  };

  const handleTimeInputBlur = (
    field: 'hour' | 'minute',
    value: string,
  ) => {
    let num = parseInt(value, 10);
    
    if (isNaN(num)) {
        // If input is empty or invalid, reset to a default
        if (field === 'hour') setNewHour('07');
        else setNewMinute('30');
        return;
    }

    if (field === 'hour') {
        if (num < 1) num = 12;
        if (num > 12) num = 12;
        setNewHour(String(num).padStart(2, '0'));
    } else { // minute
        if (num < 0) num = 0;
        if (num > 59) num = 59;
        setNewMinute(String(num).padStart(2, '0'));
    }
  };

  const addAlarm = useCallback(() => {
    if (!newHour || !newMinute) return;
    
    let hour = parseInt(newHour, 10);
    if (newAmPm === 'PM' && hour < 12) {
      hour += 12;
    }
    if (newAmPm === 'AM' && hour === 12) { // Midnight case: 12 AM is 00 hours
      hour = 0;
    }

    const time = `${String(hour).padStart(2, '0')}:${newMinute.padStart(2, '0')}`;
    const newAlarm: Alarm = {
      id: Date.now(),
      time: time,
      label: newLabel || 'Alarm',
      enabled: true,
      sound: newSound,
    };
    setAlarms(prev => [newAlarm, ...prev].sort((a,b) => a.time.localeCompare(b.time)));
    setNewLabel('Wake Up');
  }, [newHour, newMinute, newLabel, newSound, newAmPm]);

  const toggleAlarm = useCallback((id: number) => {
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  }, []);

  const deleteAlarm = useCallback((id: number) => {
    setAlarms(prev => prev.filter(a => a.id !== id));
  }, []);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col p-4 h-full animate-fadeIn">
      <h2 className="text-3xl font-bold text-center text-[var(--accent)] mb-6">Alarms</h2>
      
      <div className="neumorphic-flat p-4 mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex-grow p-2 neumorphic-inset rounded-lg flex items-center justify-center gap-1">
                <div className="flex flex-col items-center">
                    <TimeAdjustButton onClick={() => adjustHour(1)} aria-label="Increase hour"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></TimeAdjustButton>
                    <input type="text" value={newHour} onChange={e => handleTimeInputChange(setNewHour, e.target.value)} onBlur={e => handleTimeInputBlur('hour', e.target.value)} className="text-5xl font-mono bg-transparent w-20 text-center focus:outline-none p-1"/>
                    <TimeAdjustButton onClick={() => adjustHour(-1)} aria-label="Decrease hour"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></TimeAdjustButton>
                </div>
                <span className="text-5xl font-mono text-[var(--text-secondary)] pb-2">:</span>
                <div className="flex flex-col items-center">
                    <TimeAdjustButton onClick={() => adjustMinute(1)} aria-label="Increase minute"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></TimeAdjustButton>
                    <input type="text" value={newMinute} onChange={e => handleTimeInputChange(setNewMinute, e.target.value)} onBlur={e => handleTimeInputBlur('minute', e.target.value)} className="text-5xl font-mono bg-transparent w-20 text-center focus:outline-none p-1"/>
                    <TimeAdjustButton onClick={() => adjustMinute(-1)} aria-label="Decrease minute"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></TimeAdjustButton>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <button onClick={() => setNewAmPm('AM')} className={`btn !py-2 !px-4 !rounded-md ${newAmPm === 'AM' ? '!shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] !text-[var(--accent)]' : ''}`}>AM</button>
                <button onClick={() => setNewAmPm('PM')} className={`btn !py-2 !px-4 !rounded-md ${newAmPm === 'PM' ? '!shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] !text-[var(--accent)]' : ''}`}>PM</button>
            </div>
        </div>
        <input 
            type="text"
            placeholder="Label"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="form-input mb-4"
        />
        <select
          value={newSound}
          onChange={(e) => setNewSound(e.target.value)}
          className="form-input form-select mb-4"
        >
          {ALARM_SOUNDS.map(sound => (
            <option key={sound.name} value={sound.url}>{sound.name}</option>
          ))}
        </select>
        <button onClick={addAlarm} className="w-full btn btn-primary">
          Add Alarm
        </button>
      </div>

      <div className="flex-grow overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {alarms.length === 0 && <p className="text-center text-[var(--text-secondary)] pt-10">No alarms set.</p>}
        {alarms.map(alarm => {
          const formattedTime = formatAlarmTime(alarm.time);
          return (
            <div key={alarm.id} className={`neumorphic-flat flex items-center justify-between p-4 transition-opacity ${alarm.enabled ? 'opacity-100' : 'opacity-50'}`}>
              <div>
                <div className="flex items-baseline gap-2">
                    <p className={`text-3xl font-mono ${alarm.enabled ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] line-through'}`}>{formattedTime.time}</p>
                    <p className={`text-lg font-sans font-semibold ${alarm.enabled ? 'text-[var(--text-secondary)]' : 'text-[var(--text-secondary)] line-through'}`}>{formattedTime.ampm}</p>
                </div>
                <p className={`text-sm ${alarm.enabled ? 'text-[var(--text-secondary)]' : 'text-[var(--text-secondary)] line-through'}`}>{alarm.label}</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <button onClick={() => deleteAlarm(alarm.id)} className="btn-icon !text-red-500/70 hover:!text-red-500" aria-label={`Delete alarm for ${alarm.time}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={alarm.enabled} onChange={() => toggleAlarm(alarm.id)} className="sr-only peer" />
                  <div className="toggle-switch"></div>
                </label>
              </div>
            </div>
          )
        })}
      </div>
      
      {ringingAlarm && (
        <div className="fixed inset-0 bg-[var(--background)]/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="neumorphic-flat text-center p-8 m-4">
            <h3 className="text-4xl font-bold mb-2 animate-pulse text-[var(--accent)]">ALARM</h3>
            <div className="flex items-baseline justify-center gap-2 mb-2">
                <p className="text-5xl font-mono">{formatAlarmTime(ringingAlarm.time).time}</p>
                <p className="text-2xl font-sans font-semibold text-[var(--text-secondary)]">{formatAlarmTime(ringingAlarm.time).ampm}</p>
            </div>
            <p className="text-lg text-[var(--text-secondary)] mb-8">{ringingAlarm.label}</p>
            <button onClick={stopRinging} className="btn !bg-red-600 text-white text-xl px-8 py-3">
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};