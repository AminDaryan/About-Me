import type { Metadata } from "next";
import Settle from "@/components/Settle";
import Entry from "@/components/Entry";
import Exoskeleton from "@/components/Exoskeleton";
import Gaze from "@/components/Gaze";
import { ArmFigure, PendulumFigure } from "@/components/three/mounts";
import { Divider, Entries, SectionTitle, Wrap } from "@/components/ui";

/* This page is the why and the how; /cv is the what and the when. Nothing here
   should be a list of dates, posts, grades, skills or citations — those live on
   the CV once, and this page links to them instead of repeating them. */

export const metadata: Metadata = {
  alternates: { canonical: "/research" },
  title: "Research",
  description:
    "Explainable and trustworthy machine learning — comparing explanation methods for graph neural networks by faithfulness and stability — with earlier work on gaze-based activity recognition, vision-guided manipulation and exoskeleton control.",
};

export default function Research() {
  return (
    <>
      <section className="pt-[clamp(3.5rem,9vw,7rem)] pb-[clamp(2.5rem,6vw,4rem)]">
        <Wrap>
          <Settle>
            <p className="label text-ink-faint">Research</p>
          </Settle>
          <Settle delay={0.08}>
            <h1 className="mt-2 text-title">What I work on</h1>
          </Settle>
          <Settle delay={0.16}>
            <p className="drop-cap mt-8 max-w-measure">
              My research is about explainable and trustworthy machine learning —
              whether an explanation of a model&rsquo;s decision can be checked
              rather than simply believed. Before that, my work was in perception
              and control on real hardware: an exoskeleton, a robot arm, a
              mixed-reality headset. The two are closer than they look. In both,
              a system&rsquo;s decision is only as useful as your ability to
              verify it.
            </p>
          </Settle>
        </Wrap>
      </section>

      <Divider />

      <section className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <SectionTitle id="current-work" num="I">
              Current work
            </SectionTitle>
          </Settle>
          <Entries>
            <Entry
              id="thesis"
              title="Explaining graph neural networks that predict remaining useful life"
              when="In progress"
              where="Master's thesis · RPTU Kaiserslautern, advised at Fraunhofer IOSB and KIT"
            >
              <p>
                Remaining useful life prediction asks how long a machine or a
                component has before it fails. When a system is naturally a graph
                — sensors or components, and the relations between them — a graph
                neural network can learn from that structure directly, rather than
                from a flat table of readings.
              </p>
              <p>
                A prediction like that is only worth acting on if the person
                acting can see why it was made, and different explanation methods
                can give different answers for the same prediction. My thesis
                compares two families of them on the same models: general-purpose
                attribution methods, and explanation methods built specifically
                for graphs.
              </p>
              <p>
                The comparison is quantitative. An explanation has to earn trust
                on two counts — it should be faithful, reflecting what the model
                actually relies on, and it should be stable, so that a small
                change in the input does not produce a completely different
                story.
              </p>
            </Entry>
            <Entry
              title="Making model decisions inspectable"
              when="Ongoing"
              where="Working student researcher · Fraunhofer IOSB, Karlsruhe"
            >
              <p>
                Alongside the thesis, I implement explainable-AI methods inside
                analysis tooling, so that people who are not machine-learning
                specialists can see why a model decided what it did. It is the
                practical half of the same question. An explanation has two
                audiences — the evaluation metric, which wants faithfulness to
                the model, and the person, who wants a reason they can act on —
                and a method can satisfy one while being useless to the other.
              </p>
            </Entry>
          </Entries>
        </Wrap>
      </section>

      <section className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <SectionTitle num="II">Earlier work</SectionTitle>
          </Settle>
          <Entries>
            <Entry
              id="gaze"
              title="Recognising industrial activity from gaze"
              when="2024 – 2026"
              where="Master's project · RPTU and DFKI Kaiserslautern"
            >
              <p>
                Where someone looks is a remarkably strong signal about what they
                are doing, and it is available before they act. A scanpath
                carries far less information than a video frame, but it sits much
                closer to intent — which is what makes classifying activity from
                gaze a good problem.
              </p>
              <p>
                I designed and ran the study in the DFKI smart factory, with
                volunteers performing ordinary industrial tasks while a HoloLens 2
                tracked their eyes. The published toolchain I started from turned
                out to sample too slowly to be useful, so I moved the study onto a
                recorder built on ARETT.
              </p>
              <p>
                Tree ensembles separated the activities cleanly. The more
                instructive result was the one that failed: the recurrent model I
                added to the inherited methods lost, and kept losing — the dataset
                is small, which is not what such a model wants. A manuscript on
                the work is in preparation.
              </p>
              <Gaze />
            </Entry>
            <Entry
              id="pick-and-place"
              title="Vision-guided pick-and-place with a Franka Emika Panda"
              when="Winter 2024/25"
              where="Project lab · Institute of Control Systems, RPTU Kaiserslautern"
            >
              <p>
                A four-person project and a full perception-to-manipulation loop
                on real hardware: find an object placed anywhere on the bench,
                recover its pose, and have a seven-axis arm pick it up and set it
                down elsewhere without touching the obstacles it already knows
                about. My part included the object detector: I recorded and
                annotated its dataset and trained it.
              </p>
              <p>
                The instructive part of a project like this is never the detector.
                It is everything between a bounding box and a gripper that closes
                in the right place.
              </p>
              <ArmFigure />
            </Entry>
            <Entry
              id="exoskeleton"
              title="Adaptive control of a lower-limb exoskeleton"
              when="2017 – 2019"
              where="Undergraduate research · Robotics Lab, Ferdowsi University of Mashhad"
            >
              <p>
                FUME is a lower-limb exoskeleton for paraplegic users, built in
                the lab. The inertia of a machine like that you can write down.
                The Coriolis and gravity terms, with a person strapped into it,
                you cannot — so the controller I designed for the swing phase
                learns that part online, with a generalised fuzzy hyperbolic model
                cheap enough to run in real time. It ran on the robot itself
                rather than in simulation, and outperformed a tuned PID.
              </p>
              <p>
                This is the work that made me a researcher: a control problem
                where the plant is a person, the failure modes are not abstract,
                and the specification is written in terms of what a human body
                can tolerate. It became my first publication.
              </p>
              <Exoskeleton />
            </Entry>
            <Entry
              id="pendulum"
              title="Balancing an under-actuated double inverted pendulum"
              when="2019"
              where="Bachelor thesis · Ferdowsi University of Mashhad"
            >
              <p>
                The classical hard case in control: two links balanced upright
                with a motor at only the second joint — more degrees of freedom
                than actuators, an unstable equilibrium, and no way to cheat. I built
                and compared three controllers on it — linear-quadratic, classical
                PID and fuzzy — which is the most efficient way I know to learn
                what each family of controller actually buys you. The figure below
                runs a close relative live in your browser: a double inverted
                pendulum on a cart, the full nonlinear model held upright by an
                LQR controller, which you can take hold of and push.
              </p>
            </Entry>
          </Entries>
        </Wrap>
      </section>

      <section className="py-[clamp(1rem,3vw,2rem)]">
        <Wrap>
          <Settle>
            <PendulumFigure />
          </Settle>
        </Wrap>
      </section>
    </>
  );
}
