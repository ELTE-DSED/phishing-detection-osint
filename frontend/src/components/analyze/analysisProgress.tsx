"use client";

/**
 * AnalysisProgress — animated step progress bar displayed while an
 * analysis request is in flight.
 *
 * Shows five labelled stages with a time-based simulation, each step
 * advancing automatically.  The component auto-completes the last step
 * when the `isComplete` prop becomes `true`.
 */

import { useEffect, useState } from "react";
import {
  Link,
  Globe,
  Brain,
  Calculator,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Step definitions                                                  */
/* ------------------------------------------------------------------ */

interface ProgressStep {
  label: string;
  icon: React.ElementType;
  durationMs: number;
}

const STEPS: ProgressStep[] = [
  { label: "Extracting URL features…", icon: Link, durationMs: 1_200 },
  { label: "Running OSINT checks…", icon: Globe, durationMs: 2_400 },
  { label: "Analysing text with NLP…", icon: Brain, durationMs: 1_800 },
  { label: "Calculating final score…", icon: Calculator, durationMs: 1_000 },
  { label: "Analysis complete!", icon: CheckCircle2, durationMs: 500 },
];

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */

interface AnalysisProgressProps {
  /** Whether the real API call has finished. Jumps to 100% when true. */
  isComplete: boolean;
  /** Called after the final step finishes its mini-delay. */
  onFinished?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function AnalysisProgress({
  isComplete,
  onFinished,
}: AnalysisProgressProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  /* Advance through simulated steps on timers */
  useEffect(() => {
    if (isComplete) {
      const frame = requestAnimationFrame(() => {
        setActiveStep(STEPS.length - 1);
        setProgress(100);
      });
      const id = setTimeout(() => onFinished?.(), 600);
      return () => {
        cancelAnimationFrame(frame);
        clearTimeout(id);
      };
    }

    /* Don't advance past step 3 (penultimate) until real result */
    if (activeStep >= STEPS.length - 2) return;

    const step = STEPS[activeStep];
    const id = setTimeout(() => {
      setActiveStep((s) => s + 1);
    }, step.durationMs);

    return () => clearTimeout(id);
  }, [activeStep, isComplete, onFinished]);

  /* Smoothly update progress bar percentage */
  useEffect(() => {
    if (isComplete) {
      const id = requestAnimationFrame(() => setProgress(100));
      return () => cancelAnimationFrame(id);
    }
    const target = Math.round(
      ((activeStep + 1) / STEPS.length) * 95,
    );
    const id = requestAnimationFrame(() => setProgress(target));
    return () => cancelAnimationFrame(id);
  }, [activeStep, isComplete]);

  return (
    <div className="space-y-6" role="status" aria-live="polite">
      {/* Progress bar */}
      <Progress
        value={progress}
        className="h-2"
        aria-label={`Analysis progress: ${progress}%`}
      />

      {/* Steps */}
      <div className="space-y-2">
        {STEPS.map((step, idx) => {
          const StepIcon = step.icon;
          const isDone = idx < activeStep || (idx === activeStep && isComplete);
          const isCurrent = idx === activeStep && !isComplete;

          return (
            <AnimatePresence key={step.label}>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.25 }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isDone && "text-green-600 dark:text-green-400",
                  isCurrent && "bg-muted font-medium text-foreground",
                  !isDone && !isCurrent && "text-muted-foreground",
                )}
              >
                {isCurrent ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : isDone ? (
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <StepIcon className="h-4 w-4" aria-hidden="true" />
                )}
                <span>{step.label}</span>
              </motion.div>
            </AnimatePresence>
          );
        })}
      </div>

      {/* sr-only live status */}
      <p className="sr-only">
        {isComplete
          ? "Analysis complete"
          : `Step ${activeStep + 1} of ${STEPS.length}: ${STEPS[activeStep].label}`}
      </p>
    </div>
  );
}
