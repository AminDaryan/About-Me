"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { prepareBookTurn } from "./navigation";
import { getBookDirection } from "./route-order";

type Props = Omit<ComponentProps<typeof Link>, "href" | "transitionTypes"> & { href: string };

/** Retains Link prefetching, native modifiers, downloads and anchor behavior. */
export default function BookLink({ href, onNavigate, ...props }: Props) {
  const pathname = usePathname();
  const direction = getBookDirection(pathname, href);

  return (
    <Link
      {...props}
      href={href}
      transitionTypes={direction ? [direction > 0 ? "book-forward" : "book-backward"] : undefined}
      onNavigate={event => {
        let cancelled = false;
        onNavigate?.({ preventDefault() { cancelled = true; event.preventDefault(); } });
        if (!cancelled) prepareBookTurn(href);
      }}
    />
  );
}
