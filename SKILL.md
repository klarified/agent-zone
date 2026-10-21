---
name: classify-review
description: Checks which risk zone a code change belongs to according to the team's agent review policy, and drafts the PR description. Use before opening a PR, when reviewing a PR, or when someone asks which zone a change belongs to.
---

# Classify review

This skill helps the developer open a PR the reviewer can trust. It does not review on anyone's behalf and never approves anything.

## Steps

1. **Read the policy** in `docs/agent-review-policy.md`. Each zone lists its examples, its signals and its requirements. The policy is the team's definition of the zones; do not add signals of your own.
2. **Check that there is a change.** Run `git diff --stat $(git merge-base origin/main HEAD)` and `git status --short`. If nothing has changed, say so and stop.
3. **Set the floor, if the team uses one.** If both `scripts/agent-zone.mjs` and `docs/agent-zones.json` exist, run `node scripts/agent-zone.mjs --json`. Its zone is the lowest allowed: you may raise it, never lower it. If they do not exist, there is no floor and you classify from the policy alone.
4. **Classify from the policy.** Read the diff with `git diff $(git merge-base origin/main HEAD)` and compare it with the examples and signals of each zone. Choose the highest zone that matches. A change is surface only if it fits the surface examples and no signal from a higher zone matches. Say which example or signal decided it.
5. **Compare with the developer's estimate.** If the developer expected a lower zone, say so clearly.
6. **Check tests.** Changed behavior needs a test that would have failed without the change. If one is missing, say so plainly. Also point out tests that only exercise mocks, generated fixtures or assertions that cannot fail.
7. **Check the size.** If the policy sets a size limit for the zone, or the script reports `overLimit: true`, first suggest how to split the change into smaller PRs. Only app code counts; tests, docs and generated files do not.
8. **Draft the PR description** in the format below.

## PR description format

```markdown
## Zone: <Core | Middle | Surface>
<One sentence on why: the example or signal that decided it.>

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

- Never lower the zone, whether below the script's floor or because someone asks.
- When unsure between two zones, choose the higher one and say what made you unsure.
- Never claim something is tested unless you have seen the tests run.
