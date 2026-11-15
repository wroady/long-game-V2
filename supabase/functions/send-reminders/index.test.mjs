// Run: node supabase/functions/send-reminders/index.test.mjs   (Node 22+; imports the .ts directly)
import crypto from 'node:crypto';

let handler;
const ENV = { CRON_SECRET: 'sekret', SUPABASE_URL: 'https://sb.test', SUPABASE_SERVICE_ROLE_KEY: 'svc' };
const ec = crypto.createECDH('prime256v1'); ec.generateKeys();
const vapidPub = ec.getPublicKey().toString('base64url'), vapidPriv = ec.getPrivateKey().toString('base64url');
ENV.VAPID_PUBLIC_KEY = vapidPub; ENV.VAPID_PRIVATE_KEY = vapidPriv;
globalThis.Deno = { env: { get: (k) => ENV[k] }, serve: (h) => { handler = h; } };
const fn = await import('./index.ts');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };

// ── 1. Encryption (RFC 8291), decrypted with node:crypto (independent of the Web Crypto code) ──
const client = crypto.createECDH('prime256v1'); client.generateKeys();
const auth = crypto.randomBytes(16);
const msg = JSON.stringify({ title: '🍴 Lunch', body: 'Log lunch — today’s pick.' });
const enc = Buffer.from(await fn.encryptPayload({ keys: { p256dh: client.getPublicKey().toString('base64url'), auth: auth.toString('base64url') } }, msg));
const salt = enc.subarray(0, 16), idlen = enc[20], asPub = enc.subarray(21, 21 + idlen), ct = enc.subarray(21 + idlen);
const ecdh = client.computeSecret(asPub);
const hk = (s, ikm, info, n) => Buffer.from(crypto.hkdfSync('sha256', ikm, s, info, n));
const ikm = hk(auth, ecdh, Buffer.concat([Buffer.from('WebPush: info\0'), client.getPublicKey(), asPub]), 32);
const cek = hk(salt, ikm, Buffer.from('Content-Encoding: aes128gcm\0'), 16), nonce = hk(salt, ikm, Buffer.from('Content-Encoding: nonce\0'), 12);
const d = crypto.createDecipheriv('aes-128-gcm', cek, nonce); d.setAuthTag(ct.subarray(ct.length - 16));
const plain = Buffer.concat([d.update(ct.subarray(0, ct.length - 16)), d.final()]);
ok(plain.subarray(0, plain.length - 1).toString('utf8') === msg && plain[plain.length - 1] === 2, 'payload decrypts correctly (emoji and curly quote intact)');

// ── 2. VAPID JWT ──
const hdr = await fn.vapidAuthHeader('https://web.push.apple.com/x', vapidPub, vapidPriv, Date.now());
const m = hdr.match(/^vapid t=([^.]+)\.([^.]+)\.([^,]+), k=(.+)$/);
const pb = Buffer.from(vapidPub, 'base64url');
const pk = crypto.createPublicKey({ key: { kty: 'EC', crv: 'P-256', x: pb.subarray(1, 33).toString('base64url'), y: pb.subarray(33).toString('base64url') }, format: 'jwk' });
ok(crypto.verify('sha256', Buffer.from(`${m[1]}.${m[2]}`), { key: pk, dsaEncoding: 'ieee-p1363' }, Buffer.from(m[3], 'base64url')), 'VAPID JWT signature verifies');

// ── 3. Handler: reads only the compact inputs, claims before sending, handles failures ──
const mkSub = (n) => { const c = crypto.createECDH('prime256v1'); c.generateKeys(); return { endpoint: `https://push.test/${'Z'.repeat(30)}${n}`, keys: { p256dh: c.getPublicKey().toString('base64url'), auth: crypto.randomBytes(16).toString('base64url') } }; };
const ph = mkSub('phone'), ip = mkSub('ipad');
const inputs = { planStartDate: '2026-07-05', frozen: false,
  plan: { targets: { prot: 180, water: 110 }, workouts: { Sun:{title:'Rest'},Mon:{title:'Session A'},Tue:{title:'Walk'},Wed:{title:'Walk'},Thu:{title:'Session B'},Fri:{title:'Walk'},Sat:{title:'Ride'} }, supplements: [] },
  pushSubs: { [ph.endpoint]: { sub: ph, label: 'iPhone' }, [ip.endpoint]: { sub: ip, label: 'iPad' } } };
Date.now = () => Date.UTC(2026, 9, 12, 15, 30, 20); // Mon 12 Oct 2026, 11:30:20 ET
const claims = new Set(); const pushes = []; const seen = []; let pushStatus = {};
globalThis.fetch = async (url, init = {}) => {
  url = String(url); seen.push(url);
  if (url === 'https://sb.test/rest/v1/rpc/reminder_inputs') return Response.json(inputs);
  if (url === 'https://sb.test/rest/v1/push_sent' && init.method === 'POST') { const k = JSON.parse(init.body).key; if (claims.has(k)) return Response.json([]); claims.add(k); return Response.json([{ key: k }]); }
  if (url.startsWith('https://sb.test/rest/v1/push_sent?key=eq.') && init.method === 'DELETE') { claims.delete(decodeURIComponent(url.split('key=eq.')[1])); return new Response(null, { status: 204 }); }
  if (url.startsWith('https://push.test/')) { pushes.push(url); return new Response(null, { status: pushStatus[url] || 201 }); }
  throw new Error('unexpected fetch ' + url);
};
const call = (body, secret = 'sekret') => handler(new Request('https://fn.test', { method: 'POST', headers: { 'x-cron-secret': secret }, body: JSON.stringify(body || {}) }));
ok((await call({}, 'wrong')).status === 403, 'wrong secret rejected');
let r = await (await call({})).json();
ok(pushes.length === 2 && r.sent === 2, 'lunch pushed to both devices');
ok(!seen.some((u) => u.includes('/app_sync')), 'never reads the full app_sync row (egress)');
ok(seen.filter((u) => u.endsWith('/rpc/reminder_inputs')).length >= 1, 'reads via reminder_inputs()');
pushes.length = 0; await call({}); ok(pushes.length === 0, 'next minute: nothing sent twice');
claims.clear(); pushes.length = 0; pushStatus[ph.endpoint] = 503; await call({});
pushStatus = {}; pushes.length = 0; await call({});
ok(pushes.length === 1 && pushes[0] === ph.endpoint, 'transient failure releases the claim; retry hits only the failed device');
inputs.frozen = true; inputs.plan.targets.prot = 190; claims.clear(); pushes.length = 0; r = await (await call({})).json();
ok(r.sent === 2, 'works when the week is frozen too');
pushStatus = {}; pushes.length = 0; r = await (await call({ test: true })).json();
ok(r.test && pushes.length === 2, 'test mode reaches every device');
console.log(fails ? `\n${fails} FAILED` : '\nall passed'); process.exit(fails ? 1 : 0);
