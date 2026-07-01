// ── ENTRY POINT ─────────────────────────────────────────────────────────────
// Loads styles, boots the app, and registers the service worker that keeps the
// installed iOS/iPadOS PWA up to date without a manual delete-and-reinstall.

import './styles.css';
import { registerSW } from 'virtual:pwa-register';
import './app.js';

// registerType is 'autoUpdate' (see vite.config.js): when a new build is deployed,
// Workbox precaches the new content-hashed assets, skipWaiting activates the new
// service worker, and registerSW reloads the page to pick it up. The manual
// update() checks below are what make this reliable on iOS specifically — iOS
// keeps installed PWAs suspended in the app switcher and only re-checks for a new
// service worker when we explicitly ask, so we ask every time the app is resumed.
const updateSW = registerSW({
  immediate: true,
  onRegisteredSW(swUrl, registration) {
    if (!registration) return;
    const checkForUpdate = () => { registration.update().catch(() => {}); };
    // Foreground / resume — the key trigger for installed iOS PWAs.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkForUpdate();
    });
    window.addEventListener('focus', checkForUpdate);
    // Belt-and-suspenders: also check hourly while the app stays open.
    setInterval(checkForUpdate, 60 * 60 * 1000);
  },
});
