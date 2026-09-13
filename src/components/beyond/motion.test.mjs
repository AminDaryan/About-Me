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

test("the knight lands two files and one rank away, then returns", () => {
  assert.deepEqual(coords(studies.chess.tracks.knight(.5).transform), [40, -9]);
  assert.deepEqual(coords(studies.chess.tracks.knight(.96).transform), [0, 0]);
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
