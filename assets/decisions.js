/* =====================================================================
   THE DECISION BOARD — six options, the hint ladder, nothing locks

   The owner's rules, as they are written:

   - Six options: one right, five wrong. Hard numbers
   - A wrong pick goes red and STAYS red until solved or reset
   - Unlimited tries, unlimited hints. Nothing ever locks
   - Wrong picks 1–2: nothing. Let them think
   - Wrong pick 3: rung 1, where to look
   - Wrong pick 4: rung 2, the principle
   - Wrong pick 5 and every one after, for ever: rung 3, the field narrowed
     to TWO live options, with a reason attached to each option removed
   - There is no rung that says the answer
   - Reset goes back to the last part answered correctly
   - A wrong pick shows its reason as it goes red, and reset keeps the
     hints already earned. Both match the Security build, so the two
     sites behave the same way

   Options are shuffled by a seed made from the ticket and the board, so
   everyone sees the same order and an instructor can say "option four"
   to the room, but the right answer isn't always in the same slot.

   Pure logic, no DOM, so it can be verified on its own.
   ===================================================================== */

export const RUNG_1_AT = 3;
export const RUNG_2_AT = 4;
export const RUNG_3_AT = 5;

/* ---- the seeded shuffle ------------------------------------------- */

function hash(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function shuffledIds(ids, seedText) {
  const r = rng(hash(seedText));
  const out = ids.slice();
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}

/* ---- one board ----------------------------------------------------- */

/** decision: { id, options: [{ id, text, correct, why }], keep } —
    `keep` optionally names the wrong option rung 3 leaves standing. */
export function createBoard(ticketId, decision, saved) {
  const order = shuffledIds(decision.options.map(o => o.id), ticketId + "/" + decision.id);
  const st = {
    order,
    struck: [],        // ids the student picked wrongly — red until reset
    narrowed: [],      // ids removed by rung 3, each shown with its reason
    wrong: 0,
    solved: false,
    picked: null,
  };
  if (saved) Object.assign(st, JSON.parse(JSON.stringify(saved)), { order });
  return st;
}

export function correctId(decision) { return decision.options.find(o => o.correct).id; }

export function live(decision, st) {
  return st.order.filter(id => !st.struck.includes(id) && !st.narrowed.includes(id));
}

export function rung(st) {
  if (st.solved) return 0;
  if (st.wrong >= RUNG_3_AT) return 3;
  if (st.wrong >= RUNG_2_AT) return 2;
  if (st.wrong >= RUNG_1_AT) return 1;
  return 0;
}

/** Rung 3: strike wrong options, each with its reason, until exactly two
    are live. Never strikes the right answer. Never goes below two. */
function narrow(decision, st) {
  const right = correctId(decision);
  const standing = live(decision, st);
  if (standing.length <= 2) return;
  const wrongLive = standing.filter(id => id !== right);
  const keep = decision.keep && wrongLive.includes(decision.keep) ? decision.keep : wrongLive[0];
  for (const id of wrongLive) if (id !== keep) st.narrowed.push(id);
}

/** A pick. Returns { correct, ignored }. Picking something already ruled
    out, or anything after the board is solved, changes nothing. */
export function pick(decision, st, optionId) {
  if (st.solved) return { correct: false, ignored: true };
  if (!st.order.includes(optionId) || st.struck.includes(optionId) || st.narrowed.includes(optionId)) {
    return { correct: false, ignored: true };
  }
  if (optionId === correctId(decision)) {
    st.solved = true; st.picked = optionId;
    return { correct: true, ignored: false };
  }
  st.struck.push(optionId);
  st.wrong += 1;
  if (rung(st) === 3) narrow(decision, st);
  return { correct: false, ignored: false };
}

/** Reset this board: every red mark cleared. The count of wrong picks
    SURVIVES, as in the Security build: somebody on their eighth guess who
    clears the board is still on their eighth guess, and dropping them back
    to "no hints yet" would take away help they have earned. The caller
    resets later boards too, never earlier solved ones. */
export function reset(decision, st) {
  st.struck = []; st.narrowed = []; st.solved = false; st.picked = null;
  if (rung(st) === 3) narrow(decision, st);
  return st;
}

export function serialise(st) {
  return { struck: st.struck.slice(), narrowed: st.narrowed.slice(), wrong: st.wrong, solved: st.solved, picked: st.picked };
}
