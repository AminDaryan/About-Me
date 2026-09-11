"use client";

import { useSettle } from "./Settle";

/* Marginal vignettes, drawn rather than installed.
   Each figure is a short list of hand-authored paths at the same hairline
   weight as the rules elsewhere, and each path carries pathLength={1} so the
   stroke can be dashed and drawn on without measuring anything at runtime. */

export function InkFigure({
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

/* -- Portraits -------------------------------------------------------------
   Each is traced over a public-domain picture, in that picture's coordinates
   at 500 units wide, and set small on purpose: a hand-traced face holds up
   at the size of a marginal gloss and starts to show its errors above it. */

/** Socrates, after the Roman marble head in the Vatican (Museo Pio-Clementino,
 *  Inv. 314), from Jastrow's 2006 photograph.
 *
 *  The likeness is carried by what the bust exaggerates: the bald crown, the
 *  knitted brow, a snub nose as broad as it is long, and a beard of hooked
 *  locks. Drawn with a narrow bridge the nose made him anyone; drawn as
 *  straight strands the beard read as string. */
export function Socrates({ className }: { className?: string }) {
  return (
    <InkFigure
      className={className}
      label="Socrates, after a Roman marble portrait"
      viewBox="80 40 340 486"
      width={84}
      paths={[
        // crown, tuft and temple curls
        "M 106 160 C 116 110, 180 50, 250 47 C 310 47, 365 75, 390 125 C 394 133, 396 142, 396 152",
        "M 246 62 C 258 52, 270 68, 284 60 C 296 53, 306 64, 316 60",
        "M 106 160 C 90 170, 86 190, 96 200 C 84 210, 86 232, 100 240 C 94 250, 98 262, 104 268",
        "M 396 152 C 410 164, 412 182, 402 194 C 414 206, 412 230, 400 238 C 406 250, 402 262, 398 270",
        // forehead furrow and knitted brows
        "M 182 122 C 220 112, 290 110, 334 124",
        "M 137 178 C 152 164, 180 156, 206 163 C 216 166, 224 174, 229 184",
        "M 358 174 C 344 160, 316 154, 290 162 C 280 166, 272 174, 268 186",
        // eyes: lid crease, upper lid, lower lid
        "M 154 203 C 170 188, 200 186, 218 197 M 156 209 C 170 198, 196 194, 217 207 M 158 211 C 172 219, 196 220, 216 208",
        "M 346 200 C 332 186, 305 186, 289 196 M 345 208 C 332 196, 308 194, 291 207 M 344 210 C 330 219, 306 218, 292 209",
        // nose: short bridge, then alae, nostrils and tip
        "M 236 190 C 236 204, 232 216, 226 226 M 262 190 C 262 204, 266 216, 272 226",
        "M 226 226 C 208 232, 204 254, 220 257 C 228 258, 234 252, 240 252 C 245 252, 248 256, 250 256 C 252 256, 255 252, 260 252 C 266 252, 272 258, 280 257 C 296 254, 292 232, 272 226 M 234 240 C 236 228, 264 228, 266 240",
        // moustache and lower lip
        "M 247 263 C 232 261, 214 264, 202 275 C 190 287, 176 302, 168 318 M 247 263 C 262 261, 280 266, 292 277 C 302 290, 312 303, 319 318",
        "M 230 301 C 236 309, 258 309, 266 301",
        // beard, then its locks in three tiers, each hooked toward the chin
        "M 102 268 C 106 320, 118 390, 142 438 C 165 474, 200 516, 245 520 C 290 522, 330 466, 356 410 C 380 360, 398 300, 398 262",
        "M 136 322 C 126 344, 146 360, 134 384 C 128 398, 136 408, 148 406 M 362 322 C 372 344, 352 360, 364 384 C 370 398, 362 408, 350 406 M 180 326 C 170 348, 190 364, 178 388 C 172 402, 180 412, 192 410 M 318 326 C 328 348, 308 364, 320 388 C 326 402, 318 412, 306 410",
        "M 222 318 C 212 344, 234 362, 220 390 C 212 408, 222 424, 236 424 M 276 318 C 286 344, 264 362, 278 390 C 286 408, 276 424, 262 424 M 158 414 C 150 434, 168 450, 160 468 C 156 478, 164 486, 176 484 M 340 414 C 348 434, 330 450, 338 468 C 342 478, 334 486, 322 484",
        "M 202 430 C 194 452, 214 468, 204 490 C 200 500, 208 508, 220 506 M 296 430 C 304 452, 284 468, 294 490 C 298 500, 290 508, 278 506 M 249 432 C 240 458, 262 476, 250 500 C 246 508, 250 514, 256 516",
      ]}
    />
  );
}
