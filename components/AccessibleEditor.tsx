"use client";

import Editor, { type OnChange, type OnMount, useMonaco } from "@monaco-editor/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AudioFeedback } from "@/components/AudioFeedback";
import { KeyboardNavigator } from "@/components/KeyboardNavigator";
import { SyntaxAnnouncer } from "@/components/SyntaxAnnouncer";
import { Button } from "@/components/ui/button";
import {
  buildSyntaxAnnouncement,
  countWords,
  formatLineAnnouncement,
  getAccessibilityHint,
} from "@/lib/screen-reader-utils";

type MarkerShape = {
  message: string;
  startLineNumber: number;
  startColumn: number;
  severity: number;
};

const DEFAULT_CODE = `function calculateTotal(items: {price: number, qty: number}[]) {
  return items.reduce((total, item) => total + item.price * item.qty, 0)
}

console.log(calculateTotal([{ price: 15, qty: 2 }, { price: 8, qty: 1 }]));
`;

export function AccessibleEditor() {
  const monaco = useMonaco();
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const [value, setValue] = useState(DEFAULT_CODE);
  const [announcement, setAnnouncement] = useState("Editor ready. Start typing to hear syntax feedback.");
  const [markers, setMarkers] = useState<MarkerShape[]>([]);
  const [markerIndex, setMarkerIndex] = useState(0);
  const [savedNotice, setSavedNotice] = useState("");

  useEffect(() => {
    const cached = window.localStorage.getItem("blind-dev-tools:code");
    if (cached) {
      setValue(cached);
      setAnnouncement("Recovered your previous code draft from local storage.");
    }
  }, []);

  useEffect(() => {
    if (!monaco || !editorRef.current) {
      return;
    }

    const model = editorRef.current.getModel();
    if (!model) {
      return;
    }

    const sub = monaco.editor.onDidChangeMarkers(() => {
      const next = monaco.editor.getModelMarkers({ resource: model.uri });
      const shaped = next.map((marker) => ({
        message: marker.message,
        startLineNumber: marker.startLineNumber,
        startColumn: marker.startColumn,
        severity: marker.severity,
      }));

      setMarkers(shaped);
      if (shaped.length > 0) {
        const first = shaped[0];
        setAnnouncement(buildSyntaxAnnouncement(first.message, first.startLineNumber, first.startColumn));
      } else {
        setAnnouncement("No syntax issues detected.");
      }
    });

    return () => sub.dispose();
  }, [monaco]);

  const handleEditorMount = useCallback<OnMount>((editorInstance) => {
    editorRef.current = editorInstance;
    editorInstance.focus();
  }, []);

  const handleCodeChange = useCallback<NonNullable<OnChange>>((nextValue, event) => {
    const updated = nextValue ?? "";
    setValue(updated);

    if (event && "changes" in event && event.changes.length > 0) {
      const change = event.changes[0];
      setAnnouncement(formatLineAnnouncement(change.range.startLineNumber, change.range.startColumn));
    }
  }, []);

  const jumpToMarker = useCallback(
    (direction: "next" | "previous") => {
      if (!editorRef.current || markers.length === 0) {
        setAnnouncement("No syntax issues to navigate.");
        return;
      }

      const nextIndex =
        direction === "next"
          ? (markerIndex + 1) % markers.length
          : (markerIndex - 1 + markers.length) % markers.length;

      setMarkerIndex(nextIndex);
      const marker = markers[nextIndex];
      editorRef.current.revealPositionInCenter({
        lineNumber: marker.startLineNumber,
        column: marker.startColumn,
      });
      editorRef.current.setPosition({
        lineNumber: marker.startLineNumber,
        column: marker.startColumn,
      });
      setAnnouncement(buildSyntaxAnnouncement(marker.message, marker.startLineNumber, marker.startColumn));
    },
    [markerIndex, markers]
  );

  const formatDocument = useCallback(() => {
    if (!editorRef.current) {
      return;
    }
    void editorRef.current.getAction("editor.action.formatDocument")?.run();
    setAnnouncement("Formatting complete.");
  }, []);

  const saveDraft = useCallback(() => {
    window.localStorage.setItem("blind-dev-tools:code", value);
    setSavedNotice("Saved to browser storage.");
    setAnnouncement("Draft saved successfully.");
    setTimeout(() => setSavedNotice(""), 2500);
  }, [value]);

  const summary = useMemo(() => {
    return {
      lines: value.split("\n").length,
      words: countWords(value),
      issues: markers.length,
    };
  }, [value, markers.length]);

  const hasError = markers.some((marker) => marker.severity >= 8);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Accessible Code Workspace</h1>
        <p className="text-[var(--muted)]">{getAccessibilityHint()}</p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={saveDraft}>
          Save Draft
        </Button>
        <p className="text-sm text-[var(--muted)]">{savedNotice || `${summary.lines} lines, ${summary.words} words, ${summary.issues} syntax issues`}</p>
      </div>

      <AudioFeedback latestAnnouncement={announcement} hasError={hasError} />

      <KeyboardNavigator
        onNextIssue={() => jumpToMarker("next")}
        onPreviousIssue={() => jumpToMarker("previous")}
        onFormat={formatDocument}
      />

      <section className="rounded-lg border border-[var(--border)] bg-black/20 p-2" aria-label="Code editor">
        <Editor
          theme="vs-dark"
          language="typescript"
          value={value}
          onChange={handleCodeChange}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false },
            fontSize: 16,
            lineHeight: 24,
            wordWrap: "on",
            scrollBeyondLastLine: false,
            tabSize: 2,
            renderLineHighlight: "all",
            accessibilitySupport: "on",
            quickSuggestions: true,
            ariaLabel: "Screen reader optimized TypeScript editor",
          }}
          height="500px"
        />
      </section>

      <SyntaxAnnouncer message={announcement} />
    </div>
  );
}
