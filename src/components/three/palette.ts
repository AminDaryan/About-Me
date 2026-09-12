"use client";

/* The two WebGL figures draw in the page's own ink.
 *
 * A canvas cannot inherit a colour, so these used to be three hex values copied
 * into each scene — and a copy of a design token is a copy that will be wrong
 * one day, which is exactly what happened when the ground was warmed and the
 * scenes stayed on the old palette. They are read from the stylesheet instead.
 *
 * Both scenes are loaded with `ssr: false`, so this only ever runs in a browser
 * with the stylesheet already in the head; the fallbacks are what the tokens
 * held when this was written, so a miss is stale rather than wrong.
 */

const read = (name: string, fallback: string) => {
  if (typeof document === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
};

export const INK = read("--color-ink", "#2a231a");
export const RULE = read("--color-rule", "#d3cab7");
export const SOFT = read("--color-ink-soft", "#5c5044");
export const ACCENT = read("--color-accent", "#96442d");
