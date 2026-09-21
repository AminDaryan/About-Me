import { useId } from "react";
import { writingPath, ornamentPath } from "./geometry";
import styles from "./MarginalStudy.module.css";

/** An engraved quill cut for writing, with its nib at the local origin: a bare
    calamus for half its length and a short trimmed plume above it.

    It was drawn as a full lanceolate vane with veins hatched across the shaft,
    and every reader saw a leaf on a red stem — rightly, since that is what the
    drawing said. What tells a feather from a leaf is the bare stretch that says
    "held", a plume narrower than a blade, and barbs that comb one way and never
    cross the shaft. A scribe trimmed his quill down to about this, so the
    accurate drawing is also the legible one. */
export function Quill() {
  return (
    <g>
      {/* The vane: both webs, the outer one twice the inner, with two notches
          in its edge. A vane drawn as one smooth almond is a leaf however it
          is hatched, and the notches cost two line segments. */}
      <path className={styles.paper} d="M6.2-19.6C4.6-23.4 4.8-27.4 5.4-31L6.6-32.6C6.2-34.6 7.1-38 8.5-40.6L9.6-41.6C11.3-44.4 13.4-46.8 15.6-48.6C17-49.8 18.1-50.6 18.6-51.2C18.4-49 18-47.2 17.4-45.4C16.6-41.8 15.8-38.8 14.8-36.4C13.6-33.6 12.8-30.8 11.8-28.6C10.4-25.4 8.6-22.2 7.2-21.8Z" />
      {/* The rachis stops short of the vane's tip: a midrib that arrives at the
          apex is the one mark every leaf has and no feather does. */}
      <path d="M0 0Q6.6-25 17.6-48.6" />
      {/* Barbs comb one way, at one angle, from the rachis to the edge. They
          used to cross it in two families, which is venation, not a feather. */}
      <path className={styles.hatching} d="M7.6-24.4L4.9-27.4M9.4-28.6L6-31.6M11.2-33L7.3-36.2M13-37.4L9.6-40.6M14.8-41.6L11.8-44.4M16.4-45.4L13.8-47.6" />
      {/* The nib: a shouldered taper with its slit, rather than nine units of
          the shaft painted red, which read as a stem. */}
      <path className={styles.paper} d="M0 0L1.5-9.6Q3-11.2 4.6-9.2L3-3.4Z" />
      <path d="M0.4-1L1.9-6.4" />
      {/* The one accent in the figure, on the one live thing in it: the bead of
          ink where the nib meets the page. */}
      <ellipse className={styles.accent} cx="-0.2" cy="0.7" rx="1.6" ry="1.2" />
    </g>
  );
}

/** The quill writing a line in the open book: the line, the mask that reveals
    it under the nib, and the quill. At rest the line is written and the nib
    stands at its end — see the reading study in motion.ts for the cycle.

    The lean is on the moving group, not baked into the drawing, so the quill
    can straighten to dip in the inkwell and lean again to write. */
export function BookWriting() {
  const maskId = useId();
  return (
    <>
      <defs>
        {/* The reveal is a stroke along the line itself, three units wide:
            enough to cover the ink, not so wide that it uncovers the next
            letter before the nib gets there. */}
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="210" height="140">
          <path data-motion="writing-mask" d={writingPath} pathLength={1} stroke="white" strokeWidth="3" strokeDasharray="1" strokeDashoffset="0" />
        </mask>
      </defs>
      <path data-motion="written-line" className={styles.writtenLine} d={writingPath} mask={`url(#${maskId})`} />
      <g data-motion="quill" className={styles.bookQuill}>
        <g transform="scale(.66)"><Quill /></g>
      </g>
    </>
  );
}

/** The ornament's quill tracing its flourish. */
export function QuillWriting() {
  const maskId = useId();
  return (
    <>
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="144">
          <path data-motion="writing-mask" d={ornamentPath} pathLength={1} stroke="white" strokeWidth="5" strokeDasharray="1" strokeDashoffset="1" />
        </mask>
      </defs>
      <path className={styles.writtenLine} d={ornamentPath} />
      <g data-motion="wet-ink" opacity="0" mask={`url(#${maskId})`}>
        <path fill="currentColor" stroke="none" d="M25 71.8C70 46.8 113 94.8 172 69.8L172 70.4C113 97.3 70 49.3 25 72.3Z" />
      </g>
      <g data-motion="quill" className={styles.ornamentQuill}>
        <g transform="scale(.68)"><Quill /></g>
      </g>
    </>
  );
}
