import type { Metadata } from "next";
import Settle from "@/components/Settle";
import Entry from "@/components/Entry";
import Email from "@/components/Email";
import { Divider, Entries, SectionTitle, Wrap } from "@/components/ui";

export const metadata: Metadata = {
  title: "Curriculum Vitae",
  description:
    "Curriculum vitae of Amin Daryan — M.Sc. Automation and Control Engineering, RPTU Kaiserslautern. Research at Fraunhofer IOSB and DFKI; engineering at SAP, JHELY and DelGate.",
};

export default function CV() {
  return (
    <>
      <section className="pt-[clamp(3.5rem,9vw,7rem)] pb-4">
        <Wrap>
          <Settle>
            <p className="label text-ink-faint">Curriculum Vitae</p>
          </Settle>
          <Settle delay={0.08}>
            <h1 className="mt-2 text-title">Amin Daryan</h1>
          </Settle>
          <Settle delay={0.16}>
            <div className="mt-6 max-w-measure">
              <p className="text-ink-soft">
                Kaiserslautern, Germany · <Email /> ·{" "}
                <a
                  className="link"
                  href="https://www.linkedin.com/in/amin-daryan/"
                  rel="me noopener"
                >
                  linkedin.com/in/amin-daryan
                </a>
              </p>
              <p className="no-print mt-3 text-[0.9rem] text-ink-soft">
                This page is laid out for printing — use your browser&rsquo;s
                print dialog to save it as a PDF.
              </p>
            </div>
          </Settle>
        </Wrap>
      </section>

      <Divider />

      <section className="pb-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <SectionTitle num="I">Education</SectionTitle>
          </Settle>
          <Entries>
            <Entry
              title="M.Sc. Automation and Control Engineering"
              when="Mar 2023 – present"
              where="RPTU Kaiserslautern-Landau · Kaiserslautern, Germany"
            >
              <p>
                Current grade 2.1{" "}
                <span className="text-[0.9rem]">
                  (German scale, where 1.0 is the highest)
                </span>
                .
              </p>
              <p>
                <span className="text-ink">Master&rsquo;s thesis</span> —
                &ldquo;Environment perception for off-road autonomous driving
                using diffusion models&rdquo; (ongoing).
              </p>
              <p>
                <span className="text-ink">Master&rsquo;s project</span> — object
                detection and transfer with a 6R robot and a RealSense camera.
              </p>
              <p className="text-[0.9rem]">
                Selected coursework: 3D Computer Vision · Cooperative Robot
                Control · Methods of Soft Control
              </p>
            </Entry>
            <Entry
              title="B.Sc. Mechanical Engineering"
              when="Sep 2014 – Sep 2019"
              where="Ferdowsi University of Mashhad (FUM) · Mashhad, Iran"
            >
              <p>
                Overall grade 2.3{" "}
                <span className="text-[0.9rem]">
                  (converted to the German scale)
                </span>
                .
              </p>
              <p>
                <span className="text-ink">Bachelor thesis</span> —
                &ldquo;Under-actuated Double Inverted Pendulum control using LQR,
                PID, and Fuzzy control&rdquo;.
              </p>
              <p className="text-[0.9rem]">
                Selected coursework: Robotics and Laboratory · Robotics:
                Kinematics and Dynamics
              </p>
            </Entry>
          </Entries>
        </Wrap>
      </section>

      <section className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <SectionTitle num="II">Research experience</SectionTitle>
          </Settle>
          <Entries>
            <Entry
              title="Fraunhofer IOSB"
              when="Feb 2026 – present"
              where="Working Student Researcher · Karlsruhe, Germany"
            >
              <p>Research on explainable AI (XAI).</p>
            </Entry>
            <Entry
              title="German Research Center for Artificial Intelligence (DFKI)"
              when="Sep 2024 – Feb 2026"
              where="Student Research Assistant · Kaiserslautern, Germany"
            >
              <p>Gaze-enabled activity classification using machine learning.</p>
            </Entry>
            <Entry
              title="Robotics Lab, Ferdowsi University of Mashhad"
              when="Sep 2017 – Sep 2019"
              where="Student Research Assistant · Mashhad, Iran"
            >
              <p>
                Paraplegic lower-limb exoskeleton — motion control. 6R industrial
                robot — technical documentation.
              </p>
            </Entry>
          </Entries>
        </Wrap>
      </section>

      <section className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <SectionTitle num="III">Publications</SectionTitle>
          </Settle>
          <Settle>
            <div className="max-w-measure">
              <p>
                A. Amir-B.D., S. M. Tahamipour, A. Akbarzadeh.{" "}
                <em>
                  &ldquo;Adaptive Tracking Control Based on GFHM for a
                  Reconfigurable Lower Limb Exoskeleton.&rdquo;
                </em>{" "}
                7th International Conference on Robotics and Mechatronics
                (ICRoM), Tehran, Iran, November 2019.
              </p>
              <p className="mt-2 text-[0.9rem]">
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
            <SectionTitle num="IV">Professional experience</SectionTitle>
          </Settle>
          <Entries>
            <Entry
              title="SAP SE — Release with Ease CoE"
              when="Nov 2024 – Jan 2026"
              where="CAP Developer, Working Student · Walldorf, Germany"
            >
              <p>
                Developed an application for standardised requirements
                documentation.
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
            />
            <Entry
              title="DelGate"
              when="Sep 2019 – Aug 2021"
              where="Front-End Developer · Vancouver, Canada"
              links={[
                { label: "itshere.com", href: "https://itshere.com" },
                { label: "app.itshere.com", href: "https://app.itshere.com" },
              ]}
            />
          </Entries>
        </Wrap>
      </section>

      <section className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <SectionTitle num="V">Skills and languages</SectionTitle>
          </Settle>
          <Settle>
            <div className="copy max-w-measure">
              <p>
                <span className="label block text-ink-faint">Programming</span>
                Python · JavaScript · MATLAB
              </p>
              <p>
                <span className="label block text-ink-faint">
                  Machine learning
                </span>
                PyTorch · OpenCV · YOLO
              </p>
              <p>
                <span className="label block text-ink-faint">Languages</span>
                English — fluent (IELTS overall 8.0) · German — intermediate (B1)
                · Persian — native
              </p>
            </div>
          </Settle>
        </Wrap>
      </section>

      <section className="py-[clamp(2.8rem,6vw,4.5rem)]">
        <Wrap>
          <Settle>
            <SectionTitle num="VI">References</SectionTitle>
          </Settle>
          <Settle>
            <div className="max-w-measure">
              <p className="text-ink-soft">
                Three referees — my master&rsquo;s thesis supervisor at RPTU, my
                supervisor at DFKI, and my bachelor thesis supervisor at FUM — are
                glad to be contacted. I give their details on request rather than
                publishing their contact information here.
              </p>
              <p className="mt-10 text-[0.9rem] text-ink-soft">
                Full name on official documents: Amin Amir Baglouee Dariani.
              </p>
            </div>
          </Settle>
        </Wrap>
      </section>
    </>
  );
}
