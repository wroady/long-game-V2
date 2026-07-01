// Daily notification scheduler for The Long Game.
// Runs once each morning (GitHub Actions cron), reads the current plan from Supabase, and posts the
// day's reminders to ntfy with `At` headers so each is delivered at its exact time. Single source →
// no per-device duplicates. See .github/workflows/notify.yml.
//
// Usage:
//   node scripts/schedule-notifications.mjs                 # live (needs SUPABASE_SERVICE_KEY env)
//   node scripts/schedule-notifications.mjs --dry-run       # print, don't post
//   node scripts/schedule-notifications.mjs --dry-run --state mock.json   # use a local state file

import { readFileSync } from 'node:fs';

const SUPABASE_URL = 'https://jswukfohohtiwuhskyaw.supabase.co';
const NTFY_TOPIC = process.env.NTFY_TOPIC || 'https://ntfy.sh/rodney-longgame-7x4k';
const TZ = 'America/Detroit';
const USER_ID = 'rodney';

const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const stateArgIdx = args.indexOf('--state');
const stateFile = stateArgIdx >= 0 ? args[stateArgIdx + 1] : null;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_FULL = { Sun: 'Sunday', Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday' };

// ── Timezone helpers (America/Detroit, DST-aware via Intl) ─────────────────────
function etParts(utcMs) {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date(utcMs));
  const o = {}; for (const { type, value } of p) o[type] = value;
  return { y: +o.year, mo: +o.month, d: +o.day, h: +(o.hour === '24' ? '0' : o.hour), mi: +o.minute };
}
function todayET() { const p = etParts(Date.now()); return { y: p.y, mo: p.mo, d: p.d }; }
function iso(y, mo, d) { return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`; }
function etWeekdayIndex() { return DAYS.indexOf(new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short' }).format(new Date())); }
// Unix seconds for today HH:MM in ET (tries EDT/EST offsets and round-trips).
function etEpochToday(hh, mm) {
  const { y, mo, d } = todayET();
  for (const off of [4, 5]) {
    const utcMs = Date.UTC(y, mo - 1, d, hh + off, mm, 0);
    const p = etParts(utcMs);
    if (p.h === hh && p.mi === mm && p.d === d) return Math.floor(utcMs / 1000);
  }
  return Math.floor(Date.UTC(y, mo - 1, d, hh + 4, mm, 0) / 1000);
}
function todayKeyET() { const { y, mo, d } = todayET(); return iso(y, mo, d); }
function weekSundayKey() { const { y, mo, d } = todayET(); const dt = new Date(Date.UTC(y, mo - 1, d - etWeekdayIndex())); return iso(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate()); }
function weekStartOf(dateStr) { const [Y, M, D] = dateStr.split('-').map(Number); const dt = new Date(Date.UTC(Y, M - 1, D)); dt.setUTCDate(dt.getUTCDate() - dt.getUTCDay()); return iso(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate()); }
function programWeek(planStartDate, wkKey) {
  if (!planStartDate) return 1;
  const s = weekStartOf(planStartDate);
  const ms = Date.parse(wkKey + 'T00:00:00Z') - Date.parse(s + 'T00:00:00Z');
  return Math.max(1, Math.round(ms / (7 * 86400000)) + 1);
}

// ── Load state ────────────────────────────────────────────────────────────────
async function loadState() {
  if (stateFile) return JSON.parse(readFileSync(stateFile, 'utf8'));
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_KEY not set (needed to read the RLS-locked row).');
  const r = await fetch(`${SUPABASE_URL}/rest/v1/app_sync?user_id=eq.${USER_ID}&select=state`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!r.ok) throw new Error(`Supabase read failed: ${r.status} ${await r.text()}`);
  const rows = await r.json();
  return rows && rows.length ? rows[0].state : null;
}

// ── Resolve today's plan from the synced state (self-contained; no app constants) ──
function resolvePlan(state) {
  const wk = weekSundayKey();
  if (state && state.planWeeks && state.planWeeks[wk]) return state.planWeeks[wk];
  if (state && state.activePlan) {
    const pw = programWeek(state.planStartDate, wk);
    const p = { ...state.activePlan };
    p.supplements = (p.supplements || []).filter((s) => (s.introWeek || 1) <= pw);
    return p;
  }
  return null; // brand-new / never used this week
}

// ── Build the tailored notification set ───────────────────────────────────────
function buildNotifications(plan) {
  const dayAbbr = DAYS[etWeekdayIndex()];
  const tomorrow = DAYS[(etWeekdayIndex() + 1) % 7];
  const out = [];

  if (!plan) {
    out.push({ hh: 6, mm: 15, tag: 'memo', title: 'The Long Game', body: `${DAY_FULL[dayAbbr]} — open the app to set up today.` });
    return out;
  }

  const targets = plan.targets || { prot: 160, water: 80 };
  const workoutTitle = (plan.workouts && plan.workouts[dayAbbr] && plan.workouts[dayAbbr].title) || 'Rest / mobility';
  const supps = (plan.supplements || []).slice().sort((a, b) => (a.tMin || 0) - (b.tMin || 0));

  // Morning summary (6:15) — day overview + first supplement (usually the empty-stomach one).
  const first = supps[0];
  let summary = `${DAY_FULL[dayAbbr]}. Today: ${workoutTitle}. Protein ${targets.prot}g · water ${targets.water}oz.`;
  if (first) summary += ` First: ${first.label}${first.time ? ' (' + first.time + ')' : ''}.`;
  out.push({ hh: 6, mm: 15, tag: 'sunny', title: 'Good morning', body: summary });

  // Supplement stacks — Morning (7:00–11:00) / Midday (11:00–16:00) / Evening (16:00–20:30).
  // The pre-7:00 supp (e.g. L-glutamine) is covered by the summary; bedtime supp goes to the evening nudge.
  const stacks = [
    { name: 'Morning supplements', lo: 420, hi: 660 },
    { name: 'Midday supplements', lo: 661, hi: 960 },
    { name: 'Evening supplements', lo: 961, hi: 1229 },
  ];
  for (const st of stacks) {
    const inStack = supps.filter((s) => s.tMin > st.lo - 1 && s.tMin <= st.hi);
    if (!inStack.length) continue;
    const sendMin = inStack[0].tMin;
    out.push({ hh: Math.floor(sendMin / 60), mm: sendMin % 60, tag: 'pill', title: st.name, body: inStack.map((s) => s.label).join(' · ') });
  }

  // Meal nudges — lunch (11:30) + snack (15:30). Breakfast is folded into the morning summary.
  out.push({ hh: 11, mm: 30, tag: 'fork_and_knife', title: 'Lunch', body: 'Log lunch and see today’s recommended prep option.' });
  out.push({ hh: 15, mm: 30, tag: 'peanuts', title: 'Snack', body: 'Snack time — open The Long Game for today’s pick (~30g protein).' });

  // Evening / bedtime (21:00) — bedtime supp(s) + tomorrow heads-up.
  const bedSupps = supps.filter((s) => s.tMin >= 1230);
  const tomorrowTitle = (plan.workouts && plan.workouts[tomorrow] && plan.workouts[tomorrow].title) || 'Rest / mobility';
  let evening = bedSupps.length ? `${bedSupps.map((s) => s.label).join(' · ')}. ` : '';
  evening += `Tomorrow: ${tomorrowTitle}.`;
  out.push({ hh: 21, mm: 0, tag: 'crescent_moon', title: 'Wind down', body: evening });

  return out;
}

// ── Post to ntfy (or print) ───────────────────────────────────────────────────
async function main() {
  const state = await loadState();
  const plan = resolvePlan(state);
  const notes = buildNotifications(plan);
  notes.sort((a, b) => a.hh * 60 + a.mm - (b.hh * 60 + b.mm));

  console.log(`[schedule-notifications] ${todayKeyET()} (${TZ}) — plan source: ${plan ? (state.planWeeks && state.planWeeks[weekSundayKey()] ? 'frozen week' : 'activePlan') : 'none'} — ${notes.length} reminders${DRY ? ' (dry-run)' : ''}`);
  const nowEpoch = Math.floor(Date.now() / 1000);
  const GRACE = 20 * 60; // recently-past reminders (cron drift) go out immediately; older are skipped as stale
  for (const n of notes) {
    const at = etEpochToday(n.hh, n.mm);
    const when = `${String(n.hh).padStart(2, '0')}:${String(n.mm).padStart(2, '0')} ET`;
    if (DRY) {
      console.log(`  ${when}  [:${n.tag || ''}: ${n.title}] ${n.body}   (At=${at})`);
      continue;
    }
    if (at < nowEpoch - GRACE) { console.log(`  ${when}  skipped (already past)  [${n.title}]`); continue; }
    const headers = { 'Content-Type': 'text/plain; charset=utf-8', Title: n.title, At: String(at) };
    if (n.tag) headers.Tags = n.tag; // ntfy renders emoji from ASCII shortcodes (headers can't hold emoji)
    if (at <= nowEpoch) delete headers.At; // ntfy rejects past timestamps → deliver now instead
    const r = await fetch(NTFY_TOPIC, { method: 'POST', headers, body: n.body });
    console.log(`  ${when}  ${r.ok ? (headers.At ? 'scheduled' : 'sent now') : 'FAILED ' + r.status + ' ' + (await r.text())}  [${n.title}]`);
  }
}

main().catch((e) => { console.error('schedule-notifications failed:', e.message); process.exit(1); });
