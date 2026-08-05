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

export default function Masthead() {
  const pathname = usePathname();

  return (
    <header className="no-print border-b border-rule bg-paper">
      <div className="mx-auto flex max-w-[58rem] flex-wrap items-baseline justify-between gap-x-8 gap-y-3 px-7 pt-[1.6rem] pb-[1.4rem]">
        <Link
          href="/"
          className="whitespace-nowrap text-[0.78rem] tracking-[0.24em] uppercase transition-colors hover:text-accent-deep"
        >
          Amin Daryan
        </Link>

        <nav aria-label="Primary" className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
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
                className={`border-b pb-0.5 text-[0.8rem] tracking-[0.11em] uppercase transition-colors ${
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
