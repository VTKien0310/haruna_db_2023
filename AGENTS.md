# HarunaDB Development Guide

## Project and Working Principles

Haruna DB is a PWA. Stack: Vue 3 + TypeScript, Ionic Vue 9,
Haruna UI, Tailwind CSS 4, Pinia 4, Vue Router 5 via `@ionic/vue-router`,
Supabase + Custom API, Firebase Hosting; utilities include VueUse, dayjs, and FFmpeg WASM.

- Prioritize security, simplicity, maintainability, then consistency with existing
  code. Follow Vue and Ionic best practices; prefer explicit, readable solutions.
- Make the smallest change that fully solves the task. Avoid speculative
  abstractions, unjustified dependencies, and unrequested architectural changes.
- Ask when requirements conflict, security/backend responsibilities are unclear,
  or changes could affect authentication, authorization, or data access rules.
  Clarify uncertainty before risky or irreversible changes.
- Match existing style; remove dead code, commented-out code, and placeholders
  unless explicitly requested. Extract shared logic when justified.

## Development

Run commands from the repository root. Follow [development setup](README.md#project-setup-for-development):
start Supabase, install dependencies, start the frontend, and serve Edge Functions
with the documented local environment file. Keep frontend and Edge Function
processes running when developing features that use them.

For application tests, use `npm ci` if dependencies are needed, then
`npm test -- <test-paths>`. No environment files, credentials, Docker, Supabase,
backend, or development server are needed or permitted for this suite.

## Architecture and Backend Boundaries

- Keep features self-contained in `src/modules/<module>/` with routing, pages,
  components, services, stores, entities, types, and service containers.
  `src/libs/ui/` owns reusable UI; `src/ports/` owns infrastructure adapters,
  including `backend/` and browser utilities in `dom/`.
- Services are plain TypeScript classes with constructor dependency injection.
  Factories in `*ServiceContainer.ts` wire dependencies and return a new instance
  on every call. Services access stores via `use*Store()`.
- Pinia stores use setup-style `defineStore` and expose `ref<T>()` and `computed()`
  state only: no actions or getters. Business logic belongs in services, not
  stores or page components. Do not use composables returning reactive state.
- Use `Promise<boolean>` or `void` for service control flow; do not throw for
  expected failures. Show user-facing errors through toast notifications.
- All backend access goes through `backendPort` from
  `@/ports/backend/BackendPort.ts`. Prefer `backendPort.spbClient` for native
  CRUD, authentication, storage, and lightweight Edge Functions; type database
  queries with generated `Database` types. Destructure `{ data, error }` and
  check `if (error || !data)`.
- Invoke Edge Functions with `backendPort.spbClient.functions.invoke()`;
  implementations live in `supabase/functions/` and run on Deno.
- Use `backendPort.get<T>()` / `post<T>()` for heavy computation, complex
  orchestration, or dedicated-server needs when Edge Function cold starts,
  compute limits, or complexity make Supabase unsuitable. The port injects the
  Supabase session as Bearer auth. Handle expected errors with
  `BackendApiResult<T, E>` (`isOk`, `isErr`, `map`, `flatMap`, `unwrap`, `unwrapOr`,
  `unwrapErr`).

## Frontend Standards

- Use TypeScript (`.ts`) and exclusively `<script setup lang="ts">` with inline
  Vue templates; no Options API, regular script blocks, or separate HTML files.
  Prefer strong types; avoid `any`.
- Keep components lean. Use `ref<T>()`, `reactive<T>()`, and `computed()` for local
  state; clean up watchers and side effects. Use Ionic lifecycle hooks such as
  `onIonViewDidEnter` / `onIonViewWillLeave` for page-level concerns.
- Use module-scoped routing with exported route-name enums and lazy-loaded pages.
- Use dayjs with the UTC plugin for all date handling.
- Naming: `{Module}Page.vue`, descriptive component names,
  `{Module}{Action}Service.ts`, `{Module}Store.ts`, `{Module}Router.ts` with
  `{Module}RouteName`, `{Module}Entities.ts` for interfaces/enums/constants,
  `{Module}Types.ts` for DTOs/form types, and `{Module}ServiceContainer.ts`.
  Use dot-separated route names (`gallery.list`), kebab-case store IDs (`gallery-list`), and `SCREAMING_SNAKE_CASE`
  constants.

## UI, Styling, and PWA

- Read and follow the [Haruna UI guide](doc/design-and-decision/haruna-ui-lib.md) for UI or styling
  work, including supported APIs, design conventions, implementation boundaries,
  provenance, and maintenance. Keep library-specific documentation there.
- Use Haruna controls from `@/libs/ui` (such as `HButton`, `HInput`, `HForm`,
  `HSelect`) instead of raw application controls; use Ionic components where
  appropriate. Library primitives may use native elements for semantics and
  accessibility.
- Prefer Tailwind utilities in templates and minimal scoped CSS. Reuse existing
  `@theme static` tokens, breakpoints, grids, font classes, and utilities in
  `src/libs/ui/styles/ui.css`; do not introduce one-off colors or magic numbers.
- `src/main.css` imports/registers external fonts, Tailwind, Ionic, and Haruna UI;
  keep Ionic selectors and `--ion-*` mappings there. Haruna's shared stylesheet
  owns app theme tokens, resets, font classes, and shared utilities, without
  external package imports or framework-specific selectors/variables. Follow
  [CSS integration rules](doc/design-and-decision/haruna-ui-lib.md#css-integration) for import order
  and runtime tokens.
- Preserve responsive mobile/desktop layouts, touch-friendly interaction, mobile
  performance, unstable-network handling, and clear loading/empty/error states.
  Preserve manifest installability and the `vite-plugin-pwa` `generateSW` setup.

## Security

Security conventions are defined in
[`doc/conventions-and-standards/security.md`](doc/conventions-and-standards/security.md).

## Testing and Validation

Use Vitest, Vue Test Utils, and jsdom. Follow
[application tests](doc/conventions-and-standards/application-tests.md) and run commands
from the [README](README.md#setup-and-commands).

Name tests `*.test.ts`, group with `describe("ClassOrComponent", ...)`, and assert
observable success, failure, empty, and loading behavior rather than private
details or broad snapshots. Add regression tests for bug fixes; update guidance
when the harness changes.

Use real Haruna controls for validation, `appMountOptions()` for components, and
constructor injection for services. Workflow tests connect real services and
stores to fake backends. Follow [UI verification guidance](doc/design-and-decision/haruna-ui-lib.md#verification)
for overlays and visual checks.

### Mandatory Isolation

- Never contact real or local API, Supabase, database, storage, auth, or Edge
  Function services. Do not start Docker, Supabase, development servers, or other
  external services for application tests.
- Never read development/production environment files or credentials. Vitest
  disables environment-file loading and supplies dummy endpoints/keys.
- Backend singleton imports and Supabase client construction are guarded before
  app imports. Never bypass guards via `vi.unmock`, `vi.importActual`, or direct
  SDK construction; never import `src/main.ts` into tests.
- Use `makeBackendFake()` with explicit responses. Unconfigured operations fail
  teardown even if caught by application code. Each `backend.query(...)` queues
  one response per `.from(...)`; chains record arguments, not SQL/RLS semantics.
- Never restore real network transports or use subprocesses to access services.
  Extend fakes; keep FFmpeg, service-worker registration, browser downloads, and
  other external side effects mocked.
- Only isolation self-tests may consume expected guard violations; other tests
  must leave them for global teardown to detect.
- Await async work, unmount components, and stop service-owned watchers, using
  `finally` where appropriate. Setup resets Pinia, DOM, browser storage, timers,
  and mocks; isolate any additional side effects equally.
- Migrations, RLS, Edge Function implementations, server contracts, and browser
  end-to-end tests are outside this suite. Mock tests do not validate server behavior.

### Completion Checks

- Format only changed files with `npx --no-install prettier --write <changed-files>`
  (including Tailwind sorting); substitute explicit paths. Do not use repository-wide
  `npm run format` for scoped changes.
- Run `npm test -- <test-paths>` covering changed behavior, dependencies, and
  consumers. Run the full suite (`npm test`) for broad impact that focused tests
  cannot cover, such as shared test infrastructure, or when explicitly requested.
- Run `npm run type-check` for TypeScript/Vue correctness changes; it checks
  whole projects and has no file-level filtering.
- Run `npm run test:coverage` for harness/coverage configuration changes. Coverage
  behavior and exclusions are documented in
  [application tests](doc/conventions-and-standards/application-tests.md).
- For documentation-only changes, format changed files and skip application
  tests/type checking. Otherwise use the smallest sufficient checks; do not run
  whole-project checks unnecessarily.
- Fix introduced formatting issues, type errors, and test failures; never weaken
  isolation to pass or ignore type errors without a documented reason.
- Completion requires compliance with architecture, Vue/Ionic/Haruna conventions,
  theme tokens, and security rules. Report checks run, relevant checks skipped
  with reasons, and important assumptions/tradeoffs in the final handoff.

## Design and Decision Documentation

Documentation for design and decision reasoning is available in the
[`doc/design-and-decision`](doc/design-and-decision) directory. Consult this directory to understand the _"why"_ behind
architectural, business-logic, and convention choices before making changes that could conflict with established
reasoning.

## Git Conventions

Git conventions (branch naming, commit messages, pull requests) are defined in
[`doc/conventions-and-standards/git.md`](doc/conventions-and-standards/git.md).
