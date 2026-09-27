import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';

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

interface ProductThemeContextValue {
  accent: ProductAccent;
}

const ProductThemeContext = createContext<ProductThemeContextValue | null>(null);

/**
 * Hook for any JS-aware consumer that needs the current accent.
 * Returns `{ accent: 'green' }` (the default) when used outside a `<ProductTheme>`.
 */
export function useProductTheme(): ProductThemeContextValue {
  const ctx = useContext(ProductThemeContext);
  return ctx ?? { accent: 'green' };
}

export interface ProductThemeProps {
  /** Accent preset. Default: `green`. */
  accent?: ProductAccent;
  /** Optional product identifier. Sets `data-magi-product="<name>"` on `<html>`. */
  name?: string;
  children?: ReactNode;
}

/**
 * ProductTheme — overrides the MAGI accent for a subtree.
 *
 * Renders only a React context provider (no DOM wrapper). On mount, sets
 * the four accent CSS variables on `<html>` so all descendants inherit via
 * CSS cascade. For scoped overrides within a subtree, consumers can use:
 *
 *   <div data-magi-accent="danger">
 *     <Button variant="primary">Delete</Button>
 *   </div>
 *
 * The shorthand `data-magi-accent="<name>"` maps to the matching accent
 * preset (green / cyan / violet / amber / white) or semantic variant
 * (danger / warning / success) — see foundation/globals.css.
 *
 * Note: the initial render uses the default accent (green). The accent
 * variables are applied on the next effect tick. There is no FOUC if the
 * default matches the consumer's `<ProductTheme accent>`. On accent
 * transitions the variables are overwritten directly (no temporary unset
 * to default), so there is no accent flash on change.
 *
 * @example
 *   function App() {
 *     return (
 *       <ProductTheme accent="cyan" name="token-factory">
 *         <Routes />
 *       </ProductTheme>
 *     );
 *   }
 */
export function ProductTheme({
  accent = 'green',
  name,
  children,
}: ProductThemeProps) {
  const value = useMemo(() => ({ accent }), [accent]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const tokens = ACCENT_PRESETS[accent];
    const root = document.documentElement;

    root.style.setProperty('--magi-accent', tokens['--magi-accent']);
    root.style.setProperty('--magi-accent-hover', tokens['--magi-accent-hover']);
    root.style.setProperty('--magi-accent-soft', tokens['--magi-accent-soft']);
    root.style.setProperty('--magi-accent-contrast', tokens['--magi-accent-contrast']);

    if (name) {
      root.dataset.magiProduct = name;
    } else {
      delete root.dataset.magiProduct;
    }
  }, [accent, name]);

  return (
    <ProductThemeContext.Provider value={value}>
      {children}
    </ProductThemeContext.Provider>
  );
}