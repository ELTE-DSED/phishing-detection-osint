"use client";

/**
 * Batch Analysis page — analyse up to 50 URLs at once with concurrent
 * processing, per-URL progress, and export to CSV / JSON.
 */

import { useCallback, useRef, useState } from "react";
import { Layers, StopCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageTransition } from "@/components/ui/pageTransition";
import { FadeIn } from "@/components/ui/animations";
import { BatchInput } from "@/components/analyze/batchInput";
import {
  BatchResults,
  type BatchEntry,
} from "@/components/analyze/batchResults";
import { analyzeUrl } from "@/lib/api/endpoints";
import { showError, showSuccess } from "@/lib/toast";

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const MAX_URLS = 50;
const CONCURRENCY = 3;

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function BatchAnalysisPage() {
  const [rawInput, setRawInput] = useState("");
  const [entries, setEntries] = useState<BatchEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  /* ---- Parse URLs from textarea ---------------------------------- */
  const urls = rawInput
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const validCount = Math.min(urls.length, MAX_URLS);
  const canSubmit = validCount > 0 && !isRunning;

  /* ---- Run batch analysis ---------------------------------------- */
  const handleRun = useCallback(async () => {
    const batch = urls.slice(0, MAX_URLS);
    const controller = new AbortController();
    abortRef.current = controller;

    const initial: BatchEntry[] = batch.map((url) => ({
      url,
      status: "pending",
    }));
    setEntries(initial);
    setIsRunning(true);

    // Process in chunks of CONCURRENCY
    let cancelled = false;

    for (let i = 0; i < batch.length; i += CONCURRENCY) {
      if (controller.signal.aborted) {
        cancelled = true;
        break;
      }

      const chunk = batch.slice(i, i + CONCURRENCY);
      const promises = chunk.map(async (url, j) => {
        const index = i + j;

        setEntries((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], status: "running" };
          return next;
        });

        try {
          const response = await analyzeUrl(
            { url },
            { signal: controller.signal },
          );
          setEntries((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], status: "done", response };
            return next;
          });
        } catch (err) {
          if (controller.signal.aborted) return;
          setEntries((prev) => {
            const next = [...prev];
            next[index] = {
              ...next[index],
              status: "error",
              error: err instanceof Error ? err.message : "Unknown error",
            };
            return next;
          });
        }
      });

      await Promise.allSettled(promises);
    }

    setIsRunning(false);
    abortRef.current = null;

    if (cancelled) {
      showError("Batch analysis cancelled.");
    } else {
      showSuccess(`Batch analysis complete — ${batch.length} URLs processed.`);
    }
  }, [urls]);

  /* ---- Cancel ---------------------------------------------------- */
  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  /* ---- Progress -------------------------------------------------- */
  const completedCount = entries.filter(
    (e) => e.status === "done" || e.status === "error",
  ).length;
  const progressPct =
    entries.length > 0 ? (completedCount / entries.length) * 100 : 0;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center gap-3">
            <div className="rounded-full border bg-muted p-3">
              <Layers className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Batch Analysis
              </h1>
              <p className="text-muted-foreground">
                Analyse up to {MAX_URLS} URLs at once with parallel processing.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* URL Input */}
        <FadeIn delay={0.05}>
          <BatchInput
            value={rawInput}
            onChange={setRawInput}
            disabled={isRunning}
          />
        </FadeIn>

        {/* Controls */}
        <FadeIn delay={0.1}>
          <div className="flex items-center gap-3">
            {!isRunning ? (
              <Button onClick={handleRun} disabled={!canSubmit} size="lg">
                <Play className="mr-2 h-4 w-4" aria-hidden="true" />
                Analyse {validCount} URL{validCount !== 1 ? "s" : ""}
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleCancel}
                size="lg"
              >
                <StopCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                Cancel
              </Button>
            )}

            {isRunning && (
              <div className="flex-1 space-y-1">
                <Progress value={progressPct} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {completedCount} / {entries.length} completed
                </p>
              </div>
            )}
          </div>
        </FadeIn>

        {/* Results table */}
        {entries.length > 0 && (
          <FadeIn delay={0.15}>
            <BatchResults entries={entries} />
          </FadeIn>
        )}
      </div>
    </PageTransition>
  );
}
