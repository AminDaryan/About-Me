import type { MotionTrack } from "./useIllustrationLoop";
import type { Subject } from "./StudyDrawings";
import { fromInkwell, inkwellDip, inkwellMouth, ornamentCurve, ornamentReturn, toInkwell, writingCurve } from "./geometry";
import { knightFrom, knightPose, knightTo } from "./board";

const round = (value: number) => Number(value.toFixed(5));
const smooth = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};
const segment = (phase: number, start: number, end: number) => smooth((phase - start) / (end - start));
const translate = (x: number, y: number) => `translate(${round(x)}px, ${round(y)}px)`;
const frames = (sample: (phase: number) => Keyframe): Keyframe[] =>
  Array.from({ length: 241 }, (_, i) => ({ ...sample(i / 240), offset: i / 240 }));

type Sample = (phase: number) => Keyframe;
type Study = { duration: number; tracks: Record<string, Sample> };

/* The book's quill, one cycle, starting and ending where it rests: at the end
   of the line it has just written, leaning back at 20°.

   It used to rest at the start of a line that was already written in full ink,
   then slide along it with a faint wet stroke drawn over the dry one — so the
   quill looked to be going backwards at rest, and in motion nothing appeared
   behind the nib at all. Now the line is really written: the nib dips in the
   inkwell, the old line is gone by the time it comes back to the page, and the
   ink appears under the nib as it moves.

   A loop has to take the old line away somewhere. It fades while the nib is in
   the inkwell, where the eye is; it is back at full ink only once the reveal
   has hidden it, so it is never seen to reappear.

     .00–.06  rest at the end of the line
     .06–.20  lift and carry to the inkwell, straightening to upright
     .20–.27  dip in and out; the old line fades as it does
     .27–.43  arc back over the page to the start of the line, leaning again
     .43–.86  write: the nib walks the line and the ink follows it
     .86–1    rest */
const LEAN = 20;
const reading: Study = {
  duration: 7200,
  tracks: {
    quill: p => {
      let point = writingCurve(1);
      let lean = LEAN;
      if (p >= .06 && p < .2) {
        point = toInkwell(segment(p, .06, .2));
        lean = LEAN * (1 - segment(p, .06, .18));
      } else if (p >= .2 && p < .27) {
        const dip = (1 - Math.cos(2 * Math.PI * (p - .2) / .07)) / 2;
        point = { x: inkwellMouth.x, y: inkwellMouth.y + inkwellDip * dip };
        lean = 0;
      } else if (p >= .27 && p < .43) {
        point = fromInkwell(segment(p, .27, .43));
        lean = LEAN * segment(p, .29, .41);
      } else if (p >= .43 && p < .86) {
        point = writingCurve(segment(p, .45, .86));
      }
      return { transform: `${translate(point.x, point.y)} rotate(${round(lean)}deg)` };
    },
    "written-line": p => ({ opacity: p < .2 || p >= .36 ? 1 : 1 - segment(p, .2, .26) }),
    "writing-mask": p => ({
      strokeDashoffset: p < .3 ? 0 : p < .45 ? 1 : round(1 - segment(p, .45, .86)),
    }),
  },
};

/** The ornament's flourish: the older cycle, kept as it was drawn for it. */
function writing(): Study {
  return {
    duration: 6200,
    tracks: {
      quill: p => {
        const point = p < .62 ? ornamentCurve(segment(p, .1, .58)) : ornamentReturn(segment(p, .62, .96));
        return { transform: translate(point.x, point.y) };
      },
      "writing-mask": p => ({ strokeDashoffset: p > .9 ? segment(p, .9, .96) : 1 - segment(p, .1, .58) }),
      "wet-ink": p => ({ opacity: segment(p, .06, .1) * (1 - segment(p, .66, .88)) * .7 }),
    },
  };
}

// A shared phase drives paired objects; no independently timed nock, pen or foot.
export const studies: Record<Subject, Study> = {
  reading,
  ornament: writing(),
  psychology: {
    duration: 5600,
    tracks: { thought: p => ({
      strokeDashoffset: round(p > .9 ? -1 + segment(p, .9, 1) : -segment(p, 0, .8)),
      opacity: segment(p, .03, .12) * (1 - segment(p, .74, .88)) * .85,
    }) },
  },
  archery: {
    duration: 4800,
    tracks: {
      bowstring: p => ({ transform: `scaleX(${round(.001 + .999 * (1 - Math.cos(2 * Math.PI * p)) / 2)})` }),
      arrow: p => ({ transform: translate(-24 * (.001 + .999 * (1 - Math.cos(2 * Math.PI * p)) / 2), 0) }),
    },
  },
  chess: {
    duration: 6000,
    tracks: {
      // The knight travels over the board rather than across the drawing, so
      // it shrinks as it moves away up the board and its hop stays upright.
      knight: p => {
        const there = segment(p, .1, .4);
        const back = segment(p, .58, .88);
        const away = there - back;
        const lift = .45 * (Math.sin(Math.PI * there) + Math.sin(Math.PI * back));
        return { transform: knightPose({
          file: knightFrom.file + (knightTo.file - knightFrom.file) * away,
          rank: knightFrom.rank + (knightTo.rank - knightFrom.rank) * away,
        }, lift) };
      },
    },
  },
};

export const builders = Object.fromEntries(Object.entries(studies).map(([subject, study]) => [subject, (root: HTMLElement): MotionTrack[] =>
  Object.entries(study.tracks).map(([name, sample]) => {
    const element = root.querySelector(`[data-motion="${name}"]`);
    if (!element) throw new Error(`Missing ${subject} illustration track: ${name}`);
    return { element, keyframes: frames(sample) };
  }),
])) as Record<Subject, (root: HTMLElement) => MotionTrack[]>;
