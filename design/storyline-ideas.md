# Storyline ideas — for the owner to pick from

**SETTLED 26 September: every idea here is approved.** The owner: "I like
everything that you suggested. Add it." They are placed in the 32-ticket map
in `CLAUDE.md` section 13g. The owner first asked: "Let's get
started on the storylines. Give me some ideas." Each client has its current
draft thread (from `CLAUDE.md` section 15) and new ideas beside it. Every
idea says which objectives it teaches (the owner's numbered list, unverified
against CompTIA's PDF) and what makes it real.

The rules the storylines have to keep, all already agreed:

- **Veterans spot patterns.** No client's industry predicts its incident; one
  client never has an incident; one has two at once; the first "insider" is
  innocent; outcomes move with the student's tuning, not the tier number
- **As real as possible, safely.** Documentation IP ranges, `.example`
  domains, real CVEs and ATT&CK IDs checked against primary sources, no working
  exploit code
- **Mimic a real SOC.** Mostly noise; real incidents are rare

---

## A. The big idea: three campaigns that cross clients — SETTLED 26 September

The owner: "Yes to the three attackers across clients." The timeline is in
`CLAUDE.md` section 15, "The three campaigns".

In a real managed SOC, **one analyst watches many clients, so the same
attacker can be seen at three companies at once.** A single company's IT
department can't see that; the SOC can. That's the reason a small business
pays for a SOC, and it gives the storylines a spine that isn't "one client,
one incident, in tier order".

| Campaign | Who | What they do, and where | What it teaches |
|---|---|---|---|
| **The Seekers** | Credential and identity | A slow password spray across **Nexxuss, Payne School and the Steadfast Outpost**: two tries per account, from hundreds of addresses. It's invisible in any one client. **Correlated across clients**, it's obvious. How early the student spots it depends on the threshold they set in Tier 1 | Correlation (1.3, 1.5) · thresholds · identity attacks (1.2) · ZTNA and conditional access (1.1) |
| **Bozak** | Web exploitation | Hits **OEF's store plugin** and **Ironclad's Joomla booking site** (ticket 002's real CVE). Their IP addresses change every day; their tool's fingerprint and request pattern never do | **Pyramid of Pain** (1.4): blocking IPs costs Bozak nothing; detecting the behaviour costs them everything · attempt vs success · web attacks |
| **Sivak** | Impersonation | The fake Zumroh billing domain at **Ironclad**, the principal's cloned voice at **Payne School**, and, after Vanguard removes the Saxet agent, **a phone call to Vanguard pretending to be Saxet** "to reinstall it" | Social engineering (1.2) · verification out of band · the attacker adapts when a door closes |

**The payoff in Tier 4–5:** the student links the three campaigns with the
**Diamond Model** (3.1): adversary, capability, infrastructure, victim. The
exam loves the Diamond Model, and this makes it real rather than a diagram.

---

## B. Client by client

### Thomas P. Payne School — education, young users, cloud

**Current draft:** phishing noise (Tier 1, ticket 004) → an exposed cloud
share found by a posture scan (Tier 2) → an AI-cloned voice of the principal
calling the help desk for an MFA reset (Tier 4).

**New ideas:**

1. **The 15-year-old with a port scanner.** Tier 3 alerts show an internal
   scan of the school network from a student laptop. Everything about it looks
   like reconnaissance. It's a curious pupil after a cyber club meeting.
   **Real:** schools see this constantly. **Lessons:** don't over-classify
   (the class principle); who gets told (the school, not law enforcement); how
   to write it up when the "attacker" is a child. **Objectives:** 1.2, 3.3,
   3.4, 4.2
2. **Grades changed at 2 a.m.** A teacher's account edits grades after
   midnight. Insider, or stolen session? The sign-in log shows **no new sign-in
   at all**: a token taken from the teacher's home laptop by an infostealer.
   Resetting the password does nothing until the sessions are revoked.
   **Lessons:** section 12's "revoke sessions and tokens, not just
   passwords"; device trust and Zero Trust. **Objectives:** 1.1, 1.2, 3.5
3. **The exposed share, made harder.** Keep the Tier 2 share, but it is
   public **and encrypted**, with **logging off**. So nobody can prove whether
   it was read, and "was this a breach?" becomes the legal and PR question of
   4.2

### Nexxuss — a tech company, the one with two things at once

**Current draft:** the spray lands here → cloud consent phishing takes over a
mailbox (Tier 3–4) **while** a resigned employee copies files to personal
cloud storage (Tier 4).

**New ideas:**

1. **MFA fatigue at 2 a.m.** Twenty push requests, and a sleepy engineer
   finally taps Approve. **Real:** one of the most common identity attacks
   now. **Lessons:** number matching, conditional access, why "MFA passed" is
   not "the user was there." **Objectives:** 1.1, 1.2, 3.3
2. **The pipeline that published the keys.** An infrastructure-as-code change
   makes a storage bucket public and leaks an access key in a build log. The
   attacker is a bot that scans for keys within minutes. **Lessons:** IaC
   (1.5), cloud posture (Prowler / Trivy-style findings), non-human
   credentials. **Objectives:** 1.5, 2.2, 2.4
3. **Keep "two at once", but make them look like one.** The mailbox takeover
   and the insider both show large downloads on the same afternoon. The
   student has to separate them: different accounts, different tools,
   different motives. That's much harder than two obvious cases, and it's
   exactly what goes wrong in real incidents

### OEF Fuel Roasters — coffee e-commerce, card payments

**Current draft:** constant web probes → a store plugin with EPSS climbing but
not yet known-exploited (Tier 2) → attempt vs success in the logs (Tier 3) →
a DDoS late on (Tier 5).

**New ideas:**

1. **The checkout skimmer.** A script injected into the checkout page sends
   card numbers to a lookalike domain. The server logs look clean; the evidence
   is in **what the browser loaded**. **Real:** a whole class of real
   e-commerce breaches. **Lessons:** client-side attacks, PCI DSS, and who must
   be told when card data leaves (legal, the card brands, customers).
   **Objectives:** 1.2, 2.5, 3.2, 4.2
2. **Gift-card fraud from credential stuffing.** Loyalty accounts drained
   using passwords leaked from somewhere else. Every login succeeds, so nothing
   "fails". **Lessons:** stuffing vs spraying (an exam favourite), success
   from many addresses as the indicator. **Objectives:** 1.2, 1.3
3. **The DDoS that's a smokescreen.** Keep the Tier 5 DDoS, but while
   everyone watches the flood, the real attack (a Bozak login) happens quietly.
   **Lesson:** the loud alert is not always the important one

### Ironclad Auto Care — motor shop, fragile equipment

**Current draft:** fragile diagnostic kit and the decoy critical (Tier 2,
ticket 002) → Zumroh's vendor portal compromised, malicious invoice (Tier 4).

**New ideas:**

1. **Two invoices, two attacks.** Split the Zumroh thread. The first is a
   **macro invoice** (the owner's process tree: Word → PowerShell → curl). The
   second, weeks later, has **no malware at all**: a polite email from the real
   Zumroh address asking Ironclad to update Zumroh's bank details. That's
   business email compromise. **Lessons:** BEC vs phishing; a real sender
   address is not a real request; out-of-band verification. **Objectives:**
   1.2, 3.1, 3.2, 3.3
2. **The diagnostic tablets are OT.** The tablets phone home to the equipment
   vendor for firmware. One day the firmware server's certificate changes.
   Update or not? **Real:** operational technology, where patching can break
   the business. **Objectives:** 1.2 (OT), 2.4, 2.5

### No Go Smile — dental practice, patient records

**Current draft:** stale anti-malware signatures, their update path blocked
by a firewall change (Tier 2) → an unpatched VPN appliance leads to a
cryptominer on the imaging workstations (Tier 3).

**New ideas:**

1. **The near miss.** The cryptominer's operator sells the access. A second
   group logs in and starts staging for ransomware. The student catches the
   staging (shadow copies deleted, a new admin account, a file-share sweep)
   **before** encryption. **Real:** ransomware usually arrives through
   someone else's foothold. **Lessons:** the full IR process (3.2), order of
   volatility and chain of custody (3.3), and "is this a HIPAA breach?"
   belonging to legal, not the analyst (2.5, 4.2)
2. **Keep it small on purpose.** No Go Smile's whole story is hygiene:
   signatures, patching, one cryptominer. Not every client needs a
   catastrophe, and veterans will notice if every thread escalates

### Vanguard Auto Detailing — settled in ticket 003

The Saxet agent: first seen in Tier 1, reopened on new evidence in Tier 3.
**New idea:** after Vanguard removes it, **Sivak phones pretending to be
Saxet** to "reinstall the agent". It closes the thread and teaches that a
closed door gets tried again.

### The Steadfast Outpost Thrift — nothing, ever

Every ticket is benign. Ideas for its noise, each a real false alarm:

- A volunteer's phone jumping between store Wi-Fi and mobile data (ticket 001)
- The till's software update matching a low-confidence threat feed
- **Donated laptops** turning up on the network with old software: asset
  discovery, not an attack
- A volunteer's teenager gaming on the store Wi-Fi: peer-to-peer alerts
- The manager's new tablet signing in from a new device

### Optic Light Fibre and RF Jack Cable — the ISPs

**Current draft:** a regional outage floods the queue with sixty tickets from
one cause (Tier 3). **New idea:** in Tier 5, the ISP's own maintenance notice
arrives *after* the flood. The student's metrics suffer (MTTD, MTTR) through
no fault of their own, which teaches why metrics need context (4.2).

---

## C. Inside the SOC

| Idea | What it teaches |
|---|---|
| **Raistlin's 3 a.m. PowerShell** (current). The innocent "insider": it's his scheduled threat-intel automation | Baselines; don't over-classify a colleague; insider alerts go outside the normal queue (3.4) |
| **Tanis's MTTR target.** Leadership pushes for faster closing times. In the Tier 5 quality review, the student finds Caramon closing too fast to hit the number | Metrics can drive bad behaviour (4.2); quality review |
| **Fizban drifts.** Early on Fizban is often right. Mid-run a model update makes it confidently wrong more often, and nobody announced the change. Then in Tier 5, Bozak plants text in a web request's user-agent field that Fizban reads and obeys: prompt injection | AI governance, change control for AI, hallucination and prompt injection (1.6) |

---

## D. Coverage check

With the ideas above, every domain has a storyline carrying it, not just
isolated tickets:

| Domain | Carried by |
|---|---|
| Security Operations (34%) | The Seekers across clients · Bozak's Pyramid of Pain · the OT tablets · Fizban |
| Vulnerability Management (26%) | Ironclad's scans · OEF's plugin · Payne's cloud share · No Go Smile's patching |
| Incident Response (24%) | No Go Smile's near miss · Ironclad's two invoices · Nexxuss's two-at-once |
| Reporting and Communication (16%) | The skimmer's notifications · the child with the scanner · the MTTR target · every write-up |

---

## Questions for the owner

1. ~~The three cross-client campaigns~~ — **settled: yes**
2. **The 15-year-old with a port scanner:** is a child "attacker" all right
   for your students?
3. **Which new ideas to keep, client by client?** They can all be mixed with
   the current drafts.
