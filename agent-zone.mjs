#!/usr/bin/env node
// Classifies work into a risk zone using docs/agent-zones.json.
// Core always wins. Surface applies only to files explicitly listed there.
// Everything else is middle. The work takes the highest zone among its paths.
//
// Two modes:
//   Before the PR: classifies the actual diff against the base branch.
//   Planning:      classifies the paths you intend to touch (--paths), before any code exists.
//
// Usage:
//   node scripts/agent-zone.mjs                 # readable summary of the diff
//   node scripts/agent-zone.mjs --json          # for the agent
//   node scripts/agent-zone.mjs --check         # exit 1 if the size limit is exceeded (CI)
//   node scripts/agent-zone.mjs --paths services/payments web/src/components
//   node scripts/agent-zone.mjs --base origin/develop --config docs/agent-zones.json

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const base = option('--base', 'origin/main');
const configPath = option('--config', 'docs/agent-zones.json');
const asJson = args.includes('--json');
const check = args.includes('--check');

// Everything after --paths up to the next --option is a planned path.
let plannedPaths = null;
const pathsIndex = args.indexOf('--paths');
if (pathsIndex >= 0) {
  plannedPaths = [];
  for (const a of args.slice(pathsIndex + 1)) {
    if (a.startsWith('--')) break;
    plannedPaths.push(a);
  }
  if (!plannedPaths.length) {
    console.error('Give at least one path after --paths, for example: --paths services/payments');
    process.exit(2);
  }
}

const RANK = { surface: 1, middle: 2, core: 3 };
const NAMES = { core: 'Core', middle: 'Middle', surface: 'Surface' };

const config = JSON.parse(readFileSync(configPath, 'utf8'));

// Supports ** (any number of directories), * and ?.
function globToRegExp(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*' && glob[i + 1] === '*') {
      if (glob[i + 2] === '/') {
        re += '(?:.*/)?';
        i += 2;
      } else {
        re += '.*';
        i += 1;
      }
    } else if (c === '*') {
      re += '[^/]*';
    } else if (c === '?') {
      re += '[^/]';
    } else {
      re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp('^' + re + '$');
}

const patterns = (zone) => (config.zones[zone]?.paths ?? []).map(globToRegExp);
const corePatterns = patterns('core');
const surfacePatterns = patterns('surface');

function zoneFor(path) {
  if (corePatterns.some((r) => r.test(path))) return 'core';
  if (surfacePatterns.some((r) => r.test(path))) return 'surface';
  return config.default ?? 'middle';
}

const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();

// Handles renames in --numstat output: "a => b" and "dir/{a => b}/file".
function newPath(p) {
  if (p.includes('{')) return p.replace(/\{[^}]*? => ([^}]*)\}/, '$1').replace(/\/\//g, '/');
  if (p.includes(' => ')) return p.split(' => ')[1];
  return p;
}

// Planning mode. A planned path can be a file or a folder. A folder is core if
// anything inside it is core, so a broad plan is never classified too low.
if (plannedPaths) {
  const literalPrefix = (glob) => glob.split(/[*?]/)[0];
  const coreGlobs = config.zones.core?.paths ?? [];
  const planZoneFor = (raw) => {
    const path = raw.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '');
    const candidates = [path, path + '/x'];
    if (candidates.some((c) => corePatterns.some((r) => r.test(c)))) return 'core';
    if (coreGlobs.some((g) => literalPrefix(g).startsWith(path + '/'))) return 'core';
    if (candidates.some((c) => surfacePatterns.some((r) => r.test(c)))) return 'surface';
    return config.default ?? 'middle';
  };

  const planned = plannedPaths.map((path) => ({ path, zone: planZoneFor(path) }));
  const zone = planned.reduce((z, p) => (!z || RANK[p.zone] > RANK[z] ? p.zone : z), null);
  const limit = config.zones[zone]?.maxAddedLines;

  if (asJson) {
    console.log(JSON.stringify({ mode: 'plan', zone, zoneName: NAMES[zone], limit, paths: planned }, null, 2));
  } else {
    console.log(`Planned zone: ${NAMES[zone]}`);
    if (limit !== undefined) console.log(`Limit for this zone: ${limit} added lines. Plan the work to stay under it.`);
    console.log('');
    for (const p of planned) console.log(`  ${NAMES[p.zone].padEnd(8)} ${p.path}`);
  }
  process.exit(0);
}

const mergeBase = git('merge-base', base, 'HEAD');
const files = [];

// Diff against the working tree so uncommitted changes count too.
for (const line of git('diff', '--numstat', '-M', mergeBase).split('\n').filter(Boolean)) {
  const [added, deleted, ...rest] = line.split('\t');
  files.push({ path: newPath(rest.join('\t')), added: Number(added) || 0, deleted: Number(deleted) || 0 });
}
for (const path of git('ls-files', '--others', '--exclude-standard').split('\n').filter(Boolean)) {
  let lines = 0;
  try {
    const text = readFileSync(path, 'utf8');
    lines = text ? text.split('\n').length - (text.endsWith('\n') ? 1 : 0) : 0;
  } catch {
    // Binary or unreadable file: counts as zero lines.
  }
  files.push({ path, added: lines, deleted: 0, untracked: true });
}

// Lockfiles, generated code, snapshots and build output change size without anyone
// writing them. They still decide the zone but do not count toward the line limit.
// Files marked linguist-generated in .gitattributes are treated the same way.
const ignorePatterns = (config.ignore ?? []).map(globToRegExp);
const generatedByAttribute = new Set();
if (files.length) {
  const out = execFileSync('git', ['check-attr', '--stdin', 'linguist-generated'], {
    input: files.map((f) => f.path).join('\n') + '\n',
    encoding: 'utf8',
  });
  for (const line of out.split('\n')) {
    const match = line.match(/^(.*): linguist-generated: (true|set)$/);
    if (match) generatedByAttribute.add(match[1]);
  }
}
for (const f of files) {
  f.ignored = ignorePatterns.some((r) => r.test(f.path)) || generatedByAttribute.has(f.path);
}
// Only added lines count toward the limit: they are what a reviewer has to understand.
// Deleted lines are reported separately so a large removal is still visible.
const added = (f) => (f.ignored ? 0 : f.added);
const deleted = (f) => (f.ignored ? 0 : f.deleted);

const perZone = {
  core: { files: 0, added: 0, deleted: 0 },
  middle: { files: 0, added: 0, deleted: 0 },
  surface: { files: 0, added: 0, deleted: 0 },
};
let zone = null;
for (const f of files) {
  f.zone = zoneFor(f.path);
  perZone[f.zone].files += 1;
  perZone[f.zone].added += added(f);
  perZone[f.zone].deleted += deleted(f);
  if (!zone || RANK[f.zone] > RANK[zone]) zone = f.zone;
}

const ignoredFiles = files.filter((f) => f.ignored);
const ignoredLines = ignoredFiles.reduce((sum, f) => sum + f.added + f.deleted, 0);
const addedLines = files.reduce((sum, f) => sum + added(f), 0);
const deletedLines = files.reduce((sum, f) => sum + deleted(f), 0);
const limit = zone ? config.zones[zone]?.maxAddedLines : undefined;
const overLimit = limit !== undefined && addedLines > limit;

if (asJson) {
  console.log(JSON.stringify({ mode: 'diff', base, mergeBase, zone, zoneName: zone ? NAMES[zone] : null, addedLines, deletedLines, ignoredLines, limit, overLimit, perZone, files }, null, 2));
} else if (!zone) {
  console.log(`No changes compared with ${base}.`);
} else {
  console.log(`Zone: ${NAMES[zone]}`);
  console.log(`Added lines: ${addedLines}` + (limit !== undefined ? ` (limit ${limit})` : ''));
  if (deletedLines) console.log(`Deleted lines: ${deletedLines} (not counted toward the limit)`);
  if (ignoredFiles.length) {
    const n = ignoredFiles.length;
    console.log(`Not counted: ${ignoredLines} lines in ${n} lockfile${n === 1 ? '' : 's'} or generated file${n === 1 ? '' : 's'}`);
  }
  if (overLimit) console.log('Too large for this zone. Split the change before opening a PR.');
  console.log('');
  for (const z of ['core', 'middle', 'surface']) {
    const { files: n, added: a, deleted: d } = perZone[z];
    if (n) console.log(`  ${NAMES[z].padEnd(8)} ${String(n).padStart(4)} ${n === 1 ? 'file ' : 'files'} ${String('+' + a).padStart(7)} ${String('-' + d).padStart(7)}`);
  }
  const coreFiles = files.filter((f) => f.zone === 'core');
  if (coreFiles.length) {
    console.log('\nCore files:');
    for (const f of coreFiles) console.log(`  ${f.path}`);
  }
}

process.exit(check && overLimit ? 1 : 0);
