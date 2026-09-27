/* Painted-pixel AAA check for the queue mock-up.
   Run:        node design/mockups/check-contrast.mjs
   Calibrate:  node design/mockups/check-contrast.mjs --plant       (2 contrast plants per state must fail)
               node design/mockups/check-contrast.mjs --plant-wide  (the phone width check must fail)
   Text scrolled out of view inside a scrolling box is skipped, and one state scrolls the
   table to its far edge so those cells are measured too. */
import { readFileSync, writeFileSync } from "fs";
import { createServer } from "http";
const { chromium } = (await import("/opt/node22/lib/node_modules/playwright/index.mjs")).default ?? await import("/opt/node22/lib/node_modules/playwright/index.mjs");
const SRC = new URL("./queue.html", import.meta.url).pathname;
const plant = process.argv.includes("--plant");
let html = "<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'></head><body>" + readFileSync(SRC, "utf8") + "</body></html>";
if (process.argv.includes('--plant-dot')) html = html.replace('<div class="content">', '<style>:root{--dot-ring:transparent!important}</style><div class="content">');
if (process.argv.includes('--plant-wide')) html = html.replace('<div class="content">', '<div class="content"><div style="width:700px">PLANT wide</div>');
if (plant) html = html.replace('<div class="content">', '<div class="content"><p id="plant1" style="color:#5a6473">PLANT low contrast grey</p><p id="plant2" style="background-image:linear-gradient(#f0f0f0,#ffffff);color:#eef3f9">PLANT gradient trap</p>');
const srv = createServer((q, r) => { r.writeHead(200, { "content-type": "text/html" }); r.end(html); }).listen(8765);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--headless=new","--use-gl=swiftshader","--enable-unsafe-swiftshader","--no-sandbox"] });
function lum([r,g,b]) { const f = c => { c/=255; return c<=0.03928 ? c/12.92 : ((c+0.055)/1.055)**2.4; }; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); }
function ratio(a,b) { const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p); return (x+0.05)/(y+0.05); }
const states = [
  { name: "dark", theme: "dark", dys: "off", setup: null },
  { name: "light", theme: "light", dys: "off", setup: null },
  { name: "dark+reading+instructor+closed", theme: "dark", dys: "on", instr: "1", setup: "closed" },
  { name: "light+reading+instructor+closed", theme: "light", dys: "on", instr: "1", setup: "closed" },
  { name: "phone dark", theme: "dark", dys: "off", width: 400 },
  { name: "phone light, table scrolled to its far edge", theme: "light", dys: "on", width: 400, setup: "scroll" },
  { name: "wrong PIN message, light", theme: "light", dys: "off", setup: "pin" },
  { name: "wrong PIN message, dark", theme: "dark", dys: "on", setup: "pin" },
];
let totalFails = 0, plantHits = 0;
for (const st of states) {
  const page = await browser.newPage({ viewport: { width: st.width || 1440, height: 1400 } });
  await page.addInitScript(s => { localStorage.setItem("cwp:theme", s.theme); localStorage.setItem("cwp:dyslexia", s.dys); localStorage.setItem("cwp:instructor", s.instr || "0"); }, st);
  await page.goto("http://127.0.0.1:8765/", { waitUntil: "load" });
  await page.waitForTimeout(400);
    if (st.setup === "closed") { await page.click("#tabClosed"); }
  if (st.setup === "scroll") { await page.evaluate(() => { const w = document.querySelector(".tablewrap"); w.scrollLeft = w.scrollWidth; }); }
  if (st.setup === "pin") { await page.click("#instrBtn"); await page.fill("#pin", "1111"); await page.press("#pin", "Enter"); await page.waitForTimeout(100); }
  if (st.setup === "closed") { const on = await page.evaluate(() => document.documentElement.getAttribute("data-instructor")); if (on !== "on") { console.log("   instructor state not on — test setup wrong"); totalFails++; } }
  const runs = await page.evaluate(() => {
    const out = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n; while ((n = walker.nextNode())) {
      if (!n.textContent.trim()) continue;
      const el = n.parentElement; const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      const range = document.createRange(); range.selectNodeContents(n);
      let clip = null; for (let a = el; a && a !== document.body; a = a.parentElement) { const o = getComputedStyle(a); if (/(auto|scroll|hidden)/.test(o.overflowX + o.overflowY)) { clip = a.getBoundingClientRect(); break; } }
      for (const r of range.getClientRects()) {
        if (r.width < 2 || r.height < 2) continue;
        if (clip && (r.right <= clip.left + 1 || r.left >= clip.right - 1 || r.bottom <= clip.top + 1 || r.top >= clip.bottom - 1)) continue;
        out.push({ text: n.textContent.trim().slice(0, 40), color: cs.color, size: parseFloat(cs.fontSize), bold: parseInt(cs.fontWeight) >= 700, x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height, id: el.id || el.closest("[id]")?.id || "" });
      }
    }
    for (const inp of document.querySelectorAll("input")) {
      const r = inp.getBoundingClientRect(); const cs = getComputedStyle(inp);
      if (r.width && inp.value) out.push({ text: "input:" + inp.value.slice(0,30), color: cs.color, size: parseFloat(cs.fontSize), bold: false, x: r.x + 10 + scrollX, y: r.y + 4 + scrollY, w: Math.min(r.width - 20, 200), h: r.height - 8, id: inp.id });
    }
    return out;
  });
  const slaSeen = await page.evaluate(() => { const c = document.querySelector("td .sla"); if (!c) return "n/a"; const w = document.querySelector(".tablewrap").getBoundingClientRect(); const r = c.getBoundingClientRect(); return r.right <= w.right ? "visible" : "scrolled out of view"; });
  console.log(`   deadline column: ${slaSeen}`);
  const dots = await page.evaluate(() => [...document.querySelectorAll(".dot")].map(d => {
    const r = d.getBoundingClientRect();
    let clip = null; for (let a = d.parentElement; a && a !== document.body; a = a.parentElement) { const o = getComputedStyle(a); if (/(auto|scroll|hidden)/.test(o.overflowX + o.overflowY)) { clip = a.getBoundingClientRect(); break; } }
    if (!r.width || (clip && (r.right <= clip.left || r.left >= clip.right || r.bottom <= clip.top || r.top >= clip.bottom))) return null;
    return { x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height };
  }).filter(Boolean));
  const bodyW0 = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  if (bodyW0[0] > bodyW0[1]) { console.log(`   PAGE SCROLLS SIDEWAYS (before screenshot): ${bodyW0[0]} > ${bodyW0[1]}`); totalFails++; }
  await page.addStyleTag({ content: "*{color:transparent!important;text-shadow:none!important;caret-color:transparent!important} input{-webkit-text-fill-color:transparent!important}" });
  const png = await page.screenshot({ fullPage: true });
  await page.evaluate(() => { const s = [...document.querySelectorAll("style")].pop(); s.remove(); });
  const { PNG } = await import("/opt/node22/lib/node_modules/playwright/node_modules/playwright-core/lib/utilsBundle.js").then(m => m).catch(() => ({}));
  // decode PNG with sharp-free fallback: use the page to decode
  const b64 = png.toString("base64");
  const samples = await page.evaluate(async ({ b64, runs }) => {
    const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
    const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
    const g = c.getContext("2d"); g.drawImage(img, 0, 0);
    return runs.map(r => {
      const x0 = Math.max(0, Math.floor(r.x)), y0 = Math.max(0, Math.floor(r.y));
      const w = Math.max(1, Math.min(Math.floor(r.w), img.width - x0)), h = Math.max(1, Math.min(Math.floor(r.h), img.height - y0));
      const d = g.getImageData(x0, y0, w, h).data; const counts = new Map();
      for (let i = 0; i < d.length; i += 4) { const k = d[i] + "," + d[i+1] + "," + d[i+2]; counts.set(k, (counts.get(k) || 0) + 1); }
      // worst case across grounds covering >=5% of the box
      const total = d.length / 4; const grounds = [...counts].filter(([, v]) => v / total >= 0.05).map(([k]) => k.split(",").map(Number));
      return grounds.length ? grounds : [[...counts].sort((a, b) => b[1] - a[1])[0][0].split(",").map(Number)];
    });
  }, { b64, runs });
  /* A mark is visible if its strongest edge pixel stands 3:1 off the ground around it. */
  const dotRes = await page.evaluate(async ({ b64, dots }) => {
    const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
    const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
    const g = c.getContext("2d"); g.drawImage(img, 0, 0);
    return dots.map(d => {
      const box = g.getImageData(Math.floor(d.x), Math.floor(d.y), Math.ceil(d.w), Math.ceil(d.h)).data;
      const px = []; for (let i = 0; i < box.length; i += 4) px.push([box[i], box[i+1], box[i+2]]);
      const ground = Array.from(g.getImageData(Math.round(d.x - 5), Math.round(d.y + d.h / 2), 1, 1).data.slice(0, 3));
      return { px, ground };
    });
  }, { b64, dots });
  let dotFails = 0;
  dotRes.forEach((d, i) => { const edge = Math.max(...d.px.map(p => ratio(p, d.ground))); if (edge < 3) { dotFails++; if (process.env.DEBUG) console.log('     ', JSON.stringify(d.ground), edge.toFixed(2), Math.round(dots[i].x), Math.round(dots[i].y)); } });
  if (dotFails) { console.log(`   ${dotFails} severity marks below 3:1 against their ground`); }
  totalFails += dotFails; if (process.argv.includes("--plant-dot")) plantHits += dotFails;
  const fails = [];
  runs.forEach((r, i) => {
    const m = r.color.match(/\d+(\.\d+)?/g).map(Number); const fg = m.slice(0, 3);
    const large = r.size >= 24 || (r.bold && r.size >= 18.66); const need = large ? 4.5 : 7;
    const worst = Math.min(...samples[i].map(bg => ratio(fg, bg)));
    if (worst < need) fails.push({ text: r.text, ratio: worst.toFixed(2), need, id: r.id });
  });
  const planted = fails.filter(f => f.text.startsWith("PLANT")).length;
  plantHits += planted;
  totalFails += fails.filter(f => !f.text.startsWith("PLANT")).length;
  console.log(`${st.name}: ${runs.length} text runs measured, ${fails.length} below AAA` + (plant ? ` (${planted} of them planted)` : ""));
  for (const f of fails.slice(0, 12)) console.log(`   ${f.ratio}:1 < ${f.need}  "${f.text}"`);
  await page.close();
}
await browser.close(); srv.close();
if (process.argv.includes('--plant-dot')) console.log(plantHits ? `\nring plant caught: ${plantHits} marks fail without the ring` : '\nRING PLANT MISSED — the mark check cannot be trusted');
else if (plant) { console.log(plantHits >= states.length * 2 - 2 ? `\nplants caught: ${plantHits}` : `\nPLANT MISSED (${plantHits}) — the check cannot be trusted`); }
else console.log(totalFails ? `\nFAIL: ${totalFails}` : "\nAll text meets AAA on painted pixels.");
