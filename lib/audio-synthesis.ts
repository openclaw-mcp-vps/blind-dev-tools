import * as Tone from "tone";
import type { DiagnosticSeverity } from "@/lib/accessibility-engine";

let synth: Tone.Synth | null = null;

async function getSynth(): Promise<Tone.Synth | null> {
  if (typeof window === "undefined") {
    return null;
  }

  if (!synth) {
    await Tone.start();
    synth = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: {
        attack: 0.01,
        decay: 0.12,
        sustain: 0.05,
        release: 0.08,
      },
    }).toDestination();
  }

  return synth;
}

const severityToNote: Record<DiagnosticSeverity, string> = {
  error: "C3",
  warning: "E3",
  info: "G3",
};

export async function playSeverityTone(
  severity: DiagnosticSeverity = "info"
): Promise<void> {
  const instrument = await getSynth();
  if (!instrument) {
    return;
  }

  instrument.triggerAttackRelease(severityToNote[severity], "8n");
}

export function speechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speakText(
  text: string,
  options: { rate?: number; pitch?: number; volume?: number } = {}
): void {
  if (!speechSynthesisSupported() || !text.trim()) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate ?? 1;
  utterance.pitch = options.pitch ?? 1;
  utterance.volume = options.volume ?? 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function stopSpeech(): void {
  if (!speechSynthesisSupported()) {
    return;
  }

  window.speechSynthesis.cancel();
}
