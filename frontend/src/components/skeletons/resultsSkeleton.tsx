/**
 * ResultsSkeleton — loading placeholder for the results page.
 *
 * Mimics the layout of VerdictBanner, charts, reasons, and OSINT
 * cards so the UI feels responsive while data loads.
 */

import { Skeleton } from "@/components/ui/skeleton";

export function ResultsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Verdict banner skeleton */}
      <div className="rounded-xl border p-6 space-y-3">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Score breakdown donut */}
        <div className="rounded-xl border p-4 space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mx-auto h-[180px] w-[180px] rounded-full" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        {/* Threat gauge */}
        <div className="rounded-xl border p-4 space-y-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mx-auto h-[120px] w-[220px] rounded-t-full" />
          <div className="flex flex-col items-center gap-1">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* Confidence bar */}
        <div className="rounded-xl border p-4 space-y-3">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-full rounded-full" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>

      {/* Reasons list */}
      <div className="rounded-xl border p-4 space-y-3">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>

      {/* OSINT cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-28" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
