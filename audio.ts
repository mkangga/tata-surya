// Web Audio API Synthesizer for Space Ambience and Interactive SFX
// This file does not require any external audio assets; it synthesizes sound on-the-fly.

class SpaceAudioClass {
  private ctx: AudioContext | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying = false;

  init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    } catch {
      console.warn("Web Audio API tidak didukung di peramban ini.");
    }
  }

  private resumeCtx() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleAmbience(shouldPlay: boolean, volume = 0.15) {
    this.resumeCtx();
    if (!this.ctx) return;

    if (shouldPlay) {
      if (this.isAmbientPlaying) return;

      try {
        // Master gain for ambient
        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.ambientGain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 2.0);

        // Low Pass Filter to make it sound muffled and warm
        this.ambientFilter = this.ctx.createBiquadFilter();
        this.ambientFilter.type = 'lowpass';
        this.ambientFilter.frequency.setValueAtTime(140, this.ctx.currentTime);

        // Oscillator 1 (Sub Bass rumble)
        this.ambientOsc = this.ctx.createOscillator();
        this.ambientOsc.type = 'sawtooth';
        this.ambientOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note

        // LFO to modulate filter frequency for the sweeping "space" effect
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime); // 0.15 Hz slow sweep

        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(40, this.ctx.currentTime); // Sweep by 40Hz up and down

        // Connections
        lfo.connect(lfoGain);
        lfoGain.connect(this.ambientFilter.frequency);

        this.ambientOsc.connect(this.ambientFilter);
        this.ambientFilter.connect(this.ambientGain);
        this.ambientGain.connect(this.ctx.destination);

        // Start oscillators
        this.ambientOsc.start();
        lfo.start();
        
        this.isAmbientPlaying = true;
      } catch (err) {
        console.error("Gagal memulai modulasi suara ambien:", err);
      }
    } else {
      if (!this.isAmbientPlaying) return;
      if (this.ambientGain && this.ctx) {
        try {
          const currentGain = this.ambientGain;
          currentGain.gain.setValueAtTime(currentGain.gain.value, this.ctx.currentTime);
          currentGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
          setTimeout(() => {
            try {
              if (this.ambientOsc) {
                this.ambientOsc.stop();
                this.ambientOsc.disconnect();
                this.ambientOsc = null;
              }
              currentGain.disconnect();
            } catch {}
          }, 600);
        } catch {}
      }
      this.isAmbientPlaying = false;
    }
  }

  playClick() {
    this.resumeCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime); // A5 high beep
      osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {}
  }

  playSelect() {
    this.resumeCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, this.ctx.currentTime); // E4
      osc.frequency.exponentialRampToValueAtTime(660, this.ctx.currentTime + 0.2); // sweep up

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch {}
  }

  playWarp() {
    this.resumeCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.4);

      // Low pass filter to make it sound sci-fi
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1500, this.ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.5);
    } catch {}
  }

  playQuizSuccess() {
    this.resumeCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } catch {}
  }

  playQuizFail() {
    this.resumeCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [293.66, 277.18]; // D4, C#4 sad sweep down

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);

        gain.gain.setValueAtTime(0.1, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.5);
      });
    } catch {}
  }
}

export const SpaceAudio = new SpaceAudioClass();
