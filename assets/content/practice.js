/* =====================================================================
   THE PRACTICE QUEUE — ten seeded tickets per scenario type.

   Once a scenario type has been met in the story, ten more of that type
   open here: the same skill, new data, new answers (CLAUDE.md 13g).
   17 types x 10 = 170 tickets. Each is generated from its seed, so no two
   students see the same order, and each is built from the same rules as
   the story: six options, one correct, the hint ladder, the objective
   summary, and a write-up that says what could not be confirmed.

   The correct answer is computed from the generated facts. Each ticket
   carries its own events and proofs; verify/practice.mjs drives every
   generated ticket and confirms its evidence shows its answer, then runs
   the same tell and safety checks as the story.

   Evidence stays at the analyst level. Addresses come only from the
   documentation ranges (192.0.2/24, 198.51.100/24, 203.0.113/24) and
   private space; every domain ends in .example. ATT&CK IDs are checked
   against MITRE Enterprise v19.2.
   ===================================================================== */

/* ---- deterministic rng, per ticket ------------------------------------ */
function rngOf(seed) {
  let h = 2166136261 >>> 0;
  for (const c of String(seed)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => { h += 0x6D2B79F5; let x = Math.imul(h ^ (h >>> 15), 1 | h); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}
const pick = (r, a) => a[Math.floor(r() * a.length)];
const docIp = (r, block) => `${block}.${1 + Math.floor(r() * 253)}`;

/* client pools by tier the type first appears in (story clients reused; new hosts/values each time) */
const CLIENTS = ["Vanguard Auto Detailing", "OEF Fuel Roasters", "Ironclad Auto Care", "No Go Smile", "Thomas P. Payne School", "Nexxuss"];
const dom = { "Vanguard Auto Detailing": "vanguarddetail.example", "OEF Fuel Roasters": "oeffuel.example", "Ironclad Auto Care": "ironcladauto.example", "No Go Smile": "nogosmile.example", "Thomas P. Payne School": "payneschool.example", "Nexxuss": "nexxuss.example" };
const person = ["arl", "brek", "caol", "dara", "esk", "fen", "gorm", "hale", "iri", "jax", "kesh", "lorn", "mira", "nyx", "orin", "pell", "quin", "rell", "sten", "tovi"];

/* build a decision: options is [{text, why}], correct is the index that matches the facts */
function board(id, slot, prompt, options, correct, hints, lesson, mech) {
  const opts = options.map((o, i) => ({ id: "abcdef"[i], text: o.text, ...(i === correct ? { correct: true } : { why: o.why }) }));
  const d = { id, slot, prompt, options: opts, hints, lesson };
  if (mech) d.mechanism = mech;
  return d;
}

/* assemble a full ticket */
function ticket(spec) {
  return { id: spec.id, type: spec.type, tier: spec.tier, practice: true, map: 0,
    time: spec.time, sev: spec.sev, alert: spec.alert, source: spec.source, client: spec.client,
    entity: spec.entity, attack: spec.attack || "", sla: spec.sla || "Due this shift",
    facts: spec.facts, tabs: spec.tabs, search: spec.search, guide: spec.guide, fizban: spec.fizban,
    decisions: spec.decisions, writeup: spec.writeup, summary: spec.summary, proofs: spec.proofs,
    events: spec.events, now: spec.now };
}

/* =====================================================================
   TYPE 1 — identity triage: spray vs stuffing vs impossible travel
   Tier 1 (2 decisions). Flavour chosen by seed decides the answer.
   ===================================================================== */
function type1(n) {
  const r = rngOf("t1-" + n);
  const client = pick(r, CLIENTS), d = dom[client];
  const flavour = ["spray", "stuffing", "travel"][n % 3];
  const now = `2026-10-${String(6 + (n % 20)).padStart(2, "0")}T09:00:00Z`;
  const ev = [];
  const ipb = pick(r, ["198.51.100", "203.0.113", "192.0.2"]);
  const users = person.slice(n % 8, (n % 8) + 6).map(u => `${u}@${d}`);
  if (flavour === "spray") {
    users.forEach((u, i) => ev.push({ time: now.replace("09:00", "06:0" + i), source: "signin", client, user: u, src_ip: docIp(r, ipb), result: "failure", reason: "bad password", attempts_for_account: 1, mfa: "not reached" }));
  } else if (flavour === "stuffing") {
    for (let k = 0; k < 30; k++) ev.push({ time: now.replace("09:00", "05:" + String(k % 60).padStart(2, "0")), source: "signin", client, user: `cust${100 + k}@mail.example`, src_ip: docIp(r, ipb), result: k % 6 === 0 ? "success" : "failure", reason: k % 6 === 0 ? "" : "bad password", attempts_for_account: 1, mfa: "not offered" });
  } else {
    const u = users[0];
    ev.push({ time: now.replace("09:00", "08:10"), source: "signin", client, user: u, src_ip: docIp(r, "10"), geo: "Office", result: "success", type: "interactive" });
    ev.push({ time: now.replace("09:00", "08:22"), source: "signin", client, user: u, src_ip: docIp(r, ipb), geo: "Far overseas", result: "success", type: "token refresh", note: "12 minutes after the office login — impossible travel" });
  }
  const opts = [
    { text: "Password spraying — one attempt each across many accounts, staying under lockout", why: "The failures here aren't one-try-each across many accounts, so spraying doesn't fit this data." },
    { text: "Credential stuffing — one try per account, some succeeding on reused leaked passwords", why: "There's no run of per-account logins with some succeeding, so stuffing doesn't fit this data." },
    { text: "Impossible travel — one account signing in from two far-apart places too close in time", why: "There's no single account logging in from two distant places minutes apart in this data." },
    { text: "A false positive — ordinary staff logging in on a normal morning from expected places", why: "The pattern here isn't ordinary: the sign-in evidence shows a clear attack signature." },
    { text: "Brute force — many password guesses aimed at one single account until one works", why: "No single account is hammered with many guesses here; the attempts are spread differently." },
    { text: "Phishing capture — users entered passwords on a fake page, seen as proxy POSTs", why: "There are no proxy POSTs to a fake login page in this evidence; it's an authentication pattern." },
  ];
  const correct = { spray: 0, stuffing: 1, travel: 2 }[flavour];
  const proofQ = { spray: `source=signin client="${client}" result=failure | stats dc(user)`, stuffing: `source=signin client="${client}" result=success | stats count`, travel: `source=signin client="${client}" | stats dc(geo)` }[flavour];
  const proofChk = { spray: (rr) => rr.count === 1 && rr.rows[0]["dc(user)"] >= 5, stuffing: (rr) => rr.count === 1 && rr.rows[0].count >= 3, travel: (rr) => rr.count === 1 && rr.rows[0]["dc(geo)"] >= 2 }[flavour];
  const d2opts = [
    { text: "Escalate with evidence and recommend resets or MFA for the affected accounts", why: "" },
    { text: "Close it as benign, since login noise is normal and needs no follow-up at all", why: "This isn't benign noise; the evidence shows a real attack pattern to act on." },
    { text: "Block one source address and take no further action on the accounts involved", why: "Addresses rotate; the accounts still need attention. One block isn't containment." },
    { text: "Reset every account at the client immediately, whether or not it was involved", why: "Blanket resets across the whole client are disproportionate to the accounts actually hit." },
    { text: "Wait a day to see whether the pattern repeats before telling anyone about it", why: "Waiting lets a live attack continue. Escalate now with what the evidence shows." },
    { text: "Ask the users to choose stronger passwords and consider the matter closed", why: "Advice alone doesn't contain an active attack or add the factor that stops it." },
  ];
  return ticket({ id: `PRAC-1-${n}`, type: 1, tier: 1, time: "07:00:00", sev: "high",
    alert: `Suspicious sign-in pattern at ${client}`, source: "Identity", client, entity: `${users.length} accounts`, attack: flavour === "spray" ? "T1110.003" : flavour === "stuffing" ? "T1110.004" : "T1078",
    facts: [["Client", client], ["Source", "unfamiliar addresses"], ["Read", "the sign-in log"]],
    tabs: [{ title: "Sign-ins", kind: "list", items: ev.slice(0, 8).map(e => `${e.time.slice(11, 16)} ${e.user || ""} ${e.result}${e.geo ? " (" + e.geo + ")" : ""}${e.note ? " — " + e.note : ""}`) }],
    search: { query: `source=signin client="${client}" | table time user result geo reason`, say: "The sign-ins, in order." },
    guide: ["Read the sign-in log: how many tries per account, and any successes?", "Decide the pattern, then what to do about it."],
    fizban: "Login failures at a client — probably users forgetting passwords. Recommend closing as noise.",
    decisions: [board("d1", (n % 6) + 1, "What is the most defensible reading of the sign-ins?", opts, correct, ["Count tries per account, then look for successes and locations.", "Each attack pattern has one signature: spread, reuse, or distance."], "Spraying spreads one password wide; stuffing replays leaked passwords one-per-account; impossible travel is one account in two places at once. The log tells them apart."),
      board("d2", ((n + 3) % 6) + 1, "What do you do about it?", d2opts, 0, ["Who decides on resets, and what stops this pattern?", "Escalate with evidence; add the factor the attacker doesn't have."], "The analyst escalates with evidence and recommends the control (reset, MFA) that fits the pattern. Blanket action and waiting both fail.")],
    writeup: `Sign-in pattern at ${client}: identified as ${flavour === "spray" ? "password spraying" : flavour === "stuffing" ? "credential stuffing" : "impossible travel"} from the log. Escalated with the evidence and recommended the fitting control. Could not be confirmed: whether any session was established beyond what the log shows.`,
    summary: [["1.2", "Read a sign-in pattern", "Indicators across identity", "Spraying · stuffing · impossible travel"], ["3.3", "Triaged and escalated", "Triage and escalation", "Evidence · escalation"]],
    proofs: [{ query: proofQ, says: "the log shows the attack pattern", check: proofChk }],
    events: ev, now });
}

/* =====================================================================
   TYPE 2 — reported phishing: SPF/DKIM/DMARC and clicked vs submitted
   Tier 1 (2 decisions).
   ===================================================================== */
function type2(n) {
  const r = rngOf("t2-" + n); const client = pick(r, CLIENTS), d = dom[client];
  const aligned = n % 2 === 0; /* true = internal look-alike passes but misaligned; false = external spoof fails DMARC */
  const now = `2026-10-${String(6 + (n % 20)).padStart(2, "0")}T09:00:00Z`;
  const relay = `msgrelay-${1 + (n % 9)}.example`;
  const ev = [];
  const recip = person.slice(n % 6, (n % 6) + 5).map(u => `${u}@${d}`);
  recip.forEach((u, i) => ev.push({ time: now.replace("09:00", "07:5" + i), source: "mail", client, from: `it-support@${d}`, return_path: `bounce@${relay}`, to: u, subject: "Your password expires today", spf: aligned ? `pass (${relay})` : `fail (${d})`, dkim: aligned ? `pass (${relay})` : "none", dmarc: `fail (${d}, policy none)`, folder: i === 0 ? "reported" : "inbox", src_ip: docIp(r, "198.51.100") }));
  ev.push({ time: now.replace("09:00", "08:14"), source: "proxy", client, user: recip[1].split("@")[0], method: "GET", url: `https://${d.replace(".example", "")}-login.example/reset`, status: 200, bytes_in: 14000 });
  ev.push({ time: now.replace("09:00", "08:41"), source: "proxy", client, user: recip[2].split("@")[0], method: "POST", url: `https://${d.replace(".example", "")}-login.example/reset`, status: 200, bytes_out: 1400 });
  const opts = [
    { text: "Phishing — the visible sender's domain doesn't align with what SPF/DKIM checked", why: "" },
    { text: "Genuine mail — it passed authentication, so the sender is verified and it's safe", why: "Passing isn't aligning: the checks passed for the relay, not the visible From domain." },
    { text: "Spam — unsolicited bulk mail with no real target, which can simply be deleted", why: "It targets named staff with a credential-reset lure and a look-alike link: phishing, not spam." },
    { text: "A false positive — the mail filter over-flagged an ordinary internal IT notice", why: "The From domain is misaligned and a look-alike link was clicked: the flag is accurate." },
    { text: "An internal mistake — the real IT team sent a clumsy but legitimate reset email", why: "Real IT mail would align SPF/DKIM with the domain; this doesn't, and the link is a look-alike." },
    { text: "A test — a sanctioned phishing simulation the security team is running this week", why: "Nothing marks this as a sanctioned test, and a real credential was submitted to a look-alike." },
  ];
  const d2 = [
    { text: "The submitter (POST): reset their password and sign them out of every live session", why: "" },
    { text: "Everyone who received it, whether or not they interacted with the email at all", why: "Resetting untouched recipients is over-broad; the submitter is who's actually exposed." },
    { text: "The clicker (GET) only, since opening the page is the same as handing over a password", why: "A GET is a visit; a POST is a submission. The clicker didn't necessarily submit anything." },
    { text: "Nobody — the mail was reported, so it was caught and no account is at risk here", why: "One recipient submitted credentials (POST). Reporting doesn't undo that submission." },
    { text: "The reporter, since they clearly interacted with it enough to notice and report it", why: "Reporting is the safe action; the exposed account is the one that submitted, not the reporter." },
    { text: "The whole client's staff, forced to reset at once as a precaution against the lure", why: "Only the submitter is exposed. A client-wide forced reset is disproportionate." },
  ];
  return ticket({ id: `PRAC-2-${n}`, type: 2, tier: 1, time: "08:50:00", sev: "high",
    alert: `Reported phishing at ${client}`, source: "Mail", client, entity: `${recip.length} recipients`, attack: "T1566.002",
    facts: [["Reported by", recip[0]], ["Lure", "password reset"], ["Read", "the headers and the proxy log"]],
    tabs: [{ title: "The email", kind: "kv", pairs: [["From", `it-support@${d}`], ["SPF", ev[0].spf], ["DKIM", ev[0].dkim], ["DMARC", ev[0].dmarc], ["Link", `${d.replace(".example", "")}-login.example`]] },
      { title: "Proxy", kind: "list", items: ["A GET to the look-alike page (clicked)", "A POST to the look-alike page (submitted a credential)"] }],
    search: { query: `source=proxy client="${client}" method=POST | table time user url`, say: "Who submitted, not just clicked." },
    guide: ["Read the headers: does the From domain align with SPF and DKIM?", "Separate who clicked (GET) from who submitted (POST), then act."],
    fizban: "The email passed SPF and DKIM, so it's authentic. Recommend closing it as a false alarm.",
    decisions: [board("d1", (n % 6) + 1, "What is this email?", opts, 0, ["Compare the visible From domain with the domains SPF and DKIM actually checked.", "Passing authentication proves origin, not that the From domain aligns."], "SPF/DKIM/DMARC prove where mail came from, not that it's legitimate. A pass on the relay with a misaligned From, plus a look-alike link, is phishing."),
      board("d2", ((n + 2) % 6) + 1, "Whose account is exposed?", d2, 0, ["Which log line is a POST, not a GET?", "A submission (POST) exposes a credential; a click (GET) may not."], "A GET is a visit; a POST is a submission. Reset and sign out the submitter; a click alone isn't the same exposure.")],
    writeup: `Reported phishing at ${client}: From domain misaligned with SPF/DKIM (DMARC fail), a look-alike reset link clicked (GET) and submitted (POST) by one recipient. Reset and signed out the submitter; removed the mail from the other inboxes. Could not be confirmed: whether the submitted credential was used before the reset.`,
    summary: [["1.2", "Read mail authentication and alignment", "Indicators across email", "SPF/DKIM/DMARC · alignment"], ["3.3", "Told clicked from submitted", "Triage and evidence", "Proxy GET vs POST"]],
    proofs: [{ query: `source=proxy client="${client}" method=POST | stats count`, says: "one recipient submitted to the look-alike page", check: (rr) => rr.count === 1 && rr.rows[0].count >= 1 },
      { query: `source=mail client="${client}" | stats count`, says: "the phishing mail reached several recipients", check: (rr) => rr.count === 1 && rr.rows[0].count >= 3 }],
    events: ev, now });
}

/* =====================================================================
   TYPE 3 — noise and closing well (benign true positive / FP / duplicate)
   Tier 1 (2 decisions).
   ===================================================================== */
function type3(n) {
  const r = rngOf("t3-" + n); const client = pick(r, CLIENTS), d = dom[client];
  const kind = ["benign", "duplicate", "falsepos"][n % 3];
  const now = `2026-10-${String(6 + (n % 20)).padStart(2, "0")}T09:00:00Z`;
  const host = `${client.split(" ")[0].toUpperCase().slice(0, 4)}-PC-${10 + n}`;
  const ev = [];
  if (kind === "benign") ev.push({ time: now.replace("09:00", "06:00"), source: "software", client, host, name: "PayLine terminal driver", signer: "PayLine (valid)", note: "signed vendor software checking in" }, { time: now.replace("09:00", "07:00"), source: "zeek.conn", client, host, "id.resp_h": docIp(r, "198.51.100"), service: "ssl", orig_bytes: 1200, resp_bytes: 3400, conn_state: "SF", note: "hourly check-in, steady sizes" });
  else if (kind === "duplicate") ev.push({ time: now.replace("09:00", "06:00"), source: "case", client, ref: `VOO-DUP-${n}a`, status: "open", alert: "Same alert already raised 20 minutes ago" }, { time: now.replace("09:00", "06:20"), source: "case", client, ref: `VOO-DUP-${n}b`, status: "open", alert: "Duplicate of the earlier alert" });
  else ev.push({ time: now.replace("09:00", "06:00"), source: "scan", client, host, finding: "Self-signed certificate on an internal test box", severity: "low", detected_by: "credentialed", note: "known test system, not internet-facing" });
  const opts = [
    { text: "Benign true positive: a signed vendor agent doing exactly what it should do", why: "The evidence here isn't a signed vendor agent checking in; that reading doesn't fit." },
    { text: "A duplicate — the same alert already raised, so link it and close this copy", why: "There's no earlier identical alert to link this to; it isn't a duplicate here." },
    { text: "A false positive — the rule fired on something that isn't actually a problem", why: "The rule didn't misfire here; the evidence points to a different, real disposition." },
    { text: "Command-and-control — a malicious implant beaconing out to an attacker's server", why: "Nothing malicious is present: the signals are ordinary and explained by the evidence." },
    { text: "A confirmed breach — assume the worst and open a major incident right away", why: "Over-classification: nothing in the evidence supports a breach. Close it on what's shown." },
    { text: "Unknown — there isn't enough to say, so leave it open and move on for now", why: "There is enough to disposition it here; leaving it open needlessly isn't closing well." },
  ];
  const correct = { benign: 0, duplicate: 1, falsepos: 2 }[kind];
  const d2 = [
    { text: "Close it with a clear note and any not-proven line, so the next analyst sees why", why: "" },
    { text: "Close it silently with no notes, since a benign alert needs no explanation at all", why: "A close without notes leaves the next analyst to redo the work. Record the reason." },
    { text: "Escalate it to incident response so a senior analyst can double-check the closure", why: "Escalating noise wastes IR's time; a clear, noted close is the right disposition." },
    { text: "Leave it open in case it turns into something, and revisit it at the end of shift", why: "Leaving a dispositioned alert open clutters the queue. Close it with a note." },
    { text: "Suppress the rule permanently so this kind of alert never appears again anywhere", why: "Blanket suppression hides real cases later. Close this one; tune narrowly if needed." },
    { text: "Reassign it to another analyst without a note and let them decide what it is", why: "Passing an un-noted alert along just moves the work. Disposition it yourself." },
  ];
  return ticket({ id: `PRAC-3-${n}`, type: 3, tier: 1, time: "06:30:00", sev: "low",
    alert: `Low-severity alert at ${client}`, source: "SIEM", client, entity: host, attack: "",
    facts: [["Client", client], ["Likely", "noise"], ["Skill", "closing well"]],
    tabs: [{ title: "The signal", kind: "list", items: ev.map(e => `${e.time.slice(11, 16)} ${e.note || e.alert || e.finding || ""}`) }],
    search: { query: `client="${client}"`, say: "The evidence behind the alert." },
    guide: ["Read the evidence. What is the honest disposition?", "Close it well so the next analyst doesn't repeat the work."],
    fizban: "A low-severity alert — safe to ignore. Recommend closing without notes.",
    decisions: [board("d1", (n % 6) + 1, "What is the most defensible disposition?", opts, correct, ["Read what the signal actually is, not the alert label.", "Most alerts are noise; name which kind of noise this is."], "Closing noise well is half the job: benign true positive, duplicate and false positive are different dispositions, each written down."),
      board("d2", ((n + 4) % 6) + 1, "How do you close it?", d2, 0, ["What does the next analyst need to see?", "Record the disposition and the open question."], "A good close records the disposition and any open question, so nobody repeats the investigation and nothing real is buried by a silent close.")],
    writeup: `Low-severity alert at ${client}, dispositioned as ${kind === "benign" ? "a benign true positive" : kind === "duplicate" ? "a duplicate" : "a false positive"} from the evidence and closed with a note. Could not be confirmed: nothing further was in scope for this alert.`,
    summary: [["1.5", "Closed noise well", "Efficiency in operations", "Benign true positive · duplicate · false positive"], ["4.2", "Documented the close", "Reporting for the next analyst", "Case notes"]],
    proofs: [{ query: `client="${client}"`, says: "there is evidence to disposition the alert", check: (rr) => rr.count >= 1 }],
    events: ev, now });
}

/* =====================================================================
   TYPE 4 — vulnerability prioritisation (KEV vs high CVSS vs unconfirmed)
   Tier 2 (3 decisions).
   ===================================================================== */
function type4(n) {
  const r = rngOf("t4-" + n); const client = pick(r, CLIENTS), d = dom[client];
  const now = `2026-11-${String(2 + (n % 20)).padStart(2, "0")}T08:00:00Z`;
  const ev = [];
  const kevHost = `web.${d}`, highHost = `bench-${n}`, uncHost = `srv-${n}`;
  ev.push({ time: now.replace("08:00", "06:00"), source: "scan", client, host: kevHost, ip: docIp(r, "203.0.113"), cvss: 5.3, finding: "Access-control flaw in a public web app", cve: "CVE-2023-23752", known_exploited: "yes", cisa_exploitation: "active", detected_by: "external active check", severity: "medium" });
  ev.push({ time: now.replace("08:00", "06:00"), source: "scan", client, host: highHost, ip: docIp(r, "10"), cvss: 9.8, finding: "Library flaw on an isolated bench PC", cve: "CVE-2022-42889", known_exploited: "no", cisa_exploitation: "none", detected_by: "credentialed", severity: "critical" });
  ev.push({ time: now.replace("08:00", "06:00"), source: "scan", client, host: uncHost, ip: docIp(r, "10"), cvss: 8.1, finding: "Service banner suggests an old version", cve: "CVE-2024-6387", known_exploited: "no", cisa_exploitation: "poc", detected_by: "banner only (login failed)", severity: "high" });
  const opts = [
    { text: "The public web app's flaw — facing the internet and on the known-exploited list", why: "" },
    { text: "The CVSS 9.8 bench-PC flaw, because it is the highest raw score in the whole scan", why: "CVSS scores the flaw, not exposure. The bench PC is isolated and has no recorded exploitation." },
    { text: "The CVSS 8.1 banner finding, because a high score on a server always comes first", why: "The scan only read a banner (login failed), so it's unconfirmed, not a confirmed high." },
    { text: "Whichever finding has the most instances across the client's hosts this week", why: "Counting instances isn't measuring risk. The reachable, exploited flaw comes first." },
    { text: "All the criticals first in CVSS order, since the scanner already ranked them", why: "The scanner ranks by score alone; the reachable, known-exploited flaw outranks them." },
    { text: "The lowest-effort fix first, to clear the largest number of findings quickly", why: "Prioritise by risk, not by how easy each is. The exploited public flaw is first." },
  ];
  const d2 = [
    { text: "Unconfirmed: the login failed, so it's a banner guess; fix it and rescan", why: "" },
    { text: "A confirmed high — patch it in this week's window because the CVSS is 8.1", why: "The finding is a banner guess, not confirmed. Spending the window on it is premature." },
    { text: "A false positive — close it, since the vendor backports fixes into that version", why: "That might be true, but nothing checked it. It's unconfirmed, not a proven false positive." },
    { text: "Accept the risk for 90 days, since the host is only reachable internally anyway", why: "An analyst can't accept risk; and it's unconfirmed. Rescan credentialed first." },
    { text: "Escalate to incident response, since a failed scan login means a break-in", why: "A failed scan login usually means a changed password, not an intrusion. Fix the scan." },
    { text: "Non-issue — internal SSH findings are always informational and can wait", why: "Nothing makes an internal host harmless; it's unconfirmed, not unimportant." },
  ];
  const d3 = [
    { text: "Date every finding by the official CVSS bands and the known-exploited rule", why: "" },
    { text: "Give only the criticals a due date; the rest can wait for the next quarter", why: "Every finding needs a date by policy; highs and mediums have windows too." },
    { text: "Set all due dates to seven days, to be safe across the whole set of findings", why: "The bands differ (7/14/30); the known-exploited one is 7 whatever its score." },
    { text: "Let the client pick the dates, since it's their systems and their risk to run", why: "The SOC recommends dates by policy; the client signs exceptions, not the schedule." },
    { text: "Skip due dates and just list the findings by score for the client to read", why: "A list without dates isn't an action plan; the bands set the dates." },
    { text: "Use the vendor's severity words instead of the bands to set each due date", why: "The official CVSS bands and the KEV rule set the windows, not vendor wording." },
  ];
  return ticket({ id: `PRAC-4-${n}`, type: 4, tier: 2, time: "07:00:00", sev: "high",
    alert: `Scan findings to prioritise at ${client}`, source: "Scanner", client, entity: "3 findings", attack: "",
    facts: [["KEV", "one medium is known-exploited"], ["Decoy", "a 9.8 on an isolated host"], ["Unconfirmed", "a banner-only high"]],
    tabs: [{ title: "Findings", kind: "table", columns: ["Host", "CVSS", "CVE", "Known-exploited", "Detected"], rows: [[kevHost, "5.3", "CVE-2023-23752", "yes (active)", "external active check"], [highHost, "9.8", "CVE-2022-42889", "no", "credentialed"], [uncHost, "8.1", "CVE-2024-6387", "no", "banner only (login failed)"]] }],
    search: { query: `source=scan client="${client}" | table cvss host cve known_exploited detected_by`, say: "The findings and how each was detected." },
    guide: ["Read exposure and exploitation next to each score.", "Disposition the banner-only finding.", "Give every finding a due date by policy."],
    fizban: "The 9.8 is the highest score, so fix it first. The banner finding is likely a false positive from backporting.",
    decisions: [board("d1", (n % 6) + 1, "Which finding goes first?", opts, 0, ["Read exposure and the known-exploited column, not just the score.", "Priority weighs the flaw, whether it's being used, and what it sits in front of."], "CVSS measures the flaw; exploitation and exposure decide priority. A reachable, known-exploited medium outranks an isolated 9.8."),
      board("d2", ((n + 2) % 6) + 1, "What is the disposition of the banner-only finding?", d2, 0, ["Read how it was detected.", "A scanner that can't log in only reads what a service announces."], "A failed credentialed login turns a scan into a banner guess. Fix the scan account and rescan before deciding."),
      board("d3", ((n + 4) % 6) + 1, "How do you report the due dates?", d3, 0, ["What turns a finding list into an action plan?", "Standard severity windows, plus the exploited-list rule, set each date."], "VM reporting is an action plan: every finding gets a due date from the official CVSS bands, with known-exploited at 7 days whatever the score.")],
    writeup: `Scan of ${client}: fixed first the public web app's known-exploited flaw (CVE-2023-23752, KEV, 7 days) over an isolated 9.8; the banner-only 8.1 is unconfirmed pending a credentialed rescan. Every finding given a due date by the official bands. Could not be confirmed: the unconfirmed finding until the rescan.`,
    summary: [["2.3", "Prioritised by exploitation and exposure", "Risk-based prioritisation", "CVSS · KEV · exposure"], ["2.2", "Read how each was detected", "Analysing scan output", "Banner vs credentialed"], ["4.1", "Gave due dates by policy", "VM reporting", "Action plan · due dates"]],
    proofs: [{ query: `source=scan client="${client}" known_exploited=yes | stats count`, says: "one finding is known-exploited", check: (rr) => rr.count === 1 && rr.rows[0].count === 1 },
      { query: `source=scan client="${client}" host=${uncHost}`, says: "the high was a banner guess", check: (rr) => rr.count === 1 && /banner/.test(rr.rows[0].detected_by) }],
    events: ev, now });
}

/* =====================================================================
   TYPE 5 — scan method and tuning (credentialed / safe checks / window)
   Tier 2 (3 decisions).
   ===================================================================== */
function type5(n) {
  const r = rngOf("t5-" + n); const client = pick(r, CLIENTS), d = dom[client];
  const now = `2026-11-${String(2 + (n % 20)).padStart(2, "0")}T08:00:00Z`;
  const ev = [{ time: now.replace("08:00", "06:00"), source: "scanjob", client, job: `${client.split(" ")[0].toUpperCase()}-WEEKLY`, safe_checks: "off", credentialed_ok: 18, credentialed_failed: `host-${n} (login rejected)`, not_tried: "fragile OT tablets", findings: 300 + n },
    { time: now.replace("08:00", "06:05"), source: "ticket", client, ref: `VOO-FR-${n}`, note: "A fragile device froze during the scan" }];
  const d1 = [
    { text: "Fix the credentials and rescan — a rejected login meant only banner guesses", why: "" },
    { text: "Ignore the failed login, since 18 hosts scanned fine and one gap won't matter much", why: "A rejected login means that host was read only by banner; the gap does matter." },
    { text: "Exclude the failed host from all future scans so the job stops reporting an error", why: "Excluding it creates a permanent blind spot. Fix the credential and rescan." },
    { text: "Escalate the failed login to incident response as a sign of account compromise", why: "A rejected scan login usually means a rotated password, not compromise. Fix the account." },
    { text: "Raise the scanner's timeout so the login has longer to complete next time", why: "The login was rejected, not slow; a timeout change won't fix a wrong credential." },
    { text: "Switch that host to an agentless-only scan and accept the reduced coverage", why: "The credentialed scan is what gives real coverage; fix the login rather than downgrade it." },
  ];
  const d2 = [
    { text: "Give the fragile devices their own gentle policy: safe checks on, one at a time", why: "" },
    { text: "Keep the aggressive policy but move the fragile devices' scan to the middle of the night", why: "It still crashes them; the load is the problem, not the hour." },
    { text: "Exclude the fragile devices entirely, since they keep falling over when scanned", why: "Excluding them makes a blind spot; scan them gently instead." },
    { text: "Install the scanner's agent on each fragile device to avoid probing over the network", why: "Often the fragile devices can't take an agent, or the vendor forbids it; scan gently." },
    { text: "Replace the fragile devices so a normal scan policy can be used on them", why: "Replacing hardware to suit a scanner is backwards; tune the scan to the device." },
    { text: "Raise the timeout for the fragile devices and keep everything else the same", why: "Timeout isn't the cause; the probe load is. A gentler policy is the fix." },
  ];
  const d3 = [
    { text: "Turn safe checks on and schedule the scan for the client's closed hours", why: "" },
    { text: "Leave safe checks off, since they slow the scan and most systems tolerate it", why: "Safe checks off is what endangers fragile systems; turn them on for those." },
    { text: "Run the scan during business hours with staff on hand to restart anything", why: "Scanning fragile systems in business hours risks live work; use the closed window." },
    { text: "Scan continuously so nothing is ever missed between the weekly windows", why: "Continuous aggressive scanning of fragile kit keeps breaking it; schedule and gentle." },
    { text: "Let each site choose its own scan time without a standard window at all", why: "Ad-hoc timing loses the maintenance window discipline; schedule it for closed hours." },
    { text: "Only scan when a change is made, and skip the regular weekly scan entirely", why: "Regular scanning finds drift; keep it, tuned and windowed, not event-only." },
  ];
  return ticket({ id: `PRAC-5-${n}`, type: 5, tier: 2, time: "06:30:00", sev: "medium",
    alert: `Scan tuning needed at ${client}`, source: "Scanner", client, entity: "weekly job", attack: "",
    facts: [["Login", "one host rejected the scan credential"], ["Fragile", "a device froze"], ["Safe checks", "off"]],
    tabs: [{ title: "Scan job", kind: "kv", pairs: [["Safe checks", "off"], ["Credentialed OK", "18 hosts"], ["Failed login", `host-${n}`], ["Not tried", "fragile OT tablets"], ["Incident", "a device froze during the scan"]] }],
    search: { query: `source=scanjob client="${client}"`, say: "How the scan ran." },
    guide: ["Read the scan job: what failed, and what froze?", "Give fragile devices a gentler policy.", "Set safe checks and a window."],
    fizban: "The scan completed with 18 hosts credentialed. Looks healthy. Recommend keeping the current policy.",
    decisions: [board("d1", (n % 6) + 1, "What do you do about the rejected login?", d1, 0, ["A rejected login changes what the scan could see on that host.", "Fix the credential, then rescan credentialed."], "A failed credentialed login quietly downgrades a scan to banner reading. Fix the account and rescan; don't exclude the host."),
      board("d2", ((n + 2) % 6) + 1, "How should the fragile devices be scanned?", d2, 0, ["What actually froze them — the hour, or the load?", "Go gently, host by host, when nothing depends on them."], "Scanners are sensors and get tuned: safe checks, throttling and windows for fragile systems. Too aggressive breaks the business."),
      board("d3", ((n + 4) % 6) + 1, "What scan settings fit fragile systems?", d3, 0, ["Which setting protects a fragile host during a scan?", "Safe checks on, in the closed window."], "Safe checks and a maintenance window protect fragile systems; scanning them aggressively in work hours breaks things.")],
    writeup: `Scan tuning at ${client}: fixed a rejected scan credential and rescanned; gave the fragile devices a gentle, one-at-a-time policy with safe checks on, scheduled for closed hours. Could not be confirmed: full coverage of the fragile devices until the gentle rescan completes.`,
    summary: [["2.1", "Chose and tuned the scan method", "Selecting the scanning method", "Credentialed · safe checks · window"]],
    proofs: [{ query: `source=scanjob client="${client}"`, says: "the scan had a failed login and safe checks off", check: (rr) => rr.count === 1 && rr.rows[0].safe_checks === "off" && /rejected/.test(rr.rows[0].credentialed_failed) }],
    events: ev, now });
}

/* =====================================================================
   TYPE 6 — baselines and compliance (CIS drift with a cause)
   Tier 2 (3 decisions).
   ===================================================================== */
function type6(n) {
  const r = rngOf("t6-" + n); const client = pick(r, CLIENTS), d = dom[client];
  const now = `2026-11-${String(2 + (n % 20)).padStart(2, "0")}T08:00:00Z`;
  const chg = `CHG-${7000 + n}`;
  const ev = [{ time: now.replace("08:00", "04:00"), source: "config", client, check: "Anti-malware signatures current", result: "fail", value: `${12 + n} days old` },
    { time: now.replace("08:00", "04:05"), source: "config", client, check: "Legacy file-sharing protocol disabled", result: "fail", value: "enabled" },
    { time: now.replace("08:00", "04:10"), source: "change", client, change: chg, note: "A firewall tightening whose allow-list left out the update service" },
    { time: now.replace("08:00", "04:15"), source: "firewall", client, action: "denied", rule: `OUT-DENY-ALL (${chg})`, dest: "update service" },
    { time: now.replace("08:00", "04:20"), source: "vendor", client, note: "Vendor software still needs the legacy protocol until a fix next year" }];
  const d1 = [
    { text: "A firewall change blocked the update service, so signatures fell behind since then", why: "" },
    { text: "The anti-malware licence expired, which is why updates stopped arriving on the hosts", why: "The firewall log shows updates being attempted and denied by a named rule, not a licence lapse." },
    { text: "Malware on the hosts switched off updating to hide itself from the scanner", why: "Nothing points to malware; a named firewall rule is denying the outbound updates." },
    { text: "The update service itself went down, which is why every host fell behind together", why: "It's denied by the client's own rule from the change, not a vendor outage." },
    { text: "Staff kept dismissing the update prompt, so the signatures never installed on the hosts", why: "The updates never reach the hosts; they're blocked outbound at the firewall." },
    { text: "The hosts were rebuilt and simply haven't had time to pull updates down yet", why: "The denies start on the change date and continue; it's the rule, not a fresh rebuild." },
  ];
  const d2 = [
    { text: "A signed exception with the legacy protocol isolated, reviewed when the fix ships", why: "" },
    { text: "Disable the legacy protocol on every host tonight, as the benchmark demands", why: "The vendor software needs it; disabling it breaks the client's tools. Isolate and except instead." },
    { text: "Leave it enabled and do nothing, since the vendor says there's no fix until next year", why: "Doing nothing isn't a control; isolate it and get a signed exception with a review date." },
    { text: "Accept the risk yourself in the ticket, noting the vendor's requirement for it", why: "Only the client can accept a risk; the analyst recommends and the client signs." },
    { text: "Mark it a false positive, since the affected hosts sit on their own separate VLAN", why: "The finding is true (the protocol is on); isolation is a compensating control, not a false positive." },
    { text: "Replace the vendor software so the legacy protocol is no longer needed at all", why: "That may be the long-term aim, but today's fix is isolation plus a signed exception." },
  ];
  const d3 = [
    { text: "An action plan: the drift, its cause, a dated fix per control, the exception", why: "" },
    { text: "A breach notice to the regulator, since a security control was failing on the hosts", why: "A control gap is a risk to fix, not a reportable breach; give the client an action plan." },
    { text: "Nothing yet — fix the firewall allow-list first, then report once everything passes", why: "The firewall isn't the SOC's to change, and the client needs to know now." },
    { text: "Just the benchmark score, so the client can compare itself with other sites", why: "A score without causes, fixes and dates helps nobody act." },
    { text: "A note to the vendor asking them to ship the fix sooner, copying the client in", why: "Worth asking, but the client needs its own dated action plan today." },
    { text: "A verbal heads-up on the next call, with the details left for the client to chase", why: "Compliance reporting is a written action plan the client can act on, not a chase." },
  ];
  return ticket({ id: `PRAC-6-${n}`, type: 6, tier: 2, time: "05:00:00", sev: "medium",
    alert: `Baseline drift at ${client}`, source: "Configuration scan", client, entity: "workstations", attack: "",
    facts: [["Benchmark", "CIS-style baseline"], ["Failing", "signatures and a legacy protocol"], ["Cause", `change ${chg}`]],
    tabs: [{ title: "Baseline", kind: "table", columns: ["Control", "Result", "Value"], rows: [["Signatures current", "fail", `${12 + n} days old`], ["Legacy protocol disabled", "fail", "enabled"]] },
      { title: "Why", kind: "list", items: [`Change ${chg} tightened the firewall and left out the update service`, "A named rule has denied updates since", "Vendor software needs the legacy protocol until a fix next year"] }],
    search: { query: `source=firewall client="${client}" action=denied`, say: "What the firewall has been blocking." },
    guide: ["Search the firewall denies and read the change note.", "Handle the legacy protocol with a compensating control.", "Write the client an action plan."],
    fizban: "Two controls failing — the biggest risk is the legacy protocol. Recommend disabling it on all hosts tonight.",
    decisions: [board("d1", (n % 6) + 1, "Why are the signatures out of date?", d1, 0, ["Search the firewall denies and read the change note.", "When many hosts fail the same way from one date, find what changed that day."], "Configuration drift usually has a date. A change that tightens one thing can quietly break another — here, updates."),
      board("d2", ((n + 2) % 6) + 1, "How is the legacy protocol handled?", d2, 0, ["The vendor needs it. What else can limit the risk?", "When a fix isn't possible, isolate and get a signed exception."], "A compensating control reduces risk when the proper fix isn't possible; it needs the owner's signature and a review date."),
      board("d3", ((n + 4) % 6) + 1, "What goes to the client?", d3, 0, ["What does the client need in order to act?", "Cause, fix, owner, date."], "Compliance reporting is an action plan: what failed, why, what fixes it, who signs, by when.")],
    writeup: `Baseline drift at ${client}: signatures stale because change ${chg} blocked the update service; a legacy protocol required by vendor software. Recommended fixing the allow-list and a signed exception with the protocol isolated. Action plan sent with due dates. Could not be confirmed: whether anything ran while protection was out of date.`,
    summary: [["2.2", "Read a baseline scan", "Configurations against baselines", "CIS · drift"], ["2.4", "Recommended a compensating control", "Mitigation when a fix isn't possible", "Compensating control · exception"], ["2.5", "Framed it as risk, not breach", "Risk and compliance", "Risk acceptance"]],
    proofs: [{ query: `source=firewall client="${client}" action=denied`, says: "the change's rule blocked updates", check: (rr) => rr.count >= 1 && new RegExp(chg).test(rr.rows[0].rule) },
      { query: `source=config client="${client}" result=fail | stats count`, says: "controls are failing", check: (rr) => rr.count === 1 && rr.rows[0].count >= 2 }],
    events: ev, now });
}

/* =====================================================================
   TYPE 7 — cloud posture (public bucket, encrypted, logging off)
   Tier 2 (3 decisions).
   ===================================================================== */
function type7(n) {
  const r = rngOf("t7-" + n); const client = pick(r, CLIENTS), d = dom[client];
  const now = `2026-11-${String(2 + (n % 20)).padStart(2, "0")}T08:00:00Z`;
  const bkt = `${client.split(" ")[0].toLowerCase()}-share-${n}`;
  const who = `${pick(r, person)}@${d}`;
  const ev = [{ time: now.replace("08:00", "05:40"), source: "cspm", client, resource: bkt, finding: "Bucket readable by anyone on the internet", public_access: "enabled", encryption: "enabled", access_logging: "disabled", data_classification: "records" },
    { time: now.replace("08:00", "05:41"), source: "cloudtrail", client, event: "DeleteBucketPublicAccessBlock", resource: bkt, user: who, src_ip: docIp(r, "10") },
    { time: now.replace("08:00", "05:42"), source: "cloudtrail", client, event: "PutBucketPolicy", resource: bkt, user: who, src_ip: docIp(r, "10"), detail: "Principal: * Action: read" }];
  const d1 = [
    { text: "Records open to the internet, and no logging to show whether they were read", why: "" },
    { text: "Low risk — the bucket is encrypted, so the files stay protected even while public", why: "Encryption at rest doesn't protect a public bucket; the provider decrypts for every reader." },
    { text: "A confirmed breach — public means the records were certainly copied and leaked", why: "Over-classification: logging is off, so nothing shows a read either way." },
    { text: "An attacker's work — someone broke into the account and made the bucket public", why: "The audit log shows a staff member did it from inside the network." },
    { text: "A false positive — the tool flags any bucket with a policy, public or not", why: "The policy grants read to everyone on the internet; the finding is accurate." },
    { text: "Nothing to worry about — only harmless files were ever meant to be shared here", why: "What was meant and what was exposed differ; records are in the same bucket." },
  ];
  const d2 = [
    { text: "Have the client close public access today and switch access logging on now", why: "" },
    { text: "Delete the bucket so nothing in it can ever be read from outside again", why: "That destroys the client's data and the evidence; closing public access is enough." },
    { text: "Raise a routine ticket for the client's next IT day, since it's encrypted anyway", why: "Every day public is another day exposed; it needs closing today, and encryption doesn't help." },
    { text: "Turn public access off yourself from the SOC console, then tell the client after", why: "Not a change the SOC makes on a client's cloud account; the client's contact does it today." },
    { text: "Email the staff member that they broke the rules and must revert it themselves", why: "Blame doesn't fix it; the client's IT contact closes it, and logging goes on now." },
    { text: "Wait for the client's privacy decision before changing anything, to keep evidence", why: "Closing public access destroys no evidence (the audit log stays); stop the exposure first." },
  ];
  const d3 = [
    { text: "The client decides on notification with its lawyers; you give it the facts", why: "" },
    { text: "You decide: no read can be proved, so there's nothing to tell and it can close", why: "Not the analyst's call, and 'can't be proved' isn't 'didn't happen'." },
    { text: "Notify the affected people today, straight from the SOC, to be safe and quick", why: "Notification is the client's legal decision; the SOC never contacts a client's people." },
    { text: "The cloud provider decides, since the bucket and the logs live on their service", why: "The provider runs the service; the data and the duty belong to the client." },
    { text: "The staff member decides, since they made it public and know what they put in it", why: "One person can't make the client's legal decision." },
    { text: "Nobody decides yet — wait for the next scan to see if it recurs", why: "The exposure already happened; the decision about it is due now." },
  ];
  return ticket({ id: `PRAC-7-${n}`, type: 7, tier: 2, time: "05:40:00", sev: "high",
    alert: `Public cloud storage at ${client}`, source: "Cloud posture", client, entity: bkt, attack: "T1530",
    facts: [["Public", "readable by anyone"], ["Encryption", "on"], ["Logging", "off"]],
    tabs: [{ title: "Finding", kind: "kv", pairs: [["Resource", bkt], ["Public access", "enabled"], ["Encryption", "enabled"], ["Access logging", "disabled"], ["Data", "records"]] },
      { title: "Audit log", kind: "list", items: [`${who} removed the public-access block from inside the network`, `${who} added a public-read policy`] }],
    search: { query: `source=cloudtrail client="${client}" resource=${bkt} | table time event user`, say: "Who made it public, and when." },
    guide: ["What's exposed, and does encryption protect it here?", "Stop the exposure through the client's contact.", "Who decides on notification?"],
    fizban: "The bucket is encrypted, so the files are protected even though it's public. Low risk.",
    decisions: [board("d1", (n % 6) + 1, "What is the most defensible reading?", d1, 0, ["Read the encryption and logging lines together, then the audit log.", "Encryption at rest doesn't stop an authorised reader, and public means everyone."], "Encryption at rest protects a stolen disk, not a public bucket; without logging, nobody can prove whether it was read."),
      board("d2", ((n + 2) % 6) + 1, "What happens right now?", d2, 0, ["Who at the client makes cloud changes?", "Stop the exposure first; decisions about the past come after."], "Contain first: close the exposure today through the client's contact, and turn logging on so next time there's evidence."),
      board("d3", ((n + 4) % 6) + 1, "Who decides on notification?", d3, 0, ["Whose data and whose duty is it?", "The analyst escalates with facts; the data owner decides."], "The data owner decides on notification, with legal advice; the analyst's job is the facts: what, when, how long, and what can't be known.")],
    writeup: `Cloud posture at ${client}: ${bkt} readable by anyone since a staff member removed the public-access block and added a public-read policy from inside the network. Encrypted at rest (which doesn't protect a public bucket); logging was off. Recommended closing public access today and enabling logging; escalated for the client's privacy decision. Could not be confirmed: whether anyone read the files while it was public.`,
    summary: [["1.2", "Read a posture finding and the audit log", "Indicators across cloud", "Public bucket · audit log"], ["2.4", "Closed public access, turned logging on", "Mitigation and controls", "Least privilege · logging"], ["2.5", "Left notification to the owner", "Compliance", "Data protection · notification"]],
    proofs: [{ query: `source=cloudtrail client="${client}" resource=${bkt}`, says: "a staff member made it public from inside", check: (rr) => rr.count === 2 && rr.rows.every(x => x.user === who && x.src_ip.startsWith("10.")) },
      { query: `source=cspm client="${client}" resource=${bkt}`, says: "encryption on, logging off", check: (rr) => rr.count === 1 && rr.rows[0].encryption === "enabled" && rr.rows[0].access_logging === "disabled" }],
    events: ev, now });
}

/* =====================================================================
   TYPE 8 — beaconing / C2 look-alike vs real implant
   Tier 1 (2 decisions).
   ===================================================================== */
function type8(n) {
  const r = rngOf("t8-" + n); const client = pick(r, CLIENTS), d = dom[client];
  const now = `2026-10-${String(6 + (n % 20)).padStart(2, "0")}T09:00:00Z`;
  const legit = n % 2 === 0; /* legit signed agent vs unsigned implant */
  const host = `${client.split(" ")[0].toUpperCase().slice(0, 4)}-PC-${20 + n}`;
  const dst = docIp(r, "198.51.100");
  const ev = [{ time: now.replace("09:00", "01:00"), source: "zeek.conn", client, host, "id.resp_h": dst, "id.resp_p": 443, service: "ssl", orig_bytes: 1200, resp_bytes: 3400, conn_state: "SF", note: "hourly, steady sizes" },
    { time: now.replace("09:00", "01:00"), source: "edr", client, host, process: legit ? "VendorAgent.exe" : "svc-update.exe", signer: legit ? "Known Vendor (valid)" : "unsigned", children_30d: legit ? 0 : 3, listening: "none", installed: legit ? "2022-01-10" : "2026-10-01" },
    { time: now.replace("09:00", "01:05"), source: "intel", indicator: dst, verdict: legit ? "no malicious verdicts" : "reported this month", category: legit ? "software vendor" : "unknown" }];
  const d1 = [
    { text: "A benign true positive — a signed vendor agent's steady, harmless check-in", why: "The process here isn't a signed vendor agent with a clean history, so benign doesn't fit." },
    { text: "Command-and-control — an unsigned implant beaconing to a flagged address", why: "The process here is a signed vendor agent to a clean address, so C2 doesn't fit." },
    { text: "A false positive — the beacon rule misfired on ordinary web browsing traffic", why: "It's a genuine beacon (hourly, steady, one destination), not ordinary browsing." },
    { text: "Data exfiltration — large files leaving the host disguised as check-in traffic", why: "The sizes are a small check-in, not a bulk upload; nothing large leaves." },
    { text: "A port scan — the host probing many destinations to map the network around it", why: "It talks to one destination on a schedule, not many; that's a beacon, not a scan." },
    { text: "Lateral movement — the host reaching into other machines to spread an infection", why: "There's one outbound check-in, no internal spread; that's not lateral movement." },
  ];
  const correct1 = legit ? 0 : 1;
  const d2 = [
    { text: legit ? "Close it with a not-proven line: is this agent still approved here?" : "Escalate to incident response and isolate the host for analysis", why: "" },
    { text: legit ? "Add a rule so this relay never alerts again, now that we know the traffic" : "Close it as benign, since a beacon on its own isn't proof of anything wrong", why: legit ? "Explained isn't approved, and it would hide the relay if it were taken over." : "This beacon is an unsigned process to a flagged host with child processes: not benign." },
    { text: legit ? "Block the relay at the client's firewall now so the ticket can close clean" : "Add a firewall block for the address and close the ticket without escalating", why: legit ? "A firewall change isn't a Tier 1 analyst's to make, and the agent stays installed." : "Addresses rotate and the implant persists; this needs escalation, not just a block." },
    { text: legit ? "Uninstall the agent from the host yourself before doing anything else at all" : "Ask the user to delete the suspicious program from their own machine", why: legit ? "Not your system to change; escalate the approval question instead." : "An unsigned implant needs proper IR handling, not a user deleting a file." },
    { text: legit ? "Escalate it as a live incident and isolate the host straight away" : "Wait a day to see whether the beacon stops on its own before acting", why: legit ? "Nothing here is malicious; a signed agent to a clean host isn't an incident." : "A confirmed implant to a flagged host shouldn't wait; contain and escalate now." },
    { text: legit ? "Reimage the host to be safe, since any beacon could be malicious" : "Reset the user's password and consider the beacon dealt with", why: legit ? "Reimaging a clean host over a signed agent's check-in is disproportionate." : "A password reset doesn't remove an implant; escalate and isolate." },
  ];
  return ticket({ id: `PRAC-8-${n}`, type: 8, tier: 1, time: "07:05:00", sev: "medium",
    alert: `Periodic outbound beacon at ${client}`, source: "SIEM", client, entity: host, attack: "T1071",
    facts: [["Pattern", "hourly, steady sizes, one destination"], ["Host", host], ["Read", "the software list and intel"]],
    tabs: [{ title: "Beacon", kind: "kv", pairs: [["Host", host], ["Destination", `${dst}:443`], ["Sizes", "~1.2 KB out / 3.4 KB in"], ["Process", legit ? "VendorAgent.exe (signed)" : "svc-update.exe (unsigned)"], ["Intel", legit ? "no verdicts" : "reported this month"]] }],
    search: { query: `source=edr client="${client}" host=${host} | table process signer children_30d`, say: "What the process is, and whether it's signed." },
    guide: ["Read the process and the intel: is it a signed agent or an unsigned implant?", "Decide what it is, and what to do."],
    fizban: "Hourly beacon with steady sizes — consistent with C2. Recommend isolating the host.",
    decisions: [board("d1", (n % 6) + 1, "What is the beacon?", d1, correct1, ["Read the process signer and the threat-intel verdict.", "A beacon is a pattern; what decides it is what the software is."], "Beaconing looks the same for a legitimate agent and an implant. The signer, the history and the destination's reputation decide it."),
      board("d2", ((n + 2) % 6) + 1, "What do you do?", d2, 0, ["Match the action to what you concluded.", legit ? "A signed agent needs the approval question, not isolation." : "An unsigned implant to a flagged host needs escalation."], legit ? "A benign beacon is closed with the open question that lets it be reopened later." : "A confirmed implant is contained and escalated, not suppressed.")],
    writeup: `Beacon from ${host} at ${client}: ${legit ? "a signed vendor agent to a clean address — benign true positive, closed with a not-proven line on whether it's still approved" : "an unsigned process to a flagged address with child processes — escalated and the host isolated"}. Could not be confirmed: ${legit ? "whether the agent is still approved for this client" : "what the implant did before it was caught"}.`,
    summary: [["1.2", "Read a beacon in context", "Indicators across network and endpoint", "Beaconing · C2 · look-alikes"], ["1.3", "Used EDR and threat intel", "Tools determine what it is", "EDR · threat intel"]],
    proofs: [{ query: `source=edr client="${client}" host=${host}`, says: "the process signer decides it", check: (rr) => rr.count === 1 && (legit ? /valid/.test(rr.rows[0].signer) : rr.rows[0].signer === "unsigned") },
      { query: `source=intel indicator=${dst}`, says: "the destination's reputation matches", check: (rr) => rr.count === 1 }],
    events: ev, now });
}

/* =====================================================================
   TYPE 9 — endpoint process tree (macro chain vs benign admin script)
   Tier 3 (4 decisions).
   ===================================================================== */
function type9(n) {
  const r = rngOf("t9-" + n); const client = pick(r, CLIENTS), d = dom[client];
  const now = `2026-11-${String(15 + (n % 13)).padStart(2, "0")}T09:00:00Z`;
  const host = `${client.split(" ")[0].toUpperCase().slice(0, 4)}-WS-${30 + n}`;
  const dst = docIp(r, "198.51.100");
  const ev = [
    { time: now.replace("09:00", "06:14"), source: "edr", client, host, process: "EXCEL.EXE", parent: "explorer.exe", action: "opened a macro-enabled attachment", attack: "T1204.002" },
    { time: now.replace("09:00", "06:14"), source: "edr", client, host, process: "powershell.exe", parent: "EXCEL.EXE", action: "started by the macro", attack: "T1059.001" },
    { time: now.replace("09:00", "06:15"), source: "edr", client, host, process: "cmd.exe", parent: "powershell.exe", action: "child shell", attack: "T1059.003" },
    { time: now.replace("09:00", "06:15"), source: "edr", client, host, process: "whoami", parent: "cmd.exe", action: "checked the user", attack: "T1033" },
    { time: now.replace("09:00", "06:16"), source: "zeek.conn", client, host, "id.resp_h": dst, "id.resp_p": 443, service: "ssl", orig_bytes: 700, resp_bytes: 220000, conn_state: "SF", attack: "T1105" },
    { time: now.replace("09:00", "06:20"), source: "intel", indicator: dst, verdict: "malware distribution", category: "malware host" }];
  const d1 = [
    { text: "A macro ran PowerShell, opened a shell, and pulled a file from a malware host", why: "" },
    { text: "A false positive — Excel updating itself is normal spreadsheet behaviour on open", why: "Excel doesn't normally start PowerShell that opens a shell and downloads from a flagged host." },
    { text: "The user ran a legitimate admin script that happens to look like a macro chain", why: "The parent is a macro-enabled attachment reaching a malware host, not an admin script." },
    { text: "Ransomware already encrypting the host, seen as the outbound connection", why: "Nothing shows encryption; this is initial access and a download." },
    { text: "A phishing link the user clicked, opening a page in the browser", why: "No link click; explorer launched Excel on an attachment. It's a malicious file." },
    { text: "A software update from the vendor that legitimately fetched a new component", why: "The chain runs from a macro to a shell to a flagged malware host, not a vendor update." },
  ];
  const d2 = [
    { text: "Isolate the host in EDR and cut the user's sessions while the file is assessed", why: "" },
    { text: "Power the host off at once so the downloaded file can't run", why: "Powering off loses memory evidence; isolate in EDR to keep it while cutting the network." },
    { text: "Block the destination address and leave the host online for the user to keep working", why: "The host already ran the chain; leaving it online lets the payload act. Isolate it." },
    { text: "Email the user to ask what they clicked before touching the machine at all", why: "Waiting lets the download act; contain first, interview after." },
    { text: "Reset the user's password to stop the attacker spreading through the account", why: "The code runs locally; a reset doesn't contain the host. Isolate it." },
    { text: "Delete the attachment from the mailbox and consider the host handled", why: "That doesn't contain the host that already ran the chain." },
  ];
  const d3 = [
    { text: "A file came down; what it did next isn't shown and has to be checked", why: "" },
    { text: "Nothing happened — a download is harmless until the file is executed later", why: "A download to a compromised host isn't harmless, and whether it ran is what to check." },
    { text: "The whole network is compromised, since the host reached a malware address", why: "One host ran the chain; spread is what you investigate, not assume." },
    { text: "Data was stolen, since 220 KB moved during the outbound connection", why: "220 KB came back (a download), not out; read the byte direction." },
    { text: "It failed — whoami returned nothing, so the attacker gave up", why: "whoami is one discovery step; the download after it shows they continued." },
    { text: "The host is fully cleaned, since isolating it removed the threat entirely", why: "Isolation contains; it doesn't tell you what the download did. Check that." },
  ];
  const d4 = [
    { text: "T1566.001, T1204.002, T1059.001, T1059.003, T1033, T1105 along the chain", why: "" },
    { text: "T1486 Data Encrypted for Impact, since the host was clearly hit by ransomware", why: "Nothing was encrypted; the chain is initial access and a download." },
    { text: "T1071.001 Web Protocols only, since it all happened over web traffic on 443", why: "That names the transport, not the macro, shell and download steps." },
    { text: "T1078 Valid Accounts, since the chain ran under the user's own account", why: "It ran as the user because they opened the file; the technique is the macro chain." },
    { text: "T1046 Network Service Discovery, since the host reached an external address", why: "There's no scanning; the chain is a document to a shell to a download." },
    { text: "T1490 Inhibit System Recovery, since backups are always the ransomware target", why: "No backups were touched; this is initial access, not recovery inhibition." },
  ];
  return ticket({ id: `PRAC-9-${n}`, type: 9, tier: 3, time: "06:14:00", sev: "high",
    alert: `Office document spawned a shell at ${client}`, source: "EDR", client, entity: host, attack: "T1566.001",
    facts: [["Chain", "Excel → PowerShell → cmd"], ["Then", "a download from a malware host"], ["Host", host]],
    tabs: [{ title: "Process tree", kind: "process", host, tree: [{ name: "explorer.exe", children: [{ name: "EXCEL.EXE", note: "opened a macro attachment", children: [{ name: "powershell.exe", note: "from the macro", children: [{ name: "cmd.exe", children: [{ name: "whoami" }] }, { name: "download helper", note: `fetched from ${dst}` }] }] }] }] },
      { title: "Intel", kind: "list", items: [`${dst} — malware distribution`] }],
    search: { query: `source=edr client="${client}" host=${host} | table process parent action attack`, say: "The process chain." },
    guide: ["Read the process tree.", "Contain the host.", "Scope how far it got.", "Map it to ATT&CK."],
    fizban: "A macro-enabled document spawned PowerShell and downloaded from a malware host — initial access. Recommend isolating the host.",
    decisions: [board("d1", (n % 6) + 1, "What is the chain?", d1, 0, ["Read what launched what in the tree.", "Office starting a shell that downloads from a flagged host is initial access."], "A macro-enabled attachment spawning a scripting host is spearphishing attachment plus user execution."),
      board("d2", ((n + 1) % 6) + 1, "What's the first action?", d2, 0, ["What cuts the host off without losing memory?", "Contain the host and the account."], "Containment isolates the host (keeping memory) and cuts the account's sessions; blocking one IP isn't containment."),
      board("d3", ((n + 2) % 6) + 1, "How far did it get?", d3, 0, ["Read byte direction, then what's proven vs assumed.", "A download is a fact; what it did is a question."], "Scope by evidence: a confirmed download is a fact; execution and spread are the next questions."),
      board("d4", ((n + 3) % 6) + 1, "How is it mapped?", d4, 0, ["Name a technique per step of the chain.", "Attachment, execution, scripting, discovery, download."], "The chain maps step by step: attachment, user execution, PowerShell, command shell, discovery, ingress tool transfer.")],
    writeup: `Macro-enabled attachment on ${host} at ${client} started PowerShell → cmd → whoami and downloaded 220 KB from ${dst}, a malware host. Contained: host isolated, sessions cut. ATT&CK T1566.001/T1204.002/T1059.001/T1059.003/T1033/T1105. Could not be confirmed: what the downloaded file did after it landed.`,
    summary: [["3.1", "Mapped the chain", "Attack frameworks", "ATT&CK · process chain"], ["3.2", "Contained then scoped", "IR process", "Containment"], ["1.2", "Read endpoint indicators", "Indicators across endpoint", "Process tree"]],
    proofs: [{ query: `source=edr client="${client}" host=${host} | stats count`, says: "the chain has several steps", check: (rr) => rr.count === 1 && rr.rows[0].count >= 4 },
      { query: `source=zeek.conn client="${client}" host=${host}`, says: "the host downloaded (bytes came back)", check: (rr) => rr.count === 1 && Number(rr.rows[0].resp_bytes) > Number(rr.rows[0].orig_bytes) },
      { query: `source=intel indicator=${dst}`, says: "the destination is a malware host", check: (rr) => rr.count === 1 && /malware/.test(rr.rows[0].verdict) }],
    events: ev, now });
}

/* =====================================================================
   TYPE 10 — web attacks: attempt vs success
   Tier 3 (4 decisions).
   ===================================================================== */
function type10(n) {
  const r = rngOf("t10-" + n); const client = pick(r, CLIENTS), d = dom[client];
  const now = `2026-11-${String(15 + (n % 13)).padStart(2, "0")}T09:00:00Z`;
  const host = `shop.${d}`;
  const ev = [];
  for (let k = 0; k < 150 + n; k++) ev.push({ time: now.replace("09:00", "0" + (1 + (k % 6)) + ":0" + (k % 6)), source: "web", client, host, src_ip: docIp(r, "203.0.113"), category: "attack attempt", waf_action: "blocked", status: k % 3 ? 403 : 404, bytes: k % 3 ? 0 : 300 });
  ev.push({ time: now.replace("09:00", "04:41"), source: "web", client, host, src_ip: docIp(r, "203.0.113"), path: "/legacy/old.php", category: "path traversal", waf_action: "logged (path not covered)", status: 200, bytes: 5800, target: "config file" });
  const opts = [
    { text: "One traversal worked on a path the WAF doesn't cover, and read a config file", why: "" },
    { text: "All attempts were blocked, so this is probing that got nowhere and can close", why: "One request to an uncovered path returned a 200 with a real body — not a block." },
    { text: "A false positive — the 200 is the store's own page loading for a customer", why: "The 200 is on an attack category from the scanner, not a customer's browse." },
    { text: "A full compromise — the attacker is inside and running commands on the server", why: "The evidence is one file read; reading a config file isn't code execution." },
    { text: "Nothing reached anything — the not-founds show the traversal kept failing", why: "One request returned 5,800 bytes with a 200; that one worked." },
    { text: "A denial-of-service attempt, since so many requests arrived in a short window", why: "The volume is light and the pattern is content probing; the 200 is the point." },
  ];
  const d2 = [
    { text: "The WAF guards the app paths; the old file sits where the WAF never looks", why: "" },
    { text: "The WAF failed open under load and let the next request straight through", why: "The WAF kept blocking the app paths; it simply never inspected this path." },
    { text: "The attacker found a gap in one WAF rule and crafted a request to slip past", why: "The path isn't in the rule set at all, so no rule applied to it." },
    { text: "The request came from an allow-listed address the WAF trusted and passed", why: "It came from the same scanner range as the blocked ones; no allow-list." },
    { text: "The old file authenticated the request, so the WAF saw a logged-in admin", why: "The file needs no login; the WAF missed it because it doesn't watch that path." },
    { text: "A CDN cached the 200, so the WAF never inspected that particular request", why: "No CDN fronts this path; the origin served it, not a cache." },
  ];
  const d3 = [
    { text: "The config's secrets are exposed, but nothing shows the database was reached", why: "" },
    { text: "The database is breached — the attacker has the password, so data is stolen", why: "Having the password isn't using it; the logs show only the app's own access." },
    { text: "Nothing was exposed — a config file is only text and holds nothing of value", why: "That text is the database credential and secret keys; exposure is real." },
    { text: "Card data was taken, since the store processes payments and the file was read", why: "Card data goes through a processor; it isn't in the config file to take." },
    { text: "The attacker has admin of the site now, because the secret keys were exposed", why: "Keys were exposed, but nothing shows an admin session created." },
    { text: "It got no further — the later not-founds prove the attacker gave up entirely", why: "Later not-founds don't prove that; what's shown is the config was read." },
  ];
  const d4 = [
    { text: "Remove the old file, rotate the exposed secrets and extend WAF cover (T1190)", why: "" },
    { text: "Add a WAF rule for that exact request and close it, since the attack is blocked", why: "One rule leaves the file and its secrets in place; remove and rotate." },
    { text: "Block the scanner's addresses and close it, since stopping them stops the attack", why: "Addresses rotate and the secrets are out; fix the exposure, not the source." },
    { text: "Rebuild the whole shop, because any config exposure means it can't be trusted", why: "Disproportionate; remove the file, rotate secrets, extend cover." },
    { text: "Just rotate the database password, the only secret that really matters here", why: "The secret keys were exposed too, and the old file itself must go." },
    { text: "Map it to T1071.001 Web Protocols, since it all happened over web traffic", why: "That's command traffic hiding in web protocols; this is exploiting a public app: T1190." },
  ];
  return ticket({ id: `PRAC-10-${n}`, type: 10, tier: 3, time: "07:20:00", sev: "high",
    alert: `Web attacks on the store at ${client}`, source: "WAF", client, entity: host, attack: "T1190",
    facts: [["Blocked", "most attempts"], ["One 200", "on an uncovered path"], ["Read", "a config file"]],
    tabs: [{ title: "WAF summary", kind: "table", columns: ["Path", "Action", "Status", "Size"], rows: [["app paths (many)", "blocked", "403/404", "0/300"], ["/legacy/old.php", "logged (not covered)", "200", "5,800"]] }],
    search: { query: `source=web client="${client}" status=200 category!="ordinary" | table path target`, say: "Which attack request returned content." },
    guide: ["Which request returned content, not a block?", "Why did that one get through?", "How far did it get?", "What to fix, and the mapping."],
    fizban: "All attempts were blocked by the WAF. The store is holding up. Recommend closing as blocked activity.",
    decisions: [board("d1", (n % 6) + 1, "Attempt or success?", opts, 0, ["A block is a 403, a not-found a 404, a success returns content.", "Find the one line whose status and size differ from the blocked ones."], "Attempt vs success is read from the response: hundreds of 403s and one 200 with a body means one landed."),
      board("d2", ((n + 1) % 6) + 1, "Why did that one get through?", d2, 0, ["Compare the blocked paths with the one that wasn't.", "A WAF only inspects the paths its rules cover."], "A WAF protects only what its rules cover; forgotten files fall outside the rule set."),
      board("d3", ((n + 2) % 6) + 1, "How far did it get?", d3, 0, ["Read what the config holds, then whether it was used.", "Say what was reached; mark the rest not proven."], "Scope by evidence: a read config exposes its secrets; whether they were used is a separate question."),
      board("d4", ((n + 3) % 6) + 1, "What has to happen?", d4, 0, ["What makes the exposure stop mattering?", "The technique is exploiting a public-facing app."], "Fix the root cause: the forgotten file and its exposed secrets, not just one request. That's T1190.")],
    writeup: `Web attacks on ${host} at ${client}: most blocked, but one traversal to /legacy/old.php (an uncovered path) returned the config file with the database credential and secret keys. Database log shows only the app's own access. Removed the file, rotated the secrets, extended WAF cover. ATT&CK T1190. Could not be confirmed: whether the secrets were used where the shop can't see.`,
    summary: [["1.2", "Separated attempts from the success", "Indicators: attempt vs success", "Status codes · response size"], ["1.3", "Read the WAF summary", "Tools determine what happened", "WAF · web logs"], ["3.1", "Mapped to T1190", "Attack frameworks", "Exploit public-facing app"]],
    proofs: [{ query: `source=web client="${client}" status=200 category!="ordinary" | stats count`, says: "exactly one attack request returned content", check: (rr) => rr.count === 1 && rr.rows[0].count === 1 },
      { query: `source=web client="${client}" waf_action=blocked | stats count`, says: "the rest were blocked", check: (rr) => rr.count === 1 && rr.rows[0].count >= 100 }],
    events: ev, now });
}

/* =====================================================================
   TYPE 11 — threat hunting / Pyramid of Pain
   Tier 3 (4 decisions).
   ===================================================================== */
function type11(n) {
  const r = rngOf("t11-" + n); const c1 = CLIENTS[n % 6], c2 = CLIENTS[(n + 2) % 6];
  const now = `2026-11-${String(15 + (n % 13)).padStart(2, "0")}T09:00:00Z`;
  const fp = "tls:" + (0x7a00 + n).toString(16);
  const ev = [];
  for (let k = 0; k < 12; k++) ev.push({ time: now.replace("09:00", "0" + (1 + (k % 8)) + ":0" + (k % 6)), source: "waf", client: k % 2 ? c1 : c2, src_ip: docIp(r, "203.0.113"), user_agent: k < 6 ? "scan/2.1" : "Mozilla/5.0", tls_fingerprint: fp, request_order: "robots, sitemap, login, plugin paths", action: "blocked" });
  const d1 = [
    { text: "The TLS fingerprint and the request order, identical at both of the clients", why: "" },
    { text: "The source IP addresses, the strongest link tying the two clients together", why: "The addresses change daily — the cheapest thing to swap. Hunt the behaviour." },
    { text: "The user-agent string, since matching user-agents prove one scanning tool", why: "The user-agent changes too; it's not reliable across the requests." },
    { text: "The exact time of day, since both clients are probed in the same window daily", why: "Timing isn't the constant here; the fingerprint and order are." },
    { text: "The specific URLs requested, identical at both of the clients every time", why: "Paths overlap, but the durable signal is the fingerprint and order." },
    { text: "Nothing reliable — with addresses changing, the two can't be linked at all", why: "They can: the TLS fingerprint and request order are identical and hard to change." },
  ];
  const d2 = [
    { text: "Detect the TLS fingerprint and request-order pattern across every client", why: "" },
    { text: "Block today's list of attacker addresses across every client we protect", why: "They rotate addresses daily; a blocklist is stale tomorrow." },
    { text: "Block the scan/2.1 user-agent everywhere, since it marks the attacker's tool", why: "They already vary the user-agent; a string is trivial to change." },
    { text: "Add today's attacker domains to the blocklist to stop the current wave", why: "Domains are cheap to register anew; not what raises their cost." },
    { text: "Wait for a threat-intel feed to publish indicators, then block those", why: "Feeds lag and publish cheap indicators; your behavioural detection beats waiting." },
    { text: "Hash the tool if captured and block that hash across every endpoint", why: "A hash changes on recompile, and this is web scanning, not a file. Hunt behaviour." },
  ];
  const d3 = [
    { text: "Higher up the pyramid: behaviour costs the attacker more to change", why: "" },
    { text: "Lower down — addresses are easiest for us to see, so hunt those first", why: "Easy to see isn't costly to change; hunting addresses barely inconveniences them." },
    { text: "It doesn't matter where on the pyramid, as long as something is blocked", why: "It matters: low-pyramid blocks are shrugged off; behaviour forces real change." },
    { text: "At the domain level, since domains sit in the middle of the pyramid", why: "Domains are still cheap to swap; behaviour (tactics) is what's dear." },
    { text: "At the hash level, since a file hash uniquely identifies the tool", why: "Hashes change on recompile; they're low on the pyramid, not the top." },
    { text: "Anywhere a feed already covers, to save writing our own detection", why: "Feeds cover cheap indicators; the durable win is your own behavioural rule." },
  ];
  const d4 = [
    { text: "One actor across both clients; report it and share the detection widely", why: "" },
    { text: "Two separate attackers who happen to look alike, so handle each client alone", why: "The identical fingerprint and order across both point to one actor, not two." },
    { text: "Random internet scanning, not worth a detection or a cross-client report", why: "Coordinated identical behaviour at two clients isn't random background noise." },
    { text: "A single client's problem, since only one WAF is really being tested here", why: "Both clients show it; the SOC's cross-client view is the whole point." },
    { text: "An internal test, so no detection or sharing is needed beyond a note", why: "Nothing marks it as sanctioned; treat it as a real cross-client actor." },
    { text: "Unproven — without the addresses matching, you can't say it's one actor", why: "The behaviour matches even as addresses change; that's how you attribute one actor." },
  ];
  return ticket({ id: `PRAC-11-${n}`, type: 11, tier: 3, time: "09:00:00", sev: "medium",
    alert: `Same tool probing two clients`, source: "WAF", client: c1, entity: `${c1} + ${c2}`, attack: "",
    facts: [["Constant", "one TLS fingerprint"], ["Changing", "addresses, user-agents"], ["Frame", "Pyramid of Pain"]],
    tabs: [{ title: "Fingerprints", kind: "table", columns: ["Client", "Address", "User-agent", "TLS fp"], rows: [[c1, "changes daily", "scan/2.1", fp], [c2, "changes daily", "browser", fp]] }],
    search: { query: `source=waf tls_fingerprint=${fp} | stats dc(client)`, say: "How many clients this fingerprint spans." },
    guide: ["What stays the same as the addresses change?", "What do you hunt on to cost the attacker?", "Where on the Pyramid of Pain is that?", "Report and share."],
    fizban: "Two clients probed by rotating addresses — block the addresses to stop it. Recommend a blocklist.",
    decisions: [board("d1", (n % 6) + 1, "What's the same across both clients?", d1, 0, ["Which columns stay identical when the address changes?", "The attacker changes what's cheap; find what they left the same."], "Addresses and user-agents are cheap to change; a tool fingerprint and behaviour are dear."),
      board("d2", ((n + 1) % 6) + 1, "What do you hunt on?", d2, 0, ["Which signal was hard for the attacker to change?", "Detect high on the pyramid — behaviour."], "Detecting behaviour forces the attacker to change how they work, not just their address."),
      board("d3", ((n + 2) % 6) + 1, "Where on the Pyramid of Pain is that?", d3, 0, ["Costly-to-change sits where on the pyramid?", "Behaviour is the top; addresses the bottom."], "The higher on the pyramid you detect, the more it costs the attacker to carry on."),
      board("d4", ((n + 3) % 6) + 1, "What do you conclude and do?", d4, 0, ["Same behaviour, two clients: one actor or two?", "Pass what you found to every client it touches."], "Cross-client visibility links one actor across clients; report and share the behavioural detection.")],
    writeup: `Hunt across ${c1} and ${c2}: addresses and user-agents change, but one TLS fingerprint (${fp}) and request order are identical — one actor. Wrote a behavioural detection and shared it across clients. Could not be confirmed: whether the same actor touched clients without WAF coverage.`,
    summary: [["1.4", "Hunted on behaviour", "Threat-hunting concepts", "Pyramid of Pain · TLS fingerprint"], ["1.5", "Linked across clients", "Efficiency and correlation", "Correlation"]],
    proofs: [{ query: `source=waf tls_fingerprint=${fp} | stats dc(client)`, says: "one fingerprint spans two clients", check: (rr) => rr.count === 1 && rr.rows[0]["dc(client)"] === 2 }],
    events: ev, now });
}

/* =====================================================================
   TYPE 12 — alert flood / correlation
   Tier 3 (4 decisions).
   ===================================================================== */
function type12(n) {
  const r = rngOf("t12-" + n);
  const now = `2026-11-${String(15 + (n % 13)).padStart(2, "0")}T07:00:00Z`;
  const isp = ["Optic Light Fibre", "RF Jack Cable"][n % 2];
  const ev = [];
  const kinds = ["Tunnel down", "Agents offline", "Mail stopped", "DNS failing", "VPN unreachable", "POS offline"];
  for (let k = 0; k < 60; k++) ev.push({ time: now.replace("07:00", "06:0" + (k % 10)), source: "monitor", client: CLIENTS[k % 6], alert: kinds[k % 6], isp });
  ev.push({ time: now.replace("07:00", "06:31"), source: "isp", provider: isp, notice: "Fibre cut on the regional ring, restored the same morning" });
  const d1 = [
    { text: "One event: an ISP fibre cut knocked out every client's network link at once", why: "" },
    { text: "A coordinated attack on all clients, so open a major incident for each of them", why: "Every alert names the same ISP and the notice explains a fibre cut. It's one cause." },
    { text: "Sixty separate faults that coincided, so work each client as its own ticket", why: "They share one ISP, one window, restored together — correlation, not coincidence." },
    { text: "A denial-of-service on the SOC's monitoring, flooding it to hide something", why: "The alerts are client connectivity losses with an ISP notice, not SOC flooding." },
    { text: "Our own tooling failing, since agents and log forwarders went offline", why: "They went offline because the link dropped; the ISP notice is the cause." },
    { text: "The start of ransomware across clients, since everything went dark at once", why: "Ransomware doesn't restore itself when the ISP fixes a cable. It's an outage." },
  ];
  const d2 = [
    { text: "Raise one correlated event citing the ISP notice, tell clients, and keep watch", why: "" },
    { text: "Escalate all sixty alerts individually so each client gets its own handler", why: "Sixty tickets for one cause buries the team; correlate and raise one." },
    { text: "Close all sixty as false positives, since the outage means none was security", why: "They're true positives — connectivity really dropped; correlate, don't dismiss." },
    { text: "Do nothing until the links come back, since the outage clears the alerts itself", why: "Clients need to know now, and you must check nothing hides in the noise." },
    { text: "Suppress connectivity alerts permanently so an outage can't flood the queue again", why: "Those alerts matter when the cause isn't an ISP; correlate, don't go blind." },
    { text: "Fail every client over to backup links yourself from the SOC to restore service", why: "Not the SOC's change to make, and the ISP is already restoring the ring." },
  ];
  const d3 = [
    { text: "Keep watching — an outage is a classic cover for a quieter event underneath", why: "" },
    { text: "Stand down entirely once the ISP notice arrives, since the cause is explained", why: "The cause of the flood is explained, but you still watch for anything hiding in it." },
    { text: "Assume nothing else is happening, since sixty alerts all have one cause", why: "A shared cause for the flood doesn't rule out a separate quiet event; keep watching." },
    { text: "Turn off monitoring during the outage to stop the noise until it's over", why: "Turning off monitoring blinds you exactly when an attacker might use the cover." },
    { text: "Escalate the outage to incident response as a security incident to be safe", why: "It's an availability event with a known cause; watch, don't mislabel it as a breach." },
    { text: "Wait for a client to call before doing anything more about the situation", why: "Be proactive: correlate, inform, and keep watch rather than waiting on a call." },
  ];
  const d4 = [
    { text: "Correlation made sixty alerts into one; report the cause and stay vigilant", why: "" },
    { text: "The lesson is to raise every alert, since more tickets mean more coverage", why: "More tickets for one cause is the opposite of the lesson; correlate them." },
    { text: "The lesson is to suppress connectivity alerts to avoid future floods", why: "Suppression hides real events; the lesson is correlation plus vigilance." },
    { text: "The lesson is that ISP outages aren't the SOC's concern at all", why: "They are: they affect clients and can mask attacks. Correlate and watch." },
    { text: "The lesson is to escalate floods straight to IR without triaging them first", why: "Triage and correlate first; escalate a real incident, not a known outage." },
    { text: "The lesson is that sixty alerts always mean a real coordinated attack", why: "Here they meant one outage; volume alone isn't an attack." },
  ];
  return ticket({ id: `PRAC-12-${n}`, type: 12, tier: 3, time: "06:35:00", sev: "high",
    alert: `60 alerts across every client`, source: "Monitoring", client: "Multiple", entity: "6 clients", attack: "",
    facts: [["Spike", "60 alerts in minutes"], ["Common", isp], ["Read", "the ISP notice"]],
    tabs: [{ title: "The spike", kind: "list", items: ["Tunnels down, agents offline, mail and DNS failing", `Every alert names ${isp}`, "An ISP notice reports a fibre cut, restored the same morning"] }],
    search: { query: "source=monitor | stats count by isp", say: "How many alerts name one ISP." },
    guide: ["What do the 60 have in common?", "What do you do about the flood?", "What do you keep doing?", "The lesson."],
    fizban: "Sixty alerts across all clients at once — a coordinated attack. Recommend a major incident for each.",
    decisions: [board("d1", (n % 6) + 1, "What are the 60 alerts?", d1, 0, ["Read what every alert has in common, then the ISP notice.", "When everything breaks in one minute, look for one shared cause."], "Correlation turns sixty alerts into one incident: a shared timestamp and dependency point to a common cause."),
      board("d2", ((n + 1) % 6) + 1, "What do you do about the flood?", d2, 0, ["Sixty tickets, or one explanation?", "Report the cause once and keep watch."], "Alert flooding is handled by correlation and one clear report, while keeping watch."),
      board("d3", ((n + 2) % 6) + 1, "What do you keep doing?", d3, 0, ["An outage is cover for what?", "Keep watching for a quiet event."], "An outage is a classic cover for something quieter; vigilance stays on through the flood."),
      board("d4", ((n + 3) % 6) + 1, "What's the lesson?", d4, 0, ["What did correlation achieve here?", "One report, plus vigilance."], "Correlation plus vigilance: report the cause once, and keep watching for what a flood might hide.")],
    writeup: `60 alerts across six clients, all naming ${isp}; the ISP notice reports a fibre cut restored the same morning. Raised as one correlated availability event; clients informed; kept watch for anything hiding behind the noise. Could not be confirmed: that nothing quiet happened under the flood — monitoring stayed on.`,
    summary: [["1.5", "Correlated a flood", "Efficiency and correlation", "Correlation · alert flooding"], ["3.3", "Triaged volume without missing a signal", "Triage under volume", "Vigilance"]],
    proofs: [{ query: "source=monitor | stats count by isp", says: "all 60 alerts name one ISP", check: (rr) => rr.count === 1 && rr.rows[0].count === 60 },
      { query: "source=isp", says: "the ISP reported a fibre cut", check: (rr) => rr.count === 1 && /fibre cut/i.test(rr.rows[0].notice) }],
    events: ev, now });
}

/* =====================================================================
   TYPE 13 — incident handling (containment, volatility, escalation)
   Tier 4 (5 decisions).
   ===================================================================== */
function type13(n) {
  const r = rngOf("t13-" + n); const client = pick(r, CLIENTS), d = dom[client];
  const now = `2026-12-${String(1 + (n % 20)).padStart(2, "0")}T02:00:00Z`;
  const host = `${client.split(" ")[0].toUpperCase().slice(0, 4)}-SRV-${n}`;
  const acct = "svc-old";
  const ev = [{ time: now.replace("02:00", "01:12"), source: "vpn", client, account: acct, src_ip: docIp(r, "198.51.100"), result: "success", mfa: "not enforced", note: "orphaned service account" },
    { time: now.replace("02:00", "01:21"), source: "identity", client, host, event: "new local admin created", account: "support_tmp", created_by: acct },
    { time: now.replace("02:00", "01:22"), source: "siem", client, host, account: "support_tmp", reads: 3000 + n, writes: 0, renames: 0 },
    { time: now.replace("02:00", "01:38"), source: "edr", client, host, event: "backup copies deleted", by: "support_tmp", running: "yes" }];
  const d1 = [
    { text: "Ransomware staging: a new admin, a file sweep, backups gone, no encryption", why: "" },
    { text: "A cryptominer, using the same entry point to mine on the host again", why: "Nothing is mining; a new admin, file sweep and deleted backups are staging for encryption." },
    { text: "A vendor doing late maintenance, which explains the account and clean-up", why: "It's an orphaned account out of hours deleting backups — not maintenance." },
    { text: "A misfiring backup job — the reads and deletions are it rotating copies", why: "The reads come from a new admin account, not the backup service." },
    { text: "Data theft by an insider, since the only confirmed activity is reading files", why: "Entry was an orphaned account over the VPN, not a staff member." },
    { text: "Ransomware that already encrypted the host, so restore is the only way back", why: "No writes or renames — encryption hasn't started; that's why it's a near miss." },
  ];
  const d2 = [
    { text: "End the live session, disable the accounts, and isolate the host", why: "" },
    { text: "Shut the whole server down so encryption can't start tonight", why: "That destroys memory evidence and takes the business down; isolate instead." },
    { text: "Watch quietly for an hour to learn the attacker's tools first", why: "Encryption could start any minute; containment before curiosity." },
    { text: "Reset the account password and leave everything else running", why: "A reset doesn't end a live session, and the new admin account remains." },
    { text: "Block the source address at the firewall and leave the host online", why: "They reconnect from any address; the account and host are the access." },
    { text: "Start restoring from backup now before anything else is deleted", why: "Nothing is encrypted; restoring while they're inside undoes nothing." },
  ];
  const d3 = [
    { text: "Memory and live connections first, then the disk, under custody", why: "" },
    { text: "Reimage the host tonight so it's clean before the business opens", why: "Reimaging wipes the evidence of how they got in; capture first." },
    { text: "Power the host off to protect the disks, then image in the morning", why: "Memory is lost the moment power goes; it's the most volatile." },
    { text: "Export the EDR alerts and screenshots — enough to show what happened", why: "Alerts are summaries, not the evidence, and won't survive scrutiny." },
    { text: "Ask staff to copy the logs to a USB stick and bring them in later", why: "No chain of custody, and an untrained person handling evidence." },
    { text: "Capture the disks first, since they hold the most data, then memory", why: "Order of volatility: memory first; disks last an hour longer." },
  ];
  const d4 = [
    { text: "Escalate to IR and the client's contact per the runbook, now", why: "" },
    { text: "Decide yourself it isn't serious, since nothing was encrypted in the end", why: "Not the analyst's call; escalate the staged incident per the runbook." },
    { text: "Notify the client's customers directly tonight to be safe", why: "Notification is the client's decision; the SOC escalates internally." },
    { text: "Post it in the team chat and let the day shift pick it up", why: "The runbook names an out-of-hours contact; waiting loses hours." },
    { text: "Report it to law enforcement yourself before telling the client", why: "That's the client's decision with counsel, through the runbook." },
    { text: "Hold all escalation until the investigation is fully complete", why: "Escalation happens now; the investigation continues alongside it." },
  ];
  const d5 = [
    { text: "The way in — an orphaned account with no MFA — was left open; close it", why: "" },
    { text: "The attacker, who chose to target the client tonight for no clear reason", why: "The attacker isn't the root cause; the open account and missing MFA are." },
    { text: "A phishing email a staff member clicked, the usual ransomware entry", why: "No phishing here; the way in is the orphaned VPN account in the log." },
    { text: "Out-of-date anti-malware signatures on the affected server", why: "Signatures don't stop a valid login; the account is the cause." },
    { text: "The backups being on the same host, which is why deletion was easy", why: "That made it worse, not how they got in; the account is the root cause." },
    { text: "Bad luck — nothing specific let it happen, so nothing specific to fix", why: "Something specific let it happen: an orphaned account with no MFA." },
  ];
  return ticket({ id: `PRAC-13-${n}`, type: 13, tier: 4, time: "01:40:00", sev: "high",
    alert: `New admin, file sweep, backups deleted at ${client}`, source: "EDR", client, entity: host, attack: "T1490",
    facts: [["Entry", "orphaned account, no MFA"], ["Sweep", "reads only, no writes"], ["Backups", "deleted"]],
    tabs: [{ title: "Timeline", kind: "list", items: ["01:12 orphaned account signs in over the VPN, no MFA", "01:21 new local admin created", `01:22 ${3000 + n} file reads, 0 writes`, "01:38 backups deleted, host still running"] }],
    search: { query: `source=siem client="${client}" host=${host}`, say: "Reads versus writes on the host." },
    guide: ["What is happening?", "Contain the access.", "Preserve the evidence.", "Escalate.", "Root cause."],
    fizban: "This is ransomware — shut every server down now to stop the encryption.",
    decisions: [board("d1", (n % 6) + 1, "What is this?", d1, 0, ["Compare reads and writes.", "Ransomware prepares before it encrypts."], "Ransomware stages first: a privileged account, discovery, deleted backups — caught before encryption is a near miss."),
      board("d2", ((n + 1) % 6) + 1, "First action?", d2, 0, ["What is the attacker using to be inside?", "Contain the access, not the address or the whole business."], "Containment cuts the access: end the session, disable the accounts, isolate the host (keeping memory)."),
      board("d3", ((n + 2) % 6) + 1, "Preserve what?", d3, 0, ["What's lost first if the host is switched off?", "Most volatile first."], "Order of volatility: memory and live connections before disks, under chain of custody."),
      board("d4", ((n + 3) % 6) + 1, "Who is told?", d4, 0, ["Read the runbook.", "Escalate; the client decides."], "The analyst escalates to IR and the client's contact per the runbook; the client decides on notification."),
      board("d5", ((n + 4) % 6) + 1, "Root cause?", d5, 0, ["What let it happen, versus who did it?", "The access path is the root cause."], "Root cause is the condition that allowed it — an orphaned account with no MFA — not the attacker or the symptom.")],
    writeup: `Near miss at ${client}: orphaned account (${acct}, no MFA) over the VPN created a local admin, swept files (reads only), and deleted backups — ransomware staging, contained before encryption. Ended the session, disabled the accounts, isolated the host, captured memory then disk under chain of custody, escalated per the runbook. Root cause: the orphaned account and missing MFA. Could not be confirmed: whether anything left the host before containment.`,
    summary: [["3.2", "Ran the IR process in order", "IR life-cycle", "Containment · recovery"], ["3.3", "Read vs write; memory first", "Triage and evidence", "Order of volatility · chain of custody"], ["3.5", "Found the access path", "Root cause", "Orphaned account · MFA"]],
    proofs: [{ query: `source=siem client="${client}" host=${host}`, says: "reads with no writes — staging, not encryption", check: (rr) => rr.count === 1 && rr.rows[0].reads >= 1000 && Number(rr.rows[0].writes) === 0 },
      { query: `source=vpn client="${client}" account=${acct}`, says: "an orphaned account signed in with no MFA", check: (rr) => rr.count === 1 && /not enforced/.test(rr.rows[0].mfa) }],
    events: ev, now });
}

/* =====================================================================
   TYPE 14 — insider and exfiltration
   Tier 4 (5 decisions).
   ===================================================================== */
function type14(n) {
  const r = rngOf("t14-" + n); const client = pick(r, CLIENTS), d = dom[client];
  const now = `2026-12-${String(1 + (n % 20)).padStart(2, "0")}T14:00:00Z`;
  const who = `${pick(r, person)}@${d}`;
  const ev = [{ time: now.replace("14:00", "14:05"), source: "dlp", client, user: who, event: "large upload to personal cloud storage", bytes: 2000000000 + n * 100000000, files: "source code and a customer list" },
    { time: now.replace("14:00", "14:00"), source: "hr", client, user: who, event: "resignation on file", note: "notice period; joining a competitor; access still active" },
    { time: now.replace("14:00", "13:55"), source: "signin", client, user: who, src_ip: docIp(r, "10"), geo: "Office", result: "success", type: "interactive" }];
  const d1 = [
    { text: "The user themselves — an on-site interactive session on a managed device", why: "" },
    { text: "An external attacker who has pivoted from another incident to steal data", why: "This is the user's own on-site interactive session, not a remote attacker." },
    { text: "An outsider using the user's stolen credentials remotely to upload files", why: "The session is interactive from the office, not remote stolen access." },
    { text: "Automated malware uploading files on its own without the user's knowledge", why: "The actions are a manual sign-in and a deliberate upload — a person, not malware." },
    { text: "A misconfigured backup job syncing to a cloud account by mistake", why: "It's a personal storage account and a deliberate upload, not a sanctioned backup." },
    { text: "A false positive on the user's normal, approved use of company storage", why: "Personal storage isn't company storage, and gigabytes of code isn't normal use." },
  ];
  const d2 = [
    { text: "Consistent with theft: resigning, joining a rival, copying code and data", why: "" },
    { text: "An honest mistake — backing up work to the wrong destination folder", why: "Copying code and a customer list to personal storage while joining a rival isn't a slip." },
    { text: "Impossible to judge, so take no action until the user explains it", why: "The evidence supports intent enough to preserve and escalate now." },
    { text: "Definitely criminal, so report the user to the police before anything else", why: "That's the company's and counsel's decision; document and escalate internally first." },
    { text: "Careless hygiene HR can raise at the exit interview next week", why: "Gigabytes to a competitor can't wait for an exit interview; act now." },
    { text: "Sanctioned — developers keep copies of their work, so this is expected", why: "Company code and customer data aren't the employee's to take." },
  ];
  const d3 = [
    { text: "Escalate quietly to HR, legal and IR — not a queue the suspect can read", why: "" },
    { text: "Open a normal ticket and assign it in the shared queue like any case", why: "The suspect may see a shared queue; insider cases go through a restricted channel." },
    { text: "Confront the user directly to ask why they uploaded the files", why: "Confronting tips them off and risks the evidence; escalate quietly first." },
    { text: "Post it in the team chat so everyone can help investigate quickly", why: "Team chat is where a suspect might see it; keep it need-to-know." },
    { text: "Disable the account company-wide immediately so all can see access is pulled", why: "A sudden visible lockout tips them off; coordinate the timing quietly." },
    { text: "Email the manager and copy the user asking both to explain the upload", why: "Copying the suspect defeats the point; escalate out of their sight." },
  ];
  const d4 = [
    { text: "Preserve the DLP, sign-in and upload logs under chain of custody", why: "" },
    { text: "Wipe the user's laptop so the files can't be taken further after they leave", why: "Wiping destroys the evidence HR and legal need; preserve, don't wipe." },
    { text: "Just note it in the ticket; the logs will still be there later if needed", why: "Insider cases often become legal; preserve now, under custody." },
    { text: "Ask the user to hand over their personal account so files can be deleted", why: "The SOC can't reach it, and asking tips them off; preserve company-side." },
    { text: "Take screenshots of the DLP dashboard as a complete record", why: "Screenshots are summaries; preserve the underlying logs under custody." },
    { text: "Export everything to a shared drive so anyone can pick the case up", why: "A shared drive breaks custody and confidentiality; use a controlled store." },
  ];
  const d5 = [
    { text: "Report insider exfiltration, scope what left, let HR and legal decide", why: "" },
    { text: "Conclude the user is a thief and recommend dismissal and prosecution", why: "The verdict and response are HR's and legal's; report the facts and scope." },
    { text: "Close it as a policy breach for the exit interview to cover later", why: "Gigabytes to a competitor needs immediate handling, documented now." },
    { text: "Merge it into another incident and close them together for the night", why: "Keep the insider case on its own track; don't fold it into another." },
    { text: "Leave it open with no conclusion until the user is interviewed first", why: "Report the facts and scope now; the interview is HR's step, not a blocker." },
    { text: "Close it unproven, since you can't see inside the personal account", why: "Company-side evidence proves what was copied; report that, note the gap." },
  ];
  return ticket({ id: `PRAC-14-${n}`, type: 14, tier: 4, time: "14:05:00", sev: "high",
    alert: `Large upload to personal storage at ${client}`, source: "DLP", client, entity: who, attack: "T1567.002",
    facts: [["User", who], ["Upload", "code and a customer list"], ["Context", "resigned, joining a rival"]],
    tabs: [{ title: "DLP", kind: "kv", pairs: [["User", who], ["Upload", "code + customer list"], ["Session", "on-site, interactive"], ["HR", "resigned, joining a competitor, access active"]] }],
    search: { query: `source=dlp client="${client}" user="${who}"`, say: "The upload the DLP flagged." },
    guide: ["Who is behind it?", "Malicious or careless?", "How is an insider case handled?", "Preserve what?", "The closing position."],
    fizban: "A large upload — likely an external attacker who stole the account. Recommend adding it to another incident.",
    decisions: [board("d1", (n % 6) + 1, "Who is behind the upload?", d1, 0, ["Where did they sign in from, on what device?", "A session from the office, on their own laptop, points to the owner."], "Attribution reads the session: interactive, on site, on a managed device is the user themselves."),
      board("d2", ((n + 1) % 6) + 1, "Malicious or careless?", d2, 0, ["Line up HR context with what was copied.", "Say what it's consistent with; leave the verdict to deciders."], "State what the evidence is consistent with — intentional exfiltration — without pronouncing guilt."),
      board("d3", ((n + 2) % 6) + 1, "How is it handled?", d3, 0, ["Who must not find out they're investigated?", "Keep it away from anywhere the person could see it."], "Insider cases escalate quietly to HR, legal and IR through a restricted channel."),
      board("d4", ((n + 3) % 6) + 1, "Preserve what?", d4, 0, ["This may become a legal matter.", "Keep the records intact, with a record of who handled them."], "Preserve the DLP, identity and upload logs under a documented chain of custody."),
      board("d5", ((n + 4) % 6) + 1, "Closing position?", d5, 0, ["Report and scope; leave the verdict to deciders.", "Say what left; mark what you can't see."], "Report what the evidence supports and scope what left; HR and legal adjudicate.")],
    writeup: `DLP flagged ${who} at ${client} uploading source code and a customer list to personal storage after an on-site interactive sign-in; HR shows a resignation and a move to a competitor with access still active. Consistent with intentional exfiltration. Escalated quietly to HR, legal and IR; logs preserved under chain of custody. Could not be confirmed: what the user did with the files in the personal account.`,
    summary: [["1.2", "Attributed to the account owner", "Indicators across identity", "Insider · interactive session"], ["3.3", "Preserved under custody", "Evidence handling", "Chain of custody"], ["3.4", "Escalated quietly", "Escalation for insiders", "Restricted channel"]],
    proofs: [{ query: `source=dlp client="${client}" user="${who}"`, says: "a large upload to personal storage was flagged", check: (rr) => rr.count === 1 && rr.rows[0].bytes >= 1000000000 },
      { query: `source=signin client="${client}" user="${who}" type=interactive`, says: "an on-site interactive sign-in", check: (rr) => rr.count === 1 && rr.rows[0].geo === "Office" }],
    events: ev, now });
}

/* =====================================================================
   TYPE 15 — supply chain / BEC
   Tier 4 (5 decisions).
   ===================================================================== */
function type15(n) {
  const r = rngOf("t15-" + n); const client = pick(r, CLIENTS), d = dom[client];
  const now = `2026-12-${String(1 + (n % 20)).padStart(2, "0")}T07:00:00Z`;
  const sup = "parts-supplier.example", look = "parts-supplier-billing.example";
  const ev = [{ time: now.replace("07:00", "07:02"), source: "mail", client, from: `accounts@${sup}`, subject: "Updated remittance — new bank details", spf: `pass (${sup})`, dkim: `pass (${sup})`, dmarc: `pass (${sup})`, reply_to: `accounts@${look}`, body_summary: "asks the next payment go to a new account, urgent" },
    { time: now.replace("07:00", "07:05"), source: "intel", indicator: look, verdict: "no verdicts yet", registered: now.slice(0, 8) + "01", resolves_to: docIp(r, "198.51.100") },
    { time: now.replace("07:00", "07:10"), source: "finance", client, event: "payment change requested", status: "held pending verification", note: "no malware; a request to move money" }];
  const d1 = [
    { text: "Business email compromise: a supplier mailbox redirecting a payment", why: "" },
    { text: "A genuine remittance update, since it comes from the real address and passes auth", why: "The reply-to is a lookalike domain and the request is urgent — the BEC tells." },
    { text: "A malware attack, so scan the recipient's machine for the payload that sent it", why: "There's no attachment or link; nothing runs. It's a fraud request." },
    { text: "A false positive from the fraud filter, since suppliers change bank details", why: "Not from a lookalike reply-to with urgency and no verification; that's fraud." },
    { text: "Internal fraud by a staff member who knew a payment was due", why: "The request comes from the supplier's mailbox, not a staff account." },
    { text: "Spam about invoices that can simply be deleted and ignored", why: "It targets a real payable to a real supplier; deleting it ignores active fraud." },
  ];
  const d2 = [
    { text: "The reply-to is a lookalike domain registered only a few days ago", why: "" },
    { text: "It passed SPF, DKIM and DMARC, which is suspicious for a real supplier", why: "Passing auth is normal; the tell is the lookalike reply-to, not the pass." },
    { text: "It was marked urgent, and urgency alone proves it's fraudulent", why: "Urgency is a flag, not proof; the lookalike reply-to is the decisive tell." },
    { text: "It has no attachment, which a real invoice email would always include", why: "A remittance update needn't carry a file; that's not the tell." },
    { text: "It replies to an earlier thread, showing the mailbox was read", why: "The concrete tell is the lookalike reply-to domain, not the threading." },
    { text: "The old account is long-standing, and old accounts never change", why: "They do sometimes; the reliable tell is where the reply is routed." },
  ];
  const d3 = [
    { text: "Hold the change and verify with the supplier on the number on file", why: "" },
    { text: "Update the account but send a small test payment first to check it", why: "A test still sends money to the attacker; verify out of band first." },
    { text: "Reply to the email asking them to confirm the new bank details", why: "The reply goes to the attacker's lookalike domain; use the known number." },
    { text: "Approve it because it's from the real address, then review if it bounces", why: "By then the money is gone; verify before paying." },
    { text: "Call the number in the email's signature to confirm the change", why: "The signature's number can be the attacker's; use the number on file." },
    { text: "Cancel all payments to the supplier indefinitely until it's resolved", why: "Real invoices are owed; verify and pay the correct account." },
  ];
  const d4 = [
    { text: "The same compromised supplier as any recent malware: one campaign", why: "" },
    { text: "Nothing links it to anything; a bank-change email stands alone", why: "A compromised supplier mailbox enables several frauds; link them." },
    { text: "It shares the lookalike domain with every message the supplier sent", why: "Only the reply-to here uses the lookalike; the link is the mailbox." },
    { text: "It only targets one employee, so it's about that person, not the supplier", why: "The common thread is the supplier's mailbox, not the recipient." },
    { text: "It's coincidence that fraud and the supplier appear the same week", why: "Same mailbox, same supplier is a campaign, not coincidence." },
    { text: "DMARC failing is the common link across the supplier's messages", why: "Both pass DMARC because they use the real domain; the link is the mailbox." },
  ];
  const d5 = [
    { text: "Escalate to the finance approver and IR with the tells; they decide", why: "" },
    { text: "Decide yourself it's fraud and formally reject the change in the system", why: "The analyst supplies evidence; the payment decision is the client's." },
    { text: "Tell the supplier to fix their mailbox and consider it closed", why: "The supplier must remediate, but the client still has a held payment to decide." },
    { text: "Report the attacker's bank account to the police yourself", why: "That's the client's and its bank's call with counsel; escalate the facts." },
    { text: "Wait for the real supplier contact to notice and get in touch", why: "A mailbox rule may hide it from them; escalate now with what you have." },
    { text: "Post it in the finance chat for whoever is on shift to handle", why: "This needs a named approver and IR, not an open chat." },
  ];
  return ticket({ id: `PRAC-15-${n}`, type: 15, tier: 4, time: "07:02:00", sev: "high",
    alert: `Supplier bank-change request at ${client}`, source: "Mail", client, entity: "accounts payable", attack: "T1657",
    facts: [["From", `accounts@${sup}`], ["Reply-to", look], ["Asks", "new bank details, urgent"]],
    tabs: [{ title: "The email", kind: "kv", pairs: [["From", `accounts@${sup}`], ["SPF/DKIM/DMARC", "pass/pass/pass"], ["Reply-to", `accounts@${look}`], ["Ask", "new bank details, urgent"]] }],
    search: { query: `source=finance client="${client}"`, say: "The payment-change request and its status." },
    guide: ["What is being asked?", "The tell.", "Stop the money.", "What it links to.", "Who decides."],
    fizban: "From the real address and passes auth — likely a genuine update. Recommend updating the details.",
    decisions: [board("d1", (n % 6) + 1, "What is this?", d1, 0, ["Compare the from and reply-to addresses.", "Money to a new account, urgently, is the BEC signature."], "BEC redirects a real payment, often with no malware; the tells are urgency, a changed account, and a lookalike reply-to."),
      board("d2", ((n + 1) % 6) + 1, "The strongest tell?", d2, 0, ["Where would a reply actually go?", "The from can be genuine and the reply routed to the attacker."], "In BEC the from may be genuine but the reply-to is a lookalike; read reply-to, not just from."),
      board("d3", ((n + 2) % 6) + 1, "About the payment?", d3, 0, ["How do you confirm through a channel the attacker can't touch?", "Never verify using details from the message."], "Verify payment changes out of band, on a number you already had."),
      board("d4", ((n + 3) % 6) + 1, "What does it link to?", d4, 0, ["What do the supplier's messages have in common?", "One compromised mailbox enables several frauds."], "A single compromised mailbox enables several frauds; linking them scopes the whole incident."),
      board("d5", ((n + 4) % 6) + 1, "Who decides?", d5, 0, ["Whose money is it?", "The analyst hands evidence; the client decides."], "BEC escalates to the client's approver and IR; the client, its bank and counsel act on the money.")],
    writeup: `Supplier bank-change request at ${client} from ${sup} with the reply-to switched to a lookalike (${look}) registered days ago, urgent — business email compromise, no malware. Payment held. Recommended verifying on the number on file and escalating to the finance approver and IR. Could not be confirmed: whether an earlier payment was already redirected.`,
    summary: [["1.2", "Read the reply-to tell", "Indicators across email", "BEC · lookalike domain"], ["3.2", "Held the payment, escalated", "IR for a fraud without malware", "Containment"], ["3.4", "Escalated to the approver", "Escalation", "Functional escalation"]],
    proofs: [{ query: `source=finance client="${client}"`, says: "the payment change was held", check: (rr) => rr.count === 1 && /held/.test(rr.rows[0].status) },
      { query: `source=intel indicator=${look}`, says: "the reply-to domain is newly registered", check: (rr) => rr.count === 1 && /example/.test(rr.rows[0].indicator) }],
    events: ev, now });
}

/* =====================================================================
   TYPE 16 — reporting and metrics
   Tier 5 (6 decisions).
   ===================================================================== */
function type16(n) {
  const r = rngOf("t16-" + n);
  const now = `2026-12-${String(15 + (n % 13)).padStart(2, "0")}T06:00:00Z`;
  const mttd = 18 + n, mttr = 35 + n, fp = 55 + (n % 15), overdue = 1 + (n % 3);
  const ev = [{ time: now, source: "metric", kpi: "MTTD", value_min: mttd }, { time: now, source: "metric", kpi: "MTTR", value_min: mttr },
    { time: now, source: "metric", kpi: "false positive rate", value_pct: fp }, { time: now, source: "metric", kpi: "open critical vulns past SLA", value: overdue },
    { time: now, source: "isp", provider: "Optic Light Fibre", notice: "a maintenance notice arrived three days late, explaining a detection spike" }];
  const d1 = [
    { text: "Context: most alerts are noise, so tuning and correlation pay off next", why: "" },
    { text: "As a failure of the SOC, since over half of what it handles is nothing", why: "A high FP rate is normal; it's a tuning opportunity, not a failure to confess." },
    { text: "Hide it, since a number over half looks bad to the board", why: "Hiding it is dishonest and loses the case for tuning; give it with context." },
    { text: "As proof the sensors are too sensitive and should all be turned down", why: "Blanket desensitising misses real attacks; targeted tuning is the read." },
    { text: "As the single most important number, above detection and response times", why: "It's one figure among several; frame it with context, not as the headline." },
    { text: "As meaningless, since false positives are just part of the job", why: "It points to where tuning pays off; give context, don't dismiss it." },
  ];
  const d2 = [
    { text: "Metrics need context — a spike from an outage isn't a security failure", why: "" },
    { text: "The ISP is unreliable and should be dropped for causing false alerts", why: "The lesson is about context, not the supplier." },
    { text: "Delete the month's metrics, since the outage corrupted them", why: "Annotate, don't delete; the spike is explainable with context." },
    { text: "Detection time doesn't matter, since a fast detection of nothing is worthless", why: "It matters; the lesson is numbers need context, not that MTTD is worthless." },
    { text: "Stop reporting MTTD, since outages always distort it", why: "Annotate the outage; don't stop measuring." },
    { text: "Nothing — the outage was resolved, so it has no bearing on the metrics", why: "It explains a spike that would otherwise look like an incident." },
  ];
  const d3 = [
    { text: "The picture, the risks and decisions, metrics in context", why: "" },
    { text: "Every log line from the quarter so the board sees the full detail", why: "The board needs the picture and decisions, not raw logs." },
    { text: "Only the good numbers, presented as an unqualified success", why: "Honest reporting includes the FP rate and the overdue criticals." },
    { text: "A deep technical write-up of each incident's techniques", why: "That's the technical audience's report, not the board's." },
    { text: "A single overall score so the board has one number to judge by", why: "One score hides the risks and decisions; give the picture with context." },
    { text: "The same report the technical team gets, to save time", why: "One document for all audiences serves none well; tailor it." },
  ];
  const d4 = [
    { text: "Overdue criticals need funding or a formally accepted risk", why: "" },
    { text: "Nothing — the report is just information and needs no decision", why: "A good report asks for the decisions only the board can make." },
    { text: "A bigger budget, as the single ask regardless of the findings", why: "Tie the ask to the findings: the overdue criticals." },
    { text: "Which analyst to promote, since a report is the place to raise it", why: "That's internal management, not the risk decision this report surfaces." },
    { text: "Which client to drop, since some cost more than others", why: "Not a decision this report supports, nor the SOC's call." },
    { text: "Whether to keep the AI assistant after a poor quarter", why: "That's a governance item elsewhere; the decision is the overdue criticals." },
  ];
  const d5 = [
    { text: "MTTD and MTTR measure how fast we detect and respond; report both", why: "" },
    { text: "MTTD and MTTR are the same thing measured twice, so report only one", why: "Detect and respond are different stages; report both." },
    { text: "MTTR alone matters, since responding is all that counts in the end", why: "Detection speed matters too; a slow detection delays everything after." },
    { text: "Neither matters if the false-positive rate is high, so drop them", why: "They still measure real performance; keep them with context." },
    { text: "Report them without context, since the numbers speak for themselves", why: "Raw numbers mislead; the outage spike is the proof they need context." },
    { text: "Replace them with the raw ticket count, which is simpler to explain", why: "Volume hides speed and quality; MTTD/MTTR with context are the measures." },
  ];
  const d6 = [
    { text: "Tailor it: decisions for the board, detail for the engineers", why: "" },
    { text: "One report for everyone, to keep a single source of truth", why: "One document for all audiences serves none; tailor per reader." },
    { text: "Only a board report, since the technical team lived the incidents", why: "The technical team needs the specifics and fixes written down too." },
    { text: "Only a technical report, since the board won't read the detail", why: "The board needs the picture and decisions; write for them too." },
    { text: "Whatever's fastest to produce, since reporting is overhead", why: "Reporting is the deliverable at this tier; tailor it to land." },
    { text: "A raw dashboard export for both, since the data is the report", why: "Data isn't analysis; tailor the message to each audience." },
  ];
  return ticket({ id: `PRAC-16-${n}`, type: 16, tier: 5, time: "06:00:00", sev: "medium",
    alert: `Quarterly report to leadership`, source: "Reporting", client: "All clients", entity: "quarterly report", attack: "",
    facts: [["MTTD", mttd + "m"], ["MTTR", mttr + "m"], ["FP", fp + "%"]],
    tabs: [{ title: "Metrics", kind: "table", columns: ["KPI", "Value"], rows: [["MTTD", mttd + " min"], ["MTTR", mttr + " min"], ["FP rate", fp + "%"], ["Overdue criticals", String(overdue)]] }],
    search: { query: "source=metric | table kpi value_min value_pct value", say: "The quarter's metrics." },
    guide: ["How do you read the FP rate?", "What does the late ISP notice teach?", "Write it for the board.", "The decision to surface.", "What MTTD/MTTR measure.", "Tailor per audience."],
    fizban: "MTTD and MTTR look solid. Recommend reporting them as a clear success with no caveats.",
    decisions: [board("d1", (n % 6) + 1, "How do you read the FP rate for the board?", d1, 0, ["Is a high FP rate unusual? What does it point to?", "Numbers for leadership come with meaning and a next step."], "Metrics for leadership carry context and a next step; a high FP rate is the case for tuning, not a confession."),
      board("d2", ((n + 1) % 6) + 1, "What does the late ISP notice teach?", d2, 0, ["The flood spiked the numbers, but wasn't an attack.", "A number without its story misleads."], "Metrics need context: a spike from an outage isn't a security failure; annotate it."),
      board("d3", ((n + 2) % 6) + 1, "How do you write it for the board?", d3, 0, ["What does a board act on?", "Outcomes, exposure, and what they alone can choose."], "Reporting is tailored: the board needs the picture, risks and decisions, not raw logs."),
      board("d4", ((n + 3) % 6) + 1, "What decision do you surface?", d4, 0, ["Which item can only leadership settle?", "Overdue criticals: fund the fix or formally accept the risk."], "Put the decision only the board can make in front of them: fund the fix or accept the risk."),
      board("d5", ((n + 4) % 6) + 1, "What do MTTD and MTTR measure?", d5, 0, ["Detect and respond are different stages.", "Report both, with context."], "MTTD is detection speed, MTTR response speed; both matter and both need context."),
      board("d6", ((n + 5) % 6) + 1, "How many reports?", d6, 0, ["Does one document serve a board and engineers equally?", "Tailor per audience."], "Reporting is tailored per audience: outcomes for the board, detail for the technical team.")],
    writeup: `Quarterly report: MTTD ${mttd}m, MTTR ${mttr}m, FP ${fp}% (normal; the case for tuning), ${overdue} open critical vuln(s) past SLA. A detection spike this quarter was an ISP outage, annotated so it isn't misread. Decision requested: resource or accept the risk on the overdue critical(s). Could not be confirmed: whether context is complete for every spike without the operational notes.`,
    summary: [["4.1", "Wrote metrics with context", "VM and security reporting", "Scorecard · audience"], ["4.2", "Surfaced a real decision", "Reporting, metrics, KPIs", "MTTD · MTTR · context"]],
    proofs: [{ query: "source=metric | stats count", says: "the quarter's KPIs are recorded", check: (rr) => rr.count === 1 && rr.rows[0].count >= 4 },
      { query: "source=isp", says: "a late notice explains a spike", check: (rr) => rr.count === 1 && /late/.test(rr.rows[0].notice) }],
    events: ev, now });
}

/* =====================================================================
   TYPE 17 — automation, SOAR, AI governance
   Tier 5 (6 decisions).
   ===================================================================== */
function type17(n) {
  const r = rngOf("t17-" + n);
  const now = `2026-12-${String(15 + (n % 13)).padStart(2, "0")}T08:00:00Z`;
  const ev = [{ time: now.replace("08:00", "08:10"), source: "soar", playbook: "phishing-response", step: "check reputation", result: "no reputation (new domain) → closed as not malicious" },
    { time: now.replace("08:00", "08:12"), source: "soar", playbook: "phishing-response", step: "block URL", result: "once blocked a client's own payment page" },
    { time: now.replace("08:00", "07:30"), source: "bas", technique: "OAuth consent grant", detection: "missed" },
    { time: now.replace("08:00", "07:32"), source: "bas", technique: "data staged to cloud", detection: "missed" },
    { time: now.replace("08:00", "07:31"), source: "bas", technique: "credential access", detection: "detected" },
    { time: now.replace("08:00", "06:00"), source: "aiquality", assistant: "Fizban", agreement_with_analyst: 0.70, note: "dropped after an unreviewed model update" }];
  const d1 = [
    { text: "A new domain has no reputation, so it's wrongly closed as safe", why: "" },
    { text: "Nothing — if a URL has no bad reputation, it's safe and closing it is correct", why: "New attacker domains have no reputation yet; 'none' isn't 'good'." },
    { text: "It should block every URL that isn't explicitly known-good", why: "That blocks legitimate new sites; route unknowns to a sandbox or analyst." },
    { text: "The reputation check is too slow and times out, closing the alert", why: "The issue is treating 'no reputation' as safe, not a timeout." },
    { text: "It relies on one feed; adding feeds would fix the branch completely", why: "No feed has a brand-new domain; the fix is an 'unknown' branch." },
    { text: "The branch is fine; it just doesn't notify the user of the closure", why: "The core flaw is closing unknowns as safe, not notification." },
  ];
  const d2 = [
    { text: "It blocks with no human check, and once hit a real payment page", why: "" },
    { text: "Blocking a URL is always safe to automate, so there's no danger", why: "It once blocked a client's payment page; destructive steps need a check." },
    { text: "It's too slow to block in time while the checks run", why: "The problem is blocking the wrong thing with no approval, not speed." },
    { text: "It blocks one URL at a time when it should block the whole domain", why: "Blocking more aggressively without a check makes the blast radius worse." },
    { text: "It logs the block, tipping the attacker off", why: "Logging isn't the danger; auto-blocking without approval is." },
    { text: "It doesn't also block the sender, so a fresh URL arrives next", why: "A coverage point, but the live danger is the unapproved destructive action." },
  ];
  const d3 = [
    { text: "Two real gaps — OAuth consent and cloud staging aren't detected", why: "" },
    { text: "Nothing useful — most techniques were detected, so the sensors are fine", why: "A missed technique is a missed real attack; the gaps matter." },
    { text: "The sensors are completely broken, since a simulation ran at all", why: "Most were detected; specific gaps need closing, not a rebuild." },
    { text: "The simulation tool is unsafe and shouldn't run on production", why: "BAS is a standard, safe way to test detections; it did its job." },
    { text: "Credential access and scheduled tasks need new detections", why: "Those were detected; the misses are OAuth consent and cloud staging." },
    { text: "The missed techniques don't matter, since they were only simulated", why: "A missed simulation is a missed real attack; those are the finding." },
  ];
  const d4 = [
    { text: "Add an unknown branch, approval before blocking, and mailbox cleanup", why: "" },
    { text: "Turn the playbook off and handle every phishing report by hand", why: "Automation is valuable; fix the gaps rather than abandoning it." },
    { text: "Add more reputation feeds so the branch becomes reliable", why: "Feeds won't cover brand-new domains; add an unknown branch." },
    { text: "Automate everything further, including auto-resetting anyone who clicked", why: "More unchecked automation widens the blast radius; add approval." },
    { text: "Just add approval before blocking and leave the other gaps for later", why: "Approval is one of three fixes; do the unknown branch and cleanup too." },
    { text: "Replace the whole SOAR platform, since the playbook has gaps", why: "The platform is fine; the playbook design is fixable." },
  ];
  const d5 = [
    { text: "Fizban drifted after an unreviewed update; trust the evidence", why: "" },
    { text: "Fizban is fine; the drop is just normal variation in its accuracy", why: "The drop follows an unreviewed model update; that's drift, not noise." },
    { text: "Turn Fizban off permanently, since it can't be trusted at all now", why: "The fix is governance — evaluate updates — not abandoning the tool." },
    { text: "Trust Fizban's verdict, since the analysts may simply be wrong", why: "The drop tracks the update; check the raw evidence yourself." },
    { text: "Retrain Fizban on more data to fix the drop by itself", why: "The fix is evaluating updates before release, not more data alone." },
    { text: "Let Fizban check its own answers before showing them", why: "A drifting model checking itself isn't independent; humans confirm." },
  ];
  const d6 = [
    { text: "Test models first, treat fields as data, confirm AI actions", why: "" },
    { text: "Tell the vendor to stop updating without warning, and call it fixed", why: "You can't rely on the vendor alone; require your own evaluation." },
    { text: "Have Fizban double-check itself to catch its own mistakes", why: "A drifting model isn't an independent check; humans confirm." },
    { text: "Add training data so Fizban ignores malicious log fields itself", why: "More data won't reliably stop injection; treat fields as data." },
    { text: "Roll back and never update the model again", why: "Updates are needed; evaluate them before release, don't freeze forever." },
    { text: "Let Fizban approve its own updates, since it knows the SOC best", why: "That removes the human control that's the whole point." },
  ];
  return ticket({ id: `PRAC-17-${n}`, type: 17, tier: 5, time: "08:10:00", sev: "medium",
    alert: `Fix the automation and check AI governance`, source: "Automation review", client: "Internal", entity: "phishing-response playbook", attack: "",
    facts: [["Playbook", "gaps in branches and approval"], ["BAS", "two detections missed"], ["Fizban", "accuracy dropped after an update"]],
    tabs: [{ title: "Playbook", kind: "flow", steps: [{ kind: "action", label: "Check reputation" }, { kind: "gap", label: "'No reputation' → closed (no unknown branch)" }, { kind: "action", label: "Block URL", note: "no approval" }, { kind: "gap", label: "No mailbox cleanup; no click/submit check" }] },
      { title: "Simulation", kind: "table", columns: ["Technique", "Detection"], rows: [["OAuth consent grant", "MISSED"], ["cloud staging", "MISSED"], ["credential access", "detected"]] }],
    search: { query: "source=bas detection=missed | stats count", say: "How many detections the simulation missed." },
    guide: ["The 'not malicious' branch.", "The blast radius.", "What the simulation found.", "Fix the playbook.", "Fizban's drift.", "The governance fix."],
    fizban: "The playbook ran without errors and my accuracy is fine. Recommend leaving everything as it is.",
    decisions: [board("d1", (n % 6) + 1, "What's wrong with the 'not malicious' branch?", d1, 0, ["What does a brand-new attacker domain's reputation look like?", "Three answers: malicious, safe, unknown."], "Reputation lags; a playbook needs an 'unknown' branch or it closes the newest attacks as safe."),
      board("d2", ((n + 1) % 6) + 1, "The danger in the block step?", d2, 0, ["What did the automatic block once hit?", "A destructive step needs a human check."], "Automation has a blast radius; a destructive step needs human approval."),
      board("d3", ((n + 2) % 6) + 1, "What did the simulation reveal?", d3, 0, ["Which techniques say MISSED?", "The misses line up with real incidents."], "Breach-and-attack simulation proves which detections fire; the misses are the priority to build."),
      board("d4", ((n + 3) % 6) + 1, "How to fix the playbook?", d4, 0, ["Three gaps: close all three.", "Keep the automation; add the branch, approval and cleanup."], "Fix the flow: an unknown branch, approval before destructive steps, mailbox cleanup and click/submit checks."),
      board("d5", ((n + 4) % 6) + 1, "What about Fizban's drift?", d5, 0, ["Line the drop up with the change log.", "Don't trust a drifting, unreviewed model."], "AI drifts, especially after an unreviewed update; check the raw evidence, don't trust the verdict."),
      board("d6", ((n + 5) % 6) + 1, "The governance fix?", d6, 0, ["Three failures: an untested update, over-trust, unchecked action.", "Fix with governance, not more AI."], "AI governance: evaluate model changes before release, treat data as data, and keep a human confirming every action.")],
    writeup: `Automation review: the phishing playbook closes new domains as safe (no unknown branch), blocks without approval (once hit a real payment page), and doesn't clean mailboxes or check who acted. A simulation missed OAuth consent and cloud staging. Fizban's agreement dropped after an unreviewed model update. Fixed the flow, prioritised the detection gaps, and set governance: evaluate updates, treat fields as data, confirm every AI action. Could not be confirmed: whether earlier runs closed other new domains as safe.`,
    summary: [["1.5", "Fixed automation and ran a simulation", "Efficiency and process improvement", "SOAR · breach-and-attack simulation"], ["1.6", "Caught AI drift and set governance", "AI in security operations", "Model drift · human in the loop"]],
    proofs: [{ query: "source=bas detection=missed | stats count", says: "the simulation missed two detections", check: (rr) => rr.count === 1 && rr.rows[0].count === 2 },
      { query: "source=aiquality assistant=Fizban", says: "Fizban's accuracy dropped after an update", check: (rr) => rr.count === 1 && rr.rows[0].agreement_with_analyst < 0.9 }],
    events: ev, now });
}

const MAKERS = { 1: type1, 2: type2, 3: type3, 4: type4, 5: type5, 6: type6, 7: type7, 8: type8, 9: type9, 10: type10, 11: type11, 12: type12, 13: type13, 14: type14, 15: type15, 16: type16, 17: type17 };

export const PRACTICE_TYPES = [
  { id: 1, name: "Identity alert triage", firstTier: "Tier 1" },
  { id: 2, name: "User-reported phishing", firstTier: "Tier 1" },
  { id: 3, name: "Noise and closing well", firstTier: "Tier 1" },
  { id: 8, name: "Beaconing and C2", firstTier: "Tier 1" },
  { id: 4, name: "Vulnerability prioritisation", firstTier: "Tier 2" },
  { id: 5, name: "Scan method and tuning", firstTier: "Tier 2" },
  { id: 6, name: "Baselines and compliance", firstTier: "Tier 2" },
  { id: 7, name: "Cloud posture", firstTier: "Tier 2" },
  { id: 9, name: "Endpoint process tree", firstTier: "Tier 3" },
  { id: 10, name: "Web attacks: attempt vs success", firstTier: "Tier 3" },
  { id: 11, name: "Threat hunting and intel", firstTier: "Tier 3" },
  { id: 12, name: "Alert flood and correlation", firstTier: "Tier 3" },
  { id: 13, name: "Incident handling", firstTier: "Tier 4" },
  { id: 14, name: "Insider and exfiltration", firstTier: "Tier 4" },
  { id: 15, name: "Supply chain and BEC", firstTier: "Tier 4" },
  { id: 16, name: "Reporting and metrics", firstTier: "Tier 5" },
  { id: 17, name: "Automation, SOAR and AI governance", firstTier: "Tier 5" },
];

export function practiceTickets() {
  const out = [];
  for (const p of PRACTICE_TYPES) for (let n = 0; n < 10; n++) out.push(MAKERS[p.id](n));
  /* spread the right answer's slot evenly across every practice board, as the
     story does with authored slots, so no position becomes a tell */
  let i = 0;
  for (const tk of out) for (const d of tk.decisions) d.slot = (i++ % 6) + 1;
  return out;
}
