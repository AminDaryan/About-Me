import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import ts from "typescript";

// Exercise production geometry and track definitions without a browser runner.
const require = createRequire(import.meta.url);
const previousLoader = require.extensions[".ts"];
require.extensions[".ts"] = (module, filename) => {
  module._compile(ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, filename);
};
const { studies } = require("./motion.ts");
const { writingCurve, ornamentCurve } = require("./geometry.ts");
const { board, project, knightFrom, knightTo, knightPose, KNIGHT_UNITS } = require("./board.ts");
const { createIllustrationPlayback } = require("./illustrationPlayback.ts");
require.extensions[".ts"] = previousLoader;

const coords = transform => [...transform.matchAll(/-?\d+(?:\.\d+)?/g)].map(match => Number(match[0]));
const near = (actual, expected, tolerance = .0001) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected}`);
const smooth = t => t * t * (3 - 2 * t);

test("every animated property returns to its exact starting value", () => {
  for (const [subject, study] of Object.entries(studies)) {
    for (const [name, sample] of Object.entries(study.tracks)) {
      assert.deepEqual(sample(1), sample(0), `${subject}/${name}`);
      for (const p of [0, .001, .999, 1]) {
        assert.ok(!JSON.stringify(sample(p)).includes("NaN"), `${subject}/${name}`);
      }
      // Adjacent boundary frames remain close, rather than concealing a jump.
      const first = sample(.999);
      const last = sample(.001);
      if (first.transform) coords(first.transform).forEach((value, i) => near(value, coords(last.transform)[i], .1));
    }
  }
});

test("each quill tip shares the reveal mask's arc-length position", () => {
  for (const [subject, curve] of [["reading", writingCurve], ["ornament", ornamentCurve]]) {
    for (let i = 0; i <= 40; i++) {
      const phase = .1 + .48 * i / 40;
      const distance = smooth(i / 40);
      const [x, y] = coords(studies[subject].tracks.quill(phase).transform);
      const point = curve(distance);
      near(x, point.x);
      near(y, point.y);
      near(Number(studies[subject].tracks["writing-mask"](phase).strokeDashoffset), 1 - distance);
    }
  }
});

test("the bowstring vertex stays attached to the arrow nock throughout", () => {
  for (let i = 0; i <= 200; i++) {
    const phase = i / 200;
    const [scale] = coords(studies.archery.tracks.bowstring(phase).transform);
    const [arrowX] = coords(studies.archery.tracks.arrow(phase).transform);
    near(50 - 24 * scale, 50 + arrowX, .0002);
  }
});

test("the knight stands on g1 at rest, lands on f3, then returns", () => {
  const knight = studies.chess.tracks.knight;
  assert.equal(knight(0).transform, knightPose(knightFrom));
  assert.equal(knight(.5).transform, knightPose(knightTo));
  assert.equal(knight(.96).transform, knightPose(knightFrom));
  assert.deepEqual([knightFrom, knightTo], [{ file: 6.5, rank: .5 }, { file: 5.5, rank: 2.5 }]);
});

test("the board is drawn in perspective, the right way round, inside its own frame", () => {
  const [, , width, height] = board.frame.split(" ").map(Number);
  const breadth = rank => project(8, rank).x - project(0, rank).x;
  const depth = rank => project(0, rank).y - project(0, rank + 1).y;
  // Files converge up the board, and each rank is shallower than the one before it.
  assert.ok(breadth(8) < breadth(0));
  for (let rank = 0; rank < 7; rank++) assert.ok(depth(rank + 1) < depth(rank));
  // Upright things stay upright: lifting a point moves it straight up.
  assert.equal(project(3.5, 4.5, 1).x, project(3.5, 4.5).x);
  // a1 is dark and h1 light: 32 dark squares, the first of them a1.
  assert.equal(board.dark.match(/M/g).length, 32);
  const a1 = project(0, 0);
  assert.ok(board.dark.startsWith(`M${Number(a1.x.toFixed(3))} ${Number(a1.y.toFixed(3))}L`));
  // The knight, at the top of its hop and at its furthest, stays inside the frame.
  for (let i = 0; i <= 200; i++) {
    const [x, y, scale] = coords(studies.chess.tracks.knight(i / 200).transform);
    assert.ok(y - scale * KNIGHT_UNITS >= 0 && x >= 0 && x <= width && y <= height, `the knight leaves the frame at ${i / 200}`);
  }
});

test("finishing, renewed hover, visibility and reduced motion preserve the controller contract", () => {
  let time = 100;
  const tracks = [];
  const playback = createIllustrationPlayback({
    durationMs: 1000,
    timelineTime: () => time,
    createAnimations: () => {
      for (let i = 0; i < 2; i++) tracks.push({
        currentTime: 0, playState: "paused", onfinish: null, iterations: 1,
        effect: { updateTiming({ iterations }) { tracks[i].iterations = iterations; } },
        play() { this.playState = "running"; },
        pause() { this.playState = "paused"; },
        cancel() { this.playState = "idle"; },
      });
      return tracks;
    },
  });
  playback.setIntent("hover", true);
  tracks.forEach(track => { track.currentTime = 1350; });
  playback.setIntent("hover", false);
  assert.ok(tracks.every(track => track.iterations === 2));
  playback.setIntent("focus", true);
  assert.ok(tracks.every(track => track.iterations === Infinity && track.currentTime === 1350));
  playback.setSuspended("document", true);
  assert.ok(tracks.every(track => track.playState === "paused"));
  time = 3000;
  playback.setSuspended("document", false);
  assert.ok(tracks.every(track => track.startTime === 1650));
  playback.setReducedMotion(true);
  assert.ok(tracks.every(track => track.playState === "idle"));
  playback.dispose();
});
