// Sends The Long Game's daily reminders as Web Push notifications.
// Runs every minute (pg_cron -> pg_net -> this function). For each reminder that is due, it sends to
// every device that turned reminders on (state.pushSubs in the app_sync row), claiming each
// (reminder, device) pair in the push_sent table first so nothing is ever sent twice.
// No dependencies: Web Push (RFC 8291 encryption + RFC 8292 VAPID) is done with standard Web Crypto.
//
// Secrets: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, CRON_SECRET (SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY are provided automatically).
// Manual test: POST {"test":true} with the same headers the cron uses -> sends a test notification
// to every enabled device.

const TZ = "America/Detroit";
const USER_ID = "rodney";
const SUBJECT = "https://wroady.github.io/long-game-V2/";
const GRACE_SEC = 10 * 60; // a reminder still goes out up to 10 min late if a tick was missed
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_FULL: Record<string, string> = { Sun: "Sunday", Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday" };
const EMOJI: Record<string, string> = { sunny: "☀️", pill: "💊", fork_and_knife: "🍴", peanuts: "🥜", crescent_moon: "🌙", memo: "📝" };

// ── Time helpers (America/Detroit, DST-aware via Intl) ─────────────────────────
function etParts(utcMs: number) {
  const p = new Intl.DateTimeFormat("en-US", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date(utcMs));
  const o: Record<string, string> = {};
  for (const { type, value } of p) o[type] = value;
  return { y: +o.year, mo: +o.month, d: +o.day, h: +(o.hour === "24" ? "0" : o.hour), mi: +o.minute };
}
const iso = (y: number, mo: number, d: number) => `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
function todayKeyET(nowMs: number) { const p = etParts(nowMs); return iso(p.y, p.mo, p.d); }
function weekdayIndexET(nowMs: number) { return DAYS.indexOf(new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" }).format(new Date(nowMs))); }
// Unix seconds for today's HH:MM in ET (tries EDT/EST offsets and round-trips).
function etEpochToday(nowMs: number, hh: number, mm: number) {
  const { y, mo, d } = etParts(nowMs);
  for (const off of [4, 5]) {
    const utcMs = Date.UTC(y, mo - 1, d, hh + off, mm, 0);
    const p = etParts(utcMs);
    if (p.h === hh && p.mi === mm && p.d === d) return Math.floor(utcMs / 1000);
  }
  return Math.floor(Date.UTC(y, mo - 1, d, hh + 4, mm, 0) / 1000);
}
function weekSundayKey(nowMs: number) {
  const { y, mo, d } = etParts(nowMs);
  const dt = new Date(Date.UTC(y, mo - 1, d - weekdayIndexET(nowMs)));
  return iso(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}
function weekStartOf(dateStr: string) {
  const [Y, M, D] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(Y, M - 1, D));
  dt.setUTCDate(dt.getUTCDate() - dt.getUTCDay());
  return iso(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}
function programWeek(planStartDate: string | undefined, wkKey: string) {
  if (!planStartDate) return 1;
  const ms = Date.parse(wkKey + "T00:00:00Z") - Date.parse(weekStartOf(planStartDate) + "T00:00:00Z");
  return Math.max(1, Math.round(ms / (7 * 86400000)) + 1);
}

// ── Today's plan and reminder list (same content the ntfy scheduler used) ──────
function resolvePlan(state: any, nowMs: number) {
  const wk = weekSundayKey(nowMs);
  if (state?.planWeeks?.[wk]) return state.planWeeks[wk];
  if (state?.activePlan) {
    const pw = programWeek(state.planStartDate, wk);
    const p = { ...state.activePlan };
    p.supplements = (p.supplements || []).filter((s: any) => (s.introWeek || 1) <= pw);
    return p;
  }
  return null;
}
export function buildNotifications(plan: any, nowMs: number) {
  const dayAbbr = DAYS[weekdayIndexET(nowMs)];
  const tomorrow = DAYS[(weekdayIndexET(nowMs) + 1) % 7];
  const out: any[] = [];
  if (!plan) {
    out.push({ hh: 6, mm: 15, tag: "memo", title: "The Long Game", body: `${DAY_FULL[dayAbbr]} — open the app to set up today.` });
    return out;
  }
  const targets = plan.targets || { prot: 160, water: 80 };
  const workoutTitle = plan.workouts?.[dayAbbr]?.title || "Rest / mobility";
  const supps = (plan.supplements || []).slice().sort((a: any, b: any) => (a.tMin || 0) - (b.tMin || 0));

  const first = supps[0];
  let summary = `${DAY_FULL[dayAbbr]}. Today: ${workoutTitle}. Protein ${targets.prot}g · water ${targets.water}oz.`;
  if (first) summary += ` First: ${first.label}${first.time ? " (" + first.time + ")" : ""}.`;
  out.push({ hh: 6, mm: 15, tag: "sunny", title: "Good morning", body: summary });

  const stacks = [
    { name: "Morning supplements", lo: 420, hi: 660 },
    { name: "Midday supplements", lo: 661, hi: 960 },
    { name: "Evening supplements", lo: 961, hi: 1229 },
  ];
  for (const st of stacks) {
    const inStack = supps.filter((s: any) => s.tMin > st.lo - 1 && s.tMin <= st.hi);
    if (!inStack.length) continue;
    const sendMin = inStack[0].tMin;
    out.push({ hh: Math.floor(sendMin / 60), mm: sendMin % 60, tag: "pill", title: st.name, body: inStack.map((s: any) => s.label).join(" · ") });
  }
  out.push({ hh: 11, mm: 30, tag: "fork_and_knife", title: "Lunch", body: "Log lunch and see today’s recommended prep option." });
  out.push({ hh: 15, mm: 30, tag: "peanuts", title: "Snack", body: "Snack time — open The Long Game for today’s pick (~30g protein)." });

  const bedSupps = supps.filter((s: any) => s.tMin >= 1230);
  const tomorrowTitle = plan.workouts?.[tomorrow]?.title || "Rest / mobility";
  let evening = bedSupps.length ? `${bedSupps.map((s: any) => s.label).join(" · ")}. ` : "";
  evening += `Tomorrow: ${tomorrowTitle}.`;
  out.push({ hh: 21, mm: 0, tag: "crescent_moon", title: "Wind down", body: evening });
  return out;
}

// Reminders due right now: [{claim, payload}] — one per (reminder, device). Pure; the caller claims + sends.
export function dueReminders(state: any, nowMs: number) {
  const subs = Object.values(state?.pushSubs || {}).filter((r: any) => r?.sub?.endpoint && !r.off) as any[];
  const notes = buildNotifications(resolvePlan(state, nowMs), nowMs);
  const nowSec = Math.floor(nowMs / 1000);
  const today = todayKeyET(nowMs);
  const out: any[] = [];
  for (const n of notes) {
    const at = etEpochToday(nowMs, n.hh, n.mm);
    if (nowSec < at || nowSec > at + GRACE_SEC) continue;
    const slot = `${String(n.hh).padStart(2, "0")}:${String(n.mm).padStart(2, "0")} ${n.title}`;
    const payload = { title: `${EMOJI[n.tag] || ""} ${n.title}`.trim(), body: n.body, tag: `tlg-${today}-${slot.replace(/\W+/g, "-")}` };
    for (const r of subs) out.push({ claim: `${today}|${slot}|${r.sub.endpoint.slice(-24)}`, device: r.label || "device", sub: r.sub, payload });
  }
  return out;
}

// ── Web Push: RFC 8291 (aes128gcm) encryption + RFC 8292 (VAPID), Web Crypto only ─
const te = new TextEncoder();
const b64uToBytes = (s: string) => { const p = "=".repeat((4 - (s.length % 4)) % 4); const bin = atob((s + p).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(bin, (c) => c.charCodeAt(0)); };
const bytesToB64u = (b: Uint8Array) => btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const concat = (...a: Uint8Array[]) => { const o = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let i = 0; for (const x of a) { o.set(x, i); i += x.length; } return o; };

async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, len: number) {
  const k = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, k, len * 8));
}
export async function encryptPayload(sub: { keys: { p256dh: string; auth: string } }, plaintext: string) {
  const uaPublic = b64uToBytes(sub.keys.p256dh);
  const authSecret = b64uToBytes(sub.keys.auth);
  const as = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey("raw", as.publicKey));
  const uaKey = await crypto.subtle.importKey("raw", uaPublic, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const ecdh = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, as.privateKey, 256));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const ikm = await hkdf(authSecret, ecdh, concat(te.encode("WebPush: info\0"), uaPublic, asPublic), 32);
  const cek = await hkdf(salt, ikm, te.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, te.encode("Content-Encoding: nonce\0"), 12);
  const aes = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const body = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aes, concat(te.encode(plaintext), Uint8Array.of(2))));
  return concat(salt, Uint8Array.of(0, 0, 0x10, 0), Uint8Array.of(asPublic.length), asPublic, body); // salt | record size 4096 | key id | ciphertext
}
export async function vapidAuthHeader(endpoint: string, pub: string, priv: string, nowMs: number) {
  const pubBytes = b64uToBytes(pub);
  const jwk = { kty: "EC", crv: "P-256", x: bytesToB64u(pubBytes.slice(1, 33)), y: bytesToB64u(pubBytes.slice(33, 65)), d: priv, ext: true };
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const head = bytesToB64u(te.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const claims = bytesToB64u(te.encode(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(nowMs / 1000) + 12 * 3600, sub: SUBJECT })));
  const sig = new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, te.encode(`${head}.${claims}`)));
  return `vapid t=${head}.${claims}.${bytesToB64u(sig)}, k=${pub}`;
}
async function sendPush(sub: any, payload: unknown, pub: string, priv: string) {
  try {
    const res = await fetch(sub.endpoint, {
      method: "POST",
      headers: { Authorization: await vapidAuthHeader(sub.endpoint, pub, priv, Date.now()), "Content-Encoding": "aes128gcm", "Content-Type": "application/octet-stream", TTL: "1800", Urgency: "normal" },
      body: await encryptPayload(sub, JSON.stringify(payload)),
    });
    return res.ok ? "ok" : String(res.status);
  } catch (e) { return "error: " + (e as Error).message; }
}

// ── Handler ────────────────────────────────────────────────────────────────────
async function handle(req: Request) {
  const env = (k: string) => (globalThis as any).Deno.env.get(k) as string;
  if (req.headers.get("x-cron-secret") !== env("CRON_SECRET") || !env("CRON_SECRET")) return new Response("forbidden", { status: 403 });
  const base = env("SUPABASE_URL") + "/rest/v1";
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  const H = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  const pub = env("VAPID_PUBLIC_KEY"), priv = env("VAPID_PRIVATE_KEY");

  const r = await fetch(`${base}/app_sync?user_id=eq.${USER_ID}&select=state`, { headers: H });
  if (!r.ok) return new Response("state read failed: " + r.status, { status: 500 });
  const rows = await r.json();
  const state = rows?.[0]?.state;
  const body = await req.json().catch(() => ({}));
  const log: string[] = [];

  if (body?.test) {
    for (const s of Object.values(state?.pushSubs || {}).filter((x: any) => x?.sub && !x.off) as any[]) {
      log.push(`${s.label || "device"}: ${await sendPush(s.sub, { title: "The Long Game", body: "Test reminder — notifications are working on this device.", tag: "tlg-test-" + Date.now() }, pub, priv)}`);
    }
    return Response.json({ test: true, log });
  }

  for (const d of dueReminders(state, Date.now())) {
    // Claim first: the insert only succeeds for whichever run gets there first, so a reminder is never sent twice.
    const c = await fetch(`${base}/push_sent`, { method: "POST", headers: { ...H, Prefer: "resolution=ignore-duplicates,return=representation" }, body: JSON.stringify({ key: d.claim }) });
    const claimed = c.ok ? await c.json() : [];
    if (!claimed.length) continue;
    const res = await sendPush(d.sub, d.payload, pub, priv);
    log.push(`${d.claim}: ${res}`);
    if (res !== "ok" && !["403", "404", "410"].includes(res)) await fetch(`${base}/push_sent?key=eq.${encodeURIComponent(d.claim)}`, { method: "DELETE", headers: H }); // transient failure: release the claim so the next minute retries
  }
  return Response.json({ sent: log.length, log });
}

if (typeof (globalThis as any).Deno !== "undefined") (globalThis as any).Deno.serve(handle);
