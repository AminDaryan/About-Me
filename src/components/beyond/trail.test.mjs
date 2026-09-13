import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import ts from "typescript";

// The trail's geometry, run as production code without a browser.
const require = createRequire(import.meta.url);
const previousLoader = require.extensions[".ts"];
require.extensions[".ts"] = (module, filename) => {
  module._compile(ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, filename);
};
const { planTrail, REACH, CLEAR, HEART, SPILL } = require("./trail.ts");
const { splatter } = require("./splatter.ts");
require.extensions[".ts"] = previousLoader;

const lane = { left: 1176, right: 1404 };
const base = { lane, top: 24, bottom: 1375, width: 118, gap: 28, seed: 1 };
const portrait = { height: 193, print: 145 };
// The page as it is set: Wittgenstein and Camus share the paragraph on
// philosophy, Jung has the next one, and Fischer the one on chess, a section on.
const anchors = [
  { id: "wittgenstein", y: 385, ...portrait },
  { id: "camus", y: 385, ...portrait },
  { id: "jung", y: 514, ...portrait },
  { id: "fischer", y: 825, ...portrait },
];
// From the narrowest margin the trail is shown in (about 1380px of window) to a
// wide one; the narrow lane is the one where two prints overlap across it.
const lanes = [{ left: 1146, right: 1344 }, lane, { left: 1416, right: 1884 }];

/** Points along the drawn path, sampled from its lines and cubic curves. */
function sample(d) {
  const tokens = [...d.matchAll(/([MLC])([^MLC]*)/g)];
  const points = [];
  let pen = null;
  for (const [, command, args] of tokens) {
    const n = [...args.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
    if (command === "M") pen = { x: n[0], y: n[1] };
    else if (command === "L") {
      const to = { x: n[0], y: n[1] };
      for (let t = 0; t <= 1; t += 0.02) points.push({ x: pen.x + (to.x - pen.x) * t, y: pen.y + (to.y - pen.y) * t });
      pen = to;
    } else {
      const [c1, c2, to] = [{ x: n[0], y: n[1] }, { x: n[2], y: n[3] }, { x: n[4], y: n[5] }];
      for (let t = 0; t <= 1; t += 0.02) {
        const u = 1 - t;
        points.push({
          x: u ** 3 * pen.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t ** 3 * to.x,
          y: u ** 3 * pen.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t ** 3 * to.y,
        });
      }
      pen = to;
    }
  }
  return points;
}

/** Every coordinate pair in the path data, in order. */
const coordinates = (d) => [...d.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]))
  .reduce((pairs, value, i, all) => (i % 2 ? pairs : [...pairs, { x: value, y: all[i + 1] }]), []);

const distance = (p, box) => Math.hypot(Math.max(box.left - p.x, 0, p.x - box.right), Math.max(box.top - p.y, 0, p.y - box.bottom));
const boxesOf = (placements, width = base.width) => ({
  prints: placements.map((p) => ({ left: p.x, top: p.y, right: p.x + width, bottom: p.y + portrait.print })),
  names: placements.map((p) => ({ left: p.x, top: p.y + portrait.print, right: p.x + width, bottom: p.y + portrait.height })),
});

test("portraits keep their order, never overlap, and give way no further than they must", () => {
  const { placements } = planTrail({ ...base, anchors });
  placements.forEach((p, i) => {
    if (i) assert.ok(p.y >= placements[i - 1].y + portrait.height + base.gap - 1e-9, p.id);
  });
  // Where every print had to move, the column as a whole stays centred on what
  // it was asked for: as much gives way upwards as downwards.
  const moved = placements.reduce((sum, p, i) => sum + p.y - (anchors[i].y - portrait.height / 2), 0);
  assert.ok(Math.abs(moved) < 1e-6, `${moved}`);
  // And a print with room is centred on its paragraph exactly.
  const [alone] = planTrail({ ...base, anchors: [{ id: "jung", y: 700, ...portrait }] }).placements;
  assert.equal(alone.y, 700 - portrait.height / 2);
});

test("no portrait stands above the heart of the first splatter", () => {
  const { placements } = planTrail({ ...base, anchors: anchors.map((a) => ({ ...a, y: 60 })) });
  assert.ok(placements[0].y >= base.top + HEART * REACH.begin + CLEAR - 1e-9);
});

test("portraits alternate sides and stay inside the lane", () => {
  const { placements } = planTrail({ ...base, anchors });
  assert.notEqual(placements[0].x, placements[1].x);
  for (const p of placements) {
    assert.ok(p.x >= lane.left && p.x + base.width <= lane.right, p.id);
  }
});

test("the path never runs back up the page and never leaves the lane", () => {
  const { d } = planTrail({ ...base, anchors });
  const points = coordinates(d);
  // Segment ends are every point of a line and every third point of a curve;
  // control points must also lie between their ends in height, which holds if
  // the whole sequence never decreases.
  for (let i = 1; i < points.length; i++) assert.ok(points[i].y >= points[i - 1].y - 1e-9, `point ${i}`);
  for (const point of points) assert.ok(point.x >= lane.left && point.x <= lane.right, `${point.x}`);
});

test("the line never crosses a portrait's name, nor does a drop land on one, at any lane width", () => {
  for (const each of lanes) {
    const { d, drops, placements } = planTrail({ ...base, lane: each, anchors });
    const { names } = boxesOf(placements);
    const inside = (pt) => names.some((n) => pt.x > n.left && pt.x < n.right && pt.y > n.top && pt.y < n.bottom);
    const label = each.right - each.left;
    for (const point of sample(d)) assert.ok(!inside(point), `${label}: line at ${point.x.toFixed(1)}, ${point.y.toFixed(1)}`);
    for (const drop of drops) assert.ok(!inside(drop), `${label}: drop at ${drop.x}, ${drop.y}`);
  }
});

test("the line begins and ends in a splatter, with a third about its middle, whatever the seed", () => {
  for (const each of lanes) {
    for (let seed = 1; seed <= 40; seed++) {
      const { d, splatters, placements } = planTrail({ ...base, lane: each, anchors, seed });
      const label = `lane ${each.right - each.left}, seed ${seed}`;
      const points = coordinates(d);
      assert.equal(splatters.length, 3, label);
      const [begin, middle, end] = splatters;
      assert.deepEqual({ x: begin.x, y: begin.y }, points[0], `${label}: begins where the line does`);
      assert.deepEqual({ x: end.x, y: end.y }, points.at(-1), `${label}: ends where the line does`);
      assert.equal(begin.reach, REACH.begin, label);
      assert.equal(end.reach, REACH.end, label);
      assert.ok(end.y + end.reach <= base.bottom || end.y - end.reach >= placements.at(-1).y + portrait.height, label);
      const length = end.y - begin.y;
      assert.ok(middle.y > begin.y + length * 0.2 && middle.y < begin.y + length * 0.8, `${label}: middle at ${middle.y}`);
      assert.ok(middle.reach >= REACH.least && middle.reach <= REACH.middle, label);
    }
  }
});

test("a splatter stays by the lane, lies under no name, and no print covers its heart", () => {
  for (const each of lanes) {
    for (let seed = 1; seed <= 40; seed++) {
      const { splatters, placements } = planTrail({ ...base, lane: each, anchors, seed });
      const { prints, names } = boxesOf(placements);
      const label = `lane ${each.right - each.left}, seed ${seed}`;
      splatters.forEach((s, i) => {
        assert.ok(s.x - s.reach >= each.left + 8 - SPILL - 1e-9 && s.x + s.reach <= each.right - 8 + SPILL + 1e-9, `${label}: splatter ${i} leaves the lane`);
        for (const box of names) assert.ok(distance(s, box) >= s.reach + CLEAR - 1e-9, `${label}: splatter ${i} under a name`);
        for (const box of prints) assert.ok(distance(s, box) >= HEART * s.reach + CLEAR - 1e-9, `${label}: splatter ${i} under a print`);
        for (const other of splatters.slice(i + 1)) {
          assert.ok(Math.hypot(other.x - s.x, other.y - s.y) >= s.reach + other.reach - 1e-9, `${label}: splatters ${i} overlap`);
        }
      });
    }
  }
});

test("the same seed lands the same splatters, and another seed others", () => {
  assert.deepEqual(planTrail({ ...base, anchors, seed: 7 }).splatters, planTrail({ ...base, anchors, seed: 7 }).splatters);
  assert.notDeepEqual(planTrail({ ...base, anchors, seed: 7 }).splatters, planTrail({ ...base, anchors, seed: 8 }).splatters);
});

test("nothing in a splatter reaches further from its centre than its reach", () => {
  const farthest = (shape) => {
    switch (shape.kind) {
      case "circle": return Math.hypot(shape.x, shape.y) + shape.r;
      case "oval": return Math.hypot(shape.x, shape.y) + Math.max(shape.rx, shape.ry);
      // A curve through points bulges past them by a little; allow for it.
      case "loop": return Math.max(...shape.points.map((p) => Math.hypot(p.x, p.y))) * 1.05;
      case "neck": return Math.max(...[...shape.from, ...shape.pinch, ...shape.to].map((p) => Math.hypot(p.x, p.y)));
      case "spike": return Math.max(...[...shape.base, shape.tip].map((p) => Math.hypot(p.x, p.y)));
    }
  };
  for (const reach of [REACH.least, REACH.middle, REACH.end]) {
    for (let seed = 1; seed <= 200; seed++) {
      const { blot, spray } = splatter(seed * 2654435761, reach);
      for (const shape of [...blot, ...spray]) assert.ok(farthest(shape) <= reach + 1e-9, `reach ${reach}, seed ${seed}: ${shape.kind} at ${farthest(shape)}`);
    }
  }
});

test("a lane too narrow for a portrait draws nothing", () => {
  assert.equal(planTrail({ ...base, lane: { left: 1300, right: 1400 }, anchors }), null);
});

test("with no anchors the line still runs down the page, a splatter at each end", () => {
  const { d, placements, splatters } = planTrail({ ...base, anchors: [] });
  const points = coordinates(d);
  assert.equal(placements.length, 0);
  assert.equal(points[0].y, base.top);
  assert.equal(points.at(-1).y, base.bottom - REACH.end);
  assert.ok(splatters.length >= 2);
});
