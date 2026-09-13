import type { Point } from "./geometry";

/*
 * The chessboard beside the chess paragraph, seen from White's chair.
 *
 * It used to be sixty-four slabs twenty units wide and nine deep, with every
 * file line parallel and a rule between each square. That is a brick wall, not
 * a board: nothing narrowed with distance, the dark squares were a twelfth of a
 * tone and could not be told from the light ones, and a real board has no
 * lines between its squares. So the board is projected — one-point
 * perspective, from a seat in front of it — and a square is known only by its
 * tone, as on the real thing.
 *
 * Board coordinates are in squares: file from the a-file's outer edge (0–8),
 * rank from the first rank's near edge (0–8), height above the playing
 * surface. Drawing units come out of the projection, with the far edge of the
 * rim at y = 0 and its near left corner at x = 0, so the board's own extent is
 * the frame it is drawn in.
 */

/** The eye: how many squares back from the first rank, and how many above the surface. */
const EYE = { back: 18, up: 11.3 };
/** Drawing units one square spans at a distance of one square from the eye. */
const FOCAL = 381;
/** The wooden border outside the sixty-four squares, and the board's thickness, in squares. */
const RIM = 0.5;
const THICKNESS = 0.3;
/** A Staunton knight stands a little taller than its square is wide, and a
    little more is allowed for a piece seen standing up rather than from above;
    the outline in StudyDrawings is KNIGHT_UNITS tall. */
const KNIGHT_SQUARES = 1.7;
export const KNIGHT_UNITS = 55;

const round = (value: number) => Number(value.toFixed(3));
const spread = (rank: number) => FOCAL / (EYE.back + rank);
const CENTRE = (4 + RIM) * spread(-RIM);
const TOP = -EYE.up * spread(8 + RIM);

export type Square = { file: number; rank: number };
export type Projected = Point & { scale: number };

/** Where a point on or above the board lands in the drawing, and how many drawing units a square spans there. */
export function project(file: number, rank: number, height = 0): Projected {
  const scale = spread(rank);
  return { x: CENTRE + (file - 4) * scale, y: TOP + (EYE.up - height) * scale, scale };
}

const at = (file: number, rank: number, height = 0) => {
  const { x, y } = project(file, rank, height);
  return `${round(x)} ${round(y)}`;
};
const quad = (file0: number, rank0: number, file1: number, rank1: number) =>
  `M${at(file0, rank0)}L${at(file1, rank0)}L${at(file1, rank1)}L${at(file0, rank1)}Z`;

/** A square's centre, from its name in board coordinates: a1 is file 0, rank 0. */
export const centre = ({ file, rank }: Square): Square => ({ file: file + 0.5, rank: rank + 0.5 });

/** g1 to f3, as in 1. Nf3: one file across and two ranks up the board. */
export const knightFrom = centre({ file: 6, rank: 0 });
export const knightTo = centre({ file: 5, rank: 2 });

/** The knight's transform, standing at a point of the board and lifted `lift` squares off it. */
export function knightPose({ file, rank }: Square, lift = 0): string {
  const { x, y, scale } = project(file, rank, lift);
  return `translate(${round(x)}px, ${round(y)}px) scale(${round((scale * KNIGHT_SQUARES) / KNIGHT_UNITS)})`;
}

/** A ring lying flat on a square: a circle of `radius` squares, foreshortened by the angle the eye sees it at. */
export function ring({ file, rank }: Square, radius: number) {
  const { x, y, scale } = project(file, rank);
  return { cx: round(x), cy: round(y), rx: round(radius * scale), ry: round((radius * scale * EYE.up) / (EYE.back + rank)) };
}

const darkSquares = Array.from({ length: 64 }, (_, i) => ({ file: i % 8, rank: Math.floor(i / 8) }))
  // a1 is dark, so a square is dark when its file and rank are both odd or both even.
  .filter(({ file, rank }) => (file + rank) % 2 === 0)
  .map(({ file, rank }) => quad(file, rank, file + 1, rank + 1))
  .join("");

export const board = {
  /** The viewBox: the board's own extent, so the drawing's edges are the board's. */
  frame: `0 0 ${round(2 * CENTRE)} ${round(project(0, -RIM, -THICKNESS).y)}`,
  rim: quad(-RIM, -RIM, 8 + RIM, 8 + RIM),
  surface: quad(0, 0, 8, 8),
  dark: darkSquares,
  /** The near face: the only side of the board the eye can see from in front of it. */
  edge: `M${at(-RIM, -RIM)}L${at(8 + RIM, -RIM)}L${at(8 + RIM, -RIM, -THICKNESS)}L${at(-RIM, -RIM, -THICKNESS)}Z`,
  route: `M${at(knightFrom.file, knightFrom.rank)}L${at(knightFrom.file, knightTo.rank)}L${at(knightTo.file, knightTo.rank)}`,
};
