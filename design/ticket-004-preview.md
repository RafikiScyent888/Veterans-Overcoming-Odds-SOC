# Ticket preview 004 — a reported phishing email, on paper, for the owner to adjust

**Nothing here is code.** Scenario type 2, as settled with the owner on
26 September: **Thomas P. Payne School**, **nobody enters their password**
(that comes at a later tier), and the **objective-by-objective summary** at
the end, which the owner asked for in place of an exam-wording panel.

Tier 1 · First shift · **Two decisions** (crawl).

Numbered 004 because it is the fourth ticket drafted. In the build it sits in
Tier 1, alongside ticket 001.

---

## 1. What lands in the queue

| | |
|---|---|
| **Case** | VOO-1063 |
| **Status** | New · assigned to you |
| **Priority** | Medium |
| **Created** | 08:22, from the Report Phish button |
| **Title** | *Reported email — "Your password expires today"* |
| **User** | `alhana@payneschool.example` (Year 5 teacher) |
| **Source** | User report |
| **Related alert** | None. The mail filter let it through |

Around it in the queue: **VOO-1064**, another Payne School report ten minutes
later, subject *"Password change required by Friday."* That one is from the
school's own IT and it is genuine. The student may take either first.

---

## 2. The screens

### Screen 1 — The reported email (linked)

| | |
|---|---|
| **From** (what the teacher sees) | Payne School IT `<it-support@payneschool.example>` |
| **Reply-To** | `helpdesk@payneschool-support.example` |
| **Return-Path** | `bounce-4471@msgrelay-7.example` |
| **Subject** | Your password expires today |
| **Received** | 07:58, from `198.51.100.144` |
| **Link** | `https://payneschool-login.example/reset` |
| **Attachments** | None |

The raw headers are one click away. The line that matters is not
highlighted:

```
Authentication-Results: mx.payneschool.example;
  spf=pass smtp.mailfrom=msgrelay-7.example;
  dkim=pass header.d=msgrelay-7.example;
  dmarc=fail action=none header.from=payneschool.example
```

**Everything the lesson needs is in that one header:** SPF and DKIM passed,
but for *msgrelay-7.example*, not for the school. DMARC checks whether they
**match the From the reader sees**. They don't, so DMARC failed. The school's
DMARC policy is `action=none`, which means monitoring only, so the email was
delivered anyway.

### Screen 2 — Message trace (linked)

| Recipient | Status | Folder |
|---|---|---|
| alhana@payneschool.example | Delivered | Inbox → **Reported** |
| gilthanas@payneschool.example | Delivered | Inbox |
| eben@payneschool.example | Delivered | Inbox |
| hederick@payneschool.example | Delivered | Inbox |
| maquesta@payneschool.example | Delivered | Inbox |

Five recipients. None quarantined.

### Screen 3 — The web proxy (the student searches it)

The guide shows the search the first time:

```
source=proxy url="*payneschool-login.example*" earliest=-24h
| table time user src_ip method url status
```

| time | user | src_ip | method | url | status |
|---|---|---|---|---|---|
| 08:14:09 | gilthanas | 10.30.2.41 | GET | https://payneschool-login.example/reset | 200 |

**One GET and no POST.** Gilthanas opened the page and never submitted the
form. That is the class material's rule: **GET means clicked, POST means
submitted.**

### Screen 4 — URL reputation (open it yourself)

| | |
|---|---|
| payneschool-login.example | **Registered 2 days ago.** No verdicts yet. Hosting provider |

A new domain has no reputation. "No verdicts" is not "safe", which is
ticket 003's lesson arriving early.

### Fizban's summary

> **Credential phishing.** DMARC failed and the link goes to a domain
> registered two days ago. **Recommend resetting the passwords of all five
> recipients.**

Right about what it is, wrong about what to do.

---

## 3. The guide — full, one step at a time (Tier 1)

1. **Read the headers before the message.** Who does it say it is from, and
   who actually sent it?
2. **Find the Authentication-Results line.** What passed, and *for which
   domain*?
3. **Who else got it?** (Message trace)
4. **Did anyone click? Did anyone submit?** Run the proxy search the guide
   shows you
5. **Check Fizban against what you found.**
6. **Decide what it is, then what to do. Write it up.**

---

## 4. The decisions

Two boards. Six options each, one correct, **shuffled by seed**, written to
about the same length.

### Decision 1: what is it?

*What is the most defensible classification of the email Alhana reported?*

| | Option | Why it is wrong |
|---|---|---|
| ✅ | **Credential phishing — SPF and DKIM passed for the relay, not for the school, so DMARC failed** | — |
| ✗ | A genuine IT notice — SPF and DKIM both passed, so it came from an authorised school server | They passed for msgrelay-7.example. Passing is not the same as matching the From |
| ✗ | Whaling — a targeted attack on the school's leadership that impersonates the IT department | Whaling targets executives. This went to five teachers |
| ✗ | Business email compromise — a real school mailbox has been taken over and is sending this out | Nothing came from a school mailbox. The Return-Path and relay are outside |
| ✗ | Spam — unwanted bulk mail, so close it and let the mail filter learn from the report | It impersonates the school and harvests passwords. That is phishing, not spam |
| ✗ | A false positive — the teacher reported a real email by mistake, so close it with a thank-you | Compare VOO-1064, the genuine notice: its DMARC passes and its link is the school's own |

**The exam lesson:** SPF says *this server may send for that domain*. DKIM
says *this domain signed it*. DMARC says *and that domain is the one in the
From line*. **Passing SPF and DKIM for somebody else's domain proves
nothing about the school.**

### Decision 2: what do you do now?

*One person clicked and nobody submitted. What is the right response?*

| | Option | Why it is wrong |
|---|---|---|
| ✅ | **Purge it from all five inboxes, block the link and sender domain, and note the one click** | — |
| ✗ | Reset the passwords of all five recipients, since any of them might have been caught by it | Nobody submitted. Five resets for no reason, and it teaches users that reports cause pain. Fizban's answer |
| ✗ | Reset Gilthanas's password only, because he is the one person who opened the phishing page | He clicked (GET) but never submitted (POST). There is no password to change |
| ✗ | Purge Alhana's copy only, because she is the one who reported it and asked us to act | Four more copies are still sitting in inboxes, waiting to be clicked |
| ✗ | Block the link at the proxy and leave the emails in place, since nobody can reach it now | Users on other networks, and on phones, don't go through the proxy |
| ✗ | Set the school's DMARC policy to reject today so that this can't happen again | Right long term, but a mail change is not yours to make at Tier 1, and it does nothing about the five copies already delivered. It goes in the write-up as a recommendation |

**The exam lesson:** size the response to the evidence. **Clicked is not
compromised.** Submitted is. The proxy's GET and POST are how you tell.

### The hint ladder, as in Security

Nothing at guesses one and two. Then:

| | Rung 1 (guess 3): where to look | Rung 2 (guess 4): the principle |
|---|---|---|
| **D1** | "Read the Authentication-Results line, and look at which domain each check was for." | "A check only vouches for the domain it checked." |
| **D2** | "Read the proxy search again. Which methods appear, and which don't?" | "Only a password that was typed in needs changing." |

Rung 3, from guess 5 onward, strikes options until two are left, each with
its reason, and never names the answer. A wrong pick stays red, marked three
ways, until solved or reset.

---

## 5. The write-up — on the case page, as in a real SOC

> **Analyst notes.** User-reported email to Alhana, "Your password expires
> today", impersonating Payne School IT.
>
> **Investigation.** Headers: From payneschool.example, Return-Path
> msgrelay-7.example, Reply-To payneschool-support.example. SPF and DKIM pass
> for msgrelay-7.example; DMARC fails for payneschool.example, but the policy
> is `none`, so it was delivered. Link to payneschool-login.example,
> registered two days ago. Trace: 5 recipients, all delivered. Proxy: one GET
> by Gilthanas at 08:14, no POST.
> *Evidence reviewed:* headers, message trace, proxy log, URL reputation.
> *Actions taken:* purged from 5 mailboxes; link and sender domain blocked.
>
> **Resolution.** Credential phishing, contained. No credentials submitted,
> so no resets. Recommend moving the school's DMARC policy from `none` towards
> `reject`. **Could not be confirmed:** that nobody opened the link from a
> device outside the proxy, such as a phone on mobile data.

The console records the activity log on its own: the proxy search, the purge,
the blocks.

---

## 6. What this ticket taught — objective by objective

**This is the owner's format (26 September).** It appears once the ticket is
closed. For every objective the ticket used, it gives what the student did,
why that is the objective, and the words the exam uses. Numbers are from the
owner's list, still **unverified** against CompTIA's PDF.

| Objective | What you did | Why it is this objective | The words the exam uses |
|---|---|---|---|
| **1.2** Analyze indicators of potential malicious activity | Read the headers and found the From, Return-Path and Reply-To disagreeing | Mismatched sender fields are an indicator: evidence that points to malicious intent before anything has happened | Header analysis · Return-Path · Reply-To · spoofing · impersonation |
| **1.3** Use tools to determine malicious activity | Ran the proxy search; read the message trace and the URL reputation | Each is a tool that answers one question: who got it, who clicked, what the link is | Message trace · proxy logs · URL reputation · threat intelligence platform |
| **1.1** Architecture concepts: identity and logging | Read SPF, DKIM and DMARC results and the policy behind them | Email authentication is part of how an organisation proves identity; the policy decides what happens on failure | SPF · DKIM · DMARC · alignment · policy none / quarantine / reject |
| **3.3** Incident triage | Decided what it was, and how far it went: 5 delivered, 1 clicked, 0 submitted | Triage is deciding severity and scope before acting | Scope · severity · clicked vs submitted |
| **2.4** Apply mitigation strategies and security controls | Purged, blocked, and recommended DMARC `reject` | Removing the threat now, and recommending the control that stops the next one | Containment · compensating control · email security gateway |
| **1.6** AI in security operations | Kept Fizban's classification, rejected its response | An AI can be right about *what* and wrong about *what to do*. The analyst owns the decision | AI hallucination · human in the loop · over-reliance |
| **4.2** Incident reporting | Wrote the case up so the next analyst doesn't repeat it | Documentation is how a SOC remembers | Incident documentation · lessons learned |

---

## 7. Kept safe

- Every domain ends in `.example`. `198.51.100.144` is from a documentation
  range. The internal address is private
- The staff names are Dragonlance Chronicles names, as the owner settled
- No real phishing kit, no working link, no real brand impersonated

---

## For the owner to adjust

1. **The objective summary (section 6).** Is this the format you meant? It
   has four columns: the objective, what you did, why it's this objective,
   and the exam's words.
2. **Seven objectives on one Tier 1 ticket.** Is that too many for the crawl
   stage? It could show only the three or four the ticket leaned on hardest.
