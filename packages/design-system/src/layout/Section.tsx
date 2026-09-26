import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/classnames';

export type SectionSpacing = 'sm' | 'md' | 'lg' | 'xl';
export type SectionSurface = 'default' | 'raised' | 'elevated';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Vertical padding scale. Default: `lg`. */
  spacing?: SectionSpacing;
  /** Background surface. Default: `default` (transparent). */
  surface?: SectionSurface;
  /** Drop the inner Container padding. Useful for full-bleed content. */
  fullWidth?: boolean;
  /** Override the rendered tag. Default: `section`. */
  as?: ElementType;
  children?: ReactNode;
}

/**
 * Section — page-level vertical rhythm primitive.
 *
 * @example
 *   <Section spacing="xl" surface="default">...</Section>
 */
export function Section({
  spacing = 'lg',
  surface = 'default',
  fullWidth = false,
  as,
  className,
  children,
  ...rest
}: SectionProps) {
  const Component = (as ?? 'section') as ElementType;
  const cls = cx(
    'magi-section',
    `magi-section--${spacing}`,
    `magi-section--${surface}`,
    fullWidth && 'magi-section--fullWidth',
    className,
  );
  return (
    <Component className={cls} {...rest}>
      {children}
    </Component>
  );
}
