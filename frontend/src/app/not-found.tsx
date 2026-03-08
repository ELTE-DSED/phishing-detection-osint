/**
 * Custom 404 page — shown when no route matches the requested URL.
 * Uses the same visual language as the error boundary for consistency.
 */

import { ShieldOff, Home, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LinkButton } from "@/components/ui/linkButton";
import { APP_NAME } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center gap-2">
          <div className="rounded-full border border-muted bg-muted/50 p-4">
            <ShieldOff className="h-10 w-10 text-muted-foreground" />
          </div>
          <CardTitle className="text-6xl font-bold tracking-tighter">
            404
          </CardTitle>
          <CardDescription className="max-w-sm text-base">
            This page doesn&apos;t exist in {APP_NAME}. It may have
            been moved or the URL is incorrect.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <LinkButton href="/">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </LinkButton>
            <LinkButton href="/analyze" variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Analyse Content
            </LinkButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
