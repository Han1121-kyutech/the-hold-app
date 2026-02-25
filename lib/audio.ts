export class AudioFeedback {
  private audioContext: AudioContext | null = null;
  private currentOscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private startTime: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = 0;
    }
  }

  startPulse() {
    if (!this.audioContext || !this.gainNode) return;

    this.startTime = Date.now();
    this.playPulse(440);

    this.intervalId = setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000;
      const frequency = 440 + elapsed * 10;
      this.playPulse(Math.min(frequency, 880));
    }, 1000);
  }

  private playPulse(frequency: number) {
    if (!this.audioContext || !this.gainNode) return;

    if (this.currentOscillator) {
      this.currentOscillator.stop();
      this.currentOscillator.disconnect();
    }

    this.currentOscillator = this.audioContext.createOscillator();
    this.currentOscillator.type = 'sine';
    this.currentOscillator.frequency.value = frequency;
    this.currentOscillator.connect(this.gainNode);

    const now = this.audioContext.currentTime;
    this.gainNode.gain.setValueAtTime(0, now);
    this.gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05);
    this.gainNode.gain.linearRampToValueAtTime(0, now + 0.2);

    this.currentOscillator.start(now);
    this.currentOscillator.stop(now + 0.2);
  }

  stopPulse() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.currentOscillator) {
      try {
        this.currentOscillator.stop();
        this.currentOscillator.disconnect();
      } catch (e) {
        // Already stopped
      }
      this.currentOscillator = null;
    }

    this.playStopSound();
  }

  private playStopSound() {
    if (!this.audioContext || !this.gainNode) return;

    const osc = this.audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 220;
    osc.connect(this.gainNode);

    const now = this.audioContext.currentTime;
    this.gainNode.gain.setValueAtTime(0, now);
    this.gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
    this.gainNode.gain.linearRampToValueAtTime(0, now + 0.5);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  cleanup() {
    this.stopPulse();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
