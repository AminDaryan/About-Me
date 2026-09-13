export type Point = { x: number; y: number };
export type Curve = (t: number) => Point;

export const quadratic = (a: Point, b: Point, c: Point): Curve => t => ({
  x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * b.x + t * t * c.x,
  y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * b.y + t * t * c.y,
});

export const cubic = (a: Point, b: Point, c: Point, d: Point): Curve => t => ({
  x: (1 - t) ** 3 * a.x + 3 * (1 - t) ** 2 * t * b.x + 3 * (1 - t) * t * t * c.x + t ** 3 * d.x,
  y: (1 - t) ** 3 * a.y + 3 * (1 - t) ** 2 * t * b.y + 3 * (1 - t) * t * t * c.y + t ** 3 * d.y,
});

// Arc-length lookup keeps a nib aligned with a normalized SVG reveal mask.
export function byLength(curve: Curve): Curve {
  const points = Array.from({ length: 257 }, (_, i) => curve(i / 256));
  const lengths = [0];
  for (let i = 1; i < points.length; i++) {
    lengths.push(lengths[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
  }
  return fraction => {
    const distance = Math.max(0, Math.min(1, fraction)) * lengths[256];
    const upper = lengths.findIndex(length => length >= distance);
    if (upper <= 0) return points[0];
    const mix = (distance - lengths[upper - 1]) / (lengths[upper] - lengths[upper - 1]);
    return {
      x: points[upper - 1].x + (points[upper].x - points[upper - 1].x) * mix,
      y: points[upper - 1].y + (points[upper].y - points[upper - 1].y) * mix,
    };
  };
}

export const writingPath = "M107 100Q133 90 157 95";
export const writingCurve = byLength(quadratic({ x: 107, y: 100 }, { x: 133, y: 90 }, { x: 157, y: 95 }));
// The quill lifts only a little on its way back to the start of the line: on
// a higher arc its feather rose half a line above the drawing's frame.
export const writingReturn = cubic({ x: 157, y: 95 }, { x: 170, y: 76 }, { x: 92, y: 74 }, { x: 107, y: 100 });
export const ornamentPath = "M25 72C70 48 113 96 172 70";
export const ornamentCurve = byLength(cubic({ x: 25, y: 72 }, { x: 70, y: 48 }, { x: 113, y: 96 }, { x: 172, y: 70 }));
export const ornamentReturn = cubic({ x: 172, y: 70 }, { x: 165, y: 36 }, { x: 33, y: 37 }, { x: 25, y: 72 });
