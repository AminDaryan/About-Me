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
      {/* A single desk rule anchors the still life. Its faint echo gives the
          book a little weight without turning this margin drawing into a frame. */}
      <path className={styles.detail} d="M27 126H201" />
      <path className={styles.fine} d="M39 123.2Q70 126.2 104 123.4Q140 126.2 170 123.2" />

      {/* The low dark shape is the book's closed boards seen beneath the open
          leaves. Keeping it behind the paper makes the volume read as a real
          object rather than a flat book pictogram. */}
      <path className={styles.shade} d="M31 113Q67 105 104 124Q141 105 177 113V118Q141 110 104 130Q67 110 31 118Z" />
      <path className={styles.paper} d="M31 53Q66 40 104 62Q142 40 177 53V115Q141 106 104 126Q67 106 31 115Z" />
      <path className={styles.detail} d="M31 53Q66 40 104 62Q142 40 177 53" />
      <path className={styles.fine} d="M35 56Q68 44 101 64M107 64Q141 44 173 56" />

      {/* Separate leaves make the gutter, the page block, and the slightly
          proud boards legible even at the drawing's compact rendered size. */}
      <path className={styles.paper} d="M38 59Q69 48 102.5 66.5V112Q70 101 38 109Z" />
      <path className={styles.paper} d="M105.5 66.5Q139 48 170 59V109Q139 101 105.5 112Z" />
      <path className={styles.fine} d="M39 108Q70 99 102.5 112M105.5 112Q139 99 169 108" />
      <path className={styles.fine} d="M40 111Q70 102 102.5 115M105.5 115Q139 102 169 111" />
      <path d="M104 62Q101.7 91 104 123Q106.3 91 104 62" />
      <path className={styles.hatching} d="M100.8 119.4L104 122.2L107.2 119.4" />

      {/* These are printed page marks, not a block of regular rules: their
          unequal lengths leave room for the quill's live line on the right. */}
      <path className={styles.detail} d="M46 77Q71 68.5 96 82.5M46 87Q71 78.5 94 91.5M46 97Q68 89.5 94 102M110 80Q133 71.5 157 75M110 89Q132 80.5 153 84.5" />
      <path className={styles.fine} d="M47 102.5Q69 96 88 104M111 97Q127 90.8 141 92.4" />
      <QuillWriting />
      <Inkwell />
    </>
  );
}

/** A compact cut-glass well. The ink is visible through a faceted shoulder and
    a single paper-coloured glint keeps it from becoming a small black bottle. */
function Inkwell() {
  return (
    <>
      <ellipse className={styles.fine} cx="187" cy="125" rx="12.3" ry="2.1" />
      <path className={styles.glass} d="M178 106Q174 110 173 116L175 125Q187 128 199 125L201 116Q200 110 196 106Z" />
      <path className={styles.paper} d="M178 106Q174 110 173 116L175 125Q187 127.5 199 125L201 116Q200 110 196 106Z" />
      <path className={styles.fine} d="M173 116Q187 121 201 116M175 124Q187 126.4 199 124" />
      <path className={styles.paper} d="M180 106V101.8H194V106" />
      <path className={styles.paper} d="M182 101.8V99.7H192V101.8" />
      <ellipse className={styles.paper} cx="187" cy="99.7" rx="6.9" ry="2" />
      <ellipse cx="187" cy="100" rx="5.6" ry="1.12" fill="currentColor" stroke="none" />
      <path className={styles.detail} d="M180.2 99.7Q187 97.8 193.8 99.7" />
      <path className={styles.hatching} d="M178.5 112Q176.4 118 178.8 123.5M181.5 109.5Q180 117 182.5 124.4M195.5 109.5Q197.3 117 195.8 123.8" />
      <path className={styles.highlight} d="M184.1 111.4Q182.4 116.5 184.2 120" />
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
