"use client";

import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import type { VoiceMode } from "@/lib/audio-engine";

interface AudioFeedbackProps {
  enabled: boolean;
  speechRate: number;
  voiceMode: VoiceMode;
  onEnabledChange: (enabled: boolean) => void;
  onSpeechRateChange: (rate: number) => void;
  onVoiceModeChange: (mode: VoiceMode) => void;
  onTestAnnouncement: () => void;
}

export default function AudioFeedback({
  enabled,
  speechRate,
  voiceMode,
  onEnabledChange,
  onSpeechRateChange,
  onVoiceModeChange,
  onTestAnnouncement,
}: AudioFeedbackProps) {
  return (
    <section className="rounded-xl border border-white/10 bg-[#151b23] p-4" aria-labelledby="audio-feedback-heading">
      <h2 id="audio-feedback-heading" className="text-sm font-semibold text-white">
        Audio Feedback Controls
      </h2>
      <p className="mt-1 text-sm text-slate-300">
        Configure spoken diagnostics and error tones for NVDA, JAWS, and VoiceOver workflows.
      </p>

      <div className="mt-4 space-y-4">
        <label className="flex items-center justify-between text-sm text-slate-200" htmlFor="audio-enabled">
          Enable audio feedback
          <input
            id="audio-enabled"
            type="checkbox"
            checked={enabled}
            onChange={(event) => onEnabledChange(event.target.checked)}
            className="h-4 w-4 rounded border border-slate-500 bg-slate-950 accent-cyan-400"
          />
        </label>

        <div className="space-y-2">
          <label htmlFor="speech-rate" className="text-sm text-slate-200">
            Speech rate: {speechRate.toFixed(2)}x
          </label>
          <input
            id="speech-rate"
            type="range"
            min={0.8}
            max={1.5}
            step={0.05}
            value={speechRate}
            onChange={(event) => onSpeechRateChange(Number(event.target.value))}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <span className="text-sm text-slate-200">Voice detail mode</span>
          <Select.Root value={voiceMode} onValueChange={(value) => onVoiceModeChange(value as VoiceMode)}>
            <Select.Trigger
              className="inline-flex w-full items-center justify-between rounded-md border border-white/15 bg-[#0d1117] px-3 py-2 text-sm text-slate-100"
              aria-label="Voice detail mode"
            >
              <Select.Value />
              <Select.Icon>
                <ChevronDown className="h-4 w-4" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="overflow-hidden rounded-md border border-white/15 bg-[#0d1117] shadow-lg">
                <Select.Viewport className="p-1">
                  <Select.Item
                    value="concise"
                    className="cursor-pointer rounded px-2 py-1 text-sm text-slate-100 outline-none hover:bg-white/10"
                  >
                    <Select.ItemText>Concise</Select.ItemText>
                  </Select.Item>
                  <Select.Item
                    value="detailed"
                    className="cursor-pointer rounded px-2 py-1 text-sm text-slate-100 outline-none hover:bg-white/10"
                  >
                    <Select.ItemText>Detailed</Select.ItemText>
                  </Select.Item>
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>

        <button
          type="button"
          onClick={onTestAnnouncement}
          className="w-full rounded-md border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-500/20"
        >
          Test announcement
        </button>
      </div>
    </section>
  );
}
