# The Long Game

Personal health & fitness PWA — a daily coach for a structured fat-loss and wellness program.
Vanilla JS + Vite, installable on iPhone / iPad / Mac, with a service worker that keeps the
installed app up to date automatically (no more delete-and-reinstall on iOS).

## Prerequisites

Node.js is installed locally at `~/.local/node` (no admin/system install) and added to your PATH
via `~/.zshrc` and `~/.zshenv`. In any new terminal, `node -v` and `npm -v` should just work.

```
node -v   # v24.18.0
npm -v    # 11.16.0
```

## Commands

```bash
npm run dev       # dev server at http://localhost:5173 (also on your LAN IP for phone testing)
npm run build     # production build -> dist/
npm run preview   # serve the production build (this is where the service worker is active)
npm run icons     # regenerate PWA icons in public/ from scripts/gen-icons.mjs
```

> The service worker is intentionally **disabled in `dev`** so code is always fresh while you work.
> Test real install/update behavior with `npm run build && npm run preview`.

## Test on your iPhone / iPad over WiFi

1. `npm run dev` (or `npm run preview`). Vite prints a `Network:` URL like `http://192.168.4.32:5173/`.
2. On the phone (same WiFi), open that URL in Safari.
3. To test the installed experience: Share → **Add to Home Screen**.
4. Only the production build (`preview`) exercises the service worker; the dev server does not.

## How iOS updates are fixed

The old single-file version was cached aggressively by iOS with no way to force an update. This build fixes that with `vite-plugin-pwa` (Workbox):

- **Content-hashed assets + a precache manifest** — every build stamps new filenames, so a new
  deploy always invalidates the old cache.
- **`registerType: 'autoUpdate'` + `skipWaiting` + `clientsClaim`** — a new service worker takes
  over immediately and reloads the page with the new code.
- **Update-on-resume** (`src/main.js`) — iOS keeps installed PWAs suspended and only re-checks for a
  new service worker when asked, so we call `registration.update()` on every `visibilitychange` /
  `focus`, plus hourly. Reopening the app is enough to pull the latest deploy.

Verified end to end: a rebuild propagated to a running install (via an update check, no reinstall)
and swapped in the new code automatically.

## Project layout

```
the-long-game-app/
  index.html            # app shell (head, #app root, module entry)
  vite.config.js        # Vite + PWA (manifest, workbox) config
  src/
    main.js             # entry: styles + app + service-worker registration
    styles.css          # design system + component styles (ported verbatim)
    app.js              # all app logic (ported from the-long-game.html, see fixes below)
  public/               # PWA icons (generated)
  scripts/gen-icons.mjs # icon generator (sharp)
```

## Fixes applied during the port

The original `the-long-game.html` had three defects that were masked in a classic `<script>` but
break under ES-module strict mode. Fixed with no behavior change:

1. `makeWeekStrip` was missing its `function` declaration line (hard syntax error).
2. `scheduleDay`'s 3:30 PM snack reminder had lost its `if(...)` guard (malformed braces).
3. `CI` (weekly check-in draft) was never declared — would throw `ReferenceError` on the Check-In tab.

## Data schema (adopted from live Supabase — canonical)

The live Supabase row (`app_sync`, user `rodney`) is the source of truth, and this code was adapted
to read/write its **camelCase schema** natively:

```
state = {
  days: { 'YYYY-MM-DD': {
    meals: { breakfast|lunch|snack|dinner: { status:"planned"|"eaten", actualCal, actualProtein } },
    water, supplements:{[suppId]:true}, workoutDone:bool, deskBreaksTaken:int
  }},
  weeks, checkIns, groceryState, planStartDate, updatedAt
}
```

Two additions this app writes as **extra fields** (harmlessly ignored by the other app version):
- `meals.*.name` — optional food-diary label carried from accepted suggestions.
- `days.*.workoutLog` — the detailed set-by-set log (reps/weight/notes); `workoutDone` is kept in
  sync as the canonical boolean (true when every set is complete).

`serializeState()` writes only the canonical top-level keys, so no stray fields leak to the row.

### Sync safety gate

`syncEnabled()` allows Supabase **writes only from the real HTTPS deploy**. Localhost and private-LAN
origins (incl. iPhone-over-WiFi dev) **never push** to the shared production row and **never send
ntfy notifications** — local testing can't corrupt live data or spam your phone. Pulling is
read-only and always on, so dev still sees real data. The header shows "Local only" in that mode.

## Deployment — GitHub Pages via GitHub Actions

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `main`. It
derives the correct base path automatically from the repo name (project site → `/<repo>/`, user site
`<user>.github.io` → `/`), so there's nothing to hard-code.

**One-time setup:**
1. Create the GitHub repo and push this project to its `main` branch.
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push (or re-run the workflow). Pages will publish at the URL shown in the Actions run summary.

After that, every `git push` to `main` redeploys, and the service worker delivers the update to your
installed iPhone/iPad/Mac PWAs on next open — no reinstall.

To build a Pages bundle locally for inspection: `VITE_BASE=/<repo>/ npm run build`.
