/* Render the actual masthead mark so the tab icon cannot drift from it. */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const root = fileURLToPath(new URL("..", import.meta.url));
const source = fs.readFileSync(path.join(root, "src/components/Mark.tsx"), "utf8");
const css = fs.readFileSync(path.join(root, "src/app/globals.css"), "utf8");
const color = (token) => {
  const value = css.match(new RegExp(`--color-${token}:\\s*(#[\\da-f]+);`, "i"));
  if (!value) throw new Error(`Missing icon colour: ${token}`);
  return value[1];
};
const compiled = ts.transpileModule(source, {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS },
}).outputText;
const context = { exports: {}, require: createRequire(import.meta.url) };
vm.runInNewContext(compiled, context);

const markup = renderToStaticMarkup(React.createElement(context.exports.default));
const viewBox = markup.match(/viewBox="([^"]+)"/);
if (!viewBox) throw new Error("The masthead mark needs a viewBox.");
const [x, y, width, height] = viewBox[1].split(" ");
const svg = markup
  .replace('<svg', `<svg xmlns="http://www.w3.org/2000/svg" color="${color("ink-soft")}"`)
  .replace(/ (?:class|aria-hidden|focusable|width|height)="[^"]*"/g, "")
  .replace(/(<svg[^>]+>)/, `$1<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${color("paper")}" stroke="none"/>`);

fs.writeFileSync(
  path.join(root, "public/favicon.svg"),
  `<!-- Generated from src/components/Mark.tsx; run npm run generate:favicon. -->\n${svg}\n`,
);
