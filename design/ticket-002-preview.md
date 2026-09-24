# Ticket preview 002 — the first scan, on paper, for the owner to adjust

**Nothing here is code.** Ticket 001's shape, approved on 24 September, applied
to vulnerability management, which is 26% of the exam and the first thing to
build.

Tier 2 · The scan · The student's first scan ticket.

**What is new compared with ticket 001:** the evidence is scanner output
rather than a log, there are **three decisions** instead of two, and Fizban is
**half right** this time. It gets one call right and one wrong, so "Fizban is
always wrong" can't be learned as a shortcut.

---

## 1. What lands in the queue

| | |
|---|---|
| **Ticket** | VOO-2107 |
| **Opened** | Monday 07:10, by the scanner, after the weekly scan finished |
| **Title** | *Weekly scan complete — Ironclad Auto Care — 412 findings* |
| **Severity** | Set by the analyst |
| **Client** | Ironclad Auto Care |
| **Linked** | VOO-2098, raised by Ironclad on Tuesday: *"Bay 3 tablet froze during your scan"* |
| **Status** | New · assigned to you |

Riverwind, the vulnerability management engineer, has left one line on it:
*"Pick what gets fixed this week. The shop has one change window."*

**The job is not to read 412 findings.** It is to find the few that matter
and to know why the rest can wait.

---

## 2. The evidence tabs

Open in any order. Nothing is locked.

### Tab A — Scan job summary

```
JOB        IRONCLAD-WEEKLY          policy: Full and fast
TARGETS    23 hosts                 internal + 1 external
STARTED    Tue 10:00                FINISHED  Mon 06:58 (resumed 3x)
SAFE CHECKS  off
CREDENTIALED CHECKS
  success      18 hosts
  failed        1 host   10.40.11.8   (login rejected)
  not tried     4 hosts  10.40.14.21-24  (no account configured)
FINDINGS   412   critical 9 · high 41 · medium 118 · low/info 244
```

The discriminating details here are not highlighted: **safe checks off**, a
start time **in the middle of a Tuesday**, and **one failed login**.

### Tab B — Findings, as the scanner sorts them (by CVSS, highest first)

| CVSS | Host | Finding | EPSS | Exploit public | How detected |
|---|---|---|---|---|---|
| 9.8 | 10.40.12.30 bench-pc-02 | ECU flashing suite — unauthenticated remote code execution in its bundled web service | 0.004 | No | Credentialed |
| 9.8 | 10.40.12.31 bench-pc-03 | Same finding | 0.004 | No | Credentialed |
| 9.1 | 10.40.14.21–24 bay tablets | End-of-life embedded operating system, 6 findings across 4 hosts | — | — | Remote, no login |
| 7.5 | 10.40.11.8 parts-db | OpenSSH below the vendor's fixed version — several issues | 0.02 | Yes | **Remote banner** |
| 7.1 | 10.40.11.12 file-srv | Outdated archive utility | 0.01 | No | Credentialed |
| … | | *36 more high* | | | |
| 6.5 | 203.0.113.60 book.ironcladauto.example | Booking plugin — a customer's uploaded document can be fetched by changing the number in its link | 0.38 | Yes | External, unauthenticated |
| … | | *117 more medium* | | | |
| 3.7 | 10.40.11.12 file-srv | Self-signed certificate — one of 61 findings on this host, 58 of them informational | — | — | Credentialed |
| … | | *243 more low/info* | | | |

**The booking plugin sits in the middle of 118 mediums.** Sorted by CVSS, the
student meets it after every critical and every high.

### Tab C — Asset register and client context

| Host | Role | Where it sits |
|---|---|---|
| bench-pc-02, -03 | Flash engine control units on customer cars | VLAN 12. No internet route. Inbound only from the scanner and the bench manager's laptop |
| bay tablets ×4 | Diagnostic tablets, **owned by the equipment vendor** | VLAN 14 |
| parts-db | Parts orders and supplier accounts | VLAN 11, reachable from the shop network |
| file-srv | Shared documents | VLAN 11 |
| book.ironcladauto.example | Customer booking site | **Internet-facing.** Customers upload a photo of their driving licence and insurance card to book |

Notes from Ironclad:

- The vendor's support contract is void if any third-party software is
  installed on the tablets
- Technicians leave calibration jobs running overnight on weekdays
- The shop is closed on Sundays
- Ironclad's IT contractor rotated every service-account password last Monday,
  under their quarterly policy

### Tab D — The linked complaint, VOO-2098

> Tuesday 10:40 — Bay 3's tablet froze in the middle of a calibration. The tech
> had to start again and lost forty minutes. Nothing like this has happened
> before. Was this your scan?

### Tab E — Fizban's summary

> **Top priority: the booking plugin.** It's internet-facing, the exploit is
> public and EPSS is high. **The parts-db OpenSSH finding is probably a false
> positive.** That distribution backports security fixes, so the version
> number is misleading. Recommend closing it.

The first half is right and the second half isn't. The student has to find
which half is wrong.

---

## 3. The guide, one step at a time

Advisory, and shorter than in Tier 1.

1. **Before any finding: how was this scan run?** Could the scan itself have
   caused trouble or missed anything?
2. **What is each host for, and who can reach it?**
3. **For each finding: how bad is the flaw, how likely is someone to use it,
   and what does it sit in front of?**
4. **How did the scanner know?** Did it log in, or read a banner?
5. **Check Fizban against the evidence.**
6. **Pick what gets fixed this week.**
7. **Fix the scan itself.**
8. **Write it up.**

---

## 4. The decisions

Three boards. Six options each, one correct, **shuffled by seed**, all written
to about the same length. They chain: a wrong answer never carries into the
next board.

### Decision 1: what goes first this week?

*Ironclad has one change window this week. Which finding goes first?*

| | Option | Why it is wrong |
|---|---|---|
| ✅ | **The booking plugin — internet-facing, public exploit, EPSS 0.38, customer licence photos behind it** | — |
| ✗ | The ECU flashing flaw on bench-pc-02 — its CVSS 9.8 is the highest score anywhere in this week's scan | CVSS scores the flaw, not where it sits. VLAN 12 has no route in, and nobody is exploiting this one |
| ✗ | Every critical first, in CVSS order, then the highs — the scanner has already ranked all of them for us | Nine criticals and forty-one highs go ahead of the one flaw that is reachable and being used |
| ✗ | OpenSSH on parts-db — a CVSS 7.5 on the system that holds every parts order | The scan never logged in to parts-db. This is a guess from a banner, not a confirmed finding |
| ✗ | The bay 3 tablet — it has already failed once this week, so it is the weakest host | Our scan crashed it, not an attacker. That is a scan problem, not a vulnerability |
| ✗ | file-srv — sixty-one findings, the most on any host, so it has the most exposure | Counting findings is not measuring risk. Fifty-eight of them are informational |

**The exam lesson:** CVSS measures how bad a flaw is. **EPSS** estimates how
likely it is to be exploited. **Exposure and asset value** say what it would
cost you. Priority weighs all three, not the scanner's sort order.

### Decision 2: the parts-db OpenSSH finding

*What is the most defensible disposition for the OpenSSH finding on parts-db?*

| | Option | Why it is wrong |
|---|---|---|
| ✅ | **Unconfirmed — the login failed, so this is a banner guess. Fix the scan account, rescan, then decide** | — |
| ✗ | False positive — this distribution backports its SSH fixes, so the version banner misleads. Close it | It might be true, but nothing has checked it. This is Fizban's answer |
| ✗ | True positive — patch parts-db in this week's change window, because a CVSS of 7.5 is rated as high | Spends the only window on a guess, and pushes the booking plugin back a week |
| ✗ | Accept the risk for ninety days, since parts-db is only reachable from inside the shop's own network | Risk acceptance needs a confirmed finding and the client's signature. An analyst can't accept risk |
| ✗ | Escalate to incident response — a rejected scan login means that somebody changed that account's password | Somebody did: Ironclad rotated every service password last Monday. It's in the client notes |
| ✗ | Non-issue — SSH findings on internal hosts count as informational, so it can wait with the other lows | Nothing makes an internal host harmless. It's unconfirmed, not unimportant |

**The exam lesson:** a non-credentialed result reads version banners. A
credentialed scan reads installed packages. **A failed login quietly turns one
into the other.** Check how a finding was detected before you believe it,
and before you dismiss it.

### Decision 3: scanning the bay tablets without breaking them

*How should the bay tablets be scanned from now on?*

| | Option | Why it is wrong |
|---|---|---|
| ✅ | **Their own policy: safe checks on, one host at a time, every Sunday, shop told first** | — |
| ✗ | Exclude the bay tablets from scanning — they belong to the vendor and keep falling over | They are still on the network. Excluding them makes a permanent blind spot |
| ✗ | Keep the current policy, but move the tablets' scan to 02:00 on a weeknight, when nobody is working | It still crashes them, and weeknights are when calibrations are left running |
| ✗ | Install the scanner's agent on each tablet so they no longer need probing over the network | The vendor's contract is void if third-party software goes on the tablets |
| ✗ | Replace the scan with a ping sweep so the tablets still appear in inventory | You would know they exist and nothing about what is wrong with them |
| ✗ | Raise the scanner's timeout so each tablet gets longer to answer before the next probe | Treats the symptom. The load is what freezes them, not the timeout |

This is the owner's point about tuning, applied to the scanner. **The
students set up their own sensors.** Too aggressive and the scan breaks the
shop. Too timid and it misses things. What they choose carries into later
tickets. A student who excludes the tablets never sees the stale-signature
thread that runs through them in Tier 3.

### The hint ladder, as in Security

Nothing at guesses one and two. For Decision 1:

- **Rung 1 (guess 3): where to look.** "Read the asset register next to the
  findings. Who can reach each host?"
- **Rung 2 (guess 4): the principle.** "A score describes the flaw as if every
  system were equally exposed. Priority is the flaw, how likely it is to be
  used, and what it sits in front of."
- **Rung 3 (guess 5 onward): narrowed, with reasons.** Strikes options until
  two are left, each with its reason, and never names the answer.

For Decision 2:

- **Rung 1:** "Look at how each finding was detected, and at the scan job
  summary."
- **Rung 2:** "A scanner that can't log in can only read what a service
  announces about itself."

For Decision 3:

- **Rung 1:** "Read Ironclad's notes before choosing a time or a tool."
- **Rung 2:** "A scan of a fragile system has to be gentler, and it has to run
  when nothing is relying on it."

A wrong pick stays red, marked three ways, until solved or reset.

---

## 5. The write-up

Same five prompts as ticket 001. Written up well:

> Weekly scan of Ironclad, 412 findings. Fix first: the booking plugin on the
> internet-facing booking site (CVSS 6.5, EPSS 0.38, public exploit, customer
> licence and insurance photos behind it). The two 9.8s on the bench PCs sit on
> VLAN 12 with no inbound route, so they are scheduled in their normal window.
> parts-db OpenSSH is unconfirmed: the credentialed login failed after
> Ironclad's password rotation. Scan account to be updated, then rescan. Bay
> tablets move to their own policy (safe checks, one host at a time, Sunday
> window, shop notified). Not proven: that VLAN 12 really is isolated. We have
> the register's word for it, not the firewall rules.

That last line is the lesson from ticket 001 again: **state what you can
evidence, and say what you can't.**

---

## 6. What this one ticket teaches

Labelled by the wording of the owner's objective list. No sub-objective
numbers are claimed.

| Domain | Objective |
|---|---|
| Vulnerability Management | Implement the appropriate vulnerability scanning method: credentialed vs not, safe checks, fragile systems, scan windows |
| Vulnerability Management | Analyze output from vulnerability assessment tools: how a finding was detected, unconfirmed results |
| Vulnerability Management | Prioritize and mitigate vulnerabilities: CVSS, EPSS, exposure, asset value |
| Vulnerability Management | Control types, risks and VM concepts: risk acceptance, who may accept, compensating controls |
| Security Operations | Summarize concepts related to the use of AI in security operations: risks |
| Reporting and Communication | Explain vulnerability management reporting and communication: telling the client before the scan, the write-up |

---

## 7. Kept safe

- Internal addresses are private `10.40.x.x`, none of which appear in the
  class sims. The external one is from `203.0.113.0/24`, a range reserved for
  documentation
- Every domain ends in `.example`
- **No CVE numbers are shown yet.** See the first question below
- No exploit code, no real products named

---

## For the owner to adjust

1. **Real CVE numbers, or invented ones?**
   - *Real* is closer to a real SOC, and students can look them up. But every
     score, EPSS value and known-exploited status would have to be checked
     against the live sources at build time, and those numbers change.
   - *Invented* numbers keep the teaching stable and match nothing real. But
     one could collide with a real CVE by accident, so they would carry a
     visible "training" label.
   - **Recommended:** no CVE numbers in the findings at all, as drafted here,
     plus one short panel that shows a few real, famous CVEs so students learn
     what the format looks like.
2. **Remediation windows.** The class material maps severity bands to 7, 14
   and 30 days. Should the write-up ask the student for a due date by band?
3. **Is three decisions right for a scan ticket,** or do you want a fourth on
   the bench PCs (schedule them in their window, with the isolation written
   down as a compensating control)?
4. **Is the booking plugin buried deeply enough,** or too deeply for the
   first scan ticket?
