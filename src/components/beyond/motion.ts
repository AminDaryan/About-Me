import type { MotionTrack } from "./useIllustrationLoop";
import type { Subject } from "./StudyDrawings";
import { writingCurve, writingReturn, ornamentCurve, ornamentReturn, outboundCurve, inboundCurve } from "./geometry";

const round = (value: number) => Number(value.toFixed(5));
const smooth = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};
const segment = (phase: number, start: number, end: number) => smooth((phase - start) / (end - start));
const translate = (x: number, y: number) => `translate(${round(x)}px, ${round(y)}px)`;
const rotate = (angle: number) => `rotate(${round(angle)}deg)`;
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
  history: {
    duration: 4000,
    tracks: { pendulum: p => ({ transform: rotate(-8 * Math.cos(2 * Math.PI * p)) }) },
  },
  philosophy: writing(false),
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
  dance: {
    duration: 4800,
    tracks: Object.fromEntries(["lead-step", "lead-close", "follow-step", "follow-close"].map(name => [name, (p: number) => {
      const delay = name.endsWith("close") ? .08 : 0;
      const phase = segment(p, delay, 1 - delay);
      const stride = -12 * Math.sin(2 * Math.PI * phase);
      return { transform: translate(0, name.startsWith("follow") ? -stride : stride) };
    }])),
  },
  chess: {
    duration: 6000,
    tracks: {
      knight: p => {
        const there = segment(p, .1, .4);
        const back = segment(p, .58, .88);
        const x = 40 * (there - back);
        const lift = 12 * (Math.sin(Math.PI * there) + Math.sin(Math.PI * back));
        return { transform: translate(x, -9 * (there - back) - lift) };
      },
    },
  },
  badminton: {
    duration: 5200,
    tracks: {
      shuttle: p => {
        const out = segment(p, .08, .44);
        const back = segment(p, .56, .92);
        const point = p <= .5 ? outboundCurve(out) : inboundCurve(back);
        // Turn at each contact, while still against the racket, then depart.
        const angle = p < .44 ? -57 + 114 * out
          : p < .56 ? 57 + 168 * segment(p, .44, .56)
          : p < .92 ? 225 - 90 * back
          : 135 - 192 * segment(p, .92, 1);
        return { transform: `${translate(point.x, point.y)} ${rotate(angle)}` };
      },
      "racket-left": p => ({ transform: rotate(9 * segment(p, 0, .08) * (1 - segment(p, .08, .28))) }),
      "racket-right": p => ({ transform: rotate(-9 * segment(p, .44, .56) * (1 - segment(p, .56, .76))) }),
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
