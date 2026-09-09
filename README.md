# amin-daryan-site

Personal academic site for Amin Daryan. Next.js 16 (App Router) · React 19 ·
TypeScript · Tailwind v4 · react-three-fiber.

```bash
yarn dev
```

Then open <http://localhost:3000>.

---

## The portrait

`public/portrait.jpg` is in place — a 400×400 square, 28 KB. `Portrait.tsx`
declares those exact dimensions so the browser reserves the right box before the
image arrives and the masthead does not jump.

400 px is a little thin for a 2× display at the 248 px column this sits in.
If a larger original exists, drop it in and update the `width`/`height`
attributes to match; nothing else needs to change. If the file ever goes
missing, the component falls back to a ruled empty frame rather than a broken
image.

## Before you go live

1. Set the real origin in `src/app/layout.tsx` so link previews resolve:
   ```ts
   metadataBase: new URL("https://your-domain.com"),
   ```
2. Add an `openGraph.images` entry once you have a share image.

## Deploying

**Vercel or Netlify** — connect the repo, or drag the folder onto the
dashboard. Nothing to configure.

**GitHub Pages** (or any host that just serves files) — uncomment
`output: "export"` in `next.config.ts`, run `yarn build`, and publish the
generated `out/` folder.

---

## Structure

```
src/app/                one folder per route: /, /research, /experience, /cv, /beyond
src/components/         Masthead, Portrait, Email, Settle, and ui.tsx (Entry, Divider, …)
src/components/three/   the two WebGL figures
src/lib/dip.ts          double inverted pendulum dynamics + LQR
public/                 portrait.jpg (add this), favicon.svg
docs/                   the evidence behind every claim on the site — read docs/README.md
```

## Where the facts come from

`docs/` holds the primary material for the work described on the site: the
original reports and repository READMEs in `docs/sources/`, a cited reading of
each in `docs/notes/`, and `docs/site-claims.md`, which maps every checkable
sentence on the site to the thing that supports it.

Change the evidence before you change the page, not after. `docs/README.md`
explains the convention and how to file the next project.

## Why there is no CV PDF here

The `/cv` page is the CV, and its print stylesheet turns it into a clean PDF
straight from the browser.

The original `My_Complete_Resume.pdf` is deliberately **not** published. It
contains a date of birth, a mobile number, and the email addresses *and direct
phone numbers* of three referees — other people's personal data, which is not
ours to put on a public site. If you do want a downloadable PDF, produce a
redacted one first, drop it in `public/`, and link it from `src/app/cv/page.tsx`.

## The two 3D figures

Both are drawn only with lines and `meshBasicMaterial`, so neither scene
contains a single light. Nothing is shaded and nothing is glossy — they read as
technical figures rather than renderings, which is the point.

**Fig. 1, the 6R arm** (home). Forward kinematics by nesting the joint frames,
which is what a scene graph already does for you. The joint angles are driven by
sines at incommensurable frequencies, so the pose wanders and never repeats.

**Fig. 2, the double inverted pendulum** (research). This one is a real
simulation, not an animation:

- The plant is the **full nonlinear** model — the Lagrangian mass matrix is
  solved for accelerations every step and integrated with RK4 at 300 Hz.
- The controller is an **LQR**, designed on a linearisation of that model taken
  *numerically* by central differences, so there is no hand-derived Jacobian to
  get wrong.
- The gain comes from iterating the discrete Riccati recursion to convergence
  when the page loads. Single input, so `(R + BᵀPB)` is a scalar and no matrix
  inversion is needed anywhere.

It was verified before being wired up: energy is conserved to ~1e-6 % over 100 s
of free motion, and the upright equilibrium correctly diverges under zero
control — the test that catches a sign error on gravity.

To retune the controller, change `qDiag` and `R` in `lqrGain()` in
`src/lib/dip.ts`. Bigger angle weights buy a stiffer balance at the cost of more
cart travel.

## Design decisions worth knowing before you change them

- **No web fonts.** `--font-serif` in `src/app/globals.css` resolves to Iowan Old
  Style, Palatino or Georgia depending on the visitor's OS. This ships no font
  file at all, avoids Google Fonts (ruled a GDPR violation in German courts), and
  dodges the Playfair-Display look that reads as "template".
- **Light theme only**, deliberately. The page is meant to read as a printed
  page, and a printed page has no dark mode.
- **Email is assembled at runtime** (`src/components/Email.tsx`) so the plain
  address never appears in the served HTML for scrapers.
- **Motion respects `prefers-reduced-motion`** — both the scroll reveal and both
  WebGL scenes.
- **All colour and type lives in `@theme`** at the top of `globals.css`. Change
  `--color-accent` and every accent on the site follows.
- `.yarnrc` skips yarn's engine check because `eslint-visitor-keys@5` wants Node
  ≥ 20.19 and this machine has 20.14. Upgrading Node lets you delete that file.

## Text you may want to make more yours

The prose on `/beyond` is written in your voice but not from your words — it is
the one place worth re-reading with an editor's eye. In particular I assumed
**"sabering" means sabre fencing**; if you meant sabrage, the champagne kind,
that sentence needs rewriting (and is a better story).
