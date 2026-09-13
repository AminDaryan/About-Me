import styles from "./MarginalStudy.module.css";
import { QuillWriting } from "./Quill";

export type Subject = "reading" | "psychology" | "archery" | "chess" | "ornament";

export const descriptions: Record<Subject, string> = {
  reading: "Reading: a feather quill follows a curved line in an open book, beside an inkwell",
  psychology: "Psychology: an engraved profile with unfolding lines of thought",
  archery: "Archery: the bow draws and relaxes, with its arrow resting against the string",
  chess: "Chess: a knight considers two positions, moving two files and one rank, then returning",
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

/** A squat glass inkwell on the table line, with ink standing in its neck. */
function Inkwell() {
  return (
    <>
      <path className={styles.detail} d="M150 124.5H192" />
      <path className={styles.paper} d="M160 124Q154 111 162 104H182Q190 111 184 124Z" />
      <path className={styles.paper} d="M166 104V99.5H178V104" />
      <path d="M163.5 99.5H180.5" />
      <ellipse cx="172" cy="99.5" rx="4.6" ry="1.3" fill="currentColor" stroke="none" />
      <path className={styles.hatching} d="M163 110Q161 116 163.5 121M166 108Q165 115 167 121" />
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
      <path strokeWidth="3" d="M78 67V77" />
      {/* Scaling around the limb tips keeps both ends fixed while the nock draws. */}
      <path data-motion="bowstring" className={styles.bowstring} vectorEffect="non-scaling-stroke" d="M50 24L26 72L50 120" />
      <g data-motion="arrow" className={styles.arrow}>
        <path d="M50 72H130L123 68M130 72L123 76M51 67L62 72L51 77M58 67L69 72L58 77" />
      </g>
    </>
  );
}

function Chess() {
  return (
    <>
      {/* An eight-by-eight board, foreshortened to fit the margin. */}
      <path className={styles.boardFill} d="M20 51H180V123H20Z" />
      <path className={styles.detail} d="M20 51H180V123H20ZM20 60H180M20 69H180M20 78H180M20 87H180M20 96H180M20 105H180M20 114H180M40 51V123M60 51V123M80 51V123M100 51V123M120 51V123M140 51V123M160 51V123" />
      {[0, 1, 2, 3, 4, 5, 6, 7].flatMap(row => [0, 1, 2, 3, 4, 5, 6, 7].filter(col => (row + col) % 2 === 0).map(col => (
        <rect key={`${row}-${col}`} className={styles.square} x={20 + col * 20} y={51 + row * 9} width="20" height="9" />
      )))}
      <path className={styles.route} pathLength={1} d="M50 109.5H90V100.5" />
      <circle className={styles.destination} cx="90" cy="100.5" r="3" />
      <g transform="translate(-7.5 4.5)">
      <g data-motion="knight">
        <path className={styles.paper} d="M43 105V101L47 97H68L72 101V105ZM48 97C48 85 58 86 59 75L50 80L43 75L54 59L54 50L64 57C79 60 79 74 71 85L68 97Z" />
        <path className={styles.detail} d="M48 72L54 67M62 61H64M47 101H68M68 65Q76 75 65 87" />
      </g>
      </g>
    </>
  );
}

function Ornament() { return <QuillWriting ornament />; }

export const drawings = { reading: Reading, psychology: Psychology, archery: Archery, chess: Chess, ornament: Ornament };
