# Veterans Overcoming Odds SOC — CySA+ build document

**Status: DESIGN ONLY. No code until the owner says "build".**

Last updated **24 September 2026**. Supersedes the paused notes in
`/home/user/rafikiscyent888/cysa-build/CLAUDE.md`.

| | |
|---|---|
| Repository | `RafikiScyent888/Veterans-Overcoming-Odds-SOC` — currently a README only |
| Site | `rafikiscyent888.github.io/Veterans-Overcoming-Odds-SOC/` |
| Exam | **CompTIA CySA+ V4, CS0-004** (see section 3) |
| README | Written **after** the design conversation, not before |

## 0. How this conversation runs — SETTLED 24 September

- **Talk every detail out before building anything.** The Security build took
  longer because it was talked out over several days first, and it was better
  for it.
- **This file is updated every 3 hours until it is time to build.** A routine
  fires into the session to do it. Conversations have disappeared overnight
  before — this file is the memory. The container is temporary: **only a copy
  in the owner's hands survives a rebuild**, so the file is sent to the owner
  whenever it changes.
- **Trigger phrases: "Any questions?" and "Got it?"** Both mean: stop, re-read
  the coaching role in `/root/.claude/exam-prep-coach.md`, and interview before
  going further. The owner: *"This is very important because you are getting
  better at building what I need to build for my students."*
- Every standing rule in `/root/.claude/CLAUDE.md` applies in full — never
  push, zip on request only, AAA on painted pixels, dyslexia toggle that
  persists, royal palette with previews for anything else, the hint ladder,
  six options one correct five wrong, five additional scenarios, PIN 3693,
  calibrate before believing, objectives first, previews during.

> **Read the confidence markers.**
>
> | Marker | Means |
> |---|---|
> | **SETTLED** | The owner decided it. Build to this |
> | **RECOMMENDED** | Claude's proposal, with reasoning. Not decided |
> | **OPEN** | Genuinely undecided. Do not invent an answer |
> | **REJECTED** | Proposed and turned down. Do not propose again |

---

## 1. What the owner has decided — SETTLED 24 September

### A fresh world, because veterans spot patterns

> "It is a fresh world because I do not want any bleed over because my
> students will notice the pattern as veterans we are taught to look and notice
> the patterns a lot faster than your average student that is why we are
> starting fresh."

This is the governing constraint of the whole build. Every choice below is
tested against it. See section 8, the bleed-over register.

### RafikisITS stays. Everything around it changes.

> "Yes, we are going to keep it RafikisITS. The business will change."

The company name is the deliberate bridge from Security. **Every client,
competitor, supplier and staff name changes**, to a new pool the owner is
supplying. Section 9 lists every name from the Security build to be replaced.

### The student has switched seats — and must be told so, plainly

> "Let's say to the student as they start looking into this that you have
> switched seats from owner to analyst. This needs to be clear to them as they
> work through this. This is the next step from Security. CySA is a fine tuning
> from security."

In Security the student owned the business and signed the contracts. Here they
are an analyst. They cannot see the contracts; they can read the packet capture.

### Keep the official objectives, reworded for teaching

> "Yes, keep the official objectives list, we will have to reword them as we
> build due to this is a teaching tool."

The official list is the source of truth. Student-facing wording is rewritten
for teaching; the mapping back to the official item is kept.

### All five artifact types

Scanner output with CVEs, CVSS, hosts and false positives · a SIEM query result
· EDR process telemetry · a log excerpt · a packet summary.

### All attack methods

> "Yes, I need all of the attack methods in this build. I need to get my
> students ready to get an entry level position in a SOC."

The list is **OPEN** — section 11 holds the candidates for confirmation.

### Vulnerability management as a discipline

> "They need to read and fix vulnerability management as a discipline. They
> need to understand the CVSS score and the other scoring systems. They do not
> have the time to sort through 400 'positives'. They also need to know how to
> fine tune the scanners and how to ensure that the anti-malware signatures stay
> up to date and any other details that I am missing. Double check with me about
> the other missing details. **I only want to add the missing details that we
> are covering in class.**"

That last sentence is a rule. Section 10 lists candidate details, each marked
with whether the class reference material covers it. **Nothing is added until
the owner confirms it is taught.**

### Efficiency and process improvement — included, toward the end

> "We need to include this. This seems like it should be added towards the end."

### Pull the essentials out of Security Tiers 4 and 5 — into NEW scenarios

> "I want to pull out the essential need-to-know material and put it into new
> scenarios."

The *concepts* carry. The scenarios, names and plot do not. Section 12.

### AI in security operations

The owner has closed the reference-material gap on his side. The official V4
objectives now carry AI use, governance and risk (section 3).

### No cutting corners

> "We can not get lazy when it comes to teaching the students the right way of
> doing things."

---

## 2. REJECTED — do not propose again

| Proposal | Why it was turned down |
|---|---|
| Keep the Security clients (Motorpool, Royal Smile, Coriakin…) and move the student down the org chart | Bleed-over. Veterans recognise patterns fast |
| The same incident from two chairs — Security Tier 5 and a CySA tier sharing one night | Bleed-over. The student would carry the answer across |

---

## 3. The exam — CS0-004 — research, 24 September

The owner had no reference material on the 003 → 004 changes and asked for
reliable sources.

**What can and cannot be said with confidence.** CompTIA's own pages exist and
were found, but **this container's network proxy blocks comptia.org and
totalsem.com**, so they could only be read through search-engine summaries, not
opened directly. Every fact below that appears as CONSISTENT was reported the
same way by CompTIA-hosted pages and by Total Seminars (Mike Meyers' company, a
long-standing CompTIA publisher), and several of them also match the objectives
the owner pasted independently.

| Fact | Confidence |
|---|---|
| CS0-004 launched **23 June 2026** | CONSISTENT — CompTIA and Total Seminars |
| Domain weights **34 / 26 / 24 / 16** | CONSISTENT — and matches the owner's pasted list exactly |
| CS0-003 weights were **33 / 30 / 20 / 17** | CONSISTENT |
| **Incident Response +4, Vulnerability Management −4** — the biggest shift | CONSISTENT |
| Same format: max 85 questions, 165 minutes, 100–900, pass 750 | CONSISTENT |
| Same four domain names — "an evolution, not a reinvention" | Total Seminars |
| New: **AI use, AI governance, AI risk** across the analyst workflow | CONSISTENT |
| New: **EPSS** for vulnerability prioritisation | CONSISTENT |
| More emphasis on **Zero Trust (ZTNA), identity-based controls and attacks, cloud, social engineering, automation** | CONSISTENT |
| CS0-003 retires in English **22 December 2026** | Third-party only — **confirm** |
| SBOM, XDR, SASE as new topics | Low-reliability third-party only — **do not rely on** |
| What was REMOVED | **Not found in any reliable source** |

**What this means for the build:** teach CS0-004. Anyone sitting the exam from
2027 has no choice. Weight Incident Response more heavily than the Security
build's instincts would suggest.

**The full official objectives document** — with every sub-objective — is
still needed. It sits behind a form on comptia.org and is available to the
owner through the CompTIA Instructor Network. Paste it between
`[OBJECTIVES START]` and `[OBJECTIVES END]`. **No sub-objective number is to be
invented**; the Security build fails its own checks when one is.

### The four domains, as the owner supplied them

**Security Operations (34%)** — architecture concepts, identity and logging in
security operations · analyse indicators across network, endpoint, cloud and
identity · use SIEM, EDR, packet analysis and threat intelligence tools ·
threat intelligence and threat-hunting concepts · efficiency and process
improvement · AI in security operations.

**Vulnerability Management (26%)** — implement the appropriate scanning method ·
analyse output from assessment tools · prioritise and mitigate with scoring,
threat intelligence and business context · control types, risk and
vulnerability management concepts.

**Incident Response and Management (24%)** — attack methodology frameworks
(ATT&CK, Cyber Kill Chain) · the IR process from preparation to recovery · IR
techniques: triage, evidence handling, escalation, remediation, root cause.

**Reporting and Communication (16%)** — vulnerability management reporting and
communication · incident reporting, post-incident review, and metrics such as
detection time, response time and remediation effectiveness.

### Sources

- [CompTIA — CySA+ V4 (New Version)](https://www.comptia.org/en-us/certifications/cybersecurity-analyst/v4/)
- [CompTIA Blog — CySA+ V4 Exam: Your Questions Answered](https://www.comptia.org/en-us/blog/the-new-comptia-cybersecurity-analyst-cysa-your-questions-answered/)
- [CompTIA press release — CySA+ update](https://www.comptia.org/en-em/about-us/news/press-releases/CompTIA-updates-CySA-certification-to-address-rising-cyber-threats-and-evolving-skills-needs/)
- [Total Seminars — CS0-003 vs CS0-004](https://totalsem.com/cysa-cs0-003-vs-cs0-004/)
- [Total Seminars — What is new in CS0-004](https://totalsem.com/comptia-cysa-plus-changing-june-23-cs0-004-what-is-new/)

---

## 4. The class reference material — `RafikiScyent888/CySA-Sims`

Supplied 24 September as "reference material for you to help you build".
Nineteen simulations, eleven answer keys, three student guides, an
explanations document and an Nmap cheat sheet. **This is the evidence for what
is covered in class** — which is the owner's test for adding any detail.

### What the class material teaches

| Area | Specifics in the material |
|---|---|
| **Command output** | `netstat -bo`, `tasklist`, comparing running binaries against a baseline hash list |
| **Nmap** | Port → service → server role; `-sV`; plaintext and legacy ports as non-compliant (Telnet 23, FTP 21, HTTP 80, SMTP 25, DNS 53 where not needed) |
| **CVSS and remediation** | Severity bands mapped to patch windows (7 / 14 / 30 days) and by environment (PROD / UAT / DEV); fix the root cause, not the symptom |
| **Configuration verification** | TLS version, software version currency, non-default ports |
| **Web findings** | Unencrypted sessions, cookie flags (Secure, HttpOnly, SameSite), expired certificates, **"Submit a Non Issue"** as a correct disposition |
| **OWASP Top 10** | Classification, with CVSS triage (Analyst Workbench) |
| **Logs** | Internal vs external source, failed-login patterns, 404 noise, file modification as an IOC, SFTP abuse |
| **SIEM** | Windows **Event ID 4688** (process creation); count unique hosts, not rows |
| **Phish to C2** | Email gateway → proxy **GET** (clicked) → proxy **POST** (submitted) → repeated outbound → firewall confirmation |
| **Beaconing** | Repeated outbound, small consistent payloads, regular intervals, same host and User-Agent — and legitimate telemetry that looks the same |
| **Endpoint** | Process trees, parent/child, Office spawning PowerShell, encoded commands, living-off-the-land binaries, user-writable paths |
| **Persistence** | Scheduled tasks, services, registry run keys, startup folder; **execution is not persistence** |
| **Web exploitation** | Directory traversal including encoded and double-encoded forms; sensitive targets (`/etc/passwd`, `/etc/shadow`, `.env`, `win.ini`); **attempt versus success**; WAF correlation |
| **Frameworks** | Cyber Kill Chain mapping; security controls mapped to each stage |
| **Tickets and triage** | IOC triage under time pressure; ticket classification |
| **Root cause** | Resource contention (help desk) |

### The teaching principles in the student guides — ADOPT

These are the owner's method, already written down, and they are exactly what
the artifact reader has to teach:

1. **Start with the evidence, not the alert label**
2. **Follow the evidence in order** — "Do not jump between tabs randomly.
   Analysts follow evidence step by step"
3. **Separate attempt from success, and execution from persistence**
4. **Legitimate look-alikes are included on purpose** — noise is part of the
   exercise
5. **Choose the most defensible conclusion** — "what the evidence proves, not
   the worst-case scenario. Avoid over-classification"
6. **Count unique entities, not rows**

Point 2 is the instructor's "spine" from the Security build, already present in
the class material. That is strong confirmation the SOC gets one.

### Do NOT reuse from the reference material

Students have done these labs. Same skills, **new artifacts, new numbers, new
answers** — or they will be recognised on sight:

- the five-server Nmap role exercise (`192.168.1.10`–`.50`)
- `svchost.exe` in Event 4688, "25 clicked / 15 infected"
- `cmd.exe` on PID 1916 to `47.31.32.101`
- `41.21.18.102` and the `sjames` SFTP account
- `invoice.exe` from `81.161.63.253`
- the IIS CVSS 9.2 server `192.168.76.5`
- `secure-credential-update.company-portal.com`

### Answer-key mappings to check before anything is carried over

Two mappings in the reference answer keys don't match the model the exam uses.
Recorded so they are not copied into the new build unchecked — **the owner's
call, not a correction of his material**:

- **Kill Chain PBQ:** *Reconnaissance = Phishing* and *Installation =
  Encryption.* In the Lockheed Martin model phishing is **Delivery**, and
  encrypting the victim's files is **Actions on Objectives** — the explanations
  document itself notes phishing "is sometimes seen in delivery"
- **Security Incident PBQ:** *Data Exfiltration → Disk-level encryption.*
  Full-disk encryption protects data at rest on a device that is off or stolen;
  on a running, compromised host the data is already decrypted, so it does not
  stop exfiltration. Egress filtering or DLP is the usual control

---

## 5. The engine — same, or start fresh? — RECOMMENDED

**The owner's question:** "Are you able to keep the same engine and still make
changes or is it better to start fresh? Again, we need to do our best to have no
bleed over and not to copy patterns that my students will see."

**Students never see the engine.** They see the interface, the wording, the
scenario shapes, the names — and the **answer patterns**. That is where bleed
lives, and rebuilding invisible code protects none of it.

| | Recommendation |
|---|---|
| **Keep, as a copy in this repo** | The decision rules, hint ladder, save and restore, theme and dyslexia persistence, contrast verifier, plant harness. Independently proved, and rebuilding them only reintroduces the bugs already found. Each site is its own repo, so nothing is shared at run time |
| **Build new** | Everything the student sees: the SOC console, the queue, the artifact reader, the triage board, the framework mapper, the visual identity, the voice, every scenario |
| **Will look the same, deliberately** | The owner's program-wide rules: six options, the hint ladder timing, wrong stays red three ways, AAA, dyslexia toggle, footer. That is the Cyber Warrior signature, not bleed |
| **Must NOT carry** | Anything that helps a student *solve* — see section 8. Two answer tells were found in the Security build on 24 September |

### The two answer tells found in the Security build — design rules for this one

Measured across Security's 22 six-option sets:

- **The correct answer is the longest option in 20 of 22 (91%).** Chance would
  be about 4 (17%)
- **The correct answer is in slot 3 in 15 of 22 (68%), and never in slots 1, 5
  or 6.** Tiers 2–5 render options in the order they were written

A veteran who plays three sets learns "the long one in the middle." For this
build, from day one:

- **Options are shuffled**, deterministically by seed, so an instructor can
  still say "option four" to the room
- **Distractors are written to the same length and specificity as the correct
  answer**, and a verifier fails the build if correct-is-longest runs above
  chance across the whole set
- Other classic tells get the same treatment: absolute words ("always",
  "immediately") appearing only in wrong options; the question's key words
  echoed only in the right one

---

## 6. The spine of the SOC — RECOMMENDED

**The owner's question:** "Is this going to be the spine of the SOC?" — of the
artifact reader, triage board, framework mapper and scan configuration.

**None of the four on its own. The spine is the queue.**

A real SOC analyst's day is a ticket queue: something arrives, you open it,
read the evidence, decide, and write it up. Every CySA domain passes through
that same loop:

| Domain | In the queue |
|---|---|
| Security Operations | What arrives, and reading it — SIEM, EDR, logs, packets |
| Vulnerability Management | Scan findings arrive as a queue too — four hundred of them |
| Incident Response | The ticket that escalates |
| Reporting and Communication | Closing the ticket, and writing it so someone else can act on it |

The four primitives are **tools you use inside a ticket**. The artifact reader
is the one used in almost every ticket, so it is closest to a spine — but it is
the queue that holds the build together.

**Vulnerability Management is the first thing to build**, not the spine:
26%, nothing exists for it yet, and it is where the owner's class material is
deepest.

The advisory guide from the Security build — the instructor's "spine" — also
comes across, as a new method for the new seat. The class guides already
describe it: evidence first, in order, then conclude.

---

## 7. The seat change — how it is made clear — RECOMMENDED

- **The very first screen says it in plain words.** In Security you owned the
  business and signed the contracts. Here you are an analyst in the SOC. You
  cannot see the contracts. You can read the packet capture. CySA is the fine
  tuning of what Security taught
- **The role stays on screen** throughout — the analyst tier, not a company
  owner — and can change as they progress
- **The seat changes what is correct.** An owner decides whether to tell a
  client. An analyst escalates with evidence so that somebody else can decide.
  Many right answers in this build are "escalate, with this in the ticket" —
  which is the real job, and a genuine difference from Security

---

## 8. Bleed-over register

Every design decision is checked against this list.

### Must not carry from Security

| Pattern | Why a veteran would catch it |
|---|---|
| Narnia staff names with Tolkien names for insiders, and the Tier 5 break | "Odd name = insider" is learned in two tiers. **The new naming scheme carries no signal at all** |
| "Nothing here is out of place" on every verdict board | They learn one option is always the null |
| "Preserve first" / "contain first" as the right answer | They learn to pick the evidence-preserving option without reading |
| Longest option is correct; correct option sits in slot 3 | Section 5 |
| The one-character lookalike domain | They will spot it instantly |
| A "clean house" scenario per set | They will hunt for the nothing-wrong case |
| The home network, the router, the IoT cameras | The whole Tier 1 world |
| The card layout and rail labels | Visual recognition |

### Must not carry from the class sims

Section 4's list — same skills, new data.

### Deliberately the same — the program's signature

Six options, one correct · the hint ladder · wrong stays red, marked three ways
· AAA on painted pixels · dyslexia toggle · royal palette · footer · PIN 3693.

---

## 9. Every name in the Security build — for the owner to replace — OPEN

The owner asked for these so he can rename them now, and will supply a new
pool. **RafikisITS is the only name that stays.**

### Businesses

| Security name | Role in Security |
|---|---|
| **RafikisITS** | The company — **KEPT** |
| Claw Perfect Trim and Cleaning | Tier 2 client, break-fix |
| 6th Cup for the 6th Hour | Tier 3 client, PCI |
| Motorpool of PMCS | Tier 3 client, three sites; Tier 5 espionage target |
| Third Chance Thrift Stores | Non-profit client; Tier 4 fraud victim |
| Royal Smile | Tier 4 client, dental, HIPAA |
| Novoon | Tier 4 client, nine sandwich shops |
| J. Fenty Jr School | Tier 5 client, welding trade school |
| Nari Motor Tools | Tier 5 competitor behind the espionage |
| Igol Tech Keepers | Tier 5 rival IT firm, innocent |
| Prism Fibre | ISP |
| Netcom Cable | ISP |

### Other names

| Security name | What it was |
|---|---|
| `rafikislTS.com` | The lookalike domain |
| `rafikisITS@gmail.com`, `truman@gmail.com` | Business and personal mail |
| VeteransOvercomingOdds (VOO) | A Security pane — and now this repository's name. **OPEN: how does VOO relate to RafikisITS here?** |

### People

| Security name | Role |
|---|---|
| Glimfeather | Lower admin, investigator |
| Sam | Tier 3 accidental insider |
| Pippin | Tier 4 insider |
| Coriakin | Tier 5 insider |
| Lucy, Digory | Staff |
| Edmund, Caspian, Jill, Aravis, Helen, Rilian | Remote staff |
| Frank, Trumpkin | Field techs |
| Dana | Client contact — two of them, the autofill trap |
| Merry | Named early as an insider, later replaced |

**OPEN:** do the people change as well as the businesses? **RECOMMENDED: yes** —
the naming convention is itself the strongest pattern in the Security build.

---

## 10. Vulnerability management — details to confirm against class — OPEN

The owner's rule: only add what is covered in class. **In class** means it
appears in the CySA-Sims reference material.

| Detail | In class? | Notes |
|---|---|---|
| CVSS severity bands and scores | **Yes** | Remediation SLA by band |
| Remediation windows by environment (PROD / UAT / DEV) | **Yes** | |
| Fix root cause, not symptom | **Yes** | |
| Nmap service and role identification | **Yes** | |
| Configuration verification — TLS, versions, ports | **Yes** | |
| Web findings — session encryption, cookie flags, certificates | **Yes** | |
| OWASP Top 10 classification | **Yes** | |
| False positives and "non-issue" dispositions | **Yes** | |
| Scanner tuning | Owner: **yes** | Not yet in the reference sims |
| Anti-malware signatures kept current | Owner: **yes** | Not yet in the reference sims |
| **EPSS** — likelihood of exploitation | ? | **Named as new on CS0-004** |
| CVSS versions — v3.1 and v4.0 | ? | |
| CISA KEV — known exploited vulnerabilities | ? | |
| SSVC and vendor severity | ? | |
| Credentialed vs non-credentialed scans | ? | |
| Agent vs agentless, active vs passive | ? | |
| Internal vs external scanning, scanner placement | ? | |
| Scan scope, exclusions, windows, fragile systems | ? | |
| Web app scanning, SAST / DAST / SCA | ? | |
| Cloud posture and container image scanning | ? | |
| Asset inventory and discovery | ? | |
| Exceptions, risk acceptance, compensating controls | ? | |
| Inhibitors to remediation — legacy, SLAs, business interruption | ? | |
| Change management, maintenance windows, rollback | ? | |
| Rescan to validate the fix | ? | |
| Agent health and tamper protection | ? | |
| VM reporting — trends, recurring findings, time to remediate | ? | |

---

## 11. Attack methods — candidates — OPEN

The owner wants **all** attack methods, for entry-level SOC readiness. Anchored
to the official objectives once supplied. Marked where the class reference
already teaches it.

| Group | Methods | In class |
|---|---|---|
| Social engineering | Phishing, spear phishing, whaling, smishing, vishing, BEC, pretexting, lookalike domains | Phishing |
| Credentials and identity | Brute force, password spraying, credential stuffing, MFA fatigue, pass-the-hash, pass-the-ticket, Kerberoasting, session and token theft, SIM swap, impossible travel | Brute force, compromised credentials |
| Malware | Ransomware, trojan and RAT, worm, rootkit, keylogger, spyware, botnet, fileless and living-off-the-land, logic bomb | Ransomware, LOLBins |
| Network | DoS and DDoS, on-path, ARP and DNS poisoning, DNS tunnelling, C2 beaconing, scanning and reconnaissance, rogue AP and evil twin | C2 beaconing, scanning |
| Web and application | SQL injection, XSS, CSRF, SSRF, directory traversal, file inclusion, command injection, deserialisation, buffer overflow | SQLi, XSS, directory traversal |
| After the foothold | Execution, persistence, privilege escalation, lateral movement, defence evasion and log clearing, exfiltration | Execution, persistence, lateral movement, exfiltration |
| Cloud | Exposed storage, leaked keys, consent phishing, misconfiguration | — |
| Supply chain and insider | Compromised update, malicious and accidental insider | — |
| AI-related | Prompt injection, data poisoning, deepfake voice and video in social engineering | — |
| Delivery | Drive-by download, watering hole, malicious attachment | Drive-by, attachment |

---

## 12. The essentials from Security Tiers 4 and 5 — as concepts, for new scenarios

The owner: pull out the need-to-know, put it into **new** scenarios. The
concepts carry; nothing else does. Reframed for the analyst's seat:

| Concept | In the analyst's seat |
|---|---|
| Preserve evidence before changing anything | What goes in the ticket before the fix |
| A configuration change and content leaving are different sensors | Which log source would have caught it |
| Revoke sessions and tokens, not just passwords | Reading authentication after a reset |
| Non-human credentials outlive a disabled account | An API key authenticating at 2am |
| SPF, DKIM and DMARC prove origin, not legitimacy | Reading mail headers |
| A signature proves origin, not trustworthiness | A signed update that is malicious |
| Automation has a blast radius | Staged deployment, seen from the console |
| Log retention decides what can be proved | "We can see 60 days of this" |
| Individual baselines fail on somebody planted from day one | Peer-group comparison |
| Thresholds start loose and are tuned tighter | Tuning — ties straight into scanners and SIEM |
| Deception manufactures the evidence you are short of | Honeytokens |
| Insider alerts cannot go to a queue the suspect reads | Escalation outside the normal channel |
| State what you can evidence, characterise what you cannot | Every write-up |

---

## 13. Tier shape — a first proposal to react to — RECOMMENDED

Not decided. Each tier touches every domain, weighted differently.
Efficiency and process improvement sits near the end, as the owner asked.

| Tier | Working title | Heaviest domain |
|---|---|---|
| 1 | First shift — the queue, reading alerts, learning normal, false positives | Security Operations |
| 2 | The scan — configuration, scoring, four hundred findings down to the few, tuning, signatures | Vulnerability Management |
| 3 | Endpoint and wire — EDR, packets, indicators across network, endpoint, cloud and identity; ATT&CK and Kill Chain | Security Operations + IR |
| 4 | The incident — the full IR process, evidence handling, escalation, root cause | Incident Response (up 4% on V4) |
| 5 | Maturity — efficiency, automation, metrics, AI in the SOC, reporting to leadership | Reporting + efficiency + AI |

Reporting is not only Tier 5 — every ticket ends in a write-up.

---

## 14. Everything still OPEN

| | Owner to supply or decide |
|---|---|
| Official CS0-004 objectives document | With every sub-objective |
| New name pool | Businesses — and people? |
| VOO and RafikisITS | How do they relate in this world? |
| Vulnerability management details | Section 10: which are taught in class |
| Attack methods | Section 11: strike anything not taught, add anything missing |
| Engine | Section 5: confirm |
| Spine | Section 6: confirm the queue |
| Tier shape | Section 13 |
| Where AI in security operations sits | Near the end with efficiency, or throughout? |
| Security build answer tells | Fix them there too? Something is already in instructors' hands |

---

Footer for the eventual build:

> Cyber Warrior Program — built by an instructor, for students, to make
> certification study more interactive. For educational purposes only. Not
> affiliated with, endorsed by, or sponsored by CompTIA®. All trademarks
> belong to their respective owners.
