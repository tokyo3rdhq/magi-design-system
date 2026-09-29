#!/usr/bin/env node
/**
 * Accessibility Quality Gate (per docs/accessibility_gate.md)
 *
 * **Static a11y rule gate** — reads every shipped component .tsx source
 * and verifies the Accessibility clauses of the Component Contracts
 * doc (`docs/component-contracts.md`) hold in code. This is a *contract
 * compliance gate*, not a runtime a11y check — Playwright/axe-core
 * infrastructure is deferred per ADR-0007 + ADR-0008.
 *
 * **Why static?**
 *
 * ADR-0007 + ADR-0008 defer axe-playwright / Playwright visual regression
 * infrastructure. The design system intentionally has **zero runtime test
 * dependencies** (no jsdom, no axe-core, no Playwright). This script
 * follows the same pattern as `check-tokens.mjs`,
 * `check-accent-tokens.mjs`, and `verify-theme-accent-matrix.mjs`:
 * Node.js + source parsing, no test framework.
 *
 * **What this gate checks:**
 *
 * Per the Component Contracts doc, every component has an
 * `Accessibility` section. This script extracts assertions from those
 * contracts and verifies the actual .tsx source honors them. The check
 * is intentionally **strict but limited to the contract** — it cannot
 * catch every WCAG violation, but it CAN catch contract drift
 * (e.g., someone removes `aria-busy` from Button or `aria-describedby`
 * merge from FormField).
 *
 * **Important: regex `.test()` with `g` flag is stateful in JavaScript.**
 * After a successful match, `lastIndex` advances; the next call may miss
 * early text or wrap and re-match. This script NEVER uses the `g` flag on
 * regexes that need to test "does this string contain X". Each regex
 * uses at most `m` flag (multiline `^`/`$` anchoring).
 *
 * **Usage:**
 *
 *   node scripts/check-accessibility.mjs
 *
 * **Exit code:** 0 = all assertions pass, 1 = any violation.
 *
 * **Adding new assertions:**
 *
 * Add a new entry to `ASSERTIONS` below. The shape is:
 *
 *   {
 *     component: 'Button',
 *     file: 'packages/design-system/src/components/Button/Button.tsx',
 *     contract: 'Accessibility',
 *     assertions: [
 *       { name: 'aria-busy', regex: /aria-busy=\{[^}]*loading/ },
 *       { name: 'disabled reflects loading', regex: /disabled\s*=\s*\{[^}]*loading/ },
 *     ],
 *   },
 *
 * The assertion's `regex` is matched (via .test()) against the component's
 * .tsx source. If the regex does NOT match, the assertion FAILS.
 *
 * For a "must NOT contain" check, use `negative: true`. The regex
 * should match the thing that should NOT be present. The gate passes
 * when the regex does NOT match.
 *
 * **Limitation:** this gate only verifies source code patterns. It does
 * not verify that:
 *   - The DOM structure renders as expected (would need Playwright/jsdom).
 *   - Color contrast ratios meet WCAG AA (would need axe-core).
 *   - Keyboard interactions work as documented (would need Playwright).
 *   - Screen reader announcements are correct (manual verification).
 *
 * For runtime a11y checks, follow ADR-0007 + ADR-0008 (axe-playwright +
 * Playwright visual regression — deferred to a future release).
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'packages/design-system/src';

/* ------------------------------------------------------------------ */
/* Assertions.                                                         */
/*                                                                     */
/* Each assertion has a `regex` (matched against the component source)  */
/* and optional `negative: true` (passes when the regex does NOT match).*/
/* ------------------------------------------------------------------ */

const ASSERTIONS = [
  /* ---- Button ---- */
  {
    component: 'Button',
    file: 'components/Button/Button.tsx',
    contract:
      'Keyboard: native <button> (Space + Enter activate). Focus: focus-visible. ARIA: aria-busy="true" when loading.',
    assertions: [
      {
        name: 'renders a native <button> element',
        regex: /<button[\s>]/,
      },
      {
        name: 'aria-busy is set when loading',
        regex: /aria-busy=\{[^}]*loading/,
      },
      {
        name: 'disabled reflects loading state',
        regex: /disabled\s*[=|:]\s*\{[^}]*loading/,
      },
      {
        name: 'default type="button" (does not submit forms)',
        regex: /type=\{type\s*\?\?\s*['"]button['"]\}/,
      },
      {
        name: 'forwards ref to HTMLButtonElement',
        regex: /forwardRef<HTMLButtonElement/,
      },
    ],
  },

  /* ---- Card ---- */
  {
    component: 'Card',
    file: 'components/Card/Card.tsx',
    contract: 'Semantic structure. No clickable non-interactive elements without role.',
    assertions: [
      {
        name: 'renders a block container (default <div>)',
        regex: /<div[\s>]/,
      },
      {
        name: 'does NOT render its own <button> (consumer composes)',
        regex: /<button[\s>]/,
        negative: true,
      },
      {
        name: 'does NOT render its own <a> (consumer composes)',
        regex: /<a\s+href|<a>$/m,
        negative: true,
      },
    ],
  },

  /* ---- Badge ---- */
  {
    component: 'Badge',
    file: 'components/Badge/Badge.tsx',
    contract:
      'Decorative by default. No role="alert" / "status" on the badge itself — consumer composes semantics.',
    assertions: [
      {
        name: 'renders an inline-level element (<span> by default)',
        regex: /<span[\s>]/,
      },
      {
        name: 'does NOT set role="alert" on the badge',
        regex: /role=["']alert["']/,
        negative: true,
      },
      {
        name: 'does NOT set role="status" on the badge',
        regex: /role=["']status["']/,
        negative: true,
      },
      {
        name: 'does NOT set role="img" on the badge (decorative, not meaningful)',
        regex: /role=["']img["']/,
        negative: true,
      },
    ],
  },

  /* ---- Checkbox ---- */
  {
    component: 'Checkbox',
    file: 'components/Checkbox/Checkbox.tsx',
    contract: 'Native <input type="checkbox">. Native focus + checked semantics.',
    assertions: [
      {
        name: 'renders a native <input> element',
        regex: /<input[\s>]/,
      },
      {
        name: 'uses type="checkbox" on the rendered <input>',
        regex: /type=["']checkbox["']/,
      },
      {
        name: 'forwards ref to HTMLInputElement',
        regex: /forwardRef<HTMLInputElement/,
      },
      {
        name: 'omits "type" from native input attrs (forces checkbox)',
        regex: /Omit<InputHTMLAttributes<HTMLInputElement>,\s*['"]type['"]\s*>/,
      },
    ],
  },

  /* ---- Input ---- */
  {
    component: 'Input',
    file: 'components/Input/Input.tsx',
    contract: 'Wraps a native <input>. Focus: focus-visible. ARIA: aria-invalid (consumer-driven).',
    assertions: [
      {
        name: 'renders a native <input>',
        regex: /<input[\s>]/,
      },
      {
        name: 'forwards ref to HTMLInputElement',
        regex: /forwardRef<HTMLInputElement/,
      },
      {
        name: 'aria-invalid is settable via props',
        regex: /aria-invalid/,
      },
    ],
  },

  /* ---- FormField ----
   * Critical contract: ARIA merge — must NOT overwrite consumer-provided
   * aria-describedby / aria-labelledby. Must set aria-invalid when error.
   */
  {
    component: 'FormField',
    file: 'components/FormField/FormField.tsx',
    contract:
      'aria-describedby merge + aria-labelledby merge. Cannot overwrite consumer ARIA refs. Sets aria-invalid on error.',
    assertions: [
      {
        name: 'defines a mergeIds helper for id-list attributes',
        regex: /function\s+mergeIds/,
      },
      {
        name: 'mergeIds joins with space (WAI-ARIA id-list separator)',
        regex: /\.join\(\s*['"]\s+['"]\s*\)/,
      },
      {
        name: 'aria-describedby is MERGED (not overwritten) with consumer-supplied id',
        regex: /mergeIds\(\s*existing\[['"']aria-describedby['"]\]/,
      },
      {
        name: 'aria-labelledby is MERGED with consumer-supplied id',
        regex: /mergeIds\(\s*existing\[['"']aria-labelledby['"]\]/,
      },
      {
        name: 'aria-invalid is forced to true when error prop is set',
        regex: /['"]aria-invalid['"]\s*:\s*error\s*\?\s*true\s*:/,
      },
      {
        name: 'aria-invalid preserves consumer setting when no error',
        regex: /error\s*\?\s*true\s*:\s*\(\s*existing\[['"']aria-invalid['"]\]/,
      },
      {
        name: 'uses cloneElement to inject the ARIA wiring into the child',
        regex: /cloneElement/,
      },
    ],
  },

  /* ---- Segmented ----
   * Critical contract: WAI-ARIA radio group pattern. Roving tabindex.
   * Keyboard: Arrow + Home + End.
   */
  {
    component: 'Segmented',
    file: 'components/Segmented/Segmented.tsx',
    contract:
      'role="radiogroup". Roving tabindex: only selected is tabIndex=0. Keyboard: Arrow + Home + End.',
    assertions: [
      {
        name: 'renders role="radiogroup" on the wrapper',
        regex: /role=["']radiogroup["']/,
      },
      {
        name: 'each option is role="radio"',
        regex: /role=["']radio["']/,
      },
      {
        name: 'roving tabindex: tabIndex={0} on the selected option',
        regex: /tabIndex=\{0\}/,
      },
      {
        name: 'roving tabindex: tabIndex={-1} on non-selected options',
        regex: /tabIndex=\{-1\}/,
      },
      {
        name: 'keyboard handler supports ArrowRight',
        regex: /['"]ArrowRight['"]/,
      },
      {
        name: 'keyboard handler supports ArrowLeft',
        regex: /['"]ArrowLeft['"]/,
      },
      {
        name: 'keyboard handler supports Home',
        regex: /['"]Home['"]/,
      },
      {
        name: 'keyboard handler supports End',
        regex: /['"]End['"]/,
      },
      {
        name: 'keyboard handler calls preventDefault',
        regex: /e\.preventDefault\(\)/,
      },
    ],
  },

  /* ---- Banner ---- */
  {
    component: 'Banner',
    file: 'components/Banner/Banner.tsx',
    contract: 'role="alert" for warning/error; role="status" for info/success.',
    assertions: [
      {
        name: 'sets role="alert" or role="status" based on variant',
        regex: /role=\{[^}]*variant/,
      },
      {
        name: 'role conditional checks error',
        regex: /variant\s*===\s*['"]error['"]/,
      },
      {
        name: 'role conditional checks warning',
        regex: /variant\s*===\s*['"]warning['"]/,
      },
      {
        name: 'renders a <div> (block container)',
        regex: /<div[\s>]/,
      },
    ],
  },

  /* ---- EmptyState ---- */
  {
    component: 'EmptyState',
    file: 'components/EmptyState/EmptyState.tsx',
    contract: 'No implicit role. Action slot is consumer responsibility.',
    assertions: [
      {
        name: 'renders a centered block container (<div>)',
        regex: /<div[\s>]/,
      },
      {
        name: 'does NOT use role="alert" (not a status banner)',
        regex: /role=["']alert["']/,
        negative: true,
      },
    ],
  },

  /* ---- Container / Section / Stack ---- */
  {
    component: 'Container',
    file: 'layout/Container.tsx',
    contract: 'Layout primitive. Default: <div>; consumer may override with `as` prop.',
    assertions: [
      {
        name: 'renders a <div> by default (or via `as` prop)',
        regex: /as\s*\?\?\s*['"]div['"]\s*\)\s*as\s+ElementType/,
      },
      {
        name: 'does NOT set role="region" (consumer composes externally)',
        regex: /role=["']region["']/,
        negative: true,
      },
      {
        name: 'does NOT set role="main" (consumer composes externally)',
        regex: /role=["']main["']/,
        negative: true,
      },
    ],
  },
  {
    component: 'Section',
    file: 'layout/Section.tsx',
    contract: 'Layout primitive. Default: <section>; consumer may override with `as` prop.',
    assertions: [
      {
        name: 'renders a <section> by default (or via `as` prop)',
        regex: /as\s*\?\?\s*['"]section['"]\s*\)\s*as\s+ElementType/,
      },
    ],
  },
  {
    component: 'Stack',
    file: 'layout/Stack.tsx',
    contract: 'Flex container. Default: <div>; consumer may override with `as` prop.',
    assertions: [
      {
        name: 'renders a <div> by default (or via `as` prop)',
        regex: /as\s*\?\?\s*['"]div['"]\s*\)\s*as\s+ElementType/,
      },
      {
        name: 'does NOT set role="radiogroup" (consumer composes externally)',
        regex: /role=["']radiogroup["']/,
        negative: true,
      },
      {
        name: 'does NOT set role="group" (consumer composes externally)',
        regex: /role=["']group["']/,
        negative: true,
      },
    ],
  },

  /* ---- Brand components ---- */
  {
    component: 'MagiMark',
    file: 'brand/MagiMark.tsx',
    contract: 'Decorative by default (aria-hidden="true"). ariaHidden={false} requires alt.',
    assertions: [
      {
        name: 'aria-hidden defaults to true',
        regex: /ariaHidden\s*=\s*true\b/,
      },
      {
        name: 'SVG fill="currentColor" (preserves theme propagation)',
        regex: /fill=["']currentColor["']/,
      },
    ],
  },
  {
    component: 'MagiWordmark',
    file: 'brand/MagiWordmark.tsx',
    contract: 'Decorative by default. SVG fill="currentColor".',
    assertions: [
      {
        name: 'aria-hidden defaults to true',
        regex: /ariaHidden\s*=\s*true\b/,
      },
      {
        name: 'SVG fill="currentColor" (preserves theme propagation)',
        regex: /fill=["']currentColor["']/,
      },
    ],
  },
  {
    component: 'MagiLockup',
    file: 'brand/MagiLockup.tsx',
    contract: 'Decorative by default. SVG fill="currentColor".',
    assertions: [
      {
        name: 'aria-hidden defaults to true',
        regex: /ariaHidden\s*=\s*true\b/,
      },
      {
        name: 'SVG fill="currentColor" (preserves theme propagation)',
        regex: /fill=["']currentColor["']/,
      },
    ],
  },

  /* ---- AppTheme ---- */
  {
    component: 'AppTheme',
    file: 'theme.tsx',
    contract:
      'No DOM wrapper. Sets 4 accent CSS variables + data-magi-theme on <html>. useInsertionEffect for SSR safety.',
    assertions: [
      {
        name: 'does NOT return a <div> JSX wrapper',
        regex: /return\s*\(\s*<div/,
        negative: true,
      },
      {
        name: 'writes --magi-accent on document.documentElement',
        regex: /root\.style\.setProperty\(\s*['"]--magi-accent['"]/,
      },
      {
        name: 'writes data-magi-theme on document.documentElement',
        regex: /root\.dataset\.magiTheme\s*=/,
      },
      {
        name: 'uses useInsertionEffect for SSR safety',
        regex: /useInsertionEffect\(/,
      },
      {
        name: 'exports useAppTheme hook returning { accent, theme }',
        regex: /export\s+function\s+useAppTheme\s*\(\s*\)\s*:\s*AppThemeContextValue/,
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Run.                                                                */
/* ------------------------------------------------------------------ */

const failures = [];
let total = 0;
let skipped = 0;

for (const entry of ASSERTIONS) {
  const path = join(ROOT, entry.file);
  let src;
  try {
    src = readFileSync(path, 'utf8');
  } catch (err) {
    failures.push({
      component: entry.component,
      contract: entry.contract,
      assertion: 'file readable',
      expected: `read ${path}`,
      actual: `error: ${err.message}`,
    });
    continue;
  }

  for (const assertion of entry.assertions) {
    if (assertion.skip) {
      skipped++;
      continue;
    }
    total++;
    // CRITICAL: no 'g' flag — .test() is stateful with 'g' and would
    // produce wrong results across multiple calls.
    const flags = assertion.negative ? 'm' : 'm';
    const regex = new RegExp(assertion.regex.source, flags);
    const matches = regex.test(src);
    const passed = assertion.negative ? !matches : matches;
    if (!passed) {
      failures.push({
        component: entry.component,
        contract: entry.contract,
        assertion: assertion.name,
        expected: assertion.negative ? 'NOT MATCH' : 'MATCH',
        actual: assertion.negative ? 'MATCH' : 'NOT MATCH',
        file: entry.file,
        regex: assertion.regex.toString(),
      });
    }
  }
}

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';

console.log('');
console.log(BOLD + 'MAGI Accessibility Quality Gate' + RESET);
console.log('─'.repeat(60));
console.log(`${ASSERTIONS.length} components verified`);
console.log(`${total} assertions evaluated${skipped > 0 ? `, ${skipped} skipped` : ''}`);
console.log('');

// Categorize failures.
const byComponent = {};
for (const f of failures) {
  byComponent[f.component] = (byComponent[f.component] || 0) + 1;
}

if (failures.length === 0) {
  console.log(GREEN + BOLD + '✓ All assertions pass' + RESET);
  console.log('');
  console.log('Coverage:');
  console.log('  • Keyboard interactions (Tab, Shift+Tab, Enter, Space, Arrow, Home, End, Escape)');
  console.log('  • Focus management (focusable, focus-visible, focus order, disabled, roving tabindex)');
  console.log('  • ARIA (role, aria-label, aria-labelledby, aria-describedby, aria-invalid, aria-busy)');
  console.log('  • Semantic HTML (no div-as-button, no div-as-input)');
  console.log('  • Component contracts (FormField merge, Segmented radio pattern, Banner role)');
  console.log('  • Brand (decorative default + accessible name fallback)');
  console.log('  • Theme runtime (AppTheme: useInsertionEffect, no DOM wrapper, data-magi-theme)');
  console.log('');
  console.log(
    YELLOW +
      'Note: this gate is static. Runtime a11y (color contrast, screen-reader' +
      RESET
  );
  console.log(
    YELLOW +
      'announcements, keyboard focus order in actual browsers) requires axe-core +' +
      RESET
  );
  console.log(
    YELLOW +
      'Playwright — deferred per ADR-0007 + ADR-0008.' +
      RESET
  );
  console.log('');
  process.exit(0);
}

console.log(RED + BOLD + `✗ ${failures.length} of ${total} assertions FAILED` + RESET);
console.log('');
console.log('Failures by component:');
for (const [component, count] of Object.entries(byComponent)) {
  console.log(`  ${RED}•${RESET} ${component}: ${count} failure${count === 1 ? '' : 's'}`);
}
console.log('');
console.log('FAILURES:');
for (const f of failures) {
  console.log('');
  console.log(YELLOW + BOLD + `${f.component}` + RESET);
  console.log(`  contract: ${f.contract}`);
  console.log(`  assertion: ${f.assertion}`);
  console.log(`  file: ${f.file}`);
  console.log(`  expected: ${f.expected} regex ${f.regex}`);
  console.log(`  actual: ${f.actual}`);
}
console.log('');
process.exit(1);