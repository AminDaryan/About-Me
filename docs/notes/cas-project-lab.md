# Notes — Master's project lab, RPTU Kaiserslautern

*Read from [`../sources/cas-project-lab/`](../sources/cas-project-lab/) on
2026-09-08. Page numbers are the printed page numbers in the report; line
numbers are lines in the README files.*

Three documents, describing one system from two ends. The report is the formal
submission and is deliberately high-level; the two READMEs are the working
documents of the two halves of the codebase, and they are more specific — and in
three places more specific in a way that contradicts the report. That is the
interesting part of reading them together, and it is why the site should be
written from the READMEs where the two disagree.

---

## 1. What the project was

| | |
| --- | --- |
| **Title on the report** | Project Lab, Winter Semester 2024\|25 (p. i) |
| **Group** | P5 — Ahmet Berke Erikan, Amin Darian, Akihito Harasawa, Berkay Yucel (p. i) |
| **Institute** | Department of Electrical and Computer Engineering, Institute of Control Systems (p. i) |
| **Supervisors** | Prof. Dr.-Ing. Steven Liu; M.Sc. Chen Cai (p. i) |
| **University** | RPTU Kaiserslautern-Landau (logo, p. i) |
| **Dated** | development history runs 2024-12-15 → 2025-03-21; the report file is dated 2025-04-08 |

The task, quoted from p. 3:

> This project focuses on executing a simple yet dynamic pick-and-place task
> using a Franka Panda manipulator. The robot identifies a randomly placed
> object on its workspace, plans a collision-free trajectory, and transfers the
> object to a predefined location.

Three stated goals (p. 3): detect and localise a randomly placed object; avoid
known static obstacles; grip and place it at a specified target.

### Hardware and software, as listed (pp. 3–4)

- **Franka Emika Panda, 7-DOF arm with a parallel gripper.** Stated in those
  words on p. 3. This is the single most load-bearing fact here, because the
  site currently calls it a 6R robot — see §5.
- **Intel RealSense D455** for RGB-D input. `README_ImageProcessing.md:79`
  confirms it as a hard requirement; `README_ManipulatorControl.md:19` adds that
  the camera is *mounted on the end-effector*, which the report never says and
  which explains the "go to scan position / get closer and scan again" loop.
- Workstation running ROS **Melodic/Noetic**; **MoveIt** for planning and
  execution; **franka_ros** and **libfranka** for robot and gripper
  communication; a **custom-trained YOLOv5** detector; **OpenCV** for image
  processing and 3D pose extraction.
- Figure 1.1 (p. 4) draws the stack as
  `camera → OpenCV → ROS → MoveIt` for planning and
  `ROS → franka_ros → libfranka → robot` for execution, with joint states
  flowing back up.

---

## 2. The perception half

The report's version (p. 5) is six bullet points. The README is the real
account, and it is a good deal more substantial.

**Getting a detector at all** (Figure 2.1a, p. 6, and
`README_ImageProcessing.md:3–8`) — record a 10-second video of the target
cuboid from varying angles, split it into frames, annotate the frames on
Roboflow, train, and load the resulting weights into the detection script.
Training moved from Google Colab (`:56`) to a local `train_model.py` (`:68`)
between January and March 2025. The target object changed too: a plain blue
cuboid in January (`:50`, `:61`), a cube carrying AprilTags by March (`:64`).
Worth noticing that the AprilTags are on the object but are *not* what localises
it — the pose comes from YOLO plus geometry, not from tag decoding.

**Getting a pose out of a bounding box** (`README_ImageProcessing.md:14–35`).
This is the part of the project with actual content in it:

1. A CAD model of the cuboid (`make_cuboid.py` → `cuboid.stl`) supplies the 3D
   vertices — so the object model is metric and known, not assumed.
2. `detect_corners_in_roi` finds the four corners of the largest contour inside
   the YOLO box; `get_corner_points` reads the box corners themselves.
3. `solve_pnp_with_plane_constraint` runs OpenCV's PnP against those
   correspondences **with a plane constraint** — the object is known to lie on
   the table, which removes the degrees of freedom PnP is worst at recovering
   from a near-planar, near-symmetric target. It returns `rvec`/`tvec`.
4. Only the highest-confidence detection per frame is processed (`:30`).
5. Pose is accumulated over N frames and reduced by
   `filter_outliers_in_quaternions` / `filter_outliers_in_positions`
   (**interquartile-range rejection**, `:22–23`) followed by
   `average_quaternions` / `average_positions` (`:24–25`).
6. Camera intrinsics are read from the RealSense itself rather than hard-coded
   (`:72`) — a small thing that says the person writing it had been bitten before.
7. The result is written to a text file (`write_quaternion_to_file`, `:26`),
   and the model is reprojected into the live frame with drawn *x/y/z* axes for
   visual confirmation (`:32–35`). Figure 2.1b (p. 6) is a screenshot of exactly
   that window.

Python 3.9.13 (`:78`).

---

## 3. The manipulation half

From `README_ManipulatorControl.md`. A ROS/C++ node built around a `Manipulator`
class exposing `goToPose`, `goToPoseCartesian`, `grab`, `release`, `scan`,
`transformPose` and `addObjectToWorkspace` (`:127–140`).

- **Planning** through MoveIt with OMPL, visualised in RViz. The planning scene
  carries predefined static obstacles and MoveIt does the collision checking
  (report p. 6).
- **Planner fallback.** Not one planner but four, tried in turn — RRTConnect,
  LBKPIECE, BiTRRT, TRRT — with increasing timeouts and, failing that, a relaxed
  goal tolerance (`:150–153`). The flowchart on p. 7 draws this as the
  "solution found? → no → change solver and increase tolerance" loop. This is
  the honest engineering detail of the project: a single planner was not enough
  to reach the poses this task produces.
- **Scanning.** The arm moves to a scan pose, scans, and if it finds the object
  moves closer and scans again — three attempts, for precision (`:162`, p. 7).
- **Frames.** TF2 transforms the object pose from the camera frame into the
  robot base frame (`:99–101`).
- **Gripper.** A separate C++ ROS service node wrapping `franka_gripper`'s
  `MoveGoal` and `GraspGoal` through actionlib clients, so grasp and release run
  asynchronously with force and width parameters and logged status (p. 7).
- Public repository: `github.com/b-erikan/Project_Lab_RCS` (`:57`).

---

## 4. Where the report and the code disagree

The site must not repeat a claim the project's own working documents contradict.
In all three cases below the READMEs are the better authority: they were written
against the code, and two of them are corroborated from both halves at once.

| # | Report says | The READMEs say | Take |
| --- | --- | --- | --- |
| 1 | "The filtered pose … is then published via a **ROS topic** to be used by the planning module." (p. 5) | The vision side calls `write_quaternion_to_file` (`ImageProcessing:26`); the manipulation side reads `/tmp/quaternion_average.txt` (`ManipulatorControl:145–147`). | **A file, not a topic.** Corroborated independently from both ends. The report is describing the intent, not the build. |
| 2 | "a **low-pass filter** is applied to the detected position" (p. 5) | IQR outlier rejection over a buffer of N samples, then an average (`ImageProcessing:22–25`, `:27`). | **Not a low-pass filter.** Outlier rejection plus averaging is a different (and, for a detector that occasionally produces a wild pose, better) thing. Say what it is. |
| 3 | "Orientation estimation is done either through **shape assumptions or RGB features**" (p. 5) | PnP against a known CAD model with a plane constraint, on corners found in the ROI (`ImageProcessing:17–21`). | **PnP with a CAD model.** The specific version is both truer and more impressive than the vague one. |

A fourth, softer one: the report pins **YOLOv5** (p. 4), while the README
mentions "YoloV5 or V11" (`:50`) and elsewhere uses the Ultralytics layout
`runs/detect/train/weights/best.pt` (`:11`), which is not a v5 path. The version
that shipped is genuinely ambiguous from these documents. **Write "a
custom-trained YOLO detector" and do not pin a version.**

---

## 5. What this means the site has to change

The master's project currently appears on `/research` and `/cv` as

> Object detection and transfer with a **6R robot** and a RealSense camera

The robot is a Franka Emika Panda: **seven** revolute joints, not six (p. 3).
The "6R" almost certainly migrated in from the genuinely-6R industrial
manipulator documented at the Ferdowsi robotics lab, which is a different
machine on a different continent eight years earlier. On a CV read by roboticists
this is the kind of error that gets noticed, because 6R and 7-DOF are not a
naming preference — the redundancy is the whole reason a Panda plans the way it
does.

The generic figure on the home page (`Fig. 1 — 6R articulated arm`) is a
different matter: it is a decorative scene, it really is drawn with six joints,
and it makes no claim about this project. Leave it alone.

---

## 6. Inferences — not facts

Held separately on purpose. Nothing below should reach the site without
confirmation from Amin.

- **Authorship of the vision half.** `README_ManipulatorControl.md` closes with
  `## Contributors — Ahmet Berke Erikan` (`:171–173`) and is written throughout
  in the third person. `README_ImageProcessing.md` has no contributor list and
  is written in the first person — "*I* was able to make the code detect the
  cubes rotation" (`:71`). Amin attached both, and the file naming of the folder
  is his. The natural reading is that Amin owned the perception half and Berke
  the manipulation half, with Akihito Harasawa and Berkay Yucel on the other two
  shares of a four-person group. **This is an inference from document style, and
  a CV claim about personal contribution is exactly the wrong place to lean on
  one.** Confirm before writing "I built the perception module".
  > **Asked and decided, 2026-09-08.** Amin chose not to name a personal share.
  > The site describes the system and says it was a four-person project lab;
  > it claims no individual portion of it. If that changes, this is the note to
  > revisit — the evidence above is what a claim would rest on.
- **Dates.** WS 2024/25 at RPTU runs roughly October 2024 to March 2025. The
  README history starts 2024-12-15 and ends 2025-03-21; the report file is dated
  2025-04-08. So "winter semester 2024/25" is safe; a month-precise range is not.
- **What "CAS" and "RCS" stand for.** They appear only in filenames — `CAS
  Project_Lab.pdf`, `RCS_Lab_Group_P5_Final`, `Project_Lab_RCS`. Not expanded
  anywhere in the documents. Do not guess at them on the site.
  > **Resolved 2026-09-09** for CAS, by the RPTU transcript: the specialisation
  > is *Vertiefung Connected Automation Systems*, and this work is its **CAS
  > Project Lab** module (5 LP, passed ungraded). The transcript also shows a
  > separate **Master Project CAS** (15 LP, dated 06.03.2026) —
  > a different module, which is why the site no longer calls this one the
  > "master's project". "RCS" is still unexplained.
- **What the demo videos show.** Nobody has watched them; see the manifest.
  > **Asked and decided, 2026-09-08.** They stay here as evidence and stay off
  > the site. Publishing a clip, or stills, would need ffmpeg on this machine
  > and a project page to hold them — both are easy, neither is done.

## 7. Still missing

- The perception source code, which is the half the site would most like to
  describe precisely.
- Whether the project carries a grade, and whether it has a module code worth
  naming on the CV.
- Whether a public repository exists for the vision half, as it does for the
  manipulation half.
