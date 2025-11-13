import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Lap } from '../types.ts';

const formatTimeParts = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = time % 1000;
    return {
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0'),
        hundredths: Math.floor(milliseconds / 10).toString().padStart(2, '0'),
    };
};

const formatLapTime = (time: number) => {
  const minutes = Math.floor(time / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  const milliseconds = Math.floor((time % 1000) / 10);
  return (
    <>
      {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      <span className="text-lg text-[var(--text-secondary)]">.{milliseconds.toString().padStart(2, '0')}</span>
    </>
  );
};

export const Stopwatch: React.FC = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const timerRef = useRef<number | null>(null);
  const lastLapTimeRef = useRef(0);

  useEffect(() => {
    if (isRunning) {
      const startTime = Date.now() - time;
      timerRef.current = window.setInterval(() => {
        setTime(Date.now() - startTime);
      }, 10);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleStartStop = useCallback(() => {
    setIsRunning(!isRunning);
  }, [isRunning]);

  const handleLapReset = useCallback(() => {
    if (isRunning) {
      const newLap = {
        lap: laps.length + 1,
        time: time - lastLapTimeRef.current,
      };
      setLaps([newLap, ...laps]);
      lastLapTimeRef.current = time;
    } else {
      setTime(0);
      setLaps([]);
      setIsRunning(false);
      lastLapTimeRef.current = 0;
    }
  }, [isRunning, time, laps]);
  
  const timeParts = useMemo(() => formatTimeParts(time), [time]);
  // Hand rotations
  const millisecondHandRotation = useMemo(() => (time % 1000) / 1000 * 360, [time]);
  const secondHandRotation = useMemo(() => ((time % 60000) / 60000) * 360, [time]);
  const minuteHandRotation = useMemo(() => ((time % 3600000) / 3600000) * 360, [time]);


  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center p-4 h-full animate-fadeIn">
      <div className="relative w-80 h-80 sm:w-96 sm:h-96">
        {/* Lap/Reset Button (Pusher) */}
        <button
            onClick={handleLapReset}
            className="absolute top-1/2 -left-4 -translate-y-1/2 z-20 btn !py-3 !px-5 !rounded-lg"
            disabled={!isRunning && time === 0}
            aria-label={isRunning ? 'Record lap' : 'Reset stopwatch'}
        >
            {isRunning ? 'Lap' : 'Reset'}
        </button>

        {/* Start/Stop Button (Crown) */}
        <button
          onClick={handleStartStop}
          className={`absolute left-1/2 -top-5 -translate-x-1/2 z-20 btn !py-4 !px-6 !rounded-xl text-lg ${
            isRunning ? '!text-[#ef4444]' : '!text-[#22c55e]'
          }`}
          aria-label={isRunning ? 'Stop stopwatch' : 'Start stopwatch'}
        >
          {isRunning ? 'Stop' : 'Start'}
        </button>

        {/* Watch Face */}
        <div className="w-full h-full rounded-full neumorphic-flat flex items-center justify-center relative shadow-xl">
           {/* Tick Marks & Numbers */}
            <div className="absolute w-full h-full">
                {[...Array(60)].map((_, i) => {
                    const rotation = i * 6;
                    const isMajorTick = i % 5 === 0;
                    return (
                        <div key={i} style={{ transform: `rotate(${rotation}deg)`, position: 'absolute', width: '100%', height: '100%'}}>
                            <div style={{
                                position: 'absolute',
                                top: '2%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: isMajorTick ? '2px' : '1px',
                                height: isMajorTick ? '4%' : '2%',
                                background: isMajorTick ? 'var(--text-secondary)' : 'var(--shadow-dark)',
                                borderRadius: '1px',
                            }} />
                            {isMajorTick && (
                                <div style={{
                                    position: 'absolute',
                                    top: '8%',
                                    left: '50%',
                                    transform: `translateX(-50%) rotate(${-rotation}deg)`,
                                    color: 'var(--text-secondary)',
                                    fontSize: '1rem',
                                    fontWeight: '600'
                                }}>
                                    {i === 0 ? 60 : i}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
          
          <div className="w-[90%] h-[90%] rounded-full neumorphic-inset flex items-center justify-center">
             <div className="font-mono text-center">
                <span className="text-5xl sm:text-6xl text-[var(--text-primary)] tracking-tight">
                    {timeParts.minutes}:{timeParts.seconds}
                </span>
                <span className="text-3xl sm:text-4xl text-[var(--accent)] align-baseline">
                    .{timeParts.hundredths}
                </span>
             </div>
          </div>
          
          {/* Minute Hand */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-1.5 h-[25%] bg-[var(--text-primary)] rounded-full" style={{ transformOrigin: 'top', transform: `rotate(${minuteHandRotation}deg)` }} />
           
          {/* Second Hand */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-1 h-[35%] bg-[var(--text-primary)]" style={{ transformOrigin: 'top', transform: `rotate(${secondHandRotation}deg)` }} />
           
          {/* Sweeping Millisecond Hand */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-0.5 h-[40%] bg-[var(--accent)]" style={{ transformOrigin: 'top', transform: `rotate(${millisecondHandRotation}deg)`, filter: 'drop-shadow(0 0 3px var(--accent-glow))' }} />
          
          {/* Hand pivot */}
          <div className="absolute top-1/2 left-1/2 w-4 h-4 -mt-2 -ml-2 rounded-full bg-[var(--accent)] border-2 border-[var(--surface)] z-10"></div>
        </div>
      </div>
      
      <div className="w-full flex-grow flex flex-col neumorphic-inset p-2 max-h-[25vh] mt-8">
        <div className="flex justify-between px-3 py-2 border-b border-[var(--shadow-dark)] text-sm text-[var(--text-secondary)] font-bold">
          <span>Lap</span>
          <span>Lap Time</span>
        </div>
        <ul className="flex-grow overflow-y-auto custom-scrollbar p-1">
          {laps.map((lap) => (
            <li key={lap.lap} className="flex justify-between p-3 font-mono text-lg rounded-lg hover:bg-[var(--shadow-light)]">
              <span className="text-[var(--text-secondary)]">Lap {lap.lap}</span>
              <span className="text-[var(--text-primary)]">{formatLapTime(lap.time)}</span>
            </li>
          ))}
          {laps.length === 0 && <li className="text-center text-[var(--text-secondary)] p-8">Press 'Start' to begin.</li>}
        </ul>
      </div>
    </div>
  );
};