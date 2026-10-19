import { Settings, PanelLeft, Download, Terminal, Palette, Smartphone } from 'lucide-react';
import { BotPersona, ChatSession, ThemeColor } from '../types';
import { ArcReactor } from './ArcReactor';
import { THEMES } from '../utils/themeStyles';

interface HeaderProps {
  activePersona: BotPersona;
  allPersonas: BotPersona[];
  onSelectPersona: (personaId: string) => void;
  onOpenSettings: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  currentSession: ChatSession;
  onExportMarkdown: () => void;
  isSpeaking: boolean;
  isStreaming: boolean;
  autoVoice: boolean;
  onToggleAutoVoice: () => void;
  onTestVoice: () => void;
  theme: ThemeColor;
  onSelectTheme: (t: ThemeColor) => void;
  userName: string;
  onOpenAndroidInstall: () => void;
}

export function Header({
  activePersona,
  allPersonas,
  onSelectPersona,
  onOpenSettings,
  onToggleSidebar,
  currentSession,
  onExportMarkdown,
  isSpeaking,
  isStreaming,
  autoVoice,
  onToggleAutoVoice,
  onTestVoice,
  theme,
  onSelectTheme,
  userName,
  onOpenAndroidInstall,
}: HeaderProps) {
  const currentTheme = THEMES[theme] || THEMES.green;
  const themeOptions: ThemeColor[] = ['green', 'blue', 'red', 'yellow', 'purple'];

  return (
    <header className="h-16 border-b border-zinc-900 bg-black/90 flex items-center justify-between px-3 sm:px-6 gap-3 shrink-0 select-none backdrop-blur-md z-20">
      {/* Zone 1: Sidebar Toggle & Brand */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleSidebar}
          className={`p-1.5 rounded-lg ${currentTheme.primaryText} hover:bg-zinc-900 border border-transparent hover:${currentTheme.borderActive}/40 transition-colors`}
          title="Toggle sidebar"
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg bg-zinc-950 border ${currentTheme.borderActive}/50 flex items-center justify-center ${currentTheme.primaryText} shadow-xs font-mono font-bold text-sm`}>
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-mono">
              <span className={`font-bold text-sm sm:text-base ${currentTheme.accentText} tracking-wider`}>
                J.A.R.V.I.S.
              </span>
              <span className={`text-[10px] ${currentTheme.primaryText} border ${currentTheme.borderActive}/50 px-1 rounded uppercase tracking-wider hidden sm:inline`}>
                {userName.toUpperCase()}
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono hidden md:block">
              STARK INDUSTRIES // HUD ONLINE
            </p>
          </div>
        </div>
      </div>

      {/* Zone 2: Theme Quick Picker & Arc Reactor */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Theme Swatches */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-950/90 rounded-lg border border-zinc-800">
          <span className="hidden lg:inline text-[10px] font-mono text-zinc-500 pl-1">
            <Palette className="w-3 h-3 inline mr-1 text-zinc-400" />
            THEME:
          </span>
          {themeOptions.map((t) => {
            const def = THEMES[t];
            const isSelected = theme === t;
            return (
              <button
                key={t}
                onClick={() => onSelectTheme(t)}
                className={`w-5 h-5 rounded-full transition-all relative flex items-center justify-center ${def.dotColor} ${
                  isSelected ? 'ring-2 ring-white scale-110 shadow-[0_0_10px_currentColor]' : 'opacity-60 hover:opacity-100 hover:scale-105'
                }`}
                title={`Switch theme: ${def.name}`}
              >
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
              </button>
            );
          })}
        </div>

        {/* Arc Reactor Core */}
        <ArcReactor
          isSpeaking={isSpeaking}
          isStreaming={isStreaming}
          autoVoice={autoVoice}
          onToggleAutoVoice={onToggleAutoVoice}
          onTestVoice={onTestVoice}
          theme={theme}
        />
      </div>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-1.5 font-mono">
        {currentSession.messages.length > 0 && (
          <button
            onClick={onExportMarkdown}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs ${currentTheme.primaryText} hover:bg-zinc-900 rounded border border-zinc-800 transition-colors`}
            title="Export conversation logs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT</span>
          </button>
        )}

        <button
          onClick={onOpenAndroidInstall}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-300 bg-zinc-950 hover:bg-zinc-900 border border-emerald-500/50 rounded shadow-xs transition-all`}
          title="Install on Android or get debug .APK"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">GET .APK</span>
        </button>

        <button
          onClick={onOpenSettings}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${currentTheme.primaryText} bg-zinc-950 hover:bg-zinc-900 border ${currentTheme.borderActive}/60 rounded shadow-xs transition-all`}
          title="Protocols & Theme Settings"
        >
          <Settings className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">PROTOCOLS</span>
        </button>
      </div>
    </header>
  );
}
