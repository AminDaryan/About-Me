"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import type { Line2 } from "three-stdlib";
import useMedia from "@/components/useMedia";
import { ACCENT, INK, RULE, SOFT } from "./palette";
import {
  CAMERA,
  DRAWN,
  TABLE,
  OBJECT_HALF,
  OBSTACLE,
  PLANNERS,
  STAGES,
  TARGET,
  objectAt,
  planPath,
  shot,
  type Shot,
} from "@/lib/arm";

/* Fig. 3 — the pick-and-place, running.

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

/** A wireframe box, drawn as its twelve edges. */
function Box({
  w,
  h,
  d,
  colour,
  width = 1.3,
}: {
  w: number;
  h: number;
  d: number;
  colour: string;
  width?: number;
}) {
  const edges = useMemo(() => {
    const [a, b, c] = [w / 2, h / 2, d / 2];
    const v: [number, number, number][] = [
      [-a, -b, -c], [a, -b, -c], [a, -b, c], [-a, -b, c],
      [-a, b, -c], [a, b, -c], [a, b, c], [-a, b, c],
    ];
    const pairs = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];
    return pairs.map(([i, j]) => [v[i], v[j]] as [number, number, number][]);
  }, [w, h, d]);

  return (
    <group>
      {edges.map((e, i) => (
        <Line key={i} points={e} color={colour} lineWidth={width} />
      ))}
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
  const s = 0.115;
  const tick = 0.045;
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

interface SceneProps {
  index: number;
  running: boolean;
  onStage: (s: Shot) => void;
}

function Scene({ index, running, onStage }: SceneProps) {
  const object = useMemo(() => objectAt(index), [index]);
  const path = useMemo(() => planPath(object, TARGET), [object]);

  const clock = useRef(0);
  const j1 = useRef<THREE.Group>(null);
  const j2 = useRef<THREE.Group>(null);
  const j4 = useRef<THREE.Group>(null);
  const j6 = useRef<THREE.Group>(null);
  const fingerL = useRef<THREE.Group>(null);
  const fingerR = useRef<THREE.Group>(null);
  const cube = useRef<THREE.Group>(null);
  const detection = useRef<THREE.Group>(null);
  const axes = useRef<THREE.Group>(null);
  const plan = useRef<Line2>(null);
  const candidates = useRef<(THREE.Mesh | null)[]>([]);
  const lastStage = useRef(-1);

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

    const open = 0.018 + s.grip * 0.042;
    if (fingerL.current) fingerL.current.position.x = -open;
    if (fingerR.current) fingerR.current.position.x = open;

    if (cube.current) cube.current.position.set(s.object.x, s.object.y, s.object.z);

    const showBox = s.boxIn > 0;
    if (detection.current) {
      detection.current.visible = showBox;
      detection.current.position.set(s.object.x, s.object.y + 0.02, s.object.z);
      // The box tightens onto the object as the arm takes its closer look.
      detection.current.scale.setScalar(1.5 - 0.5 * s.boxIn);
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

    if (plan.current) {
      const drawn = Math.max(2, Math.round(s.planDrawn * path.length));
      plan.current.visible = s.planDrawn > 0.01;
      if (plan.current.visible) {
        plan.current.geometry.setPositions(
          path.slice(0, drawn).flatMap((p) => [p.x, p.y, p.z]),
        );
      }
    }

    if (s.index !== lastStage.current) {
      lastStage.current = s.index;
      onStage(s);
    }
  };

  useFrame((_, delta) => {
    if (running) clock.current += Math.min(delta, 0.05);
    apply(shot(clock.current, object, path));
  });

  const first = shot(0, object, path);

  return (
    <group>
      {/* the bench, the obstacle the planner knows about, and the one place
          the object is ever put down */}
      <Bench />
      <group position={[OBSTACLE.x, OBSTACLE.h / 2, OBSTACLE.z]}>
        {/* The planner is told about this one. Drawn in the soft ink rather
            than in rule weight: an obstacle you cannot see makes the arc over
            it look like a flourish. */}
        <Box w={OBSTACLE.w} h={OBSTACLE.h} d={OBSTACLE.w} colour={SOFT} width={1.4} />
      </group>
      <group position={[TARGET.x, 0.002, TARGET.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <Line
          points={[
            [-0.085, -0.085, 0], [0.085, -0.085, 0],
            [0.085, 0.085, 0], [-0.085, 0.085, 0], [-0.085, -0.085, 0],
          ]}
          color={ACCENT}
          lineWidth={1.3}
          dashed
          dashSize={0.035}
          gapSize={0.028}
        />
      </group>

      {/* the object, and what the perception makes of it */}
      <group ref={cube} position={[first.object.x, first.object.y, first.object.z]}>
        <Box w={CUBE} h={CUBE} d={CUBE} colour={INK} width={1.6} />
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
          <meshBasicMaterial color={ACCENT} side={THREE.DoubleSide} transparent opacity={0.5} />
        </mesh>
      ))}

      {/* the plan, drawn before it is followed */}
      <Line
        ref={plan}
        points={[
          [0, 0, 0],
          [0, 0, 0],
        ]}
        color={ACCENT}
        lineWidth={1.2}
        dashed
        dashSize={0.045}
        gapSize={0.035}
        visible={false}
      />

      {/* the arm */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.16, 0.185, 40]} />
        <meshBasicMaterial color={INK} side={THREE.DoubleSide} />
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
                    {/* the parallel gripper: two fingers that really close */}
                    <group ref={fingerL} position={[-0.06, 0, 0]}>
                      <Finger />
                    </group>
                    <group ref={fingerR} position={[0.06, 0, 0]}>
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

/** One finger of the parallel gripper. */
function Finger() {
  return (
    <Line
      points={[
        [0, 0, 0],
        [0, DRAWN.tool, 0],
      ]}
      color={INK}
      lineWidth={1.4}
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
     turns over and these two refs do the rest. */
  const names = useRef<(HTMLLIElement | null)[]>([]);
  const detail = useRef<HTMLSpanElement>(null);
  const planner = useRef(0);

  const onStage = (s: Shot) => {
    names.current.forEach((li, i) => li?.toggleAttribute("data-now", i === s.index));
    if (!detail.current) return;
    /* The planner named is not always the first one. The project tried four in
       turn with growing timeouts when a plan did not come back, and that loop
       is the most honest thing in its flowchart. */
    if (s.stage === "plan") planner.current = (planner.current + 1) % PLANNERS.length;
    const text = STAGES[s.index].detail;
    detail.current.textContent =
      s.stage === "plan" ? `${text} — ${PLANNERS[planner.current]} this time` : text;
  };

  return (
    <div>
      <div className="h-[17rem] w-full sm:h-[21rem]">
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          camera={{ position: [...CAMERA.eye], fov: CAMERA.fov }}
          style={{ background: "transparent" }}
          onCreated={({ camera }) => camera.lookAt(...CAMERA.look)}
        >
          <Scene index={index} running={running} onStage={onStage} />
        </Canvas>
      </div>

      <ol className="pipeline" aria-label="The loop this figure runs">
        {STAGES.map((st, i) => (
          <li
            key={st.key}
            ref={(el) => {
              names.current[i] = el;
            }}
            data-now={i === 0 ? "" : undefined}
          >
            {st.name}
          </li>
        ))}
      </ol>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-t border-rule pt-4">
        <p className="label text-ink-faint">
          <span ref={detail} className="normal-case">
            {STAGES[0].detail}
          </span>
        </p>
        <button
          type="button"
          onClick={() => {
            setIndex((n) => n + 1);
            setStarted(true);
          }}
          className="label tap link cursor-pointer text-ink-faint"
        >
          Put it somewhere else
        </button>
      </div>
    </div>
  );
}
