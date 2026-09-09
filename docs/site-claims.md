# site-claims — every checkable sentence and what holds it up

Last reconciled **2026-09-09** (twice — the ICRoM paper, then the RPTU
transcript), against the sources in [`sources/`](sources/) and the external
records noted below.

Four statuses, and the distinction between the first two is the whole point of
this file:

| | |
| --- | --- |
| **Verified** | a primary source or an external record says so, and the locator is given |
| **Owner-stated** | Amin's own biography. No document here covers it. Not a defect — most of a CV is this — but nobody has checked it and this file should not pretend otherwise |
| **Inferred** | worked out rather than read. Never allowed onto the site without being asked first |
| **Open** | a question nobody has answered yet |

---

## Verified

| Claim | On the site | Evidence |
| --- | --- | --- |
| The master's project robot is a Franka Emika Panda, 7-DOF, with a parallel gripper | `research`, `cv` | Report p. 3, verbatim: "Franka Emika Panda robot (7-DOF arm with parallel gripper)" |
| The camera is an Intel RealSense D455, RGB-D | `research`, `cv` | Report p. 3; `README_ImageProcessing.md:79` lists it as a requirement |
| Detection is a custom-trained YOLO model | `research`, `cv` | Report p. 4; `README_ImageProcessing.md:5`. Version deliberately unstated on the site — the sources disagree (report says v5, README `:50` says "YoloV5 or V11") |
| Pose comes from PnP against a CAD model under a plane constraint | `research`, `cv` | `README_ImageProcessing.md:13`, `:17–18` (`solve_pnp_with_plane_constraint`), `:20` (`create_full_cuboid_model`) |
| The estimate is stabilised by interquartile outlier rejection, then averaging | `research` | `README_ImageProcessing.md:22–25` |
| Planning is MoveIt, with fallback across four OMPL planners and growing timeouts | `research`, `cv` | Report p. 6; `README_ManipulatorControl.md:150–153` names RRTConnect, LBKPIECE, BiTRRT, TRRT |
| It was a group of four | `research`, `cv` | Report title page: Ahmet Berke Erikan, Amin Darian, Akihito Harasawa, Berkay Yucel |
| Winter semester 2024/25 | `research`, `cv` | Report title page. Corroborated by the README history, 2024-12-15 → 2025-03-21 |
| Institute of Control Systems, RPTU | `research`, `cv` | Report title page: "Department of Electrical and Computer Engineering / Institute of Control Systems", RPTU logo |
| Publication title, venue, city and year | `research`, `cv` | IEEE print proceedings, *2019 7th International Conference on Robotics and Mechatronics (ICRoM 2019)*, ISBN 978-1-7281-6604-9 |
| Publication dates 20–21 November 2019 and pp. 74–79 | `research`, `cv` | Same proceedings; cover page and table of contents. **Added 2026-09-08** |
| Amin is first author | `research`, `cv` | Proceedings TOC prints the authors in order: Amin Amir Bagluie Daryani, Seyyed Mohammad Tahamipour Zarandi, Alireza Akbarzadeh Tootoonchi |
| DOI 10.1109/ICRoM48714.2019.9071886 | `research`, `cv` | Resolves to the IEEE Xplore record for this paper |
| The exoskeleton is called FUME, built at the Robotic Laboratory of Ferdowsi University of Mashhad | `research`, `experience`, `cv` | Paper pp. 1–2 and conclusion p. 5: "FUME … manufactured at the Robotic Laboratory of the Ferdowsi University of Mashhad" |
| Six degrees of freedom, ankles passive, sagittal plane only | `research` | Paper p. 2: "FUME consists of 6 degrees of freedom, two of them which, namely the ankles, are passive … limited to the sagittal plane" |
| Four actuated joints | `research` | 6 DOF less two passive ankles; Table II reports exactly right/left hip and right/left knee |
| The method is adaptive tracking control on a generalised fuzzy hyperbolic model | `research`, `cv` | Paper title, abstract and §III; the GFHM approximates the uncertain `V(θ,θ̇)` term, eq. 9–11 |
| It was implemented on the physical robot, not simulated | `research`, `cv` | Abstract: "tested by experimental implementation on an exoskeleton robot manufactured at the Robotic Laboratory"; conclusion p. 5 |
| It beat a tuned PID on tracking error and on energy at all four joints | `research` | Table II, p. 5: MSE 14.57→5.18, 5.44→2.50, 5.69→3.78, 4.49→1.49; `Jτ` 11.53→10.36, 9.26→7.87, 8.83→8.25, 7.73→5.30. Lower on both metrics in every column |
| Amin's department at Ferdowsi was Mechanical Engineering | `cv` (B.Sc.) | The paper's byline gives his affiliation as the Mechanical Engineering Department |
| The programme is "Automation and Control", four semesters standard duration | `cv`, home, metadata, JSON-LD | RPTU transcript, `Studiengang` line; corroborated by RPTU's public course pages |
| Specialisation: Connected Automation Systems | `cv`, `research` | RPTU transcript: *Vertiefung Connected Automation Systems* |
| The pick-and-place work is the CAS Project Lab module, not the master's project | `cv`, `research` | RPTU transcript lists CAS Project Lab and Master Project CAS as separate modules; see the correction table below |
| Coursework: 3D Computer Vision, Cooperative Robot Control, Methods of Soft Control, Model Predictive Control, Fault Diagnosis and Fault Tolerant Control | `cv` | All five appear as passed modules on the transcript |
| The M.Sc. is still in progress | `cv`, home, JSON-LD `affiliation` | Transcript p. 3: "Der Prüfungsanspruch im genannten Studiengang besteht noch"; no thesis module recorded |
| Master's project title, advisors and institute | `cv` | Report title page: "Classification of Eye Movements from Eye Tracking Data Recorded With HoloLens 2", Prof. Dr.-Ing. Daniel Görges and M.Sc. Snehal Walunj, Institute of Electromobility, RPTU, 31 March 2026 |
| The experiment ran in the DFKI smart factory with ten volunteers | `research`, `experience` | Report p. 30: "ten volunteers who participated in the experiment, which was conducted in the smart factory of the DFKI institute of Kaiserslautern" |
| Four activities: walking, waiting, tool usage with a glue gun, assembling | `research` | Report p. 29 |
| The published toolchain sampled at 10 Hz, a third of the assumed rate, so a custom Unity/ARETT capture app was used | `research` | Report p. 28: "the data collection rate was only 10Hz, which was 20Hz less than the desired data rate used in the papers and ARETT" |
| Nineteen features from blinks, fixations and dispersion | `research` | Report Table 5.3, p. 33 — 19 rows |
| Extra trees led at 99.3% on the most demanding split | `research` | Report Table 5.1, p. 31: Extra Trees 99.29% at the 60–40 split, ahead of Random Forest 98.59% and every SVM kernel. The split is quoted with the number because three methods hit 100% at 80–20 on ten participants' data, which is a ceiling effect rather than a result |
| The LSTM did not beat the inherited methods, and SMOTE over-sampling made it worse | `research` | Report p. 59 (LSTM "provides less favourable results … requires significantly more computation time") and p. 28 ("This approach did not work well, and it brought down the accuracy") |

## Corrected on 2026-09-09 — from the RPTU transcript

| Was | Now | Why |
| --- | --- | --- |
| "M.Sc. Automation and Control **Engineering**", in five places (CV metadata, CV entry title, layout metadata, JSON-LD, home prose) and "Automation & Control Engineering" in the home margin note | "Automation and Control" / "Automation & Control" | The transcript's `Studiengang` line reads "Automation and Control (Master of Science)"; RPTU's own course pages call it "Automation & Control (M.Sc.)". The word "Engineering" is not part of the programme's name |
| The Franka pick-and-place was labelled "**Master's project**" on `/cv` and "Master's project lab" on `/research` | "Project lab" / "Project lab, Connected Automation Systems" | The transcript lists **two** modules: *CAS Project Lab* (5 LP) and *Master Project CAS* (15 LP, dated 06.03.2026). The Franka work is the first — its source file is named `CAS Project_Lab.pdf`, its title page says "Project Lab, Winter Semester 2024\|25", and WS 2024/25 ended a year before the Master Project's date. The old label named the other module |
| No specialisation stated | "Specialisation in Connected Automation Systems" on `/cv`, and named on `/research` | Transcript: *Vertiefung Connected Automation Systems*. This is also what "CAS" means throughout these docs |
| Selected coursework listed three modules | Adds Model Predictive Control and Fault Diagnosis and Fault Tolerant Control | Both appear on the transcript under Pflichtmodule CAS |
| `Portrait.tsx` declared a 600×750 image that did not exist | 400×400, matching the installed `public/portrait.jpg`; the fallback frame is square to match | Wrong intrinsic dimensions make the browser reserve the wrong box and the layout jump on load |

## Corrected on 2026-09-09 — from the ICRoM paper

| Was | Now | Why |
| --- | --- | --- |
| Citation read "S. M. **Tahamipour**" | "S. M. **Tahamipour-Z.**" | The paper's own byline prints "S.M. Tahamipour-Z."; its reference list uses the same form (ref. 15) and IEEE renders him "Seyed Mohammad Tahamipour-Z". The `-Z.` is part of a co-author's name, not a droppable initial. This closes the open item below |
| The exoskeleton entry described the setting but never the contribution | Names FUME and the lab, states the method, and says it ran on the physical robot and beat a tuned PID | The paper supports all of it; the site was leaving its own best evidence on the table |
| `/experience` and `/cv` said "a paraplegic lower-limb exoskeleton" | Names FUME | Same source |

## Corrected on 2026-09-08

| Was | Now | Why |
| --- | --- | --- |
| "Object detection and transfer with a **6R robot** and a RealSense camera" (`research`, `cv`) | Franka Emika Panda, 7-DOF | Report p. 3. A Panda has seven revolute joints; 6R had drifted in from the genuinely-6R industrial arm at Ferdowsi, which is a different machine |
| Two sentences describing the project | The detection → PnP → filtering → MoveIt pipeline, named | The sources support far more specificity than the site was using |
| Citation ended "November 2019." | "20–21 November 2019, pp. 74–79." | Proceedings front matter and TOC |
| JSON-LD listed RPTU under `alumniOf` | RPTU is `affiliation`; `alumniOf` keeps Ferdowsi only | The M.Sc. is in progress (`cv`: "Mar 2023 – present"). `alumniOf` told a machine reader the degree was awarded |
| `/beyond`: "**Two years** of working on gaze" | "A year and a half" | The site's own DFKI dates are Sep 2024 – Feb 2026 — seventeen months — and the home page already said "a year and a half" |
| "four years … in Vancouver, in Spain, **and at SAP** in Walldorf" (`home`); "For four years … in three countries" (`experience`) | The four years are Vancouver then Spain; SAP is named separately as later, alongside the master's | DelGate Sep 2019 – Aug 2021 plus JHELY Aug 2021 – Aug 2023 is exactly four years. SAP began January 2024, during the M.Sc. The page's own metadata description had it right — "four years … in Canada and Spain" — while the prose did not |
| Footer "Updated August 2026" | September 2026 | The content changed today |

## Deliberately left alone

| Claim | Why it stays |
| --- | --- |
| `Fig. 1 — 6R articulated arm` (home) | A decorative WebGL figure that really is drawn with six joints. It makes no claim about any project |
| "6R industrial robot — technical documentation" (`cv`, `experience`, `research`) | A different, genuinely 6R machine at Ferdowsi, 2017–2019 |
| The citation's abbreviated author forms — now "A. Amir-B.D., S. M. Tahamipour-Z., A. Akbarzadeh" | **Resolved 2026-09-09.** The paper's own byline is the authority and the site now matches it. The proceedings TOC expands the same three people to full legal names (*Bagluie Daryani*, *Tahamipour Zarandi*, *Akbarzadeh Tootoonchi*); a citation should use the byline form, and does |
| The site's spelling of the official name, "Amin Amir Baglouee Dariani" | The proceedings print "Amin Amir Bagluie Daryani". Two transliterations of one name; the passport spelling is Amin's to state, not mine to correct |

## Owner-stated — no document here covers these

Dates, grades, titles and language levels all sit in this bucket. They are
almost certainly right; they are simply unverified, and a reader of this file
should know which sentences have paper behind them and which have Amin's word.

- **Education** — M.Sc. Automation and Control Engineering, RPTU, Mar 2023 – present, current grade 2.1. B.Sc. Mechanical Engineering, Ferdowsi, Sep 2014 – Sep 2019, grade 2.3 converted. Thesis titles, both degrees. All listed coursework.
  *Partial corroboration*: the report's title page independently places Amin at RPTU's Institute of Control Systems in WS 2024/25.
- **Research posts** — Fraunhofer IOSB, Working Student Researcher, XAI, Feb 2026 – present. DFKI, Student Research Assistant, gaze-enabled activity classification, Sep 2024 – Feb 2026. Ferdowsi Robotics Lab, Sep 2017 – Sep 2019.
  *Partial corroboration*: the ICRoM paper is exoskeleton control from the Ferdowsi period, which supports the third.
- **Industry** — SAP SE (both posts and their dates), JHELY, DelGate, and every role title.
- **Skills and languages** — Python, JavaScript, MATLAB, PyTorch, OpenCV, YOLO; IELTS 8.0, German B1, Persian native.
- **Contact** — the email address and the LinkedIn URL. Neither has been fetched.
- **Outbound employer links** — `jhely.es`, `pppn.co.uk`, `itshere.com`, `app.itshere.com`. None has been checked for whether it still resolves, and a dead link on a CV page is worse than no link.

## Inferred — kept off the site

- **Which half of the project lab was Amin's.** `README_ManipulatorControl.md:171–173` credits Ahmet Berke Erikan and is written in the third person; `README_ImageProcessing.md` has no contributor list and is first person (`:71`, "*I* was able to make the code detect the cubes rotation"). The natural reading is that Amin owned the perception half. **Asked on 2026-09-08; Amin chose not to name a personal share.** The site describes the system and says it was a group of four, and claims no portion of it.

## Open

- **The overall grade on the CV cannot be confirmed from the transcript**, which records module rows but states no average of its own — that is computed at graduation. The figure was left untouched: an overall grade is Amin's to state. The reconstruction is in `docs/notes/private/rptu-transcript.md`, which is untracked, and it does not agree with the site; this needs a decision from him.
- ~~**A substantial module is missing from the site.** *Master Project CAS*, 15 credits.~~ **Closed 2026-09-09**: it is the master's project, *Classification of Eye Movements from Eye Tracking Data Recorded With HoloLens 2*, now on `/cv` and `/research`. See [`notes/dfki-masters-project.md`](notes/dfki-masters-project.md).
- **The report's own tables have three defects** — unresolved LaTeX cross-references, an all-zero placeholder row for the LSTM, and one cell where Tables 5.1 and 5.2 disagree (SVM polynomial at 60–40: 96.13% vs 93.13%). None is quoted on the site. Worth a fix before the document is sent anywhere.
- **A number in Amin's own paper does not reproduce.** The text reports a 77.73% MSE reduction at the left knee; Table II gives 4.49→1.49 ×10⁻⁴, which is 66.82%. The other three figures match the table exactly. Separately, the abstract labels 33.56% and 77.73% as "knee and hip" while the body labels them "left hip and left knee". No percentage from this paper is safe to quote, and the site quotes none — it makes the qualitative claim instead, which holds under every reading. See [`notes/fume-exoskeleton.md`](notes/fume-exoskeleton.md) §4.
- The accepted manuscript in `sources/fume-exoskeleton/` is **not** the IEEE version of record and carries no copyright notice, so it is not linkable from the site as-is; the site links the DOI, which always is.
- The "6R industrial robot — technical documentation" half of the Ferdowsi role still has no source attached and remains owner-stated.
- The perception source code was never attached; every technical claim above rests on the report and the two READMEs, not on code anyone read.
- Nobody has watched `Demo1.mp4` or `Demo2.mp4` — there is no ffmpeg on this machine. Nothing on the site or in the notes describes them.
- Does the project lab carry a grade, or a module code worth naming on the CV?
- What do "CAS" and "RCS" stand for? They appear only in filenames and are expanded nowhere.
- Three site-hygiene items unrelated to accuracy: `public/portrait.jpg` still does not exist, so the home page shows its ruled placeholder; `metadataBase` in `src/app/layout.tsx` is still unset, so Open Graph URLs will not resolve absolutely once the site is live; and there is no `openGraph.images` entry.
