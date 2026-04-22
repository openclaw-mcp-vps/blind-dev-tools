export type ShortcutCategory = "Navigation" | "Diagnostics" | "Audio";

export interface ShortcutDefinition {
  keys: string;
  description: string;
  category: ShortcutCategory;
}

export const KEYBOARD_SHORTCUTS: ShortcutDefinition[] = [
  {
    keys: "Alt+Shift+J",
    description: "Focus semantic code navigator",
    category: "Navigation",
  },
  {
    keys: "Alt+Shift+[",
    description: "Jump to previous diagnostic",
    category: "Navigation",
  },
  {
    keys: "Alt+Shift+]",
    description: "Jump to next diagnostic",
    category: "Navigation",
  },
  {
    keys: "Alt+Shift+E",
    description: "Read diagnostics summary",
    category: "Diagnostics",
  },
  {
    keys: "Alt+Shift+1",
    description: "Announce workspace status",
    category: "Diagnostics",
  },
  {
    keys: "Alt+Shift+S",
    description: "Toggle speech output",
    category: "Audio",
  },
];

export function shortcutToAriaLabel(shortcut: string): string {
  return shortcut.replaceAll("+", " plus ");
}
