/**
 * MAGI Design System — Accent presets
 *
 * Framework-agnostic source of truth for the five MAGI accent presets
 * (`green` / `cyan` / `violet` / `amber` / `white`) and their corresponding
 * CSS variables (`--magi-accent`, `--magi-accent-hover`, `--magi-accent-soft`,
 * `--magi-accent-contrast`).
 *
 * Layer: 2 — Design Tokens (framework-agnostic)
 *
 * Why this file exists:
 *
 *   The hex values for the five accent presets used to live inside
 *   `src/theme.tsx` (a React file). That is an inversion: tokens belong to
 *   the framework-agnostic layer, not the React runtime. A Vue theme
 *   implementation (or any vanilla-JS design-token consumer) should be able
 *   to import the same values without pulling in React.
 *
 *   This file is the single source of truth. `src/theme.tsx` imports
 *   `AppAccent` and `ACCENT_PRESETS` from here and uses them in the
 *   `<AppTheme>` runtime that writes CSS vars onto `<html>`. The CSS-side
 *   fallback rules in `src/foundation/globals.css`
 *   (`[data-magi-accent="<name>"] { … }`) MUST cross-validate against these
 *   values — enforced by `scripts/check-accent-tokens.mjs`.
 *
 * Editing rules:
 *
 *   - Changing a hex value here is a *minor* version change (visual change).
 *   - Adding a preset here without a matching `data-magi-accent="<name>"`
 *     rule in `globals.css` will fail CI.
 *   - Adding a preset here without a matching key in `AppAccent` will
 *     fail typecheck.
 *
 * Format contract (do NOT change without coordinating with the parser):
 *
 *   The `scripts/check-accent-tokens.mjs` parser captures:
 *
 *     <name>: {
 *       '--magi-accent': '<hex>',
 *       '--magi-accent-hover': '<hex>',
 *       …
 *     }
 *
 *   Keep the indentation, the quoted CSS variable keys, and the trailing
 *   commas exactly as below. Comments inside the block are tolerated.
 */

export type AppAccent =
  | 'green'   // default — MAGI core
  | 'cyan'    // Token Factory Initializr
  | 'violet'  // API product
  | 'amber'   // Agent product
  | 'white';  // monochrome MAGI

export interface AccentTokens {
  '--magi-accent': string;
  '--magi-accent-hover': string;
  '--magi-accent-soft': string;
  '--magi-accent-contrast': string;
}

export const ACCENT_PRESETS: Record<AppAccent, AccentTokens> = {
  green: {
    '--magi-accent': '#00c853',
    '--magi-accent-hover': '#00e676',
    '--magi-accent-soft': 'rgba(0, 200, 83, 0.08)',
    '--magi-accent-contrast': '#050505',
  },
  cyan: {
    '--magi-accent': '#38bdf8',
    '--magi-accent-hover': '#7dd3fc',
    '--magi-accent-soft': 'rgba(56, 189, 248, 0.08)',
    '--magi-accent-contrast': '#050505',
  },
  violet: {
    '--magi-accent': '#8b5cf6',
    '--magi-accent-hover': '#a78bfa',
    '--magi-accent-soft': 'rgba(139, 92, 246, 0.08)',
    '--magi-accent-contrast': '#f5f5f7',
  },
  amber: {
    '--magi-accent': '#f59e0b',
    '--magi-accent-hover': '#fbbf24',
    '--magi-accent-soft': 'rgba(245, 158, 11, 0.08)',
    '--magi-accent-contrast': '#050505',
  },
  white: {
    '--magi-accent': '#ffffff',
    '--magi-accent-hover': '#f5f5f7',
    '--magi-accent-soft': 'rgba(255, 255, 255, 0.08)',
    '--magi-accent-contrast': '#050505',
  },
};