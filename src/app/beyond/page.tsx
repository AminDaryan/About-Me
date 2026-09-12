import type { Metadata } from "next";
import Settle from "@/components/Settle";
import MarginalStudy from "@/components/beyond/MarginalStudy";
import { Divider, Leaf, SectionTitle, Wrap } from "@/components/ui";

export const metadata: Metadata = {
  alternates: { canonical: "/beyond" },
  title: "Beyond",
  description:
    "Away from the lab — philosophy, history, linguistics and psychology; the bow, the sabre, the horse, the chessboard and the dance floor.",
};

export default function Beyond() {
  return (
    <>
      <section className="pt-[clamp(3.5rem,9vw,7rem)] pb-[clamp(2.5rem,6vw,4rem)]">
        <Wrap>
          <Settle>
            <p className="label text-ink-faint">Beyond the lab</p>
          </Settle>
          <Settle delay={0.08}>
            <h1 className="mt-2 text-title">
              What I read,
              <br />
              what I play
            </h1>
          </Settle>
          <Settle delay={0.16}>
            <p className="drop-cap mt-8 max-w-measure">
              My interests have never stayed in separate rooms. The things I read
              for pleasure keep turning up in my research, and the things I do
              with my hands keep teaching me something I could not get from a
              paper. This page is the part of me that does not fit on a CV,
              which is precisely why it is here.
            </p>
          </Settle>
        </Wrap>
      </section>

      <Divider />

      <section className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <SectionTitle num="I">Reading</SectionTitle>
          </Settle>
          <Leaf>
            <Settle className="note">
              History, for the patterns that keep repeating.
              <MarginalStudy subject="history" />
            </Settle>
            <Settle>
              <p className="max-w-measure">
                I read history because I love patterns, and because I am about as
                curious and adventurous as people come. It is the best way I know
                to understand social behaviour and the human mind: the same
                patterns return across centuries and empires, and underneath them
                runs the slow evolution of what people are.
              </p>
            </Settle>

            <Settle className="note">
              Philosophy and linguistics — one for the meaning, one for the
              patterns.
              <MarginalStudy subject="philosophy" />
            </Settle>
            <Settle>
              <div className="copy max-w-measure">
                <p>
                  Linguistics I read for the same reason: language is another long
                  record of those patterns, and of how the human mind has changed.
                  Philosophy I read for a different one — to understand what it all
                  means, to think more logically, and to have my own intuitions,
                  and my own logic, challenged.
                </p>
                <p>
                  It is not a coincidence that I ended up working on explainable
                  AI. An explanation is a translation problem before it is a
                  technical one. You can have a method that is perfectly faithful
                  to the model and still says nothing to the person who has to
                  decide whether to trust it.
                </p>
              </div>
            </Settle>

            <Settle className="note">
              Psychology — to understand myself as much as anyone else.
              <MarginalStudy subject="psychology" />
            </Settle>
            <Settle>
              <p className="max-w-measure">
                Psychology comes from the same curiosity, turned inward as well as
                outward. I read it to understand myself and other people better,
                and, ultimately, to understand the human brain well enough to
                improve it.
              </p>
            </Settle>
          </Leaf>
        </Wrap>
      </section>

      <Divider />

      <section className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <SectionTitle num="II">Sport, dance and chess</SectionTitle>
          </Settle>
          <Leaf>
            <Settle className="note">
              The bow, the sabre, the horse.
              <MarginalStudy subject="archery" />
            </Settle>
            <Settle>
              <p className="max-w-measure">
                Archery, the sabre and horse riding reward the same discipline,
                which is why I suspect I was drawn to all three. Each is a long,
                quiet preparation followed by a commitment you cannot take back —
                and each punishes the same fault, which is tensing at the moment
                you most need to be still. I have learned more about control
                engineering from a bad release than I would admit in a seminar.
              </p>
            </Settle>

            <Settle className="note">
              Salsa and bachata — the opposite skill entirely.
              <MarginalStudy subject="dance" />
            </Settle>
            <Settle>
              <p className="max-w-measure">
                Dancing is the exact inverse and I think that is why I need it.
                Nothing is decided in advance, there is no plan to execute, and the
                whole thing runs on a signal being read and answered in real time
                by someone who cannot see your intentions, only your hands. It is
                the most demanding closed loop I take part in, and the only one
                where the correct response to an error is to keep moving.
              </p>
            </Settle>

            <Settle className="note">
              Chess — where I lose most often, and most instructively.
              <MarginalStudy subject="chess" />
            </Settle>
            <Settle>
              <p className="max-w-measure">
                Chess is where I am reliably humbled. I play badly enough to still
                be learning and often enough to keep noticing the same weakness: I
                like plans more than positions, and the board does not care what I
                like.
              </p>
            </Settle>

            <Settle className="note">
              And the ordinary weekly ones.
              <MarginalStudy subject="badminton" />
            </Settle>
            <Settle>
              <p className="max-w-measure">
                Badminton is the one I actually play every week, for no better
                reason than that it is the best game there is. Football, volleyball
                and table tennis round out the list — all of them, in the end,
                excuses to be in a room with other people, moving.
              </p>
            </Settle>
          </Leaf>
        </Wrap>
      </section>
    </>
  );
}
