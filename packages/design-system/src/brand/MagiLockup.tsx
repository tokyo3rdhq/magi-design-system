import type { SVGProps } from 'react';
import { cx } from '../utils/classnames';
import lockupSvg from '../assets/logo/magi-lockup.svg?raw';
import lockupVerticalSvg from '../assets/logo/magi-lockup-vertical.svg?raw';
import './brand.css';

export type MagiSize = 'sm' | 'md' | 'lg';

interface MagiLockupProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  size?: MagiSize;
  ariaHidden?: boolean;
  alt?: string;
  className?: string;
  vertical?: boolean;
}

export function MagiLockup({ size = 'md', ariaHidden = true, alt = 'MAGI', className, vertical, ...rest }: MagiLockupProps) {
  const svgContent = vertical ? lockupVerticalSvg : lockupSvg;
  return (
    <svg
      className={cx('magi-lockup', `magi-lockup--${size}`, className)}
      viewBox={vertical ? '0 0 180 160' : '0 0 400 128'}
      fill="currentColor"
      aria-hidden={ariaHidden || undefined}
      role={ariaHidden ? 'img' : 'img'}
      aria-label={ariaHidden ? '' : alt}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      {...rest}
    />
  );
}
