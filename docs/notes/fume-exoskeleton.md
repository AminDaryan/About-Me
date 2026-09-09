# Notes — FUME exoskeleton, Ferdowsi University of Mashhad

*Read from [`../sources/fume-exoskeleton/`](../sources/fume-exoskeleton/) on
2026-09-09. Page numbers are pages of the PDF (the accepted manuscript is
unpaginated; the published version runs pp. 74–79). Table values are taken from
the file's text layer, not from a page image.*

This is the paper behind "the work that made me a researcher" on `/research`,
and Amin is its first author. It is a short, dense, experimental controls paper,
and reading it does three things for the site: it names the robot, it names the
method, and it establishes that the work was **validated on real hardware**
rather than in simulation — which the site was not saying.

---

## 1. The publication

| | |
| --- | --- |
| **Title** | Adaptive Tracking Control Based on GFHM for a Reconfigurable Lower Limb Exoskeleton |
| **Authors, as the paper's own byline prints them** | Amin Amir-B.D.; S.M. Tahamipour-Z.; Alireza Akbarzadeh (\* corresponding) |
| **Affiliations** | Amin and Akbarzadeh: Mechanical Engineering Department, Ferdowsi University of Mashhad. Tahamipour-Z.: Electrical Engineering Department, same university |
| **Keywords** | Adaptive Control; Lower Limb Exoskeleton; Generalized Fuzzy Hyperbolic Model (GFHM) |
| **Funding** | Grant #101120, Ferdowsi University of Mashhad; Grant #962297, National Institute for Medical Research Development of Iran (p. 5) |

Amin's affiliation on the byline is the **Mechanical Engineering Department**,
which corroborates the site's "B.Sc. Mechanical Engineering, Ferdowsi". His
byline email is the address the site publishes.

**This settles an open question in the ledger.** The site abbreviated the second
author as "S. M. Tahamipour". The paper's own byline is "S.M. Tahamipour-Z.",
the reference list uses "S. Tahamipour-Z." for the same person (ref. [15]), and
the IEEE record renders him "Seyed Mohammad Tahamipour-Z". The `-Z.` is part of
the name, not an initial that can be dropped. **Corrected on the site.**

The proceedings table of contents expands the bylines to full legal names —
"Amin Amir Bagluie Daryani, Seyyed Mohammad Tahamipour Zarandi, Alireza
Akbarzadeh Tootoonchi". A citing source renders Amin's as "Amin Amir Baglouee
Daryani"; the site writes "Amin Amir Baglouee Dariani". Three transliterations
of one name — his to state, not mine to correct. The **byline form** is what a
citation should use, and now does.

---

## 2. The robot

**FUME** — the FUM-Exoskeleton — built for paraplegic users at the Robotic
Laboratory of Ferdowsi University of Mashhad (pp. 1–2). Photographed in Fig. 1
both as a bare frame and worn by a user.

- **Six degrees of freedom**, of which **two are passive**: the ankles are
  springs or locks rather than actuators (p. 2). So four actuated joints — both
  hips and both knees — which is exactly what the results table reports on.
- **Constrained to the sagittal plane**: flexion and extension only.
- Seven parts: torso, left and right thigh, shank and tibia (Fig. 2).
- "Reconfigurable" in the title means the controller adapts to the wearer: it
  "sets the control parameters relative to the wearer's weight and height … in
  other words adapting to the system, which is FUME with the user" (p. 1).

The dynamic model treats the **swing phase** as a pair of two-link limbs, one
leg supporting and one swinging: `τ = M(θ)θ̈ + V(θ,θ̇)` (p. 2, eq. 1).

---

## 3. The method, in one paragraph

`M(θ)` — the inertia matrix — can be obtained accurately. `V(θ,θ̇)` — the
centrifugal, Coriolis and gravitational terms — cannot, and is where the
uncertainty lives (p. 3). So the controller approximates *that* term with a
**Generalized Fuzzy Hyperbolic Model**, whose output collapses to
`F(u) = A + B·tanh(Ku)` — a sum of hyperbolic tangents over positive and
negative fuzzy sets (p. 3, eq. 9). The parameter vector `φ` is updated online by
an adaptation law with a leakage term, `φ̇ = γ(e·ψ(r,u) − λφ)` (eq. 11).

The appeal, and the reason it suits this application: it is a **simple,
low-computational-cost structure** for a MIMO nonlinear plant with unknown
disturbances — which is what an exoskeleton in contact with a moving human being
is. The reference trajectory is normal adult walking taken from Winter's
*Biomechanics and Motor Control of Human Movement*, on a 5-second cycle (p. 3).

---

## 4. The results — and a discrepancy in the paper's own numbers

Implemented on the physical FUME and compared against a tuned PID. Table II
(p. 5), read from the text layer:

| Joint | PID MSE | A-GFHM MSE | Reduction |
| --- | ---: | ---: | ---: |
| Right hip | 14.57 ×10⁻⁵ | 5.18 ×10⁻⁵ | 64.45 % |
| Right knee | 5.44 ×10⁻⁴ | 2.50 ×10⁻⁴ | 54.04 % |
| Left hip | 5.69 ×10⁻⁵ | 3.78 ×10⁻⁵ | 33.57 % |
| Left knee | 4.49 ×10⁻⁴ | 1.49 ×10⁻⁴ | **66.82 %** |

The energy-consumption criterion `Jτ` is also lower on all four joints
(11.53→10.36, 9.26→7.87, 8.83→8.25, 7.73→5.30).

The paper's prose reports "64.44%, 54.04%, 33.56%, and 77.73% for the right hip,
right knee, left hip, and left knee, respectively" (p. 4). **Three of those four
reproduce from Table II exactly. The left knee does not** — the table gives
66.82%, the text claims 77.73%. To get 77.73% the A-GFHM left-knee MSE would
have to be about 1.00 ×10⁻⁴ rather than the 1.49 ×10⁻⁴ printed.

A second, separate wobble: the **abstract** attributes 33.56% and 77.73% to "the
knee and hip joints, respectively", while the body attributes the same two
numbers to the *left hip* and *left knee*. The two orderings cannot both be
right.

Neither undermines the paper's conclusion — every joint improved on both metrics
under any reading — but it does mean **no single percentage from this paper is
safe to quote on a CV**. Someone who checks will find the same thing I did.

> Amin: this is your paper, and this is worth knowing. If you have the original
> results or the submitted source, the left-knee figure is the one to look at.

**What the site says instead:** lower tracking error and lower energy
consumption than a tuned PID on all four actuated joints, measured on the
physical robot. That is true under every reading of the paper, and it is the
part that actually matters.

---

## 5. What this changed on the site

- Citation on `/research` and `/cv`: `S. M. Tahamipour` → **`S. M. Tahamipour-Z.`**
- `/research` exoskeleton entry: names FUME and the Robotic Laboratory, says the
  method is adaptive control built on a generalised fuzzy hyperbolic model, and
  states that it was implemented on the physical robot and beaten against a PID.
  Previously the entry described the setting but never the contribution.
- `/cv` and `/experience`: the robot is named, briefly.

## 6. Not claimed

Per the standing decision on group work, the site does not parcel out credit
among the three authors. It does not need to: **first authorship is printed on
the paper**, and the citation directly beneath the entry carries it.

## 7. Still open

- The paper's left-knee percentage (above).
- The "6R industrial robot — technical documentation" strand of the Ferdowsi
  role has no source attached at all; it remains owner-stated.
- Whether the accepted manuscript may be linked from the site. IEEE permits an
  author's accepted manuscript on a personal site with their prescribed
  copyright notice, which this copy does not carry — so today the site links the
  DOI only, which is always safe.
