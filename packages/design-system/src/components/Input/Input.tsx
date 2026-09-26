import { forwardRef, type InputHTMLAttributes } from 'react';
import { cx } from '../../utils/classnames';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Visual size. Default: `md`. */
  inputSize?: InputSize;
  /** Error state — adds error border + aria-invalid. */
  invalid?: boolean;
}

/**
 * Input — `<input>` styled for the MAGI dark theme.
 *
 * Wraps the native element directly. No custom state management — value /
 * onChange / defaultValue / ref all pass through.
 *
 * @example
 *   <Input placeholder="e.g. Coding assistant" />
 *   <Input type="password" />
 *   <Input invalid defaultValue="bad value" />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { inputSize = 'md', invalid = false, className, ...rest },
  ref,
) {
  const cls = cx(
    'magi-input',
    `magi-input--${inputSize}`,
    invalid && 'magi-input--invalid',
    className,
  );

  return (
    <input
      ref={ref}
      className={cls}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
});