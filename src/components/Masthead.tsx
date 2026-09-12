"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import usePageContent from "./usePageContent";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/research", label: "Research" },
  { href: "/cv", label: "CV" },
  { href: "/beyond", label: "Beyond" },
];

/* Sticky, and laid out like the head of a printed page: where you can go on
   the left, whose pages these are on the right.

   The name is a running head, not a logotype. Its job is to answer "whose site
   is this?", and it does that everywhere except where the page already sets the
   same name large in its own heading — the CV's letterhead — where it waits
   until that has scrolled under it. One rule, and the name is on screen exactly
   once: never twice in a screen, never missing from a page. The home page's
   greeting says only "Amin", so the masthead carries the surname there from the
   first line.

   The fade is opacity alone and the box keeps its width, so the row never
   moves — and with JavaScript off the name simply stays, which is the safe
   way round. */
export default function Masthead() {
  const pathname = usePathname();

  /* Quiet while the page is showing its own name. It starts false so the name
     is there before hydration and stays there without JavaScript. */
  const [quiet, setQuiet] = useState(false);
  const observer = useRef<IntersectionObserver>(null);

  usePageContent(() => {
    observer.current?.disconnect();
    const own = document.querySelector<HTMLElement>("main [data-page-name]");
    if (!own) {
      setQuiet(false);
      return;
    }
    /* The heading counts as gone once it has passed under the masthead rather
       than when its last pixel leaves the window, so the two names are never
       both legible at once. The 80px is the masthead's own clearance, the same
       one `html { scroll-padding-top }` uses; a rootMargin may only be given
       in pixels or percent, so it cannot simply say 5rem. */
    observer.current = new IntersectionObserver(
      ([entry]) => setQuiet(entry.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px" },
    );
    observer.current.observe(own);
  });

  useEffect(() => () => observer.current?.disconnect(), []);

  return (
    <header className="no-print sticky top-0 z-50 border-b border-rule bg-paper">
      <div className="flex items-center justify-between gap-x-5 px-5 py-4 sm:px-gutter">
        <nav
          aria-label="Primary"
          className="flex items-baseline gap-x-3.5 sm:gap-x-6"
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

        {/* The mark goes quiet with the name it belongs to: half a running head,
            appearing and disappearing on its own, would read as a glitch. On a
            phone there is no room for the words, and the mark stands for them. */}
        <Link
          href="/"
          aria-label="Amin Dariani — home"
          data-quiet={quiet || undefined}
          /* Out of the tab order and out of the accessibility tree while it is
             invisible: a link nobody can see is not one to land focus on, and
             the name it carries is on the page underneath in any case. */
          tabIndex={quiet ? -1 : undefined}
          aria-hidden={quiet || undefined}
          className="running-head group flex shrink-0 items-center gap-2.5"
        >
          <span className="block size-[7px] rotate-45 bg-accent transition-transform duration-500 group-hover:rotate-[135deg]" />
          <span className="hidden text-[0.78rem] tracking-[0.24em] whitespace-nowrap uppercase transition-colors group-hover:text-accent-deep sm:inline">
            Amin Dariani
          </span>
        </Link>
      </div>
    </header>
  );
}
