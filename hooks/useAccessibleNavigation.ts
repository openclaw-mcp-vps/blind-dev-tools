"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CodeSymbol } from "@/lib/syntax-analyzer";

export function useAccessibleNavigation(symbols: CodeSymbol[]) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (symbols.length === 0) {
      setActiveIndex(0);
      return;
    }

    if (activeIndex >= symbols.length) {
      setActiveIndex(symbols.length - 1);
    }
  }, [activeIndex, symbols]);

  const activeSymbol = useMemo(() => symbols[activeIndex] ?? null, [activeIndex, symbols]);

  const selectIndex = useCallback(
    (index: number) => {
      if (symbols.length === 0) {
        return null;
      }

      const bounded = Math.max(0, Math.min(index, symbols.length - 1));
      setActiveIndex(bounded);
      return symbols[bounded];
    },
    [symbols],
  );

  const selectNext = useCallback(() => {
    if (symbols.length === 0) {
      return null;
    }

    const next = (activeIndex + 1) % symbols.length;
    setActiveIndex(next);
    return symbols[next];
  }, [activeIndex, symbols]);

  const selectPrevious = useCallback(() => {
    if (symbols.length === 0) {
      return null;
    }

    const previous = (activeIndex - 1 + symbols.length) % symbols.length;
    setActiveIndex(previous);
    return symbols[previous];
  }, [activeIndex, symbols]);

  return {
    activeIndex,
    activeSymbol,
    hasSymbols: symbols.length > 0,
    selectIndex,
    selectNext,
    selectPrevious,
  };
}
