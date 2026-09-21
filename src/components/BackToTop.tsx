"use client";

import { useEffect, useRef } from "react";

/* The way back to the top, once the page has run on far enough that the
   masthead is out of sight. It is a link to the same anchor the skip link
   uses rather than a button calling scrollTo: it then works before hydration,
   it is announced as a destination, and the one place that decides how a jump
   moves stays `html { scroll-behavior }` — which already turns instant under
   prefers-reduced-motion. */

/** Show it once the reader is this far down; roughly a screen and a half. */
const AFTER = 900;

export default function BackToTop() {
  const link = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    /* Below the two-column grid the text runs to within a gutter of the
       screen's edge, and a mark fixed in the corner sat on the last words of
       every screen the reader scrolled through. There it shows only on the
       way back up, which is when it is wanted — not at the foot of the page
       either, where the footer's icons now run to the corner. */
    const narrow = window.matchMedia("(max-width: 63.99rem)");
    let frame = 0;
    let lastY = window.scrollY;
    let up = false;
    const mark = () => {
      frame = 0;
      const y = window.scrollY;
      // A few pixels either way is the page settling, not the reader turning.
      if (Math.abs(y - lastY) > 4) {
        up = y < lastY;
        lastY = y;
      }
      link.current?.toggleAttribute("data-show", y > AFTER && (!narrow.matches || up));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(mark);
    };

    mark();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <a ref={link} href="#main" className="to-top no-print" aria-label="Back to the top">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="M12 19 V6.2 M6 11.6 L12 5.5 L18 11.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}
