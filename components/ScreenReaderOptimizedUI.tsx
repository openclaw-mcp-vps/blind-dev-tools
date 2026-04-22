"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { LogOut, Sparkles } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";
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
  KEYBOARD_SHORTCUTS,
  type ShortcutDefinition,
} from "@/lib/keyboard-shortcuts";
import {
  summarizeDiagnostics,
  type Diagnostic,
  type DiagnosticSeverity,
} from "@/lib/accessibility-engine";
import AudioFeedback from "@/components/AudioFeedback";
import { AccessibleEditor, type AccessibleEditorHandle } from "./AccessibleEditor";
import CodeNavigator from "./CodeNavigator";

const starterTemplates = {
  typescript: `type Severity = "error" | "warning" | "info";

interface SpokenDiagnostic {
  line: number;
  message: string;
  severity: Severity;
}

export function announceDiagnostic(diagnostic: SpokenDiagnostic): string {
  const preface = diagnostic.severity === "error"
    ? "Error detected"
    : diagnostic.severity === "warning"
      ? "Warning"
      : "Information";

  return preface + " on line " + diagnostic.line + ": " + diagnostic.message;
}

export function summarizeIssues(issues: SpokenDiagnostic[]): string {
  if (issues.length === 0) {
    return "No active diagnostics. Ready to ship.";
  }

  return issues.map(announceDiagnostic).join(" ");
}
`,
  javascript: `function describeShortcut(shortcut, action) {
  return shortcut + " executes " + action;
}

const shortcuts = [
  ["Alt+Shift+E", "announce diagnostics"],
  ["Alt+Shift+J", "focus code navigator"],
  ["Alt+Shift+S", "toggle speech mode"],
];

console.log(shortcuts.map(([shortcut, action]) => describeShortcut(shortcut, action)).join("\\n"));
`,
  json: `{
  "project": "blind-dev-tools",
  "status": "active",
  "focus": ["semantic navigation", "spoken diagnostics", "keyboard-first flow"]
}
`,
  markdown: `# Accessibility Development Notes

- Keep keyboard shortcuts consistent across NVDA, JAWS, and VoiceOver.
- Announce diagnostics with concise, actionable language.
- Prioritize line-level navigation over visual scanning.
`,
} as const;

type LanguageKey = keyof typeof starterTemplates;

interface ScreenReaderOptimizedUIProps {
  accessSessionId: string;
}

function ShortcutGroup({
  title,
  shortcuts,
}: {
  title: ShortcutDefinition["category"];
  shortcuts: ShortcutDefinition[];
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      <ul className="space-y-1 text-sm">
        {shortcuts.map((shortcut) => (
          <li key={shortcut.keys} className="flex items-start justify-between gap-3">
            <kbd className="rounded-md bg-black/35 px-2 py-0.5 font-mono text-xs text-primary">
              {shortcut.keys}
            </kbd>
            <span className="text-right text-muted-foreground">
              {shortcut.description}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ScreenReaderOptimizedUI({
  accessSessionId,
}: ScreenReaderOptimizedUIProps) {
  const [language, setLanguage] = useState<LanguageKey>("typescript");
  const [code, setCode] = useState<string>(starterTemplates.typescript);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [latestMessage, setLatestMessage] = useState(
    "Workspace loaded. Open the navigator with Alt+Shift+J."
  );
  const [latestSeverity, setLatestSeverity] = useState<DiagnosticSeverity>("info");
  const editorRef = useRef<AccessibleEditorHandle | null>(null);

  const shortcutsByCategory = useMemo(() => {
    return KEYBOARD_SHORTCUTS.reduce<Record<ShortcutDefinition["category"], ShortcutDefinition[]>>(
      (memo, shortcut) => {
        memo[shortcut.category].push(shortcut);
        return memo;
      },
      {
        Navigation: [],
        Diagnostics: [],
        Audio: [],
      }
    );
  }, []);

  const postAnnouncement = (message: string, severity: DiagnosticSeverity = "info") => {
    setLatestMessage(message);
    setLatestSeverity(severity);
  };

  useHotkeys(
    "alt+shift+j",
    () => {
      const searchInput = document.getElementById(
        "code-navigator-search"
      ) as HTMLInputElement | null;
      searchInput?.focus();
      postAnnouncement("Code navigator focused.");
    },
    { preventDefault: true, enableOnFormTags: true },
    []
  );

  useHotkeys(
    "alt+shift+s",
    () => {
      setSpeechEnabled((currentValue) => {
        const nextValue = !currentValue;
        postAnnouncement(
          nextValue
            ? "Speech feedback enabled."
            : "Speech feedback disabled.",
          "info"
        );
        return nextValue;
      });
    },
    { preventDefault: true, enableOnFormTags: true },
    []
  );

  useHotkeys(
    "alt+shift+1",
    () => postAnnouncement(summarizeDiagnostics(diagnostics), "info"),
    { preventDefault: true, enableOnFormTags: true },
    [diagnostics]
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1500px] px-4 py-4 md:px-6 md:py-5">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="rounded-2xl border border-border/80 bg-card/95 p-4"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Workspace unlocked</Badge>
              <Badge variant="outline">Session ...{accessSessionId.slice(-8)}</Badge>
            </div>
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
              Screen Reader Optimized IDE
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Keyboard-first coding with semantic navigation and intelligent audio
              diagnostics for NVDA, JAWS, and VoiceOver workflows.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="language" className="sr-only">
              Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(event) => {
                const nextLanguage = event.target.value as LanguageKey;
                setLanguage(nextLanguage);
                setCode(starterTemplates[nextLanguage]);
                postAnnouncement(
                  `Language changed to ${nextLanguage}. Starter template loaded.`
                );
              }}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
            >
              {Object.keys(starterTemplates).map((languageOption) => (
                <option key={languageOption} value={languageOption}>
                  {languageOption}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await fetch("/api/auth", { method: "DELETE" });
                window.location.href = "/";
              }}
            >
              <LogOut className="size-4" aria-hidden="true" /> Sign out
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="mt-4 grid gap-4 xl:grid-cols-[340px_1fr]">
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
          className="space-y-4"
        >
          <CodeNavigator
            code={code}
            onJumpToLine={(line) => editorRef.current?.jumpToLine(line)}
            onAnnouncement={postAnnouncement}
          />

          <Card className="border-border/80 bg-card/90">
            <CardHeader>
              <CardTitle className="text-base">Keyboard Workflow</CardTitle>
              <CardDescription>
                Shortcuts are tuned to avoid common assistive-tech conflicts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ShortcutGroup
                title="Navigation"
                shortcuts={shortcutsByCategory.Navigation}
              />
              <ShortcutGroup
                title="Diagnostics"
                shortcuts={shortcutsByCategory.Diagnostics}
              />
              <ShortcutGroup title="Audio" shortcuts={shortcutsByCategory.Audio} />
            </CardContent>
          </Card>
        </motion.aside>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
          className="space-y-4"
        >
          <AccessibleEditor
            ref={editorRef}
            code={code}
            language={language}
            onCodeChange={setCode}
            onDiagnosticsChange={setDiagnostics}
            onAnnouncement={postAnnouncement}
          />

          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <Card className="border-border/80 bg-card/90">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="size-4 text-primary" aria-hidden="true" />
                  Live Session Summary
                </CardTitle>
                <CardDescription>
                  Instant status for what a screen reader user needs next.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>{summarizeDiagnostics(diagnostics)}</p>
                <p>
                  Active language: <span className="text-foreground">{language}</span>
                </p>
                <p>
                  Current mode:{" "}
                  <span className="text-foreground">
                    {speechEnabled ? "Spoken diagnostics on" : "Spoken diagnostics muted"}
                  </span>
                </p>
              </CardContent>
            </Card>

            <AudioFeedback
              latestMessage={latestMessage}
              latestSeverity={latestSeverity}
              speechEnabled={speechEnabled}
              onSpeechEnabledChange={setSpeechEnabled}
              diagnostics={diagnostics}
            />
          </div>
        </motion.section>
      </div>

      <div aria-live="polite" className="sr-only" role="status">
        {latestMessage}
      </div>
    </main>
  );
}
