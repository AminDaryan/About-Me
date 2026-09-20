/**
 * The site's mark: one head, split down a full-height seam, drawn by two
 * hands. The left is the head of Leonardo's Vitruvian Man — the mass of curls
 * falling past the jaw, the heavy brow, the deep-set eye, the moustache. The
 * right is a machined shell struck through the same points: the contour cut
 * straight rather than drawn, a level brow, a panel edge across the forehead
 * and a lens where the eye should be.
 *
 * On the left the hair is the silhouette and the face begins at the temple.
 * Drawn with the skull outlined underneath it as well, the head came out with
 * two contours down that side and the hair read as a hood laid over it.
 *
 * A frontal head rather than a profile: the split is the whole idea and only a
 * face-on head has a centre to split.
 *
 * Strokes only, in one ink. The mark takes `currentColor`, so the masthead
 * decides its weight and a hover costs nothing but a colour.
 */
export default function Mark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="3.5 4.5 39 39"
      width="39"
      height="39"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Four scallops from crown to jaw. Fewer and it is a hood; more and at
          masthead size the edge fills in and reads as a plain bulge. */}
      <path
        d="M23.6 6.3C17.4 5.1 11.6 6.5 9 10.5c-1.6 2.4-2 5-1.4 7.2-1.6 2.2-2 5-1 7.4-1 2.4-.6 5.2 1 7-.2 2.4 1.4 4.4 3.6 4.8 1.6.3 3-.4 3.8-1.6"
        strokeWidth="1.6"
      />
      <path d="M9.4 13.6c1.6 1.2 2.2 3.4 1.4 5.2" strokeWidth="1.3" />
      <path d="M8.2 21.2c1.6 1.2 2.2 3.4 1.4 5.2" strokeWidth="1.3" />
      <path d="M8.6 29c1.4 1 2 2.8 1.4 4.4" strokeWidth="1.3" />
      <path d="M11.5 17.2c.2-4.6 3.8-8.4 9.8-9.4" strokeWidth="1.35" />

      <path
        d="M11.3 17c-.6 3-.7 4.8-.6 6.6.3 4.4 1.3 8.8 3.7 12.4 2.4 3.6 6 5.6 9.6 5.6"
        strokeWidth="1.9"
      />
      <path
        d="M24 6.2l7 .8 4.4 4 1.8 6v6.5l-1.6 6.5-3 5.6-4.2 4.2H24"
        strokeWidth="1.9"
      />
      <path d="M24 6.6v34.8" strokeWidth="1.3" />

      <path d="M13 17.4c2.4-1.4 5.6-1.2 7.8.6" strokeWidth="1.5" />
      <path
        d="M14.2 22c1.4-2.2 4.8-2.2 6.2 0-1.4 2.2-4.8 2.2-6.2 0z"
        strokeWidth="1.35"
      />
      <circle cx="17.3" cy="22" r="1.5" fill="currentColor" stroke="none" />
      {/* Moustache and mouth in one stroke. Drawn as two, the pair sat a unit
          and a half apart and merged into a single thick bar at the size this
          is used. No nose on either half: the seam runs where the bridge would
          be and the eye reads it as one. */}
      <path d="M23.8 33.4c-1.9.1-3.3.6-4.4 1.4" strokeWidth="1.45" />

      {/* A panel edge cut across the forehead, and nothing following the curve
          of the skull. Every seam that ran with the contour combed itself into
          hair — which, with a head of real hair on the other side, made the
          thing a head parted down the middle rather than built in two
          materials. */}
      <path d="M25.2 12.4l8.6 1.4" strokeWidth="1.35" />
      {/* The cheek panel stands out on the edge of the plate. Set in under the
          lens it hung off it and read as a tear. */}
      <path d="M34.6 26.2l-1.1 4.4" strokeWidth="1.3" />
      <circle cx="30.8" cy="21.5" r="4.4" strokeWidth="1.45" />
      <circle cx="30.8" cy="21.5" r="1.9" fill="currentColor" stroke="none" />
      <path d="M26.8 16.9l7.8 1" strokeWidth="1.35" />
      <path d="M24 33.7l5.4.5" strokeWidth="1.35" />
    </svg>
  );
}
