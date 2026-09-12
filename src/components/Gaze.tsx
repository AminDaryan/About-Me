"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useMedia from "./useMedia";
import {
  ACTIVITIES,
  FIELD,
  PLACES,
  features,
  scanpath,
  type Activity,
  type Fixation,
} from "@/lib/scanpath";

/* Fig. 2 — what four activities look like from behind the eyes.

   A scanpath plays out over a workbench and the four feature families fill
   underneath it. Switch activities and the whole shape of the looking changes:
   gluing is a long stare in one place, assembling is a shuttle between two,
   walking is quick and low and everywhere, waiting is slow and aimless. That
   difference is what a classifier has to work with, and seeing it is the point
   of the figure.

   The paths are generated, not recorded — see the note at the top of
   lib/scanpath.ts, and the caption under the figure, which says so to the
   reader as well.

   The marks are all in the document from the start and only their opacity and
   position change, so a frame costs a few attribute writes and no layout. */

/** How many fixations stay on screen behind the eye. */
const TAIL = 9;
/** Milliseconds of real time per millisecond of scanpath — it plays at speed. */
const PACE = 1;

const dot = (f: Fixation) => Math.max(3.2, Math.min(11, 2.4 + f.dur / 110));

export default function Gaze() {
  const [activity, setActivity] = useState<Activity>("assembling");
  const [started, setStarted] = useState(false);
  const reduced = useMedia("(prefers-reduced-motion: reduce)", false);
  const running = started || !reduced;

  const path = useMemo(() => scanpath(activity), [activity]);
  const total = path[path.length - 1].at + path[path.length - 1].dur;

  const marks = useRef<(SVGCircleElement | null)[]>([]);
  const trail = useRef<SVGPolylineElement>(null);
  const eye = useRef<SVGCircleElement>(null);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const startedAt = useRef(0);

  useEffect(() => {
    let frame = 0;
    startedAt.current = performance.now();

    const paint = (now: number) => {
      const t = running ? ((now - startedAt.current) * PACE) % total : total * 0.62;

      /* The index of the fixation the eye is on, and the tail behind it. Both
         are found by walking the list: it is thirty-four entries long, and a
         binary search would be a cleverness nobody needs. */
      let head = 0;
      while (head + 1 < path.length && path[head + 1].at <= t) head++;

      const points: string[] = [];
      path.forEach((f, i) => {
        const c = marks.current[i];
        if (!c) return;
        const age = head - i;
        const shown = age >= 0 && age < TAIL;
        c.style.opacity = shown ? String(0.15 + 0.85 * (1 - age / TAIL)) : "0";
        if (shown) points.unshift(`${f.x.toFixed(1)},${f.y.toFixed(1)}`);
      });
      trail.current?.setAttribute("points", points.join(" "));

      /* Between two fixations the eye is in flight; a saccade is fast enough
         that easing it would be a lie, so it travels at a constant rate and
         arrives early. */
      const from = path[head];
      const to = path[Math.min(head + 1, path.length - 1)];
      const gap = Math.max(1, to.at - (from.at + from.dur));
      const k = Math.max(0, Math.min(1, (t - (from.at + from.dur)) / gap));
      if (eye.current) {
        eye.current.setAttribute("cx", (from.x + (to.x - from.x) * k).toFixed(1));
        eye.current.setAttribute("cy", (from.y + (to.y - from.y) * k).toFixed(1));
      }

      const f = features(path.slice(Math.max(0, head - TAIL + 1), head + 1));
      [f.blinks, f.dwell, f.spread, f.rate].forEach((v, i) => {
        const bar = bars.current[i];
        if (bar) bar.style.width = `${(v * 100).toFixed(1)}%`;
      });

      if (running) frame = requestAnimationFrame(paint);
    };

    paint(performance.now());
    return () => cancelAnimationFrame(frame);
  }, [path, total, running]);

  const box = (b: { x: number; y: number; w: number; h: number }, extra = "") => (
    <rect className={`gaze-prop ${extra}`} x={b.x} y={b.y} width={b.w} height={b.h} rx="3" />
  );

  return (
    <figure className="m-0 mt-8">
      <div className="gaze">
        <svg viewBox={`0 0 ${FIELD.w} ${FIELD.h}`} aria-hidden="true" focusable="false">
          {/* The room, as much of it as a figure needs: a far wall, a doorway,
              a bench, and the three things on it that the tasks are about. */}
          <line className="gaze-rule" x1="24" y1="112" x2="336" y2="112" />
          {box(PLACES.door)}
          <line className="gaze-rule" x1="18" y1="182" x2="342" y2="182" />
          <path className="gaze-rule" d="M 54 182 L 54 200 M 306 182 L 306 200" />
          {/* the chassis, with two wheels */}
          {box(PLACES.chassis)}
          <circle className="gaze-prop" cx="214" cy="178" r="6" />
          <circle className="gaze-prop" cx="274" cy="178" r="6" />
          {/* the parts bin and the glue gun */}
          <path
            className="gaze-prop"
            d={`M ${PLACES.bin.x} ${PLACES.bin.y} L ${PLACES.bin.x + 6} ${PLACES.bin.y + PLACES.bin.h} L ${PLACES.bin.x + PLACES.bin.w - 6} ${PLACES.bin.y + PLACES.bin.h} L ${PLACES.bin.x + PLACES.bin.w} ${PLACES.bin.y} Z`}
          />
          <path className="gaze-prop" d="M 152 140 L 178 140 L 178 148 L 166 148 L 162 162 L 154 162 L 158 148 L 152 148 Z" />

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
          <circle ref={eye} className="gaze-eye" cx="0" cy="0" r="3.4" />
        </svg>
      </div>

      {/* The four families of feature, filling as the path plays. Nineteen of
          them went into the classifier; these are the families they fall into. */}
      <div className="gaze-features">
        {["Blinks", "Dwell", "Spread", "Rate"].map((name, i) => (
          <div key={name} className="gaze-feature">
            <span className="label text-ink-faint">{name}</span>
            <span className="gaze-bar">
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
        <p className="label text-ink-faint">
          <span className="normal-case">
            {ACTIVITIES.find((a) => a.key === activity)?.what}
          </span>
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2" role="group" aria-label="Activity">
          {ACTIVITIES.map((a) => (
            <button
              key={a.key}
              type="button"
              aria-pressed={activity === a.key}
              onClick={() => {
                setActivity(a.key);
                setStarted(true);
              }}
              className={`label tap cursor-pointer border-b pb-0.5 transition-colors ${
                activity === a.key
                  ? "border-accent text-accent"
                  : "border-transparent text-ink-faint hover:text-ink"
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>
      </div>

      <figcaption className="mt-4 max-w-measure text-meta text-ink-faint italic">
        Fig. 2 — The same workbench watched four ways, the scanpaths drawn to
        show the kind of difference the study’s nineteen features measure
        rather than recorded from it.
      </figcaption>
    </figure>
  );
}
