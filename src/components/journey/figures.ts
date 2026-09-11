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

/** Radial ticks between two radii — a gear's teeth. */
function teeth(cx: number, cy: number, r0: number, r1: number, n: number, phase = 0) {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = phase + (i / n) * Math.PI * 2;
    out.push(
      `M ${f(cx + r0 * Math.cos(a))} ${f(cy + r0 * Math.sin(a))} L ${f(cx + r1 * Math.cos(a))} ${f(cy + r1 * Math.sin(a))}`,
    );
  }
  return out.join(" ");
}

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

/* Graph for the thesis stop: node radius stands for attribution, and the most
   important node gets a second ring — an explanation drawn on a graph. */
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

export const FIGURES = {
  gears: [
    circle(46, 66, 25),
    teeth(46, 66, 25, 31, 12),
    circle(46, 66, 7),
    `${circle(87, 37, 15)} ${teeth(87, 37, 15, 20, 8, 0.2)}`,
    circle(87, 37, 4.5),
  ],

  exoskeleton: [
    circle(50, 19, 5.5),
    "M 46 24 L 52 57 M 55 23 L 61 56",
    circle(56, 62, 5.5),
    "M 52 67 L 49 97 M 60 67 L 57 97",
    "M 40 40 Q 56 33 67 38 M 41 83 Q 55 78 67 81",
    "M 49 97 L 53 102 M 57 97 L 53 102 M 40 104 H 86",
  ],

  /* The thesis system as its supervisor describes it: a double inverted
     pendulum on a fixed pivot, driven only at its second joint — so no cart,
     and the motor drawn as a double ring at the joint between the links. */
  pendulum: [
    "M 26 108 H 94 M 50 108 L 60 94 L 70 108",
    circle(60, 91, 3),
    "M 59.3 88.1 L 53.2 58.2",
    `${circle(52, 52.5, 5.5)} ${circle(52, 52.5, 2)}`,
    "M 54.6 47.6 L 67.2 23.6",
    circle(69, 20, 4),
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
    "M 20 105 H 60 M 31 105 V 96 H 49 V 105",
    circle(40, 90, 4.5),
    "M 42 86 L 60 54",
    circle(62, 50, 4),
    `M 66 51.5 L 89 59 ${circle(92, 60, 3.2)}`,
    "M 92 63.2 V 70 M 85 70 H 99 M 85 70 V 80 M 99 70 V 80",
    "M 83 89 H 101 V 106 H 83 Z M 83 89 L 89 84 H 107 L 101 89 M 107 84 V 101 L 101 106",
  ],

  graph: [
    E.map(([a, b]) => edge(N[a], N[b])).join(" "),
    [0, 2, 5, 6].map((i) => circle(...N[i])).join(" "),
    [1, 3].map((i) => circle(...N[i])).join(" "),
    circle(...N[4]),
    circle(N[4][0], N[4][1], 15),
  ],

  road: [
    "M 16 114 C 40 86 52 52 55 24",
    "M 104 114 C 80 86 68 52 65 24",
    "M 60 108 V 98 M 60 88 V 80 M 60 71 V 65 M 60 57 V 53 M 60 46 V 43",
    "M 38 24 H 82",
    "M 60 24 V 6 L 74 10 L 60 14",
  ],
} satisfies Record<string, string[]>;

export type FigureKey = keyof typeof FIGURES;
