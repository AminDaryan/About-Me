"use client";

import { useSyncExternalStore } from "react";

/**
 * Assembles the address on the client so the plain string never appears in the
 * server-rendered HTML for scrapers to harvest. Before hydration, and with
 * JavaScript off, the obfuscated form is still readable by a human.
 *
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

  const address = "amindarian" + String.fromCharCode(64) + "gmail" + "." + "com";

  return (
    <a className={`link ${className}`} href={`mailto:${address}`}>
      {address}
    </a>
  );
}
