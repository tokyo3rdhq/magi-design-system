/**
 * ProductTheme — allows a product to override the accent (and accent-muted
 * / accent-soft / accent-contrast) without touching typography, spacing, or
 * base surfaces. Implemented as CSS custom properties on a scoped selector;
 * components consume the variables and re-render automatically.
 *
 * Usage:
 *   <ProductTheme accent="cyan" name="token-factory">
 *     <App />
 *   </ProductTheme>
 *
 * Or set them manually in CSS:
 *   [data-magi-product='token-factory'] {
 *     --magi-accent: #38bdf8;
 *     --magi-accent-hover: #7dd3fc;
 *     --magi-accent-soft: rgba(56, 189, 248, 0.08);
 *   }
 */

import type { CSSProperties, ReactNode } from 'react';

export type ProductAccent =
  | 'green'   // default — MAGI core
  | 'cyan'    // Token Factory Initializr
  | 'violet'  // API product
  | 'amber'   // Agent product
  | 'white';  // monochrome MAGI

interface AccentTokens {
  '--magi-accent': string;
  '--magi-accent-hover': string;
  '--magi-accent-soft': string;
  '--magi-accent-contrast': string;
}

const ACCENT_PRESETS: Record<ProductAccent, AccentTokens> = {
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

export interface ProductThemeProps {
  /** Accent preset. Default: `green`. */
  accent?: ProductAccent;
  /** Optional product identifier. Sets `data-magi-product="<name>"`. */
  name?: string;
  /** Override individual token values; merged with the preset. */
  tokens?: Partial<CSSProperties>;
  children?: ReactNode;
}

/**
 * ProductTheme — overrides the MAGI accent for a subtree.
 *
 * Renders a `<div>` with `data-magi-product` and the accent tokens applied as
 * inline custom properties. All children consume the new accent automatically.
 */
export function ProductTheme({
  accent = 'green',
  name,
  tokens,
  children,
}: ProductThemeProps) {
  const preset = ACCENT_PRESETS[accent];
  const style: CSSProperties = { ...preset, ...tokens };

  return (
    <div data-magi-product={name} style={style}>
      {children}
    </div>
  );
}