"use client";

import { useState, type PointerEvent } from "react";
import { drawings, descriptions, type Subject } from "./StudyDrawings";
import styles from "./MarginalStudy.module.css";

/** A complete engraving at rest; each interaction starts one finite study. */
export default function MarginalStudy({ subject }: { subject: Subject }) {
  const [performance, setPerformance] = useState(0);
  const Drawing = drawings[subject];
  const play = () => setPerformance(value => value + 1);

  function handlePointerEnter(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "touch") play();
  }

  return (
    <div
      className={styles.figure}
      role="img"
      aria-label={descriptions[subject]}
      tabIndex={0}
      onPointerEnter={handlePointerEnter}
      onClick={event => {
        const nativeEvent = event.nativeEvent;
        if (("pointerType" in nativeEvent && nativeEvent.pointerType === "touch") || window.matchMedia("(hover: none)").matches) play();
      }}
      onFocus={event => { if (event.currentTarget.matches(":focus-visible")) play(); }}
    >
      <svg
        key={performance}
        className={performance > 0 ? styles.playing : undefined}
        viewBox="0 0 200 144"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Drawing />
      </svg>
    </div>
  );
}
