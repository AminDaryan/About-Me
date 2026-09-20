import type { FigureKey } from "./figures";
import type { SceneryKey } from "./scenery";

/* The stops on the route, in order. Every fact here is already on /cv or
   /research; this list only orders them in time. Keep it that way when a stop
   is added. */

export type Step = {
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
  },
  {
    when: "2017",
    name: "Robotics lab",
    chapter: "machine",
    place: "Mashhad",
    title: "Adaptive control of a lower-limb exoskeleton",
    text: "As an undergraduate research assistant in the FUM Robotics Research Lab, I designed an adaptive controller for a lower-limb exoskeleton for paraplegic users, and tested it on the physical robot. The work became my first paper, at ICRoM 2019.",
    art: "exoskeleton",
    alt: "A person walking in a lower-limb exoskeleton, both legs braced from hip to ankle",
    href: "/research#exoskeleton",
  },
  {
    when: "2019",
    name: "Pendulum",
    chapter: "machine",
    place: "Mashhad",
    title: "Bachelor thesis",
    text: "I graduated with a thesis comparing LQR, PID and fuzzy control on an under-actuated double inverted pendulum: two joints to hold upright, and a motor at only the second.",
    art: "pendulum",
    alt: "A double inverted pendulum on a fixed pivot, with a motor at its second joint",
    href: "/research#pendulum",
  },
  {
    // Both front-end jobs, DelGate and then JHELY, as one stretch of road; the
    // CV has them separately. Both were remote, so the place is "Remote" and
    // not where the employers were.
    when: "2019–23",
    name: "Front-end",
    chapter: "build",
    place: "Remote",
    title: "Four years in front-end development",
    text: "I moved into industry as a front-end developer, working remotely for companies in Vancouver and then in Spain. The engineering habits came with me when I went back to research.",
    art: "code",
    alt: "A browser window showing code brackets",
    href: "/cv#front-end",
  },
  {
    when: "2023",
    name: "M.Sc.",
    chapter: "build",
    place: "Kaiserslautern, Germany",
    title: "M.Sc. Automation and Control",
    text: "I began a master's in Automation and Control at RPTU Kaiserslautern, specialising in Connected Automation Systems.",
    art: "graduate",
    alt: "A graduation cap",
    href: "/cv#msc",
  },
  {
    when: "2024",
    name: "SAP",
    chapter: "build",
    place: "Walldorf, Germany",
    title: "Working student at SAP",
    text: "Alongside the master's, I spent two years as a working student developer at SAP, on its Cloud Application Programming model.",
    art: "cloud",
    alt: "A cloud connected to three services",
    href: "/cv#sap",
  },
  {
    when: "2024",
    name: "DFKI",
    chapter: "learn",
    place: "Kaiserslautern, Germany",
    title: "Gaze-based activity recognition at DFKI",
    text: "At the German Research Center for Artificial Intelligence I worked on recognising what people are doing from where they look. For my master's project I designed and ran a study with HoloLens 2 eye tracking in the DFKI smart factory.",
    art: "gaze",
    alt: "An eye above a path of gaze fixations",
    href: "/research#gaze",
  },
  {
    when: "2024/25",
    name: "Franka arm",
    chapter: "learn",
    place: "Kaiserslautern, Germany",
    title: "Vision-guided pick-and-place",
    text: "In a two-person project lab, a seven-joint Franka Emika Panda finds an object with an RGB-D camera and moves it around obstacles. My part included training the object detector.",
    art: "arm",
    alt: "A robot arm reaching for a cube",
    href: "/research#pick-and-place",
  },
  {
    when: "2026",
    name: "Fraunhofer",
    chapter: "learn",
    place: "Karlsruhe, Germany",
    title: "Explainable AI at Fraunhofer IOSB",
    text: "I am a working student researcher in explainable AI, writing a master's thesis on explaining what a graph neural network's prediction rests on.",
    art: "graph",
    alt: "A graph whose most important node is ringed",
    href: "/research#thesis",
  },
  {
    when: "Next",
    name: "Doctorate",
    place: "To be decided",
    title: "A doctorate",
    text: "I am looking for a doctoral position in artificial intelligence and robotics, starting after my master's — machine learning, perception and control, and making what they produce explainable enough to act on.",
    art: "diploma",
    alt: "A rolled diploma tied with a ribbon and a seal",
    href: "#contact",
    future: true,
  },
];

/** The latest stop that has actually happened: the road is paved as far as
    here, and a drive of the whole route comes back to park here. */
export const NOW = STEPS.findIndex((s) => s.name === "Fraunhofer");
