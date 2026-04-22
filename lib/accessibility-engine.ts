export type DiagnosticSeverity = "error" | "warning" | "info";

export interface Diagnostic {
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  message: string;
  source?: string;
  code?: string | number;
  severity: DiagnosticSeverity;
}

export interface SymbolNode {
  name: string;
  kind: "function" | "class" | "interface" | "type" | "variable";
  line: number;
  preview: string;
}

const severityOrder: Record<DiagnosticSeverity, number> = {
  error: 0,
  warning: 1,
  info: 2,
};

export function sortDiagnostics(diagnostics: Diagnostic[]): Diagnostic[] {
  return [...diagnostics].sort((left, right) => {
    if (left.line !== right.line) {
      return left.line - right.line;
    }

    if (left.column !== right.column) {
      return left.column - right.column;
    }

    return severityOrder[left.severity] - severityOrder[right.severity];
  });
}

export function describeDiagnostic(diagnostic: Diagnostic): string {
  const source = diagnostic.source ? `${diagnostic.source}. ` : "";
  return `${diagnostic.severity} on line ${diagnostic.line}, column ${diagnostic.column}. ${source}${diagnostic.message}`;
}

export function summarizeDiagnostics(diagnostics: Diagnostic[]): string {
  if (diagnostics.length === 0) {
    return "No diagnostics detected. The workspace is clear.";
  }

  const counts = diagnostics.reduce(
    (memo, diagnostic) => {
      memo[diagnostic.severity] += 1;
      return memo;
    },
    { error: 0, warning: 0, info: 0 }
  );

  const parts = [
    `${counts.error} errors`,
    `${counts.warning} warnings`,
    `${counts.info} info notices`,
  ];

  const first = sortDiagnostics(diagnostics)[0];

  return `${parts.join(", ")}. First issue: ${describeDiagnostic(first)}`;
}

export function extractNavigableSymbols(code: string): SymbolNode[] {
  const symbols: SymbolNode[] = [];
  const lines = code.split("\n");

  lines.forEach((lineText, index) => {
    const line = index + 1;
    const trimmed = lineText.trim();

    const functionMatch =
      trimmed.match(/^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)/) ||
      trimmed.match(
        /^(?:export\s+)?const\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/
      );

    if (functionMatch) {
      symbols.push({
        name: functionMatch[1],
        kind: "function",
        line,
        preview: trimmed,
      });
      return;
    }

    const classMatch = trimmed.match(/^(?:export\s+)?class\s+([A-Za-z0-9_]+)/);
    if (classMatch) {
      symbols.push({
        name: classMatch[1],
        kind: "class",
        line,
        preview: trimmed,
      });
      return;
    }

    const interfaceMatch = trimmed.match(
      /^(?:export\s+)?interface\s+([A-Za-z0-9_]+)/
    );
    if (interfaceMatch) {
      symbols.push({
        name: interfaceMatch[1],
        kind: "interface",
        line,
        preview: trimmed,
      });
      return;
    }

    const typeMatch = trimmed.match(/^(?:export\s+)?type\s+([A-Za-z0-9_]+)/);
    if (typeMatch) {
      symbols.push({
        name: typeMatch[1],
        kind: "type",
        line,
        preview: trimmed,
      });
      return;
    }

    const variableMatch = trimmed.match(
      /^(?:export\s+)?(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=/
    );
    if (variableMatch) {
      symbols.push({
        name: variableMatch[1],
        kind: "variable",
        line,
        preview: trimmed,
      });
    }
  });

  return symbols;
}
