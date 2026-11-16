---
name: pr-review
description: Review the diff between two branches following project conventions. Use when the user wants to review a PR, compare branches before merging, or audit what a feature branch adds on top of a base branch.
metadata:
    usage: '@pr-review <source-branch> <target-branch>'
    example: '@pr-review p1/feat/#823-listing-search p1/develop'
    conventions: '@ref ../code-review/references/REFERENCE.md'
compatibility: Requires git, Node, and this repository's npm scripts (prettier, vue-tsc, vitest).
allowed-tools: Bash(git:*) Bash(npx:*) Bash(npm:*) Bash(ln:*)
---

## What I Do

Perform a structured code review of the diff between two branches and output a detailed report with a risk-weighted verdict and status per
category. All review rules and the output report template are defined
in [REFERENCE.md](../code-review/references/REFERENCE.md).

Rate every finding by **severity** and **likelihood of occurring in reality**, and derive the final verdict
(Pass / Pass with comments / Fail) from those ratings as defined in **Risk Assessment & Verdict** in
[REFERENCE.md](../code-review/references/REFERENCE.md). Rare or theoretical issues must not fail otherwise working code — do not chase perfection
or invent findings to appear useful.

Always fetch the latest remote changes before reviewing, then use a dedicated `git worktree` for each PR review. This
keeps the user's active working copy free for their own feature work and lets multiple reviews run without checking
out over each other.

## When to Use Me

Trigger when the user says any of:

* "review PR", "PR review", "review pull request"
* "review diff between branches", "compare branches"
* "review `<branch>` against `<branch>`", "review `<branch>` to `<branch>`"
* "review `<branch>` before merging"

Do NOT trigger for general coding assistance, writing new code, explaining concepts, or reviewing uncommitted
working-tree changes (use `code-review` for that).

## My Procedures

### Step 1: Parse Branch Arguments

Extract the **source branch** (feature/PR branch) and **target branch** (base branch) from the user's message.

If either branch is missing, ask the user:
> Which two branches should I compare? Provide: `<source-branch>` (the PR branch) and `<target-branch>` (the base
> branch).

Do not validate branch existence until after fetching latest remote changes in Step 2. Do not assume the target is
`main`, `master`, or `develop`.

### Step 2: Fetch Latest Changes

Always fetch the latest remote branch state before validating branches, creating the review worktree, or gathering the
diff. Quote branch names so `#` is not a shell comment:

```bash
git fetch --prune origin
```

After fetching, validate both branches exist locally or on `origin`:

```bash
git rev-parse --verify --quiet 'refs/remotes/origin/<source-branch>'
git rev-parse --verify --quiet 'refs/heads/<source-branch>'
git rev-parse --verify --quiet 'refs/remotes/origin/<target-branch>'
git rev-parse --verify --quiet 'refs/heads/<target-branch>'
```

Use the fetched remote refs for review when they exist:

* `<review-source-ref>` should be `origin/<source-branch>` when that remote ref exists, otherwise `<source-branch>`.
* `<review-target-ref>` should be `origin/<target-branch>` when that remote ref exists, otherwise `<target-branch>`.

### Step 3: Create an Isolated Review Worktree

Record the main checkout before leaving it:

```bash
git rev-parse --show-toplevel
```

Create a detached worktree as a **sibling of this repository**, never inside another project:

```bash
git worktree list
git worktree add --detach ../haruna_db_2023-pr-review-<safe-source-branch> <review-source-ref>
```

`<safe-source-branch>` is the source branch with `/`, `#`, and every character outside `A-Za-z0-9._-` replaced by `-`.

If that path already exists, inspect `git worktree list` and either reuse it only when it already points at the same
source commit, or choose a unique suffix such as `-2`. Do not remove an existing worktree unless the user explicitly
asks.

A fresh worktree has no `node_modules`. If the main checkout has one, symlink it (the worktree path is gitignored, so
this does not dirty the review commit):

```bash
ln -s <main-checkout>/node_modules ../haruna_db_2023-pr-review-<safe-source-branch>/node_modules
```

Do not run `npm ci` or `npm install`. If `node_modules` is missing, still review the diff and mark Prettier,
type-check, and tests as `not run`. Never `rm -rf` the symlink's target. Removing the worktree in Step 7 deletes the
symlink only.

Run every remaining command with that worktree as the working directory. Do not assume the shell stays there.

### Step 4: Gather Diff Information

Use the **three-dot diff** to show only what the source branch adds since diverging from the target (ignoring unrelated
changes on target):

```bash
git log <review-target-ref>..<review-source-ref> --oneline
git diff <review-target-ref>...<review-source-ref> --name-only
git diff <review-target-ref>...<review-source-ref>
```

Identify all modified files before proceeding.

### Step 5: Run Checks

From the review worktree, follow Step 2 of [code-review](../code-review/SKILL.md): `npx --no-install prettier --check`
on changed files, `npm run type-check` when TypeScript or Vue changed, and `npm test -- <test-paths>` for changed
behavior. Do not auto-fix. Do not start Docker, Supabase, or a dev server. Do not read `.env*` files.

Refer to **Section 1 (Code Formatting)** and **Tool gates** in
[REFERENCE.md](../code-review/references/REFERENCE.md).

### Step 6: Review Against Conventions & Output Report

Load and apply all rules from [REFERENCE.md](../code-review/references/REFERENCE.md) — Sections 1 through 9 — against
the diff content gathered in Step 4. Re-read `doc/conventions-and-standards/coding.md` from the
worktree. For a security review of this same diff, use `security-pr-review` instead of `security-review`.

Use the **Output Report Template** defined at the bottom of [REFERENCE.md](../code-review/references/REFERENCE.md), with
the heading:

```
## PR Review Report: `<source-branch>` → `<target-branch>`
```

For **Section 6 (Git Conventions)**, verify the source branch name matches the branch-name format in
[git.md](../../../doc/conventions-and-standards/git.md) §2 in addition to checking commit messages.

### Step 7: Clean Up the Review Worktree

After preparing the review report and before sending the final response, return to the main checkout and remove the
dedicated review worktree:

```bash
git worktree remove ../haruna_db_2023-pr-review-<safe-source-branch>
```

If cleanup fails because files changed during checks, report the worktree path and the cleanup error in the final
response instead of force-removing it.
