export type ThemeColor = 'green' | 'blue' | 'red' | 'yellow' | 'purple';

export interface BotPersona {
  id: string;
  name: string;
  role: string;
  tagline: string;
  icon: 'sparkles' | 'code' | 'pen' | 'book' | 'bot' | 'compass' | 'lightbulb';
  avatarColor: string;
  systemInstruction: string;
  temperature: number;
  starterPrompts: string[];
  isCustom?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  error?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  personaId: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  isPinned?: boolean;
}
