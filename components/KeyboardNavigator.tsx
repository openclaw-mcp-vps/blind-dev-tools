"use client";

import { useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { Button } from "@/components/ui/button";

type KeyboardNavigatorProps = {
  onNextIssue: () => void;
  onPreviousIssue: () => void;
  onFormat: () => void;
};

export function KeyboardNavigator({ onNextIssue, onPreviousIssue, onFormat }: KeyboardNavigatorProps) {
  const [open, setOpen] = useState(false);

  useHotkeys("ctrl+/", () => setOpen((value) => !value), { enableOnFormTags: true });
  useHotkeys("alt+n", onNextIssue, { enableOnFormTags: true });
  useHotkeys("alt+p", onPreviousIssue, { enableOnFormTags: true });
  useHotkeys("ctrl+shift+f", onFormat, { enableOnFormTags: true });

  const shortcuts = useMemo(
    () => [
      "Ctrl + /: Open keyboard help",
      "Alt + N: Jump to next syntax issue",
      "Alt + P: Jump to previous syntax issue",
      "Ctrl + Shift + F: Auto-format current file",
      "Ctrl + S: Save to browser storage",
    ],
    []
  );

  return (
    <section aria-label="Keyboard navigation" className="space-y-3">
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen((value) => !value)}>
        Keyboard Commands
      </Button>
      {open ? (
        <ul className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-sm">
          {shortcuts.map((shortcut) => (
            <li key={shortcut}>{shortcut}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
