export function formatLineAnnouncement(line: number, column: number) {
  return `Line ${line}, column ${column}`;
}

export function buildSyntaxAnnouncement(message: string, line?: number, column?: number) {
  if (!line || !column) {
    return `Syntax issue: ${message}`;
  }

  return `Syntax issue on line ${line}, column ${column}. ${message}`;
}

export function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function getAccessibilityHint() {
  return "Use Control plus slash to open keyboard shortcuts, Alt plus N for next syntax issue, and Alt plus P for previous syntax issue.";
}
