import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/classnames';

export type StackGap =
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';

export interface StackProps extends HTMLAttributes<HTMLElement> {
  /** Layout direction. Default: vertical (column). */
  direction?: 'row' | 'column';
  /** Gap token. Default: `4` (16px). */
  gap?: StackGap;
  /** Cross-axis alignment. Default: `stretch`. */
  align?: StackAlign;
  /** Allow wrapping when `direction="row"`. Default: true. */
  wrap?: boolean;
  as?: ElementType;
  children?: ReactNode;
}

/**
 * Stack — vertical or horizontal flex primitive with semantic gap tokens.
 *
 * @example
 *   <Stack gap="6" align="center">...</Stack>
 *   <Stack direction="row" gap="3">...</Stack>
 */
export function Stack({
  direction = 'column',
  gap = '4',
  align = 'stretch',
  wrap = true,
  as,
  className,
  style,
  children,
  ...rest
}: StackProps) {
  const Component = (as ?? 'div') as ElementType;
  const wrapStyle =
    direction === 'row' && !wrap ? { flexWrap: 'nowrap' as const } : undefined;
  const cls = cx(
    'magi-stack',
    direction === 'row' && 'magi-stack--row',
    `magi-stack--gap-${gap}`,
    `magi-stack--align-${align}`,
    className,
  );

  return (
    <Component className={cls} style={{ ...wrapStyle, ...style }} {...rest}>
      {children}
    </Component>
  );
}
