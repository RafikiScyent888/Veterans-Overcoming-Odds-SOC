/* =====================================================================
   THE DECISION BOARD — the owner's hint ladder, exactly

   Nothing at wrong picks 1–2 · rung 1 at 3 · rung 2 at 4 · rung 3 from 5,
   for ever, leaving exactly two live options · never the answer · wrong
   stays red until reset · picking a red option changes nothing · the
   same seed gives the same order.

   Run:        node verify/engine.mjs
   Calibrate:  node verify/engine.mjs --plant
   ===================================================================== */
import { readFileSync, writeFileSync, mkdtempSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { tmpdir } from "os";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "..", "assets", "decisions.js");

const D = { id: "d1", options: [
  { id: "a", text: "A", correct: true, why: "" },
  { id: "b", text: "B", correct: false, why: "b" }, { id: "c", text: "C", correct: false, why: "c" },
  { id: "d", text: "D", correct: false, why: "d" }, { id: "e", text: "E", correct: false, why: "e" },
  { id: "f", text: "F", correct: false, why: "f" } ] };

function wrongIds(m, st) { return st.order.filter(id => id !== "a"); }

const CASES = [
  ["the shuffle is the same every time for the same board", m => m.createBoard("t1", D).order.join() === m.createBoard("t1", D).order.join()],
  ["the shuffle keeps all six options", m => m.createBoard("t1", D).order.slice().sort().join() === "a,b,c,d,e,f"],
  ["different boards get different orders", m => { const seen = new Set(); for (let i = 0; i < 12; i++) seen.add(m.createBoard("t" + i, D).order.indexOf("a")); return seen.size >= 4; }],
  ["no hint after wrong picks 1 and 2", m => { const st = m.createBoard("t1", D); const w = wrongIds(m, st); m.pick(D, st, w[0]); const r1 = m.rung(st); m.pick(D, st, w[1]); return r1 === 0 && m.rung(st) === 0; }],
  ["rung 1 at wrong pick 3", m => { const st = m.createBoard("t1", D); const w = wrongIds(m, st); for (let i = 0; i < 3; i++) m.pick(D, st, w[i]); return m.rung(st) === 1; }],
  ["rung 2 at wrong pick 4", m => { const st = m.createBoard("t1", D); const w = wrongIds(m, st); for (let i = 0; i < 4; i++) m.pick(D, st, w[i]); return m.rung(st) === 2; }],
  ["rung 3 at wrong pick 5 leaves exactly two live", m => {
    /* a board with many wrong options would test narrowing; with six, five
       wrong picks strike every wrong one — so test narrowing on a board
       where earlier picks were few: strike 2, then pretend 3 more wrongs */
    const st = m.createBoard("t1", D); const w = wrongIds(m, st);
    m.pick(D, st, w[0]); m.pick(D, st, w[1]); st.wrong = 4; m.pick(D, st, w[2]);
    return m.rung(st) === 3 && m.live(D, st).length === 2 && m.live(D, st).includes("a"); }],
  ["rung 3 never removes the right answer", m => { for (let i = 0; i < 20; i++) { const st = m.createBoard("seed" + i, D); const w = wrongIds(m, st); st.wrong = 4; m.pick(D, st, w[0]); if (st.narrowed.includes("a") || st.struck.includes("a") || !m.live(D, st).includes("a")) return false; } return true; }],
  ["rung 3 gives every removed option a reason", m => { const st = m.createBoard("t1", D); const w = wrongIds(m, st); st.wrong = 4; m.pick(D, st, w[0]); return st.narrowed.every(id => D.options.find(o => o.id === id).why); }],
  ["a wrong pick stays red after further picks", m => { const st = m.createBoard("t1", D); const w = wrongIds(m, st); m.pick(D, st, w[0]); m.pick(D, st, w[1]); return st.struck.includes(w[0]) && st.struck.includes(w[1]); }],
  ["picking a red option changes nothing", m => { const st = m.createBoard("t1", D); const w = wrongIds(m, st); m.pick(D, st, w[0]); const r = m.pick(D, st, w[0]); return r.ignored && st.wrong === 1; }],
  ["the right answer solves the board", m => { const st = m.createBoard("t1", D); const r = m.pick(D, st, "a"); return r.correct && st.solved; }],
  ["nothing changes after the board is solved", m => { const st = m.createBoard("t1", D); m.pick(D, st, "a"); const w = wrongIds(m, st); const r = m.pick(D, st, w[0]); return r.ignored && st.struck.length === 0; }],
  ["reset clears every red mark", m => { const st = m.createBoard("t1", D); const w = wrongIds(m, st); for (let i = 0; i < 4; i++) m.pick(D, st, w[i]); m.reset(D, st); return st.struck.length === 0 && m.live(D, st).length === 6; }],
  ["reset keeps the hints already earned", m => { const st = m.createBoard("t1", D); const w = wrongIds(m, st); for (let i = 0; i < 4; i++) m.pick(D, st, w[i]); m.reset(D, st); return m.rung(st) === 2; }],
  ["after a reset at rung 3, two options are live at once", m => { const st = m.createBoard("t1", D); const w = wrongIds(m, st); for (let i = 0; i < 5; i++) m.pick(D, st, w[i]); m.reset(D, st); return m.live(D, st).length === 2 && m.live(D, st).includes("a"); }],
  ["a saved board comes back the same", m => { const st = m.createBoard("t1", D); const w = wrongIds(m, st); m.pick(D, st, w[0]); const back = m.createBoard("t1", D, m.serialise(st)); return back.struck.join() === st.struck.join() && back.wrong === 1; }],
];

const PLANTS = {
  earlyhint: { catches: "no hint after wrong picks 1 and 2", fn: s => s.replace("export const RUNG_1_AT = 3;", "export const RUNG_1_AT = 2;") },
  toonarrow: { catches: "rung 3 at wrong pick 5 leaves exactly two live", fn: s => s.replace("if (standing.length <= 2) return;", "if (standing.length <= 1) return;").replace("for (const id of wrongLive) if (id !== keep) st.narrowed.push(id);", "for (const id of wrongLive) st.narrowed.push(id);") },
  strikeright: { catches: "rung 3 never removes the right answer", fn: s => s.replace("const wrongLive = standing.filter(id => id !== right);", "const wrongLive = standing;") },
  forgets: { catches: "a wrong pick stays red after further picks", fn: s => s.replace("st.struck.push(optionId);", "st.struck = [optionId];") },
  random: { catches: "the shuffle is the same every time for the same board", fn: s => s.replace("const r = rng(hash(seedText));", "const r = Math.random;") },
  hintloss: { catches: "reset keeps the hints already earned", fn: s => s.replace("st.struck = []; st.narrowed = []; st.solved = false; st.picked = null;", "st.struck = []; st.narrowed = []; st.solved = false; st.picked = null; st.wrong = 0;") },
  recount: { catches: "picking a red option changes nothing", fn: s => s.replace("|| st.struck.includes(optionId) ||", "||") },
};

async function load(plant) {
  let src = readFileSync(SRC, "utf8");
  if (plant) { const out = plant.fn(src); if (out === src) throw new Error("plant did not apply"); src = out; }
  const dir = mkdtempSync(join(tmpdir(), "voo-engine-")); const f = join(dir, "d.mjs"); writeFileSync(f, src);
  return import(pathToFileURL(f).href + "?" + Math.random());
}
async function run(plant) {
  const m = await load(plant); const fails = [];
  for (const [n, t] of CASES) { let ok = false; try { ok = !!t(m); } catch (e) { ok = false; } if (!ok) fails.push(n); }
  return fails;
}
if (process.argv.includes("--plant")) {
  let all = true;
  for (const [name, p] of Object.entries(PLANTS)) {
    const fails = await run(p); const caught = fails.includes(p.catches);
    console.log(`  ${caught ? "caught " : "MISSED "} ${name.padEnd(11)} (expected "${p.catches}")`);
    if (!caught) all = false;
  }
  console.log(all ? `\nall ${Object.keys(PLANTS).length} plants caught.` : "\nA PLANT WAS MISSED.");
  process.exit(all ? 0 : 1);
} else {
  const fails = await run(null);
  if (fails.length) { console.log("FAILURES:\n  " + fails.join("\n  ")); process.exit(1); }
  console.log(`the decision board: ${CASES.length} checks pass`);
}
