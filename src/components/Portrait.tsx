"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Offset hairline frame, a print convention. If public/portrait.jpg is not
 * there yet, falls back to a ruled empty frame rather than a broken image.
 *
 * The onError handler alone is not enough: the server-rendered <img> can
 * finish failing before React hydrates, so the event is missed entirely. The
 * effect re-checks the already-settled case (complete, but zero intrinsic
 * width) once on mount.
 */
export default function Portrait() {
  const [missing, setMissing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setMissing(true);
  }, []);

  return (
    <figure className="relative m-0 w-full max-w-[15.5rem] self-start">
      {missing ? (
        <div className="flex aspect-4/5 items-end border border-rule bg-paper-deep p-6 text-[0.76rem] leading-relaxed text-ink-faint italic">
          Portrait goes here — save the photo as public/portrait.jpg
        </div>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src="/portrait.jpg"
            alt="Portrait of Amin Daryan"
            width={600}
            height={750}
            onError={() => setMissing(true)}
            className="block w-full [filter:sepia(0.14)_saturate(0.92)_contrast(1.02)]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 translate-x-[11px] translate-y-[11px] border border-rule"
          />
        </>
      )}
    </figure>
  );
}
