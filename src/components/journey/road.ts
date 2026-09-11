/* Geometry for the road in Fig. 1.

   Everything is computed in CSS pixels for the width the road actually has, so
   the SVG's viewBox is the container's own size and text is never scaled up or
   down. Two layouts:

     serpentine — wide screens. Horizontal runs of stops joined by U-turns, the
                  way a road winds down a hillside. Each stop is a pin standing
                  on the road.
     ribbon     — phones. One road winding down the left edge, a round badge on
                  the road for each stop, labels to its right, and room opened
                  up under the chosen stop for its story.

   Both return the same shape: the centreline as SVG path data, the stops, and a
   dense list of samples along the road with their distance from the start. The
   samples are what the car drives along and what a drag is matched against, so
   no measuring of the rendered path is ever needed — which also means the first
   render on the server already has everything in the right place. */

export type Pt = { x: number; y: number; len: number };

export type Label = { x: number; y: number; anchor: "middle" | "start" };

export type Geometry = {
  kind: "serpentine" | "ribbon";
  width: number;
  height: number;
  /** Road centreline. */
  d: string;
  total: number;
  samples: Pt[];
  stops: Pt[];
  /** Where each stop's year and name sit. */
  labels: Label[];
  /** Radius of a stop's pin head or badge. */
  head: number;
  /** How far above the road a pin head stands; 0 for a badge on the road. */
  lift: number;
  /** Half the road's width, for things placed beside it. */
  verge: number;
  /** Distance between neighbouring stops along a run. */
  spacing: number;
  /** Road ends here, with a flag. */
  end: { x: number; y: number };
  /** Which way the road is heading at each stop: +1 right or down, −1 left. */
  heading: (1 | -1)[];
  /** The inside of each U-turn, where there is room for a little scenery.
      `len` is how far along the road the apex of the turn is, so the scene
      there can tell when the car is going by. */
  bends: { x: number; y: number; dir: 1 | -1; len: number }[];
};

const f = (n: number) => Math.round(n * 10) / 10;

/** Accumulates samples every few pixels, keeping a running length. */
function sampler() {
  const samples: Pt[] = [];
  let len = 0;
  const push = (x: number, y: number) => {
    const last = samples[samples.length - 1];
    if (last) len += Math.hypot(x - last.x, y - last.y);
    samples.push({ x, y, len });
  };
  const line = (ax: number, ay: number, bx: number, by: number) => {
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 4));
    for (let i = 1; i <= n; i++) push(ax + ((bx - ax) * i) / n, ay + ((by - ay) * i) / n);
  };
  const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
    const n = Math.max(2, Math.ceil((Math.abs(a1 - a0) * r) / 4));
    for (let i = 1; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n;
      push(cx + r * Math.cos(a), cy + r * Math.sin(a));
    }
  };
  return { samples, push, line, arc, length: () => len };
}

/** Distance along the road of the sample nearest a point. */
function lengthAt(samples: Pt[], x: number, y: number) {
  let best = samples[0];
  let bestD = Infinity;
  for (const s of samples) {
    const d = (s.x - x) ** 2 + (s.y - y) ** 2;
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return best.len;
}

/**
 * Point on the road at a given distance, interpolated between samples, with
 * the road's direction there in radians (0 heading right, π/2 heading down).
 */
export function pointAt(samples: Pt[], len: number) {
  const n = samples.length;
  const last = samples[n - 1];
  const at = Math.min(Math.max(len, 0), last.len);
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (samples[mid].len < at) lo = mid;
    else hi = mid;
  }
  const a = samples[lo];
  const b = samples[hi];
  const t = (at - a.len) / (b.len - a.len || 1);
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    len: at,
    a: Math.atan2(b.y - a.y, b.x - a.x),
  };
}

/** The sample nearest a point anywhere on screen — for dragging the car. */
export function nearest(samples: Pt[], x: number, y: number) {
  return lengthAt(samples, x, y);
}

/* When the road changes shape under the car — a resize, or a phone opening up
   room beneath a stop — its distance along the old road means nothing on the
   new one. Positions are carried across as "how far between which two stops". */

export function toStops(g: Geometry, len: number) {
  const L = g.stops;
  let i = 0;
  while (i < L.length - 2 && len > L[i + 1].len) i++;
  return i + (len - L[i].len) / (L[i + 1].len - L[i].len);
}

export function fromStops(g: Geometry, u: number) {
  const L = g.stops;
  const i = Math.max(0, Math.min(L.length - 2, Math.floor(u)));
  return L[i].len + (u - i) * (L[i + 1].len - L[i].len);
}

/* ------------------------------ serpentine ------------------------------ */

export function serpentine(width: number, count: number): Geometry {
  const MARGIN = 10;
  const R = 86; // U-turn radius; rows are 2R apart
  const HEAD = 23;
  const LIFT = 44; // pin head centre above the road
  const TOP = 88; // room above the first row for its pins and signposts

  // Three stops to a run leaves each label about 128px; below 500px wide that
  // would crowd, so the road takes more, shorter runs instead.
  const perRun = width >= 500 ? 3 : 2;
  const x0 = MARGIN + R;
  const x1 = width - MARGIN - R;
  const spacing = (x1 - x0) / perRun;
  const runs = Math.ceil(count / perRun);

  const s = sampler();
  const stopsXY: { x: number; y: number }[] = [];
  const heading: (1 | -1)[] = [];
  const bends: Geometry["bends"] = [];
  let d = `M ${f(MARGIN)} ${f(TOP)}`;
  s.push(MARGIN, TOP);

  for (let k = 0; k < runs; k++) {
    const y = TOP + k * 2 * R;
    const dir: 1 | -1 = k % 2 === 0 ? 1 : -1;
    const from = dir === 1 ? x0 : x1;
    let to = dir === 1 ? x1 : x0;

    for (let j = 0; j < perRun && stopsXY.length < count; j++) {
      stopsXY.push({ x: from + dir * (j + 0.5) * spacing, y });
      heading.push(dir);
    }

    // The road runs on a little past the last stop, not to the far edge.
    if (k === runs - 1) {
      const tail = stopsXY[stopsXY.length - 1].x + dir * spacing * 0.75;
      to = dir === 1 ? Math.min(tail, x1) : Math.max(tail, x0);
    }

    const cur = s.samples[s.samples.length - 1];
    s.line(cur.x, cur.y, to, y);
    d += ` L ${f(to)} ${f(y)}`;

    if (k < runs - 1) {
      // Right-hand turns sweep clockwise on screen through the right edge;
      // left-hand turns counter-clockwise through the left.
      if (dir === 1) s.arc(to, y + R, R, -Math.PI / 2, Math.PI / 2);
      else s.arc(to, y + R, R, -Math.PI / 2, -1.5 * Math.PI);
      d += ` A ${R} ${R} 0 0 ${dir === 1 ? 1 : 0} ${f(to)} ${f(y + 2 * R)}`;
      bends.push({ x: to, y: y + R, dir, len: 0 });
    }
  }

  const end = s.samples[s.samples.length - 1];
  const stops = stopsXY.map((p) => ({ ...p, len: lengthAt(s.samples, p.x, p.y) }));
  // The far point of each turn, now that the whole road has been sampled.
  for (const b of bends) b.len = lengthAt(s.samples, b.x + b.dir * R, b.y);

  return {
    kind: "serpentine",
    width,
    height: TOP + (runs - 1) * 2 * R + 68,
    d,
    total: s.length(),
    samples: s.samples,
    stops,
    labels: stops.map((p) => ({ x: p.x, y: p.y + 37, anchor: "middle" })),
    head: HEAD,
    lift: LIFT,
    verge: 17,
    spacing,
    end: { x: end.x, y: end.y },
    heading,
    bends,
  };
}

/* -------------------------------- ribbon -------------------------------- */

/**
 * @param open   index of the stop whose story is open, or −1
 * @param gap    height to open up beneath it, in px
 */
export function ribbon(width: number, count: number, open: number, gap: number): Geometry {
  const TOP = 44;
  const STEP = 96;
  const CX = 44;
  const AMP = 13;
  const HEAD = 21;

  const yOf = (i: number) => TOP + i * STEP + (open >= 0 && i > open ? gap : 0);
  const xAt = (y: number) => CX + AMP * Math.sin((y - TOP) / 52);

  const yStart = TOP - 34;
  const yEnd = yOf(count - 1) + 74;
  const s = sampler();
  let d = "";
  for (let y = yStart; y <= yEnd + 0.001; y += 4) {
    const x = xAt(y);
    s.push(x, y);
    d += `${d ? " L" : "M"} ${f(x)} ${f(y)}`;
  }

  const stops = Array.from({ length: count }, (_, i) => {
    const y = yOf(i);
    const x = xAt(y);
    return { x, y, len: lengthAt(s.samples, x, y) };
  });
  const labelX = CX + AMP + HEAD + 20;
  const end = s.samples[s.samples.length - 1];

  return {
    kind: "ribbon",
    width,
    height: yEnd + 34,
    d,
    total: s.length(),
    samples: s.samples,
    stops,
    labels: stops.map((p) => ({ x: labelX, y: p.y - 4, anchor: "start" })),
    head: HEAD,
    lift: 0,
    verge: 14,
    spacing: STEP,
    end: { x: end.x, y: end.y },
    heading: stops.map(() => 1),
    bends: [],
  };
}
