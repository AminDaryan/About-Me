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

1. Add an `openGraph.images` entry once you have a share image. Note that
   whatever you choose appears in every link preview of this site, so the
   portrait is a decision rather than a default.

## Deploying

**Cloudflare Pages.** `next.config.ts` sets `output: "export"`, so `yarn build`
writes a folder of static files to `./out` and Pages serves it — no Node
runtime, nothing to exploit server-side. `wrangler.toml` names the project and
points `pages_build_output_dir` at `out`.

Set these in the Pages project:

| Setting | Value |
| --- | --- |
| Build command | `yarn build` |
| Build output directory | `out` |
| Deploy command | `npx wrangler pages deploy` — **not** `npx wrangler deploy` |

`wrangler deploy` is the *Workers* command. It looks for a Worker entry point,
finds none, and fails; that is what broke the last deploy.

The origin is `https://amindariani.com`, set once in `src/lib/site.ts` and used
for `metadataBase`, every canonical link, `sitemap.xml` and `robots.txt`. No
environment variable is needed; `NEXT_PUBLIC_SITE_URL` overrides it for a
preview deployment.

**Two things live outside Next because an export cannot serve them.**
`public/_headers` carries the security headers and `public/_redirects` carries
the `/experience` → `/cv` redirect. `headers()` and `redirects()` in
`next.config.ts` are applied by the Next *server*, which is not running here, so
configuring them there would silently do nothing.

---

## Structure

```
src/app/                one folder per route: /, /research, /cv, /beyond
                        plus robots.ts and sitemap.ts, emitted as static files
src/components/         Masthead, Portrait, Settle, and ui.tsx (Entry, Divider, …)
src/components/three/   the two WebGL figures
src/lib/dip.ts          double inverted pendulum dynamics + LQR
public/                 portrait.jpg, favicon.svg, and _headers /
                        _redirects, which Cloudflare Pages reads
docs/                   the evidence behind every claim on the site — read docs/README.md
```

## Where the facts come from

`docs/` holds the primary material behind the work described on the site, a
cited reading of each source, and a ledger mapping every checkable sentence to
the thing that supports it.

**Only `docs/README.md` is tracked by git.** The rest stays on disk: it contains
an official transcript, other people's coursework, a publisher-copyrighted
manuscript, and photographs of study volunteers. Change the evidence before you
change the page, not after.

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
- **No email address anywhere.** LinkedIn is the contact route. An earlier
  version published a personal address behind a string-concatenation trick and
  claimed it never reached the client; it did, because the bundler folds
  constant expressions. That is the general lesson: obfuscation is not
  protection, and the only reliable way to keep an address off a public page is
  not to put it there. `src/components/Email.tsx` has been deleted.
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
