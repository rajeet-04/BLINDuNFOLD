
// Audio Context singleton
let audioCtx: AudioContext | null = null;
let isEnabled = false;
let currentDensity = 0;
let timerId: number | null = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

const playTick = () => {
  if (!audioCtx || !isEnabled) return;

  // Threshold: Only play sound if density > 0.05 (approx 5% text density)
  // This ensures silence when looking at blank walls or floors.
  const hasText = currentDensity > 0.05;

  if (hasText) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    // Mapping Density (0.0 - 1.0) to Pitch and Speed
    // Low density: 400Hz (Low boop)
    // High density: 1000Hz (High beep)
    
    const frequency = 400 + (currentDensity * 600); 
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    osc.type = 'sine';

    // Short "tick" envelope
    gain.gain.setValueAtTime(0.0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.1);
  }

  // Schedule next tick
  let interval;
  
  if (hasText) {
      // Density 0.05 -> ~800ms interval
      // Density 1.0 -> 80ms interval
      const maxInterval = 800;
      const minInterval = 80;
      // Non-linear mapping to make it sensitive at the top end
      interval = maxInterval - (Math.sqrt(currentDensity) * (maxInterval - minInterval));
  } else {
      // Poll frequently (200ms) when silent to react quickly when text appears
      interval = 200; 
  }

  timerId = window.setTimeout(playTick, interval);
};

export const startGuidance = () => {
  initAudio();
  if (isEnabled) return;
  isEnabled = true;
  playTick();
};

export const stopGuidance = () => {
  isEnabled = false;
  if (timerId) {
    clearTimeout(timerId);
    timerId = null;
  }
};

export const setGuidanceDensity = (density: number) => {
  // Smooth the transition slightly to prevent audio jitter
  currentDensity = (currentDensity * 0.7) + (density * 0.3);
};
