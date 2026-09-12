"use client";

import { useEffect, useRef } from "react";

/**
 * Runs `read` against whatever page is currently under the masthead, and again
 * whenever that changes.
 *
 * The two pieces of chrome that describe a page — the section rail and the
 * masthead's running head — are rendered outside `<main>`, so they have to look
 * the page up in the DOM. The route change is the wrong moment to do it: the
 * router hands out the new path while React is still rendering the new page, so
 * a read taken then returns the *old* page's markup. That is how the rail came
 * to list the CV's seven sections on the research page for a second after every
 * click. The markup changing is the only signal that cannot be early, so it is
 * the one this listens to.
 *
 * Only `main`'s own children are watched, not the whole subtree: a page swap
 * replaces them all, while the pendulum's readout and Fig. 1's panel rewrite
 * their own text many times a second, and there is no reason for the chrome to
 * wake up for that.
 */
export default function usePageContent(read: () => void) {
  /* Kept in a ref so the caller does not have to memoise a callback to avoid
     tearing the observer down and building it again on every render. */
  const latest = useRef(read);
  useEffect(() => {
    latest.current = read;
  });

  useEffect(() => {
    const main = document.getElementById("main");
    if (!main) return;

    /* Read straight away rather than on the next animation frame: a tab that
       has never been shown is not given frames at all, and chrome that is
       still empty when the tab is finally looked at is worse than chrome that
       was built a few milliseconds early. */
    const run = () => latest.current();
    run();

    const observer = new MutationObserver(run);
    observer.observe(main, { childList: true });
    return () => observer.disconnect();
  }, []);
}
