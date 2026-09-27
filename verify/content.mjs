/* =====================================================================
   THE TICKETS — every rule the owner set, checked on every board

     1. SHAPE      six options, one correct, a reason on every wrong one,
                   rungs 1 and 2 written, the tier's decision count, a
                   write-up that says what could not be confirmed
     2. TELLS      the right answer is not the longest (or shortest) more
                   often than chance; absolute words ("every", "never")
                   are not a giveaway; after the seeded shuffle the right
                   answer isn't parked in one slot
     3. HINTS      no hint repeats four words of the right answer
     4. FACTS      objective numbers only from the owner's list; ATT&CK
                   IDs only ones checked against MITRE's data
     5. SAFETY     addresses only from documentation or private ranges
                   (and well-known public resolvers); every domain ends
                   in .example; nothing from the do-not-reuse list
     6. EVIDENCE   every ticket's searches, run against the real data,
                   show what the ticket says they show

   Run:        node verify/content.mjs
   Calibrate:  node verify/content.mjs --plant
   ===================================================================== */
import { readFileSync, writeFileSync, mkdtempSync, copyFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { tmpdir } from "os";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const { runSearch } = await import(pathToFileURL(join(ROOT, "assets/search.js")).href);
const { shuffledIds, placed } = await import(pathToFileURL(join(ROOT, "assets/decisions.js")).href);

const TIERS = [1, 2, 3, 4, 5].map(n => ({ n, file: `assets/content/tier${n}.js`, events: `assets/content/events-t${n}.js`, decisions: n + 1 })).filter(T => existsSync(join(ROOT, T.file)));

/* The owner's objective list (CLAUDE.md section 3). Nothing else. */
const OBJECTIVES = ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "2.1", "2.2", "2.3", "2.4", "2.5", "3.1", "3.2", "3.3", "3.4", "3.5", "4.1", "4.2"];

/* Checked against MITRE's attack-stix-data, Enterprise v19.2. */
const ATTACK = { "T1566.001": "Spearphishing Attachment", "T1204.002": "Malicious File", "T1059.001": "PowerShell", "T1059.003": "Windows Command Shell", "T1033": "System Owner/User Discovery", "T1105": "Ingress Tool Transfer", "T1621": "Multi-Factor Authentication Request Generation", "T1528": "Steal Application Access Token", "T1539": "Steal Web Session Cookie", "T1550.004": "Web Session Cookie", "T1567.002": "Exfiltration to Cloud Storage", "T1552.001": "Credentials In Files", "T1530": "Data from Cloud Storage", "T1498": "Network Denial of Service", "T1110.004": "Credential Stuffing", "T1195.002": "Compromise Software Supply Chain", "T1657": "Financial Theft", "T1496": "Resource Hijacking", "T1046": "Network Service Discovery", "T1059.007": "JavaScript", "T1583.001": "Domains", "T1136.001": "Local Account", "T1114.002": "Remote Email Collection", "T1586.002": "Email Accounts", "T1566.004": "Spearphishing Voice", "T1078.004": "Cloud Accounts", "T1486": "Data Encrypted for Impact", "T1071.004": "DNS", "T1564.008": "Email Hiding Rules", "T1078": "Valid Accounts", "T1071": "Application Layer Protocol", "T1071.001": "Web Protocols", "T1110.003": "Password Spraying", "T1190": "Exploit Public-Facing Application", "T1136": "Create Account", "T1566.002": "Spearphishing Link", "T1219.002": "Remote Desktop Software", "T1133": "External Remote Services", "T1135": "Network Share Discovery", "T1490": "Inhibit System Recovery", "T1021": "Remote Services", "T1053": "Scheduled Task/Job", "T1573": "Encrypted Channel", "T1219.003": "Remote Access Hardware" };

const PUBLIC_OK = ["8.8.8.8", "8.8.4.4", "1.1.1.1", "1.0.0.1", "9.9.9.9"];
/* Dotted version numbers that look like addresses. Named one by one, so a
   real address can never slip through as a "version". */
const VERSIONS_OK = ["6.3.0.1"];   /* LiteSpeed Cache: CVE-2024-28000 affects 6.3.0.1 and earlier */
function ipAllowed(ip) {
  const p = ip.split(".").map(Number);
  if (p.some(n => n > 255)) return true;              /* not an address, e.g. a version */
  if (ip.startsWith("192.0.2.") || ip.startsWith("198.51.100.") || ip.startsWith("203.0.113.")) return true;
  if (p[0] === 10 || (p[0] === 172 && p[1] >= 16 && p[1] <= 31) || (p[0] === 192 && p[1] === 168)) return true;
  return PUBLIC_OK.includes(ip) || VERSIONS_OK.includes(ip);
}

/* Students have done these labs. Same skills, new artefacts. */
const DO_NOT_REUSE = ["192.168.1.10", "192.168.1.20", "192.168.1.30", "192.168.1.40", "192.168.1.50", "47.31.32.101", "41.21.18.102", "sjames", "invoice.exe", "81.161.63.253", "192.168.76.5", "secure-credential-update", "company-portal.com",
  "syncsvc.exe", "UpdateAgent.exe", "haris.khan", "daniel.richards", "install.exe", "ayebd", "1.161.138.92", "botsv1", "gotham-fortigate", "71.39.18.122", "192.168.250.", "93.184.216.34", "corp.com"];

const SOC_STAFF = ["tanis", "laurana", "sturm", "flint", "riverwind", "goldmoon", "caramon", "tika", "raistlin", "tasslehoff", "elistan", "fizban"];
const ABSOLUTE = /\b(always|never|every|all|any|only|permanent|immediately|nothing)\b/i;

function allText(obj) { return JSON.stringify(obj, (k, v) => typeof v === "function" ? undefined : v); }

async function loadTier(tier, dir) {
  const base = dir || ROOT;
  const content = await import(pathToFileURL(join(base, tier.file)).href + "?" + Math.random());
  const events = await import(pathToFileURL(join(base, tier.events)).href + "?" + Math.random());
  return { content, events };
}

async function run(dir) {
  const fails = [];
  const fail = (rule, msg) => fails.push(rule + " — " + msg);
  const boards = [];

  for (const tier of TIERS) {
    const { content, events } = await loadTier(tier, dir);
    const now = Date.parse(events.NOW);
    for (const tk of content.TICKETS) {
      const T = tk.id;
      /* ---- 1. shape --------------------------------------------------- */
      if (tk.decisions.length !== tier.decisions) fail("shape", `${T} has ${tk.decisions.length} decisions; Tier ${tier.n} has ${tier.decisions}`);
      if (!/could not be confirmed/i.test(tk.writeup || "")) fail("shape", `${T}'s example write-up doesn't say what could not be confirmed`);
      if (!tk.guide?.length || !tk.summary?.length || !tk.search?.query) fail("shape", `${T} is missing its guide, summary or search`);
      for (const d of tk.decisions) {
        const id = `${T}/${d.id}`;
        if (d.options.length !== 6) fail("shape", `${id} has ${d.options.length} options, not six`);
        if (d.options.filter(o => o.correct).length !== 1) fail("shape", `${id} doesn't have exactly one correct option`);
        for (const o of d.options) if (!o.correct && !(o.why && o.why.trim())) fail("shape", `${id} option ${o.id} is wrong but has no reason, so it can't be struck with one`);
        if (!Array.isArray(d.hints) || d.hints.length < 2 || d.hints.some(h => !h.trim())) fail("shape", `${id} needs rung 1 and rung 2 hints`);
        if (!d.prompt || !d.lesson) fail("shape", `${id} needs a prompt and a lesson`);
        boards.push({ id, d, ticket: T });
        /* ---- 3. hints never name the answer ---------------------------- */
        const right = d.options.find(o => o.correct);
        if (right) {
          const w = right.text.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
          for (const h of d.hints) {
            const hl = " " + h.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ") + " ";
            for (let i = 0; i + 4 <= w.length; i++) {
              const run4 = " " + w.slice(i, i + 4).join(" ") + " ";
              if (hl.includes(run4)) { fail("hints", `${id}: a hint repeats "${run4.trim()}" from the right answer`); break; }
            }
          }
        }
      }
      /* ---- 4. facts ---------------------------------------------------- */
      for (const row of tk.summary) if (!OBJECTIVES.includes(row[0])) fail("facts", `${T} names objective ${row[0]}, which isn't on the owner's list`);
      const text = allText(tk);
      for (const m of text.matchAll(/\bT\d{4}(?:\.\d{3})?\b/g)) if (!ATTACK[m[0]]) fail("facts", `${T} uses ATT&CK ${m[0]}, which hasn't been checked against MITRE's data`);
      /* where an ID is shown with a name, the name must be MITRE's own (a real
         ID beside the wrong name teaches the wrong thing just as surely) */
      const plain = text.replace(/\\u2014/g, "—");
      for (const m of plain.matchAll(/\b(T\d{4}(?:\.\d{3})?)\s+([A-Z][A-Za-z/\-]*(?:\s+[A-Z][A-Za-z/\-]*)*)/g)) {
        const real = ATTACK[m[1]]; if (!real) continue;
        const shown = m[2].trim().toLowerCase(), r = real.toLowerCase();
        if (!(r.startsWith(shown) || shown.startsWith(r))) fail("facts", `${T} shows ${m[1]} as "${m[2].trim()}", but MITRE names it "${real}"`);
      }
      /* ---- 6. evidence --------------------------------------------------- */
      const guided = runSearch(tk.search.query, events.EVENTS, now);
      if (guided.error || !guided.count) fail("evidence", `${T}'s guided search ${guided.error ? "errors: " + guided.error : "returns nothing"}`);
      for (const p of tk.proofs || []) {
        const r = runSearch(p.query, events.EVENTS, now);
        let ok = false; try { ok = !r.error && !!p.check(r); } catch (e) { ok = false; }
        if (!ok) fail("evidence", `${T}: the data doesn't show that ${p.says}` + (r.error ? ` (search error: ${r.error})` : ""));
      }
      if (!(tk.proofs || []).length) fail("evidence", `${T} has no proof that its evidence shows what it claims`);
    }
    /* ---- 5. safety, over the content AND the data ------------------------ */
    const everything = allText(content.TICKETS) + allText(events.EVENTS);
    for (const m of everything.matchAll(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g)) if (!ipAllowed(m[0])) fail("safety", `address ${m[0]} isn't from a documentation or private range`);
    for (const m of everything.matchAll(/\b(?:[a-z0-9-]+\.)+([a-z]{2,})\b/gi)) {
      const host = m[0].toLowerCase();
      if (/^\d/.test(host) || /\.(exe|docm|xlsm|js|sys|dmp|tf|php|ps1|dll|bat|zip|pdf|docx|csv|log|json)$/.test(host)) continue;
      if (/^(e\.g|i\.e)$/.test(host)) continue;
      if (["smtp.mailfrom", "header.from", "header.d"].includes(host)) continue;   /* email header field names, not domains */
      if (!host.endsWith(".example") && !/^(id|conn|zeek)\.[a-z_]+$/.test(host) && !/^zeek\.(conn|ssl)$/.test(host)) fail("safety", `"${m[0]}" looks like a domain that doesn't end in .example`);
    }
    for (const s of DO_NOT_REUSE) if (everything.toLowerCase().includes(s.toLowerCase())) fail("safety", `"${s}" is on the do-not-reuse list`);
    for (const m of everything.matchAll(/\b([a-z]+)@[a-z.-]+\.example\b/gi)) if (SOC_STAFF.includes(m[1].toLowerCase())) fail("safety", `${m[0]} uses a SOC staff name for a client's user`);
  }

  /* ---- 2. tells, across every board ------------------------------------ */
  let longest = 0, shortest = 0, cAbs = 0, wAbs = 0, wN = 0;
  const slots = [0, 0, 0, 0, 0, 0];
  for (const { id, d, ticket } of boards) {
    const L = d.options.map(o => o.text.length);
    const right = d.options.findIndex(o => o.correct);
    if (L[right] === Math.max(...L)) longest++;
    if (L[right] === Math.min(...L)) shortest++;
    d.options.forEach(o => { if (o.correct) cAbs += ABSOLUTE.test(o.text) ? 1 : 0; else { wN++; wAbs += ABSOLUTE.test(o.text) ? 1 : 0; } });
    const order = placed(d, shuffledIds(d.options.map(o => o.id), ticket + "/" + d.id));
    slots[order.indexOf(d.options[right].id)]++;
  }
  const n = boards.length;
  if (longest / n > 0.25) fail("tells", `the right answer is the longest option on ${longest} of ${n} boards; chance is about 1 in 6`);
  if (shortest / n > 0.25) fail("tells", `the right answer is the shortest option on ${shortest} of ${n} boards`);
  const cRate = cAbs / n, wRate = wAbs / Math.max(1, wN);
  if (wRate - cRate > 0.25) fail("tells", `absolute words appear in ${Math.round(wRate * 100)}% of wrong options and ${Math.round(cRate * 100)}% of right ones`);
  if (Math.max(...slots) > Math.ceil(n / 6) + 1 || Math.min(...slots) === 0 && n >= 12) fail("tells", `after shuffling, ${Math.max(...slots)} of ${n} right answers sit in slot ${slots.indexOf(Math.max(...slots)) + 1}`);

  return { fails, stats: { boards: n, longest, shortest, slots, cAbs: Math.round(cRate * 100), wAbs: Math.round(wRate * 100) } };
}

/* ---- plants: each must be caught --------------------------------------- */
const T1 = "assets/content/tier1.js", EV = "assets/content/events-t1.js";
const PLANTS = {
  sixoptions: { file: T1, catches: "shape", fn: s => s.replace(/,\n        \{ id: "f", text: "Add this volunteer[^\n]*?\} \],/, " ],") },
  noreason: { file: T1, catches: "shape", fn: s => s.replace('why: "Whaling targets executives. This went to five teachers."', 'why: ""') },
  longest: { files: TIERS.map(T => T.file), catches: "tells", fn: s => s.replace(/(correct: true, text: "[^"]*)"/g, '$1, confirmed with the evidence already in front of us"') },
  hintleak: { file: T1, catches: "hints", fn: s => s.replace('"A check only vouches for the domain it checked."', '"SPF and DKIM passed for the relay, which is the whole story."') },
  objective: { file: T1, catches: "facts", fn: s => s.replace('["2.1", "Spotted devices', '["2.9", "Spotted devices') },
  attack: { file: T1, catches: "facts", fn: s => s.replace('attack: "T1110.003"', 'attack: "T1110.009"') },
  attackname: { file: "assets/content/tier3.js", catches: "facts", fn: s => s.replace("T1219.002 Remote Desktop Software", "T1219.002 Remote Access Software") },
  realip: { file: EV, catches: "safety", fn: s => s.replace('"198.51.100.144"', '"93.184.216.35"') },
  realdomain: { file: T1, catches: "safety", fn: s => s.replace("updates.tillpoint.example and is", "updates.tillpoint.com and is") },
  reuse: { file: T1, catches: "safety", fn: s => s.replace('entity: "11 accounts"', 'entity: "sjames and 10 more"') },
  staffname: { file: EV, catches: "safety", fn: s => s.replace('["bupu@steadfastoutpost.example"', '["tika@steadfastoutpost.example"') },
  evidence: { file: EV, catches: "evidence", fn: s => s.replace('method: "GET", url: "https://payneschool-login.example/reset"', 'method: "POST", url: "https://payneschool-login.example/reset"') },
  oneslot: { file: T1, catches: "tells", fn: s => s.replace(/slot: \d,/g, "slot: 3,") },
  crossclient: { file: EV, catches: "evidence", fn: s => s.replace('E.push({ time: t(4 + i, 3, 20 + i, 2), source: "signin", client: "Thomas P. Payne School"', 'false && E.push({ time: t(4 + i, 3, 20 + i, 2), source: "signin", client: "Thomas P. Payne School"') },
};

async function planted(p) {
  const dir = mkdtempSync(join(tmpdir(), "voo-content-"));
  mkdirSync(join(dir, "assets/content"), { recursive: true });
  /* copy every tier the real build has, so a plant in tier 1 is measured against the whole set */
  const files = new Set([T1, EV]);
  for (const T of TIERS) { files.add(T.file); files.add(T.events); }
  for (const f of files) if (existsSync(join(ROOT, f))) copyFileSync(join(ROOT, f), join(dir, f));
  const targets = p.files || [p.file];
  let anyApplied = false;
  for (const tf of targets) {
    const src = readFileSync(join(dir, tf), "utf8"); const out = p.fn(src);
    if (out !== src) { writeFileSync(join(dir, tf), out); anyApplied = true; }
  }
  if (!anyApplied) throw new Error("plant did not apply — it is testing nothing");
  return run(dir);
}

if (process.argv.includes("--plant")) {
  let all = true;
  for (const [name, p] of Object.entries(PLANTS)) {
    let res; try { res = await planted(p); } catch (e) { res = { fails: ["harness — " + e.message] }; }
    const caught = res.fails.some(f => f.startsWith(p.catches + " —"));
    console.log(`  ${caught ? "caught " : "MISSED "} ${name.padEnd(12)} (expected a "${p.catches}" failure)`);
    if (!caught) { all = false; console.log("      got: " + res.fails.slice(0, 2).join(" | ")); }
  }
  console.log(all ? `\nall ${Object.keys(PLANTS).length} plants caught.` : "\nA PLANT WAS MISSED.");
  process.exit(all ? 0 : 1);
} else {
  const { fails, stats } = await run(null);
  console.log(`boards: ${stats.boards} · right answer longest on ${stats.longest}, shortest on ${stats.shortest} · slots ${stats.slots.join("/")} · absolute words: right ${stats.cAbs}%, wrong ${stats.wAbs}%`);
  if (fails.length) { console.log("FAILURES:\n  " + fails.join("\n  ")); process.exit(1); }
  console.log("the tickets: every check passes");
}
