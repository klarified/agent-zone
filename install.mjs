#!/usr/bin/env node
// Installs agent-zone into the repository you are standing in.
// Run from the repository root:  node ../agent-zone/install.mjs
// Existing files are never overwritten. Pass --force to overwrite them.

import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const kitDir = dirname(fileURLToPath(import.meta.url));
const force = process.argv.includes('--force');

const files = {
  'agent-zones.json': 'docs/agent-zones.json',
  'agent-review-policy.md': 'docs/agent-review-policy.md',
  'agent-zone.mjs': 'scripts/agent-zone.mjs',
  'SKILL.md': '.claude/skills/classify-review/SKILL.md',
  'pull_request_template.md': '.github/pull_request_template.md',
  'CODEOWNERS': '.github/CODEOWNERS',
};

if (!existsSync('.git')) {
  console.error('Run the installer from the root of your repository (where the .git folder is).');
  process.exit(1);
}

const skipped = [];
for (const [source, target] of Object.entries(files)) {
  if (existsSync(target) && !force) {
    skipped.push(target);
    continue;
  }
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(join(kitDir, source), target);
  console.log(`  created  ${target}`);
}

for (const target of skipped) console.log(`  exists   ${target}  (not overwritten)`);
if (skipped.length) console.log('\nMerge the existing files by hand, or run again with --force.');
console.log('\nNext: edit the paths in docs/agent-zones.json, then run  node scripts/agent-zone.mjs');
