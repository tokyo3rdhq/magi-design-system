import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/classnames';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'wide' | 'full';

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  /** Maximum width at desktop. Default: `xl` (1200px). */
  size?: ContainerSize;
  /** Override the rendered tag. Default: `div`. */
  as?: ElementType;
  children?: ReactNode;
}

/**
 * Container — centers content and constrains max-width.
 *
 * @example
 *   <Container size="lg">...</Container>
 */
export function Container({
  size = 'xl',
  as,
  className,
  children,
  ...rest
}: ContainerProps) {
  const Component = (as ?? 'div') as ElementType;
  const cls = cx('magi-container', `magi-container--${size}`, className);
  return (
    <Component className={cls} {...rest}>
      {children}
    </Component>
  );
}
