/* =====================================================================
   CONTRAST, MEASURED ON PAINTED PIXELS — every screen a student reaches

   The students have eye damage from military service. The floor is WCAG
   AAA: 7:1 for body text, 4.5:1 for large text (24px, or 18.66px bold).
   Severity dots and other marks must stand 3:1 off their ground.

   This does what the eye does: hide every glyph, screenshot, sample the
   pixels each run of text would be painted on, compare with its computed
   colour, then take the hiding style back out. Text scrolled out of view
   inside a scrolling box is skipped, and one state scrolls the widest
   table to its far edge so those cells are measured too.

   Run:        node verify/contrast.mjs
   Calibrate:  node verify/contrast.mjs --plant
     plants: low-contrast text · the gradient trap (light text on a
     background-image, which a cascade-reading checker passes) · a
     severity dot without its ring in light mode · a page that scrolls
     sideways on a phone
   ===================================================================== */
import { readFileSync, existsSync, statSync, mkdtempSync, cpSync, writeFileSync } from "fs";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";
import { createServer } from "http";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const PW = process.env.PW || "/opt/node22/lib/node_modules/playwright/index.mjs";
const CHROME = process.env.CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };

function serve(dir, port) {
  return createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
    const f = join(dir, p);
    if (!f.startsWith(dir) || !existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" }); res.end(readFileSync(f));
  }).listen(port);
}
const lum = ([r, g, b]) => { const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

/* ---- states ------------------------------------------------------------ */
const notes = { analyst: "Reported phishing email.", investigation: "Headers, trace, proxy.", resolution: "Credential phishing, contained. Could not be confirmed: phones." };
const PROGRESS = {
  introSeen: true,
  tickets: {
    "VOO-1063": { boards: { d1: { struck: ["b", "c", "d", "e"], narrowed: [], wrong: 4, solved: false, picked: null } }, notes: { analyst: "", investigation: "", resolution: "" }, activity: [["09:41", "Case opened"], ["09:42", "Searched: source=proxy"]], closed: false, record: null, practice: false, guideStep: 6 },
    "VOO-1055": { boards: { d1: { struck: ["b", "c"], narrowed: ["d", "e"], wrong: 5, solved: false, picked: null } }, notes: { analyst: "", investigation: "", resolution: "" }, activity: [["09:41", "Case opened"]], closed: false, record: null, practice: false, guideStep: 2 },
    "VOO-1042": { boards: { d1: { struck: ["b"], narrowed: [], wrong: 1, solved: true, picked: "a" }, d2: { struck: [], narrowed: [], wrong: 0, solved: true, picked: "a" } }, notes, activity: [["09:41", "Case opened"], ["09:50", "Case closed"]], closed: true, closedAt: "09:50", disposition: "benign true positive", record: null, practice: false, guideStep: 8 },
    "VOO-1187": { boards: {}, notes: { analyst: "", investigation: "", resolution: "" }, activity: [["09:41", "Practice replay started"]], closed: false, record: { boards: {}, notes, activity: [], closedAt: "08:10" }, practice: true, guideStep: 1 },
    /* the near miss, three boards solved, so Decision 4 and its HIPAA panel are on screen */
    "VOO-4107": { boards: { d1: { struck: [], narrowed: [], wrong: 0, solved: true, picked: "a" }, d2: { struck: [], narrowed: [], wrong: 0, solved: true, picked: "a" }, d3: { struck: [], narrowed: [], wrong: 0, solved: true, picked: "a" } }, notes: { analyst: "", investigation: "", resolution: "" }, activity: [["01:41", "Case opened"]], closed: false, record: null, practice: false, guideStep: 1 },
  }
};
const STATES = [
  { name: "intro, dark", theme: "dark", fresh: true, hash: "" },
  { name: "queue, dark", theme: "dark", hash: "#queue" },
  { name: "queue, light", theme: "light", hash: "#queue" },
  { name: "queue, easier reading, instructor on", theme: "dark", dys: "on", instr: "1", hash: "#queue" },
  { name: "case with red options and hints, dark", theme: "dark", hash: "#case/VOO-1063", search: 'source=proxy url="*payneschool-login*"' },
  { name: "case with red options and hints, light", theme: "light", hash: "#case/VOO-1063", search: 'source=proxy url="*payneschool-login*"' },
  { name: "rung 3, narrowed, dark", theme: "dark", hash: "#case/VOO-1055" },
  { name: "rung 3, narrowed, light, easier reading", theme: "light", dys: "on", hash: "#case/VOO-1055" },
  { name: "closed case with summary, dark", theme: "dark", hash: "#case/VOO-1042" },
  { name: "closed case with summary, light", theme: "light", hash: "#case/VOO-1042" },
  { name: "practice replay banner, light", theme: "light", hash: "#case/VOO-1187" },
  { name: "search results, dark", theme: "dark", hash: "#search", globalSearch: "source=signin client=Nexxuss | stats count dc(user) by src_ip" },
  { name: "search error, light", theme: "light", hash: "#search", globalSearch: "source=signin | fly" },
  { name: "wrong PIN message, light", theme: "light", hash: "#queue", pin: "1111" },
  { name: "phone, queue, dark", theme: "dark", hash: "#queue", width: 400 },
  { name: "phone, case, light, table scrolled", theme: "light", hash: "#case/VOO-1063", width: 400, scroll: true, search: "source=signin client=Nexxuss" },
  /* the later tiers: every new screen and evidence kind, in both themes */
  { name: "Tier 2 key-value posture panel, light", theme: "light", instr: "1", hash: "#case/VOO-2114" },
  { name: "Tier 3 case, screens to open, dark", theme: "dark", instr: "1", hash: "#case/VOO-3016" },
  { name: "Tier 3 EDR process tree, light", theme: "light", instr: "1", hash: "#case/VOO-3016", open: "EDR" },
  { name: "Tier 3 EDR process tree, dark", theme: "dark", instr: "1", hash: "#case/VOO-3016", open: "EDR" },
  { name: "Tier 4 collapsed guide and ask Fizban, dark", theme: "dark", instr: "1", hash: "#case/VOO-4021" },
  { name: "Tier 4 collapsed guide and ask Fizban, light", theme: "light", instr: "1", hash: "#case/VOO-4021" },
  { name: "Tier 4 HIPAA mechanism panel, light", theme: "light", instr: "1", hash: "#case/VOO-4107" },
  { name: "Tier 4 HIPAA mechanism panel, dark", theme: "dark", instr: "1", hash: "#case/VOO-4107" },
  { name: "Tier 5 SOAR flow, dark", theme: "dark", instr: "1", hash: "#case/VOO-5030", open: "SOAR editor" },
  { name: "Tier 5 SOAR flow, light", theme: "light", instr: "1", hash: "#case/VOO-5030", open: "SOAR editor" },
  { name: "metrics, dark", theme: "dark", instr: "1", hash: "#metrics" },
  { name: "metrics, light", theme: "light", instr: "1", hash: "#metrics" },
  { name: "practice queue, light", theme: "light", instr: "1", hash: "#practice" },
  { name: "practice queue, dark", theme: "dark", instr: "1", hash: "#practice" },
  { name: "practice ticket, dark", theme: "dark", instr: "1", hash: "#case/PRAC-4-0" },
  { name: "phone, Tier 4 case, dark", theme: "dark", instr: "1", hash: "#case/VOO-4107", width: 400 },
];

async function measure(dir, port, plantDot) {
  const srv = serve(dir, port);
  const pw = await import(PW); const { chromium } = pw.default || pw;
  const browser = await chromium.launch({ executablePath: CHROME, args: ["--headless=new", "--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"] });
  const out = [];
  try {
    for (const st of STATES) {
      const page = await browser.newPage({ viewport: { width: st.width || 1440, height: 1100 } });
      page.setDefaultTimeout(5000);
      await page.addInitScript(({ st, prog }) => {
        localStorage.setItem("cwp:theme", st.theme); localStorage.setItem("cwp:dyslexia", st.dys || "off"); localStorage.setItem("cwp:instructor", st.instr || "0");
        if (!st.fresh) localStorage.setItem("voo:progress:v1", JSON.stringify(prog)); else localStorage.removeItem("voo:progress:v1");
      }, { st, prog: PROGRESS });
      await page.goto(`http://127.0.0.1:${port}/${st.hash}`, { waitUntil: "load" });
      await page.waitForTimeout(250);
      if (plantDot) await page.addStyleTag({ content: ":root{--dot-ring:transparent!important}" });
      if (st.search) { await page.fill("#cq", st.search); await page.press("#cq", "Enter"); await page.waitForTimeout(150); }
      if (st.globalSearch) { await page.fill("#gq", st.globalSearch); await page.press("#gq", "Enter"); await page.waitForTimeout(150); }
      if (st.pin) { await page.click("#instrBtn"); await page.fill("#pin", st.pin); await page.press("#pin", "Enter"); await page.waitForTimeout(120); }
      if (st.open) { for (const b of await page.$$("[data-openscreen]")) { if (new RegExp(st.open).test(await b.textContent())) { await b.click(); await page.waitForTimeout(150); break; } } }
      if (st.scroll) await page.evaluate(() => document.querySelectorAll(".tablewrap").forEach(w => { w.scrollLeft = w.scrollWidth; }));
      const wide = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1 ? document.documentElement.scrollWidth : 0);
      const { runs, dots } = await page.evaluate(() => {
        const clipOf = el => { for (let a = el; a && a !== document.body; a = a.parentElement) { const o = getComputedStyle(a); if (/(auto|scroll|hidden)/.test(o.overflowX + o.overflowY)) return a.getBoundingClientRect(); } return null; };
        const outside = (r, c) => c && (r.right <= c.left + 1 || r.left >= c.right - 1 || r.bottom <= c.top + 1 || r.top >= c.bottom - 1);
        const runs = [];
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
        while ((n = w.nextNode())) {
          if (!n.textContent.trim()) continue;
          const el = n.parentElement; const cs = getComputedStyle(el);
          if (cs.visibility === "hidden" || cs.display === "none" || el.closest("[hidden]")) continue;
          const clip = clipOf(el); const rg = document.createRange(); rg.selectNodeContents(n);
          for (const r of rg.getClientRects()) {
            if (r.width < 2 || r.height < 2 || outside(r, clip)) continue;
            runs.push({ text: n.textContent.trim().slice(0, 40), color: cs.color, size: parseFloat(cs.fontSize), bold: parseInt(cs.fontWeight) >= 700, x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height });
          }
        }
        for (const inp of document.querySelectorAll("input, textarea")) {
          const r = inp.getBoundingClientRect(); const cs = getComputedStyle(inp);
          if (r.width && inp.value) runs.push({ text: "field:" + inp.value.slice(0, 30), color: cs.color, size: parseFloat(cs.fontSize), bold: false, x: r.x + 10 + scrollX, y: r.y + 6 + scrollY, w: Math.min(r.width - 20, 220), h: Math.min(r.height - 12, 20) });
        }
        const dots = [...document.querySelectorAll(".dot")].map(d => { const r = d.getBoundingClientRect(); return (!r.width || outside(r, clipOf(d))) ? null : { x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height }; }).filter(Boolean);
        return { runs, dots };
      });
      await page.addStyleTag({ content: "*{color:transparent!important;text-shadow:none!important;caret-color:transparent!important} input,textarea{-webkit-text-fill-color:transparent!important} ::placeholder{color:transparent!important}" });
      const png = await page.screenshot({ fullPage: true });
      await page.evaluate(() => { const s = [...document.querySelectorAll("style")].pop(); s.remove(); });
      const b64 = png.toString("base64");
      const sampled = await page.evaluate(async ({ b64, runs, dots }) => {
        const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
        const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
        const g = c.getContext("2d"); g.drawImage(img, 0, 0);
        const grounds = runs.map(r => {
          const x0 = Math.max(0, Math.floor(r.x)), y0 = Math.max(0, Math.floor(r.y));
          const w = Math.max(1, Math.min(Math.floor(r.w), img.width - x0)), h = Math.max(1, Math.min(Math.floor(r.h), img.height - y0));
          const d = g.getImageData(x0, y0, w, h).data; const m = new Map();
          for (let i = 0; i < d.length; i += 4) { const k = d[i] + "," + d[i + 1] + "," + d[i + 2]; m.set(k, (m.get(k) || 0) + 1); }
          const total = d.length / 4;
          const gs = [...m].filter(([, v]) => v / total >= 0.05).map(([k]) => k.split(",").map(Number));
          return gs.length ? gs : [[...m].sort((a, b) => b[1] - a[1])[0][0].split(",").map(Number)];
        });
        const marks = dots.map(d => {
          const box = g.getImageData(Math.floor(d.x), Math.floor(d.y), Math.ceil(d.w), Math.ceil(d.h)).data; const px = [];
          for (let i = 0; i < box.length; i += 4) px.push([box[i], box[i + 1], box[i + 2]]);
          return { px, ground: Array.from(g.getImageData(Math.round(d.x - 5), Math.round(d.y + d.h / 2), 1, 1).data.slice(0, 3)) };
        });
        return { grounds, marks };
      }, { b64, runs, dots });
      const fails = [];
      runs.forEach((r, i) => {
        const fg = r.color.match(/\d+(\.\d+)?/g).map(Number).slice(0, 3);
        const need = (r.size >= 24 || (r.bold && r.size >= 18.66)) ? 4.5 : 7;
        const worst = Math.min(...sampled.grounds[i].map(bg => ratio(fg, bg)));
        if (worst < need) fails.push(`${worst.toFixed(2)}:1 < ${need} "${r.text}"`);
      });
      const markFails = sampled.marks.filter(m => Math.max(...m.px.map(p => ratio(p, m.ground))) < 3).length;
      out.push({ name: st.name, runs: runs.length, fails, markFails, wide });
      await page.close();
    }
  } finally { await browser.close(); srv.close(); }
  return out;
}

function report(results) {
  let bad = 0;
  for (const r of results) {
    const problems = r.fails.length + r.markFails + (r.wide ? 1 : 0);
    bad += problems;
    console.log(`${problems ? "FAIL" : "ok  "} ${r.name}: ${r.runs} text runs${r.fails.length ? `, ${r.fails.length} below AAA` : ""}${r.markFails ? `, ${r.markFails} marks below 3:1` : ""}${r.wide ? `, page scrolls sideways (${r.wide}px)` : ""}`);
    for (const f of r.fails.slice(0, 6)) console.log("       " + f);
  }
  return bad;
}

if (process.argv.includes("--plant")) {
  const mk = fn => { const d = mkdtempSync(join(tmpdir(), "voo-contrast-")); for (const f of ["index.html", "assets"]) cpSync(join(ROOT, f), join(d, f), { recursive: true }); fn(d); return d; };
  const css = (d, extra) => writeFileSync(join(d, "assets/style.css"), readFileSync(join(d, "assets/style.css"), "utf8") + extra);
  const plants = {
    lowtext: { dir: mk(d => css(d, "\n.crumbs{color:#5a6473!important}")), expect: r => r.some(x => x.fails.some(f => f.includes("Veterans Overcoming"))) },
    gradient: { dir: mk(d => css(d, "\n.case-head{background:none!important;background-image:linear-gradient(#f4f4f4,#ffffff)!important}\n:root[data-theme=light] .case-head *{color:#eef3f9!important}")), expect: r => r.some(x => x.name.includes("light") && x.name.includes("case") && x.fails.length) },
    nodotring: { dir: mk(() => {}), dot: true, expect: r => r.some(x => x.name.includes("light") && x.markFails > 0) },
    wide: { dir: mk(d => css(d, "\n@media (max-width:500px){.case-head{min-width:700px}}")), expect: r => r.some(x => x.name.startsWith("phone") && x.wide) },
    /* the later-tier evidence views: prove their states really measure them */
    lowtree: { dir: mk(d => css(d, "\n:root[data-theme=light] ul.tree *{color:#8a95a3!important}")), expect: r => r.some(x => x.name.includes("EDR process tree, light") && x.fails.length) },
    lowflow: { dir: mk(d => css(d, "\n:root[data-theme=light] ol.flow *{color:#8a95a3!important}")), expect: r => r.some(x => x.name.includes("SOAR flow, light") && x.fails.length) },
  };
  let all = true, port = 8901;
  for (const [name, p] of Object.entries(plants)) {
    const res = await measure(p.dir, port++, p.dot);
    const caught = p.expect(res);
    console.log(`  ${caught ? "caught " : "MISSED "} ${name}`);
    if (!caught) all = false;
  }
  console.log(all ? `\nall ${Object.keys(plants).length} plants caught.` : "\nA PLANT WAS MISSED.");
  process.exit(all ? 0 : 1);
} else {
  const bad = report(await measure(ROOT, 8900, false));
  console.log(bad ? `\nFAIL: ${bad}` : "\nAll text meets AAA on painted pixels, every mark stands 3:1, and nothing scrolls sideways.");
  process.exit(bad ? 1 : 0);
}
