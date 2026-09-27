/* =====================================================================
   THE SEARCH BAR — does it return what the evidence says it should?

   Students type searches from ticket 001. If the search engine gets a
   wildcard or a count wrong, a student reads the right evidence wrongly
   and nobody can tell. So every behaviour a ticket depends on is pinned
   here, and every pin is shown to FAIL on a planted bug first.

   Run:        node verify/search.mjs
   Calibrate:  node verify/search.mjs --plant
   ===================================================================== */
import { readFileSync, writeFileSync, mkdtempSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { tmpdir } from "os";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "..", "assets", "search.js");

const NOW = Date.parse("2026-10-06T09:41:00Z");
const EV = [
  { time: "2026-10-06T08:55:00Z", source: "signin", user: "otik@steadfastoutpost.example", src_ip: "203.0.113.44", result: "failure", bytes: 10 },
  { time: "2026-10-06T08:56:00Z", source: "signin", user: "otik@steadfastoutpost.example", src_ip: "203.0.113.44", result: "success", bytes: 20 },
  { time: "2026-10-06T09:31:00Z", source: "signin", user: "otik@steadfastoutpost.example", src_ip: "198.51.100.17", result: "success", bytes: 30 },
  { time: "2026-10-06T09:35:00Z", source: "signin", user: "tika@steadfastoutpost.example", src_ip: "198.51.100.17", result: "success", bytes: 40 },
  { time: "2026-10-04T09:00:00Z", source: "signin", user: "old@steadfastoutpost.example", src_ip: "192.0.2.9", result: "success", bytes: 50 },
  { time: "2026-10-06T08:14:09Z", source: "proxy", user: "gilthanas", method: "GET", url: "https://payneschool-login.example/reset", status: 200 },
];

const CASES = [
  ["an exact field match", r => r("source=proxy").count === 1],
  ["a wildcard matches a pattern", r => r('source=signin user="otik@*"').count === 3],
  ["a wildcard matches nothing it shouldn't", r => r('user="otik@*"').rows.every(x => x.user.startsWith("otik@"))],
  ["!= excludes the value", r => r("source=signin result!=success").count === 1],
  ["earliest keeps only the window", r => r("source=signin earliest=-24h").count === 4],
  ["a bare word searches every field", r => r("payneschool-login").count === 1],
  ["table keeps only the named fields, in order", r => { const x = r("source=proxy | table user method"); return x.columns.join() === "user,method" && Object.keys(x.rows[0]).join() === "user,method"; }],
  ["stats count by groups correctly", r => { const x = r("source=signin | stats count by src_ip"); return x.rows.find(y => y.src_ip === "198.51.100.17").count === 2; }],
  ["dc counts distinct values, not rows", r => { const x = r("source=signin | stats dc(user) by src_ip"); return x.rows.find(y => y.src_ip === "198.51.100.17")["dc(user)"] === 2 && x.rows.find(y => y.src_ip === "203.0.113.44")["dc(user)"] === 1; }],
  ["sort with a minus sorts largest first", r => { const x = r("source=signin | sort -bytes | head 1"); return x.rows[0].bytes === 50; }],
  ["head limits the rows", r => r("source=signin | head 2").count === 2],
  ["dedup keeps one row per value", r => r("source=signin | dedup user").count === 3],
  ["the field list counts distinct values", r => r("source=signin earliest=-24h").fields.user === 2],
  ["a bad command comes back as a plain error, not a crash", r => { const x = r("source=signin | fly"); return !!x.error && /isn't a command/.test(x.error); }],
  ["a bad argument while running comes back as a plain error", r => /whole number/.test(r("source=signin | head lots").error || "")],
  ["an unclosed quote is explained", r => /not closed/.test(r('user="otik').error || "")],
  ["a bad earliest is explained", r => /isn't a time/.test(r("source=signin earliest=yesterday").error || "")],
  ["an empty search is explained", r => /empty/.test(r("").error || "")],
  ["no results is an answer, not an error", r => { const x = r("source=nothing"); return x.error === null && x.count === 0; }],
];

const PLANTS = {
  wildcard: { catches: "a wildcard matches a pattern", fn: s => s.replace('.replace(/\\*/g, ".*")', "") },
  earliest: { catches: "earliest keeps only the window", fn: s => s.replace("if (parsed.earliest !== null) {", "if (false) {") },
  dcrows: { catches: "dc counts distinct values, not rows", fn: s => s.replace('s.fn === "dc"    ? new Set(vals.map(String)).size :', 's.fn === "dc"    ? vals.length :') },
  crash: { catches: "a bad command comes back as a plain error, not a crash", fn: s => s.replace('catch (e) { return { error: e instanceof SearchError ? e.message : "That search couldn\'t be read.', 'catch (e) { throw e; return { error: e instanceof SearchError ? e.message : "That search couldn\'t be read.') },
  runcrash: { catches: "a bad argument while running comes back as a plain error", fn: s => s.replace('catch (e) {\n    return { error: e instanceof SearchError ? e.message : "That search couldn\'t be run.', 'catch (e) { throw e;\n    return { error: e instanceof SearchError ? e.message : "That search couldn\'t be run.') },
  notequal: { catches: "!= excludes the value", fn: s => s.replace('case "!=": return !has || !wildcard', 'case "!=": return !has || wildcard') },
};

async function load(plant) {
  let src = readFileSync(SRC, "utf8");
  if (plant) {
    const out = plant.fn(src);
    if (out === src) throw new Error("plant did not apply — it is testing nothing");
    src = out;
  }
  const dir = mkdtempSync(join(tmpdir(), "voo-search-"));
  const f = join(dir, "search.mjs"); writeFileSync(f, src);
  return import(pathToFileURL(f).href + "?" + Math.random());
}

async function run(plant) {
  const m = await load(plant);
  const r = q => m.runSearch(q, EV, NOW);
  const fails = [];
  for (const [name, test] of CASES) {
    let ok = false;
    try { ok = !!test(r); } catch (e) { ok = false; }
    if (!ok) fails.push(name);
  }
  return fails;
}

if (process.argv.includes("--plant")) {
  let all = true;
  for (const [name, p] of Object.entries(PLANTS)) {
    const fails = await run(p);
    const caught = fails.includes(p.catches);
    console.log(`  ${caught ? "caught " : "MISSED "} ${name.padEnd(9)} (expected "${p.catches}")`);
    if (!caught) all = false;
  }
  console.log(all ? `\nall ${Object.keys(PLANTS).length} plants caught.` : "\nA PLANT WAS MISSED. A check that cannot fail is not a check.");
  process.exit(all ? 0 : 1);
} else {
  const fails = await run(null);
  if (fails.length) { console.log("FAILURES:\n  " + fails.join("\n  ")); process.exit(1); }
  console.log(`the search bar: ${CASES.length} checks pass`);
}
