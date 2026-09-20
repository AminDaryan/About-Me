"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import useMedia from "../useMedia";
import { Quill } from "./Quill";
import { PORTRAITS } from "./portraits";
import { drawShapes, splatter } from "./splatter";
import { planTrail, type Trail } from "./trail";
import styles from "./InkTrail.module.css";

/** Where the margin exists: the same width the section rail appears at. */
const WIDE = "(min-width: 1380px)";
/** A portrait's width; the height of its print (a four-by-five photograph in a
    5px border); and of the print and its name together, the name being held
    open for two lines, since "Ludwig Wittgenstein" will not set on one. */
const WIDTH = 118;
const PRINT = Math.round((WIDTH - 10) * 1.25) + 10;
const HEIGHT = PRINT + 48;
const GAP = 28;
/** The nib stays this far down the window: the line is drawn as far as the
    reader has read, a little ahead of the middle of the screen. */
const NIB = 0.72;

/**
 * An ink line down the right margin of the page it wraps, drawn by a quill as
 * the reader scrolls, passing the portraits of the people the page names.
 *
 * The page's own layout decides where everything goes: the line is planned
 * from where the column ends and where each anchored paragraph sits, so it
 * follows the text through any width and any change of font. Per frame it only
 * writes to the DOM — one dash offset, the quill's position and a data
 * attribute on each drop, splatter and print — and lets CSS carry the rest.
 */
export default function InkTrail({ children }: { children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const line = useRef<SVGPathElement>(null);
  const quill = useRef<SVGGElement>(null);
  /* Drawn once a visit, so the splatters fall differently each time the page
     is opened but stay where they fell while the page reflows. */
  const seed = useRef(0);
  const wide = useMedia(WIDE, false);
  const still = useMedia("(prefers-reduced-motion: reduce)", false);
  const [trail, setTrail] = useState<Trail | null>(null);

  useEffect(() => {
    const el = stage.current;
    if (!el || !wide) return;
    if (!seed.current) seed.current = crypto.getRandomValues(new Uint32Array(1))[0] || 1;
    const measure = () => {
      const box = el.getBoundingClientRect();
      const column = el.querySelector(".leaf");
      const first = el.querySelector("section");
      if (!column || !first) return;
      const anchors = PORTRAITS.flatMap((portrait) => {
        // A paragraph may carry more than one name: Wittgenstein and Camus
        // share the one on philosophy.
        const paragraph = el.querySelector(`[data-ink-anchor~="${portrait.id}"]`);
        if (!paragraph) return [];
        const { top, height } = paragraph.getBoundingClientRect();
        return [{ id: portrait.id, y: top + height / 2 - box.top, height: HEIGHT, print: PRINT }];
      });
      const next = planTrail({
        lane: { left: column.getBoundingClientRect().right - box.left + 56, right: box.width - 36 },
        top: first.getBoundingClientRect().top - box.top + 24,
        bottom: box.height,
        anchors,
        width: WIDTH,
        gap: GAP,
        seed: seed.current,
      });
      setTrail((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };
    // A ResizeObserver reports once as soon as it observes, so this is also
    // the first measurement; it runs again whenever the page reflows.
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [wide]);

  const plan = wide ? trail : null;

  useEffect(() => {
    const el = stage.current;
    const own = layer.current;
    const path = line.current;
    const nib = quill.current;
    if (!plan || !el || !own || !path || !nib) return;

    const total = path.getTotalLength();
    path.style.strokeDasharray = `${total}`;
    // Every segment runs down the page, so height gives length directly.
    const lengths: number[] = [];
    const heights: number[] = [];
    for (let s = 0; s < total; s += 3) {
      lengths.push(s);
      heights.push(path.getPointAtLength(s).y);
    }
    lengths.push(total);
    heights.push(path.getPointAtLength(total).y);
    const marks = Array.from(own.querySelectorAll<HTMLElement | SVGElement>("[data-at]"));

    let frame = 0;
    const draw = () => {
      frame = 0;
      const reached = still ? Infinity : window.innerHeight * NIB - el.getBoundingClientRect().top;
      let lo = 0;
      let hi = heights.length - 1;
      let found = -1;
      while (lo <= hi) {
        const m = (lo + hi) >> 1;
        if (heights[m] <= reached) {
          found = m;
          lo = m + 1;
        } else hi = m - 1;
      }
      const drawn = found < 0 ? 0 : lengths[found];
      path.style.strokeDashoffset = `${total - drawn}`;
      for (const mark of marks) mark.toggleAttribute("data-shown", Number(mark.dataset.at) <= reached);
      const tip = path.getPointAtLength(drawn);
      nib.setAttribute("transform", `translate(${tip.x} ${tip.y})`);
      nib.toggleAttribute("data-shown", drawn > 0 && drawn < total);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [plan, still]);

  return (
    <div ref={stage} className={styles.stage}>
      {children}
      {plan && (
        <div ref={layer} className={styles.layer}>
          <svg className={styles.svg} aria-hidden="true" focusable="false">
            <path ref={line} className={styles.line} d={plan.d} />
            {plan.drops.map((drop, i) => (
              <circle key={i} className={styles.drop} data-at={drop.y} cx={drop.x} cy={drop.y} r={drop.r} />
            ))}
            {/* Over the line, so the line runs into a pool rather than across
                it. A splatter lands as the nib comes level with its upper
                half. */}
            {plan.splatters.map((spot) => {
              const { blot, spray } = splatter(spot.seed, spot.reach);
              return (
                <g key={spot.seed} transform={`translate(${spot.x} ${spot.y})`}>
                  <g className={styles.splatter} data-at={spot.y - spot.reach / 2}>
                    <path className={styles.blot} d={drawShapes(blot)} />
                    <path className={styles.spray} d={drawShapes(spray)} />
                  </g>
                </g>
              );
            })}
          </svg>
          {plan.placements.map((placement) => {
            const portrait = PORTRAITS.find((p) => p.id === placement.id);
            if (!portrait) return null;
            return (
              <figure
                key={portrait.id}
                className={styles.portrait}
                data-at={placement.y + 24}
                style={{ left: placement.x, top: placement.y, width: WIDTH, rotate: `${portrait.tilt}deg` }}
              >
                <div className={styles.print}>
                  {/* A plain <img>: the site is a static export, and next/image
                      has no optimiser to call there. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={styles.photo}
                    src={portrait.src}
                    alt={portrait.alt}
                    width={portrait.width}
                    height={portrait.height}
                    style={{ objectPosition: portrait.focus }}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <figcaption className={`label ${styles.name}`}>{portrait.name}</figcaption>
              </figure>
            );
          })}
          {/* The quill has a sheet of its own, laid over the prints: under
              them it slid out of sight behind every photograph the line
              passed. Its feather is drawn in strokes and takes them from its
              surroundings; in an SVG that set none it came out as slivers on a
              paper-coloured body, and could not be seen at all. At 1.35 it
              stood 95px tall against a 118px print and drew the eye off the
              line it was supposed to be drawing. */}
          <svg className={styles.svg} aria-hidden="true" focusable="false">
            <g ref={quill} className={styles.quill}>
              <g transform="scale(1)" fill="none" stroke="currentColor" strokeWidth={1.15} strokeLinecap="round" strokeLinejoin="round">
                <Quill />
              </g>
            </g>
          </svg>
        </div>
      )}
    </div>
  );
}
