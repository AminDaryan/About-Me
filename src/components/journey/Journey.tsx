"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { InkFigure } from "@/components/ink";
import { FIGURES, type FigureKey } from "./figures";

/* Fig. 1 — the route so far.

   A row of dated stops on one hairline. Hovering a stop, tapping it, or moving
   to it with the keyboard shows its drawing and a short account below. It is
   built as an ARIA tablist: the stops are tabs, the panel is their tabpanel,
   and the arrow keys, Home and End move along the route — so it works the same
   with a mouse, a finger or a screen reader, and nothing depends on hover.

   Every fact here is already on /cv or /research; this figure only orders them
   in time. Keep it that way when a stop is added. */

type Step = {
  /** Short date on the rail. */
  when: string;
  /** One or two words under the stop. */
  name: string;
  place: string;
  title: string;
  text: string;
  /** The drawing. To show a photograph instead, add it to public/, add an
      `image` field here, and render an <img> with real alt text in the panel. */
  art: FigureKey;
  /** Describes the drawing for screen readers. */
  alt: string;
  href: string;
  more: string;
  future?: boolean;
};

const STEPS: Step[] = [
  {
    when: "2014",
    name: "B.Sc.",
    place: "Mashhad, Iran",
    title: "B.Sc. Mechanical Engineering",
    text: "I started a degree in mechanical engineering at Ferdowsi University of Mashhad, and with it the mechanics and control that the rest of this route builds on.",
    art: "gears",
    alt: "Two meshing gears",
    href: "/cv",
    more: "Education on the CV",
  },
  {
    when: "2017",
    name: "Robotics lab",
    place: "Mashhad, Iran",
    title: "Adaptive control of a lower-limb exoskeleton",
    text: "As an undergraduate research assistant in the Robotics Lab, I designed an adaptive controller for FUME, a lower-limb exoskeleton for paraplegic users, and tested it on the physical robot. It became my first paper, at ICRoM 2019.",
    art: "exoskeleton",
    alt: "A leg exoskeleton with hip, knee and ankle joints",
    href: "/research",
    more: "On the research page",
  },
  {
    when: "2019",
    name: "Pendulum",
    place: "Mashhad, Iran",
    title: "Bachelor thesis",
    text: "I graduated with a thesis comparing LQR, PID and fuzzy control on an under-actuated double inverted pendulum, driven only at its second joint — more degrees of freedom than actuators, and no way to cheat.",
    art: "pendulum",
    alt: "A double inverted pendulum on a fixed pivot, with a motor at its second joint",
    href: "/research",
    more: "On the research page",
  },
  {
    when: "2019",
    name: "DelGate",
    place: "Vancouver, Canada",
    title: "Front-end developer at DelGate",
    text: "I moved into industry, and to Canada, as a front-end developer, and spent two years building web products.",
    art: "code",
    alt: "A browser window showing code brackets",
    href: "/cv",
    more: "Experience on the CV",
  },
  {
    when: "2021",
    name: "JHELY",
    place: "Spain",
    title: "Senior front-end developer at JHELY",
    text: "Two more years in software, as a senior front-end developer in Spain. The engineering habits came with me when I went back to research.",
    art: "interface",
    alt: "A wireframe of a web interface",
    href: "/cv",
    more: "Experience on the CV",
  },
  {
    when: "2023",
    name: "M.Sc.",
    place: "Kaiserslautern, Germany",
    title: "M.Sc. Automation and Control",
    text: "I came back to research with a master's in Automation and Control at RPTU Kaiserslautern, specialising in Connected Automation Systems. I expect to finish in 2027.",
    art: "graduate",
    alt: "A graduation cap",
    href: "/cv",
    more: "Education on the CV",
  },
  {
    when: "2024",
    name: "SAP",
    place: "Walldorf, Germany",
    title: "Working student at SAP",
    text: "Alongside the master's, I spent two years as a working student developer at SAP, on its Cloud Application Programming model.",
    art: "cloud",
    alt: "A cloud connected to three services",
    href: "/cv",
    more: "Experience on the CV",
  },
  {
    when: "2024",
    name: "DFKI",
    place: "Kaiserslautern, Germany",
    title: "Gaze-based activity recognition at DFKI",
    text: "At the German Research Center for Artificial Intelligence I worked on recognising what people are doing from where they look. I designed and ran a study with HoloLens 2 eye tracking in the DFKI smart factory, and it became my master's project.",
    art: "gaze",
    alt: "An eye above a path of gaze fixations",
    href: "/research",
    more: "On the research page",
  },
  {
    when: "2024/25",
    name: "Franka arm",
    place: "Kaiserslautern, Germany",
    title: "Vision-guided pick-and-place",
    text: "In a four-person project lab, a seven-joint Franka Emika Panda finds an object with an RGB-D camera and moves it around obstacles. My part included training the object detector.",
    art: "arm",
    alt: "A robot arm reaching for a cube",
    href: "/research",
    more: "On the research page",
  },
  {
    when: "2026",
    name: "Fraunhofer",
    place: "Karlsruhe, Germany",
    title: "Explainable AI at Fraunhofer IOSB",
    text: "Now: a working student researcher in explainable AI, and a master's thesis comparing explanation methods for graph neural networks that predict how long a machine has left before it fails.",
    art: "graph",
    alt: "A graph whose most important node is ringed",
    href: "/research",
    more: "On the research page",
  },
  {
    when: "Next",
    name: "Doctorate",
    place: "To be decided",
    title: "A doctorate",
    text: "I am looking for a doctoral position in explainable and trustworthy machine learning, starting after my master's.",
    art: "road",
    alt: "A road leading to a flag on the horizon",
    href: "#contact",
    more: "Get in touch",
    future: true,
  },
];

/* Where the route was lived. Spans must add up to the number of stops. The last
   stop has no band: where the doctorate happens is not yet known. */
const BANDS = [
  { label: "Iran", span: 3 },
  { label: "Canada", span: 1 },
  { label: "Spain", span: 1 },
  { label: "Germany", span: 5 },
  { label: "", span: 1 },
];

/** The latest stop that has actually happened — shown before any interaction. */
const NOW = STEPS.findIndex((s) => s.name === "Fraunhofer");

export default function Journey() {
  const [active, setActive] = useState(NOW);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const track = useRef<HTMLDivElement>(null);
  const step = STEPS[active];

  /** On a phone the route is wider than the screen and scrolls sideways. Bring
      stop i into the middle of the strip by scrolling the strip itself — never
      scrollIntoView, which would also scroll the page vertically. */
  function reveal(i: number, smooth: boolean) {
    const box = track.current;
    const el = tabs.current[i];
    if (!box || !el || box.scrollWidth <= box.clientWidth) return;
    const li = el.parentElement as HTMLElement;
    const left = li.offsetLeft - (box.clientWidth - li.offsetWidth) / 2;
    box.scrollTo({ left, behavior: smooth ? "smooth" : "auto" });
  }

  // Open on the present, not on 2014: otherwise a phone shows the start of the
  // route with the highlighted stop scrolled out of sight.
  useEffect(() => reveal(NOW, false), []);

  function move(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const last = STEPS.length - 1;
    const to =
      e.key === "ArrowRight" ? Math.min(i + 1, last)
      : e.key === "ArrowLeft" ? Math.max(i - 1, 0)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (to === null) return;
    e.preventDefault();
    setActive(to);
    tabs.current[to]?.focus({ preventScroll: true });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reveal(to, !reduced);
  }

  return (
    <figure className="m-0">
      <div
        ref={track}
        className="relative -mx-5 overflow-x-auto px-5 pb-1 sm:-mx-7 sm:px-7"
        style={{ "--journey-steps": STEPS.length } as CSSProperties}
      >
        <div className="journey-grid" aria-hidden="true">
          {BANDS.map((b, i) => (
            <span
              key={i}
              className="journey-band label text-ink-faint"
              style={{ gridColumn: `span ${b.span}` }}
            >
              {b.label}
            </span>
          ))}
        </div>

        <ol
          role="tablist"
          aria-label="The route so far, 2014 to now"
          className="journey-grid m-0 list-none p-0"
        >
          {STEPS.map((s, i) => (
            <li key={s.title} role="presentation">
              <button
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`journey-tab-${i}`}
                aria-selected={i === active}
                aria-controls="journey-panel"
                /* Named explicitly: the visible year and name are separate
                   flex items, and without this a screen reader can run them
                   together as "2024DFKI". */
                aria-label={`${s.when}: ${s.title}, ${s.place}`}
                tabIndex={i === active ? 0 : -1}
                className="journey-step"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                onKeyDown={(e) => move(e, i)}
              >
                <span className="label text-ink-faint">{s.when}</span>
                <span className="journey-stop">
                  <span className="journey-dot" data-future={s.future || undefined} />
                </span>
                <span className="journey-name">{s.name}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div
        role="tabpanel"
        id="journey-panel"
        aria-labelledby={`journey-tab-${active}`}
        className="mt-7 grid items-start gap-6 border-t border-rule pt-8 sm:min-h-[13.5rem] sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-10"
      >
        {/* Keyed on the stop, so each change remounts the drawing and it draws
            itself in again rather than swapping instantly. */}
        <InkFigure
          key={`art-${active}`}
          paths={FIGURES[step.art]}
          viewBox="0 0 120 120"
          width={132}
          label={step.alt}
        />
        <div key={`text-${active}`} className="journey-panel-text max-w-measure">
          <p className="label text-ink-faint">
            {step.when} · {step.place}
          </p>
          <h3 className="mt-1 text-subhead">{step.title}</h3>
          <p className="mt-3">{step.text}</p>
          <p className="mt-3">
            <Link className="link" href={step.href}>
              {step.more} →
            </Link>
          </p>
        </div>
      </div>

      <figcaption className="mt-6 max-w-measure text-meta text-ink-faint italic">
        Fig. 1 — The route so far, from mechanical engineering in Mashhad to
        explainable AI at Fraunhofer IOSB. Hover over a stop, tap it, or move
        along it with the arrow keys.
      </figcaption>
    </figure>
  );
}
