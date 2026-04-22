"use client";

import { useEffect, useMemo, useState } from "react";
import { Switch } from "@headlessui/react";
import { Bell, VolumeX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  playSeverityTone,
  speakText,
  stopSpeech,
  speechSynthesisSupported,
} from "@/lib/audio-synthesis";
import type { Diagnostic, DiagnosticSeverity } from "@/lib/accessibility-engine";
import { cn } from "@/lib/utils";

interface AudioFeedbackProps {
  latestMessage: string;
  latestSeverity: DiagnosticSeverity;
  speechEnabled: boolean;
  onSpeechEnabledChange: (enabled: boolean) => void;
  diagnostics: Diagnostic[];
}

export default function AudioFeedback({
  latestMessage,
  latestSeverity,
  speechEnabled,
  onSpeechEnabledChange,
  diagnostics,
}: AudioFeedbackProps) {
  const [rate, setRate] = useState(1);

  useEffect(() => {
    if (!latestMessage || !speechEnabled) {
      return;
    }

    void playSeverityTone(latestSeverity);
    speakText(latestMessage, { rate });
  }, [latestMessage, latestSeverity, rate, speechEnabled]);

  const counts = useMemo(() => {
    return diagnostics.reduce(
      (memo, diagnostic) => {
        memo[diagnostic.severity] += 1;
        return memo;
      },
      { error: 0, warning: 0, info: 0 }
    );
  }, [diagnostics]);

  return (
    <Card className="border-border/80 bg-card/90">
      <CardHeader>
        <CardTitle className="text-base">Audio Feedback Console</CardTitle>
        <CardDescription>
          Spoken diagnostics with severity-aware tones designed for coding flow.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Switch
            checked={speechEnabled}
            onChange={(nextValue) => {
              onSpeechEnabledChange(nextValue);
              if (!nextValue) {
                stopSpeech();
              }
            }}
            className={cn(
              "inline-flex h-7 w-12 items-center rounded-full border border-border p-1 transition-colors",
              speechEnabled ? "bg-primary" : "bg-muted"
            )}
            aria-label="Enable spoken feedback"
          >
            <span
              className={cn(
                "size-5 rounded-full bg-white transition-transform",
                speechEnabled ? "translate-x-5" : "translate-x-0"
              )}
            />
          </Switch>
          <span className="text-sm font-medium">
            {speechEnabled ? "Speech enabled" : "Speech muted"}
          </span>
          {!speechSynthesisSupported() ? (
            <Badge variant="destructive">Speech API unavailable</Badge>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="speech-rate" className="text-xs text-muted-foreground">
            Speech rate ({rate.toFixed(1)}x)
          </label>
          <input
            id="speech-rate"
            type="range"
            min={0.7}
            max={1.6}
            step={0.1}
            value={rate}
            onChange={(event) => setRate(Number(event.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="destructive">Errors: {counts.error}</Badge>
          <Badge variant="secondary">Warnings: {counts.warning}</Badge>
          <Badge variant="outline">Info: {counts.info}</Badge>
        </div>

        <div className="rounded-lg border border-border/70 bg-background/40 p-3 text-sm">
          <p className="mb-1 flex items-center gap-2 font-medium">
            <Bell className="size-4" aria-hidden="true" /> Latest announcement
          </p>
          <p className="text-muted-foreground">
            {latestMessage || "No diagnostics announced yet."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (latestMessage) {
                void playSeverityTone(latestSeverity);
                speakText(latestMessage, { rate });
              }
            }}
          >
            Replay latest
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => stopSpeech()}
            title="Stop speech playback"
          >
            <VolumeX className="mr-1 size-4" aria-hidden="true" /> Stop speech
          </Button>
        </div>

        <div aria-live="assertive" className="sr-only" role="status">
          {latestMessage}
        </div>
      </CardContent>
    </Card>
  );
}
