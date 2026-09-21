"use client";

import { useEffect, useRef, useState } from "react";
import usePageContent from "./usePageContent";

/* The margin rail: which sections this page has, and which one is being read.
   It is a book's running head rather than a navigation bar — it lives in the
   outer margin, it appears only where that margin is wide enough to hold it
   without crowding the measure, and it invents nothing: the entries are the
   page's own numbered headings, read out of the document after it renders.

   The reading position is written straight onto the links as `aria-current`,
   not held in React state: it changes on every scroll frame, and re-rendering
   a list on every frame to move one underline is the wrong trade. */

type Item = { id: string; num: string; text: string };

/** A heading counts as reached once it comes this near the top of the window. */
const REACHED = 140;

const same = (a: Item[], b: Item[]) =>
  a.length === b.length &&
  a.every((x, i) => x.id === b[i].id && x.num === b[i].num && x.text === b[i].text);

/**
 * Where the reading line sits in the window, in px from its top.
 *
 * It is `REACHED` for as long as there is scrolling left to do, and slides down
 * to the foot of the window over the last screenful. Without that, the closing
 * section of a page is never the one you are on: it is shorter than the window,
 * so its heading stops short of the mark and no amount of scrolling will bring
 * it any nearer, and a page's last section is often the one a reader came
 * down to find.
 */
function readingLine(left: number, height: number) {
  return height - Math.min(Math.max(left, 0), height - REACHED);
}

export default function SectionNav() {
  const [items, setItems] = useState<Item[]>([]);
  const links = useRef<(HTMLAnchorElement | null)[]>([]);

  usePageContent(() => {
    /* Every entry is marked in the page itself, by `data-rail` naming it and
       `data-rail-num` giving its numeral where it has one. A section heading
       carries both; a stretch of page with no heading carries a name alone,
       because it is still somewhere you can be — the home page opens with its
       greeting, its story and Fig. 1 before the first h2, and a rail that
       started at its first heading would claim the page begins halfway down.

       Attributes rather than the heading's own markup: the rail used to take
       the numeral out of the h2 by a class name, and the day that class
       changed, every entry came out with its numeral run into its name. */
    const next = Array.from(
      document.querySelectorAll<HTMLElement>("main [data-rail][id]"),
    ).map((el) => ({
      id: el.id,
      num: el.dataset.railNum ?? "",
      text: el.dataset.rail ?? "",
    }));
    setItems((prev) => (same(prev, next) ? prev : next));
  });

  useEffect(() => {
    if (items.length < 2) return;
    const heads = items.map((item) => document.getElementById(item.id));
    let frame = 0;

    const mark = () => {
      frame = 0;
      const line = readingLine(
        document.documentElement.scrollHeight - window.innerHeight - window.scrollY,
        window.innerHeight,
      );
      let reached = 0;
      heads.forEach((h, i) => {
        if (h && h.getBoundingClientRect().top <= line) reached = i;
      });
      links.current.forEach((link, i) => {
        if (!link) return;
        if (i === reached) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(mark);
    };

    mark();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  // One section is not a contents list.
  if (items.length < 2) return null;

  return (
    <nav className="rail no-print" aria-label="Sections of this page">
      <ol>
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              ref={(el) => {
                links.current[i] = el;
              }}
              href={`#${item.id}`}
            >
              {item.num && <span className="rail-num">{item.num}</span>}
              <span className="rail-text">{item.text}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
