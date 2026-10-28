---
name: git-commit
description: Commit the current changes on the current branch with a message that follows the project's git conventions. Use when the user asks to commit, make a commit, or commit the code. Do NOT use for reviewing changes (use code-review), creating branches (use git-branching), pushing, or opening pull requests.
metadata:
    usage: '@commit changes-to-commit'
    example: '@commit current code changes'
    conventions: '@ref ../../../doc/conventions-and-standards/git.md'
---

## What I Do

Commit the user's changes on the **current** branch, with a commit message that follows
**§4 Commit message** of [git.md](../../../doc/conventions-and-standards/git.md) — the single source of truth for the
project's git conventions. Do not copy or restate those rules elsewhere; read them from `git.md` every time.

* Never create, switch, or rename branches.
* Never push, amend, rebase, or force anything unless the user explicitly asks.

## When to Use Me

Trigger when the user says any of:

* "commit", "commit this", "commit the code", "commit my changes"
* "make a commit", "create a commit"

Do NOT trigger for code review, branch creation, pushing, or pull requests.

## My procedures

### Step 1: Gather Information

```bash
git status
git diff
git diff --staged
git log -5 --oneline
git branch --show-current
```

If there is nothing to commit, stop and say so.

### Step 2: Load the Commit Message Convention

Read **§4 Commit message** in [git.md](../../../doc/conventions-and-standards/git.md) (template, commit types,
guidelines, example). Apply it exactly when drafting the message in Step 5.

### Step 3: Safety Gate

* Never stage `.env*` files (the `*.example` templates are fine), `*.pem`, `*.key`, or any other file containing
  secrets. If one shows up in the changes, leave it unstaged and warn the user. Do not open credential files to
  inspect them.
* Never stage `coverage/` or `supabase/.temp/`.
* Do not stage generated `src/ports/backend/database.types.ts` unless the user asked to regenerate database types.
* There is no documentation submodule. Markdown under `doc/` may be committed when it is part of the change the user
  asked to save.

### Step 4: Scope the Commit

* Stage files explicitly by path — do not use `git add -A` or `git add .`.
* Respect what the user has already staged; ask before staging more.
* If the changes cover unrelated concerns, propose splitting them into separate commits, each with its own message.

### Step 5: Draft and Confirm

Draft the message per §4 of `git.md`. Pick the commit type from what the change actually does, not just from the
branch's group. Show the user the staged file list and the drafted message, and wait for confirmation before
committing.

### Step 6: Commit

Pass the message through a HEREDOC so its formatting is preserved, and append any attribution trailer the harness
requires:

```bash
git commit -F - <<'EOF'
<type>: <Short summary in sentence case>

- <bullet>
EOF
```

Do not use `--no-verify`. If a hook fails, fix the issue, re-stage, and create a new commit (do not `--amend`).

### Step 7: Verify

```bash
git log -1 --stat
git status
```

Report the commit hash and summary line to the user.
