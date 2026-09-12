/* Contact icons, drawn at the site's hairline weight rather than lifted from a
   brand kit: no fill, no brand colour, and a currentColor stroke so they take
   the link's colour and its hover state like any other link on the page. They
   are decorative — the link around each carries the accessible name. */

import { TOOL_MARKS, type ToolKey } from "./toolMarks";

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

/* The five skill marks, at the same weight as the contact icons above. Each one
   stands beside a heading that already names the group, so they carry no
   meaning of their own and stay hidden from assistive technology: they are
   there to give the eye somewhere to land in a section that is otherwise five
   dense lines of proper nouns. */

export function CodeIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path d="M8.5 7.5 L3.5 12 L8.5 16.5" {...STROKE} />
      <path d="M15.5 7.5 L20.5 12 L15.5 16.5" {...STROKE} />
      <path d="M13.4 5.5 L10.6 18.5" {...STROKE} />
    </svg>
  );
}

/** Two inputs, a hidden unit and an output — a network small enough to read. */
export function NetworkIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path d="M6.3 7.6 L11 11.4 M6.3 16.4 L11 12.6 M13.6 12 H17.4" {...STROKE} />
      <circle cx="4.6" cy="6.5" r="1.9" {...STROKE} />
      <circle cx="4.6" cy="17.5" r="1.9" {...STROKE} />
      <circle cx="12" cy="12" r="1.9" {...STROKE} />
      <circle cx="19.4" cy="12" r="1.9" {...STROKE} />
    </svg>
  );
}

/** A two-link arm on its base, gripper open, as Fig. 3 draws one. */
export function ArmIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path d="M3.5 20.5 H10.5 M7 20.5 V16.5" {...STROKE} />
      <path d="M7 15.2 L12.4 9.6" {...STROKE} />
      <path d="M14 8.8 L18.6 10.9" {...STROKE} />
      <path d="M19.8 9.2 V13.4 M18 11.3 H21.6" {...STROKE} />
      <circle cx="7" cy="15.8" r="1.3" {...STROKE} />
      <circle cx="13.2" cy="8.8" r="1.3" {...STROKE} />
    </svg>
  );
}

/** A curve read off its axes: the shape of a method being evaluated. */
export function MethodIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path d="M4.5 3.5 V19.5 H20.5" {...STROKE} />
      <path d="M7 16.5 C11 16.5 11.5 7.5 18.5 6.5" {...STROKE} />
      <circle cx="18.5" cy="6.5" r="1.5" {...STROKE} />
    </svg>
  );
}

/**
 * A tool's own mark, set at the size of the word beside it. Solid rather than
 * hairline, because that is how these marks are drawn and a redrawn one would
 * be a different mark; the opacity in `.tool-mark` keeps them from outweighing
 * the text. Decorative: the name is right there.
 */
export function ToolMark({ mark }: { mark: ToolKey }) {
  const m = TOOL_MARKS[mark];
  return (
    <svg className="tool-mark" viewBox={m.viewBox} aria-hidden="true" focusable="false">
      {m.paths.map((d) => (
        <path key={d.slice(0, 24)} d={d} fill="currentColor" />
      ))}
    </svg>
  );
}

export function GlobeIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" {...STROKE} />
      <path d="M3.4 12 H20.6" {...STROKE} />
      <path d="M12 3 C7.6 7.4 7.6 16.6 12 21 C16.4 16.6 16.4 7.4 12 3 Z" {...STROKE} />
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
