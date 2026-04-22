"use client";

import { useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useFocusRing } from "react-aria";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { extractNavigableSymbols, type SymbolNode } from "@/lib/accessibility-engine";

interface CodeNavigatorProps {
  code: string;
  onJumpToLine: (line: number) => void;
  onAnnouncement: (message: string) => void;
}

function SymbolButton({
  symbol,
  active,
  onSelect,
}: {
  symbol: SymbolNode;
  active: boolean;
  onSelect: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const { focusProps, isFocusVisible } = useFocusRing();

  return (
    <button
      ref={buttonRef}
      {...focusProps}
      onClick={onSelect}
      className={cn(
        "flex w-full flex-col items-start gap-1 rounded-lg border border-transparent bg-background/40 px-3 py-2 text-left text-sm transition-colors hover:border-border hover:bg-background/70",
        active && "border-primary/40 bg-primary/10",
        isFocusVisible && "ring-2 ring-ring ring-offset-2 ring-offset-background"
      )}
    >
      <span className="font-medium">{symbol.name}</span>
      <span className="text-xs text-muted-foreground">
        {symbol.kind} on line {symbol.line}
      </span>
      <code className="line-clamp-1 text-xs text-muted-foreground">
        {symbol.preview}
      </code>
    </button>
  );
}

export default function CodeNavigator({
  code,
  onJumpToLine,
  onAnnouncement,
}: CodeNavigatorProps) {
  const [query, setQuery] = useState("");
  const [activeLine, setActiveLine] = useState<number | null>(null);

  const symbols = useMemo(() => extractNavigableSymbols(code), [code]);

  const filteredSymbols = useMemo(() => {
    if (!query.trim()) {
      return symbols;
    }

    const normalizedQuery = query.toLowerCase();
    return symbols.filter((symbol) => {
      return (
        symbol.name.toLowerCase().includes(normalizedQuery) ||
        symbol.kind.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query, symbols]);

  const hasSymbols = filteredSymbols.length > 0;

  return (
    <Card className="border-border/80 bg-card/90">
      <CardHeader>
        <CardTitle className="text-base">Semantic Navigator</CardTitle>
        <CardDescription>
          Jump by function, class, export, and interface without scanning visual
          gutters.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <label className="sr-only" htmlFor="code-navigator-search">
          Search symbols
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="code-navigator-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search symbols"
            className="w-full rounded-lg border border-input bg-background py-2 pr-3 pl-9 text-sm outline-none transition-colors focus:border-ring"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {filteredSymbols.length} symbols
          </span>
          <Badge variant="outline">Alt+Shift+J to focus</Badge>
        </div>

        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {hasSymbols ? (
            filteredSymbols.map((symbol) => (
              <SymbolButton
                key={`${symbol.name}-${symbol.line}`}
                symbol={symbol}
                active={activeLine === symbol.line}
                onSelect={() => {
                  setActiveLine(symbol.line);
                  onJumpToLine(symbol.line);
                  onAnnouncement(
                    `Jumped to ${symbol.kind} ${symbol.name} on line ${symbol.line}.`
                  );
                }}
              />
            ))
          ) : (
            <p className="rounded-lg border border-border/70 bg-background/40 p-3 text-sm text-muted-foreground">
              No matching symbols yet. Start by adding functions, classes, or
              exported constants.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
