import type { BookRoute } from "../book/route-order";
import { PenNote } from "./PenNotes";
import { GearStudy, PolyhedronStudy, SpiralStudy } from "./StudyDrawings";
import styles from "./ManuscriptMargins.module.css";

type StudyKind = "optics" | "pulley" | "wing" | "polyhedron" | "gear" | "spiral";
type StudyPosition = "opening" | "middle" | "later" | "closing";

const PAGE_STUDIES: Record<BookRoute, readonly { kind: StudyKind; position: StudyPosition }[]> = {
  "/": [
    { kind: "polyhedron", position: "opening" },
    { kind: "gear", position: "middle" },
    { kind: "wing", position: "closing" },
  ],
  "/research": [
    { kind: "optics", position: "opening" },
    { kind: "spiral", position: "middle" },
    { kind: "gear", position: "later" },
    { kind: "polyhedron", position: "closing" },
  ],
  "/cv": [
    { kind: "pulley", position: "opening" },
    { kind: "polyhedron", position: "middle" },
    { kind: "spiral", position: "closing" },
  ],
  // A single opening note sits above Beyond's existing marginal ink trail.
  "/beyond": [{ kind: "wing", position: "opening" }],
};

function OpticsStudy() {
  return (
    <>
      <g className={styles.construction}>
        <path d="M13 76 159 77M45 15l1 128M15 120 153 33M16 36l139 89" />
        <path d="M19 156h123m-116-4-7 4 7 3m110-7 6 4-6 3M28 143l-1 17m104-20 1 21" />
        <path d="M21 31c16-10 34-8 47 1M20 124c16 11 36 12 50 0" />
      </g>
      <path d="M45 30c-13 0-23 22-22 47 0 26 10 48 23 47 13 0 23-22 22-47-1-27-10-48-23-47Z" />
      <path d="M46 33c-10 2-18 21-18 43 0 25 8 43 18 46" strokeWidth="0.8" />
      <path d="M46 30 144 78 46 124M25 56l118 22L26 101M68 77l75 1" />
      <path d="M140 71c4 2 7 4 7 7s-3 6-7 8" />
      <path d="M145 77 158 71m-13 8 12 7" strokeWidth="0.8" />
      <path d="m33 114 8-4m-10-3 8-4m-9-5 7-3m-7-7 6-2M43 38l6 4m-12 2 8 4" strokeWidth="0.75" />
      <circle cx="145" cy="78" r="2" className={styles.inkPoint} />
      <path d="M117 31c-1-6 4-10 9-8 4 2 5 7 2 10-4 5-12 4-15-1" strokeWidth="0.9" />
      <path d="M114 22c7-5 15-2 17 4" className={styles.construction} />
    </>
  );
}

function PulleyStudy() {
  return (
    <>
      <g className={styles.construction}>
        <path d="M27 71h116M84 22l-1 116M32 20h108M24 156l123 1" />
        <path d="m28 61 8 3m98 15 8 2M75 23l2 8m12 83 2 8" />
        <path d="M41 44c16-23 55-25 76-2m-76 58c17 22 54 24 75-1" />
      </g>
      <path d="m76 17 1 16m14-16-1 16M68 17l31 1M73 12l-5 5m13-6-5 6m13-6-5 7m13-6-5 6" />
      <path d="M83 34c-22-1-38 16-38 37-1 21 16 38 37 38 23 1 39-17 39-38 0-20-17-38-38-37Z" />
      <path d="M82 40c-18 0-31 14-31 32 0 17 14 31 32 31 18-1 32-14 32-32-1-18-15-32-33-31Z" strokeWidth="0.8" />
      <path d="m83 41 1 25m23-16L87 67m27 3-25 2m17 22L87 76m-4 26V79m-23 14 19-17M53 72l25-1M60 50l20 17" />
      <path d="M83 66c-3 0-6 2-6 5s3 7 6 7 6-3 6-6-2-6-6-6Z" />
      <path d="M41 118V71c0-24 17-41 41-42 25-1 43 18 44 41l-1 62" />
      <path d="m41 117-5 10h10l-5-10m78 16 13-1 3 22-19 1 3-22ZM34 127l1 14 12-1-1-13" />
      <path d="m120 137 10-1m-11 5 12-1m-12 6 13-2m-96-15 6 4m-6 1 6 4" strokeWidth="0.75" />
      <path d="M60 142c6-3 10-2 12 2 2 3-1 6-5 5m11-6h13m-9 5h7" className={styles.construction} />
    </>
  );
}

function WingStudy() {
  return (
    <>
      <g className={styles.construction}>
        <path d="M17 133c34-55 79-91 137-109M27 139c33-43 77-77 126-101" />
        <path d="m20 151 8-13m119-119 10 16M38 151l105-43" />
      </g>
      <path d="M20 143c25-49 55-88 91-108 15-8 31-12 45-14-3 18-10 36-21 49-28 32-72 51-110 66" />
      <path d="M22 141c35-44 77-81 127-113" strokeWidth="1.6" />
      <path d="M41 119c1-15 5-30 12-41m-6 35c3-21 10-37 18-46m-6 37c5-22 13-36 21-46m-8 36c6-22 16-36 24-46m-12 36c9-23 18-37 27-45m-15 35c11-21 20-33 29-39m-15 30c12-18 20-26 29-32" strokeWidth="0.9" />
      <path d="m42 120 40-17m-31 7 47-21m-36 9 49-22M75 86l48-23m-36 12 47-27m-35 18 43-27m-31 17 35-27" strokeWidth="0.9" />
      <path d="M53 77c-4 4-7 9-8 14m35-34 9-9m31-11 12-6M42 127l11-4m14-5 12-5m34-29 9-6" strokeWidth="0.75" />
      <path d="M35 143c2-4 7-5 10-3 3 3 2 7-2 8-4 1-7-1-8-5Z" />
      <path d="m52 140 9-4m-6 10 14-6" className={styles.construction} />
    </>
  );
}

const STUDIES = {
  optics: { Drawing: OpticsStudy, note: 1 },
  pulley: { Drawing: PulleyStudy, note: 5 },
  wing: { Drawing: WingStudy, note: 9 },
  polyhedron: { Drawing: PolyhedronStudy, note: 12 },
  gear: { Drawing: GearStudy, note: 16 },
  spiral: { Drawing: SpiralStudy, note: 20 },
};

/** Original pen studies are ornament; they never stand in for research figures. */
export function ManuscriptStudy({ kind, className = "" }: { kind: StudyKind; className?: string }) {
  const { Drawing, note } = STUDIES[kind];

  return (
    <svg
      className={`${styles.study} ${className}`}
      viewBox="0 0 210 270"
      width="210"
      height="270"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <g transform={`translate(${note % 2 ? 36 : 20} 9) rotate(${note % 2 ? 2 : -3})`}>
        <PenNote variant={note} lines={note % 2 ? 2 : 3} className={styles.notes} />
      </g>
      <g transform="translate(20 41)">
        <Drawing />
      </g>
      <g transform={`translate(27 231) rotate(${note % 2 ? -2 : 1})`}>
        <PenNote variant={note + 3} lines={note % 2 ? 3 : 2} className={styles.notes} />
      </g>
      {/* Sideways jottings and a connecting stroke make this one small study
          on a working sheet, rather than a diagram with a typeset caption. */}
      {note % 2 === 0 ? (
        <g transform="translate(8 189) rotate(-88) scale(.58)">
          <PenNote variant={note + 7} lines={2} className={styles.notes} />
        </g>
      ) : (
        <path d="M177 32c13 3 19 12 18 28m-3-5 3 6 3-6" className={styles.annotation} />
      )}
      <path
        d={note % 2 ? "M44 218c26-2 41-1 61 0m-18 4 6-5 6 4" : "M32 219c32-2 69 2 96-1m6 0 13-1"}
        className={styles.annotation}
      />
    </svg>
  );
}

export default function ManuscriptMargins({ page }: { page: BookRoute }) {
  const studies = PAGE_STUDIES[page];
  if (!studies.length) return null;

  return (
    <div className={styles.margins} data-page={page} aria-hidden="true">
      {studies.map(({ kind, position }) => (
        <div key={position} className={styles.placement} data-position={position}>
          <ManuscriptStudy kind={kind} />
        </div>
      ))}
    </div>
  );
}
