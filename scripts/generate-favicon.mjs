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
/**
 * The mark as an icon: on paper, cropped to `box`, its strokes `weight` times
 * the masthead's. The masthead draws hairlines for a 36px mark; a tab draws
 * the icon at 16px, where those came out a faint grey smudge, so the tab's
 * icon is drawn heavier and closer. At 16px no drawing this detailed is a
 * face, but heavier it is at least a head split down the middle.
 */
const icon = (weight, box) => {
  const [bx, by, bw, bh] = box.split(" ");
  return markup
    .replace('<svg', `<svg xmlns="http://www.w3.org/2000/svg" color="${color("ink-soft")}"`)
    .replace(/ (?:class|aria-hidden|focusable|width|height)="[^"]*"/g, "")
    .replace(/viewBox="[^"]+"/, `viewBox="${box}"`)
    .replace(/stroke-width="([\d.]+)"/g, (_, w) => `stroke-width="${(parseFloat(w) * weight).toFixed(2)}"`)
    .replace(/(<svg[^>]+>)/, `$1<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="${color("paper")}" stroke="none"/>`);
};
const TAB = icon(1.7, "1 2 54 54");
const FULL = icon(1.2, `${x} ${y} ${width} ${height}`);

fs.writeFileSync(
  path.join(root, "public/favicon.svg"),
  `<!-- Generated from src/components/Mark.tsx; run npm run generate:favicon. -->\n${TAB}\n`,
);

/* Safari took no SVG icon until recently, older browsers and a good many
   crawlers ask for /favicon.ico whatever the page says, and an iPhone wants a
   180px PNG for its home screen. They come from the same mark, through sharp,
   which Next.js installs for its own images. Where the build runs without it,
   the committed files stand; this step never fails a build. */
let sharp = null;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.warn("generate:favicon: sharp is not installed; favicon.ico and apple-touch-icon.png left as committed.");
}
if (sharp) {
  const png = (svgText, size) =>
    sharp(Buffer.from(svgText), { density: Math.ceil((72 * size) / 16) }).resize(size, size).png().toBuffer();

  // An .ico is a directory of images; every browser since IE11 takes PNGs in it.
  const sizes = [16, 32, 48];
  const images = await Promise.all(sizes.map((size) => png(TAB, size)));
  const header = Buffer.alloc(6 + 16 * sizes.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);
  let offset = header.length;
  sizes.forEach((size, i) => {
    const entry = 6 + 16 * i;
    header.writeUInt8(size, entry);
    header.writeUInt8(size, entry + 1);
    header.writeUInt8(0, entry + 2);
    header.writeUInt8(0, entry + 3);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(images[i].length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += images[i].length;
  });
  fs.writeFileSync(path.join(root, "public/favicon.ico"), Buffer.concat([header, ...images]));
  fs.writeFileSync(path.join(root, "public/apple-touch-icon.png"), await png(FULL, 180));
}
