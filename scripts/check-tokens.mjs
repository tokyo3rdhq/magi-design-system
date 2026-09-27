#!/usr/bin/env node
/**
 * Token literal CI check.
 *
 * Enforces that component CSS only references design-system tokens (var(--magi-*)),
 * not raw color/spacing literals. Tokens are the source of truth — design
 * language drift is caught here before consumers see it.
 *
 * MUST NOT violations fail the build:
 *   - Hex colors (#abc, #abcdef, #abcdef00) outside tokens/
 *   - rgb() / rgba() outside tokens/
 *
 * SHOULD violations print a warning (do not fail):
 *   - Hardcoded font sizes (14px, 1rem) outside tokens/
 *   - Hardcoded durations (120ms, 200ms) outside tokens/
 *
 * LOCAL CONSTANT (always allowed):
 *   - 1px borders
 *   - 2px outline offsets
 *   - translate() transforms
 *   - Line-height ratios (1.4, 1.5, etc. — used in component-level overrides)
 *
 * Usage: node scripts/check-tokens.mjs
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'packages/design-system/src';
const TOKENS_DIR = 'tokens';

/**
 * Files / selectors exempt from literal checks. The exemption is narrow
 * and explicit; do not extend without justification.
 *
 *   - Foundation globals' data-magi-accent preset block: defines accent
 *     presets as raw hex values (since the tokens themselves can't
 *     reference tokens).
 */
const SELECTOR_ALLOWLIST = [
  { file: 'foundation/globals.css', pattern: /data-magi-accent="/ },
];

const HEX_PATTERN = /(?<![\w-])#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])/g;
const RGB_PATTERN = /\brgba?\s*\(/g;
const DURATION_PATTERN = /(?<![\w-])(\d{2,4})\s*ms(?![\w-])/g;
const PX_FONT_PATTERN = /font-size\s*:\s*(\d+)\s*px/g;
const URL_PATTERN = /url\s*\(\s*['"]?[^'"\)]+['"]?\s*\)/g;

/**
 * Recursively walk a directory and yield .css files.
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
    } else if (entry.endsWith('.css')) {
      yield full;
    }
  }
}

/**
 * Strip CSS comments so we don't false-positive on commented-out literals.
 */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '));
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

  let raw;
  try {
    raw = readFileSync(file, 'utf8');
  } catch {
    continue;
  }

  const lines = stripUrls(stripComments(raw)).split('\n');
  const fileAllowlist = SELECTOR_ALLOWLIST.filter((a) => rel.includes(a.file));

  // Track "are we inside an allowlisted block?" — open on the selector line,
  // close on the matching `}` (using a simple brace counter).
  let inAllowBlock = false;
  let allowBlockDepth = 0;

  lines.forEach((line, i) => {
    if (isTokenFile) return; // tokens/* is the allowlist

    // Detect opening of an allowlisted selector block.
    if (!inAllowBlock && fileAllowlist.some((a) => a.pattern.test(line))) {
      inAllowBlock = true;
      allowBlockDepth = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      if (allowBlockDepth <= 0) inAllowBlock = false;
      return;
    }

    if (inAllowBlock) {
      allowBlockDepth += (line.match(/\{/g) || []).length;
      allowBlockDepth -= (line.match(/\}/g) || []).length;
      if (allowBlockDepth <= 0) inAllowBlock = false;
      return;
    }

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
      // Allow short delays under 10ms (used for things like 1ms / 0.01ms reduced-motion).
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