import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/classnames';

export type BadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'error';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Color/meaning. Default: `neutral`. */
  variant?: BadgeVariant;
  /** Show a leading colored dot. */
  dot?: boolean;
  children?: ReactNode;
}

/**
 * Badge — compact status / metadata label.
 *
 * @example
 *   <Badge variant="accent">128K context</Badge>
 *   <Badge variant="success" dot>Online</Badge>
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = 'neutral', dot = false, className, children, ...rest },
  ref,
) {
  const cls = cx(
    'magi-badge',
    `magi-badge--${variant}`,
    className,
  );
  return (
    <span ref={ref} className={cls} {...rest}>
      {dot ? <span className="magi-badge__dot" aria-hidden="true" /> : null}
      {children}
    </span>
  );
});
