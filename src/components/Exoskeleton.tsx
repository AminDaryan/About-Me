"use client";

import { useEffect, useRef, useState } from "react";
import useMedia from "./useMedia";
import {
  CYCLE,
  FRAME,
  SWING_FROM,
  freshEstimate,
  reference,
  saturate,
  step,
  torque,
  withWearer,
  type Body,
  type Estimate,
  type Law,
  type Limb,
} from "@/lib/swing";
import { GROUND, H, TRACE_H, TRACE_W, TRACE_X, TRACE_Y, W, frameOf, poseAt } from "@/lib/pose";

/* Fig. 4 — the exoskeleton's swing phase, and what an adaptive controller is
   for.

   Two legs run one walking cycle half a cycle apart, so that while one stands
   the other flies — and the flying one is the simulated one: two links, full
   inertia, Coriolis and gravity, integrated at 500 Hz, driven by whichever of
   the two controllers is selected. It is handed over at every step, in the
   pose the reference is in at the moment the foot leaves the floor, which is
   also the moment a real swing phase begins. The standing leg follows the
   reference exactly: it is carrying the weight, the paper's model does not
   cover it, and simulating it would double the cost of the figure to say
   nothing new.

   The point of the figure is the gap between the dashed reference and the
   solid leg, and the trace of that gap beside it. Both controllers are given
   the machine's inertia, which a designer really does know; neither is told
   what the person in the frame weighs. The PID can only meet that as an error
   it has already made, and meets the same one every step — about five degrees,
   the same hump again and again. The adaptive law learns it as a function of
   where the leg is, and holds about one and a half. Press "new wearer" and the
   PID settles at a different error; the adaptive law is back where it was
   inside a step, which is the paper's word "reconfigurable" in one gesture.

   Per-frame work goes straight to the DOM through refs; React state holds only
   what a person changes, which is twice a minute at most. */

/** Integrator step. Fine enough that the adaptation law is smooth at 60 fps. */
const DT = 1 / 500;

/** How much of the error trace is kept, in samples — about twelve seconds. */
const TRACE = 150;
/** The trace's ceiling, in radians. An error this big is a leg out of place. */
const TRACE_MAX = 0.11;

/* The opening pose, computed once. It is what the server renders and what the
   first paint shows, so the figure is a finished drawing before a single frame
   has run — and stays one if none ever does. */
const START = poseAt(SWING_FROM);
const FIRST = frameOf(SWING_FROM, START[0], START[1]);

export default function Exoskeleton() {
  const [law, setLaw] = useState<Law>("pid");
  const [wearer, setWearer] = useState(0);
  /* Reduced motion gets the figure at rest, in the pose it starts in; pressing
     anything starts it, because pressing something is a request to see it
     move. The query is read through the store rather than in an effect, so the
     server and the first paint agree on the markup and only the motion
     differs. */
  const [started, setStarted] = useState(false);
  const reduced = useMedia("(prefers-reduced-motion: reduce)", false);
  const running = started || !reduced;

  const stateRef = useRef<Limb>(poseAt(SWING_FROM));
  const estRef = useRef<Estimate>(freshEstimate());
  const bodyRef = useRef<Body>(withWearer(FRAME, 9, 5));
  /* The phase of the leg in the air, which is always the back half of the
     cycle: it runs from SWING_FROM to 1 and then the other leg takes over. */
  const phaseRef = useRef(SWING_FROM);
  const accRef = useRef(0);
  const trace = useRef<Float32Array>(new Float32Array(TRACE));
  const traceAt = useRef(0);

  const swing = useRef<SVGPathElement>(null);
  const ghost = useRef<SVGPathElement>(null);
  const stance = useRef<SVGPathElement>(null);
  const torso = useRef<SVGPathElement>(null);
  const joints = useRef<(SVGCircleElement | null)[]>([]);
  const traceLine = useRef<SVGPolylineElement>(null);
  const errorText = useRef<HTMLSpanElement>(null);

  /* A wearer's mass is not a smooth dial: it is a different person. Each press
     hands the controller a limb it has not seen, which is the case the paper's
     "reconfigurable" is about. */
  useEffect(() => {
    if (wearer === 0) return;
    const thigh = 4 + ((wearer * 4.7) % 13);
    const shank = 2 + ((wearer * 3.1) % 8);
    bodyRef.current = withWearer(FRAME, thigh, shank);
  }, [wearer]);

  /* Switching the law starts its estimate from nothing, so that what you watch
     afterwards is that law and not the other one's leftovers. A new wearer does
     *not* reset it: a controller does not get told that the person in the frame
     has changed, and watching it find out is the point of the button. */
  useEffect(() => {
    estRef.current = freshEstimate();
  }, [law]);

  useEffect(() => {
    let frame = 0;
    let last = performance.now();

    const paint = () => {
      const f = frameOf(phaseRef.current, stateRef.current[0], stateRef.current[1]);
      swing.current?.setAttribute("d", f.swing.d);
      stance.current?.setAttribute("d", f.stance.d);
      ghost.current?.setAttribute("d", f.ghost.d);
      torso.current?.setAttribute("d", f.torso);
      f.marks.forEach((m, i) => {
        const c = joints.current[i];
        if (!c) return;
        c.setAttribute("cx", m.x.toFixed(1));
        c.setAttribute("cy", m.y.toFixed(1));
      });

      trace.current[traceAt.current] = f.error;
      traceAt.current = (traceAt.current + 1) % TRACE;
      if (traceLine.current) {
        let points = "";
        for (let i = 0; i < TRACE; i++) {
          const v = trace.current[(traceAt.current + i) % TRACE];
          const x = TRACE_X + (i / (TRACE - 1)) * TRACE_W;
          const y = TRACE_Y + TRACE_H - Math.min(1, v / TRACE_MAX) * TRACE_H;
          points += `${x.toFixed(1)},${y.toFixed(1)} `;
        }
        traceLine.current.setAttribute("points", points.trim());
      }
      if (errorText.current) {
        errorText.current.textContent = ((f.error * 180) / Math.PI).toFixed(1);
      }
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      // A tab that has been in the background hands back a huge delta; catching
      // up on it in one go would put the integrator through the wall.
      accRef.current += Math.min((now - last) / 1000, 0.05);
      last = now;

      let phase = phaseRef.current;
      while (accRef.current >= DT) {
        phase += DT / CYCLE;
        if (phase >= 1) {
          /* The step is over: the other leg's heel has landed, this one's toe
             has left the floor, and the controller starts again on a limb that
             is where the reference says it should be. What it has learned
             about the wearer stays learned — that is the whole point. */
          phase = SWING_FROM;
          stateRef.current = poseAt(SWING_FROM);
        }
        const tau = saturate(
          torque(law, stateRef.current, reference(phase), estRef.current, DT),
        );
        stateRef.current = step(bodyRef.current, stateRef.current, tau, DT);
        accRef.current -= DT;
      }
      phaseRef.current = phase;
      paint();
    };

    // Painted once whatever happens, so that a figure asked to hold still still
    // shows the pose it is holding.
    paint();
    if (running) frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // The loop closes over the law, so switching controllers rebuilds it; the
    // simulation itself lives in refs and carries straight on.
  }, [running, law]);

  const press = (fn: () => void) => () => {
    fn();
    setStarted(true);
  };

  return (
    <figure className="m-0 mt-8">
      <div className="exo">
        <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
          {/* the floor */}
          <line className="exo-rule" x1="14" y1={GROUND} x2="212" y2={GROUND} />

          <path ref={ghost} className="exo-ghost" d={FIRST.ghost.d} />
          <path ref={stance} className="exo-limb exo-stance" d={FIRST.stance.d} />
          <path ref={torso} className="exo-limb" d={FIRST.torso} />
          <path ref={swing} className="exo-limb exo-swing" d={FIRST.swing.d} />

          {/* Hips and knees are motors; ankles are springs, and are drawn
              hollow so the difference is on the page rather than in a key. */}
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              ref={(el) => {
                joints.current[i] = el;
              }}
              className="exo-motor"
              r="4.6"
              cx={FIRST.marks[i].x}
              cy={FIRST.marks[i].y}
            />
          ))}
          {[3, 4].map((i) => (
            <circle
              key={i}
              ref={(el) => {
                joints.current[i] = el;
              }}
              className="exo-passive"
              r="3.6"
              cx={FIRST.marks[i].x}
              cy={FIRST.marks[i].y}
            />
          ))}

          {/* the error trace, with the only words in the drawing */}
          <text className="exo-label" x={TRACE_X} y={TRACE_Y - 9}>
            tracking error
          </text>
          <line
            className="exo-rule"
            x1={TRACE_X}
            y1={TRACE_Y + TRACE_H}
            x2={TRACE_X + TRACE_W}
            y2={TRACE_Y + TRACE_H}
          />
          <polyline ref={traceLine} className="exo-trace" points="" />
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-t border-rule pt-4">
        <p className="label text-ink-faint">
          error <span ref={errorText} className="text-ink">0.0</span>°
          <span className="mx-2 text-rule">·</span>
          <span className="normal-case">hips and knees driven, ankles passive</span>
        </p>

        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <div className="flex gap-x-4" role="group" aria-label="Controller">
            {(["pid", "adaptive"] as const).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={law === k}
                onClick={press(() => setLaw(k))}
                className={`label tap cursor-pointer border-b pb-0.5 transition-colors ${
                  law === k
                    ? "border-accent text-accent"
                    : "border-transparent text-ink-faint hover:text-ink"
                }`}
              >
                {k === "pid" ? "Tuned PID" : "Adaptive"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={press(() => setWearer((n) => n + 1))}
            className="label tap link cursor-pointer text-ink-faint"
          >
            New wearer
          </button>
        </div>
      </div>

      <figcaption className="mt-4 max-w-measure text-meta text-ink-faint italic">
        Fig. 4 — One leg swings and one supports, simulated here rather than
        measured: both controllers are given the machine&rsquo;s inertia,
        neither is told what the wearer weighs.
      </figcaption>
    </figure>
  );
}
