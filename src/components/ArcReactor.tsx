import { Volume2, VolumeX } from 'lucide-react';
import { ThemeColor } from '../types';
import { THEMES } from '../utils/themeStyles';

interface ArcReactorProps {
  isSpeaking: boolean;
  isStreaming: boolean;
  autoVoice: boolean;
  onToggleAutoVoice: () => void;
  onTestVoice: () => void;
  theme?: ThemeColor;
}

export function ArcReactor({
  isSpeaking,
  isStreaming,
  autoVoice,
  onToggleAutoVoice,
  onTestVoice,
  theme = 'green',
}: ArcReactorProps) {
  const currentTheme = THEMES[theme] || THEMES.green;

  return (
    <div className={`flex items-center gap-3 bg-black/90 border ${currentTheme.borderActive}/40 rounded-xl p-2 px-3 shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md`}>
      {/* Interactive Cyber Arc Reactor Core */}
      <button
        onClick={onTestVoice}
        className="relative group cursor-pointer"
        title="J.A.R.V.I.S. Core (Click to test vocal synthesis)"
      >
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center relative transition-all duration-300 ${
            isSpeaking
              ? `${currentTheme.reactorShadow} scale-105`
              : isStreaming
              ? `${currentTheme.reactorShadow} animate-pulse`
              : 'shadow-[0_0_10px_rgba(0,0,0,0.4)] group-hover:scale-105'
          }`}
        >
          {/* Outer rotating reticle */}
          <div
            className={`absolute inset-0 rounded-full border ${currentTheme.reactorRing} ${
              isStreaming ? 'animate-spin' : isSpeaking ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: isSpeaking ? '2s' : isStreaming ? '4s' : '10s' }}
          >
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 ${currentTheme.reactorCore} rounded-full`} />
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 ${currentTheme.reactorCore} rounded-full`} />
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 ${currentTheme.reactorCore} rounded-full`} />
            <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 ${currentTheme.reactorCore} rounded-full`} />
          </div>

          {/* Inner ring */}
          <div className={`absolute inset-1.5 rounded-full border ${currentTheme.borderActive}/40 border-dashed`} />

          {/* Center glowing core */}
          <div
            className={`w-3.5 h-3.5 rounded-full ${currentTheme.reactorCore} flex items-center justify-center transition-all ${
              isSpeaking
                ? 'scale-110 shadow-[0_0_15px_currentColor]'
                : isStreaming
                ? 'shadow-[0_0_10px_currentColor]'
                : 'shadow-[0_0_6px_currentColor]'
            }`}
          >
            <div className="w-1 h-1 rounded-full bg-black" />
          </div>
        </div>
      </button>

      {/* Status & Audio waveform */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono font-bold tracking-widest ${currentTheme.primaryText} uppercase`}>
            J.A.R.V.I.S.
          </span>
          <span className="text-[9px] text-zinc-500 font-mono">
            {isSpeaking ? 'VOCALIZING' : isStreaming ? 'PROCESSING' : 'ONLINE'}
          </span>
        </div>

        {/* Audio waveform bars */}
        <div className="flex items-center gap-1 h-3 mt-0.5">
          {[1, 2, 3, 4, 5, 6].map((i) => {
            const height = isSpeaking
              ? `${Math.max(4, Math.sin(Date.now() / 150 + i) * 10 + 6)}px`
              : isStreaming
              ? `${(i % 3) * 3 + 3}px`
              : '2px';
            return (
              <span
                key={i}
                className={`w-0.5 rounded-full transition-all duration-150 ${
                  isSpeaking
                    ? `${currentTheme.waveformBar} shadow-[0_0_4px_currentColor]`
                    : isStreaming
                    ? `${currentTheme.waveformBar} opacity-80 animate-pulse`
                    : 'bg-zinc-800'
                }`}
                style={{ height }}
              />
            );
          })}
        </div>
      </div>

      {/* Auto-Voice Toggle Button */}
      <button
        onClick={onToggleAutoVoice}
        className={`ml-1.5 p-1 px-2 rounded border text-xs flex items-center gap-1.5 transition-all ${
          autoVoice
            ? `bg-zinc-900 border ${currentTheme.borderActive}/60 ${currentTheme.primaryText} shadow-xs`
            : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
        }`}
        title={autoVoice ? 'Voice Active (Click to mute)' : 'Voice Muted (Click to activate)'}
      >
        {autoVoice ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline text-[10px] font-mono uppercase tracking-wider">
          {autoVoice ? 'VOICE ON' : 'MUTED'}
        </span>
      </button>
    </div>
  );
}
