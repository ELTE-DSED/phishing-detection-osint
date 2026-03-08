"use client";

/**
 * App-shell error boundary — catches errors within the `(app)` route
 * group so the sidebar + header remain visible and the user can
 * navigate away or retry.
 */

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LinkButton } from "@/components/ui/linkButton";
import { ShieldAlert, RefreshCw, Home, Bug, ArrowLeft } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AppErrorBoundary]", error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center py-12">
      <Card className="w-full max-w-lg text-center">
        <CardHeader className="items-center gap-2">
          <div className="rounded-full border border-destructive/30 bg-destructive/10 p-4">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle>Page Error</CardTitle>
          <CardDescription className="max-w-sm">
            This page encountered an error. The rest of the application
            is still working — you can retry or navigate elsewhere.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error detail */}
          <div className="rounded-lg border bg-muted/50 px-3 py-2 text-left text-sm">
            <div className="flex items-start gap-2">
              <Bug className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="font-mono text-xs break-all text-foreground/80">
                {error.message || "An unexpected error occurred."}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={reset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <LinkButton href="/" variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </LinkButton>
            <LinkButton href="/analyze" variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Analyse
            </LinkButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
