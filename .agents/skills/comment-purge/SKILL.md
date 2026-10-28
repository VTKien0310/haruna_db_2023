---
name: comment-purge
description: Remove low-value code comments (what-narration, references to `.agents/plans/`, stale design-note references, handled TODOs, commented-out code) while keeping the valuable ones (why, how, up-to-date design-note or AGENTS.md references, references to other code, open TODOs, contract comments, tool directives). Cleans the current code changes by default, specific files or directories when directed, and the whole project only when the user asks. Use when the user asks to purge, clean up, trim or remove code comments, or invokes /comment-purge. Do NOT use for reviewing code (use code-review), for writing documentation, or for editing Markdown or `doc/`.
metadata:
    usage: '@comment-purge [changes | <files-or-directories> | project]'
    example: '@comment-purge src/modules/gallery'
    conventions: '@ref ./references/REFERENCE.md'
---

## What I Do

I remove comments that add no lasting value and keep the ones that do, **without changing any code**. The rules for
what to keep, remove, rewrite or flag as uncertain are in [REFERENCE.md](./references/REFERENCE.md).

When I can talk to the user and a comment is uncertain, I ask in one batch and follow their direction. When I cannot
ask (for example a subagent with no user), I leave uncertain comments untouched and list them in the report.

## Scope

| Mode | When | What is cleaned |
|---|---|---|
| `changes` | **default** | Comments on **added or modified lines** of the current changes only (`git diff HEAD`), plus every comment in untracked new files. Comments on untouched lines stay, even in a changed file. |
| `paths` | the user names files or directories | Every comment in those files, recursively for directories. |
| `project` | **only** when the user explicitly asks for the whole project | Every comment in every in-scope file. Confirm with the user first, then work one top-level directory at a time (`src/modules/`, `src/libs/`, `src/ports/`, other `src/` files, `tests/`, `supabase/functions/`, `supabase/migrations/`, `scripts/`), and pause after each batch so the user can review it before the next one. |

Never widen the scope on my own: if the user says "this file", I don't clean its neighbours. I do not clean `.agents/`
or `.claude/` unless the user names those paths.

**File types**: Vue single-file components, TypeScript, JavaScript, CSS, SQL, shell, YAML, and Dockerfiles.

**Always excluded**, whatever the scope:

* `node_modules/`, `dist/`, `coverage/`, `build/`, `.firebase/`, `supabase/.temp/`, `supabase/.branches/`
* generated `src/ports/backend/database.types.ts` and other generated `*.types.ts` files
* `doc/` and other Markdown or prose
* lockfiles (`package-lock.json`)
* `.env*`, `*.pem`, `*.key`, credential files: never read, print, or edit them

## My Procedures

### Step 1: Gather the scope

For `changes`:

```bash
git status --porcelain --untracked-files=all
git diff HEAD -U0                          # only the `+` lines are in scope
git ls-files --others --exclude-standard   # new files: in scope in full
```

For `paths` / `project`: list the in-scope files (`git ls-files <paths>`, plus untracked files under them), minus the
exclusions above.

### Step 2: Record the code fingerprint

Before editing, hash the code tokens of every in-scope `.vue`, `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, and
`.css` file. The script ignores comments and whitespace, so the hash must not change when I only remove or rewrite
comments:

```bash
node .agents/skills/comment-purge/scripts/code-token-hash.ts <files…>
```

Run it from the repository root so Node can resolve `typescript`, `vue`, and `@vue/compiler-dom`. Keep the output for
Step 5. Do not pass SQL, shell, YAML, Dockerfiles, or Markdown to the script.

### Step 3: Classify every in-scope comment

Read each file in full (comments make sense only in context) and classify every in-scope comment as **keep**,
**remove**, **rewrite**, or **uncertain**, following [REFERENCE.md](./references/REFERENCE.md):

* Check a `doc/design-and-decision/` or `AGENTS.md` reference by reading the cited file (read-only) and confirming the
  cited section still says what the comment claims.
* Check a TODO by reading the code it refers to (and the design note, if it waits on a decision) to see whether it is
  done.
* When I can't decide with confidence, the comment is **uncertain**. Never guess toward removal.

Ask about all uncertain comments in one batch before editing when a user is available (quote each comment with its
file:line, the options, and my recommendation). When I cannot ask, leave them untouched.

### Step 4: Edit

* Change **only comments**: no code, no formatting of code, no reordering of imports, no Tailwind class sorting.
* Do **not** run Prettier `--write`. It rewrites quotes and class order, which is a code change.
* For a rewrite, keep the file's comment style (`//`, `/* */`, `<!-- -->`, `#`) and line width.
* Remove whatever a deletion leaves behind: an empty comment, a lone `*` line, double blank lines, a trailing blank
  line before `}`.

### Step 5: Verify

1. Re-run `code-token-hash.ts` on the same files as Step 2. Every hash must match. If one differs, I changed code:
   undo my edit to that file, redo it comment-only, and check again. The one exception is a `//` line inside
   `<style>`: the hasher treats that as code so `url()` values stay intact. If the diff for that file is only such
   lines, confirm by reading the diff instead of treating the mismatch as a code change.
2. For SQL, shell, YAML, and Dockerfiles, re-read the diff and confirm every removed or changed line is a comment.
3. Re-read the whole diff (`git diff`) as a self-review: nothing outside the scope, no valuable comment lost, no code
   change.

### Step 6: Report

End with this report:

```markdown
PURGE: <changes | paths: <list> | project: <directory batch>>
STATUS: DONE | DONE_WITH_QUESTIONS | BLOCKED | FAILED
COUNTS: removed <n> · rewritten <n> · kept <n> · uncertain <n>
CODE UNCHANGED: yes | no — <token hashes match for <n> vue/ts/js/css files; other in-scope changes are comment-only>

## Removed / rewritten
- <file:line> — <category from REFERENCE.md> — <short reason>

## Uncertain (left untouched)
- <file:line> — "<quoted comment>" — <question> — options: <keep | remove | rewrite as "…"> — recommendation: <…>

## Checks
- token hash: <n> files, <all match | mismatch: files>
- diff re-read: <comment-only | code changed: files>

> Removing comments is a judgement call: a human must review this diff before commit.
```

`DONE_WITH_QUESTIONS` means everything else is done and only the uncertain comments are left. When the user has
answered, the uncertain list is normally empty.
