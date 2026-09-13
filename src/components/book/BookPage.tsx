"use client";

// Next 16.3 supplies these APIs through its bundled App Router React runtime.
import type {} from "react/canary";
import { ViewTransition, useLayoutEffect, useRef, type ReactNode } from "react";
import { animateBookSnapshot, arriveAtBookPage, leaveBookPage, type BookTurn } from "./navigation";
import type { BookRoute } from "./route-order";
import "./book.css";

/** One page is one browser snapshot. The live DOM and its canvas state stay React-owned. */
export default function BookPage({ page, children }: { page: BookRoute; children: ReactNode }) {
  const arrival = useRef<BookTurn | null>(null);
  const departure = useRef<BookTurn | null>(null);

  useLayoutEffect(() => {
    arrival.current = arriveAtBookPage(page);
    return () => { departure.current = leaveBookPage(page); };
  }, [page]);

  return (
    <ViewTransition
      enter="book-page"
      exit="book-page"
      default="none"
      onEnter={instance => animateBookSnapshot(instance.name, "new", arrival.current)}
      onExit={instance => animateBookSnapshot(instance.name, "old", departure.current)}
    >
      <div className="book-sheet" data-book-page={page}>
        {children}
      </div>
    </ViewTransition>
  );
}
