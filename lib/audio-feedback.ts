import * as Tone from "tone";

let synth: Tone.Synth | null = null;

function getSynth() {
  if (!synth) {
    synth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.005, decay: 0.2, sustain: 0.1, release: 0.2 },
    }).toDestination();
  }
  return synth;
}

export async function playSyntaxAlert(severity: "error" | "warning") {
  if (typeof window === "undefined") {
    return;
  }

  await Tone.start();
  const activeSynth = getSynth();
  if (severity === "error") {
    activeSynth.triggerAttackRelease("C3", "8n");
    setTimeout(() => activeSynth.triggerAttackRelease("G2", "8n"), 120);
  } else {
    activeSynth.triggerAttackRelease("A3", "8n");
  }
}

export function speak(message: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
