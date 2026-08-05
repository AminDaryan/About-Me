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
  title,
  when,
  where,
  links,
  delay = 0,
  children,
}: {
  title: string;
  when: string;
  where?: string;
  links?: { label: string; href: string }[];
  delay?: number;
  children?: ReactNode;
}) {
  const ref = useSettle<HTMLLIElement>(delay);

  return (
    <li
      ref={ref}
      className="settle entry border-t border-rule-soft py-[2.1rem] first:border-rule"
    >
      <div className="mb-[0.15rem] flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="text-[1.24rem] leading-[1.35]">{title}</h3>
        <span className="label whitespace-nowrap text-ink-faint">{when}</span>
      </div>

      {where && (
        <p className="mt-1 mb-[0.85rem] text-[0.98rem] text-ink-soft italic">
          {where}
        </p>
      )}

      {children && <div className="copy text-ink-soft">{children}</div>}

      {links && (
        <ul className="mt-[0.9rem] flex flex-wrap gap-x-6 gap-y-1.5 text-[0.86rem]">
          {links.map((l) => (
            <li key={l.href}>
              <a className="link" href={l.href} rel="noopener">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
