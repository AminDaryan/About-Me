"use client";

import { useSyncExternalStore } from "react";

/**
 * The address, decoded in the browser.
 *
 * The previous version built it with `"amindarian" + String.fromCharCode(64) +
 * "gmail" + "." + "com"` and the file claimed the plain string never reached
 * the client. It did. Every operand is a compile-time constant, so the bundler
 * folds the whole expression and ships the finished address:
 *
 *     grep -roh "amindarian[^\"']\{0,12\}" .next/static/chunks/*.js
 *     → the finished address, in full
 *
 * Base64 cannot be folded, because `atob` runs at runtime. So the literal is
 * genuinely absent from the bundle now.
 *
 * Be clear about what that is worth. This defeats a crawler that regexes files
 * for `\S+@\S+`. It does not defeat anyone who opens devtools, runs the page,
 * or reads this comment — and the pre-hydration fallback below still spells the
 * address out in a form a determined scraper can normalise. Obfuscation is not
 * protection, and the honest fix for an address you do not want harvested is a
 * different address, not a cleverer encoding.
 *
 * The fallback stays human-readable on purpose: it is what a visitor with
 * JavaScript disabled, and a screen reader mid-hydration, actually get.
 */
const ADDRESS_B64 = "YW1pbmRhcmlhbkBnbWFpbC5jb20=";

/**
 * useSyncExternalStore rather than an effect: the server snapshot is `false`
 * and the client snapshot is `true`, which gives a clean hydration boundary
 * with no setState cascade.
 */
const subscribe = () => () => {};

export default function Email({ className = "" }: { className?: string }) {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  if (!hydrated) {
    return <span className={className}>amindarian [at] gmail [dot] com</span>;
  }

  const address = atob(ADDRESS_B64);

  return (
    <a className={`link ${className}`} href={`mailto:${address}`}>
      {address}
    </a>
  );
}
