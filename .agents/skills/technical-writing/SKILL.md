---
name: technical-writing
description: >-
  Write and revise prose for this PWA so a tired engineer understands it on
  the first read. Use when writing or editing the README, files under doc/,
  AGENTS.md, a skill, a commit message, a pull-request body, or a user-facing
  string in a locale file, and when the user invokes @technical-writing.
  Leave a review verdict to @code-review, @pr-review, @security-review, or
  @security-pr-review. Leave committing to @git-commit and opening a pull
  request to @pr-open.
disable-model-invocation: true
metadata:
    usage: "@technical-writing <doc-or-change>"
    example: "@technical-writing revise doc/design-and-decision/haruna-ui-lib.md"
allowed-tools: Read Grep Glob Edit Write Bash(npx:*)
---

## What I Do

Apply one writing standard to Haruna DB prose. The standard has four layers: pick a single mode, write the sentence
to the reader, give each sentence one thought, and leave no sentence with two readings. Three shorter rules sit above
the layers.

The codebase is the word list. Write the real symbol, path, setting, command, or bucket name. A synonym names
something the code does not have.

If a doc and this skill disagree, the doc wins.

## When to Use Me

Use this skill for:

* `README.md`: setup, tests, PWA assets, and release
* `doc/conventions-and-standards/`: normative rules
* `doc/design-and-decision/`: why a design is the way it is
* `AGENTS.md` and skills under `.agents/skills/`
* Commit messages and pull-request bodies
* A user-facing string in `src/modules/<module>/locales/`

Leave these to their own skills:

* A review verdict belongs to `@code-review`, `@pr-review`, `@security-review`, or `@security-pr-review`.
* Creating the commit belongs to `@git-commit`.
* Opening the pull request belongs to `@pr-open`.

Do not restyle a conventions page into tutorial prose, and do not rewrite headings you were not asked to change.

## Standing rules

* Cut every word that does no work. If the sentence survives without a word, the word goes. "In order to" is "to".
* Use the short, everyday word. "Use", not "utilize". "Help", not "facilitate". A long word has to buy its length
  with precision the short word lacks.
* When a rule makes the sentence worse, fix the sentence another way or leave it alone. A sentence that follows every
  rule and sounds like a machine wrote it has failed.

State the fact. Use a negative when the distinction is the rule, as in "A client route guard does not enforce
authorization." Skip filler, hedging, and pre-announcements ("it is important to note", "simply", "easy", "quickly",
"we will soon"). If the step were simple, the reader would not be here.

## Rhythm

A page can obey every layer and still read machine-written: every sentence the same length, no judgment anywhere,
nothing specific.

* Mix lengths on purpose. A short sentence lands a point. A longer one carries a fact with its condition.
* One thought per sentence does not mean one length per sentence. Split the sentence that carries two thoughts. Keep
  the long sentence that carries one.
* Have a view where the mode allows it. A design note weighs a trade-off and says what the design makes of it.
  A conventions page stays dry.
* Be specific. "`UploadMediaService` returns `false` and the toast says the upload failed" beats "some uploads can
  fail".

## Pick the mode first

One document, one mode. Two questions pick it: does the page inform action or understanding, and does it serve
learning or work?

* Action and learning: a tutorial. This repo rarely needs one. When it does, keep it out of `doc/`.
* Action and work: a how-to. The README.
* Understanding and work: reference. Conventions, `AGENTS.md`, and skills.
* Understanding and learning: explanation. `doc/design-and-decision/`.

Name the mode before drafting. An edit keeps the mode the file already has.

**How-to.** Solve the task the reader has. Assume they can run a shell, and skip teaching Vue. Every step is a
command, and the next sentence says what they should see. Link background instead of explaining it.

> Run `npx supabase start`, then `npm ci`, then `npm run dev`. In a second terminal, run
> `supabase functions serve --env-file ./supabase/functions/.env.local`. Leave both running while you work on a
> feature that calls an Edge Function.

**Reference.** Describe the rule. No persuasion, no history. An existing conventions page keeps its headings and
voice. `coding.md`, `security.md`, and `git.md` use a bold title and **Must** or **Should**. `application-tests.md`
is reference prose with sentence-case headings. Do not restyle one into the other. A new conventions page follows
its closest sibling.

> Must use `Promise<boolean>` or `void` for service control flow. An expected failure shows a toast and does not throw.

**Explanation.** One bounded why, readable away from the editor. Give the constraint, the decision, and the
alternative you rejected. `doc/design-and-decision/haruna-ui-lib.md` is the model. A table states a rule. It does
not turn the page into a conventions file. A new design note uses one sentence-case title and headings that carry
the point ("Fixed visual states", not "Styling"). Update `doc/design-and-decision/erd.dbml` when a schema change
affects the ERD. Do not narrate that file as prose.

> A Haruna control owns its colors, borders, and radii. The page sets layout, documented sizes, and native attributes.

**Agent reference.** `AGENTS.md` and a skill tell an agent what to do. Match the sibling shape when editing a skill:
what it does, when to use it, then the procedure. Point at a file. Do not turn a skill into an essay.

> A service in `src/modules/<module>/services/` owns the business logic. It accesses a store through `use*Store()`
> and reaches the backend only through `backendPort`.

Do not mix modes. A how-to does not argue a design. A conventions page does not walk through setup. A design note
does not become a list of **Must** lines. Split and link.

## Sentences

Talk to the reader as "you", in the present tense, on a how-to, a design note, a pull-request body, and a locale
string. "Will" is for something that happens later. A conventions page stays impersonal and uses **Must** or
**Should**.

* Say who does what. "The service inserts the media row" beats "the media row is inserted". Passive is fine when the
  actor is unknown or beside the point.
* Write a step as a command. "Run `npm test -- tests/modules/gallery`." Put the condition before the action. "To run
  one module's tests, pass the directory: `npm test -- tests/modules/gallery`."
* Put the common case first. Exceptions after.
* Headings on a new design note carry the point and use sentence case. A task heading is a bare verb phrase. A
  concept heading is a noun phrase. One title per page, and no skipped levels. A conventions page keeps its own
  heading style.
* Number a sequence. Use bullets for everything else. Introduce a list with a complete sentence, and keep the items
  parallel.
* Put code, paths, commands, and symbols in code font. Use a serial comma. Say up front that a list is partial.
* A link uses the page title or a short description of the destination. Prefer a sentence of context on the page
  over a link off it.

## One thought at a time

* One instruction per sentence. One thought per sentence everywhere else.
* Treat about 20 words for an instruction, and about 25 for any other sentence, as a check. Split when a sentence
  is doing two jobs. Keep it when the length is one thought with its condition. The standing rules outrank the count.
* Put the warning or the condition before the step it guards.
* Keep "the" and "a". "Delete media row" reads two ways. "Delete the media row" reads one.
* Give each word one meaning, then keep it. If "check" means inspect, do not also use it for the test suite. Say
  "run the tests".
* Pick one verb per action and stick to it. "Return `Promise<boolean>`" on every page that means that, not "yield a
  flag" on the next page.
* Write a procedure as commands, addressed to the reader.
* Prefer a finite verb over an "-ing" word when both say the same thing.

## One reading

* Keep "only" and "not" next to the word they change. "A store exposes only `ref` and `computed`" limits what the
  store contains. "A service reaches the backend only through `backendPort`" limits the path. Both can be true.
  Pick the one you mean.
* Break a long noun string. "The gallery media upload service" becomes "the service that uploads the original"
  (`UploadMediaService`).
* Make every "it", "they", and "this" point at one noun. Repeat the noun when two nouns are in play. Do not let
  "this" or "which" point at a whole clause.
* Do not drop a verb. "The page loads the list and the service the row" leaves the service without one.
* Keep the small words that show structure, such as "that" in "Ensure that the test calls `makeBackendFake()`".
* Repeat the article in a series when dropping it can merge two things. "The page and the service" are two layers.
* When "and" or "or" can group two ways, say which parts they join. "Both … and", "either … or", and "if … then"
  do that work.
* Use periods. Give an aside its own sentence. Text in parentheses is a full grammatical unit or its own sentence.
  Do not form a plural with "(s)". Write "a file, files, or both" instead of "a/b" or "and/or".
* Call each thing by one name, on every page. A note that says "the backend", "the client", and "the adapter" for
  `backendPort` teaches three things. Use the name the code or the design note already uses (`backendPort`,
  `BackendApiResult`, `makeBackendFake()`, `appMountOptions()`, `HForm`, `useHarunaUiService()`, `erd.dbml`). Do not
  invent a second name for the Custom API or for Haruna UI.
* Skip idioms, colloquialisms, and Latin abbreviations.

## Commit messages and pull requests

Commit messages follow [git.md](../../../doc/conventions-and-standards/git.md) §4. The layers above apply inside
that template. Do not invent a second format. `@git-commit` creates the commit.

A pull-request body is a briefing a reviewer can read in a minute: what changed, why, and the setup the change
requires (a new dependency, a migration, an environment change, or master data), per §3 of that doc. Link the design
note when one exists. Leave logs and metric tables out of the body. `@pr-open` opens the pull request.

## Locale strings

A string in `src/modules/<module>/locales/` matches the length and voice that file already uses: a label, a
fragment, or one or two short sentences in the present tense. Address the reader as "you" when that file already
does. `toast()` and `confirm()` are plain text, so the string is plain text. Reuse the `{name}` placeholder style
that file already uses. Do not put HTML in the string. Edit the file that already owns the key. Do not add a locale
framework or a second language.

> Couldn't upload {name}

## Procedure

1. Read the page you are changing, and read a sibling page in the same directory before starting a new one.
2. Name the mode. Keep the mode the file already has.
3. Read the code, command, or design note the page names. The word list is those files: `backendPort`,
   `backendPort.spbClient`, `functions.invoke()`, `BackendApiResult`, `use*Store()`, `makeBackendFake()`,
   `src/modules/`, `src/libs/ui/`, `src/ports/`, `supabase/functions/`.
4. Draft in that one mode. Confirm every path, symbol, command, and count against the code. If you cannot confirm a
   number, omit it.
5. Format the changed files with `npx --no-install prettier --write <changed-files>`.
6. Read the page once as a tired engineer. You can name the mode in one word. Every code span exists. No sentence
   does two jobs. A conventions page still uses its own headings and, where that file does, **Must** or **Should**.

Then report the files changed, the mode of each page, and any symbol you corrected because the draft had invented a
name.

## Worked example

Before:

> Configuration of backend access is performed via the backend port. It is important to note that writing should
> only be done through that port, while tests also support constructing a client directly. Since privileged
> credentials must not live in the frontend, authorization cannot be checked there.

After, in the voice of `AGENTS.md`:

> Every backend call goes through `backendPort`. `backendPort.spbClient` covers Supabase queries, storage, and
> `functions.invoke()`. `backendPort.get<T>()` and `post<T>()` cover the Custom API. Tests call `makeBackendFake()`.
> They do not construct a Supabase client. The frontend never holds a service-role key.
