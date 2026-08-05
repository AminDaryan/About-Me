import type { Metadata } from "next";
import Link from "next/link";
import Settle from "@/components/Settle";
import Entry from "@/components/Entry";
import { PendulumFigure } from "@/components/three/mounts";
import {
  Callout,
  Divider,
  Entries,
  Leaf,
  SectionTitle,
  Wrap,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Environment perception for off-road autonomous driving with diffusion models, explainable AI at Fraunhofer IOSB, gaze-enabled activity classification at DFKI, and lower-limb exoskeleton control.",
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
            <p className="drop-cap mt-8 max-w-measure text-[1.16rem] leading-[1.65] text-ink-soft">
              The thread running through my work is perception in conditions that
              break the usual assumptions — terrain no map describes, intent that
              is never stated aloud, models whose reasoning has to survive contact
              with a person who needs to trust them. I am drawn to the places
              where a system has to act on an incomplete picture, and to the
              question of how it should represent what it does not know.
            </p>
          </Settle>
        </Wrap>
      </section>

      <Divider />

      <section className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <SectionTitle num="I">Current work</SectionTitle>
          </Settle>
          <Entries>
            <Entry
              title="Environment perception for off-road autonomous driving using diffusion models"
              when="Ongoing"
              where="Master's thesis · RPTU Kaiserslautern"
            >
              <p>
                On-road autonomy leans hard on structure: lane geometry, sign
                conventions, prior maps, a distribution of scenes that repeats.
                Off-road removes almost all of it. Terrain is unlabelled and
                self-similar, traversability is a property of the surface rather
                than the paint on it, and appearance shifts with season, weather
                and time of day faster than any fixed training set can cover.
              </p>
              <p>
                My thesis investigates diffusion models as a way into that
                problem. Their appeal is that they learn a distribution over
                plausible scenes rather than a single deterministic mapping — a
                natural fit for a setting where the honest answer is often a set
                of possibilities with different likelihoods rather than one
                confident prediction.
              </p>
            </Entry>
            <Entry
              title="Explainable AI"
              when="Feb 2026 – present"
              where="Working Student Researcher · Fraunhofer IOSB, Karlsruhe"
            >
              <p>
                Research on explainable AI. The part of the problem I find most
                interesting is the gap between the two audiences an explanation
                has to serve: the evaluation metric, which wants faithfulness to
                the model, and the human being, who wants a reason they can act
                on. Those are not the same target, and a method can score well on
                one while being useless for the other.
              </p>
            </Entry>
          </Entries>
        </Wrap>
      </section>

      <section className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <SectionTitle num="II">Earlier research</SectionTitle>
          </Settle>
          <Entries>
            <Entry
              title="Gaze-enabled activity classification using machine learning"
              when="Sep 2024 – Feb 2026"
              where="Student Research Assistant · German Research Center for Artificial Intelligence (DFKI), Kaiserslautern"
            >
              <p>
                Where someone looks is a remarkably strong signal about what they
                are doing, and it is available before they act. This work
                classified human activity from gaze, which is a good problem
                precisely because the input is so sparse: a scanpath carries far
                less information than a video frame, but it sits much closer to
                intent.
              </p>
            </Entry>
            <Entry
              title="Object detection and transfer with a 6R robot and a RealSense camera"
              when="Master's project"
              where="RPTU Kaiserslautern"
            >
              <p>
                A full perception-to-manipulation loop on real hardware: detect
                objects with an RGB-D camera, resolve their pose into the
                robot&rsquo;s frame, and transfer them with a six-axis arm. The
                instructive part of a project like this is never the detector —
                it is everything between a bounding box and a gripper that closes
                in the right place.
              </p>
            </Entry>
            <Entry
              title="Paraplegic lower-limb exoskeleton — motion control"
              when="Sep 2017 – Sep 2019"
              where="Robotics Lab, Ferdowsi University of Mashhad"
            >
              <p>
                Motion control for a reconfigurable lower-limb exoskeleton for
                paraplegic users, alongside technical documentation for a 6R
                industrial manipulator. This is the work that made me a
                researcher: a control problem where the plant is a person, the
                failure modes are not abstract, and the specification is written
                in terms of what a human body can tolerate. It produced my first
                publication, below.
              </p>
            </Entry>
            <Entry
              title="Under-actuated double inverted pendulum control using LQR, PID and fuzzy control"
              when="2019"
              where="Bachelor thesis · Ferdowsi University of Mashhad"
            >
              <p>
                The classical hard case in control: more degrees of freedom than
                actuators, an unstable equilibrium, and no way to cheat. I built
                and compared three controllers on it — linear-quadratic, classical
                PID, and fuzzy — which is the most efficient way I know to learn
                what each family of controller actually buys you.
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

      <Divider />

      <section className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <SectionTitle num="III">Publication</SectionTitle>
          </Settle>
          <Settle>
            <div className="max-w-measure">
              <p>
                A. Amir-B.D., S. M. Tahamipour, A. Akbarzadeh.{" "}
                <em>
                  &ldquo;Adaptive Tracking Control Based on GFHM for a
                  Reconfigurable Lower Limb Exoskeleton.&rdquo;
                </em>{" "}
                7th International Conference on Robotics and Mechatronics
                (ICRoM), Tehran, Iran, November 2019.
              </p>
              <p className="mt-3 text-[0.9rem]">
                <a
                  className="link"
                  href="https://doi.org/10.1109/ICRoM48714.2019.9071886"
                  rel="noopener"
                >
                  doi.org/10.1109/ICRoM48714.2019.9071886
                </a>
              </p>
            </div>
          </Settle>
        </Wrap>
      </section>

      <section className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <SectionTitle num="IV">Tools of the trade</SectionTitle>
          </Settle>
          <Leaf>
            <Settle className="note">
              Plus a working knowledge of production software engineering —
              version control, review, testing — from four years of building it
              for a living.
            </Settle>
            <Settle>
              <p className="max-w-measure text-ink-soft">
                Python and PyTorch for everything learned; OpenCV and YOLO for
                everything seen; MATLAB for everything controlled. JavaScript,
                still, out of habit and affection.
              </p>
            </Settle>
          </Leaf>
          <Settle>
            <Callout>
              Relevant coursework — 3D Computer Vision · Cooperative Robot
              Control · Methods of Soft Control · Robotics: Kinematics and
              Dynamics
            </Callout>
          </Settle>
          <Settle>
            <p>
              <Link className="link" href="/experience">
                The engineering side of the story →
              </Link>
            </p>
          </Settle>
        </Wrap>
      </section>
    </>
  );
}
