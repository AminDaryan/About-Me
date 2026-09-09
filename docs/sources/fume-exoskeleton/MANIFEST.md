# Manifest — FUME lower-limb exoskeleton (Ferdowsi University of Mashhad)

Adaptive tracking control for a reconfigurable paraplegic lower-limb
exoskeleton. Amin's first publication, and the work behind the Robotics Lab
entry on the site.

**Received** 2026-09-09, attached by Amin Daryan to a Claude Code session.
**Original location** `Desktop/`. Copied verbatim, not edited or re-encoded.

## Not tracked in git

| File | Bytes | Modified | SHA-256 |
| --- | ---: | --- | --- |
| `private/2019AdaptiveTrackingControlBasedonGFHM…Exoskeleton.pdf` | 739,412 | 2026-09-08 | `e41629b8e50252a18191ac91c7ba9079c9f5102b71373a0b938d9115731931b6` |

Six pages, two columns, IEEE conference template, with a text layer (extracted
with `pypdf` for the table figures — the numbers in the notes are read from
that layer, not from the page images).

**This is the author's accepted manuscript, not the published version.** The
copyright footer on page 1 still reads
`XXX-X-XXXX-XXXX-X/XX/$XX.00 ©20XX IEEE` with the placeholders unfilled, so the
file carries no volume, no page numbers and no final DOI. The published record
is:

> A. Amir-B.D., S. M. Tahamipour-Z., A. Akbarzadeh, "Adaptive Tracking Control
> Based on GFHM for a Reconfigurable Lower Limb Exoskeleton," *2019 7th
> International Conference on Robotics and Mechatronics (ICRoM)*, Tehran, Iran,
> 20–21 November 2019, pp. 74–79. doi:10.1109/ICRoM48714.2019.9071886

verified against the IEEE print proceedings front matter and table of contents
(IEEE Catalog CFP19RSI-POD, ISBN 978-1-7281-6604-9, ISSN 2377-679X) on
2026-09-08.

**This is why the file is gitignored.** This repository is public. IEEE permits
an author's accepted manuscript on a personal site only with their prescribed
copyright notice, which this copy does not carry — its footer is still the
unfilled `XXX-X-XXXX-XXXX-X/XX/$XX.00 ©20XX IEEE` placeholder. The byline also
prints two colleagues' institutional email addresses. Committing it to a public
remote would republish both. The site links the DOI instead, which is always
safe, and every fact the notes rely on is quoted with a locator.

## Other people's data in this file

The byline prints all three authors' institutional email addresses. They are
already public on the IEEE record and in the proceedings, so they stay in the
source copy, but they are **not** repeated in the notes and must not reach the
website. Amin's own address on the byline, `amindarian@gmail.com`, matches the
one the site publishes.

## Not present

The controller implementation, the FUME robot's identified dynamic parameters,
and the gait trajectory data (the paper takes its reference trajectory from
Winter, *Biomechanics and Motor Control of Human Movement*, ref. [34]). Every
claim in the notes rests on the paper alone.
