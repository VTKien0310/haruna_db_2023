---
name: git-branching
description: Create a new git branch whose name follows the project's git conventions. Use when the user asks to create, start, make, or open a new branch. Do NOT use for committing (use git-commit), pushing, opening pull requests, or renaming / deleting branches.
metadata:
    usage: '@branch what-the-branch-is-for'
    example: '@branch p1 feat #823 listing search endpoint from p1/develop'
    conventions: '@ref ../../../doc/conventions-and-standards/git.md'
---

## What I Do

Create **one** new branch whose name follows **§2 Branch name**, **§5 Multiple phases project**, and
**§6 Hotfixes and minor changes** of [git.md](../../../doc/conventions-and-standards/git.md) — the single source of
truth for the project's git conventions. Do not copy or restate those rules elsewhere; read them from `git.md` every
time.

The convention needs information only the user can give (phase, group, issue id, name, base branch). **Never invent
any of it.** If something is missing or ambiguous, ask the user — for the value itself, or for an instruction on how
to proceed with the naming — before creating anything.

* Never push, set an upstream, rename, delete, or reset branches unless the user explicitly asks.
* Never stash, discard, or commit the user's working-tree changes to make the switch succeed.

## When to Use Me

Trigger when the user says any of:

* "create a branch", "make a new branch", "start a branch for …"
* "new branch for #123", "branch off p1.0/dev for …"

Do NOT trigger for committing, pushing, pull requests, or renaming / deleting branches.

## My procedures

### Step 1: Gather Information

```bash
git status --short
git branch --show-current
git branch -a --list
git log -1 --oneline
```

### Step 2: Load the Branch Naming Convention

Read §2, §5, and §6 of [git.md](../../../doc/conventions-and-standards/git.md) (template, allowed groups, issue id
rule, phase directories, date directories). Apply them exactly in Steps 3–4.

### Step 3: Collect the Required Parts

| Part        | Source                                                                                                             | Rule                                                                                                                                                                                      |
|:------------|:-------------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Directory   | The user. You may **propose** the phase of the current branch (e.g. `p1.0`), or today's date for a §6 change.     | Either a phase (`p1`, `p1.0`, `p2.5`, …) per §5, or `yyyymmdd` for hotfixes / minor changes ordered by the client that day per §6. The user must state or confirm which one applies.       |
| Group       | The user. You may **propose** one from the task description.                                                       | Must be one of the groups listed in §2 of `git.md`. The user must confirm a proposed group.                                                                                               |
| Issue id    | The user, per the issue-id rule in §2 of `git.md`.                                                                 | Digits only. If the user explicitly says there is no issue, omit the whole `#{issue-id}-` segment. Never fabricate an id and never leave a bare `#` with no id. A branch fragment is not permission to open or link a GitHub issue. |
| Name        | The user's description of the work.                                                                                | Normalized in Step 4. You may shorten a long description, but the user must confirm the result in Step 5.                                                                                |
| Base branch | The user. You may **propose** the phase integration branch named in §5 (or the current branch) if it exists.      | Must exist locally or on `origin`. Never assume `master`, `main`, or `develop` without checking §5 and the user's answer.                                                                |

**Missing-info rule:** if any part is missing, ambiguous, or conflicts with the convention, stop and ask the user
**once**, listing every missing part together. For each part, offer your proposal (if you have one) and always leave
room for the user to answer with their own value or instruction — e.g. "there is no issue id", "use the date
directory", or "name it exactly `xyz`". If the user asks for a name that deviates from the convention, point out the
deviation once and follow their decision.

Do not run any branch-creating command until every part is resolved.

### Step 4: Normalize and Validate

* **Name**: lowercase, words separated by `-` (spaces and `_` → `-`), collapse repeated `-`, trim leading / trailing
  `-`, keep only `a-z`, `0-9`, and `-`. Keep it short and descriptive.
* **Issue id**: digits only (strip a leading `#` the user may have typed).
* **Group**: one of the §2 groups.
* **Date directory**: a real calendar date in `yyyymmdd` form.
* Assemble the name:
    * with issue: `{directory}/{group}/#{issue-id}-{name}`
    * without issue: `{directory}/{group}/{name}`
* Validate and check for collisions. Quote every name so `#` is not a shell comment:

```bash
git check-ref-format --branch '<branch>'
git rev-parse --verify --quiet 'refs/heads/<branch>'
git ls-remote --heads origin '<branch>'
git rev-parse --verify --quiet '<base>'
```

If the branch already exists (locally or on `origin`), ask the user whether to switch to it or pick another name. If
the base does not exist, ask which base to use.

### Step 5: Confirm

Show the user:

* the final branch name
* the base branch (and its latest commit)
* a warning if `git status --short` is not empty — uncommitted changes will be carried over to the new branch

Wait for confirmation before creating the branch.

### Step 6: Create

Quote the names so the shell never treats `#` or other characters specially:

```bash
git switch -c '<branch>' '<base>'
```

If the switch fails (e.g. local changes would be overwritten), report the error and ask the user how to proceed. Do
not stash, reset, or discard anything on your own.

### Step 7: Verify

```bash
git branch --show-current
git log -1 --oneline
```

Report the new branch name and its base to the user, and mention that it has **not** been pushed.

## Examples

| User request                                                                                    | Result                                                                                                                                                     |
|:------------------------------------------------------------------------------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| "Branch for issue 823, listing search endpoint, phase p1, feature, off p1/develop"              | `p1/feat/#823-listing-search-endpoint` from `p1/develop`                                                                                                   |
| "p1 config branch to update access token lifetime, no issue, from p1/develop"                    | `p1/conf/update-access-token-lifetime` from `p1/develop`                                                                                                   |
| "Client asked today (2024-04-20) to fix unable-to-update-password, issue 11, hotfix, from master" | `20240420/hotfix/#11-unable-to-update-password` from `master`                                                                                              |
| "Create a branch for the login fix"                                                             | Ask first: directory (propose the phase of the current branch), confirm group `fix`, issue id or "none", base (propose the §5 integration branch if it exists). Create nothing yet. |
