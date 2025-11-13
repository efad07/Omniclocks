import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ALARM_SOUNDS } from '../constants.tsx';

const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const parseInputToSeconds = (input: string): number => {
    const cleanInput = input.replace(/[^0-9]/g, '');
    if (cleanInput.length === 0) return 0;
    if (cleanInput.length <= 2) { // SS
        return parseInt(cleanInput, 10);
    } else if (cleanInput.length <= 4) { // MMSS
        const mm = parseInt(cleanInput.slice(0, -2), 10);
        const ss = parseInt(cleanInput.slice(-2), 10);
        return mm * 60 + ss;
    } else { // HHMMSS
        const hh = parseInt(cleanInput.slice(0, -4), 10);
        const mm = parseInt(cleanInput.slice(-4, -2), 10);
        const ss = parseInt(cleanInput.slice(-2), 10);
        return hh * 3600 + mm * 60 + ss;
    }
};

const KeypadButton: React.FC<{onPress: () => void, children: React.ReactNode, className?: string}> = ({onPress, children, className=""}) => (
    <button onClick={onPress} className={`btn !w-16 !h-16 !rounded-full !text-2xl ${className}`}>
        {children}
    </button>
);

const PRESETS = [
    { label: '1 min', value: '100' },
    { label: '5 min', value: '500' },
    { label: '10 min', value: '1000' },
    { label: '30 min', value: '3000' },
];

export const Timer: React.FC = () => {
    const [inputString, setInputString] = useState('500'); // Default 5 minutes
    const [timeLeft, setTimeLeft] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    
    const [timerSound, setTimerSound] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('timerSound') || ALARM_SOUNDS[0].url;
        }
        return ALARM_SOUNDS[0].url;
    });

    const initialTime = useMemo(() => parseInputToSeconds(inputString), [inputString]);
    const timerRef = useRef<number | null>(null);
    const audio = useMemo(() => {
        const el = new Audio();
        el.loop = true;
        return el;
    }, []);

    useEffect(() => {
        localStorage.setItem('timerSound', timerSound);
    }, [timerSound]);

    const stopAlarm = useCallback(() => {
        audio.pause();
        audio.currentTime = 0;
        setIsFinished(false);
        setInputString('0');
    }, [audio]);
    
    useEffect(() => {
        if (isFinished) {
            audio.src = timerSound;
            audio.play().catch(e => console.error("Audio playback failed:", e));
            return;
        }

        if (isActive && timeLeft > 0) {
            const endTime = Date.now() + timeLeft * 1000;
            timerRef.current = window.setInterval(() => {
                const newTimeLeft = Math.round((endTime - Date.now()) / 1000);
                if (newTimeLeft >= 0) {
                    setTimeLeft(newTimeLeft);
                } else {
                    setTimeLeft(0);
                    setIsActive(false);
                    setIsFinished(true);
                }
            }, 200);
        } else if (!isActive && timerRef.current) {
            clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, timeLeft, isFinished, audio, timerSound]);

    const handleKeypadPress = (key: string) => {
        if (isFinished) stopAlarm();
        if (key === 'del') {
            setInputString(prev => prev.slice(0, -1) || '0');
        } else if (inputString.length < 6) {
            setInputString(prev => (prev === '0' ? key : prev + key));
        }
    };
    
    const handlePreset = (value: string) => {
        if (isFinished) stopAlarm();
        setInputString(value);
    };

    const handleStartPause = useCallback(() => {
        if (isFinished) {
            stopAlarm();
            return;
        }
        if (isActive) {
            setIsActive(false);
        } else {
            if (timeLeft === 0) {
                if(initialTime <= 0) return;
                setTimeLeft(initialTime);
                setStartTime(initialTime);
            }
            setIsActive(true);
        }
    }, [isActive, isFinished, timeLeft, initialTime, stopAlarm]);
    
    const handleReset = useCallback(() => {
        stopAlarm();
        setIsActive(false);
        setTimeLeft(0);
        setStartTime(0);
        setInputString('0');
    }, [stopAlarm]);

    const displayTime = formatTime(isActive || (timeLeft > 0 && !isFinished) ? timeLeft : initialTime);
    const progress = startTime > 0 ? (timeLeft / startTime) * 100 : 0;
    
    const isSetupMode = !isActive && !isFinished;

    return (
        <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-between p-4 h-full animate-fadeIn">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
                 <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                    <circle className="stroke-current text-[var(--shadow-dark)]" strokeWidth="8" fill="transparent" r="45" cx="50" cy="50"/>
                    <circle className={`stroke-current transition-colors duration-500 ${isFinished ? 'text-red-500 animate-pulse' : 'text-[var(--accent)]'}`}
                        strokeWidth="8"
                        strokeDasharray="282.6"
                        strokeDashoffset={282.6 - (progress / 100) * 282.6}
                        strokeLinecap="round" fill="transparent" r="45" cx="50" cy="50"
                        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.3s linear, stroke 0.5s', filter: `drop-shadow(0 0 5px ${isFinished ? 'rgba(239, 68, 68, 0.7)' : 'var(--accent-glow)'})` }}
                    />
                </svg>
                <div className={`z-10 font-mono text-4xl sm:text-5xl tracking-wider ${isFinished ? 'text-red-500 animate-pulse' : 'text-[var(--text-primary)]'}`}>
                    {isFinished ? '00:00:00' : displayTime}
                </div>
            </div>
            
            <div className="w-full flex-grow flex flex-col justify-end min-h-[22rem]">
                {isSetupMode ? (
                    <div className="flex flex-col items-center gap-4 animate-fadeIn">
                        <div className="flex gap-2">
                           {PRESETS.map(p => <button key={p.value} onClick={() => handlePreset(p.value)} className="btn !px-3 !py-2 text-sm">{p.label}</button>)}
                        </div>
                        <div className="grid grid-cols-3 gap-3 my-2">
                           {'123456789'.split('').map(k => <KeypadButton key={k} onPress={() => handleKeypadPress(k)}>{k}</KeypadButton>)}
                           <div/>
                           <KeypadButton onPress={() => handleKeypadPress('0')}>0</KeypadButton>
                           <KeypadButton onPress={() => handleKeypadPress('del')}>
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9.75L10.95 8.707a.75.75 0 00-1.06 1.06L10.94 10.828a.75.75 0 000 1.06l-1.05 1.05a.75.75 0 101.06 1.06L12 11.81l1.05 1.05a.75.75 0 101.06-1.06L13.06 11.889a.75.75 0 000-1.06l1.05-1.05a.75.75 0 00-1.06-1.06L12 9.75zM3.75 6.75A2.25 2.25 0 001.5 9v6a2.25 2.25 0 002.25 2.25h11.25a2.25 2.25 0 002.25-2.25v-6a2.25 2.25 0 00-2.25-2.25H3.75z" /></svg>
                           </KeypadButton>
                        </div>
                         <select value={timerSound} onChange={(e) => setTimerSound(e.target.value)} className="form-input form-select w-full mt-2">
                            {ALARM_SOUNDS.map(sound => <option key={sound.name} value={sound.url}>{sound.name}</option>)}
                        </select>
                    </div>
                ) : null }
            </div>

            <div className="flex w-full justify-around pt-4 mt-auto">
                <button onClick={handleReset} className="btn btn-control" disabled={!isActive && !isFinished && !startTime}>
                    Reset
                </button>
                <button onClick={handleStartPause} className={`btn btn-control ${isFinished ? '!bg-red-600 !text-white' : isActive ? 'btn-danger' : 'btn-success'}`}
                    disabled={!isActive && !isFinished && initialTime === 0}
                >
                    {isFinished ? 'Stop' : isActive ? 'Pause' : 'Start'}
                </button>
            </div>
        </div>
    );
};