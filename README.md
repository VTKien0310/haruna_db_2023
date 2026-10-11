# haruna_db_2023

## About

A multipurpose application for everyday use. The application currently provides:

- Images and videos storage
- AI-powered translation
- Web bookmarks management

The application's namesake is derived from the
battleship [Haruna](https://en.wikipedia.org/wiki/Japanese_battleship_Haruna).

## Project specification

- Vue 3.3
- Supabase BaaS
- Firebase hosting
- PWA

## System requirement

- Node.js 24.x
- npm package manager
- Docker

## Project setup for development

### Start local Supabase environment

```sh
npx supabase start
```

### Install dependencies

```sh
npm install
```

### Start development server

```sh
npm run dev
```

### Start Edge functions

```sh
supabase functions serve --env-file ./supabase/functions/.env.local
```

## Application tests

Tests run entirely in memory with Vitest, Vue Test Utils, and jsdom. They cover
Vue components, application services, Pinia state, and workflows across auth,
gallery, translation, bookmarks, and shared services. The separate test tree and
shared fixture/fake conventions.

### Setup and commands

Use Node.js 24.x and npm. For testing, install dependencies only:

```sh
npm ci
npm test
```

No environment files, credentials, Docker, Supabase, backend server, or development
server are required. Dependency installation downloads npm packages; running the
tests does not require application network access.

```sh
npm run test:watch       # Re-run affected tests while editing
npm run test:coverage    # Console summary, HTML and LCOV in coverage/
npm test -- tests/modules/translation
npm test -- -t "clears loading"
npm run format
npm run type-check       # Check both application and test TypeScript
```

Open `coverage/index.html` for the HTML report. Coverage includes untested source
files so gaps remain visible; there is no initial percentage gate. Generated
database types, app bootstrap/root routing, and the real backend adapter are
excluded. Coverage artifacts are ignored by Git.

### Structure and adding tests

```text
tests/
  setup.ts             # Isolation, fresh Pinia, browser compatibility, cleanup
  modules/             # Mirrors src/modules/, including services/pages/components
  ports/               # Pure backend result helpers and browser DOM behavior
  factories/           # Deterministic typed records; no database factories/seeders
  fakes/               # Backend, router, notifications, PWA and other doubles
  support/             # Mount helpers, network guards and isolation self-tests
```

Name files `*.test.ts` and group cases with `describe("ClassOrComponent", ...)`.
Assert behavior (rendered state, navigation, payloads, errors, loading cleanup),
not private methods or broad snapshots. Mount real Vuestic form controls when
testing validation. Use targeted Ionic/modal/browser stubs when their native
environment is irrelevant; these tests do not prove browser layout or PWA
installability.

Service tests inject dependencies and use the fresh active Pinia provided by
setup. For example:

```ts
const backend = makeBackendFake();
const toast = makeToast();
const service = new GalleryListService(backend.port, toast.service);
const query = backend.query(queryResult([makeMedia()]));

await service.fetchMedias();

expect(query.order).toHaveBeenCalledWith("created_at", { ascending: false });
expect(useGalleryListStore().medias).toHaveLength(1);
```

Import those helpers from `tests/fakes/BackendFake.ts`,
`tests/fakes/Collaborators.ts`, and `tests/factories/Records.ts` using paths relative
to your test. Each `backend.query(...)` configures the next `.from(...)` call;
query chains record arguments and return the supplied response without emulating
database behavior. Configure `backend.get/post`, `backend.auth`, and
`backend.storage` explicitly for each scenario. Use `BackendApiResult.ok/err`
for custom API results and `queryResult/queryError` for Supabase-shaped results.

For component tests, use `appMountOptions()` from `tests/support/mountApp.ts`,
which supplies the active Pinia, Vuestic plugin, and targeted stubs. Mock service
container factories to inject real services with fake dependencies for workflow
tests, or focused service doubles for isolated UI tests. Stop service-owned
watchers explicitly in `finally` blocks and await asynchronous work before a test
ends. Setup unmounts components, disposes Pinia, and resets storage, timers, and
mocks.

### Network safety and boundaries

- The real `BackendPort` singleton is mocked before import. A separate guard
  rejects real Supabase client construction. No sessions are read or refreshed.
- All API, database, auth, storage, and function calls use explicit in-memory
  responses. Unconfigured fake operations throw and fail teardown even if the app
  catches the exception.
- Browser fetch/XHR/WebSocket/EventSource/beacon, workers, and Node HTTP/socket
  transports are blocked, including localhost. jsdom does not load external
  images, stylesheets, or scripts. FFmpeg downloads and PWA registration are faked.
- Never unmock the backend/client, restore real transports, run external processes
  to access services, or bypass guards to make a test pass. Extend fakes instead.
  The guards prevent accidental application I/O; they are not an OS security
  sandbox for arbitrary test code.
- Supabase migrations, RLS, Edge Function implementations, live backend contracts,
  and browser end-to-end tests are outside this suite. A passing test verifies the
  application's response to fake results, not server behavior.

## Release

### Build for production

```sh
npx vite build --mode production
```

### Deploy to Firebase hosting

```sh
firebase deploy --only hosting
```
