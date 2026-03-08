"use client";

/**
 * useKeyboardShortcuts — registers global keyboard shortcuts.
 *
 * Shortcuts are disabled when the user is typing in an input, textarea,
 * select, or contentEditable element to avoid conflicts.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/* ------------------------------------------------------------------ */
/*  Shortcut definitions                                              */
/* ------------------------------------------------------------------ */

export interface Shortcut {
  /** Human-readable key label (e.g. "Ctrl+K"). */
  label: string;
  /** Description shown in the help dialog. */
  description: string;
  /** Key to listen for (KeyboardEvent.key). */
  key: string;
  /** Requires Ctrl (or Cmd on Mac). */
  ctrl?: boolean;
  /** Requires Shift. */
  shift?: boolean;
}

export const SHORTCUTS: Shortcut[] = [
  { label: "/", description: "Focus search / URL input", key: "/" },
  { label: "Ctrl+Enter", description: "Submit analysis form", key: "Enter", ctrl: true },
  { label: "Ctrl+Shift+D", description: "Toggle dark mode", key: "D", shift: true, ctrl: true },
  { label: "Ctrl+H", description: "Go to History", key: "h", ctrl: true },
  { label: "Ctrl+N", description: "New analysis", key: "n", ctrl: true },
  { label: "?", description: "Show keyboard shortcuts", key: "?" },
  { label: "Escape", description: "Close dialogs", key: "Escape" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function isTyping(e: KeyboardEvent): boolean {
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if ((e.target as HTMLElement)?.isContentEditable) return true;
  return false;
}

/* ------------------------------------------------------------------ */
/*  Hook                                                              */
/* ------------------------------------------------------------------ */

interface UseKeyboardShortcutsOptions {
  onToggleHelp: () => void;
  onToggleTheme?: () => void;
}

export function useKeyboardShortcuts({
  onToggleHelp,
  onToggleTheme,
}: UseKeyboardShortcutsOptions) {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey;

      /* "?" — show shortcuts dialog (not when typing) */
      if (e.key === "?" && !isTyping(e)) {
        e.preventDefault();
        onToggleHelp();
        return;
      }

      /* "/" — focus URL input (not when typing) */
      if (e.key === "/" && !ctrl && !isTyping(e)) {
        e.preventDefault();
        const input =
          document.getElementById("content") ??
          document.querySelector<HTMLInputElement>("[data-slot='input']");
        input?.focus();
        return;
      }

      /* Ctrl+Enter — submit analysis form */
      if (e.key === "Enter" && ctrl) {
        e.preventDefault();
        const submitButton = document.querySelector<HTMLButtonElement>(
          "button:not([disabled])",
        );
        if (submitButton?.textContent?.includes("Analyse")) {
          submitButton.click();
        }
        return;
      }

      /* Ctrl+Shift+D — toggle dark mode */
      if (e.key === "D" && ctrl && e.shiftKey) {
        e.preventDefault();
        onToggleTheme?.();
        return;
      }

      /* Ctrl+H — go to history */
      if (e.key === "h" && ctrl && !e.shiftKey) {
        e.preventDefault();
        router.push("/history");
        return;
      }

      /* Ctrl+N — new analysis */
      if (e.key === "n" && ctrl && !e.shiftKey) {
        e.preventDefault();
        router.push("/analyze");
        return;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router, onToggleHelp, onToggleTheme]);
}
