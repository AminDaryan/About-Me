import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { Footer } from "@/components/ui";
import "./globals.css";

/* No next/font here on purpose: the stack in globals.css resolves to serifs the
   visitor already has, so the site ships no webfont at all. */

export const metadata: Metadata = {
  // Once this is live, set the real origin so Open Graph URLs resolve
  // absolutely: metadataBase: new URL("https://your-domain.com"),
  title: {
    default: "Amin Daryan — Robotics & Machine Perception",
    template: "%s — Amin Daryan",
  },
  description:
    "Amin Daryan — M.Sc. student in Automation and Control Engineering at RPTU Kaiserslautern, working on environment perception for off-road autonomous driving, explainable AI, and human-centred robotics.",
  authors: [{ name: "Amin Daryan" }],
  openGraph: {
    type: "profile",
    title: "Amin Daryan — Robotics & Machine Perception",
    description:
      "Machine perception for robots that have to operate where the world stops being tidy. Kaiserslautern, Germany.",
  },
  icons: { icon: "/favicon.svg" },
};

const PERSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Amin Daryan",
  alternateName: "Amin Amir Baglouee Dariani",
  jobTitle: "Researcher, Robotics and Machine Perception",
  description:
    "M.Sc. student in Automation and Control Engineering at RPTU Kaiserslautern working on environment perception for off-road autonomous driving using diffusion models.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kaiserslautern",
    addressCountry: "DE",
  },
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "RPTU Kaiserslautern-Landau" },
    { "@type": "CollegeOrUniversity", name: "Ferdowsi University of Mashhad" },
  ],
  worksFor: { "@type": "Organization", name: "Fraunhofer IOSB" },
  knowsAbout: [
    "Machine perception",
    "Diffusion models",
    "Explainable AI",
    "Robotics",
    "Control engineering",
    "Computer vision",
  ],
  sameAs: ["https://www.linkedin.com/in/amin-daryan/"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Scroll-in animation starts at opacity 0. Without JavaScript nothing
            would ever reveal it, so show everything outright instead. */}
        <noscript>
          <style>{`.settle{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
      </head>
      <body className="font-serif antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_LD) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:bg-ink focus:px-4 focus:py-3 focus:text-paper"
        >
          Skip to content
        </a>
        <Masthead />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
