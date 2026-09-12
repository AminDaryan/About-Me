/* ==========================================================================
   Where the drawing puts a leg.

   Kept apart from the component that draws it, and free of the DOM, so that
   the same function can be run outside a browser and the figure checked frame
   by frame — which is how the walk was got right. Units are the SVG's own.
   ========================================================================== */

import { FRAME, reference, type Limb } from "./swing";

export const W = 360;
export const H = 250;
/** 1 m, in the drawing's units. */
export const SCALE = 190;
export const HIP_X = 120;
export const GROUND = 232;
/** Headroom, so a leg that is tracking badly is late rather than underground. */
export const LIFT = 3;
/** The torso, as far as this figure draws one. */
export const TORSO = 56;
/** The foot, from the ankle to the toe. */
const FOOT = 26;

/** The error trace, off to the right of the walker. */
export const TRACE_X = 246;
export const TRACE_W = 104;
export const TRACE_Y = 120;
export const TRACE_H = 46;

export interface Point {
  x: number;
  y: number;
}

/** Where a two-link leg's knee and ankle are, given the hip and the two angles.
    SVG's y runs down the page, which is the direction gravity goes, so the
    drawing needs no flip: a hanging leg is θ = 0. */
export function legPoints(hip: Point, q1: number, q2: number) {
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

/** One leg's three strokes as path data: thigh, shank and foot. */
export function legPath(hip: Point, q1: number, q2: number) {
  const { knee, ankle } = legPoints(hip, q1, q2);
  /* The foot is flat while it is on the floor and hangs toe-down once it is
     clear of it, which is what an ankle that is a spring rather than a motor
     does. */
  const lifted = Math.max(0, Math.min(1, (GROUND - ankle.y) / 26));
  const toe = -0.38 * lifted;
  return {
    knee,
    ankle,
    d:
      `M ${hip.x.toFixed(1)} ${hip.y.toFixed(1)} L ${knee.x.toFixed(1)} ${knee.y.toFixed(1)} ` +
      `L ${ankle.x.toFixed(1)} ${ankle.y.toFixed(1)} ` +
      `l ${(FOOT * Math.cos(toe)).toFixed(1)} ${(-FOOT * Math.sin(toe)).toFixed(1)}`,
  };
}

/** How far down a leg reaches, in metres: what holds the hip up. */
const reach = (q1: number, q2: number) =>
  FRAME.l1 * Math.cos(q1) + FRAME.l2 * Math.cos(q1 + q2);

export interface Frame {
  hip: Point;
  swing: ReturnType<typeof legPath>;
  stance: ReturnType<typeof legPath>;
  ghost: ReturnType<typeof legPath>;
  torso: string;
  /** Hip, both knees, both ankles — the drawn joints, in that order. */
  marks: Point[];
  error: number;
}

/**
 * Everything the drawing needs for one instant.
 *
 * `phase` is the cycle position of the leg that is currently in the air, and
 * `q1`, `q2` are where that leg actually is — the simulated one. The other leg
 * is the same trajectory half a cycle away, which is the definition of walking:
 * while one leg is swinging the other is standing, and they trade.
 */
export function frameOf(phase: number, q1: number, q2: number): Frame {
  const ref = reference(phase);
  const other = reference((phase + 0.5) % 1);

  /* The hip hangs from whichever leg reaches further down, which is the one
     standing on the floor. Hold the hip at a fixed height instead and a foot
     goes through the floor twice a step; hang it from the standing leg alone
     and the other one does, in the moment both are down. This is also what a
     walking body does — the hips rise and fall by an inch a step.

     It is measured from the reference, not from the simulated leg, so that a
     controller tracking badly makes a leg late rather than making the whole
     machine bounce. */
  const hip: Point = {
    x: HIP_X,
    y: GROUND - Math.max(reach(ref.q[0], ref.q[1]), reach(other.q[0], other.q[1])) * SCALE - LIFT,
  };

  const swing = legPath(hip, q1, q2);
  const stance = legPath(hip, other.q[0], other.q[1]);
  const ghost = legPath(hip, ref.q[0], ref.q[1]);
  return {
    hip,
    swing,
    stance,
    ghost,
    /* A spine between two bars: the pelvis the legs hang from and the brace
       across the shoulders. Without them the drawing is a stick figure, and
       the thing being controlled is a frame somebody is strapped into. */
    torso:
      `M ${(hip.x - 11).toFixed(1)} ${hip.y.toFixed(1)} L ${(hip.x + 11).toFixed(1)} ${hip.y.toFixed(1)} ` +
      `M ${hip.x} ${hip.y.toFixed(1)} L ${hip.x} ${(hip.y - TORSO).toFixed(1)} ` +
      `M ${(hip.x - 13).toFixed(1)} ${(hip.y - TORSO).toFixed(1)} L ${(hip.x + 13).toFixed(1)} ${(hip.y - TORSO).toFixed(1)}`,
    marks: [hip, swing.knee, stance.knee, swing.ankle, stance.ankle],
    error: Math.hypot(ref.q[0] - q1, ref.q[1] - q2),
  };
}

/** The pose a leg should be in at a phase, as a state with its rates — what a
    swing starts from when the foot leaves the ground. */
export function poseAt(phase: number): Limb {
  const r = reference(phase);
  return [r.q[0], r.q[1], r.dq[0], r.dq[1]];
}
