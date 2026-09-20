/* The parted curls, long nose and narrow eye follow the supplied Vitruvian
   head. Broad, open curls keep its silhouette legible at masthead size; the
   other half shares its proportions with a softly rounded robot shell. */
export default function Mark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="-1 1 58 58"
      width="39"
      height="39"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* The curls turn back into the hair rather than forming a smooth cap. */}
      <path
        d="M33 5.5C28 3 22 4 19 7c-5-1-9 2-9 7-4 2-5 6-3 10-4 3-4 7-1 10-3 4-2 8 1 10-1 5 2 8 6 8 2 5 7 6 11 3"
        strokeWidth="2.2"
      />
      <path d="M32.5 11.5c-2-4-7-4-9-1-1 2 0 4 2 4M22 7.5c-5 0-8 4-6 7" />
      <path d="M13 15c-3 1-3 5 0 6 3 1 4-2 3-4" />
      <path d="M10 25c-3 2-2 5 1 6 3 1 4-2 3-4" />
      <path d="M9 36c-2 2-1 5 2 5 3 0 4-3 3-5" />
      <path d="M12 46c-1 3 2 5 4 3M19 46c-2 5 0 8 3 7" />

      <path
        d="M33 15c-4 0-8 1-12 0-3 3-3 7-3 11l-1 6 2 8c2 7 7 13 14 15"
        strokeWidth="2.1"
      />
      <path d="M21 25.5c3-1.5 6-1.5 9 0" strokeWidth="2.2" />
      <path d="M21.5 30c2-2 5-2 7.5-.5-2 2-5 2-7.5.5Z" strokeWidth="1.4" />
      <path d="M25.5 29.5v1" strokeWidth="2.3" />
      <path d="M30 31c0 3-1 5-3 7l3 1" strokeWidth="1.5" />
      <path d="M26 44c2-2 4-2 7-1M28 47h5" strokeWidth="1.5" />

      {/* The shell mirrors the width of the face, excluding its curls, so
          both halves meet at the same eye line and chin. */}
      <path
        d="M33 5.5c9 0 15.5 5.5 15.5 15v16C48.5 46 42 53 33 55"
        strokeWidth="2.3"
      />
      <path d="M48.5 25h1a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-1" strokeWidth="2" />
      <path d="M33 5.5V55" strokeWidth="1.7" />
      <path d="M37 12.5h2.5c2 0 3.5 1 4.3 2.8" strokeWidth="1.6" />
      {/* A smiling lens and open smile stay friendly even at favicon size. */}
      <circle cx="40.8" cy="29.5" r="4.7" strokeWidth="1.8" />
      <path d="M38.8 30c.7-2 3.3-2 4 0" strokeWidth="1.6" />
      <path d="M40.5 37.8h2.6" strokeWidth="1.6" />
      <path d="M33 43c2.1 2.8 5.1 2.8 7.2-.2" strokeWidth="1.9" />
    </svg>
  );
}
