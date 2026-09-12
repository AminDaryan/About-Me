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
  a.length === b.length && a.every((x, i) => x.id === b[i].id && x.text === b[i].text);

/**
 * Where the reading line sits in the window, in px from its top.
 *
 * It is `REACHED` for as long as there is scrolling left to do, and slides down
 * to the foot of the window over the last screenful. Without that, the closing
 * section of a page is never the one you are on: it is shorter than the window,
 * so its heading stops short of the mark and no amount of scrolling will bring
 * it any nearer — which is exactly what happened to "Get in touch", the one
 * section on the home page that most wants to be pointed at.
 */
function readingLine(left: number, height: number) {
  return height - Math.min(Math.max(left, 0), height - REACHED);
}

export default function SectionNav() {
  const [items, setItems] = useState<Item[]>([]);
  const links = useRef<(HTMLAnchorElement | null)[]>([]);

  usePageContent(() => {
    /* Two kinds of entry: a numbered heading, and a stretch of page that has
       no heading but is still somewhere you can be — the home page opens with
       its name, its story and Fig. 1 before the first h2, and a rail that
       started at section I would claim the page begins halfway down. Those
       carry `data-rail` with the name to use. */
    const marked = Array.from(
      document.querySelectorAll<HTMLElement>("main h2[id], main [data-rail][id]"),
    );
    const next = marked.map((el) => {
      if (el.dataset.rail) {
        return { id: el.id, num: "", text: el.dataset.rail };
      }
      const withoutNumber = el.cloneNode(true) as HTMLElement;
      withoutNumber.querySelector(".label")?.remove();
      return {
        id: el.id,
        num: el.querySelector(".label")?.textContent?.trim() ?? "",
        text: (withoutNumber.textContent ?? "").trim(),
      };
    });
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
              <span className="rail-num">{item.num}</span>
              <span className="rail-text">{item.text}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
