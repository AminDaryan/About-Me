type PenNoteProps = {
  variant?: number;
  lines?: 2 | 3 | 4;
  className?: string;
};

/* Original, deliberately illegible pen gestures, not historical quotations.
   Each starts at a word's baseline; open loops and an occasional tall or
   descending stroke keep the annotation loose instead of forming a wave. */
const WORDS = [
  {
    width: 20,
    stroke:
      "c1-2 3-3 4-1s-2 3-2 1 4-3 5-1c1 2-2 3-1 1s3-7 4-6-3 7-1 6 3-3 4-1 2 0 4-1",
  },
  {
    width: 23,
    stroke:
      "c1-1 3-4 4-2s-2 3-1 3 2-4 4-3-1 4 1 2 2-5 3-4-2 9-3 7 2-5 4-5 2 3 3 2 2-2 4-1",
  },
  {
    width: 19,
    stroke:
      "c2-1 4-7 3-6s-3 8 0 6 3-3 4-2-2 3-1 3 2-4 3-3 0 4 2 2 2-2 3-1 2 0 3-1",
  },
  {
    width: 22,
    stroke:
      "c1-3 4-4 4-1s-3 2-2 0 4-3 5-1-2 7-3 5 3-7 5-6 0 3 1 3 3-4 4-3-1 3 1 2 3-2 4-1",
  },
  {
    width: 18,
    stroke:
      "c2-2 4-3 4-1s-3 3-2 1 3-6 4-5-2 6-1 6 3-4 4-3-1 3 1 2 2-3 3-2 2 1 4 0",
  },
  {
    width: 21,
    stroke:
      "c1-1 2-3 3-2s-1 3 1 2 3-7 4-6-4 7-2 6 3-3 4-2 0 3 1 3 2-3 3-3-2 7-3 6 3-7 5-5 2 0 4-1",
  },
  {
    width: 20,
    stroke:
      "c2-2 3-3 4-1s-1 2 0 2 2-4 3-3 1 3 2 2 2-7 3-6-3 7-1 6 3-3 4-2-1 3 1 2 2-1 3-1",
  },
  {
    width: 22,
    stroke:
      "c2-1 4-4 4-2s-2 4-1 3 2-4 4-3-1 3 1 2 3-4 4-3-3 9-4 7 3-7 5-6 1 3 3 2 3-2 4-1",
  },
  {
    width: 9,
    stroke: "c1-2 3-3 4-1s-2 3-1 2 2-4 3-3 1 2 2 1",
  },
  {
    width: 32,
    stroke:
      "c1-2 3-3 4-1s-2 3-2 1 4-3 5-1c1 2-2 3-1 1s3-7 4-6-3 7-1 6 3-3 4-1 2 0 4-1c1-2 3-4 4-2s-2 3 0 2 3-4 4-3 0 3 1 3 2-3 3-2 1 0 2-1",
  },
  {
    width: 12,
    stroke: "c1-1 2-6 3-5s-3 6-1 5 3-3 4-2 0 3 1 2 2-2 4-1",
  },
] as const;

const BASELINE_SHIFTS = [0, -0.3, 0.4, -0.1, 0.25];
const LINE_ENDS = [138, 126, 135, 115];

function annotationLine(variant: number, row: number) {
  let x = (variant + row * 2) % 4;
  const baseline = 6.5 + row * 7.7;
  const paths: string[] = [];

  for (let wordIndex = 0; wordIndex < 7; wordIndex += 1) {
    const word = WORDS[(variant * 3 + row * 5 + wordIndex * 7) % WORDS.length];
    if (x + word.width > LINE_ENDS[row]) break;
    const y = baseline + BASELINE_SHIFTS[(wordIndex + row) % BASELINE_SHIFTS.length];
    paths.push(`M${x} ${y}${word.stroke}`);
    x += word.width + 4 + ((variant + wordIndex + row) % 3);
  }

  return paths.join(" ");
}

/** A compact SVG fragment spanning roughly 140 × 35 units at the origin. */
export function PenNote({ variant = 0, lines = 3, className }: PenNoteProps) {
  const seed = Number.isFinite(variant) ? Math.abs(Math.trunc(variant)) % 24 : 0;

  return (
    <g
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {Array.from({ length: lines }, (_, row) => (
        <path key={row} d={annotationLine(seed, row)} />
      ))}
    </g>
  );
}

export default PenNote;
