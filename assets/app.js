/* =====================================================================
   VOO CONSOLE — the analyst's screens, all five tiers

   Queue → case page (evidence, search, guide, decisions, case notes,
   objective summary) · Search · Case history · Metrics · the practice
   queue · the seat-change introduction · instructor mode behind the PIN.

   Crawl, walk, run (CLAUDE.md 13d), driven by each tier's settings:
     Tier 1–2  evidence attached; the guide unfolds step by step
     Tier 3    two screens linked, the rest opened by the student; the
               guide says what to find, not where
     Tier 4–5  nothing attached; the guide collapsed; Fizban on request

   Nothing ever locks a tab inside a ticket. Tiers open in order; the
   instructor PIN opens everything.
   ===================================================================== */
import { runSearch } from "./search.js";
import { createBoard, pick, reset, rung, live, serialise, correctId } from "./decisions.js";
import * as store from "./save.js";
import * as t1 from "./content/tier1.js";  import * as e1 from "./content/events-t1.js";
import * as t2 from "./content/tier2.js";  import * as e2 from "./content/events-t2.js";
import * as t3 from "./content/tier3.js";  import * as e3 from "./content/events-t3.js";
import * as t4 from "./content/tier4.js";  import * as e4 from "./content/events-t4.js";
import * as t5 from "./content/tier5.js";  import * as e5 from "./content/events-t5.js";
import { PRACTICE_TYPES, practiceTickets } from "./content/practice.js";

const PIN = "3693";   /* a door, not a lock: it is in the page source, as on every CWP site */
const TIERS = [[t1, e1], [t2, e2], [t3, e3], [t4, e4], [t5, e5]].map(([t, e]) => ({ ...t.TIER, tickets: t.TICKETS, events: e.EVENTS, now: e.NOW }));
TIERS.forEach(T => T.tickets.forEach(tk => { tk.tier = T.n; }));
const ALL = TIERS.flatMap(T => T.tickets);
const SEV = { critical: "Critical", high: "High", medium: "Medium", low: "Low", info: "Info" };
const RANK = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };

const state = store.load();
const ui = { tier: 1, tab: "open", sev: null, selected: null, queueQuery: "", status: "", searchQuery: "", caseTab: 0, caseQuery: "", opened: {}, askFizban: {}, guideOpen: {} };

const $ = sel => document.querySelector(sel);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const sevHtml = s => `<span class="sev s-${s}"><span class="dot" aria-hidden="true"></span>${SEV[s]}</span>`;
const persist = () => store.save(state);
const tierOf = n => TIERS[n - 1];
const clockOf = T => T.now.slice(11, 16);

/* ---- practice tickets are generated once, from their seeds ------------ */
const PRACTICE = practiceTickets();
PRACTICE.forEach(tk => { tk.practice = true; });
const byId = id => ALL.find(t => t.id === id) || PRACTICE.find(t => t.id === id);
function tierFor(tk) { return tk.practice ? tierOf(tk.tier) : tierOf(tk.tier); }
function eventsFor(tk) { return tk.events || tierFor(tk).events; }
function nowFor(tk) { return Date.parse(tk.now || tierFor(tk).now); }

/* ---- progress ----------------------------------------------------------- */
function statusOf(tk) {
  const t = state.tickets[tk.id];
  if (!t) return { key: "new", text: "New" };
  if (t.practice) return { key: "progress", text: "Practice replay" };
  if (t.closed) return { key: "closed", text: "Closed · " + (t.disposition || "resolved") };
  const touched = Object.keys(t.boards).length || t.activity.length > 1;
  return touched ? { key: "progress", text: "In progress · you" } : { key: "new", text: "New" };
}
const done = tk => !!(state.tickets[tk.id]?.closed || state.tickets[tk.id]?.record);
function tierDone(n) { return tierOf(n).tickets.every(done); }
function tierOpen(n) { return n === 1 || window.CWP.instructor() || tierDone(n - 1); }
function boardState(tk, d) { return createBoard(tk.id, d, store.ticket(state, tk.id).boards[d.id]); }
function typeMet(typeId) { return window.CWP.instructor() || ALL.some(tk => (tk.types || []).includes(typeId) && done(tk)); }

/* =====================================================================
   FRAME
   ===================================================================== */
function frame(inner, crumbs, T) {
  T = T || tierOf(ui.tier);
  const instr = window.CWP.instructor();
  const route = location.hash.replace(/^#/, "").split("/")[0] || "queue";
  const ic = d => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2" aria-hidden="true">${d}</svg>`;
  const link = (href, label, icon, current) => `<a href="${href}"${current ? ' aria-current="page"' : ""}>${icon}${label}</a>`;
  const screen = (label, tier, source, icon) => tierOpen(tier)
    ? `<a href="#search/${encodeURIComponent("source=" + source)}">${icon}${label}</a>`
    : `<a aria-disabled="true" title="Opens in Tier ${tier}">${icon}${label}<span class="later">T${tier}</span></a>`;
  const anyPractice = PRACTICE_TYPES.some(p => typeMet(p.id));
  return `
  <div class="app">
    <nav class="rail" aria-label="Console">
      <div class="brand"><svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><rect x="1" y="1" width="28" height="28" rx="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 9 L15 22 L23 9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg><span>VOO Console<small>Veterans Overcoming the Odds</small></span></div>
      ${link("#queue", "Alert queue", ic('<path d="M4 6h16M4 12h16M4 18h10"/>'), route === "queue" || route === "case")}
      ${link("#search", "Search", ic('<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>'), route === "search")}
      ${link("#cases", "Case history", ic('<path d="M6 3h9l3 3v15H6z"/><path d="M9 11h6M9 15h6"/>'), route === "cases")}
      ${screen("Vulnerabilities", 2, "scan", ic('<path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/>'))}
      ${screen("Endpoint", 3, "edr", ic('<rect x="4" y="4" width="16" height="12" rx="1"/><path d="M8 20h8M12 16v4"/>'))}
      ${screen("Network", 3, "zeek.conn", ic('<circle cx="5" cy="12" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 12l10-5M7 12l10 5"/>'))}
      ${screen("Threat intel", 3, "intel", ic('<circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/>'))}
      ${tierOpen(4) ? link("#metrics", "Metrics", ic('<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>'), route === "metrics") : `<a aria-disabled="true" title="Opens in Tier 4">${ic('<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>')}Metrics<span class="later">T4</span></a>`}
      ${anyPractice ? link("#practice", "Practice queue", ic('<path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h5"/>'), route === "practice") : `<a aria-disabled="true" title="Opens when you finish your first ticket">${ic('<path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h5"/>')}Practice queue</a>`}
    </nav>
    <div class="main">
      <header class="topbar">
        <div class="crumbs">Veterans Overcoming the Odds › <b>${esc(crumbs)}</b></div>
        <button class="seat" type="button" id="seatBtn" title="What changed from Security">You: ${esc(T.seat)}</button>
        <span class="clock">${esc(T.shift)} · <span class="mono">${clockOf(T)}</span></span>
        <div class="switches">
          <button class="btn" id="themeBtn" type="button">${window.CWP.theme() === "light" ? "Dark theme" : "Light theme"}</button>
          <button class="btn" id="dysBtn" type="button" aria-pressed="${window.CWP.dyslexia()}">Easier reading</button>
          <button class="btn" id="instrBtn" type="button" aria-pressed="${instr}">${instr ? "Instructor: on" : "Instructor"}</button>
        </div>
      </header>
      <div class="instr-banner">Instructor mode is on: every tier, every ticket and every practice ticket is unlocked.</div>
      <form class="pinbox" id="pinbox" hidden>
        <label for="pin">Instructor PIN</label>
        <input id="pin" name="pin" inputmode="numeric" autocomplete="off" maxlength="8">
        <button class="btn" type="submit">Unlock</button>
        <button class="btn" type="button" id="pinCancel">Cancel</button>
        <span class="msg" id="pinMsg" role="status"></span>
      </form>
      <div class="content">${inner}</div>
      <footer>Cyber Warrior Program — built by an instructor, for students, to make certification study more interactive. For educational purposes only. Not affiliated with, endorsed by, or sponsored by CompTIA®. All trademarks belong to their respective owners.</footer>
    </div>
  </div>`;
}

function tierStrip() {
  return `<div class="tiers" aria-label="Tiers"><span class="label">Tier</span>` + TIERS.map(T => {
    const open = tierOpen(T.n), cur = T.n === ui.tier;
    const label = `${T.n} · ${esc(T.name)}${tierDone(T.n) ? " · done" : open ? "" : " · locked"}`;
    return open ? `<button type="button" class="tier${cur ? " current" : ""}" data-tier="${T.n}" aria-pressed="${cur}">${label}</button>` : `<span class="tier">${label}</span>`;
  }).join("") + `</div>`;
}

/* =====================================================================
   INTRO
   ===================================================================== */
function introView() {
  return frame(`
  <section class="panel intro" aria-labelledby="introTitle">
    <h1 id="introTitle">You've switched seats</h1>
    <p><b>In Security, you owned the business.</b> You signed the contracts and decided what to tell the clients.</p>
    <p><b>Here, you're an analyst</b> in Veterans Overcoming the Odds, the security operations centre that RafikisITS runs for its clients. You can't see the contracts. You can read the logs, the packets and the alerts.</p>
    <p>CySA is the fine tuning of what Security taught: less deciding what the business should do, more proving what actually happened, so the right person can decide.</p>
    <p>You start on Tier 1 and move up as you go: triage, then vulnerability management, then endpoint and network, then running an incident, then improving the SOC itself. The help you get shrinks as you grow, the way it does for a new analyst on a real floor.</p>
    <p>Most of what lands in the queue is noise. Closing noise well, with evidence, is half the job.</p>
    <p class="muted">You type searches from the start, the way analysts are taught. Every ticket ends with a write-up on the case page, and a summary of the exam objectives it used.</p>
    <div class="actions"><button class="btn primary" type="button" id="startShift">Start the shift</button></div>
  </section>`, "Welcome");
}

/* =====================================================================
   QUEUE AND HISTORY
   ===================================================================== */
function rowsFor(list) {
  return list.map(tk => ({ id: tk.id, sev: tk.sev, alert: tk.alert, client: tk.client, entity: tk.entity, attack: tk.attack || "—", source: tk.source, status: statusOf(tk).key, status_text: statusOf(tk).text, time: tk.time, day: tk.day || "Today", sla: tk.sla, tier: tk.tier }));
}
function queueTable(rows, emptyText) {
  const body = rows.length ? rows.map(r => `
      <tr tabindex="0" data-id="${r.id}" aria-selected="${r.id === ui.selected}">
        <td class="mono">${r.id}</td><td class="mono">${r.day !== "Today" ? esc(r.day) + " " : ""}${r.time}</td><td>${sevHtml(r.sev)}</td>
        <td class="alert">${esc(r.alert)}<span class="sub">${esc(r.source)}</span></td><td class="client">${esc(r.client)}</td>
        <td class="entity">${esc(r.entity)}</td><td class="mono">${esc(r.attack)}</td><td>${esc(r.status_text)}</td><td class="mono">${esc(r.sla)}</td></tr>`).join("")
    : `<tr><td colspan="9">${esc(emptyText)}</td></tr>`;
  return `<div class="tablewrap"><table class="queue"><thead><tr><th>Case</th><th>Time (UTC)</th><th>Severity</th><th>Alert</th><th>Client</th><th>Entity</th><th>ATT&amp;CK</th><th>Status</th><th>SLA</th></tr></thead><tbody>${body}</tbody></table></div>`;
}
function queueView(history) {
  const T = tierOf(ui.tier);
  const src = history ? ALL.filter(done) : T.tickets;
  const all = rowsFor(src);
  const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  all.filter(r => r.status !== "closed").forEach(r => counts[r.sev]++);
  let rows = history ? all : all.filter(r => ui.tab === "open" ? r.status !== "closed" : r.status === "closed");
  if (ui.sev && !history) rows = rows.filter(r => r.sev === ui.sev);
  let qerr = "";
  if (ui.queueQuery.trim()) {
    const res = runSearch(ui.queueQuery, rows, Date.parse(T.now));
    if (res.error) qerr = res.error; else { const ids = new Set(res.rows.map(r => r.id)); rows = rows.filter(r => ids.has(r.id)); }
  }
  rows.sort((a, b) => (a.tier - b.tier) || RANK[a.sev] - RANK[b.sev] || (a.day === b.day ? a.time.localeCompare(b.time) : (a.day === "Today" ? 1 : -1)));
  if (!rows.find(r => r.id === ui.selected)) ui.selected = rows[0]?.id || null;
  const sel = ui.selected && byId(ui.selected);
  return frame(`
    ${history ? `<section class="panel pad"><h1>Case history</h1><p class="muted">Every case you've closed, across every tier. Review opens it read-only. Replay runs it again for practice; your first attempt is kept.</p></section>` : tierStrip()}
    <form class="searchbar" id="queueSearch">
      <label for="qq">Search the queue</label>
      <input id="qq" name="qq" value="${esc(ui.queueQuery)}" placeholder='client="Nexxuss"   or   sev=medium' spellcheck="false">
      <button class="btn primary" type="submit">Search</button>
    </form>
    ${qerr ? `<div class="search-error" role="alert">${esc(qerr)}</div>` : ""}
    ${history ? "" : `<div class="summary" aria-label="Open alerts by severity">${Object.keys(SEV).map(s => `<button type="button" class="count" data-sev="${s}" aria-pressed="${ui.sev === s}">${sevHtml(s)} <b>${counts[s]}</b></button>`).join("")}</div>`}
    <div class="workarea">
      <section class="panel" aria-label="Alerts">
        ${history ? "" : `<div class="tabs" role="tablist"><button class="tab" role="tab" id="tabOpen" aria-selected="${ui.tab === "open"}" type="button">Open</button><button class="tab" role="tab" id="tabClosed" aria-selected="${ui.tab === "closed"}" type="button">Closed</button></div>`}
        ${queueTable(rows, history ? "No closed cases yet. Closed tickets stay here, and you can review or replay them." : "Nothing matches. Clear the filter or the search to see everything.")}
      </section>
      <aside class="panel drawer" aria-live="polite">${sel ? drawer(sel) : "<p>Select an alert.</p>"}</aside>
    </div>`, history ? "Case history" : "Alert queue · Tier " + T.n);
}
function drawer(tk) {
  const st = statusOf(tk), t = state.tickets[tk.id], T = tierFor(tk);
  const closed = st.key === "closed";
  const showFizban = T.fizban !== "ask";
  return `
    <div class="muted" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><span class="mono">${tk.id}</span>${sevHtml(tk.sev)}<span>${esc(st.text)}</span></div>
    <h2>${esc(tk.alert)}</h2>
    <dl class="facts"><dt>Client</dt><dd>${esc(tk.client)}</dd><dt>Entity</dt><dd class="mono">${esc(tk.entity)}</dd>${(tk.facts || []).map(f => `<dt>${esc(f[0])}</dt><dd>${esc(f[1])}</dd>`).join("")}</dl>
    ${showFizban ? fizbanBox(tk) : `<p class="muted">Fizban is available on the case page if you ask.</p>`}
    <div class="actions">${closed
      ? `<a class="btn primary" href="#case/${tk.id}">Review case</a><button class="btn" type="button" data-replay="${tk.id}">Replay for practice</button>`
      : `<a class="btn primary" href="#case/${tk.id}">${t && t.practice ? "Continue practice" : "Open case"}</a>`}</div>
    ${t && t.practiceRuns ? `<p class="muted">Replayed for practice ${t.practiceRuns} time${t.practiceRuns === 1 ? "" : "s"}. Your first attempt is kept.</p>` : ""}`;
}
const sparkle = () => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2l2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5z"/></svg>`;
const fizbanBox = tk => `<div class="fizban"><div class="who">${sparkle()}Fizban · AI assistant</div><p>${esc(tk.fizban)}</p><div class="note">Fizban can be wrong. Check it against the evidence.</div></div>`;

/* =====================================================================
   PRACTICE QUEUE
   ===================================================================== */
function practiceView() {
  const groups = PRACTICE_TYPES.map(p => {
    const open = typeMet(p.id);
    const list = PRACTICE.filter(tk => tk.type === p.id);
    const closed = list.filter(done).length;
    return `<section class="panel pad"><h2>${esc(p.name)}</h2>
      <p class="muted">${open ? `${closed} of ${list.length} done. Same skill as the story, new data, new answers.` : `Opens when you finish a story ticket of this type (${esc(p.firstTier)}).`}</p>
      ${open ? queueTable(rowsFor(list), "") : ""}</section>`;
  }).join("");
  return frame(`<section class="panel pad"><h1>Practice queue</h1><p class="muted">Ten extra tickets for each kind of scenario, once you've met it in the story. They're built from the same rules: six options, the same hints, the same summary at the end.</p></section>${groups}`, "Practice queue");
}

/* =====================================================================
   METRICS — the student's own, from their own case records
   ===================================================================== */
function metricsView() {
  const rows = TIERS.map(T => {
    const tks = T.tickets, closed = tks.filter(done);
    let boards = 0, firstTry = 0, wrong = 0, hinted = 0;
    closed.forEach(tk => { const t = state.tickets[tk.id]; const b = (t.record || t).boards || {}; tk.decisions.forEach(d => { const s = b[d.id]; if (!s) return; boards++; wrong += s.wrong || 0; if (!s.wrong) firstTry++; if ((s.wrong || 0) >= 3) hinted++; }); });
    return `<tr><td>Tier ${T.n} · ${esc(T.name)}</td><td class="mono">${closed.length} / ${tks.length}</td><td class="mono">${boards ? Math.round(100 * firstTry / boards) + "%" : "—"}</td><td class="mono">${boards ? (wrong / boards).toFixed(1) : "—"}</td><td class="mono">${hinted}</td></tr>`;
  }).join("");
  return frame(`<section class="panel pad"><h1>Metrics</h1><p class="muted">A real SOC measures itself: mean time to detect (MTTD), mean time to respond (MTTR), false-positive rates. These are yours, from your own case records. Like any metric, they need context: a hard ticket should take more tries.</p></section>
    <section class="panel"><div class="tablewrap"><table><thead><tr><th>Tier</th><th>Closed</th><th>Right first try</th><th>Wrong picks per decision</th><th>Decisions that needed hints</th></tr></thead><tbody>${rows}</tbody></table></div></section>`, "Metrics");
}

/* =====================================================================
   SEARCH
   ===================================================================== */
function searchBlock(idPrefix, query, heading, events, now) {
  const res = query.trim() ? runSearch(query, events, now) : null;
  const sources = [...new Set(events.map(e => e.source))].join(", ");
  let out = `
    <form class="searchbar" data-search="${idPrefix}">
      <label for="${idPrefix}q">${esc(heading)}</label>
      <input id="${idPrefix}q" name="q" value="${esc(query)}" placeholder="source=signin user=&quot;name@client.example&quot; earliest=-24h" spellcheck="false" autocomplete="off">
      <button class="btn primary" type="submit">Search</button>
    </form>`;
  if (!res) return out + `<p class="muted">Type a search and press Search. Sources here: ${esc(sources)}.</p>`;
  if (res.error) return out + `<div class="search-error" role="alert">${esc(res.error)}</div>`;
  const cols = res.columns;
  out += `<p class="muted" role="status"><b>${res.count}</b> result${res.count === 1 ? "" : "s"}${res.count === 0 ? ". Nothing matched, and that's an answer too." : ""}</p>`;
  if (!res.count) return out;
  return out + `<div class="search-grid">
    <div class="fieldlist panel pad"><b>Fields</b> <span class="muted">(different values)</span><ul>${cols.map(c => `<li><span>${esc(c)}</span><span>${res.fields[c]}</span></li>`).join("")}</ul></div>
    <div class="tablewrap panel"><table class="results"><thead><tr>${cols.map(c => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>
    ${res.rows.slice(0, 200).map(r => `<tr>${cols.map(c => `<td><button type="button" class="val" data-field="${esc(c)}" data-value="${esc(r[c])}" data-target="${idPrefix}">${esc(r[c])}</button></td>`).join("")}</tr>`).join("")}
    </tbody></table>${res.count > 200 ? `<p class="muted pad">Showing the first 200. Narrow the search, or use | stats.</p>` : ""}</div></div>`;
}
function searchView() {
  const T = tierOf(ui.tier);
  return frame(`<section class="panel pad"><h1>Search</h1><p class="muted">Every log source on the Tier ${T.n} shift. Switch tier in the queue. Click any value to add it to the search.</p></section>
    <section class="panel pad">${searchBlock("g", ui.searchQuery, "Search every log", T.events, Date.parse(T.now))}</section>`, "Search");
}
function addTerm(q, term) { const i = q.indexOf("|"); return i < 0 ? (q.trim() + " " + term).trim() : (q.slice(0, i).trim() + " " + term + " " + q.slice(i)).trim(); }

/* =====================================================================
   CASE PAGE
   ===================================================================== */
function caseView(id) {
  const tk = byId(id);
  if (!tk) return frame(`<section class="panel pad"><h1>That case isn't here</h1><p><a href="#queue">Back to the queue</a></p></section>`, "Case");
  const T = tierFor(tk);
  if (!tk.practice && !tierOpen(tk.tier)) return frame(`<section class="panel pad"><h1>Tier ${tk.tier} isn't open yet</h1><p>Finish Tier ${tk.tier - 1} first. <a href="#queue">Back to the queue</a></p></section>`, "Case", T);
  const t = store.ticket(state, tk.id);
  if (!t.activity.length) { store.log(t, "Case opened", clockOf(T)); persist(); }
  const review = t.closed && !t.practice;
  const boards = tk.decisions.map(d => ({ d, st: boardState(tk, d) }));
  if (!ui.opened[tk.id]) ui.opened[tk.id] = new Set();
  const opened = ui.opened[tk.id];
  const shownTabs = tk.tabs.filter((tb, i) => tb.linked !== false || opened.has(i) || review);
  const closedScreens = tk.tabs.map((tb, i) => ({ tb, i })).filter(({ tb, i }) => tb.linked === false && !opened.has(i) && !review);
  const tab = shownTabs[ui.caseTab] || shownTabs[0];

  const evidence = `
    <section class="panel" aria-label="Evidence">
      ${shownTabs.length ? `<div class="tabs" role="tablist">${shownTabs.map((tb, i) => `<button class="tab" role="tab" type="button" data-casetab="${i}" aria-selected="${tb === tab}">${esc(tb.title)}</button>`).join("")}</div><div class="pad">${tabBody(tab)}</div>` : `<div class="pad"><p><b>Nothing is attached to this ticket.</b> Decide where to look, and open the screens yourself.</p></div>`}
      ${closedScreens.length ? `<div class="pad" style="border-top:1px solid var(--line)"><b>${T.n >= 4 ? "Console screens" : "Other screens in the console"}</b> <span class="muted">Not linked from the ticket. Open the ones you need.</span><div class="actions" style="margin-top:8px">${closedScreens.map(({ tb, i }) => `<button class="btn" type="button" data-openscreen="${i}">Open ${esc(tb.screen || tb.title)}</button>`).join("")}</div></div>` : ""}
    </section>`;
  const search = `<section class="panel pad" aria-label="Search">${searchBlock("c", ui.caseQuery, "Search the logs", eventsFor(tk), nowFor(tk))}</section>`;

  /* guide: unfold (T1–2), what-not-where (T3), collapsed (T4–5) */
  const mode = T.guide;
  let guide;
  if (mode === "collapsed" && !ui.guideOpen[tk.id] && !review) {
    guide = `<section class="panel pad guide" aria-label="Guide"><h2>Guide</h2><p class="muted">Collapsed. At this tier you decide where to look. It's here if you want it.</p><div class="actions"><button class="btn" type="button" id="guideOpen">Open the guide</button></div></section>`;
  } else {
    const shown = (review || mode !== "unfold") ? tk.guide.length : Math.min(t.guideStep || 1, tk.guide.length);
    const searchStep = T.n === 1 ? Math.max(0, tk.guide.findIndex(g => /search/i.test(g))) : -1;
    guide = `<section class="panel pad guide" aria-label="Guide"><h2>Guide</h2><p class="muted">Advice, not a gate. Nothing is locked.</p>
      <ol>${tk.guide.slice(0, shown).map((g, i) => `<li>${esc(g)}${i === searchStep && tk.search ? `<span class="query">${esc(tk.search.query)}</span><span class="muted">${esc(tk.search.say)}</span><br><button class="btn" type="button" id="useSearch" style="margin-top:6px">Put it in the search bar</button>` : ""}</li>`).join("")}</ol>
      ${shown < tk.guide.length ? `<div class="actions" style="margin-top:10px"><button class="btn" type="button" id="guideNext">Next step</button><button class="btn" type="button" id="guideAll">Show every step</button></div>` : ""}</section>`;
  }
  const fizban = (T.fizban === "ask" && !ui.askFizban[tk.id] && !review)
    ? `<section class="panel pad"><h2>Fizban</h2><p class="muted">At this tier the assistant only speaks when asked. Asking is fine. Believing it without checking is not.</p><div class="actions"><button class="btn" type="button" id="askFizban">Ask Fizban</button></div></section>`
    : `<section class="panel pad">${fizbanBox(tk)}</section>`;

  let boardsHtml = "";
  for (let i = 0; i < boards.length; i++) {
    const { d, st } = boards[i];
    if (i > 0 && !boards[i - 1].st.solved) { boardsHtml += `<section class="panel pad"><h2>Decision ${i + 1} of ${boards.length}</h2><p class="muted">Opens when Decision ${i} is answered.</p></section>`; break; }
    boardsHtml += (d.mechanism ? `<section class="panel pad"><h2>${esc(d.mechanism.title)}</h2>${d.mechanism.body.map(p => `<p>${esc(p)}</p>`).join("")}</section>` : "") + boardHtml(d, st, i, boards.length, review);
  }

  const n = t.notes;
  const writeup = `
    <section class="panel pad writeup" aria-label="Case notes">
      <h2>Case notes</h2>
      <p class="muted">Written so the next analyst doesn't have to repeat the investigation.</p>
      <label for="nAnalyst">Analyst notes<span class="help">What the alert said, and what you saw first.</span></label>
      <textarea id="nAnalyst" data-note="analyst" ${review ? "readonly" : ""}>${esc(n.analyst)}</textarea>
      <label for="nInvest">Investigation<span class="help">Findings. Evidence reviewed. Actions taken.</span></label>
      <textarea id="nInvest" data-note="investigation" ${review ? "readonly" : ""}>${esc(n.investigation)}</textarea>
      <label for="nResolve">Resolution<span class="help">Root cause, what was done, who and what was affected, the final disposition, and what could not be confirmed.</span></label>
      <textarea id="nResolve" data-note="resolution" ${review ? "readonly" : ""}>${esc(n.resolution)}</textarea>
      ${review ? "" : `<div class="actions" style="margin-top:10px"><button class="btn primary" type="button" id="closeCase">Close the case</button></div><p class="status-line" id="closeMsg" role="status">${esc(ui.status)}</p>`}
    </section>`;
  const after = t.closed ? summaryHtml(tk) : "";
  const activity = `<section class="panel pad activity" aria-label="Activity log"><h2>Activity log</h2><p class="muted">Kept by the console, as real case tools do.</p><ol>${t.activity.slice(-40).map(a => `<li><span class="mono">${esc(a[0])}</span> ${esc(a[1])}</li>`).join("")}</ol></section>`;

  return frame(`
    ${t.practice ? `<div class="practice-banner">Practice replay. Your first attempt is kept in the case history. Real SOCs don't replay incidents; this is for training, like a tabletop exercise.</div>` : ""}
    ${tk.practice ? `<div class="practice-banner">Practice queue ticket: same skill as the story, new data.</div>` : ""}
    <section class="panel pad case-head">
      <span class="mono">${tk.id}</span>${sevHtml(tk.sev)}<h1 style="flex:1 1 20ch">${esc(tk.alert)}</h1>
      <span>${esc(statusOf(tk).text)}</span><span class="mono">${esc(tk.sla)}</span>
      <div style="flex-basis:100%" class="muted">Tier ${T.n} · ${esc(tk.client)} · <span class="mono">${esc(tk.entity)}</span>${tk.attack ? ` · rule mapped to <span class="mono">${esc(tk.attack)}</span>` : ""}</div>
    </section>
    <div class="case-grid">
      <div>${evidence}${search}${activity}</div>
      <div>${fizban}${guide}${boardsHtml}${writeup}${after}<p><a href="#${tk.practice ? "practice" : "queue"}">Back to the ${tk.practice ? "practice queue" : "queue"}</a></p></div>
    </div>`, tk.id, T);
}

function tabBody(tb) {
  if (!tb) return "";
  if (tb.kind === "code") return `<pre class="evidence">${esc(tb.text)}</pre>`;
  if (tb.kind === "list") return `<ul class="evidence">${tb.items.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`;
  if (tb.kind === "kv") return `<dl class="facts">${tb.pairs.map(p => `<dt>${esc(p[0])}</dt><dd>${esc(p[1])}</dd>`).join("")}</dl>`;
  if (tb.kind === "table") return `${tb.note ? `<p class="muted">${esc(tb.note)}</p>` : ""}<div class="tablewrap"><table><thead><tr>${tb.columns.map(c => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${tb.rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  if (tb.kind === "process") {
    const node = p => `<li><span class="mono"><b>${esc(p.name)}</b></span>${p.note ? ` <span class="muted">${esc(p.note)}</span>` : ""}${p.detail ? `<dl class="facts proc">${Object.entries(p.detail).map(([k, v]) => `<dt>${esc(k)}</dt><dd class="mono">${esc(v)}</dd>`).join("")}</dl>` : ""}${p.children?.length ? `<ul class="tree">${p.children.map(node).join("")}</ul>` : ""}</li>`;
    return `${tb.host ? `<p><b>Host</b> <span class="mono">${esc(tb.host)}</span></p>` : ""}<ul class="tree root">${tb.tree.map(node).join("")}</ul>`;
  }
  if (tb.kind === "packets") return `<div class="tablewrap"><table><thead><tr>${tb.columns.map(c => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${tb.rows.map(r => `<tr>${r.map(c => `<td class="mono">${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>${tb.detail ? `<p class="muted" style="margin-top:8px">Selected packet, decoded</p><pre class="evidence">${esc(tb.detail)}</pre>` : ""}`;
  /* each step names its kind in words as well as its coloured edge, so a gap is
     never marked by colour alone (the students have damaged sight) */
  if (tb.kind === "flow") return `<ol class="flow">${tb.steps.map(s => { const k = s.kind || "action"; return `<li class="flow-${k}"><span class="flow-kind">${{ trigger: "Trigger", action: "Step", decision: "Decision", gap: "Gap" }[k] || "Step"}</span><b>${esc(s.label)}</b>${s.note ? `<span class="muted"> ${esc(s.note)}</span>` : ""}</li>`; }).join("")}</ol>`;
  return `<p>${esc(tb.text || "")}</p>`;
}

function boardHtml(d, st, idx, total, review) {
  const r = rung(st), right = correctId(d);
  const items = st.order.map((oid, i) => {
    const o = d.options.find(x => x.id === oid);
    const struck = st.struck.includes(oid) || st.narrowed.includes(oid);
    const isRight = st.solved && oid === right;
    const cls = isRight ? "opt right" : struck ? "opt struck" : "opt";
    const word = isRight ? `<span class="word">Right</span>` : struck ? `<span class="word">Ruled out${st.narrowed.includes(oid) ? " by the hint" : ""}</span><span class="why">${esc(o.why)}</span>` : (st.solved ? `<span class="why muted">${esc(o.why || "")}</span>` : "");
    const disabled = struck || st.solved || review;
    return `<li><button type="button" class="${cls}" data-board="${d.id}" data-opt="${oid}" ${disabled ? 'aria-disabled="true"' : ""}><span class="n">${i + 1}</span><span>${esc(o.text)}${word}</span></button></li>`;
  }).join("");
  const hints = [];
  if (r >= 1) hints.push(`<div class="hint"><b>Hint: where to look</b>${esc(d.hints[0])}</div>`);
  if (r >= 2) hints.push(`<div class="hint"><b>Hint: the principle</b>${esc(d.hints[1])}</div>`);
  if (r >= 3) hints.push(`<div class="hint"><b>Hint: the field narrowed</b>${live(d, st).length <= 2 ? "Two options are left. Each one removed shows why." : ""}</div>`);
  return `
    <section class="panel pad board" aria-labelledby="bp-${d.id}">
      <h2>Decision ${idx + 1} of ${total}</h2>
      <p class="prompt" id="bp-${d.id}">${esc(d.prompt)}</p>
      ${hints.join("")}
      <ol class="options">${items}</ol>
      ${st.solved ? `<div class="lesson"><b>The lesson</b><br>${esc(d.lesson)}</div>` : ""}
      ${!st.solved && !review && st.struck.length ? `<div class="actions"><button class="btn" type="button" data-resetboard="${d.id}">Clear this board</button><span class="muted">Clears the red marks. Hints you've earned stay.</span></div>` : ""}
    </section>`;
}

function summaryHtml(tk) {
  return `
    <section class="panel pad" aria-label="What this ticket taught">
      <h2>What this ticket taught</h2>
      <p class="muted">Each exam objective the ticket used: what you did, why it counts, and the words the exam uses. Numbers are from the objective list the course uses.</p>
      <div class="tablewrap"><table class="objsum"><thead><tr><th>Objective</th><th>What you did</th><th>Why it is this objective</th><th>The words the exam uses</th></tr></thead>
      <tbody>${tk.summary.map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td></tr>`).join("")}</tbody></table></div>
      <h3 style="margin-top:14px">One way to write it up</h3>
      <p>${esc(tk.writeup)}</p>
    </section>`;
}

/* =====================================================================
   RENDER AND EVENTS
   ===================================================================== */
function route() { const [r, ...rest] = location.hash.replace(/^#/, "").split("/"); return [r, rest.join("/")]; }
function render() {
  const [r, arg] = route();
  let html;
  if (!state.introSeen || r === "intro") html = introView();
  else if (r === "case" && arg) { const tk = byId(decodeURIComponent(arg)); if (tk && !tk.practice) ui.tier = tk.tier; html = caseView(decodeURIComponent(arg)); }
  else if (r === "search") { if (arg) ui.searchQuery = decodeURIComponent(arg); html = searchView(); }
  else if (r === "cases") html = queueView(true);
  else if (r === "practice") html = practiceView();
  else if (r === "metrics") html = metricsView();
  else html = queueView(false);
  document.getElementById("root").innerHTML = html;
}
function closeMenu() { document.querySelectorAll(".valmenu").forEach(m => m.remove()); }
function currentCase() { const [r, arg] = route(); return r === "case" ? byId(decodeURIComponent(arg || "")) : null; }
function clockNow() { const tk = currentCase(); return clockOf(tk ? tierFor(tk) : tierOf(ui.tier)); }
function dispositionOf(d) { const o = d.options.find(x => x.correct); return (o.text.split("—")[0] || "resolved").trim().toLowerCase(); }
function logSearch(q) { const tk = currentCase(); if (!tk || !q.trim()) return; const t = store.ticket(state, tk.id); store.log(t, "Searched: " + q.trim(), clockNow()); persist(); }

document.addEventListener("click", e => {
  const tgt = e.target.closest("button, a, tr[data-id]");
  if (!e.target.closest(".valmenu") && !e.target.closest("button.val")) closeMenu();
  if (!tgt) return;
  if (tgt.getAttribute("aria-disabled") === "true" && tgt.tagName === "A") { e.preventDefault(); return; }
  if (tgt.id === "startShift") { state.introSeen = true; persist(); location.hash = "#queue"; render(); return; }
  if (tgt.id === "seatBtn") { location.hash = "#intro"; return; }
  if (tgt.id === "themeBtn") { window.CWP.toggleTheme(); render(); return; }
  if (tgt.id === "dysBtn") { window.CWP.toggleDyslexia(); render(); return; }
  if (tgt.id === "instrBtn") {
    if (window.CWP.instructor()) { window.CWP.setInstructor(false); render(); return; }
    $("#pinbox").hidden = false; $("#pinMsg").textContent = ""; $("#pin").focus(); return;
  }
  if (tgt.id === "pinCancel") { $("#pinbox").hidden = true; return; }
  if (tgt.dataset.tier) { ui.tier = Number(tgt.dataset.tier); ui.selected = null; ui.sev = null; render(); return; }
  if (tgt.matches("tr[data-id]")) { ui.selected = tgt.dataset.id; if (route()[0] === "practice") { location.hash = "#case/" + tgt.dataset.id; return; } render(); return; }
  if (tgt.dataset.sev) { ui.sev = ui.sev === tgt.dataset.sev ? null : tgt.dataset.sev; render(); return; }
  if (tgt.id === "tabOpen") { ui.tab = "open"; render(); return; }
  if (tgt.id === "tabClosed") { ui.tab = "closed"; ui.sev = null; render(); return; }
  if (tgt.dataset.replay) {
    const t = store.ticket(state, tgt.dataset.replay); store.startReplay(t); store.log(t, "Practice replay started", clockNow()); persist();
    location.hash = "#case/" + tgt.dataset.replay; return;
  }
  if (tgt.dataset.casetab) { ui.caseTab = Number(tgt.dataset.casetab); render(); return; }
  if (tgt.dataset.openscreen) {
    const tk = currentCase(); const i = Number(tgt.dataset.openscreen); ui.opened[tk.id].add(i);
    const t = store.ticket(state, tk.id); store.log(t, "Opened screen: " + (tk.tabs[i].screen || tk.tabs[i].title), clockNow()); persist();
    const shown = tk.tabs.filter((tb, j) => tb.linked !== false || ui.opened[tk.id].has(j));
    ui.caseTab = shown.indexOf(tk.tabs[i]); render(); return;
  }
  if (tgt.id === "guideOpen") { ui.guideOpen[currentCase().id] = true; render(); return; }
  if (tgt.id === "askFizban") { const tk = currentCase(); ui.askFizban[tk.id] = true; store.log(store.ticket(state, tk.id), "Asked Fizban", clockNow()); persist(); render(); return; }
  if (tgt.id === "guideNext" || tgt.id === "guideAll") {
    const tk = currentCase(); const t = store.ticket(state, tk.id);
    t.guideStep = tgt.id === "guideAll" ? tk.guide.length : (t.guideStep || 1) + 1; persist(); render(); return;
  }
  if (tgt.id === "useSearch") { ui.caseQuery = currentCase().search.query; render(); document.getElementById("cq")?.focus(); return; }
  if (tgt.dataset.opt && tgt.getAttribute("aria-disabled") !== "true") {
    const tk = currentCase(); const d = tk.decisions.find(x => x.id === tgt.dataset.board);
    const t = store.ticket(state, tk.id); const st = boardState(tk, d);
    const n = st.order.indexOf(tgt.dataset.opt) + 1;
    const res = pick(d, st, tgt.dataset.opt);
    if (!res.ignored) {
      store.log(t, `Decision ${tk.decisions.indexOf(d) + 1}: chose option ${n}` + (res.correct ? " (right)" : " (ruled out)"), clockNow());
      t.boards[d.id] = serialise(st);
      if (res.correct && tk.decisions.indexOf(d) === 0 && !t.disposition) t.disposition = dispositionOf(d);
      persist(); render();
    }
    return;
  }
  if (tgt.dataset.resetboard) {
    const tk = currentCase(); const t = store.ticket(state, tk.id);
    const idx = tk.decisions.findIndex(x => x.id === tgt.dataset.resetboard);
    tk.decisions.slice(idx).forEach(d => { const st = boardState(tk, d); if (!st.solved || d.id === tgt.dataset.resetboard) { reset(d, st); t.boards[d.id] = serialise(st); } });
    store.log(t, `Decision ${idx + 1}: board cleared`, clockNow()); persist(); render(); return;
  }
  if (tgt.id === "closeCase") {
    const tk = currentCase(); const t = store.ticket(state, tk.id);
    if (!tk.decisions.every(d => boardState(tk, d).solved)) { ui.status = "To close the case, answer every decision first."; render(); return; }
    if ((t.notes.resolution || "").trim().length < 30) { ui.status = "Write the resolution first: what you concluded, and what could not be confirmed."; render(); document.getElementById("nResolve")?.focus(); return; }
    ui.status = "";
    if (t.practice) { store.log(t, "Practice replay finished", clockNow()); store.finishReplay(t); }
    else { t.closed = true; t.closedAt = clockNow(); store.log(t, "Case closed", clockNow()); }
    persist(); render(); return;
  }
  if (tgt.matches("button.val")) {
    closeMenu();
    const field = tgt.dataset.field, value = tgt.dataset.value, where = tgt.dataset.target;
    const q = s => (/[\s"]/.test(s) || s === "" ? `"${s.replace(/"/g, "")}"` : s);
    const m = document.createElement("div"); m.className = "valmenu"; m.setAttribute("role", "menu");
    m.innerHTML = `<button type="button" role="menuitem" data-addterm="${esc(field + "=" + q(value))}" data-where="${where}">Add to search: ${esc(field)}=${esc(value)}</button>
      <button type="button" role="menuitem" data-addterm="${esc(field + "!=" + q(value))}" data-where="${where}">Exclude from search</button>
      <button type="button" role="menuitem" data-newsearch="${esc(q(value))}" data-where="${where}">Search this value in every log</button>
      <button type="button" role="menuitem" data-copy="${esc(value)}">Copy the value</button>`;
    const r = tgt.getBoundingClientRect(); m.style.left = (r.left + window.scrollX) + "px"; m.style.top = (r.bottom + window.scrollY + 4) + "px";
    document.body.appendChild(m); m.querySelector("button").focus(); return;
  }
  if (tgt.dataset.addterm || tgt.dataset.newsearch) {
    const where = tgt.dataset.where;
    const cur = where === "g" ? ui.searchQuery : ui.caseQuery;
    const next = tgt.dataset.addterm ? addTerm(cur, tgt.dataset.addterm) : tgt.dataset.newsearch;
    if (where === "g") ui.searchQuery = next; else { ui.caseQuery = next; logSearch(next); }
    closeMenu(); render(); return;
  }
  if (tgt.dataset.copy !== undefined) { const v = tgt.dataset.copy; closeMenu(); try { navigator.clipboard.writeText(v).catch(() => {}); } catch (err) { /* not fatal */ } return; }
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeMenu();
  const tr = e.target.closest && e.target.closest("tr[data-id]");
  if (tr && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); tr.click(); document.querySelector(`tr[data-id="${tr.dataset.id}"]`)?.focus(); }
});

document.addEventListener("submit", e => {
  const f = e.target; e.preventDefault();
  if (f.id === "pinbox") {
    const input = $("#pin");
    if (String(input.value).trim() === PIN) { window.CWP.setInstructor(true); render(); }
    else { $("#pinMsg").textContent = "That PIN didn't match. Instructor mode stays off."; input.value = ""; input.focus(); }
    return;
  }
  if (f.id === "queueSearch") { ui.queueQuery = f.qq.value; render(); return; }
  if (f.dataset.search === "g") { ui.searchQuery = f.q.value; if (location.hash.startsWith("#search/")) history.replaceState(null, "", "#search"); render(); document.getElementById("gq")?.focus(); return; }
  if (f.dataset.search === "c") { ui.caseQuery = f.q.value; logSearch(f.q.value); render(); document.getElementById("cq")?.focus(); return; }
});

let noteTimer = null;
document.addEventListener("input", e => {
  const ta = e.target.closest("textarea[data-note]"); if (!ta) return;
  const tk = currentCase(); if (!tk) return;
  store.ticket(state, tk.id).notes[ta.dataset.note] = ta.value;
  clearTimeout(noteTimer); noteTimer = setTimeout(persist, 300);
});

window.addEventListener("hashchange", () => { ui.caseTab = 0; ui.caseQuery = ""; ui.status = ""; render(); window.scrollTo(0, 0); });
render();
