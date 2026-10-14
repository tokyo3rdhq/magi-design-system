import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cx } from '../../utils/classnames';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ResponsiveRecord<T> = Partial<Record<'sm' | 'md' | 'lg' | 'xl' | '2xl', T>>;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. Default: `primary`. */
  variant?: ButtonVariant;
  /** Height + padding tier. Default: `md`. */
  size?: ButtonSize;
  /** Show a spinner and disable interaction. */
  loading?: boolean;
  /** Responsive overrides for size/variant. Map breakpoint → class name. */
  responsive?: ResponsiveRecord<ButtonSize | ButtonVariant>;
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
 *   <Button size="md" responsive={{ md: "lg" }}>Save</Button>
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
      responsive,
      ...rest
    },
    ref,
  ) {
    const baseClasses = cx(
      'magi-button',
      `magi-button--${variant}`,
      `magi-button--${size}`,
      loading && 'magi-button--loading',
    );

    // Map responsive overrides to Tailwind‑style breakpoint prefix classes.
    const responsiveClasses = responsive
      ? Object.entries(responsive)
          .map(([bp, val]) => `${bp}:magi-button--${val}`)
          .join(' ')
      : '';

    const finalClassName = cx(baseClasses, responsiveClasses, className);

    return (
      <button
        ref={ref}
        className={finalClassName}
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