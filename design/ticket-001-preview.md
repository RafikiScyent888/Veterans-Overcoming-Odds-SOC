# Ticket preview 001 — on paper, for the owner to adjust

**Nothing here is code.** This is one complete ticket written out, so the
owner can change what the students see before anything is built. Once it is
approved, every other ticket follows the same shape.

Tier 1 · First shift · The student's fourth ticket of the day.

---

## 1. What lands in the queue

| | |
|---|---|
| **Ticket** | VOO-1042 |
| **Opened** | 09:34, by the SIEM |
| **Rule** | *Impossible travel — two sign-ins more than 500 miles apart within 60 minutes* |
| **Severity** | Medium |
| **Client** | The Steadfast Outpost Thrift |
| **Account** | `otik@steadfastoutpost.example` — a volunteer |
| **Status** | New · assigned to you |

Around it in the queue, at the same moment: three more medium alerts, a
backlog counter, and a shift clock. **Most of what is in this queue today is
noise** — that is the point of the day.

---

## 2. The evidence tabs

The student opens these in whatever order they like. The guide (section 3)
suggests an order; nothing is locked.

### Tab A — The alert (SIEM rule output)

```
RULE      Impossible travel (>500 mi in <60 min)
USER      otik@steadfastoutpost.example
EVENT 1   09:02  203.0.113.44   Charlotte, NC   success
EVENT 2   09:31  198.51.100.17  Dallas, TX      success
DISTANCE  ~930 mi in 29 min
```

### Tab B — Sign-in log (identity provider), last 8 rows for this account

**The student runs this search themselves** (settled 26 September: "We are
taught to search from the beginning"). On this first ticket the guide shows
it:

```
source=signin user="otik@steadfastoutpost.example" earliest=-24h
| table time src_ip geo asn device_id type mfa result
```

Clicking any value in the results adds it to the search.

| Time | Source IP | Geo | Network (ASN) | Device ID | Type | MFA | Result |
|---|---|---|---|---|---|---|---|
| 08:55 | 203.0.113.44 | Charlotte, NC | RF Jack Cable | iPhone-7F2A | Interactive | — | **Failed — bad password** |
| 08:56 | 203.0.113.44 | Charlotte, NC | RF Jack Cable | iPhone-7F2A | Interactive | Push, approved | Success |
| 09:02 | 203.0.113.44 | Charlotte, NC | RF Jack Cable | iPhone-7F2A | Token refresh | — | Success |
| 09:31 | 198.51.100.17 | Dallas, TX | Mobile carrier gateway | iPhone-7F2A | Token refresh | — | Success |
| 09:47 | 198.51.100.17 | Dallas, TX | Mobile carrier gateway | iPhone-7F2A | Token refresh | — | Success |
| … | | | | | | | |

The discriminating detail is **buried in the table** on purpose: the same
device ID, a token refresh rather than a new sign-in, and a network that
belongs to a mobile carrier. Nothing is highlighted.

### Tab C — Client context

- Volunteers use their own phones. The store's Wi-Fi goes out through RF Jack
  Cable
- The store opened at 09:00; volunteers often step outside on break
- No other Steadfast Outpost account has alerted this week

### Tab D — The AI assistant's summary

> **Likely account compromise.** Two successful sign-ins 930 miles apart in 29
> minutes. Recommend disabling the account and resetting the password.

The assistant is confident and wrong. It read the alert and not the log.
**Checking the AI against the evidence** is part of every ticket in the build.

---

## 3. The guide, one step at a time

Advisory. It unfolds as the student works. In later tiers it gets shorter and
starts collapsed.

1. **Read the evidence before the alert title.** What did the rule actually
   measure?
2. **What is the same between the two sign-ins, and what is different?**
3. **Where does an IP address's location come from — and how far can you trust
   it?**
4. **If this were a compromise, what would you expect to see in the log? Is it
   there?**
5. **Check the assistant's summary against what you found.**
6. **Choose the most defensible disposition** — what the evidence proves, not
   the worst case.
7. **Should the rule change? How narrowly?**
8. **Write it up.**

---

## 4. The decisions

Two boards. Six options each, one correct, **shuffled by seed**, and every
option written to about the same length so the longest is not the answer.

### Decision 1 — the disposition

*What is the most defensible disposition for VOO-1042?*

| | Option | Why it is wrong |
|---|---|---|
| ✅ | **Benign true positive — the same device and session moved to a mobile carrier. Close with the evidence** | — |
| ✗ | True positive, account compromise — disable the account and reset the password before it spreads any further | Over-classification. The assistant's answer. Nothing in the log looks like somebody else's device |
| ✗ | Escalate to Tier 2 as a possible compromise, with the alert, the sign-in log and Fizban's summary attached | The evidence already answers the question. Escalating it adds work without adding certainty |
| ✗ | False positive — the rule measured the wrong thing, so turn it off until it is rewritten | The rule measured exactly what it says. Turning it off blinds you to the real one |
| ✗ | Benign — close the ticket with no notes, since the volunteer was just on their phone | Right conclusion, no evidence. Nobody can check your reasoning later |
| ✗ | Add this volunteer to a permanent exception so the rule never alerts on them again, anywhere | Hides a real takeover of this account for ever |

**The exam lesson inside it:** a *false positive* means the rule was wrong. A
*benign true positive* means the rule was right and the event was harmless.
They are different, and CySA tests the difference.

### Decision 2 — tuning the rule

*What change stops this alert without hiding a real takeover?*

| | Option | Why it is wrong |
|---|---|---|
| ✅ | **Suppress only when device ID, session and authenticator all match — still alert on any new device** | — |
| ✗ | Raise the distance to 2,000 miles so short trips like this one stop alerting across every client we watch | A real attacker in the next state over now slips through |
| ✗ | Suppress impossible travel for every Steadfast Outpost account, since the volunteers there all use their own phones | One client becomes a blind spot |
| ✗ | Exclude every mobile-carrier network from the rule, since that is where these alarms keep coming from | Attackers use phones and carrier networks too |
| ✗ | Lower the rule to informational so it is still recorded but never pages anybody | It still fires; nobody reads it |
| ✗ | Leave the rule alone and close these by hand as they come in, with a note on each | Every analyst loses minutes to the same false alarm every shift |

This is where the owner's point lands: **the students set the thresholds and
sensors.** Too loose and the queue drowns them; too tight and the real attack
walks past. Every tuning choice they make is carried into later tickets.

### The hint ladder — as in Security

Nothing at guesses one and two. Then, for Decision 1:

- **Rung 1 (guess 3) — where to look:** "Look at the device ID column, and at
  the Type column, for the two sign-ins in the alert."
- **Rung 2 (guess 4) — the principle:** "An alert can fire correctly on an
  event that is harmless. Ask whether the rule was wrong, or whether the event
  was."
- **Rung 3 (guess 5 onward) — narrowed, with reasons:** strikes options until
  two are left, each with its reason. It never names the answer.

A wrong pick stays red, marked three ways, until solved or reset.

---

## 5. The write-up

The student writes it themselves. The prompts:

- What did the alert say?
- What did the evidence show — and where?
- What did you conclude, and why is that the most defensible reading?
- What did you change, if anything?
- **What can you not prove?** (For example: you cannot prove the phone was not
  stolen — but the same authenticator approved the sign-in, on the same device.)

Written up well, it reads like this:

> Impossible-travel alert on a Steadfast Outpost volunteer. Both sign-ins came
> from the same device (iPhone-7F2A) with one approved MFA push at 08:56. The
> 09:31 event is a token refresh from a mobile carrier gateway geolocated to
> Dallas, not a new sign-in. Benign true positive. Proposed tuning: suppress
> when device, session and authenticator all match. Not proven: that the device
> itself was in the volunteer's hands.

---

## 6. What this one ticket teaches

Labelled by the wording of the owner's objective list — no sub-objective
numbers are claimed.

| Domain | Objective |
|---|---|
| Security Operations | Analyze indicators of potential malicious activity — identity systems |
| Security Operations | Use tools to determine malicious activity — SIEM |
| Security Operations | Summarize concepts related to the use of AI in security operations — risks |
| Security Operations | Describe efficiency and process improvement — tuning |
| Incident Response and Management | Implement incident response techniques — triage |
| Reporting and Communication | Describe incident documentation |

---

## 7. Kept safe — "as close to a real SOC without getting into trouble"

- Every IP address is from the documentation ranges set aside for this
  (`192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`) — none of them belongs
  to anybody
- Every domain ends in `.example`, which can never be registered
- The network names are the owner's fictional companies
- No working exploit code, no real malware, no real people

---

## APPROVED 24 September

> "I love the ticket. That is great. The AI assistant is clear and quick to
> the point. That is good. Yes, two or more decisions to plug the leaks. Yes,
> the write up is great."

This is the shape every ticket follows. The questions that were here are
answered:

- **Amount of evidence** — right for Tier 1
- **Fizban** — clear and quick to the point; keep the voice
- **Decisions** — two or more per ticket, each one closing a way to guess
  through it
- **Write-up** — the student writes it, against the five prompts
