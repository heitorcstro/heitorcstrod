<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture decisions

### PWA / offline support
- The service worker (`/sw.js`) is **generated** by `vite-plugin-pwa`
  (`generateSW`) — never hand-written in `public/`. Do not add a manual
  `public/sw.js`.
- Registration happens only from the single guarded wrapper
  `src/lib/register-sw.ts`, wired in via `__root.tsx` (`useEffect` + dynamic
  import so it stays out of SSR). The wrapper refuses to register in dev,
  inside an iframe, on Lovable preview/published hostnames, or with `?sw=off`,
  and unregisters a stale `/sw.js` in those contexts.
- Strategy: `NetworkFirst` for HTML/navigations (never cache-first), `CacheFirst`
  only for same-origin hashed assets and Google Fonts. `navigateFallback` is
  disabled because this is an SSR app with no static app shell. `/~oauth` and
  `/api/` are excluded from navigation fallback.
