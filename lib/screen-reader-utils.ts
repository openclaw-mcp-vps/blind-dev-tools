import type { CodeSymbol, SyntaxIssue } from "@/lib/syntax-analyzer";

export const SCREEN_READER_SHORTCUTS = {
  nextSymbol: "Alt+N",
  previousSymbol: "Alt+P",
  nextError: "Alt+E",
  announceStatus: "Alt+S",
  openShortcutHelp: "Shift+/",
} as const;

export function sanitizeAnnouncement(message: string): string {
  return message.replace(/\s+/g, " ").trim();
}

export function buildEditorAriaLabel(fileName: string, language: string): string {
  return `${fileName} editor. Language ${language}. Screen reader optimized code editing enabled.`;
}

export function formatIssueForSpeech(issue: SyntaxIssue, index: number, total: number): string {
  return sanitizeAnnouncement(
    `Issue ${index + 1} of ${total}. ${issue.severity}. Line ${issue.line}, column ${issue.column}. ${issue.message}`,
  );
}

export function summarizeNavigatorTarget(symbol: CodeSymbol): string {
  return sanitizeAnnouncement(`${symbol.type} ${symbol.name} at line ${symbol.line}`);
}

export function createStatusAnnouncement(input: {
  cursorLine: number;
  totalLines: number;
  issueCount: number;
  symbolCount: number;
}): string {
  const issueText = input.issueCount === 0 ? "No syntax issues" : `${input.issueCount} syntax issues`;
  const symbolText = input.symbolCount === 0 ? "No symbols" : `${input.symbolCount} symbols indexed`;

  return sanitizeAnnouncement(
    `Cursor at line ${input.cursorLine} of ${input.totalLines}. ${issueText}. ${symbolText}.`,
  );
}
