/* ==========================================================================
   The arm in Fig. 4, and the job it is doing.

   The project was a pick-and-place: a Franka Emika Panda finds an object put
   down anywhere on its bench, works out where it is, plans a path that misses
   the obstacles it already knows about, and moves it to one fixed place. The
   figure runs that loop; this file is the geometry it runs on, kept free of
   the DOM so the reach can be checked outside a browser.

   Metres and radians throughout. The world has the arm's base at the origin
   and the bench at y = 0, with the arm reaching out over it.
   ========================================================================== */

/* The drawn chain, segment by segment — seven joints, as the Panda has, and
   at the Panda's own proportions: about a third of a metre from the base to
   the shoulder, a third again to the elbow, and a little under four tenths to
   the wrist, for a reach of roughly 85 cm.

   The figure used to be drawn at nearly twice that, which did not matter while
   the arm was only waving. Asked to reach a bench it folded into a hairpin:
   a metre and a half of arm spanning seventy centimetres has nowhere else to
   put itself. */
export const DRAWN = {
  base: 0.33,
  upperA: 0.17,
  upperB: 0.15,
  foreA: 0.2,
  foreB: 0.185,
  wrist: 0.21,
  tool: 0.1,
};

/* What the chain amounts to once the three roll joints are at zero, which for
   this task they are: a roll turns a link about its own axis and moves nothing.
   So the reaching is a planar three-link problem in the vertical plane the base
   happens to be facing, and it has a closed form — no solver, no iteration, no
   pose that fails to converge in front of a reader. */
const SHOULDER_Y = DRAWN.base;
const UPPER = DRAWN.upperA + DRAWN.upperB;
const FORE = DRAWN.foreA + DRAWN.foreB;
/** Wrist joint to the point between the fingers. */
export const TOOL_LENGTH = DRAWN.wrist + DRAWN.tool;

/** The four angles the figure actually drives. The rolls stay at zero. */
export interface Pose {
  yaw: number;
  shoulder: number;
  elbow: number;
  wrist: number;
}

export interface Point3 {
  x: number;
  y: number;
  z: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * The joint angles that put the point between the fingers at `t`, with the
 * gripper pointing straight down — which is how this task grasps, the object
 * being a cuboid lying on a table.
 *
 * Out-of-reach targets are pulled back to the edge of the workspace rather than
 * refused: a figure that freezes because a random position landed two
 * centimetres too far away is worse than one that stretches for it.
 */
export function reach(t: Point3): Pose {
  const yaw = Math.atan2(t.x, t.z);
  const r = Math.hypot(t.x, t.z);

  // The wrist sits one tool-length above the grasp, the gripper being vertical.
  const wristR = r;
  const wristY = t.y + TOOL_LENGTH;

  let dr = wristR;
  let dy = wristY - SHOULDER_Y;
  const d = Math.hypot(dr, dy);
  const far = UPPER + FORE - 0.02;
  const near = Math.abs(UPPER - FORE) + 0.02;
  if (d > far || d < near) {
    const k = clamp(d, near, far) / (d || 1);
    dr *= k;
    dy *= k;
  }
  const reachD = Math.hypot(dr, dy);

  /* Elbow up: the joint rides high and the forearm comes down onto the object,
     which is how a Panda reaches a table and — checked over the whole
     workspace — the only sign that keeps the elbow out of the bench. The other
     branch of the same arccosine puts it 21 cm under the table top. */
  const elbow = Math.acos(
    clamp((reachD * reachD - UPPER * UPPER - FORE * FORE) / (2 * UPPER * FORE), -1, 1),
  );
  const shoulder =
    Math.atan2(dr, dy) - Math.atan2(FORE * Math.sin(elbow), UPPER + FORE * Math.cos(elbow));

  // Whatever is left over to bring the gripper back to vertical.
  const wrist = Math.PI - shoulder - elbow;
  return { yaw, shoulder, elbow, wrist };
}

/** Where the fingers end up for a pose — the check that `reach` is right. */
export function toolPoint(p: Pose): Point3 {
  const a1 = p.shoulder;
  const a2 = p.shoulder + p.elbow;
  const a3 = a2 + p.wrist;
  const r =
    UPPER * Math.sin(a1) + FORE * Math.sin(a2) + TOOL_LENGTH * Math.sin(a3);
  const y =
    SHOULDER_Y + UPPER * Math.cos(a1) + FORE * Math.cos(a2) + TOOL_LENGTH * Math.cos(a3);
  return { x: r * Math.sin(p.yaw), y, z: r * Math.cos(p.yaw) };
}

/* ------------------------------ the workspace ---------------------------- */

/* Where on the bench the object may be put: an arc the arm reaches without
   either stretching or folding back on itself.

   Narrower than the arm could manage, and deliberately. The camera stands off
   to one side, so a carry that runs away from it happens in no visible
   distance at all; keeping the object out beyond the target, in roughly the
   same direction, makes every carry a move across the picture. The shortest
   one is now a fifth of the frame wide, where the widest arc of bench put one
   at nine pixels — a lift and a drop in the same place. */
export const BENCH = { near: 0.57, far: 0.65, from: -0.1, to: 0.45 };
/* The bench itself — one surface, with the arm bolted to it, as the lab had
   it. Bounded rather than an endless floor: a table is a thing with edges, and
   an infinite grid under half a metre of arm reads as neither.

   It runs further toward the camera than the frame does, so its near edge is
   off the bottom of the picture and the surface simply continues past the
   reader. Ending it inside the frame put a hard line across the foreground
   with the object sitting below it, apparently in mid-air. */
export const TABLE = { x0: -0.55, x1: 1.2, z0: -0.2, z1: 0.95, step: 0.142 };
/** Half the cuboid: 6 cm across, because the Panda's fingers open to 8. */
export const OBJECT_HALF = 0.03;
/** Where the object always goes, which the report calls a predefined location.
    It rests on the bench like any other cuboid, so its height is the object's
    own half-width rather than a second number that has to be kept in step. */
export const TARGET: Point3 = { x: 0.075, y: OBJECT_HALF, z: 0.239 };
/* The obstacle the planner is told about. It stands in the middle of the band
   the carry passes through for every position the object can be put down in,
   which is the only place an obstacle is worth drawing.

   It used to stand a hand's width from the target, and at more than twice the
   object's height — near enough and big enough that readers took the obstacle
   for the destination and the destination's mark for a shadow under it. It is
   now shorter than it is far from either end of the carry. */
export const OBSTACLE = { x: 0.109, z: 0.395, w: 0.085, h: 0.18 };
/** How far the dashed square round the object stands off the cuboid it marks:
    close enough to belong to it, wide enough not to touch its corners.

    Three things have to stand clear of one another on a stretch of bench a
    third of a metre long — the square the object starts in, the obstacle, and
    the square it ends in — and at three centimetres they did not. */
export const MARK_HALF = OBJECT_HALF + 0.022;

/** A resting pose over the bench, which is where a scan starts from. */
export const SCAN_FROM: Point3 = { x: 0.04, y: 0.44, z: 0.5 };

/** An object somewhere on the bench, for a figure whose first claim is that it
    could be anywhere. Deterministic per index, so a reload shows the same run. */
export function objectAt(n: number): Point3 {
  const golden = 0.6180339887;
  const u = (n * golden) % 1;
  const v = (n * golden * golden * 3) % 1;
  const a = BENCH.from + u * (BENCH.to - BENCH.from);
  const r = BENCH.near + v * (BENCH.far - BENCH.near);
  return { x: r * Math.sin(a), y: OBJECT_HALF, z: r * Math.cos(a) };
}

/**
 * The path the planner comes back with: up off the bench, over the obstacle,
 * and down onto the target.
 *
 * Drawn before it is followed, because that is the order it happens in — a
 * plan is a thing you have before you move — and because the arc over the
 * obstacle is the only part of a collision-free trajectory anyone can see.
 */
export function planPath(from: Point3, to: Point3): Point3[] {
  const lift = 0.13;
  const overX = (from.x + to.x) / 2;
  const overZ = (from.z + to.z) / 2;
  // High enough over the obstacle to clear it with the object hanging below.
  const clearance = OBSTACLE.h + 0.11;
  const mid = { x: overX, y: clearance, z: overZ };
  const out: Point3[] = [];
  const via = [
    from,
    { x: from.x, y: from.y + lift, z: from.z },
    mid,
    { x: to.x, y: to.y + lift, z: to.z },
    to,
  ];
  /* Sampled into a smooth line rather than left as corners: the arm follows
     exactly this, so a corner in the drawing is a corner in the motion. */
  for (let i = 0; i <= 48; i++) out.push(onPath(via, i / 48));
  return out;
}

/** Catmull–Rom through the waypoints, clamped at both ends. */
function onPath(via: Point3[], u: number): Point3 {
  const n = via.length - 1;
  const s = clamp(u, 0, 1) * n;
  const i = Math.min(Math.floor(s), n - 1);
  const f = s - i;
  const p = (k: number) => via[clamp(k, 0, n)];
  const [p0, p1, p2, p3] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
  const axis = (a: number, b: number, c: number, d: number) =>
    0.5 *
    ((2 * b) +
      (-a + c) * f +
      (2 * a - 5 * b + 4 * c - d) * f * f +
      (-a + 3 * b - 3 * c + d) * f * f * f);
  return {
    x: axis(p0.x, p1.x, p2.x, p3.x),
    y: axis(p0.y, p1.y, p2.y, p3.y),
    z: axis(p0.z, p1.z, p2.z, p3.z),
  };
}

/** A point a fraction of the way along a sampled path. */
export function alongPath(path: Point3[], u: number): Point3 {
  const s = clamp(u, 0, 1) * (path.length - 1);
  const i = Math.min(Math.floor(s), path.length - 2);
  const f = s - i;
  const a = path[i];
  const b = path[i + 1];
  return {
    x: a.x + (b.x - a.x) * f,
    y: a.y + (b.y - a.y) * f,
    z: a.z + (b.z - a.z) * f,
  };
}

/* ------------------------------- the framing ------------------------------ */

/* Fitted rather than guessed. Every joint, the base, the object, the path, the
   obstacle and the two marks were projected for two dozen object positions
   across the whole cycle, and the frame is the smallest one none of them
   leaves. The bench is allowed to run off the sides, as a bench does.

   The camera stands off to one side on purpose, and that is the harder half. A
   camera in the middle of the arm's yaw spends part of every cycle looking
   straight down the plane the arm bends in, where a shoulder and an elbow draw
   as one flat line; from here the closest it comes to that is a full radian.

   What is *not* fixed is the field of view. The run is about as tall as it is
   wide; the figure's box is not, and its shape swings from nearly square on a
   phone to half as tall as it is wide on a desk. A single field of view fitted
   to one of those wastes the other — the old 34° left the run at 45% of the
   width on a desk — so what is recorded here is the angle the run needs across
   and up, as tangents, and the camera works out the rest from the canvas it
   finds itself in. */
export const CAMERA = {
  eye: [1.711, 1.11, 0.42] as const,
  look: [-0.001, 0.294, 0.264] as const,
  halfAcross: 0.2332,
  halfUp: 0.2471,
};

/** The vertical field of view, in degrees, that shows the whole run on a canvas
    of this aspect ratio — the larger of what the height and the width ask for. */
export function fovFor(aspect: number): number {
  const up = Math.max(CAMERA.halfUp, CAMERA.halfAcross / Math.max(aspect, 0.2));
  return (2 * Math.atan(up) * 180) / Math.PI;
}

/* -------------------------------- the loop -------------------------------- */

/* What the robot is doing, in the order the project's own flowchart has it.

   Each line is a sentence rather than the label it used to be. "clear of the
   obstacles it was told about" was set in eleven-point letterspaced capitals
   with no subject, and a reader had to reconstruct both what was clear of them
   and why that was worth saying; the figure now names the stage and finishes
   the thought. Nothing here is new about the project — every clause is in the
   report or the two READMEs — but it is now readable at arm's length. */
export const STAGES = [
  {
    key: "scan",
    name: "Scan",
    detail:
      "The camera rides on the hand, so looking means moving: out over the bench first, then in for a closer look.",
  },
  {
    key: "detect",
    name: "Detect",
    detail:
      "A YOLO detector trained on this cuboid alone, keeping the best box in the frame and nothing else.",
  },
  {
    key: "pose",
    name: "Pose",
    detail:
      "PnP against the cuboid’s CAD model, held to the table top. The frames that disagree are thrown out and the rest averaged.",
  },
  {
    key: "plan",
    name: "Plan",
    detail:
      "MoveIt is asked for a path that touches nothing, and tries four planners in turn until one answers.",
  },
  {
    key: "grasp",
    name: "Grasp",
    detail: "The fingers close on the cuboid to a set width and a set force.",
  },
  {
    key: "carry",
    name: "Carry",
    detail:
      "The arm follows the path it drew, which goes over the obstacle rather than through it.",
  },
  {
    key: "place",
    name: "Place",
    detail:
      "The cuboid goes down in the one place it is ever put, and the hand lifts clear and returns to the scan pose.",
  },
] as const;

export type Stage = (typeof STAGES)[number]["key"];

/* Seconds each stage lasts. The two scans are one stage; the second is the
   closer look the project takes before it trusts a detection.

   Place now carries the journey back to the scan pose as well as the release,
   which is why it is the second-longest stage. Without it the loop ended with
   the hand over the target and began with it over the bench, half a metre
   away, and the arm jumped that gap in a single frame once a cycle. */
export const SECONDS: Record<Stage, number> = {
  scan: 2.6,
  detect: 1.2,
  pose: 1.8,
  plan: 1.5,
  grasp: 1,
  carry: 2.8,
  place: 2.6,
};

export const CYCLE = Object.values(SECONDS).reduce((a, b) => a + b, 0);

/** When each stage begins, in seconds from the top of the cycle — which is what
    a reader who clicks one of the seven words is asking to be taken to. */
export const STAGE_AT: number[] = STAGES.map((_, i) =>
  STAGES.slice(0, i).reduce((t, st) => t + SECONDS[st.key], 0),
);

/* The frame the figure holds on for a reader who has asked for less motion:
   the arm over the obstacle with the cuboid in its fingers, the path drawn and
   the destination lit. It is the one instant that says the whole thing, and it
   is not the top of the cycle — the top of the cycle is the seam, where the
   cuboid of the run just finished has faded out and the next one has not yet
   faded in, and a still of that is an empty bench. */
export const STILL = STAGE_AT[5] + SECONDS.carry * 0.55;

/** Which stage a time in the cycle falls in, and how far through it is. */
export function stageAt(t: number): { stage: Stage; u: number; index: number } {
  let left = ((t % CYCLE) + CYCLE) % CYCLE;
  for (let i = 0; i < STAGES.length; i++) {
    const key = STAGES[i].key;
    if (left < SECONDS[key]) return { stage: key, u: left / SECONDS[key], index: i };
    left -= SECONDS[key];
  }
  return { stage: "place", u: 1, index: STAGES.length - 1 };
}

/** The four planners, tried in turn with growing timeouts when one fails. */
export const PLANNERS = ["RRTConnect", "LBKPIECE", "BiTRRT", "TRRT"];

/* ------------------------------ one instant ------------------------------- */

export interface Shot {
  pose: Pose;
  /** Where the fingers are, and how far apart: 1 open, 0 closed on the cuboid. */
  tool: Point3;
  grip: number;
  /** Where the cuboid is — on the bench, or in the gripper once it is held. */
  object: Point3;
  stage: Stage;
  index: number;
  u: number;
  /** How much of the planned path has been drawn, and how much followed. */
  planDrawn: number;
  travelled: number;
  /** The detection box tightens as the arm takes its second, closer look. */
  boxIn: number;
  /** The pose estimate settling: 1 while the frames are still disagreeing. */
  poseSpread: number;
  /** The accent crossing from where the object is to where it is going: 0 while
      the arm is still working on the object where it lies, 1 once it holds it.
      One thing in the figure is the live one at a time, and this says which. */
  handover: number;
  /** How much of the outline standing in for the placed object is drawn. It
      goes out as the real cuboid lands inside it, there being nothing left for
      it to stand in for — and comes back at the end of the cycle, when the
      cuboid it stood in for is taken away again. */
  goalGhost: number;
  /** The cuboid, and the square it was put down in, fading in at the top of a
      cycle and out at the bottom of it.

      The loop has to start over somewhere, and the object is somewhere else
      when it does: the run that has just finished left it on the target, and
      the next one wants it back out on the bench. Cutting between the two put
      a jump in the figure once every cycle. It is now carried away and a fresh
      one set down, which is also what happened in the lab. */
  appear: number;
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const unit = (t: number) => clamp(t, 0, 1);
const mix = (a: Point3, b: Point3, k: number): Point3 => ({
  x: a.x + (b.x - a.x) * k,
  y: a.y + (b.y - a.y) * k,
  z: a.z + (b.z - a.z) * k,
});

/**
 * Everything the figure draws at a moment in the cycle.
 *
 * Pure, so the whole run can be stepped through outside a browser — which is
 * how the reach was checked over the workspace — and so the first frame the
 * page paints is a finished drawing rather than an arm at the origin.
 */
export function shot(t: number, object: Point3, path: Point3[]): Shot {
  const { stage, u, index } = stageAt(t);
  const over = { x: object.x, y: object.y + 0.19, z: object.z };
  const close = { x: object.x, y: object.y + 0.1, z: object.z };
  const grasp = { x: object.x, y: object.y + 0.005, z: object.z };

  let tool = over;
  let grip = 1;
  let held = false;
  let travelled = 0;
  let planDrawn = 0;
  let boxIn = 0;
  let poseSpread = 1;
  let handover = 0;
  let goalGhost = 1;
  let appear = 1;

  switch (stage) {
    case "scan":
      /* Two looks, as the project takes: one from the scan pose, then a closer
         one, which is what the second half of this stage is. */
      tool = u < 0.55 ? mix(SCAN_FROM, over, ease(u / 0.55)) : mix(over, close, ease((u - 0.55) / 0.45));
      appear = ease(unit(u / 0.16));
      break;
    case "detect":
      tool = close;
      boxIn = ease(Math.min(1, u * 1.6));
      break;
    case "pose":
      tool = close;
      boxIn = 1;
      poseSpread = 1 - ease(Math.min(1, u * 1.15));
      break;
    case "plan":
      tool = close;
      boxIn = 1;
      poseSpread = 0;
      planDrawn = ease(Math.min(1, u * 1.25));
      break;
    case "grasp":
      tool = mix(close, grasp, ease(Math.min(1, u * 1.6)));
      grip = 1 - ease(Math.min(1, Math.max(0, (u - 0.45) / 0.55)));
      planDrawn = 1;
      boxIn = 1;
      poseSpread = 0;
      /* The attention crosses the moment the fingers meet: until then the
         live thing in the figure is the object where it was put down, and
         after it the place it is going. */
      handover = ease(unit((u - 0.55) / 0.45));
      break;
    case "carry":
      travelled = ease(u);
      tool = alongPath(path, travelled);
      grip = 0;
      held = true;
      planDrawn = 1;
      handover = 1;
      break;
    case "place": {
      /* Let go, lift clear, then go back to the scan pose the cycle starts
         from — the return is part of this stage rather than a word of its own,
         because it is the same act finishing and a reader counting steps
         should count seven. The path stays drawn until the arm is off it, so
         the last thing seen is where the object went. */
      grip = ease(Math.min(1, u * 2.4));
      held = u < 0.22;
      travelled = 1;
      handover = 1;
      const above = { x: TARGET.x, y: TARGET.y + 0.17, z: TARGET.z };
      tool = mix(
        mix(TARGET, above, ease(unit((u - 0.18) / 0.3))),
        SCAN_FROM,
        ease(unit((u - 0.52) / 0.48)),
      );
      planDrawn = 1 - ease(unit((u - 0.45) / 0.35));
      /* The outline goes out as the cuboid lands in it, and comes back as the
         cuboid is taken away, so the next cycle starts on a marked target. */
      const landed = ease(unit(u * 3.5));
      appear = 1 - ease(unit((u - 0.84) / 0.16));
      goalGhost = 1 - landed * appear;
      break;
    }
  }

  const pose = reach(tool);
  return {
    pose,
    tool,
    grip,
    object: held ? { x: tool.x, y: tool.y, z: tool.z } : stage === "place" && u >= 0.25 ? TARGET : object,
    stage,
    index,
    u,
    planDrawn,
    travelled,
    boxIn,
    poseSpread,
    handover,
    goalGhost,
    appear,
  };
}
