/* =====================================================================
   TIER 2 — THE SCAN. Log data for Monday 2 November 2026, clock 08:30.

   Real CVE facts here were checked on 24–27 September 2026 against the
   CVE Program's records and CISA's known-exploited catalogue (version
   2026.09.23). EPSS values are exercise values, as the owner allowed,
   set to agree with CISA's exploitation rating.
   ===================================================================== */
export const NOW = "2026-11-02T08:30:00Z";
const t = (m, d, hh, mm, ss = 0) => `2026-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}Z`;
const E = [];

/* ---- VOO-2107: Ironclad's weekly scan ---------------------------------- */
const F = (cvss, host, ip, finding, cve, epss, cisa, kev, detect, sev) => ({ time: t(11, 2, 6, 58), source: "scan", client: "Ironclad Auto Care", cvss, severity: sev, host, ip, finding, cve, epss, cisa_exploitation: cisa, known_exploited: kev, detected_by: detect });
E.push(
  F(10.0, "bay-tablet-1..4", "10.40.14.21-24", "End-of-life embedded operating system (7 findings, 4 hosts)", "", "", "", "", "remote, no login", "critical"),
  F(9.8, "bench-pc-02", "10.40.12.30", "ECU flashing suite bundles Apache Commons Text 1.9", "CVE-2022-42889", 0.03, "none", "no", "credentialed: library on disk", "critical"),
  F(9.8, "bench-pc-03", "10.40.12.31", "ECU flashing suite bundles Apache Commons Text 1.9", "CVE-2022-42889", 0.03, "none", "no", "credentialed: library on disk", "critical"),
  F(8.1, "parts-db", "10.40.11.8", "Service banner reads OpenSSH 8.7p1", "CVE-2024-6387", 0.12, "poc", "no", "remote: version banner only", "high"),
  F(7.8, "file-srv", "10.40.11.12", "7-Zip 24.06", "CVE-2024-11477", 0.05, "poc", "no", "credentialed: installed version", "high"),
  F(5.3, "book.ironcladauto.example", "203.0.113.60", "Joomla! 4.2.7, improper access check in web service endpoints", "CVE-2023-23752", 0.94, "active", "yes (2024-01-08)", "external active check: endpoint answered without login", "medium"),
  F(3.7, "file-srv", "10.40.11.12", "Self-signed certificate", "", "", "", "", "credentialed", "low"),
);
E.push({ time: t(11, 2, 6, 58), source: "scanjob", client: "Ironclad Auto Care", job: "IRONCLAD-WEEKLY", policy: "Full and fast", safe_checks: "off", started: "Tue 10:00", credentialed_ok: 18, credentialed_failed: "10.40.11.8 (login rejected)", credentialed_not_tried: "10.40.14.21-24", findings: 412 });

/* ---- VOO-2114: Payne School's public share ---------------------------- */
E.push({ time: t(11, 2, 5, 40), source: "cspm", client: "Thomas P. Payne School", cloud: "AWS", resource: "payne-staff-share", resource_type: "S3 bucket", finding: "Bucket readable by anyone on the internet", severity: "high", public_access: "enabled", encryption: "enabled (SSE-S3)", access_logging: "disabled", data_classification: "student records" });
E.push({ time: t(10, 12, 16, 4), source: "cloudtrail", client: "Thomas P. Payne School", event: "DeleteBucketPublicAccessBlock", resource: "payne-staff-share", user: "maquesta@payneschool.example", src_ip: "10.30.2.61" });
E.push({ time: t(10, 12, 16, 6), source: "cloudtrail", client: "Thomas P. Payne School", event: "PutBucketPolicy", resource: "payne-staff-share", user: "maquesta@payneschool.example", src_ip: "10.30.2.61", detail: "Principal: * · Action: s3:GetObject" });
E.push({ time: t(11, 2, 5, 41), source: "inventory", client: "Thomas P. Payne School", resource: "payne-staff-share", folders: "iep-plans, parents-evening-slots, trip-consent-forms", objects: 2140 });

/* ---- VOO-2121: No Go Smile's baseline --------------------------------- */
["IMG-WS-01", "IMG-WS-02", "IMG-WS-03", "IMG-WS-04"].forEach((h, i) => {
  E.push({ time: t(11, 2, 4, 10 + i), source: "config", client: "No Go Smile", host: h, check: "Anti-malware signatures current (within 3 days)", benchmark: "CIS-style workstation baseline", result: "fail", value: "19 days old" });
  E.push({ time: t(11, 2, 4, 20 + i), source: "config", client: "No Go Smile", host: h, check: "SMBv1 disabled", benchmark: "CIS-style workstation baseline", result: "fail", value: "enabled", vlan: "imaging" });
  E.push({ time: t(11, 2, 4, 30 + i), source: "config", client: "No Go Smile", host: h, check: "Standard users are not local administrators", benchmark: "CIS-style workstation baseline", result: i < 2 ? "fail" : "pass", value: i < 2 ? "3 staff accounts in Administrators" : "ok" });
});
for (let d = 14; d <= 31; d += 3) E.push({ time: t(10, d, 3, 5), source: "firewall", client: "No Go Smile", src_host: "IMG-WS-02", dest_host: "av-updates.example", dest_ip: "198.51.100.90", dest_port: 443, action: "denied", rule: "OUT-DENY-ALL (change CHG-7719)" });
E.push({ time: t(10, 14, 11, 2), source: "change", client: "No Go Smile", change: "CHG-7719", summary: "Tighten outbound firewall: default deny, allow list for imaging vendor", approved_by: "practice manager", note: "Allow list omitted the anti-malware update service" });
E.push({ time: t(11, 2, 4, 50), source: "vendor", client: "No Go Smile", vendor: "Imaging sensor maker", note: "Sensor capture software requires SMBv1 to the capture station. Supported fix due next year." });

/* ---- VOO-2126: OEF's store plugin ------------------------------------- */
E.push({ time: t(11, 2, 6, 0), source: "scan", client: "OEF Fuel Roasters", cvss: 9.8, severity: "critical", host: "shop.oeffuel.example", ip: "203.0.113.75", finding: "LiteSpeed Cache plugin 6.3 (6.3.0.1 and earlier are affected): unauthenticated privilege escalation", cve: "CVE-2024-28000", epss: 0.61, cisa_exploitation: "poc", known_exploited: "no", detected_by: "external: plugin version from page assets" });
[["10-23", 0.07], ["10-26", 0.09], ["10-29", 0.22], ["10-31", 0.44], ["11-02", 0.61]].forEach(([md, v]) => { const [m, d] = md.split("-").map(Number); E.push({ time: t(m, d, 0, 0), source: "intel", indicator: "CVE-2024-28000", epss: v, known_exploited: "no", note: "exercise EPSS value" }); });
for (let k = 0; k < 14; k++) E.push({ time: t(11, 1 + (k > 8 ? 1 : 0), 10 + (k % 12), (k * 7) % 60), source: "waf", client: "OEF Fuel Roasters", host: "shop.oeffuel.example", src_ip: "198.51.100." + (120 + (k % 5)), uri: "/wp-json/litespeed/v1/…", user_agent: "Mozilla/5.0 (compatible; bzk-scan/2.1)", action: "logged", status: 403 });

/* ---- VOO-2133: Nexxuss's pipeline ------------------------------------- */
E.push({ time: t(11, 2, 7, 12), source: "ci", client: "Nexxuss", pipeline: "infra-deploy #1184", author: "porthios@nexxuss.example", change: "storage.tf: acl = \"public-read\" on nex-build-artifacts", log_line: "export AWS_ACCESS_KEY_ID=AKIAEXAMPLE7QX3 (printed by debug step)" });
[["ListBuckets", "198.51.100.201"], ["GetBucketAcl", "198.51.100.201"], ["ListObjects", "198.51.100.202"], ["GetObject", "198.51.100.202"], ["GetObject", "198.51.100.203"]].forEach(([ev, ip], i) =>
  E.push({ time: t(11, 2, 7, 18 + i), source: "cloudtrail", client: "Nexxuss", event: ev, access_key: "AKIAEXAMPLE7QX3", src_ip: ip, user_agent: "automated scanner", resource: ev === "ListBuckets" ? "*" : "nex-build-artifacts" }));
E.push({ time: t(11, 2, 7, 13), source: "cspm", client: "Nexxuss", cloud: "AWS", resource: "nex-build-artifacts", resource_type: "S3 bucket", finding: "Bucket ACL grants public read", severity: "high", public_access: "enabled", encryption: "enabled", access_logging: "enabled", data_classification: "build artefacts" });

/* ---- VOO-2140: Ironclad's firmware certificate ------------------------ */
E.push({ time: t(10, 30, 3, 0), source: "zeek.ssl", client: "Ironclad Auto Care", host: "bay-tablet-1", server_name: "fw.diagkit.example", issuer: "CN=Example Trust CA", validation_status: "ok", fingerprint_changed: "no" });
E.push({ time: t(11, 2, 3, 0), source: "zeek.ssl", client: "Ironclad Auto Care", host: "bay-tablet-1", server_name: "fw.diagkit.example", issuer: "CN=Example Cloud CA", validation_status: "ok", fingerprint_changed: "yes" });
E.push({ time: t(11, 2, 3, 1), source: "zeek.conn", client: "Ironclad Auto Care", host: "bay-tablet-1", "id.orig_h": "10.40.14.21", "id.resp_h": "203.0.113.140", "id.resp_p": 443, service: "ssl", orig_bytes: 900, resp_bytes: 41200000, conn_state: "SF" });
E.push({ time: t(10, 29, 15, 0), source: "mail", client: "Ironclad Auto Care", from: "support@diagkit.example", to: "theros@ironcladauto.example", subject: "Our update service is moving on 31 October", spf: "pass (diagkit.example)", dkim: "pass (diagkit.example)", dmarc: "pass (diagkit.example)" });

export const EVENTS = E;
