"use client";

import { useSettle } from "./Settle";

/* Marginal vignettes, drawn rather than installed.
   Each figure is a short list of hand-authored paths at the same hairline
   weight as the rules elsewhere, and each path carries pathLength={1} so the
   stroke can be dashed and drawn on without measuring anything at runtime. */

function InkFigure({
  paths,
  viewBox,
  width,
  label,
  className = "",
}: {
  paths: string[];
  viewBox: string;
  width: number;
  label: string;
  className?: string;
}) {
  const ref = useSettle<HTMLDivElement>(0);

  return (
    <div ref={ref} className={`ink ${className}`}>
      <svg
        viewBox={viewBox}
        width={width}
        role="img"
        aria-label={label}
        style={{ height: "auto", overflow: "visible" }}
      >
        {paths.map((d, i) => (
          <path
            key={d}
            d={d}
            pathLength={1}
            // 0.22s apart, not 0.09: at the tighter stagger every stroke is in
            // flight at once and the figure assembles as a cloud of fragments
            // rather than being drawn.
            style={{ animationDelay: `${i * 0.22}s` }}
          />
        ))}
      </svg>
    </div>
  );
}

/** A bow at rest with an arrow nocked.
 *
 *  Drawn at rest, not at full draw: pulling the string adds a second curve
 *  mirroring the limb and the two close into a symmetrical lens that reads as
 *  a leaf. One curve against one dead-straight chord is what says "bow".
 *
 *  The arrow runs leftward because that is where it actually goes — the string
 *  is on the archer's side, the limb bows toward the target, and the arrow
 *  flies out through the grip. Drawn pointing the other way it reads as a
 *  dimension line across the shape.
 *
 *  Shaft, point and barbs are one path so the head grows out of the shaft as
 *  it draws. Split into separate paths, the head begins before the shaft has
 *  reached it and hangs in mid-air. */
export function Bow({ className }: { className?: string }) {
  return (
    <InkFigure
      className={className}
      label="A bow and arrow"
      viewBox="0 0 120 200"
      width={116}
      paths={[
        // limb
        "M 76 10 C 26 58, 26 142, 76 190",
        // string
        "M 76 10 L 76 190",
        // arrow: nock, shaft, then both barbs of the point
        "M 84 100 L 14 100 L 27 94 M 14 100 L 27 106",
        // fletching
        "M 68 92 L 74 108 M 75 92 L 81 108",
      ]}
    />
  );
}

/** A small envelope, for the one place on the site that wants a mark. */
export function Envelope({ className }: { className?: string }) {
  return (
    <InkFigure
      className={className}
      label=""
      viewBox="0 0 40 28"
      width={28}
      paths={["M 3 4 L 37 4 L 37 24 L 3 24 Z", "M 3 4 L 20 16 L 37 4"]}
    />
  );
}

/** A sabre: one long curved blade, a swept knuckle guard, grip and pommel. */
export function Sabre({ className }: { className?: string }) {
  return (
    <InkFigure
      className={className}
      label="A sabre"
      viewBox="0 0 160 120"
      width={150}
      paths={[
        // Blade: two converging edges meeting at the point. A single hairline
        // reads as wire and needs the width to say "blade".
        "M 54 66 C 88 38, 122 22, 150 18",
        "M 62 78 C 92 58, 124 34, 150 18",
        // Crossguard — a bar, not the closed knuckle bow, which at this size
        // became a loop big enough to swallow the blade.
        "M 34 50 L 72 88",
        // Grip and pommel, both deliberately oversized against the blade. A
        // sabre's identity lives in its hilt, and at true proportion the hilt
        // is ~20% of the length, which here is too little to survive.
        "M 24 92 L 58 72",
        "M 12 96 a 8 8 0 1 0 16 0 a 8 8 0 1 0 -16 0",
      ]}
    />
  );
}
