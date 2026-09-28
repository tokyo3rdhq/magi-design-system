import type { SVGProps } from 'react';
import { cx } from '../utils/classnames';
import lockupSvg from '../assets/logo/magi-lockup.svg?raw';
import './brand.css';

export type MagiSize = 'sm' | 'md' | 'lg';

interface MagiLockupProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  /** Semantic size. Default 'md'. */
  size?: MagiSize;
  /**
   * Decorative by default (true). Set false when the lockup is the only
   * brand identifier on the page. The consumer should also set
   * `alt="MAGI"` in that case.
   */
  ariaHidden?: boolean;
  /** Accessible alt text. Required when ariaHidden is false. */
  alt?: string;
  /** Additional className for positioning. */
  className?: string;
}

/**
 * MagiLockup — the standard MAGI presentation: mark + wordmark composite.
 *
 * Default logo placement. Use this for navbar brand, OG image primary,
 * README hero, etc.
 *
 * Renders an inline `<svg>` with the canonical SVG source injected via
 * `dangerouslySetInnerHTML`. The SVG file is the single source of truth;
 * the React component never re-defines the geometry.
 *
 * Using `?raw` import keeps the SVG in the DOM tree so `fill="currentColor"`
 * propagates correctly across all browsers.
 *
 * Stable across product accent changes (uses `currentColor`,
 * not `var(--magi-accent)`).
 *
 * @example
 *   <a href="/" aria-label="MAGI — home">
 *     <MagiLockup ariaHidden={false} alt="MAGI — home" />
 *   </a>
 *
 *   // Decorative next to visible text:
 *   <span>Welcome to <MagiLockup />, the independent AI lab.</span>
 */
export function MagiLockup({
  size = 'md',
  ariaHidden = true,
  alt = 'MAGI',
  className,
  ...rest
}: MagiLockupProps) {
  return (
    <svg
      className={cx('magi-lockup', `magi-lockup--${size}`, className)}
      viewBox="0 0 280 64"
      fill="currentColor"
      aria-hidden={ariaHidden || undefined}
      role={ariaHidden ? 'img' : 'img'}
      aria-label={ariaHidden ? '' : alt}
      dangerouslySetInnerHTML={{ __html: lockupSvg }}
      {...rest}
    />
  );
}