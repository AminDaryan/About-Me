"use client";

import { drawings, descriptions, type Subject } from "./StudyDrawings";
import { builders, studies } from "./motion";
import { useIllustrationLoop } from "./useIllustrationLoop";
import styles from "./MarginalStudy.module.css";

/** The SVG stays mounted so renewed interest never rewinds a moving figure. */
export default function MarginalStudy({ subject }: { subject: Subject }) {
  const { ref, ...interaction } = useIllustrationLoop(builders[subject], studies[subject].duration);
  const Drawing = drawings[subject];
  return (
    <div ref={ref} {...interaction} className={styles.figure} data-subject={subject} role="img" aria-label={descriptions[subject]} tabIndex={0}>
      <svg viewBox={subject === "ornament" ? "0 0 200 100" : "0 0 200 144"} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <Drawing />
      </svg>
    </div>
  );
}
