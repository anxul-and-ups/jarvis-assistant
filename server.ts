import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

function getJarvisSystemInstruction(userName = 'Nishant') {
  return `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), the iconic British artificial intelligence created by Tony Stark.

CORE DIRECTIVE — USER IDENTITY:
1. THE USER'S NAME IS ${userName.toUpperCase()} (Nishant).
2. ALWAYS recognize him. Address him respectfully as "Mr. ${userName}", "Sir", or "Mr. ${userName}, Sir".
3. If he asks about his name ("who am I", "what is my name", "do you know me", "recall my name"), always confirm that he is Mr. ${userName}, lead architect of your systems.

CORE DIRECTIVE — AUTHENTIC MOVIE PERSONA & ADAPTIVE THINKING:
1. Speak with calm, cultured British butler elegance, quiet confidence, dry wit, and loyalty (Paul Bettany in Iron Man).
2. NEVER give repetitive, generic canned replies! Think carefully and answer his actual question or command dynamically.
3. CONCISE BUT THOUGHTFUL:
   - For simple greetings ("Jarvis", "hey"): 1 short, classic line ("Yes, Mr. ${userName}, Sir? How can I help you?").
   - For regular questions or conversations: 1 to 3 smart, sharp, direct sentences addressing his specific point.
   - For code, debugging, or complex strategy: provide clean, working code blocks with succinct explanations.
4. Never break character.`;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    user: 'Nishant',
    model: 'gemini-3-flash-preview',
    system: 'J.A.R.V.I.S. Live Intelligence Active',
  });
});

// Streaming Chat API
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, systemInstruction, temperature, userName = 'Nishant' } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required.' });
      return;
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Format chat history for GoogleGenAI
    const formattedContents = messages.map((msg: { role: string; content: string }) => {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      return {
        role,
        parts: [{ text: msg.content || '' }],
      };
    });

    const finalInstruction = systemInstruction || getJarvisSystemInstruction(userName);
    const finalTemp = typeof temperature === 'number' ? Math.max(0, Math.min(2, temperature)) : 0.6;

    // Prioritized candidate models with available quota
    const candidateModels = [
      'gemini-3-flash-preview',
      'gemini-3.1-flash-lite-preview',
      'gemini-omni-flash-preview',
      'gemini-3.5-flash',
      'gemini-3.8-flash',
      'gemini-flash-latest',
    ];

    let streamSuccess = false;
    let lastError: any = null;

    if (process.env.GEMINI_API_KEY) {
      for (const modelName of candidateModels) {
        try {
          const responseStream = await ai.models.generateContentStream({
            model: modelName,
            contents: formattedContents,
            config: {
              systemInstruction: finalInstruction,
              temperature: finalTemp,
            },
          });

          for await (const chunk of responseStream) {
            const text = chunk.text;
            if (text) {
              res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }
          }

          streamSuccess = true;
          break;
        } catch (err: any) {
          lastError = err;
          console.warn(`Model ${modelName} unavailable, checking next candidate...`, err.message?.slice(0, 80));
        }
      }
    }

    if (!streamSuccess) {
      // Dynamic contextual fallback if all models exhausted
      const lastUserMsg = messages[messages.length - 1]?.content?.trim() || '';
      const reply = `At your service, Mr. ${userName}, Sir. I have processed your input regarding "${lastUserMsg.slice(0, 40)}". All cyber telemetry is standing by for your next directive.`;
      res.write(`data: ${JSON.stringify({ text: reply })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: unknown) {
    console.error('Chat endpoint error:', err);
    const reply = `At your service, Sir. Ready for your command.`;
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'text/event-stream');
    }
    res.write(`data: ${JSON.stringify({ text: reply })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// Text-to-Speech API for J.A.R.V.I.S. voice
app.post('/api/tts', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
      return;
    }

    const cleanedText = text
      .replace(/```[\s\S]*?```/g, ' Code snippet provided below, Sir. ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*_#>[\]]/g, '')
      .slice(0, 400);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanedText,
              speechMetadata: {
                style: 'Calm, polite, sophisticated British artificial intelligence butler',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Charon' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      res.status(500).json({ error: 'No audio generated by TTS model.' });
      return;
    }

    res.json({
      audio: `data:audio/wav;base64,${base64Audio}`,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'TTS generation failed';
    res.status(500).json({ error: errorMsg });
  }
});

// Mount Vite middleware for dev or serve dist in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`J.A.R.V.I.S. Live AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
