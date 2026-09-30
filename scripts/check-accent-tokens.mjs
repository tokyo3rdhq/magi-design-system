#!/usr/bin/env node
/**
 * Accent single source of truth check.
 *
 * Enforces that the 5 accent presets defined in `tokens/accent-presets.ts`
 * (the framework-agnostic source of truth) match the corresponding
 * `data-magi-accent="<name>"` rules in `foundation/globals.css` (the CSS-side
 * fallback for `<div data-magi-accent>` subtree accent overrides).
 *
 * The four accent tokens are checked:
 *   --magi-accent            (hex)
 *   --magi-accent-hover      (hex)
 *   --magi-accent-soft       (rgba)
 *   --magi-accent-contrast   (hex)
 *
 * If any drift, an `<AppTheme accent="cyan">` would set different CSS vars
 * than a `<div data-magi-accent="cyan">` subtree — confusing for consumers.
 * The 0.6.0 release shipped without `-soft` / `-contrast` in the CSS rules,
 * which the verify-theme-accent-matrix.mjs script caught (40/90 cells fail
 * with `--magi-accent-soft` resolving to the parent's value). This script
 * catches the same drift at the unit-test step so it never reaches CI.
 *
 * Allowed asymmetry: globals.css may have semantic presets (danger /
 * warning / success) that aren't in ACCENT_PRESETS — they reference
 * semantic tokens (--magi-error / --magi-warning / --magi-success), not
 * raw hex. The script only requires the 5 JS presets to match the CSS.
 *
 * Usage: node scripts/check-accent-tokens.mjs
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'packages/design-system/src';
// As of 0.5.1, the framework-agnostic source of truth for accent presets
// lives in `tokens/accent-presets.ts` (a pure TS module with zero React
// dependencies). `src/theme.tsx` imports from there. The CI script follows
// the source of truth, not the React runtime.
const ACCENT_PRESETS_FILE = join(ROOT, 'tokens/accent-presets.ts');
const GLOBALS = join(ROOT, 'foundation/globals.css');

/**
 * Parse `ACCENT_PRESETS` from tokens/accent-presets.ts without compiling
 * TypeScript.
 *
 * Captures: <name>: { '--magi-accent': '#hex', '--magi-accent-hover': '#hex',
 *                       '--magi-accent-soft': 'rgba(...)',
 *                       '--magi-accent-contrast': '#hex', ... }
 */
function parseThemeAccents(src) {
  const out = {};
  // Match each preset block: `name: { ... '--magi-accent': '#hex', ... }`
  const presetRe = /(\w+):\s*\{([^{}]+)\}/g;
  let m;
  while ((m = presetRe.exec(src)) !== null) {
    const [, name, body] = m;
    if (!['green', 'cyan', 'violet', 'amber', 'white'].includes(name)) continue;
    const entry = {};
    // Match hex values for --magi-accent, --magi-accent-hover, --magi-accent-contrast.
    const hexRe = /'--(magi-accent(?:-hover|-contrast)?)':\s*'(#[0-9a-fA-F]{3,8})'/g;
    let v;
    while ((v = hexRe.exec(body)) !== null) {
      const [, key, value] = v;
      entry[key] = value;
    }
    // Match rgba values for --magi-accent-soft.
    const rgbaRe = /'--(magi-accent-soft)':\s*'(rgba\([^)]+\))'/g;
    while ((v = rgbaRe.exec(body)) !== null) {
      const [, key, value] = v;
      entry[key] = value;
    }
    out[name] = entry;
  }
  return out;
}

/**
 * Parse `data-magi-accent="<name>"` blocks from globals.css.
 *
 * Captures: [data-magi-app] [data-magi-accent="<name>"] {
 *             --magi-accent: #hex;
 *             --magi-accent-hover: #hex;
 *             --magi-accent-soft: rgba(...);
 *             --magi-accent-contrast: #hex; ... }
 *
 * Only counts the 5 accent presets (green/cyan/violet/amber/white). The
 * semantic presets (danger/warning/success) use var(--magi-*) tokens, not
 * raw hex, and aren't subject to this check.
 */
function parseGlobalsAccents(src) {
  const out = {};
  // Strip CSS comments first.
  const stripped = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const blockRe = /\[data-magi-app\]\s*\[data-magi-accent="(\w+)"\]\s*\{([^}]+)\}/g;
  let m;
  while ((m = blockRe.exec(stripped)) !== null) {
    const [, name, body] = m;
    if (!['green', 'cyan', 'violet', 'amber', 'white'].includes(name)) continue;
    const entry = {};
    // Match hex values for --magi-accent, --magi-accent-hover, --magi-accent-contrast.
    const hexRe = /--(magi-accent(?:-hover|-contrast)?):\s*(#[0-9a-fA-F]{3,8})/g;
    let v;
    while ((v = hexRe.exec(body)) !== null) {
      const [, key, value] = v;
      entry[key] = value;
    }
    // Match rgba values for --magi-accent-soft.
    const rgbaRe = /--(magi-accent-soft):\s*(rgba\([^)]+\))/g;
    while ((v = rgbaRe.exec(body)) !== null) {
      const [, key, value] = v;
      entry[key] = value;
    }
    out[name] = entry;
  }
  return out;
}

const themeSrc = readFileSync(ACCENT_PRESETS_FILE, 'utf8');
const globalsSrc = readFileSync(GLOBALS, 'utf8');

const themeAccents = parseThemeAccents(themeSrc);
const globalsAccents = parseGlobalsAccents(globalsSrc);

const errors = [];

// Each preset must exist in both files with the same values.
for (const name of new Set([...Object.keys(themeAccents), ...Object.keys(globalsAccents)])) {
  const t = themeAccents[name];
  const g = globalsAccents[name];

  if (!t) {
    errors.push(`"${name}" exists in globals.css but not in theme.tsx (ACCENT_PRESETS missing).`);
    continue;
  }
  if (!g) {
    errors.push(`"${name}" exists in theme.tsx (ACCENT_PRESETS) but not in globals.css. Add a [data-magi-accent="${name}"] block in globals.css with matching hex values.`);
    continue;
  }

  for (const key of ['magi-accent', 'magi-accent-hover', 'magi-accent-soft', 'magi-accent-contrast']) {
    if (t[key] !== g[key]) {
      errors.push(
        `"${name}" --${key} mismatch:\n` +
        `    tokens/accent-presets.ts (source of truth):  ${t[key]}\n` +
        `    foundation/globals.css (data-magi-accent):  ${g[key]}\n` +
        `    Update one to match the other — they must stay in sync.`,
      );
    }
  }
}

if (errors.length > 0) {
  console.error('Accent source-of-truth check failed:\n');
  for (const err of errors) {
    console.error(`  ${err}\n`);
  }
  process.exit(1);
}

console.log(
  `Accent source-of-truth check passed (${Object.keys(themeAccents).length} presets cross-validated).`,
);