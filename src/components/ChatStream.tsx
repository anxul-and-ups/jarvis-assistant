import { useEffect, useRef, useState } from 'react';
import {
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  ArrowDown,
  Volume2,
  VolumeX,
  Terminal,
} from 'lucide-react';
import { BotPersona, ChatMessage, ChatSession, ThemeColor } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { THEMES } from '../utils/themeStyles';

interface ChatStreamProps {
  currentSession: ChatSession;
  activePersona: BotPersona;
  allPersonas: BotPersona[];
  onSelectPersona: (id: string) => void;
  onSendPrompt: (prompt: string) => void;
  onRetry: () => void;
  isStreaming: boolean;
  onSpeakMessage: (text: string) => void;
  onStopSpeech: () => void;
  isSpeaking: boolean;
  theme?: ThemeColor;
  userName?: string;
}

export function ChatStream({
  currentSession,
  activePersona,
  allPersonas,
  onSelectPersona,
  onSendPrompt,
  onRetry,
  isStreaming,
  onSpeakMessage,
  onStopSpeech,
  isSpeaking,
  theme = 'green',
  userName = 'Nishant',
}: ChatStreamProps) {
  const currentTheme = THEMES[theme] || THEMES.green;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
      if (isNearBottom || isStreaming) {
        scrollToBottom(false);
      }
    }
  }, [currentSession.messages, isStreaming]);

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const distance = scrollHeight - scrollTop - clientHeight;
      setShowScrollBottom(distance > 240);
    }
  };

  const handleCopyMessage = async (msg: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopiedId(msg.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleSpeak = (msg: ChatMessage) => {
    if (isSpeaking && speakingMsgId === msg.id) {
      onStopSpeech();
      setSpeakingMsgId(null);
    } else {
      setSpeakingMsgId(msg.id);
      onSpeakMessage(msg.content);
    }
  };

  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Zero-state view with personalized greeting
  if (currentSession.messages.length === 0) {
    return (
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center max-w-3xl mx-auto w-full select-none font-mono"
      >
        <div className="w-full text-center space-y-6">
          {/* Cyber Terminal Matrix Emblem */}
          <div className="flex justify-center">
            <div className="relative group">
              <div className={`w-20 h-20 rounded-2xl border-2 ${currentTheme.borderActive}/60 bg-black/60 flex items-center justify-center ${currentTheme.reactorShadow} backdrop-blur-md`}>
                <div className={`w-12 h-12 rounded-xl border ${currentTheme.borderActive}/60 border-dashed animate-spin`} style={{ animationDuration: '16s' }} />
                <div className={`absolute w-7 h-7 rounded-lg ${currentTheme.reactorCore} flex items-center justify-center font-bold text-sm text-black shadow-xs`}>
                  <Terminal className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Personalized Heading */}
          <div className="space-y-2">
            <div className={`text-[11px] font-mono tracking-widest ${currentTheme.primaryText} uppercase`}>
              [ HUD ONLINE // COMMANDER: {userName.toUpperCase()} ]
            </div>
            <h2 className={`text-2xl sm:text-3xl font-mono font-bold tracking-tight ${currentTheme.accentText}`}>
              {activePersona.name}
            </h2>
            <p className="text-xs sm:text-sm font-mono text-zinc-400">
              {activePersona.role}
            </p>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
              &ldquo;At your service, Mr. {userName}, Sir. Neural matrix calibrated. How may I be of assistance?&rdquo;
            </p>
          </div>

          {/* Directives prompts */}
          <div className="pt-4 text-left">
            <div className={`text-[10px] font-mono font-semibold ${currentTheme.primaryText} uppercase tracking-widest mb-2.5 text-center`}>
              [ QUICK INVOCATIONS FOR {userName.toUpperCase()} ]
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                `Jarvis, what is my name?`,
                `Jarvis, are all systems operational?`,
                `Jarvis, optimize this algorithm for maximum efficiency, Sir.`,
                `Jarvis, draft a short, punchy executive memo.`,
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendPrompt(prompt)}
                  className="p-3 text-left bg-black/70 border border-zinc-800/80 hover:border-zinc-600 rounded-xl transition-all group backdrop-blur-xs"
                >
                  <p className="text-xs text-zinc-300 group-hover:text-white leading-snug font-mono">
                    <span className={`${currentTheme.primaryText} mr-1.5`}>{'>'}</span>
                    {prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Populated message stream
  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full space-y-6 font-mono"
    >
      {currentSession.messages.map((message, idx) => {
        const isUser = message.role === 'user';
        const isLastMessage = idx === currentSession.messages.length - 1;
        const isThisSpeaking = isSpeaking && speakingMsgId === message.id;

        if (isUser) {
          return (
            <div key={message.id} className="flex justify-end">
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-xl px-4 py-3 border ${currentTheme.userBubble}`}>
                <div className="text-[10px] opacity-80 mb-1 tracking-wider uppercase flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${currentTheme.dotColor} animate-pulse`} />
                  <span>{userName} (You)</span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap font-mono text-white">
                  {message.content}
                </p>
                <div className="mt-1 text-[10px] opacity-70 text-right tabular-nums">
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          );
        }

        // Assistant message (J.A.R.V.I.S.)
        return (
          <div key={message.id} className="flex gap-3 sm:gap-4 items-start group">
            {/* J.A.R.V.I.S. Avatar */}
            <div
              className={`w-9 h-9 rounded-lg border ${currentTheme.borderActive}/60 bg-black flex items-center justify-center shrink-0 ${currentTheme.reactorShadow} mt-0.5 ${
                isThisSpeaking ? `ring-2 ring-white animate-pulse` : ''
              }`}
            >
              <Terminal className={`w-4 h-4 ${currentTheme.primaryText}`} />
            </div>

            {/* Message Card */}
            <div className={`flex-1 min-w-0 bg-zinc-950/90 border ${currentTheme.borderActive}/40 hover:${currentTheme.borderActive}/80 rounded-xl p-4 sm:p-5 shadow-sm backdrop-blur-md`}>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-900">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-xs ${currentTheme.accentText} tracking-wider`}>
                    {activePersona.name}
                  </span>
                  <span className="text-[10px] text-zinc-600">·</span>
                  <span className="text-[10px] text-zinc-500">{activePersona.role}</span>
                  <span className="text-[10px] text-zinc-600">·</span>
                  <span className="text-[10px] text-zinc-500 tabular-nums">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>

                {/* Actions: Speak voice, Copy message */}
                <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  {/* Speak button */}
                  {message.content && !message.isStreaming && (
                    <button
                      onClick={() => handleSpeak(message)}
                      className={`p-1.5 rounded border text-xs flex items-center gap-1 transition-colors ${
                        isThisSpeaking
                          ? `bg-zinc-900 ${currentTheme.borderActive} ${currentTheme.primaryText} shadow-xs`
                          : 'border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900'
                      }`}
                      title={isThisSpeaking ? 'Mute vocalization' : 'Play voice with J.A.R.V.I.S. British accent'}
                    >
                      {isThisSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span className="text-[10px] hidden sm:inline">VOCALIZING</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span className="text-[10px] hidden sm:inline">VOICE</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Copy message button */}
                  <button
                    onClick={() => handleCopyMessage(message)}
                    className="p-1.5 rounded border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                    title="Copy response"
                  >
                    {copiedId === message.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Streaming loading state */}
              {message.isStreaming && !message.content ? (
                <div className={`flex items-center gap-2 py-2 ${currentTheme.primaryText} text-xs`}>
                  <span className={`w-2 h-2 rounded-full ${currentTheme.dotColor} animate-ping`} />
                  <span>[J.A.R.V.I.S. PROCESSING DIRECTIVE...]</span>
                </div>
              ) : null}

              {/* Error state */}
              {message.error ? (
                <div className="p-3 my-2 rounded bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-400">CONNECTION PAUSE</p>
                    <p className="text-[11px] opacity-90">{message.error}</p>
                    <button
                      onClick={onRetry}
                      className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-900/50 text-red-200 text-[11px] hover:bg-red-800/50 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>RETRY DIRECTIVE</span>
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Rendered content */}
              {message.content ? <MarkdownRenderer content={message.content} /> : null}

              {/* Streaming cursor */}
              {message.isStreaming && message.content ? (
                <span className={`inline-block w-2 h-4 ml-1 ${currentTheme.cursorColor} animate-pulse align-middle`} />
              ) : null}

              {/* Last message footer */}
              {isLastMessage && !message.isStreaming && !message.error && (
                <div className="mt-3 pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] text-zinc-500">
                  <span className="text-zinc-600">[J.A.R.V.I.S. READY]</span>
                  <button
                    onClick={onRetry}
                    className="flex items-center gap-1 text-zinc-400 hover:text-white hover:underline"
                    title="Recalculate directive"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>RECALCULATE, SIR</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div ref={messagesEndRef} />

      {/* Floating Scroll to Bottom button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          className={`fixed bottom-24 right-8 z-30 p-2.5 rounded-lg bg-black ${currentTheme.primaryText} shadow-md border ${currentTheme.borderActive}/50 hover:bg-zinc-900 transition-all hover:scale-105`}
          title="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
