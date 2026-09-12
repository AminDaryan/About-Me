/* ==========================================================================
   A graph, a prediction, and two ways of explaining it.

   The thesis asks which explanation of a graph neural network's prediction is
   worth believing. This file is that question at demonstration scale: a real
   if tiny message-passing network over a sensor graph, a remaining-life
   prediction from it, and two explanation methods from the two families the
   thesis compares — a general-purpose attribution, and one that works on the
   graph itself. Both are computed, not drawn; so are the two measurements
   underneath, which are the two the thesis makes.

   None of it is the thesis's models or the thesis's data. What it can honestly
   show is the shape of the problem: the same prediction, two explanations that
   do not agree, and a way of asking which to trust.
   ========================================================================== */

/** One sensor on the machine. Position is in the figure's own units. */
export interface Node {
  id: number;
  x: number;
  y: number;
}

/* Nine sensors and the relations between them, flowing left to right the way a
   machine's stages do. A graph is the point: a flat table of readings would
   throw away every one of these edges. */
export const NODES: Node[] = [
  { id: 0, x: 42, y: 62 },
  { id: 1, x: 42, y: 142 },
  { id: 2, x: 116, y: 30 },
  { id: 3, x: 116, y: 104 },
  { id: 4, x: 116, y: 174 },
  { id: 5, x: 202, y: 60 },
  { id: 6, x: 202, y: 146 },
  { id: 7, x: 286, y: 44 },
  { id: 8, x: 286, y: 160 },
];

export const EDGES: [number, number][] = [
  [0, 2], [0, 3], [1, 3], [1, 4],
  [2, 5], [3, 5], [3, 6], [4, 6], [5, 6],
  [5, 7], [6, 8], [7, 8],
];

export const NEIGHBOURS: number[][] = NODES.map(({ id }) =>
  EDGES.flatMap(([a, b]) => (a === id ? [b] : b === id ? [a] : [])),
);

/* ------------------------------- the model -------------------------------- */

/** How much a sensor's own reading counts, against its neighbours'. */
const SELF = 2.1;
const NEIGH = 1.35;
/** What each sensor is worth to the head. Uneven on purpose: a graph where
    every node matters equally has nothing to explain. */
const WEIGHT = [0.9, 0.35, 0.5, 1.5, 0.4, 1.15, 0.75, 0.3, 0.95];
/** Full life, in cycles. The unit a remaining-useful-life model is written in. */
export const FULL_LIFE = 130;

const sigmoid = (v: number) => 1 / (1 + Math.exp(-v));

/** The hidden state of every node: its own reading, mixed with its
    neighbours'. One round of message passing, which is what makes this a graph
    network rather than nine separate regressions. */
function hidden(x: number[], drop = -1): number[] {
  return NODES.map(({ id }) => {
    if (id === drop) return 0;
    const near = NEIGHBOURS[id].filter((j) => j !== drop);
    const mean = near.length ? near.reduce((s, j) => s + x[j], 0) / near.length : 0;
    return Math.tanh(SELF * (x[id] - 0.5) + NEIGH * (mean - 0.5));
  });
}

/**
 * Remaining useful life, in cycles. High readings mean wear, so the more the
 * graph lights up the less life is left.
 *
 * `drop` removes a node and its edges from the graph entirely, which is what
 * the graph-native explanation asks about.
 */
export function predict(x: number[], drop = -1): number {
  const h = hidden(x, drop);
  const s = h.reduce((acc, hi, i) => acc + WEIGHT[i] * hi, 0);
  return FULL_LIFE * (1 - sigmoid(s));
}

/* ---------------------------- the explanations ---------------------------- */

export type Method = "attribution" | "graph";

export const METHODS: { key: Method; name: string; how: string }[] = [
  {
    key: "attribution",
    name: "Attribution",
    how: "gradient × input — how much the prediction moves per unit of reading",
  },
  {
    key: "graph",
    name: "Graph-native",
    how: "take the sensor out of the graph, edges and all, and see what changes",
  },
];

/** A score per node, normalised so the largest is 1. */
function normalise(raw: number[]): number[] {
  const top = Math.max(...raw.map(Math.abs), 1e-9);
  return raw.map((v) => Math.abs(v) / top);
}

/** Gradient × input, by central differences. The general-purpose family: it
    asks the model a question about this exact point and nothing else. */
export function attribution(x: number[]): number[] {
  const h = 1e-3;
  return normalise(
    x.map((_, i) => {
      const up = x.slice();
      const down = x.slice();
      up[i] += h;
      down[i] -= h;
      return ((predict(up) - predict(down)) / (2 * h)) * x[i];
    }),
  );
}

/** What the prediction loses when a sensor is taken out of the graph. The
    graph-native family: the question is about structure, not slope. */
export function graphNative(x: number[]): number[] {
  const base = predict(x);
  return normalise(NODES.map(({ id }) => predict(x, id) - base));
}

export const explain = (method: Method, x: number[]) =>
  method === "attribution" ? attribution(x) : graphNative(x);

/* ---------------------------- the measurements ---------------------------- */

const topK = (scores: number[], k: number) =>
  scores
    .map((v, i) => [v, i] as const)
    .sort((a, b) => b[0] - a[0])
    .slice(0, k)
    .map(([, i]) => i);

/** The reading a masked sensor is set to: no news, neither worn nor fresh. */
const MASK = 0.5;

/**
 * Faithfulness, by deletion: mask the sensors the explanation named and see
 * how far the prediction moves, against masking the ones it dismissed.
 *
 * Half means the explanation did no better than pointing at the sensors it
 * said did not matter. One means everything the prediction rests on is in the
 * handful it named.
 */
export function faithfulness(x: number[], scores: number[], k = 3): number {
  const base = predict(x);
  const maskAt = (ids: number[]) => {
    const y = x.slice();
    for (const i of ids) y[i] = MASK;
    return Math.abs(predict(y) - base);
  };
  const named = maskAt(topK(scores, k));
  const dismissed = maskAt(topK(scores.map((v) => -v), k));
  return named + dismissed < 1e-9 ? 0.5 : named / (named + dismissed);
}

/** Four fixed wobbles, so "a small change in the input" is the same small
    change every time this is asked and the measure does not flicker. */
const NUDGES = [0, 1, 2, 3, 4, 5].map((k) =>
  NODES.map(({ id }) => Math.sin((id + 1) * (2.7 + k * 1.3)) * 0.5 + Math.cos(id * 1.9 - k) * 0.5),
);

/**
 * Stability: nudge every reading by a seventh of its range — a machine no
 * engineer would call a different machine — and ask the same method again. Did
 * it name the same sensors?
 *
 * The size is the measurement's one free parameter and it was chosen by
 * looking: under a twentieth of the range neither method ever changes its mind
 * and the measure reads a flat one, which measures nothing. At a seventh, the
 * steadier of the two still holds its answer two times in three.
 *
 * One means it tells the same story; nothing means a different one. The
 * agreement is counted over the handful an explanation actually names, because
 * that is what a person reads off it: an explanation whose sixth-place sensor
 * shuffles is fine, one whose top three change is not.
 *
 * This is the criterion that separates the two families, and the reason the
 * thesis measures it beside faithfulness — an explanation that changes when
 * nothing important has is not one anybody can act on.
 */
export function stability(x: number[], method: Method, size = 0.14, k = 3): number {
  const before = topK(explain(method, x), k);
  let agree = 0;
  for (const nudge of NUDGES) {
    const y = x.map((v, i) => Math.min(1, Math.max(0, v + size * nudge[i])));
    const after = topK(explain(method, y), k);
    agree += after.filter((i) => before.includes(i)).length / k;
  }
  return agree / NUDGES.length;
}

/* ------------------------------- the readings ------------------------------ */

/** Sensor readings at a moment: a slow drift, different per sensor, plus
    whatever the reader has jogged them by. Deterministic, so the figure looks
    the same on every visit until somebody touches it. */
export function readingsAt(t: number, jog: number): number[] {
  return NODES.map(({ id }) => {
    const a = 0.5 + 0.34 * Math.sin(t * (0.19 + id * 0.031) + id * 1.7);
    const b = 0.12 * Math.sin(t * (0.07 + id * 0.017) + id * 0.9 + jog * 2.3);
    return Math.min(1, Math.max(0, a + b));
  });
}
