import type { MotionTrack } from "./useIllustrationLoop";
import type { Subject } from "./StudyDrawings";
import { writingCurve, writingReturn, ornamentCurve, ornamentReturn } from "./geometry";
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

function writing(ornament: boolean): Study {
  const inkCurve = ornament ? ornamentCurve : writingCurve;
  const returnCurve = ornament ? ornamentReturn : writingReturn;
  return {
    duration: 6200,
    tracks: {
      quill: p => {
        const point = p < .62 ? inkCurve(segment(p, .1, .58)) : returnCurve(segment(p, .62, .96));
        return { transform: translate(point.x, point.y) };
      },
      "writing-mask": p => ({ strokeDashoffset: p > .9 ? segment(p, .9, .96) : 1 - segment(p, .1, .58) }),
      "wet-ink": p => ({ opacity: segment(p, .06, .1) * (1 - segment(p, .66, .88)) * .7 }),
    },
  };
}

// A shared phase drives paired objects; no independently timed nock, pen or foot.
export const studies: Record<Subject, Study> = {
  reading: writing(false),
  ornament: writing(true),
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
