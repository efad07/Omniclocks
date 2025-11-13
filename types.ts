import type { ReactElement } from 'react';

export type NavItemType = 'DigitalClock' | 'Stopwatch' | 'AlarmClock' | 'Timer' | 'WorldClock';

export interface NavItem {
  id: NavItemType;
  label: string;
  // FIX: Use ReactElement from 'react' to correctly type the icon property, resolving the 'Cannot find namespace JSX' error.
  icon: ReactElement;
}

export interface Alarm {
  id: number;
  time: string; // "HH:mm"
  label: string;
  enabled: boolean;
  sound: string; // URL of the alarm sound
}

export interface Lap {
  lap: number;
  time: number;
}

export interface WorldClockCity {
  id:string;
  name: string;
  timezone: string;
  customName?: string;
}