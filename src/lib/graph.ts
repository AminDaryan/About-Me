/* ==========================================================================
   A small graph network, and which of its inputs a prediction rests on.

   Fig. 2 needs a graph neural network that actually runs rather than a
   drawing of one: nine nodes, one round of message passing, and a single
   number out. The explanation is the plainest question you can put to a graph
   model — take a node out, edges and all, and see how far the prediction
   moves without it.

   Nothing here is a model or a dataset from any real work. It exists so the
   page can show what message passing does to a graph, and what it means for
   an explanation to point at part of one.
   ========================================================================== */

/** One node of the graph. Position is in the figure's own units. */
export interface Node {
  id: number;
  x: number;
  y: number;
}

/* Nine nodes and the relations between them, flowing left to right. A graph is
   the point: a flat table of the same nine readings would throw away every one
   of these edges.

   Laid out wide and shallow. The field used to be 340 by 208, which is very
   nearly a square, and a square drawing across a column of text is half a
   screen of graph — the reader scrolls past the thing rather than taking it in
   at once. It is now nearly three to one, which is a band. */
export const NODES: Node[] = [
  { id: 0, x: 54, y: 62 },
  { id: 1, x: 54, y: 142 },
  { id: 2, x: 192, y: 30 },
  { id: 3, x: 192, y: 102 },
  { id: 4, x: 192, y: 174 },
  { id: 5, x: 352, y: 58 },
  { id: 6, x: 352, y: 146 },
  { id: 7, x: 502, y: 42 },
  { id: 8, x: 502, y: 162 },
];

/** The drawing's own coordinates. */
export const FIELD = { w: 556, h: 204 };

export const EDGES: [number, number][] = [
  [0, 2], [0, 3], [1, 3], [1, 4],
  [2, 5], [3, 5], [3, 6], [4, 6], [5, 6],
  [5, 7], [6, 8], [7, 8],
];

export const NEIGHBOURS: number[][] = NODES.map(({ id }) =>
  EDGES.flatMap(([a, b]) => (a === id ? [b] : b === id ? [a] : [])),
);

/* ------------------------------- the model -------------------------------- */

/** How much a node's own reading counts, against its neighbours'. */
const SELF = 2.1;
const NEIGH = 1.35;
/** What each node is worth to the head. Uneven on purpose: a graph where every
    node matters equally has nothing to explain. */
const WEIGHT = [0.9, 0.35, 0.5, 1.5, 0.4, 1.15, 0.75, 0.3, 0.95];

const sigmoid = (v: number) => 1 / (1 + Math.exp(-v));

/** The hidden state of every node: its own reading, mixed with its
    neighbours'. One round of message passing, which is what makes this a graph
    network rather than nine separate regressions. */
export function hidden(x: number[], drop = -1): number[] {
  return NODES.map(({ id }) => {
    if (id === drop) return 0;
    const near = NEIGHBOURS[id].filter((j) => j !== drop);
    const mean = near.length ? near.reduce((s, j) => s + x[j], 0) / near.length : 0;
    return Math.tanh(SELF * (x[id] - 0.5) + NEIGH * (mean - 0.5));
  });
}

/**
 * What the network says, between nothing and one. It has no unit and stands
 * for nothing outside the figure — the figure is about how the number is
 * arrived at, not about what it would mean.
 *
 * `drop` removes a node and its edges from the graph entirely, which is the
 * question the explanation below asks.
 */
export function predict(x: number[], drop = -1): number {
  const h = hidden(x, drop);
  return sigmoid(h.reduce((acc, hi, i) => acc + WEIGHT[i] * hi, 0));
}

/* ------------------------------ the explanation ---------------------------- */

/**
 * How much the prediction rests on each node, scored by taking that node out
 * of the graph with its edges and measuring what the output loses. Normalised
 * so the node that matters most reads one.
 */
export function importance(x: number[]): number[] {
  const base = predict(x);
  const raw = NODES.map(({ id }) => Math.abs(predict(x, id) - base));
  const top = Math.max(...raw, 1e-9);
  return raw.map((v) => v / top);
}

/* ------------------------------- the readings ------------------------------ */

/** Node readings at a moment: a slow drift, different per node. Deterministic,
    so the figure looks the same on every visit. */
export function readingsAt(t: number): number[] {
  return NODES.map(({ id }) => {
    const a = 0.5 + 0.34 * Math.sin(t * (0.19 + id * 0.031) + id * 1.7);
    const b = 0.12 * Math.sin(t * (0.07 + id * 0.017) + id * 0.9);
    return Math.min(1, Math.max(0, a + b));
  });
}

/** The nodes in the order the explanation ranks them, the one the prediction
    rests on most first. */
export function ranked(scores: number[]): number[] {
  return scores
    .map((v, i) => [v, i] as const)
    .sort((a, b) => b[0] - a[0])
    .map(([, i]) => i);
}

/* --------------------------------- the round ------------------------------- */

/* The figure used to show the answer without the working: rings appeared round
   three nodes and a bar moved, and a reader was left to take on trust both that
   messages had passed and that anything had been measured. It now does the four
   things in order, and says which one it is doing.

   Every message in the graph travels at once, in both directions along every
   edge, because that is what one round of message passing is. */
export const MESSAGES: [number, number][] = EDGES.flatMap(([a, b]) => [
  [a, b] as [number, number],
  [b, a] as [number, number],
]);

export const BEATS = [
  {
    key: "pass",
    name: "Pass",
    seconds: 3.6,
    detail:
      "One round of message passing: each node mixes its neighbours’ readings into its own. Some end up saying a great deal, some almost nothing.",
  },
  {
    key: "read",
    name: "Predict",
    seconds: 2.4,
    detail:
      "The head reads all nine at once and returns a single number. Nothing in it says which node the number came from.",
  },
  {
    key: "test",
    name: "Remove",
    seconds: 3.8,
    detail:
      "So ask: take one node out of the graph, its edges with it, and run the same model on what is left.",
  },
  {
    key: "rank",
    name: "Rank",
    seconds: 3.6,
    detail:
      "Do that nine times. The nodes the number moves furthest without are the ones it rested on — three are ringed.",
  },
] as const;

export type Beat = (typeof BEATS)[number]["key"];

export const ROUND = BEATS.reduce((t, b) => t + b.seconds, 0);

/** When each beat begins, in seconds from the top of the round — which is what
    a reader who presses one of the four words is asking to be taken to. */
export const BEAT_AT: number[] = BEATS.map((_, i) =>
  BEATS.slice(0, i).reduce((t, b) => t + b.seconds, 0),
);

/** Which beat a time falls in, and how far through it is. */
export function beatAt(t: number): { beat: Beat; u: number; index: number } {
  let left = ((t % ROUND) + ROUND) % ROUND;
  for (let i = 0; i < BEATS.length; i++) {
    if (left < BEATS[i].seconds) return { beat: BEATS[i].key, u: left / BEATS[i].seconds, index: i };
    left -= BEATS[i].seconds;
  }
  return { beat: "rank", u: 1, index: BEATS.length - 1 };
}

/* The frame the figure holds on for a reader who has asked for less motion:
   the middle of the test, with the node taken out and the bar showing what the
   prediction lost. It is the one instant that carries the argument. */
export const STILL = BEAT_AT[2] + BEATS[2].seconds * 0.55;
