import BookPage from "@/components/book/BookPage";
import type { Metadata } from "next";
import Settle from "@/components/Settle";
import MarginalStudy from "@/components/beyond/MarginalStudy";
import InkTrail from "@/components/beyond/InkTrail";
import { Leaf, PageHeader, Section } from "@/components/ui";

export const metadata: Metadata = {
  alternates: { canonical: "/beyond" },
  title: "Beyond",
  description:
    "Away from the lab — philosophy, history, linguistics and psychology; the chessboard, the dance floor, the bow, the sabre and the horse.",
};

export default function Beyond() {
  return (
    <BookPage page="/beyond">
      <PageHeader
        kicker="Beyond the lab"
        title={
          <>
            What I read,
            <br />
            what I play
          </>
        }
      >
        {/* No drop cap: the initial stands three lines deep, and this is a
            two-line paragraph, so the letter hung out beneath it. */}
        <p>
          My interests have never stayed in separate rooms. This page is the
          part of me that does not fit on a CV, which is precisely why it is
          here.
        </p>
      </PageHeader>

      {/* On a wide screen a quill draws a line down the right margin as the
          page is read, past a portrait beside each paragraph marked with
          data-ink-anchor. */}
      <InkTrail>
        <Section num="I" title="Reading">
          <Leaf>
            {/* The drawings stand in the margin without a gloss. Each line
                beside them restated the paragraph it hung next to, and beside a
                drawing that already names its subject it only crowded the
                margin. Each study carries its own description for a screen
                reader. A drawing alone is a .figure-note, not a .note: the
                note's rule on a phone was drawn for a line of italic text, and
                beside a drawing it was a stray line.

                One drawing to a section, standing at the middle of the
                section's text: the paragraphs are one .leaf-text so the drawing
                has all of them to centre on. With a second drawing further
                down, each hung off the top of its own paragraph, and the two
                in a column read as a list rather than as a plate. */}
            <Settle className="figure-note">
              <MarginalStudy subject="reading" />
            </Settle>
            <div className="leaf-text">
              <Settle>
                <p className="max-w-measure">
                  I read history because I love patterns, and because I am about as
                  curious and adventurous as people come. It is the best way I know
                  to understand social behaviour and the human mind: the same
                  patterns return across centuries and empires, and underneath them
                  runs the slow evolution of what people are.
                </p>
              </Settle>

              <Settle>
                <p className="max-w-measure" data-ink-anchor="wittgenstein camus">
                  Linguistics I read for the same reason: language is another long
                  record of those patterns, and of how the human mind has changed.
                  Philosophy I read for a different one — to understand what it all
                  means, to think more logically, and to have my own intuitions, and
                  my own logic, challenged.
                </p>
              </Settle>

              <Settle>
                <p className="max-w-measure" data-ink-anchor="jung">
                  Psychology comes from the same curiosity, turned inward as well as
                  outward. I read it to understand myself and other people better,
                  and, ultimately, to understand the human brain well enough to
                  improve it.
                </p>
              </Settle>
            </div>
          </Leaf>
        </Section>

        <Section num="II" title="Chess, sport and dance">
          <Leaf>
            <Settle className="figure-note">
              <MarginalStudy subject="chess" />
            </Settle>
            <div className="leaf-text">
              <Settle>
                <p className="max-w-measure" data-ink-anchor="fischer">
                  Chess is where I am reliably humbled. I play badly enough to still
                  be learning and often enough to keep noticing the same weakness: I
                  like plans more than positions, and the board does not care what I
                  like.
                </p>
              </Settle>

              <Settle>
                <p className="max-w-measure">
                  Dancing is the exact inverse and I think that is why I need it.
                  Nothing is decided in advance, there is no plan to execute, and the
                  whole thing runs on a signal being read and answered in real time
                  by someone who cannot see your intentions, only your hands.
                </p>
              </Settle>

              <Settle>
                <p className="max-w-measure">
                  Archery, the sabre and horse riding reward the same discipline,
                  which is why I suspect I was drawn to all three. Each is a long,
                  quiet preparation followed by a commitment you cannot take back —
                  and each punishes the same fault, which is tensing at the moment
                  you most need to be still.
                </p>
              </Settle>

              <Settle>
                <p className="max-w-measure">
                  Badminton is the one I actually play every week, for no better
                  reason than that it is the best game there is. Football, volleyball
                  and table tennis round out the list — all of them, in the end,
                  excuses to be in a room with other people, moving.
                </p>
              </Settle>
            </div>
          </Leaf>
        </Section>
      </InkTrail>
    </BookPage>
  );
}
