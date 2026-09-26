# Ticket preview 005 — the near miss, on paper, for the owner to adjust

**Nothing here is code.** Map ticket **27**: No Go Smile, Tier 4, the run
stage. The owner kept this storyline "because they are going to be in a real
SOC."

Tier 4 · The incident · **Five decisions** (run).

**What is new at the run stage:**

- **Nothing is attached.** Three alerts arrive close together; the student
  decides where to look
- **The guide is collapsed** and opens only if asked
- **The queue is live.** Other tickets keep arriving while they work
- **Written at the analyst's level.** Evidence appears as alert titles, log
  rows and summaries, the way a SOC console shows it. There are no attacker
  commands or tooling in the material

---

## 1. What lands in the queue — Tuesday, 01:40 UTC

Three alerts from one client inside twenty minutes, after hours:

| Case | Time | Severity | Alert | Entity |
|---|---|---|---|---|
| VOO-4102 | 01:21 | Medium | New local administrator account created: `support_tmp` | NGS-FILE-01 |
| VOO-4104 | 01:33 | High | One account read 4,180 files across 6 shares in 11 minutes | NGS-FILE-01 |
| VOO-4107 | 01:38 | High | Backup copies deleted on the host | IMG-WS-02 |

Around them, the rest of the night shift: two Steadfast Outpost alerts, a
Payne School report, and the ISP's planned maintenance.

---

## 2. The screens — all in the console, none attached

**Identity.** `support_tmp` was created at 01:21 by the account `imgtech`,
the imaging vendor's support account. `imgtech` signed in at **01:12 through
the VPN** from `198.51.100.211`. The vendor's contract says support happens in
business hours, by appointment.

**VPN log.** `imgtech` has not used the VPN in 11 weeks. The last successful
sign-ins before tonight were during the **cryptominer incident** (map ticket
16).

**SIEM search.** On NGS-FILE-01, 4,180 file **reads** since 01:22 and
**no mass writes or renames**. Nothing has been encrypted yet. That one detail
decides the whole ticket.

**EDR.** IMG-WS-02 and IMG-WS-03: backup copies deleted at 01:38 and 01:39
by a built-in Windows tool, run as `support_tmp`. Both hosts are still
running. EDR can isolate them.

**Network.** Outbound from NGS-FILE-01 at normal levels so far. No large
uploads.

**Ticket history.** Map ticket 16, six weeks ago: *cryptominer removed from
the imaging workstations; entry point the unpatched VPN appliance; appliance
patch scheduled.* The asset inventory shows the patch **still not applied**.

**Client runbook.** Out-of-hours contact: the practice manager. Privacy
officer for HIPAA questions: the practice's outside counsel. RafikisITS
escalation: **Sturm**, incident response lead.

### Fizban, asked on purpose

> This is ransomware. **Recommend shutting down every server at No Go Smile
> immediately** to stop the encryption.

Decisive and wrong. Nothing is encrypted yet. Pulling the power destroys the
evidence in memory and takes the practice down, when isolating the hosts would
stop the attacker and keep both.

---

## 3. The guide — collapsed (Tier 4)

Closed by default. Opened, it gives five headings only: **What is happening?
· Stop it · Keep the evidence · Who has to know · Why did it happen?**

---

## 4. The decisions

Five boards. Six options each, one correct, **shuffled by seed**, written to
about the same length. They chain; a reset goes back to the last one answered
correctly.

### Decision 1: what is this?

*What is the most defensible reading of the three alerts?*

| | Option | Why it is wrong |
|---|---|---|
| ✅ | **Ransomware staging in progress: a new admin, files swept, backups deleted, no encryption yet** | — |
| ✗ | The cryptominer is back: the same VPN entry point is being used to mine on the imaging hosts | Nothing is mining. Admin creation, a file sweep and deleted backups are preparation for something bigger |
| ✗ | The imaging vendor doing late maintenance, which explains the account and the backup clean-up | Support is by appointment in business hours. And maintenance doesn't delete the backups |
| ✗ | A misfiring backup job: the reads are the backup running and the deletions are it rotating copies | The reads come from a new admin account, not the backup service |
| ✗ | Data theft by an insider, since the only confirmed activity so far is reading thousands of files | The access came in through the vendor's VPN account at 01:12. No staff account is involved |
| ✗ | Ransomware that has already encrypted the practice, so the only way back now is a full restore | No mass writes or renames. The encryption hasn't started. That's why this is a near miss |

**The exam lesson:** ransomware usually has a **preparation stage**:
privileges, discovery, and destroying the way back. Catching it there is
the difference between an incident and a disaster.

### Decision 2: what do you do first?

*It is 01:41. What is the right first action?*

| | Option | Why it is wrong |
|---|---|---|
| ✅ | **End the VPN session, disable imgtech and support_tmp, and isolate the two hosts in EDR** | — |
| ✗ | Shut down every server at the practice so that the encryption can't start at all tonight | Fizban's answer. It destroys the evidence in memory and takes the whole practice down |
| ✗ | Watch quietly for another hour to learn the attacker's tools before we tip them off | Encryption could start any minute. Containment comes before curiosity |
| ✗ | Reset the imgtech password and leave the rest alone so the practice keeps running | Resetting a password doesn't end a live session, and support_tmp still exists |
| ✗ | Block 198.51.100.211 at the firewall, since that's where the VPN session came from | They can reconnect from any address. The account and session are the access |
| ✗ | Start restoring the file server from backup now, before anything else gets deleted | Nothing is encrypted, and restoring while the attacker is still inside undoes nothing |

**The exam lesson:** containment cuts off the **access** (the account, the
session, the hosts), not an IP address, and not the whole business.

### Decision 3: keeping the evidence

*The two hosts are isolated. What happens to them next?*

| | Option | Why it is wrong |
|---|---|---|
| ✅ | **Capture memory and live connections first, then disk images, under chain of custody** | — |
| ✗ | Reimage both hosts tonight so the imaging room is clean again before the practice opens | Wipes the evidence of how they got in and what they touched |
| ✗ | Power both hosts off to protect the disks, then take images of them in the morning | Memory is lost the moment the power goes. It's the most volatile evidence |
| ✗ | Export the EDR alerts and screenshots to the ticket; that is enough to show what happened | Alerts are summaries. They aren't the evidence itself, and they won't survive scrutiny |
| ✗ | Ask the practice manager to copy the logs to a USB stick and bring them in tomorrow | No chain of custody, and an untrained person handling evidence |
| ✗ | Capture the disks first because they hold the most data, and then take the memory | Order of volatility: memory first. Disks will still be there in an hour |

**The exam lesson:** the **order of volatility**. Collect what disappears
first (memory, live connections) before what lasts (disks, logs), and record
who touched it and when.

### Decision 4: who has to know, and who decides

*Containment is done. Who is told, and who decides whether it's a HIPAA
breach?*

| | Option | Why it is wrong |
|---|---|---|
| ✅ | **Escalate to Sturm and the practice manager now; their privacy officer decides on HIPAA** | — |
| ✗ | Tell the practice manager it is not a breach, since no files were encrypted in the end | Not the analyst's call. Files were read, so the privacy officer has to assess it |
| ✗ | Notify the patients directly tonight, since patient records were on the shares that were read | Notification is the practice's legal decision, made by its privacy officer, not ours |
| ✗ | Report it to law enforcement yourself before telling anyone at the practice or at RafikisITS | That decision belongs to the client and its counsel, through the runbook |
| ✗ | Post it in the SOC team chat and wait for the day shift to decide who else needs to know | The runbook names an out-of-hours contact for exactly this. Waiting loses hours |
| ✗ | Hold every notification until the investigation is complete so the facts are all confirmed | Escalation happens now; notification decisions follow the facts. They're different steps |

**The seat, again:** the analyst escalates with evidence. The **client
decides** on breach notification, through the person whose job that is.

### Decision 5: why did it happen?

*What is the root cause?*

| | Option | Why it is wrong |
|---|---|---|
| ✅ | **The VPN patch from the miner incident was not applied, and imgtech's password still worked** | — |
| ✗ | The imaging vendor, whose support account was used to get into the practice's network tonight | The vendor's account was the key, not the cause. Why did the key still work? |
| ✗ | A staff member clicking a phishing email, which is how most ransomware gets into a network | No evidence of phishing. The way in is right there in the VPN log |
| ✗ | The anti-malware signatures being weeks out of date on the imaging workstations and server | That was ticket 10, and it was fixed. Signatures don't stop a valid login |
| ✗ | The cryptominer itself, which was never fully removed from the imaging workstations | It was removed. The door it came through was left open |
| ✗ | Backups kept on the same hosts as the data, so deleting them was easy for the attacker | A real weakness to fix, but it's why the damage could have been worse, not why they got in |

**The exam lesson:** the root cause is the **decision that let it
happen**, here a patch scheduled and never applied, and credentials never
rotated after the first incident. It is not the attacker, and not the
symptom.

### The hint ladder, as in Security

Nothing at guesses one and two. Then:

| | Rung 1 (guess 3): where to look | Rung 2 (guess 4): the principle |
|---|---|---|
| **D1** | "Compare reads and writes on the file server." | "Ransomware prepares before it encrypts." |
| **D2** | "What is the attacker actually using to be inside?" | "Contain the access, not the address." |
| **D3** | "What is lost first if a host is switched off?" | "Collect the most volatile evidence first." |
| **D4** | "Read the client runbook's contacts." | "The analyst escalates; the client decides." |
| **D5** | "Read ticket 16's closing note, then the asset inventory." | "The root cause is what allowed it, not who did it." |

Rung 3, from guess 5 onward, strikes options until two are left, each with
its reason, and never names the answer. A wrong pick stays red, marked three
ways, until solved or reset.

---

## 5. The write-up — on the case page

> **Analyst notes.** 01:21–01:38: new admin account on NGS-FILE-01, 4,180
> files read across 6 shares, backup copies deleted on IMG-WS-02 and -03.
>
> **Investigation.** Access through the VPN at 01:12 with the imaging vendor's
> account `imgtech`, unused for 11 weeks and out of contract hours.
> `support_tmp` created by `imgtech`. Reads only, no mass writes: staging, not
> encryption. The VPN appliance patch from the cryptominer incident was never
> applied.
> *Evidence reviewed:* identity, VPN log, SIEM file activity, EDR, network,
> ticket history, asset inventory.
> *Actions taken:* VPN session ended; `imgtech` and `support_tmp` disabled;
> IMG-WS-02 and -03 isolated; memory, connections and disk images captured,
> chain of custody recorded; escalated to Sturm and the practice manager at
> 01:52.
>
> **Resolution.** Ransomware staging, contained before encryption. Root
> cause: the VPN patch never applied and vendor credentials never rotated
> after the cryptominer incident. Recommended: patch the appliance, rotate
> every vendor and service credential, move backups off the hosts, and review
> vendor access. HIPAA assessment with the privacy officer. **Could not be
> confirmed:** that no files left the network before 01:12. Outbound
> monitoring on the file server only goes back 30 days.

---

## 6. What this ticket taught — objective by objective

Numbers from the owner's list, still unverified against CompTIA's PDF.

| Objective | What you did | Why it is this objective | The words the exam uses |
|---|---|---|---|
| **3.2** Follow incident response processes | Detection → containment → evidence → escalation → root cause | Those are the IR life-cycle stages, in order | Preparation · detection and analysis · containment · eradication · recovery · post-incident |
| **3.3** Triage and evidence handling | Read vs write decided it; memory before disk; chain of custody | Triage sets severity; evidence handling keeps it usable | Order of volatility · chain of custody · volatile / non-volatile |
| **3.5** Remediation and root cause | Found the unapplied patch and the unrotated credentials | Root cause is the condition that allowed the incident | Root cause analysis · remediation · lessons learned |
| **3.4** Escalation | Sturm and the out-of-hours contact, per the runbook | Escalation follows the playbook, not the chat | Escalation path · playbook · functional notification |
| **2.5** Risk and compliance | Left the HIPAA decision to the privacy officer | Regulation decides who makes the notification call | HIPAA · breach assessment · data protection |
| **4.2** Incident reporting | The write-up, with what could not be confirmed | Reporting is for legal, the client and the next analyst | Incident report · lessons learned · legal and PR |
| **3.1** Attack frameworks | Mapped the stages (below) | ATT&CK names each step the attacker took | MITRE ATT&CK · tactics and techniques |
| **1.6** AI in security operations | Rejected Fizban's shutdown advice | An AI can be decisive and wrong; the analyst owns the call | Human in the loop · over-reliance |

**ATT&CK mapping**, checked against MITRE's data (v19.2): the way in,
T1133 External Remote Services with T1078 Valid Accounts · T1136 Create
Account · T1135 Network Share Discovery · T1490 Inhibit System Recovery. What
**didn't** happen: T1486 Data Encrypted for Impact.

---

## 7. Kept safe

- Evidence is shown as alert titles and log summaries, the way a console
  shows it. **No attacker commands, tools or techniques to copy**
- `198.51.100.211` is a documentation address; hosts and people are fictional

---

## For the owner to adjust

1. **Five decisions at the run stage:** is this the right weight?
2. **Fizban wrong in a dangerous way** (shut everything down): good for Tier
   4?
3. **The HIPAA line:** the analyst escalates, and the practice's privacy
   officer decides. Is that how you teach it?
