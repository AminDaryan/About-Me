/* ==========================================================================
   The swing phase of a lower-limb exoskeleton, and two ways to control it.

   The FUME paper models a step as a pair of two-link limbs, one leg supporting
   and one swinging, and writes the swinging one as

        τ = M(θ) θ̈ + V(θ, θ̇)

   with θ = [hip, knee]. M — the inertia — can be written down from the
   machine's drawings. V — the Coriolis and gravity terms, with a person
   strapped into it — cannot: the wearer's mass is not the designer's to know,
   and it changes with every wearer. That gap is the whole problem, and it is
   what the paper's adaptive controller closes.

   This file is the same structure at demonstration scale: the plant is exact
   for the two-link limb it describes, both controllers are real, and the
   adaptive one learns V online from a hyperbolic-tangent basis, which is the
   shape a generalized fuzzy hyperbolic model collapses to. The numbers here
   are this simulation's, not the paper's — the paper's were measured on the
   physical robot.

   Angles are measured from straight down, positive forward, so θ = 0 is a leg
   hanging from the hip. Lengths in metres, masses in kilograms, torques in
   newton-metres.
   ========================================================================== */

/** [hip, knee] — the two actuated joints of one leg. */
export type Joints = [number, number];
/** [hip, knee, hip rate, knee rate] */
export type Limb = [number, number, number, number];

export interface Body {
  /** Thigh: length, mass, centre of mass from the hip, inertia about it. */
  l1: number;
  m1: number;
  c1: number;
  I1: number;
  /** Shank, including the foot and whatever of the wearer is strapped to it. */
  l2: number;
  m2: number;
  c2: number;
  I2: number;
  g: number;
}

/** The bare machine, with a light wearer. Inertias as slender rods. */
export const FRAME: Body = {
  l1: 0.42, m1: 7.5, c1: 0.2, I1: 0.11,
  l2: 0.44, m2: 4.2, c2: 0.21, I2: 0.07,
  g: 9.81,
};

/** A limb the controller was not designed for: a heavier, differently balanced
    wearer strapped into the same frame. This is what "reconfigurable" has to
    survive — the paper's own word for adapting to the person, not the robot. */
export function withWearer(body: Body, extraThigh: number, extraShank: number): Body {
  return {
    ...body,
    m1: body.m1 + extraThigh,
    m2: body.m2 + extraShank,
    // The added mass sits low on each segment, where a strap holds it, so it
    // moves the centre of mass down as well as making the segment heavier.
    c1: (body.c1 * body.m1 + body.l1 * 0.62 * extraThigh) / (body.m1 + extraThigh),
    c2: (body.c2 * body.m2 + body.l2 * 0.55 * extraShank) / (body.m2 + extraShank),
    I1: body.I1 + extraThigh * 0.03,
    I2: body.I2 + extraShank * 0.03,
  };
}

/** M(θ), symmetric, as [M11, M12, M22]. Exported because it is the half of
    the dynamics a designer really does know, and both controllers use it. */
export function inertia(b: Body, knee: number): [number, number, number] {
  const cross = b.m2 * b.l1 * b.c2 * Math.cos(knee);
  return [
    b.I1 + b.m1 * b.c1 * b.c1 + b.I2 + b.m2 * (b.l1 * b.l1 + b.c2 * b.c2) + 2 * cross,
    b.I2 + b.m2 * b.c2 * b.c2 + cross,
    b.I2 + b.m2 * b.c2 * b.c2,
  ];
}

/** V(θ, θ̇) — Coriolis and gravity together, the term the paper calls unknown. */
export function unknownTerm(b: Body, [q1, q2, d1, d2]: Limb): Joints {
  const h = b.m2 * b.l1 * b.c2 * Math.sin(q2);
  const gravityHip =
    b.g * (b.m1 * b.c1 * Math.sin(q1) + b.m2 * (b.l1 * Math.sin(q1) + b.c2 * Math.sin(q1 + q2)));
  const gravityKnee = b.g * b.m2 * b.c2 * Math.sin(q1 + q2);
  return [
    -h * (2 * d1 * d2 + d2 * d2) + gravityHip,
    h * d1 * d1 + gravityKnee,
  ];
}

/** θ̈ from the torques, by inverting the 2×2 inertia matrix directly. */
function accel(b: Body, s: Limb, tau: Joints): Joints {
  const [M11, M12, M22] = inertia(b, s[1]);
  const V = unknownTerm(b, s);
  const r1 = tau[0] - V[0];
  const r2 = tau[1] - V[1];
  const det = M11 * M22 - M12 * M12;
  return [(M22 * r1 - M12 * r2) / det, (M11 * r2 - M12 * r1) / det];
}

/** One Runge–Kutta 4 step of the limb under a torque held across it. */
export function step(b: Body, s: Limb, tau: Joints, dt: number): Limb {
  const f = (x: Limb): Limb => {
    const a = accel(b, x, tau);
    return [x[2], x[3], a[0], a[1]];
  };
  const add = (x: Limb, k: Limb, h: number): Limb =>
    [x[0] + h * k[0], x[1] + h * k[1], x[2] + h * k[2], x[3] + h * k[3]];
  const k1 = f(s);
  const k2 = f(add(s, k1, dt / 2));
  const k3 = f(add(s, k2, dt / 2));
  const k4 = f(add(s, k3, dt));
  return [0, 1, 2, 3].map(
    (i) => s[i] + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]),
  ) as Limb;
}

/* ------------------------------- the gait -------------------------------- */

/** The cycle, in seconds. One step of one leg, then the same for the other. */
export const CYCLE = 4;

/** A point on the trajectory: where to be, how fast, and how hard to
    accelerate — the last of which is what the controller feeds forward. */
export interface Reference {
  q: Joints;
  dq: Joints;
  ddq: Joints;
}

/** Where a leg is in its own cycle: standing for the first half, in the air
    for the second. Two legs are the same curve half a cycle apart, which is
    what walking is. */
export const SWING_FROM = 0.5;

/** A smooth hump, zero at both ends and at its ends' slopes: one flexion. */
const bump = (u: number) => (1 - Math.cos(2 * Math.PI * u)) / 2;

/**
 * Where the hip and the knee should be, at phase `t` of the cycle (0 to 1),
 * and how fast.
 *
 * A walking cycle, not a swing repeated: the leg stands through the first half
 * — hip rotating from ahead of the body to behind it, knee almost straight
 * with the small dip a loaded leg takes just after the heel goes down — and
 * flies through the second, the knee folding to about fifty-five degrees at
 * mid-swing to clear the floor and straightening again before the heel lands.
 * Both legs run this curve, half a cycle apart, so each one stands while the
 * other swings. An earlier version gave the standing leg a tenth of the swing
 * leg's knee and nothing else, which drew a machine walking on one good leg
 * and one stiff one.
 *
 * Shaped rather than measured. The paper drives the robot from a recorded
 * normal gait; what matters here is that the reference is smooth, periodic,
 * and not something either controller is told in advance.
 */
export function reference(t: number): Reference {
  const w = 2 * Math.PI;
  /* +0.35 at the start of stance, where the heel goes down ahead of the body,
     and −0.35 at toe-off half a cycle later. */
  const hipAt = (x: number) => 0.35 * Math.cos(w * x) - 0.02;
  /* Negative, because the shank's angle in the plant is measured as hip + knee
     and a knee only bends one way: a positive value here would draw a leg
     hyperextending forward at every step. */
  const kneeAt = (x: number) => {
    const p = ((x % 1) + 1) % 1;
    return p < SWING_FROM
      ? -0.12 * bump(p / SWING_FROM)
      : -0.95 * bump((p - SWING_FROM) / (1 - SWING_FROM));
  };
  /* Rates in radians per *second*, not per cycle — the controller compares
     them against a measured θ̇ and there is no second place for the cycle time
     to be divided out. Numerically, because the knee is a cosine plus a
     one-sided square and its derivative is not worth writing by hand for a
     curve that is evaluated afresh every step anyway. */
  const h = 1e-3;
  const rate = (f: (x: number) => number) => (f(t + h) - f(t - h)) / (2 * h * CYCLE);
  const accel = (f: (x: number) => number) =>
    (f(t + h) - 2 * f(t) + f(t - h)) / (h * h * CYCLE * CYCLE);
  return {
    q: [hipAt(t), kneeAt(t)],
    dq: [rate(hipAt), rate(kneeAt)],
    ddq: [accel(hipAt), accel(kneeAt)],
  };
}

/* ----------------------------- the controllers ---------------------------- */

export type Law = "pid" | "adaptive";

/**
 * Both controllers have the same shape, and it is the paper's:
 *
 *     τ = M̂(θ) · (θ̈ᵣ + Kd ė + Kp e) + (what each one does about V)
 *
 * The inertia is written down from the machine's drawings, so both may use it;
 * what neither is given is V — the Coriolis and gravity terms, which depend on
 * the person in the frame. Compensating M̂ and leaving V to be discovered is
 * what makes the comparison about the thing the paper is about, and not about
 * which controller happens to have more gain.
 *
 * `M̂` is the bare frame, deliberately: a wearer's mass is not the designer's
 * to know, and the plant this acts on is the frame with somebody in it.
 */
/* Tuned by search, on the plant, until neither law got better: the knee wants
   six times the hip's stiffness because its own inertia is six times smaller,
   and past this the torque is spent for nothing. A baseline nobody tried to
   tune is not a comparison, it is a straw man. */
const KP: Joints = [430, 2600];
const KD: Joints = [41, 92];
/** Integral gain, PID only: its one way of discovering a load it cannot see.
    Wound down hard, because it is chasing a term that reverses twice a cycle
    and an integrator that keeps up with that is an integrator that rings. */
const KI: Joints = [700, 700];
/** The sliding variable's weight: r = ė + Λe, which is what the adaptation
    law watches instead of the error alone. */
const LAMBDA = 14;

/** How many hyperbolic tangents stand in for the unknown term, per joint. */
const BASIS = 7;

export interface Estimate {
  /** φ̂ — one weight per basis function per joint, learned online. */
  weights: number[][];
  /** ∫e dt, PID only. */
  integral: Joints;
}

export const freshEstimate = (): Estimate => ({
  weights: [new Array(BASIS).fill(0), new Array(BASIS).fill(0)],
  integral: [0, 0],
});

/**
 * ψ(θ, θ̇) — the basis the unknown term is approximated in.
 *
 * A generalized fuzzy hyperbolic model's output collapses to A + B·tanh(K u):
 * a sum of hyperbolic tangents over fuzzy sets placed along each input. These
 * are seven of them, spread across the range the joints actually visit, plus a
 * constant. Nothing here is fitted in advance — the weights start at zero and
 * the adaptation law moves them.
 */
function basis([q1, q2, d1, d2]: Limb): number[] {
  return [
    1,
    Math.tanh(1.8 * q1),
    Math.tanh(1.8 * q2),
    Math.tanh(1.8 * (q1 + q2)),
    Math.tanh(0.5 * d1),
    Math.tanh(0.5 * d2),
    Math.tanh(1.2 * q1) * Math.tanh(1.2 * q2),
  ];
}

/* Learning rate, and the leakage that keeps the weights from drifting.
   Fast, and deliberately: a slower rate makes the first few steps visibly
   improve, which is a nice thing to watch and a worse controller — it can
   then only learn an average of a term that swings right through the stroke,
   and it settles at twice the error. The demonstration does not need the
   learning to be slow enough to see. It needs the reader to be able to change
   the wearer and watch which of the two laws cares. */
const GAMMA = 240;
const LEAK = 0.02;

/**
 * The torque to apply now, and the estimate as it stands after this step.
 *
 * The PID knows nothing about the limb and pays for it in lag: gravity on a
 * loaded shank is a torque it can only discover after the error has appeared,
 * and its integrator rediscovers it from scratch twice a cycle, as the sign
 * turns over. The adaptive law learns that torque as a function of where the
 * leg is, so the second step is better than the first and the fifth is better
 * again.
 */
export function torque(
  law: Law,
  s: Limb,
  ref: Reference,
  est: Estimate,
  dt: number,
  nominal: Body = FRAME,
): Joints {
  const e: Joints = [ref.q[0] - s[0], ref.q[1] - s[1]];
  const de: Joints = [ref.dq[0] - s[2], ref.dq[1] - s[3]];

  /* The acceleration being asked for: the trajectory's own, plus whatever it
     takes to close the error that is there. */
  const want: Joints = [
    ref.ddq[0] + KP[0] * e[0] + KD[0] * de[0],
    ref.ddq[1] + KP[1] * e[1] + KD[1] * de[1],
  ];

  if (law === "pid") {
    // Clamped, because an integrator against a trajectory this fast will
    // otherwise wind up and hand back the energy at the worst moment.
    for (const j of [0, 1] as const) {
      est.integral[j] = Math.max(-0.06, Math.min(0.06, est.integral[j] + e[j] * dt));
      want[j] += KI[j] * est.integral[j];
    }
  }

  const [M11, M12, M22] = inertia(nominal, s[1]);
  const out: Joints = [
    M11 * want[0] + M12 * want[1],
    M12 * want[0] + M22 * want[1],
  ];

  if (law === "adaptive") {
    const psi = basis(s);
    for (let j = 0; j < 2; j++) {
      const r = de[j] + LAMBDA * e[j];
      const w = est.weights[j];
      let feed = 0;
      for (let i = 0; i < BASIS; i++) {
        w[i] += dt * GAMMA * (r * psi[i] - LEAK * w[i]);
        feed += w[i] * psi[i];
      }
      out[j] += feed;
    }
  }
  return out;
}

/** Torque the actuators can actually produce, per joint. */
export const TAU_MAX = 180;

export const saturate = (tau: Joints): Joints => [
  Math.max(-TAU_MAX, Math.min(TAU_MAX, tau[0])),
  Math.max(-TAU_MAX, Math.min(TAU_MAX, tau[1])),
];
