/* =====================================================================
   TIER 1 — THE SHIFT'S LOG DATA

   Everything a student can search on their first shift, Tuesday
   6 October 2026, clock at 09:41 UTC. Every address is from a range
   reserved for documentation (192.0.2.0/24, 198.51.100.0/24,
   203.0.113.0/24) or a private range; every domain ends in .example.

   Generated, not typed, so the evidence is consistent: the tickets'
   own verifier (verify/content.mjs) runs each ticket's searches against
   this data and proves the evidence shows what the ticket says it does.
   ===================================================================== */

export const NOW = "2026-10-06T09:41:00Z";
const t = (d, hh, mm, ss = 0) => `2026-10-${String(d).padStart(2, "0")}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}Z`;

const E = [];

/* ---- identity: ticket VOO-1042, the volunteer's phone -------------- */
const otik = "otik@steadfastoutpost.example";
E.push(
  { time: t(6, 8, 55), source: "signin", client: "The Steadfast Outpost Thrift", user: otik, src_ip: "203.0.113.44", geo: "Charlotte, NC", asn: "RF Jack Cable", device_id: "iPhone-7F2A", type: "interactive", mfa: "none", result: "failure", reason: "bad password" },
  { time: t(6, 8, 56), source: "signin", client: "The Steadfast Outpost Thrift", user: otik, src_ip: "203.0.113.44", geo: "Charlotte, NC", asn: "RF Jack Cable", device_id: "iPhone-7F2A", type: "interactive", mfa: "push approved", result: "success", reason: "" },
  { time: t(6, 9, 2), source: "signin", client: "The Steadfast Outpost Thrift", user: otik, src_ip: "203.0.113.44", geo: "Charlotte, NC", asn: "RF Jack Cable", device_id: "iPhone-7F2A", type: "token refresh", mfa: "none", result: "success", reason: "" },
  { time: t(6, 9, 31), source: "signin", client: "The Steadfast Outpost Thrift", user: otik, src_ip: "198.51.100.17", geo: "Dallas, TX", asn: "Mobile carrier gateway", device_id: "iPhone-7F2A", type: "token refresh", mfa: "none", result: "success", reason: "" },
  { time: t(6, 9, 38), source: "signin", client: "The Steadfast Outpost Thrift", user: otik, src_ip: "198.51.100.17", geo: "Dallas, TX", asn: "Mobile carrier gateway", device_id: "iPhone-7F2A", type: "token refresh", mfa: "none", result: "success", reason: "" },
);

/* ---- identity: ticket VOO-1055, the Seekers' spray ----------------- */
/* Two failures per account, one password each, from many addresses, over
   seven days: below Nexxuss's lockout of 5. The same addresses touch Payne
   School and the Steadfast Outpost too, which only a SOC watching every
   client can see. */
/* Nexxuss staff: Dragonlance Chronicles names, as the owner settled. */
const nexUsers = ["porthios", "derek", "aran", "brian", "arman", "majere", "zivilyn", "sirrion", "shinare", "chislev", "branchala"];
const sprayIps = ["198.51.100.61", "198.51.100.62", "198.51.100.63", "198.51.100.64", "198.51.100.65", "198.51.100.66", "198.51.100.67", "198.51.100.68", "198.51.100.69", "198.51.100.70", "198.51.100.71"];
nexUsers.forEach((u, i) => {
  for (let k = 0; k < 2; k++) {
    E.push({ time: t(1 + ((i + k * 3) % 6), 2 + (i % 5), 10 + i * 3 + k, 7), source: "signin", client: "Nexxuss", user: `${u}@nexxuss.example`, src_ip: sprayIps[(i + k) % sprayIps.length], geo: "Unknown", asn: "Hosting provider", device_id: "unknown", type: "legacy protocol", mfa: "not requested", result: "failure", reason: "bad password" });
  }
});
E.push({ time: t(6, 6, 12, 44), source: "signin", client: "Nexxuss", user: "aran@nexxuss.example", src_ip: "198.51.100.66", geo: "Unknown", asn: "Hosting provider", device_id: "unknown", type: "legacy protocol", mfa: "not requested", result: "failure", reason: "bad password" });
["hederick@payneschool.example", "eben@payneschool.example", "maquesta@payneschool.example"].forEach((u, i) =>
  E.push({ time: t(4 + i, 3, 20 + i, 2), source: "signin", client: "Thomas P. Payne School", user: u, src_ip: sprayIps[2 + i], geo: "Unknown", asn: "Hosting provider", device_id: "unknown", type: "legacy protocol", mfa: "not requested", result: "failure", reason: "bad password" }));
["bupu@steadfastoutpost.example", "otik@steadfastoutpost.example"].forEach((u, i) =>
  E.push({ time: t(3 + i, 4, 41 + i, 9), source: "signin", client: "The Steadfast Outpost Thrift", user: u, src_ip: sprayIps[6 + i], geo: "Unknown", asn: "Hosting provider", device_id: "unknown", type: "legacy protocol", mfa: "not requested", result: "failure", reason: "bad password" }));
/* ordinary successful sign-ins, the background */
["porthios", "derek", "aran", "brian", "arman"].forEach((u, i) =>
  E.push({ time: t(6, 7, 5 + i * 4), source: "signin", client: "Nexxuss", user: `${u}@nexxuss.example`, src_ip: "10.60.1." + (21 + i), geo: "Office", asn: "Optic Light Fibre", device_id: "NEX-LT-" + (100 + i), type: "interactive", mfa: "push approved", result: "success", reason: "" }));

/* ---- mail and proxy: tickets VOO-1063 and VOO-1064 ------------------ */
const phishTo = ["alhana", "gilthanas", "eben", "hederick", "maquesta"];
phishTo.forEach((u, i) => E.push({ time: t(6, 7, 58, 10 + i), source: "mail", client: "Thomas P. Payne School", message_id: "<7f31c.20261006@msgrelay-7.example>", from: "it-support@payneschool.example", return_path: "bounce-4471@msgrelay-7.example", reply_to: "helpdesk@payneschool-support.example", to: `${u}@payneschool.example`, subject: "Your password expires today", spf: "pass (msgrelay-7.example)", dkim: "pass (msgrelay-7.example)", dmarc: "fail (payneschool.example, policy none)", action: "delivered", folder: u === "alhana" ? "reported" : "inbox", src_ip: "198.51.100.144" }));
["alhana", "gilthanas", "eben", "hederick", "maquesta", "solostaran"].forEach((u, i) => E.push({ time: t(6, 8, 31, 5 + i), source: "mail", client: "Thomas P. Payne School", message_id: "<a90e2.20261006.0831@payneschool.example>", from: "it@payneschool.example", return_path: "it@payneschool.example", reply_to: "", to: `${u}@payneschool.example`, subject: "Password change required by Friday", spf: "pass (payneschool.example)", dkim: "pass (payneschool.example)", dmarc: "pass (payneschool.example)", action: "delivered", folder: u === "eben" ? "reported" : "inbox", src_ip: "10.30.0.5" }));
E.push({ time: t(6, 8, 14, 9), source: "proxy", client: "Thomas P. Payne School", user: "gilthanas", src_ip: "10.30.2.41", method: "GET", url: "https://payneschool-login.example/reset", status: 200, bytes_out: 612, bytes_in: 18230 });
[["alhana", "https://sso.payneschool.example/change"], ["hederick", "https://lessons.payneschool.example/week6"], ["eben", "https://sso.payneschool.example/change"], ["eben", "https://sso.payneschool.example/change"]].forEach(([u, url], i) =>
  E.push({ time: t(6, 8, 40 + i * 3, 12), source: "proxy", client: "Thomas P. Payne School", user: u, src_ip: "10.30.2." + (50 + i), method: i === 3 ? "POST" : "GET", url, status: 200, bytes_out: i === 3 ? 1480 : 540, bytes_in: 9100 }));

/* ---- network: ticket VOO-1187, the Saxet agent's heartbeat ---------- */
for (let h = 0; h < 72; h++) {
  const d = new Date(Date.parse("2026-10-03T10:00:03Z") + h * 3600e3);
  E.push({ time: d.toISOString().replace(".000", ""), source: "zeek.conn", client: "Vanguard Auto Detailing", "id.orig_h": "10.20.1.15", host: "VAD-FRONT-01", "id.resp_h": "198.51.100.73", "id.resp_p": 443, service: "ssl", duration: 0.4, orig_bytes: 1198 + (h * 7) % 16, resp_bytes: 3377 + (h * 11) % 25, conn_state: "SF" });
}
E.push({ time: t(6, 7, 0, 3), source: "zeek.ssl", client: "Vanguard Auto Detailing", "id.orig_h": "10.20.1.15", host: "VAD-FRONT-01", server_name: "relay.saxet-keeper.example", subject: "CN=relay.saxet-keeper.example", issuer: "CN=Example Trust CA", validation_status: "ok" });
E.push({ time: t(6, 6, 30), source: "inventory", client: "Vanguard Auto Detailing", host: "VAD-FRONT-01", software: "Keeper Remote 7.4.2", publisher: "Saxet IT Keepers LLC", signed: "yes", installed: "2021-06-14", note: "Exported from the host's software list" });

/* ---- firewall and feed: ticket VOO-1051, the till's update ---------- */
for (let k = 0; k < 8; k++) {
  const d = new Date(Date.parse("2026-10-04T11:55:12Z") + k * 6 * 3600e3);
  ["POS-01", "POS-02"].forEach((pos, j) => E.push({ time: d.toISOString().replace(".000", ""), source: "firewall", client: "The Steadfast Outpost Thrift", src_host: pos, src_ip: "10.40.5." + (11 + j), dest_ip: "203.0.113.9", dest_host: "updates.tillpoint.example", dest_port: 443, action: "allowed", bytes_out: 2210, bytes_in: 48220 }));
}
E.push({ time: t(3, 16, 0), source: "feed", indicator: "203.0.113.9", type: "ip", confidence: "low", sources: 1, added: "2026-10-03", label: "suspicious hosting" });
E.push({ time: t(6, 5, 50), source: "vendor", vendor: "TillPoint", note: "Published update servers", hosts: "updates.tillpoint.example", ips: "203.0.113.9, 203.0.113.10" });

/* ---- DHCP: ticket VOO-1068, the donated laptops --------------------- */
for (let k = 0; k < 6; k++) {
  E.push({ time: t(6, 9, 2 + k * 2, 30), source: "dhcp", client: "The Steadfast Outpost Thrift", host: "DESKTOP-" + ["Q7K2", "M4TR", "B9WA", "C2PL", "H6ZN", "R3YD"][k], mac: "3c:52:82:1a:" + (10 + k) + ":7e", ip: "10.40.3." + (61 + k), vlan: "store", vendor: "Laptop maker", first_seen: "yes", os_guess: "Windows 10 21H2", browser_guess: "Chrome 96" });
}

/* ---- netflow: ticket VOO-1071, the teenager on the guest Wi-Fi ------ */
for (let k = 0; k < 18; k++) {
  E.push({ time: t(5, 15, 32 + Math.floor(k / 2), (k * 17) % 60), source: "netflow", client: "The Steadfast Outpost Thrift", src_host: "Galaxy-Tab-S7", src_ip: "10.40.9.23", vlan: "guest", dest_ip: "198.51.100." + (180 + (k % 9)), dest_port: 3074 + (k % 2), proto: "udp", asn: "Game network", bytes_out: 820 + k * 5, bytes_in: 910 + k * 7 });
}
E.push({ time: t(5, 15, 30), source: "netflow", client: "The Steadfast Outpost Thrift", src_host: "Galaxy-Tab-S7", src_ip: "10.40.9.23", vlan: "guest", dest_ip: "203.0.113.200", dest_port: 443, proto: "tcp", asn: "Game network", bytes_out: 3100, bytes_in: 52000 });

export const EVENTS = E;
