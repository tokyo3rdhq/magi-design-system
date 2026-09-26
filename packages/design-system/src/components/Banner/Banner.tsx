import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/classnames';

export type BannerVariant = 'warning' | 'error' | 'success' | 'info';

export interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  /** Semantic variant. Default: `warning`. */
  variant?: BannerVariant;
  /** Banner content. Inline elements (links, code) are allowed. */
  children: ReactNode;
}

/**
 * Banner — inline notice with a left-border accent.
 *
 * Use for hints, warnings, errors, and confirmations. Persists until the
 * condition resolves; no dismiss by default.
 *
 * - `warning` (default) — yellow accent, actionable risk
 * - `error` — red accent, blocker
 * - `success` — green accent, confirmation
 * - `info` — cyan accent, neutral hint (uses product accent)
 *
 * @example
 *   <Banner variant="info">No requirements set. <a href="/">Go back</a>.</Banner>
 *   <Banner variant="error">Could not load KV catalog: {error.message}.</Banner>
 *   <Banner variant="success">Saved.</Banner>
 */
export function Banner({
  variant = 'warning',
  className,
  children,
  ...rest
}: BannerProps) {
  return (
    <div
      role={variant === 'error' || variant === 'warning' ? 'alert' : 'status'}
      className={cx(
        'magi-banner',
        `magi-banner--${variant}`,
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}