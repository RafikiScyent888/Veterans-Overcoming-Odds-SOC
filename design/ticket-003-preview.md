# Ticket preview 003 — endpoint and wire, on paper, for the owner to adjust

**Nothing here is code.** Ticket 001's approved shape, at Tier 3.

Tier 3 · Endpoint and wire · **Four decisions** (crawl, walk, run: 2, then 3,
now 4).

**What is new at this tier, the walk:**

- **The evidence is no longer handed over.** The ticket links two screens.
  The other four are in the console, and the student has to go and open them.
  The guide says *what* to find, not *where*
- **Real tool formats.** The network screen shows Zeek connection and TLS logs
  with Zeek's real field names, and the endpoint screen is an EDR process tree
- **ATT&CK arrives,** checked against MITRE's own data (Enterprise ATT&CK
  v19.2, 5 August 2026)
- **Fizban is right this time.** Across tickets 001–003 it has been wrong,
  then half right, then right. The student checks it every time anyway

---

## 1. What lands in the queue

| | |
|---|---|
| **Ticket** | VOO-3016 |
| **Opened** | Wednesday 08:05, by the SIEM |
| **Rule** | *Periodic outbound beacon — same destination, regular interval, small, steady payloads* |
| **Severity** | Medium |
| **Client** | Vanguard Auto Detailing |
| **Hosts** | 3 — `VAD-FRONT-01`, `VAD-OFFICE-01`, `VAD-OFFICE-02` |
| **Linked** | VOO-1187, three weeks ago, one host, **closed by Caramon: "vendor traffic, benign"** — no evidence, no notes |
| **Status** | New · assigned to you |

Laurana, the Tier 2 lead, has written on it: *"Same thing Caramon closed. Why
is it back on three machines?"*

---

## 2. The screens

**Linked from the ticket:** the alert and the network sensor. **Not linked,
but there to be opened:** EDR, threat intel, the asset inventory, and the
ticket history. Nothing is locked.

### Screen 1 — The alert (linked)

```
RULE       Periodic outbound beacon
CLIENT     Vanguard Auto Detailing
HOSTS      10.20.1.15  VAD-FRONT-01
           10.20.2.21  VAD-OFFICE-01
           10.20.2.22  VAD-OFFICE-02
DEST       198.51.100.73 : 443
INTERVAL   3600 s  (jitter ± 4 s)   over 72 h
PAYLOAD    1.1 – 1.3 KB out · 3.2 – 3.5 KB in, every check-in
```

### Screen 2 — Network sensor: Zeek logs (linked)

`conn.log`, `VAD-FRONT-01`, six rows of seventy-two:

| ts<br>*time* | id.orig_h<br>*source host* | id.resp_h<br>*destination host* | id.resp_p<br>*destination port* | service<br>*protocol seen* | duration<br>*seconds open* | orig_bytes<br>*bytes sent* | resp_bytes<br>*bytes received* | conn_state<br>*how it ended* |
|---|---|---|---|---|---|---|---|---|
| 01:00:03 | 10.20.1.15 | 198.51.100.73 | 443 | ssl | 0.41 | 1204 | 3380 | SF |
| 02:00:01 | 10.20.1.15 | 198.51.100.73 | 443 | ssl | 0.39 | 1198 | 3392 | SF |
| 03:00:04 | 10.20.1.15 | 198.51.100.73 | 443 | ssl | 0.44 | 1211 | 3377 | SF |
| 04:00:02 | 10.20.1.15 | 198.51.100.73 | 443 | ssl | 0.40 | 1204 | 3401 | SF |
| 05:00:00 | 10.20.1.15 | 198.51.100.73 | 443 | ssl | 0.42 | 1207 | 3386 | SF |
| 06:00:03 | 10.20.1.15 | 198.51.100.73 | 443 | ssl | 0.41 | 1202 | 3390 | SF |

`ssl.log`, same connections:

| server_name<br>*site asked for (SNI)* | subject<br>*certificate issued to* | issuer<br>*issued by* | validation_status<br>*certificate check* |
|---|---|---|---|
| relay.saxet-keeper.example | CN=relay.saxet-keeper.example | CN=Example Trust CA | ok |

`SF` means the connection opened and closed normally.

Sensor notes: *Coverage extended to Vanguard's office VLAN on the 9th.*

The last line is the buried detail. It answers Laurana's question: the two
office PCs were not new, they were **invisible** until the 9th.

### Screen 3 — EDR: process tree (open it yourself)

```
VAD-FRONT-01
services.exe
 └─ KeeperRemoteSvc.exe          C:\Program Files\Saxet\KeeperRemote\
      signer     Saxet IT Keepers LLC   (valid)
      user       SYSTEM
      installed  2021-06-14
      children   none in 30 days
      listening  none
```

The **Files** tab on the same host holds the agent's own log:

```
KeeperRemote.log
2026-02-27 16:12  session opened   tech: d.saxet   (interactive)
2026-02-27 16:40  session closed
2026-03-01 …      heartbeat only, every 60 min, since
```

The last interactive session was **27 February**. Nothing has been done
through the agent since then except checking in.

### Screen 4 — Threat intel lookup (open it yourself)

| Indicator | Result |
|---|---|
| relay.saxet-keeper.example | First seen 2019. No malicious verdicts. Category: IT service provider |
| 198.51.100.73 | Hosting provider. No malicious verdicts |
| KeeperRemoteSvc.exe (hash) | Matches the vendor's published release 7.4.2. Signed |

### Screen 5 — Asset inventory and client context (open it yourself)

| | |
|---|---|
| **Approved remote access** | RafikisITS's own support tool. **Nothing else** |
| **Previous IT provider** | Saxet IT Keepers, **contract ended 28 February 2026** |
| **Offboarding checklist** | "Remove previous provider's tools": marked **N/A** by Vanguard's office manager |
| **VAD-FRONT-01** | Front desk. **Runs the card terminal**, so it is in PCI DSS scope |
| **VAD-OFFICE-01, -02** | Office PCs: bookings, payroll |

### Screen 6 — Ticket history (open it yourself)

> **VOO-1187**, three weeks ago. Beacon on VAD-FRONT-01 to
> relay.saxet-keeper.example. Closed by Caramon: *"vendor traffic, benign."*

No evidence was attached and nobody was told.

### Fizban's summary

> This is Saxet IT Keepers' remote-support agent. It's signed and matches their
> published release. **It isn't malware.** But Saxet's contract ended in
> February, so this is standing third-party access that nobody manages,
> including on a PCI-scope machine. **Recommend a risk finding to the client.**

It's right. The student still has to prove it from the screens.

---

## 3. The guide, shorter

It gives five steps, and says what to find, not where.

1. **What exactly is talking, and to whom?**
2. **Is it doing anything besides checking in?**
3. **Should it be there at all?** Who approved it, and when did that end?
4. **Why three hosts now, when it was one before?**
5. **Decide what it is, what it would be in an attacker's hands, who has to
   act, and how the rule should change. Then write it up.**

---

## 4. The decisions

Four boards. Six options each, one correct, **shuffled by seed**, all written
to about the same length. They chain, and a reset goes back to the last one
answered correctly.

### Decision 1: what is this?

*What is the most defensible reading of the beacon on Vanguard's three hosts?*

| | Option | Why it is wrong |
|---|---|---|
| ✅ | **A real vendor's agent, contract ended — unmanaged standing access. Raise a risk finding** | — |
| ✗ | Command-and-control by malware — isolate all three hosts right away and open a full incident | Over-classification. Signed, matches the vendor's release, no sessions or child processes since February |
| ✗ | Benign true positive — known vendor software, so close it just the way VOO-1187 was closed | Saxet is no longer Vanguard's vendor. That is the mistake VOO-1187 made |
| ✗ | False positive — the beacon rule misfired on ordinary HTTPS traffic, so tune it and close it | The rule was right. It is a beacon: hourly, steady sizes, one destination |
| ✗ | Insider threat — someone at Vanguard installed it to reach the office from home | Installed in June 2021, during Saxet's contract, and signed by Saxet |
| ✗ | Supply-chain attack — Saxet's relay was hijacked and sends commands in | Nothing shows commands: no sessions since 27 February, no children, nothing listening |

**The exam lesson:** a beacon is a pattern, not a verdict. Hourly, steady
sizes, one destination is what command and control looks like, and also what
every legitimate agent looks like. **What decides it is whether it should be
there.**

### Decision 2: the ATT&CK mapping

*If somebody took over Saxet's relay, which ATT&CK technique would they be
using against Vanguard?*

| | Option | Why it is wrong |
|---|---|---|
| ✅ | **T1219.002 Remote Desktop Software — legitimate support software used as a control channel** | — |
| ✗ | T1219.003 Remote Access Hardware — a physical remote access device placed on the client's network | The access is a service installed on the PC. No device was plugged in |
| ✗ | T1133 External Remote Services — the client's internet-facing VPN or remote gateway | Nothing at Vanguard is listening. The agent calls out; nobody calls in |
| ✗ | T1071.001 Web Protocols — command traffic blended into ordinary web traffic on port 443 | That describes how the traffic travels, not the tool that gives the access |
| ✗ | T1573 Encrypted Channel — the check-ins are encrypted, which hides what is being sent | Encryption is the transport here. The risk is the agent itself |
| ✗ | T1078 Valid Accounts — logging in with a stolen Vanguard username and password | The agent needs no Vanguard account. It runs as SYSTEM and trusts its relay |

**The exam lesson:** ATT&CK names the **behaviour**, and several techniques
can describe the same traffic. Pick the one that names what gives the
attacker their power. Here that is a legitimate remote-access tool, not the
port it uses.

### Decision 3: what does the analyst do now?

*You are Tier 1 at Tier 3: the analyst, not the client's IT department. What
do you do with this?*

| | Option | Why it is wrong |
|---|---|---|
| ✅ | **Escalate to Laurana with the evidence: Vanguard removes it by change, then the relay is blocked** | — |
| ✗ | Uninstall the agent from all three hosts yourself through the EDR console, before anything else | Not your system to change. The front desk is in PCI scope, so changes go through the client |
| ✗ | Block the relay domain at Vanguard's firewall today, and close the ticket once the traffic stops | The agent stays installed, can find another relay, and the client never hears about it |
| ✗ | Isolate the three hosts in EDR until Saxet IT Keepers explains the traffic to us | Takes the card terminal offline for a risk, not an incident |
| ✗ | Email Saxet IT Keepers directly and ask them to switch the agent off from their end of the relay | Saxet isn't our client. Vanguard owns that relationship, and it is Saxet's access you're worried about |
| ✗ | Reopen VOO-1187, note that it was closed wrongly, then close both tickets as a duplicate | Paperwork instead of action. The access is still there |

**The seat, again:** an analyst escalates with evidence so that somebody with
the authority can decide. At Tier 3 the student is still not the client's
administrator.

### Decision 4: tuning the beacon rule

*What change to the beacon rule stops this recurring without hiding the next
one?*

| | Option | Why it is wrong |
|---|---|---|
| ✅ | **Check each beacon against the client's approved remote-access list; alert on anything not on it** | — |
| ✗ | Suppress beacons to any relay with a valid code-signing certificate, since signed tools are trusted | A signature proves who made it, not that it should be there. This agent is signed |
| ✗ | Suppress this relay for Vanguard now that we know what it is and who made the software | Explained is not approved. It would also hide the relay if it were taken over |
| ✗ | Widen the rule's interval tolerance so that hourly check-ins no longer count as beaconing at all | Plenty of real command and control checks in hourly. This blinds you to all of it |
| ✗ | Suppress beacons from hosts where the EDR agent reports healthy, since those are protected | EDR health says nothing about what the traffic is. All three hosts are healthy |
| ✗ | Alert only on beacons to addresses with a bad threat-intel reputation, and drop the rest | New attacker infrastructure has no reputation yet. Neither did this relay |

The student sets the sensor. **What they choose carries forward.** A student
who suppresses signed relays will not see the signed malicious update in the
Zumroh thread in Tier 4.

### The hint ladder, as in Security

Nothing at guesses one and two. Then:

| | Rung 1 (guess 3): where to look | Rung 2 (guess 4): the principle |
|---|---|---|
| **D1** | "Open the asset inventory, and the agent's own log." | "The question is not whether the software is real. It's whether it's supposed to be there." |
| **D2** | "Read what each technique says gives the attacker their access." | "ATT&CK names the behaviour that gives the power, not the road the traffic takes." |
| **D3** | "Whose machines are these, and which one runs the card terminal?" | "An analyst hands evidence to the person with authority to change the system." |
| **D4** | "Check which facts about this agent would also be true of a malicious one." | "A good suppression is narrow enough that a real attack could not match it." |

Rung 3, from guess 5 onward, strikes options until two are left, each with
its reason, and never names the answer. A wrong pick stays red, marked three
ways, until solved or reset.

---

## 5. The write-up

Ticket 001's five prompts, plus one for this tier:

- **Who has to decide, and what did you hand them?**

Written up well:

> Beacon from three Vanguard hosts to relay.saxet-keeper.example, hourly,
> steady 1.2 KB out / 3.4 KB in. The source is KeeperRemoteSvc.exe, signed by
> Saxet IT Keepers and matching their published release 7.4.2. It was
> installed in June 2021 during Saxet's contract, which ended on 28 February.
> The last interactive session was 27 February. Since then it has only sent
> heartbeats, with no child processes and nothing listening. **Risk finding,
> not an incident:** unmanaged third-party access, including on VAD-FRONT-01,
> which is in PCI DSS scope. The two office PCs only appeared because sensor
> coverage reached their VLAN on the 9th. ATT&CK: T1219.002. Escalated to
> Laurana, recommending Vanguard remove the agent under a change, then block
> the relay. Rule change proposed: check beacons against each client's
> approved remote-access list. VOO-1187 annotated.
> **Not proven:** that nobody reached Saxet's relay account between February
> and now. We see the agent's side, not the relay's.

---

## 6. What this one ticket teaches

The owner's objective list, with its numbers as supplied. The numbering is
**unverified** until checked against CompTIA's official document (see
`CLAUDE.md`, section 3).

| Owner's list | Objective, as supplied |
|---|---|
| 1.2 | Analyze indicators of potential malicious activity: network and endpoint |
| 1.3 | Use tools to determine malicious activity: EDR, Zeek, threat intelligence platforms |
| 1.4 | Threat intelligence concepts: reputation, first seen, and what they can't tell you |
| 1.6 | AI in security operations: checking a correct AI answer is still the job |
| 2.5 | Compliance: PCI DSS scope changes how a change is made |
| 3.1 | Attack methodology frameworks: MITRE ATT&CK |
| 3.3 | Incident triage: assessing severity, risk finding vs incident |
| 3.4 | Escalation procedures |

---

## 7. Kept safe

- **ATT&CK IDs and names are real,** checked against MITRE's
  `attack-stix-data`, Enterprise v19.2
- The product *Keeper Remote* is fictional, like its maker. So are the client,
  the hosts and the people
- `198.51.100.73` is from a range reserved for documentation. The internal
  addresses are private. Every domain ends in `.example`
- No commands, no tooling, nothing an attacker could lift

---

## For the owner to adjust

1. **Is "go and open the screens yourself" the right step up** for the walk,
   or too big a jump from ticket 002, where every tab was attached?
2. **The Tier 1 ticket that was closed wrongly** (Caramon's VOO-1187). Real
   SOCs have these all the time. Is it all right that a colleague made the
   mistake, or would you rather the earlier ticket was the student's own?
3. ~~Zeek field names~~ — **settled 26 September:** raw Zeek names, with a
   plain-English heading under each
