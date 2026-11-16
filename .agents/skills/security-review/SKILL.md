---
name: security-review
description: Review code changes for security vulnerabilities — SQL injection, XSS, CSRF, mass assignment, authorization/access control, hardcoded credentials, insecure logging of secrets or PII, insecure client-side storage, and vulnerable dependencies. Use when the user asks for a security review, security audit, vulnerability check, or wants to know if code is secure. Do NOT use for general code quality (logic, formatting, naming, architecture) — use code-review for that. Do NOT use for a branch-to-branch security diff — use security-pr-review for that.
metadata:
    usage: '@security-review code-or-branch'
    example: '@security-review current code changes'
    conventions: '@ref ./references/REFERENCE.md'
compatibility: Requires git. The dependency audit uses npm audit.
allowed-tools: Bash(git:*) Bash(npm:*) Read Grep
---

## What I Do

Perform a structured, security-only review of code changes and output a detailed report with a risk-weighted verdict and status
per security category. All review rules and the output report template are defined
in [REFERENCE.md](./references/REFERENCE.md).

Rate every finding by **severity** and **likelihood of occurring in reality**, and derive the final verdict
(Pass / Pass with comments / Fail) from those ratings as defined in **Risk Assessment & Verdict** in
[REFERENCE.md](./references/REFERENCE.md). Rare or theoretical issues must not fail otherwise working code — do not chase perfection
or invent findings to appear useful.

Review local changes in the user's current worktree and workspace. Do not create, switch to, or clean up a
separate `git worktree` for this skill; the purpose is to inspect the exact unpushed changes the user is working
on before they push to remote.

This skill focuses **solely** on security. For logic, formatting, naming, architecture, and other code-quality
concerns, use the `code-review` skill instead.

## When to Use Me

Trigger when the user says any of:

* "security review", "review security", "security audit"
* "check for vulnerabilities", "check for security issues"
* "is this code secure", "audit this code for security"

Do NOT trigger for general code review of logic, formatting, or architecture (use `code-review` for that), for a
security diff between two branches (use `security-pr-review`), or for general coding assistance.

## My Procedures

### Step 1: Gather Information

Stay in the current repository checkout and workspace. Do not run `git checkout`, `git switch`, or
`git worktree` commands for this review.

Run the following to understand what changed:

```bash
git status
git diff
```

Identify all modified files before proceeding. When the user asked to review committed but unpushed work, include
that commit range without switching branches, and say which range you reviewed.

### Step 2: Check for Project-Specific Security Conventions

Before reviewing, read [security.md](../../../doc/conventions-and-standards/security.md).

Layer those rules on top of [REFERENCE.md](./references/REFERENCE.md). If that doc disagrees with this skill, the docs
win. See **Section 12 (Project-Specific Conventions)**.

### Step 3: Run Dependency Vulnerability Audit

From the repository root:

```bash
npm audit
```

Skip it and say `not run` when `package-lock.json` or `node_modules` is missing. Do not run `npm install` or
`composer audit`. Do not treat a dev-only advisory as a production breach unless the vulnerable path is actually
shipped or exercised. See **Section 11 (Dependency Vulnerabilities)**.

### Step 4: Review Against Security Conventions

Load and apply all rules from [REFERENCE.md](./references/REFERENCE.md) — Sections 1 through 12 — against the
diff gathered in Step 1, layered with anything found in Step 2.

### Step 5: Output Report

Use the **Output Report Template** defined at the bottom of [REFERENCE.md](./references/REFERENCE.md).
