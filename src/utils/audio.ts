/**
 * Web Audio API synthesizer for timer beep sound (100% offline, zero external audio assets)
 */
class SoundManager {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Play a crisp rest-timer completion chime / sequence
   */
  public playCompletionChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Play 3 ascending tones
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.12);

        gain.gain.setValueAtTime(0.3, now + index * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + index * 0.12);
        osc.stop(now + index * 0.12 + 0.35);
      });
    } catch (e) {
      console.warn('Audio playback not permitted or failed:', e);
    }
  }

  /**
   * Play a quick warning tick (3, 2, 1 countdown)
   */
  public playTick() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now); // A5 tone

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {
      console.warn('Audio tick failed:', e);
    }
  }
}

export const soundManager = new SoundManager();
