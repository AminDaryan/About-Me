# Manifest — Master's project, gaze classification with HoloLens 2

*Classification of Eye Movements from Eye Tracking Data Recorded With
HoloLens 2* — Amin's master's project, examined at RPTU's Institute of
Electromobility and carried out in the DFKI SmartFactory in Kaiserslautern.

This is the module the RPTU transcript records as **Master Project CAS**, the
15-credit item that [`../../site-claims.md`](../../site-claims.md) flagged as
missing from the site with no source attached. That question is now closed.

**Received** 2026-09-09, attached by Amin Daryan to a Claude Code session.
**Original locations** `D:\Main\University\DFKI Masters project\…` (report) and
`Desktop\` (photographs and video). Copied verbatim.

## Nothing here is tracked in git

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `private/Masters_Project_Report_Final_Update.pdf` | 7,384,404 | `85b5c9dac550960d79b3231f9c521b8926bdf53d9451e96326854b78044f39ab` |
| `media/WhatsApp Image 2026-09-05 at 18.22.46.jpeg` | 220,224 | `22b8b8bf1feee024e06c2cf32455d811763324f7260b0bf851c7c5d152197747` |
| `media/WhatsApp Image 2026-09-05 at 18.23.07.jpeg` | 221,650 | `acaddfdcb4f6309f9c12f98b64c93efe6bdfcc23816c48d3607cefc9564774aa` |
| `media/WhatsApp Video 2026-09-05 at 18.22.47.mp4` | 3,520,522 | `ce254a630230d1030e37b654b049f4d740b9acc46f10b2b6f833c72237842041` |

**The report** — 77 pages, LaTeX, single-authored by Amin, dated 31 March 2026,
with a text layer (the results tables in the notes are read from that layer, not
from page images). It is gitignored for two reasons: it is 7 MB, and Figure 4.1
on page 30 is a photograph of an **experiment participant** wearing the
HoloLens. Ten people volunteered for this study; their images are not Amin's to
publish, and a public git history is forever.

**The photographs and video** — 1200×1600 and 900×1600 stills and a 16.8 s
clip, all recorded 2026-09-05, showing a HoloLens 2 in use at the SmartFactory
assembly cell (Yaskawa arm, green LED station, glue gun, 3D-printed
`smartFactory` blocks — the apparatus the report describes).

The second still is unambiguously Amin: the face matches `public/portrait.jpg`.
**The first still shows a person from behind and has not been positively
identified.** It may be Amin; it may be one of the ten volunteers. Nobody has
established which, so none of this reaches the site. Nothing in the notes
describes the video's contents either — nobody has watched it, and there is
still no ffmpeg on this machine.

## Other people named in the report

The title page names two advisors — Prof. Dr.-Ing. Daniel Görges and M.Sc.
Snehal Walunj. Advisor names are ordinary CV material and are already public in
their institutional roles, so they appear in the notes and on the site. The ten
study participants are anonymous in the report and stay that way.

## Not present

The Unity application, the ARETT integration, the collected gaze dataset, and
the classifier code. Appendix A of the report reproduces short code listings for
the four classifiers; everything in the notes rests on the report's own text and
tables, never on code that was run.
