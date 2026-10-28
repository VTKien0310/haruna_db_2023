# Security Review Conventions

> Used by `security-review` and `security-pr-review`. The checklist is written for this repository: a Vue 3 PWA,
> Supabase (Auth, Postgres, Storage, Edge Functions), and a custom backend API. Re-read
> [AGENTS.md](../../../../AGENTS.md) Security and
> [coding.md](../../../../doc/conventions-and-standards/coding.md) Security on every review. If those docs disagree
> with this file, the docs win.

## Review Categories & Rules

### 1. SQL and Query Injection

* Must use Supabase query methods, the generated `Database` types, or parameterized SQL. Must never concatenate or
  interpolate untrusted input into SQL or into a raw PostgREST filter string.
* Must validate and cast user input types before using them in queries. TypeScript types do not replace runtime
  validation.
* Migrations and Edge Function SQL follow the same rule. A filter built with `.or()` or `.filter()` from a raw user
  string is injection unless every value is passed separately and the operator is fixed.

### 2. XSS (Cross-Site Scripting)

* Must render untrusted text with Vue's escaped interpolation (`{{ }}`) or text bindings.
* Must sanitize untrusted HTML with a maintained HTML sanitizer before `v-html` or HTML DOM APIs. Prefer plain text
  when HTML is not required.
* Must validate bookmark and other user-supplied navigation URLs and allow only intended protocols such as `https:`
  and `http:`. Reject executable URLs such as `javascript:`.
* Must not reflect raw request input into the page without encoding.

### 3. Request Protection

* Protected custom API and Edge Function calls send the Supabase session as a Bearer token via `backendPort`. CORS
  configuration is not authentication or authorization.
* Must not put credentials or session tokens in URLs.
* Cookie-based session auth is not the current custom API. If a change introduces cookie authentication for a
  state-changing request, it must include CSRF protection and document why Bearer auth was not used.

### 4. Mass Assignment / Over-Posting

* Must explicitly select writable fields for inserts, updates, and API payloads. Must not spread an arbitrary form or
  request object into a write.
* The backend must enforce which fields the caller may change. A client allow-list is not enough on its own.

### 5. Authorization / Access Control

* Authentication is not authorization. Supabase tables exposed through the Data API need Row Level Security policies
  that match the intended access model. Storage needs bucket configuration and storage policies.
* Must not trust a client-supplied user id, ownership field, or user-editable metadata as proof of permission.
* Must keep privileged operations on the backend. The frontend must never use the service-role key to bypass RLS.
* Client route guards and hidden buttons do not enforce access. Protected custom API and Edge Function operations
  validate the access token on the server.
* Knowing an object path or media id is not authorization.

### 6. Hardcoded Credentials & Secrets

* Must never hardcode secrets, passwords, or session tokens, and must never commit `.env` files, `*.pem`, `*.key`, or
  other credential files.
* Every `VITE_` variable is public browser configuration, including `VITE_SUPABASE_API_URL`,
  `VITE_SUPABASE_ANON_KEY`, and `VITE_BACKEND_API_URL`. The anon key is public and is not itself a finding. A
  service-role key, database password, or provider secret in frontend code, a committed env file, or a `VITE_`
  variable is a finding.
* Service-role and provider secrets stay in server-side configuration only.

### 7. Logging of Secrets

* Must never log passwords, access or refresh tokens, authorization headers, backend secrets, or signed media URLs.
* Must scrub those fields before logging a request or response payload, including error toasts and monitoring events.

### 8. Logging of Personal Info (PII)

* Must not log personal information, private media, bookmark content, or translation content in application logs or
  third-party monitoring.
* When a diagnostic needs a subject, prefer an opaque id over a name, email, or the content itself.

### 9. Client-Side Storage and PWA Caching

* Let Supabase Auth manage its persisted session. Do not copy tokens into `localStorage`, `sessionStorage`, or another
  store.
* Do not persist credentials, private media, translation content, or other sensitive personal data in browser storage.
  A nonsensitive preference such as the selected theme may be stored without encryption.
* Frontend encryption is not protection from XSS: script running in the page can read both the data and the key.
* Do not cache authenticated API responses or private media in a service worker unless the change includes an explicit
  access, expiry, and sign-out cleanup design.

### 10. Uploads, Previews, and Downloads

* Must validate upload size, allowed media types, filenames, object paths, and metadata. The backend must not trust
  the client check, the file extension, or the client-reported MIME type alone.
* Must verify permission to access or modify the target media and storage object, including generated previews and
  downloads.
* Private media uses time-limited signed URLs. Treat a signed URL as a temporary credential: do not log it or store
  it in browser storage.

### 11. Dependency Vulnerabilities

* Audit npm dependencies with `npm audit`. Commit lockfile changes together with dependency updates.
* Rate an advisory by whether the vulnerable code path is actually shipped or exercised. A build-tool advisory that
  does not run in the app is not a production Blocker by itself.

### 12. Project-Specific Conventions

* Apply the Security sections of `AGENTS.md` and `doc/conventions-and-standards/coding.md`, including any rule those
  docs add after this skill was written.
* These rules describe required practices. They do not certify that deployed RLS or storage policies have been audited.
  A frontend-only diff cannot prove a server policy is correct; say so instead of marking that policy as verified.

## Risk Assessment & Verdict

There is no perfect code, and most findings are trade-offs. The goal of this review is code that meets its
requirements with only a rare chance of failing in production — not code free of every conceivable flaw. Rate
**every** finding on two axes, then derive the verdict from those ratings, never from the mere presence of a `✗`.

### Severity (impact if it happens)

| Level    | Meaning    |
|:---------|:-----------|
| Critical | Remote compromise, auth bypass, leaked secrets/credentials, or mass exposure of personal data. |
| High     | Unauthorized access to or modification of other users' data; exposure of limited sensitive data.     |
| Medium   | Weakness that needs chaining with another flaw, or exposes low-sensitivity information.   |
| Low      | Hardening or defense-in-depth gap with no direct exploit path.      |

### Likelihood (chance of it happening in reality)

| Level       | Meaning                                                                                            |
|:------------|:---------------------------------------------------------------------------------------------------|
| Likely      | Normal, everyday usage triggers it.                                                                |
| Possible    | Triggered by realistic but less common input, state, or usage that will plausibly occur.           |
| Rare        | Needs unusual timing, data, concurrency, or infrastructure conditions seldom seen in production.   |
| Theoretical | Needs conditions not realistically reachable given this stack, infrastructure, callers, or guards. |

For every finding, describe the **concrete trigger scenario** (who/what does what, in which state). If you cannot
describe a realistic one, rate it **Theoretical**. Before rating, account for existing mitigations along the call
path — RLS, storage policies, server-side token checks, validators, and the actual callers.

For security findings, likelihood is **exploitability**: who can reach the code (anonymous internet, any
authenticated user, admin only), what an attacker must already know or control, and whether the input is actually
attacker-controlled. A check that exists only in the Vue page does not count as a server-side mitigation.

### Action (severity × likelihood)

| Severity \ Likelihood | Likely       | Possible     | Rare         | Theoretical |
|:----------------------|:-------------|:-------------|:-------------|:------------|
| Critical              | Blocker      | Blocker      | Should fix   | Note only   |
| High                  | Blocker      | Should fix   | Nice-to-have | Note only   |
| Medium                | Should fix   | Nice-to-have | Nice-to-have | Note only   |
| Low                   | Nice-to-have | Nice-to-have | Note only    | Note only   |

Exceptions: hardcoded secrets, committed key or secret files, service-role material in the frontend, and secrets
written to logs are always **Critical + Likely** (Blocker), since exposure cannot be undone once pushed. The public
Supabase anon key is not this exception. Known-vulnerable dependencies take the advisory's severity, and their
likelihood depends on whether the vulnerable code path is actually used.

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
## Security Review Report

### Summary

[Pass / Pass with comments / Fail] — Brief overall assessment

**Risk tally**: [N] Blocker, [N] Should fix, [N] Nice-to-have, [N] Note only — one line on why this verdict.

### Findings

| # | Location (file:line) | Issue | Severity | Likelihood | Trigger scenario | Action |
|:--|:---------------------|:------|:---------|:-----------|:-----------------|:-------|
| 1 | ...                  | ...   | ...      | ...        | ...              | ...    |

[Write "No findings." instead of the table when there are none. Every ✗ below must reference a finding #.]

### 1. SQL and Query Injection

- **Parameterized queries**: [✓/✗]
- **Issues**: [list any violations or "None"]

### 2. XSS

- **Output escaping**: [✓/✗]
- **Issues**: [list any violations or "None"]

### 3. Request Protection

- **Bearer auth, no tokens in URLs**: [✓/✗]
- **Issues**: [list any violations or "None"]

### 4. Mass Assignment / Over-Posting

- **Field whitelisting**: [✓/✗]
- **Issues**: [list any violations or "None"]

### 5. Authorization / Access Control

- **RLS, storage policies, server checks**: [✓/✗]
- **Issues**: [list any violations or "None"]

### 6. Hardcoded Credentials & Secrets

- **No hardcoded secrets**: [✓/✗]
- **No committed secret files**: [✓/✗]
- **Issues**: [list any violations or "None"]

### 7. Logging of Secrets

- **No secrets in logs**: [✓/✗]
- **Issues**: [list any violations or "None"]

### 8. Logging of Personal Info (PII)

- **No PII in logs**: [✓/✗]
- **Issues**: [list any violations or "None"]

### 9. Client-Side Storage and PWA Caching

- **Session left to Supabase Auth**: [✓/✗]
- **Issues**: [list any violations or "None"]

### 10. Uploads, Previews, and Downloads

- **Validation and signed URLs**: [✓/✗]
- **Issues**: [list any violations or "None"]

### 11. Dependency Vulnerabilities

- **Audit run**: [✓/✗] — [npm audit, or "not run"]
- **Vulnerable packages found**: [list or "None"]

### 12. Project-Specific Conventions

- **Source(s) consulted**: [AGENTS.md Security, coding.md Security]
- **Issues**: [list any violations or "None"]

### Commands Run

- `npm audit`: [output summary or "not run"]

### Recommendations

[Specific actionable items with file paths and line numbers for every ✗ item above, grouped by Action (Blocker →
Should fix → Nice-to-have) and ordered by Severity within each group. Skip Note-only items.]
```
