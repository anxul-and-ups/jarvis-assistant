import { useState, useEffect, useCallback } from 'react';
import { useChatStore } from './hooks/useChatStore';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatStream } from './components/ChatStream';
import { ChatInput } from './components/ChatInput';
import { PersonaSettingsModal } from './components/PersonaSettingsModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { speakJarvis, stopAllSpeech } from './utils/jarvisVoice';
import { THEMES } from './utils/themeStyles';

export default function App() {
  const {
    sessions,
    currentSession,
    activeSessionId,
    setActiveSessionId,
    activePersona,
    allPersonas,
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
    theme,
    setTheme,
    userName,
    setUserName,
  } = useChatStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoVoice, setAutoVoice] = useState(true);

  const currentTheme = THEMES[theme] || THEMES.green;

  // Stop speech if unmounting
  useEffect(() => {
    return () => {
      stopAllSpeech();
    };
  }, []);

  // When a message completes streaming, if autoVoice is on, speak it!
  const lastMessage = currentSession?.messages[currentSession.messages.length - 1];
  useEffect(() => {
    if (
      autoVoice &&
      lastMessage &&
      lastMessage.role === 'assistant' &&
      !lastMessage.isStreaming &&
      lastMessage.content &&
      !lastMessage.error
    ) {
      speakJarvis(
        lastMessage.content,
        'gemini',
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  }, [lastMessage?.isStreaming, autoVoice]);

  const handleSpeakMessage = useCallback((text: string) => {
    speakJarvis(
      text,
      'gemini',
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  }, []);

  const handleStopSpeech = useCallback(() => {
    stopAllSpeech();
    setIsSpeaking(false);
  }, []);

  const handleTestVoice = useCallback(() => {
    speakJarvis(
      `At your service, Mr. ${userName}, Sir. All systems operating within nominal parameters.`,
      'gemini',
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  }, [userName]);

  const handleToggleAutoVoice = useCallback(() => {
    if (isSpeaking) {
      handleStopSpeech();
    }
    setAutoVoice((prev) => !prev);
  }, [isSpeaking, handleStopSpeech]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-zinc-100 font-mono select-none">
      {/* Sidebar navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewChat={startNewChat}
        onDeleteSession={deleteSession}
        onRenameSession={renameSession}
        onTogglePinSession={togglePinSession}
        onClearAll={clearAllSessions}
        onOpenSettings={() => setIsSettingsOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        allPersonas={allPersonas}
        theme={theme}
      />

      {/* Main chat viewport */}
      <main className={`flex-1 flex flex-col min-w-0 h-full relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${currentTheme.bgGlow}`}>
        {/* Top Header */}
        <Header
          activePersona={activePersona}
          allPersonas={allPersonas}
          onSelectPersona={switchPersona}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          isSidebarOpen={isSidebarOpen}
          currentSession={currentSession}
          onExportMarkdown={() => exportSessionAsMarkdown(currentSession)}
          isSpeaking={isSpeaking}
          isStreaming={isStreaming}
          autoVoice={autoVoice}
          onToggleAutoVoice={handleToggleAutoVoice}
          onTestVoice={handleTestVoice}
          theme={theme}
          onSelectTheme={setTheme}
          userName={userName}
          onOpenAndroidInstall={() => setIsAndroidModalOpen(true)}
        />

        {/* Message Stream */}
        <ChatStream
          currentSession={currentSession}
          activePersona={activePersona}
          allPersonas={allPersonas}
          onSelectPersona={switchPersona}
          onSendPrompt={sendMessage}
          onRetry={retryLastMessage}
          isStreaming={isStreaming}
          onSpeakMessage={handleSpeakMessage}
          onStopSpeech={handleStopSpeech}
          isSpeaking={isSpeaking}
          theme={theme}
          userName={userName}
        />

        {/* Chat Input Bar */}
        <ChatInput
          onSendMessage={sendMessage}
          onStopGeneration={stopGeneration}
          isStreaming={isStreaming}
          activePersona={activePersona}
          theme={theme}
        />
      </main>

      {/* Protocol & Color Matrix Modal */}
      <PersonaSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activePersona={activePersona}
        allPersonas={allPersonas}
        onSelectPersona={switchPersona}
        onSaveCustomPersona={saveCustomPersona}
        onDeleteCustomPersona={deleteCustomPersona}
        theme={theme}
        onSelectTheme={setTheme}
        userName={userName}
        onUpdateUserName={setUserName}
      />

      {/* Android .APK & Mobile Installation Modal */}
      <AndroidInstallModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        theme={theme}
      />
    </div>
  );
}
