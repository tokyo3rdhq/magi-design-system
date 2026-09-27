#!/usr/bin/env node
/**
 * Token literal CI check.
 *
 * Enforces that component CSS / TSX / TS only references design-system
 * tokens (var(--magi-*)), not raw color/spacing literals. Tokens are the
 * source of truth — design language drift is caught here before consumers
 * see it.
 *
 * MUST NOT violations fail the build:
 *   - Hex colors (#abc, #abcdef, #abcdef00) outside tokens/ or allowlist
 *   - rgb() / rgba() outside tokens/ or allowlist
 *   - Hex / rgb / rgba literals in TSX / TS files outside the allowlist
 *
 * SHOULD violations print a warning (do not fail):
 *   - Hardcoded font sizes (14px, 1rem) outside tokens/
 *   - Hardcoded durations (120ms, 200ms) outside tokens/
 *
 * LOCAL CONSTANT (always allowed):
 *   - 1px borders
 *   - 2px outline offsets
 *   - translate() transforms
 *   - Line-height ratios (1.4, 1.5, etc.)
 *
 * Usage: node scripts/check-tokens.mjs
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'packages/design-system/src';
const TOKENS_DIR = 'tokens';

/**
 * Files where literals are allowed without justification. Paths are relative
 * to ROOT (so `foundation/globals.css`, not the full path). The exemption is
 * narrow and explicit; do not extend without justification.
 *
 *   - foundation/globals.css: contains the data-magi-accent preset block
 *     (raw hex values for accent presets).
 *   - theme.tsx: ACCENT_PRESETS is the *source of truth* for accent values.
 *     The corresponding CSS rules in globals.css are derived from this
 *     object — the cross-check is enforced by scripts/check-accent-tokens.mjs.
 */
const FILE_ALLOWLIST = new Set([
  'foundation/globals.css',
  'theme.tsx',
]);

const HEX_PATTERN = /(?<![\w-])#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])/g;
const RGB_PATTERN = /\brgba?\s*\(/g;
const DURATION_PATTERN = /(?<![\w-])(\d{2,4})\s*ms(?![\w-])/g;
const PX_FONT_PATTERN = /font-size\s*:\s*(\d+)\s*px/g;
const URL_PATTERN = /url\s*\(\s*['"]?[^'"\)]+['"]?\s*\)/g;

/**
 * Recursively walk a directory and yield source files (.css, .ts, .tsx).
 */
function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      yield* walk(full);
    } else if (
      entry.endsWith('.css') ||
      entry.endsWith('.ts') ||
      entry.endsWith('.tsx')
    ) {
      yield full;
    }
  }
}

/**
 * Strip CSS comments so we don't false-positive on commented-out literals.
 */
function stripCssComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

/**
 * Strip JS/TS block + line comments. String literals are preserved (hex
 * inside strings is still a literal we want to flag).
 */
function stripJsComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + m.slice(p1.length).replace(/[^\n]/g, ' '));
}

/**
 * Strip url() values (image references may legitimately contain # in data URLs).
 */
function stripUrls(src) {
  return src.replace(URL_PATTERN, (match) => match.replace(/[^\n]/g, ' '));
}

const errors = [];
const warnings = [];

for (const file of walk(ROOT)) {
  const rel = file;
  const isTokenFile = rel.includes(`/${TOKENS_DIR}/`);
  const relFromRoot = rel.startsWith(`${ROOT}/`) ? rel.slice(ROOT.length + 1) : rel;
  const isAllowedFile = FILE_ALLOWLIST.has(relFromRoot);

  if (isTokenFile || isAllowedFile) continue;

  let raw;
  try {
    raw = readFileSync(file, 'utf8');
  } catch {
    continue;
  }

  const isCss = rel.endsWith('.css');
  const stripped = stripUrls(
    isCss ? stripCssComments(raw) : stripJsComments(raw),
  );
  const lines = stripped.split('\n');

  lines.forEach((line, i) => {
    let m;

    HEX_PATTERN.lastIndex = 0;
    while ((m = HEX_PATTERN.exec(line)) !== null) {
      errors.push({
        file: rel,
        line: i + 1,
        rule: 'hex color',
        match: m[0],
        text: line.trim(),
      });
    }

    RGB_PATTERN.lastIndex = 0;
    while ((m = RGB_PATTERN.exec(line)) !== null) {
      errors.push({
        file: rel,
        line: i + 1,
        rule: 'rgb()/rgba()',
        match: m[0],
        text: line.trim(),
      });
    }

    DURATION_PATTERN.lastIndex = 0;
    while ((m = DURATION_PATTERN.exec(line)) !== null) {
      const ms = Number(m[1]);
      if (ms < 10) continue;
      warnings.push({
        file: rel,
        line: i + 1,
        rule: 'hardcoded duration',
        match: m[0],
        text: line.trim(),
      });
    }

    PX_FONT_PATTERN.lastIndex = 0;
    while ((m = PX_FONT_PATTERN.exec(line)) !== null) {
      warnings.push({
        file: rel,
        line: i + 1,
        rule: 'font-size px',
        match: m[0],
        text: line.trim(),
      });
    }
  });
}

if (warnings.length > 0) {
  console.log(`\n  ${warnings.length} token warning(s) — should review:\n`);
  for (const w of warnings.slice(0, 20)) {
    console.log(`  ${w.file}:${w.line}  [${w.rule}]  ${w.text}`);
  }
  if (warnings.length > 20) {
    console.log(`  ... and ${warnings.length - 20} more\n`);
  }
}

if (errors.length > 0) {
  console.error(`\n  ${errors.length} token error(s) — failing:\n`);
  for (const e of errors) {
    console.error(`  ${e.file}:${e.line}  [${e.rule}]  ${e.match}`);
    console.error(`    ${e.text}`);
  }
  process.exit(1);
}

console.log(`Token literal check passed (${warnings.length} warning${warnings.length === 1 ? '' : 's'}).`);