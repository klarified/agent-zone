# Agent review policy

Version 0.1 · [date] · Owner: [name]

This policy describes what is required before AI-assisted code can be merged. It does not matter whether a human or an agent wrote the code; what matters is how well it must be understood and how it is reviewed. Each zone has examples and signals. If the team also uses `docs/agent-zones.json`, it maps paths to a minimum zone. When in doubt, the higher zone applies.

## Core

**Examples:** [fill in]

**Signals.** A change belongs here if it touches any of these, whatever its paths:

- sign-in, authorization, sessions or tokens
- personal data, especially sensitive personal data
- payments, fees or invoicing
- secrets, keys or production configuration
- database migrations or deletion of data

**Requirements:**

- The developer can explain every part of the diff out loud.
- Reviewed by a human who owns the area (CODEOWNERS).
- [Optional] At most [N] added lines of app code per PR. Tests, docs and generated files do not count.
- Tests for both the success and the failure path. A test counts only if it would fail without the change.
- Agent review complements human review and never replaces approval.

## Middle

**Examples:** [fill in]

**Signals.** A change belongs at least here if it touches any of these, whatever its paths:

- a public API or a shared contract between services
- business logic

**Requirements:**

- Reviewed by a human.
- Tests that prove the changed behavior.
- [Optional] At most [N] added lines of app code per PR.

## Surface

**Examples:** [fill in]

**Signals.** None. A change belongs here only if it fits the examples above and no signal from a higher zone matches. Signals never move a change down to this zone.

**Requirements:**

- Agent review is enough when verification is green.
- The change is easy to roll back.
- [Optional] At most [N] added lines of app code per PR.

## Always

- No production data and no production keys in the agent's environment.
- The PR description states the zone and the verification. The `classify-review` skill drafts it.

## Open questions

- [ ]
