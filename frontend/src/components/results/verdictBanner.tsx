"use client";

/**
 * VerdictBanner — large, color-coded banner showing the analysis verdict.
 *
 * Displays isPhishing (YES/NO), threat-level badge, animated confidence
 * score, and recommendation text.
 */

import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Skull,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCountUp } from "@/hooks/useCountUp";
import { THREAT_LEVEL_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { VerdictResult } from "@/types";

/* ------------------------------------------------------------------ */
/*  Icon for each threat level                                        */
/* ------------------------------------------------------------------ */

const threatIcons = {
  safe: ShieldCheck,
  suspicious: ShieldAlert,
  dangerous: ShieldX,
  critical: Skull,
} as const;

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

interface VerdictBannerProps {
  verdict: VerdictResult;
}

export function VerdictBanner({ verdict }: VerdictBannerProps) {
  const meta = THREAT_LEVEL_MAP[verdict.threatLevel];
  const Icon = threatIcons[verdict.threatLevel];
  const animatedScore = useCountUp(verdict.confidenceScore * 100, 1200);

  return (
    <Card
      className={cn("overflow-hidden border-2", meta.borderClass, meta.bgClass)}
    >
      <CardContent className="flex flex-col items-center gap-4 py-8 sm:flex-row sm:gap-8 sm:py-10">
        {/* Icon + phishing status */}
        <div className="flex flex-col items-center gap-2">
          <div
            className={cn(
              "rounded-full p-4",
              verdict.isPhishing
                ? "bg-red-100 dark:bg-red-900/30"
                : "bg-green-100 dark:bg-green-900/30",
            )}
          >
            <Icon
              className={cn(
                "h-12 w-12 sm:h-16 sm:w-16",
                meta.colorClass,
              )}
              aria-hidden="true"
            />
          </div>
          <span
            className={cn(
              "text-lg font-bold uppercase tracking-wide",
              verdict.isPhishing
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400",
            )}
            aria-label={verdict.isPhishing ? "Phishing detected" : "Not phishing"}
          >
            {verdict.isPhishing ? "Phishing" : "Safe"}
          </span>
        </div>

        {/* Score + details */}
        <div className="flex flex-1 flex-col items-center gap-3 text-center sm:items-start sm:text-left">
          {/* Animated confidence score */}
          <div className="flex items-baseline gap-2">
            <span
              className={cn("text-5xl font-extrabold tabular-nums", meta.colorClass)}
              aria-label={`Confidence score: ${Math.round(verdict.confidenceScore * 100)} percent`}
            >
              {Math.round(animatedScore)}
            </span>
            <span className={cn("text-2xl font-bold", meta.colorClass)}>%</span>
          </div>

          {/* Threat level badge */}
          <Badge
            variant="outline"
            className={cn(
              "text-sm font-medium",
              meta.colorClass,
              meta.borderClass,
            )}
          >
            {meta.icon} {meta.label}
          </Badge>

          {/* Recommendation */}
          <p className="max-w-md text-sm text-muted-foreground">
            {verdict.recommendation}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
