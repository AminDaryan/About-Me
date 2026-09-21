import BookPage from "@/components/book/BookPage";
import BookLink from "@/components/book/BookLink";
import Settle from "@/components/Settle";
import Portrait from "@/components/Portrait";
import Journey from "@/components/journey/Journey";
import { ManuscriptRegion } from "@/components/manuscript/ManuscriptMargins";
import { PageHeader, Section } from "@/components/ui";

/* The front page is not a numbered document, and its heading no longer
   pretends to be: sections I and II sat under three sections that have no
   heading at all, which reads as a numbering with the beginning missing. The
   CV and the research page are enumerated because they really are records with
   parts; this page is one piece of prose and a figure.

   The three other pages, as signposts. Each describes the kind of page it
   points at rather than listing what is filed there: an inventory is the
   page's own contents read out a section early, and it has to be kept true
   twice. Nothing here is a claim the page itself does not carry. */
const PAGES = [
  {
    href: "/cv",
    name: "Curriculum vitae",
    note: "The record in full, in order — what I studied, where I have worked, and what came of it.",
  },
  {
    href: "/research",
    name: "Research",
    note: "The work itself: what each problem was, how I went at it, and what it produced.",
  },
  {
    href: "/beyond",
    name: "Beyond",
    note: "What occupies me away from the work — what I read, and what I practise.",
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
          saying the same three syllables an inch above it. The masthead no
          longer sets the name at all — its mark carries it as an accessible
          name — so on this page the surname is in the title bar and nowhere
          else, which is on purpose: this line is for the reader. */}
      <PageHeader
        id="top"
        rail="Introduction"
        display
        title={<>Hi, I&rsquo;m Amin.</>}
        aside={<Portrait />}
      >
        <p className="text-lede italic">
          I work on robots and AI — computer vision, eye tracking and control
          of real machines — and on explaining what a model has learned.
        </p>
      </PageHeader>

      <Section id="background" rail="Background">
        <div className="leaf-text">
          <Settle>
            <p className="drop-cap">
              At the moment I am a master&rsquo;s student in Automation and
              Control at RPTU Kaiserslautern, writing my thesis with Fraunhofer
              IOSB and KIT on explaining graph neural networks. A prediction is
              only worth acting on if you can see why it was made — and on a
              graph, where what the model has learned is spread across the
              structure rather than sitting in any one place, saying what a
              prediction rests on is harder than it sounds.
            </p>
          </Settle>

          <Settle>
            <p>
              I came to this from mechanical engineering, by way of a robotics
              lab — where the work on a paraplegic exoskeleton became my first
              paper — and four years building software professionally. I came
              back to research because the questions I could not put down were
              in machine learning, perception and control, and the engineering
              habits came with me: I write research code that other people can
              actually run.
            </p>
          </Settle>
        </div>

        {/* Fig. 1 stands straight on the page's edge after the prose it
            illustrates, as Fig. 6 does on /research — in the same section, so
            the plate's own margin is the only space above it. */}
        <div id="route" data-rail="The route">
          <Journey />
        </div>
      </Section>

      {/* The page's one study hangs beside the signposts, where Amin asked for
          it on 2026-09-22, and no longer beside the portrait: the paper to the
          portrait's right is left empty, and the last screenful, three lines
          of signposts, gets the change of texture instead. */}
      <ManuscriptRegion kind="polyhedron">
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
      </ManuscriptRegion>
    </BookPage>
  );
}
