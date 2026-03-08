/**
 * Global loading fallback — rendered by Next.js while a route
 * segment is loading.  Shows an animated shield spinner.
 */

import { Shield } from "lucide-react";

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="flex min-h-screen items-center justify-center"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Animated shield — pulse + slow spin */}
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <Shield className="relative h-12 w-12 animate-pulse text-primary" />
        </div>
        <div className="space-y-1 text-center">
          <p className="text-sm font-medium text-foreground">Loading…</p>
          <p className="text-xs text-muted-foreground">
            Preparing your workspace
          </p>
        </div>
      </div>
    </div>
  );
}
