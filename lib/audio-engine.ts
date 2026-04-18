import * as Tone from "tone";

export type VoiceMode = "concise" | "detailed";

export interface AudioEngineSettings {
  enabled: boolean;
  speechRate: number;
  voiceMode: VoiceMode;
}

const DEFAULT_SETTINGS: AudioEngineSettings = {
  enabled: true,
  speechRate: 1,
  voiceMode: "concise",
};

export class AudioEngine {
  private settings: AudioEngineSettings;

  constructor(initial?: Partial<AudioEngineSettings>) {
    this.settings = { ...DEFAULT_SETTINGS, ...initial };
  }

  updateSettings(next: Partial<AudioEngineSettings>): void {
    this.settings = { ...this.settings, ...next };
  }

  getSettings(): AudioEngineSettings {
    return this.settings;
  }

  async startAudioContext(): Promise<void> {
    if (typeof window === "undefined") {
      return;
    }

    if (Tone.context.state !== "running") {
      await Tone.start();
    }
  }

  async playErrorTone(): Promise<void> {
    if (!this.settings.enabled || typeof window === "undefined") {
      return;
    }

    await this.startAudioContext();
    const synth = new Tone.Synth({
      oscillator: { type: "square" },
      envelope: { attack: 0.002, decay: 0.08, sustain: 0.05, release: 0.1 },
      volume: -8,
    }).toDestination();

    synth.triggerAttackRelease("C4", "8n", Tone.now());
    synth.triggerAttackRelease("A3", "8n", Tone.now() + 0.12);

    setTimeout(() => synth.dispose(), 800);
  }

  async playSuccessTone(): Promise<void> {
    if (!this.settings.enabled || typeof window === "undefined") {
      return;
    }

    await this.startAudioContext();
    const synth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.2 },
      volume: -10,
    }).toDestination();

    synth.triggerAttackRelease("E4", "8n", Tone.now());
    synth.triggerAttackRelease("A4", "8n", Tone.now() + 0.12);

    setTimeout(() => synth.dispose(), 1000);
  }

  speak(message: string, modeOverride?: VoiceMode): void {
    if (!this.settings.enabled || typeof window === "undefined") {
      return;
    }

    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = this.settings.speechRate;
    utterance.pitch = modeOverride === "detailed" ? 1 : 0.95;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  }
}
