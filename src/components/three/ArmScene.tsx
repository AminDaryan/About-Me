"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/* A 6R articulated arm drawn as hairline ink on paper.

   Everything uses Line and meshBasicMaterial, so the scene has no lights at
   all — nothing is shaded, nothing is glossy, and the result reads as a
   technical figure rather than a rendering. The pose comes from nesting the
   joint frames, which is forward kinematics done the way a scene graph
   already wants to do it. */

const INK = "#1f1d1a";
const RULE = "#ded5c8";
const ACCENT = "#a65a43";

const BASE = 0.28;
const L1 = 0.85;
const L2 = 0.72;
const L3 = 0.3;
const TOOL = 0.16;

/** A link, drawn from the joint origin along its local +Y. */
function Link({ length, width = 1.6 }: { length: number; width?: number }) {
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
function Joint({ r = 0.055, axis }: { r?: number; axis: "pitch" | "roll" }) {
  return (
    <mesh rotation={axis === "pitch" ? [0, Math.PI / 2, 0] : [Math.PI / 2, 0, 0]}>
      <ringGeometry args={[r * 0.62, r, 28]} />
      <meshBasicMaterial color={INK} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Ground() {
  const lines = useMemo(() => {
    const out: { pts: [number, number, number][]; o: number }[] = [];
    const N = 7;
    const step = 0.36;
    const ext = N * step;
    for (let i = -N; i <= N; i++) {
      const fade = 1 - Math.abs(i) / (N + 1);
      const o = 0.1 + 0.55 * fade * fade;
      out.push({ pts: [[-ext, 0, i * step], [ext, 0, i * step]], o });
      out.push({ pts: [[i * step, 0, -ext], [i * step, 0, ext]], o });
    }
    return out;
  }, []);

  return (
    <group>
      {lines.map((l, i) => (
        <Line
          key={i}
          points={l.pts}
          color={RULE}
          lineWidth={1}
          transparent
          opacity={l.o}
        />
      ))}
    </group>
  );
}

function Arm({ speed }: { speed: number }) {
  const j1 = useRef<THREE.Group>(null);
  const j2 = useRef<THREE.Group>(null);
  const j3 = useRef<THREE.Group>(null);
  const j4 = useRef<THREE.Group>(null);
  const j5 = useRef<THREE.Group>(null);
  const j6 = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    // Incommensurable frequencies, so the pose wanders and never loops.
    // Offsets keep every joint away from its straight-through pose: an arm that
    // momentarily unfolds into one flat line stops reading as an arm.
    const t = clock.getElapsedTime() * speed;
    if (j1.current) j1.current.rotation.y = 0.62 * Math.sin(0.23 * t);
    if (j2.current) j2.current.rotation.x = -0.65 + 0.22 * Math.sin(0.31 * t + 1.0);
    if (j3.current) j3.current.rotation.x = 1.45 + 0.3 * Math.sin(0.27 * t + 2.1);
    if (j4.current) j4.current.rotation.y = 0.55 * Math.sin(0.19 * t + 0.4);
    if (j5.current) j5.current.rotation.x = 0.55 + 0.3 * Math.sin(0.33 * t + 0.9);
    if (j6.current) j6.current.rotation.y = 0.7 * Math.sin(0.21 * t);
  });

  return (
    <group>
      {/* base plate */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.16, 0.185, 40]} />
        <meshBasicMaterial color={INK} side={THREE.DoubleSide} />
      </mesh>

      <group ref={j1}>
        <Link length={BASE} />
        <group ref={j2} position={[0, BASE, 0]}>
          <Joint axis="pitch" />
          <Link length={L1} />

          <group ref={j3} position={[0, L1, 0]}>
            <Joint axis="pitch" r={0.05} />
            <Link length={L2} />

            <group ref={j4} position={[0, L2, 0]}>
              <Joint axis="roll" r={0.042} />
              <group ref={j5}>
                <Link length={L3} width={1.2} />

                <group ref={j6} position={[0, L3, 0]}>
                  <Joint axis="roll" r={0.034} />
                  {/* tool: a short fork, so the wrist roll is legible */}
                  <Line
                    points={[
                      [0, 0, 0],
                      [0, TOOL * 0.55, 0],
                    ]}
                    color={INK}
                    lineWidth={1.2}
                  />
                  <Line
                    points={[
                      [-0.05, TOOL * 0.55, 0],
                      [0.05, TOOL * 0.55, 0],
                    ]}
                    color={INK}
                    lineWidth={1.2}
                  />
                  <Line
                    points={[
                      [-0.05, TOOL * 0.55, 0],
                      [-0.05, TOOL, 0],
                    ]}
                    color={INK}
                    lineWidth={1.2}
                  />
                  <Line
                    points={[
                      [0.05, TOOL * 0.55, 0],
                      [0.05, TOOL, 0],
                    ]}
                    color={INK}
                    lineWidth={1.2}
                  />

                  {/* A motion trail was tried here and cut: at this scale it
                      knotted into a blob as the wrist turned, and left stray
                      fragments behind. A single quiet mark says more. */}
                  <mesh position={[0, TOOL, 0]}>
                    <sphereGeometry args={[0.02, 14, 14]} />
                    <meshBasicMaterial color={ACCENT} />
                  </mesh>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

/* Sampling the pose across the whole animation gives a bounding sphere of
   radius 1.03 centred 0.972 above the base (the arm reaches 1.94 up at full
   extension). Lifting the arm by exactly that much puts the sphere's centre on
   the world origin, which is also what the parallax rotates about — so no pose
   and no pointer position can swing the arm out of frame, rather than merely
   being unlikely to. */
const SPHERE_CENTRE_Y = 0.972;

function Rig({ parallax }: { parallax: boolean }) {
  const root = useRef<THREE.Group>(null);

  useFrame((state) => {
    const g = root.current;
    if (!g || !parallax) return;
    // Ease toward the pointer rather than tracking it, so it feels like weight.
    g.rotation.y += (state.pointer.x * 0.24 - g.rotation.y) * 0.045;
    g.rotation.x += (-state.pointer.y * 0.08 - g.rotation.x) * 0.045;
  });

  return (
    <group ref={root}>
      <group position={[0, -SPHERE_CENTRE_Y, 0]}>
        <Ground />
        <Arm speed={parallax ? 1 : 0} />
      </group>
    </group>
  );
}

export default function ArmScene() {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      // Distance 4.3 along the same view direction. The sphere needs 3.73 at
      // this fov; the old 3.71 sat just under it, hence the occasional clip.
      camera={{ position: [2.36, 1.63, 3.2], fov: 32 }}
      style={{ background: "transparent" }}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      frameloop={reduced ? "demand" : "always"}
    >
      <Rig parallax={!reduced} />
    </Canvas>
  );
}
