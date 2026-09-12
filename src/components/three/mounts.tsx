"use client";

import dynamic from "next/dynamic";

/* WebGL only ever runs in the browser, so both scenes are loaded client-side.
   The placeholder reserves the same height to keep the layout from shifting.

   Figures are numbered in reading order across the site: Fig. 1 is the route
   on the home page (components/journey), then /research runs Fig. 2 (the gaze
   study), Fig. 3 (the arm, below), Fig. 4 (the exoskeleton) and Fig. 5 (the
   pendulum, below). Adding a figure above one of these means renumbering it.
   Both captions here use the one caption style. */

const ArmScene = dynamic(() => import("./ArmScene"), {
  ssr: false,
  loading: () => <div className="h-full w-full" />,
});

const PendulumScene = dynamic(() => import("./PendulumScene"), {
  ssr: false,
  loading: () => <div className="h-[19rem] w-full sm:h-[22rem]" />,
});

const CAPTION = "mt-4 max-w-measure text-meta text-ink-faint italic";

export function ArmFigure() {
  return (
    <figure className="m-0 mt-8">
      <div className="h-[17rem] w-full sm:h-[21rem]">
        <ArmScene />
      </div>
      <figcaption className={CAPTION}>
        Fig. 3 — Seven revolute joints in the same alternating layout as the
        Franka Emika Panda used in this project: base, shoulder, upper-arm roll,
        elbow, forearm roll, wrist and flange. Forward kinematics by nested joint
        frames; the accent mark is the end effector.
      </figcaption>
    </figure>
  );
}

export function PendulumFigure() {
  return (
    <figure className="m-0">
      <PendulumScene />
      <figcaption className={CAPTION}>
        Fig. 5 — A double inverted pendulum held upright by a linear-quadratic
        regulator: both joints turn freely, and the single motor drives the cart
        along the rail, where its arrow is. Take hold of any part and pull —
        yours is the accent arrow — and watch a pull on the lower link send the
        whole machine the other way: with fewer motors than joints you cannot
        command it, only disturb it.
      </figcaption>
    </figure>
  );
}
