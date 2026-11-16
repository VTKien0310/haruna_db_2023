---
name: security-pr-review
description: Review the diff between two branches solely for security vulnerabilities — SQL injection, XSS, CSRF, mass assignment, authorization/access control, hardcoded credentials, insecure logging of secrets or PII, insecure client-side storage, and vulnerable dependencies. Use when the user wants a security review of a PR, wants to compare branches for security issues before merging, or wants to audit what a feature branch adds from a security standpoint. Do NOT use for general code quality (logic, formatting, architecture) — use pr-review for that.
metadata:
    usage: '@security-pr-review <source-branch> <target-branch>'
    example: '@security-pr-review p1/feat/#823-listing-search p1/develop'
    conventions: '@ref ../security-review/references/REFERENCE.md'
compatibility: Requires git. The dependency audit uses npm audit.
allowed-tools: Bash(git:*) Bash(npm:*) Bash(ln:*)
---

## What I Do

Perform a structured, security-only review of the diff between two branches and output a detailed report with a risk-weighted
verdict and status per security category. All review rules and the output report template are defined
in [REFERENCE.md](../security-review/references/REFERENCE.md).

Rate every finding by **severity** and **likelihood of occurring in reality**, and derive the final verdict
(Pass / Pass with comments / Fail) from those ratings as defined in **Risk Assessment & Verdict** in
[REFERENCE.md](../security-review/references/REFERENCE.md). Rare or theoretical issues must not fail otherwise working code — do not chase perfection
or invent findings to appear useful.

Always fetch the latest remote changes before reviewing, then use a dedicated `git worktree` for each PR review. This
keeps the user's active working copy free for their own feature work and lets multiple reviews run without checking
out over each other.

This skill focuses **solely** on security. For general code quality of a branch diff, use `pr-review`. For a
security-only review of uncommitted working-tree changes, use `security-review`.

## When to Use Me

Trigger when the user says any of:

* "security review of this PR", "security PR review"
* "review `<branch>` against `<branch>` for security issues"
* "audit `<branch>` for security before merging"
* "compare branches for vulnerabilities"

Do NOT trigger for general PR review (use `pr-review`), a security review of uncommitted working-tree changes (use
`security-review`), or general coding assistance.

## My Procedures

### Step 1: Parse Branch Arguments

Extract the **source branch** (feature/PR branch) and **target branch** (base branch) from the user's message.

If either branch is missing, ask the user:
> Which two branches should I compare? Provide: `<source-branch>` (the PR branch) and `<target-branch>` (the
> base branch).

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

* `<review-source-ref>` should be `origin/<source-branch>` when that remote ref exists, otherwise
  `<source-branch>`.
* `<review-target-ref>` should be `origin/<target-branch>` when that remote ref exists, otherwise
  `<target-branch>`.

### Step 3: Create an Isolated Review Worktree

Record the main checkout with `git rev-parse --show-toplevel`. Create a detached worktree as a **sibling of this
repository**, never inside another project. Use the `security-pr-review` prefix so this never collides with a
concurrent `pr-review` worktree for the same branch.

```bash
git worktree list
git worktree add --detach ../haruna_db_2023-security-pr-review-<safe-source-branch> <review-source-ref>
```

`<safe-source-branch>` is the source branch with `/`, `#`, and every character outside `A-Za-z0-9._-` replaced by `-`.

If that path already exists, reuse it only when it already points at the same source commit, or choose a suffix such
as `-2`. Do not remove an existing worktree unless the user explicitly asks.

If the main checkout has `node_modules`, symlink it into the worktree so `npm audit` can run. Do not `npm ci` or
`npm install`. Never `rm -rf` the symlink's target.

```bash
ln -s <main-checkout>/node_modules ../haruna_db_2023-security-pr-review-<safe-source-branch>/node_modules
```

Run every remaining command with that worktree as the working directory.

### Step 4: Gather Diff Information

Use the **three-dot diff** to show only what the source branch adds since diverging from the target:

```bash
git log <review-target-ref>..<review-source-ref> --oneline
git diff <review-target-ref>...<review-source-ref> --name-only
git diff <review-target-ref>...<review-source-ref>
```

Identify all modified files before proceeding.

### Step 5: Check for Project-Specific Security Conventions

Read `doc/conventions-and-standards/security.md` from **inside the review worktree** (the branch under review may have
changed it).

Layer any project-specific rules found on top of the general checklist — see **Section 12 (Project-Specific
Conventions)** in [REFERENCE.md](../security-review/references/REFERENCE.md). If that doc disagrees with this skill,
the docs win.

### Step 6: Run Dependency Vulnerability Audit

From inside the review worktree:

```bash
npm audit
```

Skip it and say `not run` when the lockfile or `node_modules` is missing. Do not install dependencies. Refer to
**Section 11** in [REFERENCE.md](../security-review/references/REFERENCE.md).

### Step 7: Review Against Security Conventions & Output Report

Load and apply all rules from [REFERENCE.md](../security-review/references/REFERENCE.md) — Sections 1 through 12 —
against the diff content gathered in Step 4, layered with anything found in Step 5.

Use the **Output Report Template** defined at the bottom of
[REFERENCE.md](../security-review/references/REFERENCE.md), with the heading:

```
## Security PR Review Report: `<source-branch>` → `<target-branch>`
```

### Step 8: Clean Up the Review Worktree

After preparing the review report and before sending the final response, return to the main checkout and remove the
dedicated review worktree:

```bash
git worktree remove ../haruna_db_2023-security-pr-review-<safe-source-branch>
```

If cleanup fails because files changed during checks, report the worktree path and the cleanup error in the final
response instead of force-removing it.
