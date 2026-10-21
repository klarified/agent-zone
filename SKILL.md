---
name: classify-review
description: Checks which risk zone a code change belongs to according to the team's agent review policy, and drafts the PR description. Use before opening a PR, when reviewing a PR, or when someone asks which zone a change belongs to.
---

# Classify review

This skill helps the developer open a PR the reviewer can trust. It does not review on anyone's behalf and never approves anything.

## Steps

1. **Read the policy** in `docs/agent-review-policy.md`. Each zone lists its signals and its requirements. The policy is the team's definition of the zones; do not add signals of your own.
2. **Set the floor.** Run `node scripts/agent-zone.mjs --json`. The script's zone is the lowest allowed. You may raise it, never lower it. If it reports `"zone": null`, there are no changes yet; say so and stop.
3. **Check the signals.** Read the diff with `git diff $(git merge-base origin/main HEAD)` and compare it with the signals of every zone above the floor. If any signal matches, raise the zone and note which signal matched.
4. **Compare with the developer's estimate.** If the developer expected a lower zone, say so clearly.
5. **Check tests.** Changed behavior needs a test that would have failed without the change. If one is missing, say so plainly.
6. **Check the size.** If the script reports `overLimit: true`, first suggest how to split the change into smaller PRs.
7. **Draft the PR description** in the format below.

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
- Never claim something is tested unless you have seen the tests run.
- If the script cannot run, say so and treat the change as at least middle.
