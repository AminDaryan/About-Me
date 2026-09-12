"use client";

import { useEffect, useRef, useState } from "react";
import useMedia from "./useMedia";
import {
  EDGES,
  FULL_LIFE,
  METHODS,
  NODES,
  explain,
  faithfulness,
  predict,
  readingsAt,
  stability,
  type Method,
} from "@/lib/rul";

/* Fig. 2 — the same prediction, explained two ways.

   A small message-passing network reads nine sensors and says how much life
   the machine has left. Two explanation methods, one from each of the families
   the thesis compares, then say which sensors that rests on — and they
   disagree about it almost every time. Underneath are the two measurements
   that decide which to believe: whether masking the sensors an explanation
   names actually moves the prediction, and whether it still names them after
   the readings are nudged.

   Everything here is computed, including both explanations and both measures.
   None of it is the thesis's models or data, and the caption says so. What it
   can honestly show is the shape of the problem, which is the part a reader
   needs to understand why the thesis exists.

   The readings drift on their own, so the disagreement is not a still life:
   watch one method's halos hold while the other's move. */

/** How many sensors an explanation is allowed to name. */
const NAMED = 3;
/** The meters are a running reading, eased rather than snapped: the underlying
    numbers move every frame and a bar that follows them exactly is a twitch. */
const EASE = 0.06;

const scoreRadius = (s: number) => 9.5 + 7 * s;

export default function Explain() {
  const [method, setMethod] = useState<Method>("attribution");
  const [started, setStarted] = useState(false);
  const reduced = useMedia("(prefers-reduced-motion: reduce)", false);
  const running = started || !reduced;

  const clock = useRef(0);
  const meters = useRef({ faith: 0.5, stable: 0.8 });

  const halo = useRef<(SVGCircleElement | null)[]>([]);
  const core = useRef<(SVGCircleElement | null)[]>([]);
  const edge = useRef<(SVGLineElement | null)[]>([]);
  const life = useRef<SVGRectElement>(null);
  const lifeText = useRef<HTMLSpanElement>(null);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    let frame = 0;
    let last = performance.now();

    const paint = (dt: number) => {
      const x = readingsAt(clock.current, 0);
      const scores = explain(method, x);
      const rul = predict(x);

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
        const on = named.includes(id);
        h.setAttribute("r", scoreRadius(scores[id]).toFixed(2));
        h.style.opacity = on ? String(0.35 + 0.65 * scores[id]) : "0";
      });

      /* Only the graph-native method lights the edges, because only it acts on
         them: taking a sensor out of the graph takes its edges with it. An
         attribution scores the readings and nothing else, and drawing it on the
         edges would be a claim about it that is not true.

         Graded by the score of the sensor they belong to, not lit flat. Three
         named sensors have eight or nine edges between them, and lighting all
         of those at once turns half the graph the accent colour — which is
         precisely the amount of accent that stops meaning anything. */
      EDGES.forEach(([a, b], i) => {
        const l = edge.current[i];
        if (!l) return;
        const weight =
          method === "graph"
            ? Math.max(named.includes(a) ? scores[a] : 0, named.includes(b) ? scores[b] : 0)
            : 0;
        l.style.opacity = weight > 0 ? (0.4 + 0.55 * weight).toFixed(2) : "0.3";
        /* Three levels, not two: the accent goes to the sensor the explanation
           puts first and its edges only, the rest of the named subgraph takes
           the soft ink, and everything else stays a rule. */
        l.style.stroke =
          weight > 0.7
            ? "var(--color-accent)"
            : weight > 0
              ? "var(--color-ink-soft)"
              : "var(--color-rule)";
      });

      const f = faithfulness(x, scores);
      const s = stability(x, method);
      const k = Math.min(1, dt * 60 * EASE);
      meters.current.faith += (f - meters.current.faith) * k;
      meters.current.stable += (s - meters.current.stable) * k;
      [meters.current.faith, meters.current.stable].forEach((v, i) => {
        const bar = bars.current[i];
        if (bar) bar.style.width = `${(v * 100).toFixed(1)}%`;
      });

      if (life.current) life.current.setAttribute("width", ((rul / FULL_LIFE) * 268).toFixed(1));
      if (lifeText.current) lifeText.current.textContent = rul.toFixed(0);
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      clock.current += dt;
      paint(dt);
    };

    paint(1 / 60);
    if (running) frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, method]);

  const how = METHODS.find((m) => m.key === method)?.how ?? "";

  return (
    <figure className="m-0 mt-8">
      <div className="rul">
        <svg viewBox="0 0 340 206" aria-hidden="true" focusable="false">
          {EDGES.map(([a, b], i) => (
            <line
              key={i}
              ref={(el) => {
                edge.current[i] = el;
              }}
              className="rul-edge"
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
                className="rul-halo"
                cx={x}
                cy={y}
                r="12"
                style={{ opacity: 0 }}
              />
              <circle className="rul-rim" cx={x} cy={y} r="7.5" />
              <circle
                ref={(el) => {
                  core.current[id] = el;
                }}
                className="rul-core"
                cx={x}
                cy={y}
                r="4"
              />
            </g>
          ))}
        </svg>
      </div>

      {/* What the network says, and then the two questions asked of the
          explanation of it. */}
      <p className="label mt-4 text-ink-faint">
        predicted remaining life{" "}
        <span ref={lifeText} className="text-ink">
          72
        </span>{" "}
        cycles
      </p>
      <svg className="rul-life" viewBox="0 0 268 4" aria-hidden="true">
        <rect className="rul-life-track" x="0" y="1.4" width="268" height="1.2" />
        <rect ref={life} className="rul-life-fill" x="0" y="0" width="150" height="4" />
      </svg>

      <div className="meters">
        {["Faithfulness", "Stability"].map((name, i) => (
          <div key={name} className="meter">
            <span className="label text-ink-faint">{name}</span>
            <span className="meter-bar">
              <span
                ref={(el) => {
                  bars.current[i] = el;
                }}
              />
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-t border-rule pt-4">
        <p className="label max-w-measure text-ink-faint">
          <span className="normal-case">{how}</span>
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2" role="group" aria-label="Explanation method">
          {METHODS.map((m) => (
            <button
              key={m.key}
              type="button"
              aria-pressed={method === m.key}
              onClick={() => {
                setMethod(m.key);
                setStarted(true);
              }}
              className={`label tap cursor-pointer border-b pb-0.5 transition-colors ${
                method === m.key
                  ? "border-accent text-accent"
                  : "border-transparent text-ink-faint hover:text-ink"
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      <figcaption className="mt-4 max-w-measure text-meta text-ink-faint italic">
        Fig. 2 — A small graph network in your browser, not the thesis&rsquo;s:
        the two families of explanation almost never name the same three
        sensors, and the two measures underneath are how you decide which to
        believe.
      </figcaption>
    </figure>
  );
}
