"use client";

import { useEffect, useRef, useState } from "react";
import useMedia from "./useMedia";
import {
  CYCLE,
  FRAME,
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

/* Fig. 4 — the exoskeleton's swing phase, and what an adaptive controller is
   for.

   One leg swings and one supports, which is how the FUME paper models a step.
   The swinging leg here is simulated properly — two links, full inertia,
   Coriolis and gravity, integrated at 500 Hz — and driven by whichever of the
   two controllers is selected. The supporting leg follows the same reference
   half a cycle later, kinematically: it is carrying the weight, not being
   studied, and simulating it would double the cost of the figure to say
   nothing new. The hip rides up and down so that the supporting foot stays on
   the ground, which is what makes the drawing read as walking rather than as
   two pendulums.

   The point of the figure is the gap between the dashed reference and the
   solid leg. A PID has to see an error before it can answer it, and gravity on
   a loaded shank hands it the same error every cycle. The adaptive law learns
   that torque while the leg is moving, so the gap closes over a few steps —
   and opens again, and closes again, when the wearer changes.

   Per-frame work goes straight to the DOM through refs; React state holds only
   what a person changes, which is twice a minute at most. */

/** Integrator step. Fine enough that the adaptation law is smooth at 60 fps. */
const DT = 1 / 500;

/* The drawing, in the SVG's own units. 1 m = 190 units. */
const W = 360;
const H = 250;
const SCALE = 190;
const HIP_X = 120;
const GROUND = 232;
/** A standing leg is not a straight one, but it is close: the stance knee keeps
    a tenth of the swing knee's flexion. */
const STANCE_KNEE = 0.1;
/** Headroom, so a leg that is tracking badly is late rather than underground. */
const LIFT = 3;
/** The torso, as far as this figure draws one. */
const TORSO = 56;

/** How much of the error trace is kept, in samples — about twelve seconds. */
const TRACE = 150;
const TRACE_X = 246;
const TRACE_W = 104;
const TRACE_Y = 120;
const TRACE_H = 46;
/** The trace's ceiling, in radians. An error this big is a leg out of place. */
const TRACE_MAX = 0.11;

type Point = { x: number; y: number };

/** Where a two-link leg's knee and ankle are, given the hip and the two angles.
    SVG's y runs down the page, which is the direction gravity goes, so the
    drawing needs no flip: a hanging leg is θ = 0. */
function legPoints(hip: Point, q1: number, q2: number): { knee: Point; ankle: Point } {
  const knee = {
    x: hip.x + FRAME.l1 * SCALE * Math.sin(q1),
    y: hip.y + FRAME.l1 * SCALE * Math.cos(q1),
  };
  return {
    knee,
    ankle: {
      x: knee.x + FRAME.l2 * SCALE * Math.sin(q1 + q2),
      y: knee.y + FRAME.l2 * SCALE * Math.cos(q1 + q2),
    },
  };
}

/**
 * Everything the drawing needs for one instant: the three legs' paths, the
 * torso, and the five joint marks.
 *
 * The same function serves the first paint and every frame after it, so the
 * figure is correct before any JavaScript runs — and stays correct, in its
 * opening pose, for a reader who has asked for no motion at all.
 */
function frameOf(phase: number, q1: number, q2: number) {
  const ref = reference(phase);
  // The supporting leg is half a cycle behind, and barely bends.
  const other = reference((phase + 0.5) % 1);
  const s1 = other.q[0];
  const s2 = other.q[1] * STANCE_KNEE;
  /* The hip hangs from whichever leg reaches further down, which is the one
     standing on the floor. Hold the hip at a fixed height instead and a foot
     goes through the floor twice a step; hang it from the supporting leg alone
     and the other one does, during the moment both are down. This is the only
     rule that keeps every foot on the right side of the line, and it is also
     what a walking body does — the hips rise and fall by an inch a step. */
  const reach = (a: number, b: number) =>
    FRAME.l1 * Math.cos(a) + FRAME.l2 * Math.cos(a + b);
  const hip: Point = {
    x: HIP_X,
    y: GROUND - Math.max(reach(ref.q[0], ref.q[1]), reach(s1, s2)) * SCALE - LIFT,
  };

  const swing = legPath(hip, q1, q2);
  const stance = legPath(hip, s1, s2);
  const ghost = legPath(hip, ref.q[0], ref.q[1]);
  return {
    hip,
    swing,
    stance,
    ghost,
    torso: `M ${hip.x} ${hip.y.toFixed(1)} L ${hip.x} ${(hip.y - TORSO).toFixed(1)}`,
    marks: [hip, swing.knee, stance.knee, swing.ankle, stance.ankle],
    error: Math.hypot(ref.q[0] - q1, ref.q[1] - q2),
  };
}

/** One leg's three strokes as path data: thigh, shank and foot. */
function legPath(hip: Point, q1: number, q2: number) {
  const { knee, ankle } = legPoints(hip, q1, q2);
  // The foot stays flat to the floor until the leg is well off the ground,
  // which is close enough to an ankle that is a spring rather than a motor.
  const flat = Math.max(0, Math.min(1, (GROUND - ankle.y) / 26));
  const toe = -0.35 * flat;
  return {
    knee,
    ankle,
    d:
      `M ${hip.x.toFixed(1)} ${hip.y.toFixed(1)} L ${knee.x.toFixed(1)} ${knee.y.toFixed(1)} ` +
      `L ${ankle.x.toFixed(1)} ${ankle.y.toFixed(1)} ` +
      `l ${(26 * Math.cos(toe)).toFixed(1)} ${(-26 * Math.sin(toe)).toFixed(1)}`,
  };
}

/* The opening pose, computed once. It is what the server renders and what the
   first paint shows, so the figure is a finished drawing before a single frame
   has run — and stays one if none ever does. */
const FIRST = frameOf(0, reference(0).q[0], reference(0).q[1]);

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

  const stateRef = useRef<Limb>([reference(0).q[0], reference(0).q[1], 0, 0]);
  const estRef = useRef<Estimate>(freshEstimate());
  const bodyRef = useRef<Body>(withWearer(FRAME, 9, 5));
  const phaseRef = useRef(0);
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
    const thigh = 5 + (wearer * 2.7) % 8;
    const shank = 3 + (wearer * 1.9) % 5;
    bodyRef.current = withWearer(FRAME, thigh, shank);
  }, [wearer]);

  /* Switching the law starts its estimate from nothing, so that what you watch
     afterwards is the adaptation and not the last one's leftovers. */
  useEffect(() => {
    estRef.current = freshEstimate();
  }, [law, wearer]);

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
        phase = (phase + DT / CYCLE) % 1;
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
        Fig. 4 — One leg swings, one supports. The swinging leg is simulated
        here in your browser — two links, full inertia and gravity — and the
        dashed line is where it is meant to be: a tuned PID meets the same
        error every step, while the adaptive law learns the part of the
        dynamics nobody can write down, and closes the gap over a few. The
        paper&rsquo;s own numbers are from the physical robot, not from this.
      </figcaption>
    </figure>
  );
}
