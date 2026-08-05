import type { Metadata } from "next";
import Link from "next/link";
import Settle from "@/components/Settle";
import Entry from "@/components/Entry";
import { Divider, Entries, Leaf, SectionTitle, Wrap } from "@/components/ui";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Professional experience of Amin Daryan: Fraunhofer IOSB, DFKI, SAP, and four years as a front-end and full-stack developer in Canada and Spain.",
};

export default function Experience() {
  return (
    <>
      <section className="pt-[clamp(3.5rem,9vw,7rem)] pb-[clamp(2.5rem,6vw,4rem)]">
        <Wrap>
          <Settle>
            <p className="label text-ink-faint">Experience</p>
          </Settle>
          <Settle delay={0.08}>
            <h1 className="mt-2 text-title">Two tracks, one habit</h1>
          </Settle>
          <Settle delay={0.16}>
            <p className="drop-cap mt-8 max-w-measure text-[1.16rem] leading-[1.65] text-ink-soft">
              For four years I was a working software engineer, not a researcher.
              I shipped products that people paid for, in teams, on deadlines, in
              three countries. I used to think of that period as an interruption.
              I have stopped: it is the reason my research code has tests, the
              reason I can hand a pipeline to somebody else and have it still run,
              and the reason I am comfortable being the person who makes the messy
              engineering work.
            </p>
          </Settle>
        </Wrap>
      </section>

      <Divider />

      <section className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <SectionTitle num="I">Research institutes</SectionTitle>
          </Settle>
          <Entries>
            <Entry
              title="Fraunhofer IOSB"
              when="Feb 2026 – present"
              where="Working Student Researcher · Karlsruhe, Germany"
            >
              <p>Research on explainable AI.</p>
            </Entry>
            <Entry
              title="German Research Center for Artificial Intelligence (DFKI)"
              when="Sep 2024 – Feb 2026"
              where="Student Research Assistant · Kaiserslautern, Germany"
            >
              <p>
                Gaze-enabled activity classification using machine learning —
                inferring what a person is doing from where they look.
              </p>
            </Entry>
            <Entry
              title="Robotics Lab, Ferdowsi University of Mashhad"
              when="Sep 2017 – Sep 2019"
              where="Student Research Assistant · Mashhad, Iran"
            >
              <p>
                Motion control for a paraplegic lower-limb exoskeleton; technical
                documentation for a 6R industrial robot.
              </p>
            </Entry>
          </Entries>
        </Wrap>
      </section>

      <section className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <SectionTitle num="II">Industry</SectionTitle>
          </Settle>
          <Entries>
            <Entry
              title="SAP SE — Release with Ease CoE"
              when="Nov 2024 – Jan 2026"
              where="CAP Developer, Working Student · Walldorf, Germany"
            >
              <p>
                Built an application for standardising requirements documentation,
                on SAP&rsquo;s Cloud Application Programming Model.
              </p>
            </Entry>
            <Entry
              title="SAP SE — Midmarket & Ecosystem Success"
              when="Jan 2024 – Jul 2024"
              where="CAP Developer, Working Student · Walldorf, Germany"
            >
              <p>Developed the DCH application using CAP.</p>
            </Entry>
            <Entry
              title="JHELY"
              when="Aug 2021 – Aug 2023"
              where="Senior Front-End Developer · Spain"
              links={[
                { label: "jhely.es", href: "https://jhely.es" },
                { label: "pppn.co.uk", href: "https://pppn.co.uk" },
              ]}
            >
              <p>
                Two years leading front-end work on customer-facing products, with
                the responsibilities that come with the senior title: architecture
                decisions, code review, and being accountable for what shipped.
              </p>
            </Entry>
            <Entry
              title="DelGate"
              when="Sep 2019 – Aug 2021"
              where="Front-End Developer · Vancouver, Canada"
              links={[
                { label: "itshere.com", href: "https://itshere.com" },
                { label: "app.itshere.com", href: "https://app.itshere.com" },
              ]}
            >
              <p>
                My first job out of the bachelor&rsquo;s, on a logistics and
                delivery platform — both the marketing site and the application
                itself.
              </p>
            </Entry>
          </Entries>
        </Wrap>
      </section>

      <Divider />

      <section className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Leaf>
            <Settle className="note">
              English — fluent, IELTS 8.0.
              <br />
              German — B1.
              <br />
              Persian — native.
            </Settle>
            <Settle>
              <div className="max-w-measure">
                <SectionTitle num="III">Languages</SectionTitle>
                <p className="text-ink-soft">
                  I have worked in English for a decade, in three countries, and I
                  am still climbing German — well past the point of getting by,
                  not yet at the point of arguing philosophy in it. That last part
                  is the goal.
                </p>
              </div>
            </Settle>
          </Leaf>
          <Settle>
            <p className="mt-10">
              <Link className="link" href="/cv">
                Full curriculum vitae →
              </Link>
            </p>
          </Settle>
        </Wrap>
      </section>
    </>
  );
}
