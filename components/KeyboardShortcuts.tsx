"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { X } from "lucide-react";
import { SCREEN_READER_SHORTCUTS } from "@/lib/screen-reader-utils";

interface KeyboardShortcutsProps {
  onNextSymbol: () => void;
  onPreviousSymbol: () => void;
  onNextError: () => void;
  onAnnounceStatus: () => void;
}

const shortcuts = [
  { keys: SCREEN_READER_SHORTCUTS.nextSymbol, label: "Go to next symbol" },
  { keys: SCREEN_READER_SHORTCUTS.previousSymbol, label: "Go to previous symbol" },
  { keys: SCREEN_READER_SHORTCUTS.nextError, label: "Jump to next syntax issue" },
  { keys: SCREEN_READER_SHORTCUTS.announceStatus, label: "Read current editor status" },
  { keys: SCREEN_READER_SHORTCUTS.openShortcutHelp, label: "Open this shortcuts dialog" },
];

export default function KeyboardShortcuts({
  onNextSymbol,
  onPreviousSymbol,
  onNextError,
  onAnnounceStatus,
}: KeyboardShortcutsProps) {
  const [open, setOpen] = useState(false);

  useHotkeys("alt+n", onNextSymbol, { preventDefault: true, enableOnFormTags: false });
  useHotkeys("alt+p", onPreviousSymbol, { preventDefault: true, enableOnFormTags: false });
  useHotkeys("alt+e", onNextError, { preventDefault: true, enableOnFormTags: false });
  useHotkeys("alt+s", onAnnounceStatus, { preventDefault: true, enableOnFormTags: false });
  useHotkeys("shift+/", () => setOpen(true), { preventDefault: true, enableOnFormTags: true });

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="rounded-md border border-white/15 bg-[#151b23] px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
        >
          Keyboard Shortcuts (Shift+/)
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/15 bg-[#0d1117] p-5 text-slate-100 shadow-xl focus:outline-none">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold">Editor Keyboard Commands</Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded p-1 text-slate-300 hover:bg-white/10 hover:text-white"
                aria-label="Close keyboard shortcuts"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="mt-1 text-sm text-slate-300">
            Commands are optimized for NVDA, JAWS, and VoiceOver to keep your hands on the keyboard.
          </Dialog.Description>

          <ul className="mt-4 space-y-2">
            {shortcuts.map((shortcut) => (
              <li
                key={shortcut.keys}
                className="flex items-center justify-between rounded-md border border-white/10 bg-[#151b23] px-3 py-2"
              >
                <span className="text-sm text-slate-100">{shortcut.label}</span>
                <kbd className="rounded border border-white/20 bg-black/40 px-2 py-1 text-xs text-cyan-200">
                  {shortcut.keys}
                </kbd>
              </li>
            ))}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
