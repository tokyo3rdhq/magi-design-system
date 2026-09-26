import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cx } from '../../utils/classnames';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. Default: `primary`. */
  variant?: ButtonVariant;
  /** Height + padding tier. Default: `md`. */
  size?: ButtonSize;
  /** Show a spinner and disable interaction. */
  loading?: boolean;
}

/**
 * Button — the canonical MAGI action element.
 *
 * Pill-shaped, four variants (primary/secondary/ghost/danger), three sizes.
 * Use `primary` for the dominant action on a page; `secondary` for supporting
 * actions; `ghost` for inline/tertiary; `danger` for destructive intent.
 *
 * @example
 *   <Button variant="primary" onClick={...}>Save</Button>
 *   <Button variant="secondary">Cancel</Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      className,
      children,
      type,
      ...rest
    },
    ref,
  ) {
    const cls = cx(
      'magi-button',
      `magi-button--${variant}`,
      `magi-button--${size}`,
      loading && 'magi-button--loading',
      className,
    );

    return (
      <button
        ref={ref}
        className={cls}
        type={type ?? 'button'}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
