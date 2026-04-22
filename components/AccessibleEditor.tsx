"use client";

import Editor from "@monaco-editor/react";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  type MutableRefObject,
} from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { AlertTriangle, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type Diagnostic,
  describeDiagnostic,
  summarizeDiagnostics,
} from "@/lib/accessibility-engine";
import { analyzeSyntaxHeuristics } from "@/lib/syntax-analyzer";

type EditorSeverity = Diagnostic["severity"];

const MONACO_SEVERITY_MAP: Record<number, EditorSeverity> = {
  1: "info",
  2: "info",
  4: "warning",
  8: "error",
};

function sortDiagnostics(diagnostics: Diagnostic[]): Diagnostic[] {
  return [...diagnostics].sort((left, right) => {
    if (left.line !== right.line) {
      return left.line - right.line;
    }

    if (left.column !== right.column) {
      return left.column - right.column;
    }

    const weight = { error: 0, warning: 1, info: 2 } as const;
    return weight[left.severity] - weight[right.severity];
  });
}

function toMonacoDiagnostics(markers: Array<Record<string, unknown>>): Diagnostic[] {
  return markers.map((marker) => {
    const severityValue = Number(marker.severity ?? 2);

    return {
      line: Number(marker.startLineNumber ?? 1),
      column: Number(marker.startColumn ?? 1),
      endLine: Number(marker.endLineNumber ?? 1),
      endColumn: Number(marker.endColumn ?? 1),
      message: String(marker.message ?? "Unknown editor issue"),
      source:
        typeof marker.source === "string" && marker.source.length > 0
          ? marker.source
          : "Monaco",
      severity: MONACO_SEVERITY_MAP[severityValue] ?? "info",
      code:
        typeof marker.code === "string" || typeof marker.code === "number"
          ? marker.code
          : undefined,
    };
  });
}

export interface AccessibleEditorHandle {
  focus: () => void;
  jumpToLine: (line: number) => void;
}

interface AccessibleEditorProps {
  code: string;
  language: string;
  onCodeChange: (nextCode: string) => void;
  onDiagnosticsChange: (diagnostics: Diagnostic[]) => void;
  onAnnouncement: (message: string, severity?: EditorSeverity) => void;
}

export const AccessibleEditor = forwardRef<
  AccessibleEditorHandle,
  AccessibleEditorProps
>(function AccessibleEditor(
  { code, language, onCodeChange, onDiagnosticsChange, onAnnouncement },
  ref
) {
  const editorRef = useRef<Record<string, unknown> | null>(null);
  const monacoDiagnosticsRef: MutableRefObject<Diagnostic[]> = useRef([]);
  const allDiagnosticsRef: MutableRefObject<Diagnostic[]> = useRef([]);
  const currentIssueIndexRef = useRef(0);

  const updateCombinedDiagnostics = useCallback(
    (latestMonacoDiagnostics: Diagnostic[], currentCode: string) => {
      const heuristicDiagnostics = analyzeSyntaxHeuristics(currentCode);
      const combined = sortDiagnostics([
        ...latestMonacoDiagnostics,
        ...heuristicDiagnostics,
      ]);

      monacoDiagnosticsRef.current = latestMonacoDiagnostics;
      allDiagnosticsRef.current = combined;
      onDiagnosticsChange(combined);
    },
    [onDiagnosticsChange]
  );

  const moveToDiagnostic = useCallback(
    (direction: 1 | -1) => {
      const issues = allDiagnosticsRef.current;

      if (issues.length === 0) {
        onAnnouncement("No diagnostics to navigate right now.", "info");
        return;
      }

      currentIssueIndexRef.current =
        (currentIssueIndexRef.current + direction + issues.length) % issues.length;
      const activeIssue = issues[currentIssueIndexRef.current];

      const editor = editorRef.current;
      if (editor && "setPosition" in editor && typeof editor.setPosition === "function") {
        editor.setPosition({ lineNumber: activeIssue.line, column: activeIssue.column });
      }

      if (
        editor &&
        "revealLineInCenter" in editor &&
        typeof editor.revealLineInCenter === "function"
      ) {
        editor.revealLineInCenter(activeIssue.line);
      }

      if (editor && "focus" in editor && typeof editor.focus === "function") {
        editor.focus();
      }

      onAnnouncement(describeDiagnostic(activeIssue), activeIssue.severity);
    },
    [onAnnouncement]
  );

  useHotkeys(
    "alt+shift+e",
    () => {
      const summary = summarizeDiagnostics(allDiagnosticsRef.current);
      const hasErrors = allDiagnosticsRef.current.some(
        (diagnostic) => diagnostic.severity === "error"
      );
      onAnnouncement(summary, hasErrors ? "error" : "info");
    },
    { preventDefault: true, enableOnFormTags: true },
    [onAnnouncement]
  );

  useHotkeys(
    "alt+shift+]",
    () => moveToDiagnostic(1),
    { preventDefault: true, enableOnFormTags: true },
    [moveToDiagnostic]
  );

  useHotkeys(
    "alt+shift+[",
    () => moveToDiagnostic(-1),
    { preventDefault: true, enableOnFormTags: true },
    [moveToDiagnostic]
  );

  useImperativeHandle(ref, () => ({
    focus: () => {
      const editor = editorRef.current;
      if (editor && "focus" in editor && typeof editor.focus === "function") {
        editor.focus();
      }
    },
    jumpToLine: (line: number) => {
      const safeLine = Math.max(1, Math.floor(line));
      const editor = editorRef.current;

      if (editor && "setPosition" in editor && typeof editor.setPosition === "function") {
        editor.setPosition({ lineNumber: safeLine, column: 1 });
      }

      if (
        editor &&
        "revealLineInCenter" in editor &&
        typeof editor.revealLineInCenter === "function"
      ) {
        editor.revealLineInCenter(safeLine);
      }

      if (editor && "focus" in editor && typeof editor.focus === "function") {
        editor.focus();
      }
    },
  }));

  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card/90">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">Code Workspace</h2>
          <p className="text-xs text-muted-foreground">
            Screen-reader mode enabled. Use Alt+Shift+E to hear diagnostics.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => moveToDiagnostic(-1)}
            title="Previous diagnostic"
          >
            <AlertTriangle className="size-4" aria-hidden="true" /> Prev issue
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => moveToDiagnostic(1)}
            title="Next diagnostic"
          >
            <AlertTriangle className="size-4" aria-hidden="true" /> Next issue
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              onAnnouncement(summarizeDiagnostics(allDiagnosticsRef.current), "info")
            }
            title="Announce diagnostics summary"
          >
            <Volume2 className="size-4" aria-hidden="true" /> Read summary
          </Button>
        </div>
      </div>

      <Editor
        height="62vh"
        language={language}
        value={code}
        theme="vs-dark"
        onMount={(editor) => {
          editorRef.current = editor as unknown as Record<string, unknown>;
          if ("updateOptions" in editor && typeof editor.updateOptions === "function") {
            editor.updateOptions({
              accessibilitySupport: "on",
              ariaLabel:
                "Blind Dev Tools Monaco editor. Use Alt Shift E for diagnostics and Alt Shift bracket keys for issue navigation.",
              minimap: { enabled: false },
              lineNumbers: "on",
              renderWhitespace: "selection",
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              fontFamily: "var(--font-plex-mono), monospace",
              fontSize: 15,
              wordWrap: "on",
            });
          }
          onAnnouncement("Editor ready. Screen-reader optimized mode active.", "info");
        }}
        onChange={(nextValue) => {
          const resolvedValue = nextValue ?? "";
          onCodeChange(resolvedValue);
          updateCombinedDiagnostics(monacoDiagnosticsRef.current, resolvedValue);
        }}
        onValidate={(markers) => {
          const mappedDiagnostics = toMonacoDiagnostics(
            markers as unknown as Array<Record<string, unknown>>
          );

          updateCombinedDiagnostics(mappedDiagnostics, code);

          if (mappedDiagnostics.length > 0) {
            const summary = summarizeDiagnostics(mappedDiagnostics);
            const severity = mappedDiagnostics.some(
              (diagnostic) => diagnostic.severity === "error"
            )
              ? "error"
              : "warning";

            onAnnouncement(summary, severity);
          }
        }}
        options={{
          tabSize: 2,
          automaticLayout: true,
          quickSuggestions: {
            comments: true,
            strings: true,
            other: true,
          },
        }}
      />
    </section>
  );
});
