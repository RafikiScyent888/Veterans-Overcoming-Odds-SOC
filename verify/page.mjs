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

/* every story ticket in Tiers 2-5, plus one practice ticket per scenario type,
   read from the real content so the page is driven against what ships */
const { pathToFileURL } = await import("url");
const LATER = [];
for (const n of [2, 3, 4, 5]) {
  const m = await import(pathToFileURL(join(ROOT, `assets/content/tier${n}.js`)).href);
  for (const tk of m.TICKETS) LATER.push({ id: tk.id, query: tk.search.query });
}
{
  const m = await import(pathToFileURL(join(ROOT, "assets/content/practice.js")).href);
  const seen = new Set();
  for (const tk of m.practiceTickets()) if (!seen.has(tk.type)) { seen.add(tk.type); LATER.push({ id: tk.id, query: tk.search.query }); }
}

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
  tiergate: { file: "assets/app.js", catches: "Tier 2 is locked until Tier 1 is done", fn: s => s.replace("function tierOpen(n) { return n === 1 || window.CWP.instructor() || tierDone(n - 1); }", "function tierOpen(n) { return true; }") },
  noopen: { file: "assets/app.js", catches: "opening a screen shows it and logs it", fn: s => s.replace("const i = Number(tgt.dataset.openscreen); ui.opened[tk.id].add(i);", "const i = Number(tgt.dataset.openscreen);") },
  guideopen: { file: "assets/app.js", catches: "the Tier 4 guide starts collapsed", fn: s => s.replace('if (mode === "collapsed" && !ui.guideOpen[tk.id] && !review) {', "if (false) {") },
  nomech: { file: "assets/app.js", catches: "the HIPAA panel sits above Decision 4", fn: s => s.replace("boardsHtml += (d.mechanism ?", "boardsHtml += (false ?") },
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

    /* ---- tiers open in order: without the PIN, Tier 2 waits for Tier 1 -- */
    await page.goto(base + "#queue"); await page.waitForTimeout(150);
    await check("Tier 2 is locked until Tier 1 is done", async () => !(await page.$('button.tier[data-tier="2"]')) && /locked/.test(await page.textContent(".tiers")));
    await page.goto(base + "#case/VOO-2107"); await page.waitForTimeout(150);
    await check("a later-tier case refuses to open before its tier", async () => /isn't open yet/.test(await page.textContent(".content")));

    /* ---- the instructor PIN opens every tier -------------------------- */
    await page.goto(base + "#queue"); await page.waitForTimeout(100);
    await page.click("#instrBtn"); await page.fill("#pin", "3693"); await page.press("#pin", "Enter"); await page.waitForTimeout(150);
    await check("instructor mode opens all five tiers", async () => (await page.$$("button.tier[data-tier]")).length === 5);

    /* ---- Tier 3 (walk): linked screens shown, the rest opened by hand --- */
    await page.goto(base + "#case/VOO-3016"); await page.waitForTimeout(150);
    await check("Tier 3 offers screens to open that aren't linked", async () => (await page.$$("[data-openscreen]")).length >= 3);
    await check("the Tier 3 guide says what to find, all at once", async () => !(await page.$("#guideNext")) && (await page.$$(".guide ol li")).length >= 3);
    const tabsBefore = (await page.$$(".tabs .tab")).length;
    await page.click("[data-openscreen]"); await page.waitForTimeout(150);
    await check("opening a screen shows it and logs it", async () => (await page.$$(".tabs .tab")).length === tabsBefore + 1 && (await page.textContent(".activity")).includes("Opened screen"));
    await check("the EDR process view renders as a tree", async () => { for (const b of await page.$$("[data-openscreen]")) { if (/EDR/.test(await b.textContent())) { await b.click(); await page.waitForTimeout(120); break; } } return !!(await page.$("ul.tree")); });

    /* ---- Tier 4 (run): nothing attached, guide collapsed, Fizban asked -- */
    await page.goto(base + "#case/VOO-4107"); await page.waitForTimeout(150);
    await check("Tier 4 attaches nothing to the ticket", async () => /Nothing is attached/.test(await page.textContent(".content")));
    await check("the Tier 4 guide starts collapsed", async () => !!(await page.$("#guideOpen")) && !(await page.$(".guide ol")));
    await check("Fizban only speaks at Tier 4 when asked", async () => !!(await page.$("#askFizban")) && !(await page.$(".fizban")));
    await page.click("#askFizban"); await page.waitForTimeout(120);
    await check("asking Fizban shows its answer and logs it", async () => !!(await page.$(".fizban")) && (await page.textContent(".activity")).includes("Asked Fizban"));
    for (const d of ["d1", "d2", "d3"]) { await page.click(`[data-board="${d}"][data-opt="a"]`); await page.waitForTimeout(100); }
    await check("the HIPAA panel sits above Decision 4", async () => { const t = await page.textContent(".content"); const i = t.indexOf("How the HIPAA line works"), j = t.indexOf("Decision 4 of 5"); return i > 0 && j > i; });

    /* ---- Tier 5: the SOAR flow view ------------------------------------ */
    await page.goto(base + "#case/VOO-5030"); await page.waitForTimeout(150);
    for (const b of await page.$$("[data-openscreen]")) { if (/SOAR editor/.test(await b.textContent())) { await b.click(); await page.waitForTimeout(120); break; } }
    await check("the SOAR playbook renders as a flow with its gaps", async () => (await page.$$("ol.flow li")).length >= 5 && !!(await page.$("ol.flow li.flow-gap")));

    /* ---- metrics and the practice queue -------------------------------- */
    await page.goto(base + "#metrics"); await page.waitForTimeout(150);
    await check("the metrics screen shows a row per tier", async () => (await page.$$(".content table tbody tr")).length === 5);
    await page.goto(base + "#practice"); await page.waitForTimeout(200);
    await check("the practice queue lists all 17 scenario types", async () => (await page.$$(".content section h2")).length === 17);
    await check("the practice queue holds 170 tickets", async () => (await page.$$('tr[data-id^="PRAC-"]')).length === 170);

    /* ---- every story ticket in Tiers 2-5, and one practice ticket per type,
            opens without an error and its guided search returns rows ------- */
    for (const { id, query } of LATER) {
      await page.goto(base + "#case/" + id); await page.waitForTimeout(90);
      await page.fill("#cq", query); await page.press("#cq", "Enter"); await page.waitForTimeout(110);
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
