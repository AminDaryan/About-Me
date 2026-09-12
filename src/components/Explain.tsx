"use client";

import { useEffect, useRef } from "react";
import useMedia from "./useMedia";
import { EDGES, NODES, importance, predict, readingsAt } from "@/lib/graph";

/* Fig. 2 — what a graph network's prediction rests on.

   A small message-passing network reads nine nodes and produces one number.
   The explanation underneath it is the plainest question you can put to a
   graph model: take a node out of the graph, edges and all, and see how far
   the prediction moves without it. The handful of nodes it moves most for are
   ringed.

   Everything here is computed, the network and the explanation alike, and
   none of it is a model or a dataset from any real work — the caption says so.
   What it can honestly show is what message passing does to a graph, which is
   the part a reader needs before any of the rest means anything.

   The readings drift on their own, so the ringed nodes are not a still life:
   what the prediction rests on moves as the graph does. */

/** How many nodes the explanation is allowed to name. An explanation that
    points at everything has not explained anything. */
const NAMED = 3;

const scoreRadius = (s: number) => 9.5 + 7 * s;

export default function Explain() {
  const reduced = useMedia("(prefers-reduced-motion: reduce)", false);

  const clock = useRef(0);
  const halo = useRef<(SVGCircleElement | null)[]>([]);
  const core = useRef<(SVGCircleElement | null)[]>([]);
  const edge = useRef<(SVGLineElement | null)[]>([]);
  const out = useRef<SVGRectElement>(null);
  const outText = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;
    let last = performance.now();

    const paint = () => {
      const x = readingsAt(clock.current);
      const scores = importance(x);

      const named = scores
        .map((v, i) => [v, i] as const)
        .sort((a, b) => b[0] - a[0])
        .slice(0, NAMED)
        .map(([, i]) => i);

      NODES.forEach(({ id }) => {
        const c = core.current[id];
        if (c) c.setAttribute("r", (2.2 + 4.6 * x[id]).toFixed(2));
        const h = halo.current[id];
        if (!h) return;
        h.setAttribute("r", scoreRadius(scores[id]).toFixed(2));
        h.style.opacity = named.includes(id) ? String(0.35 + 0.65 * scores[id]) : "0";
      });

      /* The edges light with the nodes, because taking a node out of the graph
         takes its edges with it — the explanation is about the structure, not
         about nine readings on their own.

         Graded by the score of the node they belong to, not lit flat. Three
         named nodes have eight or nine edges between them, and lighting all of
         those at once turns half the graph the accent colour — which is
         precisely the amount of accent that stops meaning anything. */
      EDGES.forEach(([a, b], i) => {
        const l = edge.current[i];
        if (!l) return;
        const weight = Math.max(
          named.includes(a) ? scores[a] : 0,
          named.includes(b) ? scores[b] : 0,
        );
        l.style.opacity = weight > 0 ? (0.4 + 0.55 * weight).toFixed(2) : "0.3";
        /* Three levels, not two: the accent goes to the node the explanation
           puts first and its edges only, the rest of the named subgraph takes
           the soft ink, and everything else stays a rule. */
        l.style.stroke =
          weight > 0.7
            ? "var(--color-accent)"
            : weight > 0
              ? "var(--color-ink-soft)"
              : "var(--color-rule)";
      });

      const y = predict(x);
      if (out.current) out.current.setAttribute("width", (y * 268).toFixed(1));
      if (outText.current) outText.current.textContent = y.toFixed(2);
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      clock.current += Math.min((now - last) / 1000, 0.05);
      last = now;
      paint();
    };

    /* One frame either way, so the figure is drawn rather than blank; it is
       only left running for a reader who has not asked for less motion. */
    paint();
    if (!reduced) frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced]);

  return (
    <figure className="m-0 mt-8">
      <div className="graph-fig">
        <svg viewBox="0 0 340 206" aria-hidden="true" focusable="false">
          {EDGES.map(([a, b], i) => (
            <line
              key={i}
              ref={(el) => {
                edge.current[i] = el;
              }}
              className="graph-edge"
              x1={NODES[a].x}
              y1={NODES[a].y}
              x2={NODES[b].x}
              y2={NODES[b].y}
            />
          ))}
          {NODES.map(({ id, x, y }) => (
            <g key={id}>
              <circle
                ref={(el) => {
                  halo.current[id] = el;
                }}
                className="graph-halo"
                cx={x}
                cy={y}
                r="12"
                style={{ opacity: 0 }}
              />
              <circle className="graph-rim" cx={x} cy={y} r="7.5" />
              <circle
                ref={(el) => {
                  core.current[id] = el;
                }}
                className="graph-core"
                cx={x}
                cy={y}
                r="4"
              />
            </g>
          ))}
        </svg>
      </div>

      {/* What the network says. The number has no unit on purpose: the figure
          is about how it is arrived at, not about what it would mean. */}
      <p className="label mt-4 text-ink-faint">
        model output{" "}
        <span ref={outText} className="text-ink">
          0.55
        </span>
      </p>
      <svg className="graph-out" viewBox="0 0 268 4" aria-hidden="true">
        <rect className="graph-out-track" x="0" y="1.4" width="268" height="1.2" />
        <rect ref={out} className="graph-out-fill" x="0" y="0" width="150" height="4" />
      </svg>

      <figcaption className="mt-4 max-w-measure text-meta text-ink-faint italic">
        Fig. 2 — A small graph network running in your browser rather than a
        model from my work: one round of message passing over nine nodes, with
        the three the prediction rests on most ringed as the readings drift.
      </figcaption>
    </figure>
  );
}
