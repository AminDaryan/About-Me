# docs — the evidence behind the site

Everything on this website is a claim about a real person, and a CV is the one
document where being *approximately* right is worse than being silent. This
directory holds the primary material each claim rests on, so any sentence on the
site can be traced back to something that was actually written at the time.

## This directory is deliberately not published

**Only this file is tracked by git.** Everything else here — the source
documents, the readings of them, the claim ledger — stays on disk and out of the
public repository. `.gitignore` enforces it.

That is not tidiness. The material includes an official transcript, a
four-person group report, an accepted manuscript still under a publisher's
copyright, photographs of people who volunteered for a study, and detailed
readings that record where those documents contradict themselves. All of it is
useful for keeping the site accurate. None of it is improved by being
world-readable and permanently searchable under Amin's name.

If you are reading this in a clone of the current tree, the evidence is not in
git. Earlier commits on this remote still contain notes and manifests; taking a
file out of HEAD does not take it out of history. The working copy on disk is
the live record.

## How it is arranged, locally

```
docs/
  sources/<project>/           manifest: what the originals are, hashes, provenance
  sources/<project>/private/   the originals themselves, byte-for-byte
  sources/<project>/media/     photographs, video, anything large
  notes/<project>.md           the reading: distilled, cited, gaps named
  site-claims.md               the ledger — every claim on the site → its evidence
```

`sources/` is the record; if a note and a source disagree, the source wins.
`notes/` is interpretation and may be wrong. The ledger keeps the two honest
about each other, and separates what a document actually proves from what Amin
has simply stated.

## Adding the next project

1. Make `docs/sources/<slug>/private/` and drop the files in under their
   original names. Do not tidy them, convert them, or fix their typos — the
   original filename is half the provenance.
2. Write `sources/<slug>/MANIFEST.md`: what each file is, where it came from,
   when it arrived, its size and SHA-256. The hash is what tells you later
   whether the copy on disk is still the thing the notes were written from.
3. Write `notes/<slug>.md`. Every fact gets a locator — a page number, a line
   number, a quotation. Anything worked out rather than read is marked as an
   inference, in its own section, so it can never quietly harden into fact.
4. Update `site-claims.md` for whatever the new source confirms, contradicts or
   makes newly sayable — **then** change the site.

That order is the point. The site is the last thing to change, not the first.

## Two standing rules

**Never promote an inference to a stated fact.** If the evidence only implies
something — who did which half of a group project, say — it goes in the
inference section and Amin decides, not the notes.

**Nothing from here goes onto the site without checking who else is in it.**
Advisors, co-authors and supervisors are already public in their institutional
roles. Study participants, other students' work, and anyone's contact details
are not.
