"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import type { Line2, LineMaterial, LineSegments2 } from "three-stdlib";
import useMedia from "@/components/useMedia";
import { ACCENT, INK, RULE, SOFT } from "./palette";
import {
  CAMERA,
  CYCLE,
  DRAWN,
  MARK_HALF,
  OBJECT_HALF,
  OBSTACLE,
  PLANNERS,
  STAGES,
  STAGE_AT,
  STILL,
  TABLE,
  TARGET,
  fovFor,
  objectAt,
  planPath,
  shot,
  type Shot,
} from "@/lib/arm";

/* Fig. 4 — the pick-and-place, running.

   The project was not an arm waving: a Franka Emika Panda found an object put
   down anywhere on its bench, worked out where it was, planned a path that
   missed the obstacles it had been told about, and moved it to one fixed
   place. The figure used to show seven joints going through sinusoids, which
   said nothing about any of that. It now runs the loop — scan, detect, pose,
   plan, grasp, carry, place — with the stage named underneath as it happens.

   The arm reaches by closed-form inverse kinematics (see lib/arm.ts): the
   three roll joints do nothing for this task, so what is left is a planar
   three-link problem with an exact answer. The gripper goes where the
   perception put the object, rather than the object being put wherever the
   arm's joint angles happened to land, which is the difference between a
   figure about a task and a figure about an arm.

   Everything is Line and meshBasicMaterial, so the scene has no lights at all
   — nothing is shaded, nothing is glossy, and it reads as a technical figure
   rather than a rendering. */

/** The bench, and the cuboid on it. */
const CUBE = OBJECT_HALF * 2;

type Vec3 = [number, number, number];
type Wire = Line2 | LineSegments2;

/* Three things in this figure are box-shaped and none of them means the same
   as the others, so each is drawn in its own hand and the reader never has to
   be told which is which:

     the cuboid       solid, full ink, the heaviest line on the bench
     where it goes    dashed and light — an outline waiting to be filled
     the obstacle     solid and hatched, the mark a section drawing uses for
                      material you cannot pass through

   Before this they were two plain wireframes a few centimetres apart, and the
   obstacle — the larger of them, and the nearer to the target's mark — read as
   the destination. */

/** The twelve edges of a box, as segment pairs, its centre `cy` above the
    origin. Metres. */
function boxEdges(w: number, h: number, d: number, cy = 0): Vec3[] {
  const [a, b, c] = [w / 2, h / 2, d / 2];
  const v: Vec3[] = [
    [-a, cy - b, -c], [a, cy - b, -c], [a, cy - b, c], [-a, cy - b, c],
    [-a, cy + b, -c], [a, cy + b, -c], [a, cy + b, c], [-a, cy + b, c],
  ];
  const pairs = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];
  return pairs.flatMap(([i, j]) => [v[i], v[j]]);
}

/** A square lying flat on the bench, as four segments. Metres. */
function benchSquare(half: number, y: number): Vec3[] {
  const c: Vec3[] = [
    [-half, y, -half], [half, y, -half], [half, y, half], [-half, y, half],
  ];
  return c.flatMap((p, i) => [p, c[(i + 1) % 4]]);
}

/**
 * Diagonal hatch across a rectangle 2·`halfU` by 2·`halfV`, clipped to it, as
 * pairs of points in the rectangle's own two axes. `step` is the spacing of the
 * intercepts, not of the lines, so the lines come out a little closer together
 * than the number reads — which is what a hatch wants.
 */
function hatch(halfU: number, halfV: number, step: number): [number, number][] {
  const out: [number, number][] = [];
  for (let c = -halfU - halfV + step; c < halfU + halfV; c += step) {
    // The line v = u − c, clipped to the rectangle at both ends.
    const uA = Math.max(-halfU, c - halfV);
    const uB = Math.min(halfU, c + halfV);
    if (uB - uA < 1e-6) continue;
    out.push([uA, uA - c], [uB, uB - c]);
  }
  return out;
}

/* The obstacle, hatched on the face that looks at the camera — the camera
   stands well out along +x, so that face is the only one seen square on. */
const OBSTACLE_WIRE: Vec3[] = [
  ...boxEdges(OBSTACLE.w, OBSTACLE.h, OBSTACLE.w, OBSTACLE.h / 2),
  ...hatch(OBSTACLE.w / 2, OBSTACLE.h / 2, 0.038).map(
    ([z, y]) => [OBSTACLE.w / 2, y + OBSTACLE.h / 2, z] as Vec3,
  ),
];

/* The hand. It is a plate with two fingers hanging off it, which is what a
   Panda's is, and it is drawn because without it the two fingers stood in the
   air beside the wrist attached to nothing.

   The fingers also used to close to 1.8 cm on a 6 cm cuboid — straight through
   the thing they were supposed to be holding. They now shut on its faces. */
/* The plate's top edge is the wrist's last point, not a centimetre below it:
   a gap there is the gap that made the fingers look unattached. */
const HAND_TOP = 0;
const HAND_BOTTOM = 0.036;
const HAND_HALF = 0.052;
/** Where a finger sits: against the cuboid's face when shut, a hand's width
    apart when open. */
const FINGER_SHUT = OBJECT_HALF + 0.004;
const FINGER_OPEN = FINGER_SHUT + 0.012;

/** The cuboid itself. */
const OBJECT_WIRE: Vec3[] = boxEdges(CUBE, CUBE, CUBE);

/** Where the object was put down: a square round it, wherever that turns out
    to be. It is the only mark in the figure that is not in the same place
    twice, which is the whole of what the perception half was for. */
const START_WIRE: Vec3[] = benchSquare(MARK_HALF, 0.002);

/* Where the object is going: the square it lands in, and an outline of the
   cuboid standing in the space it will fill. */
const GOAL_WIRE: Vec3[] = [
  ...benchSquare(MARK_HALF, 0.002),
  ...boxEdges(CUBE, CUBE, CUBE, OBJECT_HALF),
];

/* The destination changes colour rather than appearing, so the reader watches
   one thing become live instead of hunting for what moved. Kept at module
   scope: a colour allocated per frame is a colour collected per frame.

   Nothing is drawn under 3:1 against the paper, which is where a mark stops
   being a mark. That is why the quiet state of the destination is the soft ink
   at seven tenths rather than a hairline at a half, and why the square the
   object started in goes out altogether once it is empty: a ghost of it at the
   rule colour was 1.3:1, which is a line nobody can see. Where it came from is
   still said — the planned path is drawn from it and stays drawn. */
const LIVE = new THREE.Color(ACCENT);
const INK_DARK = new THREE.Color(INK);
const QUIET = new THREE.Color(SOFT);
const brush = new THREE.Color();
const blend = (a: THREE.Color, b: THREE.Color, k: number) => brush.lerpColors(a, b, k);

/** Paint one wire, and take it out of the drawing when it has nothing left. */
function paint(wire: Wire | null, colour: THREE.Color, opacity: number) {
  if (!wire) return;
  wire.visible = opacity > 0.01;
  if (!wire.visible) return;
  const material = wire.material as LineMaterial;
  material.color.copy(colour);
  material.opacity = opacity;
}

/** The bench: a bounded grid with a rule round its edge, so it reads as the
    table the arm is bolted to rather than as a floor going on for ever. */
function Bench() {
  const lines = useMemo(() => {
    const out: [number, number, number][][] = [];
    const { x0, x1, z0, z1, step } = TABLE;
    for (let x = x0; x <= x1 + 1e-6; x += step) out.push([[x, 0, z0], [x, 0, z1]]);
    for (let z = z0; z <= z1 + 1e-6; z += step) out.push([[x0, 0, z], [x1, 0, z]]);
    return out;
  }, []);

  return (
    <group>
      {lines.map((pts, i) => (
        <Line key={i} points={pts} color={RULE} lineWidth={1} transparent opacity={0.55} />
      ))}
      <Line
        points={[
          [TABLE.x0, 0, TABLE.z0], [TABLE.x1, 0, TABLE.z0],
          [TABLE.x1, 0, TABLE.z1], [TABLE.x0, 0, TABLE.z1], [TABLE.x0, 0, TABLE.z0],
        ]}
        color={RULE}
        lineWidth={1.5}
      />
    </group>
  );
}

/** The detection, drawn the way a detector's output is drawn: a box with its
    corners marked, facing the camera because that is the frame it lives in. */
function Detection({ group }: { group: RefObject<THREE.Group | null> }) {
  const { camera } = useThree();
  useFrame(() => {
    if (group.current) group.current.quaternion.copy(camera.quaternion);
  });
  /* Sized on the cuboid it is drawn round — a little wider than the 6 cm box's
     own diagonal, and no wider. It used to be drawn at 23 cm, four times the
     thing it was detecting, which read as a frame round the scene. */
  const s = 0.052;
  const tick = 0.02;
  const corners: [number, number][] = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  return (
    <group ref={group}>
      {corners.map(([cx, cy], i) => (
        <group key={i}>
          <Line
            points={[
              [cx * s, cy * s, 0],
              [cx * (s - tick), cy * s, 0],
            ]}
            color={ACCENT}
            lineWidth={1.5}
          />
          <Line
            points={[
              [cx * s, cy * s, 0],
              [cx * s, cy * (s - tick), 0],
            ]}
            color={ACCENT}
            lineWidth={1.5}
          />
        </group>
      ))}
    </group>
  );
}

/** The pose the project's script reprojects into the frame: three short axes
    at the object, once the estimates have been reduced to one. */
function Axes() {
  const L = 0.1;
  return (
    <group>
      <Line points={[[0, 0, 0], [L, 0, 0]]} color={ACCENT} lineWidth={1.4} />
      <Line points={[[0, 0, 0], [0, L, 0]]} color={ACCENT} lineWidth={1.4} />
      <Line points={[[0, 0, 0], [0, 0, L]]} color={ACCENT} lineWidth={1.4} />
    </group>
  );
}

/** How many per-frame estimates are drawn scattering and then agreeing. */
const CANDIDATES = 7;

/* The frame, fitted to the run rather than to the box the figure sits in. The
   canvas is nearly square on a phone and half as tall as it is wide on a desk,
   and one field of view cannot serve both — see the note on CAMERA.

   Done on the frame the canvas first reports its size on, and again on any
   frame where that size has changed shape, because a lens refitted only at
   startup is a lens that is wrong the moment the window is dragged wider. */
function Framing() {
  const fitted = useRef(0);
  useFrame(({ camera, size }) => {
    const aspect = size.width / size.height;
    if (aspect === fitted.current) return;
    fitted.current = aspect;
    const lens = camera as THREE.PerspectiveCamera;
    lens.fov = fovFor(aspect);
    lens.lookAt(...CAMERA.look);
    lens.updateProjectionMatrix();
  });
  return null;
}

interface SceneProps {
  index: number;
  running: boolean;
  /** Where on the cycle the figure opens, which is not the same for a reader
      who has asked for less motion — see STILL. */
  start: number;
  onStage: (s: Shot) => void;
  onCycle: () => void;
  /** Where on the cycle a reader has asked to be taken, from the row of seven
      words under the figure. Wrapped in an object so that asking for the same
      step twice is still a new request. */
  seekTo: { at: number } | null;
}

function Scene({ index, running, start, onStage, onCycle, seekTo }: SceneProps) {
  const object = useMemo(() => objectAt(index), [index]);
  const path = useMemo(() => planPath(object, TARGET), [object]);
  /* The plan's geometry is built at the path's full length and stays there;
     only the values in it change. A line drawn with fewer points than it was
     built with draws nothing extra — see the note where it is rewritten. */
  const planPoints = useMemo(
    () => path.map((p) => [p.x, p.y, p.z] as [number, number, number]),
    [path],
  );

  const clock = useRef(start);
  const j1 = useRef<THREE.Group>(null);
  const j2 = useRef<THREE.Group>(null);
  const j4 = useRef<THREE.Group>(null);
  const j6 = useRef<THREE.Group>(null);
  const fingerL = useRef<THREE.Group>(null);
  const fingerR = useRef<THREE.Group>(null);
  const cube = useRef<THREE.Group>(null);
  const cubeWire = useRef<Wire>(null);
  const detection = useRef<THREE.Group>(null);
  const axes = useRef<THREE.Group>(null);
  const plan = useRef<Line2>(null);
  const startMark = useRef<Wire>(null);
  const goalMark = useRef<Wire>(null);
  const candidates = useRef<(THREE.Mesh | null)[]>([]);
  const lastStage = useRef(-1);
  const cycles = useRef(0);
  const shown = useRef(index);
  const planShown = useRef(-1);
  const sought = useRef(seekTo);

  /* The candidates scatter deterministically, so the same run looks the same
     twice — and two of them are far enough out to be the ones thrown away. */
  const scatter = useMemo(
    () =>
      Array.from({ length: CANDIDATES }, (_, i) => {
        const a = i * 2.399;
        const far = i % 4 === 1 ? 2.6 : 1;
        return { x: Math.cos(a) * 0.075 * far, z: Math.sin(a) * 0.075 * far, out: far > 1 };
      }),
    [],
  );

  const apply = (s: Shot) => {
    if (j1.current) j1.current.rotation.y = s.pose.yaw;
    if (j2.current) j2.current.rotation.x = s.pose.shoulder;
    if (j4.current) j4.current.rotation.x = s.pose.elbow;
    if (j6.current) j6.current.rotation.x = s.pose.wrist;

    const open = FINGER_SHUT + s.grip * (FINGER_OPEN - FINGER_SHUT);
    if (fingerL.current) fingerL.current.position.x = -open;
    if (fingerR.current) fingerR.current.position.x = open;

    if (cube.current) cube.current.position.set(s.object.x, s.object.y, s.object.z);
    paint(cubeWire.current, INK_DARK, s.appear);

    /* The accent belongs to one thing at a time. It sits on the square the
       object was put down in while the perception works on it, and crosses to
       the square it is going to as the fingers close. */
    paint(startMark.current, LIVE, (1 - s.handover) * s.appear);
    paint(
      goalMark.current,
      blend(QUIET, LIVE, s.handover),
      s.goalGhost * (0.72 + 0.28 * s.handover),
    );

    const showBox = s.boxIn > 0;
    if (detection.current) {
      detection.current.visible = showBox;
      detection.current.position.set(s.object.x, s.object.y + 0.02, s.object.z);
      // The box tightens onto the object as the arm takes its closer look.
      detection.current.scale.setScalar(1.9 - 0.9 * s.boxIn);
    }
    if (axes.current) {
      axes.current.visible = s.poseSpread < 1;
      axes.current.position.set(s.object.x, s.object.y, s.object.z);
    }
    candidates.current.forEach((m, i) => {
      if (!m) return;
      const sc = scatter[i];
      const showCandidates = s.stage === "pose";
      // The outliers go first, then the rest close on the average.
      const alive = showCandidates && (!sc.out || s.poseSpread > 0.45);
      m.visible = alive;
      if (alive) {
        m.position.set(
          s.object.x + sc.x * s.poseSpread,
          s.object.y + 0.001,
          s.object.z + sc.z * s.poseSpread,
        );
      }
    });

    /* The plan draws itself in, and it does so by moving the points it already
       has rather than by adding more: the tail of the line is parked on the
       last point drawn, where it takes up no length.

       This is not a flourish. WebGL draws these lines as instanced segments,
       and the renderer counts the instances the first time it sees a geometry
       and never counts again. The line used to be born as a two-point stub and
       given its real points afterwards, so the count it kept was one — one
       segment, a millimetre long, which is why the path has never appeared in
       this figure. Built at full length, the count is right from the start. */
    if (plan.current) {
      const drawn = Math.max(2, Math.round(s.planDrawn * path.length));
      plan.current.visible = s.planDrawn > 0.01;
      if (plan.current.visible && drawn !== planShown.current) {
        planShown.current = drawn;
        const tip = path[drawn - 1];
        const xyz = new Float32Array(path.length * 3);
        for (let i = 0; i < path.length; i++) {
          const p = i < drawn ? path[i] : tip;
          xyz[i * 3] = p.x;
          xyz[i * 3 + 1] = p.y;
          xyz[i * 3 + 2] = p.z;
        }
        plan.current.geometry.setPositions(xyz);
        // The dashes are spaced along the line's measured length, so it has to
        // be measured again whenever the points move.
        plan.current.computeLineDistances();
      }
    }

    if (s.index !== lastStage.current) {
      lastStage.current = s.index;
      onStage(s);
    }
  };

  useFrame((_, delta) => {
    /* A new object means a new run from the top, whether the reader asked for
       it or the cycle came round. Pressing the button mid-carry used to
       teleport the cuboid out of the closed gripper. */
    if (shown.current !== index) {
      shown.current = index;
      clock.current = running ? 0 : start;
      cycles.current = 0;
      lastStage.current = -1;
      planShown.current = -1;
    }
    if (sought.current !== seekTo) {
      sought.current = seekTo;
      if (seekTo) {
        clock.current = seekTo.at;
        lastStage.current = -1;
        planShown.current = -1;
      }
    }
    if (running) clock.current += Math.min(delta, 0.05);
    const turn = Math.floor(clock.current / CYCLE);
    if (turn !== cycles.current) {
      cycles.current = turn;
      onCycle();
    }
    apply(shot(clock.current, object, path));
  });

  const first = shot(start, object, path);

  return (
    <group>
      {/* the bench, the obstacle the planner knows about, and the two places
          on it that matter: where the object was put down and where it goes */}
      <Bench />
      <group position={[OBSTACLE.x, 0, OBSTACLE.z]}>
        {/* The planner is told about this one. Drawn in the soft ink rather
            than in rule weight: an obstacle you cannot see makes the arc over
            it look like a flourish. */}
        <Line points={OBSTACLE_WIRE} segments color={SOFT} lineWidth={1.4} />
      </group>
      <Line
        ref={startMark}
        position={[object.x, 0, object.z]}
        points={START_WIRE}
        segments
        color={ACCENT}
        lineWidth={1.7}
        dashed
        dashSize={0.026}
        gapSize={0.02}
        transparent
      />
      <Line
        ref={goalMark}
        position={[TARGET.x, 0, TARGET.z]}
        points={GOAL_WIRE}
        segments
        color={SOFT}
        lineWidth={1.6}
        dashed
        dashSize={0.02}
        gapSize={0.016}
        transparent
      />

      {/* the object, and what the perception makes of it */}
      <group ref={cube} position={[first.object.x, first.object.y, first.object.z]}>
        <Line ref={cubeWire} points={OBJECT_WIRE} segments color={INK} lineWidth={2.2} transparent />
      </group>
      <Detection group={detection} />
      <group ref={axes}>
        <Axes />
      </group>
      {scatter.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            candidates.current[i] = el;
          }}
          rotation={[-Math.PI / 2, 0, 0]}
          visible={false}
        >
          <ringGeometry args={[0.008, 0.013, 12]} />
          {/* Three quarters, not a half: at a half these rings came out at
              2.1:1 against the paper, which is not a mark. */}
          <meshBasicMaterial color={ACCENT} side={THREE.DoubleSide} transparent opacity={0.75} />
        </mesh>
      ))}

      {/* The plan, drawn before it is followed, at the path's full length from
          the first frame.

          It carries no `visible` prop, and must not: every prop this component
          does not recognise is set on the line *and* on its material, so the
          `visible={false}` that used to stand here switched the material off
          for good and no amount of setting the line visible brought it back.
          Taking the line out of the drawing is `plan.current.visible` in the
          frame loop, which reaches the object alone. */}
      <Line
        ref={plan}
        points={planPoints}
        color={ACCENT}
        lineWidth={1.5}
        dashed
        dashSize={0.04}
        gapSize={0.03}
      />

      {/* the arm, standing on the plate it is bolted to. The plate is drawn as
          a hairline rather than the solid band it was: at full ink it was the
          heaviest mark in the figure, and the eye went to the thing that never
          moves instead of to the bench, where the work happens. */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.158, 0.166, 48]} />
        <meshBasicMaterial color={SOFT} side={THREE.DoubleSide} />
      </mesh>

      <group ref={j1} rotation={[0, first.pose.yaw, 0]}>
        <Segment length={DRAWN.base} />
        <group ref={j2} position={[0, DRAWN.base, 0]} rotation={[first.pose.shoulder, 0, 0]}>
          <Knuckle axis="pitch" />
          <Segment length={DRAWN.upperA} />
          <group position={[0, DRAWN.upperA, 0]}>
            <Knuckle axis="roll" r={0.046} />
            <Segment length={DRAWN.upperB} />
            <group ref={j4} position={[0, DRAWN.upperB, 0]} rotation={[first.pose.elbow, 0, 0]}>
              <Knuckle axis="pitch" r={0.05} />
              <Segment length={DRAWN.foreA} />
              <group position={[0, DRAWN.foreA, 0]}>
                <Knuckle axis="roll" r={0.04} />
                <Segment length={DRAWN.foreB} />
                <group ref={j6} position={[0, DRAWN.foreB, 0]} rotation={[first.pose.wrist, 0, 0]}>
                  <Knuckle axis="pitch" r={0.038} />
                  <Segment length={DRAWN.wrist} width={1.2} />
                  <group position={[0, DRAWN.wrist, 0]}>
                    <Knuckle axis="roll" r={0.034} />
                    {/* The parallel gripper: a hand, and two fingers that
                        really close. The hand is the rail they slide on —
                        without it the two fingers hung in the air beside the
                        wrist, joined to the arm by nothing at all. */}
                    <Hand />
                    <group ref={fingerL} position={[-FINGER_OPEN, 0, 0]}>
                      <Finger />
                    </group>
                    <group ref={fingerR} position={[FINGER_OPEN, 0, 0]}>
                      <Finger />
                    </group>
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

/** A link, drawn from the joint origin along its local +Y. */
function Segment({ length, width = 1.6 }: { length: number; width?: number }) {
  return (
    <Line
      points={[
        [0, 0, 0],
        [0, length, 0],
      ]}
      color={INK}
      lineWidth={width}
    />
  );
}

/** A joint, drawn as a ring in the plane it rotates in. */
function Knuckle({ r = 0.055, axis }: { r?: number; axis: "pitch" | "roll" }) {
  return (
    <mesh rotation={axis === "pitch" ? [0, Math.PI / 2, 0] : [Math.PI / 2, 0, 0]}>
      <ringGeometry args={[r * 0.62, r, 28]} />
      <meshBasicMaterial color={INK} side={THREE.DoubleSide} />
    </mesh>
  );
}

/** The plate the fingers hang from, drawn as its four edges. */
function Hand() {
  return (
    <Line
      points={[
        [-HAND_HALF, HAND_TOP, 0], [HAND_HALF, HAND_TOP, 0],
        [HAND_HALF, HAND_TOP, 0], [HAND_HALF, HAND_BOTTOM, 0],
        [HAND_HALF, HAND_BOTTOM, 0], [-HAND_HALF, HAND_BOTTOM, 0],
        [-HAND_HALF, HAND_BOTTOM, 0], [-HAND_HALF, HAND_TOP, 0],
      ]}
      segments
      color={INK}
      lineWidth={1.8}
    />
  );
}

/** One finger of the parallel gripper, hanging off the plate. */
function Finger() {
  return (
    <Line
      points={[
        [0, HAND_BOTTOM, 0],
        [0, DRAWN.tool, 0],
      ]}
      color={INK}
      lineWidth={1.7}
    />
  );
}

export default function ArmScene() {
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const reduced = useMedia("(prefers-reduced-motion: reduce)", false);
  const running = started || !reduced;

  /* The pipeline under the figure is real text — it is the only account of the
     loop a reader who cannot see the canvas gets — but it changes seven times a
     cycle, which is no reason to re-render React. The scene says when the stage
     turns over and these refs do the rest.

     Two things can be under discussion at once: the stage that is running, and
     the stage a reader is pointing at. They are kept apart on purpose. The row
     of words always shows what is running; the sentence below shows whatever
     is being pointed at, and says so by changing how it is set. */
  const words = useRef<(HTMLButtonElement | null)[]>([]);
  const said = useRef<HTMLParagraphElement>(null);
  const now = useRef<HTMLSpanElement>(null);
  const detail = useRef<HTMLSpanElement>(null);
  const planner = useRef(0);
  const live = useRef(0);
  const peek = useRef<number | null>(null);
  const [seekTo, setSeekTo] = useState<{ at: number } | null>(null);

  const write = (i: number, isLive: boolean) => {
    if (now.current) now.current.textContent = STAGES[i].name;
    if (detail.current) {
      const text = STAGES[i].detail;
      /* The planner named is not always the first one. The project tried four
         in turn with growing timeouts when a plan did not come back, and that
         loop is the most honest thing in its flowchart. It is named only while
         the plan is actually being made: there is no planner of the moment to
         report about a step nobody is taking. */
      detail.current.textContent =
        isLive && STAGES[i].key === "plan"
          ? `${text} ${PLANNERS[planner.current]}, this time.`
          : text;
    }
    said.current?.toggleAttribute("data-peek", !isLive);
  };

  const onStage = (s: Shot) => {
    live.current = s.index;
    words.current.forEach((b, i) => {
      b?.toggleAttribute("data-now", i === s.index);
      if (i === s.index) b?.setAttribute("aria-current", "step");
      else b?.removeAttribute("aria-current");
    });
    if (s.stage === "plan") planner.current = (planner.current + 1) % PLANNERS.length;
    if (peek.current === null) write(s.index, true);
  };

  /** Point at a step to read about it; point at nothing to go back to the one
      that is running. */
  const show = (i: number | null) => {
    peek.current = i;
    words.current.forEach((b, k) => b?.toggleAttribute("data-peek", i === k));
    write(i ?? live.current, i === null);
  };

  return (
    <div>
      {/* Four to three on a phone, because the run is about as tall as it is
          wide and a band across a narrow column left two thirds of the canvas
          empty. Two to one from there up, inside the frame every drawing is
          held to — the shape the canvas already had on a desk, so the lens
          fits the run exactly as it did, only smaller. */}
      <div className="plate-drawing aspect-[4/3] sm:aspect-[2/1]">
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          camera={{ position: [...CAMERA.eye] }}
          style={{ background: "transparent" }}
        >
          <Framing />
          <Scene
            index={index}
            running={running}
            start={running ? 0 : STILL}
            onStage={onStage}
            onCycle={() => setIndex((n) => n + 1)}
            seekTo={seekTo}
          />
        </Canvas>
      </div>

      {/* The seven words carry the loop, and each is a control: point at one to
          read what that step does, press it to watch that step. Each carries
          its own sentence for a reader with no canvas, and for one with no
          JavaScript, who sees only the first of the seven below. */}
      <div className="plate-foot">
      <ol className="choices pipeline" aria-label="The loop this figure runs">
        {STAGES.map((st, i) => (
          <li key={st.key}>
            <button
              type="button"
              className="choice"
              ref={(el) => {
                words.current[i] = el;
              }}
              data-now={i === 0 ? "" : undefined}
              aria-current={i === 0 ? "step" : undefined}
              /* Only a mouse peeks; see the same buttons in Explain.tsx
                 for what a tap on an iPhone did otherwise. */
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") show(i);
              }}
              onPointerLeave={(e) => {
                if (e.pointerType === "mouse") show(null);
              }}
              onFocus={() => show(i)}
              onBlur={() => show(null)}
              /* Pressing a step takes the figure to it. It deliberately does
                 not set the loop running: a reader who has turned motion down
                 gets a stepper they work by hand, and the one control that
                 starts the loop is the one that says so. */
              onClick={() => {
                setSeekTo({ at: STAGE_AT[i] });
              }}
            >
              <span className="choice-word">{st.name}</span>
              <span className="sr-only">. {st.detail}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="plate-row">
        <p ref={said} className="figure-said arm-said">
          <span ref={now} className="figure-said-now">
            {STAGES[0].name}
          </span>
          <span ref={detail}>{STAGES[0].detail}</span>
        </p>
        <button
          type="button"
          onClick={() => {
            setIndex((n) => n + 1);
            setStarted(true);
          }}
          className="control"
        >
          Put it somewhere else
        </button>
      </div>
      </div>
    </div>
  );
}
