import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/classnames';

export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface GridProps extends HTMLAttributes<HTMLElement> {
  /** Number of columns per breakpoint */
  cols: Partial<Record<Breakpoint, number>>;
  /** Gap size token (Tailwind gap number) */
  gap?: number | string;
  /** Override rendered element */
  as?: ElementType;
  children?: ReactNode;
}

/**
 * Grid — responsive CSS-grid helper using Tailwind breakpoints.
 *
 * @example
 *   <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap={4}>
 *     <div>Card 1</div>
 *     <div>Card 2</div>
 *   </Grid>
 */
export function Grid({ cols, gap = 4, as, className, children, ...rest }: GridProps) {
  const Component = (as ?? 'div') as ElementType;
  const classNames: string[] = ['grid'];

  // Apply responsive column classes
  Object.entries(cols).forEach(([bp, count]) => {
    if (count) {
      classNames.push(`${bp}:grid-cols-${count}`);
    }
  });

  // Apply gap utility
  classNames.push(`gap-${gap}` as string);

  return (
    <Component
      className={cx(...classNames, className)}
      {...rest}
    >
      {children}
    </Component>
  );
}
