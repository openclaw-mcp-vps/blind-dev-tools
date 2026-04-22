import { sortDiagnostics, type Diagnostic } from "@/lib/accessibility-engine";

const matchingPairs: Record<string, string> = {
  "(": ")",
  "[": "]",
  "{": "}",
};

export function analyzeSyntaxHeuristics(code: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const lines = code.split("\n");
  const stack: Array<{ char: string; line: number; column: number }> = [];

  let inString: "single" | "double" | "template" | null = null;
  let escaped = false;

  lines.forEach((lineText, lineIndex) => {
    const line = lineIndex + 1;

    if (lineText.length > 140) {
      diagnostics.push({
        severity: "warning",
        line,
        column: 1,
        message:
          "Line exceeds 140 characters. Consider wrapping for easier spoken review.",
        source: "Accessibility",
      });
    }

    if (/^(\t+ +| +\t+)/.test(lineText)) {
      diagnostics.push({
        severity: "warning",
        line,
        column: 1,
        message: "Mixed tabs and spaces detected at line start.",
        source: "Accessibility",
      });
    }

    if (/\b(?:TODO|FIXME|HACK)\b/.test(lineText)) {
      diagnostics.push({
        severity: "info",
        line,
        column: Math.max(1, lineText.search(/\b(?:TODO|FIXME|HACK)\b/) + 1),
        message:
          "Action marker found (TODO/FIXME/HACK). Confirm this is intentional before release.",
        source: "Heuristic",
      });
    }

    for (let columnIndex = 0; columnIndex < lineText.length; columnIndex += 1) {
      const char = lineText[columnIndex];
      const column = columnIndex + 1;

      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }

        if (char === "\\") {
          escaped = true;
          continue;
        }

        if (
          (inString === "single" && char === "'") ||
          (inString === "double" && char === '"') ||
          (inString === "template" && char === "`")
        ) {
          inString = null;
        }

        continue;
      }

      if (char === "'") {
        inString = "single";
        continue;
      }

      if (char === '"') {
        inString = "double";
        continue;
      }

      if (char === "`") {
        inString = "template";
        continue;
      }

      if (char in matchingPairs) {
        stack.push({ char, line, column });
        continue;
      }

      if (Object.values(matchingPairs).includes(char)) {
        const opener = stack.pop();

        if (!opener) {
          diagnostics.push({
            severity: "error",
            line,
            column,
            message: `Unmatched closing delimiter ${char}.`,
            source: "Syntax heuristic",
          });
          continue;
        }

        const expectedCloser = matchingPairs[opener.char];
        if (expectedCloser !== char) {
          diagnostics.push({
            severity: "error",
            line,
            column,
            message: `Mismatched delimiter. Expected ${expectedCloser} to close ${opener.char}.`,
            source: "Syntax heuristic",
          });
        }
      }
    }
  });

  if (inString) {
    diagnostics.push({
      severity: "error",
      line: lines.length,
      column: Math.max(1, lines.at(-1)?.length ?? 1),
      message: "Unterminated string literal detected.",
      source: "Syntax heuristic",
    });
  }

  stack.forEach((unclosed) => {
    diagnostics.push({
      severity: "error",
      line: unclosed.line,
      column: unclosed.column,
      message: `Unclosed delimiter ${unclosed.char}.`,
      source: "Syntax heuristic",
    });
  });

  return sortDiagnostics(diagnostics);
}
