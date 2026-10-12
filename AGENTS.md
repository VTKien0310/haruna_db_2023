# AGENTS.md

## Project: Haruna DB

A multipurpose Progressive Web App (PWA) for everyday use, providing:

- Image and video storage (gallery)
- AI-powered translation (via the Backend API)
- Webpage bookmark management (hierarchical directory tree)

### Tech Stack

| Layer            | Technology                              |
| ---------------- | --------------------------------------- |
| Framework        | Vue 3 + TypeScript                      |
| Mobile/PWA       | Ionic Vue 8                             |
| UI Components    | Haruna UI (`src/libs/ui`)               |
| Styling          | Tailwind CSS 4                          |
| State Management | Pinia 3                                 |
| Routing          | Vue Router 4 via `@ionic/vue-router`    |
| Backend          | Supabase + Custom API via `BackendPort` |
| Hosting          | Firebase Hosting                        |
| Utilities        | VueUse, dayjs, FFmpeg WASM              |

This file defines the standards and expectations that coding agents must follow when working on this project.

## Local Development Setup and Startup

Run commands from the repository root.

### Setup and Startup

1. Start the local Supabase environment:

   ```sh
   npx supabase start
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Start the frontend development server:

   ```sh
   npm run dev
   ```

4. In a separate terminal, serve Edge Functions with the local environment file:

   ```sh
   supabase functions serve --env-file ./supabase/functions/.env.local
   ```

Keep the frontend and Edge Function processes running while developing features that use them.

### Test-Only Setup

For application tests, install dependencies with `npm ci`, then run `npm test`.
No environment files, credentials, Docker, Supabase, backend server, or development
server are required. Follow the mandatory isolation rules in **Testing and Validation**;
do not start local services for the application test suite.

## Core Principles

- Prioritize **security, maintainability, and clarity** over cleverness.
- Follow **Vue best practices**.
- Follow **Ionic best practices**.
- Read and follow the [Haruna UI guide](doc/haruna-ui-lib.md) when working on UI components or styling.
- Prefer **simple, readable, composable solutions**.
- Keep the UI consistent with the app's design system and theme.
- Respect the separation of responsibilities between the frontend and the backend port.

## Frontend Standards

### Vue

- Use `<script setup lang="ts">` exclusively (Composition API + TypeScript).
- Use inline templates (no separate `.html` files).
- Prefer **strong typing** everywhere; avoid `any`.
- Keep components lean; move logic into services/utilities.
- Use `ref<T>()`, `reactive<T>()`, `computed()` for local state.
- Clean up side effects and watchers appropriately.
- Use Ionic lifecycle hooks (`onIonViewDidEnter`, `onIonViewWillLeave`) for page-level concerns.
- Use **Haruna UI components** (`HButton`, `HInput`, `HForm`, `HSelect`, etc.) from `@/libs/ui` instead of raw HTML controls in application code. Library primitives may use native elements for semantics and accessibility.

### Naming Conventions

- **Pages:** `{Module}Page.vue` (e.g., `GalleryListPage.vue`)
- **Components:** Descriptive names (e.g., `GalleryGridItem.vue`)
- **Services:** `{Module}{Action}Service.ts` (e.g., `GalleryListService.ts`)
- **Stores:** `{Module}Store.ts` (e.g., `AuthStore.ts`)
- **Routers:** `{Module}Router.ts` with exported enum `{Module}RouteName`
- **Entities:** `{Module}Entities.ts` (interfaces, enums, constants)
- **Types:** `{Module}Types.ts` (DTOs, form data types)
- **Service Containers:** `{Module}ServiceContainer.ts`
- **Route names:** Dot notation strings (e.g., `"gallery.list"`, `"auth.login"`)
- **Store IDs:** Kebab-case strings (e.g., `"gallery-list"`)
- **Constants:** `SCREAMING_SNAKE_CASE`

## Architecture and Boundaries

### Module Structure

The project uses a modular, port-based architecture (hexagonal/ports-and-adapters pattern):

```
src/
  libs/ui/          # App-owned reusable components, types, styles, UI services
  modules/          # Self-contained feature modules
    <module>/
      <Module>Router.ts
      <Module>ServiceContainer.ts
      <Module>Entities.ts
      <Module>Types.ts
      pages/
      components/
      services/
      stores/
  ports/            # Infrastructure adapters (external services)
    backend/        # Supabase client + Custom backend HTTP client
    dom/            # Browser DOM utilities
```

Each module is fully self-contained with its own routing, pages, components, services, stores, entities, and types.

### Service Pattern

- Services are **plain TypeScript classes** with constructor dependency injection.
- Factory functions in `*ServiceContainer.ts` compose services with their dependencies.
- Each call to a factory function creates a **new instance** (not singleton).
- Services access Pinia stores directly via `use*Store()`.
- Services return `Promise<boolean>` or `void` for control flow; no exceptions for expected failures.

### Pinia Stores

- Use **Composition API (setup function)** style of `defineStore`.
- Stores are **pure state containers** — no actions or getters.
- Business logic lives in service classes, not stores.
- Expose `ref<T>()` and `computed()` values.

## Backend Boundaries

### Unified Backend Port

All backend access (Supabase + Custom API) is centralized through `backendPort` from `@/ports/backend/BackendPort.ts`.

#### Supabase Access

Use `backendPort.spbClient` for:

- **Database queries** (typed with generated `Database` types)
- **Authentication** (`signInWithPassword`, `signOut`, `getSession`, `onAuthStateChange`)
- **Storage operations** (`upload`, `download`, `createSignedUrl`, `remove`, `list`)
- **Edge functions** for lightweight server-side logic

Pattern for Supabase calls: destructure `{ data, error }` and check `if (error || !data)`.

Edge functions are invoked via `backendPort.spbClient.functions.invoke()` and are located in `supabase/functions/` (Deno
runtime).

#### Custom Backend API (Heavy Compute)

Use `backendPort` directly for:

- Complex business logic and orchestration
- Heavy computation that should not run on Supabase edge functions
- Operations requiring a dedicated server environment

- Uses a custom **`BackendApiResult<T, E>` monad** for error handling (no exceptions for expected errors).
- Supports `.isOk()`, `.isErr()`, `.map()`, `.flatMap()`, `.unwrap()`, `.unwrapOr()`, `.unwrapErr()`.
- Auto-injects Supabase session token as Bearer auth.
- Methods: `get<T>()`, `post<T>()`.

### When Unsure About Boundaries

- Prefer Supabase for anything it can handle natively (CRUD, auth, storage, simple edge functions).
- Move to the custom backend API when Supabase edge function limitations are hit (cold starts, compute limits,
  complexity).
- Never expose Supabase service role key or backend secrets in frontend code.

## Styling and Theme

### Tailwind CSS

- Use Tailwind utility classes in templates for layout and styling.
- Prefer existing theme tokens from `@theme static` in `src/main.css` before adding new ones:
  - **Colors:** `primary`, `secondary`, `success`, `info`, `danger`, `warning`, `background-primary`,
    `background-secondary`, `background-element`, `background-border`, `text-primary`, `text-inverted`, `shadow`, `focus`,
    `control-border`, `brand-amber`, `brand-cyan`, `brand-raspberry`, `selection`
  - **Breakpoints:** `xs` (0), `sm` (640), `md` (1024), `lg` (1440), `xl` (1920)
- Do not introduce one-off colors or magic numbers.
- Use custom grid templates: `grid-cols-16`, `grid-cols-20` when needed.

### Haruna UI

- Use the app-owned library at `src/libs/ui` and follow the [Haruna UI guide](doc/haruna-ui-lib.md). It defines supported APIs, design conventions, implementation boundaries, CSS integration, source provenance, and maintenance.
- Keep library-specific documentation in that guide so application contributors and coding agents share one reference.

### Global CSS

- Global resets and font definitions live in `src/main.css`.
- Follow the [Haruna UI CSS integration rules](doc/haruna-ui-lib.md#css-integration) for Ionic/Tailwind import ordering and runtime theme tokens.
- Font classes: `.branding-font` (Pacifico), `.title-font` (Oxygen Mono), `.sans-serif-font` (Roboto), `.serif-font` (
  Roboto Slab).
- `.invisible-scroll-bar` utility for hidden scrollbars.
- Keep `<style scoped>` blocks minimal; prefer Tailwind classes.

## Security Requirements

- Never hardcode secrets, tokens, API keys, or service credentials.
- Never expose Supabase service role key in frontend code.
- All client-side env vars use `VITE_` prefix (`VITE_SUPABASE_API_URL`, `VITE_SUPABASE_ANON_KEY`,
  `VITE_BACKEND_API_URL`).
- Assume all client code is inspectable by end users.
- Design with Supabase row-level security (RLS) in mind.
- Validate inputs rigorously.
- Be cautious with file uploads, previews, metadata, and download flows.
- Respect authentication and authorization boundaries.
- Avoid logging sensitive user data.
- Do not store sensitive information in insecure client-side persistence.

## Code Quality

- Use TypeScript throughout; all files use `.ts` extension, all Vue files use `lang="ts"`.
- Keep code concise, readable, and easy to reason about.
- Avoid duplication; extract reusable pieces when justified.
- Do not over-abstract prematurely.
- Match existing codebase style when editing existing files.
- Prefer explicitness over hidden behavior.
- Do not leave dead code, commented-out blocks, or placeholder implementations unless explicitly requested.
- Use `dayjs` with UTC plugin for all date handling.

## Testing and Validation

### Application Test Suite

Use Vitest, Vue Test Utils, and jsdom for application tests. The separate test tree
mirrors `src/`:

- `tests/modules/{module}/`: service, page, component, and store behavior tests.
- `tests/ports/`: pure result helpers and DOM behavior, not live integrations.
- `tests/libs/ui/`: component and UI service behavior, including real modal/drawer focus and notification cleanup.
- `tests/factories/`: deterministic typed record builders.
- `tests/fakes/`: explicit in-memory dependencies and backend responses.
- `tests/support/`: mounting helpers, network guards, and isolation self-tests.
- `tests/setup.ts`: fresh Pinia, module mocks, browser compatibility, and cleanup.

Name tests `*.test.ts`, group with `describe("ClassOrComponent", ...)`, and focus
on observable behavior, including success, failure, empty, and loading states.
Use real Haruna controls for validation. Use `appMountOptions()` for components
and constructor injection for services. Workflow tests connect real services and
stores to fake backend dependencies. Do not test private implementation details
or substitute broad snapshots for behavioral assertions.

For UI overlay and visual checks, follow the
[Haruna UI verification guide](doc/haruna-ui-lib.md#verification).

### Mandatory Isolation

- Tests must never contact real or local API, Supabase, database, storage, auth,
  or Edge Function services. Do not start Docker, Supabase, a development server,
  or any other external service for this suite.
- Do not read development/production environment files or credentials. Vitest
  disables environment-file loading and supplies dummy endpoints and keys.
- The backend singleton and Supabase client construction are guarded before app
  imports. Do not use `vi.unmock`, `vi.importActual`, or direct SDK construction to
  bypass those boundaries. Do not import `src/main.ts` into tests.
- Use `makeBackendFake()` and explicitly configure responses. Unconfigured
  operations fail teardown even when application code catches their errors.
  `backend.query(...)` queues one response per `.from(...)` call; query chains
  record arguments and do not implement SQL or RLS semantics.
- Never restore real network transports or use subprocesses to access services.
  Extend fakes for new interactions. FFmpeg, service-worker registration, browser
  downloads, and other external side effects must remain mocked.
- Only isolation self-tests may explicitly consume expected guard violations.
  Other tests must allow global teardown to detect them.
- Await asynchronous work, unmount components, and stop service-owned watchers
  (using `finally` where appropriate). Central setup resets Pinia, DOM, browser
  storage, timers, and mocks; keep additional side effects equally isolated.
- Supabase migrations/RLS/functions, server contracts, and browser end-to-end
  tests are out of scope. Do not claim mock-based tests validate server behavior.

### Commands

```bash
npm test                 # One complete run, suitable for CI
npm run test:watch        # Watch mode for local iteration
npm run test:coverage     # Text, HTML and LCOV reports under coverage/
npm test -- tests/modules/translation
```

Coverage includes untested app code and has no initial percentage gate. Generated
database types, bootstrap/root routing, and the real backend adapter are excluded.
Add regression tests for bug fixes and update this guidance when the harness
changes. See README.md for setup and helper examples.

After creating or editing code, always run:

```bash
npm run format     # Prettier (includes Tailwind class sorting)
npm run type-check # vue-tsc type checking
npm test           # Application tests (fully isolated)
```

Rules:

- Fix formatting issues introduced by your changes.
- Fix type errors introduced by your changes.
- Fix test failures introduced by your changes; never weaken isolation to pass.
- Run `npm run test:coverage` when changing the harness or coverage configuration.
- Do not ignore type errors without a documented reason.

## PWA Expectations

This is a Progressive Web App (configured via `vite-plugin-pwa` with `generateSW` strategy):

- **Responsive design** — works on mobile and desktop.
- **Touch-friendly** interactions.
- **Graceful handling** of unstable networks.
- **Installability** via PWA manifest.
- **Good performance** on mobile devices.
- Provide clear UX for **loading states**, **empty states**, and **error states**.

## Definition of Done

A task is only considered complete when all of the following are true:

- The implementation follows Vue, Ionic, and Haruna UI conventions.
- The UI uses Haruna/Ionic components where appropriate.
- Styling respects `@theme` tokens in `src/main.css`.
- Code is consistent with the existing architecture.
- Security implications have been considered.
- `npm run format` has been run after the changes.
- `npm run type-check` has been run after the changes.
- `npm test` has been run after the changes.
- Any important assumptions or tradeoffs are clearly communicated.

## Agent Behavior Expectations

- Make the smallest reasonable change that fully solves the problem.
- Do not make broad architectural changes unless explicitly requested.
- Ask for clarification if:
  - Requirements conflict.
  - Security boundaries are unclear.
  - The intended responsibility between Supabase and the backend API is ambiguous.
  - A change could affect authentication, authorization, or data access rules.
- When suggesting improvements, prefer practical recommendations over speculative refactors.

## Preferred Implementation Patterns

- `<script setup lang="ts">` for all Vue components.
- Typed service classes with constructor DI.
- Factory functions in `*ServiceContainer.ts` for dependency wiring.
- Haruna UI components for interactive elements.
- Tailwind utility classes for layout and styling.
- Pinia stores as pure state containers.
- Module-scoped routing with enum route names.
- Lazy-loaded route components.
- `BackendApiResult` monad for `BackendPort` error handling.
- Destructured `{ data, error }` pattern for Supabase calls.
- Toast notifications for user-facing errors.

## Avoid

- Options API or regular `<script>` blocks.
- Raw HTML controls in application code when Haruna components are appropriate; native elements are permitted inside library primitives.
- Business logic embedded directly in page components.
- Hardcoded theme values when existing tokens can be used.
- Unstructured state management.
- Leaking sensitive data into logs, client storage, or frontend configuration.
- Overengineering simple features.
- Introducing dependencies without clear justification.
- Exceptions for expected error flows (use `BackendApiResult` or boolean returns).
- Composables returning reactive state (use service classes instead).

## If Unsure

If implementation details are unclear, prefer:

1. Security
2. Simplicity
3. Maintainability
4. Consistency with the existing codebase

When in doubt, ask for clarification before making risky or irreversible changes.
