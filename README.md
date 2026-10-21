# Agent zone

Give AI-assisted changes review requirements that match their risk. The team writes down, in plain words, what each zone requires. A Claude Code skill reads that policy and classifies a change before the PR. Optionally, a small script adds a deterministic floor the agent cannot argue its way below. By [Klarified](https://klarified.ai).

> **This is a sketch to transfer an idea, not code to adopt.**
> These files show one way of thinking about review and responsibility for AI-assisted code. They have only been run on small sample repositories, never in a real codebase or CI pipeline. Read them, discuss them, take what makes sense, and rewrite the rest in your own words and your own stack.

## The idea

- **Not all code deserves the same review.** A change to payments or personal data needs someone who can explain it. A change to an internal tool may only need an agent's review and a green build.
- **Who wrote the code matters less than who understands it.** The zones describe how much human understanding and review a change needs, not whether a human or an agent typed it.
- **Words first, automation second.** The team's policy is the source of truth. The skill applies it. The script is optional and only sets a floor.

## Start small

The minimum is two files:

1. **Policy** (`docs/agent-review-policy.md`): the team's plain-text definition of each zone, with examples, the signals that put a change there, and what is required before merge. Write this together.
2. **Skill** (`.claude/skills/classify-review/SKILL.md`): runs before the PR. It reads the policy, classifies the actual diff, checks for meaningful tests and drafts the PR description. In the core zone it asks the developer questions instead of explaining the change for them.

Add these later, if they prove useful:

3. **Zone map and script** (`docs/agent-zones.json`, `scripts/agent-zone.mjs`): map paths to zones and give the same answer every time. The skill then treats the script's zone as a floor. Useful as a CI check once the zones are stable.
4. **Guard** (`.github/CODEOWNERS`): branch protection can require a human owner to approve core changes, whether or not anyone ran the skill. This only works with **Require review from Code Owners** turned on.
5. **PR template** (`.github/pull_request_template.md`): makes zone and verification part of every PR.

## Install

Copy the files you want by hand, or from the root of your repository:

```
git clone https://github.com/klarified/agent-zone.git ../agent-zone
node ../agent-zone/install.mjs
```

The installer only copies files into place. It never overwrites existing files (use `--force` to overwrite) and changes nothing else.

| File in this repo | Installed to |
|---|---|
| `agent-review-policy.md` | `docs/agent-review-policy.md` |
| `SKILL.md` | `.claude/skills/classify-review/SKILL.md` |
| `agent-zones.json` | `docs/agent-zones.json` |
| `agent-zone.mjs` | `scripts/agent-zone.mjs` |
| `pull_request_template.md` | `.github/pull_request_template.md` |
| `CODEOWNERS` | `.github/CODEOWNERS` |

The script needs Node 18 or later. Using Codex instead of Claude Code? Move `SKILL.md` to `.agents/skills/classify-review/`.

## Run

In Claude Code: `/classify-review`

If you use the script:

```
node scripts/agent-zone.mjs            # readable summary of the diff
node scripts/agent-zone.mjs --json     # what the skill reads
node scripts/agent-zone.mjs --check    # exits 1 if a zone's maxAddedLines is exceeded
node scripts/agent-zone.mjs --paths services/payments web/src/components   # which zone is this folder?
node scripts/agent-zone.mjs --base origin/develop --config docs/agent-zones.json
```

Without `--base`, the script compares against `origin/main`. Uncommitted changes and new files count too. With `--paths`, it skips git entirely; a folder counts as core if anything inside it is core.

## How the script counts

- **Core always wins.** A file matching a core path is core, even if it also matches a surface path.
- **Surface is explicit.** Only files that match a surface path are surface. Everything else is middle.
- **The change takes its highest zone.** One core file makes the whole change core.
- **Only app code is counted.** Tests, fixtures, docs, lockfiles and generated files are listed under `notAppCode`, and so are files marked `linguist-generated` in `.gitattributes`. They still decide the zone, but their lines are reported separately.
- **There are no size limits by default.** If the team wants one, add `"maxAddedLines": 300` (or any number) to a zone. Only added app code counts toward it.

## Base branch and code owners

- If your main branch is not `origin/main`, pass `--base` to the script and change the `git diff` commands in `SKILL.md` to match.
- To make CODEOWNERS a requirement rather than a request, turn on **Require review from Code Owners** in the branch protection rule (or ruleset) for your main branch.

## License

MIT. See [LICENSE](LICENSE).
