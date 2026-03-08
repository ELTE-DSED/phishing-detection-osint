/**
 * PhishGuard logo — shield with magnifying glass and check mark.
 * Available as an inline SVG React component so it works in both
 * light and dark themes, and can be sized with `className`.
 */

interface LogoProps {
  className?: string;
}

export function Logo({ className = "h-6 w-6" }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pgShield" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-primary, #3b82f6)" />
          <stop offset="100%" stopColor="var(--color-primary, #1d4ed8)" />
        </linearGradient>
      </defs>
      {/* Shield body */}
      <path
        d="M256 28 L460 120 C460 120 460 320 256 484 C52 320 52 120 52 120 Z"
        fill="url(#pgShield)"
        stroke="currentColor"
        strokeWidth="6"
        strokeOpacity="0.15"
      />
      {/* Magnifying glass circle */}
      <circle
        cx="240"
        cy="230"
        r="80"
        fill="none"
        stroke="white"
        strokeWidth="16"
        strokeLinecap="round"
      />
      {/* Handle */}
      <line
        x1="296"
        y1="290"
        x2="360"
        y2="360"
        stroke="white"
        strokeWidth="16"
        strokeLinecap="round"
      />
      {/* Check mark */}
      <path
        d="M200 230 L228 258 L280 200"
        fill="none"
        stroke="white"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
