"use client";

import dynamic from "next/dynamic";
import { Plate } from "@/components/ui";

/* WebGL only ever runs in the browser, so both scenes are loaded client-side.
   The placeholder reserves the same height to keep the layout from shifting.

   Figures are numbered in reading order across the site: Fig. 1 is the route
   on the home page (components/journey), then /research runs Fig. 2 (the
   thesis), Fig. 3 (the gaze study), Fig. 4 (the arm, below), Fig. 5 (the
   exoskeleton) and Fig. 6 (the pendulum, below). Adding a figure above one of
   these means renumbering every figure under it — four files, last time.
   Both plates here are captioned the one way, through <Plate>. */

const ArmScene = dynamic(() => import("./ArmScene"), {
  ssr: false,
  loading: () => <div className="plate-drawing aspect-[4/3] sm:aspect-[2/1]" />,
});

const PendulumScene = dynamic(() => import("./PendulumScene"), {
  ssr: false,
  loading: () => <div className="plate-drawing h-[19rem] sm:h-[20rem]" />,
});

export function ArmFigure() {
  return (
    <Plate
      fig={4}
      caption={
        <>
          The loop the project ran: find the cuboid wherever it has been put
          down, get a pose out of the detection, plan a path around the
          obstacle it already knows about, and set it on the one target.
        </>
      }
    >
      <ArmScene />
    </Plate>
  );
}

export function PendulumFigure() {
  return (
    <Plate
      fig={6}
      caption={
        <>
          Both joints turn freely and the one motor drives the cart, where its
          arrow is, so a pull on the lower link — yours is the accent arrow —
          sends the whole machine the other way.
        </>
      }
    >
      <PendulumScene />
    </Plate>
  );
}
