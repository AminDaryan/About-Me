"use client";

/* The simulation state lives in refs and is mutated inside the render loop,
   sixty times a second, deliberately outside React's render cycle — driving a
   three.js scene through React state at that rate is exactly what you must
   not do. */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, OrthographicCamera } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  DEFAULT_PARAMS,
  UMAX,
  constants,
  control,
  lqrGain,
  rk4,
  type State,
} from "@/lib/dip";

/* A double inverted pendulum on a cart, balanced by an LQR in real time.

   The plant is the full nonlinear model — no small-angle approximation in the
   simulation itself. Only the *controller* is designed on the linearisation,
   which is what LQR means. Drag to move the cart's target; nudge to disturb. */

const INK = "#23201a";
const RULE = "#d0cdbd";
const ACCENT = "#9c5039";

const DT = 1 / 300; // integrator step

/** World units shown across the canvas. Narrower on small screens, or the
    pendulum ends up a third of the height of the space it is given. Both the
    camera and the drag mapping read this, so they cannot disagree. */
const spanFor = (width: number) => (width < 640 ? 2.4 : 3.6);

/** How far the target may be dragged, as a fraction of the visible span. */
const xLimitFor = (width: number) => spanFor(width) * 0.34;

function Rail() {
  const ticks = useMemo(() => {
    const out: [number, number, number][][] = [];
    for (let i = -6; i <= 6; i++) {
      const x = i * 0.25;
      out.push([
        [x, -0.045, 0],
        [x, -0.075, 0],
      ]);
    }
    return out;
  }, []);

  return (
    <group>
      <Line
        points={[
          [-1.75, -0.045, 0],
          [1.75, -0.045, 0],
        ]}
        color={RULE}
        lineWidth={1.2}
      />
      {ticks.map((t, i) => (
        <Line key={i} points={t} color={RULE} lineWidth={1} transparent opacity={0.7} />
      ))}
    </group>
  );
}

function Cart() {
  const w = 0.17;
  const h = 0.085;
  return (
    <group>
      <Line
        points={[
          [-w, -h, 0],
          [w, -h, 0],
          [w, h, 0],
          [-w, h, 0],
          [-w, -h, 0],
        ]}
        color={INK}
        lineWidth={1.5}
      />
      <mesh>
        <ringGeometry args={[0.016, 0.026, 20]} />
        <meshBasicMaterial color={INK} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Link({ length }: { length: number }) {
  return (
    <group>
      <Line
        points={[
          [0, 0, 0],
          [0, length, 0],
        ]}
        color={INK}
        lineWidth={1.6}
      />
      <mesh>
        <ringGeometry args={[0.018, 0.03, 22]} />
        <meshBasicMaterial color={INK} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** Declarative camera: zoom is a prop derived from the measured width, so the
    view refits on resize without anyone mutating the camera by hand. */
function FitCamera() {
  const width = useThree((s) => s.size.width);
  return (
    <OrthographicCamera
      makeDefault
      position={[0, 0, 6]}
      zoom={width / spanFor(width)}
    />
  );
}

interface SimProps {
  xRef: React.RefObject<number>;
  kickRef: React.RefObject<number>;
  readout: (t1: number, t2: number, u: number) => void;
  running: boolean;
}

function Sim({ xRef, kickRef, readout, running }: SimProps) {
  const p = DEFAULT_PARAMS;
  const c = useMemo(() => constants(p), [p]);
  const K = useMemo(() => lqrGain(p), [p]);

  const stateRef = useRef<State>([0, 0.09, -0.06, 0, 0, 0]);
  const accRef = useRef(0);
  const tickRef = useRef(0);

  const cartRef = useRef<THREE.Group>(null);
  const link1Ref = useRef<THREE.Group>(null);
  const link2Ref = useRef<THREE.Group>(null);
  const targetRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    let u = 0;

    if (running) {
      // Clamp so a backgrounded tab does not try to catch up in one frame.
      accRef.current += Math.min(delta, 0.05);

      while (accRef.current >= DT) {
        const s = stateRef.current;

        if (kickRef.current !== 0) {
          s[4] += kickRef.current;
          s[5] -= kickRef.current * 0.6;
          kickRef.current = 0;
        }

        u = control(K, s, xRef.current);
        stateRef.current = rk4(s, u, DT, p, c);
        accRef.current -= DT;
      }
    }

    const [x, t1, t2] = stateRef.current;

    // Nested frames: link 2's local angle is (θ2 − θ1) so its world angle is θ2.
    if (cartRef.current) cartRef.current.position.x = x;
    if (link1Ref.current) link1Ref.current.rotation.z = -t1;
    if (link2Ref.current) link2Ref.current.rotation.z = -(t2 - t1);
    if (targetRef.current) targetRef.current.position.x = xRef.current;

    tickRef.current += 1;
    if (tickRef.current % 6 === 0) readout(t1, t2, u);
  });

  // The group is dropped so the cart-to-tip span sits centred in the frame,
  // rather than riding high with dead space underneath it.
  return (
    <group rotation={[-0.2, 0, 0]} position={[0, -0.55, 0]}>
      <Rail />

      {/* the commanded cart position */}
      <group ref={targetRef}>
        <mesh position={[0, -0.045, 0]} rotation={[0, 0, Math.PI / 4]}>
          <planeGeometry args={[0.05, 0.05]} />
          <meshBasicMaterial color={ACCENT} side={THREE.DoubleSide} />
        </mesh>
      </group>

      <group ref={cartRef}>
        <Cart />
        <group ref={link1Ref}>
          <Link length={p.l1} />
          <group ref={link2Ref} position={[0, p.l1, 0]}>
            <Link length={p.l2} />
            <mesh position={[0, p.l2, 0]}>
              <circleGeometry args={[0.026, 20]} />
              <meshBasicMaterial color={ACCENT} side={THREE.DoubleSide} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

export default function PendulumScene() {
  const xRef = useRef(0);
  const kickRef = useRef(0);
  const draggingRef = useRef(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const t1Ref = useRef<HTMLSpanElement>(null);
  const t2Ref = useRef<HTMLSpanElement>(null);
  const uRef = useRef<HTMLSpanElement>(null);

  // This component is only ever mounted client-side (dynamic, ssr: false),
  // so reading matchMedia in the initialiser is safe and avoids an effect.
  const [running, setRunning] = useState(
    () =>
      typeof window === "undefined" ||
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const readout = (t1: number, t2: number, u: number) => {
    if (t1Ref.current) t1Ref.current.textContent = t1.toFixed(3);
    if (t2Ref.current) t2Ref.current.textContent = t2.toFixed(3);
    if (uRef.current) uRef.current.textContent = u.toFixed(1);
  };

  const setTargetFromEvent = (clientX: number) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const frac = (clientX - rect.left) / rect.width;
    const limit = xLimitFor(rect.width);
    xRef.current = Math.max(
      -limit,
      Math.min(limit, (frac - 0.5) * spanFor(rect.width)),
    );
  };

  return (
    <div>
      <div
        ref={wrapRef}
        className="relative h-[19rem] w-full cursor-ew-resize touch-none select-none sm:h-[22rem]"
        onPointerDown={(e) => {
          draggingRef.current = true;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          setTargetFromEvent(e.clientX);
        }}
        onPointerMove={(e) => {
          if (draggingRef.current) setTargetFromEvent(e.clientX);
        }}
        onPointerUp={() => {
          draggingRef.current = false;
        }}
        onPointerLeave={() => {
          draggingRef.current = false;
        }}
      >
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <FitCamera />
          <Sim
            xRef={xRef}
            kickRef={kickRef}
            readout={readout}
            running={running}
          />
        </Canvas>
      </div>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-t border-rule pt-4">
        <p className="label text-ink-faint">
          θ₁ <span ref={t1Ref} className="text-ink">0.000</span> rad
          <span className="mx-2 text-rule">·</span>
          θ₂ <span ref={t2Ref} className="text-ink">0.000</span> rad
          <span className="mx-2 text-rule">·</span>
          u <span ref={uRef} className="text-ink">0.0</span> N
          <span className="ml-2 normal-case">(limit ±{UMAX} N)</span>
        </p>

        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => {
              kickRef.current =
                (Math.random() > 0.5 ? 1 : -1) * (1.4 + Math.random() * 1.4);
              setRunning(true);
            }}
            className="label link cursor-pointer text-accent"
          >
            Disturb it
          </button>
          <button
            type="button"
            onClick={() => {
              xRef.current = 0;
              kickRef.current = 0;
            }}
            className="label link cursor-pointer text-ink-faint"
          >
            Recentre
          </button>
        </div>
      </div>
    </div>
  );
}
