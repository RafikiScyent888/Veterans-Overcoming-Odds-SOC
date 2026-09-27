/* =====================================================================
   THE CONSOLE, DRIVEN — written and reachable are different claims

   A registry proves content exists; only driving the page proves it
   renders and behaves. This opens the console in Chromium and does what
   a student does: reads the seat change, opens a ticket, types a search,
   uses the click-a-value menu, picks wrong answers until each hint rung
   appears, solves both boards, tries to close without a resolution,
   closes, reloads to check it was saved, replays for practice, and tries
   the instructor PIN, wrong and right.

   Run:        node verify/page.mjs
   Calibrate:  node verify/page.mjs --plant
   ===================================================================== */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, existsSync, statSync } from "fs";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";
import { createServer } from "http";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const PW = process.env.PW || "/opt/node22/lib/node_modules/playwright/index.mjs";
const CHROME = process.env.CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };

function serve(dir, port) {
  return createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
    const f = join(dir, p);
    if (!f.startsWith(dir) || !existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" }); res.end(readFileSync(f));
  }).listen(port);
}

const PLANTS = {
  nohints: { file: "assets/app.js", catches: "rung 1 appears after the third wrong pick", fn: s => s.replace("if (r >= 1) hints.push(", "if (false) hints.push(") },
  nosave: { file: "assets/app.js", catches: "the ruled-out options are still red after a reload", fn: s => s.replace("t.boards[d.id] = serialise(st);\n      if (res.correct", "if (res.correct") },
  closeanyway: { file: "assets/app.js", catches: "closing without a resolution is refused", fn: s => s.replace('if ((t.notes.resolution || "").trim().length < 30) {', "if (false) {") },
  anypin: { file: "assets/app.js", catches: "a wrong PIN leaves instructor mode off", fn: s => s.replace('if (String(input.value).trim() === PIN) {', "if (true) {") },
  replayloses: { file: "assets/save.js", catches: "a practice replay keeps the first attempt", fn: s => s.replace("t.boards = r.boards; t.notes = r.notes;", "t.notes = { analyst: \"\", investigation: \"\", resolution: \"\" };") },
  nomenu: { file: "assets/app.js", catches: "the click-a-value menu adds the value to the search", fn: s => s.replace("const next = tgt.dataset.addterm ? addTerm(cur, tgt.dataset.addterm) : tgt.dataset.newsearch;", "const next = cur;") },
};

async function drive(dir, port) {
  const srv = serve(dir, port);
  const pw = await import(PW); const { chromium } = pw.default || pw;
  const browser = await chromium.launch({ executablePath: CHROME, args: ["--headless=new", "--no-sandbox"] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(4000);
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error" && !/fonts\.(googleapis|gstatic)|ERR_|net::/.test(m.text())) errors.push(m.text()); });
  const fails = [];
  const check = async (name, fn) => { let ok = false; try { ok = !!(await fn()); } catch (e) { ok = false; } if (!ok) fails.push(name); };
  const base = `http://127.0.0.1:${port}/`;
  try {
    await page.goto(base, { waitUntil: "load" }); await page.waitForTimeout(300);
    await check("the seat change is the first screen", async () => (await page.textContent("#introTitle")).includes("switched seats"));
    await page.click("#startShift"); await page.waitForTimeout(200);
    await check("the queue shows all seven Tier 1 tickets", async () => (await page.$$("tr[data-id]")).length === 7);
    await check("severity is shown as a dot and a word", async () => (await page.textContent("tr[data-id] .sev")).trim().length > 2 && !!(await page.$("tr[data-id] .sev .dot")));

    await page.goto(base + "#case/VOO-1063"); await page.waitForTimeout(200);
    await check("the case page opens with evidence tabs", async () => (await page.$$(".tabs .tab")).length >= 3);
    /* the guide: next step until the search appears, then put it in the bar */
    for (let i = 0; i < 4; i++) { const b = await page.$("#guideNext"); if (b) await b.click(); await page.waitForTimeout(60); }
    await check("the guide shows the first search", async () => !!(await page.$("#useSearch")));
    await page.fill("#cq", 'source=proxy url="*payneschool-login.example*"'); await page.press("#cq", "Enter"); await page.waitForTimeout(150);
    await check("a typed search returns the evidence", async () => (await page.$$(".results tbody tr")).length === 1 && (await page.textContent(".results")).includes("GET"));
    await page.click('.results button.val[data-field="method"]'); await page.waitForTimeout(80);
    await page.click(".valmenu button[data-addterm]"); await page.waitForTimeout(120);
    await check("the click-a-value menu adds the value to the search", async () => (await page.inputValue("#cq")).includes("method=GET"));
    await page.fill("#cq", "source=proxy | fly"); await page.press("#cq", "Enter"); await page.waitForTimeout(100);
    await check("a bad search shows a plain error", async () => /isn't a command/.test(await page.textContent(".search-error")));

    /* Decision 1: wrong picks, one at a time, watching the ladder */
    const wrongButtons = async () => {
      const ids = await page.$$eval('[data-board="d1"]', bs => bs.map(b => ({ id: b.dataset.opt, dis: b.getAttribute("aria-disabled") })));
      return ids.filter(x => x.id !== "a" && x.dis !== "true").map(x => x.id);
    };
    const pickWrong = async () => { const w = await wrongButtons(); await page.click(`[data-board="d1"][data-opt="${w[0]}"]`); await page.waitForTimeout(80); };
    await pickWrong(); await pickWrong();
    await check("no hint after two wrong picks", async () => (await page.$$(".board .hint")).length === 0);
    await check("a wrong pick stays red and says so", async () => (await page.$$(".opt.struck")).length === 2 && (await page.textContent(".opt.struck .word")).includes("Ruled out"));
    await pickWrong();
    await check("rung 1 appears after the third wrong pick", async () => (await page.textContent(".board")).includes("Hint: where to look"));
    await pickWrong();
    await check("rung 2 appears after the fourth wrong pick", async () => (await page.textContent(".board")).includes("Hint: the principle"));
    await check("two options are still live after four wrong picks", async () => (await page.$$('[data-board="d1"]:not([aria-disabled="true"])')).length === 2);
    await page.reload(); await page.waitForTimeout(250);
    await check("the ruled-out options are still red after a reload", async () => (await page.$$(".opt.struck")).length === 4);
    await page.click('[data-board="d1"][data-opt="a"]'); await page.waitForTimeout(100);
    await check("the right answer is marked and the lesson shown", async () => !!(await page.$(".opt.right")) && (await page.textContent(".lesson")).length > 20);
    await check("Decision 2 opens after Decision 1", async () => (await page.$$('[data-board="d2"]')).length === 6);
    await page.click('[data-board="d2"][data-opt="a"]'); await page.waitForTimeout(100);
    await page.click("#closeCase"); await page.waitForTimeout(100);
    await check("closing without a resolution is refused", async () => /resolution/i.test(await page.textContent("#closeMsg")) && !(await page.$(".objsum")));
    await page.fill("#nResolve", "Credential phishing, contained. No resets. Could not be confirmed: devices off the proxy.");
    await page.waitForTimeout(400);
    await page.click("#closeCase"); await page.waitForTimeout(150);
    await check("closing shows the objective summary", async () => (await page.$$(".objsum tbody tr")).length === 7);
    await check("the activity log recorded the search and the decisions", async () => { const t = await page.textContent(".activity"); return t.includes("Searched:") && t.includes("Decision 1") && t.includes("Case closed"); });
    await page.reload(); await page.waitForTimeout(250);
    await check("a closed case stays closed after a reload, read-only", async () => !!(await page.$(".objsum")) && !(await page.$("#closeCase")));

    /* replay for practice, then check the first attempt survived */
    await page.goto(base + "#queue"); await page.waitForTimeout(150);
    await page.click("#tabClosed"); await page.waitForTimeout(100);
    await page.click('tr[data-id="VOO-1063"]'); await page.waitForTimeout(100);
    await page.click('[data-replay="VOO-1063"]'); await page.waitForTimeout(200);
    await check("a replay starts clean and says it's practice", async () => (await page.$$(".opt.struck")).length === 0 && (await page.textContent(".practice-banner")).includes("Practice"));
    await page.click('[data-board="d1"][data-opt="a"]'); await page.waitForTimeout(80);
    await page.click('[data-board="d2"][data-opt="a"]'); await page.waitForTimeout(80);
    await page.fill("#nResolve", "Practice run: phishing, purged and blocked. Could not be confirmed: phones."); await page.waitForTimeout(400);
    await page.click("#closeCase"); await page.waitForTimeout(150);
    await check("a practice replay keeps the first attempt", async () => (await page.inputValue("#nResolve")).startsWith("Credential phishing, contained") && (await page.$$(".opt.struck")).length === 4);

    /* instructor PIN */
    await page.click("#instrBtn"); await page.fill("#pin", "1111"); await page.press("#pin", "Enter"); await page.waitForTimeout(100);
    await check("a wrong PIN leaves instructor mode off", async () => (await page.getAttribute("html", "data-instructor")) === "off");
    await page.fill("#pin", "3693"); await page.press("#pin", "Enter"); await page.waitForTimeout(150);
    await check("the right PIN turns instructor mode on", async () => (await page.getAttribute("html", "data-instructor")) === "on" && /every tier/.test(await page.textContent(".instr-banner")));
    await page.click("#instrBtn"); await page.waitForTimeout(100);
    await check("instructor mode toggles off again", async () => (await page.getAttribute("html", "data-instructor")) === "off");

    /* every ticket opens without an error, and its guided search returns rows */
    for (const id of ["VOO-1042", "VOO-1187", "VOO-1051", "VOO-1055", "VOO-1068", "VOO-1071"]) {
      await page.goto(base + "#case/" + id); await page.waitForTimeout(120);
      await page.click("#guideAll"); await page.waitForTimeout(60);
      await page.click("#useSearch"); await page.waitForTimeout(60);
      await page.press("#cq", "Enter"); await page.waitForTimeout(120);
      await check(`${id}: the guided search returns rows on the page`, async () => (await page.$$(".results tbody tr")).length > 0);
    }
    await check("no script errors on any screen", async () => errors.length === 0);
  } catch (e) {
    /* A planted bug can stop the walk-through part way. Report what was
       checked up to that point, and say where it stopped. */
    fails.push("the run stopped early — " + String(e.message).split("\n")[0]);
  } finally {
    await browser.close(); srv.close();
  }
  return { fails, errors };
}

function copyWithPlant(p) {
  const dir = mkdtempSync(join(tmpdir(), "voo-page-"));
  for (const f of ["index.html", "assets"]) cpSync(join(ROOT, f), join(dir, f), { recursive: true });
  const src = readFileSync(join(dir, p.file), "utf8"); const out = p.fn(src);
  if (out === src) throw new Error("plant did not apply");
  writeFileSync(join(dir, p.file), out);
  return dir;
}

if (process.argv.includes("--plant")) {
  let all = true, port = 8801;
  for (const [name, p] of Object.entries(PLANTS)) {
    const { fails } = await drive(copyWithPlant(p), port++);
    const caught = fails.includes(p.catches);
    console.log(`  ${caught ? "caught " : "MISSED "} ${name.padEnd(12)} (expected "${p.catches}")`);
    if (!caught) { all = false; console.log("      got: " + fails.slice(0, 3).join(" | ")); }
  }
  console.log(all ? `\nall ${Object.keys(PLANTS).length} plants caught.` : "\nA PLANT WAS MISSED.");
  process.exit(all ? 0 : 1);
} else {
  const { fails, errors } = await drive(ROOT, 8800);
  if (errors.length) console.log("script errors:\n  " + errors.join("\n  "));
  if (fails.length) { console.log("FAILURES:\n  " + fails.join("\n  ")); process.exit(1); }
  console.log("the console, driven: every check passes");
}
