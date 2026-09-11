import type { FigureKey } from "./figures";
import type { SceneryKey } from "./scenery";

/* The stops on the route, in order. Every fact here is already on /cv or
   /research; this list only orders them in time. Keep it that way when a stop
   is added. */

export type Step = {
  /** A road sign with this name goes up at the first stop that has it. Only
      set where a sign is wanted; the stops before Germany deliberately name no
      country. */
  country?: string;
  /** Short date under the pin. */
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
  /** Which part of the route this stop belongs to. The scene for a chapter
      stands in the first U-turn the road makes after the chapter's last stop,
      so the scenes stay in step however many stops a run happens to hold. */
  chapter?: SceneryKey;
  /** Where the stop goes. Always a fragment as well as a page: the entry it
      names, not the page it happens to sit on. Every id is on that page. */
  href?: string;
  more?: string;
  future?: boolean;
};

export const STEPS: Step[] = [
  {
    when: "2014",
    name: "B.Sc.",
    chapter: "machine",
    place: "Mashhad",
    title: "B.Sc. Mechanical Engineering",
    text: "I started a degree in mechanical engineering at Ferdowsi University of Mashhad, and with it the mechanics and control that the rest of this route builds on.",
    art: "gears",
    alt: "Two meshing gears",
    href: "/cv#bsc",
    more: "The degree on the CV",
  },
  {
    when: "2017",
    name: "Robotics lab",
    chapter: "machine",
    place: "Mashhad",
    title: "Adaptive control of a lower-limb exoskeleton",
    text: "As an undergraduate research assistant in the Robotics Lab, I designed an adaptive controller for FUME, a lower-limb exoskeleton for paraplegic users, and tested it on the physical robot. It became my first paper, at ICRoM 2019.",
    art: "exoskeleton",
    alt: "A leg exoskeleton with hip, knee and ankle joints",
    href: "/research#exoskeleton",
    more: "The exoskeleton work",
  },
  {
    when: "2019",
    name: "Pendulum",
    chapter: "machine",
    place: "Mashhad",
    title: "Bachelor thesis",
    text: "I graduated with a thesis comparing LQR, PID and fuzzy control on an under-actuated double inverted pendulum, driven only at its second joint — more degrees of freedom than actuators, and no way to cheat.",
    art: "pendulum",
    alt: "A double inverted pendulum on a fixed pivot, with a motor at its second joint",
    href: "/research#pendulum",
    more: "The bachelor thesis",
  },
  {
    // Both front-end jobs, DelGate and then JHELY, as one stretch of road; the
    // CV has them separately. Both were remote, so no road sign for where the
    // employers were.
    when: "2019–23",
    name: "Front-end",
    chapter: "build",
    place: "Remote",
    title: "Four years in front-end development",
    text: "I moved into industry as a front-end developer, working remotely for companies in Vancouver and then in Spain, the last two years as a senior developer. The engineering habits came with me when I went back to research.",
    art: "code",
    alt: "A browser window showing code brackets",
    href: "/cv#front-end",
    more: "Both posts on the CV",
  },
  {
    country: "Germany",
    when: "2023",
    name: "M.Sc.",
    chapter: "build",
    place: "Kaiserslautern, Germany",
    title: "M.Sc. Automation and Control",
    text: "I came back to research with a master's in Automation and Control at RPTU Kaiserslautern, specialising in Connected Automation Systems. I expect to finish in 2027.",
    art: "graduate",
    alt: "A graduation cap",
    href: "/cv#msc",
    more: "Modules and grades",
  },
  {
    country: "Germany",
    when: "2024",
    name: "SAP",
    chapter: "build",
    place: "Walldorf, Germany",
    title: "Working student at SAP",
    text: "Alongside the master's, I spent two years as a working student developer at SAP, on its Cloud Application Programming model.",
    art: "cloud",
    alt: "A cloud connected to three services",
    href: "/cv#sap",
    more: "The post on the CV",
  },
  {
    country: "Germany",
    when: "2024",
    name: "DFKI",
    chapter: "learn",
    place: "Kaiserslautern, Germany",
    title: "Gaze-based activity recognition at DFKI",
    text: "At the German Research Center for Artificial Intelligence I worked on recognising what people are doing from where they look. I designed and ran a study with HoloLens 2 eye tracking in the DFKI smart factory, and it became my master's project.",
    art: "gaze",
    alt: "An eye above a path of gaze fixations",
    href: "/research#gaze",
    more: "The gaze study",
  },
  {
    country: "Germany",
    when: "2024/25",
    name: "Franka arm",
    chapter: "learn",
    place: "Kaiserslautern, Germany",
    title: "Vision-guided pick-and-place",
    text: "In a four-person project lab, a seven-joint Franka Emika Panda finds an object with an RGB-D camera and moves it around obstacles. My part included training the object detector.",
    art: "arm",
    alt: "A robot arm reaching for a cube",
    href: "/research#pick-and-place",
    more: "The project lab",
  },
  {
    country: "Germany",
    when: "2026",
    name: "Fraunhofer",
    chapter: "learn",
    place: "Karlsruhe, Germany",
    title: "Explainable AI at Fraunhofer IOSB",
    text: "Now: a working student researcher in explainable AI, and a master's thesis comparing explanation methods for graph neural networks that predict how long a machine has left before it fails.",
    art: "graph",
    alt: "A graph whose most important node is ringed",
    href: "/research#thesis",
    more: "The thesis in full",
  },
  {
    when: "Next",
    name: "Doctorate",
    place: "To be decided",
    title: "A doctorate",
    text: "I am looking for a doctoral position in artificial intelligence and robotics, starting after my master's — machine learning, perception and control, and making what they produce explainable enough to act on.",
    art: "road",
    alt: "A road leading to a flag on the horizon",
    href: "#contact",
    more: "Get in touch",
    future: true,
  },
];

/** The latest stop that has actually happened — shown before any interaction. */
export const NOW = STEPS.findIndex((s) => s.name === "Fraunhofer");
