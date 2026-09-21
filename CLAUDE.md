@AGENTS.md

# Working on this site

Amin Dariani's personal site: a static Next.js App Router site, TypeScript,
React 19, Tailwind v4 with one global stylesheet. It is read by people deciding
whether to give him a doctoral position. Everything below follows from that.

Read this file before changing anything. Where it disagrees with a habit you
brought from elsewhere, this file wins.

---

## 1. Truth before design

The site makes checkable claims about a real person. Getting one wrong is worse
than any visual flaw on the page.

- **`docs/site-claims.md` is the ledger.** Every checkable sentence on the site
  is listed there as **Verified** (a primary source says so, with the locator),
  **Owner-stated** (Amin's word, nobody has checked it), **Inferred** (worked
  out — never allowed onto the site without asking), or **Open**.
- **Change the evidence before the page.** Adding or altering a claim means
  adding its row to the ledger in the same change. A page edit that quietly
  introduces an unlisted claim is a defect, whatever it looks like.
- **Never invent a fact to fill a gap** — not a module name, not a grade, not a
  date, not a company. If the source is missing, ask Amin. "It is probably
  right" is not a source, and neither is a plausible-sounding default for
  someone with that degree.
- **Primary sources beat the CV.** Where they disagree, follow the primary
  source and record the disagreement under Open.
- **Nothing private goes on a public page**: no phone number, no personal email
  (the university address only), no referee contact details, no material from
  `docs/sources/*/private/`.
- Sources live in `docs/sources/<topic>/` behind a `MANIFEST.md` that records
  where the file came from, when, and its SHA-256.

## 1a. The character, and who is reading

Amin's brief, in his words and kept in them: the site should feel like reading a
paper from **1800s academia — Oxford, wooden, warm, written with a quill** — and
it should be **easy to read**. Those two pull against each other only if you
think readability is a matter of letterforms. It is not. It is measure,
contrast, size and hierarchy, and all four can be had inside the character.

- **The reader is between thirty and seventy.** Treat WCAG 2.1 AA as a floor and
  not a target: running text at **7:1**, secondary text at **5.5:1 or better**,
  and no mark a reader is meant to see — a rule, a dashed outline, a meter's
  track — under **3:1**. With age a lens scatters more light, so the contrast
  reaching the retina is lower than the contrast measured on the page.
- **Every text runs the full width of the page.** That is Amin's decision,
  taken on 2026-09-21 against the advice that stood here, and it is kept
  because it is his: a block that ended a margin's width short of the rule
  above it read to him as unfinished. What it costs is measured, not guessed —
  prose on the outer edge now runs about 100 characters to the line on a
  desk, where 45–75 is the range every typographer since Bringhurst gives and
  80 is where the W3C stops. `--spacing-measure` (36rem, about 72 characters)
  survives as the text column of the two-column grid, where a record stands
  beside its date and already ends on the rule, and as the cap on a figure's
  running sentence, which shares its band with the instruments. If he asks for the
  lines to be shortened again, that is the number to go back to, and the
  outer-edge blocks are the ones to hold to it.
- **Plates run the full column too, and did first.** A drawing is not a
  sentence, and plates were given the full width of the column the page is
  built on — the margin and the measure together — while prose was still held
  at the measure, so a plate's instruments stand on the page's outer edge.
- **The drawing on a plate is held to a frame of its own.** `--spacing-plate`:
  40rem across and at most half that tall, centred on the plate. When the
  drawings ran the column too, each came out a screen tall, and a figure the
  reader has to scroll past does not pace the page — it interrupts it. Do not
  take the frame off to give one figure more room; make the drawing say less.
  And the frame is a ceiling, not a size: a diagram of a few marks is drawn at
  its own size inside it, as Fig. 2's graph is, rather than enlarged to fill
  it.
- **It is a serif, and it stays one.** A sans was proposed and considered. What
  was hard to read here was never the letterforms — it was 110 characters to the
  line, body text at 6.1:1 and eleven-pixel capitals tracked a fifth of an em. A
  sans would have bought a few per cent and cost the whole character. What did
  change is the order of the stack: Constantia and Iowan Old Style lead it,
  because both are book faces drawn to be read on a screen and both have the
  x-height that Palatino, which Windows was falling through to, does not.
- **Pace the page.** A reader should never scroll a full screen of uniform grey
  text: something has to change every screenful or so — a figure, a marginal
  gloss with its ink drawing, a section opening, a rule. `/beyond` is the model.
  Motion is not a stimulant; a change of texture is.

## 1b. How a page is set

Every page is one grid, and the grid means something.

- **Headings are flush** with the page's left edge.
- **The margin column belongs to the records and the glosses.** An entry hangs
  the one thing that identifies it — its date, and the institution's mark where
  there is one — in the margin, and sets the record itself at the measure beside
  it. A `.note` inside a `<Leaf>` hangs there too. Nothing else goes in it: if
  every left edge does the same job, none of them says anything.
- **What hangs there ranges left, with the headings.** The dates, the crests,
  the wordmarks and a `.note` gloss were ranged right, hard against the
  measure, and the page had a ragged outer edge: a date, a crest and a lockup
  each began somewhere different, and none of them began where the section
  title above them did. Amin asked for them squared up. The signposts' names
  had already been moved for the same reason. The skills' marks were among
  them until 2026-09-21, when they left the margin altogether (see below). The one thing still ranged
  right is `/beyond`'s marginal drawing (`.figure-note`), which is a picture
  set against the line it illustrates rather than a label on the page's edge.
- **So a page has two left edges.** Headings, entry rules, plates and any
  text with nothing to hang in the margin stand on the outer one; a record's
  text stands on the inner one, with whatever identifies it in the margin
  between. The skills are the one exception: each group's name and list stand
  a mark's width in from the outer edge, behind the mark that decorates them. A plate inside an entry steps back over
  the margin to reach the outer edge (`.copy .plate`); a plate that already
  stands there — Fig. 1 and Fig. 6 sit straight in the `<Wrap>` — is left
  alone, or it walks off the side of the sheet.
- **Every section is the same width.** Its content spans the margin and the
  measure and ends on the right where the section rule ends — whatever the
  content is. A record with something to hang in the margin — an entry, a
  gloss, a signpost's name — is laid on the two columns; anything else stands
  on the outer edge and runs to the rule. A block held at the measure on the
  outer edge stops a margin's width short of everything around it, and "Read
  on" and then the CV's references did exactly that.
- **Unless there is nothing to hang in the margin.** A `<Leaf>` with an empty
  margin column is not a grid, it is an indent: Get in touch and the CV's
  references stood alone in the middle of the sheet under a flush heading, and
  Amin asked for both to be squared up. A block that identifies itself — a
  record with a date, a gloss with its drawing — keeps the two columns; a
  paragraph or a quotation with nothing beside it stands on the outer edge and
  runs the width of the page. The skills are the second kind: their marks
  decorate a heading rather than identify a record, so each stands beside its
  group's name on the outer edge, at every width.
- **The page head is a title block, not a section**: the lines under its
  title stand on the title's own edge and run the width of the page, or of the
  column they share with the portrait. Set on the inner edge they left a hole a
  margin wide under the title, with the drop cap floating at the far side of
  it, and Amin called the head messy.
- **The rules are ranked, and the ranking is load-bearing.** A section opens on
  a thick-and-thin double rule the width of the column (`.section-title`) — a
  different kind of line, not only a darker one, because in a view of a whole
  page a slightly darker hairline cannot be told from the one between two
  entries. Its numeral stands beside the title, at the title's size, in a slot
  that lines every title on the page up on one edge. Records are divided by a
  single hairline in ink mixed to 3:1 (`.entry`, `.signposts`). A figure draws
  no line across the column at all: its instruments are set off from the
  drawing by space. It used to open them on a hairline, a hand's width above
  the rule that begins the next entry, and Amin could not tell which of the two
  lines ended the record. Every line across the column means a new part has
  begun. No rule may be so faint that it cannot be seen — they were 1.13:1 and
  1.27:1, which is not a delicate line but an invisible one.
- **Space is ranked the same way.** Two records stand 1.75rem apart; a section
  heading stands `--spacing-section` plus half a rem above its content (36px
  on a phone, 48 on a desk); two sections stand twice the section space apart.
  A heading closer to its content than one record is to the next reads as a
  label stuck to the first record, and Amin said so. The first child of any
  list under a heading — an entry, a signpost — gives up its own top padding,
  so the heading's space is the whole gap and every section opens the same.
- The page is `53.5rem` wide: the gutters plus exactly the leaf — a 10.5rem
  margin column, a 3.5rem gap and the 36rem measure. Do not widen it.

## 1c. Figures are plates

A figure is a plate in a monograph: a drawing and the instruments that read it.
Several kinds of text end up within an inch of each other down there, and a
reader could not tell a caption from a button until they were given four
different faces. Use them; do not invent a fifth.

| | |
| --- | --- |
| `.figure-said` | what the figure is doing now — running text, in a sentence |
| `.readout` | its live numbers: the quantity in small caps, the figure in ink |
| `.choice` | one of a set — underlined when it is the one in force |
| `.control` | a thing you press, in a hairline box, because a thing you press should look like one |

The drawing and its instruments sit inside `.plate`: the drawing as a
`.plate-drawing` — an SVG scales itself into the frame, a canvas gives itself an
aspect ratio or a height alongside the class — and the instruments in a
`.plate-foot` band under it, set off by space and not by a rule. Every figure on
the site is built this way; a new one that is not will look like a mistake,
because it is.

**No caption on the page, and no `FIG. n`.** Amin asked for them to go: the
caption was one more block of small faint text under the instruments, saying
what the moving drawing already shows, and nothing on the site refers to a
figure by its number. `<Plate>` still takes a `caption` and renders it as a
screen-reader-only `<figcaption>`, because the drawing itself is hidden from
assistive technology and the figure needs a text equivalent. What a caption
must never lose — that a drawing is simulated, drawn rather than recorded, or
not a model from Amin's own work — goes in the prose just above the figure,
where every reader meets it. A new figure that could be taken for data gets
that sentence in the same change.

## 2. Design system — use it, do not extend it

One stylesheet, `src/app/globals.css`, holds every token. Values are defined
once and used by name.

- **Type.** These roles and nothing else: `--text-display`, `--text-title`,
  `--text-section`, `--text-lede`, `--text-subhead`, `--text-body`,
  `--text-meta`, and `--text-label` with `--tracking-label` for the
  letterspaced caps, plus the `.label` and `.note` (margin gloss) classes. Do
  not size text ad hoc, and do not set the caps by hand: every class set in
  them is listed in the one selector at `.label` in `globals.css`, which gives
  the size, the tracking and the figures, and a new piece of caps joins that
  list rather than copying the three lines — a copy of a size is a size that
  drifts. The comment above the scale explains what went wrong when pages
  sized their own paragraphs; do not repeat it.
- **Figures.** Lining, everywhere. Running text was set with old-style figures
  until Amin said the numbers were hard to read — "Overall grade 2.3." — and on
  this site legibility outranks the book convention. The caps rule still asks
  for lining figures in as many words, because that one selector is where every
  piece of caps on the site is set, and "MAR 2026" in old-style digits read as
  a word with its end dropped. Roman numerals
  — `.section-num`, `.rail-num` — are words spelt in capitals and are tracked
  barely at all; at 0.3em "IV" came apart into "I V".
- **Components.** A page is built from `PageHeader`, `Section`, `Entries` and
  `Entry`, `Leaf`, `Plate` and `Labelled`, and nothing hand-rolled in their
  place: a page head, a section heading, a record, a gloss, a figure, a small
  heading over a short list. If the thing you are about to set looks like one
  of those, it is one. Their spacing and rules belong to the stylesheet, not to
  utilities on the element — a utility outranks a component rule, and the
  "no rule above the first entry" rule sat unused for exactly that reason. The
  margin rail reads `data-rail` and `data-rail-num` off the page; it must never
  go back to finding its entries by a class name inside the heading.
- **Colour.** `--color-paper`, `--color-ink`, `--color-ink-soft`,
  `--color-ink-faint`, `--color-rule`, `--color-rule-soft`, `--color-accent`,
  `--color-accent-deep`. Never write a hex value in a component. The accent is
  scarce on purpose — it marks the one live or chosen thing in a view, and
  loses its meaning the moment a second thing in the same view takes it.
- **Measure.** Text runs the full width of the page — see §1a for the
  decision and what it costs. `--spacing-measure` (36rem) is the text column
  of the two-column grid, and the cap on a plate's `.figure-said`, which shares
  its band with the instruments; do not cap any other block on the outer edge
  with it unless Amin asks for shorter lines again.
- **Spacing** comes from the Tailwind scale and the `clamp()` section rhythm
  already in use. Match the neighbouring section rather than inventing a value.
- No webfont ships. The serif stack resolves to fonts the visitor already has —
  loading Google Fonts has been ruled a GDPR violation in Germany, and this site
  is served from Germany. Do not add one.

## 3. Interface principles

Apple's HIG and Meta's practice agree on most of this; where a rule below is
specific to this site, the reason is given.

- **Deference.** The content is the interface. Chrome, motion and ornament exist
  to serve a sentence, never to be noticed on their own.
- **One idea per view.** If a section restates what the page already said or
  what the navigation already links, delete it. Two home-page sections have
  already been removed for exactly this.
- **Direct manipulation, and a keyboard path to the same thing.** Fig. 1's car
  can be dragged *and* driven with the arrow keys; both must keep working.
- **Feedback within 100 ms.** Every control shows it was hit — hover, focus, an
  arrow that moves, a pin that grows.
- **Deep links land on the thing, not the page.** A link to a specific piece of
  work carries its fragment (`/research#gaze`), the target element carries that
  `id`, and `html { scroll-padding-top }` clears the sticky masthead.
- **No dead ends.** Every figure that says something has the page that says it
  in full, one link away.

## 4. Accessibility is not a pass at the end

Target WCAG 2.1 AA, and treat a failure as a bug of the same weight as a broken
link.

- Semantic HTML first. Reach for ARIA only where no element carries the meaning
  — Fig. 1 is a real `tablist` of real `<button>`s, with roving `tabIndex` and
  arrow keys, laid over a drawing that is `aria-hidden`.
- Every image and figure has a text equivalent. Decorative drawings are hidden
  from assistive technology and the meaning lives in the prose beside them.
- Icon-only links carry an `aria-label`; an unlabelled icon asks the visitor to
  guess.
- Visible focus everywhere. Never remove an outline without replacing it.
- Contrast, at this site's floors rather than the standard's: running text
  ≥ 7:1, secondary text ≥ 5.5:1, and any mark a reader is meant to see ≥ 3:1.
  See §1a for why.
- Honour `prefers-reduced-motion` in the same change that adds the motion, not
  later. Every animated rule in `globals.css` has an entry in the reduced-motion
  block; keep that true.
- Touch targets ≥ 44 × 44 px. Fig. 1's stop buttons and the car's handle are
  sized for this; the masthead's links and the CV's logo links reach it with
  an `::after` that grows the target without moving anything drawn.
- **A phone is checked by looking at it.** Every page photographed at 360,
  390 and 430px and on its side found faults no overflow check did — see
  *Changed on 2026-09-21 (later)* in the ledger. Four rules came out of it:
  - Layout that differs between a phone and a desk comes from the stylesheet,
    not from a script alone. The server renders one layout for every screen,
    and Fig. 1 gave a phone the desk's until its script ran.
  - A figure that can be dragged takes only the touches that land on a part
    (`touch-action: pan-y` and a non-passive `touchstart`), never the whole
    drawing, or a thumb that lands on it stops the page scrolling.
  - A hover that changes a control's look sits in `@media (hover: hover)`,
    with `:active` for a touch: iOS keeps `:hover` on the last thing tapped.
  - Nothing is fixed over running text on a phone. The back-to-top disc shows
    there only while the reader scrolls back up.
- The build targets Safari 15 (`browserslist` in `package.json`). Next's
  default is 16.4, and the one chunk every page loads would not parse on an
  iPhone that cannot update past iOS 15 — the site's script failed outright.
- No doodles below 1100px. The margin studies need a margin to stand in.
- The site must be readable with JavaScript off — the `<noscript>` block in
  `layout.tsx` reveals everything the scroll animations would otherwise hide.

## 5. Motion

- Motion explains a change of state or a relationship; it never decorates.
- Short and interruptible: 150–500 ms for a state change, easing in the
  `cubic-bezier(0.22, 0.61, 0.36, 1)` family already in the stylesheet.
- **Prefer transitions to animations for state.** A transition reverses by
  itself when the state reverses — the Fig. 1 scenes light as the car arrives
  and go dark again when it leaves, with no extra code.
- Animate `transform` and `opacity`. Anything that triggers layout, in a loop,
  is a bug.
- Per-frame work writes to the DOM directly through a ref, never through React
  state. Fig. 1 sets one custom property per scene per frame and lets CSS do the
  rest.

## 6. Code

- **TypeScript strict. No `any`, no non-null `!` to silence the compiler.**
- **Server Components by default.** `"use client"` only where there is state, an
  effect or an event handler — and keep the client component small so the cost
  does not spread (see the note on `Entry.tsx`).
- **Name what a thing is, not what it is made of.** `journey/`, `road.ts`,
  `scenery.ts`, `steps.ts` — content, geometry and drawing are separate files
  because they change for separate reasons.
- **Data lives apart from the markup that renders it.** `STEPS`, `MODULES`,
  `PAGES`, `SCENERY` are plain exported values; the component is a loop over
  them. Adding a stop, a module or a page is a data edit.
- **Derive, do not duplicate.** One source of truth per fact, in code as on the
  page.
- **Comments say why, never what.** The existing comments are the house style:
  full sentences, explaining the decision and what went wrong with the
  alternative. Match them. Delete a comment that has become a caption for the
  line below it.
- Small pure functions for geometry, with the units stated. Keep them testable
  by keeping them free of the DOM.
- Handle the empty, the single and the many. Fig. 1 lays out for any number of
  stops and any container width; nothing is hard-coded to today's ten.
- No new dependency without a reason that survives being said out loud. This
  site ships no webfont, no icon library, no animation library.

## 7. Before you call it done

```bash
yarn dev            # the site, at http://localhost:3000
npx tsc --noEmit    # must be clean
npx eslint src      # must be clean
yarn build          # must succeed before committing
```

There is no Prettier config and no formatter in the dependencies: the
formatting is hand-set and matches itself. Do not run a formatter over the
repo — it would rewrite every file and bury the change you actually made.
Match the surrounding file instead.

Then, in the browser, check the change at a narrow width and a wide one, with
the keyboard alone, and with reduced motion on. Scratch files used for looking
at something belong in the scratchpad, never in `public/` — and if one has to
be served to be useful, delete it before committing.

## 8. House style for prose

British spelling. Em dashes with spaces around them. Sentence case for
headings. Plain words: *used*, not *utilised*. No exclamation marks, no
marketing voice, no first-person plural. The site is written the way a careful
person writes about their own work: specific, quiet, and never claiming more
than the evidence carries.
