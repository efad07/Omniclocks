import React from 'react';
import type { NavItem, WorldClockCity } from './types';

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const StopwatchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a5.25 5.25 0 015.25 5.25H12V6.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a5.25 5.25 0 015.25 5.25H12V6.75z" transform="rotate(90 12 12)" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a5.25 5.25 0 015.25 5.25H12V6.75z" transform="rotate(180 12 12)" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a5.25 5.25 0 015.25 5.25H12V6.75z" transform="rotate(270 12 12)" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l1.5 1.5 3-3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5V3" />
  </svg>
);

const AlarmIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l.405-.405a2.25 2.25 0 013.182 0l.405.405a3.75 3.75 0 005.304 0" />
  </svg>
);

const TimerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4-2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128m0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.998 15.998 0 011.622-3.385m5.043.025a15.998 15.998 0 00-1.622-3.385m3.388 1.62a15.998 15.998 0 01-3.388-1.62m-1.622-3.385a15.998 15.998 0 013.388-1.622m0 0a4.5 4.5 0 10-6.364 6.364l-1.127 1.127a3 3 0 00-1.128 5.78m1.128-5.78l1.127 1.127a3 3 0 01-1.128 5.78" />
  </svg>
);

const WorldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c1.355 0 2.707-.157 4.018-.452M12 21c-1.355 0-2.707-.157-4.018-.452M3.284 14.252a8.964 8.964 0 010-4.504M20.716 14.252a8.964 8.964 0 000-4.504M12 3a9.004 9.004 0 00-8.716 6.747M12 3a9.004 9.004 0 018.716 6.747M12 3c1.355 0 2.707-.157 4.018-.452M12 3c-1.355 0-2.707-.157-4.018-.452M12 15a3 3 0 100-6 3 3 0 000 6z" />
  </svg>
);

export const NAV_ITEMS: NavItem[] = [
  { id: 'DigitalClock', label: 'Clock', icon: <ClockIcon /> },
  { id: 'Stopwatch', label: 'Stopwatch', icon: <StopwatchIcon /> },
  { id: 'AlarmClock', label: 'Alarm', icon: <AlarmIcon /> },
  { id: 'Timer', label: 'Timer', icon: <TimerIcon /> },
  { id: 'WorldClock', label: 'World', icon: <WorldIcon /> },
];

export const INITIAL_WORLD_CITIES: WorldClockCity[] = [
  { id: 'local', name: 'Local Time', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  { id: 'tokyo', name: 'Tokyo', timezone: 'Asia/Tokyo' },
  { id: 'london', name: 'London', timezone: 'Europe/London' },
  { id: 'ny', name: 'New York', timezone: 'America/New_York' },
];

export const ALARM_SOUNDS = [
    { name: 'Sunrise', url: 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEARKwAAESsAAACABAAZGF0YVi0AAAAAQABAAYABwAJAAsADgAQABIAFAAWABgAGgAcAB4AIAAiACQAJgAoACoALAAsAC4AMAAyADQANgA4ADoAPAA+AEAAQgBEAEgASgBNAE4AUQBSAFUAVwBZAFwAXgBgAGIAZABnAGkAbABuAHAAcwB1AHcAegB8AH8AgQCCAIQAhwCJAIwAjgCRAJMAlQCWgJgAmgCcAJ8AogCjAKUApwCpAKsArACuALIAtAC2ALgAugC8AL4AwADCAMQAxADFAMgAywDNANAA0gDUANYA2ADZANwA3gDfAOIA5ADlAOcA6ADpAOwA7gDvAPIA9QD3APgA+gD8AP8BAwEGAQkBCwEIAQcBBQECAQABCgENAQ8BEQETARQBFQEUAREADwENAQoBBwEEAQIBAA==' },
    { name: 'Uplift', url: 'data:audio/wav;base64,UklGRlIAAABXQVZFZm10IBAAAAABAAEARKwAAESsAAACABAAZGF0YUyQAAAAAgADAAUABwAJABEAGQAhACgALgA4AEMATQBkAHYAgwCTAKgAtgDRAMMA9gElAT0BlAG4AdgBBgGGAeYCAgS2Bq4IEgr2DqYRAhQIGPoehCUOK/wz5Dm8QIhFvEisTTxQaFC4XNBh4Ggcb/h0oH+gg4iH4Iu4jHiR4JMAmBifUKKspYynUKvgr8iwyLQgt9C6kLzowFDA+MTAxWzJvM4Qz/DTBNR02YDZ4Nx44fDkSOis6qDs0PAc9FT16PjM/ZUA0QZJDU0UxR1VJnUwyTzNQ+1HCVLFWWVeEWb5dlF69X7xg6mI/Y6JkBmWmZzNojmm8bG5ur3E+cq901XYLePh9CX7tfw6BG4MvhH+JZItDjF+Pp5HolvSc/qHEpYOoCqfsqiSrhKz+r/SxwLTMty26LL6CwszFvsnMy/7QedUo2a/eHOA35cznN+2B8s73Kvwz/esA4wVfCPsNNxTJGv4fNSYjLLstBDJ2PmJCb0dWS4ZPY1AzWWFivmRyaYVvMnYAfh6EM4h4jmqS/JqInxih0KXkqeSt+7O8vf7ExMv20lrZx95f4gblP+wz8Pf2vvyw/soAKwUrC0wQTxdaH2sl8TPmO8JDp0v+UW1WW2VnaEhtR3Q0fgaC5If2lUOcBKQwpnqt5LDts/S9ysL0yfbT8NnS3kffg+PT5gPpiuy57zHzy/aE/Mv/4wJ3BzcRExkWHiYjLC82OkpAZkpJTlNXXWR5a3R5d2h9eoCDg4qKk5SVl5qcnaGoq66wsrS3ury+v8HDxMbHyMnLzM7P0NHS09TV1tjc3d7f4OHj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==' },
    { name: 'Digital Pulse', url: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAESsAAACABAAZGF0YQAAAAA/wD/AP8A/wA=' },
    { name: 'Zen Bells', url: 'data:audio/wav;base64,UklGRqgAAABXQVZFZm10IBAAAAABAAEARKwAAESsAAACABAAZGF0YZQAAAD4APT/8v/s/+b/4//d/9n/0//O/8r/xv/C/73/u/+0/6//pP+f/5j/iv+C/3r/cv9t/2T/Wv9Q/0n/Q/88/zH/Kv8j/x7/Fv8T/w3/Bv8C/+7/6v/n/+H/3f/Z/9T/0P/N/8n/xf/B/73/uf+z/6//pf+g/5b/jP+F/37/d/9t/2X/Xf9U/0z/R/8+/zL/KwAjACYAIQAcABcAEwAQAA0ACAADAP8A/AD7AO0A5gDhALYAsQBvAGgAYQBXAE8ASgBEAD0ANgAqACQAHAAVABAAAwD/APwA+ADtAOUA4gDbALYAsgBwAGoAYgBYAFMAUgBHAEQAOgAvACgAIgAaABUAEAAOAAkABgADAP8A/AD6APQA8gDpAOMA2wBrAF8AUgBLAEIAOQAsACQAHgAZABIAEQANAAcAAgD/APgA6gDdAGsAWQBOAEUAPAAyACgAIgAbABcAEhEQDgAKAAgABgACAP8A+QDwAOYA0ABwAFkATgBFAD8ANgAyACsAJgAhABwAFwATABEADgAJAAcAAwD/APkA8QDmANAAcABZAE4ARQA/ADYAMgArACYAIQAcABcAEwARAA4ACQAHAA==' },
];