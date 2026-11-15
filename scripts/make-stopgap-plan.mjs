// Builds the compact reminder-only state used by the ntfy scheduler while Supabase is unavailable.
// Keeps ONLY what reminders need (targets, supplements with times, workout titles) - no recipes,
// notes, or weights - so it is safe to hold in a GitHub secret instead of the public repo.
//
// Usage:
//   node scripts/make-stopgap-plan.mjs /path/to/tlgPlan_WeekNN_YYYY-MM-DD.json [more plan files...]
//   -> prints one line of JSON (the STOPGAP_PLAN secret value)
//   node scripts/make-stopgap-plan.mjs plan.json | gh secret set STOPGAP_PLAN

import { readFileSync } from 'node:fs';

function tMinOf(time) {
  const m = /^(\d{1,2}):(\d{2})\s*([AP]M)$/i.exec(String(time || '').trim());
  if (!m) return 0;
  let h = +m[1] % 12;
  if (m[3].toUpperCase() === 'PM') h += 12;
  return h * 60 + +m[2];
}

const planWeeks = {};
for (const file of process.argv.slice(2)) {
  const p = JSON.parse(readFileSync(file, 'utf8'));
  if (!p.targetWeek || !/^\d{4}-\d{2}-\d{2}$/.test(p.targetWeek)) throw new Error(`${file}: targetWeek must be a date`);
  const workouts = {};
  for (const [d, w] of Object.entries(p.workouts || {})) workouts[d] = { title: w.title };
  planWeeks[p.targetWeek] = {
    targets: { prot: p.targets && p.targets.prot, water: p.targets && p.targets.water },
    supplements: (p.supplements || []).filter((s) => (s.introWeek || 1) < 99).map((s) => ({ label: s.label, time: s.time, tMin: tMinOf(s.time) })),
    workouts,
  };
}
process.stdout.write(JSON.stringify({ planWeeks }));
