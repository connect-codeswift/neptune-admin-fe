---
name: verify-before-done
description: Fan out three agents — one running typecheck, one lint, one build — collect their reports and loop until all are clear. Use at the end of every task that touched code, before reporting the work as done, and whenever asked to verify, check or confirm a change builds.
---

<!-- Mirror of .cursor/rules/verify-before-done.mdc — edit both, keep the bodies identical. -->

# Verify before calling a task done

No task is finished until all three checks are green:

| Check     | Command                             |
| --------- | ----------------------------------- |
| typecheck | `npx tsc --noEmit -p tsconfig.json` |
| lint      | `npm run lint`                      |
| build     | `npm run build`                     |

There are no tests in this repo. These three are the whole safety net, so none is optional and
none is "probably fine".

## Fan out — one agent per check

Run all three **concurrently**, one subagent each, launched in a single message so they start
together rather than queueing. `npm run build` dominates the wall clock; typecheck and lint
finish inside it for free.

```
          ┌─ agent: typecheck ─┐
orchestrator ─┼─ agent: lint ──────┼─→ orchestrator collects verdicts → fixes → re-runs
          └─ agent: build ─────┘
```

**Each agent is a read-only reporter.** Its whole job is: run its one command, and report what
happened. It must not edit a file, fix a problem, or run the other two commands. Three agents
editing the same working tree at once will clobber each other, and an agent that "helpfully"
fixed something the orchestrator never saw is worse than a red check.

Give each agent this report format so the verdicts are comparable:

```
CHECK:    typecheck | lint | build
STATUS:   PASS | FAIL
EXIT:     <exit code>
PROBLEMS: <error/warning counts, or "none">
OUTPUT:   <the failing lines, verbatim — do not summarize or paraphrase them>
```

The **orchestrator** owns everything after that: it reads the three reports, fixes the causes
itself, and re-runs. Re-run only the checks that failed plus any a fix could plausibly have
broken — a fix for a type error warrants typecheck and build, not necessarily lint. Loop until
all three report PASS.

One ordering caveat: `next build` writes `.next/`, and typecheck reads generated types from
there. If the typecheck agent reports errors that live only under `.next/types` or
`.next/dev/types`, they are stale-generated-file noise from the concurrent build — not real.
Re-run typecheck alone once the build has finished before believing them.

## What "cleared" means

| Check           | Cleared when                                                                 |
| --------------- | ---------------------------------------------------------------------------- |
| `tsc --noEmit`  | exit 0, no errors                                                            |
| `npm run lint`  | **no problem your change introduced** — the repo has a known baseline, below |
| `npm run build` | exit 0, build completes                                                      |

`npm run lint` is **clean**: 0 errors, 0 warnings, exit 0, as of 2026-08-18. There is no
baseline to subtract any more — any problem it reports is one you introduced, so the bar is
simply that all three checks come back green.

Keep it that way. The pool of "pre-existing noise to ignore" is gone, and it is much cheaper to
fix one warning now than to let it become the next accepted baseline.

The one standing exception is `@next/next/no-img-element`: previews of arbitrary user-uploaded
remote files carry `// eslint-disable-next-line @next/next/no-img-element` plus a reason, because
`next/image` needs intrinsic dimensions the app does not have. Nine sites do this. If you add a
tenth, write the justification too — and never use a bare disable to silence anything else.

## Fix the cause, not the check

Never clear a check by silencing it:

- No `// eslint-disable*` added to make lint pass.
- No `@ts-ignore` / `@ts-expect-error` / `as any` / widening a type to make `tsc` pass.
- No deleting or commenting out the code that fails.

`npm run lint:fix` and `npm run format` are fine for genuinely mechanical fixes (import order,
spacing, quotes). Read what they changed before moving on.

## Stay in your lane

Fix what **your change** broke. Do not repair unrelated pre-existing problems from the baseline
table while you happen to be in the file — that inflates the diff and buries the actual work.
If one genuinely blocks you, say so rather than fixing it silently.

## If a check will not clear

Report it. Say which check, paste the actual output, and state what you tried. A task with a red
check is **not** done, and describing it as done — or as "done except for a small lint issue" —
is the failure mode this rule exists to prevent.
