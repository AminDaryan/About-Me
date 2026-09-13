import { useId } from "react";
import { writingPath, ornamentPath } from "./geometry";
import styles from "./MarginalStudy.module.css";

/** An engraved feather, with its nib at the local origin. */
export function Quill() {
  return (
    <g>
      <path className={styles.paper} d="M3-13C-3-22-2-29 1-35L4-33L2-39C7-50 16-56 27-69C30-52 28-42 24-34L21-35L23-30C20-24 15-19 9-16L10-23L5-16L0 0Z" />
      <path d="M0 0Q12-31 25-65" />
      <path className={styles.hatching} d="M5-19L1-28M8-25L2-35M10-31L4-41M13-37L8-47M16-44L13-53M19-51L18-58M7-22L18-25M10-29L23-32M13-36L26-40M16-43L27-48M19-51L26-55" />
      <path className={styles.accent} d="M0 0L3-9" />
    </g>
  );
}

export function QuillWriting({ ornament = false }: { ornament?: boolean }) {
  const maskId = useId();
  const line = ornament ? ornamentPath : writingPath;
  return (
    <>
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="144">
          <path data-motion="writing-mask" d={line} pathLength={1} stroke="white" strokeWidth="5" strokeDasharray="1" strokeDashoffset="1" />
        </mask>
      </defs>
      <path className={styles.writtenLine} d={line} />
      <g data-motion="wet-ink" opacity="0" mask={`url(#${maskId})`}>
        {ornament ? (
          <path fill="currentColor" stroke="none" d="M25 71.8C70 46.8 113 94.8 172 69.8L172 70.4C113 97.3 70 49.3 25 72.3Z" />
        ) : (
          <path fill="currentColor" stroke="none" d="M107 99.8Q133 89.5 157 94.8L157 95.4Q133 90.8 107 100.4Z" />
        )}
      </g>
      <g data-motion="quill" className={ornament ? styles.ornamentQuill : styles.bookQuill}>
        <g transform={ornament ? "scale(.68)" : "scale(.78)"}><Quill /></g>
      </g>
    </>
  );
}
