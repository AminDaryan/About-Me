import type { Metadata } from "next";
import type { ComponentType } from "react";
import Link from "next/link";
import Settle from "@/components/Settle";
import Entry from "@/components/Entry";
import {
  ArmIcon,
  CodeIcon,
  GlobeIcon,
  MethodIcon,
  NetworkIcon,
  ToolMark,
} from "@/components/icons";
import type { ToolKey } from "@/components/toolMarks";
import {
  Divider,
  Entries,
  ExternalLink,
  SectionTitle,
  Wrap,
} from "@/components/ui";

/* The record: what and when, one line per item, laid out to print. The why and
   the how of each project live on /research, and are linked rather than
   repeated. No phone number, no email and no referee contact details — they are
   on the PDF CV, which goes to people, not to crawlers. */

export const metadata: Metadata = {
  alternates: { canonical: "/cv" },
  title: "Curriculum Vitae",
  description:
    "Curriculum vitae of Amin Dariani — M.Sc. Automation and Control, RPTU Kaiserslautern, with a thesis on explainable AI for graph neural networks. Research at Fraunhofer IOSB, DFKI and Ferdowsi University of Mashhad.",
};

/* Quoted verbatim from the letters of recommendation, attributed as the authors
   sign them. Only the words and the professional title appear: the letters also
   carry the referees' phone numbers and email addresses, and those stay off a
   public page. */
const REFERENCES = [
  {
    quote:
      "The fact that he carried out this project from the initial idea through implementation and toward an IEEE publication demonstrates his independence, persistence, and strong potential as a researcher.",
    name: "Snehal Walunj",
    role: "Scientific Researcher, German Research Center for Artificial Intelligence (DFKI)",
    context: "supervised my master's project research",
  },
  {
    quote:
      "He is now a key member of the FUM Robotics Research Lab and has been an active participant in various teams and has definitely been an asset to our laboratory.",
    name: "Prof. Ali Reza Akbarzadeh",
    role: "Director of the FUM Robotics Research Lab, Ferdowsi University of Mashhad",
    context: "one of my B.Sc. project supervisors",
  },
];

type Module = {
  name: string;
  /** Omitted where the transcript records a pass without a grade. */
  grade?: string;
  project?: { title: string; href: string };
};

/* Grades as the RPTU transcript records them, on the German scale, for the
   modules this CV has always listed. The two project modules link to the
   projects themselves.

   A module the transcript marks *mE* — passed, no grade — leaves `grade`
   unset, and the leader simply runs on. Printing the word "passed" against a
   row of 1.3s invites the reader to fill the blank in for themselves, and they
   will not fill it in generously. */
const MODULES: Module[] = [
  { name: "Optimal Control", grade: "1.3" },
  { name: "Fault Diagnosis and Fault-Tolerant Control", grade: "1.3" },
  { name: "Modelling and Identification", grade: "1.7" },
  { name: "Cooperative Robot Control", grade: "2.0" },
  {
    name: "Master Project CAS",
    grade: "1.3",
    project: { title: "Recognising industrial activity from gaze", href: "/research#gaze" },
  },
  {
    name: "CAS Project Lab",
    project: {
      title: "Vision-guided pick-and-place with a Franka Emika Panda",
      href: "/research#pick-and-place",
    },
  },
];

/* Ferdowsi marks out of 20, converted the way the KMK's modified Bavarian
   formula does it — 1 + 3 × (20 − grade) / (20 − 10) — and then put on the step
   scale a German module grade is actually issued on: 1.0, 1.3, 1.7, 2.0, 2.3,
   2.7 and so on, nearest step, a tie going to the better mark. The step matters
   because the raw result does not exist as a German grade: a 17 of 20 converts
   to 1.9, and a reader who has only ever seen 1.7 or 2.0 reads 1.9 as a mistake
   rather than as a conversion. The raw results are in
   docs/notes/private/bsc-transcript.md beside each row.

   Four, one for each thing this degree is being cited for: the mathematics, the
   robotics, the numerical work and the control. Seven rows of 2.0s and 2.3s
   said no more than four and read as padding; a bachelor's list is supporting
   evidence for a master's that is already on the page. The names are the
   certified English transcript's own. */
const BSC_MODULES: Module[] = [
  { name: "General Mathematics I", grade: "1.0" },
  { name: "Robotics, with laboratory", grade: "2.0" },
  { name: "Numerical Computation", grade: "2.0" },
  { name: "Automatic Control", grade: "2.3" },
];

/* Five groups, each with a mark to find it by, one under the other: a single
   column is read straight down, where two columns ask the eye to choose a side
   first. The marks do the work the second column was meant to do — they give
   the eye a place to land. */
const SKILLS: {
  icon: ComponentType<{ className?: string }>;
  name: string;
  /** A tool carries its own mark where one exists and stays legible at this
      size; the rest are words, and a row mixing the two is still a row. */
  items: { name: string; mark?: ToolKey }[];
  /** Phrases rather than tool names: they take the full width, because in a
      half-width column they wrap and a wrapped phrase reads worse than a long
      line does. Each begins with a capital, as the tool names either side of
      them do — a column where four rows start small and one starts large reads
      as a mistake before it reads as a sentence. */
  single?: boolean;
}[] = [
  {
    icon: CodeIcon,
    name: "Programming",
    items: [
      { name: "Python", mark: "python" },
      { name: "MATLAB/Simulink" },
      { name: "JavaScript", mark: "javascript" },
    ],
  },
  {
    icon: NetworkIcon,
    name: "Machine learning and computer vision",
    items: [
      { name: "PyTorch", mark: "pytorch" },
      { name: "scikit-learn" },
      { name: "OpenCV", mark: "opencv" },
      { name: "YOLO", mark: "yolo" },
    ],
  },
  {
    icon: ArmIcon,
    name: "Robotics and AR",
    items: [
      { name: "ROS", mark: "ros" },
      { name: "MoveIt" },
      { name: "Franka Emika Panda" },
      { name: "Intel RealSense" },
      { name: "HoloLens 2" },
      { name: "Unity", mark: "unity" },
      { name: "MRTK" },
      { name: "ARETT" },
    ],
  },
  {
    // "Explainable AI" is the field this CV is applying in, not a method, and
    // the research-focus line above already names it. What belongs here is the
    // work it is done with.
    icon: MethodIcon,
    name: "Methods and models",
    single: true,
    items: [
      { name: "Attribution and graph-native explanation" },
      { name: "Graph neural networks" },
      { name: "Optimal and model-predictive control" },
      { name: "Adaptive control" },
      { name: "System identification" },
    ],
  },
  {
    icon: GlobeIcon,
    name: "Languages",
    items: [
      { name: "English — fluent (IELTS 8.0)" },
      { name: "German — B1" },
      { name: "Persian — native" },
    ],
  },
];

const PROFILES = [
  { label: "linkedin.com/in/amin-dariani", href: "https://www.linkedin.com/in/amin-dariani/" },
  { label: "github.com/AminDaryan", href: "https://github.com/AminDaryan" },
  { label: "ORCID 0009-0003-6226-2030", href: "https://orcid.org/0009-0003-6226-2030" },
];

/**
 * An institution's mark, linking to its own site. It opens in a new tab: this
 * page is a reference document, and losing your place in a CV to go and look at
 * a university is a poor trade. The link carries the name, because a mark on
 * its own tells a screen reader nothing.
 */
function MarkLink({
  href,
  name,
  mark,
}: {
  href: string;
  name: string;
  mark: string;
}) {
  return (
    <ExternalLink className="uni-link" href={href} label={`${name} website`}>
      <span className={`uni-mark ${mark}`} />
    </ExternalLink>
  );
}

/** A degree's modules: name, a dotted leader, the mark, and the project it was. */
function Modules({ items }: { items: Module[] }) {
  return (
    <div>
      <p className="label text-ink-faint">Selected modules</p>
      <ul className="grades mt-2">
        {items.map((m) => (
          <li key={m.name}>
            <span>{m.name}</span>
            <span className="grades-leader" aria-hidden="true" />
            {m.grade && (
              <span className="grades-mark">
                <span className="sr-only">grade </span>
                {m.grade}
              </span>
            )}
            {m.project && (
              <Link className="link grades-project" href={m.project.href}>
                {m.project.title} →
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CV() {
  return (
    <>
      <section className="pt-[clamp(3.5rem,9vw,7rem)] pb-4">
        <Wrap>
          <Settle>
            <p className="label text-ink-faint">Curriculum Vitae</p>
          </Settle>
          <Settle delay={0.08}>
            {/* The letterhead, and the masthead's cue to hold its own copy of
                the name back while this one is on screen. It stays because a CV
                is a document before it is a web page: the masthead and the
                footer are both `no-print`, so without these two lines the
                printed CV would carry no name and no address at all. */}
            <h1 data-page-name className="mt-2 text-title">
              Amin Dariani
            </h1>
          </Settle>
          <Settle delay={0.16}>
            <div className="mt-6 max-w-measure">
              <p>
                Kaiserslautern, Germany
                {PROFILES.map((p) => (
                  <span key={p.href}>
                    {" · "}
                    <ExternalLink href={p.href} rel="me">
                      {p.label}
                    </ExternalLink>
                  </span>
                ))}
              </p>
              <p className="mt-5">
                <span className="label block text-ink-faint">Research focus</span>
                Explainable and trustworthy machine learning — attribution and
                graph-native explanation methods, evaluated quantitatively for
                faithfulness and stability. Background in computer vision, robot
                perception and model-based control.
              </p>
            </div>
          </Settle>
        </Wrap>
      </section>

      <Divider />

      <section className="pb-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <SectionTitle num="I">Education</SectionTitle>
          </Settle>
          <Entries>
            <Entry
              id="msc"
              title="M.Sc. Automation and Control"
              when="Mar 2023 – Apr 2027 (expected)"
              where="RPTU · Kaiserslautern, Germany"
              mark={<MarkLink href="https://rptu.de/" name="RPTU" mark="uni-mark-rptu" />}
            >
              <p>
                Current average 2.1. Specialisation in Connected Automation
                Systems.
              </p>
              <p>
                <span className="text-ink">Thesis</span> (in progress) —{" "}
                <Link className="link" href="/research#thesis">
                  &ldquo;A Comparative Evaluation of Explainable AI Methods for
                  Graph Neural Network-based Remaining Useful Life
                  Prediction&rdquo;
                </Link>
                . Advisor: M. Becker, Fraunhofer IOSB / KIT IES.
              </p>
              <Modules items={MODULES} />
            </Entry>
            <Entry
              id="bsc"
              title="B.Sc. Mechanical Engineering"
              when="Sep 2014 – Sep 2019"
              where="Ferdowsi University of Mashhad"
              mark={
                <MarkLink
                  href="https://www.um.ac.ir/"
                  name="Ferdowsi University of Mashhad"
                  mark="uni-mark-fum"
                />
              }
            >
              <p>Overall grade 2.3.</p>
              <p>
                <span className="text-ink">Thesis</span> —{" "}
                <Link className="link" href="/research#pendulum">
                  &ldquo;Under-actuated Double Inverted Pendulum Control using
                  LQR, PID and Fuzzy Control&rdquo;
                </Link>
                .
              </p>
              <Modules items={BSC_MODULES} />
            </Entry>
          </Entries>
        </Wrap>
      </section>

      <section className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <SectionTitle num="II">Research experience</SectionTitle>
          </Settle>
          <Entries>
            <Entry
              title="Working Student Researcher, Explainable AI"
              when="Feb 2026 – present"
              where="Fraunhofer IOSB · Karlsruhe, Germany · supervisor: M. Becker"
              mark={
                <MarkLink
                  href="https://www.iosb.fraunhofer.de/"
                  name="Fraunhofer IOSB"
                  mark="uni-mark-fraunhofer"
                />
              }
              wideMark
            >
              <p>
                Implementing explainable-AI methods inside analysis tooling, making
                model decisions inspectable by non-ML users.
              </p>
            </Entry>
            <Entry
              title="Student Research Assistant, Gaze-based Activity Recognition"
              when="Sep 2024 – Feb 2026"
              where="German Research Center for Artificial Intelligence (DFKI) · Kaiserslautern, Germany"
              mark={
                <MarkLink
                  href="https://www.dfki.de/en/web"
                  name="DFKI"
                  mark="uni-mark-dfki"
                />
              }
              wideMark
            >
              <p>
                Gaze-based human activity recognition for industrial settings:
                study design, data collection on HoloLens 2, and evaluation of
                classification models.
              </p>
            </Entry>
            <Entry
              title="Undergraduate Research Assistant"
              when="Sep 2017 – Sep 2019"
              where="FUM Robotics Research Lab · Ferdowsi University of Mashhad"
              /* The lab's own mark rather than the university's: this post was
                 in one group inside a large university, and the degree above
                 already carries the university crest. Prof. Akbarzadeh signs
                 the letter of recommendation as director of the FUM Robotics
                 Research Lab, and the centre he directs — FUM CARE — lists the
                 FUM-Exoskeleton, which is FUME, among its own projects. */
              mark={
                <MarkLink
                  href="https://fum-care.com/"
                  name="FUM CARE, Ferdowsi University of Mashhad"
                  mark="uni-mark-fumcare"
                />
              }
              wideMark
            >
              <p>
                Adaptive tracking control on a generalised fuzzy hyperbolic model
                for FUME, a lower-limb exoskeleton for paraplegic users; validated
                on the physical robot against a tuned PID baseline. First-author
                paper at ICRoM 2019.
              </p>
            </Entry>
          </Entries>
        </Wrap>
      </section>

      <section id="publications" className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <SectionTitle num="III">Publications</SectionTitle>
          </Settle>
          <Settle>
            <div className="max-w-measure">
              <p>
                A. Amir-B.D., S. M. Tahamipour-Z., A. Akbarzadeh.{" "}
                <em>
                  &ldquo;Adaptive Tracking Control Based on GFHM for a
                  Reconfigurable Lower Limb Exoskeleton.&rdquo;
                </em>{" "}
                7th International Conference on Robotics and Mechatronics
                (ICRoM), Tehran, 20–21 November 2019, pp. 74–79.
              </p>
              <p className="mt-2 text-meta">
                <ExternalLink href="https://doi.org/10.1109/ICRoM48714.2019.9071886">
                  doi.org/10.1109/ICRoM48714.2019.9071886
                </ExternalLink>
              </p>
              <p className="label mt-8 text-ink-faint">In preparation</p>
              <p className="mt-2">
                A. Amir-B.D., S. Walunj. Manuscript on gaze-based classification
                of industrial activities from HoloLens 2 eye tracking, 2026.
              </p>
            </div>
          </Settle>
        </Wrap>
      </section>

      <section className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <SectionTitle num="IV">Selected projects</SectionTitle>
          </Settle>
          <Entries>
            <Entry
              title="Eye Movement Classification from HoloLens 2 Eye Tracking"
              when="Mar 2026"
              where="Master's project · RPTU / DFKI · advisors Prof. D. Görges, S. Walunj"
            >
              <p>
                Designed and ran the data collection in the DFKI smart factory and
                compared classifiers for recognising industrial activities from
                gaze.
              </p>
            </Entry>
            <Entry
              title="Vision-guided Pick-and-Place with a Franka Emika Panda"
              when="Winter 2024/25"
              where="Project lab · RPTU Institute of Control Systems · Prof. S. Liu, C. Cai"
            >
              <p>
                ROS system in which a 7-DOF Franka Emika Panda locates a randomly
                placed object, plans a collision-free path around static obstacles
                and transfers it to a target pose. Trained the object detector on a
                dataset I recorded and annotated.
              </p>
            </Entry>
          </Entries>
          <Settle>
            <p className="no-print mt-6">
              <Link className="link" href="/research">
                What these projects were about →
              </Link>
            </p>
          </Settle>
        </Wrap>
      </section>

      <section className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <SectionTitle num="V">Technical skills</SectionTitle>
          </Settle>
          <Settle>
            <div className="skills">
              {SKILLS.map(({ icon: Icon, name, items, single }) => (
                <div key={name} className="skill">
                  <span className="skill-mark" aria-hidden="true">
                    <Icon />
                  </span>
                  <div>
                    <p className="label text-ink-faint">{name}</p>
                    {/* One item to a row, so a name is never orphaned by a line
                        break and the marks line up in a column of their own. The
                        gutter is there whether or not the item has a mark, which
                        is what keeps the names on one edge. */}
                    <ul className="tools" data-single={single || undefined}>
                      {items.map((item) => (
                        <li key={item.name} className="tool">
                          <span className="tool-gutter" aria-hidden="true">
                            {item.mark && <ToolMark mark={item.mark} />}
                          </span>
                          {item.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </Settle>
        </Wrap>
      </section>

      <section className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <SectionTitle num="VI">Other professional experience</SectionTitle>
          </Settle>
          <Entries>
            <Entry
              id="sap"
              title="CAP Developer, Working Student"
              when="Jan 2024 – Jan 2026"
              where="SAP SE · Walldorf, Germany · Cloud Application Programming"
            />
            <Entry
              id="front-end"
              title="Senior Front-End Developer"
              when="Aug 2021 – Aug 2023"
              where="JHELY · Spain · remote"
            />
            <Entry
              title="Front-End Developer"
              when="Sep 2019 – Aug 2021"
              where="DelGate · Vancouver, Canada · remote"
            />
          </Entries>
        </Wrap>
      </section>

      <section className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <SectionTitle num="VII">References</SectionTitle>
          </Settle>
          <div className="max-w-measure">
            {REFERENCES.map((r) => (
              <Settle key={r.name}>
                <figure className="m-0 mb-10 border-l border-rule pl-6">
                  <blockquote className="m-0">
                    <p className="italic">&ldquo;{r.quote}&rdquo;</p>
                  </blockquote>
                  <figcaption className="mt-3 text-meta text-ink-soft">
                    <span className="text-ink">{r.name}</span> — {r.role};{" "}
                    {r.context}
                  </figcaption>
                </figure>
              </Settle>
            ))}
            <Settle>
              <p>
                Further references, from my master&rsquo;s project advisor at RPTU
                and my thesis supervisor at Fraunhofer IOSB, are available on
                request.
              </p>
            </Settle>
          </div>
        </Wrap>
      </section>
    </>
  );
}
