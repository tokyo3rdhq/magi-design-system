import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/classnames';

export type CardVariant = 'default' | 'elevated' | 'interactive';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual emphasis. Default: `default`. `interactive` adds hover state. */
  variant?: CardVariant;
  /** Inner padding. Default: `md`. */
  padding?: CardPadding;
  children?: ReactNode;
}

/**
 * Card — minimal dark surface with subtle border. Three variants:
 * default (flat), elevated (more contrast), interactive (hover state).
 *
 * @example
 *   <Card variant="elevated">...</Card>
 *   <Card variant="interactive" onClick={...}>...</Card>
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'default', padding = 'md', className, children, ...rest },
  ref,
) {
  const cls = cx(
    'magi-card',
    `magi-card--${variant}`,
    `magi-card--padding-${padding}`,
    className,
  );
  return (
    <div ref={ref} className={cls} {...rest}>
      {children}
    </div>
  );
});
