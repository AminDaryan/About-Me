/* Contact icons, drawn at the site's hairline weight rather than lifted from a
   brand kit: no fill, no brand colour, and a currentColor stroke so they take
   the link's colour and its hover state like any other link on the page. They
   are decorative — the link around each carries the accessible name. */

type IconProps = { className?: string };

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.35,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  vectorEffect: "non-scaling-stroke" as const,
};

export function MailIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 32 24" className={className} aria-hidden="true" focusable="false">
      <rect x="1.5" y="1.5" width="29" height="21" rx="2" {...STROKE} />
      <path d="M2.5 3 L16 13.5 L29.5 3" {...STROKE} />
    </svg>
  );
}

export function LinkedInIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <rect x="1.5" y="1.5" width="21" height="21" rx="3.5" {...STROKE} />
      {/* "in": the i's stem and dot, then the n's stem and shoulder */}
      <path d="M7.25 10.25 V17.5" {...STROKE} />
      <circle cx="7.25" cy="6.9" r="0.95" fill="currentColor" />
      <path
        d="M11.25 17.5 V10.25 M11.25 13.2 C11.25 11.3 12.6 10.1 14.3 10.1 C16.05 10.1 17 11.2 17 13.2 V17.5"
        {...STROKE}
      />
    </svg>
  );
}
