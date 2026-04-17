"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { playSyntaxAlert, speak } from "@/lib/audio-feedback";

type AudioFeedbackProps = {
  latestAnnouncement: string;
  hasError: boolean;
};

export function AudioFeedback({ latestAnnouncement, hasError }: AudioFeedbackProps) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (!enabled || !latestAnnouncement) {
      return;
    }

    speak(latestAnnouncement);
    void playSyntaxAlert(hasError ? "error" : "warning");
  }, [enabled, latestAnnouncement, hasError]);

  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        aria-pressed={enabled}
        onClick={() => setEnabled((value) => !value)}
      >
        {enabled ? <Volume2 className="h-4 w-4" aria-hidden /> : <VolumeX className="h-4 w-4" aria-hidden />}
        {enabled ? "Audio On" : "Audio Off"}
      </Button>
      <p className="text-xs text-[var(--muted)]">Screen reader announcements remain active even when audio tones are off.</p>
    </div>
  );
}
