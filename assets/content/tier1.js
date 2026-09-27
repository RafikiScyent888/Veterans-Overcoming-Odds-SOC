/* =====================================================================
   TIER 1 — FIRST SHIFT. Seven tickets, two decisions each (crawl).

   Map tickets 1–7 in CLAUDE.md section 13g. Tickets 1 and 2 are the
   owner-approved previews (design/ticket-001, -004). The rest follow the
   same shape. Every decision: six options, one correct, a reason on every
   wrong one, rungs 1 and 2 written, shuffled by seed at run time.

   verify/content.mjs enforces all of that, plus the answer-tell checks,
   the objective numbers, the ATT&CK IDs, the safe addresses, the
   do-not-reuse list, and that each ticket's searches really show the
   evidence the ticket depends on.
   ===================================================================== */

export const TIER = { n: 1, name: "First shift", seat: "Tier 1 analyst" };

export const TICKETS = [

/* ------------------------------------------------------------------ 1 */
{
  id: "VOO-1042", map: 1, time: "09:34:02", sev: "medium",
  alert: "Impossible travel: 930 mi in 29 min", source: "SIEM",
  client: "The Steadfast Outpost Thrift", entity: "otik@steadfastoutpost.example",
  attack: "T1078", sla: "Due 10:04",
  facts: [["Rule", "Two successful sign-ins more than 500 miles apart within 60 minutes"], ["Event 1", "09:02 · 203.0.113.44 · Charlotte, NC"], ["Event 2", "09:31 · 198.51.100.17 · Dallas, TX"]],
  tabs: [
    { title: "The alert", kind: "code", text: "RULE      Impossible travel (>500 mi in <60 min)\nUSER      otik@steadfastoutpost.example\nEVENT 1   09:02  203.0.113.44   Charlotte, NC   success\nEVENT 2   09:31  198.51.100.17  Dallas, TX      success\nDISTANCE  ~930 mi in 29 min" },
    { title: "Client context", kind: "list", items: ["Volunteers use their own phones. The store's Wi-Fi goes out through RF Jack Cable", "The store opened at 09:00; volunteers often step outside on break", "No other Steadfast Outpost account has alerted this week"] },
  ],
  search: { query: 'source=signin user="otik@steadfastoutpost.example" earliest=-24h | table time src_ip geo asn device_id type mfa result', say: "Run this search to see every sign-in for this account in the last day." },
  guide: ["Read the evidence before the alert title. What did the rule actually measure?", "Run the search. What is the same between the two sign-ins, and what is different?", "Where does an IP address's location come from, and how far can you trust it?", "If this were a compromise, what would you expect to see in the log? Is it there?", "Check Fizban's summary against what you found.", "Choose the most defensible disposition: what the evidence proves, not the worst case.", "Should the rule change? How narrowly?", "Write it up."],
  fizban: "Likely account compromise. Two successful sign-ins 930 miles apart in 29 minutes. Recommend disabling the account and resetting the password.",
  decisions: [
    { id: "d1", slot: 4, prompt: "What is the most defensible disposition for VOO-1042?",
      options: [
        { id: "a", correct: true, text: "Benign true positive — the same device and session moved to a mobile carrier. Close with the evidence" },
        { id: "b", text: "True positive, account compromise — disable the account and reset the password before it spreads any further", why: "Over-classification, and Fizban's answer. Nothing in the log looks like somebody else's device." },
        { id: "c", text: "Escalate to Tier 2 as a possible compromise, with the alert, the sign-in log and Fizban's summary attached", why: "The evidence already answers the question. Escalating adds work without adding certainty." },
        { id: "d", text: "False positive — the rule measured the wrong thing, so turn it off until it is rewritten", why: "The rule measured exactly what it says. Turning it off blinds you to the real one." },
        { id: "e", text: "Benign — close the ticket with no notes, since the volunteer was just on their phone", why: "Right conclusion, no evidence. Nobody can check your reasoning later." },
        { id: "f", text: "Add this volunteer to a permanent exception so the rule never alerts on them again, anywhere", why: "Hides a real takeover of this account for ever." } ],
      hints: ["Look at the device ID column, and at the Type column, for the two sign-ins in the alert.", "An alert can fire correctly on an event that is harmless. Ask whether the rule was wrong, or whether the event was."],
      lesson: "A false positive means the rule was wrong. A benign true positive means the rule was right and the event was harmless. CySA tests the difference." },
    { id: "d2", slot: 1, prompt: "What change stops this alert without hiding a real takeover?",
      options: [
        { id: "a", correct: true, text: "Suppress only when device ID, session and authenticator all match — still alert on any new device" },
        { id: "b", text: "Raise the distance to 2,000 miles so short trips like this one stop alerting across every client we watch", why: "A real attacker in the next state over now slips through." },
        { id: "c", text: "Suppress impossible travel for every Steadfast Outpost account, since the volunteers there all use their own phones", why: "One client becomes a blind spot." },
        { id: "d", text: "Exclude every mobile-carrier network from the rule, since that is where these alarms keep coming from", why: "Attackers use phones and carrier networks too." },
        { id: "e", text: "Lower the rule to informational so it is still recorded but never pages anybody", why: "It still fires; nobody reads it." },
        { id: "f", text: "Leave the rule alone and close these by hand as they come in, with a note on each", why: "Every analyst loses minutes to the same false alarm every shift." } ],
      hints: ["Which facts in the sign-in log would be different if somebody else had the password?", "A good suppression is narrow enough that a real attack could not match it."],
      lesson: "Thresholds and exceptions are how a SOC tunes its sensors. Narrow beats broad: an exception should be impossible for an attacker to meet." },
  ],
  writeup: "Impossible-travel alert on a Steadfast Outpost volunteer. Both sign-ins came from the same device (iPhone-7F2A) with one approved MFA push at 08:56. The 09:31 event is a token refresh from a mobile carrier gateway geolocated to Dallas, not a new sign-in. Benign true positive. Proposed tuning: suppress when device, session and authenticator all match. Could not be confirmed: that the device itself was in the volunteer's hands.",
  summary: [
    ["1.2", "Read the sign-in log and found the same device and a token refresh", "Identity logs are where indicators of account misuse show up, or don't", "Impossible travel · token refresh · geolocation limits"],
    ["3.3", "Decided benign true positive, with evidence", "Triage is deciding what an alert means before acting", "True positive · false positive · benign true positive"],
    ["1.5", "Proposed a narrow suppression", "Tuning detections is process improvement", "Tuning · suppression · alert fatigue"],
    ["1.6", "Rejected Fizban's compromise call", "AI summaries read the alert, not always the log", "Hallucination · human in the loop"],
  ],
  proofs: [
    { query: 'source=signin user="otik@steadfastoutpost.example" earliest=-24h', says: "every sign-in in the window comes from the same device", check: r => r.count >= 4 && r.rows.every(x => x.device_id === "iPhone-7F2A") },
    { query: 'source=signin user="otik@steadfastoutpost.example" src_ip="198.51.100.17"', says: "the Dallas events are token refreshes, not new sign-ins", check: r => r.count >= 1 && r.rows.every(x => x.type === "token refresh") },
  ],
},

/* ------------------------------------------------------------------ 2 */
{
  id: "VOO-1063", map: 2, time: "08:22:40", sev: "medium",
  alert: "Reported email: “Your password expires today”", source: "User report",
  client: "Thomas P. Payne School", entity: "alhana@payneschool.example",
  attack: "", sla: "Due 09:22",
  facts: [["Reported by", "alhana@payneschool.example (Year 5 teacher)"], ["From", "it-support@payneschool.example"], ["Filter verdict", "Delivered, not flagged"]],
  tabs: [
    { title: "The reported email", kind: "list", items: ["From (what the teacher sees): Payne School IT <it-support@payneschool.example>", "Reply-To: helpdesk@payneschool-support.example", "Return-Path: bounce-4471@msgrelay-7.example", "Subject: Your password expires today", "Received: 07:58, from 198.51.100.144", "Link: https://payneschool-login.example/reset", "Attachments: none"] },
    { title: "Raw headers", kind: "code", text: "Authentication-Results: mx.payneschool.example;\n  spf=pass smtp.mailfrom=msgrelay-7.example;\n  dkim=pass header.d=msgrelay-7.example;\n  dmarc=fail action=none header.from=payneschool.example" },
    { title: "Message trace", kind: "table", columns: ["Recipient", "Status", "Folder"], rows: [["alhana@payneschool.example", "Delivered", "Inbox → Reported"], ["gilthanas@payneschool.example", "Delivered", "Inbox"], ["eben@payneschool.example", "Delivered", "Inbox"], ["hederick@payneschool.example", "Delivered", "Inbox"], ["maquesta@payneschool.example", "Delivered", "Inbox"]] },
    { title: "URL reputation", kind: "list", items: ["payneschool-login.example: registered 2 days ago", "No verdicts yet · hosting provider"] },
  ],
  search: { query: 'source=proxy url="*payneschool-login.example*" earliest=-24h | table time user src_ip method url status', say: "Run this search to see who opened the link." },
  guide: ["Read the headers before the message. Who does it say it is from, and who actually sent it?", "Find the Authentication-Results line. What passed, and for which domain?", "Who else got it? Read the message trace.", "Did anyone click? Did anyone submit? Run the proxy search.", "Check Fizban against what you found.", "Decide what it is, then what to do. Write it up."],
  fizban: "Credential phishing. DMARC failed and the link goes to a domain registered two days ago. Recommend resetting the passwords of all five recipients.",
  decisions: [
    { id: "d1", slot: 6, prompt: "What is the most defensible classification of the email Alhana reported?",
      options: [
        { id: "a", correct: true, text: "Credential phishing — SPF and DKIM passed for the relay, not for the school, so DMARC failed" },
        { id: "b", text: "A genuine IT notice — SPF and DKIM both passed, so it came from an authorised school server", why: "They passed for msgrelay-7.example. Passing is not the same as matching the From." },
        { id: "c", text: "Whaling — a targeted attack on the school's leadership that impersonates the IT department", why: "Whaling targets executives. This went to five teachers." },
        { id: "d", text: "Business email compromise — a real school mailbox has been taken over and is sending this out", why: "Nothing came from a school mailbox. The Return-Path and relay are outside." },
        { id: "e", text: "Spam — unwanted bulk mail, so close it and let the mail filter learn from the report", why: "It impersonates the school and harvests passwords. That is phishing, not spam." },
        { id: "f", text: "A false positive — the teacher reported a real email by mistake, so close it with a thank-you", why: "Compare VOO-1064, the genuine notice: its DMARC passes and its link is the school's own." } ],
      hints: ["Read the Authentication-Results line, and look at which domain each check was for.", "A check only vouches for the domain it checked."],
      lesson: "SPF says this server may send for that domain. DKIM says that domain signed it. DMARC says that domain is the one in the From line. Passing for somebody else's domain proves nothing about the school." },
    { id: "d2", slot: 2, prompt: "One person clicked and nobody submitted. What is the right response?",
      options: [
        { id: "a", correct: true, text: "Purge it from all five inboxes, block the link and sender domain, and note the one click" },
        { id: "b", text: "Reset the passwords of all five recipients, since any of them might have been caught by it", why: "Nobody submitted. Five resets for no reason, and it teaches users that reports cause pain. Fizban's answer." },
        { id: "c", text: "Reset Gilthanas's password only, because he is the one person who opened the phishing page", why: "He clicked (GET) but never submitted (POST). There is no password to change." },
        { id: "d", text: "Purge Alhana's copy only, because she is the one who reported it and asked us to act", why: "Four more copies are still sitting in inboxes, waiting to be clicked." },
        { id: "e", text: "Block the link at the proxy and leave the emails in place, since nobody can reach it now", why: "Users on other networks, and on phones, don't go through the proxy." },
        { id: "f", text: "Set the school's DMARC policy to reject today so that this can't happen again", why: "Right long term, but a mail change is not yours to make at Tier 1, and it does nothing about the five copies already delivered. It belongs in the write-up as a recommendation." } ],
      hints: ["Read the proxy search again. Which methods appear, and which don't?", "Only a password that was typed in needs changing."],
      lesson: "Size the response to the evidence. Clicked is not compromised; submitted is. The proxy's GET and POST are how you tell." },
  ],
  writeup: "User-reported email to Alhana impersonating Payne School IT. Headers: From payneschool.example, Return-Path msgrelay-7.example, Reply-To payneschool-support.example. SPF and DKIM pass for msgrelay-7.example; DMARC fails for payneschool.example, policy none, so it was delivered. Link to payneschool-login.example, registered two days ago. Trace: 5 recipients. Proxy: one GET by Gilthanas at 08:14, no POST. Purged from 5 mailboxes; link and sender domain blocked. Credential phishing, contained; no resets needed. Recommend moving DMARC towards reject. Could not be confirmed: that nobody opened the link from a device outside the proxy.",
  summary: [
    ["1.2", "Found the From, Return-Path and Reply-To disagreeing", "Mismatched sender fields are an indicator of malicious intent", "Header analysis · spoofing · impersonation"],
    ["1.3", "Ran the proxy search; read the trace and URL reputation", "Each tool answers one question: who got it, who clicked, what the link is", "Message trace · proxy logs · URL reputation"],
    ["1.1", "Read SPF, DKIM and DMARC and the policy behind them", "Email authentication is part of how an organisation proves identity", "SPF · DKIM · DMARC · alignment"],
    ["3.3", "Decided scope: 5 delivered, 1 clicked, 0 submitted", "Triage decides severity and scope before acting", "Scope · clicked vs submitted"],
    ["2.4", "Purged, blocked, and recommended DMARC reject", "Removing the threat now, recommending the control that stops the next one", "Containment · email security gateway"],
    ["1.6", "Kept Fizban's classification, rejected its response", "An AI can be right about what and wrong about what to do", "Human in the loop · over-reliance"],
    ["4.2", "Wrote the case up so the next analyst doesn't repeat it", "Documentation is how a SOC remembers", "Incident documentation"],
  ],
  proofs: [
    { query: 'source=proxy url="*payneschool-login.example*" earliest=-24h', says: "the phishing link was opened once, with GET, and never submitted", check: r => r.count === 1 && r.rows[0].method === "GET" },
    { query: 'source=mail subject="Your password expires today"', says: "five recipients, DMARC failing for the school", check: r => r.count === 5 && r.rows.every(x => /^fail/.test(x.dmarc)) },
    { query: 'source=mail subject="Password change required by Friday"', says: "the genuine notice passes DMARC", check: r => r.count >= 1 && r.rows.every(x => /^pass/.test(x.dmarc)) },
  ],
},

/* ------------------------------------------------------------------ 3 */
{
  id: "VOO-1187", map: 3, time: "07:05:18", sev: "medium",
  alert: "Periodic outbound beacon, hourly", source: "SIEM",
  client: "Vanguard Auto Detailing", entity: "VAD-FRONT-01",
  attack: "T1071", sla: "Due 08:05",
  facts: [["Rule", "Same destination, regular interval, steady sizes"], ["Destination", "198.51.100.73 : 443"], ["Interval", "3600 s over 72 h"]],
  tabs: [
    { title: "The alert", kind: "code", text: "RULE      Periodic outbound beacon\nHOST      10.20.1.15  VAD-FRONT-01\nDEST      198.51.100.73 : 443\nINTERVAL  3600 s  (jitter ± 4 s)   over 72 h\nPAYLOAD   ~1.2 KB out · ~3.4 KB in, every check-in" },
    { title: "Host software list", kind: "table", columns: ["Software", "Publisher", "Signed", "Installed"], rows: [["Keeper Remote 7.4.2", "Saxet IT Keepers LLC", "Yes", "2021-06-14"], ["Card terminal driver 3.2", "PayLine", "Yes", "2024-02-02"], ["Office suite", "Various", "Yes", "2025-11-19"]] },
    { title: "Client context", kind: "list", items: ["Front desk PC. It runs the card terminal", "RafikisITS took over Vanguard's IT in March 2026", "Previous provider: Saxet IT Keepers", "Network sensor coverage at Vanguard: the front-desk VLAN only, for now"] },
  ],
  search: { query: 'source=zeek.ssl host="VAD-FRONT-01" | table time server_name subject issuer validation_status', say: "Run this search to see who the PC is talking to." },
  guide: ["What exactly is talking, and to whom?", "Run the search. What does the certificate say the other end is?", "Is it doing anything besides checking in? Look at the sizes.", "What is installed on the PC that would explain it?", "Decide what it is, and what you can't prove yet.", "Write it up."],
  fizban: "Hourly beacon to an unfamiliar relay with steady payloads: consistent with command-and-control. Recommend isolating VAD-FRONT-01.",
  decisions: [
    { id: "d1", slot: 5, prompt: "What is the most defensible disposition for the beacon from VAD-FRONT-01?",
    options: [
        { id: "a", correct: true, text: "Benign true positive — the signed Saxet remote agent checking in, with nothing else happening" },
        { id: "b", text: "Command-and-control — hourly, steady sizes, one relay: isolate VAD-FRONT-01 until it is cleaned", why: "The pattern fits, but the certificate and the software list name a real vendor's signed agent. Isolating the card terminal PC stops the business." },
        { id: "c", text: "False positive — the beacon rule misfired on ordinary HTTPS traffic from the front desk", why: "The rule was right. It is a beacon: hourly, steady sizes, one destination." },
        { id: "d", text: "Vendor traffic — close it with no notes, since the software came from the old IT company", why: "Right conclusion, no evidence, and nobody will ever ask whether the old company should still have access." },
        { id: "e", text: "Malware disguised as Saxet's agent — escalate straight to incident response for analysis", why: "Nothing suggests a disguise: it is signed, installed in 2021 and talks to Saxet's own relay." },
        { id: "f", text: "Data exfiltration — about 3 KB leaves the PC every hour, so work out what is being sent", why: "Read the sizes again: 1.2 KB goes out, 3.4 KB comes back. That is a check-in, not a leak." } ],
      hints: ["Read the certificate in the search results, then the host software list.", "A beacon is a pattern, not a verdict. What decides it is what the software is."],
      lesson: "Beaconing looks the same whether it is an attacker's implant or a legitimate agent. The evidence that decides it is what the software is, who signed it, and where it talks." },
    { id: "d2", slot: 3, prompt: "You're closing it. What goes in the ticket so it isn't forgotten?",
    options: [
        { id: "a", correct: true, text: "The evidence, plus a not-proven line: whether Saxet's agent is still approved now RafikisITS runs IT" },
        { id: "b", text: "A rule change so beacons to Saxet's relay never alert again, now that we know what the traffic is", why: "Explained is not approved. And it would hide the relay if it were ever taken over." },
        { id: "c", text: "A note asking the front desk to uninstall the agent themselves, since they have the PC in front of them", why: "Not a change for a receptionist to make on the card terminal PC, and not yours to order." },
        { id: "d", text: "A block on the relay domain at Vanguard's firewall, added now so the ticket can be closed clean", why: "A change to a client's firewall isn't a Tier 1 analyst's to make, and the agent stays installed." },
        { id: "e", text: "Nothing extra: benign is benign, and the software list will still be there if anyone needs it", why: "The open question is the valuable part. Without it, nobody follows up." },
        { id: "f", text: "An escalation to Tier 2 to decide whether this counts as a beacon at all under the current rule", why: "You've already answered that. What's open is approval, not whether it's a beacon." } ],
      hints: ["What don't you know yet about Vanguard's relationship with Saxet?", "State what you can evidence, and say what you can't."],
      lesson: "A good close records what is still unknown. Written well, that one line is what reopens the ticket when new evidence arrives." },
  ],
  writeup: "Hourly beacon from VAD-FRONT-01 to relay.saxet-keeper.example (198.51.100.73), about 1.2 KB out and 3.4 KB in. The certificate is issued to Saxet's relay; the host software list shows Keeper Remote 7.4.2, signed by Saxet IT Keepers, installed 2021-06-14. Benign true positive: the previous IT provider's remote agent checking in. Could not be confirmed: whether Saxet's agent is still approved now that RafikisITS runs Vanguard's IT. Sensor coverage is the front-desk VLAN only.",
  summary: [
    ["1.2", "Recognised a beacon, then read what was behind it", "Beaconing is an indicator; context decides what it means", "Beaconing · C2 · legitimate look-alikes"],
    ["1.3", "Used the network sensor's TLS log and the host software list", "Tools answer who is talking and what is installed", "Zeek · TLS SNI · asset software inventory"],
    ["4.2", "Closed with a not-proven line", "Documentation keeps open questions alive", "Incident documentation · follow-up"],
  ],
  proofs: [
    { query: 'source=zeek.conn host="VAD-FRONT-01" | stats count avg(orig_bytes) avg(resp_bytes) by id.resp_h', says: "one destination, 72 check-ins, more in than out", check: r => r.count === 1 && r.rows[0].count === 72 && r.rows[0]["avg(orig_bytes)"] < r.rows[0]["avg(resp_bytes)"] },
    { query: 'source=zeek.ssl host="VAD-FRONT-01"', says: "the certificate names Saxet's relay", check: r => r.count === 1 && /saxet/.test(r.rows[0].server_name) },
  ],
},

/* ------------------------------------------------------------------ 4 */
{
  id: "VOO-1051", map: 4, time: "05:55:12", sev: "critical",
  alert: "Connection to an address on a threat feed", source: "Firewall",
  client: "The Steadfast Outpost Thrift", entity: "POS-01 → 203.0.113.9",
  attack: "T1071", sla: "Due 06:10",
  facts: [["Rule", "Outbound to an indicator on a community feed"], ["Feed entry", "Added 3 days ago"], ["Traffic", "HTTPS every 6 hours"]],
  tabs: [
    { title: "The alert", kind: "code", text: "RULE      Connection to threat-feed indicator\nHOST      POS-01  10.40.5.11\nDEST      203.0.113.9 : 443\nFEED      community feed · 'suspicious hosting'" },
    { title: "The feed entry", kind: "list", items: ["Indicator: 203.0.113.9", "Label: suspicious hosting", "Confidence: low", "Sources: 1", "Added: 2026-10-03"] },
    { title: "Client context", kind: "list", items: ["Two tills, POS-01 and POS-02, both running TillPoint point-of-sale software", "TillPoint pushes updates automatically", "The store opens at 09:00"] },
  ],
  search: { query: 'source=firewall dest_ip="203.0.113.9" earliest=-7d | stats count by src_host dest_host', say: "Run this search to see which tills talk to the address, and what it is." },
  guide: ["How much should you trust this feed entry? Read its confidence and sources.", "Run the search. Who else talks to the address, and what is its name?", "Is there a published list of the vendor's update servers?", "Decide what the alert really is.", "Fix the cause, not just this one alert.", "Write it up."],
  fizban: "Critical: a point-of-sale system is contacting an address on a threat feed. Card data may be at risk. Recommend isolating both tills.",
  decisions: [
    { id: "d1", slot: 2, prompt: "What is the most defensible disposition for VOO-1051?",
    options: [
        { id: "a", correct: true, text: "False positive — a low-confidence feed entry that names the till vendor's own update server" },
        { id: "b", text: "True positive, card-data theft — isolate both tills and tell the store to take cash only today", why: "Nothing but the feed entry says so. The address is TillPoint's published update server, reached every six hours." },
        { id: "c", text: "Benign true positive — the rule fired correctly, and the till's update traffic just happened to match", why: "Close, but no: the alert claims a known-bad address, and the address isn't bad. The indicator was wrong, so the alert was wrong." },
        { id: "d", text: "Escalate to Tier 2 as a possible point-of-sale compromise, with the feed entry and firewall log", why: "The evidence already answers it. Escalating a feed error spends Tier 2's time." },
        { id: "e", text: "Block 203.0.113.9 at the store's firewall, then close the ticket once the traffic stops", why: "That blocks the tills' own updates. And the firewall isn't yours to change." },
        { id: "f", text: "Close it without notes, since point-of-sale updates always look strange on the firewall", why: "Right that it's harmless, but the bad feed entry will fire again at every client with TillPoint tills." } ],
      hints: ["Read the feed entry's confidence and sources, then the vendor's published server list.", "When the indicator itself is wrong, the alert it raises is wrong too."],
      lesson: "A false positive: the alert's claim is untrue. Here the rule worked, but the intelligence it relied on was bad. Threat intelligence has a confidence level for a reason." },
    { id: "d2", slot: 6, prompt: "How do you stop this happening again, here and at other clients?",
    options: [
        { id: "a", correct: true, text: "Mark the entry false for TillPoint's servers, report it to the feed, and review in 30 days" },
        { id: "b", text: "Remove the community feed from every client's rules, since this entry shows it can't be trusted", why: "One bad entry out of thousands. Throwing the feed away loses everything it gets right." },
        { id: "c", text: "Suppress threat-feed alerts for the Steadfast Outpost, since nothing there is ever malicious", why: "One client becomes a blind spot, and 'never malicious' is exactly what an attacker hopes you'll assume." },
        { id: "d", text: "Allow 203.0.113.9 everywhere, for good, so no client ever alerts on this address again", why: "For good is too long. Addresses change hands; the review date is what keeps it honest." },
        { id: "e", text: "Only alert on feed entries rated critical, so low-confidence entries never page an analyst", why: "It hides every real low-confidence hit too. Confidence should weigh in triage, not silence the rule." },
        { id: "f", text: "Leave everything as it is and close these by hand whenever the tills update overnight", why: "Every analyst at every TillPoint client loses time to the same wrong alert." } ],
      hints: ["What went wrong: the rule, the tills, or the feed?", "Fix the bad intelligence where it came from, narrowly, and put a date on it."],
      lesson: "Feedback to intelligence sources, narrow exceptions and review dates are how a SOC keeps threat feeds useful." },
  ],
  writeup: "POS-01 and POS-02 connect every 6 hours to 203.0.113.9, which a community feed lists as 'suspicious hosting' (confidence low, 1 source, added 2026-10-03). The address resolves to updates.tillpoint.example and is on TillPoint's published list of update servers. False positive caused by a bad feed entry. Marked false positive for TillPoint's servers, reported to the feed, review in 30 days. Could not be confirmed: why the feed listed it.",
  summary: [
    ["1.4", "Weighed the feed entry's confidence and sources", "Threat intelligence has quality, and triage weighs it", "Threat feeds · confidence · IOC quality"],
    ["1.3", "Searched the firewall log across both tills", "Tools show scope and context in one search", "Firewall logs · SIEM search"],
    ["3.3", "Called it a false positive, not a benign true positive", "Triage vocabulary is precise, and the exam tests it", "False positive · true positive"],
  ],
  proofs: [
    { query: 'source=firewall dest_ip="203.0.113.9" earliest=-7d | stats count by src_host dest_host', says: "both tills, the vendor's update host, regular traffic", check: r => r.count === 2 && r.rows.every(x => x.dest_host === "updates.tillpoint.example") },
    { query: "source=feed indicator=203.0.113.9", says: "the feed entry is low confidence, one source", check: r => r.count === 1 && r.rows[0].confidence === "low" && r.rows[0].sources === 1 },
    { query: "source=vendor vendor=TillPoint", says: "the vendor publishes this address as an update server", check: r => r.count === 1 && /203\.0\.113\.9/.test(r.rows[0].ips) },
  ],
},

/* ------------------------------------------------------------------ 5 */
{
  id: "VOO-1055", map: 5, time: "06:12:44", sev: "low",
  alert: "Failed sign-ins below lockout threshold", source: "Identity",
  client: "Nexxuss", entity: "11 accounts",
  attack: "T1110.003", sla: "Due 10:12",
  facts: [["Rule", "Failures below the lockout on several users in a week"], ["Lockout", "5 failures"], ["Protocol", "Legacy sign-in"]],
  tabs: [
    { title: "The alert", kind: "code", text: "RULE      Failed sign-ins below lockout, several users\nCLIENT    Nexxuss\nWINDOW    7 days\nLOCKOUT   5 failures" },
    { title: "Client context", kind: "list", items: ["Nexxuss's last company-wide password change was four months ago", "Legacy sign-in protocols are still allowed for two old printers", "Nobody has reported being locked out"] },
  ],
  search: { query: 'source=signin client=Nexxuss result=failure earliest=-7d | stats count dc(user) by src_ip', say: "Run this search to see where the failures come from." },
  guide: ["How many tries per account, and how many accounts?", "Run the search. Where do the failures come from?", "Is there an innocent reason, like a password change?", "Now search the same addresses without the client filter. Anything?", "Decide what it is, then how the rule should change.", "Write it up."],
  fizban: "Low priority: a handful of failed sign-ins, likely users mistyping passwords. Recommend closing.",
  decisions: [
    { id: "d1", slot: 1, prompt: "What is the most defensible reading of the failures at Nexxuss?",
    options: [
        { id: "a", correct: true, text: "Password spraying — two tries per account across many accounts, kept under the lockout" },
        { id: "b", text: "Brute force — a sustained attack trying many passwords against the same few accounts", why: "Brute force hammers one account. This is two tries each across eleven, deliberately under the lockout." },
        { id: "c", text: "Credential stuffing — passwords leaked from another site, being tried against Nexxuss", why: "Stuffing uses real leaked pairs and succeeds often. Every one of these failed, one password per account." },
        { id: "d", text: "Users mistyping after a password change, which is why the failures are spread so thinly", why: "The last password change was four months ago, and these come from hosting providers, not the office." },
        { id: "e", text: "MFA fatigue — an attacker pushing prompts until someone approves one of them by mistake", why: "No MFA was ever requested: legacy sign-ins fail at the password." },
        { id: "f", text: "A misconfigured printer retrying an old password on the legacy sign-in protocol", why: "Printers retry from the office, one account. These are eleven accounts from hosting addresses." } ],
      hints: ["Count the tries per account, and where they came from.", "An attack designed to stay under a lockout spreads a few guesses over many accounts."],
      lesson: "Spraying: few passwords, many accounts, under the lockout. Brute force: many passwords, one account. Stuffing: leaked pairs, often successful. The exam asks you to tell them apart." },
    { id: "d2", slot: 4, prompt: "How should the detection change, so a spray like this is caught early?",
    options: [
        { id: "a", correct: true, text: "Alert when one source fails against many accounts, across every client we watch" },
        { id: "b", text: "Lower Nexxuss's lockout to two failures, so the attacker locks the accounts out", why: "That locks real users out, which is a denial of service the attacker gets for free." },
        { id: "c", text: "Raise the rule to ten failing accounts an hour, so slow noise like this stops alerting", why: "A slow spray never reaches ten an hour. That's the point of it." },
        { id: "d", text: "Block these eleven addresses at the firewall and close the ticket as handled", why: "Spray crews rotate addresses daily. The pattern is the detection, not the address." },
        { id: "e", text: "Alert per account at three failures, as the rule for each client already does", why: "A spray is designed to stay under per-account counts. That's how it got past this one." },
        { id: "f", text: "Turn the rule off for Nexxuss until the old printers are replaced next quarter", why: "Blinds the client to the very attack in front of you." } ],
      hints: ["Search the same addresses without the client filter.", "One company sees a few failures. A SOC watching many companies can see the whole campaign."],
      lesson: "A managed SOC's advantage: it sees every client at once. Counting across clients turns invisible noise into a campaign." },
  ],
  writeup: "Failed sign-ins at Nexxuss: 23 failures across 11 accounts in 7 days, two per account, one password each, all over legacy sign-in from hosting-provider addresses, below the lockout of 5. The same addresses also failed against Payne School and the Steadfast Outpost. Password spraying. No successful sign-in from these addresses. Recommended rule: alert when one source fails against many accounts, counted across all clients. Recommend Nexxuss disables legacy sign-in. Could not be confirmed: who is behind it.",
  summary: [
    ["1.2", "Recognised spraying from the shape of the failures", "Identity indicators: tries per account, accounts per source", "Password spraying · brute force · credential stuffing"],
    ["1.5", "Proposed cross-client correlation", "Detection tuning is process improvement", "Correlation · thresholds · tuning"],
  ],
  proofs: [
    { query: "source=signin client=Nexxuss result=failure earliest=-7d | stats count by user", says: "no account has more than a few failures", check: r => r.count >= 10 && r.rows.every(x => x.count <= 3) },
    { query: 'source=signin src_ip="198.51.100.6*" result=failure earliest=-7d | stats dc(client)', says: "the same addresses hit three clients, which only a SOC can see", check: r => r.count === 1 && r.rows[0]["dc(client)"] === 3 },
  ],
},

/* ------------------------------------------------------------------ 6 */
{
  id: "VOO-1068", map: 6, time: "09:14:30", sev: "low",
  alert: "New devices on the store network (6)", source: "DHCP",
  client: "The Steadfast Outpost Thrift", entity: "6 hosts, 10.40.3.61–66",
  attack: "", sla: "Due 13:14",
  facts: [["Rule", "Devices never seen before, on the store VLAN"], ["Count", "6, within 12 minutes"], ["Names", "DESKTOP-…"]],
  tabs: [
    { title: "The alert", kind: "code", text: "RULE      First-seen devices on the store network\nCOUNT     6 in 12 minutes\nVLAN      store (the tills are on their own VLAN)" },
    { title: "Client context", kind: "list", items: ["Donation log, 29 September: six laptops donated by a local credit union", "A volunteer offered to 'get them online' this week", "The store sells refurbished laptops"] },
  ],
  search: { query: "source=dhcp first_seen=yes | table time host ip vlan os_guess browser_guess", say: "Run this search to see what joined." },
  guide: ["What joined, when, and which network?", "Run the search. What do the names and software versions suggest?", "Is there anything in the client's own records that explains it?", "Decide what it is, and what the risk actually is.", "Write it up."],
  fizban: "Six unknown devices joined within minutes. Possible rogue devices or a spreading infection. Recommend blocking them at the switch.",
  decisions: [
    { id: "d1", slot: 3, prompt: "What is the most defensible reading of the six new devices?",
    options: [
        { id: "a", correct: true, text: "The donated laptops going online — an asset inventory gap, and old software, not an attack" },
        { id: "b", text: "Rogue devices placed by an intruder — block them at the switch and look for who plugged them in", why: "The donation log explains them: six laptops, set up by a volunteer this week." },
        { id: "c", text: "A worm spreading — new hosts appearing in minutes is how an infection moves across a network", why: "A worm infects existing machines; it doesn't create new ones with new hardware addresses." },
        { id: "d", text: "An evil-twin access point handing out addresses to lure the tills onto a fake network", why: "These are clients receiving addresses from the store's own DHCP, not a new access point." },
        { id: "e", text: "Nothing at all — close it, since the store sells laptops and these are obviously stock", why: "They are the store's, but they run a 2021 system and browser. That is a real risk to note." },
        { id: "f", text: "A DHCP starvation attack using up the store's address pool with fake device names", why: "Six leases isn't starvation, and the names and system versions look like real laptops." } ],
      hints: ["Read the client context before the device list.", "You can't protect what you don't know you own."],
      lesson: "Asset inventory is the first control. New devices aren't attacks, but unknown, unpatched ones are exactly what attackers use." },
    { id: "d2", slot: 5, prompt: "What should happen next?",
    options: [
        { id: "a", correct: true, text: "Ask the store to keep them offline until they're inventoried, patched and scanned" },
        { id: "b", text: "Block their hardware addresses permanently so they can never join the store network", why: "They belong to the store now. Blocking them for ever doesn't make them safe; patching does." },
        { id: "c", text: "Close it as benign; the volunteer will sort the software out before they're sold", why: "Nobody has checked they will. A 2021 browser on the store network is a risk today." },
        { id: "d", text: "Reimage all six remotely tonight so they start clean in the morning", why: "Not a change for a Tier 1 analyst to make on the client's devices." },
        { id: "e", text: "Move them to the guest Wi-Fi quietly, and tell nobody so the store isn't worried", why: "Hiding a fix from the client isn't how a SOC works, and the guest network isn't an inventory." },
        { id: "f", text: "Escalate to Tier 2 as a possible insider installing unauthorised hardware", why: "The donation log explains it. There's no insider here, just a process gap." } ],
      hints: ["Whose devices are they, and what would make them safe?", "The analyst recommends; the client acts on its own devices."],
      lesson: "Inventory, patching and scanning come before a device is trusted. The analyst recommends; the client acts." },
  ],
  writeup: "Six first-seen devices on the Steadfast Outpost store VLAN between 09:02 and 09:12 (DESKTOP-Q7K2 and five more, 10.40.3.61–66), Windows 10 21H2 with Chrome 96. The donation log records six laptops donated on 29 September and set up by a volunteer. Benign: an asset inventory gap. Recommended the store holds them off the network until inventoried, patched and scanned. Could not be confirmed: what software is installed beyond the operating system and browser.",
  summary: [
    ["2.1", "Spotted devices missing from the inventory", "Scanning starts from knowing what you own", "Asset inventory · discovery"],
    ["1.2", "Read DHCP data for what joined, and when", "New devices are an indicator to explain, not to fear", "DHCP · rogue devices · evil twin"],
  ],
  proofs: [
    { query: "source=dhcp first_seen=yes | stats count dc(host) by os_guess", says: "six new laptops, all on an old Windows build", check: r => r.count === 1 && r.rows[0].count === 6 && /21H2/.test(r.rows[0].os_guess) },
  ],
},

/* ------------------------------------------------------------------ 7 */
{
  id: "VOO-1071", map: 7, time: "15:32:10", day: "Yesterday", sev: "low",
  alert: "Peer-to-peer traffic to many hosts", source: "Netflow",
  client: "The Steadfast Outpost Thrift", entity: "Galaxy-Tab-S7 (guest Wi-Fi)",
  attack: "", sla: "Due 11:32",
  facts: [["Rule", "One device, UDP to many external hosts"], ["When", "Yesterday, from 15:30"], ["Network", "Guest Wi-Fi"]],
  tabs: [
    { title: "The alert", kind: "code", text: "RULE      Peer-to-peer: one host, many external peers\nHOST      Galaxy-Tab-S7  10.40.9.23  (guest VLAN)\nPEERS     9 addresses, UDP\nSTARTED   yesterday 15:30" },
    { title: "Client context", kind: "list", items: ["A volunteer's teenager waits in the back room after school", "Guest Wi-Fi is separated from the store and till networks", "Volunteer rota: the afternoon shift starts at 15:00"] },
  ],
  search: { query: "source=netflow src_host=Galaxy-Tab-S7 | stats count sum(bytes_out) sum(bytes_in) by dest_port proto asn", say: "Run this search to see what the tablet was doing." },
  guide: ["Which network is the device on, and what can it reach?", "Run the search. Which ports, which network, and which way does the data go?", "Is there anything in the client's records that explains it?", "Decide what it is, then how the rule should behave here.", "Write it up."],
  fizban: "Peer-to-peer traffic to many external hosts: possible botnet participation. Recommend blocking the device and scanning it.",
  decisions: [
    { id: "d1", slot: 6, prompt: "What is the most defensible reading of the peer-to-peer traffic?",
    options: [
        { id: "a", correct: true, text: "Online gaming on the guest Wi-Fi — small, even flows to a game network, apart from the tills" },
        { id: "b", text: "Botnet traffic — one device talking to many peers is how compromised machines take orders", why: "The peers belong to a game network, on game ports, with small symmetric traffic, starting when school let out." },
        { id: "c", text: "Data exfiltration — traffic to nine outside addresses, so find out what is leaving the store", why: "Bytes in match bytes out. Nothing large is leaving." },
        { id: "d", text: "File sharing of pirated films, which is the usual reason for peer-to-peer traffic on a network", why: "File sharing moves large volumes on other ports. This is game traffic, a few hundred bytes at a time." },
        { id: "e", text: "Part of a denial-of-service attack — the tablet is flooding the nine addresses with UDP", why: "Under a kilobyte per flow is not a flood." },
        { id: "f", text: "A cryptominer on the tablet, connecting out to a mining pool for work", why: "Mining pools use their own ports and steady long connections, not game ports and short flows." } ],
      hints: ["Search by port, network and direction, then read the client context.", "Many peers is a pattern. The ports, the network and the timing decide what it means."],
      lesson: "Peer-to-peer is not a verdict. Ports, destinations, volume and direction tell gaming from botnets from file sharing." },
    { id: "d2", slot: 2, prompt: "How should the peer-to-peer rule behave at the store from now on?",
    options: [
        { id: "a", correct: true, text: "Lower its severity for the guest network only, and keep it at full strength on the store network" },
        { id: "b", text: "Turn the peer-to-peer rule off for every client, since this was the only alert it raised this week", why: "One benign alert doesn't make the rule useless everywhere." },
        { id: "c", text: "Ban the teenager's tablet from the guest Wi-Fi so the alert doesn't come back again", why: "Not a SOC decision, and it fixes a person instead of the rule." },
        { id: "d", text: "Switch the guest Wi-Fi off entirely, since nobody should be gaming at a charity shop", why: "A business decision for the store, not the SOC, and not a security fix." },
        { id: "e", text: "Suppress every alert from the Steadfast Outpost, since nothing there is ever malicious", why: "A blind spot is exactly what an attacker hopes for." },
        { id: "f", text: "Leave the rule alone and close this again by hand every afternoon it happens", why: "An analyst closes the same benign alert every school day." } ],
      hints: ["What's different about the guest network from the store network?", "Tune for the place, not the person: where it runs matters as much as what it is."],
      lesson: "The same traffic means different things on different networks. Good tuning follows network segments." },
  ],
  writeup: "Peer-to-peer alert: Galaxy-Tab-S7 (10.40.9.23) on the Steadfast Outpost guest Wi-Fi, from 15:30 yesterday, UDP on game ports to a game network, under a kilobyte per flow and even in both directions. The volunteer rota and the client context explain a teenager gaming after school. The guest network is separated from the store and till networks. Benign. Proposed tuning: lower severity on the guest network only. Could not be confirmed: whose device it is.",
  summary: [
    ["1.2", "Read ports, destinations and direction", "Network indicators need context before verdicts", "Peer-to-peer · botnet · exfiltration"],
    ["1.3", "Summarised netflow with a stats search", "Summaries show patterns rows hide", "Netflow · SIEM stats"],
    ["3.3", "Decided benign, with the evidence", "Triage is deciding what an alert means", "Benign · true positive"],
  ],
  proofs: [
    { query: "source=netflow src_host=Galaxy-Tab-S7 proto=udp | stats sum(bytes_out) sum(bytes_in) by asn", says: "UDP to a game network, in and out roughly even", check: r => r.count === 1 && r.rows[0].asn === "Game network" && Math.abs(r.rows[0]["sum(bytes_out)"] - r.rows[0]["sum(bytes_in)"]) < 0.3 * r.rows[0]["sum(bytes_in)"] },
  ],
},
];
