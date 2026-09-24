# Veterans Overcoming Odds SOC — CySA+ build document

**Status: DESIGN ONLY. No code until the owner says "build".**

Last updated **24 September 2026, eighth pass — objective list with numbers, crawl-walk-run, the live screens, ticket 003**. Supersedes the paused notes in
`/home/user/rafikiscyent888/cysa-build/CLAUDE.md`.

| | |
|---|---|
| Repository | `RafikiScyent888/Veterans-Overcoming-Odds-SOC` — design documents on `main` and the branch; no site code yet |
| Site | `rafikiscyent888.github.io/Veterans-Overcoming-Odds-SOC/` |
| Exam | **CompTIA CySA+ V4, CS0-004** (see section 3) |
| README | Written **after** the design conversation, not before |

## 0. How this conversation runs — SETTLED 24 September

- **Talk every detail out before building anything.** The Security build took
  longer because it was talked out over several days first, and it was better
  for it.
- **Backed up to GitHub — SETTLED 24 September.** The owner:
  "If you are now able to commit to GitHub, please do so as to not lose the
  work we do together" — then **"No push to main"** — and minutes later
  **"Push it main."** The last word stands. This repository only: work is
  committed on `claude/student-resources-knowledge-base-vgvfni` and pushed to
  both that branch and `main`. Until "build" there is no site code, so `main`
  carries design documents only. Every other repository keeps the never-push
  rule
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

Every method in section 11 is in — settled in the second pass.

### Vulnerability management as a discipline

> "They need to read and fix vulnerability management as a discipline. They
> need to understand the CVSS score and the other scoring systems. They do not
> have the time to sort through 400 'positives'. They also need to know how to
> fine tune the scanners and how to ensure that the anti-malware signatures stay
> up to date and any other details that I am missing. Double check with me about
> the other missing details. **I only want to add the missing details that we
> are covering in class.**"

Superseded in the second pass by "I need to teach everything" — every
detail in section 10 is in the build.

### Efficiency and process improvement — included, toward the end

> "We need to include this. This seems like it should be added towards the end."

### Pull the essentials out of Security Tiers 4 and 5 — into NEW scenarios

> "I want to pull out the essential need-to-know material and put it into new
> scenarios."

The *concepts* carry. The scenarios, names and plot do not. Section 12.

### AI in security operations

The owner has closed the reference-material gap on their side. The official V4
objectives now carry AI use, governance and risk (section 3).

### No cutting corners

> "We can not get lazy when it comes to teaching the students the right way of
> doing things."

### Second pass — SETTLED 24 September

| Decision | The owner's words |
|---|---|
| **Do not fix the Security build's answer tells** | "No, do NOT fix the security build. This is the first exposure to it." The tells are a rule for THIS build only |
| **Cover the new V4 material** | AI use, governance and risk · EPSS · Zero Trust · identity attacks · cloud · social engineering · automation — "Yes, we need to cover this" |
| **CS0-003 is retiring** | Confirmed by the owner. Teach CS0-004 only |
| **Teach everything** | Every vulnerability management detail in section 10 and every attack method in section 11 — "I need to teach everything." Nothing is struck |
| **The queue must be done right** | "We need to make sure that we do this right." Before any content is written, one complete ticket is designed on paper and approved (section 6) |
| **The objective list** | The owner re-supplied the V4 summary (section 3) as the objective list. Labels use its wording; no sub-objective numbers are claimed |
| **Business names** | Section 9 — the owner's replacements |
| **People's names** | "Pull all names from list of Dungeons and Dragons novels" — section 9 |

### Third pass — SETTLED 24 September

| Decision | The owner's words |
|---|---|
| **The SOC's name** | **Veterans Overcoming the Odds** — the SOC RafikisITS runs |
| **Storylines are rebuilt from scratch** | "We need to talk about the story lines due to the pattern recognize that veterans have. We will have to rebuild this aspect." The renamed businesses get **new storylines** — none of them repeats its Security plot |
| **Name signal** | "I am not worried about this at all." The rule that a character's book role must not predict their role here is **dropped** |
| **Which novels** | **Dragonlance Chronicles** (Weis and Hickman, 1984) — confirmed by the owner |
| **The one-ticket preview** | Yes — "so we can work faster once I see something I am able to adjust." First draft: `design/ticket-001-preview.md` |
| **Thresholds and sensors** | The students set them. "This is where the CVSS comes into play. The students will need to set their threshold/sensors up to catch these kind of issues" |
| **As real as possible, safely** | "As close to a real SOC without getting into trouble, and using the sub-objectives to guide the students through to prepare them for the exam." Documentation IP ranges, `.example` domains, no working exploit code, no real malware, no real people |
| **A guide, like Security** | Yes — advisory, unfolding one step at a time |
| **The guide fades** | Yes — step by step early, shorter later, collapsed by default at the end. Nothing ever locks a tab |
| **The hint ladder applies here** | Yes, exactly as in Security: nothing at guesses 1–2, rung 1 at 3, rung 2 at 4, rung 3 for ever from 5, never the answer |

### Fifth pass — SETTLED 24 September

| Decision | The owner's words |
|---|---|
| **Ticket 001 is approved as the shape** | "I love the ticket. That is great." Every ticket follows `design/ticket-001-preview.md`: queue entry → evidence tabs → guide → decisions → write-up → objectives |
| **Fizban's voice** | "The AI assistant is clear and quick to the point. That is good." Short, confident, one recommendation |
| **Two or more decisions per ticket** | "Yes, two or more decisions to plug the leaks." A ticket is never one board — each decision closes a way to guess through it |
| **The write-up** | "Yes, the write up is great." The student writes it themselves, against the five prompts, ending in *what can you not prove?* |
| **Threat actors and SOC staff** | "Yes, I approve of these." Section 15's names are final |
| **AI taught a little in every tier** | "Yes, the AI is taught is great." Fizban sits in the console from Tier 1; governance comes late (section 13b) |
| **Keep going** | "Let's keep going." Tier shape (section 13) and engine (section 5) stand as the working plan; they change only if the owner changes them |
| **The site is not public yet** | "No students have the website address. I have not given it to anyone yet." Design documents on `main` are fine for now |

### Sixth pass — SETTLED 24 September

| Decision | The owner's words |
|---|---|
| **Real CVE numbers** | "Real numbers. You are allowed to use real numbers as long as most of everything else is fake and we are doing that." Clients, hosts, addresses, domains and people stay fictional |
| **Remediation windows are taught** | "Yes for the remediation windows. The student needs to know this information." Every scan write-up gives a due date for each finding and names the rule that set it |
| **Crawl, walk, run on decisions** | "Keep adding decisions. Start with 2, then 3, and then 4, and so until everything is covered. We are crawl, walk, run method here to get them ready." Ticket 001 has 2, ticket 002 has 3, and the count keeps rising until a ticket's decisions cover everything its evidence teaches. **OPEN:** whether it rises every ticket or every tier (section 14) |

### Seventh pass — SETTLED 24 September

| Decision | The owner's words |
|---|---|
| **EPSS values may be made up** | "The EPSS scores can be made and mimic real world numbers." They agree with CISA's exploitation rating for the CVE and are labelled as exercise values |
| **Official CVSS bands, always** | "I want the official bands always." Critical 9.0–10.0 · High 7.0–8.9 · Medium 4.0–6.9 · Low 0.1–3.9, with the class windows of 7, 14 and 30 days. The class table's 7.9 and 5.0 boundaries are not used |
| **The known-exploited rule** | Kept: on CISA's known-exploited list means 7 days, whatever the score |
| **Decision count rises by tier** | "I want this as an overall teaching method." Two decisions in Tier 1, three in Tier 2, rising to six by Tier 5. **How the count behaves inside a tier is OPEN** (section 13c) |

### Eighth pass — SETTLED 24 September

| Decision | The owner's words |
|---|---|
| **Mimic a real SOC** | "I agree. We need to mimic a real SOC." Section 13c is settled: the decision count is fixed to the tier, and noise tickets get as many decisions as real ones |
| **The objective list, with numbers** | Supplied by the owner, stored in section 3 between the markers. Numbers used as supplied, marked "owner's list", checked against CompTIA's PDF before the build is final |
| **The 3D model** | "The 3D model is going to be what a live SOC screen looks like. I will find screenshots if needed to mimic a real SOC console." Section 13e |
| **The instructor PIN, 3693, unlocks everything** | "Because if other instructors like it, I will hand it out cold to them." Every tier, ticket and screen, with no progress required |
| **Ticket 003** | Drafted: `design/ticket-003-preview.md` |
| **Real live screens** | "We need to make this like a real SOC with real live screens for them to review when looking at tickets and fine tuning the sensors." Sections 13d and 13e |

**A note on the PIN, recorded honestly:** on a static site the PIN sits in the
page's own code, so a student who reads the source can find it. It keeps
honest people honest; it is not a lock. The Security build is the same.

### Real CVE data — the rules — SETTLED with the sixth pass

- **Every CVE fact is read from a primary source, never from memory:** the
  CVE Program's records (`CVEProject/cvelistV5`, which carry CISA's
  exploitation ratings), CISA's known-exploited catalogue
  (`cisagov/kev-data`), and GitHub's reviewed advisories. nvd.nist.gov,
  first.org and cisa.gov are blocked by this container's proxy; those GitHub
  copies are not
- **Record who scored it.** Scores differ by source (NVD, the vendor, CISA),
  which is itself an exam point
- **Re-check at build time**, and keep the date checked with the content.
  Known-exploited status and scores change
- **EPSS can't be checked from here** and changes daily. Seventh pass: EPSS
  values are made for the exercise, mimic real-world numbers, agree with
  CISA's exploitation rating, and are labelled as exercise values
- Only each CVE's public one-line description is shown. No exploit code, no
  attack steps

### Design rules that follow from ticket 001 — RECOMMENDED

- **Fizban is not always wrong.** If the assistant is wrong on every ticket,
  "ignore Fizban" becomes the tell. Across the build it is right on some
  tickets, wrong on some, and half right on some — and the student checks it
  every time, whichever it is
- **Decisions chain inside a ticket.** A wrong answer never carries into the
  next board; reset goes back to the last decision answered correctly
- **Buried details live across tabs.** The fact that decides a board is in a
  different tab from the one it seems to belong to, so reading one source is
  never enough

### The answer-tell check, run on paper — 24 September

Measured on the five decision boards in tickets 001 and 002 **as first
written**: the correct option was the **longest in 5 of 5**. That is the
Security build's tell, and it crept in again, because a right answer that
explains itself is naturally longer. **The verifier in section 5 is required,
not optional.**

The wording was rebalanced without changing any option's meaning:

| Check | Before | After |
|---|---|---|
| Correct option's length rank, out of 6 | 1, 1, 1, 1, 1 | 3, 4, 3, 3, 5 |
| Options with an absolute word (every, never, all, only…) | — | correct 2 of 5, wrong 10 of 25 — the same rate |

The owner approved ticket 001 before this change. Its options now read
slightly differently, with the same meaning.

---

## 2. REJECTED — do not propose again

| Proposal | Why it was turned down |
|---|---|
| Keep the Security clients (Motorpool, Royal Smile, Coriakin…) and move the student down the org chart | Bleed-over. Veterans recognise patterns fast |
| Fix the answer tells in the Security build | It is the students' first exposure. Leave it as it is |
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
| CS0-003 retires in English **22 December 2026** | Third-party report — **retirement confirmed by the owner** |
| SBOM, XDR, SASE as new topics | Low-reliability third-party only. **XDR and SASE are now in the owner's objective list (below); SBOM is not** |
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

### The owner's objective list, with numbers — supplied 24 September

**Where it came from.** The owner pasted this on 24 September. It is the
working objective list for the build, and its wording is used for labels.
**Its numbering and detail come from third-party pages**: CompTIA's V4 page,
YouTube courses, Wiley's study guide, prep sites, and **at least two exam-dump
sites** (cciedump.spoto.net, pass4success.com). So:

- The **numbers (1.1–4.2) are used as supplied, marked "owner's list"**, and
  are checked against CompTIA's official PDF before the build is final
- **Nothing is taken from the dump sites** beyond what the owner pasted here.
  No questions, no answer patterns
- Where it differs from the earlier four-domain summary above, this list is
  the more detailed one. It has **five** VM objectives, where the summary had
  four, and **five** IR objectives, where the summary had three

[OBJECTIVES START]

**Domain 1.0: Security Operations (34%)**

- **1.1** Explain system and network architecture concepts in security
  operations: security architecture components, identity concepts (Zero
  Trust/ZTNA vs. SASE, passwordless, PAM, cloud/hybrid identity), logging
  practices (ingestion, retention, JSON/EVTX formats, NTP log correlation),
  and system hardening
- **1.2** Analyze indicators of potential malicious activity: suspicious
  behavior and indicators across networks, endpoints, cloud infrastructure,
  operational technology (OT), and identity platforms (such as
  Living-off-the-Land Binaries/LOLBins)
- **1.3** Use tools to determine malicious activity: SIEM, EDR/XDR, network
  analyzers (Zeek, Suricata, Snort), packet analysis, and threat intelligence
  platforms
- **1.4** Explain threat intelligence and threat-hunting concepts: frameworks
  (MITRE ATT&CK, Cyber Kill Chain, Pyramid of Pain), threat data sources, and
  investigative methods
- **1.5** Describe efficiency and process improvement in security operations:
  SOAR, infrastructure as code (IaC), workflow configurations, runbooks, and
  APIs/webhooks
- **1.6** Summarize concepts related to the use of AI in security operations:
  AI use cases in SOC workflows, AI governance, and machine-learning risks
  (hallucinations, poisoning)

**Domain 2.0: Vulnerability Management (26%)**

- **2.1** Select the appropriate vulnerability scanning method:
  internal/external, agent-based/agentless, credentialed/non-credentialed,
  passive/active, based on asset inventory constraints
- **2.2** Analyze vulnerability assessment results and security findings:
  interpreting scan output, evaluating configurations against secure
  baselines (CIS benchmarks, PCI DSS, ISO 27001), true vs false positives
- **2.3** Prioritize vulnerabilities using risk-based approaches: threat
  intelligence, business impact, asset criticality, severity metrics
- **2.4** Apply mitigation strategies and security controls: compensating
  controls, segmentation, hardening and patching, application security
  vulnerabilities
- **2.5** Understand risk management concepts, policies, and compliance
  practices: data protection regulations (GDPR, HIPAA, PCI DSS), aligning
  vulnerability workflows with organizational risk frameworks

**Domain 3.0: Incident Response and Management (24%)**

- **3.1** Summarize concepts related to attack methodology frameworks: MITRE
  ATT&CK, the Cyber Kill Chain, and the Diamond Model of Intrusion Analysis
  applied to live incidents
- **3.2** Follow incident response processes: Preparation →
  Detection/Analysis → Containment/Eradication → Recovery → Post-Incident
  Activity
- **3.3** Perform incident triage and evidence handling: severity of alerts,
  parsing raw events, volatile and non-volatile data collection, chain of
  custody
- **3.4** Manage escalation procedures: communication steps, technical
  escalation, and functional notifications according to playbooks
- **3.5** Conduct remediation activities and identify root causes: isolating
  infected entities, removing persistent malware, reconstructing attack
  timelines, root-cause analysis (RCA)

**Domain 4.0: Reporting and Communication (16%)**

- **4.1** Create vulnerability management reports and communication:
  scorecards, action plans and risk maps for specific audiences (technical
  teams, auditors, executive boards)
- **4.2** Explain the importance of security operations and incident response
  reporting: dashboards, metrics and KPIs (MTTD, MTTR), lessons learned,
  time-sensitive compliance reporting (legal, public relations, law
  enforcement)

**Called out as new in CS0-004, as supplied:** AI risks and governance
(hallucinations, data exposure, model poisoning, malicious prompts) · Zero
Trust (ZTNA vs SASE, passwordless, PAM, cloud and hybrid identity) · LOLBins
and behavioural monitoring over signatures · NTP precision for reliable
timelines · IR at 24%, with SOAR playbooks, APIs and automated containment.

**New tools, as supplied:** cloud assessment (Scout Suite, Prowler, Trivy) ·
breach and attack simulation (Atomic Red Team, Caldera) · network and SIEM
analysis (Zeek, Suricata, Snort).

[OBJECTIVES END]

### What the numbered list adds to the build — every item is taught

| Item | Where it lands |
|---|---|
| Zero Trust, ZTNA vs SASE, passwordless, PAM, cloud and hybrid identity | Identity tickets: Payne School, Nexxuss |
| Logging: ingestion, retention, JSON and EVTX, **NTP correlation** | A timeline that fails because two clocks disagree |
| System hardening, CIS benchmarks, PCI DSS, ISO 27001 baselines | Scan tickets: configuration against a baseline |
| OT indicators | Ironclad's diagnostic kit and bench PCs are the natural OT |
| XDR, Zeek, Suricata, Snort | The network sensor screen, from ticket 003 on |
| Pyramid of Pain | Threat intel: which indicator costs the attacker most to change |
| Diamond Model | Alongside ATT&CK and the Kill Chain, in Tier 3–4 |
| SOAR, IaC, runbooks, APIs and webhooks | Tier 5, where the student automates what they did by hand |
| AI hallucination, poisoning, data exposure, malicious prompts | Fizban throughout; prompt injection in Tier 5 |
| Volatile and non-volatile collection, chain of custody | Tier 4 |
| GDPR, HIPAA, PCI DSS | No Go Smile (HIPAA), Vanguard and OEF (PCI DSS) |
| Scorecards, action plans, risk maps by audience | VM reporting, Tier 2 and Tier 5 |
| MTTD, MTTR, lessons learned, legal, PR and law enforcement | Tier 4–5, and the metrics screen |
| Scout Suite, Prowler, Trivy | Payne School's exposed cloud share; container image scans |
| Atomic Red Team, Caldera | Tier 5: the SOC tests its own sensors |

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
call, not a correction of their material**:

- **Kill Chain PBQ:** *Reconnaissance = Phishing* and *Installation =
  Encryption.* In the Lockheed Martin model phishing is **Delivery**, and
  encrypting the victim's files is **Actions on Objectives** — the explanations
  document itself notes phishing "is sometimes seen in delivery"
- **Security Incident PBQ:** *Data Exfiltration → Disk-level encryption.*
  Full-disk encryption protects data at rest on a device that is off or stolen;
  on a running, compromised host the data is already decrypted, so it does not
  stop exfiltration. Egress filtering or DLP is the usual control

---

## 5. The engine — same, or start fresh? — WORKING PLAN (owner: "Let's keep going")

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

## 6b. Moving around freely — SETTLED 24 September

The owner's question: "Once they unlock everything, they are allowed to jump
around?"

**Yes — and nothing ever locks a tab inside a ticket.** The guide is advisory,
as in the Security build. The order is *taught*, not enforced.

What changes is how loudly the guide speaks. Early tickets: it unfolds step by
step — evidence first, in order. Later tiers: shorter, then collapsed by
default. By the end the order lives in the student's head, and pivoting
between sources freely is the skill a real analyst has. "Do not jump between
tabs randomly" is the lesson for somebody learning; jumping *with a reason* is
what they graduate to.

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

## 9. Names — SETTLED 24 September

### Businesses — the owner's replacements

| Security name | SOC name |
|---|---|
| RafikisITS | **RafikisITS** — kept |
| Claw Perfect Trim and Cleaning | **Vanguard Auto Detailing** |
| 6th Cup for the 6th Hour | **OEF Fuel Roasters** |
| Motorpool of PMCS | **Ironclad Auto Care** |
| Third Chance Thrift Stores | **The Steadfast Outpost Thrift** |
| Royal Smile | **No Go Smile** |
| J. Fenty Jr School | **Thomas P. Payne School** |
| Novoon | **Nexxuss** |
| Nari Motor Tools | **Zumroh Motor Company** |
| Igol Tech Keepers | **Saxet IT Keepers** |
| Prism Fibre | **Optic Light Fibre** |
| Netcom Cable | **RF Jack Cable** |

**OPEN — role carry-over.** Renamed one for one, each business still sits in
its Security role: a dental surgery with patient records, a charity, a motor
shop, two rivals. A veteran who played Security may read "No Go Smile" as
"Royal Smile" and expect the same plot. **RECOMMENDED:** the new businesses do
not repeat their Security storylines — No Go Smile is not the patient-records
breach, Ironclad is not the espionage target, Steadfast Outpost is not the
fraud victim.

### Still to name

**Re-explained 24 September**, because the owner asked: "We are naming what
after it?" **Nothing is being named after RafikisITS.** Three separate small
items were left over from Security:

| Item | What it is | RECOMMENDED |
|---|---|---|
| **RafikisITS and the SOC** | Settled in the third pass: **Veterans Overcoming the Odds is the SOC that RafikisITS runs** for its clients. RafikisITS is the company; VOO is its security operations centre. The student is an analyst employed there. Elistan owns RafikisITS | Nothing to decide unless the owner wants it different |
| **The lookalike domain** | In Security, attackers registered `rafikislTS.com` (a lower-case L for the I) to impersonate RafikisITS. The SOC world needs its own fake domain for the Sivak impersonation thread | **Not a one-letter swap**, which veterans would spot from Security. Use a **combosquat**, the real name plus a word: `zumroh-motor-billing.example` for the fake supplier invoice at Ironclad |
| **Email addresses** | Security used `rafikisITS@gmail.com` and `truman@gmail.com`: a real mail provider's domain | Everything on `.example`: `soc@voo.rafikisits.example` for the SOC, and `firstname@rafikisits.example` for staff |

### People — from Dragonlance Chronicles — SETTLED (fifth pass; the staff list is in section 15)

The owner: "Pull all names from list of Dungeons and Dragons novels."

Security's staff to be replaced: Glimfeather, Sam, Pippin, Coriakin, Lucy,
Digory, Edmund, Caspian, Jill, Aravis, Helen, Rilian, Frank, Trumpkin, Dana.

~~The rule that a name's role in the novels must never predict its role
here~~ — **dropped in the third pass** ("I am not worried about this at all").
The approved names are in section 15.

## 10. Vulnerability management — SETTLED 24 September: teach everything

The owner: "I need to teach everything." **Every row below is in the build.**
The "In class" column now only records whether the reference sims already
cover it — the rows marked "?" are new material the SOC teaches first.

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
| **EPSS** — likelihood of exploitation | ? | **Named as new on CS0-004.** Ticket 002, with exercise values |
| CVSS versions — v3.1 and v4.0 | ? | |
| CISA KEV — known exploited vulnerabilities | ? | Ticket 002 — and Ironclad's policy: known-exploited means 7 days |
| SSVC and vendor severity | ? | Ticket 002 shows CISA's exploitation rating and who scored each CVE |
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

## 11. Attack methods — SETTLED 24 September: every one of them

The owner wants **all** attack methods, for entry-level SOC readiness. Every
group below is in the build. The last column records what the class reference
already teaches.

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

## 13. Tier shape — WORKING PLAN (owner: "Let's keep going")

Each tier touches every domain, weighted differently.
Efficiency and process improvement sits near the end, as the owner asked.

| Tier | Working title | Heaviest domain |
|---|---|---|
| 1 | First shift — the queue, reading alerts, learning normal, false positives | Security Operations |
| 2 | The scan — configuration, scoring, four hundred findings down to the few, tuning, signatures | Vulnerability Management |
| 3 | Endpoint and wire — EDR, packets, indicators across network, endpoint, cloud and identity; ATT&CK and Kill Chain | Security Operations + IR |
| 4 | The incident — the full IR process, evidence handling, escalation, root cause | Incident Response (up 4% on V4) |
| 5 | Maturity — efficiency, automation, metrics, AI in the SOC, reporting to leadership | Reporting + efficiency + AI |

Reporting is not only Tier 5 — every ticket ends in a write-up.

## 13b. Where AI is taught — SETTLED 24 September: a little in every tier

"AI in security operations" is one of the objectives. Two ways to teach it:

- **Once, near the end**, alongside efficiency
- **A little in every tier** — RECOMMENDED. An AI assistant sits in the console
  from Tier 1 and summarises alerts. Sometimes it is right, sometimes it is
  confidently wrong, and the student has to check it against the evidence.
  That teaches the use case and the risk by living with it. The governance
  side — policy, what data it may see — comes in the late tier

---

## 13c. The decision count in a real SOC — SETTLED 24 September

The owner: "I agree. We need to mimic a real SOC."

The owner asked whether decisions piling up ticket after ticket is how a real
SOC works. **It is not**, and that is a good reason to fix the count to the
tier.

**What really happens:**

- **A ticket's size comes from the ticket, not from the analyst's experience.**
  A phishing report has a few decisions whoever picks it up. A senior analyst
  doesn't make more decisions on the same alert. They make them faster, and
  they are trusted with bigger tickets
- **What grows is how much of the job the analyst owns.** Tier 1 triages:
  real or not, close it or escalate it. Tier 2 investigates: how far it spread,
  what to contain. Incident response runs the whole thing, through recovery
  and lessons learned. That is a career ladder, and it lines up with the
  owner's crawl, walk, run
- **Most of every shift is small tickets, even for seniors.** Real incidents
  are rare
- **Very large incidents have dozens of decisions, split across people and
  days.** Nobody makes twenty on one screen

**What that means for the build:**

| Tier | The analyst's seat | Decisions per ticket |
|---|---|---|
| 1 First shift | Triage: real or not, close or escalate | 2 |
| 2 The scan | Prioritise, confirm, fix the sensor | 3 |
| 3 Endpoint and wire | Investigate: what happened, how far, which technique | 4 |
| 4 The incident | Contain, preserve, escalate, find the root cause | 5 |
| 5 Maturity | The whole loop, then improve the process | 6 |

**The count is a floor for the tier, not a signal.** The trap: if only
real incidents get the big boards, veterans will read "six boards = real
attack" before reading a word. So in each tier the noise tickets get the
same number of decisions as the real ones. That is also true to life:
proving an alert benign takes the same checks as proving it malicious. A
benign ticket in Tier 4 still asks for scope, evidence, tuning and a
write-up.

**"Until everything is covered"** is met at Tier 5, where one ticket runs
every stage from alert to write-up to process improvement.

## 13d. Crawl, walk, run — how the student gets there — RECOMMENDED

The owner: "How are we going to take them from crawl to walk to run? We need
to make this like a real SOC with real live screens for them to review when
looking at tickets and fine tuning the sensors."

**The principle:** the SOC doesn't get easier or harder so much as **the
support comes away** and **more of the job becomes theirs**. That is how a
real new hire is brought on: shadowed at first, then trusted with a queue,
then trusted with an incident.

| | **Crawl** — Tier 1 | **Walk** — Tiers 2–3 | **Run** — Tiers 4–5 |
|---|---|---|---|
| **The seat** | Triage: real or not, close or escalate | Investigate: prioritise, confirm, map it, recommend | Own the incident, then improve the SOC |
| **Decisions per ticket** | 2 | 3, then 4 | 5, then 6 |
| **The evidence** | Attached to the ticket, as tabs | Two screens linked; **the student opens the rest** (from ticket 003) | Nothing attached. The console is open and they decide where to look |
| **The guide** | Unfolds one step at a time, says where to look | Shorter; says **what** to find, not where | Collapsed by default. Opened on request |
| **The queue** | One ticket at a time, shift clock visible | A few tickets at once, the student chooses the order | **Live**: tickets arrive while they work, SLA clocks run, a shift handover at the end |
| **The sensors** | Choose one of six rule changes | Set the threshold, and **see a backtest**: how many alerts it would have raised last week, and what it would have missed | Write and edit the rules; own the false-positive budget; SOAR playbooks in Tier 5 |
| **Consequences** | Shown on the ticket | Carry into later tickets | Tuning changes **how many tickets arrive next shift**, and which real attacks get through |
| **Fizban** | Summarises every ticket | Summarises, sometimes asked | Asked on purpose. Governed in Tier 5 |
| **The hint ladder** | The same at every tier. Nothing at 1–2, rungs at 3 and 4, rung 3 for ever from 5, never the answer | | |

**The backtest is the heart of "fine tuning the sensors".** Real detection
engineers never change a rule blind. They run it against the last week of
data first. The student does the same: move the threshold and the screen
shows *this rule would have raised 212 alerts last week, and missed the
spray on Nexxuss.* Too loose and the queue drowns them; too tight and the
real attack walks past.

## 13e. The live screens, and the 3D model — SETTLED in outline

The owner: **"The 3D model is going to be what a live SOC screen looks
like. I will find screenshots if needed to mimic a real SOC console."**

**The screens the console needs** (each built generic, no vendor's name or
logo; the owner's screenshots are for **layout only**, never copied):

| Screen | What it shows | First used |
|---|---|---|
| **Queue** | Tickets, severity, SLA clocks, shift clock, backlog | Tier 1 |
| **SIEM search** | Search bar, time picker, event histogram, results, field list | Tier 1 |
| **Identity** | Sign-in logs, MFA, sessions and tokens | Tier 1 |
| **Vulnerability scanner** | Scan jobs, policies, credential status, findings | Tier 2 |
| **Asset inventory** | Hosts, owners, roles, approved software | Tier 2 |
| **EDR / XDR** | Host list, process tree, timeline, files, isolate button | Tier 3 |
| **Network sensor** | Zeek logs (conn, dns, http, ssl), Suricata/Snort alerts | Tier 3 |
| **Threat intel** | Reputation, first seen, related indicators | Tier 3 |
| **Packet viewer** | Packet list, details, bytes | Tier 3–4 |
| **Detection rules** | Every rule, its threshold, and the backtest | Tier 1 (picks) → Tier 5 (edit) |
| **Cloud posture** | Scout Suite / Prowler / Trivy-style findings | Tier 2–3 |
| **SOAR** | Playbooks, triggers, actions, blast radius | Tier 5 |
| **Metrics** | MTTD, MTTR, false-positive rate — **the student's own** | Tier 4–5 |
| **Fizban** | The assistant panel | Tier 1 |

**Screenshots wanted from the owner** (layout reference only): a SIEM search
page, an alert queue, an EDR process tree, a vulnerability scanner's findings
list, a packet viewer, a SOC wall or dashboard.

**OPEN — what "3D" means here.** Either (a) the screens themselves, built to
look like a real console, or (b) a 3D SOC room with a video wall, where the
student walks to a desk and the screens on it are the live consoles.
RECOMMENDED: (b) only as the entrance and between shifts, with the work done
on full-size (a) screens, because text on a 3D surface is harder to read, and
AAA contrast comes first.

## 14. Everything still OPEN

| | Owner to decide |
|---|---|
| **Ticket 003** | `design/ticket-003-preview.md` — Tier 3, four decisions, for the owner to adjust |
| **Crawl, walk, run** | Section 13d — the plan, for the owner's reaction |
| **What "3D" means** | Section 13e — the screens themselves, or a 3D SOC room around them |
| **Screenshots** | Section 13e — the owner is finding SOC console screenshots, for layout only |
| **Five additional scenarios** | Does it mean five extra tickets per ticket type? |
| **Storylines** | Section 15 — no objection raised yet; still a draft until the owner says it is right |
| **The official objectives PDF** | Section 3 holds the owner's numbered list. The numbering is checked against CompTIA's own document before the build is final |
| **VOO and RafikisITS** | Section 9 — re-explained 24 September; the owner to confirm, plus the lookalike domain and the mail addresses |

## 15. Storylines — FIRST DRAFT, 24 September — RECOMMENDED

The owner: "Let's see what you come up with." The names are approved (fifth
pass); the threads are still a draft.

### The patterns this draft is built to break — agreed by the owner

1. One client, one incident, in tier order, each bigger than the last
2. One insider per tier, escalating from accident to planted
3. The client's type predicting the incident
4. Every alert real — no false alarms
5. Every clue meaningful — no noise

### How the draft breaks them

- **Threads, not episodes.** Several stories run at once across tiers. Each
  starts looking like noise
- **The queue is mostly noise, every shift.** Benign true positives, false
  positives, duplicates. The real threads hide inside it
- **What happens depends on the student's tuning,** not on the tier number. A
  spray campaign under the default thresholds is invisible in Tier 1; tuned
  well in Tier 2 it is caught in Tier 3 with little damage; left alone it
  succeeds. There is no fixed escalation curve
- **Incidents do not match the industry.** The dental office gets a
  cryptominer. The coffee roaster gets web exploitation. The thrift store gets
  nothing at all
- **One client has two things at once.** One has none
- **The "insider" the student first suspects is innocent.** One real insider
  exists, at a client, mid-run — not at the climax

### Clients and their threads

| Client | What happens | Mostly teaches |
|---|---|---|
| **Vanguard Auto Detailing** | Machines still carry the remote-access agent of their previous IT firm, **Saxet IT Keepers**. It checks in weekly and looks exactly like C2. It is legitimate software — and it is unmanaged standing access nobody watches. A risk finding, not an incident | Beaconing look-alikes; asset inventory; "most defensible conclusion" |
| **OEF Fuel Roasters** | The online store is probed constantly — traversal and injection attempts, almost all failing. One succeeds, through a store plugin that is **not yet** on the known-exploited list while its EPSS climbs. *Changed with the sixth pass: ticket 002 already teaches "medium score, known exploited, fix first" at Ironclad, so OEF teaches that the list lags and EPSS warns first* | Attempt vs success; EPSS; the known-exploited list lags; web attacks |
| **Ironclad Auto Care** | Diagnostic equipment falls over when scanned aggressively. The scan tier's decoy: a critical CVSS on an isolated bench machine that matters less than the store's moderate one. Later, its parts supplier **Zumroh Motor Company** has its vendor portal compromised, and a malicious invoice arrives from a real supplier address | Fragile systems and scan windows; prioritising by context; supply chain |
| **The Steadfast Outpost Thrift** | **Nothing, ever.** Volunteers on phones, typos, POS updates that look like beacons. Every ticket is benign | Most alerts are noise; closing well is a skill |
| **No Go Smile** | Not a records breach. An unpatched VPN appliance leads to a **cryptominer** on the imaging workstations. Separately, their anti-malware signatures are weeks old because the update path is blocked by a firewall change | EDR telemetry; availability impact; signature currency |
| **Thomas P. Payne School** | Constant phishing noise from a young user base. The student's own posture scan finds an **exposed cloud share**. Later, an **AI voice-cloned call** to the help desk, as the principal, asks for an MFA reset | Cloud misconfiguration; deepfake social engineering; identity |
| **Nexxuss** | **Two things at once.** A slow password-spray campaign across many clients lands here, and a cloud consent-phishing app takes over a mailbox. At the same time, an employee who has resigned is copying files to personal cloud storage | Identity and cloud attacks; a real insider; running two investigations together |
| **Optic Light Fibre / RF Jack Cable** | A regional outage floods every client's queue with alerts at once — sixty tickets, one cause. Late on, a genuine DDoS hits OEF's store | Correlation instead of sixty escalations; availability |

### Threat actors — named from Dragonlance Chronicles — APPROVED

| Group | Methods |
|---|---|
| **The Seekers** | Password spraying, credential stuffing, MFA fatigue, consent phishing |
| **Bozak** | Web exploitation — traversal, injection, the store plugin |
| **Sivak** | Impersonation — AI voice cloning, lookalike domains, pretexting (a sivak takes the shape of those it kills) |

### The SOC — Veterans Overcoming the Odds

| Name | Role |
|---|---|
| **The student** | New analyst, Tier 1 |
| Tanis | SOC manager |
| Laurana | Tier 2 lead |
| Sturm | Incident response lead |
| Flint | Detection engineer — owns the rules the student tunes |
| Riverwind | Vulnerability management engineer |
| Goldmoon | Compliance and reporting |
| Caramon, Tika | Fellow Tier 1 analysts on shift |
| Raistlin | Threat intelligence. Runs PowerShell at 3am — **the innocent "insider"**; it is scheduled automation |
| Tasslehoff | Help desk — takes the voice-cloned call |
| Elistan | Owner of RafikisITS — the seat the student used to sit in |
| **Fizban** | The AI assistant in the console. Helpful, confident, and sometimes wrong. In the last tier somebody plants text in a log field aimed at it — **prompt injection** |

### Which threads show in which tier

| | T1 First shift | T2 The scan | T3 Endpoint and wire | T4 The incident | T5 Maturity |
|---|---|---|---|---|---|
| Noise, every client | ● | ● | ● | ● | ● |
| Vanguard / Saxet agent | looks like C2 | found in inventory | resolved | | |
| OEF store | probes | the plugin | success, if not patched | | DDoS |
| Ironclad | | fragile scan, decoy | | Zumroh invoice | |
| No Go Smile | | stale signatures | cryptominer | | |
| Payne School | phishing noise | exposed share | | voice clone | |
| Nexxuss | spray, below threshold | spray, if tuned | consent phishing | insider + mailbox | |
| ISP outage | | | alert flood | | |
| Fizban | wrong sometimes | | | | prompt injection |

"If not patched" and "if tuned" are the point: the student's decisions move
threads, the tier does not.

---

Footer for the eventual build:

> Cyber Warrior Program — built by an instructor, for students, to make
> certification study more interactive. For educational purposes only. Not
> affiliated with, endorsed by, or sponsored by CompTIA®. All trademarks
> belong to their respective owners.
