#!/usr/bin/env node
/**
 * Theme × Accent verification matrix (per docs/theme_accent_verification.md)
 *
 * Static CSS cascade resolver. Reads tokens/colors.css + foundation/globals.css
 * + tokens/accent-presets.ts, builds a synthetic CSS scope for each combination
 * of theme + accent, and computes the resolved CSS custom property values.
 *
 * Validates three orthogonal claims:
 *
 *   1. THEME ORTHOGONALITY: theme tokens (--magi-bg-*, --magi-text-*,
 *      --magi-border*, --magi-scrollbar-*, --magi-selection-*,
 *      --magi-logo-color) must not depend on the accent axis. For all
 *      same-theme pairs across different (accent, subtree-accent) values,
 *      theme tokens must be identical.
 *
 *   2. ACCENT ORTHOGONALITY: accent tokens (--magi-accent, -hover, -soft,
 *      -contrast) must not depend on the theme axis. For all same-accent
 *      pairs across different themes, accent tokens must be identical.
 *
 *   3. ACCENT SOURCE-OF-TRUTH: subtree accent (data-magi-accent="<name>")
 *      and AppTheme accent ("<name>") must produce the SAME values for
 *      the four accent tokens. They both derive from ACCENT_PRESETS.
 *
 * Usage: node scripts/verify-theme-accent-matrix.mjs
 *
 * Exit code: 0 = pass, 1 = fail (anomalies found).
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'packages/design-system/src';
const COLORS_SRC = readFileSync(join(ROOT, 'tokens/colors.css'), 'utf8');
const GLOBALS_SRC = readFileSync(join(ROOT, 'foundation/globals.css'), 'utf8');
const ACCENT_PRESETS_SRC = readFileSync(join(ROOT, 'tokens/accent-presets.ts'), 'utf8');

/* ------------------------------------------------------------------ */
/* Parse accent-presets.ts.                                          */
/* ------------------------------------------------------------------ */

function parseAccentPresets(src) {
  // Strip /* ... */ comments and // line comments.
  const stripped = src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/[^\n]*/g, '$1');

  // Extract the body of `ACCENT_PRESETS: Record<AppAccent, AccentTokens> = { … };`
  const m = stripped.match(/ACCENT_PRESETS:\s*Record<AppAccent,\s*AccentTokens>\s*=\s*\{([\s\S]*?)\n\};/);
  if (!m) throw new Error('Could not find ACCENT_PRESETS object in accent-presets.ts');

  const body = m[1];
  const result = {};
  // Each preset is `<name>: { '--k': 'value', ... }`.
  const re = /(\w+)\s*:\s*\{([^{}]*)\}/g;
  let match;
  while ((match = re.exec(body)) !== null) {
    const [, name, block] = match;
    const tokens = {};
    for (const decl of block.split(',')) {
      const trimmed = decl.trim();
      if (!trimmed) continue;
      const colon = trimmed.indexOf(':');
      if (colon === -1) continue;
      const prop = trimmed.slice(0, colon).trim().replace(/^['"]|['"]$/g, '');
      const value = trimmed.slice(colon + 1).trim().replace(/^['"]|['"]$/g, '');
      tokens[prop] = value;
    }
    result[name] = tokens;
  }
  return result;
}

const ACCENT_PRESETS = parseAccentPresets(ACCENT_PRESETS_SRC);

/* ------------------------------------------------------------------ */
/* Parse colors.css and globals.css into rules.                         */
/* ------------------------------------------------------------------ */

function parseBlocks(src) {
  // Strip /* ... */ comments.
  src = src.replace(/\/\*[\s\S]*?\*\//g, '');

  const blocks = [];
  let i = 0;
  while (i < src.length) {
    const braceStart = src.indexOf('{', i);
    if (braceStart === -1) break;
    const selectorPart = src.slice(i, braceStart).trim();

    // Find matching close brace.
    let depth = 1;
    let j = braceStart + 1;
    while (j < src.length && depth > 0) {
      if (src[j] === '{') depth++;
      else if (src[j] === '}') depth--;
      j++;
    }
    const body = src.slice(braceStart + 1, j - 1);

    // At-rule (e.g. @layer) → recurse into body, flatten.
    if (selectorPart.startsWith('@')) {
      blocks.push(...parseBlocks(body));
      i = j;
      continue;
    }

    // Parse declarations.
    const declarations = {};
    for (const decl of body.split(';')) {
      const trimmed = decl.trim();
      if (!trimmed) continue;
      const colon = trimmed.indexOf(':');
      if (colon === -1) continue;
      const prop = trimmed.slice(0, colon).trim();
      const value = trimmed.slice(colon + 1).trim();
      declarations[prop] = value;
    }

    // Comma-separated selectors → one block each, each sharing declarations.
    for (const sel of selectorPart.split(',').map((s) => s.trim())) {
      if (sel) blocks.push({ selector: sel, declarations });
    }

    i = j;
  }
  return blocks;
}

const COLOR_BLOCKS = parseBlocks(COLORS_SRC);
const GLOBAL_BLOCKS = parseBlocks(GLOBALS_SRC);

/* ------------------------------------------------------------------ */
/* Resolve CSS variable references.                                  */
/* ------------------------------------------------------------------ */

function resolveVar(value, scope, depth = 0) {
  if (depth > 8) return value;
  const m = value.match(/^var\(\s*(--[a-z0-9-]+)\s*(?:,\s*([^)]*))?\s*\)$/i);
  if (!m) return value;
  const [, varName, fallback] = m;
  if (scope[varName] !== undefined) {
    return resolveVar(scope[varName], scope, depth + 1);
  }
  return fallback !== undefined ? resolveVar(fallback, scope, depth + 1) : value;
}

/* ------------------------------------------------------------------ */
/* Build the synthetic CSS scope for a given configuration.            */
/* ------------------------------------------------------------------ */

/**
 * Returns a NEW scope object (a copy of the cascade resolved values)
 * for the given configuration. The AppTheme runtime writes 4 accent
 * CSS variables on <html> at mount; subtree accents override via the
 * `[data-magi-accent="<name>"]` rules in globals.css.
 *
 * @param {object} cfg
 * @param {'dark'|'light'} cfg.theme
 * @param {'green'|'cyan'|'violet'|'amber'|'white'} [cfg.appAccent='green']
 * @param {string|null} [cfg.subtreeAccent=null] — name of a `data-magi-accent`
 *   attribute applied to a subtree element. Null = no subtree accent.
 * @returns {object} scope: { '--magi-token': 'value', ... }
 */
function buildScope({ theme, appAccent = 'green', subtreeAccent = null }) {
  const scope = {};

  // 1. Apply every `:root` rule (defaults for all tokens).
  for (const block of COLOR_BLOCKS) {
    if (block.selector === ':root') {
      Object.assign(scope, block.declarations);
    }
  }

  // 2. Theme overrides. For Dark, the `:root, [data-magi-theme="dark"]` rule
  //    sets dark values. For Light, `[data-magi-theme="light"]` overrides.
  //    When theme='dark', the dark rule was already merged via `:root` above.
  if (theme === 'light') {
    for (const block of COLOR_BLOCKS) {
      if (block.selector === '[data-magi-theme="light"]') {
        Object.assign(scope, block.declarations);
      }
    }
  }

// 3. AppTheme runtime: writes the 4 accent CSS variables on <html>.
  if (appAccent !== 'green') {
    const accentValues = ACCENT_PRESETS[appAccent];
    if (accentValues) {
      scope['--magi-accent'] = accentValues['--magi-accent'];
      scope['--magi-accent-hover'] = accentValues['--magi-accent-hover'];
      scope['--magi-accent-soft'] = accentValues['--magi-accent-soft'];
      scope['--magi-accent-contrast'] = accentValues['--magi-accent-contrast'];
    }
  }

  // 4. Subtree accent: matches the `[data-magi-app] [data-magi-accent="<name>"]`
  //    rule. Note: the CSS rules in globals.css ONLY set --magi-accent and
  //    --magi-accent-hover. The soft/contrast values fall back to whatever
  //    the parent AppTheme wrote. Check 3 verifies this asymmetry.
  if (subtreeAccent) {
    const selector = `[data-magi-accent="${subtreeAccent}"]`;
    for (const block of GLOBAL_BLOCKS) {
      // Compound selector ends with `[data-magi-accent="<name>"]`
      const endsWithSubtreeAccent = block.selector.endsWith(selector);
      if (endsWithSubtreeAccent) {
        Object.assign(scope, block.declarations);
      }
    }
  }

  // 4. Subtree accent: matches the `[data-magi-app] [data-magi-accent="<name>"]`
  //    rule. Note: the CSS rules in globals.css ONLY set --magi-accent and
  //    --magi-accent-hover. The soft/contrast values fall back to whatever
  //    the parent AppTheme wrote. This is a known asymmetry.
  if (subtreeAccent) {
    const selector = `[data-magi-accent="${subtreeAccent}"]`;
    for (const block of GLOBAL_BLOCKS) {
      // Compound selector ends with `[data-magi-accent="<name>"]`
      const endsWithSubtreeAccent = block.selector.endsWith(selector);
      if (endsWithSubtreeAccent) {
        Object.assign(scope, block.declarations);
      }
    }
  }

  // 5. Resolve `var(--x)` references transitively. We copy first to avoid
  //    mutating the source values during iteration.
  for (const k of Object.keys(scope)) {
    if (k.startsWith('--magi-')) {
      scope[k] = resolveVar(scope[k], scope);
    }
  }

  return scope;
}

/* ------------------------------------------------------------------ */
/* Run the matrix.                                                     */
/* ------------------------------------------------------------------ */

const THEME_TOKENS = [
  '--magi-bg-base',
  '--magi-bg-raised',
  '--magi-bg-card',
  '--magi-bg-card-hover',
  '--magi-surface',
  '--magi-surface-elevated',
  '--magi-text-primary',
  '--magi-text-secondary',
  '--magi-text-tertiary',
  '--magi-text-inverse',
  '--magi-border',
  '--magi-border-strong',
  '--magi-scrollbar-thumb',
  '--magi-scrollbar-thumb-hover',
  '--magi-selection-bg',
  '--magi-selection-fg',
  '--magi-logo-color',
];

const ACCENT_TOKENS = [
  '--magi-accent',
  '--magi-accent-hover',
  '--magi-accent-soft',
  '--magi-accent-contrast',
];

const THEMES = ['dark', 'light'];
const APP_ACCENTS = ['green', 'cyan', 'violet', 'amber', 'white'];
const SUBTREE_ACCENTS = [null, 'green', 'cyan', 'violet', 'amber', 'white', 'danger', 'warning', 'success'];

const cases = [];
for (const theme of THEMES) {
  for (const appAccent of APP_ACCENTS) {
    for (const subtreeAccent of SUBTREE_ACCENTS) {
      cases.push({ theme, appAccent, subtreeAccent });
    }
  }
}

const failures = [];
const summary = { total: cases.length, passed: 0, failed: 0 };

for (const c of cases) {
  const scope = buildScope(c);
  const errors = [];

  // CHECK 1: Theme orthogonality. Theme tokens must not change when
  // accent / subtree-accent change (same theme).
  const themeBaseline = buildScope({
    theme: c.theme,
    appAccent: 'green',
    subtreeAccent: null,
  });
  for (const tok of THEME_TOKENS) {
    if (scope[tok] !== themeBaseline[tok]) {
      errors.push(
        `THEME-TOKEN LEAK: ${tok} = ${scope[tok]} (expected ${themeBaseline[tok]}) — ` +
          `accent=${c.appAccent}${c.subtreeAccent ? ' subtree=' + c.subtreeAccent : ''} changed a theme token`
      );
    }
  }

  // CHECK 2: Accent orthogonality (no subtree accent). Accent tokens
  // must not change when theme changes (same accent).
  if (c.subtreeAccent === null) {
    const accentBaseline = buildScope({
      theme: 'dark',
      appAccent: c.appAccent,
      subtreeAccent: null,
    });
    for (const tok of ACCENT_TOKENS) {
      if (scope[tok] !== accentBaseline[tok]) {
        errors.push(
          `THEME-AFFECTS-ACCENT: ${tok} = ${scope[tok]} (expected ${accentBaseline[tok]}) — ` +
            `theme=${c.theme} changed an accent token`
        );
      }
    }
  }

  // CHECK 3: Accent source-of-truth. data-magi-accent="<name>" must set
  // ALL FOUR accent tokens to the same value as AppTheme accent="<name>".
  // (Real CSS rule asymmetry: globals.css [data-magi-accent="<name>"] rules
  // only set --magi-accent and --magi-accent-hover. soft/contrast fall
  // back to whatever the AppTheme wrote. This is a known bug.)
  if (
    c.subtreeAccent &&
    ['green', 'cyan', 'violet', 'amber', 'white'].includes(c.subtreeAccent)
  ) {
    const subtreeScope = buildScope({
      theme: c.theme,
      appAccent: 'green',
      subtreeAccent: c.subtreeAccent,
    });
    const appScope = buildScope({
      theme: c.theme,
      appAccent: c.subtreeAccent,
      subtreeAccent: null,
    });
    for (const tok of ACCENT_TOKENS) {
      if (subtreeScope[tok] !== appScope[tok]) {
        errors.push(
          `ACCENT SOURCE-OF-TRUTH DIVERGENCE: data-magi-accent="${c.subtreeAccent}" sets ` +
            `${tok}=${subtreeScope[tok]} but AppTheme accent="${c.subtreeAccent}" sets ` +
            `${tok}=${appScope[tok]}`
        );
      }
    }
  }

  if (errors.length) {
    failures.push({ case: c, errors });
    summary.failed++;
  } else {
    summary.passed++;
  }
}

/* ------------------------------------------------------------------ */
/* Render the matrix + report.                                       */
/* ------------------------------------------------------------------ */

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';

console.log('');
console.log(BOLD + 'MAGI Theme × Accent Verification Matrix' + RESET);
console.log('─'.repeat(60));
console.log(
  `${THEMES.length} themes × ${APP_ACCENTS.length} app accents × ${SUBTREE_ACCENTS.length} subtree accents = ${cases.length} cells`
);
console.log(`${THEME_TOKENS.length} theme tokens + ${ACCENT_TOKENS.length} accent tokens verified per cell`);
console.log('');

// Categorize failures by check type.
const byCheck = { 'THEME-TOKEN LEAK': 0, 'THEME-AFFECTS-ACCENT': 0, 'ACCENT SOURCE-OF-TRUTH DIVERGENCE': 0 };
for (const f of failures) {
  for (const err of f.errors) {
    if (err.startsWith('THEME-TOKEN LEAK')) byCheck['THEME-TOKEN LEAK']++;
    else if (err.startsWith('THEME-AFFECTS-ACCENT')) byCheck['THEME-AFFECTS-ACCENT']++;
    else if (err.startsWith('ACCENT SOURCE-OF-TRUTH')) byCheck['ACCENT SOURCE-OF-TRUTH DIVERGENCE']++;
  }
}
console.log('Failure breakdown by check:');
console.log(`  • THEME-TOKEN LEAK:                  ${byCheck['THEME-TOKEN LEAK']}`);
console.log(`  • THEME-AFFECTS-ACCENT:              ${byCheck['THEME-AFFECTS-ACCENT']}`);
console.log(`  • ACCENT SOURCE-OF-TRUTH DIVERGENCE: ${byCheck['ACCENT SOURCE-OF-TRUTH DIVERGENCE']}`);
console.log('');

if (failures.length === 0) {
  console.log(GREEN + BOLD + `✓ ${summary.passed}/${summary.total} cells pass` + RESET);
  console.log('');
  console.log('Orthogonality confirmed:');
  console.log('  • Theme tokens do not leak across accent.');
  console.log('  • Accent tokens do not leak across theme.');
  console.log('  • Subtree accent matches AppTheme accent (single source of truth).');
  console.log('');
  process.exit(0);
}

console.log(RED + BOLD + `✗ ${summary.failed}/${summary.total} cells FAILED` + RESET);
console.log('');
console.log('FAILURES:');
for (const f of failures) {
  console.log('');
  console.log(
    YELLOW +
      BOLD +
      `Cell: theme=${f.case.theme}, appAccent=${f.case.appAccent}${
        f.case.subtreeAccent ? ', subtreeAccent=' + f.case.subtreeAccent : ''
      }` +
      RESET
  );
  for (const err of f.errors) {
    console.log(`  ${RED}•${RESET} ${err}`);
  }
}
console.log('');
process.exit(1);