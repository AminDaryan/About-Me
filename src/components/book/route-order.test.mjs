import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

// Test the production TypeScript without an additional runner dependency.
const source = await readFile(new URL("./route-order.ts", import.meta.url), "utf8");
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { BOOK_ROUTES, getBookDirection } = await import(`data:text/javascript;base64,${Buffer.from(output).toString("base64")}`);

test("every route pair follows the book's order, including history in either direction", () => {
  BOOK_ROUTES.forEach((from, i) => BOOK_ROUTES.forEach((to, j) => {
    assert.equal(getBookDirection(from, to), Math.sign(j - i), `${from} → ${to}`);
  }));
});

test("same-page fragments, queries and trailing slashes do not turn a page", () => {
  for (const to of ["#gaze", "/research#gaze", "?view=all", "/research/"]) {
    assert.equal(getBookDirection("/research", to), 0, to);
  }
  assert.equal(getBookDirection("/cv/", "/research#gaze"), -1);
});

test("external and unknown destinations retain normal navigation", () => {
  for (const to of ["https://example.org/research", "mailto:hello@example.org", "/cv.pdf", "/missing"]) {
    assert.equal(getBookDirection("/", to), 0, to);
  }
  assert.equal(getBookDirection("https://example.org/", "https://example.org/cv"), 1);
});
