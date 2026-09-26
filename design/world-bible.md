# The SOC world — everything named, for the owner to adjust

**Status: SETTLED 26 September.** The owner: "Nope, it all looks good." That includes the four new attackers (Kapak, Ember, Baaz, Sleet), the client names, and **Sivak** kept as it is.

First posted for the owner to adjust. The owner asked:
"Lay out what businesses are facing what attacks and the names of the
attackers. Just name everything and let me see it. So that way, if we need
to, we can make adjustments."

Everything here is new to the SOC build. Nothing repeats a Security
storyline, and no client's industry predicts its incident. Ticket numbers are
the 32-ticket map in `CLAUDE.md` section 13g. Objective numbers are the
owner's list, unverified against CompTIA's PDF.

---

## 1. The world at a glance

| Business | What they are | What they face | Who is behind it | Tickets |
|---|---|---|---|---|
| **RafikisITS** | The managed IT company; runs the SOC | — | — | — |
| **Veterans Overcoming the Odds** | RafikisITS's SOC, where the student works | Its own AI assistant tricked; a closing-time target that tempts analysts to rush | **Bozak** (the prompt injection) | 29, 32 |
| **Vanguard Auto Detailing** | Car detailing, card terminal at the front desk | The old IT company's remote agent, still installed; then a phone call to reinstall it | **Saxet IT Keepers** (legitimate, unmanaged) · **Sivak** (the call) | 3, 14, 19 |
| **OEF Fuel Roasters** | Coffee roaster with an online store | Web probes; a store plugin; attempt vs success; gift cards drained; a checkout skimmer; a DDoS as a smokescreen | **Bozak** · **The Seekers** · **Baaz** | 11, 15, 20, 28, 32 |
| **Ironclad Auto Care** | Motor shop, fragile diagnostic equipment | The scan and the decoy critical; the Joomla booking site; a firmware certificate change; two supplier invoices | **Bozak** · **Sivak** · Zumroh's compromised portal | 8, 13, 21, 22 |
| **The Steadfast Outpost Thrift** | Charity thrift store, volunteers | **Nothing, ever.** Four benign tickets | Nobody | 1, 4, 6, 7 |
| **No Go Smile** | Dental practice, patient records | Stale signatures and baseline drift; a cryptominer; the access resold; ransomware staging caught early | **Kapak** (miner and access broker) · **Ember** (ransomware crew) | 10, 16, 27 |
| **Thomas P. Payne School** | School, young users, cloud | Phishing; an exposed cloud share; a pupil with a scanner; the principal's cloned voice; grades changed at 2 a.m. | **Sivak** · **Kapak** (the stolen session was sold) · a curious pupil (innocent) | 2, 9, 18, 25, 26 |
| **Nexxuss** | Tech company | The spray; a pipeline that published its keys; a mailbox taken over; a resigned employee copying files, on the same afternoon | **The Seekers** · **Sleet** (key-hunting bots) · **Derek**, the insider | 5, 12, 23, 24 |
| **Zumroh Motor Company** | Ironclad's parts supplier | Its vendor portal compromised; its real address used | **Sivak** | 21, 22 |
| **Saxet IT Keepers** | Vanguard's previous IT company | Nothing; its forgotten agent is the risk | — | 3, 14 |
| **Optic Light Fibre · RF Jack Cable** | Regional ISPs | An outage that floods the queue; a maintenance notice that arrives late | Nobody | 17, 31 |

---

## 2. The attackers

The first three were approved on 24 September. **The four in bold are new
proposals.** All are Dragonlance Chronicles names, as the owner settled.

| Name | What they are | How they work | Where they hit | ATT&CK flavour |
|---|---|---|---|---|
| **The Seekers** | Identity crew | Password spraying across clients; credential stuffing; MFA fatigue; a consent app to stay in | Nexxuss, Payne School, Steadfast Outpost (spray); OEF (stuffing) | Brute force, valid accounts |
| **Bozak** | Web exploitation crew | Probes, the Joomla flaw, the store plugin; their IPs change daily, their tool's fingerprint never does; late on, prompt injection and a DDoS smokescreen | OEF, Ironclad, the SOC's own AI | Exploit public-facing application |
| **Sivak** | Impersonation | Lookalike domains, a cloned voice, a compromised supplier portal, a fake support call | Payne School, Ironclad via Zumroh, Vanguard | Phishing, impersonation |
| **Kapak** | **NEW: initial access broker** | Gets a foothold, makes a little money (a cryptominer), then **sells the access**. Also sells stolen login sessions from infostealer malware | No Go Smile (the VPN), Payne School (the teacher's session) | External remote services, valid accounts |
| **Ember** | **NEW: ransomware crew** | Buys access from Kapak, then prepares: an admin account, a file sweep, backups deleted. Caught before encrypting | No Go Smile | Inhibit system recovery |
| **Baaz** | **NEW: card-skimming group** | Plants a script in a web shop's checkout that sends card numbers to a lookalike domain | OEF | Supply chain (a third-party script) |
| **Sleet** | **NEW: automated key hunters** | Bots that scan public code and build logs for leaked cloud keys and try them within minutes. Nobody targets Nexxuss; the bots find everybody | Nexxuss | Unsecured credentials |

**Why seven and not three:** real SOCs deal with specialists. The access
broker who breaks in is often not the ransomware crew who cashes out. That's
what the near miss teaches.

**A note on the names:** Ember (Verminaard's red dragon) and Sleet (the white
dragon at Icewall) are from the Chronicles. Kapak, Baaz and Bozak are
draconian kinds from the Chronicles. **I'm not certain sivaks appear in the
original trilogy itself** rather than in later Dragonlance books. If the rule
is strictly the Chronicles, **Aurak** (a draconian kind that is in them) could
replace it.

---

## 3. The people

**The SOC** (approved): Tanis, manager · Laurana, Tier 2 lead · Sturm, IR
lead · Flint, detection engineer · Riverwind, vulnerability management ·
Goldmoon, compliance and reporting · Caramon and Tika, Tier 1 · Raistlin,
threat intel (the innocent 3 a.m. PowerShell) · Tasslehoff, help desk ·
Elistan, owner of RafikisITS · **Fizban**, the AI assistant.

**At the clients (new proposals, all Chronicles names):**

| Name | Who | Where |
|---|---|---|
| Otik | Volunteer (ticket 001) | Steadfast Outpost |
| Alhana, Gilthanas, Eben, Hederick, Maquesta | Teachers (ticket 004) | Payne School |
| **Solostaran** | Principal: the voice that gets cloned | Payne School |
| **Sestun** | The 15-year-old pupil with the scanner | Payne School |
| **Mishakal** | Owner-dentist and HIPAA privacy officer | No Go Smile |
| **Theros** | Owner (a blacksmith in the books; a mechanic here) | Ironclad Auto Care |
| **Koraf** | Accounts contact whose real address is used for the fake bank change | Zumroh Motor Company |
| **Gunthar** | Owner | Vanguard Auto Detailing |
| **Silvara** | Owner | OEF Fuel Roasters |
| **Porthios** | Platform engineer whose pipeline change publishes the keys | Nexxuss |
| **Derek** | The resigned employee copying files | Nexxuss |

---

## 4. The scenario types the owner named, laid out

For each: which business, what happens, who's behind it, the ticket, and the
balance between the real world and the exam.

### Baselines

| Ticket | Business | What happens | Real world | Exam |
|---|---|---|---|---|
| 10 (T2) | No Go Smile | A configuration scan of the imaging workstations against a **CIS benchmark** shows drift: signatures 19 days old because a firewall change blocked updates, an old file-sharing protocol still enabled, and staff with local admin rights | Drift happens quietly after every change | 2.2 (secure baselines, CIS), 1.1 (hardening) |
| 6 (T1) | Steadfast Outpost | Donated laptops appear with old software. No attack; it's the **asset baseline** that's out of date | You can't baseline what you don't know you own | 2.1 (asset inventory) |

### Compliance

| Ticket | Business | Regulation | What happens | Exam |
|---|---|---|---|---|
| 10 (T2) | No Go Smile | **HIPAA** | The baseline drift, written up against the practice's safeguards | 2.5 |
| 27 (T4) | No Go Smile | **HIPAA** | The near miss: the analyst escalates, the privacy officer decides (ticket 005's panel) | 2.5, 4.2 |
| 28 (T4) | OEF | **PCI DSS** | Card numbers leaving through the checkout: the card brands and the payment processor must be told, through the client | 2.5, 4.2 |
| 14 (T3) | Vanguard | **PCI DSS** | The front desk runs the card terminal, so removing the agent goes through change control | 2.5 |
| 9 (T2) | Payne School | Student records and privacy law | Public, encrypted, logging off: "was it read?" becomes a legal question | 2.5, 4.2 |

### Cloud

| Ticket | Business | Who | What happens | Exam |
|---|---|---|---|---|
| 9 (T2) | Payne School | Nobody (a mistake) | A **posture scan** finds a public storage share: encrypted, logging off | 1.2, 2.2, 2.4 |
| 12 (T2) | Nexxuss | **Sleet** | An **infrastructure-as-code** change makes a bucket public and leaks a key in a build log; bots try it within minutes | 1.5, 2.2, 2.3, 2.4 |
| 23 (T4) | Nexxuss | **The Seekers** | A **consent app** keeps mailbox access after the password is reset | 1.1, 1.2, 3.5 |

### Web attacks

| Ticket | Business | Who | What happens | Exam |
|---|---|---|---|---|
| 8 (T2) | Ironclad | **Bozak** | The Joomla flaw on the booking site (real CVE-2023-23752), buried in 118 mediums | 2.3 |
| 11 (T2) | OEF | **Bozak** | A store plugin with EPSS climbing, not yet known-exploited | 1.4, 2.3 |
| 15 (T3) | OEF | **Bozak** | Traversal and injection in the logs: 200 attempts, one success | 1.2, 1.3, 3.1 |
| 20 (T3) | OEF | **The Seekers** | Credential stuffing: every login succeeds, gift cards drained | 1.2, 1.3 |
| 28 (T4) | OEF | **Baaz** | The checkout skimmer | 1.2, 3.2 |
| 32 (T5) | OEF | **Bozak** | A DDoS, while the real login happens quietly | 3.2 |

### Insider threat

| Ticket | Business | Who | What happens | Exam |
|---|---|---|---|---|
| 24 (T4) | Nexxuss | **Derek** (real insider) | After resigning, copies project files to personal cloud storage on the same afternoon as the mailbox takeover. **Separating the two** is the lesson | 1.2, 3.3, 3.4 |
| 18 (T3) | Payne School | **Sestun** (innocent) | A pupil's port scan looks like reconnaissance | 1.2, 3.3, 3.4 |
| Noise (T3) | The SOC | **Raistlin** (innocent) | PowerShell at 3 a.m. on a SOC workstation: his scheduled automation | 3.4: insider alerts don't go to a queue the suspect can read |

### Threat hunting

| Ticket | Business | Who | What happens | Exam |
|---|---|---|---|---|
| 17 (T3) | OEF and Ironclad | **Bozak** | After the ISP flood, a **hypothesis-led hunt**: Bozak's IPs change daily, but their tool's fingerprint is the same at both clients. The **Pyramid of Pain**: hunt the behaviour, not the address | 1.4, 1.5 |
| 31 (T5) | Everyone | All three campaigns | The **Diamond Model** links The Seekers, Bozak and Sivak across clients | 1.4, 3.1 |

### Supply chain

| Ticket | Business | Who | What happens | Exam |
|---|---|---|---|---|
| 3, 14 (T1, T3) | Vanguard | **Saxet IT Keepers** | A former vendor's agent, still installed: unmanaged third-party access | 1.2, 2.5 |
| 13 (T2) | Ironclad | — | The diagnostic tablets' firmware server changes certificate. Update or not? | 1.2 (OT), 2.3 |
| 21 (T4) | Ironclad | **Sivak** via Zumroh | A macro invoice from a compromised supplier portal | 3.1, 3.2 |
| 22 (T4) | Ironclad | **Sivak** via Zumroh | New bank details from Koraf's real address: business email compromise, no malware | 1.2, 3.2 |
| 28 (T4) | OEF | **Baaz** | The skimmer arrives through a third-party script on the checkout page | 1.2, 3.2 |

### Reporting

| Ticket | Who reads it | What the student produces | Exam |
|---|---|---|---|
| Every ticket | The next analyst | The case page write-up, with what could not be confirmed | 4.2 |
| 8, 11 (T2) | Client technical staff | Due dates by the official CVSS bands and the known-exploited rule | 4.1 |
| 27, 28 (T4) | Client, legal | Facts for the privacy officer; facts for the card brands | 4.2 |
| 29 (T5) | SOC management | A quality review: Caramon closing too fast to hit **Tanis's MTTR target** | 4.2 |
| 31 (T5) | Leadership | MTTD, MTTR, a VM scorecard, and the three campaigns in the Diamond Model. The ISP's late notice shows why metrics need context | 4.1, 4.2 |

### Automation

| Ticket | What is automated | What goes wrong, or right | Exam |
|---|---|---|---|
| 12 (T2) | Infrastructure as code | One pipeline change publishes a bucket and a key | 1.5 |
| 17 (T3) | Correlation | Sixty tickets become one | 1.5 |
| 30 (T5) | The phishing **SOAR playbook** | The student fixes three gaps: an "unknown" branch, removing the email from other inboxes, human approval before blocking. Then a **breach-and-attack simulation** run (Atomic Red Team / Caldera style) shows which detections actually fire | 1.5, 2.4 |
| 32 (T5) | **Fizban** | A quiet model update makes it wrong more often; then Bozak's text in a user-agent tells it to call an attack benign | 1.6 |

---

## 5. The insiders — who, and why (26 September)

The owner asked: "Who are we making the insider threat?" The build has
**one real malicious insider, one real accidental insider, and two innocent
suspects**. That matches the real world, where most insider alerts are not
malice, and it keeps veterans from learning "the insider is whoever looks
guilty."

| Who | Where | Kind | What happens | Ticket |
|---|---|---|---|---|
| **Derek** | Nexxuss | **Malicious** (or at least unauthorised) | A senior developer who has resigned and is joining a competitor, **Palanthas Labs**. During his notice period, with his access still active as normal, he uploads 3.8 GB of source code and a customer list to personal cloud storage | 24 (T4) |
| **Porthios** | Nexxuss | **Accidental** | A platform engineer whose infrastructure-as-code change publishes a storage bucket and leaks a key in a build log. No bad intent; real damage | 12 (T2) |
| **Sestun** | Payne School | Innocent suspect | A 15-year-old's port scan after cyber club | 18 (T3) |
| **Raistlin** | The SOC | Innocent suspect | PowerShell at 3 a.m.: his scheduled threat-intel automation | Tier 3 noise |

**Palanthas Labs** is new: Nexxuss's competitor, named after the city in the
Chronicles. **SETTLED 26 September:** "Yes, Palanthas Labs works."

## 5. Still to adjust

The owner approved the page, including Palanthas Labs. It stays the place to
change anything.
