/* The ink line down the right margin of /beyond, as geometry and nothing else:
   where each portrait is pinned, the path the quill takes between them, and the
   drops and splatters it leaves. All lengths are CSS pixels in the coordinate
   space of the element the line is drawn over, with y growing down the page. */

import { random } from "./splatter";

export type Point = { x: number; y: number };
export type Drop = Point & { r: number };
/** Where a splatter lands, how far it may reach, and the seed its shape is
    drawn from. */
export type SplatterSpot = Point & { reach: number; seed: number };

export type TrailInput = {
  /** The strip of margin the line and the portraits may use. */
  lane: { left: number; right: number };
  /** Where the line starts, and the lowest any ink may reach. */
  top: number;
  bottom: number;
  /** Each portrait: the middle of its paragraph, how tall the whole portrait
      stands, and how tall its print is without the name set under it. */
  anchors: { id: string; y: number; height: number; print: number }[];
  /** How wide a portrait stands. */
  width: number;
  /** The least space between two portraits. */
  gap: number;
  /** Where the middle splatter lands and what every splatter looks like; a
      new seed is a new arrangement. */
  seed: number;
};

export type Placement = { id: string; x: number; y: number };

export type Trail = {
  placements: Placement[];
  /** SVG path data. Every segment runs down the page, never up, so a given
      height on the page is reached at exactly one length along the line. */
  d: string;
  drops: Drop[];
  /** Where the line begins, somewhere about its middle, and where it ends. */
  splatters: SplatterSpot[];
};

const round = (value: number) => Math.round(value * 10) / 10;
const at = (p: Point) => `${round(p.x)} ${round(p.y)}`;

/** A meandering hand line needs this much height for each swing across the
    lane; less and it reads as a zigzag, more and as a sag. */
const LEG = 260;

/** How far each splatter may reach from its centre at most — the last, where
    the line stops, the largest — and the least worth drawing, below which a
    splatter reads as a smudge and is left out. At half these sizes they were
    lost beside the prints. */
export const REACH = { begin: 76, middle: 64, end: 88, least: 40 };
/** The paper kept clear between a splatter and a name, a print or another
    splatter. */
export const CLEAR = 8;
/** The share of a splatter's reach round its centre that no print may cover.
    Past it a print may lie over the spray, as a cutting pinned over a blot
    would: the pool still shows, and a splatter fits beside a print in a lane
    too narrow to hold one clear of it. A name never lies over any of it —
    spray through lettering reads as a stain on the name. */
export const HEART = 0.4;
/** How far a splatter's spray may run past the lane, which already stands well
    clear of the text and of the edge of the page. */
export const SPILL = 20;

type Box = { left: number; top: number; right: number; bottom: number };

const distance = (p: Point, box: Box) =>
  Math.hypot(Math.max(box.left - p.x, 0, p.x - box.right), Math.max(box.top - p.y, 0, p.y - box.bottom));

/**
 * The tops that keep a column of portraits in order, `gap` apart and no higher
 * than `floor`, while moving them as little as possible from where each wants
 * to stand: the least squares fit, by pooling neighbours that collide.
 */
function stack(wants: number[], heights: number[], gap: number, floor: number): number[] {
  const offsets: number[] = [];
  let run = 0;
  for (const height of heights) {
    offsets.push(run);
    run += height + gap;
  }
  // Take each print's offset in the column away, and the question becomes a
  // sequence that must never decrease.
  const pools: { sum: number; count: number }[] = [];
  wants.forEach((want, i) => {
    pools.push({ sum: want - offsets[i], count: 1 });
    while (pools.length > 1 && pools[pools.length - 2].sum / pools[pools.length - 2].count > pools[pools.length - 1].sum / pools[pools.length - 1].count) {
      const last = pools.pop();
      if (last) {
        pools[pools.length - 1].sum += last.sum;
        pools[pools.length - 1].count += last.count;
      }
    }
  });
  return pools.flatMap((pool) => Array(pool.count).fill(Math.max(floor, pool.sum / pool.count))).map((v, i) => v + offsets[i]);
}

export function planTrail({ lane, top, bottom, anchors, width, gap, seed }: TrailInput): Trail | null {
  const left = lane.left + 8;
  const right = lane.right - 8;
  const span = right - left;
  if (span < width) return null;
  const clampX = (x: number) => Math.min(right, Math.max(left, x));
  const mid = (left + right) / 2;

  /* Portraits alternate sides of the lane, so the line has somewhere to swing,
     and each is centred on its paragraph as nearly as its neighbours allow:
     where two want the same stretch of margin, both give way, one up and one
     down, by as little as they can between them. Centred rather than hung
     from the first line, because a print is taller than a short paragraph;
     and giving way both ways rather than only downwards, because Reading's
     three paragraphs carry four portraits, and pushed only downwards the last
     of them hung beside the next section. None stands higher than the heart
     of the splatter where the line begins. */
  const tops = stack(
    anchors.map((anchor) => anchor.y - anchor.height / 2),
    anchors.map((anchor) => anchor.height),
    gap,
    top + HEART * REACH.begin + CLEAR,
  );
  const placements = anchors.map((anchor, i) => ({ id: anchor.id, x: i % 2 === 0 ? left : right - width, y: tops[i] }));
  const prints = placements.map((p, i) => ({ left: p.x, top: p.y, right: p.x + width, bottom: p.y + anchors[i].print }));
  const names = placements.map((p, i) => ({ left: p.x, top: p.y + anchors[i].print, right: p.x + width, bottom: p.y + anchors[i].height }));

  // The line ends low enough for its splatter to clear the last name.
  const last = names.at(-1);
  const end = Math.max(bottom - REACH.end, last ? last.bottom + REACH.end + CLEAR : top + REACH.begin + REACH.end);

  /* The line slips under each print through the side that faces the middle of
     the lane and comes out lower on the same side, passing behind it. It used
     to run in at the top and out at the foot, and the foot is where the name
     is set: the line struck through every name it passed. */
  const inner = (p: Placement, i: number) => (i % 2 === 0 ? p.x + width - 14 : p.x + 14);
  const outward = (i: number) => (i % 2 === 0 ? 1 : -1);
  const stops: Point[] = [{ x: mid, y: top }];
  placements.forEach((p, i) => {
    const x = inner(p, i);
    stops.push({ x, y: p.y + 26 }, { x, y: p.y + anchors[i].print - 26 });
  });
  stops.push({ x: mid, y: end });

  // Points along the line as it is drawn, for the middle splatter to find it.
  const along: Point[] = [stops[0]];
  let d = `M${at(stops[0])}`;
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1];
    const b = stops[i];
    // Inside a print: straight, and hidden by it.
    if (i % 2 === 0) {
      d += `L${at(b)}`;
      along.push(b);
      continue;
    }
    /* Each leg bows out to one side and back, rather than crossing over as an
       S does. The first leg out of a print bows away from it, towards the
       middle of the lane, and comes into the next print from that same side,
       over the print, where the print hides it. In a narrow lane two prints
       overlap across the lane, and the next one's way in stands right under
       the name set beneath the last: an S cut straight through that name. Legs
       after the first bow to alternate sides, which is the meander. Stops 2j+1
       and 2j+2 are print j's way in and out. */
    const before = i >= 3 ? (i - 3) / 2 : -1;
    const legs = Math.max(1, Math.round((b.y - a.y) / LEG));
    let bow = before >= 0 ? outward(before) : 1;
    let from = a;
    for (let k = 1; k <= legs; k++) {
      const to = k === legs
        ? b
        : { x: bow > 0 ? right - span * 0.12 : left + span * 0.12, y: a.y + ((b.y - a.y) * k) / legs };
      const dy = to.y - from.y;
      const swing = Math.min(span * 0.5, 36 + dy * 0.18);
      /* Control points stay between the ends in height, which is what keeps
         every segment running down the page; both lie on the side it bows to,
         and the next leg's first lies on the other, so a bend is smooth where
         two legs meet. */
      const c1 = { x: clampX(from.x + bow * swing), y: from.y + dy * 0.45 };
      const c2 = { x: clampX(to.x + bow * swing), y: to.y - dy * 0.45 };
      d += `C${at(c1)} ${at(c2)} ${at(to)}`;
      for (let t = 1 / 16; t <= 1; t += 1 / 16) {
        const u = 1 - t;
        along.push({
          x: u ** 3 * from.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t ** 3 * to.x,
          y: u ** 3 * from.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t ** 3 * to.y,
        });
      }
      bow = -bow;
      from = to;
    }
  }

  // A spatter beside each print where the line leaves it, clear of the name.
  const drops: Drop[] = [];
  placements.forEach((p, i) => {
    const edge = i % 2 === 0 ? p.x + width : p.x;
    const leave = p.y + anchors[i].print - 26;
    const out = outward(i);
    drops.push({ x: clampX(edge + out * 12), y: leave + 14, r: 2 }, { x: clampX(edge + out * 22), y: leave + 30, r: 1.3 });
  });

  /* Splatters where the nib is set down and where it is lifted, on the line's
     two ends, and one thrown somewhere about its middle. */
  const splatters: SplatterSpot[] = [];
  const fits = (p: Point, reach: number) =>
    p.x - reach >= left - SPILL && p.x + reach <= right + SPILL &&
    prints.every((box) => distance(p, box) >= HEART * reach + CLEAR) &&
    names.every((box) => distance(p, box) >= reach + CLEAR) &&
    splatters.every((s) => Math.hypot(s.x - p.x, s.y - p.y) >= s.reach + reach);
  const rand = random(seed);
  const land = (p: Point, reach: number) => splatters.push({ ...p, reach, seed: Math.floor(rand() * 2 ** 32) });
  const largest = (p: Point, most: number) => {
    for (let reach = most; reach >= REACH.least; reach -= 2) if (fits(p, reach)) return reach;
    return 0;
  };
  for (const [p, most] of [[stops[0], REACH.begin], [stops[stops.length - 1], REACH.end]] as const) {
    const reach = largest(p, most);
    if (reach) land(p, reach);
  }

  /* The middle one aims at a point on the line chosen at random from its
     middle fifth, and lands on the nearest spot about there where it fits —
     as large as it can be first and as near its aim as it can be second, since
     a full splatter a little way off reads better than a crumb in the exact
     place. Beside a print, the nearest such spot is across the lane from it. */
  const length = end - top;
  const aimY = top + length * (0.4 + rand() * 0.2);
  const aim = along.reduce((best, p) => (Math.abs(p.y - aimY) < Math.abs(best.y - aimY) ? p : best), along[0]);
  for (let reach = REACH.middle; reach >= REACH.least; reach -= 4) {
    let best: Point | null = null;
    let nearest = Infinity;
    for (let y = aim.y - length * 0.2; y <= aim.y + length * 0.2; y += 4) {
      for (let x = left - SPILL + reach; x <= right + SPILL - reach; x += 4) {
        const off = Math.hypot(x - aim.x, y - aim.y);
        if (off < nearest && fits({ x, y }, reach)) {
          nearest = off;
          best = { x, y };
        }
      }
    }
    if (best) {
      land(best, reach);
      break;
    }
  }
  splatters.sort((a, b) => a.y - b.y);

  return { placements, d, drops, splatters };
}
