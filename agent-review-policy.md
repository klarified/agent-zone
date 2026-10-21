# Agent review policy

Version 0.1 · [date] · Owner: [name]

This policy describes what is required before AI-assisted code can be merged. Which paths belong to which zone is defined in `docs/agent-zones.json`. When in doubt, the higher zone applies.

## Core

Examples: [fill in]

- The developer can explain every part of the diff out loud.
- Reviewed by a human who owns the area (CODEOWNERS).
- At most 200 changed lines per PR.
- Tests for both the success and the failure path.
- Agent review complements human review and never replaces approval.

## Middle

Examples: [fill in]

- Reviewed by a human.
- Tests that prove the changed behavior.
- At most 400 changed lines per PR.

## Surface

Examples: [fill in]

- Agent review is enough when verification is green.
- The change is easy to roll back.
- At most 800 changed lines per PR.

## Always

- No production data and no production keys in the agent's environment.
- The PR description states the zone and the verification. The `classify-review` skill drafts it.

## Open questions

- [ ]
