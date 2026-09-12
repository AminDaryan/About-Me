"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether a media query matches, kept in step without an effect or a state
 * update of its own.
 *
 * `onServer` is what the server renders, and what the first client paint must
 * therefore agree with; the real answer arrives on the first subscription. For
 * anything guarded by `prefers-reduced-motion` that answer is `false` — the
 * markup is the same either way, and only the motion differs.
 */
export default function useMedia(query: string, onServer: boolean) {
  return useSyncExternalStore(
    (notify) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", notify);
      return () => m.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => onServer,
  );
}
