# Application tests

Vitest, Vue Test Utils, and jsdom run components, services, Pinia, and workflows in
memory. No environment files, credentials, Docker, Supabase, backend, or development
server are needed or permitted. Commands live in the README
[setup and commands](../../README.md#setup-and-commands) section.

## Coverage

Coverage includes untested source, has no initial percentage gate, and excludes
generated database types, bootstrap/root routing, and the real backend adapter.
Reports in `coverage/` (including `index.html`) are Git-ignored.

## Structure and adding tests

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
  irrelevant; follow [UI verification](haruna-ui-lib.md#verification) for overlays/layout.
- Await async work, unmount components, and stop service watchers in `finally`
  where appropriate. Setup disposes Pinia and resets DOM, storage, timers, and mocks;
  isolate additional side effects equally.

## Network safety and boundaries

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
