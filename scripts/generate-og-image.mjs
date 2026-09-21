/* The link-preview card: what LinkedIn, Slack or a message shows when someone
   pastes the site's address. Next.js serves src/app/opengraph-image.jpg as
   og:image on every page, with its size, and the .alt.txt beside it as the
   image's description.

   It is drawn from the site itself — the paper, the ink, the serif stack and
   the home page's opening line, all read out of the source, and the portrait
   the home page shows — and rendered by a local Chrome, so it is set in the
   same faces a reader of the site sees. It is a picture, not a font: nothing
   is loaded by a visitor, and the no-webfont rule stands.

   It is not run by the build. The machine that builds the site has no Chrome,
   and the card changes only when the opening line or the portrait does — then
   run `yarn generate:og-image` and commit the two files it writes. On Node 20
   WebSocket needs the flag in the package.json script; on 22 and later it is
   built in and the flag does nothing. */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

/** LinkedIn's size for a shared link's image; every other site takes it too. */
const WIDTH = 1200;
const HEIGHT = 627;

const css = read("src/app/globals.css");
const token = (name) => {
  const value = css.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!value) throw new Error(`Missing token in globals.css: --${name}`);
  return value[1].replace(/\s+/g, " ").trim();
};

// The home page's opening line, as the page sets it.
const home = read("src/app/page.tsx");
const ledeMatch = home.match(/<p className="text-lede italic">([\s\S]*?)<\/p>/);
if (!ledeMatch) throw new Error("The home page's lede was not found in src/app/page.tsx.");
const lede = ledeMatch[1]
  .replace(/\{"\s*"\}/g, " ")
  .replace(/&rsquo;/g, "\u2019")
  .replace(/&lsquo;/g, "\u2018")
  .replace(/&amp;/g, "&")
  .replace(/\s+/g, " ")
  .trim();

const siteMatch = read("src/lib/site.ts").match(/"(https:\/\/[^"]+)"/);
if (!siteMatch) throw new Error("The site's address was not found in src/lib/site.ts.");
const address = new URL(siteMatch[1]).host;

const file = (p) => pathToFileURL(path.join(root, p)).href;
const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const html = `<!doctype html>
<meta charset="utf-8">
<style>
  html, body { margin: 0; }
  body {
    width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; position: relative;
    background: ${token("color-paper")};
    color: ${token("color-ink")};
    font-family: ${token("font-serif")};
    font-feature-settings: "kern" 1, "liga" 1, "lnum" 1;
    -webkit-font-smoothing: antialiased;
  }
  /* The sheet's own texture, at the strength the site lays it. */
  .paper {
    position: absolute; inset: 0;
    background: url("${file("public/textures/rag-paper.webp")}") 0 0 / 768px 768px;
    opacity: 0.72;
  }
  .card {
    position: absolute; inset: 0;
    display: grid; grid-template-columns: minmax(0, 1fr) 300px;
    column-gap: 76px; align-items: center;
    padding: 0 84px;
  }
  h1 {
    margin: 0; font-weight: 400; font-size: 92px; line-height: 1.02;
    letter-spacing: -0.028em;
  }
  .lede {
    margin: 30px 0 0; font-style: italic; font-size: 33px; line-height: 1.42;
    color: ${token("color-ink-soft")};
  }
  /* The site's section rule: thick and thin, the kind of line that opens a part. */
  .rule {
    margin-top: 44px; height: 7px;
    border-top: 3px solid ${token("color-ink-soft")};
    border-bottom: 1px solid ${token("color-ink-soft")};
  }
  .address {
    margin-top: 20px; font-size: 21px; letter-spacing: 0.2em; text-transform: uppercase;
    color: ${token("color-ink-faint")};
  }
  .address::before {
    content: ""; display: inline-block; width: 9px; height: 9px; margin: 0 16px 3px 2px;
    background: ${token("color-accent")}; transform: rotate(45deg);
  }
  /* The portrait as the home page frames it: a touch of sepia, and a hairline
     frame set off it the way a print is mounted. The figure is its own
     stacking context, or the frame sinks under the paper's texture. */
  figure { position: relative; isolation: isolate; margin: 0 11px 11px 0; }
  figure img {
    display: block; width: 300px; height: 300px;
    filter: sepia(0.14) saturate(0.92) contrast(1.02);
  }
  figure::after {
    content: ""; position: absolute; inset: 0; z-index: -1;
    transform: translate(11px, 11px); border: 1px solid ${token("color-rule")};
  }
</style>
<div class="paper"></div>
<div class="card">
  <div>
    <h1>Amin Dariani</h1>
    <p class="lede">${escape(lede)}</p>
    <div class="rule"></div>
    <div class="address">${escape(address)}</div>
  </div>
  <figure><img src="${file("public/portrait.jpg")}" alt=""></figure>
</div>`;

/* -- Render it in a local Chrome ------------------------------------------ */

const CHROME = process.env.CHROME ?? [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find((p) => fs.existsSync(p));
if (!CHROME) throw new Error("No Chrome found; set CHROME to its path.");

const work = fs.mkdtempSync(path.join(os.tmpdir(), "og-card-"));
const page = path.join(work, "card.html");
fs.writeFileSync(page, html);
const PORT = 9650;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = spawn(CHROME, [
  "--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${path.join(work, "profile")}`,
  "--allow-file-access-from-files", "--hide-scrollbars", "--no-first-run", "--disable-extensions", "about:blank",
], { stdio: "ignore" });

try {
  let version = null;
  for (let i = 0; i < 80 && !version; i++) {
    try {
      version = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
    } catch {
      await sleep(250);
    }
  }
  if (!version) throw new Error("Chrome did not start.");

  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((resolve) => (ws.onopen = resolve));
  let id = 0;
  const pending = new Map();
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    if (message.error) waiter.reject(new Error(JSON.stringify(message.error)));
    else waiter.resolve(message.result);
  };
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    id += 1;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });

  const { targetInfos } = await send("Target.getTargets");
  const target = targetInfos.find((t) => t.type === "page");
  const { sessionId } = await send("Target.attachToTarget", { targetId: target.targetId, flatten: true });
  const S = (method, params) => send(method, params, sessionId);
  await S("Emulation.setDeviceMetricsOverride", { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false });
  await S("Page.enable");
  await S("Page.navigate", { url: pathToFileURL(page).href });
  // Fonts and both images decoded before the picture is taken.
  await sleep(800);
  await S("Runtime.evaluate", {
    expression: "Promise.all([document.fonts.ready, ...[...document.images].map((i) => i.decode())])",
    awaitPromise: true,
  });
  // JPEG, not PNG: the paper's grain is noise to a lossless encoder, and the
  // card came out at 790 KB as a PNG for a picture shown 550px wide.
  const { data } = await S("Page.captureScreenshot", {
    format: "jpeg", quality: 90, clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT, scale: 1 },
  });
  ws.close();

  fs.writeFileSync(path.join(root, "src/app/opengraph-image.jpg"), Buffer.from(data, "base64"));
  fs.writeFileSync(
    path.join(root, "src/app/opengraph-image.alt.txt"),
    `Amin Dariani — ${lede} With his portrait, and the address ${address}.`,
  );
  console.log(`Wrote src/app/opengraph-image.jpg (${WIDTH}x${HEIGHT}) and its alt text.`);
} finally {
  chrome.kill();
  await sleep(500);
  fs.rmSync(work, { recursive: true, force: true });
}
