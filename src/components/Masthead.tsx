"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/research", label: "Research" },
  { href: "/experience", label: "Experience" },
  { href: "/cv", label: "CV" },
  { href: "/beyond", label: "Beyond" },
];

/* Sticky, and led by the diamond mark rather than the name. The name already
   appears as the page's own heading; repeating it in the corner of every
   screen made it the loudest thing on the site. The wordmark returns from the
   small breakpoint up, where there is room for it and it aids orientation. */
export default function Masthead() {
  const pathname = usePathname();

  return (
    <header className="no-print sticky top-0 z-50 border-b border-rule bg-paper">
      <div className="mx-auto flex max-w-[58rem] items-center justify-between gap-x-4 px-5 py-4 sm:gap-x-8 sm:px-7">
        <Link
          href="/"
          aria-label="Home"
          className="group flex shrink-0 items-center gap-2.5"
        >
          <span className="block size-[7px] rotate-45 bg-accent transition-transform duration-500 group-hover:rotate-[135deg]" />
          <span className="hidden text-[0.78rem] tracking-[0.24em] whitespace-nowrap uppercase transition-colors group-hover:text-accent-deep sm:inline">
            Amin Daryan
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="flex items-baseline gap-x-2.5 sm:gap-x-6"
        >
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`border-b pb-0.5 text-[0.68rem] tracking-[0.06em] whitespace-nowrap uppercase transition-colors sm:text-[0.8rem] sm:tracking-[0.11em] ${
                  active
                    ? "border-accent text-accent"
                    : "border-transparent text-ink-soft hover:border-rule hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
