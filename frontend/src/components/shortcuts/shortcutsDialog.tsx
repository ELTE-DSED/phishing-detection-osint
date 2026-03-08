"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";
import { SHORTCUTS } from "@/hooks/useKeyboardShortcuts";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
}

/** Replace "Ctrl" with "⌘" on macOS. */
function formatLabel(label: string): string {
  if (isMac()) return label.replace("Ctrl", "⌘");
  return label;
}

/* ------------------------------------------------------------------ */
/*  Kbd                                                               */
/* ------------------------------------------------------------------ */

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex min-w-[1.75rem] items-center justify-center rounded-md border border-border bg-muted px-1.5 py-0.5 text-xs font-mono font-medium text-muted-foreground">
      {children}
    </kbd>
  );
}

/** Render a label like "Ctrl+Shift+D" as individual <Kbd> badges. */
function KeyCombo({ label }: { label: string }) {
  const formatted = formatLabel(label);
  const parts = formatted.split("+");

  return (
    <span className="inline-flex items-center gap-0.5">
      {parts.map((part, i) => (
        <span key={part} className="inline-flex items-center gap-0.5">
          {i > 0 && <span className="text-muted-foreground text-xs">+</span>}
          <Kbd>{part}</Kbd>
        </span>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  ShortcutsDialog                                                   */
/* ------------------------------------------------------------------ */

interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShortcutsDialog({ open, onOpenChange }: ShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" aria-hidden="true" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate faster.
          </DialogDescription>
        </DialogHeader>

        <ul className="grid gap-2" role="list">
          {SHORTCUTS.map((shortcut) => (
            <li
              key={shortcut.key + (shortcut.ctrl ? "ctrl" : "")}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
            >
              <span className="text-foreground">{shortcut.description}</span>
              <KeyCombo label={shortcut.label} />
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
