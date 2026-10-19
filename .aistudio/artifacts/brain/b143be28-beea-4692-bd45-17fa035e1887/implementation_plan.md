# Personal AI Assistant & Chatbot Studio

A versatile, full-featured personal AI assistant chatbot featuring persistent multi-session chat history, quick-switch persona templates (General Companion, Coding Expert, Writing Coach, and Study Tutor), custom bot persona tuning, rich markdown formatting, and real-time Gemini AI streaming.

### User Review & Critical Decisions

> [!IMPORTANT]
> Based on your answers during interactive clarification, the chatbot architecture has been tailored specifically to your needs:
> - **Chatbot Style**: A dedicated personal AI assistant workspace with sidebar session history, search, and integrated productivity tools.
> - **Persona Focus**: A versatile companion tuned for everyday productivity, writing assistance, deep questions, and problem-solving.
> - **Preset Templates**: Built-in, high-performance bot personas you can switch between instantly (General Assistant, Coding Expert, Writing Coach, and Academic Study Tutor), with options to tune temperature and system instructions.

- **Confirmed Decision 1**: Dedicated assistant layout with an active thread workspace, responsive sidebar for thread management, and prompt quick-starters.
- **Confirmed Decision 2**: Powered by server-side Gemini 3.8 Flash (`@google/genai`) with secure API proxying and streaming token output for low-latency conversational feedback.
- **Open Choice / Recommended Default**: Chat history will persist locally in browser storage (IndexedDB/localStorage) with one-click JSON/Markdown export, keeping chats instant, private, and persistent across page refreshes.

---

### 1. Overview & Core Concept

- **What It Does**: Provides an intelligent, responsive personal chatbot environment where users can converse naturally, brainstorm, write prose, debug code, study complex subjects, or adjust system prompts and model temperature.
- **Target Audience / Persona**: Users seeking an intuitive, distraction-free personal AI assistant for daily tasks, creative writing, code analysis, and learning.
- **Key Value**: Combines the responsiveness of a modern chat interface with curated persona specializations (Coding, Writing, Tutoring) and customizable system instructions so you get expert assistance without manual prompt engineering.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Initiate & Select Persona**: Upon landing, the user can immediately type into the chat input or select a pre-configured template bot from the header/starter chips (e.g., Coding Expert, Writing Coach, Study Tutor, or Daily Companion).
2. **Interactive Conversation**: User sends messages; the assistant streams back responses with markdown formatting, syntax-highlighted code blocks with one-click copy, and bulleted reasoning.
3. **Session Management**: Each conversation is auto-titled and saved into the left sidebar. Users can search previous chats, rename threads, pin favorite sessions, or clear history.
4. **Persona Customization & Tools**: A slide-out Bot Settings drawer allows users to customize the bot's name, system instruction, tone, and temperature, or apply curated presets.
5. **Export & Sharing**: Users can copy responses, export complete conversations as Markdown or JSON, and reset context at any time.

#### Visual Identity & Theme
- **Aesthetic Direction**: Refined, modern productivity canvas inspired by linear desktop tools. Clean typography, generous spatial padding, hairline borders, and zero generic "AI slop" or candy badges.
- **Color Palette & Mood**:
  - Dominant Canvas: Crisp neutral slate/zinc (`bg-zinc-50 dark:bg-zinc-950`).
  - Structural Surfaces: Pure white card bodies (`bg-white dark:bg-zinc-900`) with hairline borders (`border-zinc-200 dark:border-zinc-800`).
  - Accent Color: Deep slate indigo (`#3B82F6` / `bg-blue-600`) reserved exclusively for user speech bubbles, primary send actions, and active selection states.
- **Typography & Hierarchy**:
  - Display & Headings: `Plus Jakarta Sans` or modern clean geometric sans for crisp layout clarity.
  - Body Prose: High-legibility neutral sans with optimal line height (1.6) and comfortable reading width (`max-w-3xl`).
  - Code & Timestamps: Tabular monospace font (`font-mono text-xs tabular-nums`) with copy button overlay.
- **Component Styling & Layout**:
  - Left Sidebar ($260\text{px}$ collapsible on mobile): New chat button, search input, categorized thread lists (Today, Previous 7 Days, Older), and active persona badge.
  - Central Chat Canvas: Sticky top header with persona switcher and settings toggle; vertically scrolling chat stream with bottom-anchored expanding auto-grow textarea.
  - Empty State: Clean hero welcome card with suggested starter questions tailored to the active persona.

#### Interactive Feedback & Motion
- Smooth message entrance animations using compositor transforms (`opacity` and `translateY`).
- Typing indicator with gentle animated wave dots while waiting for the first token.
- Live token-by-token streaming response display.
- One-click copy toast feedback and keyboard shortcuts (`Enter` to send, `Shift+Enter` for newline).

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Server-Side Gemini API Proxy with Streaming**
  - *Chosen Approach*: Node/Express server endpoint (`POST /api/chat`) utilizing `@google/genai` with model `gemini-3.8-flash` and Server-Sent Events (SSE) streaming.
  - *Why*: Keeps API keys strictly secure on the server as required by AI Studio guidelines, while delivering snappy real-time token streaming to the user.
  - *Alternatives Considered*: Direct client-side SDK calls were rejected because exposing keys to the browser violates runtime rules and security standards.
- **Decision 2: Client-Side Persistent Chat Store**
  - *Chosen Approach*: Reactive local storage state with auto-save for conversation threads and bot settings.
  - *Why*: Delivers zero-latency session switching, works immediately without user authentication barriers, and gives users full data ownership with export capabilities.
  - *Alternatives Considered*: Cloud database backend could add authentication friction for an instant personal assistant.
- **Decision 3: Multi-Persona Templates**
  - *Chosen Approach*: Built-in persona profiles (General Assistant, Coding Expert, Writing Coach, Study Tutor) that inject specialized system instructions and parameter presets into the prompt pipeline, with user override capability.
  - *Why*: Directly fulfills user requirement for "Ready-to-use template bots" while preserving flexibility to tweak instructions.

---

### 4. Technical Architecture & Data Strategy

#### Architecture & Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client (React 19)                             │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────────────────────────────────┐ │
│  │   SidebarNav     │  │                ChatCanvas                    │ │
│  │ ──────────────── │  │ ──────────────────────────────────────────── │ │
│  │ • New Chat       │  │ • TopBar: Active Bot & Persona Selector      │ │
│  │ • Search Threads │  │ • MessageStream (Markdown + Code Highlight)  │ │
│  │ • Thread List    │  │ • QuickStarter Prompts (Empty State)         │ │
│  │ • Export / Clear │  │ • ChatInputBar (Auto-resize, submit, stop)   │ │
│  └──────────────────┘  └──────────────────────┬───────────────────────┘ │
│                                               │                         │
│                           useChatStore & Hook │                         │
└───────────────────────────────────────────────┼─────────────────────────┘
                                                │ HTTP POST /api/chat (SSE)
                                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       Express Server (server.ts)                        │
│                                                                         │
│  • Rate limiting & JSON validation                                      │
│  • GoogleGenAI Client ('gemini-3.8-flash')                              │
│  • System instruction injection based on persona template               │
│  • SSE chunk streamer (`ai.models.generateContentStream`)               │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Data Model & State
```typescript
interface BotPersona {
  id: string;
  name: string;
  role: string;
  avatarIcon: string;
  systemInstruction: string;
  temperature: number;
  starterPrompts: string[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatSession {
  id: string;
  title: string;
  personaId: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}
```

#### Interactive Component & State Mapping
- `SidebarNav`: Handles thread creation, switching active session, filtering threads by title query, deleting or renaming sessions.
- `PersonaSelector`: Dropdown/segmented tabs to swap active persona; updates system prompt configuration and suggested questions.
- `BotSettingsModal`: Drawer to inspect and edit persona instructions, adjust temperature slider (0.0 to 1.0), or reset to defaults.
- `ChatInputBar`: Auto-resizing textarea with character count, submit on `Enter`, abort button during active stream, and voice dictation trigger.
- `MessageItem`: Parses markdown, renders syntax-highlighted code blocks with language tag and copy action, formatted lists, and tables.
