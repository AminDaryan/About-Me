import type { Metadata } from "next";
import Link from "next/link";
import Settle from "@/components/Settle";
import Entry from "@/components/Entry";
import { Divider, Entries, SectionTitle, Wrap } from "@/components/ui";

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

const PROFILES = [
  { label: "linkedin.com/in/amin-dariani", href: "https://www.linkedin.com/in/amin-dariani/" },
  { label: "github.com/AminDaryan", href: "https://github.com/AminDaryan" },
  { label: "ORCID 0009-0003-6226-2030", href: "https://orcid.org/0009-0003-6226-2030" },
];

export default function CV() {
  return (
    <>
      <section className="pt-[clamp(3.5rem,9vw,7rem)] pb-4">
        <Wrap>
          <Settle>
            <p className="label text-ink-faint">Curriculum Vitae</p>
          </Settle>
          <Settle delay={0.08}>
            <h1 className="mt-2 text-title">Amin Dariani</h1>
          </Settle>
          <Settle delay={0.16}>
            <div className="mt-6 max-w-measure">
              <p>
                Kaiserslautern, Germany
                {PROFILES.map((p) => (
                  <span key={p.href}>
                    {" · "}
                    <a className="link" href={p.href} rel="me noopener">
                      {p.label}
                    </a>
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
              <p className="no-print mt-5 text-meta">
                This page is laid out for printing — use your browser&rsquo;s
                print dialog to save it as a PDF.
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
              title="M.Sc. Automation and Control"
              when="Mar 2023 – Apr 2027 (expected)"
              where="RPTU Kaiserslautern-Landau · Kaiserslautern, Germany"
            >
              <p>
                Current average 2.1 (German scale, where 1.0 is the highest).
                Specialisation in Connected Automation Systems.
              </p>
              <p>
                <span className="text-ink">Thesis</span> (in progress) —
                &ldquo;A Comparative Evaluation of Explainable AI Methods for Graph
                Neural Network-based Remaining Useful Life Prediction&rdquo;.
                Advisor: M. Becker, Fraunhofer IOSB / KIT IES.
              </p>
              <p className="text-meta">
                Selected modules: Optimal Control · Fault Diagnosis and
                Fault-Tolerant Control · Modelling and Identification · Cooperative
                Robot Control · 3D Computer Vision
              </p>
            </Entry>
            <Entry
              title="B.Sc. Mechanical Engineering"
              when="Sep 2014 – Sep 2019"
              where="Ferdowsi University of Mashhad · Mashhad, Iran"
            >
              <p>
                Overall grade 2.3 (converted to the German scale).
              </p>
              <p>
                <span className="text-ink">Thesis</span> — &ldquo;Under-actuated
                Double Inverted Pendulum Control using LQR, PID and Fuzzy
                Control&rdquo;.
              </p>
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
              where="Robotics Lab, Ferdowsi University of Mashhad · Mashhad, Iran"
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
                (ICRoM), Tehran, Iran, 20–21 November 2019, pp. 74–79.
              </p>
              <p className="mt-2 text-meta">
                <a
                  className="link"
                  href="https://doi.org/10.1109/ICRoM48714.2019.9071886"
                  rel="noopener"
                >
                  doi.org/10.1109/ICRoM48714.2019.9071886
                </a>
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
              where="Master's project · RPTU / DFKI · 15 ECTS · advisors Prof. D. Görges, S. Walunj"
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
              where="Project lab · RPTU Institute of Control Systems · 5 ECTS · team of four · Prof. S. Liu, C. Cai"
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
            <div className="copy max-w-measure">
              <p>
                <span className="label block text-ink-faint">Programming</span>
                Python · MATLAB/Simulink · JavaScript
              </p>
              <p>
                <span className="label block text-ink-faint">
                  Machine learning and computer vision
                </span>
                PyTorch · scikit-learn · OpenCV · YOLO · SHAP
              </p>
              <p>
                <span className="label block text-ink-faint">
                  Robotics and AR
                </span>
                ROS · MoveIt · Franka Emika Panda · Intel RealSense · HoloLens 2
                (Unity, MRTK, ARETT)
              </p>
              <p>
                <span className="label block text-ink-faint">Methods</span>
                Explainable AI · graph neural networks · optimal and
                model-predictive control · adaptive control · system
                identification
              </p>
              <p>
                <span className="label block text-ink-faint">Languages</span>
                English — fluent (IELTS 8.0) · German — B1 · Persian — native
              </p>
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
              title="CAP Developer, Working Student"
              when="Jan 2024 – Jan 2026"
              where="SAP SE · Walldorf, Germany · Cloud Application Programming"
            />
            <Entry
              title="Senior Front-End Developer"
              when="Aug 2021 – Aug 2023"
              where="JHELY · Spain"
            />
            <Entry
              title="Front-End Developer"
              when="Sep 2019 – Aug 2021"
              where="DelGate · Vancouver, Canada"
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
              <p className="mt-10 text-meta">
                Full name on official documents: Amin Amir Baglouee Dariani.
              </p>
            </Settle>
          </div>
        </Wrap>
      </section>
    </>
  );
}
