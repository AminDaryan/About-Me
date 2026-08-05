"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Reveals an element as it enters the viewport, once, then stops observing.
 * Honours prefers-reduced-motion by simply showing the content.
 *
 * Exposed as a hook as well as a component so that elements which must keep a
 * specific tag — a list item inside a <ul>, say — can settle without being
 * wrapped in a <div> that would break the markup.
 */
export function useSettle<T extends HTMLElement>(delay = 0) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      el.classList.add("is-in");
      return;
    }

    let timer: number | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          timer = window.setTimeout(() => el.classList.add("is-in"), delay * 1000);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) window.clearTimeout(timer);
    };
  }, [delay]);

  return ref;
}

export default function Settle({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useSettle<HTMLDivElement>(delay);

  return (
    <div ref={ref} className={`settle ${className}`}>
      {children}
    </div>
  );
}
