import { useState } from 'react';
import {
  X,
  Sliders,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  Terminal,
  Palette,
  User,
} from 'lucide-react';
import { BotPersona, ThemeColor } from '../types';
import { DEFAULT_PERSONAS } from '../data/defaultPersonas';
import { THEMES } from '../utils/themeStyles';

interface PersonaSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePersona: BotPersona;
  allPersonas: BotPersona[];
  onSelectPersona: (id: string) => void;
  onSaveCustomPersona: (persona: BotPersona) => void;
  onDeleteCustomPersona: (id: string) => void;
  theme: ThemeColor;
  onSelectTheme: (t: ThemeColor) => void;
  userName: string;
  onUpdateUserName: (name: string) => void;
}

export function PersonaSettingsModal({
  isOpen,
  onClose,
  activePersona,
  allPersonas,
  onSelectPersona,
  onSaveCustomPersona,
  onDeleteCustomPersona,
  theme,
  onSelectTheme,
  userName,
  onUpdateUserName,
}: PersonaSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'themes' | 'presets' | 'create'>('themes');
  const currentTheme = THEMES[theme] || THEMES.green;

  // Editable fields for current persona
  const [instruction, setInstruction] = useState(activePersona.systemInstruction);
  const [temperature, setTemperature] = useState(activePersona.temperature);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable user name
  const [nameInput, setNameInput] = useState(userName);
  const [nameSaved, setNameSaved] = useState(false);

  // Fields for creating a new custom bot
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newInstruction, setNewInstruction] = useState('');
  const [newTemperature, setNewTemperature] = useState(0.7);
  const [newStarters, setNewStarters] = useState<string>('');

  if (!isOpen) return null;

  const handleUpdateCurrent = () => {
    const updated: BotPersona = {
      ...activePersona,
      systemInstruction: instruction,
      temperature,
    };
    onSaveCustomPersona(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdateUserName(nameInput.trim());
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    }
  };

  const handleResetCurrent = () => {
    const original = DEFAULT_PERSONAS.find((p) => p.id === activePersona.id);
    if (original) {
      setInstruction(original.systemInstruction);
      setTemperature(original.temperature);
      onSaveCustomPersona(original);
    }
  };

  const handleCreateNew = () => {
    if (!newName.trim() || !newInstruction.trim()) {
      alert('Please provide at least a Protocol Name and System Instructions.');
      return;
    }

    const startersArray = newStarters
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const newPersona: BotPersona = {
      id: 'custom_' + Math.random().toString(36).substring(2, 9),
      name: newName.trim(),
      role: newRole.trim() || 'Custom Sub-Protocol',
      tagline: newTagline.trim() || 'Custom protocol generated in J.A.R.V.I.S. terminal.',
      icon: 'bot',
      avatarColor: 'bg-zinc-900 text-white border border-zinc-700',
      systemInstruction: newInstruction.trim(),
      temperature: newTemperature,
      starterPrompts:
        startersArray.length > 0
          ? startersArray
          : [
              `Hello! What is your directive as ${newName}?`,
              'Run initial diagnostics and report telemetry.',
            ],
      isCustom: true,
    };

    onSaveCustomPersona(newPersona);
    onSelectPersona(newPersona.id);
    setNewName('');
    setNewRole('');
    setNewTagline('');
    setNewInstruction('');
    setNewStarters('');
    setActiveTab('current');
  };

  const themeList: ThemeColor[] = ['green', 'blue', 'red', 'yellow', 'purple'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none font-mono">
      <div className={`relative w-full max-w-2xl bg-black border ${currentTheme.borderActive}/60 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <Sliders className={`w-5 h-5 ${currentTheme.primaryText}`} />
            <div>
              <h2 className="text-base font-bold text-white">
                [ J.A.R.V.I.S. PROTOCOL & COLOR MATRIX ]
              </h2>
              <p className="text-[11px] text-zinc-500">
                Customize chat color themes, user call-sign, and neural weights
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-zinc-900 bg-black text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('themes')}
            className={`py-2 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'themes'
                ? `border-white ${currentTheme.primaryText}`
                : 'border-transparent text-zinc-500 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5 inline mr-1" />
            THEMES & COLORS
          </button>
          <button
            onClick={() => setActiveTab('current')}
            className={`py-2 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'current'
                ? `border-white ${currentTheme.primaryText}`
                : 'border-transparent text-zinc-500 hover:text-white'
            }`}
          >
            ACTIVE [{activePersona.name}]
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`py-2 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'presets'
                ? `border-white ${currentTheme.primaryText}`
                : 'border-transparent text-zinc-500 hover:text-white'
            }`}
          >
            SUB-PROTOCOLS ({allPersonas.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'create'
                ? `border-white ${currentTheme.primaryText}`
                : 'border-transparent text-zinc-500 hover:text-white'
            }`}
          >
            + NEW ROUTINE
          </button>
        </div>

        {/* Tab contents */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* THEMES TAB */}
          {activeTab === 'themes' && (
            <div className="space-y-6">
              {/* User Identity Section */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2">
                  <User className={`w-4 h-4 ${currentTheme.primaryText}`} />
                  <span className="font-bold text-white text-xs uppercase tracking-wider">
                    Commander Identity / Call-Sign
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  J.A.R.V.I.S. will recognize and address you by this name in all verbal and textual dialogues.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter your name (e.g. Nishant)"
                    className="flex-1 px-3 py-2 bg-black border border-zinc-700 rounded text-white text-xs focus:outline-none focus:border-white"
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    className={`px-3 py-2 rounded ${currentTheme.buttonBg} ${currentTheme.buttonText} font-bold text-xs flex items-center gap-1 transition-all`}
                  >
                    {nameSaved ? <Check className="w-3.5 h-3.5" /> : null}
                    <span>{nameSaved ? 'UPDATED' : 'SET CALL-SIGN'}</span>
                  </button>
                </div>
              </div>

              {/* Theme Color Selector */}
              <div>
                <label className="block font-bold text-white mb-2 uppercase tracking-wider">
                  Select Chat Interface Color & HUD Theme
                </label>
                <p className="text-[11px] text-zinc-400 mb-3">
                  Instantly re-skin the entire terminal, message bubbles, Arc Reactor, and telemetry glows.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {themeList.map((t) => {
                    const def = THEMES[t];
                    const isSelected = theme === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => onSelectTheme(t)}
                        className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? `border-white bg-zinc-900 ${def.primaryText} ring-1 ring-white shadow-md`
                            : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full ${def.dotColor} shadow-xs flex items-center justify-center`}>
                            {isSelected && <span className="w-2 h-2 rounded-full bg-black" />}
                          </span>
                          <div>
                            <p className="font-bold text-xs text-white">{def.name}</p>
                            <p className="text-[10px] text-zinc-500">{def.label}</p>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 border border-zinc-800">
                          {isSelected ? 'ACTIVE' : 'SELECT'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE PROTOCOL TAB */}
          {activeTab === 'current' && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-white mb-1">
                  CURRENT DIRECTIVE NAME & ROLE
                </label>
                <div className="flex items-center gap-2 p-2.5 bg-zinc-950 rounded border border-zinc-800">
                  <div className={`w-7 h-7 rounded ${activePersona.avatarColor} flex items-center justify-center font-bold text-xs`}>
                    <Terminal className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">
                      {activePersona.name}
                    </span>
                    <span className="text-zinc-500 ml-1.5 font-normal">
                      ({activePersona.role})
                    </span>
                  </div>
                </div>
              </div>

              {/* Temperature */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-white">
                    TEMPERATURE / STOCHASTIC COEFFICIENT
                  </label>
                  <span className={`font-mono tabular-nums ${currentTheme.primaryText} font-semibold`}>
                    {temperature}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                  <span>0.0 (PRECISE MOVIE REACTION)</span>
                  <span>0.6 (BALANCED)</span>
                  <span>1.5 (CREATIVE)</span>
                </div>
              </div>

              {/* System Instruction */}
              <div>
                <label className="block font-semibold text-white mb-1">
                  CORE SYSTEM INSTRUCTION
                </label>
                <textarea
                  rows={6}
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded text-zinc-200 leading-relaxed font-mono text-[12px] focus:outline-none focus:border-white"
                />
              </div>

              {/* Save & Reset buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetCurrent}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>RESET DEFAULTS</span>
                </button>

                <button
                  type="button"
                  onClick={handleUpdateCurrent}
                  className={`flex items-center gap-1.5 px-4 py-2 ${currentTheme.buttonBg} ${currentTheme.buttonText} font-bold rounded shadow-xs transition-all`}
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>CONFIG UPDATED</span>
                    </>
                  ) : (
                    <span>COMMIT CHANGES</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* SUB-PROTOCOLS TAB */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-zinc-500">
                Select any sub-protocol to swap active neural mode.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allPersonas.map((persona) => {
                  const isCurrent = persona.id === activePersona.id;
                  return (
                    <div
                      key={persona.id}
                      className={`p-3.5 rounded border flex flex-col justify-between transition-all ${
                        isCurrent
                          ? `border-white bg-zinc-900 text-white shadow-xs`
                          : 'border-zinc-800 bg-black hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-white" />
                            <span className="font-bold text-white">
                              {persona.name}
                            </span>
                          </div>
                          {persona.isCustom && (
                            <button
                              onClick={() => onDeleteCustomPersona(persona.id)}
                              className="p-1 text-zinc-600 hover:text-red-400 rounded transition-colors"
                              title="Delete custom protocol"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="font-medium text-[11px] text-zinc-300 mb-1">
                          {persona.role}
                        </p>
                        <p className="text-zinc-500 text-[11px] leading-relaxed line-clamp-2">
                          {persona.tagline}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-zinc-900 flex items-center justify-between">
                        <span className="text-[10px] text-zinc-600 tabular-nums">
                          TEMP: {persona.temperature}
                        </span>
                        <button
                          onClick={() => {
                            onSelectPersona(persona.id);
                            onClose();
                          }}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                            isCurrent
                              ? `${currentTheme.buttonBg} ${currentTheme.buttonText} font-bold`
                              : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                          }`}
                        >
                          {isCurrent ? 'ACTIVE' : 'ACTIVATE'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CREATE TAB */}
          {activeTab === 'create' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-white mb-1">
                    PROTOCOL IDENTIFIER *
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. J.A.R.V.I.S. [STEALTH]"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-white mb-1">
                    OPERATIONAL ROLE
                  </label>
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="e.g. Autonomous Reconnaissance"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-white mb-1">
                  SYSTEM DIRECTIVE INSTRUCTIONS *
                </label>
                <textarea
                  rows={4}
                  value={newInstruction}
                  onChange={(e) => setNewInstruction(e.target.value)}
                  placeholder="You are J.A.R.V.I.S. addressing Mr. Nishant..."
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded text-white font-mono text-[11px] focus:outline-none focus:border-white"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleCreateNew}
                  className={`flex items-center gap-1.5 px-4 py-2 ${currentTheme.buttonBg} ${currentTheme.buttonText} font-bold rounded shadow-xs transition-all`}
                >
                  <Plus className="w-4 h-4" />
                  <span>INITIALIZE SUB-ROUTINE</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
