export type Point = { x: number; y: number };
export type Curve = (t: number) => Point;

export const quadratic = (a: Point, b: Point, c: Point): Curve => t => ({
  x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * b.x + t * t * c.x,
  y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * b.y + t * t * c.y,
});

export const cubic = (a: Point, b: Point, c: Point, d: Point): Curve => t => ({
  x: (1 - t) ** 3 * a.x + 3 * (1 - t) ** 2 * t * b.x + 3 * (1 - t) * t * t * c.x + t ** 3 * d.x,
  y: (1 - t) ** 3 * a.y + 3 * (1 - t) ** 2 * t * b.y + 3 * (1 - t) * t * t * c.y + t ** 3 * d.y,
});

// Arc-length lookup keeps a nib aligned with a normalized SVG reveal mask.
export function byLength(curve: Curve): Curve {
  const points = Array.from({ length: 257 }, (_, i) => curve(i / 256));
  const lengths = [0];
  for (let i = 1; i < points.length; i++) {
    lengths.push(lengths[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
  }
  return fraction => {
    const distance = Math.max(0, Math.min(1, fraction)) * lengths[256];
    const upper = lengths.findIndex(length => length >= distance);
    if (upper <= 0) return points[0];
    const mix = (distance - lengths[upper - 1]) / (lengths[upper] - lengths[upper - 1]);
    return {
      x: points[upper - 1].x + (points[upper].x - points[upper - 1].x) * mix,
      y: points[upper - 1].y + (points[upper].y - points[upper - 1].y) * mix,
    };
  };
}

/** Straight segments through points, parameterised by index — pass it through
    byLength to walk it at an even speed. */
export function polyline(points: Point[]): Curve {
  return t => {
    const at = Math.max(0, Math.min(1, t)) * (points.length - 1);
    const i = Math.min(Math.floor(at), points.length - 2);
    const mix = at - i;
    return {
      x: points[i].x + (points[i + 1].x - points[i].x) * mix,
      y: points[i].y + (points[i + 1].y - points[i].y) * mix,
    };
  };
}

/* The line the quill writes on the right-hand page, in drawing units.

   It used to be a smooth arc, which is what a printed rule is: set in full ink
   so that it could be told from the two rules above it, it still read as a
   third rule, and the quill looked as if it were resting on the page rather
   than writing. A run of small cursive strokes is handwriting at any size —
   at the study's 4.6rem, each letter is two or three pixels, which is what
   a line of writing looks like from arm's length. The strokes ride the page's
   own curve, the one its rules follow, and lean forward the way a right hand
   leans them.

   One list of points is both the ink and the nib's road, so the reveal and the
   nib cannot drift apart: the mask walks the path by length, and so does the
   nib, through byLength. */
const lineBase = quadratic({ x: 107, y: 100 }, { x: 133, y: 90 }, { x: 157, y: 95 });

/** The letters, as height and width in drawing units: an x-height about 2.4,
    two ascenders, widths that vary as a hand's do, and a long flat stroke
    where one word runs into the next. All the same width, they read as a
    ruled wave rather than as words. */
const LETTERS: readonly [height: number, width: number][] = [
  [2.4, 1], [2.6, 0.9], [4.1, 1.1], [2.2, 1],
  [0.3, 1.6],
  [2.5, 1], [2, 0.8], [2.6, 1.1], [3.9, 1], [2.3, 0.9],
  [0.3, 1.6],
  [2.4, 1], [2.6, 1],
];
/** Samples per unit of letter width: enough that a stroke's turn is a curve
    at three times the size it is drawn. */
const STEPS = 14;
/** The writing starts a little in from the gutter, as a hand's does; the
    printed rules above run right into it. */
const INDENT = 0.04;

function handwriting(): Point[] {
  const total = LETTERS.reduce((sum, [, width]) => sum + width, 0);
  const points: Point[] = [];
  let before = 0;
  LETTERS.forEach(([height, width], i) => {
    const steps = Math.round(STEPS * width);
    for (let j = i === 0 ? 0 : 1; j <= steps; j++) {
      const phase = (j / steps) * 2 * Math.PI;
      const along = INDENT + (1 - INDENT) * (before + (width * j) / steps) / total;
      const base = lineBase(along);
      const rise = height * (1 - Math.cos(phase)) / 2;
      points.push({
        // Each stroke loops back a little at its foot and leans forward at
        // its head, which is what turns a wave into a hand.
        x: base.x - 0.7 * Math.sin(phase) + 0.35 * rise,
        y: base.y - rise,
      });
    }
    before += width;
  });
  return points;
}

const writingPoints = handwriting();
export const writingPath = "M" + writingPoints.map(p => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join("L");
export const writingCurve = byLength(polyline(writingPoints));
const LINE_START = writingPoints[0];
const LINE_END = writingPoints[writingPoints.length - 1];

/* Where the nib goes into the ink: the mouth of the inkwell's neck, and the
   depth it dips to, just under the rim, where the neck's fill hides it. */
export const inkwellMouth: Point = { x: 187, y: 98 };
export const inkwellDip = 6.5;

/** From the end of the line up to the inkwell's mouth, a short lift and a
    sideways carry. */
export const toInkwell = cubic(LINE_END, { x: 164, y: 84 }, { x: 180, y: 84 }, inkwellMouth);
/** From the inkwell back over the page to the start of the line. The arc is
    kept low: on a higher one the feather rose above the drawing's frame. */
export const fromInkwell = cubic(inkwellMouth, { x: 176, y: 78 }, { x: 118, y: 80 }, LINE_START);
export const ornamentPath = "M25 72C70 48 113 96 172 70";
export const ornamentCurve = byLength(cubic({ x: 25, y: 72 }, { x: 70, y: 48 }, { x: 113, y: 96 }, { x: 172, y: 70 }));
export const ornamentReturn = cubic({ x: 172, y: 70 }, { x: 165, y: 36 }, { x: 33, y: 37 }, { x: 25, y: 72 });
