"use client";

import dynamic from "next/dynamic";

/* WebGL only ever runs in the browser, so both scenes are loaded client-side.
   The placeholder reserves the same height to keep the layout from shifting.

   Figures are numbered in reading order across the site: Fig. 1 is the route
   on the home page (components/journey), Fig. 2 and Fig. 3 are these two, both
   on /research. Both captions use the one caption style. */

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
        Fig. 2 — Seven revolute joints in the same alternating layout as the
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
        Fig. 3 — A double inverted pendulum on a cart, held upright by a
        linear-quadratic regulator. The plant is the full nonlinear model; only
        the controller is designed on the linearisation, which is what LQR
        means. The gain is found by iterating the discrete Riccati recursion in
        your browser when this page loads. Take hold of the cart or either link
        and pull: the force acts on the part you hold, through the equations of
        motion, and the controller fights you. Drag the small diamond to move the
        cart&rsquo;s target.
      </figcaption>
    </figure>
  );
}
