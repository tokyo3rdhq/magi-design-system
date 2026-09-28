import type { SVGProps } from 'react';
import { cx } from '../utils/classnames';
import markUrl from '../assets/logo/magi-mark.svg';
import './brand.css';

export type MagiSize = 'sm' | 'md' | 'lg';

interface MagiMarkProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  /** Semantic size. Default 'md'. Pixel sizes are not the primary API. */
  size?: MagiSize;
  /**
   * Decorative by default (true). Set false when the icon is the only
   * brand identifier on the page (rare — e.g. inside an `<a>` whose
   * accessible name is "MAGI home"). The consumer should also set
   * `alt="MAGI"` in that case.
   */
  ariaHidden?: boolean;
  /**
   * Accessible alt text. Required when ariaHidden is false.
   * Ignored when ariaHidden is true (alt="" makes the img decorative).
   */
  alt?: string;
  /** Additional className for positioning. */
  className?: string;
}

/**
 * MagiMark — the MAGI mark glyph (three dots forming a triangle).
 *
 * Renders an inline `<svg>` using `<use>` to reference the canonical
 * SVG asset. This preserves `currentColor` propagation (unlike `<img>`).
 *
 * Stable across product accent changes (uses `currentColor`,
 * not `var(--magi-accent)`).
 *
 * @example
 *   // Decorative, next to visible "MAGI" text:
 *   <MagiMark />
 *
 *   // Meaningful, as the only brand identifier on the page:
 *   <a href="/" aria-label="MAGI — home">
 *     <MagiMark ariaHidden={false} alt="MAGI — home" />
 *   </a>
 */
export function MagiMark({
  size = 'md',
  ariaHidden = true,
  alt = 'MAGI',
  className,
  ...rest
}: MagiMarkProps) {
  return (
    <svg
      className={cx('magi-mark', `magi-mark--${size}`, className)}
      viewBox="0 0 64 64"
      fill="currentColor"
      aria-hidden={ariaHidden || undefined}
      role={ariaHidden ? 'img' : 'img'}
      aria-label={ariaHidden ? '' : alt}
      {...rest}
    >
      <use href={markUrl} />
    </svg>
  );
}