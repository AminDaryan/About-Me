import styles from "./MarginalStudy.module.css";
import { QuillWriting } from "./Quill";
import { board, knightFrom, knightPose, knightTo, ring } from "./board";

export type Subject = "reading" | "psychology" | "archery" | "chess" | "ornament";

export const descriptions: Record<Subject, string> = {
  reading: "Reading: a feather quill follows a curved line in an open book, beside an inkwell",
  psychology: "Psychology: an engraved profile with unfolding lines of thought",
  archery: "Archery: the bow draws and relaxes, with its arrow resting against the string",
  chess: "Chess: on a board seen from White's side, a knight moves from g1 to f3 and back",
  ornament: "A feather quill traces an ink flourish",
};

function Reading() {
  return (
    <>
      {/* One ground line, drawn first and running past both feet, as every
          other study on the site has: the book's spine rests on it and the
          inkwell stands on it. The table line used to exist under the well
          alone, so the book hovered beside it and the two read as two drawings
          that happened to overlap. */}
      <path className={styles.detail} d="M28 126H192" />
      {/* The boards: one closed silhouette, six units proud of the pages, with
          the tone of their near face lying between the two. They were an open
          U before — a foot and two verticals that began in mid-air, and the
          right one ran down into the inkwell's mouth, where a line that enters
          an object and stops reads as a rod standing in the pot. */}
      <path className={styles.paper} d="M32 53Q66 41 104 62Q142 41 176 53V115Q142 107 104 126Q66 107 32 115Z" />
      <path className={styles.detail} fill="currentColor" stroke="none" d="M32 115Q66 107 104 126Q142 107 176 115L170 110Q140 102 104 121Q68 102 38 110Z" />
      <path className={styles.paper} d="M38 59Q68 47 104 67Q140 47 170 59V110Q140 102 104 121Q68 102 38 110Z" />
      <path d="M104 67V121" />
      {/* Three rules on the left page and two on the right, so that the third
          line of the right page is left to the one being written. */}
      <path className={styles.detail} d="M46 77Q72 68 96 83M46 87Q72 78 96 93M46 97Q72 88 96 103M107 80Q133 70 157 75M107 90Q133 80 157 85" />
      <QuillWriting />
      <Inkwell />
    </>
  );
}

/** A squat glass inkwell standing on the table line, with ink in its neck. It
    stands clear of the boards rather than in front of them: overlapped, an edge
    of the book ended somewhere on its silhouette, and the edge that ended at
    its rim was read as a rod standing in the pot. */
function Inkwell() {
  return (
    <>
      <path className={styles.paper} d="M176 126Q170 113 178 106H196Q204 113 198 126Z" />
      <path className={styles.paper} d="M181 106V101.5H193V106" />
      <path d="M178.5 101.5H195.5" />
      <ellipse cx="187" cy="101.5" rx="4.4" ry="1.25" fill="currentColor" stroke="none" />
      <path className={styles.hatching} d="M179 114Q177.5 119 179.5 124M182 112Q181 118 183 124" />
    </>
  );
}

function Psychology() {
  return (
    <>
      <path d="M61 124L69 100C55 92 49 76 50 57C51 30 69 18 95 20C120 22 133 37 130 61L143 79L131 83V94Q130 104 112 101L110 124" />
      <path className={styles.detail} d="M58 129H117M119 66L125 67M127 90H132M74 93Q87 103 100 100" />
      <path className={styles.detail} d="M70 43C72 32 85 30 92 36C102 29 115 35 116 44C127 49 123 65 114 68C111 78 96 79 90 72C79 79 67 69 69 62C60 57 63 46 70 43Z" />
      <path className={styles.detail} d="M72 44Q86 40 84 53T76 64M96 37Q91 45 100 49T112 44M93 69Q103 60 114 65" />
      <path data-motion="thought" className={styles.thought} pathLength={1} d="M74 53C77 45 91 48 92 57C92 66 107 64 111 54C119 39 80 33 74 53Z" />
    </>
  );
}

function Archery() {
  return (
    <>
      <path className={styles.detail} d="M157 126H188M174 100L163 126M177 101L185 126" />
      <ellipse cx="175" cy="72" rx="12" ry="31" />
      <ellipse className={styles.detail} cx="175" cy="72" rx="8" ry="23" />
      <ellipse className={styles.accent} cx="175" cy="72" rx="3" ry="9" />
      <path d="M50 24Q108 72 50 120M52 28Q101 72 52 116" />
      <path strokeWidth="2.5" d="M78 67V77" />
      {/* Scaling around the limb tips keeps both ends fixed while the nock draws. */}
      <path data-motion="bowstring" className={styles.bowstring} vectorEffect="non-scaling-stroke" d="M50 24L26 72L50 120" />
      <g data-motion="arrow" className={styles.arrow}>
        <path d="M50 72H130L123 68M130 72L123 76M51 67L62 72L51 77M58 67L69 72L58 77" />
      </g>
    </>
  );
}

function Chess() {
  const target = ring(knightTo, 0.3);
  return (
    <>
      <path className={styles.paper} d={board.rim} />
      <path className={styles.boardEdge} d={board.edge} />
      <path className={styles.darkSquares} d={board.dark} />
      <path className={styles.detail} d={board.surface} />
      <path className={styles.route} d={board.route} />
      <ellipse className={styles.accent} {...target} />
      {/* Drawn standing on its own base, KNIGHT_UNITS tall, and set on the
          board by a transform that scales it with the square it stands on. */}
      <g data-motion="knight" style={{ transform: knightPose(knightFrom) }}>
        <path className={styles.paper} d="M-15-4V0A15 6.8 0 0 0 15 0V-4A15 6.8 0 0 0-15-4Z" />
        <path className={styles.detail} d="M-15-4A15 6.8 0 0 0 15-4" />
        <path className={styles.paper} d="M-9-6C-11-14-8-22-3-25C-7-25-12-25-15.5-28C-18-30-17-34.5-13.5-36.5C-10-41-6-46-2-48L0-55L3.5-48.5C10-47 14-40 14-31C14-22 9-14 10-6Q0-2.5-9-6Z" />
        <path className={styles.detail} d="M5-45.5C11-40 12-32 8.5-23M-6.5-40.5H-4.5" />
      </g>
    </>
  );
}

function Ornament() { return <QuillWriting ornament />; }

export const drawings = { reading: Reading, psychology: Psychology, archery: Archery, chess: Chess, ornament: Ornament };

/** Each drawing's viewBox, cropped to the drawing at rest, so that the edges
    of the drawing are the edges of the frame it is set in: its top on the
    capitals of the paragraph's first line, its foot on the third line's
    baseline, and its right edge on the margin's. What moves may leave it — a
    bowstring drawn back, a quill lifted. The ornament is not set beside a
    paragraph and keeps the frame it was drawn in. */
export const frames: Record<Subject, string> = {
  reading: "27.4 48.6 173.9 78",
  psychology: "49.89 19.79 93.11 109.21",
  archery: "49.98 24 138.02 102",
  chess: board.frame,
  ornament: "0 0 200 100",
};
