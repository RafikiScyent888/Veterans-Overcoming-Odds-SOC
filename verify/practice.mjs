/* =====================================================================
   THE PRACTICE QUEUE — every generated ticket, against every rule.

   The story tickets are checked by verify/content.mjs. The practice
   tickets are generated from seeds, so this verifier drives all 170 and
   proves, for each one, that:

     1. SHAPE      six options, one correct, a reason on every wrong one,
                   rungs 1 and 2 written, decisions = firstTier + 1, a
                   write-up that says what could not be confirmed
     2. TELLS      across all practice boards, the right answer is not the
                   longest or shortest more than chance; absolute words
                   aren't a giveaway; after the shuffle no slot is stuffed
     3. HINTS      no hint repeats four words of the right answer
     4. FACTS      objective numbers only from the owner's list; ATT&CK IDs
                   only ones checked against MITRE's data
     5. SAFETY     addresses only from documentation or private ranges;
                   every domain ends in .example; nothing do-not-reuse
     6. EVIDENCE   every generated ticket's proofs, run against ITS OWN
                   generated events, show what the ticket claims. This is
                   the owner's rule: a generated fault must be exhibited by
                   the parts generated

   Run:        node verify/practice.mjs
   Calibrate:  node verify/practice.mjs --plant
   ===================================================================== */
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const { runSearch } = await import(pathToFileURL(join(ROOT, "assets/search.js")).href);
const { shuffledIds, placed } = await import(pathToFileURL(join(ROOT, "assets/decisions.js")).href);

const OBJECTIVES = ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "2.1", "2.2", "2.3", "2.4", "2.5", "3.1", "3.2", "3.3", "3.4", "3.5", "4.1", "4.2"];
const ATTACK = new Set(["T1566.001", "T1204.002", "T1059.001", "T1059.003", "T1033", "T1105", "T1621", "T1528", "T1539", "T1550.004", "T1567.002", "T1552.001", "T1530", "T1498", "T1110.004", "T1195.002", "T1657", "T1496", "T1046", "T1059.007", "T1583.001", "T1136.001", "T1114.002", "T1586.002", "T1566.004", "T1078.004", "T1486", "T1071.004", "T1564.008", "T1078", "T1071", "T1071.001", "T1110.003", "T1136", "T1566.002", "T1219.002", "T1133", "T1135", "T1490", "T1021", "T1053", "T1573", "T1219.003", "T1190", "T1195", "T1499"]);
const TIER_DECISIONS = { "Tier 1": 2, "Tier 2": 3, "Tier 3": 4, "Tier 4": 5, "Tier 5": 6 };
const DO_NOT_REUSE = ["192.168.1.10", "47.31.32.101", "41.21.18.102", "sjames", "invoice.exe", "81.161.63.253", "192.168.76.5", "secure-credential-update", "company-portal.com", "syncsvc.exe", "updateagent.exe", "haris.khan", "daniel.richards", "install.exe", "botsv1", "gotham-fortigate", "71.39.18.122", "192.168.250.", "93.184.216.34", "corp.com"];
const ABSOLUTE = /\b(always|never|every|all|any|only|permanent|immediately|nothing)\b/i;

function ipAllowed(ip) {
  const p = ip.split(".").map(Number);
  if (p.some(x => x > 255)) return true;
  if (ip.startsWith("192.0.2.") || ip.startsWith("198.51.100.") || ip.startsWith("203.0.113.")) return true;
  if (p[0] === 10 || (p[0] === 172 && p[1] >= 16 && p[1] <= 31) || (p[0] === 192 && p[1] === 168)) return true;
  return false;
}
const allText = obj => JSON.stringify(obj, (k, v) => typeof v === "function" ? undefined : v);

async function load() {
  const m = await import(pathToFileURL(join(ROOT, "assets/content/practice.js")).href + "?" + Math.random());
  return m;
}

function checkTicket(tk, fail, boards) {
  const T = tk.id;
  const want = TIER_DECISIONS["Tier " + tk.tier];
  if (tk.decisions.length !== want) fail("shape", `${T} has ${tk.decisions.length} decisions; Tier ${tk.tier} wants ${want}`);
  if (!/could not be confirmed/i.test(tk.writeup || "")) fail("shape", `${T}'s write-up doesn't say what could not be confirmed`);
  if (!tk.guide?.length || !tk.summary?.length || !tk.search?.query) fail("shape", `${T} is missing its guide, summary or search`);
  for (const d of tk.decisions) {
    const id = `${T}/${d.id}`;
    if (d.options.length !== 6) fail("shape", `${id} has ${d.options.length} options, not six`);
    if (d.options.filter(o => o.correct).length !== 1) fail("shape", `${id} doesn't have exactly one correct option`);
    for (const o of d.options) if (!o.correct && !(o.why && o.why.trim())) fail("shape", `${id} option ${o.id} is wrong but has no reason`);
    if (!Array.isArray(d.hints) || d.hints.length < 2 || d.hints.some(h => !h.trim())) fail("shape", `${id} needs rung 1 and rung 2 hints`);
    if (!d.prompt || !d.lesson) fail("shape", `${id} needs a prompt and a lesson`);
    boards.push({ id, d, ticket: T });
    const right = d.options.find(o => o.correct);
    if (right) {
      const w = right.text.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
      for (const h of d.hints) {
        const hl = " " + h.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ") + " ";
        for (let i = 0; i + 4 <= w.length; i++) if (hl.includes(" " + w.slice(i, i + 4).join(" ") + " ")) { fail("hints", `${id}: a hint repeats "${w.slice(i, i + 4).join(" ")}" from the right answer`); break; }
      }
    }
  }
  for (const row of tk.summary) if (!OBJECTIVES.includes(row[0])) fail("facts", `${T} names objective ${row[0]}, not on the owner's list`);
  const text = allText(tk);
  for (const m of text.matchAll(/\bT\d{4}(?:\.\d{3})?\b/g)) if (!ATTACK.has(m[0])) fail("facts", `${T} uses ATT&CK ${m[0]}, not checked against MITRE's data`);
  for (const m of text.matchAll(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g)) if (!ipAllowed(m[0])) fail("safety", `${T} uses address ${m[0]}, not a documentation or private range`);
  for (const m of text.matchAll(/\b(?:[a-z0-9-]+\.)+([a-z]{2,})\b/gi)) {
    const host = m[0].toLowerCase();
    if (/^\d/.test(host) || /\.(exe|docm|xlsm|js|msi|php|tf|ps1|dll|zip|pdf|csv|log|json)$/.test(host)) continue;
    if (/^(e\.g|i\.e)$/.test(host)) continue;
    if (/^zeek\.(conn|ssl)$/.test(host) || /^id\.(orig_h|resp_h|resp_p)$/.test(host)) continue;
    if (host.endsWith("@mail.example")) continue;
    if (!host.endsWith(".example")) fail("safety", `${T}: "${m[0]}" is a domain that doesn't end in .example`);
  }
  const low = text.toLowerCase();
  for (const s of DO_NOT_REUSE) if (low.includes(s.toLowerCase())) fail("safety", `${T}: "${s}" is on the do-not-reuse list`);
  /* 6. evidence: proofs run against the ticket's OWN events */
  const now = Date.parse(tk.now);
  const guided = runSearch(tk.search.query, tk.events, now);
  if (guided.error || !guided.count) fail("evidence", `${T}'s guided search ${guided.error ? "errors: " + guided.error : "returns nothing"}`);
  if (!(tk.proofs || []).length) fail("evidence", `${T} has no proof its evidence shows its answer`);
  for (const p of tk.proofs || []) {
    const r = runSearch(p.query, tk.events, now);
    let ok = false; try { ok = !r.error && !!p.check(r); } catch (e) { ok = false; }
    if (!ok) fail("evidence", `${T}: the data doesn't show that ${p.says}` + (r.error ? ` (error: ${r.error})` : ""));
  }
}

function tells(boards, fail, stats) {
  let longest = 0, shortest = 0, cAbs = 0, wAbs = 0, wN = 0;
  const slots = [0, 0, 0, 0, 0, 0];
  for (const { d, ticket } of boards) {
    const L = d.options.map(o => o.text.length);
    const ri = d.options.findIndex(o => o.correct);
    if (L[ri] === Math.max(...L)) longest++;
    if (L[ri] === Math.min(...L)) shortest++;
    d.options.forEach(o => { if (o.correct) cAbs += ABSOLUTE.test(o.text) ? 1 : 0; else { wN++; wAbs += ABSOLUTE.test(o.text) ? 1 : 0; } });
    const order = placed(d, shuffledIds(d.options.map(o => o.id), ticket + "/" + d.id));
    slots[order.indexOf(d.options[ri].id)]++;
  }
  const n = boards.length;
  stats.boards = n; stats.longest = longest; stats.shortest = shortest; stats.slots = slots;
  stats.cAbs = Math.round(100 * cAbs / n); stats.wAbs = Math.round(100 * wAbs / Math.max(1, wN));
  if (longest / n > 0.25) fail("tells", `the right answer is the longest on ${longest} of ${n} boards`);
  if (shortest / n > 0.25) fail("tells", `the right answer is the shortest on ${shortest} of ${n} boards`);
  if (stats.wAbs - stats.cAbs > 25) fail("tells", `absolute words in ${stats.wAbs}% of wrong options and ${stats.cAbs}% of right ones`);
  if (Math.max(...slots) > Math.ceil(n / 6) + 2) fail("tells", `after shuffling, ${Math.max(...slots)} of ${n} right answers sit in one slot`);
}

async function run(mutate) {
  const m = await load();
  let tickets = m.practiceTickets();
  if (mutate) tickets = mutate(tickets, m);
  const fails = []; const fail = (rule, msg) => fails.push(rule + " — " + msg);
  const boards = [];
  if (tickets.length !== 170) fail("shape", `expected 170 practice tickets, got ${tickets.length}`);
  const ids = new Set();
  for (const tk of tickets) { if (ids.has(tk.id)) fail("shape", `duplicate id ${tk.id}`); ids.add(tk.id); checkTicket(tk, fail, boards); }
  const stats = {};
  tells(boards, fail, stats);
  return { fails, stats };
}

/* ---- plants: each must be caught --------------------------------------- */
const PLANTS = {
  sixoptions: { catches: "shape", fn: ts => { ts[0].decisions[0].options.pop(); return ts; } },
  twocorrect: { catches: "shape", fn: ts => { ts[0].decisions[0].options.forEach(o => o.correct = true); return ts; } },
  noreason: { catches: "shape", fn: ts => { const o = ts[0].decisions[0].options.find(x => !x.correct); o.why = ""; return ts; } },
  decisions: { catches: "shape", fn: ts => { ts[0].decisions.pop(); return ts; } },
  writeup: { catches: "shape", fn: ts => { ts[0].writeup = "done"; return ts; } },
  objective: { catches: "facts", fn: ts => { ts[0].summary[0][0] = "9.9"; return ts; } },
  attack: { catches: "facts", fn: ts => { ts[0].attack = "T9999"; return ts; } },
  realip: { catches: "safety", fn: ts => { ts[0].events.push({ time: ts[0].now, source: "x", ip: "8.8.8.8" }); ts[0].tabs.push({ title: "x", kind: "list", items: ["8.8.8.8"] }); return ts; } },
  realdomain: { catches: "safety", fn: ts => { ts[0].tabs.push({ title: "x", kind: "list", items: ["evil.com"] }); return ts; } },
  hintleak: { catches: "hints", fn: ts => { const d = ts[0].decisions[0]; d.hints[0] = d.options.find(o => o.correct).text; return ts; } },
  evidence: { catches: "evidence", fn: ts => { ts[0].proofs[0].check = () => false; return ts; } },
  /* the owner's rule: corrupt the GENERATED DATA so it no longer exhibits the answer.
     A vuln ticket whose known-exploited finding is quietly un-flagged must fail its proof. */
  wrongdata: { catches: "evidence", fn: ts => { const tk = ts.find(t => t.type === 4); for (const e of tk.events) if (e.known_exploited === "yes") e.known_exploited = "no"; return ts; } },
  /* a beacon ticket whose process is re-signed so the data contradicts its answer */
  flipsign: { catches: "evidence", fn: ts => { const tk = ts.find(t => t.type === 8 && t.id.endsWith("-1")); for (const e of tk.events) if (e.signer === "unsigned") e.signer = "Known Vendor (valid)"; return ts; } },
  longest: { catches: "tells", fn: ts => { for (const tk of ts) for (const d of tk.decisions) { const o = d.options.find(x => x.correct); o.text = o.text + " — confirmed by all of the evidence already gathered here today"; } return ts; } },
  oneslot: { catches: "tells", fn: ts => { for (const tk of ts) for (const d of tk.decisions) d.slot = 3; return ts; } },
};

if (process.argv.includes("--plant")) {
  let all = true;
  for (const [name, p] of Object.entries(PLANTS)) {
    /* run() regenerates fresh tickets each time, so the plant mutates its own copy.
       (A JSON deep copy here would silently drop every proof's check function and
       make the evidence plant pass trivially, so none is used.) */
    let res; try { res = await run(ts => p.fn(ts)); } catch (e) { res = { fails: ["harness — " + e.message] }; }
    const caught = res.fails.some(f => f.startsWith(p.catches + " —"));
    /* a plant must fire ITS rule and nothing spurious: evidence should fail only when evidence is planted */
    const stray = p.catches !== "evidence" && res.fails.some(f => f.startsWith("evidence —"));
    console.log(`  ${caught && !stray ? "caught " : "MISSED "} ${name.padEnd(12)} (expected "${p.catches}")${stray ? "  [stray evidence failures — harness is broken]" : ""}`);
    if (!caught || stray) { all = false; console.log("      got: " + res.fails.slice(0, 2).join(" | ")); }
  }
  console.log(all ? `\nall ${Object.keys(PLANTS).length} plants caught.` : "\nA PLANT WAS MISSED.");
  process.exit(all ? 0 : 1);
} else {
  const { fails, stats } = await run(null);
  console.log(`practice boards: ${stats.boards} · right longest on ${stats.longest}, shortest on ${stats.shortest} · slots ${stats.slots.join("/")} · absolute: right ${stats.cAbs}%, wrong ${stats.wAbs}%`);
  if (fails.length) { console.log("FAILURES:\n  " + fails.slice(0, 40).join("\n  ")); process.exit(1); }
  console.log("the practice queue: every generated ticket passes every check");
}
