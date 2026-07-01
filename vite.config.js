import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const projectRoot = dirname(fileURLToPath(import.meta.url));

// base:
//   - Local dev / preview and a GitHub Pages *user* site (rodney.github.io) => '/'
//   - A GitHub Pages *project* site (rodney.github.io/long-game/) => '/long-game/'
// Set it per-deploy with the VITE_BASE env var, e.g. `VITE_BASE=/long-game/ npm run build`.
export default defineConfig({
  root: projectRoot, // pin root so the app builds/serves correctly regardless of caller cwd
  base: process.env.VITE_BASE || '/',
  server: {
    host: true, // listen on 0.0.0.0 so an iPhone/iPad can reach the dev server over WiFi
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null, // we register the SW ourselves in src/main.js
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'The Long Game',
        short_name: 'Long Game',
        description: "Rodney's personal health & fitness daily coach",
        theme_color: '#1C2620',
        background_color: '#1C2620',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Cache versioning: every build stamps assets with content hashes and a
        // fresh precache manifest, so a new deploy always invalidates the old cache.
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallbackDenylist: [/^\/rest\//], // never serve the app shell for API paths
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      // Keep the service worker OFF during `npm run dev` so the dev server always
      // serves fresh code. Test the real update behavior with `npm run build && npm run preview`.
      devOptions: { enabled: false },
    }),
  ],
});
