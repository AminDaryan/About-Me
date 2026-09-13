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
      {/* The book and the quill writing in it are drawn smaller and set down,
          so an inkwell can stand beside the book on the same table line within
          the same frame. The group is scaled rather than the paths, so the
          quill's motion and its reveal mask stay in the coordinates
          geometry.ts gives them. */}
      <g transform="translate(0 16) scale(.84)">
        <path className={styles.paper} d="M21 52Q55 42 94 60Q130 43 168 52V116Q129 106 94 123Q57 108 21 116Z" />
        <path d="M94 60V123M16 57V122Q55 115 94 129Q135 114 173 122V57" />
        <path className={styles.detail} d="M31 64Q58 58 82 69M31 74Q58 68 82 79M31 84Q58 78 82 89M31 94Q51 90 69 97M107 70Q133 60 157 65M107 80Q133 71 157 75M107 90Q126 84 143 86" />
        <QuillWriting />
      </g>
      <Inkwell />
    </>
  );
}

/** A squat glass inkwell on the table line, with ink standing in its neck. It
    stands in front of the book's corner: beside it, the drawing was too wide
    to be set three lines deep inside the margin. */
function Inkwell() {
  return (
    <>
      <path className={styles.detail} d="M125 124.5H167" />
      <path className={styles.paper} d="M135 124Q129 111 137 104H157Q165 111 159 124Z" />
      <path className={styles.paper} d="M141 104V99.5H153V104" />
      <path d="M138.5 99.5H155.5" />
      <ellipse cx="147" cy="99.5" rx="4.6" ry="1.3" fill="currentColor" stroke="none" />
      <path className={styles.hatching} d="M138 110Q136 116 138.5 121M141 108Q140 115 142 121" />
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
  reading: "13.44 54.79 153.56 69.71",
  psychology: "49.89 19.79 93.11 109.21",
  archery: "49.98 24 138.02 102",
  chess: board.frame,
  ornament: "0 0 200 100",
};
