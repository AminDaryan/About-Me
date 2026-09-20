"use client";

import BookLink from "@/components/book/BookLink";
import { usePathname } from "next/navigation";
import Mark from "./Mark";
import { useBookNavigationHistory } from "./book/navigation";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/research", label: "Research" },
  { href: "/cv", label: "CV" },
  { href: "/beyond", label: "Beyond" },
];

/* Sticky, and laid out like the head of a printed page: where you can go on
   the left, and the mark on the right.

   The name used to stand beside that mark as a running head, appearing and
   going quiet so that it was on screen exactly once — never beside the CV's
   own letterhead, never missing from a page. Amin asked for it to go, and the
   machinery that watched for the page's own name went with it: with no name
   here there is nothing left to collide with one down the page. The mark is
   the way home, and it says the name to a screen reader. */
export default function Masthead() {
  useBookNavigationHistory();
  const pathname = usePathname();

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
              /* Set in the page's own letters, at the page's own size: these
                 are the names of pages, and a name is a name. They were
                 letterspaced capitals at a size of their own — 0.74rem on a
                 phone, 0.82rem on a desk, neither of them in the scale — which
                 made the one row a reader meets on every page the one row set
                 in a face that appears nowhere in the text under it. Nothing
                 was gained by it: caps at twelve pixels are the hardest thing
                 on the site to read, and the row is navigation, which has to
                 be read at a glance and by someone who is not looking for it.

                 The body size rather than the secondary one, because this is
                 the way through the site and the margin rail, a step below it
                 at --text-meta, is the way through a page. */
              <BookLink
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`border-b pb-0.5 text-body whitespace-nowrap transition-colors ${
                  active
                    ? "border-accent text-accent-deep"
                    : "border-transparent text-ink-soft hover:border-rule hover:text-ink"
                }`}
              >
                {item.label}
              </BookLink>
            );
          })}
        </nav>

        {/* The mark alone. It is the way home from anywhere, and its label is
            the only place the name is set in this row.

            It is drawn in ink rather than the accent the diamond used: the
            accent marks the one live thing in a view, and a mark that is on
            every page of the site is not that. It takes the accent on hover,
            which is the one moment it is the live thing. */}
        {/* The padding is the touch target, not the drawing: 28px of mark on a
            phone is well under the 44px a thumb needs, and the negative margin
            gives the space back to the row so the mark still sits on the
            gutter. */}
        <BookLink
          href="/"
          aria-label="Amin Dariani — home"
          className="group -m-2 flex shrink-0 items-center p-2 text-ink-soft transition-colors hover:text-accent-deep"
        >
          <Mark className="size-7 sm:size-[34px]" />
        </BookLink>
      </div>
    </header>
  );
}
