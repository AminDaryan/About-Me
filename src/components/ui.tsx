import type { ReactNode } from "react";

/* Shared presentational pieces. All server components — no interactivity.
   (Entry lives in its own file: it settles itself, so it must be a client
   component, and keeping it separate stops that cost spreading to these.) */

export function Wrap({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    /* Tighter gutters on phones: at 28px a side the measure fell to 37
       characters, which is under the comfortable range. */
    <div className={`mx-auto w-full max-w-[58rem] px-5 sm:px-7 ${className}`}>
      {children}
    </div>
  );
}

/** Hairline, diamond, hairline — a printer's fleuron. */
export function Divider() {
  return (
    <Wrap>
      <div className="divider my-[clamp(3rem,7vw,5rem)] flex items-center gap-[1.15rem]">
        <span className="h-px flex-1 bg-rule" />
        <span className="divider-mark block size-[5px] rotate-45 bg-accent opacity-75" />
        <span className="h-px flex-1 bg-rule" />
      </div>
    </Wrap>
  );
}

/**
 * A link to somewhere off this site.
 *
 * It opens in a new tab, always: these pages are reference documents, and a
 * reader who follows a DOI or a university's mark out of the middle of a CV has
 * lost their place in it. The one place that decides this, so that no link on
 * the site can quietly disagree.
 *
 * A visitor who cannot see the new tab appear is the one who most needs telling
 * it happened, so the accessible name says so — in the label where the link has
 * one, and otherwise appended to the words themselves.
 */
export function ExternalLink({
  href,
  /** Names the link where its content cannot — an institution's mark, say. */
  label,
  /** Added before `noopener noreferrer`; `me` marks a profile as Amin's own. */
  rel,
  /** The hover and focus caption an icon link carries in place of words. */
  tip,
  className = "link",
  children,
}: {
  href: string;
  label?: string;
  rel?: string;
  tip?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel={rel ? `${rel} noopener noreferrer` : "noopener noreferrer"}
      aria-label={label && `${label} (opens in a new tab)`}
      data-tip={tip}
    >
      {children}
      {!label && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  );
}

/** "Selected projects" → "selected-projects". */
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function SectionTitle({
  id,
  num,
  children,
}: {
  /** Overrides the id taken from the title itself, e.g. /research#current-work. */
  id?: string;
  num?: string;
  children: ReactNode;
}) {
  /* Every section is a link target whether or not anyone asked for one: the
     margin rail points at these headings, and a section that cannot be linked
     to cannot be pointed at either. */
  const named = id ?? (typeof children === "string" ? slug(children) : undefined);

  return (
    <h2 id={named} className="mb-7 text-section">
      {num && (
        <span className="label mb-[0.85rem] block text-accent">{num}</span>
      )}
      {children}
    </h2>
  );
}

/**
 * Holds a run of blocks alongside their marginal glosses. A gloss is any child
 * carrying `.note` — in practice `<Settle className="note">` — which the CSS
 * lifts into the left margin on wide screens and folds inline on narrow ones.
 */
export function Leaf({ children }: { children: ReactNode }) {
  return <div className="leaf">{children}</div>;
}

export function Entries({ children }: { children: ReactNode }) {
  return <ul className="m-0 list-none p-0">{children}</ul>;
}

export function Callout({ children }: { children: ReactNode }) {
  return (
    <p className="my-10 max-w-measure border-y border-rule py-[1.6rem] italic">
      {children}
    </p>
  );
}

export function Footer() {
  return (
    <footer className="no-print mt-[clamp(3rem,8vw,5.5rem)] border-t border-rule">
      <div className="label mx-auto flex max-w-[58rem] flex-wrap justify-between gap-x-8 gap-y-2 px-5 pt-[1.9rem] pb-[2.6rem] text-ink-faint sm:px-7">
        <span>Kaiserslautern, Germany</span>
        <span>Updated September 2026</span>
      </div>
    </footer>
  );
}
