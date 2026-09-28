import {
  createContext,
  useContext,
  useInsertionEffect,
  useMemo,
  type ReactNode,
} from 'react';

import {
  ACCENT_PRESETS,
  type AccentTokens,
  type AppAccent,
} from './tokens/accent-presets';

// Re-export the framework-neutral pieces so the public API surface
// (./index.ts → `export type { AppThemeProps, AppAccent } from './theme'`)
// is preserved exactly. A Vue or vanilla-JS consumer could import them
// directly from `./tokens/accent-presets` without pulling in React.
export type { AppAccent, AccentTokens };

interface AppThemeContextValue {
  accent: AppAccent;
}

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

/**
 * Hook for any JS-aware consumer that needs the current accent.
 * Returns `{ accent: 'green' }` (the default) when used outside an `<AppTheme>`.
 */
export function useAppTheme(): AppThemeContextValue {
  const ctx = useContext(AppThemeContext);
  return ctx ?? { accent: 'green' };
}

export interface AppThemeProps {
  /** Accent preset. Default: `green`. */
  accent?: AppAccent;
  /** Optional product identifier. Sets `data-magi-product="<name>"` on `<html>`. */
  name?: string;
  children?: ReactNode;
}

/**
 * AppTheme — application-level accent configuration.
 *
 * Renders only a React context provider (no DOM wrapper). On mount, sets
 * the four accent CSS variables on `<html>` so all descendants inherit via
 * CSS cascade. For scoped overrides within a subtree, consumers should use
 * `data-magi-accent`:
 *
 *   <div data-magi-accent="danger">
 *     <Button variant="primary">Delete</Button>
 *   </div>
 *
 * SSR: useInsertionEffect does not run on the server, so on SSR pages
 * the default theme applies during the initial render. For SSR theming
 * without FOUC, set `data-magi-accent="<name>"` on `<html>` in your
 * server-side layout — the CSS rule in globals.css picks it up.
 *
 * Nested <AppTheme>: each instance snapshots the previous accent values
 * on mount and restores them on unmount, so a child mounting and
 * unmounting leaves the outer theme intact. Note that CSS variables
 * are global (set on `<html>`), so siblings outside a child subtree
 * still see the child's accent — use `<div data-magi-accent="...">`
 * for true CSS subtree scope.
 *
 * @example
 *   function App() {
 *     return (
 *       <AppTheme accent="cyan" name="token-factory">
 *         <Routes />
 *       </AppTheme>
 *     );
 *   }
 */
export function AppTheme({
  accent = 'green',
  name,
  children,
}: AppThemeProps) {
  const value = useMemo(() => ({ accent }), [accent]);

  useInsertionEffect(() => {
    if (typeof document === 'undefined') return;
    const tokens = ACCENT_PRESETS[accent];
    const root = document.documentElement;

    // Snapshot previous values so the cleanup can restore them on unmount
    // or accent change. This makes nested themes work correctly: the inner
    // theme restores the outer theme's values when it unmounts.
    const prev = {
      accent: root.style.getPropertyValue('--magi-accent'),
      accentHover: root.style.getPropertyValue('--magi-accent-hover'),
      accentSoft: root.style.getPropertyValue('--magi-accent-soft'),
      accentContrast: root.style.getPropertyValue('--magi-accent-contrast'),
      product: root.dataset.magiProduct,
    };

    root.style.setProperty('--magi-accent', tokens['--magi-accent']);
    root.style.setProperty('--magi-accent-hover', tokens['--magi-accent-hover']);
    root.style.setProperty('--magi-accent-soft', tokens['--magi-accent-soft']);
    root.style.setProperty('--magi-accent-contrast', tokens['--magi-accent-contrast']);

    if (name) {
      root.dataset.magiProduct = name;
    } else {
      delete root.dataset.magiProduct;
    }

    return () => {
      const restoreOrRemove = (prop: string, prevValue: string) => {
        if (prevValue) root.style.setProperty(prop, prevValue);
        else root.style.removeProperty(prop);
      };
      restoreOrRemove('--magi-accent', prev.accent);
      restoreOrRemove('--magi-accent-hover', prev.accentHover);
      restoreOrRemove('--magi-accent-soft', prev.accentSoft);
      restoreOrRemove('--magi-accent-contrast', prev.accentContrast);

      if (prev.product !== undefined) {
        root.dataset.magiProduct = prev.product;
      } else if (root.dataset.magiProduct !== undefined) {
        delete root.dataset.magiProduct;
      }
    };
  }, [accent, name]);

  return (
    <AppThemeContext.Provider value={value}>
      {children}
    </AppThemeContext.Provider>
  );
}