/* =====================================================================
   TIER 3 — ENDPOINT AND WIRE. Log data for Wednesday 18 November 2026,
   clock 08:05. Zeek logs keep Zeek's own field names (the owner's rule);
   the case page puts a plain-English heading under each.

   Web requests are recorded the way a SOC's web log summary shows them:
   the category the WAF assigned, the path, the status and the size. The
   request text itself is not reproduced. Telling an attempt from a
   success needs the status and the size, not the payload.
   ===================================================================== */
export const NOW = "2026-11-18T08:05:00Z";
const t = (m, d, hh, mm, ss = 0) => `2026-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}Z`;
const E = [];

/* ---- VOO-3016: Vanguard's beacon, reopened ----------------------------- */
const vad = [["VAD-FRONT-01", "10.20.1.15"], ["VAD-OFFICE-01", "10.20.2.21"], ["VAD-OFFICE-02", "10.20.2.22"]];
for (let h = 0; h < 24; h++) vad.forEach(([host, ip], k) =>
  E.push({ time: t(11, 17, h, 0, (h * 3 + k) % 5), source: "zeek.conn", client: "Vanguard Auto Detailing", host, "id.orig_h": ip, "id.resp_h": "198.51.100.73", "id.resp_p": 443, service: "ssl", duration: 0.4, orig_bytes: 1190 + (h * 7 + k * 5) % 30, resp_bytes: 3380 + (h * 11 + k) % 40, conn_state: "SF" }));
vad.forEach(([host, ip]) => E.push({ time: t(11, 17, 0, 0, 2), source: "zeek.ssl", client: "Vanguard Auto Detailing", host, "id.orig_h": ip, server_name: "relay.saxet-keeper.example", subject: "CN=relay.saxet-keeper.example", issuer: "CN=Example Trust CA", validation_status: "ok" }));
E.push({ time: t(11, 9, 12, 0), source: "sensor", client: "Vanguard Auto Detailing", note: "Coverage extended to the office VLAN (10.20.2.0/24)", before: "front-desk VLAN only" });
vad.forEach(([host], k) => E.push({ time: t(11, 17, 23, 0), source: "edr", client: "Vanguard Auto Detailing", host, process: "KeeperRemoteSvc.exe", parent: "services.exe", signer: "Saxet IT Keepers LLC (valid)", user: "SYSTEM", installed: k === 0 ? "2021-06-14" : "2021-06-15", children_30d: 0, listening: "none", last_interactive_session: "2026-02-27 16:12" }));
E.push({ time: t(11, 17, 23, 5), source: "intel", indicator: "relay.saxet-keeper.example", verdict: "no malicious verdicts", first_seen: "2019", category: "IT service provider" });
E.push({ time: t(11, 17, 23, 5), source: "intel", indicator: "198.51.100.73", verdict: "no malicious verdicts", first_seen: "2019", category: "hosting provider" });
E.push({ time: t(11, 17, 23, 5), source: "intel", indicator: "KeeperRemoteSvc.exe", verdict: "matches vendor release 7.4.2, signed", first_seen: "2021", category: "remote support software" });
[["Approved remote access", "RafikisITS support tool only"], ["Previous IT provider", "Saxet IT Keepers, contract ended 2026-02-28"], ["Offboarding: remove previous provider's tools", "marked N/A by the office manager"], ["VAD-FRONT-01", "Front desk; runs the card terminal (PCI DSS scope)"]].forEach(([item, value]) =>
  E.push({ time: t(11, 17, 23, 6), source: "inventory", client: "Vanguard Auto Detailing", item, value }));

/* ---- VOO-3024: OEF, attempt or success ---------------------------------- */
const cats = ["path traversal attempt", "injection attempt", "cross-site scripting attempt", "path traversal attempt", "injection attempt"];
const paths = ["/index.php", "/shop/", "/wp-admin/admin-ajax.php", "/product/", "/cart/", "/wp-json/wc/store/", "/my-account/", "/wp-login.php"];
for (let k = 0; k < 212; k++) {
  const p = paths[k % paths.length];
  E.push({ time: t(11, 17, 1 + Math.floor(k / 20), (k * 7) % 60, k % 60), source: "web", client: "OEF Fuel Roasters", host: "shop.oeffuel.example", src_ip: "203.0.113." + (180 + (k % 9)), user_agent: "Mozilla/5.0 (compatible; bzk-scan/2.1)", method: "GET", path: p, category: cats[k % cats.length], waf_action: "blocked", status: k % 3 === 0 ? 404 : 403, bytes: k % 3 === 0 ? 312 : 0 });
}
E.push({ time: t(11, 17, 12, 41, 9), source: "web", client: "OEF Fuel Roasters", host: "shop.oeffuel.example", src_ip: "203.0.113.184", user_agent: "Mozilla/5.0 (compatible; bzk-scan/2.1)", method: "GET", path: "/legacy/download.php", category: "path traversal attempt", target: "site configuration file", waf_action: "logged (path not covered)", status: 200, bytes: 5812 });
for (let k = 0; k < 6; k++) E.push({ time: t(11, 17, 12, 42 + k, 3), source: "web", client: "OEF Fuel Roasters", host: "shop.oeffuel.example", src_ip: "203.0.113.184", user_agent: "Mozilla/5.0 (compatible; bzk-scan/2.1)", method: "GET", path: "/legacy/download.php", category: "path traversal attempt", target: k % 2 ? "system account list" : "server log", waf_action: "logged (path not covered)", status: 404, bytes: 312 });
[["Customer", "/product/ethiopia-dark/"], ["Customer", "/cart/"], ["Customer", "/checkout/"]].forEach(([u, p], i) =>
  E.push({ time: t(11, 17, 9, 10 + i, 0), source: "web", client: "OEF Fuel Roasters", host: "shop.oeffuel.example", src_ip: "192.0.2." + (40 + i), user_agent: "Mozilla/5.0 (Windows NT 10.0)", method: "GET", path: p, category: "ordinary", waf_action: "allowed", status: 200, bytes: 48000 + i * 900 }));
E.push({ time: t(11, 17, 12, 50), source: "inventory", client: "OEF Fuel Roasters", item: "/legacy/download.php", value: "Old invoice download script from the 2019 site. Not part of WordPress or any plugin. Not in the WAF's rule set" });
E.push({ time: t(11, 17, 12, 50), source: "inventory", client: "OEF Fuel Roasters", item: "Site configuration file", value: "Holds the store database's user name and password, and the site's secret keys" });
for (let k = 0; k < 8; k++) E.push({ time: t(11, 17, 13 + k, 5), source: "db", client: "OEF Fuel Roasters", db_user: "oef_shop", src_host: "shop web server", src_ip: "10.50.1.10", result: "success" });

/* ---- VOO-3031: No Go Smile, the cryptominer ------------------------------ */
E.push({ time: t(11, 16, 2, 14), source: "vpn", client: "No Go Smile", account: "nogo-vendor", src_ip: "203.0.113.207", geo: "Unknown", asn: "Hosting provider", mfa: "not enforced for this account", result: "success", note: "Account last used 2025-03-11" });
E.push({ time: t(11, 16, 2, 19), source: "vpn", client: "No Go Smile", account: "nogo-vendor", src_ip: "203.0.113.207", event: "remote desktop to IMG-WS-03", result: "success" });
E.push({ time: t(11, 16, 2, 26), source: "edr", client: "No Go Smile", host: "IMG-WS-03", process: "imgcache.exe", parent: "taskeng (scheduled task ImgCacheSync)", signer: "unsigned", user: "SYSTEM", path: "C:\\ProgramData\\ImgCache\\", cpu: "96%", note: "Scheduled task created 02:24 by nogo-vendor; runs at every start-up" });
for (let k = 0; k < 10; k++) E.push({ time: t(11, 16, 3 + k, 0), source: "zeek.conn", client: "No Go Smile", host: "IMG-WS-03", "id.orig_h": "10.70.3.23", "id.resp_h": "198.51.100.230", "id.resp_p": 3333, service: "mining pool protocol", duration: 3600, orig_bytes: 40000 + k * 30, resp_bytes: 52000 + k * 40, conn_state: "SF" });
E.push({ time: t(11, 16, 2, 30), source: "intel", indicator: "198.51.100.230", verdict: "cryptocurrency mining pool", first_seen: "2024", category: "mining" });
E.push({ time: t(11, 16, 2, 30), source: "scan", client: "No Go Smile", host: "vpn.nogosmile.example", finding: "VPN appliance firmware 9.1, vendor fix released in August not applied", cvss: 9.1, severity: "critical" });
E.push({ time: t(11, 16, 2, 30), source: "inventory", client: "No Go Smile", item: "nogo-vendor", value: "VPN account made for the old imaging installer in 2025. Nobody owns it now" });

/* ---- VOO-3040: the ISP outage, then the hunt ----------------------------- */
const hit = ["Vanguard Auto Detailing", "OEF Fuel Roasters", "Ironclad Auto Care", "No Go Smile", "Thomas P. Payne School", "The Steadfast Outpost Thrift"];
const kinds = ["Site-to-site tunnel down", "Firewall heartbeat missed", "Cloud sign-in failures spiking", "EDR agents offline", "Mail flow stopped", "VPN gateway unreachable", "Log forwarder silent", "DNS lookups failing", "POS terminal offline", "Backup job failed"];
for (let k = 0; k < 60; k++) E.push({ time: t(11, 18, 6, 2 + Math.floor(k / 20), (k * 13) % 60), source: "monitor", client: hit[k % 6], alert: kinds[k % kinds.length], isp: "Optic Light Fibre", ticket: "VOO-3" + String(100 + k) });
E.push({ time: t(11, 18, 6, 31), source: "isp", provider: "Optic Light Fibre", notice: "Fibre cut on the regional ring, 06:01. Repair crews on site. Service restored 07:12" });
const fp = "tls:7a1c93e0";
for (let k = 0; k < 18; k++) E.push({ time: t(11, 10 + (k % 8), 3, k * 3), source: "waf", client: k % 2 ? "Ironclad Auto Care" : "OEF Fuel Roasters", src_ip: "203.0.113." + (20 + k * 7), user_agent: k < 9 ? "Mozilla/5.0 (compatible; bzk-scan/2.1)" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", tls_fingerprint: fp, request_order: "robots, sitemap, login, plugin paths", action: "blocked" });
for (let k = 0; k < 6; k++) E.push({ time: t(11, 12, 10, k * 5), source: "waf", client: "OEF Fuel Roasters", src_ip: "192.0.2." + (60 + k), user_agent: "Mozilla/5.0 (Macintosh)", tls_fingerprint: "tls:" + (1000 + k * 17).toString(16) + "b2", request_order: "home, product, cart", action: "allowed" });

/* ---- VOO-3047: Payne School, an internal scan ---------------------------- */
const ports = [22, 80, 443, 3389];
for (let h = 1; h <= 40; h++) ports.forEach((p, i) =>
  E.push({ time: t(11, 17, 15, 41, (h + i) % 60), source: "zeek.conn", client: "Thomas P. Payne School", host: "PAYNE-LAB-17", "id.orig_h": "10.30.5.77", "id.resp_h": "10.30.4." + h, "id.resp_p": p, service: "-", duration: 0, orig_bytes: 0, resp_bytes: 0, conn_state: (h + i) % 5 === 0 ? "REJ" : "S0" }));
E.push({ time: t(11, 17, 15, 38), source: "signin", client: "Thomas P. Payne School", user: "sestun@pupils.payneschool.example", host: "PAYNE-LAB-17", src_ip: "10.30.5.77", result: "success", type: "interactive" });
E.push({ time: t(11, 17, 15, 0), source: "calendar", client: "Thomas P. Payne School", event: "Cyber club, room L2 (the computer lab), 15:00–15:35" });
E.push({ time: t(11, 17, 16, 0), source: "edr", client: "Thomas P. Payne School", host: "PAYNE-LAB-17", process: "portable network scanner", signer: "open-source project", user: "sestun", note: "Run from a USB stick; no other alerts on the host" });

/* ---- VOO-3052: Vanguard, "this is Saxet" -------------------------------- */
E.push({ time: t(11, 18, 7, 12), source: "proxy", client: "Vanguard Auto Detailing", user: "kitiara", host: "VAD-OFFICE-01", method: "GET", url: "https://saxet-keeper-support.example/reinstall", status: 200, bytes_in: 14100 });
E.push({ time: t(11, 18, 7, 13), source: "proxy", client: "Vanguard Auto Detailing", user: "kitiara", host: "VAD-OFFICE-01", method: "GET", url: "https://saxet-keeper-support.example/KeeperRemote_setup.msi", status: 403, action: "blocked: newly registered domain" });
E.push({ time: t(11, 18, 7, 20), source: "intel", indicator: "saxet-keeper-support.example", verdict: "no verdicts yet", first_seen: "2026-11-15", registered: "2026-11-15", resolves_to: "198.51.100.144", name_servers: "ns1.parkhost.example" });
E.push({ time: t(11, 18, 7, 20), source: "intel", indicator: "payneschool-login.example", verdict: "phishing (reported by the SOC, October)", first_seen: "2026-10-04", registered: "2026-10-04", resolves_to: "198.51.100.144", name_servers: "ns1.parkhost.example" });
E.push({ time: t(11, 18, 7, 25), source: "edr", client: "Vanguard Auto Detailing", host: "VAD-OFFICE-01", process: "none new", note: "No installer ran and no new services were created" });
E.push({ time: t(11, 18, 7, 30), source: "inventory", client: "Vanguard Auto Detailing", item: "Saxet IT Keepers", value: "Contract ended 2026-02-28. Staff know the name: Saxet ran their IT for five years" });

/* ---- VOO-3060: OEF, every login succeeds -------------------------------- */
for (let k = 0; k < 212; k++) E.push({ time: t(11, 18, 3 + Math.floor(k / 80), (k * 11) % 60, k % 60), source: "store", client: "OEF Fuel Roasters", event: "login", account: `cust${1000 + k * 17}@mail.example`, src_ip: "198.51.100." + (10 + k % 90), user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", result: k % 9 === 0 ? "success" : "failure", reason: k % 9 === 0 ? "" : "bad password", attempts_for_account: 1 });
for (let k = 0; k < 24; k++) E.push({ time: t(11, 18, 5, 10 + k), source: "store", client: "OEF Fuel Roasters", event: "gift card redeemed", account: `cust${1000 + k * 9 * 17}@mail.example`, amount: 25 + (k % 4) * 25, src_ip: "198.51.100." + (10 + (k * 9) % 90) });
for (let k = 0; k < 5; k++) E.push({ time: t(11, 17, 12 + k, 0), source: "store", client: "OEF Fuel Roasters", event: "login", account: `regular${k}@mail.example`, src_ip: "192.0.2." + (80 + k), user_agent: "Mozilla/5.0 (iPhone)", result: "success", reason: "", attempts_for_account: 1 });
E.push({ time: t(11, 18, 6, 0), source: "config", client: "OEF Fuel Roasters", check: "Store login lockout", value: "5 failed attempts per account in 15 minutes", mfa: "not offered to customers" });

export const EVENTS = E;
