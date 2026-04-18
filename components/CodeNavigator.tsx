"use client";

import type { CodeSymbol } from "@/lib/syntax-analyzer";

interface CodeNavigatorProps {
  symbols: CodeSymbol[];
  activeIndex: number;
  onJumpToIndex: (index: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function CodeNavigator({
  symbols,
  activeIndex,
  onJumpToIndex,
  onNext,
  onPrevious,
}: CodeNavigatorProps) {
  return (
    <aside
      className="rounded-xl border border-white/10 bg-[#151b23] p-4"
      aria-labelledby="code-navigator-heading"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="code-navigator-heading" className="text-sm font-semibold text-white">
          Semantic Code Navigator
        </h2>
        <span className="text-xs text-slate-400">{symbols.length} symbols</span>
      </div>
      <p className="mt-1 text-sm text-slate-300">
        Jump by function, class, and interface without scanning visually.
      </p>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onPrevious}
          className="rounded border border-white/15 px-2 py-1 text-xs text-slate-200 hover:bg-white/10"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded border border-white/15 px-2 py-1 text-xs text-slate-200 hover:bg-white/10"
        >
          Next
        </button>
      </div>

      <ul className="mt-3 max-h-[340px] space-y-1 overflow-auto pr-1" aria-label="Code symbols">
        {symbols.length === 0 ? (
          <li className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-400">
            No symbols detected. Add functions or classes to populate navigator.
          </li>
        ) : (
          symbols.map((symbol, index) => {
            const active = index === activeIndex;
            return (
              <li key={`${symbol.type}-${symbol.name}-${symbol.line}`}>
                <button
                  type="button"
                  onClick={() => onJumpToIndex(index)}
                  className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                    active
                      ? "border-cyan-400/50 bg-cyan-500/10 text-cyan-100"
                      : "border-white/10 bg-transparent text-slate-200 hover:bg-white/10"
                  }`}
                  aria-current={active ? "true" : undefined}
                  aria-label={`${symbol.type} ${symbol.name}, line ${symbol.line}`}
                >
                  <div className="font-medium">{symbol.name}</div>
                  <div className="text-xs opacity-80">
                    {symbol.type} • line {symbol.line}
                  </div>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
}
