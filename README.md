# Veterans Overcoming the Odds — a CySA+ SOC

A security operations centre to work in, for students preparing for
**CompTIA CySA+ (CS0-004)**. Part of the Cyber Warrior Program.

The student is a new analyst at **Veterans Overcoming the Odds**, the SOC
that RafikisITS runs for its clients. In the Security build they owned the
business; here they have switched seats. They can't see the contracts. They
can read the logs, the packets and the alerts, and their job is to prove what
happened so the right person can decide.

## What a shift looks like

- **The queue.** Alerts arrive from eight client businesses. Most are
  noise, and closing noise well, with evidence, is half the job
- **The case page.** Evidence tabs, a **typed search bar** (students search
  from their first ticket, as analysts are taught), an advisory guide that
  never locks anything, and Fizban, an AI assistant that is sometimes right
  and sometimes confidently wrong
- **Decisions.** Six options, one right. A wrong pick goes red and stays red,
  marked by colour, an inset rule and the words "Ruled out". Unlimited tries
  and hints: nothing for the first two wrong picks, then where to look, then
  the principle, then the field narrowed to two, for ever. No hint ever says
  the answer
- **The write-up.** On the case page, as in a real SOC: analyst notes,
  investigation, resolution, and what could not be confirmed. The console
  keeps an activity log by itself
- **What this ticket taught.** After each close, every exam objective the
  ticket used: what the student did, why it counts, and the words the exam
  uses
- **Going back.** Closed cases stay in the case history. Review opens them
  read-only; replay runs them again for practice without touching the first
  attempt

## Status

| Tier | | Status |
|---|---|---|
| 1 | First shift: triage | **Built**: 7 tickets, 2 decisions each |
| 2 | The scan: vulnerability management | Being built |
| 3 | Endpoint and wire | Being built |
| 4 | The incident | Being built |
| 5 | Maturity: automation, AI, reporting | Being built |

Then a practice queue: ten more tickets for each scenario type.

## Accessibility

Built for students with eye damage from military service.

- **WCAG AAA contrast** (7:1 body text, 4.5:1 large), measured on painted
  pixels in every theme and state
- **Easier reading** (spacing, letterforms, a shorter line) and **light and
  dark themes**, both remembered across every Cyber Warrior site
- Severity is always a **word as well as a colour**
- Works at phone width

## For instructors

An **instructor mode**, behind a PIN, unlocks every tier and ticket, and
toggles off again. Ask the course instructor for the PIN. Like any PIN on a
static site, it keeps honest people honest: it isn't a lock.

## Files

**What the site needs to run:**

| File | What it is |
|---|---|
| `index.html` | The page |
| `assets/theme.js` | Theme, easier reading and instructor mode, set before the page is drawn |
| `assets/style.css` | Every style |
| `assets/app.js` | The console's screens |
| `assets/search.js` | The search language |
| `assets/decisions.js` | The decision boards and the hint ladder |
| `assets/save.js` | Progress, saved in the browser |
| `assets/content/tier1.js` | Tier 1's tickets |
| `assets/content/events-t1.js` | Tier 1's log data |

**Checks and design, not needed to run the site:** `verify/`, `design/`,
`CLAUDE.md`.

## Checks

Each check is shown to **fail** on a planted defect before its pass is
trusted.

```
node verify/search.mjs      # the search language            (--plant: 6 planted bugs)
node verify/engine.mjs      # six options and the hint ladder (--plant: 8)
node verify/content.mjs     # every ticket against every rule (--plant: 13)
node verify/page.mjs        # the console, driven in Chromium (--plant: 6)
node verify/contrast.mjs    # AAA on painted pixels, 16 states (--plant: 4)
```

`page.mjs` and `contrast.mjs` need Playwright and Chromium.

## Safe by design

Every IP address comes from a range reserved for documentation or from a
private range, and every domain ends in `.example`. Real CVE numbers and
MITRE ATT&CK IDs are checked against their primary sources. No working
exploit code, no real malware, no real people.

---

Cyber Warrior Program — built by an instructor, for students, to make
certification study more interactive. For educational purposes only. Not
affiliated with, endorsed by, or sponsored by CompTIA®. All trademarks
belong to their respective owners.
