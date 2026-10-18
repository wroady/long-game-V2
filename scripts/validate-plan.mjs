// Validate a weekly plan JSON against the app's REAL import code (extracted from src/app.js), and report
// the things that have bitten before: missing weekdays, non-ASCII characters, missing fat/fiber, and
// exercises with no curated demo video.
//
//   node scripts/validate-plan.mjs ~/Desktop/tlgPlan_WeekNN.json
import fs from "fs";
import vm from "vm";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const FILE = process.argv[2];
if (!FILE) { console.error("usage: node scripts/validate-plan.mjs <plan.json>"); process.exit(2); }
const src = fs.readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "src", "app.js"), "utf8");

function extract(name) {
  const start = src.indexOf("function " + name + "(");
  if (start === -1) throw new Error("not found: " + name);
  let depth = 0, i = src.indexOf("{", start), end = -1;
  for (; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  return src.slice(start, end);
}
function extractConst(decl) {
  const s = src.indexOf(decl);
  let depth = 0, i = src.indexOf("{", s), e = -1;
  for (; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") { depth--; if (depth === 0) { e = i + 1; break; } }
  }
  return src.slice(s, e) + ";";
}
const sandbox = { console };
vm.createContext(sandbox);
vm.runInContext(extractConst("const RECIPES="), sandbox);
vm.runInContext(extractConst("const EXERCISE_DEMOS="), sandbox);
for (const f of ["deepClone", "parseTime", "parsePlanImport", "mergePlan", "stripRepCount", "demoLinkFor"]) vm.runInContext(extract(f), sandbox);

const text = fs.readFileSync(FILE, "utf8");
const doc = JSON.parse(text);
sandbox.__doc = doc;
const result = vm.runInContext("parsePlanImport(JSON.stringify(__doc))", sandbox);
console.log("parsePlanImport:", result.ok ? "ok" : "FAILED " + JSON.stringify(result.errors));
if (result.ok) {
  sandbox.__base = { targets: {}, meals: [], supplements: [], workouts: {}, dinnerPlan: {} };
  const merged = vm.runInContext("mergePlan(__base, __doc)", sandbox);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  console.log("all 7 days in workouts + every meal plan:", days.every((d) => merged.workouts[d] && merged.breakfastPlan[d] && merged.lunchPlan[d] && merged.dinnerPlan[d] && merged.snackPlan[d]));
}
console.log("target week:", doc.targetWeek, "| non-ascii chars:", [...text].filter((c) => c.charCodeAt(0) > 127).length);
console.log("fat/fiber: targets", !!(doc.targets && (doc.targets.fat || doc.targets.fiber)), "| recipes with fat/fiber:", Object.values(doc.recipes || {}).filter((r) => r.fat != null || r.fiber != null).length, "of", Object.keys(doc.recipes || {}).length);
const names = new Set();
Object.values(doc.workouts || {}).forEach((w) => (w.exercises || []).forEach((ex) => names.add(ex.name)));
sandbox.__names = [...names];
const rows = vm.runInContext("__names.map(n => [n, demoLinkFor(n)])", sandbox);
const missing = rows.filter(([, l]) => l.includes("results?search_query")).map(([n]) => n);
console.log(`demo links: ${rows.length - missing.length}/${rows.length} curated; search fallback for: ${missing.join(" | ") || "none"}`);
