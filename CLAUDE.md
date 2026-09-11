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

## 2. Design system — use it, do not extend it

One stylesheet, `src/app/globals.css`, holds every token. Values are defined
once and used by name.

- **Type.** Five roles and nothing else: `--text-display`, `--text-title`,
  `--text-section`, `--text-lede`, `--text-subhead`, `--text-body`,
  `--text-meta`, plus the `.label` (letterspaced caps) and `.note` (margin
  gloss) classes. Do not size text ad hoc. The comment above the scale explains
  what went wrong when pages sized their own paragraphs; do not repeat it.
- **Colour.** `--color-paper`, `--color-ink`, `--color-ink-soft`,
  `--color-ink-faint`, `--color-rule`, `--color-rule-soft`, `--color-accent`,
  `--color-accent-deep`. Never write a hex value in a component. The accent is
  scarce on purpose — it marks the one live or chosen thing in a view, and
  loses its meaning the moment a second thing in the same view takes it.
- **Measure.** Running text is capped at `--spacing-measure` (36rem). Do not
  let a paragraph run the full page width.
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
- Contrast: body text ≥ 4.5:1, large text and meaningful non-text ≥ 3:1.
- Honour `prefers-reduced-motion` in the same change that adds the motion, not
  later. Every animated rule in `globals.css` has an entry in the reduced-motion
  block; keep that true.
- Touch targets ≥ 44 × 44 px. Fig. 1's stop buttons and the car's handle are
  sized for this.
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
