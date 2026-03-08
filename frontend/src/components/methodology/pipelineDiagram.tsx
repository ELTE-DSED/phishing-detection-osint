/**
 * PipelineDiagram — visual component-based diagram of the 3-layer
 * phishing detection pipeline.
 *
 * Renders an interactive, responsive SVG-free diagram using pure
 * Tailwind + HTML for crisp rendering at any size and easy theming.
 */

import {
  ArrowRight,
  FileText,
  Globe,
  Link2,
  type LucideIcon,
  Search,
  Shield,
  ShieldCheck,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Pipeline step data                                                */
/* ------------------------------------------------------------------ */

interface PipelineStep {
  label: string;
  weight: string;
  icon: LucideIcon;
  colour: string;
  bgColour: string;
  borderColour: string;
  items: string[];
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    label: "Text Analysis",
    weight: "40%",
    icon: FileText,
    colour: "text-blue-600 dark:text-blue-400",
    bgColour: "bg-blue-50 dark:bg-blue-950",
    borderColour: "border-blue-200 dark:border-blue-800",
    items: [
      "Urgency patterns",
      "Credential harvesting cues",
      "Brand impersonation",
      "Fear & threat tactics",
      "Suspicious formatting",
      "Generic phishing language",
    ],
  },
  {
    label: "URL Features",
    weight: "25%",
    icon: Link2,
    colour: "text-amber-600 dark:text-amber-400",
    bgColour: "bg-amber-50 dark:bg-amber-950",
    borderColour: "border-amber-200 dark:border-amber-800",
    items: [
      "Suspicious TLDs",
      "IP addresses in URL",
      "Subdomain depth",
      "Homograph attacks",
      "URL shortener detection",
      "Excessive path length",
    ],
  },
  {
    label: "OSINT Enrichment",
    weight: "35%",
    icon: Globe,
    colour: "text-green-600 dark:text-green-400",
    bgColour: "bg-green-50 dark:bg-green-950",
    borderColour: "border-green-200 dark:border-green-800",
    items: [
      "WHOIS domain age",
      "Registrar reputation",
      "DNS record validation",
      "VirusTotal score",
      "AbuseIPDB reports",
      "Blacklist membership",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function PipelineDiagram() {
  return (
    <div className="space-y-6">
      {/* ── Flow: Input → Layers → Score → Verdict ──────────────── */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
        {/* Input node */}
        <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 font-medium shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          Input
        </div>

        <ArrowRight className="hidden h-5 w-5 text-muted-foreground sm:block" />

        {/* Analysis layers */}
        <div className="flex flex-wrap items-center gap-2">
          {PIPELINE_STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="flex items-center gap-2">
                {idx > 0 && (
                  <span className="text-xs font-medium text-muted-foreground">+</span>
                )}
                <div
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 font-medium shadow-sm ${step.bgColour} ${step.borderColour}`}
                >
                  <Icon className={`h-4 w-4 ${step.colour}`} />
                  <span className={step.colour}>{step.label}</span>
                  <span className="ml-1 rounded-md bg-background/60 px-1.5 py-0.5 text-xs tabular-nums">
                    {step.weight}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <ArrowRight className="hidden h-5 w-5 text-muted-foreground sm:block" />

        {/* Score node */}
        <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 font-medium shadow-sm">
          <Shield className="h-4 w-4 text-muted-foreground" />
          Score
        </div>

        <ArrowRight className="hidden h-5 w-5 text-muted-foreground sm:block" />

        {/* Verdict node */}
        <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 font-semibold shadow-sm">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Verdict
        </div>
      </div>

      {/* ── Three-column detail cards ───────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3">
        {PIPELINE_STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.label}
              className={`rounded-xl border p-4 ${step.bgColour} ${step.borderColour}`}
            >
              <div className="mb-3 flex items-center gap-2">
                <Icon className={`h-5 w-5 ${step.colour}`} />
                <h3 className={`font-semibold ${step.colour}`}>
                  {step.label}
                </h3>
                <span className="ml-auto rounded-md bg-background/60 px-2 py-0.5 text-xs font-medium tabular-nums">
                  Weight: {step.weight}
                </span>
              </div>
              <ul className="space-y-1.5 text-sm text-foreground/80">
                {step.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${step.colour.replace("text-", "bg-")}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
