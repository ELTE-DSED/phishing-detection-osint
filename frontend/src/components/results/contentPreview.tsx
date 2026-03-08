/**
 * ContentPreview — shows what was analysed (URL or text snippet).
 */

import { FileText, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

interface ContentPreviewProps {
  /** The raw content that was submitted for analysis. */
  content: string;
  /** Detected content type (url / email / text). */
  contentType: string;
  /** ISO timestamp of when the analysis ran. */
  analyzedAt: string;
  /** Time in seconds the analysis took. */
  analysisTime: number;
}

export function ContentPreview({
  content,
  contentType,
  analyzedAt,
  analysisTime,
}: ContentPreviewProps) {
  const isUrl =
    contentType === "url" || /^https?:\/\//i.test(content.trim());

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Analysed Content</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="capitalize">
            {contentType}
          </Badge>
          <Badge variant="outline" className="tabular-nums">
            {analysisTime.toFixed(2)}s
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Content body */}
        <div className="rounded-lg border bg-muted/40 p-3">
          {isUrl ? (
            <a
              href={content.trim()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-mono text-primary underline-offset-4 hover:underline break-all"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              {content.trim()}
            </a>
          ) : (
            <div className="flex items-start gap-2">
              <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <p className="whitespace-pre-wrap text-sm break-words">
                {content.length > 500
                  ? `${content.slice(0, 500)}…`
                  : content}
              </p>
            </div>
          )}
        </div>

        {/* Metadata */}
        <p className="text-xs text-muted-foreground">
          Analysed on{" "}
          {new Date(analyzedAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </CardContent>
    </Card>
  );
}
