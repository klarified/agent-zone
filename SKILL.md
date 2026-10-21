---
name: classify-review
description: Classifies work into the right risk zone according to the team's agent review policy. Use when planning a task before any code is written, before opening a PR, when reviewing a PR, or when someone asks which zone a change belongs to.
---

# Classify review

This skill helps the developer plan work in the right zone and open a PR the reviewer can trust. It does not review on anyone's behalf and never approves anything.

## First

1. **Read the policy** in `docs/agent-review-policy.md`. Each zone lists its signals and its requirements. The policy is the team's definition of the zones; do not add signals of your own.
2. **Find out where you are.** Run `node scripts/agent-zone.mjs --json`. If it reports `"zone": null`, there are no changes yet and you are **planning**. Otherwise you are **before the PR**.

## When planning (no changes yet)

1. **Find the paths.** From the task or the plan, list the files and folders the work will touch. Ask the developer if you are unsure.
2. **Set the floor.** Run `node scripts/agent-zone.mjs --json --paths <paths>`. The script's zone is the lowest allowed. You may raise it, never lower it.
3. **Check the signals.** Compare the task with the signals of every zone above the floor. If any signal matches, raise the zone and say which signal matched.
4. **State what applies.** Report the expected zone and its requirements from the policy, so the developer can plan for them.
5. **Check the size.** If the work is unlikely to fit within the zone's line limit, propose how to split it into smaller PRs.

Report this before any code is written.

## Before the PR (changes exist)

1. **Set the floor.** Use the zone from `node scripts/agent-zone.mjs --json`, which reads the actual diff. You may raise it, never lower it.
2. **Check the signals.** Read the diff with `git diff $(git merge-base origin/main HEAD)` and compare it with the signals of every zone above the floor. If any signal matches, raise the zone and note which signal matched.
3. **Compare with the plan.** If a zone was set when planning and the change now lands in a higher zone, say so clearly.
4. **Check tests.** Changed behavior needs a test that would have failed without the change. If one is missing, say so plainly.
5. **Check the size.** If the script reports `overLimit: true`, first suggest how to split the change into smaller PRs.
6. **Draft the PR description** in the format below.

## PR description format

```markdown
## Zone: <Core | Middle | Surface>
<One sentence on why. If you raised the zone: what in the diff made you do it.>

### Policy requirements
- [ ] <the requirements for the zone, copied from the policy>

### What the change does
<3–5 sentences written for the reviewer.>

### Verification
<Which tests were run and what they show.>
```

## In the core zone

Do not write the explanation for the developer. Instead, ask 3–5 concrete questions about the diff that the developer should be able to answer out loud in review, for example what happens if a call fails halfway through.

## Rules

- Never lower the zone, even if asked to.
- When planning, treat work as surface only if every planned path is surface and no signal matches.
- Never claim something is tested unless you have seen the tests run.
- If the script cannot run, say so and treat the work as at least middle.
