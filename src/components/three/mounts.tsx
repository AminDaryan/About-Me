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
  loading: () => <div className="h-[21rem] w-full sm:h-[25rem]" />,
});

const PendulumScene = dynamic(() => import("./PendulumScene"), {
  ssr: false,
  loading: () => <div className="h-[19rem] w-full sm:h-[22rem]" />,
});

const CAPTION = "mt-4 max-w-measure text-meta text-ink-faint italic";

export function ArmFigure() {
  return (
    <figure className="m-0 mt-8">
      <ArmScene />
      <figcaption className={CAPTION}>
        Fig. 3 — The loop the project ran: find the cuboid wherever it has
        been put down, get a pose out of the detection, plan a path around the
        obstacle it already knows about, and set it on the one target.
      </figcaption>
    </figure>
  );
}

export function PendulumFigure() {
  return (
    <figure className="m-0">
      <PendulumScene />
      <figcaption className={CAPTION}>
        Fig. 5 — Both joints turn freely and the one motor drives the cart,
        where its arrow is, so a pull on the lower link — yours is the accent
        arrow — sends the whole machine the other way.
      </figcaption>
    </figure>
  );
}
