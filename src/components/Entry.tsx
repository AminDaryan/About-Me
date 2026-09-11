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
  title,
  when,
  where,
  links,
  delay = 0,
  children,
}: {
  /** Makes the entry a link target, e.g. /research#gaze. */
  id?: string;
  /** A small emblem hung to the left of the entry — a university's mark. */
  mark?: ReactNode;
  title: string;
  when: string;
  where?: string;
  links?: { label: string; href: string }[];
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

      {links && (
        <ul className="mt-[0.9rem] flex flex-wrap gap-x-6 gap-y-1.5 text-meta">
          {links.map((l) => (
            <li key={l.href}>
              <a className="link" href={l.href} rel="noopener">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );

  return (
    <li
      id={id}
      ref={ref}
      className={`settle entry border-t border-rule-soft py-[2.1rem] first:border-rule ${mark ? "entry-marked" : ""}`}
    >
      {mark ? (
        <>
          <div className="entry-mark" aria-hidden="true">
            {mark}
          </div>
          <div className="min-w-0">{body}</div>
        </>
      ) : (
        body
      )}
    </li>
  );
}
