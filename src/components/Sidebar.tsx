import React, { useState } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Pin,
  Trash2,
  Edit2,
  Check,
  X,
  Sliders,
} from 'lucide-react';
import { BotPersona, ChatSession, ThemeColor } from '../types';
import { THEMES } from '../utils/themeStyles';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: (personaId?: string) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onTogglePinSession: (id: string) => void;
  onClearAll: () => void;
  onOpenSettings: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  allPersonas: BotPersona[];
  theme?: ThemeColor;
}

export function Sidebar({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onTogglePinSession,
  onClearAll,
  onOpenSettings,
  searchQuery,
  onSearchChange,
  allPersonas,
  theme = 'green',
}: SidebarProps) {
  const currentTheme = THEMES[theme] || THEMES.green;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const startEditing = (s: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditTitle(s.title);
  };

  const saveEditing = (s: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(s.id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesTitle = s.title.toLowerCase().includes(q);
    const matchesMessage = s.messages.some((m) => m.content.toLowerCase().includes(q));
    return matchesTitle || matchesMessage;
  });

  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const sevenDays = 7 * oneDay;

  const pinnedSessions = filteredSessions.filter((s) => s.isPinned);
  const unpinnedSessions = filteredSessions.filter((s) => !s.isPinned);

  const todaySessions = unpinnedSessions.filter((s) => now - s.updatedAt < oneDay);
  const recentSessions = unpinnedSessions.filter(
    (s) => now - s.updatedAt >= oneDay && now - s.updatedAt < sevenDays
  );
  const olderSessions = unpinnedSessions.filter((s) => now - s.updatedAt >= sevenDays);

  const renderSessionItem = (session: ChatSession) => {
    const isActive = session.id === activeSessionId;
    const isEditing = editingId === session.id;

    return (
      <div
        key={session.id}
        onClick={() => {
          onSelectSession(session.id);
          if (window.innerWidth < 768) {
            onClose();
          }
        }}
        className={`group relative flex items-center justify-between px-3 py-2 text-xs rounded cursor-pointer transition-all ${
          isActive
            ? `bg-zinc-900 ${currentTheme.accentText} border ${currentTheme.borderActive}/60 shadow-xs font-medium`
            : 'text-zinc-500 hover:bg-zinc-900 hover:text-white border border-transparent'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 pr-2 font-mono">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? `${currentTheme.dotColor} shadow-xs` : 'bg-zinc-800'}`} />

          {isEditing ? (
            <div className="flex items-center gap-1 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEditing(session, e as unknown as React.MouseEvent);
                  if (e.key === 'Escape') cancelEditing(e as unknown as React.MouseEvent);
                }}
                autoFocus
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
              />
              <button
                onClick={(e) => saveEditing(session, e)}
                className={`p-1 ${currentTheme.primaryText} hover:bg-zinc-800 rounded`}
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => cancelEditing(e)}
                className="p-1 text-zinc-500 hover:bg-zinc-800 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <span className="truncate text-xs font-normal" title={session.title}>
              {session.title}
            </span>
          )}
        </div>

        {/* Action icons on hover */}
        {!isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePinSession(session.id);
              }}
              className={`p-1 rounded hover:bg-zinc-800 transition-colors ${
                session.isPinned ? 'text-amber-400 opacity-100' : 'text-zinc-600'
              }`}
              title={session.isPinned ? 'Unpin' : 'Pin to top'}
            >
              <Pin className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => startEditing(session, e)}
              className="p-1 rounded text-zinc-600 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Rename log"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Delete this conversation log, Sir?')) {
                  onDeleteSession(session.id);
                }
              }}
              className="p-1 rounded text-zinc-600 hover:text-red-400 hover:bg-red-950/40 transition-colors"
              title="Delete log"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-black border-r border-zinc-900 flex flex-col transition-transform duration-200 ease-in-out font-mono ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top: New Directive button */}
        <div className="p-3 border-b border-zinc-900 space-y-2">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-mono font-bold ${currentTheme.buttonBg} ${currentTheme.buttonText} rounded shadow-xs transition-all`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ NEW DIRECTIVE</span>
          </button>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              type="text"
              placeholder="SEARCH LOGS..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable conversation history */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-zinc-600 text-xs px-4">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 text-zinc-800" />
              <p>[NO LOGS FOUND]</p>
            </div>
          ) : (
            <>
              {pinnedSessions.length > 0 && (
                <div>
                  <div className={`px-2.5 mb-1 text-[10px] font-semibold ${currentTheme.primaryText} uppercase tracking-widest flex items-center gap-1`}>
                    <Pin className="w-2.5 h-2.5" />
                    <span>[PRIORITY DIRECTIVES]</span>
                  </div>
                  <div className="space-y-0.5">{pinnedSessions.map(renderSessionItem)}</div>
                </div>
              )}

              {todaySessions.length > 0 && (
                <div>
                  <div className="px-2.5 mb-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                    [TODAY]
                  </div>
                  <div className="space-y-0.5">{todaySessions.map(renderSessionItem)}</div>
                </div>
              )}

              {recentSessions.length > 0 && (
                <div>
                  <div className="px-2.5 mb-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                    [PREVIOUS 7 DAYS]
                  </div>
                  <div className="space-y-0.5">{recentSessions.map(renderSessionItem)}</div>
                </div>
              )}

              {olderSessions.length > 0 && (
                <div>
                  <div className="px-2.5 mb-1 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
                    [ARCHIVED LOGS]
                  </div>
                  <div className="space-y-0.5">{olderSessions.map(renderSessionItem)}</div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-zinc-900 bg-black/60 space-y-2">
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 rounded transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5" />
              <span>PROTOCOLS & TUNING</span>
            </div>
            <span className="text-[10px] text-zinc-600 font-mono tabular-nums">
              {allPersonas.length} ACTIVE
            </span>
          </button>

          {sessions.length > 1 && (
            <button
              onClick={() => {
                if (confirm('Purge all telemetry logs, Sir?')) {
                  onClearAll();
                }
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-zinc-600 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors"
            >
              <span>PURGE MEMORY</span>
              <span className="text-[10px] text-zinc-700 font-mono tabular-nums">
                {sessions.length} LOGS
              </span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
