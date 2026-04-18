"use client";

import Editor, { type OnMount } from "@monaco-editor/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AudioFeedback from "@/components/AudioFeedback";
import CodeNavigator from "@/components/CodeNavigator";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import { useAccessibleNavigation } from "@/hooks/useAccessibleNavigation";
import { useAudioFeedback } from "@/hooks/useAudioFeedback";
import {
  buildEditorAriaLabel,
  createStatusAnnouncement,
  formatIssueForSpeech,
  summarizeNavigatorTarget,
} from "@/lib/screen-reader-utils";
import { extractSymbols, markersToIssues, summarizeIssues, type SyntaxIssue } from "@/lib/syntax-analyzer";

const starterCode = `interface CompileResult {
  errors: string[];
  warnings: string[];
}

export async function compileProject(source: string): Promise<CompileResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!source.includes("export")) {
    warnings.push("No exports found in module");
  }

  if (source.trim().length === 0) {
    errors.push("Source cannot be empty");
  }

  return { errors, warnings };
}

const runAnalysis = async () => {
  const result = await compileProject("export const value = 42;");
  console.log(result);
};

runAnalysis();
`;

type EditorInstance = Parameters<OnMount>[0];
type MonacoNamespace = Parameters<OnMount>[1];

export default function AccessibleEditor() {
  const [code, setCode] = useState(starterCode);
  const [issues, setIssues] = useState<SyntaxIssue[]>([]);
  const [cursorLine, setCursorLine] = useState(1);
  const [statusMessage, setStatusMessage] = useState("Editor loaded. Start typing to hear diagnostics.");
  const [errorIndex, setErrorIndex] = useState(-1);

  const editorRef = useRef<EditorInstance | null>(null);
  const monacoRef = useRef<MonacoNamespace | null>(null);
  const markerSubscriptionRef = useRef<{ dispose: () => void } | null>(null);
  const cursorSubscriptionRef = useRef<{ dispose: () => void } | null>(null);

  const symbols = useMemo(() => extractSymbols(code), [code]);
  const navigation = useAccessibleNavigation(symbols);
  const audio = useAudioFeedback({ issues });

  const lineCount = useMemo(() => code.split("\n").length, [code]);

  const moveCursorTo = useCallback((line: number, column = 1) => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    editor.revealLineInCenter(line);
    editor.setPosition({ lineNumber: line, column });
    editor.focus();
  }, []);

  const jumpToSymbol = useCallback(
    (index: number) => {
      const symbol = navigation.selectIndex(index);
      if (!symbol) {
        audio.announce("No symbols available.");
        return;
      }

      moveCursorTo(symbol.line);
      const message = `Jumped to ${summarizeNavigatorTarget(symbol)}.`;
      setStatusMessage(message);
      audio.announce(message);
    },
    [audio, moveCursorTo, navigation],
  );

  const jumpToNextSymbol = useCallback(() => {
    const symbol = navigation.selectNext();
    if (!symbol) {
      audio.announce("No symbols available.");
      return;
    }

    moveCursorTo(symbol.line);
    const message = `Next symbol. ${summarizeNavigatorTarget(symbol)}.`;
    setStatusMessage(message);
    audio.announce(message);
  }, [audio, moveCursorTo, navigation]);

  const jumpToPreviousSymbol = useCallback(() => {
    const symbol = navigation.selectPrevious();
    if (!symbol) {
      audio.announce("No symbols available.");
      return;
    }

    moveCursorTo(symbol.line);
    const message = `Previous symbol. ${summarizeNavigatorTarget(symbol)}.`;
    setStatusMessage(message);
    audio.announce(message);
  }, [audio, moveCursorTo, navigation]);

  const jumpToNextIssue = useCallback(() => {
    if (issues.length === 0) {
      audio.announce("No syntax issues detected.");
      return;
    }

    const nextIndex = (errorIndex + 1) % issues.length;
    const issue = issues[nextIndex];
    setErrorIndex(nextIndex);
    moveCursorTo(issue.line, issue.column);

    const message = formatIssueForSpeech(issue, nextIndex, issues.length);
    setStatusMessage(message);
    audio.announce(message);
  }, [audio, errorIndex, issues, moveCursorTo]);

  const announceStatus = useCallback(() => {
    const message = createStatusAnnouncement({
      cursorLine,
      totalLines: lineCount,
      issueCount: issues.length,
      symbolCount: symbols.length,
    });

    setStatusMessage(message);
    audio.announce(message);
  }, [audio, cursorLine, issues.length, lineCount, symbols.length]);

  const refreshDiagnostics = useCallback(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    if (!editor || !monaco) {
      return;
    }

    const model = editor.getModel();
    if (!model) {
      return;
    }

    const markers = monaco.editor.getModelMarkers({ resource: model.uri });
    const parsedIssues = markersToIssues(markers);
    setIssues(parsedIssues);
    setStatusMessage(summarizeIssues(parsedIssues));
  }, []);

  const handleMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      editor.updateOptions({
        accessibilitySupport: "on",
        ariaLabel: buildEditorAriaLabel("workspace.ts", "TypeScript"),
        glyphMargin: false,
        lineNumbersMinChars: 3,
        minimap: { enabled: false },
        quickSuggestions: false,
        renderLineHighlight: "line",
        smoothScrolling: true,
        tabSize: 2,
        wordWrap: "on",
      });

      cursorSubscriptionRef.current = editor.onDidChangeCursorPosition((event) => {
        setCursorLine(event.position.lineNumber);
      });

      markerSubscriptionRef.current = monaco.editor.onDidChangeMarkers(() => {
        refreshDiagnostics();
      });

      refreshDiagnostics();
      setStatusMessage("Editor ready. Use Alt+N and Alt+P to navigate symbols.");
    },
    [refreshDiagnostics],
  );

  useEffect(() => {
    return () => {
      markerSubscriptionRef.current?.dispose();
      cursorSubscriptionRef.current?.dispose();
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold text-white">Blind Dev Tools Workspace</h1>
        <KeyboardShortcuts
          onNextSymbol={jumpToNextSymbol}
          onPreviousSymbol={jumpToPreviousSymbol}
          onNextError={jumpToNextIssue}
          onAnnounceStatus={announceStatus}
        />
      </div>

      <p className="text-sm text-slate-300">
        Keyboard-first coding with semantic navigation and spoken diagnostics. Shortcuts: Alt+N next symbol, Alt+P
        previous symbol, Alt+E next syntax issue, Alt+S status readout.
      </p>

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-4">
          <CodeNavigator
            symbols={symbols}
            activeIndex={navigation.activeIndex}
            onJumpToIndex={jumpToSymbol}
            onNext={jumpToNextSymbol}
            onPrevious={jumpToPreviousSymbol}
          />

          <AudioFeedback
            enabled={audio.enabled}
            speechRate={audio.speechRate}
            voiceMode={audio.voiceMode}
            onEnabledChange={audio.setEnabled}
            onSpeechRateChange={audio.setSpeechRate}
            onVoiceModeChange={audio.setVoiceMode}
            onTestAnnouncement={() => {
              audio.announce("Audio feedback test successful.");
              void audio.playSuccess();
            }}
          />
        </div>

        <section className="rounded-xl border border-white/10 bg-[#151b23] p-3" aria-label="Code editor panel">
          <Editor
            height="66vh"
            defaultLanguage="typescript"
            value={code}
            onMount={handleMount}
            onChange={(value) => setCode(value ?? "")}
            theme="vs-dark"
            options={{
              automaticLayout: true,
              fontSize: 15,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            }}
          />
        </section>
      </div>

      <section className="rounded-xl border border-white/10 bg-[#151b23] px-4 py-3 text-sm text-slate-200" aria-live="polite">
        <p className="font-medium text-white">Live status</p>
        <p className="mt-1">{statusMessage}</p>
      </section>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {statusMessage}
      </div>
    </div>
  );
}
