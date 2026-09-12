/* ==========================================================================
   Four ways of looking at a workbench.

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
   ========================================================================== */

export type Activity = "walking" | "waiting" | "gluing" | "assembling";

export const ACTIVITIES: { key: Activity; name: string; what: string }[] = [
  { key: "walking", name: "Walking", what: "moving about, settling on nothing" },
  { key: "waiting", name: "Waiting", what: "still, looking around with no target" },
  { key: "gluing", name: "Using a tool", what: "gluing printed parts with a glue gun" },
  { key: "assembling", name: "Assembling", what: "building truck parts onto a chassis" },
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

/* The drawing's own coordinates, shared with the component so that the places
   a scanpath visits are the places the scene draws. */
export const FIELD = { w: 360, h: 208 };
/** The things on the bench, as boxes the eye can be sent to. */
export const PLACES = {
  chassis: { x: 196, y: 150, w: 96, h: 26 },
  bin: { x: 62, y: 146, w: 52, h: 30 },
  gun: { x: 150, y: 138, w: 30, h: 24 },
  door: { x: 300, y: 44, w: 34, h: 62 },
  room: { x: 24, y: 28, w: 312, h: 84 },
};

/** A small deterministic generator, so a scanpath is the same every visit. */
function random(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

type Box = { x: number; y: number; w: number; h: number };

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
        // The eye barely leaves the joint: long rests, almost no travel, and
        // blinks suppressed the way close work suppresses them.
        const p = inside(PLACES.gun, rnd);
        push({ x: p.x + (rnd() - 0.5) * 14, y: p.y + (rnd() - 0.5) * 10 }, 430 + rnd() * 420, rnd() < 0.06);
        break;
      }
      case "assembling": {
        // Back and forth between the parts and the thing being built, with an
        // occasional glance at the tool. Structure, not scatter.
        const where = i % 3 === 2 ? PLACES.gun : i % 2 ? PLACES.bin : PLACES.chassis;
        push(inside(where, rnd), 190 + rnd() * 230, rnd() < 0.12);
        break;
      }
      case "walking": {
        // Wide, quick, and low: a person on the move reads the floor ahead and
        // the room in glances, and almost never rests.
        const low = rnd() < 0.55;
        const box = low
          ? { x: 20, y: 150, w: FIELD.w - 40, h: 46 }
          : PLACES.room;
        push(inside(box, rnd), 110 + rnd() * 130, rnd() < 0.16);
        break;
      }
      case "waiting": {
        // Nothing to do and nowhere to look: long, aimless rests over the whole
        // room, the doorway included, and the most blinking of the four.
        const box = rnd() < 0.3 ? PLACES.door : PLACES.room;
        push(inside(box, rnd), 260 + rnd() * 520, rnd() < 0.3);
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
    spread: clamp(spread / 95),
    rate: clamp(window.length / span / 3.4),
  };
}
