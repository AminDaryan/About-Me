"use client";

import type { ReactNode } from "react";
import { useSettle } from "./Settle";

/**
 * One record: a job, a degree, a piece of research.
 *
 * It settles itself rather than being wrapped in <Settle>, because it renders
 * an <li> and must stay a direct child of the <ul> in <Entries> — a wrapper
 * <div> in between is invalid markup and costs the list its semantics.
 */
export default function Entry({
  id,
  mark,
  wideMark,
  title,
  when,
  where,
  delay = 0,
  children,
}: {
  /** Makes the entry a link target, e.g. /research#gaze. */
  id?: string;
  /** A small emblem hung to the left of the entry — an institution's mark. */
  mark?: ReactNode;
  /** The mark is a wordmark rather than a crest, so it wants width instead of
      height: a wider column, and the marks hung from its left edge. */
  wideMark?: boolean;
  title: string;
  when: string;
  where?: string;
  delay?: number;
  children?: ReactNode;
}) {
  const ref = useSettle<HTMLLIElement>(delay);

  return (
    /* Two columns, on the page's one grid: what identifies the record — its
       date, and the institution's mark where there is one — hangs in the
       margin, and the record itself is set at the measure beside it. That is
       how a register is set, and it is also the only way the running text
       here comes out at a length anyone can read: an <Entries> list has no
       margin column of its own, so before this an entry ran the full wrap, a
       hundred and ten characters to the line. */
    <li
      id={id}
      ref={ref}
      data-wide={mark && wideMark ? "" : undefined}
      className={`settle entry border-t border-rule py-[2.4rem] ${mark ? "entry-marked" : ""}`}
    >
      <div className="entry-aside">
        {/* Not aria-hidden: the mark is a link to the institution now, and
            hiding a focusable element from assistive technology leaves
            keyboard users landing on something their screen reader will not
            name. Its own label carries the name. */}
        {mark && <div className="entry-mark">{mark}</div>}
        <span className="entry-when">{when}</span>
      </div>

      <div className="entry-body">
        <h3 className="text-subhead">{title}</h3>

        {/* Where is the record's metadata, not its text: set small and quiet so
            the title above it keeps the entry's first glance. */}
        {where && (
          <p className="mt-[0.2rem] mb-[0.95rem] text-meta text-ink-faint italic">
            {where}
          </p>
        )}

        {children && <div className="copy">{children}</div>}
      </div>
    </li>
  );
}
