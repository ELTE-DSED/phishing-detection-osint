"use client";

/**
 * KeyboardShortcutsProvider — mounts the global keyboard listener
 * and renders the shortcuts help dialog.
 */

import { useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { ShortcutsDialog } from "@/components/shortcuts";

export function KeyboardShortcutsProvider() {
  const [helpOpen, setHelpOpen] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  const toggleHelp = useCallback(() => {
    setHelpOpen((prev) => !prev);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  useKeyboardShortcuts({
    onToggleHelp: toggleHelp,
    onToggleTheme: toggleTheme,
  });

  return (
    <ShortcutsDialog open={helpOpen} onOpenChange={setHelpOpen} />
  );
}
