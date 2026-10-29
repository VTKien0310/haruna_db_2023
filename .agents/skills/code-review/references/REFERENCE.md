# Code Review Conventions

> **Reusable reference** — used by `code-review` and `pr-review`. Covers Sections 1–9.
>
> Security concerns (SQL injection, XSS, CSRF, hardcoded credentials, insecure logging, vulnerable dependencies,
> and so on) are **not** covered here — use `security-review` or `security-pr-review`.

Re-read [coding.md](../../../../doc/conventions-and-standards/coding.md) and
[application-tests.md](../../../../doc/conventions-and-standards/application-tests.md) on every review. If they disagree
with this file, the docs win.

## Review Categories & Rules

### 1. Code Formatting

* Changed files must pass `npx --no-install prettier --check <files>`.
* Do **not** auto-fix, and do **not** run `npm run format` or `prettier --write`.
* Skip paths listed in `.prettierignore`. A docs-only diff still gets this check when its files are not ignored.

### 2. Naming Conventions

From [coding.md](../../../../doc/conventions-and-standards/coding.md):

* Variables and functions → `camelCase`
* Classes → `PascalCase`
* Constants → `SCREAMING_SNAKE_CASE`
* Vue files follow the module names: `{Module}Page.vue`, and other components in PascalCase
* `{Module}{Action}Service.ts`, `{Module}Store.ts`, `{Module}Router.ts`, `{Module}Entities.ts`, `{Module}Types.ts`,
  `{Module}ServiceContainer.ts`
* Route names are dot-separated (`gallery.list`) and live on `{Module}RouteName`
* Pinia store ids are kebab-case (`gallery-list`)
* Multi-word URL paths use `-` (`/user/get-user-info`)
* Prefer a long, clear name over a short, ambiguous one

### 3. Code Style

* Prefer single quotes. Prettier is the formatting gate; do not file a quote finding that Prettier would not flag.
* Strong TypeScript types. Avoid `any`.
* Vue uses `<script setup lang="ts">` only. No Options API, no extra `<script>` block, no separate HTML template file.
* Services are classes with constructor injection. Expected failures return `Promise<boolean>` or `void`; they do not
  throw. User-facing errors go through toast notifications.
* Pinia stores expose `ref` and `computed` only. No actions, no getters, and no composable that returns reactive state.
* Business logic lives in services, not in pages or stores.
* Dates use dayjs with the UTC plugin.
* New UI uses Haruna controls from `@/libs/ui` (`HButton`, `HInput`, `HForm`, `HSelect`, and the rest). Ionic
  components stay where the screen already uses them.

### 4. Routing and Backend Access

* Routes are module-scoped, lazy-loaded, and named with the module route enum.
* All backend access goes through `backendPort` from `@/ports/backend/BackendPort.ts`.
* `backendPort.spbClient` is for Supabase CRUD, auth, storage, and lightweight Edge Functions. Queries use the
  generated `Database` types. Destructure `{ data, error }` and check `if (error || !data)`.
* `backendPort.get` / `post` is for heavy or custom-API work. Handle `BackendApiResult` (`isOk`, `isErr`, `map`,
  `flatMap`, `unwrap`, `unwrapOr`, `unwrapErr`).
* Do not construct a Supabase client in a feature module, and do not call `fetch` against the backend beside the port.
* GET-style reads must not modify data.

### 5. Architecture

* Feature code lives in `src/modules/<module>/` (pages, components, services, stores, entities, types, router,
  service container).
* Reusable UI lives in `src/libs/ui/`. Infrastructure adapters live in `src/ports/`, including `backend/` and `dom/`.
* Tailwind uses the tokens, breakpoints, grids, and font classes in `src/libs/ui/styles/ui.css`. No one-off colors or
  magic spacing. App-level Ionic and font registration stays in `src/main.css`. See
  [haruna-ui-lib.md](../../../../doc/design-and-decision/haruna-ui-lib.md).
* Application tests live under `tests/modules/`, `tests/ports/`, and `tests/libs/ui/`, named `*.test.ts`. They use
  `makeBackendFake()` and must not import `src/main.ts` or touch a real backend.
* Edge Functions live in `supabase/functions/` and run on Deno. Do not treat them as Vite frontend code.
* Keep the change small. Do not add a dependency, a new abstraction, or a new architectural layer the task does not
  need.

### 6. Git Conventions

* **Branch format:** per **§2 Branch name** in
  [git.md](../../../../doc/conventions-and-standards/git.md)
* **Commit message format:** per **§4 Commit message** in
  [git.md](../../../../doc/conventions-and-standards/git.md)

### 7. Code Smell

* **Long methods**: Flag any method or function exceeding ~30 lines of pure logic (excluding blank lines and comments).
* **Deep nesting**: Flag conditional or loop nesting deeper than 3 levels; suggest early returns or extraction.
  [coding.md](../../../../doc/conventions-and-standards/coding.md) prefers guard clauses and a ternary for short logic.
* **Dead code**: Flag unreachable branches, unused variables, unused imports, and methods never called within the diff.
* **Magic values**: Flag unexplained numeric or string literals that should be named constants.
* **Too many parameters**: Flag methods with more than 4 parameters; suggest a value object or a typed options object.
* **Duplicated blocks**: Flag copy-pasted logic that appears more than once and should be extracted.
* **God objects**: Flag classes or methods that handle too many unrelated responsibilities.

### 8. Logic Issues

* **Conflicting conditions**: Flag if/else branches whose conditions logically contradict each other or can never both
  be true.
* **Unreachable code**: Flag conditions or branches that can never be satisfied given the surrounding context.
* **Complex boolean logic**: Flag double negatives, chains of `&&`/`||` beyond 2–3 operands, and nested ternaries;
  suggest extracted boolean methods or variables.
* **Misleading names**: Flag variables or methods whose names don't match what they actually do or return.
* **Inconsistent return patterns**: Flag methods that sometimes return early and sometimes fall through in a way that
  obscures intent.
* **Logic vs. comments**: Flag any logic that contradicts its own inline comment or docblock.

### 9. Configuration, Environment, and Tests

* Client configuration uses `import.meta.env` and only `VITE_` variables (`VITE_SUPABASE_API_URL`,
  `VITE_SUPABASE_ANON_KEY`, `VITE_BACKEND_API_URL`). Every `VITE_` value is public browser configuration.
* Do not put a service-role key, database password, or provider secret in frontend code, and do not read `.env` files
  from application code or tests.
* Tests must not `vi.unmock` the backend guard, call `vi.importActual` on the Supabase client, construct the SDK, or
  import `src/main.ts`.
* Do not start Docker, Supabase, or a dev server from a test or from this review.

## Risk Assessment & Verdict

There is no perfect code, and most findings are trade-offs. The goal of this review is code that meets its
requirements with only a rare chance of failing in production — not code free of every conceivable flaw. Rate
**every** finding on two axes, then derive the verdict from those ratings, never from the mere presence of a `✗`.

### Severity (impact if it happens)

| Level    | Meaning    |
|:---------|:-----------|
| Critical | Data loss or corruption, security breach, or the main requirement of the change does not work. |
| High     | A requirement or important flow is broken for some users/cases; wrong data returned or persisted.     |
| Medium   | Degraded behavior with a workaround, poor error handling, or notable maintainability cost.   |
| Low      | Style, naming, formatting, readability, or a minor convention deviation with no behavioral impact.      |

### Likelihood (chance of it happening in reality)

| Level       | Meaning                                                                                            |
|:------------|:---------------------------------------------------------------------------------------------------|
| Likely      | Normal, everyday usage triggers it.                                                                |
| Possible    | Triggered by realistic but less common input, state, or usage that will plausibly occur.           |
| Rare        | Needs unusual timing, data, concurrency, or infrastructure conditions seldom seen in production.   |
| Theoretical | Needs conditions not realistically reachable given this stack, infrastructure, callers, or guards. |

For every finding, describe the **concrete trigger scenario** (who/what does what, in which state). If you cannot
describe a realistic one, rate it **Theoretical**. Before rating, account for existing mitigations along the call
path — database constraints and RLS, transactions, route guards, validators, framework defaults, the actual callers,
and deployment context. Client-side checks are not authorization.

### Action (severity × likelihood)

| Severity \ Likelihood | Likely       | Possible     | Rare         | Theoretical |
|:----------------------|:-------------|:-------------|:-------------|:------------|
| Critical              | Blocker      | Blocker      | Should fix   | Note only   |
| High                  | Blocker      | Should fix   | Nice-to-have | Note only   |
| Medium                | Should fix   | Nice-to-have | Nice-to-have | Note only   |
| Low                   | Nice-to-have | Nice-to-have | Note only    | Note only   |

### Tool gates

* A failing `prettier --check` on a file this change touched is at least **Should fix**, because formatting is
  enforced before commit — but it is trivial to fix and never on its own a reason for **Fail**.
* A `npm run type-check` or `npm test` failure caused by this change is a finding. Rate it from the broken behavior.
  A type error or a failing test that means the main requirement does not work is a **Blocker** only when severity
  and likelihood say so; a narrow type error with an obvious fix is **Should fix**.
* If type-check or a test fails outside the diff and the failure looks pre-existing, report it as **Note only** and
  say it is not introduced by this change.
* A check that was not run is not a failure. Say `not run` and why.

### Verdict

* **Fail** — at least one **Blocker**.
* **Pass with comments** — no Blockers, but one or more **Should fix** items.
* **Pass** — only Nice-to-have / Note only items, or no findings at all.

### Reviewer discipline

* Do not invent or inflate findings to appear useful. "No issues found" is a valid, good outcome.
* Prefer working code with minor, unlikely defects over blocking delivery to chase perfection.
* Do not upgrade a rating because a fix is easy; do not downgrade it because a fix is hard. Rate the risk itself.
* Keep Theoretical items brief, and omit them entirely when they add no insight.

## Output Report Template

Return the full review as a Markdown report using this exact structure:

```markdown
## Code Review Report

### Summary

[Pass / Pass with comments / Fail] — Brief overall assessment

**Risk tally**: [N] Blocker, [N] Should fix, [N] Nice-to-have, [N] Note only — one line on why this verdict.

### Findings

| # | Location (file:line) | Issue | Severity | Likelihood | Trigger scenario | Action |
|:--|:---------------------|:------|:---------|:-----------|:-----------------|:-------|
| 1 | ...                  | ...   | ...      | ...        | ...              | ...    |

[Write "No findings." instead of the table when there are none. Every ✗ below must reference a finding #.]

### 1. Code Formatting

- **prettier**: [✓/✗/not run] — Status
- **Issues**: [list any violations or "None"]

### 2. Naming Conventions

- **Variables/Functions**: [✓/✗] — camelCase
- **Classes/Files**: [✓/✗] — PascalCase and module file names
- **Routes/Stores**: [✓/✗] — dot route names, kebab-case store ids

### 3. Code Style

- **Script setup and types**: [✓/✗] — `<script setup lang="ts">`, strong types
- **Services and stores**: [✓/✗] — logic in services; stores are ref/computed only
- **UI**: [✓/✗] — Haruna controls and theme tokens

### 4. Routing and Backend Access

- **Module routes**: [✓/✗] — lazy pages and route enums
- **backendPort**: [✓/✗] — no side-door clients or fetch
- **Result handling**: [✓/✗] — `{ data, error }` or `BackendApiResult`

### 5. Architecture

- **Module layout**: [✓/✗] — `src/modules/<module>/`
- **Ports and UI lib**: [✓/✗] — `src/ports/`, `src/libs/ui/`
- **Tests**: [✓/✗] — `tests/` mirrors the source, fakes only

### 6. Git Conventions

- **Branch naming**: [✓/✗]
- **Commit message**: [✓/✗]

### 7. Code Smell

- **Long methods**: [✓/✗] — [count or "None"]
- **Deep nesting**: [✓/✗] — [count or "None"]
- **Dead code**: [✓/✗] — [instances or "None"]
- **Magic values**: [✓/✗] — [instances or "None"]
- **Too many parameters**: [✓/✗] — [instances or "None"]
- **Duplication**: [✓/✗] — [instances or "None"]

### 8. Logic Issues

- **Conflicting conditions**: [✓/✗] — [instances or "None"]
- **Unreachable code**: [✓/✗] — [instances or "None"]
- **Complex boolean logic**: [✓/✗] — [instances or "None"]
- **Misleading names**: [✓/✗] — [instances or "None"]
- **Inconsistent returns**: [✓/✗] — [instances or "None"]
- **Logic vs. comments**: [✓/✗] — [instances or "None"]

### 9. Configuration, Environment, and Tests

- **Public VITE_ config only**: [✓/✗] — [instances or "None"]
- **Test isolation**: [✓/✗] — [instances or "None"]

### Commands Run

- `prettier --check`: [output summary or "not run"]
- `npm run type-check`: [output summary or "not run"]
- `npm test -- <paths>`: [output summary or "not run"]

### Recommendations

[Specific actionable items with file paths and line numbers for every ✗ item above, grouped by Action (Blocker →
Should fix → Nice-to-have) and ordered by Severity within each group. Skip Note-only items. For security-related
findings, run `security-review` (working tree) or `security-pr-review` (branch diff) instead.]
```
