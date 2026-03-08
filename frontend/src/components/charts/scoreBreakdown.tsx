"use client";

/**
 * ScoreBreakdown — donut chart showing the three scoring components.
 *
 * Segments:
 *   • Text Analysis  (40%) — blue
 *   • URL Features   (25%) — orange
 *   • OSINT Score    (35%) — green
 *
 * The final phishing score is displayed in the centre of the donut.
 * Uses Recharts `PieChart` for rendering.
 */

import { useMemo } from "react";
import { useTheme } from "next-themes";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SCORING_WEIGHTS } from "@/lib/constants";
import { useCountUp } from "@/hooks/useCountUp";

/* ------------------------------------------------------------------ */
/*  Colour palette — light + dark aware                               */
/* ------------------------------------------------------------------ */

const SEGMENT_COLORS_LIGHT = [
  { fill: "#3b82f6", label: "Text Analysis" },   // blue-500
  { fill: "#f59e0b", label: "URL Features" },     // amber-500
  { fill: "#22c55e", label: "OSINT Score" },       // green-500
] as const;

const SEGMENT_COLORS_DARK = [
  { fill: "#60a5fa", label: "Text Analysis" },   // blue-400
  { fill: "#fbbf24", label: "URL Features" },     // amber-400
  { fill: "#4ade80", label: "OSINT Score" },       // green-400
] as const;

/* ------------------------------------------------------------------ */
/*  Custom tooltip                                                    */
/* ------------------------------------------------------------------ */

interface TooltipPayloadEntry {
  name: string;
  value: number;
  payload: { fill: string };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];

  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{entry.name}</p>
      <p className="text-muted-foreground">
        Weight: <span className="font-semibold">{entry.value}%</span>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

interface ScoreBreakdownProps {
  /** The final confidence score (0–1). */
  confidenceScore: number;
}

export function ScoreBreakdown({ confidenceScore }: ScoreBreakdownProps) {
  const animatedScore = useCountUp(confidenceScore * 100, 1200);
  const { resolvedTheme } = useTheme();
  const segmentColors = resolvedTheme === "dark" ? SEGMENT_COLORS_DARK : SEGMENT_COLORS_LIGHT;

  const data = useMemo(
    () => [
      { name: "Text Analysis",  value: SCORING_WEIGHTS.text * 100 },
      { name: "URL Features",   value: SCORING_WEIGHTS.url * 100 },
      { name: "OSINT Score",    value: SCORING_WEIGHTS.osint * 100 },
    ],
    [],
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Score Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          role="img"
          aria-label={`Score breakdown donut chart. Final risk score: ${Math.round(confidenceScore * 100)} percent. Text analysis weight: ${SCORING_WEIGHTS.text * 100}%, URL features weight: ${SCORING_WEIGHTS.url * 100}%, OSINT score weight: ${SCORING_WEIGHTS.osint * 100}%.`}
          className="relative"
        >
          {/* Centre label overlay */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tabular-nums text-foreground">
              {Math.round(animatedScore)}%
            </span>
            <span className="text-xs text-muted-foreground">Risk Score</span>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                {data.map((_, index) => (
                  <Cell
                    key={segmentColors[index].label}
                    fill={segmentColors[index].fill}
                  />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-2 flex flex-wrap justify-center gap-4">
          {segmentColors.map((seg, i) => (
            <div key={seg.label} className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: seg.fill }}
                aria-hidden="true"
              />
              <span className="text-xs text-muted-foreground">
                {seg.label}{" "}
                <span className="font-medium text-foreground">
                  {data[i].value}%
                </span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
