/* The small things beside the road in Fig. 1: a scene for the inside of each
   U-turn, the pins that mark the stops, and the cones where the road is not yet
   built.

   The scenes are not decoration. Each U-turn closes a chapter, and the scene
   inside it says which one: a gear train for the mechanical years, a screen
   building its code for the years as a developer, and a network driving an arm
   for the machine-learning ones. The car works them as it goes by — the gears
   turn with it, and the other two run once it is past.

   A scene stands on its own origin: (0, 0) is where it meets the ground, and it
   rises into negative y. Both halves of a turn hold the same room, so scenes are
   drawn about x = 0 and are never mirrored. Shapes are listed back to front and
   filled with paper, so nearer ones hide what is behind them. */

const f = (n: number) => Math.round(n * 10) / 10;

function circle(cx: number, cy: number, r: number) {
  return `M ${f(cx - r)} ${f(cy)} a ${r} ${r} 0 1 0 ${f(2 * r)} 0 a ${r} ${r} 0 1 0 ${f(-2 * r)} 0`;
}

/**
 * A gear's outline as one closed path: `n` teeth around pitch radius `r`, each
 * rising from the root circle to the tip, running flat across the top, and
 * falling back. Straight chords rather than arcs — at this size the difference
 * is under a tenth of a pixel, and the path data stays half as long.
 */
function gearRim(cx: number, cy: number, r: number, n: number, phase = 0) {
  const tip = r * 1.17;
  const root = r * 0.87;
  const p = (Math.PI * 2) / n;
  const at = (rad: number, a: number) =>
    `${f(cx + rad * Math.cos(a + phase))} ${f(cy + rad * Math.sin(a + phase))}`;
  let d = `M ${at(root, 0)}`;
  for (let i = 0; i < n; i++) {
    const a = i * p;
    d += ` L ${at(tip, a + p * 0.14)} L ${at(tip, a + p * 0.43)} L ${at(root, a + p * 0.57)} L ${at(root, a + p)}`;
  }
  return `${d} Z`;
}

/**
 * A whole gear, drawn the way a machine drawing draws one: toothed rim, the web
 * inside it, spokes across the web, and the hub last — it takes the accent when
 * the scene has power, so each gear has a lit centre.
 */
function gear(cx: number, cy: number, r: number, n: number, spokes = 0, phase = 0) {
  const web = f(r * 0.56);
  const bore = f(r * 0.24);
  const out = [gearRim(cx, cy, r, n, phase), circle(cx, cy, web)];
  if (spokes) {
    out.push(
      Array.from({ length: spokes }, (_, i) => {
        const a = (i / spokes) * Math.PI * 2 - Math.PI / 2;
        const c = Math.cos(a);
        const sn = Math.sin(a);
        return `M ${f(cx + bore * c)} ${f(cy + bore * sn)} L ${f(cx + web * c)} ${f(cy + web * sn)}`;
      }).join(" "),
    );
  }
  out.push(circle(cx, cy, bore));
  return out;
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

/** A part of a scene that the car works, rather than one drawn once and left. */
export type ScenePart = {
  /** Picks up the CSS that moves it. */
  className: string;
  /** Turns as the car goes by, this many degrees for every one the big gear
      makes. Negative for a gear driven by another. */
  rate?: number;
  /** Place in the run that follows the car past: 0 goes first. */
  order?: number;
  paths: string[];
};

export type Scene = {
  /** Drawn once, back to front, and left alone. */
  base: string[];
  parts: ScenePart[];
};

/* ---- the mechanical years: a gear train, turned by the car going past ---- */

const AXLE = -26;
const A = 13;
const B = 9;
/** Half a tooth of offset, so the small gears read as meshing with the big one. */
const MESH = Math.PI / 8;

const machine: Scene = {
  base: [
    // The shafts first: each gear's paper face then covers all but its stub.
    `M -22 -9 V ${AXLE} M 0 -9 V ${AXLE} M 22 -9 V ${AXLE}`,
    "M -40 0 L -37 -9 H 37 L 40 0 Z",
    `${circle(-31, -4.5, 1.4)} ${circle(31, -4.5, 1.4)}`,
  ],
  parts: [
    { className: "road-spin", rate: 1, order: 0, paths: gear(0, AXLE, A, 12, 3) },
    // Driven by the big one: the other way round, and faster by its ratio.
    { className: "road-spin", rate: -A / B, order: 1, paths: gear(22, AXLE, B, 8, 0, MESH) },
    { className: "road-spin", rate: -A / B, order: 1, paths: gear(-22, AXLE, B, 8, 0, MESH) },
  ],
};

/* ------ the years as a developer: an editor on a desk, building what is
       open in it. The screen sits left of centre so the keyboard has the desk
       to its right, which is what makes it read as somewhere work is done
       rather than as an icon of a monitor. ------ */

const build: Scene = {
  base: [
    // Stand and base, then the keyboard in front of them on the desk.
    "M -9 -14 V -4",
    "M -19 0 L -16 -4 H -2 L 1 0 Z",
    "M 8 0 L 12 -5 H 38 L 34 0 Z",
    "M 12.8 -3.6 H 36.2 M 11.6 -2.2 H 35 M 15 -0.8 H 31",
    // The screen, its title bar, and the gutter down its left side.
    "M -37 -44 H 19 Q 22 -44 22 -41 V -17 Q 22 -14 19 -14 H -37 Q -40 -14 -40 -17 V -41 Q -40 -44 -37 -44 Z",
    `M -40 -38 H 22 ${circle(-35, -41, 1.3)} ${circle(-30.5, -41, 1.3)} ${circle(-26, -41, 1.3)}`,
    "M -28 -38 V -14",
    // The track the build fills.
    "M -24 -19.5 H 16 V -16.5 H -24 Z",
  ],
  parts: [
    { className: "road-code", order: 0, paths: ["M -36 -34 H -31 M -36 -30 H -32 M -36 -26 H -30.5"] },
    { className: "road-code", order: 1, paths: ["M -24 -34 H -8"] },
    { className: "road-code", order: 2, paths: ["M -20 -30 H 8"] },
    { className: "road-code", order: 3, paths: ["M -20 -26 H -4"] },
    { className: "road-code", order: 4, paths: ["M -24 -22 H 4"] },
    { className: "road-bar", order: 5, paths: ["M -24 -19.5 H 16 V -16.5 H -24 Z"] },
    { className: "road-done", order: 6, paths: ["M 9.8 -40.6 L 12 -38.4 L 17.2 -43.2"] },
  ],
};

/* ---- the machine-learning years: a network that decides, and an arm that
       acts on it. The wire runs down into the arm's foot so the two are one
       machine rather than two drawings sharing a verge. ---- */

const IN: [number, number, number][] = [
  [-40, -30, 4],
  [-40, -16, 4],
];
const HID: [number, number, number][] = [
  [-23, -37, 4],
  [-23, -23, 4],
  [-23, -9, 4],
];
const OUT: [number, number, number] = [-6, -23, 4.6];

const learn: Scene = {
  base: [
    "M 13 0 L 16.5 -7 H 31.5 L 35 0 Z",
    "M 24 -7 V -12",
    "M 24 -12 L 36 -22 M 36 -22 V -33",
    "M 34 -34.6 L 32.4 -39.4 M 38 -34.6 L 39.6 -39.4",
  ],
  parts: [
    { className: "road-node", order: 0, paths: [IN.map((n) => circle(...n)).join(" ")] },
    {
      className: "road-edge",
      order: 1,
      paths: [IN.flatMap((a) => HID.map((b) => edge(a, b))).join(" ")],
    },
    { className: "road-node", order: 2, paths: [HID.map((n) => circle(...n)).join(" ")] },
    { className: "road-edge", order: 3, paths: [HID.map((a) => edge(a, OUT)).join(" ")] },
    { className: "road-node road-decision", order: 4, paths: [circle(...OUT)] },
    // The reading of the decision, drawn round it: the one stop on this route
    // whose work is explaining what a network relied on.
    { className: "road-ring", order: 5, paths: [circle(OUT[0], OUT[1], 8)] },
    { className: "road-edge", order: 6, paths: ["M 2.4 -23 H 8 V -4 H 15"] },
    {
      className: "road-node",
      order: 7,
      paths: [`${circle(24, -12, 3.6)} ${circle(36, -22, 3)} ${circle(36, -33, 2.4)}`],
    },
  ],
};

/** In the order the road meets them: mechanics, software, then learning. */
export const SCENERY = { machine, build, learn } satisfies Record<string, Scene>;

export type SceneryKey = keyof typeof SCENERY;

/** The ground line under each scene, not filled. */
export const GROUND = "M -52 0 H 52";

/**
 * A map pin whose point is at (0, 0) and whose round head, of radius `r`, is
 * centred `lift` above it. The sides run tangent to the head.
 */
export function pinPath(r: number, lift: number) {
  const cos = r / lift;
  const sin = Math.sqrt(1 - cos * cos);
  const tx = f(r * sin);
  const ty = f(-lift + r * cos);
  return `M 0 0 L ${-tx} ${ty} A ${r} ${r} 0 1 1 ${tx} ${ty} Z`;
}

/** A traffic cone, 12px tall. */
export const CONE = {
  body: "M -4.6 0 L -1.4 -12 H 1.4 L 4.6 0 Z",
  stripe: "M -3.3 -5 H 3.3",
  base: "M -6 0 H 6",
};
