import Link from "next/link";
import Settle from "@/components/Settle";
import Portrait from "@/components/Portrait";
import Email from "@/components/Email";
import { Envelope } from "@/components/ink";
import { ArmFigure } from "@/components/three/mounts";
import { Divider, Leaf, SectionTitle, Wrap } from "@/components/ui";

const THREADS = [
  {
    h: "Perception under uncertainty",
    p: (
      <>
        Generative models are unusually good at representing what a scene{" "}
        <em>could plausibly be</em>. My thesis asks whether that helps a vehicle
        read terrain it has never seen before.
      </>
    ),
  },
  {
    h: "Explanations that hold up",
    p: (
      <>
        A model that cannot account for itself is hard to trust and harder to
        debug. My work at Fraunhofer IOSB sits in the gap between an explanation
        that satisfies a metric and one that satisfies a person.
      </>
    ),
  },
  {
    h: "Robots and the people near them",
    p: (
      <>
        Exoskeletons, gaze, cooperative control. The systems I keep returning to
        are the ones where a machine has to read a human&rsquo;s intent rather
        than follow a waypoint.
      </>
    ),
  },
];

export default function Home() {
  return (
    <>
      <section className="pt-[clamp(3.5rem,9vw,7rem)] pb-[clamp(2.5rem,6vw,4rem)]">
        <Wrap>
          <div className="grid items-start gap-[clamp(2.5rem,6vw,4rem)] md:grid-cols-[minmax(0,1fr)_15.5rem] md:gap-18">
            <div>
              <Settle>
                <p className="label text-ink-faint">Kaiserslautern, Germany</p>
              </Settle>
              <Settle delay={0.08}>
                <h1 className="mt-2 text-display tracking-[-0.028em]">
                  Amin Daryan
                </h1>
              </Settle>
              <Settle delay={0.16}>
                <p className="mt-6 max-w-[30rem] text-[clamp(1.18rem,2.4vw,1.42rem)] leading-[1.55] text-ink-soft italic">
                  I work on machine perception for robots that have to operate
                  where the world stops being tidy.
                </p>
              </Settle>
            </div>

            <Settle delay={0.24}>
              <Portrait />
            </Settle>
          </div>
        </Wrap>
      </section>

      <Divider />

      <section className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Leaf>
            <Settle className="note">
              M.Sc. Automation &amp; Control Engineering,
              <br />
              RPTU Kaiserslautern, 2023 – present.
            </Settle>
            <Settle>
              <p className="drop-cap max-w-measure text-[1.16rem] leading-[1.65] text-ink-soft">
                At the moment I am a master&rsquo;s student in Automation and
                Control Engineering at RPTU Kaiserslautern, writing my thesis on
                environment perception for off-road autonomous driving using
                diffusion models. Off-road is the interesting case. There are no
                lane markings, no map priors worth trusting, and a distribution
                that shifts with the weather, the season, and the light. It is
                where perception stops being a solved problem and starts being a
                question again.
              </p>
            </Settle>

            <Settle className="note">
              B.Sc. Mechanical Engineering,
              <br />
              Ferdowsi University of Mashhad, 2014 – 2019.
            </Settle>
            <Settle>
              <div className="copy max-w-measure">
                <p>
                  My route here was not a straight line. I trained as a
                  mechanical engineer in Mashhad and spent my undergraduate years
                  in a robotics lab working on motion control for a paraplegic
                  lower-limb exoskeleton — work that became my first publication.
                  Then I built software professionally for four years: front-end
                  and full-stack, in Vancouver, in Spain, and at SAP in Walldorf.
                </p>
                <p>
                  I came back to research because the questions I could not put
                  down were all in perception and control. The engineering habits
                  came with me, and they turned out to matter more than I
                  expected: I write research code that other people can actually
                  run.
                </p>
              </div>
            </Settle>

            <Settle className="note">Previously DFKI, 2024 – 2026.</Settle>
            <Settle>
              <p className="max-w-measure">
                Before Fraunhofer I spent a year and a half at the German
                Research Center for Artificial Intelligence (DFKI) on
                gaze-enabled activity classification — inferring what a person is
                doing from where they choose to look.
              </p>
            </Settle>
          </Leaf>
        </Wrap>
      </section>

      <section className="py-[clamp(1rem,3vw,2rem)]">
        <Wrap>
          <Settle>
            <ArmFigure />
          </Settle>
        </Wrap>
      </section>

      <section className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <SectionTitle num="I">Currently</SectionTitle>
          </Settle>
          <Settle delay={0.06}>
            <ul className="m-0 max-w-measure list-none p-0">
              <li className="py-[0.55rem]">
                <span className="text-ink">Master&rsquo;s thesis</span> —
                environment perception for off-road autonomous driving using
                diffusion models.{" "}
                <span className="text-ink-soft">
                  RPTU Kaiserslautern, ongoing.
                </span>
              </li>
              <li className="border-t border-rule-soft py-[0.55rem]">
                <span className="text-ink">Working Student Researcher</span> —
                explainable AI.{" "}
                <span className="text-ink-soft">Fraunhofer IOSB, Karlsruhe.</span>
              </li>
              <li className="border-t border-rule-soft py-[0.55rem]">
                <span className="text-ink">Looking ahead</span> — I am looking for
                a doctoral position in machine perception, learning for robotics,
                or human–robot interaction, starting after my thesis.
              </li>
            </ul>
          </Settle>
        </Wrap>
      </section>

      <section className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <SectionTitle num="II">Three threads</SectionTitle>
          </Settle>
          <div className="grid gap-10 md:grid-cols-3 md:gap-11">
            {THREADS.map((t, i) => (
              <Settle key={t.h} delay={i * 0.1}>
                <article>
                  <h3 className="mb-3 border-t border-rule pt-4 text-[1.1rem]">
                    {t.h}
                  </h3>
                  <p className="text-[0.96rem] text-ink-soft">{t.p}</p>
                </article>
              </Settle>
            ))}
          </div>
          <Settle>
            <p className="mt-10">
              <Link className="link" href="/research">
                Read about the research →
              </Link>
            </p>
          </Settle>
        </Wrap>
      </section>

      <Divider />

      <section className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <div className="max-w-measure">
              <SectionTitle num="III">Away from the desk</SectionTitle>
              <p className="text-ink-soft">
                I am a slow reader of philosophy and history, a fast and mediocre
                chess player, and I have spent more hours than I can defend on a
                badminton court. A few of the other things — the bow, the sabre,
                the horse, the dance floor — are on{" "}
                <Link className="link" href="/beyond">
                  a page of their own
                </Link>
                .
              </p>
            </div>
          </Settle>
        </Wrap>
      </section>

      <section id="contact" className="pt-[clamp(3rem,7vw,5rem)] pb-4">
        <Wrap>
          <div className="max-w-measure">
            <Settle>
              <SectionTitle num="IV">Get in touch</SectionTitle>
            </Settle>
            <Settle>
              <p className="text-ink-soft">
                I am glad to hear from anyone working on related problems — and
                especially from groups with doctoral openings.
              </p>
            </Settle>
            {/* The email is the one action that matters here, so it gets the
                weight. Everything else is a footnote to it. */}
            <Settle delay={0.08}>
              <div className="mt-9 flex items-center gap-4 border-t border-rule pt-7">
                <Envelope className="shrink-0 text-ink-faint" />
                <Email className="text-[clamp(1.2rem,2.6vw,1.55rem)] break-all" />
              </div>
            </Settle>

            <Settle delay={0.14}>
              <ul className="label mt-7 flex flex-wrap gap-x-8 gap-y-3 border-t border-rule-soft p-0 pt-5 text-ink-faint">
                <li>
                  <a
                    className="link"
                    href="https://www.linkedin.com/in/amin-daryan/"
                    rel="me noopener"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <Link className="link" href="/cv">
                    Curriculum vitae
                  </Link>
                </li>
                <li>References on request</li>
              </ul>
            </Settle>
          </div>
        </Wrap>
      </section>
    </>
  );
}
