import BookPage from "@/components/book/BookPage";
import BookLink from "@/components/book/BookLink";
import Settle from "@/components/Settle";
import Portrait from "@/components/Portrait";
import Journey from "@/components/journey/Journey";
import { LinkedInIcon, MailIcon } from "@/components/icons";
import { ExternalLink, Leaf, PageHeader, Section } from "@/components/ui";

/* The front page is not a numbered document, and its two headings no longer
   pretend to be: sections I and II sat under three sections that have no
   heading at all, which reads as a numbering with the beginning missing. The
   CV and the research page are enumerated because they really are records with
   parts; this page is one piece of prose and a figure.

   The three other pages, as signposts. Each says what is on its page and
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
    <BookPage page="/">
      {/* The head and the background before the first heading still have
          somewhere to be pointed at: the rail reads these names, and no heading
          is added to a page that is deliberately one piece of prose.

          A greeting rather than a nameplate. The page used to open with the
          full name set large, which is how a title page addresses a committee
          and not how a person introduces themselves — and the masthead was
          saying the same three syllables an inch above it. The masthead keeps
          the full name for anyone who needs to know whose site this is; this
          line is for the reader. */}
      <PageHeader
        id="top"
        rail="Introduction"
        display
        title={<>Hi, I&rsquo;m Amin.</>}
        aside={<Portrait />}
      >
        <p className="text-lede italic">
          I work on explainable and trustworthy machine learning, with a
          background in computer vision, robot perception and model-based
          control.
        </p>
      </PageHeader>

      <Section id="background" rail="Background">
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
              IOSB and KIT on explaining graph neural networks. A prediction is
              only worth acting on if you can see why it was made — and on a
              graph, where what the model has learned is spread across the
              structure rather than sitting in any one place, saying what a
              prediction rests on is harder than it sounds.
            </p>
          </Settle>

          <Settle className="note">
            B.Sc. Mechanical Engineering,
            <br />
            Ferdowsi University of Mashhad, 2014 – 2019.
          </Settle>
          <Settle>
            <p className="max-w-measure">
              I came to this from mechanical engineering, by way of a robotics
              lab — where the work on a paraplegic exoskeleton became my first
              paper — and four years building software professionally. I came
              back to research because the questions I could not put down were
              in machine learning, perception and control, and the engineering
              habits came with me: I write research code that other people can
              actually run.
            </p>
          </Settle>
        </Leaf>

        {/* Fig. 1 stands straight on the page's edge after the prose it
            illustrates, as Fig. 6 does on /research — in the same section, so
            the plate's own margin is the only space above it. */}
        <div id="route" data-rail="The route">
          <Journey />
        </div>
      </Section>

      <Section title="Read on">
        <ul className="signposts m-0 list-none p-0">
          {PAGES.map((page) => (
            <li key={page.href}>
              <BookLink className="signpost" href={page.href}>
                <span className="signpost-name">{page.name}</span>
                <span className="signpost-note">{page.note}</span>
                <span className="signpost-arrow" aria-hidden="true">
                  →
                </span>
              </BookLink>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="contact" title="Get in touch">
        {/* On the grid with the rest of the page: running text stands on the
            inner edge, so it ends where every other section's text ends. */}
        <Leaf>
          <div className="max-w-measure">
            <p>
              I am glad to hear from anyone working on related problems — and
              especially from groups with doctoral openings.
            </p>
            {/* Two ways to reach me, as icons. The address is the university
                one, never a personal mailbox: it is published on a page this
                crawlable, and it will be harvested. Each icon link names
                itself for screen readers and shows a tooltip on hover and
                focus. No rule above them: the section's own rule is a line
                away, and a second one here read as a section of its own. */}
            <ul className="mt-6 flex list-none flex-wrap items-center gap-x-5 gap-y-8 p-0 pb-6">
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
          </div>
        </Leaf>
      </Section>
    </BookPage>
  );
}
