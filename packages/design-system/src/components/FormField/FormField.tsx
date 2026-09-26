import { useId, type ReactNode } from 'react';
import { cx } from '../../utils/classnames';

export interface FormFieldProps {
  /** Visible label above the control. Required. */
  label: string;
  /** Optional helper text below the control. */
  helper?: string;
  /** Error message — overrides helper styling + sets aria-describedby. */
  error?: string;
  /** The control itself (Input, Select, Segmented, etc.). */
  children: ReactNode;
  /** Stack alignment override. Default: stretch. */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Extra className for the wrapper. */
  className?: string;
  /** Optional id for the helper/error element (for aria-describedby). */
  helperId?: string;
}

/**
 * FormField — label + control + optional helper/error wrapper.
 *
 * Wires the helper or error element to the input via `aria-describedby`,
 * so screen readers announce them when the control receives focus.
 *
 * @example
 *   <FormField label="Email" helper="We'll never share this.">
 *     <Input type="email" />
 *   </FormField>
 *
 *   <FormField label="Max models" error="Pick a value between 1 and 10.">
 *     <Segmented value="3" options={...} onChange={...} />
 *   </FormField>
 */
export function FormField({
  label,
  helper,
  error,
  children,
  align = 'stretch',
  className,
  helperId,
}: FormFieldProps) {
  const reactId = useId();
  const describedById = helperId ?? `magi-field-${reactId}`;

  return (
    <div
      className={cx(
        'magi-field',
        `magi-field--align-${align}`,
        className,
      )}
    >
      <label className="magi-field-label">{label}</label>
      {/* children are passed through; consumers should pass an input with id
          matching describedById (or omit and accept the default). */}
      {children}
      {(error || helper) && (
        <span
          id={describedById}
          className={cx(
            'magi-field-helper',
            error && 'magi-field-helper--error',
          )}
        >
          {error || helper}
        </span>
      )}
    </div>
  );
}