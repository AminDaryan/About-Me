"use client";

import BookLink from "@/components/book/BookLink";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { InkFigure } from "@/components/ink";
import useMedia from "@/components/useMedia";
import { Plate } from "@/components/ui";
import { FIGURES, QUIET } from "./figures";
import {
  fromStops,
  nearest,
  pointAt,
  ribbon,
  serpentine,
  toStops,
  type Geometry,
} from "./road";
import { CONE, GROUND, SCENERY, bannerPath, pinPath } from "./scenery";
import { NOW, STEPS } from "./steps";

/* Fig. 1 — the route so far, as a road.

   A two-lane road winds through every stop from 2014 to now. Each stop is a
   pin. The route is read from its beginning: a small car waits behind the
   start line, under the banner, with the first stop open. It drives to
   whichever stop you point at — turning round when it has to go back — and
   the centre line lights up behind it; past today the road is not yet paved,
   and past the last stop it does not end, but runs on and fades out.
   On a wide screen you can take hold of the car and drive it yourself, and if
   the figure is left alone for long enough the car drives the whole route on
   its own, from the start line.

   Inside each U-turn stands a scene for the chapter the road has just left,
   and the car works it: the gear train turns as the car sweeps past, and the
   build and the network run once it is through. See scenery.ts.

   The stops are still an ARIA tablist underneath — real buttons laid over the
   drawing, with roving focus and the arrow keys — so none of this depends on a
   mouse. The drawing itself is decorative and hidden from assistive technology;
   everything it says is in the buttons and the panel. */

const WIDE = "(min-width: 768px)";
const HOVER = "(hover: hover)";

/** How long the car takes to turn round, in ms. */
const TURN_MS = 380;
/** How long a drive of the whole route stays at each stop, including the
    drive there. */
const STOP_MS = 2800;
/** How long the figure has to sit in view and untouched before the car sets
    off by itself: once soon after it is first seen, and seldom after that. */
const IDLE_FIRST = 7000;
const IDLE_AGAIN = 45000;

/** Road travelled either side of a turn over which its scene does its full
    sweep, in px, and how far the driving gear turns across it, in degrees. */
const SWEEP = 200;
const SPIN = 300;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** The last stop the road passes before a given distance along it. */
function lastStopBefore(g: Geometry, len: number) {
  let i = 0;
  while (i + 1 < g.stops.length && g.stops[i + 1].len < len) i++;
  return i;
}

/**
 * Where the car sits for a distance along the road. It keeps to the right-hand
 * lane, and `phase` is how far it has turned round: 0 facing along the road, 1
 * facing back, always turning left in between, so it swings across the centre
 * line the way a car making a U-turn does.
 */
function carAt(g: Geometry, len: number, phase: number) {
  const p = pointAt(g.samples, len);
  const lane = (g.kind === "ribbon" ? 5.5 : 7.5) * Math.cos(phase * Math.PI);
  const x = p.x - Math.sin(p.a) * lane;
  const y = p.y + Math.cos(p.a) * lane;
  const deg = (p.a * 180) / Math.PI - phase * 180;
  const scale = g.kind === "ribbon" ? 0.82 : 1;
  return {
    x,
    y,
    transform: `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${deg.toFixed(2)}) scale(${scale})`,
  };
}

type Motion = {
  len: number | null;
  phase: number;
  /** The phase being turned towards; odd means facing back along the road. */
  goal: number;
  drive: { from: number; to: number; t0: number; dur: number } | null;
};

export default function Journey() {
  const wide = useMedia(WIDE, true);
  const canHover = useMedia(HOVER, true);

  const [active, setActive] = useState(0);
  const [width, setWidth] = useState(552);
  const [gap, setGap] = useState(230);
  const [drawn, setDrawn] = useState(false);
  const [inView, setInView] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [driving, setDriving] = useState(false);
  /** Bumped when a drive of the route sets off from the start line, which
      moves the car without changing the stop that is open. */
  const [leg, setLeg] = useState(0);

  const boxRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<SVGGElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const litRef = useRef<SVGPathElement>(null);
  const pins = useRef<(SVGGElement | null)[]>([]);
  const scenes = useRef<(SVGGElement | null)[]>([]);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const motion = useRef<Motion>({ len: null, phase: 0, goal: 0, drive: null });
  const frame = useRef(0);
  const dragging = useRef(false);
  const against = useRef(0);
  const activeRef = useRef(active);
  const droveOnce = useRef(false);

  const road = useMemo(() => serpentine(width, STEPS.length), [width]);
  const strip = useMemo(
    () => ribbon(width, STEPS.length, active, gap + 26),
    [width, active, gap],
  );
  const geo = wide ? road : strip;
  const geoRef = useRef(geo);
  const step = STEPS[active];
  const nowLen = geo.stops[NOW].len;

  // The road is drawn for the width it really has.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setWidth(Math.max(280, Math.round(entry.contentRect.width)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // On a phone the story opens up beneath its stop; the road makes room for it.
  useEffect(() => {
    const el = panelRef.current;
    if (!el || wide) return;
    const ro = new ResizeObserver(([entry]) => {
      setGap(Math.round(entry.contentRect.height));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [wide]);

  // Draw the road in the first time it comes into view, and keep watching
  // afterwards: the car sets off on its own only while the figure is on
  // screen to be seen doing it.
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    if (reducedMotion() || typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(() => setDrawn(true));
      return () => cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setDrawn(true);
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  /* ------------------------------ the car ------------------------------ */

  /** Put the car where `motion` says, and light the road behind it. */
  const render = useCallback(() => {
    const g = geoRef.current;
    const m = motion.current;
    if (m.len === null) return;
    const car = carAt(g, m.len, m.phase);
    carRef.current?.setAttribute("transform", car.transform);
    if (handleRef.current) {
      handleRef.current.style.transform = `translate(${car.x.toFixed(1)}px, ${car.y.toFixed(1)}px)`;
    }
    litRef.current?.setAttribute(
      "stroke-dasharray",
      `${Math.max(0, m.len).toFixed(1)} ${Math.ceil(g.total + 40)}`,
    );
    // Each turn's scene, worked by the car. The gears turn with the car round
    // the turn itself; the build and the network run once it has reached the
    // last stop of the chapter they stand for — the row beside them — so a
    // finished chapter reads as finished even before the road bends.
    const len = m.len;
    g.bends.forEach((b, k) => {
      const el = scenes.current[k];
      if (!el) return;
      const turn = Math.max(-1, Math.min(1, (len - b.len) / SWEEP)) * SPIN;
      el.style.setProperty("--turn", turn.toFixed(1));
      el.toggleAttribute("data-run", len >= g.stops[lastStopBefore(g, b.len)].len);
    });
  }, []);

  /** The pin gives a little hop when the car pulls up at it. */
  const arrive = useCallback(() => {
    const i = activeRef.current;
    const m = motion.current;
    const pin = pins.current[i];
    if (!pin || m.len === null || reducedMotion()) return;
    if (Math.abs(geoRef.current.stops[i].len - m.len) > 1) return;
    pin.animate?.(
      [
        { transform: "translateY(0)" },
        { transform: "translateY(-9px)", offset: 0.4 },
        { transform: "translateY(0)" },
      ],
      { duration: 420, easing: "cubic-bezier(0.3, 0.7, 0.4, 1)" },
    );
  }, []);

  /** One animation loop for both driving and turning round. */
  const kick = useCallback(() => {
    if (frame.current) return;
    let last = performance.now();
    const tick = (now: number) => {
      const m = motion.current;
      const dt = Math.max(0, Math.min(64, now - last));
      last = now;
      let busy = false;
      if (m.drive) {
        const d = m.drive;
        const t = Math.min(1, Math.max(0, (now - d.t0) / d.dur));
        m.len = d.from + (d.to - d.from) * ease(t);
        if (t < 1) busy = true;
        else {
          m.drive = null;
          arrive();
        }
      }
      if (m.phase < m.goal) {
        m.phase = Math.min(m.goal, m.phase + dt / TURN_MS);
        if (m.phase < m.goal) busy = true;
        else m.phase = m.goal = m.goal % 2;
      }
      render();
      frame.current = busy ? requestAnimationFrame(tick) : 0;
    };
    frame.current = requestAnimationFrame(tick);
  }, [arrive, render]);

  /** Turn to face forwards (+1) or back (−1) along the road. */
  const face = useCallback(
    (dir: 1 | -1) => {
      const m = motion.current;
      if ((m.goal % 2 === 0 ? 1 : -1) === dir) return false;
      m.goal += 1;
      if (reducedMotion()) {
        m.phase = m.goal = m.goal % 2;
        render();
      } else kick();
      return true;
    },
    [kick, render],
  );

  /** Drive there: quick for a neighbour, longer for a far stop, never tedious. */
  const driveTo = useCallback(
    (target: number) => {
      const m = motion.current;
      if (m.len === null || reducedMotion()) {
        m.len = target;
        m.drive = null;
        render();
        return;
      }
      const from = m.len;
      if (Math.abs(target - from) < 0.5) {
        m.drive = null;
        return;
      }
      // Going back, it turns round first, and only then sets off.
      const turned = face(target > from ? 1 : -1);
      const dur = Math.min(1100, Math.max(340, Math.abs(target - from) * 0.8));
      m.drive = { from, to: target, t0: performance.now() + (turned ? 160 : 0), dur };
      kick();
    },
    [face, kick, render],
  );

  // Before paint, so the car never flashes at a stale position. It drives only
  // when the stop changes; if the road itself changed shape — a resize, a phone
  // opening up room for a story — it keeps its place relative to the stops.
  const drivenFor = useRef(active);
  useLayoutEffect(() => {
    const m = motion.current;
    const old = geoRef.current;
    geoRef.current = geo;
    if (old !== geo && m.len !== null) {
      const carry = (len: number) => fromStops(geo, toStops(old, len));
      m.len = carry(m.len);
      if (m.drive) {
        m.drive.from = carry(m.drive.from);
        m.drive.to = carry(m.drive.to);
      }
    }
    if (m.len === null) m.len = geo.home;
    if (!dragging.current && drivenFor.current !== active) driveTo(geo.stops[active].len);
    drivenFor.current = active;
    render();
  }, [active, geo, driveTo, render]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  /* -------------------------- driving itself ---------------------------- */

  // A drive under way, stop by stop. It holds where it is rather than running
  // on unseen while the figure is scrolled off the screen.
  useEffect(() => {
    if (!driving || !inView) return;
    const id = window.setTimeout(() => {
      const g = geoRef.current;
      const m = motion.current;
      const at = activeRef.current;
      if (m.len !== null && m.len < g.stops[at].len - 1) {
        // Still at the start line, having come back to it: set off.
        driveTo(g.stops[at].len);
        setLeg((n) => n + 1);
      } else if (at >= STEPS.length - 1) {
        // At the end of the route it comes back to today and parks there:
        // left standing at a stop that has not happened yet, it would light
        // the road past today.
        setActive(NOW);
        setDriving(false);
      } else setActive((a) => Math.min(a + 1, STEPS.length - 1));
    }, STOP_MS);
    return () => window.clearTimeout(id);
  }, [driving, inView, active, leg, driveTo]);

  /* Left alone, the car drives the route itself, from the start line — going
     back there first if it has been driven somewhere else. It never starts
     from the first stop: the route begins under the banner, and a drive that
     began a stop in would skip the one stretch of road the banner is for.
     It waits for quiet first, and anything at all — the pointer crossing the
     figure, a stop chosen, an arrow key — cancels the wait and then starts it
     over, so a drive never begins under someone who is using the figure and
     never outlasts their taking it back. That is also the whole of the stop
     control now that the button has gone, which is why the car never sets off
     under reduced motion, and why it stays off the phone, where the story
     opening beneath each stop would shift the road about as it is read. */
  useEffect(() => {
    if (!wide || !inView || engaged || driving || reducedMotion()) return;
    const id = window.setTimeout(
      () => {
        droveOnce.current = true;
        const g = geoRef.current;
        const m = motion.current;
        // The first stop opens as the car heads for the start, so the layout
        // effect must not send it to that stop instead.
        drivenFor.current = 0;
        setActive(0);
        if (m.len !== null && m.len > g.home + 1) driveTo(g.home);
        else driveTo(g.stops[0].len);
        setDriving(true);
      },
      droveOnce.current ? IDLE_AGAIN : IDLE_FIRST,
    );
    return () => window.clearTimeout(id);
  }, [wide, inView, engaged, driving, active, driveTo]);

  /** Anything the visitor does themselves takes the wheel back. */
  function choose(i: number) {
    setDriving(false);
    setActive(i);
    // Choosing the stop that is already open changes nothing the layout effect
    // watches, and the car may not be there yet — it waits at the start line
    // with the first stop open — so send it.
    const to = geoRef.current.stops[i].len;
    if (i === activeRef.current && !dragging.current && motion.current.drive?.to !== to) {
      driveTo(to);
    }
  }

  function onKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const last = STEPS.length - 1;
    const to =
      e.key === "ArrowRight" || e.key === "ArrowDown" ? Math.min(i + 1, last)
      : e.key === "ArrowLeft" || e.key === "ArrowUp" ? Math.max(i - 1, 0)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (to === null) return;
    e.preventDefault();
    choose(to);
    tabs.current[to]?.focus({ preventScroll: true });
  }

  /* Taking the wheel, on wide screens. The pointer is matched to the nearest
     point on the road, so it can wander anywhere and the car stays on the
     tarmac; the stop nearest the car lights up as it passes. */
  function onGrab(e: PointerEvent<HTMLDivElement>) {
    dragging.current = true;
    against.current = 0;
    setDriving(false);
    motion.current.drive = null;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    boxRef.current?.classList.add("is-dragging");
  }

  function onDrag(e: PointerEvent<HTMLDivElement>) {
    const m = motion.current;
    const box = boxRef.current;
    if (!dragging.current || !box || m.len === null) return;
    const r = box.getBoundingClientRect();
    const len = nearest(geo.samples, e.clientX - r.left, e.clientY - r.top);
    // Turn round only for a deliberate move the other way, not a hand's tremor.
    const dir = len > m.len ? 1 : -1;
    if (dir !== (m.goal % 2 === 0 ? 1 : -1)) {
      against.current += Math.abs(len - m.len);
      if (against.current > 10) {
        face(dir);
        against.current = 0;
      }
    } else against.current = 0;
    m.len = len;
    render();
    let best = 0;
    geo.stops.forEach((s, i) => {
      if (Math.abs(s.len - len) < Math.abs(geo.stops[best].len - len)) best = i;
    });
    if (best !== activeRef.current) setActive(best);
  }

  function onDrop() {
    if (!dragging.current) return;
    dragging.current = false;
    boxRef.current?.classList.remove("is-dragging");
    driveTo(geo.stops[activeRef.current].len);
  }

  /* ---------------------------- the drawing ---------------------------- */

  const serp = geo.kind === "serpentine";
  const { head, lift, verge } = geo;
  const art = head * 1.36;
  const pin = useMemo(() => pinPath(road.head, road.lift), [road.head, road.lift]);
  const line = pointAt(geo.samples, geo.startLine);
  const car = carAt(geo, geo.home, 0);

  /* The banner the route sets off under, hung over the start line. On the
     serpentine it stands clear of the verge on two poles, the way a banner
     across a road does; on the phone, where the road runs down the page, it
     spans the road instead, and the road leaves room for it above the first
     badge. `foot` is how far the poles run below the cloth they carry. */
  const banner =
    serp ?
      { x: line.x, y: line.y - verge - 21, w: 50, h: 16, sag: 3, foot: 21 }
    : { x: line.x, y: line.y - 7, w: 46, h: 13, sag: 2, foot: 19 };

  /* Where the road fades out. It used to end on a flag, which said the route
     stops at the doctorate, and it does not: past the last stop the road runs
     on and fades into the paper. The fade is a ramp from the road's `fade`
     point to its last point, laid along the direction the road is heading at
     the end — so it works on a straight run and round a turn alike — in a band
     wide enough to take the road and narrow enough to miss the row above. */
  const fade = (() => {
    const e = pointAt(geo.samples, geo.total);
    // The heading is taken a few pixels short of the end: the sampler's last
    // two points can coincide, and the angle between them then comes out as
    // zero — pointing right, whichever way the road was really going.
    const a = pointAt(geo.samples, geo.total - 4).a;
    const from = pointAt(geo.samples, geo.fade);
    const back = Math.min(-24, (from.x - e.x) * Math.cos(a) + (from.y - e.y) * Math.sin(a));
    /* The mask is alpha, and a transparent ramp painted over an opaque ground
       takes nothing away from it, so the ground has a hole where the ramp
       goes. The hole is a little smaller than the ramp on every side, so the
       two overlap where both are opaque and no seam shows across the road. */
    const corner = (lx: number, ly: number) =>
      `${(e.x + lx * Math.cos(a) - ly * Math.sin(a)).toFixed(1)} ${(e.y + lx * Math.sin(a) + ly * Math.cos(a)).toFixed(1)}`;
    const hole = `M ${corner(back - 20, -100)} L ${corner(60, -100)} L ${corner(60, 100)} L ${corner(back - 20, 100)} Z`;
    return { x: e.x, y: e.y, deg: (a * 180) / Math.PI, back, hole };
  })();

  // Cones across the unbuilt road: halfway to the next stop if that is on a
  // straight stretch, otherwise just past the final stop, before the road
  // begins to fade.
  const cones = (() => {
    if (!serp || NOW >= STEPS.length - 1) return null;
    const straight = (p: { a: number }) => Math.abs(Math.sin(p.a)) < 0.05;
    const mid = pointAt(geo.samples, (nowLen + geo.stops[NOW + 1].len) / 2);
    const tail = pointAt(geo.samples, geo.stops[STEPS.length - 1].len + geo.spacing * 0.3);
    const c = straight(mid) ? mid : straight(tail) ? tail : null;
    if (!c) return null;
    return [-1, 1].map((side) => ({ x: c.x, y: c.y + side * (verge + 9) + (side < 0 ? 0 : 12) }));
  })();

  const panel = (
    <div
      ref={panelRef}
      role="tabpanel"
      id="journey-panel"
      aria-labelledby={`journey-tab-${active}`}
      className={wide ? "" : "absolute right-0 pr-1"}
      style={wide ? undefined : { top: geo.stops[active].y + 34, left: geo.labels[active].x }}
    >
      <InkFigure
        key={`art-${active}`}
        paths={FIGURES[step.art]}
        quiet={QUIET[step.art]}
        viewBox="0 0 120 120"
        width={wide ? 104 : 72}
        label={step.alt}
      />
      <div key={`text-${active}`} className="journey-panel-text mt-4">
        <p className="label text-ink-faint">
          {step.when} · {step.place}
        </p>
        <h3 className="mt-1 text-subhead">{step.title}</h3>
        <p className="mt-3">{step.text}</p>
        {step.href && (
          <p className="mt-3">
            <BookLink className="link" href={step.href}>
              {step.more} →
            </BookLink>
          </p>
        )}
      </div>
    </div>
  );

  const traveller = (
    <g ref={carRef} className="road-car" transform={car.transform}>
      {wide && <circle className="road-halo" r={15} />}
      <rect className="road-car-body" x={-11} y={-6} width={22} height={12} rx={4} />
      <path
        className="road-car-glass"
        d="M 2.4 -4.5 H 5.2 Q 6.9 -4.5 6.9 -2.8 V 2.8 Q 6.9 4.5 5.2 4.5 H 2.4 Z"
      />
      <rect className="road-car-roof" x={-5.2} y={-4.5} width={6.4} height={9} rx={1.6} />
      <rect className="road-car-glass" x={-8.8} y={-3.8} width={2.4} height={7.6} rx={1} />
      <circle className="road-car-lamp" cx={10.1} cy={-3.7} r={1.15} />
      <circle className="road-car-lamp" cx={10.1} cy={3.7} r={1.15} />
    </g>
  );

  return (
    <Plate
      fig={1}
      onPointerEnter={() => setEngaged(true)}
      onPointerLeave={() => setEngaged(false)}
      /* One sentence, and the clause about taking the wheel is only true
         where there is a pointer to take it with. */
      caption={
        <>
          The route so far, from mechanical engineering in Iran to explainable
          AI at Fraunhofer IOSB in Germany:{" "}
          {wide
            ? "point at a stop, take the wheel, or leave it be and it drives the route itself"
            : "tap a stop, or step through the route"}
          {" "}— the arrow keys work too.
        </>
      }
    >
      <div className={wide ? "grid grid-cols-[minmax(0,1fr)_16rem] items-start gap-10" : ""}>
        <div
          ref={boxRef}
          data-kind={geo.kind}
          className={`road relative ${drawn ? "is-drawn" : ""}`}
          style={{ height: geo.height }}
        >
          <svg
            ref={svgRef}
            width={geo.width}
            height={geo.height}
            viewBox={`0 0 ${geo.width} ${geo.height}`}
            aria-hidden="true"
            className="absolute inset-0 block"
          >
            <defs>
              {/* The stretch of road behind the car, for lighting its centre line. */}
              <mask
                id="road-travelled"
                maskUnits="userSpaceOnUse"
                x={-40}
                y={-40}
                width={geo.width + 80}
                height={geo.height + 80}
              >
                <path
                  ref={litRef}
                  d={geo.d}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={60}
                  strokeDasharray={`${geo.home.toFixed(1)} ${Math.ceil(geo.total + 40)}`}
                />
              </mask>

              {/* Past the last stop, the road fading into the paper. */}
              <linearGradient
                id="road-fade-ramp"
                gradientUnits="userSpaceOnUse"
                x1={fade.back}
                y1={0}
                x2={0}
                y2={0}
              >
                <stop offset="0" stopColor="#fff" stopOpacity={1} />
                <stop offset="1" stopColor="#fff" stopOpacity={0} />
              </linearGradient>
              {/* An alpha mask, not a luminance one: luminance is taken in
                  linear light, so a grey halfway along the ramp let through a
                  fifth of the road rather than half of it. */}
              <mask
                id="road-fade"
                style={{ maskType: "alpha" }}
                maskUnits="userSpaceOnUse"
                x={-40}
                y={-40}
                width={geo.width + 80}
                height={geo.height + 80}
              >
                <path
                  d={`M -40 -40 H ${geo.width + 40} V ${geo.height + 40} H -40 Z ${fade.hole}`}
                  fill="#fff"
                  fillRule="evenodd"
                />
                <g transform={`translate(${fade.x} ${fade.y}) rotate(${fade.deg})`}>
                  <rect
                    x={fade.back - 40}
                    y={-110}
                    width={110 - fade.back}
                    height={220}
                    fill="url(#road-fade-ramp)"
                  />
                </g>
              </mask>
            </defs>

            {/* The road: verge, tarmac, edge lines, then tarmac again inside them. */}
            <g mask="url(#road-fade)">
              <path className="road-shoulder road-draw" d={geo.d} pathLength={1} />
              <path className="road-asphalt road-draw" d={geo.d} pathLength={1} />
              <path className="road-lines road-draw" d={geo.d} pathLength={1} />
              <path className="road-asphalt road-asphalt-inner road-draw" d={geo.d} pathLength={1} />
            </g>

            <g className="road-late">
              <g mask="url(#road-fade)">
                <path className="road-centre" d={geo.d} />
                <path className="road-centre road-centre-lit" d={geo.d} mask="url(#road-travelled)" />
              </g>

              {/* Beyond today the road is only planned. This veil is not faded
                  with the road: it is paper laid over the tarmac, so it
                  vanishes as the tarmac under it does. Faded as well, the two
                  cancelled out, and the road kept its full tone to within a
                  few paces of its end. */}
              <path
                className="road-future"
                d={geo.d}
                strokeDasharray={`0 ${nowLen.toFixed(1)} ${Math.ceil(geo.total + 40)}`}
              />

              {/* the start line, and the banner the route sets off under */}
              <g
                className="road-start"
                transform={`translate(${line.x} ${line.y}) rotate(${(line.a * 180) / Math.PI})`}
              >
                <path d={`M 0 ${-verge + 3} V ${verge - 3}`} />
                <path d={`M 4 ${-verge + 3} V ${verge - 3}`} strokeDashoffset={4} />
              </g>
              <g className="road-banner" transform={`translate(${banner.x} ${banner.y})`}>
                <path
                  className="road-banner-pole"
                  d={`M ${-banner.w / 2} -3 V ${banner.foot} M ${banner.w / 2} -3 V ${banner.foot}`}
                />
                <path
                  className="road-banner-cloth"
                  d={bannerPath(banner.w, banner.h, banner.sag)}
                />
                <text y={banner.h / 2 + banner.sag / 2 + 3.2} textAnchor="middle">
                  Start
                </text>
              </g>

              {cones?.map((c, k) => (
                <g key={`cone-${k}`} className="road-cone" transform={`translate(${c.x} ${c.y})`}>
                  <path className="road-cone-body" d={CONE.body} />
                  <path className="road-cone-stripe" d={CONE.stripe} />
                  <path className="road-cone-base" d={CONE.base} />
                </g>
              ))}

              {/* Inside each U-turn, the chapter the road has just left: the
                  one belonging to the last stop before the turn, so a run of
                  two stops rather than three still finds the right scene. */}
              {geo.bends.map((b, k) => {
                const chapter = STEPS[lastStopBefore(geo, b.len)].chapter;
                if (!chapter) return null;
                const scene = SCENERY[chapter];
                return (
                  <g
                    key={`scene-${k}`}
                    ref={(el) => {
                      scenes.current[k] = el;
                    }}
                    className="road-scene"
                    transform={`translate(${b.x} ${b.y + 17})`}
                  >
                    <path className="road-ground" d={GROUND} />
                    {scene.base.map((d, j) => (
                      <path key={j} d={d} />
                    ))}
                    {scene.parts.map((part, j) => (
                      <g
                        key={j}
                        className={part.className}
                        style={
                          {
                            "--i": part.order ?? 0,
                            "--rate": part.rate ?? 0,
                          } as CSSProperties
                        }
                      >
                        {part.paths.map((d, i) => (
                          <path key={i} d={d} />
                        ))}
                      </g>
                    ))}
                  </g>
                );
              })}

              {/* On a phone the badges sit on the road, so the car passes under them. */}
              {!serp && traveller}

              {STEPS.map((s, i) => {
                const p = geo.stops[i];
                const l = geo.labels[i];
                const on = i === active;
                const city = s.place.split(",")[0];
                return (
                  <g key={s.title}>
                    <g transform={`translate(${p.x} ${p.y})`}>
                      <g
                        ref={(el) => {
                          pins.current[i] = el;
                        }}
                      >
                        <g
                          className="road-pin"
                          data-active={on || undefined}
                          data-future={s.future || undefined}
                        >
                          {serp ? (
                            <path className="road-pin-body" d={pin} />
                          ) : (
                            <circle className="road-pin-body" r={head} />
                          )}
                          <g
                            className="road-art"
                            transform={`translate(${-art / 2} ${-lift - art / 2}) scale(${art / 120})`}
                          >
                            {FIGURES[s.art].map((d, k) => (
                              <path
                                key={k}
                                d={d}
                                className={k < (QUIET[s.art] ?? 0) ? "is-quiet" : undefined}
                              />
                            ))}
                          </g>
                        </g>
                      </g>
                    </g>
                    <text
                      className="road-when"
                      data-active={on || undefined}
                      x={l.x}
                      y={l.y}
                      textAnchor={l.anchor}
                    >
                      {serp ? s.when : `${s.when} · ${city}`}
                    </text>
                    <text
                      className="road-name"
                      data-active={on || undefined}
                      x={l.x}
                      y={l.y + 18}
                      textAnchor={l.anchor}
                    >
                      {s.name}
                    </text>
                  </g>
                );
              })}

              {serp && traveller}
            </g>
          </svg>

          {/* The stops themselves: buttons over the drawing, each covering its
              pin and its label so either can be pointed at. */}
          <div
            role="tablist"
            aria-label="The route so far, 2014 to now"
            aria-orientation={wide ? "horizontal" : "vertical"}
          >
            {STEPS.map((s, i) => {
              const p = geo.stops[i];
              const box = serp
                ? {
                    left: p.x - 50,
                    top: p.y - lift - head - 10,
                    width: 100,
                    height: lift + head + 10 + 62,
                  }
                : {
                    left: p.x - head - 6,
                    top: p.y - head - 30,
                    width: geo.width - (p.x - head - 6),
                    height: head * 2 + 50,
                  };
              return (
                <button
                  key={s.title}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`journey-tab-${i}`}
                  aria-selected={i === active}
                  aria-controls="journey-panel"
                  aria-label={`${s.when}: ${s.title}, ${s.place}`}
                  tabIndex={i === active ? 0 : -1}
                  className="road-hit"
                  style={box}
                  onMouseEnter={() => {
                    if (wide && canHover && !dragging.current && i !== activeRef.current) choose(i);
                  }}
                  onFocus={() => {
                    if (i !== activeRef.current) choose(i);
                  }}
                  onClick={() => choose(i)}
                  onKeyDown={(e) => onKey(e, i)}
                />
              );
            })}
          </div>

          {/* The car's steering wheel: above the stops, so it can be taken hold
              of wherever it is parked. Pointer only — the keys do the same. */}
          {wide && (
            <div
              ref={handleRef}
              aria-hidden="true"
              className="road-handle"
              style={{ transform: `translate(${car.x.toFixed(1)}px, ${car.y.toFixed(1)}px)` }}
              onPointerDown={onGrab}
              onPointerMove={onDrag}
              onPointerUp={onDrop}
              onPointerCancel={onDrop}
              onLostPointerCapture={onDrop}
            />
          )}

          {!wide && panel}
        </div>

        {wide && <div className="sticky top-24 pt-2">{panel}</div>}
      </div>
    </Plate>
  );
}
