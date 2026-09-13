/* The drawings for Fig. 1, one per stop on the route.

   They are drawn rather than photographed, on purpose. They share the hairline
   weight and draw-on animation of the site's other ink figures, they cost a few
   hundred bytes instead of a few hundred kilobytes, they need no image host
   (the CSP allows images only from this origin), and they put no photograph of
   a workplace or a person on a public page. To use a real photograph for a stop
   instead, see the note on `art` in steps.ts.

   Every figure lives in a 120 × 120 box. Each entry is a list of SVG path data;
   each string draws as one stroke, in order, so related marks — a gear's teeth,
   a graph's edges — share a string and draw together. Keep lists short: every
   extra string adds 0.22 s before the drawing is complete. */

const f = (n: number) => Math.round(n * 10) / 10;

/** A full circle as path data, so it can be drawn on like any other stroke. */
function circle(cx: number, cy: number, r: number) {
  return `M ${f(cx - r)} ${f(cy)} a ${r} ${r} 0 1 0 ${f(2 * r)} 0 a ${r} ${r} 0 1 0 ${f(-2 * r)} 0`;
}

/**
 * A spur gear's outline as one closed path: `n` teeth on pitch radius `r`,
 * rising `depth` above it and cut the same depth below, with the tooth centred
 * on angle `phase` (radians). Teeth taper from root to tip and the root runs
 * as an arc between them.
 *
 * It replaced a ring of radial ticks, which at any size read as a sun rather
 * than a gear — and two gears drawn that way could not be made to mesh, because
 * a tick has no gap for another tooth to sit in.
 */
function gear(cx: number, cy: number, r: number, n: number, depth: number, phase = 0) {
  const at = (rad: number, a: number) => `${f(cx + rad * Math.cos(a))} ${f(cy + rad * Math.sin(a))}`;
  const half = Math.PI / n;
  const tip = r + depth * 0.85;
  const root = r - depth;
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = phase + i * 2 * half;
    d += `${i ? " L" : "M"} ${at(root, a - half * 0.62)} L ${at(tip, a - half * 0.3)}`;
    d += ` L ${at(tip, a + half * 0.3)} L ${at(root, a + half * 0.62)}`;
    d += ` A ${f(root)} ${f(root)} 0 0 1 ${at(root, a + 2 * half - half * 0.62)}`;
  }
  return `${d} Z`;
}

/** A joint as [x, y, radius]. */
type Joint = [number, number, number];

/**
 * A link between two joints drawn as a pair of rails `w` either side of the
 * centre line, each stopping where it meets the joint's circle. One hairline
 * for a link read as wire at the size of a pin; two read as a part.
 */
function rails(a: Joint, b: Joint, w: number) {
  const [x1, y1, r1] = a;
  const [x2, y2, r2] = b;
  const d = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / d;
  const uy = (y2 - y1) / d;
  const k1 = Math.sqrt(Math.max(0, r1 * r1 - w * w));
  const k2 = Math.sqrt(Math.max(0, r2 * r2 - w * w));
  return [1, -1]
    .map((s) => {
      const nx = -uy * w * s;
      const ny = ux * w * s;
      return `M ${f(x1 + ux * k1 + nx)} ${f(y1 + uy * k1 + ny)} L ${f(x2 - ux * k2 + nx)} ${f(y2 - uy * k2 + ny)}`;
    })
    .join(" ");
}

/** A driven joint: the site's mark for a motor, a double ring, as on Fig. 5. */
const motor = ([x, y, r]: Joint) => `${circle(x, y, r)} ${circle(x, y, r * 0.38)}`;

/** A line between two circles that stops at their rims instead of their centres. */
function edge(a: [number, number, number], b: [number, number, number]) {
  const [x1, y1, r1] = a;
  const [x2, y2, r2] = b;
  const d = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / d;
  const uy = (y2 - y1) / d;
  return `M ${f(x1 + ux * r1)} ${f(y1 + uy * r1)} L ${f(x2 - ux * r2)} ${f(y2 - uy * r2)}`;
}

const WINDOW =
  "M 16 26 H 104 Q 107 26 107 29 V 93 Q 107 96 104 96 H 16 Q 13 96 13 93 V 29 Q 13 26 16 26 Z";

/* Graph for the thesis stop: node radius stands for how much the prediction
   rests on that node, and the most important one gets a second ring — an
   explanation drawn on a graph. */
const N: [number, number, number][] = [
  [26, 40, 4],
  [58, 24, 7.5],
  [94, 38, 4.5],
  [40, 78, 6],
  [78, 76, 10],
  [104, 101, 3.5],
  [16, 101, 3.5],
];
const E: [number, number][] = [
  [0, 1], [1, 2], [0, 3], [1, 4], [2, 4], [3, 4], [4, 5], [3, 6],
];

/* Two spur gears in mesh for the mechanical engineering stop. They share a
   tooth size, so the pitch radii are in the ratio of the tooth counts, 10 to 6,
   and the centres stand exactly the two radii apart. Each gear is turned so
   that a tooth of one points into a gap of the other along the line between
   them. */
const BIG = { x: 50, y: 70, r: 27, n: 10 };
const SMALL = { r: (27 * 6) / 10, n: 6 };
const MESH = -Math.PI / 4;
const SMALL_AT = {
  x: BIG.x + (BIG.r + SMALL.r) * Math.cos(MESH),
  y: BIG.y + (BIG.r + SMALL.r) * Math.sin(MESH),
};

/* The big gear's web: a hub and a rim joined by four spokes, which is what
   makes it a machined part rather than a disc. */
const SPOKES = [0, 1, 2, 3]
  .map((i) => {
    const a = MESH + Math.PI / 4 + (i * Math.PI) / 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return `M ${f(BIG.x + 6 * c)} ${f(BIG.y + 6 * s)} L ${f(BIG.x + 15 * c)} ${f(BIG.y + 15 * s)}`;
  })
  .join(" ");

/* The three mechanisms — the exoskeleton, the pendulum and the arm — are drawn
   in one hand, so they read as a set: a link as a pair of rails, a driven joint
   as a double ring, a free joint as a single one, and the ground as a line.
   Each fills the box about as far as the gears do. Drawn as single hairlines
   in a narrow strip, they came out in a pin as a sliver nobody could read. */

/* FUME on the person wearing it, walking. The person is what makes it an
   exoskeleton. Drawn as a mechanism alone — a jointed brace with no body in it
   — it read as a robot arm standing on its end; a braced pair of legs with
   nothing above them read as trousers on a stand; and a figure standing still
   gave no hint of what the machine is for. FUME is for walking.

   Seen from the side, mid-stride: the near leg forward on its heel, the far
   leg behind on its toes, the arms swinging against the legs. The brace is on
   the near leg — the hip and knee driven and the ankle free, as in the paper
   and on Fig. 5 — strapped to the thigh and the shin, with a plate under the
   foot and a belt round the waist. The far leg is braced too on the real
   machine; from this side its brace is behind it.

   The body is outline only, one limb at a time through its joints, so the
   proportions live in the joint positions below rather than in hand-placed
   curves. */
type P = readonly [number, number];

/** A limb's two contours through `points`, `half[i]` either side of the centre
    line at each point, along the normal averaged across each joint. `back` is
    the left-hand side going down the limb — the back of a figure facing right. */
function limb(points: readonly P[], half: readonly number[]) {
  const normal = (i: number) => {
    const a = points[Math.max(0, i - 1)];
    const b = points[Math.min(points.length - 1, i + 1)];
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return [-(b[1] - a[1]) / d, (b[0] - a[0]) / d] as const;
  };
  const side = (s: number) =>
    points.map((p, i): P => [p[0] + normal(i)[0] * half[i] * s, p[1] + normal(i)[1] * half[i] * s]);
  return { back: side(1), front: side(-1) };
}
const poly = (ps: readonly P[]) => ps.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L ");

/** A strap across a limb at `t` of the way from `a` to `b`: two lines `reach`
    either side of the centre line, a band wide. */
function band(a: P, b: P, t: number, reach: number) {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ux = (b[0] - a[0]) / d;
  const uy = (b[1] - a[1]) / d;
  const cx = a[0] + (b[0] - a[0]) * t;
  const cy = a[1] + (b[1] - a[1]) * t;
  return [-1.7, 1.7]
    .map((o) => {
      const x = cx + ux * o;
      const y = cy + uy * o;
      return `M ${f(x + uy * reach)} ${f(y - ux * reach)} L ${f(x - uy * reach)} ${f(y + ux * reach)}`;
    })
    .join(" ");
}

const NEAR: P[] = [[58, 60], [66, 82], [70, 102]];
const FAR: P[] = [[53, 60], [47, 82], [38, 100]];
const LEG_HALF = [6.5, 4.6, 3.2];
const NEAR_LEG = limb(NEAR, LEG_HALF);
const FAR_LEG = limb(FAR, LEG_HALF);
const NEAR_ARM = limb([[54, 30], [45, 41], [39, 50]], [3.2, 2.7, 2.2]);
const FAR_ARM = limb([[62, 31], [70, 41], [77, 47]], [3, 2.6, 2.1]);

/** A limb's outline, closed at its end by `tip` — a foot, drawn out of the
    back contour's last point, or a hand, rounded across to the front's. */
const outline = (l: { back: P[]; front: P[] }, tip: string) =>
  `M ${poly(l.back)} ${tip} L ${poly([...l.front].reverse())}`;
const hand = (l: { back: P[]; front: P[] }, r: number) => {
  const [x, y] = l.front[l.front.length - 1];
  return outline(l, `A ${r} ${r} 0 0 0 ${f(x)} ${f(y)}`);
};

const EXO_HIP: Joint = [58, 61, 5];
const EXO_KNEE: Joint = [66, 82, 4.6];
const EXO_ANKLE: Joint = [70, 102, 2.8];

/* The thesis system as its supervisor describes it: a double inverted
   pendulum on a fixed pivot, driven only at its second joint — so no cart,
   and the motor drawn as a double ring at the joint between the links. */
const PIVOT: Joint = [60, 92, 4.5];
const ELBOW: Joint = [49, 56, 7];
const TIP: Joint = [67, 20, 6];

/* The arm in the project lab: a pedestal, a driven shoulder and elbow, the
   wrist, a parallel gripper open over the cuboid it is about to take. */
const SHOULDER: Joint = [38, 90, 6];
const REACH: Joint = [57, 50, 5.5];
const WRIST: Joint = [90, 52, 4];

export const FIGURES = {
  gears: [
    gear(BIG.x, BIG.y, BIG.r, BIG.n, 4.2, MESH + Math.PI / BIG.n),
    `${circle(BIG.x, BIG.y, 15)} ${circle(BIG.x, BIG.y, 6)} ${SPOKES}`,
    gear(SMALL_AT.x, SMALL_AT.y, SMALL.r, SMALL.n, 4.2, MESH + Math.PI),
    `${circle(SMALL_AT.x, SMALL_AT.y, 5)} ${circle(SMALL_AT.x, SMALL_AT.y, 1.8)}`,
  ],

  exoskeleton: [
    `${circle(58, 12, 7)} M 49 27 Q 57 20 65 27 C 67 38 66 47 63 57 M 49 27 C 46 37 46 46 48 57`,
    `${hand(NEAR_ARM, 2.2)} ${hand(FAR_ARM, 2.1)}`,
    outline(FAR_LEG, "L 33 104 L 45 111 Q 49 111 47 107"),
    outline(NEAR_LEG, "L 64 108 L 82 108 Q 86 107 82 103"),
    "M 48 50 H 65 Q 68 50 68 53.5 Q 68 57 65 57 H 48 Q 45 57 45 53.5 Q 45 50 48 50 Z",
    `${rails(EXO_HIP, EXO_KNEE, 1.6)} ${rails(EXO_KNEE, EXO_ANKLE, 1.6)} ${motor(EXO_HIP)} ${motor(EXO_KNEE)} ${circle(...EXO_ANKLE)}`,
    `${band(NEAR[0], NEAR[1], 0.55, 6.5)} ${band(NEAR[1], NEAR[2], 0.5, 4.8)} M 70 104.8 V 111 H 85`,
  ],

  pendulum: [
    `M 26 108 H 94 ${[32, 44, 56, 68, 80, 92].map((x) => `M ${x} 108 l -6 7`).join(" ")}`,
    `M 49 108 L 57.2 95.6 M 71 108 L 62.8 95.6 ${circle(...PIVOT)}`,
    rails(PIVOT, ELBOW, 2.6),
    motor(ELBOW),
    rails(ELBOW, TIP, 2.6),
    circle(...TIP),
  ],

  code: [
    WINDOW,
    `M 13 38 H 107 ${circle(21, 32, 1.8)} ${circle(28, 32, 1.8)} ${circle(35, 32, 1.8)}`,
    "M 48 55 L 38 66 L 48 77",
    "M 57 79 L 65 53",
    "M 74 55 L 84 66 L 74 77",
  ],

  graduate: [
    "M 60 28 L 104 46 L 60 64 L 16 46 Z",
    "M 34 55 V 74 Q 60 88 86 74 V 55",
    `${circle(60, 46, 2)} M 62 46 Q 84 47 98 50 V 74`,
    "M 95 74 H 101 L 99.5 85 H 96.5 Z",
  ],

  cloud: [
    "M 32 70 C 19 70 18 51 32 50 C 32 35 53 30 60 42 C 67 30 91 33 88 50 C 102 50 103 70 88 70 Z",
    "M 44 70 V 86 M 60 70 V 90 M 76 70 V 86",
    `${circle(44, 90.5, 4.5)} ${circle(60, 94.5, 4.5)} ${circle(76, 90.5, 4.5)}`,
  ],

  gaze: [
    "M 14 50 Q 60 12 106 50 Q 60 88 14 50 Z",
    circle(60, 50, 15),
    circle(60, 50, 5.5),
    "M 22 106 L 42 94 L 58 108 L 80 96 L 100 110",
    [
      circle(22, 106, 2.6),
      circle(42, 94, 3.6),
      circle(58, 108, 2.2),
      circle(80, 96, 4),
      circle(100, 110, 2.4),
    ].join(" "),
  ],

  arm: [
    `M 12 106 H 108 M 26 106 V 97 H 50 V 106 ${motor(SHOULDER)}`,
    rails(SHOULDER, REACH, 2.6),
    motor(REACH),
    `${rails(REACH, WRIST, 2.6)} ${circle(...WRIST)}`,
    "M 90 56 V 64 M 75 64 H 105 M 75 64 V 76 M 105 64 V 76",
    "M 78 88 H 96 V 106 H 78 Z M 78 88 L 84 83 H 102 L 96 88 M 102 83 V 101 L 96 106",
  ],

  graph: [
    E.map(([a, b]) => edge(N[a], N[b])).join(" "),
    [0, 2, 5, 6].map((i) => circle(...N[i])).join(" "),
    [1, 3].map((i) => circle(...N[i])).join(" "),
    circle(...N[4]),
    circle(N[4][0], N[4][1], 15),
  ],

  /* The doctorate: a rolled diploma, tied with a ribbon and sealed. It used to
     be a road running to a flag on the horizon, which said the route ends
     there, and it does not. The M.Sc. already has the mortarboard, so this is
     the other thing a degree is: the document. */
  diploma: [
    "M 24 26 H 92 M 24 54 H 92",
    "M 24 26 A 7 14 0 0 0 24 54 A 7 14 0 0 0 24 26 M 24 33 C 20 34 20 46 24 47 C 27 47 27 37 24 38",
    "M 92 26 C 100 26 102 33 97 36 M 92 54 A 7 14 0 0 0 92 26",
    "M 53 26 V 54 M 63 26 V 54 M 55 54 L 52 74 M 61 54 L 64 74",
    `${circle(58, 80, 11)} ${circle(58, 80, 6.5)}`,
    "M 51 89 L 44 108 L 50 104 L 53 110 L 57 91 M 65 89 L 72 108 L 66 104 L 63 110 L 59 91",
  ],
} satisfies Record<string, string[]>;

export type FigureKey = keyof typeof FIGURES;
