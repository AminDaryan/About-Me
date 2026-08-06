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
            style={{ animationDelay: `${i * 0.09}s` }}
          />
        ))}
      </svg>
    </div>
  );
}

/** A bow at rest with an arrow nocked.
 *
 *  Drawn at rest, not at full draw: a pulled string is a second curve mirroring
 *  the limb, and the two close into a symmetrical lens that reads as a leaf.
 *  One curve against one straight chord is what says "bow". The arrow's ends
 *  are deliberately dissimilar — a point at one, slashed fletching at the
 *  other — so it cannot be mistaken for a dimension line. */
export function Bow({ className }: { className?: string }) {
  return (
    <InkFigure
      className={className}
      label="A bow and arrow"
      viewBox="0 0 120 200"
      width={116}
      paths={[
        // limb — deep enough that the curve, not the chord, is what you read
        "M 74 10 C 36 56, 36 144, 74 190",
        // string, dead straight
        "M 74 10 L 74 190",
        // arrow shaft
        "M 22 100 L 108 100",
        // point
        "M 108 100 L 94 94 M 108 100 L 94 106",
        // fletching, slashed across the shaft rather than mirrored as a head
        "M 28 92 L 36 108 M 38 92 L 46 108",
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
