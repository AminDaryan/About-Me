import Link from "next/link";
import Settle from "@/components/Settle";
import Portrait from "@/components/Portrait";
import Journey from "@/components/journey/Journey";
import { LinkedInIcon, MailIcon } from "@/components/icons";
import { Divider, Leaf, SectionTitle, Wrap } from "@/components/ui";

const THREADS = [
  {
    h: "Explanations that can be checked",
    p: (
      <>
        Graph neural networks can predict how long a machine has left before it
        fails. My thesis compares the methods that explain those predictions, and
        measures whether each explanation is <em>faithful</em> and{" "}
        <em>stable</em>.
      </>
    ),
  },
  {
    h: "Explanations people can use",
    p: (
      <>
        A faithful explanation still has to be read by someone. At Fraunhofer
        IOSB I build explainable-AI methods into analysis tooling, so that people
        who are not ML specialists can see why a model decided what it did.
      </>
    ),
  },
  {
    h: "Perception and control on real hardware",
    p: (
      <>
        Where I started: recognising human activity from HoloLens 2 eye tracking,
        vision-guided manipulation with a Franka arm, and adaptive control of a
        lower-limb exoskeleton.
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
                  Amin Dariani
                </h1>
              </Settle>
              <Settle delay={0.16}>
                <p className="mt-6 max-w-[30rem] text-lede italic">
                  I work on explainable and trustworthy machine learning, with a
                  background in computer vision, robot perception and
                  model-based control.
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
              M.Sc. Automation &amp; Control,
              <br />
              RPTU Kaiserslautern, 2023 – expected 2027.
            </Settle>
            <Settle>
              <p className="drop-cap max-w-measure">
                At the moment I am a master&rsquo;s student in Automation and
                Control at RPTU Kaiserslautern, writing my thesis with Fraunhofer
                IOSB and KIT on explaining graph neural networks that predict how
                long a machine has before it fails. A prediction like that is only
                worth acting on if you can see why it was made — and it is not
                obvious which explanation method to believe. The thesis compares
                them, and measures whether each explanation reflects what the
                model actually relies on and whether it holds still when the
                input barely changes.
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
                  Then I built software professionally for four years, front-end
                  and full-stack, in Vancouver and then in Spain — and later,
                  alongside the master&rsquo;s, at SAP in Walldorf.
                </p>
                <p>
                  I came back to research because the questions I could not put
                  down were in machine learning, perception and control. The
                  engineering habits came with me, and they turned out to matter
                  more than I expected: I write research code that other people
                  can actually run.
                </p>
              </div>
            </Settle>

            <Settle className="note">Previously DFKI, 2024 – 2026.</Settle>
            <Settle>
              <p className="max-w-measure">
                Before Fraunhofer I spent a year and a half at the German
                Research Center for Artificial Intelligence (DFKI) on gaze-based
                activity recognition — inferring what a person is doing from where
                they choose to look. It became my master&rsquo;s project.
              </p>
            </Settle>
          </Leaf>
        </Wrap>
      </section>

      <section className="py-[clamp(1rem,3vw,2rem)]">
        <Wrap>
          <Settle>
            <Journey />
          </Settle>
        </Wrap>
      </section>

      <section className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <SectionTitle num="I">Currently</SectionTitle>
          </Settle>
          <Settle delay={0.06}>
            <ul className="m-0 max-w-measure list-none p-0 text-ink-soft">
              <li className="py-[0.55rem]">
                <span className="text-ink">Master&rsquo;s thesis</span> — a
                comparative evaluation of explainable AI methods for graph neural
                network-based remaining useful life prediction. Fraunhofer IOSB
                / KIT, in progress.
              </li>
              <li className="border-t border-rule-soft py-[0.55rem]">
                <span className="text-ink">Working Student Researcher</span> —
                explainable AI. Fraunhofer IOSB, Karlsruhe.
              </li>
              <li className="border-t border-rule-soft py-[0.55rem]">
                <span className="text-ink">Looking ahead</span> — I am looking for
                a doctoral position in explainable and trustworthy machine
                learning, starting after my master&rsquo;s.
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
                  <h3 className="mb-3 border-t border-rule pt-4 text-subhead">
                    {t.h}
                  </h3>
                  <p>{t.p}</p>
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
              <p>
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
              <p>
                I am glad to hear from anyone working on related problems — and
                especially from groups with doctoral openings.
              </p>
            </Settle>
            {/* Two ways to reach me, as icons. The address is the university
                one, never a personal mailbox: it is published on a page this
                crawlable, and it will be harvested. Each icon link names itself
                for screen readers and shows a tooltip on hover and focus. */}
            <Settle delay={0.08}>
              <ul className="mt-9 flex list-none flex-wrap items-center gap-x-5 gap-y-8 border-t border-rule p-0 pt-7 pb-6">
                <li>
                  <a
                    className="contact-icon"
                    href="mailto:rax06jud@rptu.de"
                    aria-label="Email: rax06jud@rptu.de"
                    data-tip="rax06jud@rptu.de"
                  >
                    <MailIcon className="h-[1.6rem] w-auto" />
                  </a>
                </li>
                <li>
                  <a
                    className="contact-icon"
                    href="https://www.linkedin.com/in/amin-dariani/"
                    rel="me noopener"
                    aria-label="LinkedIn profile"
                    data-tip="LinkedIn"
                  >
                    <LinkedInIcon className="h-[1.75rem] w-[1.75rem]" />
                  </a>
                </li>
              </ul>
            </Settle>

            <Settle delay={0.14}>
              <ul className="label mt-7 flex flex-wrap gap-x-8 gap-y-3 border-t border-rule-soft p-0 pt-5 text-ink-faint">
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
