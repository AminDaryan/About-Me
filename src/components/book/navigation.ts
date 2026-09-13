"use client";

import { useEffect } from "react";
import { getBookDirection, type BookDirection, type BookRoute } from "./route-order";

export type BookTurn = Readonly<{
  from: string;
  to: string;
  direction: BookDirection;
}>;

let visiblePage: string | null = null;
let pendingTurn: BookTurn | null = null;
const activeAnimations = new Set<Animation>();

export function canAnimateBook() {
  return typeof document.startViewTransition === "function"
    && CSS.supports("view-transition-class: book-page")
    && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function prepareBookTurn(href: string) {
  const from = visiblePage ?? window.location.pathname;
  const destination = new URL(href, window.location.href);
  const direction = getBookDirection(new URL(from, window.location.origin).href, destination.href);
  pendingTurn = direction && canAnimateBook()
    ? { from, to: destination.pathname.replace(/\/+$/, "") || "/", direction }
    : null;
}

export function arriveAtBookPage(page: BookRoute) {
  const turn = pendingTurn?.to === page ? pendingTurn : null;
  visiblePage = page;
  return turn;
}

export function leaveBookPage(page: BookRoute) {
  return pendingTurn?.from === page ? pendingTurn : null;
}

/** Read history intent before Next's listener; never modify history or scroll. */
export function useBookNavigationHistory() {
  useEffect(() => {
    const onHistory = () => prepareBookTurn(window.location.href);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = () => {
      if (reduced.matches) activeAnimations.forEach(animation => animation.finish());
    };
    window.addEventListener("popstate", onHistory, true);
    reduced.addEventListener("change", onMotionChange);
    return () => {
      window.removeEventListener("popstate", onHistory, true);
      reduced.removeEventListener("change", onMotionChange);
    };
  }, []);
}

/** Animate browser snapshots, keeping direction fixed for the entire turn. */
export function animateBookSnapshot(
  name: string,
  phase: "old" | "new",
  turn: BookTurn | null,
) {
  if (!turn || !canAnimateBook()) return;
  const offset = `${turn.direction * (phase === "new" ? 100 : -100)}vw`;
  const rest = { transform: "translateX(0)", opacity: 1 };
  const away = { transform: `translateX(${offset})`, opacity: 1 };
  const animation = document.documentElement.animate(
    phase === "new" ? [away, rest] : [rest, away],
    {
      pseudoElement: `::view-transition-${phase}(${name})`,
      duration: window.matchMedia("(max-width: 47.99rem)").matches ? 360 : 440,
      easing: "cubic-bezier(.4, 0, .2, 1)",
      fill: "both",
    },
  );
  activeAnimations.add(animation);
  void animation.finished.then(
    () => activeAnimations.delete(animation),
    () => activeAnimations.delete(animation),
  );
  return () => {
    activeAnimations.delete(animation);
    animation.cancel();
  };
}
