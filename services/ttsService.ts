import { TTSConfig } from "../types";

let synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
let currentlySpeaking = false;

export const speak = (text: string, config: TTSConfig, onEnd?: () => void) => {
  if (!synth) return;
  
  // Cancel current speech to prioritize new urgent alerts
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = config.rate;
  utterance.pitch = config.pitch;
  utterance.volume = config.volume;

  utterance.onstart = () => {
    currentlySpeaking = true;
  };

  utterance.onend = () => {
    currentlySpeaking = false;
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    currentlySpeaking = false;
  };

  synth.speak(utterance);
};

export const stopSpeaking = () => {
  if (synth) {
    synth.cancel();
    currentlySpeaking = false;
  }
};

export const isSpeaking = (): boolean => {
  return currentlySpeaking || (synth ? synth.speaking : false);
};

export const getVoices = (): SpeechSynthesisVoice[] => {
  if (!synth) return [];
  return synth.getVoices();
};