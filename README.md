# Agent zone

Give AI-assisted code different review requirements depending on where in the system it lands. A script sets the minimum zone from the changed paths, and a Claude Code skill may raise it but never lower it. By [Klarified](https://klarified.ai).

> **Status: concept.** A starting point for discussing review requirements for AI-assisted code. It has only been tried on small sample repositories, not in a real codebase or CI pipeline. Read the files before installing them, and expect to change them.

## How it fits together

1. **Zone map** (`docs/agent-zones.json`): which paths are *core* and which are *surface*. Everything else is *middle*.
2. **Script** (`scripts/agent-zone.mjs`): assigns a zone per path, either from the actual diff or, when planning, from the paths you intend to touch (`--paths`). Counts changed lines for the diff. Deterministic by design, so it can be used as a CI check.
3. **Policy** (`docs/agent-review-policy.md`): the team's plain-text definition of each zone, with the signals that put a change there and the requirements before merge.
4. **Skill** (`.claude/skills/classify-review/SKILL.md`): used twice. When planning, it predicts the zone from the planned paths and the task, so the work can be shaped for it. Before the PR, it checks the actual diff, raises the zone when a signal matches, checks for tests and drafts the PR description.
5. **Guard** (`.github/CODEOWNERS`): branch protection can require a human owner to approve core changes, whether or not anyone ran the skill. This only works with **Require review from Code Owners** turned on (see below).

## Install

From the root of your repository:

```
git clone https://github.com/klarified/agent-zone.git ../agent-zone
node ../agent-zone/install.mjs
```

The installer only copies six files into place. It never overwrites existing files (use `--force` to overwrite) and changes nothing else. Prefer to see first? Copy the files by hand using the table below.

| File in this repo | Installed to |
|---|---|
| `agent-zones.json` | `docs/agent-zones.json` |
| `agent-review-policy.md` | `docs/agent-review-policy.md` |
| `agent-zone.mjs` | `scripts/agent-zone.mjs` |
| `SKILL.md` | `.claude/skills/classify-review/SKILL.md` |
| `pull_request_template.md` | `.github/pull_request_template.md` |
| `CODEOWNERS` | `.github/CODEOWNERS` |

Requires Node 18 or later. Using Codex instead of Claude Code? Move `SKILL.md` to `.agents/skills/classify-review/`.

## After installing

1. **Zone map.** Replace the example paths in `docs/agent-zones.json` with your own core and surface paths, and adjust `maxChangedLines` for each zone.
2. **Policy.** Fill in examples and signals for each zone in `docs/agent-review-policy.md`.
3. **Base branch.** The script compares against `origin/main` by default. If your main branch has another name, pass `--base` and change the `git diff` command in `SKILL.md` to match.
4. **Code owners.** Add your core paths and their owners to `.github/CODEOWNERS`. Then turn on **Require review from Code Owners** in the branch protection rule (or ruleset) for your main branch. Without that setting, GitHub only requests a review from the owners; it does not require one.
5. **Try it.** On a branch with changes, run `node scripts/agent-zone.mjs` and check that the zone matches what the team would have chosen.

## Run

```
node scripts/agent-zone.mjs            # readable summary of the diff
node scripts/agent-zone.mjs --json     # what the skill reads
node scripts/agent-zone.mjs --check    # exits 1 if the change is too large for its zone
node scripts/agent-zone.mjs --paths services/payments web/src/components   # planning, before any code exists
node scripts/agent-zone.mjs --base origin/develop --config docs/agent-zones.json
```

Without `--base`, the script compares against `origin/main`. Uncommitted changes and new files count too. With `--paths`, it skips git entirely; a folder counts as core if anything inside it is core.

In Claude Code: `/classify-review`

## Rules of the zone map

- **Core always wins.** A file matching a core path is core, even if it also matches a surface path (for example a test file inside a core service).
- **Surface is explicit.** Only files that match a surface path are surface.
- **Everything else is middle.** Unknown paths never become surface.
- **The change takes its highest zone.** One core file makes the whole change core.

The paths and line limits in `agent-zones.json` are examples. Replace them with your own.

## License

MIT. See [LICENSE](LICENSE).
