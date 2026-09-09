# Manifest — Master's project lab (RPTU, WS 2024/25)

Pick-and-place with a Franka Emika Panda and an Intel RealSense D455.
Group P5, Institute of Control Systems, RPTU Kaiserslautern-Landau.

**Received** 2026-09-08, attached by Amin Daryan to a Claude Code session.
**Original location** `Desktop/RCS_Lab_Group_P5_Final/RCS_Lab_Group_P5_Final/`.
Files were copied verbatim; none were edited, renamed or re-encoded.

## The report is NOT tracked in git

This repository is public, and the report is a **four-person group deliverable**
carrying three other students' work and two supervisors' names on its title
page. Publishing it is the group's decision, not Amin's alone, so it lives in
`private/` and is gitignored. Every fact the site relies on is quoted with a
page number in [`../../notes/cas-project-lab.md`](../../notes/cas-project-lab.md).

| File | Bytes | Modified | SHA-256 |
| --- | ---: | --- | --- |
| `private/CAS Project_Lab.pdf` | 729,377 | 2025-04-08 | `b602376e1f2e7ac3c1508f25f2920b67029bb61e7aa2ee995db2f2590747befc` |

## Tracked in git

| File | Bytes | Modified | SHA-256 |
| --- | ---: | --- | --- |
| `README_ImageProcessing.md` | 6,365 | 2025-04-10 | `14b1cc7612053dd522462f5ac4966c02f4e54839f378170e7e9ec850e33acf15` |
| `README_ManipulatorControl.md` | 4,978 | 2025-04-10 | `1fb903dac09ce6efbce256fa2cf8df0d762386cd7bc258d8dfcb12a560444bc1` |

**`CAS Project_Lab.pdf`** — the submitted report. 10 pages (2 blank), LaTeX,
`book`-style with a title page, contents, and two numbered chapters. Title page
gives the semester, the group number, all four members, the department and
institute, and both supervisors. Contains the two system figures the notes cite.

**`README_ImageProcessing.md`** — the perception repository's README. First
person throughout, with a dated development history running 2024-12-15 to
2025-03-21. This is the vision half of the system.

**`README_ManipulatorControl.md`** — the ROS/MoveIt repository's README. Third
person, ends with a `## Contributors` section naming one person. This is the
manipulation half. Points at `github.com/b-erikan/Project_Lab_RCS`.

## Not tracked in git — present in the working copy only

`docs/sources/**/media/` is gitignored; see [`../../README.md`](../../README.md)
for why, and for how to change that if you would rather have them versioned.

| File | Bytes | Duration | Video | Audio | SHA-256 |
| --- | ---: | ---: | --- | --- | --- |
| `media/Demo1.mp4` | 15,091,213 | 69.8 s | H.264, 480×864 (portrait) | AAC | `35ec6ce44951e20f1963f00c247e545860e8e2195be417deb032916f8e33de64` |
| `media/Demo2.mp4` | 17,984,954 | 83.2 s | H.264, 480×864 (portrait) | AAC | `1f4139aa28fc8a8fe37feb84a11dd8576c77f245cea81d7b11d6021a7ab14604` |

Both recorded 2025-03-23, minutes apart, on a phone held vertically. Metadata
was read by parsing the `mvhd` and `tkhd` atoms directly — there is no ffmpeg on
this machine, so **nothing in the notes describes what the videos show**. Any
future claim about their content has to come from someone who has watched them.

## Not present

The source code itself. Both READMEs describe scripts
(`Cuboid_object_coordinates_and_angles_detection.py`, `train_model.py`,
`gripper_control.cpp`, the `Manipulator` class) that were not attached, and the
public repository they point at is one team member's. Every technical claim in
the notes therefore rests on the report and the two READMEs, never on code that
was read.
