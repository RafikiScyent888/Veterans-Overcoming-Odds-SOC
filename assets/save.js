/* =====================================================================
   SAVING PROGRESS — in this browser only

   Every read and write is guarded: in a private window, or with site
   data blocked, the console still works; it just won't remember.

   Per ticket:
     boards     each decision board's state (struck, narrowed, solved)
     notes      the case page: analyst notes, investigation, resolution
     activity   the case's activity log, written by the console itself
     closed     closed on the first attempt
     record     the first attempt, kept when the student replays
     practice   true while a replay is running
   ===================================================================== */
const KEY = "voo:progress:v1";

function blank() { return { introSeen: false, tickets: {} }; }

export function load() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return blank();
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object" || !data.tickets) return blank();
    return data;
  } catch (e) { return blank(); }
}

export function save(state) {
  try { window.localStorage.setItem(KEY, JSON.stringify(state)); return true; }
  catch (e) { return false; }
}

export function ticket(state, id) {
  if (!state.tickets[id]) state.tickets[id] = { boards: {}, notes: { analyst: "", investigation: "", resolution: "" }, activity: [], closed: false, record: null, practice: false, guideStep: 1, practiceRuns: 0 };
  return state.tickets[id];
}

export function log(t, what, clock) {
  t.activity.push([clock, what]);
  if (t.activity.length > 200) t.activity.splice(0, t.activity.length - 200);
}

/** Start a practice replay: the first attempt is set aside, untouched. */
export function startReplay(t) {
  if (!t.record) t.record = JSON.parse(JSON.stringify({ boards: t.boards, notes: t.notes, activity: t.activity, closedAt: t.closedAt || null }));
  t.boards = {}; t.notes = { analyst: "", investigation: "", resolution: "" }; t.activity = [];
  t.closed = false; t.practice = true; t.guideStep = 1;
}

/** Finish a practice replay: back to the first attempt, which never changed. */
export function finishReplay(t) {
  const r = t.record;
  t.boards = r.boards; t.notes = r.notes; t.activity = r.activity; t.closedAt = r.closedAt;
  t.closed = true; t.practice = false; t.practiceRuns = (t.practiceRuns || 0) + 1;
}

export function resetAll() {
  try { window.localStorage.removeItem(KEY); } catch (e) { /* not fatal */ }
}
