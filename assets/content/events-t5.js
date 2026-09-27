/* =====================================================================
   TIER 5 — MATURITY. Log data for Monday 22 December 2026, clock 09:00.
   Efficiency, automation, AI governance, and reporting to leadership.
   Evidence stays at the analyst level throughout.

   ATT&CK IDs checked against MITRE Enterprise v19.2.
   ===================================================================== */
export const NOW = "2026-12-22T09:00:00Z";
const t = (m, d, hh, mm, ss = 0) => `2026-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}Z`;
const E = [];

/* ---- VOO-5029: quality review of Caramon's closures -------------------- */
const clos = [
  ["VOO-4881", "Steadfast Outpost Thrift", "benign", 4, "true", "volunteer typo"],
  ["VOO-4884", "Steadfast Outpost Thrift", "benign", 3, "true", "POS update"],
  ["VOO-4890", "OEF Fuel Roasters", "false positive", 5, "true", "WAF blocked probe"],
  ["VOO-4893", "Payne School", "benign", 6, "true", "duplicate report"],
  ["VOO-4897", "No Go Smile", "false positive", 4, "true", "known scanner"],
  ["VOO-4901", "Nexxuss", "benign", 3, "false", "closed a repeat-failed-MFA alert without checking the consent grants"],
  ["VOO-4905", "Vanguard Auto Detailing", "benign", 5, "true", "approved remote tool"],
  ["VOO-4908", "OEF Fuel Roasters", "false positive", 2, "true", "ordinary traffic"],
];
clos.forEach(([id, client, disp, mins, ok, note]) =>
  E.push({ time: t(12, 19, 10, 0), source: "case", analyst: "caramon", ref: id, client, disposition: disp, minutes_to_close: mins, correct: ok, note }));
E.push({ time: t(12, 19, 9, 0), source: "target", metric: "MTTR target", value: "15 minutes", note: "Tanis set a mean-time-to-resolve target for Tier 1 this quarter" });
E.push({ time: t(12, 19, 9, 1), source: "target", metric: "Caramon average close time", value: "4 minutes", note: "well under target" });

/* ---- VOO-5030: the phishing SOAR playbook ------------------------------ */
E.push({ time: t(12, 22, 8, 10), source: "soar", playbook: "phishing-response", run: "#4471", step: "check URL reputation", result: "no reputation (new domain)", branch_taken: "treated as not malicious → closed", note: "a brand-new domain has no reputation; there is no 'unknown' branch" });
E.push({ time: t(12, 22, 8, 12), source: "soar", playbook: "phishing-response", run: "#4471", step: "block URL", result: "n/a", note: "no step removes the mail from other recipients; no step asks who clicked or submitted" });
E.push({ time: t(12, 22, 8, 14), source: "soar", playbook: "phishing-response", run: "#4460", step: "block URL", result: "blocked the client's own payment page once", note: "no human approval before a destructive action" });
/* breach-and-attack simulation results */
[["credential access", "detected"], ["persistence via scheduled task", "detected"], ["OAuth consent grant", "missed"], ["data staged to cloud", "missed"], ["shadow copy deletion", "detected"]].forEach(([tech, res], i) =>
  E.push({ time: t(12, 22, 7, 30 + i), source: "bas", tool: "breach-and-attack simulation", technique: tech, detection: res }));

/* ---- VOO-5031: report to leadership; the three campaigns --------------- */
E.push({ time: t(12, 22, 6, 0), source: "metric", kpi: "MTTD", value_min: 22, period: "this quarter", note: "mean time to detect" });
E.push({ time: t(12, 22, 6, 0), source: "metric", kpi: "MTTR", value_min: 41, period: "this quarter", note: "mean time to respond" });
E.push({ time: t(12, 22, 6, 0), source: "metric", kpi: "false positive rate", value_pct: 61, period: "this quarter" });
E.push({ time: t(12, 22, 6, 0), source: "metric", kpi: "open critical vulns past SLA", value: 2, period: "now" });
/* the three campaigns as an intel roll-up */
[["The Seekers", "identity", "Nexxuss, Payne School, OEF", "spraying, MFA fatigue, consent apps, stuffing"],
 ["Bozak", "web", "OEF, Ironclad", "Joomla flaw, store plugin, traversal, one tool fingerprint across clients"],
 ["Sivak", "impersonation", "Payne School, Ironclad via Zumroh, Vanguard", "lookalike domains, cloned voice, compromised supplier"]].forEach(([actor, cap, victims, notes]) =>
  E.push({ time: t(12, 22, 6, 5), source: "campaign", adversary: actor, capability: cap, victims, infrastructure: "documented per ticket", notes }));
E.push({ time: t(12, 15, 14, 0), source: "isp", provider: "Optic Light Fibre", notice: "Planned maintenance notice for 12 Dec arrived on 15 Dec — three days late", note: "why metrics need context: the outage looked like an incident until the notice caught up" });

/* ---- VOO-5032: Fizban drift, prompt injection, DDoS smokescreen ------- */
[["1 Dec", 0.94], ["8 Dec", 0.93], ["15 Dec", 0.71], ["22 Dec", 0.68]].forEach(([d, acc]) =>
  E.push({ time: t(12, Number(d.split(" ")[0]), 6, 0), source: "aiquality", assistant: "Fizban", agreement_with_analyst: acc, note: d === "15 Dec" ? "a quiet model update landed on 14 Dec" : "" }));
E.push({ time: t(12, 14, 3, 0), source: "change", system: "Fizban", event: "model updated by vendor", approved_by: "not reviewed by the SOC", note: "no evaluation run before it went live" });
/* prompt injection: described at the analyst level, no payload text reproduced */
E.push({ time: t(12, 22, 8, 40), source: "web", client: "OEF Fuel Roasters", host: "shop.oeffuel.example", field: "user-agent", note: "a request's user-agent field carried text written to look like an instruction to the AI assistant, not a browser string", assistant_effect: "Fizban's summary of the alert repeated the planted text and called the activity benign", attack: "T1071.001" });
E.push({ time: t(12, 22, 8, 41), source: "monitor", client: "OEF Fuel Roasters", alert: "traffic flood on the store", kind: "network denial of service", attack: "T1498", note: "loud, obvious — arrived at the same time as the quiet login attempts" });
E.push({ time: t(12, 22, 8, 42), source: "store", client: "OEF Fuel Roasters", event: "login", account: "admin-oef@oeffuel.example", result: "success", src_ip: "198.51.100.199", note: "one quiet admin login during the flood; the smokescreen" });
E.push({ time: t(12, 22, 8, 30), source: "governance", item: "AI use policy", value: "Fizban is advisory; an analyst confirms every action. Model changes need an evaluation run and sign-off. Log fields are data, never instructions to the assistant" });

export const EVENTS = E;
