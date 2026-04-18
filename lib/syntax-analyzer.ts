export type SyntaxSeverity = "error" | "warning";

export interface SyntaxIssue {
  line: number;
  column: number;
  message: string;
  severity: SyntaxSeverity;
  source?: string;
}

export interface CodeSymbol {
  name: string;
  type: "function" | "class" | "interface" | "variable" | "export";
  line: number;
}

interface MonacoMarkerLike {
  startLineNumber: number;
  startColumn: number;
  message: string;
  severity: number;
  source?: string;
}

const FUNCTION_REGEX = /^\s*(?:export\s+)?(?:async\s+)?function\s+([\w$]+)/;
const CLASS_REGEX = /^\s*(?:export\s+)?class\s+([\w$]+)/;
const INTERFACE_REGEX = /^\s*(?:export\s+)?interface\s+([\w$]+)/;
const CONST_FUNCTION_REGEX =
  /^\s*(?:export\s+)?(?:const|let|var)\s+([\w$]+)\s*=\s*(?:async\s+)?\(?[^=]*\)?\s*=>/;
const EXPORT_REGEX = /^\s*export\s+(?:default\s+)?(?:const|let|var|function|class|interface)?\s*([\w$]+)?/;

export function markersToIssues(markers: MonacoMarkerLike[]): SyntaxIssue[] {
  return markers
    .map((marker) => ({
      line: marker.startLineNumber,
      column: marker.startColumn,
      message: marker.message,
      severity: (marker.severity >= 8 ? "error" : "warning") as SyntaxSeverity,
      source: marker.source,
    }))
    .sort((a, b) => {
      if (a.line !== b.line) {
        return a.line - b.line;
      }

      return a.column - b.column;
    });
}

export function extractSymbols(code: string): CodeSymbol[] {
  const lines = code.split("\n");
  const symbols: CodeSymbol[] = [];

  lines.forEach((lineText, index) => {
    const line = index + 1;

    const classMatch = lineText.match(CLASS_REGEX);
    if (classMatch?.[1]) {
      symbols.push({ name: classMatch[1], type: "class", line });
      return;
    }

    const interfaceMatch = lineText.match(INTERFACE_REGEX);
    if (interfaceMatch?.[1]) {
      symbols.push({ name: interfaceMatch[1], type: "interface", line });
      return;
    }

    const functionMatch = lineText.match(FUNCTION_REGEX);
    if (functionMatch?.[1]) {
      symbols.push({ name: functionMatch[1], type: "function", line });
      return;
    }

    const constFunctionMatch = lineText.match(CONST_FUNCTION_REGEX);
    if (constFunctionMatch?.[1]) {
      symbols.push({ name: constFunctionMatch[1], type: "function", line });
      return;
    }

    const exportMatch = lineText.match(EXPORT_REGEX);
    if (exportMatch?.[1]) {
      symbols.push({ name: exportMatch[1], type: "export", line });
      return;
    }

    const variableMatch = lineText.match(/^\s*(?:const|let|var)\s+([\w$]+)/);
    if (variableMatch?.[1]) {
      symbols.push({ name: variableMatch[1], type: "variable", line });
    }
  });

  return symbols;
}

export function summarizeIssues(issues: SyntaxIssue[]): string {
  if (issues.length === 0) {
    return "No syntax issues detected.";
  }

  const errors = issues.filter((issue) => issue.severity === "error").length;
  const warnings = issues.length - errors;
  const parts: string[] = [];

  if (errors > 0) {
    parts.push(`${errors} error${errors === 1 ? "" : "s"}`);
  }

  if (warnings > 0) {
    parts.push(`${warnings} warning${warnings === 1 ? "" : "s"}`);
  }

  return `Detected ${parts.join(" and ")}.`;
}
