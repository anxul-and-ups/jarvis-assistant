import { ThemeColor } from '../types';

export interface ThemeDefinition {
  id: ThemeColor;
  name: string;
  label: string;
  dotColor: string;
  primaryText: string;
  accentText: string;
  borderMuted: string;
  borderActive: string;
  bgGlow: string;
  userBubble: string;
  buttonBg: string;
  buttonText: string;
  reactorRing: string;
  reactorCore: string;
  reactorShadow: string;
  waveformBar: string;
  cursorColor: string;
}

export const THEMES: Record<ThemeColor, ThemeDefinition> = {
  green: {
    id: 'green',
    name: 'Hacker Matrix',
    label: 'Cyber Green',
    dotColor: 'bg-emerald-400',
    primaryText: 'text-emerald-400',
    accentText: 'text-emerald-300',
    borderMuted: 'border-emerald-950',
    borderActive: 'border-emerald-500',
    bgGlow: 'from-emerald-950/20 via-black to-black',
    userBubble: 'bg-emerald-950/90 text-emerald-100 border-emerald-500/60 shadow-[0_0_15px_rgba(34,197,94,0.15)]',
    buttonBg: 'bg-emerald-500 hover:bg-emerald-400',
    buttonText: 'text-black',
    reactorRing: 'border-emerald-400/70',
    reactorCore: 'bg-emerald-400',
    reactorShadow: 'shadow-[0_0_20px_rgba(34,197,94,0.5)]',
    waveformBar: 'bg-emerald-400',
    cursorColor: 'bg-emerald-400',
  },
  blue: {
    id: 'blue',
    name: 'Stark Arc Blue',
    label: 'Holo Cyan',
    dotColor: 'bg-cyan-400',
    primaryText: 'text-cyan-400',
    accentText: 'text-cyan-300',
    borderMuted: 'border-cyan-950',
    borderActive: 'border-cyan-500',
    bgGlow: 'from-cyan-950/20 via-black to-black',
    userBubble: 'bg-cyan-950/90 text-cyan-100 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)]',
    buttonBg: 'bg-cyan-500 hover:bg-cyan-400',
    buttonText: 'text-black',
    reactorRing: 'border-cyan-400/70',
    reactorCore: 'bg-cyan-400',
    reactorShadow: 'shadow-[0_0_20px_rgba(6,182,212,0.5)]',
    waveformBar: 'bg-cyan-400',
    cursorColor: 'bg-cyan-400',
  },
  red: {
    id: 'red',
    name: 'Mark Armor Red',
    label: 'Crimson Fury',
    dotColor: 'bg-red-500',
    primaryText: 'text-red-400',
    accentText: 'text-red-300',
    borderMuted: 'border-red-950',
    borderActive: 'border-red-500',
    bgGlow: 'from-red-950/20 via-black to-black',
    userBubble: 'bg-red-950/90 text-red-100 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.15)]',
    buttonBg: 'bg-red-500 hover:bg-red-400',
    buttonText: 'text-white',
    reactorRing: 'border-red-500/70',
    reactorCore: 'bg-red-500',
    reactorShadow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]',
    waveformBar: 'bg-red-500',
    cursorColor: 'bg-red-500',
  },
  yellow: {
    id: 'yellow',
    name: 'Tactical Gold',
    label: 'Stark Amber',
    dotColor: 'bg-amber-400',
    primaryText: 'text-amber-400',
    accentText: 'text-amber-300',
    borderMuted: 'border-amber-950',
    borderActive: 'border-amber-500',
    bgGlow: 'from-amber-950/20 via-black to-black',
    userBubble: 'bg-amber-950/90 text-amber-100 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    buttonBg: 'bg-amber-500 hover:bg-amber-400',
    buttonText: 'text-black',
    reactorRing: 'border-amber-400/70',
    reactorCore: 'bg-amber-400',
    reactorShadow: 'shadow-[0_0_20px_rgba(245,158,11,0.5)]',
    waveformBar: 'bg-amber-400',
    cursorColor: 'bg-amber-400',
  },
  purple: {
    id: 'purple',
    name: 'Stealth Matrix',
    label: 'Cyber Violet',
    dotColor: 'bg-purple-400',
    primaryText: 'text-purple-400',
    accentText: 'text-purple-300',
    borderMuted: 'border-purple-950',
    borderActive: 'border-purple-500',
    bgGlow: 'from-purple-950/20 via-black to-black',
    userBubble: 'bg-purple-950/90 text-purple-100 border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.15)]',
    buttonBg: 'bg-purple-500 hover:bg-purple-400',
    buttonText: 'text-white',
    reactorRing: 'border-purple-400/70',
    reactorCore: 'bg-purple-400',
    reactorShadow: 'shadow-[0_0_20px_rgba(168,85,247,0.5)]',
    waveformBar: 'bg-purple-400',
    cursorColor: 'bg-purple-400',
  },
};
