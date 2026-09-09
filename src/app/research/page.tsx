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
  alternates: { canonical: "/research" },
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
              title="Classifying what a person is doing from their gaze alone"
              when="2024 – 2026"
              where="DFKI Kaiserslautern · master's project, Institute of Electromobility, RPTU"
            >
              <p>
                Where someone looks is a remarkably strong signal about what they
                are doing, and it is available before they act. This work
                classified human activity from gaze, which is a good problem
                precisely because the input is so sparse: a scanpath carries far
                less information than a video frame, but it sits much closer to
                intent.
              </p>
              <p>
                A HoloLens 2 supplied the eye tracking, through a capture
                application I built after the obvious off-the-shelf route turned
                out to sample too slowly to be useful. Volunteers performed four
                ordinary industrial activities in the DFKI smart factory —
                walking, waiting, using a tool, assembling. Walking and waiting
                are the awkward pair, and they were chosen for exactly that:
                nobody is looking at anything in particular, so the gaze is at
                its least structured.
              </p>
              <p>
                Features drawn from the blinks and the fixations fed a set of
                classifiers. The more instructive result is the one that failed:
                the recurrent model I added to the inherited methods lost, and
                kept losing. The dataset is small, which is not what such a model
                wants, and manufacturing more of it synthetically made things
                worse rather than better.
              </p>
            </Entry>
            <Entry
              title="Pick-and-place with a Franka Emika Panda and an RGB-D camera"
              when="Winter semester 2024/25"
              where="Project lab, Connected Automation Systems · Institute of Control Systems, RPTU Kaiserslautern"
            >
              <p>
                A four-person project lab, and a full perception-to-manipulation
                loop on real hardware: find a cuboid placed anywhere on the
                bench, recover its pose, and have a seven-axis arm pick it up and
                set it down elsewhere without touching the obstacles it already
                knows about.
              </p>
              <p>
                Pose is the interesting half. A custom-trained YOLO detector
                finds the cuboid in the colour frame; corners taken from inside
                that box are solved against a CAD model of the object with PnP,
                and the estimate is steadied over several frames before the
                planner is allowed to act on it. Motion planning runs through
                MoveIt, with fallbacks for the poses a single planner cannot
                reach — which, for this task, is often.
              </p>
              <p>
                The instructive part of a project like this is never the detector
                — it is everything between a bounding box and a gripper that
                closes in the right place.
              </p>
            </Entry>
            <Entry
              title="Paraplegic lower-limb exoskeleton — motion control"
              when="Sep 2017 – Sep 2019"
              where="Robotics Lab, Ferdowsi University of Mashhad"
            >
              <p>
                Motion control for FUME, a reconfigurable lower-limb exoskeleton
                for paraplegic users built in the lab. Alongside it, technical
                documentation for a 6R industrial manipulator.
              </p>
              <p>
                The inertia of a machine like that you can write down. The
                Coriolis and gravity terms, with a person strapped into it, you
                cannot — so the controller learns that part online instead:
                adaptive tracking built on a generalised fuzzy hyperbolic model,
                chosen because it is cheap enough to run in real time on a plant
                that is nonlinear, multi-input and permanently disturbed. It ran
                on the robot itself rather than in simulation, and outperformed a
                tuned PID.
              </p>
              <p>
                This is the work that made me a researcher: a control problem
                where the plant is a person, the failure modes are not abstract,
                and the specification is written in terms of what a human body
                can tolerate. It produced my first publication, below.
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
                A. Amir-B.D., S. M. Tahamipour-Z., A. Akbarzadeh.{" "}
                <em>
                  &ldquo;Adaptive Tracking Control Based on GFHM for a
                  Reconfigurable Lower Limb Exoskeleton.&rdquo;
                </em>{" "}
                7th International Conference on Robotics and Mechatronics
                (ICRoM), Tehran, Iran, 20–21 November 2019, pp. 74–79.
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
              <Link className="link" href="/cv">
                The full record — degrees, posts, publications →
              </Link>
            </p>
          </Settle>
        </Wrap>
      </section>
    </>
  );
}
