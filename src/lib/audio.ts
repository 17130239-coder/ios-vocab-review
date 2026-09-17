// Web Audio API and Speech Synthesis helper for iOS 18 tactile experience

type AudioCallback = (isPlaying: boolean, text?: string) => void;
const speechListeners = new Set<AudioCallback>();

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playHaptic(type: "click" | "pop" | "flip" | "success" | "wrong" = "click", enabled: boolean = true) {
  if (!enabled || typeof window === "undefined") return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "click") {
      // Crisp subtle iOS mechanical tap
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.015);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
      osc.start(now);
      osc.stop(now + 0.015);
    } else if (type === "pop") {
      // Soft iOS rounded pop
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.03);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      osc.start(now);
      osc.stop(now + 0.035);
    } else if (type === "flip") {
      // Card flip whoosh
      osc.type = "triangle";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.05);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === "success") {
      // Apple 2-tone melodic chime (E5 -> B5)
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(987.77, now + 0.09); // B5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.setValueAtTime(0.2, now + 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (type === "wrong") {
      // Gentle subtle negative tone
      osc.type = "sine";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch (e) {
    console.debug("Haptic sound error:", e);
  }
}

export function subscribeSpeech(callback: AudioCallback) {
  speechListeners.add(callback);
  return () => {
    speechListeners.delete(callback);
  };
}

function notifySpeechListeners(isPlaying: boolean, text?: string) {
  speechListeners.forEach((cb) => cb(isPlaying, text));
}

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speakEnglish(text: string, rate: number = 0.95): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    window.speechSynthesis.cancel();

    // Clean word for clear pronunciation (remove slashes, bracketed notes)
    const cleanText = text
      .replace(/\/[^/]+\//g, "")
      .replace(/\([^)]+\)/g, "")
      .replace(/\[[^\]]+\]/g, "")
      .trim();

    if (!cleanText) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-US";
    utterance.rate = Math.max(0.7, Math.min(1.3, rate));
    utterance.pitch = 1.0;

    // Pick a high-quality voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        (v.lang.startsWith("en-US") || v.lang.startsWith("en-GB")) &&
        (v.name.includes("Samantha") ||
          v.name.includes("Siri") ||
          v.name.includes("Natural") ||
          v.name.includes("Google") ||
          v.name.includes("Daniel"))
    ) || voices.find((v) => v.lang.startsWith("en"));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      notifySpeechListeners(true, cleanText);
    };

    utterance.onend = () => {
      notifySpeechListeners(false);
      currentUtterance = null;
      resolve();
    };

    utterance.onerror = () => {
      notifySpeechListeners(false);
      currentUtterance = null;
      resolve();
    };

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    notifySpeechListeners(false);
  }
}
