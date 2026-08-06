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

/** A recurve bow at full draw: limb, string pulled to the nock, arrow away. */
export function Bow({ className }: { className?: string }) {
  return (
    <InkFigure
      className={className}
      label="A drawn bow"
      viewBox="0 0 130 210"
      width={68}
      paths={[
        // limb, belly facing the archer
        "M 88 14 C 50 56, 50 154, 88 196",
        // string, drawn back to the nock
        "M 88 14 L 112 105 L 88 196",
        // arrow, pointing away
        "M 108 105 L 26 105",
        // point
        "M 26 105 L 36 100 M 26 105 L 36 110",
        // fletching
        "M 106 105 L 97 99 M 106 105 L 97 111",
        // grip
        "M 55 94 C 50 99, 50 111, 55 116",
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
      viewBox="0 0 210 120"
      width={118}
      paths={[
        // blade
        "M 30 74 C 80 30, 140 22, 186 26",
        // the point, turned back a touch
        "M 186 26 L 176 33",
        // grip
        "M 32 76 L 52 92",
        // knuckle guard, swept
        "M 30 74 C 10 78, 6 96, 20 104 C 32 110, 46 104, 52 94",
        // pommel
        "M 51.5 95 a 3.5 3.5 0 1 0 7 0 a 3.5 3.5 0 1 0 -7 0",
      ]}
    />
  );
}
