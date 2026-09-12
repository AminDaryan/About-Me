"use client";

/* The simulation state lives in refs and is mutated inside the render loop,
   sixty times a second, deliberately outside React's render cycle — driving a
   three.js scene through React state at that rate is exactly what you must
   not do. */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, OrthographicCamera } from "@react-three/drei";
import { useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import type { Line2 } from "three-stdlib";
import {
  DEFAULT_PARAMS,
  UMAX,
  bodyPoint,
  constants,
  control,
  lqrGain,
  pointForce,
  railStop,
  rk4,
  type Body,
  type Generalized,
  type State,
} from "@/lib/dip";

/* A double inverted pendulum on a cart, balanced by an LQR in real time.

   The plant is the full nonlinear model — no small-angle approximation in the
   simulation itself. Only the *controller* is designed on the linearisation,
   which is what LQR means.

   You can take hold of any part. A pull is a force on the point you hold, not a
   command: it enters the equations of motion as generalized forces, Q = Jᵀ F, so
   pulling the top link acts on the top link and reaches the cart only through
   the joints. The controller keeps running and resists you. The small diamond
   is different — it is the cart's commanded position, and dragging it moves the
   setpoint. */

const INK = "#23201a";
const RULE = "#d0cdbd";
const ACCENT = "#9c5039";

const DT = 1 / 300; // integrator step
const UPRIGHT: State = [0, 0.09, -0.06, 0, 0, 0];

/** The Sim group's transform. The pointer mapping inverts exactly this, so the
    two are defined once, here. */
const GROUP_Y = -0.55;
const GROUP_TILT = -0.2;

/** World units shown across the canvas. Narrower on small screens, or the
    pendulum ends up a third of the height of the space it is given. The camera
    and the pointer mapping both read this, so they cannot disagree. */
const spanFor = (width: number) => (width < 640 ? 2.4 : 3.6);

/** How far the target may be dragged, as a fraction of the visible span. */
const xLimitFor = (width: number) => spanFor(width) * 0.34;

const CART_W = 0.17;
const CART_H = 0.085;
/** The ring drawn at the cart's centre, which is also link 1's pivot. */
const PIVOT = 0.026;
/** Half the diagonal of the target diamond, so its whole face can be grabbed. */
const TARGET_R = 0.035;
/** The rail the cart runs on, and the line the target diamond sits on. */
const RAIL_Y = -0.045;

type Grip =
  | { kind: "body"; body: Body; s: number; hx: number; hy: number }
  | { kind: "target" };

/** What the pointer is holding, for the parts that must be drawn as held. */
type Held = Body | "target" | null;

/** The part being held is drawn in the accent, so that what you have hold of is
    never in doubt — a pull on the lower link moves the cart far more than it
    moves the link, and without this the pendulum looks as though it grabbed
    something else. */
const inkOr = (held: boolean | undefined) => (held ? ACCENT : INK);

function Rail() {
  const ticks = useMemo(() => {
    const out: [number, number, number][][] = [];
    for (let i = -6; i <= 6; i++) {
      const x = i * 0.25;
      out.push([
        [x, RAIL_Y, 0],
        [x, RAIL_Y - 0.03, 0],
      ]);
    }
    return out;
  }, []);

  return (
    <group>
      <Line
        points={[
          [-1.75, RAIL_Y, 0],
          [1.75, RAIL_Y, 0],
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

function Cart({ held }: { held?: boolean }) {
  return (
    <group>
      <Line
        points={[
          [-CART_W, -CART_H, 0],
          [CART_W, -CART_H, 0],
          [CART_W, CART_H, 0],
          [-CART_W, CART_H, 0],
          [-CART_W, -CART_H, 0],
        ]}
        color={inkOr(held)}
        lineWidth={1.5}
      />
      <mesh>
        <ringGeometry args={[0.016, PIVOT, 20]} />
        <meshBasicMaterial color={inkOr(held)} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Link({ length, held }: { length: number; held?: boolean }) {
  return (
    <group>
      <Line
        points={[
          [0, 0, 0],
          [0, length, 0],
        ]}
        color={inkOr(held)}
        lineWidth={1.6}
      />
      <mesh>
        <ringGeometry args={[0.018, 0.03, 22]} />
        <meshBasicMaterial color={inkOr(held)} side={THREE.DoubleSide} />
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
  stateRef: RefObject<State>;
  xRef: RefObject<number>;
  kickRef: RefObject<number>;
  gripRef: RefObject<Grip | null>;
  /* The same grab as `gripRef`, but as state: taking hold of something and
     letting go are two events per drag, not sixty a second, so the parts that
     only have to look held can be told in the ordinary way. */
  held: Held;
  readout: (t1: number, t2: number, u: number) => void;
  running: boolean;
}

function Sim({ stateRef, xRef, kickRef, gripRef, held, readout, running }: SimProps) {
  const p = DEFAULT_PARAMS;
  const c = useMemo(() => constants(p), [p]);
  const K = useMemo(() => lqrGain(p), [p]);

  const accRef = useRef(0);
  const tickRef = useRef(0);
  const fallenRef = useRef(0);

  const cartRef = useRef<THREE.Group>(null);
  const link1Ref = useRef<THREE.Group>(null);
  const link2Ref = useRef<THREE.Group>(null);
  const targetRef = useRef<THREE.Group>(null);
  const handRef = useRef<THREE.Mesh>(null);
  // The pull, drawn as a hairline from the held point to the pointer, so the
  // force being applied is visible rather than implied. Updated through its ref
  // each frame, like every other moving part of the scene.
  const bandRef = useRef<Line2>(null);

  useFrame((_, delta) => {
    let u = 0;
    const grip = gripRef.current;

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

        const ext: Generalized =
          grip?.kind === "body"
            ? pointForce(grip.body, grip.s, s, p, grip.hx, grip.hy)
            : [0, 0, 0];
        ext[0] += railStop(s[0], s[3]);

        u = control(K, s, xRef.current);
        stateRef.current = rk4(s, u, DT, p, c, ext);
        accRef.current -= DT;
      }

      // If it does go over — a hard fling can still do it — put it back upright
      // once it has lain there a moment, rather than leaving a spinning wreck.
      const [, a1, a2] = stateRef.current;
      if (!grip && (Math.abs(a1) > 1.25 || Math.abs(a2) > 1.25)) {
        fallenRef.current += Math.min(delta, 0.05);
        if (fallenRef.current > 1.2) {
          stateRef.current = [...UPRIGHT] as State;
          xRef.current = 0;
          fallenRef.current = 0;
        }
      } else {
        fallenRef.current = 0;
      }
    }

    const [x, t1, t2] = stateRef.current;

    // Nested frames: link 2's local angle is (θ2 − θ1) so its world angle is θ2.
    if (cartRef.current) cartRef.current.position.x = x;
    if (link1Ref.current) link1Ref.current.rotation.z = -t1;
    if (link2Ref.current) link2Ref.current.rotation.z = -(t2 - t1);
    if (targetRef.current) targetRef.current.position.x = xRef.current;

    const bandLine = bandRef.current;
    const hand = handRef.current;
    if (grip?.kind === "body") {
      const b = bodyPoint(grip.body, grip.s, stateRef.current, p);
      if (bandLine) {
        bandLine.geometry.setPositions([b.px, b.py, 0.01, grip.hx, grip.hy, 0.01]);
        bandLine.visible = true;
      }
      if (hand) {
        hand.visible = true;
        hand.position.set(grip.hx, grip.hy, 0.01);
      }
    } else {
      if (bandLine) bandLine.visible = false;
      if (hand) hand.visible = false;
    }

    tickRef.current += 1;
    if (tickRef.current % 6 === 0) readout(t1, t2, u);
  });

  // The group is dropped so the cart-to-tip span sits centred in the frame,
  // rather than riding high with dead space underneath it.
  return (
    <group rotation={[GROUP_TILT, 0, 0]} position={[0, GROUP_Y, 0]}>
      <Rail />

      {/* the commanded cart position */}
      <group ref={targetRef}>
        <mesh
          position={[0, RAIL_Y, 0]}
          rotation={[0, 0, Math.PI / 4]}
          scale={held === "target" ? 1.35 : 1}
        >
          <planeGeometry args={[0.05, 0.05]} />
          <meshBasicMaterial color={ACCENT} side={THREE.DoubleSide} />
        </mesh>
      </group>

      <group ref={cartRef}>
        <Cart held={held === "cart"} />
        <group ref={link1Ref}>
          <Link length={p.l1} held={held === "link1"} />
          <group ref={link2Ref} position={[0, p.l1, 0]}>
            <Link length={p.l2} held={held === "link2"} />
            <mesh position={[0, p.l2, 0]}>
              <circleGeometry args={[0.026, 20]} />
              <meshBasicMaterial color={ACCENT} side={THREE.DoubleSide} />
            </mesh>
          </group>
        </group>
      </group>

      <Line
        ref={bandRef}
        points={[
          [0, 0, 0.01],
          [0, 0, 0.01],
        ]}
        color={ACCENT}
        lineWidth={1}
        visible={false}
      />
      <mesh ref={handRef} visible={false}>
        <ringGeometry args={[0.012, 0.02, 18]} />
        <meshBasicMaterial color={ACCENT} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** Distance from a point to a segment, and how far along the segment it lands. */
function toSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const u = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return { d: Math.hypot(px - (ax + u * dx), py - (ay + u * dy)), u };
}

/**
 * Distance from a point to the outline of a box — to the box itself from
 * outside, and to the nearest edge from within.
 *
 * The cart is measured to its outline and not to its filled area, and that is
 * the whole of the fix for grabbing the wrong part. Link 1 rises out of the
 * middle of the cart, so its lowest fifth is drawn *inside* the box; against a
 * filled area the cart scored a flat zero there and won every time, and a pull
 * meant for the link went to the cart instead. Against the outline, the link is
 * the nearer thing everywhere along its own stroke, and the cart is still the
 * nearer thing everywhere else in the box.
 */
function toBox(px: number, py: number, cx: number, cy: number, hw: number, hh: number) {
  const dx = Math.abs(px - cx) - hw;
  const dy = Math.abs(py - cy) - hh;
  if (dx > 0 || dy > 0) return Math.hypot(Math.max(dx, 0), Math.max(dy, 0));
  return Math.min(-dx, -dy);
}

export default function PendulumScene() {
  const p = DEFAULT_PARAMS;
  const stateRef = useRef<State>([...UPRIGHT] as State);
  const xRef = useRef(0);
  const kickRef = useRef(0);
  const gripRef = useRef<Grip | null>(null);
  const [held, setHeld] = useState<Held>(null);
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

  /** A pointer position in the pendulum's own plane: undo the orthographic
      camera, then the Sim group's drop and tilt. */
  const toPlane = (clientX: number, clientY: number) => {
    const rect = wrapRef.current!.getBoundingClientRect();
    const perPx = spanFor(rect.width) / rect.width;
    const wx = (clientX - rect.left - rect.width / 2) * perPx;
    const wy = (rect.top + rect.height / 2 - clientY) * perPx;
    return { x: wx, y: (wy - GROUP_Y) / Math.cos(GROUP_TILT), perPx, rect };
  };

  /**
   * What is under the pointer, if anything.
   *
   * Every candidate is measured to the part as it is *drawn* — the links to
   * their strokes, the cart to its outline and to the ring at its centre, the
   * target to its face — and the nearest within about 14 px wins; touch gets a
   * wider reach than a mouse. Measuring to what is on the screen is what makes
   * the answer the one the reader meant: whatever you can see, you can take
   * hold of, and nothing you cannot see takes hold of you first.
   */
  const pick = (clientX: number, clientY: number, touch: boolean): Grip | null => {
    const { x: hx, y: hy, perPx } = toPlane(clientX, clientY);
    const reach = (touch ? 22 : 14) * perPx;
    const [x, t1, t2] = stateRef.current;
    const j1x = x + p.l1 * Math.sin(t1), j1y = p.l1 * Math.cos(t1);
    const tipx = j1x + p.l2 * Math.sin(t2), tipy = j1y + p.l2 * Math.cos(t2);

    /* In order of precedence, which settles the places where two parts are
       genuinely in the same spot: the target's face over the cart it sits in,
       and the upper link over the lower one at the joint they share — where
       the two have the same Jacobian anyway, so the pull is the same either
       way. */
    const options: { d: number; grip: Grip }[] = [];
    options.push({
      d: Math.hypot(hx - xRef.current, hy - RAIL_Y) - TARGET_R,
      grip: { kind: "target" },
    });
    const l2 = toSegment(hx, hy, j1x, j1y, tipx, tipy);
    options.push({ d: l2.d, grip: { kind: "body", body: "link2", s: l2.u * p.l2, hx, hy } });
    const l1 = toSegment(hx, hy, x, 0, j1x, j1y);
    options.push({ d: l1.d, grip: { kind: "body", body: "link1", s: l1.u * p.l1, hx, hy } });
    /* The cart is measured to its outline and to the ring at its centre — and
       then held at arm's length anywhere else inside it, so that the middle of
       an 80 px box is still the cart to anyone who presses it, while a link
       crossing that middle is the nearer thing and keeps its claim. */
    const cartEdge = Math.min(
      toBox(hx, hy, x, 0, CART_W, CART_H),
      Math.hypot(hx - x, hy) - PIVOT,
    );
    const insideCart = Math.abs(hx - x) <= CART_W && Math.abs(hy) <= CART_H;
    options.push({
      d: insideCart ? Math.min(cartEdge, reach) : cartEdge,
      grip: { kind: "body", body: "cart", s: 0, hx, hy },
    });

    /* A stable sort, so parts that are the same distance away — the pivot,
       the joint — are settled by the order above rather than by chance. */
    const best = options.filter((o) => o.d <= reach).sort((a, b) => a.d - b.d)[0];
    return best ? best.grip : null;
  };

  const setCursor = (c: string) => {
    if (wrapRef.current) wrapRef.current.style.cursor = c;
  };

  const moveTarget = (clientX: number) => {
    const { x, rect } = toPlane(clientX, 0);
    const limit = xLimitFor(rect.width);
    xRef.current = Math.max(-limit, Math.min(limit, x));
  };

  const release = () => {
    gripRef.current = null;
    setHeld(null);
    setCursor("");
  };

  return (
    <div>
      <div
        ref={wrapRef}
        className="relative h-[19rem] w-full touch-none select-none sm:h-[22rem]"
        onPointerDown={(e) => {
          const grip = pick(e.clientX, e.clientY, e.pointerType !== "mouse");
          if (!grip) return;
          // Keep receiving moves when the pointer leaves the canvas mid-drag.
          // Capture throws if the pointer is no longer active (a touch that
          // was already cancelled); the drag still works without it.
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {}
          gripRef.current = grip;
          setHeld(grip.kind === "target" ? "target" : grip.body);
          setCursor("grabbing");
          if (grip.kind === "target") moveTarget(e.clientX);
          setRunning(true);
        }}
        onPointerMove={(e) => {
          const grip = gripRef.current;
          if (!grip) {
            // Hovering: the grab hand only where there is something to hold.
            setCursor(pick(e.clientX, e.clientY, false) ? "grab" : "");
            return;
          }
          if (grip.kind === "target") {
            moveTarget(e.clientX);
          } else {
            const { x, y } = toPlane(e.clientX, e.clientY);
            grip.hx = x;
            grip.hy = y;
          }
        }}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={release}
      >
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <FitCamera />
          <Sim
            stateRef={stateRef}
            xRef={xRef}
            kickRef={kickRef}
            gripRef={gripRef}
            held={held}
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
              stateRef.current = [...UPRIGHT] as State;
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
