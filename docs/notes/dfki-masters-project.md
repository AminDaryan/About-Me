# Notes — Master's project: gaze classification with HoloLens 2

*Read from [`../sources/dfki-masters-project/`](../sources/dfki-masters-project/)
on 2026-09-09. Page numbers are the report's own printed pages; the front matter
runs I–VIII, so body page n is PDF page n+8. Table values are read from the
file's text layer.*

This closes the largest gap the transcript exposed. The site knew Amin worked on
gaze at DFKI and said so in two thin sentences; it did not know that the work
had produced a 77-page single-authored report with an experiment, ten
participants and four trained classifiers behind it.

---

## 1. The document

| | |
| --- | --- |
| **Title** | Classification of Eye Movements from Eye Tracking Data Recorded With HoloLens 2 |
| **Author** | Amin Dariani — sole author |
| **Advisors** | Prof. Dr.-Ing. Daniel Görges; M.Sc. Snehal Walunj |
| **Institute** | Institute of Electromobility, Department of Electrical and Computer Engineering, RPTU |
| **Dated** | 31 March 2026 |
| **Experiment site** | the smart factory of the DFKI institute of Kaiserslautern (p. 30) |

Note the split the site has to get right: the module is **examined at RPTU's
Institute of Electromobility**, while the **experiment was run at DFKI**. Both
are true, and stating only one of them would be misleading.

The transcript records *Master Project CAS* on **06.03.2026** while the report is
dated **31 March 2026**. The filename is `…_Final_Update.pdf`, so the likeliest
reading is that the grade was entered first and the document revised afterwards.
Not a contradiction; worth knowing before quoting a date on the CV. **The site
therefore says "2026" and no finer.**

## 2. The question

> This work seeks to determine whether a set of eye movement patterns can be
> reliably classified and distinguished in a defined set of activities using
> several Machine Learning (ML) algorithms. (p. 1)

The motivation is industrial: a HoloLens 2 that can tell what a factory worker
is doing, from their gaze alone, could guide them through the task without being
asked (p. 1). Gaze is the input precisely because it is available *before* the
action — the same reason the site already gives for finding this problem
interesting.

## 3. The apparatus

- **Microsoft HoloLens 2**, with its built-in eye tracker.
- **Unity + MRTK** (Mixed Reality Toolkit) for the application, and **ARETT**
  (Augmented Reality Eye Tracking Toolkit) for the gaze stream (pp. 5–8, 27).
- **GEAR** — Gaze-Enabled Activity Recognition, the prior work this builds on
  (p. 10; Bektaş, *Computers in Biology and Medicine* 158, 2024). Three of the
  four classifiers were chosen from that paper.

**The detail worth keeping.** GEAR's own HoloLens app was tried and rejected:
its data collection rate was only **10 Hz, 20 Hz short of the 30 Hz** used in
the literature and available through ARETT, so a custom Unity/MRTK/ARETT app was
built and used instead (p. 28). That is a real engineering judgement with a
number attached to it, and it is the kind of thing a CV entry should be made of.

## 4. The experiment

Four activities chosen to stand in for industrial work, about a minute each
(p. 29):

1. **Walking** — moving about, focusing on nothing in particular.
2. **Waiting** — stationary, looking around with no target.
3. **Tool usage** — gluing 3D-printed parts with a glue gun.
4. **Assembling** — building `smartFactory` truck-shaped parts onto a chassis.

Walking and waiting were included deliberately as the *hard* case: gaze during
them shows "high temporal variability and context-dependent patterns", which the
report calls a representative example of naturalistic behaviour (p. 29).

**Ten volunteers**, roughly fifteen minutes each, in the DFKI smart factory
(p. 30). Each session began with the HoloLens's own calibration routine.

**19 engineered features** (Table 5.3, p. 33), in four families: blink statistics
(count, mean/max/min duration, rate); fixation duration statistics (mean, min,
max, variance, standard deviation); fixation dispersion statistics (the same five
again); and spatial summaries — fixation frequency per second, dominant
horizontal and vertical direction, and fixations per bounding-box area.

## 5. The results

Accuracy by train/test split (Table 5.1, p. 31 — the LSTM row as corrected in
§6, since the published table was wrong in all three cells):

| Method | 80–20 | 70–30 | 60–40 |
| --- | ---: | ---: | ---: |
| SVM linear | 87.32 | 86.38 | 84.51 |
| SVM polynomial | 100 | 99.06 | 96.13 |
| SVM RBF | 100 | 99.06 | 95.07 |
| SVM sigmoid | 62.68 | 60.09 | 59.51 |
| Random Forest | 100 | 100 | 98.59 |
| **Extra Trees** | **100** | **100** | **99.29** |
| LSTM | 98.59 | 95.77 | 93.31 |

Hyperparameters were chosen by grid search with cross-validation; 80/20 was the
headline split, argued from the small dataset (p. 32).

**Read this honestly.** Three methods hit 100% at 80–20 on data from ten people.
That is a ceiling effect on a small sample, not a claim that the problem is
solved, and the report knows it — the conclusion asks for more data (p. 59).
The **60–40 column is the informative one**, because it is the only split that
separates the methods, and there **Extra Trees leads at 99.29%**. That is the
number the site quotes, and it quotes the split with it.

Table 5.2 (p. 31) adds per-class recall at the 60–40 split. Extra Trees: 0.97
assembly, 1.0 gluing, 1.0 waiting, 1.0 walking; F1 0.993.

**The negative result is the most interesting part.** The LSTM — the one
algorithm Amin added beyond GEAR's three — *did not win*. It trails both tree
ensembles and the polynomial SVM at every split, and cost far more computation, and the report says plainly why: LSTMs need a great
deal of data, this dataset was small, "and the results after running the code
were not always similar" (p. 59). An attempt to fix that with **SMOTE**
over-sampling was tried and **abandoned because it lowered accuracy** (p. 28).
Reporting a method you introduced yourself, that then lost, and the fix that did
not work, is the good kind of research writing. It is worth a sentence on the
site.

## 6. Defects found in the document — and fixed in the source

Recorded for the same reason as the FUME paper's arithmetic: someone may check.
On 2026-09-09 the LaTeX source under `My Report Latex Paper/` was corrected
(`Chapters/Classification_Results.tex`, original kept as `.tex.bak-20260909`)
and the PDF rebuilt to 77 pages. Every item below was verified in the rebuilt
PDF's text layer.

**Fixed — two unresolved cross-references.** `\ref{tab:results_simple}` and
`\ref{fig:svm_linear_confusion_matrix}` named labels that were never defined, so
pages 31 and 32 read "the Table??" and "Figure??". They now point at
`tab:accuracy_results_for_various_splits_of_each_ml_method` and
`fig:svm_linear_confusion_matrix_split_80_20`.

**Fixed — Table 5.1's LSTM row was wrong in all three cells.** It read
`95.77 / 94.23 / 0`. Each split's own subsection states its accuracy in prose,
and those are authoritative:

| Split | Table 5.1 said | The text says |
| --- | ---: | ---: |
| 80–20 | 95.77 | **98.59** |
| 70–30 | 94.23 | **95.77** |
| 60–40 | 0 | **93.31** |

The row looks as though it was filled from the wrong lines and abandoned: its
80–20 figure is the text's 70–30 figure, its 70–30 figure appears nowhere in the
document, and its 60–40 cell was a placeholder zero.

**Fixed — Table 5.2's SVM polynomial accuracy.** It read 93.13% where Table 5.1
said 96.13%. The confusion matrix on p. 39 settles it: 74 + 67 + 66 + 66 = 273
correct of 284 = **96.13%**, and the prose on that page says 96.13% too.

**Fixed — Table 5.2's LSTM row was `0 0 0 0 0 0`.** Table 5.2 reports the 60–40
split: every other row's accuracy matches Table 5.1's 60–40 column, and the SVM
polynomial recalls reproduce exactly from the 60–40 confusion matrix. The 60–40
subsection supplies the missing row — recall 0.89 assembly, 0.89 gluing, 0.96
waiting, 1.00 walking, F1 0.93, accuracy 93.31%.

**Fixed — three mis-captioned tables.** Each LSTM split's recall/F1 table
carried a copy of its neighbour's caption, "Hyperparameters used for LSTM Split
X", so the List of Tables showed that caption twice per split. They now read
"Recall, accuracy and F1-score for LSTM Split X".

**Fixed — two stray lines.** The word `elate` sat on its own line twice in the
LSTM section and rendered into the PDF.

**Fixed — the document would not rebuild at all.** 21 subsubsection headings
passed `Training split 80\%-20\%` as the *PDF-bookmark* half of
`\texorpdfstring`. An escaped percent cannot appear in a bookmark string, so
hyperref aborted with "Missing \endcsname inserted" and produced no PDF. The
bookmark strings are now plain (`Training split 80-20`); the visible headings
keep their percent signs. This bug predates today's edits — it simply had not
been hit since the last successful build.

### Not fixed, because the document cannot supply it

**All six LSTM figures are the same two images.** Each of
`fig:lstm__confusion_matrix_split_{80_20,70_30,60_40}` includes
`Images/Results/LSTM_Confusion_Matrix.png`, and all three training-loss figures
include `Images/Results/LSTM_Training_Loss.png`. Figures 5.19 and 5.21 are
pixel-identical, as are 5.18 and 5.20.

Worse, that confusion matrix matches **none** of the three reported accuracies:
it totals 58 test samples with 49 correct — 84.48% — against 98.59%, 95.77% and
93.31%. With ~1,200 sequences even a 20% test split is ~240 samples, so 58
cannot be any of these runs; the image is left over from an earlier experiment
on the un-expanded data.

Nothing in the document can supply the three correct images. **They have to be
re-exported from the notebooks.** They were left in place rather than deleted,
because removing figures from a graded report is Amin's call.

## 7. What reached the site

- `/research`: the thin two-sentence gaze entry is now the real thing — the
  question, HoloLens 2 with ARETT, the 10 Hz rejection, four activities, ten
  participants at the DFKI smart factory, 19 features, Extra Trees at 99.3% on
  the hardest split, and the LSTM that lost.
- `/cv`: a master's project line under Education, correctly attached to *this*
  module — the label the project lab had been wearing until yesterday.
- `/cv` and `/experience`: the DFKI entries name HoloLens 2 and the four
  activities.
- Advisors are named on `/cv`, as is normal for a supervised project.

## 8. Not claimed

Nothing about the photographs or the video, which are unpublished and one of
which shows an unidentified person — see the manifest. No claim that the LSTM
improved on the baseline, because it did not. No accuracy figure quoted without
the split it belongs to.
