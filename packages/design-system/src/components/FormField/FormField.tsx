import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/classnames';

type ChildProps = {
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'grammar' | 'spelling' | 'false' | 'true';
  'aria-labelledby'?: string;
};

export interface FormFieldProps {
  /** Visible label above the control. Required. */
  label: string;
  /** Optional helper text below the control. */
  helper?: string;
  /** Error message — overrides helper styling + sets aria-invalid + aria-describedby. */
  error?: string;
  /** The control itself (Input, Select, Segmented, etc.). */
  children: ReactNode;
  /** Stack alignment override. Default: stretch. */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Extra className for the wrapper. */
  className?: string;
  /** Optional id for the helper/error element (overrides the auto-generated one). */
  helperId?: string;
}

/**
 * Merge ARIA id-list attributes (space-separated per WAI-ARIA spec).
 * Empty / null / undefined entries are dropped.
 */
function mergeIds(
  ...ids: Array<string | undefined | null>
): string | undefined {
  const filtered = ids.filter(
    (id): id is string => typeof id === 'string' && id.length > 0,
  );
  return filtered.length > 0 ? filtered.join(' ') : undefined;
}

/**
 * FormField — label + control + optional helper/error wrapper.
 *
 * Wires `aria-describedby` to the helper/error span and `aria-labelledby`
 * to the label, by cloning the single child element with the appropriate
 * ARIA attributes. Sets `aria-invalid="true"` on the child when `error` is
 * present.
 *
 * **Consumer-supplied ARIA attributes are preserved (merged, not overwritten).**
 * For example, if the consumer passes `aria-describedby="external-help"`,
 * the resulting attribute is `"external-help <generated-helper-id>"`.
 * This matches the WAI-ARIA spec for multi-value id lists.
 *
 * The child MUST be a single focusable element (Input, Select, native
 * `<input>`, Segmented, etc.). If `children` is not a valid React element,
 * the ARIA wiring is skipped — the label and helper/error still render.
 *
 * @example
 *   <FormField label="Email" helper="We'll never share this.">
 *     <Input type="email" placeholder="you@example.com" />
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
  const fieldId = `magi-field-${reactId}`;
  const labelId = `${fieldId}-label`;
  const describedById = helperId ?? `${fieldId}-helper`;
  const hasMessage = Boolean(error || helper);

  let enhanced: ReactNode = children;
  if (isValidElement<ChildProps>(children)) {
    const existing = children.props;
    enhanced = cloneElement(children, {
      id: existing.id ?? fieldId,
      // MERGE with consumer-supplied IDs. The order is: consumer's first,
      // then FormField's. This matches ARIA's "consumer-supplied IDs win
      // for ordering" intuition — FormField's helpers are appended.
      'aria-describedby': mergeIds(
        existing['aria-describedby'],
        hasMessage ? describedById : undefined,
      ),
      'aria-labelledby': mergeIds(
        existing['aria-labelledby'],
        labelId,
      ),
      // aria-invalid: when FormField has an error, force true (overriding
      // consumer). When no error, preserve consumer's setting.
      'aria-invalid': error ? true : (existing['aria-invalid'] ?? undefined),
    });
  }

  return (
    <div
      className={cx(
        'magi-field',
        `magi-field--align-${align}`,
        className,
      )}
    >
      <label id={labelId} className="magi-field-label">
        {label}
      </label>
      {enhanced}
      {hasMessage && (
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