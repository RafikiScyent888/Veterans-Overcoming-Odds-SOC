/* =====================================================================
   TIER 4 — THE INCIDENT. Log data for Tuesday 8 December 2026.
   Run stage: nothing is attached to the tickets, so the data here is
   what the student finds by searching. Evidence is kept at the analyst
   level throughout: alert titles, log rows, EDR summaries. No attacker
   commands or tooling appears anywhere in this file.

   ATT&CK IDs checked against MITRE Enterprise v19.2.
   ===================================================================== */
export const NOW = "2026-12-08T08:00:00Z";
const t = (m, d, hh, mm, ss = 0) => `2026-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}Z`;
const E = [];

/* ---- VOO-4021: Ironclad / Zumroh, the macro invoice -------------------- */
E.push({ time: t(12, 8, 6, 12), source: "mail", client: "Ironclad Auto Care", from: "koraf@zumroh-motor.example", to: "theros@ironcladauto.example", subject: "December parts invoice", attachment: "invoice_7841.xlsm", spf: "pass (zumroh-motor.example)", dkim: "pass (zumroh-motor.example)", dmarc: "pass (zumroh-motor.example)", note: "Sent from Zumroh's real, compromised mailbox" });
/* the process chain, one row per step, as the EDR summarises it */
[["EXCEL.EXE", "explorer.exe", "opened invoice_7841.xlsm; content enabled", "T1204.002"],
 ["powershell.exe", "EXCEL.EXE", "spawned by the spreadsheet macro", "T1059.001"],
 ["cmd.exe", "powershell.exe", "spawned child shell", "T1059.003"],
 ["whoami", "cmd.exe", "checked the current user and privileges", "T1033"],
 ["download helper (built-in)", "powershell.exe", "fetched a file from 198.51.100.180", "T1105"]].forEach(([proc, parent, act, tid], i) =>
  E.push({ time: t(12, 8, 6, 14, 10 + i * 5), source: "edr", client: "Ironclad Auto Care", host: "IRON-OFFICE-02", process: proc, parent, action: act, attack: tid, user: "theros" }));
E.push({ time: t(12, 8, 6, 15), source: "zeek.conn", client: "Ironclad Auto Care", host: "IRON-OFFICE-02", "id.orig_h": "10.40.10.32", "id.resp_h": "198.51.100.180", "id.resp_p": 443, service: "ssl", orig_bytes: 700, resp_bytes: 240000, conn_state: "SF" });
E.push({ time: t(12, 8, 6, 20), source: "intel", indicator: "198.51.100.180", verdict: "malware distribution (reported this week)", first_seen: "2026-12-05", category: "malware host" });
E.push({ time: t(12, 5, 15, 0), source: "vendor", client: "Ironclad Auto Care", note: "Zumroh confirmed by phone their invoicing mailbox was compromised on 5 December; they are resetting it" });

/* ---- VOO-4028: Ironclad / Zumroh, the bank-change BEC ------------------- */
E.push({ time: t(12, 8, 7, 2), source: "mail", client: "Ironclad Auto Care", from: "koraf@zumroh-motor.example", to: "theros@ironcladauto.example", subject: "RE: December parts invoice — updated remittance", body_summary: "asks that the next payment go to new bank details, marked urgent", attachment: "", spf: "pass (zumroh-motor.example)", dkim: "pass (zumroh-motor.example)", dmarc: "pass (zumroh-motor.example)", reply_to: "accounts-koraf@zumroh-billing.example" });
E.push({ time: t(12, 8, 7, 5), source: "mailrule", client: "Ironclad Auto Care", mailbox: "koraf@zumroh-motor.example", rule_created: "move messages containing 'invoice' or 'payment' to Archive, mark read", attack: "T1564.008", note: "seen on Zumroh's side; hides the real Koraf's view of replies" });
E.push({ time: t(12, 8, 7, 6), source: "intel", indicator: "zumroh-billing.example", verdict: "no verdicts yet", registered: "2026-12-06", resolves_to: "198.51.100.181", note: "lookalike of zumroh-motor.example" });
E.push({ time: t(12, 8, 7, 10), source: "finance", client: "Ironclad Auto Care", event: "payment change requested", vendor: "Zumroh Motor Company", old_account: "on file since 2021", new_account: "requested today", status: "held pending verification", note: "No malware; a request to move money" });

/* ---- VOO-4035: Nexxuss, the mailbox takeover --------------------------- */
const spray = [];
for (let k = 0; k < 40; k++) spray.push(k);
spray.forEach(k => E.push({ time: t(12, 7, 22, (k * 3) % 60, k % 60), source: "signin", client: "Nexxuss", user: `user${k}@nexxuss.example`, src_ip: "198.51.100." + (150 + k % 6), result: "failure", reason: "bad password", mfa: "not reached", attempts_for_account: 1, attack: "T1110.003" }));
E.push({ time: t(12, 7, 22, 41), source: "signin", client: "Nexxuss", user: "majere@nexxuss.example", src_ip: "198.51.100.153", result: "password ok, MFA required", mfa: "push sent", attack: "T1110.003" });
for (let k = 0; k < 9; k++) E.push({ time: t(12, 7, 22, 43 + k, 0), source: "mfa", client: "Nexxuss", user: "majere@nexxuss.example", event: "push notification", result: k === 8 ? "approved" : "denied/ignored", attack: "T1621", note: k === 8 ? "approved after repeated prompts (MFA fatigue)" : "" });
E.push({ time: t(12, 7, 23, 0), source: "signin", client: "Nexxuss", user: "majere@nexxuss.example", src_ip: "198.51.100.153", result: "success", mfa: "approved", type: "interactive" });
E.push({ time: t(12, 7, 23, 12), source: "oauth", client: "Nexxuss", user: "majere@nexxuss.example", event: "app consent granted", app: "Mail Productivity Add-in", permissions: "read and send mail, offline access", publisher: "unverified", attack: "T1528" });
E.push({ time: t(12, 8, 6, 30), source: "signin", client: "Nexxuss", user: "majere@nexxuss.example", event: "password reset by user", note: "self-service reset after a phishing warning" });
E.push({ time: t(12, 8, 6, 45), source: "oauth", client: "Nexxuss", user: "majere@nexxuss.example", event: "app still connected after reset", app: "Mail Productivity Add-in", note: "consent grant survives a password reset", attack: "T1528" });
E.push({ time: t(12, 8, 6, 50), source: "mailtrace", client: "Nexxuss", mailbox: "majere@nexxuss.example", event: "mail read and forwarded by add-in", count: 120, attack: "T1114.002" });

/* ---- VOO-4042: Nexxuss, Derek the insider ----------------------------- */
E.push({ time: t(12, 8, 14, 2), source: "dlp", client: "Nexxuss", user: "derek@nexxuss.example", event: "large upload to personal cloud storage", destination: "personal file-sharing account", bytes: 3800000000, files: "source code and a customer list", attack: "T1567.002" });
E.push({ time: t(12, 8, 14, 0), source: "hr", client: "Nexxuss", user: "derek@nexxuss.example", event: "resignation on file", note: "notice period; joining competitor Palanthas Labs; access still active as normal" });
E.push({ time: t(12, 8, 13, 55), source: "signin", client: "Nexxuss", user: "derek@nexxuss.example", src_ip: "10.60.1.44", geo: "Office", result: "success", type: "interactive", device_id: "NEX-LT-140" });
E.push({ time: t(12, 8, 14, 5), source: "repo", client: "Nexxuss", user: "derek@nexxuss.example", event: "bulk clone of 3 private repositories", note: "during working hours, from his own managed laptop" });

/* ---- VOO-4049: Payne School, the voice clone -------------------------- */
E.push({ time: t(12, 8, 9, 15), source: "helpdesk", client: "Thomas P. Payne School", caller: "claims to be Solostaran (principal)", request: "reset MFA and add a new phone as the authenticator", handled_by: "tasslehoff", outcome: "put on hold; call-back to the number on file", attack: "T1566.004" });
E.push({ time: t(12, 8, 9, 16), source: "voice", client: "Thomas P. Payne School", note: "Caller ID spoofed the school's main line; voice matched the principal's public speeches", attack: "T1566.004" });
E.push({ time: t(12, 8, 9, 20), source: "signin", client: "Thomas P. Payne School", user: "solostaran@payneschool.example", event: "no MFA change; principal in a meeting on site", result: "verified genuine principal did not call" });
E.push({ time: t(12, 8, 9, 25), source: "calendar", client: "Thomas P. Payne School", event: "Principal Solostaran: governors' meeting 09:00–10:30, on site" });

/* ---- VOO-4056: Payne School, grades changed at 2am -------------------- */
E.push({ time: t(12, 8, 2, 3), source: "app", client: "Thomas P. Payne School", system: "grade book", user: "gilthanas@payneschool.example", event: "12 grades changed", session: "existing web session, no new sign-in", attack: "T1550.004" });
E.push({ time: t(12, 8, 2, 1), source: "signin", client: "Thomas P. Payne School", user: "gilthanas@payneschool.example", event: "no interactive sign-in around 02:00", note: "the grade changes used a session cookie, not a fresh login" });
E.push({ time: t(12, 6, 18, 40), source: "intel", client: "Thomas P. Payne School", indicator: "gilthanas session cookie", event: "offered for sale by an access broker", note: "stolen by infostealer malware on a home device; sold on (Kapak)", attack: "T1539" });
E.push({ time: t(12, 8, 2, 3), source: "app", client: "Thomas P. Payne School", system: "grade book", user: "gilthanas@payneschool.example", src_ip: "198.51.100.190", geo: "Unknown", device: "unrecognised" });

/* ---- VOO-4107 (map 27): No Go Smile, the near miss -------------------- */
E.push({ time: t(12, 8, 1, 12), source: "vpn", client: "No Go Smile", account: "imgtech", src_ip: "198.51.100.211", result: "success", mfa: "not enforced for this account", note: "vendor support account; unused for 11 weeks; contract says business hours by appointment", attack: "T1133" });
E.push({ time: t(12, 8, 1, 21), source: "identity", client: "No Go Smile", host: "NGS-FILE-01", event: "new local administrator account created", account: "support_tmp", created_by: "imgtech", attack: "T1136.001" });
E.push({ time: t(12, 8, 1, 22), source: "siem", client: "No Go Smile", host: "NGS-FILE-01", account: "support_tmp", event: "file reads", reads: 4180, writes: 0, renames: 0, shares: 6, attack: "T1135", note: "reads only; nothing encrypted" });
["IMG-WS-02", "IMG-WS-03"].forEach((h, i) => E.push({ time: t(12, 8, 1, 38 + i), source: "edr", client: "No Go Smile", host: h, event: "backup copies (shadow copies) deleted", by: "support_tmp", running: "yes", attack: "T1490" }));
E.push({ time: t(12, 8, 1, 40), source: "zeek.conn", client: "No Go Smile", host: "NGS-FILE-01", note: "outbound at normal levels; no large uploads", orig_bytes: 20000, "id.resp_h": "10.70.1.9" });
E.push({ time: t(10, 21, 12, 0), source: "ticket", client: "No Go Smile", ref: "VOO-3031", note: "cryptominer removed; entry the unpatched VPN appliance; appliance patch scheduled" });
E.push({ time: t(12, 8, 1, 5), source: "inventory", client: "No Go Smile", item: "VPN appliance patch (from VOO-3031)", value: "still not applied" });
E.push({ time: t(12, 8, 1, 5), source: "runbook", client: "No Go Smile", item: "Out-of-hours contact", value: "practice manager" });
E.push({ time: t(12, 8, 1, 5), source: "runbook", client: "No Go Smile", item: "HIPAA privacy officer", value: "the owner-dentist, advised by outside counsel" });
E.push({ time: t(12, 8, 1, 5), source: "runbook", client: "No Go Smile", item: "Business associate agreement", value: "notify the practice of a suspected incident involving patient records within 24 hours of discovery" });

/* ---- VOO-4063: OEF, the checkout skimmer ------------------------------ */
E.push({ time: t(12, 8, 5, 30), source: "web", client: "OEF Fuel Roasters", host: "shop.oeffuel.example", event: "new third-party script on the checkout page", script_src: "https://cdn-oef-analytics.example/collect.js", added: "2026-12-07", attack: "T1059.007" });
E.push({ time: t(12, 8, 5, 31), source: "zeek.conn", client: "OEF Fuel Roasters", host: "customer browsers", "id.resp_h": "198.51.100.185", "id.resp_p": 443, service: "ssl", note: "checkout pages posting small payloads to a new host", conn_state: "SF" });
E.push({ time: t(12, 8, 5, 32), source: "intel", indicator: "cdn-oef-analytics.example", verdict: "no verdicts yet", registered: "2026-12-06", resolves_to: "198.51.100.185", note: "lookalike of a real analytics CDN name" });
E.push({ time: t(12, 8, 5, 33), source: "change", client: "OEF Fuel Roasters", event: "no approved change added an analytics script this week", note: "the script is not in the store's own change log" });
E.push({ time: t(12, 8, 5, 34), source: "inventory", client: "OEF Fuel Roasters", item: "card data", value: "entered on the checkout page in the browser, then sent to the payment processor" });

export const EVENTS = E;
