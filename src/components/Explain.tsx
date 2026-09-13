"use client";

import { useEffect, useRef } from "react";
import useMedia from "./useMedia";
import { Plate } from "@/components/ui";
import {
  BEATS,
  BEAT_AT,
  EDGES,
  FIELD,
  MESSAGES,
  NODES,
  ROUND,
  STILL,
  beatAt,
  hidden,
  importance,
  predict,
  ranked,
  readingsAt,
} from "@/lib/graph";

/* Fig. 2 — what a graph network's prediction rests on.

   A small message-passing network reads nine nodes and produces one number.
   The explanation underneath it is the plainest question you can put to a
   graph model: take a node out of the graph, edges and all, and see how far
   the prediction moves without it.

   Everything here is computed, the network and the explanation alike, and
   none of it is a model or a dataset from any real work — the caption says so.
   What it can honestly show is what message passing does to a graph, which is
   the part a reader needs before any of the rest means anything.

   It used to show only the answer. Rings appeared round three nodes and a bar
   moved, and both of the things the figure is for — that messages pass, and
   that something is *measured* — had to be taken on trust. It now does the
   four things in order: the messages fly, the states change to the mixtures
   they make, the head reads them, and one node is taken out of the graph in
   front of the reader while the bar shows what the prediction loses. The
   sentence underneath says which of the four is happening.

   The accent goes to one thing per beat and never to two: the messages while
   they are in flight, the gap in the graph while a node is out of it, and the
   node the explanation ranks first once it has finished ranking. */

/** How many nodes the explanation is allowed to name. An explanation that
    points at everything has not explained anything. */
const NAMED = 3;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const unit = (t: number) => Math.max(0, Math.min(1, t));

/* A node's mark, from something between nothing and one. Before the messages
   pass it shows the node's own reading; after them, how much the node is
   saying — the size of the mixture it ended up holding, sign and all set
   aside. That second quantity is the one the explanation is about: a node that
   ends up saying nothing is a node the prediction cannot be resting on, and it
   visibly shrinks to nothing a beat before the ranking says so.

   The two are drawn at the same size for the same value, so what changes over
   a round is the quantity and not the way it is drawn. */
const coreRadius = (v: number) => 3.1 + 6.4 * v;
const haloRadius = (s: number) => 13 + 9.5 * s;

/** The bar is drawn in its own units; this is how wide the full scale is. */
const SCALE = 268;

/**
 * What the explanation is working on: one state of the graph, held still for a
 * whole round. Taken once a round rather than every frame, because a test that
 * changes its mind about which node it is removing halfway through is not a
 * test a reader can follow.
 */
function snapshot(t: number) {
  const x = readingsAt(t);
  const scores = importance(x);
  const order = ranked(scores);
  return {
    mixed: hidden(x),
    scores,
    named: order.slice(0, NAMED),
    top: order[0],
    base: predict(x),
    without: predict(x, order[0]),
  };
}

export default function Explain() {
  const reduced = useMedia("(prefers-reduced-motion: reduce)", false);

  /* Four words under the figure, and the same bargain Fig. 4 offers: point at
     one to read what that beat does, press it to watch that beat. The round is
     ten seconds long and the sentence changes four times in it, which is faster
     than anyone can read at their own pace — so the reader is given a way to
     stop it being a slideshow and hold one beat still. */
  const words = useRef<(HTMLButtonElement | null)[]>([]);
  const live = useRef(0);
  const peek = useRef<number | null>(null);

  const clock = useRef(0);
  const round = useRef(-1);
  const state = useRef(snapshot(0));

  const node = useRef<(SVGGElement | null)[]>([]);
  const halo = useRef<(SVGCircleElement | null)[]>([]);
  const rim = useRef<(SVGCircleElement | null)[]>([]);
  const core = useRef<(SVGCircleElement | null)[]>([]);
  const gap = useRef<SVGCircleElement>(null);
  const edge = useRef<(SVGLineElement | null)[]>([]);
  const message = useRef<(SVGCircleElement | null)[]>([]);
  const fill = useRef<SVGRectElement>(null);
  const mark = useRef<SVGRectElement>(null);
  const outText = useRef<HTMLSpanElement>(null);
  const delta = useRef<HTMLSpanElement>(null);
  const said = useRef<HTMLSpanElement>(null);
  const saidBox = useRef<HTMLParagraphElement>(null);

  /* The sentence is written by hand rather than re-rendered: it changes four
     times a round, and a React render for a paragraph of text is a render
     nobody needs. */
  const write = (i: number, isLive: boolean) => {
    if (said.current) said.current.textContent = BEATS[i].detail;
    saidBox.current?.toggleAttribute("data-peek", !isLive);
  };

  /** Point at a beat to read about it; point at nothing to go back to the one
      that is running. */
  const show = (i: number | null) => {
    peek.current = i;
    words.current.forEach((b, k) => b?.toggleAttribute("data-peek", i === k));
    write(i ?? live.current, i === null);
  };

  useEffect(() => {
    let frame = 0;
    /* Zero rather than the clock's reading now: the first frame is the one that
       tells us when it is, and asking during render is asking a question whose
       answer changes between two renders that ought to agree. */
    let last = 0;
    let spoken = -1;

    const paint = () => {
      const t = clock.current;

      /* One state of the graph per round, and the drifting readings only reach
         the figure at a round boundary — so the nine numbers the explanation
         is about do not move while it is explaining them. */
      const turn = Math.floor(t / ROUND);
      if (turn !== round.current) {
        round.current = turn;
        state.current = snapshot(t);
      }
      const { mixed, scores, named, top, base, without } = state.current;
      /* The readings themselves are read live rather than out of the snapshot.
         They are what the nodes show at both ends of a round, and taking them
         from a snapshot meant the graph jumped nine seconds of drift every
         time the round turned over. */
      const reading = readingsAt(t);

      const { beat, u, index } = beatAt(t);

      /* How far the nodes have moved from their own readings to the mixtures
         message passing makes of them, and back again at the end of the round
         so the next one opens where this one closed. */
      const mix =
        beat === "pass"
          ? ease(unit(u * 1.3))
          : beat === "rank"
            ? 1 - ease(unit((u - 0.62) / 0.38))
            : 1;

      /* The node under test, gone and then back. The graph is whole at both
         ends of the beat, so nothing jumps into or out of the picture. */
      const gone =
        beat === "test"
          ? ease(unit((u - 0.08) / 0.26)) * (1 - ease(unit((u - 0.8) / 0.2)))
          : 0;

      /* The rings come up and go down again inside their own beat, so the round
         closes on the plain graph it opened on. */
      const rings =
        beat === "rank"
          ? ease(unit(u * 2.5)) * (1 - ease(unit((u - 0.82) / 0.18)))
          : 0;

      /* Every node takes its messages in at the same moment, because they were
         all sent at the same moment. */
      const arrival = beat === "pass" ? Math.sin(Math.PI * unit((u - 0.5) / 0.4)) : 0;

      /* There is no number while the messages are still in the air: the head
         has nothing to read until they land. The bar fills once they have, and
         empties again with the rings at the end of the round, so a reader can
         see where one pass of the model ends and the next begins. */
      const out =
        beat === "pass"
          ? 0
          : beat === "read"
            ? ease(unit(u * 1.5))
            : beat === "rank"
              ? 1 - ease(unit((u - 0.82) / 0.18))
              : 1;

      NODES.forEach(({ id }) => {
        const g = node.current[id];
        if (g) g.style.opacity = id === top ? (1 - gone).toFixed(3) : "1";

        const c = core.current[id];
        if (c) {
          const v = reading[id] * (1 - mix) + Math.abs(mixed[id]) * mix;
          c.setAttribute("r", coreRadius(v).toFixed(2));
        }

        const r = rim.current[id];
        if (r) r.setAttribute("r", (10.4 + 1.8 * arrival).toFixed(2));

        const h = halo.current[id];
        if (!h) return;
        const shown = named.includes(id) ? rings : 0;
        h.setAttribute("r", haloRadius(scores[id]).toFixed(2));
        h.style.opacity = (shown * (0.35 + 0.65 * scores[id])).toFixed(3);
        /* Only the first-ranked node's ring takes the accent. The other two are
           part of the same answer, and drawing all three in it would say they
           are all the answer. */
        h.style.stroke = id === top ? "var(--color-accent)" : "var(--color-ink-soft)";
      });

      /* Where the node was, while it is not there: the hole in the graph is the
         thing being measured, so it is the thing that carries the accent. */
      if (gap.current) {
        gap.current.style.opacity = gone.toFixed(3);
        gap.current.setAttribute("cx", String(NODES[top].x));
        gap.current.setAttribute("cy", String(NODES[top].y));
      }

      /* The edges belong to the nodes. Taking a node out takes its edges with
         it — that is the whole of why this is an explanation about structure
         and not about nine readings — and the ranking lights them the same way
         it lights the nodes they run to. */
      EDGES.forEach(([a, b], i) => {
        const l = edge.current[i];
        if (!l) return;
        const cut = a === top || b === top ? gone : 0;
        const lit = Math.max(
          named.includes(a) ? scores[a] : 0,
          named.includes(b) ? scores[b] : 0,
        ) * rings;
        l.style.opacity = ((0.3 + 0.55 * lit) * (1 - cut)).toFixed(3);
        l.style.stroke =
          a === top || b === top
            ? lit > 0.7
              ? "var(--color-accent)"
              : "var(--color-rule)"
            : lit > 0
              ? "var(--color-ink-soft)"
              : "var(--color-rule)";
      });

      /* The messages, one for each direction of each edge, all in the air at
         once. They leave in a short stagger rather than in lockstep: nine nodes
         firing on the same frame reads as a flicker, not as a graph talking. */
      MESSAGES.forEach(([a, b], i) => {
        const m = message.current[i];
        if (!m) return;
        if (beat !== "pass") {
          m.style.opacity = "0";
          return;
        }
        const p = ease(unit((u - (i % 6) * 0.02) * 1.45));
        m.setAttribute("cx", (NODES[a].x + (NODES[b].x - NODES[a].x) * p).toFixed(1));
        m.setAttribute("cy", (NODES[a].y + (NODES[b].y - NODES[a].y) * p).toFixed(1));
        // In the air, not at either end: a dot sitting on a node is a node.
        m.style.opacity = (Math.sin(Math.PI * p) * 0.9).toFixed(3);
      });

      const y = (base + (without - base) * gone) * out;
      if (fill.current) fill.current.setAttribute("width", (y * SCALE).toFixed(1));
      if (mark.current) {
        mark.current.setAttribute("x", (base * SCALE).toFixed(1));
        mark.current.style.opacity = gone.toFixed(3);
      }
      if (outText.current) outText.current.textContent = out < 0.02 ? "—" : y.toFixed(2);
      if (delta.current) {
        delta.current.style.opacity = gone.toFixed(3);
        delta.current.textContent = `${without < base ? "−" : "+"}${Math.abs(without - base).toFixed(2)} without it`;
      }

      if (index !== spoken) {
        spoken = index;
        live.current = index;
        words.current.forEach((b, i) => {
          b?.toggleAttribute("data-now", i === index);
          if (i === index) b?.setAttribute("aria-current", "step");
          else b?.removeAttribute("aria-current");
        });
        if (peek.current === null) write(index, true);
      }
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (last) clock.current += Math.min((now - last) / 1000, 0.05);
      last = now;
      paint();
    };

    /* A reader who has asked for less motion gets the middle of the test held
       still — the node out of the graph and the bar showing what that cost —
       rather than the top of the round, which is a graph sitting there. */
    clock.current = reduced ? STILL : 0;
    paint();
    if (!reduced) frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced]);

  return (
    <Plate
      fig={2}
      caption={
        <>
          A small graph network running in your browser rather than a model from
          my work: one round of message passing over nine nodes, and the
          leave-one-out test that says which three the prediction rests on.
        </>
      }
    >
      {/* Held to its own size inside the frame, not enlarged to fill it: the
          marks are drawn for about one unit to a pixel, and nine nodes set
          half as large again read as a diagram shouted rather than drawn. */}
      <svg
        className="plate-drawing"
        style={{ maxWidth: `${FIELD.w / 16}rem` }}
        viewBox={`0 0 ${FIELD.w} ${FIELD.h}`}
        aria-hidden="true"
        focusable="false"
      >
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

        {/* Where a node is while it is out of the graph. */}
        <circle ref={gap} className="graph-gap" cx="0" cy="0" r="15.5" style={{ opacity: 0 }} />

        {NODES.map(({ id, x, y }) => (
          <g
            key={id}
            ref={(el) => {
              node.current[id] = el;
            }}
          >
            <circle
              ref={(el) => {
                halo.current[id] = el;
              }}
              className="graph-halo"
              cx={x}
              cy={y}
              r="16"
              style={{ opacity: 0 }}
            />
            <circle
              ref={(el) => {
                rim.current[id] = el;
              }}
              className="graph-rim"
              cx={x}
              cy={y}
              r="10.4"
            />
            <circle
              ref={(el) => {
                core.current[id] = el;
              }}
              className="graph-core"
              cx={x}
              cy={y}
              r="5.5"
            />
          </g>
        ))}

        {/* Drawn last, so a message crossing a node passes in front of it. */}
        {MESSAGES.map((_, i) => (
          <circle
            key={i}
            ref={(el) => {
              message.current[i] = el;
            }}
            className="graph-msg"
            cx="0"
            cy="0"
            r="3"
            style={{ opacity: 0 }}
          />
        ))}
      </svg>

      {/* Laid out as Fig. 3's are: what the figure reads first, under the
          rule, then the sentence with the controls beside it. The four beats
          used to take a row of their own above the reading, and the plate was
          four rows of instruments deep under a drawing of nine nodes. */}
      <div className="plate-foot">
        {/* What the network says. The number has no unit on purpose: the
            figure is about how it is arrived at, not about what it would mean. */}
        <div>
          <p className="graph-out-line">
            <span className="label text-ink-faint">model output</span>
            <span ref={outText} className="graph-out-value">
              0.55
            </span>
            <span ref={delta} className="graph-out-delta" style={{ opacity: 0 }}>
              −0.18 without it
            </span>
          </p>
          {/* Stretched, not fitted: with the default preserveAspectRatio a
              viewBox 268 wide inside a box four pixels tall is scaled to fit
              the *height*, so the bar drew 268 px wide and centred however wide
              the figure was — which it had been doing, quietly, all along. */}
          <svg
            className="graph-out"
            viewBox="0 0 268 4"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <rect className="graph-out-track" x="0" y="1" width={SCALE} height="2" />
            <rect ref={fill} className="graph-out-fill" x="0" y="0" width="150" height="4" />
            {/* Where the prediction stood with the node still in the graph. */}
            <rect
              ref={mark}
              className="graph-out-mark"
              x="0"
              y="-1.5"
              width="1.4"
              height="7"
              style={{ opacity: 0 }}
            />
          </svg>
        </div>

        <div className="plate-row">
          <p ref={saidBox} className="figure-said graph-said">
            <span ref={said}>{BEATS[0].detail}</span>
          </p>
          {/* The four beats of a round, in order. Point at one to read what it
              does; press it to watch it. */}
          <ol className="choices" aria-label="The round this figure runs">
            {BEATS.map((b, i) => (
              <li key={b.key}>
                <button
                  type="button"
                  className="choice"
                  ref={(el) => {
                    words.current[i] = el;
                  }}
                  data-now={i === 0 ? "" : undefined}
                  aria-current={i === 0 ? "step" : undefined}
                  onPointerEnter={() => show(i)}
                  onPointerLeave={() => show(null)}
                  onFocus={() => show(i)}
                  onBlur={() => show(null)}
                  onClick={() => {
                    clock.current = BEAT_AT[i];
                    show(i);
                  }}
                >
                  <span className="choice-word">{b.name}</span>
                  <span className="sr-only">. {b.detail}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Plate>
  );
}
