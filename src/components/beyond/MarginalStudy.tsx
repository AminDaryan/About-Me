"use client";

import { drawings, descriptions, frames, type Subject } from "./StudyDrawings";
import { builders, studies } from "./motion";
import { useIllustrationLoop } from "./useIllustrationLoop";
import styles from "./MarginalStudy.module.css";

/** The SVG stays mounted so renewed interest never rewinds a moving figure. */
export default function MarginalStudy({ subject }: { subject: Subject }) {
  const { ref, ...interaction } = useIllustrationLoop(builders[subject], studies[subject].duration);
  const Drawing = drawings[subject];
  const [, , width, height] = frames[subject].split(" ");
  return (
    <div ref={ref} {...interaction} className={styles.figure} data-subject={subject} role="img" aria-label={descriptions[subject]} tabIndex={0}>
      {/* The stroke width is in screen pixels: see .figure svg. The aspect
          ratio is the viewBox's, stated so the width follows the height in
          every browser rather than falling back to an inline SVG's 300px. */}
      <svg viewBox={frames[subject]} style={{ aspectRatio: `${width} / ${height}` }} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <Drawing />
      </svg>
    </div>
  );
}
