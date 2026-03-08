"use client";

/**
 * ShareActions — copy-to-clipboard and print buttons for results.
 */

import { useState, useCallback } from "react";
import { Copy, Check, Printer, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AnalysisResponse } from "@/types";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function buildTextSummary(result: AnalysisResponse, content: string): string {
  const v = result.verdict;
  const lines = [
    `PhishGuard Analysis Report`,
    `══════════════════════════`,
    ``,
    `Content: ${content.length > 120 ? content.slice(0, 120) + "…" : content}`,
    `Verdict: ${v.isPhishing ? "PHISHING DETECTED" : "SAFE"}`,
    `Threat Level: ${v.threatLevel.toUpperCase()}`,
    `Confidence: ${Math.round(v.confidenceScore * 100)}%`,
    `Recommendation: ${v.recommendation}`,
    ``,
  ];

  if (v.reasons.length > 0) {
    lines.push(`Risk Indicators:`);
    v.reasons.forEach((r) => lines.push(`  • ${r}`));
    lines.push(``);
  }

  lines.push(`Analysis Time: ${result.analysisTime.toFixed(2)}s`);
  lines.push(`Date: ${new Date(result.analyzedAt).toLocaleString()}`);
  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

interface ShareActionsProps {
  result: AnalysisResponse;
  /** The content string that was originally analysed. */
  content: string;
}

export function ShareActions({ result, content }: ShareActionsProps) {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const copyText = useCallback(async () => {
    await navigator.clipboard.writeText(buildTextSummary(result, content));
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  }, [result, content]);

  const copyJson = useCallback(async () => {
    await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  }, [result]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="flex flex-wrap gap-2">
      {/* Copy text summary */}
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              onClick={copyText}
            />
          }
        >
          {copiedText ? (
            <Check className="mr-1.5 h-3.5 w-3.5 text-green-500 dark:text-green-400" />
          ) : (
            <Copy className="mr-1.5 h-3.5 w-3.5" />
          )}
          {copiedText ? "Copied!" : "Copy Summary"}
        </TooltipTrigger>
        <TooltipContent>Copy formatted text summary</TooltipContent>
      </Tooltip>

      {/* Copy JSON */}
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              onClick={copyJson}
            />
          }
        >
          {copiedJson ? (
            <Check className="mr-1.5 h-3.5 w-3.5 text-green-500 dark:text-green-400" />
          ) : (
            <FileJson className="mr-1.5 h-3.5 w-3.5" />
          )}
          {copiedJson ? "Copied!" : "Copy JSON"}
        </TooltipTrigger>
        <TooltipContent>Copy raw API response as JSON</TooltipContent>
      </Tooltip>

      {/* Print */}
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
            />
          }
        >
          <Printer className="mr-1.5 h-3.5 w-3.5" />
          Print
        </TooltipTrigger>
        <TooltipContent>Print this report</TooltipContent>
      </Tooltip>
    </div>
  );
}
