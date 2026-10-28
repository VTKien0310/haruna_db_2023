# haruna_db_2023

A Vue 3.5 PWA for image/video storage, AI translation, and hierarchical web bookmarks,
backed by Supabase and hosted on Firebase. Named after the
[battleship Haruna](https://en.wikipedia.org/wiki/Japanese_battleship_Haruna).

## UI library

[Haruna UI](doc/design-and-decision/haruna-ui-lib.md) is the app-owned library in [src/libs/ui](src/libs/ui).
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

Install dependencies with `npm ci`; no environment files, credentials, Docker,
Supabase, backend, or development server are needed or permitted. Test layout,
fakes, isolation, and coverage rules are in
[Application tests](doc/design-and-decision/application-tests.md).

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

## Release

Build production, then deploy Firebase Hosting:

```sh
npx vite build --mode production
firebase deploy --only hosting
```

## Conventions and standards

- [Coding](./doc/conventions-and-standards/coding.md)
- [Git](./doc/conventions-and-standards/git.md)

## Design and decision documentation

Documentation for design and decision reasoning is available in the [doc/design-and-decision](doc/design-and-decision)
directory.
