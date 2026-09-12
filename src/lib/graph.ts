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
   of these edges. */
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
function hidden(x: number[], drop = -1): number[] {
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
