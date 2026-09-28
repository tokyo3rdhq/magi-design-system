import type { SVGProps } from 'react';
import { cx } from '../utils/classnames';
import wordmarkSvg from '../assets/logo/magi-wordmark.svg?raw';
import './brand.css';

export type MagiSize = 'sm' | 'md' | 'lg';

interface MagiWordmarkProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  /** Semantic size. Default 'md'. */
  size?: MagiSize;
  /**
   * Decorative by default (true). Set false when the wordmark is the only
   * brand identifier on the page (rare).
   */
  ariaHidden?: boolean;
  /**
   * Accessible alt text. Required when ariaHidden is false.
   * Ignored when ariaHidden is true (aria-hidden + empty label makes it decorative).
   */
  alt?: string;
  /** Additional className for positioning. */
  className?: string;
}

/**
 * MagiWordmark — the MAGI wordmark glyph (text "MAGI" in Inter bold).
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
 *   <MagiWordmark size="lg" />
 */
export function MagiWordmark({
  size = 'md',
  ariaHidden = true,
  alt = 'MAGI',
  className,
  ...rest
}: MagiWordmarkProps) {
  return (
    <svg
      className={cx('magi-wordmark', `magi-wordmark--${size}`, className)}
      viewBox="0 0 200 56"
      fill="currentColor"
      aria-hidden={ariaHidden || undefined}
      role={ariaHidden ? 'img' : 'img'}
      aria-label={ariaHidden ? '' : alt}
      dangerouslySetInnerHTML={{ __html: wordmarkSvg }}
      {...rest}
    />
  );
}