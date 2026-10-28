# Comment Purge Rules

Classify every in-scope comment as **keep**, **remove**, **rewrite** or **uncertain**. The lists below are not
exhaustive: judge any other comment by the same test, *would a future maintainer lose something they can't get from
the code, the design notes, or git history if this comment went away?*

## Keep

| Category | Examples |
|---|---|
| **Why** | intent, business rule, trade-off, the reason for a workaround or an unusual choice, a pitfall a reader would otherwise fall into |
| **How** | a non-obvious algorithm, protocol, or invariant: what the code relies on, not a restatement of each line |
| **Up-to-date project reference** | a pointer to `doc/design-and-decision/` or a heading in `AGENTS.md` that still exists and still says what the comment claims |
| **Reference to other code** | `@see`, "mirrors `X`", "kept in sync with `Y`", when the target still exists |
| **Open TODO / FIXME** | work or a decision still pending: the code doesn't do it yet, or a documented decision hasn't answered it |
| **Contract comments** | TSDoc / JSDoc with `@param`, `@returns`, `@throws`, `@deprecated`, or a summary that states a contract a type alone does not express |
| **Tool directives** | `eslint-disable`, `prettier-ignore`, `vue-ignore` / `vue-expect-error`, `@ts-expect-error`, `@ts-ignore`, `v8 ignore`, `istanbul ignore`, `# shellcheck`, `# syntax=` in Dockerfiles, shebangs, license / copyright headers |

## Remove

| Category | Examples |
|---|---|
| **What** | narration that restates the code: `// Get the user`, `// Loop over the items`, `// Return the response`, a docblock that only repeats the function name |
| **Plan reference** | any pointer to `.agents/plans/**`: plans are temporary working documents, not lasting documentation |
| **Stale project reference** | the cited `doc/design-and-decision/` file, `AGENTS.md` heading, or section no longer exists, or no longer says what the comment claims |
| **Handled TODO** | the code now does what the TODO asked, or a design note has settled it |
| **Commented-out code** | old implementations, disabled calls, debug output |
| **Noise** | section banners with no information (`// ----- Helpers -----` in a short file), changelog or author notes (`// Added by …`), notes to the reviewer or to another agent |

## Rewrite (instead of removing)

A comment that mixes kinds keeps its valuable part:

* Drop only the plan pointer and keep the why. For example, `Copy on claim, never on upload
  (`.agents/plans/file-upload/README.md` decision 7).` becomes `Copy on claim, never on upload.`
* If the plan was the **only** place a why that still matters was written down, put that why into the comment in one
  or two sentences, without the pointer. Point to `doc/design-and-decision/` or `AGENTS.md` instead when they cover
  the same reason.
* Drop the what-part of a comment and keep its why-part.
* Fix a stale reference only when the new location is certain (same page, renamed heading). Otherwise it is
  **uncertain**.
* A TODO that is partly handled: shorten it to the part still pending.

## Uncertain

Leave the comment untouched and ask (when a person is available) or report it (when nobody can be asked):

* why or what? The comment might hold intent that isn't obvious from the code.
* A TODO whose resolution can't be confirmed from the code or the design notes, or that waits on a product decision.
* A reference whose section changed meaning.
* A comment that refers to an external system, ticket, or person that can't be verified.
* Removing it would leave a non-obvious piece of code with no explanation at all.

## Not comments: never touch

* Vue template syntax (`{{ }}`, `v-if`, `:prop`, `@event`, `<slot>`), TypeScript types, and Vue macros
  (`defineProps`, `defineEmits`, `defineModel`) are code.
* `//`, `#`, `/*`, and `<!--` inside strings, template literals, regular expressions, URLs, and SQL or YAML values.
* CSS `url(...)` and quoted CSS strings. Do not treat `//` inside `<style>` as a comment.
* Text a user can see. Template text is not a comment just because it contains the characters `//`.

## After editing

* No empty block comments, leftover `<!-- -->`, double blank lines, or a blank line left before a closing `}`.
* Keep the remaining comments in the file's style (marker, wrap width, capitalisation).
* Only comment lines change. For `.vue`, `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, and `.css`, the token hash
  stays identical (SKILL.md Step 5). For SQL, shell, YAML, and Dockerfiles, the diff itself is the proof.
