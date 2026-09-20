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

/** The handle of markTurning's fallback timer. */
let unstick = 0;

/**
 * Marks the document while a page is turning, for the chrome that describes
 * the page rather than framing it.
 *
 * A view transition paints the two sheets as snapshots in the top layer and
 * stops painting the live ones. Anything not captured — the margin rail — goes
 * on being painted underneath, and a page's snapshot is mostly transparent, so
 * the rail showed straight through the old page's text while it slid away,
 * already listing the sections of the page that had not arrived yet. The rail
 * steps out for the turn and comes back with the page it belongs to.
 *
 * It goes the moment a turn is decided on, which is a few frames before the
 * first snapshot is animated: the new markup — and so the new rail — is in the
 * document before then, and a rail that faded out from there would spend its
 * fade listing the wrong page's sections.
 */
function markTurning(on: boolean) {
  document.documentElement.toggleAttribute("data-book-turning", on);
  clearTimeout(unstick);
  /* A turn that is prepared and never runs — a click the router declines, a
     route that renders without animating — must not leave the rail hidden. */
  if (on) {
    unstick = window.setTimeout(() => {
      if (!activeAnimations.size) markTurning(false);
    }, 1200);
  }
}

function forget(animation: Animation) {
  if (!activeAnimations.delete(animation)) return;
  if (!activeAnimations.size) markTurning(false);
}

export function canAnimateBook() {
  return typeof document.startViewTransition === "function"
    && CSS.supports("view-transition-class: book-page")
    && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function prepareBookTurn(href: string) {
  /* A new destination supersedes the current slide rather than waiting behind
     it. The superseded animations come off the books before they are finished,
     or their `finished` promises — which settle on a microtask, after this
     function has returned and marked the new turn — would take the new turn's
     mark down with them. */
  const superseded = [...activeAnimations];
  activeAnimations.clear();
  superseded.forEach(animation => animation.finish());
  const from = visiblePage ?? window.location.pathname;
  const destination = new URL(href, window.location.href);
  const direction = getBookDirection(new URL(from, window.location.origin).href, destination.href);
  pendingTurn = direction && canAnimateBook()
    ? { from, to: destination.pathname.replace(/\/+$/, "") || "/", direction }
    : null;
  if (pendingTurn) markTurning(true);
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
    () => forget(animation),
    () => forget(animation),
  );
  return () => {
    forget(animation);
    animation.cancel();
  };
}
