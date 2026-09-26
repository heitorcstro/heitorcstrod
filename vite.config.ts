// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // Additional Vite plugins (the Lovable preset plugins are merged in automatically).
  plugins: [
    VitePWA({
      // Generate the service worker from Workbox config (never hand-write public/sw.js).
      strategies: "generateSW",
      filename: "sw.js",
      registerType: "autoUpdate",
      // The plugin must NOT inject its own registration: our guarded wrapper is the only registrar.
      injectRegister: null,
      // No service worker in dev — protects the Lovable preview from stale caches.
      devOptions: { enabled: false },
      includeAssets: [
        "favicon.png",
        "drag-icon.png",
        "manifest.webmanifest",
        "icons/*.png",
        "splash/*.png",
      ],
      workbox: {
        // Precache built assets (hashed JS/CSS/images/fonts/webmanifest).
        globPatterns: ["**/*.{js,css,svg,png,ico,webmanifest,woff2,woff}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // SSR app: there is no static index.html app shell, so do not redirect
        // navigations to a fallback. Each route is cached via NetworkFirst below.
        navigateFallback: null,
        navigateFallbackDenylist: [/^\/~oauth/, /^\/api\//],
        runtimeCaching: [
          {
            // HTML / navigations: fresh when online, cached copy when offline.
            // Never cache-first for HTML (safety rule from the PWA skill).
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "nirvana-html",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Same-origin hashed build assets: cache-first is safe (filenames are content-hashed).
            urlPattern: ({ request, url }) =>
              url.origin === self.location.origin &&
              ["style", "script", "worker", "image", "font"].includes(
                request.destination,
              ),
            handler: "CacheFirst",
            options: {
              cacheName: "nirvana-assets",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts (cross-origin): cache-first with long TTL.
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "nirvana-fonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
