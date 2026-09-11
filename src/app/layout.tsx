import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL } from "@/lib/site";
import { Footer } from "@/components/ui";
import "./globals.css";

/* No next/font here on purpose: the stack in globals.css resolves to serifs the
   visitor already has, so the site ships no webfont at all. */

export const metadata: Metadata = {
  // Every relative URL below, and every page's canonical, resolves
  // against this. The live origin is the default in src/lib/site.ts;
  // NEXT_PUBLIC_SITE_URL overrides it for a preview deployment.
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  title: {
    default: "Amin Dariani — Explainable and Trustworthy Machine Learning",
    template: "%s — Amin Dariani",
  },
  description:
    "Amin Dariani — M.Sc. student in Automation and Control at RPTU Kaiserslautern, working on explainable AI for graph neural networks, with a background in computer vision, robot perception and model-based control.",
  authors: [{ name: "Amin Dariani" }],
  openGraph: {
    type: "profile",
    // No `url` here on purpose: child pages inherit this whole
    // object, so a value would put the site root in og:url on /cv
    // and /research. The canonical link states each page's own URL.
    siteName: "Amin Dariani",
    title: "Amin Dariani — Explainable and Trustworthy Machine Learning",
    description:
      "Explainable and trustworthy machine learning, with a background in computer vision, robot perception and model-based control. Kaiserslautern, Germany.",
  },
  icons: { icon: "/favicon.svg" },
};

const PERSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Amin Dariani",
  alternateName: "Amin Amir Baglouee Dariani",
  jobTitle: "Working Student Researcher, Explainable AI",
  description:
    "M.Sc. student in Automation and Control at RPTU Kaiserslautern, writing a thesis on explainable AI methods for graph neural network-based remaining useful life prediction.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kaiserslautern",
    addressCountry: "DE",
  },
  /* RPTU is a current affiliation, not a finished one: the M.Sc. runs from
     March 2023 and is still in progress, so listing it under alumniOf would
     tell a machine reader the degree is already awarded. alumniOf is for the
     degree that is actually finished. */
  affiliation: {
    "@type": "CollegeOrUniversity",
    name: "RPTU Kaiserslautern-Landau",
  },
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "Ferdowsi University of Mashhad" },
  ],
  worksFor: { "@type": "Organization", name: "Fraunhofer IOSB" },
  knowsAbout: [
    "Explainable AI",
    "Graph neural networks",
    "Machine learning",
    "Computer vision",
    "Robotics",
    "Control engineering",
  ],
  /* Professional identities only, each one listed on the PhD CV. ORCID and
     GitHub were checked against the name before going in; LinkedIn refuses
     automated requests, so its handle is taken from the CV as written. */
  sameAs: [
    "https://www.linkedin.com/in/amin-dariani/",
    "https://github.com/AminDaryan",
    "https://orcid.org/0009-0003-6226-2030",
  ],
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
          <style>{`.settle{opacity:1 !important;transform:none !important}.ink svg path{stroke-dashoffset:0 !important}`}</style>
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
