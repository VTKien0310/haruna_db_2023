# **CODING CONVENTIONS AND STANDARDS**

# **TypeScript**

- Must use camelCase for variables and functions naming
- Must use PascalCase for classes naming
- Must follow the framework’s (React/Vue/Angular) naming convention for files
- Should use strong typing as much as possible
- Should prioritize using ‘ ’ for string instead of “”

# **Conventions**

- Must use “-” as a separator for multi-words in routes. _Ex: /user/get-user-info_
- Must give variables and functions easy-to-understand names. A long but easy to understand name is better than a short
  but ambiguous one.
- Must follow the Security section's browser storage rules; nonsensitive preferences may be stored without encryption
- Must provide details about the application setup process, environment configuration and dependencies in projects’
  README files
- Should prioritize the ternary operator (`?:`) over `if-else` for short, simple logic
- Should avoid multiple nested `if-else`, `for`, and `while` blocks; prefer guard clauses to return or throw early

# **Security**

- **Authentication and backend access**
  - Must use Supabase Auth through `backendPort.spbClient.auth` for authentication and session management
  - Must route all backend access through `backendPort`: use `spbClient` for Supabase queries, storage, and
    `functions.invoke()`, and `get<T>()` / `post<T>()` for the Custom API, which attach the session's Bearer token
  - Must validate access tokens on the server for protected Custom API and Edge Function operations; client-side
    session checks, route guards, and hidden controls do not enforce authorization
  - Must use HTTPS for deployed frontend and backend endpoints and never put credentials or session tokens in URLs
- **Authorization and data access**
  - Must enable Supabase Row Level Security (RLS) on tables exposed through the Data API and define policies that
    match the intended access model; authentication alone does not grant access to every row
  - Must enforce storage access through bucket configuration and storage policies, and check authorization for
    each protected Custom API and Edge Function operation
  - Must not trust client-supplied user IDs, ownership fields, or user-editable metadata as proof of permission
  - Must keep privileged operations on the backend with explicit authorization checks; never use service-role
    credentials in the frontend to bypass RLS
  - See the [Supabase RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- **Queries and input validation**
  - Must use Supabase query methods typed with the generated `Database` types; TypeScript types do not replace
    runtime validation or backend authorization
  - Must validate input types, identifiers, ranges, and allowed values before use, and validate requests again on
    the backend
  - Must not concatenate untrusted input into SQL or raw PostgREST filter expressions; use query methods with
    separate values and parameterized queries in backend SQL code
  - Must explicitly select writable fields for inserts, updates, and API payloads instead of spreading arbitrary
    form or request objects; the backend must enforce which fields the caller may change
- **XSS (Cross-Site Scripting) and links**
  - Must render untrusted text using Vue's escaped interpolation (`{{ }}`) or text bindings
  - Must sanitize untrusted HTML with a maintained HTML sanitizer before using `v-html` or HTML DOM APIs;
    avoid rendering user content as HTML when plain text is sufficient
  - Must validate bookmark and other user-supplied navigation URLs and allow only intended protocols such as
    `https:` and `http:`; reject executable URLs such as `javascript:`
- **Uploads, previews, and downloads**
  - Must validate upload sizes, allowed media types, filenames, object paths, and metadata; backend validation
    must not rely solely on client checks, file extensions, or client-reported MIME types
  - Must verify permission to access or modify the target media and storage object, including generated previews
    and downloads; knowing an object path or media ID is not authorization
  - Must use time-limited signed URLs for private media and treat them as temporary access credentials;
    never log them or persist them in browser storage
- **Request protection**
  - Must preserve Bearer authentication for protected API requests; CORS configuration is not authentication or
    authorization
  - Must implement appropriate CSRF protection for state-changing endpoints if cookie-based authentication is
    introduced; the current Custom API sends the Supabase token in the `Authorization` header
- **Secrets and configuration**
  - Must never hardcode secrets, passwords, or session tokens, or commit environment files containing credentials
  - Must treat all `VITE_*` variables as public browser configuration, including `VITE_SUPABASE_API_URL`,
    `VITE_SUPABASE_ANON_KEY`, and `VITE_BACKEND_API_URL`; putting a secret in an environment variable does not
    protect it if that variable is bundled into the frontend
  - Must keep Supabase service-role/secret keys, database credentials, and backend provider secrets in server-side
    configuration only; the frontend's Supabase anon key is public and relies on access policies for protection
  - See the [Supabase API key guide](https://supabase.com/docs/guides/getting-started/api-keys)
- **Logging and error messages**
  - Must never log passwords, access or refresh tokens, authorization headers, backend secrets, or signed media URLs
  - Must not log personal information, private media, bookmark content, or translation content in application logs
    or third-party monitoring services
  - Must omit sensitive fields from diagnostic payloads and show safe user-facing errors through toast notifications
- **Browser storage and PWA caching**
  - Must let Supabase Auth manage its persisted session; do not manually duplicate tokens in local storage,
    session storage, or other browser stores
  - Must not persist additional credentials, private media, translation content, or other sensitive personal data
    in browser storage; nonsensitive preferences such as the selected theme may be stored without encryption
  - Must not treat frontend encryption as protection from XSS or other code executing in the browser, which can
    access both decrypted data and client-held keys
  - Must not add service-worker caching of authenticated API responses or private media without an explicit access,
    expiry, and sign-out cleanup design that prevents exposure between sessions
- **Dependency vulnerabilities**
  - Should regularly audit npm dependencies with `npm audit`, review findings, and update affected packages
  - Must commit dependency lockfile changes alongside dependency updates

Follow [AGENTS.md](../../AGENTS.md#security) for project security boundaries and the
[README](../../README.md#project-setup-for-development) for development configuration.
These rules describe required practices; they do not certify that deployed backend policies have been audited.
