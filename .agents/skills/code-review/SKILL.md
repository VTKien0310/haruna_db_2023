---
name: code-review
description: Review code changes following project conventions. Use when the user asks for code review, code analysis, or wants to check code quality of the current working tree. Do NOT use for general coding tasks unrelated to reviewing existing changes, or for a diff between two branches (use pr-review).
metadata:
    usage: '@review code-or-branch'
    example: '@review current code changes'
    conventions: '@ref ./references/REFERENCE.md'
---

## What I Do

Perform a structured code review against project conventions and output a detailed report with a risk-weighted verdict and status per
category. All review rules and the output report template are defined
in [REFERENCE.md](./references/REFERENCE.md).

Rate every finding by **severity** and **likelihood of occurring in reality**, and derive the final verdict
(Pass / Pass with comments / Fail) from those ratings as defined in **Risk Assessment & Verdict** in
[REFERENCE.md](./references/REFERENCE.md). Rare or theoretical issues must not fail otherwise working code — do not chase perfection
or invent findings to appear useful.

This skill covers logic, formatting, naming, and architecture. For security-specific review (SQL injection,
XSS, CSRF, hardcoded credentials, insecure logging, vulnerable dependencies, and so on), use the `security-review`
skill instead.

Review local changes in the user's current worktree and workspace. Do not create, switch to, or clean up a separate
`git worktree` for this skill; the purpose is to inspect the exact unpushed changes the user is working on before they
push to remote.

## When to Use Me

Trigger when the user says any of:

* "review code", "review this", "code review"
* "analyze code", "analyze changes"
* "check code", "review changes"

Do NOT trigger for general coding assistance, writing new code, or explaining concepts. Do NOT trigger for a review of
one branch against another (use `pr-review`).

## My procedures

### Step 1: Gather Information

Stay in the current repository checkout and workspace. Do not run `git checkout`, `git switch`, or `git worktree`
commands for this review.

Run the following to understand what changed:

```bash
git status
git diff
```

Identify all modified files before proceeding. When the user asked to review committed but unpushed work, include
`git diff @{upstream}...HEAD` or `git log` for those commits as well, and say which range you reviewed. Do not switch
branches to obtain it.

### Step 2: Run Checks

Run checks from the repository root. Report results. Do not auto-fix, format, or start Docker, Supabase, a dev
server, or Edge Functions. Do not read `.env*` files or credentials.

Formatting, on changed files that Prettier formats (skip paths ignored by `.prettierignore`):

```bash
npx --no-install prettier --check <changed-files>
```

Do not run `npm run format` or `prettier --write`.

When the diff changes TypeScript, Vue, or type-check config, run:

```bash
npm run type-check
```

When the diff changes behavior, run the smallest relevant application tests:

```bash
npm test -- <test-paths>
```

Map `src/modules/<module>/` to `tests/modules/<module>/`, and likewise for `src/ports/` and `src/libs/ui/`. Follow
[application-tests.md](../../../doc/conventions-and-standards/application-tests.md): no network, no Docker, no Supabase, no
env files. Documentation-only diffs skip type-check and tests. If `node_modules` is missing, say those checks were
not run instead of installing dependencies.

Refer to **Section 1 (Code Formatting)** and **Tool gates** in [REFERENCE.md](./references/REFERENCE.md).

### Step 3: Review Against Conventions

Load and apply all rules from [REFERENCE.md](./references/REFERENCE.md) — Sections 1 through 9. Re-read
[coding.md](../../../doc/conventions-and-standards/coding.md) before judging
architecture or style. If that doc disagrees with this skill, the docs win.

### Step 4: Output Report

Use the **Output Report Template** defined at the bottom of [REFERENCE.md](./references/REFERENCE.md).
