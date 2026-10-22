# haruna_db_2023

A Vue 3.5 PWA for image/video storage, AI translation, and hierarchical web bookmarks,
backed by Supabase and hosted on Firebase. Named after the
[battleship Haruna](https://en.wikipedia.org/wiki/Japanese_battleship_Haruna).

## UI library

[Haruna UI](doc/haruna-ui-lib.md) is the app-owned library in [src/libs/ui](src/libs/ui).
It defines component APIs, flat styling, theme tokens, CSS integration, and maintenance.
Ten device-local themes include Haruna/Classic light and dark, Legacy, four Catppuccin
palettes, and Tokyo Night; see the guide for theme behavior and sources.

## System requirement

Use Node.js 26.x (see [.nvmrc](.nvmrc)), npm, and Docker for local Supabase.
Production targets Chrome/Edge 111+, Firefox 114+, and Safari 16.4+ (Vite 8 defaults).
TypeScript stays on 6.0 because `vue-tsc` needs compiler APIs absent from 7.0;
see [Microsoft's compatibility guidance](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/).

## Project setup for development

Run from the repository root:

```sh
npx supabase start
npm install
npm run dev
```

In a separate terminal, serve Edge Functions:

```sh
supabase functions serve --env-file ./supabase/functions/.env.local
```

Keep frontend and Edge Functions running while developing features that use them.

## Regenerate PWA assets

After changing [the logo](src/assets/logo.svg), run:

```sh
npm run generate:pwa-assets
npx --no-install prettier --write index.html
```

[pwa-asset-generator](https://github.com/elegantapp/pwa-asset-generator) creates maskable
192px/512px icons, an Apple touch icon, PNG favicon, and light/dark portrait/landscape
Apple launch images in `public/pwa/`; it updates `index.html`, not the manifest in
`vite.config.ts`. Commit generated assets and declarations. It uses local Chrome
or downloads compatible Chromium. If Linux cannot sandbox Chromium, explicitly run
`PWA_ASSETS_NO_SANDBOX=1 npm run generate:pwa-assets` with the trusted local SVG.

Launch screens use static branding and device light/dark preference; the saved app
theme applies after startup. Refresh cached iOS launch images by removing/re-adding
the home-screen installation. The service worker precaches generated PNG/JPEG assets.

## Application tests

Vitest, Vue Test Utils, and jsdom run components, services, Pinia, and workflows in
memory. Install dependencies with `npm ci`; no environment files, credentials,
Docker, Supabase, backend, or development server are needed or permitted.
Installation downloads packages; tests require no application network access.

### Setup and commands

```sh
npm test -- tests/modules/translation  # Focused tests; substitute affected paths
npm test -- -t "clears loading"       # Filter by behavior
npm run test:watch -- tests/modules/translation
npm run type-check                    # Entire application and test projects
npm test                              # Full suite
npm run test:coverage                  # Console, HTML, LCOV in coverage/
```

Format only changed files with `npx --no-install prettier --write <changed-files>`
using explicit paths, not repository-wide `npm run format`. Run affected tests and
consumers; use the full suite for broad changes or explicit requests. Type-check
TypeScript/Vue changes and run coverage for harness/coverage changes. Documentation-only
changes require formatting, not application tests/type checking. Fix introduced
failures without weakening isolation; report checks run/skipped with reasons.

Coverage includes untested source, has no initial percentage gate, and excludes
generated database types, bootstrap/root routing, and the real backend adapter.
Reports in `coverage/` (including `index.html`) are Git-ignored.

### Structure and adding tests

Tests mirror source under `tests/modules/`, `tests/ports/` (pure helpers/DOM),
and `tests/libs/ui/`. `tests/setup.ts` supplies fresh Pinia, browser compatibility,
mocks, and cleanup; `tests/support/` holds mounting helpers, guards, and isolation
self-tests. Deterministic records live in `tests/factories/Records.ts` (no database
seeders); fakes live in `tests/fakes/`.

- Name files `*.test.ts`, group with `describe("ClassOrComponent", ...)`, and assert
  observable success/failure, empty/loading states, navigation, and payloads.
  Avoid private-method tests and broad snapshots; add regression tests for bugs.
- Inject service dependencies. Import `makeBackendFake`, `queryResult/queryError`
  from `tests/fakes/BackendFake.ts`, collaborators such as `makeToast` from
  `tests/fakes/Collaborators.ts`, and record builders using relative paths.
  `backend.query(queryResult([makeMedia()]))` queues the next `.from(...)` result;
  chains record arguments without emulating SQL/RLS. Explicitly configure
  `backend.get/post`, `auth`, and `storage`; use `BackendApiResult.ok/err` for Custom API results.
- Use `appMountOptions()` from `tests/support/mountApp.ts` for Pinia, Haruna UI,
  and targeted stubs. Workflow tests mock container factories to connect real
  services/stores to fake dependencies; isolated UI tests may use service doubles.
  Validate with real Haruna controls. Stub native Ionic/browser behavior only when
  irrelevant; follow [UI verification](doc/haruna-ui-lib.md#verification) for overlays/layout.
- Await async work, unmount components, and stop service watchers in `finally`
  where appropriate. Setup disposes Pinia and resets DOM, storage, timers, and mocks;
  isolate additional side effects equally.

### Network safety and boundaries

- Backend singleton imports are mocked and real Supabase construction is guarded;
  no sessions are read/refreshed. Never bypass guards with `vi.unmock`,
  `vi.importActual`, direct SDK construction, or imports of `src/main.ts`.
- Configure all API/database/auth/storage/function responses in memory.
  Unconfigured operations fail teardown even when application code catches them.
- Network transports (browser and Node), workers, and localhost are blocked;
  jsdom loads no external images/styles/scripts. Keep FFmpeg downloads, PWA
  registration, browser downloads, and other external side effects mocked.
- Never restore transports or use subprocesses to reach services; extend fakes.
  Never read development/production environment files or credentials; Vitest
  disables environment-file loading and provides dummy endpoints/keys.
  Only isolation self-tests may consume expected guard violations.
- Guards prevent accidental I/O, not arbitrary code at the OS level. These tests
  do not validate migrations, RLS, Edge Functions, server contracts, browser layout,
  PWA installability, or browser end-to-end behavior.

## Release

Build production, then deploy Firebase Hosting:

```sh
npx vite build --mode production
firebase deploy --only hosting
```
