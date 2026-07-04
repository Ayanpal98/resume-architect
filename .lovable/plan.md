# Mobile-Friendly UI + PWA Conversion

Two-part scope: (1) global mobile responsiveness audit and fixes, (2) installable PWA with offline support via `vite-plugin-pwa`.

## Part 1 — Mobile UI Polish (Global)

Sweep every page and shared component so the app is usable on phones (≤640px) and tablets (641–1024px).

### Pages to audit and fix
- `src/pages/Index.tsx` (landing)
- `src/pages/Welcome.tsx`
- `src/pages/Auth.tsx`
- `src/pages/Builder.tsx` (heaviest — horizontal editor, live preview drawer)
- `src/pages/ATSAnalysis.tsx`
- `src/pages/Recruiter.tsx`
- `src/pages/CareerIntelligence.tsx`
- `src/pages/DeepImprovement.tsx`
- `src/pages/Security.tsx`, `src/pages/Privacy.tsx`, `src/pages/NotFound.tsx`

### Shared components to audit
`PricingSection`, `ResumeUploader`, `ResumeImport`, `ATSScorePanel`, `ATSScorePreview`, `AISuggestionPanel`, `OptimizationReport`, `ResumeComparison`, `ResumeImprovementPanel`, `CoverLetterGenerator`, `JobMatchPanel`, `CareerRoadmap`, `GhostScreeningPreview`, `SampleReportsShowcase`, `TemplateRecommendation`, `TemplateSelector`, `ComplianceFooter`, `LiveStatsCounter`, `NavLink`.

### Fix categories (per file)
1. **Overflow / horizontal scroll**: replace fixed widths with `w-full max-w-*`, add `min-w-0` on flex children, `overflow-x-auto` on wide tables/preview strips.
2. **Grids**: normalize to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` where currently forced multi-col.
3. **Typography scale**: `text-4xl md:text-5xl lg:text-6xl` for hero H1s; body `text-base md:text-lg`.
4. **Spacing**: `px-4 sm:px-6 lg:px-8`, `py-12 md:py-20` for sections.
5. **Tap targets**: min height `h-11` (44px) on primary buttons/inputs on mobile; `gap-3` minimum between tappable items.
6. **Navigation**: convert desktop horizontal nav in `Index`/nav bar into a hamburger `Sheet` drawer under `md`.
7. **Builder page**: preserve existing mobile FAB preview drawer (already noted in memory); ensure editor form stacks single-column on mobile, sticky action bar at bottom.
8. **Recruiter dashboard**: tables become card list under `md`; horizontal scroll only as fallback.
9. **Pricing tabs**: ensure tab triggers wrap or scroll horizontally; cards stack single-column.
10. **Modals / Sheets**: force `w-full` on mobile, respect safe-area (`pb-[env(safe-area-inset-bottom)]`).
11. **Images**: `max-w-full h-auto`, add `loading="lazy"`.

### Viewport / theming
- `index.html`: viewport already correct; add `viewport-fit=cover` for iOS notch and `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style` meta tags.
- Global `body` gets `overflow-x-hidden` in `src/index.css` as safety net.

## Part 2 — PWA (Installable + Offline)

Follow the Lovable PWA skill: `vite-plugin-pwa` with `generateSW`, guarded registration, NetworkFirst for HTML, CacheFirst for hashed assets.

### Dependencies
- `vite-plugin-pwa` (dev)
- `workbox-window` (runtime, used by wrapper)

### App icon
Generate one 512×512 PNG via `imagegen` in ATSFy brand style (purple→blue gradient, white document/checkmark glyph, rounded square). Derive:
- `public/icon-192.png` (resized copy)
- `public/icon-512.png`
- `public/icon-maskable-512.png` (with safe padding)
- `public/apple-touch-icon.png` (180×180)
- `public/favicon.png` and replace `public/favicon.ico`

### Files to create/edit
- `vite.config.ts` — add `VitePWA({ registerType: "autoUpdate", injectRegister: null, devOptions: { enabled: false }, workbox: { navigateFallback: "/index.html", navigateFallbackDenylist: [/^\/~oauth/], runtimeCaching: [NetworkFirst for navigations excluding /~oauth, CacheFirst for same-origin hashed assets, NetworkFirst for Supabase/API calls with short TTL], globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"] }, manifest: {...} })`.
- `public/manifest.webmanifest` handled by plugin; manifest fields: `name: "ATSFy — Career Intelligence"`, `short_name: "ATSFy"`, `description`, `start_url: "/"`, `scope: "/"`, `display: "standalone"`, `orientation: "portrait"`, `theme_color: "#1e3a8a"`, `background_color: "#ffffff"`, icons array (192, 512, 512 maskable), `categories: ["business","productivity"]`.
- `src/pwa/registerSW.ts` — guarded wrapper: refuses in dev, in iframe, on `id-preview--*` / `preview--*` / `lovableproject.com` / `lovableproject-dev.com` / `beta.lovable.dev` hosts, or with `?sw=off`. Unregisters existing `/sw.js` in refused contexts. Otherwise uses `workbox-window` to register `/sw.js` with autoUpdate.
- `src/main.tsx` — import and invoke `registerSW()` after render.
- `index.html` — add manifest link, theme-color, apple-touch-icon, apple-mobile-web-app-* meta tags.

### Optional install prompt
Small `InstallPrompt` component listening for `beforeinstallprompt`, showing a subtle "Install app" button on mobile (dismissable, remembered in `localStorage`). Only rendered on `Index` page, hidden on installed (`display-mode: standalone`).

## Deliverables

Files edited:
- `index.html`, `src/index.css`, `src/main.tsx`, `vite.config.ts`, `package.json` (via `bun add`)
- All page files listed above
- All shared components listed above

Files created:
- `src/pwa/registerSW.ts`
- `src/components/InstallPrompt.tsx`
- `public/icon-192.png`, `public/icon-512.png`, `public/icon-maskable-512.png`, `public/apple-touch-icon.png`, `public/favicon.png`
- Generated brand icon under `src/assets/atsfy-icon.png` (source)

Files removed:
- `public/favicon.ico`

## Notes for the user

- Offline mode only activates on the **published** app, not inside the Lovable preview (per PWA guardrails).
- After installing to home screen, iOS/Android cache manifest fields at install time — later changes to `start_url` / `scope` may require reinstall.
- No backend/business logic changes; edits stay in presentation layer + PWA config.
