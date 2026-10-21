# Agent review policy

Version 0.1 · [date] · Owner: [name]

This policy describes what is required before AI-assisted code can be merged. Which paths belong to which zone is defined in `docs/agent-zones.json`. A change can also be raised to a higher zone by the signals listed under each zone, whatever its paths. When in doubt, the higher zone applies.

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
- At most 200 changed lines per PR.
- Tests for both the success and the failure path.
- Agent review complements human review and never replaces approval.

## Middle

**Examples:** [fill in]

**Signals.** A change belongs at least here if it touches any of these, whatever its paths:

- a public API or a shared contract between services
- business logic

**Requirements:**

- Reviewed by a human.
- Tests that prove the changed behavior.
- At most 400 changed lines per PR.

## Surface

**Examples:** [fill in]

**Signals.** None. Only paths listed under `surface` in `docs/agent-zones.json` belong here, and signals never move a change down to this zone.

**Requirements:**

- Agent review is enough when verification is green.
- The change is easy to roll back.
- At most 800 changed lines per PR.

## Always

- No production data and no production keys in the agent's environment.
- The PR description states the zone and the verification. The `classify-review` skill drafts it.

## Open questions

- [ ]
