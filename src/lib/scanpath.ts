/* ==========================================================================
   Four habits of looking.

   The master's project asked whether four industrial activities can be told
   apart from gaze alone: walking, waiting, using a tool — gluing printed parts
   with a glue gun — and assembling truck parts onto a chassis. Ten volunteers
   wore a HoloLens 2 in the DFKI smart factory, nineteen features were computed
   from the eye tracker's stream, and tree ensembles separated the four.

   The scanpaths here are **drawn, not recorded**. Nothing in the study's data
   is published, and nothing in it is reproduced: what these generators encode
   is the shape of the difference the features measure — how long the eye rests,
   how far it travels, how widely it wanders, how often it blinks — so that a
   reader can see why four such different habits of looking are separable at
   all. The figure says so in its caption, and this comment is the second place
   it is said.

   They are drawn over a grid and nothing else. The figure used to be a
   workbench with a door, a parts bin, a glue gun and a chassis on it, each
   named; but a classifier working from gaze never sees the bench either. What
   it has is where the eye rested, for how long, how far apart, and how often
   the lids closed — and a field of squares, darkening where the eye stays, is
   that and only that. The pattern is the subject, so the pattern is what is
   left on the page.
   ========================================================================== */

export type Activity = "walking" | "waiting" | "gluing" | "assembling";

/* What each activity looks like on the grid, in a sentence that names its own
   subject. It is the text equivalent of the drawing, which is hidden from
   assistive technology, so it describes the drawing — and nothing in it is
   comparative, because a line that ranks the four reads as a finding, and the
   paths are not data. */
export const ACTIVITIES: { key: Activity; name: string; what: string }[] = [
  {
    key: "walking",
    name: "Walking",
    what: "The eye glances quickly and low across the whole view, and rests nowhere for long.",
  },
  {
    key: "waiting",
    name: "Waiting",
    what: "The eye rests long and drifts, with nowhere in particular to look.",
  },
  {
    key: "gluing",
    name: "Using a tool",
    what: "The eye stays on one spot for long stretches, and barely moves.",
  },
  {
    key: "assembling",
    name: "Assembling",
    what: "The eye shuttles between two places, with the odd glance at a third.",
  },
];

/** One rest of the eye: where, for how long, and whether a blink followed. */
export interface Fixation {
  x: number;
  y: number;
  /** Milliseconds. Drawn as the radius of the mark. */
  dur: number;
  /** Milliseconds from the start of the sequence. */
  at: number;
  blink: boolean;
}

/* The drawing's own coordinates, shared with the component so that the squares
   a scanpath visits are the squares the figure darkens.

   Wide and shallow, for the reason the old workbench was: the narrower the
   field, the more a path folds back over itself, until the four habits of
   looking are four tangles of much the same shape. The eye takes the left of
   it and the grid the rest. */
export const FIELD = { w: 560, h: 220 };

/** The field of view, in the drawing's units: `cols` × `rows` squares of side
    `cell`, from (`x`, `y`). Eleven by six, so a square is about the size of the
    largest fixation mark and a long rest fills one. */
export const GRID = { x: 206, y: 20, cols: 11, rows: 6, cell: 30 };

type Box = { x: number; y: number; w: number; h: number };

/** A block of the grid — `w` × `h` squares from column `col`, row `row` — as a
    box the eye can be sent to. */
const squares = (col: number, row: number, w = 1, h = 1): Box => ({
  x: GRID.x + col * GRID.cell,
  y: GRID.y + row * GRID.cell,
  w: w * GRID.cell,
  h: h * GRID.cell,
});

/** The square a point falls in, as an index into the grid read row by row. */
export function squareAt(x: number, y: number): number {
  const clamp = (v: number, n: number) => Math.max(0, Math.min(n - 1, Math.floor(v)));
  const col = clamp((x - GRID.x) / GRID.cell, GRID.cols);
  const row = clamp((y - GRID.y) / GRID.cell, GRID.rows);
  return row * GRID.cols + col;
}

/* Where each habit sends the eye. No square stands for anything: these are
   the shapes of the four patterns, not places in a room. */
const WHOLE = squares(0, 0, GRID.cols, GRID.rows);
const SPOT = squares(5, 2);
const LEFT = squares(2, 3, 2, 2);
const RIGHT = squares(6, 3, 2, 2);
const ABOVE = squares(4, 1, 2, 1);
const LOW = squares(0, 4, GRID.cols, 2);
const CORNER = squares(8, 0, 3, 2);

/** A small deterministic generator, so a scanpath is the same every visit. */
function random(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** A point inside a box, biased to its middle the way a fixation is. */
function inside(box: Box, rnd: () => number) {
  const bias = () => (rnd() + rnd() + rnd()) / 3;
  return { x: box.x + bias() * box.w, y: box.y + bias() * box.h };
}

/**
 * A scanpath for one activity, as a fixed sequence that loops.
 *
 * Each activity is a habit rather than a path: where the eye is sent, how long
 * it stays, and how often the lids close. The numbers are chosen to sit apart
 * from each other in exactly the four families of feature the study computed,
 * because that separation is the thing being illustrated.
 */
export function scanpath(activity: Activity): Fixation[] {
  const rnd = random({ walking: 11, waiting: 29, gluing: 47, assembling: 83 }[activity]);
  const out: Fixation[] = [];
  let at = 0;

  const push = (p: { x: number; y: number }, dur: number, blink: boolean) => {
    out.push({ x: p.x, y: p.y, dur, at, blink });
    at += dur + 90 + rnd() * 70;
  };

  const count = 34;
  for (let i = 0; i < count; i++) {
    switch (activity) {
      case "gluing": {
        // The eye barely leaves one square: long rests, almost no travel, and
        // blinks suppressed the way close work suppresses them.
        push(inside(SPOT, rnd), 430 + rnd() * 420, rnd() < 0.06);
        break;
      }
      case "assembling": {
        // Back and forth between two places, and now and then a look at a
        // third. Structure, not scatter.
        const where = i % 5 === 4 ? ABOVE : i % 2 ? LEFT : RIGHT;
        push(inside(where, rnd), 190 + rnd() * 230, rnd() < 0.12);
        break;
      }
      case "walking": {
        // Wide, quick, and low: a person on the move reads the ground ahead and
        // the rest of the view in glances, and almost never rests.
        push(inside(rnd() < 0.55 ? LOW : WHOLE, rnd), 110 + rnd() * 130, rnd() < 0.16);
        break;
      }
      case "waiting": {
        // Nothing to do and nowhere to look: long, aimless rests over the whole
        // view, drifting back to one corner of it, and blinking often.
        push(inside(rnd() < 0.3 ? CORNER : WHOLE, rnd), 260 + rnd() * 520, rnd() < 0.3);
        break;
      }
    }
  }
  return out;
}

/**
 * The four families of feature, as the study grouped its nineteen: how often
 * the lids close, how long the eye rests, how far it spreads, and how much
 * ground it covers per second. Measured over whatever is currently on screen,
 * and scaled to the range the four activities actually occupy so that the bars
 * fill the space rather than huddling at one end.
 */
export interface Features {
  blinks: number;
  dwell: number;
  spread: number;
  rate: number;
}

export function features(window: Fixation[]): Features {
  if (window.length < 2) return { blinks: 0, dwell: 0, spread: 0, rate: 0 };
  const span = (window[window.length - 1].at + window[window.length - 1].dur - window[0].at) / 1000;
  const mx = window.reduce((s, f) => s + f.x, 0) / window.length;
  const my = window.reduce((s, f) => s + f.y, 0) / window.length;
  const spread = Math.sqrt(
    window.reduce((s, f) => s + (f.x - mx) ** 2 + (f.y - my) ** 2, 0) / window.length,
  );
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  return {
    blinks: clamp(window.filter((f) => f.blink).length / window.length / 0.3),
    dwell: clamp(window.reduce((s, f) => s + f.dur, 0) / window.length / 800),
    spread: clamp(spread / SPREAD_FULL),
    rate: clamp(window.length / span / 3.4),
  };
}

/** The spread, in the drawing's units, that fills its meter. */
const SPREAD_FULL = 95;
