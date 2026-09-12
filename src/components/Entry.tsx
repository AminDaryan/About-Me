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

  const body = (
    <>
      <div className="mb-[0.15rem] flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="text-subhead">{title}</h3>
        <span className="label whitespace-nowrap text-ink-faint">{when}</span>
      </div>

      {where && (
        <p className="mt-1 mb-[0.85rem] italic">
          {where}
        </p>
      )}

      {children && <div className="copy">{children}</div>}
    </>
  );

  return (
    <li
      id={id}
      ref={ref}
      data-wide={mark && wideMark ? "" : undefined}
      className={`settle entry border-t border-rule-soft py-[2.1rem] first:border-rule ${mark ? "entry-marked" : ""}`}
    >
      {mark ? (
        <>
          {/* Not aria-hidden: the mark is a link to the institution now, and
              hiding a focusable element from assistive technology leaves
              keyboard users landing on something their screen reader will not
              name. Its own label carries the name. */}
          <div className="entry-mark">{mark}</div>
          <div className="min-w-0">{body}</div>
        </>
      ) : (
        body
      )}
    </li>
  );
}
