import Link from "next/link";
import Settle from "@/components/Settle";
import Portrait from "@/components/Portrait";
import Journey from "@/components/journey/Journey";
import { LinkedInIcon, MailIcon } from "@/components/icons";
import { Divider, ExternalLink, Leaf, SectionTitle, Wrap } from "@/components/ui";

/* The three other pages, as signposts. Each says what is on its page and
   nothing that is not: the CV, research and beyond pages are the record, and a
   summary here would be a second one to keep true. */
const PAGES = [
  {
    href: "/cv",
    name: "Curriculum vitae",
    note: "Degrees and their modules, posts, publications, projects, skills and referees.",
  },
  {
    href: "/research",
    name: "Research",
    note: "The master’s thesis on explaining graph neural networks, the gaze study, the robot arm, the exoskeleton and the pendulum.",
  },
  {
    href: "/beyond",
    name: "Beyond",
    note: "History, linguistics, philosophy and psychology; archery, the sabre, horse riding, dance and chess.",
  },
];

export default function Home() {
  return (
    <>
      {/* The three sections before the first heading still have somewhere to
          be pointed at: the rail reads these names, and no heading is added to
          a page that is deliberately one piece of prose. */}
      <section
        id="top"
        data-rail="Introduction"
        className="pt-[clamp(3.5rem,9vw,7rem)] pb-[clamp(2.5rem,6vw,4rem)]"
      >
        <Wrap>
          <div className="grid items-start gap-[clamp(2.5rem,6vw,4rem)] md:grid-cols-[minmax(0,1fr)_15.5rem] md:gap-18">
            <div>
              {/* A greeting rather than a nameplate. The page used to open with
                  the full name set large, which is how a title page addresses a
                  committee and not how a person introduces themselves — and the
                  masthead was saying the same three syllables an inch above it.
                  The masthead keeps the full name for anyone who needs to know
                  whose site this is; this line is for the reader. */}
              <Settle>
                <h1 className="text-display tracking-[-0.028em]">
                  Hello — I&rsquo;m Amin.
                </h1>
              </Settle>
              <Settle delay={0.08}>
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

      <section id="background" data-rail="Background" className="py-[clamp(2.8rem,6vw,4.5rem)]">
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
                  and full-stack, working remotely for companies in Vancouver and
                  then in Spain — and later, alongside the master&rsquo;s, at SAP
                  in Walldorf.
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
                Before Fraunhofer I spent a year at the German
                Research Center for Artificial Intelligence (DFKI) on gaze-based
                activity recognition — inferring what a person is doing from where
                they choose to look. It became my master&rsquo;s project.
              </p>
            </Settle>
          </Leaf>
        </Wrap>
      </section>

      <section id="route" data-rail="The route" className="py-[clamp(1rem,3vw,2rem)]">
        <Wrap>
          <Settle>
            <Journey />
          </Settle>
        </Wrap>
      </section>

      <section className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <SectionTitle num="I">Read on</SectionTitle>
          </Settle>
          <Settle delay={0.06}>
            <ul className="m-0 max-w-measure list-none p-0">
              {PAGES.map((page, i) => (
                <li
                  key={page.href}
                  className={i ? "border-t border-rule-soft" : ""}
                >
                  <Link className="signpost" href={page.href}>
                    <span className="signpost-name">{page.name}</span>
                    <span className="signpost-note">{page.note}</span>
                    <span className="signpost-arrow" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Settle>
        </Wrap>
      </section>

      <Divider />

      <section id="contact" className="pb-4">
        <Wrap>
          <div className="max-w-measure">
            <Settle>
              <SectionTitle num="II">Get in touch</SectionTitle>
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
                  <ExternalLink
                    className="contact-icon"
                    href="https://www.linkedin.com/in/amin-dariani/"
                    rel="me"
                    label="LinkedIn profile"
                    tip="LinkedIn"
                  >
                    <LinkedInIcon className="h-[1.75rem] w-[1.75rem]" />
                  </ExternalLink>
                </li>
              </ul>
            </Settle>

          </div>
        </Wrap>
      </section>
    </>
  );
}
