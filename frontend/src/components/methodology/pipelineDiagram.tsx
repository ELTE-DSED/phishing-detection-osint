/**
 * PipelineDiagram — visual component-based diagram of the ML-primary
 * phishing detection pipeline.
 *
 * Shows the four-stage architecture:
 *   Input → Feature Extraction (3 layers) → XGBoost ML Model → Verdict
 *
 * Uses pure Tailwind + HTML for crisp rendering at any size and easy theming.
 */

import {
  ArrowRight,
  Brain,
  FileText,
  Globe,
  Link2,
  type LucideIcon,
  Search,
  ShieldCheck,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Pipeline step data                                                */
/* ------------------------------------------------------------------ */

interface PipelineStep {
  label: string;
  description: string;
  icon: LucideIcon;
  colour: string;
  bgColour: string;
  borderColour: string;
  items: string[];
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    label: "Text Analysis",
    description: "NLP supplement",
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
    description: "17 structural features",
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
    description: "4 DNS/CDN features",
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
      {/* ── Flow: Input → Layers → ML Model → Verdict ──────────── */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
        {/* Input node */}
        <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 font-medium shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          Input
        </div>

        <ArrowRight className="hidden h-5 w-5 text-muted-foreground sm:block" />

        {/* Feature extraction layers */}
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
                </div>
              </div>
            );
          })}
        </div>

        <ArrowRight className="hidden h-5 w-5 text-muted-foreground sm:block" />

        {/* ML Model node */}
        <div className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-4 py-2.5 font-semibold shadow-sm dark:border-purple-800 dark:bg-purple-950">
          <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span className="text-purple-600 dark:text-purple-400">XGBoost</span>
          <span className="ml-1 rounded-md bg-background/60 px-1.5 py-0.5 text-xs tabular-nums font-medium">
            85%
          </span>
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
                <span className="ml-auto rounded-md bg-background/60 px-2 py-0.5 text-xs font-medium">
                  {step.description}
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
