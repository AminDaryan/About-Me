"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useMedia from "./useMedia";
import { Plate } from "@/components/ui";
import {
  ACTIVITIES,
  FIELD,
  GRID,
  features,
  scanpath,
  squareAt,
  type Activity,
  type Fixation,
} from "@/lib/scanpath";

/* Fig. 3 — four habits of looking, and nothing else.

   An eye at the left of the plate looks over a grid, and a scanpath plays out
   on it: each rest of the eye a ring, each square darkening with the time the
   eye spends in it, and the four feature families filling underneath. Switch
   activities and the pattern the squares make changes shape — one dark square,
   two with a path worn between them, a light band along the bottom, a scatter.
   That difference is what a classifier has to work with, and seeing it is the
   point of the figure.

   Nothing on the grid is named and nothing on it stands for a thing. The
   figure used to draw the workbench, and a reader had to read four labels
   before they could see a pattern; the pattern was always the subject.

   The paths are generated, not recorded — see the note at the top of
   lib/scanpath.ts, and the caption under the figure, which says so to the
   reader as well.

   The marks are all in the document from the start and only their opacity and
   position change, so a frame costs a few attribute writes and no layout. */

/** How many fixations stay on screen behind the eye — and so how much of the
    path the squares remember. */
const TAIL = 12;
/** Milliseconds of real time per millisecond of scanpath — it plays at speed. */
const PACE = 1;
/** The time at rest, in ms and weighted for recency, that turns a square fully
    dark — and how dark that is. Not solid: the rings are drawn over it, and
    they have to stay readable on the darkest square there is. Squares darken
    along a square root rather than a straight line, or a walk's quick glances
    left squares too faint to see and the band they make disappeared. */
const DWELL_FULL = 1800;
const DARKEST = 0.5;

const dot = (f: Fixation) => Math.max(3.2, Math.min(11, 2.4 + f.dur / 110));

/* -- The eye ---------------------------------------------------------------
   Face on, in the drawing's units. Each lid is one cubic, so the lashes can be
   hung from the curve itself rather than placed by eye. */

type Pt = { x: number; y: number };
type Cubic = [Pt, Pt, Pt, Pt];

const UPPER: Cubic = [
  { x: 32, y: 112 },
  { x: 56, y: 80 },
  { x: 116, y: 74 },
  { x: 152, y: 104 },
];
const LOWER: Cubic = [
  { x: 152, y: 104 },
  { x: 124, y: 132 },
  { x: 64, y: 140 },
  { x: 32, y: 112 },
];
/** The upper lid closed: it comes down past where the iris was. */
const SHUT: Cubic = [
  { x: 32, y: 112 },
  { x: 60, y: 124 },
  { x: 118, y: 124 },
  { x: 152, y: 104 },
];
const CREASE: Cubic = [
  { x: 42, y: 100 },
  { x: 62, y: 70 },
  { x: 118, y: 62 },
  { x: 146, y: 90 },
];

/** Where the iris rests, looking straight out: the middle of the opening. */
const EYE = { x: 90, y: 107 };
const IRIS = 19;
const PUPIL = 7.5;

const curve = ([, b, c, d]: Cubic) => `C ${b.x} ${b.y}, ${c.x} ${c.y}, ${d.x} ${d.y}`;
const open = (c: Cubic) => `M ${c[0].x} ${c[0].y} ${curve(c)}`;
const OPENING = `${open(UPPER)} ${curve(LOWER)} Z`;

/** A point on a cubic at `t`, and the unit normal to its left. */
function along([a, b, c, d]: Cubic, t: number) {
  const u = 1 - t;
  const at = (k: "x" | "y") =>
    u * u * u * a[k] + 3 * u * u * t * b[k] + 3 * u * t * t * c[k] + t * t * t * d[k];
  const slope = (k: "x" | "y") =>
    3 * u * u * (b[k] - a[k]) + 6 * u * t * (c[k] - b[k]) + 3 * t * t * (d[k] - c[k]);
  const tx = slope("x");
  const ty = slope("y");
  const len = Math.hypot(tx, ty) || 1;
  return { x: at("x"), y: at("y"), nx: ty / len, ny: -tx / len, tx: tx / len, ty: ty / len };
}

/** Lashes along a lid, longer towards the outer corner and swept towards it.
    `side` is 1 to hang them above the curve, −1 below. */
function lashes(lid: Cubic, side: 1 | -1) {
  return [0.3, 0.45, 0.6, 0.74, 0.87]
    .map((t, i) => {
      const p = along(lid, t);
      const len = 5 + i * 0.9;
      const x1 = p.x + side * p.nx * 1.5;
      const y1 = p.y + side * p.ny * 1.5;
      const x2 = p.x + side * p.nx * len + p.tx * 2.2;
      const y2 = p.y + side * p.ny * len + p.ty * 2.2;
      return `M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}`;
    })
    .join(" ");
}

const LASHES_OPEN = lashes(UPPER, 1);
const LASHES_SHUT = lashes(SHUT, -1);

/** The engraver's iris: short strokes running out from the pupil. */
const IRIS_LINES = Array.from({ length: 22 }, (_, i) => {
  const a = (i / 22) * Math.PI * 2;
  const r0 = PUPIL + 2;
  const r1 = IRIS - 1.5;
  return `M ${(Math.cos(a) * r0).toFixed(1)} ${(Math.sin(a) * r0).toFixed(1)} L ${(Math.cos(a) * r1).toFixed(1)} ${(Math.sin(a) * r1).toFixed(1)}`;
}).join(" ");

/** The grid's extent, from the eye's rest, for turning the eye towards a point. */
const NEAR = GRID.x - EYE.x;
const FAR = GRID.x + GRID.cols * GRID.cell - EYE.x;
const HALF_TALL = (GRID.rows * GRID.cell) / 2;

/** Where the iris sits while the eye is on (x, y): turned towards the point,
    as far as an eye turns inside its lids. The grid lies wholly to the right,
    so the eye is always looking right, and further right the further out the
    point is. */
function irisAt(x: number, y: number): Pt {
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  return {
    x: EYE.x + 4 + 16 * clamp((x - EYE.x - NEAR) / (FAR - NEAR), 0, 1),
    y: EYE.y + 8 * clamp((y - EYE.y) / HALF_TALL, -1, 1),
  };
}

/** Where the line of sight starts: clear of the eye, on the way to the point. */
const SIGHT_FROM = 70;
function sightFrom(x: number, y: number): Pt {
  const d = Math.hypot(x - EYE.x, y - EYE.y) || 1;
  return { x: EYE.x + ((x - EYE.x) / d) * SIGHT_FROM, y: EYE.y + ((y - EYE.y) / d) * SIGHT_FROM };
}

export default function Gaze() {
  const [activity, setActivity] = useState<Activity>("assembling");
  const [started, setStarted] = useState(false);
  const reduced = useMedia("(prefers-reduced-motion: reduce)", false);
  const running = started || !reduced;

  const path = useMemo(() => scanpath(activity), [activity]);
  const where = useMemo(() => path.map((f) => squareAt(f.x, f.y)), [path]);
  const total = path[path.length - 1].at + path[path.length - 1].dur;

  const marks = useRef<(SVGCircleElement | null)[]>([]);
  const squares = useRef<(SVGRectElement | null)[]>([]);
  const trail = useRef<SVGPolylineElement>(null);
  const point = useRef<SVGCircleElement>(null);
  const sight = useRef<SVGLineElement>(null);
  const iris = useRef<SVGGElement>(null);
  const opened = useRef<SVGGElement>(null);
  const shut = useRef<SVGGElement>(null);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const startedAt = useRef(0);

  useEffect(() => {
    let frame = 0;
    startedAt.current = performance.now();
    const dwell = new Float32Array(GRID.cols * GRID.rows);

    const paint = (now: number) => {
      const t = running ? ((now - startedAt.current) * PACE) % total : total * 0.62;

      /* The index of the fixation the eye is on, and the tail behind it. Both
         are found by walking the list: it is thirty-four entries long, and a
         binary search would be a cleverness nobody needs. */
      let head = 0;
      while (head + 1 < path.length && path[head + 1].at <= t) head++;

      /* A square remembers the rests in the tail, the newest counting most and
         the one under way counting only for as long as it has lasted — so a
         square fills while the eye is in it rather than all at once. */
      dwell.fill(0);
      const points: string[] = [];
      path.forEach((f, i) => {
        const c = marks.current[i];
        const age = head - i;
        const shown = age >= 0 && age < TAIL;
        if (c) c.style.opacity = shown ? String(0.15 + 0.85 * (1 - age / TAIL)) : "0";
        if (!shown) return;
        points.unshift(`${f.x.toFixed(1)},${f.y.toFixed(1)}`);
        const rested = i === head ? Math.min(f.dur, t - f.at) : f.dur;
        dwell[where[i]] += rested * (1 - age / TAIL);
      });
      trail.current?.setAttribute("points", points.join(" "));
      dwell.forEach((ms, k) => {
        const sq = squares.current[k];
        if (sq) sq.style.opacity = (DARKEST * Math.sqrt(Math.min(1, ms / DWELL_FULL))).toFixed(3);
      });

      /* Between two fixations the eye is in flight; a saccade is fast enough
         that easing it would be a lie, so it travels at a constant rate and
         arrives early. */
      const from = path[head];
      const to = path[Math.min(head + 1, path.length - 1)];
      const gap = Math.max(1, to.at - (from.at + from.dur));
      const k = Math.max(0, Math.min(1, (t - (from.at + from.dur)) / gap));
      const x = from.x + (to.x - from.x) * k;
      const y = from.y + (to.y - from.y) * k;
      point.current?.setAttribute("cx", x.toFixed(1));
      point.current?.setAttribute("cy", y.toFixed(1));

      const ir = irisAt(x, y);
      iris.current?.setAttribute("transform", `translate(${ir.x.toFixed(1)} ${ir.y.toFixed(1)})`);
      const s = sightFrom(x, y);
      sight.current?.setAttribute("x1", s.x.toFixed(1));
      sight.current?.setAttribute("y1", s.y.toFixed(1));
      sight.current?.setAttribute("x2", x.toFixed(1));
      sight.current?.setAttribute("y2", y.toFixed(1));

      /* A blink is the saccade after a fixation marked for one: the lids close
         for that flight, which is about as long as a real blink lasts, and the
         eye is looking at nothing while they are closed. */
      const closed = from.blink && t > from.at + from.dur && t < to.at;
      if (opened.current) opened.current.style.opacity = closed ? "0" : "1";
      if (shut.current) shut.current.style.opacity = closed ? "1" : "0";
      if (sight.current) sight.current.style.opacity = closed ? "0" : "1";

      const f = features(path.slice(Math.max(0, head - TAIL + 1), head + 1));
      [f.blinks, f.dwell, f.spread, f.rate].forEach((v, i) => {
        const bar = bars.current[i];
        if (bar) bar.style.width = `${(v * 100).toFixed(1)}%`;
      });

      if (running) frame = requestAnimationFrame(paint);
    };

    paint(performance.now());
    return () => cancelAnimationFrame(frame);
  }, [path, where, total, running]);

  /* The first frame, for the server and for a reader with no JavaScript: the
     eye open and on the first rest of the path, and the grid still empty. */
  const first = path[0];
  const firstIris = irisAt(first.x, first.y);
  const firstSight = sightFrom(first.x, first.y);

  return (
    <Plate
      fig={3}
      caption={
        <>
          An eye and the grid it looks over, each square darkening as the eye
          rests in it — the paths drawn to show the kind of difference the
          study’s nineteen features measure, not recorded from it.
        </>
      }
    >
      <svg
        className="plate-drawing"
        viewBox={`0 0 ${FIELD.w} ${FIELD.h}`}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <clipPath id="gaze-opening">
            <path d={OPENING} />
          </clipPath>
        </defs>

        {/* The field of view: squares that darken, a frame, and a dot at each
            crossing — enough to read as a grid and no more. */}
        {Array.from({ length: GRID.cols * GRID.rows }, (_, k) => (
          <rect
            key={k}
            ref={(el) => {
              squares.current[k] = el;
            }}
            className="gaze-square"
            x={GRID.x + (k % GRID.cols) * GRID.cell + 1}
            y={GRID.y + Math.floor(k / GRID.cols) * GRID.cell + 1}
            width={GRID.cell - 2}
            height={GRID.cell - 2}
            style={{ opacity: 0 }}
          />
        ))}
        <rect
          className="gaze-frame"
          x={GRID.x}
          y={GRID.y}
          width={GRID.cols * GRID.cell}
          height={GRID.rows * GRID.cell}
        />
        {Array.from({ length: (GRID.cols - 1) * (GRID.rows - 1) }, (_, k) => (
          <circle
            key={k}
            className="gaze-crossing"
            cx={GRID.x + ((k % (GRID.cols - 1)) + 1) * GRID.cell}
            cy={GRID.y + (Math.floor(k / (GRID.cols - 1)) + 1) * GRID.cell}
            r="1.3"
          />
        ))}

        {/* The eye. The crease stays whether the lids are open or shut. */}
        <path className="gaze-crease" d={open(CREASE)} />
        <g ref={opened}>
          <g clipPath="url(#gaze-opening)">
            <g ref={iris} transform={`translate(${firstIris.x} ${firstIris.y})`}>
              <circle className="gaze-iris" r={IRIS} />
              <path className="gaze-iris-line" d={IRIS_LINES} />
              <circle className="gaze-pupil" r={PUPIL} />
              <circle className="gaze-glint" cx="-2.8" cy="-3.2" r="2.1" />
            </g>
          </g>
          <path className="gaze-lid" d={OPENING} />
          <path className="gaze-lash" d={LASHES_OPEN} />
        </g>
        <g ref={shut} style={{ opacity: 0 }}>
          <path className="gaze-lid" d={open(SHUT)} />
          <path className="gaze-lash" d={LASHES_SHUT} />
        </g>

        <line
          ref={sight}
          className="gaze-sight"
          x1={firstSight.x}
          y1={firstSight.y}
          x2={first.x}
          y2={first.y}
        />
        <polyline ref={trail} className="gaze-trail" points="" />
        {path.map((f, i) => (
          <circle
            key={i}
            ref={(el) => {
              marks.current[i] = el;
            }}
            className={f.blink ? "gaze-fix gaze-blink" : "gaze-fix"}
            cx={f.x}
            cy={f.y}
            r={dot(f)}
            style={{ opacity: 0 }}
          />
        ))}
        <circle ref={point} className="gaze-point" cx={first.x} cy={first.y} r="3.4" />
      </svg>

      <div className="plate-foot">
        {/* The four families of feature, filling as the path plays. Nineteen of
            them went into the classifier; these are the families they fall into. */}
        <div className="meters" data-four>
          {["Blinks", "Dwell", "Spread", "Rate"].map((name, i) => (
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

        <div className="plate-row">
          <p className="figure-said">
            {ACTIVITIES.find((a) => a.key === activity)?.what}
          </p>
          <div className="choices" role="group" aria-label="Activity">
            {ACTIVITIES.map((a) => (
              <button
                key={a.key}
                type="button"
                aria-pressed={activity === a.key}
                onClick={() => {
                  setActivity(a.key);
                  setStarted(true);
                }}
                className="choice"
              >
                <span className="choice-word">{a.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Plate>
  );
}
