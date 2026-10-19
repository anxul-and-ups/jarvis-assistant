import { useState, useEffect, useRef, useCallback } from 'react';
import { BotPersona, ChatMessage, ChatSession } from '../types';
import { DEFAULT_PERSONAS, getPersonaById } from '../data/defaultPersonas';

const STORAGE_KEYS = {
  SESSIONS: 'jarvis_chat_sessions_v3',
  ACTIVE_SESSION: 'jarvis_active_session_v3',
  CUSTOM_PERSONAS: 'jarvis_custom_personas_v3',
  ACTIVE_PERSONA: 'jarvis_active_persona_v3',
  USER_NAME: 'jarvis_user_name_v3',
  THEME: 'jarvis_theme_v3',
};

function createNewSession(personaId: string): ChatSession {
  const now = Date.now();
  return {
    id: 'session_' + Math.random().toString(36).substring(2, 9),
    title: 'New directive',
    personaId,
    createdAt: now,
    updatedAt: now,
    messages: [],
    isPinned: false,
  };
}

export function useChatStore() {
  // Theme state
  const [theme, setTheme] = useState<'green' | 'blue' | 'red' | 'yellow' | 'purple'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME) as any;
      if (['green', 'blue', 'red', 'yellow', 'purple'].includes(saved)) return saved;
    } catch {
      // ignore
    }
    return 'green';
  });

  // User name (default Nishant)
  const [userName, setUserName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_NAME);
      return saved || 'Nishant';
    } catch {
      return 'Nishant';
    }
  });

  // Load custom personas
  const [customPersonas, setCustomPersonas] = useState<BotPersona[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_PERSONAS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // All personas combined
  const allPersonas = [...DEFAULT_PERSONAS, ...customPersonas];

  // Active persona ID
  const [activePersonaId, setActivePersonaId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_PERSONA);
      return saved || DEFAULT_PERSONAS[0].id;
    } catch {
      return DEFAULT_PERSONAS[0].id;
    }
  });

  // Sessions list
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (saved) {
        const parsed: ChatSession[] = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    const initial = createNewSession(DEFAULT_PERSONAS[0].id);
    return [initial];
  });

  // Active session ID
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
      return saved || '';
    } catch {
      return '';
    }
  });

  // Streaming status
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Save personas to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_PERSONAS, JSON.stringify(customPersonas));
    } catch {
      // ignore
    }
  }, [customPersonas]);

  // Save active persona to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PERSONA, activePersonaId);
    } catch {
      // ignore
    }
  }, [activePersonaId]);

  // Save sessions to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch {
      // ignore
    }
  }, [sessions]);

  // Save active session to storage
  useEffect(() => {
    try {
      if (activeSessionId) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, activeSessionId);
      }
    } catch {
      // ignore
    }
  }, [activeSessionId]);

  // Save theme to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Save userName to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_NAME, userName);
    } catch {
      // ignore
    }
  }, [userName]);

  // Ensure active session is valid
  useEffect(() => {
    if (!sessions.some((s) => s.id === activeSessionId)) {
      if (sessions.length > 0) {
        setActiveSessionId(sessions[0].id);
      } else {
        const fresh = createNewSession(activePersonaId);
        setSessions([fresh]);
        setActiveSessionId(fresh.id);
      }
    }
  }, [sessions, activeSessionId, activePersonaId]);

  // Current active session
  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const activePersona = getPersonaById(currentSession?.personaId || activePersonaId, customPersonas);

  // Switch persona for the current session or start new session with it
  const switchPersona = useCallback((personaId: string) => {
    setActivePersonaId(personaId);
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, personaId } : s))
    );
  }, [activeSessionId]);

  // Start a new chat session
  const startNewChat = useCallback((personaIdToUse?: string) => {
    const pId = personaIdToUse || activePersonaId;
    const newSession = createNewSession(pId);
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    return newSession.id;
  }, [activePersonaId]);

  // Delete a chat session
  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (filtered.length === 0) {
        const fresh = createNewSession(activePersonaId);
        return [fresh];
      }
      return filtered;
    });
  }, [activePersonaId]);

  // Rename a chat session
  const renameSession = useCallback((sessionId: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle.trim() || 'Untitled' } : s))
    );
  }, []);

  // Toggle pin
  const togglePinSession = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, isPinned: !s.isPinned } : s))
    );
  }, []);

  // Clear all chats
  const clearAllSessions = useCallback(() => {
    const fresh = createNewSession(activePersonaId);
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
  }, [activePersonaId]);

  // Cancel current generation
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // Send a message
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const userMessage: ChatMessage = {
        id: 'msg_' + Math.random().toString(36).substring(2, 9),
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
      };

      const assistantMessageId = 'msg_' + Math.random().toString(36).substring(2, 9);
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
      };

      const targetSessionId = activeSessionId;
      const targetSession = sessions.find((s) => s.id === targetSessionId);
      const isFirstMessage = !targetSession || targetSession.messages.length === 0;

      // Generate a title if first message
      const updatedTitle = isFirstMessage
        ? trimmed.length > 36
          ? trimmed.slice(0, 36) + '...'
          : trimmed
        : targetSession?.title || 'Conversation';

      // Update session with user and empty assistant message
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === targetSessionId) {
            return {
              ...s,
              title: updatedTitle,
              updatedAt: Date.now(),
              messages: [...s.messages, userMessage, assistantMessage],
            };
          }
          return s;
        })
      );

      // Prepare conversation history
      const currentHistory = targetSession ? [...targetSession.messages, userMessage] : [userMessage];
      const payloadMessages = currentHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const persona = getPersonaById(targetSession?.personaId || activePersonaId, customPersonas);

      setIsStreaming(true);
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: payloadMessages,
            systemInstruction: persona.systemInstruction,
            temperature: persona.temperature,
            userName,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({ error: 'Network request failed' }));
          throw new Error(errData.error || `Server responded with ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('Response body stream not available');

        const decoder = new TextDecoder();
        let accumulatedText = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

            const dataStr = trimmedLine.replace(/^data:\s*/, '');
            if (dataStr === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                accumulatedText += parsed.text;
                // Live update assistant message
                setSessions((prev) =>
                  prev.map((s) => {
                    if (s.id === targetSessionId) {
                      return {
                        ...s,
                        messages: s.messages.map((m) =>
                          m.id === assistantMessageId
                            ? { ...m, content: accumulatedText }
                            : m
                        ),
                      };
                    }
                    return s;
                  })
                );
              }
            } catch (jsonErr) {
              // Ignore non-json or chunk boundaries
            }
          }
        }

        // Finalize assistant message
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === targetSessionId) {
              return {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMessageId
                    ? { ...m, isStreaming: false, content: accumulatedText }
                    : m
                ),
              };
            }
            return s;
          })
        );
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          // User stopped generation manually
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id === targetSessionId) {
                return {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, isStreaming: false }
                      : m
                  ),
                };
              }
              return s;
            })
          );
        } else {
          const errMsg = err instanceof Error ? err.message : 'Something went wrong';
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id === targetSessionId) {
                return {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, isStreaming: false, error: errMsg }
                      : m
                  ),
                };
              }
              return s;
            })
          );
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [activeSessionId, isStreaming, sessions, activePersonaId, customPersonas]
  );

  // Retry last message if error or user wants
  const retryLastMessage = useCallback(() => {
    if (!currentSession || currentSession.messages.length === 0 || isStreaming) return;
    const lastUserMsg = [...currentSession.messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) return;

    // Remove the trailing assistant message if present
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSession.id) {
          const filtered = s.messages.filter(
            (m, idx) => idx < s.messages.length - 1 || m.role === 'user'
          );
          return { ...s, messages: filtered };
        }
        return s;
      })
    );

    sendMessage(lastUserMsg.content);
  }, [currentSession, isStreaming, sendMessage]);

  // Save or update custom persona
  const saveCustomPersona = useCallback((persona: BotPersona) => {
    setCustomPersonas((prev) => {
      const exists = prev.some((p) => p.id === persona.id);
      if (exists) {
        return prev.map((p) => (p.id === persona.id ? persona : p));
      }
      return [...prev, persona];
    });
    setActivePersonaId(persona.id);
  }, []);

  // Delete custom persona
  const deleteCustomPersona = useCallback((personaId: string) => {
    setCustomPersonas((prev) => prev.filter((p) => p.id !== personaId));
    setActivePersonaId(DEFAULT_PERSONAS[0].id);
  }, []);

  // Export current session as Markdown
  const exportSessionAsMarkdown = useCallback((session: ChatSession) => {
    const persona = getPersonaById(session.personaId, customPersonas);
    let md = `# ${session.title}\n`;
    md += `*Bot: ${persona.name} (${persona.role})*\n`;
    md += `*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`;

    session.messages.forEach((msg) => {
      const author = msg.role === 'user' ? 'You' : persona.name;
      md += `### ${author}\n\n${msg.content}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${session.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }, [customPersonas]);

  // Export current session as JSON
  const exportSessionAsJSON = useCallback((session: ChatSession) => {
    const dataStr = JSON.stringify(session, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${session.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  return {
    sessions,
    currentSession,
    activeSessionId,
    setActiveSessionId,
    activePersona,
    activePersonaId,
    allPersonas,
    customPersonas,
    switchPersona,
    startNewChat,
    deleteSession,
    renameSession,
    togglePinSession,
    clearAllSessions,
    sendMessage,
    stopGeneration,
    retryLastMessage,
    isStreaming,
    searchQuery,
    setSearchQuery,
    saveCustomPersona,
    deleteCustomPersona,
    exportSessionAsMarkdown,
    exportSessionAsJSON,
    theme,
    setTheme,
    userName,
    setUserName,
  };
}
