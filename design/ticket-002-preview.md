# Ticket preview 002 — the first scan, on paper, for the owner to adjust

**Nothing here is code.** Ticket 001's shape, approved on 24 September, applied
to vulnerability management, which is 26% of the exam and the first thing to
build.

Tier 2 · The scan · The student's first scan ticket · **three decisions**
(crawl, walk, run: ticket 001 had two).

**Second draft, 24 September.** It now uses **real CVE numbers**, which the
owner allowed "as long as most of everything else is fake". It also uses the
**remediation windows from the class material**, because "the student needs to
know this information".

Fizban is **half right** on this ticket. It gets one call right and one wrong,
so "Fizban is always wrong" can't be learned as a shortcut.

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

| CVSS 3.x | Host | Finding | CISA: exploitation | Known exploited | How detected |
|---|---|---|---|---|---|
| 10.0 | 10.40.14.21–24 bay tablets | End-of-life embedded operating system, 7 findings on 4 hosts. *Scanner's own rating, no CVE* | — | — | Remote, no login |
| 9.8 | 10.40.12.30 bench-pc-02 | ECU flashing suite bundles Apache Commons Text 1.9, **CVE-2022-42889** | none | No | Credentialed: library found on disk |
| 9.8 | 10.40.12.31 bench-pc-03 | Same finding | none | No | Credentialed: library found on disk |
| 8.1 | 10.40.11.8 parts-db | Service banner reads OpenSSH 8.7p1, **CVE-2024-6387** | proof of concept | No | **Remote: version banner only** |
| 7.8 | 10.40.11.12 file-srv | 7-Zip 24.06, **CVE-2024-11477** | proof of concept | No | Credentialed: installed version |
| … | | *36 more high* | | | |
| 5.3 | 203.0.113.60 book.ironcladauto.example | Joomla! 4.2.7, improper access check in web service endpoints, **CVE-2023-23752** | **active** | **Yes, since 2024-01-08** | External, active check: the endpoint answered without a login |
| … | | *117 more medium* | | | |
| 3.7 | 10.40.11.12 file-srv | Self-signed certificate. One of 61 findings on this host, 58 of them informational | — | — | Credentialed |
| … | | *243 more low/info* | | | |

**The booking site sits in the middle of 118 mediums.** Sorted by score, the
student meets it after every critical and every high.

### Tab C — Asset register and client context

| Host | Role | Where it sits |
|---|---|---|
| bench-pc-02, -03 | Flash engine control units on customer cars | VLAN 12. No internet route. Inbound only from the scanner and the bench manager's laptop |
| bay tablets ×4 | Diagnostic tablets, **owned by the equipment vendor** | VLAN 14 |
| parts-db | Parts orders and supplier accounts. Red Hat Enterprise Linux 9 | VLAN 11, reachable from the shop network |
| file-srv | Shared documents | VLAN 11 |
| book.ironcladauto.example | Customer booking site. Built by a web designer in 2022 and not touched since | **Internet-facing.** Customers upload a photo of their driving licence and insurance card to book |

Notes from Ironclad:

- The vendor's support contract is void if any third-party software is
  installed on the tablets
- Technicians leave calibration jobs running overnight on weekdays
- The shop is closed on Sundays
- Ironclad's IT contractor rotated every service-account password last Monday,
  under their quarterly policy

### Tab D — Ironclad's remediation policy (in the RafikisITS contract)

The class material's windows, with the boundaries set on the official CVSS
bands (see question 1 at the end).

| Severity (CVSS 3.x base) | Fix within | Applies to |
|---|---|---|
| Critical, 9.0–10.0 | 7 days | Production and test |
| High, 7.0–8.9 | 14 days | Production |
| Medium, 4.0–6.9 | 30 days | Production |
| Low, 0.1–3.9 | Next quarterly cycle | Production |
| **On CISA's known-exploited list** | **7 days, whatever the score** | Everything |
| **Can't meet the date** | An exception **signed by the client**, with a compensating control and a review date | |

The clock starts on the scan date.

### Tab E — The linked complaint, VOO-2098

> Tuesday 10:40 — Bay 3's tablet froze in the middle of a calibration. The tech
> had to start again and lost forty minutes. Nothing like this has happened
> before. Was this your scan?

### Tab F — Fizban's summary

> **Top priority: the booking site.** It's internet-facing and on the
> known-exploited list. **The parts-db OpenSSH finding is probably a false
> positive.** Red Hat backports security fixes, so the version number is
> misleading. Recommend closing it.

The first half is right and the second half isn't. The student has to find
which half is wrong.

---

## 3. The guide, one step at a time

Advisory, and shorter than in Tier 1.

1. **Before any finding: how was this scan run?** Could the scan itself have
   caused trouble or missed anything?
2. **What is each host for, and who can reach it?**
3. **For each finding: how bad is the flaw, is anybody actually using it, and
   what does it sit in front of?**
4. **How did the scanner know?** Did it log in, test it, or read a banner?
5. **Check Fizban against the evidence.**
6. **Pick what gets fixed this week.**
7. **Fix the scan itself.**
8. **Write it up, with a due date for every finding you name.**

---

## 4. The decisions

Three boards. Six options each, one correct, **shuffled by seed**, all written
to about the same length. They chain: a wrong answer never carries into the
next board.

### Decision 1: what goes first this week?

*Ironclad has one change window this week. Which finding goes first?*

| | Option | Why it is wrong |
|---|---|---|
| ✅ | **The Joomla! flaw on the booking site — internet-facing, known exploited, customer ID photos behind it** | — |
| ✗ | The Commons Text flaw on bench-pc-02 — its CVSS 9.8 is the highest CVE score anywhere in this scan | CVSS scores the flaw, not where it sits. VLAN 12 has no route in, and CISA records no exploitation |
| ✗ | Every critical first, in CVSS order, then the highs — the scanner has already ranked all of them for us | Nine criticals and forty-one highs go ahead of the one flaw that is reachable and being used |
| ✗ | OpenSSH on parts-db — a CVSS 8.1 on the system that holds every parts order | The scan never logged in to parts-db. This is a guess from a banner, not a confirmed finding |
| ✗ | The bay 3 tablet — it has already failed once this week, so it is the weakest host | Our scan crashed it, not an attacker. That is a scan problem, not a vulnerability |
| ✗ | file-srv — sixty-one findings, the most on any host, so it has the most exposure | Counting findings is not measuring risk. Fifty-eight of them are informational |

**The exam lesson:** CVSS measures how bad a flaw is. **Evidence of
exploitation** (CISA's known-exploited list, CISA's exploitation rating, and
EPSS) says whether anybody is using it. **Exposure and asset value** say
what it would cost you. Priority weighs all three, not the scanner's sort
order. Ironclad's own policy agrees: known-exploited means 7 days, whatever
the score.

### Decision 2: the parts-db OpenSSH finding

*What is the most defensible disposition for the OpenSSH finding on parts-db?*

| | Option | Why it is wrong |
|---|---|---|
| ✅ | **Unconfirmed — the login failed, so this is a banner guess. Fix the scan account, rescan, then decide** | — |
| ✗ | False positive — Red Hat backports its SSH fixes, so the version banner misleads. Close it | It might be true, but nothing has checked it. This is Fizban's answer |
| ✗ | True positive — patch parts-db in this week's change window, because a CVSS of 8.1 is rated as high | Spends the only window on a guess, and pushes the booking site back a week |
| ✗ | Accept the risk for ninety days, since parts-db is only reachable from inside the shop's own network | The policy says exceptions are signed by the client. An analyst can't accept risk |
| ✗ | Escalate to incident response — a rejected scan login means that somebody changed that account's password | Somebody did: Ironclad rotated every service password last Monday. It's in the client notes |
| ✗ | Non-issue — SSH findings on internal hosts count as informational, so it can wait with the other lows | Nothing makes an internal host harmless. It's unconfirmed, not unimportant |

**The exam lesson:** a non-credentialed result reads version banners. A
credentialed scan reads installed packages. **A failed login quietly turns one
into the other.** CVE-2024-6387 is the real case: Red Hat's own record lists
the fix inside package `8.7p1-38.el9_4.1`, so a patched server and an
unpatched one show the same `8.7p1` banner. Check how a finding was detected
before you believe it, and before you dismiss it.

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
tickets.

### The hint ladder, as in Security

Nothing at guesses one and two. For Decision 1:

- **Rung 1 (guess 3): where to look.** "Read the asset register and the two
  exploitation columns next to the scores."
- **Rung 2 (guess 4): the principle.** "A score describes the flaw as if every
  system were equally exposed. Priority is the flaw, whether anybody is using
  it, and what it sits in front of."
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

## 5. The write-up — now with due dates

Ticket 001's five prompts, plus one:

- **When is each fix due, and which rule sets the date?**

Written up well:

> Weekly scan of Ironclad, 412 findings.
>
> **Fix first:** Joomla! 4.2.7 on the internet-facing booking site,
> CVE-2023-23752. Medium on score (5.3), but on CISA's known-exploited list,
> so it is **due in 7 days** under the known-exploited rule. Customer licence
> and insurance photos sit behind it.
>
> **Bench PCs:** Commons Text 1.9 in the ECU flashing suite,
> CVE-2022-42889, 9.8. Critical, so **due in 7 days**. They can't make this
> week's window, so an exception goes to Ironclad to sign, with VLAN 12's
> isolation as the compensating control, until the next window.
>
> **parts-db:** OpenSSH, CVE-2024-6387, is **unconfirmed**. The credentialed
> login failed after Ironclad's password rotation. The scan account is to be
> updated and the host rescanned this week. If it is confirmed, it is **due in
> 14 days** (high), counted from the scan date.
>
> **file-srv:** 7-Zip, CVE-2024-11477, 7.8. High, so **due in 14 days**.
>
> **Bay tablets:** they move to their own scan policy (safe checks, one host
> at a time, Sundays, shop told first). The end-of-life operating system can't
> be patched by us, so it goes to the vendor.
>
> **Not proven:** that VLAN 12 really is isolated. We have the register's word
> for it, not the firewall rules.

---

## 6. What this one ticket teaches

Labelled by the wording of the owner's objective list. No sub-objective
numbers are claimed.

| Domain | Objective |
|---|---|
| Vulnerability Management | Implement the appropriate vulnerability scanning method: credentialed vs not, safe checks, fragile systems, scan windows |
| Vulnerability Management | Analyze output from vulnerability assessment tools: how a finding was detected, banner vs package, unconfirmed results |
| Vulnerability Management | Prioritize and mitigate vulnerabilities: CVSS, the known-exploited list, exploitation evidence, exposure, asset value, remediation windows |
| Vulnerability Management | Control types, risks and VM concepts: exceptions, who may accept risk, compensating controls |
| Security Operations | Summarize concepts related to the use of AI in security operations: risks |
| Reporting and Communication | Explain vulnerability management reporting and communication: due dates, telling the client before the scan |

---

## 7. The real data — checked 24 September against primary sources

The owner allowed real CVE numbers. Every fact about them below was read from
the official records, not from memory:

| CVE | Product and affected versions | Score, and who scored it | CISA exploitation rating | CISA known-exploited list |
|---|---|---|---|---|
| CVE-2023-23752 | Joomla! 4.0.0 through 4.2.7 | 5.3 medium, CVSS 3.1 (CISA) | **active** | **Yes, added 2024-01-08** |
| CVE-2022-42889 | Apache Commons Text 1.5 up to 1.10.0 (fixed in 1.10.0) | 9.8 critical, CVSS 3.1 (GitHub-reviewed advisory GHSA-599f-7c49-w659) | none | No |
| CVE-2024-6387 | OpenSSH 8.5p1 through 9.7p1; fixed for RHEL 9 in `8.7p1-38.el9_4.1` | 8.1 high, CVSS 3.1 (Red Hat) | proof of concept | No |
| CVE-2024-11477 | 7-Zip 24.06 | 7.8 high, CVSS 3.0 (Zero Day Initiative) | proof of concept | No |

**Sources:** the CVE Program's official records
(`github.com/CVEProject/cvelistV5`), which carry CISA's own exploitation
ratings. CISA's known-exploited catalogue, version 2026.09.23
(`github.com/cisagov/kev-data`). GitHub's reviewed advisory database.

**What could not be checked: EPSS.** FIRST, NVD and cisa.gov are all blocked
by this container's network. EPSS changes every day in any case. So this ticket
uses CISA's exploitation rating and the known-exploited list as its evidence
of exploitation, and **EPSS is taught in a later ticket**. Its values will be
looked up on first.org on the day it is built.

**Rule for the build:** real CVE facts are re-checked at build time against
the same sources, and the build records the date they were checked. Known-exploited
status and scores can change after publication.

Everything else is fictional: the client, the hosts, the addresses
(private `10.40.x.x`, none of which appear in the class sims, and
`203.0.113.0/24`, which is reserved for documentation), the `.example` domain
and the people. No exploit code or attack steps are shown, only each CVE's
public one-line description.

---

## For the owner to adjust

1. **One number in the class table disagrees with the official CVSS bands.**
   The class explanations say:
   *9.0 and above: 7 days (PROD, UAT). Between 7.9 and 9.0: 14 days (PROD
   only). Between 5.0 and 7.9: 30 days (PROD only).*
   The official CVSS bands are **High 7.0–8.9** and **Medium 4.0–6.9**. It
   matters on this very ticket: the 7-Zip finding is **7.8**. Under the class
   table it is due in 30 days. Under the official bands it is high, due in 14.
   Tab D uses the official bands. **Which do you want?**
2. **Tab D adds a rule the class table doesn't have:** known-exploited means 7
   days, whatever the score. Real SOC policies commonly have it, and it is what
   puts the booking site first. Keep it?
