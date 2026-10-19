import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ArrowUp, Square, Mic, MicOff, X, Terminal, Radio } from 'lucide-react';
import { BotPersona, ThemeColor } from '../types';
import { THEMES } from '../utils/themeStyles';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onStopGeneration: () => void;
  isStreaming: boolean;
  activePersona: BotPersona;
  theme?: ThemeColor;
}

export function ChatInput({
  onSendMessage,
  onStopGeneration,
  isStreaming,
  activePersona,
  theme = 'green',
}: ChatInputProps) {
  const currentTheme = THEMES[theme] || THEMES.green;
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [micError, setMicError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Speech Recognition
  const setupRecognition = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setMicError(null);
      };

      recognition.onresult = (event: any) => {
        let finalSegment = '';
        let interimSegment = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalSegment += transcript;
          } else {
            interimSegment += transcript;
          }
        }

        if (finalSegment) {
          setText((prev) => {
            const combined = prev ? `${prev} ${finalSegment.trim()}` : finalSegment.trim();
            return combined;
          });
        }
        setInterimText(interimSegment);

        // Reset silence timer for auto-send after 2.5s of quiet
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (recognitionRef.current && isListening) {
            stopListening(true);
          }
        }, 2800);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setMicError('Microphone permission was denied. Please allow microphone in browser site settings.');
        } else if (event.error === 'no-speech') {
          // No speech detected, not fatal
        } else {
          setMicError(`Voice input error: ${event.error}`);
        }
        setIsListening(false);
        setInterimText('');
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      return recognition;
    } catch (err: any) {
      console.error('Failed to create SpeechRecognition:', err);
      setMicError('Could not initialize speech recognition.');
      return null;
    }
  }, [isListening]);

  useEffect(() => {
    recognitionRef.current = setupRecognition();
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [setupRecognition]);

  const startListening = async () => {
    setMicError(null);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (permErr: any) {
      console.warn('getUserMedia permission error:', permErr);
      if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
        setMicError('Microphone permission blocked. Please allow microphone access in browser settings.');
        return;
      }
    }

    try {
      if (!recognitionRef.current) {
        recognitionRef.current = setupRecognition();
      }
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }
    } catch (err: any) {
      console.warn('Error starting speech recognition:', err);
      try {
        recognitionRef.current?.stop();
        setTimeout(() => {
          recognitionRef.current?.start();
          setIsListening(true);
        }, 150);
      } catch {
        setMicError('Please click again to toggle microphone.');
      }
    }
  };

  const stopListening = (autoTransmit = false) => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
    setInterimText('');

    if (autoTransmit) {
      setTimeout(() => {
        setText((current) => {
          if (current.trim()) {
            onSendMessage(current.trim());
            return '';
          }
          return current;
        });
      }, 200);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening(Boolean(text.trim() || interimText.trim()));
      if (interimText.trim()) {
        const combined = text ? `${text} ${interimText.trim()}` : interimText.trim();
        setText('');
        setInterimText('');
        onSendMessage(combined);
      }
    } else {
      startListening();
    }
  };

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 180);
      textarea.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [text, interimText]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const messageToSend = (text + (interimText ? ' ' + interimText : '')).trim();
    if (!messageToSend || isStreaming) return;

    if (isListening) {
      stopListening(false);
    }

    onSendMessage(messageToSend);
    setText('');
    setInterimText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`border-t border-zinc-900 bg-black/95 backdrop-blur-md px-4 py-3 sm:py-4 font-mono`}>
      <div className="max-w-4xl mx-auto w-full">
        {/* Active persona status & keyboard hints */}
        <div className={`flex items-center justify-between px-1 mb-2 text-[11px] ${currentTheme.primaryText}`}>
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${currentTheme.dotColor} animate-pulse shadow-xs`} />
            <span>
              TRANSMITTING TO <strong className={currentTheme.accentText}>{activePersona.name}</strong>
            </span>
            <span className="text-zinc-700">·</span>
            <span className="tabular-nums text-zinc-500">TEMP: {activePersona.temperature}</span>
          </div>

          <div className="hidden sm:block text-[10px] text-zinc-600 tracking-wider">
            <span>[ENTER] TRANSMIT DIRECTIVE · [SHIFT+ENTER] NEWLINE</span>
          </div>
        </div>

        {/* Live Audio Listening HUD Banner */}
        {isListening && (
          <div className={`mb-2.5 p-2 px-3 rounded-lg bg-zinc-950 border ${currentTheme.borderActive} shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-between animate-pulse`}>
            <div className={`flex items-center gap-2 text-xs ${currentTheme.accentText}`}>
              <Radio className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="font-bold">[AUDIO UPLINK ACTIVE]:</span>
              <span className="text-white">
                {interimText || text || 'Speak your directive, Sir...'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => toggleListening()}
              className={`px-2 py-0.5 rounded ${currentTheme.buttonBg} ${currentTheme.buttonText} font-bold text-[10px] transition-colors`}
            >
              SEND DIRECTIVE
            </button>
          </div>
        )}

        {/* Microphone error banner */}
        {micError && (
          <div className="mb-2 p-2 px-3 rounded-lg bg-red-950/60 border border-red-500/60 text-red-300 text-xs flex items-center justify-between">
            <span>{micError}</span>
            <button
              onClick={() => setMicError(null)}
              className="text-red-400 hover:text-red-200 ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Input box container */}
        <form
          onSubmit={handleSubmit}
          className={`relative flex items-end gap-2 bg-zinc-950/95 border rounded-xl p-2.5 transition-all ${
            isListening
              ? `${currentTheme.borderActive} shadow-[0_0_20px_currentColor] ring-1 ring-white/50`
              : `border-zinc-800 focus-within:${currentTheme.borderActive}/80 focus-within:shadow-[0_0_15px_rgba(0,0,0,0.4)]`
          }`}
        >
          {/* Terminal prompt symbol */}
          <div className={`${currentTheme.primaryText} pt-1.5 pl-1 select-none`}>
            <Terminal className="w-4 h-4" />
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text + (interimText ? (text ? ' ' : '') + interimText : '')}
            onChange={(e) => {
              setText(e.target.value);
              setInterimText('');
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? 'Listening to your voice, Sir...'
                : `Instruct J.A.R.V.I.S. (e.g. 'Jarvis, run diagnostics')...`
            }
            className="flex-1 bg-transparent border-0 text-sm leading-relaxed text-zinc-100 placeholder-zinc-600 focus:outline-none resize-none px-2 py-1 max-h-44 font-mono"
          />

          {/* Clear text button */}
          {(text || interimText) && (
            <button
              type="button"
              onClick={() => {
                setText('');
                setInterimText('');
              }}
              className="p-1.5 text-zinc-600 hover:text-white rounded hover:bg-zinc-900 transition-colors"
              title="Clear directive"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Voice dictation button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-lg transition-all ${
              isListening
                ? `${currentTheme.buttonBg} ${currentTheme.buttonText} font-bold animate-pulse shadow-md scale-105`
                : `text-zinc-500 hover:${currentTheme.primaryText} hover:bg-zinc-900`
            }`}
            title={isListening ? 'Click to finish & send voice directive' : 'Voice command to J.A.R.V.I.S.'}
          >
            {isListening ? <MicOff className="w-4 h-4 stroke-[2.5]" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Transmit or Abort button */}
          {isStreaming ? (
            <button
              type="button"
              onClick={onStopGeneration}
              className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs"
              title="Abort calculation"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!text.trim() && !interimText.trim()}
              className={`p-2 rounded-lg ${currentTheme.buttonBg} ${currentTheme.buttonText} font-bold disabled:opacity-30 transition-all shadow-xs`}
              title="Transmit directive"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
