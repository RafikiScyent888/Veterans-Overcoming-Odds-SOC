/* =====================================================================
   THE SEARCH BAR — a small, generic query language

   The owner: "We are taught to search from the beginning." Students type
   searches from their first ticket. The language looks like the common
   SIEM languages without copying any one vendor's:

     source=signin user="otik@*" earliest=-24h
     | table time src_ip device_id result
     | stats count dc(user) by src_ip
     | sort -count
     | head 10
     | dedup src_ip

   Search terms (all must match — AND):
     field=value      exact, case-insensitive; * is a wildcard
     field!=value     not equal
     field>n  field<n numeric comparison
     earliest=-24h    time window back from the shift clock (m, h, d)
     word             matches any field that contains it

   Every error says what went wrong and how to fix it. A search that finds
   nothing is an answer, not a failure.
   ===================================================================== */

export const COMMANDS = ["table", "fields", "stats", "sort", "head", "dedup"];

/* ---- tokenising ---------------------------------------------------- */

function splitPipes(q) {
  const parts = []; let cur = ""; let quote = false;
  for (const ch of q) {
    if (ch === '"') quote = !quote;
    if (ch === "|" && !quote) { parts.push(cur); cur = ""; continue; }
    cur += ch;
  }
  if (quote) throw new SearchError('A quotation mark is not closed. Add a closing " after the value.');
  parts.push(cur);
  return parts.map(p => p.trim());
}

function words(s) {
  const out = []; let cur = ""; let quote = false;
  for (const ch of s) {
    if (ch === '"') { quote = !quote; cur += ch; continue; }
    if (/[\s,]/.test(ch) && !quote) { if (cur) out.push(cur); cur = ""; continue; }
    cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}

const unquote = v => (v.length >= 2 && v[0] === '"' && v[v.length - 1] === '"') ? v.slice(1, -1) : v;

export class SearchError extends Error {}

/* ---- parsing ------------------------------------------------------- */

export function parse(query) {
  const q = String(query || "").trim();
  if (!q) throw new SearchError("The search is empty. Start with a source, for example: source=signin");
  const parts = splitPipes(q);
  if (parts.some((p, i) => i > 0 && !p)) throw new SearchError("There is an empty step between two | characters. Remove the extra |, or add a command after it.");
  const terms = [];
  let earliest = null;
  for (const w of words(parts[0])) {
    const m = /^([A-Za-z_][\w.]*)(!=|>=|<=|=|>|<)(.*)$/.exec(w);
    if (m) {
      const [, field, op, raw] = m;
      const value = unquote(raw);
      if (value === "" && op !== "=") throw new SearchError(`"${w}" has no value after ${op}. Put the value straight after it, with no space.`);
      if (field === "earliest") {
        const t = /^-(\d+)([mhd])$/.exec(value);
        if (!t) throw new SearchError(`earliest=${value} isn't a time I understand. Use a number and m, h or d: earliest=-30m, earliest=-24h, earliest=-7d.`);
        earliest = Number(t[1]) * { m: 60e3, h: 3600e3, d: 86400e3 }[t[2]];
        continue;
      }
      if ((op === ">" || op === "<" || op === ">=" || op === "<=") && isNaN(Number(value))) {
        throw new SearchError(`${field}${op}${value}: comparisons with ${op} need a number.`);
      }
      terms.push({ field, op, value });
    } else {
      terms.push({ field: null, op: "contains", value: unquote(w) });
    }
  }
  const commands = parts.slice(1).map(p => {
    const [name, ...args] = words(p);
    const cmd = String(name).toLowerCase();
    if (!COMMANDS.includes(cmd)) {
      throw new SearchError(`"${name}" isn't a command here. After a | you can use: ${COMMANDS.filter(c => c !== "fields").join(", ")}.`);
    }
    return { cmd, args };
  });
  return { terms, earliest, commands };
}

/* ---- matching ------------------------------------------------------ */

function wildcard(pattern) {
  const esc = String(pattern).toLowerCase().replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp("^" + esc + "$");
}

function matches(ev, t) {
  if (t.op === "contains") {
    const needle = String(t.value).toLowerCase();
    return Object.values(ev).some(v => String(v).toLowerCase().includes(needle));
  }
  const has = Object.prototype.hasOwnProperty.call(ev, t.field);
  const v = has ? ev[t.field] : undefined;
  switch (t.op) {
    case "=":  return has && wildcard(t.value).test(String(v).toLowerCase());
    case "!=": return !has || !wildcard(t.value).test(String(v).toLowerCase());
    case ">":  return has && Number(v) > Number(t.value);
    case "<":  return has && Number(v) < Number(t.value);
    case ">=": return has && Number(v) >= Number(t.value);
    case "<=": return has && Number(v) <= Number(t.value);
  }
  return false;
}

/* ---- commands ------------------------------------------------------ */

function runStats(rows, args) {
  const byAt = args.findIndex(a => a.toLowerCase() === "by");
  const aggs = (byAt < 0 ? args : args.slice(0, byAt));
  const by = byAt < 0 ? [] : args.slice(byAt + 1);
  if (!aggs.length) throw new SearchError("stats needs something to count, for example: | stats count by src_ip");
  const specs = aggs.map(a => {
    const m = /^(count|dc|avg|sum|min|max)(?:\(([\w.]+)\))?$/i.exec(a);
    if (!m) throw new SearchError(`"${a}" isn't something stats can work out. Use count, dc(field), avg(field), sum(field), min(field) or max(field).`);
    const fn = m[1].toLowerCase();
    if (fn !== "count" && !m[2]) throw new SearchError(`${fn} needs a field in brackets, for example: ${fn}(bytes)`);
    return { fn, field: m[2] || null, name: m[2] ? `${fn}(${m[2]})` : "count" };
  });
  const groups = new Map();
  for (const r of rows) {
    const key = JSON.stringify(by.map(f => r[f] ?? ""));
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  const out = [];
  for (const [key, members] of groups) {
    const row = {};
    JSON.parse(key).forEach((v, i) => { row[by[i]] = v; });
    for (const s of specs) {
      const vals = s.field ? members.map(m => m[s.field]).filter(v => v !== undefined && v !== "") : members;
      const nums = vals.map(Number).filter(n => !isNaN(n));
      row[s.name] =
        s.fn === "count" ? (s.field ? vals.length : members.length) :
        s.fn === "dc"    ? new Set(vals.map(String)).size :
        s.fn === "sum"   ? nums.reduce((a, b) => a + b, 0) :
        s.fn === "avg"   ? (nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length * 10) / 10 : "") :
        s.fn === "min"   ? (nums.length ? Math.min(...nums) : "") :
                           (nums.length ? Math.max(...nums) : "");
    }
    out.push(row);
  }
  return { rows: out, columns: [...by, ...specs.map(s => s.name)] };
}

function cmp(a, b) {
  const na = Number(a), nb = Number(b);
  if (a !== "" && b !== "" && !isNaN(na) && !isNaN(nb)) return na - nb;
  return String(a ?? "").localeCompare(String(b ?? ""));
}

/* ---- run ----------------------------------------------------------- */

/** Runs a query over events. `now` is the shift clock (ms). Never throws:
    errors come back as { error } so the screen can show them plainly. */
export function runSearch(query, events, now) {
  let parsed;
  try { parsed = parse(query); }
  catch (e) { return { error: e instanceof SearchError ? e.message : "That search couldn't be read. Check it and try again.", rows: [], columns: [] }; }
  try {
    let rows = events.filter(ev => {
      if (parsed.earliest !== null) {
        const t = Date.parse(ev.time);
        if (isNaN(t) || t < now - parsed.earliest || t > now) return false;
      }
      return parsed.terms.every(t => matches(ev, t));
    });
    rows.sort((a, b) => cmp(a.time, b.time));
    let columns = null;
    for (const { cmd, args } of parsed.commands) {
      if (cmd === "table" || cmd === "fields") {
        if (!args.length) throw new SearchError(`${cmd} needs the fields to show, for example: | table time user src_ip`);
        columns = args;
        rows = rows.map(r => Object.fromEntries(args.map(f => [f, r[f] ?? ""])));
      } else if (cmd === "stats") {
        const res = runStats(rows, args); rows = res.rows; columns = res.columns;
      } else if (cmd === "sort") {
        if (!args.length) throw new SearchError("sort needs a field, for example: | sort -count (the minus sorts largest first)");
        const keys = args.map(a => a.startsWith("-") ? { f: a.slice(1), d: -1 } : { f: a.replace(/^\+/, ""), d: 1 });
        rows = rows.slice().sort((x, y) => { for (const k of keys) { const c = cmp(x[k.f], y[k.f]) * k.d; if (c) return c; } return 0; });
      } else if (cmd === "head") {
        const n = Number(args[0] ?? 10);
        if (!Number.isInteger(n) || n < 1) throw new SearchError("head needs a whole number, for example: | head 10");
        rows = rows.slice(0, n);
      } else if (cmd === "dedup") {
        if (!args.length) throw new SearchError("dedup needs a field, for example: | dedup user");
        const seen = new Set();
        rows = rows.filter(r => { const k = JSON.stringify(args.map(f => r[f])); if (seen.has(k)) return false; seen.add(k); return true; });
      }
    }
    if (!columns) {
      const keys = new Set(); rows.forEach(r => Object.keys(r).forEach(k => keys.add(k)));
      const pref = ["time", "source"];
      columns = [...pref.filter(k => keys.has(k)), ...[...keys].filter(k => !pref.includes(k))];
    }
    /* The field list beside the results: how many DIFFERENT values each
       field has. "Count unique entities, not rows." */
    const fields = {};
    for (const c of columns) fields[c] = new Set(rows.map(r => String(r[c] ?? ""))).size;
    return { rows, columns, fields, count: rows.length, error: null };
  } catch (e) {
    return { error: e instanceof SearchError ? e.message : "That search couldn't be run. Check it and try again.", rows: [], columns: [] };
  }
}
