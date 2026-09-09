# docs — the evidence behind the site

Everything on this website is a claim about a real person, and a CV is the one
document where being *approximately* right is worse than being silent. This
directory is where the primary material lives, so that any sentence on the site
can be traced back to something that was actually written at the time.

Three kinds of thing live here, and they are kept strictly apart:

```
docs/
  sources/<project>/           manifest — what the originals are and where they live
  sources/<project>/private/   the originals themselves, byte-for-byte, untracked
  notes/<project>.md           my reading of them: distilled, cited, gaps named
  notes/private/               readings that quote data too personal to publish
  site-claims.md               the ledger — every claim on the site → its evidence
```

The separation matters. `sources/` is the record; if a note and a source
disagree, the source wins. `notes/` is interpretation and may be wrong. The
ledger is what keeps the two honest about each other.

## What is here

| Project | Sources | Notes | On the site |
| --- | --- | --- | --- |
| Project lab — pick-and-place with a Franka Panda, RPTU WS 2024/25 | [`sources/cas-project-lab/`](sources/cas-project-lab/) — *report untracked* | [`notes/cas-project-lab.md`](notes/cas-project-lab.md) | `/research`, `/cv` |
| FUME lower-limb exoskeleton — adaptive control, Ferdowsi 2017–19; the ICRoM 2019 paper | [`sources/fume-exoskeleton/`](sources/fume-exoskeleton/) — *paper untracked* | [`notes/fume-exoskeleton.md`](notes/fume-exoskeleton.md) | `/research`, `/experience`, `/cv` |
| Master's project — gaze classification with HoloLens 2, DFKI smart factory, 2026 | [`sources/dfki-masters-project/`](sources/dfki-masters-project/) — *report and media untracked* | [`notes/dfki-masters-project.md`](notes/dfki-masters-project.md) | `/research`, `/experience`, `/cv` |
| RPTU transcript of records — programme name, specialisation, module titles | [`sources/rptu-transcript/`](sources/rptu-transcript/) — **file and notes untracked** | *private* | `/cv`, `/research`, home, metadata |

## Adding the next project

1. Make `docs/sources/<slug>/private/` and drop the files in **under their
   original names**. Do not tidy them, do not convert them, do not fix their
   typos. The original filename is half the provenance.
   Originals default to `private/` because this repo is public and most source
   documents carry something that is not Amin's to publish — a co-author, a
   publisher's copyright, a supervisor's name, a home address. Promote a file to
   the tracked folder only when you have checked that every party in it is fine
   with the whole world reading it.
2. Large media (video, raw datasets, anything over a megabyte or so) goes in a
   `media/` subfolder, also untracked — see below.
3. Write `sources/<slug>/MANIFEST.md`: what each file is, where it came from,
   when it was received, its size and SHA-256. The hash is what tells you later
   whether the copy on disk is still the thing the notes were written from.
4. Write `notes/<slug>.md`. Every fact gets a locator — a page number, a line
   number, a quotation. Anything you worked out rather than read gets marked as
   an inference, in its own section, so it can never quietly harden into fact.
5. Update `site-claims.md` for anything the new source confirms, contradicts, or
   makes newly sayable — then change the site.

That order is the point. The site is the last thing to change, not the first.

## Why the videos are not in git

`docs/sources/**/media/` is listed in `.gitignore`. The two demo clips alone are
33 MB, and git keeps every version of every binary it has ever seen, forever.
One project's worth is tolerable; five projects' worth turns a 2 MB text repo
into something nobody wants to clone.

The files are still on disk, and `MANIFEST.md` records the name, size, duration
and SHA-256 of each, so the record survives even if a working copy does not.

If you would rather have them tracked — they *are* your only copies of a robot
that no longer sits on that bench — the honest options are, in order:

- keep the archival copy somewhere that is meant for archives (an external
  drive, cloud storage) and leave git out of it;
- `git lfs track "docs/sources/**/media/*"`, which needs LFS on every clone and
  on the host;
- or simply delete the `docs/sources/**/media/` line from `.gitignore` and
  accept the repo size.

## Personal data — the rule that matters most

**This repository is public.** `github.com/AminDaryan/About-Me` is world-readable
and git keeps everything it has ever been told, forever. A file committed once
and deleted later is still in the history.

So there are two tiers:

- `docs/sources/<slug>/` and `docs/notes/<slug>.md` are **tracked**. Only
  material that could sit on a public CV goes here.
- `docs/sources/<slug>/private/` and `docs/notes/private/` are **gitignored**.
  Anything carrying an address, a matriculation or ID number, a date or place of
  birth, a phone number, a private email, a signature — or a level of detail no
  CV would publish, such as module-by-module grades — goes here instead, and the
  tracked manifest records only that it exists.

The transcript in `sources/rptu-transcript/` is the worked example: the PDF and
the grade analysis are untracked, while the manifest states the programme name
and specialisation, which are ordinary CV facts and reached the site.

The sources also name colleagues and supervisors. Their names are already public
on a conference title page or an IEEE byline, so repeating those is fine; their
email addresses stay in the source file and out of the notes and the site.

When in doubt, put it in `private/`. A fact can always be promoted later. A
commit to a public remote cannot be taken back.
