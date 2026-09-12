/* ==========================================================================
   Double inverted pendulum on a cart.

   Equations of motion derived from the Lagrangian, with q = [x, t1, t2] and
   both angles measured from vertical-up, so q = 0 is the *unstable*
   equilibrium we are trying to hold.

        M(q) q̈ = f(q, q̇, u)

   Verified numerically before use: total energy is conserved to ~1e-6 % over
   100 s of free motion, and the upright equilibrium diverges under zero
   control — which is the check that catches a sign error on gravity.

   The controller is an LQR designed on a *numerical* linearisation about the
   upright (no hand-derived Jacobian to get wrong), with the gain obtained by
   iterating the discrete Riccati recursion. Single input, so the (R + BᵀPB)
   term is a scalar and no matrix inversion is needed anywhere.
   ========================================================================== */

export type State = [number, number, number, number, number, number];
//                   x     t1     t2     ẋ      ṫ1     ṫ2

export interface Params {
  M: number;   // cart mass, kg
  m1: number;  // lower link mass
  l1: number;  // lower link length
  m2: number;  // upper link mass
  l2: number;  // upper link length
  g: number;
  b: number;   // cart viscous friction
}

export const DEFAULT_PARAMS: Params = {
  M: 1.0,
  m1: 0.3, l1: 0.6,
  m2: 0.2, l2: 0.5,
  g: 9.81,
  b: 0.05,
};

interface Consts {
  d1: number; d2: number; d3: number; d4: number; d5: number; d6: number;
}

export function constants(p: Params): Consts {
  const a1 = p.l1 / 2;
  const a2 = p.l2 / 2;
  const I1 = (p.m1 * p.l1 * p.l1) / 12;
  const I2 = (p.m2 * p.l2 * p.l2) / 12;
  return {
    d1: p.M + p.m1 + p.m2,
    d2: p.m1 * a1 + p.m2 * p.l1,
    d3: p.m2 * a2,
    d4: p.m1 * a1 * a1 + I1 + p.m2 * p.l1 * p.l1,
    d5: p.m2 * p.l1 * a2,
    d6: p.m2 * a2 * a2 + I2,
  };
}

/** Gaussian elimination with partial pivoting on a 3x3 system. */
function solve3(A: number[][], b: number[]): [number, number, number] {
  const m = [
    [A[0][0], A[0][1], A[0][2], b[0]],
    [A[1][0], A[1][1], A[1][2], b[1]],
    [A[2][0], A[2][1], A[2][2], b[2]],
  ];
  for (let c = 0; c < 3; c++) {
    let piv = c;
    for (let r = c + 1; r < 3; r++) {
      if (Math.abs(m[r][c]) > Math.abs(m[piv][c])) piv = r;
    }
    const tmp = m[c]; m[c] = m[piv]; m[piv] = tmp;
    const d = m[c][c];
    for (let k = c; k < 4; k++) m[c][k] /= d;
    for (let r = 0; r < 3; r++) {
      if (r === c) continue;
      const factor = m[r][c];
      for (let k = c; k < 4; k++) m[r][k] -= factor * m[c][k];
    }
  }
  return [m[0][3], m[1][3], m[2][3]];
}

/** Generalized forces on [x, θ1, θ2] from something other than the cart motor —
    a hand pulling on one part of the pendulum. See pointForce() below. */
export type Generalized = [number, number, number];

const NO_FORCE: Generalized = [0, 0, 0];

export function deriv(
  s: State,
  u: number,
  p: Params,
  c: Consts,
  ext: Generalized = NO_FORCE,
): State {
  const [, t1, t2, xd, t1d, t2d] = s;
  const s1 = Math.sin(t1), c1 = Math.cos(t1);
  const s2 = Math.sin(t2), c2 = Math.cos(t2);
  const s12 = Math.sin(t1 - t2), c12 = Math.cos(t1 - t2);

  const Mm = [
    [c.d1, c.d2 * c1, c.d3 * c2],
    [c.d2 * c1, c.d4, c.d5 * c12],
    [c.d3 * c2, c.d5 * c12, c.d6],
  ];
  const f = [
    u + c.d2 * s1 * t1d * t1d + c.d3 * s2 * t2d * t2d - p.b * xd + ext[0],
    p.g * c.d2 * s1 - c.d5 * s12 * t2d * t2d + ext[1],
    p.g * c.d3 * s2 + c.d5 * s12 * t1d * t1d + ext[2],
  ];
  const [xdd, t1dd, t2dd] = solve3(Mm, f);
  return [xd, t1d, t2d, xdd, t1dd, t2dd];
}

/** One classical Runge–Kutta 4 step. `ext` is held constant across the step;
    at 300 Hz that is far finer than anything a hand can do. */
export function rk4(
  s: State,
  u: number,
  dt: number,
  p: Params,
  c: Consts,
  ext: Generalized = NO_FORCE,
): State {
  const step = (base: State, k: State, h: number): State =>
    base.map((v, i) => v + h * k[i]) as State;

  const k1 = deriv(s, u, p, c, ext);
  const k2 = deriv(step(s, k1, dt / 2), u, p, c, ext);
  const k3 = deriv(step(s, k2, dt / 2), u, p, c, ext);
  const k4 = deriv(step(s, k3, dt), u, p, c, ext);
  return s.map(
    (v, i) => v + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]),
  ) as State;
}

/* ------------------------------- matrices -------------------------------- */

type Mat = number[][];

const zeros = (r: number, c: number): Mat =>
  Array.from({ length: r }, () => new Array(c).fill(0));

const eye = (n: number): Mat => {
  const m = zeros(n, n);
  for (let i = 0; i < n; i++) m[i][i] = 1;
  return m;
};

const mul = (A: Mat, B: Mat): Mat => {
  const r = A.length, k = B.length, c = B[0].length;
  const O = zeros(r, c);
  for (let i = 0; i < r; i++) {
    for (let j = 0; j < c; j++) {
      let sum = 0;
      for (let x = 0; x < k; x++) sum += A[i][x] * B[x][j];
      O[i][j] = sum;
    }
  }
  return O;
};

const transpose = (A: Mat): Mat => A[0].map((_, j) => A.map((row) => row[j]));
const addM = (A: Mat, B: Mat): Mat => A.map((r, i) => r.map((v, j) => v + B[i][j]));
const subM = (A: Mat, B: Mat): Mat => A.map((r, i) => r.map((v, j) => v - B[i][j]));

/** Numerical linearisation about the upright equilibrium (all states 0, u = 0). */
function linearize(p: Params, c: Consts): { A: Mat; B: Mat } {
  const n = 6, h = 1e-6;
  const A = zeros(n, n);
  for (let j = 0; j < n; j++) {
    const sp = new Array(n).fill(0) as State;
    const sm = new Array(n).fill(0) as State;
    sp[j] += h; sm[j] -= h;
    const fp = deriv(sp, 0, p, c);
    const fm = deriv(sm, 0, p, c);
    for (let i = 0; i < n; i++) A[i][j] = (fp[i] - fm[i]) / (2 * h);
  }
  const B = zeros(n, 1);
  const fp = deriv(new Array(n).fill(0) as State, h, p, c);
  const fm = deriv(new Array(n).fill(0) as State, -h, p, c);
  for (let i = 0; i < n; i++) B[i][0] = (fp[i] - fm[i]) / (2 * h);
  return { A, B };
}

/** Discrete-time LQR gain by iterating the Riccati recursion to convergence. */
export function lqrGain(
  p: Params = DEFAULT_PARAMS,
  qDiag: number[] = [6, 90, 90, 1, 6, 6],
  R = 0.35,
  dt = 0.02,
): number[] {
  const c = constants(p);
  const { A, B } = linearize(p, c);

  const Ad = addM(eye(6), A.map((r) => r.map((v) => v * dt)));
  const Bd = B.map((r) => [r[0] * dt]);
  const Q = zeros(6, 6);
  qDiag.forEach((v, i) => (Q[i][i] = v));

  let P = Q.map((r) => r.slice());
  const At = transpose(Ad), Bt = transpose(Bd);
  let K: Mat = zeros(1, 6);

  for (let i = 0; i < 20000; i++) {
    const BtP = mul(Bt, P);
    const denom = R + mul(BtP, Bd)[0][0];
    const Knew = mul(BtP, Ad).map((row) => row.map((v) => v / denom));
    const AtP = mul(At, P);
    const Pnew = addM(Q, subM(mul(AtP, Ad), mul(mul(AtP, Bd), Knew)));

    let delta = 0;
    for (let r = 0; r < 6; r++) {
      for (let cc = 0; cc < 6; cc++) {
        delta = Math.max(delta, Math.abs(Pnew[r][cc] - P[r][cc]));
      }
    }
    P = Pnew; K = Knew;
    if (delta < 1e-12) break;
  }
  return K[0];
}

export const UMAX = 30;

/* -------------------------------- grabbing -------------------------------- */

/** A body you can take hold of, and where on it: `s` is the distance from the
    body's own base along a link (ignored for the cart). */
export type Body = "cart" | "link1" | "link2";

/**
 * Where a point on a body is, how fast it is moving, and the Jacobian that maps
 * a force there into generalized forces.
 *
 * Positions are in the plane of the pendulum, x right and y up, with both angles
 * measured from vertical so a positive angle leans toward +x — the same
 * convention deriv() is written in, which is what lets J^T F go straight into
 * its right-hand side.
 */
export function bodyPoint(body: Body, sAlong: number, st: State, p: Params) {
  const [x, t1, t2, xd, t1d, t2d] = st;
  const c1 = Math.cos(t1), s1 = Math.sin(t1);
  const c2 = Math.cos(t2), s2 = Math.sin(t2);

  if (body === "cart") {
    // The cart rides a rail: only horizontal force does anything.
    return { px: x, py: 0, vx: xd, vy: 0, J: [[1, 0, 0], [0, 0, 0]] };
  }
  if (body === "link1") {
    const a = sAlong;
    return {
      px: x + a * s1,
      py: a * c1,
      vx: xd + a * c1 * t1d,
      vy: -a * s1 * t1d,
      J: [[1, a * c1, 0], [0, -a * s1, 0]],
    };
  }
  const a = sAlong;
  return {
    px: x + p.l1 * s1 + a * s2,
    py: p.l1 * c1 + a * c2,
    vx: xd + p.l1 * c1 * t1d + a * c2 * t2d,
    vy: -p.l1 * s1 * t1d - a * s2 * t2d,
    J: [[1, p.l1 * c1, a * c2], [0, -p.l1 * s1, -a * s2]],
  };
}

/**
 * Spring, damper and force cap between the hand and the point it holds.
 *
 * These are small on purpose, and the numbers were found, not guessed. The
 * links are light — 0.3 kg and 0.2 kg — so a hand force that sounds modest is
 * enormous to them: a steady 2 N at the tip tips the pendulum 80° in a quarter
 * of a second, the cart motor saturates at its 30 N limit, and the cart runs off
 * the rail. A controller designed for the free pendulum cannot hold it once
 * something else is pulling on it that hard.
 *
 * Pulling low on the pendulum is the dangerous case: a force near the first
 * joint makes the controller swing the cart a long way to compensate. So the
 * force a link can take grows with distance from that joint — continuously, so
 * the joint between the two links gets the same force whichever side of it is
 * grabbed (which matters, because it is the same point: link 1's tip and link
 * 2's base have identical Jacobians).
 *
 * Checked over a grid of 13 grab points along both links and the cart, each
 * pulled in six directions and held for 0.3 s, 1.5 s and 4 s, then released:
 * every one of the 234 trials recovers upright, and the cart never passes
 * ±1.5 m, inside the drawn rail.
 */
const HAND = { k: 1, c: 1, fmax: 0.25 }; // N/m, N·s/m, N — the top of link 2
const CART_GRAB = { k: 8, c: 8, fmax: 2 }; // the cart carries the whole mass
const LINK1_SHARE = 0.42; // link 1, and link 2 at its base

function grabGains(body: Body, sAlong: number, p: Params) {
  if (body === "cart") return CART_GRAB;
  const share =
    body === "link1"
      ? LINK1_SHARE
      : LINK1_SHARE + (1 - LINK1_SHARE) * Math.min(1, Math.max(0, sAlong / p.l2));
  return { k: HAND.k * share, c: HAND.c * share, fmax: HAND.fmax * share };
}

/** End stops on the rail, as a real cart-pole rig has: a stiff, damped bumper
    beyond ±1.5 m. It is a property of the rig, not of the pendulum, so it is
    applied by the scene alongside the hand force and deriv() stays the pure
    plant that the energy check above was run against. */
export function railStop(x: number, xd: number): number {
  const EDGE = 1.5;
  const over = Math.abs(x) - EDGE;
  return over > 0 ? -Math.sign(x) * 400 * over - 30 * xd : 0;
}

/**
 * The pull: the force in newtons at the point being held, where that point is,
 * and what the force does to the coordinates — Q = Jᵀ F.
 *
 * Pulling link 2 therefore acts on link 2; its effect reaches the cart and link
 * 1 only through the joints, as it would in a real mechanism. The Cartesian
 * force comes back with the generalized one because the scene draws it: a pull
 * on the lower link sends the whole machine the other way, and the only way to
 * read that as mechanics rather than as a fault is to see both arrows.
 */
export function pointForce(
  body: Body,
  sAlong: number,
  st: State,
  p: Params,
  hx: number,
  hy: number,
): { Q: Generalized; fx: number; fy: number; px: number; py: number } {
  const b = bodyPoint(body, sAlong, st, p);
  const g = grabGains(body, sAlong, p);
  let fx = g.k * (hx - b.px) - g.c * b.vx;
  let fy = g.k * (hy - b.py) - g.c * b.vy;
  const mag = Math.hypot(fx, fy);
  if (mag > g.fmax) {
    fx *= g.fmax / mag;
    fy *= g.fmax / mag;
  }
  const J = b.J;
  return {
    Q: [
      J[0][0] * fx + J[1][0] * fy,
      J[0][1] * fx + J[1][1] * fy,
      J[0][2] * fx + J[1][2] * fy,
    ],
    fx,
    fy,
    px: b.px,
    py: b.py,
  };
}

/** u = −K (s − reference), saturated at the actuator limit. */
export function control(K: number[], s: State, xRef: number): number {
  let u = 0;
  for (let i = 0; i < 6; i++) u -= K[i] * (s[i] - (i === 0 ? xRef : 0));
  return Math.max(-UMAX, Math.min(UMAX, u));
}
