// Voice engine for J.A.R.V.I.S. British persona

let currentAudio: HTMLAudioElement | null = null;

// Stop any currently playing speech or audio
export function stopAllSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

// Clean markdown syntax for speech
export function cleanTextForSpeech(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, ' Code snippet provided below, Sir. ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_#>[\]]/g, '')
    .trim();
}

// Speak using browser SpeechSynthesis with British male cadence
export function speakWithBrowserVoice(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  stopAllSpeech();

  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) return false;

  const utterance = new SpeechSynthesisUtterance(cleaned);

  // Find best British voice
  const voices = window.speechSynthesis.getVoices();
  const britishVoice =
    voices.find(
      (v) =>
        (v.lang === 'en-GB' || v.lang.startsWith('en_GB')) &&
        (v.name.toLowerCase().includes('male') ||
          v.name.toLowerCase().includes('daniel') ||
          v.name.toLowerCase().includes('oliver') ||
          v.name.toLowerCase().includes('george') ||
          v.name.toLowerCase().includes('uk english'))
    ) ||
    voices.find((v) => v.lang === 'en-GB' || v.lang.startsWith('en_GB')) ||
    voices.find((v) => v.lang.startsWith('en-'));

  if (britishVoice) {
    utterance.voice = britishVoice;
  }

  // Refined British butler cadence: slightly measured, calm pitch
  utterance.rate = 0.98;
  utterance.pitch = 0.94;

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    onEnd?.();
  };

  utterance.onerror = () => {
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
  return true;
}

// Speak using Gemini High-Quality Server TTS with fallback to browser
export async function speakJarvis(
  text: string,
  mode: 'gemini' | 'browser' = 'gemini',
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  stopAllSpeech();

  if (mode === 'gemini') {
    try {
      onStart?.();
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('TTS server endpoint failed');
      }

      const data = await response.json();
      if (!data.audio) {
        throw new Error('No audio returned');
      }

      const audio = new Audio(data.audio);
      currentAudio = audio;

      audio.onended = () => {
        currentAudio = null;
        onEnd?.();
      };
      audio.onerror = () => {
        currentAudio = null;
        // Fallback to browser voice on audio error
        speakWithBrowserVoice(text, onStart, onEnd);
      };

      await audio.play();
      return;
    } catch {
      // Fallback seamlessly to browser British voice
      speakWithBrowserVoice(text, onStart, onEnd);
      return;
    }
  }

  // Browser mode directly
  speakWithBrowserVoice(text, onStart, onEnd);
}
