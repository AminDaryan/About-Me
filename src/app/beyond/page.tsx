import type { Metadata } from "next";
import Link from "next/link";
import Settle from "@/components/Settle";
import { Bow, Sabre } from "@/components/ink";
import { Callout, Divider, Leaf, SectionTitle, Wrap } from "@/components/ui";

export const metadata: Metadata = {
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
            <p className="drop-cap mt-8 max-w-measure text-[1.16rem] leading-[1.65] text-ink-soft">
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
              Philosophy and linguistics — which turn out to be the same argument,
              held from two ends.
            </Settle>
            <Settle>
              <div className="copy max-w-measure">
                <p>
                  Philosophy and linguistics arrived together and have never really
                  separated. What holds me is the question of how meaning survives
                  the trip from one mind to another at all — how much of it is
                  carried by the words, how much by everything around them, and
                  what exactly is lost on the way.
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
              History, read the way engineers read post-mortems.
            </Settle>
            <Settle>
              <p className="max-w-measure">
                I read history for the same reason I read failure reports: because
                the interesting part is never the decision itself but the state of
                the world in which it looked reasonable. Politics is the same
                material while it is still warm, and far harder to read honestly.
              </p>
            </Settle>

            <Settle className="note">
              Psychology — the discipline that keeps quietly showing up in my
              actual work.
            </Settle>
            <Settle>
              <p className="max-w-measure">
                Psychology I came to sideways, through the research. Two years of
                working on gaze will do that to you. Once you have spent that long
                treating where somebody looks as data, you cannot stop noticing how
                much of a person is legible from the outside, and how much of it
                they never chose to say.
              </p>
            </Settle>
          </Leaf>
        </Wrap>
      </section>

      <Divider />

      <section className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <SectionTitle num="II">Playing</SectionTitle>
          </Settle>
          <Leaf>
            <Settle className="note">
              The bow, the sabre, the horse.
              <Bow className="mt-6" />
              <Sabre className="mt-5" />
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
            </Settle>
            <Settle>
              <p className="max-w-measure">
                Chess is where I am reliably humbled. I play badly enough to still
                be learning and often enough to keep noticing the same weakness: I
                like plans more than positions, and the board does not care what I
                like.
              </p>
            </Settle>

            <Settle className="note">And the ordinary weekly ones.</Settle>
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

      <Divider />

      <section className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <div className="max-w-measure">
              <Callout>
                Everything above is really one interest wearing different clothes:
                how an intention gets from the inside of one system to the inside
                of another, and what it loses on the way.
              </Callout>
              <p>
                <Link className="link" href="/">
                  ← Back to the beginning
                </Link>
              </p>
            </div>
          </Settle>
        </Wrap>
      </section>
    </>
  );
}
