"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AudioEngine, type VoiceMode } from "@/lib/audio-engine";
import type { SyntaxIssue } from "@/lib/syntax-analyzer";
import { formatIssueForSpeech, sanitizeAnnouncement } from "@/lib/screen-reader-utils";

interface UseAudioFeedbackParams {
  issues: SyntaxIssue[];
}

export function useAudioFeedback({ issues }: UseAudioFeedbackParams) {
  const audioEngine = useMemo(() => new AudioEngine(), []);
  const [enabled, setEnabled] = useState(true);
  const [voiceMode, setVoiceMode] = useState<VoiceMode>("concise");
  const [speechRate, setSpeechRate] = useState(1);
  const lastAnnounced = useRef<string>("");
  const previousIssueCount = useRef(0);

  useEffect(() => {
    audioEngine.updateSettings({ enabled, speechRate, voiceMode });
  }, [audioEngine, enabled, speechRate, voiceMode]);

  useEffect(() => {
    const issueCount = issues.length;
    const topIssue = issues[0];

    if (!enabled) {
      previousIssueCount.current = issueCount;
      return;
    }

    if (issueCount === 0 && previousIssueCount.current > 0) {
      void audioEngine.playSuccessTone();
      audioEngine.speak("Syntax check passed. No issues detected.", voiceMode);
      lastAnnounced.current = "clean";
      previousIssueCount.current = issueCount;
      return;
    }

    if (!topIssue) {
      previousIssueCount.current = issueCount;
      return;
    }

    const announcement =
      voiceMode === "detailed"
        ? formatIssueForSpeech(topIssue, 0, issueCount)
        : sanitizeAnnouncement(`${topIssue.severity} on line ${topIssue.line}. ${topIssue.message}`);

    if (announcement !== lastAnnounced.current) {
      void audioEngine.playErrorTone();
      audioEngine.speak(announcement, voiceMode);
      lastAnnounced.current = announcement;
    }

    previousIssueCount.current = issueCount;
  }, [audioEngine, enabled, issues, voiceMode]);

  return {
    enabled,
    speechRate,
    voiceMode,
    setEnabled,
    setSpeechRate,
    setVoiceMode,
    announce: (message: string) => audioEngine.speak(sanitizeAnnouncement(message), voiceMode),
    playSuccess: () => audioEngine.playSuccessTone(),
    playError: () => audioEngine.playErrorTone(),
  };
}
