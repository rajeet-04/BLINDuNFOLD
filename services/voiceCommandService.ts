
// Types for Web Speech API (often missing in standard TS lib)
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

export type CommandCallback = (command: string) => void;

export class VoiceCommander {
  recognition: any;
  isListening: boolean = false;
  onCommand: CommandCallback;
  
  // Track consecutive errors to prevent rapid loop crashes
  errorCount: number = 0;

  constructor(onCommand: CommandCallback) {
    const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
    const Recognition = SpeechRecognition || webkitSpeechRecognition;
    
    if (!Recognition) {
      console.warn("Speech Recognition not supported in this browser.");
      return;
    }

    this.recognition = new Recognition();
    this.recognition.continuous = true; // Keep listening after results
    this.recognition.interimResults = false; // Only final results
    this.recognition.lang = 'en-US';

    this.onCommand = onCommand;

    this.recognition.onresult = (event: any) => {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        const transcript = lastResult[0].transcript.trim().toLowerCase();
        // console.debug("Voice Command Heard:", transcript);
        this.processCommand(transcript);
      }
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        // Simple backoff if errors are happening, otherwise instant restart
        const delay = this.errorCount > 0 ? 1000 : 100;
        setTimeout(() => {
            try {
                this.recognition.start(); 
            } catch(e) { 
                // console.debug("Restart failed", e); 
            }
        }, delay);
      }
    };
    
    this.recognition.onerror = (e: any) => {
        // console.warn("Speech recognition error", e.error);
        if (e.error === 'no-speech') return; // Ignore silence errors
        this.errorCount++;
        setTimeout(() => { this.errorCount = 0; }, 5000); // Reset error count after 5s
    };
  }

  processCommand(transcript: string) {
    // Fuzzy matching for robust command detection
    if (transcript.includes('stop') || transcript.includes('pause')) {
        this.onCommand('STOP');
    } else if (transcript.includes('read') || transcript.includes('start') || transcript.includes('scan')) {
        this.onCommand('READ');
    } else if (transcript.includes('describe') || transcript.includes('scene') || transcript.includes('look')) {
        this.onCommand('DESCRIBE');
    } else if (transcript.includes('hand') || transcript.includes('writing') || transcript.includes('script')) {
        this.onCommand('HANDWRITING');
    } else if (transcript.includes('louder') || transcript.includes('volume up')) {
        this.onCommand('LOUDER');
    } else if (transcript.includes('quieter') || transcript.includes('volume down') || transcript.includes('lower')) {
        this.onCommand('QUIETER');
    } else if (transcript.includes('slower') || transcript.includes('slow down')) {
        this.onCommand('SLOWER');
    } else if (transcript.includes('faster') || transcript.includes('speed up')) {
        this.onCommand('FASTER');
    } else if (transcript.includes('help') || transcript.includes('command')) {
        this.onCommand('HELP');
    }
  }

  start() {
    if (!this.recognition) return;
    if (this.isListening) return;
    
    this.isListening = true;
    this.errorCount = 0;
    try {
      this.recognition.start();
    } catch (e) {
      console.error("Failed to start recognition", e);
    }
  }

  stop() {
    if (!this.recognition) return;
    this.isListening = false;
    try {
        this.recognition.stop();
    } catch(e) {
        // ignore
    }
  }
}
