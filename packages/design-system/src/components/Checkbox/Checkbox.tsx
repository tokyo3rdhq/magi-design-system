import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/classnames';

export type CheckboxLabelPosition = 'right' | 'left';

/**
 * Omit `type` from native input attrs — this component is always
 * `type="checkbox"` under the hood. Letting `type` pass through would
 * let consumers render e.g. `type="radio"` with checkbox styles.
 */
export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Optional label rendered next to the checkbox. */
  children?: ReactNode;
  /** Position of the label relative to the checkbox. Default: 'right'. */
  labelPosition?: CheckboxLabelPosition;
}

/**
 * Checkbox — restyled native checkbox for the MAGI dark theme.
 *
 * Uses a native `<input type="checkbox">` under the hood for full form
 * integration and screen-reader compatibility. The CSS only restyles
 * the visible state.
 *
 * @example
 *   // Uncontrolled:
 *   <Checkbox aria-label="Accept terms" defaultChecked />
 *
 *   // Controlled with label:
 *   <Checkbox
 *     checked={providers.includes('nvidia')}
 *     onChange={(e) => toggle('nvidia', e.target.checked)}
 *   >
 *     NVIDIA
 *   </Checkbox>
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      children,
      labelPosition = 'right',
      className,
      disabled,
      ...rest
    },
    ref,
  ) {
    const input = (
      <input
        ref={ref}
        type="checkbox"
        className={cx('magi-checkbox', className)}
        disabled={disabled}
        {...rest}
      />
    );

    if (children === undefined || children === null) {
      return input;
    }

    return (
      <label
        className={cx(
          'magi-checkbox-label',
          disabled && 'magi-checkbox-label--disabled',
        )}
      >
        {labelPosition === 'left' ? (
          <>
            <span>{children}</span>
            {input}
          </>
        ) : (
          <>
            {input}
            <span>{children}</span>
          </>
        )}
      </label>
    );
  },
);