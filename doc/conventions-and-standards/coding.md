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
- Must follow the [security](security.md) document's browser storage rules; nonsensitive preferences may be stored
  without encryption
- Must provide details about the application setup process, environment configuration and dependencies in projects’
  README files
- Should prioritize the ternary operator (`?:`) over `if-else` for short, simple logic
- Should avoid multiple nested `if-else`, `for`, and `while` blocks; prefer guard clauses to return or throw early

Follow [security.md](security.md) for security conventions and the
[README](../../README.md#project-setup-for-development) for development configuration.
