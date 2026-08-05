"use client";

import dynamic from "next/dynamic";

/* WebGL only ever runs in the browser, so both scenes are loaded client-side.
   The placeholder reserves the same height to keep the layout from shifting. */

const ArmScene = dynamic(() => import("./ArmScene"), {
  ssr: false,
  loading: () => <div className="h-full w-full" />,
});

const PendulumScene = dynamic(() => import("./PendulumScene"), {
  ssr: false,
  loading: () => <div className="h-[19rem] w-full sm:h-[22rem]" />,
});

export function ArmFigure() {
  return (
    <figure className="m-0">
      <div className="h-[19rem] w-full sm:h-[23rem] lg:h-[26rem]">
        <ArmScene />
      </div>
      <figcaption className="label mt-2 text-ink-faint">
        Fig. 1 — 6R articulated arm; forward kinematics by nested joint frames.
        The accent mark is the end effector.
      </figcaption>
    </figure>
  );
}

export function PendulumFigure() {
  return (
    <figure className="m-0">
      <PendulumScene />
      <figcaption className="mt-4 max-w-measure text-[0.86rem] leading-relaxed text-ink-faint italic">
        Fig. 2 — A double inverted pendulum on a cart, held upright by a
        linear-quadratic regulator. The plant is the full nonlinear model; only
        the controller is designed on the linearisation, which is what LQR
        means. The gain is found by iterating the discrete Riccati recursion in
        your browser when this page loads. Drag to move the cart&rsquo;s target.
      </figcaption>
    </figure>
  );
}
