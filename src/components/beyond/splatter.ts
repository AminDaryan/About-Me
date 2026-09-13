/* An ink splatter, the kind a quill throws when it is set down too hard: one
   lumpy pool, drops that ran into its rim, a drop or two still joined to it by
   a neck, and a spray of drops, streaks and mist thrown out to one side. All
   lengths are CSS pixels about the splatter's centre, and nothing reaches
   further from it than `reach`.

   The shape is drawn from a seed, so the same seed gives the same splatter on
   every render and a new seed a new one. */

export type Shape =
  | { kind: "circle"; x: number; y: number; r: number }
  /** An ellipse laid along angle `a`, in radians: `rx` along it, `ry` across. */
  | { kind: "oval"; x: number; y: number; rx: number; ry: number; a: number }
  /** A closed curve through the points. */
  | { kind: "loop"; points: Pt[] }
  /** A neck: its two sides curve in towards `pinch` between the wide `from`
      and the narrower `to`. */
  | { kind: "neck"; from: [Pt, Pt]; pinch: [Pt, Pt]; to: [Pt, Pt] }
  | { kind: "spike"; base: [Pt, Pt]; tip: Pt };

type Pt = { x: number; y: number };

export type Splatter = {
  /** The pool and what ran into it, which lands first. */
  blot: Shape[];
  /** What was thrown clear of it, which lands a moment later. */
  spray: Shape[];
};

const TAU = Math.PI * 2;

/** A small, fast, seedable generator of numbers in [0, 1) (mulberry32). */
export function random(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function splatter(seed: number, reach: number): Splatter {
  const rand = random(seed);
  const between = (lo: number, hi: number) => lo + (hi - lo) * rand();
  const count = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));
  const along = (a: number, d: number) => ({ x: Math.cos(a) * d, y: Math.sin(a) * d });
  // Ink is thrown one way: most of what leaves the pool leaves on that side.
  const heading = rand() * TAU;
  const thrown = (spread: number) => heading + (rand() + rand() - 1) * spread;

  /* The pool is one mass, stretched along the throw and made lumpy by a few
     slow ripples round its rim. Ripples of more than six lobes, or a jitter on
     each point, gave it the sharp corners of a stone rather than the rounded
     ones of a liquid. */
  const base = reach * between(0.3, 0.36);
  const stretch = between(0.1, 0.32);
  const ripples = [3, 4, 5, 6].map((k) => ({ k, amp: between(0.03, k < 5 ? 0.13 : 0.08), phase: rand() * TAU }));
  const radius = (a: number) =>
    base * (1 + stretch * Math.cos(2 * (a - heading))) *
    Math.max(0.7, 1 + ripples.reduce((sum, w) => sum + w.amp * Math.cos(w.k * a + w.phase), 0));
  const blot: Shape[] = [{ kind: "loop", points: Array.from({ length: 32 }, (_, i) => along((i / 32) * TAU, radius((i / 32) * TAU))) }];

  // Drops that landed on the rim and ran into it: what makes it read as ink.
  const bulbs = count(5, 9);
  for (let i = 0; i < bulbs; i++) {
    const a = i < 2 ? thrown(0.8) : rand() * TAU;
    const r = reach * between(0.05, 0.14);
    blot.push({ kind: "circle", ...along(a, radius(a) * between(0.8, 1) + r * between(0.1, 0.6)), r });
  }

  /* A drop just clear of the pool, still joined to it. The neck is short and
     pinched: long and even, it read as a pin stuck in the blot. */
  const tadpoles = count(1, 2);
  for (let i = 0; i < tadpoles; i++) {
    const a = thrown(1.1);
    const r = reach * between(0.045, 0.08);
    const from = radius(a) * 0.8;
    const to = Math.min(reach - r, radius(a) * 1.05 + reach * between(0.1, 0.24));
    const across = (p: Pt, w: number): [Pt, Pt] => [
      { x: p.x + Math.sin(a) * w, y: p.y - Math.cos(a) * w },
      { x: p.x - Math.sin(a) * w, y: p.y + Math.cos(a) * w },
    ];
    const end = along(a, to);
    blot.push(
      { kind: "neck", from: across(along(a, from), r * 1.6), pinch: across(along(a, from + (to - from) * 0.62), r * between(0.3, 0.5)), to: across(end, r * 0.75) },
      { kind: "circle", ...end, r },
    );
  }

  const spray: Shape[] = [];
  const rim = (a: number) => radius(a) * 1.08;

  // Loose drops, stretched along the way they flew.
  const drops = count(4, 7);
  for (let i = 0; i < drops; i++) {
    const a = thrown(1.2);
    const r = reach * between(0.018, 0.055);
    const d = rim(a) + between(0.1, 1) * (reach - r * 1.5 - rim(a));
    spray.push({ kind: "oval", ...along(a, d), rx: r * between(1, 1.5), ry: r, a });
  }

  // A line of drops, each smaller than the last.
  const trails = count(1, 2);
  for (let i = 0; i < trails; i++) {
    const a = thrown(0.6);
    const beads = count(3, 5);
    const from = rim(a) + 2;
    const to = reach * between(0.8, 0.97);
    for (let k = 0; k < beads; k++) {
      const r = reach * 0.035 * (1 - (k / (beads - 1)) * 0.65);
      spray.push({ kind: "circle", ...along(a, Math.min(reach - r, from + ((to - from) * k) / (beads - 1))), r });
    }
  }

  // Streaks: a spike flung out of the pool, a pixel wide where it leaves it.
  const streaks = count(2, 4);
  for (let i = 0; i < streaks; i++) {
    const a = thrown(0.9);
    const w = between(0.5, 0.95);
    const root = along(a, radius(a) * 0.85);
    spray.push({
      kind: "spike",
      base: [{ x: root.x + Math.sin(a) * w, y: root.y - Math.cos(a) * w }, { x: root.x - Math.sin(a) * w, y: root.y + Math.cos(a) * w }],
      tip: along(a, rim(a) + (reach - rim(a)) * between(0.35, 0.95)),
    });
  }

  // Mist: the finest of it, all on the thrown side.
  const mist = count(10, 16);
  for (let i = 0; i < mist; i++) {
    const a = thrown(0.85);
    const r = between(0.45, 1);
    spray.push({ kind: "circle", ...along(a, between(rim(a), reach - r)), r });
  }

  return { blot, spray };
}

const n = (value: number) => Math.round(value * 10) / 10;
const pt = (p: Pt) => `${n(p.x)} ${n(p.y)}`;

/* Every shape is wound clockwise on the screen. Where a drop overlaps the pool
   the two are filled once under the nonzero rule; wound against each other,
   the overlap cancelled and cut a hole the colour of the paper. */
function trace(shape: Shape): string {
  switch (shape.kind) {
    case "circle": {
      const { x, y, r } = shape;
      return `M${pt({ x: x - r, y })}a${n(r)} ${n(r)} 0 1 1 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 1 ${n(-2 * r)} 0Z`;
    }
    case "oval": {
      const { x, y, rx, ry, a } = shape;
      const u = { x: Math.cos(a) * rx, y: Math.sin(a) * rx };
      const deg = n((a * 180) / Math.PI);
      return `M${pt({ x: x - u.x, y: y - u.y })}a${n(rx)} ${n(ry)} ${deg} 1 1 ${pt({ x: 2 * u.x, y: 2 * u.y })}a${n(rx)} ${n(ry)} ${deg} 1 1 ${pt({ x: -2 * u.x, y: -2 * u.y })}Z`;
    }
    case "loop": {
      // Catmull-Rom through the points, as cubic Béziers.
      const ps = shape.points;
      const at = (i: number) => ps[(i + ps.length) % ps.length];
      let d = `M${pt(ps[0])}`;
      for (let i = 0; i < ps.length; i++) {
        const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
        d += `C${pt({ x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 })} ${pt({ x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 })} ${pt(p2)}`;
      }
      return `${d}Z`;
    }
    case "neck": {
      const { from, pinch, to } = shape;
      return `M${pt(from[0])}Q${pt(pinch[0])} ${pt(to[0])}L${pt(to[1])}Q${pt(pinch[1])} ${pt(from[1])}Z`;
    }
    case "spike":
      return `M${pt(shape.base[0])}L${pt(shape.tip)}L${pt(shape.base[1])}Z`;
  }
}

/** SVG path data for a list of shapes, as one path. */
export const drawShapes = (shapes: Shape[]) => shapes.map(trace).join("");
