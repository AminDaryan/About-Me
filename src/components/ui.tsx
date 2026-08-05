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
    <div className={`mx-auto w-full max-w-[58rem] px-7 ${className}`}>
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

export function SectionTitle({
  num,
  children,
}: {
  num?: string;
  children: ReactNode;
}) {
  return (
    <h2 className="mb-7 text-section">
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
    <p className="my-10 max-w-measure border-y border-rule py-[1.6rem] text-ink-soft italic">
      {children}
    </p>
  );
}

export function Footer() {
  return (
    <footer className="no-print mt-[clamp(3rem,8vw,5.5rem)] border-t border-rule">
      <div className="label mx-auto flex max-w-[58rem] flex-wrap justify-between gap-x-8 gap-y-2 px-7 pt-[1.9rem] pb-[2.6rem] text-ink-faint">
        <span>Amin Daryan — Kaiserslautern</span>
        <span>Updated August 2026</span>
      </div>
    </footer>
  );
}
