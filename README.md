# Agent zone

Give AI-assisted code different review requirements depending on where in the system it lands. A script sets the minimum zone from the changed paths, and a Claude Code skill may raise it but never lower it. By [Klarified](https://klarified.ai).

## How it fits together

1. **Zone map** (`docs/agent-zones.json`): which paths are *core* and which are *surface*. Everything else is *middle*.
2. **Script** (`scripts/agent-zone.mjs`): reads the diff, assigns a zone per file and counts changed lines. Same answer every time, and it runs in CI.
3. **Skill** (`.claude/skills/classify-review/SKILL.md`): reads the policy, looks for risk the paths miss, checks for tests and drafts the PR description.
4. **Guard** (`.github/CODEOWNERS`): branch protection requires a human owner to approve core changes, whether or not anyone ran the skill.

## Install

From the root of your repository:

```
git clone https://github.com/klarified/agent-zone.git ../agent-zone
node ../agent-zone/install.mjs
```

The installer places the files below and never overwrites existing files (use `--force` to overwrite):

| File in this repo | Installed to |
|---|---|
| `agent-zones.json` | `docs/agent-zones.json` |
| `agent-review-policy.md` | `docs/agent-review-policy.md` |
| `agent-zone.mjs` | `scripts/agent-zone.mjs` |
| `SKILL.md` | `.claude/skills/classify-review/SKILL.md` |
| `pull_request_template.md` | `.github/pull_request_template.md` |
| `CODEOWNERS` | `.github/CODEOWNERS` |

Requires Node 18 or later. Using Codex instead of Claude Code? Move `SKILL.md` to `.agents/skills/classify-review/`.

## Run

```
node scripts/agent-zone.mjs            # readable summary
node scripts/agent-zone.mjs --json     # what the skill reads
node scripts/agent-zone.mjs --check    # exits 1 if the change is too large for its zone
node scripts/agent-zone.mjs --base origin/develop --config docs/agent-zones.json
```

In Claude Code: `/classify-review`

## Rules of the zone map

- **Core always wins.** A file matching a core path is core, even if it also matches a surface path (for example a test file inside a core service).
- **Surface is explicit.** Only files that match a surface path are surface.
- **Everything else is middle.** Unknown paths never become surface.
- **The change takes its highest zone.** One core file makes the whole change core.

The paths and line limits in `agent-zones.json` are examples. Replace them with your own.

## License

MIT. See [LICENSE](LICENSE).
